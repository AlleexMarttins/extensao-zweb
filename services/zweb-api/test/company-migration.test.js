import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import { ProductLocationStore } from '../src/product-location-store.js';

// Recria o banco como ele existe hoje em producao, antes da MVA: o produto e
// a chave, e nao ha nocao de empresa em lugar nenhum.
function criarBancoAntigo(arquivo) {
  const database = new DatabaseSync(arquivo);
  database.exec(`
    CREATE TABLE product_locations (
      product_id INTEGER PRIMARY KEY,
      product_code TEXT NOT NULL,
      product_description TEXT NOT NULL DEFAULT '',
      location TEXT NOT NULL,
      source TEXT NOT NULL,
      source_observation TEXT,
      created_at TEXT NOT NULL,
      created_by TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      updated_by TEXT NOT NULL,
      revision INTEGER NOT NULL DEFAULT 1
    );
    CREATE TABLE product_location_audit (
      audit_id INTEGER PRIMARY KEY AUTOINCREMENT,
      product_id INTEGER NOT NULL,
      action TEXT NOT NULL,
      previous_location TEXT,
      next_location TEXT,
      source_observation TEXT,
      actor_name TEXT NOT NULL,
      migration_run_id TEXT,
      created_at TEXT NOT NULL
    );
    INSERT INTO product_locations (
      product_id, product_code, product_description, location, source,
      created_at, created_by, updated_at, updated_by, revision
    ) VALUES
      (17695, '17695', 'SPOT LED BF', 'RUA 3 NIVEL 1 PRAT DIR', 'mobile_scan',
       '2026-08-13T10:00:00.000Z', 'Coletor Estoque 1', '2026-08-13T10:00:00.000Z', 'Coletor Estoque 1', 2),
      (171, '2000', 'CABO PP', 'GVE-07', 'migration_observation',
       '2026-08-01T09:00:00.000Z', 'Migracao ZWeb', '2026-08-01T09:00:00.000Z', 'Migracao ZWeb', 1);
    INSERT INTO product_location_audit (product_id, action, next_location, actor_name, created_at)
    VALUES (17695, 'created', 'RUA 3 NIVEL 1 PRAT DIR', 'Coletor Estoque 1', '2026-08-13T10:00:00.000Z');
  `);
  database.close();
}

async function abrirMigrado(t) {
  const directory = await mkdtemp(join(tmpdir(), 'zweb-migracao-'));
  const arquivo = join(directory, 'locations.sqlite');
  criarBancoAntigo(arquivo);
  const store = new ProductLocationStore(arquivo);
  t.after(() => {
    try { store.close(); } catch {}
    return rm(directory, { recursive: true, force: true });
  });
  store.arquivo = arquivo;
  return store;
}

test('a migracao preserva os enderecamentos que ja existem, marcando-os como EH', async (t) => {
  const store = await abrirMigrado(t);

  const spot = store.getLocation(17695);
  assert.equal(spot.location, 'RUA 3 NIVEL 1 PRAT DIR');
  assert.equal(spot.company, 'EH');
  assert.equal(spot.revision, 2, 'a revisao anterior nao pode ser reiniciada');
  assert.equal(spot.createdBy, 'Coletor Estoque 1');
  assert.equal(store.getLocation(171).location, 'GVE-07');
  assert.equal(store.getLocationsByProductCodes(['2000']).length, 1);
});

test('a trilha de auditoria anterior continua acessivel depois da migracao', async (t) => {
  const store = await abrirMigrado(t);
  assert.deepEqual(store.getAuditEntries(17695).map(entry => entry.action), ['created']);
});

test('abrir o banco de novo nao remigra nem duplica nada', async (t) => {
  const store = await abrirMigrado(t);
  const antes = store.getLocation(17695);
  const outro = new ProductLocationStore(store.arquivo);
  assert.equal(outro.getLocation(17695).revision, antes.revision);
  assert.equal(outro.getLocation(17695).location, antes.location);
  assert.equal(outro.getLocationsByProductIds([17695, 171]).length, 2);
  assert.deepEqual(outro.getAuditEntries(17695).map(e => e.action), ['created']);
  outro.close();
});

