import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';

export type SandboxFormat = 'REST' | 'ISO';

export class SandboxPage extends BasePage {
  readonly url = '#/host';

  get startButton(): Locator {
    return this.page.locator('button').filter({ hasText: /^Start$/ }).first();
  }

  get stopButton(): Locator {
    return this.page.locator('button').filter({ hasText: /^Stop$/ }).first();
  }

  get statusIndicator(): Locator {
    return this.page.locator('[class*="status"], [class*="connected"], [class*="running"]').first();
  }

  get rulesTab(): Locator {
    return this.tab('Rules');
  }

  get analyticsTab(): Locator {
    return this.tab('Analytics');
  }

  async open(format: SandboxFormat = 'REST'): Promise<void> {
    await this.goto(this.url);
    if (format === 'ISO') {
      await this.clickTab('ISO');
    }
  }

  async start(waitMs = 5000): Promise<void> {
    await this.startButton.click({ force: true });
    await this.page.waitForTimeout(waitMs);
  }

  async stop(): Promise<void> {
    await this.stopButton.click({ force: true });
    await this.page.waitForTimeout(2000);
  }

  async openCollection(collection: string, request: string): Promise<void> {
    await this.expandCollection(collection);
    await this.openRequest(request);
  }

  async viewRules(): Promise<void> {
    await this.rulesTab.click();
    await this.page.waitForTimeout(600);
  }

  async viewAnalytics(): Promise<void> {
    await this.analyticsTab.click();
    await this.page.waitForTimeout(600);
  }

  async addResponseRule(js: string): Promise<void> {
    await this.viewRules();
    await this.page.locator('button').filter({ hasText: /Add Rule|New Rule/ }).first().click();
    await this.page.waitForTimeout(400);
    const editor = this.page.locator('[class*="rule"] .cm-content').first();
    await editor.click();
    await this.page.keyboard.press('Control+a');
    await this.page.keyboard.type(js);
  }

  async expectStarted(): Promise<void> {
    const body = await this.bodyText();
    expect(body).not.toContain('error');
    expect(body).not.toContain('Error');
  }

  async analyticsHasEntries(): Promise<boolean> {
    await this.viewAnalytics();
    const body = await this.bodyText();
    return !body.includes('No data') && !body.includes('empty');
  }
}
