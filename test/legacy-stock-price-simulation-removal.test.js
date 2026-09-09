const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const extensionRoot = path.join(__dirname, '..', 'extension');
const simulatorPath = path.join(extensionRoot, 'setores', 'produtos', 'stock-price-simulation.js');
const removedReferences = [
  'stockPriceSimulationEnabled',
  'stock-price-simulation',
  'simulate-stock-price',
  'pendingStockPriceSimulation',
  'zweb-inline-sim-pencil',
];

test('não mantém o simulador de preço legado na extensão', () => {
  assert.equal(fs.existsSync(simulatorPath), false, 'o script legado não deve existir');

  const filesToInspect = [
    'manifest.json',
    path.join('nucleo', 'background.js'),
    path.join('nucleo', 'features.js'),
    path.join('setores', 'fiscal', 'purchase-value-sync.js'),
  ];

  for (const relativePath of filesToInspect) {
    const contents = fs.readFileSync(path.join(extensionRoot, relativePath), 'utf8');
    for (const removedReference of removedReferences) {
      assert.equal(
        contents.includes(removedReference),
        false,
        relativePath + ' ainda referencia ' + removedReference,
      );
    }
  }
});
