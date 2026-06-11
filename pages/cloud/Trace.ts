import { Page, expect } from '@playwright/test';

export class Trace {
  constructor(readonly page: Page) {}

  heading             = () => this.page.locator('h1:has-text("Trace Viewer"), text=Trace Viewer').first();
  subtitle            = () => this.page.locator('text=Search requests by trace ID').first();
  searchInput         = () => this.page.locator('input[placeholder*="BOI" i], input[placeholder*="trace" i]').first();
  timeRangeFrom       = () => this.page.locator('input[type="datetime-local"]').first();
  timeRangeTo         = () => this.page.locator('input[type="datetime-local"]').nth(1);
  searchBtn           = () => this.page.locator('button:has-text("Search")').first();
  transactionsPanel   = () => this.page.locator('text=Transactions').first();
  requestDetailsPanel = () => this.page.locator('text=Request Details').first();
  noRequestSelected   = () => this.page.locator('text=No Request Selected').first();
  noRequestSubtext    = () => this.page.locator('text=Select a request from the list').first();
  loadingSpinner      = () => this.page.locator('text=Loading...').first();
  transactionRows     = () => this.page.locator('[class*="transaction-row"], [data-testid="txn-row"], .txn-item');

  async searchByTraceId(traceId: string) {
    await this.searchInput().fill(traceId);
    await this.searchBtn().click();
    await this.loadingSpinner().waitFor({ state: 'hidden', timeout: 15_000 }).catch(() => {});
  }

  async setTimeRange(from: string, to: string) {
    await this.timeRangeFrom().fill(from);
    await this.timeRangeTo().fill(to);
  }

  async clickSearch()             { await this.searchBtn().click(); }
  async selectTransaction(i = 0) { await this.transactionRows().nth(i).click(); }

  async assertPageLoaded() {
    await expect(this.heading()).toBeVisible({ timeout: 15_000 });
    await expect(this.subtitle()).toBeVisible();
  }

  async assertSearchControlsVisible() {
    await expect(this.searchInput()).toBeVisible();
    await expect(this.timeRangeFrom()).toBeVisible();
    await expect(this.timeRangeTo()).toBeVisible();
    await expect(this.searchBtn()).toBeVisible();
  }

  async assertSplitPanelsVisible() {
    await expect(this.transactionsPanel()).toBeVisible();
    await expect(this.requestDetailsPanel()).toBeVisible();
  }

  async assertNoRequestSelectedState() {
    await expect(this.noRequestSelected()).toBeVisible();
    await expect(this.noRequestSubtext()).toBeVisible();
  }
}
