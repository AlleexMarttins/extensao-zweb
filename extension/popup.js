document.addEventListener('DOMContentLoaded', () => {
  const featureCatalog = globalThis.ZWEB_FEATURES || { definitions: [], getDefaults: () => ({}) };
  const featureDefaults = featureCatalog.getDefaults();
  const features = featureCatalog.definitions.slice();
  const featureGroups = document.getElementById('featureGroups');
  const reloadBtn = document.getElementById('reload');
  const openLogsBtn = document.getElementById('openLogs');
  const inputsByKey = new Map();
  const RELOAD_WARNING = 'Salve os dados da p\u00e1gina antes de recarregar para evitar perda de informa\u00e7\u00f5es.';

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

    body.appendChild(meta);

    const toggle = document.createElement('label');
    toggle.className = 'switch';

    const input = document.createElement('input');
    input.type = 'checkbox';
    input.id = 'feature-' + feature.key;
    input.dataset.featureKey = feature.key;

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
      input.checked = state[feature.key] !== false;
    });
  }

  function reloadActiveTab() {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs && tabs[0]) chrome.tabs.reload(tabs[0].id);
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

  featureGroups.addEventListener('change', (event) => {
    const input = event.target;
    if (!input || !input.matches('input[data-feature-key]')) return;
    persistFeatureState(input.dataset.featureKey, input.checked);
  });

  reloadBtn.addEventListener('click', () => {
    reloadActiveTab();
  });

  if (openLogsBtn) {
    openLogsBtn.addEventListener('click', () => {
      chrome.tabs.create({ url: chrome.runtime.getURL('logs.html') });
    });
  }
});
