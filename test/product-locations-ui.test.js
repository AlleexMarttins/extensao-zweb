const test = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { join } = require('node:path');
const vm = require('node:vm');

const PRODUCT_PUT_API_URL_LITERAL = 'inventory.put-product';
const source = readFileSync(join(__dirname, '..', 'extension', 'setores', 'produtos', 'product-locations.js'), 'utf8');

test('enderecamento usa uma faixa propria sem alterar a grade nem fazer consulta periodica', () => {
  assert.equal(source.includes('setInterval('), false);
  assert.equal(source.includes('insertAdjacentElement(\'afterend\', panel)'), true);
  assert.equal(source.includes("QUICK_VIEWER_ID = 'zweb-product-location-quick-viewer'"), true);
  assert.equal(source.includes("title.textContent = 'Endereçamento'"), true);
  assert.equal(source.includes("document.addEventListener('pointerover'"), true);
  assert.equal(source.includes('function requestQuickViewerLocation(productCode)'), true);
  assert.equal(source.includes("Nao foi possivel consultar o enderecamento."), true);
  assert.equal(source.includes("'position:fixed'"), true);
  assert.equal(source.includes('document.body.appendChild(viewer)'), true);
  assert.equal(source.includes("QUICK_VIEWER_POSITION_KEY = 'zwebProductLocationQuickViewerPosition'"), true);
  assert.equal(source.includes("viewer.addEventListener('pointerdown'"), true);
  assert.equal(source.includes("chrome.storage.local.set({ [QUICK_VIEWER_POSITION_KEY]"), true);
  assert.equal(source.includes("productValue.style.color = '#f8fafc'"), true);
  assert.equal(source.includes('MAX_QUICK_VIEWER_DESCRIPTION_LENGTH = 46'), true);
  assert.equal(source.includes("locationValue.style.color = '#8bd3ff'"), true);
  assert.equal(source.includes("data-product-location-quick-location"), true);
  assert.equal(source.includes('function isTransientMessagePortError(error)'), true);
  assert.equal(source.includes("method === 'GET' && attempt === 0 && isTransientMessagePortError(error)"), true);
  assert.equal(source.includes('window.setTimeout(() => dispatch(1), 250)'), true);
  assert.equal(source.includes('descriptionCell.insertAdjacentElement(\'afterend\', locationCell)'), false);
  assert.equal(source.includes("document.querySelectorAll('.table-row, tr')"), true);
  assert.equal(source.includes("findProductField('observation')"), true);
});

test('a grade consulta o local somente na interacao do usuario e limita o cache da aba', () => {
  assert.equal(source.includes('const MAX_VISIBLE_LOCATION_CACHE_ENTRIES = 180;'), true);
  assert.equal(source.includes('function setVisibleLocationCache(productCode, entry)'), true);
  assert.equal(source.includes('while (visibleLocationCache.size > MAX_VISIBLE_LOCATION_CACHE_ENTRIES)'), true);

  const listSync = source.slice(source.indexOf('async function syncVisibleListLocations()'), source.indexOf('function scheduleRefresh('));
  assert.equal(listSync.includes('getVisibleProductRows('), false, 'a grade nao pode varrer as linhas a cada mutacao');
  assert.equal(listSync.includes('/by-codes?productCodes='), false, 'a grade nao pode pre-carregar locais');

  assert.equal(source.includes('function queueProductEditPanelMount()'), true);
  assert.equal(source.includes('const PRODUCT_EDIT_MOUNT_RETRY_MS = 250;'), true);
  assert.equal(source.includes('const PRODUCT_EDIT_MOUNT_MAX_ATTEMPTS = 32;'), true);
  assert.equal(source.includes('if (document.getElementById(PANEL_ID)) return;'), true);
  assert.equal(source.includes('function watchProductEditPanelMount()'), true);
  assert.equal(source.includes('function startProductEditTransitionWatch()'), true);
  assert.equal(source.includes('const PRODUCT_EDIT_MOUNT_WATCH_MS = 12_000;'), true);
  assert.equal(source.includes('const observeTarget = document.body;'), true);
  assert.equal(source.includes('productEditMountObserver.observe(observeTarget, { childList: true, subtree: true });'), true);
  assert.equal(source.includes('window.setTimeout(stopProductEditPanelMountWatch, PRODUCT_EDIT_MOUNT_WATCH_MS)'), true);
  assert.equal(source.includes('if (isProductListRoute()) {'), true);
  assert.equal(source.includes("closest('button[aria-label=\"Abrir\"], a[aria-label=\"Abrir\"]')"), true);
  assert.equal(source.includes('startProductEditTransitionWatch();'), true);
  assert.equal(source.includes('window.setTimeout(queueProductEditPanelMount, 700)'), false, 'a transicao nao pode depender de tres tentativas que acabam antes da SPA terminar');
});

