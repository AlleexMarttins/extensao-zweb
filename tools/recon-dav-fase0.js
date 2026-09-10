// Recon Fase 0 - AutoCaixa ZWEB
// ============================================================================
// Descobre COMO e POR ONDE o ZWEB avisa que um DAV foi finalizado.
//
// NÃO faz requisição nenhuma. NÃO envia nada pra lugar nenhum. Só escuta o que
// o próprio ZWEB já está mandando e guarda uma cópia na memória da aba.
//
// Deliberadamente NÃO mexe no page-bridge.js: aquele arquivo está em produção
// e tem 4 caminhos de retorno no hook de fetch. Recon não pode arriscar o que
// já funciona. Este script embrulha fetch e XHR por fora e some com a aba.
//
// v2 (2026-09-09) — a v1 não capturou nada em 3 DAVs finalizados. Duas causas
// possíveis, as duas corrigidas aqui:
//   1. o ZWEB usa XMLHttpRequest, não fetch. A v1 só enganchava fetch.
//      (o page-bridge.js engancha os DOIS — foi a pista.)
//   2. o nome da operação não é `inventory.post-sale`. Agora captura TODA
//      chamada pra api.zweb.com.br e mostra os nomes reais que apareceram.
//
// COMO USAR
//   1. Abrir o ZWEB no Chrome, logado, com o DAV na tela
//   2. F12 -> aba "Console"
//   3. Colar este arquivo inteiro e dar Enter
//   4. Finalizar 1 DAV de teste
//   5. Rodar:  reconOperacoes()  -> QUAIS operações apareceram (comece por aqui)
//              reconResumo()     -> tabela das que parecem ser de DAV
//              reconSalvar()     -> baixa recon-dav.json
//
// Recarregar a página (F5) apaga tudo — é só colar de novo.
// ============================================================================

