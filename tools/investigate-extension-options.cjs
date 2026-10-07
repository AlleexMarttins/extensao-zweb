// Investigacao local somente: nao abre ZWeb nem usa perfil autenticado.
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { chromium } = require('playwright');
const root = path.join(__dirname, '..');
const read = p => fs.readFileSync(path.join(root, p), 'utf8');
const features = read('extension/nucleo/features.js');
const content = read('extension/nucleo/content.js');
const locations = read('extension/setores/produtos/product-locations.js');
const extract = (source, start, end) => {
  const at = source.indexOf(start);
  const stop = source.indexOf(end, at + start.length);
  if (at < 0 || stop < 0) throw new Error('Fixture de funcao desatualizada: ' + start);
  return source.slice(at, stop);
};
const results = [];
function record(id, priority, expected, observed) {
  results.push({ id, priority, expected, observed, status: JSON.stringify(expected) === JSON.stringify(observed) ? 'OK' : 'FALHA' });
}
async function main() {
  const context = vm.createContext({syncPageBridgeFeatureFlags() {}});
  vm.runInContext(features, context);
  context.FEATURE_DEFAULTS = context.ZWEB_FEATURES.getDefaults();
  context.FEATURE_STATE = {...context.FEATURE_DEFAULTS, enabled: false, filterEnabled: false};
  vm.runInContext(extract(content, '  function applyFeatureState(', '  function syncPageBridgeFeatureFlags('), context);
  context.applyFeatureState({batchEnabled:false});
  record('estado-parcial-preserva-protecao-e-filtro', 'alta', {enabled:false,filterEnabled:false,batchEnabled:false}, {enabled:context.FEATURE_STATE.enabled,filterEnabled:context.FEATURE_STATE.filterEnabled,batchEnabled:context.FEATURE_STATE.batchEnabled});

  vm.runInContext(extract(content, '  function isFiscalCloneAssistEnabledForCurrentRoute(', '  function findFiscalCloneActionTrigger('), context);
  Object.assign(context, {isTargetDavCloneBlockRoute:()=>false,isCloneActionBlockRoute:()=>false,isTargetNfeRoute:()=>true,isTargetNfceListRoute:()=>false,isFeatureEnabled:()=>true});
  const cloneFeature = context.ZWEB_FEATURES.definitions.find(feature => feature.key === 'nfeCloneAssistEnabled');
  const rangeFeature = context.ZWEB_FEATURES.definitions.find(feature => feature.key === 'productPreviewEnabled');
  record('clone-suspenso-nao-e-oferecido-como-ativavel', 'media', true, cloneFeature.forceDisabled === true && !!cloneFeature.disabledReason && context.isFiscalCloneAssistEnabledForCurrentRoute() === false);
  record('faixa-suspensa-nao-e-oferecida-como-ativavel', 'media', true, rangeFeature.forceDisabled === true && !!rangeFeature.disabledReason && context.ZWEB_RUNTIME_GUARDS.canRun('productRangeRead') === false);

  const browser = await chromium.launch({headless:true,channel:'chrome'});
  try {
    const page = await browser.newPage();
    let networkAttempts = 0;
    await page.route('**/*', route => { networkAttempts++; return route.abort(); });
    await page.setContent('<section id="viewer">Local anterior</section>');
    await page.evaluate(() => {
      window.featureEnabled = false;
      window.isProductListRoute = () => true;
      window.QUICK_VIEWER_ID = 'viewer';
      window.ensureQuickViewer = () => document.getElementById('viewer');
      window.updateQuickViewer = () => {};
    });
    await page.addScriptTag({content:extract(locations, '  async function syncVisibleListLocations(', '  function scheduleRefresh(')});
    await page.evaluate(() => syncVisibleListLocations());
    record('desligar-enderecamento-retira-faixa', 'media', false, await page.locator('#viewer').isVisible());

    await page.setContent('<div id="modal" class="modal" style="display:none"></div><div id="backdrop" class="modal-backdrop" style="display:none"></div>');
    await page.evaluate(() => window.EXTENSION_DIALOG_TRANSITION_MS = 30);
    await page.addScriptTag({content:extract(content, '  function showExtensionNativeModal(', '  function closeCommissionReportConfirmModal(')});
    await page.evaluate(() => {
      const modal = document.getElementById('modal'), backdrop = document.getElementById('backdrop');
      showExtensionNativeModal(modal, backdrop);
      hideExtensionNativeModal(modal, backdrop);
      showExtensionNativeModal(modal, backdrop);
    });
    await page.waitForTimeout(60);
    record('reabrir-aviso-durante-fechamento-mantem-visivel', 'media', 'block', await page.locator('#modal').evaluate(el => el.style.display));

    await page.setContent('<div id="featureGroups"></div><button id="reload"></button>');
    await page.evaluate(() => {
      window.state = {};
      window.confirm = () => false;
      window.chrome = {storage:{local:{
        get(defaults, cb) { const snapshot = {...defaults,...window.state}; setTimeout(()=>cb(snapshot),20); },
        set(next, cb) { setTimeout(()=>{ window.state={...window.state,...next}; cb(); },20); }
      }},tabs:{query:(_,cb)=>cb([])}};
    });
    await page.addScriptTag({content:features});
    await page.addScriptTag({content:read('extension/ui/popup.js')});
    await page.evaluate(()=>document.dispatchEvent(new Event('DOMContentLoaded')));
    await page.waitForTimeout(50);
    await page.evaluate(()=> {
      for (const key of ['enabled','filterEnabled']) {
        const input = document.getElementById('feature-'+key);
        input.checked = false;
        input.dispatchEvent(new Event('change',{bubbles:true}));
      }
    });
    await page.waitForTimeout(100);
    record('duas-alteracoes-rapidas-preservadas', 'alta', {enabled:false,filterEnabled:false}, await page.evaluate(()=>({enabled:state.enabled,filterEnabled:state.filterEnabled})));
    record('tentativas-de-rede-externa', 'critica', 0, networkAttempts);
  } finally { await browser.close(); }
  console.log(JSON.stringify({scope:'fixtures locais; sem alteracoes em producao',features:context.ZWEB_FEATURES.definitions.length,results},null,2));
}
main().catch(error=>{console.error(error);process.exitCode=1;});