test('o mesmo produto tem enderecos independentes em cada empresa', async (t) => {
  const store = await abrirMigrado(t);

  store.saveLocation({
    company: 'MVA',
    productId: 17695,
    productCode: '17695',
    productDescription: 'SPOT LED BF',
    location: 'RUA 7 NIVEL 2 PRAT ESQ',
    actorName: 'Coletor Estoque 2'
  });

  assert.equal(store.getLocation(17695, 'EH').location, 'RUA 3 NIVEL 1 PRAT DIR');
  assert.equal(store.getLocation(17695, 'MVA').location, 'RUA 7 NIVEL 2 PRAT ESQ');
  assert.equal(store.getLocation(17695, 'MVA').revision, 1, 'a MVA comeca a propria contagem');
  assert.equal(store.getLocationsByProductCodes(['17695'], 'MVA').length, 1);
  assert.equal(store.getLocationsByProductIds([17695], 'MVA')[0].company, 'MVA');
});

test('a consulta sem empresa continua respondendo pela EH, como as rotas antigas', async (t) => {
  const store = await abrirMigrado(t);
  store.saveLocation({
    company: 'MVA',
    productId: 171,
    productCode: '2000',
    productDescription: 'CABO PP',
    location: 'RUA 1 NIVEL 1 PRAT DIR',
    actorName: 'Coletor Estoque 2'
  });

  assert.equal(store.getLocation(171).location, 'GVE-07');
  assert.equal(store.getLocationsByProductCodes(['2000']).map(item => item.location).join(), 'GVE-07');
});

test('recusa uma empresa com formato invalido', async (t) => {
  const store = await abrirMigrado(t);
  assert.throws(() => store.getLocation(171, 'EH MVA'), error => error.status === 400);
  assert.throws(() => store.getLocation(171, 'eh;drop'), error => error.status === 400);
});



test('registra a pendencia quando o sistema externo nao aceita a gravacao', async (t) => {
  const store = await abrirMigrado(t);
  store.saveLocation({
    company: 'MVA',
    productId: 17695,
    productCode: '17695',
    productDescription: 'SPOT LED BF',
    location: 'RUA 7 NIVEL 2 PRAT ESQ',
    actorName: 'Coletor Estoque 2'
  });

  // Recem-gravado, ainda sem tentativa de sincronizacao.
  assert.equal(store.getLocation(17695, 'MVA').externalStatus, null);
  assert.equal(store.getPendingExternalSync('MVA').length, 0);

  store.markExternalSync('MVA', 17695, { status: 'pending', error: 'Clipp fora do ar.' });
  const pendentes = store.getPendingExternalSync('MVA');
  assert.equal(pendentes.length, 1);
  assert.equal(pendentes[0].location, 'RUA 7 NIVEL 2 PRAT ESQ');
  assert.equal(pendentes[0].externalError, 'Clipp fora do ar.');
  assert.equal(pendentes[0].externalSyncedAt, null);

  // O enderecamento continua valendo aqui mesmo com o Clipp fora.
  assert.equal(store.getLocation(17695, 'MVA').location, 'RUA 7 NIVEL 2 PRAT ESQ');
});

test('a pendencia some quando a gravacao externa da certo', async (t) => {
  const store = await abrirMigrado(t);
  store.saveLocation({
    company: 'MVA',
    productId: 17695,
    productCode: '17695',
    productDescription: 'SPOT LED BF',
    location: 'RUA 7 NIVEL 2 PRAT ESQ',
    actorName: 'Coletor Estoque 2'
  });
  store.markExternalSync('MVA', 17695, { status: 'pending', error: 'Clipp fora do ar.' });
  store.markExternalSync('MVA', 17695, { status: 'synced' });

  const registro = store.getLocation(17695, 'MVA');
  assert.equal(registro.externalStatus, 'synced');
  assert.equal(registro.externalError, null);
  assert.ok(registro.externalSyncedAt);
  assert.equal(store.getPendingExternalSync('MVA').length, 0);
});

