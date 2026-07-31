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
const ZWEB_BFF_DASHBOARD_API_URL = 'https://api.zweb.com.br/rpc/v2/BFF.get-dashboard';
const ZWEB_APPLICATION_PUT_CONFIGURATION_API_URL = 'https://api.zweb.com.br/rpc/v1/application.put-configuration';
const ZWEB_DOCUMENT_CONFIGURATION_URL = 'https://zweb.com.br/#/document/document-configuration';
const DOCUMENT_NEGATIVE_STOCK_GUARD_ALARM_NAME = 'zweb-document-negative-stock-disable';
const DOCUMENT_NEGATIVE_STOCK_GUARD_BACKGROUND_STORAGE_KEY = 'zwebDocumentNegativeStockBackgroundSchedule';
const DOCUMENT_NEGATIVE_STOCK_VISUAL_TAB_TIMEOUT_MS = 35000;
const DOCUMENT_NEGATIVE_STOCK_VISUAL_TAB_CLOSE_DELAY_MS = 1200;
const FISCAL_CLONE_DAV_BACKGROUND_LOG_KEY = 'zwebFiscalCloneDavDebugLog';
const FISCAL_CLONE_DAV_BACKGROUND_LOG_LIMIT = 240;
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
let documentNegativeStockGuardTimeout = null;
let documentNegativeStockGuardDisableRunning = false;

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', () => {
  self.clients.claim();
  restoreDocumentNegativeStockGuardSchedule();
});

chrome.runtime.onInstalled.addListener(() => {
  refreshContextMenus();
  restoreDocumentNegativeStockGuardSchedule();
  appendLog('Extensao instalada ou atualizada.', 'info');
});

chrome.runtime.onStartup.addListener(() => {
  restoreDocumentNegativeStockGuardSchedule();
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

function getZwebDashboardClient(payload) {
  const root = payload && payload.data && typeof payload.data === 'object' ? payload.data : payload;
  if (!root || typeof root !== 'object') return null;
  return root['get-client'] || root.getClient || null;
}

function hasNegativeStockConfigurationPayload(payload) {
  return !!(
    payload
    && typeof payload === 'object'
    && !Array.isArray(payload)
    && payload.fiscal
    && typeof payload.fiscal === 'object'
    && payload.fiscal.emissor
    && typeof payload.fiscal.emissor === 'object'
    && Object.prototype.hasOwnProperty.call(payload.fiscal.emissor, 'isAllowedNegativeStock')
  );
}

async function postZwebApiJson(token, url, body) {
  const cleanToken = String(token || '').trim();
  if (!cleanToken) throw new Error('Token da Zweb ausente.');

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      accept: 'application/json',
      'content-type': 'application/json',
      'authorization-compufacil': cleanToken,
    },
    body: JSON.stringify(body || {}),
  });

  let payload = null;
  try {
    payload = await response.json();
  } catch (error) {}

  if (!response.ok) {
    const payloadMessage = payload && (
      payload.message ||
      payload.error ||
      (payload.data && payload.data.message) ||
      (payload.errors && Object.values(payload.errors).flat().find(Boolean))
    );
    throw new Error(payloadMessage ? String(payloadMessage) : ('A Zweb retornou ' + response.status + '.'));
  }

  return payload;
}

async function fetchNegativeStockConfiguration(token) {
  const payload = await postZwebApiJson(token, ZWEB_BFF_DASHBOARD_API_URL, {
    'get-client': {
      request: true,
    },
  });
  const client = getZwebDashboardClient(payload);
  if (!hasNegativeStockConfigurationPayload(client)) {
    throw new Error('A Zweb nao retornou a configuracao de estoque.');
  }
  return client;
}

async function persistNegativeStockConfiguration(token, payload) {
  if (!hasNegativeStockConfigurationPayload(payload)) {
    throw new Error('Configuracao de estoque invalida.');
  }
  return await postZwebApiJson(token, ZWEB_APPLICATION_PUT_CONFIGURATION_API_URL, payload);
}

function getStorageLocal(keys) {
  return new Promise((resolve) => {
    try {
      chrome.storage.local.get(keys, (value) => {
        resolve(value || {});
      });
    } catch (error) {
      resolve({});
    }
  });
}

