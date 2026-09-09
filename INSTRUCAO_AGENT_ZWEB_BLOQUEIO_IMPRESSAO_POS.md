# Instrução para Agent da Sessão Zweb

## Objetivo

Corrigir a extensão **Assistente Zweb** para impedir que o fluxo manual do Zweb imprima a NFC-e/DANFCE na maquininha POS quando o pagamento usa **SmartPOS integrado ao ZPOS**.

O pagamento na maquininha deve continuar funcionando normalmente. O bloqueio é somente da impressão fiscal enviada para o POS.

## Contexto operacional

- O problema ocorre no **Zweb manual**, não no Debot.
- O Debot deve ser ignorado nesta tarefa.
- A extensão usada nas máquinas vem de:
  - `\\192.168.1.240\eh\extension`
- O código local da extensão fica em:
  - `D:\zweb_html\extension`
- A máquina 29 carrega a extensão a partir de:
  - `\\192.168.1.240\eh\extension`
- A extensão aparece no Chrome do 29 com path de extensão carregada apontando para esse compartilhamento.
- Cupom de teste manual que ainda imprimiu na maquininha: `105053`.

## O que já foi tentado e não resolveu

### 1. Regra declarativeNetRequest

Foi adicionada regra para bloquear:

- `POST http://127.0.0.1:3330/api/zpos/send-pdfbase64-to-server`
- `POST http://localhost:3330/api/zpos/send-pdfbase64-to-server`

Arquivo criado:

- `extension/nucleo/block-zpos-fiscal-print-rules.json`

Manifest alterado com:

- Permissão `declarativeNetRequest`
- Host permissions para `http://127.0.0.1:3330/*` e `http://localhost:3330/*`
- `declarative_net_request.rule_resources`

### 2. Bloqueio no `page-bridge.js`

Foi adicionada interceptação em `extension/nucleo/page-bridge.js` para bloquear chamadas locais ZPOS via `fetch` e `XMLHttpRequest`, incluindo:

- `/api/zpos/send-pdfbase64-to-server`
- `/api/zpos/send-xmlbase64-to-server`
- `/api/v2/send-event-to-server` quando o corpo contém indícios de impressão fiscal como `SEND_PRINT_TO_SERVER`, `pdfBase64`, `xmlBase64` ou `danfce`.

Mesmo assim, o teste manual ainda imprimiu a NFC-e/DANFCE na maquininha.

## Hipóteses mais prováveis

1. A impressão fiscal no POS não está passando pelo `fetch`/XHR da página do Zweb.
2. A impressão pode estar sendo disparada por outro endpoint, WebSocket, iframe, worker, extensão interna do ZPOS ou app local.
3. O endpoint real pode ser diferente dos caminhos bloqueados.
4. A extensão pode estar injetando tarde demais ou em contexto errado para esse fluxo específico.
5. O Zweb pode acionar a impressão no POS a partir da resposta do pagamento, não por chamada explícita separada no navegador.

## Tarefa

Investigar no projeto `D:\zweb_html` a extensão existente e implementar a correção no lugar correto para o fluxo manual do Zweb.

A correção deve:

1. Impedir a impressão da NFC-e/DANFCE na maquininha POS no uso manual do Zweb com ZPOS integrado.
2. Não impedir a cobrança/pagamento via ZPOS.
3. Não quebrar impressão normal na impressora fiscal/cupom local.
4. Não alterar Debot/assistente NFC-e.
5. Atualizar a fonte central em `\\192.168.1.240\eh\extension` somente após validar a alteração local.
6. Criar backup da pasta central antes de copiar alterações.

## Como investigar

Prioridade alta:

- Instrumentar a extensão para descobrir o endpoint/evento real usado no clique manual do Zweb.
- Verificar `page-bridge.js`, `background.js`, `content.js`, `features.js` e qualquer ponte já existente.
- Procurar por chamadas ZPOS/local:
  - `127.0.0.1:3330`
  - `localhost:3330`
  - `zpos`
  - `send-pdfbase64`
  - `send-xmlbase64`
  - `send-event`
  - `SEND_PRINT_TO_SERVER`
  - `print`
  - `danfce`
  - `pdfBase64`
  - `xmlBase64`
  - `websocket`
  - `Worker`
  - `serviceWorker`
- Se necessário, adicionar logging temporário/controlado no console ou storage da extensão para listar chamadas ao ZPOS durante o fluxo manual.

## Critério de aceite

Depois da alteração:

- Ao emitir manualmente no Zweb com ZPOS integrado, a maquininha deve cobrar normalmente.
- A maquininha não deve imprimir a NFC-e/DANFCE fiscal.
- A impressora normal de cupom deve continuar imprimindo o cupom fiscal.
- A extensão deve continuar funcionando para os demais recursos existentes.

## Arquivos prováveis

- `D:\zweb_html\extension\manifest.json`
- `D:\zweb_html\extension\nucleo\page-bridge.js`
- `D:\zweb_html\extension\nucleo\background.js`
- `D:\zweb_html\extension\nucleo\content.js`
- `D:\zweb_html\extension\nucleo\features.js`
- `D:\zweb_html\extension\nucleo\block-zpos-fiscal-print-rules.json`

## Observação importante

Não fazer alterações no Debot nem em `D:\assistente_nfce` para resolver este problema. O problema confirmado é no manejo manual do Zweb.
