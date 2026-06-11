import { test, expect, Page } from '@playwright/test';
import { ROUTES } from '../../utils/cloud-constants';

const SANDBOX = ROUTES.SANDBOX; // #/host/collections

async function load(page: Page) {
  await page.goto(SANDBOX, { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(
    () => !document.body.innerText.includes('Loading...'),
    { timeout: 20_000 }
  ).catch(() => {});
}

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
//  SANDBOX â€” Protocol Tabs
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
test.describe('Sandbox â€º Protocol Tabs', () => {
  test.beforeEach(async ({ page }) => { await load(page); });

  test('SBX-PTB-001 | Only Rest and ISO tabs exist â€” NO Realtime tab', async ({ page }) => {
    await expect(page.locator('[role="tab"]:has-text("Rest"), .tab-item:has-text("Rest")').first()).toBeVisible();
    await expect(page.locator('[role="tab"]:has-text("ISO"), .tab-item:has-text("ISO")').first()).toBeVisible();
    await expect(page.locator('[role="tab"]:has-text("Realtime")')).not.toBeVisible();
  });

  test('SBX-PTB-002 | Rest tab is active by default', async ({ page }) => {
    const restTab = page.locator('[role="tab"]:has-text("Rest"), .tab-item:has-text("Rest")').first();
    const cls = await restTab.getAttribute('class') ?? '';
    expect(cls.toLowerCase()).toMatch(/active|selected|current/);
  });

  test('SBX-PTB-003 | Clicking ISO tab activates it and shows port field', async ({ page }) => {
    await page.locator('[role="tab"]:has-text("ISO")').first().click();
    const portInput = page.locator('input[value="6666"], input[placeholder*="port" i]').first();
    await expect(portInput).toBeVisible();
  });

  test('SBX-PTB-004 | URL is #/host/collections', async ({ page }) => {
    expect(page.url()).toContain('host/collections');
  });
});

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
//  SANDBOX â€” Request Editor Tabs
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
test.describe('Sandbox â€º Request Editor Tabs', () => {
  test.beforeEach(async ({ page }) => { await load(page); });

  test('SBX-RET-001 | Body tab is visible', async ({ page }) => {
    await expect(page.locator('[role="tab"]:has-text("Body")').first()).toBeVisible();
  });

  test('SBX-RET-002 | Parameters tab is visible', async ({ page }) => {
    await expect(page.locator('[role="tab"]:has-text("Parameters")').first()).toBeVisible();
  });

  test('SBX-RET-003 | Headers tab is visible', async ({ page }) => {
    await expect(page.locator('[role="tab"]:has-text("Headers")').first()).toBeVisible();
  });

  test('SBX-RET-004 | "Rules" tab is present INSTEAD of Authorization', async ({ page }) => {
    await expect(page.locator('[role="tab"]:has-text("Rules")').first()).toBeVisible();
    await expect(page.locator('[role="tab"]:has-text("Authorization")')).not.toBeVisible();
  });

  test('SBX-RET-005 | Body tab shows Content Type dropdown', async ({ page }) => {
    await page.locator('[role="tab"]:has-text("Body")').first().click();
    await expect(page.locator('text=Content Type').first()).toBeVisible();
  });

  test('SBX-RET-006 | Body empty state shows "This request does not have a body"', async ({ page }) => {
    await page.locator('[role="tab"]:has-text("Body")').first().click();
    await expect(page.locator('text=This request does not have a body').first()).toBeVisible();
  });

  test('SBX-RET-007 | Parameters tab shows "Query Parameters" section', async ({ page }) => {
    await page.locator('[role="tab"]:has-text("Parameters")').first().click();
    await expect(page.locator('text=Query Parameters').first()).toBeVisible();
  });

  test('SBX-RET-008 | Headers tab shows "Header List" section', async ({ page }) => {
    await page.locator('[role="tab"]:has-text("Headers")').first().click();
    await expect(page.locator('text=Header List').first()).toBeVisible();
  });

  test('SBX-RET-009 | Rules tab is clickable and does not crash', async ({ page }) => {
    await page.locator('[role="tab"]:has-text("Rules")').first().click();
    await page.waitForTimeout(500);
    await expect(page.locator('body')).not.toContainText('Error');
  });
});

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
//  SANDBOX â€” Method Dropdown
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
test.describe('Sandbox â€º Method Dropdown', () => {
  test.beforeEach(async ({ page }) => { await load(page); });

  test('SBX-MD-001 | Method dropdown is present', async ({ page }) => {
    await expect(page.locator('.method-select, button:has-text("GET"), button:has-text("Method")').first()).toBeVisible();
  });

  test('SBX-MD-002 | Method dropdown contains GET, POST, PUT, DELETE', async ({ page }) => {
    await page.locator('.method-select, button:has-text("GET"), button:has-text("Method")').first().click();
    for (const m of ['GET', 'POST', 'PUT', 'DELETE']) {
      await expect(page.locator(`[role="option"]:has-text("${m}"), li:has-text("${m}")`).first()).toBeVisible();
    }
    await page.keyboard.press('Escape');
  });
});

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
//  SANDBOX â€” Collections Context Menu
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
test.describe('Sandbox â€º Collections Context Menu', () => {
  test.beforeEach(async ({ page }) => { await load(page); });

  test('SBX-CM-001 | Context menu has same 8 items as Studio', async ({ page }) => {
    const firstColl = page.locator('li, [class*="collection-item"]').first();
    await firstColl.hover();
    await firstColl.locator('button').last().click();
    await page.waitForSelector('[role="menu"], ul.context-menu', { state: 'visible', timeout: 5_000 });
    for (const item of ['New Request','New Folder','Run Collection','Edit','Export','Upload','Duplicate','Delete']) {
      await expect(page.locator('[role="menuitem"], li.menu-item').filter({ hasText: item }).first()).toBeVisible();
    }
    await page.keyboard.press('Escape');
  });
});

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
//  SANDBOX â€” Search & New Button
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
test.describe('Sandbox â€º Collections Panel Controls', () => {
  test.beforeEach(async ({ page }) => { await load(page); });

  test('SBX-CP-001 | Search input is present', async ({ page }) => {
    await expect(page.locator('input[placeholder*="Search" i]').first()).toBeVisible();
  });

  test('SBX-CP-002 | + New button is present', async ({ page }) => {
    await expect(page.locator('button:has-text("New")').first()).toBeVisible();
  });

  test('SBX-CP-003 | + New button opens New Collection modal', async ({ page }) => {
    await page.locator('button:has-text("New")').first().click();
    await expect(page.locator('[role="dialog"]').first()).toBeVisible({ timeout: 8_000 });
    await page.keyboard.press('Escape');
  });
});