function setStorageLocal(value) {
  return new Promise((resolve, reject) => {
    try {
      chrome.storage.local.set(value, () => {
        const error = chrome.runtime.lastError;
        if (error) {
          reject(new Error(error.message));
          return;
        }
        resolve();
      });
    } catch (error) {
      reject(error instanceof Error ? error : new Error(String(error)));
    }
  });
}

function removeStorageLocal(keys) {
  return new Promise((resolve) => {
    try {
      chrome.storage.local.remove(keys, () => resolve());
    } catch (error) {
      resolve();
    }
  });
}

function createBackgroundTab(options) {
  return new Promise((resolve, reject) => {
    try {
      chrome.tabs.create(options, (tab) => {
        const error = chrome.runtime.lastError;
        if (error) {
          reject(new Error(error.message));
          return;
        }
        resolve(tab || null);
      });
    } catch (error) {
      reject(error instanceof Error ? error : new Error(String(error)));
    }
  });
}

function removeTabQuietly(tabId) {
  return new Promise((resolve) => {
    if (!isNumber(tabId)) {
      resolve();
      return;
    }
    try {
      chrome.tabs.remove(tabId, () => resolve());
    } catch (error) {
      resolve();
    }
  });
}

function getTabQuietly(tabId) {
  return new Promise((resolve) => {
    if (!isNumber(tabId)) {
      resolve(null);
      return;
    }
    try {
      chrome.tabs.get(tabId, (tab) => {
        const error = chrome.runtime.lastError;
        if (error) {
          resolve(null);
          return;
        }
        resolve(tab || null);
      });
    } catch (error) {
      resolve(null);
    }
  });
}

function executeScriptInTab(tabId, func, args) {
  return new Promise((resolve, reject) => {
    try {
      chrome.scripting.executeScript({
        target: { tabId },
        func,
        args: Array.isArray(args) ? args : [],
      }, (results) => {
        const error = chrome.runtime.lastError;
        if (error) {
          reject(new Error(error.message));
          return;
        }
        resolve(results && results[0] ? results[0].result : null);
      });
    } catch (error) {
      reject(error instanceof Error ? error : new Error(String(error)));
    }
  });
}

function sendMessageToTab(tabId, message) {
  return new Promise((resolve, reject) => {
    try {
      chrome.tabs.sendMessage(tabId, message, (response) => {
        const error = chrome.runtime.lastError;
        if (error) {
          reject(new Error(error.message));
          return;
        }
        resolve(response);
      });
    } catch (error) {
      reject(error instanceof Error ? error : new Error(String(error)));
    }
  });
}

async function appendFiscalCloneDavBackgroundLog(event, details) {
  const entry = {
    at: new Date().toISOString(),
    event: String(event || ''),
    details: details && typeof details === 'object' ? details : (details == null ? {} : { value: String(details) }),
  };
  try {
    const stored = await getStorageLocal({ [FISCAL_CLONE_DAV_BACKGROUND_LOG_KEY]: [] });
    const current = Array.isArray(stored[FISCAL_CLONE_DAV_BACKGROUND_LOG_KEY])
      ? stored[FISCAL_CLONE_DAV_BACKGROUND_LOG_KEY]
      : [];
    current.push(entry);
    await setStorageLocal({
      [FISCAL_CLONE_DAV_BACKGROUND_LOG_KEY]: current.slice(-FISCAL_CLONE_DAV_BACKGROUND_LOG_LIMIT),
    });
  } catch (error) {}
}

