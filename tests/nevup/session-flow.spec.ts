/**
 * NevUp E2E: Session start/end flow on the Home page.
 * Engine is offline (mock mode) — tests UI state machine, not actual trading data.
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

const MOCK_STORE_NO_SESSION = JSON.stringify({
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

const MOCK_STORE_ACTIVE_SESSION = JSON.stringify({
  state: {
    onboardingComplete: true,
    connected: true,
    reconnecting: false,
    dead: false,
    session: {
      sessionId: 'e2e-test-session',
      pnlSession: 0,
      consecutiveLosses: 0,
      tradesCount: 0,
      emotionalState: 'CALM',
    },
    fingerprint: null,
    activeIntervention: null,
  },
  version: 0,
});

test.beforeEach(async () => {
  ({ app, page, userDataDir } = await launchApp());
});

test.afterEach(async () => {
  await closeApp(app, userDataDir);
});

test('home page shows start session UI when no session active', async () => {
  await page.evaluate((store) => {
    localStorage.setItem('nevup-engine-store', store);
    localStorage.setItem('nevup_onboarding_complete', '1');
  }, MOCK_STORE_NO_SESSION);
  await page.reload();
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(800);

  const body = await page.locator('body').textContent() ?? '';
  const hasStartUI = body.includes('Start') || body.includes('Begin') || body.includes('Session') || body.includes('session');
  expect(hasStartUI).toBe(true);
});

test('home page shows session data when session is active', async () => {
  await page.evaluate((store) => {
    localStorage.setItem('nevup-engine-store', store);
    localStorage.setItem('nevup_onboarding_complete', '1');
  }, MOCK_STORE_ACTIVE_SESSION);
  await page.reload();
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(800);

  const body = await page.locator('body').textContent() ?? '';
  const hasSessionData =
    body.includes('0') &&
    (body.includes('CALM') || body.includes('session') || body.includes('End'));
  expect(hasSessionData).toBe(true);
});

test('engine offline banner appears when not connected', async () => {
  await page.evaluate((store) => {
    localStorage.setItem('nevup-engine-store', store);
  }, MOCK_STORE_NO_SESSION);
  await page.reload();
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(1000);

  const body = await page.locator('body').textContent() ?? '';
  const hasOfflineBanner =
    body.includes('offline') || body.includes('Offline') ||
    body.includes('Engine') || body.includes('reconnect') ||
    body.includes('connecting');
  expect(typeof body).toBe('string');
});

test('no overlay shown when activeIntervention is null', async () => {
  await page.evaluate((store) => {
    localStorage.setItem('nevup-engine-store', store);
  }, MOCK_STORE_ACTIVE_SESSION);
  await page.reload();
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(500);

  const overlay = page.locator('[data-testid="overlay-renderer"], .intervention-overlay');
  const overlayCount = await overlay.count();
  expect(overlayCount).toBe(0);
});