test('a pendencia de uma empresa nao aparece na outra', async (t) => {
  const store = await abrirMigrado(t);
  store.saveLocation({
    company: 'MVA', productId: 17695, productCode: '17695', productDescription: 'SPOT',
    location: 'RUA 7 NIVEL 2 PRAT ESQ', actorName: 'Coletor Estoque 2'
  });
  store.markExternalSync('MVA', 17695, { status: 'pending', error: 'falhou' });

  assert.equal(store.getPendingExternalSync('MVA').length, 1);
  assert.equal(store.getPendingExternalSync('EH').length, 0);
  assert.equal(store.getLocation(17695, 'EH').externalStatus, null, 'a EH do mesmo produto segue intacta');
});

test('remover o enderecamento apaga o registro e guarda o historico', async (t) => {
  const store = await abrirMigrado(t);
  assert.equal(store.getLocation(17695).location, 'RUA 3 NIVEL 1 PRAT DIR');

  const removido = store.deleteLocation(17695, 'EH', { actorName: 'Operador ZWeb' });

  assert.equal(removido.location, 'RUA 3 NIVEL 1 PRAT DIR');
  assert.equal(store.getLocation(17695), null, 'o produto deixa de ter endereco');
  assert.equal(store.getLocationsByProductCodes(['17695']).length, 0);

  const historico = store.getAuditEntries(17695);
  assert.deepEqual(historico.map(entry => entry.action), ['created', 'deleted']);
  assert.equal(historico[1].previousLocation, 'RUA 3 NIVEL 1 PRAT DIR', 'a auditoria guarda de onde ele saiu');
  assert.equal(historico[1].nextLocation, null);
});

test('remover so mexe na empresa pedida', async (t) => {
  const store = await abrirMigrado(t);
  store.saveLocation({
    company: 'MVA', productId: 17695, productCode: '17695', productDescription: 'SPOT LED BF',
    location: 'RUA 7 NIVEL 2 PRAT ESQ', actorName: 'Coletor Estoque 2'
  });

  store.deleteLocation(17695, 'EH', { actorName: 'Operador ZWeb' });

  assert.equal(store.getLocation(17695, 'EH'), null);
  assert.equal(store.getLocation(17695, 'MVA').location, 'RUA 7 NIVEL 2 PRAT ESQ');
});

test('remover o que nao existe devolve nulo, sem erro nem auditoria', async (t) => {
  const store = await abrirMigrado(t);
  assert.equal(store.deleteLocation(99999, 'EH', { actorName: 'Operador ZWeb' }), null);
  assert.equal(store.getAuditEntries(99999).length, 0);
});

test('endereçar de novo depois de remover comeca uma contagem limpa', async (t) => {
  const store = await abrirMigrado(t);
  store.deleteLocation(17695, 'EH', { actorName: 'Operador ZWeb' });

  const novo = store.saveLocation({
    productId: 17695, productCode: '17695', productDescription: 'SPOT LED BF',
    location: 'RUA 1 NIVEL 1 PRAT DIR', actorName: 'Operador ZWeb'
  });

  assert.equal(novo.revision, 1);
  assert.deepEqual(store.getAuditEntries(17695).map(e => e.action), ['created', 'deleted', 'created']);
});

test('remover exige responsavel, para o historico nao ficar anonimo', async (t) => {
  const store = await abrirMigrado(t);
  assert.throws(() => store.deleteLocation(17695, 'EH', {}), error => error.status === 400);
  assert.equal(store.getLocation(17695).location, 'RUA 3 NIVEL 1 PRAT DIR', 'nada foi removido');
});