test('a transferencia guarda antes de limpar e confere o retorno do ZWeb', () => {
  const saveAt = source.indexOf('/api/zweb/product-locations/${encodeURIComponent(item.productId)}');
  const clearAt = source.indexOf("product.observation = ''");
  const verifyAt = source.indexOf('const verified = await fetchProductDetail(item.productId)');
  assert.ok(saveAt >= 0);
  assert.ok(clearAt > saveAt);
  assert.ok(verifyAt > clearAt);
  assert.equal(source.includes("/^0x0{3,}/i.test(text.trim())"), true);
  assert.equal(source.includes("product-location-import-runs/latest?source=zweb-observation"), true);
  assert.equal(source.includes('if (!resumed)'), true);
});

test('a extensao atualiza somente o produto aberto, sem percorrer o estoque para o coletor', () => {
  assert.equal(source.includes('function syncProductCatalog()'), false);
  assert.equal(source.includes('function requestAutomaticCatalogSync()'), false);
  assert.equal(source.includes("'/api/zweb/product-catalog/status', 'GET'"), false);
  assert.equal(source.includes('function syncCatalogItemFromScreen(meta)'), true);
  assert.equal(source.includes('const catalogProductId = Number(meta.productId);'), true);
  assert.equal(source.includes('if (!Number.isSafeInteger(catalogProductId) || catalogProductId <= 0) return;'), true);
  assert.equal(source.includes('productId: catalogProductId,'), true);
  const catalogSync = source.slice(source.indexOf('function syncCatalogItemFromScreen(meta)'), source.indexOf('function setPanelMessage('));
  assert.equal(catalogSync.includes("catalogScreenSignature = '';"), false, 'uma recusa local nao pode rearmar repeticoes na mesma tela');
});

test('o campo acompanha os campos nativos e nao tem botao proprio', () => {
  assert.equal(source.includes("caption.textContent = 'Endereçamento';"), true);
  assert.equal(source.includes("panel.className = 'col-md-3';"), true);
  assert.equal(source.includes("group.className = 'position-relative form-group';"), true);
  assert.equal(source.includes("wrapper.className = 'input-wrapper';"), true);
  assert.equal(source.includes('data-product-location-save'), false, 'o painel nao tem mais botao proprio');
  assert.equal(source.includes("saveButton"), false);
  // A altura vem do estilo inline do campo nativo, nunca de um valor fixo aqui.
  assert.equal(source.includes("reference.getAttribute('style')"), true);
  assert.equal(/height:\s*30/.test(source), false, 'a altura nao pode ser fixada no codigo');
});

test('o campo aceita a marcacao nova do formulario de produto', () => {
  const routeParser = source.slice(source.indexOf('function getProductIdFromRoute()'), source.indexOf('function isTransientMessagePortError'));
  assert.equal(routeParser.includes('([^/?#]+)'), true, 'a rota de edicao aceita o UUID atual do ZWeb');
  assert.equal(routeParser.includes('(\\d+)'), false, 'a rota nao pode aceitar somente IDs numericos');
  assert.equal(source.includes("document.querySelector('[name=\"product.sequence\"], [name=\"sequence\"]')"), true);
  assert.equal(source.includes("document.querySelector('[name=\"product.description\"], [name=\"description\"]')"), true);
  assert.equal(source.includes("textarea[id*=\"observation\"], textarea[name*=\"observation\"], textarea"), true);
  assert.equal(source.includes("normalizeText(label.textContent) === 'observacoes'"), true);
  assert.equal(source.includes("function findProductInputByLabel(labelName)"), true);
  assert.equal(source.includes("findProductInputByLabel('codigo')"), true);
  assert.equal(source.includes("findProductInputByLabel('descricao')"), true);
});

test('o campo do cadastro nao depende do interruptor usado pela grade', () => {
  const syncEditPanel = source.slice(
    source.indexOf('async function syncEditPanel()'),
    source.indexOf('function getListStructure()')
  );

  assert.equal(syncEditPanel.includes('if (!featureEnabled || !meta)'), false);
  assert.equal(syncEditPanel.includes('if (!meta) {'), true);
  assert.equal(syncEditPanel.includes("anchor.insertAdjacentElement('afterend', panel)"), true);
  assert.equal(source.includes('featureEnabled = changes[FEATURE_KEY].newValue !== false;\n      queueProductEditPanelMount();'), true);
});

