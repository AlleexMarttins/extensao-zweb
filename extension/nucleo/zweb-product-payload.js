// Le o produto de dentro da resposta do ZWeb.
//
// O mesmo endpoint devolve ora um array, ora um objeto, ora algo embrulhado em
// `data`. Isso ficava repetido em cada chamada; aqui fica em um lugar so, e
// pode ser testado sem rede.
(function () {
  'use strict';

  function desembrulhar(payload) {
    if (!payload || typeof payload !== 'object') return null;
    if (Array.isArray(payload)) return payload[0] && typeof payload[0] === 'object' ? payload[0] : null;
    if (payload.data) return desembrulhar(payload.data);
    return payload;
  }

  /// Devolve o produto so quando da para confiar nele.
  ///
  /// Com `expectedId`, exige que a resposta seja daquele produto: uma resposta
  /// generica de sucesso nao serve de confirmacao de que o valor foi gravado.
  /// Com `requiredField`, exige que o campo exista, para nao confundir
  /// "gravou vazio" com "a resposta nem traz esse campo".
  function extractProduct(payload, options) {
    const config = options || {};
    const produto = desembrulhar(payload);
    if (!produto || typeof produto !== 'object') return null;

    const identificador = produto.id ?? produto.productId;
    if (identificador === undefined || identificador === null) return null;
    if (config.expectedId !== undefined && Number(identificador) !== Number(config.expectedId)) return null;
    if (config.requiredField && !Object.prototype.hasOwnProperty.call(produto, config.requiredField)) return null;

    return produto;
  }

  globalThis.ZWEB_PRODUCT_PAYLOAD = { extractProduct };
})();
