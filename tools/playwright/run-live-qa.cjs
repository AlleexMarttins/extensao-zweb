const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const workspaceRoot = path.resolve(__dirname, '..', '..');
const sessionPath = path.join(workspaceRoot, '.codex-playwright-session.json');
const debugUrl = 'http://127.0.0.1:9222';

function infoStyleInPage() {
  return `
    const infoStyle = (el) => {
      if (!el) return null;
      const style = getComputedStyle(el);
      return {
        text: (el.innerText || el.textContent || el.value || '').trim(),
        display: style.display,
        visibility: style.visibility,
        opacity: style.opacity,
        pointerEvents: style.pointerEvents,
        disabledAttr: el.getAttribute('disabled'),
        readonlyAttr: el.getAttribute('readonly'),
        title: el.getAttribute('title'),
        href: el.getAttribute('href') || null,
        id: el.id || null,
        aria: el.getAttribute('aria-label') || null
      };
    };
  `;
}

async function expandItemsAccordion(page) {
  const itemsToggle = page.locator('button').filter({ hasText: /^Itens/ }).first();
  if (await itemsToggle.count()) {
    await itemsToggle.click({ force: true });
    await page.waitForTimeout(2500);
  }
}

async function findVisibleDavSearchInputId(page) {
  return page.locator('input.multiselect__input').evaluateAll(elements => {
    const target = elements.find(el => {
      const visible = !!(el.offsetWidth || el.offsetHeight || el.getClientRects().length);
      const controls = el.getAttribute('aria-controls') || '';
      const aria = el.getAttribute('aria-label') || '';
      return visible && controls.startsWith('listbox-z-select-') && aria.includes('searchbox');
    });
    return target ? target.id : null;
  });
}

async function captureUnitChecks(page) {
  await page.goto('https://zweb.com.br/#/register/stock/unit-of-measure', {
    waitUntil: 'domcontentloaded',
    timeout: 45000
  });
  await page.waitForTimeout(4000);

  return page.evaluate(`
    (() => {
      ${infoStyleInPage()}

      const create = document.querySelector('a#grid\\\\.primaryButton, a[id="grid.primaryButton"]');
      const editIcon = document.querySelector('a[aria-label="Abrir"]');
      const deleteIcon = document.querySelector('a[aria-label="Excluir"]');
      const menuUnit = document.querySelector('a[href="#/register/stock/unit-of-measure"]');
      const blockedStockLinks = [
        '#/register/stock/service',
        '#/register/stock/kit',
        '#/register/stock/price-table',
        '#/register/stock/variation',
        '#/register/stock/group'
      ]
        .map(href => document.querySelector(\`a[href="\${href}"]\`))
        .filter(Boolean)
        .map(el => infoStyle(el));

      return {
        url: location.href,
        title: document.title,
        create: infoStyle(create),
        editIcon: infoStyle(editIcon),
        deleteIcon: infoStyle(deleteIcon),
        menuUnit: infoStyle(menuUnit),
        blockedStockLinks
      };
    })()
  `);
}

async function testBlockedInteractions(page) {
  await page.goto('https://zweb.com.br/#/register/stock/unit-of-measure', {
    waitUntil: 'domcontentloaded',
    timeout: 45000
  });
  await page.waitForTimeout(4000);

  const hasRow = await page.locator('.table-row').nth(1).count();
  if (!hasRow) {
    return { skipped: true, reason: 'Nenhuma linha de grid encontrada.' };
  }

  await page.evaluate(() => {
    window.__zwebBlockProbe = { dblclickSeen: false, contextmenuSeen: false };
    document.addEventListener('dblclick', () => {
      window.__zwebBlockProbe.dblclickSeen = true;
    }, true);
    document.addEventListener('contextmenu', () => {
      window.__zwebBlockProbe.contextmenuSeen = true;
    }, true);
  });

  const row = page.locator('.table-row').nth(1);
  const beforeUrl = page.url();
  await row.dblclick({ force: true });
  await page.waitForTimeout(1500);
  const afterDblClickUrl = page.url();

  await row.click({ button: 'right', force: true });
  await page.waitForTimeout(500);

  const probe = await page.evaluate(() => window.__zwebBlockProbe);

  return {
    beforeUrl,
    afterDblClickUrl,
    urlChangedOnDblClick: beforeUrl !== afterDblClickUrl,
    probe
  };
}

