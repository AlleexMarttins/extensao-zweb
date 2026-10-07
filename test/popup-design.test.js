const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require('playwright');
test('popup real: busca, areas, acessibilidade, caracteres especiais e largura', async () => {
  const browser = await chromium.launch({ headless: true, channel: 'chrome' });
  try {
    const page = await browser.newPage({ viewport: { width: 400, height: 600 } });
    let remote = 0;
    await page.route('**/*', route => {
      const url = new URL(route.request().url());
      if (url.hostname !== 'fixture.local') { remote++; return route.abort(); }
      const files = { '/popup.html': 'ui/popup.html', '/popup.css': 'ui/popup.css', '/popup.js': 'ui/popup.js', '/nucleo/features.js': 'nucleo/features.js', '/icons/icon128.png': 'icons/icon128.png' };
      const file = files[url.pathname];
      if (!file) return route.abort();
      return route.fulfill({ path: path.join(__dirname, '../extension', file), contentType: file.endsWith('.css') ? 'text/css' : file.endsWith('.js') ? 'application/javascript' : file.endsWith('.png') ? 'image/png' : 'text/html' });
    });
    await page.addInitScript(() => {
      window.state = {};
      window.confirm = () => false;
      window.chrome = { runtime: { getManifest: () => ({version:'1.4.14'}) }, storage: { local: {
        get: (defaults, cb) => cb({...defaults, ...window.state}),
        set: (next, cb) => { window.state = {...window.state,...next}; cb(); }
      } }, tabs: { query: (_, cb) => cb([]) } };
    });
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.goto('http://fixture.local/popup.html');
    const count = await page.locator('input[role="switch"]').count();
    assert.ok(count >= 27);
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
    await page.getByRole('button', {name:'Produtos',exact:true}).click();
    assert.ok(await page.locator('.feature-card:visible').count() > 0);
    assert.equal(await page.locator('.feature-card:visible').evaluateAll(cards => cards.every(c => c.dataset.featureGroup === 'Produtos')), true);
    await page.getByRole('button', {name:'Todas',exact:true}).click();
    await page.getByRole('searchbox').fill('proteção');
    assert.equal(await page.locator('.feature-card:visible').count(), 1);
    const toggle = page.getByRole('switch', {name:'Proteção',exact:true});
    await toggle.uncheck();
    assert.equal(await page.evaluate(() => window.state.enabled), false);
    await toggle.check();
    await page.getByRole('searchbox').fill('^ ~ ` <script>');
    assert.equal(await page.locator('.feature-card:visible').count(), 0);
    assert.equal(await page.locator('#featureEmpty').isVisible(), true);
    await page.getByRole('searchbox').fill('');
    assert.equal(await page.locator('.feature-card:visible').count(), count);
    await page.getByRole('searchbox').blur();
    fs.mkdirSync(path.join(__dirname, '../outputs'), { recursive: true });
    await page.screenshot({ path: path.join(__dirname, '../outputs/popup-1.4.14.png') });
    assert.deepEqual(errors, []);
    assert.equal(remote, 0);
  } finally { await browser.close(); }
});
