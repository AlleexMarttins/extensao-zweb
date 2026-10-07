// AutoCaixa - captador de DAV salvo (HORIZONTE / ZWEB)
// ============================================================================
// Quando o vendedor clica em `Salvar` num DAV, manda o pacote pro servidor do
// AutoCaixa na REDE LOCAL, que imprime a etiqueta e alimenta o totem.
//
// NÃO faz nenhuma chamada pra Zweb. Nenhuma. O payload inteiro sai do que o
// próprio ZWEB já mandou — a requisição do `post-sale`/`put-sale` carrega os
// itens, o total e o cliente; a resposta carrega o número do DAV. Isso foi
// medido na Fase 0 (ver o vault: `AutoCaixa ZWEB - plano`).
//
// Isso é regra, não preferência: a Zweb já avisou que um pico de chamadas
// bloqueia a conta (ver `nucleo/zweb-operation-queue.js`). Se algum dia faltar
// um campo aqui, a saída é pedir pro ZWEB mostrar na tela — nunca abrir uma
// consulta nova.
//
// Roda no content script. Quem observa o XHR é o `page-bridge.js`, no contexto
// da página, e avisa por postMessage.
// ============================================================================

(function () {
  'use strict';

  const BRIDGE_SOURCE = 'zweb-xml-page-bridge';
  const EVENTO = 'autocaixa-dav-salvo';
  // Chave da EMPRESA no servidor, não do sistema. São dois CNPJs na mesma loja:
  // `mva` (Clipp) e `horizonte` (ZWEB). O servidor usa isso pra escolher a
  // maquininha e a razão social — tem que bater com as seções `[zpos_*]`.
  const ORIGEM = 'horizonte';

  // O servidor do AutoCaixa é local (192.168.1.240). Nunca a internet.
  const PADROES = {
    url: 'http://192.168.1.240:8790',
    // O servidor do .240 exige o header `X-AutoCaixa-Token`; sem ele o POST
    // volta 401 e o DAV some calado. Como nao ha tela pra preencher
    // `autocaixaConfig`, o padrao tem que trazer o token. E o mesmo segredo
    // compartilhado que ja esta nos .ini do Emissor e do Impressor, e so vale
    // dentro da rede local - nao da acesso a Zweb nem a nada na internet.
    token: 'mva-autocaixa-2026'
  };
  // O liga/desliga é o toggle do popup (`features.js`), não um campo daqui:
  // assim a loja liga pela interface, como faz com as outras automações.
  const CHAVE_TOGGLE = 'autoCaixaDavWatcherEnabled';

  let config = { ...PADROES, ativo: false };
  // DAVs já mandados nesta aba: evita reenviar quando o vendedor salva duas
  // vezes seguidas sem mudar nada. `sequence -> digital do conteúdo`.
  const enviados = new Map();

  function log(...args) {
    console.log('%c[AutoCaixa]', 'color:#0aa;font-weight:bold', ...args);
  }

  // -------------------------------------------------------------- config ---
  function carregarConfig() {
    try {
      chrome.storage.local.get(['autocaixaConfig', CHAVE_TOGGLE], r => {
        config = {
          ...PADROES,
          ...((r && r.autocaixaConfig) || {}),
          ativo: !!(r && r[CHAVE_TOGGLE])
        };
        log('config', config.ativo ? 'ATIVA -> ' + config.url : 'desligada');
      });
    } catch (e) {
      log('sem chrome.storage; usando padrões');
    }
  }

  // --------------------------------------------------------------- pacote ---
  function brl(v) {
    return 'R$ ' + Number(v || 0).toFixed(2).replace('.', ',')
      .replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  }

  function qtd(v) {
    const s = Number(v || 0).toFixed(4).replace(/0+$/, '').replace(/\.$/, '');
    return (s || '0').replace('.', ',');
  }

  /// Monta o mesmo formato que o Emissor do Clipp manda em `snapshot.py`, pra
  /// o servidor e o totem não precisarem saber de qual ERP veio a venda.
  function montarPacote(requisicao, resposta) {
    // O `sequence` (número do DAV) vem de lugares DIFERENTES nas duas
    // operações: da resposta no `post-sale` (DAV novo, o número acabou de ser
    // gerado) e da requisição no `put-sale` (DAV que já tinha número). Ler só
    // de um dos dois funciona num caso e falha calado no outro.
    const numero = Number(
      (resposta && resposta.sequence) || (requisicao && requisicao.sequence) || 0
    );
    if (!numero) return null;

    const linhas = Array.isArray(requisicao.itemOfTradeCollection)
      ? requisicao.itemOfTradeCollection : [];

    const itens = linhas.map((l, i) => {
      const produto = l.item || {};
      const unit = Number(l.price || 0);
      const lista = Number(l.originalPrice || unit);
      const total = Number(l.totalPrice != null ? l.totalPrice : unit * Number(l.quantity || 0));
      return {
        seq: i + 1,
        produto: String(produto.description || l.description || '(sem descrição)').trim(),
        qtd: qtd(l.quantity),
        unit: brl(unit),
        total: brl(total),
        tem_desconto: Number(l.discount || 0) > 0 || lista > unit,
        preco_lista: brl(lista)
      };
    });

    const descontoTotal = linhas.reduce((soma, l) => {
      const lista = Number(l.originalPrice || l.price || 0);
      const bruto = lista * Number(l.quantity || 0);
      const liquido = Number(l.totalPrice != null ? l.totalPrice : bruto);
      return soma + Math.max(0, bruto - liquido);
    }, Number(requisicao.discount || 0));

    const agora = new Date();
    const dois = n => String(n).padStart(2, '0');

    return {
      origem: ORIGEM,
      numero: numero,
      id_externo: (resposta && resposta.id) || requisicao.id || null,
      cliente: (requisicao.buyer && requisicao.buyer.name) || '-',
      vendedor: (requisicao.seller && requisicao.seller.name) || '-',
      data: `${dois(agora.getDate())}/${dois(agora.getMonth() + 1)}/${agora.getFullYear()} `
        + `${dois(agora.getHours())}:${dois(agora.getMinutes())}`,
      itens: itens,
      qtd_itens: itens.length,
      tem_desconto: descontoTotal > 0,
      desconto_total: brl(descontoTotal),
      total: brl(requisicao.price),
      total_valor: Number(requisicao.price || 0),
      // Bloco da NFC-e. NAO e' consulta nova: e' o MESMO corpo do
      // `post-sale`/`put-sale` que o ZWeb acabou de mandar, so que sem passar
      // pelo resumo que a etiqueta usa.
      //
      // Por que o servidor precisa disto: o `fiscal.post-nfce` exige o
      // documento inteiro, com as linhas e o objeto do produto em cada uma
      // (`product: s.item`, igual ao `importSaleProducts` do front). Nenhum
      // campo fiscal vai aqui -- CST/CFOP/ICMS sao calculados pela Zweb.
      // Medido na captura de 21/09/2026 (NFC-e 111411).
      fiscal: {
        itens: linhas,
        buyer: requisicao.buyer || {},
        seller: requisicao.seller || {},
        wholesaleProducts: requisicao.wholesaleProducts || {},
        freightPrice: Number(requisicao.freightPrice || 0),
        discount: Number(requisicao.discount || 0),
        extraValue: Number(requisicao.extraValue || 0)
      }
    };
  }

  /// Digital do CONTEÚDO, pra não reenviar salvamento repetido sem mudança.
  /// Mesma ideia do `db.fingerprints()` do Emissor do Clipp: muda se qualquer
  /// produto, quantidade ou preço mudar; não muda se o vendedor só reabriu e
  /// salvou de novo.
  function digital(pacote) {
    return pacote.itens
      .map(i => [i.produto, i.qtd, i.unit, i.total].join('|'))
      .sort().join(';') + '#' + pacote.total;
  }

  // --------------------------------------------------------------- envio ---
  /// Manda pelo service worker, NÃO por fetch daqui.
  ///
  /// A Zweb é HTTPS e o servidor do AutoCaixa é HTTP. Um fetch feito no content
  /// script roda sob a origem da página e morre no bloqueio de mixed content do
  /// Chrome — silenciosamente, o que renderia horas de "por que não chega nada".
  /// O service worker não tem essa restrição.
  // Tentativas extras quando o service worker some no meio da mensagem (ver
  // comentário em `enviar()`). 3 retries com espera crescente — visto em
  // produção 2026-09-16 que uma segunda tentativa quase sempre resolve
  // (o novo `sendMessage` acorda um service worker fresco).
  const MAX_TENTATIVAS_ENVIO = 4;
  const ESPERA_RETRY_MS = [500, 1500, 3000];

  function enviar(pacote, tentativa = 1) {
    chrome.runtime.sendMessage(
      { type: 'autocaixa-dav', url: config.url, token: config.token, pacote: pacote },
      resposta => {
        if (chrome.runtime.lastError) {
          // MV3: o Chrome pode suspender o service worker NO MEIO do fetch
          // (ocioso demais, ou memória apertada) — a mensagem nunca recebe
          // resposta e cai aqui com "message port closed before a response
          // was received". Não significa que o servidor recusou; muitas vezes
          // o fetch nem chegou a sair. Sem retry, o DAV ficava esperando o
          // vendedor clicar Salvar de novo pra reenviar — descoberto em
          // produção 2026-09-16 (DAV 15556 "enviado" no log mas nada saiu na
          // impressora).
          if (tentativa < MAX_TENTATIVAS_ENVIO) {
            const espera = ESPERA_RETRY_MS[tentativa - 1] || 3000;
            log(
              'service worker sumiu (tentativa', tentativa, 'de', MAX_TENTATIVAS_ENVIO + ') -',
              'tentando de novo em', espera, 'ms:', chrome.runtime.lastError.message,
            );
            setTimeout(() => enviar(pacote, tentativa + 1), espera);
            return;
          }
          log(
            'falha ao falar com o service worker (desistindo após', MAX_TENTATIVAS_ENVIO, 'tentativas):',
            chrome.runtime.lastError.message,
          );
          enviados.delete(pacote.numero);      // não deu; deixa reenviar no próximo Salvar
          return;
        }
        if (resposta && resposta.ok) {
          log(
            'DAV', pacote.numero, 'enviado (' + pacote.qtd_itens + ' itens, ' + pacote.total + ')',
            tentativa > 1 ? '[tentativa ' + tentativa + ']' : '',
          );
        } else {
          log('servidor recusou o DAV', pacote.numero, '-', (resposta && resposta.message) || '?');
          enviados.delete(pacote.numero);
        }
      }
    );
  }

  // -------------------------------------------------------------- gatilho ---
  function aoSalvarDav(detalhe) {
    if (!config.ativo) return;

    let pacote;
    try {
      pacote = montarPacote(detalhe.requisicao || {}, detalhe.resposta || {});
    } catch (e) {
      log('não consegui montar o pacote:', e.message);
      return;
    }
    if (!pacote) {
      log('Salvar sem número de DAV na requisição nem na resposta — ignorado');
      return;
    }
    // Sem itens = a requisição não era o DAV inteiro (formato novo da Zweb,
    // ou outro método com nome parecido). Etiqueta com R$ 0,00 confunde o
    // caixa e a NFC-e falharia depois; melhor não mandar.
    if (!pacote.qtd_itens) {
      log('DAV', pacote.numero, 'chegou sem itens — não enviado');
      return;
    }

    const d = digital(pacote);
    if (enviados.get(pacote.numero) === d) {
      log('DAV', pacote.numero, 'sem mudança desde o último envio — ignorado');
      return;
    }
    enviados.set(pacote.numero, d);
    enviar(pacote);
  }

  window.addEventListener('message', event => {
    if (event.source !== window) return;
    const d = event.data;
    if (!d || d.source !== BRIDGE_SOURCE || d.type !== EVENTO) return;
    aoSalvarDav(d);
  });

  try {
    chrome.storage.onChanged.addListener(mudancas => {
      if (mudancas.autocaixaConfig || mudancas[CHAVE_TOGGLE]) carregarConfig();
    });
  } catch (e) {}

  carregarConfig();
  log('captador de DAV carregado (origem=' + ORIGEM + ')');
})();
