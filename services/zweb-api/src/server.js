import { createServer } from 'node:http';
import { mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createZwebApiClientFromEnvironment } from './zweb-api-client.js';
import { ProductLocationStore } from './product-location-store.js';
import { createClippClientFromEnvironment, toClippProductId } from './clipp-client.js';

const port = Number(process.env.ZWEB_PORT || 8788);
const bindHost = process.env.ZWEB_BIND_HOST || '127.0.0.1';
const allowedOrigins = new Set((process.env.ZWEB_ALLOWED_ORIGINS || 'https://zweb.com.br').split(',').map(origin => origin.trim()).filter(Boolean));
const defaultDavRecipient = {
  uuid: process.env.ZWEB_DEFAULT_DAV_RECIPIENT_UUID || '0d1ec991-d91b-401a-8d42-d7f6991bb00f',
  name: process.env.ZWEB_DEFAULT_DAV_RECIPIENT_NAME || 'CLIENTE BALCÃO',
  active: true
};
const internalServiceKey = process.env.ZWEB_INTERNAL_SERVICE_KEY || '';
const productionZwebEnabled = process.env.ZWEB_PRODUCTION_ZWEB_ENABLED === 'true';
const allowedZwebOperations = new Set(String(process.env.ZWEB_ALLOWED_OPERATIONS || '')
  .split(',')
  .map(operation => operation.trim())
  .filter(Boolean));
const mobileDeviceKeys = parseMobileDeviceKeys(process.env.ZWEB_MOBILE_DEVICE_KEYS);
const companies = parseCompanies(process.env.ZWEB_COMPANIES);
const serviceDirectory = resolve(dirname(fileURLToPath(import.meta.url)), '..');
let zwebClient;
let configurationError;
const serviceResponseCache = new Map();
const serviceResponseInFlight = new Map();
const serviceCacheVersions = new Map();
const sharedReturnHistoryFile = resolve(process.env.ZWEB_SHARED_RETURN_HISTORY_FILE || './data/commission-returns.json');
const productLocationDatabaseFile = resolve(process.env.ZWEB_PRODUCT_LOCATION_DB || resolve(serviceDirectory, 'data/product-locations.sqlite'));
const productLocationStore = new ProductLocationStore(productLocationDatabaseFile);
const sharedReturnHistoryTtlMs = 30 * 60_000;
const productDetailCacheTtlMs = 5 * 60_000;
const productDetailCacheLimit = 500;
let sharedReturnHistory = { updatedAt: 0, entries: [] };
let sharedReturnHistoryLoadPromise;
const productDetailCache = new Map();
const productDetailInFlight = new Map();
const productDetailMetrics = { hits: 0, misses: 0, coalesced: 0 };
const serviceCacheTtl = {
  categories: 30 * 60_000,
  paymentModes: 15 * 60_000,
  recipients: 10 * 60_000,
  salesStatuses: 60_000,
  products: 2 * 60_000
};
const serviceCacheMetrics = new Map(Object.keys(serviceCacheTtl).map(cacheKey => [cacheKey, {
  hits: 0,
  misses: 0,
  coalesced: 0,
  invalidations: 0
}]));

try {
  zwebClient = createZwebApiClientFromEnvironment();
} catch (error) {
  configurationError = error;
}


// Empresas que tambem gravam o enderecamento em um sistema externo. A MVA usa
// o ClippStore; a Eletronica Horizonte usa o ZWeb, onde quem mostra o endereco
// e a propria extensao, sem nada para escrever fora daqui.
const externalAdapters = new Map();
if (process.env.MVA_FIREBIRD_DATABASE) {
  try {
    externalAdapters.set('MVA', createClippClientFromEnvironment());
  } catch (error) {
    console.warn('Adaptador do Clipp indisponivel:', error.message);
  }
}

// O enderecamento ja esta gravado aqui quando esta funcao roda. Se o Clipp
// falhar, o registro fica pendente em vez de derrubar o envio do coletor: o
// estoquista continua trabalhando e a divergencia fica visivel para acerto.
async function syncExternalLocation(company, item, previousLocation) {
  const adapter = externalAdapters.get(company);
  if (!adapter) return null;

  const externalId = toClippProductId(item.productCode);
  if (!externalId) {
    const motivo = `O codigo ${item.productCode} nao e numerico e nao tem correspondencia no Clipp.`;
    productLocationStore.markExternalSync(company, item.productId, { status: 'pending', error: motivo });
    return { status: 'pending', error: motivo };
  }

  try {
    const gravado = await adapter.writeLocation({
      productId: externalId,
      location: item.location,
      previousLocation
    });
    productLocationStore.markExternalSync(company, item.productId, { status: 'synced' });
    return { status: 'synced', observation: gravado.observation };
  } catch (error) {
    productLocationStore.markExternalSync(company, item.productId, { status: 'pending', error: error.message });
    console.error(`Enderecamento do produto ${item.productId} nao chegou ao Clipp:`, error.message);
    return { status: 'pending', error: error.message };
  }
}

// As empresas atendidas pelo coletor. A Eletronica Horizonte usa o ZWeb e a
// MVA usa o Clipp, mas para o enderecamento as duas sao apenas um codigo.
function parseCompanies(rawValue) {
  const entries = String(rawValue || 'EH:Eletronica Horizonte,MVA:MVA')
    .split(',')
    .map(entry => entry.trim())
    .filter(Boolean)
    .map(entry => {
      const separatorIndex = entry.indexOf(':');
      const code = (separatorIndex > 0 ? entry.slice(0, separatorIndex) : entry).trim().toUpperCase();
      const name = separatorIndex > 0 ? entry.slice(separatorIndex + 1).trim() : code;
      return { code, name };
    })
    .filter(company => /^[A-Z0-9_-]+$/.test(company.code));
  return entries.length ? entries : [{ code: 'EH', name: 'Eletronica Horizonte' }];
}

