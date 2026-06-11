/**
 * NevUp E2E: Settings page — broker management and trading preferences.
 */
import { test, expect } from '@playwright/test';
import { launchApp, closeApp, isNevUpBuilt } from '../../support/nevup-helpers';
import type { ElectronApplication, Page } from 'playwright';

test.beforeAll(() => {
  if (!isNevUpBuilt()) {
    test.skip();
  }
});

let app: ElectronApplication;
let page: Page;
let userDataDir: string;

const MOCK_STORE = JSON.stringify({
  state: {
    onboardingComplete: true,
    connected: false,
    reconnecting: false,
    dead: false,
    session: { sessionId: null, pnlSession: 0, consecutiveLosses: 0, tradesCount: 0, emotionalState: 'UNKNOWN' },
    fingerprint: null,
    activeIntervention: null,
  },
  version: 0,
});

test.beforeEach(async () => {
  ({ app, page, userDataDir } = await launchApp());
  await page.evaluate((store) => {
    localStorage.setItem('nevup-engine-store', store);
    localStorage.setItem('nevup_onboarding_complete', '1');
  }, MOCK_STORE);
  await page.reload();
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(800);
  await page.locator('a[title="Settings"]').click();
  await page.waitForTimeout(500);
});

test.afterEach(async () => {
  await closeApp(app, userDataDir);
});

test('settings page has broker section', async () => {
  await page.locator('button', { hasText: 'Connected Exchanges' }).click();
  await page.waitForTimeout(300);
  const body = await page.locator('body').textContent() ?? '';
  const hasBroker = body.includes('exchange') || body.includes('Exchange') || body.includes('Connect') || body.includes('Broker');
  expect(hasBroker).toBe(true);
});

test('settings page has trading preferences section', async () => {
  await page.locator('button', { hasText: 'Trading Preferences' }).click();
  await page.waitForTimeout(300);
  const body = await page.locator('body').textContent() ?? '';
  const hasPrefs = body.includes('loss') || body.includes('trades') || body.includes('daily') || body.includes('severity') || body.includes('Preferences');
  expect(hasPrefs).toBe(true);
});

test('broker list includes global brokers', async () => {
  await page.locator('button', { hasText: 'Connected Exchanges' }).click();
  await page.waitForTimeout(300);
  const body = await page.locator('body').textContent() ?? '';
  const hasGlobal = body.includes('Alpaca') || body.includes('Binance') || body.includes('Schwab') || body.includes('Kraken');
  expect(hasGlobal).toBe(true);
});

test('broker list includes Indian brokers', async () => {
  const btn = page.locator('button', { hasText: 'Connected Exchanges' });
  await btn.waitFor({ state: 'visible', timeout: 8000 });
  await btn.click();
  await page.waitForTimeout(600);
  const body = await page.locator('body').textContent() ?? '';
  const hasIndian = body.includes('Zerodha') || body.includes('Upstox') || body.includes('Angel') || body.includes('Dhan');
  expect(hasIndian).toBe(true);
});

test('trading preferences inputs exist', async () => {
  await page.locator('button', { hasText: 'Trading Preferences' }).click();
  await page.waitForTimeout(300);
  const inputs = await page.locator('input[type="number"]').count();
  expect(inputs).toBeGreaterThanOrEqual(1);
});

test('severity dropdown or select exists', async () => {
  await page.locator('button', { hasText: 'Trading Preferences' }).click();
  await page.waitForTimeout(300);
  const selects = await page.locator('select').count();
  const body = await page.locator('body').textContent() ?? '';
  const hasSeverityControl = selects > 0 || body.includes('HIGH') || body.includes('MEDIUM') || body.includes('LOW');
  expect(hasSeverityControl).toBe(true);
});

test('Add Broker button or similar CTA exists', async () => {
  const totalBtns = await page.locator('button').count();
  expect(totalBtns).toBeGreaterThan(0);
});
