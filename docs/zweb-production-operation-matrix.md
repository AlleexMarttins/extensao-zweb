# Matriz de operações do ZWeb

Este documento separa as funções locais da extensão das operações que conversam com o ZWeb. Nenhuma operação listada abaixo pode ser reativada somente alterando uma preferência do usuário. A liberação exige uma versão homologada e a chave específica da operação.

## Regras que valem para todas

1. Desenvolvimento usa somente fixtures anonimizadas, mock ou replay local.
2. O ambiente de desenvolvimento não recebe credenciais, tokens ou perfis do ZWeb e bloqueia saída para os domínios do ZWeb.
3. Cada execução tem uma única fila serial, espaçamento entre requisições, timeout, teto de páginas ou itens e cursor incremental quando houver leitura paginada.
4. Falha interrompe a execução. A próxima tentativa automática nunca ocorre em segundos: começa em uma hora e pode aumentar até vinte e quatro horas.
5. Homologação real só acontece com autorização explícita, uma origem por vez, logs com horário, quantidade processada, cursor e próxima tentativa.
6. Em produção, a liberação é manual e isolada por operação. Uma operação liberada não libera as demais.

## Inventário e estado inicial

| Operação | Tipo | Estado | Condição para cobertura e homologação |
|---|---|---|---|
| Consulta de categorias de referência | Leitura | Bloqueada | Cache local, invalidação, uma consulta serial e fixture de retorno. |
| Consulta de pessoa, cliente ou fornecedor | Leitura | Bloqueada | Busca pontual, limite de resultados, fixture de vazio e erro. As chaves são `personLookup`, `supplierLookup` e `recipientsRead`. |
| Consulta de caixa e documentos para painel | Leitura | Bloqueada | Limite de 20 detalhes, uma consulta por vez e intervalo mínimo de um segundo. Chave `pdvCashCounterRead`. |
| Fechamento automático de estoque negativo | Escrita | Bloqueada | Confirmação de transição, proprietário, cancelamento, idempotência e dupla confirmação. |
| Consulta de faixa de produtos | Leitura | Bloqueada | Paginação serial, intervalo mínimo de um segundo, teto de 20 páginas e cancelamento pelo usuário. Chave `productRangeRead`. |
| Consulta em lote de produtos | Leitura | Bloqueada | Paginação serial, intervalo mínimo de um segundo, teto de 20 páginas e sem `Promise.all` de páginas. Chave `productBulkRead`. |
| Alteração de fornecedor preferencial | Escrita | Bloqueada | Leitura, alteração e confirmação de um produto por vez. |
| Leitura de NF-e, NFC-e, XML e DANFE | Leitura | Bloqueada | Limite por execução, uma NF por vez e controle de download. Chave `fiscalDocumentRead`. |
| Transmissão de NF-e | Escrita fiscal | Bloqueada | Ação manual, confirmação visual, uma NF por execução e consulta final do status. Chave `fiscalTransmission`. |
| Cancelamento, clonagem e clonagem com cancelamento | Escrita fiscal | Bloqueada | Ação manual, validação de estado, trilha de auditoria e confirmação final. Chaves `fiscalCancellation`, `fiscalDocumentWrite` e `davClone`. |
| Devoluções do relatório de comissões | Leitura | Bloqueada | Máximo de 20 páginas, uma fila serial, intervalo mínimo de um segundo e atraso mínimo de uma hora após falha. Chave `commissionReturnsRefresh`. |
| Migração de observações para endereçamento | Leitura e escrita | Bloqueada | Execução administrativa única, checkpoint, uma alteração por vez e relatório de auditoria. |
| Gravação de código de barras vinda do coletor | Escrita | Bloqueada | Disparada pela associação feita no celular, nunca por timer nem por tela do PC. Uma gravação por vez, teto de dez por execução, parada na primeira falha e próxima tentativa em uma hora. Chave `productBarcodeWrite`. Usa o mesmo par RPC que a extensão já usa (`inventory.get-product` e `inventory.put-product`), envia o cadastro inteiro e só dá a gravação por boa depois de reler do ZWeb. Exige um usuário do ZWeb dedicado ao coletor em `ZWEB_USERNAME` e `ZWEB_PASSWORD`. |

## Funções que continuam locais

O campo de endereçamento consulta apenas o banco interno. A tela, as etiquetas de local e o armazenamento local não chamam o ZWeb. Funções puramente visuais também podem continuar ativas, desde que não acionem requisições autenticadas.

## Ordem proposta de cobertura

1. Consultas simples e pontuais, começando por categorias de referência.
2. Consultas de pessoa e cliente, ainda sem escrita.
3. Relatórios e devoluções, com cursor e espaçamento de uma hora.
4. Consultas de produto, uma página por vez.
5. Operações administrativas de escrita em produto.
6. Operações fiscais, uma NF por ação manual.
7. Migração de endereçamento, somente após uma homologação administrativa específica.
