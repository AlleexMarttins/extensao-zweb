const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const extensionRoot = path.join(__dirname, '..', 'extension', 'nucleo');
const backgroundSource = fs.readFileSync(path.join(extensionRoot, 'background.js'), 'utf8');
const contentSource = fs.readFileSync(path.join(extensionRoot, 'content.js'), 'utf8');

test('só informa fechamento automático depois de confirmar a configuração pela API', () => {
  assert.match(backgroundSource, /async function verifyNegativeStockDisabled\(token\)/);
  assert.match(backgroundSource, /apiChanged = await verifyNegativeStockDisabled\(token\);/);
  assert.match(backgroundSource, /if \(!apiChanged\) \{\s*visualResult = await disableNegativeStockThroughConfigurationTab/);
  assert.match(backgroundSource, /if \(!apiChanged\) \{\s*throw new Error\(/);
});

test('a aba de configuração não retorna sucesso se o interruptor continuar ligado', () => {
  assert.match(backgroundSource, /ok: getInputChecked\(\) === false/);
  assert.match(contentSource, /ok: !state\.switchOn/);
});

test('uma atualização da extensão cancela agendamentos antigos de fechamento', () => {
  assert.match(
    backgroundSource,
    /chrome\.runtime\.onInstalled\.addListener\(\(\) => \{[\s\S]*clearDocumentNegativeStockScheduledDisable\(\)\.catch\(\(\) => \{\}\);/
  );
});

test('acompanha o interruptor movido para Configurações gerais', () => {
  assert.match(contentSource, /TARGET_DOCUMENT_CONFIGURATION_ROUTE = '\/account\/general-configuration'/);
  assert.match(contentSource, /DOCUMENT_NEGATIVE_STOCK_LABEL = 'Permitir estoque negativo'/);
  assert.match(backgroundSource, /ZWEB_DOCUMENT_CONFIGURATION_URL = 'https:\/\/zweb\.com\.br\/#\/account\/general-configuration'/);
  assert.match(backgroundSource, /text\.indexOf\('permitir estoque negativo'\)/);
});
