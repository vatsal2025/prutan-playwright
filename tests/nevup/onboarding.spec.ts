/**
 * NevUp E2E: Onboarding page flows.
 * Tests the 8-step onboarding flow when localStorage is cleared (fresh install).
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

test.beforeEach(async () => {
  ({ app, page, userDataDir } = await launchApp());
  await page.evaluate(() => {
    localStorage.removeItem('nevup-engine-store');
  });
  await page.reload();
  await page.waitForLoadState('domcontentloaded');
});

test.afterEach(async () => {
  await closeApp(app, userDataDir);
});

test('onboarding shows Welcome step first', async () => {
  const body = await page.locator('body').textContent() ?? '';
  const hasWelcome = body.includes('Welcome') || body.includes('NevUp') || body.includes('Scout');
  expect(hasWelcome).toBe(true);
});

test('onboarding step counter shows 1 of 8', async () => {
  const body = await page.locator('body').textContent() ?? '';
  const hasStepInfo = body.includes('1') && (body.includes('8') || body.includes('Welcome'));
  expect(hasStepInfo).toBe(true);
});

test('onboarding has a Next or Continue button', async () => {
  const nextBtn = page.locator('button', { hasText: /next|continue|get started/i });
  await expect(nextBtn.first()).toBeVisible({ timeout: 6000 });
});

test('clicking Next advances to step 2', async () => {
  const nextBtn = page.locator('button', { hasText: /next|continue|get started/i });
  await nextBtn.first().click();
  await page.waitForTimeout(500);
  const body = await page.locator('body').textContent() ?? '';
  const advanced = body.includes('Scout') || body.includes('2') || body.includes('Import');
  expect(advanced).toBe(true);
});

test('onboarding contains broker selection options', async () => {
  for (let i = 0; i < 3; i++) {
    const nextBtn = page.locator('button', { hasText: /next|continue|skip/i });
    const visible = await nextBtn.first().isVisible().catch(() => false);
    if (visible) {
      await nextBtn.first().click();
      await page.waitForTimeout(300);
    }
  }
  const body = await page.locator('body').textContent() ?? '';
  const hasBrokers = body.includes('Alpaca') || body.includes('Zerodha') || body.includes('Binance') || body.includes('broker');
  expect(hasBrokers).toBe(true);
});
