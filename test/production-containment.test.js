const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const readSource = (...parts) => fs.readFileSync(path.join(__dirname, '..', ...parts), 'utf8');

test('libera somente as operações homologadas e mantém o restante bloqueado', () => {
  const features = readSource('extension', 'nucleo', 'features.js');
  const content = readSource('extension', 'nucleo', 'content.js');
  const background = readSource('extension', 'nucleo', 'background.js');
  const locations = readSource('extension', 'setores', 'produtos', 'product-locations.js');

  assert.match(features, /PRODUCTION_ZWEB_AUTOMATION_ENABLED = true/);
  assert.match(features, /productLocationMigration: false/);
  assert.match(features, /personLookup: false/);
  assert.match(features, /productRangeRead: false/);
  assert.match(features, /pdvCashCounterRead: false/);
  assert.match(features, /commissionReturnsRefresh: true/);
  assert.match(features, /supplierLookup: true/);
  assert.match(features, /productBulkRead: true/);
  assert.match(features, /productPreferredSupplierWrite: true/);
  assert.match(features, /fiscalDocumentRead: true/);
  assert.match(features, /fiscalDocumentWrite: true/);
  assert.match(features, /fiscalTransmission: true/);
  assert.match(features, /fiscalCancellation: true/);
  assert.match(features, /davClone: false/);
  assert.match(features, /canRun\(operationId\)/);
  assert.match(content, /assertProductionZwebAutomationEnabled\(operationId\);\s*const response = await fetch/);
  assert.match(content, /fetchProductCodeRangePage\(pageNumber, operationId\) \{\s*assertProductionZwebAutomationEnabled\(operationId\)/);
  assert.match(content, /fetchProductPaginateBatch\(payload\) \{\s*assertProductionZwebAutomationEnabled\('productBulkRead'\)/);
  assert.match(content, /PRODUCT_READ_MAX_PAGES_PER_RUN = 20/);
  assert.match(content, /pageNumber <= PRODUCT_READ_MAX_PAGES_PER_RUN/);
  assert.match(content, /batches\.push\(await fetchProductCodeRangePage\(pageNumber, 'productRangeRead'\)\)/);
  assert.doesNotMatch(content, /Promise\.all\(pageNumbers\.map\(\(pageNumber\) => fetchProductCodeRangePage/);
  assert.match(content, /postZwebJson\(PERSON_API_URL, \{ id: personId \}, 'personLookup'\)/);
  assert.match(content, /isSupplier: true,[\s\S]*?'supplierLookup'/);
  assert.match(content, /fetchNfeBatchDetail\(entry, 'fiscalTransmission'\)/);
  assert.match(content, /NFE_TRANSMIT_API_URL, payload, 'fiscalTransmission'/);
  assert.match(content, /FISCAL_CANCEL_NFE_API_URL, request, 'fiscalCancellation'/);
  assert.match(content, /INVENTORY_POST_SALE_API_URL, postPayload, 'davClone'/);
  assert.match(content, /FISCAL_READ_MIN_INTERVAL_MS = 1000/);
  assert.match(content, /NFE_RETURN_HISTORY_REFRESH_TTL_MS = 30 \* 60 \* 1000/);
  assert.match(content, /NFE_RETURN_HISTORY_RETRY_DELAY_MS = 30 \* 60 \* 1000/);
  assert.match(content, /NFE_RETURN_HISTORY_NEXT_RETRY_AT = Date\.now\(\) \+ NFE_RETURN_HISTORY_RETRY_DELAY_MS/);
  assert.match(content, /PDV_CASH_COUNTER_MAX_DETAILS = 20/);
  assert.match(content, /PDV_CASH_COUNTER_API_SYNC_INTERVAL_MS = 5 \* 60 \* 1000/);
  assert.match(content, /todayEntries\.slice\(0, PDV_CASH_COUNTER_MAX_DETAILS\)\.entries\(\)/);
  assert.match(content, /PRODUCT_PREFERRED_SUPPLIER_MAX_UPDATES = 50/);
  assert.match(content, /PRODUCT_PREFERRED_SUPPLIER_MIN_INTERVAL_MS = 1000/);
  assert.match(content, /NFE_BATCH_DOWNLOAD_MAX_ITEMS = 50/);
  assert.match(content, /NFE_BATCH_DOWNLOAD_MIN_INTERVAL_MS = 1000/);
  assert.match(content, /if \(page > 1\) await delay\(FISCAL_READ_MIN_INTERVAL_MS\)/);
  assert.match(content, /commissionReturnsRefresh/);
  assert.match(background, /assertProductionZwebAutomationEnabled\(\);\s*const cleanToken/);
  assert.match(background, /getZwebInternalCategories\(\) \{\s*assertProductionZwebAutomationEnabled\('referenceCategoryRefresh'\)/);
  assert.match(locations, /const AUTOMATIC_MIGRATION_ENABLED = false/);
});

test('cancela qualquer fechamento automático de estoque que tenha ficado agendado', () => {
  const background = readSource('extension', 'nucleo', 'background.js');

  assert.match(background, /self\.addEventListener\('activate',[\s\S]*?clearDocumentNegativeStockScheduledDisable\(\)/);
  assert.match(background, /chrome\.runtime\.onStartup\.addListener\([\s\S]*?clearDocumentNegativeStockScheduledDisable\(\)/);
  assert.match(background, /reason: 'production_automation_suspended'/);
});
