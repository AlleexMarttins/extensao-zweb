import test, { after, before } from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { rm } from 'node:fs/promises';

const servicePort = 8897;
const serviceKey = 'test-service-key';
const deviceKey = 'test-device-key-0123456789';
const deviceName = 'Coletor Estoque 1';
const serviceUrl = `http://127.0.0.1:${servicePort}`;
const databaseFile = './test/.mobile-product-locations.sqlite';

let service;

function serviceRequest(path, options = {}) {
  return fetch(`${serviceUrl}${path}`, {
    method: options.method || 'GET',
    headers: {
      Accept: 'application/json',
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      ...(options.headers || {})
    },
    ...(options.body ? { body: JSON.stringify(options.body) } : {})
  });
}

function withServiceKey(options = {}) {
  return { ...options, headers: { ...(options.headers || {}), 'X-Zweb-Service-Key': serviceKey } };
}

function withDeviceKey(options = {}) {
  return { ...options, headers: { ...(options.headers || {}), 'X-Zweb-Device-Key': deviceKey } };
}

async function waitForService() {
  const deadline = Date.now() + 5000;
  while (Date.now() < deadline) {
    try {
      const response = await fetch(`${serviceUrl}/health`);
      if (response.status === 503) return;
    } catch {}
    await new Promise(resolve => setTimeout(resolve, 50));
  }
  throw new Error('Serviço de teste não iniciou a tempo.');
}

before(async () => {
  await Promise.all(['', '-wal', '-shm'].map(suffix => rm(new URL(`.mobile-product-locations.sqlite${suffix}`, import.meta.url), { force: true })));
  service = spawn(process.execPath, ['src/server.js'], {
    cwd: new URL('..', import.meta.url),
    env: {
      ...process.env,
      ZWEB_PORT: String(servicePort),
      ZWEB_BIND_HOST: '127.0.0.1',
      ZWEB_INTERNAL_SERVICE_KEY: serviceKey,
      ZWEB_MOBILE_DEVICE_KEYS: `${deviceName}:${deviceKey}`,
      ZWEB_SHARED_RETURN_HISTORY_FILE: './test/.mobile-commission-returns.json',
      ZWEB_PRODUCT_LOCATION_DB: databaseFile,
      ZWEB_USERNAME: '',
      ZWEB_PASSWORD: '',
      ZWEB_COMPANY_UUID: ''
    },
    stdio: 'ignore',
    windowsHide: true
  });
  await waitForService();
});

after(() => {
  service.kill();
  service.unref();
});

test('a extensao sincroniza o catalogo de produtos com a chave do servico', async () => {
  const response = await serviceRequest('/api/zweb/product-catalog', withServiceKey({
    method: 'PUT',
    body: {
      items: [
        { productId: 171, productCode: '2000', productDescription: 'CABO PP 3X2,5', barcode: '7891234567890' },
        { productId: 172, productCode: '2001', productDescription: 'DISJUNTOR 25A' }
      ]
    }
  }));
  const body = await response.json();

  assert.equal(response.status, 200);
  assert.equal(body.items, 2);

  const statusResponse = await serviceRequest('/api/zweb/product-catalog/status', withServiceKey());
  const status = await statusResponse.json();
  assert.equal(status.items, 2);
  assert.equal(status.completedAt, null);

  const completeResponse = await serviceRequest('/api/zweb/product-catalog/complete', withServiceKey({
    method: 'POST',
    body: { items: 2 }
  }));
  assert.equal(completeResponse.status, 200);
  assert.ok((await completeResponse.json()).completedAt);
});

test('abre a sessao do coletor pela chave do aparelho, sem usuario e senha', async () => {
  const response = await serviceRequest('/api/mobile/session', withDeviceKey({ method: 'POST' }));
  const body = await response.json();

  assert.equal(response.status, 200);
  assert.equal(body.success, true);
  assert.equal(body.device, deviceName);
  assert.equal(typeof body.catalog.items, 'number');
  assert.deepEqual(body.companies.map(company => company.code), ['EH', 'MVA'], 'o coletor precisa saber quais empresas existem');
});

test('recusa o coletor sem chave de aparelho valida', async () => {
  const semChave = await serviceRequest('/api/mobile/session', { method: 'POST' });
  assert.equal(semChave.status, 401);
  assert.equal((await semChave.json()).error, 'Aparelho não autorizado.');

  const chaveInvalida = await serviceRequest('/api/mobile/session', {
    method: 'POST',
    headers: { 'X-Zweb-Device-Key': 'chave-que-nao-existe-0123456789' }
  });
  assert.equal(chaveInvalida.status, 401);
  assert.equal((await chaveInvalida.json()).error, 'Aparelho não autorizado.');
});