test('monta o campo no formulario real mesmo quando a preferencia antiga esta desligada', async () => {
  const elementsById = new Map();

  class Element {
    constructor(tagName) {
      this.tagName = tagName;
      this.children = [];
      this.attributes = new Map();
      this.style = {};
      this.parentElement = null;
      this.previousElementSibling = null;
      this.value = '';
      this.textContent = '';
      this.className = '';
    }

    set id(value) {
      this.attributes.set('id', value);
      elementsById.set(value, this);
    }

    get id() {
      return this.attributes.get('id') || '';
    }

    setAttribute(name, value) {
      this.attributes.set(name, String(value));
      if (name === 'id') elementsById.set(String(value), this);
    }

    getAttribute(name) {
      return this.attributes.get(name) || null;
    }

    appendChild(child) {
      child.parentElement = this;
      this.children.push(child);
      return child;
    }

    append(...children) {
      children.forEach(child => this.appendChild(child));
    }

    closest() {
      return this.parentElement || this;
    }

    insertAdjacentElement(position, child) {
      assert.equal(position, 'afterend');
      child.previousElementSibling = this;
      child.parentElement = this.parentElement;
      elementsById.set(child.id, child);
      return child;
    }

    querySelector(selector) {
      const matches = element => {
        if (selector === '[data-product-location-input]') return element.getAttribute('data-product-location-input') === 'true';
        if (selector === '[data-product-location-status]') return element.getAttribute('data-product-location-status') === 'true';
        return false;
      };
      for (const child of this.children) {
        if (matches(child)) return child;
        const nested = child.querySelector(selector);
        if (nested) return nested;
      }
      return null;
    }
  }

  const formRow = new Element('div');
  const code = new Element('input');
  code.value = '1';
  code.id = 'product.sequence';
  const description = new Element('input');
  description.value = 'Produto de teste';
  description.id = 'product.description';
  const observation = new Element('textarea');
  observation.id = 'observation';
  observation.parentElement = formRow;
  const reference = new Element('input');
  reference.id = 'product.reference';
  elementsById.set(code.id, code);
  elementsById.set(description.id, description);
  elementsById.set(observation.id, observation);
  elementsById.set(reference.id, reference);

  const document = {
    hidden: false,
    body: new Element('body'),
    addEventListener() {},
    createElement(tagName) { return new Element(tagName); },
    getElementById(id) { return elementsById.get(id) || null; },
    querySelector(selector) {
      if (selector === '#productGeneralData input.form-control[style*="height"]') return null;
      return null;
    },
    querySelectorAll(selector) {
      if (selector === 'label' || selector === '#z_app_content_container button.btn-primary' || selector === '.table-row, tr') return [];
      return [];
    }
  };
  const chrome = {
    runtime: {
      getManifest: () => ({ version: 'test' }),
      sendMessage(_message, callback) { callback({ ok: true, payload: { location: '' } }); },
      lastError: null
    },
    storage: {
      local: {
        get(_defaults, callback) { callback({ productLocationsEnabled: false }); },
        set() {}
      },
      onChanged: { addListener() {} }
    }
  };
  const window = {
    innerWidth: 1280,
    innerHeight: 720,
    addEventListener() {},
    setTimeout() { return 1; },
    clearTimeout() {}
  };

  vm.runInNewContext(source, {
    chrome,
    console: { info() {}, warn() {} },
    document,
    location: {
      href: 'https://zweb.com.br/#/register/stock/product/edit/e27acdda-31d5-41a2-996f-403b4d172bc5',
      hash: '#/register/stock/product/edit/e27acdda-31d5-41a2-996f-403b4d172bc5'
    },
    window,
    encodeURIComponent,
    Map,
    Promise,
    String,
    Number,
    Date,
    Array,
    Object,
    Math,
    RegExp,
    Error
  });
  await new Promise(resolve => setImmediate(resolve));

  const panel = elementsById.get('zweb-product-location-panel');
  assert.ok(panel, 'o painel precisa ser criado quando os campos nativos ja existem');
  assert.equal(panel.querySelector('[data-product-location-input]').tagName, 'input');
});

test('o enderecamento e gravado pelo Salvar do proprio ZWeb', () => {
  assert.equal(source.includes("document.querySelectorAll('#z_app_content_container button.btn-primary')"), true);
  assert.equal(source.includes('if (button === findNativeSaveButton()) saveLocationFromNativeSave();'), true);
  // Sem alteracao no campo, o clique em Salvar nao gera gravacao.
  assert.equal(source.includes('if (location === panelLoadedLocation) return;'), true);
});

test('o salvamento do produto nao envia dados para o projeto de coletor desativado', () => {
  assert.equal(source.includes('function refreshCatalogForProduct('), false);
  assert.equal(source.includes('function watchEditedProduct('), false);
  assert.equal(source.includes('Sincronizacao do catalogo interrompida'), false);
});

