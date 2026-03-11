(function() {
  'use strict';

  const FEATURE_CATALOG = globalThis.ZWEB_FEATURES || { getDefaults: () => ({}) };
  const FEATURE_DEFAULTS = FEATURE_CATALOG.getDefaults();
  const FEATURE_KEY = 'commissionReturnsEnabled';
  const HISTORY_STORAGE_KEY = 'nfeReturnHistory';
  const STYLE_ID = 'zweb-commission-report-adjustments-style';
  const SUMMARY_ID = 'zweb-commission-report-adjustments-summary';
  const ACTIONS_ID = 'zweb-commission-report-adjustments-actions';
  const DOWNLOAD_BUTTON_ID = 'zweb-commission-report-download-pdf';
  const DOWNLOAD_STATUS_ID = 'zweb-commission-report-download-status';

  function normalizeText(value) {
    return String(value || '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim();
  }

  function isCommissionReportPage() {
    const path = (location.pathname || '').toLowerCase();
    if (path.indexOf('/production/uploads/reports/report/') === -1) return false;
    const title = normalizeText(document.title || '');
    if (title === 'comissoes' || title === 'comissões') return true;
    const bodyText = normalizeText(document.body ? document.body.innerText || '' : '');
    return bodyText.indexOf('comissoes') !== -1 && bodyText.indexOf('vendedor(a):') !== -1;
  }

  function parseCurrency(value) {
    const raw = String(value || '').trim();
    if (!raw) return NaN;
    const negative = raw.indexOf('-') !== -1;
    const normalized = raw
      .replace(/\./g, '')
      .replace(',', '.')
      .replace(/[^0-9.]/g, '');
    const parsed = Number(normalized);
    if (!Number.isFinite(parsed)) return NaN;
    return negative ? -parsed : parsed;
  }

  function formatCurrency(value) {
    const amount = Number(value || 0);
    const negative = amount < 0;
    const absolute = Math.abs(amount);
    const formatted = absolute.toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
    return negative ? '-' + formatted : formatted;
  }

  function ensureStyle() {
    let style = document.getElementById(STYLE_ID);
    if (!style) {
      style = document.createElement('style');
      style.id = STYLE_ID;
      (document.head || document.documentElement).appendChild(style);
    }
    style.textContent = [
      'tr[data-zweb-return-adjusted="true"] { background: rgba(239, 154, 154, 0.12) !important; }',
      'tr[data-zweb-return-adjusted="true"] td { color: #c85a5a !important; font-weight: 700; }',
      'tr[data-zweb-return-adjusted="true"], tr[data-zweb-return-adjusted="true"] td { -webkit-print-color-adjust: exact; print-color-adjust: exact; }',
      '#' + SUMMARY_ID + ' { margin: 12px 0 8px; padding: 10px 12px; border: 1px solid rgba(200, 90, 90, 0.22);',
      'border-radius: 12px; background: rgba(239, 154, 154, 0.12); color: #7a2f2f; font-size: 13px; }'
      + '\n'
      + '#' + ACTIONS_ID + ' { display:flex; align-items:center; gap:12px; flex-wrap:wrap; margin: 10px 0 14px; }'
      + '\n'
      + '#' + DOWNLOAD_BUTTON_ID + ' { appearance:none; border:0; border-radius:10px; padding:10px 14px; font-size:13px; font-weight:700; cursor:pointer; color:#fff; background:linear-gradient(135deg,#0f4c92 0%,#1664c0 100%); box-shadow:0 10px 18px rgba(22,100,192,0.18); }'
      + '\n'
      + '#' + DOWNLOAD_BUTTON_ID + '[disabled] { opacity:.65; cursor:progress; }'
      + '\n'
      + '#' + DOWNLOAD_STATUS_ID + ' { font-size:12px; color:#5d6b79; }'
      + '\n'
      + '@media print {'
      + ' #' + ACTIONS_ID + ' { display:none !important; }'
      + ' tr[data-zweb-return-adjusted="true"] { background: rgba(239, 154, 154, 0.18) !important; }'
      + ' tr[data-zweb-return-adjusted="true"] td { color: #b93d3d !important; font-weight: 700 !important; }'
      + '}'
    ].join('\n');
  }

  function getReportTable() {
    return document.querySelector('table.striped-table');
  }

  function getSummaryHost(table) {
    if (!table) return null;
    return table.parentElement || table;
  }

  function upsertSummary(message) {
    const table = getReportTable();
    const host = getSummaryHost(table);
    if (!host) return;

    let summary = document.getElementById(SUMMARY_ID);
    if (!message) {
      if (summary) summary.remove();
      return;
    }

    if (!summary) {
      summary = document.createElement('div');
      summary.id = SUMMARY_ID;
      host.insertBefore(summary, table);
    }

    summary.textContent = message;
  }

  function extractReportMeta() {
    const bodyText = document.body ? document.body.innerText || '' : '';
    const vendorMatch = bodyText.match(/Vendedor\(a\):\s*(.+)/i);
    const rangeMatch = bodyText.match(/(\d{2}\/\d{2}\/\d{4})\s+até\s+(\d{2}\/\d{2}\/\d{4})/i);
    return {
      vendor: vendorMatch ? vendorMatch[1].trim() : '',
      from: rangeMatch ? rangeMatch[1] : '',
      to: rangeMatch ? rangeMatch[2] : ''
    };
  }

  function buildPdfFileNameHint() {
    const meta = extractReportMeta();
    const parts = ['comissoes'];
    if (meta.vendor) parts.push(meta.vendor);
    if (meta.from && meta.to) parts.push(meta.from + '-a-' + meta.to);
    parts.push('ajustado');
    return parts.join('-');
  }

  function setDownloadStatus(message) {
    const status = document.getElementById(DOWNLOAD_STATUS_ID);
    if (!status) return;
    status.textContent = message || '';
  }

  function setDownloadBusy(isBusy) {
    const button = document.getElementById(DOWNLOAD_BUTTON_ID);
    if (!button) return;
    button.disabled = !!isBusy;
    button.textContent = isBusy ? 'Gerando PDF...' : 'Baixar PDF ajustado';
  }

  function ensureDownloadActions() {
    const table = getReportTable();
    const host = getSummaryHost(table);
    if (!host || !table) return;

    let actions = document.getElementById(ACTIONS_ID);
    if (!actions) {
      actions = document.createElement('div');
      actions.id = ACTIONS_ID;
      actions.innerHTML = [
        '<button type="button" id="' + DOWNLOAD_BUTTON_ID + '">Baixar PDF ajustado</button>',
        '<span id="' + DOWNLOAD_STATUS_ID + '"></span>'
      ].join('');
      host.insertBefore(actions, table);
    }

    const button = document.getElementById(DOWNLOAD_BUTTON_ID);
    if (button && !button.hasAttribute('data-zweb-bound')) {
      button.setAttribute('data-zweb-bound', 'true');
      button.addEventListener('click', () => {
        setDownloadBusy(true);
        setDownloadStatus('Preparando PDF corrigido...');
        chrome.runtime.sendMessage({
          type: 'commission-report-download-pdf',
          fileNameHint: buildPdfFileNameHint()
        }, (response) => {
          setDownloadBusy(false);
          const error = chrome.runtime.lastError;
          if (error) {
            setDownloadStatus('Falha ao gerar o PDF ajustado: ' + error.message);
            return;
          }
          if (!response || response.ok !== true) {
            setDownloadStatus('Falha ao gerar o PDF ajustado' + (response && response.message ? ': ' + response.message : '.'));
            return;
          }
          setDownloadStatus('PDF ajustado enviado para Downloads: ' + response.filename);
        });
      });
    }
  }

  function readRows(table) {
    const bodyRows = Array.from(table.querySelectorAll('tbody tr'));
    return bodyRows.map((row) => {
      const cells = Array.from(row.querySelectorAll('td'));
      if (cells.length < 6) return null;
      const documentNumber = String(cells[1].textContent || '').replace(/\D+/g, '').trim();
      const total = parseCurrency(cells[4].textContent || '');
      const commission = parseCurrency(cells[5].textContent || '');
      return {
        row,
        cells,
        documentNumber,
        total,
        commission
      };
    }).filter(Boolean);
  }

  function rememberOriginalValues(table, rows) {
    rows.forEach((entry) => {
      if (!entry.cells[4].hasAttribute('data-zweb-original-value')) {
        entry.cells[4].setAttribute('data-zweb-original-value', String(entry.cells[4].textContent || '').trim());
      }
      if (!entry.cells[5].hasAttribute('data-zweb-original-value')) {
        entry.cells[5].setAttribute('data-zweb-original-value', String(entry.cells[5].textContent || '').trim());
      }
    });

    if (table && table.tFoot && table.tFoot.rows.length) {
      const footerRow = table.tFoot.rows[0];
      const footerCells = footerRow.cells;
      if (footerCells && footerCells.length >= 3) {
        if (!footerCells[1].hasAttribute('data-zweb-original-value')) {
          footerCells[1].setAttribute('data-zweb-original-value', String(footerCells[1].textContent || '').trim());
        }
        if (!footerCells[2].hasAttribute('data-zweb-original-value')) {
          footerCells[2].setAttribute('data-zweb-original-value', String(footerCells[2].textContent || '').trim());
        }
      }
    }
  }

  function restoreReport() {
    const table = getReportTable();
    if (!table) return;

    Array.from(table.querySelectorAll('tbody tr')).forEach((row) => {
      row.removeAttribute('data-zweb-return-adjusted');
      const cells = Array.from(row.querySelectorAll('td'));
      if (cells[4] && cells[4].hasAttribute('data-zweb-original-value')) {
        cells[4].textContent = cells[4].getAttribute('data-zweb-original-value');
      }
      if (cells[5] && cells[5].hasAttribute('data-zweb-original-value')) {
        cells[5].textContent = cells[5].getAttribute('data-zweb-original-value');
      }
    });

    if (table.tFoot && table.tFoot.rows.length) {
      const footerCells = table.tFoot.rows[0].cells;
      if (footerCells && footerCells.length >= 3) {
        if (footerCells[1].hasAttribute('data-zweb-original-value')) {
          footerCells[1].textContent = footerCells[1].getAttribute('data-zweb-original-value');
        }
        if (footerCells[2].hasAttribute('data-zweb-original-value')) {
          footerCells[2].textContent = footerCells[2].getAttribute('data-zweb-original-value');
        }
      }
    }

    upsertSummary('');
  }

  function recalcFooter(table, rows) {
    if (!table || !table.tFoot || !table.tFoot.rows.length) return;
    const footerRow = table.tFoot.rows[0];
    const footerCells = footerRow.cells;
    if (!footerCells || footerCells.length < 3) return;

    const totalSum = rows.reduce((acc, entry) => acc + (Number.isFinite(entry.total) ? entry.total : 0), 0);
    const commissionSum = rows.reduce((acc, entry) => acc + (Number.isFinite(entry.commission) ? entry.commission : 0), 0);

    footerCells[1].textContent = formatCurrency(totalSum);
    footerCells[2].textContent = formatCurrency(commissionSum);
  }

  function adjustReport(historyMap) {
    if (!isCommissionReportPage()) return;
    const table = getReportTable();
    if (!table) return;

    ensureStyle();
    ensureDownloadActions();

    const rows = readRows(table);
    rememberOriginalValues(table, rows);
    restoreReport();

    const freshRows = readRows(table);
    let adjustedCount = 0;

    freshRows.forEach((entry) => {
      const historyEntry = historyMap && historyMap[entry.documentNumber];
      const shouldAdjust = !!(historyEntry && historyEntry.active);
      if (!shouldAdjust) return;

      adjustedCount += 1;
      entry.row.setAttribute('data-zweb-return-adjusted', 'true');

      if (Number.isFinite(entry.total) && entry.total > 0) {
        entry.total = -Math.abs(entry.total);
        entry.cells[4].textContent = formatCurrency(entry.total);
      }

      if (Number.isFinite(entry.commission) && entry.commission > 0) {
        entry.commission = -Math.abs(entry.commission);
        entry.cells[5].textContent = formatCurrency(entry.commission);
      }
    });

    recalcFooter(table, freshRows);

    if (adjustedCount) {
      upsertSummary(
        adjustedCount + ' devoluç' + (adjustedCount === 1 ? 'ão ajustada' : 'ões ajustadas') +
        ' com base no histórico da NF-e. Os valores foram convertidos para negativo no relatório.'
      );
    } else {
      upsertSummary('');
    }
  }

  function loadAndAdjust() {
    if (!isCommissionReportPage()) return;
    const defaults = Object.assign({}, FEATURE_DEFAULTS, { [HISTORY_STORAGE_KEY]: {} });
    chrome.storage.local.get(defaults, (stored) => {
      if (stored[FEATURE_KEY] === false) {
        restoreReport();
        return;
      }
      const historyMap = stored && stored[HISTORY_STORAGE_KEY] && typeof stored[HISTORY_STORAGE_KEY] === 'object'
        ? stored[HISTORY_STORAGE_KEY]
        : {};
      adjustReport(historyMap);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadAndAdjust);
  } else {
    loadAndAdjust();
  }

  try {
    chrome.storage.onChanged.addListener((changes, area) => {
      if (area !== 'local') return;
      if (changes[HISTORY_STORAGE_KEY] || changes[FEATURE_KEY]) {
        loadAndAdjust();
      }
    });
  } catch (error) {}
})();