test('a chave do aparelho nao abre as rotas internas da extensao', async () => {
  const response = await serviceRequest('/api/zweb/product-catalog/status', withDeviceKey());
  assert.equal(response.status, 401);
});

test('a chave do servico nao substitui a identificacao do aparelho no coletor', async () => {
  const response = await serviceRequest('/api/mobile/session', withServiceKey({ method: 'POST' }));
  assert.equal(response.status, 401);
});

test('mostra a descricao do item assim que o codigo e lido', async () => {
  const response = await serviceRequest('/api/mobile/scan/resolve', withDeviceKey({
    method: 'POST',
    body: { itemCodes: ['2000', '7891234567890', '404404'] }
  }));
  const body = await response.json();

  assert.equal(response.status, 200);
  assert.deepEqual(body.items.map(item => [item.scannedCode, item.found]), [
    ['2000', true],
    ['7891234567890', true],
    ['404404', false]
  ]);
  assert.equal(body.items[0].productDescription, 'CABO PP 3X2,5');
});

test('atribui o endereco lido e relata o item ausente do catalogo', async () => {
  const response = await serviceRequest('/api/mobile/locations/assign', withDeviceKey({
    method: 'POST',
    body: { locationCode: 'Rua 2 Nivel 5 Prateleira Esquerda', itemCodes: ['2000', '2001', '404404'] }
  }));
  const body = await response.json();

  assert.equal(response.status, 200);
  assert.equal(body.success, true);
  assert.deepEqual(body.summary, {
    company: 'EH',
    totalItems: 3,
    successCount: 2,
    notFoundCount: 1,
    errorCount: 1,
    pendingSyncCount: 0,
    locationCode: 'Rua 2 Nivel 5 Prateleira Esquerda'
  });
  assert.equal(body.results[2].status, 'not_found');

  const stored = await serviceRequest('/api/zweb/product-locations/171', withServiceKey());
  const location = await stored.json();
  assert.equal(location.location, 'Rua 2 Nivel 5 Prateleira Esquerda');
  assert.equal(location.updatedBy, deviceName);
  assert.equal(location.source, 'mobile_scan');
});

test('a extensao enxerga na lista de produtos o endereco gravado pelo coletor', async () => {
  const response = await serviceRequest('/api/zweb/product-locations/by-codes?productCodes=2000,2001', withServiceKey());
  const body = await response.json();

  assert.equal(response.status, 200);
  assert.deepEqual(
    body.locations.map(item => item.location).sort(),
    ['Rua 2 Nivel 5 Prateleira Esquerda', 'Rua 2 Nivel 5 Prateleira Esquerda']
  );
});

test('recusa a atribuicao sem endereco informado', async () => {
  const response = await serviceRequest('/api/mobile/locations/assign', withDeviceKey({
    method: 'POST',
    body: { locationCode: '   ', itemCodes: ['2000'] }
  }));

  assert.equal(response.status, 400);
  assert.match((await response.json()).error, /Enderecamento/i);
});

test('o mesmo produto recebe enderecos independentes em cada empresa', async () => {
  const mva = await serviceRequest('/api/mobile/locations/assign', withDeviceKey({
    method: 'POST',
    body: { company: 'MVA', locationCode: 'RUA 7 NIVEL 2 PRAT ESQ', itemCodes: ['2000'] }
  }));
  const corpo = await mva.json();

  assert.equal(mva.status, 200);
  assert.equal(corpo.summary.company, 'MVA');
  assert.equal(corpo.summary.successCount, 1);

  // A EH nao pode ter sido tocada pelo enderecamento da MVA.
  const eh = await serviceRequest('/api/zweb/product-locations/by-codes?productCodes=2000', withServiceKey());
  assert.equal((await eh.json()).locations[0].location, 'Rua 2 Nivel 5 Prateleira Esquerda');

  const consultaMva = await serviceRequest('/api/zweb/product-locations/by-codes?productCodes=2000&company=MVA', withServiceKey());
  const locaisMva = (await consultaMva.json()).locations;
  assert.equal(locaisMva[0].location, 'RUA 7 NIVEL 2 PRAT ESQ');
  assert.equal(locaisMva[0].company, 'MVA');
});

