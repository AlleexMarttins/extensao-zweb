import test, { after, before } from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { rm } from 'node:fs/promises';

// Servico proprio, com a operacao de escrita no ZWeb liberada, para provar o
// fluxo completo sem afrouxar o bloqueio dos demais testes.
const servicePort = 8896;
const serviceKey = 'test-service-key';
const deviceKey = 'test-device-key-0123456789';
const serviceUrl = `http://127.0.0.1:${servicePort}`;

let service;

function pedir(path, options = {}) {
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

const comServico = (o = {}) => ({ ...o, headers: { ...(o.headers || {}), 'X-Zweb-Service-Key': serviceKey } });
const comAparelho = (o = {}) => ({ ...o, headers: { ...(o.headers || {}), 'X-Zweb-Device-Key': deviceKey } });

before(async () => {
  await Promise.all(['', '-wal', '-shm'].map(sufixo => rm(new URL(`.homologacao.sqlite${sufixo}`, import.meta.url), { force: true })));
  service = spawn(process.execPath, ['src/server.js'], {
    cwd: new URL('..', import.meta.url),
    env: {
      ...process.env,
      ZWEB_PORT: String(servicePort),
      ZWEB_BIND_HOST: '127.0.0.1',
      ZWEB_INTERNAL_SERVICE_KEY: serviceKey,
      ZWEB_MOBILE_DEVICE_KEYS: `Coletor Homologacao:${deviceKey}`,
      ZWEB_PRODUCTION_ZWEB_ENABLED: 'true',
      // Mesmo que a chave legada de escrita direta esteja presente, o servico
      // nao pode tentar a RPC. A gravacao pertence apenas a extensao dentro da
      // sessao autenticada do navegador.
      ZWEB_ALLOWED_OPERATIONS: 'barcodeWrite,productBarcodeWrite',
      ZWEB_SHARED_RETURN_HISTORY_FILE: './test/.homologacao.json',
      ZWEB_PRODUCT_LOCATION_DB: './test/.homologacao.sqlite',
      ZWEB_USERNAME: '',
      ZWEB_PASSWORD: '',
      ZWEB_COMPANY_UUID: ''
    },
    stdio: 'ignore',
    windowsHide: true
  });
  const limite = Date.now() + 5000;
  while (Date.now() < limite) {
    try {
      const r = await fetch(`${serviceUrl}/health`);
      if (r.status === 503) break;
    } catch {}
    await new Promise(resolve => setTimeout(resolve, 50));
  }
});

after(() => {
  service.kill();
  service.unref();
});

test('com a operacao homologada, a fila entrega o pedido e aceita a confirmacao', async () => {
  await pedir('/api/zweb/product-catalog', comServico({
    method: 'PUT',
    body: { items: [{ productId: 20624594, productCode: '18755', productDescription: 'GAS BUTANO REFIL' }] }
  }));

  const criado = await pedir('/api/mobile/barcodes', comAparelho({
    method: 'POST',
    body: { productCode: '18755', barcode: '7899956657917' }
  }));
  assert.equal(criado.status, 200);

  const fila = await pedir('/api/zweb/product-barcode-requests/pending', comServico());
  const corpo = await fila.json();
  assert.equal(fila.status, 200);
  assert.equal(corpo.total, 1);
  assert.equal(corpo.requests[0].productCode, '18755');
  assert.equal(corpo.requests[0].barcode, '7899956657917');

  const tentativaDireta = await pedir('/api/zweb/product-barcode-requests/apply', comServico({ method: 'POST' }));
  assert.equal(tentativaDireta.status, 409, 'o servidor nao pode gravar pela RPC fora do navegador');
  assert.equal((await (await pedir('/api/zweb/product-barcode-requests/pending', comServico())).json()).total, 1);

  const confirmado = await pedir(
    `/api/zweb/product-barcode-requests/${corpo.requests[0].requestId}/applied`,
    comServico({ method: 'POST' })
  );
  assert.equal(confirmado.status, 204);
  assert.equal((await (await pedir('/api/zweb/product-barcode-requests/pending', comServico())).json()).total, 0);
});

test('um pedido que falha no ZWeb sai da fila com o motivo, sem repetir', async () => {
  await pedir('/api/zweb/product-catalog', comServico({
    method: 'PUT',
    body: { items: [{ productId: 20605822, productCode: '1', productDescription: 'CHAVE PUSH BUTTON' }] }
  }));
  const criado = await pedir('/api/mobile/barcodes', comAparelho({
    method: 'POST',
    body: { productCode: '1', barcode: '7899000000033' }
  }));
  const pedido = await criado.json();

  const falha = await pedir(
    `/api/zweb/product-barcode-requests/${pedido.requestId}/failed`,
    comServico({ method: 'POST', body: { message: 'A sessao do ZWeb expirou.' } })
  );

  assert.equal(falha.status, 204);
  const fila = await (await pedir('/api/zweb/product-barcode-requests/pending', comServico())).json();
  assert.equal(fila.total, 0, 'pedido com falha nao volta para a fila imediatamente');
});

test('o enderecamento alimenta o catalogo sem nenhuma chamada ao ZWeb', async () => {
  // A extensao le codigo, descricao e codigo de barras da tela ja aberta e
  // manda junto do enderecamento; o catalogo se mantem vivo com isso.
  const salvo = await pedir('/api/zweb/product-locations/20623534', comServico({
    method: 'PUT',
    body: {
      productCode: '17695',
      productDescription: 'SPOT LED 14W AM3000K BR6500K BF EVIDENCE DUPLO',
      barcode: '7899452028976',
      location: 'RUA 3 NIVEL 1 PRAT DIR',
      actorName: 'Operador ZWeb'
    }
  }));
  assert.equal(salvo.status, 200);

  const leitura = await pedir('/api/mobile/scan/resolve', comAparelho({
    method: 'POST',
    body: { itemCodes: ['7899452028976'] }
  }));
  const itens = (await leitura.json()).items;
  assert.equal(itens[0].found, true, 'o produto entrou no catalogo pelo proprio enderecamento');
  assert.equal(itens[0].productCode, '17695');
  assert.equal(itens[0].currentLocation, 'RUA 3 NIVEL 1 PRAT DIR');
});
