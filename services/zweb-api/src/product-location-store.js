import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import { randomUUID } from 'node:crypto';
import { DatabaseSync } from 'node:sqlite';

function nowIso() {
  return new Date().toISOString();
}

function positiveInteger(value, label) {
  const number = Number(value);
  if (!Number.isSafeInteger(number) || number <= 0) {
    throw Object.assign(new Error(`${label} invalido.`), { status: 400 });
  }
  return number;
}

function shortText(value, maximumLength) {
  return String(value ?? '').replace(/\u0000/g, '').trim().slice(0, maximumLength);
}

function requiredText(value, label, maximumLength) {
  const text = shortText(value, maximumLength);
  if (!text) throw Object.assign(new Error(`${label} obrigatorio.`), { status: 400 });
  return text;
}

// Empresa padrao das rotas antigas: a extensao do ZWeb nao informa empresa,
// e tudo o que existia antes da MVA e da Eletronica Horizonte.
const DEFAULT_COMPANY = 'EH';

function companyCode(value) {
  const code = String(value ?? '').trim().toUpperCase().slice(0, 12);
  if (!code) return DEFAULT_COMPANY;
  if (!/^[A-Z0-9_-]+$/.test(code)) throw Object.assign(new Error('Empresa invalida.'), { status: 400 });
  return code;
}

function normalizedCode(value) {
  return shortText(value, 80).replace(/^0+(?=\d)/, '');
}

function codeVariants(value) {
  const code = shortText(value, 80);
  if (!code) return [];
  return [...new Set([code, normalizedCode(code)])];
}

function rowToCatalogItem(row) {
  if (!row) return null;
  return {
    productId: row.product_id,
    productCode: row.product_code,
    productDescription: row.product_description,
    barcode: row.barcode,
    updatedAt: row.updated_at
  };
}

function rowToBarcodeRequest(row, produto) {
  if (!row) return null;
  return {
    requestId: row.request_id,
    productId: row.product_id,
    productCode: row.product_code,
    productDescription: (produto && (produto.product_description ?? produto.productDescription)) || '',
    barcode: row.barcode,
    previousBarcode: row.previous_barcode || null,
    requestedBy: row.requested_by,
    createdAt: row.created_at,
    zwebStatus: row.zweb_status,
    zwebError: row.zweb_error || null,
    clippStatus: row.clipp_status,
    clippError: row.clipp_error || null
  };
}

function rowToLocation(row) {
  if (!row) return null;
  return {
    company: row.company,
    productId: row.product_id,
    productCode: row.product_code,
    productDescription: row.product_description,
    location: row.location,
    source: row.source,
    sourceObservation: row.source_observation,
    createdAt: row.created_at,
    createdBy: row.created_by,
    updatedAt: row.updated_at,
    updatedBy: row.updated_by,
    revision: row.revision,
    externalStatus: row.external_status || null,
    externalError: row.external_error || null,
    externalSyncedAt: row.external_synced_at || null
  };
}

function rowToShelfBatch(row, items = []) {
  if (!row) return null;
  return {
    batchId: row.batch_id,
    company: row.company,
    location: row.location,
    requestedBy: row.requested_by,
    createdAt: row.created_at,
    status: row.status,
    error: row.error_message || null,
    completedAt: row.completed_at || null,
    items: items.map(item => ({
      itemId: item.item_id,
      scannedCode: item.scanned_code,
      productId: item.product_id || null,
      productCode: item.product_code,
      productDescription: item.product_description || '',
      barcode: item.barcode || null,
      status: item.status,
      error: item.error_message || null,
      appliedAt: item.applied_at || null
    }))
  };
}

