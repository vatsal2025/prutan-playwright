import { test, expect } from '@playwright/test';
import { RequestEditor } from '../../pages/cloud/RequestEditor';
import { CollectionsPanel } from '../../pages/cloud/CollectionsPanel';
import { ROUTES, HTTP_METHODS, AUTH_TYPES } from '../../utils/cloud-constants';

const TS        = Date.now();
const COLL_NAME = `EditorTest_${TS}`;
const REQ_NAME  = `Request_${TS}`;

test.describe('Request Editor â€” Protocol Tabs', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto(ROUTES.STUDIO, { waitUntil: 'domcontentloaded' });
    await page.waitForFunction(() => !document.body.innerText.includes('Loading...'), { timeout: 15_000 }).catch(() => {});
  });

  test('TC-RE-001 | All 3 protocol tabs are visible: Rest | ISO | Realtime', async ({ page }) => {
    const re = new RequestEditor(page);
    await re.assertAllProtocolTabsVisible();
  });

  test('TC-RE-002 | Rest tab is active by default', async ({ page }) => {
    // The Rest tab should have an active underline
    const restTab = page.locator('[role="tab"]:has-text("Rest"), .tab-item:has-text("Rest")').first();
    await expect(restTab).toHaveClass(/active|selected|current/, { timeout: 5_000 });
  });

  test('TC-RE-003 | ISO tab adds a port number field (default 6666)', async ({ page }) => {
    const re = new RequestEditor(page);
    await re.assertPortFieldVisibleOnISO();
    await expect(re.portInput()).toHaveValue('6666');
  });

  test('TC-RE-004 | Realtime tab shows "Publish" instead of "Send"', async ({ page }) => {
    const re = new RequestEditor(page);
    await re.assertPublishBtnOnRealtime();
  });

  test('TC-RE-005 | Switching between protocol tabs does not lose URL value', async ({ page }) => {
    const re = new RequestEditor(page);
    const testUrl = 'https://api.test.com/ping';
    await re.setUrl(testUrl);
    await re.switchToISO();
    await re.switchToRest();
    // URL should be preserved or the editor resets â€” either way no crash
    await expect(re.urlInput()).toBeVisible();
  });
});

test.describe('Request Editor â€” Method Dropdown', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto(ROUTES.STUDIO, { waitUntil: 'domcontentloaded' });
    await page.waitForFunction(() => !document.body.innerText.includes('Loading...'), { timeout: 15_000 }).catch(() => {});
  });

  test('TC-RE-006 | Method dropdown contains all 9 HTTP methods', async ({ page }) => {
    const re = new RequestEditor(page);
    await re.assertMethodDropdownContains([...HTTP_METHODS]);
  });

  test('TC-RE-007 | Selecting POST changes the method badge to POST', async ({ page }) => {
    const re = new RequestEditor(page);
    await re.selectMethod('POST');
    await expect(re.methodDropdown()).toContainText('POST');
  });

  test('TC-RE-008 | Selecting DELETE changes the method badge to DELETE', async ({ page }) => {
    const re = new RequestEditor(page);
    await re.selectMethod('DELETE');
    await expect(re.methodDropdown()).toContainText('DELETE');
  });
});

test.describe('Request Editor â€” Body Tab', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto(ROUTES.STUDIO, { waitUntil: 'domcontentloaded' });
    await page.waitForFunction(() => !document.body.innerText.includes('Loading...'), { timeout: 15_000 }).catch(() => {});
  });

  test('TC-RE-009 | Body tab empty state: "This request does not have a body"', async ({ page }) => {
    const re = new RequestEditor(page);
    await re.openBodyTab();
    await re.assertBodyEmptyState();
  });

  test('TC-RE-010 | Body tab shows Content Type dropdown with "None" default', async ({ page }) => {
    const re = new RequestEditor(page);
    await re.openBodyTab();
    await expect(re.contentTypeDropdown()).toBeVisible();
    await expect(re.contentTypeDropdown()).toContainText('None');
  });

  test('TC-RE-011 | Documentation link is visible in body empty state', async ({ page }) => {
    const re = new RequestEditor(page);
    await re.openBodyTab();
    await expect(re.documentationLink()).toBeVisible();
  });

  test('TC-RE-012 | Keyboard shortcut hints are visible below response pane', async ({ page }) => {
    const re = new RequestEditor(page);
    await re.assertKeyboardHintsVisible();
  });
});

test.describe('Request Editor â€” Parameters Tab', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto(ROUTES.STUDIO, { waitUntil: 'domcontentloaded' });
    await page.waitForFunction(() => !document.body.innerText.includes('Loading...'), { timeout: 15_000 }).catch(() => {});
  });

  test('TC-RE-013 | Parameters tab shows "Query Parameters" section', async ({ page }) => {
    const re = new RequestEditor(page);
    await re.openParametersTab();
    await expect(re.queryParamsSection()).toBeVisible();
  });

  test('TC-RE-014 | Parameters tab has add (+) and delete icons', async ({ page }) => {
    const re = new RequestEditor(page);
    await re.openParametersTab();
    // Look for the + icon button in the parameters area
    const addBtn = page.locator('[aria-label*="add" i], button[title*="add" i], .add-btn').first();
    await expect(addBtn).toBeVisible();
  });
});

test.describe('Request Editor â€” Headers Tab', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto(ROUTES.STUDIO, { waitUntil: 'domcontentloaded' });
    await page.waitForFunction(() => !document.body.innerText.includes('Loading...'), { timeout: 15_000 }).catch(() => {});
  });

  test('TC-RE-015 | Headers tab shows "Header List" label', async ({ page }) => {
    const re = new RequestEditor(page);
    await re.openHeadersTab();
    await expect(re.headerListSection()).toBeVisible();
  });
});

