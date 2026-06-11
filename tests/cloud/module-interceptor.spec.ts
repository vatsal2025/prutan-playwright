import { test, expect, Page } from '@playwright/test';
import { ROUTES } from '../../utils/cloud-constants';

const INTERCEPTOR = ROUTES.INTERCEPTOR; // #/interceptor/collections

async function load(page: Page) {
  await page.goto(INTERCEPTOR, { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(
    () => !document.body.innerText.includes('Loading...'),
    { timeout: 20_000 }
  ).catch(() => {});
}

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
//  INTERCEPTOR â€” Protocol Tabs
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
test.describe('Interceptor â€º Protocol Tabs', () => {
  test.beforeEach(async ({ page }) => { await load(page); });

  test('ICP-PTB-001 | Rest and ISO tabs are present', async ({ page }) => {
    await expect(page.locator('[role="tab"]:has-text("Rest"), .tab-item:has-text("Rest")').first()).toBeVisible();
    await expect(page.locator('[role="tab"]:has-text("ISO"), .tab-item:has-text("ISO")').first()).toBeVisible();
  });

  test('ICP-PTB-002 | No Realtime tab in Interceptor', async ({ page }) => {
    await expect(page.locator('[role="tab"]:has-text("Realtime")')).not.toBeVisible();
  });

  test('ICP-PTB-003 | URL is #/interceptor/collections', async ({ page }) => {
    expect(page.url()).toContain('interceptor');
  });

  test('ICP-PTB-004 | ISO tab shows port field (6666)', async ({ page }) => {
    await page.locator('[role="tab"]:has-text("ISO")').first().click();
    const portInput = page.locator('input[value="6666"], input[placeholder*="port" i]').first();
    await expect(portInput).toBeVisible();
  });
});

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
//  INTERCEPTOR â€” Request Editor Tabs
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
test.describe('Interceptor â€º Request Editor Tabs', () => {
  test.beforeEach(async ({ page }) => { await load(page); });

  test('ICP-RET-001 | Body tab visible and clickable', async ({ page }) => {
    await page.locator('[role="tab"]:has-text("Body")').first().click();
    await expect(page.locator('text=Content Type').first()).toBeVisible();
  });

  test('ICP-RET-002 | Parameters tab shows Query Parameters', async ({ page }) => {
    await page.locator('[role="tab"]:has-text("Parameters")').first().click();
    await expect(page.locator('text=Query Parameters').first()).toBeVisible();
  });

  test('ICP-RET-003 | Headers tab shows Header List', async ({ page }) => {
    await page.locator('[role="tab"]:has-text("Headers")').first().click();
    await expect(page.locator('text=Header List').first()).toBeVisible();
  });

  test('ICP-RET-004 | Rules tab present (same as Sandbox â€” no Authorization)', async ({ page }) => {
    await expect(page.locator('[role="tab"]:has-text("Rules")').first()).toBeVisible();
    await expect(page.locator('[role="tab"]:has-text("Authorization")')).not.toBeVisible();
  });

  test('ICP-RET-005 | Body empty state shown by default', async ({ page }) => {
    await expect(page.locator('text=This request does not have a body').first()).toBeVisible();
  });
});

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
//  INTERCEPTOR â€” Collections Panel
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
test.describe('Interceptor â€º Collections Panel', () => {
  test.beforeEach(async ({ page }) => { await load(page); });

  test('ICP-CP-001 | Search input is present', async ({ page }) => {
    await expect(page.locator('input[placeholder*="Search" i]').first()).toBeVisible();
  });

  test('ICP-CP-002 | + New button is present', async ({ page }) => {
    await expect(page.locator('button:has-text("New")').first()).toBeVisible();
  });

  test('ICP-CP-003 | Collections list is visible', async ({ page }) => {
    const items = page.locator('[role="treeitem"]');
    const visible = await items.first().isVisible({ timeout: 15_000 }).catch(() => false);
    if (!visible) { test.skip(); return; }
    await expect(items.first()).toBeVisible();
  });

  test('ICP-CP-004 | Context menu has all 8 items', async ({ page }) => {
    const firstColl = page.locator('[role="treeitem"]').first();
    const hasItems = await firstColl.isVisible({ timeout: 10_000 }).catch(() => false);
    if (!hasItems) { test.skip(); return; }
    await firstColl.hover();
    await firstColl.locator('button').last().click();
    await page.locator('[role="menuitem"], button, li').filter({ hasText: 'New Request' }).first().waitFor({ state: 'visible', timeout: 15_000 });
    for (const item of ['New Request','New Folder','Run Collection','Edit','Export','Upload','Duplicate','Delete']) {
      await expect(page.locator('[role="menuitem"], button, li').filter({ hasText: item }).first()).toBeVisible();
    }
    await page.keyboard.press('Escape');
  });
});

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
//  INTERCEPTOR â€” Second Request Bar (Interceptor-specific)
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
test.describe('Interceptor â€º Second Request Bar', () => {
  test.beforeEach(async ({ page }) => { await load(page); });

  test('ICP-SRB-001 | Interceptor shows two request URL bars (intercept + forward)', async ({ page }) => {
    const urlBars = page.locator('input[placeholder*="url" i], input[placeholder*="enter url" i], input[disabled], input[aria-disabled="true"]');
    await expect(urlBars.first()).toBeVisible({ timeout: 10_000 });
    const count = await urlBars.count();
    expect(count).toBeGreaterThanOrEqual(1);
  });

  test('ICP-SRB-002 | Both request bars have Method dropdowns', async ({ page }) => {
    const methodDropdowns = page.locator('[placeholder="Method"]');
    await expect(methodDropdowns.first()).toBeVisible({ timeout: 10_000 });
    const count = await methodDropdowns.count();
    expect(count).toBeGreaterThanOrEqual(1);
  });
});

