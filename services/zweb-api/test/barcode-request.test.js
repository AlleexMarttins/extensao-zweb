import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { ProductLocationStore } from '../src/product-location-store.js';

async function comCatalogo(t) {
  const directory = await mkdtemp(join(tmpdir(), 'zweb-barcode-'));
  const store = new ProductLocationStore(join(directory, 'locations.sqlite'));
  t.after(() => {
    try { store.close(); } catch {}
    return rm(directory, { recursive: true, force: true });
  });
  store.upsertCatalogItems([
    { productId: 20623534, productCode: '17695', productDescription: 'SPOT LED BF', barcode: '7899452028976' },
    { productId: 20624594, productCode: '18755', productDescription: 'GAS BUTANO REFIL' },
    { productId: 20605822, productCode: '1', productDescription: 'CHAVE PUSH BUTTON' }
  ]);
  return store;
}

test('associa um codigo de barras a um produto que estava sem', async (t) => {
  const store = await comCatalogo(t);

  const pedido = store.createBarcodeRequest({
    productCode: '18755',
    barcode: '7899956657917',
    requestedBy: 'Coletor Estoque 2'
  });

  assert.equal(pedido.productId, 20624594);
  assert.equal(pedido.productCode, '18755');
  assert.equal(pedido.barcode, '7899956657917');
  assert.equal(pedido.previousBarcode, null);
  assert.equal(pedido.zwebStatus, 'pending');

  // A associacao pendente nao pode virar verdade no catalogo antes da
  // confirmacao. Caso alguem apague o campo no ZWeb, uma leitura futura nao
  // pode continuar sendo reconhecida por um valor que so existiu na fila.
  const lido = store.resolveScannedCodes(['7899956657917'])[0];
  assert.equal(lido.found, false);

  store.markBarcodeRequest(pedido.requestId, 'zweb', { status: 'applied' });
  const confirmado = store.resolveScannedCodes(['7899956657917'])[0];
  assert.equal(confirmado.found, true);
  assert.equal(confirmado.productCode, '18755');
});

test('recusa um codigo que ja pertence a outro produto', async (t) => {
  const store = await comCatalogo(t);

  assert.throws(
    () => store.createBarcodeRequest({ productCode: '18755', barcode: '7899452028976', requestedBy: 'Coletor' }),
    error => error.status === 409 && /17695/.test(error.message)
  );
  // Nada mudou no produto que ia receber o codigo.
  assert.equal(store.resolveScannedCodes(['18755'])[0].barcode, null);
});

test('deixa trocar o codigo do proprio produto, guardando o anterior', async (t) => {
  const store = await comCatalogo(t);

  const pedido = store.createBarcodeRequest({
    productCode: '17695',
    barcode: '7899452028983',
    requestedBy: 'Coletor Estoque 1'
  });

  assert.equal(pedido.previousBarcode, '7899452028976');
  assert.equal(store.resolveScannedCodes(['7899452028983'])[0].found, false);
  store.markBarcodeRequest(pedido.requestId, 'zweb', { status: 'applied' });
  assert.equal(store.resolveScannedCodes(['7899452028983'])[0].productCode, '17695');
});

test('a mesma associacao pendente nao cria tentativas duplicadas', async (t) => {
  const store = await comCatalogo(t);

  const primeira = store.createBarcodeRequest({ productCode: '18755', barcode: '7899956657917', requestedBy: 'Coletor Estoque 1' });
  const repetida = store.createBarcodeRequest({ productCode: '18755', barcode: '7899956657917', requestedBy: 'Coletor Estoque 1' });

  assert.equal(repetida.requestId, primeira.requestId);
  assert.equal(store.getPendingBarcodeRequests().length, 1);
});

test('confirmar uma associacao tambem encerra pendencias duplicadas antigas', async (t) => {
  const store = await comCatalogo(t);
  const primeira = store.createBarcodeRequest({ productCode: '18755', barcode: '7899956657917', requestedBy: 'Coletor Estoque 1' });
  store.database.prepare(`
    INSERT INTO product_barcode_requests (product_id, product_code, barcode, requested_by, created_at)
    VALUES (?, ?, ?, ?, ?)
  `).run(primeira.productId, primeira.productCode, primeira.barcode, 'Registro antigo', new Date().toISOString());

  store.markBarcodeRequest(primeira.requestId, 'zweb', { status: 'applied' });

  assert.equal(store.getPendingBarcodeRequests().length, 0);
  assert.equal(store.resolveScannedCodes(['7899956657917'])[0].productCode, '18755');
});

test('recusa produto que nao existe no catalogo', async (t) => {
  const store = await comCatalogo(t);
  assert.throws(
    () => store.createBarcodeRequest({ productCode: '99999', barcode: '7891111111111', requestedBy: 'Coletor' }),
    error => error.status === 404
  );
});

test('a fila do ZWeb entrega o pendente e aceita o retorno', async (t) => {
  const store = await comCatalogo(t);
  const pedido = store.createBarcodeRequest({ productCode: '1', barcode: '7892222222222', requestedBy: 'Coletor' });

  const pendentes = store.getPendingBarcodeRequests();
  assert.equal(pendentes.length, 1);
  assert.equal(pendentes[0].productId, 20605822);
  assert.equal(pendentes[0].productDescription, 'CHAVE PUSH BUTTON');

  store.markBarcodeRequest(pedido.requestId, 'zweb', { status: 'applied' });
  assert.equal(store.getPendingBarcodeRequests().length, 0);
});

test('uma falha no ZWeb sai da fila com o motivo registrado', async (t) => {
  const store = await comCatalogo(t);
  const pedido = store.createBarcodeRequest({ productCode: '1', barcode: '7892222222222', requestedBy: 'Coletor' });

  store.markBarcodeRequest(pedido.requestId, 'zweb', { status: 'failed', error: 'A sessao do ZWeb expirou.' });

  assert.equal(store.getPendingBarcodeRequests().length, 0, 'falha nao fica repetindo em laco');
  const registro = store.database.prepare('SELECT zweb_status, zweb_error FROM product_barcode_requests WHERE request_id = ?').get(pedido.requestId);
  assert.equal(registro.zweb_status, 'failed');
  assert.equal(registro.zweb_error, 'A sessao do ZWeb expirou.');
});

test('recusa pedido sem codigo, sem barras ou sem responsavel', async (t) => {
  const store = await comCatalogo(t);
  assert.throws(() => store.createBarcodeRequest({ productCode: '', barcode: '789', requestedBy: 'x' }), e => e.status === 400);
  assert.throws(() => store.createBarcodeRequest({ productCode: '1', barcode: '  ', requestedBy: 'x' }), e => e.status === 400);
  assert.throws(() => store.createBarcodeRequest({ productCode: '1', barcode: '789', requestedBy: '' }), e => e.status === 400);
});
