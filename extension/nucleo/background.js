try {
  importScripts('features.js');
} catch (error) {}

const XML_DOWNLOAD_TTL_MS = 15000;
const PDF_DOWNLOAD_TTL_MS = 20000;
const NFE_ROUTE_FRAGMENT = '#/fiscal/nfe';
const XML_DOWNLOAD_SOURCE_PREFIXES = [
  'https://compufour.s3.amazonaws.com/production/uploads/nfe/'
];
const PDF_DOWNLOAD_SOURCE_PREFIXES = [
  'https://compufour.s3.amazonaws.com/production/uploads/reports/report/',
  'https://compufour.s3.amazonaws.com/production/uploads/nfe/'
];
const NOTE_ASSISTANT_CONTEXT_MENU_ID = 'note-assistant-retry';
const NOTE_ASSISTANT_LOGS_KEY = 'assistantLogs';
const NOTE_ASSISTANT_LOG_LIMIT = 300;
const NOTE_ASSISTANT_FSIST_URL = 'https://www.fsist.com.br/';
const NOTE_ASSISTANT_NFE_URL_PATTERN = /^https?:\/\/(www\.)?nfe\.fazenda\.gov\.br\//i;
const COMMISSION_REPORT_URL_PATTERN = /^https:\/\/compufour\.s3\.amazonaws\.com\/production\/uploads\/reports\/report\/.+\.html(?:[?#].*)?$/i;
const DEBUGGER_PROTOCOL_VERSION = '1.3';
const OFFSCREEN_DOWNLOAD_DOCUMENT_PATH = 'nucleo/offscreen-download.html';
const OFFSCREEN_DOWNLOAD_DOCUMENT_URL = chrome.runtime.getURL(OFFSCREEN_DOWNLOAD_DOCUMENT_PATH);
const FEATURE_DEFAULTS = self.ZWEB_FEATURES && typeof self.ZWEB_FEATURES.getDefaults === 'function'
  ? self.ZWEB_FEATURES.getDefaults()
  : {
      xmlDownloadEnabled: true,
      nfeBatchDownloadEnabled: true,
      noteAssistantEnabled: true,
      stockPriceSimulationEnabled: true,
      commissionReturnsEnabled: true,
    };
const pendingXmlDownloads = new Map();
const recentDirectXmlDownloads = new Map();
const pendingPdfDownloads = new Map();
const recentDirectPdfDownloads = new Map();
const pendingAdjustedReportDownloads = new Map();
let XML_DOWNLOAD_ENABLED = FEATURE_DEFAULTS.xmlDownloadEnabled !== false;
let NFE_BATCH_DOWNLOAD_ENABLED = FEATURE_DEFAULTS.nfeBatchDownloadEnabled !== false;
let NOTE_ASSISTANT_ENABLED = FEATURE_DEFAULTS.noteAssistantEnabled !== false;
let STOCK_PRICE_SIMULATION_ENABLED = FEATURE_DEFAULTS.stockPriceSimulationEnabled !== false;
let COMMISSION_RETURNS_ENABLED = FEATURE_DEFAULTS.commissionReturnsEnabled !== false;
let offscreenDownloadDocumentPromise = null;
let lastFsistTabId = null;
let lastNfePortalTabId = null;
let lastZwebTabId = null;
let lastZwebWindowId = null;

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', () => {
  self.clients.claim();
});

chrome.runtime.onInstalled.addListener(() => {
  refreshContextMenus();
  appendLog('Extensao instalada ou atualizada.', 'info');
});

function isNumber(value) {
  return typeof value === 'number' && Number.isFinite(value);
}

function now() {
  return Date.now();
}

function getErrorMessage(error) {
  if (!error) return '';
  if (typeof error === 'string') return error;
  if (error && typeof error.message === 'string') return error.message;
  return String(error);
}

function cleanupExpiredXmlDownloads() {
  const cutoff = now() - XML_DOWNLOAD_TTL_MS;
  const pdfCutoff = now() - PDF_DOWNLOAD_TTL_MS;
  for (const [key, pending] of pendingXmlDownloads.entries()) {
    if (!pending || pending.armedAt < cutoff || pending.handled) {
      clearPendingXmlFallbackTimer(pending);
      clearPendingFocusTimers(pending);
      pendingXmlDownloads.delete(key);
    }
  }

  for (const [key, createdAt] of recentDirectXmlDownloads.entries()) {
    if (!createdAt || createdAt < cutoff) {
      recentDirectXmlDownloads.delete(key);
    }
  }

  for (const [key, pending] of pendingPdfDownloads.entries()) {
    if (!pending || pending.armedAt < pdfCutoff || pending.handled) {
      clearPendingPdfFallbackTimer(pending);
      clearPendingFocusTimers(pending);
      pendingPdfDownloads.delete(key);
    }
  }

  for (const [key, createdAt] of recentDirectPdfDownloads.entries()) {
    if (!createdAt || createdAt < pdfCutoff) {
      recentDirectPdfDownloads.delete(key);
    }
  }

  for (const [key, pending] of pendingAdjustedReportDownloads.entries()) {
    if (!pending || pending.createdAt < cutoff) {
      pendingAdjustedReportDownloads.delete(key);
    }
  }
}

function isGenericDownloadName(value, extension) {
  const normalized = sanitizeFileName(String(value || '').replace(new RegExp('\\.' + extension + '$', 'i'), ''))
    .toLowerCase();
  return !normalized
    || normalized === 'download'
    || normalized === 'file'
    || normalized === 'arquivo'
    || normalized === 'documento'
    || normalized === extension
    || normalized === 'blob';
}

function appendLog(message, level) {
  const entry = {
    time: new Date().toISOString(),
    level: level || 'info',
    message: String(message || ''),
  };

  try {
    chrome.storage.local.get({ [NOTE_ASSISTANT_LOGS_KEY]: [] }, (stored) => {
      const current = Array.isArray(stored[NOTE_ASSISTANT_LOGS_KEY]) ? stored[NOTE_ASSISTANT_LOGS_KEY] : [];
      current.push(entry);
      chrome.storage.local.set({
        [NOTE_ASSISTANT_LOGS_KEY]: current.slice(-NOTE_ASSISTANT_LOG_LIMIT),
      });
    });
  } catch (error) {}
}

