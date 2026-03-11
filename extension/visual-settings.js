(() => {
  'use strict';

  const STORAGE_KEY = 'productStylePrefs';
  const DEFAULTS = {
    fontFamily: '',
    fontSizePx: '',
    useNormalColor: false,
    normalColor: '#181c32',
    lowStockColor: '#ef9a9a'
  };
  const FONT_OPTIONS = [
    { value: '', label: 'Padrão da Zweb' },
    { value: '"Segoe UI",Tahoma,Geneva,Verdana,sans-serif', label: 'Segoe UI' },
    { value: 'Arial,sans-serif', label: 'Arial' },
    { value: 'Tahoma,sans-serif', label: 'Tahoma' },
    { value: 'Verdana,sans-serif', label: 'Verdana' },
    { value: 'Georgia,serif', label: 'Georgia' },
    { value: 'Consolas,"Courier New",monospace', label: 'Consolas' }
  ];

  const form = document.getElementById('visualSettingsForm');
  const fontFamily = document.getElementById('fontFamily');
  const fontSizePx = document.getElementById('fontSizePx');
  const useNormalColor = document.getElementById('useNormalColor');
  const normalColor = document.getElementById('normalColor');
  const lowStockColor = document.getElementById('lowStockColor');
  const saveBtn = document.getElementById('saveVisualSettings');
  const resetBtn = document.getElementById('resetVisualSettings');
  const status = document.getElementById('visualSettingsStatus');
  const previewCard = document.getElementById('visualPreviewCard');
  const previewTitle = document.getElementById('previewTitle');
  const previewCopy = document.getElementById('previewCopy');
  const previewLowStockRow = document.getElementById('previewLowStockRow');

  function normalizeHexColor(value, fallback) {
    const raw = String(value || '').trim();
    if (/^#[0-9a-f]{6}$/i.test(raw)) return raw.toLowerCase();
    if (/^#[0-9a-f]{3}$/i.test(raw)) {
      const chars = raw.slice(1).split('');
      return ('#' + chars.map((ch) => ch + ch).join('')).toLowerCase();
    }
    return fallback;
  }

  function normalizePrefs(rawPrefs) {
    const next = Object.assign({}, DEFAULTS, rawPrefs || {});
    next.fontFamily = FONT_OPTIONS.some((option) => option.value === next.fontFamily) ? next.fontFamily : DEFAULTS.fontFamily;
    next.useNormalColor = next.useNormalColor === true;
    next.normalColor = normalizeHexColor(next.normalColor, DEFAULTS.normalColor);
    next.lowStockColor = normalizeHexColor(next.lowStockColor, DEFAULTS.lowStockColor);
    const size = Number(String(next.fontSizePx || '').trim());
    next.fontSizePx = Number.isFinite(size) && size >= 10 && size <= 24 ? String(Math.round(size)) : '';
    return next;
  }

  function fillFontOptions() {
    fontFamily.innerHTML = FONT_OPTIONS
      .map((option) => '<option value="' + option.value.replace(/"/g, '&quot;') + '">' + option.label + '</option>')
      .join('');
  }

  function applyForm(prefs) {
    fontFamily.value = prefs.fontFamily || '';
    fontSizePx.value = prefs.fontSizePx || '';
    useNormalColor.checked = prefs.useNormalColor === true;
    normalColor.value = prefs.normalColor || DEFAULTS.normalColor;
    lowStockColor.value = prefs.lowStockColor || DEFAULTS.lowStockColor;
    normalColor.disabled = !useNormalColor.checked;
  }

  function readForm() {
    return normalizePrefs({
      fontFamily: fontFamily.value,
      fontSizePx: fontSizePx.value,
      useNormalColor: useNormalColor.checked,
      normalColor: normalColor.value,
      lowStockColor: lowStockColor.value
    });
  }

  function renderPreview(prefs) {
    previewCard.style.fontFamily = prefs.fontFamily || '';
    previewCard.style.fontSize = prefs.fontSizePx ? prefs.fontSizePx + 'px' : '';
    previewCard.style.color = prefs.useNormalColor ? prefs.normalColor : '';
    previewTitle.style.color = prefs.useNormalColor ? prefs.normalColor : '';
    previewCopy.style.color = prefs.useNormalColor ? prefs.normalColor : '';
    previewLowStockRow.style.color = prefs.lowStockColor || DEFAULTS.lowStockColor;
  }

  function setStatus(message) {
    status.textContent = message || '';
  }

  function savePrefs() {
    const prefs = readForm();
    chrome.storage.local.set({ [STORAGE_KEY]: prefs }, () => {
      applyForm(prefs);
      renderPreview(prefs);
      setStatus('Preferências salvas. As abas da Zweb atualizam automaticamente.');
    });
  }

  function resetPrefs() {
    chrome.storage.local.set({ [STORAGE_KEY]: DEFAULTS }, () => {
      applyForm(DEFAULTS);
      renderPreview(DEFAULTS);
      setStatus('Personalização restaurada para o padrão.');
    });
  }

  fillFontOptions();

  chrome.storage.local.get({ [STORAGE_KEY]: DEFAULTS }, (stored) => {
    const prefs = normalizePrefs(stored && stored[STORAGE_KEY]);
    applyForm(prefs);
    renderPreview(prefs);
  });

  form.addEventListener('input', () => {
    renderPreview(readForm());
    setStatus('');
  });

  useNormalColor.addEventListener('change', () => {
    normalColor.disabled = !useNormalColor.checked;
    renderPreview(readForm());
  });

  saveBtn.addEventListener('click', savePrefs);
  resetBtn.addEventListener('click', resetPrefs);
})();
