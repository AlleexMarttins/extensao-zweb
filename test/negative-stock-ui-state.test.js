const test = require('node:test');
const assert = require('node:assert/strict');
const { applyToApp, readFromBrowser } = require('../extension/nucleo/negative-stock-ui-state.js');

test('consulta nativa usa sessao do navegador e nao gera retry nem escrita', async () => {
  let calls = 0;
  const value = await readFromBrowser(async (url, options) => {
    calls++;
    assert.ok(url.endsWith('/application.get-client'));
    assert.equal(options.credentials, 'include');
    assert.equal(options.body, '{}');
    assert.equal(options.headers.Authorization, 'Bearer TOKEN');
    return { ok: true, json: async () => ({ fiscal: { emissor: { isAllowedNegativeStock: false } } }) };
  }, 'TOKEN');
  assert.equal(value, false);
  assert.equal(calls, 1);
});

test('resposta sem configuracao falha sem tratar lista vazia como estoque desligado', async () => {
  await assert.rejects(readFromBrowser(async () => ({ ok: true, json: async () => [] }), 'TOKEN'), /sem configuracao/);
});
test('atualiza o modelo do interruptor sem emitir eventos ou gravar configuracoes', () => {
  let writes = 0;
  const emitter = { isAllowedNegativeStock: true, showOutOfStockWarning: true };
  const store = { account: { fiscal: { emissor: emitter } }, save() { writes++; } };
  const app = { _context: { provides: { [Symbol('pinia')]: { _s: new Map([['account', store]]) } } } };
  assert.equal(applyToApp(app, false), true);
  assert.equal(emitter.isAllowedNegativeStock, false);
  assert.equal(emitter.showOutOfStockWarning, true);
  assert.equal(writes, 0);
  assert.equal(applyToApp(app, true), true);
  assert.equal(emitter.isAllowedNegativeStock, true);
});
test('estrutura desconhecida nao altera campos nem inventa estado', () => {
  assert.equal(applyToApp({}, false), false);
  assert.equal(applyToApp(null, false), false);
  assert.equal(applyToApp({}, 'false'), false);
});

test('atualiza tambem generalConfiguration usado pelo formulario sem chamar save', () => {
  let writes = 0;
  const account = { fiscal: { emissor: { isAllowedNegativeStock: true } } };
  const generalConfiguration = { fiscal: { emissor: { isAllowedNegativeStock: true, showOutOfStockWarning: true } } };
  const app = { _context: { provides: { pinia: { _s: new Map([['account', { account }], ['configuration', { generalConfiguration, save() { writes++; } }]]) } } } };
  assert.equal(applyToApp(app, false), true);
  assert.equal(generalConfiguration.fiscal.emissor.isAllowedNegativeStock, false);
  assert.equal(account.fiscal.emissor.isAllowedNegativeStock, false);
  assert.equal(generalConfiguration.fiscal.emissor.showOutOfStockWarning, true);
  assert.equal(writes, 0);
});
