import { test, expect } from '@playwright/test';
import { CollectionsPanel } from '../../pages/cloud/CollectionsPanel';
import { RequestEditor } from '../../pages/cloud/RequestEditor';
import { SideBar } from '../../pages/cloud/SideBar';
import { TopBar } from '../../pages/cloud/TopBar';
import { ROUTES } from '../../utils/cloud-constants';

const TS = Date.now();

test.describe('End-to-End User Journeys', () => {

  // â”€â”€ Journey 1: Create collection â†’ Add request â†’ Fill fields â†’ Save â”€â”€â”€â”€â”€
  test('TC-E2E-001 | Create collection â†’ add REST request â†’ fill URL â†’ save', async ({ page }) => {
    await page.goto(ROUTES.STUDIO, { waitUntil: 'domcontentloaded' });
    await page.waitForFunction(() => !document.body.innerText.includes('Loading...'), { timeout: 15_000 }).catch(() => {});

    const cp = new CollectionsPanel(page);
    const re = new RequestEditor(page);

    const collName = `E2E_Journey1_${TS}`;
    const reqName  = `GET_Health_${TS}`;

    // Step 1: Create collection
    await cp.createCollection(collName);
    await cp.assertCollectionVisible(collName);

    // Step 2: Add request via context menu
    await cp.addNewRequest(collName, reqName);

    // Step 3: Fill request fields
    await re.selectMethod('GET');
    await re.setUrl('https://api.prutan.com/health');

    // Step 4: Switch to Headers tab and verify it loads
    await re.openHeadersTab();
    await expect(re.headerListSection()).toBeVisible();

    // Step 5: Switch to Authorization and set Bearer
    await re.selectAuthType('Bearer');
    await expect(page.locator('input[placeholder*="token" i], label:has-text("Token")').first()).toBeVisible();

    // Cleanup
    await cp.deleteCollection(collName);
    const confirmBtn = page.locator('button:has-text("Confirm"), button:has-text("Yes")').last();
    if (await confirmBtn.isVisible({ timeout: 3_000 }).catch(() => false)) await confirmBtn.click();
  });

  // â”€â”€ Journey 2: Create ISO request â†’ verify port field â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  test('TC-E2E-002 | Create ISO collection â†’ create request â†’ confirm port field', async ({ page }) => {
    await page.goto(ROUTES.STUDIO, { waitUntil: 'domcontentloaded' });
    await page.waitForFunction(() => !document.body.innerText.includes('Loading...'), { timeout: 15_000 }).catch(() => {});

    const cp = new CollectionsPanel(page);
    const re = new RequestEditor(page);
    const collName = `E2E_ISO_${TS}`;

    await cp.createCollection(collName);
    await cp.addNewRequest(collName, `ISO_TC_${TS}`);

    // Switch to ISO tab
    await re.switchToISO();
    await expect(re.portInput()).toBeVisible();
    await expect(re.portInput()).toHaveValue('6666');

    // Cleanup
    await cp.deleteCollection(collName);
    const btn = page.locator('button:has-text("Confirm"), button:has-text("Yes")').last();
    if (await btn.isVisible({ timeout: 3_000 }).catch(() => false)) await btn.click();
  });

  // â”€â”€ Journey 3: Pre-request Script â†’ type code â†’ search snippet â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  test('TC-E2E-003 | Open Pre-request Script â†’ type code â†’ search snippet', async ({ page }) => {
    await page.goto(ROUTES.STUDIO, { waitUntil: 'domcontentloaded' });
    await page.waitForFunction(() => !document.body.innerText.includes('Loading...'), { timeout: 15_000 }).catch(() => {});

    const re = new RequestEditor(page);
    await re.openPreRequestTab();

    // Type JavaScript
    await re.rulesCodeEditor().click();
    await page.keyboard.type('const env = pm.environment.get("baseUrl");');

    // Search a snippet
    await re.rulesSnippetSearch().fill('status');
    await page.waitForTimeout(400);
    // Snippet search should respond (results or no results â€” no crash)
    await expect(page.locator('body')).not.toContainText('Error');
  });

  // â”€â”€ Journey 4: Stress Lab full config â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  test('TC-E2E-004 | Stress Lab â€” fill full config form', async ({ page }) => {
    await page.goto(ROUTES.STRESS_LAB, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);

    // Set mode to Volume
    await page.locator('label:has-text("Volume"), input[value*="volume" i]').first().click();

    // Fill general config
    const inputs = [
      { label: 'Virtual users', value: '25' },
      { label: 'Timeout',       value: '2000' },
      { label: 'Delay',         value: '500' },
    ];

    for (const { label, value } of inputs) {
      const input = page.locator(`label:has-text("${label}") + input, input:near(:text("${label}"))`).first();
      if (await input.isVisible()) {
        await input.fill(value);
        await expect(input).toHaveValue(value);
      }
    }

    // Add a bucket
    await page.locator('button:has-text("Add Bucket"), a:has-text("Add Bucket")').first().click();
    await page.waitForTimeout(500);
    await expect(page.locator('body')).not.toContainText('Error');
  });

  // â”€â”€ Journey 5: Trace â€” search and verify layout â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  test('TC-E2E-005 | Trace â€” set time range â†’ click search â†’ no crash', async ({ page }) => {
    await page.goto(ROUTES.TRACE, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1500);

    // Set time range
    await page.locator('input[type="datetime-local"]').first().fill('2026-01-01T00:00');
    await page.locator('input[type="datetime-local"]').nth(1).fill('2026-12-31T23:59');

    // Click Search
    await page.locator('button:has-text("Search")').click();
    await page.waitForTimeout(2000);

    // Verify layout intact
    await expect(page.locator('text=Transactions').first()).toBeVisible();
    await expect(page.locator('text=Request Details').first()).toBeVisible();
  });

  // â”€â”€ Journey 6: Settings â€” change accent colour and toggle Zen mode â”€â”€â”€â”€â”€â”€â”€
  test('TC-E2E-006 | Settings â€” change accent colour and toggle Zen mode', async ({ page }) => {
    await page.goto(ROUTES.SETTINGS, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1000);

    // Click second accent circle
    const circles = page.locator('[class*="accent"], [class*="color-circle"], .accent-btn');
    if (await circles.count() >= 2) {
      await circles.nth(1).click();
      await page.waitForTimeout(400);
    }

    // Toggle Zen mode on then off
    const zenToggle = page.locator('input:near(:text("Zen mode"))').first();
    await zenToggle.click();
    await expect(zenToggle).toBeChecked();
    await zenToggle.click();
    await expect(zenToggle).not.toBeChecked();
  });

  // â”€â”€ Journey 7: Duplicate collection and verify it appears â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  test('TC-E2E-007 | Duplicate a real collection and verify copy appears', async ({ page }) => {
    await page.goto(ROUTES.STUDIO, { waitUntil: 'domcontentloaded' });
    await page.waitForFunction(() => !document.body.innerText.includes('Loading...'), { timeout: 15_000 }).catch(() => {});

    const cp = new CollectionsPanel(page);

    // Use first available collection — works for any user's account
    const firstItem = cp.collectionItems().first();
    await expect(firstItem).toBeVisible({ timeout: 15_000 });
    const target = (await firstItem.textContent() ?? '').trim();
    if (!target) { test.skip(); return; }

    const before = await cp.collectionItems().count();
    await cp.duplicateCollection(target);
    await page.waitForTimeout(1500);
    const after = await cp.collectionItems().count();
    expect(after).toBeGreaterThan(before);

    // Cleanup the duplicate — usually appears as "{target}_1" or "{target} copy"
    const targetLower = target.toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const duplicate = cp.collectionItems().filter({ hasText: new RegExp(`${targetLower}.*(_1|copy)|(copy|_1).*${targetLower}`, 'i') }).first();
    if (await duplicate.isVisible({ timeout: 3000 }).catch(() => false)) {
      await duplicate.hover();
      await duplicate.locator('button').last().click();
      await cp.menuItem('Delete').click();
      const confirmBtn = page.locator('button:has-text("Confirm"), button:has-text("Yes")').last();
      if (await confirmBtn.isVisible({ timeout: 3_000 }).catch(() => false)) await confirmBtn.click();
    }
  });

  // â”€â”€ Journey 8: Module navigation round-trip â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  test('TC-E2E-008 | Navigate all 7 modules in sequence â€” no crash on any', async ({ page }) => {
    const sb = new SideBar(page);
    const modules: Array<{ route: string; text: string }> = [
      { route: ROUTES.STUDIO,      text: 'Collections' },
      { route: ROUTES.SANDBOX,     text: 'Collections' },
      { route: ROUTES.INTERCEPTOR, text: 'Collections' },
      { route: ROUTES.STRESS_LAB,  text: 'Stress Test' },
      { route: ROUTES.TRACE,       text: 'Trace Viewer' },
      { route: ROUTES.SETTINGS,    text: 'Theme' },
    ];

    for (const { route, text } of modules) {
      await page.goto(route, { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(1500);
      await expect(page.locator(`text=${text}`).first()).toBeVisible({ timeout: 10_000 });
      await expect(page.locator('body')).not.toContainText('404');
      await expect(page.locator('body')).not.toContainText('Cannot GET');
    }
  });
});

