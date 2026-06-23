(function() {
  'use strict';

  const CONTENT_SOURCE = 'zweb-xml-content-script';
  const BRIDGE_SOURCE = 'zweb-xml-page-bridge';
  const ARM_TTL_MS = 15000;
  const POLL_INTERVAL_MS = 300;
  const PRODUCT_PAGINATE_URL_FRAGMENT = 'inventory.get-product-paginate';
  const PURCHASE_DETAILED_URL_FRAGMENT = 'consumers.find-detailed-purchase';
  const BFF_DASHBOARD_URL_FRAGMENT = 'BFF.get-dashboard';
  const APPLICATION_PUT_CONFIGURATION_URL_FRAGMENT = 'application.put-configuration';
  const DOCUMENT_NEGATIVE_STOCK_CONFIGURATION_STORAGE_KEY = 'zwebDocumentNegativeStockConfigurationPayload';
  const PERSON_POST_URL_FRAGMENT = 'person.post-person';
  const PERSON_PUT_URL_FRAGMENT = 'person.put-person';
  const NFE_GET_LIST_URL_FRAGMENT = 'fiscal.get-nfe';
  const NFCE_SELLER_OBSERVATION_URL_FRAGMENTS = [
    'fiscal.post-nfce',
    'fiscal.put-nfce',
    'fiscal.transmit-nfce'
  ];
  const NFCE_TRANSMIT_URL_FRAGMENT = 'fiscal.transmit-nfce';
  const NFCE_COMPLEMENTARY_INFO_URL_FRAGMENT = 'fiscal.get-complementary-information-by-document';
  const NFCE_SELLER_OBSERVATION_PREFIX = 'Vendedor:';
  const PDV_CASH_COUNTER_STORAGE_KEY = 'zwebPdvCashCounterState';
  const PDV_CASH_COUNTER_DEBUG_STORAGE_KEY = 'zwebPdvCashCounterDebug';
  const PDV_CASH_COUNTER_MAX_SIGNATURES = 300;
  const LOCAL_DECIMAL_PREFS_STORAGE_KEY = 'zwebLocalDecimalPreferences';
  const GLOBAL_DECIMAL_CONFIG_STORAGE_KEY = 'zwebGlobalDecimalConfig';
  const PROTECTED_GLOBAL_DECIMAL_CONFIG = Object.freeze({
    decimalQuantity: 2,
    decimalPrice: 2
  });
  const NFE_ROUTE_FRAGMENT = '/fiscal/nfe';
  const NFCE_ROUTE_FRAGMENTS = ['/fiscal/nfce', '/fiscal/pdv'];
  const FISCAL_DOCUMENT_MODEL_NFE = '55';
  const FISCAL_DOCUMENT_MODEL_NFCE = '65';
  const NFE_NEW_ROUTE_FRAGMENT = '/fiscal/nfe/new';
  const NFE_ITEM_SEARCH_URL_FRAGMENTS = [
    'inventory.search-products-for-documents',
    'inventory.get-composition-kit-to-import'
  ];
  const PERSON_EDIT_ROUTE_FRAGMENTS = ['/register/client/edit/', '/register/supplier/edit/'];
  const SUPPLIER_EDIT_ROUTE_FRAGMENT = '/register/supplier/edit/';
  const SUPPLIER_BUSINESS_NAME_SELECTOR = '[data-zweb-supplier-business-name-field="true"], #person\\.businessName, #zweb-supplier-business-name';
  const BRIDGE_VERSION = '20260612-2';

  if (window.__zwebXmlPageBridgeInstalled === BRIDGE_VERSION) return;
  window.__zwebXmlPageBridgeInstalled = BRIDGE_VERSION;

  const pendingRequests = new Map();
  const nativeOpen = window.open;
  const nativeFetch = typeof window.fetch === 'function' ? window.fetch.bind(window) : null;
  const nativeXhrOpen = XMLHttpRequest.prototype.open;
  const nativeXhrSend = XMLHttpRequest.prototype.send;

  function now() {
    return Date.now();
  }

  function cleanupPendingRequests() {
    const cutoff = now() - ARM_TTL_MS;
    for (const [key, pending] of pendingRequests.entries()) {
      if (!pending || pending.armedAt < cutoff) {
        pendingRequests.delete(key);
      }
    }
  }

  function getLatestPendingRequest() {
    cleanupPendingRequests();

    let latest = null;
    for (const pending of pendingRequests.values()) {
      if (!latest || pending.armedAt > latest.armedAt) {
        latest = pending;
      }
    }

    return latest;
  }

  function postBridgeMessage(type, payload) {
    const message = Object.assign({
      source: BRIDGE_SOURCE,
      type: type
    }, payload || {});
    window.postMessage(message, '*');
    try {
      window.dispatchEvent(new CustomEvent(BRIDGE_SOURCE, { detail: message }));
    } catch (error) {}
  }

  function normalizeText(value) {
    return String(value || '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/\s+/g, ' ')
      .trim()
      .toLowerCase();
  }

  function isHashFeatureEnabled() {
    return !document.documentElement || document.documentElement.dataset.zwebItemSearchHashEnabled !== 'false';
  }

  function isTargetNfeNewRoute() {
    return String(window.location.href || '').toLowerCase().indexOf(NFE_NEW_ROUTE_FRAGMENT) !== -1;
  }

  function getNormalizedHashRoute() {
    const hash = String(window.location.hash || '').toLowerCase();
    const route = hash.replace(/^#/, '').split('?')[0].split('&')[0].replace(/\/+$/, '');
    return route || '';
  }

  function isTargetNfeListRoute() {
    return getNormalizedHashRoute() === NFE_ROUTE_FRAGMENT;
  }

  function isTargetNfeRoute() {
    return String(window.location.href || '').toLowerCase().indexOf(NFE_ROUTE_FRAGMENT) !== -1;
  }

  function isTargetNfceSellerObservationRoute() {
    const href = String(window.location.href || '').toLowerCase();
    return NFCE_ROUTE_FRAGMENTS.some((fragment) => href.indexOf(fragment) !== -1);
  }

  function isTargetPdvRoute() {
    return String(window.location.href || '').toLowerCase().indexOf('/fiscal/pdv') !== -1;
  }

  function isTargetPersonEditRoute() {
    const href = String(window.location.href || '').toLowerCase();
    return PERSON_EDIT_ROUTE_FRAGMENTS.some((fragment) => href.indexOf(fragment) !== -1);
  }

  function isTargetSupplierEditRoute() {
    return String(window.location.href || '').toLowerCase().indexOf(SUPPLIER_EDIT_ROUTE_FRAGMENT) !== -1;
  }

  function getPersonEditRouteId() {
    const href = String(window.location.href || '');
    const match = href.match(/\/register\/(?:client|supplier)\/edit\/([^/?#&]+)/i);
    if (!match) return null;
    const value = decodeURIComponent(match[1] || '').trim();
    return /^\d+$/.test(value) ? Number(value) : value || null;
  }

  function isTargetNfeItemSearchInput(input) {
    if (!input || input.tagName !== 'INPUT') return false;
    if (!input.matches || !input.matches('input.multiselect__input')) return false;
    if (!isTargetNfeNewRoute()) return false;
    if (!isHashFeatureEnabled()) return false;

    const ariaControls = input.getAttribute('aria-controls') || '';
    const ariaLabel = input.getAttribute('aria-label') || '';
    if (ariaControls.indexOf('listbox-z-select-') !== 0 || ariaLabel.indexOf('searchbox') === -1) {
      return false;
    }

    const containers = [
      input.closest('.accordion-item'),
      input.closest('.accordion-body'),
      input.closest('.row'),
      input.closest('.col, [class*="col-"]'),
      input.closest('.z-select-item')
    ].filter(Boolean);

    return containers.some((container) => {
      const text = normalizeText((container.innerText || container.textContent || '').slice(0, 320));
      return text.indexOf('item') !== -1
        && text.indexOf('quantidade') !== -1
        && (
          text.indexOf('valor unitario') !== -1
          || text.indexOf('valor unitario r$') !== -1
          || text.indexOf('desconto') !== -1
        );
    });
  }

  function setInputValueAndNotify(input, nextValue) {
    const descriptor = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value');
    if (descriptor && descriptor.set) {
      descriptor.set.call(input, String(nextValue == null ? '' : nextValue));
    } else {
      input.value = String(nextValue == null ? '' : nextValue);
    }

    input.dispatchEvent(new Event('input', { bubbles: true, composed: true }));
    input.dispatchEvent(new Event('change', { bubbles: true, composed: true }));
  }

  function getNormalizedHashValue(value) {
    const current = String(value || '').trim();
    if (!current) return current;
    if (/^\d+$/.test(current)) return '#' + current;
    if (current.charAt(0) === '#') {
      const rest = current.slice(1);
      if (!/^\d+$/.test(rest)) return rest;
    }
    return current;
  }

  function applyNfeItemHashNormalization(input) {
    if (!isTargetNfeItemSearchInput(input)) return false;
    const current = String(input.value || '').trim();
    const nextValue = getNormalizedHashValue(current);
    if (!nextValue || nextValue === current) return false;
    setInputValueAndNotify(input, nextValue);
    return true;
  }

  function handleNfeItemHashInput(event) {
    const input = event && event.target;
    if (!isTargetNfeItemSearchInput(input)) return;
    applyNfeItemHashNormalization(input);
    setTimeout(() => applyNfeItemHashNormalization(input), 80);
  }

  function syncVisibleNfeItemHashInputs() {
    if (!isTargetNfeNewRoute() || !isHashFeatureEnabled()) return;
    Array.from(document.querySelectorAll('input.multiselect__input')).forEach((input) => {
      if (!isTargetNfeItemSearchInput(input)) return;
      applyNfeItemHashNormalization(input);
    });
  }

  function safeParseJson(text) {
    try {
      return JSON.parse(text);
    } catch (error) {
      return null;
    }
  }

  function getRequestUrl(input) {
    if (typeof input === 'string') return input;
    if (input && typeof input.url === 'string') return input.url;
    return '';
  }

  function getAbsoluteUrl(value) {
    try {
      return new URL(String(value || ''), window.location.href);
    } catch (error) {
      return null;
    }
  }

  function readLocalStorageJson(key) {
    try {
      const value = window.localStorage && window.localStorage.getItem(key);
      const parsed = safeParseJson(value || '{}');
      return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {};
    } catch (error) {
      return {};
    }
  }

  function writeLocalStorageJson(key, value) {
    try {
      window.localStorage && window.localStorage.setItem(key, JSON.stringify(value || {}));
    } catch (error) {}
  }

  function decodeBase64UrlJson(value) {
    try {
      let input = String(value || '').replace(/-/g, '+').replace(/_/g, '/');
      while (input.length % 4) input += '=';
      const decoded = window.atob(input);
      const bytes = Array.from(decoded, (char) => char.charCodeAt(0));
      const json = decodeURIComponent(bytes.map((byte) => '%' + ('00' + byte.toString(16)).slice(-2)).join(''));
      return safeParseJson(json);
    } catch (error) {
      return null;
    }
  }

  function getStoredTokenPayload() {
    try {
      const token = window.localStorage && window.localStorage.getItem('token');
      const parts = String(token || '').split('.');
      return parts.length >= 2 ? decodeBase64UrlJson(parts[1]) : null;
    } catch (error) {
      return null;
    }
  }

  function normalizeIdentityPart(value) {
    return String(value == null ? '' : value).trim();
  }

  function getLocalDecimalIdentityFromToken() {
    const payload = getStoredTokenPayload();
    if (!payload || typeof payload !== 'object') return null;

    const company = payload.cpn || {};
    const user = payload.usr || {};
    const companyId = normalizeIdentityPart(company.uuid || company.id || company.identification);
    const userId = normalizeIdentityPart(user.uuid || user.id || user.email || payload.sub);
    if (!companyId || !userId) return null;

    return {
      companyId,
      userId,
      companyName: normalizeIdentityPart(company.name),
      userName: normalizeIdentityPart(user.name || user.email)
    };
  }

  function getDashboardPayloadRoot(payload) {
    if (!payload || typeof payload !== 'object' || Array.isArray(payload)) return null;
    return payload.data && typeof payload.data === 'object' && !Array.isArray(payload.data)
      ? payload.data
      : payload;
  }

  function getLocalDecimalIdentityFromDashboardPayload(payload) {
    const root = getDashboardPayloadRoot(payload);
    if (!root) return null;

    const profile = root['get-profile'] || root.getProfile || {};
    const client = root['get-client'] || root.getClient || {};
    const companyId = normalizeIdentityPart(client.uuid || client.id || client.identification);
    const userId = normalizeIdentityPart(profile.uuid || profile.id || profile.email);
    if (!companyId || !userId) return null;

    return {
      companyId,
      userId,
      companyName: normalizeIdentityPart(client.name || client.businessName),
      userName: normalizeIdentityPart(profile.name || profile.email)
    };
  }

  function getLocalDecimalIdentity(payload) {
    return getLocalDecimalIdentityFromDashboardPayload(payload) || getLocalDecimalIdentityFromToken();
  }

  function getLocalDecimalPreferenceKey(identity) {
    if (!identity || !identity.companyId || !identity.userId) return '';
    return identity.companyId + '::' + identity.userId;
  }

  function getCompanyDecimalConfigKey(identity) {
    if (!identity || !identity.companyId) return '';
    return 'company::' + identity.companyId;
  }

  function normalizeDecimalDigits(value, min, max) {
    const number = Number(String(value == null ? '' : value).replace(',', '.'));
    if (!Number.isFinite(number)) return null;
    const integer = Math.round(number);
    return Math.max(min, Math.min(integer, max));
  }

  function normalizeLocalDecimalPreference(value) {
    if (!value || typeof value !== 'object') return null;

    const decimalPrice = normalizeDecimalDigits(value.decimalPrice, 2, 10);
    const decimalQuantity = normalizeDecimalDigits(value.decimalQuantity, 2, 4);
    if (decimalPrice == null && decimalQuantity == null) return null;

    const normalized = {};
    if (decimalPrice != null) normalized.decimalPrice = decimalPrice;
    if (decimalQuantity != null) normalized.decimalQuantity = decimalQuantity;
    return normalized;
  }

  function getClientFiscalEmitter(client) {
    return client
      && typeof client === 'object'
      && client.fiscal
      && typeof client.fiscal === 'object'
      && client.fiscal.emissor
      && typeof client.fiscal.emissor === 'object'
      ? client.fiscal.emissor
      : null;
  }

  function hasDocumentNegativeStockConfiguration(payload) {
    const emitter = getClientFiscalEmitter(payload);
    return !!(emitter && Object.prototype.hasOwnProperty.call(emitter, 'isAllowedNegativeStock'));
  }

  function storeDocumentNegativeStockConfigurationPayload(payload) {
    if (!hasDocumentNegativeStockConfiguration(payload)) return;
    try {
      window.localStorage && window.localStorage.setItem(DOCUMENT_NEGATIVE_STOCK_CONFIGURATION_STORAGE_KEY, JSON.stringify(payload));
    } catch (error) {}
  }

  function postDocumentNegativeStockConfigurationSnapshot(payload) {
    if (!hasDocumentNegativeStockConfiguration(payload)) return;
    storeDocumentNegativeStockConfigurationPayload(payload);

    const emitter = getClientFiscalEmitter(payload);
    postBridgeMessage('document-negative-stock-configuration-request', {
      enabled: emitter.isAllowedNegativeStock === true,
      payload: payload
    });
  }

  function maybePostDocumentNegativeStockConfigurationRequest(url, body) {
    if (!isApplicationPutConfigurationRequest(url)) return;
    if (typeof body !== 'string' || !body) return;

    const payload = safeParseJson(body);
    postDocumentNegativeStockConfigurationSnapshot(payload);
  }

  function getDashboardClient(payload) {
    const root = getDashboardPayloadRoot(payload);
    return root && (root['get-client'] || root.getClient) || null;
  }

  function readLocalDecimalPreference(identity) {
    const key = getLocalDecimalPreferenceKey(identity);
    if (!key) return null;
    const preferences = readLocalStorageJson(LOCAL_DECIMAL_PREFS_STORAGE_KEY);
    return normalizeLocalDecimalPreference(preferences[key]);
  }

  function writeLocalDecimalPreference(identity, preference) {
    const key = getLocalDecimalPreferenceKey(identity);
    const normalized = normalizeLocalDecimalPreference(preference);
    if (!key || !normalized) return;

    const preferences = readLocalStorageJson(LOCAL_DECIMAL_PREFS_STORAGE_KEY);
    preferences[key] = Object.assign({}, preferences[key] || {}, normalized, {
      companyId: identity.companyId,
      userId: identity.userId,
      companyName: identity.companyName || '',
      userName: identity.userName || '',
      updatedAt: new Date().toISOString()
    });
    writeLocalStorageJson(LOCAL_DECIMAL_PREFS_STORAGE_KEY, preferences);
  }

  function readGlobalDecimalConfig(identity) {
    const configs = readLocalStorageJson(GLOBAL_DECIMAL_CONFIG_STORAGE_KEY);
    const userKey = getLocalDecimalPreferenceKey(identity);
    const companyKey = getCompanyDecimalConfigKey(identity);
    return normalizeLocalDecimalPreference(configs[userKey]) || normalizeLocalDecimalPreference(configs[companyKey]);
  }

  function getProtectedGlobalDecimalConfig() {
    return Object.assign({}, PROTECTED_GLOBAL_DECIMAL_CONFIG);
  }

  function writeGlobalDecimalConfig(identity, config) {
    const normalized = normalizeLocalDecimalPreference(config);
    if (!identity || !normalized) return;

    const configs = readLocalStorageJson(GLOBAL_DECIMAL_CONFIG_STORAGE_KEY);
    const userKey = getLocalDecimalPreferenceKey(identity);
    const companyKey = getCompanyDecimalConfigKey(identity);
    const entry = Object.assign({}, normalized, {
      companyId: identity.companyId,
      userId: identity.userId,
      updatedAt: new Date().toISOString()
    });

    if (userKey) configs[userKey] = entry;
    if (companyKey) configs[companyKey] = entry;
    writeLocalStorageJson(GLOBAL_DECIMAL_CONFIG_STORAGE_KEY, configs);
  }

  function applyLocalDecimalPreferenceToEmitter(emitter, preference) {
    const normalized = normalizeLocalDecimalPreference(preference);
    if (!emitter || !normalized) return false;

    let changed = false;
    if (normalized.decimalPrice != null && Number(emitter.decimalPrice) !== normalized.decimalPrice) {
      emitter.decimalPrice = normalized.decimalPrice;
      changed = true;
    }
    if (normalized.decimalQuantity != null && Number(emitter.decimalQuantity) !== normalized.decimalQuantity) {
      emitter.decimalQuantity = normalized.decimalQuantity;
      changed = true;
    }
    return changed;
  }

  function patchDashboardLocalDecimalPayload(payload) {
    const client = getDashboardClient(payload);
    const emitter = getClientFiscalEmitter(client);
    if (!emitter) return false;

    postDocumentNegativeStockConfigurationSnapshot(client);

    const identity = getLocalDecimalIdentity(payload);
    if (!identity) return false;

    writeGlobalDecimalConfig(identity, {
      decimalPrice: emitter.decimalPrice,
      decimalQuantity: emitter.decimalQuantity
    });

    const preference = readLocalDecimalPreference(identity);
    return applyLocalDecimalPreferenceToEmitter(emitter, preference);
  }

  function normalizeDashboardLocalDecimalResponseText(text) {
    if (typeof text !== 'string' || !text) return text;

    const payload = safeParseJson(text);
    if (!patchDashboardLocalDecimalPayload(payload)) return text;

    try {
      return JSON.stringify(payload);
    } catch (error) {
      return text;
    }
  }

  function isAccountGeneralConfigurationRoute() {
    return String(window.location.href || '').toLowerCase().indexOf('/account/general-configuration') !== -1;
  }

  function normalizePutConfigurationLocalDecimalPayload(url, body) {
    if (!isApplicationPutConfigurationRequest(url)) return body;
    if (!isAccountGeneralConfigurationRoute()) return body;
    if (typeof body !== 'string' || !body) return body;

    const payload = safeParseJson(body);
    const emitter = getClientFiscalEmitter(payload);
    if (!emitter) return body;

    const identity = getLocalDecimalIdentity(payload);
    if (!identity) return body;

    const localPreference = normalizeLocalDecimalPreference({
      decimalPrice: emitter.decimalPrice,
      decimalQuantity: emitter.decimalQuantity
    });
    if (localPreference) {
      writeLocalDecimalPreference(identity, localPreference);
    }

    applyLocalDecimalPreferenceToEmitter(emitter, getProtectedGlobalDecimalConfig(identity));

    try {
      return JSON.stringify(payload);
    } catch (error) {
      return body;
    }
  }

  function looksLikeXmlText(text) {
    const normalized = normalizeText(text).slice(0, 200).toLowerCase();
    return normalized.indexOf('<?xml') === 0
      || normalized.indexOf('<nfeproc') === 0
      || normalized.indexOf('<nfe') === 0
      || normalized.indexOf('<proc') === 0;
  }

  function isNfeItemSearchRequest(url) {
    const value = String(url || '');
    return NFE_ITEM_SEARCH_URL_FRAGMENTS.some((fragment) => value.indexOf(fragment) !== -1);
  }

  function isPurchaseDetailedRequest(url) {
    return String(url || '').indexOf(PURCHASE_DETAILED_URL_FRAGMENT) !== -1;
  }

  function isDashboardRequest(url) {
    return String(url || '').indexOf(BFF_DASHBOARD_URL_FRAGMENT) !== -1;
  }

  function isApplicationPutConfigurationRequest(url) {
    return String(url || '').indexOf(APPLICATION_PUT_CONFIGURATION_URL_FRAGMENT) !== -1;
  }

  function isPersonPostRequest(url) {
    return String(url || '').indexOf(PERSON_POST_URL_FRAGMENT) !== -1;
  }

  function isPersonPutRequest(url) {
    return String(url || '').indexOf(PERSON_PUT_URL_FRAGMENT) !== -1;
  }

  function normalizePersonEditRequestUrl(url) {
    if (!isTargetPersonEditRoute() || !isPersonPostRequest(url)) return url;
    return String(url || '').replace(PERSON_POST_URL_FRAGMENT, PERSON_PUT_URL_FRAGMENT);
  }

  function isNfeListRequest(url) {
    const value = String(url || '');
    return value.indexOf(NFE_GET_LIST_URL_FRAGMENT) !== -1
      && value.indexOf('fiscal.get-detailed-nfe') === -1;
  }

  function isNfceSellerObservationRequest(url) {
    const value = String(url || '');
    return NFCE_SELLER_OBSERVATION_URL_FRAGMENTS.some((fragment) => value.indexOf(fragment) !== -1);
  }

  function isNfceTransmitRequest(url) {
    return String(url || '').indexOf(NFCE_TRANSMIT_URL_FRAGMENT) !== -1;
  }

  function isFiscalCancelRequest(url) {
    const text = String(url || '').toLowerCase();
    return text.indexOf('fiscal') !== -1
      && (
        text.indexOf('cancel') !== -1
        || text.indexOf('evento') !== -1
        || text.indexOf('event') !== -1
      );
  }

  function postFiscalCancelRequestLog(url, requestBody, responseText, status) {
    if (!isFiscalCancelRequest(url)) return;
    postBridgeMessage('fiscal-cancel-request-log', {
      url: String(url || ''),
      requestBody: typeof requestBody === 'string' ? requestBody.slice(0, 2500) : '',
      responseText: typeof responseText === 'string' ? responseText.slice(0, 2500) : '',
      status: Number(status) || 0
    });
  }

  function isNfceComplementaryInformationRequest(url) {
    return String(url || '').indexOf(NFCE_COMPLEMENTARY_INFO_URL_FRAGMENT) !== -1;
  }

  function normalizeItemSearchTerm(value) {
    const current = String(value || '').trim();
    if (!current) return current;
    if (/^\d+$/.test(current)) return '#' + current;
    if (current.charAt(0) === '#') {
      const rest = current.slice(1);
      if (!/^\d+$/.test(rest)) return rest;
    }
    return current;
  }

  function normalizeNfeItemSearchPayload(url, body) {
    if (!isTargetNfeNewRoute() || !isHashFeatureEnabled()) return body;
    if (!isNfeItemSearchRequest(url)) return body;
    if (typeof body !== 'string' || !body) return body;

    const payload = safeParseJson(body);
    if (!payload || typeof payload !== 'object' || typeof payload.search !== 'string') {
      return body;
    }

    const normalizedSearch = normalizeItemSearchTerm(payload.search);
    if (!normalizedSearch || normalizedSearch === payload.search) {
      return body;
    }

    payload.search = normalizedSearch;
    return JSON.stringify(payload);
  }

  function getSupplierBusinessNameOverride() {
    if (!isTargetPersonEditRoute()) return undefined;
    const input = document.querySelector(SUPPLIER_BUSINESS_NAME_SELECTOR);
    if (!input || typeof input.value === 'undefined') return undefined;
    if (input.getAttribute('data-zweb-business-name-loading') === 'true') return undefined;
    return String(input.value == null ? '' : input.value).trim();
  }

  function applyPersonEditPayloadPatch(payload, routeId, businessNameOverride) {
    if (!payload || typeof payload !== 'object' || Array.isArray(payload)) return false;

    const targets = [payload];
    ['person', 'content'].forEach((key) => {
      const value = payload[key];
      if (value && typeof value === 'object' && !Array.isArray(value) && targets.indexOf(value) === -1) {
        targets.push(value);
      }
    });

    let changed = false;
    targets.forEach((target, index) => {
      const shouldPatchId = index === 0 || Object.prototype.hasOwnProperty.call(target, 'id');
      if (shouldPatchId && String(target.id == null ? '' : target.id) !== String(routeId)) {
        target.id = routeId;
        changed = true;
      }

      const shouldPatchBusinessName = typeof businessNameOverride !== 'undefined'
        && (index === 0 || Object.prototype.hasOwnProperty.call(target, 'businessName'));
      const hasBusinessName = Object.prototype.hasOwnProperty.call(target, 'businessName');
      if (shouldPatchBusinessName && (!hasBusinessName || String(target.businessName == null ? '' : target.businessName) !== businessNameOverride)) {
        target.businessName = businessNameOverride;
        changed = true;
      }
    });

    return changed;
  }

  function normalizePersonEditRequestPayload(url, body) {
    if (!isTargetPersonEditRoute()) return body;
    if (!isPersonPostRequest(url) && !isPersonPutRequest(url)) return body;
    if (typeof body !== 'string' || !body) return body;

    const routeId = getPersonEditRouteId();
    if (routeId == null) return body;

    const payload = safeParseJson(body);
    if (!payload || typeof payload !== 'object' || Array.isArray(payload)) return body;

    const businessNameOverride = getSupplierBusinessNameOverride();
    if (!applyPersonEditPayloadPatch(payload, routeId, businessNameOverride)) return body;

    try {
      return JSON.stringify(payload);
    } catch (error) {
      return body;
    }
  }

  function normalizeDisplayName(value) {
    return String(value || '').replace(/\s+/g, ' ').trim();
  }

  function getPersonDisplayName(value) {
    if (!value) return '';
    if (typeof value === 'string') return normalizeDisplayName(value);
    if (typeof value !== 'object' || Array.isArray(value)) return '';

    const keys = ['name', 'displayName', 'fullName', 'sellerName', 'login', 'email'];
    for (const key of keys) {
      const name = normalizeDisplayName(value[key]);
      if (name) return name;
    }

    return '';
  }

  function getNfceSellerName(dados) {
    if (!dados || typeof dados !== 'object') return '';

    return getPersonDisplayName(dados.seller)
      || getPersonDisplayName(dados.responsibleForImportedDocument);
  }

  function getNfceDadosPayload(payload) {
    if (!payload || typeof payload !== 'object' || Array.isArray(payload)) return null;

    if (payload.document && typeof payload.document === 'object' && !Array.isArray(payload.document)) {
      if (payload.document.dados && typeof payload.document.dados === 'object' && !Array.isArray(payload.document.dados)) {
        return payload.document.dados;
      }
      return payload.document;
    }

    if (payload.dados && typeof payload.dados === 'object' && !Array.isArray(payload.dados)) {
      return payload.dados;
    }

    return payload;
  }

  function normalizeFiscalDocumentModel(value) {
    const text = normalizeText(value);
    if (!text) return '';

    const digits = text.replace(/\D/g, '');
    if (digits === FISCAL_DOCUMENT_MODEL_NFCE) return FISCAL_DOCUMENT_MODEL_NFCE;
    if (digits === FISCAL_DOCUMENT_MODEL_NFE) return FISCAL_DOCUMENT_MODEL_NFE;
    if (text.indexOf('nfc-e') !== -1 || text.indexOf('nfce') !== -1 || text.indexOf('cupom') !== -1) {
      return FISCAL_DOCUMENT_MODEL_NFCE;
    }
    if (text.indexOf('nf-e') !== -1 || text.indexOf('nfe') !== -1) {
      return FISCAL_DOCUMENT_MODEL_NFE;
    }

    return '';
  }

  function getFiscalDocumentModelFromPayload(payload) {
    if (!payload || typeof payload !== 'object' || Array.isArray(payload)) return '';

    const dados = getNfceDadosPayload(payload);
    const sources = [
      payload,
      payload.document,
      payload.dados,
      dados,
      dados && dados.document,
      dados && dados.fiscal
    ].filter((source, index, list) => {
      return source && typeof source === 'object' && !Array.isArray(source) && list.indexOf(source) === index;
    });
    const keys = [
      'modelo',
      'model',
      'mod',
      'documentModel',
      'document_model',
      'documentModelId',
      'documentType',
      'documentTypeId',
      'tipoDocumento',
      'tipo_documento'
    ];

    for (const source of sources) {
      for (const key of keys) {
        const model = normalizeFiscalDocumentModel(source[key]);
        if (model) return model;
      }
    }

    return '';
  }

  function shouldHandleNfceSellerObservationPayload(url, payload) {
    const model = getFiscalDocumentModelFromPayload(payload);
    if (model === FISCAL_DOCUMENT_MODEL_NFE) return false;
    if (model === FISCAL_DOCUMENT_MODEL_NFCE) return true;
    if (isTargetNfeRoute()) return false;
    if (isNfceSellerObservationRequest(url)) return true;
    return isNfceComplementaryInformationRequest(url) && isTargetNfceSellerObservationRoute();
  }

  function upsertNfceSellerObservationLine(currentValue, sellerName) {
    const current = String(currentValue || '').replace(/\r\n/g, '\n').trim();
    const nextLine = NFCE_SELLER_OBSERVATION_PREFIX + ' ' + sellerName;
    const lines = current
      ? current.split('\n').filter((line) => !/^\s*vendedor\s*:/i.test(line))
      : [];

    lines.push(nextLine);
    return lines.join('\n');
  }

  function ensureNfceSellerObservationPayload(url, payload) {
    if (!payload || typeof payload !== 'object' || Array.isArray(payload)) return false;
    if (!shouldHandleNfceSellerObservationPayload(url, payload)) return false;

    const dados = getNfceDadosPayload(payload);
    if (!dados || typeof dados !== 'object' || Array.isArray(dados)) return false;

    const sellerName = getNfceSellerName(dados);
    if (!sellerName) return false;

    if (!dados.observations || typeof dados.observations !== 'object' || Array.isArray(dados.observations)) {
      dados.observations = {};
    }

    const current = dados.observations.editables;
    const next = upsertNfceSellerObservationLine(current, sellerName);
    if (next === String(current || '')) return false;

    dados.observations.editables = next;
    return true;
  }

  function normalizeNfceSellerObservationPayload(url, body) {
    if (!isNfceSellerObservationRequest(url)) return body;
    if (typeof body !== 'string' || !body) return body;

    const payload = safeParseJson(body);
    if (!ensureNfceSellerObservationPayload(url, payload)) return body;

    try {
      return JSON.stringify(payload);
    } catch (error) {
      return body;
    }
  }

  function normalizeOutgoingRequestPayload(url, body) {
    let nextBody = normalizeNfeItemSearchPayload(url, body);
    nextBody = normalizeNfceSellerObservationPayload(url, nextBody);
    nextBody = normalizePutConfigurationLocalDecimalPayload(url, nextBody);
    nextBody = normalizePersonEditRequestPayload(url, nextBody);
    return nextBody;
  }

  function getTodayKey() {
    const nowDate = new Date();
    return [
      nowDate.getFullYear(),
      String(nowDate.getMonth() + 1).padStart(2, '0'),
      String(nowDate.getDate()).padStart(2, '0')
    ].join('-');
  }

  function parsePdvMoney(value) {
    if (typeof value === 'number') return Number.isFinite(value) ? value : NaN;
    const raw = String(value == null ? '' : value).trim();
    if (!raw) return NaN;
    const normalized = raw
      .replace(/[^\d,.-]/g, '')
      .replace(/\.(?=\d{3}(?:\D|$))/g, '')
      .replace(',', '.');
    if (!/\d/.test(normalized)) return NaN;
    const parsed = Number(normalized);
    return Number.isFinite(parsed) ? parsed : NaN;
  }

  function walkPayload(value, visitor, path, seen) {
    if (value == null) return;
    const currentPath = path || [];
    const visited = seen || new Set();
    if (typeof value !== 'object') {
      visitor(value, currentPath);
      return;
    }
    if (visited.has(value)) return;
    visited.add(value);
    if (Array.isArray(value)) {
      value.forEach((entry, index) => walkPayload(entry, visitor, currentPath.concat(String(index)), visited));
      return;
    }
    visitor(value, currentPath);
    Object.keys(value).forEach((key) => walkPayload(value[key], visitor, currentPath.concat(key), visited));
  }

  function getValueByKeys(object, keys) {
    if (!object || typeof object !== 'object' || Array.isArray(object)) return NaN;
    for (const key of Object.keys(object)) {
      const normalized = normalizeText(key);
      if (!keys.some((candidate) => normalized === candidate || normalized.indexOf(candidate) !== -1)) continue;
      const parsed = parsePdvMoney(object[key]);
      if (Number.isFinite(parsed)) return parsed;
    }
    return NaN;
  }

  function isCashPaymentObject(object, path) {
    if (!object || typeof object !== 'object' || Array.isArray(object)) return false;
    const pathText = normalizeText((path || []).join(' '));
    const keyText = normalizeText(Object.keys(object).join(' '));
    const paymentHint = pathText.indexOf('pag') !== -1
      || pathText.indexOf('payment') !== -1
      || keyText.indexOf('pag') !== -1
      || keyText.indexOf('payment') !== -1
      || keyText.indexOf('forma') !== -1
      || keyText.indexOf('meio') !== -1
      || keyText.indexOf('method') !== -1
      || keyText.indexOf('tipo') !== -1
      || keyText.indexOf('type') !== -1;
    if (!paymentHint) return false;

    const textParts = [pathText];
    Object.keys(object).forEach((key) => {
      const value = object[key];
      if (typeof value === 'string' || typeof value === 'number') textParts.push(key + ' ' + value);
    });
    const text = normalizeText(textParts.join(' '));
    return text.indexOf('dinheiro') !== -1
      || text.indexOf('especie') !== -1
      || text.indexOf('espécie') !== -1
      || /\b01\b/.test(text);
  }

  function extractCashAmount(payload) {
    let total = 0;
    if (!payload) return total;
    walkPayload(payload, (value, path) => {
      if (!value || typeof value !== 'object' || Array.isArray(value)) return;
      if (!isCashPaymentObject(value, path)) return;

      const paid = getValueByKeys(value, ['valorrecebido', 'valor recebido', 'received', 'recebido', 'paid', 'pago', 'pagamento', 'payment', 'amount', 'valor']);
      const change = getValueByKeys(value, ['troco', 'change']);
      const amount = getValueByKeys(value, ['valorliquido', 'valor liquido', 'valorfinal', 'valor final', 'amount', 'valor']);
      let contribution = NaN;

      if (Number.isFinite(paid)) {
        contribution = Math.max(0, paid - (Number.isFinite(change) ? change : 0));
      } else if (Number.isFinite(amount)) {
        contribution = Math.max(0, amount - (Number.isFinite(change) ? change : 0));
      }

      if (Number.isFinite(contribution) && contribution > 0) total += contribution;
    }, []);
    return total;
  }

  function extractCashAmountFromPayloads(requestPayload, responsePayload) {
    const requestAmount = extractCashAmount(requestPayload);
    if (Number.isFinite(requestAmount) && requestAmount > 0) return requestAmount;

    const responseAmount = extractCashAmount(responsePayload);
    return Number.isFinite(responseAmount) ? responseAmount : 0;
  }

  function writePdvCashCounterDebug(entry) {
    try {
      const current = JSON.parse(window.localStorage && window.localStorage.getItem(PDV_CASH_COUNTER_DEBUG_STORAGE_KEY) || '[]');
      const list = Array.isArray(current) ? current : [];
      list.push(Object.assign({
        at: new Date().toISOString(),
        route: String(window.location.href || '')
      }, entry || {}));
      window.localStorage && window.localStorage.setItem(PDV_CASH_COUNTER_DEBUG_STORAGE_KEY, JSON.stringify(list.slice(-20)));
    } catch (error) {}
  }

  function getPdvCashCounterSignature(requestPayload, responsePayload, cashAmount) {
    const candidates = [];
    [responsePayload, requestPayload].forEach((payload) => {
      walkPayload(payload, (value, path) => {
        const key = normalizeText((path || []).slice(-1)[0] || '');
        if (!/(id|uuid|numero|number|chave|key|serie|series|protocolo|protocol)/.test(key)) return;
        if (typeof value !== 'string' && typeof value !== 'number') return;
        const text = String(value || '').trim();
        if (text) candidates.push(key + ':' + text);
      }, []);
    });
    return candidates.length
      ? candidates.slice(0, 8).join('|')
      : 'cash:' + cashAmount.toFixed(2) + ':' + new Date().toISOString().slice(0, 16);
  }

  function applyPdvCashCounterTransmit(requestBody, responseText) {
    if (!isTargetPdvRoute()) {
      writePdvCashCounterDebug({ event: 'skip-route' });
      return;
    }
    let requestPayload = null;
    let responsePayload = null;
    try {
      requestPayload = JSON.parse(requestBody || '{}');
    } catch (error) {
      writePdvCashCounterDebug({ event: 'skip-request-json', error: String(error && error.message || error) });
      return;
    }
    try {
      responsePayload = responseText ? JSON.parse(responseText) : null;
    } catch (error) {
      responsePayload = null;
    }

    const cashAmount = extractCashAmountFromPayloads(requestPayload, responsePayload);
    if (!Number.isFinite(cashAmount) || cashAmount <= 0) {
      writePdvCashCounterDebug({
        event: 'skip-no-cash',
        requestKeys: requestPayload && typeof requestPayload === 'object' ? Object.keys(requestPayload).slice(0, 20) : [],
        responseKeys: responsePayload && typeof responsePayload === 'object' ? Object.keys(responsePayload).slice(0, 20) : []
      });
      return;
    }

    let state = {};
    try {
      state = JSON.parse(window.localStorage && window.localStorage.getItem(PDV_CASH_COUNTER_STORAGE_KEY) || '{}');
    } catch (error) {
      state = {};
    }
    if (!state || typeof state !== 'object' || Array.isArray(state) || state.dateKey !== getTodayKey()) {
      state = { dateKey: getTodayKey(), total: 0, count: 0, signatures: [] };
    }
    state.signatures = Array.isArray(state.signatures) ? state.signatures.slice(-PDV_CASH_COUNTER_MAX_SIGNATURES) : [];

    const signature = getPdvCashCounterSignature(requestPayload, responsePayload, cashAmount);
    if (state.signatures.includes(signature)) {
      writePdvCashCounterDebug({ event: 'skip-duplicate', cashAmount: cashAmount, signature: signature });
      return;
    }

    state.signatures.push(signature);
    state.total = Math.round(((Number(state.total) || 0) + cashAmount) * 100) / 100;
    state.count = (Number(state.count) || 0) + 1;
    state.lastSaleAt = new Date().toISOString();
    state.lastSaleValue = Math.round(cashAmount * 100) / 100;

    try {
      window.localStorage && window.localStorage.setItem(PDV_CASH_COUNTER_STORAGE_KEY, JSON.stringify(state));
    } catch (error) {}
    writePdvCashCounterDebug({ event: 'counted', cashAmount: cashAmount, signature: signature, total: state.total, count: state.count });
  }

  function postPdvNfceTransmitResult(url, requestBody, responseText, status) {
    if (!isNfceTransmitRequest(url)) return;
    if (!isTargetNfceSellerObservationRoute()) {
      writePdvCashCounterDebug({ event: 'skip-transmit-route', url: String(url || '') });
      return;
    }
    const numericStatus = Number(status);
    if (Number.isFinite(numericStatus) && (numericStatus < 200 || numericStatus >= 300)) {
      writePdvCashCounterDebug({ event: 'skip-status', url: String(url || ''), status: numericStatus });
      return;
    }

    applyPdvCashCounterTransmit(requestBody, responseText);
    postBridgeMessage('pdv-nfce-transmit-result', {
      url: String(url || ''),
      requestBody: typeof requestBody === 'string' ? requestBody : '',
      responseText: typeof responseText === 'string' ? responseText : '',
      status: Number.isFinite(numericStatus) ? numericStatus : 0
    });
  }

  function maybePostNfeListResponse(url, responseText) {
    if (!isTargetNfeRoute() || !isNfeListRequest(url)) return;
    if (typeof responseText !== 'string' || !responseText) return;

    const payload = safeParseJson(responseText);
    if (!payload) return;

    postBridgeMessage('nfe-list-response', {
      payload: payload
    });
  }

  function getNfceSellerNameFromRequestBody(url, body) {
    if (typeof body !== 'string' || !body) return '';

    const payload = safeParseJson(body);
    if (!shouldHandleNfceSellerObservationPayload(url, payload)) return '';

    const dados = getNfceDadosPayload(payload);
    return getNfceSellerName(dados);
  }

  function normalizeNfceComplementaryResponseText(url, requestBody, responseText) {
    if (typeof responseText !== 'string' || !responseText) return responseText;

    const sellerName = getNfceSellerNameFromRequestBody(url, requestBody);
    if (!sellerName) return responseText;

    const payload = safeParseJson(responseText);
    if (!payload || typeof payload !== 'object' || Array.isArray(payload)) return responseText;

    const current = payload.editables;
    const next = upsertNfceSellerObservationLine(current, sellerName);
    if (next === String(current || '')) return responseText;

    payload.editables = next;
    try {
      return JSON.stringify(payload);
    } catch (error) {
      return responseText;
    }
  }

  function normalizeDetailedPurchasePayload(payload) {
    if (!payload || typeof payload !== 'object' || Array.isArray(payload)) return false;
    if (!payload.transport || typeof payload.transport !== 'object' || Array.isArray(payload.transport)) return false;
    if (payload.transport.freight !== null) return false;

    delete payload.transport.freight;
    return true;
  }

  function normalizeDetailedPurchaseResponseText(text) {
    if (typeof text !== 'string' || !text) return text;

    const payload = safeParseJson(text);
    if (!normalizeDetailedPurchasePayload(payload)) return text;

    try {
      return JSON.stringify(payload);
    } catch (error) {
      return text;
    }
  }

  function getRawXhrResponseText(xhr) {
    let text = '';

    try {
      if (typeof xhr.responseText === 'string') {
        text = xhr.responseText;
      }
    } catch (error) {}

    if (!text) {
      try {
        if (typeof xhr.response === 'string') {
          text = xhr.response;
        }
      } catch (error) {}
    }

    return text;
  }

  function getPatchedXhrResponseText(xhr) {
    let text = getRawXhrResponseText(xhr);
    if (!text) return text;

    maybePostNfeListResponse(xhr.__zwebBridgeUrl, text);

    if (isDashboardRequest(xhr.__zwebBridgeUrl)) {
      text = normalizeDashboardLocalDecimalResponseText(text);
    }

    if (isPurchaseDetailedRequest(xhr.__zwebBridgeUrl)) {
      text = normalizeDetailedPurchaseResponseText(text);
    }

    if (isNfceComplementaryInformationRequest(xhr.__zwebBridgeUrl)) {
      text = normalizeNfceComplementaryResponseText(xhr.__zwebBridgeUrl, xhr.__zwebBridgeRequestBody, text);
    }

    return text;
  }

  function patchBridgeXhrResponse(xhr) {
    if (!xhr || xhr.__zwebBridgeResponsePatched) return;
    if (xhr.readyState !== 4) return;

    const patchedText = getPatchedXhrResponseText(xhr);
    if (!patchedText) return;

    const currentText = getRawXhrResponseText(xhr);

    if (!currentText || patchedText === currentText) return;

    xhr.__zwebBridgeResponsePatched = true;
    const originalResponse = (() => {
      try {
        return xhr.response;
      } catch (error) {
        return undefined;
      }
    })();
    let parsedJson;

    try {
      Object.defineProperty(xhr, 'responseText', {
        configurable: true,
        get: function() {
          return patchedText;
        }
      });
    } catch (error) {}

    try {
      Object.defineProperty(xhr, 'response', {
        configurable: true,
        get: function() {
          if (xhr.responseType === 'json') {
            if (typeof parsedJson === 'undefined') parsedJson = safeParseJson(patchedText);
            return parsedJson;
          }
          if (!xhr.responseType || xhr.responseType === 'text') return patchedText;
          return originalResponse;
        }
      });
    } catch (error) {}
  }

  function installBridgeXhrResponsePatch(xhr, url) {
    if (!xhr || xhr.__zwebBridgeResponsePatchInstalled) return;
    if (!isDashboardRequest(url) && !isPurchaseDetailedRequest(url) && !isNfceComplementaryInformationRequest(url) && !isNfeListRequest(url)) return;

    xhr.__zwebBridgeResponsePatchInstalled = true;
    xhr.addEventListener('readystatechange', () => patchBridgeXhrResponse(xhr), true);
  }

  async function patchBridgeFetchResponse(url, requestBody, response) {
    if (!response || !response.ok) return response;

    let text = '';
    try {
      text = await response.clone().text();
    } catch (error) {
      return response;
    }

    let patchedText = text;
    maybePostNfeListResponse(url, text);

    if (isDashboardRequest(url)) {
      patchedText = normalizeDashboardLocalDecimalResponseText(patchedText);
    }
    if (isPurchaseDetailedRequest(url)) {
      patchedText = normalizeDetailedPurchaseResponseText(patchedText);
    }
    if (isNfceComplementaryInformationRequest(url)) {
      patchedText = normalizeNfceComplementaryResponseText(url, requestBody, patchedText);
    }

    if (!patchedText || patchedText === text) return response;

    const headers = new Headers(response.headers);
    headers.delete('content-length');
    headers.delete('content-encoding');

    return new Response(patchedText, {
      status: response.status,
      statusText: response.statusText,
      headers: headers
    });
  }

  function serializeXmlDocument(doc) {
    try {
      return new XMLSerializer().serializeToString(doc);
    } catch (error) {
      return '';
    }
  }

  function readXmlFromPopup(popup) {
    try {
      if (!popup || popup.closed || !popup.document || !popup.document.documentElement) {
        return null;
      }

      const doc = popup.document;
      const rootName = String(doc.documentElement.nodeName || '').toLowerCase();
      const contentType = String(doc.contentType || '').toLowerCase();

      if (contentType.indexOf('xml') !== -1 || (rootName && rootName !== 'html')) {
        return {
          content: serializeXmlDocument(doc),
          title: doc.title || ''
        };
      }

      const pre = doc.querySelector('pre');
      const text = normalizeText(pre ? pre.textContent : doc.body && doc.body.innerText);
      if (!looksLikeXmlText(text)) return null;

      return {
        content: text,
        title: doc.title || ''
      };
    } catch (error) {
      return null;
    }
  }

  function observePopup(request, popup) {
    if (!request || !popup) return;

    const requestId = request.requestId;
    const startedAt = now();
    const timer = window.setInterval(() => {
      cleanupPendingRequests();

      if (!pendingRequests.has(requestId)) {
        window.clearInterval(timer);
        return;
      }

      if (!popup || popup.closed || (now() - startedAt) > ARM_TTL_MS) {
        pendingRequests.delete(requestId);
        window.clearInterval(timer);
        return;
      }

      const snapshot = readXmlFromPopup(popup);
      if (snapshot && snapshot.content) {
        postBridgeMessage('xml-popup-content', {
          requestId: requestId,
          content: snapshot.content,
          title: snapshot.title || ''
        });
        pendingRequests.delete(requestId);
        window.clearInterval(timer);
      }
    }, POLL_INTERVAL_MS);
  }

  XMLHttpRequest.prototype.open = function(method, url) {
    const nextUrl = typeof url === 'string' ? normalizePersonEditRequestUrl(url) : url;
    const args = Array.prototype.slice.call(arguments);
    if (typeof nextUrl === 'string') args[1] = nextUrl;
    this.__zwebBridgeMethod = method;
    this.__zwebBridgeUrl = typeof nextUrl === 'string' ? nextUrl : '';
    installBridgeXhrResponsePatch(this, this.__zwebBridgeUrl);
    return nativeXhrOpen.apply(this, args);
  };

  XMLHttpRequest.prototype.send = function(body) {
    body = normalizeOutgoingRequestPayload(this.__zwebBridgeUrl, body);
    this.__zwebBridgeRequestBody = body;
    maybePostDocumentNegativeStockConfigurationRequest(this.__zwebBridgeUrl, body);

    if (isNfceTransmitRequest(this.__zwebBridgeUrl)) {
      this.addEventListener('loadend', () => {
        postPdvNfceTransmitResult(this.__zwebBridgeUrl, this.__zwebBridgeRequestBody, getRawXhrResponseText(this), this.status);
      }, true);
    }
    if (isFiscalCancelRequest(this.__zwebBridgeUrl)) {
      this.addEventListener('loadend', () => {
        postFiscalCancelRequestLog(this.__zwebBridgeUrl, this.__zwebBridgeRequestBody, getRawXhrResponseText(this), this.status);
      }, true);
    }

    if (this.__zwebBridgeUrl && this.__zwebBridgeUrl.indexOf(PRODUCT_PAGINATE_URL_FRAGMENT) !== -1) {
      const parsedBody = safeParseJson(typeof body === 'string' ? body : '');
      if (parsedBody && typeof parsedBody === 'object') {
        postBridgeMessage('product-paginate-request', {
          payload: parsedBody
        });
      }
    }
    return nativeXhrSend.call(this, body);
  };

  if (nativeFetch) {
    window.fetch = async function(input, init) {
      const url = getRequestUrl(input);

      if (!url) {
        return nativeFetch(input, init);
      }

      let nextInput = input;
      const nextUrl = normalizePersonEditRequestUrl(url);
      if (nextUrl !== url && typeof input === 'string') {
        nextInput = nextUrl;
      } else if (nextUrl !== url && input instanceof Request) {
        try {
          nextInput = new Request(nextUrl, input);
        } catch (error) {}
      }

      const nextInit = init ? Object.assign({}, init) : {};
      const normalizedBody = normalizeOutgoingRequestPayload(url, nextInit.body);
      maybePostDocumentNegativeStockConfigurationRequest(nextUrl, normalizedBody);
      if (normalizedBody !== nextInit.body) {
        nextInit.body = normalizedBody;
        const response = await nativeFetch(nextInput, nextInit);
        if (isNfceTransmitRequest(nextUrl)) {
          let responseText = '';
          try {
            responseText = await response.clone().text();
          } catch (error) {}
          postPdvNfceTransmitResult(nextUrl, normalizedBody, responseText, response.status);
        }
        if (isFiscalCancelRequest(nextUrl)) {
          let responseText = '';
          try {
            responseText = await response.clone().text();
          } catch (error) {}
          postFiscalCancelRequestLog(nextUrl, normalizedBody, responseText, response.status);
        }
        return isDashboardRequest(nextUrl) || isPurchaseDetailedRequest(nextUrl) || isNfceComplementaryInformationRequest(nextUrl) || isNfeListRequest(nextUrl)
          ? patchBridgeFetchResponse(nextUrl, normalizedBody, response)
          : response;
      }

      if (
        input instanceof Request
        && (!nextInit || typeof nextInit.body === 'undefined')
        && (
          (isTargetNfeNewRoute() && isHashFeatureEnabled() && isNfeItemSearchRequest(url))
          || isNfceSellerObservationRequest(url)
          || isApplicationPutConfigurationRequest(url)
          || (isTargetPersonEditRoute() && (isPersonPostRequest(url) || isPersonPutRequest(url)))
        )
      ) {
        try {
          const requestInput = nextInput instanceof Request ? nextInput : input;
          const bodyText = await requestInput.clone().text();
          const rewrittenBody = normalizeOutgoingRequestPayload(url, bodyText);
          maybePostDocumentNegativeStockConfigurationRequest(nextUrl, rewrittenBody);
          if (rewrittenBody !== bodyText) {
            const rewrittenRequest = new Request(requestInput, { body: rewrittenBody });
            const response = await nativeFetch(rewrittenRequest);
            if (isNfceTransmitRequest(nextUrl)) {
              let responseText = '';
              try {
                responseText = await response.clone().text();
              } catch (error) {}
              postPdvNfceTransmitResult(nextUrl, rewrittenBody, responseText, response.status);
            }
            if (isFiscalCancelRequest(nextUrl)) {
              let responseText = '';
              try {
                responseText = await response.clone().text();
              } catch (error) {}
              postFiscalCancelRequestLog(nextUrl, rewrittenBody, responseText, response.status);
            }
            return isDashboardRequest(nextUrl) || isPurchaseDetailedRequest(nextUrl) || isNfceComplementaryInformationRequest(nextUrl) || isNfeListRequest(nextUrl)
              ? patchBridgeFetchResponse(nextUrl, rewrittenBody, response)
              : response;
          }

          const response = await nativeFetch(requestInput, init);
          if (isNfceTransmitRequest(nextUrl)) {
            let responseText = '';
            try {
              responseText = await response.clone().text();
            } catch (error) {}
            postPdvNfceTransmitResult(nextUrl, bodyText, responseText, response.status);
          }
          if (isFiscalCancelRequest(nextUrl)) {
            let responseText = '';
            try {
              responseText = await response.clone().text();
            } catch (error) {}
            postFiscalCancelRequestLog(nextUrl, bodyText, responseText, response.status);
          }
          return isDashboardRequest(nextUrl) || isPurchaseDetailedRequest(nextUrl) || isNfceComplementaryInformationRequest(nextUrl) || isNfeListRequest(nextUrl)
            ? patchBridgeFetchResponse(nextUrl, bodyText, response)
            : response;
        } catch (error) {}
      }

      const response = await nativeFetch(nextInput, init);
      if (isNfceTransmitRequest(nextUrl)) {
        let responseText = '';
        try {
          responseText = await response.clone().text();
        } catch (error) {}
        postPdvNfceTransmitResult(nextUrl, nextInit.body, responseText, response.status);
      }
      if (isFiscalCancelRequest(nextUrl)) {
        let responseText = '';
        try {
          responseText = await response.clone().text();
        } catch (error) {}
        postFiscalCancelRequestLog(nextUrl, nextInit.body, responseText, response.status);
      }
      return isDashboardRequest(nextUrl) || isPurchaseDetailedRequest(nextUrl) || isNfceComplementaryInformationRequest(nextUrl) || isNfeListRequest(nextUrl)
        ? patchBridgeFetchResponse(nextUrl, nextInit.body, response)
        : response;
    };
  }

  window.addEventListener('message', (event) => {
    if (event.source !== window) return;

    const data = event && event.data;
    if (!data || data.source !== CONTENT_SOURCE || data.type !== 'arm-xml-download' || !data.requestId) {
      return;
    }

    if (!isTargetNfeListRoute()) return;

    cleanupPendingRequests();
    pendingRequests.set(data.requestId, {
      requestId: data.requestId,
      armedAt: now()
    });
  });

  window.open = function() {
    const popup = nativeOpen.apply(this, arguments);
    const request = getLatestPendingRequest();
    if (request && popup) {
      observePopup(request, popup);
    }
    return popup;
  };

  document.addEventListener('input', handleNfeItemHashInput, true);
  document.addEventListener('change', handleNfeItemHashInput, true);
  window.setInterval(() => {
    syncVisibleNfeItemHashInputs();
  }, 120);
})();