async function cloneDavInBackgroundTab(flow, sourceWindowId) {
  const davNumber = String(flow && flow.davDocumentNumber || '').trim();
  const totalValue = Number(flow && flow.totalValue);
  const returnHash = String(flow && flow.returnHash || '#/document/davs/sale').trim() || '#/document/davs/sale';
  if (!davNumber) throw new Error('Numero do DAV ausente para clonagem em segundo plano.');

  let tab = null;
  const tabOptions = {
    url: 'https://zweb.com.br/' + returnHash,
    active: false,
  };
  if (isNumber(sourceWindowId)) {
    tabOptions.windowId = sourceWindowId;
  }

  try {
    await appendFiscalCloneDavBackgroundLog('background-tab-create-start', { davNumber, returnHash, sourceWindowId });
    tab = await withTimeout(createBackgroundTab(tabOptions), 12000, 'Criacao da aba oculta do DAV');
    if (!tab || !isNumber(tab.id)) {
      throw new Error('A aba oculta do DAV nao foi criada.');
    }
    await appendFiscalCloneDavBackgroundLog('background-tab-created', { tabId: tab.id, url: tab.url || '' });

    let lastResponse = null;
    const startedAt = Date.now();
    while (Date.now() - startedAt < 45000) {
      await delay(900);
      if (tab && isNumber(tab.id)) {
        const stillExists = await getTabQuietly(tab.id);
        if (!stillExists) {
          await appendFiscalCloneDavBackgroundLog('background-tab-gone', { tabId: tab.id });
          tab = null;
          throw new Error('A aba oculta do DAV foi fechada antes de concluir a clonagem.');
        }
      }
      try {
        await appendFiscalCloneDavBackgroundLog('background-tab-message-send', { tabId: tab.id, elapsedMs: Date.now() - startedAt });
        lastResponse = await withTimeout(sendMessageToTab(tab.id, {
          type: 'fiscal-clone-dav-run-background-clone',
          flow: {
            davDocumentNumber: davNumber,
            totalValue: Number.isFinite(totalValue) ? totalValue : null,
            returnHash,
          },
        }), 35000, 'Comando de clonagem do DAV');
      } catch (error) {
        lastResponse = { ok: false, message: getErrorMessage(error) };
        if (/No tab with id|Cannot access|Receiving end does not exist/i.test(lastResponse.message || '')) {
          await appendFiscalCloneDavBackgroundLog('background-tab-message-terminal-error', { tabId: tab && tab.id, response: lastResponse });
          throw new Error(lastResponse.message);
        }
      }
      await appendFiscalCloneDavBackgroundLog('background-tab-message-response', { tabId: tab.id, response: lastResponse });

      if (lastResponse && lastResponse.ok === false && lastResponse.terminal) {
        throw new Error(lastResponse.message || 'Clonagem do DAV interrompida pela pagina.');
      }

      if (lastResponse && lastResponse.ok) {
        await delay(6500);
        await appendFiscalCloneDavBackgroundLog('background-tab-clone-ok', { tabId: tab.id });
        return { ok: true, tabId: tab.id };
      }
    }

    await appendFiscalCloneDavBackgroundLog('background-tab-clone-timeout', { tabId: tab && tab.id, lastResponse });
    throw new Error(lastResponse && lastResponse.message || 'Nao foi possivel clonar o DAV em segundo plano.');
  } finally {
    if (tab && isNumber(tab.id)) {
      await appendFiscalCloneDavBackgroundLog('background-tab-close', { tabId: tab.id });
      await removeTabQuietly(tab.id);
    }
  }
}

