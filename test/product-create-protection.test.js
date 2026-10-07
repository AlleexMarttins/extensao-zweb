const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const { chromium } = require('playwright');
const source = fs.readFileSync(require.resolve('../extension/nucleo/content.js'), 'utf8');
test('atualizacao chama protecao mesmo desligada para restaurar o botao', () => {
  assert.match(source, /function refreshFeatureUi\(\)\s*\{\s*scan\(\);/);
  assert.match(source, /function scan\(\)\s*\{\s*syncProductCreateProtection\(\);/);
});
test('Chrome local: cadastro bloqueado, recriado na navegacao e liberado ao desligar protecao', async () => {
  const browser = await chromium.launch({ headless: true, channel: 'chrome' });
  try {
    const page = await browser.newPage();
    await page.route('**/*', route => route.abort());
    await page.setContent('<button id="grid.primaryButton"><span>Cadastrar produto</span></button><a id="create-link" href="#/register/stock/product/new">Cadastrar produto</a><button id="other">Pesquisar</button>');
    const start = source.indexOf('  function syncProductCreateProtection()');
    assert.notEqual(start, -1);
    const code = source.slice(start, source.indexOf('  function scan()', start));
    await page.evaluate(() => {
      window.enabled = true;
      window.isFeatureEnabled = () => window.enabled;
      window.isTargetProductRoute = () => true;
      window.normalizeText = s => String(s).toLowerCase().trim();
    });
    await page.addScriptTag({ content: code });
    await page.evaluate(() => syncProductCreateProtection());
    assert.equal(await page.locator('[id="grid.primaryButton"]').isDisabled(), true);
    assert.equal(await page.locator('[id="grid.primaryButton"]').isVisible(), false);
    assert.equal(await page.locator('#create-link').isVisible(), false);
    assert.equal(await page.locator('#other').isEnabled(), true);
    await page.evaluate(() => { document.querySelector('[id="grid.primaryButton"]').outerHTML = '<button id="grid.primaryButton">Cadastrar produto</button>'; syncProductCreateProtection(); });
    assert.equal(await page.locator('[id="grid.primaryButton"]').isDisabled(), true);
    assert.equal(await page.locator('[id="grid.primaryButton"]').isVisible(), false);
    await page.evaluate(() => { window.enabled = false; syncProductCreateProtection(); });
    assert.equal(await page.locator('[id="grid.primaryButton"]').isEnabled(), true);
    assert.equal(await page.locator('[id="grid.primaryButton"]').isVisible(), true);
    assert.equal(await page.locator('#create-link').isVisible(), true);
  } finally { await browser.close(); }
});
