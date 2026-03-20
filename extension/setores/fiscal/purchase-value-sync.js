(function() {
  'use strict';

  const TARGET_ROUTE = '#/fiscal/purchase/new';
  const FEATURE_KEY = 'purchaseValueSyncEnabled';
  const PROFILE_STORAGE_KEY = 'fiscalValueCalculationProfiles';
  const SELECTED_PROFILE_KEY = 'purchaseValueSyncSelectedProfileId';
  const ROOT_ID = 'zweb-purchase-value-sync';
  const STYLE_ID = 'zweb-purchase-value-sync-style';
  const SESSION_KEY_PREFIX = 'zweb-purchase-value-sync:';
  const MAIN_FREIGHT_SELECTOR = 'input#purchaseData\\.taxCalc\\.vFrete, input[id="purchaseData.taxCalc.vFrete"]';
  const FEATURE_DEFAULTS = globalThis.ZWEB_FEATURES && typeof globalThis.ZWEB_FEATURES.getDefaults === 'function'
    ? globalThis.ZWEB_FEATURES.getDefaults()
    : { purchaseValueSyncEnabled: true };
  const FEATURE_STATE = Object.assign({}, FEATURE_DEFAULTS);

  let storedProfiles = [];
  let selectedProfileId = '';
  let panelCollapsed = false;
  let rowOverrides = Object.create(null);
  let freightValue = 0;
  let freightTouched = false;
  let freightSyncPending = false;
  let parsedXmlItems = [];
  let lastParsedFileSignature = '';
  let ensureUiScheduled = false;
  let observedNode = null;
  let observer = null;
  let lastSignature = '';

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

  function isTargetRoute() {
    return String(location.href || '').toLowerCase().indexOf(TARGET_ROUTE) !== -1;
  }

  function normalizeText(value) {
    return String(value || '').replace(/\s+/g, ' ').trim();
  }

  function normalizeLookupText(value) {
    return normalizeText(value).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  }

  function escapeHtml(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function parseRgbColor(value) {
    const raw = String(value || '').trim();
    if (!raw) return null;
    const rgbaMatch = raw.match(/^rgba?\(([^)]+)\)$/i);
    if (rgbaMatch) {
      const parts = rgbaMatch[1].split(',').map((item) => parseFloat(item.trim()));
      if (parts.length >= 3 && parts.every((part, index) => index > 2 || Number.isFinite(part))) {
        return {
          r: parts[0],
          g: parts[1],
          b: parts[2],
          a: Number.isFinite(parts[3]) ? parts[3] : 1
        };
      }
    }
    const hexMatch = raw.match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i);
    if (hexMatch) {
      const hex = hexMatch[1].length === 3
        ? hexMatch[1].split('').map((char) => char + char).join('')
        : hexMatch[1];
      return {
        r: parseInt(hex.slice(0, 2), 16),
        g: parseInt(hex.slice(2, 4), 16),
        b: parseInt(hex.slice(4, 6), 16),
        a: 1
      };
    }
    return null;
  }

  function getSurfaceColor(element) {
    let current = element;
    while (current && current !== document.documentElement) {
      const color = parseRgbColor(window.getComputedStyle(current).backgroundColor);
      if (color && color.a > 0) return color;
      current = current.parentElement;
    }
    const rootColor = parseRgbColor(window.getComputedStyle(document.body || document.documentElement).backgroundColor);
    return rootColor || { r: 255, g: 255, b: 255, a: 1 };
  }

  function isDarkSurface(element) {
    const color = getSurfaceColor(element);
    const luminance = (color.r * 0.299) + (color.g * 0.587) + (color.b * 0.114);
    return luminance < 160;
  }

  function resolveThemeMode(context, root) {
    const candidates = [
      root && root.parentElement,
      context && context.mode === 'import-popup' ? getImportProductsPanel() : null,
      getPurchaseForm(),
      document.querySelector('.card'),
      document.body
    ].filter(Boolean);
    return candidates.some((element) => isDarkSurface(element)) ? 'dark' : 'light';
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

  function formatCurrency(value) {
    return Number(value || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }

  function formatNumber(value, digits) {
    return Number(value || 0).toLocaleString('pt-BR', {
      minimumFractionDigits: digits,
      maximumFractionDigits: digits
    });
  }

  function formatMoneyInput(value) {
    const numeric = Number(value || 0);
    if (!Number.isFinite(numeric)) return '0,00';
    const fixed = numeric.toFixed(2);
    const negative = fixed.startsWith('-');
    const absolute = negative ? fixed.slice(1) : fixed;
    const parts = absolute.split('.');
    return (negative ? '-' : '') + (parts[0] || '0') + ',' + (parts[1] || '00');
  }

  function normalizeSuggestedPrice(value) {
    const numeric = Number(value || 0);
    if (!Number.isFinite(numeric)) return null;
    return Math.round(numeric * 10000) / 10000;
  }

  function getMainFreightInput() {
    return isTargetRoute() ? document.querySelector(MAIN_FREIGHT_SELECTOR) : null;
  }

  function setInputValueAndDispatch(input, value) {
    if (!input) return;
    const normalizedValue = String(value == null ? '' : value);
    const descriptor = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')
      || Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, 'value');

    if (descriptor && descriptor.set) descriptor.set.call(input, normalizedValue);
    else input.value = normalizedValue;

    try {
      input.setAttribute('value', normalizedValue);
    } catch (error) {}

    input.dispatchEvent(new Event('input', { bubbles: true, composed: true }));
    input.dispatchEvent(new Event('change', { bubbles: true }));
    input.dispatchEvent(new Event('blur', { bubbles: true }));
  }

  function cloneProfiles(rawProfiles) {
    if (!Array.isArray(rawProfiles)) return [];
    return rawProfiles.reduce((acc, profile) => {
      if (!profile || typeof profile !== 'object') return acc;
      acc.push({
        id: typeof profile.id === 'string' ? profile.id : '',
        name: normalizeText(profile.name),
        basePercent: String(profile.basePercent == null ? '' : profile.basePercent).trim(),
        extraPercent: String(profile.extraPercent == null ? '' : profile.extraPercent).trim(),
        notes: String(profile.notes == null ? '' : profile.notes).trim()
      });
      return acc;
    }, []);
  }

  function getProfileById(profileId) {
    if (!profileId) return null;
    return storedProfiles.find((profile) => profile.id && profile.id === profileId) || null;
  }

  function getProfileLabel(profile) {
    const pieces = [profile && profile.name ? profile.name : 'Par\u00e2metro sem nome'];
    if (profile && (profile.basePercent || profile.extraPercent)) {
      pieces.push((profile.basePercent || '0') + '% + ' + (profile.extraPercent || '0') + '%');
    }
    return pieces.join(' | ');
  }

  function getActiveProfile() {
    if (!storedProfiles.length) return null;
    return getProfileById(selectedProfileId) || storedProfiles[0];
  }

  function getMultiplier(profile) {
    const base = parseLocaleNumber(profile && profile.basePercent);
    const extra = parseLocaleNumber(profile && profile.extraPercent);
    if (!Number.isFinite(base) || !Number.isFinite(extra)) return null;
    return (1 + (base / 100)) * (1 + (extra / 100));
  }

  function getSessionKey() {
    return SESSION_KEY_PREFIX + String(location.hash || TARGET_ROUTE).split('?')[0];
  }

  function loadSessionState() {
    panelCollapsed = false;
    rowOverrides = Object.create(null);
    freightValue = 0;
    freightTouched = false;
    freightSyncPending = false;
    try {
      const raw = window.sessionStorage.getItem(getSessionKey());
      if (!raw) return;
      const parsed = JSON.parse(raw);
      panelCollapsed = !!(parsed && parsed.collapsed);
      const parsedFreightValue = Number(parsed && parsed.freightValue);
      freightValue = Number.isFinite(parsedFreightValue) ? Math.max(0, parsedFreightValue) : 0;
      freightTouched = !!(parsed && parsed.freightTouched);
      freightSyncPending = !!(parsed && parsed.freightSyncPending);
      if (!parsed || !parsed.overrides || typeof parsed.overrides !== 'object') return;
      Object.keys(parsed.overrides).forEach((key) => {
        const value = String(parsed.overrides[key] || '');
        if (value) rowOverrides[key] = value;
      });
    } catch (error) {}
  }

  function persistSessionState() {
    try {
      window.sessionStorage.setItem(getSessionKey(), JSON.stringify({
        collapsed: panelCollapsed,
        overrides: rowOverrides,
        freightValue,
        freightTouched,
        freightSyncPending
      }));
    } catch (error) {}
  }

  function getImportProductsPanel() {
    if (!isTargetRoute()) return null;
    const modal = document.querySelector('.imported-xml-modal.show');
    const panel = modal && modal.querySelector('#XMLProduct');
    return panel && panel.querySelector('table.table, table.table-fix-head') ? panel : null;
  }

  function getImportFileInput() {
    return isTargetRoute() ? document.querySelector('input#file[type="file"]') : null;
  }

  function getPurchaseForm() {
    return isTargetRoute() ? document.getElementById('purchaseForm') : null;
  }

  function hydrateFreightFromMainForm() {
    if (freightTouched) return;
    const input = getMainFreightInput();
    if (!input) return;
    const numeric = parseLocaleNumber(input.value || '');
    if (!Number.isFinite(numeric)) return;
    freightValue = Math.max(0, numeric);
  }

  function syncPendingFreightToMainForm() {
    if (!isTargetRoute() || !freightSyncPending) return false;
    const input = getMainFreightInput();
    if (!input) return false;

    const targetValue = formatMoneyInput(freightValue);
    const currentValue = parseLocaleNumber(input.value || '');
    const targetNumeric = parseLocaleNumber(targetValue);

    if (!Number.isFinite(currentValue) || Math.abs(currentValue - targetNumeric) > 0.0005) {
      setInputValueAndDispatch(input, targetValue);
    }

    freightSyncPending = false;
    persistSessionState();
    return true;
  }

  function getXmlItemKey(description, quantity, unitCost) {
    return [
      normalizeLookupText(description),
      Number(quantity || 0).toFixed(4),
      Number(unitCost || 0).toFixed(4)
    ].join('||');
  }

  function getFirstChildText(node, localName) {
    if (!node) return '';
    const child = Array.from(node.children || []).find((el) => String(el.localName || '').toLowerCase() === String(localName || '').toLowerCase());
    return child ? normalizeText(child.textContent || '') : '';
  }

  function getDescendantText(node, localName) {
    if (!node) return '';
    const match = node.getElementsByTagNameNS
      ? node.getElementsByTagNameNS('*', localName)[0]
      : null;
    return match ? normalizeText(match.textContent || '') : '';
  }

  function parseImportedXmlText(xmlText) {
    const raw = String(xmlText || '').trim();
    if (!raw) return [];
    let doc = null;
    try {
      doc = new DOMParser().parseFromString(raw, 'application/xml');
    } catch (error) {
      return [];
    }
    if (!doc || doc.querySelector('parsererror')) return [];
    return Array.from(doc.getElementsByTagNameNS('*', 'det')).reduce((acc, detNode) => {
      const prodNode = Array.from(detNode.children || []).find((el) => String(el.localName || '').toLowerCase() === 'prod');
      if (!prodNode) return acc;
      const description = getFirstChildText(prodNode, 'xProd');
      const code = getFirstChildText(prodNode, 'cProd');
      const quantity = parseLocaleNumber(getFirstChildText(prodNode, 'qCom'));
      const unitCost = parseLocaleNumber(getFirstChildText(prodNode, 'vUnCom'));
      const ipiPercent = parseLocaleNumber(getDescendantText(detNode, 'pIPI'));
      let ipiAmount = parseLocaleNumber(getDescendantText(detNode, 'vIPI'));
      if (!Number.isFinite(ipiAmount)) {
        const ipiBase = parseLocaleNumber(getDescendantText(detNode, 'vBC'));
        if (Number.isFinite(ipiBase) && Number.isFinite(ipiPercent)) {
          ipiAmount = ipiBase * (ipiPercent / 100);
        }
      }
      if (!description || !code || !Number.isFinite(quantity) || !Number.isFinite(unitCost)) return acc;
      const normalizedIpiAmount = Number.isFinite(ipiAmount) ? Math.max(0, ipiAmount) : 0;
      const unitIpi = quantity > 0 ? normalizedIpiAmount / quantity : 0;
      acc.push({
        itemNumber: normalizeText(detNode.getAttribute('nItem') || ''),
        code: code,
        description: description,
        quantity: quantity,
        unitCost: unitCost,
        ipiPercent: Number.isFinite(ipiPercent) ? Math.max(0, ipiPercent) : 0,
        ipiAmount: normalizedIpiAmount,
        unitIpi: Number.isFinite(unitIpi) ? Math.max(0, unitIpi) : 0,
        key: getXmlItemKey(description, quantity, unitCost)
      });
      return acc;
    }, []);
  }

  function captureImportedXmlFile(input) {
    const file = input && input.files && input.files[0];
    if (!file) {
      parsedXmlItems = [];
      lastParsedFileSignature = '';
      scheduleEnsureUi();
      return;
    }
    const signature = [file.name || '', file.size || 0, file.lastModified || 0].join('|');
    if (signature === lastParsedFileSignature) return;
    lastParsedFileSignature = signature;
    const reader = new FileReader();
    reader.onload = () => {
      parsedXmlItems = parseImportedXmlText(reader.result);
      scheduleEnsureUi();
    };
    reader.onerror = () => {
      parsedXmlItems = [];
      scheduleEnsureUi();
    };
    reader.readAsText(file, 'utf-8');
  }

  function bindImportedFileInput() {
    const input = getImportFileInput();
    if (!input) return;
    if (!input.__zwebPurchaseValueSyncBound) {
      input.__zwebPurchaseValueSyncBound = true;
      input.addEventListener('change', () => captureImportedXmlFile(input), true);
    }
    if (input.files && input.files[0]) captureImportedXmlFile(input);
  }

  function ensureStyle() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      #${ROOT_ID}{margin:18px 0 14px}
      #${ROOT_ID}.is-import-popup{margin:0 0 14px}
      #${ROOT_ID}{--zpv-card-bg:linear-gradient(180deg,#fbfdff 0%,#fff 100%);--zpv-card-border:rgba(22,100,192,.24);--zpv-card-shadow:0 14px 28px rgba(15,76,146,.09),0 0 0 1px rgba(22,100,192,.05);--zpv-head-bg:linear-gradient(180deg,rgba(22,100,192,.07) 0%,rgba(255,255,255,0) 100%);--zpv-head-border:rgba(24,28,50,.08);--zpv-title:#181c32;--zpv-copy:#5e6278;--zpv-muted:#7e8299;--zpv-input-bg:#fff;--zpv-input-border:#cdd9e6;--zpv-input-color:#181c32;--zpv-button-bg:rgba(54,153,255,.08);--zpv-button-bg-hover:rgba(54,153,255,.14);--zpv-button-border:rgba(54,153,255,.18);--zpv-button-color:#1664c0;--zpv-collapse-bg:#fff;--zpv-collapse-border:rgba(24,28,50,.12);--zpv-collapse-color:#181c32;--zpv-collapse-shadow:0 6px 14px rgba(15,76,146,.08);--zpv-note-bg:rgba(255,248,220,.7);--zpv-note-border:rgba(255,193,7,.36);--zpv-note-color:#5e6278;--zpv-stat-bg:#f8f9fb;--zpv-stat-border:rgba(24,28,50,.09);--zpv-empty-bg:rgba(248,249,251,.82);--zpv-empty-border:rgba(24,28,50,.18);--zpv-wrap-bg:#fff;--zpv-wrap-border:rgba(24,28,50,.08);--zpv-head-cell-bg:#f5f8fb;--zpv-cell-border:rgba(24,28,50,.06);--zpv-accent:#1664c0;--zpv-success:#0f9d58;--zpv-badge-bg:rgba(22,100,192,.08);--zpv-badge-border:rgba(22,100,192,.16);--zpv-badge-color:#1664c0}
      #${ROOT_ID}.is-dark{--zpv-card-bg:linear-gradient(180deg,#1a2532 0%,#14202c 100%);--zpv-card-border:rgba(121,176,255,.28);--zpv-card-shadow:0 16px 30px rgba(0,0,0,.34),0 0 0 1px rgba(121,176,255,.08);--zpv-head-bg:linear-gradient(180deg,rgba(54,123,205,.22) 0%,rgba(20,32,44,0) 100%);--zpv-head-border:rgba(130,149,171,.18);--zpv-title:#eef5ff;--zpv-copy:#b6c4d6;--zpv-muted:#9caec4;--zpv-input-bg:#0f1823;--zpv-input-border:rgba(130,149,171,.3);--zpv-input-color:#f2f7ff;--zpv-button-bg:rgba(79,145,230,.18);--zpv-button-bg-hover:rgba(79,145,230,.28);--zpv-button-border:rgba(121,176,255,.28);--zpv-button-color:#d8e8ff;--zpv-collapse-bg:#101a25;--zpv-collapse-border:rgba(130,149,171,.24);--zpv-collapse-color:#eef5ff;--zpv-collapse-shadow:0 10px 18px rgba(0,0,0,.22);--zpv-note-bg:rgba(82,69,26,.34);--zpv-note-border:rgba(255,214,102,.24);--zpv-note-color:#f2deb0;--zpv-stat-bg:rgba(12,21,31,.78);--zpv-stat-border:rgba(130,149,171,.18);--zpv-empty-bg:rgba(12,21,31,.7);--zpv-empty-border:rgba(130,149,171,.24);--zpv-wrap-bg:#101a25;--zpv-wrap-border:rgba(130,149,171,.18);--zpv-head-cell-bg:#162231;--zpv-cell-border:rgba(130,149,171,.14);--zpv-accent:#8bc0ff;--zpv-success:#69d79d;--zpv-badge-bg:rgba(121,176,255,.16);--zpv-badge-border:rgba(121,176,255,.2);--zpv-badge-color:#d8e8ff}
      #${ROOT_ID} .cardx{position:relative;background:var(--zpv-card-bg);border:2px solid var(--zpv-card-border);border-radius:1rem;box-shadow:var(--zpv-card-shadow);overflow:hidden}
      #${ROOT_ID}.is-import-popup .cardx{border-radius:.95rem;box-shadow:var(--zpv-card-shadow)}
      #${ROOT_ID} .cardx::before{content:'';display:block;height:4px;background:linear-gradient(90deg,#1664c0 0%,#1f97ff 100%)}
      #${ROOT_ID}.is-dark .cardx::before{background:linear-gradient(90deg,#4f91e6 0%,#8bc0ff 100%)}
      #${ROOT_ID} .head{display:flex;flex-wrap:wrap;justify-content:space-between;gap:16px;padding:16px 18px 14px;background:var(--zpv-head-bg);border-bottom:1px solid var(--zpv-head-border)}
      #${ROOT_ID}.is-import-popup .head{padding:14px 16px 12px}
      #${ROOT_ID} .head-main{display:flex;align-items:flex-start;gap:12px;min-width:0;flex:1 1 340px}
      #${ROOT_ID} .head-copy{min-width:0;flex:1 1 auto}
      #${ROOT_ID} .title{margin:0;color:var(--zpv-title);font-size:1rem;font-weight:700;line-height:1.35}
      #${ROOT_ID}.is-import-popup .title{font-size:.96rem}
      #${ROOT_ID} .subtitle{margin:6px 0 0;color:var(--zpv-copy);font-size:.86rem;line-height:1.45}
      #${ROOT_ID}.is-import-popup .subtitle{font-size:.83rem}
      #${ROOT_ID} .controls{display:grid;grid-template-columns:minmax(250px,1fr) minmax(250px,1fr) auto;align-items:start;gap:10px 12px}
      #${ROOT_ID} .control{min-width:0}
      #${ROOT_ID}.is-import-popup .controls{grid-template-columns:minmax(220px,1fr) minmax(220px,1fr) auto}
      #${ROOT_ID} .control label{display:block;margin-bottom:6px;color:var(--zpv-copy);font-size:.82rem;font-weight:700}
      #${ROOT_ID} .control.control-freight{align-self:start}
      #${ROOT_ID} select,#${ROOT_ID} .row-select,#${ROOT_ID} .control-input{width:100%;min-height:38px;padding:.4rem .75rem;border:1px solid var(--zpv-input-border);border-radius:.7rem;background:var(--zpv-input-bg);color:var(--zpv-input-color)}
      #${ROOT_ID} select:focus,#${ROOT_ID} .row-select:focus,#${ROOT_ID} .control-input:focus{border-color:rgba(54,153,255,.55);box-shadow:0 0 0 .2rem rgba(54,153,255,.12);outline:0}
      #${ROOT_ID} .refresh,#${ROOT_ID} .collapse-btn{min-height:38px;min-width:38px;padding:.5rem .9rem;border-radius:.7rem;font-size:.82rem;font-weight:700;cursor:pointer}
      #${ROOT_ID} .refresh{border:1px solid var(--zpv-button-border);background:var(--zpv-button-bg);color:var(--zpv-button-color)}
      #${ROOT_ID} .refresh:hover{background:var(--zpv-button-bg-hover)}
      #${ROOT_ID} .controls .refresh{align-self:start;margin-top:27px;white-space:nowrap}
      #${ROOT_ID} .collapse-btn{display:inline-flex;align-items:center;justify-content:center;border:1px solid var(--zpv-collapse-border);background:var(--zpv-collapse-bg);color:var(--zpv-collapse-color);box-shadow:var(--zpv-collapse-shadow)}
      #${ROOT_ID} .collapse-btn:hover{background:var(--zpv-head-cell-bg)}
      #${ROOT_ID} .control-help{display:block;margin-top:6px;color:var(--zpv-muted);font-size:.75rem;line-height:1.35}
      #${ROOT_ID} .chev{display:inline-flex;align-items:center;justify-content:center;width:18px;height:18px;font-size:16px;line-height:1;transition:transform .18s ease}
      #${ROOT_ID}.is-collapsed .chev{transform:rotate(-90deg)}
      #${ROOT_ID} .body{padding:16px 18px 18px}
      #${ROOT_ID}.is-import-popup .body{padding:14px 16px 16px}
      #${ROOT_ID}.is-collapsed .body{display:none}
      #${ROOT_ID} .note{margin-bottom:14px;padding:11px 13px;border:1px solid var(--zpv-note-border);border-radius:.8rem;background:var(--zpv-note-bg);color:var(--zpv-note-color);font-size:.84rem;line-height:1.45}
      #${ROOT_ID}.is-import-popup .note{margin-bottom:12px;font-size:.82rem}
      #${ROOT_ID} .summary{display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:12px;margin-bottom:16px}
      #${ROOT_ID}.is-import-popup .summary{grid-template-columns:repeat(auto-fit,minmax(145px,1fr));gap:10px}
      #${ROOT_ID} .stat{border:1px solid var(--zpv-stat-border);border-radius:.8rem;background:var(--zpv-stat-bg);padding:12px 14px}
      #${ROOT_ID}.is-import-popup .stat{padding:10px 12px}
      #${ROOT_ID} .stat-label{display:block;margin-bottom:6px;color:var(--zpv-muted);font-size:.78rem;font-weight:700;letter-spacing:.02em;text-transform:uppercase}
      #${ROOT_ID} .stat-value{color:var(--zpv-title);font-size:.94rem;font-weight:700;line-height:1.25}
      #${ROOT_ID} .empty{border:1px dashed var(--zpv-empty-border);border-radius:.9rem;background:var(--zpv-empty-bg);color:var(--zpv-copy);padding:20px;text-align:center;font-size:.9rem}
      #${ROOT_ID} .wrap{border:1px solid var(--zpv-wrap-border);border-radius:.9rem;overflow:hidden;background:var(--zpv-wrap-bg)}
      #${ROOT_ID}.is-import-popup .wrap{max-height:340px;overflow:auto}
      #${ROOT_ID} table{width:100%;margin:0;border-collapse:collapse;table-layout:fixed}
      #${ROOT_ID} thead th{background:var(--zpv-head-cell-bg);color:var(--zpv-copy);font-size:.76rem;font-weight:700;letter-spacing:.02em;text-transform:uppercase}
      #${ROOT_ID} th,#${ROOT_ID} td{padding:10px 12px;border-bottom:1px solid var(--zpv-cell-border);vertical-align:top;color:var(--zpv-copy)}
      #${ROOT_ID}.is-import-popup th,#${ROOT_ID}.is-import-popup td{padding:9px 10px}
      #${ROOT_ID} tbody tr:last-child td{border-bottom:0}
      #${ROOT_ID} .item-head{display:flex;align-items:flex-start;justify-content:space-between;gap:10px}
      #${ROOT_ID} .item-name{color:var(--zpv-title);font-size:.88rem;font-weight:700;line-height:1.4}
      #${ROOT_ID} .item-meta,#${ROOT_ID} .row-note{display:block;margin-top:4px;color:var(--zpv-muted);font-size:.78rem;line-height:1.4}
      #${ROOT_ID} .money,#${ROOT_ID} .qty{text-align:right;white-space:nowrap;font-variant-numeric:tabular-nums}
      #${ROOT_ID} .delta{color:var(--zpv-success);font-weight:700}
      #${ROOT_ID} .stock-sim-btn{flex:0 0 auto;min-height:28px;padding:0 10px;border:1px solid var(--zpv-button-border);border-radius:.65rem;background:var(--zpv-button-bg);color:var(--zpv-button-color);font-size:.74rem;font-weight:700;white-space:nowrap;cursor:pointer}
      #${ROOT_ID} .stock-sim-btn:hover{background:var(--zpv-button-bg-hover)}
      #${ROOT_ID} .stock-sim-btn:disabled{opacity:.55;cursor:not-allowed}
      #${ROOT_ID} .badge-slot{display:block;min-height:30px}
      #${ROOT_ID} .badgex{display:inline-flex;align-items:center;min-height:22px;margin-top:8px;padding:0 9px;border-radius:999px;border:1px solid var(--zpv-badge-border);background:var(--zpv-badge-bg);color:var(--zpv-badge-color);font-size:.72rem;font-weight:700}
      #${ROOT_ID} .badgex.is-hidden{visibility:hidden}
      #${ROOT_ID} .profile-col{width:22%}
      #${ROOT_ID} .col-item{width:24%}
      #${ROOT_ID} .col-qty{width:7%}
      #${ROOT_ID} .col-cost,#${ROOT_ID} .col-suggested,#${ROOT_ID} .col-delta,#${ROOT_ID} .col-total{width:11.75%}
      #${ROOT_ID} .item-name,#${ROOT_ID} .item-meta,#${ROOT_ID} .row-note{word-break:break-word}
      #${ROOT_ID} .row-select{max-width:100%}
      @media (max-width:1180px){#${ROOT_ID} .head{gap:14px}#${ROOT_ID} .controls{grid-template-columns:minmax(220px,1fr) minmax(220px,1fr)}#${ROOT_ID} .controls .refresh{grid-column:1 / -1;width:100%;margin-top:0}}
      @media (max-width:980px){#${ROOT_ID} .head{padding:14px 16px 12px}#${ROOT_ID} .body{padding:14px 16px 16px}#${ROOT_ID} .summary{grid-template-columns:repeat(auto-fit,minmax(135px,1fr));gap:10px}#${ROOT_ID} .col-item{width:28%}#${ROOT_ID} .profile-col{width:24%}}
      @media (max-width:767px){#${ROOT_ID} .head-main,#${ROOT_ID} .controls{width:100%}#${ROOT_ID} .controls{grid-template-columns:1fr}#${ROOT_ID} .control{min-width:0;width:100%}#${ROOT_ID} .controls .refresh,#${ROOT_ID} .collapse-btn{width:100%;margin-top:0}#${ROOT_ID} .wrap{overflow-x:auto}#${ROOT_ID} table{min-width:860px}}
    `;
    (document.head || document.documentElement).appendChild(style);
  }
  function readControlValue(scope, selectors) {
    if (!scope) return '';
    const list = Array.isArray(selectors) ? selectors : [selectors];
    for (const selector of list) {
      if (!selector) continue;
      let node = null;
      try {
        node = scope.querySelector(selector);
      } catch (error) {
        node = null;
      }
      if (!node) continue;
      if ('value' in node && normalizeText(node.value || '')) return normalizeText(node.value || '');
      if (normalizeText(node.textContent || '')) return normalizeText(node.textContent || '');
    }
    return '';
  }

  function readCellText(cell) {
    return readControlValue(cell, ['.multiselect__single', 'input', 'textarea', 'select', '.form-control']) || normalizeText(cell && cell.textContent);
  }

  function parseStockSelection(value) {
    const display = normalizeText(value);
    if (!display) return { display: '', code: '', label: '' };
    const match = display.match(/^(\d+)\s*-\s*(.+)$/);
    if (match) return { display, code: match[1], label: normalizeText(match[2]) };
    const codeMatch = display.match(/^(\d+)/);
    return { display, code: codeMatch ? codeMatch[1] : '', label: display };
  }

  function getRowKey(row) {
    return [
      row.contextMode,
      row.rowIndex,
      row.itemNumber,
      row.sourceItemNumber,
      row.sourceCode,
      row.description,
      row.quantity,
      row.unitCost,
      row.totalCost,
      row.unit,
      row.cfop,
      row.cst,
      row.barCode
    ].join('||');
  }

  function buildXmlItemPools() {
    const exact = new Map();
    const byDescription = new Map();
    parsedXmlItems.forEach((item) => {
      if (!item) return;
      const exactKey = item.key || getXmlItemKey(item.description, item.quantity, item.unitCost);
      const descriptionKey = normalizeLookupText(item.description);
      if (!exact.has(exactKey)) exact.set(exactKey, []);
      exact.get(exactKey).push(item);
      if (!byDescription.has(descriptionKey)) byDescription.set(descriptionKey, []);
      byDescription.get(descriptionKey).push(item);
    });
    return { exact, byDescription };
  }

  function consumeXmlItem(pool, key) {
    const items = pool.get(key);
    return items && items.length ? items.shift() || null : null;
  }

  function readImportPopupRows(context) {
    if (!context || !context.tableBody) return [];
    const xmlPools = buildXmlItemPools();
    return Array.from(context.tableBody.querySelectorAll('tr')).reduce((acc, tr, index) => {
      const cells = Array.from(tr.querySelectorAll('td'));
      if (cells.length < 8) return acc;
      const description = readControlValue(cells[0], ['input#product\\.description', 'input[id="product.description"]']) || readCellText(cells[0]);
      const barCode = readControlValue(cells[1], ['input#product\\.barCode', 'input[id="product.barCode"]']) || readCellText(cells[1]);
      const stockSelection = parseStockSelection(readCellText(cells[2]));
      const cfop = readCellText(cells[3]);
      const quantity = parseLocaleNumber(readCellText(cells[4]));
      const unitCost = parseLocaleNumber(readCellText(cells[5]));
      const unit = readCellText(cells[6]);
      const totalCost = parseLocaleNumber(readCellText(cells[7]));
      if (!description || !Number.isFinite(quantity) || !Number.isFinite(unitCost) || !Number.isFinite(totalCost)) return acc;
      const exactMatch = consumeXmlItem(xmlPools.exact, getXmlItemKey(description, quantity, unitCost));
      const fallbackMatch = exactMatch || consumeXmlItem(xmlPools.byDescription, normalizeLookupText(description));
      const row = {
        contextMode: context.mode,
        rowIndex: index + 1,
        itemNumber: (fallbackMatch && fallbackMatch.itemNumber) || String(index + 1),
        code: stockSelection.code,
        description,
        unit,
        cfop,
        cst: '',
        quantity,
        unitCost,
        totalCost,
        barCode,
        stockDisplay: stockSelection.display,
        sourceCode: stockSelection.code || (fallbackMatch && fallbackMatch.code) || '',
        sourceItemNumber: (fallbackMatch && fallbackMatch.itemNumber) || '',
        ipiPercent: fallbackMatch && Number.isFinite(fallbackMatch.ipiPercent) ? fallbackMatch.ipiPercent : 0,
        ipiAmount: fallbackMatch && Number.isFinite(fallbackMatch.ipiAmount) ? fallbackMatch.ipiAmount : 0,
        unitIpi: fallbackMatch && Number.isFinite(fallbackMatch.unitIpi) ? fallbackMatch.unitIpi : 0
      };
      row.key = getRowKey(row);
      acc.push(row);
      return acc;
    }, []);
  }

  function getActiveContext() {
    if (!isTargetRoute()) return null;
    const importPanel = getImportProductsPanel();
    if (importPanel) {
      const table = importPanel.querySelector('table.table, table.table-fix-head');
      return {
        mode: 'import-popup',
        host: importPanel,
        anchor: importPanel.querySelector('.row.mb-2') || table,
        tableBody: table && table.querySelector('tbody')
      };
    }
    return null;
  }

  function readImportedRows(context) {
    return !context ? [] : readImportPopupRows(context);
  }

  function pruneOverrides(rows) {
    const valid = new Set(rows.map((row) => row.key));
    let changed = false;
    Object.keys(rowOverrides).forEach((key) => {
      if (!valid.has(key) || !getProfileById(rowOverrides[key])) {
        delete rowOverrides[key];
        changed = true;
      }
    });
    if (changed) persistSessionState();
  }

  function getAppliedRows(rows, activeProfile) {
    const baseTotalCost = rows.reduce((sum, row) => sum + row.totalCost, 0);
    const freightRate = baseTotalCost > 0 && freightValue > 0 ? freightValue / baseTotalCost : 0;
    return rows.map((row) => {
      const overrideProfile = getProfileById(rowOverrides[row.key]);
      const appliedProfile = overrideProfile || activeProfile;
      const multiplier = getMultiplier(appliedProfile);
      const unitCostWithIpi = row.unitCost + (Number.isFinite(row.unitIpi) ? row.unitIpi : 0);
      const totalCostWithIpi = row.totalCost + (Number.isFinite(row.ipiAmount) ? row.ipiAmount : 0);
      const suggestedUnitBase = Number.isFinite(multiplier) ? unitCostWithIpi * multiplier : null;
      const suggestedTotalBase = Number.isFinite(multiplier) ? totalCostWithIpi * multiplier : null;
      const suggestedUnit = Number.isFinite(suggestedUnitBase) ? suggestedUnitBase * (1 + freightRate) : null;
      const suggestedTotal = Number.isFinite(suggestedTotalBase) ? suggestedTotalBase * (1 + freightRate) : null;
      const delta = Number.isFinite(suggestedUnit) ? (suggestedUnit - unitCostWithIpi) : null;
      return Object.assign({}, row, {
        overrideProfile,
        appliedProfile,
        multiplier,
        freightRate,
        unitCostWithIpi,
        totalCostWithIpi,
        suggestedUnit,
        suggestedTotal,
        delta,
        hasIpi: !!((Number.isFinite(row.ipiAmount) && row.ipiAmount > 0) || (Number.isFinite(row.ipiPercent) && row.ipiPercent > 0)),
        isException: !!(overrideProfile && (!activeProfile || overrideProfile.id !== activeProfile.id))
      });
    });
  }
  function ensureRoot(context) {
    if (!context || !context.host) return null;
    let root = document.getElementById(ROOT_ID);
    if (!root) {
      root = document.createElement('section');
      root.id = ROOT_ID;
      root.addEventListener('change', (event) => {
        const target = event.target;
        if (!target) return;
        if (target.id === ROOT_ID + '-profile') {
          selectedProfileId = String(target.value || '');
          persistSelectedProfile();
          scheduleEnsureUi();
          return;
        }
        if (target.matches('[data-zweb-role="row-profile"]')) {
          const rowKey = String(target.getAttribute('data-row-key') || '');
          const value = String(target.value || '');
          if (!rowKey) return;
          if (value && getProfileById(value)) rowOverrides[rowKey] = value;
          else delete rowOverrides[rowKey];
          persistSessionState();
          scheduleEnsureUi();
          return;
        }
        if (target.id === ROOT_ID + '-freight') {
          const nextFreightValue = parseLocaleNumber(target.value || '');
          freightValue = Number.isFinite(nextFreightValue) ? Math.max(0, nextFreightValue) : 0;
          freightTouched = true;
          freightSyncPending = true;
          persistSessionState();
          scheduleEnsureUi();
        }
      });
      root.addEventListener('click', (event) => {
        const target = event.target;
        if (!target) return;
        const refresh = target.closest('[data-zweb-action="refresh"]');
        if (refresh) {
          event.preventDefault();
          scheduleEnsureUi();
          return;
        }
        const collapse = target.closest('[data-zweb-action="collapse"]');
        if (collapse) {
          event.preventDefault();
          panelCollapsed = !panelCollapsed;
          persistSessionState();
          scheduleEnsureUi();
        }
      });
    }
    if (root.parentElement !== context.host) {
      if (root.parentElement) root.parentElement.removeChild(root);
      if (context.anchor && context.anchor.parentElement === context.host) context.anchor.insertAdjacentElement('beforebegin', root);
      else context.host.appendChild(root);
    }
    root.dataset.contextMode = context.mode;
    return root;
  }
  function buildSummary(appliedRows, activeProfile) {
    const totalCost = appliedRows.reduce((sum, row) => sum + row.totalCost, 0);
    const totalIpi = appliedRows.reduce((sum, row) => sum + (Number.isFinite(row.ipiAmount) ? row.ipiAmount : 0), 0);
    const totalCostWithIpi = appliedRows.reduce((sum, row) => sum + (Number.isFinite(row.totalCostWithIpi) ? row.totalCostWithIpi : row.totalCost), 0);
    const totalSuggested = appliedRows.reduce((sum, row) => sum + (Number.isFinite(row.suggestedTotal) ? row.suggestedTotal : 0), 0);
    const totalDelta = totalSuggested - totalCostWithIpi;
    const exceptions = appliedRows.filter((row) => row.isException).length;
    const freightRate = appliedRows.length ? (appliedRows[0].freightRate || 0) : 0;
    const cards = [
      ['Itens importados', String(appliedRows.length)],
      ['Produtos XML', formatCurrency(totalCost)],
      ['IPI do XML', formatCurrency(totalIpi)],
      ['Base c/ IPI', formatCurrency(totalCostWithIpi)],
      ['Frete', formatCurrency(freightValue) + ' (' + formatNumber(freightRate * 100, 2) + '%)'],
      ['Perfil padr\u00e3o', activeProfile ? getProfileLabel(activeProfile) : 'Sem perfil padr\u00e3o'],
      ['Exce\u00e7\u00f5es', exceptions ? String(exceptions) + ' item(ns)' : 'Nenhuma'],
      ['Total sugerido', formatCurrency(totalSuggested) + ' (' + (totalDelta >= 0 ? '+' : '') + formatCurrency(totalDelta) + ')']
    ];
    return '<div class="summary">' + cards.map((card) => '<div class="stat"><span class="stat-label">' + escapeHtml(card[0]) + '</span><div class="stat-value">' + escapeHtml(card[1]) + '</div></div>').join('') + '</div>';
  }

  function buildRowOptions(activeProfile, selectedOverrideId) {
    const baseLabel = activeProfile ? 'Padr\u00e3o global | ' + getProfileLabel(activeProfile) : 'Padr\u00e3o global';
    const options = ['<option value="">' + escapeHtml(baseLabel) + '</option>'];
    storedProfiles.forEach((profile) => {
      const selected = selectedOverrideId && profile.id === selectedOverrideId ? ' selected' : '';
      options.push('<option value="' + escapeHtml(profile.id) + '"' + selected + '>' + escapeHtml(getProfileLabel(profile)) + '</option>');
    });
    return options.join('');
  }

  function syncImportPopupRowActions(context, appliedRows) {
    if (!context || context.mode !== 'import-popup' || !context.tableBody) return;

    const domRows = Array.from(context.tableBody.querySelectorAll('tr'));
    domRows.forEach((tr, index) => {
      const row = appliedRows[index] || null;
      const pencil = tr.querySelector('td:nth-child(3) .btn-select-action');
      tr.setAttribute('data-zweb-row-key', row ? row.key : '');

      if (!pencil) return;
      if (!pencil.hasAttribute('data-zweb-original-title')) {
        pencil.setAttribute('data-zweb-original-title', pencil.getAttribute('title') || '');
      }

      if (!row || !isFeatureEnabled('stockPriceSimulationEnabled') || !row.sourceCode || !Number.isFinite(row.suggestedUnit)) {
        pencil.removeAttribute('data-zweb-action');
        pencil.removeAttribute('data-zweb-simulate-source');
        pencil.removeAttribute('data-row-key');
        pencil.removeAttribute('data-code');
        pencil.removeAttribute('data-description');
        pencil.removeAttribute('data-target-price');
        pencil.classList.remove('zweb-inline-sim-pencil');
        pencil.setAttribute('title', pencil.getAttribute('data-zweb-original-title') || '');
        return;
      }

      const targetPrice = normalizeSuggestedPrice(row.suggestedUnit);
      if (!Number.isFinite(targetPrice)) {
        pencil.removeAttribute('data-zweb-action');
        pencil.removeAttribute('data-zweb-simulate-source');
        pencil.removeAttribute('data-row-key');
        pencil.removeAttribute('data-code');
        pencil.removeAttribute('data-description');
        pencil.removeAttribute('data-target-price');
        pencil.classList.remove('zweb-inline-sim-pencil');
        pencil.setAttribute('title', pencil.getAttribute('data-zweb-original-title') || '');
        return;
      }

      pencil.setAttribute('data-zweb-action', 'simulate-stock-price');
      pencil.setAttribute('data-zweb-simulate-source', 'import-popup-pencil');
      pencil.setAttribute('data-row-key', row.key);
      pencil.setAttribute('data-code', row.sourceCode);
      pencil.setAttribute('data-description', row.description);
      pencil.setAttribute('data-target-price', String(targetPrice));
      pencil.setAttribute('title', 'Editar produto e aplicar preco sugerido');
      pencil.classList.add('zweb-inline-sim-pencil');
    });
  }

  function buildTable(appliedRows, activeProfile, contextMode) {
    const hasAnyIpi = appliedRows.some((row) => row.hasIpi);
    const rowsMarkup = appliedRows.map((row) => {
      const meta = [];
      if (row.itemNumber) meta.push('Linha ' + row.itemNumber);
      if (row.unit) meta.push(row.unit);
      if (row.cfop) meta.push('CFOP ' + row.cfop);
      if (row.stockDisplay) meta.push('Cadastro ' + row.stockDisplay);
      else if (row.sourceCode) meta.push('C\u00f3digo ' + row.sourceCode);
      if (row.barCode) meta.push('Barras ' + row.barCode);
      if (row.hasIpi) meta.push('IPI total ' + formatCurrency(row.ipiAmount));
      const noteParts = [
        row.isException
          ? 'Exce\u00e7\u00e3o aplicada nesta linha. Perfil atual: ' + getProfileLabel(row.appliedProfile)
          : 'Usando o perfil padr\u00e3o desta leitura.'
      ];
      if (row.hasIpi) {
        const ipiPieces = [];
        if (Number.isFinite(row.ipiPercent) && row.ipiPercent > 0) ipiPieces.push('IPI ' + formatNumber(row.ipiPercent, 2) + '%');
        if (Number.isFinite(row.unitIpi) && row.unitIpi > 0) ipiPieces.push('+' + formatCurrency(row.unitIpi) + '/un');
        noteParts.push('XML com ' + ipiPieces.join(' | ') + ' inclu\u00eddo automaticamente.');
      }
      const note = noteParts.join(' ');
      return '<tr>'
        + '<td><div class="item-head"><div class="item-name">' + escapeHtml(row.description || 'Item sem descri\u00e7\u00e3o') + '</div></div><span class="item-meta">' + escapeHtml(meta.join(' | ')) + '</span><span class="badge-slot"><span class="badgex' + (row.isException ? '' : ' is-hidden') + '">Exce\u00e7\u00e3o</span></span></td>'
        + '<td class="profile-col"><select class="row-select" data-zweb-role="row-profile" data-row-key="' + escapeHtml(row.key) + '">' + buildRowOptions(activeProfile, row.overrideProfile ? row.overrideProfile.id : '') + '</select><span class="row-note">' + escapeHtml(note) + '</span></td>'
        + '<td class="qty">' + escapeHtml(formatNumber(row.quantity, 2)) + '</td>'
        + '<td class="money">' + escapeHtml(formatCurrency(Number.isFinite(row.unitCostWithIpi) ? row.unitCostWithIpi : row.unitCost)) + '</td>'
        + '<td class="money">' + escapeHtml(Number.isFinite(row.suggestedUnit) ? formatCurrency(row.suggestedUnit) : '--') + '</td>'
        + '<td class="money delta">' + escapeHtml(Number.isFinite(row.delta) ? ((row.delta >= 0 ? '+' : '') + formatCurrency(row.delta)) : '--') + '</td>'
        + '<td class="money">' + escapeHtml(Number.isFinite(row.suggestedTotal) ? formatCurrency(row.suggestedTotal) : '--') + '</td>'
        + '</tr>';
    }).join('');
    return '<div class="wrap"><table><colgroup><col class="col-item"><col class="profile-col"><col class="col-qty"><col class="col-cost"><col class="col-suggested"><col class="col-delta"><col class="col-total"></colgroup><thead><tr><th>Item</th><th class="profile-col">Par\u00e2metro</th><th class="qty">Qtd.</th><th class="money">' + escapeHtml(hasAnyIpi ? 'Custo + IPI' : 'Custo unit.') + '</th><th class="money">Sugest\u00e3o unit.</th><th class="money">Diferen\u00e7a</th><th class="money">Total sugerido</th></tr></thead><tbody>' + rowsMarkup + '</tbody></table></div>';
  }

  function buildEmpty(message) {
    return '<div class="empty">' + escapeHtml(message) + '</div>';
  }

  function getContextCopy(context, appliedRows, activeProfile) {
    const hasExceptions = appliedRows.filter((row) => row.isException).length > 0;
    const hasIpi = appliedRows.some((row) => row.hasIpi);
    return {
      emptyRowsSubtitle: 'Aguardando os itens do XML dentro do popup de importa\u00e7\u00e3o.',
      noRowsMessage: 'Abra a etapa Produtos do popup de importa\u00e7\u00e3o para listar os itens do XML aqui.',
      note: 'Leitura auxiliar do XML antes de concluir a importa\u00e7\u00e3o. O frete informado aqui \u00e9 rateado por valor dos produtos e somado ao c\u00e1lculo final. O IPI de cada item vindo do XML entra automaticamente na base do c\u00e1lculo. Este painel n\u00e3o salva a compra e n\u00e3o altera o estoque automaticamente. Se algum item usar outra margem, escolha a exce\u00e7\u00e3o diretamente na linha.',
      rowsSubtitle: 'Perfil padr\u00e3o: ' + (activeProfile ? getProfileLabel(activeProfile) : 'Sem perfil padr\u00e3o') + (hasExceptions ? ' | Exce\u00e7\u00f5es aplicadas em linhas espec\u00edficas.' : ' | Sem exce\u00e7\u00f5es nesta importa\u00e7\u00e3o.') + (hasIpi ? ' | IPI do XML inclu\u00eddo automaticamente.' : '')
    };
  }

  function computeSignature(context, activeProfile, appliedRows, themeMode) {
    const profileSig = storedProfiles.map((profile) => [profile.id, profile.name, profile.basePercent, profile.extraPercent].join(':')).join('|');
    const xmlSig = parsedXmlItems.map((item) => [item.itemNumber, item.code, item.description, item.quantity, item.unitCost, item.ipiPercent, item.ipiAmount, item.unitIpi].join(':')).join('|');
    const overrideSig = Object.keys(rowOverrides).sort().map((key) => key + ':' + rowOverrides[key]).join('|');
    const rowSig = appliedRows.map((row) => [row.key, row.sourceCode, row.stockDisplay, row.appliedProfile ? row.appliedProfile.id : '', row.ipiPercent, row.ipiAmount, row.unitIpi, row.unitCostWithIpi, row.suggestedUnit, row.suggestedTotal].join(':')).join('|');
    return [context && context.mode, themeMode, isFeatureEnabled(FEATURE_KEY), isFeatureEnabled('stockPriceSimulationEnabled'), selectedProfileId, activeProfile ? activeProfile.id : '', panelCollapsed, freightValue, freightTouched, freightSyncPending, profileSig, xmlSig, overrideSig, rowSig].join('||');
  }

  function renderRoot(root, context) {
    const rows = readImportedRows(context);
    pruneOverrides(rows);
    const activeProfile = getActiveProfile();
    const appliedRows = getAppliedRows(rows, activeProfile);
    const themeMode = resolveThemeMode(context, root);
    const signature = computeSignature(context, activeProfile, appliedRows, themeMode);
    if (signature === lastSignature) {
      root.className = (panelCollapsed ? 'is-collapsed ' : '') + (context && context.mode === 'import-popup' ? 'is-import-popup ' : 'is-purchase ') + 'is-' + themeMode;
      syncImportPopupRowActions(context, appliedRows);
      return;
    }
    lastSignature = signature;
    const totalCost = appliedRows.reduce((sum, row) => sum + row.totalCost, 0);
    const freightRate = totalCost > 0 && freightValue > 0 ? freightValue / totalCost : 0;
    const freightHelp = totalCost > 0
      ? 'Rateio atual: ' + formatNumber(freightRate * 100, 2) + '% sobre ' + formatCurrency(totalCost)
      : 'Informe o frete para somar a taxa proporcional sobre os itens.';
    const profileOptions = storedProfiles.length
      ? storedProfiles.map((profile) => '<option value="' + escapeHtml(profile.id) + '"' + (activeProfile && profile.id === activeProfile.id ? ' selected' : '') + '>' + escapeHtml(getProfileLabel(profile)) + '</option>').join('')
      : '<option value="">Nenhum par\u00e2metro salvo</option>';
    const copy = getContextCopy(context, appliedRows, activeProfile);
    let subtitle = copy.rowsSubtitle;
    let bodyMarkup = '';
    if (!storedProfiles.length) {
      subtitle = 'Sem par\u00e2metros dispon\u00edveis para aplicar nesta leitura.';
      bodyMarkup = buildEmpty('Cadastre pelo menos um par\u00e2metro em Fiscal > Configura\u00e7\u00f5es > Notas fiscais > C\u00e1lculo de Valores.');
    } else if (!rows.length) {
      subtitle = copy.emptyRowsSubtitle;
      bodyMarkup = buildEmpty(copy.noRowsMessage);
    } else if (appliedRows.some((row) => !Number.isFinite(row.multiplier))) {
      subtitle = 'Um ou mais perfis n\u00e3o puderam ser calculados.';
      bodyMarkup = buildEmpty('Revise os percentuais do perfil padr\u00e3o ou das exce\u00e7\u00f5es aplicadas.');
    } else {
      bodyMarkup = buildSummary(appliedRows, activeProfile) + buildTable(appliedRows, activeProfile, context && context.mode);
    }
    root.className = (panelCollapsed ? 'is-collapsed ' : '') + (context && context.mode === 'import-popup' ? 'is-import-popup ' : 'is-purchase ') + 'is-' + themeMode;
    root.innerHTML = '<div class="cardx"><div class="head"><div class="head-main"><button type="button" class="collapse-btn" data-zweb-action="collapse" aria-expanded="' + escapeHtml(String(!panelCollapsed)) + '" aria-label="' + (panelCollapsed ? 'Expandir painel' : 'Recolher painel') + '"><span class="chev" aria-hidden="true">&#9662;</span></button><div class="head-copy"><h3 class="title">C\u00e1lculo de Valores</h3><p class="subtitle">' + escapeHtml(subtitle) + '</p></div></div><div class="controls"><div class="control"><label for="' + ROOT_ID + '-profile">Par\u00e2metro padr\u00e3o</label><select id="' + ROOT_ID + '-profile">' + profileOptions + '</select></div><div class="control control-freight"><label for="' + ROOT_ID + '-freight">Frete R$</label><input id="' + ROOT_ID + '-freight" class="control-input" type="text" inputmode="decimal" value="' + escapeHtml(formatMoneyInput(freightValue)) + '"><span class="control-help">' + escapeHtml(freightHelp) + '</span></div><button type="button" class="refresh" data-zweb-action="refresh">Atualizar leitura</button></div></div><div class="body"><div class="note">' + escapeHtml(copy.note) + '</div>' + bodyMarkup + '</div></div>';
    syncImportPopupRowActions(context, appliedRows);
  }

  function removeRoot() {
    const root = document.getElementById(ROOT_ID);
    if (root && root.parentElement) root.parentElement.removeChild(root);
    lastSignature = '';
  }
  function ensureUi() {
    ensureUiScheduled = false;
    if (!isTargetRoute() || !isFeatureEnabled(FEATURE_KEY)) {
      removeRoot();
      return;
    }
    bindImportedFileInput();
    hydrateFreightFromMainForm();
    syncPendingFreightToMainForm();
    ensureStyle();
    const context = getActiveContext();
    if (!context) {
      removeRoot();
      return;
    }
    const root = ensureRoot(context);
    if (!root) return;
    renderRoot(root, context);
  }

  function scheduleEnsureUi() {
    if (ensureUiScheduled) return;
    ensureUiScheduled = true;
    const run = () => ensureUi();
    if (typeof window.requestAnimationFrame === 'function') {
      window.requestAnimationFrame(run);
      return;
    }
    window.setTimeout(run, 16);
  }

  function persistSelectedProfile() {
    try {
      chrome.storage.local.set({ [SELECTED_PROFILE_KEY]: selectedProfileId });
    } catch (error) {}
  }

  function syncStorageState() {
    try {
      chrome.storage.local.get(Object.assign({}, FEATURE_DEFAULTS, {
        [PROFILE_STORAGE_KEY]: [],
        [SELECTED_PROFILE_KEY]: ''
      }), (stored) => {
        applyFeatureState(stored);
        storedProfiles = cloneProfiles(stored[PROFILE_STORAGE_KEY]);
        selectedProfileId = String(stored[SELECTED_PROFILE_KEY] || '');
        scheduleEnsureUi();
      });
    } catch (error) {}
  }

  function ensureObserver() {
    const context = getActiveContext();
    const node = (context && context.host) || getPurchaseForm() || document.body;
    if (!node) return;
    if (observer && observedNode === node) return;
    if (observer) observer.disconnect();
    observedNode = node;
    observer = new MutationObserver(() => scheduleEnsureUi());
    observer.observe(node, { childList: true, subtree: true });
  }

  function initStorageListener() {
    try {
      chrome.storage.onChanged.addListener((changes, area) => {
        if (area !== 'local') return;
        let shouldRefresh = false;
        if (changes[PROFILE_STORAGE_KEY]) {
          storedProfiles = cloneProfiles(changes[PROFILE_STORAGE_KEY].newValue);
          shouldRefresh = true;
        }
        if (changes[SELECTED_PROFILE_KEY]) {
          selectedProfileId = String(changes[SELECTED_PROFILE_KEY].newValue || '');
          shouldRefresh = true;
        }
        Object.keys(FEATURE_DEFAULTS).forEach((key) => {
          if (!changes[key]) return;
          applyFeatureState({ [key]: changes[key].newValue });
          shouldRefresh = true;
        });
        if (shouldRefresh) scheduleEnsureUi();
      });
    } catch (error) {}
  }

  loadSessionState();
  syncStorageState();
  initStorageListener();
  ensureObserver();

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', scheduleEnsureUi, { once: true });
  } else {
    scheduleEnsureUi();
  }

  window.addEventListener('hashchange', () => {
    loadSessionState();
    ensureObserver();
    scheduleEnsureUi();
  });

  window.setInterval(() => {
    ensureObserver();
    scheduleEnsureUi();
  }, 1500);
})();
