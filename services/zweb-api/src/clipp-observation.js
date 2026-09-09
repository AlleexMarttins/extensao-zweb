// Monta a observacao do Clipp com o enderecamento na frente.
//
// O Clipp nao tem campo de endereco, entao o endereco vive na primeira linha
// da observacao do produto. O risco obvio e empilhar um bloco novo a cada
// enderecamento; por isso aqui nada e concatenado antes de remover o bloco
// anterior. A remocao usa tres criterios, do mais preciso ao mais tolerante,
// porque a observacao pode ter sido editada dentro do Clipp no meio do caminho.

// O padrao das etiquetas da loja. Serve de rede quando nao sabemos qual era o
// endereco anterior, por exemplo em um produto endereçado por outro caminho.
const PADRAO_ENDERECO = /^RUA\s+\d+\s+NIVEL\s+\d+\s+PRAT\s+(?:DIR|ESQ)$/i;

function normalizarQuebras(valor) {
  return String(valor ?? '').replace(/\r\n?/g, '\n');
}

function removerLinhasVaziasIniciais(linhas) {
  while (linhas.length && !linhas[0].trim()) linhas.shift();
  return linhas;
}

/// Devolve so o que e observacao de verdade, sem o bloco de endereco.
export function extractUserObservation(currentObservation, previousLocation) {
  const texto = normalizarQuebras(currentObservation);
  if (!texto.trim()) return '';

  const linhas = texto.split('\n');
  const primeira = linhas[0].trim();
  const anterior = String(previousLocation ?? '').trim();

  // 1) A primeira linha e exatamente o que gravamos da ultima vez.
  // 2) A primeira linha tem a cara de um endereco da loja.
  if ((anterior && primeira === anterior) || PADRAO_ENDERECO.test(primeira)) {
    return removerLinhasVaziasIniciais(linhas.slice(1)).join('\n').replace(/\s+$/, '');
  }

  // 3) Alguem escreveu acima do nosso bloco: o endereco anterior continua no
  // meio do texto, e precisa sair para nao sobrar duplicado.
  if (anterior) {
    const indice = linhas.findIndex(linha => linha.trim() === anterior);
    if (indice >= 0) {
      const restante = linhas.slice(0, indice).concat(removerLinhasVaziasIniciais(linhas.slice(indice + 1)));
      return restante.join('\n').replace(/\s+$/, '').replace(/^\n+/, '');
    }
  }

  return texto.replace(/\s+$/, '');
}

/// Texto final da observacao: endereco, linha em branco, observacao do usuario.
export function composeObservation({ location, currentObservation, previousLocation }) {
  const endereco = String(location ?? '').trim();
  if (!endereco) throw Object.assign(new Error('Enderecamento obrigatorio.'), { status: 400 });
  const observacao = extractUserObservation(currentObservation, previousLocation);
  return observacao ? `${endereco}\n\n${observacao}` : endereco;
}