function requireKnownCompany(value) {
  const code = String(value ?? '').trim().toUpperCase() || 'EH';
  if (!companies.some(company => company.code === code)) {
    throw Object.assign(new Error(`Empresa ${code} não está configurada no serviço.`), { status: 400 });
  }
  return code;
}

function parseMobileDeviceKeys(rawValue) {
  const devicesByKey = new Map();
  String(rawValue || '')
    .split(',')
    .map(entry => entry.trim())
    .filter(Boolean)
    .forEach(entry => {
      const separatorIndex = entry.indexOf(':');
      const deviceName = separatorIndex > 0 ? entry.slice(0, separatorIndex).trim() : '';
      const deviceKey = separatorIndex > 0 ? entry.slice(separatorIndex + 1).trim() : '';
      if (!deviceName || deviceKey.length < 16) {
        console.warn('Ignorando aparelho mal configurado em ZWEB_MOBILE_DEVICE_KEYS: use nome:chave com pelo menos 16 caracteres.');
        return;
      }
      devicesByKey.set(deviceKey, deviceName);
    });
  return devicesByKey;
}

function resolveMobileDevice(request) {
  const deviceKey = String(request.headers['x-zweb-device-key'] || '').trim();
  if (!deviceKey) return null;
  const deviceName = mobileDeviceKeys.get(deviceKey);
  return deviceName ? { name: deviceName } : null;
}

function writeJson(response, statusCode, body, origin) {
  const responseHeaders = { 'Content-Type': 'application/json' };
  if (origin && allowedOrigins.has(origin)) {
    responseHeaders['Access-Control-Allow-Origin'] = origin;
    responseHeaders.Vary = 'Origin';
  }
  response.writeHead(statusCode, responseHeaders);
  response.end(JSON.stringify(body));
}

async function readRequestBody(request, maxBytes = 5 * 1024 * 1024) {
  const chunks = [];
  let receivedBytes = 0;
  for await (const chunk of request) {
    receivedBytes += chunk.length;
    if (receivedBytes > maxBytes) throw Object.assign(new Error('Corpo da requisição excede o limite permitido.'), { status: 413 });
    chunks.push(chunk);
  }
  if (!chunks.length) return null;
  try {
    return JSON.parse(Buffer.concat(chunks).toString('utf8'));
  } catch {
    throw Object.assign(new Error('Corpo JSON inválido.'), { status: 400 });
  }
}

function normalizeSharedReturnEntry(entry) {
  if (!entry || typeof entry !== 'object') return null;
  const documentNumber = String(entry.documentNumber || '').replace(/\D+/g, '').replace(/^0+(?=\d)/, '');
  if (!documentNumber) return null;
  const total = Number(entry.total);
  return {
    documentNumber,
    customer: String(entry.customer || '').trim().slice(0, 240),
    nature: String(entry.nature || '').trim().slice(0, 160),
    issueDate: String(entry.issueDate || '').trim().slice(0, 40),
    status: String(entry.status || '').trim().slice(0, 120),
    total: Number.isFinite(total) ? total : null,
    active: entry.active !== false
  };
}

async function loadSharedReturnHistory() {
  if (sharedReturnHistoryLoadPromise) return sharedReturnHistoryLoadPromise;
  sharedReturnHistoryLoadPromise = readFile(sharedReturnHistoryFile, 'utf8')
    .then(contents => {
      const parsed = JSON.parse(contents);
      const entries = Array.isArray(parsed && parsed.entries)
        ? parsed.entries.map(normalizeSharedReturnEntry).filter(Boolean).slice(-4000)
        : [];
      sharedReturnHistory = {
        updatedAt: Number(parsed && parsed.updatedAt) || 0,
        entries
      };
    })
    .catch(error => {
      if (error.code !== 'ENOENT') console.error('Falha ao carregar histórico compartilhado:', error.message);
    })
    .finally(() => {
      sharedReturnHistoryLoadPromise = null;
    });
  return sharedReturnHistoryLoadPromise;
}

async function saveSharedReturnHistory(entries) {
  const nextHistory = { updatedAt: Date.now(), entries };
  await mkdir(dirname(sharedReturnHistoryFile), { recursive: true });
  const temporaryFile = `${sharedReturnHistoryFile}.tmp`;
  await writeFile(temporaryFile, JSON.stringify(nextHistory), 'utf8');
  await rename(temporaryFile, sharedReturnHistoryFile);
  sharedReturnHistory = nextHistory;
  return nextHistory;
}

async function findActiveRecipientByName(name) {
  ensureZwebOperationAllowed('recipientsRead');
  let firstId = '1';
  for (let pageNumber = 0; pageNumber < 50; pageNumber += 1) {
    const query = new URLSearchParams({ 'paginator[limit]': '100', 'paginator[page][firstId]': firstId });
    const page = await zwebClient.request(`/br/v1/recipients?${query.toString()}`);
    const recipient = Array.isArray(page && page.data)
      ? page.data.find(item => String(item && item.name || '').trim().toLocaleUpperCase('pt-BR') === name && item.active !== false)
      : null;
    if (recipient) return recipient;

    const lastId = page && page.paginator && page.paginator.page && page.paginator.page.lastId;
    if (!lastId || String(lastId) === String(firstId)) break;
    firstId = String(lastId);
  }
  return null;
}

async function getCachedZwebResponse(cacheKey, path, requestOptions) {
  ensureZwebOperationAllowed(getZwebOperationForCache(cacheKey));
  const cached = serviceResponseCache.get(cacheKey);
  const metrics = serviceCacheMetrics.get(cacheKey);
  if (cached && cached.expiresAt > Date.now()) {
    if (metrics) metrics.hits += 1;
    return cached.body;
  }
  const ongoingRequest = serviceResponseInFlight.get(cacheKey);
  if (ongoingRequest) {
    if (metrics) metrics.coalesced += 1;
    return ongoingRequest;
  }
  if (metrics) metrics.misses += 1;
  const cacheVersion = serviceCacheVersions.get(cacheKey) || 0;

  const requestPromise = zwebClient.request(path, requestOptions)
    .then(body => {
      const ttl = serviceCacheTtl[cacheKey] || 30_000;
      if ((serviceCacheVersions.get(cacheKey) || 0) === cacheVersion) {
        serviceResponseCache.set(cacheKey, { body, expiresAt: Date.now() + ttl });
      }
      return body;
    })
    .finally(() => {
      serviceResponseInFlight.delete(cacheKey);
    });
  serviceResponseInFlight.set(cacheKey, requestPromise);
  return requestPromise;
}

