# Ferramentas Playwright do Admin Zweb

Estes scripts dão suporte ao QA ao vivo no workspace do `Assistente Zweb`.

## Scripts

- `start-session.cjs`: inicia uma sessão persistente do Chromium com a extensão unpacked carregada.
- `stop-session.ps1`: encerra a sessão persistente do Chromium gravando o arquivo de parada.
- `run-live-qa.cjs`: executa a matriz de QA ao vivo na sessão logada da Zweb.

## Comandos recomendados

Na raiz do workspace:

```powershell
npm run playwright:verify
npm run playwright:session:start
npm run playwright:qa:live
npm run playwright:session:stop
```

## Observações

- O perfil do navegador e os arquivos de sessão são criados na raiz do workspace como artefatos locais temporários.
- Esses artefatos são ignorados pelo `.gitignore`.
- O runtime da extensão continua dentro de `extension/`.