(function () {
  'use strict';

  // Captura TUDO que vai pra API e decide depois o que interessa. Filtrar cedo
  // foi o erro da v1: se o nome chutado estiver errado, não sobra pista.
  const HOST_API = 'api.zweb.com.br';
  // Só pra destacar no console; não filtra nada.
  const INTERESSE = ['sale', 'dav', 'trade', 'order', 'nfce', 'checkout'];

  if (window.__RECON_DAV) {
    console.warn('[recon] já instalado — mantendo as capturas anteriores. reconParar() pra zerar.');
    return;
  }

  const capturas = [];
  window.__RECON_DAV = capturas;

  const nativeFetch = window.fetch ? window.fetch.bind(window) : null;
  const nativeOpen = XMLHttpRequest.prototype.open;
  const nativeSend = XMLHttpRequest.prototype.send;

  const ehApi = url => String(url || '').indexOf(HOST_API) !== -1;

  function operacaoDaUrl(url) {
    const u = String(url || '');
    const semQuery = u.split('?')[0];
    return semQuery.substring(semQuery.lastIndexOf('/') + 1) || semQuery;
  }

  const interessante = op => INTERESSE.some(t => op.toLowerCase().indexOf(t) !== -1);

  function json(txt) {
    if (typeof txt !== 'string' || !txt) return null;
    try { return JSON.parse(txt); } catch (e) { return txt.slice(0, 2000); }
  }

  // As perguntas da Fase 0, respondidas por captura. Se itens, total e saleId
  // vierem todos na resposta, a captação custa ZERO request extra na Zweb.
  function achar(obj, nomes, prof = 0) {
    if (!obj || typeof obj !== 'object' || prof > 6) return undefined;
    for (const n of nomes) {
      if (Object.prototype.hasOwnProperty.call(obj, n)) return obj[n];
    }
    for (const v of Object.values(obj)) {
      const achado = achar(v, nomes, prof + 1);
      if (achado !== undefined) return achado;
    }
    return undefined;
  }

  function analisar(resposta) {
    const itens = achar(resposta, ['items', 'itens', 'saleItems', 'products']);
    return {
      saleId: achar(resposta, ['saleId', 'id', 'uuid']),
      numeroDav: achar(resposta, ['number', 'numero', 'saleNumber', 'documentNumber']),
      total: achar(resposta, ['total', 'totalValue', 'netTotal', 'valorTotal']),
      tradeStatus: achar(resposta, ['tradeStatus', 'status', 'statusId']),
      temItens: Array.isArray(itens),
      qtdItens: Array.isArray(itens) ? itens.length : null
    };
  }

  function registrar(via, metodo, url, corpoEnviado, corpoResposta, status) {
    const operacao = operacaoDaUrl(url);
    const resposta = json(corpoResposta);
    const reg = {
      em: new Date().toISOString(),
      via: via,                       // 'fetch' ou 'xhr'
      metodo: metodo,
      operacao: operacao,
      url: url,
      status: status,
      requisicao: json(corpoEnviado),
      resposta: resposta,
      analise: analisar(resposta)
    };
    capturas.push(reg);
    if (interessante(operacao)) {
      console.log(`%c[recon] ${via} ${operacao} (${status})`,
        'color:#0a0;font-weight:bold', reg.analise);
    }
    return reg;
  }

  // ------------------------------------------------------------------ fetch ---
  if (nativeFetch) {
    window.fetch = async function (input, init) {
      const url = typeof input === 'string' ? input : (input && input.url) || '';
      if (!ehApi(url)) return nativeFetch(input, init);

      const metodo = (init && init.method)
        || (input instanceof Request && input.method) || 'GET';

      let enviado = null;
      try {
        if (init && typeof init.body === 'string') enviado = init.body;
        else if (input instanceof Request) enviado = await input.clone().text();
      } catch (e) {}

      const resposta = await nativeFetch(input, init);
      // clone() pra não consumir o corpo que o ZWEB ainda vai ler.
      let texto = '';
      try { texto = await resposta.clone().text(); } catch (e) {}
      try { registrar('fetch', metodo, url, enviado, texto, resposta.status); } catch (e) {}
      return resposta;
    };
  }

  // -------------------------------------------------------------------- xhr ---
  // É por aqui que o ZWEB provavelmente fala — a v1 perdeu tudo por não olhar.
  XMLHttpRequest.prototype.open = function (metodo, url) {
    this.__reconMetodo = metodo;
    this.__reconUrl = url;
    return nativeOpen.apply(this, arguments);
  };

  XMLHttpRequest.prototype.send = function (body) {
    if (ehApi(this.__reconUrl)) {
      const enviado = typeof body === 'string' ? body : null;
      this.addEventListener('load', () => {
        let texto = '';
        try {
          texto = (this.responseType === '' || this.responseType === 'text')
            ? this.responseText
            : JSON.stringify(this.response);
        } catch (e) {}
        try {
          registrar('xhr', this.__reconMetodo, this.__reconUrl, enviado, texto, this.status);
        } catch (e) {}
      });
    }
    return nativeSend.apply(this, arguments);
  };

  // ---------------------------------------------------------------- relatos ---
  window.reconOperacoes = function () {
    if (!capturas.length) {
      console.log('[recon] nada capturado. A aba fez alguma chamada pra API depois de colar?');
      return;
    }
    const porOp = {};
    capturas.forEach(c => {
      const k = c.via + ' ' + c.operacao;
      porOp[k] = porOp[k] || { via: c.via, operacao: c.operacao, vezes: 0, interesse: interessante(c.operacao) ? 'SIM' : '' };
      porOp[k].vezes += 1;
    });
    console.table(Object.values(porOp).sort((a, b) => b.vezes - a.vezes));
    return Object.keys(porOp).length + ' operação(ões) distintas';
  };

  window.reconResumo = function () {
    const alvo = capturas.filter(c => interessante(c.operacao));
    if (!alvo.length) {
      console.log('[recon] nenhuma operação com cara de DAV. Rode reconOperacoes() pra ver todas.');
      return;
    }
    console.table(alvo.map(c => ({
      via: c.via, metodo: c.metodo, operacao: c.operacao, status: c.status,
      saleId: c.analise.saleId, numeroDav: c.analise.numeroDav,
      total: c.analise.total, tradeStatus: c.analise.tradeStatus,
      itens: c.analise.qtdItens
    })));
    console.log('Objetos crus em window.__RECON_DAV');
    return alvo.length + ' de ' + capturas.length + ' captura(s)';
  };

  window.reconSalvar = function () {
    const blob = new Blob([JSON.stringify(capturas, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'recon-dav.json';
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 5000);
    return capturas.length + ' captura(s) em recon-dav.json';
  };

  window.reconParar = function () {
    if (nativeFetch) window.fetch = nativeFetch;
    XMLHttpRequest.prototype.open = nativeOpen;
    XMLHttpRequest.prototype.send = nativeSend;
    delete window.__RECON_DAV;
    console.log('[recon] desinstalado. fetch e XHR voltaram ao original.');
  };

  console.log(
    '%c[recon v2] instalado — fetch + XHR, capturando TUDO de ' + HOST_API,
    'color:#0a0;font-weight:bold',
    '\nFinalize 1 DAV de teste, depois rode reconOperacoes().',
    '\nDesinstalar sem recarregar: reconParar()'
  );
})();
