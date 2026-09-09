import test, { after, before } from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { spawn } from 'node:child_process';
import { rm } from 'node:fs/promises';

const upstreamPort = 8910;
const servicePort = 8911;
const serviceUrl = `http://127.0.0.1:${servicePort}`;
const serviceKey = 'production-egress-guard-test-key';
let upstreamCalls = 0;
let upstream;
let service;

before(async () => {
  await rm(new URL('.egress-guard.sqlite', import.meta.url), { force: true });
  upstream = createServer((request, response) => {
    upstreamCalls += 1;
    response.writeHead(200, { 'Content-Type': 'application/json' });
    response.end(JSON.stringify({ access_token: 'must-not-be-read', expires_in: 3600 }));
  }).listen(upstreamPort, '127.0.0.1');
  service = spawn(process.execPath, ['src/server.js'], {
    cwd: new URL('..', import.meta.url),
    env: {
      ...process.env,
      ZWEB_PORT: String(servicePort),
      ZWEB_BIND_HOST: '127.0.0.1',
      ZWEB_INTERNAL_SERVICE_KEY: serviceKey,
      ZWEB_SHARED_RETURN_HISTORY_FILE: './test/.egress-guard-returns.json',
      ZWEB_PRODUCT_LOCATION_DB: './test/.egress-guard.sqlite',
      ZWEB_USERNAME: 'coletor@loja',
      ZWEB_PASSWORD: 'senha-de-teste',
      ZWEB_COMPANY_UUID: 'test-company',
      ZWEB_AUTH_URL: `http://127.0.0.1:${upstreamPort}/token`,
      ZWEB_API_BASE_URL: `http://127.0.0.1:${upstreamPort}`
    },
    stdio: 'ignore',
    windowsHide: true
  });
  const deadline = Date.now() + 5000;
  while (Date.now() < deadline) {
    try {
      if ((await fetch(`${serviceUrl}/health`)).ok) return;
    } catch {}
    await new Promise(resolve => setTimeout(resolve, 50));
  }
  throw new Error('Serviço de teste não iniciou a tempo.');
});

after(async () => {
  const exited = new Promise(resolve => service.once('exit', resolve));
  service.kill();
  await exited;
  service.unref();
  upstream.close();
  await rm(new URL('.egress-guard.sqlite', import.meta.url), { force: true });
  await rm(new URL('.egress-guard.sqlite-wal', import.meta.url), { force: true });
  await rm(new URL('.egress-guard.sqlite-shm', import.meta.url), { force: true });
});

test('recusa categoria sem liberar produção e não consulta o upstream', async () => {
  const response = await fetch(`${serviceUrl}/api/zweb/categories`, {
    headers: { 'X-Zweb-Service-Key': serviceKey }
  });

  assert.equal(response.status, 423);
  assert.match((await response.json()).error, /homologação/i);
  assert.equal(upstreamCalls, 0);
});
