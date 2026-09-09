const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const contentPath = path.join(__dirname, '..', 'extension', 'nucleo', 'content.js');
const contentSource = fs.readFileSync(contentPath, 'utf8');

test('atualiza a interface por eventos, sem intervalo global de 1,5 segundo', () => {
  assert.equal(contentSource.includes('setInterval(() => {\n    if (shouldUsePageBridge()) ensurePageBridge();\n    scheduleFeatureUiRefresh(120);\n  }, 1500);'), false);
  assert.match(contentSource, /new MutationObserver\(\(\) => \{\s*if \(shouldUsePageBridge\(\)\) ensurePageBridge\(\);\s*scheduleFeatureUiRefresh\(90\);/);
});

test('só agenda o fechamento após a transição real de desligado para ligado', () => {
  assert.match(contentSource, /pendingSwitchOnBeforeInteraction/);
  assert.match(contentSource, /const enabledByThisInteraction = previousSwitchOn === false && currentSwitchOn === true;/);
  assert.match(contentSource, /if \(enabledByThisInteraction\) \{[\s\S]*DOCUMENT_NEGATIVE_STOCK_GUARD_STATE\.lastUserToggleAt = Date\.now\(\);/);
  assert.match(contentSource, /if \(disabledByThisInteraction\) \{[\s\S]*clearDocumentNegativeStockBackgroundDisable\(\);/);
  assert.match(contentSource, /document\.addEventListener\('change', handleDocumentNegativeStockGuardInteraction, true\);/);
  assert.doesNotMatch(contentSource, /document\.addEventListener\('mousedown', handleDocumentNegativeStockGuardInteraction, true\);/);
});

test('não consulta o painel do ZWeb repetidamente para vigiar estoque negativo', () => {
  assert.doesNotMatch(contentSource, /window\.setInterval\(runDocumentNegativeStockGuardHeartbeat, 1000\)/);
  assert.doesNotMatch(contentSource, /window\.setTimeout\(\(\) => checkDocumentNegativeStockServerState\(true\), 1500\)/);
  assert.doesNotMatch(contentSource, /checkDocumentNegativeStockServerState\(false\);/);
});
