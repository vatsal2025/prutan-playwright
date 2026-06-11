import { Page, expect } from '@playwright/test';

export class CollectionsPanel {
  constructor(readonly page: Page) {}

  breadcrumbWorkspace = () => this.page.locator('text=My Workspace').first();
  breadcrumbColl      = () => this.page.locator('text=Collections').nth(1);
  searchInput         = () => this.page.locator('input[placeholder*="Search"], input[placeholder*="search"]').first();
  newBtn              = () => this.page.locator('button:has-text("New"), [data-testid="new-collection"]').first();
  docsBtn             = () => this.page.locator('button[title*="documentation" i], button[aria-label*="doc" i]').first();
  trashBtn            = () => this.page.locator('button[title*="trash" i], button[aria-label*="delete all" i], .trash-btn').first();
  collectionItems     = () => this.page.locator('li[class*="collection"], [data-testid="collection-row"], .collection-item');
  collectionByName    = (name: string) => this.page.locator('li, [class*="collection-item"]').filter({ hasText: name }).first();
  expandArrow         = (name: string) => this.collectionByName(name).locator('[class*="arrow"], [class*="chevron"], svg').first();
  moreMenuBtn         = (name: string) => this.collectionByName(name).locator('button').last();
  addFolderIcon       = (name: string) => this.collectionByName(name).locator('button').nth(-2);
  loadingSpinner      = () => this.page.locator('text=Loading...').first();

  newCollModal      = () => this.page.locator('[role="dialog"], .modal').filter({ hasText: 'New Collection' }).first();
  newCollLabelInput = () => this.page.locator('input[placeholder*="label" i], input[name="label"]').first();
  newCollSaveBtn    = () => this.page.locator('[role="dialog"] button:has-text("Save"), .modal button:has-text("Save")').first();
  newCollCancelBtn  = () => this.page.locator('[role="dialog"] button:has-text("Cancel")').first();

  contextMenu = () => this.page.locator('[role="menu"], ul.context-menu, .dropdown-menu').first();
  menuItem    = (label: string) => this.page.locator('[role="menuitem"], li.menu-item').filter({ hasText: label }).first();

  newRequestModal   = () => this.page.locator('[role="dialog"]').filter({ hasText: 'New Request' }).first();
  newRequestLabel   = () => this.page.locator('[role="dialog"] input[placeholder*="label" i]').first();
  newRequestSaveBtn = () => this.page.locator('[role="dialog"] button:has-text("Save")').first();

  runModal = () => this.page.locator('[role="dialog"]').filter({ hasText: 'Run' }).first();

  async waitForLoad() {
    await this.loadingSpinner().waitFor({ state: 'hidden', timeout: 20_000 }).catch(() => {});
  }

  async search(query: string) { await this.searchInput().fill(query); }
  async clearSearch()         { await this.searchInput().clear(); }

  async clickNew() {
    await this.newBtn().click();
    await this.newCollModal().waitFor({ state: 'visible' });
  }

  async createCollection(label: string) {
    await this.clickNew();
    await this.newCollLabelInput().fill(label);
    await this.newCollSaveBtn().click();
    await this.newCollModal().waitFor({ state: 'hidden', timeout: 8_000 });
  }

  async cancelNewCollection(label?: string) {
    await this.clickNew();
    if (label) await this.newCollLabelInput().fill(label);
    await this.newCollCancelBtn().click();
  }

  async expandCollection(name: string) {
    await this.collectionByName(name).hover();
    await this.expandArrow(name).click();
    await this.page.waitForTimeout(500);
  }

  async openContextMenu(name: string) {
    await this.collectionByName(name).hover();
    await this.moreMenuBtn(name).click();
    await this.contextMenu().waitFor({ state: 'visible' });
  }

  async clickContextMenuItem(name: string, item: string) {
    await this.openContextMenu(name);
    await this.menuItem(item).click();
  }

  async addNewRequest(collectionName: string, requestLabel: string) {
    await this.clickContextMenuItem(collectionName, 'New Request');
    await this.newRequestModal().waitFor({ state: 'visible' });
    await this.newRequestLabel().fill(requestLabel);
    await this.newRequestSaveBtn().click();
    await this.newRequestModal().waitFor({ state: 'hidden', timeout: 8_000 });
  }

  async runCollection(name: string)       { await this.clickContextMenuItem(name, 'Run Collection'); }
  async editCollection(name: string)      { await this.clickContextMenuItem(name, 'Edit'); }
  async exportCollection(name: string)    { await this.clickContextMenuItem(name, 'Export'); }
  async duplicateCollection(name: string) { await this.clickContextMenuItem(name, 'Duplicate'); }
  async deleteCollection(name: string)    { await this.clickContextMenuItem(name, 'Delete'); }

  async clickDocsBtn() {
    const [newPage] = await Promise.all([
      this.page.context().waitForEvent('page'),
      this.docsBtn().click(),
    ]);
    return newPage;
  }

  async assertCollectionVisible(name: string) {
    await expect(this.collectionByName(name)).toBeVisible({ timeout: 10_000 });
  }

  async assertCollectionNotVisible(name: string) {
    await expect(this.collectionByName(name)).not.toBeVisible();
  }

  async assertContextMenuItems() {
    const items = ['New Request','New Folder','Run Collection','Edit','Export','Upload','Duplicate','Delete'];
    for (const item of items) {
      await expect(this.menuItem(item)).toBeVisible();
    }
  }

  async assertSearchFilters(query: string) {
    await this.search(query);
    const visible = await this.collectionItems().allTextContents();
    for (const t of visible) {
      expect(t.toLowerCase()).toContain(query.toLowerCase());
    }
  }
}