function getZwebOperationForCache(cacheKey) {
  return {
    categories: 'referenceCategoryRefresh',
    paymentModes: 'paymentModesRead',
    recipients: 'recipientsRead',
    salesStatuses: 'salesStatusesRead',
    products: 'productsRead'
  }[cacheKey] || '';
}

function ensureZwebOperationAllowed(operation) {
  if (productionZwebEnabled && operation && allowedZwebOperations.has(operation)) return;
  const error = new Error('Operação bloqueada até a homologação explícita.');
  error.status = 423;
  throw error;
}

function invalidateServiceCaches(input) {
  const requestedKeys = Array.isArray(input && input.keys) ? input.keys : [];
  const invalidated = [...new Set(requestedKeys.filter(key => Object.hasOwn(serviceCacheTtl, key)))];
  if (!invalidated.length) {
    throw Object.assign(new Error('Informe ao menos um cache reconhecido para invalidar.'), { status: 400 });
  }

  invalidated.forEach(cacheKey => {
    serviceResponseCache.delete(cacheKey);
    serviceCacheVersions.set(cacheKey, (serviceCacheVersions.get(cacheKey) || 0) + 1);
    const metrics = serviceCacheMetrics.get(cacheKey);
    if (metrics) metrics.invalidations += 1;
  });
  return { invalidated };
}

async function getCachedProductDetail(uuid) {
  ensureZwebOperationAllowed('productsRead');
  const cached = productDetailCache.get(uuid);
  const nowAt = Date.now();
  if (cached && cached.expiresAt > nowAt) {
    productDetailMetrics.hits += 1;
    return cached.body;
  }

  const ongoingRequest = productDetailInFlight.get(uuid);
  if (ongoingRequest) {
    productDetailMetrics.coalesced += 1;
    return ongoingRequest;
  }

  productDetailMetrics.misses += 1;
  const requestPromise = zwebClient.request(`/br/v1/stock/products/${encodeURIComponent(uuid)}`, { timeoutMs: 12_000 })
    .then(body => {
      productDetailCache.set(uuid, { body, expiresAt: Date.now() + productDetailCacheTtlMs });
      while (productDetailCache.size > productDetailCacheLimit) {
        productDetailCache.delete(productDetailCache.keys().next().value);
      }
      return body;
    })
    .finally(() => {
      productDetailInFlight.delete(uuid);
    });
  productDetailInFlight.set(uuid, requestPromise);
  return requestPromise;
}

async function getServiceMetrics() {
  await loadSharedReturnHistory();
  const nowAt = Date.now();
  const cache = {};
  Object.entries(serviceCacheTtl).forEach(([cacheKey, ttlMs]) => {
    const cached = serviceResponseCache.get(cacheKey);
    const counters = serviceCacheMetrics.get(cacheKey) || { hits: 0, misses: 0, coalesced: 0, invalidations: 0 };
    const expiresAt = cached ? cached.expiresAt : 0;
    cache[cacheKey] = {
      ttlMs,
      cached: !!(cached && expiresAt > nowAt),
      remainingMs: Math.max(0, expiresAt - nowAt),
      inFlight: serviceResponseInFlight.has(cacheKey),
      hits: counters.hits,
      misses: counters.misses,
      coalesced: counters.coalesced,
      invalidations: counters.invalidations
    };
  });

  return {
    generatedAt: nowAt,
    cache,
    sharedReturnHistory: {
      updatedAt: sharedReturnHistory.updatedAt,
      ageMs: sharedReturnHistory.updatedAt ? Math.max(0, nowAt - sharedReturnHistory.updatedAt) : null,
      ttlMs: sharedReturnHistoryTtlMs,
      remainingMs: sharedReturnHistory.updatedAt
        ? Math.max(0, sharedReturnHistory.updatedAt + sharedReturnHistoryTtlMs - nowAt)
        : 0,
      fresh: !!sharedReturnHistory.updatedAt && nowAt - sharedReturnHistory.updatedAt < sharedReturnHistoryTtlMs
    },
    productDetails: {
      ttlMs: productDetailCacheTtlMs,
      entries: productDetailCache.size,
      inFlight: productDetailInFlight.size,
      hits: productDetailMetrics.hits,
      misses: productDetailMetrics.misses,
      coalesced: productDetailMetrics.coalesced
    }
  };
}

