import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { ProductLocationStore } from '../src/product-location-store.js';

async function createStore() {
  const directory = await mkdtemp(join(tmpdir(), 'zweb-product-location-'));
  const store = new ProductLocationStore(join(directory, 'locations.sqlite'));
  return { directory, store };
}

test('guarda, atualiza e consulta o enderecamento sem depender do codigo do produto', async (t) => {
  const { directory, store } = await createStore();
  t.after(() => {
    store.close();
    return rm(directory, { recursive: true, force: true });
  });

  const created = store.saveLocation({
    productId: 171,
    productCode: '2000',
    productDescription: 'CABO TESTE',
    location: 'A-03-02',
    actorName: 'Teste'
  });

  assert.equal(created.location, 'A-03-02');
  assert.equal(created.revision, 1);
  assert.equal(store.getLocation(171).productCode, '2000');
  assert.equal(store.getLocationsByProductIds([171, 999]).length, 1);
  assert.equal(store.getLocationsByProductCodes(['2000', '999']).length, 1);

  const updated = store.saveLocation({
    productId: 171,
    productCode: '2000-NOVO',
    productDescription: 'CABO TESTE ATUALIZADO',
    location: 'B-01-04',
    actorName: 'Teste'
  });

  assert.equal(updated.location, 'B-01-04');
  assert.equal(updated.revision, 2);
  assert.equal(store.getAuditEntries(171).map(entry => entry.action).join(','), 'created,updated');
});

test('registra uma importacao antes de permitir que a extensao limpe a observacao', async (t) => {
  const { directory, store } = await createStore();
  t.after(() => {
    store.close();
    return rm(directory, { recursive: true, force: true });
  });

  const run = store.createImportRun({ requestedBy: 'Teste', source: 'zweb-observation' });
  store.upsertImportItems(run.id, [
    {
      productId: 88,
      productCode: '88',
      productDescription: '047123',
      observation: 'RUA 1',
      needsDescriptionReview: true,
      cleanupOnly: false
    },
    {
      productId: 89,
      productCode: '89',
      productDescription: 'ITEM ANTIGO',
      observation: '\u0000',
      cleanupOnly: true
    }
  ]);

  const pending = store.getPendingImportItems(run.id, 10);
  assert.deepEqual(pending.map(item => [item.productId, item.status, item.needsDescriptionReview]), [
    [88, 'pending', true],
    [89, 'pending_cleanup', false]
  ]);

  store.saveLocation({
    productId: 88,
    productCode: '88',
    productDescription: '047123',
    location: 'RUA 1',
    actorName: 'Teste',
    source: 'migration_observation',
    sourceObservation: 'RUA 1',
    migrationRunId: run.id
  });
  store.markImportItemLocationSaved(run.id, 88);
  assert.deepEqual(
    store.getPendingImportItems(run.id, 10).map(item => [item.productId, item.status]),
    [[88, 'location_saved'], [89, 'pending_cleanup']]
  );
  store.markImportItemCleared(run.id, 88);
  store.markImportItemCleared(run.id, 89, { cleanupOnly: true });

  const summary = store.getImportRun(run.id);
  assert.equal(summary.counts.cleared, 1);
  assert.equal(summary.counts.cleared_invalid_observation, 1);
  assert.equal(summary.counts.numeric_description_review, 1);
});

test('lista as falhas da importacao para permitir uma retomada segura', async (t) => {
  const { directory, store } = await createStore();
  t.after(() => {
    store.close();
    return rm(directory, { recursive: true, force: true });
  });

  const run = store.createImportRun({ requestedBy: 'Teste', source: 'zweb-observation' });
  store.upsertImportItems(run.id, [{
    productId: 90,
    productCode: '90',
    productDescription: 'ITEM',
    observation: 'RUA 1'
  }]);
  store.markImportItemFailed(run.id, 90, 'A Zweb manteve a observacao apos a atualizacao.');

  assert.deepEqual(store.getFailedImportItems(run.id, 10), [{
    productId: 90,
    productCode: '90',
    productDescription: 'ITEM',
    errorMessage: 'A Zweb manteve a observacao apos a atualizacao.'
  }]);
});

test('retoma apenas falhas causadas pela sessao indisponivel', async (t) => {
  const { directory, store } = await createStore();
  t.after(() => {
    store.close();
    return rm(directory, { recursive: true, force: true });
  });

  const run = store.createImportRun({ requestedBy: 'Teste', source: 'zweb-observation' });
  store.upsertImportItems(run.id, [
    { productId: 91, productCode: '91', productDescription: 'ITEM 1', observation: 'RUA 1' },
    { productId: 92, productCode: '92', productDescription: 'ITEM 2', observation: 'RUA 2' }
  ]);
  store.markImportItemFailed(run.id, 91, 'A sessao do ZWeb nao esta disponivel nesta aba.');
  store.markImportItemFailed(run.id, 92, 'O ZWeb respondeu 422.');
  store.finishImportRun(run.id);

  const resumed = store.resumeImportRun(run.id);
  assert.equal(resumed.id, run.id);
  assert.equal(resumed.finishedAt, null);
  assert.equal(resumed.counts.pending, 1);
  assert.equal(resumed.counts.failed, 1);
});

test('impede que dois computadores iniciem a mesma transferencia de observacoes', async (t) => {
  const { directory, store } = await createStore();
  t.after(() => {
    store.close();
    return rm(directory, { recursive: true, force: true });
  });

  const run = store.createImportRun({ requestedBy: 'Teste', source: 'zweb-observation' });
  await assert.rejects(
    async () => store.createImportRun({ requestedBy: 'Outro computador', source: 'zweb-observation' }),
    error => error && error.status === 409
  );
  store.finishImportRun(run.id);
  assert.equal(store.getLatestImportRunBySource('zweb-observation').id, run.id);
  await assert.rejects(
    async () => store.createImportRun({ requestedBy: 'Teste', source: 'zweb-observation' }),
    error => error && error.status === 409
  );
});
