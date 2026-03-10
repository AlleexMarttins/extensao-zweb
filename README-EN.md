# Admin Zweb

Repository for the `Assistente Zweb` browser extension, focused on administrative and fiscal workflows inside Zweb.

## What the extension does

- blocks sensitive Zweb actions through the `Protecao` feature
- filters the `Filtrar` modal based on active columns
- adds DAV workflow automations
- downloads NF-e XML files automatically
- customizes the NF-e `Acoes` menu
- adds the `Assistente de Nota` flow for FSIST and the official NF-e portal
- adds the `Calculo de Valores` section under `Fiscal > Configuracoes > Notas fiscais`
- calculates suggested values inside the purchase import popup
- simulates product price updates from the inline pencil in the purchase popup

## Extension menu

The popup groups automations and lets the user enable or disable each feature independently.

Current groups:

- `Geral`: Protecao
- `Produtos`: Filtro, Botao Novo
- `DAV`: Busca com #, Lote
- `Fiscal`: Baixar XML, Calculo de Valores, Calculo em Compras, Simular Preco, Assistente de Nota, Personalizar Acoes

## Installation

1. Open `chrome://extensions/` or `edge://extensions/`.
2. Enable `Developer mode`.
3. Click `Load unpacked`.
4. Select the [extension](/c:/Users/vendas/Desktop/zweb_html/extension) folder.

## Extension scope

Current host permissions:

- `https://zweb.com.br/*`
- `https://compufour.s3.amazonaws.com/production/uploads/nfe/*`
- `https://www.fsist.com.br/*`
- `https://fsist.com.br/*`
- `https://www.nfe.fazenda.gov.br/*`
- `https://nfe.fazenda.gov.br/*`

## Local tooling

The repository includes Playwright helpers for live QA against a logged-in browser session.

Main commands:

```powershell
npm run playwright:verify
npm run playwright:session:start
npm run playwright:qa:live
npm run playwright:session:stop
```

## Structure

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

## Notes

- Local Playwright artifacts and QA screenshots are ignored by `.gitignore`.
- The browser-visible extension name remains `Assistente Zweb`.
