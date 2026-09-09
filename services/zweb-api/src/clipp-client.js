import Firebird from 'node-firebird';
import { composeObservation } from './clipp-observation.js';

// Acesso ao banco do ClippStore (Firebird), onde o enderecamento da MVA fica
// na primeira linha da observacao do produto, porque o Clipp nao tem campo
// proprio para isso.
//
// A conexao e sempre pelo servidor, na 3050. O compartilhamento que expoe o
// arquivo .FDB existe, mas abrir um Firebird em uso por caminho de rede
// corrompe o banco.

// A observacao e BLOB, mas e lida como texto: o identificador de BLOB do
// node-firebird nao sobrevive ao fim da consulta. O limite de 8000 e seguro
// nos dois sentidos - a maior observacao da base tem 1.077 caracteres, e
// 8000 cabe em VARCHAR mesmo se o banco estiver em UTF-8.
const LIMITE_OBSERVACAO = 8000;

// DESC_CMPL e VARCHAR(30) e ja e o campo que a MVA usa como enderecamento:
// 6.750 produtos tem valores como "RUA 6 NIVEL 3 PRAT DIREITA" ali. Endereco
// que nao couber e recusado, nunca truncado, para nao gravar meio endereco.
const LIMITE_DESC_CMPL = 30;

// COD_BARRA e VARCHAR(18): cabe EAN-13 e DUN-14 com folga.
const LIMITE_COD_BARRA = 18;

const CONSULTA_PRODUTO = `
  SELECT e.ID_ESTOQUE, e.DESCRICAO, CAST(e.OBSERVACAO AS VARCHAR(8000)) AS OBSERVACAO,
         p.COD_BARRA, p.REFERENCIA, p.DESC_CMPL
  FROM TB_ESTOQUE e
  LEFT JOIN TB_EST_IDENTIFICADOR i ON i.ID_ESTOQUE = e.ID_ESTOQUE
  LEFT JOIN TB_EST_PRODUTO p ON p.ID_IDENTIFICADOR = i.ID_IDENTIFICADOR
  WHERE e.ID_ESTOQUE = ?
`;

function textoDaObservacao(campo) {
  if (campo == null) return '';
  return Buffer.isBuffer(campo) ? campo.toString('utf8') : String(campo);
}

export class ClippClient {
  constructor(options) {
    if (!options || !options.database || !options.user || !options.password) {
      throw new Error('MVA_FIREBIRD_DATABASE, MVA_FIREBIRD_USER e MVA_FIREBIRD_PASSWORD são obrigatórios.');
    }
    this.options = {
      host: options.host || '192.168.1.253',
      port: Number(options.port || 3050),
      database: options.database,
      user: options.user,
      password: options.password,
      lowercase_keys: false,
      pageSize: 4096,
      retryConnectionInterval: 1000
    };
  }

