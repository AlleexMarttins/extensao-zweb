const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const { chromium } = require('playwright');
const read = p => fs.readFileSync(require.resolve(p), 'utf8');
const features = read('../extension/nucleo/features.js');
const content = read('../extension/nucleo/content.js');
const locations = read('../extension/setores/produtos/product-locations.js');
const extract = (source, start, end) => source.slice(source.indexOf(start), source.indexOf(end, source.indexOf(start) + start.length));
test('mudanca parcial preserva escolhas anteriores e remocao restaura o padrao', () => {
  const c = vm.createContext({syncPageBridgeFeatureFlags() {}});
  vm.runInContext(features, c);
  c.FEATURE_DEFAULTS = c.ZWEB_FEATURES.getDefaults();
  c.FEATURE_STATE = {...c.FEATURE_DEFAULTS,enabled:false,filterEnabled:false,autoCaixaDavWatcherEnabled:true};
  vm.runInContext(extract(content,'  function applyFeatureState(','  function syncPageBridgeFeatureFlags('), c);
  c.applyFeatureState({batchEnabled:false});
  assert.equal(c.FEATURE_STATE.enabled,false);
  assert.equal(c.FEATURE_STATE.filterEnabled,false);
  assert.equal(c.FEATURE_STATE.batchEnabled,false);
  c.applyFeatureState({autoCaixaDavWatcherEnabled:undefined});
  assert.equal(c.FEATURE_STATE.autoCaixaDavWatcherEnabled,false);
});
test('operacoes suspensas nao podem ser ligadas no catalogo, mesmo com preferencia antiga', () => {
  const c = vm.createContext({});
  vm.runInContext(features,c);
  for (const key of ['productPreviewEnabled','nfeCloneAssistEnabled']) {
    const feature = c.ZWEB_FEATURES.definitions.find(f=>f.key===key);
    assert.equal(feature.forceDisabled,true);
    assert.ok(feature.disabledReason);
    assert.equal(c.ZWEB_FEATURES.normalizeState({[key]:true})[key],false);
  }
  assert.equal(c.ZWEB_RUNTIME_GUARDS.canRun('productRangeRead'),false);
  assert.equal(c.ZWEB_RUNTIME_GUARDS.canRun('davClone'),false);
});
test('contexto invalidado na ponte nao quebra navegacao nem repete getURL', () => {
  let calls=0, warnings=0, removals=0, inserts=0;
  const c=vm.createContext({
    chrome:{runtime:{getURL(){calls++;throw new Error('Extension context invalidated.');}}},
    console:{warn(){warnings++;}},
    document:{documentElement:{dataset:{}},head:{appendChild(){inserts++;}},getElementById(){return {remove(){removals++;}};}},
    shouldUsePageBridge:()=>true,
    XML_BRIDGE_SCRIPT_ID:'fixture',XML_BRIDGE_VERSION:'fixture',EXTENSION_MODAL_BRIDGE_VERSION:'fixture'
  });
  vm.runInContext(extract(content,'  let EXTENSION_RUNTIME_INVALIDATED','  function sendRuntimeMessage('),c);
  vm.runInContext(extract(content,'  function ensurePageBridge(','  function forwardXmlBridgePayload('),c);
  vm.runInContext(extract(content,'  function ensureExtensionModalBridge(','  function ensureExtensionModalBridgeListener('),c);
  assert.doesNotThrow(()=>{c.ensurePageBridge();c.ensureExtensionModalBridge();c.ensurePageBridge();});
  assert.equal(calls,1);assert.equal(warnings,1);assert.equal(removals,0);assert.equal(inserts,0);
});
test('Chrome local: preferencias rapidas, reabertura e limpeza da faixa', async () => {
  const browser=await chromium.launch({headless:true,channel:'chrome'});
  try {
    const page=await browser.newPage();
    let requests=0;
    await page.route('**/*',route=>{requests++;return route.abort();});
    await page.setContent('<div id="featureGroups"></div><p id="featureStatus"></p><button id="reload"></button>');
    await page.evaluate(()=>{
      window.state={};window.confirm=()=>false;
      window.chrome={runtime:{},storage:{local:{
        get(defaults,cb){const snapshot={...defaults,...state};setTimeout(()=>cb(snapshot),20);},
        set(next,cb){setTimeout(()=>{state={...state,...next};cb();},20);}
      }},tabs:{query:(_,cb)=>cb([])}};
    });
    await page.addScriptTag({content:features});
    await page.addScriptTag({content:read('../extension/ui/popup.js')});
    await page.evaluate(()=>document.dispatchEvent(new Event('DOMContentLoaded')));
    await page.waitForTimeout(50);
    await page.evaluate(()=>{
      for(const key of ['enabled','filterEnabled']) {const input=document.getElementById('feature-'+key);input.checked=false;input.dispatchEvent(new Event('change',{bubbles:true}));}
    });
    await page.waitForTimeout(100);
    assert.deepEqual(await page.evaluate(()=>({enabled:state.enabled,filterEnabled:state.filterEnabled})),{enabled:false,filterEnabled:false});
    await page.evaluate(()=>{
      chrome.storage.local.set=(_,cb)=>{chrome.runtime.lastError={message:'Falha de fixture'};cb();delete chrome.runtime.lastError;};
      const input=document.getElementById('feature-enabled');input.checked=true;input.dispatchEvent(new Event('change',{bubbles:true}));
    });
    assert.equal(await page.locator('#feature-enabled').isChecked(),false);
    assert.equal(await page.locator('#feature-enabled').isEnabled(),true);
    assert.equal(await page.locator('#featureStatus').textContent(),'Não foi possível salvar a opção.');

    await page.setContent('<div id="modal" class="modal" style="display:none"></div><div id="backdrop" class="modal-backdrop" style="display:none"></div>');
    await page.evaluate(()=>window.EXTENSION_DIALOG_TRANSITION_MS=30);
    await page.addScriptTag({content:extract(content,'  function showExtensionNativeModal(','  function closeCommissionReportConfirmModal(')});
    await page.evaluate(()=>{const m=document.getElementById('modal'),b=document.getElementById('backdrop');showExtensionNativeModal(m,b);hideExtensionNativeModal(m,b);showExtensionNativeModal(m,b);});
    await page.waitForTimeout(60);
    assert.equal(await page.locator('#modal').evaluate(el=>el.style.display),'block');
    assert.equal(await page.locator('#backdrop').evaluate(el=>el.style.display),'block');

    await page.setContent('<section id="viewer">Local anterior</section>');
    await page.evaluate(()=>{
      window.featureEnabled=false;window.isProductListRoute=()=>true;window.QUICK_VIEWER_ID='viewer';window.quickViewerProduct={code:'1'};
      window.ensureQuickViewer=()=>{};window.updateQuickViewer=()=>{};
    });
    await page.addScriptTag({content:extract(locations,'  async function syncVisibleListLocations(','  function scheduleRefresh(')});
    await page.evaluate(()=>syncVisibleListLocations());
    assert.equal(await page.locator('#viewer').count(),0);
    assert.equal(await page.evaluate(()=>quickViewerProduct),null);
    await page.evaluate(()=>{featureEnabled=true;window.isProductListRoute=()=>false;document.body.innerHTML='<section id="viewer">Local anterior</section>';});
    await page.evaluate(()=>syncVisibleListLocations());
    assert.equal(await page.locator('#viewer').count(),0);
    assert.equal(requests,0);
  } finally {await browser.close();}
});
