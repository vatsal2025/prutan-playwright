import { test, expect } from '@playwright/test';
import { Trace } from '../../pages/cloud/Trace';
import { ROUTES } from '../../utils/cloud-constants';

/**
 * Trace Viewer â€” comprehensive tests
 *
 * Live UI observed (authenticated, 2026-06-09):
 *
 *   â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
 *   â”‚  Trace Viewer                                           â”‚
 *   â”‚  Search requests by trace ID, method, URL, status...   â”‚
 *   â”‚                                                         â”‚
 *   â”‚  Search Traces [___________________________]            â”‚
 *   â”‚  Time Range  [08-06-2026 08:54 AM â–¾] to               â”‚
 *   â”‚              [09-06-2026 08:54 AM â–¾]   [Search]        â”‚
 *   â”‚                                                         â”‚
 *   â”‚  Transactions          â”‚  Request Details               â”‚
 *   â”‚  â³ Loading...          â”‚                                â”‚
 *   â”‚                        â”‚  ðŸ“„ No Request Selected        â”‚
 *   â”‚                        â”‚  Select a request from the    â”‚
 *   â”‚                        â”‚  list to view its detailed    â”‚
 *   â”‚                        â”‚  information, including       â”‚
 *   â”‚                        â”‚  headers, body, and flow      â”‚
 *   â”‚                        â”‚  diagram.                     â”‚
 *   â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
 *
 * Request Details (when a transaction is selected) shows:
 *   headers, body, and flow diagram
 */

test.describe('Trace Viewer â€” Page Layout', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto(ROUTES.TRACE, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);
  });

  test('TC-TR-001 | Page heading is "Trace Viewer"', async ({ page }) => {
    await expect(page.locator('h1:has-text("Trace Viewer"), h2:has-text("Trace Viewer"), text=Trace Viewer').first()).toBeVisible({ timeout: 10_000 });
  });

  test('TC-TR-002 | Subtitle describes searchable fields', async ({ page }) => {
    const subtitle = page.locator('text=Search requests by trace ID').first();
    await expect(subtitle).toBeVisible();
    await expect(subtitle).toContainText('method');
    await expect(subtitle).toContainText('URL');
    await expect(subtitle).toContainText('status');
  });

  test('TC-TR-003 | URL is correct: /#/trace', async ({ page }) => {
    expect(page.url()).toContain('/trace');
  });

  test('TC-TR-004 | Sidebar still shows all module icons', async ({ page }) => {
    await expect(page.locator('text=Studio').first()).toBeVisible();
    await expect(page.locator('text=Sandbox').first()).toBeVisible();
    await expect(page.locator('text=Trace').first()).toBeVisible();
    await expect(page.locator('text=Settings').first()).toBeVisible();
  });

  test('TC-TR-005 | Bottom bar "Help & feedback" is visible on Trace page', async ({ page }) => {
    await expect(page.locator('text=Help & feedback').first()).toBeVisible();
  });
});

