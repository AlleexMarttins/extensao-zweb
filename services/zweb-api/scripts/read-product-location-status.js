const { DatabaseSync } = require('node:sqlite');
const { writeFileSync } = require('node:fs');
const { resolve } = require('node:path');

const databaseFile = process.argv[2];
const outputFile = process.argv[3];
const database = new DatabaseSync(databaseFile, { readOnly: true, timeout: 5000 });
const state = database.prepare('SELECT migration_key, run_id, state, updated_at FROM product_location_migration_state').all();
const run = database.prepare(`
  SELECT run_id, created_at, updated_at, finished_at
  FROM product_location_import_runs
  WHERE source = 'zweb-observation'
  ORDER BY created_at DESC LIMIT 1
`).get();
const counts = database.prepare(`
  SELECT status, COUNT(*) AS total
  FROM product_location_import_items
  WHERE run_id = ? GROUP BY status ORDER BY status
`).all(run && run.run_id || '');
const locations = database.prepare('SELECT COUNT(*) AS total FROM product_locations').get();
database.close();
writeFileSync(resolve(outputFile), JSON.stringify({ generatedAt: new Date().toISOString(), state, run, counts, locations }), 'utf8');
