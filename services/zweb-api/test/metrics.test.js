import test, { after, before } from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { rm } from 'node:fs/promises';

const servicePort = 8899;
const serviceKey = 'test-service-key';
const serviceUrl = `http://127.0.0.1:${servicePort}`;

let service;

function startService() {
  const child = spawn(process.execPath, ['src/server.js'], {
    cwd: new URL('..', import.meta.url),
    env: {
      ...process.env,
      ZWEB_PORT: String(servicePort),
      ZWEB_BIND_HOST: '127.0.0.1',
      ZWEB_INTERNAL_SERVICE_KEY: serviceKey,
      ZWEB_SHARED_RETURN_HISTORY_FILE: './test/.commission-returns.json',
      ZWEB_PRODUCT_LOCATION_DB: './test/.product-locations.sqlite',
      ZWEB_USERNAME: '',
      ZWEB_PASSWORD: '',
      ZWEB_COMPANY_UUID: ''
    },
    stdio: 'ignore',
    windowsHide: true
  });
  return child;
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
  await rm(new URL('.product-locations.sqlite', import.meta.url), { force: true });
  await rm(new URL('.product-locations.sqlite-wal', import.meta.url), { force: true });
  await rm(new URL('.product-locations.sqlite-shm', import.meta.url), { force: true });
  service = startService();
  await waitForService();
});

after(() => {
  service.kill();
  service.unref();
});

test('guarda e consulta enderecamento pela API interna', async () => {
  const saveResponse = await fetch(`${serviceUrl}/api/zweb/product-locations/171`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'X-Zweb-Service-Key': serviceKey
    },
    body: JSON.stringify({
      productCode: '2000',
      productDescription: 'CABO TESTE',
      location: 'A-03-02',
      actorName: 'Teste'
    })
  });
  assert.equal(saveResponse.status, 200);
  assert.equal((await saveResponse.json()).location, 'A-03-02');

  const listResponse = await fetch(`${serviceUrl}/api/zweb/product-locations?productIds=171,999`, {
    headers: { 'X-Zweb-Service-Key': serviceKey }
  });
  assert.equal(listResponse.status, 200);
  assert.deepEqual((await listResponse.json()).locations.map(item => item.productId), [171]);
});

test('consulta e atualiza pelo codigo quando a rota do ZWeb usa UUID', async () => {
  const legacySave = await fetch(`${serviceUrl}/api/zweb/product-locations/173`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'X-Zweb-Service-Key': serviceKey
    },
    body: JSON.stringify({
      productCode: '2300',
      productDescription: 'ITEM COM ROTA UUID',
      location: 'B-02-01',
      actorName: 'Teste'
    })
  });
  assert.equal(legacySave.status, 200);

  const loadByCode = await fetch(`${serviceUrl}/api/zweb/product-locations/by-code/2300`, {
    headers: { 'X-Zweb-Service-Key': serviceKey }
  });
  assert.equal(loadByCode.status, 200);
  assert.equal((await loadByCode.json()).productId, 173);

  const updateByCode = await fetch(`${serviceUrl}/api/zweb/product-locations/by-code/2300`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'X-Zweb-Service-Key': serviceKey
    },
    body: JSON.stringify({
      productDescription: 'ITEM COM ROTA UUID',
      location: 'B-02-02',
      actorName: 'Teste'
    })
  });
  assert.equal(updateByCode.status, 200);
  const updated = await updateByCode.json();
  assert.equal(updated.productId, 173);
  assert.equal(updated.location, 'B-02-02');
});

test('protege a importacao para que a observacao seja limpa somente apos registro', async () => {
  const createResponse = await fetch(`${serviceUrl}/api/zweb/product-location-import-runs`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Zweb-Service-Key': serviceKey },
    body: JSON.stringify({ source: 'zweb-observation', requestedBy: 'Teste' })
  });
  assert.equal(createResponse.status, 201);
  const run = await createResponse.json();

  const itemsResponse = await fetch(`${serviceUrl}/api/zweb/product-location-import-runs/${run.id}/items`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', 'X-Zweb-Service-Key': serviceKey },
    body: JSON.stringify({
      items: [{
        productId: 172,
        productCode: '2001',
        productDescription: 'ITEM TESTE',
        observation: 'RUA 2',
        observationSignature: 'sig-172'
      }]
    })
  });
  assert.equal(itemsResponse.status, 204);

  const pendingResponse = await fetch(`${serviceUrl}/api/zweb/product-location-import-runs/${run.id}/pending?limit=10`, {
    headers: { 'X-Zweb-Service-Key': serviceKey }
  });
  assert.equal(pendingResponse.status, 200);
  assert.equal((await pendingResponse.json()).items[0].observation, 'RUA 2');
});

test('retorna estado técnico dos caches sem expor registros compartilhados', async () => {

  const response = await fetch(`${serviceUrl}/api/zweb/metrics`, {
    headers: { 'X-Zweb-Service-Key': serviceKey }
  });
  assert.equal(response.status, 200);
  const metrics = await response.json();

  assert.equal(typeof metrics.generatedAt, 'number');
  assert.equal(typeof metrics.cache.categories.ttlMs, 'number');
  assert.equal(typeof metrics.cache.categories.remainingMs, 'number');
  assert.equal(typeof metrics.cache.categories.hits, 'number');
  assert.equal(typeof metrics.cache.categories.misses, 'number');
  assert.equal(typeof metrics.sharedReturnHistory.updatedAt, 'number');
  assert.equal(typeof metrics.sharedReturnHistory.remainingMs, 'number');
  assert.equal(typeof metrics.sharedReturnHistory.fresh, 'boolean');
  assert.equal(Object.hasOwn(metrics, 'entries'), false);
  assert.equal(Object.hasOwn(metrics.sharedReturnHistory, 'entries'), false);
});

test('protege as métricas com a mesma chave do serviço interno', async () => {
  const response = await fetch(`${serviceUrl}/api/zweb/metrics`);
  assert.equal(response.status, 401);
});

test('rejeita identificador inválido antes de consultar produtos', async () => {
  const response = await fetch(`${serviceUrl}/api/zweb/products/not-a-uuid`, {
    headers: { 'X-Zweb-Service-Key': serviceKey }
  });
  assert.equal(response.status, 400);
});

test('reconhece UUID válido e exige o cliente OAuth configurado', async () => {
  const response = await fetch(`${serviceUrl}/api/zweb/products/3f9cb9e4-977c-4b73-9f5d-764ce79f0f5c`, {
    headers: { 'X-Zweb-Service-Key': serviceKey }
  });
  assert.equal(response.status, 503);
});

test('reconhece a lista de produtos e exige o cliente OAuth configurado', async () => {
  const response = await fetch(`${serviceUrl}/api/zweb/products`, {
    headers: { 'X-Zweb-Service-Key': serviceKey }
  });
  assert.equal(response.status, 503);
});
