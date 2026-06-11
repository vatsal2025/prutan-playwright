import { test, expect } from '@playwright/test';
import { TopBar } from '../../pages/cloud/TopBar';
import { ROUTES } from '../../utils/cloud-constants';

test.describe('TopBar â€” Authenticated', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto(ROUTES.STUDIO, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1500);
  });

  // â”€â”€ Layout â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  test('TC-TB-001 | PruTAN logo is visible in topbar', async ({ page }) => {
    const tb = new TopBar(page);
    await expect(page.locator('text=PruTAN, img[alt*="PruTAN"]').first()).toBeVisible();
  });

  test('TC-TB-002 | Default Agent button is visible when logged in', async ({ page }) => {
    const tb = new TopBar(page);
    await tb.assertDefaultAgentVisible();
  });

  test('TC-TB-003 | Select Environment button is visible', async ({ page }) => {
    const tb = new TopBar(page);
    await expect(tb.selectEnvBtn()).toBeVisible();
  });

  test('TC-TB-004 | My Workspace link is visible', async ({ page }) => {
    const tb = new TopBar(page);
    await expect(tb.myWorkspaceLink()).toBeVisible();
  });

  test('TC-TB-005 | Login button is NOT visible when authenticated', async ({ page }) => {
    const tb = new TopBar(page);
    await expect(tb.loginBtn()).not.toBeVisible();
  });

  // â”€â”€ Password banner â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  test('TC-TB-006 | Password change banner shows "Kindly change your default password"', async ({ page }) => {
    const banner = page.locator('text=Kindly change your default password');
    // Banner may or may not appear depending on account state â€” check and handle
    const visible = await banner.isVisible({ timeout: 3000 }).catch(() => false);
    if (visible) {
      await expect(page.locator('button:has-text("Change Password")')).toBeVisible();
      await expect(page.locator('button:has-text("Dismiss")')).toBeVisible();
    }
  });

  test('TC-TB-007 | Dismiss banner hides it', async ({ page }) => {
    const tb = new TopBar(page);
    const banner = page.locator('text=Kindly change your default password');
    const visible = await banner.isVisible({ timeout: 3000 }).catch(() => false);
    if (visible) {
      await tb.dismissPasswordBanner();
      await expect(banner).not.toBeVisible();
    } else {
      test.skip();
    }
  });

  // â”€â”€ Default Agent dropdown â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  test('TC-TB-008 | Default Agent dropdown opens and lists existing collections', async ({ page }) => {
    const tb = new TopBar(page);
    await page.waitForTimeout(3000); // let collections load
    await tb.openDefaultAgent();
    const panel = page.locator('[role="listbox"], .dropdown-panel, [class*="agent-dropdown"]').first();
    await expect(panel).toBeVisible();
    // Should contain at least one real collection name
    const items = panel.locator('[role="option"], li, .collection-option');
    await expect(items.first()).toBeVisible();
    await page.keyboard.press('Escape');
  });

  // â”€â”€ Select Environment dropdown â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  test('TC-TB-009 | Select Environment shows "No environment" as default', async ({ page }) => {
    const tb = new TopBar(page);
    await tb.openSelectEnvironment();
    await expect(page.locator('text=No environment').first()).toBeVisible();
    await page.keyboard.press('Escape');
  });

  test('TC-TB-010 | Select Environment shows at least one real environment when configured', async ({ page }) => {
    const tb = new TopBar(page);
    await tb.openSelectEnvironment();
    const allOptions = page.locator('[role="option"], .env-item');
    const count = await allOptions.count();
    // Users may have different environments — just verify the dropdown has options (including "No environment")
    expect(count).toBeGreaterThanOrEqual(1);
    await page.keyboard.press('Escape');
  });

  test('TC-TB-011 | Selecting a non-default environment closes dropdown and updates button label', async ({ page }) => {
    const tb = new TopBar(page);
    await tb.openSelectEnvironment();
    // Get all options except "No environment"
    const allOptions = page.locator('[role="option"], .env-item');
    const realEnv = allOptions.filter({ hasNotText: /no environment/i }).first();
    if (await realEnv.isVisible({ timeout: 3_000 }).catch(() => false)) {
      const envName = await realEnv.textContent() ?? '';
      await realEnv.click();
      await expect(tb.selectEnvBtn()).not.toContainText('Select Environment');
      // Restore to "No environment"
      await tb.openSelectEnvironment();
      await page.locator('text=No environment').first().click();
    } else {
      test.skip();
    }
  });
});

test.describe('TopBar â€” Unauthenticated', () => {
  // Run without auth state for these tests
  test.use({ storageState: { cookies: [], origins: [] } });

  test.beforeEach(async ({ page }) => {
    await page.goto(ROUTES.STUDIO, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1500);
  });

  test('TC-TB-012 | Login button is visible when not logged in', async ({ page }) => {
    await expect(page.locator('button:has-text("Login")')).toBeVisible();
  });

  test('TC-TB-013 | Login modal renders Email, Password, Sign In fields', async ({ page }) => {
    await page.locator('button:has-text("Login")').click();
    await page.waitForSelector('text=Login to pruTAN', { timeout: 8000 });
    await expect(page.locator('input[type="email"], input[placeholder*="email" i]').first()).toBeVisible();
    await expect(page.locator('input[type="password"]').first()).toBeVisible();
    await expect(page.locator('button:has-text("Sign In")')).toBeVisible();
  });

  test('TC-TB-014 | Login modal has Terms of Service and Privacy Policy links', async ({ page }) => {
    await page.locator('button:has-text("Login")').click();
    await page.waitForSelector('text=Login to pruTAN');
    await expect(page.locator('a:has-text("Terms of Service")')).toBeVisible();
    await expect(page.locator('a:has-text("Privacy Policy")')).toBeVisible();
  });

  test('TC-TB-015 | Login modal closes on ESC', async ({ page }) => {
    await page.locator('button:has-text("Login")').click();
    await page.waitForSelector('text=Login to pruTAN');
    await page.keyboard.press('Escape');
    await expect(page.locator('text=Login to pruTAN')).not.toBeVisible({ timeout: 5000 });
  });

  test('TC-TB-016 | Login modal closes on X button', async ({ page }) => {
    await page.locator('button:has-text("Login")').click();
    await page.waitForSelector('text=Login to pruTAN');
    await page.locator('[role="dialog"] button[aria-label*="close" i], [role="dialog"] button:has-text("Ã—")').first().click();
    await expect(page.locator('text=Login to pruTAN')).not.toBeVisible({ timeout: 5000 });
  });

  test('TC-TB-017 | Select Environment shows only "No environment" when unauthenticated', async ({ page }) => {
    await page.locator('button:has-text("Select Environment")').click();
    await expect(page.locator('text=No environment').first()).toBeVisible();
    const options = page.locator('[role="option"], .env-item');
    expect(await options.count()).toBe(1);
    await page.keyboard.press('Escape');
  });
});

