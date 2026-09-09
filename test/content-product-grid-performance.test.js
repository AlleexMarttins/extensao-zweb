const test = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { join } = require('node:path');

const source = readFileSync(join(__dirname, '..', 'extension', 'nucleo', 'content.js'), 'utf8');

test('a grade de produtos nao participa da varredura global de botoes e links', () => {
  const scan = source.slice(source.indexOf('function scan()'), source.indexOf('function handleProductNativeFilterClearSync('));
  assert.equal(scan.includes('if (isTargetProductRoute()) return;'), true);
});
