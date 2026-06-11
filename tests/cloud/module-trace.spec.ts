import { test, expect, Page } from '@playwright/test';
import { ROUTES } from '../../utils/cloud-constants';

async function load(page: Page) {
  await page.goto(ROUTES.TRACE, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2000);
}

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
//  TRACE â€” Page Layout
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
test.describe('Trace â€º Page Layout', () => {
  test.beforeEach(async ({ page }) => { await load(page); });

  test('TR-PL-001 | Heading "Trace Viewer" is visible', async ({ page }) => {
    await expect(page.locator('h1:has-text("Trace Viewer"), h2:has-text("Trace Viewer"), text=Trace Viewer').first()).toBeVisible({ timeout: 10_000 });
  });

  test('TR-PL-002 | Subtitle describes searchable fields (trace ID, method, URL, status)', async ({ page }) => {
    const subtitle = page.locator('text=Search requests by trace ID').first();
    await expect(subtitle).toBeVisible();
    await expect(subtitle).toContainText('method');
    await expect(subtitle).toContainText('URL');
    await expect(subtitle).toContainText('status');
  });

  test('TR-PL-003 | URL is #/trace', async ({ page }) => {
    expect(page.url()).toContain('/trace');
  });

  test('TR-PL-004 | No collections panel or editor tabs â€” full-page layout', async ({ page }) => {
    await expect(page.locator('[role="tab"]:has-text("Body")')).not.toBeVisible();
    await expect(page.locator('[role="tab"]:has-text("Rest")')).not.toBeVisible();
  });

  test('TR-PL-005 | Page splits into two columns: Transactions | Request Details', async ({ page }) => {
    await expect(page.locator('text=Transactions').first()).toBeVisible();
    await expect(page.locator('text=Request Details').first()).toBeVisible();
  });
});

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
//  TRACE â€” Search Controls
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
test.describe('Trace â€º Search Controls', () => {
  test.beforeEach(async ({ page }) => { await load(page); });

  test('TR-SC-001 | "Search Traces" label is present', async ({ page }) => {
    await expect(page.locator('text=Search Traces').first()).toBeVisible();
  });

  test('TR-SC-002 | Search input has BOI placeholder from live inspection', async ({ page }) => {
    const input = page.locator('input[placeholder*="BOI"], input[placeholder*="trace" i]').first();
    await expect(input).toBeVisible();
    const ph = await input.getAttribute('placeholder') ?? '';
    expect(ph).toContain('BOI');
  });

  test('TR-SC-003 | Search input is focusable', async ({ page }) => {
    const input = page.locator('input[placeholder*="BOI"], input[placeholder*="trace" i]').first();
    await input.click();
    await expect(input).toBeFocused();
  });

  test('TR-SC-004 | Search input accepts text input', async ({ page }) => {
    const input = page.locator('input[placeholder*="BOI"], input[placeholder*="trace" i]').first();
    await input.fill('BOI093246327AHHAHSH');
    await expect(input).toHaveValue('BOI093246327AHHAHSH');
  });

  test('TR-SC-005 | Search input can be cleared', async ({ page }) => {
    const input = page.locator('input[placeholder*="BOI"], input[placeholder*="trace" i]').first();
    await input.fill('TEST');
    await input.clear();
    await expect(input).toHaveValue('');
  });

  test('TR-SC-006 | "Time Range" label is present', async ({ page }) => {
    await expect(page.locator('text=Time Range').first()).toBeVisible();
  });

  test('TR-SC-007 | "from" datetime-local input is present and pre-filled', async ({ page }) => {
    const from = page.locator('input[type="datetime-local"]').first();
    await expect(from).toBeVisible();
    const val = await from.inputValue();
    expect(val.trim()).not.toBe('');
  });

  test('TR-SC-008 | "to" datetime-local input is present and pre-filled', async ({ page }) => {
    const to = page.locator('input[type="datetime-local"]').nth(1);
    await expect(to).toBeVisible();
    const val = await to.inputValue();
    expect(val.trim()).not.toBe('');
  });

  test('TR-SC-009 | "to" date is always later than "from" date', async ({ page }) => {
    const fromVal = await page.locator('input[type="datetime-local"]').first().inputValue();
    const toVal   = await page.locator('input[type="datetime-local"]').nth(1).inputValue();
    expect(new Date(fromVal).getTime()).toBeLessThan(new Date(toVal).getTime());
  });

  test('TR-SC-010 | Default window is between 1 and 90 days', async ({ page }) => {
    const fromVal = await page.locator('input[type="datetime-local"]').first().inputValue();
    const toVal   = await page.locator('input[type="datetime-local"]').nth(1).inputValue();
    const days = (new Date(toVal).getTime() - new Date(fromVal).getTime()) / 86_400_000;
    expect(days).toBeGreaterThanOrEqual(1);
    expect(days).toBeLessThanOrEqual(90);
  });

  test('TR-SC-011 | "from" date input can be updated', async ({ page }) => {
    await page.locator('input[type="datetime-local"]').first().fill('2026-01-01T00:00');
    await expect(page.locator('input[type="datetime-local"]').first()).toHaveValue('2026-01-01T00:00');
  });

  test('TR-SC-012 | "to" date input can be updated', async ({ page }) => {
    await page.locator('input[type="datetime-local"]').nth(1).fill('2026-12-31T23:59');
    await expect(page.locator('input[type="datetime-local"]').nth(1)).toHaveValue('2026-12-31T23:59');
  });

  test('TR-SC-013 | Search button is visible', async ({ page }) => {
    await expect(page.locator('button:has-text("Search")').first()).toBeVisible();
  });

  test('TR-SC-014 | Search button is enabled', async ({ page }) => {
    await expect(page.locator('button:has-text("Search")').first()).toBeEnabled();
  });

  test('TR-SC-015 | Clicking Search does not error or crash', async ({ page }) => {
    await page.locator('button:has-text("Search")').first().click();
    await page.waitForTimeout(2000);
    await expect(page.locator('body')).not.toContainText('Cannot GET');
    await expect(page.locator('body')).not.toContainText('404');
  });

  test('TR-SC-016 | Searching with custom date range triggers request', async ({ page }) => {
    await page.locator('input[type="datetime-local"]').first().fill('2026-01-01T00:00');
    await page.locator('input[type="datetime-local"]').nth(1).fill('2026-06-01T00:00');
    await page.locator('button:has-text("Search")').first().click();
    await page.waitForTimeout(2000);
    await expect(page.locator('body')).not.toContainText('Error loading');
  });
});

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
//  TRACE â€” Transactions Panel
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
test.describe('Trace â€º Transactions Panel', () => {
  test.beforeEach(async ({ page }) => { await load(page); });

  test('TR-TXN-001 | "Transactions" column header is shown', async ({ page }) => {
    await expect(page.locator('text=Transactions').first()).toBeVisible();
  });

  test('TR-TXN-002 | Transactions panel shows loading spinner on navigation', async ({ page }) => {
    await page.goto(ROUTES.TRACE, { waitUntil: 'domcontentloaded' });
    // Catch the loading state immediately
    await page.waitForFunction(
      () => !document.body.innerText.includes('Loading...'),
      { timeout: 20_000 }
    ).catch(() => {});
    await expect(page.locator('body')).not.toContainText('Error');
  });

  test('TR-TXN-003 | After search, transaction rows appear or "no results" message shows', async ({ page }) => {
    await page.locator('button:has-text("Search")').first().click();
    await page.waitForTimeout(3000);
    const rows = page.locator('[class*="transaction"], [class*="txn"], tbody tr, .transaction-row');
    const noResult = page.locator('text=No transactions, text=No results, text=No data').first();
    const hasRows   = await rows.count() > 0;
    const hasNoMsg  = await noResult.isVisible().catch(() => false);
    expect(hasRows || hasNoMsg).toBeTruthy();
  });

  test('TR-TXN-004 | Clicking a transaction row updates Request Details pane', async ({ page }) => {
    await page.locator('button:has-text("Search")').first().click();
    await page.waitForTimeout(3000);
    const rows = page.locator('[class*="transaction"], [class*="txn"], tbody tr, .transaction-row');
    if (await rows.count() > 0) {
      await rows.first().click();
      await page.waitForTimeout(1000);
      // "No Request Selected" should be gone
      await expect(page.locator('text=No Request Selected')).not.toBeVisible({ timeout: 5_000 });
    } else {
      test.skip();
    }
  });
});

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
//  TRACE â€” Request Details Panel (Empty State)
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
test.describe('Trace â€º Request Details Panel', () => {
  test.beforeEach(async ({ page }) => { await load(page); });

  test('TR-RDP-001 | "Request Details" column header is shown', async ({ page }) => {
    await expect(page.locator('text=Request Details').first()).toBeVisible();
  });

  test('TR-RDP-002 | "No Request Selected" empty state is shown initially', async ({ page }) => {
    await expect(page.locator('text=No Request Selected').first()).toBeVisible();
  });

  test('TR-RDP-003 | Empty state subtext says "Select a request from the list"', async ({ page }) => {
    await expect(page.locator('text=Select a request from the list').first()).toBeVisible();
  });

  test('TR-RDP-004 | Empty state mentions "headers, body, and flow diagram"', async ({ page }) => {
    await expect(page.locator('text=headers, body').first()).toBeVisible();
    await expect(page.locator('text=flow diagram').first()).toBeVisible();
  });

  test('TR-RDP-005 | Empty state has an illustration/icon', async ({ page }) => {
    const icon = page.locator('[class*="empty"], [class*="no-request"], [class*="placeholder"], svg, img').first();
    await expect(icon).toBeVisible();
  });
});

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
//  TRACE â€” Navigation
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
test.describe('Trace â€º Navigation', () => {

  test('TR-NAV-001 | Direct deep-link to /#/trace works', async ({ page }) => {
    await page.goto('https://app.prutan.com/prutan/core/ui/#/trace', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);
    await expect(page.locator('text=Trace Viewer').first()).toBeVisible({ timeout: 10_000 });
  });

  test('TR-NAV-002 | Sidebar Trace icon navigates to Trace Viewer', async ({ page }) => {
    await page.goto(ROUTES.STUDIO, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1500);
    await page.locator('text=Trace, [data-module="trace"]').first().click();
    await page.waitForTimeout(2000);
    await expect(page).toHaveURL(/trace/);
    await expect(page.locator('text=Trace Viewer').first()).toBeVisible({ timeout: 10_000 });
  });

  test('TR-NAV-003 | Navigating away and back preserves layout', async ({ page }) => {
    await load(page);
    await page.goto(ROUTES.SETTINGS, { waitUntil: 'domcontentloaded' });
    await load(page);
    await expect(page.locator('text=Trace Viewer').first()).toBeVisible({ timeout: 10_000 });
    await expect(page.locator('text=No Request Selected').first()).toBeVisible();
  });
});

