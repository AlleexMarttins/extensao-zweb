# Admin Zweb

Extensão `Assistente Zweb` para automações administrativas, fiscais, de produtos e de documentos dentro da Zweb.

## Visão geral

O projeto concentra ajustes de fluxo e interface que a Zweb não entrega nativamente, com foco em:

- proteção de ações sensíveis
- produtividade em produtos, DAV, compras e NF-e
- apoio operacional em relatórios e documentos
- QA local com Playwright em sessão logada

## Funcionalidades atuais

### Geral

- `Proteção`: bloqueia botões, campos e ações sensíveis da Zweb.
- `Personalização Visual`: aplica fonte, tamanho e cores personalizadas em toda a Zweb, exceto no login.

### Produtos

- `Filtro`: no modal `Filtrar`, mostra apenas colunas ativas.
- `Filtro Composto`: permite usar múltiplos termos no mesmo filtro, como `LAMP 12V`.
- `Filtro de Códigos`: adiciona um filtro por faixa de códigos na lista de produtos.
- `Fornecedor Preferencial`: adiciona a opção de replicar fornecedor preferencial em `Ações > Replicar alterações`.
- `Estoque Mínimo`: destaca em vermelho produtos cuja quantidade esteja menor ou igual à quantidade mínima.

### DAV

- `Lote`: adiciona o botão `Lote` para inserir vários itens.
- `Busca com #`: normaliza a busca por código no DAV.
- quantidade padrão com substituição inteligente do `1` inicial
- bloqueio de casas decimais indevidas na quantidade do DAV

### Fiscal

- `Busca com #`: também funciona em `Fiscal > NF-e > Itens`.
- `Baixar XML`: baixa automaticamente o XML gerado na NF-e.
- `Downloads em Lote`: adiciona ações para baixar XML e DANFE em lote na tela de NF-e.
- `Personalizar Ações`: filtra opções do menu `Ações` da NF-e.
- `Boleto Venda à Vista`: ao tentar gerar boleto em NF-e com natureza `Venda à Vista`, mostra um aviso e exige confirmação antes de continuar.
- `Cálculo de Valores`: cria a área de parâmetros em `Fiscal > Configurações > Notas fiscais`.
- `Cálculo em Compras`: aplica os parâmetros no popup de importação de XML em compras.
- `Simular Preço`: usa o lápis do produto no popup de importação para preencher o preço sem salvar.
- `Assistente de Nota`: detecta chave de acesso na Zweb e continua o fluxo no FSIST e no Portal NF-e.

### Documentos

- `Ajustar Comissões`: usa o histórico de devoluções da NF-e para inverter valores no relatório HTML de comissões.
- `Conferir Devoluções`: antes de gerar o relatório de comissões, pergunta se as devoluções já foram conferidas; se a resposta for `Não`, redireciona para `Fiscal > NF-e`.
- exportação do relatório ajustado para PDF

## Como instalar

1. Abra `chrome://extensions/` ou `edge://extensions/`.
2. Ative `Modo do desenvolvedor`.
3. Clique em `Carregar sem compactação`.
4. Selecione a pasta `extension/`.

## Como usar

1. Abra a Zweb normalmente.
2. Clique no popup da extensão `Assistente Zweb`.
3. Ative ou desative as automações por grupo.
4. Recarregue a aba quando a própria feature pedir isso.

### Fluxos principais

- `Produtos > Códigos`: filtra por faixa de códigos sem depender do filtro nativo.
- `Fiscal > NF-e`: usa `Baixar XML`, `Baixar DANFE`, `Personalizar Ações` e o aviso de `Boleto Venda à Vista`.
- `Fiscal > Configurações > Notas fiscais`: gerencia os parâmetros de `Cálculo de Valores`.
- `Fiscal > Compras`: usa o cálculo no popup de importação do XML.
- `Documentos > Relatórios > Comissões`: gere em HTML para aplicar o ajuste de devoluções e, depois, exporte o PDF ajustado.
- `Documentos > Relatórios > Comissões`: o botão `Gerar relatório` pode exigir a confirmação de que as devoluções já foram checadas.

## Menu da extensão

Os grupos atuais do popup são:

- `Geral`
- `Produtos`
- `DAV`
- `Fiscal`
- `Documentos`

Cada feature tem toggle próprio, com persistência em `chrome.storage.local`.

## Permissões e escopo

Hosts usados atualmente:

- `https://zweb.com.br/*`
- `https://api.zweb.com.br/*`
- `https://compufour.s3.amazonaws.com/production/uploads/nfe/*`
- `https://compufour.s3.amazonaws.com/production/uploads/reports/report/*`
- `https://www.fsist.com.br/*`
- `https://fsist.com.br/*`
- `https://www.nfe.fazenda.gov.br/*`
- `https://nfe.fazenda.gov.br/*`

Permissões principais:

- `storage`
- `tabs`
- `downloads`
- `debugger`
- `offscreen`
- `contextMenus`
- `scripting`

## QA local com Playwright

Comandos principais:

```powershell
npm run playwright:verify
npm run playwright:session:start
npm run playwright:qa:live
npm run playwright:session:stop
```

Uso recomendado:

1. Rode `npm run playwright:verify` para confirmar que o Playwright está disponível.
2. Rode `npm run playwright:session:start` para abrir o Chromium persistente com a extensão.
3. Faça login na Zweb.
4. Execute QA manual ou use os scripts auxiliares.
5. Finalize com `npm run playwright:session:stop`.

## Estrutura do projeto

```text
extension/
  manifest.json
  icons/
  nucleo/
    background.js
    content.js
    features.js
    offscreen-download.html
    offscreen-download.js
    page-bridge.js
  setores/
    fiscal/
      fiscal-value-settings.js
      purchase-value-sync.js
      report-adjustments.js
    notas/
      note-assistant.js
    produtos/
      stock-price-simulation.js
  ui/
    logs.css
    logs.html
    logs.js
    popup.html
    popup.js
    visual-settings.html
    visual-settings.js

tools/playwright/
  README.md
  run-live-qa.cjs
  start-session.cjs
  stop-session.ps1
```

## Observações

- Artefatos locais de Playwright, screenshots e credenciais auxiliares ficam fora do Git por `.gitignore`.
- O nome visível da extensão no navegador continua `Assistente Zweb`.
- O runtime principal da extensão está em `extension/`.
