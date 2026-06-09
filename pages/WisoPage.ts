import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';

export class WisoPage extends BasePage {
  readonly url = '#/genai';

  get promptInput(): Locator {
    return this.page.locator('textarea, [placeholder*="Ask"], [placeholder*="prompt"]').first();
  }

  get sendButton(): Locator {
    return this.page.locator('button').filter({ hasText: /Send|Ask/i }).first();
  }

  get responseArea(): Locator {
    return this.page.locator('[class*="chat-response"], [class*="genai-response"], [class*="answer"]').first();
  }

  get connectionStatus(): Locator {
    return this.page.locator('[class*="connected"], [class*="status"]').first();
  }

  async open(): Promise<void> {
    await this.goto(this.url, 2000);
  }

  async isConnected(): Promise<boolean> {
    const body = await this.bodyText();
    return body.toLowerCase().includes('connected') && !body.toLowerCase().includes('disconnected');
  }

  async sendPrompt(text: string, waitMs = 8000): Promise<string> {
    await this.promptInput.fill(text);
    await this.sendButton.click();
    await this.page.waitForTimeout(waitMs);
    return this.responseArea.innerText().catch(() => '');
  }

  async expectConnected(): Promise<void> {
    const connected = await this.isConnected();
    expect(connected).toBe(true);
  }

  async openCollection(collection: string, request: string): Promise<void> {
    await this.expandCollection(collection);
    await this.openRequest(request);
  }
}
