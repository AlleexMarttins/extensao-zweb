# Documentacao de endpoints da extensao Assistente Zweb

Este documento descreve os endpoints e hosts acessados pela extensao Assistente Zweb, com a finalidade de cada uso, origem da chamada e condicoes de execucao.

A extensao roda no navegador do usuario autenticado na Zweb. Quando realiza chamadas para a API da Zweb, utiliza o token ja existente na sessao do proprio usuario, enviado no cabecalho `authorization-compufacil`. A extensao nao possui credencial propria, servidor intermediario ou rotina externa de processamento.

## Escopo de acesso

Hosts declarados no `manifest.json`:

| Host | Uso |
| --- | --- |
| `https://zweb.com.br/*` | Execucao principal da extensao dentro da aplicacao Zweb. |
| `https://api.zweb.com.br/*` | Chamadas RPC da propria Zweb usadas em fluxos manuais ou assistidos. |
| `https://compufour.s3.amazonaws.com/production/uploads/nfe/*` | Acesso a arquivos de NF-e, como XML e DANFE gerados pela Zweb. |
| `https://compufour.s3.amazonaws.com/production/uploads/reports/report/*` | Ajuste e exportacao de relatorios HTML de comissoes. |
| `https://www.fsist.com.br/*` e `https://fsist.com.br/*` | Apoio ao fluxo Assistente de Nota. |
| `https://www.nfe.fazenda.gov.br/*` e `https://nfe.fazenda.gov.br/*` | Apoio ao fluxo Assistente de Nota no portal oficial da NF-e. |

## Endpoints da API Zweb

### Produtos e estoque

| Endpoint | Metodo | Origem | Acionamento | Finalidade | Frequencia |
| --- | --- | --- | --- | --- | --- |
| `/rpc/v2/inventory.get-product-paginate` | `POST` | `content.js` | Manual | Consultar paginas de produtos para filtro por faixa de codigo, filtro composto e replicacao de fornecedor preferencial. | Somente durante a acao do usuario. Nao ha polling automatico. |
| `/rpc/v2/inventory.get-product` | `POST` | `content.js` | Manual | Carregar o cadastro detalhado de um produto antes de atualizar fornecedor preferencial. | Uma chamada por produto selecionado na acao de replicacao. |
| `/rpc/v2/inventory.put-product` | `POST` | `content.js` | Manual | Persistir fornecedor preferencial em produto selecionado. | Uma chamada por produto atualizado na acao de replicacao. |
| `/rpc/v2/person.get-person` | `POST` | `content.js` | Manual | Buscar fornecedores no seletor de fornecedor preferencial. | Disparado apos digitacao no seletor, com debounce curto. |
| `/rpc/v2/inventory.get-sale-paginate` | `POST` | `content.js` | Manual | Localizar DAVs e vendas em fluxos de clone/cancelamento assistido. | Somente durante fluxos acionados pelo usuario. |
| `/rpc/v2/inventory.get-detailed-sale` | `POST` | `content.js` | Manual | Carregar detalhes de DAV/venda antes de clonagem assistida. | Somente no fluxo de clonagem acionado pelo usuario. |
| `/rpc/v2/inventory.post-sale` | `POST` | `content.js` | Manual | Criar clone de DAV/venda em fluxo assistido. | Somente mediante acao do usuario. |
| `/rpc/v1/inventory.post-credit-limit` | `POST` | `content.js` | Manual ou durante venda | Replicar comportamento nativo da Zweb em fluxo de venda/cliente quando necessario. | Sem rotina periodica. |

### Fiscal, NF-e, NFC-e e PDV

