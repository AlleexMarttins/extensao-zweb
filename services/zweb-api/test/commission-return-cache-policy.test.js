import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

test('mantém o histórico compartilhado de devoluções por trinta minutos', async () => {
  const serverFile = fileURLToPath(new URL('../src/server.js', import.meta.url));
  const source = await readFile(serverFile, 'utf8');

  assert.match(source, /const sharedReturnHistoryTtlMs = 30 \* 60_000;/);
});