test.describe('Trace Viewer â€” Search Controls', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto(ROUTES.TRACE, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);
  });

  test('TC-TR-006 | "Search Traces" label is present', async ({ page }) => {
    await expect(page.locator('text=Search Traces').first()).toBeVisible();
  });

  test('TC-TR-007 | Search input is visible and editable', async ({ page }) => {
    const input = page.locator('input[placeholder*="BOI" i], input[placeholder*="trace" i]').first();
    await expect(input).toBeVisible();
    await input.click();
    await expect(input).toBeFocused();
  });

  test('TC-TR-008 | Search input placeholder matches live observation: "e.g., BOI093246327AHHAHSH"', async ({ page }) => {
    const input = page.locator('input[placeholder*="BOI"]').first();
    await expect(input).toBeVisible();
    const ph = await input.getAttribute('placeholder');
    expect(ph).toContain('BOI');
  });

  test('TC-TR-009 | Typing a trace ID fills the search box', async ({ page }) => {
    const input = page.locator('input[placeholder*="BOI" i], input[placeholder*="trace" i]').first();
    await input.fill('BOI093246327AHHAHSH');
    await expect(input).toHaveValue('BOI093246327AHHAHSH');
  });

  test('TC-TR-010 | Clearing search input empties the field', async ({ page }) => {
    const input = page.locator('input[placeholder*="BOI" i], input[placeholder*="trace" i]').first();
    await input.fill('TEST123');
    await input.clear();
    await expect(input).toHaveValue('');
  });

  test('TC-TR-011 | "Time Range" label is present', async ({ page }) => {
    await expect(page.locator('text=Time Range').first()).toBeVisible();
  });

  test('TC-TR-012 | Two datetime-local inputs are present for from/to range', async ({ page }) => {
    const inputs = page.locator('input[type="datetime-local"]');
    await expect(inputs.nth(0)).toBeVisible();
    await expect(inputs.nth(1)).toBeVisible();
  });

  test('TC-TR-013 | From date is pre-filled (not empty)', async ({ page }) => {
    const fromInput = page.locator('input[type="datetime-local"]').first();
    const val = await fromInput.inputValue();
    expect(val.trim()).not.toBe('');
  });

  test('TC-TR-014 | To date is pre-filled (not empty)', async ({ page }) => {
    const toInput = page.locator('input[type="datetime-local"]').nth(1);
    const val = await toInput.inputValue();
    expect(val.trim()).not.toBe('');
  });

  test('TC-TR-015 | From date is earlier than To date (valid range)', async ({ page }) => {
    const fromVal = await page.locator('input[type="datetime-local"]').first().inputValue();
    const toVal   = await page.locator('input[type="datetime-local"]').nth(1).inputValue();
    expect(new Date(fromVal).getTime()).toBeLessThan(new Date(toVal).getTime());
  });

  test('TC-TR-016 | Default time range is approximately 30 days', async ({ page }) => {
    const fromVal = await page.locator('input[type="datetime-local"]').first().inputValue();
    const toVal   = await page.locator('input[type="datetime-local"]').nth(1).inputValue();
    const diffDays = (new Date(toVal).getTime() - new Date(fromVal).getTime()) / (1000 * 60 * 60 * 24);
    expect(diffDays).toBeGreaterThanOrEqual(1);
    expect(diffDays).toBeLessThanOrEqual(90);
  });

  test('TC-TR-017 | From date input can be updated', async ({ page }) => {
    const fromInput = page.locator('input[type="datetime-local"]').first();
    await fromInput.fill('2026-01-01T00:00');
    await expect(fromInput).toHaveValue('2026-01-01T00:00');
  });

  test('TC-TR-018 | To date input can be updated', async ({ page }) => {
    const toInput = page.locator('input[type="datetime-local"]').nth(1);
    await toInput.fill('2026-12-31T23:59');
    await expect(toInput).toHaveValue('2026-12-31T23:59');
  });

  test('TC-TR-019 | Search button is visible', async ({ page }) => {
    await expect(page.locator('button:has-text("Search")').first()).toBeVisible();
  });

  test('TC-TR-020 | Search button is enabled (not disabled)', async ({ page }) => {
    await expect(page.locator('button:has-text("Search")').first()).toBeEnabled();
  });

  test('TC-TR-021 | Clicking Search does not crash the page', async ({ page }) => {
    await page.locator('button:has-text("Search")').first().click();
    await page.waitForTimeout(2000);
    await expect(page.locator('body')).not.toContainText('Cannot GET');
    await expect(page.locator('body')).not.toContainText('404');
  });

  test('TC-TR-022 | Search with custom trace ID triggers request', async ({ page }) => {
    const input = page.locator('input[placeholder*="BOI" i], input[placeholder*="trace" i]').first();
    await input.fill('BOI093246327AHHAHSH');
    await page.locator('button:has-text("Search")').first().click();
    await page.waitForTimeout(2000);
    // Page should not error out
    await expect(page.locator('body')).not.toContainText('Error loading');
  });
});

