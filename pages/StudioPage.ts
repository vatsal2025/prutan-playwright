import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';

export type RestMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'HEAD' | 'OPTIONS';
// Tab labels exactly as shown in the PruTAN UI
export type StudioFormat = 'Rest' | 'ISO' | 'Realtime';

export class StudioPage extends BasePage {
  readonly url = '#/home/collections';

  // ── Locators ──────────────────────────────────────────────────────────────

  get urlInput(): Locator {
    return this.page.locator('input[placeholder="enter url"]').first();
  }

  get sendButton(): Locator {
    // Substring match — button contains icon alongside "Send" text
    return this.page.locator('button').filter({ hasText: 'Send' }).first();
  }

  get saveButton(): Locator {
    return this.page.locator('button').filter({ hasText: 'Save' }).first();
  }

  get responseStatusBar(): Locator {
    // "Status: 200  •  OK  Time: ...  Size: ..." bar that appears after send
    return this.page.locator('text=Status:').first();
  }

  get bodyEditor(): Locator {
    return this.page.locator('.cm-content').first();
  }

  // ── Request tab clicking (Body/Parameters/Headers/Authorization/Pre-request Script) ──

  private async clickRequestTab(name: string): Promise<void> {
    // Angular Material tabs render as button[role="tab"] or a[role="tab"]
    await this.page.getByRole('tab', { name }).first().click();
    await this.page.waitForTimeout(500);
  }

  // ── Navigation ────────────────────────────────────────────────────────────

  async open(): Promise<void> {
    await this.goto(this.url);
  }

  /** Switch top format tab — use exact UI labels: 'Rest', 'ISO', 'Realtime' */
  async switchFormat(format: StudioFormat): Promise<void> {
    await this.clickTab(format);
  }

  // ── Override tab() for PruTAN's Angular Material tab structure ─────────────
  override tab(label: string): Locator {
    // Handles both mat-tab-nav-bar (anchor links) and mat-tab-group (buttons)
    return this.page
      .locator(`[class*="mat-mdc-tab"]:has-text("${label}"), [role="tab"]:has-text("${label}")`)
      .first();
  }

  // ── Request building ──────────────────────────────────────────────────────

  async setUrl(url: string): Promise<void> {
    await this.urlInput.click({ clickCount: 3 });
    await this.urlInput.fill(url);
  }

  async setMethod(method: RestMethod): Promise<void> {
    await this.page.locator('#method').click({ force: true });
    await this.page.waitForTimeout(400);
    await this.page
      .locator(`.select-wrapper li, li, [role="option"], button`)
      .filter({ hasText: new RegExp(`^${method}$`, 'i') })
      .first()
      .click({ timeout: 5000 });
    await this.page.waitForTimeout(300);
  }

  async setBody(jsonBody: object | string): Promise<void> {
    const content = typeof jsonBody === 'string' ? jsonBody : JSON.stringify(jsonBody, null, 2);
    await this.clickRequestTab('Body');

    // Content Type is a custom input#contentType — click it then pick application/json
    await this.page.locator('#contentType').click({ force: true, timeout: 5000 });
    await this.page.waitForTimeout(400);
    await this.page.getByText('application/json', { exact: true }).first().click({ timeout: 5000 });
    await this.page.waitForTimeout(600);

    await this.bodyEditor.waitFor({ state: 'visible', timeout: 10000 });
    await this.bodyEditor.click({ timeout: 5000 });
    await this.page.keyboard.press('ControlOrMeta+a');
    await this.page.keyboard.type(content);
  }

  async addHeader(key: string, value: string): Promise<void> {
    await this.clickRequestTab('Headers');
    await this.page.locator('[placeholder="Key"], [placeholder="Header"]').last().fill(key);
    await this.page.locator('[placeholder="Value"]').last().fill(value);
  }

  async setPreRequestScript(js: string): Promise<void> {
    await this.clickRequestTab('Pre-request Script');
    const editor = this.page.locator('.cm-content').first();
    await editor.click();
    await this.page.keyboard.press('ControlOrMeta+a');
    await this.page.keyboard.type(js);
  }

  // ── ISO 8583 ──────────────────────────────────────────────────────────────

  async setIsoMti(mti: string): Promise<void> {
    const mtiInput = this.page.locator('[placeholder*="MTI"], [placeholder*="mti"]').first();
    await mtiInput.fill(mti);
  }

  async setIsoDe(de: string, value: string): Promise<void> {
    const deRow = this.page.locator(`tr:has-text("${de}") input, [data-de="${de}"] input`).first();
    await deRow.fill(value);
  }

  async toggleTableView(): Promise<void> {
    await this.page.locator('button').filter({ hasText: /table view/i }).first().click();
    await this.page.waitForTimeout(400);
  }

  // ── Actions ───────────────────────────────────────────────────────────────

  async send(waitMs = 8000): Promise<void> {
    await this.sendButton.click();
    await this.page.waitForTimeout(waitMs);
  }

  async save(collectionName?: string): Promise<void> {
    await this.saveButton.click();
    await this.page.waitForTimeout(500);
    if (collectionName) {
      await this.page.getByText(collectionName).first().click();
      await this.page.waitForTimeout(300);
      await this.page.locator('button').filter({ hasText: 'Save' }).last().click();
      await this.page.waitForTimeout(500);
    }
  }

  // ── Response reading ──────────────────────────────────────────────────────

  /**
   * Read the response body from CodeMirror — the response viewer renders JSON
   * in a virtualized cm-content element, not in plain DOM text.
   */
  async responseBodyText(): Promise<string> {
    return this.page.evaluate((): string => {
      // Find all cm-content elements — response is typically the last one
      const editors = document.querySelectorAll('.cm-content');
      if (!editors.length) return '';
      const last = editors[editors.length - 1];
      return last.textContent ?? '';
    });
  }

  /** Get the status bar text, e.g. "Status: 200  •  OK  Time: 506 ms  Size: 166 B" */
  async responseStatusText(): Promise<string> {
    const el = this.page.locator('text=Status:').first();
    return el.isVisible({ timeout: 3000 }).then(v => v ? el.innerText() : '').catch(() => '');
  }

  // ── Assertions ────────────────────────────────────────────────────────────

  async expectResponseStatus(status: number | string): Promise<void> {
    const statusText = await this.responseStatusText();
    expect(statusText).toContain(String(status));
  }

  async expectResponseContains(text: string): Promise<void> {
    const body = await this.responseBodyText();
    expect(body).toContain(text);
  }

  async expectResponseStatusOk(): Promise<void> {
    // bodyText() captures the full status bar including the colored status code
    const body = await this.bodyText();
    expect(body).toMatch(/Status:.*\b(200|201|204)\b/);
  }

  async expectNoError(): Promise<void> {
    const body = await this.bodyText();
    expect(body).not.toContain('Unknown error');
    expect(body).not.toContain('Connection refused');
    expect(body).not.toContain('net::ERR');
  }

  async sendRestRequest(method: RestMethod, url: string, body?: object): Promise<void> {
    await this.open();
    await this.setMethod(method);
    await this.setUrl(url);
    if (body) await this.setBody(body);
    await this.send();
  }
}
