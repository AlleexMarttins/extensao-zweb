import test from 'node:test';
import assert from 'node:assert/strict';

import {
  applyPendingBarcodeRequests,
  limparBloqueioDaFila,
  createZwebProductBarcodeAdapter,
  extractProduct,
  FormatoNaoConfirmadoError
} from '../src/zweb-barcode-writer.js';

function criarStore(pendentes) {
  const marcas = [];
  return {
    marcas,
    lidos: [],
    getPendingBarcodeRequests(limite) {
      this.lidos.push(limite);
      return pendentes.slice(0, limite);
    },
    markBarcodeRequest(requestId, sistema, dados) {
      marcas.push({ requestId, sistema, ...dados });
    }
  };
}

function pedido(requestId, productCode, barcode) {
  return { requestId, productId: 20600000 + requestId, productCode, barcode, previousBarcode: null };
}

const RELOGIO = () => new Date('2026-08-20T14:00:00.000Z');

test.beforeEach(() => limparBloqueioDaFila());

test('bloqueado sem homologacao: nao le a fila nem toca o ZWeb', async () => {
  const store = criarStore([pedido(1, '16821', '7899744088206')]);
  let chamadas = 0;
  const adapter = { async writeBarcode() { chamadas += 1; } };
  const eventos = [];

  const resumo = await applyPendingBarcodeRequests({
    store,
    adapter,
    permitido: () => false,
    registrar: evento => eventos.push(evento),
    agora: RELOGIO
  });

  assert.equal(resumo.bloqueado, true);
  assert.equal(chamadas, 0);
  assert.deepEqual(store.lidos, [], 'nem a consulta da fila acontece');
  assert.deepEqual(store.marcas, []);
  assert.equal(eventos.length, 1);
  assert.equal(eventos[0].em, '2026-08-20T14:00:00.000Z');
});

test('grava um por vez e marca cada pedido como aplicado', async () => {
  const store = criarStore([pedido(1, '16821', '7899744088206'), pedido(2, '9822', '7891234567890')]);
  const ordem = [];
  const adapter = {
    async writeBarcode({ productCode, barcode }) {
      ordem.push(`${productCode}:${barcode}`);
    }
  };

  const resumo = await applyPendingBarcodeRequests({ store, adapter, permitido: () => true, agora: RELOGIO });

  assert.deepEqual(ordem, ['16821:7899744088206', '9822:7891234567890']);
  assert.equal(resumo.aplicados, 2);
  assert.equal(resumo.falhas, 0);
  assert.equal(resumo.pendentes, 0);
  assert.deepEqual(store.marcas, [
    { requestId: 1, sistema: 'zweb', status: 'applied' },
    { requestId: 2, sistema: 'zweb', status: 'applied' }
  ]);
});

test('a primeira falha encerra a execucao e registra a proxima tentativa', async () => {
  const store = criarStore([pedido(1, '16821', '789'), pedido(2, '9822', '790'), pedido(3, '7000', '791')]);
  const tentados = [];
  const adapter = {
    async writeBarcode({ productCode }) {
      tentados.push(productCode);
      if (productCode === '9822') throw new Error('Zweb respondeu HTTP 429.');
    }
  };

  const resumo = await applyPendingBarcodeRequests({ store, adapter, permitido: () => true, agora: RELOGIO });

  assert.deepEqual(tentados, ['16821', '9822'], 'o terceiro nem chega a ser tentado');
  assert.equal(resumo.aplicados, 1);
  assert.equal(resumo.falhas, 1);
  assert.equal(resumo.motivo, 'Zweb respondeu HTTP 429.');
  // Uma hora depois, nunca em segundos.
  assert.equal(resumo.tentarEm, '2026-08-20T15:00:00.000Z');
  assert.deepEqual(store.marcas[1], {
    requestId: 2,
    sistema: 'zweb',
    status: 'pending',
    error: 'Zweb respondeu HTTP 429.'
  });
});

test('o teto de itens por execucao e respeitado', async () => {
  const store = criarStore([]);
  const adapter = { async writeBarcode() {} };

  await applyPendingBarcodeRequests({ store, adapter, permitido: () => true, limitePorExecucao: 3, agora: RELOGIO });
  await applyPendingBarcodeRequests({ store, adapter, permitido: () => true, limitePorExecucao: 999, agora: RELOGIO });
  await applyPendingBarcodeRequests({ store, adapter, permitido: () => true, limitePorExecucao: 0, agora: RELOGIO });

  assert.deepEqual(store.lidos, [3, 50, 10], 'teto proprio, teto maximo e padrao');
});

test('o log traz horario, quantidade e resultado', async () => {
  const store = criarStore([pedido(1, '16821', '789')]);
  const adapter = { async writeBarcode() {} };
  const eventos = [];

  await applyPendingBarcodeRequests({
    store,
    adapter,
    permitido: () => true,
    registrar: evento => eventos.push(evento),
    agora: RELOGIO
  });

  assert.equal(eventos.length, 1);
  assert.equal(eventos[0].em, '2026-08-20T14:00:00.000Z');
  assert.equal(eventos[0].lidos, 1);
  assert.equal(eventos[0].aplicados, 1);
  assert.equal(eventos[0].falhas, 0);
});

test('le o produto nos tres formatos que o ZWeb devolve', () => {
  const produto = { id: 20622659, barCode: '789' };
  assert.deepEqual(extractProduct(produto), produto);
  assert.deepEqual(extractProduct({ data: produto }), produto);
  assert.deepEqual(extractProduct([produto]), produto);
  assert.deepEqual(extractProduct({ data: [produto] }), produto);
  assert.equal(extractProduct(null), null);
  assert.equal(extractProduct({ mensagem: 'nada' }), null);
});

