const serviceUrl = process.env.ZWEB_INTERNAL_SERVICE_URL || 'http://192.168.1.240:8788';
const serviceKey = process.env.ZWEB_INTERNAL_SERVICE_KEY;
const requestCount = Number(process.env.ZWEB_BENCHMARK_REQUESTS || 10);

if (!serviceKey) {
  throw new Error('Defina ZWEB_INTERNAL_SERVICE_KEY antes de executar o benchmark.');
}

const endpoints = [
  { label: 'Categorias financeiras', path: '/api/zweb/categories', cacheKey: 'categories' },
  { label: 'Formas de pagamento', path: '/api/zweb/payment-modes', cacheKey: 'paymentModes' },
  { label: 'Clientes e destinatários', path: '/api/zweb/recipients', cacheKey: 'recipients' },
  { label: 'Status de vendas', path: '/api/zweb/sales-statuses', cacheKey: 'salesStatuses' },
  { label: 'Cliente padrão para DAV', path: '/api/zweb/default-dav-recipient', cacheKey: null }
];

const headers = {
  Accept: 'application/json',
  'X-Zweb-Service-Key': serviceKey
};

async function request(path) {
  const startedAt = performance.now();
  const response = await fetch(`${serviceUrl}${path}`, { headers });
  const body = await response.json();
  if (!response.ok) throw new Error(`${path} respondeu HTTP ${response.status}: ${body.error || 'erro sem detalhe'}`);
  return { durationMs: performance.now() - startedAt, body };
}

function percentile(sortedValues, fraction) {
  return sortedValues[Math.min(sortedValues.length - 1, Math.ceil(sortedValues.length * fraction) - 1)];
}

function readCounters(metrics, cacheKey) {
  if (!cacheKey) return null;
  const cache = metrics.cache[cacheKey];
  return { hits: cache.hits, misses: cache.misses, coalesced: cache.coalesced };
}

function counterDelta(before, after) {
  if (!before || !after) return null;
  return {
    hits: after.hits - before.hits,
    misses: after.misses - before.misses,
    coalesced: after.coalesced - before.coalesced
  };
}

const initialMetrics = await request('/api/zweb/metrics').then(({ body }) => body);
const results = [];

for (const endpoint of endpoints) {
  const before = readCounters(initialMetrics, endpoint.cacheKey);
  const attempts = await Promise.all(Array.from({ length: requestCount }, () => request(endpoint.path)));
  const finalMetrics = await request('/api/zweb/metrics').then(({ body }) => body);
  const after = readCounters(finalMetrics, endpoint.cacheKey);
  const durations = attempts.map(attempt => attempt.durationMs).sort((left, right) => left - right);
  const counters = counterDelta(before, after);
  results.push({
    consulta: endpoint.label,
    pedidosSimultaneos: requestCount,
    tempoMinimoMs: Math.round(durations[0]),
    tempoMedianoMs: Math.round(percentile(durations, 0.5)),
    tempoP95Ms: Math.round(percentile(durations, 0.95)),
    tempoMaximoMs: Math.round(durations.at(-1)),
    chamadasExternas: counters ? counters.misses : 0,
    respostasReaproveitadas: counters ? counters.hits + counters.coalesced : requestCount,
    chamadasEvitadas: counters ? requestCount - counters.misses : requestCount,
    detalhesCache: counters || { hits: requestCount, misses: 0, coalesced: 0 }
  });
}

console.log(JSON.stringify({
  generatedAt: new Date().toISOString(),
  serviceUrl,
  requestCount,
  results
}, null, 2));
