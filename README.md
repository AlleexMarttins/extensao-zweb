# Admin Zweb

Repositório da extensão `Assistente Zweb` para automações administrativas e fiscais na Zweb.

## O que a extensão faz

- bloqueia ações sensíveis da Zweb por meio da feature `Proteção`
- filtra o modal `Filtrar` com base nas colunas ativas
- adiciona automações no fluxo de DAV
- baixa XML da NF-e automaticamente
- personaliza o menu `Ações` da NF-e
- adiciona o `Assistente de Nota` para fluxo com FSIST e Portal NF-e
- cria a área `Cálculo de Valores` em `Fiscal > Configurações > Notas fiscais`
- calcula valores sugeridos no popup de importação de compras
- permite simular preço do produto a partir do lápis do cadastro no popup da compra

## Menu da extensão

O popup da extensão organiza as automações por grupo e permite ativar ou desativar cada item individualmente.

Grupos atuais:

- `Geral`: Proteção
- `Produtos`: Filtro, Botão Novo
- `DAV`: Busca com #, Lote
- `Fiscal`: Baixar XML, Cálculo de Valores, Cálculo em Compras, Simular Preço, Assistente de Nota, Personalizar Ações

## Instalação

1. Abra `chrome://extensions/` ou `edge://extensions/`.
2. Ative `Modo do desenvolvedor`.
3. Clique em `Carregar sem compactação`.
4. Selecione a pasta [extension](/c:/Users/vendas/Desktop/zweb_html/extension).

## Escopo da extensão

Hosts usados atualmente:

- `https://zweb.com.br/*`
- `https://compufour.s3.amazonaws.com/production/uploads/nfe/*`
- `https://www.fsist.com.br/*`
- `https://fsist.com.br/*`
- `https://www.nfe.fazenda.gov.br/*`
- `https://nfe.fazenda.gov.br/*`

## Ferramentas locais

O projeto inclui suporte a Playwright para QA manual e validação em sessão logada.

Comandos principais:

```powershell
npm run playwright:verify
npm run playwright:session:start
npm run playwright:qa:live
npm run playwright:session:stop
```

## Estrutura

```text
extension/
  background.js
  content.js
  features.js
  fiscal-value-settings.js
  note-assistant.js
  page-bridge.js
  popup.html
  popup.js
  purchase-value-sync.js
  stock-price-simulation.js

tools/playwright/
  README.md
  run-live-qa.cjs
  start-session.cjs
  stop-session.ps1
```

## Observações

- Artefatos locais de Playwright e screenshots de QA ficam fora do git por `.gitignore`.
- O nome visível da extensão no navegador continua `Assistente Zweb`.
