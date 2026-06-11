import { test, expect } from '@playwright/test';
import { ROUTES } from '../../utils/cloud-constants';

/**
 * WISO Module Tests
 * URL: /#/wiso
 *
 * From live inspection:
 * - Clicking WISO when unauthenticated shows "Please login to use this feature." toast
 * - Authenticated: navigates to WISO AI chat/assistant UI
 * - Settings â†’ Integrations â†’ WISO Configuration: "Configure LLM provider and model settings"
 */
test.describe('WISO Module', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto(ROUTES.WISO, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);
  });

  test('TC-WS-001 | WISO page loads without a crash', async ({ page }) => {
    await expect(page.locator('body')).not.toContainText('404');
    await expect(page.locator('body')).not.toContainText('Cannot GET');
  });

  test('TC-WS-002 | WISO is accessible via sidebar click from Studio', async ({ page }) => {
    await page.goto(ROUTES.STUDIO, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1500);
    await page.locator('text=WISO').first().click();
    await page.waitForTimeout(2000);
    await expect(page.locator('body')).not.toContainText('404');
  });

  test('TC-WS-003 | Bottom bar "Help & feedback" is visible on WISO page', async ({ page }) => {
    await expect(page.locator('text=Help & feedback').first()).toBeVisible();
  });

  test('TC-WS-004 | Top bar is intact on WISO page', async ({ page }) => {
    await expect(page.locator('text=PruTAN, img[alt*="PruTAN"]').first()).toBeVisible();
    await expect(page.locator('text=My Workspace').first()).toBeVisible();
  });

  test('TC-WS-005 | Sidebar module icons still visible on WISO page', async ({ page }) => {
    await expect(page.locator('text=Studio').first()).toBeVisible();
    await expect(page.locator('text=Settings').first()).toBeVisible();
  });
});

test.describe('WISO Configuration (via Settings)', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto(ROUTES.SETTINGS, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1000);
    await page.locator('text=Integrations').first().scrollIntoViewIfNeeded();
  });

  test('TC-WS-006 | WISO Configuration row is listed in Settings â†’ Integrations', async ({ page }) => {
    await expect(page.locator('text=WISO Configuration').first()).toBeVisible();
  });

  test('TC-WS-007 | WISO Configuration subtitle: "Configure LLM provider and model settings"', async ({ page }) => {
    await expect(
      page.locator('text=Configure LLM provider and model settings').first()
    ).toBeVisible();
  });

  test('TC-WS-008 | WISO Configuration toggle starts as Disabled', async ({ page }) => {
    const row = page.locator('[class*="integration"], .integration-item').filter({ hasText: 'WISO Configuration' }).first();
    await expect(row.locator('text=Disabled').first()).toBeVisible();
  });

  test('TC-WS-009 | WISO Configuration has a âš™ configure button', async ({ page }) => {
    const row = page.locator('[class*="integration"], .integration-item').filter({ hasText: 'WISO Configuration' }).first();
    const configBtn = row.locator('button[title*="configure" i], button[aria-label*="config" i], .config-btn').first();
    await expect(configBtn).toBeVisible();
  });

  test('TC-WS-010 | WISO Configuration toggle can be switched on', async ({ page }) => {
    const row = page.locator('[class*="integration"], .integration-item').filter({ hasText: 'WISO Configuration' }).first();
    const toggle = row.locator('input[type="checkbox"], [role="switch"]').first();
    if (await toggle.isVisible()) {
      const before = await toggle.isChecked();
      await toggle.click();
      const after = await toggle.isChecked();
      expect(after).not.toBe(before);
      // Restore
      await toggle.click();
    }
  });
});