function notifyDocumentNegativeStockDisabled(tabId, result) {
  if (!isNumber(tabId)) return;
  sendMessageToTab(tabId, {
    type: 'document-negative-stock-disabled-notification',
    notification: result && (result.notification || result.visualResult && result.visualResult.notification) || null,
  }).catch(() => {});
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function withTimeout(promise, timeoutMs, label) {
  let timer = null;
  return Promise.race([
    promise,
    new Promise((resolve, reject) => {
      timer = setTimeout(() => {
        reject(new Error((label || 'Operacao') + ' excedeu o tempo limite.'));
      }, timeoutMs);
    }),
  ]).finally(() => {
    if (timer) clearTimeout(timer);
  });
}

function disableNegativeStockInConfigurationPage() {
  try {
    localStorage.removeItem('zwebDocumentNegativeStockGuardExpiresAt');
    localStorage.setItem('zwebDocumentNegativeStockForceDisablePending', 'true');
  } catch (error) {}

  try {
    const modal = document.getElementById('zweb-document-negative-stock-guard-modal');
    const backdrop = document.getElementById('zweb-document-negative-stock-guard-backdrop');
    if (modal) modal.remove();
    if (backdrop) backdrop.remove();
  } catch (error) {}

  const normalize = (value) => String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();

  const isVisible = (element) => {
    if (!element) return false;
    const rect = element.getBoundingClientRect();
    const style = getComputedStyle(element);
    return !!(rect.width || rect.height || element.getClientRects().length)
      && style.display !== 'none'
      && style.visibility !== 'hidden'
      && style.opacity !== '0';
  };

  const getNotificationSnapshot = () => {
    const selectors = [
      '.Vue-Toastification__toast',
      '.Toastify__toast',
      '.v-snackbar',
      '.v-snackbar__wrapper',
      '.toast.show',
      '.toast',
      '.swal2-popup',
      '.alert-success',
      '.alert'
    ];
    const nodes = selectors
      .reduce((acc, selector) => acc.concat(Array.from(document.querySelectorAll(selector))), [])
      .filter((node, index, list) => node && list.indexOf(node) === index && isVisible(node));
    const node = nodes.find((candidate) => {
      const text = normalize(candidate.innerText || candidate.textContent || '');
      return text && text.indexOf('estoque liberado temporariamente') === -1;
    }) || null;
    return node
      ? { html: node.outerHTML || '', text: String(node.innerText || node.textContent || '').trim() }
      : null;
  };

  const clickLikeUser = (element) => {
    if (!element) return false;
    const options = { bubbles: true, cancelable: true, view: window };
    try {
      element.dispatchEvent(new PointerEvent('pointerdown', options));
      element.dispatchEvent(new MouseEvent('mousedown', options));
      element.dispatchEvent(new PointerEvent('pointerup', options));
      element.dispatchEvent(new MouseEvent('mouseup', options));
    } catch (error) {
      try {
        element.dispatchEvent(new MouseEvent('mousedown', options));
        element.dispatchEvent(new MouseEvent('mouseup', options));
      } catch (innerError) {}
    }
    try {
      element.click();
      return true;
    } catch (error) {
      try {
        element.dispatchEvent(new MouseEvent('click', options));
        return true;
      } catch (innerError) {
        return false;
      }
    }
  };

  const rows = Array.from(document.querySelectorAll('.row, [class~="row"], .v-row, [class*="row"]'));
  const row = rows.find((candidate) => {
    const text = normalize(candidate.innerText || candidate.textContent || '');
    return text.indexOf('permitir vender com estoque zerado') !== -1;
  });

  if (!row) {
    return {
      ok: false,
      found: false,
      href: location.href,
      bodyText: String(document.body && document.body.innerText || '').slice(0, 500),
    };
  }

  const input = row.querySelector('input#isAllowedNegativeStock, input[id="isAllowedNegativeStock"], input[type="checkbox"]');
  const checkedByInput = input && typeof input.checked === 'boolean' ? !!input.checked : null;
  const checkedByAria = !!row.querySelector('[aria-checked="true"]');
  const checkedByClass = !!row.querySelector('.z-switch-checked');
  const isOn = checkedByInput === true || checkedByAria || checkedByClass;

  if (!isOn) {
    return {
      ok: true,
      found: true,
      alreadyOff: true,
      inputChecked: checkedByInput,
      href: location.href,
    };
  }

  const clickableSelectors = [
    '.v-selection-control__input',
    '.v-selection-control__wrapper',
    '.v-selection-control',
    '.v-switch__track',
    '.v-switch__thumb',
    '.z-switch-control',
    '.z-switch',
    'input#isAllowedNegativeStock',
    'input[id="isAllowedNegativeStock"]',
    'input[type="checkbox"]',
    '[role="switch"]',
    'label',
    'button',
  ];

  const getInputChecked = () => {
    const currentInput = row.querySelector('input#isAllowedNegativeStock, input[id="isAllowedNegativeStock"], input[type="checkbox"]');
    return currentInput && typeof currentInput.checked === 'boolean' ? !!currentInput.checked : null;
  };

  const targets = clickableSelectors
    .map((selector) => row.querySelector(selector))
    .filter((candidate, index, list) => candidate && list.indexOf(candidate) === index && isVisible(candidate));

  if (input && targets.indexOf(input) === -1) targets.push(input);
  if (targets.indexOf(row) === -1) targets.push(row);

  return new Promise((resolve) => {
    let index = 0;
    const attempts = [];

    const finish = (extra) => {
      resolve({
        ok: true,
        found: true,
        clicked: attempts.some((attempt) => attempt.clicked),
        attempts,
        notification: getNotificationSnapshot(),
        inputCheckedBefore: checkedByInput,
        inputCheckedAfter: getInputChecked(),
        href: location.href,
        directSet: !!(extra && extra.directSet),
      });
    };

    const tryDirectSet = () => {
      const currentInput = row.querySelector('input#isAllowedNegativeStock, input[id="isAllowedNegativeStock"], input[type="checkbox"]');
      if (!currentInput || typeof currentInput.checked !== 'boolean') {
        finish({ directSet: false });
        return;
      }

      try {
        const descriptor = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'checked');
        if (descriptor && descriptor.set) {
          descriptor.set.call(currentInput, false);
        } else {
          currentInput.checked = false;
        }
      } catch (error) {
        currentInput.checked = false;
      }

      currentInput.dispatchEvent(new Event('input', { bubbles: true, composed: true }));
      currentInput.dispatchEvent(new Event('change', { bubbles: true, composed: true }));
      setTimeout(() => finish({ directSet: true }), 2500);
    };

    const next = () => {
      if (getInputChecked() === false) {
        finish();
        return;
      }

      const target = targets[index++];
      if (!target) {
        tryDirectSet();
        return;
      }

      const clicked = clickLikeUser(target);
      attempts.push({
        tag: target.tagName,
        id: target.id || '',
        className: String(target.className || ''),
        clicked,
      });

      setTimeout(next, 1600);
    };

    next();
  });
}

