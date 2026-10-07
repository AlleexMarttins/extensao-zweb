const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const { chromium } = require('playwright');
const source = fs.readFileSync(require.resolve('../extension/nucleo/content.js'), 'utf8');
const helper = fs.readFileSync(require.resolve('../extension/nucleo/dav-recipient-model.js'), 'utf8');
const bridgeSource = fs.readFileSync(require.resolve('../extension/nucleo/page-bridge.js'), 'utf8');
const bridgeHandler = bridgeSource.slice(bridgeSource.lastIndexOf("  window.addEventListener('message', (event) => {"), bridgeSource.lastIndexOf('  window.open = function()'));
test('Chrome local: UUID correto permanece selecionado ao clicar fora, sem escrita externa', async () => {
  const browser = await chromium.launch({ headless: true, channel: 'chrome' });
  try {
    const page = await browser.newPage();
    let requests = 0;
    await page.route('**/*', route => { requests++; return route.abort(); });
    await page.setContent('<div class="multiselect"><input id="client" class="multiselect__input"></div><button id="outside">Fora</button>');
    await page.addScriptTag({ content: helper });
    await page.evaluate(() => { location.hash = '#/document/davs/sale/new/'; window.CONTENT_SOURCE = 'fixture'; });
    await page.addScriptTag({ content: bridgeHandler });
    const code = source.slice(source.indexOf('  function isTargetDavRoute()'), source.indexOf('  function isTargetDavCloneBlockRoute()'));
    await page.evaluate(code => {
      window.TARGET_DAVS_ROUTES = ['about:blank'];
      window.DAV_DEFAULT_RECIPIENT_STATE = 'idle';
      window.DAV_DEFAULT_RECIPIENT_FORM = null;
      window.getRuntimeApi = () => ({ sendMessage() {} });
      window.calls = 0;
      const nativePostMessage = window.postMessage.bind(window);
      window.postMessage = (data) => nativePostMessage(data, '*');
      window.sendRuntimeMessage = async () => { window.calls++; return { ok: true, payload: { name: 'CLIENTE BALCÃO', uuid: 'TARGET' } }; };
      const input = document.querySelector('input');
      const model = { options: [{ name: 'CLIENTE BALCÃO', uuid: 'OTHER', active: false }, { name: 'CLIENTE BALCÃO', uuid: 'TARGET', active: true }], internalValue: [], select(value) {
        this.internalValue = [value];
        const selected = document.createElement('span'); selected.className = 'multiselect__single'; selected.textContent = value.name;
        document.querySelector('.multiselect').append(selected);
      }, $nextTick: async () => {} };
      input.__vueParentComponent = { proxy: model };
      input.addEventListener('blur', () => { input.value = ''; });
      (0, eval)(code); window.ensureDefaultDavRecipient();
    }, code);
    await page.waitForFunction(() => window.DAV_DEFAULT_RECIPIENT_STATE === 'done', null, { timeout: 3000 });
    await page.locator('#outside').click();
    assert.equal(await page.locator('.multiselect__single').textContent(), 'CLIENTE BALCÃO');
    assert.equal(await page.evaluate(() => document.querySelector('input').__vueParentComponent.proxy.internalValue[0].uuid), 'TARGET');
    assert.equal(await page.evaluate(() => window.calls), 1);
    assert.equal(requests, 0);
  } finally { await browser.close(); }
});
test('Chrome local: mascara de quantidade nao converte uma unidade em dez mil', async () => {
  const browser = await chromium.launch({ headless: true, channel: 'chrome' });
  try {
    const page = await browser.newPage();
    await page.route('**/*', route => route.abort());
    await page.setContent('<input id="qty" data-zweb-dav-quantity-target="true">');
    await page.addScriptTag({ content: helper });
    await page.evaluate(() => {
      location.hash = '#/document/davs/sale/new/'; window.CONTENT_SOURCE = 'fixture';
      const send = window.postMessage.bind(window); window.postMessage = data => send(data, '*');
    });
    await page.addScriptTag({ content: bridgeHandler });
    for (const precision of [0, 2, 4]) {
      const result = await page.evaluate(async precision => {
        const input = document.querySelector('input');
        input.options = { precision, decimal: ',', separator: '.' };
        input.oninput = () => { const digits = input.value.replace(/\D/g, ''); input.unmasked = String(Number(digits) / 10 ** precision); };
        input.removeAttribute('data-zweb-dav-quantity-confirmed');
        window.postMessage({ source: 'zweb-dav-quantity-set', quantity: 1 }, '*');
        await new Promise(resolve => setTimeout(resolve, 50));
        return { model: input.unmasked, confirmed: input.getAttribute('data-zweb-dav-quantity-confirmed') };
      }, precision);
      assert.equal(result.model, '1'); assert.equal(result.confirmed, '1');
    }
  } finally { await browser.close(); }
});
test('quantidade inteira sem configuracao exposta nao vira cem e confirma apos blur', async () => {
  const browser = await chromium.launch({ headless: true, channel: 'chrome' });
  try {
    const page = await browser.newPage();
    await page.route('**/*', route => route.abort());
    await page.setContent('<input id="qty" inputmode="numeric"><button id="outside">Fora</button>');
    await page.addScriptTag({ content: helper });
    await page.evaluate(() => {
      const input = document.querySelector('input');
      input.addEventListener('input', () => { input.value = input.value.replace(/\D/g, ''); });
    });
    for (const quantity of [1, 2, 10, 100]) {
      const result = await page.evaluate(quantity => {
        const input = document.querySelector('input');
        window.ZWEB_DAV_RECIPIENT_MODEL.setQuantity(input, quantity);
        return { value: input.value, confirmed: input.getAttribute('data-zweb-dav-quantity-confirmed') };
      }, quantity);
      assert.equal(result.value, String(quantity)); assert.equal(result.confirmed, String(quantity));
      await page.locator('#outside').click();
      assert.equal(await page.locator('input').evaluate(input => input.value), String(quantity));
    }
  } finally { await browser.close(); }
});
test('Chrome sem componente Vue exposto seleciona a opcao nativa e fecha a lista', async () => {
  const browser = await chromium.launch({ headless: true, channel: 'chrome' });
  try {
    const page = await browser.newPage();
    await page.route('**/*', route => route.abort());
    await page.setContent('<div class="multiselect" role="combobox" aria-expanded="true"><input id="client" value="CLIENTE BALCÃO"><ul><li role="option"><span class="multiselect__option">CLIENTE BALCÃO</span></li></ul></div><button id="outside">Fora</button>');
    await page.addScriptTag({ content: helper });
    await page.evaluate(() => {
      const input = document.querySelector('input');
      input.addEventListener('blur', () => { input.value = ''; });
      document.querySelector('.multiselect__option').addEventListener('click', () => {
        const wrapper = document.querySelector('.multiselect');
        const single = document.createElement('span'); single.className = 'multiselect__single'; single.textContent = 'CLIENTE BALCÃO';
        wrapper.append(single); wrapper.setAttribute('aria-expanded', 'false'); document.querySelector('ul').hidden = true;
      });
    });
    assert.equal(await page.evaluate(() => window.ZWEB_DAV_RECIPIENT_MODEL.selectRecipient(document.querySelector('input'), { uuid: 'TARGET', name: 'CLIENTE BALCÃO' })), 'selected');
    await page.locator('#outside').click();
    assert.equal(await page.locator('.multiselect__single').textContent(), 'CLIENTE BALCÃO');
    assert.equal(await page.locator('.multiselect').getAttribute('aria-expanded'), 'false');
  } finally { await browser.close(); }
});
