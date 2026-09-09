const test = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { join } = require('node:path');

const source = readFileSync(join(__dirname, '..', 'extension', 'setores', 'notas', 'note-assistant.js'), 'utf8');

test('o assistente de notas nao mantem observador ou temporizador ativo fora da rota fiscal', () => {
  assert.equal(source.includes('setInterval(scanZweb, 1200);'), false);
  assert.equal(source.includes('function refreshZwebWatcher()'), true);
  assert.equal(source.includes('if (!isZwebNfeNewRoute()) return;'), true);
  assert.equal(source.includes("window.addEventListener('hashchange', refreshZwebWatcher);"), true);
});
