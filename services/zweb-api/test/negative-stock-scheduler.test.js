import test from 'node:test';
import assert from 'node:assert/strict';
import { NegativeStockScheduler, stockRpcHeaders, stockClientFromResponse } from '../src/negative-stock-scheduler.js';

test('consulta direta e envelope dashboard preservam false e nao confundem data', () => {
  const client = { fiscal: { emissor: { isAllowedNegativeStock: false } } };
  for (const payload of [client, { data: client }, { 'get-client': client, data: [] }]) assert.equal(stockClientFromResponse(payload), client);
  assert.throws(() => stockClientFromResponse([]));
});

test('vinte estacoes recebem uma unica autorizacao de consulta nativa', () => {
  const f = fixture(() => { assert.fail('Servidor nao deve consultar'); });
  const first = f.scheduler.reserveBrowserRead();
  assert.equal(first.browserReadRequired, true);
  for (let i = 0; i < 20; i++) assert.equal(f.scheduler.reserveBrowserRead().pending, true);
  f.scheduler.completeBrowserRead({ leaseId: first.leaseId, enabled: false, token: 'TOKEN' });
  assert.equal(f.scheduler.reserveBrowserRead().enabled, false);
  assert.equal(f.stored().readFailure, undefined);
});

test('estacoes aguardando recebem o mesmo resultado sem consultar novamente', async () => {
  const f = fixture(() => assert.fail('Sem consulta do servidor'));
  const lease = f.scheduler.reserveBrowserRead();
  const waiting = f.scheduler.waitForBrowserRead();
  f.scheduler.completeBrowserRead({ leaseId: lease.leaseId, enabled: true, token: 'TOKEN' });
  assert.equal((await waiting).enabled, true);
});

test('consulta iniciada antes de uma gravacao nao sobrepoe a gravacao recente', () => {
  const f = fixture(() => assert.fail('Sem consulta'));
  const lease = f.scheduler.reserveBrowserRead();
  f.advance(1);
  f.scheduler.observe({ enabled: true, token: 'TOKEN', confirmedWrite: true });
  assert.equal(f.scheduler.completeBrowserRead({ leaseId: lease.leaseId, enabled: false, token: 'TOKEN' }).enabled, true);
});

test('falha ou abandono de consulta nativa bloqueia por uma hora sem repetir', () => {
  const f = fixture(() => assert.fail('Sem chamada do servidor'));
  const lease = f.scheduler.reserveBrowserRead();
  assert.throws(() => f.scheduler.completeBrowserRead({ leaseId: lease.leaseId, reason: 'HTTP 401' }), /HTTP 401/);
  assert.throws(() => f.scheduler.reserveBrowserRead(), /HTTP 401/);
  f.advance(3600000);
  const next = f.scheduler.reserveBrowserRead();
  assert.notEqual(next.leaseId, lease.leaseId);
  f.advance(15001);
  assert.throws(() => f.scheduler.reserveBrowserRead(), /sem resposta/);
});

test('RPC usa Authorization Bearer como o cliente ZWeb e rejeita quebra de linha', () => {
  assert.equal(stockRpcHeaders('TOKEN').authorization, 'Bearer TOKEN');
  assert.equal(stockRpcHeaders('Bearer TOKEN').authorization, 'Bearer TOKEN');
  assert.equal(stockRpcHeaders('TOKEN')['authorization-compufacil'], undefined);
  assert.throws(() => stockRpcHeaders('TOKEN\r\nheader: value'));
});

function fixture(call) {
  let now = 1000, stored = {};
  const scheduler = new NegativeStockScheduler({ enabled: true, now: () => now, load: () => stored, save: state => { stored = state; }, call });
  return { scheduler, advance: ms => { now += ms; }, stored: () => stored };
}

test('causa da falha visual sobrevive ao reinicio sem repetir chamada', async () => {
  const f = fixture(async () => { throw new Error('Consulta de estoque recusada: HTTP 401.'); });
  await assert.rejects(f.scheduler.readCurrent('TOKEN'));
  const restarted = new NegativeStockScheduler({ enabled: true, now: () => 1001, load: f.stored, save: () => {}, call: async () => { assert.fail('Nao deve consultar durante bloqueio'); } });
  await assert.rejects(restarted.readCurrent('TOKEN'), /HTTP 401/);
  assert.equal(f.stored().readFailure.reason, 'HTTP 401');
  assert.ok(!JSON.stringify(f.stored()).includes('TOKEN'));
  f.scheduler.observe({ enabled: false, token: 'TOKEN', confirmedWrite: true });
  assert.equal(f.stored().readFailure.reason, 'HTTP 401');
});

