import test, { after, before } from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { spawn } from 'node:child_process';
import { rm } from 'node:fs/promises';

const upstreamPort = 8900;
const servicePort = 8901;
const serviceUrl = `http://127.0.0.1:${servicePort}`;
const serviceKey = 'cached-query-test-key';
const upstreamCalls = new Map();
let upstream;
let service;

function increment(pathname) {
  upstreamCalls.set(pathname, (upstreamCalls.get(pathname) || 0) + 1);
}

function startUpstream() {
  return createServer((request, response) => {
    const url = new URL(request.url, `http://127.0.0.1:${upstreamPort}`);
    if (url.pathname === '/token') {
      response.writeHead(200, { 'Content-Type': 'application/json' });
      response.end(JSON.stringify({ access_token: 'test-token', expires_in: 3600 }));
      return;
    }

    increment(url.pathname);
    setTimeout(() => {
      response.writeHead(200, { 'Content-Type': 'application/json' });
      response.end(JSON.stringify({ data: [{ id: url.pathname }] }));
    }, 35);
  }).listen(upstreamPort, '127.0.0.1');
}

function startService() {
  return spawn(process.execPath, ['src/server.js'], {
    cwd: new URL('..', import.meta.url),
    env: {
      ...process.env,
      ZWEB_PORT: String(servicePort),
      ZWEB_BIND_HOST: '127.0.0.1',
      ZWEB_INTERNAL_SERVICE_KEY: serviceKey,
      ZWEB_SHARED_RETURN_HISTORY_FILE: './test/.cached-query-returns.json',
      ZWEB_PRODUCT_LOCATION_DB: './test/.cached-query-locations.sqlite',
      ZWEB_USERNAME: 'coletor@loja',
      ZWEB_PASSWORD: 'senha-de-teste',
      ZWEB_COMPANY_UUID: 'test-company',
      ZWEB_PRODUCTION_ZWEB_ENABLED: 'true',
      ZWEB_ALLOWED_OPERATIONS: 'referenceCategoryRefresh,paymentModesRead,recipientsRead,salesStatusesRead',
      ZWEB_MIN_REQUEST_INTERVAL_MS: '0',
      ZWEB_REQUEST_TIMEOUT_MS: '500',
      ZWEB_AUTH_URL: `http://127.0.0.1:${upstreamPort}/token`,
      ZWEB_API_BASE_URL: `http://127.0.0.1:${upstreamPort}`
    },
    stdio: 'ignore',
    windowsHide: true
  });
}

async function waitForService() {
  const deadline = Date.now() + 5000;
  while (Date.now() < deadline) {
    try {
      const response = await fetch(`${serviceUrl}/health`);
      if (response.status === 200) return;
    } catch {}
    await new Promise(resolve => setTimeout(resolve, 50));
  }
  throw new Error('Serviço de teste não iniciou a tempo.');
}

async function request(path) {
  const response = await fetch(`${serviceUrl}${path}`, {
    headers: { 'X-Zweb-Service-Key': serviceKey }
  });
  assert.equal(response.status, 200);
}

before(async () => {
  await rm(new URL('.cached-query-locations.sqlite', import.meta.url), { force: true });
  await rm(new URL('.cached-query-locations.sqlite-wal', import.meta.url), { force: true });
  await rm(new URL('.cached-query-locations.sqlite-shm', import.meta.url), { force: true });
  upstream = startUpstream();
  service = startService();
  await waitForService();
});

after(() => {
  service.kill();
  service.unref();
  upstream.close();
});

for (const route of [
  ['/api/zweb/payment-modes', '/br/v1/finance/payment-modes', 'paymentModes'],
  ['/api/zweb/recipients', '/br/v1/recipients', 'recipients'],
  ['/api/zweb/sales-statuses', '/br/v1/sales/statuses', 'salesStatuses']
]) {
  const [servicePath, upstreamPath, metricsKey] = route;
  test(`reaproveita ${servicePath} quando há pedidos simultâneos`, async () => {
    await Promise.all(Array.from({ length: 10 }, () => request(servicePath)));
    assert.equal(upstreamCalls.get(upstreamPath), 1, JSON.stringify(Object.fromEntries(upstreamCalls)));

    const metricsResponse = await fetch(`${serviceUrl}/api/zweb/metrics`, {
      headers: { 'X-Zweb-Service-Key': serviceKey }
    });
    const metrics = await metricsResponse.json();
    assert.equal(metrics.cache[metricsKey].misses, 1);
    assert.equal(metrics.cache[metricsKey].coalesced, 9);
  });
}

test('descarta o cache indicado depois de uma alteração confirmada no ZWeb', async () => {
  const upstreamPath = '/br/v1/finance/payment-modes';
  const callsBeforeInvalidation = upstreamCalls.get(upstreamPath);

  const invalidationResponse = await fetch(`${serviceUrl}/api/zweb/cache/invalidate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Zweb-Service-Key': serviceKey
    },
    body: JSON.stringify({ keys: ['paymentModes'] })
  });

  assert.equal(invalidationResponse.status, 200);
  assert.deepEqual((await invalidationResponse.json()).invalidated, ['paymentModes']);

  await request('/api/zweb/payment-modes');
  assert.equal(upstreamCalls.get(upstreamPath), callsBeforeInvalidation + 1);
});
