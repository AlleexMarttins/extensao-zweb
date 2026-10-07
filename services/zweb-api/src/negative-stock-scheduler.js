// Nunca guardar mensagens arbitrarias: podem conter credenciais ou payloads.
export function stockRpcHeaders(token) {
  const value = String(token || '').trim().replace(/^Bearer\s+/i, '');
  if (!value || /[\r\n]/.test(value)) throw new Error('Token de estoque invalido.');
  return { 'content-type': 'application/json', accept: 'application/json', authorization: `Bearer ${value}`, origin: 'https://zweb.com.br', referer: 'https://zweb.com.br/' };
}

export function stockClientFromResponse(payload) {
  // Um envelope com data nao deve esconder get-client na raiz.
  for (const root of [payload, payload?.data]) {
    for (const client of [root, root?.['get-client'], root?.getClient]) {
      if (typeof client?.fiscal?.emissor?.isAllowedNegativeStock === 'boolean') return client;
    }
  }
  const error = new Error('Configuracao ausente.');
  error.responseShape = {
    rootType: Array.isArray(payload) ? 'array' : typeof payload,
    hasData: !!payload?.data,
    hasClient: !!(payload?.['get-client'] || payload?.getClient),
    hasDataClient: !!(payload?.data?.['get-client'] || payload?.data?.getClient),
    hasError: !!(payload?.error || payload?.error_message),
    hasFiscal: !!(payload?.['get-client']?.fiscal || payload?.data?.['get-client']?.fiscal)
  };
  throw error;
}

