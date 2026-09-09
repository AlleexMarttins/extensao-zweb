# Coletor de endereçamento por código de barras

Este documento substitui o desenho original em `ARQUITETURA.md` e `QUICK_START.md`, que previa um backend novo (`zweb-barcode-backend`) gravando o campo `enderecamento` do produto pela API do ZWeb. O desenho foi adaptado para reaproveitar o que já está em produção na loja.

## O que mudou em relação ao desenho original

| Desenho original | Desenho adotado | Motivo |
|---|---|---|
| Backend novo em Node/Express na porta 3000 | Três rotas novas no serviço interno que já existe (`services/zweb-api`, porta 8788) | O serviço já tem o banco de endereçamentos, a auditoria, o controle de acesso e o cache. Um backend paralelo duplicaria tudo isso e criaria uma segunda fonte de verdade. |
| App envia usuário e senha do ZWeb a cada requisição | App envia uma chave de aparelho (`X-Zweb-Device-Key`) | Nenhuma senha de operador trafega ou fica guardada no celular. Uma chave perdida é revogada sozinha, sem trocar a senha de ninguém. |
| Backend grava o campo `enderecamento` via `inventory.put-product` | Serviço grava na tabela `product_locations` do banco interno | O endereçamento não vive no ZWeb. A extensão já migrou esse dado do campo `observation` para o banco interno e limpa o campo no ZWeb. Gravar de volta brigaria com essa migração. |
| Backend autentica no ZWeb e guarda o token em memória | O coletor não fala com o ZWeb em momento nenhum | Quem tem sessão autenticada do ZWeb é a extensão, no navegador. O coletor precisa apenas do catálogo de produtos, que a extensão alimenta. |

## Componentes

```
┌──────────────────────┐        ┌───────────────────────────┐
│  App Flutter         │        │  Extensão no navegador    │
│  (coletor)           │        │  (estações da loja)       │
└──────────┬───────────┘        └─────────────┬─────────────┘
           │                                  │
           │ X-Zweb-Device-Key                │ X-Zweb-Service-Key
           │ /api/mobile/*                    │ /api/zweb/product-*
           v                                  v
     ┌─────────────────────────────────────────────────┐
     │  services/zweb-api  (rede interna, porta 8788)  │
     │                                                 │
     │  product_catalog        ← alimentado pela       │
     │                           extensão              │
     │  product_locations      ← endereçamento atual   │
     │  product_location_audit ← quem mudou, e quando  │
     └─────────────────────────────────────────────────┘
                              ^
                              │ sessão autenticada do navegador
                              │ (inventory.get-product-paginate)
                     ┌────────┴─────────┐
                     │  API do ZWeb     │
                     └──────────────────┘
```

O coletor nunca alcança a API do ZWeb, e o serviço interno nunca precisa da senha de um operador para endereçar um produto.

## Fluxo de uso

1. **Sincronização do catálogo.** Quando alguém abre a lista de produtos no ZWeb, a extensão pagina os produtos com a sessão do navegador e envia código, descrição e código de barras para `PUT /api/zweb/product-catalog`. Isso já acontecia durante a migração das observações; agora os mesmos dados também alimentam o catálogo. Fora da migração, a extensão só refaz a varredura se o catálogo estiver com mais de 12 horas, o que evita que várias estações paginem o cadastro ao mesmo tempo.

2. **Abertura do coletor.** O app chama `POST /api/mobile/session` com a chave do aparelho e recebe o nome do coletor e a idade do catálogo. Não há tela de usuário e senha.

3. **Leitura dos itens.** A cada código lido, o app chama `POST /api/mobile/scan/resolve` e mostra a descrição do produto e o endereço atual, se já houver. Um código fora do catálogo aparece na hora como não encontrado, antes de o estoquista terminar o lote.

4. **Leitura do endereço e envio.** O estoquista lê o código do local e envia. O app chama `POST /api/mobile/locations/assign` com os itens e o local; o serviço grava cada item e devolve o resultado individual. O nome do aparelho vira o responsável na trilha de auditoria.

5. **Retorno para a operação.** A extensão passa a mostrar o endereço na lista de produtos e no cadastro, pelas rotas de endereçamento que já usava. Nada muda no fluxo de quem trabalha no navegador.

## Contratos

### `POST /api/mobile/session`

Cabeçalho `X-Zweb-Device-Key`. Sem corpo.