async function disableNegativeStockThroughConfigurationTab(sourceWindowId) {
  let tab = null;
  const startedAt = Date.now();
  const tabOptions = {
    url: ZWEB_DOCUMENT_CONFIGURATION_URL,
    active: false,
  };

  if (isNumber(sourceWindowId)) {
    tabOptions.windowId = sourceWindowId;
  }

  try {
    tab = await withTimeout(createBackgroundTab(tabOptions), 12000, 'Criacao da aba de configuracao');
    if (!tab || !isNumber(tab.id)) {
      throw new Error('A aba de configuracao nao foi criada.');
    }

    let lastResult = null;
    while (Date.now() - startedAt < DOCUMENT_NEGATIVE_STOCK_VISUAL_TAB_TIMEOUT_MS) {
      await delay(1200);
      try {
        lastResult = await withTimeout(
          sendMessageToTab(tab.id, { type: 'document-negative-stock-disable-config-page' }),
          9000,
          'Mensagem para a aba de configuracao'
        );
      } catch (error) {
        try {
          lastResult = await withTimeout(
            executeScriptInTab(tab.id, disableNegativeStockInConfigurationPage),
            12000,
            'Script da aba de configuracao'
          );
        } catch (innerError) {
          lastResult = { ok: false, message: getErrorMessage(innerError || error) };
        }
      }

      if (lastResult && lastResult.found && lastResult.ok) {
        await delay(Math.max(DOCUMENT_NEGATIVE_STOCK_VISUAL_TAB_CLOSE_DELAY_MS, 4000));
        return lastResult;
      }
    }

    throw new Error('A configuracao de estoque nao foi encontrada na aba oculta. Ultimo estado: ' + JSON.stringify(lastResult || null));
  } finally {
    if (tab && isNumber(tab.id)) {
      await withTimeout(removeTabQuietly(tab.id), 5000, 'Fechamento da aba de configuracao').catch(() => {});
    }
  }
}

async function forceNegativeStockDisabled(token, sourceWindowId) {
  let apiPayload = null;
  let apiChanged = false;
  let visualResult = null;

  try {
    apiPayload = await fetchNegativeStockConfiguration(token);
    if (apiPayload && apiPayload.fiscal && apiPayload.fiscal.emissor) {
      apiPayload.fiscal.emissor.isAllowedNegativeStock = false;
      await persistNegativeStockConfiguration(token, apiPayload);
      apiChanged = true;
    }
  } catch (error) {
    appendLog('Falha ao desativar estoque zerado pela API; tentando pela tela: ' + getErrorMessage(error), 'error');
  }

  try {
    visualResult = await disableNegativeStockThroughConfigurationTab(sourceWindowId);
  } catch (error) {
    if (!apiChanged) throw error;
    visualResult = { ok: false, message: getErrorMessage(error) };
  }

  return {
    ok: true,
    apiChanged,
    visualResult,
    notification: visualResult && visualResult.notification || null,
  };
}

function clearDocumentNegativeStockGuardTimeout() {
  if (!documentNegativeStockGuardTimeout) return;
  clearTimeout(documentNegativeStockGuardTimeout);
  documentNegativeStockGuardTimeout = null;
}

function clearDocumentNegativeStockGuardAlarm() {
  clearDocumentNegativeStockGuardTimeout();
  try {
    if (chrome.alarms && typeof chrome.alarms.clear === 'function') {
      chrome.alarms.clear(DOCUMENT_NEGATIVE_STOCK_GUARD_ALARM_NAME, () => {});
    }
  } catch (error) {}
}

