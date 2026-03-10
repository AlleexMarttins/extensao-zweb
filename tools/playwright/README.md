# Playwright Tools

These scripts support live QA against the Zweb extension workspace.

## Scripts

- `start-session.cjs`: starts a persistent Chromium session with the unpacked extension loaded.
- `stop-session.ps1`: stops the persistent Chromium session by writing the stop signal file.
- `run-live-qa.cjs`: runs the live QA matrix against the logged-in Zweb session.

## Recommended commands

From the workspace root:

```powershell
npm run playwright:verify
npm run playwright:session:start
npm run playwright:qa:live
npm run playwright:session:stop
```

## Notes

- The browser profile and session files are created in the workspace root as temporary local artifacts.
- Those artifacts are ignored by `.gitignore`.
- The extension itself still lives under `extension/`.