```json
{ "success": true, "device": "Coletor Estoque 1", "catalog": { "items": 4821, "updatedAt": "..." }, "serverTime": "..." }
```

### `POST /api/mobile/scan/resolve`

```json
{ "itemCodes": ["2000", "7891234567890"] }
```

```json
{ "items": [
  { "scannedCode": "2000", "found": true, "productId": 171, "productCode": "2000",
    "productDescription": "CABO PP 3X2,5", "currentLocation": "A-01" },
  { "scannedCode": "7891234567890", "found": false }
] }
```

### `POST /api/mobile/locations/assign`

```json
{ "locationCode": "Rua 2 Nivel 5 Prateleira Esquerda", "itemCodes": ["2000", "2001"] }
```

```json
{
  "success": true,
  "summary": { "totalItems": 2, "successCount": 2, "notFoundCount": 0, "errorCount": 0,
               "locationCode": "Rua 2 Nivel 5 Prateleira Esquerda" },
  "results": [
    { "scannedCode": "2000", "status": "success", "productId": 171,
      "location": "Rua 2 Nivel 5 Prateleira Esquerda", "revision": 2,
      "message": "Endereco 'Rua 2 Nivel 5 Prateleira Esquerda' atribuido com sucesso." }
  ]
}
```

Um lote com itens fora do catálogo continua sendo gravado para os itens encontrados: o retorno é sucesso parcial, com `status` `not_found` nos demais. É o mesmo comportamento previsto no desenho original.

## Decisões de implementação

**Resolução do código lido.** O catálogo indexa código do produto e código de barras, ambos guardados também em uma forma normalizada sem zeros à esquerda. Leitores que emitem EAN-13 a partir de um código de 12 dígitos continuam encontrando o produto.

**Código de barras opcional.** A extensão procura o código de barras no produto do ZWeb entre os nomes de campo mais prováveis (`barCode`, `barcode`, `codigoBarras`, `codigoDeBarras`, `ean`, `gtin`) e envia vazio se nenhum existir. Validado em 13/08/2026 contra o cadastro real da loja: dos 21.287 produtos sincronizados, os que têm EAN cadastrado vieram com o código preenchido, e os demais continuam resolvendo pelo código interno do produto.

**Produto recém-editado.** Ao sair do cadastro de um produto no ZWeb, a extensão envia aquele item sozinho para o catálogo. O gatilho é a saída da tela, e não a abertura, porque só nesse momento um código de barras recém-digitado já foi salvo — enviar na abertura gravaria o valor antigo. Assim o produto fica disponível para leitura no coletor em seguida, sem esperar a varredura periódica. Se a aba for fechada sem sair da tela do produto, o envio não acontece e o item entra na próxima varredura.

**Varredura completa.** O catálogo só é considerado atualizado quando uma varredura inteira termina — o serviço registra `completedAt` apenas no fim, e é esse campo que segura a próxima sincronização por 12 horas. Uma varredura interrompida no meio deixa `completedAt` nulo, então a próxima estação que abrir a lista de produtos recomeça em vez de esperar. Usar a idade do último lote para isso esconderia uma varredura parcial atrás de um catálogo aparentemente recente.

**Sobrescrita de endereço.** Endereçar de novo um produto que já tem local grava a nova revisão e registra `updated` na auditoria, preservando o local anterior. O coletor mostra o endereço atual antes do envio, então a troca é sempre uma escolha visível para quem está no corredor.

**Limites.** Cada lote aceita no máximo 200 códigos por leitura e 250 produtos por sincronização de catálogo, os mesmos limites já usados pela importação de observações.

## Segurança

- A chave de aparelho só abre `/api/mobile/*`. Ela não dá acesso às rotas internas da extensão, e a chave do serviço não substitui a identificação do aparelho no coletor — as duas restrições têm teste automatizado.
- Chaves com menos de 16 caracteres são recusadas na inicialização, com aviso no console.
- O serviço continua ouvindo apenas no endereço interno configurado em `ZWEB_BIND_HOST`. O coletor precisa estar na rede da loja; não há exposição para a internet.
- Nenhuma senha de operador é transmitida, guardada ou registrada em log.

## Verificação

```bash
node --test services/zweb-api/test/*.test.js
```

Cobre a sincronização do catálogo, a resolução de código com zeros à esquerda, a atribuição em lote com sucesso parcial, a trilha de auditoria e as quatro fronteiras de autorização entre chave de serviço e chave de aparelho.
