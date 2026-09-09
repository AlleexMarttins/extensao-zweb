const test = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { join } = require('node:path');

const fonte = readFileSync(join(__dirname, '..', 'extension', 'nucleo', 'zweb-product-payload.js'), 'utf8');
const sandbox = {};
new Function('globalThis', fonte)(sandbox);
const { extractProduct } = sandbox.ZWEB_PRODUCT_PAYLOAD;

const PRODUTO = { id: 20623534, sequence: '17695', barCode: '7899452028976' };

test('le o produto nos tres formatos que o ZWeb devolve', () => {
  assert.equal(extractProduct([PRODUTO]).sequence, '17695');
  assert.equal(extractProduct({ data: [PRODUTO] }).sequence, '17695');
  assert.equal(extractProduct({ data: PRODUTO }).sequence, '17695');
  assert.equal(extractProduct(PRODUTO).sequence, '17695');
});

test('recusa resposta que nao traz produto nenhum', () => {
  assert.equal(extractProduct(null), null);
  assert.equal(extractProduct([]), null);
  assert.equal(extractProduct({}), null);
  assert.equal(extractProduct('ok'), null);
  assert.equal(extractProduct({ success: true }), null, 'sucesso generico nao e produto');
});

test('so aceita a resposta do produto esperado', () => {
  assert.equal(extractProduct([PRODUTO], { expectedId: 20623534 }).id, 20623534);
  assert.equal(extractProduct([PRODUTO], { expectedId: 99999 }), null);
  // O ZWeb responde numero, e o pedido guarda numero: compara pelo valor.
  assert.ok(extractProduct([{ id: '20623534', barCode: 'x' }], { expectedId: 20623534 }));
});

test('exige o campo que vai ser conferido, para nao confundir ausencia com vazio', () => {
  assert.ok(extractProduct([PRODUTO], { requiredField: 'barCode' }));
  assert.equal(extractProduct([{ id: 20623534, sequence: '17695' }], { requiredField: 'barCode' }), null);
  // Campo presente e vazio e uma resposta legitima: o ZWeb gravou vazio.
  assert.ok(extractProduct([{ id: 20623534, barCode: '' }], { requiredField: 'barCode' }));
});
