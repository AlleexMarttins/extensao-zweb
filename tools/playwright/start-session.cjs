const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const workspaceRoot = path.resolve(__dirname, '..', '..');
const extensionPath = path.join(workspaceRoot, 'extension');
const profilePath = path.join(workspaceRoot, '.codex-playwright-profile');
const sessionPath = path.join(workspaceRoot, '.codex-playwright-session.json');
const stopPath = path.join(workspaceRoot, '.codex-playwright-stop');
const debugPort = 9222;

async function waitForExtensionId(context) {
  let [worker] = context.serviceWorkers();
  if (!worker) {
    try {
      worker = await context.waitForEvent('serviceworker', { timeout: 15000 });
    } catch (error) {
      return null;
    }
  }
  return new URL(worker.url()).host;
}

async function main() {
  fs.mkdirSync(profilePath, { recursive: true });
  fs.rmSync(stopPath, { force: true });

  const context = await chromium.launchPersistentContext(profilePath, {
    headless: false,
    args: [
      `--disable-extensions-except=${extensionPath}`,
      `--load-extension=${extensionPath}`,
      `--remote-debugging-port=${debugPort}`
    ]
  });

  const browser = context.browser();
  const extensionId = await waitForExtensionId(context);
  const page = context.pages()[0] || await context.newPage();
  await page.goto('https://zweb.com.br/', { waitUntil: 'domcontentloaded' });

  const session = {
    startedAt: new Date().toISOString(),
    debugPort,
    extensionId,
    profilePath,
    browserPid: browser && browser.process ? browser.process().pid : null
  };

  fs.writeFileSync(sessionPath, JSON.stringify(session, null, 2));
  console.log(JSON.stringify(session, null, 2));

  const shutdown = async () => {
    clearInterval(interval);
    try {
      await context.close();
    } catch (error) {
      console.error(error);
    }
    fs.rmSync(stopPath, { force: true });
    process.exit(0);
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
  context.on('close', () => {
    fs.rmSync(stopPath, { force: true });
    process.exit(0);
  });

  const interval = setInterval(() => {
    if (fs.existsSync(stopPath)) {
      shutdown();
    }
  }, 1000);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