function keepNoteAssistantSourceActive() {
  if (isNumber(lastZwebTabId)) {
    try {
      chrome.tabs.update(lastZwebTabId, { active: true }, () => {});
    } catch (error) {}
  }

  if (isNumber(lastZwebWindowId)) {
    try {
      chrome.windows.update(lastZwebWindowId, { focused: true }, () => {});
    } catch (error) {}
  }
}

function reinforceNoteAssistantSourceActive() {
  keepNoteAssistantSourceActive();
  [80, 220, 480, 900].forEach((delayMs) => {
    setTimeout(() => keepNoteAssistantSourceActive(), delayMs);
  });
}

function keepNoteAssistantTabInBackground(tabId) {
  if (!isNumber(tabId)) return;
  try {
    chrome.tabs.update(tabId, { active: false }, () => {});
  } catch (error) {}
  reinforceNoteAssistantSourceActive();
}

function scheduleNoteAssistantTabClose(tabId, delayMs) {
  if (!isNumber(tabId)) return;
  setTimeout(() => {
    reinforceNoteAssistantSourceActive();
    try {
      chrome.tabs.remove(tabId, () => {});
    } catch (error) {}
  }, delayMs || 1200);
}

function refreshContextMenus() {
  try {
    chrome.contextMenus.removeAll(() => {
      chrome.contextMenus.create({
        id: NOTE_ASSISTANT_CONTEXT_MENU_ID,
        title: 'Assistente de Nota: tentar novamente',
        contexts: ['action'],
      });
    });
  } catch (error) {}
}

function syncFeatureFlags() {
  try {
    chrome.storage.local.get(FEATURE_DEFAULTS, (stored) => {
      const state = self.ZWEB_FEATURES && typeof self.ZWEB_FEATURES.normalizeState === 'function'
        ? self.ZWEB_FEATURES.normalizeState(stored)
        : Object.assign({}, FEATURE_DEFAULTS, stored || {});

      XML_DOWNLOAD_ENABLED = state.xmlDownloadEnabled !== false;
      NFE_BATCH_DOWNLOAD_ENABLED = state.nfeBatchDownloadEnabled !== false;
      NOTE_ASSISTANT_ENABLED = state.noteAssistantEnabled !== false;
      STOCK_PRICE_SIMULATION_ENABLED = state.stockPriceSimulationEnabled !== false;
      COMMISSION_RETURNS_ENABLED = state.commissionReturnsEnabled !== false;
      if (!XML_DOWNLOAD_ENABLED) {
        pendingXmlDownloads.clear();
        recentDirectXmlDownloads.clear();
      }
      if (!NFE_BATCH_DOWNLOAD_ENABLED) {
        pendingPdfDownloads.clear();
        recentDirectPdfDownloads.clear();
      }

    });
  } catch (error) {}
}

