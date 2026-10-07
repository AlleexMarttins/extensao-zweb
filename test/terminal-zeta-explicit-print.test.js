const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const readSource = (...parts) => fs.readFileSync(path.join(__dirname, '..', ...parts), 'utf8');

test('a impressão explícita fica desligada por padrão e não duplica a impressão automática', () => {
  const features = readSource('extension', 'nucleo', 'features.js');
  const content = readSource('extension', 'nucleo', 'content.js');

  assert.match(features, /terminalZetaManualPrint: true/);
  assert.match(features, /key: 'terminalZetaManualPrintEnabled'[\s\S]*?defaultValue: false/);
  assert.match(content, /if \(!isFeatureEnabled\('terminalZetaManualPrintEnabled'\)\) return false/);
  assert.match(content, /printTerminalZetaOnAuthorized !== false/);
  assert.match(content, /Impressão explícita ignorada porque a impressão automática/);
});

test('usa o terminal associado ao mesmo checkout e evita reenvio da mesma NFC-e', () => {
  const content = readSource('extension', 'nucleo', 'content.js');

  assert.match(content, /TerminalZeta\.get-configuration-checkouts/);
  assert.match(content, /fiscal\.print-terminal-zeta/);
  assert.match(content, /Number\(item\.checkoutId\) === context\.checkoutId/);
  assert.match(content, /terminalConfigurationId: Number\(checkoutLink\.configuration\)/);
  assert.match(content, /TERMINAL_ZETA_PRINTED_DOCUMENT_IDS\.has\(context\.documentId\)/);
  assert.match(content, /TERMINAL_ZETA_PRINTING_DOCUMENT_IDS\.has\(context\.documentId\)/);
});

test('o checkout do documento e identificado por configurationId, nao por id', () => {
  const content = readSource('extension', 'nucleo', 'content.js');

  // A NFC-e 111464 (22/09/2026) provou que o `checkout` do documento nao tem
  // `id`: tem `configurationId`, que e o valor casado pela listagem do
  // Terminal Zeta. Ler `checkout.id` primeiro dava NaN e a impressao explicita
  // era ignorada em silencio.
  assert.match(content, /const checkoutId = Number\(\s*checkout\.configurationId/);
  assert.match(content, /checkoutIdentification: checkoutIdentification/);
  assert.match(content, /String\(item\.identification \|\| ''\)\.trim\(\) === context\.checkoutIdentification/);
});
