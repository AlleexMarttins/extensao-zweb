const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const read = file => fs.readFileSync(require.resolve(file),'utf8');
test('exemplo publico nao inclui credenciais e protecao nao aceita senha vazia',()=>{
  const c=vm.createContext({});
  vm.runInContext(read('../extension/nucleo/installation-config.example.js'),c);
  assert.equal(c.ZWEB_LOCAL_SETTINGS.internalServiceKey,'');
  assert.equal(c.ZWEB_LOCAL_SETTINGS.productAdminPassword,'');
  const content=read('../extension/nucleo/content.js');
  assert.match(content,/if \(PRODUCT_ADMIN_PASSWORD && password === PRODUCT_ADMIN_PASSWORD\)/);
  assert.doesNotMatch(content,/PRODUCT_ADMIN_PASSWORD\s*=\s*'[^']+'/);
  assert.doesNotMatch(read('../extension/nucleo/background.js'),/ZWEB_INTERNAL_SERVICE_KEY\s*=\s*'[^']+'/);
});
test('configuracao privada e carregada pelo worker sem ser exigida no pacote publico',()=>{
  const background=read('../extension/nucleo/background.js');
  const preamble=background.slice(0,background.indexOf('const XML_DOWNLOAD_TTL_MS'));
  let loaded=false;
  const c=vm.createContext({importScripts(path){if(path==='installation-config.local.js')loaded=true;}});
  vm.runInContext(preamble,c);
  assert.equal(loaded,true);
  const missing=vm.createContext({importScripts(){throw new Error('Ausente');}});
  assert.doesNotThrow(()=>vm.runInContext(preamble,missing));
});
