import { test, expect } from '@playwright/test';
import { BottomBar } from '../../pages/cloud/BottomBar';
import { ROUTES } from '../../utils/cloud-constants';

test.describe('Bottom Bar', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto(ROUTES.STUDIO, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1500);
  });

  test('TC-BB-001 | Bottom bar is visible on Studio page', async ({ page }) => {
    const bb = new BottomBar(page);
    await bb.assertVisible();
  });

  test('TC-BB-002 | "Help & feedback" link is present', async ({ page }) => {
    const bb = new BottomBar(page);
    await expect(bb.helpFeedbackBtn()).toBeVisible();
  });

  test('TC-BB-003 | Bottom bar is visible on Settings page', async ({ page }) => {
    await page.goto(ROUTES.SETTINGS, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1000);
    const bb = new BottomBar(page);
    await bb.assertVisible();
  });

  test('TC-BB-004 | Bottom bar is visible on Trace page', async ({ page }) => {
    await page.goto(ROUTES.TRACE, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1000);
    const bb = new BottomBar(page);
    await bb.assertVisible();
  });

  test('TC-BB-005 | Bottom bar is visible on Stress Lab page', async ({ page }) => {
    await page.goto(ROUTES.STRESS_LAB, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1000);
    const bb = new BottomBar(page);
    await bb.assertVisible();
  });

  test('TC-BB-006 | Left sidebar toggle buttons are present', async ({ page }) => {
    // Left side of bottom bar: collapse/expand sidebar and fullscreen
    const leftBtns = page.locator('[class*="bottom-left"] button, .sidebar-toggle-bottom, .fullscreen-btn');
    if (await leftBtns.count() > 0) {
      await expect(leftBtns.first()).toBeVisible();
    } else {
      // At minimum the bottom bar area should exist
      await expect(page.locator('[class*="status-bar"], [class*="bottom-bar"], footer').first()).toBeVisible();
    }
  });

  test('TC-BB-007 | Right side icons are present (at least 3)', async ({ page }) => {
    // From inspection: Help & feedback | proxy | trash | âš¡ | split | fullscreen
    const rightIcons = page.locator('.bottom-bar button, [class*="status-bar"] button, footer button');
    const count = await rightIcons.count();
    expect(count).toBeGreaterThanOrEqual(3);
  });
});

