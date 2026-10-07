const test = require('node:test');
const assert = require('node:assert/strict');
const { selectRecipient, selectCached, formatQuantity } = require('../extension/nucleo/dav-recipient-model.js');
function fixture() {
  const correct = { uuid: 'TARGET', name: 'CLIENTE BALCÃO', active: true };
  const old = { uuid: 'OTHER', name: 'CLIENTE BALCÃO', active: false };
  let clicks = 0;
  const model = { options: [old, correct], internalValue: [], select(value) { clicks++; this.internalValue = [value]; }, $nextTick: async () => {} };
  const input = { isConnected: true, parentElement: null, __vueParentComponent: { proxy: model } };
  return { input, model, correct, get clicks() { return clicks; } };
}
test('seleciona por UUID mesmo com dois clientes de mesmo nome', async () => {
  const f = fixture(); assert.equal(await selectRecipient(f.input, { uuid: 'TARGET' }), 'selected'); assert.equal(f.model.internalValue[0], f.correct); assert.equal(f.clicks, 1);
});
test('texto digitado nao conta como cliente selecionado', async () => {
  const f = fixture(); f.model.select = () => {}; f.input.value = 'CLIENTE BALCÃO'; assert.equal(await selectRecipient(f.input, { uuid: 'TARGET' }), 'unconfirmed');
});
test('nao substitui selecao manual nem seleciona de novo', async () => {
  const f = fixture(); f.model.internalValue = [{ uuid: 'MANUAL' }]; assert.equal(await selectRecipient(f.input, { uuid: 'TARGET' }), 'occupied'); assert.equal(f.clicks, 0);
});
test('modelo sem opcoes ainda carregando nao inventa objeto de cliente', async () => {
  const f = fixture(); f.model.options = []; assert.equal(await selectRecipient(f.input, { uuid: 'TARGET' }), 'waiting'); assert.equal(f.clicks, 0);
});
test('cliente inativo nao pode ser selecionado', async () => {
  const f = fixture(); f.correct.active = false; assert.equal(await selectRecipient(f.input, { uuid: 'TARGET' }), 'waiting');
});
test('selecao permanece depois de limpar pesquisa e perder foco', async () => {
  const f = fixture(); await selectRecipient(f.input, { uuid: 'TARGET' }); f.input.value = ''; f.model.search = ''; assert.equal(await selectRecipient(f.input, { uuid: 'TARGET' }), 'selected'); assert.equal(f.clicks, 1);
});
test('quantidade 1 respeita precisao zero, dois e quatro sem multiplicar', () => {
  assert.equal(formatQuantity(1, { precision: 0 }), '1');
  assert.equal(formatQuantity(1, { precision: 2 }), '1,00');
  assert.equal(formatQuantity(1, { precision: 4 }), '1,0000');
  assert.equal(formatQuantity(1, { precision: 4, decimal: '.' }), '1.0000');
});
test('quantidades invalidas nao sao enviadas ao formulario', () => {
  for (const value of [0, -1, NaN, Infinity, 1.5, '1', '1^0']) assert.throws(() => formatQuantity(value), /invalida/);
});
test('alteracao manual de pesquisa interrompe o preenchimento automatico', async () => {
  const f = fixture(); f.input.value = 'OUTRO'; assert.equal(await selectRecipient(f.input, { uuid: 'TARGET', name: 'CLIENTE BALCÃO' }), 'occupied'); assert.equal(f.clicks, 0);
});
test('input desmontado e UUID ausente nao geram selecao', async () => {
  const f = fixture(); assert.equal(await selectRecipient(f.input, {}), 'invalid'); f.input.isConnected = false; assert.equal(await selectRecipient(f.input, { uuid: 'TARGET' }), 'invalid'); assert.equal(f.clicks, 0);
});
test('aguarda opcoes atrasadas e confirma modelo apos atualizacao do Vue', async () => {
  const f = fixture(); f.model.options = []; assert.equal(await selectRecipient(f.input, { uuid: 'TARGET' }), 'waiting'); f.model.options = [f.correct]; f.model.select = () => {}; f.model.$nextTick = async () => { f.model.internalValue = [f.correct]; }; assert.equal(await selectRecipient(f.input, { uuid: 'TARGET' }), 'selected');
});
test('lote rejeita caracteres especiais e fracao em vez de transformar em outra quantidade', () => {
  const source = require('node:fs').readFileSync(require.resolve('../extension/nucleo/content.js'), 'utf8');
  const context = {}; require('node:vm').createContext(context);
  require('node:vm').runInContext(source.slice(source.indexOf('  function normalizeDavIntegerQuantityText('), source.indexOf('  function normalizeDavItemDescriptionKey(')), context);
  for (const raw of ['1^0', '1~0', '1`0', '1,5', '1.5', '1e4', '-1']) assert.equal(context.normalizeDavIntegerQuantityText(raw), '');
  for (const raw of ['1', '1,0000', '1.0000']) assert.equal(context.normalizeDavIntegerQuantityText(raw), '1');
  assert.equal(context.normalizeDavIntegerQuantityText('10.000,00'), '10000');
});
test('cliente ja carregado e aplicado por UUID sem preencher pesquisa', async () => {
  const f = fixture(); f.input.value = ''; assert.equal(await selectCached(f.input, { uuid: 'TARGET', name: 'CLIENTE BALCÃO' }), 'selected'); assert.equal(f.input.value, ''); assert.equal(f.clicks, 1);
});
test('produto ja carregado e selecionado pelo codigo exato, nao por descricao', async () => {
  const f = fixture(); f.input.value = ''; f.model.options = [{ sequence: '10', name: 'IGUAL' }, { sequence: '1', name: 'IGUAL' }]; assert.equal(await selectCached(f.input, { code: '1' }), 'selected'); assert.equal(f.model.internalValue[0].sequence, '1');
});
test('cache ausente nao inventa produto nem chama consulta externa', async () => {
  const f = fixture(); f.model.options = []; assert.equal(await selectCached(f.input, { code: '1' }), 'unavailable'); assert.equal(f.clicks, 0);
});
test('selecao direta nao sobrescreve escolha manual nem repete aplicacao', async () => {
  const f = fixture(); f.input.value = ''; await selectCached(f.input, { uuid: 'TARGET' }); await selectCached(f.input, { uuid: 'TARGET' }); assert.equal(f.clicks, 1); assert.equal(await selectCached(f.input, { uuid: 'OTHER' }), 'occupied');
});
