import { Page, expect } from '@playwright/test';

export class SideBar {
  constructor(readonly page: Page) {}

  private navBtn(textRe: RegExp) {
    return this.page.getByRole('link', { name: textRe }).first();
  }

  studioBtn      = () => this.navBtn(/studio/i);
  sandboxBtn     = () => this.navBtn(/sandbox/i);
  interceptorBtn = () => this.navBtn(/interceptor/i);
  stressLabBtn   = () => this.navBtn(/stress/i);
  traceBtn       = () => this.navBtn(/trace/i);
  wisoBtn        = () => this.navBtn(/wiso/i);
  settingsBtn    = () => this.navBtn(/settings/i);

  async goToStudio()      { await this.studioBtn().click();      await this.page.waitForURL(/home/); }
  async goToSandbox()     { await this.sandboxBtn().click();     await this.page.waitForURL(/host/); }
  async goToInterceptor() { await this.interceptorBtn().click(); await this.page.waitForURL(/interceptor/); }
  async goToStressLab()   { await this.stressLabBtn().click();   await this.page.waitForURL(/stress/); }
  async goToTrace()       { await this.traceBtn().click();       await this.page.waitForURL(/trace/); }
  async goToWiso()        { await this.wisoBtn().click(); }
  async goToSettings()    { await this.settingsBtn().click();    await this.page.waitForURL(/settings/); }

  async assertAllModulesVisible() {
    for (const btn of [
      this.studioBtn(), this.sandboxBtn(), this.interceptorBtn(),
      this.stressLabBtn(), this.traceBtn(), this.wisoBtn(), this.settingsBtn(),
    ]) {
      await expect(btn).toBeVisible();
    }
  }

  async assertActiveModule(module: string) {
    // Angular router adds .router-link-active to active routerLinks
    const active = this.page.locator('.router-link-active, [class*="active"]')
      .filter({ hasText: new RegExp(module, 'i') });
    await expect(active.first()).toBeVisible();
  }
}
