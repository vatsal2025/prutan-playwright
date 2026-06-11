import { _electron as electron, type ElectronApplication, type Page } from 'playwright';
import * as path from 'path';
import * as os from 'os';
import * as fs from 'fs';

function getAppRoot(): string {
  return process.env['NEVUP_APP_ROOT'] ?? path.resolve(__dirname, '../../../NevUp Desk/app');
}

function getDistMain(): string {
  return path.join(getAppRoot(), 'dist', 'main', 'main.js');
}

function getElectronBin(): string {
  const ext = process.platform === 'win32' ? 'electron.exe' : 'electron';
  return path.join(getAppRoot(), 'node_modules', 'electron', 'dist', ext);
}

/**
 * Returns true if the NevUp compiled binary exists.
 * Used to skip tests gracefully when the app hasn't been built yet.
 */
export function isNevUpBuilt(): boolean {
  return fs.existsSync(getDistMain()) && fs.existsSync(getElectronBin());
}

export interface LaunchOptions {
  mockBroker?: boolean;
  mockOpenai?: boolean;
  mockCloud?: boolean;
}

/**
 * Launch the built NevUp Electron app with an isolated user-data-dir.
 * Throws if the app binary isn't found — check isNevUpBuilt() first.
 */
export async function launchApp(opts: LaunchOptions = {}): Promise<{
  app: ElectronApplication;
  page: Page;
  userDataDir: string;
}> {
  const distMain = getDistMain();
  const electronBin = getElectronBin();

  if (!fs.existsSync(distMain) || !fs.existsSync(electronBin)) {
    throw new Error(
      `NevUp binary not found. Run: cd "${getAppRoot()}" && npm run build\n` +
      `Looked for: ${distMain}`,
    );
  }

  const userDataDir = fs.mkdtempSync(path.join(os.tmpdir(), 'nevup-e2e-'));

  const env = {
    ...process.env,
    DEV_MOCK_BROKER: String(opts.mockBroker ?? true),
    DEV_MOCK_OPENAI: String(opts.mockOpenai ?? true),
    DEV_MOCK_CLOUD: String(opts.mockCloud ?? true),
    NEVUP_E2E: 'true',
  };

  const app = await electron.launch({
    executablePath: electronBin,
    args: [
      '--no-sandbox',
      '--disable-gpu',
      '--disable-software-rasterizer',
      '--disable-dev-shm-usage',
      '--disable-gpu-sandbox',
      `--user-data-dir=${userDataDir}`,
      distMain,
    ],
    env,
    cwd: getAppRoot(),
  });

  const page = await app.firstWindow();
  await page.waitForLoadState('domcontentloaded');

  await page.evaluate(() => {
    localStorage.setItem('nevup-test-bypass-auth', 'true');
  });

  return { app, page, userDataDir };
}

export async function closeApp(app: ElectronApplication, userDataDir?: string): Promise<void> {
  try {
    await app.close();
  } catch {
    // already closed
  }
  if (userDataDir) {
    try { fs.rmSync(userDataDir, { recursive: true, force: true }); } catch { /* ok */ }
  }
}

export async function waitForElement(page: Page, selector: string, timeout = 8000): Promise<void> {
  await page.waitForSelector(selector, { state: 'visible', timeout });
}

export async function isOnboardingShown(page: Page): Promise<boolean> {
  return page.locator('text=Welcome to NevUp').isVisible().catch(() => false);
}