test('grava o produto inteiro, trocando so o codigo de barras', async () => {
  const chamadas = [];
  let gravado = { id: 20622659, sequence: '16821', description: 'HUB', barCode: '', cost: 42 };
  const adapter = createZwebProductBarcodeAdapter({
    async rpc(metodo, parametros) {
      chamadas.push({ metodo, parametros });
      if (metodo === 'inventory.get-product') return { data: { ...gravado } };
      gravado = { ...parametros };
      return { data: { ...gravado } };
    }
  });

  await adapter.writeBarcode({ productId: 20622659, productCode: '16821', barcode: '7899744088206' });

  assert.deepEqual(chamadas.map(c => c.metodo), [
    'inventory.get-product', 'inventory.put-product', 'inventory.get-product'
  ]);
  // O objeto enviado precisa levar os demais campos: o ZWeb substitui o
  // cadastro pelo que recebe, e um objeto parcial apagaria o resto.
  assert.equal(chamadas[1].parametros.cost, 42);
  assert.equal(chamadas[1].parametros.description, 'HUB');
  assert.equal(chamadas[1].parametros.barCode, '7899744088206');
});

test('nao grava de novo quando o codigo ja esta no ZWeb', async () => {
  const metodos = [];
  const adapter = createZwebProductBarcodeAdapter({
    async rpc(metodo) {
      metodos.push(metodo);
      return { data: { id: 20622659, barCode: '7899744088206' } };
    }
  });

  const resultado = await adapter.writeBarcode({ productId: 20622659, productCode: '16821', barcode: '7899744088206' });

  assert.equal(resultado.jaEstava, true);
  assert.deepEqual(metodos, ['inventory.get-product'], 'uma leitura, nenhuma gravacao');
});

test('resposta 200 nao basta: a gravacao e conferida relendo do ZWeb', async () => {
  const adapter = createZwebProductBarcodeAdapter({
    async rpc(metodo) {
      // O ZWeb aceita, mas o campo nao muda.
      return { data: { id: 20622659, barCode: '' } };
    }
  });

  await assert.rejects(
    () => adapter.writeBarcode({ productId: 20622659, productCode: '16821', barcode: '7899744088206' }),
    /continua diferente/
  );
});

test('produto sem id do ZWeb no catalogo nao vira gravacao as cegas', async () => {
  const adapter = createZwebProductBarcodeAdapter({ async rpc() { throw new Error('nao deveria chamar'); } });
  await assert.rejects(
    () => adapter.writeBarcode({ productId: null, productCode: '16821', barcode: '789' }),
    /sem o id do ZWeb/
  );
});

test('sem cliente configurado, recusa em vez de estourar torto', async () => {
  const adapter = createZwebProductBarcodeAdapter(null);
  await assert.rejects(
    () => adapter.writeBarcode({ productId: 1, productCode: '16821', barcode: '789' }),
    (error) => error instanceof FormatoNaoConfirmadoError
  );
});

// O bloqueio apos falha precisa valer de verdade: antes ele so aparecia no
// resumo, e cada item lido no coletor gerava uma tentativa nova contra um ZWeb
// que ja estava recusando.
test('depois de falhar, a fila fica em espera e nao tenta de novo em seguida', async () => {
  const store = criarStore([pedido(1, '16821', '789')]);
  let tentativas = 0;
  const adapter = {
    async writeBarcode() {
      tentativas += 1;
      const erro = new Error('Falha ao autenticar no Zweb (password): HTTP 200.');
      erro.details = { mensagem: 'usuario ou senha invalidos' };
      throw erro;
    }
  };

  const primeira = await applyPendingBarcodeRequests({ store, adapter, permitido: () => true, agora: RELOGIO });
  assert.equal(primeira.falhas, 1);
  // O motivo cru do ZWeb chega junto, para o erro nao morrer como "HTTP 200".
  assert.deepEqual(primeira.detalhes[0].resposta, { mensagem: 'usuario ou senha invalidos' });

  const segunda = await applyPendingBarcodeRequests({ store, adapter, permitido: () => true, agora: RELOGIO });
  assert.equal(segunda.emEspera, true);
  assert.equal(segunda.tentarEm, '2026-08-20T15:00:00.000Z');
  assert.equal(tentativas, 1, 'a segunda chamada nao pode tocar o ZWeb');
});

test('uma gravacao bem-sucedida limpa a espera', async () => {
  const store = criarStore([pedido(1, '16821', '789')]);
  let falhar = true;
  const adapter = {
    async writeBarcode() {
      if (falhar) throw new Error('ZWeb fora do ar.');
      return { jaEstava: false, anterior: '' };
    }
  };

  await applyPendingBarcodeRequests({ store, adapter, permitido: () => true, agora: RELOGIO });
  falhar = false;
  // Uma hora depois a espera venceu.
  const depois = () => new Date('2026-08-20T15:00:01.000Z');
  const resumo = await applyPendingBarcodeRequests({ store, adapter, permitido: () => true, agora: depois });
  assert.equal(resumo.aplicados, 1);

  const seguinte = await applyPendingBarcodeRequests({ store, adapter, permitido: () => true, agora: depois });
  assert.equal(seguinte.emEspera, undefined, 'sem falha, nao ha espera');
});
