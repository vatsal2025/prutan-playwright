import { Page, expect } from '@playwright/test';

export class TopBar {
  constructor(readonly page: Page) {}

  logo              = () => this.page.locator('img[alt*="PruTAN"], .logo, a:has-text("PruTAN")').first();
  loginBtn          = () => this.page.locator('button:has-text("Login"), .login-btn').first();
  defaultAgentBtn   = () => this.page.locator('button:has-text("Default Agent"), [data-testid="default-agent"]').first();
  selectEnvBtn      = () => this.page.locator('button:has-text("Select Environment"), [data-testid="env-selector"]').first();
  accountIcon       = () => this.page.locator('button[title*="account" i], .account-icon, button[aria-label*="account" i]').first();
  myWorkspaceLink   = () => this.page.locator('a:has-text("My Workspace"), button:has-text("My Workspace")').first();
  userAvatar        = () => this.page.locator('[class*="avatar"], .user-avatar, [data-testid="user-avatar"]').first();
  passwordBanner    = () => this.page.locator('text=Kindly change your default password').first();
  changePasswordBtn = () => this.page.locator('button:has-text("Change Password")').first();
  dismissBannerBtn  = () => this.page.locator('button:has-text("Dismiss")').first();

  async clickLogin() { await this.loginBtn().click(); }

  async openDefaultAgent() {
    await this.defaultAgentBtn().click();
    await this.page.waitForSelector('[role="listbox"], .dropdown-panel', { state: 'visible' });
  }

  async openSelectEnvironment() {
    await this.selectEnvBtn().click();
    await this.page.waitForSelector('[role="listbox"], .env-dropdown', { state: 'visible' });
  }

  async selectEnvironment(name: string) {
    await this.openSelectEnvironment();
    await this.page.locator('[role="option"], .env-item').filter({ hasText: name }).click();
  }

  async dismissPasswordBanner() {
    if (await this.dismissBannerBtn().isVisible({ timeout: 2_000 }).catch(() => false)) {
      await this.dismissBannerBtn().click();
    }
  }

  async openMyWorkspace() { await this.myWorkspaceLink().click(); }

  async assertLoggedIn() {
    await expect(this.userAvatar().or(this.myWorkspaceLink())).toBeVisible({ timeout: 10_000 });
    await expect(this.loginBtn()).not.toBeVisible();
  }

  async assertLoggedOut() { await expect(this.loginBtn()).toBeVisible(); }
  async assertPasswordBannerVisible() { await expect(this.passwordBanner()).toBeVisible(); }
  async assertDefaultAgentVisible() { await expect(this.defaultAgentBtn()).toBeVisible(); }
  async assertEnvironmentSelected(name: string) { await expect(this.selectEnvBtn()).toContainText(name); }
}
