(function() {
  'use strict';

  const PENDING_KEY = 'pendingStockPriceSimulation';
  const FEATURE_DEFAULTS = globalThis.ZWEB_FEATURES && typeof globalThis.ZWEB_FEATURES.getDefaults === 'function'
    ? globalThis.ZWEB_FEATURES.getDefaults()
    : { stockPriceSimulationEnabled: true };
  const FEATURE_STATE = Object.assign({}, FEATURE_DEFAULTS);
  const STOCK_ROUTE = '#/register/stock/product';
  const STOCK_EDIT_ROUTE = '#/register/stock/product/edit/';
  const PURCHASE_ROUTE = '#/fiscal/purchase/new';
  const IMPORT_PRODUCTS_SELECTOR = '.imported-xml-modal.show #XMLProduct';
  const PRECISE_PRICE_FIELD_IDS = ['product.price', 'product.wholesalePrice', 'product.cost', 'product.averageCost'];
  const PENDING_TTL_MS = 2 * 60 * 1000;
  const INLINE_MODAL_READY_MIN_MS = 1200;
  const INLINE_MODAL_READY_STABLE_SAMPLES = 4;
  const BANNER_ID = 'zweb-stock-price-simulation-banner';
  const STYLE_ID = 'zweb-stock-price-simulation-style';

  let purchaseClickBound = false;
  let lastHandledPendingKey = '';
  const stableSimulationCounts = Object.create(null);

  function applyFeatureState(nextState) {
    const normalized = globalThis.ZWEB_FEATURES && typeof globalThis.ZWEB_FEATURES.normalizeState === 'function'
      ? globalThis.ZWEB_FEATURES.normalizeState(Object.assign({}, FEATURE_STATE, nextState || {}))
      : Object.assign({}, FEATURE_DEFAULTS, nextState || {});

    Object.keys(FEATURE_DEFAULTS).forEach((key) => {
      FEATURE_STATE[key] = normalized[key] !== false;
    });
  }

  function isFeatureEnabled(key) {
    return FEATURE_STATE[key] !== false;
  }

  function normalizeText(value) {
    return String(value || '').replace(/\s+/g, ' ').trim();
  }

  function normalizeLookupText(value) {
    return normalizeText(value)
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
  }

  function parseLocaleNumber(value) {
    const raw = String(value == null ? '' : value).trim();
    if (!raw) return 0;

    let normalized = raw.replace(/\s+/g, '');
    if (normalized.indexOf(',') !== -1 && normalized.indexOf('.') !== -1) {
      normalized = normalized.replace(/\./g, '').replace(',', '.');
    } else if (normalized.indexOf(',') !== -1) {
      normalized = normalized.replace(',', '.');
    }

    normalized = normalized.replace(/[^0-9.-]/g, '');
    const parsed = parseFloat(normalized);
    return Number.isFinite(parsed) ? parsed : NaN;
  }

  function isPurchaseRoute() {
    return String(location.href || '').toLowerCase().indexOf(PURCHASE_ROUTE) !== -1;
  }

  function isStockRoute() {
    return String(location.href || '').toLowerCase().indexOf(STOCK_ROUTE) !== -1;
  }

  function isStockEditRoute() {
    return String(location.href || '').toLowerCase().indexOf(STOCK_EDIT_ROUTE) !== -1;
  }

  function isStockListRoute() {
    return isStockRoute() && !isStockEditRoute();
  }

  function normalizePriceNumber(value) {
    const numeric = typeof value === 'number' ? value : parseLocaleNumber(value);
    if (!Number.isFinite(numeric)) return NaN;
    return Math.round(numeric * 100) / 100;
  }

  function formatEditablePrice(value) {
    const normalized = normalizePriceNumber(value);
    if (!Number.isFinite(normalized)) {
      return String(value == null ? '' : value).trim();
    }

    const fixed = normalized.toFixed(2);
    const negative = fixed.startsWith('-');
    const absolute = negative ? fixed.slice(1) : fixed;
    const parts = absolute.split('.');
    const integerPart = parts[0] || '0';
    const fractionPart = parts[1] || '00';

    return (negative ? '-' : '') + integerPart + ',' + fractionPart;
  }

  function matchesEditablePrice(currentValue, targetValue) {
    const current = normalizePriceNumber(parseLocaleNumber(currentValue));
    const target = normalizePriceNumber(targetValue);
    if (!Number.isFinite(current) || !Number.isFinite(target)) return false;
    return Math.abs(current - target) < 0.00005;
  }

  function isPrecisePriceField(input) {
    if (!input || !input.id) return false;
    return PRECISE_PRICE_FIELD_IDS.includes(input.id);
  }

  function ensureManualOverrideBinding(input) {
    if (!input || input.__zwebPriceSimulationBound) return;
    input.__zwebPriceSimulationBound = true;

    const markUserInteraction = (event) => {
      if (!event || event.isTrusted !== true) return;
      input.setAttribute('data-zweb-price-simulation-user-interacted', 'true');
      if (input.getAttribute('data-zweb-price-simulation-active') === 'true') {
        input.setAttribute('data-zweb-price-simulation-cancelled', 'true');
      }
    };

    input.addEventListener('pointerdown', markUserInteraction, true);
    input.addEventListener('mousedown', markUserInteraction, true);
    input.addEventListener('beforeinput', markUserInteraction, true);
    input.addEventListener('paste', markUserInteraction, true);
    input.addEventListener('drop', markUserInteraction, true);
    input.addEventListener('keydown', (event) => {
      if (!event || event.isTrusted !== true) return;
      const key = String(event.key || '');
      if (/^\d$/.test(key) || key === ',' || key === '.' || key === 'Backspace' || key === 'Delete') {
        input.setAttribute('data-zweb-price-simulation-user-interacted', 'true');
        if (input.getAttribute('data-zweb-price-simulation-active') === 'true') {
          input.setAttribute('data-zweb-price-simulation-cancelled', 'true');
        }
      }
    }, true);
  }

  function setInputValueAndDispatch(input, value) {
    if (!input) return;
    try {
      input.focus();
      if (typeof input.select === 'function') input.select();
    } catch (error) {}

    const normalizedValue = String(value == null ? '' : value);
    const descriptor = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value');

    if (isPrecisePriceField(input)) {
      if (descriptor && descriptor.set) {
        descriptor.set.call(input, normalizedValue);
      } else {
        input.value = normalizedValue;
      }

      try {
        input.setAttribute('value', normalizedValue);
      } catch (error) {}

      input.dispatchEvent(new Event('input', { bubbles: true, composed: true }));
      input.dispatchEvent(new Event('change', { bubbles: true }));
      input.dispatchEvent(new Event('blur', { bubbles: true }));

      window.setTimeout(() => {
        if (!document.contains(input)) return;
        if (descriptor && descriptor.set) {
          descriptor.set.call(input, normalizedValue);
        } else {
          input.value = normalizedValue;
        }
        try {
          input.setAttribute('value', normalizedValue);
        } catch (error) {}
      }, 0);
      return;
    }

    if (typeof input.setRangeText === 'function') {
      input.setRangeText(normalizedValue, 0, String(input.value || '').length, 'end');
    } else {
      if (descriptor && descriptor.set) {
        descriptor.set.call(input, normalizedValue);
      } else {
        input.value = normalizedValue;
      }
    }

    try {
      input.setAttribute('value', normalizedValue);
    } catch (error) {}

    input.dispatchEvent(new InputEvent('input', {
      bubbles: true,
      composed: true,
      inputType: 'insertText',
      data: normalizedValue
    }));
    input.dispatchEvent(new Event('change', { bubbles: true }));
    input.dispatchEvent(new Event('blur', { bubbles: true }));
  }

  function getImportProductsPopup() {
    return document.querySelector(IMPORT_PRODUCTS_SELECTOR);
  }

  function getImportPopupDescription(row) {
    const input = row && row.querySelector('input#product\\.description, input[id="product.description"]');
    return normalizeText(input && input.value || row && row.textContent || '');
  }

  function getImportPopupStockText(row) {
    return normalizeText(
      row && row.querySelector('td:nth-child(3) .multiselect__single') && row.querySelector('td:nth-child(3) .multiselect__single').textContent
      || row && row.querySelector('td:nth-child(3)') && row.querySelector('td:nth-child(3)').textContent
      || ''
    );
  }

  function getImportPopupStockCode(row) {
    const match = getImportPopupStockText(row).match(/^(\d+)/);
    return match ? match[1] : '';
  }

  function findMatchingImportPopupRow(pending) {
    const popup = getImportProductsPopup();
    if (!popup) return null;

    const rows = Array.from(popup.querySelectorAll('table.table-fix-head.custom-table-striped tbody tr'));
    const targetCode = normalizeLookupText(pending.code);
    const targetDescription = normalizeLookupText(pending.description);

    return rows.find((row) => {
      const stockText = normalizeLookupText(getImportPopupStockText(row));
      const descriptionText = normalizeLookupText(getImportPopupDescription(row));
      if (targetCode && stockText.indexOf(targetCode) !== -1) return true;
      if (targetDescription && descriptionText.indexOf(targetDescription) !== -1) return true;
      return false;
    }) || null;
  }

  function getInlineEditModal() {
    const modals = Array.from(document.querySelectorAll('.modal.show')).filter((modal) => {
      return !!modal.querySelector('#registerProductForm');
    });
    return modals[modals.length - 1] || null;
  }

  function waitForCondition(predicate, timeoutMs) {
    return new Promise((resolve) => {
      const startedAt = Date.now();
      const tick = () => {
        let value = null;
        try {
          value = predicate();
        } catch (error) {
          value = null;
        }

        if (value) {
          resolve(value);
          return;
        }

        if ((Date.now() - startedAt) >= timeoutMs) {
          resolve(null);
          return;
        }

        window.setTimeout(tick, 120);
      };

      tick();
    });
  }

  function readInlineModalSignature(scope) {
    const form = scope && (scope.matches && scope.matches('#registerProductForm') ? scope : scope.querySelector && scope.querySelector('#registerProductForm'));
    const root = form || scope;
    if (!root) return '';

    const reference = normalizeText(
      root.querySelector('input#product\\.reference, input[id="product.reference"]')
      && root.querySelector('input#product\\.reference, input[id="product.reference"]').value
      || ''
    );
    const description = normalizeText(
      root.querySelector('input#product\\.description, input[id="product.description"]')
      && root.querySelector('input#product\\.description, input[id="product.description"]').value
      || ''
    );
    const unit = normalizeText(
      root.querySelector('.multiselect__single')
      && root.querySelector('.multiselect__single').textContent
      || ''
    );

    if (!reference || !description) return '';
    return [reference, description, unit].join('||');
  }

  function waitForInlineModalReady(editModal) {
    return new Promise((resolve) => {
      const startedAt = Date.now();
      let lastSignature = '';
      let stableCount = 0;

      const tick = () => {
        const scope = editModal && (editModal.querySelector('#registerProductForm') || editModal);
        const signature = readInlineModalSignature(scope);
        if (signature && signature === lastSignature) {
          stableCount += 1;
        } else if (signature) {
          lastSignature = signature;
          stableCount = 1;
        } else {
          lastSignature = '';
          stableCount = 0;
        }

        if (
          signature
          && stableCount >= INLINE_MODAL_READY_STABLE_SAMPLES
          && (Date.now() - startedAt) >= INLINE_MODAL_READY_MIN_MS
        ) {
          resolve(scope);
          return;
        }

        if ((Date.now() - startedAt) >= 8000) {
          resolve(null);
          return;
        }

        window.setTimeout(tick, 180);
      };

      tick();
    });
  }

  function createPendingFromButton(button) {
    if (!button || !isFeatureEnabled('stockPriceSimulationEnabled')) return null;

    const code = normalizeText(button.getAttribute('data-code') || '');
    const description = normalizeText(button.getAttribute('data-description') || '');
    const targetPrice = normalizePriceNumber(button.getAttribute('data-target-price') || '');
    if ((!code && !description) || !Number.isFinite(targetPrice)) return null;

    return {
      code,
      description,
      targetPrice,
      createdAt: Date.now(),
      sourceUrl: location.href
    };
  }

  function setButtonBusy(button, busy) {
    if (!button) return () => {};
    if ((button.tagName || '').toUpperCase() !== 'BUTTON') {
      const previousPointerEvents = button.style.pointerEvents;
      const previousOpacity = button.style.opacity;
      if (busy) {
        button.dataset.zwebSimulating = 'true';
        button.style.pointerEvents = 'none';
        button.style.opacity = '0.65';
      }
      return () => {
        delete button.dataset.zwebSimulating;
        button.style.pointerEvents = previousPointerEvents;
        button.style.opacity = previousOpacity;
      };
    }

    const originalText = button.textContent || '';
    const originalDisabled = !!button.disabled;
    if (busy) {
      button.disabled = true;
      button.textContent = 'Aplicando...';
    }
    return () => {
      button.disabled = originalDisabled;
      button.textContent = originalText;
    };
  }

  function ensureStyle() {
    if (document.getElementById(STYLE_ID)) return;

    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      #${BANNER_ID} {
        margin: 12px 0 18px;
        padding: 12px 14px;
        border: 1px solid rgba(54, 153, 255, 0.28);
        border-radius: 0.8rem;
        background: rgba(54, 153, 255, 0.1);
        color: #1b4979;
        font-size: 0.9rem;
        line-height: 1.45;
      }

      #${BANNER_ID} strong {
        display: block;
        margin-bottom: 4px;
      }

      input#product\\.price[data-zweb-price-simulated="true"] {
        border-color: rgba(54, 153, 255, 0.72) !important;
        box-shadow: 0 0 0 0.2rem rgba(54, 153, 255, 0.14) !important;
        background: rgba(54, 153, 255, 0.06) !important;
      }
    `;

    (document.head || document.documentElement).appendChild(style);
  }

  function readPending(callback) {
    try {
      chrome.storage.local.get({ [PENDING_KEY]: null }, (stored) => {
        callback(stored[PENDING_KEY] || null);
      });
    } catch (error) {
      callback(null);
    }
  }

  function clearPending() {
    try {
      chrome.storage.local.remove(PENDING_KEY);
    } catch (error) {}
  }

  function isValidPending(pending) {
    if (!pending || typeof pending !== 'object') return false;
    if (!pending.code && !pending.description) return false;
    if (!pending.createdAt || (Date.now() - pending.createdAt) > PENDING_TTL_MS) return false;
    return Number.isFinite(Number(pending.targetPrice));
  }

  function createPendingKey(pending) {
    if (!pending) return '';
    return [pending.code, pending.description, pending.targetPrice, pending.createdAt].join('||');
  }

  function openStockSimulation(button) {
    const pending = createPendingFromButton(button);
    if (!pending) return;

    try {
      chrome.runtime.sendMessage({
        type: 'stock-price-simulation-open',
        pending
      });
    } catch (error) {}
  }

  async function runInlinePurchaseSimulation(button) {
    const pending = createPendingFromButton(button);
    if (!pending) return false;

    const row = findMatchingImportPopupRow(pending);
    if (!row) return false;
    const stockCode = getImportPopupStockCode(row);
    const inlinePending = stockCode ? Object.assign({}, pending, { code: stockCode }) : pending;
    const isNativePencil = !!(button.matches && button.matches('.btn-select-action'));

    const pencil = isNativePencil ? button : row.querySelector('td:nth-child(3) .btn-select-action');
    if (!pencil) return false;

    const currentModal = getInlineEditModal();
    if (!currentModal && !isNativePencil) {
      pencil.click();
    }

    const editModal = await waitForCondition(() => getInlineEditModal(), 8000);
    if (!editModal) return false;
    const readyScope = await waitForInlineModalReady(editModal);
    if (!readyScope) return false;

    clearPending();
    const applied = await waitForCondition(() => applyStockEditSimulation(inlinePending, readyScope), 8000);
    return !!applied;
  }

  async function handleSimulation(button) {
    if (!button || !isFeatureEnabled('stockPriceSimulationEnabled')) return;

    const restoreButton = setButtonBusy(button, true);
    try {
      if (isPurchaseRoute() && getImportProductsPopup()) {
        await runInlinePurchaseSimulation(button);
        return;
      }

      openStockSimulation(button);
    } finally {
      restoreButton();
    }
  }

  function ensurePurchaseHandler() {
    if (!isPurchaseRoute() || purchaseClickBound) return;
    purchaseClickBound = true;

    document.addEventListener('click', (event) => {
      const target = event.target;
      if (!target) return;
      const button = target.closest('[data-zweb-action="simulate-stock-price"]');
      if (!button) return;
      if (!(button.matches && button.matches('[data-zweb-simulate-source="import-popup-pencil"]'))) {
        event.preventDefault();
      }
      handleSimulation(button).catch(() => {});
    }, true);
  }

  function findMatchingStockRow(pending) {
    const rows = Array.from(document.querySelectorAll('.table-row, tbody tr')).filter((row) => {
      const text = normalizeText(row.innerText || row.textContent || '');
      return text && text.toLowerCase().indexOf('codigo descricao') === -1;
    });

    const targetCode = normalizeLookupText(pending.code);
    const targetDescription = normalizeLookupText(pending.description);

    return rows.find((row) => {
      const text = normalizeLookupText(row.innerText || row.textContent || '');
      if (!text) return false;
      if (targetCode && text.indexOf(targetCode) !== -1) return true;
      if (targetDescription && text.indexOf(targetDescription) !== -1) return true;
      return false;
    }) || null;
  }

  function searchStockList(pending) {
    const searchInput = document.querySelector('input#search\\.value');
    if (!searchInput) return false;

    const searchTerm = pending.code || pending.description;
    if (!searchTerm) return false;

    if ((searchInput.value || '') !== searchTerm) {
      setInputValueAndDispatch(searchInput, searchTerm);
      return true;
    }

    const match = findMatchingStockRow(pending);
    if (!match) return false;

    const openButton = match.querySelector('a[aria-label="Abrir"], a[aria-label="Editar"]')
      || document.querySelector('a[aria-label="Abrir"], a[aria-label="Editar"]');
    if (!openButton || openButton.__zwebStockPriceSimulationClicked) return false;

    openButton.__zwebStockPriceSimulationClicked = true;
    openButton.click();
    return true;
  }

  function ensureBanner(pending, originalValue, scope) {
    ensureStyle();

    let banner = document.getElementById(BANNER_ID);
    if (banner && scope) {
      const scopeModal = scope.closest('.modal.show');
      const bannerModal = banner.closest('.modal.show');
      if (scopeModal && bannerModal && scopeModal !== bannerModal) {
        banner.remove();
        banner = null;
      }
    }

    if (!banner) {
      banner = document.createElement('div');
      banner.id = BANNER_ID;

      const anchor = scope || document.querySelector('#registerProductForm, form#productForm, #productForm, .card-body, .container-fluid') || document.body;
      if (anchor && anchor.parentElement) {
        anchor.insertAdjacentElement('beforebegin', banner);
      } else {
        document.body.insertAdjacentElement('afterbegin', banner);
      }
    }

    banner.innerHTML =
      '<strong>Simulacao de preco do produto</strong>' +
      'Codigo: ' + escapeHtml(pending.code || '-') +
      ' | Valor anterior: ' + escapeHtml(originalValue || '-') +
      ' | Valor simulado: ' + escapeHtml(formatEditablePrice(pending.targetPrice)) +
      '. O campo foi preenchido, mas nada foi salvo.';
  }

  function escapeHtml(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function applyStockEditSimulation(pending, scope) {
    const priceInput = (scope && scope.querySelector('input#product\\.price, input[id="product.price"]'))
      || document.getElementById('product.price');
    if (!priceInput) return false;

    ensureManualOverrideBinding(priceInput);

    const normalizedTarget = normalizePriceNumber(pending.targetPrice);
    const formatted = formatEditablePrice(normalizedTarget);
    const pendingKey = createPendingKey(pending);
    const requiredStableCount = scope ? 6 : 2;
    const userInteracted = priceInput.getAttribute('data-zweb-price-simulation-user-interacted') === 'true';

    if (userInteracted || priceInput.getAttribute('data-zweb-price-simulation-cancelled') === 'true') {
      priceInput.removeAttribute('data-zweb-price-simulation-active');
      clearPending();
      lastHandledPendingKey = pendingKey;
      return true;
    }

    if (!matchesEditablePrice(priceInput.value || '', normalizedTarget)) {
      stableSimulationCounts[pendingKey] = 0;
      priceInput.setAttribute('data-zweb-original-price', priceInput.value || '');
      priceInput.setAttribute('data-zweb-price-simulation-active', 'true');
      priceInput.setAttribute('data-zweb-price-simulation-cancelled', 'false');
      priceInput.setAttribute('data-zweb-price-simulation-user-interacted', 'false');
      setInputValueAndDispatch(priceInput, formatted);
      ensureBanner(pending, priceInput.getAttribute('data-zweb-original-price') || '', scope || priceInput.closest('form') || priceInput.parentElement);
      priceInput.setAttribute('data-zweb-price-simulated', 'true');
      return false;
    }

    priceInput.setAttribute('data-zweb-price-simulated', 'true');
    ensureBanner(pending, priceInput.getAttribute('data-zweb-original-price') || '', scope || priceInput.closest('form') || priceInput.parentElement);

    stableSimulationCounts[pendingKey] = (stableSimulationCounts[pendingKey] || 0) + 1;
    if (stableSimulationCounts[pendingKey] < requiredStableCount) {
      return false;
    }

    priceInput.removeAttribute('data-zweb-price-simulation-active');
    clearPending();
    lastHandledPendingKey = pendingKey;
    return true;
  }

  function tickStockSimulation() {
    if (!isFeatureEnabled('stockPriceSimulationEnabled')) return;
    if (!isStockRoute()) return;

    readPending((pending) => {
      if (!isValidPending(pending)) {
        if (pending) clearPending();
        return;
      }

      const pendingKey = createPendingKey(pending);
      if (pendingKey && pendingKey === lastHandledPendingKey && isStockEditRoute()) return;

      if (isStockListRoute()) {
        searchStockList(pending);
        return;
      }

      if (isStockEditRoute()) {
        applyStockEditSimulation(pending);
      }
    });
  }

  function initFeatureState() {
    try {
      chrome.storage.local.get(FEATURE_DEFAULTS, (stored) => {
        applyFeatureState(stored);
      });
    } catch (error) {}

    try {
      chrome.storage.onChanged.addListener((changes, area) => {
        if (area !== 'local') return;
        const nextState = {};
        let hasRelevantChange = false;
        Object.keys(FEATURE_DEFAULTS).forEach((key) => {
          if (!changes[key]) return;
          nextState[key] = changes[key].newValue;
          hasRelevantChange = true;
        });
        if (!hasRelevantChange) return;
        applyFeatureState(nextState);
      });
    } catch (error) {}
  }

  initFeatureState();
  ensurePurchaseHandler();

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', tickStockSimulation, { once: true });
  } else {
    tickStockSimulation();
  }

  window.addEventListener('hashchange', () => {
    ensurePurchaseHandler();
    tickStockSimulation();
  });

  window.setInterval(() => {
    ensurePurchaseHandler();
    tickStockSimulation();
  }, 900);
})();
