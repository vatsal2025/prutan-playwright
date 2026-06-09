import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';

export interface TraceSearchOptions {
  identifier?: string;
  from?: string;
  to?: string;
}

export class TracePage extends BasePage {
  readonly url = '#/trace';

  get searchButton(): Locator {
    return this.page.locator('button').filter({ hasText: /^Search$/ }).first();
  }

  get identifierInput(): Locator {
    return this.page.locator('[placeholder*="identifier"], [placeholder*="Identifier"], [placeholder*="trace"]').first();
  }

  get fromDateInput(): Locator {
    return this.page.locator('[placeholder*="From"], input[type="datetime-local"]').first();
  }

  get toDateInput(): Locator {
    return this.page.locator('[placeholder*="To"], input[type="datetime-local"]').last();
  }

  get resultRows(): Locator {
    return this.page.locator('[class*="trace-row"], tr[class*="result"], tbody tr');
  }

  async open(): Promise<void> {
    await this.goto(this.url);
  }

  async search(opts: TraceSearchOptions = {}, waitMs = 5000): Promise<void> {
    if (opts.identifier) {
      await this.identifierInput.fill(opts.identifier).catch(() => {});
    }
    if (opts.from) {
      await this.fromDateInput.fill(opts.from).catch(() => {});
    }
    if (opts.to) {
      await this.toDateInput.fill(opts.to).catch(() => {});
    }
    await this.searchButton.click({ force: true });
    await this.page.waitForTimeout(waitMs);
  }

  async resultCount(): Promise<number> {
    return this.resultRows.count();
  }

  async expectNoError9999(): Promise<void> {
    const body = await this.bodyText();
    expect(body).not.toContain('9999');
    expect(body).not.toContain('unknown error');
  }

  async expectResultsFound(): Promise<void> {
    const count = await this.resultCount();
    expect(count).toBeGreaterThan(0);
  }
}