async function testPopup(browser, extensionId, unitPage) {
  const context = browser.contexts()[0];
  const popupPage = await context.newPage();
  await popupPage.goto(`chrome-extension://${extensionId}/popup.html`, {
    waitUntil: 'domcontentloaded',
    timeout: 20000
  });
  await popupPage.waitForSelector('#toggleEnabled');

  const initial = {
    checked: await popupPage.locator('#toggleEnabled').isChecked(),
    status: await popupPage.locator('#status').innerText()
  };

  await popupPage.locator('#toggleEnabled').uncheck();
  await popupPage.waitForFunction(() => document.querySelector('#status')?.textContent?.includes('desativado'));
  await unitPage.waitForTimeout(7000);

  const disabledState = await unitPage.evaluate(`
    (() => {
      ${infoStyleInPage()}
      const create = document.querySelector('a#grid\\\\.primaryButton, a[id="grid.primaryButton"]');
      return infoStyle(create);
    })()
  `);

  await popupPage.locator('#toggleEnabled').check();
  await popupPage.waitForFunction(() => document.querySelector('#status')?.textContent?.includes('ativo'));
  await unitPage.waitForTimeout(5000);

  const reenabledState = await unitPage.evaluate(`
    (() => {
      ${infoStyleInPage()}
      const create = document.querySelector('a#grid\\\\.primaryButton, a[id="grid.primaryButton"]');
      return infoStyle(create);
    })()
  `);

  for (const page of context.pages()) {
    if ((page.url() || '').includes('#/register/stock/product')) {
      await page.close().catch(() => {});
    }
  }

  const reloadTarget = await context.newPage();
  await reloadTarget.goto('https://zweb.com.br/#/register/stock/product', {
    waitUntil: 'domcontentloaded',
    timeout: 45000
  });
  await reloadTarget.waitForTimeout(4000);
  await reloadTarget.evaluate(() => {
    window.__codexReloadMarker = 'alive';
  });

  await popupPage.evaluate(() => {
    const origQuery = chrome.tabs.query.bind(chrome.tabs);
    chrome.tabs.query = (queryInfo, cb) => {
      origQuery({}, tabs => {
        const target = (tabs || []).find(t => (t.url || '').includes('#/register/stock/product'));
        cb(target ? [target] : (tabs || []).slice(0, 1));
      });
    };
  });

  await popupPage.locator('#reload').click({ force: true });
  await reloadTarget.waitForTimeout(6000);
  const markerAfterReload = await reloadTarget.evaluate(() => window.__codexReloadMarker || null).catch(() => null);

  await reloadTarget.close().catch(() => {});
  await popupPage.close().catch(() => {});

  return {
    initial,
    disabledState,
    reenabledState,
    reloadButtonE2E: {
      attempted: true,
      markerAfterReload
    }
  };
}

async function captureProductChecks(page) {
  await page.goto('https://zweb.com.br/#/register/stock/product', {
    waitUntil: 'domcontentloaded',
    timeout: 45000
  });
  await page.waitForTimeout(4000);

  return page.evaluate(`
    (() => {
      ${infoStyleInPage()}
      const create = Array.from(document.querySelectorAll('a,button')).find(el =>
        /cadastrar produto/i.test((el.innerText || el.textContent || '').trim())
      );
      const editIcon = document.querySelector('a[aria-label="Abrir"]');
      const deleteIcon = document.querySelector('a[aria-label="Excluir"]');
      return {
        url: location.href,
        title: document.title,
        create: infoStyle(create),
        editIcon: infoStyle(editIcon),
        deleteIcon: infoStyle(deleteIcon)
      };
    })()
  `);
}

async function captureDavBasics(page, route) {
  await page.goto(route, {
    waitUntil: 'domcontentloaded',
    timeout: 45000
  });
  await page.waitForTimeout(5000);
  await expandItemsAccordion(page);

  return page.evaluate(`
    (() => {
      ${infoStyleInPage()}

      const price = document.getElementById('itemForm.price');
      const search = Array.from(document.querySelectorAll('input.multiselect__input')).find(el => {
        const visible = !!(el.offsetWidth || el.offsetHeight || el.getClientRects().length);
        const controls = el.getAttribute('aria-controls') || '';
        const aria = el.getAttribute('aria-label') || '';
        return visible && controls.startsWith('listbox-z-select-') && aria.includes('searchbox');
      });
      const batchToggle = document.getElementById('zweb-batch-toggle');
      const printButton = Array.from(document.querySelectorAll('button, a[role="button"]')).find(el => {
        const txt = (el.innerText || el.textContent || '').toLowerCase().normalize('NFD').replace(/[\\u0300-\\u036f]/g, '');
        return txt.includes('impressoes');
      });

      let numericNormalized = null;
      let hashTextNormalized = null;

      if (search) {
        search.value = '123';
        search.dispatchEvent(new Event('input', { bubbles: true, composed: true }));
        numericNormalized = search.value;

        search.value = '#abc';
        search.dispatchEvent(new Event('input', { bubbles: true, composed: true }));
        hashTextNormalized = search.value;
      }

      return {
        url: location.href,
        title: document.title,
        price: infoStyle(price),
        search: infoStyle(search),
        numericNormalized,
        hashTextNormalized,
        batchToggle: infoStyle(batchToggle),
        printButtonText: printButton ? (printButton.innerText || printButton.textContent || '').trim() : null,
        batchBeforePrint: !!(batchToggle && printButton && batchToggle.nextElementSibling && batchToggle.nextElementSibling.id === 'zweb-batch-spacer')
      };
    })()
  `);
}