test('diagnostico nao persiste mensagens arbitrarias com credenciais', async () => {
  const f = fixture(async () => { throw new Error('TOKEN secreto https://host/?token=TOKEN'); });
  await assert.rejects(f.scheduler.readCurrent('TOKEN'));
  assert.equal(f.stored().readFailure.reason, 'Falha de comunicacao');
  assert.ok(!JSON.stringify(f.stored()).includes('TOKEN'));
});
test('varios computadores mantem um unico prazo e uma unica gravacao', async () => {
  let enabled = true, writes = 0, calls = 0;
  const f = fixture(async (_token, operation, body) => {
    calls++;
    if (operation === 'application.put-configuration') { writes++; enabled = body.fiscal.emissor.isAllowedNegativeStock; return {}; }
    return { 'get-client': { fiscal: { emissor: { isAllowedNegativeStock: enabled } } } };
  });
  f.scheduler.observe({ enabled: true, token: 'TOKEN' });
  const deadline = f.scheduler.snapshot().expiresAt;
  f.advance(200000);
  for (let i = 0; i < 20; i++) f.scheduler.observe({ enabled: true, token: 'TOKEN' });
  assert.equal(f.scheduler.snapshot().expiresAt, deadline);
  await f.scheduler.tick(); assert.equal(calls, 0);
  f.advance(100000);
  await Promise.all([f.scheduler.tick(), f.scheduler.tick()]);
  assert.equal(writes, 1); assert.equal(calls, 3); assert.equal(f.stored().status, 'closed');
});
test('falha bloqueia nova tentativa por uma hora e nao confirma sucesso', async () => {
  let calls = 0;
  const f = fixture(async () => { calls++; throw new Error('timeout'); });
  f.scheduler.observe({ enabled: true, token: 'TOKEN' }); f.advance(300000);
  await f.scheduler.tick();
  assert.equal(f.stored().status, 'failed');
  f.advance(3599999); await f.scheduler.tick(); assert.equal(calls, 1);
  f.advance(1); await f.scheduler.tick(); assert.equal(calls, 2);
  assert.ok(!JSON.stringify(f.stored()).includes('TOKEN'));
});
test('reinicio conserva prazo vencido e espera uma sessao autenticada', async () => {
  const scheduler = new NegativeStockScheduler({ enabled: true, now: () => 900000, load: () => ({ expiresAt: 1000 }), save: () => {}, call: async () => ({ 'get-client': { fiscal: { emissor: { isAllowedNegativeStock: false } } } }) });
  await scheduler.tick(); assert.equal(scheduler.snapshot().expiresAt, 1000);
  scheduler.observe({ enabled: true, token: 'TOKEN' });
  await scheduler.tick(); assert.equal(scheduler.snapshot().status, 'closed');
});

test('uma resposta de gravacao sem fechamento real nunca vira sucesso', async () => {
  const f = fixture(async (_token, operation) => operation === 'application.put-configuration' ? {} : { 'get-client': { fiscal: { emissor: { isAllowedNegativeStock: true } } } });
  f.scheduler.observe({ enabled: true, token: 'TOKEN' }); f.advance(300000);
  await f.scheduler.tick();
  assert.equal(f.stored().status, 'failed'); assert.equal(f.stored().closedAt, undefined);
});
test('desligamento manual cancela prazo e modo desativado bloqueia chamadas', async () => {
  let calls = 0;
  const f = fixture(async () => { calls++; });
  f.scheduler.observe({ enabled: true, token: 'TOKEN' });
  f.scheduler.observe({ enabled: false, token: 'TOKEN' });
  f.advance(300000); await f.scheduler.tick(); assert.equal(calls, 0);
  f.scheduler.enabled = false;
  assert.throws(() => f.scheduler.observe({ enabled: true, token: 'TOKEN' }));
});

test('consultas visuais simultaneas compartilham resposta por trinta segundos', async () => {
  let calls = 0;
  const f = fixture(async () => { calls++; return { 'get-client': { fiscal: { emissor: { isAllowedNegativeStock: false } } } }; });
  const results = await Promise.all(Array.from({ length: 20 }, () => f.scheduler.readCurrent('TOKEN')));
  assert.equal(calls, 1);
  assert.ok(results.every(result => result.enabled === false));
  f.advance(29999); await f.scheduler.readCurrent('TOKEN'); assert.equal(calls, 1);
  f.advance(1); await f.scheduler.readCurrent('TOKEN'); assert.equal(calls, 2);
});
test('falha na consulta visual bloqueia novas consultas por uma hora', async () => {
  let calls = 0;
  const f = fixture(async () => { calls++; throw new Error('timeout'); });
  await assert.rejects(f.scheduler.readCurrent('TOKEN'));
  await assert.rejects(f.scheduler.readCurrent('TOKEN'));
  assert.equal(calls, 1);
});
test('gravacao confirmada atualiza a tela mesmo depois de falha de consulta', async () => {
  const f = fixture(async () => { throw new Error('timeout'); });
  await assert.rejects(f.scheduler.readCurrent('TOKEN'));
  f.scheduler.observe({ enabled: true, token: 'TOKEN', confirmedWrite: true });
  assert.equal((await f.scheduler.readCurrent('TOKEN')).enabled, true);
  f.scheduler.observe({ enabled: false, token: 'TOKEN' });
  assert.equal((await f.scheduler.readCurrent('TOKEN')).enabled, true);
  f.scheduler.observe({ enabled: false, token: 'TOKEN', confirmedWrite: true });
  assert.equal((await f.scheduler.readCurrent('TOKEN')).enabled, false);
});
