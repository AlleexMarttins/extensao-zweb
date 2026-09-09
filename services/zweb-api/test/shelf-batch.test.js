import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { ProductLocationStore } from '../src/product-location-store.js';

async function createStore(t) {
  const directory = await mkdtemp(join(tmpdir(), 'zweb-shelf-batch-'));
  const store = new ProductLocationStore(join(directory, 'locations.sqlite'));
  t.after(() => {
    store.close();
    return rm(directory, { recursive: true, force: true });
  });
  return store;
}

test('guarda um lote de prateleira sem depender de produto ja presente no catalogo', async (t) => {
  const store = await createStore(t);

  const batch = store.createShelfBatch({
    company: 'EH',
    location: 'GVE-07',
    requestedBy: 'Coletor estoque',
    items: [
      { scannedCode: '7899744088206', productCode: '16821', barcode: '7899744088206' },
      { scannedCode: '7891111111111', productCode: '2000' }
    ]
  });

  assert.equal(batch.status, 'pending');
  assert.equal(batch.items.length, 2);
  assert.equal(batch.items[0].productId, null);
  assert.equal(batch.items[0].barcode, '7899744088206');

  const pending = store.getNextPendingShelfBatch();
  assert.equal(pending.batchId, batch.batchId);
  assert.equal(pending.location, 'GVE-07');
  assert.equal(pending.items[1].productCode, '2000');
});

test('a fila da extensao da Horizonte nao recebe lote da MVA', async (t) => {
  const store = await createStore(t);
  const mvaBatch = store.createShelfBatch({
    company: 'MVA',
    location: 'A-01',
    requestedBy: 'Coletor MVA',
    items: [{ scannedCode: '7899744088206', productCode: '16821', barcode: '7899744088206' }]
  });

  assert.equal(store.getNextPendingShelfBatch('EH'), null);
  assert.equal(store.getNextPendingShelfBatch('MVA').batchId, mvaBatch.batchId);
});

test('confirma cada item somente depois da extensao validar no ZWeb e grava o endereco', async (t) => {
  const store = await createStore(t);
  const batch = store.createShelfBatch({
    location: 'A-02',
    requestedBy: 'Coletor estoque',
    items: [{ scannedCode: '7899744088206', productCode: '16821', barcode: '7899744088206' }]
  });

  const applied = store.markShelfBatchItemApplied(batch.batchId, 1, {
    productId: 20622659,
    productCode: '16821',
    productDescription: 'HUB USB 4 PORTAS',
    barcode: '7899744088206'
  });

  assert.equal(applied.status, 'applied');
  assert.equal(store.getNextPendingShelfBatch(), null);
  assert.equal(store.getLocation(20622659, 'EH').location, 'A-02');
  assert.equal(store.resolveScannedCodes(['7899744088206'], 'EH')[0].productCode, '16821');
});

test('interrompe o lote na primeira falha e nao o devolve automaticamente para a extensao', async (t) => {
  const store = await createStore(t);
  const batch = store.createShelfBatch({
    location: 'A-02',
    requestedBy: 'Coletor estoque',
    items: [{ scannedCode: '7899744088206', productCode: '16821', barcode: '7899744088206' }]
  });

  const failed = store.markShelfBatchItemFailed(batch.batchId, 1, 'Produto nao encontrado pelo codigo informado.');
  assert.equal(failed.status, 'failed');
  assert.equal(store.getNextPendingShelfBatch(), null);
  assert.equal(store.getShelfBatch(batch.batchId).status, 'blocked');
});

test('recusa lote sem endereco, sem codigo de produto e acima do limite seguro', async (t) => {
  const store = await createStore(t);
  assert.throws(() => store.createShelfBatch({ location: '', requestedBy: 'Coletor', items: [] }), error => error.status === 400);
  assert.throws(() => store.createShelfBatch({ location: 'A-01', requestedBy: 'Coletor', items: [{ scannedCode: '789' }] }), error => error.status === 400);
  assert.throws(() => store.createShelfBatch({
    location: 'A-01', requestedBy: 'Coletor',
    items: Array.from({ length: 21 }, (_, index) => ({ scannedCode: String(index), productCode: String(index) }))
  }), error => error.status === 400);
});
