document.addEventListener('DOMContentLoaded', () => {
  const checkbox = document.getElementById('toggleEnabled');
  const status = document.getElementById('status');
  const reloadBtn = document.getElementById('reload');

  function updateUI(enabled) {
    checkbox.checked = enabled;
    status.textContent = enabled ? 'Bloqueio ativo em https://zweb.com.br' : 'Bloqueio desativado';
  }

  // Load current state
  chrome.storage.local.get({ enabled: true }, (res) => {
    updateUI(!!res.enabled);
  });

  checkbox.addEventListener('change', () => {
    const enabled = checkbox.checked;
    chrome.storage.local.set({ enabled }, () => {
      updateUI(enabled);
      // notify content scripts by changing storage; content script listens and will reload if needed
    });
  });

  reloadBtn.addEventListener('click', () => {
    // Reload active tab
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs && tabs[0]) chrome.tabs.reload(tabs[0].id);
    });
  });
});
