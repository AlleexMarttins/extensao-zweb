import test from 'node:test';
import assert from 'node:assert/strict';
import { composeObservation, extractUserObservation } from '../src/clipp-observation.js';

const ENDERECO = 'RUA 5 NIVEL 1 PRAT ESQ';
const OUTRO = 'RUA 8 NIVEL 3 PRAT DIR';
const NOTA = 'FOI VENDIDO COMO KIT NO COD 20689';

test('produto sem observacao recebe so o endereco', () => {
  assert.equal(composeObservation({ location: ENDERECO, currentObservation: null }), ENDERECO);
  assert.equal(composeObservation({ location: ENDERECO, currentObservation: '' }), ENDERECO);
  assert.equal(composeObservation({ location: ENDERECO, currentObservation: '   \n  ' }), ENDERECO);
});

test('a observacao existente e preservada abaixo do endereco', () => {
  assert.equal(
    composeObservation({ location: ENDERECO, currentObservation: NOTA }),
    `${ENDERECO}\n\n${NOTA}`
  );
});

test('enderecar o mesmo item de novo substitui, nao empilha', () => {
  let observacao = composeObservation({ location: ENDERECO, currentObservation: NOTA });
  observacao = composeObservation({ location: OUTRO, currentObservation: observacao, previousLocation: ENDERECO });
  observacao = composeObservation({ location: ENDERECO, currentObservation: observacao, previousLocation: OUTRO });

  assert.equal(observacao, `${ENDERECO}\n\n${NOTA}`);
  assert.equal(observacao.split('RUA').length - 1, 1, 'so pode existir um endereco no texto');
});

test('enderecar dez vezes seguidas nao deixa rastro acumulado', () => {
  let observacao = NOTA;
  let anterior;
  for (let volta = 1; volta <= 10; volta += 1) {
    const endereco = `RUA ${volta} NIVEL 2 PRAT DIR`;
    observacao = composeObservation({ location: endereco, currentObservation: observacao, previousLocation: anterior });
    anterior = endereco;
  }
  assert.equal(observacao, `RUA 10 NIVEL 2 PRAT DIR\n\n${NOTA}`);
});

test('remove um endereco antigo mesmo sem saber qual era, pelo padrao das etiquetas', () => {
  const observacao = composeObservation({
    location: OUTRO,
    currentObservation: `${ENDERECO}\n\n${NOTA}`
  });
  assert.equal(observacao, `${OUTRO}\n\n${NOTA}`);
});

test('preserva a edicao feita dentro do Clipp entre um enderecamento e outro', () => {
  const editado = `${ENDERECO}\n\n${NOTA}\nOBS NOVA DIGITADA NO CLIPP`;
  const observacao = composeObservation({ location: OUTRO, currentObservation: editado, previousLocation: ENDERECO });
  assert.equal(observacao, `${OUTRO}\n\n${NOTA}\nOBS NOVA DIGITADA NO CLIPP`);
});

test('remove o endereco anterior mesmo quando alguem escreveu acima dele', () => {
  const bagunçado = `URGENTE CONFERIR\n${ENDERECO}\n\n${NOTA}`;
  const observacao = composeObservation({ location: OUTRO, currentObservation: bagunçado, previousLocation: ENDERECO });

  assert.equal(observacao, `${OUTRO}\n\nURGENTE CONFERIR\n${NOTA}`);
  assert.equal(observacao.includes(ENDERECO), false, 'o endereco antigo nao pode sobrar no meio do texto');
});

test('nao confunde observacao fora do padrao com endereco', () => {
  assert.equal(extractUserObservation('GANCHOS DA LOJA', null), 'GANCHOS DA LOJA');
  assert.equal(extractUserObservation('-uso Alex/tierre', null), '-uso Alex/tierre');
  assert.equal(extractUserObservation('RUA DA PRAIA 123', null), 'RUA DA PRAIA 123');
});

test('respeita enderecos fora do padrao que nos mesmos gravamos', () => {
  const observacao = composeObservation({ location: ENDERECO, currentObservation: `GVE-07\n\n${NOTA}`, previousLocation: 'GVE-07' });
  assert.equal(observacao, `${ENDERECO}\n\n${NOTA}`);
});

test('lida com quebras de linha do Windows sem duplicar espaco', () => {
  const observacao = composeObservation({
    location: OUTRO,
    currentObservation: `${ENDERECO}\r\n\r\n${NOTA}\r\n`,
    previousLocation: ENDERECO
  });
  assert.equal(observacao, `${OUTRO}\n\n${NOTA}`);
});

test('recusa gravar sem endereco', () => {
  assert.throws(() => composeObservation({ location: '  ', currentObservation: NOTA }), error => error.status === 400);
});
