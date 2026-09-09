const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { test } = require('node:test');
const { join } = require('node:path');

const purchaseValueSyncPath = join(__dirname, '..', 'extension', 'setores', 'fiscal', 'purchase-value-sync.js');

test('reconecta o observador de importação por mutação, sem conferir a tela a cada 1,5 segundo', () => {
  const source = readFileSync(purchaseValueSyncPath, 'utf8');

  assert.match(source, /new MutationObserver\(handlePurchaseValueSyncMutation\)/);
  assert.match(source, /function handlePurchaseValueSyncMutation\(\) \{\s*ensureObserver\(\);\s*scheduleEnsureUi\(\);\s*\}/);
  assert.doesNotMatch(source, /window\.setInterval\(\(\) => \{\s*ensureObserver\(\);\s*scheduleEnsureUi\(\);\s*\}, 1500\)/);
});