test('uma recarga da extensao nao marca codigo de barras como falha', () => {
  assert.equal(source.includes('function isExtensionContextInvalidated(error)'), true);
  assert.equal(source.includes("if (isExtensionContextInvalidated(error))"), true);
  assert.equal(source.includes("codigo de barras aguardando a extensao recarregada"), true);
});

test('o codigo de barras usa uma fila de um item e confirma a gravacao no ZWeb', () => {
  assert.equal(source.includes("product-barcode-requests/pending?limit=1"), true);
  assert.equal(source.includes("guard.canRun('productBarcodeWrite')"), true);
  assert.equal(source.includes("postNativeProductApi(PRODUCT_PUT_API_URL, product, 'productBarcodeWrite')"), true);
  assert.equal(source.includes("fetchProductDetail(pendingRequest.productId, 'productBarcodeWrite')"), true);
  assert.equal(source.includes('applyPendingBarcodeRequests'), false);
  assert.equal(source.includes('Promise.all('), false);
  assert.equal(source.includes(PRODUCT_PUT_API_URL_LITERAL), true);
});

test('o catalogo do coletor e alimentado sem nenhuma chamada ao ZWeb', () => {
  // O codigo de barras vem do campo ja renderizado na tela do produto.
  assert.equal(source.includes("const campo = findProductField('product.barCode');"), true);
  assert.equal(source.includes('barcode: readProductBarcodeFromScreen(),'), true);
  // E vai junto do enderecamento, sem requisicao propria.
  const leituraAt = source.indexOf('barcode: readProductBarcodeFromScreen(),');
  const envioAt = source.indexOf("sendInternalRequest(`/api/zweb/product-locations/");
  assert.ok(envioAt >= 0 && leituraAt > envioAt);
});

test('a varredura em massa nao volta, nem como funcao nova nem pelo caminho antigo', () => {
  for (const proibido of [
    'function syncProductCatalog(',
    'function requestAutomaticCatalogSync(',
    'function refreshCatalogForProduct(',
    'function watchEditedProduct('
  ]) {
    assert.equal(source.includes(proibido), false, `${proibido} nao pode existir`);
  }

  // A paginacao antiga continua no arquivo, porem morta: a constante esta
  // desligada e guarda os dois pontos de entrada. Se alguem religar, este
  // teste falha e a decisao volta a ser explicita.
  assert.equal(source.includes('const AUTOMATIC_MIGRATION_ENABLED = false;'), true);
  const guardas = source.match(/if \(!AUTOMATIC_MIGRATION_ENABLED\) return;/g) || [];
  assert.equal(guardas.length, 2, 'a varredura e a chamada automatica precisam das duas guardas');

  // A unica paginacao do arquivo e a que esta atras dessa guarda.
  assert.equal((source.match(/get-product-paginate/g) || []).length, 1);
});

test('esvaziar o campo e salvar remove o enderecamento, em vez de nao fazer nada', () => {
  assert.equal(source.includes("/remove`, 'POST'"), true);
  // So pede remocao se havia algo gravado; campo vazio em produto sem endereco
  // nao gera chamada nenhuma.
  assert.equal(source.includes('if (!panelLoadedLocation) return;'), true);
  // O rotulo da lista nao pode continuar mostrando o local removido.
  assert.equal(source.includes('visibleLocationCache.delete(meta.productCode);'), true);
  // Sem alteracao no campo, salvar o produto nao mexe no enderecamento.
  assert.equal(source.includes('if (location === panelLoadedLocation) return;'), true);
});

// Regressao: os titulos da grade do ZWeb vem acentuados ("Codigo", "Descricao").
// Comparar sem tirar o acento devolvia -1 nos dois indices, getListStructure
// saia com null e a lista ficava sem nenhum rotulo de local.
test('normalizeText casa os titulos acentuados da grade', () => {
  const trecho = source.match(/function normalizeText\(value\) \{[\s\S]*?\n  \}/);
  assert.ok(trecho, 'normalizeText nao encontrada');
  const normalizeText = new Function(`return (${trecho[0]})`)();

  assert.equal(normalizeText('Código'), 'codigo');
  assert.equal(normalizeText(' Descrição '), 'descricao');
  assert.equal(normalizeText('Preço R$'), 'preco r$');

  const titulosReais = ['', 'Código', 'Descrição', 'Quantidade', 'Preço R$', 'Custo R$'];
  const titulos = titulosReais.map(normalizeText);
  assert.equal(titulos.findIndex(t => t === 'codigo'), 1);
  assert.equal(titulos.findIndex(t => t === 'descricao'), 2);
});
