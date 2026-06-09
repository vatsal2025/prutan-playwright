import { Page, Locator, expect } from '@playwright/test';

export abstract class BasePage {
  /** Base app URL — set per project in the fixture */
  private appBase: string = '';

  constructor(public page: Page) {}

  /** Called by fixture after initial navigation so BasePage knows the app origin */
  setAppBase(base: string): void {
    this.appBase = base;
  }

  /**
   * Navigate using Angular hash routing.
   * If the page is not yet on the app, do a full goto first.
   */
  async goto(hashPath: string, waitMs = 1500): Promise<void> {
    const currentUrl = this.page.url();
    const onApp = this.appBase && currentUrl.startsWith(this.appBase.replace(/\/$/, '').replace(/#.*$/, ''));

    if (!onApp && this.appBase) {
      await this.page.goto(`${this.appBase.replace(/\/$/, '')}/${hashPath.replace(/^\//, '')}`, {
        waitUntil: 'domcontentloaded',
        timeout: 30_000,
      });
    } else {
      await this.page.evaluate((h) => { window.location.hash = h; }, hashPath);
    }
    await this.page.waitForTimeout(waitMs);
  }

  /** Wait for Angular loading spinners to clear */
  async waitForLoad(): Promise<void> {
    await this.page.waitForLoadState('networkidle', { timeout: 20_000 }).catch(() => {});
    await this.page.waitForSelector('.loading-overlay', { state: 'hidden', timeout: 10_000 }).catch(() => {});
  }

  /** Get the first visible tab with the given label text */
  tab(label: string): Locator {
    return this.page.locator('.mat-mdc-tab-labels').getByText(label).first();
  }

  /** Click a tab by label */
  async clickTab(label: string): Promise<void> {
    await this.tab(label).click();
    await this.page.waitForTimeout(800);
  }

  /** Get body text for simple assertions */
  async bodyText(): Promise<string> {
    return this.page.innerText('body');
  }

  /** Screenshot helper */
  async screenshot(name: string): Promise<void> {
    await this.page.screenshot({
      path: `test-results/screenshots/${name}.png`,
      fullPage: true,
    });
  }

  /** Expand a collection in the sidebar by its name */
  async expandCollection(name: string): Promise<void> {
    await this.page.getByText(name).first().click({ force: true });
    await this.page.waitForTimeout(600);
  }

  /** Open a request inside an expanded collection */
  async openRequest(name: string): Promise<void> {
    await this.page.getByText(name).first().click({ force: true });
    await this.page.waitForTimeout(800);
  }
}
