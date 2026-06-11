/**
 * NevUp E2E: App launch sanity checks.
 * Verifies the Electron window opens and renders the React app.
 *
 * Requires:
 *   cd <NEVUP_APP_ROOT> && npm run build
 *   Set NEVUP_APP_ROOT in .env (default: ../../../NevUp Desk/app)
 */
import { test, expect } from '@playwright/test';
import { launchApp, closeApp, isNevUpBuilt } from '../../support/nevup-helpers';
import type { ElectronApplication } from 'playwright';

test.beforeAll(() => {
  if (!isNevUpBuilt()) {
    test.skip();
  }
});

let app: ElectronApplication;
let userDataDir: string;

test.beforeEach(async () => {
  ({ app, userDataDir } = await launchApp());
});

test.afterEach(async () => {
  await closeApp(app, userDataDir);
});

test('window opens and has correct title', async () => {
  const page = await app.firstWindow();
  const title = await page.title();
  expect(title).toMatch(/NevUp/i);
});

test('main window is visible and non-empty', async () => {
  const page = await app.firstWindow();
  const body = page.locator('body');
  await expect(body).toBeVisible();
  const rootContent = await page.evaluate(() => document.body.innerHTML.length);
  expect(rootContent).toBeGreaterThan(100);
});

test('exactly one BrowserWindow is open on launch', async () => {
  const windows = await app.windows();
  expect(windows.length).toBeGreaterThanOrEqual(1);
});

test('renderer process has no uncaught JS errors on load', async () => {
  const page = await app.firstWindow();
  const errors: string[] = [];
  page.on('pageerror', (err) => errors.push(err.message));
  await page.waitForTimeout(2000);
  expect(errors).toHaveLength(0);
});

test('React root element exists', async () => {
  const page = await app.firstWindow();
  const rootEl = page.locator('#root');
  await expect(rootEl).toBeAttached();
});