async function testDavModal(page, route) {
  await page.goto(route, {
    waitUntil: 'domcontentloaded',
    timeout: 45000
  });
  await page.waitForTimeout(5000);
  await expandItemsAccordion(page);

  const toggle = page.locator('#zweb-batch-toggle');
  const modal = page.locator('#zweb-batch-modal');
  const backdrop = page.locator('#zweb-batch-backdrop');

  if (!(await toggle.count())) {
    return { skipped: true, reason: 'Botao Lote nao encontrado.' };
  }

  await toggle.click();
  await page.waitForTimeout(500);
  const openDisplay = await modal.evaluate(el => getComputedStyle(el).display).catch(() => null);
  await backdrop.click({ position: { x: 5, y: 5 }, force: true }).catch(() => {});
  await page.waitForTimeout(500);
  const closedDisplay = await modal.evaluate(el => getComputedStyle(el).display).catch(() => null);

  return { openDisplay, closedDisplay };
}

async function testBatchApply(page, route) {
  await page.goto(route, {
    waitUntil: 'domcontentloaded',
    timeout: 45000
  });
  await page.waitForTimeout(5000);
  await expandItemsAccordion(page);

  const inputId = await findVisibleDavSearchInputId(page);
  if (!inputId) {
    return { skipped: true, reason: 'Campo de busca de item nao encontrado.' };
  }

  const search = page.locator(`#${inputId}`);
  await search.click({ force: true });
  await search.fill('1');
  await page.waitForTimeout(2000);

  const extractedCode = await page.evaluate(currentId => {
    const input = document.getElementById(currentId);
    const controlsId = input ? input.getAttribute('aria-controls') : null;
    const list = controlsId ? document.getElementById(controlsId) : null;
    const option = list
      ? Array.from(list.querySelectorAll('[role="option"], .multiselect__option, li, .multiselect__element')).find(el =>
          !!(el.offsetWidth || el.offsetHeight || el.getClientRects().length)
        )
      : null;

    if (!option) return null;
    const text = (option.innerText || option.textContent || '').trim().replace(/\s+/g, ' ');
    const match = text.match(/(^|\s)#?\d+(?=\s+#|\s+R\$|\s+\||$)/);
    if (!match) return null;
    const raw = match[0].trim();
    return raw.startsWith('#') ? raw : `#${raw}`;
  }, inputId);

  if (!extractedCode) {
    return { skipped: true, reason: 'Opcao encontrada sem codigo numerico reconhecivel.' };
  }

  const beforeBody = await page.locator('body').innerText().catch(() => '');
  await page.locator('#zweb-batch-toggle').click();
  await page.waitForTimeout(500);
  await page.locator('#zweb-batch-modal [data-batch-codes]').fill(extractedCode);
  await page.locator('#zweb-batch-modal [data-batch-qty]').fill('1');
  await page.locator('#zweb-batch-modal [data-batch-run]').click();
  await page.waitForTimeout(12000);

  const bodyText = await page.locator('body').innerText().catch(() => '');
  const progressText = await page.locator('#zweb-batch-progress-text').innerText().catch(() => null);

  return {
    extractedCode,
    progressText,
    itemDescriptionVisible: bodyText.includes('CHAVE PUSH BUTTON'),
    totalStillZero: /Total\s+R\$\s*0,00/.test(bodyText),
    bodyDelta: bodyText.length - beforeBody.length
  };
}

async function main() {
  if (!fs.existsSync(sessionPath)) {
    throw new Error('Arquivo de sessao nao encontrado. Inicie a sessao do navegador primeiro.');
  }

  const { extensionId } = JSON.parse(fs.readFileSync(sessionPath, 'utf8'));
  const browser = await chromium.connectOverCDP(debugUrl);
  const context = browser.contexts()[0];

  const unitPage = await context.newPage();
  const productPage = await context.newPage();
  const davSalePage = await context.newPage();
  const davEstimatePage = await context.newPage();

  const results = {
    startedAt: new Date().toISOString(),
    extensionId,
    popup: null,
    unit: null,
    interactions: null,
    product: null,
    davSale: null,
    davEstimate: null,
    davModal: null,
    batchApply: null
  };

  try {
    results.unit = await captureUnitChecks(unitPage);
    results.interactions = await testBlockedInteractions(unitPage);
    results.popup = await testPopup(browser, extensionId, unitPage);
    results.product = await captureProductChecks(productPage);
    results.davSale = await captureDavBasics(davSalePage, 'https://zweb.com.br/#/document/davs/sale/new');
    results.davEstimate = await captureDavBasics(davEstimatePage, 'https://zweb.com.br/#/document/davs/estimate/new');
    results.davModal = await testDavModal(davEstimatePage, 'https://zweb.com.br/#/document/davs/estimate/new');
    results.batchApply = await testBatchApply(davEstimatePage, 'https://zweb.com.br/#/document/davs/estimate/new');
  } finally {
    await Promise.all([
      unitPage.close().catch(() => {}),
      productPage.close().catch(() => {}),
      davSalePage.close().catch(() => {}),
      davEstimatePage.close().catch(() => {})
    ]);
    await browser.close().catch(() => {});
  }

  console.log(JSON.stringify(results, null, 2));
}

main().catch(error => {
  console.error(error);
  process.exit(1);
});
