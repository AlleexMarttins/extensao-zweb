# Serviço interno da API Zweb

Este serviço será a camada intermediária entre a extensão, futuros painéis e a API pública do Zweb. O `client_secret` fica somente no processo do servidor e é carregado por variáveis de ambiente.

## Configuração

Copie `.env.example` para o mecanismo de configuração usado no ambiente e preencha:

- `ZWEB_CLIENT_ID`
- `ZWEB_CLIENT_SECRET`
- `ZWEB_COMPANY_UUID`
- `ZWEB_BIND_HOST` com o endereço interno do servidor, como `192.168.1.240`
- `ZWEB_MOBILE_DEVICE_KEYS` com os coletores autorizados, no formato `Nome do aparelho:chave`, separados por vírgula

Não coloque esses valores no Git, na extensão ou em arquivos distribuídos aos usuários.

Por segurança, as saídas para a API do ZWeb ficam bloqueadas por padrão. Antes de uma homologação autorizada, não defina as variáveis abaixo. Para liberar uma operação específica, as duas são obrigatórias:

```powershell
$env:ZWEB_PRODUCTION_ZWEB_ENABLED = 'true'
$env:ZWEB_ALLOWED_OPERATIONS = 'referenceCategoryRefresh'
```

`ZWEB_ALLOWED_OPERATIONS` aceita uma lista separada por vírgulas, mas a liberação deve conter somente a operação homologada. O cliente também usa `ZWEB_MIN_REQUEST_INTERVAL_MS` (1.000 ms por padrão) e `ZWEB_REQUEST_TIMEOUT_MS` (12.000 ms por padrão). As requisições para o ZWeb passam por uma fila serial, portanto duas rotas diferentes não saem em paralelo.

Cada coletor recebe a própria chave, com no mínimo 16 caracteres. O nome do aparelho é o que fica registrado na auditoria de cada endereçamento, então use algo que identifique o equipamento na loja. Para revogar um coletor perdido, basta remover a entrada e reiniciar o serviço.

Gere uma chave assim:

```powershell
node -e "console.log(require('crypto').randomBytes(24).toString('base64url'))"
```

## Execução

```powershell
$env:ZWEB_CLIENT_ID = '...'
$env:ZWEB_CLIENT_SECRET = '...'
$env:ZWEB_COMPANY_UUID = '...'
node src/server.js
```

Rotas iniciais:

- `GET /health`
- `GET /api/zweb/categories`
- `GET /api/zweb/default-dav-recipient`
- `GET /api/zweb/payment-modes`
- `GET /api/zweb/recipients`
- `GET /api/zweb/sales-statuses`
- `GET /api/zweb/commission-returns`
- `PUT /api/zweb/commission-returns`
- `GET /api/zweb/metrics`
- `GET /api/zweb/products`
- `GET /api/zweb/products/{uuid}`

Rotas de endereçamento e do coletor de código de barras:

- `GET` e `PUT /api/zweb/product-locations/{productId}`
- `GET /api/zweb/product-locations/by-codes?productCodes=`
- `PUT /api/zweb/product-catalog` e `GET /api/zweb/product-catalog/status`
- `POST /api/mobile/session`
- `POST /api/mobile/scan/resolve`
- `POST /api/mobile/locations/assign`

As rotas `/api/mobile/*` são as únicas que aceitam a chave de aparelho (`X-Zweb-Device-Key`) e exigem essa chave mesmo quando a chave do serviço é enviada, para que a auditoria sempre registre qual coletor gravou o endereçamento. Todas as demais rotas continuam restritas à chave do serviço (`X-Zweb-Service-Key`).

O catálogo de produtos usado pelo coletor é alimentado pela extensão, que já pagina os produtos com a sessão autenticada do navegador. Ele guarda apenas código, descrição e código de barras, o suficiente para o coletor identificar o item lido antes de gravar o endereçamento.

As listas públicas usam cache por recurso: categorias por 30 minutos, formas de pagamento por 15 minutos, destinatários por 10 minutos e status de pedidos por 1 minuto. Quando vários computadores solicitam o mesmo recurso ao mesmo tempo, o serviço compartilha a mesma requisição em andamento e não abre várias chamadas simultâneas para a API pública.

A rota de categorias foi escolhida como primeiro adaptador porque respondeu com HTTP 200 na validação da integração. Produtos ficará fora da primeira migração até a correção do endpoint `/br/v1/stock/products`, que está retornando HTTP 500 no ambiente autorizado.
