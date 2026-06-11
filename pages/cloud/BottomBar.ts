import { Page, expect } from '@playwright/test';

export class BottomBar {
  constructor(readonly page: Page) {}

  helpFeedbackBtn   = () => this.page.locator('button:has-text("Help & feedback"), a:has-text("Help & feedback")').first();
  proxyIcon         = () => this.page.locator('button[title*="proxy" i], button[title*="cookie" i], .proxy-btn').first();
  trashIcon         = () => this.page.locator('button[title*="clear" i], button[aria-label*="trash" i], .bottom-trash').first();
  lightningIcon     = () => this.page.locator('button[title*="intercept" i], button[aria-label*="intercept" i], .lightning-btn').first();
  splitViewBtn      = () => this.page.locator('button[title*="split" i], button[aria-label*="split" i], .split-view-btn').first();
  expandBtn         = () => this.page.locator('button[title*="expand" i], button[aria-label*="fullscreen" i], .expand-btn').first();
  leftSidebarToggle = () => this.page.locator('button[title*="sidebar" i], .sidebar-toggle-bottom').first();

  async clickHelpFeedback() { await this.helpFeedbackBtn().click(); }
  async toggleSplitView()   { await this.splitViewBtn().click(); }
  async assertVisible()     { await expect(this.helpFeedbackBtn()).toBeVisible(); }
}