export class ProductLocationStore {
  constructor(databaseFile) {
    mkdirSync(dirname(databaseFile), { recursive: true });
    this.database = new DatabaseSync(databaseFile);
    this.database.exec('PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON;');
    this.database.exec(`
      CREATE TABLE IF NOT EXISTS product_locations (
        company TEXT NOT NULL DEFAULT 'EH',
        product_id INTEGER NOT NULL,
        product_code TEXT NOT NULL,
        product_description TEXT NOT NULL DEFAULT '',
        location TEXT NOT NULL,
        source TEXT NOT NULL,
        source_observation TEXT,
        created_at TEXT NOT NULL,
        created_by TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        updated_by TEXT NOT NULL,
        revision INTEGER NOT NULL DEFAULT 1,
        external_status TEXT,
        external_error TEXT,
        external_synced_at TEXT,
        PRIMARY KEY (company, product_id)
      );
      CREATE INDEX IF NOT EXISTS idx_product_locations_code ON product_locations(product_code);
      CREATE INDEX IF NOT EXISTS idx_product_locations_location ON product_locations(location);

      CREATE TABLE IF NOT EXISTS product_location_audit (
        audit_id INTEGER PRIMARY KEY AUTOINCREMENT,
        company TEXT NOT NULL DEFAULT 'EH',
        product_id INTEGER NOT NULL,
        action TEXT NOT NULL,
        previous_location TEXT,
        next_location TEXT,
        source_observation TEXT,
        actor_name TEXT NOT NULL,
        migration_run_id TEXT,
        created_at TEXT NOT NULL
      );
      CREATE INDEX IF NOT EXISTS idx_product_location_audit_product ON product_location_audit(product_id, audit_id);

      CREATE TABLE IF NOT EXISTS product_location_import_runs (
        run_id TEXT PRIMARY KEY,
        source TEXT NOT NULL,
        requested_by TEXT NOT NULL,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        finished_at TEXT
      );

      CREATE TABLE IF NOT EXISTS product_location_migration_state (
        migration_key TEXT PRIMARY KEY,
        run_id TEXT NOT NULL,
        state TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS product_location_import_items (
        run_id TEXT NOT NULL,
        product_id INTEGER NOT NULL,
        product_code TEXT NOT NULL,
        product_description TEXT NOT NULL,
        observation TEXT NOT NULL,
        observation_signature TEXT NOT NULL,
        status TEXT NOT NULL,
        needs_description_review INTEGER NOT NULL DEFAULT 0,
        error_message TEXT,
        updated_at TEXT NOT NULL,
        PRIMARY KEY (run_id, product_id),
        FOREIGN KEY (run_id) REFERENCES product_location_import_runs(run_id) ON DELETE CASCADE
      );
      CREATE INDEX IF NOT EXISTS idx_product_location_import_pending ON product_location_import_items(run_id, status, product_id);

      CREATE TABLE IF NOT EXISTS product_catalog (
        product_id INTEGER PRIMARY KEY,
        product_code TEXT NOT NULL,
        normalized_code TEXT NOT NULL,
        product_description TEXT NOT NULL DEFAULT '',
        barcode TEXT,
        normalized_barcode TEXT,
        updated_at TEXT NOT NULL
      );
      CREATE INDEX IF NOT EXISTS idx_product_catalog_code ON product_catalog(normalized_code);
      CREATE INDEX IF NOT EXISTS idx_product_catalog_barcode ON product_catalog(normalized_barcode);

      -- Codigo de barras associado no coletor. O Clipp e o catalogo daqui sao
      -- gravados na hora; o ZWeb depende da sessao do navegador, entao fica
      -- nesta fila ate a extensao aplicar.
      CREATE TABLE IF NOT EXISTS product_barcode_requests (
        request_id INTEGER PRIMARY KEY AUTOINCREMENT,
        product_id INTEGER NOT NULL,
        product_code TEXT NOT NULL,
        barcode TEXT NOT NULL,
        previous_barcode TEXT,
        requested_by TEXT NOT NULL,
        created_at TEXT NOT NULL,
        zweb_status TEXT NOT NULL DEFAULT 'pending',
        zweb_error TEXT,
        zweb_applied_at TEXT,
        clipp_status TEXT NOT NULL DEFAULT 'pending',
        clipp_error TEXT
      );
      CREATE INDEX IF NOT EXISTS idx_barcode_requests_zweb ON product_barcode_requests(zweb_status, request_id);

      -- O coletor junta uma prateleira inteira antes de a extensao tocar no
      -- ZWeb. Assim, a leitura no corredor nao vira uma sequencia de RPCs.
      CREATE TABLE IF NOT EXISTS product_shelf_batches (
        batch_id TEXT PRIMARY KEY,
        company TEXT NOT NULL,
        location TEXT NOT NULL,
        requested_by TEXT NOT NULL,
        created_at TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'pending',
        error_message TEXT,
        completed_at TEXT
      );
      CREATE INDEX IF NOT EXISTS idx_product_shelf_batches_pending
        ON product_shelf_batches(status, created_at);

      CREATE TABLE IF NOT EXISTS product_shelf_batch_items (
        batch_id TEXT NOT NULL,
        item_id INTEGER NOT NULL,
        scanned_code TEXT NOT NULL,
        product_id INTEGER,
        product_code TEXT NOT NULL,
        product_description TEXT,
        barcode TEXT,
        status TEXT NOT NULL DEFAULT 'pending',
        error_message TEXT,
        applied_at TEXT,
        PRIMARY KEY (batch_id, item_id),
        FOREIGN KEY (batch_id) REFERENCES product_shelf_batches(batch_id) ON DELETE CASCADE
      );
      CREATE INDEX IF NOT EXISTS idx_product_shelf_batch_items_pending
        ON product_shelf_batch_items(batch_id, status, item_id);

      CREATE TABLE IF NOT EXISTS product_catalog_state (
        state_key TEXT PRIMARY KEY,
        state_value TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );
    `);
    this.migrateToCompanies();
    this.migrateToExternalSync();
    // Depois das migracoes, quando as colunas existem nos dois caminhos.
    this.database.exec('CREATE INDEX IF NOT EXISTS idx_product_locations_pendentes ON product_locations(company, external_status)');
  }

  // A MVA usa o ClippStore, onde o enderecamento e projetado na observacao do
  // produto. Se o Clipp estiver fora do ar, o enderecamento e gravado aqui
  // assim mesmo e fica marcado como pendente, para o coletor nao parar.
  migrateToExternalSync() {
    const colunas = this.database.prepare("PRAGMA table_info('product_locations')").all().map(coluna => coluna.name);
    const novas = [
      ['external_status', 'TEXT'],
      ['external_error', 'TEXT'],
      ['external_synced_at', 'TEXT']
    ].filter(([nome]) => !colunas.includes(nome));
    if (!novas.length) return;
    this.database.exec('BEGIN IMMEDIATE');
    try {
      novas.forEach(([nome, tipo]) => this.database.exec(`ALTER TABLE product_locations ADD COLUMN ${nome} ${tipo}`));
      this.database.exec('COMMIT');
    } catch (error) {
      this.database.exec('ROLLBACK');
      throw error;
    }
  }

  // O banco nasceu atendendo so a Eletronica Horizonte, com o produto como
  // chave. Com a MVA entrando, o mesmo produto passa a ter um endereco por
  // empresa, entao a chave vira (empresa, produto) e o que ja existe fica
  // como EH. Roda uma vez so: a presenca da coluna sinaliza que ja migrou.
  migrateToCompanies() {
    const colunas = this.database.prepare("PRAGMA table_info('product_locations')").all();
    if (!colunas.length || colunas.some(coluna => coluna.name === 'company')) return;

    this.database.exec('BEGIN IMMEDIATE');
    try {
      this.database.exec(`
        CREATE TABLE product_locations_migrado (
          company TEXT NOT NULL DEFAULT '${DEFAULT_COMPANY}',
          product_id INTEGER NOT NULL,
          product_code TEXT NOT NULL,
          product_description TEXT NOT NULL DEFAULT '',
          location TEXT NOT NULL,
          source TEXT NOT NULL,
          source_observation TEXT,
          created_at TEXT NOT NULL,
          created_by TEXT NOT NULL,
          updated_at TEXT NOT NULL,
          updated_by TEXT NOT NULL,
          revision INTEGER NOT NULL DEFAULT 1,
          PRIMARY KEY (company, product_id)
        );
        INSERT INTO product_locations_migrado (
          company, product_id, product_code, product_description, location, source,
          source_observation, created_at, created_by, updated_at, updated_by, revision
        )
        SELECT '${DEFAULT_COMPANY}', product_id, product_code, product_description, location, source,
               source_observation, created_at, created_by, updated_at, updated_by, revision
        FROM product_locations;
        DROP TABLE product_locations;
        ALTER TABLE product_locations_migrado RENAME TO product_locations;
        CREATE INDEX IF NOT EXISTS idx_product_locations_code ON product_locations(product_code);
        CREATE INDEX IF NOT EXISTS idx_product_locations_location ON product_locations(location);
        ALTER TABLE product_location_audit ADD COLUMN company TEXT NOT NULL DEFAULT '${DEFAULT_COMPANY}';
      `);
      this.database.exec('COMMIT');
    } catch (error) {
      this.database.exec('ROLLBACK');
      throw error;
    }
  }

