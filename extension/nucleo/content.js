(function() {
  'use strict';

  const IDS = ['botaoCadastrar', 'grid.primaryButton', 'grid.primaryButton'];
  const BLOCK_INPUT_IDS = ['itemForm.price'];
  const BLOCK_INPUT_SELECTORS = ['input#itemForm\\.price'];
  const TARGET_DAVS_ROUTES = [
    '/document/davs/sale/new',
    '/document/davs/estimate/new',
    '/davs/sale/new',
    '/davs/estimate/new'
  ];
  const TARGET_FISCAL_ROUTE_FRAGMENT = '/fiscal';
  const TARGET_NFE_ROUTE = '/fiscal/nfe';
  const TARGET_NFE_NEW_ROUTE = '/fiscal/nfe/new';
  const TARGET_PRODUCT_ROUTE = '/register/stock/product';
  const TARGET_PRODUCT_NEW_ROUTE = '/register/stock/product/new';
  const TARGET_SIGN_IN_ROUTE = '/sign-in';
  const TEXTS = ['Cadastrar produto', 'Cadastrar Produto', 'Cadastrar'];
  const FORCE_HIDE_TEXTS = ['Acoes', 'Ações'];
  const BLOCK_DROPDOWN_OPTIONS = [
    'servicos',
    'kit',
    'tabela de precos',
    'grade',
    'grupos'
  ];
  const CADASTROS_UNIT_SELECTOR = 'a[href="#/register/stock/unit-of-measure"]';
  const ARIA_LABELS = ['Excluir', 'Remover', 'Abrir', 'Editar'];
  const ICON_CLASSES = ['fa-pencil', 'fa-pencil-alt', 'fa-edit', 'fa-times', 'fa-trash', 'fa-trash-alt'];
  const ITEM_SEARCH_SELECTOR = 'input.multiselect__input';
  const BATCH_TOGGLE_ID = 'zweb-batch-toggle';
  const BATCH_MODAL_ID = 'zweb-batch-modal';
  const BATCH_BACKDROP_ID = 'zweb-batch-backdrop';
  const BATCH_STATUS_ID = 'zweb-batch-status';
  const BATCH_SPACER_ID = 'zweb-batch-spacer';
  const BATCH_PROGRESS_ID = 'zweb-batch-progress';
  const BATCH_PROGRESS_FILL_ID = 'zweb-batch-progress-fill';
  const BATCH_PROGRESS_TEXT_ID = 'zweb-batch-progress-text';
  const PRODUCT_PREVIEW_BUTTON_ID = 'zweb-product-preview-button';
  const PRODUCT_PREVIEW_TOOLTIP_ID = 'zweb-product-preview-tooltip';
  const PRODUCT_CODE_RANGE_MODAL_ID = 'zweb-product-code-range-modal';
  const PRODUCT_CODE_RANGE_BACKDROP_ID = 'zweb-product-code-range-backdrop';
  const PRODUCT_CODE_RANGE_PANEL_ID = 'zweb-product-code-range-panel';
  const PRODUCT_CODE_RANGE_FORM_ID = 'zweb-product-code-range-form';
  const PRODUCT_CODE_RANGE_GRID_ATTR = 'data-zweb-product-code-range-grid';
  const PRODUCT_CODE_RANGE_STATUS_ID = 'zweb-product-code-range-status';
  const PRODUCT_CODE_RANGE_MODAL_STYLE_ID = 'zweb-product-code-range-modal-style';
  const PRODUCT_CODE_RANGE_SNACKBAR_ID = 'zweb-product-code-range-snackbar';
  const PRODUCT_CODE_RANGE_SNACKBAR_STYLE_ID = 'zweb-product-code-range-snackbar-style';
  const PRODUCT_CODE_RANGE_SNACKBAR_TRANSITION_MS = 150;
  const PRODUCT_CODE_RANGE_SNACKBAR_SHOW_DELAY_MS = 500;
  const PRODUCT_CODE_RANGE_SNACKBAR_MIN_VISIBLE_MS = 3400;
  const PRODUCT_CODE_RANGE_MODAL_TRANSITION_MS = 300;
  const PRODUCT_CODE_RANGE_DOUBLE_CLICK_WINDOW_MS = 700;
  const PRODUCT_NATIVE_FILTER_CLEAR_LABELS = ['limpar filtros', 'limpar filtro'];
  const COMMON_FILTER_APPLY_LABELS = ['filtrar', 'buscar'];
  const COMMON_MULTI_TERM_FILTER_ROW_HIDDEN_ATTR = 'data-zweb-common-multi-term-hidden';
  const COMMON_MULTI_TERM_FILTER_MIN_WAIT_MS = 600;
  const COMMON_MULTI_TERM_FILTER_MAX_WAIT_MS = 5000;
  const PRODUCT_REPLICATE_SUPPLIER_SECTION_ID = 'zweb-product-replicate-supplier-section';
  const PRODUCT_REPLICATE_SUPPLIER_SEARCH_ID = 'zweb-product-replicate-supplier-search';
  const PRODUCT_REPLICATE_SUPPLIER_RESULTS_ID = 'zweb-product-replicate-supplier-results';
  const PRODUCT_REPLICATE_SUPPLIER_STATUS_ID = 'zweb-product-replicate-supplier-status';
  const PRODUCT_REPLICATE_SUPPLIER_BUSY_ID = 'zweb-product-replicate-supplier-busy';
  const PRODUCT_REPLICATE_SUPPLIER_OPTION_ID = 'zweb-product-replicate-supplier-option';
  const PRODUCT_REPLICATE_SUPPLIER_MODE_ATTR = 'data-zweb-product-replicate-supplier-mode';
  const PRODUCT_REPLICATE_SUPPLIER_PREVIOUS_LABEL_ATTR = 'data-zweb-product-replicate-supplier-previous-label';
  const PRODUCT_REPLICATE_SUPPLIER_NATIVE_HIDDEN_ATTR = 'data-zweb-product-replicate-native-hidden';
  const PRODUCT_REPLICATE_SUPPLIER_SAVE_BOUND_ATTR = 'data-zweb-product-replicate-supplier-save-bound';
  const PRODUCT_REPLICATE_SUPPLIER_LIST_BOUND_ATTR = 'data-zweb-product-replicate-supplier-list-bound';
  const PRODUCT_STYLE_CUSTOMIZE_BUTTON_ID = 'zweb-product-style-customize-button';
  const PRODUCT_STYLE_CUSTOMIZE_ACTION_ID = 'zweb-product-style-customize-action';
  const PRODUCT_STYLE_MODAL_ID = 'zweb-product-style-modal';
  const PRODUCT_STYLE_BACKDROP_ID = 'zweb-product-style-backdrop';
  const PRODUCT_STYLE_FORM_ID = 'zweb-product-style-form';
  const NFE_ACTION_CUSTOMIZE_BUTTON_ID = 'zweb-nfe-action-customize-button';
  const NFE_ACTION_MODAL_ID = 'zweb-nfe-action-modal';
  const NFE_ACTION_BACKDROP_ID = 'zweb-nfe-action-backdrop';
  const NFE_ACTION_LIST_ID = 'zweb-nfe-action-list';
  const NFE_BATCH_DOWNLOAD_XML_ACTION_ID = 'zweb-nfe-batch-download-xml-action';
  const NFE_BATCH_DOWNLOAD_PDF_ACTION_ID = 'zweb-nfe-batch-download-pdf-action';
  const NFE_BATCH_DOWNLOAD_STATUS_WRAP_ID = 'zweb-nfe-batch-download-status-wrap';
  const NFE_BATCH_DOWNLOAD_STATUS_ID = 'zweb-nfe-batch-download-status';
  const NFE_BATCH_DOWNLOAD_HIDDEN_NATIVE_ATTR = 'data-zweb-batch-hidden-native';
  const COMMISSION_REPORT_HINT_ID = 'zweb-commission-report-hint';
  const COMMISSION_REPORT_HINT_TEXT = 'Para ajustar devolu\u00e7\u00f5es automaticamente no relat\u00f3rio de comiss\u00f5es, a extens\u00e3o usa o formato HTML. Depois voc\u00ea pode imprimir ou salvar em PDF pelo navegador.';
  const NFE_CONTEXT_MENU_ID = 'menuId';
  const NFE_CONTEXT_MENU_STYLE_ID = 'zweb-nfe-context-menu-style';
  const NFE_CONTEXT_MENU_MAX_HEIGHT_VH = 48;
  const NFE_CONTEXT_MENU_MARGIN_PX = 12;
  const NFE_CONTEXT_MENU_ROW_GAP_PX = 6;
  const NFE_CONTEXT_MENU_ANCHOR_TTL_MS = 1800;
  const ACTION_MENU_PREFS_STORAGE_KEY = 'actionMenuPrefs';
  const ACTION_MENU_HIDDEN_ATTR = 'data-zweb-hidden-action-menu-item';
  const ACTION_MENU_HIDDEN_SEPARATOR_ATTR = 'data-zweb-hidden-action-menu-separator';
  const PRODUCT_TOOLBAR_SEARCH_SELECTOR = 'input#search\\.value.grid-toolbar-search';
  const PRODUCT_EDIT_ROUTE = '#/register/stock/product/edit/';
  const PRODUCT_GRID_STORAGE_KEY = 'z_theme_config_grid';
  const PRODUCT_FILTER_OPTION_HIDDEN_ATTR = 'data-zweb-hidden-by-column-filter';
  const PRODUCT_STYLE_PREFS_STORAGE_KEY = 'productStylePrefs';
  const PRODUCT_PAGINATE_API_URL = 'https://api.zweb.com.br/rpc/v2/inventory.get-product-paginate';
  const PRODUCT_GET_API_URL = 'https://api.zweb.com.br/rpc/v2/inventory.get-product';
  const PRODUCT_PUT_API_URL = 'https://api.zweb.com.br/rpc/v2/inventory.put-product';
  const PERSON_API_URL = 'https://api.zweb.com.br/rpc/v2/person.get-person';
  const PRODUCT_PAGINATE_PAGE_SIZE = 200;
  const NFE_RETURN_HISTORY_STORAGE_KEY = 'nfeReturnHistory';
  const NFE_RETURN_HISTORY_MAX_ITEMS = 4000;
  const XML_BRIDGE_SCRIPT_ID = 'zweb-xml-download-page-bridge';
  const XML_CONTENT_SOURCE = 'zweb-xml-content-script';
  const XML_BRIDGE_SOURCE = 'zweb-xml-page-bridge';
  const XML_BRIDGE_VERSION = '20260313-1';
  const KNOWN_NFE_ACTION_ITEMS = [
    'Enviar XML por e-mail',
    'Cancelar',
    'Carta de Corre\u00e7\u00e3o',
    'Evento de Concilia\u00e7\u00e3o Financeira - ECONF',
    'Ator interessado',
    'Consultar pela chave',
    'Protocolar recibo',
    'Visualizar DANFE',
    'Imprimir DANFE no Terminal Zweb',
    'Gerar boleto',
    'Enviar e-mail',
    'Gerar XML',
    'Clonar NF-e',
    'Reenviar XML ao minhas notas',
    'Enviar NF-e pelo whatsapp',
    'Devolu\u00e7\u00e3o',
    'Retorno',
    'Etiquetas',
    'Emitir MDF-e'
  ];
  const FEATURE_DEFAULTS = globalThis.ZWEB_FEATURES && typeof globalThis.ZWEB_FEATURES.getDefaults === 'function'
    ? globalThis.ZWEB_FEATURES.getDefaults()
      : {
        enabled: true,
        multiTermFilterEnabled: true,
        filterEnabled: true,
        productPreviewEnabled: true,
        productPreferredSupplierBulkEnabled: true,
        lowStockHighlightEnabled: true,
        itemSearchHashEnabled: true,
        batchEnabled: true,
        xmlDownloadEnabled: true,
        actionMenuCustomizeEnabled: true
      };

  const FEATURE_STATE = Object.assign({}, FEATURE_DEFAULTS);
  let ACTION_MENU_PREFS = {};
  let BATCH_RUNNING = false;
  let DAV_QTY_AUTO_CLEAR_TIMER = 0;
  let LAST_XML_DOWNLOAD_ARM_AT = 0;
  let LAST_NFE_CONTEXT_MENU_ANCHOR = null;
  let NFE_RETURN_HISTORY = {};
  let LAST_NFE_RETURN_SIGNATURE = '';
  let NFE_RETURN_SYNC_TIMER = 0;
  let FEATURE_UI_REFRESH_TIMER = 0;
  let PRODUCT_CODE_RANGE_STATE = {
    active: false,
    enabled: false,
    loading: false,
    startCode: '',
    endCode: '',
    items: [],
    error: '',
    selectedSequence: '',
    selectedCellIndex: 0
  };
  let LAST_PRODUCT_CODE_RANGE_SIGNATURE = '';
  let LAST_PRODUCT_CODE_RANGE_CLICK = {
    sequence: '',
    cellIndex: -1,
    at: 0
  };
  let PRODUCT_FILTER_CLEAR_SYNC_LOCK = '';
  let COMMON_MULTI_TERM_FILTER_STATE = {
    active: false,
    pending: false,
    rawValue: '',
    primaryTerm: '',
    terms: [],
    columnTitle: '',
    columnKey: '',
    gridSignatureBefore: '',
    armedAt: 0
  };
  let PRODUCT_CODE_RANGE_MODAL_VISIBILITY_TIMER = 0;
  let PRODUCT_CODE_RANGE_SNACKBAR_HIDE_TIMER = 0;
  let PRODUCT_CODE_RANGE_SNACKBAR_ENTER_TIMER = 0;
  let PRODUCT_CODE_RANGE_SNACKBAR_SHOW_TIMER = 0;
  let PRODUCT_CODE_RANGE_SNACKBAR_SHOWN_AT = 0;
  let PRODUCT_REPLICATE_SUPPLIER_RESULTS = [];
  let PRODUCT_REPLICATE_SUPPLIER_SELECTED = null;
  let PRODUCT_REPLICATE_SUPPLIER_LOADING = false;
  let PRODUCT_REPLICATE_SUPPLIER_RUNNING = false;
  let PRODUCT_REPLICATE_SUPPLIER_SEARCH_TIMER = 0;
  let LAST_PRODUCT_PAGINATE_REQUEST_PAYLOAD = null;
  let PRODUCT_REPLICATE_SUPPLIER_REPORT = null;
  let NFE_BATCH_DOWNLOAD_RUNNING = false;
  let NFE_BATCH_DOWNLOAD_STATUS_TIMER = 0;
  let NFE_BATCH_DOWNLOAD_INTERNAL_CLICK = false;
  const ITEM_SEARCH_NORMALIZE_TIMERS = new WeakMap();
  const PRODUCT_LOW_STOCK_ATTR = 'data-zweb-low-stock-highlight';
  const PRODUCT_ROW_STYLE_ATTR = 'data-zweb-product-style-managed';
  const PRODUCT_LOW_STOCK_STYLE_ID = 'zweb-low-stock-style';
  const PRODUCT_LOW_STOCK_LIGHT_COLOR = '#c43d3d';
  const PRODUCT_LOW_STOCK_DARK_COLOR = '#ef9a9a';
  const PRODUCT_STYLE_PREFS_DEFAULTS = {
    fontFamily: '',
    fontSizePx: '',
    useNormalColor: false,
    normalColor: '#181c32',
    lowStockColor: PRODUCT_LOW_STOCK_LIGHT_COLOR
  };
  let PRODUCT_STYLE_PREFS = Object.assign({}, PRODUCT_STYLE_PREFS_DEFAULTS);
  const PRODUCT_FONT_OPTIONS = [
    { value: '', label: 'Padrao da Zweb' },
    { value: '"Segoe UI",Tahoma,Geneva,Verdana,sans-serif', label: 'Segoe UI' },
    { value: 'Arial,sans-serif', label: 'Arial' },
    { value: 'Tahoma,sans-serif', label: 'Tahoma' },
    { value: 'Verdana,sans-serif', label: 'Verdana' },
    { value: 'Georgia,serif', label: 'Georgia' },
    { value: 'Consolas,"Courier New",monospace', label: 'Consolas' }
  ];

  function isFeatureEnabled(key) {
    return FEATURE_STATE[key] !== false;
  }

  function applyFeatureState(nextState) {
    const normalized = globalThis.ZWEB_FEATURES && typeof globalThis.ZWEB_FEATURES.normalizeState === 'function'
      ? globalThis.ZWEB_FEATURES.normalizeState(nextState)
      : Object.assign({}, FEATURE_DEFAULTS, nextState || {});

    Object.keys(FEATURE_DEFAULTS).forEach((key) => {
      FEATURE_STATE[key] = normalized[key] !== false;
    });

    syncPageBridgeFeatureFlags();
  }

  function syncPageBridgeFeatureFlags() {
    const root = document.documentElement;
    if (!root || !root.dataset) return;
    root.dataset.zwebItemSearchHashEnabled = isFeatureEnabled('itemSearchHashEnabled') ? 'true' : 'false';
  }

  function isDocumentRoute() {
    const href = (location.href || '').toLowerCase();
    return href.indexOf('/document/') !== -1;
  }

  function getRuntimeApi() {
    if (typeof chrome === 'undefined' || !chrome || !chrome.runtime) return null;
    return chrome.runtime;
  }

  function sendRuntimeMessage(message) {
    const runtime = getRuntimeApi();
    if (!runtime || typeof runtime.sendMessage !== 'function') {
      return Promise.reject(new Error('Runtime indisponivel.'));
    }

    return new Promise((resolve, reject) => {
      try {
        runtime.sendMessage(message, (response) => {
          const error = chrome.runtime && chrome.runtime.lastError;
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

  function isTargetDavRoute() {
    const href = (location.href || '').toLowerCase();
    return TARGET_DAVS_ROUTES.some(route => href.indexOf(route) !== -1);
  }

  function isTargetProductRoute() {
    const href = (location.href || '').toLowerCase();
    return href.indexOf(TARGET_PRODUCT_ROUTE) !== -1 && href.indexOf(TARGET_PRODUCT_NEW_ROUTE) === -1;
  }

  function isSignInRoute() {
    const href = (location.href || '').toLowerCase();
    return href.indexOf(TARGET_SIGN_IN_ROUTE) !== -1;
  }

  function isFiscalRoute() {
    const href = (location.href || '').toLowerCase();
    return href.indexOf(TARGET_FISCAL_ROUTE_FRAGMENT) !== -1;
  }

  function isTargetNfeRoute() {
    const href = (location.href || '').toLowerCase();
    return href.indexOf(TARGET_NFE_ROUTE) !== -1;
  }

  function isTargetNfeNewRoute() {
    const href = (location.href || '').toLowerCase();
    return href.indexOf(TARGET_NFE_NEW_ROUTE) !== -1;
  }

  function shouldPreserveForceHideText(normalizedText) {
    if (!normalizedText) return false;
    if (!isTargetNfeRoute()) return false;
    return FORCE_HIDE_TEXTS.some(t => normalizedText.indexOf(normalizeText(t)) !== -1);
  }

  function shouldBlockSpecificInput(input) {
    if (!input) return false;
    if (!isTargetDavRoute()) return false;

    const byId = input.id && BLOCK_INPUT_IDS.includes(input.id);
    const bySelector = BLOCK_INPUT_SELECTORS.some(selector => input.matches && input.matches(selector));
    return byId || bySelector;
  }

  function normalizeText(value) {
    return (value || '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim();
  }

  function parseRgbColor(value) {
    const match = String(value || '').match(/rgba?\(([^)]+)\)/i);
    if (!match) return null;

    const parts = match[1].split(',').map(part => Number(String(part).trim()));
    if (parts.length < 3 || parts.slice(0, 3).some(part => !Number.isFinite(part))) {
      return null;
    }

    return {
      r: parts[0],
      g: parts[1],
      b: parts[2],
      a: Number.isFinite(parts[3]) ? parts[3] : 1
    };
  }

  function getSurfaceColor(element) {
    let current = element;
    while (current && current !== document.documentElement) {
      const color = parseRgbColor(window.getComputedStyle(current).backgroundColor);
      if (color && color.a > 0) return color;
      current = current.parentElement;
    }

    const rootColor = parseRgbColor(window.getComputedStyle(document.body || document.documentElement).backgroundColor);
    return rootColor || { r: 255, g: 255, b: 255, a: 1 };
  }

  function isDarkSurface(element) {
    const color = getSurfaceColor(element);
    const luminance = (color.r * 0.299) + (color.g * 0.587) + (color.b * 0.114);
    return luminance < 160;
  }

  function applyCommissionReportHintTheme(hint, modal) {
    if (!hint) return;

    const darkSurface = isDarkSurface(modal || hint.parentElement);
    const themedStyles = darkSurface
      ? {
        borderColor: 'rgba(125, 185, 255, 0.30)',
        background: 'rgba(26, 54, 93, 0.88)',
        color: '#edf5ff',
        boxShadow: '0 12px 24px rgba(0, 0, 0, 0.22)'
      }
      : {
        borderColor: 'rgba(22, 100, 192, 0.18)',
        background: 'rgba(22, 100, 192, 0.08)',
        color: '#18456f',
        boxShadow: 'none'
      };

    hint.style.borderColor = themedStyles.borderColor;
    hint.style.background = themedStyles.background;
    hint.style.color = themedStyles.color;
    hint.style.boxShadow = themedStyles.boxShadow;
  }

  function applyNfeActionCustomizeButtonTheme(button, surface) {
    if (!button) return;

    const darkSurface = isDarkSurface(surface || button.parentElement);
    const themedStyles = darkSurface
      ? {
        background: 'rgba(26, 54, 93, 0.88)',
        border: '1px solid rgba(125, 185, 255, 0.30)',
        color: '#edf5ff',
        boxShadow: '0 12px 24px rgba(0, 0, 0, 0.18)'
      }
      : {
        background: '#f4f8fc',
        border: '1px solid #c9d8e6',
        color: '#1f4f7d',
        boxShadow: 'none'
      };

    button.style.background = themedStyles.background;
    button.style.border = themedStyles.border;
    button.style.color = themedStyles.color;
    button.style.boxShadow = themedStyles.boxShadow;
  }

  function getExtensionOverlayTheme(surface) {
    const darkSurface = isDarkSurface(surface);
    return darkSurface
      ? {
        isDark: true,
        modalBackground: 'linear-gradient(180deg, rgba(19, 29, 41, 0.98) 0%, rgba(14, 21, 31, 0.98) 100%)',
        modalBorder: '1px solid rgba(125, 185, 255, 0.22)',
        modalBoxShadow: '0 22px 48px rgba(0, 0, 0, 0.42)',
        titleColor: '#edf5ff',
        bodyColor: '#d8e4f0',
        mutedColor: '#9fb4c8',
        inputBackground: 'rgba(10, 17, 26, 0.92)',
        inputBorder: '1px solid rgba(125, 185, 255, 0.2)',
        inputColor: '#edf5ff',
        secondaryButtonBackground: 'rgba(24, 37, 52, 0.96)',
        secondaryButtonBorder: '1px solid rgba(125, 185, 255, 0.2)',
        secondaryButtonColor: '#edf5ff',
        subtleButtonColor: '#b9cae0',
        cardBackground: 'rgba(18, 30, 43, 0.94)',
        cardBorder: '1px solid rgba(125, 185, 255, 0.14)',
        cardTextColor: '#e7f0fb',
        progressBackground: 'rgba(18, 27, 39, 0.96)',
        progressBorder: '1px solid rgba(125, 185, 255, 0.18)',
        progressTextColor: '#d8e4f0',
        progressTrackBackground: 'rgba(10, 17, 26, 0.92)',
        progressFillColor: '#6eb7ff'
      }
      : {
        isDark: false,
        modalBackground: '#ffffff',
        modalBorder: '1px solid #d5dfe8',
        modalBoxShadow: '0 18px 44px rgba(0,0,0,0.22)',
        titleColor: '#13283d',
        bodyColor: '#203040',
        mutedColor: '#5b6d7d',
        inputBackground: '#ffffff',
        inputBorder: '1px solid #d5dfe8',
        inputColor: '#203040',
        secondaryButtonBackground: '#f4f8fc',
        secondaryButtonBorder: '1px solid #d5dfe8',
        secondaryButtonColor: '#203040',
        subtleButtonColor: '#4f6070',
        cardBackground: '#f8fbfd',
        cardBorder: '1px solid #dbe4ec',
        cardTextColor: '#203040',
        progressBackground: '#ffffff',
        progressBorder: '1px solid #d9dee5',
        progressTextColor: '#3b4652',
        progressTrackBackground: '#edf1f5',
        progressFillColor: '#2b84d6'
      };
  }

  function applyBatchModalTheme(modal) {
    if (!modal) return;

    const theme = getExtensionOverlayTheme(modal.parentElement || document.body);
    const compact = window.innerWidth < 560;
    modal.style.background = theme.modalBackground;
    modal.style.border = theme.modalBorder;
    modal.style.boxShadow = theme.modalBoxShadow;
    modal.style.width = compact ? 'calc(100vw - 16px)' : '420px';
    modal.style.maxWidth = compact ? 'calc(100vw - 16px)' : 'calc(100vw - 24px)';
    modal.style.maxHeight = 'calc(100vh - 20px)';
    modal.style.padding = compact ? '14px' : '16px';
    modal.style.overflow = 'auto';

    const header = modal.querySelector('[data-batch-header]');
    if (header) {
      header.style.display = 'flex';
      header.style.justifyContent = 'space-between';
      header.style.alignItems = compact ? 'stretch' : 'center';
      header.style.flexDirection = compact ? 'column' : 'row';
      header.style.gap = compact ? '10px' : '16px';
      header.style.marginBottom = '12px';
    }

    const actions = modal.querySelector('[data-batch-actions]');
    if (actions) {
      actions.style.display = 'flex';
      actions.style.flexDirection = compact ? 'column-reverse' : 'row';
      actions.style.alignItems = compact ? 'stretch' : 'center';
      actions.style.gap = '8px';
      actions.style.marginTop = '14px';
    }

    const fieldRow = modal.querySelector('[data-batch-field-row]');
    if (fieldRow) {
      fieldRow.style.display = 'grid';
      fieldRow.style.gridTemplateColumns = compact ? '1fr' : '92px minmax(0, 1fr)';
      fieldRow.style.gap = '10px';
      fieldRow.style.alignItems = compact ? 'stretch' : 'center';
      fieldRow.style.marginTop = '12px';
    }

    Array.from(modal.querySelectorAll('[data-batch-title]')).forEach((element) => {
      element.style.color = theme.titleColor;
    });
    Array.from(modal.querySelectorAll('[data-batch-body]')).forEach((element) => {
      element.style.color = theme.bodyColor;
    });
    Array.from(modal.querySelectorAll('[data-batch-muted]')).forEach((element) => {
      element.style.color = theme.mutedColor;
    });
    Array.from(modal.querySelectorAll('textarea.form-control, input.form-control')).forEach((input) => {
      input.style.background = theme.inputBackground;
      input.style.border = theme.inputBorder;
      input.style.color = theme.inputColor;
      input.style.caretColor = theme.inputColor;
    });
    Array.from(modal.querySelectorAll('textarea.form-control')).forEach((textarea) => {
      textarea.style.minHeight = compact ? '108px' : '120px';
      textarea.style.resize = 'vertical';
    });
    Array.from(modal.querySelectorAll('[data-batch-secondary]')).forEach((button) => {
      button.style.background = theme.secondaryButtonBackground;
      button.style.border = theme.secondaryButtonBorder;
      button.style.color = theme.secondaryButtonColor;
    });
    Array.from(modal.querySelectorAll('[data-batch-subtle]')).forEach((button) => {
      button.style.color = theme.subtleButtonColor;
    });
  }

  function applyBatchProgressTheme(wrap) {
    if (!wrap) return;

    const theme = getExtensionOverlayTheme(wrap.parentElement || document.body);
    wrap.style.background = theme.progressBackground;
    wrap.style.border = theme.progressBorder;
    wrap.style.boxShadow = theme.isDark
      ? '0 16px 30px rgba(0,0,0,0.30)'
      : '0 8px 18px rgba(0,0,0,0.15)';

    const label = wrap.querySelector('#' + BATCH_PROGRESS_TEXT_ID);
    const track = wrap.querySelector('[data-batch-progress-track]');
    const fill = wrap.querySelector('#' + BATCH_PROGRESS_FILL_ID);
    if (label) label.style.color = theme.progressTextColor;
    if (track) track.style.background = theme.progressTrackBackground;
    if (fill) fill.style.background = theme.progressFillColor;
  }

  function applyNfeActionCustomizeModalTheme(modal) {
    if (!modal) return;

    const theme = getExtensionOverlayTheme(modal.parentElement || document.body);
    const compact = window.innerWidth < 620;
    modal.style.background = theme.modalBackground;
    modal.style.border = theme.modalBorder;
    modal.style.boxShadow = theme.modalBoxShadow;
    modal.style.width = compact ? 'calc(100vw - 16px)' : '420px';
    modal.style.maxWidth = compact ? 'calc(100vw - 16px)' : 'calc(100vw - 24px)';
    modal.style.maxHeight = 'calc(100vh - 20px)';
    modal.style.padding = compact ? '14px' : '16px';

    const header = modal.querySelector('[data-nfe-action-header]');
    if (header) {
      header.style.display = 'flex';
      header.style.justifyContent = 'space-between';
      header.style.alignItems = compact ? 'stretch' : 'flex-start';
      header.style.flexDirection = compact ? 'column' : 'row';
      header.style.gap = compact ? '10px' : '16px';
      header.style.marginBottom = '12px';
    }

    const toolRow = modal.querySelector('[data-nfe-action-tools]');
    if (toolRow) {
      toolRow.style.display = 'flex';
      toolRow.style.flexWrap = 'wrap';
      toolRow.style.gap = '8px';
      toolRow.style.marginBottom = '12px';
    }

    const footer = modal.querySelector('[data-nfe-action-footer]');
    if (footer) {
      footer.style.display = 'flex';
      footer.style.justifyContent = compact ? 'stretch' : 'flex-end';
      footer.style.flexDirection = compact ? 'column-reverse' : 'row';
      footer.style.gap = '8px';
      footer.style.marginTop = '14px';
    }

    Array.from(modal.querySelectorAll('[data-nfe-action-title]')).forEach((element) => {
      element.style.color = theme.titleColor;
    });
    Array.from(modal.querySelectorAll('[data-nfe-action-body]')).forEach((element) => {
      element.style.color = theme.bodyColor;
    });
    Array.from(modal.querySelectorAll('[data-nfe-action-muted]')).forEach((element) => {
      element.style.color = theme.mutedColor;
    });
    Array.from(modal.querySelectorAll('[data-nfe-action-secondary]')).forEach((button) => {
      button.style.background = theme.secondaryButtonBackground;
      button.style.border = theme.secondaryButtonBorder;
      button.style.color = theme.secondaryButtonColor;
    });
    Array.from(modal.querySelectorAll('[data-nfe-action-subtle]')).forEach((button) => {
      button.style.color = theme.subtleButtonColor;
    });

    const list = modal.querySelector('#' + NFE_ACTION_LIST_ID);
    if (list) {
      list.style.maxHeight = compact ? 'min(48vh, 360px)' : '380px';
    }
  }

  function getProductCodeRangeTheme(surface) {
    const darkSurface = isDarkSurface(surface);
    const bodyStyle = getComputedStyle(document.body);
    const headerText = document.querySelector('.table-row.header .header-text');
    const bodyText = document.querySelector('.grid-toolbar.no-print')
      || document.querySelector('.grid-toolbar')
      || document.querySelector('.table-row:not(.header):not([' + PRODUCT_LOW_STOCK_ATTR + ']) .cell .cell-text')
      || document.querySelector('.table-row:not(.header) .cell .cell-text');
    const toolbarInput = document.querySelector('.grid-toolbar.no-print input.form-control')
      || document.querySelector('.grid-toolbar input.form-control');
    const titleStyle = getComputedStyle(headerText || surface || document.body);
    const bodyTextStyle = getComputedStyle(bodyText || surface || document.body);
    const inputStyle = getComputedStyle(toolbarInput || surface || document.body);
    const modalBackground = bodyStyle.backgroundColor && bodyStyle.backgroundColor !== 'rgba(0, 0, 0, 0)'
      ? bodyStyle.backgroundColor
      : (darkSurface ? '#121212' : '#ffffff');
    const inputBackground = inputStyle.backgroundColor && inputStyle.backgroundColor !== 'rgba(0, 0, 0, 0)'
      ? inputStyle.backgroundColor
      : (darkSurface ? '#303030' : '#ffffff');
    const inputBorderColor = inputStyle.borderColor && inputStyle.borderColor !== 'rgba(0, 0, 0, 0)'
      ? inputStyle.borderColor
      : (darkSurface ? 'rgba(255, 255, 255, 0.08)' : '#d5dfe8');
    const modalBorderColor = darkSurface ? 'rgba(255, 255, 255, 0.08)' : inputBorderColor;
    const panelBackground = darkSurface ? '#1b1b1b' : '#ffffff';
    const tableHeadBackground = darkSurface ? '#202020' : '#f6f9fc';

    return {
      isDark: darkSurface,
      modalBackground,
      modalBorder: '1px solid ' + modalBorderColor,
      modalBoxShadow: darkSurface ? '0 18px 44px rgba(0, 0, 0, 0.42)' : '0 18px 44px rgba(0,0,0,0.18)',
      titleColor: titleStyle.color || (darkSurface ? '#d8e4f0' : '#13283d'),
      bodyColor: bodyTextStyle.color || bodyStyle.color || (darkSurface ? '#a4a5a7' : '#203040'),
      mutedColor: bodyStyle.color || (darkSurface ? '#a4a5a7' : '#5b6d7d'),
      inputBackground,
      inputBorder: inputStyle.border && inputStyle.border !== '0px none rgba(0, 0, 0, 0)' ? inputStyle.border : ('1px solid ' + inputBorderColor),
      inputColor: inputStyle.color || bodyTextStyle.color || bodyStyle.color,
      secondaryButtonBackground: inputBackground,
      secondaryButtonBorder: inputStyle.border && inputStyle.border !== '0px none rgba(0, 0, 0, 0)' ? inputStyle.border : ('1px solid ' + inputBorderColor),
      secondaryButtonColor: inputStyle.color || bodyTextStyle.color || bodyStyle.color,
      subtleButtonColor: bodyStyle.color || bodyTextStyle.color,
      infoTextColor: darkSurface ? '#d8e4f0' : '#30597b',
      infoBackground: darkSurface ? 'rgba(255, 255, 255, 0.05)' : 'rgba(22, 100, 192, 0.08)',
      infoBorderColor: darkSurface ? 'rgba(255, 255, 255, 0.08)' : 'rgba(22, 100, 192, 0.16)',
      errorTextColor: darkSurface ? '#ffb4b4' : '#b93d3d',
      errorBackground: darkSurface ? 'rgba(185, 61, 61, 0.16)' : 'rgba(185, 61, 61, 0.1)',
      errorBorderColor: darkSurface ? 'rgba(255, 180, 180, 0.18)' : 'rgba(185, 61, 61, 0.18)',
      panelBackground,
      panelBorder: '1px solid ' + modalBorderColor,
      panelBoxShadow: darkSurface ? '0 14px 28px rgba(0, 0, 0, 0.24)' : '0 14px 28px rgba(18,36,56,0.08)',
      tableBackground: panelBackground,
      tableBorder: '1px solid ' + modalBorderColor,
      tableHeadBackground,
      tableCellBorder: '1px solid ' + modalBorderColor,
      panelEmptyColor: bodyStyle.color || (darkSurface ? '#a4a5a7' : '#44617f'),
      backdropBackground: darkSurface ? 'rgba(0, 0, 0, 0.5)' : 'rgba(15, 23, 42, 0.14)'
    };
  }

  function getProductCodeRangeTypography(surface) {
    const root = surface || document.body;
    const bodyText = root.querySelector('.table-row:not(.header) .cell .cell-text')
      || root.querySelector('.table-row:not(.header) .cell')
      || root.querySelector('.header-text')
      || root;
    const headerText = root.querySelector('.table-row.header .header-text')
      || root.querySelector('.table-row.header .cell')
      || bodyText;
    const bodyStyle = bodyText ? getComputedStyle(bodyText) : null;
    const headerStyle = headerText ? getComputedStyle(headerText) : bodyStyle;

    return {
      bodyFontFamily: bodyStyle && bodyStyle.fontFamily ? bodyStyle.fontFamily : '',
      bodyFontSize: bodyStyle && bodyStyle.fontSize ? bodyStyle.fontSize : '',
      bodyLineHeight: bodyStyle && bodyStyle.lineHeight ? bodyStyle.lineHeight : '',
      bodyLetterSpacing: bodyStyle && bodyStyle.letterSpacing ? bodyStyle.letterSpacing : '',
      bodyFontWeight: bodyStyle && bodyStyle.fontWeight ? bodyStyle.fontWeight : '',
      headerFontFamily: headerStyle && headerStyle.fontFamily ? headerStyle.fontFamily : '',
      headerFontSize: headerStyle && headerStyle.fontSize ? headerStyle.fontSize : '',
      headerLineHeight: headerStyle && headerStyle.lineHeight ? headerStyle.lineHeight : '',
      headerLetterSpacing: headerStyle && headerStyle.letterSpacing ? headerStyle.letterSpacing : '',
      headerFontWeight: headerStyle && headerStyle.fontWeight ? headerStyle.fontWeight : ''
    };
  }

  function removeProductCodeRangeToolbarStatus() {
    const status = document.getElementById(PRODUCT_CODE_RANGE_STATUS_ID);
    if (status) status.remove();
  }

  function findVisibleNativeProductFilterChip() {
    if (!isTargetProductRoute()) return null;
    const chips = Array.from(document.querySelectorAll('.content-filter .col-filter'));
    return chips.find((chip) => {
      if (!isVisible(chip)) return false;
      if (chip.closest('#' + PRODUCT_CODE_RANGE_PANEL_ID)) return false;
      if (chip.closest('#' + PRODUCT_CODE_RANGE_STATUS_ID)) return false;
      return true;
    }) || null;
  }

  function findProductFilterStatusInsertAnchor(toolbarRow, toolbarColumn, statusElement) {
    if (!toolbarRow) return null;
    const children = Array.from(toolbarRow.children || []).filter((child) => child && child !== statusElement);
    const visibleChildren = children.filter((child) => isVisible(child));
    const filterLabel = visibleChildren.find((child) => normalizeText(child.textContent || '').indexOf('filtros') !== -1) || visibleChildren[0] || null;
    const nativeChipWrappers = visibleChildren.filter((child) => {
      if (child === toolbarColumn) return false;
      return !!child.querySelector('.content-filter .col-filter') && !child.querySelector('#' + PRODUCT_CODE_RANGE_STATUS_ID);
    });
    return nativeChipWrappers[nativeChipWrappers.length - 1] || filterLabel || null;
  }

  function setProductCodeRangeEnabled(isEnabled) {
    if (!PRODUCT_CODE_RANGE_STATE.active || PRODUCT_CODE_RANGE_STATE.loading) return;
    const nextEnabled = !!isEnabled;
    if (PRODUCT_CODE_RANGE_STATE.enabled === nextEnabled) return;
    PRODUCT_CODE_RANGE_STATE.enabled = nextEnabled;
    LAST_PRODUCT_CODE_RANGE_SIGNATURE = '';
    renderProductCodeRangePanel();
  }

  function findVisibleProductFilterRow(toolbar) {
    if (!toolbar || !toolbar.closest) return null;
    const toolbarColumn = toolbar.closest('.col');
    const row = toolbarColumn && toolbarColumn.parentElement;
    return row && row.classList && row.classList.contains('row') ? row : null;
  }

  function getProductFilterClearControlLabel(element) {
    if (!element) return '';
    return normalizeText(
      element.innerText
      || element.textContent
      || element.value
      || element.getAttribute('aria-label')
      || element.getAttribute('title')
      || ''
    );
  }

  function isProductCodeRangeCustomClearControl(element) {
    if (!element || !element.closest) return false;
    return !!element.closest('[data-product-code-range-clear], #' + PRODUCT_CODE_RANGE_MODAL_ID + ', #' + PRODUCT_CODE_RANGE_PANEL_ID);
  }

  function isNativeProductFilterClearControl(element) {
    if (!isTargetProductRoute() || !element) return false;
    const control = element.closest
      ? element.closest('button, a, [role="button"], input[type="button"], input[type="submit"]')
      : element;
    if (!control || !isVisible(control) || isProductCodeRangeCustomClearControl(control)) return false;
    const label = getProductFilterClearControlLabel(control);
    return PRODUCT_NATIVE_FILTER_CLEAR_LABELS.some(text => label.indexOf(text) !== -1);
  }

  function findVisibleNativeProductFilterClearControl() {
    if (!isTargetProductRoute()) return null;
    const controls = Array.from(document.querySelectorAll('button, a, [role="button"], input[type="button"], input[type="submit"]'));
    return controls.find(isNativeProductFilterClearControl) || null;
  }

  function releaseProductFilterClearSyncLock(expectedSource) {
    window.setTimeout(() => {
      if (!expectedSource || PRODUCT_FILTER_CLEAR_SYNC_LOCK === expectedSource) {
        PRODUCT_FILTER_CLEAR_SYNC_LOCK = '';
      }
    }, 80);
  }

  function triggerNativeProductFilterClearSync() {
    const control = findVisibleNativeProductFilterClearControl();
    if (!control) return false;
    PRODUCT_FILTER_CLEAR_SYNC_LOCK = 'custom';
    releaseProductFilterClearSyncLock('custom');
    control.dispatchEvent(new MouseEvent('click', {
      bubbles: true,
      cancelable: true,
      view: window
    }));
    return true;
  }

  function createDefaultCommonMultiTermFilterState() {
    return {
      active: false,
      pending: false,
      rawValue: '',
      primaryTerm: '',
      terms: [],
      columnTitle: '',
      columnKey: '',
      gridSignatureBefore: '',
      armedAt: 0
    };
  }

  function restoreCommonMultiTermFilterRows() {
    const rows = Array.from(document.querySelectorAll('.table-wrapper.table-wrapper-filter .table-row[' + COMMON_MULTI_TERM_FILTER_ROW_HIDDEN_ATTR + ']'));
    rows.forEach((row) => {
      if (!row || row.closest('#' + PRODUCT_CODE_RANGE_PANEL_ID)) return;
      row.removeAttribute(COMMON_MULTI_TERM_FILTER_ROW_HIDDEN_ATTR);
      row.style.display = '';
      row.removeAttribute('aria-hidden');
    });
  }

  function resetCommonMultiTermFilterState(options) {
    if (!(options && options.keepRows)) {
      restoreCommonMultiTermFilterRows();
    }
    COMMON_MULTI_TERM_FILTER_STATE = createDefaultCommonMultiTermFilterState();
  }

  function getVisibleNativeGridTableWrapper() {
    const wrappers = Array.from(document.querySelectorAll('.table-wrapper.table-wrapper-filter'));
    return wrappers.find((wrapper) => {
      if (!wrapper || wrapper.closest('#' + PRODUCT_CODE_RANGE_PANEL_ID)) return false;
      if (wrapper.getAttribute(PRODUCT_CODE_RANGE_GRID_ATTR) === 'true') return false;
      return isVisible(wrapper);
    }) || null;
  }

  function getCommonFilterControlLabel(element) {
    if (!element) return '';
    return normalizeText(
      element.innerText
      || element.textContent
      || element.value
      || element.getAttribute('aria-label')
      || element.getAttribute('title')
      || ''
    );
  }

  function isCommonFilterApplyControl(element) {
    const control = element && element.closest
      ? element.closest('button, a, [role="button"], input[type="button"], input[type="submit"]')
      : element;
    if (!control || !isVisible(control) || isProductCodeRangeCustomClearControl(control)) return false;
    const label = getCommonFilterControlLabel(control);
    return COMMON_FILTER_APPLY_LABELS.some((text) => label.indexOf(text) !== -1);
  }

  function findCommonFilterFieldContainer(modal, labelTexts) {
    if (!modal) return null;
    const expectedLabels = (Array.isArray(labelTexts) ? labelTexts : [labelTexts])
      .map(normalizeText)
      .filter(Boolean);
    if (!expectedLabels.length) return null;

    const labels = Array.from(modal.querySelectorAll('label'));
    const label = labels.find((element) => expectedLabels.includes(normalizeText(element.textContent || '')));
    if (!label) return null;

    return label.closest('.col-md-5, .col-md-4, .col-md-3, .col-sm-12, .col, .form-group')
      || label.parentElement
      || modal;
  }

  function readCommonFilterSelectValue(container) {
    if (!container) return '';

    const candidates = [
      container.querySelector('.multiselect__single'),
      container.querySelector('.multiselect__tag span'),
      container.querySelector('.multiselect__tags-wrap'),
      container.querySelector('.multiselect__placeholder'),
      container.querySelector('input.multiselect__input')
    ];

    for (const candidate of candidates) {
      if (!candidate) continue;
      const rawValue = 'value' in candidate ? candidate.value : candidate.textContent;
      const text = String(rawValue || '').trim();
      if (text) return text;
    }

    return '';
  }

  function readCommonFilterSelectedColumn(modal) {
    return readCommonFilterSelectValue(findCommonFilterFieldContainer(modal, ['coluna']));
  }

  function findCommonFilterValueInput(modal) {
    const container = findCommonFilterFieldContainer(modal, ['valor']);
    if (!container) return null;
    return container.querySelector('input.form-control:not([type="checkbox"]):not([type="radio"]), textarea, input:not([type="checkbox"]):not([type="radio"])');
  }

  function tokenizeCommonFilterValue(rawValue) {
    return dedupeTextList(
      String(rawValue || '')
        .split(/\s+/)
        .map(normalizeText)
        .filter(Boolean)
    );
  }

  function getVisibleGridRowsSignature(tableWrapper) {
    if (!tableWrapper) return '';

    const rows = Array.from(tableWrapper.querySelectorAll('.table-row'))
      .filter((row) => !row.classList.contains('header'));
    if (!rows.length) return '0';

    const summarizeRow = (row) => normalizeText(row.textContent || '').slice(0, 120);
    const head = rows.slice(0, 4).map(summarizeRow).join('|');
    const tail = rows.slice(-2).map(summarizeRow).join('|');
    return [rows.length, head, tail].join('::');
  }

  function armCommonMultiTermFilter(modal) {
    if (!modal || !isFeatureEnabled('multiTermFilterEnabled')) {
      resetCommonMultiTermFilterState();
      return;
    }

    const valueInput = findCommonFilterValueInput(modal);
    const columnTitle = readCommonFilterSelectedColumn(modal);
    const rawValue = String(valueInput && valueInput.value || '').trim();
    const terms = tokenizeCommonFilterValue(rawValue);

    if (!columnTitle || terms.length < 2) {
      resetCommonMultiTermFilterState();
      return;
    }

    const nativeGrid = getVisibleNativeGridTableWrapper();
    const primaryTerm = terms[0];

    COMMON_MULTI_TERM_FILTER_STATE = {
      active: true,
      pending: true,
      rawValue,
      primaryTerm,
      terms,
      columnTitle,
      columnKey: normalizeText(columnTitle),
      gridSignatureBefore: getVisibleGridRowsSignature(nativeGrid),
      armedAt: Date.now()
    };

    if (valueInput && valueInput.value !== primaryTerm) {
      setInputValueAndNotify(valueInput, primaryTerm);
    }
  }

  function syncCommonMultiTermFilterRows() {
    if (!isTargetProductRoute() || !isFeatureEnabled('multiTermFilterEnabled')) {
      resetCommonMultiTermFilterState();
      return;
    }

    if (!COMMON_MULTI_TERM_FILTER_STATE.active) {
      restoreCommonMultiTermFilterRows();
      return;
    }

    const tableWrapper = getVisibleNativeGridTableWrapper();
    if (!tableWrapper) return;

    const currentSignature = getVisibleGridRowsSignature(tableWrapper);
    if (COMMON_MULTI_TERM_FILTER_STATE.pending) {
      const age = Date.now() - COMMON_MULTI_TERM_FILTER_STATE.armedAt;
      if (
        currentSignature
        && COMMON_MULTI_TERM_FILTER_STATE.gridSignatureBefore
        && currentSignature === COMMON_MULTI_TERM_FILTER_STATE.gridSignatureBefore
        && age < COMMON_MULTI_TERM_FILTER_MAX_WAIT_MS
      ) {
        return;
      }

      if (age < COMMON_MULTI_TERM_FILTER_MIN_WAIT_MS) {
        return;
      }

      COMMON_MULTI_TERM_FILTER_STATE.pending = false;
    }

    const structure = getProductCodeRangeGridStructure(tableWrapper);
    const header = structure && structure.headerCells.find((cell) => cell.normalizedTitle === COMMON_MULTI_TERM_FILTER_STATE.columnKey);
    const columnIndex = header ? header.index : -1;
    const rows = Array.from(tableWrapper.querySelectorAll('.table-row'))
      .filter((row) => !row.classList.contains('header'));

    rows.forEach((row) => {
      const sourceCell = columnIndex >= 0 ? row.children[columnIndex] : null;
      const sourceText = normalizeText(
        sourceCell
          ? (sourceCell.textContent || '')
          : (row.textContent || '')
      );
      const matches = COMMON_MULTI_TERM_FILTER_STATE.terms.every((term) => sourceText.indexOf(term) !== -1);

      if (matches) {
        row.removeAttribute(COMMON_MULTI_TERM_FILTER_ROW_HIDDEN_ATTR);
        row.style.display = '';
        row.removeAttribute('aria-hidden');
        return;
      }

      row.setAttribute(COMMON_MULTI_TERM_FILTER_ROW_HIDDEN_ATTR, 'true');
      row.style.display = 'none';
      row.setAttribute('aria-hidden', 'true');
    });
  }

  function syncProductCodeRangeToolbarStatus(toolbar, theme, typography) {
    if (!toolbar) {
      removeProductCodeRangeToolbarStatus();
      return;
    }

    if (!(PRODUCT_CODE_RANGE_STATE.active || PRODUCT_CODE_RANGE_STATE.error)) {
      removeProductCodeRangeToolbarStatus();
      return;
    }

    const searchContainer = toolbar.querySelector('.no-print');
    const actionsContainer = toolbar.querySelector('.grid-toolbar-hidden-mobile') || toolbar;
    const toolbarRow = findVisibleProductFilterRow(toolbar);
    const toolbarColumn = toolbar.closest ? toolbar.closest('.col') : null;
    const referenceChip = findVisibleNativeProductFilterChip();
    let status = document.getElementById(PRODUCT_CODE_RANGE_STATUS_ID);
    if (!status) {
      status = document.createElement('div');
      status.id = PRODUCT_CODE_RANGE_STATUS_ID;
    }

    const statusPrefix = PRODUCT_CODE_RANGE_STATE.error
      ? 'Falha:'
      : 'Código:';
    const statusValue = PRODUCT_CODE_RANGE_STATE.error
        ? 'faixa inválida'
        : ((PRODUCT_CODE_RANGE_STATE.startCode || '-') + ' a ' + (PRODUCT_CODE_RANGE_STATE.endCode || '-'));
    const statusText = statusPrefix + ' ' + statusValue;

    status.title = statusText;
    const shouldInlineWithNativeChip = !!referenceChip;
    status.className = shouldInlineWithNativeChip ? '' : 'col-auto hide-mobile';
    const needsInlineMarkup = shouldInlineWithNativeChip && !status.querySelector('.col-filter');
    const needsStandaloneMarkup = !shouldInlineWithNativeChip && !status.querySelector('.content-filter');
    if (needsInlineMarkup || needsStandaloneMarkup || !status.firstElementChild) {
      status.innerHTML = shouldInlineWithNativeChip
        ? '<div class="col-filter mt-1"><label><input class="form-check-input" type="checkbox" value="true"><span><span class="filter-prefix" data-product-code-range-prefix></span> <span data-product-code-range-value></span></span></label></div>'
        : '<div class="content-filter"><div class="col-filter mt-1"><label><input class="form-check-input" type="checkbox" value="true"><span><span class="filter-prefix" data-product-code-range-prefix></span> <span data-product-code-range-value></span></span></label></div></div>';
    }
    status.style.display = shouldInlineWithNativeChip ? 'contents' : 'block';
    status.style.flex = shouldInlineWithNativeChip ? 'none' : '0 0 auto';
    status.style.alignSelf = shouldInlineWithNativeChip ? '' : 'auto';
    status.style.maxWidth = 'none';
    status.style.margin = '0';
    status.style.pointerEvents = 'auto';
    status.style.cursor = 'default';
    status.style.width = 'auto';
    status.style.minWidth = '0';
    status.style.padding = '0';
    status.style.border = '0';
    status.style.background = 'transparent';
    status.style.boxShadow = 'none';
    status.style.borderRadius = '0';

    const contentFilter = shouldInlineWithNativeChip ? (referenceChip.parentElement || null) : status.querySelector('.content-filter');
    const chip = status.querySelector('.col-filter');
    const label = status.querySelector('label');
    const input = status.querySelector('input.form-check-input');
    const text = label ? label.querySelector('span') : null;
    const prefix = status.querySelector('[data-product-code-range-prefix]');
    const value = status.querySelector('[data-product-code-range-value]');
    const referenceLabel = referenceChip ? referenceChip.querySelector('label') : null;
    const referenceInput = referenceChip ? referenceChip.querySelector('input.form-check-input') : null;
    const referenceText = referenceLabel ? referenceLabel.querySelector('span') : null;
    const referencePrefix = referenceText ? referenceText.querySelector('.filter-prefix') : null;

    if (prefix) prefix.textContent = statusPrefix;
    if (value) value.textContent = statusValue;

    if (contentFilter) {
      if (!shouldInlineWithNativeChip) {
        contentFilter.style.display = 'block';
        contentFilter.style.width = 'auto';
        contentFilter.style.maxWidth = 'none';
        contentFilter.style.textAlign = 'left';
        contentFilter.style.margin = '0';
      }
    }
    if (chip) {
      chip.style.display = 'block';
      chip.style.marginTop = '3.25px';
      chip.style.padding = '0 6.5px 0 0';
      chip.style.background = 'transparent';
      chip.style.border = '0';
      chip.style.boxShadow = 'none';
      chip.style.color = PRODUCT_CODE_RANGE_STATE.error ? theme.errorTextColor : theme.mutedColor;
      chip.style.fontFamily = 'Roboto, Helvetica, sans-serif';
      chip.style.fontSize = '14px';
      chip.style.fontWeight = '300';
      chip.style.lineHeight = '19.5px';
      chip.style.letterSpacing = '';
      chip.style.textAlign = 'left';
      chip.style.width = 'auto';
      chip.style.maxWidth = 'none';
    }
    if (label) {
      label.style.display = 'inline-block';
      label.style.cursor = 'default';
      label.style.whiteSpace = 'nowrap';
      label.style.margin = '0';
      label.style.color = PRODUCT_CODE_RANGE_STATE.error ? theme.errorTextColor : theme.mutedColor;
      label.style.fontFamily = 'Roboto, Helvetica, sans-serif';
      label.style.fontSize = '14px';
      label.style.fontWeight = '300';
      label.style.lineHeight = '19.5px';
      label.style.textAlign = 'left';
      label.style.width = 'auto';
      label.style.maxWidth = 'none';
    }
    if (input) {
      input.style.width = '18px';
      input.style.height = '18px';
      input.style.borderRadius = '5.85px';
      input.style.margin = '0';
      input.style.flex = '0 0 auto';
      input.style.cursor = 'pointer';
      input.style.display = 'inline-block';
      input.style.lineHeight = '19.5px';
      input.style.verticalAlign = 'top';
    }
    if (text) {
      text.style.display = 'inline';
      text.style.color = PRODUCT_CODE_RANGE_STATE.error ? theme.errorTextColor : theme.mutedColor;
      text.style.fontWeight = '300';
      text.style.textAlign = 'left';
      text.style.margin = '0';
      text.style.verticalAlign = '';
      text.style.lineHeight = '';
    }
    if (prefix) {
      prefix.style.fontWeight = '400';
      prefix.style.color = PRODUCT_CODE_RANGE_STATE.error ? theme.errorTextColor : theme.mutedColor;
    }
    if (value) {
      value.style.fontWeight = '300';
      value.style.color = PRODUCT_CODE_RANGE_STATE.error ? theme.errorTextColor : theme.mutedColor;
    }

    if (referenceChip) {
      copyComputedStyles(referenceChip, chip, [
        'paddingTop',
        'paddingRight',
        'paddingBottom',
        'paddingLeft',
        'fontFamily',
        'fontWeight',
        'lineHeight',
        'letterSpacing',
        'color'
      ]);
      copyComputedStyles(referenceLabel, label, [
        'fontFamily',
        'fontWeight',
        'lineHeight',
        'letterSpacing',
        'color',
        'whiteSpace',
        'cursor'
      ]);
      copyComputedStyles(referenceInput, input, [
        'display',
        'width',
        'height',
        'marginTop',
        'marginRight',
        'marginBottom',
        'marginLeft',
        'borderRadius',
        'lineHeight',
        'verticalAlign'
      ]);
      copyComputedStyles(referenceText, text, [
        'display',
        'fontFamily',
        'fontWeight',
        'lineHeight',
        'letterSpacing',
        'color'
      ]);
      copyComputedStyles(referencePrefix, prefix, [
        'fontWeight',
        'color'
      ]);
      chip.style.fontSize = '14px';
      chip.style.lineHeight = '19.5px';
      label.style.fontSize = '14px';
      label.style.lineHeight = '19.5px';
      if (text) text.style.fontSize = '14px';
      if (prefix) prefix.style.fontSize = '14px';
      if (value) value.style.fontSize = '14px';
    }

    if (input) {
      input.checked = !!PRODUCT_CODE_RANGE_STATE.enabled;
      if (PRODUCT_CODE_RANGE_STATE.enabled) {
        input.setAttribute('checked', 'checked');
      } else {
        input.removeAttribute('checked');
      }
      input.style.pointerEvents = 'auto';
      if (!input.hasAttribute('data-zweb-bound-product-code-range-toggle')) {
        input.setAttribute('data-zweb-bound-product-code-range-toggle', 'true');
        input.addEventListener('change', function(event) {
          event.stopPropagation();
          setProductCodeRangeEnabled(!!input.checked);
        });
      }
    }
    if (label) {
      label.style.userSelect = 'none';
    }
    if (text) {
      text.style.whiteSpace = 'nowrap';
      text.style.maxWidth = '100%';
      text.style.overflow = 'hidden';
      text.style.textOverflow = 'ellipsis';
    }

    if (shouldInlineWithNativeChip && referenceChip && referenceChip.parentElement) {
      if (status.parentElement !== referenceChip.parentElement || referenceChip.nextElementSibling !== status) {
        referenceChip.insertAdjacentElement('afterend', status);
      }
    } else if (toolbarRow && toolbarColumn) {
      const anchor = findProductFilterStatusInsertAnchor(toolbarRow, toolbarColumn, status);
      if (anchor) {
        if (anchor.nextElementSibling !== status || status.parentElement !== toolbarRow) {
          anchor.insertAdjacentElement('afterend', status);
        }
      } else if (status.parentElement !== toolbarRow || status.nextElementSibling !== toolbarColumn) {
        toolbarRow.insertBefore(status, toolbarColumn);
      }
    } else if (searchContainer) {
      if (status.parentElement !== searchContainer) {
        searchContainer.appendChild(status);
      } else if (searchContainer.lastElementChild !== status) {
        searchContainer.appendChild(status);
      }
    } else if (status.parentElement !== toolbar || status.nextElementSibling !== actionsContainer) {
      toolbar.insertBefore(status, actionsContainer);
    }
  }

  function ensureProductCodeRangeModalStyles() {
    if (document.getElementById(PRODUCT_CODE_RANGE_MODAL_STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = PRODUCT_CODE_RANGE_MODAL_STYLE_ID;
    style.textContent = [
      '#' + PRODUCT_CODE_RANGE_MODAL_ID + ' { opacity: 0; transition: opacity 0.15s linear; }',
      '#' + PRODUCT_CODE_RANGE_MODAL_ID + '.show { opacity: 1; }',
      '#' + PRODUCT_CODE_RANGE_MODAL_ID + ' .modal-dialog {',
      '  max-width: min(360px, calc(100vw - 32px));',
      '  min-height: calc(100% - 3.5rem);',
      '  margin: 1.75rem auto;',
      '  display: flex;',
      '  align-items: center;',
      '  transform: translateY(-18px);',
      '  transition: transform ' + (PRODUCT_CODE_RANGE_MODAL_TRANSITION_MS / 1000) + 's ease-out;',
      '}',
      '#' + PRODUCT_CODE_RANGE_MODAL_ID + '.show .modal-dialog { transform: none; }',
      '#' + PRODUCT_CODE_RANGE_MODAL_ID + ' .modal-content { overflow: hidden; }',
      '#' + PRODUCT_CODE_RANGE_MODAL_ID + ' .modal-header { min-height: 58px; }',
      '#' + PRODUCT_CODE_RANGE_MODAL_ID + ' .modal-body { padding-top: 16px; padding-bottom: 16px; }',
      '#' + PRODUCT_CODE_RANGE_MODAL_ID + ' .modal-footer { padding-top: 14px; padding-bottom: 14px; }',
      '#' + PRODUCT_CODE_RANGE_MODAL_ID + ' .modal-footer { display:flex; align-items:center; justify-content:space-between; gap:8px; flex-wrap:nowrap; }',
      '#' + PRODUCT_CODE_RANGE_MODAL_ID + ' [data-product-code-range-fields] {',
      '  display: grid;',
      '  grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr);',
      '  gap: 8px;',
      '  align-items: center;',
      '}',
      '#' + PRODUCT_CODE_RANGE_MODAL_ID + ' [data-product-code-range-fields] [data-product-code-range-body] {',
      '  display: inline-flex;',
      '  align-items: center;',
      '  justify-content: center;',
      '  padding: 0 2px;',
      '}',
      '#' + PRODUCT_CODE_RANGE_MODAL_ID + ' [data-product-code-range-fields] .form-control {',
      '  min-height: 34px;',
      '  height: 34px;',
      '  text-align: center;',
      '}',
      '#' + PRODUCT_CODE_RANGE_MODAL_ID + ' [data-product-code-range-footer-actions] {',
      '  display: flex;',
      '  gap: 8px;',
      '  flex-wrap: nowrap;',
      '  align-items: center;',
      '  margin-left: auto;',
      '}',
      '#' + PRODUCT_CODE_RANGE_MODAL_ID + ' .modal-footer button {',
      '  display: inline-flex;',
      '  align-items: center;',
      '  justify-content: center;',
      '  width: auto;',
      '  min-width: 0;',
      '  flex: 0 0 auto;',
      '  white-space: nowrap;',
      '}',
      '#' + PRODUCT_CODE_RANGE_BACKDROP_ID + ' { opacity: 0; transition: opacity 0.15s linear; }',
      '#' + PRODUCT_CODE_RANGE_BACKDROP_ID + '.show { opacity: 0.4; }',
      '@media (max-width: 640px) {',
      '  #' + PRODUCT_CODE_RANGE_MODAL_ID + ' .modal-dialog { max-width: calc(100vw - 24px); margin: 0.75rem auto; min-height: calc(100% - 1.5rem); }',
      '  #' + PRODUCT_CODE_RANGE_MODAL_ID + ' .modal-header { padding: 18px; min-height: 56px; }',
      '  #' + PRODUCT_CODE_RANGE_MODAL_ID + ' .modal-body { padding: 14px 18px; }',
      '  #' + PRODUCT_CODE_RANGE_MODAL_ID + ' .modal-footer { padding: 14px 18px; }',
      '  #' + PRODUCT_CODE_RANGE_MODAL_ID + ' [data-product-code-range-fields] { grid-template-columns: 1fr; }',
      '  #' + PRODUCT_CODE_RANGE_MODAL_ID + ' [data-product-code-range-fields] [data-product-code-range-body] { justify-self: center; }',
      '  #' + PRODUCT_CODE_RANGE_MODAL_ID + ' .modal-footer { justify-content: flex-start !important; flex-wrap: wrap; }',
      '  #' + PRODUCT_CODE_RANGE_MODAL_ID + ' [data-product-code-range-footer-actions] { flex-wrap: wrap; margin-left: 0; }',
      '}'
    ].join('\n');
    document.head && document.head.appendChild(style);
  }

  function ensureProductCodeRangeSnackbarStyles() {
    if (document.getElementById(PRODUCT_CODE_RANGE_SNACKBAR_STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = PRODUCT_CODE_RANGE_SNACKBAR_STYLE_ID;
    style.textContent = [
      '#' + PRODUCT_CODE_RANGE_SNACKBAR_ID + ' {',
      '  z-index: 1091 !important;',
      '}',
      '#' + PRODUCT_CODE_RANGE_SNACKBAR_ID + ' .v-toast__item {',
      '  max-width: min(420px, calc(100vw - 32px));',
      '}',
      '#' + PRODUCT_CODE_RANGE_SNACKBAR_ID + ' .v-toast__text {',
      '  margin: 0;',
      '}',
      '#' + PRODUCT_CODE_RANGE_SNACKBAR_ID + ' .zweb-product-code-range-toast-exit {',
      '  opacity: 0;',
      '  transition: opacity 0.15s cubic-bezier(0, 0, 0.2, 1);',
      '}',
      '@media (max-width: 640px) {',
      '  #' + PRODUCT_CODE_RANGE_SNACKBAR_ID + ' { padding: 12px !important; }',
      '  #' + PRODUCT_CODE_RANGE_SNACKBAR_ID + ' .v-toast__item { max-width: 100%; }',
      '}'
    ].join('\n');
    document.head && document.head.appendChild(style);
  }

  function hideProductCodeRangeSnackbar() {
    const toast = document.getElementById(PRODUCT_CODE_RANGE_SNACKBAR_ID);
    window.clearTimeout(PRODUCT_CODE_RANGE_SNACKBAR_SHOW_TIMER);
    if (!toast) return;
    window.clearTimeout(PRODUCT_CODE_RANGE_SNACKBAR_HIDE_TIMER);
    window.clearTimeout(PRODUCT_CODE_RANGE_SNACKBAR_ENTER_TIMER);
    if (toast.style.display === 'none' || !PRODUCT_CODE_RANGE_SNACKBAR_SHOWN_AT) {
      toast.remove();
      PRODUCT_CODE_RANGE_SNACKBAR_SHOWN_AT = 0;
      return;
    }
    const elapsed = Date.now() - PRODUCT_CODE_RANGE_SNACKBAR_SHOWN_AT;
    const wait = Math.max(0, PRODUCT_CODE_RANGE_SNACKBAR_MIN_VISIBLE_MS - elapsed);
    PRODUCT_CODE_RANGE_SNACKBAR_HIDE_TIMER = window.setTimeout(() => {
      const live = document.getElementById(PRODUCT_CODE_RANGE_SNACKBAR_ID);
      const item = live && live.querySelector('.v-toast__item');
      if (!live || !item) {
        if (live) live.remove();
        PRODUCT_CODE_RANGE_SNACKBAR_SHOWN_AT = 0;
        return;
      }
      item.classList.remove('v-toast--fade-in-down');
      item.classList.remove('v-toast__item--animating');
      item.classList.add('zweb-product-code-range-toast-exit');
      window.setTimeout(() => {
        const current = document.getElementById(PRODUCT_CODE_RANGE_SNACKBAR_ID);
        if (current) {
          current.remove();
        }
        PRODUCT_CODE_RANGE_SNACKBAR_SHOWN_AT = 0;
      }, PRODUCT_CODE_RANGE_SNACKBAR_TRANSITION_MS + 30);
    }, wait);
  }

  function showProductCodeRangeSnackbar(message) {
    const text = String(message || '').trim();
    if (!text || !document.body) return;

    ensureProductCodeRangeSnackbarStyles();
    window.clearTimeout(PRODUCT_CODE_RANGE_SNACKBAR_HIDE_TIMER);
    window.clearTimeout(PRODUCT_CODE_RANGE_SNACKBAR_ENTER_TIMER);
    window.clearTimeout(PRODUCT_CODE_RANGE_SNACKBAR_SHOW_TIMER);

    let toast = document.getElementById(PRODUCT_CODE_RANGE_SNACKBAR_ID);
    if (!toast) {
      toast = document.createElement('div');
      toast.id = PRODUCT_CODE_RANGE_SNACKBAR_ID;
      toast.className = 'v-toast v-toast--top';
      toast.innerHTML = [
        '<div class="v-toast__item v-toast__item--success v-toast__item--top-right v-toast--fade-in-down">',
        '  <div class="v-toast__icon"></div>',
        '  <p class="v-toast__text" role="status" aria-live="polite"></p>',
        '</div>'
      ].join('');
      document.body.appendChild(toast);
    } else {
      const item = toast.querySelector('.v-toast__item');
      if (item) {
        item.className = 'v-toast__item v-toast__item--success v-toast__item--top-right';
      }
    }

    const content = toast.querySelector('.v-toast__text');
    if (content) {
      content.textContent = text;
    }

    const item = toast.querySelector('.v-toast__item');
    if (item) {
      item.classList.remove('v-toast--fade-out');
      item.classList.remove('v-toast--fade-in-down');
      item.classList.remove('v-toast__item--animating');
      item.classList.remove('zweb-product-code-range-toast-exit');
    }

    toast.style.display = 'none';
    PRODUCT_CODE_RANGE_SNACKBAR_SHOW_TIMER = window.setTimeout(() => {
      const current = document.getElementById(PRODUCT_CODE_RANGE_SNACKBAR_ID);
      const currentItem = current && current.querySelector('.v-toast__item');
      if (!current || !currentItem) return;
      current.style.display = '';
      currentItem.classList.add('v-toast__item--animating');
      currentItem.classList.add('v-toast--fade-in-down');
      PRODUCT_CODE_RANGE_SNACKBAR_SHOWN_AT = Date.now();
      PRODUCT_CODE_RANGE_SNACKBAR_ENTER_TIMER = window.setTimeout(() => {
        const live = document.getElementById(PRODUCT_CODE_RANGE_SNACKBAR_ID);
        const liveItem = live && live.querySelector('.v-toast__item');
        if (liveItem) {
          liveItem.classList.remove('v-toast--fade-in-down');
          liveItem.classList.remove('v-toast__item--animating');
        }
      }, PRODUCT_CODE_RANGE_SNACKBAR_TRANSITION_MS + 20);
    }, PRODUCT_CODE_RANGE_SNACKBAR_SHOW_DELAY_MS);
  }

  function findModalByTitle(titleText, options) {
    const target = normalizeText(titleText);
    if (!target) return null;

    const settings = Object.assign({
      visibleOnly: false,
      excludeId: ''
    }, options || {});

    const modals = Array.from(document.querySelectorAll('.modal, [role="dialog"]'));
    return modals.find((modal) => {
      if (!modal || (settings.excludeId && modal.id === settings.excludeId)) return false;
      if (settings.visibleOnly && !isVisible(modal)) return false;
      const title = modal.querySelector('.modal-header h1, .modal-header h2, .modal-header h3, .modal-title');
      const text = normalizeText(title ? title.textContent : modal.textContent || '');
      return text.indexOf(target) !== -1;
    }) || null;
  }

  function findProductFilterModalReference() {
    return findModalByTitle('Filtrar', {
      visibleOnly: true,
      excludeId: PRODUCT_CODE_RANGE_MODAL_ID
    }) || findModalByTitle('Filtrar', {
      excludeId: PRODUCT_CODE_RANGE_MODAL_ID
    });
  }

  function findProductFilterModalReferenceButton(matchers) {
    const modal = findProductFilterModalReference();
    if (!modal) return null;
    const controls = Array.from(modal.querySelectorAll('button, a, [role="button"], input[type="button"], input[type="submit"]'));
    return controls.find((control) => {
      const label = normalizeText(
        control.innerText
        || control.textContent
        || control.value
        || control.getAttribute('aria-label')
        || control.getAttribute('title')
        || ''
      );
      return matchers.some((matcher) => label.indexOf(matcher) !== -1);
    }) || null;
  }

  function applyProductCodeRangeModalTheme(modal) {
    if (!modal) return;

    const backdrop = document.getElementById(PRODUCT_CODE_RANGE_BACKDROP_ID);
    if (backdrop) {
      backdrop.className = 'modal-backdrop fade';
      backdrop.style.zIndex = '999996';
    }

    modal.className = 'modal fade';
    modal.style.zIndex = '999997';
    modal.style.paddingRight = '0';

    const content = modal.querySelector('.modal-content');
    const header = modal.querySelector('.modal-header');
    const body = modal.querySelector('.modal-body');
    const footer = modal.querySelector('.modal-footer');
    const title = modal.querySelector('[data-product-code-range-title]');
    const status = modal.querySelector('[data-product-code-range-status]');
    const clearButton = modal.querySelector('[data-product-code-range-clear]');
    const cancelButton = modal.querySelector('[data-product-code-range-cancel]');
    const applyButton = modal.querySelector('[data-product-code-range-apply]');

    const copyStyles = (source, target, properties) => {
      if (!source || !target || !properties || !properties.length) return;
      const styles = getComputedStyle(source);
      properties.forEach((property) => {
        target.style.setProperty(property, styles.getPropertyValue(property), styles.getPropertyPriority(property));
      });
    };

    const clearInlineStyles = (target, properties) => {
      if (!target || !properties || !properties.length) return;
      properties.forEach((property) => {
        target.style.removeProperty(property);
      });
    };

    const referenceFilterModal = findProductFilterModalReference();
    const referenceContent = Array.from(document.querySelectorAll('.modal-content'))
      .find((element) => {
        if (!element || element.closest('#' + PRODUCT_CODE_RANGE_MODAL_ID)) return false;
        return isVisible(element);
      }) || (referenceFilterModal ? referenceFilterModal.querySelector('.modal-content') : null);

    if (referenceContent && content) {
      copyStyles(referenceContent, content, [
        'background',
        'background-color',
        'border',
        'border-radius',
        'box-shadow',
        'color',
        'font-family',
        'font-size',
        'font-weight',
        'line-height'
      ]);

      const referenceHeader = referenceContent.querySelector('.modal-header');
      const referenceBody = referenceContent.querySelector('.modal-body');
      const referenceFooter = referenceContent.querySelector('.modal-footer');
      const referenceClose = referenceHeader && referenceHeader.querySelector('.btn-close, button');
      const referencePrimary = (referenceFooter && referenceFooter.querySelector('.btn-primary'))
        || findProductFilterModalReferenceButton(['filtrar', 'buscar']);
      const referenceTitle = referenceHeader && Array.from(referenceHeader.children).find((element) => {
        if (!element || element.matches('button')) return false;
        return String(element.textContent || '').trim().length > 0;
      });
      const referenceCancel = (referenceFooter && Array.from(referenceFooter.querySelectorAll('button, a')).find((element) => {
        const text = String(element.textContent || '').trim().toLowerCase();
        return text.indexOf('cancelar') !== -1;
      })) || findProductFilterModalReferenceButton(['cancelar']);
      const referenceInput = referenceBody && referenceBody.querySelector('.form-control, input');

      copyStyles(referenceHeader, header, ['padding', 'border', 'border-radius', 'color', 'font-family', 'font-size', 'font-weight', 'line-height']);
      copyStyles(referenceBody, body, ['padding', 'color', 'font-family', 'font-size', 'font-weight', 'line-height']);
      copyStyles(referenceFooter, footer, ['padding', 'border', 'border-radius', 'color', 'font-family', 'font-size', 'font-weight', 'line-height']);
      copyStyles(referenceClose, modal.querySelector('[data-product-code-range-close]'), ['background', 'border', 'border-radius', 'box-shadow', 'color']);
      copyStyles(referenceInput, modal.querySelector('[name="startCode"]'), ['background', 'background-color', 'border', 'border-radius', 'box-shadow', 'color', 'font-family', 'font-size', 'font-weight', 'line-height', 'padding']);
      copyStyles(referenceInput, modal.querySelector('[name="endCode"]'), ['background', 'background-color', 'border', 'border-radius', 'box-shadow', 'color', 'font-family', 'font-size', 'font-weight', 'line-height', 'padding']);
      if (referencePrimary) {
        copyStyles(referencePrimary, applyButton, ['background', 'background-color', 'border', 'border-radius', 'box-shadow', 'color', 'font-family', 'font-size', 'font-weight', 'line-height', 'padding']);
      } else {
        clearInlineStyles(applyButton, ['background', 'background-color', 'border', 'border-radius', 'box-shadow', 'color', 'font-family', 'font-size', 'font-weight', 'line-height', 'padding']);
      }
      copyStyles(referenceTitle, title, ['color', 'font-family', 'font-size', 'font-weight', 'line-height']);
      if (referenceCancel) {
        copyStyles(referenceCancel, cancelButton, ['background', 'background-color', 'border', 'border-radius', 'box-shadow', 'color', 'font-family', 'font-size', 'font-weight', 'line-height', 'padding']);
      } else {
        clearInlineStyles(cancelButton, ['background', 'background-color', 'border', 'border-radius', 'box-shadow', 'color', 'font-family', 'font-size', 'font-weight', 'line-height', 'padding']);
      }
      if (referenceCancel) {
        copyStyles(referenceCancel, clearButton, ['background', 'background-color', 'border', 'border-radius', 'box-shadow', 'color', 'font-family', 'font-size', 'font-weight', 'line-height', 'padding']);
      } else {
        clearInlineStyles(clearButton, ['background', 'background-color', 'border', 'border-radius', 'box-shadow', 'color', 'font-family', 'font-size', 'font-weight', 'line-height', 'padding']);
      }
    }

    if (title && content) {
      title.style.margin = '0';
    }

    if (footer) {
      footer.style.display = 'flex';
      footer.style.alignItems = 'center';
      footer.style.justifyContent = clearButton ? 'space-between' : 'flex-end';
      footer.style.gap = '8px';
      footer.style.flexWrap = window.innerWidth <= 640 ? 'wrap' : 'nowrap';
    }

    const footerActions = modal.querySelector('[data-product-code-range-footer-actions]');
    if (footerActions) {
      footerActions.style.display = 'flex';
      footerActions.style.alignItems = 'center';
      footerActions.style.gap = '8px';
      footerActions.style.flexWrap = window.innerWidth <= 640 ? 'wrap' : 'nowrap';
      footerActions.style.marginLeft = window.innerWidth <= 640 ? '0' : 'auto';
    }

    [clearButton, cancelButton, modal.querySelector('[data-product-code-range-apply]')].forEach((button) => {
      if (!button) return;
      button.style.display = 'inline-flex';
      button.style.alignItems = 'center';
      button.style.justifyContent = 'center';
      button.style.width = 'auto';
      button.style.minWidth = '0';
      button.style.flex = '0 0 auto';
      button.style.whiteSpace = 'nowrap';
    });

    if (content && clearButton) {
      const contentStyles = getComputedStyle(content);
      const cancelStyles = cancelButton ? getComputedStyle(cancelButton) : null;
      const darkSurface = isDarkSurface(content);
      if (darkSurface) {
        clearButton.style.setProperty('background', 'transparent', 'important');
        clearButton.style.setProperty('background-color', 'transparent', 'important');
        clearButton.style.setProperty('border', '0', 'important');
        clearButton.style.setProperty('box-shadow', 'none', 'important');
        clearButton.style.setProperty('color', cancelStyles && cancelStyles.color ? cancelStyles.color : contentStyles.color, 'important');
      } else if (applyButton) {
        const applyStyles = getComputedStyle(applyButton);
        clearButton.style.setProperty('background', applyStyles.background, 'important');
        clearButton.style.setProperty('background-color', applyStyles.backgroundColor, 'important');
        clearButton.style.setProperty('border', applyStyles.border, 'important');
        clearButton.style.setProperty('box-shadow', applyStyles.boxShadow, 'important');
        clearButton.style.setProperty('color', applyStyles.color, 'important');
      }
    }

    if (status && content) {
      status.style.marginTop = '12px';
      status.style.padding = '0';
      status.style.border = '0';
      status.style.borderRadius = '0';
      status.style.background = 'transparent';
      status.style.fontSize = '12px';
    }
  }

  function escapeHtml(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function isTargetItemSearchInput(el) {
    if (!el || !el.matches || !el.matches(ITEM_SEARCH_SELECTOR)) return false;
    if (!isTargetDavRoute()) return false;

    const ariaControls = el.getAttribute('aria-controls') || '';
    const ariaLabel = el.getAttribute('aria-label') || '';
    return ariaControls.indexOf('listbox-z-select-') === 0 && ariaLabel.indexOf('searchbox') !== -1;
  }

  function hasNearbyNfeItemMarkers(el) {
    const containers = [
      el && el.closest ? el.closest('.accordion-item') : null,
      el && el.closest ? el.closest('.accordion-body') : null,
      el && el.closest ? el.closest('.row') : null,
      el && el.closest ? el.closest('.col, [class*="col-"]') : null,
      el && el.closest ? el.closest('.z-select') : null
    ].filter(Boolean);

    return containers.some((container) => {
      const text = normalizeText((container.innerText || container.textContent || '').slice(0, 320));
      return text.indexOf('item') !== -1
        && text.indexOf('quantidade') !== -1
        && (
          text.indexOf('valor unitario') !== -1
          || text.indexOf('valor unitario r$') !== -1
          || text.indexOf('desconto') !== -1
        );
    });
  }

  function isTargetNfeItemSearchInput(el) {
    if (!el || !el.matches || !el.matches(ITEM_SEARCH_SELECTOR)) return false;
    if (!isTargetNfeNewRoute()) return false;
    if (!isVisible(el)) return false;

    const ariaControls = el.getAttribute('aria-controls') || '';
    const ariaLabel = el.getAttribute('aria-label') || '';
    if (ariaControls.indexOf('listbox-z-select-') !== 0 || ariaLabel.indexOf('searchbox') === -1) {
      return false;
    }

    return hasNearbyNfeItemMarkers(el);
  }

  function isTargetHashItemSearchInput(el) {
    return isTargetItemSearchInput(el) || isTargetNfeItemSearchInput(el);
  }

  function getNormalizedItemSearchValue(value) {
    const current = String(value || '').trim();
    if (!current) return current;

    if (/^\d+$/.test(current)) {
      return '#' + current;
    }

    if (current.charAt(0) === '#') {
      const rest = current.slice(1);
      if (!/^\d+$/.test(rest)) {
        return rest;
      }
    }

    return current;
  }

  function applyNormalizedItemSearchValue(input) {
    if (!isTargetHashItemSearchInput(input)) return false;
    const current = String(input.value || '').trim();
    const nextValue = getNormalizedItemSearchValue(current);
    if (!nextValue || nextValue === current) return false;
    setInputValueAndNotify(input, nextValue);
    return true;
  }

  function scheduleNormalizedItemSearchValue(input) {
    if (!input || !isTargetHashItemSearchInput(input)) return;
    const previousTimer = ITEM_SEARCH_NORMALIZE_TIMERS.get(input);
    if (previousTimer) {
      clearTimeout(previousTimer);
    }

    const timerId = setTimeout(() => {
      ITEM_SEARCH_NORMALIZE_TIMERS.delete(input);
      applyNormalizedItemSearchValue(input);
    }, 90);

    ITEM_SEARCH_NORMALIZE_TIMERS.set(input, timerId);
  }

  function moveInputCaretToEnd(input) {
    if (!input || typeof input.setSelectionRange !== 'function') return;
    const length = String(input.value || '').length;
    try {
      input.setSelectionRange(length, length);
    } catch (error) {}
  }

  function isPlainDigitKey(event) {
    if (!event || event.ctrlKey || event.metaKey || event.altKey) return false;
    return /^[0-9]$/.test(event.key || '');
  }

  function handleNfeItemSearchHashKeydown(event) {
    if (!isFeatureEnabled('itemSearchHashEnabled')) return;
    const input = event && event.target;
    if (!isTargetNfeItemSearchInput(input)) return;

    const currentValue = String(input.value || '').trim();
    const currentDigits = currentValue.replace(/^#/, '').replace(/\D+/g, '');

    if (isPlainDigitKey(event)) {
      event.preventDefault();
      setInputValueAndNotify(input, '#' + currentDigits + event.key);
      moveInputCaretToEnd(input);
      scheduleNormalizedItemSearchValue(input);
      return;
    }

    if (
      event
      && event.key === 'Backspace'
      && !event.ctrlKey
      && !event.metaKey
      && !event.altKey
      && /^#?\d+$/.test(currentValue)
    ) {
      event.preventDefault();
      const nextDigits = currentDigits.slice(0, -1);
      setInputValueAndNotify(input, nextDigits ? ('#' + nextDigits) : '');
      moveInputCaretToEnd(input);
      scheduleNormalizedItemSearchValue(input);
    }
  }

  function syncFocusedHashItemSearchInput() {
    if (!isFeatureEnabled('itemSearchHashEnabled')) return;
    const activeInput = document.activeElement;
    if (!isTargetHashItemSearchInput(activeInput)) return;
    applyNormalizedItemSearchValue(activeInput);
  }

  function setInputValueAndNotify(input, nextValue) {
    const descriptor = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value');
    if (descriptor && descriptor.set) {
      descriptor.set.call(input, nextValue);
    } else {
      input.value = nextValue;
    }
    input.dispatchEvent(new Event('input', { bubbles: true, composed: true }));
    input.dispatchEvent(new Event('change', { bubbles: true }));
  }

  async function typeInputLikeUser(input, text, stepDelay) {
    if (!input) return;
    const nextText = String(text == null ? '' : text);
    const descriptor = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value');
    const setter = descriptor && descriptor.set ? descriptor.set : null;

    input.focus();
    if (setter) setter.call(input, '');
    else input.value = '';
    input.dispatchEvent(new Event('input', { bubbles: true, composed: true }));

    let acc = '';
    for (const ch of nextText) {
      acc += ch;
      if (setter) setter.call(input, acc);
      else input.value = acc;
      input.dispatchEvent(new Event('input', { bubbles: true, composed: true }));
      if (stepDelay) await delay(stepDelay);
    }

    input.dispatchEvent(new Event('change', { bubbles: true }));
  }

  function setInputValueDirect(input, nextValue) {
    if (!input) return;
    input.focus();
    setInputValueAndNotify(input, String(nextValue == null ? '' : nextValue));
  }

  function normalizeItemSearchValue(e) {
    if (!isFeatureEnabled('itemSearchHashEnabled')) return;
    const input = e && e.target;
    if (!isTargetHashItemSearchInput(input)) return;
    applyNormalizedItemSearchValue(input);
    scheduleNormalizedItemSearchValue(input);
  }

  function findXmlDownloadTrigger(target) {
    let el = target;
    for (let i = 0; i < 6 && el; i += 1, el = el.parentElement) {
      if (!el) break;
      const text = normalizeText(el.innerText || el.textContent || '');
      if (text === 'gerar xml') return el;
    }
    return null;
  }

  function createXmlDownloadRequestId() {
    return ['xml', Date.now(), Math.random().toString(36).slice(2, 8)].join('-');
  }

  function shouldUsePageBridge() {
    if (isFiscalRoute() && isFeatureEnabled('xmlDownloadEnabled')) return true;
    if (isTargetNfeNewRoute() && isFeatureEnabled('itemSearchHashEnabled')) return true;
    if (isTargetProductRoute() && isFeatureEnabled('productPreferredSupplierBulkEnabled')) return true;
    return false;
  }

  function ensurePageBridge() {
    if (!shouldUsePageBridge()) return;
    const runtime = getRuntimeApi();
    if (!runtime || typeof runtime.getURL !== 'function') return;

    const parent = document.head || document.documentElement;
    if (!parent) return;

    const existing = document.getElementById(XML_BRIDGE_SCRIPT_ID);
    if (existing) {
      if (existing.dataset && existing.dataset.bridgeVersion === XML_BRIDGE_VERSION) return;
      existing.remove();
    }

    const script = document.createElement('script');
    script.id = XML_BRIDGE_SCRIPT_ID;
    script.dataset.bridgeVersion = XML_BRIDGE_VERSION;
    script.src = runtime.getURL('nucleo/page-bridge.js') + '?v=' + encodeURIComponent(XML_BRIDGE_VERSION);
    script.async = false;
    parent.appendChild(script);
  }

  function forwardXmlBridgePayload(payload) {
    if (!isFeatureEnabled('xmlDownloadEnabled')) return;
    const runtime = getRuntimeApi();
    if (!runtime || typeof runtime.sendMessage !== 'function') return;

    try {
      runtime.sendMessage(payload);
    } catch (err) {}
  }

  function handleXmlBridgeMessage(event) {
    if (event.source !== window) return;

    const data = event && event.data;
    if (!data || data.source !== XML_BRIDGE_SOURCE) return;

    if (data.type === 'product-paginate-request' && data.payload && typeof data.payload === 'object') {
      LAST_PRODUCT_PAGINATE_REQUEST_PAYLOAD = Object.assign({}, data.payload);
      return;
    }

    if (!isFeatureEnabled('xmlDownloadEnabled')) return;
    if (!data.requestId) return;

    if (data.type === 'xml-popup-url' && typeof data.url === 'string' && data.url) {
      forwardXmlBridgePayload({
        type: 'xml-download-url',
        requestId: data.requestId,
        url: data.url,
        title: data.title || ''
      });
      return;
    }

    if (data.type === 'xml-popup-content' && typeof data.content === 'string' && data.content) {
      forwardXmlBridgePayload({
        type: 'xml-download-content',
        requestId: data.requestId,
        content: data.content,
        title: data.title || ''
      });
    }
  }

  function armXmlDownloadFlow(e) {
    if (!isFeatureEnabled('xmlDownloadEnabled')) return;
    if (!isFiscalRoute()) return;
    if (NFE_BATCH_DOWNLOAD_INTERNAL_CLICK) return;

    const trigger = findXmlDownloadTrigger(e && e.target);
    if (!trigger) return;

    const nowAt = Date.now();
    if ((nowAt - LAST_XML_DOWNLOAD_ARM_AT) < 800) return;
    LAST_XML_DOWNLOAD_ARM_AT = nowAt;

    const requestId = createXmlDownloadRequestId();
    const runtime = getRuntimeApi();
    ensurePageBridge();

    if (runtime && typeof runtime.sendMessage === 'function') {
      try {
        runtime.sendMessage({ type: 'xml-download-arm', requestId: requestId });
      } catch (err) {}
    }

    try {
      window.postMessage({
        source: XML_CONTENT_SOURCE,
        type: 'arm-xml-download',
        requestId: requestId
      }, '*');
    } catch (err) {}
  }

  function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  function isVisible(el) {
    if (!el) return false;
    const style = window.getComputedStyle(el);
    if (style.display === 'none' || style.visibility === 'hidden') return false;
    return !!(el.offsetWidth || el.offsetHeight || el.getClientRects().length);
  }

  function normalizeBatchCode(code) {
    const value = (code || '').trim();
    if (!value) return '';
    return /^\d+$/.test(value) ? ('#' + value) : value;
  }

  function findMainSearchInput() {
    const inputs = Array.from(document.querySelectorAll(ITEM_SEARCH_SELECTOR));
    return inputs.find(input => isTargetItemSearchInput(input) && isVisible(input)) || null;
  }

  function findQuantityInput() {
    const selectors = [
      'input#itemForm\\.quantity',
      'input[id*="quantity"]',
      'input[name*="quantity"]',
      'input[aria-label*="uant"]',
      'input[placeholder*="uant"]'
    ];

    for (const selector of selectors) {
      const input = document.querySelector(selector);
      if (!input || !isVisible(input)) continue;
      if (input.matches(ITEM_SEARCH_SELECTOR)) continue;
      return input;
    }

    return null;
  }

  function ensureDavQuantityUserBinding(input) {
    if (!input || input.dataset.zwebDavQtyBound === 'true') return;
    input.dataset.zwebDavQtyBound = 'true';

    const markEdited = (event) => {
      if (!event || !event.isTrusted) return;
      input.dataset.zwebDavQtyUserEdited = 'true';
      if (DAV_QTY_AUTO_CLEAR_TIMER) {
        clearTimeout(DAV_QTY_AUTO_CLEAR_TIMER);
        DAV_QTY_AUTO_CLEAR_TIMER = 0;
      }
    };

    const replaceDefaultQuantity = (nextValue) => {
      const normalized = normalizeDavIntegerQuantityText(nextValue);
      if (!normalized) return false;
      setInputValueAndNotify(input, normalized);
      input.dataset.zwebDavQtyReplaceDefault = '';
      input.dataset.zwebDavQtyUserEdited = 'true';
      moveInputCaretToEnd(input);
      return true;
    };

    const shouldReplaceDefaultQuantity = () => {
      if (input.dataset.zwebDavQtyReplaceDefault !== 'true') return false;
      return isDefaultDavQuantityValue(input.value || '');
    };

    input.addEventListener('beforeinput', (event) => {
      if (!event || !event.isTrusted) return;
      const inputType = event.inputType || '';
      const data = typeof event.data === 'string' ? event.data : '';

      if (shouldReplaceDefaultQuantity() && inputType.indexOf('insert') === 0 && data) {
        const normalized = normalizeDavIntegerQuantityText(data);
        if (normalized) {
          event.preventDefault();
          replaceDefaultQuantity(normalized);
          return;
        }
      }

      markEdited(event);
    }, true);

    input.addEventListener('paste', markEdited, true);
    input.addEventListener('drop', markEdited, true);
    input.addEventListener('keydown', (event) => {
      if (!event || !event.isTrusted) return;
      const key = event.key || '';

      if (shouldReplaceDefaultQuantity() && /^[0-9]$/.test(key) && !event.ctrlKey && !event.metaKey && !event.altKey) {
        event.preventDefault();
        replaceDefaultQuantity(key);
        return;
      }

      if (
        key.length === 1
        || key === 'Backspace'
        || key === 'Delete'
        || key === 'Decimal'
        || key === ','
        || key === '.'
      ) {
        markEdited(event);
      }
    }, true);
  }

  function normalizeDavIntegerQuantityText(rawValue) {
    const text = String(rawValue == null ? '' : rawValue).trim();
    if (!text) return '';

    const compact = text.replace(/\s+/g, '');
    const integerPart = compact.split(/[,.]/)[0].replace(/\D+/g, '');
    if (!integerPart) return '';

    const parsed = Number(integerPart);
    if (!Number.isFinite(parsed) || parsed <= 0) return '';
    return String(parsed);
  }

  function parseDavIntegerQuantity(rawValue) {
    const normalized = normalizeDavIntegerQuantityText(rawValue);
    if (!normalized) return null;

    const parsed = Number(normalized);
    return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
  }

  function isDefaultDavQuantityValue(rawValue) {
    const text = String(rawValue || '').trim().replace(/\s+/g, '');
    if (!text) return false;
    return /^1(?:[,.]0+)?$/.test(text);
  }

  function isPendingDavQuantityValue(rawValue) {
    const text = String(rawValue || '').trim().replace(/\s+/g, '');
    if (!text) return true;
    return /^0(?:[,.]0+)?$/.test(text);
  }

  function ensureDavIntegerInputGuard(input) {
    if (!input || input.dataset.zwebDavIntegerGuard === 'true') return;
    input.dataset.zwebDavIntegerGuard = 'true';

    input.addEventListener('keydown', (event) => {
      if (!event || !event.isTrusted) return;
      const key = event.key || '';

      if (key === ',' || key === '.' || key === 'Decimal') {
        event.preventDefault();
        return;
      }
    }, true);

    input.addEventListener('beforeinput', (event) => {
      if (!event || !event.isTrusted) return;
      const data = typeof event.data === 'string' ? event.data : '';
      if (data && /[,.]/.test(data)) {
        event.preventDefault();
      }
    }, true);

    input.addEventListener('paste', (event) => {
      if (!event || !event.isTrusted) return;
      event.preventDefault();
      const pastedText = event.clipboardData ? event.clipboardData.getData('text') : '';
      const normalized = normalizeDavIntegerQuantityText(pastedText);
      setInputValueAndNotify(input, normalized);
      input.dataset.zwebDavQtyReplaceDefault = '';
      input.dataset.zwebDavQtyUserEdited = 'true';
    }, true);

    input.addEventListener('drop', (event) => {
      if (!event || !event.isTrusted) return;
      event.preventDefault();
      const droppedText = event.dataTransfer ? event.dataTransfer.getData('text') : '';
      const normalized = normalizeDavIntegerQuantityText(droppedText);
      setInputValueAndNotify(input, normalized);
      input.dataset.zwebDavQtyReplaceDefault = '';
      input.dataset.zwebDavQtyUserEdited = 'true';
    }, true);
  }

  function setDavQuantityValue(input, rawValue) {
    if (!input) return false;
    const formatted = normalizeDavIntegerQuantityText(rawValue);
    if (!formatted) return false;

    ensureDavQuantityUserBinding(input);
    ensureDavIntegerInputGuard(input);
    input.dataset.zwebDavQtyUserEdited = '';
    setInputValueAndNotify(input, formatted);
    return true;
  }

  async function ensureDavQuantityApplied(input, quantityNumber, timeoutMs) {
    if (!input || !quantityNumber) return false;

    const timeout = timeoutMs || 2400;
    const start = Date.now();
    let stableReads = 0;

    while ((Date.now() - start) < timeout) {
      const current = parseDavIntegerQuantity(input.value || '');
      if (current !== quantityNumber) {
        setDavQuantityValue(input, quantityNumber);
        stableReads = 0;
      } else {
        stableReads += 1;
        if (stableReads >= 3) return true;
      }
      await delay(120);
    }

    return parseDavIntegerQuantity(input.value || '') === quantityNumber;
  }

  function scheduleDavQuantityAutoClear(delayMs) {
    if (!isTargetDavRoute() || BATCH_RUNNING) return;
    if (DAV_QTY_AUTO_CLEAR_TIMER) {
      clearTimeout(DAV_QTY_AUTO_CLEAR_TIMER);
      DAV_QTY_AUTO_CLEAR_TIMER = 0;
    }

    let attemptsLeft = 12;
    const run = () => {
      const qtyInput = findQuantityInput();
      if (!qtyInput) {
        if (attemptsLeft-- > 0) {
          DAV_QTY_AUTO_CLEAR_TIMER = setTimeout(run, 120);
        } else {
          DAV_QTY_AUTO_CLEAR_TIMER = 0;
        }
        return;
      }

      ensureDavQuantityUserBinding(qtyInput);
      ensureDavIntegerInputGuard(qtyInput);

      if (!qtyInput.dataset.zwebDavQtyPendingClear) {
        qtyInput.dataset.zwebDavQtyPendingClear = 'true';
        qtyInput.dataset.zwebDavQtyUserEdited = '';
      }

      const currentValue = String(qtyInput.value || '').trim();
      if (isPendingDavQuantityValue(currentValue)) {
        if (attemptsLeft-- > 0) {
          DAV_QTY_AUTO_CLEAR_TIMER = setTimeout(run, 120);
        } else {
          delete qtyInput.dataset.zwebDavQtyPendingClear;
          DAV_QTY_AUTO_CLEAR_TIMER = 0;
        }
        return;
      }

      delete qtyInput.dataset.zwebDavQtyPendingClear;
      DAV_QTY_AUTO_CLEAR_TIMER = 0;

      if (qtyInput.dataset.zwebDavQtyUserEdited === 'true') {
        qtyInput.dataset.zwebDavQtyReplaceDefault = '';
        return;
      }
      if (!isDefaultDavQuantityValue(currentValue)) {
        qtyInput.dataset.zwebDavQtyReplaceDefault = '';
        return;
      }

      qtyInput.dataset.zwebDavQtyReplaceDefault = 'true';
    };

    DAV_QTY_AUTO_CLEAR_TIMER = setTimeout(run, typeof delayMs === 'number' ? delayMs : 140);
  }

  function handleDavQuantityAutoClearTrigger(event) {
    if (!isTargetDavRoute() || BATCH_RUNNING) return;
    const target = event && event.target;
    if (!isTargetItemSearchInput(target)) return;
    if (event && event.type === 'keydown' && event.key !== 'Enter') return;
    scheduleDavQuantityAutoClear(event && event.type === 'keydown' ? 180 : 140);
  }

  function isDavSearchOptionTarget(target) {
    let el = target;
    for (let i = 0; i < 8 && el; i += 1, el = el.parentElement) {
      if (!el || !el.getAttribute) continue;
      const role = el.getAttribute('role') || '';
      const id = el.id || '';
      if (role === 'option') return true;
      if (id.indexOf('listbox-z-select-') === 0) return true;
      if (el.classList && (
        el.classList.contains('multiselect__option')
        || el.classList.contains('multiselect__element')
      )) {
        return true;
      }
    }
    return false;
  }

  function handleDavQuantityAutoClearOptionClick(event) {
    if (!isTargetDavRoute() || BATCH_RUNNING) return;
    if (!isDavSearchOptionTarget(event && event.target)) return;
    if (!findMainSearchInput()) return;
    scheduleDavQuantityAutoClear(160);
  }

  function findAddButton() {
    const preferred = Array.from(document.querySelectorAll(
      '#items .mt-3 > button, #items button.btn.btn-transparent.btn-sm.px-3, #items #icon-add'
    ));

    for (const el of preferred) {
      const button = el.tagName === 'BUTTON' ? el : el.closest('button');
      if (!button || !isVisible(button)) continue;
      return button;
    }

    const icon = document.getElementById('icon-add');
    if (icon) {
      const button = icon.closest('button');
      if (button && isVisible(button)) return button;
    }

    const buttons = Array.from(document.querySelectorAll('button.btn.btn-transparent.btn-sm.px-3, button.btn-transparent'));
    return buttons.find(btn => isVisible(btn) && !!btn.querySelector('#icon-add, .font-icon-add')) || null;
  }

  function findFirstSearchResult(input, term) {
    if (!input) return null;
    const normalizedTerm = normalizeText((term || '').replace(/^#/, ''));

    function pickBest(container) {
      if (!container) return null;
      const options = Array.from(container.querySelectorAll(
        '[role="option"]:not(.multiselect__option--disabled), ' +
        '.multiselect__option:not(.multiselect__option--disabled), ' +
        'li:not(.multiselect__option--disabled), ' +
        '.multiselect__element:not(.multiselect__option--disabled)'
      )).filter(isVisible);
      if (!options.length) return null;
      if (!normalizedTerm) return options[0];

      const exact = options.find(opt => {
        const t = normalizeText(opt.innerText || opt.textContent || '');
        return t.indexOf(normalizedTerm) !== -1;
      });
      return exact || options[0];
    }

    const controlsId = input.getAttribute('aria-controls');
    if (controlsId) {
      const list = document.getElementById(controlsId);
      const option = pickBest(list);
      if (option) return option;
    }

    const fallbackList = document.querySelector(
      '.multiselect__content-wrapper[style*="display"], .multiselect__content-wrapper'
    );
    return pickBest(fallbackList);
  }

  async function waitForSearchResult(input, term, timeoutMs) {
    const timeout = timeoutMs || 3500;
    const start = Date.now();
    while (Date.now() - start < timeout) {
      const option = findFirstSearchResult(input, term);
      if (option && isVisible(option)) return option;
      await delay(100);
    }
    return null;
  }

  async function waitForEnabledAddButton(timeoutMs) {
    const timeout = timeoutMs || 4000;
    const start = Date.now();
    while (Date.now() - start < timeout) {
      const btn = findAddButton();
      if (btn && isVisible(btn) && !btn.disabled && !btn.hasAttribute('disabled')) return btn;
      await delay(100);
    }
    return null;
  }

  async function waitForBatchSearchInputReady(timeoutMs) {
    const timeout = timeoutMs || 5000;
    const start = Date.now();
    while (Date.now() - start < timeout) {
      const input = findMainSearchInput();
      if (input && !input.disabled && !input.readOnly) {
        return input;
      }
      await delay(120);
    }
    return findMainSearchInput();
  }

  async function resolveBatchSearchOption(input, normalizedCode) {
    if (!input) return null;

    const attempts = [
      { settleDelay: 380, waitTimeout: 6000, resetFirst: false },
      { settleDelay: 520, waitTimeout: 8000, resetFirst: true }
    ];

    for (const attempt of attempts) {
      if (attempt.resetFirst) {
        setInputValueDirect(input, '');
        await delay(180);
      }

      setInputValueDirect(input, normalizedCode);
      await delay(attempt.settleDelay);

      const option = await waitForSearchResult(input, normalizedCode, attempt.waitTimeout);
      if (option) return option;
    }

    return null;
  }

  function clickLikeUser(el) {
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = rect.left + Math.max(1, Math.floor(rect.width / 2));
    const y = rect.top + Math.max(1, Math.floor(rect.height / 2));
    const common = {
      bubbles: true,
      cancelable: true,
      view: window,
      button: 0,
      buttons: 1,
      clientX: x,
      clientY: y
    };

    if (typeof window.PointerEvent === 'function') {
      el.dispatchEvent(new PointerEvent('pointerdown', common));
    }
    el.dispatchEvent(new MouseEvent('mousedown', common));
    el.dispatchEvent(new MouseEvent('mouseup', common));
    if (typeof window.PointerEvent === 'function') {
      el.dispatchEvent(new PointerEvent('pointerup', common));
    }
    el.dispatchEvent(new MouseEvent('click', common));
    if (typeof el.click === 'function') el.click();
  }

  function clickOptionWithFallback(option) {
    if (!option) return;
    const targets = [
      option,
      option.querySelector ? option.querySelector('[role="option"]') : null,
      option.querySelector ? option.querySelector('.multiselect__option') : null,
      option.firstElementChild || null
    ].filter(Boolean);

    const seen = new Set();
    for (const target of targets) {
      if (seen.has(target)) continue;
      seen.add(target);
      clickLikeUser(target);
    }
  }

  function clickOptionDirect(option) {
    if (!option) return;
    const target = (option.querySelector && (
      option.querySelector('[role="option"]')
      || option.querySelector('.multiselect__option')
    )) || option;

    if (target.scrollIntoView) {
      target.scrollIntoView({ block: 'nearest' });
    }
    clickLikeUser(target);
  }

  function dispatchEnter(input) {
    if (!input) return;
    const eventInit = {
      bubbles: true,
      cancelable: true,
      key: 'Enter',
      code: 'Enter',
      keyCode: 13,
      which: 13
    };
    input.dispatchEvent(new KeyboardEvent('keydown', eventInit));
    input.dispatchEvent(new KeyboardEvent('keypress', eventInit));
    input.dispatchEvent(new KeyboardEvent('keyup', eventInit));
  }

  async function ensureDescriptionConfirmed(input, normalizedCode) {
    const quick = await waitForEnabledAddButton(900);
    if (quick) return;

    let option = await waitForSearchResult(input, normalizedCode, 1400);
    if (option) {
      clickOptionDirect(option);
      await delay(180);
    }

    dispatchEnter(input);
    await delay(120);

    const qtyInput = findQuantityInput();
    if (qtyInput) {
      qtyInput.focus();
      qtyInput.dispatchEvent(new Event('focus', { bubbles: true }));
      await delay(100);
    } else {
      input.blur();
      await delay(100);
    }

    const second = await waitForEnabledAddButton(1600);
    if (second) return;

    option = await waitForSearchResult(input, normalizedCode, 1200);
    if (option) {
      clickOptionDirect(option);
      await delay(180);
    }
  }

  async function addSingleItemInBatch(code, quantityRaw, quantityNumber) {
    const input = await waitForBatchSearchInputReady(5000);
    if (!input) throw new Error('Campo de busca de item nao encontrado');

    const normalizedCode = normalizeBatchCode(code);

    const option = await resolveBatchSearchOption(input, normalizedCode);
    if (option) {
      clickOptionDirect(option);
      await delay(220);
    } else {
      throw new Error('Nenhum resultado encontrado para ' + normalizedCode);
    }

    await ensureDescriptionConfirmed(input, normalizedCode);
    await delay(220);

    const qtyInput = findQuantityInput();
    if (qtyInput) {
      qtyInput.focus();
      setDavQuantityValue(qtyInput, quantityRaw);
      await ensureDavQuantityApplied(qtyInput, quantityNumber, 2200);
      const got = parseDavIntegerQuantity(qtyInput.value || '');
      if ((!got || got !== quantityNumber) && quantityNumber) {
        setDavQuantityValue(qtyInput, quantityNumber);
        await ensureDavQuantityApplied(qtyInput, quantityNumber, 2200);
      }
      qtyInput.dispatchEvent(new Event('blur', { bubbles: true }));
      await delay(180);
      await ensureDavQuantityApplied(qtyInput, quantityNumber, 1800);
    }

    const addButton = await waitForEnabledAddButton(7500);
    if (!addButton) throw new Error('Botao adicionar nao habilitou para ' + normalizedCode);

    if (qtyInput && quantityNumber) {
      await ensureDavQuantityApplied(qtyInput, quantityNumber, 1200);
    }

    clickLikeUser(addButton);
    const confirmed = await waitForItemConfirmation(normalizedCode, 8000);
    if (!confirmed) throw new Error('Item nao confirmou apos clicar adicionar para ' + normalizedCode);
    await delay(280);
  }

  function updateBatchStatus(text) {
    const status = document.getElementById(BATCH_STATUS_ID);
    if (status) status.textContent = text || '';
  }

  function removeBatchUi() {
    const toggle = document.getElementById(BATCH_TOGGLE_ID);
    const modal = document.getElementById(BATCH_MODAL_ID);
    const backdrop = document.getElementById(BATCH_BACKDROP_ID);
    const status = document.getElementById(BATCH_STATUS_ID);
    const spacer = document.getElementById(BATCH_SPACER_ID);
    const progress = document.getElementById(BATCH_PROGRESS_ID);
    if (toggle) toggle.remove();
    if (modal) modal.remove();
    if (backdrop) backdrop.remove();
    if (status) status.remove();
    if (spacer) spacer.remove();
    if (progress) progress.remove();
  }

  function removeProductPreviewButton() {
    const button = document.getElementById(PRODUCT_PREVIEW_BUTTON_ID);
    if (button) button.remove();
    removeProductPreviewTooltip();
    removeProductCodeRangeUi();
  }

  function removeProductCodeRangeUi() {
    const panel = document.getElementById(PRODUCT_CODE_RANGE_PANEL_ID);
    const modal = document.getElementById(PRODUCT_CODE_RANGE_MODAL_ID);
    const backdrop = document.getElementById(PRODUCT_CODE_RANGE_BACKDROP_ID);
    const wrappers = Array.from(document.querySelectorAll('.table-wrapper.table-wrapper-filter'))
      .filter((wrapper) => !wrapper.hasAttribute(PRODUCT_CODE_RANGE_GRID_ATTR));
    if (panel) panel.remove();
    if (modal) modal.remove();
    if (backdrop) backdrop.remove();
    wrappers.forEach((wrapper) => {
      wrapper.style.display = '';
    });
    removeProductCodeRangeToolbarStatus();
    LAST_PRODUCT_CODE_RANGE_SIGNATURE = '';
  }

  function normalizeProductCodeRangeValue(value) {
    const digits = String(value || '').replace(/\D+/g, '').trim();
    if (!digits) return NaN;
    const parsed = Number(digits);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : NaN;
  }

  function formatProductRangeNumber(value, fractionDigits) {
    const digits = typeof fractionDigits === 'number' ? fractionDigits : 0;
    if (!Number.isFinite(Number(value))) return '-';
    return Number(value).toLocaleString('pt-BR', {
      minimumFractionDigits: digits,
      maximumFractionDigits: digits
    });
  }

  function formatProductRangeCurrency(value) {
    return formatProductRangeNumber(value, 2);
  }

  function formatProductRangeDate(value) {
    if (!value) return '';
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return String(value);
    return parsed.toLocaleDateString('pt-BR');
  }

  function getProductCodeRangeItemSequence(item) {
    return item && item.sequence != null ? String(item.sequence).trim() : '';
  }

  function getProductCodeRangeSelectedSequence() {
    const current = String(PRODUCT_CODE_RANGE_STATE.selectedSequence || '').trim();
    const items = Array.isArray(PRODUCT_CODE_RANGE_STATE.items) ? PRODUCT_CODE_RANGE_STATE.items : [];
    if (!items.length) return '';
    if (current && items.some((item) => getProductCodeRangeItemSequence(item) === current)) {
      return current;
    }
    return getProductCodeRangeItemSequence(items[0]);
  }

  function getProductCodeRangeSelectedCellIndex() {
    const numeric = Number(PRODUCT_CODE_RANGE_STATE.selectedCellIndex);
    return Number.isInteger(numeric) && numeric >= 0 ? numeric : 0;
  }

  function syncProductCodeRangeSelectedSequence() {
    PRODUCT_CODE_RANGE_STATE.selectedSequence = getProductCodeRangeSelectedSequence();
    return PRODUCT_CODE_RANGE_STATE.selectedSequence;
  }

  function getProductTableWrapper() {
    const wrappers = Array.from(document.querySelectorAll('.table-wrapper.table-wrapper-filter'))
      .filter((wrapper) => !wrapper.hasAttribute(PRODUCT_CODE_RANGE_GRID_ATTR) && wrapper.querySelector('.table-row.header'));
    return wrappers.find((wrapper) => isVisible(wrapper)) || wrappers[0] || null;
  }

  function setNativeProductTableVisible(isVisibleNext) {
    const wrapper = getProductTableWrapper();
    if (!wrapper) return;
    wrapper.style.display = isVisibleNext ? '' : 'none';
  }

  function closeProductCodeRangeModal(options) {
    const modal = document.getElementById(PRODUCT_CODE_RANGE_MODAL_ID);
    const backdrop = document.getElementById(PRODUCT_CODE_RANGE_BACKDROP_ID);
    window.clearTimeout(PRODUCT_CODE_RANGE_MODAL_VISIBILITY_TIMER);
    if (options && options.immediate) {
      if (modal) {
        modal.classList.remove('show');
        modal.style.pointerEvents = 'none';
      }
      if (backdrop) {
        backdrop.classList.remove('show');
        backdrop.style.pointerEvents = 'none';
      }
      document.body && document.body.classList.remove('modal-open');
      PRODUCT_CODE_RANGE_MODAL_VISIBILITY_TIMER = window.setTimeout(() => {
        if (modal) {
          modal.style.display = 'none';
          modal.style.pointerEvents = '';
        }
        if (backdrop) {
          backdrop.style.display = 'none';
          backdrop.style.pointerEvents = '';
        }
        PRODUCT_CODE_RANGE_MODAL_VISIBILITY_TIMER = 0;
      }, PRODUCT_CODE_RANGE_MODAL_TRANSITION_MS + 30);
      return;
    }
    if (modal) modal.classList.remove('show');
    if (backdrop) backdrop.classList.remove('show');
    document.body && document.body.classList.remove('modal-open');
    PRODUCT_CODE_RANGE_MODAL_VISIBILITY_TIMER = window.setTimeout(() => {
      if (modal) modal.style.display = 'none';
      if (backdrop) backdrop.style.display = 'none';
      PRODUCT_CODE_RANGE_MODAL_VISIBILITY_TIMER = 0;
    }, PRODUCT_CODE_RANGE_MODAL_TRANSITION_MS + 30);
  }

  function setProductCodeRangeModalBusy(isBusy) {
    const modal = document.getElementById(PRODUCT_CODE_RANGE_MODAL_ID);
    if (!modal) return;
    Array.from(modal.querySelectorAll('button, input')).forEach((element) => {
      if (element.matches('[data-product-code-range-close], [data-product-code-range-cancel]')) return;
      element.disabled = !!isBusy;
    });
  }

  function setProductCodeRangeModalStatus(message, tone) {
    const modal = document.getElementById(PRODUCT_CODE_RANGE_MODAL_ID);
    if (!modal) return;
    const status = modal.querySelector('[data-product-code-range-status]');
    if (!status) return;
    const theme = getProductCodeRangeTheme(modal);

    const text = String(message || '').trim();
    if (!text) {
      status.textContent = '';
      status.style.display = 'none';
      return;
    }

    status.textContent = text;
    status.style.display = 'block';
    status.style.color = tone === 'error' ? theme.errorTextColor : theme.infoTextColor;
    status.style.background = tone === 'error' ? theme.errorBackground : theme.infoBackground;
    status.style.borderColor = tone === 'error' ? theme.errorBorderColor : theme.infoBorderColor;
  }

  function fillProductCodeRangeForm() {
    const modal = document.getElementById(PRODUCT_CODE_RANGE_MODAL_ID);
    if (!modal) return;
    const form = modal.querySelector('#' + PRODUCT_CODE_RANGE_FORM_ID);
    if (!form) return;
    const startInput = form.querySelector('[name="startCode"]');
    const endInput = form.querySelector('[name="endCode"]');
    if (startInput) startInput.value = PRODUCT_CODE_RANGE_STATE.startCode || '';
    if (endInput) endInput.value = PRODUCT_CODE_RANGE_STATE.endCode || '';
    setProductCodeRangeModalStatus('', '');
    if (startInput) {
      startInput.focus();
      startInput.select && startInput.select();
    }
  }

  function openProductCodeRangeModal() {
    ensureProductCodeRangeModal();
    const modal = document.getElementById(PRODUCT_CODE_RANGE_MODAL_ID);
    const backdrop = document.getElementById(PRODUCT_CODE_RANGE_BACKDROP_ID);
    if (!modal || !backdrop) return;

    window.clearTimeout(PRODUCT_CODE_RANGE_MODAL_VISIBILITY_TIMER);
    applyProductCodeRangeModalTheme(modal);
    fillProductCodeRangeForm();
    modal.classList.remove('show');
    backdrop.classList.remove('show');
    backdrop.style.display = 'block';
    modal.style.display = 'block';
    document.body && document.body.classList.add('modal-open');
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        backdrop.classList.add('show');
        modal.classList.add('show');
      });
    });
    window.setTimeout(() => {
      const startInput = modal.querySelector('[name="startCode"]');
      if (!startInput || modal.style.display === 'none') return;
      startInput.focus({ preventScroll: true });
      startInput.select && startInput.select();
    }, 170);
  }

  async function fetchProductCodeRangePage(pageNumber) {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('Não foi possível encontrar o token da Zweb nesta sessão.');

    const response = await fetch(PRODUCT_PAGINATE_API_URL, {
      method: 'POST',
      headers: {
        accept: 'application/json',
        'content-type': 'application/json',
        'authorization-compufacil': token
      },
      body: JSON.stringify({
        page: pageNumber,
        maxResults: PRODUCT_PAGINATE_PAGE_SIZE
      })
    });

    if (!response.ok) {
      throw new Error('A busca na API de produtos retornou ' + response.status + '.');
    }

    const payload = await response.json();
    return payload && Array.isArray(payload.data) ? payload.data : [];
  }

  async function fetchProductCodeRange(startCode, endCode) {
    const firstPage = Math.max(1, Math.ceil(startCode / PRODUCT_PAGINATE_PAGE_SIZE));
    const lastPage = Math.max(firstPage, Math.ceil(endCode / PRODUCT_PAGINATE_PAGE_SIZE));
    const pageNumbers = [];
    for (let current = firstPage; current <= lastPage; current += 1) {
      pageNumbers.push(current);
    }

    const batches = await Promise.all(pageNumbers.map((pageNumber) => fetchProductCodeRangePage(pageNumber)));
    return batches
      .reduce((acc, batch) => acc.concat(batch || []), [])
      .filter((item) => {
        const sequence = Number(item && item.sequence);
        return Number.isFinite(sequence) && sequence >= startCode && sequence <= endCode;
      })
      .sort((a, b) => Number(a && a.sequence || 0) - Number(b && b.sequence || 0));
  }

  function clearProductCodeRangeFilter(options) {
    LAST_PRODUCT_CODE_RANGE_CLICK = {
      sequence: '',
      cellIndex: -1,
      at: 0
    };
    PRODUCT_CODE_RANGE_STATE = {
      active: false,
      enabled: false,
      loading: false,
      startCode: options && options.keepValues ? PRODUCT_CODE_RANGE_STATE.startCode : '',
      endCode: options && options.keepValues ? PRODUCT_CODE_RANGE_STATE.endCode : '',
      items: [],
      error: '',
      selectedSequence: '',
      selectedCellIndex: 0
    };
    hideProductCodeRangeSnackbar();
    renderProductCodeRangePanel();

    if (options && options.syncNativeClear && PRODUCT_FILTER_CLEAR_SYNC_LOCK !== 'native') {
      triggerNativeProductFilterClearSync();
    }
  }

  async function applyProductCodeRangeFilter() {
    const modal = document.getElementById(PRODUCT_CODE_RANGE_MODAL_ID);
    if (!modal) return;

    const form = modal.querySelector('#' + PRODUCT_CODE_RANGE_FORM_ID);
    if (!form) return;

    let startCode = normalizeProductCodeRangeValue(form.querySelector('[name="startCode"]') ? form.querySelector('[name="startCode"]').value : '');
    let endCode = normalizeProductCodeRangeValue(form.querySelector('[name="endCode"]') ? form.querySelector('[name="endCode"]').value : '');

    if (!Number.isFinite(startCode) || !Number.isFinite(endCode)) {
      setProductCodeRangeModalStatus('Preencha um Código inicial e um Código final válidos.', 'error');
      return;
    }

    if (startCode > endCode) {
      const swap = startCode;
      startCode = endCode;
      endCode = swap;
    }

    PRODUCT_CODE_RANGE_STATE = {
      active: false,
      enabled: false,
      loading: true,
      startCode: String(startCode),
      endCode: String(endCode),
      items: [],
      error: '',
      selectedSequence: '',
      selectedCellIndex: 0
    };
    setProductCodeRangeModalStatus('', '');
    showProductCodeRangeSnackbar('Buscando os Códigos de ' + startCode + ' Até ' + endCode + '...');
    setProductCodeRangeModalBusy(true);
    closeProductCodeRangeModal({ immediate: true });

    try {
      const items = await fetchProductCodeRange(startCode, endCode);
      LAST_PRODUCT_CODE_RANGE_CLICK = {
        sequence: '',
        cellIndex: -1,
        at: 0
      };
      PRODUCT_CODE_RANGE_STATE = {
        active: true,
        enabled: true,
        loading: false,
        startCode: String(startCode),
        endCode: String(endCode),
        items,
        error: '',
        selectedSequence: items[0] ? getProductCodeRangeItemSequence(items[0]) : '',
        selectedCellIndex: 0
      };
      renderProductCodeRangePanel();
    } catch (error) {
      LAST_PRODUCT_CODE_RANGE_CLICK = {
        sequence: '',
        cellIndex: -1,
        at: 0
      };
      PRODUCT_CODE_RANGE_STATE = {
        active: false,
        enabled: false,
        loading: false,
        startCode: String(startCode),
        endCode: String(endCode),
        items: [],
        error: error && error.message ? error.message : 'Não foi possivel consultar a faixa de Códigos.',
        selectedSequence: '',
        selectedCellIndex: 0
      };
      renderProductCodeRangePanel();
      setProductCodeRangeModalStatus(PRODUCT_CODE_RANGE_STATE.error, 'error');
    } finally {
      hideProductCodeRangeSnackbar();
      setProductCodeRangeModalBusy(false);
    }
  }

  function getProductCodeRangeGridStructure(tableWrapper) {
    if (!tableWrapper) return null;

    const headerRow = tableWrapper.querySelector('.table-row.header');
    if (!headerRow) return null;

    const sampleRow = Array.from(tableWrapper.querySelectorAll('.table-row'))
      .find((row) => !row.classList.contains('header'));
    const allHeaderCells = Array.from(headerRow.children || []).map((cell, index) => {
      const headerText = cell.querySelector('.header-text');
      const rawTitle = String(headerText ? headerText.textContent : cell.textContent || '').trim();
      const isSelectionColumn = !normalizeText(rawTitle) && !!(
        cell.querySelector('input[type="checkbox"]')
        || ((sampleRow ? sampleRow.children[index] : null) && sampleRow.children[index].querySelector && sampleRow.children[index].querySelector('input[type="checkbox"]'))
      );
      return {
        index,
        rawTitle,
        normalizedTitle: isSelectionColumn ? '__select__' : normalizeText(rawTitle),
        isSelectionColumn,
        element: cell
      };
    });
    const sampleCells = sampleRow ? Array.from(sampleRow.children || []) : [];
    const headerCells = allHeaderCells
      .filter((header) => header.isSelectionColumn || !!normalizeText(header.rawTitle))
      .map((header) => Object.assign({}, header, {
        sampleCell: sampleCells[header.index] || header.element
      }));

    const codeHeader = headerCells.find((header) => header.normalizedTitle === 'codigo');

    return {
      headerRow,
      sampleRow,
      headerCells,
      codeColumnIndex: codeHeader ? codeHeader.index : -1
    };
  }

  function findNativeProductRowBySequence(sequence, structure) {
    const wrapper = getProductTableWrapper();
    if (!wrapper) return null;
    const normalizedSequence = String(sequence || '').trim();
    if (!normalizedSequence) return null;
    const codeColumnIndex = structure && Number.isInteger(structure.codeColumnIndex) ? structure.codeColumnIndex : -1;
    const rows = Array.from(wrapper.querySelectorAll('.table-row'))
      .filter((row) => !row.classList.contains('header'));
    return rows.find((row) => {
      const cell = codeColumnIndex >= 0 ? row.children[codeColumnIndex] : null;
      const text = normalizeText(cell ? (cell.textContent || '') : (row.textContent || ''));
      return text === normalizeText(normalizedSequence) || text.indexOf(normalizeText(normalizedSequence)) === 0;
    }) || null;
  }

  function createProductCodeRangeSelectionCell(cellTemplate, itemSequence, structure) {
    const cell = cellTemplate ? cellTemplate.cloneNode(true) : document.createElement('div');
    if (cell.removeAttribute) cell.removeAttribute('id');
    if (cell.removeAttribute) cell.removeAttribute('data-row');
    if (cell.removeAttribute) cell.removeAttribute('tabindex');
    if (cell.classList) {
      cell.classList.remove('selected');
      cell.classList.remove('zweb-selected');
    }

    const checkbox = cell.querySelector && cell.querySelector('input[type="checkbox"]');
    const nativeRow = findNativeProductRowBySequence(itemSequence, structure);
    const nativeCheckbox = nativeRow && nativeRow.querySelector ? nativeRow.querySelector('input[type="checkbox"]') : null;

    if (checkbox) {
      if (checkbox.removeAttribute) {
        checkbox.removeAttribute('id');
        checkbox.removeAttribute('name');
        checkbox.removeAttribute('data-row');
      }
      checkbox.checked = !!(nativeCheckbox && nativeCheckbox.checked);
      checkbox.style.pointerEvents = 'auto';
      checkbox.addEventListener('click', function(event) {
        event.stopPropagation();
      });
      checkbox.addEventListener('change', function(event) {
        event.stopPropagation();
        if (nativeCheckbox) {
          setCheckboxState(nativeCheckbox, !!checkbox.checked);
        }
      });
    }

    cell.style.cursor = 'default';
    return cell;
  }

  function getProductCodeRangeItemId(item) {
    const candidates = [
      item && item._id,
      item && item.id,
      item && item.productId,
      item && item.product && item.product._id,
      item && item.product && item.product.id,
      item && item.product && item.product.productId
    ];
    const found = candidates.find((value) => value != null && String(value).trim());
    return found == null ? '' : String(found).trim();
  }

  function openProductCodeRangeItem(item) {
    const editId = getProductCodeRangeItemId(item);
    if (editId) {
      window.location.hash = PRODUCT_EDIT_ROUTE + encodeURIComponent(editId);
      return;
    }

    const code = item && item.sequence != null ? String(item.sequence).trim() : '';
    if (!code) return;

    clearProductCodeRangeFilter({ keepValues: true });
    setNativeProductTableVisible(true);

    const searchInput = document.querySelector(PRODUCT_TOOLBAR_SEARCH_SELECTOR) || document.querySelector('input#search\\.value');
    if (searchInput) {
      setInputValueAndNotify(searchInput, code);
      try {
        searchInput.focus();
        searchInput.select && searchInput.select();
      } catch (error) {}
    }

    const deadline = Date.now() + 2500;
    const tryOpen = () => {
      const rows = Array.from(document.querySelectorAll('.table-wrapper.table-wrapper-filter .table-row'))
        .filter((row) => !row.classList.contains('header') && isVisible(row));
      const targetRow = rows.find((row) => {
        const text = normalizeText(row.textContent || '');
        return text === normalizeText(code) || text.indexOf(normalizeText(code)) === 0;
      });
      const openButton = targetRow && (
        targetRow.querySelector('a[aria-label="Abrir"], a[aria-label="Editar"], button[aria-label="Abrir"], button[aria-label="Editar"]')
      );
      if (openButton && isVisible(openButton)) {
        openButton.click();
        return;
      }

      if (Date.now() < deadline) {
        setTimeout(tryOpen, 150);
      }
    };

    setTimeout(tryOpen, 150);
  }

  function getProductCodeRangeColumnValue(item, normalizedTitle) {
    switch (normalizedTitle) {
      case 'codigo':
        return item && item.sequence != null ? String(item.sequence) : '';
      case 'descricao':
        return item && item.description ? String(item.description) : '';
      case 'quantidade':
        return formatProductRangeNumber(item && item.quantity, 2);
      case 'qtd. minima':
      case 'qtd minima':
      case 'estoque minimo':
        return formatProductRangeNumber(item && item.minimumQuantity, 0);
      case 'preco':
      case 'preco r$':
      case 'preco venda':
      case 'preco de venda':
        return formatProductRangeCurrency(item && item.price);
      case 'custo':
      case 'custo r$':
        return formatProductRangeCurrency(item && item.cost);
      case 'referencia':
        return item && item.reference ? String(item.reference) : '';
      case 'observacao':
        return item && item.observation ? String(item.observation) : '';
      case 'ultimo fornecedor':
        return item && item.lastSupplierName ? String(item.lastSupplierName) : '';
      case 'ultima nf. compra':
      case 'ultima nf compra':
      case 'ultima nfe compra':
      case 'nf compra':
        return item && item.purchaseNfeNumber != null ? String(item.purchaseNfeNumber) : '';
      case 'data ult. compra':
      case 'data ult compra':
      case 'ultima compra':
        return formatProductRangeDate(item && item.lastPurchaseEntryDate);
      case 'data ult. venda':
      case 'data ult venda':
      case 'ultima venda':
        return formatProductRangeDate(item && item.lastSellDate);
      case 'codigo de barras':
      case 'cod barras':
      case 'codigo barras':
        return item && (item.barCode || item.barcode) ? String(item.barCode || item.barcode) : '';
      case 'grupo':
        return item && (item.groupName || item.group) ? String(item.groupName || item.group) : '';
      case 'unidade':
      case 'un':
        return item && (item.unit || item.unitName || item.unitOfMeasure) ? String(item.unit || item.unitName || item.unitOfMeasure) : '';
      case 'ativo':
        return item && typeof item.active === 'boolean' ? (item.active ? 'Sim' : 'Nao') : '';
      default:
        return '';
    }
  }

  function copyComputedStyles(source, target, properties) {
    if (!source || !target || !Array.isArray(properties) || !properties.length) return;
    const computed = getComputedStyle(source);
    properties.forEach((property) => {
      try {
        target.style[property] = computed[property];
      } catch (error) {}
    });
  }

  function createProductCodeRangeCell(cellTemplate, value, options, typography) {
    const cell = cellTemplate ? cellTemplate.cloneNode(false) : document.createElement('div');
    if (!cellTemplate) cell.className = 'cell';
    if (cell.removeAttribute) cell.removeAttribute('id');
    if (cell.removeAttribute) cell.removeAttribute('data-row');
    if (cell.removeAttribute) cell.removeAttribute('tabindex');
    if (cell.classList) cell.classList.remove('selected');
    cell.textContent = '';

    const templateText = cellTemplate ? cellTemplate.querySelector('.cell-text') : null;
    const text = templateText ? templateText.cloneNode(false) : document.createElement('span');
    if (!templateText) text.className = 'cell-text';
    if (text.removeAttribute) text.removeAttribute('id');
    if (text.removeAttribute) text.removeAttribute('tabindex');
    text.textContent = value == null ? '' : String(value);
    if (text.style) {
      text.style.fontFamily = '';
      text.style.fontSize = '';
      text.style.lineHeight = '';
      text.style.letterSpacing = '';
      text.style.fontWeight = '';
    }

    copyComputedStyles(cellTemplate, cell, [
      'display',
      'alignItems',
      'justifyContent',
      'textAlign',
      'height',
      'minHeight',
      'maxHeight',
      'lineHeight',
      'fontSize',
      'fontWeight',
      'paddingTop',
      'paddingRight',
      'paddingBottom',
      'paddingLeft',
      'borderBottom',
      'overflow',
      'whiteSpace',
      'boxSizing'
    ]);
    copyComputedStyles(templateText, text, [
      'display',
      'height',
      'lineHeight',
      'fontSize',
      'fontWeight',
      'paddingTop',
      'paddingRight',
      'paddingBottom',
      'paddingLeft',
      'overflow',
      'whiteSpace',
      'textAlign',
      'boxSizing'
    ]);

    if (cell.dataset) cell.dataset.zwebOriginalFontWeight = cell.style.fontWeight || '';
    if (text.dataset) text.dataset.zwebOriginalFontWeight = text.style.fontWeight || '';

    cell.appendChild(text);
    cell.style.cursor = 'pointer';
    text.style.cursor = 'pointer';

    return cell;
  }

  function applyProductCodeRangeGridSelection(grid) {
    if (!grid) return;
    const selectedSequence = syncProductCodeRangeSelectedSequence();
    const selectedCellIndex = getProductCodeRangeSelectedCellIndex();

    const setBoldRecursive = (element) => {
      if (!element || !element.style) return;
      element.style.setProperty('font-weight', '700', 'important');
      if (element.dataset) element.dataset.zwebFontWeightOverridden = 'true';
      Array.from(element.children || []).forEach(setBoldRecursive);
    };

    const clearBoldRecursive = (element) => {
      if (!element || !element.style) return;
      if (element.dataset && element.dataset.zwebFontWeightOverridden) {
        element.style.removeProperty('font-weight');
        delete element.dataset.zwebFontWeightOverridden;
      }
      Array.from(element.children || []).forEach(clearBoldRecursive);
    };

    Array.from(grid.querySelectorAll('.table-row'))
      .filter((row) => !row.classList.contains('header'))
      .forEach((row) => {
        const rowSequence = String(row.getAttribute('data-product-code-range-sequence') || '').trim();
        const isSelected = !!selectedSequence && rowSequence === selectedSequence;
        row.classList.toggle('marked-row', isSelected);
        row.setAttribute('aria-selected', isSelected ? 'true' : 'false');

        Array.from(row.children || []).forEach((cell) => {
          if (cell.classList) {
            cell.classList.remove('selected');
            cell.classList.remove('zweb-selected');
          }
          clearBoldRecursive(cell);
        });

        if (isSelected) {
          const selectedCell = row.children[selectedCellIndex] || row.querySelector('[data-product-code-range-primary-cell="true"]');
          if (selectedCell && selectedCell.classList) {
            selectedCell.classList.add('selected');
            selectedCell.classList.add('zweb-selected');
            setBoldRecursive(selectedCell);
          }
        }
      });
  }

  function selectProductCodeRangeSequence(sequence, selectedCellIndex) {
    const normalized = String(sequence || '').trim();
    const normalizedCellIndex = Number.isInteger(Number(selectedCellIndex)) && Number(selectedCellIndex) >= 0
      ? Number(selectedCellIndex)
      : getProductCodeRangeSelectedCellIndex();
    if (!normalized) return;
    if (normalized === PRODUCT_CODE_RANGE_STATE.selectedSequence && normalizedCellIndex === getProductCodeRangeSelectedCellIndex()) return;
    PRODUCT_CODE_RANGE_STATE.selectedSequence = normalized;
    PRODUCT_CODE_RANGE_STATE.selectedCellIndex = normalizedCellIndex;
    const panel = document.getElementById(PRODUCT_CODE_RANGE_PANEL_ID);
    const grid = panel && panel.querySelector('[' + PRODUCT_CODE_RANGE_GRID_ATTR + '="true"]');
    if (grid) {
      applyProductCodeRangeGridSelection(grid);
    } else {
      renderProductCodeRangePanel();
    }
  }

  function buildProductCodeRangeGrid(tableWrapper, items) {
    const structure = getProductCodeRangeGridStructure(tableWrapper);
    if (!structure || !structure.headerCells.length) return null;
    const typography = getProductCodeRangeTypography(tableWrapper);
    const sampleRowStyle = structure.sampleRow ? getComputedStyle(structure.sampleRow) : null;
    const selectedSequence = syncProductCodeRangeSelectedSequence();
    const selectedCellIndex = getProductCodeRangeSelectedCellIndex();

    const grid = tableWrapper.cloneNode(false);
    grid.setAttribute(PRODUCT_CODE_RANGE_GRID_ATTR, 'true');
    if (grid.removeAttribute) grid.removeAttribute('id');
    grid.style.display = '';
    if (typography.bodyFontFamily) grid.style.fontFamily = typography.bodyFontFamily;
    if (typography.bodyFontSize) grid.style.fontSize = typography.bodyFontSize;
    if (typography.bodyLineHeight) grid.style.lineHeight = typography.bodyLineHeight;
    grid.innerHTML = '';

    const headerClone = structure.headerRow.cloneNode(false);
    structure.headerCells.forEach((header) => {
      headerClone.appendChild(header.element.cloneNode(true));
    });
    if (typography.headerFontFamily) headerClone.style.fontFamily = typography.headerFontFamily;
    if (typography.headerFontSize) headerClone.style.fontSize = typography.headerFontSize;
    if (typography.headerLineHeight) headerClone.style.lineHeight = typography.headerLineHeight;
    if (typography.headerLetterSpacing) headerClone.style.letterSpacing = typography.headerLetterSpacing;
    grid.appendChild(headerClone);

    items.forEach((item) => {
      const itemSequence = getProductCodeRangeItemSequence(item);
      const row = document.createElement('div');
      row.className = 'table-row';
      row.setAttribute('data-product-code-range-sequence', itemSequence);
      row.style.position = 'relative';
      row.style.top = 'auto';
      row.style.left = 'auto';
      row.style.transform = 'none';
      row.style.display = 'flex';
      row.style.width = 'max-content';
      row.style.minWidth = '100%';
      if (sampleRowStyle) {
        row.style.height = sampleRowStyle.height;
        row.style.lineHeight = sampleRowStyle.lineHeight;
        row.style.fontSize = sampleRowStyle.fontSize;
        row.style.fontWeight = sampleRowStyle.fontWeight;
        row.dataset.zwebOriginalFontWeight = row.style.fontWeight || '';
        row.style.overflow = sampleRowStyle.overflow;
        row.style.boxSizing = sampleRowStyle.boxSizing;
      }
      if (typography.bodyFontFamily) row.style.fontFamily = typography.bodyFontFamily;
      if (typography.bodyLetterSpacing) row.style.letterSpacing = typography.bodyLetterSpacing;
      row.textContent = '';

      const quantity = Number(item && item.quantity);
      const minimumQuantity = Number(item && item.minimumQuantity);
      if (Number.isFinite(quantity) && Number.isFinite(minimumQuantity) && quantity <= minimumQuantity) {
        row.setAttribute(PRODUCT_LOW_STOCK_ATTR, 'true');
      }

      structure.headerCells.forEach((header) => {
        const cellTemplate = header.sampleCell || header.element;
        const cell = header.isSelectionColumn
          ? createProductCodeRangeSelectionCell(cellTemplate, itemSequence, structure)
          : createProductCodeRangeCell(
              cellTemplate,
              getProductCodeRangeColumnValue(item, header.normalizedTitle),
              null,
              typography
            );
        if (header.normalizedTitle === 'codigo') {
          cell.setAttribute('data-product-code-range-primary-cell', 'true');
        }
        row.appendChild(cell);
      });

      if (itemSequence && itemSequence === selectedSequence) {
        row.classList.add('marked-row');
        const selectedCell = row.children[selectedCellIndex] || row.querySelector('[data-product-code-range-primary-cell="true"]');
        if (selectedCell && selectedCell.classList) {
          selectedCell.classList.add('selected');
          if (selectedCell.style) selectedCell.style.fontWeight = '700';
          const selectedCellText = selectedCell && typeof selectedCell.querySelector === 'function'
            ? selectedCell.querySelector('.cell-text')
            : null;
          if (selectedCellText && selectedCellText.style) selectedCellText.style.fontWeight = '700';
        }
      }

      row.addEventListener('click', function(event) {
        if (event && event.target && event.target.closest && event.target.closest('input[type="checkbox"]')) {
          return;
        }
        const gridScrollParent = row.parentElement;
        const previousWindowScrollX = window.scrollX;
        const previousWindowScrollY = window.scrollY;
        const previousGridScrollTop = gridScrollParent ? gridScrollParent.scrollTop : 0;
        const previousGridScrollLeft = gridScrollParent ? gridScrollParent.scrollLeft : 0;
        const clickedCell = event && event.target && event.target.closest
          ? event.target.closest('.cell')
          : null;
        const clickedCellIndex = clickedCell && clickedCell.parentElement === row
          ? Array.prototype.indexOf.call(row.children, clickedCell)
          : getProductCodeRangeSelectedCellIndex();
        selectProductCodeRangeSequence(itemSequence, clickedCellIndex);
        const now = Date.now();
        const isDoubleClickLike = LAST_PRODUCT_CODE_RANGE_CLICK.sequence === itemSequence
          && LAST_PRODUCT_CODE_RANGE_CLICK.cellIndex === clickedCellIndex
          && (now - LAST_PRODUCT_CODE_RANGE_CLICK.at) <= PRODUCT_CODE_RANGE_DOUBLE_CLICK_WINDOW_MS;
        LAST_PRODUCT_CODE_RANGE_CLICK = {
          sequence: itemSequence,
          cellIndex: clickedCellIndex,
          at: now
        };
        if (isDoubleClickLike) {
          LAST_PRODUCT_CODE_RANGE_CLICK = {
            sequence: '',
            cellIndex: -1,
            at: 0
          };
          openProductCodeRangeItem(item);
          return;
        }

        requestAnimationFrame(() => {
          if (gridScrollParent) {
            gridScrollParent.scrollTop = previousGridScrollTop;
            gridScrollParent.scrollLeft = previousGridScrollLeft;
          }
          if (window.scrollX !== previousWindowScrollX || window.scrollY !== previousWindowScrollY) {
            window.scrollTo(previousWindowScrollX, previousWindowScrollY);
          }
        });
      });

      grid.appendChild(row);
    });

    return grid;
  }

  function renderProductCodeRangePanel() {
    const toolbar = findVisibleProductToolbar();
    const tableWrapper = getProductTableWrapper();
    const shouldShowToolbarStatus = isTargetProductRoute() && isFeatureEnabled('productPreviewEnabled')
      && (PRODUCT_CODE_RANGE_STATE.active || !!PRODUCT_CODE_RANGE_STATE.error);
    const shouldShow = shouldShowToolbarStatus
      && ((PRODUCT_CODE_RANGE_STATE.active && PRODUCT_CODE_RANGE_STATE.enabled) || !!PRODUCT_CODE_RANGE_STATE.error);

    if (!shouldShowToolbarStatus || !toolbar || !tableWrapper) {
      const panel = document.getElementById(PRODUCT_CODE_RANGE_PANEL_ID);
      if (panel) panel.remove();
      setNativeProductTableVisible(true);
      removeProductCodeRangeToolbarStatus();
      LAST_PRODUCT_CODE_RANGE_SIGNATURE = '';
      return;
    }

    let panel = document.getElementById(PRODUCT_CODE_RANGE_PANEL_ID);
    if (!panel) {
      panel = document.createElement('section');
      panel.id = PRODUCT_CODE_RANGE_PANEL_ID;
      tableWrapper.insertAdjacentElement('beforebegin', panel);
    }
    panel.style.margin = '0';
    panel.style.padding = '0';
    panel.style.border = '0';
    panel.style.background = 'transparent';

    const selectionStyleId = 'zweb-product-code-range-selected-style';
    if (!document.getElementById(selectionStyleId)) {
      const style = document.createElement('style');
      style.id = selectionStyleId;
      style.textContent = '.zweb-selected, .zweb-selected * { font-weight: 700 !important; }';
      document.head && document.head.appendChild(style);
    }

    const lowStockColor = resolveProductLowStockColor(toolbar || tableWrapper);
    const theme = getProductCodeRangeTheme(toolbar || tableWrapper);
    const typography = getProductCodeRangeTypography(tableWrapper);
    syncProductCodeRangeToolbarStatus(toolbar, theme, typography);
    const nativeGrid = PRODUCT_CODE_RANGE_STATE.items.length
      ? buildProductCodeRangeGrid(tableWrapper, PRODUCT_CODE_RANGE_STATE.items)
      : null;

    const signature = JSON.stringify({
      active: PRODUCT_CODE_RANGE_STATE.active,
      enabled: PRODUCT_CODE_RANGE_STATE.enabled,
      loading: PRODUCT_CODE_RANGE_STATE.loading,
      start: PRODUCT_CODE_RANGE_STATE.startCode,
      end: PRODUCT_CODE_RANGE_STATE.endCode,
      error: PRODUCT_CODE_RANGE_STATE.error,
      count: PRODUCT_CODE_RANGE_STATE.items.length,
      first: PRODUCT_CODE_RANGE_STATE.items[0] ? PRODUCT_CODE_RANGE_STATE.items[0].sequence : '',
      last: PRODUCT_CODE_RANGE_STATE.items[PRODUCT_CODE_RANGE_STATE.items.length - 1]
        ? PRODUCT_CODE_RANGE_STATE.items[PRODUCT_CODE_RANGE_STATE.items.length - 1].sequence
        : '',
      lowStockColor,
      isDark: theme.isDark,
      bodyFontFamily: typography.bodyFontFamily,
      bodyFontSize: typography.bodyFontSize,
      headerFontFamily: typography.headerFontFamily,
      headerFontSize: typography.headerFontSize,
      gridReady: !!nativeGrid
    });

    setNativeProductTableVisible(!PRODUCT_CODE_RANGE_STATE.enabled);
    if (!shouldShow) {
      if (panel) panel.remove();
      if (signature === LAST_PRODUCT_CODE_RANGE_SIGNATURE) return;
      LAST_PRODUCT_CODE_RANGE_SIGNATURE = signature;
      return;
    }
    if (signature === LAST_PRODUCT_CODE_RANGE_SIGNATURE) return;
    LAST_PRODUCT_CODE_RANGE_SIGNATURE = signature;

    const embeddedBodyStyle = 'color:' + escapeHtml(theme.bodyColor) + ';'
      + (typography.bodyFontFamily ? 'font-family:' + escapeHtml(typography.bodyFontFamily) + ';' : '')
      + (typography.bodyFontSize ? 'font-size:' + escapeHtml(typography.bodyFontSize) + ';' : '')
      + (typography.bodyLineHeight ? 'line-height:' + escapeHtml(typography.bodyLineHeight) + ';' : '')
      + (typography.bodyLetterSpacing ? 'letter-spacing:' + escapeHtml(typography.bodyLetterSpacing) + ';' : '');

    let embeddedBodyMarkup = '';
    if (PRODUCT_CODE_RANGE_STATE.loading) {
      embeddedBodyMarkup = '<div style="min-height:24px;"></div>';
    } else if (PRODUCT_CODE_RANGE_STATE.error) {
      embeddedBodyMarkup = '<div style="margin:8px 0 0;padding:10px 0;font-size:13px;color:' + escapeHtml(theme.errorTextColor) + ';">'
        + escapeHtml(PRODUCT_CODE_RANGE_STATE.error)
        + '</div>';
    } else if (PRODUCT_CODE_RANGE_STATE.items.length) {
      embeddedBodyMarkup = nativeGrid
        ? '<div data-product-code-range-grid-host></div>'
        : '<div style="margin:8px 0 0;padding:10px 0;font-size:13px;color:' + escapeHtml(theme.mutedColor) + ';">Recarregando a grade filtrada...</div>';
    } else {
      embeddedBodyMarkup = '<div style="margin:8px 0 0;padding:10px 0;font-size:13px;color:' + escapeHtml(theme.panelEmptyColor) + ';">Nenhum produto foi encontrado nessa faixa de codigos.</div>';
    }

    panel.innerHTML = [
      '<div style="display:block;margin:0;padding:0;',
      embeddedBodyStyle,
      '">',
      embeddedBodyMarkup,
      '</div>'
    ].join('');

    if (nativeGrid) {
      nativeGrid.style.display = '';
      nativeGrid.style.maxHeight = '';
      nativeGrid.style.overflow = '';
      nativeGrid.style.borderRadius = '';
      nativeGrid.style.marginTop = '';
      const host = panel.querySelector('[data-product-code-range-grid-host]');
      if (host) {
        host.appendChild(nativeGrid);
      }
    }

    Array.from(panel.querySelectorAll('[data-product-code-range-open]')).forEach((element) => {
      element.addEventListener('click', function(event) {
        event.preventDefault();
        event.stopPropagation();
        const code = element.getAttribute('data-product-code-range-open') || '';
        const item = PRODUCT_CODE_RANGE_STATE.items.find((entry) => String(entry && entry.sequence || '') === code);
        if (item) openProductCodeRangeItem(item);
      }, true);
    });
    return;

    const rowsHtml = PRODUCT_CODE_RANGE_STATE.items.map((item) => {
      const quantity = Number(item && item.quantity);
      const minimumQuantity = Number(item && item.minimumQuantity);
      const isLowStock = Number.isFinite(quantity) && Number.isFinite(minimumQuantity) && quantity <= minimumQuantity;
      const rowStyle = isLowStock
        ? ' style="color:' + escapeHtml(lowStockColor) + ';font-weight:700;"'
        : '';
      const code = item && item.sequence != null ? String(item.sequence) : '';
      const openButtonStyle = 'display:block;width:100%;padding:0;border:0;background:none;color:inherit;font:inherit;text-align:left;cursor:pointer;';

      return [
        '<tr' + rowStyle + '>',
        '  <td><button type="button" data-product-code-range-open="' + escapeHtml(code) + '" style="' + openButtonStyle + '">' + escapeHtml(item && item.sequence) + '</button></td>',
        '  <td><button type="button" data-product-code-range-open="' + escapeHtml(code) + '" style="' + openButtonStyle + '">' + escapeHtml(item && item.description) + '</button></td>',
        '  <td style="text-align:right;">' + escapeHtml(formatProductRangeNumber(quantity, 2)) + '</td>',
        '  <td style="text-align:right;">' + escapeHtml(formatProductRangeNumber(minimumQuantity, 0)) + '</td>',
        '  <td style="text-align:right;">' + escapeHtml(formatProductRangeCurrency(item && item.price)) + '</td>',
        '  <td style="text-align:right;">' + escapeHtml(formatProductRangeCurrency(item && item.cost)) + '</td>',
        '  <td>' + escapeHtml(item && item.reference) + '</td>',
        '  <td>' + escapeHtml(item && item.lastSupplierName) + '</td>',
        '</tr>'
      ].join('');
    }).join('');

    const bodyMarkup = PRODUCT_CODE_RANGE_STATE.loading
      ? '<div style="min-height:24px;"></div>'
      : PRODUCT_CODE_RANGE_STATE.error
        ? '<div style="padding:18px 0;font-size:14px;color:' + escapeHtml(theme.errorTextColor) + ';">' + escapeHtml(PRODUCT_CODE_RANGE_STATE.error) + '</div>'
        : PRODUCT_CODE_RANGE_STATE.items.length
          ? nativeGrid
            ? '<div data-product-code-range-grid-host></div>'
            : [
                '<div style="overflow:auto;max-height:calc(100vh - 260px);border:' + escapeHtml(theme.tableBorder) + ';border-radius:14px;background:' + escapeHtml(theme.tableBackground) + ';color:' + escapeHtml(theme.bodyColor) + ';">',
                '  <table style="width:100%;border-collapse:collapse;font-size:13px;color:' + escapeHtml(theme.bodyColor) + ';">',
                '    <thead style="position:sticky;top:0;background:' + escapeHtml(theme.tableHeadBackground) + ';z-index:1;">',
                '      <tr>',
                '        <th style="text-align:left;padding:12px 10px;border-bottom:' + escapeHtml(theme.tableCellBorder) + ';color:' + escapeHtml(theme.titleColor) + ';">Código</th>',
                '        <th style="text-align:left;padding:12px 10px;border-bottom:' + escapeHtml(theme.tableCellBorder) + ';color:' + escapeHtml(theme.titleColor) + ';">Descrição</th>',
                '        <th style="text-align:right;padding:12px 10px;border-bottom:' + escapeHtml(theme.tableCellBorder) + ';color:' + escapeHtml(theme.titleColor) + ';">Quantidade</th>',
                '        <th style="text-align:right;padding:12px 10px;border-bottom:' + escapeHtml(theme.tableCellBorder) + ';color:' + escapeHtml(theme.titleColor) + ';">Qtd. minima</th>',
                '        <th style="text-align:right;padding:12px 10px;border-bottom:' + escapeHtml(theme.tableCellBorder) + ';color:' + escapeHtml(theme.titleColor) + ';">Preco R$</th>',
                '        <th style="text-align:right;padding:12px 10px;border-bottom:' + escapeHtml(theme.tableCellBorder) + ';color:' + escapeHtml(theme.titleColor) + ';">Custo R$</th>',
                '        <th style="text-align:left;padding:12px 10px;border-bottom:' + escapeHtml(theme.tableCellBorder) + ';color:' + escapeHtml(theme.titleColor) + ';">Referencia</th>',
                '        <th style="text-align:left;padding:12px 10px;border-bottom:' + escapeHtml(theme.tableCellBorder) + ';color:' + escapeHtml(theme.titleColor) + ';">Ultimo fornecedor</th>',
                '      </tr>',
                '    </thead>',
                '    <tbody>' + rowsHtml + '</tbody>',
                '  </table>',
                '</div>'
              ].join('')
          : '<div style="padding:18px 0;font-size:14px;color:' + escapeHtml(theme.panelEmptyColor) + ';">Nenhum produto foi encontrado nessa faixa de Códigos.</div>';

    panel.innerHTML = [
      '<div style="display:grid;gap:12px;margin:14px 0 8px;color:' + escapeHtml(theme.bodyColor) + ';'
        + (typography.bodyFontFamily ? 'font-family:' + escapeHtml(typography.bodyFontFamily) + ';' : '')
        + (typography.bodyFontSize ? 'font-size:' + escapeHtml(typography.bodyFontSize) + ';' : '')
        + (typography.bodyLineHeight ? 'line-height:' + escapeHtml(typography.bodyLineHeight) + ';' : '')
        + (typography.bodyLetterSpacing ? 'letter-spacing:' + escapeHtml(typography.bodyLetterSpacing) + ';' : '')
        + '">',
      '  <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:16px;flex-wrap:wrap;padding:14px 16px;border:' + escapeHtml(theme.panelBorder) + ';border-radius:16px;background:' + escapeHtml(theme.panelBackground) + ';box-shadow:' + escapeHtml(theme.panelBoxShadow) + ';">',
      '    <div>',
      '      <strong style="display:block;color:' + escapeHtml(theme.titleColor) + ';'
        + (typography.headerFontFamily ? 'font-family:' + escapeHtml(typography.headerFontFamily) + ';' : '')
        + (typography.headerFontSize ? 'font-size:' + escapeHtml(typography.headerFontSize) + ';' : 'font-size:16px;')
        + (typography.headerLineHeight ? 'line-height:' + escapeHtml(typography.headerLineHeight) + ';' : '')
        + (typography.headerLetterSpacing ? 'letter-spacing:' + escapeHtml(typography.headerLetterSpacing) + ';' : '')
        + '">Filtro de Códigos</strong>',
      '      <span style="display:block;margin-top:4px;font-size:12px;color:' + escapeHtml(theme.mutedColor) + ';">Faixa ativa: <strong>' + escapeHtml(PRODUCT_CODE_RANGE_STATE.startCode || '-') + '</strong> Até <strong>' + escapeHtml(PRODUCT_CODE_RANGE_STATE.endCode || '-') + '</strong>.</span>',
      '      <span style="display:block;margin-top:4px;font-size:12px;color:' + escapeHtml(theme.mutedColor) + ';">' + escapeHtml(PRODUCT_CODE_RANGE_STATE.loading ? '' : (PRODUCT_CODE_RANGE_STATE.items.length + ' produto(s) encontrado(s).')) + '</span>',
      '    </div>',
      '    <div style="display:flex;gap:8px;flex-wrap:wrap;">',
      '      <button type="button" data-product-code-range-edit class="btn btn-sm btn-light" style="background:' + escapeHtml(theme.secondaryButtonBackground) + ';border:' + escapeHtml(theme.secondaryButtonBorder) + ';color:' + escapeHtml(theme.secondaryButtonColor) + ';">Alterar faixa</button>',
      '      <button type="button" data-product-code-range-clear class="btn btn-sm btn-secondary" style="background:transparent;border:0;box-shadow:none;color:' + escapeHtml(theme.secondaryButtonColor) + ';">Limpar filtro</button>',
      '    </div>',
      '  </div>',
      bodyMarkup,
      '</div>'
    ].join('');

    if (nativeGrid) {
      nativeGrid.style.display = '';
      nativeGrid.style.maxHeight = 'calc(100vh - 260px)';
      nativeGrid.style.overflow = 'auto';
      nativeGrid.style.borderRadius = '14px';
      const host = panel.querySelector('[data-product-code-range-grid-host]');
      if (host) {
        host.appendChild(nativeGrid);
      }
    }

    const editButton = panel.querySelector('[data-product-code-range-edit]');
    const clearButton = panel.querySelector('[data-product-code-range-clear]');
    if (editButton) {
      editButton.addEventListener('click', openProductCodeRangeModal);
    }
    if (clearButton) {
      clearButton.addEventListener('click', function() {
        clearProductCodeRangeFilter({ syncNativeClear: true });
      });
    }
    Array.from(panel.querySelectorAll('[data-product-code-range-open]')).forEach((element) => {
      element.addEventListener('click', function(event) {
        event.preventDefault();
        event.stopPropagation();
        const code = element.getAttribute('data-product-code-range-open') || '';
        const item = PRODUCT_CODE_RANGE_STATE.items.find((entry) => String(entry && entry.sequence || '') === code);
        if (item) openProductCodeRangeItem(item);
      }, true);
    });
  }

  function ensureProductCodeRangeModal() {
    if (!document.body) return;
    ensureProductCodeRangeModalStyles();

    if (!document.getElementById(PRODUCT_CODE_RANGE_BACKDROP_ID)) {
      const backdrop = document.createElement('div');
      backdrop.id = PRODUCT_CODE_RANGE_BACKDROP_ID;
      backdrop.className = 'modal-backdrop fade';
      backdrop.style.cssText = [
        'display:none',
        'z-index:999996'
      ].join(';');
      backdrop.addEventListener('click', closeProductCodeRangeModal);
      document.body.appendChild(backdrop);
    }

    if (!document.getElementById(PRODUCT_CODE_RANGE_MODAL_ID)) {
      const modal = document.createElement('div');
      modal.id = PRODUCT_CODE_RANGE_MODAL_ID;
      modal.className = 'modal fade';
      modal.style.cssText = [
        'display:none',
        'position:fixed',
        'inset:0',
        'overflow-x:hidden',
        'overflow-y:auto',
        'z-index:999997',
        'padding-right:0'
      ].join(';');

      modal.innerHTML = [
        '<div class="modal-dialog modal-dialog-centered">',
        '  <div class="modal-content">',
        '    <div class="modal-header">',
        '      <h2 data-product-code-range-title class="fw-semibold fs-6 fw-light text-primary" style="display:block;">Filtrar Códigos</h2>',
        '      <button type="button" data-product-code-range-close class="btn-close" aria-label="Fechar"></button>',
        '    </div>',
        '    <div class="modal-body">',
        '      <form id="' + PRODUCT_CODE_RANGE_FORM_ID + '" style="display:grid;gap:12px;">',
        '        <div data-product-code-range-fields>',
        '          <input name="startCode" type="text" inputmode="numeric" class="form-control" aria-label="Código inicial">',
        '          <span data-product-code-range-body style="font-size:13px;font-weight:600;">Até</span>',
        '          <input name="endCode" type="text" inputmode="numeric" class="form-control" aria-label="Código final">',
        '        </div>',
        '      </form>',
        '      <div data-product-code-range-status style="display:none;"></div>',
        '    </div>',
        '    <div class="modal-footer" style="justify-content:space-between;gap:8px;flex-wrap:wrap;">',
        '      <button type="button" data-product-code-range-clear class="btn btn-transparent btn-sm">Limpar filtro</button>',
        '      <div data-product-code-range-footer-actions>',
        '        <button type="button" data-product-code-range-cancel class="btn btn-transparent btn-sm">Cancelar</button>',
        '        <button type="button" data-product-code-range-apply class="btn btn-primary btn-sm btn-first">Buscar</button>',
        '      </div>',
        '    </div>',
        '  </div>',
        '</div>'
      ].join('');

      modal.querySelector('[data-product-code-range-close]').addEventListener('click', closeProductCodeRangeModal);
      modal.querySelector('[data-product-code-range-cancel]').addEventListener('click', closeProductCodeRangeModal);
      modal.querySelector('[data-product-code-range-clear]').addEventListener('click', function() {
        clearProductCodeRangeFilter({ syncNativeClear: true });
        fillProductCodeRangeForm();
        closeProductCodeRangeModal();
      });
      const applyButton = modal.querySelector('[data-product-code-range-apply]');
      const form = modal.querySelector('#' + PRODUCT_CODE_RANGE_FORM_ID);
      const startInput = form.querySelector('[name="startCode"]');
      const endInput = form.querySelector('[name="endCode"]');
      applyButton.addEventListener('click', applyProductCodeRangeFilter);
      if (startInput && endInput) {
        startInput.addEventListener('keydown', function(event) {
          if (event.key !== 'Enter') return;
          event.preventDefault();
          endInput.focus();
          endInput.select && endInput.select();
        });
        endInput.addEventListener('keydown', function(event) {
          if (event.key !== 'Enter') return;
          event.preventDefault();
          applyButton.click();
        });
      }
      form.addEventListener('submit', function(event) {
        event.preventDefault();
        applyProductCodeRangeFilter();
      });

      document.body.appendChild(modal);
    }

    applyProductCodeRangeModalTheme(document.getElementById(PRODUCT_CODE_RANGE_MODAL_ID));
  }

  function parseJson(raw) {
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch (e) {
      return null;
    }
  }

  function getZwebToken() {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Não foi possível encontrar o token da Zweb nesta sessão.');
    }
    return token;
  }

  async function postZwebJson(url, body) {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        accept: 'application/json',
        'content-type': 'application/json',
        'authorization-compufacil': getZwebToken()
      },
      body: JSON.stringify(body || {})
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
      throw new Error(
        payloadMessage
          ? String(payloadMessage)
          : ('A Zweb retornou ' + response.status + ' ao processar a solicitacao.')
      );
    }

    return payload;
  }

  function resetProductReplicateSupplierState() {
    PRODUCT_REPLICATE_SUPPLIER_RESULTS = [];
    PRODUCT_REPLICATE_SUPPLIER_SELECTED = null;
    PRODUCT_REPLICATE_SUPPLIER_LOADING = false;
    PRODUCT_REPLICATE_SUPPLIER_RUNNING = false;
    PRODUCT_REPLICATE_SUPPLIER_REPORT = null;
    if (PRODUCT_REPLICATE_SUPPLIER_SEARCH_TIMER) {
      clearTimeout(PRODUCT_REPLICATE_SUPPLIER_SEARCH_TIMER);
      PRODUCT_REPLICATE_SUPPLIER_SEARCH_TIMER = 0;
    }
  }

  function createProductReplicateSupplierReport(scopeLabel) {
    PRODUCT_REPLICATE_SUPPLIER_REPORT = {
      scopeLabel: scopeLabel || '',
      total: 0,
      updatedCodes: [],
      failures: [],
      expanded: false,
      finished: false,
      kind: 'info',
      finalMessage: ''
    };
    return PRODUCT_REPLICATE_SUPPLIER_REPORT;
  }

  function getProductReplicateSupplierReport() {
    if (!PRODUCT_REPLICATE_SUPPLIER_REPORT) {
      return createProductReplicateSupplierReport('');
    }
    return PRODUCT_REPLICATE_SUPPLIER_REPORT;
  }

  function setProductReplicateSupplierReportTotal(total) {
    const report = getProductReplicateSupplierReport();
    report.total = Math.max(0, Number(total) || 0);
  }

  function addProductReplicateSupplierReportSuccess(code) {
    const report = getProductReplicateSupplierReport();
    const normalizedCode = String(code || '').trim();
    if (!normalizedCode) return;
    report.updatedCodes.push(normalizedCode);
  }

  function addProductReplicateSupplierReportFailure(code, message) {
    const report = getProductReplicateSupplierReport();
    report.failures.push({
      code: String(code || '').trim(),
      message: String(message || '').trim() || 'falha ao salvar'
    });
  }

  function finalizeProductReplicateSupplierReport(kind, finalMessage) {
    const report = getProductReplicateSupplierReport();
    report.finished = true;
    report.kind = kind || 'info';
    report.finalMessage = finalMessage || '';
  }

  function findVisibleProductReplicateModal() {
    return Array.from(document.querySelectorAll('.modal.show, [role="dialog"]')).find((modal) => {
      if (!isVisible(modal)) return false;
      const title = modal.querySelector('.modal-header h1, .modal-header h2, .modal-header h3, .modal-title');
      const titleText = normalizeText(title ? title.textContent : '');
      return titleText.indexOf('replicar alteracoes') !== -1;
    }) || null;
  }

  function getSelectedProductRows() {
    return Array.from(document.querySelectorAll('.table-wrapper.table-wrapper-filter .table-row input[type="checkbox"]:checked'))
      .map((checkbox) => {
        const row = checkbox.closest('.table-row');
        if (!row || row.classList.contains('header')) return null;
        const code = row.querySelector('.cell[data-col="0"] .cell-text');
        const description = row.querySelector('.cell[data-col="1"] .cell-text');
        return {
          row,
          checked: true,
          code: (code && code.textContent || '').trim(),
          description: (description && description.textContent || '').trim()
        };
      })
      .filter(Boolean)
      .filter((item) => item.code);
  }

  function getProductReplicateAllFilteredCheckbox(modal) {
    if (!modal) return null;
    return Array.from(modal.querySelectorAll('input[type="checkbox"]')).find((input) => {
      const container = input.closest('label, .custom-control, .form-group, .row, div');
      const text = normalizeText(container ? container.textContent : '');
      return text.indexOf('replicar para todos os itens filtrados') !== -1;
    }) || null;
  }

  function getCurrentProductSearchTerm() {
    const input = document.querySelector(PRODUCT_TOOLBAR_SEARCH_SELECTOR);
    return (input && input.value || '').trim();
  }

  function normalizeProductPaginatePayload(payload) {
    if (!payload || typeof payload !== 'object') return null;

    const next = JSON.parse(JSON.stringify(payload));
    delete next.page;
    delete next.maxResults;
    return next;
  }

  function buildFallbackProductPaginatePayload() {
    const search = getCurrentProductSearchTerm();
    const payload = {
      sort: {
        key: 'sequence',
        order: 'DESC'
      }
    };

    if (search) payload.search = search;
    return payload;
  }

  function getActiveProductPaginatePayload() {
    return normalizeProductPaginatePayload(LAST_PRODUCT_PAGINATE_REQUEST_PAYLOAD)
      || buildFallbackProductPaginatePayload();
  }

  async function fetchProductPaginateBatch(payload) {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('Não foi possível encontrar o token da Zweb nesta sessão.');

    const response = await fetch(PRODUCT_PAGINATE_API_URL, {
      method: 'POST',
      headers: {
        accept: 'application/json',
        'content-type': 'application/json',
        'authorization-compufacil': token
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error('A consulta de produtos retornou ' + response.status + '.');
    }

    const parsed = await response.json();
    if (Array.isArray(parsed)) return parsed;
    if (parsed && Array.isArray(parsed.data)) return parsed.data;
    return [];
  }

  async function fetchAllFilteredProducts() {
    const basePayload = getActiveProductPaginatePayload();
    const pageSize = PRODUCT_PAGINATE_PAGE_SIZE;
    const collected = [];
    const seenIds = new Set();

    for (let pageNumber = 1; pageNumber <= 250; pageNumber += 1) {
      const batch = await fetchProductPaginateBatch(Object.assign({}, basePayload, {
        page: pageNumber,
        maxResults: pageSize
      }));

      if (!batch.length) break;

      batch.forEach((item) => {
        const key = String(item && (item.id || item.sequence) || '').trim();
        if (!key || seenIds.has(key)) return;
        seenIds.add(key);
        collected.push(item);
      });

      if (batch.length < pageSize) break;
    }

    return collected;
  }

  async function fetchPreferredSupplierOptions(searchTerm) {
    const payload = await postZwebJson(PERSON_API_URL, {
      active: true,
      maxResults: 15,
      isSupplier: true,
      search: (searchTerm || '').trim() || undefined
    });

    if (Array.isArray(payload)) return payload;
    if (payload && Array.isArray(payload.data)) return payload.data;
    return [];
  }

  function setProductReplicateSupplierStatus(modal, text, kind) {
    const status = modal && modal.querySelector('#' + PRODUCT_REPLICATE_SUPPLIER_STATUS_ID);
    if (!status) return;

    if (!text) {
      status.style.display = 'none';
      status.textContent = '';
      return;
    }

    const theme = getExtensionOverlayTheme(modal);
    const error = kind === 'error';
    const success = kind === 'success';

    status.style.display = 'block';
    status.style.marginTop = '10px';
    status.style.padding = '10px 12px';
    status.style.borderRadius = '12px';
    status.style.fontSize = '12px';
    status.style.lineHeight = '1.5';
    status.style.border = error
      ? (theme.isDark ? '1px solid rgba(255, 156, 156, 0.28)' : '1px solid rgba(185, 61, 61, 0.18)')
      : success
        ? (theme.isDark ? '1px solid rgba(126, 231, 135, 0.24)' : '1px solid rgba(36, 155, 77, 0.18)')
        : theme.cardBorder;
    status.style.background = error
      ? (theme.isDark ? 'rgba(122, 37, 37, 0.34)' : 'rgba(185, 61, 61, 0.1)')
      : success
        ? (theme.isDark ? 'rgba(28, 82, 44, 0.44)' : 'rgba(36, 155, 77, 0.1)')
        : theme.cardBackground;
    status.style.color = error
      ? (theme.isDark ? '#ffdede' : '#a53434')
      : success
        ? (theme.isDark ? '#dfffe4' : '#146737')
        : theme.bodyColor;
    status.innerHTML = '';

    const message = document.createElement('div');
    message.textContent = text;
    status.appendChild(message);

    const report = PRODUCT_REPLICATE_SUPPLIER_REPORT;
    const hasDetails = !!(report && report.finished && (report.updatedCodes.length || report.failures.length));
    if (!hasDetails) return;

    const summary = document.createElement('div');
    summary.style.marginTop = '8px';
    summary.style.fontSize = '11px';
    summary.style.opacity = '0.86';
    summary.textContent = [
      report.scopeLabel || '',
      report.total ? ('Encontrados: ' + report.total) : '',
      report.updatedCodes.length ? ('Atualizados: ' + report.updatedCodes.length) : '',
      report.failures.length ? ('Falhas: ' + report.failures.length) : ''
    ].filter(Boolean).join(' | ');
    status.appendChild(summary);

    const actions = document.createElement('div');
    actions.style.display = 'flex';
    actions.style.alignItems = 'center';
    actions.style.justifyContent = 'space-between';
    actions.style.gap = '10px';
    actions.style.marginTop = '8px';
    status.appendChild(actions);

    const toggle = document.createElement('button');
    toggle.type = 'button';
    toggle.textContent = report.expanded ? 'Ocultar detalhes' : 'Mais detalhes';
    toggle.style.display = 'inline-flex';
    toggle.style.alignItems = 'center';
    toggle.style.justifyContent = 'center';
    toggle.style.padding = '6px 10px';
    toggle.style.borderRadius = '10px';
    toggle.style.border = theme.cardBorder;
    toggle.style.background = theme.isDark ? 'rgba(255,255,255,0.05)' : 'rgba(20, 36, 66, 0.05)';
    toggle.style.color = theme.bodyColor;
    toggle.style.cursor = 'pointer';
    toggle.style.fontSize = '12px';
    toggle.addEventListener('click', () => {
      const liveReport = getProductReplicateSupplierReport();
      liveReport.expanded = !liveReport.expanded;
      setProductReplicateSupplierStatus(modal, text, kind);
    });
    actions.appendChild(toggle);

    if (!report.expanded) return;

    const details = document.createElement('div');
    details.style.marginTop = '10px';
    details.style.padding = '10px 12px';
    details.style.borderRadius = '12px';
    details.style.border = theme.cardBorder;
    details.style.background = theme.isDark ? 'rgba(255,255,255,0.04)' : 'rgba(20, 36, 66, 0.03)';
    details.style.maxHeight = '220px';
    details.style.overflow = 'auto';
    details.style.fontSize = '12px';
    details.style.lineHeight = '1.5';

    if (report.updatedCodes.length) {
      const updatedTitle = document.createElement('div');
      updatedTitle.style.fontWeight = '600';
      updatedTitle.style.marginBottom = '6px';
      updatedTitle.textContent = 'Atualizados';
      details.appendChild(updatedTitle);

      const updatedText = document.createElement('div');
      updatedText.style.marginBottom = report.failures.length ? '10px' : '0';
      updatedText.textContent = report.updatedCodes.join(', ');
      details.appendChild(updatedText);
    }

    if (report.failures.length) {
      const failuresTitle = document.createElement('div');
      failuresTitle.style.fontWeight = '600';
      failuresTitle.style.marginBottom = '6px';
      failuresTitle.textContent = 'Falhas';
      details.appendChild(failuresTitle);

      const failuresList = document.createElement('ul');
      failuresList.style.margin = '0';
      failuresList.style.paddingLeft = '18px';
      report.failures.forEach((item) => {
        const li = document.createElement('li');
        li.textContent = (item.code || 'sem codigo') + ': ' + item.message;
        failuresList.appendChild(li);
      });
      details.appendChild(failuresList);
    }

    status.appendChild(details);
  }

  function setProductReplicateSupplierBusy(modal, text) {
    if (!modal) return;

    const host = document.body || document.documentElement;
    let overlay = host && host.querySelector('#' + PRODUCT_REPLICATE_SUPPLIER_BUSY_ID);
    const theme = getExtensionOverlayTheme(modal);
    const report = PRODUCT_REPLICATE_SUPPLIER_REPORT;

    if (!text && !(report && report.finished)) {
      if (overlay) overlay.remove();
      return;
    }

    if (!overlay) {
      overlay = document.createElement('div');
      overlay.id = PRODUCT_REPLICATE_SUPPLIER_BUSY_ID;
      overlay.innerHTML = [
        '<div data-zweb-product-replicate-busy-card>',
        '  <div data-zweb-product-replicate-busy-head>',
        '    <div data-zweb-product-replicate-busy-spinner aria-hidden="true"></div>',
        '    <div data-zweb-product-replicate-busy-copy>',
        '      <div data-zweb-product-replicate-busy-title></div>',
        '      <div data-zweb-product-replicate-busy-text></div>',
        '    </div>',
        '  </div>',
        '  <div data-zweb-product-replicate-busy-summary></div>',
        '  <div data-zweb-product-replicate-busy-actions>',
        '    <button type="button" data-zweb-product-replicate-busy-toggle>Mais detalhes</button>',
        '    <button type="button" data-zweb-product-replicate-busy-close>Fechar</button>',
        '  </div>',
        '  <div data-zweb-product-replicate-busy-details></div>',
        '</div>'
      ].join('');
      host.appendChild(overlay);
    }

    overlay.style.position = 'fixed';
    overlay.style.inset = '0';
    overlay.style.display = 'flex';
    overlay.style.alignItems = 'center';
    overlay.style.justifyContent = 'center';
    overlay.style.padding = '24px';
    overlay.style.background = theme.isDark ? 'rgba(10, 14, 22, 0.66)' : 'rgba(248, 250, 252, 0.72)';
    overlay.style.backdropFilter = 'blur(2px)';
    overlay.style.zIndex = '40';

    const card = overlay.querySelector('[data-zweb-product-replicate-busy-card]');
    const head = overlay.querySelector('[data-zweb-product-replicate-busy-head]');
    const spinner = overlay.querySelector('[data-zweb-product-replicate-busy-spinner]');
    const titleNode = overlay.querySelector('[data-zweb-product-replicate-busy-title]');
    const textNode = overlay.querySelector('[data-zweb-product-replicate-busy-text]');
    const summaryNode = overlay.querySelector('[data-zweb-product-replicate-busy-summary]');
    const actionsNode = overlay.querySelector('[data-zweb-product-replicate-busy-actions]');
    const toggleButton = overlay.querySelector('[data-zweb-product-replicate-busy-toggle]');
    const closeButton = overlay.querySelector('[data-zweb-product-replicate-busy-close]');
    const detailsNode = overlay.querySelector('[data-zweb-product-replicate-busy-details]');
    const isFinished = !!(report && report.finished);
    const hasDetails = !!(report && (report.updatedCodes.length || report.failures.length));
    const summaryParts = [];
    const overlayTitle = isFinished
      ? (report.kind === 'error' ? 'Replicação concluída com falhas' : 'Replicação concluída')
      : 'Processando replicação';

    if (card) {
      card.style.minWidth = '260px';
      card.style.maxWidth = '420px';
      card.style.display = 'flex';
      card.style.flexDirection = 'column';
      card.style.alignItems = 'stretch';
      card.style.gap = '12px';
      card.style.padding = '14px 16px';
      card.style.borderRadius = '14px';
      card.style.border = theme.cardBorder;
      card.style.background = theme.cardBackground;
      card.style.boxShadow = theme.shadow;
      card.style.color = theme.bodyColor;
      card.style.fontSize = '13px';
      card.style.lineHeight = '1.45';
    }

    if (head) {
      head.style.display = 'flex';
      head.style.alignItems = 'center';
      head.style.gap = '12px';
    }

    if (spinner) {
      spinner.style.width = '18px';
      spinner.style.height = '18px';
      spinner.style.flex = '0 0 18px';
      spinner.style.borderRadius = '999px';
      spinner.style.border = theme.isDark ? '2px solid rgba(255,255,255,0.18)' : '2px solid rgba(18,33,58,0.16)';
      spinner.style.borderTopColor = report && report.kind === 'error'
        ? (theme.isDark ? '#ffb7b7' : '#b93d3d')
        : (theme.isDark ? '#9fc3ff' : '#2e66c3');
      spinner.style.animation = isFinished ? 'none' : 'zweb-product-replicate-spin 0.9s linear infinite';
      spinner.style.opacity = isFinished ? '0.7' : '1';
    }

    if (titleNode) {
      titleNode.textContent = overlayTitle;
      titleNode.style.fontSize = '13px';
      titleNode.style.fontWeight = '600';
    }

    if (textNode) {
      textNode.textContent = text || (report && report.finalMessage) || '';
      textNode.style.opacity = '0.92';
    }

    if (summaryNode) {
      summaryNode.style.display = hasDetails ? 'block' : 'none';
      summaryNode.style.fontSize = '12px';
      summaryNode.style.opacity = '0.88';
      if (report) {
        if (report.scopeLabel) summaryParts.push(report.scopeLabel);
        if (report.total) summaryParts.push('Encontrados: ' + report.total);
        if (report.updatedCodes.length) summaryParts.push('Atualizados: ' + report.updatedCodes.length);
        if (report.failures.length) summaryParts.push('Falhas: ' + report.failures.length);
      }
      summaryNode.textContent = summaryParts.join(' | ');
    }

    if (actionsNode) {
      actionsNode.style.display = hasDetails || isFinished ? 'flex' : 'none';
      actionsNode.style.alignItems = 'center';
      actionsNode.style.justifyContent = 'space-between';
      actionsNode.style.gap = '10px';
    }

    if (toggleButton) {
      toggleButton.style.display = hasDetails ? 'inline-flex' : 'none';
      toggleButton.style.alignItems = 'center';
      toggleButton.style.justifyContent = 'center';
      toggleButton.style.padding = '6px 10px';
      toggleButton.style.borderRadius = '10px';
      toggleButton.style.border = theme.cardBorder;
      toggleButton.style.background = theme.isDark ? 'rgba(255,255,255,0.05)' : 'rgba(20, 36, 66, 0.05)';
      toggleButton.style.color = theme.bodyColor;
      toggleButton.style.cursor = 'pointer';
      toggleButton.style.fontSize = '12px';
      toggleButton.textContent = report && report.expanded ? 'Ocultar detalhes' : 'Mais detalhes';
      toggleButton.onclick = () => {
        const currentReport = getProductReplicateSupplierReport();
        currentReport.expanded = !currentReport.expanded;
        setProductReplicateSupplierBusy(modal, text || currentReport.finalMessage || '');
      };
    }

    if (closeButton) {
      closeButton.style.display = isFinished ? 'inline-flex' : 'none';
      closeButton.style.alignItems = 'center';
      closeButton.style.justifyContent = 'center';
      closeButton.style.padding = '6px 10px';
      closeButton.style.borderRadius = '10px';
      closeButton.style.border = report && report.kind === 'error'
        ? (theme.isDark ? '1px solid rgba(255, 156, 156, 0.28)' : '1px solid rgba(185, 61, 61, 0.18)')
        : theme.cardBorder;
      closeButton.style.background = report && report.kind === 'error'
        ? (theme.isDark ? 'rgba(122, 37, 37, 0.24)' : 'rgba(185, 61, 61, 0.08)')
        : (theme.isDark ? 'rgba(255,255,255,0.05)' : 'rgba(20, 36, 66, 0.05)');
      closeButton.style.color = theme.bodyColor;
      closeButton.style.cursor = 'pointer';
      closeButton.style.fontSize = '12px';
      closeButton.onclick = () => {
        overlay.remove();
      };
    }

    if (detailsNode) {
      detailsNode.style.display = hasDetails && report && report.expanded ? 'block' : 'none';
      detailsNode.style.maxHeight = '240px';
      detailsNode.style.overflow = 'auto';
      detailsNode.style.padding = report && report.expanded ? '10px 12px' : '0';
      detailsNode.style.borderRadius = '12px';
      detailsNode.style.border = report && report.expanded ? theme.cardBorder : '0';
      detailsNode.style.background = report && report.expanded
        ? (theme.isDark ? 'rgba(255,255,255,0.04)' : 'rgba(20, 36, 66, 0.03)')
        : 'transparent';
      detailsNode.style.fontSize = '12px';
      detailsNode.style.lineHeight = '1.5';
      if (hasDetails && report && report.expanded) {
        const updatedHtml = report.updatedCodes.length
          ? [
            '<div style="font-weight:600;margin-bottom:6px;">Atualizados</div>',
            '<div style="margin-bottom:10px;">' + escapeHtml(report.updatedCodes.join(', ')) + '</div>'
          ].join('')
          : '';
        const failuresHtml = report.failures.length
          ? [
            '<div style="font-weight:600;margin-bottom:6px;">Falhas</div>',
            '<ul style="margin:0;padding-left:18px;">',
            report.failures.map((item) => '<li><strong>' + escapeHtml(item.code || 'sem codigo') + '</strong>: ' + escapeHtml(item.message) + '</li>').join(''),
            '</ul>'
          ].join('')
          : '';
        detailsNode.innerHTML = updatedHtml + failuresHtml;
      } else {
        detailsNode.innerHTML = '';
      }
    }

    let style = document.getElementById('zweb-product-replicate-busy-style');
    if (!style) {
      style = document.createElement('style');
      style.id = 'zweb-product-replicate-busy-style';
      style.textContent = '@keyframes zweb-product-replicate-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }';
      (document.head || document.documentElement).appendChild(style);
    }
  }

  function getProductReplicateSupplierUi(modal) {
    const body = modal && modal.querySelector('.modal-body');
    const primaryRow = body && body.querySelector('.row');
    const typeInput = body && body.querySelector('input[id="form.type"]');
    const typeSelect = typeInput && typeInput.closest('.multiselect');
    const typeList = body && body.querySelector('ul[id="listbox-form.type"]');
    const typeListWrapper = typeList && typeList.closest('.multiselect__content-wrapper');
    const typeSingle = typeSelect && typeSelect.querySelector('.multiselect__single');
    const typePlaceholder = typeSelect && typeSelect.querySelector('.multiselect__placeholder');
    const valueColumn = primaryRow && Array.from(primaryRow.children).find((column) => column.classList && column.classList.contains('col-md-7'));
    const editorRow = valueColumn && valueColumn.querySelector('.row');
    const editorHost = editorRow && Array.from(editorRow.children).find((column) => column.classList && column.classList.contains('col-md-12'));
    const saveButton = Array.from(modal.querySelectorAll('.modal-footer button, .modal-footer .btn')).find((button) => {
      return normalizeText(button.textContent || '').indexOf('salvar') !== -1;
    }) || null;

    return {
      body,
      typeInput,
      typeSelect,
      typeList,
      typeListWrapper,
      typeSingle,
      typePlaceholder,
      editorHost,
      saveButton
    };
  }

  function isProductPreferredSupplierMode(modal) {
    return !!(modal && modal.getAttribute(PRODUCT_REPLICATE_SUPPLIER_MODE_ATTR) === 'true');
  }

  function removeProductPreferredSupplierStandaloneSection(modal) {
    const section = document.getElementById(PRODUCT_REPLICATE_SUPPLIER_SECTION_ID);
    if (!section) return;
    const ui = getProductReplicateSupplierUi(modal);
    if (!ui.editorHost || !ui.editorHost.contains(section)) {
      section.remove();
    }
  }

  function restoreProductPreferredSupplierEditor(modal) {
    const ui = getProductReplicateSupplierUi(modal);
    if (ui.editorHost) {
      const editor = ui.editorHost.querySelector('#' + PRODUCT_REPLICATE_SUPPLIER_SECTION_ID);
      if (editor) editor.remove();
      Array.from(ui.editorHost.children).forEach((child) => {
        if (!child.hasAttribute(PRODUCT_REPLICATE_SUPPLIER_NATIVE_HIDDEN_ATTR)) return;
        child.style.display = '';
        child.removeAttribute(PRODUCT_REPLICATE_SUPPLIER_NATIVE_HIDDEN_ATTR);
      });
    }

    const previousLabel = modal && modal.getAttribute(PRODUCT_REPLICATE_SUPPLIER_PREVIOUS_LABEL_ATTR);
    if (ui.typeSingle && previousLabel) {
      ui.typeSingle.textContent = previousLabel;
    }
    if (ui.typePlaceholder) {
      ui.typePlaceholder.style.display = '';
    }
  }

  function syncProductPreferredSupplierTypeDisplay(modal) {
    const ui = getProductReplicateSupplierUi(modal);
    if (!ui.typeSelect) return;

    if (isProductPreferredSupplierMode(modal)) {
      if (ui.typeSingle) {
        ui.typeSingle.textContent = 'Fornecedor preferencial';
        ui.typeSingle.style.display = '';
      }
      if (ui.typePlaceholder) {
        ui.typePlaceholder.style.display = 'none';
      }
    } else {
      const previousLabel = modal && modal.getAttribute(PRODUCT_REPLICATE_SUPPLIER_PREVIOUS_LABEL_ATTR);
      if (ui.typeSingle && previousLabel) {
        ui.typeSingle.textContent = previousLabel;
      }
      if (ui.typePlaceholder) {
        ui.typePlaceholder.style.display = '';
      }
    }
  }

  function setProductPreferredSupplierMode(modal, active) {
    if (!modal) return;
    if (active) {
      modal.setAttribute(PRODUCT_REPLICATE_SUPPLIER_MODE_ATTR, 'true');
      syncProductPreferredSupplierTypeDisplay(modal);
    } else {
      restoreProductPreferredSupplierEditor(modal);
      modal.removeAttribute(PRODUCT_REPLICATE_SUPPLIER_MODE_ATTR);
      modal.removeAttribute(PRODUCT_REPLICATE_SUPPLIER_PREVIOUS_LABEL_ATTR);
    }
  }

  function applyProductReplicateSupplierTheme(section, modal) {
    if (!section) return;

    const controlHeight = Math.max(36, Number(section.getAttribute('data-zweb-native-height') || 36));
    section.style.marginTop = '0';
    section.style.padding = '0';
    section.style.background = 'transparent';
    section.style.border = '0';
    Array.from(section.querySelectorAll('[data-product-replicate-supplier-shell]')).forEach((shell) => {
      shell.style.width = '100%';
    });
    Array.from(section.querySelectorAll('[data-product-replicate-supplier-multiselect]')).forEach((multiselect) => {
      multiselect.style.minHeight = controlHeight + 'px';
    });
    Array.from(section.querySelectorAll('input.multiselect__input')).forEach((input) => {
      input.style.width = '100%';
      input.style.position = 'static';
      input.style.padding = '0';
      input.style.minHeight = controlHeight + 'px';
      input.style.height = controlHeight + 'px';
    });
    Array.from(section.querySelectorAll('[data-product-replicate-supplier-results]')).forEach((element) => {
      element.style.maxHeight = '220px';
      element.style.overflow = 'auto';
    });
    Array.from(section.querySelectorAll('[data-product-replicate-supplier-index] .multiselect__option')).forEach((option) => {
      option.style.display = 'block';
    });
    Array.from(section.querySelectorAll('[data-product-replicate-supplier-index]')).forEach((item) => {
      const option = item.querySelector('.multiselect__option');
      if (!option) return;
      option.classList.toggle('multiselect__option--highlight', item.hasAttribute('data-selected'));
    });
  }

  function ensureProductPreferredSupplierEditor(modal) {
    const ui = getProductReplicateSupplierUi(modal);
    if (!ui.editorHost) return null;

    if (!isProductPreferredSupplierMode(modal)) {
      restoreProductPreferredSupplierEditor(modal);
      return null;
    }

    const nativeSelect = ui.editorHost.querySelector('.z-select');
    const nativeHeight = nativeSelect ? Math.round(nativeSelect.getBoundingClientRect().height || 0) : 0;

    Array.from(ui.editorHost.children).forEach((child) => {
      if (child.id === PRODUCT_REPLICATE_SUPPLIER_SECTION_ID) return;
      child.style.display = 'none';
      child.setAttribute(PRODUCT_REPLICATE_SUPPLIER_NATIVE_HIDDEN_ATTR, 'true');
    });

    let section = ui.editorHost.querySelector('#' + PRODUCT_REPLICATE_SUPPLIER_SECTION_ID);
    if (!section) {
      section = document.createElement('div');
      section.id = PRODUCT_REPLICATE_SUPPLIER_SECTION_ID;
      section.innerHTML = [
        '<label for="' + PRODUCT_REPLICATE_SUPPLIER_SEARCH_ID + '" class="z-label-select mb-2" data-product-replicate-supplier-title>Fornecedor preferencial</label>',
        '<div class="z-select" data-product-replicate-supplier-shell>',
        '  <div tabindex="-1" class="multiselect" data-product-replicate-supplier-multiselect role="button" aria-expanded="false" aria-owns="listbox-' + PRODUCT_REPLICATE_SUPPLIER_SEARCH_ID + '">',
        '    <div class="multiselect__select"></div>',
        '    <div class="multiselect__tags">',
        '      <div class="multiselect__tags-wrap" style="display:none;"></div>',
        '      <div class="multiselect__spinner" style="display:none;"></div>',
        '      <input id="' + PRODUCT_REPLICATE_SUPPLIER_SEARCH_ID + '" type="text" autocomplete="off" spellcheck="false" placeholder="" aria-label="-searchbox" class="multiselect__input" aria-controls="listbox-' + PRODUCT_REPLICATE_SUPPLIER_SEARCH_ID + '">',
        '    </div>',
        '    <div id="' + PRODUCT_REPLICATE_SUPPLIER_RESULTS_ID + '" class="multiselect__content-wrapper" data-product-replicate-supplier-results tabindex="-1" style="display:none;">',
        '      <ul class="multiselect__content" role="listbox" id="listbox-' + PRODUCT_REPLICATE_SUPPLIER_SEARCH_ID + '" aria-multiselectable="false"></ul>',
        '    </div>',
        '  </div>',
        '</div>',
        '<div id="' + PRODUCT_REPLICATE_SUPPLIER_STATUS_ID + '" style="display:none;"></div>'
      ].join('');
      ui.editorHost.appendChild(section);

      const searchInput = section.querySelector('#' + PRODUCT_REPLICATE_SUPPLIER_SEARCH_ID);
      if (searchInput) {
        searchInput.addEventListener('input', () => {
          const selectedName = PRODUCT_REPLICATE_SUPPLIER_SELECTED
            ? normalizeText(PRODUCT_REPLICATE_SUPPLIER_SELECTED.name || PRODUCT_REPLICATE_SUPPLIER_SELECTED.businessName || '')
            : '';
          if (selectedName && normalizeText(searchInput.value || '') !== selectedName) {
            PRODUCT_REPLICATE_SUPPLIER_SELECTED = null;
          }
          scheduleProductReplicateSupplierSearch(modal, searchInput.value || '');
        });
        searchInput.addEventListener('focus', () => {
          renderProductReplicateSupplierResults(modal);
        });
      }
    }

    section.setAttribute('data-zweb-native-height', String(nativeHeight || 36));

    const searchInput = section.querySelector('#' + PRODUCT_REPLICATE_SUPPLIER_SEARCH_ID);
    if (searchInput) {
      searchInput.value = PRODUCT_REPLICATE_SUPPLIER_SELECTED
        ? (PRODUCT_REPLICATE_SUPPLIER_SELECTED.name || PRODUCT_REPLICATE_SUPPLIER_SELECTED.businessName || '')
        : (searchInput.value || '');
    }

    applyProductReplicateSupplierTheme(section, modal);
    return section;
  }

  function renderProductReplicateSupplierResults(modal) {
    if (!modal || !isProductPreferredSupplierMode(modal)) return;

    const section = ensureProductPreferredSupplierEditor(modal);
    const resultsWrapper = modal.querySelector('#' + PRODUCT_REPLICATE_SUPPLIER_RESULTS_ID);
    const results = resultsWrapper && resultsWrapper.querySelector('.multiselect__content');
    const multiselect = section && section.querySelector('[data-product-replicate-supplier-multiselect]');
    const searchInput = modal.querySelector('#' + PRODUCT_REPLICATE_SUPPLIER_SEARCH_ID);
    const searchTerm = (searchInput && searchInput.value || '').trim();
    const selectedName = PRODUCT_REPLICATE_SUPPLIER_SELECTED
      ? normalizeText(PRODUCT_REPLICATE_SUPPLIER_SELECTED.name || PRODUCT_REPLICATE_SUPPLIER_SELECTED.businessName || '')
      : '';
    const normalizedSearchTerm = normalizeText(searchTerm);

    if (!results) return;

    const setDropdownVisible = (visible) => {
      if (resultsWrapper) {
        resultsWrapper.style.display = visible ? 'block' : 'none';
      }
      if (multiselect) {
        multiselect.classList.toggle('multiselect--active', visible);
        multiselect.setAttribute('aria-expanded', visible ? 'true' : 'false');
      }
    };

    if (PRODUCT_REPLICATE_SUPPLIER_LOADING) {
      results.innerHTML = '<li class="multiselect__element"><span class="multiselect__option">Buscando fornecedores...</span></li>';
      setDropdownVisible(true);
      applyProductReplicateSupplierTheme(section, modal);
      return;
    }

    if (!searchTerm) {
      results.innerHTML = '';
      setDropdownVisible(false);
      applyProductReplicateSupplierTheme(section, modal);
      return;
    }

    if (selectedName && normalizedSearchTerm === selectedName && !PRODUCT_REPLICATE_SUPPLIER_RESULTS.length) {
      results.innerHTML = '';
      setDropdownVisible(false);
      applyProductReplicateSupplierTheme(section, modal);
      return;
    }

    if (!PRODUCT_REPLICATE_SUPPLIER_RESULTS.length) {
      results.innerHTML = '<li class="multiselect__element"><span class="multiselect__option">Nenhuma opcao encontrada</span></li>';
      setDropdownVisible(true);
      applyProductReplicateSupplierTheme(section, modal);
      return;
    }

    results.innerHTML = PRODUCT_REPLICATE_SUPPLIER_RESULTS.map((supplier, index) => {
      const selectedClass = PRODUCT_REPLICATE_SUPPLIER_SELECTED && PRODUCT_REPLICATE_SUPPLIER_SELECTED.id === supplier.id
        ? ' data-selected="true"'
        : '';
      const subtitle = [supplier.businessName, supplier.identification].filter(Boolean).join(' | ');
      return [
        '<li class="multiselect__element" data-product-replicate-supplier-index="' + index + '"' + selectedClass + '>',
        '  <span class="multiselect__option" data-select="">',
        '    <span>' + escapeHtml(supplier.name || supplier.businessName || '') + '</span>',
        subtitle ? '    <small style="display:block;opacity:.82;">' + escapeHtml(subtitle) + '</small>' : '',
        '  </span>',
        '</li>'
      ].join('');
    }).join('');

    Array.from(results.querySelectorAll('[data-product-replicate-supplier-index]')).forEach((button) => {
      button.addEventListener('click', () => {
        const index = Number(button.getAttribute('data-product-replicate-supplier-index'));
        PRODUCT_REPLICATE_SUPPLIER_SELECTED = PRODUCT_REPLICATE_SUPPLIER_RESULTS[index] || null;
        if (searchInput && PRODUCT_REPLICATE_SUPPLIER_SELECTED) {
          searchInput.value = PRODUCT_REPLICATE_SUPPLIER_SELECTED.name || '';
        }
        PRODUCT_REPLICATE_SUPPLIER_RESULTS = [];
        PRODUCT_REPLICATE_SUPPLIER_LOADING = false;
        setDropdownVisible(false);
        renderProductReplicateSupplierResults(modal);
        setProductReplicateSupplierStatus(modal, '', '');
      });
    });

    setDropdownVisible(true);
    applyProductReplicateSupplierTheme(section, modal);
  }

  function scheduleProductReplicateSupplierSearch(modal, searchTerm) {
    if (PRODUCT_REPLICATE_SUPPLIER_SEARCH_TIMER) {
      clearTimeout(PRODUCT_REPLICATE_SUPPLIER_SEARCH_TIMER);
      PRODUCT_REPLICATE_SUPPLIER_SEARCH_TIMER = 0;
    }

    const trimmed = (searchTerm || '').trim();
    if (!trimmed) {
      PRODUCT_REPLICATE_SUPPLIER_LOADING = false;
      PRODUCT_REPLICATE_SUPPLIER_RESULTS = [];
      renderProductReplicateSupplierResults(modal);
      setProductReplicateSupplierStatus(modal, '', '');
      return;
    }

    PRODUCT_REPLICATE_SUPPLIER_LOADING = true;
    renderProductReplicateSupplierResults(modal);

    PRODUCT_REPLICATE_SUPPLIER_SEARCH_TIMER = setTimeout(async () => {
      try {
        const results = await fetchPreferredSupplierOptions(trimmed);
        const liveInput = modal.querySelector('#' + PRODUCT_REPLICATE_SUPPLIER_SEARCH_ID);
        if (!liveInput || liveInput.value.trim() !== trimmed) return;
        PRODUCT_REPLICATE_SUPPLIER_RESULTS = results;
        PRODUCT_REPLICATE_SUPPLIER_LOADING = false;
        renderProductReplicateSupplierResults(modal);
        setProductReplicateSupplierStatus(modal, '', '');
      } catch (error) {
        PRODUCT_REPLICATE_SUPPLIER_LOADING = false;
        PRODUCT_REPLICATE_SUPPLIER_RESULTS = [];
        renderProductReplicateSupplierResults(modal);
        setProductReplicateSupplierStatus(modal, error && error.message ? error.message : 'Nao foi possivel consultar os fornecedores.', 'error');
      }
    }, 220);
  }

  async function fetchProductsByCodes(codes) {
    const normalizedCodes = Array.from(new Set((codes || [])
      .map((code) => String(code || '').trim())
      .filter(Boolean)));

    const pageNumbers = new Set();
    normalizedCodes.forEach((code) => {
      const numeric = Number(code);
      if (!Number.isFinite(numeric) || numeric <= 0) return;
      const basePage = Math.max(1, Math.ceil(numeric / PRODUCT_PAGINATE_PAGE_SIZE));
      pageNumbers.add(basePage);
      if (basePage > 1) pageNumbers.add(basePage - 1);
      pageNumbers.add(basePage + 1);
    });

    const batches = await Promise.all(Array.from(pageNumbers).sort((a, b) => a - b).map((pageNumber) => fetchProductCodeRangePage(pageNumber)));
    const wanted = new Set(normalizedCodes);
    const itemsByCode = new Map();

    batches
      .reduce((acc, batch) => acc.concat(batch || []), [])
      .forEach((item) => {
        const code = String(item && item.sequence || '').trim();
        if (!code || !wanted.has(code) || itemsByCode.has(code)) return;
        itemsByCode.set(code, item);
      });

    return normalizedCodes.map((code) => itemsByCode.get(code)).filter(Boolean);
  }

  async function fetchProductById(productId) {
    const payload = await postZwebJson(PRODUCT_GET_API_URL, { id: Number(productId) });
    if (Array.isArray(payload) && payload[0]) return payload[0];
    if (payload && Array.isArray(payload.data) && payload.data[0]) return payload.data[0];
    if (payload && payload.data && typeof payload.data === 'object') return payload.data;
    throw new Error('Nao foi possivel carregar o cadastro do produto ' + productId + '.');
  }

  function normalizeProductPayloadForPersist(product, preferredSupplier) {
    const next = JSON.parse(JSON.stringify(product || {}));
    next.preferredSupplier = preferredSupplier || null;
    if (!Array.isArray(next.priceTables)) next.priceTables = [];

    return next;
  }

  async function persistProductPreferredSupplier(productMeta, preferredSupplier) {
    const product = await fetchProductById(productMeta.id);
    const payload = normalizeProductPayloadForPersist(product, preferredSupplier);
    await postZwebJson(PRODUCT_PUT_API_URL, payload);
  }

  async function applyProductPreferredSupplierReplication(modal) {
    if (PRODUCT_REPLICATE_SUPPLIER_RUNNING) return;
    if (!PRODUCT_REPLICATE_SUPPLIER_SELECTED) {
      setProductReplicateSupplierStatus(modal, 'Selecione um fornecedor para replicar.', 'error');
      return;
    }

    const allFilteredCheckbox = getProductReplicateAllFilteredCheckbox(modal);
    const replicateAllFiltered = !!(allFilteredCheckbox && allFilteredCheckbox.checked);
    const selectedRows = replicateAllFiltered ? [] : getSelectedProductRows();
    if (!replicateAllFiltered && !selectedRows.length) {
      setProductReplicateSupplierStatus(modal, 'Marque pelo menos um produto na grade antes de usar essa opcao.', 'error');
      return;
    }

    createProductReplicateSupplierReport(
      replicateAllFiltered
        ? 'Todos os itens filtrados'
        : ('Itens marcados: ' + selectedRows.length)
    );
    PRODUCT_REPLICATE_SUPPLIER_RUNNING = true;
    renderProductReplicateSupplierResults(modal);
    setProductReplicateSupplierStatus(modal, '', '');
    setProductReplicateSupplierBusy(
      modal,
      replicateAllFiltered
        ? 'Localizando todos os produtos filtrados...'
        : 'Localizando os produtos marcados...'
    );

    try {
      const products = replicateAllFiltered
        ? await fetchAllFilteredProducts()
        : await fetchProductsByCodes(selectedRows.map((item) => item.code));
      const productsByCode = new Map(products.map((item) => [String(item.sequence || '').trim(), item]));
      const orderedProducts = replicateAllFiltered
        ? products
        : selectedRows.map((item) => productsByCode.get(item.code)).filter(Boolean);
      const missing = replicateAllFiltered
        ? []
        : selectedRows.filter((item) => !productsByCode.has(item.code)).map((item) => item.code);
      const failures = [];
      let updatedCount = 0;
      setProductReplicateSupplierReportTotal(orderedProducts.length);

      if (missing.length) {
        missing.forEach((code) => {
          addProductReplicateSupplierReportFailure(code, 'Nao foi possivel localizar o produto na listagem.');
        });
        throw new Error('Nao foi possivel localizar os produtos: ' + missing.join(', ') + '.');
      }

      for (let index = 0; index < orderedProducts.length; index += 1) {
        const product = orderedProducts[index];
        setProductReplicateSupplierBusy(
          modal,
          'Atualizando ' + (index + 1) + ' de ' + orderedProducts.length + ': codigo ' + product.sequence + '.'
        );
        try {
          await persistProductPreferredSupplier(product, PRODUCT_REPLICATE_SUPPLIER_SELECTED);
          updatedCount += 1;
          addProductReplicateSupplierReportSuccess(product.sequence);
        } catch (error) {
          const message = error && error.message ? error.message : 'falha ao salvar';
          addProductReplicateSupplierReportFailure(product.sequence, message);
          failures.push(
            'codigo ' + product.sequence + ': ' + message
          );
        }
      }

      if (failures.length) {
        const finalMessage = (
          (updatedCount ? (updatedCount + ' produto(s) atualizados. ') : '') +
          'Falhas em ' + failures.length + ' produto(s): ' + failures.slice(0, 3).join(' | ') +
          (failures.length > 3 ? ' | ...' : '')
        );
        finalizeProductReplicateSupplierReport('error', finalMessage);
        throw new Error(finalMessage);
      }

      const finalMessage = 'Fornecedor preferencial replicado para ' + updatedCount + ' produto(s).';
      finalizeProductReplicateSupplierReport('success', finalMessage);
      setProductReplicateSupplierStatus(modal, finalMessage, 'success');
    } catch (error) {
      finalizeProductReplicateSupplierReport(
        'error',
        error && error.message ? error.message : 'Nao foi possivel replicar o fornecedor preferencial.'
      );
      setProductReplicateSupplierStatus(
        modal,
        error && error.message ? error.message : 'Nao foi possivel replicar o fornecedor preferencial.',
        'error'
      );
    } finally {
      PRODUCT_REPLICATE_SUPPLIER_RUNNING = false;
      setProductReplicateSupplierBusy(modal, '');
      renderProductReplicateSupplierResults(modal);
    }
  }

  function activateProductPreferredSupplierMode(modal) {
    if (!modal || isProductPreferredSupplierMode(modal)) return;

    const ui = getProductReplicateSupplierUi(modal);
    if (!ui.typeSelect || !ui.editorHost) return;

    if (ui.typeSingle && !modal.hasAttribute(PRODUCT_REPLICATE_SUPPLIER_PREVIOUS_LABEL_ATTR)) {
      modal.setAttribute(PRODUCT_REPLICATE_SUPPLIER_PREVIOUS_LABEL_ATTR, ui.typeSingle.textContent || '');
    }

    modal.setAttribute(PRODUCT_REPLICATE_SUPPLIER_MODE_ATTR, 'true');
    syncProductPreferredSupplierTypeDisplay(modal);
    if (ui.typeInput) {
      ui.typeInput.value = '';
      ui.typeInput.blur();
    }
    if (ui.typeListWrapper) {
      ui.typeListWrapper.style.display = 'none';
    }
    if (ui.typeSelect) {
      ui.typeSelect.setAttribute('aria-expanded', 'false');
      ui.typeSelect.classList.remove('multiselect--active');
    }

    ensureProductPreferredSupplierEditor(modal);
    renderProductReplicateSupplierResults(modal);
  }

  function ensureProductPreferredSupplierTypeOption(modal) {
    const ui = getProductReplicateSupplierUi(modal);
    if (!ui.typeList) return;

    if (!ui.typeList.hasAttribute(PRODUCT_REPLICATE_SUPPLIER_LIST_BOUND_ATTR)) {
      ui.typeList.setAttribute(PRODUCT_REPLICATE_SUPPLIER_LIST_BOUND_ATTR, 'true');
      const handleListInteraction = (event) => {
        const option = event.target && event.target.closest ? event.target.closest('.multiselect__element') : null;
        if (!option || !ui.typeList.contains(option)) return;

        if (option.id === PRODUCT_REPLICATE_SUPPLIER_OPTION_ID) {
          event.preventDefault();
          event.stopPropagation();
          if (typeof event.stopImmediatePropagation === 'function') {
            event.stopImmediatePropagation();
          }
          activateProductPreferredSupplierMode(modal);
          return;
        }

        if (isProductPreferredSupplierMode(modal)) {
          setProductPreferredSupplierMode(modal, false);
        }
      };

      ui.typeList.addEventListener('mousedown', handleListInteraction, true);
      ui.typeList.addEventListener('click', handleListInteraction, true);
    }

    let customOption = ui.typeList.querySelector('#' + PRODUCT_REPLICATE_SUPPLIER_OPTION_ID);
    if (!customOption) {
      customOption = document.createElement('li');
      customOption.id = PRODUCT_REPLICATE_SUPPLIER_OPTION_ID;
      customOption.className = 'multiselect__element';
      customOption.setAttribute('role', 'option');
      customOption.innerHTML = '<span class="multiselect__option" data-select=""><span>Fornecedor preferencial</span></span>';
      ui.typeList.appendChild(customOption);
    }

    customOption.setAttribute('aria-selected', isProductPreferredSupplierMode(modal) ? 'true' : 'false');
    const optionButton = customOption.querySelector('.multiselect__option');
    if (optionButton) {
      optionButton.className = isProductPreferredSupplierMode(modal)
        ? 'multiselect__option multiselect__option--highlight'
        : 'multiselect__option';
    }
  }

  function ensureProductPreferredSupplierSaveInterception(modal) {
    const ui = getProductReplicateSupplierUi(modal);
    if (!ui.saveButton || ui.saveButton.hasAttribute(PRODUCT_REPLICATE_SUPPLIER_SAVE_BOUND_ATTR)) return;

    ui.saveButton.setAttribute(PRODUCT_REPLICATE_SUPPLIER_SAVE_BOUND_ATTR, 'true');
    ui.saveButton.addEventListener('click', (event) => {
      const liveModal = findVisibleProductReplicateModal();
      if (!liveModal || !liveModal.contains(ui.saveButton) || !isProductPreferredSupplierMode(liveModal)) return;

      event.preventDefault();
      event.stopPropagation();
      if (typeof event.stopImmediatePropagation === 'function') {
        event.stopImmediatePropagation();
      }
      applyProductPreferredSupplierReplication(liveModal).catch(() => {});
    }, true);
  }

  function ensureProductPreferredSupplierReplicateUi() {
    const modal = findVisibleProductReplicateModal();
    const existing = document.getElementById(PRODUCT_REPLICATE_SUPPLIER_SECTION_ID);

    if (!isTargetProductRoute() || !isFeatureEnabled('productPreferredSupplierBulkEnabled')) {
      if (modal) {
        setProductPreferredSupplierMode(modal, false);
      } else if (existing) {
        existing.remove();
      }
      removeProductPreferredSupplierStandaloneSection(modal);
      resetProductReplicateSupplierState();
      return;
    }

    if (!modal) {
      if (existing) existing.remove();
      return;
    }

    removeProductPreferredSupplierStandaloneSection(modal);
    ensureProductPreferredSupplierTypeOption(modal);
    ensureProductPreferredSupplierSaveInterception(modal);

    if (isProductPreferredSupplierMode(modal)) {
      syncProductPreferredSupplierTypeDisplay(modal);
      ensureProductPreferredSupplierEditor(modal);
      renderProductReplicateSupplierResults(modal);
    } else {
      restoreProductPreferredSupplierEditor(modal);
    }
  }

  function dedupeTextList(values) {
    const seen = new Set();
    const result = [];

    values.forEach(value => {
      const text = (value || '').trim();
      const key = normalizeText(text);
      if (!text || !key || seen.has(key)) return;
      seen.add(key);
      result.push(text);
    });

    return result;
  }

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function getNfeContextMenuPopup() {
    const popup = document.getElementById(NFE_CONTEXT_MENU_ID);
    return popup && isVisible(popup) ? popup : null;
  }

  function ensureNfeContextMenuStyle() {
    if (!isTargetNfeRoute()) return;
    if (document.getElementById(NFE_CONTEXT_MENU_STYLE_ID)) return;

    const style = document.createElement('style');
    style.id = NFE_CONTEXT_MENU_STYLE_ID;
    style.textContent = [
      '#' + NFE_CONTEXT_MENU_ID + ' {',
      '  overflow: visible !important;',
      '}',
      '#' + NFE_CONTEXT_MENU_ID + ' > ul.dropdown-menu,',
      '#' + NFE_CONTEXT_MENU_ID + ' .dropdown-menu {',
      '  max-height: ' + NFE_CONTEXT_MENU_MAX_HEIGHT_VH + 'vh !important;',
      '  overflow-y: auto !important;',
      '  overflow-x: hidden !important;',
      '  overscroll-behavior: contain !important;',
      '}'
    ].join('\n');

    (document.head || document.documentElement || document.body).appendChild(style);
  }

  function findActiveNfeActionRow() {
    const markedRows = Array.from(document.querySelectorAll('.table-row.marked-row'))
      .filter((row) => !row.classList.contains('header') && isVisible(row));

    if (markedRows.length) return markedRows[markedRows.length - 1];

    const checkedRows = Array.from(document.querySelectorAll('.table-row input[type="checkbox"]:checked'))
      .map((input) => input.closest('.table-row'))
      .filter((row) => row && !row.classList.contains('header') && isVisible(row));

    return checkedRows.length ? checkedRows[checkedRows.length - 1] : null;
  }

  function findNfeContextMenuRow(target) {
    if (!target) return null;
    if (target.closest) {
      const row = target.closest('.table-row');
      if (row && !row.classList.contains('header')) return row;
    }

    let el = target;
    while (el) {
      if (el.classList && el.classList.contains('table-row') && !el.classList.contains('header')) {
        return el;
      }
      el = el.parentElement;
    }

    return null;
  }

  function rememberNfeContextMenuAnchor(event) {
    if (!isTargetNfeRoute()) return;
    const row = findNfeContextMenuRow(event && event.target);
    if (!row) return;

    const rect = row.getBoundingClientRect();
    LAST_NFE_CONTEXT_MENU_ANCHOR = {
      x: Math.round(event.clientX || rect.left || 0),
      y: Math.round(event.clientY || rect.top || 0),
      rowTop: Math.round(rect.top || 0),
      rowBottom: Math.round(rect.bottom || 0),
      rowHeight: Math.round(rect.height || 0),
      at: Date.now()
    };

    scheduleNfeContextMenuPopupPosition();
  }

  function rememberNfeContextMenuAnchorFromMouse(event) {
    if (!event || event.button !== 2) return;
    rememberNfeContextMenuAnchor(event);
  }

  function scheduleNfeContextMenuPopupPosition() {
    [0, 40, 120, 240, 420, 700].forEach((delayMs) => {
      setTimeout(positionNfeContextMenuPopup, delayMs);
    });

    requestAnimationFrame(() => {
      requestAnimationFrame(positionNfeContextMenuPopup);
    });
  }

  function positionNfeContextMenuPopup() {
    if (!isTargetNfeRoute()) return;

    const popup = getNfeContextMenuPopup();
    if (!popup) return;

    ensureNfeContextMenuStyle();

    const innerMenu = popup.querySelector(':scope > ul.dropdown-menu, .dropdown-menu');
    if (innerMenu) {
      innerMenu.style.setProperty('max-height', NFE_CONTEXT_MENU_MAX_HEIGHT_VH + 'vh', 'important');
      innerMenu.style.setProperty('overflow-y', 'auto', 'important');
      innerMenu.style.setProperty('overflow-x', 'hidden', 'important');
    }

    popup.style.setProperty('position', 'fixed', 'important');
    popup.style.setProperty('overflow', 'visible', 'important');
    popup.style.setProperty('max-height', 'calc(100vh - ' + (NFE_CONTEXT_MENU_MARGIN_PX * 2) + 'px)', 'important');
    popup.style.setProperty('z-index', '999997', 'important');
    popup.style.setProperty('right', 'auto', 'important');
    popup.style.setProperty('bottom', 'auto', 'important');
    popup.style.setProperty('transform', 'none', 'important');

    const activeRow = findActiveNfeActionRow();
    const activeRect = activeRow ? activeRow.getBoundingClientRect() : null;
    const popupRect = popup.getBoundingClientRect();
    const recentAnchor = LAST_NFE_CONTEXT_MENU_ANCHOR
      && (Date.now() - LAST_NFE_CONTEXT_MENU_ANCHOR.at) <= NFE_CONTEXT_MENU_ANCHOR_TTL_MS
      ? LAST_NFE_CONTEXT_MENU_ANCHOR
      : null;
    const anchor = recentAnchor || {
      x: Math.round(popupRect.left || 0),
      y: Math.round(popupRect.top || 0),
      rowTop: activeRect ? Math.round(activeRect.top || 0) : Math.round(popupRect.top || 0),
      rowBottom: activeRect ? Math.round(activeRect.bottom || 0) : Math.round(popupRect.bottom || 0),
      rowHeight: activeRect ? Math.round(activeRect.height || 0) : 0,
      at: Date.now()
    };

    if (!recentAnchor && activeRect) {
      anchor.rowTop = Math.round(activeRect.top || 0);
      anchor.rowBottom = Math.round(activeRect.bottom || 0);
      anchor.rowHeight = Math.round(activeRect.height || 0);
    }

    const width = popupRect.width || popup.offsetWidth || 280;
    const height = popupRect.height || popup.offsetHeight || 0;
    const viewportWidth = window.innerWidth || document.documentElement.clientWidth || 0;
    const viewportHeight = window.innerHeight || document.documentElement.clientHeight || 0;
    const maxLeft = Math.max(NFE_CONTEXT_MENU_MARGIN_PX, viewportWidth - width - NFE_CONTEXT_MENU_MARGIN_PX);
    const maxTop = Math.max(NFE_CONTEXT_MENU_MARGIN_PX, viewportHeight - height - NFE_CONTEXT_MENU_MARGIN_PX);
    const currentLeft = Math.round(popupRect.left || anchor.x || 0);
    const desiredLeft = clamp(currentLeft, NFE_CONTEXT_MENU_MARGIN_PX, maxLeft);
    const preferredTop = anchor.rowTop - NFE_CONTEXT_MENU_ROW_GAP_PX;
    const upwardTop = anchor.rowBottom - height + NFE_CONTEXT_MENU_ROW_GAP_PX;
    let desiredTop = preferredTop;

    if (height && (preferredTop + height + NFE_CONTEXT_MENU_MARGIN_PX) > viewportHeight) {
      desiredTop = upwardTop;
    }

    desiredTop = clamp(desiredTop, NFE_CONTEXT_MENU_MARGIN_PX, maxTop);

    popup.style.setProperty('left', desiredLeft + 'px', 'important');
    popup.style.setProperty('top', desiredTop + 'px', 'important');
  }

  function getHiddenNfeActionItems() {
    const routePrefs = ACTION_MENU_PREFS && ACTION_MENU_PREFS.nfe;
    const hidden = routePrefs && Array.isArray(routePrefs.hidden) ? routePrefs.hidden : [];
    return new Set(hidden.map(normalizeText).filter(Boolean));
  }

  function storeActionMenuPrefs(nextPrefs) {
    ACTION_MENU_PREFS = nextPrefs && typeof nextPrefs === 'object' ? nextPrefs : {};
    try {
      chrome.storage.local.set({ [ACTION_MENU_PREFS_STORAGE_KEY]: ACTION_MENU_PREFS });
    } catch (error) {}
  }

  function setHiddenNfeActionItems(hiddenItems) {
    const nextPrefs = Object.assign({}, ACTION_MENU_PREFS || {});
    nextPrefs.nfe = {
      hidden: dedupeTextList(hiddenItems || []).map(normalizeText).filter(Boolean)
    };
    storeActionMenuPrefs(nextPrefs);
  }

  function extractActionMenuItemLabel(item) {
    if (!item) return '';
    const preferred = item.querySelector('.label-item');
    return ((preferred && preferred.textContent) || item.textContent || '').trim();
  }

  function collectNfeActionMenuLabels() {
    const labels = KNOWN_NFE_ACTION_ITEMS.slice();
    const menus = Array.from(document.querySelectorAll(
      '.grid-toolbar.no-print .z-dropdown-menu, #menuId .dropdown-menu, #menuId, .popup .dropdown-menu'
    ));

    menus.forEach((menu) => {
      Array.from(menu.querySelectorAll('li.has-submenu, li')).forEach((item) => {
        const label = extractActionMenuItemLabel(item);
        if (label) labels.push(label);
      });
    });

    const routePrefs = ACTION_MENU_PREFS && ACTION_MENU_PREFS.nfe;
    if (routePrefs && Array.isArray(routePrefs.hidden)) {
      routePrefs.hidden.forEach((item) => labels.push(item));
    }

    return dedupeTextList(labels);
  }

  function getNfeHeaderMap() {
    const headerRow = document.querySelector('.table-wrapper.table-wrapper-filter .table-row.header');
    const map = new Map();
    if (!headerRow) return map;

    Array.from(headerRow.querySelectorAll('.cell')).forEach((cell) => {
      const colIndex = Number(cell.getAttribute('data-col'));
      if (!Number.isFinite(colIndex)) return;
      const label = ((cell.querySelector('.header-text') && cell.querySelector('.header-text').textContent) || cell.textContent || '').trim();
      if (!label) return;
      map.set(colIndex, label);
    });

    return map;
  }

  function findNfeColumnIndex(headerMap, candidates) {
    const normalizedCandidates = (candidates || []).map(normalizeText);
    for (const [index, label] of headerMap.entries()) {
      if (normalizedCandidates.indexOf(normalizeText(label)) !== -1) {
        return index;
      }
    }
    return null;
  }

  function getNfeRowCellText(row, colIndex) {
    if (!row || !Number.isFinite(colIndex)) return '';
    const cell = row.querySelector('.cell[data-col="' + colIndex + '"]');
    if (!cell) return '';
    const preferred = cell.querySelector('.cell-text, .text-truncate, span, a, strong');
    return ((preferred && preferred.textContent) || cell.textContent || '').trim();
  }

  function getSelectedNfeRows() {
    const headerMap = getNfeHeaderMap();
    const documentCol = findNfeColumnIndex(headerMap, ['documento', 'numero', 'número']) ?? 1;
    const customerCol = findNfeColumnIndex(headerMap, ['cliente', 'destinatario', 'emitente']);

    return Array.from(document.querySelectorAll('.table-row input[type="checkbox"]:checked'))
      .map((checkbox) => {
        const row = checkbox.closest('.table-row');
        if (!row || row.classList.contains('header')) return null;
        const documentNumber = getNfeRowCellText(row, documentCol);
        const customerName = Number.isFinite(customerCol) ? getNfeRowCellText(row, customerCol) : '';
        return {
          row,
          checkbox,
          documentNumber,
          customerName
        };
      })
      .filter(Boolean)
      .filter((item) => item.documentNumber);
  }

  function setCheckboxState(checkbox, checked) {
    if (!checkbox || checkbox.checked === checked) return;
    clickLikeUser(checkbox);
    if (checkbox.checked === checked) return;
    if (typeof checkbox.click === 'function') {
      checkbox.click();
    }
    if (checkbox.checked === checked) return;
    checkbox.checked = checked;
    checkbox.dispatchEvent(new Event('input', { bubbles: true }));
    checkbox.dispatchEvent(new Event('change', { bubbles: true }));
  }

  async function setOnlyNfeRowChecked(targetCheckbox, originalCheckboxes) {
    for (let attempt = 0; attempt < 8; attempt += 1) {
      Array.from(document.querySelectorAll('.table-row input[type="checkbox"]:checked')).forEach((checkbox) => {
        if (checkbox === targetCheckbox) return;
        setCheckboxState(checkbox, false);
      });

      setCheckboxState(targetCheckbox, true);
      await delay(attempt === 0 ? 220 : 150);

      const checked = Array.from(document.querySelectorAll('.table-row input[type="checkbox"]:checked'));
      if (checked.length === 1 && checked[0] === targetCheckbox && targetCheckbox.checked) {
        break;
      }
    }

    await delay(260);

    if (Array.isArray(originalCheckboxes)) {
      originalCheckboxes.forEach((checkbox) => {
        if (checkbox === targetCheckbox || !checkbox || !checkbox.isConnected) return;
        checkbox.setAttribute('data-zweb-batch-download-selected', 'true');
      });
    }
  }

  function restoreNfeRowSelection(originalCheckboxes) {
    Array.from(document.querySelectorAll('.table-row input[type="checkbox"]:checked')).forEach((checkbox) => {
      if (!originalCheckboxes || originalCheckboxes.indexOf(checkbox) === -1) {
        setCheckboxState(checkbox, false);
      }
    });

    (originalCheckboxes || []).forEach((checkbox) => {
      if (!checkbox || !checkbox.isConnected) return;
      setCheckboxState(checkbox, true);
      checkbox.removeAttribute('data-zweb-batch-download-selected');
    });
  }

  function getNfeActionMenuContent(menu) {
    if (!menu) return null;

    if (menu.matches && menu.matches('#menuId')) {
      return menu.querySelector(':scope > ul.dropdown-menu, .dropdown-menu') || null;
    }

    const nested = menu.querySelector && menu.querySelector(':scope > ul.dropdown-menu');
    return nested || menu;
  }

  function getOpenNfeActionMenus() {
    const seen = new Set();
    return Array.from(document.querySelectorAll('.grid-toolbar.no-print .z-dropdown-menu, #menuId, #menuId .dropdown-menu'))
      .filter((menu) => menu.classList.contains('show') || isVisible(menu))
      .map(getNfeActionMenuContent)
      .filter((menu) => {
        if (!menu || seen.has(menu)) return false;
        seen.add(menu);
        return true;
      });
  }

  function findOpenNfeActionMenuForButton(actionButton) {
    const openMenus = getOpenNfeActionMenus();
    return openMenus.find((candidate) => {
      if (!candidate) return false;
      const labelledBy = candidate.getAttribute('aria-labelledby');
      return !labelledBy || labelledBy === actionButton.id;
    }) || openMenus[0] || null;
  }

  async function openNfeActionsMenu(forceFresh) {
    const toolbar = findVisibleNfeToolbar();
    if (!toolbar) throw new Error('Nao foi possivel localizar o toolbar da NF-e.');

    const actionButton = Array.from((toolbar.querySelector('.grid-toolbar-hidden-mobile') || toolbar).querySelectorAll('button, a'))
      .find((el) => normalizeText(el.innerText || el.textContent || '') === 'acoes' && isVisible(el));
    if (!actionButton) throw new Error('Nao foi possivel localizar o botao Acoes.');

    const openMenu = findOpenNfeActionMenuForButton(actionButton);
    if (openMenu && !forceFresh) return openMenu;
    if (openMenu && forceFresh) {
      clickLikeUser(actionButton);
      await delay(180);
    }

    for (let attempt = 0; attempt < 3; attempt += 1) {
      clickLikeUser(actionButton);
      if (attempt > 0 && typeof actionButton.click === 'function') {
        actionButton.click();
      }

      for (let tick = 0; tick < 10; tick += 1) {
        await delay(80);
        const menu = findOpenNfeActionMenuForButton(actionButton);
        if (menu) return menu;
      }
    }

    throw new Error('Nao foi possivel abrir o menu Acoes.');
  }

  function findNfeActionMenuItem(menu, label, allowHidden) {
    if (!menu) return null;
    const targets = Array.isArray(label) ? label.map(normalizeText) : [normalizeText(label)];
    const match = Array.from(menu.querySelectorAll('a, button, li'))
      .find((item) => {
        if (targets.indexOf(normalizeText(extractActionMenuItemLabel(item))) === -1) return false;
        return allowHidden ? true : isVisible(item);
      });
    if (!match) return null;
    if (match.matches && match.matches('li')) {
      return match.querySelector('a, button') || match;
    }
    return match;
  }

  function setNfeNativeBatchActionHidden(item, hidden) {
    if (!item) return;
    const target = item.closest('li') || item;
    if (hidden) {
      target.setAttribute(NFE_BATCH_DOWNLOAD_HIDDEN_NATIVE_ATTR, 'true');
      target.style.display = 'none';
      return;
    }
    target.removeAttribute(NFE_BATCH_DOWNLOAD_HIDDEN_NATIVE_ATTR);
    target.style.display = '';
  }

  function restoreNfeBatchDownloadNativeActions() {
    Array.from(document.querySelectorAll('[' + NFE_BATCH_DOWNLOAD_HIDDEN_NATIVE_ATTR + ']')).forEach((item) => {
      item.removeAttribute(NFE_BATCH_DOWNLOAD_HIDDEN_NATIVE_ATTR);
      item.style.display = '';
    });
  }

  function removeLegacyNfeBatchDownloadItems() {
    Array.from(document.querySelectorAll('#menuId > li')).forEach((item) => {
      const label = normalizeText(extractActionMenuItemLabel(item));
      const anchor = item.querySelector('a, button');
      const anchorId = anchor && anchor.id ? anchor.id : '';
      if (
        anchorId === NFE_BATCH_DOWNLOAD_XML_ACTION_ID
        || anchorId === NFE_BATCH_DOWNLOAD_PDF_ACTION_ID
        || label === 'baixar xml'
        || label === 'baixar xmls'
        || label === 'baixar danfe'
        || label === 'baixar pdfs'
      ) {
        item.remove();
      }
    });
  }

  function setNfeBatchDownloadStatus(text, kind) {
    if (!document.body) return;

    let wrap = document.getElementById(NFE_BATCH_DOWNLOAD_STATUS_WRAP_ID);
    if (!wrap) {
      wrap = document.createElement('div');
      wrap.id = NFE_BATCH_DOWNLOAD_STATUS_WRAP_ID;
      wrap.style.cssText = [
        'display:none',
        'position:fixed',
        'bottom:16px',
        'right:16px',
        'z-index:999999',
        'width:min(360px, calc(100vw - 24px))',
        'pointer-events:none'
      ].join(';');
      wrap.innerHTML = '<div id="' + NFE_BATCH_DOWNLOAD_STATUS_ID + '"></div>';
      document.body.appendChild(wrap);
    }

    const status = wrap.querySelector('#' + NFE_BATCH_DOWNLOAD_STATUS_ID);
    if (!status) return;

    clearTimeout(NFE_BATCH_DOWNLOAD_STATUS_TIMER);
    NFE_BATCH_DOWNLOAD_STATUS_TIMER = 0;

    if (!text) {
      wrap.style.display = 'none';
      status.textContent = '';
      return;
    }

    const theme = getExtensionOverlayTheme(document.body);
    const error = kind === 'error';
    const success = kind === 'success';
    const compact = window.innerWidth < 560;

    wrap.style.display = 'block';
    wrap.style.top = 'auto';
    wrap.style.bottom = compact ? '8px' : '16px';
    wrap.style.right = compact ? '8px' : '16px';
    wrap.style.width = compact ? 'calc(100vw - 16px)' : 'min(360px, calc(100vw - 24px))';
    status.style.display = 'block';
    status.style.padding = compact ? '10px 11px' : '11px 13px';
    status.style.borderRadius = '12px';
    status.style.fontSize = '12px';
    status.style.lineHeight = '1.5';
    status.style.border = error
      ? (theme.isDark ? '1px solid rgba(255, 156, 156, 0.28)' : '1px solid rgba(185, 61, 61, 0.18)')
      : success
        ? (theme.isDark ? '1px solid rgba(126, 231, 135, 0.24)' : '1px solid rgba(36, 155, 77, 0.18)')
        : theme.cardBorder;
    status.style.background = error
      ? (theme.isDark ? 'rgba(122, 37, 37, 0.34)' : 'rgba(185, 61, 61, 0.1)')
      : success
        ? (theme.isDark ? 'rgba(28, 82, 44, 0.44)' : 'rgba(36, 155, 77, 0.1)')
        : theme.cardBackground;
    status.style.color = error
      ? (theme.isDark ? '#ffdede' : '#a53434')
      : success
        ? (theme.isDark ? '#dfffe4' : '#146737')
        : theme.bodyColor;
    status.style.boxShadow = theme.isDark
      ? '0 18px 32px rgba(0, 0, 0, 0.34)'
      : '0 12px 26px rgba(12, 30, 55, 0.14)';
    status.textContent = text;
    if (!NFE_BATCH_DOWNLOAD_RUNNING && (error || success)) {
      NFE_BATCH_DOWNLOAD_STATUS_TIMER = window.setTimeout(() => {
        setNfeBatchDownloadStatus('', '');
      }, success ? 4200 : 5200);
    }
  }

  function buildNfeBatchFileNameHint(kind, entry) {
    const documentNumber = String(entry && entry.documentNumber || '').trim();
    if (!documentNumber) return kind === 'pdf' ? 'DANFE.pdf' : 'NFe.xml';
    return kind === 'pdf'
      ? ('DANFE-' + documentNumber + '.pdf')
      : ('NFe-' + documentNumber + '.xml');
  }

  async function runNfeBatchDownload(kind) {
    if (NFE_BATCH_DOWNLOAD_RUNNING) return;

    const selectedEntries = getSelectedNfeRows();
    if (!selectedEntries.length) {
      setNfeBatchDownloadStatus('Marque pelo menos uma NF-e antes de iniciar o download em lote.', 'error');
      return;
    }

    const actionLabels = kind === 'pdf'
      ? ['Visualizar DANFE']
      : ['Gerar XML'];
    const originalCheckboxes = selectedEntries.map((entry) => entry.checkbox).filter(Boolean);
    NFE_BATCH_DOWNLOAD_RUNNING = true;
    setNfeBatchDownloadStatus(
      'Preparando ' + selectedEntries.length + ' download(s) de ' + (kind === 'pdf' ? 'PDF' : 'XML') + '...',
      ''
    );

    try {
      for (let index = 0; index < selectedEntries.length; index += 1) {
        const entry = selectedEntries[index];
        if (!entry.checkbox || !entry.checkbox.isConnected) {
          throw new Error('A linha da NF-e ' + entry.documentNumber + ' nao esta mais visivel na grade.');
        }

        setNfeBatchDownloadStatus(
          'Processando ' + (index + 1) + ' de ' + selectedEntries.length + ': documento ' + entry.documentNumber + '.',
          ''
        );

        await setOnlyNfeRowChecked(entry.checkbox, originalCheckboxes);

        const requestId = ['nfe', kind, Date.now(), index].join('-');
        if (kind === 'pdf') {
          await sendRuntimeMessage({
            type: 'pdf-download-arm',
            requestId,
            fileNameHint: buildNfeBatchFileNameHint(kind, entry)
          });
        } else {
          await sendRuntimeMessage({
            type: 'xml-download-arm',
            requestId,
            fileNameHint: buildNfeBatchFileNameHint(kind, entry)
          });
        }

        let menu = await openNfeActionsMenu(index > 0);
        let actionItem = findNfeActionMenuItem(menu, actionLabels, true);
        if (!actionItem) {
          menu = await openNfeActionsMenu(true);
          actionItem = findNfeActionMenuItem(menu, actionLabels, true);
        }
        if (!actionItem) {
          throw new Error('Nao foi possivel localizar a acao "' + actionLabels[0] + '" no menu.');
        }

        NFE_BATCH_DOWNLOAD_INTERNAL_CLICK = true;
        try {
          if (typeof actionItem.click === 'function') {
            actionItem.click();
          } else {
            clickLikeUser(actionItem);
          }
        } finally {
          await delay(40);
          NFE_BATCH_DOWNLOAD_INTERNAL_CLICK = false;
        }
        await delay(kind === 'pdf' ? 2400 : 1800);
      }

      setNfeBatchDownloadStatus(
        'Downloads em lote iniciados para ' + selectedEntries.length + ' documento(s).',
        'success'
      );
    } catch (error) {
      setNfeBatchDownloadStatus(
        error && error.message ? error.message : 'Nao foi possivel iniciar os downloads em lote.',
        'error'
      );
    } finally {
      restoreNfeRowSelection(originalCheckboxes);
      NFE_BATCH_DOWNLOAD_RUNNING = false;
    }
  }

  function ensureNfeBatchDownloadActionItems() {
    if (!isTargetNfeRoute() || !isFeatureEnabled('nfeBatchDownloadEnabled')) {
      removeNfeBatchDownloadUi();
      return;
    }

    removeLegacyNfeBatchDownloadItems();

    getOpenNfeActionMenus().forEach((menu) => {
      const entries = [
        { id: NFE_BATCH_DOWNLOAD_XML_ACTION_ID, label: 'Baixar XML', kind: 'xml', nativeLabels: ['Gerar XML'], hideNative: true },
        { id: NFE_BATCH_DOWNLOAD_PDF_ACTION_ID, label: 'Baixar DANFE', kind: 'pdf', nativeLabels: ['Visualizar DANFE'], hideNative: false }
      ];

      entries.forEach((entry) => {
        const nativeItem = findNfeActionMenuItem(menu, entry.nativeLabels, true);
        if (entry.hideNative && nativeItem && nativeItem.id !== entry.id) {
          setNfeNativeBatchActionHidden(nativeItem, true);
        }

        let actionItem = menu.querySelector('#' + entry.id);
        if (actionItem) return;

        const listItem = document.createElement('li');
        listItem.className = 'has-submenu';
        listItem.innerHTML = [
          '<a id="' + entry.id + '" role="button" class="dropdown-item flex-container">',
          '  <span class="label-item">' + entry.label + '</span>',
          '</a>'
        ].join('');
        actionItem = listItem.querySelector('a');
        actionItem.addEventListener('click', (event) => {
          event.preventDefault();
          event.stopImmediatePropagation();
          runNfeBatchDownload(entry.kind).catch(() => {});
        }, true);
        menu.appendChild(listItem);
      });
    });
  }

  function toggleActionMenuSeparator(separator, shouldShow) {
    if (!separator) return;
    if (shouldShow) {
      separator.removeAttribute(ACTION_MENU_HIDDEN_SEPARATOR_ATTR);
      separator.style.display = '';
      return;
    }

    separator.setAttribute(ACTION_MENU_HIDDEN_SEPARATOR_ATTR, 'true');
    separator.style.display = 'none';
  }

  function syncActionMenuSeparators(menu) {
    if (!menu) return;

    const children = Array.from(menu.children);
    children.forEach((child) => {
      if (!child.matches || !child.matches('div, hr')) return;
      const isSeparator = child.classList.contains('line') || child.classList.contains('border-top') || child.tagName === 'HR';
      if (!isSeparator) return;

      let prev = child.previousElementSibling;
      while (prev && prev.style.display === 'none') prev = prev.previousElementSibling;

      let next = child.nextElementSibling;
      while (next && next.style.display === 'none') next = next.nextElementSibling;

      toggleActionMenuSeparator(child, !!(prev && next && prev.matches('li') && next.matches('li')));
    });
  }

  function restoreNfeActionMenuItems() {
    const hiddenItems = Array.from(document.querySelectorAll('[' + ACTION_MENU_HIDDEN_ATTR + ']'));
    hiddenItems.forEach((item) => {
      item.removeAttribute(ACTION_MENU_HIDDEN_ATTR);
      item.style.display = '';
    });

    const hiddenSeparators = Array.from(document.querySelectorAll('[' + ACTION_MENU_HIDDEN_SEPARATOR_ATTR + ']'));
    hiddenSeparators.forEach((item) => {
      item.removeAttribute(ACTION_MENU_HIDDEN_SEPARATOR_ATTR);
      item.style.display = '';
    });
  }

  function syncNfeActionMenuItems() {
    if (!isTargetNfeRoute() || !isFeatureEnabled('actionMenuCustomizeEnabled')) {
      restoreNfeActionMenuItems();
      return;
    }

    const hiddenLabels = getHiddenNfeActionItems();
    const menus = Array.from(document.querySelectorAll(
      '.grid-toolbar.no-print .z-dropdown-menu, #menuId .dropdown-menu, #menuId'
    ));

    if (!menus.length) return;

    menus.forEach((menu) => {
      const items = Array.from(menu.querySelectorAll(':scope > li, li.has-submenu, li'));
      items.forEach((item) => {
        const label = normalizeText(extractActionMenuItemLabel(item));
        if (!label) return;

        if (hiddenLabels.has(label)) {
          item.setAttribute(ACTION_MENU_HIDDEN_ATTR, 'true');
          item.style.display = 'none';
        } else {
          item.removeAttribute(ACTION_MENU_HIDDEN_ATTR);
          item.style.display = '';
        }
      });

      syncActionMenuSeparators(menu);
    });
  }

  function findVisibleNfeToolbar() {
    const toolbars = Array.from(document.querySelectorAll('.grid-toolbar.no-print'));
    return toolbars.find((toolbar) => {
      if (!isVisible(toolbar)) return false;
      return !!toolbar.querySelector(PRODUCT_TOOLBAR_SEARCH_SELECTOR);
    }) || null;
  }

  function removeNfeActionCustomizeUi() {
    const button = document.getElementById(NFE_ACTION_CUSTOMIZE_BUTTON_ID);
    const modal = document.getElementById(NFE_ACTION_MODAL_ID);
    const backdrop = document.getElementById(NFE_ACTION_BACKDROP_ID);
    if (button) button.remove();
    if (modal) modal.remove();
    if (backdrop) backdrop.remove();
  }

  function removeNfeBatchDownloadUi() {
    restoreNfeBatchDownloadNativeActions();
    removeLegacyNfeBatchDownloadItems();
    Array.from(document.querySelectorAll('#' + NFE_BATCH_DOWNLOAD_XML_ACTION_ID + ', #' + NFE_BATCH_DOWNLOAD_PDF_ACTION_ID)).forEach((item) => {
      const parent = item.closest('li');
      if (parent) parent.remove();
      else item.remove();
    });
    const statusWrap = document.getElementById(NFE_BATCH_DOWNLOAD_STATUS_WRAP_ID);
    if (statusWrap) statusWrap.remove();
    clearTimeout(NFE_BATCH_DOWNLOAD_STATUS_TIMER);
    NFE_BATCH_DOWNLOAD_STATUS_TIMER = 0;
    NFE_BATCH_DOWNLOAD_RUNNING = false;
  }

  function closeNfeActionCustomizeModal() {
    const modal = document.getElementById(NFE_ACTION_MODAL_ID);
    const backdrop = document.getElementById(NFE_ACTION_BACKDROP_ID);
    if (modal) modal.style.display = 'none';
    if (backdrop) backdrop.style.display = 'none';
  }

  function fillNfeActionCustomizeList() {
    const container = document.getElementById(NFE_ACTION_LIST_ID);
    if (!container) return;

    const theme = getExtensionOverlayTheme(container.closest('#' + NFE_ACTION_MODAL_ID) || container.parentElement || document.body);
    const labels = collectNfeActionMenuLabels();
    const hiddenItems = getHiddenNfeActionItems();
    container.textContent = '';

    labels.forEach((label) => {
      const row = document.createElement('label');
      row.style.cssText = [
        'display:flex',
        'align-items:center',
        'justify-content:space-between',
        'gap:12px',
        'padding:10px 12px',
        'border:' + theme.cardBorder,
        'border-radius:12px',
        'background:' + theme.cardBackground,
        'font-size:13px',
        'cursor:pointer'
      ].join(';');

      const text = document.createElement('span');
      text.textContent = label;
      text.style.color = theme.cardTextColor;

      const input = document.createElement('input');
      input.type = 'checkbox';
      input.checked = !hiddenItems.has(normalizeText(label));
      input.setAttribute('data-action-label', label);
      input.style.accentColor = theme.progressFillColor;

      row.appendChild(text);
      row.appendChild(input);
      container.appendChild(row);
    });
  }

  function saveNfeActionCustomizeSelection() {
    const modal = document.getElementById(NFE_ACTION_MODAL_ID);
    if (!modal) return;

    const inputs = Array.from(modal.querySelectorAll('input[data-action-label]'));
    const hidden = inputs
      .filter((input) => !input.checked)
      .map((input) => input.getAttribute('data-action-label') || '');

    setHiddenNfeActionItems(hidden);
    syncNfeActionMenuItems();
    closeNfeActionCustomizeModal();
  }

  function openNfeActionCustomizeModal() {
    const modal = document.getElementById(NFE_ACTION_MODAL_ID);
    const backdrop = document.getElementById(NFE_ACTION_BACKDROP_ID);
    if (!modal || !backdrop) return;

    fillNfeActionCustomizeList();
    applyNfeActionCustomizeModalTheme(modal);
    backdrop.style.display = 'block';
    modal.style.display = 'block';
  }

  function ensureNfeActionCustomizeModal() {
    if (!document.body) return;

    if (!document.getElementById(NFE_ACTION_BACKDROP_ID)) {
      const backdrop = document.createElement('div');
      backdrop.id = NFE_ACTION_BACKDROP_ID;
      backdrop.style.cssText = [
        'display:none',
        'position:fixed',
        'inset:0',
        'background:rgba(12, 23, 34, 0.38)',
        'z-index:999998'
      ].join(';');
      backdrop.addEventListener('click', closeNfeActionCustomizeModal);
      document.body.appendChild(backdrop);
    }

    if (!document.getElementById(NFE_ACTION_MODAL_ID)) {
      const modal = document.createElement('div');
      modal.id = NFE_ACTION_MODAL_ID;
      modal.style.cssText = [
        'display:none',
        'position:fixed',
        'top:50%',
        'left:50%',
        'transform:translate(-50%, -50%)',
        'width:420px',
        'max-width:calc(100vw - 24px)',
        'max-height:calc(100vh - 24px)',
        'border-radius:16px',
        'padding:16px',
        'z-index:999999',
        'overflow:auto'
      ].join(';');

      modal.innerHTML = [
        '<div data-nfe-action-header>',
        '  <div>',
        '    <strong data-nfe-action-title style="display:block;font-size:16px;">Personalizar A\u00e7\u00f5es</strong>',
        '    <span data-nfe-action-muted style="display:block;margin-top:4px;font-size:12px;">Escolha o que aparece no menu A\u00e7\u00f5es da NF-e, inclusive no clique direito.</span>',
        '  </div>',
        '  <button type="button" data-nfe-action-close data-nfe-action-secondary class="btn btn-sm btn-light">x</button>',
        '</div>',
        '<div data-nfe-action-tools>',
        '  <button type="button" data-nfe-action-all data-nfe-action-secondary class="btn btn-sm btn-light">Marcar tudo</button>',
        '  <button type="button" data-nfe-action-none data-nfe-action-secondary class="btn btn-sm btn-light">Ocultar tudo</button>',
        '</div>',
        '<div id="' + NFE_ACTION_LIST_ID + '" style="display:grid;gap:8px;max-height:380px;overflow:auto;padding-right:2px;"></div>',
        '<div data-nfe-action-footer>',
        '  <button type="button" data-nfe-action-cancel data-nfe-action-subtle class="btn btn-sm btn-transparent">Cancelar</button>',
        '  <button type="button" data-nfe-action-save class="btn btn-sm btn-primary">Salvar</button>',
        '</div>'
      ].join('');

      modal.querySelector('[data-nfe-action-close]').addEventListener('click', closeNfeActionCustomizeModal);
      modal.querySelector('[data-nfe-action-cancel]').addEventListener('click', closeNfeActionCustomizeModal);
      modal.querySelector('[data-nfe-action-save]').addEventListener('click', saveNfeActionCustomizeSelection);
      modal.querySelector('[data-nfe-action-all]').addEventListener('click', () => {
        modal.querySelectorAll('input[data-action-label]').forEach((input) => {
          input.checked = true;
        });
      });
      modal.querySelector('[data-nfe-action-none]').addEventListener('click', () => {
        modal.querySelectorAll('input[data-action-label]').forEach((input) => {
          input.checked = false;
        });
      });

      document.body.appendChild(modal);
    }

    applyNfeActionCustomizeModalTheme(document.getElementById(NFE_ACTION_MODAL_ID));
  }

  function ensureNfeActionCustomizeButton() {
    if (!isTargetNfeRoute() || !isFeatureEnabled('actionMenuCustomizeEnabled')) {
      removeNfeActionCustomizeUi();
      restoreNfeActionMenuItems();
      return;
    }

    const toolbar = findVisibleNfeToolbar();
    if (!toolbar) return;

    ensureNfeActionCustomizeModal();

    const actionsContainer = toolbar.querySelector('.grid-toolbar-hidden-mobile') || toolbar;
    const visibleActionButton = Array.from(actionsContainer.querySelectorAll('button, a')).find((el) => {
      const text = normalizeText(el.innerText || el.textContent || '');
      return text === 'acoes' && isVisible(el);
    });
    const hiddenActionButton = actionsContainer.querySelector('button[id^="z-dropdown-"], .dropdown-button');
    const filterButton = actionsContainer.querySelector('button#grid\\.filter, #grid\\.filter');

    let button = document.getElementById(NFE_ACTION_CUSTOMIZE_BUTTON_ID);
    if (!button) {
      button = document.createElement('button');
      button.id = NFE_ACTION_CUSTOMIZE_BUTTON_ID;
      button.type = 'button';
      button.className = 'btn btn-sm px-3';
      button.textContent = 'Personalizar';
      button.title = 'Escolher itens visiveis do menu Acoes';
      button.style.whiteSpace = 'nowrap';
      button.style.marginRight = '6px';
      button.addEventListener('click', function(event) {
        event.preventDefault();
        event.stopImmediatePropagation();
        openNfeActionCustomizeModal();
      }, true);
    }

    applyNfeActionCustomizeButtonTheme(button, toolbar);

    if (visibleActionButton) {
      if (button.parentElement !== actionsContainer || button.previousElementSibling !== visibleActionButton) {
        visibleActionButton.insertAdjacentElement('afterend', button);
      }
      return;
    }

    if (hiddenActionButton && hiddenActionButton !== button) {
      button.title = 'Escolher itens visiveis do menu Acoes';
    }

    if (filterButton) {
      if (button.parentElement !== actionsContainer || button.nextElementSibling !== filterButton) {
        filterButton.insertAdjacentElement('beforebegin', button);
      }
      return;
    }

    if (button.parentElement !== actionsContainer) {
      actionsContainer.appendChild(button);
    }
  }

  function findVisibleModalByTitle(titleText) {
    return findModalByTitle(titleText, {
      visibleOnly: true
    });
  }

  function isCommissionReportModal(modal) {
    if (!modal || !isVisible(modal)) return false;

    const htmlInput = modal.querySelector('input[type="radio"][value="HTML"]');
    const pdfInput = modal.querySelector('input[type="radio"][value="PDF"]');
    const generateButton = Array.from(modal.querySelectorAll('button'))
      .find((button) => normalizeText(button.innerText || button.textContent || '').indexOf('gerar relatorio') !== -1);

    if (!htmlInput || !pdfInput || !generateButton) return false;

    const title = modal.querySelector('.modal-header h1, .modal-header h2, .modal-header h3, .modal-title');
    const titleText = normalizeText(title ? title.textContent : '');
    if (titleText.indexOf('comisso') !== -1) return true;

    const bodyText = normalizeText(modal.innerText || modal.textContent || '');
    return bodyText.indexOf('comisso') !== -1 || bodyText.indexOf('vendedor') !== -1;
  }

  function findVisibleCommissionReportModal() {
    return Array.from(document.querySelectorAll('.modal.show, [role="dialog"]'))
      .find((modal) => isCommissionReportModal(modal)) || null;
  }

  function syncCommissionReportModal() {
    const modal = findVisibleCommissionReportModal();
    const existingHint = document.getElementById(COMMISSION_REPORT_HINT_ID);

    if (!isFeatureEnabled('commissionReturnsEnabled')) {
      if (existingHint) existingHint.remove();
      return;
    }

    if (!modal) {
      if (existingHint) existingHint.remove();
      return;
    }

    const htmlInput = modal.querySelector('input[type="radio"][value="HTML"]');
    if (htmlInput && !modal.hasAttribute('data-zweb-commission-format-initialized')) {
      modal.setAttribute('data-zweb-commission-format-initialized', 'true');
      if (!htmlInput.checked) {
        htmlInput.click();
      }
    }

    const actionsContainer = modal.querySelector('.modal-footer, .d-flex.justify-content-end, .text-end') || modal;
    let hint = document.getElementById(COMMISSION_REPORT_HINT_ID);
    if (!hint) {
      hint = document.createElement('div');
      hint.id = COMMISSION_REPORT_HINT_ID;
      hint.style.cssText = [
        'margin-top:12px',
        'padding:10px 12px',
        'border:1px solid rgba(22,100,192,0.18)',
        'border-radius:12px',
        'background:rgba(22,100,192,0.08)',
        'color:#18456f',
        'font-size:12px',
        'line-height:1.5'
      ].join(';');
      hint.textContent = 'Para ajustar devoluções automaticamente no relatório de comissões, a extensão usa o formato HTML. Depois você pode imprimir ou salvar em PDF pelo navegador.';
      actionsContainer.insertAdjacentElement('beforebegin', hint);
    }

    hint.style.fontWeight = '600';
    hint.style.transition = 'background .18s ease, color .18s ease, border-color .18s ease';
    if (hint.textContent !== COMMISSION_REPORT_HINT_TEXT) {
      hint.textContent = COMMISSION_REPORT_HINT_TEXT;
    }
    applyCommissionReportHintTheme(hint, modal);
  }

  function getActiveProductColumnsFromStorage() {
    const config = parseJson(localStorage.getItem(PRODUCT_GRID_STORAGE_KEY));
    const headers = config && config.product && Array.isArray(config.product.headers)
      ? config.product.headers
      : [];

    return headers
      .map(header => header && (header.title || header.label || header.field))
      .filter(Boolean);
  }

  function getActiveProductColumnsFromFieldsModal() {
    const modal = findVisibleModalByTitle('Selecione as colunas para exibir');
    if (!modal) return [];

    return Array.from(modal.querySelectorAll('.header-item'))
      .filter(row => {
        const input = row.querySelector('input[type="checkbox"]');
        return !!(input && input.checked);
      })
      .map(row => {
        const name = row.querySelector('.header-name');
        return name ? name.textContent : row.textContent;
      })
      .filter(Boolean);
  }

  function getActiveProductColumnsFromGrid() {
    const headerRow = document.querySelector('.table-wrapper.table-wrapper-filter .table-row.header');
    if (!headerRow) return [];

    const cells = Array.from(headerRow.querySelectorAll('.cell.header-cell .header-text'));
    if (cells.length) {
      return cells.map(cell => cell.textContent).filter(Boolean);
    }

    return Array.from(headerRow.querySelectorAll('.cell.header-cell'))
      .map(cell => cell.textContent)
      .filter(Boolean);
  }

  function getActiveProductColumnTitles() {
    const sources = [
      getActiveProductColumnsFromStorage(),
      getActiveProductColumnsFromFieldsModal(),
      getActiveProductColumnsFromGrid()
    ];

    for (const values of sources) {
      const deduped = dedupeTextList(values);
      if (deduped.length) return deduped;
    }

    return [];
  }

  function findProductFilterModal() {
    return findModalByTitle('Filtrar', {
      visibleOnly: true,
      excludeId: PRODUCT_CODE_RANGE_MODAL_ID
    });
  }

  function findProductFilterColumnMultiselect(modal) {
    if (!modal) return null;

    const labels = Array.from(modal.querySelectorAll('label'));
    const label = labels.find(el => normalizeText(el.textContent || '') === 'coluna');
    if (!label) return null;

    const container = label.parentElement || label.closest('.col-md-5, .col, .row, .form-group') || modal;
    const selectRoot = container.querySelector('.z-select') || container;
    return selectRoot.querySelector('.multiselect') || null;
  }

  function restoreProductFilterColumnOptions() {
    const hiddenOptions = Array.from(document.querySelectorAll(
      '.multiselect__content .multiselect__element[' + PRODUCT_FILTER_OPTION_HIDDEN_ATTR + ']'
    ));

    hiddenOptions.forEach(option => {
      option.removeAttribute(PRODUCT_FILTER_OPTION_HIDDEN_ATTR);
      option.style.display = '';
    });
  }

  function cleanupUiForCurrentPage() {
    if (!isFeatureEnabled('batchEnabled')) removeBatchUi();
    if (!isFeatureEnabled('productPreviewEnabled')) removeProductPreviewButton();
    if (!isFeatureEnabled('filterEnabled')) restoreProductFilterColumnOptions();
    if (!isFeatureEnabled('multiTermFilterEnabled')) resetCommonMultiTermFilterState();
    removeProductStyleCustomizeUi();
    if (!isFeatureEnabled('lowStockHighlightEnabled')) {
      clearProductLowStockHighlight();
    }
    if (!isFeatureEnabled('actionMenuCustomizeEnabled')) {
      removeNfeActionCustomizeUi();
      restoreNfeActionMenuItems();
    }
  }

  function syncProductFilterColumnOptions() {
    if (!isFeatureEnabled('filterEnabled') || !isTargetProductRoute()) {
      restoreProductFilterColumnOptions();
      return;
    }

    const modal = findProductFilterModal();
    if (!modal) {
      restoreProductFilterColumnOptions();
      return;
    }

    const activeColumns = getActiveProductColumnTitles();
    if (!activeColumns.length) return;

    const allowed = new Set(activeColumns.map(normalizeText));
    const multiselect = findProductFilterColumnMultiselect(modal);
    if (!multiselect) return;

    const options = Array.from(multiselect.querySelectorAll('.multiselect__content .multiselect__element'));
    options.forEach(option => {
      const text = normalizeText(option.textContent || '');
      if (!text) return;

      const shouldShow = allowed.has(text);
      if (shouldShow) {
        option.removeAttribute(PRODUCT_FILTER_OPTION_HIDDEN_ATTR);
        option.style.display = '';
      } else {
        option.setAttribute(PRODUCT_FILTER_OPTION_HIDDEN_ATTR, 'true');
        option.style.display = 'none';
      }
    });
  }

  function findVisibleProductToolbar() {
    const inputs = Array.from(document.querySelectorAll(PRODUCT_TOOLBAR_SEARCH_SELECTOR));
    const input = inputs.find(el => isVisible(el) && el.closest('.grid-toolbar.no-print'));
    if (!input) return null;
    return input.closest('.grid-toolbar.no-print');
  }

  function removeProductPreviewTooltip() {
    const tooltip = document.getElementById(PRODUCT_PREVIEW_TOOLTIP_ID);
    if (tooltip) tooltip.remove();
  }

  function showProductPreviewTooltip(button) {
    if (!button || !document.body) return;
    let tooltip = document.getElementById(PRODUCT_PREVIEW_TOOLTIP_ID);
    if (!tooltip) {
      tooltip = document.createElement('div');
      tooltip.id = PRODUCT_PREVIEW_TOOLTIP_ID;
      tooltip.className = 'tooltip bs-tooltip-auto fade show';
      tooltip.setAttribute('role', 'tooltip');
      tooltip.setAttribute('data-popper-placement', 'top');
      tooltip.style.position = 'absolute';
      tooltip.style.inset = 'auto auto 0px 0px';
      tooltip.style.margin = '0';
      tooltip.style.zIndex = '999999';
      tooltip.style.pointerEvents = 'none';
      tooltip.innerHTML = '<div class="tooltip-arrow" style="position:absolute;left:0;"></div><div class="tooltip-inner">Códigos</div>';
      document.body.appendChild(tooltip);
    }

    const tooltipInner = tooltip.querySelector('.tooltip-inner');
    if (tooltipInner) {
      tooltipInner.textContent = 'Códigos';
      tooltipInner.style.display = 'block';
      tooltipInner.style.maxWidth = 'none';
      tooltipInner.style.whiteSpace = 'nowrap';
      tooltipInner.style.padding = '9.75px 13px';
      tooltipInner.style.borderRadius = '6.175px';
      tooltipInner.style.background = '#fff';
      tooltipInner.style.color = 'rgb(24, 28, 50)';
      tooltipInner.style.fontFamily = 'Roboto, Helvetica, sans-serif';
      tooltipInner.style.fontSize = '13px';
      tooltipInner.style.fontWeight = '400';
      tooltipInner.style.lineHeight = '19.5px';
      tooltipInner.style.textAlign = 'center';
      tooltipInner.style.boxShadow = 'rgba(0, 0, 0, 0.15) 0px 0px 30px 0px';
    }

    const rect = button.getBoundingClientRect();
    const tooltipRect = tooltip.getBoundingClientRect();
    const left = window.scrollX + rect.left + ((rect.width - tooltipRect.width) / 2);
    const top = window.scrollY + rect.top - tooltipRect.height - 8;
    tooltip.style.transform = 'translate(' + left + 'px, ' + top + 'px)';
    const arrow = tooltip.querySelector('.tooltip-arrow');
    if (arrow) {
      arrow.style.width = '10px';
      arrow.style.height = '10px';
      arrow.style.background = '#fff';
      arrow.style.boxShadow = 'rgba(0, 0, 0, 0.08) 2px 2px 8px 0px';
      const arrowLeft = Math.max(8, Math.round((tooltipRect.width / 2) - 5));
      arrow.style.left = '0';
      arrow.style.top = '0';
      arrow.style.transform = 'translate(' + arrowLeft + 'px, 30px) rotate(45deg)';
    }
  }

  function ensureProductPreviewButton() {
    if (!isFeatureEnabled('productPreviewEnabled') || !isTargetProductRoute()) {
      removeProductPreviewButton();
      return;
    }

    const toolbar = findVisibleProductToolbar();
    if (!toolbar) return;

    const actionsContainer = toolbar.querySelector('.grid-toolbar-hidden-mobile') || toolbar;
    const filterButton = actionsContainer.querySelector('button#grid\\.filter, #grid\\.filter');
    const searchInput = toolbar.querySelector(PRODUCT_TOOLBAR_SEARCH_SELECTOR);
    let button = document.getElementById(PRODUCT_PREVIEW_BUTTON_ID);

    if (!button) {
      button = document.createElement('button');
      button.id = PRODUCT_PREVIEW_BUTTON_ID;
      button.type = 'button';
      button.className = 'btn btn-custom-1 btn-sm px-3';
      button.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopImmediatePropagation();
        removeProductPreviewTooltip();
        openProductCodeRangeModal();
      }, true);
      button.addEventListener('mouseenter', () => showProductPreviewTooltip(button));
      button.addEventListener('mouseleave', removeProductPreviewTooltip);
      button.addEventListener('focus', () => showProductPreviewTooltip(button), true);
      button.addEventListener('blur', removeProductPreviewTooltip, true);
    }

    const iconMarkup = [
      '<span aria-hidden="true" style="display:inline-flex;align-items:center;justify-content:center;width:16px;height:16px;pointer-events:none;">',
      '  <svg viewBox="0 0 20 20" width="16" height="16" fill="none" xmlns="http://www.w3.org/2000/svg" style="display:block;overflow:visible;pointer-events:none;">',
      '    <path d="M7 3L5.6 17" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" style="pointer-events:none;"/>',
      '    <path d="M13.8 3L12.4 17" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" style="pointer-events:none;"/>',
      '    <path d="M3 7.1H15.8" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" style="pointer-events:none;"/>',
      '    <path d="M2.4 13H15.2" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" style="pointer-events:none;"/>',
      '  </svg>',
      '</span>'
    ].join('');
    if (button.innerHTML !== iconMarkup) {
      button.innerHTML = iconMarkup;
    }
    if (button.getAttribute('aria-label') !== 'Códigos') {
      button.setAttribute('aria-label', 'Códigos');
    }
    if (button.getAttribute('data-bs-original-title') !== 'Códigos') {
      button.setAttribute('data-bs-original-title', 'Códigos');
    }
    if (button.hasAttribute('title')) {
      button.removeAttribute('title');
    }

    button.style.whiteSpace = 'nowrap';
    button.style.display = 'inline-flex';
    button.style.alignItems = 'center';
    button.style.justifyContent = 'center';
    button.style.boxSizing = 'border-box';
    button.style.margin = '0 6px';

    if (filterButton) {
      const filterStyles = window.getComputedStyle(filterButton);
      const filterIcon = filterButton.querySelector('.zbutton-icon, [class*="font-icon"]');
      const filterIconStyles = filterIcon ? window.getComputedStyle(filterIcon) : null;
      const searchStyles = searchInput ? window.getComputedStyle(searchInput) : null;
      const filterFontSize = Number.parseFloat(filterStyles.fontSize || '');
      const searchFontSize = searchStyles ? Number.parseFloat(searchStyles.fontSize || '') : NaN;
      const safeFontSize = Number.isFinite(searchFontSize) && searchFontSize > 0
        ? (searchFontSize + 'px')
        : Number.isFinite(filterFontSize) && filterFontSize > 0 && filterFontSize <= 18
          ? (filterFontSize + 'px')
          : '13px';
      button.style.height = filterStyles.height;
      button.style.minHeight = filterStyles.height;
      button.style.width = filterStyles.width;
      button.style.minWidth = filterStyles.width;
      button.style.background = 'transparent';
      button.style.backgroundColor = 'transparent';
      button.style.border = '1px solid transparent';
      button.style.paddingTop = filterStyles.paddingTop;
      button.style.paddingRight = filterStyles.paddingRight;
      button.style.paddingBottom = filterStyles.paddingBottom;
      button.style.paddingLeft = filterStyles.paddingLeft;
      button.style.borderRadius = filterStyles.borderRadius;
      button.style.boxShadow = filterStyles.boxShadow;
      button.style.marginTop = filterStyles.marginTop;
      button.style.marginRight = filterStyles.marginRight;
      button.style.marginBottom = filterStyles.marginBottom;
      button.style.marginLeft = filterStyles.marginLeft;
      button.style.fontFamily = searchStyles && searchStyles.fontFamily ? searchStyles.fontFamily : filterStyles.fontFamily;
      button.style.fontSize = safeFontSize;
      button.style.fontWeight = filterStyles.fontWeight;
      button.style.lineHeight = searchStyles && searchStyles.lineHeight ? searchStyles.lineHeight : filterStyles.lineHeight;
      button.style.letterSpacing = searchStyles && searchStyles.letterSpacing ? searchStyles.letterSpacing : filterStyles.letterSpacing;
      button.style.color = filterIconStyles && filterIconStyles.color ? filterIconStyles.color : filterStyles.color;
      button.style.cursor = filterStyles.cursor || 'pointer';
      button.style.transition = filterStyles.transition;
      if (button.parentElement !== actionsContainer || button.nextElementSibling !== filterButton) {
        filterButton.insertAdjacentElement('beforebegin', button);
      }
      return;
    }

    if (button.parentElement !== actionsContainer) {
      actionsContainer.appendChild(button);
    }
  }

  function normalizeHexColor(value, fallback) {
    const raw = String(value || '').trim();
    if (/^#[0-9a-f]{6}$/i.test(raw)) return raw.toLowerCase();
    if (/^#[0-9a-f]{3}$/i.test(raw)) {
      const chars = raw.slice(1).split('');
      return ('#' + chars.map(ch => ch + ch).join('')).toLowerCase();
    }
    return fallback || '';
  }

  function normalizeProductStylePrefs(rawPrefs) {
    const next = Object.assign({}, PRODUCT_STYLE_PREFS_DEFAULTS, rawPrefs || {});
    next.fontFamily = PRODUCT_FONT_OPTIONS.some(option => option.value === next.fontFamily)
      ? next.fontFamily
      : PRODUCT_STYLE_PREFS_DEFAULTS.fontFamily;
    next.useNormalColor = next.useNormalColor === true;
    next.normalColor = normalizeHexColor(next.normalColor, PRODUCT_STYLE_PREFS_DEFAULTS.normalColor);
    next.lowStockColor = normalizeHexColor(next.lowStockColor, PRODUCT_STYLE_PREFS_DEFAULTS.lowStockColor);
    const size = Number(String(next.fontSizePx || '').trim());
    next.fontSizePx = Number.isFinite(size) && size >= 10 && size <= 24 ? String(Math.round(size)) : '';
    return next;
  }

  function resolveProductLowStockColor(surface) {
    const selected = normalizeHexColor(PRODUCT_STYLE_PREFS.lowStockColor, PRODUCT_STYLE_PREFS_DEFAULTS.lowStockColor);
    const usesBuiltInColor = !selected
      || selected === PRODUCT_LOW_STOCK_LIGHT_COLOR
      || selected === PRODUCT_LOW_STOCK_DARK_COLOR;

    if (!usesBuiltInColor) {
      return selected;
    }

    return isDarkSurface(surface || document.body)
      ? PRODUCT_LOW_STOCK_DARK_COLOR
      : PRODUCT_LOW_STOCK_LIGHT_COLOR;
  }

  function getProductStyleCustomizeTheme(surface) {
    const darkSurface = isDarkSurface(surface);
    return darkSurface
      ? {
        modalBackground: 'linear-gradient(180deg, rgba(19, 29, 41, 0.98) 0%, rgba(14, 21, 31, 0.98) 100%)',
        modalBorder: '1px solid rgba(125, 185, 255, 0.24)',
        modalBoxShadow: '0 22px 48px rgba(0, 0, 0, 0.42)',
        titleColor: '#edf5ff',
        bodyColor: '#d8e4f0',
        mutedColor: '#9fb4c8',
        inputBackground: 'rgba(10, 17, 26, 0.92)',
        inputBorder: '1px solid rgba(125, 185, 255, 0.2)',
        inputColor: '#edf5ff',
        secondaryButtonBackground: 'rgba(24, 37, 52, 0.96)',
        secondaryButtonBorder: '1px solid rgba(125, 185, 255, 0.2)',
        secondaryButtonColor: '#edf5ff',
        subtleButtonColor: '#b9cae0'
      }
      : {
        modalBackground: '#ffffff',
        modalBorder: '1px solid #d5dfe8',
        modalBoxShadow: '0 18px 44px rgba(0,0,0,0.22)',
        titleColor: '#13283d',
        bodyColor: '#203040',
        mutedColor: '#5b6d7d',
        inputBackground: '#ffffff',
        inputBorder: '1px solid #d5dfe8',
        inputColor: '#203040',
        secondaryButtonBackground: '#f4f8fc',
        secondaryButtonBorder: '1px solid #d5dfe8',
        secondaryButtonColor: '#203040',
        subtleButtonColor: '#4f6070'
      };
  }

  function applyProductStyleCustomizeModalTheme(modal) {
    if (!modal) return;

    const theme = getProductStyleCustomizeTheme(modal.parentElement || document.body);
    modal.style.background = theme.modalBackground;
    modal.style.border = theme.modalBorder;
    modal.style.boxShadow = theme.modalBoxShadow;

    Array.from(modal.querySelectorAll('[data-product-style-title]')).forEach((element) => {
      element.style.color = theme.titleColor;
    });
    Array.from(modal.querySelectorAll('[data-product-style-label]')).forEach((element) => {
      element.style.color = theme.bodyColor;
    });
    Array.from(modal.querySelectorAll('[data-product-style-muted]')).forEach((element) => {
      element.style.color = theme.mutedColor;
    });
    Array.from(modal.querySelectorAll('input.form-control, select.form-control')).forEach((input) => {
      input.style.background = theme.inputBackground;
      input.style.border = theme.inputBorder;
      input.style.color = theme.inputColor;
      input.style.caretColor = theme.inputColor;
    });
    Array.from(modal.querySelectorAll('[data-product-style-secondary]')).forEach((button) => {
      button.style.background = theme.secondaryButtonBackground;
      button.style.border = theme.secondaryButtonBorder;
      button.style.color = theme.secondaryButtonColor;
    });
    Array.from(modal.querySelectorAll('[data-product-style-subtle]')).forEach((button) => {
      button.style.color = theme.subtleButtonColor;
    });
  }

  function hasCustomZwebTextStyle() {
    return !!(PRODUCT_STYLE_PREFS.useNormalColor || PRODUCT_STYLE_PREFS.fontFamily || PRODUCT_STYLE_PREFS.fontSizePx);
  }

  function removeProductStyleCustomizeUi() {
    const button = document.getElementById(PRODUCT_STYLE_CUSTOMIZE_BUTTON_ID);
    const actionItem = document.getElementById(PRODUCT_STYLE_CUSTOMIZE_ACTION_ID);
    const modal = document.getElementById(PRODUCT_STYLE_MODAL_ID);
    const backdrop = document.getElementById(PRODUCT_STYLE_BACKDROP_ID);
    if (button) button.remove();
    if (actionItem) {
      const listItem = actionItem.closest('li');
      if (listItem) listItem.remove();
      else actionItem.remove();
    }
    if (modal) modal.remove();
    if (backdrop) backdrop.remove();
  }

  function closeProductStyleCustomizeModal() {
    const modal = document.getElementById(PRODUCT_STYLE_MODAL_ID);
    const backdrop = document.getElementById(PRODUCT_STYLE_BACKDROP_ID);
    if (modal) modal.style.display = 'none';
    if (backdrop) backdrop.style.display = 'none';
  }

  function saveProductStylePrefs(nextPrefs) {
    PRODUCT_STYLE_PREFS = normalizeProductStylePrefs(nextPrefs);
    try {
      chrome.storage.local.set({ [PRODUCT_STYLE_PREFS_STORAGE_KEY]: PRODUCT_STYLE_PREFS });
    } catch (error) {
      refreshFeatureUi();
    }
  }

  function fillProductStyleCustomizeForm() {
    const form = document.getElementById(PRODUCT_STYLE_FORM_ID);
    if (!form) return;

    const fontFamily = form.querySelector('[name="fontFamily"]');
    const fontSizePx = form.querySelector('[name="fontSizePx"]');
    const useNormalColor = form.querySelector('[name="useNormalColor"]');
    const normalColor = form.querySelector('[name="normalColor"]');
    const lowStockColor = form.querySelector('[name="lowStockColor"]');

    if (fontFamily) fontFamily.value = PRODUCT_STYLE_PREFS.fontFamily || '';
    if (fontSizePx) fontSizePx.value = PRODUCT_STYLE_PREFS.fontSizePx || '';
    if (useNormalColor) useNormalColor.checked = PRODUCT_STYLE_PREFS.useNormalColor === true;
    if (normalColor) normalColor.value = PRODUCT_STYLE_PREFS.normalColor || PRODUCT_STYLE_PREFS_DEFAULTS.normalColor;
    if (lowStockColor) lowStockColor.value = resolveProductLowStockColor(form || document.body);
    if (normalColor) normalColor.disabled = !(useNormalColor && useNormalColor.checked);
  }

  function readProductStyleFormValues() {
    const form = document.getElementById(PRODUCT_STYLE_FORM_ID);
    if (!form) return PRODUCT_STYLE_PREFS;

    return normalizeProductStylePrefs({
      fontFamily: form.querySelector('[name="fontFamily"]') ? form.querySelector('[name="fontFamily"]').value : '',
      fontSizePx: form.querySelector('[name="fontSizePx"]') ? form.querySelector('[name="fontSizePx"]').value : '',
      useNormalColor: !!(form.querySelector('[name="useNormalColor"]') && form.querySelector('[name="useNormalColor"]').checked),
      normalColor: form.querySelector('[name="normalColor"]') ? form.querySelector('[name="normalColor"]').value : PRODUCT_STYLE_PREFS_DEFAULTS.normalColor,
      lowStockColor: form.querySelector('[name="lowStockColor"]') ? form.querySelector('[name="lowStockColor"]').value : PRODUCT_STYLE_PREFS_DEFAULTS.lowStockColor
    });
  }

  function saveProductStyleCustomizeSelection() {
    saveProductStylePrefs(readProductStyleFormValues());
    closeProductStyleCustomizeModal();
  }

  function resetProductStyleCustomizeSelection() {
    saveProductStylePrefs(PRODUCT_STYLE_PREFS_DEFAULTS);
    closeProductStyleCustomizeModal();
  }

  function openProductStyleCustomizeModal() {
    const modal = document.getElementById(PRODUCT_STYLE_MODAL_ID);
    const backdrop = document.getElementById(PRODUCT_STYLE_BACKDROP_ID);
    if (!modal || !backdrop) return;

    applyProductStyleCustomizeModalTheme(modal);
    fillProductStyleCustomizeForm();
    backdrop.style.display = 'block';
    modal.style.display = 'block';
  }

  function ensureProductStyleCustomizeModal() {
    if (!document.body) return;

    if (!document.getElementById(PRODUCT_STYLE_BACKDROP_ID)) {
      const backdrop = document.createElement('div');
      backdrop.id = PRODUCT_STYLE_BACKDROP_ID;
      backdrop.style.cssText = [
        'display:none',
        'position:fixed',
        'inset:0',
        'background:rgba(12, 23, 34, 0.38)',
        'z-index:999998'
      ].join(';');
      backdrop.addEventListener('click', closeProductStyleCustomizeModal);
      document.body.appendChild(backdrop);
    }

    if (!document.getElementById(PRODUCT_STYLE_MODAL_ID)) {
      const modal = document.createElement('div');
      modal.id = PRODUCT_STYLE_MODAL_ID;
      modal.style.cssText = [
        'display:none',
        'position:fixed',
        'top:50%',
        'left:50%',
        'transform:translate(-50%, -50%)',
        'width:440px',
        'max-width:calc(100vw - 24px)',
        'max-height:calc(100vh - 24px)',
        'border-radius:16px',
        'padding:16px',
        'z-index:999999'
      ].join(';');

      const fontOptionsMarkup = PRODUCT_FONT_OPTIONS
        .map((option) => '<option value="' + escapeHtml(option.value) + '">' + escapeHtml(option.label) + '</option>')
        .join('');

      modal.innerHTML = [
        '<div style="display:flex;align-items:flex-start;justify-content:space-between;gap:16px;margin-bottom:12px;">',
        '  <div>',
        '    <strong data-product-style-title style="display:block;font-size:16px;">Personalizar grade de produtos</strong>',
        '    <span data-product-style-muted style="display:block;margin-top:4px;font-size:12px;">Ajuste fonte, tamanho e cores da lista de produtos, incluindo o destaque de estoque minimo.</span>',
        '  </div>',
        '  <button type="button" data-product-style-close data-product-style-secondary class="btn btn-sm btn-light">x</button>',
        '</div>',
        '<form id="' + PRODUCT_STYLE_FORM_ID + '" style="display:grid;gap:12px;">',
        '  <label data-product-style-label style="display:grid;gap:6px;font-size:13px;">',
        '    <span>Fonte</span>',
        '    <select name="fontFamily" class="form-control">' + fontOptionsMarkup + '</select>',
        '  </label>',
        '  <label data-product-style-label style="display:grid;gap:6px;font-size:13px;">',
        '    <span>Tamanho da fonte (px)</span>',
        '    <input name="fontSizePx" type="number" min="10" max="24" step="1" class="form-control" placeholder="Padrao da Zweb">',
        '  </label>',
        '  <label data-product-style-label style="display:flex;align-items:center;gap:10px;font-size:13px;">',
        '    <input name="useNormalColor" type="checkbox">',
        '    <span>Usar cor padrao personalizada</span>',
        '  </label>',
        '  <label data-product-style-label style="display:grid;gap:6px;font-size:13px;">',
        '    <span>Cor padrao</span>',
        '    <input name="normalColor" type="color" class="form-control" style="padding:4px 6px;height:40px;">',
        '  </label>',
        '  <label data-product-style-label style="display:grid;gap:6px;font-size:13px;">',
        '    <span>Cor de estoque minimo</span>',
        '    <input name="lowStockColor" type="color" class="form-control" style="padding:4px 6px;height:40px;">',
        '  </label>',
        '</form>',
        '<div style="display:flex;justify-content:space-between;gap:8px;margin-top:14px;">',
        '  <button type="button" data-product-style-reset data-product-style-secondary class="btn btn-sm btn-light">Restaurar padrao</button>',
        '  <div style="display:flex;gap:8px;">',
        '    <button type="button" data-product-style-cancel data-product-style-subtle class="btn btn-sm btn-transparent">Cancelar</button>',
        '    <button type="button" data-product-style-save class="btn btn-sm btn-primary">Salvar</button>',
        '  </div>',
        '</div>'
      ].join('');

      modal.querySelector('[data-product-style-close]').addEventListener('click', closeProductStyleCustomizeModal);
      modal.querySelector('[data-product-style-cancel]').addEventListener('click', closeProductStyleCustomizeModal);
      modal.querySelector('[data-product-style-save]').addEventListener('click', saveProductStyleCustomizeSelection);
      modal.querySelector('[data-product-style-reset]').addEventListener('click', resetProductStyleCustomizeSelection);
      const useNormalColorInput = modal.querySelector('[name="useNormalColor"]');
      const normalColorInput = modal.querySelector('[name="normalColor"]');
      if (useNormalColorInput && normalColorInput) {
        useNormalColorInput.addEventListener('change', () => {
          normalColorInput.disabled = !useNormalColorInput.checked;
        });
      }

      document.body.appendChild(modal);
    }

    applyProductStyleCustomizeModalTheme(document.getElementById(PRODUCT_STYLE_MODAL_ID));
  }

  function ensureProductStyleCustomizeButton() {
    if (!isTargetProductRoute() || !isFeatureEnabled('lowStockHighlightEnabled')) {
      removeProductStyleCustomizeUi();
      return;
    }

    const toolbar = findVisibleProductToolbar();
    if (!toolbar) return;

    const actionsContainer = toolbar.querySelector('.grid-toolbar-hidden-mobile') || toolbar;
    const legacyButton = document.getElementById(PRODUCT_STYLE_CUSTOMIZE_BUTTON_ID);
    if (legacyButton) legacyButton.remove();

    const actionButton = Array.from(actionsContainer.querySelectorAll('button, a')).find((el) => {
      const text = normalizeText(el.innerText || el.textContent || '');
      return text === 'acoes' && isVisible(el);
    });
    if (!actionButton || !actionButton.id) return;

    const actionMenu = Array.from(document.querySelectorAll('.dropdown-menu'))
      .find((menu) => menu.getAttribute('aria-labelledby') === actionButton.id && menu.classList.contains('show') && isVisible(menu));
    if (!actionMenu) return;

    let actionItem = document.getElementById(PRODUCT_STYLE_CUSTOMIZE_ACTION_ID);
    if (!actionItem) {
      const listItem = document.createElement('li');
      listItem.className = 'has-submenu';
      listItem.innerHTML = [
        '<a id="' + PRODUCT_STYLE_CUSTOMIZE_ACTION_ID + '" role="button" class="dropdown-item flex-container">',
        '  <span class="label-item">Personalizar grade</span>',
        '</a>'
      ].join('');
      actionItem = listItem.querySelector('a');
      actionItem.addEventListener('click', function(event) {
        event.preventDefault();
        event.stopImmediatePropagation();
        ensureProductStyleCustomizeModal();
        openProductStyleCustomizeModal();
      }, true);
      actionMenu.appendChild(listItem);
      return;
    }

    const actionListItem = actionItem.closest('li');
    if (actionListItem && actionListItem.parentElement !== actionMenu) {
      actionMenu.appendChild(actionListItem);
    }
  }

  function ensureLowStockHighlightStyle() {
    let style = document.getElementById(PRODUCT_LOW_STOCK_STYLE_ID);
    if (!style) {
      style = document.createElement('style');
      style.id = PRODUCT_LOW_STOCK_STYLE_ID;
      (document.head || document.documentElement).appendChild(style);
    }

    if (isSignInRoute()) {
      if (style.textContent) style.textContent = '';
      return;
    }

    const visualCustomizationEnabled = isFeatureEnabled('visualCustomizationEnabled') && hasCustomZwebTextStyle();
    const globalFontRules = [];
    const globalColorRules = [];

    if (visualCustomizationEnabled && PRODUCT_STYLE_PREFS.fontFamily) {
      globalFontRules.push('font-family:' + PRODUCT_STYLE_PREFS.fontFamily + ' !important');
    }
    if (visualCustomizationEnabled && PRODUCT_STYLE_PREFS.fontSizePx) {
      globalFontRules.push('font-size:' + PRODUCT_STYLE_PREFS.fontSizePx + 'px !important');
      globalFontRules.push('line-height:1.35');
    }
    if (visualCustomizationEnabled && PRODUCT_STYLE_PREFS.useNormalColor && PRODUCT_STYLE_PREFS.normalColor) {
      globalColorRules.push('color:' + PRODUCT_STYLE_PREFS.normalColor + ' !important');
    }

    const globalFontRuleBlock = globalFontRules.length ? ' ' + globalFontRules.join(';') + ';' : '';
    const globalColorRuleBlock = globalColorRules.length ? ' ' + globalColorRules.join(';') + ';' : '';
    const lowStockColor = resolveProductLowStockColor(document.body);
    const nextCss = `
      body,
      body input,
      body textarea,
      body select,
      body button,
      body .table-row > .cell,
      body .table-row > .cell .cell-text,
      body .dropdown-item,
      body .dropdown-item .label-item,
      body .multiselect__input,
      body .multiselect__single,
      body .multiselect__option,
      body .nav-link,
      body .modal-title,
      body .modal-body,
      body .card-title,
      body .card-body {
        ${globalFontRuleBlock}
      }

      body label,
      body p,
      body small,
      body strong,
      body li,
      body a:not(.btn),
      body h1,
      body h2,
      body h3,
      body h4,
      body h5,
      body h6,
      body .table-row > .cell,
      body .table-row > .cell .cell-text,
      body .header-text,
      body .dropdown-item,
      body .dropdown-item .label-item,
      body .form-control,
      body .multiselect__input,
      body .multiselect__single,
      body .multiselect__option,
      body .nav-link,
      body .modal-title,
      body .modal-body,
      body .card-title,
      body .card-body {
        ${globalColorRuleBlock}
      }

      .table-row[${PRODUCT_LOW_STOCK_ATTR}="true"] > .cell {
        color: ${lowStockColor} !important;
      }

      .table-row[${PRODUCT_LOW_STOCK_ATTR}="true"] > .cell .cell-text,
      .table-row[${PRODUCT_LOW_STOCK_ATTR}="true"] > .cell span,
      .table-row[${PRODUCT_LOW_STOCK_ATTR}="true"] > .cell a,
      .table-row[${PRODUCT_LOW_STOCK_ATTR}="true"] > .cell strong {
        color: ${lowStockColor} !important;
      }

      .table-row[${PRODUCT_LOW_STOCK_ATTR}="true"] > .cell.selected,
      .table-row[${PRODUCT_LOW_STOCK_ATTR}="true"] > .cell.selected .cell-text {
        color: ${lowStockColor} !important;
        font-weight: 700;
      }
    `;

    if (style.textContent !== nextCss) {
      style.textContent = nextCss;
    }
  }

  function parseProductGridNumber(value) {
    const raw = String(value || '').trim();
    if (!raw) return NaN;
    let normalized = raw.replace(/\s+/g, '');
    if (normalized.indexOf(',') !== -1 && normalized.indexOf('.') !== -1) {
      normalized = normalized.replace(/\./g, '').replace(',', '.');
    } else if (normalized.indexOf(',') !== -1) {
      normalized = normalized.replace(',', '.');
    }
    normalized = normalized.replace(/[^0-9.-]/g, '');
    const parsed = Number(normalized);
    return Number.isFinite(parsed) ? parsed : NaN;
  }

  function trimNfeReturnHistory(historyMap) {
    const entries = Object.values(historyMap || {})
      .filter(Boolean)
      .sort((a, b) => Number(b && b.capturedAt || 0) - Number(a && a.capturedAt || 0))
      .slice(0, NFE_RETURN_HISTORY_MAX_ITEMS);
    return entries.reduce((acc, entry) => {
      if (!entry || !entry.documentNumber) return acc;
      acc[entry.documentNumber] = entry;
      return acc;
    }, {});
  }

  function isNfeReturnNature(text) {
    return normalizeText(text).indexOf('devolucao') !== -1;
  }

  function isInactiveNfeStatus(text) {
    const normalized = normalizeText(text);
    return (
      normalized.indexOf('cancelada') !== -1 ||
      normalized.indexOf('cancelado') !== -1 ||
      normalized.indexOf('rejeitada') !== -1 ||
      normalized.indexOf('rejeitado') !== -1 ||
      normalized.indexOf('denegada') !== -1 ||
      normalized.indexOf('denegado') !== -1 ||
      normalized.indexOf('inutilizada') !== -1 ||
      normalized.indexOf('inutilizado') !== -1
    );
  }

  function getNfeGridHeaderMap() {
    if (!isTargetNfeRoute()) return null;
    const headerRow = document.querySelector('.table-row.header');
    if (!headerRow) return null;

    const headers = Array.from(headerRow.children || []).map((cell) => normalizeText(cell.textContent || ''));
    const customerIndex = headers.findIndex((text) => text === 'cliente');
    const documentIndex = headers.findIndex((text) => text === 'numero');
    const natureIndex = headers.findIndex((text) => text === 'natureza de operacao');
    const dateIndex = headers.findIndex((text) => text === 'emissao');
    const statusIndex = headers.findIndex((text) => text === 'status');
    const totalIndex = headers.findIndex((text) => text === 'total r$');

    if (documentIndex === -1 || natureIndex === -1) return null;
    return { customerIndex, documentIndex, natureIndex, dateIndex, statusIndex, totalIndex };
  }

  function collectVisibleNfeReturnEntries() {
    const headerMap = getNfeGridHeaderMap();
    if (!headerMap) return [];

    const rows = Array.from(document.querySelectorAll('.table-row'))
      .filter((row) => !row.classList.contains('header'));

    return rows
      .map((row) => {
        const cells = Array.from(row.children || []);
        const documentCell = cells[headerMap.documentIndex];
        const natureCell = cells[headerMap.natureIndex];
        if (!documentCell || !natureCell) return null;

        const documentNumber = String(documentCell.textContent || '').replace(/\D+/g, '').trim();
        const nature = String(natureCell.textContent || '').trim();
        if (!documentNumber || !isNfeReturnNature(nature)) return null;

        const customer = headerMap.customerIndex >= 0 && cells[headerMap.customerIndex]
          ? String(cells[headerMap.customerIndex].textContent || '').trim()
          : '';
        const status = headerMap.statusIndex >= 0 && cells[headerMap.statusIndex]
          ? String(cells[headerMap.statusIndex].textContent || '').trim()
          : '';
        const issueDate = headerMap.dateIndex >= 0 && cells[headerMap.dateIndex]
          ? String(cells[headerMap.dateIndex].textContent || '').trim()
          : '';
        const totalText = headerMap.totalIndex >= 0 && cells[headerMap.totalIndex]
          ? String(cells[headerMap.totalIndex].textContent || '').trim()
          : '';
        const total = parseProductGridNumber(totalText);

        return {
          documentNumber,
          customer,
          nature,
          issueDate,
          status,
          total: Number.isFinite(total) ? total : null,
          active: !isInactiveNfeStatus(status),
          capturedAt: Date.now()
        };
      })
      .filter(Boolean);
  }

  function syncNfeReturnHistory() {
    if (!isFeatureEnabled('commissionReturnsEnabled') || !isTargetNfeRoute()) return;

    const entries = collectVisibleNfeReturnEntries();
    if (!entries.length) return;

    const signature = JSON.stringify(entries.map((entry) => [
      entry.documentNumber,
      entry.customer,
      entry.nature,
      entry.issueDate,
      entry.status,
      entry.total,
      entry.active
    ]));
    if (signature === LAST_NFE_RETURN_SIGNATURE) return;
    LAST_NFE_RETURN_SIGNATURE = signature;

    if (NFE_RETURN_SYNC_TIMER) clearTimeout(NFE_RETURN_SYNC_TIMER);
    NFE_RETURN_SYNC_TIMER = setTimeout(() => {
      NFE_RETURN_SYNC_TIMER = 0;
      const nextHistory = Object.assign({}, NFE_RETURN_HISTORY);
      let changed = false;

      entries.forEach((entry) => {
        const previous = nextHistory[entry.documentNumber];
        const comparablePrevious = previous
          ? JSON.stringify([
              previous.customer,
              previous.nature,
              previous.issueDate,
              previous.status,
              previous.total,
              previous.active
            ])
          : '';
        const comparableNext = JSON.stringify([
          entry.customer,
          entry.nature,
          entry.issueDate,
          entry.status,
          entry.total,
          entry.active
        ]);

        if (comparablePrevious !== comparableNext) {
          nextHistory[entry.documentNumber] = entry;
          changed = true;
        }
      });

      if (!changed) return;
      NFE_RETURN_HISTORY = trimNfeReturnHistory(nextHistory);
      try {
        chrome.storage.local.set({ [NFE_RETURN_HISTORY_STORAGE_KEY]: NFE_RETURN_HISTORY });
      } catch (error) {}
    }, 250);
  }

  function getProductGridHeaderMap() {
    const headerRow = document.querySelector('.table-row.header');
    if (!headerRow) return null;

    const children = Array.from(headerRow.children || []);
    const titles = children.map((cell) => normalizeText(cell.textContent || ''));
    const quantityIndex = titles.findIndex((text) => text === 'quantidade');
    const minimumIndex = titles.findIndex((text) => text === 'qtd. minima' || text === 'qtd minima');

    if (quantityIndex === -1 || minimumIndex === -1) return null;
    return { quantityIndex, minimumIndex };
  }

  function clearProductLowStockHighlight() {
    const rows = Array.from(document.querySelectorAll('.table-row[' + PRODUCT_LOW_STOCK_ATTR + '], .table-row[' + PRODUCT_ROW_STYLE_ATTR + ']'));
    rows.forEach((row) => {
      row.removeAttribute(PRODUCT_LOW_STOCK_ATTR);
      row.removeAttribute(PRODUCT_ROW_STYLE_ATTR);
    });
  }

  function syncProductLowStockHighlight() {
    if (!isTargetProductRoute() || !isFeatureEnabled('lowStockHighlightEnabled')) {
      clearProductLowStockHighlight();
      return;
    }

    const headerMap = getProductGridHeaderMap();
    if (!headerMap) {
      clearProductLowStockHighlight();
      return;
    }

    ensureLowStockHighlightStyle();
    const rows = Array.from(document.querySelectorAll('.table-row')).filter((row) => !row.classList.contains('header'));
    rows.forEach((row) => {
      const cells = Array.from(row.children || []);
      const quantityCell = cells[headerMap.quantityIndex];
      const minimumCell = cells[headerMap.minimumIndex];
      if (!quantityCell || !minimumCell) {
        row.removeAttribute(PRODUCT_LOW_STOCK_ATTR);
        return;
      }

      const quantity = parseProductGridNumber(quantityCell.textContent || '');
      const minimum = parseProductGridNumber(minimumCell.textContent || '');
      if (!Number.isFinite(quantity) || !Number.isFinite(minimum)) {
        row.removeAttribute(PRODUCT_LOW_STOCK_ATTR);
        return;
      }

      if (quantity <= minimum) {
        row.setAttribute(PRODUCT_LOW_STOCK_ATTR, 'true');
      } else {
        row.removeAttribute(PRODUCT_LOW_STOCK_ATTR);
      }
    });
  }

  function parseBatchCodes(raw) {
    return (raw || '')
      .split(/[,\n;]+/g)
      .map(x => x.trim())
      .filter(Boolean);
  }

  function parseQuantityFromField(rawValue) {
    const text = String(rawValue || '').trim();
    if (!text) return null;
    let normalized = text.replace(/\s+/g, '');
    if (normalized.indexOf(',') !== -1) {
      normalized = normalized.replace(/\./g, '').replace(',', '.');
    }
    const n = Number(normalized);
    if (!isFinite(n) || n <= 0) return null;
    return n;
  }

  async function waitForItemConfirmation(expectedCode, timeoutMs) {
    const timeout = timeoutMs || 4500;
    const start = Date.now();
    const normalizedExpected = normalizeBatchCode(expectedCode);

    while (Date.now() - start < timeout) {
      const input = findMainSearchInput();
      const addButton = findAddButton();
      const current = input ? (input.value || '').trim() : '';
      const codeLeftInput = current !== normalizedExpected;
      const addReset = !addButton || !!addButton.disabled;
      if (codeLeftInput && addReset) return true;
      await delay(100);
    }

    return false;
  }

  async function executeBatchByCodes(codes, quantityRaw) {
    if (!codes.length) return;
    const quantity = parseDavIntegerQuantity(quantityRaw);
    if (!quantity) {
      updateBatchStatus('Informe uma quantidade valida maior que zero.');
      return;
    }

    BATCH_RUNNING = true;
    let ok = 0;
    const failed = [];
    updateProgressBar(0, 'Iniciando lote...');

    for (let i = 0; i < codes.length; i++) {
      const code = codes[i];
      updateBatchStatus('Processando ' + (i + 1) + '/' + codes.length + ': ' + code);
      updateProgressBar(Math.round((i / codes.length) * 100), 'Processando ' + code + '...');
      try {
        await addSingleItemInBatch(code, quantityRaw, quantity);
        ok++;
      } catch (err) {
        failed.push(code + ' (' + (err && err.message ? err.message : 'erro') + ')');
      }
    }

    if (!failed.length) {
      updateBatchStatus('Concluido: ' + ok + ' itens adicionados.');
      updateProgressBar(100, 'Concluido: ' + ok + ' itens');
    } else {
      updateBatchStatus('Concluido com falhas. OK: ' + ok + ', Falhas: ' + failed.length + '.');
      console.warn('Falhas lote:', failed);
      updateProgressBar(100, 'Concluido com falhas: ' + failed.length);
    }

    setTimeout(() => {
      const progress = document.getElementById(BATCH_PROGRESS_ID);
      if (progress) progress.style.display = 'none';
    }, 2500);

    BATCH_RUNNING = false;
  }

  function openBatchModal() {
    const modal = document.getElementById(BATCH_MODAL_ID);
    const backdrop = document.getElementById(BATCH_BACKDROP_ID);
    if (modal) {
      applyBatchModalTheme(modal);
      modal.style.display = 'block';
    }
    if (backdrop) backdrop.style.display = 'block';
  }

  function handleBatchToggleActivation(event) {
    const target = event && event.target && event.target.closest
      ? event.target.closest('#' + BATCH_TOGGLE_ID)
      : null;
    if (!target || !isTargetDavRoute() || !isFeatureEnabled('batchEnabled')) return;

    if (event && event.type === 'keydown') {
      const key = event.key || '';
      if (key !== 'Enter' && key !== ' ') return;
    }

    if (event && typeof event.preventDefault === 'function') event.preventDefault();
    openBatchModal();
  }

  function closeBatchModal() {
    const modal = document.getElementById(BATCH_MODAL_ID);
    const backdrop = document.getElementById(BATCH_BACKDROP_ID);
    if (modal) modal.style.display = 'none';
    if (backdrop) backdrop.style.display = 'none';
  }

  function ensureProgressBar() {
    if (document.getElementById(BATCH_PROGRESS_ID)) return;

    const wrap = document.createElement('div');
    wrap.id = BATCH_PROGRESS_ID;
    wrap.style.cssText = [
      'display:none',
      'position:fixed',
      'left:16px',
      'right:16px',
      'bottom:14px',
      'z-index:999997',
      'border-radius:8px',
      'padding:8px 10px',
      'box-shadow:0 8px 18px rgba(0,0,0,0.15)'
    ].join(';');

    wrap.innerHTML = [
      '<div id="' + BATCH_PROGRESS_TEXT_ID + '" style="font-size:12px;margin-bottom:6px;">Processando...</div>',
      '<div data-batch-progress-track style="width:100%;height:8px;border-radius:999px;overflow:hidden;">',
      '  <div id="' + BATCH_PROGRESS_FILL_ID + '" style="height:100%;width:0%;background:#2b84d6;transition:width .2s ease;"></div>',
      '</div>'
    ].join('');

    document.body.appendChild(wrap);
    applyBatchProgressTheme(wrap);
  }

  function updateProgressBar(percent, text) {
    ensureProgressBar();
    const wrap = document.getElementById(BATCH_PROGRESS_ID);
    const fill = document.getElementById(BATCH_PROGRESS_FILL_ID);
    const label = document.getElementById(BATCH_PROGRESS_TEXT_ID);
    if (!wrap || !fill || !label) return;

    applyBatchProgressTheme(wrap);
    wrap.style.display = 'block';
    fill.style.width = Math.max(0, Math.min(100, percent || 0)) + '%';
    if (text) label.textContent = text;
  }

  function findImpressionsButton() {
    const buttons = Array.from(document.querySelectorAll('button, a[role="button"]'));
    const exact = buttons.find(btn => {
      if (!isVisible(btn)) return false;
      const txt = normalizeText(btn.innerText || btn.textContent || '');
      return txt === 'impressoes';
    });
    if (exact) return exact;

    return buttons.find(btn => {
      if (!isVisible(btn)) return false;
      const txt = normalizeText(btn.innerText || btn.textContent || '');
      return txt.indexOf('impressoes') !== -1;
    }) || null;
  }

  function ensureBatchUi() {
    if (!isFeatureEnabled('batchEnabled') || !isTargetDavRoute()) {
      removeBatchUi();
      return;
    }

    const addButton = findAddButton();
    if (!addButton) return;
    const impressionsButton = findImpressionsButton();
    const targetContainer = (impressionsButton && impressionsButton.parentElement)
      ? impressionsButton.parentElement
      : (addButton.closest('.mt-3, .d-flex, .row') || addButton.parentElement);
    if (!targetContainer) return;

    if (!document.getElementById(BATCH_TOGGLE_ID)) {
      const btn = document.createElement('button');
      btn.id = BATCH_TOGGLE_ID;
      btn.type = 'button';
      btn.className = 'btn btn-sm';
      btn.textContent = 'Lote';
      btn.title = 'Aplicar mesma quantidade para varios codigos';
      btn.style.background = '#f4a261';
      btn.style.borderColor = '#f4a261';
      btn.style.color = '#ffffff';
      btn.style.marginLeft = '0';
      btn.style.marginRight = '0';
      btn.addEventListener('click', openBatchModal);
      if (impressionsButton) {
        impressionsButton.insertAdjacentElement('beforebegin', btn);
      } else {
        targetContainer.appendChild(btn);
      }
    } else {
      const btn = document.getElementById(BATCH_TOGGLE_ID);
      if (!btn) return;
      btn.style.marginLeft = '0';
      btn.style.marginRight = '0';

      if (impressionsButton) {
        if (btn.nextElementSibling !== impressionsButton) {
          impressionsButton.insertAdjacentElement('beforebegin', btn);
        }
      } else if (btn.parentElement !== targetContainer) {
        targetContainer.appendChild(btn);
      }
    }

    if (impressionsButton) {
      let spacer = document.getElementById(BATCH_SPACER_ID);
      if (!spacer) {
        spacer = document.createElement('span');
        spacer.id = BATCH_SPACER_ID;
        spacer.style.display = 'inline-block';
        spacer.style.width = '10px';
        spacer.style.pointerEvents = 'none';
      }

      const btn = document.getElementById(BATCH_TOGGLE_ID);
      if (btn && spacer.previousElementSibling !== btn) {
        btn.insertAdjacentElement('afterend', spacer);
      }
    }

    if (!document.getElementById(BATCH_BACKDROP_ID)) {
      const backdrop = document.createElement('div');
      backdrop.id = BATCH_BACKDROP_ID;
      backdrop.style.cssText = [
        'display:none',
        'position:fixed',
        'inset:0',
        'background:rgba(0,0,0,0.28)',
        'z-index:999998'
      ].join(';');
      backdrop.addEventListener('click', closeBatchModal);
      document.body.appendChild(backdrop);
    }

    if (!document.getElementById(BATCH_MODAL_ID)) {
      const modal = document.createElement('div');
      modal.id = BATCH_MODAL_ID;
      modal.style.cssText = [
        'display:none',
        'position:fixed',
        'top:50%',
        'left:50%',
        'transform:translate(-50%, -50%)',
        'width:420px',
        'max-width:calc(100vw - 24px)',
        'max-height:calc(100vh - 20px)',
        'border-radius:16px',
        'padding:12px',
        'z-index:999999',
        'box-shadow:0 16px 36px rgba(0,0,0,.22)',
        'overflow:auto'
      ].join(';');

      modal.innerHTML = [
        '<div data-batch-header>',
        '  <div>',
        '    <strong data-batch-title style="display:block;font-size:16px;">Lote de Itens</strong>',
        '    <span data-batch-muted style="display:block;margin-top:4px;font-size:12px;">C\u00f3digos separados por v\u00edrgula, quebra de linha ou ponto e v\u00edrgula.</span>',
        '  </div>',
        '  <button type="button" data-batch-close data-batch-secondary class="btn btn-sm btn-light">x</button>',
        '</div>',
        '<textarea data-batch-codes class="form-control form-control-sm" rows="5" placeholder="40,20,13"></textarea>',
        '<div data-batch-field-row>',
        '  <label data-batch-body class="small mb-0">Quantidade</label>',
        '  <input data-batch-qty type="text" class="form-control form-control-sm" placeholder="2">',
        '</div>',
        '<button type="button" data-batch-run class="btn btn-primary btn-sm w-100 mt-2">Aplicar lote</button>',
        '<div id="' + BATCH_STATUS_ID + '" data-batch-muted class="small mt-2"></div>'
      ].join('');

      modal.querySelector('[data-batch-close]').addEventListener('click', closeBatchModal);
      const modalCodesInput = modal.querySelector('[data-batch-codes]');
      const modalQtyInput = modal.querySelector('[data-batch-qty]');
      const applyButton = modal.querySelector('[data-batch-run]');
      if (modalCodesInput && modalQtyInput) {
        modalCodesInput.addEventListener('keydown', (event) => {
          if (event.key !== 'Enter') return;
          event.preventDefault();
          modalQtyInput.focus();
          if (typeof modalQtyInput.select === 'function') {
            modalQtyInput.select();
          }
        });
      }
      if (modalQtyInput) {
        ensureDavIntegerInputGuard(modalQtyInput);
        modalQtyInput.addEventListener('input', () => {
          const normalized = normalizeDavIntegerQuantityText(modalQtyInput.value || '');
          if (normalized !== modalQtyInput.value) {
            modalQtyInput.value = normalized;
          }
        });
        if (applyButton) {
          modalQtyInput.addEventListener('keydown', (event) => {
            if (event.key !== 'Enter') return;
            event.preventDefault();
            applyButton.click();
          });
        }
      }
      if (applyButton) {
        applyButton.addEventListener('click', async () => {
          if (BATCH_RUNNING) return;
          const textarea = modal.querySelector('[data-batch-codes]');
          const qtyInput = modal.querySelector('[data-batch-qty]');
          const codes = parseBatchCodes(textarea ? textarea.value : '');
          const quantityRaw = qtyInput ? String(qtyInput.value || '').trim() : '';
          const quantity = parseDavIntegerQuantity(quantityRaw);
          if (!codes.length) {
            updateBatchStatus('Informe ao menos um codigo.');
            return;
          }
          if (!quantity) {
            updateBatchStatus('Informe a quantidade no popup.');
            return;
          }
          closeBatchModal();
          await delay(80);
          await executeBatchByCodes(codes, quantityRaw);
        });
      }

      document.body.appendChild(modal);
    }

    applyBatchModalTheme(document.getElementById(BATCH_MODAL_ID));
  }

  function hideElement(el) {
    if (!el || el.__blockedByExt) return;
    el.__blockedByExt = true;
    el.style.display = 'none';
  }

  function markBlocked(el) {
    try {
      if (isDocumentRoute()) return;
      if (!el || el.__blockedByExt) return;
      el.__blockedByExt = true;

      try {
        const aria = (el.getAttribute && el.getAttribute('aria-label')) || '';
        const txt = normalizeText(el.innerText || el.value || '');
        const forceHideByText = FORCE_HIDE_TEXTS.some(t => txt.indexOf(normalizeText(t)) !== -1);
        if (shouldPreserveForceHideText(txt)) return;

        if (ARIA_LABELS.some(a => aria && normalizeText(aria).indexOf(normalizeText(a)) !== -1)
          || ICON_CLASSES.some(cls => el.querySelector && el.querySelector('.' + cls))
          || forceHideByText) {
          el.style.display = 'none';
        } else {
          el.setAttribute && el.setAttribute('disabled', 'true');
          el.style.pointerEvents = 'none';
          el.style.opacity = '0.6';
          el.title = 'Botao bloqueado pelo usuario';
        }
      } catch (e) {
        el.setAttribute && el.setAttribute('disabled', 'true');
        el.style.pointerEvents = 'none';
        el.style.opacity = '0.6';
        el.title = 'Botao bloqueado pelo usuario';
      }

      try { el.onclick = null; } catch(e) {}
      el.addEventListener('click', function(e) {
        e.stopImmediatePropagation();
        e.preventDefault();
      }, true);
    } catch (e) {
      console.warn('blocker error', e);
    }
  }

  function hideBlockedDropdownOptions() {
    if (!isFeatureEnabled('enabled') || isDocumentRoute()) return;

    const menuCandidates = Array.from(document.querySelectorAll('li, a, button, span, div'));
    menuCandidates.forEach(el => {
      const txt = normalizeText(el.innerText || '');
      if (!txt) return;

      const shouldHide = BLOCK_DROPDOWN_OPTIONS.some(opt => txt === opt);
      if (!shouldHide) return;

      const itemContainer = el.closest('li, .dropdown-item, .has-submenu, .menu-item') || el;
      hideElement(itemContainer);
    });
  }

  // Block only in Cadastros > Estoque by stable href selector.
  function hideCadastrosUnitOption() {
    if (!isFeatureEnabled('enabled') || isDocumentRoute()) return;

    const links = Array.from(document.querySelectorAll(CADASTROS_UNIT_SELECTOR));
    links.forEach(link => {
      const item = link.closest('.menu-item') || link;
      hideElement(item);
    });
  }

  
  function blockSpecificInputs() {
    if (!isFeatureEnabled('enabled')) return;

    BLOCK_INPUT_IDS.forEach(id => {
      const input = document.getElementById(id);
      if (!input || !shouldBlockSpecificInput(input)) return;
      applyInputBlock(input);
    });

    BLOCK_INPUT_SELECTORS.forEach(selector => {
      const inputs = Array.from(document.querySelectorAll(selector));
      inputs.forEach(input => {
        if (!shouldBlockSpecificInput(input)) return;
        applyInputBlock(input);
      });
    });
  }

  function applyInputBlock(input) {
    if (!input || input.__blockedByExt) return;
    input.__blockedByExt = true;
    input.setAttribute('disabled', 'true');
    input.setAttribute('readonly', 'true');
    input.style.pointerEvents = 'none';
    input.style.opacity = '0.6';
    input.title = 'Campo bloqueado pelo usuario';
  }
  function scan() {
    if (!isFeatureEnabled('enabled')) return;

    blockSpecificInputs();

    if (isDocumentRoute()) return;

    IDS.forEach(id => {
      const el = document.getElementById(id);
      if (el) markBlocked(el);
    });

    const candidates = Array.from(document.querySelectorAll('button, a, input[type="button"], input[type="submit"]'));
    candidates.forEach(c => {
      const txt = normalizeText(c.innerText || c.value || c.getAttribute('aria-label') || '');
      if (!txt) return;

      for (const t of TEXTS) {
        if (txt.indexOf(normalizeText(t)) !== -1) {
          markBlocked(c);
          break;
        }
      }

      for (const t of FORCE_HIDE_TEXTS) {
        if (txt.indexOf(normalizeText(t)) !== -1) {
          if (shouldPreserveForceHideText(txt)) break;
          markBlocked(c);
          break;
        }
      }
    });

    const extras = Array.from(document.querySelectorAll('a[role="button"], button[role="button"], a, button'));
    extras.forEach(el => {
      const aria = (el.getAttribute && el.getAttribute('aria-label')) || '';
      if (ARIA_LABELS.some(a => normalizeText(aria).indexOf(normalizeText(a)) !== -1)) {
        markBlocked(el);
        return;
      }

      for (const cls of ICON_CLASSES) {
        if (el.querySelector && el.querySelector('.' + cls)) {
          markBlocked(el);
          break;
        }
      }
    });

    hideBlockedDropdownOptions();
    hideCadastrosUnitOption();
  }

  function handleProductNativeFilterClearSync(event) {
    if (!isTargetProductRoute() || !event || !event.target) return;
    if (!isNativeProductFilterClearControl(event.target)) return;
    if (PRODUCT_FILTER_CLEAR_SYNC_LOCK === 'custom') return;

    PRODUCT_FILTER_CLEAR_SYNC_LOCK = 'native';
    clearProductCodeRangeFilter();
    releaseProductFilterClearSyncLock('native');
  }

  function handleCommonMultiTermFilterApply(event) {
    if (!event || !event.target || !isFeatureEnabled('multiTermFilterEnabled')) return;
    const modal = findProductFilterModal();
    if (!modal) return;
    const control = event.target.closest
      ? event.target.closest('button, a, [role="button"], input[type="button"], input[type="submit"]')
      : null;
    if (!control || !modal.contains(control) || !isCommonFilterApplyControl(control)) return;
    armCommonMultiTermFilter(modal);
  }

  function handleCommonMultiTermFilterSubmit(event) {
    if (!event || !event.target || !isFeatureEnabled('multiTermFilterEnabled')) return;
    const modal = findProductFilterModal();
    if (!modal) return;
    if (!modal.contains(event.target)) return;
    armCommonMultiTermFilter(modal);
  }

  function handleCommonMultiTermFilterKeydown(event) {
    if (!event || event.key !== 'Enter' || !isFeatureEnabled('multiTermFilterEnabled')) return;
    const modal = findProductFilterModal();
    if (!modal || !modal.contains(event.target)) return;
    const valueInput = findCommonFilterValueInput(modal);
    if (!valueInput || event.target !== valueInput) return;
    armCommonMultiTermFilter(modal);
  }

  function handleCommonMultiTermFilterClear(event) {
    if (!event || !event.target) return;
    if (!COMMON_MULTI_TERM_FILTER_STATE.active) return;
    if (!isNativeProductFilterClearControl(event.target)) return;
    resetCommonMultiTermFilterState();
  }

  function shouldBlockEventTarget(target) {
    if (!target) return false;

    const customProductCodeGrid = target.closest && target.closest('[' + PRODUCT_CODE_RANGE_GRID_ATTR + '="true"]');
    if (customProductCodeGrid) return false;

    if (isDocumentRoute()) {
      if (!isTargetDavRoute()) return false;

      let inputEl = target;
      for (let i = 0; i < 8 && inputEl; i++, inputEl = inputEl.parentElement) {
        if (!inputEl) break;
        if (!shouldBlockSpecificInput(inputEl)) continue;

        if (inputEl.id && BLOCK_INPUT_IDS.includes(inputEl.id)) return true;
        if (BLOCK_INPUT_SELECTORS.some(selector => inputEl.matches && inputEl.matches(selector))) return true;
      }

      return false;
    }

    let el = target;
    for (let i = 0; i < 8 && el; i++, el = el.parentElement) {
      if (!el) break;

      if (el.id && IDS.includes(el.id)) return true;

      const aria = (el.getAttribute && el.getAttribute('aria-label')) || '';
      if (ARIA_LABELS.some(a => normalizeText(aria).indexOf(normalizeText(a)) !== -1)) return true;

      const txt = normalizeText(el.innerText || el.value || '');
      if (TEXTS.some(t => txt.indexOf(normalizeText(t)) !== -1)) return true;
      if (FORCE_HIDE_TEXTS.some(t => txt.indexOf(normalizeText(t)) !== -1)) {
        if (!shouldPreserveForceHideText(txt)) return true;
      }

      for (const cls of ICON_CLASSES) {
        try {
          if (el.querySelector && el.querySelector('.' + cls)) return true;
        } catch (e) {}
      }

      if (el.classList && (
        el.classList.contains('cell')
        || el.classList.contains('table-row')
        || el.classList.contains('icon-actions')
        || el.classList.contains('cell-text')
      )) return true;
    }

    return false;
  }

  function blockInteractions(e) {
    try {
      if (!isFeatureEnabled('enabled')) return;
      if (isTargetNfeRoute() && e && e.type === 'contextmenu') return;

      if (shouldBlockEventTarget(e.target)) {
        e.stopImmediatePropagation();
        e.preventDefault();
        return false;
      }
    } catch (err) {}
  }

  document.addEventListener('dblclick', blockInteractions, true);
  document.addEventListener('mousedown', rememberNfeContextMenuAnchorFromMouse, true);
  document.addEventListener('contextmenu', rememberNfeContextMenuAnchor, true);
  document.addEventListener('contextmenu', blockInteractions, true);
  document.addEventListener('pointerdown', armXmlDownloadFlow, true);
  document.addEventListener('click', armXmlDownloadFlow, true);
  document.addEventListener('click', handleProductNativeFilterClearSync, true);
  document.addEventListener('click', handleCommonMultiTermFilterApply, true);
  document.addEventListener('click', handleCommonMultiTermFilterClear, true);
  document.addEventListener('submit', handleCommonMultiTermFilterSubmit, true);
  document.addEventListener('keydown', handleCommonMultiTermFilterKeydown, true);
  document.addEventListener('input', normalizeItemSearchValue, true);
  document.addEventListener('change', normalizeItemSearchValue, true);
  document.addEventListener('keydown', handleNfeItemSearchHashKeydown, true);
  setInterval(syncFocusedHashItemSearchInput, 120);
  document.addEventListener('change', handleDavQuantityAutoClearTrigger, true);
  document.addEventListener('keydown', handleDavQuantityAutoClearTrigger, true);
  document.addEventListener('click', handleDavQuantityAutoClearOptionClick, true);
  document.addEventListener('pointerup', handleBatchToggleActivation, true);
  document.addEventListener('keydown', handleBatchToggleActivation, true);
  window.addEventListener('message', handleXmlBridgeMessage);
  window.addEventListener('hashchange', function() {
    if (shouldUsePageBridge()) ensurePageBridge();
    scheduleFeatureUiRefresh(40);
  });
  window.addEventListener('resize', function() {
    scheduleFeatureUiRefresh(40);
  });

  const observer = new MutationObserver(() => {
    scheduleFeatureUiRefresh(90);
  });

  function scheduleFeatureUiRefresh(delayMs) {
    if (FEATURE_UI_REFRESH_TIMER) return;
    FEATURE_UI_REFRESH_TIMER = setTimeout(() => {
      FEATURE_UI_REFRESH_TIMER = 0;
      refreshFeatureUi();
    }, typeof delayMs === 'number' ? delayMs : 0);
  }

  function refreshFeatureUi() {
    if (isFeatureEnabled('enabled')) {
      scan();
    }

    ensureLowStockHighlightStyle();
    positionNfeContextMenuPopup();
    syncNfeActionMenuItems();
    syncNfeReturnHistory();
    syncCommissionReportModal();

    if (isTargetNfeRoute()) {
      ensureNfeActionCustomizeButton();
      ensureNfeBatchDownloadActionItems();
    } else {
      removeNfeActionCustomizeUi();
      removeNfeBatchDownloadUi();
      restoreNfeActionMenuItems();
    }

    if (isTargetDavRoute()) {
      ensureBatchUi();
    } else {
      removeBatchUi();
    }

    if (isTargetProductRoute()) {
      ensureProductPreviewButton();
      ensureProductPreferredSupplierReplicateUi();
      ensureProductStyleCustomizeButton();
      renderProductCodeRangePanel();
      syncCommonMultiTermFilterRows();
      syncProductFilterColumnOptions();
      syncProductLowStockHighlight();
    } else {
      removeProductPreviewButton();
      const replicateSection = document.getElementById(PRODUCT_REPLICATE_SUPPLIER_SECTION_ID);
      if (replicateSection) replicateSection.remove();
      removeProductStyleCustomizeUi();
      resetCommonMultiTermFilterState();
      restoreProductFilterColumnOptions();
      clearProductLowStockHighlight();
    }
  }

  function init() {
    if (shouldUsePageBridge()) ensurePageBridge();

    try {
      chrome.storage.local.get(FEATURE_DEFAULTS, (res) => {
        applyFeatureState(res);
      });
    } catch (e) {}

    try {
      chrome.storage.local.get({ [NFE_RETURN_HISTORY_STORAGE_KEY]: {} }, (res) => {
        NFE_RETURN_HISTORY = res && res[NFE_RETURN_HISTORY_STORAGE_KEY] && typeof res[NFE_RETURN_HISTORY_STORAGE_KEY] === 'object'
          ? res[NFE_RETURN_HISTORY_STORAGE_KEY]
          : {};
      });
    } catch (e) {}

    try {
      chrome.storage.local.get({ [PRODUCT_STYLE_PREFS_STORAGE_KEY]: PRODUCT_STYLE_PREFS_DEFAULTS }, (res) => {
        PRODUCT_STYLE_PREFS = normalizeProductStylePrefs(res && res[PRODUCT_STYLE_PREFS_STORAGE_KEY]);
        scheduleFeatureUiRefresh(0);
      });
    } catch (e) {}

    try {
      chrome.storage.local.get({ [ACTION_MENU_PREFS_STORAGE_KEY]: {} }, (res) => {
        ACTION_MENU_PREFS = res && res[ACTION_MENU_PREFS_STORAGE_KEY] && typeof res[ACTION_MENU_PREFS_STORAGE_KEY] === 'object'
          ? res[ACTION_MENU_PREFS_STORAGE_KEY]
          : {};
        scheduleFeatureUiRefresh(0);
      });
    } catch (e) {
      scheduleFeatureUiRefresh(0);
    }

    observer.observe(document.documentElement || document.body, { childList: true, subtree: true });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  try {
    chrome.storage.onChanged.addListener((changes, area) => {
      if (area !== 'local') return;

      if (changes[ACTION_MENU_PREFS_STORAGE_KEY]) {
        ACTION_MENU_PREFS = changes[ACTION_MENU_PREFS_STORAGE_KEY].newValue || {};
        syncNfeActionMenuItems();
        if (isTargetNfeRoute() && isFeatureEnabled('actionMenuCustomizeEnabled')) {
          ensureNfeActionCustomizeButton();
        }
      }

      if (changes[PRODUCT_STYLE_PREFS_STORAGE_KEY]) {
        PRODUCT_STYLE_PREFS = normalizeProductStylePrefs(changes[PRODUCT_STYLE_PREFS_STORAGE_KEY].newValue);
        scheduleFeatureUiRefresh(0);
      }

      if (changes[NFE_RETURN_HISTORY_STORAGE_KEY]) {
        NFE_RETURN_HISTORY = changes[NFE_RETURN_HISTORY_STORAGE_KEY].newValue || {};
      }

      const nextState = {};
      let hasRelevantChange = false;
      Object.keys(FEATURE_DEFAULTS).forEach((key) => {
        if (!changes[key]) return;
        nextState[key] = changes[key].newValue;
        hasRelevantChange = true;
      });

      if (!hasRelevantChange) return;

      const previousProtection = isFeatureEnabled('enabled');
      applyFeatureState(nextState);

      if (previousProtection && !isFeatureEnabled('enabled')) {
        cleanupUiForCurrentPage();
      }

      if (shouldUsePageBridge()) ensurePageBridge();
      scheduleFeatureUiRefresh(0);
    });
  } catch (e) {}

  setTimeout(() => scheduleFeatureUiRefresh(0), 1000);
  setTimeout(() => scheduleFeatureUiRefresh(0), 3000);
  setInterval(() => {
    if (shouldUsePageBridge()) ensurePageBridge();
    scheduleFeatureUiRefresh(120);
  }, 1500);
})();
