const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const { chromium } = require('playwright');
const read = p => fs.readFileSync(require.resolve(p), 'utf8');
test('Chrome local: cada opcao do popup persiste ligada e desligada sem alterar as demais', async () => {
  const browser = await chromium.launch({ headless: true, channel: 'chrome' });
  try {
    const page = await browser.newPage();
    let requests = 0;
    await page.route('**/*', route => { requests++; return route.abort(); });
    await page.setContent('<div id="featureGroups"></div><button id="reload"></button>');
    await page.evaluate(() => {
      window.state = {};
      window.confirm = () => false;
      window.chrome = { storage: { local: {
        get: (defaults, cb) => cb(Object.assign({}, defaults, window.state)),
        set: (next, cb) => { window.state = Object.assign({}, window.state, next); cb(); }
      } }, tabs: { query: (_, cb) => cb([]) } };
    });
    await page.addScriptTag({ content: read('../extension/nucleo/features.js') });
    await page.addScriptTag({ content: read('../extension/ui/popup.js') });
    await page.evaluate(() => document.dispatchEvent(new Event('DOMContentLoaded')));
    const result = await page.evaluate(() => {
      const definitions = ZWEB_FEATURES.definitions;
      const errors = [];
      for (const feature of definitions) {
        const input = document.getElementById('feature-' + feature.key);
        if (!input) { errors.push(feature.key + ': ausente'); continue; }
        if (feature.forceDisabled) {
          if (!input.disabled || input.checked) errors.push(feature.key + ': suspensao nao aplicada');
          continue;
        }
        for (const checked of [false, true]) {
          const previous = ZWEB_FEATURES.normalizeState(window.state);
          input.checked = checked;
          input.dispatchEvent(new Event('change', { bubbles: true }));
          if (window.state[feature.key] !== checked) errors.push(feature.key + ': nao persistiu');
          for (const other of definitions) {
            if (other.key !== feature.key && ZWEB_FEATURES.normalizeState(window.state)[other.key] !== previous[other.key]) errors.push(feature.key + ': alterou ' + other.key);
          }
        }
      }
      return { count: definitions.length, errors };
    });
    assert.ok(result.count >= 27);
    assert.deepEqual(result.errors, []);
    assert.equal(requests, 0);
  } finally { await browser.close(); }
});

test('Chrome local: aviso auxiliar aparece acima do formulario nativo de relatorio', async () => {
  const browser = await chromium.launch({ headless: true, channel: 'chrome' });
  try {
    const page = await browser.newPage();
    await page.route('**/*', route => route.abort());
    await page.setContent('<div class="modal show" id="native" style="position:fixed;inset:0;z-index:2000000">Relatorio</div><div id="backdrop" class="modal-backdrop" style="display:none;position:fixed;inset:0;z-index:1061"></div><div id="confirm" class="modal" style="display:none;position:fixed;inset:20px;z-index:1065">Já conferiu as devoluções? ^ ~ `</div>');
    const source = read('../extension/nucleo/content.js');
    const code = source.slice(source.indexOf('  function showExtensionNativeModal('), source.indexOf('  function closeCommissionReportConfirmModal('));
    await page.addScriptTag({ content: code });
    await page.evaluate(() => { window.EXTENSION_DIALOG_TRANSITION_MS = 0; showExtensionNativeModal(document.getElementById('confirm'), document.getElementById('backdrop')); });
    assert.equal(await page.evaluate(() => document.elementFromPoint(50, 50).id), 'confirm');
    await page.evaluate(() => hideExtensionNativeModal(document.getElementById('confirm'), document.getElementById('backdrop')));
    await page.waitForTimeout(20);
    assert.equal(await page.evaluate(() => document.elementFromPoint(50, 50).id), 'native');
  } finally { await browser.close(); }
});