  close() {
    this.database.close();
  }

  getLocation(productId, company) {
    const row = this.database.prepare('SELECT * FROM product_locations WHERE company = ? AND product_id = ?')
      .get(companyCode(company), positiveInteger(productId, 'Produto'));
    return rowToLocation(row);
  }

  getLocationsByProductIds(productIds, company) {
    const uniqueIds = [...new Set((Array.isArray(productIds) ? productIds : []).map(item => positiveInteger(item, 'Produto')))];
    if (!uniqueIds.length) return [];
    if (uniqueIds.length > 200) throw Object.assign(new Error('Informe no maximo 200 produtos por consulta.'), { status: 400 });
    const placeholders = uniqueIds.map(() => '?').join(',');
    return this.database.prepare(`SELECT * FROM product_locations WHERE company = ? AND product_id IN (${placeholders})`)
      .all(companyCode(company), ...uniqueIds).map(rowToLocation);
  }

  getLocationsByProductCodes(productCodes, company) {
    const uniqueCodes = [...new Set((Array.isArray(productCodes) ? productCodes : [])
      .map(code => shortText(code, 80))
      .filter(Boolean))];
    if (!uniqueCodes.length) return [];
    if (uniqueCodes.length > 200) throw Object.assign(new Error('Informe no maximo 200 produtos por consulta.'), { status: 400 });
    const placeholders = uniqueCodes.map(() => '?').join(',');
    return this.database.prepare(`SELECT * FROM product_locations WHERE company = ? AND product_code IN (${placeholders})`)
      .all(companyCode(company), ...uniqueCodes).map(rowToLocation);
  }

  getLocationByProductCode(productCode, company) {
    const code = requiredText(productCode, 'Codigo do produto', 80);
    const row = this.database.prepare(`
      SELECT * FROM product_locations
      WHERE company = ? AND product_code = ?
      ORDER BY updated_at DESC
      LIMIT 1
    `).get(companyCode(company), code);
    return rowToLocation(row);
  }

  saveLocationByProductCode(input) {
    const productCode = requiredText(input && input.productCode, 'Codigo do produto', 80);
    const company = companyCode(input && input.company);
    const existing = this.getLocationByProductCode(productCode, company);
    // Cadastros migrados conservaram o antigo ID numérico. Para um item novo,
    // o código sequencial é a chave estável que o formulário ainda expõe.
    const productId = existing ? existing.productId : positiveInteger(productCode, 'Codigo do produto');
    return this.saveLocation({ ...input, company, productId, productCode });
  }

  deleteLocationByProductCode(productCode, company, options = {}) {
    const existing = this.getLocationByProductCode(productCode, company);
    if (!existing) return null;
    return this.deleteLocation(existing.productId, company, options);
  }

