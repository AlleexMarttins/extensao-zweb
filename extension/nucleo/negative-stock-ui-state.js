(function(global) {
  'use strict';
  function applyToApp(app, enabled) {
    if (typeof enabled !== 'boolean') return false;
    const provides = app && app._context && app._context.provides;
    if (!provides) return false;
    let updated = false;
    for (const key of Reflect.ownKeys(provides)) {
      const pinia = provides[key];
      if (!pinia || !(pinia._s instanceof Map)) continue;
      for (const store of pinia._s.values()) {
        const configurations = store && [store.account, store.generalConfiguration, store.$state?.account, store.$state?.generalConfiguration] || [];
        for (const configuration of configurations) {
          const value = configuration && (configuration.value || configuration);
          const emitter = value && value.fiscal && value.fiscal.emissor;
          if (!emitter || typeof emitter.isAllowedNegativeStock !== 'boolean') continue;
          // O formulario usa generalConfiguration, separado de account.
          // Atualiza somente o modelo: sem change, save ou debounce de gravacao.
          emitter.isAllowedNegativeStock = enabled;
          updated = true;
        }
      }
    }
    return updated;
  }
  async function readFromBrowser(fetchFn = global.fetch.bind(global), token = global.localStorage.getItem('token')) {
    if (!token) throw new Error('HTTP 401');
    const response = await fetchFn('https://api.zweb.com.br/rpc/v2/application.get-client', {
      method: 'POST', credentials: 'include', signal: AbortSignal.timeout(12000),
      headers: { Accept: 'application/json', 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: '{}'
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const payload = await response.json();
    const enabled = (payload?.fiscal?.emissor || payload?.data?.fiscal?.emissor)?.isAllowedNegativeStock;
    if (typeof enabled !== 'boolean') throw new Error('Resposta sem configuracao de estoque');
    return enabled;
  }
  global.ZWEB_NEGATIVE_STOCK_UI_STATE = { applyToApp, readFromBrowser };
  if (typeof module === 'object' && module.exports) module.exports = { applyToApp, readFromBrowser };
})(typeof globalThis !== 'undefined' ? globalThis : this);
