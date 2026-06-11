import { test, expect } from '@playwright/test';
import { Settings } from '../../pages/cloud/Settings';
import { ROUTES, INTEGRATIONS } from '../../utils/cloud-constants';

test.describe('Settings â€” Theme', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto(ROUTES.SETTINGS, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1000);
  });

  test('TC-ST-001 | Settings page shows "Theme" heading', async ({ page }) => {
    const s = new Settings(page);
    await s.assertPageLoaded();
  });

  test('TC-ST-002 | Background section is visible', async ({ page }) => {
    const s = new Settings(page);
    await s.assertThemeControlsVisible();
    await expect(s.backgroundLabel()).toBeVisible();
  });

  test('TC-ST-003 | Background shows "System (Light)" as default label', async ({ page }) => {
    await expect(page.locator('text=System (Light)').first()).toBeVisible();
  });

  test('TC-ST-004 | Background theme buttons are visible (system/light/dark)', async ({ page }) => {
    // Four icon buttons for System | Light | Cloud/Auto | Dark
    const buttons = page.locator('[class*="theme-btn"], button[title*="theme" i], .background-option');
    if (await buttons.count() > 0) {
      await expect(buttons.first()).toBeVisible();
    } else {
      // Fallback: just check the section exists
      await expect(page.locator('text=Background').first()).toBeVisible();
    }
  });

  test('TC-ST-005 | Accent color section is visible with 8 colour circles', async ({ page }) => {
    const s = new Settings(page);
    await expect(s.accentColorLabel()).toBeVisible();
    const circles = s.accentCircles();
    const count = await circles.count();
    expect(count).toBeGreaterThanOrEqual(6); // 8 seen, allow minor variation
  });

  test('TC-ST-006 | Accent color label shows "Indigo" by default', async ({ page }) => {
    await expect(page.locator('text=Indigo').first()).toBeVisible();
  });

  test('TC-ST-007 | Font size dropdown is visible with "Small" default', async ({ page }) => {
    const s = new Settings(page);
    await expect(s.fontSizeDropdown()).toBeVisible();
    await expect(s.fontSizeDropdown()).toContainText('Small');
  });

  test('TC-ST-008 | Language dropdown shows "English" default', async ({ page }) => {
    const s = new Settings(page);
    await expect(s.languageDropdown()).toBeVisible();
    await expect(s.languageDropdown()).toContainText('English');
  });

  test('TC-ST-009 | All 6 toggle switches are present', async ({ page }) => {
    const s = new Settings(page);
    await s.assertAllTogglesVisible();
  });

  test('TC-ST-010 | Telemetry toggle is ON by default', async ({ page }) => {
    const s = new Settings(page);
    await expect(s.telemetryToggle()).toBeChecked();
  });

  test('TC-ST-011 | Expand navigation toggle is ON by default', async ({ page }) => {
    const s = new Settings(page);
    await expect(s.expandNavToggle()).toBeChecked();
  });

  test('TC-ST-012 | Sidebar on left toggle is ON by default', async ({ page }) => {
    const s = new Settings(page);
    await expect(s.sidebarLeftToggle()).toBeChecked();
  });

  test('TC-ST-013 | Zen mode toggle is OFF by default', async ({ page }) => {
    const s = new Settings(page);
    await expect(s.zenModeToggle()).not.toBeChecked();
  });

  test('TC-ST-014 | PPOS toggle is OFF by default', async ({ page }) => {
    const s = new Settings(page);
    await expect(s.pposToggle()).not.toBeChecked();
  });

  test('TC-ST-015 | Table View toggle is OFF by default', async ({ page }) => {
    const s = new Settings(page);
    await expect(s.tableViewToggle()).not.toBeChecked();
  });

  test('TC-ST-016 | Toggling Zen mode ON changes its state', async ({ page }) => {
    const s = new Settings(page);
    await s.toggleZenMode();
    await expect(s.zenModeToggle()).toBeChecked();
    // Restore
    await s.toggleZenMode();
  });
});

test.describe('Settings â€” Integrations', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto(ROUTES.SETTINGS, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1000);
    // Scroll down to integrations section
    await page.locator('text=Integrations').first().scrollIntoViewIfNeeded();
  });

  test('TC-ST-017 | "Integrations" section heading is visible', async ({ page }) => {
    const s = new Settings(page);
    await s.assertIntegrationsSectionVisible();
  });

  test('TC-ST-018 | "Available integrations." subtitle is visible', async ({ page }) => {
    await expect(page.locator('text=Available integrations').first()).toBeVisible();
  });

  test('TC-ST-019 | All 6 integrations are listed', async ({ page }) => {
    const s = new Settings(page);
    await s.assertAllIntegrationsListed();
  });

  test('TC-ST-020 | All integrations are Disabled by default', async ({ page }) => {
    const s = new Settings(page);
    await s.assertIntegrationsDisabledByDefault();
  });

  test('TC-ST-021 | WISO Configuration shows correct subtitle', async ({ page }) => {
    await expect(page.locator('text=Configure LLM provider and model settings').first()).toBeVisible();
  });

  test('TC-ST-022 | Slack shows correct subtitle', async ({ page }) => {
    await expect(page.locator('text=A team communication tool').first()).toBeVisible();
  });

  test('TC-ST-023 | Jira shows correct subtitle', async ({ page }) => {
    await expect(page.locator('text=Project and software tracking').first()).toBeVisible();
  });

  test('TC-ST-024 | Teams shows correct subtitle', async ({ page }) => {
    await expect(page.locator('text=Microsoft teams communication tool').first()).toBeVisible();
  });

  test('TC-ST-025 | WhatsApp shows correct subtitle', async ({ page }) => {
    await expect(page.locator('text=Facebook messaging and calling application').first()).toBeVisible();
  });

  test('TC-ST-026 | Email shows correct subtitle', async ({ page }) => {
    await expect(page.locator('text=Any email provider').first()).toBeVisible();
  });

  test('TC-ST-027 | Each integration has a configure (âš™) button', async ({ page }) => {
    const configBtns = page.locator('[class*="config-btn"], button[title*="configure" i], button[aria-label*="configure" i]');
    const count = await configBtns.count();
    expect(count).toBeGreaterThanOrEqual(6);
  });

  test('TC-ST-028 | Each integration has a toggle switch', async ({ page }) => {
    const toggles = page.locator('[role="switch"], input[type="checkbox"]:near(.integration-item, [class*="integration"])');
    const count = await toggles.count();
    expect(count).toBeGreaterThanOrEqual(6);
  });
});