function sanitizeFileName(value) {
  return String(value || '')
    .replace(/[<>:"/\\|?*\u0000-\u001F]+/g, '-')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/^\.+/, '')
    .replace(/[. ]+$/, '')
    .slice(0, 120);
}

function inferXmlFileName(url, fileNameHint) {
  try {
    const parsed = new URL(url);
    const pathPart = parsed.pathname.split('/').filter(Boolean).pop() || '';
    if (/\.xml$/i.test(pathPart)) {
      const sanitized = sanitizeFileName(pathPart);
      if (sanitized) return sanitized;
    }
  } catch (error) {}

  const hinted = sanitizeFileName(String(fileNameHint || '').replace(/\.xml$/i, ''));
  if (hinted && !isGenericDownloadName(hinted, 'xml')) return hinted + '.xml';

  return 'nfe-xml-' + now() + '.xml';
}

function inferPdfFileName(url, fileNameHint) {
  const hinted = sanitizeFileName(String(fileNameHint || '').replace(/\.pdf$/i, ''));
  if (hinted && !isGenericDownloadName(hinted, 'pdf')) return hinted + '.pdf';

  try {
    const parsed = new URL(url);
    const pathPart = parsed.pathname.split('/').filter(Boolean).pop() || '';
    if (/\.pdf$/i.test(pathPart)) {
      const sanitized = sanitizeFileName(pathPart);
      if (sanitized) return sanitized;
    }
  } catch (error) {}

  return 'danfe-' + now() + '.pdf';
}

function armXmlDownload(sourceTabId, sourceWindowId, requestId, fileNameHint) {
  if (!XML_DOWNLOAD_ENABLED) return null;
  cleanupExpiredXmlDownloads();

  const armedAt = now();
  const key = requestId || (String(sourceTabId) + ':' + armedAt);
  pendingXmlDownloads.set(key, {
    requestId: key,
    sourceTabId,
    sourceWindowId,
    armedAt,
    candidateTabId: null,
    handled: false,
    fileNameHint: fileNameHint || ''
  });

  return key;
}

function getPendingXmlDownloadByRequestId(requestId) {
  cleanupExpiredXmlDownloads();
  if (!requestId) return null;

  const pending = pendingXmlDownloads.get(requestId);
  if (!pending || pending.handled) return null;
  return pending;
}

function getPendingXmlDownloadForTab(tabId, tab) {
  cleanupExpiredXmlDownloads();

  for (const pending of pendingXmlDownloads.values()) {
    if (!pending || pending.handled) continue;

    if (tabId === pending.sourceTabId) return pending;
    if (pending.candidateTabId && tabId === pending.candidateTabId) return pending;
    if (tab && isNumber(tab.openerTabId) && tab.openerTabId === pending.sourceTabId) return pending;
  }

  return null;
}

function armPdfDownload(sourceTabId, sourceWindowId, requestId, fileNameHint) {
  if (!NFE_BATCH_DOWNLOAD_ENABLED) return null;
  cleanupExpiredXmlDownloads();

  const armedAt = now();
  const key = requestId || ('pdf:' + sourceTabId + ':' + armedAt);
  pendingPdfDownloads.set(key, {
    requestId: key,
    sourceTabId,
    sourceWindowId,
    armedAt,
    candidateTabId: null,
    handled: false,
    fileNameHint: fileNameHint || ''
  });

  return key;
}

function getPendingPdfDownloadByRequestId(requestId) {
  cleanupExpiredXmlDownloads();
  if (!requestId) return null;

  const pending = pendingPdfDownloads.get(requestId);
  if (!pending || pending.handled) return null;
  return pending;
}

function getPendingPdfDownloadForTab(tabId, tab) {
  cleanupExpiredXmlDownloads();

  for (const pending of pendingPdfDownloads.values()) {
    if (!pending || pending.handled) continue;

    if (tabId === pending.sourceTabId) return pending;
    if (pending.candidateTabId && tabId === pending.candidateTabId) return pending;
    if (tab && isNumber(tab.openerTabId) && tab.openerTabId === pending.sourceTabId) return pending;
  }

  return null;
}

function getPendingPdfDownloadForKnownUrl(url, tab) {
  cleanupExpiredXmlDownloads();
  if (!isKnownPdfSourceUrl(url)) return null;

  let latest = null;
  for (const pending of pendingPdfDownloads.values()) {
    if (!pending || pending.handled) continue;
    if (
      tab
      && isNumber(tab.windowId)
      && isNumber(pending.sourceWindowId)
      && tab.windowId !== pending.sourceWindowId
    ) {
      continue;
    }

    if (!latest || pending.armedAt > latest.armedAt) {
      latest = pending;
    }
  }

  if (latest && tab && isNumber(tab.id) && !latest.candidateTabId) {
    latest.candidateTabId = tab.id;
  }

  return latest;
}

function isEligibleXmlUrl(url) {
  if (!url) return false;
  if (/^data:(?:text|application)\/xml/i.test(url)) return true;
  if (/^blob:/i.test(url)) return true;
  if (isKnownXmlSourceUrl(url)) return true;

  try {
    const parsed = new URL(url);
    const protocol = String(parsed.protocol || '').toLowerCase();
    if (protocol !== 'http:' && protocol !== 'https:') return false;

    const pathname = String(parsed.pathname || '').toLowerCase();
    if (/\.xml(?:$|[/?#])/i.test(pathname)) return true;
    if (/\/uploads\/nfe\/.+\.xml$/i.test(pathname)) return true;
    if (/^https:\/\/zweb\.com\.br\//i.test(url) && url.indexOf('#/') === -1) return true;
  } catch (error) {
    return false;
  }

  return false;
}

function isKnownXmlSourceUrl(url) {
  const value = String(url || '').toLowerCase();
  return XML_DOWNLOAD_SOURCE_PREFIXES.some((prefix) => value.indexOf(prefix) === 0);
}

function isKnownPdfSourceUrl(url) {
  const value = String(url || '').toLowerCase();
  return PDF_DOWNLOAD_SOURCE_PREFIXES.some((prefix) => value.indexOf(prefix) === 0);
}

function isEligiblePdfUrl(url) {
  if (!url) return false;
  if (/^data:application\/pdf/i.test(url)) return true;
  if (/^blob:/i.test(url)) return true;
  if (isKnownPdfSourceUrl(url)) return true;

  try {
    const parsed = new URL(url);
    const protocol = String(parsed.protocol || '').toLowerCase();
    if (protocol !== 'http:' && protocol !== 'https:') return false;
    return /\.pdf(?:$|[?#])/i.test(String(parsed.pathname || ''));
  } catch (error) {
    return false;
  }
}

function getPendingXmlDownloadForKnownUrl(url, tab) {
  cleanupExpiredXmlDownloads();
  if (!isKnownXmlSourceUrl(url)) return null;

  let latest = null;
  for (const pending of pendingXmlDownloads.values()) {
    if (!pending || pending.handled) continue;
    if (
      tab
      && isNumber(tab.windowId)
      && isNumber(pending.sourceWindowId)
      && tab.windowId !== pending.sourceWindowId
    ) {
      continue;
    }

    if (!latest || pending.armedAt > latest.armedAt) {
      latest = pending;
    }
  }

  if (latest && tab && isNumber(tab.id) && !latest.candidateTabId) {
    latest.candidateTabId = tab.id;
  }

  return latest;
}

function isTargetNfeOpenerUrl(url) {
  return String(url || '').toLowerCase().indexOf(NFE_ROUTE_FRAGMENT) !== -1;
}

function createDetachedPending(url, tab) {
  const key = String((tab && tab.id) || url || now());
  if (recentDirectXmlDownloads.has(key)) return null;
  recentDirectXmlDownloads.set(key, now());

  return {
    requestId: null,
    sourceTabId: tab && isNumber(tab.openerTabId) ? tab.openerTabId : null,
    sourceWindowId: tab && isNumber(tab.windowId) ? tab.windowId : null,
    armedAt: now(),
    candidateTabId: tab && isNumber(tab.id) ? tab.id : null,
    handled: false,
  };
}

function maybeTriggerXmlDownloadFromOpener(url, tab) {
  if (!XML_DOWNLOAD_ENABLED) return;
  if (!isKnownXmlSourceUrl(url)) return;
  if (!tab || !isNumber(tab.openerTabId)) return;

  chrome.tabs.get(tab.openerTabId, (openerTab) => {
    const error = chrome.runtime.lastError;
    if (error || !openerTab || !isTargetNfeOpenerUrl(openerTab.url || '')) return;

    const detachedPending = createDetachedPending(url, tab);
    if (!detachedPending) return;
    triggerXmlDownload(url, detachedPending);
  });
}

function maybeTriggerPdfDownloadFromOpener(url, tab) {
  if (!NFE_BATCH_DOWNLOAD_ENABLED) return;
  if (!isEligiblePdfUrl(url)) return;
  if (!tab || !isNumber(tab.openerTabId)) return;

  chrome.tabs.get(tab.openerTabId, (openerTab) => {
    const error = chrome.runtime.lastError;
    if (error || !openerTab || !isTargetNfeOpenerUrl(openerTab.url || '')) return;

    const key = String((tab && tab.id) || url || now());
    if (recentDirectPdfDownloads.has(key)) return;
    recentDirectPdfDownloads.set(key, now());

    runPdfDownload(url, '', {
      handled: false,
      fileNameHint: ''
    });
  });
}

function buildXmlDownloadOptions(url, fileNameHint) {
  return {
    url,
    filename: inferXmlFileName(url, fileNameHint),
    saveAs: false,
  };
}

function buildPdfDownloadOptions(url, fileNameHint) {
  return {
    url,
    filename: inferPdfFileName(url, fileNameHint),
    saveAs: false,
  };
}

function clearPendingXmlFallbackTimer(pending) {
  if (!pending || !pending.fallbackTimer) return;
  clearTimeout(pending.fallbackTimer);
  pending.fallbackTimer = null;
}

function clearPendingPdfFallbackTimer(pending) {
  if (!pending || !pending.fallbackTimer) return;
  clearTimeout(pending.fallbackTimer);
  pending.fallbackTimer = null;
}

function clearPendingFocusTimers(pending) {
  if (!pending || !Array.isArray(pending.focusTimers)) return;
  pending.focusTimers.forEach((timerId) => clearTimeout(timerId));
  pending.focusTimers = [];
}

function keepPendingSourceTabActive(pending) {
  if (!pending || !isNumber(pending.sourceTabId)) return;

  try {
    chrome.tabs.update(pending.sourceTabId, { active: true }, () => {});
  } catch (error) {}

  if (isNumber(pending.sourceWindowId)) {
    try {
      chrome.windows.update(pending.sourceWindowId, { focused: true }, () => {});
    } catch (error) {}
  }
}

function reinforcePendingSourceTabActive(pending) {
  if (!pending) return;
  clearPendingFocusTimers(pending);
  keepPendingSourceTabActive(pending);

  pending.focusTimers = [80, 220, 480, 900].map((delayMs) => (
    setTimeout(() => keepPendingSourceTabActive(pending), delayMs)
  ));
}

function closePendingCandidateTab(pending) {
  if (!pending || !isNumber(pending.candidateTabId)) return;
  if (isNumber(pending.sourceTabId) && pending.candidateTabId === pending.sourceTabId) return;

  const tabId = pending.candidateTabId;
  pending.candidateTabId = null;
  clearPendingFocusTimers(pending);

  try {
    chrome.tabs.remove(tabId, () => {});
  } catch (error) {}
}

function keepPendingDownloadInBackground(pending, tab) {
  if (!pending || !tab || !isNumber(tab.id)) return;
  pending.candidateTabId = tab.id;
  reinforcePendingSourceTabActive(pending);
}

function schedulePendingCandidateClose(pending, delayMs) {
  if (!pending) return;
  if (pending.closeTimer) {
    clearTimeout(pending.closeTimer);
  }
  pending.closeTimer = setTimeout(() => {
    pending.closeTimer = null;
    reinforcePendingSourceTabActive(pending);
    closePendingCandidateTab(pending);
  }, delayMs || 1200);
}

function scheduleTabClose(tabId, pending, delayMs) {
  if (!isNumber(tabId)) return;
  if (pending) {
    pending.candidateTabId = tabId;
  }
  setTimeout(() => {
    if (pending) {
      reinforcePendingSourceTabActive(pending);
    }
    try {
      chrome.tabs.remove(tabId, () => {});
    } catch (error) {}
  }, delayMs || 1200);
}

function isCommissionReportUrl(url) {
  return COMMISSION_REPORT_URL_PATTERN.test(String(url || ''));
}

function inferAdjustedReportFileName(fileNameHint) {
  const hinted = sanitizeFileName(String(fileNameHint || '').replace(/\.pdf$/i, ''));
  if (hinted) return hinted + '.pdf';
  return 'relatorio-ajustado-' + now() + '.pdf';
}

async function ensureOffscreenDownloadDocument() {
  if (!chrome.offscreen || typeof chrome.offscreen.createDocument !== 'function') {
    throw new Error('Offscreen indisponivel para gerar o PDF ajustado.');
  }

  if (offscreenDownloadDocumentPromise) {
    return offscreenDownloadDocumentPromise;
  }

  offscreenDownloadDocumentPromise = (async () => {
    if (chrome.runtime && typeof chrome.runtime.getContexts === 'function') {
      try {
        const contexts = await chrome.runtime.getContexts({
          contextTypes: ['OFFSCREEN_DOCUMENT'],
          documentUrls: [OFFSCREEN_DOWNLOAD_DOCUMENT_URL],
        });
        if (Array.isArray(contexts) && contexts.length) {
          return;
        }
      } catch (error) {}
    }

    try {
      await chrome.offscreen.createDocument({
        url: OFFSCREEN_DOWNLOAD_DOCUMENT_PATH,
        reasons: ['BLOBS'],
        justification: 'Gerar o PDF ajustado do relatorio de comissoes.',
      });
    } catch (error) {
      const message = getErrorMessage(error);
      if (!/single offscreen document|already exists/i.test(message)) {
        throw error;
      }
    }
  })();

  try {
    await offscreenDownloadDocumentPromise;
  } finally {
    offscreenDownloadDocumentPromise = null;
  }
}

function revokeOffscreenObjectUrl(url) {
  if (!url) return;
  try {
    chrome.runtime.sendMessage({
      type: 'offscreen-revoke-object-url',
      url,
    });
  } catch (error) {}
}

function requestOffscreenPdfBlobUrl(base64Data, filename) {
  return new Promise((resolve, reject) => {
    ensureOffscreenDownloadDocument()
      .then(() => {
        chrome.runtime.sendMessage({
          type: 'offscreen-create-pdf-object-url',
          base64Data,
          filename,
        }, (response) => {
          const error = chrome.runtime.lastError;
          if (error) {
            reject(new Error(error.message));
            return;
          }

          if (!response || response.ok !== true) {
            reject(new Error(response && response.message ? response.message : 'Falha ao baixar o PDF ajustado.'));
            return;
          }

          resolve({
            blobUrl: response.blobUrl,
            filename: response.filename || filename,
          });
        });
      })
      .catch((error) => {
        reject(error instanceof Error ? error : new Error(getErrorMessage(error)));
      });
  });
}

function debuggerAttach(target) {
  return new Promise((resolve, reject) => {
    chrome.debugger.attach(target, DEBUGGER_PROTOCOL_VERSION, () => {
      const error = chrome.runtime.lastError;
      if (error) {
        reject(new Error(error.message));
        return;
      }
      resolve();
    });
  });
}

function debuggerDetach(target) {
  return new Promise((resolve) => {
    chrome.debugger.detach(target, () => {
      resolve();
    });
  });
}

function debuggerSendCommand(target, method, params) {
  return new Promise((resolve, reject) => {
    chrome.debugger.sendCommand(target, method, params || {}, (result) => {
      const error = chrome.runtime.lastError;
      if (error) {
        reject(new Error(error.message));
        return;
      }
      resolve(result || {});
    });
  });
}

async function generateAdjustedCommissionReportPdf(tabId, fileNameHint) {
  const target = { tabId };
  let attached = false;

  try {
    await debuggerAttach(target);
    attached = true;
    await debuggerSendCommand(target, 'Page.enable');
    await debuggerSendCommand(target, 'Emulation.setEmulatedMedia', {
      media: 'print'
    }).catch(() => {});

    const result = await debuggerSendCommand(target, 'Page.printToPDF', {
      printBackground: true,
      preferCSSPageSize: true,
      marginTop: 0.4,
      marginBottom: 0.4,
      marginLeft: 0.3,
      marginRight: 0.3,
    });

    if (!result || !result.data) {
      throw new Error('PDF vazio');
    }

    const filename = inferAdjustedReportFileName(fileNameHint);
    const offscreenDownload = await requestOffscreenPdfBlobUrl(result.data, filename);
    pendingAdjustedReportDownloads.set(offscreenDownload.blobUrl, {
      filename: offscreenDownload.filename,
      createdAt: now(),
    });

    return await new Promise((resolve, reject) => {
      chrome.downloads.download({
        url: offscreenDownload.blobUrl,
        saveAs: false,
      }, (downloadId) => {
        const error = chrome.runtime.lastError;
        setTimeout(() => revokeOffscreenObjectUrl(offscreenDownload.blobUrl), 60000);
        if (error) {
          pendingAdjustedReportDownloads.delete(offscreenDownload.blobUrl);
          reject(new Error(error.message));
          return;
        }
        resolve({
          downloadId,
          filename: offscreenDownload.filename,
        });
      });
    });
  } finally {
    if (attached) {
      await debuggerDetach(target);
    }
  }
}

function runDownload(url, fileNameHint, pending) {
  if (!url || !pending || pending.handled) return;
  pending.handled = true;
  pending.fetching = false;
  clearPendingXmlFallbackTimer(pending);

  chrome.downloads.download(buildXmlDownloadOptions(url, fileNameHint), () => {
    const error = chrome.runtime.lastError;
    if (error) {
      pending.handled = false;
      console.warn('xml download failed', error.message);
      return;
    }

    keepPendingSourceTabActive(pending);
    closePendingCandidateTab(pending);
    cleanupExpiredXmlDownloads();
  });
}

function runPdfDownload(url, fileNameHint, pending) {
  if (!url || !pending || pending.handled) return;
  pending.handled = true;
  clearPendingPdfFallbackTimer(pending);

  chrome.downloads.download(buildPdfDownloadOptions(url, fileNameHint || pending.fileNameHint), () => {
    const error = chrome.runtime.lastError;
    if (error) {
      pending.handled = false;
      console.warn('pdf download failed', error.message);
      return;
    }

    keepPendingSourceTabActive(pending);
    closePendingCandidateTab(pending);
    cleanupExpiredXmlDownloads();
  });
}

function triggerPdfDownload(url, pending, fileNameHint) {
  if (!NFE_BATCH_DOWNLOAD_ENABLED) return;
  if (!url || !pending || pending.handled) return;
  if (!isEligiblePdfUrl(url)) return;
  const resolvedHint = fileNameHint || pending.fileNameHint || '';

  if (isKnownPdfSourceUrl(url)) {
    if (pending.fetching || pending.handled) return;
    pending.fetching = true;
    clearPendingPdfFallbackTimer(pending);
    pending.nativeCreated = false;
    pending.fallbackTimer = setTimeout(() => {
      pending.fallbackTimer = null;
      if (pending.handled || pending.nativeCreated) return;
      pending.fetching = false;
      runPdfDownload(url, resolvedHint, pending);
    }, 900);
    return;
  }

  runPdfDownload(url, resolvedHint, pending);
}

async function fetchXmlContent(url) {
  const controller = typeof AbortController === 'function' ? new AbortController() : null;
  const timer = controller ? setTimeout(() => controller.abort(), XML_DOWNLOAD_TTL_MS) : null;

  try {
    const response = await fetch(url, {
      method: 'GET',
      credentials: 'omit',
      cache: 'no-store',
      signal: controller ? controller.signal : undefined,
    });

    if (!response.ok) {
      throw new Error('fetch failed: ' + response.status);
    }

    return await response.text();
  } finally {
    if (timer) clearTimeout(timer);
  }
}

function triggerXmlDownload(url, pending, fileNameHint) {
  if (!XML_DOWNLOAD_ENABLED) return;
  if (!isEligibleXmlUrl(url)) return;
  const resolvedHint = fileNameHint || (pending && pending.fileNameHint) || '';

  if (isKnownXmlSourceUrl(url)) {
    if (pending.fetching || pending.handled) return;
    pending.fetching = true;
    clearPendingXmlFallbackTimer(pending);
    pending.nativeCreated = false;
    pending.fallbackTimer = setTimeout(() => {
      pending.fallbackTimer = null;
      if (pending.handled || pending.nativeCreated) return;

      fetchXmlContent(url)
        .then((content) => {
          if (!content || pending.handled || pending.nativeCreated) return;
          triggerXmlContentDownload(content, pending, inferXmlFileName(url, resolvedHint));
        })
        .catch(() => {
          if (pending.handled || pending.nativeCreated) return;
          pending.fetching = false;
          runDownload(url, resolvedHint, pending);
        });
    }, 900);
    return;
  }

  runDownload(url, resolvedHint, pending);
}

function triggerXmlContentDownload(content, pending, fileNameHint) {
  if (!XML_DOWNLOAD_ENABLED) return;
  if (!content || !pending || pending.handled) return;
  const dataUrl = 'data:application/xml;charset=utf-8,' + encodeURIComponent(content);
  runDownload(dataUrl, fileNameHint, pending);
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (!message || typeof message.type !== 'string') return;

  if (message.type === 'note-assistant-log') {
    appendLog(message.message || '', message.level || 'info');
    sendResponse({ ok: true });
    return;
  }

  if (message.type === 'note-assistant-zweb-active') {
    if (!NOTE_ASSISTANT_ENABLED) {
      sendResponse({ ok: false, reason: 'disabled' });
      return;
    }

    if (sender && sender.tab && isNumber(sender.tab.id)) {
      lastZwebTabId = sender.tab.id;
      if (isNumber(sender.tab.windowId)) {
        lastZwebWindowId = sender.tab.windowId;
      }
    }
    sendResponse({ ok: true });
    return;
  }

  if (message.type === 'note-assistant-open-fsist') {
    if (!NOTE_ASSISTANT_ENABLED) {
      sendResponse({ ok: false, reason: 'disabled' });
      return;
    }

    const digits = String(message.digits || '').replace(/\D+/g, '');
    if (digits.length !== 44) {
      sendResponse({ ok: false, reason: 'invalid_digits' });
      return;
    }

    if (sender && sender.tab && isNumber(sender.tab.id)) {
      lastZwebTabId = sender.tab.id;
      if (isNumber(sender.tab.windowId)) {
        lastZwebWindowId = sender.tab.windowId;
      }
    }

    const payload = {
      noteAssistantLastKey: digits,
      noteAssistantLastKeyAt: Date.now(),
      noteAssistantPendingFsistFill: {
        chave: digits,
        at: Date.now(),
      },
    };

    chrome.storage.local.set(payload, () => {
      appendLog('Chave detectada na Zweb. Abrindo FSIST em segundo plano.', 'info');
      const tabOptions = { url: NOTE_ASSISTANT_FSIST_URL, active: false };
      if (sender && sender.tab && isNumber(sender.tab.windowId)) {
        tabOptions.windowId = sender.tab.windowId;
      }

      chrome.tabs.create(tabOptions, (tab) => {
        const error = chrome.runtime.lastError;
        if (error) {
          appendLog('Falha ao abrir FSIST: ' + error.message, 'error');
          sendResponse({ ok: false, reason: 'tab_create_failed', message: error.message });
          return;
        }

        if (tab && isNumber(tab.id)) {
          lastFsistTabId = tab.id;
          keepNoteAssistantTabInBackground(tab.id);
        }
        sendResponse({ ok: true, tabId: tab && tab.id });
      });
    });
    return true;
  }

  if (message.type === 'stock-price-simulation-open') {
    if (!STOCK_PRICE_SIMULATION_ENABLED) {
      sendResponse({ ok: false, reason: 'disabled' });
      return;
    }

    const pending = message.pending && typeof message.pending === 'object' ? message.pending : null;
    if (!pending || (!pending.code && !pending.description) || !Number.isFinite(Number(pending.targetPrice))) {
      sendResponse({ ok: false, reason: 'invalid_pending' });
      return;
    }

    const targetWindowId = sender && sender.tab && isNumber(sender.tab.windowId) ? sender.tab.windowId : undefined;
    chrome.storage.local.set({ pendingStockPriceSimulation: pending }, () => {
      const tabOptions = {
        url: 'https://zweb.com.br/#/register/stock/product',
        active: false,
      };

      if (isNumber(targetWindowId)) {
        tabOptions.windowId = targetWindowId;
      }

      chrome.tabs.create(tabOptions, (tab) => {
        const error = chrome.runtime.lastError;
        if (error) {
          sendResponse({ ok: false, reason: 'tab_create_failed', message: error.message });
          return;
        }

        sendResponse({ ok: true, tabId: tab && tab.id });
      });
    });
    return true;
  }

  if (message.type === 'xml-download-arm') {
    if (!XML_DOWNLOAD_ENABLED) {
      sendResponse({ ok: false, reason: 'disabled' });
      return;
    }

    const sourceTabId = isNumber(message.sourceTabId) ? message.sourceTabId : sender.tab && sender.tab.id;
    const sourceWindowId = isNumber(message.sourceWindowId)
      ? message.sourceWindowId
      : sender.tab && sender.tab.windowId;

    if (!isNumber(sourceTabId)) {
      sendResponse({ ok: false, reason: 'missing_source_tab' });
      return;
    }

    const requestId = typeof message.requestId === 'string' && message.requestId ? message.requestId : null;
    const armId = armXmlDownload(sourceTabId, sourceWindowId, requestId, message.fileNameHint || '');
    sendResponse({ ok: true, armId });
    return;
  }

  if (message.type === 'pdf-download-arm') {
    if (!NFE_BATCH_DOWNLOAD_ENABLED) {
      sendResponse({ ok: false, reason: 'disabled' });
      return;
    }

    const sourceTabId = isNumber(message.sourceTabId) ? message.sourceTabId : sender.tab && sender.tab.id;
    const sourceWindowId = isNumber(message.sourceWindowId)
      ? message.sourceWindowId
      : sender.tab && sender.tab.windowId;

    if (!isNumber(sourceTabId)) {
      sendResponse({ ok: false, reason: 'missing_source_tab' });
      return;
    }

    const requestId = typeof message.requestId === 'string' && message.requestId ? message.requestId : null;
    const armId = armPdfDownload(sourceTabId, sourceWindowId, requestId, message.fileNameHint || '');
    sendResponse({ ok: true, armId });
    return;
  }

  if (message.type === 'xml-download-url') {
    if (!XML_DOWNLOAD_ENABLED) {
      sendResponse({ ok: false, reason: 'disabled' });
      return;
    }

    const pending = getPendingXmlDownloadByRequestId(message.requestId);
    if (!pending) {
      sendResponse({ ok: false, reason: 'missing_pending_request' });
      return;
    }

    if (!isEligibleXmlUrl(message.url)) {
      sendResponse({ ok: false, reason: 'ineligible_url' });
      return;
    }

    triggerXmlDownload(message.url, pending, message.fileName || message.title);
    sendResponse({ ok: true });
    return;
  }

  if (message.type === 'xml-download-content') {
    if (!XML_DOWNLOAD_ENABLED) {
      sendResponse({ ok: false, reason: 'disabled' });
      return;
    }

    const pending = getPendingXmlDownloadByRequestId(message.requestId);
    if (!pending) {
      sendResponse({ ok: false, reason: 'missing_pending_request' });
      return;
    }

    triggerXmlContentDownload(message.content, pending, message.fileName || message.title);
    sendResponse({ ok: true });
    return;
  }

  if (message.type === 'commission-report-download-pdf') {
    if (!COMMISSION_RETURNS_ENABLED) {
      sendResponse({ ok: false, reason: 'disabled' });
      return;
    }

    const tabId = sender && sender.tab && isNumber(sender.tab.id) ? sender.tab.id : null;
    const tabUrl = sender && sender.tab ? sender.tab.url : '';
    if (!isNumber(tabId) || !isCommissionReportUrl(tabUrl)) {
      sendResponse({ ok: false, reason: 'invalid_report_tab' });
      return;
    }

    generateAdjustedCommissionReportPdf(tabId, message.fileNameHint)
      .then((result) => {
        sendResponse({ ok: true, filename: result.filename, downloadId: result.downloadId });
      })
      .catch((error) => {
        sendResponse({ ok: false, reason: 'pdf_generation_failed', message: error && error.message ? error.message : String(error) });
      });
    return true;
  }
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (!info || info.menuItemId !== NOTE_ASSISTANT_CONTEXT_MENU_ID) return;
  if (!NOTE_ASSISTANT_ENABLED) return;

  appendLog('Comando manual: tentar novamente.', 'info');

  if (isNumber(lastNfePortalTabId)) {
    try {
      chrome.tabs.remove(lastNfePortalTabId);
    } catch (error) {}
    lastNfePortalTabId = null;
  }

  if (isNumber(lastFsistTabId)) {
    try {
      chrome.tabs.remove(lastFsistTabId);
    } catch (error) {}
    lastFsistTabId = null;
  }

  const targetTabId = tab && isNumber(tab.id) ? tab.id : lastZwebTabId;
  if (!isNumber(targetTabId)) return;

  try {
    chrome.tabs.sendMessage(targetTabId, { type: 'note-assistant-retry' });
  } catch (error) {}
});

chrome.tabs.onCreated.addListener((tab) => {
  if (!XML_DOWNLOAD_ENABLED) return;
  if (!tab || !isNumber(tab.id)) return;

  const pending = getPendingXmlDownloadForTab(tab.id, tab);
  if (pending) {
    keepPendingDownloadInBackground(pending, tab);
    return;
  }

  cleanupExpiredXmlDownloads();
  for (const entry of pendingXmlDownloads.values()) {
    if (!entry || entry.handled) continue;
    if (isNumber(tab.openerTabId) && tab.openerTabId === entry.sourceTabId) {
      keepPendingDownloadInBackground(entry, tab);
      break;
    }
  }
});

chrome.tabs.onCreated.addListener((tab) => {
  if (!NFE_BATCH_DOWNLOAD_ENABLED) return;
  if (!tab || !isNumber(tab.id)) return;

  const pending = getPendingPdfDownloadForTab(tab.id, tab);
  if (pending) {
    keepPendingDownloadInBackground(pending, tab);
    return;
  }

  cleanupExpiredXmlDownloads();
  for (const entry of pendingPdfDownloads.values()) {
    if (!entry || entry.handled) continue;
    if (isNumber(tab.openerTabId) && tab.openerTabId === entry.sourceTabId) {
      keepPendingDownloadInBackground(entry, tab);
      break;
    }
  }
});

chrome.tabs.onCreated.addListener((tab) => {
  if (!NOTE_ASSISTANT_ENABLED) return;
  if (!tab || !isNumber(tab.id)) return;
  if (!isNumber(tab.openerTabId) || !isNumber(lastFsistTabId)) return;
  if (tab.openerTabId !== lastFsistTabId) return;
  keepNoteAssistantTabInBackground(tab.id);
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (!XML_DOWNLOAD_ENABLED) return;
  const url = changeInfo.url || (tab && tab.url) || '';
  const pending = getPendingXmlDownloadForTab(tabId, tab) || getPendingXmlDownloadForKnownUrl(url, tab);
  const ready = /^data:|^blob:/i.test(url) || changeInfo.status === 'complete' || (tab && tab.status === 'complete');
  if (!ready) return;

  if (!pending) {
    maybeTriggerXmlDownloadFromOpener(url, tab);
    return;
  }

  if (!isEligibleXmlUrl(url)) return;
  triggerXmlDownload(url, pending);
  if (isKnownXmlSourceUrl(url)) {
    if (!pending || tabId !== pending.sourceTabId) {
      scheduleTabClose(tabId, pending, 1400);
    }
    schedulePendingCandidateClose(pending, 1400);
  }
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (!NFE_BATCH_DOWNLOAD_ENABLED) return;
  const url = changeInfo.url || (tab && tab.url) || '';
  const pending = getPendingPdfDownloadForTab(tabId, tab) || getPendingPdfDownloadForKnownUrl(url, tab);
  const ready = /^data:|^blob:/i.test(url) || changeInfo.status === 'complete' || (tab && tab.status === 'complete');
  if (!ready) return;

  if (!pending) {
    maybeTriggerPdfDownloadFromOpener(url, tab);
    return;
  }

  if (!isEligiblePdfUrl(url)) return;
  triggerPdfDownload(url, pending, pending.fileNameHint);
  if (isKnownPdfSourceUrl(url) && (!pending || tabId !== pending.sourceTabId)) {
    scheduleTabClose(tabId, pending, 1400);
  }
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (!NOTE_ASSISTANT_ENABLED) return;
  const url = changeInfo.url || (tab && tab.url) || '';
  if (!url) return;

  const openedFromFsist = (
    tab
    && isNumber(tab.openerTabId)
    && isNumber(lastFsistTabId)
    && tab.openerTabId === lastFsistTabId
  );

  if (tabId === lastFsistTabId) {
    keepNoteAssistantTabInBackground(tabId);
    if (NOTE_ASSISTANT_NFE_URL_PATTERN.test(url)) {
      lastNfePortalTabId = tabId;
      appendLog('FSIST redirecionou para o Portal NF-e em segundo plano.', 'info');
    }
    return;
  }

  if (!openedFromFsist) return;

  keepNoteAssistantTabInBackground(tabId);
  if (!NOTE_ASSISTANT_NFE_URL_PATTERN.test(url)) return;

  lastNfePortalTabId = tabId;
  appendLog('FSIST abriu o Portal NF-e em segundo plano.', 'info');
  if (isNumber(lastFsistTabId) && lastFsistTabId !== tabId) {
    scheduleNoteAssistantTabClose(lastFsistTabId, 900);
    lastFsistTabId = tabId;
  }
});

chrome.downloads.onCreated.addListener((item) => {
  if (XML_DOWNLOAD_ENABLED && item && item.url && isKnownXmlSourceUrl(item.url)) {
    const pending = getPendingXmlDownloadForKnownUrl(item.url, null);
    if (pending && !pending.handled) {
      pending.nativeCreated = true;
      pending.handled = true;
      pending.fetching = false;
      clearPendingXmlFallbackTimer(pending);
      keepPendingSourceTabActive(pending);
      closePendingCandidateTab(pending);
    }
  }

  if (NFE_BATCH_DOWNLOAD_ENABLED && item && item.url && isKnownPdfSourceUrl(item.url)) {
    const pending = getPendingPdfDownloadForKnownUrl(item.url, null);
    if (pending && !pending.handled) {
      pending.nativeCreated = true;
      pending.handled = true;
      pending.fetching = false;
      clearPendingPdfFallbackTimer(pending);
      keepPendingSourceTabActive(pending);
      closePendingCandidateTab(pending);
    }
  }

  if (!NOTE_ASSISTANT_ENABLED || !item || !item.url) return;
  if (!NOTE_ASSISTANT_NFE_URL_PATTERN.test(item.url)) return;

  appendLog('Download iniciado a partir do Portal NF-e.', 'info');

  if (isNumber(lastNfePortalTabId)) {
    try {
      chrome.tabs.remove(lastNfePortalTabId);
    } catch (error) {}
    lastNfePortalTabId = null;
  }

  if (isNumber(lastFsistTabId)) {
    try {
      chrome.tabs.remove(lastFsistTabId);
    } catch (error) {}
    lastFsistTabId = null;
  }
});

chrome.downloads.onDeterminingFilename.addListener((item, suggest) => {
  cleanupExpiredXmlDownloads();
  if (!item || !item.url) return;

  const pending = pendingAdjustedReportDownloads.get(item.url);
  if (pending && pending.filename) {
    pendingAdjustedReportDownloads.delete(item.url);
    suggest({
      filename: pending.filename,
      conflictAction: 'uniquify',
    });
    return;
  }

  const downloadUrl = String(item.finalUrl || item.url || '');
  const currentFileName = String(item.filename || '').split(/[\\/]/).pop() || '';

  if (XML_DOWNLOAD_ENABLED && isEligibleXmlUrl(downloadUrl)) {
    const filename = inferXmlFileName(downloadUrl, '');
    if (filename && (isGenericDownloadName(currentFileName, 'xml') || isKnownXmlSourceUrl(downloadUrl))) {
      suggest({
        filename,
        conflictAction: 'uniquify',
      });
      return;
    }
  }

  if (NFE_BATCH_DOWNLOAD_ENABLED && isEligiblePdfUrl(downloadUrl)) {
    const filename = inferPdfFileName(downloadUrl, '');
    if (filename && (isGenericDownloadName(currentFileName, 'pdf') || isKnownPdfSourceUrl(downloadUrl))) {
      suggest({
        filename,
        conflictAction: 'uniquify',
      });
    }
  }
});

try {
  chrome.storage.onChanged.addListener((changes, area) => {
    if (area !== 'local') return;

    if (changes.xmlDownloadEnabled) {
      XML_DOWNLOAD_ENABLED = changes.xmlDownloadEnabled.newValue !== false;
    }

    if (changes.nfeBatchDownloadEnabled) {
      NFE_BATCH_DOWNLOAD_ENABLED = changes.nfeBatchDownloadEnabled.newValue !== false;
    }

    if (changes.noteAssistantEnabled) {
      NOTE_ASSISTANT_ENABLED = changes.noteAssistantEnabled.newValue !== false;
    }

    if (changes.stockPriceSimulationEnabled) {
      STOCK_PRICE_SIMULATION_ENABLED = changes.stockPriceSimulationEnabled.newValue !== false;
    }

    if (changes.commissionReturnsEnabled) {
      COMMISSION_RETURNS_ENABLED = changes.commissionReturnsEnabled.newValue !== false;
    }

    if (!XML_DOWNLOAD_ENABLED) {
      pendingXmlDownloads.clear();
      recentDirectXmlDownloads.clear();
    }

    if (!NFE_BATCH_DOWNLOAD_ENABLED) {
      pendingPdfDownloads.clear();
      recentDirectPdfDownloads.clear();
    }

    if (!NOTE_ASSISTANT_ENABLED) {
      lastFsistTabId = null;
      lastNfePortalTabId = null;
      lastZwebWindowId = null;
    }
  });
} catch (error) {}

refreshContextMenus();
syncFeatureFlags();