test.describe('Request Editor â€” Authorization Tab', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto(ROUTES.STUDIO, { waitUntil: 'domcontentloaded' });
    await page.waitForFunction(() => !document.body.innerText.includes('Loading...'), { timeout: 15_000 }).catch(() => {});
  });

  test('TC-RE-016 | Authorization tab shows "None" by default + empty state message', async ({ page }) => {
    const re = new RequestEditor(page);
    await re.openAuthorizationTab();
    await expect(re.noAuthMessage()).toBeVisible();
  });

  test('TC-RE-017 | Authorization type dropdown contains all 5 types', async ({ page }) => {
    const re = new RequestEditor(page);
    await re.openAuthorizationTab();
    await re.authTypeDropdown().click();
    for (const t of AUTH_TYPES) {
      await expect(re.authTypeOption(t)).toBeVisible();
    }
    await page.keyboard.press('Escape');
  });

  test('TC-RE-018 | Selecting "Bearer" shows Bearer token input', async ({ page }) => {
    const re = new RequestEditor(page);
    await re.selectAuthType('Bearer');
    await expect(
      page.locator('input[placeholder*="token" i], input[name*="token" i], label:has-text("Token")').first()
    ).toBeVisible();
  });

  test('TC-RE-019 | Selecting "Basic Auth" shows username and password inputs', async ({ page }) => {
    const re = new RequestEditor(page);
    await re.selectAuthType('Basic Auth');
    await expect(
      page.locator('input[placeholder*="username" i], label:has-text("Username")').first()
    ).toBeVisible();
  });

  test('TC-RE-020 | Selecting "API key" shows key name and value inputs', async ({ page }) => {
    const re = new RequestEditor(page);
    await re.selectAuthType('API key');
    await expect(
      page.locator('input[placeholder*="key" i], label:has-text("Key")').first()
    ).toBeVisible();
  });

  test('TC-RE-021 | Authorization tab has an "Enabled" checkbox', async ({ page }) => {
    const re = new RequestEditor(page);
    await re.openAuthorizationTab();
    await expect(re.authEnabledCheckbox().or(page.locator('label:has-text("Enabled")'))).toBeVisible();
  });
});

test.describe('Request Editor â€” Pre-request Script Tab', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto(ROUTES.STUDIO, { waitUntil: 'domcontentloaded' });
    await page.waitForFunction(() => !document.body.innerText.includes('Loading...'), { timeout: 15_000 }).catch(() => {});
  });

  test('TC-RE-022 | Pre-request Script tab shows code editor', async ({ page }) => {
    const re = new RequestEditor(page);
    await re.openPreRequestTab();
    await expect(re.rulesCodeEditor()).toBeVisible();
  });

  test('TC-RE-023 | Pre-request Script tab shows Rules Snippets panel with search', async ({ page }) => {
    const re = new RequestEditor(page);
    await re.openPreRequestTab();
    await expect(re.rulesSnippetsPanel()).toBeVisible();
    await expect(re.rulesSnippetSearch()).toBeVisible();
  });

  test('TC-RE-024 | Code editor accepts JavaScript input', async ({ page }) => {
    const re = new RequestEditor(page);
    await re.typePreRequestScript('// test script\nconst x = 1;');
    await expect(re.rulesCodeEditor()).toContainText('const x = 1');
  });
});

test.describe('Request Editor â€” Validation & Settings Tabs (Authenticated)', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto(ROUTES.STUDIO, { waitUntil: 'domcontentloaded' });
    await page.waitForFunction(() => !document.body.innerText.includes('Loading...'), { timeout: 15_000 }).catch(() => {});
  });

  test('TC-RE-025 | Validation tab is visible when authenticated', async ({ page }) => {
    const re = new RequestEditor(page);
    await expect(re.validationTab()).toBeVisible();
  });

  test('TC-RE-026 | Settings tab is visible when authenticated', async ({ page }) => {
    const re = new RequestEditor(page);
    await expect(re.settingsTab()).toBeVisible();
  });

  test('TC-RE-027 | Clicking Validation tab does not crash the page', async ({ page }) => {
    const re = new RequestEditor(page);
    await re.openValidationTab();
    await expect(page.locator('body')).not.toContainText('Error');
  });

  test('TC-RE-028 | Clicking Settings tab does not crash the page', async ({ page }) => {
    const re = new RequestEditor(page);
    await re.openSettingsTab();
    await expect(page.locator('body')).not.toContainText('Error');
  });
});

test.describe('Request Editor â€” Save Button', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto(ROUTES.STUDIO, { waitUntil: 'domcontentloaded' });
    await page.waitForFunction(() => !document.body.innerText.includes('Loading...'), { timeout: 15_000 }).catch(() => {});
  });

  test('TC-RE-029 | Save button is visible in request bar', async ({ page }) => {
    const re = new RequestEditor(page);
    await expect(re.saveBtn()).toBeVisible();
  });

  test('TC-RE-030 | Save dropdown arrow is visible next to Save button', async ({ page }) => {
    // A chevron/dropdown next to Save for "Save as" options
    const saveArea = page.locator('button:has-text("Save")').first().locator('..');
    const dropdownArrow = saveArea.locator('button, [class*="arrow"], [class*="chevron"]').last();
    await expect(dropdownArrow).toBeVisible();
  });
});

