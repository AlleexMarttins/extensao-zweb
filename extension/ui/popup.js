document.addEventListener('DOMContentLoaded', () => {
  const featureCatalog = globalThis.ZWEB_FEATURES || { definitions: [], getDefaults: () => ({}) };
  const featureDefaults = featureCatalog.getDefaults();
  const features = featureCatalog.definitions.slice();
  const featureGroups = document.getElementById('featureGroups');
  const reloadBtn = document.getElementById('reload');
  const openVisualSettingsBtn = document.getElementById('openVisualSettings');
  const openLogsBtn = document.getElementById('openLogs');
  const localDecimalQuantityInput = document.getElementById('localDecimalQuantity');
  const localDecimalPriceInput = document.getElementById('localDecimalPrice');
  const saveDecimalPrefsBtn = document.getElementById('saveDecimalPrefs');
  const resetDecimalPrefsBtn = document.getElementById('resetDecimalPrefs');
  const decimalPrefsStatus = document.getElementById('decimalPrefsStatus');
  const inputsByKey = new Map();
  const RELOAD_WARNING = 'Salve os dados da p\u00e1gina antes de recarregar para evitar perda de informa\u00e7\u00f5es.';
  const LOCAL_DECIMAL_PREFS_STORAGE_KEY = 'zwebLocalDecimalPreferences';
  const GLOBAL_DECIMAL_CONFIG_STORAGE_KEY = 'zwebGlobalDecimalConfig';

  function normalizeState(rawState) {
    if (featureCatalog && typeof featureCatalog.normalizeState === 'function') {
      return featureCatalog.normalizeState(rawState);
    }

    return Object.assign({}, featureDefaults, rawState || {});
  }

  function createFeatureCard(feature) {
    const card = document.createElement('div');
    card.className = 'feature-card';

    const body = document.createElement('div');

    const title = document.createElement('h2');
    title.className = 'feature-title';
    title.textContent = feature.title;
    body.appendChild(title);

    const description = document.createElement('p');
    description.className = 'feature-description';
    description.textContent = feature.description;
    body.appendChild(description);

    const meta = document.createElement('div');
    meta.className = 'feature-meta';

    const scopeBadge = document.createElement('span');
    scopeBadge.className = 'badge';
    scopeBadge.textContent = feature.group;
    meta.appendChild(scopeBadge);

    if (feature.reloadPrompt) {
      const reloadBadge = document.createElement('span');
      reloadBadge.className = 'badge badge-reload';
      reloadBadge.textContent = 'Pode pedir recarga';
      meta.appendChild(reloadBadge);
    }

    if (feature.forceDisabled) {
      const disabledBadge = document.createElement('span');
      disabledBadge.className = 'badge';
      disabledBadge.textContent = 'Desativado';
      meta.appendChild(disabledBadge);
    }

    body.appendChild(meta);

    const toggle = document.createElement('label');
    toggle.className = 'switch';

    const input = document.createElement('input');
    input.type = 'checkbox';
    input.id = 'feature-' + feature.key;
    input.dataset.featureKey = feature.key;
    input.disabled = !!feature.forceDisabled;

    const slider = document.createElement('span');
    slider.className = 'slider';
    slider.setAttribute('aria-hidden', 'true');

    toggle.appendChild(input);
    toggle.appendChild(slider);

    card.appendChild(body);
    card.appendChild(toggle);

    inputsByKey.set(feature.key, input);
    return card;
  }

  function renderFeatureGroups() {
    featureGroups.textContent = '';
    const groups = new Map();

    features.forEach((feature) => {
      if (!groups.has(feature.group)) groups.set(feature.group, []);
      groups.get(feature.group).push(feature);
    });

    groups.forEach((groupFeatures, groupName) => {
      const section = document.createElement('section');
      const heading = document.createElement('h3');
      heading.className = 'group-title';
      heading.textContent = groupName;
      section.appendChild(heading);

      const list = document.createElement('div');
      list.className = 'feature-list';
      groupFeatures.forEach((feature) => list.appendChild(createFeatureCard(feature)));

      section.appendChild(list);
      featureGroups.appendChild(section);
    });
  }

  function applyInputs(state) {
    features.forEach((feature) => {
      const input = inputsByKey.get(feature.key);
      if (!input) return;
      input.checked = feature.forceDisabled ? false : state[feature.key] !== false;
      input.disabled = !!feature.forceDisabled;
    });
  }

  function reloadActiveTab() {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs && tabs[0]) chrome.tabs.reload(tabs[0].id);
    });
  }

  function setDecimalStatus(message, tone) {
    if (!decimalPrefsStatus) return;
    decimalPrefsStatus.textContent = message || '';
    decimalPrefsStatus.style.color = tone === 'error'
      ? '#a53434'
      : tone === 'success'
        ? '#146737'
        : '';
  }

  function isZwebTab(tab) {
    return !!(tab && typeof tab.url === 'string' && tab.url.indexOf('https://zweb.com.br/') === 0);
  }

  function withActiveZwebTab(callback) {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const tab = tabs && tabs[0];
      if (!isZwebTab(tab)) {
        callback(new Error('Abra uma aba da Zweb para configurar as casas decimais locais.'));
        return;
      }
      callback(null, tab);
    });
  }

  function runInActiveZwebTab(func, args, callback) {
    withActiveZwebTab((tabError, tab) => {
      if (tabError) {
        callback(tabError);
        return;
      }

      chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func,
        args: args || []
      }, (results) => {
        const runtimeError = chrome.runtime.lastError;
        if (runtimeError) {
          callback(new Error(runtimeError.message || 'Falha ao acessar a aba da Zweb.'));
          return;
        }

        const result = results && results[0] ? results[0].result : null;
        if (result && result.error) {
          callback(new Error(result.error));
          return;
        }

        callback(null, result, tab);
      });
    });
  }

  function readZwebDecimalPrefsInPage(localKey, globalKey) {
    function parseJson(raw, fallback) {
      try {
        return JSON.parse(raw || '');
      } catch (error) {
        return fallback;
      }
    }

    function decodePayload(token) {
      try {
        const payload = String(token || '').split('.')[1] || '';
        let input = payload.replace(/-/g, '+').replace(/_/g, '/');
        while (input.length % 4) input += '=';
        const decoded = atob(input);
        const json = decodeURIComponent(Array.from(decoded, (char) => '%' + ('00' + char.charCodeAt(0).toString(16)).slice(-2)).join(''));
        return parseJson(json, null);
      } catch (error) {
        return null;
      }
    }

    function identityKey(identity) {
      return identity && identity.companyId && identity.userId
        ? identity.companyId + '::' + identity.userId
        : '';
    }

    function companyKey(identity) {
      return identity && identity.companyId ? 'company::' + identity.companyId : '';
    }

    const tokenPayload = decodePayload(localStorage.getItem('token'));
    const company = tokenPayload && tokenPayload.cpn || {};
    const user = tokenPayload && tokenPayload.usr || {};
    const identity = {
      companyId: String(company.uuid || company.id || company.identification || '').trim(),
      userId: String(user.uuid || user.id || user.email || tokenPayload && tokenPayload.sub || '').trim(),
      companyName: String(company.name || '').trim(),
      userName: String(user.name || user.email || '').trim()
    };
    const key = identityKey(identity);
    if (!key) return { error: 'N\u00e3o foi poss\u00edvel identificar o login da Zweb nesta aba.' };

    const preferences = parseJson(localStorage.getItem(localKey), {}) || {};
    const globals = parseJson(localStorage.getItem(globalKey), {}) || {};
    const local = preferences[key] || null;
    const global = globals[key] || globals[companyKey(identity)] || null;

    return {
      identity,
      key,
      local,
      global,
      decimalQuantity: local && local.decimalQuantity != null
        ? local.decimalQuantity
        : global && global.decimalQuantity != null
          ? global.decimalQuantity
          : 2,
      decimalPrice: local && local.decimalPrice != null
        ? local.decimalPrice
        : global && global.decimalPrice != null
          ? global.decimalPrice
          : 2,
      usingLocal: !!local
    };
  }

  function saveZwebDecimalPrefsInPage(localKey, quantity, price) {
    function parseJson(raw, fallback) {
      try {
        return JSON.parse(raw || '');
      } catch (error) {
        return fallback;
      }
    }

    function decodePayload(token) {
      try {
        const payload = String(token || '').split('.')[1] || '';
        let input = payload.replace(/-/g, '+').replace(/_/g, '/');
        while (input.length % 4) input += '=';
        const decoded = atob(input);
        const json = decodeURIComponent(Array.from(decoded, (char) => '%' + ('00' + char.charCodeAt(0).toString(16)).slice(-2)).join(''));
        return parseJson(json, null);
      } catch (error) {
        return null;
      }
    }

    const decimalQuantity = Math.max(2, Math.min(4, Math.round(Number(quantity))));
    const decimalPrice = Math.max(2, Math.min(10, Math.round(Number(price))));
    if (!Number.isFinite(decimalQuantity) || !Number.isFinite(decimalPrice)) {
      return { error: 'Informe valores v\u00e1lidos para quantidade e pre\u00e7o.' };
    }

    const tokenPayload = decodePayload(localStorage.getItem('token'));
    const company = tokenPayload && tokenPayload.cpn || {};
    const user = tokenPayload && tokenPayload.usr || {};
    const companyId = String(company.uuid || company.id || company.identification || '').trim();
    const userId = String(user.uuid || user.id || user.email || tokenPayload && tokenPayload.sub || '').trim();
    const key = companyId && userId ? companyId + '::' + userId : '';
    if (!key) return { error: 'N\u00e3o foi poss\u00edvel identificar o login da Zweb nesta aba.' };

    const preferences = parseJson(localStorage.getItem(localKey), {}) || {};
    preferences[key] = Object.assign({}, preferences[key] || {}, {
      companyId,
      userId,
      companyName: String(company.name || '').trim(),
      userName: String(user.name || user.email || '').trim(),
      decimalQuantity,
      decimalPrice,
      updatedAt: new Date().toISOString()
    });
    localStorage.setItem(localKey, JSON.stringify(preferences));

    return { key, decimalQuantity, decimalPrice };
  }

  function resetZwebDecimalPrefsInPage(localKey) {
    function parseJson(raw, fallback) {
      try {
        return JSON.parse(raw || '');
      } catch (error) {
        return fallback;
      }
    }

    function decodePayload(token) {
      try {
        const payload = String(token || '').split('.')[1] || '';
        let input = payload.replace(/-/g, '+').replace(/_/g, '/');
        while (input.length % 4) input += '=';
        const decoded = atob(input);
        const json = decodeURIComponent(Array.from(decoded, (char) => '%' + ('00' + char.charCodeAt(0).toString(16)).slice(-2)).join(''));
        return parseJson(json, null);
      } catch (error) {
        return null;
      }
    }

    const tokenPayload = decodePayload(localStorage.getItem('token'));
    const company = tokenPayload && tokenPayload.cpn || {};
    const user = tokenPayload && tokenPayload.usr || {};
    const companyId = String(company.uuid || company.id || company.identification || '').trim();
    const userId = String(user.uuid || user.id || user.email || tokenPayload && tokenPayload.sub || '').trim();
    const key = companyId && userId ? companyId + '::' + userId : '';
    if (!key) return { error: 'N\u00e3o foi poss\u00edvel identificar o login da Zweb nesta aba.' };

    const preferences = parseJson(localStorage.getItem(localKey), {}) || {};
    delete preferences[key];
    localStorage.setItem(localKey, JSON.stringify(preferences));
    return { key };
  }

  function normalizeDecimalInput(input, min, max) {
    const value = Number(input && input.value);
    if (!Number.isFinite(value)) return null;
    return Math.max(min, Math.min(max, Math.round(value)));
  }

  function loadDecimalPrefs() {
    if (!localDecimalQuantityInput || !localDecimalPriceInput) return;
    setDecimalStatus('Lendo prefer\u00eancia da aba ativa...', '');

    runInActiveZwebTab(readZwebDecimalPrefsInPage, [
      LOCAL_DECIMAL_PREFS_STORAGE_KEY,
      GLOBAL_DECIMAL_CONFIG_STORAGE_KEY
    ], (error, result) => {
      if (error) {
        setDecimalStatus(error.message, 'error');
        saveDecimalPrefsBtn && (saveDecimalPrefsBtn.disabled = true);
        resetDecimalPrefsBtn && (resetDecimalPrefsBtn.disabled = true);
        return;
      }

      localDecimalQuantityInput.value = result.decimalQuantity;
      localDecimalPriceInput.value = result.decimalPrice;
      saveDecimalPrefsBtn && (saveDecimalPrefsBtn.disabled = false);
      resetDecimalPrefsBtn && (resetDecimalPrefsBtn.disabled = false);
      setDecimalStatus(
        result.usingLocal
          ? 'Prefer\u00eancia local ativa para ' + (result.identity.userName || 'este login') + '.'
          : 'Sem prefer\u00eancia local. Usando padr\u00e3o global conhecido.',
        result.usingLocal ? 'success' : ''
      );
    });
  }

  function promptReloadActiveTab() {
    if (window.confirm('Prefer\u00eancia salva. Recarregar a p\u00e1gina ativa agora para aplicar?\n\n' + RELOAD_WARNING)) {
      reloadActiveTab();
    }
  }

  function saveDecimalPrefs() {
    const quantity = normalizeDecimalInput(localDecimalQuantityInput, 2, 4);
    const price = normalizeDecimalInput(localDecimalPriceInput, 2, 10);

    if (quantity == null || price == null) {
      setDecimalStatus('Quantidade deve ser 2 a 4; pre\u00e7o deve ser 2 a 10.', 'error');
      return;
    }

    localDecimalQuantityInput.value = quantity;
    localDecimalPriceInput.value = price;
    setDecimalStatus('Salvando prefer\u00eancia local...', '');

    runInActiveZwebTab(saveZwebDecimalPrefsInPage, [
      LOCAL_DECIMAL_PREFS_STORAGE_KEY,
      quantity,
      price
    ], (error) => {
      if (error) {
        setDecimalStatus(error.message, 'error');
        return;
      }

      setDecimalStatus('Prefer\u00eancia local salva para este login.', 'success');
      promptReloadActiveTab();
    });
  }

  function resetDecimalPrefs() {
    setDecimalStatus('Removendo prefer\u00eancia local...', '');

    runInActiveZwebTab(resetZwebDecimalPrefsInPage, [
      LOCAL_DECIMAL_PREFS_STORAGE_KEY
    ], (error) => {
      if (error) {
        setDecimalStatus(error.message, 'error');
        return;
      }

      setDecimalStatus('Prefer\u00eancia local removida. Ser\u00e1 usado o padr\u00e3o global.', 'success');
      loadDecimalPrefs();
      promptReloadActiveTab();
    });
  }

  function maybePromptReload(feature) {
    if (!feature.reloadPrompt) return false;
    return window.confirm(
      'Deseja recarregar a p\u00e1gina ativa agora?\n\n' +
      RELOAD_WARNING
    );
  }

  function persistFeatureState(featureKey, nextValue) {
    const feature = features.find((entry) => entry.key === featureKey);
    if (!feature) return;

    chrome.storage.local.get(featureDefaults, (currentState) => {
      const nextState = normalizeState(currentState);
      nextState[featureKey] = nextValue !== false;

      chrome.storage.local.set(nextState, () => {
        const shouldReload = maybePromptReload(feature);
        applyInputs(nextState);

        if (shouldReload) reloadActiveTab();
      });
    });
  }

  renderFeatureGroups();

  chrome.storage.local.get(featureDefaults, (stored) => {
    const state = normalizeState(stored);
    applyInputs(state);
  });

  loadDecimalPrefs();

  featureGroups.addEventListener('change', (event) => {
    const input = event.target;
    if (!input || !input.matches('input[data-feature-key]')) return;
    if (input.disabled) return;
    persistFeatureState(input.dataset.featureKey, input.checked);
  });

  reloadBtn.addEventListener('click', () => {
    reloadActiveTab();
  });

  if (openLogsBtn) {
    openLogsBtn.addEventListener('click', () => {
      chrome.tabs.create({ url: chrome.runtime.getURL('ui/logs.html') });
    });
  }

  if (openVisualSettingsBtn) {
    openVisualSettingsBtn.addEventListener('click', () => {
      chrome.tabs.create({ url: chrome.runtime.getURL('ui/visual-settings.html') });
    });
  }

  if (saveDecimalPrefsBtn) {
    saveDecimalPrefsBtn.addEventListener('click', saveDecimalPrefs);
  }

  if (resetDecimalPrefsBtn) {
    resetDecimalPrefsBtn.addEventListener('click', resetDecimalPrefs);
  }
});
