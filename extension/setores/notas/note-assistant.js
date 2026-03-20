(function() {
  'use strict';

  const REQUIRED_KEY_LENGTH = 44;
  const MANUAL_INPUT_WINDOW_MS = 2000;
  const PENDING_FSIST_MAX_AGE_MS = 2 * 60 * 1000;
  const STORAGE_KEYS = {
    logs: 'assistantLogs',
    lastKey: 'noteAssistantLastKey',
    lastKeyAt: 'noteAssistantLastKeyAt',
    pendingFsistFill: 'noteAssistantPendingFsistFill',
  };
  const LOG_LIMIT = 300;
  const FSIST_INPUT_SELECTOR = 'input#chave';
  const FSIST_CONSULT_BUTTON_SELECTOR = '#butconsulta';
  const NFE_INPUT_SELECTOR = '#ctl00_ContentPlaceHolder1_txtChaveAcessoResumo';
  const NFE_CONSULT_BUTTON_SELECTOR = '#ctl00_ContentPlaceHolder1_btnConsultarHCaptcha';
  const NFE_CAPTCHA_SELECTOR = 'textarea[name="h-captcha-response"], textarea[name="g-recaptcha-response"]';
  const NFE_CERT_ERROR_SELECTOR = '.msg #msgok';
  const NFE_DOWNLOAD_WITH_CERT_SELECTOR = '#butComCertificado, #butComCertificado a';
  const FSIST_URL = 'https://www.fsist.com.br/';
  const ZWEB_NFE_NEW_ROUTE = '#/fiscal/nfe/new';
  const ZWEB_HOSTS = new Set(['zweb.com.br', 'www.zweb.com.br']);
  const FSIST_HOSTS = new Set(['fsist.com.br', 'www.fsist.com.br']);
  const NFE_HOSTS = new Set(['nfe.fazenda.gov.br', 'www.nfe.fazenda.gov.br']);
  const FEATURE_DEFAULTS = globalThis.ZWEB_FEATURES && typeof globalThis.ZWEB_FEATURES.getDefaults === 'function'
    ? globalThis.ZWEB_FEATURES.getDefaults()
    : { noteAssistantEnabled: true };

  const FEATURE_STATE = Object.assign({}, FEATURE_DEFAULTS);
  let lastSentKey = null;

  function applyFeatureState(nextState) {
    const normalized = globalThis.ZWEB_FEATURES && typeof globalThis.ZWEB_FEATURES.normalizeState === 'function'
      ? globalThis.ZWEB_FEATURES.normalizeState(nextState)
      : Object.assign({}, FEATURE_DEFAULTS, nextState || {});

    Object.keys(FEATURE_DEFAULTS).forEach((key) => {
      FEATURE_STATE[key] = normalized[key] !== false;
    });
  }

  function isFeatureEnabled(key) {
    return FEATURE_STATE[key] !== false;
  }

  function isVisible(el) {
    if (!el) return false;
    const style = window.getComputedStyle(el);
    if (style.display === 'none' || style.visibility === 'hidden') return false;
    return !!(el.offsetWidth || el.offsetHeight || el.getClientRects().length);
  }

  function normalizeText(value) {
    return String(value || '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  function getDigits(value) {
    return String(value || '').replace(/\D+/g, '');
  }

  function isValidAccessKey(value) {
    return getDigits(value).length === REQUIRED_KEY_LENGTH;
  }

  function logInfo(message) {
    if (!isFeatureEnabled('noteAssistantEnabled')) return;
    try {
      chrome.storage.local.get({ [STORAGE_KEYS.logs]: [] }, (stored) => {
        const current = Array.isArray(stored[STORAGE_KEYS.logs]) ? stored[STORAGE_KEYS.logs] : [];
        current.push({
          time: new Date().toISOString(),
          level: 'info',
          message: String(message || ''),
        });
        chrome.storage.local.set({
          [STORAGE_KEYS.logs]: current.slice(-LOG_LIMIT),
        });
      });
    } catch (error) {}
  }

  function isZwebHost() {
    return ZWEB_HOSTS.has(location.host) || location.host.endsWith('.zweb.com.br');
  }

  function isZwebNfeNewRoute() {
    return String(location.hash || '').toLowerCase().indexOf(ZWEB_NFE_NEW_ROUTE) !== -1;
  }

  function getLabeledTextForInput(input) {
    if (!input) return '';

    const parts = [];
    const id = input.id || '';
    if (id) {
      const label = document.querySelector('label[for="' + CSS.escape(id) + '"]');
      if (label) parts.push(label.textContent || '');
    }

    const labelledBy = input.getAttribute('aria-labelledby') || '';
    labelledBy.split(/\s+/).filter(Boolean).forEach((token) => {
      const el = document.getElementById(token);
      if (el) parts.push(el.textContent || '');
    });

    const explicit = input.getAttribute('aria-label') || input.getAttribute('placeholder') || '';
    if (explicit) parts.push(explicit);

    let container = input.closest('.form-group, .field, .form-field, .col, .row, td, th') || input.parentElement;
    for (let depth = 0; depth < 2 && container; depth += 1, container = container.parentElement) {
      const labels = container.querySelectorAll('label, .label, .field-label, .title, .text-muted, span');
      labels.forEach((el) => {
        if (el === input || el.contains(input)) return;
        parts.push(el.textContent || '');
      });
    }

    return normalizeText(parts.join(' '));
  }

  function isLikelyAccessKeyInput(input) {
    if (!input || !isVisible(input)) return false;
    if (input.tagName !== 'INPUT' && input.tagName !== 'TEXTAREA') return false;

    const type = String(input.getAttribute('type') || 'text').toLowerCase();
    if (type && !['text', 'search', 'tel', 'number'].includes(type)) return false;

    const attrs = [
      input.id,
      input.name,
      input.placeholder,
      input.getAttribute('aria-label'),
      input.getAttribute('data-field'),
      input.className,
      getLabeledTextForInput(input),
    ].map(normalizeText).filter(Boolean).join(' ');

    if (!attrs) {
      return isValidAccessKey(input.value || '');
    }

    if (attrs.indexOf('chave de acesso') !== -1) return true;
    if (attrs.indexOf('chave acesso') !== -1) return true;
    if (attrs.indexOf('acesso') !== -1 && attrs.indexOf('chave') !== -1) return true;
    if (attrs.indexOf('access key') !== -1) return true;
    return isValidAccessKey(input.value || '');
  }

  function isIgnoredZwebAccessKeyInput(input) {
    if (!input || !isZwebHost() || !isZwebNfeNewRoute()) return false;

    const attrs = [
      input.id,
      input.name,
      input.placeholder,
      input.getAttribute('aria-label'),
      input.getAttribute('data-field'),
      getLabeledTextForInput(input),
    ].map(normalizeText).filter(Boolean).join(' ');

    if (
      attrs.indexOf('chave de acesso') === -1
      && attrs.indexOf('chave acesso') === -1
      && attrs.indexOf('access key') === -1
      && !(attrs.indexOf('acesso') !== -1 && attrs.indexOf('chave') !== -1)
    ) {
      return false;
    }

    let current = input;
    for (let depth = 0; depth < 5 && current; depth += 1, current = current.parentElement) {
      const contextParts = [];
      const attrHints = [
        current.id,
        current.className,
        current.getAttribute && current.getAttribute('aria-label'),
        current.getAttribute && current.getAttribute('data-title'),
      ];
      attrHints.forEach((part) => {
        if (part) contextParts.push(part);
      });

      const headings = current.querySelectorAll('label, legend, h1, h2, h3, h4, h5, h6, .title, .subtitle, .card-title, .nav-link, .tab-title, .menu-title, .stepper-title, .text-muted, span');
      headings.forEach((el) => {
        if (!el || el === input || el.contains(input)) return;
        contextParts.push(el.textContent || '');
      });

      const contextText = normalizeText(contextParts.join(' '));
      if (contextText.indexOf('documentos vinculados') !== -1) {
        return true;
      }
    }

    return false;
  }

  function collectZwebAccessKeyInputs() {
    if (!isZwebHost()) return [];

    const candidates = Array.from(document.querySelectorAll('input, textarea'));
    const unique = new Set();
    const matches = [];

    candidates.forEach((input) => {
      if (isIgnoredZwebAccessKeyInput(input)) return;
      if (!isLikelyAccessKeyInput(input)) return;
      if (unique.has(input)) return;
      unique.add(input);
      matches.push(input);
    });

    return matches;
  }

  function setInputValueAndDispatch(input, value) {
    const descriptor = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')
      || Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, 'value');
    if (descriptor && descriptor.set) {
      descriptor.set.call(input, value);
    } else {
      input.value = value;
    }

    input.dispatchEvent(new Event('input', { bubbles: true, composed: true }));
    input.dispatchEvent(new Event('change', { bubbles: true }));
    input.dispatchEvent(new KeyboardEvent('keyup', { bubbles: true }));
  }

  function setCheckStatus(input, status, digitsLength) {
    if (!input) return;
    const lastStatus = input.__noteAssistantStatus || '';
    const lastDigitsLength = input.__noteAssistantDigitsLength || 0;
    if (lastStatus === status && lastDigitsLength === digitsLength) return;

    input.__noteAssistantStatus = status;
    input.__noteAssistantDigitsLength = digitsLength;

    if (status === 'valid') {
      logInfo('Checagem: chave valida (44 digitos).');
    } else if (status === 'empty') {
      logInfo('Checagem: campo vazio.');
    }
  }

  function requestFsistFlow(digits) {
    if (!isFeatureEnabled('noteAssistantEnabled')) return;
    if (!digits || digits === lastSentKey) return;
    lastSentKey = digits;

    try {
      chrome.runtime.sendMessage({ type: 'note-assistant-open-fsist', digits }, (response) => {
        const runtimeError = chrome.runtime && chrome.runtime.lastError;
        if (runtimeError || !response || response.ok !== true) {
          lastSentKey = null;
          logInfo('Falha ao abrir o FSIST em segundo plano.');
          return;
        }

        logInfo('FSIST aberto em segundo plano.');
      });
    } catch (error) {
      lastSentKey = null;
    }
  }

  function checkZwebInput(input, canTriggerAutomation) {
    if (!input || !isFeatureEnabled('noteAssistantEnabled')) return;
    if (isIgnoredZwebAccessKeyInput(input)) {
      input.removeAttribute('data-note-assistant-detected');
      return;
    }

    const digits = getDigits(input.value || '');
    if (digits.length === REQUIRED_KEY_LENGTH) {
      const wasDetected = input.getAttribute('data-note-assistant-detected') === 'true';
      setCheckStatus(input, 'valid', digits.length);
      input.setAttribute('data-note-assistant-detected', 'true');
      if (!wasDetected) {
        logInfo('Chave de acesso detectada.');
      }
      if (canTriggerAutomation) {
        requestFsistFlow(digits);
      }
      return;
    }

    input.removeAttribute('data-note-assistant-detected');
    if (digits.length > 0) {
      setCheckStatus(input, 'partial', digits.length);
    } else {
      setCheckStatus(input, 'empty', 0);
    }
  }

  function bindZwebInput(input) {
    if (!input || input.__noteAssistantBound) return;
    input.__noteAssistantBound = true;
    input.__noteAssistantManualAt = 0;

    const markManual = () => {
      input.__noteAssistantManualAt = Date.now();
    };

    const onInputLike = () => {
      const manualAge = Date.now() - (input.__noteAssistantManualAt || 0);
      checkZwebInput(input, manualAge <= MANUAL_INPUT_WINDOW_MS);
    };

    input.addEventListener('keydown', markManual, true);
    input.addEventListener('paste', markManual, true);
    input.addEventListener('drop', markManual, true);
    input.addEventListener('input', onInputLike, true);
    input.addEventListener('change', onInputLike, true);

    checkZwebInput(input, false);
  }

  function scanZweb() {
    if (!isFeatureEnabled('noteAssistantEnabled')) return;
    collectZwebAccessKeyInputs().forEach((input) => {
      bindZwebInput(input);
      checkZwebInput(input, false);
    });
  }

  function clearPendingFsistFill() {
    try {
      chrome.storage.local.remove(STORAGE_KEYS.pendingFsistFill);
    } catch (error) {}
  }

  function fillFsistInput() {
    if (!isFeatureEnabled('noteAssistantEnabled')) return false;
    const input = document.querySelector(FSIST_INPUT_SELECTOR);
    if (!input || !isVisible(input)) return false;

    try {
      chrome.storage.local.get({
        [STORAGE_KEYS.pendingFsistFill]: null,
      }, (stored) => {
        const pending = stored[STORAGE_KEYS.pendingFsistFill];
        const isExpired = !pending || !pending.chave || !pending.at || (Date.now() - pending.at) > PENDING_FSIST_MAX_AGE_MS;

        if (isExpired) {
          if (pending) clearPendingFsistFill();
          return;
        }

        const nextValue = String(pending.chave || '');
        if (!nextValue) return;

        if ((input.value || '') !== nextValue) {
          setInputValueAndDispatch(input, nextValue);
          logInfo('Chave preenchida no FSIST.');
        }

        const button = document.querySelector(FSIST_CONSULT_BUTTON_SELECTOR);
        if (button && button.__noteAssistantLastValue !== nextValue) {
          button.__noteAssistantLastValue = nextValue;
          try {
            button.click();
            logInfo('FSIST: consulta disparada automaticamente.');
          } catch (error) {}
        }

        clearPendingFsistFill();
      });
    } catch (error) {}

    return true;
  }

  function fillNfeInput() {
    if (!isFeatureEnabled('noteAssistantEnabled')) return false;
    const input = document.querySelector(NFE_INPUT_SELECTOR);
    if (!input || !isVisible(input)) return false;

    try {
      chrome.storage.local.get({
        [STORAGE_KEYS.lastKey]: '',
      }, (stored) => {
        const nextValue = String(stored[STORAGE_KEYS.lastKey] || '');
        if (!nextValue) return;

        if ((input.value || '') !== nextValue) {
          setInputValueAndDispatch(input, nextValue);
          logInfo('Portal NF-e: chave preenchida automaticamente.');
        }

        const captchaSolved = Array.from(document.querySelectorAll(NFE_CAPTCHA_SELECTOR))
          .some((el) => String(el.value || '').trim().length > 0);
        const button = document.querySelector(NFE_CONSULT_BUTTON_SELECTOR);
        if (captchaSolved && button && button.__noteAssistantLastValue !== nextValue) {
          button.__noteAssistantLastValue = nextValue;
          try {
            button.click();
            logInfo('Portal NF-e: consulta disparada automaticamente.');
          } catch (error) {}
        }
      });
    } catch (error) {}

    return true;
  }

  function handleNfeDownload() {
    if (!isFeatureEnabled('noteAssistantEnabled')) return false;

    const certErrorButton = document.querySelector(NFE_CERT_ERROR_SELECTOR);
    if (certErrorButton && !certErrorButton.__noteAssistantHandled) {
      certErrorButton.__noteAssistantHandled = true;
      try {
        certErrorButton.click();
        logInfo('Portal NF-e: aviso de certificado fechado.');
      } catch (error) {}
      return true;
    }

    const downloadButton = document.querySelector(NFE_DOWNLOAD_WITH_CERT_SELECTOR);
    if (downloadButton && !downloadButton.__noteAssistantHandled) {
      downloadButton.__noteAssistantHandled = true;
      try {
        downloadButton.click();
        logInfo('Portal NF-e: clique automatico em baixar XML.');
      } catch (error) {}
      return true;
    }

    return false;
  }

  function resetState() {
    lastSentKey = null;
    try {
      chrome.storage.local.remove([
        STORAGE_KEYS.lastKey,
        STORAGE_KEYS.lastKeyAt,
        STORAGE_KEYS.pendingFsistFill,
      ]);
    } catch (error) {}
    logInfo('Reset: estado limpo para nova tentativa.');
  }

  function initZweb() {
    logInfo('Assistente de Nota: script ativo na Zweb.');
    const observer = new MutationObserver(scanZweb);
    observer.observe(document.documentElement || document.body, {
      childList: true,
      subtree: true,
    });

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', scanZweb);
    } else {
      scanZweb();
    }

    window.addEventListener('hashchange', scanZweb);
    setInterval(scanZweb, 1200);
  }

  function initFsist() {
    logInfo('Assistente de Nota: script ativo no FSIST.');
    const observer = new MutationObserver(fillFsistInput);
    observer.observe(document.documentElement || document.body, {
      childList: true,
      subtree: true,
    });

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fillFsistInput);
    } else {
      fillFsistInput();
    }

    setInterval(fillFsistInput, 1200);
  }

  function initNfePortal() {
    logInfo('Assistente de Nota: script ativo no Portal NF-e.');
    const refresh = () => {
      fillNfeInput();
      handleNfeDownload();
    };

    const observer = new MutationObserver(refresh);
    observer.observe(document.documentElement || document.body, {
      childList: true,
      subtree: true,
    });

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', refresh);
    } else {
      refresh();
    }

    setInterval(refresh, 1200);
  }

  function initFeatureState() {
    try {
      chrome.storage.local.remove('noteAssistantOpenFsistRequest');
    } catch (error) {}

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

        if (!isFeatureEnabled('noteAssistantEnabled')) {
          lastSentKey = null;
        }
      });
    } catch (error) {}
  }

  initFeatureState();

  if (isZwebHost()) {
    initZweb();
  } else if (FSIST_HOSTS.has(location.host)) {
    initFsist();
  } else if (NFE_HOSTS.has(location.host)) {
    initNfePortal();
  }

  try {
    chrome.runtime.onMessage.addListener((message) => {
      if (!message || message.type !== 'note-assistant-retry') return;
      if (!isZwebHost()) return;
      resetState();
      scanZweb();
    });
  } catch (error) {}
})();
