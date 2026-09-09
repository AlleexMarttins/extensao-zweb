# Relatorio de Contexto para Proximo Agent

Data: 2026-06-25  
Workspace principal: `D:\zweb_html`  
Workspace adicional: `D:\pdfReader`

## 1. Objetivo deste relatorio

Este arquivo resume o estado atual do trabalho no ambiente Zweb, incluindo:

- o que foi implementado na extensao;
- como a extensao funciona hoje;
- ferramentas usadas para desenvolver e validar;
- arquivos relevantes;
- credenciais e onde localiza-las;
- o que ja foi copiado para `\\192.168.1.240\eh\extension`;
- riscos, pendencias e cuidados para a proxima sessao.

O foco principal recente foi o fluxo de `Clonar` em `DAV`, `NF-e` e `NFC-e`, alem de varias automacoes auxiliares ja existentes no arquivo principal da extensao.

---

## 2. Estrutura principal

### Pasta da extensao

- `D:\zweb_html\extension`

### Arquivos centrais

- `D:\zweb_html\extension\nucleo\content.js`
- `D:\zweb_html\extension\nucleo\features.js`
- `D:\zweb_html\extension\ui\popup.html`
- `D:\zweb_html\extension\ui\popup.js`
- `D:\zweb_html\extension\manifest.json`

### Pasta publicada para os outros computadores

- `\\192.168.1.240\eh\extension`

No momento da ultima atualizacao, a versao local foi sincronizada para `\\192.168.1.240\eh\extension`.

---

## 3. Ferramentas e forma de trabalho usadas

### Edicao de arquivos

- toda edicao manual foi feita com `apply_patch`
- validacao sintatica com:
  - `node --check extension\nucleo\content.js`
  - `node --check extension\nucleo\features.js`
- validacao de diff com:
  - `git diff --check`

### Busca e leitura

- busca textual com `rg`
- leitura de trechos grandes com `Get-Content ... | Select-Object -Skip ... -First ...`

### Testes reais no navegador

Foi usado Playwright conectado ao Chrome/Chromium com porta remota `9222`.

Arquivos/suporte:

- `D:\zweb_html\tools\playwright\start-session.cjs`
- `D:\zweb_html\tools\playwright\stop-session.ps1`
- perfil persistente:
  - `D:\zweb_html\.codex-playwright-profile`
- sessao:
  - `D:\zweb_html\.codex-playwright-session.json`

Forma de conexao usada:

- `chromium.connectOverCDP('http://127.0.0.1:9222')`

### Deploy para rede

Foi usado:

- `robocopy D:\zweb_html\extension \\192.168.1.240\eh\extension /MIR ...`

---

## 4. Credenciais e acessos conhecidos

### Credenciais de teste Zweb

Arquivo:

- `D:\zweb_html\credentials-zweb.txt`

Conteudo conhecido:

- login: `vendasmva10@gmail.com`
- senha: `Mva@2026`

### Conta de vendedor usada para validacao de permissao sem Fiscal

Informada pelo usuario na conversa:

- login: `vendasmva09@gmail.com`
- senha: `Vendas@2026`

### Observacao importante

Algumas contas entram primeiro em:

- `#/companies-menu`

E exigem escolha de empresa. Em teste real, a conta de vendedor foi validada na empresa:

- `Eletrônica Horizonte`

---

## 5. Estado do git e save-point

Foi criado anteriormente um save-point local:

- commit: `bc0b460`
- mensagem: `Savepoint: stabilize DAV clone cancel flow`

Observacao:

- o workspace esta sujo e contem varios arquivos auxiliares, imagens e logs em `tools/`
- nao assumir que tudo que aparece em `git status` faz parte da entrega
- evitar limpar arquivos sem confirmar

---

## 6. Resumo do que existe hoje na extensao

O arquivo `content.js` concentra muitas automacoes, nao apenas as ultimas.

Entre os blocos relevantes conhecidos:

- protecao de campos sensiveis por senha de administrador
- liberacao controlada de campos de custo/quantidade
- liberacao de CNPJ em cliente
- coluna de codigo em listas de DAV/itens
- destaque de estoque minimo
- timer para desligar estoque liberado
- melhorias em NF-e/NFC-e
- consulta de motivo de cancelamento da NFC-e
- contador de dinheiro no PDV
- fluxo assistido de clone/cancelamento

O arquivo `features.js` e o catalogo de toggles do popup da extensao.

---

## 7. Fluxo assistido de Clonar em DAV

### Objetivo

Quando o usuario clona um DAV e quer corrigir um cupom ja emitido, a extensao pode:

1. localizar a NFC-e do mesmo valor;
2. perguntar se deseja cancelar o cupom original;
3. exigir um motivo;
4. clonar o DAV por API;
5. cancelar a NFC-e por API;
6. levar o usuario de volta ao PDV.

### Arquivo principal

- `D:\zweb_html\extension\nucleo\content.js`

