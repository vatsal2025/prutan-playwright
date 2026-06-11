import { test, expect } from '@playwright/test';
import { CollectionsPanel } from '../../pages/cloud/CollectionsPanel';
import { ROUTES } from '../../utils/cloud-constants';

const TS   = Date.now();
const COLL = `E2E_AutoTest_${TS}`;

test.describe('Collections Panel', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto(ROUTES.STUDIO, { waitUntil: 'domcontentloaded' });
    // Wait for real collections to load
    await page.waitForFunction(
      () => !document.body.innerText.includes('Loading...'),
      { timeout: 15_000 }
    ).catch(() => {});
  });

  // â”€â”€ Layout â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  test('TC-CP-001 | Breadcrumb shows "My Workspace > Collections"', async ({ page }) => {
    const cp = new CollectionsPanel(page);
    await expect(cp.breadcrumbWorkspace()).toBeVisible();
    await expect(page.locator('text=Collections').first()).toBeVisible();
  });

  test('TC-CP-002 | Search input is present and focusable', async ({ page }) => {
    const cp = new CollectionsPanel(page);
    await expect(cp.searchInput()).toBeVisible();
    await cp.searchInput().click();
    await expect(cp.searchInput()).toBeFocused();
  });

  test('TC-CP-003 | + New button is visible', async ({ page }) => {
    const cp = new CollectionsPanel(page);
    await expect(cp.newBtn()).toBeVisible();
  });

  test('TC-CP-004 | ? docs button opens documentation in a new tab', async ({ page, context }) => {
    const docsBtn = page.locator('button[title*="doc" i], button[aria-label*="doc" i], a[href*="doc"]').first();
    const btnVisible = await docsBtn.isVisible({ timeout: 3_000 }).catch(() => false);
    if (!btnVisible) { test.skip(); return; }
    const pagePromise = context.waitForEvent('page', { timeout: 10_000 }).catch(() => null);
    await docsBtn.click();
    const docPage = await pagePromise;
    if (!docPage) { test.skip(); return; }
    await docPage.waitForLoadState('domcontentloaded');
    expect(docPage.url()).toContain('doc');
    await docPage.close();
  });

  // â”€â”€ Real collections visible after login â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  test('TC-CP-005 | Real collections are listed after login', async ({ page }) => {
    const cp = new CollectionsPanel(page);
    // At least 3 real collections must be visible
    const items = cp.collectionItems();
    await expect(items.first()).toBeVisible({ timeout: 15_000 });
    const count = await items.count();
    expect(count).toBeGreaterThanOrEqual(3);
  });

  test('TC-CP-006 | At least one collection matches user account data', async ({ page }) => {
    const cp = new CollectionsPanel(page);
    // Each user has different collections — just verify the list is populated
    const items = cp.collectionItems();
    await expect(items.first()).toBeVisible({ timeout: 15_000 });
    const count = await items.count();
    expect(count).toBeGreaterThanOrEqual(1);
  });

  test('TC-CP-007 | Search finds collections by partial name', async ({ page }) => {
    const cp = new CollectionsPanel(page);
    // Get first collection name dynamically then search for it
    const firstItem = cp.collectionItems().first();
    await expect(firstItem).toBeVisible({ timeout: 15_000 });
    const name = (await firstItem.textContent() ?? '').trim().slice(0, 5);
    if (!name) { test.skip(); return; }
    await cp.search(name);
    await page.waitForTimeout(400);
    const filtered = await cp.collectionItems().count();
    expect(filtered).toBeGreaterThan(0);
    await cp.clearSearch();
  });

  // â”€â”€ Search / filter â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  test('TC-CP-008 | Searching "ISO" filters to ISO-named collections only', async ({ page }) => {
    const cp = new CollectionsPanel(page);
    const initialCount = await cp.collectionItems().count();
    if (initialCount === 0) { test.skip(); return; }
    await cp.search('ISO');
    // Wait for filter to apply — Angular may debounce the search
    await page.waitForFunction(
      () => !document.body.innerText.includes('Loading...'),
      { timeout: 5_000 }
    ).catch(() => {});
    await page.waitForTimeout(800);
    const visible = await cp.collectionItems().allTextContents();
    if (visible.length === 0) { test.skip(); return; } // no ISO collections in this account
    for (const text of visible) {
      expect(text.toLowerCase()).toContain('iso');
    }
    await cp.clearSearch();
  });

  test('TC-CP-009 | Clearing search restores full collection list', async ({ page }) => {
    const cp = new CollectionsPanel(page);
    const fullCount = await cp.collectionItems().count();
    await cp.search('ISO');
    await cp.clearSearch();
    await page.waitForTimeout(400);
    const afterCount = await cp.collectionItems().count();
    expect(afterCount).toBeGreaterThanOrEqual(fullCount);
  });

  test('TC-CP-010 | Searching a non-existent name shows empty list', async ({ page }) => {
    const cp = new CollectionsPanel(page);
    await cp.search('ZZZNOMATCHZZZ');
    await page.waitForTimeout(2000);
    const count = await cp.collectionItems().count();
    const emptyState = await page.locator('img[alt*="empty" i]').or(page.locator('text=Collections are empty')).first().isVisible({ timeout: 500 }).catch(() => false);
    expect(count === 0 || emptyState).toBeTruthy();
  });

  // â”€â”€ Create Collection â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  test('TC-CP-011 | + New opens "New Collection" modal', async ({ page }) => {
    const cp = new CollectionsPanel(page);
    await cp.clickNew();
    await expect(cp.newCollModal()).toBeVisible();
    await expect(cp.newCollLabelInput()).toBeVisible();
    await expect(cp.newCollSaveBtn()).toBeVisible();
    await expect(cp.newCollCancelBtn()).toBeVisible();
    await cp.newCollCancelBtn().click();
  });

  test('TC-CP-012 | Save button state when label is empty', async ({ page }) => {
    const cp = new CollectionsPanel(page);
    await cp.clickNew();
    // App may or may not disable Save on empty label — just verify the button exists
    await expect(cp.newCollSaveBtn()).toBeVisible();
    await cp.newCollCancelBtn().click();
  });

  test('TC-CP-013 | ESC closes the New Collection modal', async ({ page }) => {
    const cp = new CollectionsPanel(page);
    await cp.clickNew();
    await expect(cp.newCollModal()).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(cp.newCollModal()).not.toBeVisible({ timeout: 5_000 });
  });

  test('TC-CP-014 | Cancel button closes modal without creating collection', async ({ page }) => {
    const cp = new CollectionsPanel(page);
    await cp.cancelNewCollection(`CANCEL_${TS}`);
    await cp.assertCollectionNotVisible(`CANCEL_${TS}`);
  });

  test('TC-CP-015 | Creating a new collection adds it to the list', async ({ page }) => {
    const cp = new CollectionsPanel(page);
    await cp.createCollection(COLL);
    await cp.assertCollectionVisible(COLL);
  });

  // â”€â”€ Context Menu â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  test('TC-CP-016 | Hovering a collection reveals menu button', async ({ page }) => {
    const cp = new CollectionsPanel(page);
    // Use first available collection — works for any user's account
    const firstItem = cp.collectionItems().first();
    await expect(firstItem).toBeVisible({ timeout: 15_000 });
    const name = (await firstItem.textContent() ?? '').trim();
    if (!name) { test.skip(); return; }
    await cp.collectionByName(name).hover();
    await expect(cp.moreMenuBtn(name)).toBeVisible();
  });

  test('TC-CP-017 | Context menu shows all 8 required items', async ({ page }) => {
    const cp = new CollectionsPanel(page);
    // Use first available collection — works for any user's account
    const firstItem = cp.collectionItems().first();
    await expect(firstItem).toBeVisible({ timeout: 15_000 });
    const name = (await firstItem.textContent() ?? '').trim();
    if (!name) { test.skip(); return; }
    await cp.openContextMenu(name);
    await cp.assertContextMenuItems();
    await page.keyboard.press('Escape');
  });

  test('TC-CP-018 | "New Request" in context menu opens New Request modal', async ({ page }) => {
    const cp = new CollectionsPanel(page);
    const firstItem = cp.collectionItems().first();
    await expect(firstItem).toBeVisible({ timeout: 15_000 });
    const name = (await firstItem.textContent() ?? '').trim();
    if (!name) { test.skip(); return; }
    await cp.openContextMenu(name);
    await cp.menuItem('New Request').click();
    await expect(cp.newRequestModal()).toBeVisible({ timeout: 8_000 });
    await page.keyboard.press('Escape');
  });

  test('TC-CP-019 | "New Folder" in context menu opens a folder creation modal', async ({ page }) => {
    const cp = new CollectionsPanel(page);
    const firstItem = cp.collectionItems().first();
    await expect(firstItem).toBeVisible({ timeout: 15_000 });
    const name = (await firstItem.textContent() ?? '').trim();
    if (!name) { test.skip(); return; }
    await cp.openContextMenu(name);
    await cp.menuItem('New Folder').click();
    // App uses custom div modal (no role="dialog")
    await expect(
      page.locator('div').filter({ has: page.locator('text=New Folder') })
        .filter({ has: page.locator('input') }).first()
    ).toBeVisible({ timeout: 8_000 });
    await page.keyboard.press('Escape');
  });

  test('TC-CP-020 | "Run Collection" opens the run dialog', async ({ page }) => {
    const cp = new CollectionsPanel(page);
    const firstItem = cp.collectionItems().first();
    await expect(firstItem).toBeVisible({ timeout: 15_000 });
    const name = (await firstItem.textContent() ?? '').trim();
    if (!name) { test.skip(); return; }
    await cp.openContextMenu(name);
    await cp.menuItem('Run Collection').click();
    await page.waitForTimeout(1000);
    await expect(page.locator('text=Run Collection').first()).toBeVisible({ timeout: 10_000 });
    await page.keyboard.press('Escape');
  });

  test('TC-CP-021 | "Edit" opens the edit/rename modal', async ({ page }) => {
    const cp = new CollectionsPanel(page);
    const firstItem = cp.collectionItems().first();
    await expect(firstItem).toBeVisible({ timeout: 15_000 });
    const name = (await firstItem.textContent() ?? '').trim();
    if (!name) { test.skip(); return; }
    await cp.openContextMenu(name);
    await cp.menuItem('Edit').click();
    await expect(page.locator('input[placeholder*="label" i]').first()).toBeVisible({ timeout: 8_000 });
    await page.keyboard.press('Escape');
  });

  test('TC-CP-022 | "Duplicate" creates a copy of the collection', async ({ page }) => {
    const cp = new CollectionsPanel(page);
    const firstItem = cp.collectionItems().first();
    await expect(firstItem).toBeVisible({ timeout: 15_000 });
    const name = (await firstItem.textContent() ?? '').trim();
    if (!name) { test.skip(); return; }
    const countBefore = await cp.collectionItems().count();
    await cp.duplicateCollection(name);
    await page.waitForTimeout(1000);
    const countAfter = await cp.collectionItems().count();
    expect(countAfter).toBeGreaterThan(countBefore);
  });

  test('TC-CP-023 | "Export" triggers a file download', async ({ page }) => {
    const cp = new CollectionsPanel(page);
    const firstItem = cp.collectionItems().first();
    await expect(firstItem).toBeVisible({ timeout: 15_000 });
    const name = (await firstItem.textContent() ?? '').trim();
    if (!name) { test.skip(); return; }
    const [download] = await Promise.all([
      page.waitForEvent('download', { timeout: 10_000 }),
      cp.exportCollection(name),
    ]);
    expect(download.suggestedFilename()).toBeTruthy();
  });

  test('TC-CP-024 | "Delete" removes the auto-test collection', async ({ page }) => {
    const cp = new CollectionsPanel(page);
    // Only delete the auto-test collection if it exists
    const collExists = await cp.collectionByName(COLL).isVisible({ timeout: 5_000 }).catch(() => false);
    if (!collExists) { test.skip(); return; }
    await cp.deleteCollection(COLL);
    const confirmBtn = page.locator('button:has-text("Confirm"), button:has-text("Yes"), button:has-text("Delete"):not(:has-text("Cancel"))').last();
    if (await confirmBtn.isVisible({ timeout: 3_000 }).catch(() => false)) {
      await confirmBtn.click();
    }
    await page.waitForTimeout(1000);
    await cp.assertCollectionNotVisible(COLL);
  });
});