function scheduleDocumentNegativeStockGuardTimeout(expiresAt) {
  clearDocumentNegativeStockGuardTimeout();
  const delay = Number(expiresAt) - Date.now();
  if (!Number.isFinite(delay) || delay <= 0) {
    documentNegativeStockGuardTimeout = setTimeout(runDocumentNegativeStockScheduledDisable, 50);
    return;
  }
  documentNegativeStockGuardTimeout = setTimeout(runDocumentNegativeStockScheduledDisable, Math.min(delay + 100, 2147483647));
}

async function scheduleDocumentNegativeStockScheduledDisable(message, sender) {
  const expiresAt = Number(message && message.expiresAt) || 0;
  const token = String(message && message.token || '').trim();
  const ownerBrowserId = String(message && message.ownerBrowserId || '').trim();
  const sourceWindowId = isNumber(message && message.sourceWindowId)
    ? message.sourceWindowId
    : (sender && sender.tab && isNumber(sender.tab.windowId) ? sender.tab.windowId : null);
  const sourceTabId = isNumber(message && message.sourceTabId)
    ? message.sourceTabId
    : (sender && sender.tab && isNumber(sender.tab.id) ? sender.tab.id : null);
  if (!token || !ownerBrowserId || !Number.isFinite(expiresAt) || expiresAt <= 0) {
    throw new Error('Agendamento invalido para a trava de estoque.');
  }

  const state = {
    token,
    ownerBrowserId,
    expiresAt,
    createdAt: Date.now(),
    sourceWindowId,
    sourceTabId,
  };

  await setStorageLocal({ [DOCUMENT_NEGATIVE_STOCK_GUARD_BACKGROUND_STORAGE_KEY]: state });

  try {
    if (chrome.alarms && typeof chrome.alarms.create === 'function') {
      chrome.alarms.create(DOCUMENT_NEGATIVE_STOCK_GUARD_ALARM_NAME, { when: Math.max(Date.now() + 1000, expiresAt) });
    }
  } catch (error) {}

  scheduleDocumentNegativeStockGuardTimeout(expiresAt);
  return state;
}

async function clearDocumentNegativeStockScheduledDisable() {
  clearDocumentNegativeStockGuardAlarm();
  await removeStorageLocal(DOCUMENT_NEGATIVE_STOCK_GUARD_BACKGROUND_STORAGE_KEY);
}

async function readDocumentNegativeStockScheduledDisable() {
  const stored = await getStorageLocal(DOCUMENT_NEGATIVE_STOCK_GUARD_BACKGROUND_STORAGE_KEY);
  const state = stored && stored[DOCUMENT_NEGATIVE_STOCK_GUARD_BACKGROUND_STORAGE_KEY];
  if (!state || typeof state !== 'object') return null;
  const expiresAt = Number(state.expiresAt) || 0;
  const token = String(state.token || '').trim();
  const ownerBrowserId = String(state.ownerBrowserId || '').trim();
  const sourceWindowId = isNumber(state.sourceWindowId) ? state.sourceWindowId : null;
  const sourceTabId = isNumber(state.sourceTabId) ? state.sourceTabId : null;
  if (!token || !ownerBrowserId || expiresAt <= 0) {
    await removeStorageLocal(DOCUMENT_NEGATIVE_STOCK_GUARD_BACKGROUND_STORAGE_KEY);
    return null;
  }
  return { token, ownerBrowserId, expiresAt, createdAt: Number(state.createdAt) || 0, sourceWindowId, sourceTabId };
}

async function runDocumentNegativeStockScheduledDisable() {
  if (documentNegativeStockGuardDisableRunning) {
    return { ok: true, skipped: true, reason: 'already_running' };
  }

  documentNegativeStockGuardDisableRunning = true;
  clearDocumentNegativeStockGuardAlarm();

  try {
    const state = await readDocumentNegativeStockScheduledDisable();
    if (!state) {
      return { ok: true, skipped: true, reason: 'missing_schedule' };
    }

    const nowAt = Date.now();
    if (state.expiresAt > nowAt + 500) {
      scheduleDocumentNegativeStockGuardTimeout(state.expiresAt);
      try {
        if (chrome.alarms && typeof chrome.alarms.create === 'function') {
          chrome.alarms.create(DOCUMENT_NEGATIVE_STOCK_GUARD_ALARM_NAME, { when: state.expiresAt });
        }
      } catch (error) {}
      return { ok: true, skipped: true, reason: 'not_due' };
    }

    const result = await forceNegativeStockDisabled(state.token, state.sourceWindowId);
    await clearDocumentNegativeStockScheduledDisable();
    notifyDocumentNegativeStockDisabled(state.sourceTabId, result);
    appendLog('Estoque zerado desativado automaticamente pelo agendamento da extensao.', 'info');
    return Object.assign({ changed: true }, result);
  } finally {
    documentNegativeStockGuardDisableRunning = false;
  }
}

