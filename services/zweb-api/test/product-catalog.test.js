import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { ProductLocationStore } from '../src/product-location-store.js';

async function createStore(t) {
  const directory = await mkdtemp(join(tmpdir(), 'zweb-product-catalog-'));
  const store = new ProductLocationStore(join(directory, 'locations.sqlite'));
  t.after(() => {
    store.close();
    return rm(directory, { recursive: true, force: true });
  });
  return store;
}

test('sincroniza o catalogo e resolve o codigo lido pelo coletor', async (t) => {
  const store = await createStore(t);

  const status = store.upsertCatalogItems([
    { productId: 171, productCode: '2000', productDescription: 'CABO PP 3X2,5', barcode: '7891234567890' },
    { productId: 172, productCode: '2001', productDescription: 'DISJUNTOR 25A' }
  ]);
  assert.equal(status.items, 2);
  assert.ok(status.updatedAt);

  const resolved = store.resolveScannedCodes(['2000', '7891234567890', '9999']);
  assert.deepEqual(resolved.map(item => [item.scannedCode, item.found, item.productId || null]), [
    ['2000', true, 171],
    ['7891234567890', true, 171],
    ['9999', false, null]
  ]);
  assert.equal(resolved[0].productDescription, 'CABO PP 3X2,5');
  assert.equal(resolved[0].currentLocation, null);
});

test('uma varredura interrompida nao conta como catalogo concluido', async (t) => {
  const store = await createStore(t);
  store.upsertCatalogItems([{ productId: 1, productCode: '1', productDescription: 'ITEM' }]);

  const parcial = store.getCatalogStatus();
  assert.equal(parcial.items, 1);
  assert.ok(parcial.updatedAt, 'o lote enviado atualiza a idade do catalogo');
  assert.equal(parcial.completedAt, null, 'mas sem conclusao a extensao pode recomecar');

  store.upsertCatalogItems([{ productId: 2, productCode: '2', productDescription: 'ITEM' }]);
  const concluido = store.markCatalogSyncCompleted(2);
  assert.ok(concluido.completedAt);
  assert.equal(concluido.completedItems, 2);
  assert.equal(store.getCatalogStatus().completedAt, concluido.completedAt);
});

test('recusa uma conclusao de varredura sem total valido', async (t) => {
  const store = await createStore(t);
  assert.throws(() => store.markCatalogSyncCompleted(-1), error => error.status === 400);
  assert.throws(() => store.markCatalogSyncCompleted('muitos'), error => error.status === 400);
});

test('resolve o codigo mesmo quando o leitor acrescenta zeros a esquerda', async (t) => {
  const store = await createStore(t);
  store.upsertCatalogItems([{ productId: 300, productCode: '2000', productDescription: 'ITEM' }]);

  assert.equal(store.resolveScannedCodes(['0000002000'])[0].productId, 300);
});

test('atualiza o produto ja cadastrado sem duplicar o catalogo', async (t) => {
  const store = await createStore(t);
  store.upsertCatalogItems([{ productId: 171, productCode: '2000', productDescription: 'DESCRICAO ANTIGA' }]);
  const status = store.upsertCatalogItems([{ productId: 171, productCode: '2000', productDescription: 'DESCRICAO NOVA' }]);

  assert.equal(status.items, 1);
  assert.equal(store.resolveScannedCodes(['2000'])[0].productDescription, 'DESCRICAO NOVA');
});

test('atribui o enderecamento lido no coletor e mantem a trilha de auditoria', async (t) => {
  const store = await createStore(t);
  store.upsertCatalogItems([
    { productId: 171, productCode: '2000', productDescription: 'CABO PP 3X2,5' },
    { productId: 172, productCode: '2001', productDescription: 'DISJUNTOR 25A' }
  ]);

  const results = store.assignScannedLocations({
    codes: ['2000', '2001', '9999'],
    location: 'Rua 2 Nivel 5 Prateleira Esquerda',
    actorName: 'Coletor Estoque 1'
  });

  assert.deepEqual(results.map(item => [item.scannedCode, item.status]), [
    ['2000', 'success'],
    ['2001', 'success'],
    ['9999', 'not_found']
  ]);
  assert.equal(store.getLocation(171).location, 'Rua 2 Nivel 5 Prateleira Esquerda');
  assert.equal(store.getLocation(171).source, 'mobile_scan');
  assert.equal(store.getLocation(171).updatedBy, 'Coletor Estoque 1');
  assert.deepEqual(store.getAuditEntries(172).map(entry => entry.action), ['created']);
});

test('mostra o enderecamento atual do produto antes de sobrescrever', async (t) => {
  const store = await createStore(t);
  store.upsertCatalogItems([{ productId: 171, productCode: '2000', productDescription: 'CABO PP 3X2,5' }]);
  store.assignScannedLocations({ codes: ['2000'], location: 'A-01', actorName: 'Coletor Estoque 1' });

  const resolved = store.resolveScannedCodes(['2000']);
  assert.equal(resolved[0].currentLocation, 'A-01');

  store.assignScannedLocations({ codes: ['2000'], location: 'B-02', actorName: 'Coletor Estoque 2' });
  assert.equal(store.getLocation(171).revision, 2);
  assert.deepEqual(store.getAuditEntries(171).map(entry => entry.action), ['created', 'updated']);
});

test('recusa uma atribuicao sem enderecamento, sem responsavel ou sem itens', async (t) => {
  const store = await createStore(t);
  store.upsertCatalogItems([{ productId: 171, productCode: '2000', productDescription: 'CABO PP 3X2,5' }]);

  assert.throws(
    () => store.assignScannedLocations({ codes: ['2000'], location: '   ', actorName: 'Coletor' }),
    error => error.status === 400
  );
  assert.throws(
    () => store.assignScannedLocations({ codes: ['2000'], location: 'A-01', actorName: '' }),
    error => error.status === 400
  );
  assert.throws(
    () => store.assignScannedLocations({ codes: [], location: 'A-01', actorName: 'Coletor' }),
    error => error.status === 400
  );
});

test('limita o tamanho dos lotes de sincronizacao e de leitura', async (t) => {
  const store = await createStore(t);
  const items = Array.from({ length: 251 }, (unused, index) => ({
    productId: index + 1,
    productCode: String(index + 1),
    productDescription: 'ITEM'
  }));

  assert.throws(() => store.upsertCatalogItems(items), error => error.status === 400);
  assert.throws(
    () => store.resolveScannedCodes(Array.from({ length: 201 }, (unused, index) => String(index + 1))),
    error => error.status === 400
  );
});
