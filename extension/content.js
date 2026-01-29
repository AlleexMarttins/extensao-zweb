(function() {
  'use strict';

  const IDS = ['botaoCadastrar', 'grid.primaryButton', 'grid.primaryButton'];
  const TEXTS = ['Cadastrar produto', 'Cadastrar Produto', 'Cadastrar'];
  const ARIA_LABELS = ['Excluir', 'Remover', 'Abrir', 'Editar'];
  const ICON_CLASSES = ['fa-pencil', 'fa-pencil-alt', 'fa-edit', 'fa-times', 'fa-trash', 'fa-trash-alt'];

  let ACTIVE = true;

  function markBlocked(el) {
    try {
      if (!el || el.__blockedByExt) return;
      el.__blockedByExt = true;
      // Preferred: fully hide when it is a delete/edit action
      try {
        const aria = (el.getAttribute && el.getAttribute('aria-label')) || '';
        const txt = (el.innerText || el.value || '').toLowerCase();
        if (ARIA_LABELS.some(a => aria && aria.toLowerCase().indexOf(a.toLowerCase()) !== -1)
          || ICON_CLASSES.some(cls => el.querySelector && el.querySelector('.' + cls))) {
          // Hide element outright
          el.style.display = 'none';
        } else {
          el.setAttribute && el.setAttribute('disabled', 'true');
          el.style.pointerEvents = 'none';
          el.style.opacity = '0.6';
          el.title = 'BotÃ£o bloqueado pelo usuÃ¡rio';
        }
      } catch (e) {
        // fallback
        el.setAttribute && el.setAttribute('disabled', 'true');
        el.style.pointerEvents = 'none';
        el.style.opacity = '0.6';
        el.title = 'BotÃ£o bloqueado pelo usuÃ¡rio';
      }
      // Remove inline onclick and stop future events
      try { el.onclick = null; } catch(e){}
      el.addEventListener('click', function(e){ e.stopImmediatePropagation(); e.preventDefault(); }, true);
    } catch (e) { console.warn('blocker error', e); }
  }

  function scan() {
    if (!ACTIVE) return;
    // By id
    IDS.forEach(id => {
      const el = document.getElementById(id);
      if (el) markBlocked(el);
    });

    // By visible text on common controls and aria-label/icon classes
    const candidates = Array.from(document.querySelectorAll('button, a, input[type="button"], input[type="submit"]'));
    candidates.forEach(c => {
      const txt = ((c.innerText || c.value || c.getAttribute('aria-label') || '')).trim();
      if (!txt) return;
      for (const t of TEXTS) {
        if (txt.indexOf(t) !== -1) { markBlocked(c); break; }
      }
    });

    // By aria-label and icon classes (edit/delete)
    const extras = Array.from(document.querySelectorAll('a[role="button"], button[role="button"], a, button'));
    extras.forEach(el => {
      const aria = (el.getAttribute && el.getAttribute('aria-label')) || '';
      if (ARIA_LABELS.some(a => aria && aria.indexOf(a) !== -1)) {
        markBlocked(el);
        return;
      }
      // icon classes inside anchor
      for (const cls of ICON_CLASSES) {
        if (el.querySelector && el.querySelector('.' + cls)) { markBlocked(el); break; }
      }
    });
  }

  // Prevent double-click and right-click actions that may open edit/delete
  function shouldBlockEventTarget(target) {
    if (!target) return false;
    let el = target;
    for (let i = 0; i < 8 && el; i++, el = el.parentElement) {
      if (!el) break;
      // IDs
      if (el.id && IDS.includes(el.id)) return true;
      // aria-labels
      const aria = (el.getAttribute && el.getAttribute('aria-label')) || '';
      if (ARIA_LABELS.some(a => aria && aria.toLowerCase().indexOf(a.toLowerCase()) !== -1)) return true;
      // text matches
      const txt = (el.innerText || el.value || '').trim();
      if (TEXTS.some(t => txt && txt.toLowerCase().indexOf(t.toLowerCase()) !== -1)) return true;
      // icon classes
      for (const cls of ICON_CLASSES) {
        if (el.classList && el.classList.contains(cls.replace(/^fa-/, ''))) {}
        try {
          if (el.querySelector && el.querySelector('.' + cls)) return true;
        } catch (e) {}
      }
      // structural classes from the table
      if (el.classList && (el.classList.contains('cell') || el.classList.contains('table-row') || el.classList.contains('icon-actions') || el.classList.contains('cell-text'))) return true;
    }
    return false;
  }

  // Stop double-click/open and context menu on matching targets
  function blockInteractions(e) {
    try {
      if (!ACTIVE) return;
      if (shouldBlockEventTarget(e.target)) {
        e.stopImmediatePropagation();
        e.preventDefault();
        return false;
      }
    } catch (err) { /* ignore */ }
  }

  document.addEventListener('dblclick', blockInteractions, true);
  document.addEventListener('contextmenu', blockInteractions, true);

  // Observe dynamic changes
  const observer = new MutationObserver(() => { if (ACTIVE) scan(); });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      // Load enabled flag from storage
      try { chrome.storage.local.get({ enabled: true }, (res) => {
          ACTIVE = !!res.enabled;
          if (ACTIVE) scan();
        });
      } catch (e) { /* ignore if chrome.storage not available */ }
      observer.observe(document.documentElement || document.body, { childList: true, subtree: true });
    });
  } else {
    try { chrome.storage.local.get({ enabled: true }, (res) => {
        ACTIVE = !!res.enabled;
        if (ACTIVE) scan();
      });
    } catch (e) { /* ignore */ }
    observer.observe(document.documentElement || document.body, { childList: true, subtree: true });
  }

  // React to storage changes (popup toggles)
  try {
    chrome.storage.onChanged.addListener((changes, area) => {
      if (area === 'local' && changes.enabled) {
        const newVal = !!changes.enabled.newValue;
        if (newVal === ACTIVE) return;
        ACTIVE = newVal;
        if (ACTIVE) {
          // Enable and scan immediately
          scan();
        } else {
          // Disabled -> reload page to restore original state
          try { location.reload(); } catch (e) {}
        }
      }
    });
  } catch (e) { /* ignore if not available */ }

  // Run again after short delays (covers lazy frameworks)
  setTimeout(scan, 1000);
  setTimeout(scan, 3000);
})();