### Funcoes principais do fluxo

Proximo agent deve procurar especialmente por:

- `findFiscalCloneDavNfceByApi`
- `buildFiscalCloneDavFlow`
- `getFiscalCloneDavSaleIdFromRow`
- `findFiscalCloneDavSaleIdBySequence`
- `cloneFiscalCloneDavByApi`
- `cancelFiscalCloneDavNfceByApi`
- `startFiscalCloneDavCancelFlow`
- `startFiscalCloneDavApiCancelAndRedirect`
- `handleFiscalCloneConfirm`
- `findFiscalCloneActionTrigger`

### APIs usadas

- `https://api.zweb.com.br/rpc/v2/fiscal.get-nfe-paginate`
- `https://api.zweb.com.br/rpc/v1/fiscal.cancel-nfe`
- `https://api.zweb.com.br/rpc/v2/inventory.get-sale-paginate`
- `https://api.zweb.com.br/rpc/v2/inventory.get-detailed-sale`
- `https://api.zweb.com.br/rpc/v1/inventory.post-credit-limit`
- `https://api.zweb.com.br/rpc/v2/inventory.post-sale`

### Regras importantes

- motivo obrigatorio
- minimo de 15 caracteres
- `Sim` fica bloqueado com motivo curto
- NFC-e so pode ser cancelada automaticamente se estiver `Autorizada`
- o clone novo deve nascer em estado reutilizavel, equivalente a `Editando`

### Correcao importante feita

Antes a extensao parecia depender de o DAV aparecer como `Exportado` visualmente. Isso foi reduzido com:

- extracao de `saleId` direto da linha/DOM quando possivel
- cache em sessao
- fallback por busca paginada com retry

Resultado validado:

- foi possivel executar o fluxo mesmo com DAV ainda exibido como `Editando`

### Evidencia de teste real ja feita

Exemplo validado:

- DAV original: `9196`
- NFC-e localizada: `105996`
- motivo usado: `Cupom de testeee`
- clone criado: `9203`
- retorno ao PDV funcionando

---

## 8. Diferenciacao por permissao no DAV

Foi implementada logica para contas sem acesso ao menu `Fiscal`.

### Regra atual

Se a conta estiver em `Documentos > DAV's` e:

- nao existir acesso visivel ao menu `Fiscal`

entao:

- a extensao NAO intercepta `Clonar pedido`
- o clone segue nativo do Zweb

Se a conta tiver `Fiscal`:

- o fluxo assistido continua disponivel

### Base da deteccao

Hoje a deteccao e simples e pratica:

- procura menu/entrada visivel de `Fiscal`
- em rotas fiscais a permissao e assumida como presente

### Validacao real ja feita

Conta vendedor:

- `vendasmva09@gmail.com`
- sem `Fiscal` no topo
- `Clonar pedido` abriu o clone nativo
- sem modal assistido

Conta com fiscal:

- `vendasmva10@gmail.com`
- com `Fiscal` no topo
- modal assistido apareceu normalmente

---

## 9. Separacao de comportamento entre NF-e e NFC-e

Foi implementada separacao por tela para o `Clonar`.

### Catalogo de features atual

No `features.js` foram adicionadas chaves independentes:

- `nfeCloneAssistEnabled`
- `nfeCloneBlockEnabled`
- `nfceCloneAssistEnabled`
- `nfceCloneBlockEnabled`

### Prioridade de comportamento

Para cada tela fiscal:

1. se `...CloneBlockEnabled` estiver ligado:
   - bloqueia o Clonar
2. se o bloqueio estiver desligado e `...CloneAssistEnabled` estiver ligado:
   - usa fluxo assistido
3. se os dois estiverem desligados:
   - comportamento nativo

### Estado padrao atual

Pelo fallback em `content.js` e pelo catalogo em `features.js`, o estado padrao relevante ficou:

- `nfeCloneAssistEnabled = true`
- `nfeCloneBlockEnabled = false`
- `nfceCloneAssistEnabled = true`
- `nfceCloneBlockEnabled = true`

Ou seja:

- `NF-e` vem padrao em modo assistido
- `NFC-e` vem padrao em modo bloqueado

### Observacao importante

Mesmo com `nfceCloneAssistEnabled = true`, o bloqueio do NFC-e vence por prioridade porque:

- `nfceCloneBlockEnabled = true`

---

## 10. Consulta de motivo de cancelamento na NFC-e

Foi adicionada uma opcao de:

- `Consultar motivo de cancelamento`

### Regras

- aparece apenas em NFC-e com status `Cancelada`
- foi removido o botao duplicado do topo; a opcao deve aparecer apenas no menu `Ações` e no clique direito

Trechos para localizar:

- `NFCE_CANCEL_REASON_ACTION_ID`
- `runNfceCancellationReasonLookup`
- `ensureNfceCancellationReasonActions`

---