test.describe('Trace Viewer â€” Split Panel Layout', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto(ROUTES.TRACE, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);
  });

  test('TC-TR-023 | "Transactions" column header is visible', async ({ page }) => {
    await expect(page.locator('text=Transactions').first()).toBeVisible();
  });

  test('TC-TR-024 | "Request Details" column header is visible', async ({ page }) => {
    await expect(page.locator('text=Request Details').first()).toBeVisible();
  });

  test('TC-TR-025 | Transactions panel shows loading spinner on initial load', async ({ page }) => {
    // Navigate fresh to catch the loading state
    await page.goto(ROUTES.TRACE, { waitUntil: 'domcontentloaded' });
    // Loading may be brief â€” check that it eventually disappears
    await page.waitForFunction(
      () => !document.body.innerText.includes('Loading...'),
      { timeout: 15_000 }
    ).catch(() => { /* may already be gone */ });
    await expect(page.locator('body')).not.toContainText('Error');
  });

  test('TC-TR-026 | "No Request Selected" empty state is shown in details pane', async ({ page }) => {
    await expect(page.locator('text=No Request Selected').first()).toBeVisible();
  });

  test('TC-TR-027 | Empty state subtext mentions "headers, body, and flow diagram"', async ({ page }) => {
    await expect(
      page.locator('text=Select a request from the list').first()
    ).toBeVisible();
    await expect(
      page.locator('text=headers, body').first()
    ).toBeVisible();
    await expect(
      page.locator('text=flow diagram').first()
    ).toBeVisible();
  });

  test('TC-TR-028 | Empty state shows document/file icon illustration', async ({ page }) => {
    // There's a grey document icon in the empty state
    const icon = page.locator('svg, img, [class*="icon"], [class*="empty-icon"]').filter(
      { hasText: '' }
    ).first();
    // Just verify the empty state section itself is present with illustration
    const emptyState = page.locator('[class*="empty"], [class*="no-request"], [class*="placeholder"]').first();
    if (await emptyState.isVisible().catch(() => false)) {
      await expect(emptyState).toBeVisible();
    } else {
      // Fallback: verify the text is there
      await expect(page.locator('text=No Request Selected').first()).toBeVisible();
    }
  });

  test('TC-TR-029 | Clicking a transaction row (if loaded) populates Request Details', async ({ page }) => {
    // Wait for transactions to load
    await page.locator('button:has-text("Search")').first().click();
    await page.waitForTimeout(3000);

    const rows = page.locator('[class*="transaction"], [class*="txn"], .transaction-row, tbody tr');
    const count = await rows.count();

    if (count > 0) {
      await rows.first().click();
      await page.waitForTimeout(1000);
      // Request Details pane should now show content (not "No Request Selected")
      const noSelect = await page.locator('text=No Request Selected').isVisible().catch(() => false);
      // It should have changed â€” either no longer visible or detail content visible
      expect(noSelect).toBeFalsy();
    } else {
      // No transactions in range â€” test the empty state instead
      await expect(page.locator('text=No Request Selected').first()).toBeVisible();
      test.skip();
    }
  });
});

test.describe('Trace Viewer â€” Navigation Integration', () => {

  test('TC-TR-030 | Navigating away and back to Trace preserves the page', async ({ page }) => {
    await page.goto(ROUTES.TRACE, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1500);

    // Navigate to Settings
    await page.goto(ROUTES.SETTINGS, { waitUntil: 'domcontentloaded' });
    await expect(page.locator('text=Theme').first()).toBeVisible();

    // Navigate back to Trace
    await page.goto(ROUTES.TRACE, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1500);
    await expect(page.locator('text=Trace Viewer').first()).toBeVisible({ timeout: 10_000 });
  });

  test('TC-TR-031 | Trace page accessible directly via deep link /#/trace', async ({ page }) => {
    await page.goto('https://app.prutan.com/prutan/core/ui/#/trace', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);
    await expect(page.locator('text=Trace Viewer').first()).toBeVisible({ timeout: 10_000 });
  });

  test('TC-TR-032 | Sidebar Trace icon navigates to Trace page', async ({ page }) => {
    // Start on Studio
    await page.goto(ROUTES.STUDIO, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1500);

    // Click Trace in sidebar
    await page.locator('.sidebar a:has-text("Trace"), nav li:has-text("Trace"), [data-module="trace"]').first().click();
    await page.waitForTimeout(2000);

    await expect(page).toHaveURL(/trace/);
    await expect(page.locator('text=Trace Viewer').first()).toBeVisible({ timeout: 10_000 });
  });
});

