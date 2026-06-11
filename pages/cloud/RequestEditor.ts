import { Page, expect } from '@playwright/test';

export class RequestEditor {
  constructor(readonly page: Page) {}

  restTab      = () => this.page.locator('[role="tab"]:has-text("Rest"), .tab-item:has-text("Rest")').first();
  isoTab       = () => this.page.locator('[role="tab"]:has-text("ISO"), .tab-item:has-text("ISO")').first();
  realtimeTab  = () => this.page.locator('[role="tab"]:has-text("Realtime"), .tab-item:has-text("Realtime")').first();

  methodDropdown = () => this.page.locator('button:has-text("GET"), button:has-text("POST"), .method-select, [data-testid="method-dropdown"]').first();
  urlInput       = () => this.page.locator('input[placeholder*="url" i], input[placeholder*="enter url" i], .url-input').first();
  portInput      = () => this.page.locator('input[placeholder*="port" i], input[type="number"][value="6666"]').first();
  sendBtn        = () => this.page.locator('button:has-text("Send"):not(:has-text("Pre"))').first();
  publishBtn     = () => this.page.locator('button:has-text("Publish")').first();
  saveBtn        = () => this.page.locator('button:has-text("Save"), [data-testid="save-btn"]').first();

  methodOption   = (m: string) => this.page.locator(`[role="option"]:has-text("${m}"), li:has-text("${m}")`).first();

  bodyTab            = () => this.page.locator('[role="tab"]:has-text("Body"), .editor-tab:has-text("Body")').first();
  parametersTab      = () => this.page.locator('[role="tab"]:has-text("Parameters"), .editor-tab:has-text("Parameters")').first();
  headersTab         = () => this.page.locator('[role="tab"]:has-text("Headers"), .editor-tab:has-text("Headers")').first();
  authorizationTab   = () => this.page.locator('[role="tab"]:has-text("Authorization"), .editor-tab:has-text("Authorization")').first();
  preRequestTab      = () => this.page.locator('[role="tab"]:has-text("Pre-request"), .editor-tab:has-text("Pre-request")').first();
  validationTab      = () => this.page.locator('[role="tab"]:has-text("Validation"), .editor-tab:has-text("Validation")').first();
  settingsTab        = () => this.page.locator('[role="tab"]:has-text("Settings"), .editor-tab:has-text("Settings")').first();

  // PruTAN uses a custom input#contentType dropdown, not a <select>
  contentTypeDropdown = () => this.page.locator('#contentType, input[placeholder*="content" i], [data-testid="content-type"]').first();
  bodyEditor          = () => this.page.locator('.cm-content, .body-editor, [data-testid="body-editor"]').first();
  bodyEmptyState      = () => this.page.locator('text=This request does not have a body').first();
  documentationLink   = () => this.page.locator('a:has-text("Documentation"), button:has-text("Documentation")').first();

  queryParamsSection  = () => this.page.locator('text=Query Parameters').first();
  headerListSection   = () => this.page.locator('text=Header List').first();

  authTypeDropdown    = () => this.page.locator('select, [data-testid="auth-type"], .auth-type-select').first();
  authEnabledCheckbox = () => this.page.locator('input[type="checkbox"]:near(:text("Enabled")), label:has-text("Enabled") input').first();
  authTypeOption      = (t: string) => this.page.locator(`[role="option"]:has-text("${t}"), li:has-text("${t}")`).first();
  noAuthMessage       = () => this.page.locator('text=This request does not use any authorization').first();

  rulesCodeEditor     = () => this.page.locator('.cm-content, .code-editor, [class*="code-editor"]').first();
  rulesSnippetSearch  = () => this.page.locator('input[placeholder*="rules snipp" i], input[placeholder*="snippet" i], input[placeholder*="Search rules" i]').first();
  rulesSnippetsPanel  = () => this.page.locator('text=Rules Snippets').first();

  sendRequestHint      = () => this.page.locator('text=Send Request').first();
  keyboardShortcutHint = () => this.page.locator('text=Keyboard shortcuts').first();
  helpMenuHint         = () => this.page.locator('text=Help menu').first();

  async switchToRest()     { await this.restTab().click(); }
  async switchToISO()      { await this.isoTab().click(); }
  async switchToRealtime() { await this.realtimeTab().click(); }

  async selectMethod(method: string) {
    await this.methodDropdown().click();
    await this.methodOption(method).click();
  }

  async setUrl(url: string) {
    await this.urlInput().click();
    await this.urlInput().selectText();
    await this.urlInput().fill(url);
  }

  async openBodyTab()          { await this.bodyTab().click(); }
  async openParametersTab()    { await this.parametersTab().click(); }
  async openHeadersTab()       { await this.headersTab().click(); }
  async openAuthorizationTab() { await this.authorizationTab().click(); }
  async openPreRequestTab()    { await this.preRequestTab().click(); }
  async openValidationTab()    { await this.validationTab().click(); }
  async openSettingsTab()      { await this.settingsTab().click(); }

  async selectAuthType(type: string) {
    await this.openAuthorizationTab();
    await this.authTypeDropdown().click();
    await this.authTypeOption(type).click();
  }

  async typePreRequestScript(code: string) {
    await this.openPreRequestTab();
    await this.rulesCodeEditor().click();
    await this.rulesCodeEditor().fill(code);
  }

  async assertAllProtocolTabsVisible() {
    await expect(this.restTab()).toBeVisible();
    await expect(this.isoTab()).toBeVisible();
    await expect(this.realtimeTab()).toBeVisible();
  }

  async assertMethodDropdownContains(methods: string[]) {
    await this.methodDropdown().click();
    for (const m of methods) {
      await expect(this.methodOption(m)).toBeVisible();
    }
    await this.page.keyboard.press('Escape');
  }

  async assertPortFieldVisibleOnISO() {
    await this.switchToISO();
    await expect(this.portInput()).toBeVisible();
  }

  async assertPublishBtnOnRealtime() {
    await this.switchToRealtime();
    await expect(this.publishBtn()).toBeVisible();
    await expect(this.sendBtn()).not.toBeVisible();
  }

  async assertBodyEmptyState()       { await expect(this.bodyEmptyState()).toBeVisible(); }
  async assertKeyboardHintsVisible() {
    await expect(this.sendRequestHint()).toBeVisible();
    await expect(this.keyboardShortcutHint()).toBeVisible();
    await expect(this.helpMenuHint()).toBeVisible();
  }
}