const server = createServer(async (request, response) => {
  const requestOrigin = request.headers.origin;
  const isHealthRequest = request.method === 'GET' && request.url === '/health';
  const mobileDevice = resolveMobileDevice(request);
  const isMobileRoute = String(request.url || '').split('?')[0].startsWith('/api/mobile/');
  const hasServiceKey = !internalServiceKey || request.headers['x-zweb-service-key'] === internalServiceKey;
  if (!isHealthRequest && !hasServiceKey && !(isMobileRoute && mobileDevice)) {
    const authenticationError = isMobileRoute ? 'Aparelho não autorizado.' : 'Autenticação do serviço inválida.';
    writeJson(response, 401, { error: authenticationError }, requestOrigin);
    return;
  }
  if (request.method === 'OPTIONS') {
    const preflightHeaders = {
      'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, X-Zweb-Service-Key, X-Zweb-Device-Key'
    };
    if (requestOrigin && allowedOrigins.has(requestOrigin)) {
      preflightHeaders['Access-Control-Allow-Origin'] = requestOrigin;
      preflightHeaders.Vary = 'Origin';
    }
    response.writeHead(204, preflightHeaders);
    response.end();
    return;
  }

  if (request.method === 'GET' && request.url === '/health') {
    const healthy = !configurationError;
    writeJson(response, healthy ? 200 : 503, { service: 'zweb-api', configured: healthy }, requestOrigin);
    return;
  }

  const requestUrl = new URL(request.url, 'http://zweb-api.local');
  const productLocationPath = requestUrl.pathname;
  if (productLocationPath === '/api/zweb/cache/invalidate' && request.method === 'POST') {
    try {
      writeJson(response, 200, invalidateServiceCaches(await readRequestBody(request)), requestOrigin);
    } catch (error) {
      writeJson(response, error.status || 500, { error: error.message }, requestOrigin);
    }
    return;
  }
  if (productLocationPath === '/api/zweb/product-locations' && request.method === 'GET') {
    try {
      const productIds = String(requestUrl.searchParams.get('productIds') || '')
        .split(',')
        .map(value => value.trim())
        .filter(Boolean);
      const company = requireKnownCompany(requestUrl.searchParams.get('company'));
      writeJson(response, 200, { locations: productLocationStore.getLocationsByProductIds(productIds, company) }, requestOrigin);
    } catch (error) {
      writeJson(response, error.status || 500, { error: error.message }, requestOrigin);
    }
    return;
  }

  if (productLocationPath === '/api/zweb/product-locations/by-codes' && request.method === 'GET') {
    try {
      const productCodes = String(requestUrl.searchParams.get('productCodes') || '')
        .split(',')
        .map(value => value.trim())
        .filter(Boolean);
      const company = requireKnownCompany(requestUrl.searchParams.get('company'));
      writeJson(response, 200, { locations: productLocationStore.getLocationsByProductCodes(productCodes, company) }, requestOrigin);
    } catch (error) {
      writeJson(response, error.status || 500, { error: error.message }, requestOrigin);
    }
    return;
  }

  const productLocationByCodeMatch = productLocationPath.match(/^\/api\/zweb\/product-locations\/by-code\/([^/]+)$/);
  if (productLocationByCodeMatch && request.method === 'GET') {
    try {
      const productCode = decodeURIComponent(productLocationByCodeMatch[1]);
      const location = productLocationStore.getLocationByProductCode(productCode, requireKnownCompany(requestUrl.searchParams.get('company')));
      if (!location) {
        writeJson(response, 404, { error: 'Enderecamento nao encontrado.' }, requestOrigin);
      } else {
        writeJson(response, 200, location, requestOrigin);
      }
    } catch (error) {
      writeJson(response, error.status || 500, { error: error.message }, requestOrigin);
    }
    return;
  }

  if (productLocationByCodeMatch && request.method === 'PUT') {
    try {
      const productCode = decodeURIComponent(productLocationByCodeMatch[1]);
      const body = await readRequestBody(request);
      const company = requireKnownCompany((body && body.company) || requestUrl.searchParams.get('company'));
      const location = productLocationStore.saveLocationByProductCode({ ...body, company, productCode });
      if (body && body.productCode) {
        try {
          productLocationStore.upsertCatalogItems([{
            productId: location.productId,
            productCode,
            productDescription: body.productDescription,
            barcode: body.barcode
          }]);
        } catch (error) {
          console.warn('Catalogo nao atualizado a partir do enderecamento:', error.message);
        }
      }
      writeJson(response, 200, location, requestOrigin);
    } catch (error) {
      writeJson(response, error.status || 500, { error: error.message }, requestOrigin);
    }
    return;
  }

  const productLocationRemoveByCodeMatch = productLocationPath.match(/^\/api\/zweb\/product-locations\/by-code\/([^/]+)\/remove$/);
  if (productLocationRemoveByCodeMatch && request.method === 'POST') {
    try {
      const productCode = decodeURIComponent(productLocationRemoveByCodeMatch[1]);
      const body = await readRequestBody(request) || {};
      const company = requireKnownCompany(body.company || requestUrl.searchParams.get('company'));
      const removed = productLocationStore.deleteLocationByProductCode(productCode, company, { actorName: body.actorName });
      if (!removed) {
        writeJson(response, 404, { error: 'Enderecamento nao encontrado.' }, requestOrigin);
        return;
      }
      writeJson(response, 200, { removed: true, previousLocation: removed.location, company }, requestOrigin);
    } catch (error) {
      writeJson(response, error.status || 500, { error: error.message }, requestOrigin);
    }
    return;
  }

  const productLocationMatch = productLocationPath.match(/^\/api\/zweb\/product-locations\/(\d+)$/);
  if (productLocationMatch && request.method === 'GET') {
    try {
      const location = productLocationStore.getLocation(productLocationMatch[1], requireKnownCompany(requestUrl.searchParams.get('company')));
      if (!location) {
        writeJson(response, 404, { error: 'Enderecamento nao encontrado.' }, requestOrigin);
      } else {
        writeJson(response, 200, location, requestOrigin);
      }
    } catch (error) {
      writeJson(response, error.status || 500, { error: error.message }, requestOrigin);
    }
    return;
  }

  if (productLocationMatch && request.method === 'PUT') {
    try {
      const body = await readRequestBody(request);
      const company = requireKnownCompany((body && body.company) || requestUrl.searchParams.get('company'));
      const location = productLocationStore.saveLocation({ ...body, company, productId: productLocationMatch[1] });
      // A extensao ja leu codigo, descricao e codigo de barras da tela aberta.
      // Aproveitar isso mantem o catalogo do coletor vivo sem nenhuma chamada
      // extra ao ZWeb, no lugar da varredura em massa que foi removida.
      if (body && body.productCode) {
        try {
          productLocationStore.upsertCatalogItems([{
            productId: productLocationMatch[1],
            productCode: body.productCode,
            productDescription: body.productDescription,
            barcode: body.barcode
          }]);
        } catch (error) {
          console.warn('Catalogo nao atualizado a partir do enderecamento:', error.message);
        }
      }
      writeJson(response, 200, location, requestOrigin);
    } catch (error) {
      writeJson(response, error.status || 500, { error: error.message }, requestOrigin);
    }
    return;
  }

  // Enderecamentos que ainda nao chegaram ao sistema externo da empresa.
  // Remocao por POST, e nao DELETE: a ponte da extensao so encaminha
  // GET, POST e PUT.
  const productLocationRemoveMatch = productLocationPath.match(/^\/api\/zweb\/product-locations\/(\d+)\/remove$/);
  if (productLocationRemoveMatch && request.method === 'POST') {
    try {
      const body = await readRequestBody(request) || {};
      const company = requireKnownCompany(body.company || requestUrl.searchParams.get('company'));
      const removido = productLocationStore.deleteLocation(productLocationRemoveMatch[1], company, {
        actorName: body.actorName
      });
      if (!removido) {
        writeJson(response, 404, { error: 'Enderecamento nao encontrado.' }, requestOrigin);
        return;
      }
      writeJson(response, 200, { removed: true, previousLocation: removido.location, company }, requestOrigin);
    } catch (error) {
      writeJson(response, error.status || 500, { error: error.message }, requestOrigin);
    }
    return;
  }

  if (productLocationPath === '/api/zweb/product-locations/pending-sync' && request.method === 'GET') {
    try {
      const company = requireKnownCompany(requestUrl.searchParams.get('company'));
      const pendentes = productLocationStore.getPendingExternalSync(company, requestUrl.searchParams.get('limit'));
      writeJson(response, 200, { company, total: pendentes.length, locations: pendentes }, requestOrigin);
    } catch (error) {
      writeJson(response, error.status || 500, { error: error.message }, requestOrigin);
    }
    return;
  }

  // Reprocessa as pendencias. Sem saber qual endereco o Clipp tem hoje, a
  // substituicao se apoia no padrao das etiquetas para achar o bloco antigo.
  if (productLocationPath === '/api/zweb/product-locations/retry-sync' && request.method === 'POST') {
    try {
      const body = await readRequestBody(request) || {};
      const company = requireKnownCompany(body.company);
      if (!externalAdapters.has(company)) {
        writeJson(response, 400, { error: `A empresa ${company} não tem sistema externo configurado.` }, requestOrigin);
        return;
      }
      const pendentes = productLocationStore.getPendingExternalSync(company, body.limit);
      const resultados = [];
      for (const pendente of pendentes) {
        const externo = await syncExternalLocation(company, pendente, undefined);
        resultados.push({
          productId: pendente.productId,
          productCode: pendente.productCode,
          location: pendente.location,
          status: externo ? externo.status : 'sem_adaptador',
          error: externo && externo.error ? externo.error : null
        });
      }
      writeJson(response, 200, {
        company,
        total: resultados.length,
        syncedCount: resultados.filter(item => item.status === 'synced').length,
        results: resultados
      }, requestOrigin);
    } catch (error) {
      writeJson(response, error.status || 500, { error: error.message }, requestOrigin);
    }
    return;
  }

  // O OAuth de terceiro nao da acesso confiavel a estas RPCs internas. A
  // gravacao ocorre exclusivamente na extensao, dentro da sessao autenticada
  // do navegador. Manter esta rota recusada evita que uma configuracao futura
  // volte a disparar tentativas diretas pelo servidor.
  if (productLocationPath === '/api/zweb/product-barcode-requests/apply' && request.method === 'POST') {
    writeJson(response, 409, { error: 'A aplicacao do codigo de barras deve ocorrer pela extensao autenticada do navegador.' }, requestOrigin);
    return;
  }

  if (productLocationPath === '/api/zweb/product-barcode-requests/pending' && request.method === 'GET') {
    try {
      // Escrever no ZWeb fica bloqueado ate a homologacao explicita: sem isso
      // a extensao nao recebe nada para aplicar.
      ensureZwebOperationAllowed('barcodeWrite');
      const pendentes = productLocationStore.getPendingBarcodeRequests(requestUrl.searchParams.get('limit'));
      writeJson(response, 200, { total: pendentes.length, requests: pendentes }, requestOrigin);
    } catch (error) {
      writeJson(response, error.status || 500, { error: error.message }, requestOrigin);
    }
    return;
  }

  const barcodeRequestMatch = productLocationPath.match(/^\/api\/zweb\/product-barcode-requests\/(\d+)\/(applied|failed)$/);
  if (barcodeRequestMatch && request.method === 'POST') {
    try {
      const body = await readRequestBody(request) || {};
      productLocationStore.markBarcodeRequest(barcodeRequestMatch[1], 'zweb', {
        status: barcodeRequestMatch[2],
        error: body.message
      });
      writeJson(response, 204, null, requestOrigin);
    } catch (error) {
      writeJson(response, error.status || 500, { error: error.message }, requestOrigin);
    }
    return;
  }

  if (productLocationPath === '/api/zweb/product-shelf-batches/pending' && request.method === 'GET') {
    try {
      ensureZwebOperationAllowed('shelfBatchWrite');
      // Esta fila e exclusivamente da Horizonte. A MVA confirma no ClippStore
      // pelo codigo interno e nunca deve ser entregue a extensao do ZWeb.
      const batch = productLocationStore.getNextPendingShelfBatch('EH');
      writeJson(response, 200, { batch }, requestOrigin);
    } catch (error) {
      writeJson(response, error.status || 500, { error: error.message }, requestOrigin);
    }
    return;
  }

  const shelfBatchItemMatch = productLocationPath.match(/^\/api\/zweb\/product-shelf-batches\/([^/]+)\/items\/(\d+)\/(applied|failed)$/);
  if (shelfBatchItemMatch && request.method === 'POST') {
    try {
      ensureZwebOperationAllowed('shelfBatchWrite');
      const body = await readRequestBody(request) || {};
      const item = shelfBatchItemMatch[3] === 'applied'
        ? productLocationStore.markShelfBatchItemApplied(shelfBatchItemMatch[1], shelfBatchItemMatch[2], body)
        : productLocationStore.markShelfBatchItemFailed(shelfBatchItemMatch[1], shelfBatchItemMatch[2], body.message);
      writeJson(response, 200, { item }, requestOrigin);
    } catch (error) {
      writeJson(response, error.status || 500, { error: error.message }, requestOrigin);
    }
    return;
  }

  if (productLocationPath === '/api/zweb/product-catalog' && request.method === 'PUT') {
    try {
      const body = await readRequestBody(request);
      writeJson(response, 200, productLocationStore.upsertCatalogItems(body && body.items), requestOrigin);
    } catch (error) {
      writeJson(response, error.status || 500, { error: error.message }, requestOrigin);
    }
    return;
  }

  if (productLocationPath === '/api/zweb/product-catalog/complete' && request.method === 'POST') {
    try {
      const body = await readRequestBody(request) || {};
      writeJson(response, 200, productLocationStore.markCatalogSyncCompleted(body.items), requestOrigin);
    } catch (error) {
      writeJson(response, error.status || 500, { error: error.message }, requestOrigin);
    }
    return;
  }

  if (productLocationPath === '/api/zweb/product-catalog/status' && request.method === 'GET') {
    try {
      writeJson(response, 200, productLocationStore.getCatalogStatus(), requestOrigin);
    } catch (error) {
      writeJson(response, error.status || 500, { error: error.message }, requestOrigin);
    }
    return;
  }

  if (isMobileRoute) {
    if (!mobileDevice) {
      writeJson(response, 401, { error: 'Aparelho não autorizado.' }, requestOrigin);
      return;
    }
    try {
      if (productLocationPath === '/api/mobile/session' && request.method === 'POST') {
        writeJson(response, 200, {
          success: true,
          device: mobileDevice.name,
          companies,
          catalog: productLocationStore.getCatalogStatus(),
          serverTime: new Date().toISOString()
        }, requestOrigin);
        return;
      }

      if (productLocationPath === '/api/mobile/scan/resolve' && request.method === 'POST') {
        const body = await readRequestBody(request);
        const company = requireKnownCompany(body && body.company);
        writeJson(response, 200, { company, items: productLocationStore.resolveScannedCodes(body && body.itemCodes, company) }, requestOrigin);
        return;
      }

      // O estoquista leu um codigo que ninguem conhece e diz de qual produto
      // ele e. O catalogo daqui e o Clipp aceitam na hora; o ZWeb depende da
      // sessao do navegador e fica na fila da extensao.
      if (productLocationPath === '/api/mobile/barcodes' && request.method === 'POST') {
        const body = await readRequestBody(request) || {};
        const pedido = productLocationStore.createBarcodeRequest({
          productCode: body.productCode,
          barcode: body.barcode,
          requestedBy: mobileDevice.name
        });

        const clipp = externalAdapters.get('MVA');
        const clippId = toClippProductId(pedido.productCode);
        if (clipp && clippId) {
          try {
            await clipp.writeBarcode({ productId: clippId, barcode: pedido.barcode });
            productLocationStore.markBarcodeRequest(pedido.requestId, 'clipp', { status: 'applied' });
            pedido.clippStatus = 'applied';
          } catch (error) {
            productLocationStore.markBarcodeRequest(pedido.requestId, 'clipp', { status: 'pending', error: error.message });
            pedido.clippStatus = 'pending';
            pedido.clippError = error.message;
            console.error(`Codigo de barras do produto ${pedido.productCode} nao chegou ao Clipp:`, error.message);
          }
        }

        // O pedido fica pendente ate uma aba autenticada do cadastro de
        // produtos executar uma unica RPC. O token da sessao nao sai do
        // navegador e o servico nao faz consulta nem repeticao automatica.
        pedido.zwebStatus = 'pending';
        pedido.zwebError = null;

        writeJson(response, 200, pedido, requestOrigin);
        return;
      }

      if (productLocationPath === '/api/mobile/shelf-batches' && request.method === 'POST') {
        const body = await readRequestBody(request) || {};
        const company = requireKnownCompany(body.company);
        const clipp = company === 'MVA' ? externalAdapters.get('MVA') : null;
        if (company === 'MVA' && !clipp) {
          throw Object.assign(new Error('ClippStore da MVA nao esta configurado no servidor.'), { status: 503 });
        }
        const batch = productLocationStore.createShelfBatch({
          company,
          location: body.locationCode,
          requestedBy: mobileDevice.name,
          items: body.items
        });
        if (company === 'MVA') {
          for (const pendingItem of batch.items) {
            const clippProductId = toClippProductId(pendingItem.productCode);
            if (!clippProductId) {
              const error = `O codigo ${pendingItem.productCode} nao pode ser usado no ClippStore.`;
              productLocationStore.markShelfBatchItemFailed(batch.batchId, pendingItem.itemId, error);
              throw Object.assign(new Error(error), { status: 400 });
            }
            const previousLocation = productLocationStore.getLocation(clippProductId, company)?.location;
            let applied;
            try {
              if (pendingItem.barcode) await clipp.writeBarcode({ productId: clippProductId, barcode: pendingItem.barcode });
              applied = productLocationStore.markShelfBatchItemApplied(batch.batchId, pendingItem.itemId, {
                productId: clippProductId,
                productCode: pendingItem.productCode,
                productDescription: pendingItem.productDescription,
                barcode: pendingItem.barcode
              });
              if (applied.status !== 'applied') throw new Error('O ClippStore nao confirmou o item.');
            } catch (error) {
              productLocationStore.markShelfBatchItemFailed(batch.batchId, pendingItem.itemId, error.message);
              throw error;
            }

            // O produto ja foi persistido no banco interno. A sincronizacao do
            // endereco com o Clipp pode ficar pendente sem fazer o coletor
            // repetir a escrita do codigo de barras.
            await syncExternalLocation(company, {
              productId: clippProductId,
              productCode: pendingItem.productCode,
              location: batch.location
            }, previousLocation);
          }
        }
        writeJson(response, 201, { success: true, batch: productLocationStore.getShelfBatch(batch.batchId) }, requestOrigin);
        return;
      }

      if (productLocationPath === '/api/mobile/locations/assign' && request.method === 'POST') {
        const body = await readRequestBody(request);
        const locationCode = String(body && body.locationCode || '').trim();
        const company = requireKnownCompany(body && body.company);
        // O endereco anterior e capturado antes de gravar: e ele que permite
        // substituir o bloco certo na observacao do Clipp, em vez de empilhar.
        const enderecosAnteriores = new Map(
          productLocationStore.resolveScannedCodes(body && body.itemCodes, company)
            .filter(item => item.found)
            .map(item => [item.productId, item.currentLocation])
        );
        const results = productLocationStore.assignScannedLocations({
          company,
          codes: body && body.itemCodes,
          location: locationCode,
          actorName: mobileDevice.name
        });
        for (const item of results) {
          if (item.status !== 'success') continue;
          const externo = await syncExternalLocation(company, item, enderecosAnteriores.get(item.productId));
          if (!externo) continue;
          item.externalStatus = externo.status;
          if (externo.status === 'pending') item.message = `${item.message} Ainda nao gravado no Clipp.`;
        }
        const successCount = results.filter(item => item.status === 'success').length;
        const notFoundCount = results.filter(item => item.status === 'not_found').length;
        const pendingSyncCount = results.filter(item => item.externalStatus === 'pending').length;
        writeJson(response, 200, {
          success: successCount > 0,
          summary: {
            company,
            totalItems: results.length,
            successCount,
            notFoundCount,
            errorCount: results.length - successCount,
            pendingSyncCount,
            locationCode
          },
          results
        }, requestOrigin);
        return;
      }
    } catch (error) {
      writeJson(response, error.status || 500, { error: error.message }, requestOrigin);
      return;
    }
  }

  if (productLocationPath === '/api/zweb/product-location-import-runs' && request.method === 'POST') {
    try {
      writeJson(response, 201, productLocationStore.createImportRun(await readRequestBody(request)), requestOrigin);
    } catch (error) {
      writeJson(response, error.status || 500, { error: error.message }, requestOrigin);
    }
    return;
  }

  if (productLocationPath === '/api/zweb/product-location-import-runs/latest' && request.method === 'GET') {
    try {
      const run = productLocationStore.getLatestImportRunBySource(requestUrl.searchParams.get('source') || 'zweb-observation');
      if (!run) {
        writeJson(response, 404, { error: 'Nenhuma importacao encontrada.' }, requestOrigin);
      } else {
        writeJson(response, 200, run, requestOrigin);
      }
    } catch (error) {
      writeJson(response, error.status || 500, { error: error.message }, requestOrigin);
    }
    return;
  }

  const importItemsMatch = productLocationPath.match(/^\/api\/zweb\/product-location-import-runs\/([^/]+)\/items$/);
  if (importItemsMatch && request.method === 'PUT') {
    try {
      const body = await readRequestBody(request);
      productLocationStore.upsertImportItems(importItemsMatch[1], body && body.items);
      writeJson(response, 204, null, requestOrigin);
    } catch (error) {
      writeJson(response, error.status || 500, { error: error.message }, requestOrigin);
    }
    return;
  }

  const importPendingMatch = productLocationPath.match(/^\/api\/zweb\/product-location-import-runs\/([^/]+)\/pending$/);
  if (importPendingMatch && request.method === 'GET') {
    try {
      const items = productLocationStore.getPendingImportItems(importPendingMatch[1], requestUrl.searchParams.get('limit'));
      writeJson(response, 200, { items }, requestOrigin);
    } catch (error) {
      writeJson(response, error.status || 500, { error: error.message }, requestOrigin);
    }
    return;
  }

  const importFailedMatch = productLocationPath.match(/^\/api\/zweb\/product-location-import-runs\/([^/]+)\/failed$/);
  if (importFailedMatch && request.method === 'GET') {
    try {
      const items = productLocationStore.getFailedImportItems(importFailedMatch[1], requestUrl.searchParams.get('limit'));
      writeJson(response, 200, { items }, requestOrigin);
    } catch (error) {
      writeJson(response, error.status || 500, { error: error.message }, requestOrigin);
    }
    return;
  }

  const importItemActionMatch = productLocationPath.match(/^\/api\/zweb\/product-location-import-runs\/([^/]+)\/items\/(\d+)\/(location-saved|cleared|failed)$/);
  if (importItemActionMatch && request.method === 'POST') {
    try {
      const body = await readRequestBody(request) || {};
      const [, runId, productId, action] = importItemActionMatch;
      if (action === 'location-saved') productLocationStore.markImportItemLocationSaved(runId, productId);
      if (action === 'cleared') productLocationStore.markImportItemCleared(runId, productId, { cleanupOnly: body.cleanupOnly === true });
      if (action === 'failed') productLocationStore.markImportItemFailed(runId, productId, body.message);
      writeJson(response, 204, null, requestOrigin);
    } catch (error) {
      writeJson(response, error.status || 500, { error: error.message }, requestOrigin);
    }
    return;
  }

  const importRunMatch = productLocationPath.match(/^\/api\/zweb\/product-location-import-runs\/([^/]+)$/);
  const importFinishMatch = productLocationPath.match(/^\/api\/zweb\/product-location-import-runs\/([^/]+)\/finish$/);
  const importResumeMatch = productLocationPath.match(/^\/api\/zweb\/product-location-import-runs\/([^/]+)\/resume$/);
  if (importResumeMatch && request.method === 'POST') {
    try {
      writeJson(response, 200, productLocationStore.resumeImportRun(importResumeMatch[1]), requestOrigin);
    } catch (error) {
      writeJson(response, error.status || 500, { error: error.message }, requestOrigin);
    }
    return;
  }
  if (importFinishMatch && request.method === 'POST') {
    try {
      productLocationStore.finishImportRun(importFinishMatch[1]);
      writeJson(response, 204, null, requestOrigin);
    } catch (error) {
      writeJson(response, error.status || 500, { error: error.message }, requestOrigin);
    }
    return;
  }
  if (importRunMatch && request.method === 'GET') {
    try {
      const run = productLocationStore.getImportRun(importRunMatch[1]);
      if (!run) {
        writeJson(response, 404, { error: 'Importacao nao encontrada.' }, requestOrigin);
      } else {
        writeJson(response, 200, run, requestOrigin);
      }
    } catch (error) {
      writeJson(response, error.status || 500, { error: error.message }, requestOrigin);
    }
    return;
  }

  if (request.method === 'GET' && request.url === '/api/zweb/categories') {
    if (!zwebClient) {
      writeJson(response, 503, { error: 'Serviço não configurado.' }, requestOrigin);
      return;
    }

    try {
      const categories = await getCachedZwebResponse('categories', '/br/v1/finance/categories?paginator%5Blimit%5D=100&paginator%5Bpage%5D%5BfirstId%5D=1');
      writeJson(response, 200, categories, requestOrigin);
    } catch (error) {
      writeJson(response, error.status || 502, { error: error.message, details: error.details }, requestOrigin);
    }
    return;
  }

  const publicListRoutes = {
    '/api/zweb/payment-modes': ['paymentModes', '/br/v1/finance/payment-modes?paginator%5Blimit%5D=100&paginator%5Bpage%5D%5BfirstId%5D=1'],
    '/api/zweb/recipients': ['recipients', '/br/v1/recipients?paginator%5Blimit%5D=100&paginator%5Bpage%5D%5BfirstId%5D=1'],
    '/api/zweb/sales-statuses': ['salesStatuses', '/br/v1/sales/statuses?paginator%5Blimit%5D=100&paginator%5Bpage%5D%5BfirstId%5D=1']
  };
  if (request.method === 'GET' && publicListRoutes[request.url]) {
    if (!zwebClient) {
      writeJson(response, 503, { error: 'Serviço não configurado.' }, requestOrigin);
      return;
    }
    const [cacheKey, apiPath] = publicListRoutes[request.url];
    try {
      writeJson(response, 200, await getCachedZwebResponse(cacheKey, apiPath), requestOrigin);
    } catch (error) {
      writeJson(response, error.status || 502, { error: error.message, details: error.details }, requestOrigin);
    }
    return;
  }

  if (request.method === 'GET' && request.url === '/api/zweb/default-dav-recipient') {
    writeJson(response, 200, defaultDavRecipient, requestOrigin);
    return;
  }

  if (request.method === 'GET' && request.url === '/api/zweb/products') {
    if (!zwebClient) {
      writeJson(response, 503, { error: 'Serviço não configurado.' }, requestOrigin);
      return;
    }
    try {
      const products = await getCachedZwebResponse(
        'products',
        '/br/v1/stock/products?paginator%5Blimit%5D=1&paginator%5Bpage%5D%5BfirstId%5D=1',
        { timeoutMs: 12_000 }
      );
      writeJson(response, 200, products, requestOrigin);
    } catch (error) {
      writeJson(response, error.status || 502, { error: error.message, details: error.details }, requestOrigin);
    }
    return;
  }

  const productPathMatch = request.method === 'GET'
    ? new URL(request.url, 'http://zweb-api.local').pathname.match(/^\/api\/zweb\/products\/([^/]+)$/)
    : null;
  if (productPathMatch) {
    let productUuid;
    try {
      productUuid = decodeURIComponent(productPathMatch[1]).toLowerCase();
    } catch {
      writeJson(response, 400, { error: 'UUID de produto inválido.' }, requestOrigin);
      return;
    }
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/.test(productUuid)) {
      writeJson(response, 400, { error: 'UUID de produto inválido.' }, requestOrigin);
      return;
    }
    if (!zwebClient) {
      writeJson(response, 503, { error: 'Serviço não configurado.' }, requestOrigin);
      return;
    }
    try {
      writeJson(response, 200, await getCachedProductDetail(productUuid), requestOrigin);
    } catch (error) {
      writeJson(response, error.status || 502, { error: error.message, details: error.details }, requestOrigin);
    }
    return;
  }

  if (request.method === 'GET' && request.url === '/api/zweb/metrics') {
    try {
      writeJson(response, 200, await getServiceMetrics(), requestOrigin);
    } catch (error) {
      writeJson(response, error.status || 500, { error: error.message }, requestOrigin);
    }
    return;
  }

  if (request.url === '/api/zweb/commission-returns') {
    try {
      await loadSharedReturnHistory();
      if (request.method === 'GET') {
        writeJson(response, 200, sharedReturnHistory, requestOrigin);
        return;
      }
      if (request.method === 'PUT') {
        const body = await readRequestBody(request);
        const entries = Array.isArray(body && body.entries)
          ? body.entries.map(normalizeSharedReturnEntry).filter(Boolean).slice(-4000)
          : null;
        if (!entries) {
          writeJson(response, 400, { error: 'A lista de devoluções é obrigatória.' }, requestOrigin);
          return;
        }
        const savedHistory = await saveSharedReturnHistory(entries);
        writeJson(response, 200, savedHistory, requestOrigin);
        return;
      }
    } catch (error) {
      writeJson(response, error.status || 500, { error: error.message }, requestOrigin);
      return;
    }
  }

  writeJson(response, 404, { error: 'Rota não encontrada.' }, requestOrigin);
  return;
});

server.listen(port, bindHost, () => {
  console.log(`Serviço zweb-api aguardando em http://${bindHost}:${port}`);
});
