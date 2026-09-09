import test from 'node:test';
import assert from 'node:assert/strict';
import { toClippProductId } from '../src/clipp-client.js';

test('o identificador do Clipp e o codigo do produto, nao o id interno do ZWeb', () => {
  // 17695 e o codigo que aparece nas duas telas; 20623534 e o id interno do
  // ZWeb, que no Clipp nao existe.
  assert.equal(toClippProductId('17695'), 17695);
  assert.equal(toClippProductId(18755), 18755);
  assert.equal(toClippProductId(' 21287 '), 21287);
});

test('recusa codigo que nao vira identificador do Clipp', () => {
  assert.equal(toClippProductId('ABC-123'), null);
  assert.equal(toClippProductId(''), null);
  assert.equal(toClippProductId(null), null);
  assert.equal(toClippProductId('0'), null);
  assert.equal(toClippProductId('-5'), null);
  assert.equal(toClippProductId('12.5'), null);
});