| Endpoint | Metodo | Origem | Acionamento | Finalidade | Frequencia |
| --- | --- | --- | --- | --- | --- |
| `/rpc/v2/fiscal.get-nfe-paginate` | `POST` | `content.js` | Manual ou leitura de tela | Consultar listagem de NF-e para acoes assistidas, validacao de devolucoes e relatorio de comissoes. Ao confirmar a geracao do relatorio de comissoes, a extensao atualiza manualmente a foto de devolucoes de NF-e antes de liberar o botao nativo. | Sob demanda, somente por acao do usuario ou resposta da propria tela. |
| `/rpc/v2/fiscal.get-detailed-nfe` | `POST` | `content.js` | Manual | Obter dados completos da NF-e para clone, cancelamento assistido e transmissao. | Sob demanda. |
| `/rpc/v2/fiscal.post-nfe` | `POST` | `content.js` | Manual | Criar clone de NF-e em fluxo assistido. | Sob demanda. |
| `/rpc/v2/fiscal.put-nfe` | `POST` | `content.js` | Manual | Salvar payload normalizado da NF-e antes de transmissao assistida. | Sob demanda. |
| `/rpc/v2/fiscal.transmit-nfe` | `POST` | `content.js` | Manual | Transmitir NF-e por acao adicionada no menu da extensao. | Somente ao clicar em `Transmitir NF-e`. |
| `/rpc/v1/fiscal.cancel-nfe` | `POST` | `content.js` e captura em `page-bridge.js` | Manual | Cancelar NF-e no fluxo assistido de clonar e cancelar. | Somente ao acionar cancelamento. |
| `/rpc/v2/fiscal.get-danfe-url` | `POST` | `content.js` | Manual | Obter URL do DANFE para download em lote. | Sob demanda. |
| `/rpc/v2/fiscal.put-xml` | `POST` | `content.js` | Manual | Solicitar ou atualizar XML associado a NF-e quando necessario para download. | Sob demanda. |
| `/rpc/v2/fiscal.get-checkout-current-user` | `POST` | `content.js` | Fluxo de PDV | Identificar usuario de caixa atual para apoio operacional. | Sob demanda. |
| `/rpc/v2/fiscal.get-checkout-current-movimentation` | `POST` | `content.js` | Fluxo de PDV | Consultar movimentacao atual do caixa. | Sob demanda. |

### Configuracao de documentos e estoque zerado

| Endpoint | Metodo | Origem | Acionamento | Finalidade | Frequencia |
| --- | --- | --- | --- | --- | --- |
| `/rpc/v2/BFF.get-dashboard` | `POST` | `content.js` e `background.js` | Sincronizacao de estado | Ler configuracao atual do emissor, incluindo `isAllowedNegativeStock`. | Consulta de controle, sem acesso ao GRID de produtos. |
| `/rpc/v1/application.put-configuration` | `POST` | `content.js` e `background.js` | Manual ou automatico no navegador que abriu estoque | Persistir configuracao do emissor, principalmente fechamento do estoque zerado. | Somente no fechamento manual ou automatico do estoque. |

## Capturas de requisicao realizadas pela extensao

A extensao injeta `page-bridge.js` no contexto da pagina para observar algumas requisicoes feitas pela propria Zweb. Essa observacao serve para sincronizar interface e reaproveitar informacoes que ja trafegaram na sessao do usuario.

As capturas principais sao:

| Requisicao observada | Uso interno |
| --- | --- |
| `inventory.get-product-paginate` | Guardar o ultimo filtro e ordenacao usados pela grade nativa. Esse dado e usado apenas se o usuario acionar filtro composto, filtro por faixa ou replicacao de fornecedor. |
| `fiscal.cancel-nfe` | Detectar sucesso ou falha no cancelamento para continuar o fluxo assistido de clone apos cancelamento. |
| Configuracao com `isAllowedNegativeStock` | Sincronizar o estado do aviso de estoque zerado. |
| Transmissao de NFC-e no PDV | Sincronizar informacoes do fluxo de caixa/PDV. |

Essa captura nao cria uma nova requisicao. Ela apenas escuta chamadas ja iniciadas pela aplicacao Zweb ou por uma acao manual da extensao.

