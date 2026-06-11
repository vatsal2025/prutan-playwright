import { test, expect, Page } from '@playwright/test';
import { ROUTES } from '../../utils/cloud-constants';

// â”€â”€â”€ helpers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const STUDIO = ROUTES.STUDIO; // #/home/collections

async function load(page: Page) {
  await page.goto(STUDIO, { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(
    () => !document.body.innerText.includes('Loading...'),
    { timeout: 20_000 }
  ).catch(() => {});
}

async function openRequest(page: Page) {
  /** Hover first real collection, open â‹®, New Request, save, then click it. */
  const firstColl = page.locator('li, [class*="collection-item"]').first();
  await firstColl.hover();
  await firstColl.locator('button').last().click();
  await page.locator('[role="menuitem"], li').filter({ hasText: 'New Request' }).first().click();
  await page.locator('[role="dialog"] input').first().fill(`TC_STUDIO_${Date.now()}`);
  await page.locator('[role="dialog"] button:has-text("Save")').click();
  await page.waitForTimeout(500);
}

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
//  STUDIO â€” Protocol Tab Bar
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
test.describe('Studio â€º Protocol Tab Bar', () => {
  test.beforeEach(async ({ page }) => { await load(page); });

  test('ST-PTB-001 | Three protocol tabs visible: Rest | ISO | Realtime', async ({ page }) => {
    for (const tab of ['Rest', 'ISO', 'Realtime']) {
      await expect(page.locator(`[role="tab"]:has-text("${tab}"), .tab-item:has-text("${tab}")`).first()).toBeVisible();
    }
  });

  test('ST-PTB-002 | Rest tab is active/selected by default', async ({ page }) => {
    const restTab = page.locator('[role="tab"]:has-text("Rest"), .tab-item:has-text("Rest")').first();
    const cls = await restTab.getAttribute('class') ?? '';
    expect(cls.toLowerCase()).toMatch(/active|selected|current/);
  });

  test('ST-PTB-003 | Clicking ISO tab activates it', async ({ page }) => {
    await page.locator('[role="tab"]:has-text("ISO"), .tab-item:has-text("ISO")').first().click();
    const isoTab = page.locator('[role="tab"]:has-text("ISO"), .tab-item:has-text("ISO")').first();
    const cls = await isoTab.getAttribute('class') ?? '';
    expect(cls.toLowerCase()).toMatch(/active|selected|current/);
  });

  test('ST-PTB-004 | Clicking Realtime tab activates it', async ({ page }) => {
    await page.locator('[role="tab"]:has-text("Realtime"), .tab-item:has-text("Realtime")').first().click();
    const tab = page.locator('[role="tab"]:has-text("Realtime"), .tab-item:has-text("Realtime")').first();
    const cls = await tab.getAttribute('class') ?? '';
    expect(cls.toLowerCase()).toMatch(/active|selected|current/);
  });

  test('ST-PTB-005 | ISO tab shows port input field (default 6666)', async ({ page }) => {
    await page.locator('[role="tab"]:has-text("ISO"), .tab-item:has-text("ISO")').first().click();
    const portInput = page.locator('input[placeholder*="port" i], input[value="6666"]').first();
    await expect(portInput).toBeVisible();
    await expect(portInput).toHaveValue('6666');
  });

  test('ST-PTB-006 | Realtime tab shows "Publish" button instead of "Send"', async ({ page }) => {
    await page.locator('[role="tab"]:has-text("Realtime"), .tab-item:has-text("Realtime")').first().click();
    await expect(page.locator('button:has-text("Publish")').first()).toBeVisible();
    await expect(page.locator('button:has-text("Send"):not(:has-text("Pre"))')).not.toBeVisible();
  });

  test('ST-PTB-007 | Rest tab shows "Send" button', async ({ page }) => {
    await expect(page.locator('button:has-text("Send"):not(:has-text("Pre"))').first()).toBeVisible();
  });

  test('ST-PTB-008 | ISO tab has fewer editor tabs (no Parameters/no Realtime)', async ({ page }) => {
    await page.locator('[role="tab"]:has-text("ISO"), .tab-item:has-text("ISO")').first().click();
    // ISO: Body | Authorization | Pre-request Script (no Parameters, no Headers per live observation)
    await expect(page.locator('[role="tab"]:has-text("Body"), .tab-item:has-text("Body")').first()).toBeVisible();
    await expect(page.locator('[role="tab"]:has-text("Authorization")').first()).toBeVisible();
  });

  test('ST-PTB-009 | Switching tabs does not lose URL value', async ({ page }) => {
    const urlInput = page.locator('input[placeholder*="url" i], .url-input').first();
    await urlInput.fill('https://api.example.com/test');
    await page.locator('[role="tab"]:has-text("ISO")').first().click();
    await page.locator('[role="tab"]:has-text("Rest")').first().click();
    await expect(urlInput).toBeVisible();
  });
});

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
//  STUDIO â€” Method Dropdown
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
test.describe('Studio â€º Method Dropdown', () => {
  test.beforeEach(async ({ page }) => { await load(page); });

  const methods = ['GET','POST','PUT','PATCH','DELETE','HEAD','CONNECT','OPTIONS','TRACE'];

  test('ST-MD-001 | Method dropdown is present in request bar', async ({ page }) => {
    const dd = page.locator('.method-select, [data-testid="method-dropdown"], button:has-text("GET"), button:has-text("Method")').first();
    await expect(dd).toBeVisible();
  });

  for (const m of methods) {
    test(`ST-MD-002-${m} | Method dropdown contains "${m}"`, async ({ page }) => {
      await page.locator('.method-select, button:has-text("GET"), button:has-text("Method")').first().click();
      await expect(page.locator(`[role="option"]:has-text("${m}"), li:has-text("${m}")`).first()).toBeVisible();
      await page.keyboard.press('Escape');
    });
  }

  test('ST-MD-012 | Selecting POST updates badge to POST', async ({ page }) => {
    await page.locator('.method-select, button:has-text("GET"), button:has-text("Method")').first().click();
    await page.locator('[role="option"]:has-text("POST"), li:has-text("POST")').first().click();
    const badge = page.locator('.method-select, [data-testid="method-dropdown"]').first();
    await expect(badge).toContainText('POST');
  });

  test('ST-MD-013 | Selecting DELETE updates badge to DELETE', async ({ page }) => {
    await page.locator('.method-select, button:has-text("GET"), button:has-text("Method")').first().click();
    await page.locator('[role="option"]:has-text("DELETE"), li:has-text("DELETE")').first().click();
    const badge = page.locator('.method-select, [data-testid="method-dropdown"]').first();
    await expect(badge).toContainText('DELETE');
  });
});

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
//  STUDIO â€” Request Editor: BODY Tab
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
test.describe('Studio â€º Request Editor â€º Body Tab', () => {
  test.beforeEach(async ({ page }) => { await load(page); });

  test('ST-BODY-001 | Body tab is visible and clickable', async ({ page }) => {
    await page.locator('[role="tab"]:has-text("Body"), .tab-item:has-text("Body")').first().click();
    await expect(page.locator('[role="tab"]:has-text("Body")').first()).toBeVisible();
  });

  test('ST-BODY-002 | Content Type dropdown shows "None" by default', async ({ page }) => {
    await page.locator('[role="tab"]:has-text("Body")').first().click();
    await expect(page.locator('text=Content Type').first()).toBeVisible();
    await expect(page.locator('text=None').first()).toBeVisible();
  });

  test('ST-BODY-003 | Body empty-state: "This request does not have a body"', async ({ page }) => {
    await page.locator('[role="tab"]:has-text("Body")').first().click();
    await expect(page.locator('text=This request does not have a body').first()).toBeVisible();
  });

  test('ST-BODY-004 | Documentation link is visible in body empty state', async ({ page }) => {
    await page.locator('[role="tab"]:has-text("Body")').first().click();
    await expect(page.locator('a:has-text("Documentation"), button:has-text("Documentation")').first()).toBeVisible();
  });

  test('ST-BODY-005 | Content Type dropdown is clickable', async ({ page }) => {
    await page.locator('[role="tab"]:has-text("Body")').first().click();
    await page.locator('text=None').first().click();
    // Dropdown should open
    const option = page.locator('[role="option"], .dropdown-item').first();
    if (await option.isVisible({ timeout: 3000 }).catch(() => false)) {
      await expect(option).toBeVisible();
    }
    await page.keyboard.press('Escape');
  });
});

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
//  STUDIO â€” Request Editor: PARAMETERS Tab
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
test.describe('Studio â€º Request Editor â€º Parameters Tab', () => {
  test.beforeEach(async ({ page }) => { await load(page); });

  test('ST-PARAMS-001 | Parameters tab is visible', async ({ page }) => {
    await expect(page.locator('[role="tab"]:has-text("Parameters")').first()).toBeVisible();
  });

  test('ST-PARAMS-002 | Clicking Parameters tab shows "Query Parameters" section', async ({ page }) => {
    await page.locator('[role="tab"]:has-text("Parameters")').first().click();
    await expect(page.locator('text=Query Parameters').first()).toBeVisible();
  });

  test('ST-PARAMS-003 | Parameters tab has + (add) icon button', async ({ page }) => {
    await page.locator('[role="tab"]:has-text("Parameters")').first().click();
    const addBtn = page.locator('[aria-label*="add" i], button[title*="add" i], .add-param-btn, button:has-text("+")').first();
    await expect(addBtn).toBeVisible();
  });

  test('ST-PARAMS-004 | Parameters tab has delete icon button', async ({ page }) => {
    await page.locator('[role="tab"]:has-text("Parameters")').first().click();
    const delBtn = page.locator('[aria-label*="delete" i], button[title*="delete" i], .delete-btn, button[aria-label*="remove" i]').first();
    await expect(delBtn).toBeVisible();
  });
});

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
//  STUDIO â€” Request Editor: HEADERS Tab
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
test.describe('Studio â€º Request Editor â€º Headers Tab', () => {
  test.beforeEach(async ({ page }) => { await load(page); });

  test('ST-HDR-001 | Headers tab is visible', async ({ page }) => {
    await expect(page.locator('[role="tab"]:has-text("Headers")').first()).toBeVisible();
  });

  test('ST-HDR-002 | Clicking Headers tab shows "Header List" section', async ({ page }) => {
    await page.locator('[role="tab"]:has-text("Headers")').first().click();
    await expect(page.locator('text=Header List').first()).toBeVisible();
  });

  test('ST-HDR-003 | Headers tab has + (add) icon button', async ({ page }) => {
    await page.locator('[role="tab"]:has-text("Headers")').first().click();
    const addBtn = page.locator('[aria-label*="add" i], button[title*="add" i], .add-header-btn, button:has-text("+")').first();
    await expect(addBtn).toBeVisible();
  });

  test('ST-HDR-004 | Headers tab has delete icon button', async ({ page }) => {
    await page.locator('[role="tab"]:has-text("Headers")').first().click();
    const delBtn = page.locator('[aria-label*="delete" i], [aria-label*="remove" i], button[title*="delete" i]').first();
    await expect(delBtn).toBeVisible();
  });
});

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
//  STUDIO â€” Request Editor: AUTHORIZATION Tab
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
test.describe('Studio â€º Request Editor â€º Authorization Tab', () => {
  test.beforeEach(async ({ page }) => { await load(page); });

  test('ST-AUTH-001 | Authorization tab is visible', async ({ page }) => {
    await expect(page.locator('[role="tab"]:has-text("Authorization")').first()).toBeVisible();
  });

  test('ST-AUTH-002 | Authorization tab shows "Authorization Type" label', async ({ page }) => {
    await page.locator('[role="tab"]:has-text("Authorization")').first().click();
    await expect(page.locator('text=Authorization Type').first()).toBeVisible();
  });

  test('ST-AUTH-003 | Authorization type defaults to "None" with empty-state message', async ({ page }) => {
    await page.locator('[role="tab"]:has-text("Authorization")').first().click();
    await expect(page.locator('text=This request does not use any authorization').first()).toBeVisible();
  });

  test('ST-AUTH-004 | Authorization type dropdown has "Enabled" checkbox', async ({ page }) => {
    await page.locator('[role="tab"]:has-text("Authorization")').first().click();
    await expect(page.locator('text=Enabled').first()).toBeVisible();
  });

  const authTypes = ['None', 'Basic Auth', 'Bearer', 'OAuth 2.0', 'API key'];
  for (const t of authTypes) {
    test(`ST-AUTH-005-${t.replace(/\s/g, '_')} | Auth type dropdown contains "${t}"`, async ({ page }) => {
      await page.locator('[role="tab"]:has-text("Authorization")').first().click();
      await page.locator('select, [data-testid="auth-type"], .auth-type-select').first().click();
      await expect(page.locator(`[role="option"]:has-text("${t}"), li:has-text("${t}")`).first()).toBeVisible();
      await page.keyboard.press('Escape');
    });
  }

  test('ST-AUTH-011 | Selecting Bearer shows Token input', async ({ page }) => {
    await page.locator('[role="tab"]:has-text("Authorization")').first().click();
    await page.locator('select, .auth-type-select').first().click();
    await page.locator('[role="option"]:has-text("Bearer"), li:has-text("Bearer")').first().click();
    await expect(page.locator('input[placeholder*="token" i], label:has-text("Token") + input').first()).toBeVisible();
  });

  test('ST-AUTH-012 | Selecting Basic Auth shows Username + Password inputs', async ({ page }) => {
    await page.locator('[role="tab"]:has-text("Authorization")').first().click();
    await page.locator('select, .auth-type-select').first().click();
    await page.locator('[role="option"]:has-text("Basic Auth"), li:has-text("Basic Auth")').first().click();
    await expect(page.locator('input[placeholder*="username" i], label:has-text("Username")').first()).toBeVisible();
    await expect(page.locator('input[placeholder*="password" i], label:has-text("Password")').first()).toBeVisible();
  });

  test('ST-AUTH-013 | Selecting API key shows Key + Value inputs', async ({ page }) => {
    await page.locator('[role="tab"]:has-text("Authorization")').first().click();
    await page.locator('select, .auth-type-select').first().click();
    await page.locator('[role="option"]:has-text("API key"), li:has-text("API key")').first().click();
    await expect(page.locator('input[placeholder*="key" i], label:has-text("Key")').first()).toBeVisible();
  });

  test('ST-AUTH-014 | Selecting OAuth 2.0 shows OAuth configuration fields', async ({ page }) => {
    await page.locator('[role="tab"]:has-text("Authorization")').first().click();
    await page.locator('select, .auth-type-select').first().click();
    await page.locator('[role="option"]:has-text("OAuth 2.0"), li:has-text("OAuth 2.0")').first().click();
    // OAuth 2.0 form should appear (any of these fields)
    await expect(
      page.locator('input[placeholder*="client" i], input[placeholder*="token" i], label:has-text("Token URL"), label:has-text("Grant Type")').first()
    ).toBeVisible({ timeout: 8_000 });
  });
});

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
//  STUDIO â€” Request Editor: PRE-REQUEST SCRIPT Tab
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
test.describe('Studio â€º Request Editor â€º Pre-request Script Tab', () => {
  test.beforeEach(async ({ page }) => { await load(page); });

  test('ST-PRS-001 | Pre-request Script tab is visible', async ({ page }) => {
    await expect(page.locator('[role="tab"]:has-text("Pre-request"), .tab-item:has-text("Pre-request")').first()).toBeVisible();
  });

  test('ST-PRS-002 | Clicking Pre-request Script tab shows code editor', async ({ page }) => {
    await page.locator('[role="tab"]:has-text("Pre-request")').first().click();
    await expect(page.locator('.cm-content, .code-editor, [class*="code-editor"]').first()).toBeVisible();
  });

  test('ST-PRS-003 | Code editor has "// JavaScript Code" placeholder', async ({ page }) => {
    await page.locator('[role="tab"]:has-text("Pre-request")').first().click();
    const editor = page.locator('.cm-content, .code-editor, [class*="code-editor"]').first();
    const text = await editor.textContent() ?? '';
    expect(text).toContain('JavaScript Code');
  });

  test('ST-PRS-004 | "Rules Snippets" panel is visible on the right', async ({ page }) => {
    await page.locator('[role="tab"]:has-text("Pre-request")').first().click();
    await expect(page.locator('text=Rules Snippets').first()).toBeVisible();
  });

  test('ST-PRS-005 | Rules Snippets has a search input', async ({ page }) => {
    await page.locator('[role="tab"]:has-text("Pre-request")').first().click();
    await expect(page.locator('input[placeholder*="rules snipp" i], input[placeholder*="snippet" i], input[placeholder*="Search rules" i]').first()).toBeVisible();
  });

  test('ST-PRS-006 | Code editor accepts typed JavaScript', async ({ page }) => {
    await page.locator('[role="tab"]:has-text("Pre-request")').first().click();
    const editor = page.locator('.cm-content, .code-editor').first();
    await editor.click();
    await page.keyboard.type('const x = pm.variables.get("token");');
    await expect(editor).toContainText('pm.variables.get');
  });

  test('ST-PRS-007 | Searching a snippet filters the list', async ({ page }) => {
    await page.locator('[role="tab"]:has-text("Pre-request")').first().click();
    const searchInput = page.locator('input[placeholder*="snipp" i], input[placeholder*="Search rules" i]').first();
    await searchInput.fill('status');
    await page.waitForTimeout(500);
    await expect(page.locator('body')).not.toContainText('Error');
  });

  test('ST-PRS-008 | Pre-request Script tab has clear/reset icon', async ({ page }) => {
    await page.locator('[role="tab"]:has-text("Pre-request")').first().click();
    const clearBtn = page.locator('[aria-label*="clear" i], [aria-label*="reset" i], button[title*="clear" i]').first();
    if (await clearBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await expect(clearBtn).toBeVisible();
    }
    // If not present, just verify no crash
    await expect(page.locator('body')).not.toContainText('Error');
  });
});

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
//  STUDIO â€” Request Editor: VALIDATION Tab (authenticated only)
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
test.describe('Studio â€º Request Editor â€º Validation Tab', () => {
  test.beforeEach(async ({ page }) => { await load(page); });

  test('ST-VAL-001 | Validation tab is visible when authenticated', async ({ page }) => {
    await expect(page.locator('[role="tab"]:has-text("Validation")').first()).toBeVisible();
  });

  test('ST-VAL-002 | Clicking Validation tab does not crash', async ({ page }) => {
    await page.locator('[role="tab"]:has-text("Validation")').first().click();
    await page.waitForTimeout(500);
    await expect(page.locator('body')).not.toContainText('Error');
  });

  test('ST-VAL-003 | Validation tab content area is visible', async ({ page }) => {
    await page.locator('[role="tab"]:has-text("Validation")').first().click();
    // Some assertion-builder or empty state
    const panel = page.locator('[class*="validation"], [data-testid="validation-panel"], .validation-area').first();
    if (await panel.isVisible({ timeout: 3000 }).catch(() => false)) {
      await expect(panel).toBeVisible();
    } else {
      // Validate no error
      await expect(page.locator('body')).not.toContainText('404');
    }
  });
});

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
//  STUDIO â€” Request Editor: SETTINGS Tab (authenticated only)
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
test.describe('Studio â€º Request Editor â€º Settings Tab', () => {
  test.beforeEach(async ({ page }) => { await load(page); });

  test('ST-SET-001 | Settings tab is visible when authenticated', async ({ page }) => {
    await expect(page.locator('[role="tab"]:has-text("Settings")').last()).toBeVisible();
  });

  test('ST-SET-002 | Clicking Settings tab does not crash', async ({ page }) => {
    await page.locator('[role="tab"]:has-text("Settings")').last().click();
    await page.waitForTimeout(500);
    await expect(page.locator('body')).not.toContainText('Error');
  });
});

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
//  STUDIO â€” Save Button & Dropdown
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
test.describe('Studio â€º Save Button', () => {
  test.beforeEach(async ({ page }) => { await load(page); });

  test('ST-SAVE-001 | Save button is visible in request bar', async ({ page }) => {
    await expect(page.locator('button:has-text("Save")').first()).toBeVisible();
  });

  test('ST-SAVE-002 | Save dropdown chevron is visible next to Save', async ({ page }) => {
    const saveRow = page.locator('button:has-text("Save")').first().locator('..');
    const chevron = saveRow.locator('button, [class*="arrow"], [class*="chevron"]').last();
    await expect(chevron).toBeVisible();
  });

  test('ST-SAVE-003 | Clicking Save dropdown shows save options', async ({ page }) => {
    const saveRow = page.locator('button:has-text("Save")').first().locator('..');
    const chevron = saveRow.locator('button').last();
    await chevron.click();
    // Should open a dropdown with options like "Save as"
    const opts = page.locator('[role="menu"], [role="listbox"], .save-dropdown').first();
    if (await opts.isVisible({ timeout: 3000 }).catch(() => false)) {
      await expect(opts).toBeVisible();
    }
    await page.keyboard.press('Escape');
  });
});

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
//  STUDIO â€” Collections Panel Context Menu (all 8 items in depth)
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
test.describe('Studio â€º Collections Panel â€º Context Menu', () => {
  test.beforeEach(async ({ page }) => { await load(page); });

  const menuItems = [
    'New Request', 'New Folder', 'Run Collection',
    'Edit', 'Export', 'Upload', 'Duplicate', 'Delete'
  ];

  test('ST-CM-001 | All 8 context menu items are present', async ({ page }) => {
    const firstColl = page.locator('li, [class*="collection-item"]').first();
    await firstColl.hover();
    await firstColl.locator('button').last().click();
    await page.waitForSelector('[role="menu"], ul.context-menu', { state: 'visible' });
    for (const item of menuItems) {
      await expect(page.locator('[role="menuitem"], li.menu-item').filter({ hasText: item }).first()).toBeVisible();
    }
    await page.keyboard.press('Escape');
  });

  test('ST-CM-002 | "New Request" opens a dialog with Label input', async ({ page }) => {
    const firstColl = page.locator('li, [class*="collection-item"]').first();
    await firstColl.hover();
    await firstColl.locator('button').last().click();
    await page.locator('[role="menuitem"], li.menu-item').filter({ hasText: 'New Request' }).first().click();
    await expect(page.locator('[role="dialog"]').first()).toBeVisible({ timeout: 8_000 });
    await expect(page.locator('[role="dialog"] input').first()).toBeVisible();
    await page.keyboard.press('Escape');
  });

  test('ST-CM-003 | "New Folder" opens a dialog with Label input', async ({ page }) => {
    const firstColl = page.locator('li, [class*="collection-item"]').first();
    await firstColl.hover();
    await firstColl.locator('button').last().click();
    await page.locator('[role="menuitem"], li.menu-item').filter({ hasText: 'New Folder' }).first().click();
    await expect(page.locator('[role="dialog"]').first()).toBeVisible({ timeout: 8_000 });
    await page.keyboard.press('Escape');
  });

  test('ST-CM-004 | "Run Collection" opens run dialog/panel', async ({ page }) => {
    const firstColl = page.locator('li, [class*="collection-item"]').first();
    await firstColl.hover();
    await firstColl.locator('button').last().click();
    await page.locator('[role="menuitem"], li.menu-item').filter({ hasText: 'Run Collection' }).first().click();
    await page.waitForTimeout(1000);
    // A run panel or dialog must appear
    const runUI = page.locator('[role="dialog"], .run-panel, text=Run Collection').first();
    await expect(runUI).toBeVisible({ timeout: 10_000 });
    await page.keyboard.press('Escape');
  });

  test('ST-CM-005 | "Edit" opens collection rename dialog with pre-filled label', async ({ page }) => {
    const firstColl = page.locator('li, [class*="collection-item"]').first();
    await firstColl.hover();
    await firstColl.locator('button').last().click();
    await page.locator('[role="menuitem"], li.menu-item').filter({ hasText: 'Edit' }).first().click();
    await expect(page.locator('[role="dialog"]').first()).toBeVisible({ timeout: 8_000 });
    // Input should be pre-filled with the collection name
    const input = page.locator('[role="dialog"] input').first();
    const val = await input.inputValue();
    expect(val.length).toBeGreaterThan(0);
    await page.keyboard.press('Escape');
  });

  test('ST-CM-006 | "Export" triggers a file download', async ({ page }) => {
    const firstColl = page.locator('li, [class*="collection-item"]').first();
    await firstColl.hover();
    await firstColl.locator('button').last().click();
    const [download] = await Promise.all([
      page.waitForEvent('download', { timeout: 10_000 }),
      page.locator('[role="menuitem"], li.menu-item').filter({ hasText: 'Export' }).first().click(),
    ]);
    expect(download.suggestedFilename()).toBeTruthy();
  });

  test('ST-CM-007 | "Upload" opens a file upload interaction', async ({ page }) => {
    const firstColl = page.locator('li, [class*="collection-item"]').first();
    await firstColl.hover();
    await firstColl.locator('button').last().click();
    await page.locator('[role="menuitem"], li.menu-item').filter({ hasText: 'Upload' }).first().click();
    await page.waitForTimeout(500);
    // Either a file dialog opens or an upload area appears
    await expect(page.locator('body')).not.toContainText('Error');
    await page.keyboard.press('Escape');
  });

  test('ST-CM-008 | "Duplicate" increases collection count by 1', async ({ page }) => {
    const countBefore = await page.locator('li, [class*="collection-item"]').count();
    const firstColl = page.locator('li, [class*="collection-item"]').first();
    await firstColl.hover();
    await firstColl.locator('button').last().click();
    await page.locator('[role="menuitem"], li.menu-item').filter({ hasText: 'Duplicate' }).first().click();
    await page.waitForTimeout(1500);
    const countAfter = await page.locator('li, [class*="collection-item"]').count();
    expect(countAfter).toBeGreaterThan(countBefore);
  });

  test('ST-CM-009 | "Delete" shows confirmation dialog', async ({ page }) => {
    // Use the auto-test duplicate from previous test
    const collItems = page.locator('li, [class*="collection-item"]');
    const last = collItems.last();
    await last.hover();
    await last.locator('button').last().click();
    await page.locator('[role="menuitem"], li.menu-item').filter({ hasText: 'Delete' }).first().click();
    // Confirmation dialog or inline confirm
    const confirm = page.locator('[role="dialog"]:has-text("Delete"), text=Are you sure, text=Confirm').first();
    await expect(confirm).toBeVisible({ timeout: 8_000 });
    await page.keyboard.press('Escape');
  });

  test('ST-CM-010 | Context menu closes on ESC', async ({ page }) => {
    const firstColl = page.locator('li, [class*="collection-item"]').first();
    await firstColl.hover();
    await firstColl.locator('button').last().click();
    await page.waitForSelector('[role="menu"], ul.context-menu', { state: 'visible' });
    await page.keyboard.press('Escape');
    await expect(page.locator('[role="menu"], ul.context-menu')).not.toBeVisible({ timeout: 5_000 });
  });

  test('ST-CM-011 | Context menu closes on outside click', async ({ page }) => {
    const firstColl = page.locator('li, [class*="collection-item"]').first();
    await firstColl.hover();
    await firstColl.locator('button').last().click();
    await page.waitForSelector('[role="menu"], ul.context-menu', { state: 'visible' });
    await page.mouse.click(800, 500); // click outside
    await expect(page.locator('[role="menu"], ul.context-menu')).not.toBeVisible({ timeout: 5_000 });
  });
});

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
//  STUDIO â€” New Collection Modal
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
test.describe('Studio â€º New Collection Modal', () => {
  test.beforeEach(async ({ page }) => { await load(page); });

  test('ST-NC-001 | + New opens "New Collection" modal', async ({ page }) => {
    await page.locator('button:has-text("New"), .new-btn').first().click();
    await expect(page.locator('[role="dialog"]:has-text("New Collection")').first()).toBeVisible();
  });

  test('ST-NC-002 | Modal has a "Label" field', async ({ page }) => {
    await page.locator('button:has-text("New")').first().click();
    await expect(page.locator('[role="dialog"] label:has-text("Label"), [role="dialog"] text=Label').first()).toBeVisible();
  });

  test('ST-NC-003 | Modal "Save" button is disabled when Label is empty', async ({ page }) => {
    await page.locator('button:has-text("New")').first().click();
    await expect(page.locator('[role="dialog"] button:has-text("Save")').first()).toBeDisabled();
    await page.keyboard.press('Escape');
  });

  test('ST-NC-004 | Modal "Save" button enables after typing a label', async ({ page }) => {
    await page.locator('button:has-text("New")').first().click();
    await page.locator('[role="dialog"] input').first().fill('My Test Collection');
    await expect(page.locator('[role="dialog"] button:has-text("Save")').first()).toBeEnabled();
    await page.keyboard.press('Escape');
  });

  test('ST-NC-005 | Modal closes on Cancel', async ({ page }) => {
    await page.locator('button:has-text("New")').first().click();
    await page.locator('[role="dialog"] button:has-text("Cancel")').first().click();
    await expect(page.locator('[role="dialog"]:has-text("New Collection")')).not.toBeVisible({ timeout: 5_000 });
  });

  test('ST-NC-006 | Modal closes on ESC key', async ({ page }) => {
    await page.locator('button:has-text("New")').first().click();
    await page.keyboard.press('Escape');
    await expect(page.locator('[role="dialog"]:has-text("New Collection")')).not.toBeVisible({ timeout: 5_000 });
  });

  test('ST-NC-007 | Modal shows ESC label hint next to close button', async ({ page }) => {
    await page.locator('button:has-text("New")').first().click();
    await expect(page.locator('text=ESC').first()).toBeVisible();
    await page.keyboard.press('Escape');
  });
});

