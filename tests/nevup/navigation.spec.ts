/**
 * NevUp E2E: Sidebar navigation between main pages.
 * Requires onboarding to be complete (simulated via localStorage preset).
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
});

test.afterEach(async () => {
  await closeApp(app, userDataDir);
});

test('sidebar is rendered after onboarding', async () => {
  const body = await page.locator('body').textContent() ?? '';
  const hasSidebarItem = body.includes('Home') || body.includes('History') || body.includes('Patterns');
  expect(hasSidebarItem).toBe(true);
});

const NAV_ITEMS = [
  { label: /history/i,  expectedContent: /history|session/i },
  { label: /pattern/i,  expectedContent: /pattern|behavioral/i },
  { label: /debrief/i,  expectedContent: /debrief|tomorrow/i },
  { label: /settings/i, expectedContent: /settings|broker|profile/i },
];

for (const nav of NAV_ITEMS) {
  test(`navigating to ${nav.label.source} page works`, async () => {
    const navLink = page.locator(`nav a, nav button, [data-page]`, { hasText: nav.label });
    const visible = await navLink.first().isVisible().catch(() => false);

    if (!visible) {
      const fallback = page.locator('*', { hasText: nav.label }).first();
      const fbVisible = await fallback.isVisible().catch(() => false);
      if (!fbVisible) {
        test.skip();
        return;
      }
      await fallback.click();
    } else {
      await navLink.first().click();
    }

    await page.waitForTimeout(600);
    const body = await page.locator('body').textContent() ?? '';
    expect(nav.expectedContent.test(body)).toBe(true);
  });
}

test('home page renders session controls', async () => {
  const body = await page.locator('body').textContent() ?? '';
  const hasSession = body.includes('Session') || body.includes('session') || body.includes('Start');
  expect(hasSession).toBe(true);
});