## Observacao especifica sobre o GRID de produtos

Foi revisado o codigo da extensao em busca de rotina que consulte ou ordene automaticamente o GRID de produtos.

Conclusao da revisao:

| Item verificado | Resultado |
| --- | --- |
| Timer de 5 minutos para produtos | Nao encontrado. |
| `setInterval` consultando `inventory.get-product-paginate` | Nao encontrado. |
| Reordenacao automatica do GRID de produtos | Nao encontrada. |
| Consulta automatica periodica do GRID de produtos | Nao encontrada. |
| Captura do payload da grade nativa | Existe, mas nao dispara consulta. |

As chamadas para `/rpc/v2/inventory.get-product-paginate` feitas pela extensao ocorrem somente em funcionalidades acionadas pelo usuario:

1. filtro por faixa de codigos;
2. filtro composto ou multiplo termo;
3. replicacao de fornecedor preferencial para produtos filtrados ou marcados;
4. validacoes pontuais em fluxos operacionais.

Nao ha rotina no codigo da extensao que consulte o GRID de produtos a cada 5 minutos ou em qualquer outro intervalo fixo.

## Frequencia e comportamento de execucao

| Categoria | Comportamento |
| --- | --- |
| Acoes manuais | Executadas somente apos clique, preenchimento ou confirmacao do usuario. |
| Observadores de tela | Usados para ajustar interface, botoes, modais e campos. Nao fazem chamadas de API por si so. |
| Heartbeat de estoque zerado | Controla popup e fechamento automatico apenas para o navegador que liberou o estoque. Usa endpoints de configuracao, nao endpoints de produto. |
| Downloads fiscais | Executados quando o usuario aciona download de XML, DANFE ou lote. |
| Relatorios | Executados quando o usuario gera ou ajusta relatorio. |

## Dados tratados

A extensao pode ler dados que ja estao disponiveis na sessao do usuario autenticado na Zweb, incluindo:

| Tipo de dado | Uso |
| --- | --- |
| Token da sessao Zweb | Autorizacao nas chamadas RPC feitas em nome do usuario logado. |
| Dados de produto | Filtros, validacoes e replicacao de fornecedor. |
| Dados fiscais de NF-e/NFC-e | Download, clone, cancelamento, transmissao e ajuste de relatorios. |
| Configuracao do emissor | Controle de estoque zerado. |
| Relatorios HTML | Ajuste local de relatorio de comissoes. |

Nao ha envio desses dados para servidor externo da extensao. As chamadas sao direcionadas aos proprios endpoints da Zweb ou aos hosts declarados no `manifest.json`.

## Arquivos principais relacionados aos endpoints

| Arquivo | Responsabilidade |
| --- | --- |
| `extension/nucleo/content.js` | Fluxos principais, chamadas RPC, controles de UI e automacoes operacionais. |
| `extension/nucleo/page-bridge.js` | Captura de requisicoes feitas pela pagina para sincronizacao com o content script. |
| `extension/nucleo/background.js` | Downloads, tarefas em background e fallback de fechamento de estoque zerado. |
| `extension/setores/fiscal/report-adjustments.js` | Ajustes em relatorios HTML de comissoes. |
| `extension/setores/notas/note-assistant.js` | Fluxo Assistente de Nota em FSIST e Portal NF-e. |

## Pontos de controle para auditoria

Para verificar se existe rotina automatica relacionada a produtos, os pontos principais sao:

1. procurar por `inventory.get-product-paginate`;
2. verificar chamadas a `fetchProductPaginateBatch`;
3. verificar chamadas a `fetchAllFilteredProducts`;
4. verificar timers `setInterval` e `setTimeout`;
5. confirmar se ha algum intervalo de `300000` ms ou `5 * 60 * 1000` associado a produtos.

Na revisao atual, nao foi identificado mecanismo de consulta automatica periodica ao GRID de produtos.
