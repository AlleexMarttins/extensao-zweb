(function() {
  'use strict';

  const CONTENT_SOURCE = 'zweb-xml-content-script';
  const BRIDGE_SOURCE = 'zweb-xml-page-bridge';
  const ARM_TTL_MS = 15000;
  const POLL_INTERVAL_MS = 300;
  const PRODUCT_PAGINATE_URL_FRAGMENT = 'inventory.get-product-paginate';
  const NFE_NEW_ROUTE_FRAGMENT = '/fiscal/nfe/new';
  const NFE_ITEM_SEARCH_URL_FRAGMENTS = [
    'inventory.search-products-for-documents',
    'inventory.get-composition-kit-to-import'
  ];
  const BRIDGE_VERSION = '20260313-1';

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
    window.postMessage(Object.assign({
      source: BRIDGE_SOURCE,
      type: type
    }, payload || {}), '*');
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
    this.__zwebBridgeMethod = method;
    this.__zwebBridgeUrl = typeof url === 'string' ? url : '';
    return nativeXhrOpen.apply(this, arguments);
  };

  XMLHttpRequest.prototype.send = function(body) {
    body = normalizeNfeItemSearchPayload(this.__zwebBridgeUrl, body);

    if (this.__zwebBridgeUrl && this.__zwebBridgeUrl.indexOf(PRODUCT_PAGINATE_URL_FRAGMENT) !== -1) {
      const parsedBody = safeParseJson(typeof body === 'string' ? body : '');
      if (parsedBody && typeof parsedBody === 'object') {
        postBridgeMessage('product-paginate-request', {
          payload: parsedBody
        });
      }
    }
    return nativeXhrSend.apply(this, arguments);
  };

  if (nativeFetch) {
    window.fetch = async function(input, init) {
      const url = typeof input === 'string'
        ? input
        : input && typeof input.url === 'string'
          ? input.url
          : '';

      if (!url) {
        return nativeFetch(input, init);
      }

      const nextInit = init ? Object.assign({}, init) : {};
      const normalizedBody = normalizeNfeItemSearchPayload(url, nextInit.body);
      if (normalizedBody !== nextInit.body) {
        nextInit.body = normalizedBody;
        return nativeFetch(input, nextInit);
      }

      if (
        input instanceof Request
        && (!nextInit || typeof nextInit.body === 'undefined')
        && isTargetNfeNewRoute()
        && isHashFeatureEnabled()
        && isNfeItemSearchRequest(url)
      ) {
        try {
          const bodyText = await input.clone().text();
          const rewrittenBody = normalizeNfeItemSearchPayload(url, bodyText);
          if (rewrittenBody !== bodyText) {
            const rewrittenRequest = new Request(input, { body: rewrittenBody });
            return nativeFetch(rewrittenRequest);
          }
        } catch (error) {}
      }

      return nativeFetch(input, init);
    };
  }

  window.addEventListener('message', (event) => {
    if (event.source !== window) return;

    const data = event && event.data;
    if (!data || data.source !== CONTENT_SOURCE || data.type !== 'arm-xml-download' || !data.requestId) {
      return;
    }

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
