document.addEventListener('DOMContentLoaded', () => {
  const LOGS_KEY = 'assistantLogs';
  const metaEl = document.getElementById('meta');
  const logEl = document.getElementById('log');
  const refreshBtn = document.getElementById('refresh');
  const clearBtn = document.getElementById('clear');

  function formatEntry(entry) {
    const time = entry && entry.time ? new Date(entry.time) : null;
    const formattedTime = time && !Number.isNaN(time.getTime())
      ? time.toLocaleString('pt-BR')
      : 'sem horario';
    const level = String(entry && entry.level || 'info').toUpperCase();
    const message = String(entry && entry.message || '');
    return '[' + formattedTime + '] [' + level + '] ' + message;
  }

  function render(logs) {
    const items = Array.isArray(logs) ? logs : [];
    if (!items.length) {
      metaEl.textContent = 'Nenhum evento registrado.';
      logEl.textContent = '(sem logs)';
      return;
    }

    const first = items[0] && items[0].time ? new Date(items[0].time) : null;
    const last = items[items.length - 1] && items[items.length - 1].time ? new Date(items[items.length - 1].time) : null;

    metaEl.textContent = [
      'Total: ' + items.length,
      first && !Number.isNaN(first.getTime()) ? 'Primeiro: ' + first.toLocaleString('pt-BR') : null,
      last && !Number.isNaN(last.getTime()) ? 'Ultimo: ' + last.toLocaleString('pt-BR') : null,
    ].filter(Boolean).join(' | ');

    logEl.textContent = items.map(formatEntry).join('\n');
  }

  function load() {
    chrome.storage.local.get({ [LOGS_KEY]: [] }, (stored) => {
      render(stored[LOGS_KEY]);
    });
  }

  refreshBtn.addEventListener('click', load);
  clearBtn.addEventListener('click', () => {
    chrome.storage.local.set({ [LOGS_KEY]: [] }, load);
  });

  chrome.storage.onChanged.addListener((changes, area) => {
    if (area !== 'local' || !changes[LOGS_KEY]) return;
    render(changes[LOGS_KEY].newValue || []);
  });

  load();
});
