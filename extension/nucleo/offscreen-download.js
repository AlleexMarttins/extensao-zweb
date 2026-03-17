(function() {
  'use strict';

  const blobUrls = new Set();

  function decodeBase64(base64Data) {
    const normalized = String(base64Data || '').replace(/\s+/g, '');
    const binary = atob(normalized);
    const bytes = new Uint8Array(binary.length);

    for (let index = 0; index < binary.length; index += 1) {
      bytes[index] = binary.charCodeAt(index);
    }

    return bytes;
  }

  function revokeBlobUrl(url) {
    if (!url || !blobUrls.has(url)) return;
    blobUrls.delete(url);
    try {
      URL.revokeObjectURL(url);
    } catch (error) {}
  }

  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (!message || typeof message.type !== 'string') return;

    if (message.type === 'offscreen-revoke-object-url') {
      revokeBlobUrl(message.url);
      sendResponse({ ok: true });
      return;
    }

    if (message.type !== 'offscreen-create-pdf-object-url') return;

    try {
      const bytes = decodeBase64(message.base64Data);
      const blob = new Blob([bytes], { type: 'application/pdf' });
      const blobUrl = URL.createObjectURL(blob);
      blobUrls.add(blobUrl);
      const filename = String(message.filename || 'relatorio-ajustado.pdf').trim() || 'relatorio-ajustado.pdf';

      sendResponse({
        ok: true,
        blobUrl,
        filename,
      });
    } catch (error) {
      sendResponse({
        ok: false,
        message: error && error.message ? error.message : String(error),
      });
    }

    return true;
  });
})();