## 11. Contador de dinheiro no PDV

Existe implementacao visual no PDV para:

- dinheiro acumulado no caixa
- quantidade de vendas em dinheiro
- lista de NFC-e em dinheiro ao dar duplo clique

Ha historico de bug com stack overflow e atualizacao incorreta. O proximo agent deve revisar com cuidado antes de mexer nessa parte.

Pontos de busca:

- `PDV_CASH_COUNTER_*`
- `applyPdvCashCounterApiState`
- sincronizacao por API e por tela do PDV

---

## 12. Popup de configuracao da extensao

### Arquivos

- `D:\zweb_html\extension\ui\popup.html`
- `D:\zweb_html\extension\ui\popup.js`
- `D:\zweb_html\extension\nucleo\features.js`

### Como funciona

- `features.js` define o catalogo
- `popup.js` renderiza automaticamente os toggles
- `content.js` usa `isFeatureEnabled(key)`

### Consequencia pratica

Ao adicionar nova feature:

1. declarar em `features.js`
2. garantir fallback em `content.js` se necessario
3. recarregar a extensao no navegador para o popup refletir o catalogo novo

---

## 13. Publicacao para o 240

Foi solicitado varias vezes parar de tratar o workspace local como fonte final e publicar no:

- `\\192.168.1.240\eh\extension`

Na ultima etapa conhecida, a versao local foi sincronizada para essa pasta com:

- `robocopy ... /MIR`

Importante:

- assumir que outros computadores podem consumir essa pasta
- qualquer alteracao local relevante pode precisar de nova sincronizacao

---

## 14. Documento auxiliar no MVAApp

Foi criado um documento para outro agente adaptar essa logica para o ClippStore:

- `D:\MVAApp\ZWEB_CLIPPSTORE_ADAPTACAO_FLUXO_CLONAR_CANCELAR.md`
- copia em:
  - `D:\MVAApp\_analysis\ZWEB_CLIPPSTORE_ADAPTACAO_FLUXO_CLONAR_CANCELAR.md`

Esse documento explica o fluxo de clone/cancelamento, permissao por perfil e adaptacao para o ClippStore.

---

## 15. Arquivos de apoio e ruido no workspace

Ha muitos arquivos gerados durante depuracao, especialmente em:

- `D:\zweb_html\tools\`
- `D:\zweb_html\log.txt`
- `D:\zweb_html\error.txt`

Esses arquivos incluem:

- screenshots
- dumps json
- logs de teste
- residuos de validacao

Nao assumir que eles representam o estado atual final da extensao.

Muitos sao historicos de tentativas antigas.

---

## 16. Conhecimento minimo necessario para continuar

O proximo agent deve dominar:

- JavaScript no contexto de extensao Chrome
- Playwright com CDP
- leitura de DOM dinamico
- consumo de API autenticada da Zweb via token de `localStorage`
- cuidado com ambiente de producao
- diferenciacao entre:
  - fluxo nativo
  - fluxo assistido
  - fluxo bloqueado

Tambem precisa entender que varias rotinas nao se baseiam apenas em clique visual:

- parte delas usa API direta
- parte ainda depende de DOM/menus/estado visual

---

## 17. Cuidados operacionais

1. O sistema e de producao.
2. O usuario explicitamente pediu para evitar acao indevida.
3. Sempre validar se o teste altera dado real.
4. Em automacoes fiscais, confirmar status antes de cancelar.
5. Se for testar fluxo de clone/cancelamento, usar valores e documentos controlados.
6. Nao apagar logs/arquivos do usuario sem pedir.
7. Nao usar `git reset --hard` ou rollback destrutivo.

---

## 18. Checklist rapido para o proximo agent

Se precisar continuar o trabalho, seguir esta ordem:

1. Ler:
   - `extension\nucleo\content.js`
   - `extension\nucleo\features.js`
   - este relatorio
2. Confirmar no popup se as features novas aparecem:
   - `Clonar NF-e`
   - `Bloquear Clonar NF-e`
   - `Clonar NFC-e`
   - `Bloquear Clonar NFC-e`
3. Confirmar qual versao esta instalada no Chrome atual.
4. Se necessario, reiniciar sessao Playwright.
5. Testar com:
   - conta com Fiscal
   - conta sem Fiscal
6. Se alterar a extensao e precisar publicar:
   - sincronizar para `\\192.168.1.240\eh\extension`

---

## 19. Estado atual resumido

No momento deste relatorio:

- DAV:
  - conta com Fiscal: fluxo assistido pode rodar
  - conta sem Fiscal: clone nativo
- NF-e:
  - assistido por padrao
  - bloqueio disponivel por toggle
- NFC-e:
  - bloqueado por padrao
  - assistido disponivel por toggle
- extensao local:
  - atualizada
- `\\192.168.1.240\eh\extension`:
  - sincronizado com a versao local mais recente no fim da ultima etapa conhecida

