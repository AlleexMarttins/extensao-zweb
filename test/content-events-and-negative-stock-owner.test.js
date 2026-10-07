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

test('encaminha o estado ao servico sem agendar fechamento por computador', () => {
  assert.match(contentSource, /type: 'document-negative-stock-observed'/);
  assert.doesNotMatch(contentSource, /function handleDocumentNegativeStockGuardInteraction/);
});

test('não consulta o painel do ZWeb repetidamente para vigiar estoque negativo', () => {
  assert.doesNotMatch(contentSource, /window\.setInterval\(runDocumentNegativeStockGuardHeartbeat, 1000\)/);
  assert.doesNotMatch(contentSource, /window\.setTimeout\(\(\) => checkDocumentNegativeStockServerState\(true\), 1500\)/);
  assert.doesNotMatch(contentSource, /checkDocumentNegativeStockServerState\(false\);/);
});
