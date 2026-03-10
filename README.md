# Admin Zweb

Repositorio da extensao `Assistente Zweb` para automacoes administrativas e fiscais na Zweb.

## O que a extensao faz

- bloqueia acoes sensiveis da Zweb por meio da feature `Protecao`
- filtra o modal `Filtrar` com base nas colunas ativas
- adiciona automacoes no fluxo de DAV
- baixa XML da NF-e automaticamente
- personaliza o menu `Acoes` da NF-e
- adiciona o `Assistente de Nota` para fluxo com FSIST e Portal NF-e
- cria a area `Calculo de Valores` em `Fiscal > Configuracoes > Notas fiscais`
- calcula valores sugeridos no popup de importacao de compras
- permite simular preco do produto a partir do lapis do cadastro no popup da compra

## Menu da extensao

O popup da extensao organiza as automacoes por grupo e permite ativar ou desativar cada item individualmente.

Grupos atuais:

- `Geral`: Protecao
- `Produtos`: Filtro, Botao Novo
- `DAV`: Busca com #, Lote
- `Fiscal`: Baixar XML, Calculo de Valores, Calculo em Compras, Simular Preco, Assistente de Nota, Personalizar Acoes

## Instalacao

1. Abra `chrome://extensions/` ou `edge://extensions/`.
2. Ative `Modo do desenvolvedor`.
3. Clique em `Carregar sem compactacao`.
4. Selecione a pasta [extension](/c:/Users/vendas/Desktop/zweb_html/extension).

## Escopo da extensao

Hosts usados atualmente:

- `https://zweb.com.br/*`
- `https://compufour.s3.amazonaws.com/production/uploads/nfe/*`
- `https://www.fsist.com.br/*`
- `https://fsist.com.br/*`
- `https://www.nfe.fazenda.gov.br/*`
- `https://nfe.fazenda.gov.br/*`

## Ferramentas locais

O projeto inclui suporte a Playwright para QA manual e validacao em sessao logada.

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

## Observacoes

- Artefatos locais de Playwright e screenshots de QA ficam fora do git por `.gitignore`.
- O nome visivel da extensao no navegador continua `Assistente Zweb`.
