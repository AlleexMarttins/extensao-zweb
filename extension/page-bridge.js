(function() {
  'use strict';

  const CONTENT_SOURCE = 'zweb-xml-content-script';
  const BRIDGE_SOURCE = 'zweb-xml-page-bridge';
  const ARM_TTL_MS = 15000;
  const POLL_INTERVAL_MS = 300;

  if (window.__zwebXmlPageBridgeInstalled) return;
  window.__zwebXmlPageBridgeInstalled = true;

  const pendingRequests = new Map();
  const nativeOpen = window.open;

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
    return String(value || '').trim();
  }

  function looksLikeXmlText(text) {
    const normalized = normalizeText(text).slice(0, 200).toLowerCase();
    return normalized.indexOf('<?xml') === 0
      || normalized.indexOf('<nfeproc') === 0
      || normalized.indexOf('<nfe') === 0
      || normalized.indexOf('<proc') === 0;
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
})();
