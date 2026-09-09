import test from 'node:test';
import assert from 'node:assert/strict';
import { ZwebApiClient } from '../src/zweb-api-client.js';

test('interrompe uma chamada que ultrapassa o prazo configurado', async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async (url, options) => {
    if (String(url).includes('auth.token')) {
      return new Response(JSON.stringify({ access_token: 'test-token', expires_in: 3600 }), { status: 200 });
    }
    return await new Promise((resolve, reject) => {
      options.signal.addEventListener('abort', () => {
        const abortError = new Error('A operação foi abortada.');
        abortError.name = 'AbortError';
        reject(abortError);
      });
    });
  };

  try {
    const client = new ZwebApiClient({
      username: 'coletor@loja',
      password: 'senha-de-teste',
      companyUuid: '3f9cb9e4-977c-4b73-9f5d-764ce79f0f5c'
    });

    await assert.rejects(
      client.request('/br/v1/stock/products', { timeoutMs: 20 }),
      error => error && error.status === 504
    );
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('usa diretamente o token OAuth de terceiros sem enviar login ou senha ao ZWeb', async () => {
  const originalFetch = globalThis.fetch;
  const requests = [];
  globalThis.fetch = async (url, options) => {
    requests.push({ url: String(url), headers: options.headers });
    return new Response(JSON.stringify({ data: [{ uuid: 'produto-1' }] }), { status: 200 });
  };

  try {
    const client = new ZwebApiClient({
      thirdPartyAccessToken: 'token-externo-de-teste',
      apiBaseUrl: 'http://mock.local'
    });
    const response = await client.request('/br/v1/stock/products?paginator%5Blimit%5D=1');

    assert.deepEqual(response, { data: [{ uuid: 'produto-1' }] });
    assert.equal(requests.length, 1);
    assert.equal(requests[0].headers.Authorization, 'Bearer token-externo-de-teste');
    assert.equal(requests[0].url.includes('auth.token'), false);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('serializa chamadas diferentes e respeita o intervalo mínimo', async () => {
  const originalFetch = globalThis.fetch;
  const requests = [];
  globalThis.fetch = async (url) => {
    requests.push({ url: String(url), at: Date.now() });
    if (String(url).endsWith('/token')) {
      return new Response(JSON.stringify({ access_token: 'test-token', expires_in: 3600 }), { status: 200 });
    }
    return new Response(JSON.stringify({ data: [] }), { status: 200 });
  };

  try {
    const client = new ZwebApiClient({
      username: 'coletor@loja',
      password: 'senha-de-teste',
      companyUuid: '3f9cb9e4-977c-4b73-9f5d-764ce79f0f5c',
      authUrl: 'http://mock.local/token',
      apiBaseUrl: 'http://mock.local',
      minRequestIntervalMs: 25
    });

    await Promise.all([
      client.request('/br/v1/finance/categories'),
      client.request('/br/v1/finance/payment-modes')
    ]);

    const apiRequests = requests.filter(request => !request.url.endsWith('/token'));
    assert.equal(apiRequests.length, 2);
    assert.ok(apiRequests[1].at - apiRequests[0].at >= 20, JSON.stringify(apiRequests));
  } finally {
    globalThis.fetch = originalFetch;
  }
});

// O token sai em duas etapas, como no proprio front do ZWeb: autentica o
// usuario e depois troca por um token com escopo da empresa. Pular a segunda
// devolve um token que nao enxerga o estoque da loja.
test('autentica em duas etapas e usa o token da empresa nas chamadas', async () => {
  const fetchOriginal = globalThis.fetch;
  const chamadas = [];
  globalThis.fetch = async (url, options) => {
    const corpo = options && options.body ? JSON.parse(options.body) : null;
    chamadas.push({ url: String(url), corpo, headers: (options && options.headers) || {} });
    if (String(url).includes('auth.token')) {
      const token = corpo.grant_type === 'password' ? 'token-do-usuario' : 'token-da-empresa';
      return new Response(JSON.stringify({ access_token: token, expires_in: 3600 }), { status: 200 });
    }
    return new Response(JSON.stringify({ ok: true }), { status: 200 });
  };

  const client = new ZwebApiClient({ username: 'coletor@loja', password: 'senha-de-teste', companyUuid: 'uuid-da-loja' });
  const resultado = await client.rpc('inventory.get-product', { id: 16821 });
  assert.deepEqual(resultado, { ok: true });

  const [login, troca, produto] = chamadas;
  assert.equal(login.corpo.grant_type, 'password');
  assert.equal(login.corpo.client_id, 'zweb');
  assert.equal(login.corpo.username, 'coletor@loja');
  assert.equal(login.headers.Authorization, undefined, 'o login nao leva Bearer');

  assert.equal(troca.corpo.grant_type, 'urn:zucchetti:params:oauth:grant-type:company-token-exchange');
  assert.equal(troca.corpo.company_uuid, 'uuid-da-loja');
  assert.equal(troca.corpo.subject_token, 'token-do-usuario');
  assert.equal(troca.headers.Authorization, 'Bearer token-do-usuario');

  // A chamada de produto e RPC, em outra base que a REST, com o token da empresa.
  assert.equal(produto.url, 'https://api.zweb.com.br/rpc/v2/inventory.get-product');
  assert.equal(produto.headers.Authorization, 'Bearer token-da-empresa');
  assert.deepEqual(produto.corpo, { id: 16821 });

  globalThis.fetch = fetchOriginal;
});

test('corpo sem token informa o que o ZWeb devolveu, em vez de engolir', async () => {
  const fetchOriginal = globalThis.fetch;
  const client = new ZwebApiClient({ username: 'coletor@loja', password: 'senha-de-teste', companyUuid: 'uuid' });
  globalThis.fetch = async () => new Response(JSON.stringify([]), { status: 200 });
  await assert.rejects(() => client.request('/br/v1/ping'), (error) => {
    assert.match(error.message, /Falha ao autenticar no Zweb \(password\)/);
    assert.deepEqual(error.details, [], 'o corpo cru precisa chegar no erro');
    return true;
  });
  globalThis.fetch = fetchOriginal;
});
