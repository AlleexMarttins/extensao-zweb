(function() {
  'use strict';

  const IDS = ['botaoCadastrar', 'grid.primaryButton', 'grid.primaryButton'];
  const BLOCK_INPUT_IDS = ['itemForm.price'];
  const BLOCK_INPUT_SELECTORS = ['input#itemForm\\.price'];
  const TARGET_DAVS_ROUTES = [
    '/document/davs/sale/new',
    '/document/davs/estimate/new',
    '/davs/sale/new',
    '/davs/estimate/new'
  ];
  const TARGET_FISCAL_ROUTE_FRAGMENT = '/fiscal';
  const TARGET_NFE_ROUTE = '/fiscal/nfe';
  const TARGET_PRODUCT_ROUTE = '/register/stock/product';
  const TARGET_PRODUCT_NEW_ROUTE = '/register/stock/product/new';
  const TEXTS = ['Cadastrar produto', 'Cadastrar Produto', 'Cadastrar'];
  const FORCE_HIDE_TEXTS = ['Acoes', 'Ações'];
  const BLOCK_DROPDOWN_OPTIONS = [
    'servicos',
    'kit',
    'tabela de precos',
    'grade',
    'grupos'
  ];
  const CADASTROS_UNIT_SELECTOR = 'a[href="#/register/stock/unit-of-measure"]';
  const ARIA_LABELS = ['Excluir', 'Remover', 'Abrir', 'Editar'];
  const ICON_CLASSES = ['fa-pencil', 'fa-pencil-alt', 'fa-edit', 'fa-times', 'fa-trash', 'fa-trash-alt'];
  const ITEM_SEARCH_SELECTOR = 'input.multiselect__input';
  const BATCH_TOGGLE_ID = 'zweb-batch-toggle';
  const BATCH_MODAL_ID = 'zweb-batch-modal';
  const BATCH_BACKDROP_ID = 'zweb-batch-backdrop';
  const BATCH_STATUS_ID = 'zweb-batch-status';
  const BATCH_SPACER_ID = 'zweb-batch-spacer';
  const BATCH_PROGRESS_ID = 'zweb-batch-progress';
  const BATCH_PROGRESS_FILL_ID = 'zweb-batch-progress-fill';
  const BATCH_PROGRESS_TEXT_ID = 'zweb-batch-progress-text';
  const PRODUCT_PREVIEW_BUTTON_ID = 'zweb-product-preview-button';
  const NFE_ACTION_CUSTOMIZE_BUTTON_ID = 'zweb-nfe-action-customize-button';
  const NFE_ACTION_MODAL_ID = 'zweb-nfe-action-modal';
  const NFE_ACTION_BACKDROP_ID = 'zweb-nfe-action-backdrop';
  const NFE_ACTION_LIST_ID = 'zweb-nfe-action-list';
  const NFE_CONTEXT_MENU_ID = 'menuId';
  const NFE_CONTEXT_MENU_STYLE_ID = 'zweb-nfe-context-menu-style';
  const NFE_CONTEXT_MENU_MAX_HEIGHT_VH = 48;
  const NFE_CONTEXT_MENU_MARGIN_PX = 12;
  const NFE_CONTEXT_MENU_ROW_GAP_PX = 6;
  const NFE_CONTEXT_MENU_ANCHOR_TTL_MS = 1800;
  const ACTION_MENU_PREFS_STORAGE_KEY = 'actionMenuPrefs';
  const ACTION_MENU_HIDDEN_ATTR = 'data-zweb-hidden-action-menu-item';
  const ACTION_MENU_HIDDEN_SEPARATOR_ATTR = 'data-zweb-hidden-action-menu-separator';
  const PRODUCT_TOOLBAR_SEARCH_SELECTOR = 'input#search\\.value.grid-toolbar-search';
  const PRODUCT_GRID_STORAGE_KEY = 'z_theme_config_grid';
  const PRODUCT_FILTER_OPTION_HIDDEN_ATTR = 'data-zweb-hidden-by-column-filter';
  const XML_BRIDGE_SCRIPT_ID = 'zweb-xml-download-page-bridge';
  const XML_CONTENT_SOURCE = 'zweb-xml-content-script';
  const XML_BRIDGE_SOURCE = 'zweb-xml-page-bridge';
  const KNOWN_NFE_ACTION_ITEMS = [
    'Enviar XML por e-mail',
    'Cancelar',
    'Carta de Corre\u00e7\u00e3o',
    'Evento de Concilia\u00e7\u00e3o Financeira - ECONF',
    'Ator interessado',
    'Consultar pela chave',
    'Protocolar recibo',
    'Visualizar DANFE',
    'Imprimir DANFE no Terminal Zweb',
    'Gerar boleto',
    'Enviar e-mail',
    'Gerar XML',
    'Clonar NF-e',
    'Reenviar XML ao minhas notas',
    'Enviar NF-e pelo whatsapp',
    'Devolu\u00e7\u00e3o',
    'Retorno',
    'Etiquetas',
    'Emitir MDF-e'
  ];
  const FEATURE_DEFAULTS = globalThis.ZWEB_FEATURES && typeof globalThis.ZWEB_FEATURES.getDefaults === 'function'
    ? globalThis.ZWEB_FEATURES.getDefaults()
      : {
        enabled: true,
        filterEnabled: true,
        productPreviewEnabled: true,
        lowStockHighlightEnabled: true,
        itemSearchHashEnabled: true,
        batchEnabled: true,
        xmlDownloadEnabled: true,
        actionMenuCustomizeEnabled: true
      };

  const FEATURE_STATE = Object.assign({}, FEATURE_DEFAULTS);
  let ACTION_MENU_PREFS = {};
  let BATCH_RUNNING = false;
  let LAST_XML_DOWNLOAD_ARM_AT = 0;
  let LAST_NFE_CONTEXT_MENU_ANCHOR = null;
  const PRODUCT_LOW_STOCK_ATTR = 'data-zweb-low-stock-highlight';
  const PRODUCT_LOW_STOCK_STYLE_ID = 'zweb-low-stock-style';

  function isFeatureEnabled(key) {
    return FEATURE_STATE[key] !== false;
  }

  function applyFeatureState(nextState) {
    const normalized = globalThis.ZWEB_FEATURES && typeof globalThis.ZWEB_FEATURES.normalizeState === 'function'
      ? globalThis.ZWEB_FEATURES.normalizeState(nextState)
      : Object.assign({}, FEATURE_DEFAULTS, nextState || {});

    Object.keys(FEATURE_DEFAULTS).forEach((key) => {
      FEATURE_STATE[key] = normalized[key] !== false;
    });
  }

  function isDocumentRoute() {
    const href = (location.href || '').toLowerCase();
    return href.indexOf('/document/') !== -1;
  }

  function getRuntimeApi() {
    if (typeof chrome === 'undefined' || !chrome || !chrome.runtime) return null;
    return chrome.runtime;
  }

  function isTargetDavRoute() {
    const href = (location.href || '').toLowerCase();
    return TARGET_DAVS_ROUTES.some(route => href.indexOf(route) !== -1);
  }

  function isTargetProductRoute() {
    const href = (location.href || '').toLowerCase();
    return href.indexOf(TARGET_PRODUCT_ROUTE) !== -1 && href.indexOf(TARGET_PRODUCT_NEW_ROUTE) === -1;
  }

  function isFiscalRoute() {
    const href = (location.href || '').toLowerCase();
    return href.indexOf(TARGET_FISCAL_ROUTE_FRAGMENT) !== -1;
  }

  function isTargetNfeRoute() {
    const href = (location.href || '').toLowerCase();
    return href.indexOf(TARGET_NFE_ROUTE) !== -1;
  }

  function shouldPreserveForceHideText(normalizedText) {
    if (!normalizedText) return false;
    if (!isTargetNfeRoute()) return false;
    return FORCE_HIDE_TEXTS.some(t => normalizedText.indexOf(normalizeText(t)) !== -1);
  }

  function shouldBlockSpecificInput(input) {
    if (!input) return false;
    if (!isTargetDavRoute()) return false;

    const byId = input.id && BLOCK_INPUT_IDS.includes(input.id);
    const bySelector = BLOCK_INPUT_SELECTORS.some(selector => input.matches && input.matches(selector));
    return byId || bySelector;
  }

  function normalizeText(value) {
    return (value || '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim();
  }

  function isTargetItemSearchInput(el) {
    if (!el || !el.matches || !el.matches(ITEM_SEARCH_SELECTOR)) return false;
    if (!isTargetDavRoute()) return false;

    const ariaControls = el.getAttribute('aria-controls') || '';
    const ariaLabel = el.getAttribute('aria-label') || '';
    return ariaControls.indexOf('listbox-z-select-') === 0 && ariaLabel.indexOf('searchbox') !== -1;
  }

  function setInputValueAndNotify(input, nextValue) {
    const descriptor = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value');
    if (descriptor && descriptor.set) {
      descriptor.set.call(input, nextValue);
    } else {
      input.value = nextValue;
    }
    input.dispatchEvent(new Event('input', { bubbles: true, composed: true }));
    input.dispatchEvent(new Event('change', { bubbles: true }));
  }

  async function typeInputLikeUser(input, text, stepDelay) {
    if (!input) return;
    const nextText = String(text == null ? '' : text);
    const descriptor = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value');
    const setter = descriptor && descriptor.set ? descriptor.set : null;

    input.focus();
    if (setter) setter.call(input, '');
    else input.value = '';
    input.dispatchEvent(new Event('input', { bubbles: true, composed: true }));

    let acc = '';
    for (const ch of nextText) {
      acc += ch;
      if (setter) setter.call(input, acc);
      else input.value = acc;
      input.dispatchEvent(new Event('input', { bubbles: true, composed: true }));
      if (stepDelay) await delay(stepDelay);
    }

    input.dispatchEvent(new Event('change', { bubbles: true }));
  }

  function normalizeItemSearchValue(e) {
    if (!isFeatureEnabled('itemSearchHashEnabled')) return;
    const input = e && e.target;
    if (!isTargetItemSearchInput(input)) return;

    const current = (input.value || '').trim();

    if (/^\d+$/.test(current)) {
      setInputValueAndNotify(input, '#' + current);
      return;
    }

    if (current.charAt(0) === '#') {
      const rest = current.slice(1);
      if (!/^\d+$/.test(rest)) {
        setInputValueAndNotify(input, rest);
      }
    }
  }

  function findXmlDownloadTrigger(target) {
    let el = target;
    for (let i = 0; i < 6 && el; i += 1, el = el.parentElement) {
      if (!el) break;
      const text = normalizeText(el.innerText || el.textContent || '');
      if (text === 'gerar xml') return el;
    }
    return null;
  }

  function createXmlDownloadRequestId() {
    return ['xml', Date.now(), Math.random().toString(36).slice(2, 8)].join('-');
  }

  function ensureXmlPopupBridge() {
    if (!isFeatureEnabled('xmlDownloadEnabled')) return;
    if (!isFiscalRoute()) return;
    if (document.getElementById(XML_BRIDGE_SCRIPT_ID)) return;
    const runtime = getRuntimeApi();
    if (!runtime || typeof runtime.getURL !== 'function') return;

    const parent = document.head || document.documentElement;
    if (!parent) return;

    const script = document.createElement('script');
    script.id = XML_BRIDGE_SCRIPT_ID;
    script.src = runtime.getURL('page-bridge.js');
    script.async = false;
    parent.appendChild(script);
  }

  function forwardXmlBridgePayload(payload) {
    if (!isFeatureEnabled('xmlDownloadEnabled')) return;
    const runtime = getRuntimeApi();
    if (!runtime || typeof runtime.sendMessage !== 'function') return;

    try {
      runtime.sendMessage(payload);
    } catch (err) {}
  }

  function handleXmlBridgeMessage(event) {
    if (!isFeatureEnabled('xmlDownloadEnabled')) return;
    if (event.source !== window) return;

    const data = event && event.data;
    if (!data || data.source !== XML_BRIDGE_SOURCE || !data.requestId) return;

    if (data.type === 'xml-popup-url' && typeof data.url === 'string' && data.url) {
      forwardXmlBridgePayload({
        type: 'xml-download-url',
        requestId: data.requestId,
        url: data.url,
        title: data.title || ''
      });
      return;
    }

    if (data.type === 'xml-popup-content' && typeof data.content === 'string' && data.content) {
      forwardXmlBridgePayload({
        type: 'xml-download-content',
        requestId: data.requestId,
        content: data.content,
        title: data.title || ''
      });
    }
  }

  function armXmlDownloadFlow(e) {
    if (!isFeatureEnabled('xmlDownloadEnabled')) return;
    if (!isFiscalRoute()) return;

    const trigger = findXmlDownloadTrigger(e && e.target);
    if (!trigger) return;

    const nowAt = Date.now();
    if ((nowAt - LAST_XML_DOWNLOAD_ARM_AT) < 800) return;
    LAST_XML_DOWNLOAD_ARM_AT = nowAt;

    const requestId = createXmlDownloadRequestId();
    const runtime = getRuntimeApi();
    ensureXmlPopupBridge();

    if (runtime && typeof runtime.sendMessage === 'function') {
      try {
        runtime.sendMessage({ type: 'xml-download-arm', requestId: requestId });
      } catch (err) {}
    }

    try {
      window.postMessage({
        source: XML_CONTENT_SOURCE,
        type: 'arm-xml-download',
        requestId: requestId
      }, '*');
    } catch (err) {}
  }

  function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  function isVisible(el) {
    if (!el) return false;
    const style = window.getComputedStyle(el);
    if (style.display === 'none' || style.visibility === 'hidden') return false;
    return !!(el.offsetWidth || el.offsetHeight || el.getClientRects().length);
  }

  function normalizeBatchCode(code) {
    const value = (code || '').trim();
    if (!value) return '';
    return /^\d+$/.test(value) ? ('#' + value) : value;
  }

  function findMainSearchInput() {
    const inputs = Array.from(document.querySelectorAll(ITEM_SEARCH_SELECTOR));
    return inputs.find(input => isTargetItemSearchInput(input) && isVisible(input)) || null;
  }

  function findQuantityInput() {
    const selectors = [
      'input#itemForm\\.quantity',
      'input[id*="quantity"]',
      'input[name*="quantity"]',
      'input[aria-label*="uant"]',
      'input[placeholder*="uant"]'
    ];

    for (const selector of selectors) {
      const input = document.querySelector(selector);
      if (!input || !isVisible(input)) continue;
      if (input.matches(ITEM_SEARCH_SELECTOR)) continue;
      return input;
    }

    return null;
  }

  function findAddButton() {
    const preferred = Array.from(document.querySelectorAll(
      '#items .mt-3 > button, #items button.btn.btn-transparent.btn-sm.px-3, #items #icon-add'
    ));

    for (const el of preferred) {
      const button = el.tagName === 'BUTTON' ? el : el.closest('button');
      if (!button || !isVisible(button)) continue;
      return button;
    }

    const icon = document.getElementById('icon-add');
    if (icon) {
      const button = icon.closest('button');
      if (button && isVisible(button)) return button;
    }

    const buttons = Array.from(document.querySelectorAll('button.btn.btn-transparent.btn-sm.px-3, button.btn-transparent'));
    return buttons.find(btn => isVisible(btn) && !!btn.querySelector('#icon-add, .font-icon-add')) || null;
  }

  function findFirstSearchResult(input, term) {
    if (!input) return null;
    const normalizedTerm = normalizeText((term || '').replace(/^#/, ''));

    function pickBest(container) {
      if (!container) return null;
      const options = Array.from(container.querySelectorAll(
        '[role="option"]:not(.multiselect__option--disabled), ' +
        '.multiselect__option:not(.multiselect__option--disabled), ' +
        'li:not(.multiselect__option--disabled), ' +
        '.multiselect__element:not(.multiselect__option--disabled)'
      )).filter(isVisible);
      if (!options.length) return null;
      if (!normalizedTerm) return options[0];

      const exact = options.find(opt => {
        const t = normalizeText(opt.innerText || opt.textContent || '');
        return t.indexOf(normalizedTerm) !== -1;
      });
      return exact || options[0];
    }

    const controlsId = input.getAttribute('aria-controls');
    if (controlsId) {
      const list = document.getElementById(controlsId);
      const option = pickBest(list);
      if (option) return option;
    }

    const fallbackList = document.querySelector(
      '.multiselect__content-wrapper[style*="display"], .multiselect__content-wrapper'
    );
    return pickBest(fallbackList);
  }

  async function waitForSearchResult(input, term, timeoutMs) {
    const timeout = timeoutMs || 3500;
    const start = Date.now();
    while (Date.now() - start < timeout) {
      const option = findFirstSearchResult(input, term);
      if (option && isVisible(option)) return option;
      await delay(100);
    }
    return null;
  }

  async function waitForEnabledAddButton(timeoutMs) {
    const timeout = timeoutMs || 4000;
    const start = Date.now();
    while (Date.now() - start < timeout) {
      const btn = findAddButton();
      if (btn && isVisible(btn) && !btn.disabled && !btn.hasAttribute('disabled')) return btn;
      await delay(100);
    }
    return null;
  }

  function clickLikeUser(el) {
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = rect.left + Math.max(1, Math.floor(rect.width / 2));
    const y = rect.top + Math.max(1, Math.floor(rect.height / 2));
    const common = {
      bubbles: true,
      cancelable: true,
      view: window,
      button: 0,
      buttons: 1,
      clientX: x,
      clientY: y
    };

    if (typeof window.PointerEvent === 'function') {
      el.dispatchEvent(new PointerEvent('pointerdown', common));
    }
    el.dispatchEvent(new MouseEvent('mousedown', common));
    el.dispatchEvent(new MouseEvent('mouseup', common));
    if (typeof window.PointerEvent === 'function') {
      el.dispatchEvent(new PointerEvent('pointerup', common));
    }
    el.dispatchEvent(new MouseEvent('click', common));
    if (typeof el.click === 'function') el.click();
  }

  function clickOptionWithFallback(option) {
    if (!option) return;
    const targets = [
      option,
      option.querySelector ? option.querySelector('[role="option"]') : null,
      option.querySelector ? option.querySelector('.multiselect__option') : null,
      option.firstElementChild || null
    ].filter(Boolean);

    const seen = new Set();
    for (const target of targets) {
      if (seen.has(target)) continue;
      seen.add(target);
      clickLikeUser(target);
    }
  }

  function dispatchEnter(input) {
    if (!input) return;
    const eventInit = {
      bubbles: true,
      cancelable: true,
      key: 'Enter',
      code: 'Enter',
      keyCode: 13,
      which: 13
    };
    input.dispatchEvent(new KeyboardEvent('keydown', eventInit));
    input.dispatchEvent(new KeyboardEvent('keypress', eventInit));
    input.dispatchEvent(new KeyboardEvent('keyup', eventInit));
  }

  async function ensureDescriptionConfirmed(input, normalizedCode) {
    const quick = await waitForEnabledAddButton(900);
    if (quick) return;

    let option = await waitForSearchResult(input, normalizedCode, 1400);
    if (option) {
      option.scrollIntoView({ block: 'nearest' });
      clickOptionWithFallback(option);
      await delay(180);
    }

    dispatchEnter(input);
    await delay(120);

    const qtyInput = findQuantityInput();
    if (qtyInput) {
      qtyInput.focus();
      qtyInput.dispatchEvent(new Event('focus', { bubbles: true }));
      await delay(100);
    } else {
      input.blur();
      await delay(100);
    }

    const second = await waitForEnabledAddButton(1600);
    if (second) return;

    option = await waitForSearchResult(input, normalizedCode, 1200);
    if (option) {
      clickLikeUser(option);
      await delay(180);
    }
  }

  async function addSingleItemInBatch(code, quantityRaw, quantityNumber) {
    const input = findMainSearchInput();
    if (!input) throw new Error('Campo de busca de item nao encontrado');

    const normalizedCode = normalizeBatchCode(code);

    await typeInputLikeUser(input, normalizedCode, 35);
    await delay(250);

    const option = await waitForSearchResult(input, normalizedCode, 5000);
    if (option) {
      option.scrollIntoView({ block: 'nearest' });
      clickOptionWithFallback(option);
    } else {
      throw new Error('Nenhum resultado encontrado para ' + normalizedCode);
    }

    await ensureDescriptionConfirmed(input, normalizedCode);
    await delay(220);

    const qtyInput = findQuantityInput();
    if (qtyInput) {
      await typeInputLikeUser(qtyInput, quantityRaw, 30);
      await delay(90);
      const got = parseQuantityFromField(qtyInput.value || '');
      if (got && quantityNumber && quantityNumber >= 1 && got < 0.1) {
        setInputValueAndNotify(qtyInput, String(quantityNumber));
      }
      qtyInput.dispatchEvent(new Event('blur', { bubbles: true }));
      await delay(140);
    }

    const addButton = await waitForEnabledAddButton(7500);
    if (!addButton) throw new Error('Botao adicionar nao habilitou para ' + normalizedCode);

    clickLikeUser(addButton);
    const confirmed = await waitForItemConfirmation(normalizedCode, 4500);
    if (!confirmed) throw new Error('Item nao confirmou apos clicar adicionar para ' + normalizedCode);
    await delay(120);
  }

  function updateBatchStatus(text) {
    const status = document.getElementById(BATCH_STATUS_ID);
    if (status) status.textContent = text || '';
  }

  function removeBatchUi() {
    const toggle = document.getElementById(BATCH_TOGGLE_ID);
    const modal = document.getElementById(BATCH_MODAL_ID);
    const backdrop = document.getElementById(BATCH_BACKDROP_ID);
    const status = document.getElementById(BATCH_STATUS_ID);
    const spacer = document.getElementById(BATCH_SPACER_ID);
    const progress = document.getElementById(BATCH_PROGRESS_ID);
    if (toggle) toggle.remove();
    if (modal) modal.remove();
    if (backdrop) backdrop.remove();
    if (status) status.remove();
    if (spacer) spacer.remove();
    if (progress) progress.remove();
  }

  function removeProductPreviewButton() {
    const button = document.getElementById(PRODUCT_PREVIEW_BUTTON_ID);
    if (button) button.remove();
  }

  function parseJson(raw) {
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch (e) {
      return null;
    }
  }

  function dedupeTextList(values) {
    const seen = new Set();
    const result = [];

    values.forEach(value => {
      const text = (value || '').trim();
      const key = normalizeText(text);
      if (!text || !key || seen.has(key)) return;
      seen.add(key);
      result.push(text);
    });

    return result;
  }

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function getNfeContextMenuPopup() {
    const popup = document.getElementById(NFE_CONTEXT_MENU_ID);
    return popup && isVisible(popup) ? popup : null;
  }

  function ensureNfeContextMenuStyle() {
    if (!isTargetNfeRoute()) return;
    if (document.getElementById(NFE_CONTEXT_MENU_STYLE_ID)) return;

    const style = document.createElement('style');
    style.id = NFE_CONTEXT_MENU_STYLE_ID;
    style.textContent = [
      '#' + NFE_CONTEXT_MENU_ID + ' {',
      '  overflow: visible !important;',
      '}',
      '#' + NFE_CONTEXT_MENU_ID + ' > ul.dropdown-menu,',
      '#' + NFE_CONTEXT_MENU_ID + ' .dropdown-menu {',
      '  max-height: ' + NFE_CONTEXT_MENU_MAX_HEIGHT_VH + 'vh !important;',
      '  overflow-y: auto !important;',
      '  overflow-x: hidden !important;',
      '  overscroll-behavior: contain !important;',
      '}'
    ].join('\n');

    (document.head || document.documentElement || document.body).appendChild(style);
  }

  function findActiveNfeActionRow() {
    const markedRows = Array.from(document.querySelectorAll('.table-row.marked-row'))
      .filter((row) => !row.classList.contains('header') && isVisible(row));

    if (markedRows.length) return markedRows[markedRows.length - 1];

    const checkedRows = Array.from(document.querySelectorAll('.table-row input[type="checkbox"]:checked'))
      .map((input) => input.closest('.table-row'))
      .filter((row) => row && !row.classList.contains('header') && isVisible(row));

    return checkedRows.length ? checkedRows[checkedRows.length - 1] : null;
  }

  function findNfeContextMenuRow(target) {
    if (!target) return null;
    if (target.closest) {
      const row = target.closest('.table-row');
      if (row && !row.classList.contains('header')) return row;
    }

    let el = target;
    while (el) {
      if (el.classList && el.classList.contains('table-row') && !el.classList.contains('header')) {
        return el;
      }
      el = el.parentElement;
    }

    return null;
  }

  function rememberNfeContextMenuAnchor(event) {
    if (!isTargetNfeRoute()) return;
    const row = findNfeContextMenuRow(event && event.target);
    if (!row) return;

    const rect = row.getBoundingClientRect();
    LAST_NFE_CONTEXT_MENU_ANCHOR = {
      x: Math.round(event.clientX || rect.left || 0),
      y: Math.round(event.clientY || rect.top || 0),
      rowTop: Math.round(rect.top || 0),
      rowBottom: Math.round(rect.bottom || 0),
      rowHeight: Math.round(rect.height || 0),
      at: Date.now()
    };

    scheduleNfeContextMenuPopupPosition();
  }

  function rememberNfeContextMenuAnchorFromMouse(event) {
    if (!event || event.button !== 2) return;
    rememberNfeContextMenuAnchor(event);
  }

  function scheduleNfeContextMenuPopupPosition() {
    [0, 40, 120, 240, 420, 700].forEach((delayMs) => {
      setTimeout(positionNfeContextMenuPopup, delayMs);
    });

    requestAnimationFrame(() => {
      requestAnimationFrame(positionNfeContextMenuPopup);
    });
  }

  function positionNfeContextMenuPopup() {
    if (!isTargetNfeRoute()) return;

    const popup = getNfeContextMenuPopup();
    if (!popup) return;

    ensureNfeContextMenuStyle();

    const innerMenu = popup.querySelector(':scope > ul.dropdown-menu, .dropdown-menu');
    if (innerMenu) {
      innerMenu.style.setProperty('max-height', NFE_CONTEXT_MENU_MAX_HEIGHT_VH + 'vh', 'important');
      innerMenu.style.setProperty('overflow-y', 'auto', 'important');
      innerMenu.style.setProperty('overflow-x', 'hidden', 'important');
    }

    popup.style.setProperty('position', 'fixed', 'important');
    popup.style.setProperty('overflow', 'visible', 'important');
    popup.style.setProperty('max-height', 'calc(100vh - ' + (NFE_CONTEXT_MENU_MARGIN_PX * 2) + 'px)', 'important');
    popup.style.setProperty('z-index', '999997', 'important');
    popup.style.setProperty('right', 'auto', 'important');
    popup.style.setProperty('bottom', 'auto', 'important');
    popup.style.setProperty('transform', 'none', 'important');

    const activeRow = findActiveNfeActionRow();
    const activeRect = activeRow ? activeRow.getBoundingClientRect() : null;
    const popupRect = popup.getBoundingClientRect();
    const recentAnchor = LAST_NFE_CONTEXT_MENU_ANCHOR
      && (Date.now() - LAST_NFE_CONTEXT_MENU_ANCHOR.at) <= NFE_CONTEXT_MENU_ANCHOR_TTL_MS
      ? LAST_NFE_CONTEXT_MENU_ANCHOR
      : null;
    const anchor = recentAnchor || {
      x: Math.round(popupRect.left || 0),
      y: Math.round(popupRect.top || 0),
      rowTop: activeRect ? Math.round(activeRect.top || 0) : Math.round(popupRect.top || 0),
      rowBottom: activeRect ? Math.round(activeRect.bottom || 0) : Math.round(popupRect.bottom || 0),
      rowHeight: activeRect ? Math.round(activeRect.height || 0) : 0,
      at: Date.now()
    };

    if (!recentAnchor && activeRect) {
      anchor.rowTop = Math.round(activeRect.top || 0);
      anchor.rowBottom = Math.round(activeRect.bottom || 0);
      anchor.rowHeight = Math.round(activeRect.height || 0);
    }

    const width = popupRect.width || popup.offsetWidth || 280;
    const height = popupRect.height || popup.offsetHeight || 0;
    const viewportWidth = window.innerWidth || document.documentElement.clientWidth || 0;
    const viewportHeight = window.innerHeight || document.documentElement.clientHeight || 0;
    const maxLeft = Math.max(NFE_CONTEXT_MENU_MARGIN_PX, viewportWidth - width - NFE_CONTEXT_MENU_MARGIN_PX);
    const maxTop = Math.max(NFE_CONTEXT_MENU_MARGIN_PX, viewportHeight - height - NFE_CONTEXT_MENU_MARGIN_PX);
    const currentLeft = Math.round(popupRect.left || anchor.x || 0);
    const desiredLeft = clamp(currentLeft, NFE_CONTEXT_MENU_MARGIN_PX, maxLeft);
    const preferredTop = anchor.rowTop - NFE_CONTEXT_MENU_ROW_GAP_PX;
    const upwardTop = anchor.rowBottom - height + NFE_CONTEXT_MENU_ROW_GAP_PX;
    let desiredTop = preferredTop;

    if (height && (preferredTop + height + NFE_CONTEXT_MENU_MARGIN_PX) > viewportHeight) {
      desiredTop = upwardTop;
    }

    desiredTop = clamp(desiredTop, NFE_CONTEXT_MENU_MARGIN_PX, maxTop);

    popup.style.setProperty('left', desiredLeft + 'px', 'important');
    popup.style.setProperty('top', desiredTop + 'px', 'important');
  }

  function getHiddenNfeActionItems() {
    const routePrefs = ACTION_MENU_PREFS && ACTION_MENU_PREFS.nfe;
    const hidden = routePrefs && Array.isArray(routePrefs.hidden) ? routePrefs.hidden : [];
    return new Set(hidden.map(normalizeText).filter(Boolean));
  }

  function storeActionMenuPrefs(nextPrefs) {
    ACTION_MENU_PREFS = nextPrefs && typeof nextPrefs === 'object' ? nextPrefs : {};
    try {
      chrome.storage.local.set({ [ACTION_MENU_PREFS_STORAGE_KEY]: ACTION_MENU_PREFS });
    } catch (error) {}
  }

  function setHiddenNfeActionItems(hiddenItems) {
    const nextPrefs = Object.assign({}, ACTION_MENU_PREFS || {});
    nextPrefs.nfe = {
      hidden: dedupeTextList(hiddenItems || []).map(normalizeText).filter(Boolean)
    };
    storeActionMenuPrefs(nextPrefs);
  }

  function extractActionMenuItemLabel(item) {
    if (!item) return '';
    const preferred = item.querySelector('.label-item');
    return ((preferred && preferred.textContent) || item.textContent || '').trim();
  }

  function collectNfeActionMenuLabels() {
    const labels = KNOWN_NFE_ACTION_ITEMS.slice();
    const menus = Array.from(document.querySelectorAll(
      '.grid-toolbar.no-print .z-dropdown-menu, #menuId .dropdown-menu, #menuId, .popup .dropdown-menu'
    ));

    menus.forEach((menu) => {
      Array.from(menu.querySelectorAll('li.has-submenu, li')).forEach((item) => {
        const label = extractActionMenuItemLabel(item);
        if (label) labels.push(label);
      });
    });

    const routePrefs = ACTION_MENU_PREFS && ACTION_MENU_PREFS.nfe;
    if (routePrefs && Array.isArray(routePrefs.hidden)) {
      routePrefs.hidden.forEach((item) => labels.push(item));
    }

    return dedupeTextList(labels);
  }

  function toggleActionMenuSeparator(separator, shouldShow) {
    if (!separator) return;
    if (shouldShow) {
      separator.removeAttribute(ACTION_MENU_HIDDEN_SEPARATOR_ATTR);
      separator.style.display = '';
      return;
    }

    separator.setAttribute(ACTION_MENU_HIDDEN_SEPARATOR_ATTR, 'true');
    separator.style.display = 'none';
  }

  function syncActionMenuSeparators(menu) {
    if (!menu) return;

    const children = Array.from(menu.children);
    children.forEach((child) => {
      if (!child.matches || !child.matches('div, hr')) return;
      const isSeparator = child.classList.contains('line') || child.classList.contains('border-top') || child.tagName === 'HR';
      if (!isSeparator) return;

      let prev = child.previousElementSibling;
      while (prev && prev.style.display === 'none') prev = prev.previousElementSibling;

      let next = child.nextElementSibling;
      while (next && next.style.display === 'none') next = next.nextElementSibling;

      toggleActionMenuSeparator(child, !!(prev && next && prev.matches('li') && next.matches('li')));
    });
  }

  function restoreNfeActionMenuItems() {
    const hiddenItems = Array.from(document.querySelectorAll('[' + ACTION_MENU_HIDDEN_ATTR + ']'));
    hiddenItems.forEach((item) => {
      item.removeAttribute(ACTION_MENU_HIDDEN_ATTR);
      item.style.display = '';
    });

    const hiddenSeparators = Array.from(document.querySelectorAll('[' + ACTION_MENU_HIDDEN_SEPARATOR_ATTR + ']'));
    hiddenSeparators.forEach((item) => {
      item.removeAttribute(ACTION_MENU_HIDDEN_SEPARATOR_ATTR);
      item.style.display = '';
    });
  }

  function syncNfeActionMenuItems() {
    if (!isTargetNfeRoute() || !isFeatureEnabled('actionMenuCustomizeEnabled')) {
      restoreNfeActionMenuItems();
      return;
    }

    const hiddenLabels = getHiddenNfeActionItems();
    const menus = Array.from(document.querySelectorAll(
      '.grid-toolbar.no-print .z-dropdown-menu, #menuId .dropdown-menu, #menuId'
    ));

    if (!menus.length) return;

    menus.forEach((menu) => {
      const items = Array.from(menu.querySelectorAll(':scope > li, li.has-submenu, li'));
      items.forEach((item) => {
        const label = normalizeText(extractActionMenuItemLabel(item));
        if (!label) return;

        if (hiddenLabels.has(label)) {
          item.setAttribute(ACTION_MENU_HIDDEN_ATTR, 'true');
          item.style.display = 'none';
        } else {
          item.removeAttribute(ACTION_MENU_HIDDEN_ATTR);
          item.style.display = '';
        }
      });

      syncActionMenuSeparators(menu);
    });
  }

  function findVisibleNfeToolbar() {
    const toolbars = Array.from(document.querySelectorAll('.grid-toolbar.no-print'));
    return toolbars.find((toolbar) => {
      if (!isVisible(toolbar)) return false;
      return !!toolbar.querySelector(PRODUCT_TOOLBAR_SEARCH_SELECTOR);
    }) || null;
  }

  function removeNfeActionCustomizeUi() {
    const button = document.getElementById(NFE_ACTION_CUSTOMIZE_BUTTON_ID);
    const modal = document.getElementById(NFE_ACTION_MODAL_ID);
    const backdrop = document.getElementById(NFE_ACTION_BACKDROP_ID);
    if (button) button.remove();
    if (modal) modal.remove();
    if (backdrop) backdrop.remove();
  }

  function closeNfeActionCustomizeModal() {
    const modal = document.getElementById(NFE_ACTION_MODAL_ID);
    const backdrop = document.getElementById(NFE_ACTION_BACKDROP_ID);
    if (modal) modal.style.display = 'none';
    if (backdrop) backdrop.style.display = 'none';
  }

  function fillNfeActionCustomizeList() {
    const container = document.getElementById(NFE_ACTION_LIST_ID);
    if (!container) return;

    const labels = collectNfeActionMenuLabels();
    const hiddenItems = getHiddenNfeActionItems();
    container.textContent = '';

    labels.forEach((label) => {
      const row = document.createElement('label');
      row.style.cssText = [
        'display:flex',
        'align-items:center',
        'justify-content:space-between',
        'gap:12px',
        'padding:10px 12px',
        'border:1px solid #dbe4ec',
        'border-radius:12px',
        'background:#f8fbfd',
        'font-size:13px',
        'cursor:pointer'
      ].join(';');

      const text = document.createElement('span');
      text.textContent = label;
      text.style.color = '#203040';

      const input = document.createElement('input');
      input.type = 'checkbox';
      input.checked = !hiddenItems.has(normalizeText(label));
      input.setAttribute('data-action-label', label);

      row.appendChild(text);
      row.appendChild(input);
      container.appendChild(row);
    });
  }

  function saveNfeActionCustomizeSelection() {
    const modal = document.getElementById(NFE_ACTION_MODAL_ID);
    if (!modal) return;

    const inputs = Array.from(modal.querySelectorAll('input[data-action-label]'));
    const hidden = inputs
      .filter((input) => !input.checked)
      .map((input) => input.getAttribute('data-action-label') || '');

    setHiddenNfeActionItems(hidden);
    syncNfeActionMenuItems();
    closeNfeActionCustomizeModal();
  }

  function openNfeActionCustomizeModal() {
    const modal = document.getElementById(NFE_ACTION_MODAL_ID);
    const backdrop = document.getElementById(NFE_ACTION_BACKDROP_ID);
    if (!modal || !backdrop) return;

    fillNfeActionCustomizeList();
    backdrop.style.display = 'block';
    modal.style.display = 'block';
  }

  function ensureNfeActionCustomizeModal() {
    if (!document.body) return;

    if (!document.getElementById(NFE_ACTION_BACKDROP_ID)) {
      const backdrop = document.createElement('div');
      backdrop.id = NFE_ACTION_BACKDROP_ID;
      backdrop.style.cssText = [
        'display:none',
        'position:fixed',
        'inset:0',
        'background:rgba(12, 23, 34, 0.38)',
        'z-index:999998'
      ].join(';');
      backdrop.addEventListener('click', closeNfeActionCustomizeModal);
      document.body.appendChild(backdrop);
    }

    if (!document.getElementById(NFE_ACTION_MODAL_ID)) {
      const modal = document.createElement('div');
      modal.id = NFE_ACTION_MODAL_ID;
      modal.style.cssText = [
        'display:none',
        'position:fixed',
        'top:50%',
        'left:50%',
        'transform:translate(-50%, -50%)',
        'width:420px',
        'max-width:calc(100vw - 24px)',
        'max-height:calc(100vh - 24px)',
        'background:#ffffff',
        'border:1px solid #d5dfe8',
        'border-radius:16px',
        'box-shadow:0 18px 44px rgba(0,0,0,0.22)',
        'padding:16px',
        'z-index:999999'
      ].join(';');

      modal.innerHTML = [
        '<div style="display:flex;align-items:flex-start;justify-content:space-between;gap:16px;margin-bottom:12px;">',
        '  <div>',
        '    <strong style="display:block;font-size:16px;color:#13283d;">Personalizar A\u00e7\u00f5es</strong>',
        '    <span style="display:block;margin-top:4px;font-size:12px;color:#5b6d7d;">Escolha o que aparece no menu A\u00e7\u00f5es da NF-e, inclusive no clique direito.</span>',
        '  </div>',
        '  <button type="button" data-nfe-action-close class="btn btn-sm btn-light">x</button>',
        '</div>',
        '<div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:12px;">',
        '  <button type="button" data-nfe-action-all class="btn btn-sm btn-light">Marcar tudo</button>',
        '  <button type="button" data-nfe-action-none class="btn btn-sm btn-light">Ocultar tudo</button>',
        '</div>',
        '<div id="' + NFE_ACTION_LIST_ID + '" style="display:grid;gap:8px;max-height:380px;overflow:auto;padding-right:2px;"></div>',
        '<div style="display:flex;justify-content:flex-end;gap:8px;margin-top:14px;">',
        '  <button type="button" data-nfe-action-cancel class="btn btn-sm btn-transparent">Cancelar</button>',
        '  <button type="button" data-nfe-action-save class="btn btn-sm btn-primary">Salvar</button>',
        '</div>'
      ].join('');

      modal.querySelector('[data-nfe-action-close]').addEventListener('click', closeNfeActionCustomizeModal);
      modal.querySelector('[data-nfe-action-cancel]').addEventListener('click', closeNfeActionCustomizeModal);
      modal.querySelector('[data-nfe-action-save]').addEventListener('click', saveNfeActionCustomizeSelection);
      modal.querySelector('[data-nfe-action-all]').addEventListener('click', () => {
        modal.querySelectorAll('input[data-action-label]').forEach((input) => {
          input.checked = true;
        });
      });
      modal.querySelector('[data-nfe-action-none]').addEventListener('click', () => {
        modal.querySelectorAll('input[data-action-label]').forEach((input) => {
          input.checked = false;
        });
      });

      document.body.appendChild(modal);
    }
  }

  function ensureNfeActionCustomizeButton() {
    if (!isTargetNfeRoute() || !isFeatureEnabled('actionMenuCustomizeEnabled')) {
      removeNfeActionCustomizeUi();
      restoreNfeActionMenuItems();
      return;
    }

    const toolbar = findVisibleNfeToolbar();
    if (!toolbar) return;

    ensureNfeActionCustomizeModal();

    const actionsContainer = toolbar.querySelector('.grid-toolbar-hidden-mobile') || toolbar;
    const visibleActionButton = Array.from(actionsContainer.querySelectorAll('button, a')).find((el) => {
      const text = normalizeText(el.innerText || el.textContent || '');
      return text === 'acoes' && isVisible(el);
    });
    const hiddenActionButton = actionsContainer.querySelector('button[id^="z-dropdown-"], .dropdown-button');
    const filterButton = actionsContainer.querySelector('button#grid\\.filter, #grid\\.filter');

    let button = document.getElementById(NFE_ACTION_CUSTOMIZE_BUTTON_ID);
    if (!button) {
      button = document.createElement('button');
      button.id = NFE_ACTION_CUSTOMIZE_BUTTON_ID;
      button.type = 'button';
      button.className = 'btn btn-sm px-3';
      button.textContent = 'Personalizar';
      button.title = 'Escolher itens visiveis do menu Acoes';
      button.style.background = '#f4f8fc';
      button.style.border = '1px solid #c9d8e6';
      button.style.color = '#1f4f7d';
      button.style.whiteSpace = 'nowrap';
      button.style.marginRight = '6px';
      button.addEventListener('click', function(event) {
        event.preventDefault();
        event.stopImmediatePropagation();
        openNfeActionCustomizeModal();
      }, true);
    }

    if (visibleActionButton) {
      if (button.parentElement !== actionsContainer || button.previousElementSibling !== visibleActionButton) {
        visibleActionButton.insertAdjacentElement('afterend', button);
      }
      return;
    }

    if (hiddenActionButton && hiddenActionButton !== button) {
      button.title = 'Escolher itens visiveis do menu Acoes';
    }

    if (filterButton) {
      if (button.parentElement !== actionsContainer || button.nextElementSibling !== filterButton) {
        filterButton.insertAdjacentElement('beforebegin', button);
      }
      return;
    }

    if (button.parentElement !== actionsContainer) {
      actionsContainer.appendChild(button);
    }
  }

  function findVisibleModalByTitle(titleText) {
    const target = normalizeText(titleText);
    if (!target) return null;

    const modals = Array.from(document.querySelectorAll('.modal.show, [role="dialog"]'));
    return modals.find(modal => {
      if (!isVisible(modal)) return false;
      const title = modal.querySelector('.modal-header h1, .modal-header h2, .modal-header h3, .modal-title');
      const text = normalizeText(title ? title.textContent : modal.textContent || '');
      return text.indexOf(target) !== -1;
    }) || null;
  }

  function getActiveProductColumnsFromStorage() {
    const config = parseJson(localStorage.getItem(PRODUCT_GRID_STORAGE_KEY));
    const headers = config && config.product && Array.isArray(config.product.headers)
      ? config.product.headers
      : [];

    return headers
      .map(header => header && (header.title || header.label || header.field))
      .filter(Boolean);
  }

  function getActiveProductColumnsFromFieldsModal() {
    const modal = findVisibleModalByTitle('Selecione as colunas para exibir');
    if (!modal) return [];

    return Array.from(modal.querySelectorAll('.header-item'))
      .filter(row => {
        const input = row.querySelector('input[type="checkbox"]');
        return !!(input && input.checked);
      })
      .map(row => {
        const name = row.querySelector('.header-name');
        return name ? name.textContent : row.textContent;
      })
      .filter(Boolean);
  }

  function getActiveProductColumnsFromGrid() {
    const headerRow = document.querySelector('.table-wrapper.table-wrapper-filter .table-row.header');
    if (!headerRow) return [];

    const cells = Array.from(headerRow.querySelectorAll('.cell.header-cell .header-text'));
    if (cells.length) {
      return cells.map(cell => cell.textContent).filter(Boolean);
    }

    return Array.from(headerRow.querySelectorAll('.cell.header-cell'))
      .map(cell => cell.textContent)
      .filter(Boolean);
  }

  function getActiveProductColumnTitles() {
    const sources = [
      getActiveProductColumnsFromStorage(),
      getActiveProductColumnsFromFieldsModal(),
      getActiveProductColumnsFromGrid()
    ];

    for (const values of sources) {
      const deduped = dedupeTextList(values);
      if (deduped.length) return deduped;
    }

    return [];
  }

  function findProductFilterModal() {
    return findVisibleModalByTitle('Filtrar');
  }

  function findProductFilterColumnMultiselect(modal) {
    if (!modal) return null;

    const labels = Array.from(modal.querySelectorAll('label'));
    const label = labels.find(el => normalizeText(el.textContent || '') === 'coluna');
    if (!label) return null;

    const container = label.parentElement || label.closest('.col-md-5, .col, .row, .form-group') || modal;
    const selectRoot = container.querySelector('.z-select') || container;
    return selectRoot.querySelector('.multiselect') || null;
  }

  function restoreProductFilterColumnOptions() {
    const hiddenOptions = Array.from(document.querySelectorAll(
      '.multiselect__content .multiselect__element[' + PRODUCT_FILTER_OPTION_HIDDEN_ATTR + ']'
    ));

    hiddenOptions.forEach(option => {
      option.removeAttribute(PRODUCT_FILTER_OPTION_HIDDEN_ATTR);
      option.style.display = '';
    });
  }

  function cleanupUiForCurrentPage() {
    if (!isFeatureEnabled('batchEnabled')) removeBatchUi();
    if (!isFeatureEnabled('productPreviewEnabled')) removeProductPreviewButton();
    if (!isFeatureEnabled('filterEnabled')) restoreProductFilterColumnOptions();
    if (!isFeatureEnabled('lowStockHighlightEnabled')) clearProductLowStockHighlight();
    if (!isFeatureEnabled('actionMenuCustomizeEnabled')) {
      removeNfeActionCustomizeUi();
      restoreNfeActionMenuItems();
    }
  }

  function syncProductFilterColumnOptions() {
    if (!isFeatureEnabled('filterEnabled') || !isTargetProductRoute()) {
      restoreProductFilterColumnOptions();
      return;
    }

    const modal = findProductFilterModal();
    if (!modal) {
      restoreProductFilterColumnOptions();
      return;
    }

    const activeColumns = getActiveProductColumnTitles();
    if (!activeColumns.length) return;

    const allowed = new Set(activeColumns.map(normalizeText));
    const multiselect = findProductFilterColumnMultiselect(modal);
    if (!multiselect) return;

    const options = Array.from(multiselect.querySelectorAll('.multiselect__content .multiselect__element'));
    options.forEach(option => {
      const text = normalizeText(option.textContent || '');
      if (!text) return;

      const shouldShow = allowed.has(text);
      if (shouldShow) {
        option.removeAttribute(PRODUCT_FILTER_OPTION_HIDDEN_ATTR);
        option.style.display = '';
      } else {
        option.setAttribute(PRODUCT_FILTER_OPTION_HIDDEN_ATTR, 'true');
        option.style.display = 'none';
      }
    });
  }

  function findVisibleProductToolbar() {
    const inputs = Array.from(document.querySelectorAll(PRODUCT_TOOLBAR_SEARCH_SELECTOR));
    const input = inputs.find(el => isVisible(el) && el.closest('.grid-toolbar.no-print'));
    if (!input) return null;
    return input.closest('.grid-toolbar.no-print');
  }

  function ensureProductPreviewButton() {
    if (!isFeatureEnabled('productPreviewEnabled') || !isTargetProductRoute()) {
      removeProductPreviewButton();
      return;
    }

    const toolbar = findVisibleProductToolbar();
    if (!toolbar) return;

    const actionsContainer = toolbar.querySelector('.grid-toolbar-hidden-mobile') || toolbar;
    const filterButton = actionsContainer.querySelector('button#grid\\.filter, #grid\\.filter');
    let button = document.getElementById(PRODUCT_PREVIEW_BUTTON_ID);

    if (!button) {
      button = document.createElement('button');
      button.id = PRODUCT_PREVIEW_BUTTON_ID;
      button.type = 'button';
      button.className = 'btn btn-custom-1 btn-sm px-3';
      button.textContent = 'Novo';
      button.title = 'Botao em desenvolvimento';
      button.style.whiteSpace = 'nowrap';
      button.style.marginLeft = '6px';
      button.style.marginRight = '6px';
      button.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopImmediatePropagation();
      }, true);
    }

    if (filterButton) {
      if (button.parentElement !== actionsContainer || button.nextElementSibling !== filterButton) {
        filterButton.insertAdjacentElement('beforebegin', button);
      }
      return;
    }

    if (button.parentElement !== actionsContainer) {
      actionsContainer.appendChild(button);
    }
  }

  function ensureLowStockHighlightStyle() {
    if (document.getElementById(PRODUCT_LOW_STOCK_STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = PRODUCT_LOW_STOCK_STYLE_ID;
    style.textContent = `
      .table-row[${PRODUCT_LOW_STOCK_ATTR}="true"] > .cell {
        color: #c62828 !important;
      }

      .table-row[${PRODUCT_LOW_STOCK_ATTR}="true"] > .cell.selected {
        color: #b71c1c !important;
        font-weight: 700;
      }
    `;
    (document.head || document.documentElement).appendChild(style);
  }

  function parseProductGridNumber(value) {
    const raw = String(value || '').trim();
    if (!raw) return NaN;
    let normalized = raw.replace(/\s+/g, '');
    if (normalized.indexOf(',') !== -1 && normalized.indexOf('.') !== -1) {
      normalized = normalized.replace(/\./g, '').replace(',', '.');
    } else if (normalized.indexOf(',') !== -1) {
      normalized = normalized.replace(',', '.');
    }
    normalized = normalized.replace(/[^0-9.-]/g, '');
    const parsed = Number(normalized);
    return Number.isFinite(parsed) ? parsed : NaN;
  }

  function getProductGridHeaderMap() {
    const headerRow = document.querySelector('.table-row.header');
    if (!headerRow) return null;

    const children = Array.from(headerRow.children || []);
    const titles = children.map((cell) => normalizeText(cell.textContent || ''));
    const quantityIndex = titles.findIndex((text) => text === 'quantidade');
    const minimumIndex = titles.findIndex((text) => text === 'qtd. minima' || text === 'qtd minima');

    if (quantityIndex === -1 || minimumIndex === -1) return null;
    return { quantityIndex, minimumIndex };
  }

  function clearProductLowStockHighlight() {
    const rows = Array.from(document.querySelectorAll('.table-row[' + PRODUCT_LOW_STOCK_ATTR + ']'));
    rows.forEach((row) => row.removeAttribute(PRODUCT_LOW_STOCK_ATTR));
  }

  function syncProductLowStockHighlight() {
    if (!isTargetProductRoute() || !isFeatureEnabled('lowStockHighlightEnabled')) {
      clearProductLowStockHighlight();
      return;
    }

    const headerMap = getProductGridHeaderMap();
    if (!headerMap) {
      clearProductLowStockHighlight();
      return;
    }

    ensureLowStockHighlightStyle();
    const rows = Array.from(document.querySelectorAll('.table-row')).filter((row) => !row.classList.contains('header'));
    rows.forEach((row) => {
      const cells = Array.from(row.children || []);
      const quantityCell = cells[headerMap.quantityIndex];
      const minimumCell = cells[headerMap.minimumIndex];
      if (!quantityCell || !minimumCell) {
        row.removeAttribute(PRODUCT_LOW_STOCK_ATTR);
        return;
      }

      const quantity = parseProductGridNumber(quantityCell.textContent || '');
      const minimum = parseProductGridNumber(minimumCell.textContent || '');
      if (!Number.isFinite(quantity) || !Number.isFinite(minimum)) {
        row.removeAttribute(PRODUCT_LOW_STOCK_ATTR);
        return;
      }

      if (quantity <= minimum) {
        row.setAttribute(PRODUCT_LOW_STOCK_ATTR, 'true');
      } else {
        row.removeAttribute(PRODUCT_LOW_STOCK_ATTR);
      }
    });
  }

  function parseBatchCodes(raw) {
    return (raw || '')
      .split(/[,\n;]+/g)
      .map(x => x.trim())
      .filter(Boolean);
  }

  function parseQuantityFromField(rawValue) {
    const text = String(rawValue || '').trim();
    if (!text) return null;
    let normalized = text.replace(/\s+/g, '');
    if (normalized.indexOf(',') !== -1) {
      normalized = normalized.replace(/\./g, '').replace(',', '.');
    }
    const n = Number(normalized);
    if (!isFinite(n) || n <= 0) return null;
    return n;
  }

  async function waitForItemConfirmation(expectedCode, timeoutMs) {
    const timeout = timeoutMs || 4500;
    const start = Date.now();
    const normalizedExpected = normalizeBatchCode(expectedCode);

    while (Date.now() - start < timeout) {
      const input = findMainSearchInput();
      const addButton = findAddButton();
      const current = input ? (input.value || '').trim() : '';
      const codeLeftInput = current !== normalizedExpected;
      const addReset = !addButton || !!addButton.disabled;
      if (codeLeftInput && addReset) return true;
      await delay(100);
    }

    return false;
  }

  async function executeBatchByCodes(codes, quantityRaw) {
    if (!codes.length) return;
    const quantity = parseQuantityFromField(quantityRaw);
    if (!quantity) {
      updateBatchStatus('Informe uma quantidade valida maior que zero.');
      return;
    }

    BATCH_RUNNING = true;
    let ok = 0;
    const failed = [];
    updateProgressBar(0, 'Iniciando lote...');

    for (let i = 0; i < codes.length; i++) {
      const code = codes[i];
      updateBatchStatus('Processando ' + (i + 1) + '/' + codes.length + ': ' + code);
      updateProgressBar(Math.round((i / codes.length) * 100), 'Processando ' + code + '...');
      try {
        await addSingleItemInBatch(code, quantityRaw, quantity);
        ok++;
      } catch (err) {
        failed.push(code + ' (' + (err && err.message ? err.message : 'erro') + ')');
      }
    }

    if (!failed.length) {
      updateBatchStatus('Concluido: ' + ok + ' itens adicionados.');
      updateProgressBar(100, 'Concluido: ' + ok + ' itens');
    } else {
      updateBatchStatus('Concluido com falhas. OK: ' + ok + ', Falhas: ' + failed.length + '.');
      console.warn('Falhas lote:', failed);
      updateProgressBar(100, 'Concluido com falhas: ' + failed.length);
    }

    setTimeout(() => {
      const progress = document.getElementById(BATCH_PROGRESS_ID);
      if (progress) progress.style.display = 'none';
    }, 2500);

    BATCH_RUNNING = false;
  }

  function openBatchModal() {
    const modal = document.getElementById(BATCH_MODAL_ID);
    const backdrop = document.getElementById(BATCH_BACKDROP_ID);
    if (modal) modal.style.display = 'block';
    if (backdrop) backdrop.style.display = 'block';
  }

  function closeBatchModal() {
    const modal = document.getElementById(BATCH_MODAL_ID);
    const backdrop = document.getElementById(BATCH_BACKDROP_ID);
    if (modal) modal.style.display = 'none';
    if (backdrop) backdrop.style.display = 'none';
  }

  function ensureProgressBar() {
    if (document.getElementById(BATCH_PROGRESS_ID)) return;

    const wrap = document.createElement('div');
    wrap.id = BATCH_PROGRESS_ID;
    wrap.style.cssText = [
      'display:none',
      'position:fixed',
      'left:16px',
      'right:16px',
      'bottom:14px',
      'z-index:999997',
      'background:#ffffff',
      'border:1px solid #d9dee5',
      'border-radius:8px',
      'padding:8px 10px',
      'box-shadow:0 8px 18px rgba(0,0,0,0.15)'
    ].join(';');

    wrap.innerHTML = [
      '<div id="' + BATCH_PROGRESS_TEXT_ID + '" style="font-size:12px;color:#3b4652;margin-bottom:6px;">Processando...</div>',
      '<div style="width:100%;height:8px;background:#edf1f5;border-radius:999px;overflow:hidden;">',
      '  <div id="' + BATCH_PROGRESS_FILL_ID + '" style="height:100%;width:0%;background:#2b84d6;transition:width .2s ease;"></div>',
      '</div>'
    ].join('');

    document.body.appendChild(wrap);
  }

  function updateProgressBar(percent, text) {
    ensureProgressBar();
    const wrap = document.getElementById(BATCH_PROGRESS_ID);
    const fill = document.getElementById(BATCH_PROGRESS_FILL_ID);
    const label = document.getElementById(BATCH_PROGRESS_TEXT_ID);
    if (!wrap || !fill || !label) return;

    wrap.style.display = 'block';
    fill.style.width = Math.max(0, Math.min(100, percent || 0)) + '%';
    if (text) label.textContent = text;
  }

  function findImpressionsButton() {
    const buttons = Array.from(document.querySelectorAll('button, a[role="button"]'));
    const exact = buttons.find(btn => {
      if (!isVisible(btn)) return false;
      const txt = normalizeText(btn.innerText || btn.textContent || '');
      return txt === 'impressoes';
    });
    if (exact) return exact;

    return buttons.find(btn => {
      if (!isVisible(btn)) return false;
      const txt = normalizeText(btn.innerText || btn.textContent || '');
      return txt.indexOf('impressoes') !== -1;
    }) || null;
  }

  function ensureBatchUi() {
    if (!isFeatureEnabled('batchEnabled') || !isTargetDavRoute()) {
      removeBatchUi();
      return;
    }

    const addButton = findAddButton();
    if (!addButton) return;
    const impressionsButton = findImpressionsButton();
    const targetContainer = (impressionsButton && impressionsButton.parentElement)
      ? impressionsButton.parentElement
      : (addButton.closest('.mt-3, .d-flex, .row') || addButton.parentElement);
    if (!targetContainer) return;

    if (!document.getElementById(BATCH_TOGGLE_ID)) {
      const btn = document.createElement('button');
      btn.id = BATCH_TOGGLE_ID;
      btn.type = 'button';
      btn.className = 'btn btn-sm';
      btn.textContent = 'Lote';
      btn.title = 'Aplicar mesma quantidade para varios codigos';
      btn.style.background = '#f4a261';
      btn.style.borderColor = '#f4a261';
      btn.style.color = '#ffffff';
      btn.style.marginLeft = '0';
      btn.style.marginRight = '0';
      btn.addEventListener('click', openBatchModal);
      if (impressionsButton) {
        impressionsButton.insertAdjacentElement('beforebegin', btn);
      } else {
        targetContainer.appendChild(btn);
      }
    } else {
      const btn = document.getElementById(BATCH_TOGGLE_ID);
      if (!btn) return;
      btn.style.marginLeft = '0';
      btn.style.marginRight = '0';

      if (impressionsButton) {
        if (btn.nextElementSibling !== impressionsButton) {
          impressionsButton.insertAdjacentElement('beforebegin', btn);
        }
      } else if (btn.parentElement !== targetContainer) {
        targetContainer.appendChild(btn);
      }
    }

    if (impressionsButton) {
      let spacer = document.getElementById(BATCH_SPACER_ID);
      if (!spacer) {
        spacer = document.createElement('span');
        spacer.id = BATCH_SPACER_ID;
        spacer.style.display = 'inline-block';
        spacer.style.width = '10px';
        spacer.style.pointerEvents = 'none';
      }

      const btn = document.getElementById(BATCH_TOGGLE_ID);
      if (btn && spacer.previousElementSibling !== btn) {
        btn.insertAdjacentElement('afterend', spacer);
      }
    }

    if (!document.getElementById(BATCH_BACKDROP_ID)) {
      const backdrop = document.createElement('div');
      backdrop.id = BATCH_BACKDROP_ID;
      backdrop.style.cssText = [
        'display:none',
        'position:fixed',
        'inset:0',
        'background:rgba(0,0,0,0.28)',
        'z-index:999998'
      ].join(';');
      backdrop.addEventListener('click', closeBatchModal);
      document.body.appendChild(backdrop);
    }

    if (!document.getElementById(BATCH_MODAL_ID)) {
      const modal = document.createElement('div');
      modal.id = BATCH_MODAL_ID;
      modal.style.cssText = [
        'display:none',
        'position:fixed',
        'top:50%',
        'left:50%',
        'transform:translate(-50%, -50%)',
        'width:360px',
        'max-width:calc(100vw - 24px)',
        'background:#fff',
        'border:1px solid #dfe3ea',
        'border-radius:10px',
        'padding:12px',
        'z-index:999999',
        'box-shadow:0 16px 36px rgba(0,0,0,.22)'
      ].join(';');

      modal.innerHTML = [
        '<div class="d-flex justify-content-between align-items-center mb-2">',
        '  <strong>Lote de Itens</strong>',
        '  <button type="button" data-batch-close class="btn btn-sm btn-light">x</button>',
        '</div>',
        '<div class="small text-muted mb-1">Codigos separados por virgula (ex.: 40,20,13)</div>',
        '<textarea data-batch-codes class="form-control form-control-sm" rows="5" placeholder="40,20,13"></textarea>',
        '<div class="d-flex align-items-center gap-2 mt-2">',
        '  <label class="small mb-0" style="min-width:78px;">Quantidade</label>',
        '  <input data-batch-qty type="text" class="form-control form-control-sm" placeholder="2">',
        '</div>',
        '<button type="button" data-batch-run class="btn btn-primary btn-sm w-100 mt-2">Aplicar lote</button>',
        '<div id="' + BATCH_STATUS_ID + '" class="small text-muted mt-2"></div>'
      ].join('');

      modal.querySelector('[data-batch-close]').addEventListener('click', closeBatchModal);
      modal.querySelector('[data-batch-run]').addEventListener('click', async () => {
        if (BATCH_RUNNING) return;
        const textarea = modal.querySelector('[data-batch-codes]');
        const qtyInput = modal.querySelector('[data-batch-qty]');
        const codes = parseBatchCodes(textarea ? textarea.value : '');
        const quantityRaw = qtyInput ? String(qtyInput.value || '').trim() : '';
        const quantity = parseQuantityFromField(quantityRaw);
        if (!codes.length) {
          updateBatchStatus('Informe ao menos um codigo.');
          return;
        }
        if (!quantity) {
          updateBatchStatus('Informe a quantidade no popup.');
          return;
        }
        closeBatchModal();
        await delay(80);
        await executeBatchByCodes(codes, quantityRaw);
      });

      document.body.appendChild(modal);
    }
  }

  function hideElement(el) {
    if (!el || el.__blockedByExt) return;
    el.__blockedByExt = true;
    el.style.display = 'none';
  }

  function markBlocked(el) {
    try {
      if (isDocumentRoute()) return;
      if (!el || el.__blockedByExt) return;
      el.__blockedByExt = true;

      try {
        const aria = (el.getAttribute && el.getAttribute('aria-label')) || '';
        const txt = normalizeText(el.innerText || el.value || '');
        const forceHideByText = FORCE_HIDE_TEXTS.some(t => txt.indexOf(normalizeText(t)) !== -1);
        if (shouldPreserveForceHideText(txt)) return;

        if (ARIA_LABELS.some(a => aria && normalizeText(aria).indexOf(normalizeText(a)) !== -1)
          || ICON_CLASSES.some(cls => el.querySelector && el.querySelector('.' + cls))
          || forceHideByText) {
          el.style.display = 'none';
        } else {
          el.setAttribute && el.setAttribute('disabled', 'true');
          el.style.pointerEvents = 'none';
          el.style.opacity = '0.6';
          el.title = 'Botao bloqueado pelo usuario';
        }
      } catch (e) {
        el.setAttribute && el.setAttribute('disabled', 'true');
        el.style.pointerEvents = 'none';
        el.style.opacity = '0.6';
        el.title = 'Botao bloqueado pelo usuario';
      }

      try { el.onclick = null; } catch(e) {}
      el.addEventListener('click', function(e) {
        e.stopImmediatePropagation();
        e.preventDefault();
      }, true);
    } catch (e) {
      console.warn('blocker error', e);
    }
  }

  function hideBlockedDropdownOptions() {
    if (!isFeatureEnabled('enabled') || isDocumentRoute()) return;

    const menuCandidates = Array.from(document.querySelectorAll('li, a, button, span, div'));
    menuCandidates.forEach(el => {
      const txt = normalizeText(el.innerText || '');
      if (!txt) return;

      const shouldHide = BLOCK_DROPDOWN_OPTIONS.some(opt => txt === opt);
      if (!shouldHide) return;

      const itemContainer = el.closest('li, .dropdown-item, .has-submenu, .menu-item') || el;
      hideElement(itemContainer);
    });
  }

  // Block only in Cadastros > Estoque by stable href selector.
  function hideCadastrosUnitOption() {
    if (!isFeatureEnabled('enabled') || isDocumentRoute()) return;

    const links = Array.from(document.querySelectorAll(CADASTROS_UNIT_SELECTOR));
    links.forEach(link => {
      const item = link.closest('.menu-item') || link;
      hideElement(item);
    });
  }

  
  function blockSpecificInputs() {
    if (!isFeatureEnabled('enabled')) return;

    BLOCK_INPUT_IDS.forEach(id => {
      const input = document.getElementById(id);
      if (!input || !shouldBlockSpecificInput(input)) return;
      applyInputBlock(input);
    });

    BLOCK_INPUT_SELECTORS.forEach(selector => {
      const inputs = Array.from(document.querySelectorAll(selector));
      inputs.forEach(input => {
        if (!shouldBlockSpecificInput(input)) return;
        applyInputBlock(input);
      });
    });
  }

  function applyInputBlock(input) {
    if (!input || input.__blockedByExt) return;
    input.__blockedByExt = true;
    input.setAttribute('disabled', 'true');
    input.setAttribute('readonly', 'true');
    input.style.pointerEvents = 'none';
    input.style.opacity = '0.6';
    input.title = 'Campo bloqueado pelo usuario';
  }
  function scan() {
    if (!isFeatureEnabled('enabled')) return;

    blockSpecificInputs();

    if (isDocumentRoute()) return;

    IDS.forEach(id => {
      const el = document.getElementById(id);
      if (el) markBlocked(el);
    });

    const candidates = Array.from(document.querySelectorAll('button, a, input[type="button"], input[type="submit"]'));
    candidates.forEach(c => {
      const txt = normalizeText(c.innerText || c.value || c.getAttribute('aria-label') || '');
      if (!txt) return;

      for (const t of TEXTS) {
        if (txt.indexOf(normalizeText(t)) !== -1) {
          markBlocked(c);
          break;
        }
      }

      for (const t of FORCE_HIDE_TEXTS) {
        if (txt.indexOf(normalizeText(t)) !== -1) {
          if (shouldPreserveForceHideText(txt)) break;
          markBlocked(c);
          break;
        }
      }
    });

    const extras = Array.from(document.querySelectorAll('a[role="button"], button[role="button"], a, button'));
    extras.forEach(el => {
      const aria = (el.getAttribute && el.getAttribute('aria-label')) || '';
      if (ARIA_LABELS.some(a => normalizeText(aria).indexOf(normalizeText(a)) !== -1)) {
        markBlocked(el);
        return;
      }

      for (const cls of ICON_CLASSES) {
        if (el.querySelector && el.querySelector('.' + cls)) {
          markBlocked(el);
          break;
        }
      }
    });

    hideBlockedDropdownOptions();
    hideCadastrosUnitOption();
  }

  function shouldBlockEventTarget(target) {
    if (!target) return false;

    if (isDocumentRoute()) {
      if (!isTargetDavRoute()) return false;

      let inputEl = target;
      for (let i = 0; i < 8 && inputEl; i++, inputEl = inputEl.parentElement) {
        if (!inputEl) break;
        if (!shouldBlockSpecificInput(inputEl)) continue;

        if (inputEl.id && BLOCK_INPUT_IDS.includes(inputEl.id)) return true;
        if (BLOCK_INPUT_SELECTORS.some(selector => inputEl.matches && inputEl.matches(selector))) return true;
      }

      return false;
    }

    let el = target;
    for (let i = 0; i < 8 && el; i++, el = el.parentElement) {
      if (!el) break;

      if (el.id && IDS.includes(el.id)) return true;

      const aria = (el.getAttribute && el.getAttribute('aria-label')) || '';
      if (ARIA_LABELS.some(a => normalizeText(aria).indexOf(normalizeText(a)) !== -1)) return true;

      const txt = normalizeText(el.innerText || el.value || '');
      if (TEXTS.some(t => txt.indexOf(normalizeText(t)) !== -1)) return true;
      if (FORCE_HIDE_TEXTS.some(t => txt.indexOf(normalizeText(t)) !== -1)) {
        if (!shouldPreserveForceHideText(txt)) return true;
      }

      for (const cls of ICON_CLASSES) {
        try {
          if (el.querySelector && el.querySelector('.' + cls)) return true;
        } catch (e) {}
      }

      if (el.classList && (
        el.classList.contains('cell')
        || el.classList.contains('table-row')
        || el.classList.contains('icon-actions')
        || el.classList.contains('cell-text')
      )) return true;
    }

    return false;
  }

  function blockInteractions(e) {
    try {
      if (!isFeatureEnabled('enabled')) return;
      if (isTargetNfeRoute() && e && e.type === 'contextmenu') return;

      if (shouldBlockEventTarget(e.target)) {
        e.stopImmediatePropagation();
        e.preventDefault();
        return false;
      }
    } catch (err) {}
  }

  document.addEventListener('dblclick', blockInteractions, true);
  document.addEventListener('mousedown', rememberNfeContextMenuAnchorFromMouse, true);
  document.addEventListener('contextmenu', rememberNfeContextMenuAnchor, true);
  document.addEventListener('contextmenu', blockInteractions, true);
  document.addEventListener('pointerdown', armXmlDownloadFlow, true);
  document.addEventListener('click', armXmlDownloadFlow, true);
  document.addEventListener('input', normalizeItemSearchValue, true);
  document.addEventListener('change', normalizeItemSearchValue, true);
  window.addEventListener('message', handleXmlBridgeMessage);
  window.addEventListener('hashchange', function() {
    if (isFiscalRoute()) ensureXmlPopupBridge();
    refreshFeatureUi();
  });

  const observer = new MutationObserver(() => {
    refreshFeatureUi();
  });

  function refreshFeatureUi() {
    if (isFeatureEnabled('enabled')) {
      scan();
    }

    positionNfeContextMenuPopup();
    syncNfeActionMenuItems();

    if (isTargetNfeRoute()) {
      ensureNfeActionCustomizeButton();
    } else {
      removeNfeActionCustomizeUi();
      restoreNfeActionMenuItems();
    }

    if (isTargetDavRoute()) {
      ensureBatchUi();
    } else {
      removeBatchUi();
    }

    if (isTargetProductRoute()) {
      ensureProductPreviewButton();
      syncProductFilterColumnOptions();
      syncProductLowStockHighlight();
    } else {
      removeProductPreviewButton();
      restoreProductFilterColumnOptions();
      clearProductLowStockHighlight();
    }
  }

  function init() {
    if (isFiscalRoute()) ensureXmlPopupBridge();

    try {
      chrome.storage.local.get(FEATURE_DEFAULTS, (res) => {
        applyFeatureState(res);
      });
    } catch (e) {}

    try {
      chrome.storage.local.get({ [ACTION_MENU_PREFS_STORAGE_KEY]: {} }, (res) => {
        ACTION_MENU_PREFS = res && res[ACTION_MENU_PREFS_STORAGE_KEY] && typeof res[ACTION_MENU_PREFS_STORAGE_KEY] === 'object'
          ? res[ACTION_MENU_PREFS_STORAGE_KEY]
          : {};
        refreshFeatureUi();
      });
    } catch (e) {
      refreshFeatureUi();
    }

    observer.observe(document.documentElement || document.body, { childList: true, subtree: true });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  try {
    chrome.storage.onChanged.addListener((changes, area) => {
      if (area !== 'local') return;

      if (changes[ACTION_MENU_PREFS_STORAGE_KEY]) {
        ACTION_MENU_PREFS = changes[ACTION_MENU_PREFS_STORAGE_KEY].newValue || {};
        syncNfeActionMenuItems();
        if (isTargetNfeRoute() && isFeatureEnabled('actionMenuCustomizeEnabled')) {
          ensureNfeActionCustomizeButton();
        }
      }

      const nextState = {};
      let hasRelevantChange = false;
      Object.keys(FEATURE_DEFAULTS).forEach((key) => {
        if (!changes[key]) return;
        nextState[key] = changes[key].newValue;
        hasRelevantChange = true;
      });

      if (!hasRelevantChange) return;

      const previousProtection = isFeatureEnabled('enabled');
      applyFeatureState(nextState);

      if (previousProtection && !isFeatureEnabled('enabled')) {
        cleanupUiForCurrentPage();
      }

      if (isFiscalRoute()) ensureXmlPopupBridge();
      refreshFeatureUi();
    });
  } catch (e) {}

  setTimeout(refreshFeatureUi, 1000);
  setTimeout(refreshFeatureUi, 3000);
  setInterval(() => {
    if (isFiscalRoute()) ensureXmlPopupBridge();
    refreshFeatureUi();
  }, 700);
})();

