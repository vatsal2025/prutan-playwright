import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';

export interface BucketConfig {
  users: number;
  duration: number;
}

export class StressLabPage extends BasePage {
  readonly url = '#/stress';

  get addBucketButton(): Locator {
    return this.page.locator('button').filter({ hasText: /Add Bucket/i }).first();
  }

  get addScriptsButton(): Locator {
    return this.page.locator('button').filter({ hasText: /Add Scripts/i }).first();
  }

  get runButton(): Locator {
    return this.page.locator('button').filter({ hasText: /^Run$|^Start$/i }).first();
  }

  get stopButton(): Locator {
    return this.page.locator('button').filter({ hasText: /^Stop$/i }).first();
  }

  get resultsArea(): Locator {
    return this.page.locator('[class*="stress-result"], [class*="report"], [class*="chart"]').first();
  }

  get virtualUsersInput(): Locator {
    return this.page.locator('[placeholder*="users"], [placeholder*="Users"], [name*="users"]').first();
  }

  get durationInput(): Locator {
    return this.page.locator('[placeholder*="duration"], [placeholder*="Duration"], [name*="duration"]').first();
  }

  async open(): Promise<void> {
    await this.goto(this.url);
  }

  async openCollection(collection: string, request: string): Promise<void> {
    await this.expandCollection(collection);
    await this.openRequest(request);
  }

  async addBucket(config?: Partial<BucketConfig>): Promise<void> {
    await this.addBucketButton.click();
    await this.page.waitForTimeout(600);

    if (config?.users) {
      await this.virtualUsersInput.fill(String(config.users)).catch(() => {});
    }
    if (config?.duration) {
      await this.durationInput.fill(String(config.duration)).catch(() => {});
    }
  }

  async addScript(js: string): Promise<void> {
    await this.addScriptsButton.click();
    await this.page.waitForTimeout(400);
    const editor = this.page.locator('[class*="script"] .cm-content, [class*="stress"] .cm-content').first();
    await editor.click().catch(() => {});
    await this.page.keyboard.press('Control+a');
    await this.page.keyboard.type(js);
  }

  async run(waitMs = 10_000): Promise<void> {
    await this.runButton.click({ force: true });
    await this.page.waitForTimeout(waitMs);
  }

  async stop(): Promise<void> {
    await this.stopButton.click({ force: true });
    await this.page.waitForTimeout(2000);
  }

  async expectPageLoaded(): Promise<void> {
    const body = await this.bodyText();
    expect(body.length).toBeGreaterThan(50);
    expect(body).not.toContain('404');
  }
}