function safeFailureReason(error) {
  const message = String(error?.message || '');
  const status = message.match(/HTTP (\d{3})\b/);
  if (status) return `HTTP ${status[1]}`;
  if (error?.name === 'TimeoutError' || message === 'timeout') return 'Tempo de espera excedido';
  if (/^Configuracao (de estoque )?ausente\.$/.test(message)) return 'Resposta sem configuracao de estoque';
  if (message === 'Fechamento nao confirmado.') return 'Fechamento nao confirmado';
  return 'Falha de comunicacao';
}
// Um prazo por loja. O token fica apenas na memoria do processo.
export class NegativeStockScheduler {
  constructor({ load, save, call, now = Date.now, enabled = false, durationMs = 300000, retryMs = 3600000 }) {
    Object.assign(this, { save, call, now, enabled, durationMs, retryMs });
    this.state = load() || {};
    this.current = this.state.confirmedState || null;
    this.readBlockedUntil = this.state.readFailure?.nextAttemptAt || 0;
    this.running = false;
    this.token = '';
    this.confirmationRevision = 0;
    this.browserWaiters = new Set();
  }
  snapshot() { return { ...this.state, running: this.running, enabled: this.enabled }; }
  reserveBrowserRead() {
    if (!this.enabled) throw new Error('Consulta indisponivel.');
    if (this.current && this.now() - this.current.checkedAt < 30000) return this.current;
    if (this.browserLease && this.browserLease.expiresAt > this.now()) return { pending: true };
    if (this.readBlockedUntil > this.now()) throw new Error(`Consulta em espera apos falha. Motivo: ${this.state.readFailure?.reason || 'Falha anterior sem diagnostico'}.`);
    // Apenas uma estacao recebe autorizacao; ausencia de resposta tambem bloqueia.
    this.browserLeaseSequence = (this.browserLeaseSequence || 0) + 1;
    const leaseId = `${this.now()}-${this.browserLeaseSequence}`;
    this.browserLease = { leaseId, expiresAt: this.now() + 15000, revision: this.confirmationRevision };
    this.readBlockedUntil = this.now() + this.retryMs;
    this.state.readFailure = { at: this.now(), nextAttemptAt: this.readBlockedUntil, reason: 'Conferencia do navegador sem resposta' };
    this.save(this.state);
    return { browserReadRequired: true, leaseId };
  }
  waitForBrowserRead() {
    if (this.current && this.now() - this.current.checkedAt < 30000) return Promise.resolve(this.current);
    if (!this.browserLease || this.browserWaiters.size >= 100) return Promise.reject(new Error('Conferencia indisponivel.'));
    return new Promise((resolve, reject) => {
      const waiter = { resolve, reject };
      waiter.timer = setTimeout(() => {
        this.browserWaiters.delete(waiter);
        reject(new Error('Conferencia do navegador sem resposta.'));
      }, Math.max(1, this.browserLease.expiresAt - this.now()));
      this.browserWaiters.add(waiter);
    });
  }
  settleBrowserWaiters(error) {
    for (const waiter of this.browserWaiters) {
      clearTimeout(waiter.timer);
      if (error) waiter.reject(error); else waiter.resolve(this.current);
    }
    this.browserWaiters.clear();
  }
  completeBrowserRead({ leaseId, enabled, token, reason }) {
    if (!this.browserLease || leaseId !== this.browserLease.leaseId || this.now() > this.browserLease.expiresAt) throw new Error('Conferencia expirada.');
    if (typeof enabled === 'boolean' && (!token || typeof token !== 'string' || token.length > 20000)) throw new Error('Estado de estoque invalido.');
    const superseded = this.browserLease.revision !== this.confirmationRevision;
    this.browserLease = null;
    if (superseded && this.current) {
      this.readBlockedUntil = 0;
      delete this.state.readFailure;
      this.save(this.state);
      this.settleBrowserWaiters();
      return this.current;
    }
    if (typeof enabled !== 'boolean') {
      this.state.readFailure.reason = ['HTTP 401', 'HTTP 403', 'Tempo de espera excedido', 'Resposta sem configuracao de estoque'].includes(reason) ? reason : 'Falha de comunicacao';
      this.save(this.state);
      const error = new Error(`Falha na consulta visual do estoque: ${this.state.readFailure.reason}.`);
      this.settleBrowserWaiters(error);
      throw error;
    }
    this.readBlockedUntil = 0;
    delete this.state.readFailure;
    this.observe({ enabled, token, confirmedWrite: true });
    return this.current;
  }
  async readCurrent(token) {
    if (!this.enabled || typeof token !== 'string' || !token || token.length > 20000) throw new Error('Consulta indisponivel.');
    if (this.current && this.now() - this.current.checkedAt < 30000) return this.current;
    if ((this.readBlockedUntil || 0) > this.now()) throw new Error(`Consulta em espera apos falha. Motivo: ${this.state.readFailure?.reason || 'Falha anterior sem diagnostico'}. Proxima tentativa: ${new Date(this.readBlockedUntil).toISOString()}`);
    if (this.readPromise) return this.readPromise;
    this.readPromise = (async () => {
      try {
        const payload = await this.call(token, 'application.get-client', {});
        const enabled = stockClientFromResponse(payload).fiscal.emissor.isAllowedNegativeStock;
        this.current = { enabled, checkedAt: this.now() };
        delete this.state.readFailure;
        this.readBlockedUntil = 0;
        this.state.confirmedState = this.current;
        this.save(this.state);
        return this.current;
      } catch (error) {
        this.readBlockedUntil = this.now() + this.retryMs;
        this.state.readFailure = { at: this.now(), nextAttemptAt: this.readBlockedUntil, reason: safeFailureReason(error), ...(error.responseShape ? { responseShape: error.responseShape } : {}) };
        this.save(this.state);
        throw new Error(`Falha na consulta visual do estoque: ${this.state.readFailure.reason}.`);
      } finally { this.readPromise = null; }
    })();
    return this.readPromise;
  }
  observe({ enabled, token, confirmedWrite = false }) {
    if (!this.enabled) throw new Error('Fechamento automatico desativado no servico.');
    if (typeof enabled !== 'boolean' || !token || typeof token !== 'string' || token.length > 20000) throw new Error('Estado de estoque invalido.');
    this.token = token;
    // Respostas atrasadas nao cancelam nem renovam uma operacao em curso.
    if (this.running) return this.snapshot();
    // Um painel antigo nao pode sobrepor uma gravacao ja confirmada.
    if (!confirmedWrite && this.current && this.now() - this.current.checkedAt < 30000 && this.current.enabled !== enabled) return this.snapshot();
    if (confirmedWrite) {
      this.current = { enabled, checkedAt: this.now() };
      this.confirmationRevision++;
    }
    const readFailure = this.state.readFailure;
    if (!enabled) this.state = {};
    else if (!this.state.expiresAt) this.state = { expiresAt: this.now() + this.durationMs, nextAttemptAt: 0, status: 'scheduled' };
    if (readFailure) this.state.readFailure = readFailure;
    if (this.current) this.state.confirmedState = this.current;
    this.save(this.state);
    if (confirmedWrite) this.settleBrowserWaiters();
    return this.snapshot();
  }
  async tick() {
    if (!this.enabled || this.running || !this.token || !this.state.expiresAt || this.now() < Math.max(this.state.expiresAt, this.state.nextAttemptAt || 0)) return;
    this.running = true;
    try {
      const payload = await this.call(this.token, 'application.get-client', {});
      const client = stockClientFromResponse(payload);
      if (client.fiscal.emissor.isAllowedNegativeStock) {
        client.fiscal.emissor.isAllowedNegativeStock = false;
        await this.call(this.token, 'application.put-configuration', client);
        const verification = await this.call(this.token, 'application.get-client', {});
        const verified = stockClientFromResponse(verification);
        if (verified?.fiscal?.emissor?.isAllowedNegativeStock !== false) throw new Error('Fechamento nao confirmado.');
      }
      this.state = { status: 'closed', closedAt: this.now(), ...(this.state.readFailure ? { readFailure: this.state.readFailure } : {}) };
      this.current = { enabled: false, checkedAt: this.now() };
      this.state.confirmedState = this.current;
    } catch (error) {
      this.state = { ...this.state, status: 'failed', nextAttemptAt: this.now() + this.retryMs, error: safeFailureReason(error) };
    } finally {
      try { this.save(this.state); } finally { this.running = false; }
    }
    return this.snapshot();
  }
}
