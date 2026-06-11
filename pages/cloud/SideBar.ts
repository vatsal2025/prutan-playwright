import { Page, expect } from '@playwright/test';
import { ROUTES } from '../../utils/cloud-constants';

export class SideBar {
  constructor(readonly page: Page) {}

  studioBtn      = () => this.page.locator('.sidebar a:has-text("Studio"), [data-module="studio"], nav li:has-text("Studio")').first();
  sandboxBtn     = () => this.page.locator('.sidebar a:has-text("Sandbox"), [data-module="sandbox"], nav li:has-text("Sandbox")').first();
  interceptorBtn = () => this.page.locator('.sidebar a:has-text("Interceptor"), [data-module="interceptor"]').first();
  stressLabBtn   = () => this.page.locator('.sidebar a:has-text("Stress"), [data-module="stress"]').first();
  traceBtn       = () => this.page.locator('.sidebar a:has-text("Trace"), [data-module="trace"]').first();
  wisoBtn        = () => this.page.locator('.sidebar a:has-text("WISO"), [data-module="wiso"]').first();
  settingsBtn    = () => this.page.locator('.sidebar a:has-text("Settings"), [data-module="settings"]').first();

  async goToStudio()      { await this.studioBtn().click();      await this.page.waitForURL(/home\/collections/); }
  async goToSandbox()     { await this.sandboxBtn().click();     await this.page.waitForURL(/host\/collections/); }
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
    const active = this.page.locator('.sidebar [class*="active"], nav li[aria-current]').filter({ hasText: module });
    await expect(active).toBeVisible();
  }
}