  #comConexao(trabalho) {
    return new Promise((resolve, reject) => {
      Firebird.attach(this.options, (error, db) => {
        if (error) return reject(error);
        trabalho(db).then(
          valor => { db.detach(); resolve(valor); },
          falha => { db.detach(); reject(falha); }
        );
      });
    });
  }

  // Tudo roda dentro de uma transacao explicita: o identificador de BLOB do
  // Firebird so vale enquanto a transacao que o produziu esta aberta, e a
  // escrita precisa ser atomica de qualquer forma.
  #comTransacao(trabalho) {
    return this.#comConexao(db => new Promise((resolve, reject) => {
      db.transaction(Firebird.ISOLATION_READ_COMMITTED, (error, transacao) => {
        if (error) return reject(error);
        trabalho(transacao).then(
          valor => transacao.commit(falha => (falha ? reject(falha) : resolve(valor))),
          falha => transacao.rollback(() => reject(falha))
        );
      });
    }));
  }

  #consultar(contexto, sql, parametros = []) {
    return new Promise((resolve, reject) => {
      contexto.query(sql, parametros, (error, resultado) => (error ? reject(error) : resolve(resultado || [])));
    });
  }

  async getProduct(productId) {
    return this.#comTransacao(async transacao => {
      const linhas = await this.#consultar(transacao, CONSULTA_PRODUTO, [Number(productId)]);
      if (!linhas.length) return null;
      const linha = linhas[0];
      return {
        productId: linha.ID_ESTOQUE,
        description: String(linha.DESCRICAO ?? '').trim(),
        barcode: linha.COD_BARRA ? String(linha.COD_BARRA).trim() : '',
        reference: linha.REFERENCIA ? String(linha.REFERENCIA).trim() : '',
        observation: textoDaObservacao(linha.OBSERVACAO),
        complementaryDescription: linha.DESC_CMPL ? String(linha.DESC_CMPL).trim() : ''
      };
    });
  }

  /// Grava o endereco na observacao, preservando o que o usuario escreveu e
  /// substituindo o bloco de endereco anterior em vez de empilhar outro.
  async writeLocation({ productId, location, previousLocation }) {
    return this.#comTransacao(async transacao => {
      const linhas = await this.#consultar(transacao, CONSULTA_PRODUTO, [Number(productId)]);
      if (!linhas.length) {
        throw Object.assign(new Error(`Produto ${productId} não existe no Clipp.`), { status: 404 });
      }
      const observacaoAtual = textoDaObservacao(linhas[0].OBSERVACAO);
      const observacaoNova = composeObservation({
        location,
        currentObservation: observacaoAtual,
        previousLocation
      });

      if (observacaoNova.length > LIMITE_OBSERVACAO) {
        throw Object.assign(
          new Error(`A observação do produto ${productId} passaria de ${LIMITE_OBSERVACAO} caracteres.`),
          { status: 422 }
        );
      }

      const enderecoCurto = String(location ?? '').trim();
      if (enderecoCurto.length > LIMITE_DESC_CMPL) {
        throw Object.assign(
          new Error(`O endereço "${enderecoCurto}" passa de ${LIMITE_DESC_CMPL} caracteres e não cabe na descrição complementar do Clipp.`),
          { status: 422 }
        );
      }

      // As duas gravacoes na mesma transacao: ou os dois campos ficam com o
      // endereco novo, ou nenhum muda.
      await this.#consultar(transacao, 'UPDATE TB_ESTOQUE SET OBSERVACAO = ? WHERE ID_ESTOQUE = ?', [
        observacaoNova,
        Number(productId)
      ]);
      await this.#consultar(
        transacao,
        `UPDATE TB_EST_PRODUTO SET DESC_CMPL = ?
         WHERE ID_IDENTIFICADOR IN (SELECT ID_IDENTIFICADOR FROM TB_EST_IDENTIFICADOR WHERE ID_ESTOQUE = ?)`,
        [enderecoCurto, Number(productId)]
      );

      return {
        productId: Number(productId),
        description: String(linhas[0].DESCRICAO ?? '').trim(),
        previousObservation: observacaoAtual,
        previousComplementaryDescription: String(linhas[0].DESC_CMPL ?? '').trim(),
        observation: observacaoNova,
        complementaryDescription: enderecoCurto
      };
    });
  }

  /// Grava o codigo de barras que o estoquista associou ao produto.
  async writeBarcode({ productId, barcode }) {
    const codigo = String(barcode ?? '').trim();
    if (!codigo) throw Object.assign(new Error('Codigo de barras obrigatorio.'), { status: 400 });
    if (codigo.length > LIMITE_COD_BARRA) {
      throw Object.assign(
        new Error(`O codigo ${codigo} passa de ${LIMITE_COD_BARRA} caracteres e nao cabe no campo do Clipp.`),
        { status: 422 }
      );
    }

    return this.#comTransacao(async transacao => {
      const linhas = await this.#consultar(transacao, CONSULTA_PRODUTO, [Number(productId)]);
      if (!linhas.length) {
        throw Object.assign(new Error(`Produto ${productId} nao existe no Clipp.`), { status: 404 });
      }
      const anterior = linhas[0].COD_BARRA ? String(linhas[0].COD_BARRA).trim() : '';
      await this.#consultar(
        transacao,
        `UPDATE TB_EST_PRODUTO SET COD_BARRA = ?
         WHERE ID_IDENTIFICADOR IN (SELECT ID_IDENTIFICADOR FROM TB_EST_IDENTIFICADOR WHERE ID_ESTOQUE = ?)`,
        [codigo, Number(productId)]
      );
      return { productId: Number(productId), previousBarcode: anterior, barcode: codigo };
    });
  }
}

// No Clipp o identificador do produto (ID_ESTOQUE) e o proprio codigo que
// aparece na tela, e nao o id interno do ZWeb, que so vale no catalogo daqui.
// Os dois cadastros compartilham o mesmo espaco de codigos.
export function toClippProductId(productCode) {
  const identificador = Number(String(productCode ?? '').trim());
  return Number.isSafeInteger(identificador) && identificador > 0 ? identificador : null;
}

export function createClippClientFromEnvironment(environment = process.env) {
  return new ClippClient({
    host: environment.MVA_FIREBIRD_HOST,
    port: environment.MVA_FIREBIRD_PORT,
    database: environment.MVA_FIREBIRD_DATABASE,
    user: environment.MVA_FIREBIRD_USER,
    password: environment.MVA_FIREBIRD_PASSWORD
  });
}
