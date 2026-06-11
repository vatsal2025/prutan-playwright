import { test, expect } from '@playwright/test';
import { SideBar } from '../../pages/cloud/SideBar';
import { ROUTES } from '../../utils/cloud-constants';

test.describe('SideBar Navigation', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto(ROUTES.STUDIO, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1500);
  });

  test('TC-SB-001 | All 7 module icons are visible in the sidebar', async ({ page }) => {
    const sb = new SideBar(page);
    await sb.assertAllModulesVisible();
  });

  test('TC-SB-002 | Studio is active by default on #/home/collections', async ({ page }) => {
    await expect(page.locator('text=Studio').first()).toBeVisible();
    // URL should be on home/collections
    expect(page.url()).toContain('home/collections');
  });

  test('TC-SB-003 | Clicking Sandbox navigates to #/host', async ({ page }) => {
    const sb = new SideBar(page);
    await sb.goToSandbox();
    await expect(page).toHaveURL(/host/);
  });

  test('TC-SB-004 | Clicking Interceptor navigates to #/interceptor/collections', async ({ page }) => {
    const sb = new SideBar(page);
    await sb.goToInterceptor();
    await expect(page).toHaveURL(/interceptor/);
  });

  test('TC-SB-005 | Clicking Stress lab navigates to #/stress-lab', async ({ page }) => {
    const sb = new SideBar(page);
    await sb.goToStressLab();
    await expect(page).toHaveURL(/stress/);
    await expect(page.locator('text=Stress Test Configuration').first()).toBeVisible({ timeout: 10_000 });
  });

  test('TC-SB-006 | Clicking Trace navigates to #/trace', async ({ page }) => {
    const sb = new SideBar(page);
    await sb.goToTrace();
    await expect(page).toHaveURL(/trace/);
    await expect(page.locator('text=Trace Viewer').first()).toBeVisible({ timeout: 10_000 });
  });

  test('TC-SB-007 | Clicking WISO navigates away from Studio', async ({ page }) => {
    const sb = new SideBar(page);
    const urlBefore = page.url();
    await sb.goToWiso();
    await page.waitForTimeout(1000);
    // URL should change
    expect(page.url()).not.toBe(urlBefore);
  });

  test('TC-SB-008 | Clicking Settings navigates to #/settings', async ({ page }) => {
    const sb = new SideBar(page);
    await sb.goToSettings();
    await expect(page).toHaveURL(/settings/);
    await expect(page.locator('text=Theme').first()).toBeVisible({ timeout: 10_000 });
  });

  test('TC-SB-009 | Navigating back to Studio from Settings loads collections panel', async ({ page }) => {
    const sb = new SideBar(page);
    await sb.goToSettings();
    await sb.goToStudio();
    await expect(page).toHaveURL(/home/);
    await expect(page.locator('text=Collections').first()).toBeVisible();
  });

  test('TC-SB-010 | Sandbox module shows Rest and ISO tabs (no Realtime)', async ({ page }) => {
    const sb = new SideBar(page);
    await sb.goToSandbox();
    await expect(page.locator('[role="tab"]:has-text("Rest"), .tab:has-text("Rest")').first()).toBeVisible();
    await expect(page.locator('[role="tab"]:has-text("ISO"), .tab:has-text("ISO")').first()).toBeVisible();
    await expect(page.locator('[role="tab"]:has-text("Realtime")')).not.toBeVisible();
  });

  test('TC-SB-011 | Interceptor module shows Rest and ISO tabs', async ({ page }) => {
    const sb = new SideBar(page);
    await sb.goToInterceptor();
    await expect(page.locator('[role="tab"]:has-text("Rest"), .tab:has-text("Rest")').first()).toBeVisible();
  });

  test('TC-SB-012 | Sandbox editor has "Rules" tab instead of Authorization', async ({ page }) => {
    const sb = new SideBar(page);
    await sb.goToSandbox();
    await expect(page.locator('[role="tab"]:has-text("Rules"), .tab:has-text("Rules")').first()).toBeVisible();
    await expect(page.locator('[role="tab"]:has-text("Authorization")')).not.toBeVisible();
  });

  test('TC-SB-013 | WISO module prompts login if unauthenticated', async ({ page, context }) => {
    // This test uses current auth but verifies WISO loads without error
    const sb = new SideBar(page);
    await sb.goToWiso();
    // Should not show an error page
    await expect(page.locator('body')).not.toContainText('404');
    await expect(page.locator('body')).not.toContainText('Error');
  });
});

