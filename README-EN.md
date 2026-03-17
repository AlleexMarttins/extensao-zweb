# Admin Zweb

Repository for the `Assistente Zweb` browser extension, focused on administrative, fiscal, product, and document workflows inside Zweb.

## What the extension does

- blocks sensitive Zweb actions through the `Proteção` feature
- applies global visual customization across Zweb
- filters the `Filtrar` modal based on active columns
- supports compound terms in the native product filter
- adds a dedicated product code range filter
- adds preferred supplier replication in bulk product updates
- highlights low stock products
- adds DAV workflow automations
- extends `#` item search to DAV and NF-e item forms
- downloads NF-e XML files automatically
- adds batch XML/PDF download actions in NF-e
- customizes the NF-e `Ações` menu
- adds the `Assistente de Nota` flow for FSIST and the official NF-e portal
- adds the `Cálculo de Valores` section under `Fiscal > Configurações > Notas fiscais`
- calculates suggested values inside the purchase import popup
- simulates product price updates from the inline pencil in the purchase popup
- adjusts commission reports based on NF-e returns

## Extension menu

The popup groups automations and lets the user enable or disable each feature independently.

Current groups:

- `Geral`: Proteção, Personalização Visual
- `Produtos`: Filtro, Filtro Composto, Filtro de Códigos, Fornecedor Preferencial, Estoque Mínimo
- `DAV`: Lote
- `Fiscal`: Busca com #, Baixar XML, Downloads em Lote, Cálculo de Valores, Cálculo em Compras, Simular Preço, Assistente de Nota, Personalizar Ações
- `Documentos`: Ajustar Comissões

## Installation

1. Open `chrome://extensions/` or `edge://extensions/`.
2. Enable `Developer mode`.
3. Click `Load unpacked`.
4. Select the `extension/` folder.

## Extension scope

Current host permissions:

- `https://zweb.com.br/*`
- `https://api.zweb.com.br/*`
- `https://compufour.s3.amazonaws.com/production/uploads/nfe/*`
- `https://compufour.s3.amazonaws.com/production/uploads/reports/report/*`
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

## Notes

- Local Playwright artifacts and QA screenshots are ignored by `.gitignore`.
- The browser-visible extension name remains `Assistente Zweb`.
