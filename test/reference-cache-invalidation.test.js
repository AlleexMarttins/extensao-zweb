import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const pageBridgePath = new URL('../extension/nucleo/page-bridge.js', import.meta.url);
const contentPath = new URL('../extension/nucleo/content.js', import.meta.url);
const backgroundPath = new URL('../extension/nucleo/background.js', import.meta.url);

test('invalida o cache compartilhado somente depois de gravações bem-sucedidas do ZWeb', async () => {
  const [pageBridge, content, background] = await Promise.all([
    readFile(pageBridgePath, 'utf8'),
    readFile(contentPath, 'utf8'),
    readFile(backgroundPath, 'utf8')
  ]);

  for (const operation of [
    'finance.post-category',
    'finance.put-category',
    'inventory.post-payment_mode',
    'inventory.put-payment_mode',
    'person.post-person',
    'person.put-person',
    'inventory.post-trade-status',
    'inventory.put-trade-status'
  ]) {
    assert.match(pageBridge, new RegExp(operation.replace('.', '\\.'), 'i'));
  }

  assert.match(pageBridge, /reference-cache-change/);
  assert.match(pageBridge, /status\s*<\s*200\s*\|\|\s*status\s*>=\s*300/);
  assert.match(content, /zweb-internal-cache-invalidate/);
  assert.match(background, /zweb-internal-cache-invalidate/);
  assert.match(background, /\/api\/zweb\/cache\/invalidate/);
});
