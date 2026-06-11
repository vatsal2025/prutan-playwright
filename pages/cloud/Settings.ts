import { Page, expect } from '@playwright/test';

export class Settings {
  constructor(readonly page: Page) {}

  themeHeading     = () => this.page.locator('h1:has-text("Theme"), text=Theme').first();
  backgroundLabel  = () => this.page.locator('text=Background').first();
  systemThemeBtn   = () => this.page.locator('button[title*="system" i], button[aria-label*="system" i]').first();
  lightThemeBtn    = () => this.page.locator('button[title*="light" i], button[aria-label*="light" i]').first();
  darkThemeBtn     = () => this.page.locator('button[title*="dark" i], button[aria-label*="dark" i]').first();
  accentColorLabel = () => this.page.locator('text=Accent color').first();
  accentCircles    = () => this.page.locator('[class*="accent"], [class*="color-circle"], .accent-btn');
  fontSizeDropdown = () => this.page.locator('select:near(:text("Font size")), [data-testid="font-size"]').first();
  languageDropdown = () => this.page.locator('select:near(:text("Language")), [data-testid="language"]').first();

  telemetryToggle   = () => this.page.locator('label:has-text("Telemetry") input[type="checkbox"], input:near(:text("Telemetry"))').first();
  expandNavToggle   = () => this.page.locator('label:has-text("Expand navigation") input, input:near(:text("Expand navigation"))').first();
  sidebarLeftToggle = () => this.page.locator('label:has-text("Sidebar on left") input, input:near(:text("Sidebar on left"))').first();
  zenModeToggle     = () => this.page.locator('label:has-text("Zen mode") input, input:near(:text("Zen mode"))').first();
  pposToggle        = () => this.page.locator('label:has-text("PPOS") input, input:near(:text("PPOS"))').first();
  tableViewToggle   = () => this.page.locator('label:has-text("Table View") input, input:near(:text("Table View"))').first();

  integrationsHeading  = () => this.page.locator('h1:has-text("Integrations"), h2:has-text("Integrations"), text=Integrations').first();
  integrationRow       = (name: string) => this.page.locator('[class*="integration-row"], .integration-item').filter({ hasText: name }).first();
  integrationToggle    = (name: string) => this.integrationRow(name).locator('input[type="checkbox"], [role="switch"]').first();
  integrationConfigBtn = (name: string) => this.integrationRow(name).locator('button[title*="configure" i], .config-btn').first();
  disabledLabel        = (name: string) => this.integrationRow(name).locator('text=Disabled').first();

  async selectTheme(theme: 'System' | 'Light' | 'Dark') {
    if (theme === 'System') await this.systemThemeBtn().click();
    else if (theme === 'Light') await this.lightThemeBtn().click();
    else await this.darkThemeBtn().click();
  }

  async selectAccentColor(index: number) { await this.accentCircles().nth(index).click(); }
  async toggleZenMode() { await this.zenModeToggle().click(); }

  async enableIntegration(name: string) {
    const toggle = this.integrationToggle(name);
    if (!(await toggle.isChecked())) await toggle.click();
  }

  async assertPageLoaded()            { await expect(this.themeHeading()).toBeVisible({ timeout: 15_000 }); }
  async assertIntegrationsSectionVisible() { await expect(this.integrationsHeading()).toBeVisible(); }

  async assertThemeControlsVisible() {
    await expect(this.backgroundLabel()).toBeVisible();
    await expect(this.accentColorLabel()).toBeVisible();
    await expect(this.fontSizeDropdown()).toBeVisible();
    await expect(this.languageDropdown()).toBeVisible();
  }

  async assertAllTogglesVisible() {
    for (const lbl of ['Telemetry','Expand navigation','Sidebar on left','Zen mode','PPOS','Table View']) {
      await expect(this.page.locator(`text=${lbl}`).first()).toBeVisible();
    }
  }

  async assertAllIntegrationsListed() {
    for (const name of ['WISO Configuration','Slack','Jira','Teams','WhatsApp','Email']) {
      await expect(this.page.locator(`text=${name}`).first()).toBeVisible();
    }
  }

  async assertIntegrationsDisabledByDefault() {
    for (const name of ['WISO Configuration','Slack','Jira','Teams','WhatsApp','Email']) {
      await expect(this.disabledLabel(name)).toBeVisible();
    }
  }
}
