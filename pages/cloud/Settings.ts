import { Page, expect } from '@playwright/test';

export class Settings {
  constructor(readonly page: Page) {}

  themeHeading     = () => this.page.getByRole('heading', { name: 'Theme' });
  backgroundLabel  = () => this.page.locator('text=Background').first();
  systemThemeBtn   = () => this.page.locator('button[title*="system" i], button[aria-label*="system" i]').first();
  lightThemeBtn    = () => this.page.locator('button[title*="light" i], button[aria-label*="light" i]').first();
  darkThemeBtn     = () => this.page.locator('button[title*="dark" i], button[aria-label*="dark" i]').first();
  accentColorLabel = () => this.page.locator('text=Accent color').first();
  accentCircles    = () => this.page.locator('[class*="accent"], [class*="color-circle"], .accent-btn');
  fontSizeDropdown = () => this.page.locator('text=Small').first();
  languageDropdown = () => this.page.locator('text=English').first();

  telemetryToggle   = () => this.page.locator('[role="switch"]:near(:text("Telemetry")), input:near(:text("Telemetry")), label:has-text("Telemetry") input').first();
  expandNavToggle   = () => this.page.locator('[role="switch"]:near(:text("Expand navigation")), input:near(:text("Expand navigation")), label:has-text("Expand navigation") input').first();
  sidebarLeftToggle = () => this.page.locator('[role="switch"]:near(:text("Sidebar on left")), input:near(:text("Sidebar on left")), label:has-text("Sidebar on left") input').first();
  zenModeToggle     = () => this.page.locator('[role="switch"]:near(:text("Zen mode")), input:near(:text("Zen mode")), label:has-text("Zen mode") input').first();
  pposToggle        = () => this.page.locator('[role="switch"]:near(:text("PPOS")), input:near(:text("PPOS")), label:has-text("PPOS") input').first();
  tableViewToggle   = () => this.page.locator('[role="switch"]:near(:text("Table View")), input:near(:text("Table View")), label:has-text("Table View") input').first();

  integrationsHeading  = () => this.page.getByRole('heading', { name: 'Integrations' });
  integrationRow       = (name: string) => this.page.locator('div').filter({ has: this.page.getByRole('heading', { name, level: 4 }) }).filter({ has: this.page.locator('button') }).last();
  integrationToggle    = (name: string) => this.integrationRow(name).locator('input[type="checkbox"], [role="switch"]').first();
  integrationConfigBtn = (name: string) => this.integrationRow(name).locator('button').first();
  disabledLabel        = (name: string) => this.integrationRow(name).locator('text=Disabled').first();

  async selectTheme(theme: 'System' | 'Light' | 'Dark') {
    if (theme === 'System') await this.systemThemeBtn().click();
    else if (theme === 'Light') await this.lightThemeBtn().click();
    else await this.darkThemeBtn().click();
  }

  async selectAccentColor(index: number) { await this.accentCircles().nth(index).click(); }
  async toggleZenMode() {
    const t = this.zenModeToggle();
    if (await t.isVisible({ timeout: 2_000 }).catch(() => false)) {
      await t.click();
    } else {
      await this.page.locator('text=Zen mode').first().click();
    }
  }

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
    for (const name of ['AI Configuration','Slack','Jira','Teams','WhatsApp','Email']) {
      await expect(this.page.getByRole('heading', { name, level: 4 })).toBeVisible();
    }
  }

  async assertIntegrationsDisabledByDefault() {
    // AI Configuration is Enabled by default; all others are Disabled
    for (const name of ['Slack','Jira','Teams','WhatsApp','Email']) {
      await expect(this.disabledLabel(name)).toBeVisible();
    }
  }
}
