# Ferramentas Playwright do Admin Zweb

Esses scripts dão suporte ao QA manual e à inspeção ao vivo no workspace do `Assistente Zweb`.

## Scripts

- `start-session.cjs`: inicia uma sessão persistente do Chromium com a extensão unpacked carregada.
- `stop-session.ps1`: encerra a sessão persistente do Chromium.
- `run-live-qa.cjs`: executa a matriz de QA ao vivo sobre uma sessão já logada.

## Comandos

Na raiz do workspace:

```powershell
npm run playwright:verify
npm run playwright:session:start
npm run playwright:qa:live
npm run playwright:session:stop
```

## Fluxo recomendado

1. Rode `npm run playwright:verify` para confirmar que o Playwright está disponível.
2. Rode `npm run playwright:session:start` para abrir o Chromium persistente com a extensão.
3. Faça login na Zweb.
4. Execute QA manual ou use os scripts auxiliares.
5. Finalize com `npm run playwright:session:stop`.

## Observações

- O perfil do navegador e os arquivos de sessão são criados na raiz do workspace como artefatos locais temporários.
- Esses artefatos são ignorados pelo `.gitignore`.
- O runtime da extensão continua dentro de `extension/`.
