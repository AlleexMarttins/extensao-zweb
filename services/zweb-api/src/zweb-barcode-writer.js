/// Aplica no ZWeb os codigos de barras que o coletor associou.
///
/// O caminho e celular -> servico -> ZWeb, sem navegador e sem ninguem
/// confirmar no PC. Quem dispara e a propria associacao feita no coletor.
///
/// As travas exigidas para qualquer operacao que toque o ZWeb estao todas
/// aqui: chave propria de liberacao, uma requisicao por vez, teto de itens por
/// execucao, parada na primeira falha e registro de quando sera a proxima
/// tentativa. Nao existe timer: quem falha so volta a ser tentado quando o
/// coletor associar outro codigo, nunca sozinho em segundos.

const LIMITE_PADRAO = 10;
const ESPERA_APOS_FALHA_MS = 60 * 60 * 1000;

/// Ate quando a fila fica parada depois de uma falha. Sem isto o bloqueio era
/// so um texto no resumo: cada item lido no coletor tentaria de novo, e com o
/// ZWeb recusando isso viraria uma rajada de logins falhos.
let bloqueadoAte = null;

export function limparBloqueioDaFila() {
  bloqueadoAte = null;
}

/// Erro que separa "a API do ZWeb recusou" de "nos ainda nao sabemos gravar".
export class FormatoNaoConfirmadoError extends Error {
  constructor(mensagem) {
    super(mensagem);
    this.name = 'FormatoNaoConfirmadoError';
    this.formatoNaoConfirmado = true;
  }
}

/// O ZWeb devolve o produto ora solto, ora dentro de `data`, ora como o
/// primeiro item de uma lista. Ler os tres formatos evita confundir "formato
/// diferente" com "produto nao existe".
export function extractProduct(payload) {
  const candidato = Array.isArray(payload)
    ? payload[0]
    : (payload && typeof payload === 'object' && payload.data !== undefined ? payload.data : payload);
  const produto = Array.isArray(candidato) ? candidato[0] : candidato;
  return produto && typeof produto === 'object' && produto.id !== undefined ? produto : null;
}

/// Adaptador do cadastro de produtos do ZWeb.
///
/// E o mesmo par de chamadas que a extensao ja faz com sucesso no navegador:
/// le o produto inteiro, troca so o codigo de barras e devolve o objeto
/// completo. O ZWeb substitui o cadastro pelo que recebe, entao mandar um
/// objeto parcial apagaria os demais campos.
///
/// A gravacao so e dada como boa depois de reler do ZWeb: resposta 200 nao e
/// prova de que o campo entrou.
export function createZwebProductBarcodeAdapter(client) {
  async function lerProduto(productId) {
    const resposta = await client.rpc('inventory.get-product', { id: Number(productId) });
    const produto = extractProduct(resposta);
    if (!produto) throw new Error(`Produto ${productId} nao foi encontrado no ZWeb.`);
    return produto;
  }

  return {
    async writeBarcode({ productId, productCode, barcode }) {
      if (!client) throw new FormatoNaoConfirmadoError('Cliente do ZWeb nao configurado no servico.');
      if (!productId) throw new Error(`Produto ${productCode} esta sem o id do ZWeb no catalogo.`);

      const produto = await lerProduto(productId);
      const anterior = String(produto.barCode || '').trim();
      if (anterior === String(barcode).trim()) return { jaEstava: true, anterior };

      produto.barCode = String(barcode).trim();
      await client.rpc('inventory.put-product', produto);

      const conferido = await lerProduto(productId);
      if (String(conferido.barCode || '').trim() !== String(barcode).trim()) {
        throw new Error(`O ZWeb aceitou a gravacao mas o codigo de barras do produto ${productCode} continua diferente.`);
      }
      return { jaEstava: false, anterior };
    },
    get client() {
      return client;
    }
  };
}

function proximaTentativa(agora) {
  return new Date(agora.getTime() + ESPERA_APOS_FALHA_MS).toISOString();
}

/// Percorre a fila de pendentes e grava uma por vez.
///
/// Devolve o resumo da execucao em vez de lancar: quem chama e a rota do
/// coletor, e o estoquista nao pode ficar preso a um erro do ZWeb — a
/// associacao dele ja foi guardada e ja chegou no Clipp.
export async function applyPendingBarcodeRequests({
  store,
  adapter,
  permitido,
  registrar = () => {},
  agora = () => new Date(),
  limitePorExecucao = LIMITE_PADRAO
}) {
  const inicio = agora();
  const limite = Math.max(1, Math.min(50, Number(limitePorExecucao) || LIMITE_PADRAO));

  if (typeof permitido !== 'function' || !permitido()) {
    const resumo = {
      bloqueado: true,
      aplicados: 0,
      falhas: 0,
      pendentes: 0,
      motivo: 'Operacao bloqueada ate a homologacao explicita.'
    };
    registrar({ ...resumo, em: inicio.toISOString() });
    return resumo;
  }

  if (bloqueadoAte && inicio.getTime() < bloqueadoAte) {
    const resumo = {
      bloqueado: false,
      emEspera: true,
      aplicados: 0,
      falhas: 0,
      pendentes: 0,
      motivo: 'Fila em espera apos falha anterior.',
      tentarEm: new Date(bloqueadoAte).toISOString()
    };
    registrar({ ...resumo, em: inicio.toISOString() });
    return resumo;
  }

  const pendentes = store.getPendingBarcodeRequests(limite);
  if (!pendentes.length) {
    const resumo = { bloqueado: false, aplicados: 0, falhas: 0, pendentes: 0 };
    registrar({ ...resumo, em: inicio.toISOString() });
    return resumo;
  }

  let aplicados = 0;
  let falhas = 0;
  let motivo = null;
  let tentarEm = null;
  // O que aconteceu com cada pedido, para o log e para quem acompanha a
  // execucao poder conferir o antes e o depois sem abrir o ZWeb.
  const detalhes = [];

  // Uma por vez, e a primeira falha encerra: se o ZWeb esta recusando, insistir
  // no restante da fila so multiplica requisicao contra uma conta que ja pode
  // estar sob restricao.
  for (const pedido of pendentes) {
    try {
      const escrita = await adapter.writeBarcode({
        productId: pedido.productId,
        productCode: pedido.productCode,
        barcode: pedido.barcode,
        previousBarcode: pedido.previousBarcode
      });
      store.markBarcodeRequest(pedido.requestId, 'zweb', { status: 'applied' });
      bloqueadoAte = null;
      aplicados += 1;
      detalhes.push({
        requestId: pedido.requestId,
        productCode: pedido.productCode,
        barcode: pedido.barcode,
        anterior: (escrita && escrita.anterior) || null,
        jaEstava: !!(escrita && escrita.jaEstava)
      });
    } catch (error) {
      falhas += 1;
      motivo = error.message;
      tentarEm = proximaTentativa(agora());
      bloqueadoAte = new Date(tentarEm).getTime();
      store.markBarcodeRequest(pedido.requestId, 'zweb', { status: 'pending', error: error.message });
      detalhes.push({
        requestId: pedido.requestId,
        productCode: pedido.productCode,
        barcode: pedido.barcode,
        erro: error.message,
        // O que o ZWeb respondeu, para o motivo nao morrer como "HTTP 200".
        resposta: error.details ?? null
      });
      break;
    }
  }

  const resumo = {
    bloqueado: false,
    aplicados,
    falhas,
    pendentes: Math.max(0, pendentes.length - aplicados),
    motivo,
    tentarEm,
    detalhes
  };
  registrar({ ...resumo, em: inicio.toISOString(), lidos: pendentes.length });
  return resumo;
}
