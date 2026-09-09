const test = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { join } = require('node:path');

const fonte = readFileSync(join(__dirname, '..', 'extension', 'nucleo', 'zweb-operation-queue.js'), 'utf8');

/// Relogio e espera falsos: o teste nunca dorme nem chama a rede.
function criarFila(opcoes = {}) {
  const sandbox = {};
  new Function('globalThis', fonte)(sandbox);
  let instante = 0;
  const esperas = [];
  const registros = [];
  const fila = sandbox.ZWEB_OPERATION_QUEUE.createZwebOperationQueue({
    nome: 'teste',
    agora: () => instante,
    esperar: async ms => { esperas.push(ms); instante += ms; },
    registrar: evento => registros.push(evento),
    ...opcoes
  });
  return {
    fila,
    esperas,
    registros,
    avancar: ms => { instante += ms; },
    get instante() { return instante; }
  };
}

test('processa um item por vez, nunca em paralelo', async () => {
  const { fila } = criarFila();
  let simultaneos = 0;
  let pico = 0;

  await fila.executar([1, 2, 3, 4], async () => {
    simultaneos += 1;
    pico = Math.max(pico, simultaneos);
    await Promise.resolve();
    simultaneos -= 1;
  });

  assert.equal(pico, 1, 'duas chamadas ao ZWeb nunca podem estar abertas juntas');
});

test('respeita o intervalo minimo entre cada chamada, nao so entre itens', async () => {
  const { fila, esperas } = criarFila({ intervaloMinimoMs: 2000 });

  // Um pedido de codigo de barras faz tres chamadas: buscar, salvar, conferir.
  await fila.executar([1, 2], async (item, chamar) => {
    await chamar(async () => {});
    await chamar(async () => {});
    await chamar(async () => {});
  });

  // Seis chamadas no total: a primeira sai na hora, as outras cinco esperam.
  assert.deepEqual(esperas, [2000, 2000, 2000, 2000, 2000]);
});

test('para no limite de itens por execucao e informa o que sobrou', async () => {
  const { fila } = criarFila({ limitePorExecucao: 2 });
  const vistos = [];

  const resumo = await fila.executar([1, 2, 3, 4, 5], async item => { vistos.push(item); });

  assert.deepEqual(vistos, [1, 2]);
  assert.equal(resumo.processados, 2);
  assert.equal(resumo.restantes, 3);
});

test('a primeira falha interrompe o restante da execucao', async () => {
  const { fila } = criarFila();
  const vistos = [];

  const resumo = await fila.executar([1, 2, 3], async item => {
    vistos.push(item);
    if (item === 2) throw new Error('A ZWeb respondeu 429.');
  });

  assert.deepEqual(vistos, [1, 2], 'o item 3 nao pode ser tentado depois da falha');
  assert.equal(resumo.estado, 'falhou');
  assert.equal(resumo.falhas, 1);
  assert.equal(resumo.motivo, 'A ZWeb respondeu 429.');
});

test('depois de falhar entra em bloqueio e nao tenta de novo em seguida', async () => {
  const contexto = criarFila({ bloqueioAposFalhaMs: 900000 });
  await contexto.fila.executar([1], async () => { throw new Error('falhou'); });

  assert.equal(contexto.fila.bloqueado(), true);

  const segunda = await contexto.fila.executar([1, 2], async () => {
    throw new Error('nao deveria nem ter sido chamado');
  });
  assert.equal(segunda.estado, 'bloqueado');
  assert.equal(segunda.processados, 0);

  // Passado o bloqueio, volta a operar.
  contexto.avancar(900001);
  assert.equal(contexto.fila.bloqueado(), false);
  const terceira = await contexto.fila.executar([1], async () => {});
  assert.equal(terceira.estado, 'concluido');
});

test('corta a chamada que passa do prazo, em vez de ficar pendurada', async () => {
  const { fila } = criarFila({ timeoutMs: 50 });

  const resumo = await fila.executar([1], (item, chamar) => chamar(() => new Promise(() => {})));

  assert.equal(resumo.estado, 'falhou');
  assert.match(resumo.motivo, /nao respondeu em 50 ms/);
});

test('registra horario, quantidade, resultado e proxima tentativa', async () => {
  const { fila, registros } = criarFila();

  await fila.executar([1, 2], async () => {});
  await fila.executar([1], async () => { throw new Error('recusado'); });

  assert.equal(registros.length, 2);
  assert.equal(registros[0].estado, 'concluido');
  assert.equal(registros[0].processados, 2);
  assert.equal(typeof registros[0].em, 'number');
  assert.equal(registros[1].estado, 'falhou');
  assert.ok(registros[1].proximaTentativaEm > registros[1].em, 'o log precisa dizer quando pode tentar de novo');
});

test('nao inicia uma segunda execucao enquanto a primeira nao termina', async () => {
  const { fila } = criarFila();
  let liberar;
  const travado = new Promise(resolve => { liberar = resolve; });

  const primeira = fila.executar([1], (item, chamar) => chamar(() => travado));
  const segunda = await fila.executar([2], async () => {
    throw new Error('nao deveria rodar junto');
  });

  assert.equal(segunda.estado, 'em_andamento');
  liberar();
  assert.equal((await primeira).estado, 'concluido');
});

test('lista vazia nao gera chamada nem log', async () => {
  const { fila, registros } = criarFila();
  const resumo = await fila.executar([], async () => { throw new Error('nao deveria'); });
  assert.equal(resumo.estado, 'vazio');
  assert.equal(registros.length, 0);
});
