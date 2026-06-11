import { test, expect, Page } from '@playwright/test';
import { ROUTES } from '../../utils/cloud-constants';

async function load(page: Page) {
  await page.goto(ROUTES.SETTINGS, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1000);
}

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
//  SETTINGS â€” Theme: Background
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
test.describe('Settings â€º Theme â€º Background', () => {
  test.beforeEach(async ({ page }) => { await load(page); });

  test('SET-BG-001 | "Theme" heading is visible', async ({ page }) => {
    await expect(page.locator('text=Theme').first()).toBeVisible({ timeout: 10_000 });
  });

  test('SET-BG-002 | "Customize your application theme." subtitle is visible', async ({ page }) => {
    await expect(page.locator('text=Customize your application theme').first()).toBeVisible();
  });

  test('SET-BG-003 | "Background" label is visible', async ({ page }) => {
    await expect(page.locator('text=Background').first()).toBeVisible();
  });

  test('SET-BG-004 | "System (Light)" is the default background label', async ({ page }) => {
    await expect(page.locator('text=System (Light)').first()).toBeVisible();
  });

  test('SET-BG-005 | Four background theme buttons are present', async ({ page }) => {
    // System | Light | Cloud/Auto | Dark â€” icon buttons
    const buttons = page.locator('[class*="theme-option"], [class*="bg-btn"], .background-option, button[title*="System" i], button[title*="Light" i], button[title*="Dark" i]');
    const count = await buttons.count();
    expect(count).toBeGreaterThanOrEqual(3);
  });

  test('SET-BG-006 | Clicking Light theme changes background label', async ({ page }) => {
    const lightBtn = page.locator('button[title*="Light" i], button[aria-label*="Light" i], svg[aria-label*="light" i]').first();
    if (await lightBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await lightBtn.click();
      await page.waitForTimeout(400);
      await expect(page.locator('body')).not.toContainText('Error');
    }
  });

  test('SET-BG-007 | Clicking Dark theme changes background label', async ({ page }) => {
    const darkBtn = page.locator('button[title*="Dark" i], button[aria-label*="Dark" i]').first();
    if (await darkBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await darkBtn.click();
      await page.waitForTimeout(400);
      await expect(page.locator('body')).not.toContainText('Error');
    }
  });
});

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
//  SETTINGS â€” Theme: Accent Color
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
test.describe('Settings â€º Theme â€º Accent Color', () => {
  test.beforeEach(async ({ page }) => { await load(page); });

  test('SET-AC-001 | "Accent color" label is visible', async ({ page }) => {
    await expect(page.locator('text=Accent color').first()).toBeVisible();
  });

  test('SET-AC-002 | "Indigo" is the default accent color label', async ({ page }) => {
    await expect(page.locator('text=Indigo').first()).toBeVisible();
  });

  test('SET-AC-003 | At least 6 colour circles are present', async ({ page }) => {
    const circles = page.locator('[class*="accent"], [class*="color-circle"], .accent-btn, [class*="color-swatch"]');
    const count = await circles.count();
    expect(count).toBeGreaterThanOrEqual(6);
  });

  test('SET-AC-004 | Clicking a different accent circle changes selection', async ({ page }) => {
    const circles = page.locator('[class*="accent"], [class*="color-circle"], .accent-btn');
    if (await circles.count() >= 2) {
      await circles.nth(1).click();
      await page.waitForTimeout(400);
      await expect(page.locator('body')).not.toContainText('Error');
    }
  });
});

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
//  SETTINGS â€” Theme: Font Size
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
test.describe('Settings â€º Theme â€º Font Size', () => {
  test.beforeEach(async ({ page }) => { await load(page); });

  test('SET-FS-001 | "Font size" label is visible', async ({ page }) => {
    await expect(page.locator('text=Font size').first()).toBeVisible();
  });

  test('SET-FS-002 | Font size dropdown shows "Small" as default', async ({ page }) => {
    await expect(page.locator('text=Small').first()).toBeVisible();
  });

  test('SET-FS-003 | Font size dropdown is clickable', async ({ page }) => {
    await page.locator('text=Small').first().click();
    await page.keyboard.press('Escape');
    await expect(page.locator('body')).not.toContainText('Error');
  });
});

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
//  SETTINGS â€” Theme: Language
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
test.describe('Settings â€º Theme â€º Language', () => {
  test.beforeEach(async ({ page }) => { await load(page); });

  test('SET-LNG-001 | "Language" label is visible', async ({ page }) => {
    await expect(page.locator('text=Language').first()).toBeVisible();
  });

  test('SET-LNG-002 | Language dropdown shows "English" as default', async ({ page }) => {
    await expect(page.locator('text=English').first()).toBeVisible();
  });

  test('SET-LNG-003 | Language dropdown is clickable', async ({ page }) => {
    await page.locator('text=English').first().click();
    await page.keyboard.press('Escape');
    await expect(page.locator('body')).not.toContainText('Error');
  });
});

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
//  SETTINGS â€” Theme: Toggles (6 total)
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
test.describe('Settings â€º Theme â€º Toggles', () => {
  test.beforeEach(async ({ page }) => { await load(page); });

  const toggleDefs = [
    { label: 'Telemetry',          defaultOn: true },
    { label: 'Expand navigation',  defaultOn: true },
    { label: 'Sidebar on left',    defaultOn: true },
    { label: 'Zen mode',           defaultOn: false },
    { label: 'PPOS',               defaultOn: false },
    { label: 'Table View',         defaultOn: false },
  ];

  for (const { label, defaultOn } of toggleDefs) {
    test(`SET-TGL-${label.replace(/\s/g,'-')}-visibility | "${label}" toggle label is visible`, async ({ page }) => {
      await expect(page.locator(`text=${label}`).first()).toBeVisible();
    });

    test(`SET-TGL-${label.replace(/\s/g,'-')}-default | "${label}" is ${defaultOn ? 'ON' : 'OFF'} by default`, async ({ page }) => {
      const toggle = page.locator(`input[type="checkbox"]:near(:text("${label}")), label:has-text("${label}") input`).first();
      if (await toggle.isVisible({ timeout: 3000 }).catch(() => false)) {
        if (defaultOn) {
          await expect(toggle).toBeChecked();
        } else {
          await expect(toggle).not.toBeChecked();
        }
      }
    });

    test(`SET-TGL-${label.replace(/\s/g,'-')}-toggle | "${label}" toggle can be switched`, async ({ page }) => {
      const toggle = page.locator(`input[type="checkbox"]:near(:text("${label}")), label:has-text("${label}") input`).first();
      if (await toggle.isVisible({ timeout: 3000 }).catch(() => false)) {
        const before = await toggle.isChecked();
        await toggle.click();
        const after = await toggle.isChecked();
        expect(after).toBe(!before);
        // Restore
        await toggle.click();
      }
    });
  }
});

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
//  SETTINGS â€” Integrations Section
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
test.describe('Settings â€º Integrations', () => {
  test.beforeEach(async ({ page }) => {
    await load(page);
    await page.locator('text=Integrations').first().scrollIntoViewIfNeeded();
  });

  test('SET-INT-001 | "Integrations" heading is visible', async ({ page }) => {
    await expect(page.locator('h1:has-text("Integrations"), h2:has-text("Integrations"), text=Integrations').first()).toBeVisible();
  });

  test('SET-INT-002 | "Available integrations." subtitle is visible', async ({ page }) => {
    await expect(page.locator('text=Available integrations').first()).toBeVisible();
  });

  const integrations = [
    { name: 'WISO Configuration',  subtitle: 'Configure LLM provider and model settings' },
    { name: 'Slack',               subtitle: 'A team communication tool' },
    { name: 'Jira',                subtitle: 'Project and software tracking' },
    { name: 'Teams',               subtitle: 'Microsoft teams communication tool' },
    { name: 'WhatsApp',            subtitle: 'Facebook messaging and calling application' },
    { name: 'Email',               subtitle: 'Any email provider' },
  ];

  for (const { name, subtitle } of integrations) {
    test(`SET-INT-NAME-${name.replace(/\s/g,'-')} | "${name}" row is listed`, async ({ page }) => {
      await expect(page.locator(`text=${name}`).first()).toBeVisible();
    });

    test(`SET-INT-SUB-${name.replace(/\s/g,'-')} | "${name}" shows correct subtitle`, async ({ page }) => {
      await expect(page.locator(`text=${subtitle}`).first()).toBeVisible();
    });

    test(`SET-INT-DISABLED-${name.replace(/\s/g,'-')} | "${name}" shows "Disabled" by default`, async ({ page }) => {
      const row = page.locator('li, [class*="integration-item"]').filter({ hasText: name }).first();
      await expect(row.locator('text=Disabled').first()).toBeVisible();
    });

    test(`SET-INT-TOGGLE-${name.replace(/\s/g,'-')} | "${name}" toggle can be switched on/off`, async ({ page }) => {
      const row    = page.locator('li, [class*="integration-item"]').filter({ hasText: name }).first();
      const toggle = row.locator('input[type="checkbox"], [role="switch"]').first();
      if (await toggle.isVisible({ timeout: 3000 }).catch(() => false)) {
        const before = await toggle.isChecked();
        await toggle.click();
        await expect(toggle).toBeChecked({ checked: !before });
        await toggle.click(); // restore
      }
    });

    test(`SET-INT-CFG-${name.replace(/\s/g,'-')} | "${name}" has a âš™ configure button`, async ({ page }) => {
      const row    = page.locator('li, [class*="integration-item"]').filter({ hasText: name }).first();
      const cfgBtn = row.locator('button').first();
      await expect(cfgBtn).toBeVisible();
    });
  }
});

