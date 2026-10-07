const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const source = fs.readFileSync(require.resolve('../extension/nucleo/content.js'), 'utf8');
function runner() {
  const calls = []; let fails = false;
  const context = { BATCH_RUNNING: false, DAV_BATCH_NEXT_ALLOWED_AT: 0, DAV_BATCH_COOLDOWN_MS: 30 * 60 * 1000, DAV_BATCH_MIN_INTERVAL_MS: 1000, Date, console, setTimeout() {}, document: { getElementById() { return null; } }, parseDavIntegerQuantity: Number, normalizeBatchCode: value => '#' + String(value).replace(/^#/, ''), updateBatchStatus() {}, updateProgressBar() {}, delay: async ms => calls.push(['delay', ms]), fetchProductsByCodes: async () => { calls.push(['preflight']); return []; }, withTimeout: async task => task, addSingleItemInBatch: async code => { calls.push(['add', code]); if (fails) throw new Error('Falha de teste'); } };
  vm.createContext(context);
  vm.runInContext(source.slice(source.indexOf('  async function executeBatchByCodes('), source.indexOf('  function openBatchModal(')), context);
  return { context, calls, fail() { fails = true; } };
}
test('lote nao inicia consulta API paralela ao fluxo de adicao', async () => {
  const f = runner(); await f.context.executeBatchByCodes(['1'], '1'); assert.equal(f.calls.some(call => call[0] === 'preflight'), false);
});
test('primeira falha interrompe o lote e bloqueia nova tentativa automatica', async () => {
  const f = runner(); f.fail(); await f.context.executeBatchByCodes(['1','2'], '1'); await f.context.executeBatchByCodes(['3'], '1'); assert.equal(f.calls.filter(call => call[0] === 'add').length, 1);
});
test('codigos duplicados nao geram busca repetida e itens tem espacamento', async () => {
  const f = runner(); await f.context.executeBatchByCodes(['1','#1','2'], '1'); assert.equal(f.calls.filter(call => call[0] === 'add').length, 2); assert.equal(f.calls.some(call => call[0] === 'delay' && call[1] >= 1000), true);
});
test('segunda execucao simultanea nao gera adicoes e limite nao varre estoque', async () => {
  const f = runner(); f.context.BATCH_RUNNING = true; await f.context.executeBatchByCodes(['1'], '1'); assert.equal(f.calls.length, 0);
  f.context.BATCH_RUNNING = false; await f.context.executeBatchByCodes(Array.from({ length: 51 }, (_, i) => String(i + 1)), '1'); assert.equal(f.calls.length, 0);
});
test('busca de produto tem uma unica tentativa sem reconsulta automatica', () => {
  const code = source.slice(source.indexOf('  async function resolveBatchSearchOption('), source.indexOf('  function clickLikeUser('));
  assert.equal((code.match(/setInputValueDirect\(/g) || []).length, 1);
  assert.doesNotMatch(code, /for\s*\(|while\s*\(/);
});
