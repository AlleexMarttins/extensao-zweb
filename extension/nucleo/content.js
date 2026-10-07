(function() {
  'use strict';

  const IDS = ['botaoCadastrar', 'grid.primaryButton', 'grid.primaryButton'];
  const BLOCK_INPUT_IDS = ['itemForm.price'];
  const BLOCK_INPUT_SELECTORS = ['input#itemForm\\.price'];
  const PRODUCT_ADMIN_GUARDED_INPUT_IDS = ['product.cost', 'product.quantity'];
  const PRODUCT_ADMIN_PASSWORD = 'REDACTED_PRODUCT_ADMIN_PASSWORD';
  const PRODUCT_ADMIN_GUARD_LOCK_ATTR = 'data-zweb-admin-guard-locked';
  const PRODUCT_ADMIN_GUARD_UNLOCK_ATTR = 'data-zweb-admin-guard-unlocked';
  const PRODUCT_ADMIN_GUARD_SESSION_STORAGE_KEY = 'productAdminGuardSessionUnlocked';
  const CLIENT_IDENTIFICATION_ORIGINAL_ATTR = 'data-zweb-client-identification-original';
  const CLIENT_IDENTIFICATION_DIRTY_ATTR = 'data-zweb-client-identification-dirty';
  const CLIENT_IDENTIFICATION_ROUTE_ATTR = 'data-zweb-client-identification-route';
  const DAV_ITEM_CODE_CACHE_STORAGE_KEY = 'zwebDavItemCodeCache';
  const DAV_ITEM_CODE_HEADER_ATTR = 'data-zweb-dav-code-header';
  const DAV_ITEM_CODE_CELL_ATTR = 'data-zweb-dav-code-cell';
  const DAV_ITEM_PICKER_LIST_ATTR = 'data-zweb-dav-item-picker-list';
  const DAV_ITEM_PICKER_STYLE_ID = 'zweb-dav-item-picker-style';
  const TARGET_DAVS_ROUTES = [
    '/document/davs/sale/new',
    '/document/davs/estimate/new',
    '/davs/sale/new',
    '/davs/estimate/new'
  ];
  const DAV_DEFAULT_RECIPIENT_NAME = 'CLIENTE BALCÃO';
  const TARGET_DAVS_CLONE_BLOCK_ROUTES = [
    '/document/davs/sale',
    '/document/davs/estimate',
    '/davs/sale',
    '/davs/estimate'
  ];
  const TARGET_PURCHASE_ROUTE = '/fiscal/purchase';
  const TARGET_NFE_ROUTE = '/fiscal/nfe';
  const TARGET_NFE_NEW_ROUTE = '/fiscal/nfe/new';
  const TARGET_NFCE_ROUTE = '/fiscal/nfce';
  const TARGET_NFCE_PDV_ROUTE = '/fiscal/pdv';
  const TARGET_PRODUCT_ROUTE = '/register/stock/product';
  const TARGET_PRODUCT_NEW_ROUTE = '/register/stock/product/new';
  const TARGET_CLIENT_EDIT_ROUTE = '/register/client/edit/';
  const TARGET_SUPPLIER_EDIT_ROUTE = '/register/supplier/edit/';
  const TARGET_SIGN_IN_ROUTE = '/sign-in';
  const TARGET_DOCUMENT_CONFIGURATION_ROUTE = '/account/general-configuration';
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
  const PRODUCT_CLONE_BLOCK_ATTR = 'data-zweb-product-clone-blocked';
  const PRODUCT_CODE_RANGE_MODAL_ID = 'zweb-product-code-range-modal';
  const PRODUCT_CODE_RANGE_BACKDROP_ID = 'zweb-product-code-range-backdrop';
  const PRODUCT_CODE_RANGE_PANEL_ID = 'zweb-product-code-range-panel';
  const PRODUCT_CODE_RANGE_FORM_ID = 'zweb-product-code-range-form';
  const PRODUCT_CODE_RANGE_GRID_ATTR = 'data-zweb-product-code-range-grid';
  const PRODUCT_NATIVE_GRID_HIDDEN_ATTR = 'data-zweb-product-native-grid-hidden-display';
  const PRODUCT_NATIVE_GRID_HOST_HIDDEN_ATTR = 'data-zweb-product-native-grid-host-hidden';
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
  const COMMON_FILTER_COLUMN_LABELS = ['coluna', 'campo'];
  const COMMON_FILTER_VALUE_LABELS = ['valor', 'intervalo', 'conteudo', 'conteúdo'];
  const COMMON_MULTI_TERM_FILTER_ROW_HIDDEN_ATTR = 'data-zweb-common-multi-term-hidden';
  const COMMON_MULTI_TERM_FILTER_UI_ID = 'zweb-common-filter-persistence';
  const COMMON_MULTI_TERM_FILTER_LIST_ID = 'zweb-common-filter-persistence-list';
  const COMMON_MULTI_TERM_FILTER_OR_ID = 'zweb-common-filter-persistence-or';
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
  const NFE_BOLETO_WARNING_MODAL_ID = 'zweb-nfe-boleto-warning-modal';
  const NFE_BOLETO_WARNING_BACKDROP_ID = 'zweb-nfe-boleto-warning-backdrop';
  const NFE_BOLETO_WARNING_DETAILS_ID = 'zweb-nfe-boleto-warning-details';
  const NFE_BOLETO_WARNING_BOUND_ATTR = 'data-zweb-nfe-boleto-warning-bound';
  const EXTENSION_MODAL_BRIDGE_SOURCE = 'zweb-extension-modal-bridge';
  const EXTENSION_MODAL_BRIDGE_VERSION = '20260701-1';
  const NFE_BATCH_DOWNLOAD_XML_ACTION_ID = 'zweb-nfe-batch-download-xml-action';
  const NFE_BATCH_DOWNLOAD_PDF_ACTION_ID = 'zweb-nfe-batch-download-pdf-action';
  const NFE_CLONE_CANCEL_ACTION_ID = 'zweb-nfe-clone-cancel-action';
  const NFE_BATCH_DOWNLOAD_STATUS_WRAP_ID = 'zweb-nfe-batch-download-status-wrap';
  const NFE_BATCH_DOWNLOAD_STATUS_ID = 'zweb-nfe-batch-download-status';
  const NFE_BATCH_DOWNLOAD_HIDDEN_NATIVE_ATTR = 'data-zweb-batch-hidden-native';
  const NFCE_CANCEL_REASON_ACTION_ID = 'zweb-nfce-cancel-reason-action';
  const NFCE_CANCEL_REASON_MODAL_ID = 'zweb-nfce-cancel-reason-modal';
  const NFCE_CANCEL_REASON_BACKDROP_ID = 'zweb-nfce-cancel-reason-backdrop';
  const NFCE_CANCEL_REASON_DETAILS_ID = 'zweb-nfce-cancel-reason-details';
  const FISCAL_CLONE_CONFIRM_MODAL_ID = 'zweb-fiscal-clone-confirm-modal';
  const FISCAL_CLONE_CONFIRM_BACKDROP_ID = 'zweb-fiscal-clone-confirm-backdrop';
  const FISCAL_CLONE_CONFIRM_DETAILS_ID = 'zweb-fiscal-clone-confirm-details';
  const FISCAL_CLONE_CONFIRM_REASON_ID = 'zweb-fiscal-clone-confirm-reason';
  const FISCAL_CLONE_CONFIRM_REASON_ERROR_ID = 'zweb-fiscal-clone-confirm-reason-error';
  const FISCAL_CLONE_CANCEL_REASON_MIN_LENGTH = 15;
  const FISCAL_CLONE_DAV_LOG_STORAGE_KEY = 'zwebFiscalCloneDavDebugLog';
  const FISCAL_CLONE_DAV_STATE_STORAGE_KEY = 'zwebFiscalCloneDavFlowState';
  const FISCAL_CLONE_DAV_CACHE_STORAGE_KEY = 'zwebFiscalCloneDavCache';
  const FISCAL_CLONE_DAV_LOG_LIMIT = 180;
  const FISCAL_CLONE_DAV_CACHE_TTL_MS = 10 * 60 * 1000;
  const FISCAL_CANCEL_NFE_API_URL = 'https://api.zweb.com.br/rpc/v1/fiscal.cancel-nfe';
  const INVENTORY_GET_SALE_PAGINATE_API_URL = 'https://api.zweb.com.br/rpc/v2/inventory.get-sale-paginate';
  const INVENTORY_GET_DETAILED_SALE_API_URL = 'https://api.zweb.com.br/rpc/v2/inventory.get-detailed-sale';
  const INVENTORY_POST_SALE_API_URL = 'https://api.zweb.com.br/rpc/v2/inventory.post-sale';
  const INVENTORY_POST_CREDIT_LIMIT_API_URL = 'https://api.zweb.com.br/rpc/v1/inventory.post-credit-limit';
  const PDV_CASH_COUNTER_ID = 'zweb-pdv-cash-counter';
  const PDV_CASH_COUNTER_STYLE_ID = 'zweb-pdv-cash-counter-style';
  const PDV_CASH_COUNTER_MODAL_ID = 'zweb-pdv-cash-counter-modal';
  const PDV_CASH_COUNTER_BACKDROP_ID = 'zweb-pdv-cash-counter-backdrop';
  const PDV_CASH_COUNTER_STORAGE_KEY = 'zwebPdvCashCounterState';
  const PDV_CASH_COUNTER_DEBUG_STORAGE_KEY = 'zwebPdvCashCounterDebug';
  const PDV_CASH_COUNTER_MAX_SIGNATURES = 300;
  const PDV_CASH_COUNTER_API_SYNC_INTERVAL_MS = 5 * 60 * 1000;
  const COMMISSION_REPORT_HINT_ID = 'zweb-commission-report-hint';
  const COMMISSION_REPORT_HINT_TEXT = 'Para ajustar devolu\u00e7\u00f5es automaticamente no relat\u00f3rio de comiss\u00f5es, a extens\u00e3o usa o formato HTML. Depois voc\u00ea pode imprimir ou salvar em PDF pelo navegador.';
  const COMMISSION_REPORT_CONFIRM_MODAL_ID = 'zweb-commission-report-confirm-modal';
  const COMMISSION_REPORT_CONFIRM_BACKDROP_ID = 'zweb-commission-report-confirm-backdrop';
  const COMMISSION_REPORT_GENERATE_BOUND_ATTR = 'data-zweb-commission-generate-bound';
  const SUPPLIER_BUSINESS_NAME_INPUT_ID = 'zweb-supplier-business-name';
  const SUPPLIER_BUSINESS_NAME_HELPER_ID = 'zweb-supplier-business-name-helper';
  const SUPPLIER_BUSINESS_NAME_STATUS_ID = 'zweb-supplier-business-name-status';
  const SUPPLIER_BUSINESS_NAME_FIELD_ATTR = 'data-zweb-supplier-business-name-field';
  const SUPPLIER_BUSINESS_NAME_ROUTE_ATTR = 'data-zweb-supplier-business-name-route';
  const SUPPLIER_BUSINESS_NAME_FALLBACK_ATTR = 'data-zweb-supplier-business-name-fallback';
  const SUPPLIER_BUSINESS_NAME_LOADING_ATTR = 'data-zweb-business-name-loading';
  const DOCUMENT_NEGATIVE_STOCK_GUARD_STORAGE_KEY = 'zwebDocumentNegativeStockGuardExpiresAt';
  const DOCUMENT_NEGATIVE_STOCK_GUARD_OWNER_STORAGE_KEY = 'zwebDocumentNegativeStockGuardOwner';
  const DOCUMENT_NEGATIVE_STOCK_GUARD_BROWSER_ID_STORAGE_KEY = 'zwebDocumentNegativeStockGuardBrowserId';
  const DOCUMENT_NEGATIVE_STOCK_CONFIGURATION_STORAGE_KEY = 'zwebDocumentNegativeStockConfigurationPayload';
  const DOCUMENT_NEGATIVE_STOCK_FORCE_DISABLE_STORAGE_KEY = 'zwebDocumentNegativeStockForceDisablePending';
  const DOCUMENT_NEGATIVE_STOCK_NATIVE_TOAST_ID = 'zweb-document-negative-stock-native-toast-clone';
  const DOCUMENT_NEGATIVE_STOCK_NATIVE_TOAST_STYLE_ID = 'zweb-document-negative-stock-native-toast-style';
  const DOCUMENT_NEGATIVE_STOCK_REMOTE_LOCK_STYLE_ID = 'zweb-document-negative-stock-remote-lock-style';
  const DOCUMENT_NEGATIVE_STOCK_REMOTE_LOCK_ATTR = 'data-zweb-negative-stock-remote-lock';
  const DOCUMENT_NEGATIVE_STOCK_GUARD_MODAL_ID = 'zweb-document-negative-stock-guard-modal';
  const DOCUMENT_NEGATIVE_STOCK_GUARD_BACKDROP_ID = 'zweb-document-negative-stock-guard-backdrop';
  const DOCUMENT_NEGATIVE_STOCK_GUARD_REMAINING_ID = 'zweb-document-negative-stock-guard-remaining';
  const DOCUMENT_NEGATIVE_STOCK_GUARD_DEFAULT_DURATION_MS = 5 * 60 * 1000;
  const DOCUMENT_NEGATIVE_STOCK_GUARD_DEFAULT_WARNING_MS = 15 * 1000;
  const DOCUMENT_NEGATIVE_STOCK_LABEL = 'Permitir estoque negativo';
  const EXTENSION_DIALOG_TRANSITION_MS = 320;
  const NFE_CONTEXT_MENU_ID = 'menuId';
  const NFE_CONTEXT_MENU_STYLE_ID = 'zweb-nfe-context-menu-style';
  const NFE_CONTEXT_MENU_MAX_HEIGHT_VH = 48;
  const NFE_CONTEXT_MENU_MARGIN_PX = 12;
  const NFE_CONTEXT_MENU_ROW_GAP_PX = 6;
  const NFE_CONTEXT_MENU_ANCHOR_TTL_MS = 1800;
  const ACTION_MENU_PREFS_STORAGE_KEY = 'actionMenuPrefs';
  const ACTION_MENU_HIDDEN_ATTR = 'data-zweb-hidden-action-menu-item';
  const ACTION_MENU_HIDDEN_SEPARATOR_ATTR = 'data-zweb-hidden-action-menu-separator';
  const CLONE_ACTION_BLOCK_ATTR = 'data-zweb-clone-action-blocked';
  const PRODUCT_TOOLBAR_SEARCH_SELECTOR = 'input#search\\.value.grid-toolbar-search';
  const PRODUCT_EDIT_ROUTE = '#/register/stock/product/edit/';
  const PRODUCT_GRID_STORAGE_KEY = 'z_theme_config_grid';
  const PRODUCT_FILTER_OPTION_HIDDEN_ATTR = 'data-zweb-hidden-by-column-filter';
  const PRODUCT_STYLE_PREFS_STORAGE_KEY = 'productStylePrefs';
  const PRODUCT_PAGINATE_API_URL = 'https://api.zweb.com.br/rpc/v2/inventory.get-product-paginate';
  const PRODUCT_GET_API_URL = 'https://api.zweb.com.br/rpc/v2/inventory.get-product';
  const PRODUCT_PUT_API_URL = 'https://api.zweb.com.br/rpc/v2/inventory.put-product';
  const PERSON_API_URL = 'https://api.zweb.com.br/rpc/v2/person.get-person';
  const BFF_DASHBOARD_API_URL = 'https://api.zweb.com.br/rpc/v2/BFF.get-dashboard';
  const APPLICATION_PUT_CONFIGURATION_API_URL = 'https://api.zweb.com.br/rpc/v1/application.put-configuration';
  const FISCAL_GET_NFE_PAGINATE_API_URL = 'https://api.zweb.com.br/rpc/v2/fiscal.get-nfe-paginate';
  const FISCAL_GET_CHECKOUT_CURRENT_USER_API_URL = 'https://api.zweb.com.br/rpc/v2/fiscal.get-checkout-current-user';
  const FISCAL_GET_CHECKOUT_CURRENT_MOVIMENTATION_API_URL = 'https://api.zweb.com.br/rpc/v2/fiscal.get-checkout-current-movimentation';
  const NFE_GET_DETAILED_API_URL = 'https://api.zweb.com.br/rpc/v2/fiscal.get-detailed-nfe';
  const NFE_POST_API_URL = 'https://api.zweb.com.br/rpc/v2/fiscal.post-nfe';
  const NFE_PUT_API_URL = 'https://api.zweb.com.br/rpc/v2/fiscal.put-nfe';
  const NFE_GET_DANFE_URL_API_URL = 'https://api.zweb.com.br/rpc/v2/fiscal.get-danfe-url';
  const FISCAL_GET_CONFIGURATION_API_URL = 'https://api.zweb.com.br/rpc/v2/fiscal.get-configuracao';
  const TERMINAL_ZETA_CHECKOUTS_API_URL = 'https://api.zweb.com.br/rpc/v2/TerminalZeta.get-configuration-checkouts';
  const TERMINAL_ZETA_PRINT_API_URL = 'https://api.zweb.com.br/rpc/v2/fiscal.print-terminal-zeta';
  const NFE_PUT_XML_API_URL = 'https://api.zweb.com.br/rpc/v2/fiscal.put-xml';
  const NFE_DOCUMENT_MODEL = 55;
  const PRODUCT_PAGINATE_PAGE_SIZE = 200;
  const PRODUCT_READ_MAX_PAGES_PER_RUN = 20;
  const PRODUCT_READ_MIN_INTERVAL_MS = 1000;
  const PRODUCT_PREFERRED_SUPPLIER_MAX_UPDATES = 50;
  const PRODUCT_PREFERRED_SUPPLIER_MIN_INTERVAL_MS = 1000;
  const NFE_RETURN_HISTORY_STORAGE_KEY = 'nfeReturnHistory';
  const NFE_RETURN_HISTORY_META_KEY = '__zwebMeta';
  const NFE_RETURN_HISTORY_MAX_ITEMS = 4000;
  const NFE_RETURN_HISTORY_API_PAGE_SIZE = 200;
  const NFE_RETURN_HISTORY_API_MAX_PAGES = 20;
  const FISCAL_READ_MIN_INTERVAL_MS = 1000;
  const PDV_CASH_COUNTER_MAX_DETAILS = 20;
  const NFE_BATCH_DOWNLOAD_MAX_ITEMS = 50;
  const NFE_BATCH_DOWNLOAD_MIN_INTERVAL_MS = 1000;
  const NFE_RETURN_HISTORY_REFRESH_TTL_MS = 30 * 60 * 1000;
  const NFE_RETURN_HISTORY_RETRY_DELAY_MS = 30 * 60 * 1000;
  const NFCE_BLOCKED_CARD_BRANDS = ['MASTERCARD', 'ELO', 'VISA'];
  const NFCE_BLOCKED_CARD_BRAND_ATTR = 'data-zweb-nfce-card-brand-hidden';
  const XML_BRIDGE_SCRIPT_ID = 'zweb-xml-download-page-bridge';
  const XML_CONTENT_SOURCE = 'zweb-xml-content-script';
  const XML_BRIDGE_SOURCE = 'zweb-xml-page-bridge';
  const XML_BRIDGE_VERSION = '20260817-1';
  const REFERENCE_CACHE_KEYS = new Set(['categories', 'paymentModes', 'recipients', 'salesStatuses']);
  const REFERENCE_CACHE_INVALIDATION_COOLDOWN_MS = 2000;
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
    'Emitir MDF-e',
    'Consultar motivo de cancelamento'
  ];
  const FEATURE_DEFAULTS = globalThis.ZWEB_FEATURES && typeof globalThis.ZWEB_FEATURES.getDefaults === 'function'
    ? globalThis.ZWEB_FEATURES.getDefaults()
      : {
        enabled: true,
        multiTermFilterEnabled: true,
        filterEnabled: true,
        productPreviewEnabled: true,
        productPreferredSupplierBulkEnabled: true,
        productCloneProtectionEnabled: true,
        lowStockHighlightEnabled: true,
        itemSearchHashEnabled: true,
        batchEnabled: true,
        xmlDownloadEnabled: true,
        actionMenuCustomizeEnabled: true,
        nfeCloneAssistEnabled: true,
        nfeCloneBlockEnabled: false,
        nfceCloneAssistEnabled: true,
        nfceCloneBlockEnabled: true,
        nfeCashSaleBoletoGuardEnabled: true,
        commissionReturnCheckPromptEnabled: true
      };

  const FEATURE_STATE = Object.assign({}, FEATURE_DEFAULTS);
  let ACTION_MENU_PREFS = {};
  let PRODUCT_ADMIN_GUARD_PROMPT_ACTIVE = false;
  let PRODUCT_ADMIN_GUARD_SESSION_UNLOCKED = false;
  let DAV_ITEM_CODE_CACHE = Object.create(null);
  let DAV_PENDING_SELECTED_ITEM_META = null;
  let DAV_DEFAULT_RECIPIENT_STATE = 'idle';
  let DAV_DEFAULT_RECIPIENT_FORM = null;
  let BATCH_RUNNING = false;
  let DAV_BATCH_NEXT_ALLOWED_AT = 0;
  const DAV_BATCH_COOLDOWN_MS = 30 * 60 * 1000;
  const DAV_BATCH_MIN_INTERVAL_MS = 1000;
  let DAV_QTY_AUTO_CLEAR_TIMER = 0;
  let LAST_XML_DOWNLOAD_ARM_AT = 0;
  let NFE_CASH_SALE_BOLETO_PENDING_ACTION = null;
  let NFE_CASH_SALE_BOLETO_INTERNAL_CLICK = false;
  let NFE_CASH_SALE_BOLETO_MODAL_EVENTS_BOUND = false;
  let COMMISSION_REPORT_PENDING_GENERATE_BUTTON = null;
  let COMMISSION_REPORT_INTERNAL_GENERATE_CLICK = false;
  let COMMISSION_REPORT_CONFIRM_MODAL_EVENTS_BOUND = false;
  let EXTENSION_MODAL_BRIDGE_MESSAGE_BOUND = false;
  let LAST_NFE_CONTEXT_MENU_ANCHOR = null;
  let NFE_RETURN_HISTORY = {};
  let PDV_CASH_COUNTER_STATE = null;
  let PDV_CASH_COUNTER_API_SYNC_RUNNING = false;
  let PDV_CASH_COUNTER_API_SYNC_TIMER = 0;
  let PDV_CASH_COUNTER_LAST_API_SYNC_AT = 0;
  let LAST_NFE_RETURN_SIGNATURE = '';
  const TERMINAL_ZETA_PRINTED_DOCUMENT_IDS = new Set();
  const TERMINAL_ZETA_PRINTING_DOCUMENT_IDS = new Set();
  let NFE_RETURN_SYNC_TIMER = 0;
  let FEATURE_UI_REFRESH_TIMER = 0;
  let FISCAL_CLONE_DAV_CACHE = null;
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
    filters: [],
    columnTitle: '',
    columnKey: '',
    gridSignatureBefore: '',
    armedAt: 0
  };
  let COMMON_MULTI_TERM_FILTER_API_RUN_ID = 0;
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
  let NFCE_CANCEL_REASON_RUNNING = false;
  let FISCAL_CLONE_CONFIRM_PENDING = null;
  let FISCAL_CLONE_AFTER_CANCEL_PENDING = null;
  let FISCAL_CLONE_CONFIRM_INTERNAL_CLICK = false;
  let DOCUMENT_NEGATIVE_STOCK_GUARD_STATE = {
    expiresAt: 0,
    timer: 0,
    warningShownFor: 0,
    disabling: false,
    apiDisabling: false,
    closingModal: false,
    lastUserToggleAt: 0,
    lastObservedSwitchOn: null,
    pendingSwitchOnBeforeInteraction: null,
    internalSwitchMutationUntil: 0
  };
  let NFE_RETURN_HISTORY_REFRESH_PROMISE = null;
  let NFE_RETURN_HISTORY_REFRESHED_AT = 0;
  let NFE_RETURN_HISTORY_NEXT_RETRY_AT = 0;
  const LAST_REFERENCE_CACHE_INVALIDATION_AT = new Map();
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
    const mergedState = Object.assign({}, FEATURE_DEFAULTS, FEATURE_STATE, nextState || {});
    const normalized = globalThis.ZWEB_FEATURES && typeof globalThis.ZWEB_FEATURES.normalizeState === 'function'
      ? globalThis.ZWEB_FEATURES.normalizeState(mergedState)
      : mergedState;

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

  let EXTENSION_RUNTIME_INVALIDATED = false;

  function getRuntimeApi() {
    if (EXTENSION_RUNTIME_INVALIDATED) return null;
    if (typeof chrome === 'undefined' || !chrome || !chrome.runtime) return null;
    return chrome.runtime;
  }

  function getExtensionResourceUrl(path) {
    const runtime = getRuntimeApi();
    if (!runtime || typeof runtime.getURL !== 'function') return '';
    try {
      return runtime.getURL(path);
    } catch (error) {
      EXTENSION_RUNTIME_INVALIDATED = true;
      console.warn('[zweb] Extensão recarregada ou indisponível. Atualize esta aba para continuar.');
      return '';
    }
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

  function hasDavRecipientSelection(wrapper) {
    if (!wrapper) return false;
    return Array.from(wrapper.querySelectorAll('.multiselect__single, .multiselect__tag, .multiselect__tags-wrap'))
      .some(element => String(element.textContent || '').trim().length > 0);
  }

  function requestDavCachedSelection(kind, target) {
    return new Promise((resolve, reject) => {
      const requestId = 'cached-' + Date.now() + '-' + Math.random().toString(36).slice(2);
      const finish = () => { window.removeEventListener('message', onReply); clearTimeout(timer); };
      const onReply = event => {
        if (event.source !== window || !event.data || event.data.source !== 'zweb-dav-cached-select-result' || event.data.requestId !== requestId) return;
        finish(); resolve(event.data.status);
      };
      window.addEventListener('message', onReply);
      const timer = setTimeout(() => { finish(); reject(new Error('Comunicacao com o formulario nao confirmou.')); }, 2000);
      window.postMessage({ source: 'zweb-dav-cached-select', requestId, kind, target }, location.origin);
    });
  }

  function ensureDefaultDavRecipient() {
    if (!isTargetDavRoute()) {
      DAV_DEFAULT_RECIPIENT_FORM = null;
      DAV_DEFAULT_RECIPIENT_STATE = 'idle';
      return;
    }
    const clientInput = document.querySelector('input#client.multiselect__input');
    const clientWrapper = clientInput && clientInput.closest('.multiselect');
    if (clientInput && DAV_DEFAULT_RECIPIENT_FORM !== clientInput) {
      DAV_DEFAULT_RECIPIENT_FORM = clientInput;
      DAV_DEFAULT_RECIPIENT_STATE = 'idle';
    }
    if (DAV_DEFAULT_RECIPIENT_STATE !== 'idle') return;
    if (!clientInput || !clientWrapper || hasDavRecipientSelection(clientWrapper)) return;

    const runtime = getRuntimeApi();
    if (!runtime || typeof runtime.sendMessage !== 'function') return;
    DAV_DEFAULT_RECIPIENT_STATE = 'loading';
    const currentForm = () => isTargetDavRoute() && clientInput.isConnected &&
      DAV_DEFAULT_RECIPIENT_FORM === clientInput && document.querySelector('input#client.multiselect__input') === clientInput;
    const stop = () => { if (DAV_DEFAULT_RECIPIENT_FORM === clientInput) DAV_DEFAULT_RECIPIENT_STATE = 'failed'; };
    sendRuntimeMessage({ type: 'zweb-internal-default-dav-recipient' }).then(async (reply) => {
      if (!currentForm()) return;
      if (hasDavRecipientSelection(clientWrapper) || clientInput.value.trim()) { stop(); return; }
      if (!reply || !reply.ok || !reply.payload || !reply.payload.name || reply.payload.active === false) {
        stop();
        return;
      }

      const cached = await requestDavCachedSelection('client', reply.payload);
      if (!currentForm()) return;
      if (cached === 'selected') { DAV_DEFAULT_RECIPIENT_STATE = 'done'; return; }
      if (cached !== 'unavailable') { stop(); return; }
      if (hasDavRecipientSelection(clientWrapper) || clientInput.value.trim()) { stop(); return; }
      clientWrapper.click();
      clientInput.focus();
      const valueSetter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set;
      valueSetter.call(clientInput, reply.payload.name);
      clientInput.dispatchEvent(new Event('input', { bubbles: true, composed: true }));
      clientInput.dispatchEvent(new KeyboardEvent('keyup', { bubbles: true, cancelable: true, key: 'a', code: 'KeyA' }));

      const requestId = 'dav-' + Date.now() + '-' + Math.random().toString(36).slice(2);
      let timer;
      const finish = (status) => {
        window.removeEventListener('message', onResult);
        window.clearTimeout(timer);
        if (!currentForm()) return;
        DAV_DEFAULT_RECIPIENT_STATE = status === 'selected' ? 'done' : 'failed';
      };
      const onResult = (event) => {
        if (event.source !== window || !event.data || event.data.source !== 'zweb-default-dav-select-result' || event.data.requestId !== requestId) return;
        finish(event.data.status);
      };
      window.addEventListener('message', onResult);
      timer = window.setTimeout(() => finish('timeout'), 7000);
      window.postMessage({ source: 'zweb-default-dav-select', requestId, recipient: reply.payload }, location.origin);
    }).catch(() => {
      stop();
    });
  }

  function isTargetDavCloneBlockRoute() {
    const route = getNormalizedHashRoute();
    return TARGET_DAVS_CLONE_BLOCK_ROUTES.some((target) => route === target || route.indexOf(target + '/') === 0);
  }

  function isCloneActionBlockRoute() {
    if (isTargetNfeRoute()) return isFeatureEnabled('nfeCloneBlockEnabled');
    if (isTargetNfceListRoute()) return isFeatureEnabled('nfceCloneBlockEnabled');
    return false;
  }

  function isTargetProductRoute() {
    const href = (location.href || '').toLowerCase();
    return href.indexOf(TARGET_PRODUCT_ROUTE) !== -1 && href.indexOf(TARGET_PRODUCT_NEW_ROUTE) === -1;
  }

  function isTargetProductEditRoute() {
    const href = (location.href || '').toLowerCase();
    return href.indexOf(PRODUCT_EDIT_ROUTE.toLowerCase()) !== -1;
  }

  function isSignInRoute() {
    const href = (location.href || '').toLowerCase();
    return href.indexOf(TARGET_SIGN_IN_ROUTE) !== -1;
  }

  function isTargetDocumentConfigurationRoute() {
    return getNormalizedHashRoute() === TARGET_DOCUMENT_CONFIGURATION_ROUTE;
  }

  function getNormalizedHashRoute() {
    const hash = String(location.hash || '').toLowerCase();
    const route = hash.replace(/^#/, '').split('?')[0].split('&')[0].replace(/\/+$/, '');
    return route || '';
  }

  function isTargetPurchaseRoute() {
    const href = (location.href || '').toLowerCase();
    return href.indexOf(TARGET_PURCHASE_ROUTE) !== -1;
  }

  function isTargetNfeListRoute() {
    return getNormalizedHashRoute() === TARGET_NFE_ROUTE;
  }

  function isTargetNfeRoute() {
    const href = (location.href || '').toLowerCase();
    return href.indexOf(TARGET_NFE_ROUTE) !== -1;
  }

  function isTargetNfeNewRoute() {
    const href = (location.href || '').toLowerCase();
    return href.indexOf(TARGET_NFE_NEW_ROUTE) !== -1;
  }

  function isTargetNfceRoute() {
    const href = (location.href || '').toLowerCase();
    return href.indexOf(TARGET_NFCE_ROUTE) !== -1 || href.indexOf(TARGET_NFCE_PDV_ROUTE) !== -1;
  }

  function isTargetPdvRoute() {
    const href = (location.href || '').toLowerCase();
    return href.indexOf(TARGET_NFCE_PDV_ROUTE) !== -1;
  }

  function isTargetNfceListRoute() {
    const href = (location.href || '').toLowerCase();
    return href.indexOf(TARGET_NFCE_ROUTE) !== -1;
  }

  function hasVisibleFiscalAccess() {
    if (isTargetNfeRoute() || isTargetNfceRoute() || isTargetPdvRoute()) {
      return true;
    }

    const candidates = Array.from(document.querySelectorAll('a, button, span, div'));
    return candidates.some((node) => {
      if (!node || !node.isConnected || !isVisible(node)) return false;
      const href = String(node.getAttribute && (node.getAttribute('href') || node.getAttribute('data-href')) || '').toLowerCase();
      if (href.indexOf('#/fiscal') !== -1 || href.indexOf('/fiscal') !== -1) {
        return true;
      }
      const text = normalizeText(node.innerText || node.textContent || '');
      return text === 'fiscal';
    });
  }

  function isTargetClientEditRoute() {
    const href = (location.href || '').toLowerCase();
    return href.indexOf(TARGET_CLIENT_EDIT_ROUTE) !== -1;
  }

  function isTargetSupplierEditRoute() {
    const href = (location.href || '').toLowerCase();
    return href.indexOf(TARGET_SUPPLIER_EDIT_ROUTE) !== -1;
  }

  function isTargetPersonBusinessNameEditRoute() {
    return isTargetClientEditRoute() || isTargetSupplierEditRoute();
  }

  function getPersonBusinessNameEditRouteId() {
    const href = String(location.href || '');
    const match = href.match(/\/register\/(?:client|supplier)\/edit\/([^/?#&]+)/i);
    if (!match) return null;
    const value = decodeURIComponent(match[1] || '').trim();
    return /^\d+$/.test(value) ? Number(value) : value || null;
  }

  function shouldPreserveBlockedDropdownOption(normalizedText, element) {
    if (!normalizedText) return false;
    if (!isTargetNfceRoute()) return false;
    if (normalizedText !== 'kit') return false;

    const container = element && element.closest
      ? element.closest('button, a, .btn, .dropdown-item, .menu-item, .multiselect__element, li, div')
      : null;
    const containerText = normalizeText(container && container.innerText || '');
    return containerText.indexOf('importar kit') !== -1;
  }

  function getBlockedDropdownNavigationScope(element) {
    if (!element || !element.closest) return null;
    return element.closest(
      '#z_app_header_menu, ' +
      '#z_app_sidebar_menu, ' +
      '#kt_app_sidebar_menu, ' +
      '.app-sidebar-menu, ' +
      '.app-header-menu'
    );
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

  function isProductEditRoute() {
    return String(location.href || '').toLowerCase().indexOf(PRODUCT_EDIT_ROUTE) !== -1;
  }

  function isProductAdminGuardInput(input) {
    if (!input || !isProductEditRoute()) return false;
    return !!(input.id && PRODUCT_ADMIN_GUARDED_INPUT_IDS.includes(input.id));
  }

  function resetProductAdminGuardState() {
    PRODUCT_ADMIN_GUARD_PROMPT_ACTIVE = false;
  }

  function unlockProductAdminGuardInputs() {
    PRODUCT_ADMIN_GUARD_SESSION_UNLOCKED = true;
    try {
      if (chrome.storage && chrome.storage.session) {
        chrome.storage.session.set({ [PRODUCT_ADMIN_GUARD_SESSION_STORAGE_KEY]: true });
      }
    } catch (error) {}
    PRODUCT_ADMIN_GUARDED_INPUT_IDS.forEach((id) => {
      const input = document.getElementById(id);
      if (!input) return;
      input.removeAttribute('readonly');
      input.removeAttribute(PRODUCT_ADMIN_GUARD_LOCK_ATTR);
      input.setAttribute(PRODUCT_ADMIN_GUARD_UNLOCK_ATTR, 'true');
      input.title = 'Campo liberado com senha de administrador';
      input.style.cursor = '';
    });
  }

  function syncProductAdminGuardInputs() {
    PRODUCT_ADMIN_GUARDED_INPUT_IDS.forEach((id) => {
      const input = document.getElementById(id);
      if (!input) return;

      if (!isProductAdminGuardInput(input)) {
        if (
          input.getAttribute(PRODUCT_ADMIN_GUARD_LOCK_ATTR) === 'true'
          || input.getAttribute(PRODUCT_ADMIN_GUARD_UNLOCK_ATTR) === 'true'
        ) {
          input.removeAttribute('readonly');
          input.removeAttribute(PRODUCT_ADMIN_GUARD_LOCK_ATTR);
          input.removeAttribute(PRODUCT_ADMIN_GUARD_UNLOCK_ATTR);
          input.style.cursor = '';
          input.title = '';
        }
        return;
      }

      if (PRODUCT_ADMIN_GUARD_SESSION_UNLOCKED || input.getAttribute(PRODUCT_ADMIN_GUARD_UNLOCK_ATTR) === 'true') {
        input.removeAttribute('readonly');
        input.removeAttribute(PRODUCT_ADMIN_GUARD_LOCK_ATTR);
        input.setAttribute(PRODUCT_ADMIN_GUARD_UNLOCK_ATTR, 'true');
        input.title = 'Campo liberado com senha de administrador';
        input.style.cursor = '';
        return;
      }

      input.setAttribute('readonly', 'true');
      input.setAttribute(PRODUCT_ADMIN_GUARD_LOCK_ATTR, 'true');
      input.removeAttribute(PRODUCT_ADMIN_GUARD_UNLOCK_ATTR);
      input.title = 'Digite a senha de administrador para alterar este campo';
      input.style.cursor = 'not-allowed';
    });
  }

  function requestProductAdminGuardUnlock(input) {
    if (!isProductAdminGuardInput(input) || PRODUCT_ADMIN_GUARD_PROMPT_ACTIVE) return false;

    PRODUCT_ADMIN_GUARD_PROMPT_ACTIVE = true;
    try {
      const password = window.prompt('Digite a senha de administrador para alterar Custo e Quantidade atual.', '');
      if (password === PRODUCT_ADMIN_PASSWORD) {
        unlockProductAdminGuardInputs();
        window.setTimeout(() => {
          if (!input || !document.contains(input)) return;
          try {
            input.focus({ preventScroll: true });
            input.select && input.select();
          } catch (error) {}
        }, 0);
        return true;
      }

      if (password != null) {
        window.alert('Senha de administrador inválida.');
      }
      if (input && document.contains(input)) input.blur();
      return false;
    } finally {
      PRODUCT_ADMIN_GUARD_PROMPT_ACTIVE = false;
      syncProductAdminGuardInputs();
    }
  }

  function handleProductAdminGuardActivation(event) {
    if (!event || !event.target || !event.isTrusted) return;

    const input = event.target.closest ? event.target.closest('input') : null;
    if (!isProductAdminGuardInput(input)) return;
    if (input.getAttribute(PRODUCT_ADMIN_GUARD_UNLOCK_ATTR) === 'true') return;

    if (event.type === 'keydown') {
      const key = String(event.key || '');
      const navigationKeys = ['Tab', 'Shift', 'Control', 'Alt', 'Meta', 'Escape', 'Enter'];
      if (!key || navigationKeys.includes(key)) return;
    }

    event.preventDefault();
    event.stopImmediatePropagation();
    requestProductAdminGuardUnlock(input);
  }

  function normalizeText(value) {
    return (value || '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim();
  }

  function normalizeRawText(value) {
    return String(value || '').replace(/\s+/g, ' ').trim();
  }

  function getBlockedNfceCardBrand(text) {
    const normalized = normalizeRawText(text);
    const upper = normalized.toUpperCase();
    return normalized && normalized === upper && NFCE_BLOCKED_CARD_BRANDS.includes(upper) ? upper : '';
  }

  function hasAlternateNfceCardBrandVariant(optionTexts, brand) {
    return optionTexts.some((text) => {
      const normalized = normalizeRawText(text);
      return normalized && normalized !== brand && normalized.toUpperCase() === brand;
    });
  }

  function hideBlockedNfceBrandMultiselectOptions() {
    Array.from(document.querySelectorAll('.multiselect__content, ul.multiselect__content, .multiselect__content-wrapper')).forEach((list) => {
      const optionNodes = Array.from(list.querySelectorAll('.multiselect__option'));
      if (!optionNodes.length) return;

      const optionTexts = optionNodes.map((option) => normalizeRawText(option.textContent || ''));
      optionNodes.forEach((option) => {
        const brand = getBlockedNfceCardBrand(option.textContent || '');
        const shouldHide = !!brand && hasAlternateNfceCardBrandVariant(optionTexts, brand);
        const wrapper = option.closest('.multiselect__element') || option;
        wrapper.style.display = shouldHide ? 'none' : '';
        option.setAttribute(NFCE_BLOCKED_CARD_BRAND_ATTR, shouldHide ? 'true' : 'false');
        option.setAttribute('aria-hidden', shouldHide ? 'true' : 'false');
      });
    });
  }

  function hideBlockedNfceBrandSelectOptions() {
    Array.from(document.querySelectorAll('select')).forEach((select) => {
      const options = Array.from(select.options || []);
      if (!options.length) return;

      const optionTexts = options.map((option) => normalizeRawText(option.textContent || option.label || ''));
      options.forEach((option) => {
        const brand = getBlockedNfceCardBrand(option.textContent || option.label || '');
        const shouldHide = !!brand && hasAlternateNfceCardBrandVariant(optionTexts, brand);
        option.hidden = shouldHide;
        option.disabled = shouldHide;
        option.setAttribute(NFCE_BLOCKED_CARD_BRAND_ATTR, shouldHide ? 'true' : 'false');
      });
    });
  }

  function syncNfceCardBrandOptions() {
    if (!isFeatureEnabled('nfceCardBrandCleanupEnabled') || !isTargetNfceRoute()) return;
    hideBlockedNfceBrandMultiselectOptions();
    hideBlockedNfceBrandSelectOptions();
  }

  function getTodayKey() {
    const nowDate = new Date();
    const year = nowDate.getFullYear();
    const month = String(nowDate.getMonth() + 1).padStart(2, '0');
    const day = String(nowDate.getDate()).padStart(2, '0');
    return year + '-' + month + '-' + day;
  }

  function parsePdvMoney(value) {
    if (typeof value === 'number') return Number.isFinite(value) ? value : NaN;
    const raw = String(value == null ? '' : value).trim();
    if (!raw) return NaN;
    const normalized = raw
      .replace(/[^\d,.-]/g, '')
      .replace(/\.(?=\d{3}(?:\D|$))/g, '')
      .replace(',', '.');
    if (!/\d/.test(normalized)) return NaN;
    const parsed = Number(normalized);
    return Number.isFinite(parsed) ? parsed : NaN;
  }

  function formatPdvMoney(value) {
    return (Number(value) || 0).toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
  }

  function readPdvCashCounterState() {
    try {
      const parsed = JSON.parse(window.localStorage && window.localStorage.getItem(PDV_CASH_COUNTER_STORAGE_KEY) || '{}');
      PDV_CASH_COUNTER_STATE = parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {};
    } catch (error) {
      PDV_CASH_COUNTER_STATE = {};
    }

    if (PDV_CASH_COUNTER_STATE.dateKey !== getTodayKey()) {
      resetPdvCashCounterState('new-day');
    } else {
      PDV_CASH_COUNTER_STATE.total = Number(PDV_CASH_COUNTER_STATE.total) || 0;
      PDV_CASH_COUNTER_STATE.count = Number(PDV_CASH_COUNTER_STATE.count) || 0;
      PDV_CASH_COUNTER_STATE.signatures = Array.isArray(PDV_CASH_COUNTER_STATE.signatures)
        ? PDV_CASH_COUNTER_STATE.signatures.slice(-PDV_CASH_COUNTER_MAX_SIGNATURES)
        : [];
    }

    return PDV_CASH_COUNTER_STATE;
  }

  function writePdvCashCounterState() {
    const state = PDV_CASH_COUNTER_STATE || {
      dateKey: getTodayKey(),
      total: 0,
      count: 0,
      signatures: []
    };
    try {
      window.localStorage && window.localStorage.setItem(PDV_CASH_COUNTER_STORAGE_KEY, JSON.stringify(state));
    } catch (error) {}
  }

  function resetPdvCashCounterState(reason) {
    PDV_CASH_COUNTER_STATE = {
      dateKey: getTodayKey(),
      total: 0,
      count: 0,
      signatures: [],
      resetAt: new Date().toISOString(),
      resetReason: String(reason || 'manual')
    };
    writePdvCashCounterState();
    syncPdvCashCounterUi();
  }

  function walkPdvPayload(value, visitor, path, seen) {
    if (value == null) return;
    const currentPath = path || [];
    const visited = seen || new Set();
    if (typeof value !== 'object') {
      visitor(value, currentPath);
      return;
    }
    if (visited.has(value)) return;
    visited.add(value);

    if (Array.isArray(value)) {
      value.forEach((entry, index) => walkPdvPayload(entry, visitor, currentPath.concat(String(index)), visited));
      return;
    }

    visitor(value, currentPath);
    Object.keys(value).forEach((key) => {
      walkPdvPayload(value[key], visitor, currentPath.concat(key), visited);
    });
  }

  function getPdvValueByKeys(object, keys) {
    if (!object || typeof object !== 'object' || Array.isArray(object)) return NaN;
    for (const key of Object.keys(object)) {
      const normalized = normalizeText(key);
      if (!keys.some((candidate) => normalized === candidate || normalized.indexOf(candidate) !== -1)) continue;
      const parsed = parsePdvMoney(object[key]);
      if (Number.isFinite(parsed)) return parsed;
    }
    return NaN;
  }

  function isPdvCashPaymentObject(object, path) {
    if (!object || typeof object !== 'object' || Array.isArray(object)) return false;
    const pathText = normalizeText((path || []).join(' '));
    const keyText = normalizeText(Object.keys(object).join(' '));
    const paymentHint = pathText.indexOf('pag') !== -1
      || pathText.indexOf('payment') !== -1
      || keyText.indexOf('pag') !== -1
      || keyText.indexOf('payment') !== -1
      || keyText.indexOf('forma') !== -1
      || keyText.indexOf('forma') !== -1
      || keyText.indexOf('meio') !== -1
      || keyText.indexOf('method') !== -1
      || keyText.indexOf('tipo') !== -1
      || keyText.indexOf('type') !== -1;
    if (!paymentHint) return false;

    const textParts = [pathText];
    Object.keys(object).forEach((key) => {
      const value = object[key];
      if (typeof value === 'string' || typeof value === 'number') {
        textParts.push(key + ' ' + value);
      }
    });
    const text = normalizeText(textParts.join(' '));
    if (!text) return false;
    if (text.indexOf('dinheiro') !== -1) return true;
    if (text.indexOf('especie') !== -1 || text.indexOf('espécie') !== -1) return true;
    if (/\b01\b/.test(text)) return true;
    return false;
  }

  function extractPdvCashAmountFromPayload(payload) {
    let total = 0;
    const parsed = typeof payload === 'string' ? JSON.parse(payload || '{}') : payload;
    walkPdvPayload(parsed, (value, path) => {
      if (!value || typeof value !== 'object' || Array.isArray(value)) return;
      if (!isPdvCashPaymentObject(value, path)) return;

      const paid = getPdvValueByKeys(value, [
        'valorrecebido',
        'valor recebido',
        'received',
        'recebido',
        'paid',
        'pago',
        'pagamento',
        'payment',
        'amount',
        'valor'
      ]);
      const change = getPdvValueByKeys(value, [
        'troco',
        'change'
      ]);
      const amount = getPdvValueByKeys(value, [
        'valorliquido',
        'valor liquido',
        'valorfinal',
        'valor final',
        'amount',
        'valor'
      ]);

      let contribution = NaN;
      if (Number.isFinite(paid)) {
        contribution = Math.max(0, paid - (Number.isFinite(change) ? change : 0));
      } else if (Number.isFinite(amount)) {
        contribution = Math.max(0, amount - (Number.isFinite(change) ? change : 0));
      }

      if (Number.isFinite(contribution) && contribution > 0) {
        total += contribution;
      }
    }, []);

    return total;
  }

  function extractPdvCashAmountFromPayloads(requestPayload, responsePayload) {
    const requestAmount = extractPdvCashAmountFromPayload(requestPayload);
    if (Number.isFinite(requestAmount) && requestAmount > 0) return requestAmount;

    const responseAmount = extractPdvCashAmountFromPayload(responsePayload);
    return Number.isFinite(responseAmount) ? responseAmount : 0;
  }

  function isPdvCashPaymentMode(payment) {
    if (!payment || typeof payment !== 'object') return false;
    const parts = [
      payment.name,
      payment.mode,
      payment.meioPagamentoId,
      payment.tPag,
      payment.paymentType && payment.paymentType.name,
      payment.paymentType && payment.paymentType.tPag
    ].map((value) => normalizeText(value)).join(' ');
    return parts.indexOf('dinheiro') !== -1 || /\b01\b/.test(parts);
  }

  function getPdvPaymentModeValue(payment) {
    if (!payment || typeof payment !== 'object') return 0;
    const directValue = parsePdvMoney(payment.value);
    if (Number.isFinite(directValue)) return directValue;
    const amountValue = parsePdvMoney(payment.amount);
    return Number.isFinite(amountValue) ? amountValue : 0;
  }

  function getPdvDetailCheckoutOpeningId(detail) {
    const data = detail && typeof detail === 'object' ? detail : {};
    return data.dados && data.dados.checkout && data.dados.checkout.checkoutOpeningId
      || data.dados && data.dados.checkoutOpening && data.dados.checkoutOpening.id
      || data.checkout && data.checkout.checkoutOpeningId
      || null;
  }

  function getPdvCurrentCheckoutOpeningId(payload) {
    const data = payload && typeof payload === 'object' ? payload : {};
    return data.checkout && data.checkout.checkoutOpeningId
      || data.checkoutOpeningId
      || data.id
      || null;
  }

  function getPdvCurrentCheckoutIdentification(payload) {
    const data = payload && typeof payload === 'object' ? payload : {};
    return data.checkout && data.checkout.identification
      || data.identification
      || '';
  }

  function getPdvCheckoutOpeningValue(payload) {
    const data = payload && typeof payload === 'object' ? payload : {};
    const candidates = [
      data.openCheckout && data.openCheckout.value,
      data.checkout && data.checkout.openCheckout && data.checkout.openCheckout.value,
      data.checkout && data.checkout.value,
      data.openingValue,
      data.value
    ];
    for (const value of candidates) {
      const parsed = parsePdvMoney(value);
      if (Number.isFinite(parsed) && parsed > 0) return parsed;
    }
    return 0;
  }

  function isPdvAuthorizedNfceListEntry(entry) {
    if (!entry || typeof entry !== 'object') return false;
    return String(entry.modelo || '') === '65'
      && Number(entry.statusTransmissao) === 4
      && Number(entry.status) === 2;
  }

  function getPdvDetailTotal(detail, fallback) {
    const candidates = [
      detail && detail.valorTotal,
      detail && detail.dados && detail.dados.total && detail.dados.total.totalNFE,
      detail && detail.dados && detail.dados.total && detail.dados.total.totalProd,
      fallback && fallback.valorTotal
    ];
    for (const value of candidates) {
      const parsed = parsePdvMoney(value);
      if (Number.isFinite(parsed) && parsed > 0) return parsed;
    }
    return 0;
  }

  function getPdvCashAmountFromDetail(detail, fallback) {
    const payments = detail && detail.dados && Array.isArray(detail.dados.paymentModeCollection)
      ? detail.dados.paymentModeCollection
      : [];
    const cashReceived = payments
      .filter(isPdvCashPaymentMode)
      .reduce((sum, payment) => sum + getPdvPaymentModeValue(payment), 0);
    if (!Number.isFinite(cashReceived) || cashReceived <= 0) return 0;

    const total = getPdvDetailTotal(detail, fallback);
    return total > 0 ? Math.min(cashReceived, total) : cashReceived;
  }

  function applyPdvCashCounterApiState(total, count, checkoutOpeningId, checkoutIdentification, openingValue, documentIds, documentNumbers) {
    const state = {
      dateKey: getTodayKey(),
      total: Math.round((Number(total) || 0) * 100) / 100,
      count: Number(count) || 0,
      openingValue: Math.round((Number(openingValue) || 0) * 100) / 100,
      signatures: Array.isArray(documentIds) ? documentIds.slice(-PDV_CASH_COUNTER_MAX_SIGNATURES) : [],
      cashNfceNumbers: Array.isArray(documentNumbers) ? documentNumbers.slice(-PDV_CASH_COUNTER_MAX_SIGNATURES) : [],
      checkoutOpeningId: checkoutOpeningId || null,
      checkoutIdentification: checkoutIdentification || '',
      source: 'api',
      lastApiSyncAt: new Date().toISOString()
    };
    PDV_CASH_COUNTER_STATE = state;
    writePdvCashCounterState();
    syncPdvCashCounterUi();
  }

  async function syncPdvCashCounterFromApi(force) {
    if (!isTargetPdvRoute()) return;
    const nowMs = Date.now();
    if (!force && nowMs - PDV_CASH_COUNTER_LAST_API_SYNC_AT < PDV_CASH_COUNTER_API_SYNC_INTERVAL_MS) return;
    if (PDV_CASH_COUNTER_API_SYNC_RUNNING) return;

    PDV_CASH_COUNTER_API_SYNC_RUNNING = true;
    PDV_CASH_COUNTER_LAST_API_SYNC_AT = nowMs;
    try {
      const todayKey = getTodayKey();
      const checkoutPayload = await postZwebJson(FISCAL_GET_CHECKOUT_CURRENT_USER_API_URL, { active: true }, 'pdvCashCounterRead');
      const currentCheckoutOpeningId = getPdvCurrentCheckoutOpeningId(checkoutPayload);
      const currentCheckoutIdentification = getPdvCurrentCheckoutIdentification(checkoutPayload);
      const movimentationPayload = await postZwebJson(FISCAL_GET_CHECKOUT_CURRENT_MOVIMENTATION_API_URL, {}, 'pdvCashCounterRead');
      const openingValue = getPdvCheckoutOpeningValue(movimentationPayload);
      const listPayload = await postZwebJson(FISCAL_GET_NFE_PAGINATE_API_URL, {
        modelos: ['65', '59'],
        siniefN12: true,
        page: 1,
        maxResults: 80,
        sort: { key: 'emission', order: 'DESC' }
      }, 'pdvCashCounterRead');
      const entries = Array.isArray(listPayload && listPayload.data) ? listPayload.data : [];
      const todayEntries = entries.filter((entry) => {
        return isPdvAuthorizedNfceListEntry(entry)
          && String(entry.emission || '').slice(0, 10) === todayKey;
      });

      let total = 0;
      let count = 0;
      const documentIds = [];
      const documentNumbers = [];
      for (const [detailIndex, entry] of todayEntries.slice(0, PDV_CASH_COUNTER_MAX_DETAILS).entries()) {
        if (detailIndex > 0) await delay(FISCAL_READ_MIN_INTERVAL_MS);
        const detail = await postZwebJson(NFE_GET_DETAILED_API_URL, { id: entry.id }, 'pdvCashCounterRead');
        const detailCheckoutOpeningId = getPdvDetailCheckoutOpeningId(detail);
        if (currentCheckoutOpeningId && detailCheckoutOpeningId && String(detailCheckoutOpeningId) !== String(currentCheckoutOpeningId)) {
          continue;
        }
        const cashAmount = getPdvCashAmountFromDetail(detail, entry);
        if (cashAmount <= 0) continue;
        total += cashAmount;
        count += 1;
        documentIds.push('api:' + String(entry.id));
        documentNumbers.push(String(entry.numero || entry.number || entry.id));
      }
      applyPdvCashCounterApiState(total + openingValue, count, currentCheckoutOpeningId, currentCheckoutIdentification, openingValue, documentIds, documentNumbers);
    } catch (error) {
      try {
        const current = JSON.parse(window.localStorage && window.localStorage.getItem(PDV_CASH_COUNTER_DEBUG_STORAGE_KEY) || '[]');
        const list = Array.isArray(current) ? current : [];
        list.push({
          at: new Date().toISOString(),
          route: String(window.location.href || ''),
          event: 'api-sync-error',
          error: String(error && error.message || error)
        });
        window.localStorage && window.localStorage.setItem(PDV_CASH_COUNTER_DEBUG_STORAGE_KEY, JSON.stringify(list.slice(-20)));
      } catch (storageError) {}
    } finally {
      PDV_CASH_COUNTER_API_SYNC_RUNNING = false;
    }
  }

  function schedulePdvCashCounterApiSync(force) {
    if (!isTargetPdvRoute()) return;
    if (PDV_CASH_COUNTER_API_SYNC_TIMER) return;
    PDV_CASH_COUNTER_API_SYNC_TIMER = window.setTimeout(() => {
      PDV_CASH_COUNTER_API_SYNC_TIMER = 0;
      syncPdvCashCounterFromApi(!!force);
    }, force ? 100 : 1200);
  }

  function getPdvTransmitSignature(requestPayload, responsePayload, cashAmount) {
    const candidates = [];
    [responsePayload, requestPayload].forEach((payload) => {
      walkPdvPayload(payload, (value, path) => {
        const key = normalizeText((path || []).slice(-1)[0] || '');
        if (!/(id|uuid|numero|number|chave|key|serie|series|protocolo|protocol)/.test(key)) return;
        if (typeof value !== 'string' && typeof value !== 'number') return;
        const text = String(value || '').trim();
        if (text) candidates.push(key + ':' + text);
      }, []);
    });
    if (candidates.length) return candidates.slice(0, 8).join('|');
    return 'cash:' + cashAmount.toFixed(2) + ':' + new Date().toISOString().slice(0, 16);
  }

  function applyPdvCashCounterSale(requestBody, responseText) {
    if (!isTargetPdvRoute()) return;

    let requestPayload = null;
    let responsePayload = null;
    try {
      requestPayload = JSON.parse(requestBody || '{}');
    } catch (error) {
      return;
    }
    try {
      responsePayload = responseText ? JSON.parse(responseText) : null;
    } catch (error) {
      responsePayload = null;
    }

    const cashAmount = extractPdvCashAmountFromPayloads(requestPayload, responsePayload);
    if (!Number.isFinite(cashAmount) || cashAmount <= 0) return;

    const state = readPdvCashCounterState();
    const signature = getPdvTransmitSignature(requestPayload, responsePayload, cashAmount);
    if (state.signatures.includes(signature)) return;

    state.signatures.push(signature);
    state.signatures = state.signatures.slice(-PDV_CASH_COUNTER_MAX_SIGNATURES);
    state.total = Math.round(((Number(state.total) || 0) + cashAmount) * 100) / 100;
    state.count = (Number(state.count) || 0) + 1;
    state.lastSaleAt = new Date().toISOString();
    state.lastSaleValue = Math.round(cashAmount * 100) / 100;
    writePdvCashCounterState();
    syncPdvCashCounterUi();
  }

  function ensurePdvCashCounterStyle() {
    if (document.getElementById(PDV_CASH_COUNTER_STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = PDV_CASH_COUNTER_STYLE_ID;
    style.textContent = [
      '#' + PDV_CASH_COUNTER_ID + ' { box-sizing: border-box; display: block; width: 100%; margin: 10px 0 0 0; padding: 12px 14px; border-radius: 14px; background: linear-gradient(135deg, #0f5132, #198754); color: #fff; box-shadow: 0 10px 26px rgba(15, 81, 50, .22); font-weight: 700; clear: both; }',
      '#' + PDV_CASH_COUNTER_ID + ' { cursor: pointer; user-select: none; }',
      '#' + PDV_CASH_COUNTER_ID + ' .zweb-pdv-cash-counter-label { font-size: 12px; letter-spacing: .04em; text-transform: uppercase; opacity: .78; }',
      '#' + PDV_CASH_COUNTER_ID + ' .zweb-pdv-cash-counter-value { font-size: 24px; line-height: 1.1; margin-top: 3px; }',
      '#' + PDV_CASH_COUNTER_ID + ' .zweb-pdv-cash-counter-meta { font-size: 12px; opacity: .82; margin-top: 4px; font-weight: 600; }',
      '#' + PDV_CASH_COUNTER_BACKDROP_ID + ' { position: fixed; inset: 0; z-index: 2147483600; background: rgba(15, 23, 42, .38); }',
      '#' + PDV_CASH_COUNTER_MODAL_ID + ' { position: fixed; z-index: 2147483601; left: 50%; top: 50%; transform: translate(-50%, -50%); width: min(360px, calc(100vw - 24px)); max-height: calc(100vh - 48px); overflow: auto; border-radius: 16px; background: #fff; color: #172033; box-shadow: 0 24px 60px rgba(0,0,0,.28); padding: 18px; font-family: inherit; }',
      '#' + PDV_CASH_COUNTER_MODAL_ID + ' .zweb-pdv-cash-modal-head { display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-bottom: 12px; }',
      '#' + PDV_CASH_COUNTER_MODAL_ID + ' .zweb-pdv-cash-modal-title { font-size: 16px; font-weight: 800; }',
      '#' + PDV_CASH_COUNTER_MODAL_ID + ' .zweb-pdv-cash-modal-close { border: 0; border-radius: 999px; width: 30px; height: 30px; background: #edf2f7; color: #172033; font-weight: 800; cursor: pointer; }',
      '#' + PDV_CASH_COUNTER_MODAL_ID + ' .zweb-pdv-cash-modal-empty { color: #64748b; font-size: 13px; }',
      '#' + PDV_CASH_COUNTER_MODAL_ID + ' .zweb-pdv-cash-modal-list { display: grid; gap: 8px; margin: 0; padding: 0; list-style: none; }',
      '#' + PDV_CASH_COUNTER_MODAL_ID + ' .zweb-pdv-cash-modal-list li { border-radius: 10px; background: #f1f5f9; padding: 10px 12px; font-weight: 800; font-size: 15px; }'
    ].join('\n');
    (document.head || document.documentElement).appendChild(style);
  }

  function findPdvTotalAnchor() {
    const candidates = Array.from(document.querySelectorAll('div, section, article, aside, footer, form, .card, .row, [class*="total"]'))
      .filter(isVisible)
      .map((element) => ({
        element,
        text: normalizeText(element.innerText || element.textContent || '')
      }))
      .filter((entry) => {
        if (!entry.text || entry.text.indexOf('r$') === -1) return false;
        if (entry.text.indexOf('subtotal') !== -1) return false;
        if (!/(^|\s)total(\s|$)/.test(entry.text)) return false;
        return true;
      });

    const specificCandidates = candidates.filter((entry) => {
      return !Array.from(entry.element.children || []).some((child) => {
        if (!child || child.id === PDV_CASH_COUNTER_ID) return false;
        const childText = normalizeText(child.innerText || child.textContent || '');
        return childText.indexOf('r$') !== -1
          && childText.indexOf('subtotal') === -1
          && /(^|\s)total(\s|$)/.test(childText);
      });
    });

    const rankedCandidates = specificCandidates.length ? specificCandidates : candidates;

    rankedCandidates.sort((a, b) => {
      const aText = normalizeText(a.element.innerText || a.element.textContent || '');
      const bText = normalizeText(b.element.innerText || b.element.textContent || '');
      const aExact = /^total\s+r\$/.test(aText) ? 0 : 1;
      const bExact = /^total\s+r\$/.test(bText) ? 0 : 1;
      if (aExact !== bExact) return aExact - bExact;
      const aRect = a.element.getBoundingClientRect();
      const bRect = b.element.getBoundingClientRect();
      if (Math.abs(aRect.top - bRect.top) > 20) return aRect.top - bRect.top;
      const aLen = (a.element.innerText || a.element.textContent || '').length;
      const bLen = (b.element.innerText || b.element.textContent || '').length;
      return aLen - bLen;
    });

    return rankedCandidates.length ? rankedCandidates[0].element : null;
  }

  function syncPdvCashCounterUi() {
    const allCounters = Array.from(document.querySelectorAll('#' + PDV_CASH_COUNTER_ID));
    const existing = allCounters.shift() || null;
    allCounters.forEach((counter) => counter.remove());
    if (!isTargetPdvRoute()) {
      if (existing) existing.remove();
      return;
    }

    ensurePdvCashCounterStyle();
    schedulePdvCashCounterApiSync(false);
    const anchor = findPdvTotalAnchor();
    if (!anchor) return;

    const state = readPdvCashCounterState();
    let counter = existing;
    if (!counter) {
      counter = document.createElement('div');
      counter.id = PDV_CASH_COUNTER_ID;
    }

    counter.innerHTML = [
      '<div class="zweb-pdv-cash-counter-label">Dinheiro acumulado no caixa</div>',
      '<div class="zweb-pdv-cash-counter-value">' + formatPdvMoney(state.total) + '</div>',
      '<div class="zweb-pdv-cash-counter-meta">' + (Number(state.count) || 0) + ' venda(s) em dinheiro hoje</div>'
    ].join('');

    if (counter.parentElement !== anchor.parentElement || counter.previousElementSibling !== anchor) {
      anchor.insertAdjacentElement('afterend', counter);
    }
  }

  function closePdvCashCounterModal() {
    const modal = document.getElementById(PDV_CASH_COUNTER_MODAL_ID);
    const backdrop = document.getElementById(PDV_CASH_COUNTER_BACKDROP_ID);
    if (modal) modal.remove();
    if (backdrop) backdrop.remove();
  }

  function openPdvCashCounterModal() {
    if (!isTargetPdvRoute()) return;
    closePdvCashCounterModal();
    ensurePdvCashCounterStyle();

    const state = readPdvCashCounterState();
    const isApiReady = state && state.source === 'api' && state.lastApiSyncAt;
    const numbers = Array.isArray(state.cashNfceNumbers)
      ? state.cashNfceNumbers.filter(Boolean)
      : [];

    const backdrop = document.createElement('div');
    backdrop.id = PDV_CASH_COUNTER_BACKDROP_ID;
    backdrop.addEventListener('click', closePdvCashCounterModal);

    const modal = document.createElement('div');
    modal.id = PDV_CASH_COUNTER_MODAL_ID;
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.innerHTML = [
      '<div class="zweb-pdv-cash-modal-head">',
      '  <div class="zweb-pdv-cash-modal-title">NFC-e em dinheiro</div>',
      '  <button type="button" class="zweb-pdv-cash-modal-close" aria-label="Fechar">×</button>',
      '</div>',
      !isApiReady
        ? '<div class="zweb-pdv-cash-modal-empty">Ainda carregando as NFC-e em dinheiro. Tente novamente em alguns segundos.</div>'
        : numbers.length
        ? '<ul class="zweb-pdv-cash-modal-list">' + numbers.map((number) => '<li>' + escapeHtml(number) + '</li>').join('') + '</ul>'
        : '<div class="zweb-pdv-cash-modal-empty">Nenhuma NFC-e em dinheiro neste caixa.</div>'
    ].join('');

    const closeButton = modal.querySelector('.zweb-pdv-cash-modal-close');
    if (closeButton) closeButton.addEventListener('click', closePdvCashCounterModal);

    document.body.appendChild(backdrop);
    document.body.appendChild(modal);
  }

  function handlePdvCashCounterDoubleClick(event) {
    const target = event && event.target && event.target.closest
      ? event.target.closest('#' + PDV_CASH_COUNTER_ID)
      : null;
    if (!target) return;
    event.preventDefault();
    event.stopPropagation();
    openPdvCashCounterModal();
  }

  function handlePdvCashCounterResetClick(event) {
    if (!isTargetPdvRoute()) return;
    const target = event && event.target && event.target.closest
      ? event.target.closest('button, a, [role="button"], .btn')
      : null;
    if (!target) return;
    const text = normalizeText(target.innerText || target.textContent || target.getAttribute('aria-label') || '');
    if (!text) return;
    if (text.indexOf('abrir caixa') !== -1 || text.indexOf('fechar caixa') !== -1 || text.indexOf('fechamento de caixa') !== -1) {
      resetPdvCashCounterState(text);
      PDV_CASH_COUNTER_LAST_API_SYNC_AT = 0;
      schedulePdvCashCounterApiSync(true);
    }
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
        modalBackground: '#16181c',
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
        progressFillColor: '#6eb7ff',
        backdropBackground: 'rgba(3, 8, 16, 0.52)'
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
        progressFillColor: '#2b84d6',
        backdropBackground: 'rgba(15, 23, 42, 0.16)'
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

  function getVisibleNativeProductFilterChips() {
    if (!isTargetProductRoute()) return [];
    return Array.from(document.querySelectorAll('.content-filter .col-filter')).filter((chip) => {
      if (!chip || !isVisible(chip)) return false;
      if (chip.closest('#' + PRODUCT_CODE_RANGE_PANEL_ID)) return false;
      if (chip.closest('#' + PRODUCT_CODE_RANGE_STATUS_ID)) return false;
      return true;
    });
  }

  function readNativeProductFilterChipCriterion(chip) {
    if (!chip) return null;
    const input = chip.querySelector('input.form-check-input');
    if (input && !input.checked) return null;

    const prefixNode = chip.querySelector('.filter-prefix');
    const prefixText = String(prefixNode ? prefixNode.textContent || '' : '').trim();
    const fullText = String(chip.textContent || '').replace(/\s+/g, ' ').trim();
    if (!fullText) return null;

    let title = prefixText.replace(/:\s*$/, '').trim();
    let valueText = '';

    if (prefixText) {
      valueText = fullText.indexOf(prefixText) === 0
        ? fullText.slice(prefixText.length).trim()
        : fullText;
      if (valueText.charAt(0) === ':') valueText = valueText.slice(1).trim();
    } else {
      const separatorIndex = fullText.indexOf(':');
      if (separatorIndex === -1) return null;
      title = fullText.slice(0, separatorIndex).trim();
      valueText = fullText.slice(separatorIndex + 1).trim();
    }

    const columnKey = normalizeText(title);
    const valueNormalized = normalizeText(valueText);
    if (!columnKey || !valueNormalized) return null;

    return {
      title,
      columnKey,
      valueText,
      valueNormalized
    };
  }

  function getActiveNativeProductFilterCriteria() {
    return getVisibleNativeProductFilterChips()
      .map(readNativeProductFilterChipCriterion)
      .filter(Boolean);
  }

  function isSupportedProductCodeRangeColumnKey(columnKey) {
    switch (columnKey) {
      case 'codigo':
      case 'descricao':
      case 'quantidade':
      case 'qtd. minima':
      case 'qtd minima':
      case 'estoque minimo':
      case 'preco':
      case 'preco r$':
      case 'preco venda':
      case 'preco de venda':
      case 'valor':
      case 'valor r$':
      case 'custo':
      case 'custo r$':
      case 'referencia':
      case 'observacao':
      case 'ultimo fornecedor':
      case 'ultima nf. compra':
      case 'ultima nf compra':
      case 'ultima nfe compra':
      case 'nf compra':
      case 'data ult. compra':
      case 'data ult compra':
      case 'ultima compra':
      case 'data ult. venda':
      case 'data ult venda':
      case 'ultima venda':
      case 'codigo de barras':
      case 'cod barras':
      case 'codigo barras':
      case 'grupo':
      case 'unidade':
      case 'un':
      case 'ativo':
        return true;
      default:
        return false;
    }
  }

  function getVisibleNativeProductSequences(tableWrapper) {
    const wrapper = tableWrapper || getVisibleNativeGridTableWrapper();
    const structure = getProductCodeRangeGridStructure(wrapper);
    if (!wrapper || !structure || !Number.isInteger(structure.codeColumnIndex) || structure.codeColumnIndex < 0) {
      return new Set();
    }

    const sequences = new Set();
    Array.from(wrapper.querySelectorAll('.table-row'))
      .filter((row) => !row.classList.contains('header') && isVisible(row))
      .forEach((row) => {
        const cell = row.children[structure.codeColumnIndex];
        const sequence = normalizeText(cell ? (cell.textContent || '') : '');
        if (sequence) sequences.add(sequence);
      });
    return sequences;
  }

  function filterProductCodeRangeItemsByNativeCriteria(items, tableWrapper) {
    const sourceItems = Array.isArray(items) ? items : [];
    if (!sourceItems.length) return [];

    const criteria = getActiveNativeProductFilterCriteria();
    if (!criteria.length) return sourceItems;

    const supportedCriteria = criteria.filter((criterion) => isSupportedProductCodeRangeColumnKey(criterion.columnKey));
    const unsupportedCriteria = criteria.filter((criterion) => !isSupportedProductCodeRangeColumnKey(criterion.columnKey));

    let filteredItems = sourceItems;

    if (supportedCriteria.length) {
      filteredItems = filteredItems.filter((item) => {
        return supportedCriteria.every((criterion) => {
          const sourceText = normalizeText(getProductCodeRangeColumnValue(item, criterion.columnKey));
          return sourceText.indexOf(criterion.valueNormalized) !== -1;
        });
      });
    }

    if (unsupportedCriteria.length) {
      const visibleSequences = getVisibleNativeProductSequences(tableWrapper);
      if (visibleSequences.size) {
        filteredItems = filteredItems.filter((item) => {
          return visibleSequences.has(normalizeText(getProductCodeRangeItemSequence(item)));
        });
      }
    }

    return filteredItems;
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
      filters: [],
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
    return readCommonFilterSelectValue(findCommonFilterFieldContainer(modal, COMMON_FILTER_COLUMN_LABELS));
  }

  function findCommonFilterValueInput(modal) {
    const container = findCommonFilterFieldContainer(modal, COMMON_FILTER_VALUE_LABELS);
    const scopedInput = container && container.querySelector('input.form-control:not([type="checkbox"]):not([type="radio"]), textarea, input:not([type="checkbox"]):not([type="radio"])');
    if (scopedInput) return scopedInput;

    const inputs = Array.from((modal || document).querySelectorAll('input.form-control:not([type="checkbox"]):not([type="radio"]), textarea, input:not([type="checkbox"]):not([type="radio"])'));
    return inputs.find((input) => {
      if (!isVisible(input)) return false;
      if (input.closest && input.closest('.multiselect')) return false;
      const value = String(input.value || '').trim();
      const placeholder = normalizeText(input.getAttribute('placeholder') || '');
      return value || placeholder.indexOf('valor') !== -1 || placeholder.indexOf('intervalo') !== -1 || placeholder.indexOf('conteudo') !== -1;
    }) || inputs.find((input) => input && isVisible(input) && !(input.closest && input.closest('.multiselect'))) || null;
  }

  function tokenizeCommonFilterValue(rawValue) {
    return dedupeTextList(
      String(rawValue || '')
        .split(/\s+/)
        .map(normalizeText)
        .filter(Boolean)
    );
  }

  function normalizeCommonFilterColumnKey(columnTitle) {
    const key = normalizeText(columnTitle);
    if (!key) return '';
    if (key.indexOf('descri') === 0) return 'descricao';
    if (key.indexOf('cod') === 0) return 'codigo';
    if (key.indexOf('refer') === 0) return 'referencia';
    if (key.indexOf('observ') === 0) return 'observacao';
    if (key.indexOf('preco') === 0) return 'preco r$';
    if (key.indexOf('custo') === 0) return 'custo r$';
    if (key.indexOf('quant') === 0) return 'quantidade';
    return key;
  }

  function createCommonPersistentFilter(columnTitle, rawValue, joinMode) {
    const cleanColumnTitle = String(columnTitle || '').trim();
    const cleanRawValue = String(rawValue || '').trim();
    const terms = tokenizeCommonFilterValue(cleanRawValue);
    if (!cleanColumnTitle || !terms.length) return null;

    return {
      id: String(Date.now()) + '-' + Math.random().toString(36).slice(2, 8),
      join: joinMode === 'or' ? 'or' : 'and',
      rawValue: cleanRawValue,
      terms,
      columnTitle: cleanColumnTitle,
      columnKey: normalizeCommonFilterColumnKey(cleanColumnTitle)
    };
  }

  function getCommonPersistentFilters() {
    if (Array.isArray(COMMON_MULTI_TERM_FILTER_STATE.filters) && COMMON_MULTI_TERM_FILTER_STATE.filters.length) {
      return COMMON_MULTI_TERM_FILTER_STATE.filters;
    }

    if (!COMMON_MULTI_TERM_FILTER_STATE.active || !COMMON_MULTI_TERM_FILTER_STATE.columnKey || !COMMON_MULTI_TERM_FILTER_STATE.terms.length) {
      return [];
    }

    return [{
      id: 'legacy',
      join: 'and',
      rawValue: COMMON_MULTI_TERM_FILTER_STATE.rawValue,
      terms: COMMON_MULTI_TERM_FILTER_STATE.terms,
      columnTitle: COMMON_MULTI_TERM_FILTER_STATE.columnTitle,
      columnKey: COMMON_MULTI_TERM_FILTER_STATE.columnKey
    }];
  }

  function updateCommonPersistentFilterState(filters, options) {
    const nextFilters = Array.isArray(filters) ? filters.filter(Boolean) : [];
    const nativeGrid = getVisibleNativeGridTableWrapper();
    const first = nextFilters[0] || null;

    COMMON_MULTI_TERM_FILTER_STATE = {
      active: nextFilters.length > 0,
      pending: !!(options && options.pending && nextFilters.length),
      rawValue: first ? first.rawValue : '',
      primaryTerm: first && first.terms.length ? first.terms[0] : '',
      terms: first ? first.terms.slice() : [],
      filters: nextFilters,
      columnTitle: first ? first.columnTitle : '',
      columnKey: first ? first.columnKey : '',
      gridSignatureBefore: getVisibleGridRowsSignature(nativeGrid),
      armedAt: Date.now()
    };
  }

  function renderCommonPersistentFilterList() {
    const list = document.getElementById(COMMON_MULTI_TERM_FILTER_LIST_ID);
    if (!list) return;

    const filters = getCommonPersistentFilters();
    if (!filters.length) {
      list.innerHTML = '';
      return;
    }

    list.innerHTML = filters.map((filter, index) => {
      const joinLabel = index === 0 ? '' : (filter.join === 'or' ? 'OU ' : 'E ');
      return [
        '<div data-common-persistent-filter-item="' + escapeHtml(filter.id) + '" style="display:flex;align-items:center;justify-content:space-between;gap:8px;padding:6px 8px;border:1px solid rgba(120,130,150,.28);border-radius:8px;background:rgba(120,130,150,.08);">',
        '  <span style="min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:12px;"><strong>' + escapeHtml(joinLabel + filter.columnTitle) + ':</strong> ' + escapeHtml(filter.rawValue) + '</span>',
        '  <button type="button" data-common-persistent-filter-remove="' + escapeHtml(filter.id) + '" class="btn btn-sm btn-light" style="padding:1px 7px;font-size:12px;line-height:1.3;">x</button>',
        '</div>'
      ].join('');
    }).join('');
  }

  function ensureCommonFilterPersistenceUi() {
    if (!isTargetProductRoute() || !isFeatureEnabled('multiTermFilterEnabled')) {
      const existing = document.getElementById(COMMON_MULTI_TERM_FILTER_UI_ID);
      if (existing) existing.remove();
      return;
    }

    const modal = findProductFilterModal();
    if (!modal) return;

    const valueInput = findCommonFilterValueInput(modal);
    const valueContainer = findCommonFilterFieldContainer(modal, COMMON_FILTER_VALUE_LABELS)
      || valueInput && (valueInput.closest('.col-md-5, .col-md-4, .col-md-3, .col-sm-12, .col, .form-group') || valueInput.parentElement)
      || modal.querySelector('.modal-body')
      || modal;
    if (!valueContainer) return;

    let panel = document.getElementById(COMMON_MULTI_TERM_FILTER_UI_ID);
    if (!panel) {
      panel = document.createElement('div');
      panel.id = COMMON_MULTI_TERM_FILTER_UI_ID;
      panel.style.cssText = [
        'margin-top:10px',
        'padding:10px 12px',
        'border:1px solid rgba(22,100,192,.22)',
        'border-radius:10px',
        'background:rgba(22,100,192,.07)',
        'display:grid',
        'gap:8px'
      ].join(';');
      panel.innerHTML = [
        '<div style="display:flex;align-items:center;justify-content:space-between;gap:8px;flex-wrap:wrap;">',
        '  <span></span>',
        '  <label style="display:flex;align-items:center;gap:6px;margin:0;font-size:12px;cursor:pointer;">',
        '    <input id="' + COMMON_MULTI_TERM_FILTER_OR_ID + '" type="checkbox" style="margin:0;"> Utilizar OU',
        '  </label>',
        '</div>',
        '<div id="' + COMMON_MULTI_TERM_FILTER_LIST_ID + '" style="display:grid;gap:6px;"></div>'
      ].join('');
      if (valueContainer === modal || valueContainer.classList && valueContainer.classList.contains('modal-body')) {
        valueContainer.appendChild(panel);
      } else {
        valueContainer.insertAdjacentElement('afterend', panel);
      }
    } else if (panel.previousElementSibling !== valueContainer && panel.parentElement !== valueContainer) {
      if (valueContainer === modal || valueContainer.classList && valueContainer.classList.contains('modal-body')) {
        valueContainer.appendChild(panel);
      } else {
      valueContainer.insertAdjacentElement('afterend', panel);
      }
    }

    renderCommonPersistentFilterList();
  }

  function addCommonPersistentFilterFromModal(modal) {
    if (!modal) return false;
    const valueInput = findCommonFilterValueInput(modal);
    const columnTitle = readCommonFilterSelectedColumn(modal);
    const rawValue = String(valueInput && valueInput.value || '').trim();
    const useOr = !!(document.getElementById(COMMON_MULTI_TERM_FILTER_OR_ID) || {}).checked;
    const filter = createCommonPersistentFilter(columnTitle, rawValue, useOr ? 'or' : 'and');
    if (!filter) return false;

    const filters = getCommonPersistentFilters().slice();
    if (!filters.length) filter.join = 'and';
    filters.push(filter);
    updateCommonPersistentFilterState(filters, { pending: true });
    renderCommonPersistentFilterList();
    if (valueInput) {
      setInputValueAndNotify(valueInput, '');
      valueInput.focus();
    }
    restoreCommonMultiTermFilterRows();
    COMMON_MULTI_TERM_FILTER_STATE.pending = false;
    COMMON_MULTI_TERM_FILTER_STATE.gridSignatureBefore = '';
    applyCommonPersistentFiltersByApi();
    scheduleFeatureUiRefresh(120);
    return true;
  }

  function removeCommonPersistentFilter(filterId) {
    const filters = getCommonPersistentFilters().filter((filter) => filter.id !== filterId);
    updateCommonPersistentFilterState(filters, { pending: false });
    renderCommonPersistentFilterList();
    if (!filters.length) {
      resetCommonMultiTermFilterState();
      clearProductCodeRangeFilter();
    } else {
      applyCommonPersistentFiltersByApi();
    }
    scheduleFeatureUiRefresh(80);
  }

  function clearCommonPersistentFilters() {
    COMMON_MULTI_TERM_FILTER_API_RUN_ID += 1;
    resetCommonMultiTermFilterState();
    renderCommonPersistentFilterList();
    clearProductCodeRangeFilter();
    scheduleFeatureUiRefresh(80);
  }

  function isCommonPersistentFilterColumnMatch(headerTitle, filterKey) {
    const headerKey = normalizeText(headerTitle);
    const key = normalizeText(filterKey);
    if (!headerKey || !key) return false;
    return headerKey === key || headerKey.indexOf(key) === 0;
  }

  function commonPersistentFilterMatchesRow(row, structure, filter) {
    if (!row || !filter || !filter.terms || !filter.terms.length) return true;
    const header = structure && structure.headerCells.find((cell) => isCommonPersistentFilterColumnMatch(cell.normalizedTitle, filter.columnKey));
    const columnIndex = header ? header.index : -1;
    const sourceCell = columnIndex >= 0 ? row.children[columnIndex] : null;
    const sourceText = normalizeText(
      sourceCell
        ? (sourceCell.textContent || '')
        : (row.textContent || '')
    );
    return filter.terms.every((term) => sourceText.indexOf(term) !== -1);
  }

  function canApplyCommonPersistentFilters(structure, filters) {
    if (!filters || !filters.length) return false;
    if (!structure || !Array.isArray(structure.headerCells) || !structure.headerCells.length) return false;
    return filters.every((filter) => {
      if (!filter || !filter.columnKey) return false;
      return structure.headerCells.some((cell) => isCommonPersistentFilterColumnMatch(cell.normalizedTitle, filter.columnKey));
    });
  }

  function commonPersistentFiltersMatchRow(row, structure, filters) {
    if (!filters.length) return true;
    let result = commonPersistentFilterMatchesRow(row, structure, filters[0]);
    for (let index = 1; index < filters.length; index += 1) {
      const matches = commonPersistentFilterMatchesRow(row, structure, filters[index]);
      result = filters[index].join === 'or' ? (result || matches) : (result && matches);
    }
    return result;
  }

  function commonPersistentFilterMatchesProduct(item, filter) {
    if (!item || !filter || !filter.terms || !filter.terms.length) return true;
    const directValue = getProductCodeRangeColumnValue(item, filter.columnKey);
    const fallbackParts = [];
    if (filter.columnKey === 'descricao') {
      fallbackParts.push(item.description, item.name, item.title);
    } else if (filter.columnKey === 'codigo') {
      fallbackParts.push(item.sequence, item.code, item.id);
    } else if (filter.columnKey === 'referencia') {
      fallbackParts.push(item.reference, item.referenceCode);
    }
    const sourceText = normalizeText([directValue].concat(fallbackParts).filter((value) => value != null && value !== '').join(' '));
    if (!sourceText) return false;
    return filter.terms.every((term) => sourceText.indexOf(term) !== -1);
  }

  function commonPersistentFiltersMatchProduct(item, filters) {
    if (!filters.length) return true;
    let result = commonPersistentFilterMatchesProduct(item, filters[0]);
    for (let index = 1; index < filters.length; index += 1) {
      const matches = commonPersistentFilterMatchesProduct(item, filters[index]);
      result = filters[index].join === 'or' ? (result || matches) : (result && matches);
    }
    return result;
  }

  function setCommonPersistentProductResults(items, error) {
    PRODUCT_CODE_RANGE_STATE = {
      active: true,
      enabled: true,
      loading: false,
      startCode: '',
      endCode: '',
      items: Array.isArray(items) ? items : [],
      error: error || '',
      selectedSequence: '',
      selectedCellIndex: 0
    };
    renderProductCodeRangePanel();
  }

  async function applyCommonPersistentFiltersByApi() {
    const filters = getCommonPersistentFilters();
    const runId = ++COMMON_MULTI_TERM_FILTER_API_RUN_ID;
    if (!filters.length) {
      clearProductCodeRangeFilter();
      return;
    }

    try {
      const products = await fetchAllFilteredProducts();
      if (runId !== COMMON_MULTI_TERM_FILTER_API_RUN_ID) return;
      const matched = products.filter((item) => commonPersistentFiltersMatchProduct(item, filters));
      setCommonPersistentProductResults(matched, '');
    } catch (error) {
      if (runId !== COMMON_MULTI_TERM_FILTER_API_RUN_ID) return;
      setCommonPersistentProductResults([], error && error.message ? error.message : 'Nao foi possivel consultar os produtos.');
    }
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
      filters: [createCommonPersistentFilter(columnTitle, rawValue, 'and')].filter(Boolean),
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

    restoreCommonMultiTermFilterRows();

    if (!COMMON_MULTI_TERM_FILTER_STATE.active) {
      return;
    }
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
      chip.style.marginTop = shouldInlineWithNativeChip ? '0' : '3.25px';
      chip.style.padding = shouldInlineWithNativeChip ? '0' : '0 6.5px 0 0';
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
        'display',
        'marginTop',
        'marginRight',
        'marginBottom',
        'marginLeft',
        'paddingTop',
        'paddingRight',
        'paddingBottom',
        'paddingLeft',
        'fontFamily',
        'fontSize',
        'fontWeight',
        'lineHeight',
        'letterSpacing',
        'color'
      ]);
      copyComputedStyles(referenceLabel, label, [
        'display',
        'marginTop',
        'marginRight',
        'marginBottom',
        'marginLeft',
        'fontFamily',
        'fontSize',
        'fontWeight',
        'lineHeight',
        'letterSpacing',
        'verticalAlign',
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
        'marginTop',
        'marginRight',
        'marginBottom',
        'marginLeft',
        'fontFamily',
        'fontSize',
        'fontWeight',
        'lineHeight',
        'letterSpacing',
        'verticalAlign',
        'color'
      ]);
      copyComputedStyles(referencePrefix, prefix, [
        'fontSize',
        'fontWeight',
        'lineHeight',
        'color'
      ]);
      if (value && referenceText) {
        copyComputedStyles(referenceText, value, [
          'fontFamily',
          'fontSize',
          'fontWeight',
          'lineHeight',
          'letterSpacing',
          'verticalAlign',
          'color'
        ]);
      }
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

  function getSupplierBusinessNameNativeInput() {
    return document.getElementById('person.businessName');
  }

  function getSupplierBusinessNameFallbackInput() {
    return document.getElementById(SUPPLIER_BUSINESS_NAME_INPUT_ID);
  }

  function getSupplierBusinessNameInput() {
    return getSupplierBusinessNameNativeInput() || getSupplierBusinessNameFallbackInput();
  }

  function getSupplierBusinessNameFieldHost(input) {
    if (!input || !input.closest) return null;
    return input.closest('.col-md-4, .col-md-3, .col-md-2, .col, [class*="col-"], .form-group')
      || input.parentElement;
  }

  function removeSupplierBusinessNameEditor() {
    const fallback = document.querySelector('[' + SUPPLIER_BUSINESS_NAME_FALLBACK_ATTR + '="true"]');
    if (fallback) fallback.remove();
    const helper = document.getElementById(SUPPLIER_BUSINESS_NAME_HELPER_ID);
    if (helper) helper.remove();
    const nativeInput = getSupplierBusinessNameNativeInput();
    if (nativeInput) {
      nativeInput.removeAttribute(SUPPLIER_BUSINESS_NAME_FIELD_ATTR);
      nativeInput.removeAttribute(SUPPLIER_BUSINESS_NAME_ROUTE_ATTR);
      nativeInput.removeAttribute(SUPPLIER_BUSINESS_NAME_LOADING_ATTR);
    }
  }

  function setSupplierBusinessNameStatus(text, kind) {
    const status = document.getElementById(SUPPLIER_BUSINESS_NAME_STATUS_ID);
    if (!status) return;
    status.textContent = text || '';
    status.style.color = kind === 'error' ? '#c43d3d' : '#6c757d';
  }

  function bindSupplierBusinessNameClearButton(helper, input) {
    const button = helper && helper.querySelector('[data-zweb-supplier-business-name-clear]');
    if (!button || button.getAttribute('data-zweb-bound') === 'true') return;
    button.setAttribute('data-zweb-bound', 'true');
    button.addEventListener('click', function(event) {
      event.preventDefault();
      event.stopPropagation();
      const current = getSupplierBusinessNameInput() || input;
      if (!current) return;
      if (current.getAttribute(SUPPLIER_BUSINESS_NAME_LOADING_ATTR) === 'true') {
        setSupplierBusinessNameStatus('Aguarde carregar o nome fantasia atual antes de limpar.', 'info');
        return;
      }
      current.removeAttribute('disabled');
      current.removeAttribute('readonly');
      current.disabled = false;
      current.readOnly = false;
      setInputValueAndNotify(current, '');
      current.focus();
      setSupplierBusinessNameStatus('Nome fantasia limpo. Clique em Salvar para enviar vazio ao Zweb.', 'info');
    }, true);
  }

  function ensureSupplierBusinessNameHelper(input, routeId) {
    const host = getSupplierBusinessNameFieldHost(input);
    if (!host) return;

    let helper = document.getElementById(SUPPLIER_BUSINESS_NAME_HELPER_ID);
    if (helper && helper.parentElement !== host) helper.remove();
    helper = document.getElementById(SUPPLIER_BUSINESS_NAME_HELPER_ID);

    if (!helper) {
      helper = document.createElement('div');
      helper.id = SUPPLIER_BUSINESS_NAME_HELPER_ID;
      helper.style.cssText = [
        'margin-top:6px',
        'display:flex',
        'align-items:center',
        'gap:8px',
        'flex-wrap:wrap',
        'font-size:12px',
        'line-height:1.35'
      ].join(';');
      host.appendChild(helper);
    }

    if (!helper.querySelector('#' + SUPPLIER_BUSINESS_NAME_STATUS_ID) || !helper.querySelector('[data-zweb-supplier-business-name-clear]')) {
      helper.innerHTML = [
        '<span id="' + SUPPLIER_BUSINESS_NAME_STATUS_ID + '" style="color:#6c757d;">A extensao vai salvar este valor, inclusive vazio.</span>',
        '<button type="button" data-zweb-supplier-business-name-clear="true" class="btn btn-sm btn-light" style="padding:2px 8px;font-size:11px;line-height:1.4;">Limpar</button>'
      ].join('');
    }
    helper.setAttribute(SUPPLIER_BUSINESS_NAME_ROUTE_ATTR, String(routeId || ''));
    bindSupplierBusinessNameClearButton(helper, input);
  }

  async function fetchPersonById(personId) {
    const payload = await postZwebJson(PERSON_API_URL, { id: personId }, 'personLookup');
    const list = Array.isArray(payload) ? payload : payload && Array.isArray(payload.data) ? payload.data : [];
    return list[0] || null;
  }

  function markSupplierBusinessNameInput(input, routeId) {
    if (!input) return;
    input.setAttribute(SUPPLIER_BUSINESS_NAME_FIELD_ATTR, 'true');
    input.setAttribute(SUPPLIER_BUSINESS_NAME_ROUTE_ATTR, String(routeId || ''));
    if (input.getAttribute(SUPPLIER_BUSINESS_NAME_LOADING_ATTR) !== 'true') {
      input.removeAttribute('disabled');
      input.removeAttribute('readonly');
      input.disabled = false;
      input.readOnly = false;
    }
  }

  async function hydrateSupplierBusinessNameFallback(input, routeId) {
    if (!input || !routeId) return;
    const routeKey = String(routeId);
    if (input.getAttribute('data-zweb-loaded-route') === routeKey) return;
    input.setAttribute('data-zweb-loaded-route', routeKey);
    input.setAttribute(SUPPLIER_BUSINESS_NAME_LOADING_ATTR, 'true');
    input.disabled = true;
    input.readOnly = true;
    setSupplierBusinessNameStatus('Carregando nome fantasia atual...', 'info');

    try {
      const person = await fetchPersonById(routeId);
      if (!isTargetPersonBusinessNameEditRoute() || String(getPersonBusinessNameEditRouteId()) !== routeKey) return;
      if (!input.getAttribute('data-zweb-user-edited')) {
        setInputValueAndNotify(input, person && person.businessName != null ? person.businessName : '');
      }
      input.removeAttribute(SUPPLIER_BUSINESS_NAME_LOADING_ATTR);
      input.disabled = false;
      input.readOnly = false;
      setSupplierBusinessNameStatus('A extensao vai salvar este valor, inclusive vazio.', 'info');
    } catch (error) {
      input.setAttribute(SUPPLIER_BUSINESS_NAME_LOADING_ATTR, 'true');
      input.disabled = true;
      input.readOnly = true;
      setSupplierBusinessNameStatus('Nao foi possivel carregar o nome fantasia automaticamente.', 'error');
    }
  }

  function createSupplierBusinessNameFallback(routeId) {
    const existing = getSupplierBusinessNameFallbackInput();
    if (existing) {
      const routeKey = String(routeId || '');
      markSupplierBusinessNameInput(existing, routeId);
      ensureSupplierBusinessNameHelper(existing, routeId);
      if (routeKey && existing.getAttribute('data-zweb-loaded-route') !== routeKey) {
        existing.removeAttribute('data-zweb-user-edited');
        setInputValueAndNotify(existing, '');
        hydrateSupplierBusinessNameFallback(existing, routeId);
      }
      return existing;
    }

    const anchor = document.getElementById('person.cityCode') || document.getElementById('content.name');
    const anchorHost = getSupplierBusinessNameFieldHost(anchor);
    if (!anchorHost || !anchorHost.parentElement) return null;

    const wrapper = document.createElement('div');
    wrapper.className = anchorHost.className || 'col-md-4';
    wrapper.setAttribute(SUPPLIER_BUSINESS_NAME_FALLBACK_ATTR, 'true');
    wrapper.innerHTML = [
      '<label for="' + SUPPLIER_BUSINESS_NAME_INPUT_ID + '" class="form-label">Nome fantasia</label>',
      '<input id="' + SUPPLIER_BUSINESS_NAME_INPUT_ID + '" class="form-control" maxlength="100" autocomplete="none" type="text" style="padding-left:17px;height:30px;">'
    ].join('');
    anchorHost.parentElement.insertBefore(wrapper, anchorHost.nextSibling);

    const input = wrapper.querySelector('#' + SUPPLIER_BUSINESS_NAME_INPUT_ID);
    if (input) {
      input.addEventListener('input', function() {
        input.setAttribute('data-zweb-user-edited', 'true');
      }, true);
      markSupplierBusinessNameInput(input, routeId);
      ensureSupplierBusinessNameHelper(input, routeId);
      hydrateSupplierBusinessNameFallback(input, routeId);
    }

    return input;
  }

  function ensureSupplierBusinessNameEditor() {
    if (!isTargetPersonBusinessNameEditRoute()) {
      removeSupplierBusinessNameEditor();
      return;
    }

    const routeId = getPersonBusinessNameEditRouteId();
    if (routeId == null) return;

    const nativeInput = getSupplierBusinessNameNativeInput();
    if (nativeInput) {
      const fallback = document.querySelector('[' + SUPPLIER_BUSINESS_NAME_FALLBACK_ATTR + '="true"]');
      if (fallback) fallback.remove();
      markSupplierBusinessNameInput(nativeInput, routeId);
      ensureSupplierBusinessNameHelper(nativeInput, routeId);
      return;
    }

    createSupplierBusinessNameFallback(routeId);
  }

  function normalizeItemSearchValue(e) {
    if (!isFeatureEnabled('itemSearchHashEnabled')) return;
    const input = e && e.target;
    if (!isTargetHashItemSearchInput(input)) return;
    applyNormalizedItemSearchValue(input);
    scheduleNormalizedItemSearchValue(input);
  }

  function normalizeFocusedItemSearchValue(event) {
    if (!isFeatureEnabled('itemSearchHashEnabled')) return;
    const input = event && event.target;
    if (!isTargetHashItemSearchInput(input)) return;
    syncFocusedHashItemSearchInput();
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

  function findNfeBoletoActionTrigger(target) {
    let el = target;
    for (let i = 0; i < 6 && el; i += 1, el = el.parentElement) {
      if (!el) break;
      const text = normalizeText(extractActionMenuItemLabel(el) || el.innerText || el.textContent || '');
      if (text !== 'gerar boleto') continue;
      return el.matches && el.matches('a, button') ? el : (el.querySelector && el.querySelector('a, button')) || el;
    }
    return null;
  }

  function createXmlDownloadRequestId() {
    return ['xml', Date.now(), Math.random().toString(36).slice(2, 8)].join('-');
  }

  function shouldUsePageBridge() {
    if (isTargetPurchaseRoute()) return true;
    if (isTargetNfceRoute()) return true;
    if (isTargetClientEditRoute()) return true;
    if (isTargetSupplierEditRoute()) return true;
    if (isTargetReferenceDataRoute()) return true;
    if (isTargetNfeListRoute() && isFeatureEnabled('xmlDownloadEnabled')) return true;
    if (isTargetNfeNewRoute() && isFeatureEnabled('itemSearchHashEnabled')) return true;
    if (isTargetProductRoute() && isFeatureEnabled('productPreferredSupplierBulkEnabled')) return true;
    return false;
  }

  function isTargetReferenceDataRoute() {
    const href = String(location.href || '').toLowerCase();
    return /(?:categor|payment|pagamento|installment|parcel|client|cliente|supplier|fornecedor|status|situat|trade)/.test(href);
  }

  function invalidateReferenceCaches(cacheKeys) {
    const nowAt = Date.now();
    const keys = [...new Set((Array.isArray(cacheKeys) ? cacheKeys : [])
      .filter(cacheKey => REFERENCE_CACHE_KEYS.has(cacheKey))
      .filter((cacheKey) => {
        const lastAt = LAST_REFERENCE_CACHE_INVALIDATION_AT.get(cacheKey) || 0;
        if (nowAt - lastAt < REFERENCE_CACHE_INVALIDATION_COOLDOWN_MS) return false;
        LAST_REFERENCE_CACHE_INVALIDATION_AT.set(cacheKey, nowAt);
        return true;
      }))];
    if (!keys.length) return;

    sendRuntimeMessage({ type: 'zweb-internal-cache-invalidate', keys })
      .catch((error) => console.warn('Falha ao descartar cache compartilhado do ZWeb:', error));
  }

  function ensurePageBridge() {
    if (!shouldUsePageBridge()) return;
    const resourceUrl = getExtensionResourceUrl('nucleo/page-bridge.js');
    if (!resourceUrl) return;

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
    script.src = resourceUrl + '?v=' + encodeURIComponent(XML_BRIDGE_VERSION);
    script.async = false;
    parent.appendChild(script);
  }

  function forwardXmlBridgePayload(payload) {
    if (!isFeatureEnabled('xmlDownloadEnabled')) return;
    if (!isTargetNfeListRoute()) return;
    const runtime = getRuntimeApi();
    if (!runtime || typeof runtime.sendMessage !== 'function') return;

    try {
      runtime.sendMessage(payload);
    } catch (err) {}
  }

  function firstObject(value) {
    const unwrapped = unwrapZwebPayload(value);
    if (Array.isArray(unwrapped)) {
      return unwrapped.find(function(item) { return item && typeof item === 'object'; }) || null;
    }
    return unwrapped && typeof unwrapped === 'object' ? unwrapped : null;
  }

  function getManualTerminalPrintContext(data) {
    const request = parseJson(data && data.requestBody || '') || {};
    const responseEnvelope = parseJson(data && data.responseText || '') || {};
    const response = firstObject(responseEnvelope) || {};
    const requestData = request.dados && typeof request.dados === 'object' ? request.dados : request;
    // A resposta entra na busca porque nem todo caminho da tela manda o
    // `checkout` no corpo da requisicao; quando manda, a requisicao vence.
    const responseData = response.dados && typeof response.dados === 'object' ? response.dados : response;
    const checkout = [requestData, request, responseData, response].reduce(function(achado, fonte) {
      if (achado) return achado;
      return fonte && typeof fonte.checkout === 'object' && fonte.checkout ? fonte.checkout : null;
    }, null) || {};
    const documentConfiguration = checkout.documentConfiguration && typeof checkout.documentConfiguration === 'object'
      ? checkout.documentConfiguration
      : {};
    const documentId = Number(response.id || requestData.id || request.id);
    // O `checkout` do documento NAO tem `id`. Quem casa com o `checkoutId` da
    // listagem do Terminal Zeta e o `configurationId` (medido na NFC-e 111464,
    // 22/09/2026: `configurationId: 19330` <-> `checkoutId: 19330` da listagem).
    // Ler `checkout.id` primeiro dava NaN e a impressao era ignorada em silencio.
    const checkoutId = Number(
      checkout.configurationId
      || requestData.checkoutId
      || request.checkoutId
      || checkout.id
    );
    const checkoutIdentification = String(checkout.identification || '').trim();
    const documentConfigurationId = Number(
      documentConfiguration.id
      || requestData.documentConfigurationId
      || request.documentConfigurationId
    );
    const authorized = Number(response.status) === 2
      || Boolean(response.chave || response['nfe-url'] || response['danfe-url']);

    return {
      documentId: Number.isFinite(documentId) && documentId > 0 ? documentId : null,
      checkoutId: Number.isFinite(checkoutId) && checkoutId > 0 ? checkoutId : null,
      checkoutIdentification: checkoutIdentification,
      documentConfigurationId: Number.isFinite(documentConfigurationId) && documentConfigurationId > 0
        ? documentConfigurationId
        : null,
      authorized: authorized,
      hasError: Boolean(response.errorMessage || response.error_message)
    };
  }

  async function maybePrintAuthorizedNfceAtTerminalZeta(data) {
    if (!isFeatureEnabled('terminalZetaManualPrintEnabled')) return false;

    const context = getManualTerminalPrintContext(data);
    if (!context.authorized || context.hasError) return false;
    if (!context.documentId || !context.checkoutId || !context.documentConfigurationId) {
      console.warn(
        '[Assistente Zweb] Impressão explícita ignorada: NFC-e sem documento, checkout ou configuração fiscal identificável.',
        { documentId: context.documentId, checkoutId: context.checkoutId, documentConfigurationId: context.documentConfigurationId }
      );
      return false;
    }
    if (
      TERMINAL_ZETA_PRINTED_DOCUMENT_IDS.has(context.documentId)
      || TERMINAL_ZETA_PRINTING_DOCUMENT_IDS.has(context.documentId)
    ) return false;

    TERMINAL_ZETA_PRINTING_DOCUMENT_IDS.add(context.documentId);
    try {
      const fiscalConfigurationResponse = await postZwebJson(
        FISCAL_GET_CONFIGURATION_API_URL,
        { id: context.documentConfigurationId },
        'terminalZetaManualPrint'
      );
      const fiscalConfiguration = firstObject(fiscalConfigurationResponse);
      if (!fiscalConfiguration || fiscalConfiguration.printTerminalZetaOnAuthorized !== false) {
        console.info('[Assistente Zweb] Impressão explícita ignorada porque a impressão automática do Terminal Zeta ainda está ligada ou não pôde ser confirmada como desligada.');
        return false;
      }

      const checkoutLinksResponse = await postZwebJson(
        TERMINAL_ZETA_CHECKOUTS_API_URL,
        {},
        'terminalZetaManualPrint'
      );
      const checkoutLinks = unwrapZwebPayload(checkoutLinksResponse);
      const linksValidos = Array.isArray(checkoutLinks)
        ? checkoutLinks.filter(function(item) { return item && Number(item.configuration) > 0; })
        : [];
      // Casa pelo id do checkout; se a listagem nao trouxer esse id, cai para a
      // identificacao do caixa ("001"), que e o que a tela mostra ao operador.
      const checkoutLink = linksValidos.find(function(item) {
        return Number(item.checkoutId) === context.checkoutId;
      }) || (context.checkoutIdentification
        ? linksValidos.find(function(item) {
            return String(item.identification || '').trim() === context.checkoutIdentification;
          })
        : null);
      if (!checkoutLink) {
        console.warn(
          '[Assistente Zweb] Impressão explícita ignorada: checkout sem Terminal Zeta associado.',
          { checkoutId: context.checkoutId, identificacao: context.checkoutIdentification, vinculos: linksValidos.length }
        );
        return false;
      }

      await postZwebJson(
        TERMINAL_ZETA_PRINT_API_URL,
        {
          id: context.documentId,
          terminalConfigurationId: Number(checkoutLink.configuration)
        },
        'terminalZetaManualPrint'
      );
      TERMINAL_ZETA_PRINTED_DOCUMENT_IDS.add(context.documentId);
      console.info('[Assistente Zweb] DANFCE enviado explicitamente ao Terminal Zeta.');
      return true;
    } finally {
      TERMINAL_ZETA_PRINTING_DOCUMENT_IDS.delete(context.documentId);
    }
  }

  function handleXmlBridgeMessage(event) {
    if (event.type !== XML_BRIDGE_SOURCE && event.source !== window) return;

    const data = event && (event.detail || event.data);
    if (!data || data.source !== XML_BRIDGE_SOURCE) return;

    if (data.type === 'product-paginate-request' && data.payload && typeof data.payload === 'object') {
      LAST_PRODUCT_PAGINATE_REQUEST_PAYLOAD = Object.assign({}, data.payload);
      return;
    }

    if (data.type === 'reference-cache-change') {
      invalidateReferenceCaches(data.cacheKeys);
      return;
    }

    if (data.type === 'nfe-list-response' && data.payload && typeof data.payload === 'object') {
      handleNfeListApiResponsePayload(data.payload);
      return;
    }

    if (data.type === 'document-negative-stock-configuration-request' && data.payload && typeof data.payload === 'object') {
      handleDocumentNegativeStockConfigurationRequest(data);
      return;
    }
    if (data.type === 'negative-stock-native-read-result') {
      sendRuntimeMessage({ type: 'document-negative-stock-browser-result', leaseId: data.leaseId, enabled: data.enabled, reason: data.reason, token: getZwebToken() })
        .then(reply => {
          if (negativeStockNativeRequest?.leaseId === data.leaseId && negativeStockNativeRequest.generation === negativeStockUiGeneration && reply?.ok && typeof reply.payload?.enabled === 'boolean' && isTargetDocumentConfigurationRoute()) {
            window.postMessage({ source: 'zweb-negative-stock-ui-sync', enabled: reply.payload.enabled }, location.origin);
          } else if (!reply?.ok) console.warn('[zweb] Nao foi possivel conferir o estado visual do estoque.', reply?.message);
        }).catch(() => console.warn('[zweb] Conferencia de estoque interrompida.'));
      return;
    }

    if (data.type === 'pdv-nfce-transmit-result') {
      applyPdvCashCounterSale(data.requestBody || '', data.responseText || '');
      PDV_CASH_COUNTER_LAST_API_SYNC_AT = 0;
      schedulePdvCashCounterApiSync(true);
      maybePrintAuthorizedNfceAtTerminalZeta(data).catch(function(error) {
        console.error('[Assistente Zweb] Falha na impressão explícita do Terminal Zeta:', error);
      });
      return;
    }

    if (data.type === 'fiscal-cancel-request-log') {
      logFiscalCloneDav('fiscal-cancel-request-log', {
        url: data.url || '',
        requestBody: data.requestBody || '',
        responseText: data.responseText || '',
        status: data.status || 0
      });
      handleFiscalCloneAfterCancelLog(data);
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
    if (!isTargetNfeListRoute()) return;
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

  function handleNfeCashSaleBoletoGuard(event) {
    if (!isTargetNfeRoute()) return;
    if (!isFeatureEnabled('nfeCashSaleBoletoGuardEnabled')) return;
    if (NFE_BATCH_DOWNLOAD_INTERNAL_CLICK || NFE_CASH_SALE_BOLETO_INTERNAL_CLICK) return;
    if (event && event.type === 'pointerdown' && event.button !== 0) return;

    const warningModal = document.getElementById(NFE_BOLETO_WARNING_MODAL_ID);
    if (warningModal && warningModal.style.display !== 'none') {
      event.preventDefault();
      event.stopImmediatePropagation();
      event.stopPropagation();
      return;
    }

    const trigger = findNfeBoletoActionTrigger(event && event.target);
    if (!trigger) return;

    const cashSaleEntries = getNfeRowsForBoletoGuard().filter((entry) => entry && entry.isCashSale);
    if (!cashSaleEntries.length) return;

    event.preventDefault();
    event.stopImmediatePropagation();
    event.stopPropagation();
    openNfeCashSaleBoletoWarning(trigger, cashSaleEntries);
  }

  function handleClientIdentificationSaveSync(event) {
    if (!event || !event.target || !isTargetClientEditRoute()) return;
    const control = event.target.closest
      ? event.target.closest('button, a, [role="button"], input[type="button"], input[type="submit"]')
      : null;
    if (!control) return;

    const label = normalizeText(control.innerText || control.textContent || control.value || '');
    if (label !== 'salvar') return;

    syncClientIdentificationValueForPersist(document.getElementById('content.identification'));
  }

  function getDocumentNegativeStockGuardDurationMs() {
    const raw = document.documentElement && document.documentElement.dataset
      ? Number(document.documentElement.dataset.zwebNegativeStockGuardDurationMs)
      : 0;
    return Number.isFinite(raw) && raw >= 1000
      ? raw
      : DOCUMENT_NEGATIVE_STOCK_GUARD_DEFAULT_DURATION_MS;
  }

  function getDocumentNegativeStockGuardWarningMs() {
    const durationMs = getDocumentNegativeStockGuardDurationMs();
    const raw = document.documentElement && document.documentElement.dataset
      ? Number(document.documentElement.dataset.zwebNegativeStockGuardWarningMs)
      : 0;
    const warningMs = Number.isFinite(raw) && raw >= 500
      ? raw
      : DOCUMENT_NEGATIVE_STOCK_GUARD_DEFAULT_WARNING_MS;
    return Math.max(0, Math.min(warningMs, Math.max(0, durationMs - 500)));
  }

  function formatDocumentNegativeStockDurationLabel(durationMs) {
    const totalSeconds = Math.max(1, Math.round((Number(durationMs) || 0) / 1000));
    if (totalSeconds >= 60) {
      const minutes = Math.floor(totalSeconds / 60);
      const seconds = totalSeconds % 60;
      if (!seconds) return minutes === 1 ? '1 minuto' : minutes + ' minutos';
      const minuteLabel = minutes === 1 ? '1 minuto' : minutes + ' minutos';
      const secondLabel = seconds === 1 ? '1 segundo' : seconds + ' segundos';
      return minuteLabel + ' e ' + secondLabel;
    }
    return totalSeconds === 1 ? '1 segundo' : totalSeconds + ' segundos';
  }

  function createDocumentNegativeStockBrowserId() {
    try {
      if (window.crypto && typeof window.crypto.randomUUID === 'function') {
        return window.crypto.randomUUID();
      }
    } catch (error) {}
    return 'browser-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2);
  }

  function getDocumentNegativeStockBrowserId() {
    try {
      if (!window.localStorage) return '';
      let value = String(window.localStorage.getItem(DOCUMENT_NEGATIVE_STOCK_GUARD_BROWSER_ID_STORAGE_KEY) || '').trim();
      if (!value) {
        value = createDocumentNegativeStockBrowserId();
        window.localStorage.setItem(DOCUMENT_NEGATIVE_STOCK_GUARD_BROWSER_ID_STORAGE_KEY, value);
      }
      return value;
    } catch (error) {
      return '';
    }
  }

  function readDocumentNegativeStockGuardOwner() {
    try {
      const owner = parseJson(window.localStorage && window.localStorage.getItem(DOCUMENT_NEGATIVE_STOCK_GUARD_OWNER_STORAGE_KEY));
      if (!owner || typeof owner !== 'object') return null;
      const browserId = String(owner.browserId || '').trim();
      const expiresAt = Number(owner.expiresAt) || 0;
      if (!browserId || !expiresAt) return null;
      return {
        browserId,
        openedAt: Number(owner.openedAt) || 0,
        expiresAt
      };
    } catch (error) {
      return null;
    }
  }

  function writeDocumentNegativeStockGuardOwner(expiresAt) {
    const value = Number(expiresAt) || 0;
    const browserId = getDocumentNegativeStockBrowserId();
    if (!value || !browserId) return null;

    const previous = readDocumentNegativeStockGuardOwner();
    const owner = {
      browserId,
      openedAt: previous && previous.browserId === browserId && previous.openedAt ? previous.openedAt : Date.now(),
      expiresAt: value
    };

    try {
      window.localStorage && window.localStorage.setItem(DOCUMENT_NEGATIVE_STOCK_GUARD_OWNER_STORAGE_KEY, JSON.stringify(owner));
    } catch (error) {}
    return owner;
  }

  function clearDocumentNegativeStockGuardOwner() {
    try {
      window.localStorage && window.localStorage.removeItem(DOCUMENT_NEGATIVE_STOCK_GUARD_OWNER_STORAGE_KEY);
    } catch (error) {}
  }

  function isDocumentNegativeStockGuardLocalOwner() {
    const owner = readDocumentNegativeStockGuardOwner();
    const browserId = getDocumentNegativeStockBrowserId();
    return !!(owner && browserId && owner.browserId === browserId);
  }

  function claimDocumentNegativeStockGuardLocalOwner(expiresAt) {
    const value = Number(expiresAt) || 0;
    if (!value || value <= Date.now()) return false;
    writeDocumentNegativeStockGuardOwner(value);
    writeDocumentNegativeStockGuardExpiresAt(value);
    return true;
  }

  function scheduleDocumentNegativeStockBackgroundDisable(expiresAt) {
    const value = Number(expiresAt) || 0;
    if (!value || value <= Date.now()) return;
    if (!isDocumentNegativeStockGuardLocalOwner()) return;

    try {
      sendRuntimeMessage({
        type: 'document-negative-stock-schedule-disable',
        token: getZwebToken(),
        expiresAt: value,
        ownerBrowserId: getDocumentNegativeStockBrowserId()
      }).catch(() => {});
    } catch (error) {}
  }

  function clearDocumentNegativeStockBackgroundDisable() {
    try {
      sendRuntimeMessage({ type: 'document-negative-stock-clear-disable' }).catch(() => {});
    } catch (error) {}
  }

  function escapeDocumentNegativeStockToastText(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function showDocumentNegativeStockNativeToastClone(snapshot) {
    if (!document.body) return;

    const previous = document.getElementById(DOCUMENT_NEGATIVE_STOCK_NATIVE_TOAST_ID);
    if (previous) previous.remove();

    if (!document.getElementById(DOCUMENT_NEGATIVE_STOCK_NATIVE_TOAST_STYLE_ID)) {
      const style = document.createElement('style');
      style.id = DOCUMENT_NEGATIVE_STOCK_NATIVE_TOAST_STYLE_ID;
      style.textContent = [
        '#' + DOCUMENT_NEGATIVE_STOCK_NATIVE_TOAST_ID + ' { position: fixed; right: 22px; top: 76px; z-index: 2147483647; max-width: min(420px, calc(100vw - 24px)); }',
        '#' + DOCUMENT_NEGATIVE_STOCK_NATIVE_TOAST_ID + ' [data-zweb-fallback-toast] { background: #ffffff; color: #202124; border-left: 4px solid #24a148; border-radius: 8px; box-shadow: 0 10px 32px rgba(15, 23, 42, 0.22); padding: 14px 16px; font-size: 13px; line-height: 1.45; }',
        '#' + DOCUMENT_NEGATIVE_STOCK_NATIVE_TOAST_ID + ' [data-zweb-fallback-toast-title] { font-weight: 700; margin-bottom: 2px; }'
      ].join('\n');
      (document.head || document.documentElement).appendChild(style);
    }

    const host = document.createElement('div');
    host.id = DOCUMENT_NEGATIVE_STOCK_NATIVE_TOAST_ID;

    const html = snapshot && typeof snapshot.html === 'string' ? snapshot.html.trim() : '';
    if (html) {
      const template = document.createElement('template');
      template.innerHTML = html;
      const node = template.content && template.content.firstElementChild;
      if (node) {
        host.appendChild(node);
      }
    }

    if (!host.firstElementChild) {
      const text = snapshot && snapshot.text ? String(snapshot.text) : 'Configuração salva com sucesso.';
      host.innerHTML = [
        '<div data-zweb-fallback-toast>',
        '  <div data-zweb-fallback-toast-title>Sucesso</div>',
        '  <div>' + escapeDocumentNegativeStockToastText(text) + '</div>',
        '</div>'
      ].join('');
    }

    document.body.appendChild(host);
    window.setTimeout(() => {
      const current = document.getElementById(DOCUMENT_NEGATIVE_STOCK_NATIVE_TOAST_ID);
      if (current) current.remove();
    }, 5200);
  }

  function requestDocumentNegativeStockForceDisableNow() {
    try {
      return sendRuntimeMessage({
        type: 'document-negative-stock-force-disable-now',
        token: getZwebToken()
      }).then((response) => {
        if (response && response.ok !== false) {
          showDocumentNegativeStockNativeToastClone(response.notification || response.visualResult && response.visualResult.notification);
        }
        return response;
      }).catch(() => null);
    } catch (error) {
      return Promise.resolve(null);
    }
  }

  function readDocumentNegativeStockForceDisablePending() {
    try {
      return window.localStorage && window.localStorage.getItem(DOCUMENT_NEGATIVE_STOCK_FORCE_DISABLE_STORAGE_KEY) === 'true';
    } catch (error) {
      return false;
    }
  }

  function writeDocumentNegativeStockForceDisablePending(enabled) {
    try {
      if (!window.localStorage) return;
      if (enabled) {
        window.localStorage.setItem(DOCUMENT_NEGATIVE_STOCK_FORCE_DISABLE_STORAGE_KEY, 'true');
      } else {
        window.localStorage.removeItem(DOCUMENT_NEGATIVE_STOCK_FORCE_DISABLE_STORAGE_KEY);
      }
    } catch (error) {}
  }

  function readDocumentNegativeStockGuardExpiresAt() {
    try {
      const value = Number(window.localStorage && window.localStorage.getItem(DOCUMENT_NEGATIVE_STOCK_GUARD_STORAGE_KEY));
      return Number.isFinite(value) && value > 0 ? value : 0;
    } catch (error) {
      return DOCUMENT_NEGATIVE_STOCK_GUARD_STATE.expiresAt || 0;
    }
  }

  function writeDocumentNegativeStockGuardExpiresAt(expiresAt) {
    const value = Number(expiresAt) || 0;
    DOCUMENT_NEGATIVE_STOCK_GUARD_STATE.expiresAt = value;

    if (document.documentElement && document.documentElement.dataset) {
      if (value > 0) {
        document.documentElement.dataset.zwebDocumentNegativeStockGuardExpiresAt = String(value);
      } else {
        delete document.documentElement.dataset.zwebDocumentNegativeStockGuardExpiresAt;
      }
    }

    try {
      if (!window.localStorage) return;
      if (value > 0) {
        window.localStorage.setItem(DOCUMENT_NEGATIVE_STOCK_GUARD_STORAGE_KEY, String(value));
      } else {
        window.localStorage.removeItem(DOCUMENT_NEGATIVE_STOCK_GUARD_STORAGE_KEY);
      }
    } catch (error) {}

    if (value > 0) {
      scheduleDocumentNegativeStockBackgroundDisable(value);
    }
  }

  function getDocumentNegativeStockConfigurationEmitter(payload) {
    return payload
      && typeof payload === 'object'
      && !Array.isArray(payload)
      && payload.fiscal
      && typeof payload.fiscal === 'object'
      && payload.fiscal.emissor
      && typeof payload.fiscal.emissor === 'object'
      ? payload.fiscal.emissor
      : null;
  }

  function hasDocumentNegativeStockConfigurationPayload(payload) {
    const emitter = getDocumentNegativeStockConfigurationEmitter(payload);
    return !!(emitter && Object.prototype.hasOwnProperty.call(emitter, 'isAllowedNegativeStock'));
  }

  function readDocumentNegativeStockConfigurationPayload() {
    try {
      const payload = parseJson(window.localStorage && window.localStorage.getItem(DOCUMENT_NEGATIVE_STOCK_CONFIGURATION_STORAGE_KEY));
      return hasDocumentNegativeStockConfigurationPayload(payload) ? payload : null;
    } catch (error) {
      return null;
    }
  }

  function writeDocumentNegativeStockConfigurationPayload(payload) {
    if (!hasDocumentNegativeStockConfigurationPayload(payload)) return false;
    try {
      window.localStorage && window.localStorage.setItem(DOCUMENT_NEGATIVE_STOCK_CONFIGURATION_STORAGE_KEY, JSON.stringify(payload));
      return true;
    } catch (error) {
      return false;
    }
  }

  function setDocumentNegativeStockConfigurationEnabled(payload, enabled) {
    const emitter = getDocumentNegativeStockConfigurationEmitter(payload);
    if (!emitter) return false;
    emitter.isAllowedNegativeStock = enabled === true;
    return true;
  }

  function isDocumentNegativeStockStoredConfigurationEnabled() {
    const payload = readDocumentNegativeStockConfigurationPayload();
    const emitter = getDocumentNegativeStockConfigurationEmitter(payload);
    return !!(emitter && emitter.isAllowedNegativeStock === true);
  }

  function updateDocumentNegativeStockStoredConfigurationEnabled(enabled) {
    const payload = readDocumentNegativeStockConfigurationPayload();
    if (!payload || !setDocumentNegativeStockConfigurationEnabled(payload, enabled)) return false;
    return writeDocumentNegativeStockConfigurationPayload(payload);
  }

  function getDocumentNegativeStockDashboardClient(payload) {
    const root = payload && payload.data && typeof payload.data === 'object' ? payload.data : payload;
    if (!root || typeof root !== 'object') return null;
    return root['get-client'] || root.getClient || null;
  }

  async function fetchDocumentNegativeStockConfigurationPayload() {
    try {
      const response = await sendRuntimeMessage({
        type: 'document-negative-stock-get-configuration',
        token: getZwebToken()
      });
      if (response && response.ok === true && hasDocumentNegativeStockConfigurationPayload(response.payload)) {
        writeDocumentNegativeStockConfigurationPayload(response.payload);
        return response.payload;
      }
      if (response && response.message) {
        throw new Error(response.message);
      }
    } catch (error) {
      // Fallback direto mantem compatibilidade se o service worker ainda estiver reiniciando.
    }

    const payload = await postZwebJson(BFF_DASHBOARD_API_URL, {
      'get-client': {
        request: true
      }
    }, 'negativeStockAutomaticClose');
    const client = getDocumentNegativeStockDashboardClient(payload);
    if (!hasDocumentNegativeStockConfigurationPayload(client)) return null;
    writeDocumentNegativeStockConfigurationPayload(client);
    return client;
  }

  async function persistDocumentNegativeStockConfigurationPayload(payload) {
    try {
      const response = await sendRuntimeMessage({
        type: 'document-negative-stock-put-configuration',
        token: getZwebToken(),
        payload
      });
      if (response && response.ok === true) return response.payload;
      if (response && response.message) {
        throw new Error(response.message);
      }
    } catch (error) {
      // Fallback direto mantem a desativacao funcionando em versoes antigas do background.
    }

    return await postZwebJson(APPLICATION_PUT_CONFIGURATION_API_URL, payload, 'negativeStockAutomaticClose');
  }

  async function getDocumentNegativeStockConfigurationPayloadForDisable() {
    const stored = readDocumentNegativeStockConfigurationPayload();
    if (stored) return stored;

    try {
      return await fetchDocumentNegativeStockConfigurationPayload();
    } catch (error) {
      return null;
    }
  }

  function ensureDocumentNegativeStockGuardStartedFromStoredConfiguration() {
    if (!isDocumentNegativeStockStoredConfigurationEnabled()) return false;
    if (!isDocumentNegativeStockGuardLocalOwner()) {
      writeDocumentNegativeStockGuardExpiresAt(0);
      clearDocumentNegativeStockBackgroundDisable();
      return false;
    }

    const nowAt = Date.now();
    const expiresAt = readDocumentNegativeStockGuardExpiresAt() || DOCUMENT_NEGATIVE_STOCK_GUARD_STATE.expiresAt || 0;
    if (expiresAt > nowAt) return true;

    writeDocumentNegativeStockGuardExpiresAt(nowAt + getDocumentNegativeStockGuardDurationMs());
    DOCUMENT_NEGATIVE_STOCK_GUARD_STATE.warningShownFor = 0;
    return true;
  }

  function handleDocumentNegativeStockConfigurationRequest(data) {
    sendRuntimeMessage({
      type: 'document-negative-stock-observed',
      enabled: data.enabled === true,
      confirmedWrite: data.confirmedWrite === true,
      token: getZwebToken()
    }).catch(() => {});
  }

  function findDocumentNegativeStockGuardRow() {
    const root = document.getElementById('inventory') || document;
    const input = root.querySelector('input#isAllowedNegativeStock, input[id="isAllowedNegativeStock"]');
    if (input) {
      return input.closest('.row, [class~="row"], .v-row, [class*="row"]')
        || input.parentElement && input.parentElement.parentElement
        || input.parentElement
        || null;
    }

    const targetText = normalizeText(DOCUMENT_NEGATIVE_STOCK_LABEL);
    const rows = Array.from(root.querySelectorAll('.row, [class~="row"], .v-row, [class*="row"]'));

    return rows.find((row) => {
      const text = normalizeText(row.innerText || row.textContent || '');
      return text.indexOf(targetText) !== -1;
    }) || null;
  }

  function getDocumentNegativeStockGuardControls() {
    const row = findDocumentNegativeStockGuardRow();
    if (!row) return null;

    const input = row.querySelector('input#isAllowedNegativeStock, input[id="isAllowedNegativeStock"], input[type="checkbox"]');
    const clickableSelectors = [
      '.v-selection-control__input',
      '.v-selection-control__wrapper',
      '.v-selection-control',
      '.v-switch__track',
      '.z-switch-control',
      '.z-switch'
    ];
    const clickable = clickableSelectors
      .map((selector) => row.querySelector(selector))
      .find((candidate) => candidate && isVisible(candidate))
      || input
      || row.querySelector('[role="switch"], button, label');

    return {
      row,
      input,
      clickable
    };
  }

  function isDocumentNegativeStockGuardSwitchOn(controls) {
    if (!controls) return false;
    const input = controls.input;
    if (input && typeof input.checked === 'boolean') return !!input.checked;

    const ariaTarget = controls.clickable || controls.row;
    const ariaChecked = ariaTarget && ariaTarget.getAttribute ? ariaTarget.getAttribute('aria-checked') : '';
    if (ariaChecked === 'true') return true;
    if (ariaChecked === 'false') return false;

    return !!(controls.row && controls.row.querySelector('.z-switch-checked, .v-selection-control--dirty[aria-checked="true"]'));
  }

  function ensureDocumentNegativeStockRemoteLockStyle() {
    const style = document.getElementById(DOCUMENT_NEGATIVE_STOCK_REMOTE_LOCK_STYLE_ID);
    if (style) style.remove();
  }

  function isDocumentNegativeStockRemoteLocked(controls) {
    return false;
  }

  function applyDocumentNegativeStockRemoteLock(controls) {
    const current = controls || getDocumentNegativeStockGuardControls();
    const row = current && current.row;
    ensureDocumentNegativeStockRemoteLockStyle();
    if (row) {
      row.removeAttribute(DOCUMENT_NEGATIVE_STOCK_REMOTE_LOCK_ATTR);
      row.removeAttribute('title');
    }
    if (current && current.input) current.input.removeAttribute('aria-disabled');

    return false;
  }

  function clickDocumentNegativeStockGuardSwitch(controls) {
    if (!controls) return false;
    const target = controls.clickable || controls.input;
    if (!target) return false;

    try {
      DOCUMENT_NEGATIVE_STOCK_GUARD_STATE.internalSwitchMutationUntil = Date.now() + 500;
      clickLikeUser(target);
      scheduleFeatureUiRefresh(220);
      window.setTimeout(() => scheduleFeatureUiRefresh(0), 900);
      return true;
    } catch (error) {
      return false;
    }
  }

  function forceDocumentNegativeStockGuardUiOff() {
    const controls = getDocumentNegativeStockGuardControls();
    if (!controls) return;

    const input = controls.input;
    DOCUMENT_NEGATIVE_STOCK_GUARD_STATE.internalSwitchMutationUntil = Date.now() + 500;
    if (input && typeof input.checked === 'boolean') {
      try {
        const descriptor = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'checked');
        if (descriptor && descriptor.set) {
          descriptor.set.call(input, false);
        } else {
          input.checked = false;
        }
      } catch (error) {
        input.checked = false;
      }

      input.dispatchEvent(new Event('input', { bubbles: true, composed: true }));
      input.dispatchEvent(new Event('change', { bubbles: true, composed: true }));
    }

    if (controls.row) {
      Array.from(controls.row.querySelectorAll('.z-switch-checked')).forEach((node) => {
        node.classList.remove('z-switch-checked');
      });
      Array.from(controls.row.querySelectorAll('[aria-checked="true"], [role="switch"]')).forEach((node) => {
        if (node && node.setAttribute) node.setAttribute('aria-checked', 'false');
      });
    }
  }

  function clearDocumentNegativeStockGuardTimer() {
    if (!DOCUMENT_NEGATIVE_STOCK_GUARD_STATE.timer) return;
    window.clearTimeout(DOCUMENT_NEGATIVE_STOCK_GUARD_STATE.timer);
    DOCUMENT_NEGATIVE_STOCK_GUARD_STATE.timer = 0;
  }

  function closeDocumentNegativeStockGuardModal() {
    DOCUMENT_NEGATIVE_STOCK_GUARD_STATE.closingModal = true;
    const modal = document.getElementById(DOCUMENT_NEGATIVE_STOCK_GUARD_MODAL_ID);
    const backdrop = document.getElementById(DOCUMENT_NEGATIVE_STOCK_GUARD_BACKDROP_ID);
    hideExtensionNativeModal(modal, backdrop);
    window.setTimeout(() => {
      DOCUMENT_NEGATIVE_STOCK_GUARD_STATE.closingModal = false;
    }, EXTENSION_DIALOG_TRANSITION_MS + 180);
  }

  function isDocumentNegativeStockGuardModalActive() {
    const modal = document.getElementById(DOCUMENT_NEGATIVE_STOCK_GUARD_MODAL_ID);
    return !!(modal && modal.classList.contains('show') && modal.style.display !== 'none');
  }

  function isDocumentNegativeStockGuardModalTarget(target) {
    const modal = document.getElementById(DOCUMENT_NEGATIVE_STOCK_GUARD_MODAL_ID);
    return !!(modal && target && modal.contains(target));
  }

  function focusDocumentNegativeStockGuardModal() {
    const modal = document.getElementById(DOCUMENT_NEGATIVE_STOCK_GUARD_MODAL_ID);
    if (!modal) return;
    const keepButton = modal.querySelector('[data-document-negative-stock-keep]:not([disabled])');
    const focusTarget = keepButton || modal;
    try {
      focusTarget.focus({ preventScroll: true });
    } catch (error) {
      try {
        focusTarget.focus();
      } catch (innerError) {}
    }
  }

  function blockDocumentNegativeStockGuardModalEscape(event) {
    if (!event) return;
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();
    focusDocumentNegativeStockGuardModal();
  }

  function handleDocumentNegativeStockGuardModalBlock(event) {
    if (!isDocumentNegativeStockGuardModalActive()) return;
    if (isDocumentNegativeStockGuardModalTarget(event && event.target)) {
      if (event.type === 'keydown' && event.key === 'Escape') {
        blockDocumentNegativeStockGuardModalEscape(event);
      }
      return;
    }

    if (event.type === 'keydown' && event.key === 'Tab') {
      focusDocumentNegativeStockGuardModal();
    }

    blockDocumentNegativeStockGuardModalEscape(event);
  }

  function handleDocumentNegativeStockGuardBeforeUnload(event) {
    if (!isDocumentNegativeStockGuardModalActive()) return;
    if (!isDocumentNegativeStockGuardLocalOwner()) return;
    const message = 'A liberação de estoque está pendente. Use Manter ou aguarde a desativação automática.';
    event.preventDefault();
    event.returnValue = message;
    return message;
  }

  function resetDocumentNegativeStockGuard(clearStorage) {
    clearDocumentNegativeStockGuardTimer();
    DOCUMENT_NEGATIVE_STOCK_GUARD_STATE.expiresAt = 0;
    DOCUMENT_NEGATIVE_STOCK_GUARD_STATE.warningShownFor = 0;
    DOCUMENT_NEGATIVE_STOCK_GUARD_STATE.disabling = false;
    DOCUMENT_NEGATIVE_STOCK_GUARD_STATE.apiDisabling = false;
    DOCUMENT_NEGATIVE_STOCK_GUARD_STATE.closingModal = false;
    closeDocumentNegativeStockGuardModal();
    if (clearStorage) {
      writeDocumentNegativeStockGuardExpiresAt(0);
      clearDocumentNegativeStockGuardOwner();
    }
  }

  async function disableDocumentNegativeStockGuardByApi(trigger) {
    if (DOCUMENT_NEGATIVE_STOCK_GUARD_STATE.apiDisabling) return;
    const isManualTrigger = trigger === 'manual-current' || trigger === 'manual-hidden';
    if (!isManualTrigger && !isDocumentNegativeStockGuardLocalOwner()) {
      writeDocumentNegativeStockGuardExpiresAt(0);
      clearDocumentNegativeStockBackgroundDisable();
      applyDocumentNegativeStockRemoteLock();
      closeDocumentNegativeStockGuardModal();
      return;
    }
    writeDocumentNegativeStockForceDisablePending(true);

    const payload = await getDocumentNegativeStockConfigurationPayloadForDisable();
    if (!payload || !setDocumentNegativeStockConfigurationEnabled(payload, false)) {
      const controls = getDocumentNegativeStockGuardControls();
      if (controls && isDocumentNegativeStockGuardSwitchOn(controls)) {
        clickDocumentNegativeStockGuardSwitch(controls);
        scheduleDocumentNegativeStockGuard(1200);
        return;
      }
      resetDocumentNegativeStockGuard(true);
      if (trigger === 'manual-current' || trigger === 'manual-hidden') {
        clearDocumentNegativeStockBackgroundDisable();
      }
      if (trigger === 'manual-hidden') {
        requestDocumentNegativeStockForceDisableNow();
      }
      return;
    }

    DOCUMENT_NEGATIVE_STOCK_GUARD_STATE.apiDisabling = true;
    closeDocumentNegativeStockGuardModal();

    try {
      await persistDocumentNegativeStockConfigurationPayload(payload);
      writeDocumentNegativeStockConfigurationPayload(payload);
      forceDocumentNegativeStockGuardUiOff();
      updateDocumentNegativeStockStoredConfigurationEnabled(false);
      resetDocumentNegativeStockGuard(true);
      if (trigger === 'manual-current' || trigger === 'manual-hidden') {
        clearDocumentNegativeStockBackgroundDisable();
      }
      if (trigger === 'manual-hidden') {
        requestDocumentNegativeStockForceDisableNow();
      }
    } catch (error) {
      DOCUMENT_NEGATIVE_STOCK_GUARD_STATE.apiDisabling = false;
      scheduleDocumentNegativeStockGuard(15000);
    }
  }

  function applyDocumentNegativeStockGuardModalTheme(modal) {
    if (!modal) return;
    const theme = getExtensionOverlayTheme(modal.parentElement || document.body);
    const compact = window.innerWidth < 560;
    const dialog = modal.querySelector('[data-document-negative-stock-dialog]');
    const content = modal.querySelector('.modal-content');
    const title = modal.querySelector('[data-document-negative-stock-title]');
    const details = modal.querySelector('[data-document-negative-stock-details]');

    if (dialog) {
      dialog.style.maxWidth = compact ? 'calc(100vw - 16px)' : '460px';
      dialog.style.margin = compact ? '8px auto' : '';
    }
    if (content) {
      content.style.background = theme.modalBackground;
      content.style.border = theme.modalBorder;
      content.style.boxShadow = theme.modalBoxShadow;
      content.style.color = theme.bodyColor;
    }
    if (title) title.style.color = theme.titleColor;
    if (details) {
      details.style.background = theme.cardBackground;
      details.style.border = theme.cardBorder;
      details.style.color = theme.cardTextColor;
    }
  }

  function ensureDocumentNegativeStockGuardModal() {
    if (!document.body) return;

    if (!document.getElementById(DOCUMENT_NEGATIVE_STOCK_GUARD_BACKDROP_ID)) {
      const backdrop = document.createElement('div');
      backdrop.id = DOCUMENT_NEGATIVE_STOCK_GUARD_BACKDROP_ID;
      backdrop.className = 'modal-backdrop fade';
      backdrop.style.cssText = [
        'display:none',
        'position:fixed',
        'inset:0',
        'background:rgba(3, 8, 16, 0.62)',
        'z-index:2147483645'
      ].join(';');
      document.body.appendChild(backdrop);
    }

    if (!document.getElementById(DOCUMENT_NEGATIVE_STOCK_GUARD_MODAL_ID)) {
      const modal = document.createElement('div');
      modal.id = DOCUMENT_NEGATIVE_STOCK_GUARD_MODAL_ID;
      modal.className = 'modal fade';
      modal.tabIndex = -1;
      modal.setAttribute('role', 'dialog');
      modal.setAttribute('aria-modal', 'true');
      modal.setAttribute('aria-hidden', 'true');
      modal.style.cssText = [
        'display:none',
        'position:fixed',
        'inset:0',
        'overflow-x:hidden',
        'overflow-y:auto',
        'outline:0',
        'z-index:2147483646'
      ].join(';');
      modal.innerHTML = [
        '<div class="modal-dialog modal-dialog-centered" data-document-negative-stock-dialog>',
        '  <div class="modal-content">',
        '    <div class="modal-header">',
        '      <h2 data-document-negative-stock-title class="fw-semibold fs-6 fw-light text-primary">Estoque liberado temporariamente</h2>',
        '    </div>',
        '    <div class="modal-body pb-4" style="padding-top:8px;">',
        '      <div data-document-negative-stock-details class="rounded p-4" style="display:grid;gap:8px;font-size:13px;line-height:1.5;">',
        '        <div data-document-negative-stock-primary-text>O estoque está <strong style="color:#dc3545;">aberto</strong> a cinco minutos, deseja fecha-lo?</div>',
        '        <div data-document-negative-stock-secondary-text style="opacity:.78;">Fechamento automático em <strong id="' + DOCUMENT_NEGATIVE_STOCK_GUARD_REMAINING_ID + '">15 segundos</strong>. Para manter por mais <strong data-document-negative-stock-keep-duration>5 minutos</strong>, pressione <strong>Manter</strong>.</div>',
      '      </div>',
        '    </div>',
        '    <div class="modal-footer pt-0">',
        '      <button type="button" data-document-negative-stock-disable class="btn btn-light btn-sm" style="font-size:13px;">Desativar agora</button>',
        '      <button type="button" data-document-negative-stock-keep class="btn btn-primary btn-sm" style="font-size:13px;">Manter</button>',
        '    </div>',
        '  </div>',
        '</div>'
      ].join('');
      modal.addEventListener('click', (event) => {
        const target = event.target && event.target.closest
          ? event.target.closest('[data-document-negative-stock-keep], [data-document-negative-stock-disable]')
          : null;
        if (!target) return;
        event.preventDefault();
        event.stopPropagation();
        if (!isDocumentNegativeStockGuardLocalOwner()) {
          event.stopImmediatePropagation();
          updateDocumentNegativeStockGuardModalMode(false);
          return;
        }
        if (target.hasAttribute('data-document-negative-stock-keep')) {
          keepDocumentNegativeStockGuardEnabled();
          return;
        }
        disableDocumentNegativeStockGuardSwitch(isTargetDocumentConfigurationRoute() ? 'manual-current' : 'manual-hidden');
      }, true);
      document.body.appendChild(modal);
    }

    applyDocumentNegativeStockGuardModalTheme(document.getElementById(DOCUMENT_NEGATIVE_STOCK_GUARD_MODAL_ID));
  }

  function updateDocumentNegativeStockGuardModalMode(isOwner) {
    const modal = document.getElementById(DOCUMENT_NEGATIVE_STOCK_GUARD_MODAL_ID);
    if (!modal) return;

    const primary = modal.querySelector('[data-document-negative-stock-primary-text]');
    const secondary = modal.querySelector('[data-document-negative-stock-secondary-text]');
    const disableButton = modal.querySelector('[data-document-negative-stock-disable]');
    const keepButton = modal.querySelector('[data-document-negative-stock-keep]');
    const keepDuration = modal.querySelector('[data-document-negative-stock-keep-duration]');

    if (isOwner) {
      if (primary) primary.innerHTML = 'O estoque está <strong style="color:#dc3545;">aberto</strong> a cinco minutos, deseja fecha-lo?';
      if (secondary) {
        secondary.innerHTML = 'Fechamento automático em <strong id="' + DOCUMENT_NEGATIVE_STOCK_GUARD_REMAINING_ID + '">15 segundos</strong>. Para manter por mais <strong data-document-negative-stock-keep-duration>5 minutos</strong>, pressione <strong>Manter</strong>.';
      }
      const nextKeepDuration = modal.querySelector('[data-document-negative-stock-keep-duration]');
      if (nextKeepDuration) nextKeepDuration.textContent = formatDocumentNegativeStockDurationLabel(getDocumentNegativeStockGuardDurationMs());
      [disableButton, keepButton].forEach((button) => {
        if (!button) return;
        button.disabled = false;
        button.removeAttribute('aria-disabled');
        button.style.opacity = '';
        button.style.cursor = '';
      });
      updateDocumentNegativeStockGuardModalRemaining();
      return;
    }

    if (primary) primary.innerHTML = 'O estoque está <strong style="color:#dc3545;">aberto</strong> por outro navegador.';
    if (secondary) {
      secondary.innerHTML = 'Este aviso é apenas informativo nesta máquina. Somente o navegador que abriu o estoque pode manter, fechar ou disparar o fechamento automático.';
    }
    if (keepDuration) keepDuration.textContent = formatDocumentNegativeStockDurationLabel(getDocumentNegativeStockGuardDurationMs());
    [disableButton, keepButton].forEach((button) => {
      if (!button) return;
      button.disabled = true;
      button.setAttribute('aria-disabled', 'true');
      button.style.opacity = '.55';
      button.style.cursor = 'not-allowed';
    });
  }

  function updateDocumentNegativeStockGuardModalRemaining() {
    const remaining = document.getElementById(DOCUMENT_NEGATIVE_STOCK_GUARD_REMAINING_ID);
    if (!remaining) return;
    const seconds = Math.max(0, Math.ceil((DOCUMENT_NEGATIVE_STOCK_GUARD_STATE.expiresAt - Date.now()) / 1000));
    remaining.textContent = seconds === 1 ? '1 segundo' : seconds + ' segundos';
  }

  function showDocumentNegativeStockGuardWarning() {
    if (DOCUMENT_NEGATIVE_STOCK_GUARD_STATE.disabling || DOCUMENT_NEGATIVE_STOCK_GUARD_STATE.apiDisabling || DOCUMENT_NEGATIVE_STOCK_GUARD_STATE.closingModal) return;
    if (!isDocumentNegativeStockGuardLocalOwner()) {
      closeDocumentNegativeStockGuardModal();
      return;
    }
    ensureDocumentNegativeStockGuardModal();
    const modal = document.getElementById(DOCUMENT_NEGATIVE_STOCK_GUARD_MODAL_ID);
    const backdrop = document.getElementById(DOCUMENT_NEGATIVE_STOCK_GUARD_BACKDROP_ID);
    if (!modal || !backdrop) return;

    updateDocumentNegativeStockGuardModalMode(true);
    const keepDuration = modal.querySelector('[data-document-negative-stock-keep-duration]');
    if (keepDuration) {
      keepDuration.textContent = formatDocumentNegativeStockDurationLabel(getDocumentNegativeStockGuardDurationMs());
    }
    updateDocumentNegativeStockGuardModalRemaining();
    applyDocumentNegativeStockGuardModalTheme(modal);
    showExtensionNativeModal(modal, backdrop);
    window.setTimeout(focusDocumentNegativeStockGuardModal, 40);
  }

  function scheduleDocumentNegativeStockGuard(delayMs) {
    clearDocumentNegativeStockGuardTimer();
    const delay = Math.max(250, Math.min(Number(delayMs) || 250, 60 * 1000));
    DOCUMENT_NEGATIVE_STOCK_GUARD_STATE.timer = window.setTimeout(() => {
      DOCUMENT_NEGATIVE_STOCK_GUARD_STATE.timer = 0;
      syncDocumentNegativeStockGuard();
    }, delay);
  }

  function keepDocumentNegativeStockGuardEnabled() {
    if (!isDocumentNegativeStockGuardLocalOwner()) {
      writeDocumentNegativeStockGuardExpiresAt(0);
      clearDocumentNegativeStockBackgroundDisable();
      applyDocumentNegativeStockRemoteLock();
      closeDocumentNegativeStockGuardModal();
      return;
    }
    const controls = getDocumentNegativeStockGuardControls();
    if (isTargetDocumentConfigurationRoute() && !isDocumentNegativeStockGuardSwitchOn(controls)) {
      resetDocumentNegativeStockGuard(true);
      return;
    }

    const expiresAt = Date.now() + getDocumentNegativeStockGuardDurationMs();
    DOCUMENT_NEGATIVE_STOCK_GUARD_STATE.warningShownFor = 0;
    DOCUMENT_NEGATIVE_STOCK_GUARD_STATE.disabling = false;
    claimDocumentNegativeStockGuardLocalOwner(expiresAt);
    closeDocumentNegativeStockGuardModal();
    scheduleDocumentNegativeStockGuard(Math.max(250, expiresAt - Date.now() - getDocumentNegativeStockGuardWarningMs()));
  }

  function getDocumentNegativeStockNativeNotificationSnapshot() {
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
      const text = normalizeText(candidate.innerText || candidate.textContent || '');
      return text && text.indexOf('estoque liberado temporariamente') === -1;
    }) || null;

    if (!node) return null;
    return {
      html: node.outerHTML || '',
      text: String(node.innerText || node.textContent || '').trim()
    };
  }

  function inspectDocumentNegativeStockGuardControls() {
    const controls = getDocumentNegativeStockGuardControls();
    return {
      found: !!controls,
      inputChecked: controls && controls.input && typeof controls.input.checked === 'boolean' ? !!controls.input.checked : null,
      switchOn: controls ? isDocumentNegativeStockGuardSwitchOn(controls) : null,
      href: location.href
    };
  }

  function disableDocumentNegativeStockGuardFromConfigPageRequest(sendResponse) {
    if (!isTargetDocumentConfigurationRoute()) {
      sendResponse({ ok: false, found: false, reason: 'wrong_route', href: location.href });
      return;
    }

    if (!isDocumentNegativeStockGuardLocalOwner()) {
      writeDocumentNegativeStockGuardExpiresAt(0);
      clearDocumentNegativeStockBackgroundDisable();
      applyDocumentNegativeStockRemoteLock();
      sendResponse({ ok: false, found: true, reason: 'remote_locked', href: location.href });
      return;
    }

    writeDocumentNegativeStockGuardExpiresAt(0);
    closeDocumentNegativeStockGuardModal();

    const startedAt = Date.now();
    let attempts = 0;

    const finish = (extra) => {
      const state = inspectDocumentNegativeStockGuardControls();
      const closed = !state.switchOn;
      if (closed) {
        writeDocumentNegativeStockForceDisablePending(false);
        resetDocumentNegativeStockGuard(true);
        clearDocumentNegativeStockBackgroundDisable();
      }
      sendResponse(Object.assign({ ok: !state.switchOn, attempts, notification: getDocumentNegativeStockNativeNotificationSnapshot() }, state, extra || {}));
    };

    const tryDisable = () => {
      const controls = getDocumentNegativeStockGuardControls();
      if (!controls) {
        if (Date.now() - startedAt < 18000) {
          window.setTimeout(tryDisable, 700);
          return;
        }
        sendResponse({ ok: false, found: false, reason: 'control_not_found', href: location.href });
        return;
      }

      if (!isDocumentNegativeStockGuardSwitchOn(controls)) {
        finish({ alreadyOff: true });
        return;
      }

      attempts += 1;
      clickDocumentNegativeStockGuardSwitch(controls);

      window.setTimeout(() => {
        const next = getDocumentNegativeStockGuardControls();
        if (!next || !isDocumentNegativeStockGuardSwitchOn(next) || attempts >= 4) {
          finish({ clicked: true });
          return;
        }
        tryDisable();
      }, 1400);
    };

    tryDisable();
  }

  function verifyDocumentNegativeStockGuardDisabled(attempt, persistWithApi, trigger) {
    const isManualTrigger = trigger === 'manual-current' || trigger === 'manual-hidden';
    if (!isManualTrigger && !isDocumentNegativeStockGuardLocalOwner()) {
      DOCUMENT_NEGATIVE_STOCK_GUARD_STATE.disabling = false;
      writeDocumentNegativeStockGuardExpiresAt(0);
      clearDocumentNegativeStockBackgroundDisable();
      applyDocumentNegativeStockRemoteLock();
      closeDocumentNegativeStockGuardModal();
      return;
    }

    const controls = getDocumentNegativeStockGuardControls();
    if (!controls || !isDocumentNegativeStockGuardSwitchOn(controls)) {
      if (persistWithApi && readDocumentNegativeStockConfigurationPayload()) {
        disableDocumentNegativeStockGuardByApi(trigger);
        return;
      }
      if (trigger === 'manual-current' || trigger === 'manual-hidden') {
        clearDocumentNegativeStockBackgroundDisable();
      }
      resetDocumentNegativeStockGuard(true);
      return;
    }

    if (attempt >= 2) {
      DOCUMENT_NEGATIVE_STOCK_GUARD_STATE.disabling = false;
      disableDocumentNegativeStockGuardByApi(trigger);
      return;
    }

    clickDocumentNegativeStockGuardSwitch(controls);
    window.setTimeout(() => verifyDocumentNegativeStockGuardDisabled(attempt + 1, persistWithApi, trigger), 900);
  }

  function disableDocumentNegativeStockGuardSwitch(trigger) {
    const isManualTrigger = trigger === 'manual-current' || trigger === 'manual-hidden';
    if (!isManualTrigger && !isDocumentNegativeStockGuardLocalOwner()) {
      writeDocumentNegativeStockGuardExpiresAt(0);
      clearDocumentNegativeStockBackgroundDisable();
      applyDocumentNegativeStockRemoteLock();
      closeDocumentNegativeStockGuardModal();
      return;
    }

    const controls = getDocumentNegativeStockGuardControls();
    if (!isTargetDocumentConfigurationRoute() || !controls) {
      disableDocumentNegativeStockGuardByApi(trigger);
      return;
    }

    if (!controls || !isDocumentNegativeStockGuardSwitchOn(controls)) {
      if (trigger === 'manual-current' || trigger === 'manual-hidden') {
        clearDocumentNegativeStockBackgroundDisable();
      }
      resetDocumentNegativeStockGuard(true);
      return;
    }

    DOCUMENT_NEGATIVE_STOCK_GUARD_STATE.disabling = true;
    closeDocumentNegativeStockGuardModal();
    clickDocumentNegativeStockGuardSwitch(controls);
    window.setTimeout(() => verifyDocumentNegativeStockGuardDisabled(0, true, trigger), 900);
  }

  function syncDocumentNegativeStockGuardByTimer() {
    const nowAt = Date.now();
    if (!isDocumentNegativeStockGuardLocalOwner()) {
      writeDocumentNegativeStockGuardExpiresAt(0);
      clearDocumentNegativeStockBackgroundDisable();
      applyDocumentNegativeStockRemoteLock();
      closeDocumentNegativeStockGuardModal();
      return false;
    }

    let expiresAt = readDocumentNegativeStockGuardExpiresAt() || DOCUMENT_NEGATIVE_STOCK_GUARD_STATE.expiresAt || 0;
    if (!expiresAt) {
      if (!ensureDocumentNegativeStockGuardStartedFromStoredConfiguration()) {
        closeDocumentNegativeStockGuardModal();
        return false;
      }
      expiresAt = readDocumentNegativeStockGuardExpiresAt() || DOCUMENT_NEGATIVE_STOCK_GUARD_STATE.expiresAt || 0;
    }

    if (nowAt >= expiresAt) {
      disableDocumentNegativeStockGuardByApi();
      return true;
    }

    const warningMs = getDocumentNegativeStockGuardWarningMs();
    const warningAt = Math.max(nowAt, expiresAt - warningMs);
    if (warningMs > 0 && nowAt >= warningAt) {
      DOCUMENT_NEGATIVE_STOCK_GUARD_STATE.expiresAt = expiresAt;
      DOCUMENT_NEGATIVE_STOCK_GUARD_STATE.warningShownFor = expiresAt;
      showDocumentNegativeStockGuardWarning();
      scheduleDocumentNegativeStockGuard(Math.min(1000, Math.max(250, expiresAt - nowAt)));
      return true;
    }

    closeDocumentNegativeStockGuardModal();
    scheduleDocumentNegativeStockGuard(Math.max(250, warningAt - nowAt));
    return true;
  }

  let negativeStockUiRow = null;
  let negativeStockUiGeneration = 0;
  let negativeStockUiLastCheck = 0;
  let negativeStockNativeRequest = null;
  function syncDocumentNegativeStockGuard() {
    if (!isTargetDocumentConfigurationRoute()) {
      negativeStockUiRow = null;
      negativeStockUiGeneration++;
      return;
    }
    const controls = getDocumentNegativeStockGuardControls();
    if (!controls || negativeStockUiRow === controls.row) return;
    negativeStockUiRow = controls.row;
    const generation = ++negativeStockUiGeneration;
    negativeStockUiLastCheck = Date.now();
    sendRuntimeMessage({ type: 'document-negative-stock-read-state', token: getZwebToken() })
      .then(reply => {
        if (generation !== negativeStockUiGeneration || !isTargetDocumentConfigurationRoute()) return;
        if (reply?.ok && reply.payload?.browserReadRequired) {
          negativeStockNativeRequest = { leaseId: reply.payload.leaseId, generation };
          window.postMessage({ source: 'zweb-negative-stock-native-read', leaseId: reply.payload.leaseId }, location.origin);
          return;
        }
        if (reply?.ok && reply.payload?.pending) return;
        if (!reply || !reply.ok || typeof reply.payload?.enabled !== 'boolean') {
          console.warn('[zweb] Nao foi possivel conferir o estado visual do estoque.', reply && reply.message || 'Resposta indisponivel.');
          return;
        }
        window.postMessage({ source: 'zweb-negative-stock-ui-sync', enabled: reply.payload.enabled }, location.origin);
      }).catch(() => console.warn('[zweb] Nao foi possivel conferir o estado visual do estoque.'));
  }
  document.addEventListener('pointerdown', event => {
    if (negativeStockUiRow && negativeStockUiRow.contains(event.target)) negativeStockUiGeneration++;
  }, true);
  window.addEventListener('focus', () => {
    if (isTargetDocumentConfigurationRoute() && Date.now() - negativeStockUiLastCheck >= 30000) {
      negativeStockUiRow = null;
      syncDocumentNegativeStockGuard();
    }
  });


  function runDocumentNegativeStockGuardHeartbeat() {
    // O servico compartilhado e o unico responsavel pelo prazo e fechamento.
  }

  function startDocumentNegativeStockGuardHeartbeat() {
    runDocumentNegativeStockGuardHeartbeat();
  }

  function ensureExtensionModalBridge() {
    if (!document.documentElement) return;
    if (document.documentElement.dataset.zwebExtensionModalBridgeInstalled === EXTENSION_MODAL_BRIDGE_VERSION) return;

    // Normally installed by the MAIN-world content script declared in the
    // manifest. Reload the same external file as a CSP-safe fallback.
    const resourceUrl = getExtensionResourceUrl('nucleo/page-bridge.js');
    const parent = document.head || document.documentElement;
    if (!resourceUrl || !parent) return;

    const existing = document.getElementById(XML_BRIDGE_SCRIPT_ID);
    if (existing) existing.remove();

    const script = document.createElement('script');
    script.id = XML_BRIDGE_SCRIPT_ID;
    script.dataset.bridgeVersion = XML_BRIDGE_VERSION;
    script.src = resourceUrl + '?v=' + encodeURIComponent(XML_BRIDGE_VERSION);
    script.async = false;
    parent.appendChild(script);
  }

  function ensureExtensionModalBridgeListener() {
    if (EXTENSION_MODAL_BRIDGE_MESSAGE_BOUND) return;
    window.addEventListener('message', function(event) {
      if (event.source !== window || !event.data || event.data.source !== EXTENSION_MODAL_BRIDGE_SOURCE) return;
      const type = event.data.type;
      if (type === 'nfe-warning-close' || type === 'nfe-warning-cancel') {
        clearNfeCashSaleBoletoWarningState();
      } else if (type === 'nfe-warning-continue') {
        continueNfeCashSaleBoletoWarningAction();
      } else if (type === 'commission-confirm-close') {
        clearCommissionReportConfirmState();
      } else if (type === 'commission-confirm-no') {
        clearCommissionReportConfirmState();
        window.location.hash = '#/fiscal/nfe';
      } else if (type === 'commission-confirm-yes') {
        const pendingButton = COMMISSION_REPORT_PENDING_GENERATE_BUTTON;
        clearCommissionReportConfirmState();
        if (!pendingButton || !pendingButton.isConnected) return;
        COMMISSION_REPORT_INTERNAL_GENERATE_CLICK = true;
        try {
          if (typeof pendingButton.click === 'function') {
            pendingButton.click();
          } else {
            clickLikeUser(pendingButton);
          }
        } finally {
          setTimeout(() => {
            COMMISSION_REPORT_INTERNAL_GENERATE_CLICK = false;
          }, 80);
        }
      }
    });
    EXTENSION_MODAL_BRIDGE_MESSAGE_BOUND = true;
  }

  function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async function waitForCondition(predicate, timeoutMs, intervalMs) {
    const startedAt = Date.now();
    const timeout = Number(timeoutMs) || 5000;
    const interval = Number(intervalMs) || 150;
    while ((Date.now() - startedAt) <= timeout) {
      const result = predicate();
      if (result) return result;
      await delay(interval);
    }
    return null;
  }

  function withTimeout(promise, timeoutMs, fallbackValue) {
    let timer = 0;
    return Promise.race([
      promise,
      new Promise((resolve) => {
        timer = setTimeout(() => resolve(fallbackValue), timeoutMs);
      })
    ]).finally(() => {
      if (timer) clearTimeout(timer);
    });
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
          event.stopImmediatePropagation();
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
        event.stopImmediatePropagation();
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
    if (!/^\d+(?:[,.]0+)?$/.test(compact) && !/^\d{1,3}(?:\.\d{3})+,0+$/.test(compact)) return '';
    const integerPart = compact.includes(',') ? compact.split(',')[0].replace(/\./g, '') : compact.split('.')[0];
    if (!integerPart) return '';

    const parsed = Number(integerPart);
    if (!Number.isSafeInteger(parsed) || parsed <= 0) return '';
    return String(parsed);
  }

  function normalizeDavItemDescriptionKey(value) {
    return normalizeRawText(value || '').toLowerCase();
  }

  function readDavItemCodeCache() {
    try {
      const raw = window.sessionStorage && window.sessionStorage.getItem(DAV_ITEM_CODE_CACHE_STORAGE_KEY);
      if (!raw) return Object.create(null);
      const parsed = JSON.parse(raw);
      return parsed && typeof parsed === 'object' ? parsed : Object.create(null);
    } catch (error) {
      return Object.create(null);
    }
  }

  function writeDavItemCodeCache() {
    try {
      if (!window.sessionStorage) return;
      window.sessionStorage.setItem(DAV_ITEM_CODE_CACHE_STORAGE_KEY, JSON.stringify(DAV_ITEM_CODE_CACHE));
    } catch (error) {}
  }

  function rememberDavItemCode(code, description) {
    const normalizedCode = String(code || '').trim().replace(/^#/, '');
    const key = normalizeDavItemDescriptionKey(description);
    if (!normalizedCode || !key) return;
    DAV_ITEM_CODE_CACHE[key] = normalizedCode;
    writeDavItemCodeCache();
  }

  function parseDavItemOptionText(rawText) {
    const text = normalizeRawText(rawText);
    if (!text) return null;

    const match = text.match(/^#?(\d+)\s+#\s+(.+?)(?:\s+R\$\s|\s+\|\s+Qtde\.:|$)/i);
    if (!match) return null;

    const code = String(match[1] || '').trim();
    const description = normalizeRawText(match[2] || '');
    if (!code || !description) return null;

    return { code, description };
  }

  function isDavItemPickerInput(input) {
    if (!input || !input.matches || !input.matches(ITEM_SEARCH_SELECTOR)) return false;
    if (!isTargetDavRoute() || !isVisible(input)) return false;
    if ((input.id || '') === 'client' || (input.id || '') === 'checkout') return false;
    if ((input.id || '').indexOf('z-select-') !== 0) return false;

    let current = input;
    for (let i = 0; i < 8 && current; i += 1, current = current.parentElement) {
      const text = normalizeText(current && (current.innerText || current.textContent || ''));
      if (!text) continue;
      if (
        text.indexOf('descricao') !== -1
        && text.indexOf('quantidade') !== -1
        && (
          text.indexOf('valor unitario') !== -1
          || text.indexOf('valor unitario r$') !== -1
        )
      ) {
        return true;
      }
    }

    return false;
  }

  function rememberDavItemMeta(meta) {
    if (!meta || !meta.code || !meta.description) return;
    DAV_PENDING_SELECTED_ITEM_META = {
      code: String(meta.code).trim().replace(/^#/, ''),
      description: normalizeRawText(meta.description)
    };
    rememberDavItemCode(DAV_PENDING_SELECTED_ITEM_META.code, DAV_PENDING_SELECTED_ITEM_META.description);
  }

  function captureDavItemMetaFromInput(input) {
    if (!isDavItemPickerInput(input)) return null;

    const listId = input.getAttribute('aria-controls') || '';
    const list = listId ? document.getElementById(listId) : null;
    const highlighted = list && list.querySelector('.multiselect__option--highlight, [role="option"][aria-selected="true"]');
    const highlightedMeta = parseDavItemOptionText(highlighted && (highlighted.innerText || highlighted.textContent || ''));
    if (highlightedMeta) return highlightedMeta;

    const wrapper = input.closest('.multiselect');
    const single = wrapper && wrapper.querySelector('.multiselect__single');
    const description = normalizeRawText(single && (single.innerText || single.textContent || ''));
    if (!description) return null;

    const cachedCode = DAV_ITEM_CODE_CACHE[normalizeDavItemDescriptionKey(description)];
    return cachedCode ? { code: cachedCode, description } : null;
  }

  function rememberDavVisibleItemOptions(input) {
    if (!isDavItemPickerInput(input)) return;
    const listId = input.getAttribute('aria-controls') || '';
    const list = listId ? document.getElementById(listId) : null;
    if (!list) return;

    ensureDavItemPickerStyle();
    list.setAttribute(DAV_ITEM_PICKER_LIST_ATTR, 'true');

    Array.from(list.querySelectorAll('[role="option"], .multiselect__option, .multiselect__element'))
      .filter((option) => isVisible(option))
      .forEach((option) => {
        const meta = parseDavItemOptionText(option.innerText || option.textContent || '');
        if (meta) rememberDavItemMeta(meta);
      });
  }

  function ensureDavItemPickerStyle() {
    if (document.getElementById(DAV_ITEM_PICKER_STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = DAV_ITEM_PICKER_STYLE_ID;
    style.textContent = ''
      + '[' + DAV_ITEM_PICKER_LIST_ATTR + '="true"] [role="option"],'
      + '[' + DAV_ITEM_PICKER_LIST_ATTR + '="true"] .multiselect__option,'
      + '[' + DAV_ITEM_PICKER_LIST_ATTR + '="true"] .multiselect__element,'
      + '[' + DAV_ITEM_PICKER_LIST_ATTR + '="true"] span,'
      + '[' + DAV_ITEM_PICKER_LIST_ATTR + '="true"] div'
      + '{font-weight:700 !important;}';
    (document.head || document.documentElement).appendChild(style);
  }

  function handleDavItemSelectionCapture(event) {
    if (!isTargetDavRoute() || !event || !event.target) return;

    if (event.type === 'input' || event.type === 'change') {
      const input = event.target;
      if (!isDavItemPickerInput(input)) return;
      window.setTimeout(() => {
        if (!document.contains(input)) return;
        rememberDavVisibleItemOptions(input);
      }, 120);
      return;
    }

    if (event.type === 'keydown') {
      const input = event.target;
      if (event.key !== 'Enter' || !isDavItemPickerInput(input)) return;
      const meta = captureDavItemMetaFromInput(input);
      if (meta) rememberDavItemMeta(meta);
      return;
    }

    const option = event.target.closest
      ? event.target.closest('[role="option"], .multiselect__option, .multiselect__element')
      : null;
    if (!option) return;

    const list = option.closest('[role="listbox"], .multiselect__content');
    const input = list && list.id
      ? document.querySelector('input.multiselect__input[aria-controls="' + CSS.escape(list.id) + '"]')
      : null;
    if (!isDavItemPickerInput(input)) return;

    rememberDavVisibleItemOptions(input);
    const meta = parseDavItemOptionText(option.innerText || option.textContent || '');
    if (meta) rememberDavItemMeta(meta);
  }

  function findDavItemsTable() {
    if (!isTargetDavRoute()) return null;

    const tables = Array.from(document.querySelectorAll('table.table.table-fix-head.custom-table-striped'));
    return tables.find((table) => {
      if (!isVisible(table)) return false;
      const headers = Array.from(table.querySelectorAll('thead th'))
        .map((th) => normalizeText(th.textContent || ''))
        .filter(Boolean);
      return headers.includes('descricao')
        && headers.includes('unidade')
        && headers.includes('quantidade')
        && headers.some((text) => text.indexOf('valor unitario') !== -1);
    }) || null;
  }

  function ensureDavItemCodeHeader(table) {
    if (!table) return null;
    const existing = table.querySelector('thead th[' + DAV_ITEM_CODE_HEADER_ATTR + '="true"]');
    const headerRow = table.querySelector('thead tr');
    const descriptionHeader = headerRow && Array.from(headerRow.children).find((cell) => normalizeText(cell.textContent || '') === 'descricao');
    if (!headerRow || !descriptionHeader) return null;

    if (existing) {
      if (existing !== descriptionHeader.previousElementSibling) {
        descriptionHeader.insertAdjacentElement('beforebegin', existing);
      }
      return existing;
    }


    const header = document.createElement('th');
    header.setAttribute(DAV_ITEM_CODE_HEADER_ATTR, 'true');
    header.className = 'text-center';
    header.textContent = 'Código';
    header.style.width = '8%';
    header.style.minWidth = '92px';
    header.style.whiteSpace = 'nowrap';

    descriptionHeader.style.width = '22%';
    descriptionHeader.insertAdjacentElement('beforebegin', header);
    return header;
  }

  function ensureDavItemCodeCell(row, code) {
    if (!row) return;

    const descriptionCell = Array.from(row.children).find((cell) => cell.getAttribute(DAV_ITEM_CODE_CELL_ATTR) !== 'true');
    if (!descriptionCell) return;

    let cell = row.querySelector('td[' + DAV_ITEM_CODE_CELL_ATTR + '="true"]');
    if (cell && cell !== descriptionCell.previousElementSibling) {
      descriptionCell.insertAdjacentElement('beforebegin', cell);
    }
    if (!cell) {
      cell = document.createElement('td');
      cell.setAttribute(DAV_ITEM_CODE_CELL_ATTR, 'true');
      cell.className = 'text-center';
      cell.style.whiteSpace = 'nowrap';
      cell.style.fontVariantNumeric = 'tabular-nums';
      descriptionCell.insertAdjacentElement('beforebegin', cell);
    }

    cell.textContent = String(code || '').trim();
  }

  function findDavDescriptionCell(row) {
    if (!row) return null;
    return Array.from(row.children).find((cell) => cell.getAttribute(DAV_ITEM_CODE_CELL_ATTR) !== 'true') || null;
  }

  function syncDavItemCodeColumn() {
    const table = findDavItemsTable();
    if (!table) return;

    ensureDavItemCodeHeader(table);

    const rows = Array.from(table.querySelectorAll('tbody tr'));
    rows.forEach((row) => {
      const descriptionCell = findDavDescriptionCell(row);
      if (!descriptionCell) return;

      const description = normalizeRawText(descriptionCell.textContent || '');
      if (!description) return;

      let code = DAV_ITEM_CODE_CACHE[normalizeDavItemDescriptionKey(description)] || '';
      if (!code && DAV_PENDING_SELECTED_ITEM_META && DAV_PENDING_SELECTED_ITEM_META.description === description) {
        code = DAV_PENDING_SELECTED_ITEM_META.code || '';
        if (code) rememberDavItemCode(code, description);
      }
      if (!code) return;

      ensureDavItemCodeCell(row, code);
    });
  }

  function parseDavIntegerQuantity(rawValue) {
    const normalized = normalizeDavIntegerQuantityText(rawValue);
    if (!normalized) return null;

    const parsed = Number(normalized);
    return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
  }

  function getDavQuantityFractionDigits(input) {
    const value = String(input && input.value || '').trim();
    const match = value.match(/[,.](\d+)$/);
    if (match && match[1]) {
      const digits = match[1].length;
      if (digits >= 2 && digits <= 4) return digits;
    }
    return 2;
  }

  function formatDavQuantityForZwebInput(input, rawValue) {
    const normalized = normalizeDavIntegerQuantityText(rawValue);
    if (!normalized) return '';

    const quantity = Number(normalized);
    if (!Number.isInteger(quantity) || quantity <= 0) return '';

    const decimals = getDavQuantityFractionDigits(input);
    return String(quantity) + ',' + '0'.repeat(decimals);
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
    const formatted = formatDavQuantityForZwebInput(input, rawValue);
    if (!formatted) return false;

    ensureDavQuantityUserBinding(input);
    ensureDavIntegerInputGuard(input);
    input.dataset.zwebDavQtyUserEdited = '';
    input.setAttribute('data-zweb-dav-quantity-target', 'true');
    input.removeAttribute('data-zweb-dav-quantity-confirmed');
    window.postMessage({ source: 'zweb-dav-quantity-set', quantity: Number(normalizeDavIntegerQuantityText(rawValue)) }, location.origin);
    return true;
  }

  async function ensureDavQuantityApplied(input, quantityNumber, timeoutMs) {
    if (!input || !quantityNumber) return false;

    const timeout = timeoutMs || 2400;
    const start = Date.now();
    let stableReads = 0;

    while ((Date.now() - start) < timeout) {
      const current = Number(input.getAttribute('data-zweb-dav-quantity-confirmed'));
      if (current !== quantityNumber) {
        setDavQuantityValue(input, quantityNumber);
        stableReads = 0;
      } else {
        stableReads += 1;
        if (stableReads >= 3) return true;
      }
      await delay(120);
    }

    return Number(input.getAttribute('data-zweb-dav-quantity-confirmed')) === quantityNumber;
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
      return normalizedTerm ? (exact || null) : options[0];
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
      await delay(50);
    }
    return null;
  }

  async function waitForEnabledAddButton(timeoutMs) {
    const timeout = timeoutMs || 4000;
    const start = Date.now();
    while (Date.now() - start < timeout) {
      const btn = findAddButton();
      if (btn && isVisible(btn) && !btn.disabled && !btn.hasAttribute('disabled')) return btn;
      await delay(60);
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
      await delay(80);
    }
    return findMainSearchInput();
  }

  async function resolveBatchSearchOption(input, normalizedCode) {
    if (!input) return null;
    setInputValueDirect(input, normalizedCode);
    return waitForSearchResult(input, normalizedCode, 7800);
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
      await delay(80);
    }

    dispatchEnter(input);
    await delay(70);

    const qtyInput = findQuantityInput();
    if (qtyInput) {
      qtyInput.focus();
      qtyInput.dispatchEvent(new Event('focus', { bubbles: true }));
      await delay(60);
    } else {
      input.blur();
      await delay(60);
    }

    const second = await waitForEnabledAddButton(1600);
    if (second) return;

    option = await waitForSearchResult(input, normalizedCode, 1200);
    if (option) {
      clickOptionDirect(option);
      await delay(80);
    }
  }

  async function addSingleItemInBatch(code, quantityRaw, quantityNumber) {
    const input = await waitForBatchSearchInputReady(5000);
    if (!input) throw new Error('Campo de busca de item nao encontrado');

    const normalizedCode = normalizeBatchCode(code);

    input.setAttribute('data-zweb-dav-product-target', 'true');
    const cached = await requestDavCachedSelection('product', { code: normalizedCode.replace(/^#/, '') });
    if (cached === 'unconfirmed' || cached === 'failed') throw new Error('Selecao direta nao confirmada para ' + normalizedCode);
    if (cached !== 'selected') {
      const option = await resolveBatchSearchOption(input, normalizedCode);
      if (option) {
        clickOptionDirect(option);
        await delay(80);
      } else {
        throw new Error('Nenhum resultado encontrado para ' + normalizedCode);
      }
    }

    if (cached !== 'selected') await ensureDescriptionConfirmed(input, normalizedCode);
    await delay(60);

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
      await delay(60);
      await ensureDavQuantityApplied(qtyInput, quantityNumber, 1800);
    }

    const addButton = await waitForEnabledAddButton(7500);
    if (!addButton) throw new Error('Botao adicionar nao habilitou para ' + normalizedCode);

    if (qtyInput && quantityNumber) {
      if (!await ensureDavQuantityApplied(qtyInput, quantityNumber, 1200)) {
        throw new Error('Quantidade nao confirmada para ' + normalizedCode + '. O item nao foi adicionado.');
      }
    }

    clickLikeUser(addButton);
    const confirmed = await waitForItemConfirmation(normalizedCode, 8000);
    if (!confirmed) throw new Error('Item nao confirmou apos clicar adicionar para ' + normalizedCode);
    await delay(120);
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

  function ensureProductCodeRangeNativeGridHideStyle() {
    const styleId = 'zweb-product-code-range-native-grid-hide-style';
    if (document.getElementById(styleId)) return;
    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = [
      '[' + PRODUCT_NATIVE_GRID_HOST_HIDDEN_ATTR + '="true"] > .table-wrapper.table-wrapper-filter:not([' + PRODUCT_CODE_RANGE_GRID_ATTR + '="true"]) {',
      '  display: none !important;',
      '}'
    ].join('\n');
    (document.head || document.documentElement || document.body).appendChild(style);
  }

  function setNativeProductTableVisible(isVisibleNext) {
    const wrapper = getProductTableWrapper();
    if (!wrapper) return;
    const host = wrapper.parentElement;
    ensureProductCodeRangeNativeGridHideStyle();
    const targets = [wrapper];
    const shouldHide = !isVisibleNext;
    const hostHidden = !!(host && host.getAttribute(PRODUCT_NATIVE_GRID_HOST_HIDDEN_ATTR) === 'true');
    const alreadySynced = targets.every((element) => {
      if (!element || !element.style) return true;
      if (shouldHide) {
        return hostHidden && element.style.display === 'none';
      }
      return !hostHidden
        && !element.hasAttribute(PRODUCT_NATIVE_GRID_HIDDEN_ATTR)
        && element.style.display !== 'none';
    });
    if (alreadySynced) return;

    targets.forEach((element) => {
      if (!element || !element.style) return;
      if (isVisibleNext) {
        if (host) host.removeAttribute(PRODUCT_NATIVE_GRID_HOST_HIDDEN_ATTR);
        if (element.hasAttribute(PRODUCT_NATIVE_GRID_HIDDEN_ATTR)) {
          const previousDisplay = element.getAttribute(PRODUCT_NATIVE_GRID_HIDDEN_ATTR) || '';
          element.style.display = previousDisplay;
          element.removeAttribute(PRODUCT_NATIVE_GRID_HIDDEN_ATTR);
        } else {
          element.style.display = '';
        }
        return;
      }

      if (host) host.setAttribute(PRODUCT_NATIVE_GRID_HOST_HIDDEN_ATTR, 'true');
      if (!element.hasAttribute(PRODUCT_NATIVE_GRID_HIDDEN_ATTR)) {
        element.setAttribute(PRODUCT_NATIVE_GRID_HIDDEN_ATTR, element.style.display || '');
      }
      element.style.display = 'none';
    });
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

  async function fetchProductCodeRangePage(pageNumber, operationId) {
    assertProductionZwebAutomationEnabled(operationId);
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
    if (lastPage - firstPage + 1 > PRODUCT_READ_MAX_PAGES_PER_RUN) {
      throw new Error('A faixa informada ultrapassa o limite de páginas desta consulta.');
    }
    const batches = [];
    for (let pageNumber = firstPage; pageNumber <= lastPage; pageNumber += 1) {
      if (batches.length) await delay(PRODUCT_READ_MIN_INTERVAL_MS);
      batches.push(await fetchProductCodeRangePage(pageNumber, 'productRangeRead'));
    }
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
      case 'valor':
      case 'valor r$':
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
    const canRenderPanel = isTargetProductRoute() && !!tableWrapper;
    const shouldShowToolbarStatus = !!toolbar && isFeatureEnabled('productPreviewEnabled')
      && (PRODUCT_CODE_RANGE_STATE.active || !!PRODUCT_CODE_RANGE_STATE.error);
    const shouldShow = canRenderPanel
      && ((PRODUCT_CODE_RANGE_STATE.active && PRODUCT_CODE_RANGE_STATE.enabled) || !!PRODUCT_CODE_RANGE_STATE.error);

    if (!canRenderPanel) {
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
    if (shouldShowToolbarStatus) {
      syncProductCodeRangeToolbarStatus(toolbar, theme, typography);
    } else {
      removeProductCodeRangeToolbarStatus();
    }
    const nativeFilterCriteria = getActiveNativeProductFilterCriteria();
    const displayItems = PRODUCT_CODE_RANGE_STATE.items.length
      ? filterProductCodeRangeItemsByNativeCriteria(PRODUCT_CODE_RANGE_STATE.items, tableWrapper)
      : [];
    const nativeGrid = displayItems.length
      ? buildProductCodeRangeGrid(tableWrapper, displayItems)
      : null;
    const hasExistingRenderedGrid = !!(panel && panel.querySelector('[' + PRODUCT_CODE_RANGE_GRID_ATTR + '="true"]'));
    const waitingForStableGrid = !!(
      shouldShow
      && PRODUCT_CODE_RANGE_STATE.enabled
      && !PRODUCT_CODE_RANGE_STATE.loading
      && !PRODUCT_CODE_RANGE_STATE.error
      && displayItems.length
      && !nativeGrid
    );
    const shouldKeepNativeVisible = !shouldShow || !PRODUCT_CODE_RANGE_STATE.enabled || (waitingForStableGrid && !hasExistingRenderedGrid);

    const signature = JSON.stringify({
      active: PRODUCT_CODE_RANGE_STATE.active,
      enabled: PRODUCT_CODE_RANGE_STATE.enabled,
      loading: PRODUCT_CODE_RANGE_STATE.loading,
      start: PRODUCT_CODE_RANGE_STATE.startCode,
      end: PRODUCT_CODE_RANGE_STATE.endCode,
      error: PRODUCT_CODE_RANGE_STATE.error,
      count: displayItems.length,
      first: displayItems[0] ? displayItems[0].sequence : '',
      last: displayItems[displayItems.length - 1]
        ? displayItems[displayItems.length - 1].sequence
        : '',
      nativeCriteria: nativeFilterCriteria.map((criterion) => criterion.columnKey + ':' + criterion.valueNormalized).join('|'),
      lowStockColor,
      isDark: theme.isDark,
      bodyFontFamily: typography.bodyFontFamily,
      bodyFontSize: typography.bodyFontSize,
      headerFontFamily: typography.headerFontFamily,
      headerFontSize: typography.headerFontSize,
      gridReady: !!nativeGrid,
      waitingForStableGrid,
      keepNativeVisible: shouldKeepNativeVisible
    });

    setNativeProductTableVisible(shouldKeepNativeVisible);
    if (waitingForStableGrid) {
      if (!hasExistingRenderedGrid && panel) panel.remove();
      return;
    }
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
    } else if (displayItems.length) {
      embeddedBodyMarkup = nativeGrid
        ? '<div data-product-code-range-grid-host></div>'
        : '<div style="margin:8px 0 0;padding:10px 0;font-size:13px;color:' + escapeHtml(theme.mutedColor) + ';">Recarregando a grade filtrada...</div>';
    } else if (PRODUCT_CODE_RANGE_STATE.items.length && nativeFilterCriteria.length) {
      embeddedBodyMarkup = '<div style="margin:8px 0 0;padding:10px 0;font-size:13px;color:' + escapeHtml(theme.panelEmptyColor) + ';">Nenhum produto dessa faixa corresponde aos filtros ativos.</div>';
    } else {
      embeddedBodyMarkup = '<div style="margin:8px 0 0;padding:10px 0;font-size:13px;color:' + escapeHtml(theme.panelEmptyColor) + ';">Nenhum produto foi encontrado nessa faixa de códigos.</div>';
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

  function assertProductionZwebAutomationEnabled(operationId) {
    const guard = globalThis.ZWEB_RUNTIME_GUARDS;
    if (guard && typeof guard.canRun === 'function' && guard.canRun(operationId)) return;
    throw new Error(operationId
      ? 'Esta operação do ZWeb permanece suspensa até a homologação.'
      : 'Esta operação não possui cobertura para homologação e permanece bloqueada.');
  }

  async function postZwebJson(url, body, operationId) {
    assertProductionZwebAutomationEnabled(operationId);
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
        payload.error_message ||
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
    assertProductionZwebAutomationEnabled('productBulkRead');
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

    for (let pageNumber = 1; pageNumber <= PRODUCT_READ_MAX_PAGES_PER_RUN; pageNumber += 1) {
      if (pageNumber > 1) await delay(PRODUCT_READ_MIN_INTERVAL_MS);
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
    }, 'supplierLookup');

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

    const sortedPageNumbers = Array.from(pageNumbers).sort((a, b) => a - b);
    if (sortedPageNumbers.length > PRODUCT_READ_MAX_PAGES_PER_RUN) {
      throw new Error('A busca ultrapassa o limite de páginas desta consulta.');
    }
    const batches = [];
    for (const pageNumber of sortedPageNumbers) {
      if (batches.length) await delay(PRODUCT_READ_MIN_INTERVAL_MS);
      batches.push(await fetchProductCodeRangePage(pageNumber, 'productBulkRead'));
    }
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
    const payload = await postZwebJson(PRODUCT_GET_API_URL, { id: Number(productId) }, 'productPreferredSupplierWrite');
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
    await postZwebJson(PRODUCT_PUT_API_URL, payload, 'productPreferredSupplierWrite');
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

      if (orderedProducts.length > PRODUCT_PREFERRED_SUPPLIER_MAX_UPDATES) {
        throw new Error('Selecione no máximo ' + PRODUCT_PREFERRED_SUPPLIER_MAX_UPDATES + ' produtos por execução.');
      }

      setProductReplicateSupplierReportTotal(orderedProducts.length);

      if (missing.length) {
        missing.forEach((code) => {
          addProductReplicateSupplierReportFailure(code, 'Nao foi possivel localizar o produto na listagem.');
        });
        throw new Error('Nao foi possivel localizar os produtos: ' + missing.join(', ') + '.');
      }

      for (let index = 0; index < orderedProducts.length; index += 1) {
        const product = orderedProducts[index];
        if (index > 0) await delay(PRODUCT_PREFERRED_SUPPLIER_MIN_INTERVAL_MS);
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
    if (!isTargetNfeRoute() && !isTargetNfceListRoute() && !isTargetDavCloneBlockRoute()) return;
    const row = findNfeContextMenuRow(event && event.target);
    if (!row) return;

    const rect = row.getBoundingClientRect();
    LAST_NFE_CONTEXT_MENU_ANCHOR = {
      row,
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
    const headerRow = Array.from(document.querySelectorAll('.table-row.header')).find((row) => {
      if (!isVisible(row)) return false;
      return normalizeText(row.innerText || row.textContent || '').indexOf('natureza de operacao') !== -1;
    }) || Array.from(document.querySelectorAll('.table-row.header')).find((row) => isVisible(row)) || null;
    const map = new Map();
    if (!headerRow) return map;

    let inferredIndex = 0;
    Array.from(headerRow.querySelectorAll('.cell')).forEach((cell) => {
      const label = ((cell.querySelector('.header-text') && cell.querySelector('.header-text').textContent) || cell.textContent || '').trim();
      if (!label) return;
      const rawColIndex = Number(cell.getAttribute('data-col'));
      const colIndex = Number.isFinite(rawColIndex) ? rawColIndex : inferredIndex;
      if (!Number.isFinite(rawColIndex)) {
        inferredIndex += 1;
      } else if (rawColIndex >= inferredIndex) {
        inferredIndex = rawColIndex + 1;
      }
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

  function getNfeRowDocumentId(row, checkbox) {
    const candidates = [
      row && row.getAttribute('data-id'),
      row && row.dataset && row.dataset.id,
      row && row.getAttribute('data-row-id'),
      row && row.dataset && row.dataset.rowId,
      checkbox && checkbox.value,
      checkbox && checkbox.getAttribute('data-id'),
      checkbox && checkbox.dataset && checkbox.dataset.id
    ];

    const nested = row && row.querySelector && row.querySelector('[data-id], [data-row-id], input[value]');
    if (nested) {
      candidates.push(
        nested.getAttribute('data-id'),
        nested.getAttribute('data-row-id'),
        nested.value
      );
    }

    for (let index = 0; index < candidates.length; index += 1) {
      const value = String(candidates[index] == null ? '' : candidates[index]).trim();
      if (/^\d+$/.test(value)) return Number(value);
    }

    return null;
  }

  function isCashSaleNfeNature(natureText) {
    const normalized = normalizeText(natureText);
    return normalized.indexOf('5102') !== -1 && normalized.indexOf('vista') !== -1;
  }

  function buildNfeRowSelectionEntry(row, headerMap) {
    if (!row || row.classList.contains('header')) return null;

    const resolvedHeaderMap = headerMap || getNfeHeaderMap();
    const documentCol = findNfeColumnIndex(resolvedHeaderMap, ['documento', 'numero', 'número']) ?? 1;
    const seriesCol = findNfeColumnIndex(resolvedHeaderMap, ['serie', 'série']);
    const customerCol = findNfeColumnIndex(resolvedHeaderMap, ['cliente', 'destinatario', 'emitente']) ?? 0;
    const natureCol = findNfeColumnIndex(resolvedHeaderMap, ['natureza de operacao']) ?? 2;
    const statusCol = findNfeColumnIndex(resolvedHeaderMap, ['status', 'situacao', 'situação']);
    const checkbox = row.querySelector('input[type="checkbox"]');
    const documentNumber = getNfeRowCellText(row, documentCol);

    if (!documentNumber) return null;

    const customerName = getNfeRowCellText(row, customerCol);
    const seriesText = Number.isFinite(seriesCol) ? getNfeRowCellText(row, seriesCol) : '';
    const natureText = getNfeRowCellText(row, natureCol);
    const statusText = Number.isFinite(statusCol) ? getNfeRowCellText(row, statusCol) : '';

    return {
      row,
      checkbox,
      id: getNfeRowDocumentId(row, checkbox),
      documentNumber,
      seriesText,
      customerName,
      natureText,
      statusText,
      isCashSale: isCashSaleNfeNature(natureText)
    };
  }

  function getSelectedNfeRows() {
    const headerMap = getNfeHeaderMap();

    return Array.from(document.querySelectorAll('.table-row input[type="checkbox"]:checked'))
      .map((checkbox) => buildNfeRowSelectionEntry(checkbox.closest('.table-row'), headerMap))
      .filter(Boolean)
      .filter((item) => item.documentNumber);
  }

  function getNfeRowsForBoletoGuard() {
    const selected = getSelectedNfeRows();
    if (selected.length) return selected;

    const activeRow = findActiveNfeActionRow();
    if (!activeRow) return [];

    const entry = buildNfeRowSelectionEntry(activeRow, getNfeHeaderMap());
    return entry ? [entry] : [];
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

  function setNfeBatchDownloadStatus(text, kind, progress) {
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
      wrap.innerHTML = [
        '<div id="' + NFE_BATCH_DOWNLOAD_STATUS_ID + '">',
        '  <div data-nfe-batch-status-text></div>',
        '  <div data-nfe-batch-progress-wrap style="display:none;margin-top:9px;">',
        '    <div data-nfe-batch-progress-track style="width:100%;height:7px;border-radius:999px;overflow:hidden;background:rgba(127,127,127,0.18);">',
        '      <div data-nfe-batch-progress-fill style="height:100%;width:0%;border-radius:999px;background:#1664c0;transition:width .22s ease;"></div>',
        '    </div>',
        '    <div data-nfe-batch-progress-label style="margin-top:5px;font-size:11px;opacity:.78;"></div>',
        '  </div>',
        '</div>'
      ].join('');
      document.body.appendChild(wrap);
    }

    const status = wrap.querySelector('#' + NFE_BATCH_DOWNLOAD_STATUS_ID);
    if (!status) return;
    if (!status.querySelector('[data-nfe-batch-status-text]')) {
      status.innerHTML = [
        '<div data-nfe-batch-status-text></div>',
        '<div data-nfe-batch-progress-wrap style="display:none;margin-top:9px;">',
        '  <div data-nfe-batch-progress-track style="width:100%;height:7px;border-radius:999px;overflow:hidden;background:rgba(127,127,127,0.18);">',
        '    <div data-nfe-batch-progress-fill style="height:100%;width:0%;border-radius:999px;background:#1664c0;transition:width .22s ease;"></div>',
        '  </div>',
        '  <div data-nfe-batch-progress-label style="margin-top:5px;font-size:11px;opacity:.78;"></div>',
        '</div>'
      ].join('');
    }

    const textElement = status.querySelector('[data-nfe-batch-status-text]');
    const progressWrap = status.querySelector('[data-nfe-batch-progress-wrap]');
    const progressFill = status.querySelector('[data-nfe-batch-progress-fill]');
    const progressLabel = status.querySelector('[data-nfe-batch-progress-label]');

    clearTimeout(NFE_BATCH_DOWNLOAD_STATUS_TIMER);
    NFE_BATCH_DOWNLOAD_STATUS_TIMER = 0;

    if (!text) {
      wrap.style.display = 'none';
      if (textElement) textElement.textContent = '';
      if (progressWrap) progressWrap.style.display = 'none';
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
    if (textElement) {
      textElement.textContent = text;
    } else {
      status.textContent = text;
    }

    const total = progress && Number(progress.total);
    const current = progress && Number(progress.current);
    const hasProgress = Number.isFinite(total) && total > 0 && Number.isFinite(current);
    if (progressWrap && progressFill && progressLabel) {
      progressWrap.style.display = hasProgress ? 'block' : 'none';
      if (hasProgress) {
        const percent = Math.max(0, Math.min(100, Math.round((current / total) * 100)));
        progressFill.style.width = percent + '%';
        progressFill.style.background = error
          ? '#a53434'
          : success
            ? '#249b4d'
            : '#1664c0';
        progressLabel.textContent = Math.max(0, Math.min(current, total)) + ' de ' + total + ' concluído(s)';
      }
    }

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

  function unwrapZwebPayload(payload) {
    if (!payload || typeof payload !== 'object') return payload;
    if (payload.data && typeof payload.data === 'object') return payload.data;
    if (payload.result && typeof payload.result === 'object') return payload.result;
    return payload;
  }

  function isHttpUrl(value) {
    return /^https?:\/\//i.test(String(value || '').trim());
  }

  function isPdfUrl(value) {
    const url = String(value || '').trim();
    return isHttpUrl(url) && (/\.pdf(?:$|[?#])/i.test(url) || /\/reports\/report\//i.test(url));
  }

  function isXmlUrl(value) {
    const url = String(value || '').trim();
    return isHttpUrl(url)
      && (
        /\.xml(?:$|[?#])/i.test(url)
        || /\/uploads\/nfe\//i.test(url)
        || (/^https:\/\/zweb\.com\.br\//i.test(url) && url.indexOf('#/') === -1)
      );
  }

  function looksLikeXmlContent(value) {
    const text = String(value || '').trim().slice(0, 200).toLowerCase();
    return text.indexOf('<?xml') === 0
      || text.indexOf('<nfeproc') === 0
      || text.indexOf('<nfe') === 0
      || text.indexOf('<proc') === 0;
  }

  function findNestedValue(root, predicate, depth, seen, keyPath) {
    if (depth > 5 || root == null) return null;
    const path = keyPath || '';
    if (predicate(root, path)) return root;
    if (typeof root !== 'object') return null;
    if (seen.has(root)) return null;
    seen.add(root);

    const keys = Array.isArray(root) ? root.map((_, index) => index) : Object.keys(root);
    for (let index = 0; index < keys.length; index += 1) {
      const key = keys[index];
      const value = root[key];
      const nextPath = path ? (path + '.' + key) : String(key);
      const found = findNestedValue(value, predicate, depth + 1, seen, nextPath);
      if (found != null) return found;
    }

    return null;
  }

  function extractNfeBatchUrl(payload, kind) {
    const data = unwrapZwebPayload(payload);
    const matcher = kind === 'pdf' ? isPdfUrl : isXmlUrl;
    const keyPattern = kind === 'pdf' ? /(danfe|pdf|url)/i : /(xml|url)/i;
    const preferred = findNestedValue(data, (value, path) => (
      typeof value === 'string'
      && matcher(value)
      && keyPattern.test(path)
    ), 0, new Set(), '');
    if (preferred) return String(preferred).trim();

    const fallback = findNestedValue(data, (value) => (
      typeof value === 'string' && matcher(value)
    ), 0, new Set(), '');
    return fallback ? String(fallback).trim() : '';
  }

  function extractNfeBatchXmlContent(payload) {
    const data = unwrapZwebPayload(payload);
    const found = findNestedValue(data, (value, path) => (
      typeof value === 'string'
      && looksLikeXmlContent(value)
      && /(xml|content|conteudo|arquivo|file)/i.test(path)
    ), 0, new Set(), '');
    if (found) return String(found);

    const fallback = findNestedValue(data, (value) => (
      typeof value === 'string' && looksLikeXmlContent(value)
    ), 0, new Set(), '');
    return fallback ? String(fallback) : '';
  }

  function getNfeBatchDetailId(detail, entry) {
    const data = unwrapZwebPayload(detail);
    const candidates = [
      entry && entry.id,
      data && data.id,
      data && data.dados && data.dados.id,
      data && data.document && data.document.id
    ];

    for (let index = 0; index < candidates.length; index += 1) {
      const number = normalizeFiscalDocumentNumber(candidates[index]);
      if (number) return number;
    }

    return null;
  }

  async function fetchNfeBatchDetail(entry, operationId) {
    const request = { modelo: NFE_DOCUMENT_MODEL };
    if (entry && entry.id) {
      request.id = entry.id;
    } else {
      const documentNumber = normalizeFiscalDocumentNumber(entry && entry.documentNumber);
      const seriesNumber = normalizeFiscalDocumentNumber(entry && entry.seriesText) || 1;
      if (!documentNumber) {
        throw new Error('Não foi possível identificar o número da NF-e selecionada.');
      }
      request.numero = documentNumber;
      request.serie = seriesNumber;
    }

    const payload = await postZwebJson(NFE_GET_DETAILED_API_URL, request, operationId);
    const detail = unwrapZwebPayload(payload);
    if (!detail || typeof detail !== 'object') {
      throw new Error('A Zweb não retornou os detalhes da NF-e ' + ((entry && entry.documentNumber) || '') + '.');
    }

    return detail;
  }

  async function requestNfeBatchDirectDownload(kind, entry) {
    const detail = await fetchNfeBatchDetail(entry, 'fiscalDocumentRead');
    const id = getNfeBatchDetailId(detail, entry);
    const fileName = buildNfeBatchFileNameHint(kind, entry);

    if (kind === 'pdf') {
      if (!id) throw new Error('Não foi possível identificar o ID da NF-e ' + entry.documentNumber + ' para baixar o DANFE.');
      const payload = await postZwebJson(NFE_GET_DANFE_URL_API_URL, { id }, 'fiscalDocumentRead');
      const url = extractNfeBatchUrl(payload, 'pdf') || extractNfeBatchUrl(detail, 'pdf');
      if (!url) throw new Error('A Zweb não retornou a URL do DANFE da NF-e ' + entry.documentNumber + '.');
      const response = await sendRuntimeMessage({
        type: 'nfe-batch-direct-download-url',
        kind,
        url,
        fileName
      });
      if (!response || response.ok === false) {
        throw new Error(response && response.message ? response.message : 'Falha ao iniciar o download do DANFE.');
      }
      return;
    }

    if (!id) throw new Error('Não foi possível identificar o ID da NF-e ' + entry.documentNumber + ' para baixar o XML.');
    const payload = await postZwebJson(NFE_PUT_XML_API_URL, { id }, 'fiscalDocumentRead');
    let url = extractNfeBatchUrl(payload, 'xml') || extractNfeBatchUrl(detail, 'xml');
    let content = extractNfeBatchXmlContent(payload) || extractNfeBatchXmlContent(detail);

    if (!url && !content) {
      const refreshedDetail = await fetchNfeBatchDetail(Object.assign({}, entry, { id }), 'fiscalDocumentRead');
      url = extractNfeBatchUrl(refreshedDetail, 'xml');
      content = extractNfeBatchXmlContent(refreshedDetail);
    }

    if (url) {
      const response = await sendRuntimeMessage({
        type: 'nfe-batch-direct-download-url',
        kind,
        url,
        fileName
      });
      if (!response || response.ok === false) {
        throw new Error(response && response.message ? response.message : 'Falha ao iniciar o download do XML.');
      }
      return;
    }

    if (content) {
      const response = await sendRuntimeMessage({
        type: 'nfe-batch-direct-download-content',
        kind,
        content,
        fileName
      });
      if (!response || response.ok === false) {
        throw new Error(response && response.message ? response.message : 'Falha ao iniciar o download do XML.');
      }
      return;
    }

    throw new Error('A Zweb não retornou o XML da NF-e ' + entry.documentNumber + '.');
  }

  async function runNfeBatchDownload(kind) {
    if (NFE_BATCH_DOWNLOAD_RUNNING) return;

    const selectedEntries = getSelectedNfeRows();
    if (!selectedEntries.length) {
      setNfeBatchDownloadStatus('Marque pelo menos uma NF-e antes de iniciar o download em lote.', 'error');
      return;
    }

    if (selectedEntries.length > NFE_BATCH_DOWNLOAD_MAX_ITEMS) {
      setNfeBatchDownloadStatus('Selecione no máximo ' + NFE_BATCH_DOWNLOAD_MAX_ITEMS + ' documentos por execução.', 'error');
      return;
    }

    NFE_BATCH_DOWNLOAD_RUNNING = true;
    setNfeBatchDownloadStatus(
      'Preparando ' + selectedEntries.length + ' download(s) de ' + (kind === 'pdf' ? 'DANFE' : 'XML') + '...',
      '',
      { current: 0, total: selectedEntries.length }
    );

    try {
      for (let index = 0; index < selectedEntries.length; index += 1) {
        const entry = selectedEntries[index];

        setNfeBatchDownloadStatus(
          'Baixando ' + (kind === 'pdf' ? 'DANFE' : 'XML') + ' ' + (index + 1) + ' de ' + selectedEntries.length + ': NF-e ' + entry.documentNumber + '.',
          '',
          { current: index, total: selectedEntries.length }
        );

        await requestNfeBatchDirectDownload(kind, entry);
        setNfeBatchDownloadStatus(
          'Baixando ' + (kind === 'pdf' ? 'DANFE' : 'XML') + ' ' + (index + 1) + ' de ' + selectedEntries.length + ': NF-e ' + entry.documentNumber + '.',
          '',
          { current: index + 1, total: selectedEntries.length }
        );
        await delay(NFE_BATCH_DOWNLOAD_MIN_INTERVAL_MS);
      }

      setNfeBatchDownloadStatus(
        'Downloads concluídos para ' + selectedEntries.length + ' documento(s).',
        'success',
        { current: selectedEntries.length, total: selectedEntries.length }
      );
    } catch (error) {
      setNfeBatchDownloadStatus(
        error && error.message ? error.message : 'Nao foi possivel iniciar os downloads em lote.',
        'error'
      );
    } finally {
      NFE_BATCH_DOWNLOAD_RUNNING = false;
    }
  }

  function createNfePanelActionListItem(id, label, dataAttribute) {
    const listItem = document.createElement('li');
    listItem.className = 'has-submenu';
    listItem.innerHTML = [
      '<a id="' + id + '" role="button" class="dropdown-item flex-container" ' + dataAttribute + '="true">',
      '  <span class="label-item">' + escapeHtml(label) + '</span>',
      '</a>'
    ].join('');
    return listItem;
  }

  function insertNfePanelActionAfter(menu, listItem, referenceAction) {
    const referenceItem = referenceAction && referenceAction.closest ? (referenceAction.closest('li') || referenceAction) : null;
    if (referenceItem && referenceItem.parentElement === menu) {
      referenceItem.insertAdjacentElement('afterend', listItem);
      return;
    }
    menu.appendChild(listItem);
  }

  function getNfePanelActionEntry(action) {
    const contextEntry = getFiscalCloneConfirmEntry(action);
    if (contextEntry && (contextEntry.id || contextEntry.documentNumber)) return contextEntry;

    const recent = getRecentNfceCancellationReasonContextEntry();
    if (recent && (recent.id || recent.documentNumber)) return recent;

    const selected = getSelectedNfeRows();
    if (selected.length) return selected[selected.length - 1];

    const activeRow = findActiveNfeActionRow();
    return activeRow ? buildNfeRowSelectionEntry(activeRow, getNfeHeaderMap()) : null;
  }


  function handleNfePanelQuickAction(event) {
    const target = event && event.target && event.target.closest
        ? event.target.closest('[data-zweb-nfe-clone-cancel-action]')
      : null;
    if (!target || !isTargetNfeRoute()) return;

    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();

    if (event.type === 'pointerdown') {
      return false;
    }

    if (target.hasAttribute('data-zweb-nfe-clone-cancel-action')) {
      const nativeCloneAction = findNfeActionMenuItem(target.closest('ul, .dropdown-menu, .z-dropdown-menu'), ['Clonar', 'Clonar NF-e'], true);
      const pending = {
        trigger: nativeCloneAction || target,
        cancelAction: findFiscalCancelActionNearClone(target),
        entry: getNfePanelActionEntry(target),
        at: Date.now()
      };
      startFiscalCloneNfeCancelThenClone(pending, pending.cancelAction).catch(() => {});
      return false;
    }

    return false;
  }

  function clearNfeCloneConfirmStateIfCancelAction(target) {
    if (!target || !target.closest || !isTargetNfeRoute()) return;
    const action = target.closest('a, button, li, .dropdown-item, .has-submenu, .menu-item');
    if (!action) return;
    const label = normalizeText(extractActionMenuItemLabel(action) || action.innerText || action.textContent || '');
    if (label !== 'cancelar') return;
    FISCAL_CLONE_CONFIRM_PENDING = null;
    const modal = document.getElementById(FISCAL_CLONE_CONFIRM_MODAL_ID);
    if (modal && modal.style.display !== 'none') {
      closeFiscalCloneConfirmModal();
    }
  }

  function ensureNfePanelQuickActionItems() {
    if (!isTargetNfeRoute()) return;

    getOpenNfeActionMenus().forEach((menu) => {
      const nativeCloneAction = findNfeActionMenuItem(menu, ['Clonar', 'Clonar NF-e'], true);
      if (nativeCloneAction && !menu.querySelector('#' + NFE_CLONE_CANCEL_ACTION_ID)) {
        const listItem = createNfePanelActionListItem(
          NFE_CLONE_CANCEL_ACTION_ID,
          'Clonar e cancelar NF-e',
          'data-zweb-nfe-clone-cancel-action'
        );
        insertNfePanelActionAfter(menu, listItem, nativeCloneAction);
      }

      if (nativeCloneAction) {
        const nativeCloneItem = nativeCloneAction.closest('li') || nativeCloneAction;
        if (isCloneActionBlockRoute()) {
          nativeCloneItem.style.display = 'none';
          nativeCloneItem.setAttribute(CLONE_ACTION_BLOCK_ATTR, 'true');
        } else {
          nativeCloneItem.removeAttribute(CLONE_ACTION_BLOCK_ATTR);
          nativeCloneItem.style.display = '';
        }
      }

      syncActionMenuSeparators(menu);
    });
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

  function normalizeFiscalDocumentNumber(value) {
    const digits = String(value == null ? '' : value).replace(/\D/g, '');
    if (!digits) return null;
    const number = Number(digits);
    return Number.isFinite(number) && number > 0 ? number : null;
  }

  function buildNfceCancellationReasonEntry(row, headerMap) {
    if (!row || row.classList.contains('header')) return null;

    const baseEntry = buildNfeRowSelectionEntry(row, headerMap || getNfeHeaderMap()) || {};
    const documentNumber = getNfeRowCellText(row, 0) || baseEntry.documentNumber || '';
    const seriesText = getNfeRowCellText(row, 1) || baseEntry.seriesText || '';
    const customerName = getNfeRowCellText(row, 3) || baseEntry.customerName || '';
    const accessKeyText = getNfeRowCellText(row, 4) || '';
    const statusText = getNfeRowCellText(row, 5) || baseEntry.statusText || '';

    if (!documentNumber) return null;

    return Object.assign({}, baseEntry, {
      row,
      checkbox: row.querySelector('input[type="checkbox"]'),
      documentNumber,
      seriesText,
      customerName,
      accessKeyText,
      statusText
    });
  }

  function getSelectedNfceCancellationReasonRows() {
    const headerMap = getNfeHeaderMap();
    return Array.from(document.querySelectorAll('.table-row input[type="checkbox"]:checked'))
      .map((checkbox) => buildNfceCancellationReasonEntry(checkbox.closest('.table-row'), headerMap))
      .filter(Boolean);
  }

  function getRecentNfceCancellationReasonContextEntry() {
    if (
      LAST_NFE_CONTEXT_MENU_ANCHOR
      && LAST_NFE_CONTEXT_MENU_ANCHOR.row
      && LAST_NFE_CONTEXT_MENU_ANCHOR.row.isConnected
      && (Date.now() - LAST_NFE_CONTEXT_MENU_ANCHOR.at) <= NFE_CONTEXT_MENU_ANCHOR_TTL_MS
    ) {
      const contextEntry = buildNfceCancellationReasonEntry(LAST_NFE_CONTEXT_MENU_ANCHOR.row, getNfeHeaderMap());
      if (contextEntry) return contextEntry;
    }

    return null;
  }

  function getNfceCancellationReasonTargetEntry() {
    const contextEntry = getRecentNfceCancellationReasonContextEntry();
    if (contextEntry && getNfeContextMenuPopup()) return contextEntry;

    const selected = getSelectedNfceCancellationReasonRows();
    if (selected.length) return selected[selected.length - 1];

    if (contextEntry) return contextEntry;

    const activeRow = findActiveNfeActionRow();
    if (!activeRow) return null;

    return buildNfceCancellationReasonEntry(activeRow, getNfeHeaderMap());
  }

  function isNfceCancellationReasonEntryCanceled(entry) {
    return normalizeText(entry && entry.statusText) === 'cancelada';
  }

  function getXmlNodeText(xmlDocument, tagNames) {
    if (!xmlDocument) return '';
    for (let index = 0; index < tagNames.length; index += 1) {
      const nodes = xmlDocument.getElementsByTagName(tagNames[index]);
      const text = nodes && nodes[0] ? (nodes[0].textContent || '').trim() : '';
      if (text) return text;
    }
    return '';
  }

  function extractNfceCancellationReasonFromXml(xmlText) {
    const raw = String(xmlText || '').trim();
    if (!raw) return '';

    try {
      const xmlDocument = new DOMParser().parseFromString(raw, 'application/xml');
      if (xmlDocument.getElementsByTagName('parsererror').length) return '';
      return getXmlNodeText(xmlDocument, ['xJust', 'justificativa', 'motivoCancelamento'])
        || getXmlNodeText(xmlDocument, ['xMotivo']);
    } catch (error) {
      return '';
    }
  }

  async function fetchNfceCancellationReasonFromXml(detail) {
    const xmlUrl = detail && (detail.canceledXml || detail.cancelledXml || detail.cancelXml || detail.xmlCancelamento);
    if (!xmlUrl) return '';

    try {
      const response = await fetch(xmlUrl, { method: 'GET', credentials: 'omit' });
      if (!response.ok) return '';
      return extractNfceCancellationReasonFromXml(await response.text());
    } catch (error) {
      return '';
    }
  }

  function extractNfceCancellationReasonFromDetail(detail) {
    if (!detail || typeof detail !== 'object') return '';

    const candidates = [
      detail.justificativa,
      detail.motivoCancelamento,
      detail.cancellationReason,
      detail.cancelReason,
      detail.reason,
      detail.motivo,
      detail.xmlData && detail.xmlData.justificativa,
      detail.xmlDados && detail.xmlDados.justificativa
    ];

    for (let index = 0; index < candidates.length; index += 1) {
      const text = String(candidates[index] == null ? '' : candidates[index]).trim();
      if (text) return text;
    }

    if (typeof detail.xml === 'string') return extractNfceCancellationReasonFromXml(detail.xml);
    if (typeof detail.xmlCancelamento === 'string' && detail.xmlCancelamento.indexOf('<') !== -1) {
      return extractNfceCancellationReasonFromXml(detail.xmlCancelamento);
    }

    return '';
  }

  function isDetailedNfceCanceled(detail, entry) {
    if (!detail || typeof detail !== 'object') return false;
    const status = Number(detail.status);
    const statusText = normalizeText(
      (entry && entry.statusText)
        || detail.statusText
        || detail.statusLabel
        || detail.situacao
        || ''
    );

    return status === 3
      || !!(detail.canceledXml || detail.cancelledXml || detail.cancelXml || detail.xmlCancelamento)
      || statusText.indexOf('cancel') !== -1;
  }

  function getNfceCancellationReasonDisplayValue(value) {
    const text = String(value == null ? '' : value).trim();
    return text || '-';
  }

  function closeNfceCancellationReasonModal() {
    const modal = document.getElementById(NFCE_CANCEL_REASON_MODAL_ID);
    const backdrop = document.getElementById(NFCE_CANCEL_REASON_BACKDROP_ID);
    hideExtensionNativeModal(modal, backdrop);
  }

  function applyNfceCancellationReasonModalTheme(modal) {
    if (!modal) return;

    const theme = getExtensionOverlayTheme(modal.parentElement || document.body);
    const compact = window.innerWidth < 560;
    const dialog = modal.querySelector('[data-nfce-cancel-reason-dialog]');
    const content = modal.querySelector('.modal-content');
    const title = modal.querySelector('[data-nfce-cancel-reason-title]');
    const details = modal.querySelector('#' + NFCE_CANCEL_REASON_DETAILS_ID);

    if (dialog) {
      dialog.style.maxWidth = compact ? 'calc(100vw - 16px)' : '560px';
      dialog.style.margin = compact ? '8px auto' : '';
    }
    if (content) {
      content.style.background = theme.modalBackground;
      content.style.border = theme.modalBorder;
      content.style.boxShadow = theme.modalBoxShadow;
      content.style.color = theme.bodyColor;
    }
    if (title) {
      title.style.color = theme.titleColor;
    }
    if (details) {
      details.style.background = theme.cardBackground;
      details.style.border = theme.cardBorder;
      details.style.color = theme.cardTextColor;
    }
  }

  function ensureNfceCancellationReasonModal() {
    if (!document.body) return;

    if (!document.getElementById(NFCE_CANCEL_REASON_BACKDROP_ID)) {
      const backdrop = document.createElement('div');
      backdrop.id = NFCE_CANCEL_REASON_BACKDROP_ID;
      backdrop.className = 'modal-backdrop fade';
      backdrop.style.cssText = [
        'display:none',
        'z-index:1061'
      ].join(';');
      backdrop.addEventListener('click', closeNfceCancellationReasonModal);
      document.body.appendChild(backdrop);
    }

    if (!document.getElementById(NFCE_CANCEL_REASON_MODAL_ID)) {
      const modal = document.createElement('div');
      modal.id = NFCE_CANCEL_REASON_MODAL_ID;
      modal.className = 'modal fade';
      modal.tabIndex = -1;
      modal.setAttribute('role', 'dialog');
      modal.setAttribute('aria-modal', 'true');
      modal.setAttribute('aria-hidden', 'true');
      modal.style.cssText = [
        'display:none',
        'z-index:1065'
      ].join(';');
      modal.innerHTML = [
        '<div class="modal-dialog modal-dialog-centered" data-nfce-cancel-reason-dialog>',
        '  <div class="modal-content">',
        '    <div class="modal-header">',
        '      <h2 data-nfce-cancel-reason-title class="fw-semibold fs-6 fw-light text-primary">Motivo de cancelamento</h2>',
        '      <button type="button" data-nfce-cancel-reason-close class="btn-close" aria-label="Close"></button>',
        '    </div>',
        '    <div class="modal-body pb-5" style="padding-top:8px;">',
        '      <div id="' + NFCE_CANCEL_REASON_DETAILS_ID + '" class="rounded p-4" style="display:grid;gap:10px;font-size:13px;line-height:1.48;"></div>',
        '    </div>',
        '    <div class="modal-footer pt-0">',
        '      <button type="button" data-nfce-cancel-reason-close class="btn btn-primary btn-sm" style="font-size:13px;">Fechar</button>',
        '    </div>',
        '  </div>',
        '</div>'
      ].join('');
      modal.addEventListener('click', (event) => {
        const target = event.target && event.target.closest
          ? event.target.closest('[data-nfce-cancel-reason-close]')
          : null;
        if (!target) return;
        event.preventDefault();
        closeNfceCancellationReasonModal();
      }, true);
      document.body.appendChild(modal);
    }

    applyNfceCancellationReasonModalTheme(document.getElementById(NFCE_CANCEL_REASON_MODAL_ID));
  }

  function showNfceCancellationReasonModal(payload) {
    ensureNfceCancellationReasonModal();

    const modal = document.getElementById(NFCE_CANCEL_REASON_MODAL_ID);
    const backdrop = document.getElementById(NFCE_CANCEL_REASON_BACKDROP_ID);
    const details = document.getElementById(NFCE_CANCEL_REASON_DETAILS_ID);
    if (!modal || !backdrop || !details) return;

    const detail = payload && payload.detail ? payload.detail : {};
    const entry = payload && payload.entry ? payload.entry : {};
    const number = detail.numero || detail.number || entry.documentNumber;
    const series = detail.serie || detail.series || entry.seriesText || 1;
    const key = detail.chave || detail.key || detail.chaveAcesso || detail.accessKey || entry.accessKeyText || '';
    const xmlUrl = detail.canceledXml || detail.cancelledXml || detail.cancelXml || detail.xmlCancelamento || '';
    const reason = payload && payload.reason ? payload.reason : '';
    const canceled = payload && payload.canceled;
    const errorMessage = payload && payload.errorMessage ? payload.errorMessage : '';

    if (errorMessage) {
      details.innerHTML = [
        '<div style="font-weight:700;">Não foi possível consultar o motivo.</div>',
        '<div>' + escapeHtml(errorMessage) + '</div>'
      ].join('');
    } else {
      details.innerHTML = [
        '<div><strong>NFC-e:</strong> ' + escapeHtml(getNfceCancellationReasonDisplayValue(number)) + ' <span style="opacity:.72;">Série ' + escapeHtml(getNfceCancellationReasonDisplayValue(series)) + '</span></div>',
        '<div><strong>Status:</strong> ' + escapeHtml(canceled ? 'Cancelada' : 'Não cancelada') + '</div>',
        '<div style="display:grid;gap:6px;"><strong>Motivo:</strong><div style="font-weight:700;">' + escapeHtml(reason || 'Nenhuma justificativa de cancelamento foi localizada para este cupom.') + '</div></div>',
        key ? '<div style="word-break:break-all;"><strong>Chave:</strong> ' + escapeHtml(key) + '</div>' : '',
        xmlUrl ? '<div><a href="' + escapeHtml(xmlUrl) + '" target="_blank" rel="noopener noreferrer">Abrir XML de cancelamento</a></div>' : ''
      ].filter(Boolean).join('');
    }

    applyNfceCancellationReasonModalTheme(modal);
    showExtensionNativeModal(modal, backdrop);
  }

  async function runNfceCancellationReasonLookup() {
    if (NFCE_CANCEL_REASON_RUNNING) return;
    NFCE_CANCEL_REASON_RUNNING = true;

    try {
      const entry = getNfceCancellationReasonTargetEntry();
      if (!entry) {
        throw new Error('Selecione ou abra o menu de uma NFC-e antes de consultar o motivo.');
      }

      if (!isNfceCancellationReasonEntryCanceled(entry)) {
        throw new Error('A consulta do motivo está disponível apenas para NFC-e com status Cancelada.');
      }

      const documentNumber = normalizeFiscalDocumentNumber(entry.documentNumber);
      if (!documentNumber) {
        throw new Error('Não foi possível identificar o número da NFC-e selecionada.');
      }

      const seriesNumber = normalizeFiscalDocumentNumber(entry.seriesText) || 1;
      setNfeBatchDownloadStatus('Consultando motivo de cancelamento da NFC-e ' + documentNumber + '...', '');

      const payload = await postZwebJson(NFE_GET_DETAILED_API_URL, {
        numero: documentNumber,
        serie: seriesNumber,
        modelo: 65
      }, 'fiscalDocumentRead');
      const detail = payload && payload.data && typeof payload.data === 'object' ? payload.data : payload;
      const canceled = isDetailedNfceCanceled(detail, entry);
      let reason = extractNfceCancellationReasonFromDetail(detail);

      if (!reason && canceled) {
        reason = await fetchNfceCancellationReasonFromXml(detail);
      }

      setNfeBatchDownloadStatus('', '');
      showNfceCancellationReasonModal({
        detail,
        entry,
        reason,
        canceled
      });
    } catch (error) {
      setNfeBatchDownloadStatus('', '');
      showNfceCancellationReasonModal({
        errorMessage: error && error.message ? error.message : 'Erro inesperado ao consultar o motivo de cancelamento.'
      });
    } finally {
      NFCE_CANCEL_REASON_RUNNING = false;
    }
  }

  function ensureNfceCancellationReasonActionItems() {
    if (!isTargetNfceListRoute()) {
      removeNfceCancellationReasonUi();
      return;
    }

    if (!isNfceCancellationReasonEntryCanceled(getNfceCancellationReasonTargetEntry())) {
      removeNfceCancellationReasonActionItems();
      return;
    }

    getOpenNfeActionMenus().forEach((menu) => {
      if (menu.querySelector('#' + NFCE_CANCEL_REASON_ACTION_ID)) return;

      const listItem = document.createElement('li');
      listItem.className = 'has-submenu';
      listItem.innerHTML = [
        '<a id="' + NFCE_CANCEL_REASON_ACTION_ID + '" role="button" class="dropdown-item flex-container">',
        '  <span class="label-item">Consultar motivo de cancelamento</span>',
        '</a>'
      ].join('');

      const actionItem = listItem.querySelector('a');
      actionItem.addEventListener('click', (event) => {
        event.preventDefault();
        event.stopImmediatePropagation();
        closeNfceCancellationReasonSourceMenus(actionItem);
        runNfceCancellationReasonLookup().catch(() => {});
      }, true);
      menu.appendChild(listItem);
    });
  }

  function closeNfceCancellationReasonSourceMenus(source) {
    const containers = new Set();
    getOpenNfeActionMenus().forEach((menu) => containers.add(menu));

    if (source && source.closest) {
      [
        source.closest('.z-dropdown-menu'),
        source.closest('.dropdown-menu'),
        source.closest('#' + NFE_CONTEXT_MENU_ID)
      ].forEach((container) => {
        if (container) containers.add(container);
      });
    }

    containers.forEach((container) => {
      if (!container) return;
      container.classList.remove('show');
      if (container.id === NFE_CONTEXT_MENU_ID) {
        container.style.display = 'none';
      }
    });

    Array.from(document.querySelectorAll('.grid-toolbar.no-print [aria-expanded="true"], #' + NFE_CONTEXT_MENU_ID + ' [aria-expanded="true"]')).forEach((toggle) => {
      toggle.setAttribute('aria-expanded', 'false');
      toggle.classList.remove('show');
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

        if (hiddenLabels.has(label) && !isCloneActionLabel(label)) {
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

  function isCloneActionLabel(label) {
    const normalized = normalizeText(label);
    return normalized === 'clonar' || normalized.indexOf('clonar ') === 0;
  }

  function getCloneActionMenus() {
    return Array.from(document.querySelectorAll(
      '.grid-toolbar.no-print .z-dropdown-menu, #menuId .dropdown-menu, #menuId, .popup .dropdown-menu, .dropdown-menu, .z-dropdown-menu'
    ));
  }

  function restoreCloneActionBlockItems() {
    Array.from(document.querySelectorAll('[' + CLONE_ACTION_BLOCK_ATTR + '="true"]')).forEach((item) => {
      item.removeAttribute(CLONE_ACTION_BLOCK_ATTR);
      item.style.display = '';
    });
  }

  function syncCloneActionBlockItems() {
    const active = isCloneActionBlockRoute();
    Array.from(document.querySelectorAll('[' + CLONE_ACTION_BLOCK_ATTR + '="true"]')).forEach((item) => {
      const label = normalizeText(extractActionMenuItemLabel(item) || item.innerText || item.textContent || '');
      if (active && isCloneActionLabel(label)) return;
      item.removeAttribute(CLONE_ACTION_BLOCK_ATTR);
      item.style.display = '';
    });

    if (!active) {
      return;
    }

    const menus = getCloneActionMenus();
    menus.forEach((menu) => {
      const items = Array.from(menu.querySelectorAll(':scope > li, li.has-submenu, li, a.dropdown-item, button.dropdown-item'));
      items.forEach((item) => {
        const label = normalizeText(extractActionMenuItemLabel(item) || item.innerText || item.textContent || '');
        if (!isCloneActionLabel(label)) return;

        const target = item.closest('li, .dropdown-item, .has-submenu, .menu-item') || item;
        target.setAttribute(CLONE_ACTION_BLOCK_ATTR, 'true');
        target.style.display = 'none';
      });

      syncActionMenuSeparators(menu);
    });
  }

  function findCloneActionTrigger(target) {
    if (!target || !target.closest || !isCloneActionBlockRoute()) return null;

    let el = target;
    for (let i = 0; i < 7 && el; i += 1, el = el.parentElement) {
      const label = normalizeText(extractActionMenuItemLabel(el) || el.innerText || el.textContent || '');
      if (!isCloneActionLabel(label)) continue;
      return el.matches && el.matches('a, button') ? el : (el.querySelector && el.querySelector('a, button')) || el;
    }

    return null;
  }

  function handleCloneActionBlock(event) {
    if (!findCloneActionTrigger(event && event.target)) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    return false;
  }

  function isFiscalCloneConfirmRoute() {
    return isTargetNfeRoute() || isTargetNfceListRoute() || isTargetDavCloneBlockRoute();
  }

  function isFiscalCloneAssistEnabledForCurrentRoute() {
    if (isTargetDavCloneBlockRoute()) return true;
    if (isCloneActionBlockRoute()) return false;
    if (isTargetNfeRoute()) return false;
    if (isTargetNfceListRoute()) return isFeatureEnabled('nfceCloneAssistEnabled');
    return true;
  }

  function findFiscalCloneActionTrigger(target) {
    if (!target || !target.closest || !isFiscalCloneConfirmRoute()) return null;
    if (!isFiscalCloneAssistEnabledForCurrentRoute()) return null;
    if (isTargetDavCloneBlockRoute() && !hasVisibleFiscalAccess()) return null;

    let el = target;
    for (let i = 0; i < 7 && el; i += 1, el = el.parentElement) {
      const label = normalizeText(extractActionMenuItemLabel(el) || el.innerText || el.textContent || '');
      if (!isCloneActionLabel(label)) continue;
      return el.matches && el.matches('a, button') ? el : (el.querySelector && el.querySelector('a, button')) || el;
    }

    return null;
  }

  function findFiscalCancelActionNearClone(trigger) {
    const containers = [];
    if (trigger && trigger.closest) {
      [
        trigger.closest('.z-dropdown-menu'),
        trigger.closest('.dropdown-menu'),
        trigger.closest('#' + NFE_CONTEXT_MENU_ID),
        trigger.closest('ul')
      ].forEach((container) => {
        if (container && containers.indexOf(container) === -1) containers.push(container);
      });
    }
    getOpenNfeActionMenus().forEach((menu) => {
      if (menu && containers.indexOf(menu) === -1) containers.push(menu);
    });

    for (const container of containers) {
      const item = Array.from(container.querySelectorAll('a, button, li')).find((candidate) => {
        return normalizeText(extractActionMenuItemLabel(candidate) || candidate.innerText || candidate.textContent || '') === 'cancelar';
      });
      if (!item) continue;
      return item.matches && item.matches('a, button') ? item : (item.querySelector && item.querySelector('a, button')) || item;
    }

    return null;
  }

  async function openFiscalCloneRowContextMenu(row) {
    if (!row) return null;

    const existingMenus = getOpenNfeActionMenus();
    if (existingMenus.length) return existingMenus[existingMenus.length - 1];

    try {
      const rect = row.getBoundingClientRect();
      const x = Math.round(rect.left + Math.min(Math.max(rect.width * 0.25, 80), Math.max(rect.width - 120, 80)));
      const y = Math.round(rect.top + Math.max(Math.min(rect.height / 2, rect.height - 4), 4));
      row.dispatchEvent(new MouseEvent('contextmenu', {
        bubbles: true,
        cancelable: true,
        view: window,
        clientX: x,
        clientY: y,
        button: 2
      }));
    } catch (error) {}

    let menu = await waitForCondition(() => {
      const menus = getOpenNfeActionMenus();
      return menus.length ? menus[menus.length - 1] : null;
    }, 1800, 120);
    if (menu) return menu;

    const actionTarget = Array.from(row.querySelectorAll([
      '[class*="action"]',
      '[class*="acoes"]',
      '[class*="ações"]',
      '[aria-label*="Ações"]',
      '[aria-label*="Acoes"]',
      '[title*="Ações"]',
      '[title*="Acoes"]'
    ].join(','))).find((candidate) => {
      const label = normalizeText([
        candidate.getAttribute('aria-label'),
        candidate.getAttribute('title'),
        candidate.innerText,
        candidate.textContent
      ].filter(Boolean).join(' '));
      if (label === 'abrir' || label === 'excluir') return false;
      if (candidate.classList && candidate.classList.contains('icon-actions') && !/a[cç][oõ]es/i.test(label)) return false;
      return true;
    });
    if (actionTarget) {
      clickLikeUser(actionTarget);
      menu = await waitForCondition(() => {
        const menus = getOpenNfeActionMenus();
        return menus.length ? menus[menus.length - 1] : null;
      }, 2400, 120);
    }

    return menu || null;
  }

  function activateFiscalMenuAction(action, options) {
    if (!action) return;
    const singleClick = !!(options && options.singleClick);
    if (typeof action.click === 'function') {
      action.click();
      if (singleClick) return;
    }
    action.dispatchEvent(new MouseEvent('click', {
      bubbles: true,
      cancelable: true,
      view: window
    }));
  }

  function runPendingNativeClone(pending) {
    if (!pending || !pending.trigger || !pending.trigger.isConnected) return false;
    FISCAL_CLONE_CONFIRM_INTERNAL_CLICK = true;
    try {
      if (typeof pending.trigger.click === 'function') {
        pending.trigger.click();
      } else {
        clickLikeUser(pending.trigger);
      }
    } finally {
      setTimeout(() => {
        FISCAL_CLONE_CONFIRM_INTERNAL_CLICK = false;
      }, 120);
    }
    return true;
  }

  async function runPendingNativeCloneAfterCancel(pending) {
    if (runPendingNativeClone(pending)) return true;

    const row = pending && pending.entry && pending.entry.row;
    if (!row || !row.isConnected) return false;

    const menu = await openFiscalCloneRowContextMenu(row);
    const cloneAction = findNfeActionMenuItem(menu, ['Clonar', 'Clonar NF-e'], true)
      || Array.from(document.querySelectorAll('a, button, li')).find((item) => {
        return isCloneActionLabel(normalizeText(extractActionMenuItemLabel(item) || item.innerText || item.textContent || ''));
      });
    if (!cloneAction) return false;

    FISCAL_CLONE_CONFIRM_INTERNAL_CLICK = true;
    try {
      activateFiscalMenuAction(cloneAction.matches && cloneAction.matches('li') ? (cloneAction.querySelector('a, button') || cloneAction) : cloneAction, { singleClick: true });
    } finally {
      setTimeout(() => {
        FISCAL_CLONE_CONFIRM_INTERNAL_CLICK = false;
      }, 120);
    }
    return true;
  }

  function getFiscalCloneLocalDateText() {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return year + '-' + month + '-' + day;
  }

  function isFiscalCloneRootNumberKey(key) {
    return /^(numero|number|documentNumber|documento|nfeNumber|nfNumber)$/i.test(String(key || ''));
  }

  function isFiscalCloneRootStatusKey(key) {
    return /^(status|situacao|situation|statusCode|statusText|cStat|xMotivo)$/i.test(String(key || ''));
  }

  function isFiscalCloneAuthorizationMetadataKey(key) {
    return /(chave|accessKey|protocolo|protocol|recibo|receipt|xml|danfe|sefaz|autoriz|authoriz|transmiss|transmit|cancel|evento|event|inutil|cstat|xmotivo|qrcode|qrCode|digest|assinatura|signature)/i.test(String(key || ''));
  }

  function isFiscalCloneSystemMetadataKey(key) {
    return /^(createdAt|updatedAt|deletedAt|created_at|updated_at|deleted_at|createdBy|updatedBy|version|hash)$/i.test(String(key || ''));
  }

  function isFiscalCloneDateKeyForNewDraft(key) {
    return /(emissao|emission|issueDate|issuedAt|dataEmissao|saida|exitDate|dataSaida)/i.test(String(key || ''));
  }

  function shouldClearFiscalCloneChildId(parentKey) {
    return /(item|itens|items|produtoNfe|produtosNfe|duplicata|duplicatas|parcela|parcelas|pagamento|pagamentos|payment|payments|volume|volumes|transporte|transport|fatura|cobranca|cobran)/i.test(String(parentKey || ''));
  }

  function sanitizeFiscalCloneNfeDraftObject(target, depth, parentKey) {
    if (!target || typeof target !== 'object' || depth > 8) return;
    const today = getFiscalCloneLocalDateText();

    Object.keys(target).forEach((key) => {
      const value = target[key];
      const keyText = String(key || '');

      if (keyText === 'id') {
        if (depth === 0 || shouldClearFiscalCloneChildId(parentKey)) {
          target[key] = null;
        }
        return;
      }

      if (depth <= 1 && isFiscalCloneRootNumberKey(keyText)) {
        target[key] = null;
        return;
      }

      if (depth <= 1 && isFiscalCloneRootStatusKey(keyText)) {
        target[key] = null;
        return;
      }

      if (isFiscalCloneSystemMetadataKey(keyText) || isFiscalCloneAuthorizationMetadataKey(keyText)) {
        target[key] = null;
        return;
      }

      if (isFiscalCloneDateKeyForNewDraft(keyText) && (typeof value === 'string' || typeof value === 'number' || value == null)) {
        target[key] = today;
        return;
      }

      if (value && typeof value === 'object') {
        sanitizeFiscalCloneNfeDraftObject(value, depth + 1, keyText);
      }
    });
  }

  function buildFiscalCloneNfeDraftPayload(detail) {
    const source = unwrapZwebPayload(detail);
    if (!source || typeof source !== 'object') {
      throw new Error('A Zweb não retornou os detalhes da NF-e original.');
    }

    const payload = JSON.parse(JSON.stringify(source));
    sanitizeFiscalCloneNfeDraftObject(payload, 0, '');

    if (payload && typeof payload === 'object') {
      if (!payload.modelo && !payload.model) payload.modelo = NFE_DOCUMENT_MODEL;
      if (payload.dados && typeof payload.dados === 'object') {
        payload.dados.id = null;
        if (!payload.dados.modelo && !payload.dados.model) payload.dados.modelo = NFE_DOCUMENT_MODEL;
      }
    }

    return payload;
  }

  async function prepareFiscalCloneNfeAfterCancelPayload(pending) {
    const entry = pending && pending.entry;
    const detail = await fetchNfeBatchDetail(entry || {}, 'fiscalDocumentWrite');
    return buildFiscalCloneNfeDraftPayload(detail);
  }

  function extractFiscalCloneNfeCreatedId(response) {
    const payload = unwrapZwebPayload(response);
    const candidates = [
      payload && payload.id,
      payload && payload.dados && payload.dados.id,
      response && response.id,
      response && response.data && response.data.id,
      response && response.result && response.result.id
    ];
    for (let index = 0; index < candidates.length; index += 1) {
      const number = Number(candidates[index]);
      if (Number.isFinite(number) && number > 0) return number;
    }
    return null;
  }

  async function createFiscalCloneNfeAfterCancel(pending) {
    const clonePayload = pending && pending.clonePayload;
    if (!clonePayload || typeof clonePayload !== 'object') {
      throw new Error('Payload do clone da NF-e não foi preparado antes do cancelamento.');
    }

    const response = await postZwebJson(NFE_POST_API_URL, clonePayload, 'fiscalDocumentWrite');
    const createdId = extractFiscalCloneNfeCreatedId(response);
    logFiscalCloneDav('nfe-clone-after-cancel-api-ok', {
      documentNumber: pending && pending.entry && pending.entry.documentNumber,
      createdId
    });
    if (createdId) {
      window.location.hash = '#/fiscal/nfe/edit/' + createdId;
    } else {
      window.location.hash = '#/fiscal/nfe';
      scheduleFeatureUiRefresh(300);
    }
    return response;
  }

  async function startFiscalCloneNfeCancelThenClone(pending, cancelAction) {
    if (!cancelAction) {
      FISCAL_CLONE_AFTER_CANCEL_PENDING = null;
      setFiscalCloneConfirmActionState({ busy: false, disabled: false, yesLabel: 'Clonar e cancelar original' });
      window.alert('Não foi possível localizar a ação Cancelar para este documento.');
      return false;
    }

    try {
      setFiscalCloneConfirmActionState({ busy: true, disabled: true, yesLabel: 'Preparando clone...' });
      const clonePayload = await prepareFiscalCloneNfeAfterCancelPayload(pending);
      FISCAL_CLONE_AFTER_CANCEL_PENDING = Object.assign({}, pending || {}, {
        clonePayload,
        waitingCancelAt: Date.now()
      });
      FISCAL_CLONE_CONFIRM_PENDING = null;
      closeFiscalCloneConfirmModal();
      activateFiscalMenuAction(cancelAction, { singleClick: true });
      return true;
    } catch (error) {
      FISCAL_CLONE_AFTER_CANCEL_PENDING = null;
      logFiscalCloneDav('nfe-clone-before-cancel-prepare-error', {
        message: error && error.message ? error.message : String(error || ''),
        documentNumber: pending && pending.entry && pending.entry.documentNumber
      });
      setFiscalCloneConfirmActionState({ busy: false, disabled: false, yesLabel: 'Clonar e cancelar original' });
      window.alert('Não foi possível preparar o clone da NF-e. O cancelamento não foi iniciado. Erro: ' + (error && error.message ? error.message : String(error || '')));
      return false;
    }
  }

  function isFiscalCloneNfeCancelRequest(data) {
    if (!FISCAL_CLONE_AFTER_CANCEL_PENDING) return false;
    if (!data || data.type !== 'fiscal-cancel-request-log') return false;
    if (String(data.url || '').indexOf('fiscal.cancel-nfe') === -1) return false;
    const request = parseJson(data.requestBody || '{}') || {};
    const model = String(request.modelo || request.model || '').replace(/\D+/g, '');
    return !model || model === String(NFE_DOCUMENT_MODEL);
  }

  function handleFiscalCloneAfterCancelLog(data) {
    if (!isFiscalCloneNfeCancelRequest(data)) return;

    const pending = FISCAL_CLONE_AFTER_CANCEL_PENDING;
    const status = Number(data && data.status);
    const response = parseJson(data && data.responseText || '{}') || {};
    const ok = Number.isFinite(status) && status >= 200 && status < 300 && !response.error_message && !response.error;
    if (!ok) {
      FISCAL_CLONE_AFTER_CANCEL_PENDING = null;
      logFiscalCloneDav('nfe-clone-after-cancel-skipped', {
        reason: 'cancel_failed',
        status: Number.isFinite(status) ? status : 0,
        documentNumber: pending && pending.entry && pending.entry.documentNumber
      });
      return;
    }

    FISCAL_CLONE_AFTER_CANCEL_PENDING = null;
    setTimeout(() => {
      createFiscalCloneNfeAfterCancel(pending)
        .catch((error) => {
          logFiscalCloneDav('nfe-clone-after-cancel-error', {
            message: error && error.message ? error.message : String(error || ''),
            documentNumber: pending && pending.entry && pending.entry.documentNumber
          });
          window.alert('NF-e cancelada, mas houve falha ao criar o clone automaticamente: ' + (error && error.message ? error.message : String(error || '')));
        });
    }, 350);
  }

  function getFiscalCloneConfirmEntry(trigger) {
    if (isTargetDavCloneBlockRoute()) {
      const row = findNfeContextMenuRow(trigger) || findActiveNfeActionRow();
      const headerMap = getNfeHeaderMap();
      const customerCol = findNfeColumnIndex(headerMap, ['cliente']);
      const statusCol = findNfeColumnIndex(headerMap, ['situacao', 'situação', 'status']);
      const davNumber = row ? getDavNumberFromRow(row) : '';
      if (row || davNumber) {
        return {
          row,
          documentNumber: davNumber,
          seriesText: '',
          customerName: Number.isFinite(customerCol) ? getNfeRowCellText(row, customerCol) : '',
          statusText: Number.isFinite(statusCol) ? getNfeRowCellText(row, statusCol) : ''
        };
      }
    }

    const row = findNfeContextMenuRow(trigger) || findActiveNfeActionRow();
    const entry = row ? buildNfeRowSelectionEntry(row, getNfeHeaderMap()) : null;
    if (entry) return entry;
    return {
      documentNumber: '',
      seriesText: '',
      customerName: '',
      statusText: ''
    };
  }

  function getFiscalCloneDavTotalValue(row) {
    if (!row) return null;
    const headerMap = getNfeHeaderMap();
    const totalCol = findNfeColumnIndex(headerMap, ['total r$', 'total', 'valor', 'valor r$']);
    const totalText = Number.isFinite(totalCol) ? getNfeRowCellText(row, totalCol) : '';
    const parsed = parsePdvMoney(totalText);
    if (Number.isFinite(parsed) && parsed > 0) return parsed;

    const cells = Array.from(row.querySelectorAll('.cell'))
      .map((cell) => String(cell.innerText || cell.textContent || '').trim())
      .filter(Boolean);
    for (let index = cells.length - 1; index >= 0; index -= 1) {
      if (/\d{1,2}\/\d{1,2}\/\d{2,4}/.test(cells[index])) continue;
      if (!/^-?\s*(?:R\$\s*)?\d{1,3}(?:\.\d{3})*,\d{2}$|^-?\s*(?:R\$\s*)?\d+,\d{2}$/.test(cells[index])) continue;
      const value = parsePdvMoney(cells[index]);
      if (Number.isFinite(value) && value > 0) return value;
    }

    return null;
  }

  function getFiscalCloneDavSaleIdFromNode(node) {
    if (!node || typeof node !== 'object') return null;
    const urlPattern = /(?:^|[\/#])document\/davs\/sale\/edit\/(\d+)(?:$|[/?#])/i;
    const looseEditPattern = /(?:^|[\/#])sale\/edit\/(\d+)(?:$|[/?#])/i;
    const candidateTexts = [];

    const pushText = (value) => {
      const text = String(value || '').trim();
      if (text) candidateTexts.push(text);
    };

    if (node.dataset && typeof node.dataset === 'object') {
      Object.keys(node.dataset).forEach((key) => {
        pushText(node.dataset[key]);
      });
    }

    if (node.attributes && typeof node.attributes.length === 'number') {
      for (let index = 0; index < node.attributes.length; index += 1) {
        const attribute = node.attributes[index];
        if (!attribute) continue;
        pushText(attribute.value);
      }
    }

    for (let index = 0; index < candidateTexts.length; index += 1) {
      const text = candidateTexts[index];
      const urlMatch = text.match(urlPattern) || text.match(looseEditPattern);
      if (urlMatch && Number(urlMatch[1]) > 0) {
        return Number(urlMatch[1]);
      }
    }

    return null;
  }

  function getFiscalCloneDavSaleIdFromRow(row) {
    if (!row) return null;
    const direct = getFiscalCloneDavSaleIdFromNode(row);
    if (Number.isFinite(direct) && direct > 0) return direct;

    const descendants = row.querySelectorAll('*');
    for (let index = 0; index < descendants.length; index += 1) {
      const resolved = getFiscalCloneDavSaleIdFromNode(descendants[index]);
      if (Number.isFinite(resolved) && resolved > 0) {
        return resolved;
      }
    }

    return null;
  }

  function buildFiscalCloneDavFlow(pending) {
    const entry = pending && pending.entry;
    const row = entry && entry.row || findNfeContextMenuRow(pending && pending.trigger) || findActiveNfeActionRow();
    const davNumber = getDavNumberFromRow(row) || (entry && entry.documentNumber) || '';
    const totalValue = getFiscalCloneDavTotalValue(row);
    const davSaleId = getFiscalCloneDavSaleIdFromRow(row) || Number(entry && entry.id) || null;
    return {
      davSaleId,
      davDocumentNumber: davNumber,
      totalValue,
      returnHash: window.location.hash || '#/document/davs/sale',
      createdAt: Date.now()
    };
  }

  function getFiscalCloneDavPendingFlow() {
    const pending = FISCAL_CLONE_CONFIRM_PENDING;
    if (!pending || !isTargetDavCloneBlockRoute()) return null;
    if (!pending.davFlow) {
      pending.davFlow = buildFiscalCloneDavFlow(pending);
    }
    return pending.davFlow;
  }

  function isFiscalCloneAuthorizedStatus(value) {
    const numeric = Number(value);
    if (Number.isFinite(numeric)) {
      return numeric === 2;
    }
    const text = normalizeText(getApiDisplayText(value) || value);
    if (!text) return false;
    if (text.indexOf('cancel') !== -1 || text.indexOf('inutil') !== -1 || text.indexOf('deneg') !== -1) return false;
    return text.indexOf('autoriz') !== -1 || text === '100' || text === '1';
  }

  function getFiscalCloneStatusLabel(value) {
    const numeric = Number(value);
    if (Number.isFinite(numeric)) {
      switch (numeric) {
        case 2: return 'Autorizada';
        case 3: return 'Cancelada';
        case 4: return 'Inutilizada';
        case 5: return 'Denegada';
        default: return 'Status ' + String(value);
      }
    }
    const text = getApiDisplayText(value) || String(value == null ? '' : value).trim();
    return text || '-';
  }

  function getFiscalCloneApiTotal(item) {
    const value = getNestedValue(item, [
      'total',
      'price',
      'valorTotal',
      'value',
      'amount',
      'dados.total',
      'dados.price',
      'dados.valorTotal',
      'dados.totalNfe',
      'dados.valor'
    ]);
    const parsed = typeof value === 'number' ? value : parsePdvMoney(value);
    return Number.isFinite(parsed) ? parsed : null;
  }

  function getFiscalCloneApiNumber(item) {
    return normalizeApiDocumentNumber(getNestedValue(item, [
      'numero',
      'number',
      'documentNumber',
      'sequence',
      'dados.numero',
      'dados.number',
      'dados.nNF',
      'nNF'
    ]));
  }

  function normalizeFiscalCloneNfceApiMatch(item) {
    if (!item || typeof item !== 'object') return null;
    const number = getFiscalCloneApiNumber(item);
    const total = getFiscalCloneApiTotal(item);
    if (!number || !Number.isFinite(total)) return null;

    const status = getNestedValue(item, [
      'statusText',
      'statusLabel',
      'situacao',
      'status',
      'dados.statusText',
      'dados.statusLabel',
      'dados.situacao',
      'dados.status'
    ]);
    const serie = getNestedValue(item, ['serie', 'series', 'dados.serie', 'dados.series']);
    const customer = getApiDisplayText(getNestedValue(item, [
      'customer',
      'client',
      'buyer',
      'destinatario',
      'dados.customer',
      'dados.client',
      'dados.buyer',
      'dados.destinatario'
    ]));

    return {
      id: getNestedValue(item, ['id', 'dados.id']),
      nfceNumber: number,
      seriesText: serie == null ? '' : String(serie),
      customerName: customer,
      statusText: getFiscalCloneStatusLabel(status),
      totalValue: total,
      authorized: isFiscalCloneAuthorizedStatus(status),
      raw: item
    };
  }

  function isSameFiscalCloneMoney(a, b) {
    const left = Number(a);
    const right = Number(b);
    return Number.isFinite(left) && Number.isFinite(right) && Math.abs(left - right) < 0.005;
  }

  async function findFiscalCloneDavNfceByApi(flow) {
    const total = Number(flow && flow.totalValue);
    if (!Number.isFinite(total) || total <= 0) return null;

    const payload = await postZwebJson(FISCAL_GET_NFE_PAGINATE_API_URL, {
      modelos: ['65'],
      siniefN12: true,
      page: 1,
      maxResults: 80,
      sort: { key: 'emission', order: 'DESC' }
    }, 'davClone');
    const matches = getNfeApiRows(payload)
      .map(normalizeFiscalCloneNfceApiMatch)
      .filter(Boolean)
      .filter((entry) => isSameFiscalCloneMoney(entry.totalValue, total));

    return matches.find((entry) => entry.authorized) || matches[0] || null;
  }

  function setFiscalCloneConfirmActionState(options) {
    const modal = document.getElementById(FISCAL_CLONE_CONFIRM_MODAL_ID);
    if (!modal) return;
    const yesButton = modal.querySelector('[data-fiscal-clone-confirm-cancel-original]');
    const noButton = modal.querySelector('[data-fiscal-clone-confirm-only]');
    const closeButton = modal.querySelector('[data-fiscal-clone-confirm-close]');
    const disabled = !!(options && options.disabled);
    const busy = !!(options && options.busy);
    [yesButton, noButton, closeButton].forEach((button) => {
      if (!button) return;
      if (busy || (button === yesButton && disabled)) {
        button.setAttribute('disabled', 'true');
        button.setAttribute('aria-disabled', 'true');
      } else {
        button.removeAttribute('disabled');
        button.removeAttribute('aria-disabled');
      }
    });
    if (yesButton && options && typeof options.yesLabel === 'string') {
      yesButton.textContent = options.yesLabel;
    }
  }

  function getFiscalCloneDavCancelReason() {
    const input = document.getElementById(FISCAL_CLONE_CONFIRM_REASON_ID);
    return String(input && input.value || '').trim();
  }

  function getFiscalCloneDavReasonValidationError(reason, match) {
    if (!match) return 'Nenhum cupom com o mesmo valor foi localizado para cancelamento.';
    if (match.authorized === false) {
      return 'O cupom localizado ja esta ' + (match.statusText || 'indisponivel') + ' e nao pode ser cancelado novamente.';
    }
    const normalized = String(reason || '').trim();
    if (!normalized) return 'Informe o motivo do cancelamento.';
    if (normalized.length < FISCAL_CLONE_CANCEL_REASON_MIN_LENGTH) {
      return 'O motivo deve ter pelo menos ' + FISCAL_CLONE_CANCEL_REASON_MIN_LENGTH + ' caracteres.';
    }
    return '';
  }

  function setFiscalCloneDavReasonError(message) {
    const error = document.getElementById(FISCAL_CLONE_CONFIRM_REASON_ERROR_ID);
    if (!error) return;
    error.textContent = String(message || '');
    error.style.display = message ? 'block' : 'none';
  }

  function syncFiscalCloneDavReasonState() {
    const pending = FISCAL_CLONE_CONFIRM_PENDING;
    if (!pending || !isTargetDavCloneBlockRoute()) return;
    const match = pending.davNfceMatch || null;
    const reason = getFiscalCloneDavCancelReason();
    const validationError = getFiscalCloneDavReasonValidationError(reason, match);
    const disabled = !!validationError;
    setFiscalCloneConfirmActionState({ disabled, yesLabel: 'Sim' });
    setFiscalCloneDavReasonError(reason ? validationError : '');
  }

  function renderFiscalCloneDavDetails(entry, flow, match, statusText) {
    const details = document.getElementById(FISCAL_CLONE_CONFIRM_DETAILS_ID);
    if (!details) return;
    const totalText = Number.isFinite(Number(flow && flow.totalValue))
      ? formatPdvMoney(flow.totalValue)
      : '-';
    const rows = [
      '<div><strong>Pedido de venda:</strong> ' + escapeHtml(entry && entry.documentNumber || '-') + '</div>',
      entry && entry.customerName ? '<div><strong>Cliente:</strong> ' + escapeHtml(entry.customerName) + '</div>' : '',
      '<div><strong>Valor:</strong> ' + escapeHtml(totalText) + '</div>'
    ];

    if (match) {
      const statusColor = match.authorized ? '#20c997' : '#ff6b6b';
      rows.push(
        '<div style="margin-top:8px;color:' + statusColor + ';"><strong>Cupom localizado:</strong> NFC-e ' + escapeHtml(match.nfceNumber || '-') + '</div>',
        '<div><strong>Status:</strong> ' + escapeHtml(match.statusText || '-') + '</div>'
      );
      if (match.authorized) {
        rows.push(
          '<div style="margin-top:12px;">',
          '  <label for="' + FISCAL_CLONE_CONFIRM_REASON_ID + '" style="display:block;margin-bottom:6px;font-weight:600;">Motivo do cancelamento</label>',
          '  <textarea id="' + FISCAL_CLONE_CONFIRM_REASON_ID + '" class="form-control" rows="3" placeholder="Digite o motivo do cancelamento" style="resize:vertical;font-size:13px;"></textarea>',
          '  <div id="' + FISCAL_CLONE_CONFIRM_REASON_ERROR_ID + '" class="text-danger" style="display:none;margin-top:6px;font-size:12px;"></div>',
          '</div>'
        );
      }
    } else if (statusText) {
      rows.push('<div style="margin-top:8px;color:#adb5bd;">' + escapeHtml(statusText) + '</div>');
    }

    details.innerHTML = rows.filter(Boolean).join('');
    const reasonInput = document.getElementById(FISCAL_CLONE_CONFIRM_REASON_ID);
    if (reasonInput) {
      reasonInput.addEventListener('input', syncFiscalCloneDavReasonState);
      reasonInput.addEventListener('change', syncFiscalCloneDavReasonState);
      setTimeout(() => {
        try { reasonInput.focus({ preventScroll: true }); } catch (error) {}
      }, 80);
    }
  }

  function startFiscalCloneDavLookup(pending) {
    const flow = getFiscalCloneDavPendingFlow();
    if (!pending || !flow) return;

    renderFiscalCloneDavDetails(pending.entry, flow, null, 'Localizando cupom com o mesmo valor...');
    setFiscalCloneConfirmActionState({ disabled: true, yesLabel: 'Sim' });

    findFiscalCloneDavNfceByApi(flow)
      .then((match) => {
        if (!FISCAL_CLONE_CONFIRM_PENDING || FISCAL_CLONE_CONFIRM_PENDING !== pending) return;
        pending.davNfceMatch = match || null;
        if (match) {
          pending.davFlow = Object.assign({}, flow, match);
          renderFiscalCloneDavDetails(pending.entry, pending.davFlow, match, '');
          syncFiscalCloneDavReasonState();
          logFiscalCloneDav('dav-nfce-match-found', {
            davDocumentNumber: pending.davFlow.davDocumentNumber,
            totalValue: pending.davFlow.totalValue,
            nfceNumber: match.nfceNumber,
            statusText: match.statusText,
            authorized: match.authorized
          });
          return;
        }
        renderFiscalCloneDavDetails(pending.entry, flow, null, 'Nenhum cupom com o mesmo valor foi localizado automaticamente.');
        setFiscalCloneConfirmActionState({ disabled: true, yesLabel: 'Sim' });
        logFiscalCloneDav('dav-nfce-match-missing', flow);
      })
      .catch((error) => {
        if (!FISCAL_CLONE_CONFIRM_PENDING || FISCAL_CLONE_CONFIRM_PENDING !== pending) return;
        renderFiscalCloneDavDetails(pending.entry, flow, null, 'Não foi possível consultar o cupom automaticamente.');
        setFiscalCloneConfirmActionState({ disabled: true, yesLabel: 'Sim' });
        logFiscalCloneDav('dav-nfce-match-error', {
          message: error && error.message ? error.message : String(error || ''),
          flow
        });
      });
  }

  function setFiscalCloneDavState(state) {
    try {
      if (!state) {
        sessionStorage.removeItem(FISCAL_CLONE_DAV_STATE_STORAGE_KEY);
        return;
      }
      sessionStorage.setItem(FISCAL_CLONE_DAV_STATE_STORAGE_KEY, JSON.stringify(state));
    } catch (error) {}
  }

  function getFiscalCloneDavState() {
    try {
      const raw = sessionStorage.getItem(FISCAL_CLONE_DAV_STATE_STORAGE_KEY);
      const state = raw ? JSON.parse(raw) : null;
      if (!state || typeof state !== 'object') return null;
      if (Date.now() - Number(state.createdAt || 0) > 180000) {
        setFiscalCloneDavState(null);
        return null;
      }
      return state;
    } catch (error) {
      return null;
    }
  }

  function readFiscalCloneDavCache() {
    if (FISCAL_CLONE_DAV_CACHE && typeof FISCAL_CLONE_DAV_CACHE === 'object') {
      return FISCAL_CLONE_DAV_CACHE;
    }
    try {
      const raw = sessionStorage.getItem(FISCAL_CLONE_DAV_CACHE_STORAGE_KEY);
      const parsed = raw ? JSON.parse(raw) : null;
      FISCAL_CLONE_DAV_CACHE = parsed && typeof parsed === 'object' ? parsed : {};
    } catch (error) {
      FISCAL_CLONE_DAV_CACHE = {};
    }
    return FISCAL_CLONE_DAV_CACHE;
  }

  function writeFiscalCloneDavCache(cache) {
    FISCAL_CLONE_DAV_CACHE = cache && typeof cache === 'object' ? cache : {};
    try {
      sessionStorage.setItem(FISCAL_CLONE_DAV_CACHE_STORAGE_KEY, JSON.stringify(FISCAL_CLONE_DAV_CACHE));
    } catch (error) {}
  }

  function getFiscalCloneDavCacheEntry(key) {
    const cache = readFiscalCloneDavCache();
    const entry = cache && cache[key];
    if (!entry || typeof entry !== 'object') return null;
    if (Date.now() - Number(entry.cachedAt || 0) > FISCAL_CLONE_DAV_CACHE_TTL_MS) {
      delete cache[key];
      writeFiscalCloneDavCache(cache);
      return null;
    }
    return entry.value;
  }

  function setFiscalCloneDavCacheEntry(key, value) {
    const cache = readFiscalCloneDavCache();
    cache[key] = {
      cachedAt: Date.now(),
      value
    };
    writeFiscalCloneDavCache(cache);
  }

  function startFiscalCloneDavBackgroundClone(flow) {
    logFiscalCloneDav('background-start-request', flow || {});
    return sendRuntimeMessage({
      type: 'fiscal-clone-dav-background-start',
      flow: flow || {}
    }).catch((error) => {
      logFiscalCloneDav('background-start-error', {
        message: error && error.message ? error.message : String(error || '')
      });
      return null;
    });
  }

  async function cancelFiscalCloneDavNfceByApi(flow, reason) {
    const id = Number(flow && (flow.id || flow.raw && flow.raw.id));
    if (!Number.isFinite(id) || id <= 0) {
      throw new Error('ID da NFC-e nao encontrado para cancelamento.');
    }
    const justification = String(reason || '').trim();
    if (!justification) {
      throw new Error('Motivo do cancelamento nao informado.');
    }
    if (justification.length < FISCAL_CLONE_CANCEL_REASON_MIN_LENGTH) {
      throw new Error('O motivo deve ter pelo menos ' + FISCAL_CLONE_CANCEL_REASON_MIN_LENGTH + ' caracteres.');
    }

    const request = {
      modelo: '65',
      id,
      justification,
      deleteLinkedFlows: true
    };
    logFiscalCloneDav('nfce-cancel-api-start', {
      id: request.id,
      nfceNumber: flow && flow.nfceNumber,
      justification: request.justification
    });

    const response = await postZwebJson(FISCAL_CANCEL_NFE_API_URL, request, 'fiscalCancellation');
    logFiscalCloneDav('nfce-cancel-api-ok', {
      id: request.id,
      nfceNumber: flow && flow.nfceNumber
    });
    return response;
  }

  async function findFiscalCloneDavSaleIdBySequence(sequence) {
    const requested = String(sequence || '').replace(/\D+/g, '');
    if (!requested) return null;
    const cachedId = Number(getFiscalCloneDavCacheEntry('saleId:' + requested));
    if (Number.isFinite(cachedId) && cachedId > 0) {
      return cachedId;
    }

    const deadline = Date.now() + 65000;
    let attempt = 0;
    while (Date.now() < deadline) {
      attempt += 1;
      for (let page = 1; page <= 6; page += 1) {
        const payload = await postZwebJson(INVENTORY_GET_SALE_PAGINATE_API_URL, {
          page,
          maxResults: 100
        }, 'davClone');
        const rows = getNfeApiRows(payload);
        const match = rows.find((item) => String(getNestedValue(item, ['sequence', 'numero', 'number', 'id']) || '').replace(/\D+/g, '') === requested);
        const id = Number(match && match.id);
        if (Number.isFinite(id) && id > 0) {
          setFiscalCloneDavCacheEntry('saleId:' + requested, id);
          return id;
        }
        if (!Array.isArray(rows) || rows.length < 100) break;
      }
      if (Date.now() >= deadline) break;
      logFiscalCloneDav('dav-clone-sale-id-retry', {
        davDocumentNumber: requested,
        attempt
      });
      await delay(2500);
    }
    return null;
  }

  function buildFiscalCloneDavPostSalePayload(detail) {
    const clone = JSON.parse(JSON.stringify(detail || {}));
    clone.id = null;
    clone.sequence = null;
    clone.nfeId = null;
    clone.refNFe = null;
    clone.eletronicInvoiceNumber = null;
    clone.eletronicInvoiceSerie = null;
    clone.eletronicInvoiceModel = null;
    clone.xmlFile = null;
    clone.chave = null;
    clone.invoiceKey = null;
    clone.statusTransmissao = null;
    clone.numeroVinculo = null;
    clone.modeloVinculo = null;
    clone.created = null;
    clone.updated = null;
    clone.deleted = null;
    if (typeof clone.validity === 'string') clone.validity = clone.validity.split('T')[0] || clone.validity;
    if (typeof clone.deliveryDate === 'string') clone.deliveryDate = clone.deliveryDate.split('T')[0] || clone.deliveryDate;
    if (typeof clone.shippingDate === 'string') clone.shippingDate = clone.shippingDate.split('T')[0] || clone.shippingDate;
    if (Array.isArray(clone.itemOfTradeCollection)) {
      clone.itemOfTradeCollection.forEach((item) => {
        if (!item || typeof item !== 'object') return;
        item.id = null;
        item.created = null;
        item.updated = null;
        item.deleted = null;
      });
    }
    return clone;
  }

  function isFiscalCloneEditingStatusLabel(value) {
    return normalizeText(getApiDisplayText(value) || value).indexOf('editando') !== -1;
  }

  async function resolveFiscalCloneEditingTradeStatus() {
    const cached = getFiscalCloneDavCacheEntry('editingTradeStatus');
    if (cached && typeof cached === 'object' && Number(cached.id) > 0) {
      return JSON.parse(JSON.stringify(cached));
    }
    const payload = await postZwebJson(INVENTORY_GET_SALE_PAGINATE_API_URL, {
      page: 1,
      maxResults: 80
    }, 'davClone');
    const rows = getNfeApiRows(payload);
    const editingRow = rows.find((item) => isFiscalCloneEditingStatusLabel(getNestedValue(item, [
      'statusDescription',
      'tradeStatus.description',
      'status.description',
      'tradeStatus',
      'status'
    ])));
    const editingId = Number(editingRow && editingRow.id);
    if (!Number.isFinite(editingId) || editingId <= 0) return null;

    const detail = await postZwebJson(INVENTORY_GET_DETAILED_SALE_API_URL, { id: editingId }, 'davClone');
    const tradeStatus = detail && detail.tradeStatus && isFiscalCloneEditingStatusLabel(detail.tradeStatus.description || detail.tradeStatus)
      ? detail.tradeStatus
      : null;
    const status = detail && detail.status && isFiscalCloneEditingStatusLabel(detail.status.description || detail.status)
      ? detail.status
      : null;
    const resolved = tradeStatus || status || null;
    if (resolved) {
      setFiscalCloneDavCacheEntry('editingTradeStatus', resolved);
    }
    return resolved ? JSON.parse(JSON.stringify(resolved)) : null;
  }

  async function validateFiscalCloneDavCreditLimit(payload) {
    if (!payload || typeof payload !== 'object') return null;
    const request = {
      buyer: payload.buyer || null,
      paymentModeCollection: payload.paymentMode ? [payload.paymentMode] : [],
      tradeStatus: payload.tradeStatus || payload.status || null,
      price: Number(payload.price) || 0
    };
    logFiscalCloneDav('dav-clone-credit-limit-start', {
      buyerId: request.buyer && request.buyer.id,
      paymentModeId: request.paymentModeCollection[0] && request.paymentModeCollection[0].id,
      tradeStatusId: request.tradeStatus && request.tradeStatus.id,
      price: request.price
    });
    const response = await postZwebJson(INVENTORY_POST_CREDIT_LIMIT_API_URL, request, 'davClone');
    logFiscalCloneDav('dav-clone-credit-limit-ok', response || {});
    return response;
  }

  async function cloneFiscalCloneDavByApi(flow) {
    const davNumber = String(flow && flow.davDocumentNumber || '').replace(/\D+/g, '');
    const directSaleId = Number(flow && flow.davSaleId);
    if (!davNumber && (!Number.isFinite(directSaleId) || directSaleId <= 0)) {
      throw new Error('Numero do DAV ausente para clonagem.');
    }

    logFiscalCloneDav('dav-clone-api-lookup-start', {
      davDocumentNumber: davNumber,
      davSaleId: directSaleId
    });
    const saleId = Number.isFinite(directSaleId) && directSaleId > 0
      ? directSaleId
      : await findFiscalCloneDavSaleIdBySequence(davNumber);
    if (!saleId) throw new Error('DAV ' + davNumber + ' nao localizado para clonagem.');
    if (davNumber) {
      setFiscalCloneDavCacheEntry('saleId:' + davNumber, saleId);
    }

    logFiscalCloneDav('dav-clone-api-detail-start', { davDocumentNumber: davNumber, saleId });
    const detail = await postZwebJson(INVENTORY_GET_DETAILED_SALE_API_URL, { id: saleId }, 'davClone');
    const postPayload = buildFiscalCloneDavPostSalePayload(detail);
    const editingTradeStatus = await resolveFiscalCloneEditingTradeStatus();
    if (editingTradeStatus) {
      postPayload.tradeStatus = editingTradeStatus;
    }
    logFiscalCloneDav('dav-clone-api-save-start', {
      davDocumentNumber: davNumber,
      saleId,
      totalValue: postPayload && postPayload.price,
      nfeId: postPayload && postPayload.nfeId,
      eletronicInvoiceNumber: postPayload && postPayload.eletronicInvoiceNumber,
      statusId: postPayload && postPayload.status && postPayload.status.id,
      tradeStatusId: postPayload && postPayload.tradeStatus && postPayload.tradeStatus.id,
      tradeStatusDescription: postPayload && postPayload.tradeStatus && postPayload.tradeStatus.description
    });
    await validateFiscalCloneDavCreditLimit(postPayload);
    const response = await postZwebJson(INVENTORY_POST_SALE_API_URL, postPayload, 'davClone');
    const createdId = Number(response && response.id);
    const createdSequence = Number(response && response.sequence);
    if (!Number.isFinite(createdId) || createdId <= 0 || !Number.isFinite(createdSequence) || createdSequence <= 0) {
      logFiscalCloneDav('dav-clone-api-invalid-response', {
        davDocumentNumber: davNumber,
        sourceSaleId: saleId,
        response
      });
      throw new Error('Zweb nao confirmou a criacao do DAV clonado.');
    }
    logFiscalCloneDav('dav-clone-api-ok', {
      davDocumentNumber: davNumber,
      sourceSaleId: saleId,
      newSaleId: response && response.id,
      newSequence: response && response.sequence
    });
    return response;
  }

  async function startFiscalCloneDavApiCancelAndRedirect(flow, reason) {
    const clonedDav = await cloneFiscalCloneDavByApi(flow);
    await cancelFiscalCloneDavNfceByApi(flow, reason);
    setFiscalCloneDavState(null);
    window.location.hash = '#/fiscal/pdv';
    scheduleFeatureUiRefresh(80);
    return clonedDav;
  }

  function findNfceRowByFiscalCloneDavFlow(flow) {
    const requestedNumber = String(flow && flow.nfceNumber || '').replace(/\D+/g, '');
    const total = Number(flow && flow.totalValue);
    const formatted = Number.isFinite(total) && total > 0
      ? total.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
      : '';

    const rows = Array.from(document.querySelectorAll('.table-row'))
      .filter((row) => row && !row.classList.contains('header') && isVisible(row));

    if (requestedNumber) {
      const byNumber = rows.find((row) => {
        const firstCell = getNfeRowCellText(row, 0);
        const rowText = String(row.innerText || row.textContent || '');
        return String(firstCell || rowText).replace(/\D+/g, '').indexOf(requestedNumber) !== -1;
      });
      if (byNumber) return byNumber;
    }

    if (!formatted) return null;

    return rows.find((row) => {
      const text = normalizeText(row.innerText || row.textContent || '');
      return text.indexOf(normalizeText(formatted)) !== -1 && text.indexOf('autorizada') !== -1;
    }) || rows.find((row) => {
      const text = normalizeText(row.innerText || row.textContent || '');
      return text.indexOf(normalizeText(formatted)) !== -1;
    }) || null;
  }

  async function applyFiscalCloneNfceSearch(flow) {
    const number = String(flow && flow.nfceNumber || '').replace(/\D+/g, '');
    if (!number) return false;

    const input = document.querySelector(PRODUCT_TOOLBAR_SEARCH_SELECTOR)
      || document.querySelector('input#search\\.value')
      || document.querySelector('.grid-toolbar-search')
      || document.querySelector('input[placeholder*="Buscar"], input[placeholder*="buscar"]');
    if (!input || !isVisible(input)) return false;

    logFiscalCloneDav('nfce-search-start', { number });
    setInputValueAndNotify(input, number);
    input.dispatchEvent(new KeyboardEvent('keyup', { bubbles: true, cancelable: true, key: 'Enter', code: 'Enter' }));
    input.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, cancelable: true, key: 'Enter', code: 'Enter' }));
    input.dispatchEvent(new KeyboardEvent('keypress', { bubbles: true, cancelable: true, key: 'Enter', code: 'Enter' }));
    logFiscalCloneDav('nfce-search-filled', {
      number,
      inputId: input.id || '',
      inputClass: String(input.className || '')
    });
    await delay(1400);
    return true;
  }

  function isFiscalCloneDavNfceCanceled(flow) {
    const row = findNfceRowByFiscalCloneDavFlow(flow);
    if (!row) return false;
    const text = normalizeText(row.innerText || row.textContent || '');
    return text.indexOf('cancelada') !== -1;
  }

  async function openFiscalCloneDavNfceCancel(flow) {
    logFiscalCloneDav('nfce-cancel-open-start', flow || {});
    await applyFiscalCloneNfceSearch(flow);
    const row = await waitForCondition(() => findNfceRowByFiscalCloneDavFlow(flow), 12000, 300);
    if (!row) {
      logFiscalCloneDav('nfce-cancel-row-missing', {
        totalValue: flow && flow.totalValue,
        bodyText: String(document.body && document.body.innerText || '').slice(0, 900)
      });
      return false;
    }

    logFiscalCloneDav('nfce-cancel-row-found', {
      rowText: String(row.innerText || row.textContent || '').slice(0, 260)
    });

    const menu = await openFiscalCloneRowContextMenu(row);
    const cancelAction = findNfeActionMenuItem(menu, ['Cancelar'], true)
      || Array.from(document.querySelectorAll('a, button, li')).find((item) => normalizeText(extractActionMenuItemLabel(item) || item.innerText || item.textContent || '') === 'cancelar');
    if (!cancelAction) {
      logFiscalCloneDav('nfce-cancel-action-missing', { menuText: menu ? String(menu.innerText || menu.textContent || '').slice(0, 300) : '' });
      return false;
    }

    logFiscalCloneDav('nfce-cancel-action-click', { text: String(cancelAction.innerText || cancelAction.textContent || '').trim() });
    activateFiscalMenuAction(cancelAction.matches && cancelAction.matches('li') ? (cancelAction.querySelector('a, button') || cancelAction) : cancelAction, { singleClick: true });
    focusFiscalCloneCancelReasonField(flow).catch(() => {});
    return true;
  }

  async function focusFiscalCloneCancelReasonField(flow) {
    const field = await waitForCondition(() => {
      const candidates = Array.from(document.querySelectorAll('textarea, input[type="text"], input:not([type])'))
        .filter((input) => input && isVisible(input) && !input.disabled && !input.readOnly);
      return candidates.find((input) => {
        const text = normalizeText([
          input.id,
          input.name,
          input.placeholder,
          input.getAttribute('aria-label'),
          input.closest && input.closest('.form-group, .mb-3, .col, .row, label') && input.closest('.form-group, .mb-3, .col, .row, label').innerText
        ].filter(Boolean).join(' '));
        return text.indexOf('justific') !== -1
          || text.indexOf('motivo') !== -1
          || text.indexOf('cancel') !== -1;
      }) || null;
    }, 8000, 200);
    if (!field) {
      logFiscalCloneDav('nfce-cancel-reason-field-missing', flow || {});
      return false;
    }
    try {
      field.focus({ preventScroll: false });
      if (field.select) field.select();
    } catch (error) {
      try { field.focus(); } catch (innerError) {}
    }
    logFiscalCloneDav('nfce-cancel-reason-field-focused', {
      nfceNumber: flow && flow.nfceNumber,
      fieldId: field.id || '',
      fieldName: field.name || '',
      placeholder: field.placeholder || ''
    });
    return true;
  }

  function startFiscalCloneDavCancelFlow(pending) {
    const flow = pending && pending.davFlow ? pending.davFlow : buildFiscalCloneDavFlow(pending);
    if (!flow || (!flow.davDocumentNumber && !Number.isFinite(Number(flow.totalValue)))) {
      window.alert('Não foi possível identificar o DAV selecionado para continuar o fluxo.');
      setFiscalCloneConfirmActionState({ busy: false, disabled: false, yesLabel: 'Sim' });
      return false;
    }
    if (!flow.nfceNumber) {
      window.alert('Nenhum cupom com o mesmo valor foi localizado para cancelamento.');
      setFiscalCloneConfirmActionState({ busy: false, disabled: true, yesLabel: 'Sim' });
      return false;
    }
    if (flow.authorized === false) {
      window.alert('O cupom localizado ja esta ' + (flow.statusText || 'indisponivel') + ' e nao pode ser cancelado novamente.');
      setFiscalCloneConfirmActionState({ busy: false, disabled: true, yesLabel: 'Sim' });
      return false;
    }
    const reason = getFiscalCloneDavCancelReason();
    const validationError = getFiscalCloneDavReasonValidationError(reason, flow);
    if (validationError) {
      setFiscalCloneDavReasonError(validationError);
      setFiscalCloneConfirmActionState({ busy: false, disabled: true, yesLabel: 'Sim' });
      return false;
    }

    setFiscalCloneDavState(Object.assign({}, flow, {
      step: 'api-cancel',
      cancelReason: reason
    }));
    startFiscalCloneDavApiCancelAndRedirect(flow, reason).catch((error) => {
      logFiscalCloneDav('nfce-cancel-api-error', {
        message: error && error.message ? error.message : String(error || ''),
        nfceNumber: flow && flow.nfceNumber
      });
      setFiscalCloneDavState(Object.assign({}, flow, {
        step: 'open-nfce-cancel',
        running: false,
        cancelReason: reason,
        lastError: error && error.message ? error.message : String(error || '')
      }));
      window.location.hash = '#/fiscal/nfce';
      scheduleFeatureUiRefresh(500);
    });
    return true;
  }

  function syncFiscalCloneDavFlow() {
    const state = getFiscalCloneDavState();
    if (!state || state.running) return;
    if (!isTargetNfceListRoute()) return;

    if (state.step === 'waiting-user-cancel') {
      if (!isFiscalCloneDavNfceCanceled(state)) return;
      logFiscalCloneDav('state-nfce-canceled-detected', state);
      setFiscalCloneDavState(null);
      window.setTimeout(() => {
        window.location.hash = '#/fiscal/pdv';
      }, 1200);
      return;
    }

    if (state.step !== 'open-nfce-cancel') return;

    state.running = true;
    setFiscalCloneDavState(state);
    openFiscalCloneDavNfceCancel(state)
      .then((opened) => {
        if (opened) {
          setFiscalCloneDavState(Object.assign({}, state, {
            step: 'waiting-user-cancel',
            running: false
          }));
        } else {
          setFiscalCloneDavState(Object.assign({}, state, {
            running: false,
            lastError: 'NFC-e nao localizada para cancelamento.'
          }));
        }
      })
      .catch((error) => {
        logFiscalCloneDav('nfce-cancel-open-error', {
          message: error && error.message ? error.message : String(error || '')
        });
        setFiscalCloneDavState(Object.assign({}, state, {
          running: false,
          lastError: error && error.message ? error.message : String(error || '')
        }));
      });
  }

  function closeFiscalCloneConfirmModal() {
    const modal = document.getElementById(FISCAL_CLONE_CONFIRM_MODAL_ID);
    const backdrop = document.getElementById(FISCAL_CLONE_CONFIRM_BACKDROP_ID);
    hideExtensionNativeModal(modal, backdrop);
  }

  function applyFiscalCloneConfirmModalTheme(modal) {
    if (!modal) return;
    const compact = window.innerWidth < 560;
    const dialog = modal.querySelector('[data-fiscal-clone-confirm-dialog]');
    if (dialog) {
      dialog.style.maxWidth = compact ? 'calc(100vw - 16px)' : '460px';
      dialog.style.margin = compact ? '8px auto' : '';
    }
  }

  function ensureFiscalCloneConfirmModal() {
    if (!document.body) return;

    if (!document.getElementById(FISCAL_CLONE_CONFIRM_BACKDROP_ID)) {
      const backdrop = document.createElement('div');
      backdrop.id = FISCAL_CLONE_CONFIRM_BACKDROP_ID;
      backdrop.className = 'modal-backdrop fade';
      backdrop.style.cssText = [
        'display:none',
        'z-index:1061'
      ].join(';');
      backdrop.addEventListener('click', closeFiscalCloneConfirmModal);
      document.body.appendChild(backdrop);
    }

    if (!document.getElementById(FISCAL_CLONE_CONFIRM_MODAL_ID)) {
      const modal = document.createElement('div');
      modal.id = FISCAL_CLONE_CONFIRM_MODAL_ID;
      modal.className = 'modal fade';
      modal.tabIndex = -1;
      modal.setAttribute('role', 'dialog');
      modal.setAttribute('aria-modal', 'true');
      modal.setAttribute('aria-hidden', 'true');
      modal.style.cssText = [
        'display:none',
        'z-index:1065'
      ].join(';');
      modal.innerHTML = [
        '<div class="modal-dialog modal-dialog-centered" data-fiscal-clone-confirm-dialog>',
        '  <div class="modal-content">',
        '    <div class="modal-header">',
        '      <h2 class="fw-semibold fs-6 fw-light text-primary">Deseja cancelar também o documento original?</h2>',
        '      <button type="button" data-fiscal-clone-confirm-close class="btn-close" aria-label="Close"></button>',
        '    </div>',
        '    <div class="modal-body pb-5" style="padding-top:1px;">',
        '      <div id="' + FISCAL_CLONE_CONFIRM_DETAILS_ID + '" class="rounded p-4" style="display:grid;gap:10px;font-size:13px;line-height:1.48;"></div>',
        '    </div>',
        '    <div class="modal-footer pt-0" style="gap:8px;flex-wrap:wrap;">',
        '      <button type="button" data-fiscal-clone-confirm-only class="btn btn-light btn-sm" style="font-size:13px;">Não</button>',
        '      <button type="button" data-fiscal-clone-confirm-cancel-original class="btn btn-primary btn-sm" style="font-size:13px;">Sim</button>',
        '    </div>',
        '  </div>',
        '</div>'
      ].join('');
      document.body.appendChild(modal);
    }

    applyFiscalCloneConfirmModalTheme(document.getElementById(FISCAL_CLONE_CONFIRM_MODAL_ID));
  }

  function handleFiscalCloneConfirmModalAction(event) {
    if (isTargetNfeRoute()) {
      FISCAL_CLONE_CONFIRM_PENDING = null;
      closeFiscalCloneConfirmModal();
      return;
    }

    const target = event && event.target && event.target.closest
      ? event.target.closest('[data-fiscal-clone-confirm-close], [data-fiscal-clone-confirm-only], [data-fiscal-clone-confirm-cancel-original]')
      : null;
    if (!target || !target.closest('#' + FISCAL_CLONE_CONFIRM_MODAL_ID)) return;

    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();

    const targetText = normalizeText(target.innerText || target.textContent || '');

    if (target.hasAttribute('data-fiscal-clone-confirm-only')) {
      const pending = FISCAL_CLONE_CONFIRM_PENDING;
      FISCAL_CLONE_CONFIRM_PENDING = null;
      closeFiscalCloneConfirmModal();
      runPendingNativeClone(pending);
      return;
    }

    if (target.hasAttribute('data-fiscal-clone-confirm-cancel-original') || targetText.indexOf('abrir cancelamento') !== -1) {
      const pending = FISCAL_CLONE_CONFIRM_PENDING;
      setFiscalCloneConfirmActionState({ busy: true, yesLabel: 'Aguarde...' });
      if (pending && isTargetDavCloneBlockRoute()) {
        if (startFiscalCloneDavCancelFlow(pending)) {
          FISCAL_CLONE_CONFIRM_PENDING = null;
          closeFiscalCloneConfirmModal();
        }
        return;
      }
      const cancelAction = pending && (pending.cancelAction || findFiscalCancelActionNearClone(pending.trigger));
      if (isTargetNfeRoute()) {
        startFiscalCloneNfeCancelThenClone(pending, cancelAction).catch(() => {});
        return;
      }
      FISCAL_CLONE_CONFIRM_PENDING = null;
      closeFiscalCloneConfirmModal();

      const cloned = runPendingNativeClone(pending);
      if (cancelAction) {
        activateFiscalMenuAction(cancelAction, { singleClick: true });
      } else if (!cloned) {
        window.alert('Não foi possível localizar a ação Clonar para este documento.');
      } else {
        window.alert('Não foi possível localizar a ação Cancelar para este documento.');
      }
      return;
    }

    FISCAL_CLONE_CONFIRM_PENDING = null;
    closeFiscalCloneConfirmModal();
  }

  function openFiscalCloneConfirmModal(trigger) {
    ensureFiscalCloneConfirmModal();
    const modal = document.getElementById(FISCAL_CLONE_CONFIRM_MODAL_ID);
    const backdrop = document.getElementById(FISCAL_CLONE_CONFIRM_BACKDROP_ID);
    const details = document.getElementById(FISCAL_CLONE_CONFIRM_DETAILS_ID);
    if (!modal || !backdrop || !details) return;
    closeNfceCancellationReasonSourceMenus(trigger);

    const entry = getFiscalCloneConfirmEntry(trigger);
    const routeLabel = isTargetDavCloneBlockRoute()
      ? 'Pedido de venda'
      : (isTargetNfceListRoute() ? 'NFC-e' : 'NF-e');
    FISCAL_CLONE_CONFIRM_PENDING = {
      trigger,
      cancelAction: findFiscalCancelActionNearClone(trigger),
      entry,
      at: Date.now()
    };

    if (isTargetDavCloneBlockRoute()) {
      FISCAL_CLONE_CONFIRM_PENDING.davFlow = buildFiscalCloneDavFlow(FISCAL_CLONE_CONFIRM_PENDING);
      renderFiscalCloneDavDetails(entry, FISCAL_CLONE_CONFIRM_PENDING.davFlow, null, 'Localizando cupom com o mesmo valor...');
      setFiscalCloneConfirmActionState({ disabled: true, yesLabel: 'Sim' });
      startFiscalCloneDavLookup(FISCAL_CLONE_CONFIRM_PENDING);
    } else {
      details.innerHTML = [
        '<div><strong>' + escapeHtml(routeLabel) + ':</strong> ' + escapeHtml(entry.documentNumber || '-') + (entry.seriesText ? ' <span style="opacity:.72;">Série ' + escapeHtml(entry.seriesText) + '</span>' : '') + '</div>',
        entry.customerName ? '<div><strong>Cliente:</strong> ' + escapeHtml(entry.customerName) + '</div>' : ''
      ].filter(Boolean).join('');
      setFiscalCloneConfirmActionState({
        disabled: false,
        yesLabel: isTargetNfeRoute() ? 'Clonar e cancelar original' : 'Sim'
      });
    }

    applyFiscalCloneConfirmModalTheme(modal);
    showExtensionNativeModal(modal, backdrop);
  }

  function handleFiscalCloneConfirm(event) {
    if (isTargetNfeRoute()) {
      clearNfeCloneConfirmStateIfCancelAction(event && event.target);
      return;
    }

    if (!event || !event.target || FISCAL_CLONE_CONFIRM_INTERNAL_CLICK) return;
    if (event.target.closest && event.target.closest('#' + FISCAL_CLONE_CONFIRM_MODAL_ID)) return;
    const trigger = findFiscalCloneActionTrigger(event.target);
    if (!trigger) return;
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();
    if (FISCAL_CLONE_CONFIRM_PENDING && FISCAL_CLONE_CONFIRM_PENDING.trigger === trigger && (Date.now() - FISCAL_CLONE_CONFIRM_PENDING.at) < 800) {
      return false;
    }
    openFiscalCloneConfirmModal(trigger);
    return false;
  }

  function ensureNfeCashSaleBoletoGuardBindings() {
    if (!isTargetNfeRoute() || !isFeatureEnabled('nfeCashSaleBoletoGuardEnabled')) return;

    Array.from(document.querySelectorAll(
      '.grid-toolbar.no-print .z-dropdown-menu a.dropdown-item, #menuId .dropdown-menu a.dropdown-item, #menuId a.dropdown-item, .popup .dropdown-menu a.dropdown-item'
    ))
      .filter((item) => normalizeText(extractActionMenuItemLabel(item)) === 'gerar boleto')
      .forEach((item) => {
        if (item.getAttribute(NFE_BOLETO_WARNING_BOUND_ATTR) === 'true') return;
        item.setAttribute(NFE_BOLETO_WARNING_BOUND_ATTR, 'true');
        item.addEventListener('pointerdown', handleNfeCashSaleBoletoGuard, true);
        item.addEventListener('click', handleNfeCashSaleBoletoGuard, true);
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

  function removeNfceCancellationReasonActionItems() {
    Array.from(document.querySelectorAll('#' + NFCE_CANCEL_REASON_ACTION_ID)).forEach((item) => {
      const parent = item.closest('li');
      if (parent) parent.remove();
      else item.remove();
    });
  }

  function removeNfceCancellationReasonUi() {
    removeNfceCancellationReasonActionItems();

    const modal = document.getElementById(NFCE_CANCEL_REASON_MODAL_ID);
    const backdrop = document.getElementById(NFCE_CANCEL_REASON_BACKDROP_ID);
    if (modal) modal.remove();
    if (backdrop) backdrop.remove();
    NFCE_CANCEL_REASON_RUNNING = false;
  }

  function closeNfeCashSaleBoletoWarningModal() {
    const modal = document.getElementById(NFE_BOLETO_WARNING_MODAL_ID);
    const backdrop = document.getElementById(NFE_BOLETO_WARNING_BACKDROP_ID);
    hideExtensionNativeModal(modal, backdrop);
  }

  function clearNfeCashSaleBoletoWarningState() {
    NFE_CASH_SALE_BOLETO_PENDING_ACTION = null;
    closeNfeCashSaleBoletoWarningModal();
  }

  function handleNfeCashSaleBoletoWarningModalAction(event) {
    const modal = document.getElementById(NFE_BOLETO_WARNING_MODAL_ID);
    if (!modal || getComputedStyle(modal).display === 'none') return;
    const target = event.target && event.target.closest
      ? event.target.closest('[data-nfe-boleto-warning-close], [data-nfe-boleto-warning-cancel], [data-nfe-boleto-warning-continue]')
      : null;
    if (!target) return;
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();
    if (target.hasAttribute('data-nfe-boleto-warning-continue')) {
      continueNfeCashSaleBoletoWarningAction();
      return;
    }
    clearNfeCashSaleBoletoWarningState();
  }

  function removeNfeCashSaleBoletoWarningUi() {
    NFE_CASH_SALE_BOLETO_PENDING_ACTION = null;
    const modal = document.getElementById(NFE_BOLETO_WARNING_MODAL_ID);
    const backdrop = document.getElementById(NFE_BOLETO_WARNING_BACKDROP_ID);
    if (modal) modal.remove();
    if (backdrop) backdrop.remove();
  }

  function applyNfeCashSaleBoletoWarningTheme(modal) {
    if (!modal) return;

    const theme = getExtensionOverlayTheme(modal.parentElement || document.body);
    const compact = window.innerWidth < 560;
    const dialog = modal.querySelector('[data-nfe-boleto-warning-dialog]');
    if (dialog) {
      dialog.style.maxWidth = compact ? 'calc(100vw - 16px)' : '450px';
      dialog.style.margin = compact ? '8px auto' : '';
    }

    const details = modal.querySelector('#' + NFE_BOLETO_WARNING_DETAILS_ID);
    if (details) {
      details.style.background = theme.cardBackground;
      details.style.border = theme.cardBorder;
      details.style.color = theme.cardTextColor;
      details.style.boxShadow = theme.isDark ? 'inset 0 1px 0 rgba(255,255,255,0.02)' : 'none';
    }
  }

  function continueNfeCashSaleBoletoWarningAction() {
    const pending = NFE_CASH_SALE_BOLETO_PENDING_ACTION;
    clearNfeCashSaleBoletoWarningState();
    if (!pending || !pending.trigger || !pending.trigger.isConnected) return;

    NFE_CASH_SALE_BOLETO_INTERNAL_CLICK = true;
    try {
      if (typeof pending.trigger.click === 'function') {
        pending.trigger.click();
      } else {
        clickLikeUser(pending.trigger);
      }
    } finally {
      setTimeout(() => {
        NFE_CASH_SALE_BOLETO_INTERNAL_CLICK = false;
      }, 80);
    }
  }

  function ensureNfeCashSaleBoletoWarningModal() {
    if (!document.body) return;
    ensureExtensionModalBridge();
    ensureExtensionModalBridgeListener();

    if (!NFE_CASH_SALE_BOLETO_MODAL_EVENTS_BOUND) {
      window.addEventListener('click', handleNfeCashSaleBoletoWarningModalAction, true);
      NFE_CASH_SALE_BOLETO_MODAL_EVENTS_BOUND = true;
    }

    if (!document.getElementById(NFE_BOLETO_WARNING_BACKDROP_ID)) {
      const backdrop = document.createElement('div');
      backdrop.id = NFE_BOLETO_WARNING_BACKDROP_ID;
      backdrop.className = 'modal-backdrop fade';
      backdrop.style.cssText = [
        'display:none',
        'z-index:1061'
      ].join(';');
      backdrop.addEventListener('click', clearNfeCashSaleBoletoWarningState);
      document.body.appendChild(backdrop);
    }

    if (!document.getElementById(NFE_BOLETO_WARNING_MODAL_ID)) {
      const modal = document.createElement('div');
      modal.id = NFE_BOLETO_WARNING_MODAL_ID;
      modal.className = 'modal fade';
      modal.tabIndex = -1;
      modal.setAttribute('role', 'dialog');
      modal.setAttribute('aria-modal', 'true');
      modal.setAttribute('aria-hidden', 'true');
      modal.style.cssText = [
        'display:none',
        'z-index:1065'
      ].join(';');
      modal.innerHTML = [
        '<div class="modal-dialog modal-dialog-centered mw-450px" data-nfe-boleto-warning-dialog>',
        '  <div class="modal-content">',
        '    <div class="modal-header">',
        '      <h2 data-nfe-boleto-warning-title class="fw-semibold fs-6 fw-light text-primary">NF-e de Venda à Vista</h2>',
        '      <button type="button" data-nfe-boleto-warning-close class="btn-close" aria-label="Close"></button>',
        '    </div>',
        '    <div class="modal-body pb-5" style="padding-top:8px;">',
        '      <div data-nfe-boleto-warning-message style="line-height:1.5;">Esta NF fiscal está marcada como Venda à Vista. Gerar boleto nesse caso pode ser indevido. Deseja continuar mesmo assim?</div>',
        '      <div id="' + NFE_BOLETO_WARNING_DETAILS_ID + '" class="rounded mt-3 p-4" style="display:grid;gap:6px;font-size:12px;line-height:1.45;"></div>',
        '    </div>',
        '    <div class="modal-footer pt-0">',
        '      <button type="button" data-nfe-boleto-warning-cancel class="btn btn-light btn-sm" style="font-size:13px;">Cancelar</button>',
        '      <button type="button" data-nfe-boleto-warning-continue class="btn btn-primary btn-sm" style="font-size:13px;">Continuar</button>',
        '    </div>',
        '  </div>',
        '</div>'
      ].join('');

      document.body.appendChild(modal);
    }

    applyNfeCashSaleBoletoWarningTheme(document.getElementById(NFE_BOLETO_WARNING_MODAL_ID));
  }

  function openNfeCashSaleBoletoWarning(trigger, entries) {
    if (!trigger || !entries || !entries.length) return;

    ensureNfeCashSaleBoletoWarningModal();
    const modal = document.getElementById(NFE_BOLETO_WARNING_MODAL_ID);
    const backdrop = document.getElementById(NFE_BOLETO_WARNING_BACKDROP_ID);
    const details = document.getElementById(NFE_BOLETO_WARNING_DETAILS_ID);
    const message = modal && modal.querySelector('[data-nfe-boleto-warning-message]');
    if (!modal || !backdrop || !details || !message) return;

    NFE_CASH_SALE_BOLETO_PENDING_ACTION = {
      trigger,
      entries: entries.slice()
    };

    message.textContent = entries.length === 1
      ? 'Esta NF fiscal está marcada como Venda à Vista. Gerar boleto nesse caso pode ser indevido. Deseja continuar mesmo assim?'
      : 'As NF-es selecionadas incluem notas marcadas como Venda à Vista. Gerar boleto nesse caso pode ser indevido. Deseja continuar mesmo assim?';

    details.innerHTML = entries.slice(0, 6).map((entry) => {
      const parts = [
        '<div><strong>NF-e:</strong> ' + escapeHtml(entry.documentNumber || '-'),
        entry.customerName ? ' <span style="opacity:0.78;">| ' + escapeHtml(entry.customerName) + '</span>' : '',
        '</div>',
        '<div style="opacity:0.84;"><strong>Natureza:</strong> ' + escapeHtml(entry.natureText || '-') + '</div>'
      ];
      return '<div style="display:grid;gap:4px;">' + parts.join('') + '</div>';
    }).join('');

    if (entries.length > 6) {
      details.insertAdjacentHTML('beforeend', '<div style="opacity:0.78;">+' + escapeHtml(String(entries.length - 6)) + ' NF-e(s) adicionais.</div>');
    }

    applyNfeCashSaleBoletoWarningTheme(modal);
    showExtensionNativeModal(modal, backdrop);
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

  function showExtensionNativeModal(modal, backdrop) {
    if (!modal || !backdrop) return;
    if (modal.__zwebHideTimer) window.clearTimeout(modal.__zwebHideTimer);
    modal.__zwebHideTimer = 0;
    // O ZWeb pode elevar seus formularios; o aviso precisa ficar acima deles.
    let topLayer = 1060;
    document.querySelectorAll('.modal, .modal-backdrop, [role="dialog"]').forEach(element => {
      if (element === modal || element === backdrop) return;
      const style = getComputedStyle(element);
      if (style.display === 'none' || style.visibility === 'hidden') return;
      const layer = Number.parseInt(style.zIndex, 10);
      if (Number.isFinite(layer)) topLayer = Math.max(topLayer, layer);
    });
    const backdropLayer = Math.min(topLayer + 1, 2147483646);
    backdrop.style.setProperty('z-index', String(backdropLayer), 'important');
    modal.style.setProperty('z-index', String(backdropLayer + 1), 'important');
    modal.style.display = 'block';
    backdrop.style.display = 'block';
    modal.setAttribute('aria-hidden', 'false');
    void modal.offsetWidth;
    modal.classList.add('show');
    backdrop.classList.add('show');
  }

  function hideExtensionNativeModal(modal, backdrop) {
    if (!modal && !backdrop) return;
    if (modal) {
      modal.classList.remove('show');
      modal.setAttribute('aria-hidden', 'true');
    }
    if (backdrop) backdrop.classList.remove('show');
    const timerHost = modal || backdrop;
    if (timerHost.__zwebHideTimer) window.clearTimeout(timerHost.__zwebHideTimer);
    timerHost.__zwebHideTimer = window.setTimeout(() => {
      timerHost.__zwebHideTimer = 0;
      if (modal) modal.style.display = 'none';
      if (backdrop) backdrop.style.display = 'none';
    }, EXTENSION_DIALOG_TRANSITION_MS);
  }

  function closeCommissionReportConfirmModal() {
    const modal = document.getElementById(COMMISSION_REPORT_CONFIRM_MODAL_ID);
    const backdrop = document.getElementById(COMMISSION_REPORT_CONFIRM_BACKDROP_ID);
    hideExtensionNativeModal(modal, backdrop);
  }

  function clearCommissionReportConfirmState() {
    COMMISSION_REPORT_PENDING_GENERATE_BUTTON = null;
    closeCommissionReportConfirmModal();
  }

  function setCommissionReportConfirmUiState(options) {
    const modal = document.getElementById(COMMISSION_REPORT_CONFIRM_MODAL_ID);
    if (!modal) return;
    const opts = options && typeof options === 'object' ? options : {};
    const message = modal.querySelector('[data-commission-confirm-message]');
    const noButton = modal.querySelector('[data-commission-confirm-no]');
    const yesButton = modal.querySelector('[data-commission-confirm-yes]');
    const closeButton = modal.querySelector('[data-commission-confirm-close]');
    if (message && typeof opts.message === 'string') {
      message.textContent = opts.message;
    }
    [noButton, yesButton, closeButton].forEach((button) => {
      if (!button) return;
      if (opts.busy) {
        button.setAttribute('disabled', 'true');
        button.setAttribute('aria-disabled', 'true');
      } else {
        button.removeAttribute('disabled');
        button.removeAttribute('aria-disabled');
      }
    });
    if (yesButton) {
      yesButton.textContent = opts.busy ? 'Conferindo...' : 'Sim';
    }
  }

  function triggerCommissionReportGenerate(pendingButton) {
    if (!pendingButton || !pendingButton.isConnected) return;
    COMMISSION_REPORT_INTERNAL_GENERATE_CLICK = true;
    try {
      if (typeof pendingButton.click === 'function') {
        pendingButton.click();
      } else {
        clickLikeUser(pendingButton);
      }
    } finally {
      setTimeout(() => {
        COMMISSION_REPORT_INTERNAL_GENERATE_CLICK = false;
      }, 80);
    }
  }

  async function handleCommissionReportConfirmYes() {
    const pendingButton = COMMISSION_REPORT_PENDING_GENERATE_BUTTON;
    if (!pendingButton || !pendingButton.isConnected) {
      clearCommissionReportConfirmState();
      return;
    }

    setCommissionReportConfirmUiState({
      busy: true,
      message: 'Conferindo devoluções de NF-e antes de gerar o relatório...'
    });

    try {
      await refreshNfeReturnHistoryForCommissionReport();
    } catch (error) {
      setCommissionReportConfirmUiState({
        busy: false,
        message: 'Não consegui atualizar as devoluções agora. Abra Fiscal > NF-e e tente gerar novamente para evitar relatório com histórico antigo.'
      });
      return;
    }

    clearCommissionReportConfirmState();
    triggerCommissionReportGenerate(pendingButton);
  }

  function handleCommissionReportConfirmModalAction(event) {
    const modal = document.getElementById(COMMISSION_REPORT_CONFIRM_MODAL_ID);
    if (!modal || getComputedStyle(modal).display === 'none') return;
    const target = event.target && event.target.closest
      ? event.target.closest('[data-commission-confirm-close], [data-commission-confirm-no], [data-commission-confirm-yes]')
      : null;
    if (!target) return;
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();
    if (target.hasAttribute('data-commission-confirm-yes')) {
      handleCommissionReportConfirmYes();
      return;
    }
    if (target.hasAttribute('data-commission-confirm-no')) {
      clearCommissionReportConfirmState();
      window.location.hash = '#/fiscal/nfe';
      return;
    }
    clearCommissionReportConfirmState();
  }

  function removeCommissionReportConfirmUi() {
    COMMISSION_REPORT_PENDING_GENERATE_BUTTON = null;
    const modal = document.getElementById(COMMISSION_REPORT_CONFIRM_MODAL_ID);
    const backdrop = document.getElementById(COMMISSION_REPORT_CONFIRM_BACKDROP_ID);
    if (modal) modal.remove();
    if (backdrop) backdrop.remove();
  }

  function applyCommissionReportConfirmTheme(modal) {
    if (!modal) return;

    const compact = window.innerWidth < 560;
    const dialog = modal.querySelector('[data-commission-confirm-dialog]');
    if (dialog) {
      dialog.style.maxWidth = compact ? 'calc(100vw - 16px)' : '450px';
      dialog.style.margin = compact ? '8px auto' : '';
    }
  }

  function ensureCommissionReportConfirmModal() {
    if (!document.body) return;
    ensureExtensionModalBridge();
    ensureExtensionModalBridgeListener();

    if (!COMMISSION_REPORT_CONFIRM_MODAL_EVENTS_BOUND) {
      window.addEventListener('click', handleCommissionReportConfirmModalAction, true);
      COMMISSION_REPORT_CONFIRM_MODAL_EVENTS_BOUND = true;
    }

    if (!document.getElementById(COMMISSION_REPORT_CONFIRM_BACKDROP_ID)) {
      const backdrop = document.createElement('div');
      backdrop.id = COMMISSION_REPORT_CONFIRM_BACKDROP_ID;
      backdrop.className = 'modal-backdrop fade';
      backdrop.style.cssText = [
        'display:none',
        'z-index:1061'
      ].join(';');
      backdrop.addEventListener('click', clearCommissionReportConfirmState);
      document.body.appendChild(backdrop);
    }

    if (!document.getElementById(COMMISSION_REPORT_CONFIRM_MODAL_ID)) {
      const modal = document.createElement('div');
      modal.id = COMMISSION_REPORT_CONFIRM_MODAL_ID;
      modal.className = 'modal fade';
      modal.tabIndex = -1;
      modal.setAttribute('role', 'dialog');
      modal.setAttribute('aria-modal', 'true');
      modal.setAttribute('aria-hidden', 'true');
      modal.style.cssText = [
        'display:none',
        'z-index:1065'
      ].join(';');
      modal.innerHTML = [
        '<div class="modal-dialog modal-dialog-centered mw-450px" data-commission-confirm-dialog>',
        '  <div class="modal-content">',
        '    <div class="modal-header">',
        '      <h2 data-commission-confirm-title class="fw-semibold fs-6 fw-light text-primary">Conferência de Devoluções</h2>',
        '      <button type="button" data-commission-confirm-close class="btn-close" aria-label="Close"></button>',
        '    </div>',
        '    <div class="modal-body pb-5" style="padding-top:8px;">',
        '      <div data-commission-confirm-message style="line-height:1.5;">Já checou as devoluções antes?</div>',
        '    </div>',
        '    <div class="modal-footer pt-0">',
        '      <button type="button" data-commission-confirm-no class="btn btn-light btn-sm" style="font-size:13px;">Não</button>',
        '      <button type="button" data-commission-confirm-yes class="btn btn-primary btn-sm" style="font-size:13px;">Sim</button>',
        '    </div>',
        '  </div>',
        '</div>'
      ].join('');

      document.body.appendChild(modal);
    }

    applyCommissionReportConfirmTheme(document.getElementById(COMMISSION_REPORT_CONFIRM_MODAL_ID));
  }

  function openCommissionReportConfirmModal(generateButton) {
    if (!generateButton) return;
    ensureCommissionReportConfirmModal();
    COMMISSION_REPORT_PENDING_GENERATE_BUTTON = generateButton;
    const modal = document.getElementById(COMMISSION_REPORT_CONFIRM_MODAL_ID);
    const backdrop = document.getElementById(COMMISSION_REPORT_CONFIRM_BACKDROP_ID);
    if (!modal || !backdrop) return;
    applyCommissionReportConfirmTheme(modal);
    showExtensionNativeModal(modal, backdrop);
  }

  function bindCommissionReportGenerateButton(modal) {
    if (!modal || !isFeatureEnabled('commissionReturnCheckPromptEnabled')) return;
    const generateButton = Array.from(modal.querySelectorAll('button'))
      .find((button) => normalizeText(button.innerText || button.textContent || '').indexOf('gerar relatorio') !== -1);
    if (!generateButton) return;
    if (generateButton.getAttribute(COMMISSION_REPORT_GENERATE_BOUND_ATTR) === 'true') return;

    generateButton.setAttribute(COMMISSION_REPORT_GENERATE_BOUND_ATTR, 'true');
    const guard = (event) => {
      if (!isFeatureEnabled('commissionReturnCheckPromptEnabled')) return;
      if (COMMISSION_REPORT_INTERNAL_GENERATE_CLICK) return;
      event.preventDefault();
      event.stopImmediatePropagation();
      event.stopPropagation();
      openCommissionReportConfirmModal(generateButton);
    };
    generateButton.addEventListener('pointerdown', guard, true);
    generateButton.addEventListener('click', guard, true);
  }

  function syncCommissionReportModal() {
    const modal = findVisibleCommissionReportModal();
    const existingHint = document.getElementById(COMMISSION_REPORT_HINT_ID);
    const hintEnabled = isFeatureEnabled('commissionReturnsEnabled');
    const promptEnabled = isFeatureEnabled('commissionReturnCheckPromptEnabled');

    if (!hintEnabled && !promptEnabled) {
      if (existingHint) existingHint.remove();
      removeCommissionReportConfirmUi();
      return;
    }

    if (!modal) {
      if (existingHint) existingHint.remove();
      removeCommissionReportConfirmUi();
      return;
    }

    const htmlInput = modal.querySelector('input[type="radio"][value="HTML"]');
    if (hintEnabled && htmlInput && !modal.hasAttribute('data-zweb-commission-format-initialized')) {
      modal.setAttribute('data-zweb-commission-format-initialized', 'true');
      if (!htmlInput.checked) {
        htmlInput.click();
      }
    }

    const actionsContainer = modal.querySelector('.modal-footer, .d-flex.justify-content-end, .text-end') || modal;
    let hint = document.getElementById(COMMISSION_REPORT_HINT_ID);
    if (hintEnabled) {
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
    } else if (hint) {
      hint.remove();
    }

    if (promptEnabled) {
      bindCommissionReportGenerateButton(modal);
    } else {
      removeCommissionReportConfirmUi();
    }
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
    resetProductAdminGuardState();
    syncProductAdminGuardInputs();
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
    const meta = historyMap && historyMap[NFE_RETURN_HISTORY_META_KEY] && typeof historyMap[NFE_RETURN_HISTORY_META_KEY] === 'object'
      ? historyMap[NFE_RETURN_HISTORY_META_KEY]
      : null;
    const entries = Object.values(historyMap || {})
      .filter(Boolean)
      .filter((entry) => entry && entry.documentNumber)
      .sort((a, b) => Number(b && b.capturedAt || 0) - Number(a && a.capturedAt || 0))
      .slice(0, NFE_RETURN_HISTORY_MAX_ITEMS);
    const trimmed = entries.reduce((acc, entry) => {
      if (!entry || !entry.documentNumber) return acc;
      acc[entry.documentNumber] = entry;
      return acc;
    }, {});
    if (meta) trimmed[NFE_RETURN_HISTORY_META_KEY] = meta;
    return trimmed;
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

        const documentNumber = normalizeApiDocumentNumber(documentCell.textContent || '');
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

  function getNestedValue(root, paths) {
    if (!root || typeof root !== 'object') return null;
    for (let index = 0; index < paths.length; index += 1) {
      const parts = String(paths[index] || '').split('.');
      let current = root;
      for (let partIndex = 0; partIndex < parts.length; partIndex += 1) {
        if (current == null || typeof current !== 'object') {
          current = null;
          break;
        }
        current = current[parts[partIndex]];
      }
      if (current != null && current !== '') return current;
    }
    return null;
  }

  function getApiDisplayText(value) {
    if (value == null) return '';
    if (typeof value === 'string' || typeof value === 'number') return String(value).trim();
    if (typeof value !== 'object') return '';
    const candidate = getNestedValue(value, ['description', 'descricao', 'name', 'nome', 'businessName', 'fantasyName']);
    return candidate == null ? '' : String(candidate).trim();
  }

  function getNfeApiRows(payload) {
    if (Array.isArray(payload)) return payload;
    if (!payload || typeof payload !== 'object') return [];
    const candidates = [
      payload.data,
      payload.result,
      payload.items,
      payload.content,
      payload.data && payload.data.data,
      payload.data && payload.data.items,
      payload.result && payload.result.data,
      payload.result && payload.result.items
    ];
    for (let index = 0; index < candidates.length; index += 1) {
      if (Array.isArray(candidates[index])) return candidates[index];
    }
    return [];
  }

  function normalizeApiDocumentNumber(value) {
    const digits = String(value == null ? '' : value).replace(/\D+/g, '');
    if (!digits) return '';
    return digits.replace(/^0+(?=\d)/, '');
  }

  function getNfeApiStatusNumber(item) {
    const value = getNestedValue(item, ['status', 'dados.status', 'situacaoCodigo', 'statusCode']);
    const number = typeof value === 'number' ? value : Number(value);
    return Number.isFinite(number) ? number : null;
  }

  function collectApiNfeReturnEntries(payload) {
    return getNfeApiRows(payload)
      .map((item) => {
        if (!item || typeof item !== 'object') return null;

        const documentNumber = normalizeApiDocumentNumber(getNestedValue(item, [
          'numero',
          'number',
          'documentNumber',
          'sequence',
          'dados.numero',
          'dados.number',
          'dados.nNF',
          'nNF'
        ]));
        if (!documentNumber) return null;

        const nature = getApiDisplayText(getNestedValue(item, [
          'naturezaOperacao',
          'natureOperation',
          'operationNature',
          'natureza',
          'nature',
          'dados.naturezaOperacao',
          'dados.natureOperation',
          'dados.operationNature',
          'dados.natureza'
        ]));
        if (!nature || !isNfeReturnNature(nature)) return null;

        const statusText = getApiDisplayText(getNestedValue(item, [
          'statusText',
          'statusLabel',
          'situacao',
          'status',
          'dados.statusText',
          'dados.statusLabel',
          'dados.situacao',
          'dados.status'
        ]));
        const statusNumber = getNfeApiStatusNumber(item);
        const inactiveByNumber = statusNumber === 3 || statusNumber === 4 || statusNumber === 5;
        const totalValue = getNestedValue(item, [
          'total',
          'price',
          'valorTotal',
          'dados.total',
          'dados.price',
          'dados.valorTotal',
          'dados.totalNfe'
        ]);
        const total = typeof totalValue === 'number' ? totalValue : parseProductGridNumber(totalValue);

        return {
          documentNumber,
          customer: getApiDisplayText(getNestedValue(item, [
            'customer',
            'client',
            'buyer',
            'destinatario',
            'dados.customer',
            'dados.client',
            'dados.buyer',
            'dados.destinatario'
          ])),
          nature,
          issueDate: String(getNestedValue(item, [
            'emissao',
            'issueDate',
            'emissionDate',
            'dataEmissao',
            'dados.emissao',
            'dados.issueDate',
            'dados.emissionDate',
            'dados.dataEmissao'
          ]) || '').trim(),
          status: statusText,
          total: Number.isFinite(total) ? total : null,
          active: !inactiveByNumber && !isInactiveNfeStatus(statusText),
          capturedAt: Date.now(),
          source: 'api'
        };
      })
      .filter(Boolean);
  }

  function getNfeReturnHistoryMeta(historyMap) {
    return historyMap && historyMap[NFE_RETURN_HISTORY_META_KEY] && typeof historyMap[NFE_RETURN_HISTORY_META_KEY] === 'object'
      ? historyMap[NFE_RETURN_HISTORY_META_KEY]
      : null;
  }

  function buildNfeReturnHistoryMeta(entries, sourceLabel) {
    return {
      version: 2,
      updatedAt: Date.now(),
      source: String(sourceLabel || 'dom'),
      count: Array.isArray(entries) ? entries.length : 0
    };
  }

  function persistNfeReturnEntries(entries, sourceLabel, options) {
    const safeEntries = Array.isArray(entries) ? entries : [];
    const opts = options && typeof options === 'object' ? options : {};
    const signature = String(sourceLabel || 'dom') + ':' + JSON.stringify(safeEntries.map((entry) => [
      entry.documentNumber,
      entry.customer,
      entry.nature,
      entry.issueDate,
      entry.status,
      entry.total,
      entry.active
    ]));
    if (!safeEntries.length && !opts.forceMeta) return Promise.resolve(false);
    if (signature === LAST_NFE_RETURN_SIGNATURE && !opts.forceMeta) return Promise.resolve(false);
    LAST_NFE_RETURN_SIGNATURE = signature;

    const persistNow = () => new Promise((resolve) => {
      NFE_RETURN_SYNC_TIMER = 0;
      const nextHistory = opts.replace ? {} : Object.assign({}, NFE_RETURN_HISTORY);
      let changed = false;

      safeEntries.forEach((entry) => {
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

      const previousMeta = getNfeReturnHistoryMeta(nextHistory);
      const nextMeta = buildNfeReturnHistoryMeta(safeEntries, sourceLabel);
      if (opts.forceMeta || JSON.stringify(previousMeta || null) !== JSON.stringify(nextMeta)) {
        nextHistory[NFE_RETURN_HISTORY_META_KEY] = nextMeta;
        changed = true;
      }

      if (!changed) {
        resolve(false);
        return;
      }
      NFE_RETURN_HISTORY = trimNfeReturnHistory(nextHistory);
      try {
        chrome.storage.local.set({ [NFE_RETURN_HISTORY_STORAGE_KEY]: NFE_RETURN_HISTORY }, () => resolve(true));
      } catch (error) {
        resolve(false);
      }
    });

    if (NFE_RETURN_SYNC_TIMER) clearTimeout(NFE_RETURN_SYNC_TIMER);
    if (opts.immediate) {
      return persistNow();
    }

    NFE_RETURN_SYNC_TIMER = setTimeout(() => {
      persistNow();
    }, 250);
    return Promise.resolve(true);
  }

  function handleNfeListApiResponsePayload(payload) {
    if (!isFeatureEnabled('commissionReturnsEnabled') || !isTargetNfeRoute()) return;
    persistNfeReturnEntries(collectApiNfeReturnEntries(payload), 'api');
  }

  async function getSharedNfeReturnHistory() {
    try {
      const reply = await sendRuntimeMessage({ type: 'zweb-internal-commission-returns-get' });
      const payload = reply && reply.ok ? reply.payload : null;
      if (!payload || !Array.isArray(payload.entries) || !Number(payload.updatedAt)) return null;
      return payload;
    } catch (error) {
      return null;
    }
  }

  function publishSharedNfeReturnHistory(entries) {
    sendRuntimeMessage({
      type: 'zweb-internal-commission-returns-put',
      entries
    }).catch(() => {});
  }

  async function refreshNfeReturnHistoryForCommissionReport(options) {
    if (!isFeatureEnabled('commissionReturnsEnabled')) return [];

    const force = !!(options && options.force);
    const nowAt = Date.now();
    if (nowAt < NFE_RETURN_HISTORY_NEXT_RETRY_AT) {
      throw new Error('A atualização de devoluções está em espera após uma falha.');
    }
    if (!force && NFE_RETURN_HISTORY_REFRESHED_AT > 0
      && nowAt - NFE_RETURN_HISTORY_REFRESHED_AT < NFE_RETURN_HISTORY_REFRESH_TTL_MS) {
      return Object.values(NFE_RETURN_HISTORY).filter((entry) => entry && entry.documentNumber);
    }
    if (NFE_RETURN_HISTORY_REFRESH_PROMISE) return NFE_RETURN_HISTORY_REFRESH_PROMISE;

    NFE_RETURN_HISTORY_REFRESH_PROMISE = (async () => {
      const sharedHistory = await getSharedNfeReturnHistory();
      if (sharedHistory && Date.now() - Number(sharedHistory.updatedAt) < NFE_RETURN_HISTORY_REFRESH_TTL_MS) {
        const sharedEntries = sharedHistory.entries;
        await persistNfeReturnEntries(sharedEntries, 'commission-report-shared', {
          immediate: true,
          forceMeta: true,
          replace: true
        });
        NFE_RETURN_HISTORY_REFRESHED_AT = Number(sharedHistory.updatedAt);
        return sharedEntries;
      }

      const byDocument = {};
      for (let page = 1; page <= NFE_RETURN_HISTORY_API_MAX_PAGES; page += 1) {
        if (page > 1) await delay(FISCAL_READ_MIN_INTERVAL_MS);
        const payload = await postZwebJson(FISCAL_GET_NFE_PAGINATE_API_URL, {
          modelos: ['55'],
          siniefN12: true,
          page,
          maxResults: NFE_RETURN_HISTORY_API_PAGE_SIZE,
          sort: { key: 'emission', order: 'DESC' }
        }, 'commissionReturnsRefresh');
        const rows = getNfeApiRows(payload);
        collectApiNfeReturnEntries(payload).forEach((entry) => {
          if (entry && entry.documentNumber) byDocument[entry.documentNumber] = entry;
        });
        if (rows.length < NFE_RETURN_HISTORY_API_PAGE_SIZE) break;
      }

      const entries = Object.values(byDocument);
      await persistNfeReturnEntries(entries, 'commission-report-api', {
        immediate: true,
        forceMeta: true,
        replace: true
      });
      publishSharedNfeReturnHistory(entries);
      NFE_RETURN_HISTORY_REFRESHED_AT = Date.now();
      return entries;
    })();

    try {
      return await NFE_RETURN_HISTORY_REFRESH_PROMISE;
    } catch (error) {
      NFE_RETURN_HISTORY_NEXT_RETRY_AT = Date.now() + NFE_RETURN_HISTORY_RETRY_DELAY_MS;
      throw error;
    } finally {
      NFE_RETURN_HISTORY_REFRESH_PROMISE = null;
    }
  }

  function syncNfeReturnHistory() {
    if (!isFeatureEnabled('commissionReturnsEnabled') || !isTargetNfeRoute()) return;

    persistNfeReturnEntries(collectVisibleNfeReturnEntries(), 'dom');
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

  function scheduleProductLowStockHighlightRefresh() {
    if (!isTargetProductRoute() || !isFeatureEnabled('lowStockHighlightEnabled')) return;

    [0, 180, 700, 1400].forEach((delay) => {
      window.setTimeout(() => {
        if (!isTargetProductRoute() || !isFeatureEnabled('lowStockHighlightEnabled')) return;
        syncProductLowStockHighlight();
      }, delay);
    });
  }

  function handleProductLowStockRefreshTrigger(event) {
    if (!event || !event.target) return;
    if (!isTargetProductRoute() || !isFeatureEnabled('lowStockHighlightEnabled')) return;

    const target = event.target;
    const insideProductForm = !!(target.closest && target.closest('#registerProductForm, form'));
    const insideProductGrid = !!(target.closest && target.closest('.table-row, .table-wrapper, table'));
    if (!insideProductForm && !insideProductGrid) return;

    scheduleProductLowStockHighlightRefresh();
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
    if (BATCH_RUNNING) return;
    if (Date.now() < DAV_BATCH_NEXT_ALLOWED_AT) {
      updateBatchStatus('Lote em espera apos falha. Tente novamente mais tarde.');
      return;
    }
    codes = Array.from(new Set(codes.map(code => String(code || '').trim().replace(/^#/, '')).filter(Boolean)));
    if (codes.length > 50) { updateBatchStatus('Limite de 50 codigos por lote.'); return; }
    if (!codes.length) return;
    const quantity = parseDavIntegerQuantity(quantityRaw);
    if (!quantity) {
      updateBatchStatus('Informe uma quantidade valida maior que zero.');
      return;
    }

    BATCH_RUNNING = true;
    let ok = 0;
    const failed = [];
    let apiValidatedCodes = codes.slice();
    updateProgressBar(0, 'Iniciando lote...');

    if (!apiValidatedCodes.length) {
      updateBatchStatus('Nenhum codigo valido para processar.');
      updateProgressBar(100, 'Nenhum codigo valido');
      BATCH_RUNNING = false;
      return;
    }

    for (let i = 0; i < apiValidatedCodes.length; i++) {
      const code = apiValidatedCodes[i];
      updateBatchStatus('Processando ' + (i + 1) + '/' + apiValidatedCodes.length + ': ' + code);
      updateProgressBar(Math.round((i / apiValidatedCodes.length) * 100), 'Processando ' + code + '...');
      try {
        if (i > 0) await delay(DAV_BATCH_MIN_INTERVAL_MS);
        await addSingleItemInBatch(code, quantityRaw, quantity);
        ok++;
      } catch (err) {
        failed.push(code + ' (' + (err && err.message ? err.message : 'erro') + ')');
        DAV_BATCH_NEXT_ALLOWED_AT = Date.now() + DAV_BATCH_COOLDOWN_MS;
        break;
      }
    }

    if (!failed.length) {
      updateBatchStatus('Concluido: ' + ok + ' itens adicionados.');
      updateProgressBar(100, 'Concluido: ' + ok + ' itens');
    } else {
      updateBatchStatus('Lote interrompido. OK: ' + ok + ', Falhas: ' + failed.length + ', Pendentes: ' + Math.max(0, apiValidatedCodes.length - ok - failed.length) + '.');
      console.warn('Falhas lote:', { at: new Date().toISOString(), completed: ok, failed, pending: Math.max(0, apiValidatedCodes.length - ok - failed.length), nextAttemptAt: new Date(DAV_BATCH_NEXT_ALLOWED_AT).toISOString() });
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

  function getProductCloneButtons() {
    if (!isTargetProductEditRoute()) return [];
    return Array.from(document.querySelectorAll('button'))
      .filter((button) => normalizeText(button.innerText || button.textContent || '') === 'clonar');
  }

  function isProductCloneButtonElement(target) {
    if (!isTargetProductEditRoute() || !target || !target.closest) return false;
    const button = target.closest('button');
    if (!button) return false;
    return normalizeText(button.innerText || button.textContent || '') === 'clonar';
  }

  function restoreProductCloneButtons() {
    Array.from(document.querySelectorAll('button[' + PRODUCT_CLONE_BLOCK_ATTR + '="true"]')).forEach((button) => {
      const wasDisabled = button.getAttribute('data-zweb-product-clone-original-disabled') === 'true';
      const originalTitle = button.getAttribute('data-zweb-product-clone-original-title');
      const originalPointerEvents = button.getAttribute('data-zweb-product-clone-original-pointer-events');
      const originalOpacity = button.getAttribute('data-zweb-product-clone-original-opacity');

      if (wasDisabled) {
        button.setAttribute('disabled', 'true');
      } else {
        button.removeAttribute('disabled');
      }

      if (originalTitle) {
        button.setAttribute('title', originalTitle);
      } else {
        button.removeAttribute('title');
      }

      button.style.pointerEvents = originalPointerEvents || '';
      button.style.opacity = originalOpacity || '';
      button.removeAttribute(PRODUCT_CLONE_BLOCK_ATTR);
      button.removeAttribute('data-zweb-product-clone-original-disabled');
      button.removeAttribute('data-zweb-product-clone-original-title');
      button.removeAttribute('data-zweb-product-clone-original-pointer-events');
      button.removeAttribute('data-zweb-product-clone-original-opacity');
    });
  }

  function syncProductCloneProtection() {
    if (!isTargetProductEditRoute()) {
      restoreProductCloneButtons();
      return;
    }

    if (!isFeatureEnabled('productCloneProtectionEnabled')) {
      restoreProductCloneButtons();
      return;
    }

    getProductCloneButtons().forEach((button) => {
      if (button.getAttribute(PRODUCT_CLONE_BLOCK_ATTR) === 'true') return;
      button.setAttribute(PRODUCT_CLONE_BLOCK_ATTR, 'true');
      button.setAttribute('data-zweb-product-clone-original-disabled', button.hasAttribute('disabled') ? 'true' : 'false');
      button.setAttribute('data-zweb-product-clone-original-title', button.getAttribute('title') || '');
      button.setAttribute('data-zweb-product-clone-original-pointer-events', button.style.pointerEvents || '');
      button.setAttribute('data-zweb-product-clone-original-opacity', button.style.opacity || '');
      button.setAttribute('disabled', 'true');
      button.style.pointerEvents = 'none';
      button.style.opacity = '0.6';
      button.title = 'Botao bloqueado pelo usuario';
    });
  }

  function hideElement(el) {
    if (!el || el.__blockedByExt) return;
    el.__blockedByExt = true;
    el.style.display = 'none';
  }

  function markBlocked(el) {
    try {
      if (isTargetPdvRoute()) return;
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
    if (isTargetPdvRoute()) return;

    const menuCandidates = Array.from(document.querySelectorAll('li, a, button, span, div'));
    menuCandidates.forEach(el => {
      const txt = normalizeText(el.innerText || '');
      if (!txt) return;
      if (!getBlockedDropdownNavigationScope(el)) return;

      const shouldHide = BLOCK_DROPDOWN_OPTIONS.some(opt => txt === opt);
      if (!shouldHide) return;
      if (shouldPreserveBlockedDropdownOption(txt, el)) return;

      const itemContainer = el.closest('li, .dropdown-item, .has-submenu, .menu-item') || el;
      hideElement(itemContainer);
    });
  }

  // Block only in Cadastros > Estoque by stable href selector.
  function hideCadastrosUnitOption() {
    if (!isFeatureEnabled('enabled') || isDocumentRoute()) return;
    if (isTargetPdvRoute()) return;

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

  function syncClientIdentificationUnlock() {
    if (!isTargetClientEditRoute()) return;

    const input = document.getElementById('content.identification');
    if (!input) return;

    syncClientIdentificationOriginalValue(input);

    input.disabled = false;
    input.readOnly = false;
    input.removeAttribute('disabled');
    input.removeAttribute('readonly');
    input.style.pointerEvents = '';
    input.style.opacity = '';
    input.style.cursor = '';
    if (input.title === 'Campo bloqueado pelo usuario') {
      input.title = '';
    }
  }

  function normalizeClientIdentificationForCompare(value) {
    return String(value || '').replace(/\D+/g, '');
  }

  function getClientIdentificationRouteKey() {
    const href = String(location.href || '');
    const match = href.match(/\/register\/client\/edit\/[^/?#]+/i);
    return match ? match[0].toLowerCase() : href.toLowerCase();
  }

  function syncClientIdentificationOriginalValue(input) {
    if (!input) return '';

    const routeKey = getClientIdentificationRouteKey();
    if (input.getAttribute(CLIENT_IDENTIFICATION_ROUTE_ATTR) !== routeKey) {
      input.setAttribute(CLIENT_IDENTIFICATION_ROUTE_ATTR, routeKey);
      input.removeAttribute(CLIENT_IDENTIFICATION_ORIGINAL_ATTR);
      input.removeAttribute(CLIENT_IDENTIFICATION_DIRTY_ATTR);
    }

    const currentValue = normalizeClientIdentificationForCompare(input.value || '');
    if (currentValue && !input.hasAttribute(CLIENT_IDENTIFICATION_ORIGINAL_ATTR)) {
      input.setAttribute(CLIENT_IDENTIFICATION_ORIGINAL_ATTR, currentValue);
    }

    return input.getAttribute(CLIENT_IDENTIFICATION_ORIGINAL_ATTR) || '';
  }

  function isClientIdentificationChanged(input) {
    if (!input) return false;
    const originalValue = syncClientIdentificationOriginalValue(input);
    const currentValue = normalizeClientIdentificationForCompare(input.value || '');
    return !!(input.getAttribute(CLIENT_IDENTIFICATION_DIRTY_ATTR) === 'true' || (originalValue && currentValue !== originalValue));
  }

  function trackClientIdentificationEdit(event) {
    if (!event || !event.target || !isTargetClientEditRoute()) return;

    const input = event.target && event.target.id === 'content.identification'
      ? event.target
      : null;
    if (!input) return;

    const originalValue = syncClientIdentificationOriginalValue(input);
    const currentValue = normalizeClientIdentificationForCompare(input.value || '');
    if (event.isTrusted && originalValue && currentValue !== originalValue) {
      input.setAttribute(CLIENT_IDENTIFICATION_DIRTY_ATTR, 'true');
    } else if (originalValue && currentValue === originalValue) {
      input.removeAttribute(CLIENT_IDENTIFICATION_DIRTY_ATTR);
    }
  }

  function syncClientIdentificationValueForPersist(input) {
    if (!isTargetClientEditRoute()) return;
    if (!input || !isClientIdentificationChanged(input)) return;

    const currentValue = String(input.value || '');
    const descriptor = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value');
    if (descriptor && descriptor.set) {
      descriptor.set.call(input, currentValue);
    } else {
      input.value = currentValue;
    }

    input.dispatchEvent(new Event('input', { bubbles: true, composed: true }));
    input.dispatchEvent(new Event('change', { bubbles: true }));
    input.dispatchEvent(new Event('blur', { bubbles: true }));
  }
  function syncProductCreateProtection() {
    const attr = 'data-zweb-create-protected';
    const active = isFeatureEnabled('enabled') && isTargetProductRoute();
    // Apenas controles e links de cadastro: nao percorre textos de toda a grade.
    const buttons = document.querySelectorAll('button, a[role="button"], a[id="grid.primaryButton"], a[id="botaoCadastrar"], a[href*="/register/stock/product/new"], input[type="button"], input[type="submit"], [' + attr + ']');
    buttons.forEach(button => {
      const text = normalizeText(button.innerText || button.value || button.getAttribute('aria-label') || '');
      const matches = text === normalizeText('Cadastrar produto');
      if (active && matches) {
        if (!button.hasAttribute(attr)) {
          button.setAttribute(attr, JSON.stringify({ disabled: button.hasAttribute('disabled'), display: button.style.display, displayPriority: button.style.getPropertyPriority('display'), pointerEvents: button.style.pointerEvents, opacity: button.style.opacity, title: button.getAttribute('title') }));
          if (!button.__zwebCreateGuardBound) button.addEventListener('click', event => {
            if (!button.hasAttribute(attr) || !isFeatureEnabled('enabled')) return;
            event.preventDefault();
            event.stopImmediatePropagation();
          }, true);
          button.__zwebCreateGuardBound = true;
        }
        if (!button.disabled) button.disabled = true;
        if (button.style.display !== 'none' || button.style.getPropertyPriority('display') !== 'important') button.style.setProperty('display', 'none', 'important');
        if (button.style.pointerEvents !== 'none') button.style.pointerEvents = 'none';
        if (button.style.opacity !== '0.6') button.style.opacity = '0.6';
        if (button.title !== 'Botao bloqueado pelo usuario') button.title = 'Botao bloqueado pelo usuario';
      } else if (button.hasAttribute(attr)) {
        const original = JSON.parse(button.getAttribute(attr));
        button.disabled = original.disabled;
        if (original.display) button.style.setProperty('display', original.display, original.displayPriority || '');
        else button.style.removeProperty('display');
        button.style.pointerEvents = original.pointerEvents;
        button.style.opacity = original.opacity;
        if (original.title === null) button.removeAttribute('title');
        else button.setAttribute('title', original.title);
        button.removeAttribute(attr);
      }
    });
  }

  function scan() {
    syncProductCreateProtection();
    if (!isFeatureEnabled('enabled')) return;

    blockSpecificInputs();

    if (isTargetPdvRoute()) return;
    if (isDocumentRoute()) return;
    if (isTargetProductRoute()) return;

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
    if (document.getElementById(COMMON_MULTI_TERM_FILTER_UI_ID)) {
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
      addCommonPersistentFilterFromModal(modal);
      return false;
    }
    armCommonMultiTermFilter(modal);
  }

  function handleCommonMultiTermFilterSubmit(event) {
    if (!event || !event.target || !isFeatureEnabled('multiTermFilterEnabled')) return;
    const modal = findProductFilterModal();
    if (!modal) return;
    if (!modal.contains(event.target)) return;
    if (document.getElementById(COMMON_MULTI_TERM_FILTER_UI_ID)) {
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
      addCommonPersistentFilterFromModal(modal);
      return false;
    }
    armCommonMultiTermFilter(modal);
  }

  function handleCommonMultiTermFilterKeydown(event) {
    if (!event || event.key !== 'Enter' || !isFeatureEnabled('multiTermFilterEnabled')) return;
    const modal = findProductFilterModal();
    if (!modal || !modal.contains(event.target)) return;
    const valueInput = findCommonFilterValueInput(modal);
    if (!valueInput || event.target !== valueInput) return;
    if (document.getElementById(COMMON_MULTI_TERM_FILTER_UI_ID)) {
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
      addCommonPersistentFilterFromModal(modal);
      return false;
    }
    armCommonMultiTermFilter(modal);
  }

  function handleCommonMultiTermFilterClear(event) {
    if (!event || !event.target) return;
    if (!COMMON_MULTI_TERM_FILTER_STATE.active) return;
    if (!isNativeProductFilterClearControl(event.target)) return;
    if (PRODUCT_FILTER_CLEAR_SYNC_LOCK === 'custom') return;
    resetCommonMultiTermFilterState();
  }

  function handleCommonPersistentFilterClick(event) {
    if (!event || !event.target || !isFeatureEnabled('multiTermFilterEnabled')) return;
    const target = event.target.closest
      ? event.target.closest('[data-common-persistent-filter-add], [data-common-persistent-filter-clear], [data-common-persistent-filter-remove]')
      : null;
    if (!target) return;

    const modal = findProductFilterModal();
    if (!modal || !modal.contains(target)) return;

    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();

    if (target.hasAttribute('data-common-persistent-filter-add')) {
      addCommonPersistentFilterFromModal(modal);
      return;
    }

    if (target.hasAttribute('data-common-persistent-filter-clear')) {
      clearCommonPersistentFilters();
      return;
    }

    const filterId = target.getAttribute('data-common-persistent-filter-remove');
    if (filterId) {
      removeCommonPersistentFilter(filterId);
    }
  }

  function shouldBlockEventTarget(target) {
    if (!target) return false;
    if (isTargetPdvRoute()) return false;

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
      if (isFeatureEnabled('productCloneProtectionEnabled') && isProductCloneButtonElement(e && e.target)) {
        e.stopImmediatePropagation();
        e.preventDefault();
        return false;
      }

      if (!isFeatureEnabled('enabled')) return;
      if ((isTargetNfeRoute() || isTargetNfceListRoute()) && e && e.type === 'contextmenu') return;

      if (shouldBlockEventTarget(e.target)) {
        e.stopImmediatePropagation();
        e.preventDefault();
        return false;
      }
    } catch (err) {}
  }

  function handleNfceCancellationReasonSelectionChange(event) {
    if (!isTargetNfceListRoute()) return;
    const target = event && event.target;
    if (target && target.closest && !target.closest('.table-row, .grid-toolbar.no-print, #' + NFE_CONTEXT_MENU_ID)) return;
    scheduleFeatureUiRefresh(60);
  }

  function logFiscalCloneDav(event, details) {
    const entry = {
      at: new Date().toISOString(),
      href: String(location.href || ''),
      event: String(event || ''),
      details: details && typeof details === 'object' ? details : (details == null ? {} : { value: String(details) })
    };

    try {
      const current = JSON.parse(localStorage.getItem(FISCAL_CLONE_DAV_LOG_STORAGE_KEY) || '[]');
      const list = Array.isArray(current) ? current : [];
      list.push(entry);
      localStorage.setItem(FISCAL_CLONE_DAV_LOG_STORAGE_KEY, JSON.stringify(list.slice(-FISCAL_CLONE_DAV_LOG_LIMIT)));
    } catch (error) {}

    sendRuntimeMessage({ type: 'fiscal-clone-dav-log', entry }).catch(() => {});
  }

  function getDavNumberFromRow(row) {
    if (!row) return '';
    const looksLikeDateDigits = (digits) => /^(\d{8}|\d{6})$/.test(String(digits || ''));
    const headerRow = Array.from(document.querySelectorAll('.table-row.header'))
      .find((candidate) => candidate && candidate.parentElement === row.parentElement)
      || Array.from(document.querySelectorAll('.table-row.header')).find((candidate) => isVisible(candidate))
      || null;
    const headers = headerRow ? Array.from(headerRow.querySelectorAll('.cell')).map((cell, index) => ({
      index,
      label: normalizeText(((cell.querySelector('.header-text') && cell.querySelector('.header-text').textContent) || cell.textContent || '').trim())
    })) : [];
    const numberHeader = headers.find((header) => ['numero', 'número', 'codigo', 'código'].some((label) => header.label === label || header.label.indexOf(label) === 0));
    const getCellText = (index) => {
      if (!Number.isFinite(index) || index < 0) return '';
      const cell = row.querySelector('.cell[data-col="' + index + '"]') || row.children[index];
      return String(cell && (cell.innerText || cell.textContent) || '').trim();
    };
    const explicit = numberHeader ? getCellText(numberHeader.index).replace(/\D+/g, '') : '';
    if (/^\d+$/.test(explicit) && !looksLikeDateDigits(explicit)) return explicit;

    const rowLines = String(row.innerText || row.textContent || '')
      .split(/\n+/)
      .map((line) => line.trim())
      .filter(Boolean);
    const lineCandidate = rowLines
      .map((line) => line.replace(/\D+/g, ''))
      .find((digits, index) => index > 0 && /^\d{3,8}$/.test(digits) && !looksLikeDateDigits(digits));
    if (lineCandidate) return lineCandidate;

    return Array.from(row.querySelectorAll('.cell'))
      .map((cell) => String(cell.innerText || cell.textContent || '').trim())
      .map((text) => text.replace(/\D+/g, ''))
      .find((digits) => /^\d{3,8}$/.test(digits) && !looksLikeDateDigits(digits)) || '';
  }

  function findDavRowForBackgroundClone(flow) {
    const requested = String(flow && flow.davDocumentNumber || '').replace(/\D+/g, '');
    const rows = Array.from(document.querySelectorAll('.table-row'))
      .filter((row) => row && !row.classList.contains('header') && isVisible(row));

    if (requested) {
      const exact = rows.find((row) => getDavNumberFromRow(row) === requested);
      if (exact) return exact;
    }

    const total = Number(flow && flow.totalValue);
    if (Number.isFinite(total) && total > 0) {
      const formatted = total.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
      const byTotal = rows.find((row) => String(row.innerText || row.textContent || '').indexOf(formatted) !== -1);
      if (byTotal) return byTotal;
    }

    return null;
  }

  function findFiscalCloneDavSaveButton() {
    const candidates = Array.from(document.querySelectorAll('button, a, input[type="button"], input[type="submit"]'))
      .filter((button) => button && isVisible(button) && !button.disabled && button.getAttribute('aria-disabled') !== 'true');
    const labels = ['salvar', 'cadastrar', 'confirmar', 'gravar'];

    return candidates.find((button) => {
      const text = normalizeText(button.innerText || button.textContent || button.value || button.getAttribute('aria-label') || button.getAttribute('title') || '');
      if (!text) return false;
      if (text.indexOf('cancel') !== -1 || text.indexOf('excluir') !== -1 || text.indexOf('clonar') !== -1) return false;
      return labels.some((label) => text === label || text.indexOf(label) !== -1);
    }) || null;
  }

  function clickFiscalCloneOnce(element) {
    if (!element) return false;
    try {
      if (typeof element.click === 'function') {
        element.click();
        return true;
      }
    } catch (error) {}
    try {
      element.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, view: window }));
      return true;
    } catch (error) {
      return false;
    }
  }

  async function openFiscalCloneDavCloneAction(flow) {
    logFiscalCloneDav('dav-background-clone-start', {
      davDocumentNumber: flow && flow.davDocumentNumber,
      totalValue: flow && flow.totalValue,
      returnHash: flow && flow.returnHash
    });

    if (flow && flow.returnHash && window.location.hash !== flow.returnHash) {
      window.location.hash = flow.returnHash;
      await delay(900);
    }

    const row = await waitForCondition(() => findDavRowForBackgroundClone(flow), 12000, 300);
    if (!row) {
      logFiscalCloneDav('dav-background-row-missing', {
        davDocumentNumber: flow && flow.davDocumentNumber,
        totalValue: flow && flow.totalValue,
        bodyText: String(document.body && document.body.innerText || '').slice(0, 900)
      });
      return false;
    }

    const resolvedDavNumber = getDavNumberFromRow(row);
    logFiscalCloneDav('dav-background-row-found', {
      resolvedDavNumber,
      rowText: String(row.innerText || row.textContent || '').slice(0, 260)
    });

    const menu = await openFiscalCloneRowContextMenu(row);
    if (!menu && /\/edit\//i.test(window.location.hash || '')) {
      logFiscalCloneDav('dav-background-opened-edit-instead-menu', {
        currentHash: window.location.hash,
        davDocumentNumber: flow && flow.davDocumentNumber
      });
      return {
        ok: false,
        terminal: true,
        message: 'A automacao abriu o DAV em edicao em vez do menu de acoes.'
      };
    }
    const cloneAction = findNfeActionMenuItem(menu, ['Clonar', 'Clonar DAV', 'Clonar pedido', 'Clonar pedido de venda', 'Clonar orçamento'], true)
      || Array.from(document.querySelectorAll('a, button, li')).find((item) => isCloneActionLabel(extractActionMenuItemLabel(item) || item.innerText || item.textContent || ''));
    if (!cloneAction) {
      logFiscalCloneDav('dav-background-clone-action-missing', { menuText: menu ? String(menu.innerText || menu.textContent || '').slice(0, 300) : '' });
      return {
        ok: false,
        terminal: true,
        message: 'Acao Clonar nao localizada no menu do DAV.'
      };
    }

    logFiscalCloneDav('dav-background-clone-click', { text: String(cloneAction.innerText || cloneAction.textContent || '').trim() });
    activateFiscalMenuAction(cloneAction.matches && cloneAction.matches('li') ? (cloneAction.querySelector('a, button') || cloneAction) : cloneAction, { singleClick: true });

    const saveButton = await waitForCondition(() => {
      const button = findFiscalCloneDavSaveButton();
      return button || null;
    }, 25000, 300);
    if (!saveButton) {
      logFiscalCloneDav('dav-save-button-missing', {
        currentHash: window.location.hash,
        bodyText: String(document.body && document.body.innerText || '').slice(0, 900)
      });
      return {
        ok: false,
        terminal: true,
        message: 'Botao Salvar do DAV clonado nao localizado.'
      };
    }

    logFiscalCloneDav('dav-save-button-click', { text: String(saveButton.innerText || saveButton.textContent || saveButton.value || '').trim() });
    clickFiscalCloneOnce(saveButton);
    await delay(3500);
    logFiscalCloneDav('dav-save-finished', { currentHash: window.location.hash });
    return { ok: true };
  }

  document.addEventListener('dblclick', blockInteractions, true);
  document.addEventListener('mousedown', rememberNfeContextMenuAnchorFromMouse, true);
  document.addEventListener('contextmenu', rememberNfeContextMenuAnchor, true);
  document.addEventListener('contextmenu', handleNfceCancellationReasonSelectionChange, true);
  document.addEventListener('contextmenu', blockInteractions, true);
  document.addEventListener('click', handleFiscalCloneConfirmModalAction, true);
  document.addEventListener('pointerdown', handleNfePanelQuickAction, true);
  document.addEventListener('click', handleNfePanelQuickAction, true);
  document.addEventListener('pointerdown', handleFiscalCloneConfirm, true);
  document.addEventListener('click', handleFiscalCloneConfirm, true);
  document.addEventListener('pointerdown', handleCloneActionBlock, true);
  document.addEventListener('click', handleCloneActionBlock, true);
  document.addEventListener('pointerdown', armXmlDownloadFlow, true);
  document.addEventListener('pointerdown', handleNfeCashSaleBoletoGuard, true);
  document.addEventListener('pointerdown', handleClientIdentificationSaveSync, true);
  document.addEventListener('pointerdown', handleDocumentNegativeStockGuardModalBlock, true);
  document.addEventListener('mousedown', handleDocumentNegativeStockGuardModalBlock, true);
  document.addEventListener('mouseup', handleDocumentNegativeStockGuardModalBlock, true);
  document.addEventListener('click', handleDocumentNegativeStockGuardModalBlock, true);
  document.addEventListener('contextmenu', handleDocumentNegativeStockGuardModalBlock, true);
  document.addEventListener('wheel', handleDocumentNegativeStockGuardModalBlock, { capture: true, passive: false });
  document.addEventListener('keydown', handleDocumentNegativeStockGuardModalBlock, true);
  document.addEventListener('focusin', handleDocumentNegativeStockGuardModalBlock, true);
  document.addEventListener('click', armXmlDownloadFlow, true);
  document.addEventListener('click', handleNfeCashSaleBoletoGuard, true);
  document.addEventListener('click', handleClientIdentificationSaveSync, true);
  document.addEventListener('click', handleNfceCancellationReasonSelectionChange, true);
  document.addEventListener('change', handleNfceCancellationReasonSelectionChange, true);
  document.addEventListener('click', handlePdvCashCounterResetClick, true);
  document.addEventListener('dblclick', handlePdvCashCounterDoubleClick, true);
  document.addEventListener('click', handleCommonPersistentFilterClick, true);
  document.addEventListener('click', handleProductNativeFilterClearSync, true);
  document.addEventListener('click', handleCommonMultiTermFilterApply, true);
  document.addEventListener('click', handleCommonMultiTermFilterClear, true);
  document.addEventListener('submit', handleCommonMultiTermFilterSubmit, true);
  document.addEventListener('keydown', handleCommonMultiTermFilterKeydown, true);
  document.addEventListener('input', normalizeItemSearchValue, true);
  document.addEventListener('input', handleDavItemSelectionCapture, true);
  document.addEventListener('input', trackClientIdentificationEdit, true);
  document.addEventListener('input', handleProductLowStockRefreshTrigger, true);
  document.addEventListener('change', normalizeItemSearchValue, true);
  document.addEventListener('focusin', normalizeFocusedItemSearchValue, true);
  document.addEventListener('change', handleDavItemSelectionCapture, true);
  document.addEventListener('change', trackClientIdentificationEdit, true);
  document.addEventListener('change', handleProductLowStockRefreshTrigger, true);
  document.addEventListener('keydown', handleNfeItemSearchHashKeydown, true);
  document.addEventListener('keyup', handleProductLowStockRefreshTrigger, true);
  document.addEventListener('click', handleProductLowStockRefreshTrigger, true);
  document.addEventListener('click', handleDavItemSelectionCapture, true);
  document.addEventListener('keydown', handleDavItemSelectionCapture, true);
  document.addEventListener('pointerdown', handleProductAdminGuardActivation, true);
  document.addEventListener('keydown', handleProductAdminGuardActivation, true);
  document.addEventListener('paste', handleProductAdminGuardActivation, true);
  document.addEventListener('beforeinput', handleProductAdminGuardActivation, true);
  document.addEventListener('change', handleDavQuantityAutoClearTrigger, true);
  document.addEventListener('keydown', handleDavQuantityAutoClearTrigger, true);
  document.addEventListener('click', handleDavQuantityAutoClearOptionClick, true);
  document.addEventListener('pointerup', handleBatchToggleActivation, true);
  document.addEventListener('keydown', handleBatchToggleActivation, true);
  try {
    const runtime = getRuntimeApi();
    if (runtime && runtime.onMessage && typeof runtime.onMessage.addListener === 'function') {
      runtime.onMessage.addListener((message, sender, sendResponse) => {
        if (!message || (
          message.type !== 'document-negative-stock-disable-config-page'
          && message.type !== 'document-negative-stock-disabled-notification'
          && message.type !== 'fiscal-clone-dav-run-background-clone'
        )) return;
        if (message.type === 'fiscal-clone-dav-run-background-clone') {
          openFiscalCloneDavCloneAction(message.flow || {})
            .then((result) => {
              if (result && typeof result === 'object') {
                sendResponse(result);
                return;
              }
              sendResponse({ ok: !!result });
            })
            .catch((error) => sendResponse({
              ok: false,
              terminal: true,
              message: error && error.message ? error.message : String(error || '')
            }));
          return true;
        }
        if (message.type === 'document-negative-stock-disabled-notification') {
          showDocumentNegativeStockNativeToastClone(message.notification);
          sendResponse({ ok: true });
          return;
        }
        disableDocumentNegativeStockGuardFromConfigPageRequest(sendResponse);
        return true;
      });
    }
  } catch (error) {}
  window.addEventListener('message', handleXmlBridgeMessage);
  window.addEventListener(XML_BRIDGE_SOURCE, handleXmlBridgeMessage);
  window.addEventListener('beforeunload', handleDocumentNegativeStockGuardBeforeUnload);
  window.addEventListener('focus', function() {
    runDocumentNegativeStockGuardHeartbeat();
  });
  window.addEventListener('pageshow', function() {
    runDocumentNegativeStockGuardHeartbeat();
  });
  document.addEventListener('visibilitychange', function() {
    runDocumentNegativeStockGuardHeartbeat();
  }, true);
  window.addEventListener('storage', function(event) {
    if (!event || event.key === DOCUMENT_NEGATIVE_STOCK_GUARD_STORAGE_KEY || event.key === DOCUMENT_NEGATIVE_STOCK_GUARD_OWNER_STORAGE_KEY || event.key === DOCUMENT_NEGATIVE_STOCK_CONFIGURATION_STORAGE_KEY || event.key === DOCUMENT_NEGATIVE_STOCK_FORCE_DISABLE_STORAGE_KEY) {
      runDocumentNegativeStockGuardHeartbeat();
    }
  });
  window.addEventListener('hashchange', function() {
    resetProductAdminGuardState();
    if (shouldUsePageBridge()) ensurePageBridge();
    runDocumentNegativeStockGuardHeartbeat();
    scheduleFeatureUiRefresh(40);
  });
  window.addEventListener('resize', function() {
    scheduleFeatureUiRefresh(40);
  });

  const observer = new MutationObserver(() => {
    if (shouldUsePageBridge()) ensurePageBridge();
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
    scan();

    syncClientIdentificationUnlock();
    syncProductAdminGuardInputs();
    ensureSupplierBusinessNameEditor();
    syncDocumentNegativeStockGuard();

    syncNfceCardBrandOptions();
    syncPdvCashCounterUi();
    syncFiscalCloneDavFlow();
    syncProductCloneProtection();
    ensureLowStockHighlightStyle();
    positionNfeContextMenuPopup();
    syncNfeActionMenuItems();
    syncCloneActionBlockItems();
    syncNfeReturnHistory();
    syncCommissionReportModal();

    if (isTargetNfeRoute()) {
      ensureNfeActionCustomizeButton();
      ensureNfeBatchDownloadActionItems();
      ensureNfePanelQuickActionItems();
      ensureNfeCashSaleBoletoGuardBindings();
    } else {
      removeNfeCashSaleBoletoWarningUi();
      removeNfeActionCustomizeUi();
      removeNfeBatchDownloadUi();
      restoreNfeActionMenuItems();
    }

    if (isTargetNfceListRoute()) {
      ensureNfceCancellationReasonActionItems();
    } else {
      removeNfceCancellationReasonUi();
    }

    if (isTargetDavRoute()) {
      ensureDefaultDavRecipient();
      ensureBatchUi();
      syncDavItemCodeColumn();
    } else {
      ensureDefaultDavRecipient();
      removeBatchUi();
    }

    if (isTargetProductRoute()) {
      ensureProductPreviewButton();
      ensureProductPreferredSupplierReplicateUi();
      ensureProductStyleCustomizeButton();
      renderProductCodeRangePanel();
      syncCommonMultiTermFilterRows();
      syncProductFilterColumnOptions();
      ensureCommonFilterPersistenceUi();
      syncProductLowStockHighlight();
    } else {
      removeProductPreviewButton();
      const replicateSection = document.getElementById(PRODUCT_REPLICATE_SUPPLIER_SECTION_ID);
      if (replicateSection) replicateSection.remove();
      removeProductStyleCustomizeUi();
      resetCommonMultiTermFilterState();
      const persistencePanel = document.getElementById(COMMON_MULTI_TERM_FILTER_UI_ID);
      if (persistencePanel) persistencePanel.remove();
      restoreProductFilterColumnOptions();
      clearProductLowStockHighlight();
    }
  }

  function init() {
    if (shouldUsePageBridge()) ensurePageBridge();
    startDocumentNegativeStockGuardHeartbeat();
    resetProductAdminGuardState();
    DAV_ITEM_CODE_CACHE = readDavItemCodeCache();
    try {
      if (chrome.storage && chrome.storage.session) {
        chrome.storage.session.get({ [PRODUCT_ADMIN_GUARD_SESSION_STORAGE_KEY]: false }, (res) => {
          PRODUCT_ADMIN_GUARD_SESSION_UNLOCKED = !!(res && res[PRODUCT_ADMIN_GUARD_SESSION_STORAGE_KEY]);
          scheduleFeatureUiRefresh(0);
        });
      }
    } catch (e) {}

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

    observer.observe(document.documentElement || document.body, { childList: true, characterData: true, subtree: true });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  try {
    chrome.storage.onChanged.addListener((changes, area) => {
      if (area === 'session') {
        if (changes[PRODUCT_ADMIN_GUARD_SESSION_STORAGE_KEY]) {
          PRODUCT_ADMIN_GUARD_SESSION_UNLOCKED = changes[PRODUCT_ADMIN_GUARD_SESSION_STORAGE_KEY].newValue === true;
          scheduleFeatureUiRefresh(0);
        }
        return;
      }

      if (area !== 'local') return;

      if (changes[ACTION_MENU_PREFS_STORAGE_KEY]) {
        ACTION_MENU_PREFS = changes[ACTION_MENU_PREFS_STORAGE_KEY].newValue || {};
        syncNfeActionMenuItems();
        syncCloneActionBlockItems();
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
})();