async function restoreDocumentNegativeStockGuardSchedule() {
  const state = await readDocumentNegativeStockScheduledDisable();
  if (!state) return;
  if (state.expiresAt <= Date.now() + 500) {
    runDocumentNegativeStockScheduledDisable().catch((error) => {
      appendLog('Falha ao restaurar agendamento de estoque: ' + getErrorMessage(error), 'error');
    });
    return;
  }

  scheduleDocumentNegativeStockGuardTimeout(state.expiresAt);
  try {
    if (chrome.alarms && typeof chrome.alarms.create === 'function') {
      chrome.alarms.create(DOCUMENT_NEGATIVE_STOCK_GUARD_ALARM_NAME, { when: state.expiresAt });
    }
  } catch (error) {}
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
}

function reinforceNoteAssistantSourceActive() {
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
}

function reinforcePendingSourceTabActive(pending) {
  if (!pending) return;
  clearPendingFocusTimers(pending);
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

function buildDirectNfeBatchDownloadOptions(kind, url, fileNameHint) {
  if (kind === 'pdf') {
    return {
      url,
      filename: inferPdfFileName(url, fileNameHint),
      saveAs: false,
    };
  }

  return {
    url,
    filename: inferXmlFileName(url, fileNameHint),
    saveAs: false,
  };
}

function directNfeBatchDownloadUrl(kind, url, fileNameHint) {
  return new Promise((resolve, reject) => {
    if (kind === 'pdf') {
      if (!NFE_BATCH_DOWNLOAD_ENABLED) {
        reject(new Error('Download em lote de NF-e desativado.'));
        return;
      }
      if (!isEligiblePdfUrl(url)) {
        reject(new Error('URL do DANFE inválida para download.'));
        return;
      }
    } else {
      if (!NFE_BATCH_DOWNLOAD_ENABLED || !XML_DOWNLOAD_ENABLED) {
        reject(new Error('Download de XML desativado.'));
        return;
      }
      if (!isEligibleXmlUrl(url)) {
        reject(new Error('URL do XML inválida para download.'));
        return;
      }
    }

    chrome.downloads.download(buildDirectNfeBatchDownloadOptions(kind, url, fileNameHint), (downloadId) => {
      const error = chrome.runtime.lastError;
      if (error) {
        reject(new Error(error.message || 'Falha ao iniciar download.'));
        return;
      }
      resolve({ downloadId });
    });
  });
}

function directNfeBatchDownloadContent(kind, content, fileNameHint) {
  if (kind !== 'xml') {
    return Promise.reject(new Error('Download por conteúdo só é suportado para XML.'));
  }
  if (!content) {
    return Promise.reject(new Error('Conteúdo XML vazio.'));
  }
  const dataUrl = 'data:application/xml;charset=utf-8,' + encodeURIComponent(content);
  return directNfeBatchDownloadUrl('xml', dataUrl, fileNameHint);
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (!message || typeof message.type !== 'string') return;

  if (message.type === 'document-negative-stock-get-configuration') {
    fetchNegativeStockConfiguration(message.token)
      .then((payload) => {
        sendResponse({ ok: true, payload });
      })
      .catch((error) => {
        sendResponse({ ok: false, reason: 'zweb_api_failed', message: getErrorMessage(error) });
      });
    return true;
  }

  if (message.type === 'document-negative-stock-put-configuration') {
    persistNegativeStockConfiguration(message.token, message.payload)
      .then((payload) => {
        sendResponse({ ok: true, payload });
      })
      .catch((error) => {
        sendResponse({ ok: false, reason: 'zweb_api_failed', message: getErrorMessage(error) });
      });
    return true;
  }

  if (message.type === 'document-negative-stock-force-disable-now') {
    const sourceWindowId = sender && sender.tab && isNumber(sender.tab.windowId) ? sender.tab.windowId : null;
    forceNegativeStockDisabled(message.token, sourceWindowId)
      .then((result) => {
        sendResponse(result || { ok: true });
      })
      .catch((error) => {
        sendResponse({ ok: false, reason: 'disable_failed', message: getErrorMessage(error) });
      });
    return true;
  }

  if (message.type === 'document-negative-stock-schedule-disable') {
    scheduleDocumentNegativeStockScheduledDisable(message, sender)
      .then((state) => {
        sendResponse({ ok: true, expiresAt: state.expiresAt });
      })
      .catch((error) => {
        sendResponse({ ok: false, reason: 'schedule_failed', message: getErrorMessage(error) });
      });
    return true;
  }

  if (message.type === 'document-negative-stock-clear-disable') {
    clearDocumentNegativeStockScheduledDisable()
      .then(() => {
        sendResponse({ ok: true });
      })
      .catch((error) => {
        sendResponse({ ok: false, reason: 'clear_failed', message: getErrorMessage(error) });
      });
    return true;
  }

  if (message.type === 'document-negative-stock-run-disable-now') {
    runDocumentNegativeStockScheduledDisable()
      .then((result) => {
        sendResponse(result || { ok: true });
      })
      .catch((error) => {
        sendResponse({ ok: false, reason: 'disable_failed', message: getErrorMessage(error) });
      });
    return true;
  }

  if (message.type === 'fiscal-clone-dav-log') {
    appendFiscalCloneDavBackgroundLog(
      message.entry && message.entry.event || 'content-log',
      message.entry || {}
    ).then(() => {
      sendResponse({ ok: true });
    }).catch((error) => {
      sendResponse({ ok: false, message: getErrorMessage(error) });
    });
    return true;
  }

  if (message.type === 'fiscal-clone-dav-background-start') {
    const sourceWindowId = sender && sender.tab && isNumber(sender.tab.windowId) ? sender.tab.windowId : null;
    cloneDavInBackgroundTab(message.flow || {}, sourceWindowId)
      .then((result) => {
        sendResponse(result || { ok: true });
      })
      .catch((error) => {
        sendResponse({ ok: false, reason: 'clone_failed', message: getErrorMessage(error) });
      });
    return true;
  }

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

  if (message.type === 'nfe-batch-direct-download-url') {
    const kind = message.kind === 'pdf' ? 'pdf' : 'xml';
    directNfeBatchDownloadUrl(kind, message.url, message.fileName || message.fileNameHint || '')
      .then((result) => {
        sendResponse({ ok: true, downloadId: result.downloadId });
      })
      .catch((error) => {
        sendResponse({ ok: false, reason: 'download_failed', message: getErrorMessage(error) });
      });
    return true;
  }

  if (message.type === 'nfe-batch-direct-download-content') {
    const kind = message.kind === 'pdf' ? 'pdf' : 'xml';
    directNfeBatchDownloadContent(kind, message.content, message.fileName || message.fileNameHint || '')
      .then((result) => {
        sendResponse({ ok: true, downloadId: result.downloadId });
      })
      .catch((error) => {
        sendResponse({ ok: false, reason: 'download_failed', message: getErrorMessage(error) });
      });
    return true;
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

try {
  chrome.alarms.onAlarm.addListener((alarm) => {
    if (!alarm || alarm.name !== DOCUMENT_NEGATIVE_STOCK_GUARD_ALARM_NAME) return;
    runDocumentNegativeStockScheduledDisable().catch((error) => {
      appendLog('Falha ao desativar estoque zerado pelo alarme: ' + getErrorMessage(error), 'error');
      setTimeout(() => {
        runDocumentNegativeStockScheduledDisable().catch((retryError) => {
          appendLog('Falha na nova tentativa de desativar estoque zerado: ' + getErrorMessage(retryError), 'error');
        });
      }, 10000);
    });
  });
} catch (error) {}

restoreDocumentNegativeStockGuardSchedule();

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

  if (!pending) return;

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
      const state = self.ZWEB_FEATURES && typeof self.ZWEB_FEATURES.normalizeState === 'function'
        ? self.ZWEB_FEATURES.normalizeState({ stockPriceSimulationEnabled: changes.stockPriceSimulationEnabled.newValue })
        : { stockPriceSimulationEnabled: changes.stockPriceSimulationEnabled.newValue !== false };
      STOCK_PRICE_SIMULATION_ENABLED = state.stockPriceSimulationEnabled !== false;
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
