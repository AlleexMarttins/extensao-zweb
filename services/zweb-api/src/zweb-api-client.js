const DEFAULT_AUTH_URL = 'https://api.zweb.com.br/rpc/v2/auth.token';
const DEFAULT_API_BASE_URL = 'https://core-api.zweb.com.br';
// As leituras e gravacoes de produto sao RPC, em outra base que a REST.
const DEFAULT_RPC_BASE_URL = 'https://api.zweb.com.br/rpc/v2';
const TOKEN_SAFETY_WINDOW_MS = 60_000;

export class ZwebApiClient {
  #clientId;
  #username;
  #password;
  #companyUuid;
  #thirdPartyAccessToken;
  #authUrl;
  #apiBaseUrl;
  #rpcBaseUrl;
  #token;
  #requestTimeoutMs;
  #minRequestIntervalMs;
  #lastRequestStartedAt = 0;
  #requestTail = Promise.resolve();

  // O client_id e o mesmo que o front do ZWeb usa: a autenticacao e a de um
  // usuario da loja, nao de uma aplicacao externa.
  constructor({ username, password, companyUuid, thirdPartyAccessToken, clientId = 'zweb', authUrl = DEFAULT_AUTH_URL, apiBaseUrl = DEFAULT_API_BASE_URL, rpcBaseUrl = DEFAULT_RPC_BASE_URL, requestTimeoutMs = 12_000, minRequestIntervalMs = 1_000 }) {
    if (!thirdPartyAccessToken && (!username || !password || !companyUuid)) {
      throw new Error('ZWEB_USERNAME, ZWEB_PASSWORD e ZWEB_COMPANY_UUID são obrigatórios.');
    }

    this.#clientId = clientId;
    this.#username = username;
    this.#password = password;
    this.#companyUuid = companyUuid;
    this.#thirdPartyAccessToken = String(thirdPartyAccessToken || '').trim();
    this.#authUrl = authUrl;
    this.#apiBaseUrl = apiBaseUrl.replace(/\/$/, '');
    this.#rpcBaseUrl = String(rpcBaseUrl).replace(/\/$/, '');
    this.#requestTimeoutMs = Number.isFinite(Number(requestTimeoutMs)) && Number(requestTimeoutMs) > 0 ? Number(requestTimeoutMs) : 12_000;
    this.#minRequestIntervalMs = Math.max(0, Number(minRequestIntervalMs) || 0);
  }

