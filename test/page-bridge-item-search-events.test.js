const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { test } = require('node:test');
const { join } = require('node:path');

const pageBridgePath = join(__dirname, '..', 'extension', 'nucleo', 'page-bridge.js');

test('normaliza a busca de item por eventos, sem varredura global a cada 120 ms', () => {
  const source = readFileSync(pageBridgePath, 'utf8');

  assert.match(source, /document\.addEventListener\('focusin', handleNfeItemHashInput, true\)/);
  assert.match(source, /new MutationObserver\(handleNfeItemHashMutations\)/);
  assert.match(source, /window\.addEventListener\('hashchange', scheduleVisibleNfeItemHashSync\)/);
  assert.doesNotMatch(source, /window\.setInterval\(\(\) => \{\s*syncVisibleNfeItemHashInputs\(\);\s*\}, 120\)/);
});