test('a leitura mostra o endereco da empresa escolhida, nao o da outra', async () => {
  const resposta = await serviceRequest('/api/mobile/scan/resolve', withDeviceKey({
    method: 'POST',
    body: { company: 'MVA', itemCodes: ['2000'] }
  }));
  const corpo = await resposta.json();

  assert.equal(corpo.company, 'MVA');
  assert.equal(corpo.items[0].currentLocation, 'RUA 7 NIVEL 2 PRAT ESQ');
});

test('recusa uma empresa que nao esta configurada no servico', async () => {
  const resposta = await serviceRequest('/api/mobile/locations/assign', withDeviceKey({
    method: 'POST',
    body: { company: 'OUTRA', locationCode: 'RUA 1 NIVEL 1 PRAT DIR', itemCodes: ['2000'] }
  }));

  assert.equal(resposta.status, 400);
  assert.match((await resposta.json()).error, /OUTRA/);
});

test('a EH nao gera pendencia de sincronizacao, porque nao tem sistema externo', async () => {
  const resposta = await serviceRequest('/api/zweb/product-locations/pending-sync?company=EH', withServiceKey());
  const corpo = await resposta.json();

  assert.equal(resposta.status, 200);
  assert.equal(corpo.total, 0);
});

test('reprocessar pendencias de uma empresa sem sistema externo e recusado', async () => {
  const resposta = await serviceRequest('/api/zweb/product-locations/retry-sync', withServiceKey({
    method: 'POST',
    body: { company: 'EH' }
  }));

  assert.equal(resposta.status, 400);
  assert.match((await resposta.json()).error, /não tem sistema externo/i);
});

test('a consulta de pendencias exige a chave do servico', async () => {
  const resposta = await serviceRequest('/api/zweb/product-locations/pending-sync?company=MVA', withDeviceKey());
  assert.equal(resposta.status, 401);
});

test('o coletor associa um codigo de barras a um produto sem codigo', async () => {
  const resposta = await serviceRequest('/api/mobile/barcodes', withDeviceKey({
    method: 'POST',
    body: { productCode: '2001', barcode: '7899000000019' }
  }));
  const corpo = await resposta.json();

  assert.equal(resposta.status, 200);
  assert.equal(corpo.productCode, '2001');
  assert.equal(corpo.barcode, '7899000000019');
  assert.equal(corpo.previousBarcode, null);
  assert.equal(corpo.zwebStatus, 'pending');

  // O catalogo so passa a reconhecer depois que a extensao autenticada
  // confirmou a gravacao. Antes disso, o codigo ainda nao existe no ZWeb.
  const leitura = await serviceRequest('/api/mobile/scan/resolve', withDeviceKey({
    method: 'POST',
    body: { itemCodes: ['7899000000019'] }
  }));
  const itens = (await leitura.json()).items;
  assert.equal(itens[0].found, false);

  const confirmado = await serviceRequest(`/api/zweb/product-barcode-requests/${corpo.requestId}/applied`, withServiceKey({ method: 'POST' }));
  assert.equal(confirmado.status, 204);
  const leituraConfirmada = await serviceRequest('/api/mobile/scan/resolve', withDeviceKey({
    method: 'POST',
    body: { itemCodes: ['7899000000019'] }
  }));
  const itensConfirmados = (await leituraConfirmada.json()).items;
  assert.equal(itensConfirmados[0].found, true);
  assert.equal(itensConfirmados[0].productCode, '2001');
});

test('recusa associar um codigo que ja e de outro produto', async () => {
  const resposta = await serviceRequest('/api/mobile/barcodes', withDeviceKey({
    method: 'POST',
    body: { productCode: '2001', barcode: '7891234567890' }
  }));

  assert.equal(resposta.status, 409);
  assert.match((await resposta.json()).error, /2000/);
});

test('recusa associar a um produto que nao existe no catalogo', async () => {
  const resposta = await serviceRequest('/api/mobile/barcodes', withDeviceKey({
    method: 'POST',
    body: { productCode: '99999', barcode: '7899000000026' }
  }));

  assert.equal(resposta.status, 404);
});

test('a fila do ZWeb fica bloqueada ate a homologacao explicita', async () => {
  const fila = await serviceRequest('/api/zweb/product-barcode-requests/pending', withServiceKey());

  assert.equal(fila.status, 423, 'sem homologacao a extensao nao recebe nada para aplicar');
  assert.match((await fila.json()).error, /homologa/i);
});

test('a fila de codigos de barras exige a chave do servico', async () => {
  const resposta = await serviceRequest('/api/zweb/product-barcode-requests/pending', withDeviceKey());
  assert.equal(resposta.status, 401);
});