  saveLocation(input) {
    const company = companyCode(input && input.company);
    const productId = positiveInteger(input && input.productId, 'Produto');
    const productCode = requiredText(input && input.productCode, 'Codigo do produto', 80);
    const productDescription = shortText(input && input.productDescription, 500);
    const location = requiredText(input && input.location, 'Enderecamento', 180);
    const actorName = requiredText(input && input.actorName, 'Responsavel', 120);
    const source = shortText(input && input.source, 60) || 'manual';
    const sourceObservation = shortText(input && input.sourceObservation, 1000) || null;
    const migrationRunId = shortText(input && input.migrationRunId, 80) || null;
    const previous = this.getLocation(productId, company);
    const at = nowIso();

    this.database.exec('BEGIN IMMEDIATE');
    try {
      if (previous) {
        this.database.prepare(`
          UPDATE product_locations
          SET product_code = ?, product_description = ?, location = ?, source = ?, source_observation = ?,
              updated_at = ?, updated_by = ?, revision = revision + 1
          WHERE company = ? AND product_id = ?
        `).run(productCode, productDescription, location, source, sourceObservation, at, actorName, company, productId);
      } else {
        this.database.prepare(`
          INSERT INTO product_locations (
            company, product_id, product_code, product_description, location, source, source_observation,
            created_at, created_by, updated_at, updated_by
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).run(company, productId, productCode, productDescription, location, source, sourceObservation, at, actorName, at, actorName);
      }
      this.database.prepare(`
        INSERT INTO product_location_audit (
          company, product_id, action, previous_location, next_location, source_observation, actor_name, migration_run_id, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(company, productId, previous ? 'updated' : 'created', previous && previous.location || null, location, sourceObservation, actorName, migrationRunId, at);
      this.database.exec('COMMIT');
    } catch (error) {
      this.database.exec('ROLLBACK');
      throw error;
    }
    return this.getLocation(productId, company);
  }

  /// Remove o enderecamento, guardando na auditoria onde o produto estava.
  ///
  /// Apagar e uma decisao tao real quanto endereçar: o produto saiu do lugar e
  /// ninguem sabe para onde. O historico registra que estava em algum lugar e
  /// deixou de estar.
  deleteLocation(productId, company, options = {}) {
    const empresa = companyCode(company);
    const identificador = positiveInteger(productId, 'Produto');
    const anterior = this.getLocation(identificador, empresa);
    if (!anterior) return null;

    const responsavel = requiredText(options.actorName, 'Responsavel', 120);
    const at = nowIso();
    this.database.exec('BEGIN IMMEDIATE');
    try {
      this.database.prepare('DELETE FROM product_locations WHERE company = ? AND product_id = ?')
        .run(empresa, identificador);
      this.database.prepare(`
        INSERT INTO product_location_audit (
          company, product_id, action, previous_location, next_location, source_observation, actor_name, migration_run_id, created_at
        ) VALUES (?, ?, 'deleted', ?, NULL, NULL, ?, NULL, ?)
      `).run(empresa, identificador, anterior.location, responsavel, at);
      this.database.exec('COMMIT');
    } catch (error) {
      this.database.exec('ROLLBACK');
      throw error;
    }
    return anterior;
  }

  /// Registra como foi a gravacao no sistema externo daquela empresa.
  markExternalSync(company, productId, { status, error } = {}) {
    const situacao = shortText(status, 20) || 'synced';
    const mensagem = situacao === 'synced' ? null : (shortText(error, 500) || 'Falha desconhecida.');
    const alteradas = this.database.prepare(`
      UPDATE product_locations
      SET external_status = ?, external_error = ?, external_synced_at = ?
      WHERE company = ? AND product_id = ?
    `).run(situacao, mensagem, situacao === 'synced' ? nowIso() : null, companyCode(company), positiveInteger(productId, 'Produto')).changes;
    if (!alteradas) throw Object.assign(new Error('Enderecamento nao encontrado.'), { status: 404 });
    return this.getLocation(productId, company);
  }

  /// Enderecamentos que ainda nao chegaram ao sistema externo da empresa.
  getPendingExternalSync(company, limit = 100) {
    const maximo = Math.max(1, Math.min(500, Number(limit) || 100));
    return this.database.prepare(`
      SELECT * FROM product_locations
      WHERE company = ? AND external_status = 'pending'
      ORDER BY updated_at LIMIT ?
    `).all(companyCode(company), maximo).map(rowToLocation);
  }

  getAuditEntries(productId, company) {
    return this.database.prepare(`
      SELECT action, previous_location AS previousLocation, next_location AS nextLocation, created_at AS createdAt
      FROM product_location_audit WHERE company = ? AND product_id = ? ORDER BY audit_id
    `).all(companyCode(company), positiveInteger(productId, 'Produto'));
  }

  createImportRun(input) {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
    const source = shortText(input && input.source, 60) || 'zweb-observation';
    const requestedBy = requiredText(input && input.requestedBy, 'Responsavel', 120);
    const at = nowIso();
    this.database.exec('BEGIN IMMEDIATE');
    try {
      if (source === 'zweb-observation') {
        const existing = this.database.prepare('SELECT run_id, state FROM product_location_migration_state WHERE migration_key = ?').get(source);
        if (existing) {
          throw Object.assign(new Error(existing.state === 'running'
            ? 'Uma transferencia de enderecamentos ja esta em andamento.'
            : 'A transferencia de enderecamentos ja foi concluida.'), { status: 409 });
        }
        this.database.prepare(`
          INSERT INTO product_location_migration_state (migration_key, run_id, state, updated_at)
          VALUES (?, ?, 'running', ?)
        `).run(source, id, at);
      }
      this.database.prepare(`
        INSERT INTO product_location_import_runs (run_id, source, requested_by, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?)
      `).run(id, source, requestedBy, at, at);
      this.database.exec('COMMIT');
    } catch (error) {
      this.database.exec('ROLLBACK');
      throw error;
    }
    return { id, source, requestedBy, createdAt: at };
  }

  finishImportRun(runId) {
    const safeRunId = requiredText(runId, 'Identificador da importacao', 80);
    const run = this.database.prepare('SELECT source FROM product_location_import_runs WHERE run_id = ?').get(safeRunId);
    if (!run) throw Object.assign(new Error('Importacao nao encontrada.'), { status: 404 });
    const at = nowIso();
    this.database.exec('BEGIN IMMEDIATE');
    try {
      this.database.prepare('UPDATE product_location_import_runs SET finished_at = ?, updated_at = ? WHERE run_id = ?').run(at, at, safeRunId);
      if (run.source === 'zweb-observation') {
        this.database.prepare(`
          UPDATE product_location_migration_state SET state = 'completed', updated_at = ?
          WHERE migration_key = ? AND run_id = ?
        `).run(at, run.source, safeRunId);
      }
      this.database.exec('COMMIT');
    } catch (error) {
      this.database.exec('ROLLBACK');
      throw error;
    }
  }

  resumeImportRun(runId) {
    const safeRunId = requiredText(runId, 'Identificador da importacao', 80);
    const run = this.database.prepare('SELECT source FROM product_location_import_runs WHERE run_id = ?').get(safeRunId);
    if (!run) throw Object.assign(new Error('Importacao nao encontrada.'), { status: 404 });
    const at = nowIso();
    this.database.exec('BEGIN IMMEDIATE');
    try {
      this.database.prepare(`
        UPDATE product_location_import_items
        SET status = 'pending', error_message = NULL, updated_at = ?
        WHERE run_id = ? AND status = 'failed' AND error_message = ?
      `).run(at, safeRunId, 'A sessao do ZWeb nao esta disponivel nesta aba.');
      this.database.prepare(`
        UPDATE product_location_import_runs SET finished_at = NULL, updated_at = ? WHERE run_id = ?
      `).run(at, safeRunId);
      if (run.source === 'zweb-observation') {
        this.database.prepare(`
          UPDATE product_location_migration_state SET state = 'running', updated_at = ?
          WHERE migration_key = ? AND run_id = ?
        `).run(at, run.source, safeRunId);
      }
      this.database.exec('COMMIT');
    } catch (error) {
      this.database.exec('ROLLBACK');
      throw error;
    }
    return this.getImportRun(safeRunId);
  }

  upsertImportItems(runId, items) {
    const safeRunId = requiredText(runId, 'Identificador da importacao', 80);
    if (!Array.isArray(items) || !items.length || items.length > 250) {
      throw Object.assign(new Error('Informe entre 1 e 250 itens para a importacao.'), { status: 400 });
    }
    const at = nowIso();
    const statement = this.database.prepare(`
      INSERT INTO product_location_import_items (
        run_id, product_id, product_code, product_description, observation, observation_signature,
        status, needs_description_review, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(run_id, product_id) DO UPDATE SET
        product_code = excluded.product_code,
        product_description = excluded.product_description,
        observation = excluded.observation,
        observation_signature = excluded.observation_signature,
        status = excluded.status,
        needs_description_review = excluded.needs_description_review,
        error_message = NULL,
        updated_at = excluded.updated_at
    `);
    this.database.exec('BEGIN IMMEDIATE');
    try {
      items.forEach(item => {
        const productId = positiveInteger(item && item.productId, 'Produto');
        const observation = String(item && item.observation || '');
        const requestedStatus = String(item && item.status || '');
        const cleanupOnly = item && item.cleanupOnly === true;
        const status = requestedStatus === 'ignored_empty'
          ? 'ignored_empty'
          : (cleanupOnly ? 'pending_cleanup' : 'pending');
        statement.run(
          safeRunId,
          productId,
          requiredText(item && item.productCode, 'Codigo do produto', 80),
          shortText(item && item.productDescription, 500),
          observation.slice(0, 1000),
          String(item && item.observationSignature || ''),
          status,
          item && item.needsDescriptionReview ? 1 : 0,
          at
        );
      });
      this.database.prepare('UPDATE product_location_import_runs SET updated_at = ? WHERE run_id = ?').run(at, safeRunId);
      this.database.exec('COMMIT');
    } catch (error) {
      this.database.exec('ROLLBACK');
      throw error;
    }
  }

  getPendingImportItems(runId, limit = 25) {
    const safeLimit = Math.max(1, Math.min(250, Number(limit) || 25));
    return this.database.prepare(`
      SELECT product_id AS productId, product_code AS productCode, product_description AS productDescription,
             observation, observation_signature AS observationSignature, status,
             needs_description_review AS needsDescriptionReview
      FROM product_location_import_items
      WHERE run_id = ? AND status IN ('pending', 'pending_cleanup', 'location_saved')
      ORDER BY product_id LIMIT ?
    `).all(requiredText(runId, 'Identificador da importacao', 80), safeLimit).map(item => ({
      ...item,
      needsDescriptionReview: item.needsDescriptionReview === 1
    }));
  }

  getFailedImportItems(runId, limit = 25) {
    const safeLimit = Math.max(1, Math.min(250, Number(limit) || 25));
    return this.database.prepare(`
      SELECT product_id AS productId, product_code AS productCode, product_description AS productDescription,
             error_message AS errorMessage
      FROM product_location_import_items
      WHERE run_id = ? AND status = 'failed'
      ORDER BY product_id LIMIT ?
    `).all(requiredText(runId, 'Identificador da importacao', 80), safeLimit).map(item => ({ ...item }));
  }

  markImportItemLocationSaved(runId, productId) {
    this.updateImportItemStatus(runId, productId, 'location_saved');
  }

  markImportItemCleared(runId, productId, options = {}) {
    this.updateImportItemStatus(runId, productId, options.cleanupOnly ? 'cleared_invalid_observation' : 'cleared');
  }

  markImportItemFailed(runId, productId, message) {
    this.updateImportItemStatus(runId, productId, 'failed', shortText(message, 500));
  }

  updateImportItemStatus(runId, productId, status, errorMessage = null) {
    const safeRunId = requiredText(runId, 'Identificador da importacao', 80);
    const changes = this.database.prepare(`
      UPDATE product_location_import_items SET status = ?, error_message = ?, updated_at = ?
      WHERE run_id = ? AND product_id = ?
    `).run(status, errorMessage, nowIso(), safeRunId, positiveInteger(productId, 'Produto')).changes;
    if (!changes) throw Object.assign(new Error('Item da importacao nao encontrado.'), { status: 404 });
  }

  getImportRun(runId) {
    const safeRunId = requiredText(runId, 'Identificador da importacao', 80);
    const run = this.database.prepare(`
      SELECT run_id AS id, source, requested_by AS requestedBy, created_at AS createdAt,
             updated_at AS updatedAt, finished_at AS finishedAt
      FROM product_location_import_runs WHERE run_id = ?
    `).get(safeRunId);
    if (!run) return null;
    const counts = {
      pending: 0,
      pending_cleanup: 0,
      location_saved: 0,
      cleared: 0,
      cleared_invalid_observation: 0,
      failed: 0,
      ignored_empty: 0,
      numeric_description_review: 0
    };
    this.database.prepare(`
      SELECT status, COUNT(*) AS total FROM product_location_import_items WHERE run_id = ? GROUP BY status
    `).all(safeRunId).forEach(row => { counts[row.status] = row.total; });
    counts.numeric_description_review = this.database.prepare(`
      SELECT COUNT(*) AS total FROM product_location_import_items
      WHERE run_id = ? AND needs_description_review = 1
    `).get(safeRunId).total;
    return { ...run, counts };
  }

  getLatestImportRunBySource(source) {
    const run = this.database.prepare(`
      SELECT run_id AS id FROM product_location_import_runs
      WHERE source = ? ORDER BY created_at DESC LIMIT 1
    `).get(shortText(source, 60));
    return run ? this.getImportRun(run.id) : null;
  }

  upsertCatalogItems(items) {
    if (!Array.isArray(items) || !items.length || items.length > 250) {
      throw Object.assign(new Error('Informe entre 1 e 250 produtos por sincronizacao.'), { status: 400 });
    }
    const at = nowIso();
    const statement = this.database.prepare(`
      INSERT INTO product_catalog (
        product_id, product_code, normalized_code, product_description, barcode, normalized_barcode, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(product_id) DO UPDATE SET
        product_code = excluded.product_code,
        normalized_code = excluded.normalized_code,
        product_description = excluded.product_description,
        barcode = excluded.barcode,
        normalized_barcode = excluded.normalized_barcode,
        updated_at = excluded.updated_at
    `);
    this.database.exec('BEGIN IMMEDIATE');
    try {
      items.forEach(item => {
        const productCode = requiredText(item && item.productCode, 'Codigo do produto', 80);
        const barcode = shortText(item && item.barcode, 80) || null;
        statement.run(
          positiveInteger(item && item.productId, 'Produto'),
          productCode,
          normalizedCode(productCode),
          shortText(item && item.productDescription, 500),
          barcode,
          barcode ? normalizedCode(barcode) : null,
          at
        );
      });
      this.database.exec('COMMIT');
    } catch (error) {
      this.database.exec('ROLLBACK');
      throw error;
    }
    return this.getCatalogStatus();
  }

  getCatalogStatus() {
    const row = this.database.prepare('SELECT COUNT(*) AS items, MAX(updated_at) AS updatedAt FROM product_catalog').get();
    const completed = this.database.prepare("SELECT state_value AS value, updated_at AS updatedAt FROM product_catalog_state WHERE state_key = 'last_full_sync'").get();
    return {
      items: row.items,
      updatedAt: row.updatedAt || null,
      // Uma varredura interrompida nao registra conclusao, entao a proxima
      // estacao que abrir a lista de produtos recomeca em vez de esperar.
      completedAt: completed ? completed.updatedAt : null,
      completedItems: completed ? Number(completed.value) : null
    };
  }

  markCatalogSyncCompleted(items) {
    const total = Number(items);
    if (!Number.isSafeInteger(total) || total < 0) {
      throw Object.assign(new Error('Total de produtos sincronizados invalido.'), { status: 400 });
    }
    this.database.prepare(`
      INSERT INTO product_catalog_state (state_key, state_value, updated_at)
      VALUES ('last_full_sync', ?, ?)
      ON CONFLICT(state_key) DO UPDATE SET state_value = excluded.state_value, updated_at = excluded.updated_at
    `).run(String(total), nowIso());
    return this.getCatalogStatus();
  }

  /// Associa um codigo de barras lido a um produto do catalogo.
  ///
  /// Recusa quando o codigo ja pertence a outro produto: com dois donos, a
  /// leitura no corredor passaria a ser ambigua, que e o oposto do objetivo.
  createBarcodeRequest({ productCode, barcode, requestedBy }) {
    const codigo = requiredText(productCode, 'Codigo do produto', 80);
    const codigoBarras = requiredText(barcode, 'Codigo de barras', 80);
    const responsavel = requiredText(requestedBy, 'Responsavel', 120);

    const produto = this.database.prepare('SELECT * FROM product_catalog WHERE normalized_code = ?').get(normalizedCode(codigo));
    if (!produto) throw Object.assign(new Error(`Produto ${codigo} nao existe no catalogo.`), { status: 404 });

    const dono = this.database.prepare(
      'SELECT product_id, product_code, product_description FROM product_catalog WHERE normalized_barcode = ? AND product_id <> ?'
    ).get(normalizedCode(codigoBarras), produto.product_id);
    if (dono) {
      throw Object.assign(
        new Error(`O codigo ${codigoBarras} ja e do produto ${dono.product_code} (${dono.product_description}).`),
        { status: 409 }
      );
    }

    const duplicatePending = this.database.prepare(`
      SELECT r.*, c.product_description
      FROM product_barcode_requests r
      LEFT JOIN product_catalog c ON c.product_id = r.product_id
      WHERE r.product_id = ? AND r.barcode = ? AND r.zweb_status = 'pending'
      ORDER BY r.request_id DESC LIMIT 1
    `).get(produto.product_id, codigoBarras);
    if (duplicatePending) return rowToBarcodeRequest(duplicatePending, duplicatePending);

    const at = nowIso();
    const anterior = produto.barcode || null;
    this.database.exec('BEGIN IMMEDIATE');
    try {
      this.database.prepare(`
        INSERT INTO product_barcode_requests (
          product_id, product_code, barcode, previous_barcode, requested_by, created_at
        ) VALUES (?, ?, ?, ?, ?, ?)
      `).run(produto.product_id, produto.product_code, codigoBarras, anterior, responsavel, at);
      this.database.exec('COMMIT');
    } catch (error) {
      this.database.exec('ROLLBACK');
      throw error;
    }

    const criado = this.database.prepare('SELECT * FROM product_barcode_requests ORDER BY request_id DESC LIMIT 1').get();
    return rowToBarcodeRequest(criado, produto);
  }

  getPendingBarcodeRequests(limit = 50) {
    const maximo = Math.max(1, Math.min(200, Number(limit) || 50));
    return this.database.prepare(`
      SELECT r.*, c.product_description
      FROM product_barcode_requests r
      LEFT JOIN product_catalog c ON c.product_id = r.product_id
      WHERE r.zweb_status = 'pending' ORDER BY r.request_id LIMIT ?
    `).all(maximo).map(linha => rowToBarcodeRequest(linha, linha));
  }

  markBarcodeRequest(requestId, sistema, { status, error } = {}) {
    const identificador = positiveInteger(requestId, 'Solicitacao');
    const situacao = shortText(status, 20) || 'applied';
    const mensagem = situacao === 'applied' ? null : (shortText(error, 500) || 'Falha desconhecida.');
    const coluna = sistema === 'clipp' ? 'clipp' : 'zweb';
    const aplicado = coluna === 'zweb' ? ', zweb_applied_at = ?' : '';
    const parametros = coluna === 'zweb'
      ? [situacao, mensagem, situacao === 'applied' ? nowIso() : null, identificador]
      : [situacao, mensagem, identificador];
    this.database.exec('BEGIN IMMEDIATE');
    try {
      const alteradas = this.database.prepare(
        `UPDATE product_barcode_requests SET ${coluna}_status = ?, ${coluna}_error = ?${aplicado} WHERE request_id = ?`
      ).run(...parametros).changes;
      if (!alteradas) throw Object.assign(new Error('Solicitacao nao encontrada.'), { status: 404 });

      // O catalogo e uma fotografia confirmada, nao uma previsao da fila. Isso
      // impede que um barcode apagado no ZWeb continue sendo identificado pelo
      // coletor apenas porque ja chegou a ser solicitado anteriormente.
      if (coluna === 'zweb' && situacao === 'applied') {
        const request = this.database.prepare(
          'SELECT product_id, barcode FROM product_barcode_requests WHERE request_id = ?'
        ).get(identificador);
        this.database.prepare(`
          UPDATE product_catalog
          SET barcode = ?, normalized_barcode = ?, updated_at = ?
          WHERE product_id = ?
        `).run(request.barcode, normalizedCode(request.barcode), nowIso(), request.product_id);
        // Uma tentativa repetida com o mesmo produto e valor representa a
        // mesma alteracao. Ao confirmar uma delas, as antigas deixam de ficar
        // na fila e de provocar novas leituras desnecessarias no ZWeb.
        this.database.prepare(`
          UPDATE product_barcode_requests
          SET zweb_status = 'applied', zweb_error = NULL, zweb_applied_at = ?
          WHERE product_id = ? AND barcode = ? AND zweb_status = 'pending'
        `).run(nowIso(), request.product_id, request.barcode);
      }
      this.database.exec('COMMIT');
    } catch (error) {
      this.database.exec('ROLLBACK');
      throw error;
    }
  }

  resolveScannedCodes(codes, company) {
    const empresa = companyCode(company);
    const scannedCodes = [...new Set((Array.isArray(codes) ? codes : []).map(code => shortText(code, 80)).filter(Boolean))];
    if (!scannedCodes.length) return [];
    if (scannedCodes.length > 200) throw Object.assign(new Error('Informe no maximo 200 codigos por leitura.'), { status: 400 });

    const lookupValues = [...new Set(scannedCodes.flatMap(codeVariants))];
    const placeholders = lookupValues.map(() => '?').join(',');
    const rows = this.database.prepare(`
      SELECT catalog.*, location.location AS current_location
      FROM product_catalog AS catalog
      LEFT JOIN product_locations AS location
        ON location.product_id = catalog.product_id AND location.company = ?
      WHERE catalog.normalized_code IN (${placeholders}) OR catalog.normalized_barcode IN (${placeholders})
    `).all(empresa, ...lookupValues, ...lookupValues);

    const byLookupValue = new Map();
    rows.forEach(row => {
      if (!byLookupValue.has(row.normalized_code)) byLookupValue.set(row.normalized_code, row);
      if (row.normalized_barcode && !byLookupValue.has(row.normalized_barcode)) byLookupValue.set(row.normalized_barcode, row);
    });

    return scannedCodes.map(scannedCode => {
      const row = codeVariants(scannedCode).map(variant => byLookupValue.get(variant)).find(Boolean);
      if (!row) return { scannedCode, found: false };
      return {
        scannedCode,
        found: true,
        ...rowToCatalogItem(row),
        currentLocation: row.current_location || null
      };
    });
  }

  assignScannedLocations(input) {
    const company = companyCode(input && input.company);
    const location = requiredText(input && input.location, 'Enderecamento', 180);
    const actorName = requiredText(input && input.actorName, 'Responsavel', 120);
    const source = shortText(input && input.source, 60) || 'mobile_scan';
    const resolved = this.resolveScannedCodes(input && input.codes, company);
    if (!resolved.length) throw Object.assign(new Error('Informe ao menos um codigo lido.'), { status: 400 });

    return resolved.map(item => {
      if (!item.found) {
        return { scannedCode: item.scannedCode, status: 'not_found', message: 'Produto nao encontrado no catalogo.' };
      }
      try {
        const saved = this.saveLocation({
          company,
          productId: item.productId,
          productCode: item.productCode,
          productDescription: item.productDescription,
          location,
          actorName,
          source
        });
        return {
          scannedCode: item.scannedCode,
          status: 'success',
          productId: saved.productId,
          productCode: saved.productCode,
          productDescription: saved.productDescription,
          location: saved.location,
          revision: saved.revision,
          message: `Endereco '${saved.location}' atribuido com sucesso.`
        };
      } catch (error) {
        return {
          scannedCode: item.scannedCode,
          status: 'error',
          productId: item.productId,
          message: error && error.message || 'Falha ao salvar o enderecamento.'
        };
      }
    });
  }

  createShelfBatch({ company, location, requestedBy, items }) {
    const empresa = companyCode(company);
    const endereco = requiredText(location, 'Enderecamento', 180);
    const responsavel = requiredText(requestedBy, 'Responsavel', 120);
    const sourceItems = Array.isArray(items) ? items : [];
    if (!sourceItems.length) throw Object.assign(new Error('Informe ao menos um item para o lote.'), { status: 400 });
    if (sourceItems.length > 20) throw Object.assign(new Error('O lote suporta no maximo 20 itens.'), { status: 400 });

    const uniqueProducts = new Set();
    const normalizedItems = sourceItems.map((item, index) => {
      const scannedCode = requiredText(item && item.scannedCode, 'Codigo lido', 80);
      const productCode = requiredText(item && item.productCode, 'Codigo do produto', 80);
      const barcode = shortText(item && item.barcode, 80) || null;
      const productId = item && item.productId == null ? null : positiveInteger(item.productId, 'Produto');
      const key = `${normalizedCode(productCode)}:${barcode ? normalizedCode(barcode) : ''}`;
      if (uniqueProducts.has(key)) throw Object.assign(new Error(`O produto ${productCode} aparece mais de uma vez no lote.`), { status: 409 });
      uniqueProducts.add(key);
      return {
        itemId: index + 1,
        scannedCode,
        productCode,
        productId,
        productDescription: shortText(item && item.productDescription, 500),
        barcode
      };
    });

    const batchId = randomUUID();
    const createdAt = nowIso();
    this.database.exec('BEGIN IMMEDIATE');
    try {
      this.database.prepare(`
        INSERT INTO product_shelf_batches (batch_id, company, location, requested_by, created_at)
        VALUES (?, ?, ?, ?, ?)
      `).run(batchId, empresa, endereco, responsavel, createdAt);
      const insertItem = this.database.prepare(`
        INSERT INTO product_shelf_batch_items (
          batch_id, item_id, scanned_code, product_id, product_code, product_description, barcode
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
      `);
      normalizedItems.forEach(item => insertItem.run(
        batchId, item.itemId, item.scannedCode, item.productId, item.productCode, item.productDescription, item.barcode
      ));
      this.database.exec('COMMIT');
    } catch (error) {
      this.database.exec('ROLLBACK');
      throw error;
    }
    return this.getShelfBatch(batchId);
  }

  getShelfBatch(batchId) {
    const identifier = requiredText(batchId, 'Lote', 80);
    const batch = this.database.prepare('SELECT * FROM product_shelf_batches WHERE batch_id = ?').get(identifier);
    if (!batch) return null;
    const items = this.database.prepare('SELECT * FROM product_shelf_batch_items WHERE batch_id = ? ORDER BY item_id').all(identifier);
    return rowToShelfBatch(batch, items);
  }

  getNextPendingShelfBatch(company = DEFAULT_COMPANY) {
    const batch = this.database.prepare(`
      SELECT * FROM product_shelf_batches WHERE company = ? AND status = 'pending' ORDER BY created_at LIMIT 1
    `).get(companyCode(company));
    return batch ? this.getShelfBatch(batch.batch_id) : null;
  }

  markShelfBatchItemApplied(batchId, itemId, product) {
    const batch = this.getShelfBatch(batchId);
    if (!batch) throw Object.assign(new Error('Lote nao encontrado.'), { status: 404 });
    if (batch.status !== 'pending') throw Object.assign(new Error('Este lote nao esta disponivel para processamento.'), { status: 409 });
    const item = batch.items.find(candidate => candidate.itemId === positiveInteger(itemId, 'Item'));
    if (!item || item.status !== 'pending') throw Object.assign(new Error('Item nao esta pendente neste lote.'), { status: 409 });
    const productId = positiveInteger(product && product.productId, 'Produto');
    const productCode = requiredText(product && product.productCode, 'Codigo do produto', 80);
    const description = shortText(product && product.productDescription, 500);
    const barcode = item.barcode ? requiredText(product && product.barcode, 'Codigo de barras confirmado', 80) : null;
    if (barcode && normalizedCode(barcode) !== normalizedCode(item.barcode)) {
      throw Object.assign(new Error('O codigo de barras confirmado nao corresponde ao lote.'), { status: 409 });
    }
    const at = nowIso();
    this.database.exec('BEGIN IMMEDIATE');
    try {
      this.database.prepare(`
        INSERT INTO product_catalog (product_id, product_code, normalized_code, product_description, barcode, normalized_barcode, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(product_id) DO UPDATE SET
          product_code = excluded.product_code, normalized_code = excluded.normalized_code,
          product_description = excluded.product_description,
          barcode = COALESCE(excluded.barcode, product_catalog.barcode),
          normalized_barcode = COALESCE(excluded.normalized_barcode, product_catalog.normalized_barcode),
          updated_at = excluded.updated_at
      `).run(productId, productCode, normalizedCode(productCode), description, barcode, barcode ? normalizedCode(barcode) : null, at);
      const previousLocation = this.getLocation(productId, batch.company);
      if (previousLocation) {
        this.database.prepare(`
          UPDATE product_locations
          SET product_code = ?, product_description = ?, location = ?, source = ?, source_observation = NULL,
              updated_at = ?, updated_by = ?, revision = revision + 1
          WHERE company = ? AND product_id = ?
        `).run(productCode, description, batch.location, 'mobile_shelf_batch', at, batch.requestedBy, batch.company, productId);
      } else {
        this.database.prepare(`
          INSERT INTO product_locations (
            company, product_id, product_code, product_description, location, source, source_observation,
            created_at, created_by, updated_at, updated_by
          ) VALUES (?, ?, ?, ?, ?, ?, NULL, ?, ?, ?, ?)
        `).run(batch.company, productId, productCode, description, batch.location, 'mobile_shelf_batch', at, batch.requestedBy, at, batch.requestedBy);
      }
      this.database.prepare(`
        INSERT INTO product_location_audit (
          company, product_id, action, previous_location, next_location, source_observation, actor_name, migration_run_id, created_at
        ) VALUES (?, ?, ?, ?, ?, NULL, ?, NULL, ?)
      `).run(batch.company, productId, previousLocation ? 'updated' : 'created', previousLocation && previousLocation.location || null, batch.location, batch.requestedBy, at);
      this.database.prepare(`
        UPDATE product_shelf_batch_items
        SET product_id = ?, product_code = ?, product_description = ?, status = 'applied', error_message = NULL, applied_at = ?
        WHERE batch_id = ? AND item_id = ?
      `).run(productId, productCode, description, at, batch.batchId, item.itemId);
      const remaining = this.database.prepare(`
        SELECT COUNT(*) AS count FROM product_shelf_batch_items WHERE batch_id = ? AND status = 'pending'
      `).get(batch.batchId).count;
      if (!remaining) {
        this.database.prepare(`UPDATE product_shelf_batches SET status = 'completed', completed_at = ? WHERE batch_id = ?`)
          .run(at, batch.batchId);
      }
      this.database.exec('COMMIT');
    } catch (error) {
      this.database.exec('ROLLBACK');
      throw error;
    }
    return this.getShelfBatch(batch.batchId).items.find(candidate => candidate.itemId === item.itemId);
  }

  markShelfBatchItemFailed(batchId, itemId, message) {
    const batch = this.getShelfBatch(batchId);
    if (!batch) throw Object.assign(new Error('Lote nao encontrado.'), { status: 404 });
    const item = batch.items.find(candidate => candidate.itemId === positiveInteger(itemId, 'Item'));
    if (!item || item.status !== 'pending') throw Object.assign(new Error('Item nao esta pendente neste lote.'), { status: 409 });
    const errorMessage = requiredText(message, 'Motivo', 500);
    const at = nowIso();
    this.database.exec('BEGIN IMMEDIATE');
    try {
      this.database.prepare(`
        UPDATE product_shelf_batch_items SET status = 'failed', error_message = ? WHERE batch_id = ? AND item_id = ?
      `).run(errorMessage, batch.batchId, item.itemId);
      this.database.prepare(`
        UPDATE product_shelf_batches SET status = 'blocked', error_message = ?, completed_at = ? WHERE batch_id = ?
      `).run(errorMessage, at, batch.batchId);
      this.database.exec('COMMIT');
    } catch (error) {
      this.database.exec('ROLLBACK');
      throw error;
    }
    return this.getShelfBatch(batch.batchId).items.find(candidate => candidate.itemId === item.itemId);
  }
}
