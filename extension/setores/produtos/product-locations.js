(function() {
  'use strict';

  const FEATURE_KEY = 'productLocationsEnabled';
  const FEATURE_DEFAULTS = globalThis.ZWEB_FEATURES && typeof globalThis.ZWEB_FEATURES.getDefaults === 'function'
    ? globalThis.ZWEB_FEATURES.getDefaults()
    : { [FEATURE_KEY]: true };
  const PRODUCT_ROUTE = '/register/stock/product';
  const EDIT_ROUTE = '/register/stock/product/edit/';
  const PANEL_ID = 'zweb-product-location-panel';
  const QUICK_VIEWER_ID = 'zweb-product-location-quick-viewer';
  const QUICK_VIEWER_POSITION_KEY = 'zwebProductLocationQuickViewerPosition';
  const MAX_QUICK_VIEWER_DESCRIPTION_LENGTH = 46;
  const PRODUCT_PAGINATE_API_URL = 'https://api.zweb.com.br/rpc/v2/inventory.get-product-paginate';
  const PRODUCT_GET_API_URL = 'https://api.zweb.com.br/rpc/v2/inventory.get-product';
  const PRODUCT_PUT_API_URL = 'https://api.zweb.com.br/rpc/v2/inventory.put-product';
  const MIGRATION_PAGE_SIZE = 200;
  const MIGRATION_BATCH_SIZE = 20;
  const CACHE_TTL_MS = 30_000;
  const MAX_VISIBLE_LOCATION_CACHE_ENTRIES = 180;
  const PRODUCT_EDIT_MOUNT_RETRY_MS = 250;
  const PRODUCT_EDIT_MOUNT_MAX_ATTEMPTS = 32;
  const PRODUCT_EDIT_MOUNT_WATCH_MS = 12_000;
  // A transferencia toca a API autenticada do ZWeb. Ela fica suspensa ate
  // existir homologacao e uma liberacao manual desta versao.
  const AUTOMATIC_MIGRATION_ENABLED = false;
  let featureEnabled = FEATURE_DEFAULTS[FEATURE_KEY] !== false;
  let visibleLocationCache = new Map();
  let refreshTimer = 0;
  let productEditMountTimer = 0;
  let productEditMountToken = 0;
  let productEditMountObserver = null;
  let productEditMountObserverTimer = 0;
  let productEditMountWatchTimer = 0;
  let productEditMountWatchRoute = '';
  let migrationRunning = false;
  let automaticMigrationRequested = false;
  let barcodeBridgeRoute = '';
  let barcodeBridgeRunning = false;
  let barcodeBridgeLastCheckAt = 0;
  let shelfBatchRunning = false;
  let shelfBatchRoute = '';
  let shelfBatchLastCheckAt = 0;
  let shelfBatchEntryRetryTimer = 0;
  let catalogScreenSignature = '';
  let panelLoadedLocation = '';
  let quickViewerProduct = null;
  const quickViewerRequests = new Map();

  function clampQuickViewerPosition(viewer, left, top) {
    const bounds = viewer.getBoundingClientRect();
    return {
      left: Math.min(Math.max(8, left), Math.max(8, window.innerWidth - bounds.width - 8)),
      top: Math.min(Math.max(8, top), Math.max(8, window.innerHeight - bounds.height - 8))
    };
  }

  function applyQuickViewerPosition(viewer, position) {
    if (!position || !Number.isFinite(position.left) || !Number.isFinite(position.top)) return;
    const next = clampQuickViewerPosition(viewer, position.left, position.top);
    viewer.style.left = `${next.left}px`;
    viewer.style.top = `${next.top}px`;
    viewer.style.right = 'auto';
    viewer.style.bottom = 'auto';
  }

  function makeQuickViewerDraggable(viewer) {
    let drag = null;
    viewer.addEventListener('pointerdown', event => {
      if (event.button !== 0) return;
      const bounds = viewer.getBoundingClientRect();
      drag = { offsetX: event.clientX - bounds.left, offsetY: event.clientY - bounds.top };
      viewer.setPointerCapture(event.pointerId);
      viewer.style.cursor = 'grabbing';
      event.preventDefault();
    });
    viewer.addEventListener('pointermove', event => {
      if (!drag) return;
      applyQuickViewerPosition(viewer, {
        left: event.clientX - drag.offsetX,
        top: event.clientY - drag.offsetY
      });
    });
    viewer.addEventListener('pointerup', event => {
      if (!drag) return;
      drag = null;
      viewer.releasePointerCapture(event.pointerId);
      viewer.style.cursor = 'grab';
      const bounds = viewer.getBoundingClientRect();
      chrome.storage.local.set({ [QUICK_VIEWER_POSITION_KEY]: { left: bounds.left, top: bounds.top } });
    });
  }

  // Sem acento e em minusculas. Os titulos da grade do ZWeb vem acentuados
  // ("Codigo", "Descricao"), entao comparar sem tirar o acento nunca casa e a
  // lista fica sem os rotulos de local.
  function normalizeText(value) {
    return String(value || '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim()
      .toLocaleLowerCase('pt-BR');
  }

  function isProductRoute() {
    const href = String(location.href || '').toLowerCase();
    return href.includes(PRODUCT_ROUTE) && !href.includes('/new');
  }

  function isProductListRoute() {
    return isProductRoute() && !getProductIdFromRoute();
  }

  function getProductIdFromRoute() {
    const match = String(location.hash || '').match(/\/register\/stock\/product\/edit\/([^/?#]+)/i);
    return match ? match[1] : '';
  }

  function isTransientMessagePortError(error) {
    return /message port closed before a response was received/i.test(String(error && error.message || error || ''));
  }

  function isExtensionContextInvalidated(error) {
    return /extension context invalidated/i.test(String(error && error.message || error || ''));
  }

  function setVisibleLocationCache(productCode, entry) {
    visibleLocationCache.delete(productCode);
    visibleLocationCache.set(productCode, entry);

    const now = Date.now();
    for (const [code, cached] of visibleLocationCache) {
      if (!cached || cached.expiresAt <= now) visibleLocationCache.delete(code);
    }
    while (visibleLocationCache.size > MAX_VISIBLE_LOCATION_CACHE_ENTRIES) {
      visibleLocationCache.delete(visibleLocationCache.keys().next().value);
    }
  }

  function sendInternalRequest(path, method, body) {
    return new Promise((resolve, reject) => {
      const dispatch = attempt => {
        chrome.runtime.sendMessage({ type: 'zweb-product-location-request', path, method, body }, (reply) => {
          const error = chrome.runtime && chrome.runtime.lastError;
          if (error) {
            if (method === 'GET' && attempt === 0 && isTransientMessagePortError(error)) {
              window.setTimeout(() => dispatch(1), 250);
              return;
            }
            reject(new Error(error.message));
            return;
          }
          if (!reply || !reply.ok) {
            reject(new Error(reply && reply.message || 'Nao foi possivel comunicar com o enderecamento.'));
            return;
          }
          resolve(reply.payload);
        });
      };
      dispatch(0);
    });
  }

  function readProductBarcodeFromScreen() {
    const campo = findProductField('product.barCode');
    return campo ? String(campo.value || '').trim() : '';
  }

  function findProductField(fieldId) {
    return document.getElementById(fieldId);
  }

  function findProductInputByLabel(labelName) {
    const normalizedName = normalizeText(labelName);
    const label = Array.from(document.querySelectorAll('label')).find(candidate => {
      const text = normalizeText(candidate.textContent).replace(/\*/g, '').trim();
      return text === normalizedName;
    });
    if (!label) return null;
    const inputId = label.getAttribute('for');
    if (inputId) {
      const associatedInput = document.getElementById(inputId);
      if (associatedInput) return associatedInput;
    }
    return label.parentElement && label.parentElement.querySelector('input, textarea');
  }

  function getProductMeta() {
    const productId = getProductIdFromRoute();
    const code = findProductField('product.sequence')
      || document.querySelector('[name="product.sequence"], [name="sequence"]')
      || findProductInputByLabel('codigo');
    const description = findProductField('product.description')
      || document.querySelector('[name="product.description"], [name="description"]')
      || findProductInputByLabel('descricao');
    if (!productId || !code || !description || !String(code.value || '').trim()) return null;
    return {
      productId,
      productCode: String(code.value || '').trim(),
      productDescription: String(description.value || '').trim()
    };
  }

  function syncCatalogItemFromScreen(meta) {
    if (!meta) return;
    // A rota atual do cadastro usa UUID, mas o coletor ainda exige o antigo
    // identificador numerico. Nao converter UUID em NaN nem insistir nessa
    // atualizacao: o campo de enderecamento continua funcionando por codigo.
    const catalogProductId = Number(meta.productId);
    if (!Number.isSafeInteger(catalogProductId) || catalogProductId <= 0) return;
    const barcode = readProductBarcodeFromScreen();
    const signature = `${meta.productId}:${meta.productCode}:${meta.productDescription}:${barcode}`;
    if (catalogScreenSignature === signature) return;
    catalogScreenSignature = signature;
    sendInternalRequest('/api/zweb/product-catalog', 'PUT', {
      items: [{
        productId: catalogProductId,
        productCode: meta.productCode,
        productDescription: meta.productDescription,
        barcode
      }]
    }).catch(error => {
      // Nao bloqueia o cadastro aberto. A assinatura permanece marcada para
      // que uma falha local nao gere varias tentativas na mesma tela.
      console.warn('[zweb] catalogo do coletor nao foi atualizado.', error);
    });
  }

  function setPanelMessage(panel, message, error) {
    const status = panel.querySelector('[data-product-location-status]');
    if (!status) return;
    status.textContent = message || '';
    status.style.color = error ? '#c13a3a' : '#667085';
  }

  function findPanelAnchor() {
    const observation = findProductField('observation')
      || findProductField('product.observation')
      || document.querySelector('textarea[name="product.observation"]')
      || document.querySelector('textarea[id*="observation"], textarea[name*="observation"], textarea');
    const observationLabel = Array.from(document.querySelectorAll('label'))
      .find(label => normalizeText(label.textContent) === 'observacoes');
    const labelAnchor = observationLabel && (observationLabel.closest('[class*="col-"]')
      || observationLabel.closest('.form-group') || observationLabel.parentElement);
    if (!observation && !labelAnchor) return null;
    // A coluna do grid, e nao o form-group: assim o painel entra como uma
    // coluna irma e herda a largura e a altura dos campos nativos.
    return (observation && (observation.closest('[class*="col-"]') || observation.closest('.form-group') || observation.parentElement))
      || labelAnchor;
  }

  function findNativeSaveButton() {
    const panel = document.getElementById(PANEL_ID);
    return Array.from(document.querySelectorAll('#z_app_content_container button.btn-primary'))
      .find(button => button.textContent.trim() === 'Salvar' && (!panel || !panel.contains(button))) || null;
  }

  // O ZWeb fixa altura e recuo no proprio elemento, por estilo inline, entao
  // copiar o atributo do campo Referencia mantem os dois iguais mesmo que o
  // ZWeb mude esses valores em uma atualizacao.
  function applyNativeFieldStyle(input) {
    const reference = findProductField('product.reference')
      || document.querySelector('#productGeneralData input.form-control[style*="height"]');
    const nativeStyle = reference && reference.getAttribute('style');
    if (nativeStyle) input.setAttribute('style', nativeStyle);
  }

  // A marcacao espelha a do campo Referencia (col-md-3 > form-group >
  // input-wrapper > input.form-control), para o campo nascer com a mesma
  // largura e altura dos campos nativos.
  function createPanel() {
    const panel = document.createElement('div');
    panel.id = PANEL_ID;
    panel.className = 'col-md-3';
    const group = document.createElement('div');
    group.className = 'position-relative form-group';
    const caption = document.createElement('label');
    caption.className = 'form-label';
    caption.textContent = 'Endereçamento';
    const wrapper = document.createElement('div');
    wrapper.className = 'input-wrapper';
    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'form-control';
    input.maxLength = 180;
    input.autocomplete = 'off';
    input.placeholder = '';
    input.setAttribute('data-product-location-input', 'true');
    applyNativeFieldStyle(input);
    wrapper.appendChild(input);
    const status = document.createElement('small');
    status.setAttribute('data-product-location-status', 'true');
    status.style.cssText = 'display:block;margin-top:3px;font-size:11px';
    group.append(caption, wrapper, status);
    panel.appendChild(group);
    return panel;
  }

  // O campo nao tem botao proprio: quem grava e o Salvar do ZWeb, para o
  // operador salvar o produto inteiro em uma acao so.
  async function saveLocationFromNativeSave() {
    const panel = document.getElementById(PANEL_ID);
    const meta = getProductMeta();
    const input = panel && panel.querySelector('[data-product-location-input]');
    if (!panel || !meta || !input) return;
    const location = String(input.value || '').trim();
    if (location === panelLoadedLocation) return;

    // Campo esvaziado com endereco gravado e pedido de remocao: antes isso nao
    // fazia nada, e o valor antigo reaparecia ao reabrir o produto.
    if (!location) {
      if (!panelLoadedLocation) return;
      setPanelMessage(panel, 'Removendo...', false);
      try {
        await sendInternalRequest(`/api/zweb/product-locations/by-code/${encodeURIComponent(meta.productCode)}/remove`, 'POST', {
          actorName: 'Operador ZWeb'
        });
        panelLoadedLocation = '';
        visibleLocationCache.delete(meta.productCode);
        setPanelMessage(panel, 'Endereçamento removido.', false);
      } catch (error) {
        setPanelMessage(panel, error && error.message || 'Não foi possível remover o endereçamento.', true);
      }
      return;
    }

    setPanelMessage(panel, 'Salvando...', false);
    try {
      const saved = await sendInternalRequest(`/api/zweb/product-locations/by-code/${encodeURIComponent(meta.productCode)}`, 'PUT', {
        productCode: meta.productCode,
        productDescription: meta.productDescription,
        // Lido do DOM ja renderizado: mantem o catalogo do coletor vivo sem
        // nenhuma chamada ao ZWeb.
        barcode: readProductBarcodeFromScreen(),
        location,
        actorName: 'Operador ZWeb'
      });
      input.value = saved.location;
      panelLoadedLocation = saved.location;
      setVisibleLocationCache(saved.productCode, { location: saved.location, expiresAt: Date.now() + CACHE_TTL_MS });
      setPanelMessage(panel, 'Endereçamento salvo.', false);
    } catch (error) {
      setPanelMessage(panel, error && error.message || 'Não foi possível salvar o endereçamento.', true);
    }
  }

  async function syncEditPanel() {
    const existing = document.getElementById(PANEL_ID);
    const meta = getProductMeta();
    // O interruptor geral controla a consulta visual da grade. O campo no
    // cadastro e o ponto de manutencao do dado e nao pode desaparecer por
    // uma preferencia antiga deixada pela extensao em outra versao.
    if (!meta) {
      if (existing) existing.remove();
      return;
    }
    syncCatalogItemFromScreen(meta);
    const anchor = findPanelAnchor();
    if (!anchor) return;
    const panel = existing || createPanel();
    if (!existing || panel.previousElementSibling !== anchor) anchor.insertAdjacentElement('afterend', panel);
    const input = panel.querySelector('[data-product-location-input]');
    if (panel.getAttribute('data-product-location-id') === meta.productId || !input) return;
    panel.setAttribute('data-product-location-id', meta.productId);
    input.value = '';
    panelLoadedLocation = '';
    if (!findNativeSaveButton()) console.warn('Botao Salvar do ZWeb nao localizado: o enderecamento nao sera gravado junto com o produto.');
    setPanelMessage(panel, 'Carregando endereçamento...', false);
    try {
      const stored = await sendInternalRequest(`/api/zweb/product-locations/by-code/${encodeURIComponent(meta.productCode)}`, 'GET');
      if (panel.getAttribute('data-product-location-id') !== meta.productId) return;
      input.value = stored.location || '';
      panelLoadedLocation = stored.location || '';
      setPanelMessage(panel, stored.location ? 'Local atual carregado.' : '', false);
    } catch (error) {
      if (error && /nao encontrado/i.test(error.message || '')) {
        setPanelMessage(panel, '', false);
        return;
      }
      setPanelMessage(panel, 'Nao foi possivel carregar o enderecamento.', true);
    }
  }

  function getListStructure() {
    const rows = Array.from(document.querySelectorAll('.table-row, tr'));
    for (const row of rows) {
      const titles = Array.from(row.children || []).map(cell => normalizeText(cell.textContent));
      const codeIndex = titles.findIndex(title => title === 'codigo');
      const descriptionIndex = titles.findIndex(title => title === 'descricao');
      if (codeIndex >= 0 && descriptionIndex >= 0) return { row, codeIndex, descriptionIndex };
    }
    return null;
  }

  function getVisibleProductRows(header, structure) {
    return Array.from(document.querySelectorAll('.table-row, tr')).filter(row => {
      if (row === header) return false;
      const codeCell = row.children[structure.codeIndex];
      const descriptionCell = row.children[structure.descriptionIndex];
      return Boolean(codeCell && descriptionCell && String(codeCell.textContent || '').trim());
    });
  }

  function ensureQuickViewer() {
    let viewer = document.getElementById(QUICK_VIEWER_ID);
    if (viewer) return viewer;

    viewer = document.createElement('section');
    viewer.id = QUICK_VIEWER_ID;
    viewer.style.cssText = [
      'position:fixed',
      'right:24px',
      'bottom:20px',
      'z-index:1050',
      'display:flex',
      'align-items:center',
      'gap:12px',
      'max-width:min(620px,calc(100vw - 48px))',
      'min-height:38px',
      'padding:7px 12px',
      'border:1px solid rgba(255,255,255,.12)',
      'border-left:2px solid #0d6efd',
      'border-radius:3px',
      'background:#242424',
      'box-shadow:0 3px 12px rgba(0,0,0,.28)',
      'font-size:12px',
      'line-height:1.35',
      'cursor:grab',
      'user-select:none'
    ].join(';');

    const title = document.createElement('strong');
    title.textContent = 'Endereçamento';
    title.style.cssText = 'color:#79c7ff;font-weight:700;white-space:nowrap;text-transform:uppercase;letter-spacing:.02em';
    const productValue = document.createElement('span');
    productValue.setAttribute('data-product-location-quick-value', 'true');
    productValue.textContent = 'Passe o mouse sobre um produto para consultar o local.';
    productValue.style.cssText = 'overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-weight:700;max-width:360px';
    productValue.style.color = '#f8fafc';
    const locationValue = document.createElement('span');
    locationValue.setAttribute('data-product-location-quick-location', 'true');
    locationValue.style.cssText = 'font-weight:800;white-space:nowrap';
    locationValue.style.color = '#8bd3ff';
    viewer.append(title, productValue, locationValue);
    document.body.appendChild(viewer);
    makeQuickViewerDraggable(viewer);
    chrome.storage.local.get({ [QUICK_VIEWER_POSITION_KEY]: null }, stored => {
      applyQuickViewerPosition(viewer, stored && stored[QUICK_VIEWER_POSITION_KEY]);
    });
    return viewer;
  }

  function compactQuickViewerDescription(description) {
    const text = String(description || '').trim();
    return text.length > MAX_QUICK_VIEWER_DESCRIPTION_LENGTH
      ? `${text.slice(0, MAX_QUICK_VIEWER_DESCRIPTION_LENGTH - 1)}…`
      : text;
  }

  function updateQuickViewer() {
    if (!featureEnabled || !isProductListRoute()) return;
    const viewer = ensureQuickViewer();
    const productValue = viewer && viewer.querySelector('[data-product-location-quick-value]');
    const locationValue = viewer && viewer.querySelector('[data-product-location-quick-location]');
    if (!productValue || !locationValue || !quickViewerProduct) return;
    const description = compactQuickViewerDescription(quickViewerProduct.description);
    productValue.textContent = `${quickViewerProduct.code} · ${description}`;
    productValue.title = `${quickViewerProduct.code} · ${quickViewerProduct.description}`;
    const cached = visibleLocationCache.get(quickViewerProduct.code);
    if (!cached) {
      locationValue.textContent = '· Carregando local...';
      locationValue.style.color = '#8bd3ff';
      return;
    }
    if (cached.error) {
      locationValue.textContent = '· Nao foi possivel consultar o enderecamento.';
      locationValue.title = cached.error;
      locationValue.style.color = '#ff9c91';
      return;
    }
    const location = cached.location || 'Sem endereçamento informado';
    locationValue.textContent = `· ${location}`;
    locationValue.title = location;
    locationValue.style.color = '#8bd3ff';
  }

  function requestQuickViewerLocation(productCode) {
    const cached = visibleLocationCache.get(productCode);
    if (cached && cached.expiresAt > Date.now()) return Promise.resolve();
    const currentRequest = quickViewerRequests.get(productCode);
    if (currentRequest) return currentRequest;

    const request = sendInternalRequest(`/api/zweb/product-locations/by-codes?productCodes=${encodeURIComponent(productCode)}`, 'GET')
      .then(payload => {
        const location = (payload && Array.isArray(payload.locations) ? payload.locations : [])
          .find(item => String(item.productCode) === productCode);
        setVisibleLocationCache(productCode, {
          location: location && location.location || '',
          expiresAt: Date.now() + CACHE_TTL_MS
        });
      })
      .catch(error => {
        setVisibleLocationCache(productCode, {
          location: '',
          error: error && error.message || 'Falha na consulta interna.',
          expiresAt: Date.now() + 5_000
        });
      })
      .finally(() => {
        quickViewerRequests.delete(productCode);
        const structure = getListStructure();
        if (structure && quickViewerProduct && quickViewerProduct.code === productCode) updateQuickViewer();
      });
    quickViewerRequests.set(productCode, request);
    return request;
  }

  function observationSignature(value) {
    let hash = 2166136261;
    const text = String(value || '');
    for (let index = 0; index < text.length; index += 1) {
      hash ^= text.charCodeAt(index);
      hash = Math.imul(hash, 16777619);
    }
    return `${text.length}:${(hash >>> 0).toString(16)}`;
  }

  function isInvalidLegacyObservation(value) {
    const text = String(value || '');
    return text.includes('\u0000') || /^0x0{3,}/i.test(text.trim());
  }

  function isNumericOnlyDescription(value) {
    return /^\d+$/.test(String(value || '').trim());
  }

  async function postNativeProductApi(url, body, operation = 'productLocationMigration') {
    const guard = globalThis.ZWEB_RUNTIME_GUARDS;
    if (!guard || typeof guard.canRun !== 'function' || !guard.canRun(operation)) {
      throw new Error('Esta operação do ZWeb permanece suspensa até a homologação.');
    }
    const token = localStorage.getItem('token');
    if (!token) throw new Error('A sessao do ZWeb nao esta disponivel nesta aba.');
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        accept: 'application/json',
        'content-type': 'application/json',
        'authorization-compufacil': token
      },
      body: JSON.stringify(body)
    });
    const payload = await response.json().catch(() => null);
    if (!response.ok) throw new Error(payload && (payload.message || payload.error) || `O ZWeb respondeu ${response.status}.`);
    return payload;
  }

  async function fetchProductPage(page) {
    const payload = await postNativeProductApi(PRODUCT_PAGINATE_API_URL, {
      sort: { key: 'sequence', order: 'ASC' },
      page,
      maxResults: MIGRATION_PAGE_SIZE
    });
    return Array.isArray(payload) ? payload : (Array.isArray(payload && payload.data) ? payload.data : []);
  }

  function lerProdutoDaResposta(payload, opcoes) {
    const leitor = globalThis.ZWEB_PRODUCT_PAYLOAD;
    return leitor ? leitor.extractProduct(payload, opcoes) : null;
  }

  async function fetchProductDetail(productId, operation = 'productLocationMigration') {
    const payload = await postNativeProductApi(PRODUCT_GET_API_URL, { id: Number(productId) }, operation);
    const produto = lerProdutoDaResposta(payload);
    if (!produto) throw new Error(`Nao foi possivel carregar o produto ${productId}.`);
    return produto;
  }

  async function reportBarcodeBridgeResult(requestId, status, message) {
    const suffix = status === 'applied' ? 'applied' : 'failed';
    await sendInternalRequest(`/api/zweb/product-barcode-requests/${encodeURIComponent(requestId)}/${suffix}`, 'POST',
      suffix === 'failed' ? { message } : undefined);
  }

  // Uma aba de produtos consome no maximo um pedido a cada navegacao. Nao ha
  // polling, lote nem repeticao: uma falha fica registrada e so uma nova acao
  // explicita no coletor criara outro pedido.
  async function processOnePendingBarcodeRequest(force = false) {
    const guard = globalThis.ZWEB_RUNTIME_GUARDS;
    if (!guard || typeof guard.canRun !== 'function' || !guard.canRun('productBarcodeWrite')) return;
    const now = Date.now();
    if (!isProductRoute() || barcodeBridgeRunning) return;
    if (!force && barcodeBridgeRoute === location.href) return;
    if (force && now - barcodeBridgeLastCheckAt < 10_000) return;
    barcodeBridgeRoute = location.href;
    barcodeBridgeLastCheckAt = now;
    barcodeBridgeRunning = true;

    let pendingRequest = null;
    try {
      const queue = await sendInternalRequest('/api/zweb/product-barcode-requests/pending?limit=1', 'GET');
      pendingRequest = queue && Array.isArray(queue.requests) ? queue.requests[0] : null;
      if (!pendingRequest) return;

      const product = await fetchProductDetail(pendingRequest.productId, 'productBarcodeWrite');
      if (String(product.id) !== String(pendingRequest.productId)) {
        throw new Error(`O ZWeb retornou um produto diferente para o codigo ${pendingRequest.productCode}.`);
      }

      const barcode = String(pendingRequest.barcode || '').trim();
      if (!barcode) throw new Error('O pedido nao possui codigo de barras valido.');
      if (String(product.barCode || '').trim() !== barcode) {
        product.barCode = barcode;
        await postNativeProductApi(PRODUCT_PUT_API_URL, product, 'productBarcodeWrite');
      }

      const confirmed = await fetchProductDetail(pendingRequest.productId, 'productBarcodeWrite');
      if (String(confirmed.barCode || '').trim() !== barcode) {
        throw new Error(`O ZWeb nao confirmou o codigo de barras do produto ${pendingRequest.productCode}.`);
      }
      await reportBarcodeBridgeResult(pendingRequest.requestId, 'applied');
      console.info(`[zweb] codigo de barras confirmado para o produto ${pendingRequest.productCode}.`);
    } catch (error) {
      if (isExtensionContextInvalidated(error)) {
        console.info('[zweb] codigo de barras aguardando a extensao recarregada.');
        return;
      }
      const message = error && error.message || 'Falha desconhecida ao gravar codigo de barras.';
      if (pendingRequest) {
        try {
          await reportBarcodeBridgeResult(pendingRequest.requestId, 'failed', message);
        } catch (reportError) {
          console.error('[zweb] falha ao registrar o resultado do codigo de barras.', reportError);
        }
      }
      console.error('[zweb] codigo de barras nao aplicado.', error);
    } finally {
      barcodeBridgeRunning = false;
    }
  }

  function wait(milliseconds) {
    return new Promise(resolve => window.setTimeout(resolve, milliseconds));
  }

  async function findProductBySequence(productCode) {
    const payload = await postNativeProductApi(PRODUCT_PAGINATE_API_URL, {
      sort: { key: 'sequence', order: 'ASC' }, search: String(productCode), page: 1, maxResults: 15
    }, 'productShelfBatchWrite');
    const candidates = Array.isArray(payload) ? payload : (Array.isArray(payload && payload.data) ? payload.data : []);
    const product = candidates.find(candidate => String(candidate && candidate.sequence || '').trim() === String(productCode).trim());
    if (!product || !product.id) throw new Error(`Produto ${productCode} nao foi localizado pelo codigo informado.`);
    return fetchProductDetail(product.id, 'productShelfBatchWrite');
  }

  async function reportShelfBatchItem(batchId, itemId, status, body) {
    await sendInternalRequest(`/api/zweb/product-shelf-batches/${encodeURIComponent(batchId)}/items/${encodeURIComponent(itemId)}/${status}`, 'POST', body);
  }

  function extensionWasReloaded(error) {
    return /extension context invalidated/i.test(String(error && error.message || error || ''));
  }

  // Lotes nao sao polling: uma aba de produtos pega apenas o lote atual e o
  // percorre em serie. Uma falha bloqueia o resto para revisao humana.
  async function processPendingShelfBatch(force = false) {
    const guard = globalThis.ZWEB_RUNTIME_GUARDS;
    if (!guard || !guard.canRun || !guard.canRun('productShelfBatchWrite')) return;
    const now = Date.now();
    if (!isProductRoute() || shelfBatchRunning) return;
    // A lista de Produtos preserva a mesma URL quando o usuario sai e volta.
    // Usar a URL como trava escondia o segundo lote. O gatilho agora vem da
    // entrada/foco da tela, com uma janela curta apenas contra duplo clique.
    if (now - shelfBatchLastCheckAt < 1_500) return;
    shelfBatchRoute = location.href;
    shelfBatchLastCheckAt = now;
    shelfBatchRunning = true;
    let batch;
    try {
      const pending = await sendInternalRequest('/api/zweb/product-shelf-batches/pending', 'GET');
      batch = pending && pending.batch;
      if (!batch) return;
      for (const item of batch.items || []) {
        try {
          const product = item.productId
            ? await fetchProductDetail(item.productId, 'productShelfBatchWrite')
            : await findProductBySequence(item.productCode);
          await wait(2000);
          const expectedBarcode = String(item.barcode || '').trim();
          if (expectedBarcode && String(product.barCode || '').trim() !== expectedBarcode) {
            product.barCode = expectedBarcode;
            await postNativeProductApi(PRODUCT_PUT_API_URL, product, 'productShelfBatchWrite');
            await wait(2000);
            const confirmed = await fetchProductDetail(product.id, 'productShelfBatchWrite');
            if (String(confirmed.barCode || '').trim() !== expectedBarcode) throw new Error(`O ZWeb nao confirmou o codigo de barras do produto ${item.productCode}.`);
          }
          await reportShelfBatchItem(batch.batchId, item.itemId, 'applied', {
            productId: Number(product.id), productCode: String(product.sequence || item.productCode),
            productDescription: String(product.description || ''), barcode: expectedBarcode || undefined
          });
          await wait(2000);
        } catch (error) {
          await reportShelfBatchItem(batch.batchId, item.itemId, 'failed', { message: error && error.message || 'Falha ao confirmar o item.' });
          throw error;
        }
      }
    } catch (error) {
      if (extensionWasReloaded(error)) {
        // A instancia antiga nao pode mais conversar com o background. A nova
        // instancia retoma o item pendente na proxima entrada em Produtos.
        console.info('[zweb] lote de prateleira aguardando a extensao recarregada.');
      } else {
        console.error('[zweb] lote de prateleira interrompido.', error);
      }
    } finally {
      shelfBatchRunning = false;
    }
  }

  // O ZWeb e uma SPA: em algumas entradas a extensao chega antes de a rota e
  // a sessao ficarem prontas. Esta e uma segunda e ultima leitura da mesma
  // entrada, nao um temporizador recorrente.
  function requestShelfBatchCheck() {
    if (!isProductRoute()) return;
    processPendingShelfBatch(true);
    if (shelfBatchEntryRetryTimer) clearTimeout(shelfBatchEntryRetryTimer);
    shelfBatchEntryRetryTimer = window.setTimeout(() => {
      shelfBatchEntryRetryTimer = 0;
      processPendingShelfBatch(true);
    }, 2_000);
  }

  async function transferImportItem(runId, item) {
    const product = await fetchProductDetail(item.productId);
    const currentObservation = String(product.observation || '');
    if (observationSignature(currentObservation) !== item.observationSignature) {
      await sendInternalRequest(`/api/zweb/product-location-import-runs/${encodeURIComponent(runId)}/items/${encodeURIComponent(item.productId)}/failed`, 'POST', {
        message: 'A observacao foi alterada depois da varredura inicial.'
      });
      return;
    }
    if (item.status === 'pending') {
      await sendInternalRequest(`/api/zweb/product-locations/${encodeURIComponent(item.productId)}`, 'PUT', {
        productCode: String(product.sequence || item.productCode || ''),
        productDescription: String(product.description || item.productDescription || ''),
        location: currentObservation,
        actorName: 'Migracao ZWeb',
        source: 'migration_observation',
        sourceObservation: currentObservation,
        migrationRunId: runId
      });
      await sendInternalRequest(`/api/zweb/product-location-import-runs/${encodeURIComponent(runId)}/items/${encodeURIComponent(item.productId)}/location-saved`, 'POST');
    }
    product.observation = '';
    await postNativeProductApi(PRODUCT_PUT_API_URL, product);
    const verified = await fetchProductDetail(item.productId);
    if (String(verified.observation || '').trim()) throw new Error('O ZWeb manteve a observacao apos a atualizacao.');
    await sendInternalRequest(`/api/zweb/product-location-import-runs/${encodeURIComponent(runId)}/items/${encodeURIComponent(item.productId)}/cleared`, 'POST', {
      cleanupOnly: item.status === 'pending_cleanup'
    });
  }

  async function runProductLocationMigration() {
    if (!AUTOMATIC_MIGRATION_ENABLED) return;
    if (migrationRunning) return;
    migrationRunning = true;
    try {
      let run;
      let resumed = false;
      try {
        run = await sendInternalRequest('/api/zweb/product-location-import-runs', 'POST', {
          source: 'zweb-observation',
          requestedBy: 'Migracao ZWeb'
        });
      } catch (error) {
        run = await sendInternalRequest('/api/zweb/product-location-import-runs/latest?source=zweb-observation', 'GET');
        if (!run) throw error;
        if (run.finishedAt) {
          run = await sendInternalRequest(`/api/zweb/product-location-import-runs/${encodeURIComponent(run.id)}/resume`, 'POST');
        }
        resumed = true;
      }

      if (!resumed) {
        for (let page = 1; page <= 250; page += 1) {
          const products = await fetchProductPage(page);
          if (!products.length) break;
          const items = products.map(product => {
            const observation = String(product && product.observation || '');
            return {
              productId: String(product && (product.id || product._id) || ''),
              productCode: String(product && product.sequence || ''),
              productDescription: String(product && product.description || ''),
              observation,
              observationSignature: observationSignature(observation),
              cleanupOnly: isInvalidLegacyObservation(observation),
              status: observation.trim() ? undefined : 'ignored_empty',
              needsDescriptionReview: isNumericOnlyDescription(product && product.description)
            };
          }).filter(item => item.productId && item.productCode);
          if (items.length) await sendInternalRequest(`/api/zweb/product-location-import-runs/${encodeURIComponent(run.id)}/items`, 'PUT', { items });
          if (products.length < MIGRATION_PAGE_SIZE) break;
        }
      }
      let completed = 0;
      for (;;) {
        const pending = await sendInternalRequest(`/api/zweb/product-location-import-runs/${encodeURIComponent(run.id)}/pending?limit=${MIGRATION_BATCH_SIZE}`, 'GET');
        const items = pending && Array.isArray(pending.items) ? pending.items : [];
        if (!items.length) break;
        for (const item of items) {
          try {
            await transferImportItem(run.id, item);
          } catch (error) {
            await sendInternalRequest(`/api/zweb/product-location-import-runs/${encodeURIComponent(run.id)}/items/${encodeURIComponent(item.productId)}/failed`, 'POST', {
              message: error && error.message || 'Falha desconhecida durante a transferencia.'
            });
          }
          completed += 1;
        }
      }
      const summary = await sendInternalRequest(`/api/zweb/product-location-import-runs/${encodeURIComponent(run.id)}`, 'GET');
      await sendInternalRequest(`/api/zweb/product-location-import-runs/${encodeURIComponent(run.id)}/finish`, 'POST');
      console.info('Transferencia de enderecamentos concluida.', summary && summary.counts || {});
      visibleLocationCache.clear();
      scheduleRefresh(0);
    } catch (error) {
      console.error('Transferencia de enderecamentos interrompida.', error);
    } finally {
      migrationRunning = false;
    }
  }

  function requestAutomaticMigration() {
    if (!AUTOMATIC_MIGRATION_ENABLED) return;
    if (!featureEnabled || !isProductRoute() || getProductIdFromRoute() || migrationRunning) return;
    if (automaticMigrationRequested) return;
    automaticMigrationRequested = true;
    runProductLocationMigration();
  }

  async function syncVisibleListLocations() {
    if (!featureEnabled || !isProductListRoute()) {
      const viewer = document.getElementById(QUICK_VIEWER_ID);
      if (viewer) viewer.remove();
      quickViewerProduct = null;
      return;
    }
    ensureQuickViewer();
    updateQuickViewer();
  }


  function scheduleRefresh(delay = 180) {
    if (refreshTimer) clearTimeout(refreshTimer);
    refreshTimer = window.setTimeout(() => {
      refreshTimer = 0;
      try { syncVisibleListLocations(); } catch (error) {}
      if (getProductIdFromRoute()) {
        try { syncEditPanel(); } catch (error) {}
      } else if (isProductListRoute()) {
        try { requestAutomaticMigration(); } catch (error) {}
      }
      try { processOnePendingBarcodeRequest(); } catch (error) {}
    }, delay);
  }

  function queueProductEditPanelMount() {
    if (productEditMountTimer) window.clearTimeout(productEditMountTimer);
    productEditMountTimer = 0;
    productEditMountToken += 1;

    const editRoute = String(location.hash || '');
    if (!getProductIdFromRoute()) return;
    watchProductEditPanelMount();
    const mountToken = productEditMountToken;
    const tryMount = attempt => {
      if (mountToken !== productEditMountToken) return;
      if (String(location.hash || '') !== editRoute || !getProductIdFromRoute()) return;
      if (document.getElementById(PANEL_ID)) return;
      try { syncEditPanel(); } catch (error) {}
      if (document.getElementById(PANEL_ID) || attempt >= PRODUCT_EDIT_MOUNT_MAX_ATTEMPTS) return;
      productEditMountTimer = window.setTimeout(() => tryMount(attempt + 1), PRODUCT_EDIT_MOUNT_RETRY_MS);
    };
    tryMount(1);
  }

  function stopProductEditPanelMountWatch() {
    if (productEditMountObserver) productEditMountObserver.disconnect();
    if (productEditMountObserverTimer) window.clearTimeout(productEditMountObserverTimer);
    if (productEditMountWatchTimer) window.clearTimeout(productEditMountWatchTimer);
    productEditMountObserver = null;
    productEditMountObserverTimer = 0;
    productEditMountWatchTimer = 0;
    productEditMountWatchRoute = '';
  }

  // Comeca ainda no clique da grade. Assim a extensao nao depende de a SPA
  // trocar a rota nos primeiros 700 ms, que varia conforme o cadastro aberto.
  function startProductEditTransitionWatch() {
    if (!isProductListRoute()) return;
    stopProductEditPanelMountWatch();
    const observeTarget = document.body;
    if (!observeTarget || typeof MutationObserver !== 'function') return;

    productEditMountObserver = new MutationObserver(() => {
      if (!getProductIdFromRoute()) return;
      queueProductEditPanelMount();
    });
    productEditMountObserver.observe(observeTarget, { childList: true, subtree: true });
    productEditMountWatchTimer = window.setTimeout(stopProductEditPanelMountWatch, PRODUCT_EDIT_MOUNT_WATCH_MS);
  }

  // O ZWeb reutiliza a pagina ao abrir pelo grid e pode reconstruir somente o
  // formulario depois do hashchange. Esta vigia e limitada ao cadastro aberto,
  // expira em doze segundos e nunca observa a grade de produtos.
  function watchProductEditPanelMount() {
    const editRoute = String(location.hash || '');
    if (!getProductIdFromRoute()) {
      stopProductEditPanelMountWatch();
      return;
    }
    if (productEditMountObserver && productEditMountWatchRoute === editRoute) return;
    stopProductEditPanelMountWatch();

    // O proprio z_app_content_container pode ser trocado pela SPA. Observar o
    // body por uma janela curta permite perceber essa troca, mas a vigia so
    // existe enquanto este cadastro especifico esta terminando de abrir.
    const observeTarget = document.body;
    if (!observeTarget || typeof MutationObserver !== 'function') return;
    productEditMountWatchRoute = editRoute;
    productEditMountObserver = new MutationObserver(() => {
      if (String(location.hash || '') !== editRoute || !getProductIdFromRoute()) {
        stopProductEditPanelMountWatch();
        return;
      }
      if (productEditMountObserverTimer) return;
      productEditMountObserverTimer = window.setTimeout(() => {
        productEditMountObserverTimer = 0;
        try { syncEditPanel(); } catch (error) {}
      }, 60);
    });
    productEditMountObserver.observe(observeTarget, { childList: true, subtree: true });
    productEditMountWatchTimer = window.setTimeout(stopProductEditPanelMountWatch, PRODUCT_EDIT_MOUNT_WATCH_MS);
  }

  function loadFeatureState() {
    chrome.storage.local.get(FEATURE_DEFAULTS, stored => {
      featureEnabled = stored[FEATURE_KEY] !== false;
      queueProductEditPanelMount();
      scheduleRefresh(0);
      window.setTimeout(requestAutomaticMigration, 700);
      processOnePendingBarcodeRequest();
      requestShelfBatchCheck();
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    queueProductEditPanelMount();
    scheduleRefresh(0);
  });
  window.addEventListener('hashchange', () => {
    queueProductEditPanelMount();
    scheduleRefresh(160);
    requestShelfBatchCheck();
  });
  window.addEventListener('popstate', queueProductEditPanelMount);
  window.addEventListener('focus', () => processOnePendingBarcodeRequest(true));
  window.addEventListener('focus', requestShelfBatchCheck);
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) processOnePendingBarcodeRequest(true);
    if (!document.hidden) requestShelfBatchCheck();
  });
  document.addEventListener('click', event => {
    if (isProductListRoute()) {
      const openButton = event.target && event.target.closest && event.target.closest('button[aria-label="Abrir"], a[aria-label="Abrir"]');
      if (openButton) {
        startProductEditTransitionWatch();
      }
    }
    const button = event.target && event.target.closest && event.target.closest('button.btn-primary');
    if (button === findNativeSaveButton()) saveLocationFromNativeSave();
  }, true);
  document.addEventListener('pointerover', event => {
    if (!featureEnabled || !isProductListRoute()) return;
    const structure = getListStructure();
    const row = event.target && event.target.closest && event.target.closest('.table-row, tr');
    if (!structure || !row || row === structure.row) return;
    const codeCell = row.children[structure.codeIndex];
    const descriptionCell = row.children[structure.descriptionIndex];
    const code = String(codeCell && codeCell.textContent || '').trim();
    if (!code || !descriptionCell) return;
    const description = String(descriptionCell.textContent || '').trim();
    if (quickViewerProduct && quickViewerProduct.code === code && quickViewerProduct.description === description) return;
    quickViewerProduct = { code, description };
    requestQuickViewerLocation(code);
    updateQuickViewer();
  }, true);
  chrome.storage.onChanged.addListener((changes, areaName) => {
    if (areaName === 'local' && changes[FEATURE_KEY]) {
      featureEnabled = changes[FEATURE_KEY].newValue !== false;
      queueProductEditPanelMount();
      scheduleRefresh(0);
    }
  });
  // Marca de carga: diz na hora se o Chrome pegou a versao nova dos arquivos,
  // em vez de deixar a duvida entre "codigo velho" e "codigo novo que desistiu".
  try {
    console.info(`[zweb] enderecamento carregado — extensao ${chrome.runtime.getManifest().version}.`);
  } catch (error) {}
  loadFeatureState();
})();