  async request(path, options = {}) {
    const scheduled = this.#requestTail.then(async () => {
      const elapsed = Date.now() - this.#lastRequestStartedAt;
      const waitMs = Math.max(0, this.#minRequestIntervalMs - elapsed);
      if (waitMs) await new Promise(resolve => setTimeout(resolve, waitMs));
      this.#lastRequestStartedAt = Date.now();
      return await this.#requestNow(path, options);
    });
    this.#requestTail = scheduled.catch(() => {});
    return await scheduled;
  }

  /// Chamada RPC autenticada. E por aqui que o ZWeb le e grava produto, e e o
  /// mesmo par de metodos que a extensao ja usa com sucesso no navegador.
  async rpc(method, params) {
    return await this.request(`/${method}`, {
      method: 'POST',
      baseUrl: this.#rpcBaseUrl,
      body: JSON.stringify(params ?? {})
    });
  }

  async #requestNow(path, options) {
    const accessToken = await this.#getAccessToken();
    const { timeoutMs, baseUrl, ...requestOptions } = options;
    const response = await this.#fetchWithTimeout(`${baseUrl || this.#apiBaseUrl}${path}`, {
      ...requestOptions,
      headers: {
        Accept: 'application/json',
        ...(requestOptions.body ? { 'Content-Type': 'application/json' } : {}),
        ...(requestOptions.headers || {}),
        Authorization: `Bearer ${accessToken}`
      }
    }, timeoutMs || this.#requestTimeoutMs);

    const responseText = await response.text();
    let responseBody;
    try {
      responseBody = responseText ? JSON.parse(responseText) : null;
    } catch {
      responseBody = responseText;
    }

    if (!response.ok) {
      const error = new Error(`Zweb respondeu HTTP ${response.status} em ${path}.`);
      error.status = response.status;
      error.details = responseBody;
      throw error;
    }

    return responseBody;
  }

  async #fetchWithTimeout(url, options, timeoutMs) {
    const configuredTimeoutMs = Number(timeoutMs);
    if (!Number.isFinite(configuredTimeoutMs) || configuredTimeoutMs <= 0) {
      return await fetch(url, options);
    }

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), configuredTimeoutMs);
    try {
      return await fetch(url, { ...options, signal: controller.signal });
    } catch (error) {
      if (controller.signal.aborted) {
        const timeoutError = new Error(`A API Zweb não respondeu em ${configuredTimeoutMs} ms.`);
        timeoutError.status = 504;
        throw timeoutError;
      }
      throw error;
    } finally {
      clearTimeout(timer);
    }
  }

  /// Obtem o token da empresa, em duas etapas, como o proprio front do ZWeb faz.
  ///
  /// A primeira etapa autentica o usuario; a segunda troca esse token por um
  /// com escopo da empresa. Pular a segunda devolve um token que nao enxerga
  /// o estoque da loja.
  async #getAccessToken() {
    if (this.#thirdPartyAccessToken) return this.#thirdPartyAccessToken;
    if (this.#token && this.#token.expiresAt > Date.now() + TOKEN_SAFETY_WINDOW_MS) {
      return this.#token.accessToken;
    }

    const usuario = await this.#postAuth({
      grant_type: 'password',
      client_id: this.#clientId,
      username: this.#username,
      password: this.#password
    });

    const empresa = await this.#postAuth({
      grant_type: 'urn:zucchetti:params:oauth:grant-type:company-token-exchange',
      client_id: this.#clientId,
      company_uuid: this.#companyUuid,
      subject_token: usuario.access_token
    }, usuario.access_token);

    this.#token = {
      accessToken: empresa.access_token,
      expiresAt: Date.now() + Number(empresa.expires_in || 3600) * 1000
    };
    return this.#token.accessToken;
  }

  async #postAuth(corpo, bearer) {
    const resposta = await fetch(this.#authUrl, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        ...(bearer ? { Authorization: `Bearer ${bearer}` } : {})
      },
      body: JSON.stringify(corpo)
    });

    const cru = await resposta.json();
    if (!resposta.ok || !cru || !cru.access_token) {
      const error = new Error(`Falha ao autenticar no Zweb (${corpo.grant_type}): HTTP ${resposta.status}.`);
      error.status = resposta.status;
      // O corpo cru: e ele que mostra o que o ZWeb respondeu quando o formato
      // nao foi o esperado, em vez de sumir com a pista.
      error.details = cru;
      throw error;
    }
    return cru;
  }
}

export function createZwebApiClientFromEnvironment(environment = process.env) {
  return new ZwebApiClient({
    username: environment.ZWEB_USERNAME,
    password: environment.ZWEB_PASSWORD,
    companyUuid: environment.ZWEB_COMPANY_UUID,
    thirdPartyAccessToken: environment.ZWEB_THIRD_PARTY_ACCESS_TOKEN,
    clientId: environment.ZWEB_CLIENT_ID || undefined,
    authUrl: environment.ZWEB_AUTH_URL,
    apiBaseUrl: environment.ZWEB_API_BASE_URL,
    rpcBaseUrl: environment.ZWEB_RPC_BASE_URL,
    requestTimeoutMs: environment.ZWEB_REQUEST_TIMEOUT_MS,
    minRequestIntervalMs: environment.ZWEB_MIN_REQUEST_INTERVAL_MS
  });
}
