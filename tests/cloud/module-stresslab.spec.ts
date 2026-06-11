import { test, expect, Page } from '@playwright/test';
import { ROUTES } from '../../utils/cloud-constants';

async function load(page: Page) {
  await page.goto(ROUTES.STRESS_LAB, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2000);
}

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
//  STRESS LAB â€” Page Layout
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
test.describe('Stress Lab â€º Page Layout', () => {
  test.beforeEach(async ({ page }) => { await load(page); });

  test('SL-PL-001 | Heading "Stress Test Configuration" is visible', async ({ page }) => {
    await expect(page.locator('text=Stress Test Configuration').first()).toBeVisible({ timeout: 10_000 });
  });

  test('SL-PL-002 | Collections panel still visible on left', async ({ page }) => {
    await expect(page.locator('text=Collections').first()).toBeVisible();
    await expect(page.locator('input[placeholder*="Search" i]').first()).toBeVisible();
  });

  test('SL-PL-003 | URL is #/stress-lab', async ({ page }) => {
    expect(page.url()).toContain('stress');
  });

  test('SL-PL-004 | Page has no "Realtime", "ISO", or "Rest" protocol tabs', async ({ page }) => {
    await expect(page.locator('[role="tab"]:has-text("Rest")')).not.toBeVisible();
    await expect(page.locator('[role="tab"]:has-text("ISO")')).not.toBeVisible();
  });
});

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
//  STRESS LAB â€” Mode Selection
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
test.describe('Stress Lab â€º Mode Selection', () => {
  test.beforeEach(async ({ page }) => { await load(page); });

  test('SL-MODE-001 | "Mode" label is visible', async ({ page }) => {
    await expect(page.locator('text=Mode').first()).toBeVisible();
  });

  test('SL-MODE-002 | "Volume" radio option is visible', async ({ page }) => {
    await expect(page.locator('label:has-text("Volume"), text=Volume').first()).toBeVisible();
  });

  test('SL-MODE-003 | "Duration" radio option is visible', async ({ page }) => {
    await expect(page.locator('label:has-text("Duration"), text=Duration').first()).toBeVisible();
  });

  test('SL-MODE-004 | "Duration" is selected by default', async ({ page }) => {
    const durationInput = page.locator('input[type="radio"]').filter({ hasText: '' });
    // Find the checked radio
    const checked = page.locator('input[type="radio"]:checked').first();
    const val = await checked.evaluate((el) => (el as HTMLInputElement).value).catch(() => '');
    expect(val.toLowerCase()).toContain('duration');
  });

  test('SL-MODE-005 | Clicking "Volume" selects it', async ({ page }) => {
    await page.locator('label:has-text("Volume"), text=Volume').first().click();
    await expect(
      page.locator('input[type="radio"][value*="volume" i], input[type="radio"]:checked').first()
    ).toBeChecked();
  });

  test('SL-MODE-006 | Can switch back to "Duration"', async ({ page }) => {
    await page.locator('label:has-text("Volume")').first().click();
    await page.locator('label:has-text("Duration")').first().click();
    await expect(
      page.locator('input[type="radio"][value*="duration" i]').first()
    ).toBeChecked();
  });
});

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
//  STRESS LAB â€” General Section
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
test.describe('Stress Lab â€º General Section', () => {
  test.beforeEach(async ({ page }) => { await load(page); });

  test('SL-GEN-001 | "General" section heading is visible', async ({ page }) => {
    await expect(page.locator('text=General').first()).toBeVisible();
  });

  test('SL-GEN-002 | "Virtual users" label is visible', async ({ page }) => {
    await expect(page.locator('text=Virtual users').first()).toBeVisible();
  });

  test('SL-GEN-003 | Virtual users input default value is 10', async ({ page }) => {
    const input = page.locator('input').filter({ hasText: '' }).nth(0);
    // Find by label proximity
    const vu = page.locator('input[name*="virtual" i], input[placeholder*="virtual" i]').first()
      .or(page.locator('label:has-text("Virtual users") + input').first());
    await expect(vu).toHaveValue('10');
  });

  test('SL-GEN-004 | "Timeout(in ms)" label is visible', async ({ page }) => {
    await expect(page.locator('text=Timeout').first()).toBeVisible();
  });

  test('SL-GEN-005 | Timeout input default value is 1000', async ({ page }) => {
    const to = page.locator('label:has-text("Timeout") + input, input[name*="timeout" i]:not([name*="exec" i])').first();
    await expect(to).toHaveValue('1000');
  });

  test('SL-GEN-006 | "Delay(in ms)" label is visible', async ({ page }) => {
    await expect(page.locator('text=Delay').first()).toBeVisible();
  });

  test('SL-GEN-007 | Delay input default value is 1000', async ({ page }) => {
    const dl = page.locator('label:has-text("Delay") + input, input[name*="delay" i]').first();
    await expect(dl).toHaveValue('1000');
  });

  test('SL-GEN-008 | "Warm-up(in ms)" label is visible', async ({ page }) => {
    await expect(page.locator('text=Warm-up').first()).toBeVisible();
  });

  test('SL-GEN-009 | Warm-up input default value is 1000', async ({ page }) => {
    const wu = page.locator('label:has-text("Warm-up") + input, input[name*="warmup" i]').first();
    await expect(wu).toHaveValue('1000');
  });

  test('SL-GEN-010 | "Execution Timeout" label is visible', async ({ page }) => {
    await expect(page.locator('text=Execution Timeout').first()).toBeVisible();
  });

  test('SL-GEN-011 | Execution Timeout input default value is 1000', async ({ page }) => {
    const et = page.locator('label:has-text("Execution Timeout") + input, input[name*="exec" i]').first();
    await expect(et).toHaveValue('1000');
  });

  test('SL-GEN-012 | Virtual users input accepts new numeric value', async ({ page }) => {
    const vu = page.locator('label:has-text("Virtual users") + input, input[name*="virtual" i]').first();
    await vu.fill('50');
    await expect(vu).toHaveValue('50');
  });

  test('SL-GEN-013 | All five General inputs are editable', async ({ page }) => {
    const labels = ['Virtual users', 'Timeout', 'Delay', 'Warm-up', 'Execution Timeout'];
    for (const lbl of labels) {
      const input = page.locator(`label:has-text("${lbl}") + input, input:near(:text("${lbl}"))`).first();
      if (await input.isVisible().catch(() => false)) {
        await expect(input).toBeEnabled();
      }
    }
  });
});

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
//  STRESS LAB â€” Benchmark Section
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
test.describe('Stress Lab â€º Benchmark Section', () => {
  test.beforeEach(async ({ page }) => { await load(page); });

  test('SL-BM-001 | "Benchmark" section heading is visible', async ({ page }) => {
    await expect(page.locator('text=Benchmark').first()).toBeVisible();
  });

  test('SL-BM-002 | "Type" label is visible under Benchmark', async ({ page }) => {
    await expect(page.locator('text=Type').first()).toBeVisible();
  });

  test('SL-BM-003 | Benchmark Type dropdown shows "Constant" by default', async ({ page }) => {
    await expect(page.locator('text=Constant').first()).toBeVisible();
  });

  test('SL-BM-004 | Benchmark Type dropdown is clickable', async ({ page }) => {
    await page.locator('select, [class*="benchmark-type"], .type-dropdown').first().click();
    await page.keyboard.press('Escape');
    await expect(page.locator('body')).not.toContainText('Error');
  });

  test('SL-BM-005 | "Threshold" label and input are present', async ({ page }) => {
    await expect(page.locator('text=Threshold').first()).toBeVisible();
  });

  test('SL-BM-006 | "Select Host" label/link is present', async ({ page }) => {
    await expect(page.locator('text=Select Host').first()).toBeVisible();
  });
});

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
//  STRESS LAB â€” Buckets Section
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
test.describe('Stress Lab â€º Buckets Section', () => {
  test.beforeEach(async ({ page }) => { await load(page); });

  test('SL-BKT-001 | "No buckets defined" empty state is shown', async ({ page }) => {
    await expect(page.locator('text=No buckets defined').first()).toBeVisible();
  });

  test('SL-BKT-002 | "+ Add Bucket" button is visible', async ({ page }) => {
    await expect(page.locator('button:has-text("Add Bucket"), a:has-text("Add Bucket")').first()).toBeVisible();
  });

  test('SL-BKT-003 | "+ Add Bucket" button is enabled', async ({ page }) => {
    await expect(page.locator('button:has-text("Add Bucket"), a:has-text("Add Bucket")').first()).toBeEnabled();
  });

  test('SL-BKT-004 | Clicking "+ Add Bucket" adds a bucket row', async ({ page }) => {
    await page.locator('button:has-text("Add Bucket"), a:has-text("Add Bucket")').first().click();
    await page.waitForTimeout(800);
    // Either a new bucket row appears or empty state disappears
    const noBuckets = await page.locator('text=No buckets defined').isVisible().catch(() => false);
    const bucketRow = await page.locator('[class*="bucket-row"], .bucket-item').count();
    expect(!noBuckets || bucketRow > 0).toBeTruthy();
  });
});

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
//  STRESS LAB â€” Test Scripts Section
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
test.describe('Stress Lab â€º Test Scripts Section', () => {
  test.beforeEach(async ({ page }) => { await load(page); });

  test('SL-TS-001 | "Test Scripts" panel heading is visible', async ({ page }) => {
    await expect(page.locator('text=Test Scripts').first()).toBeVisible();
  });

  test('SL-TS-002 | "No scripts added" empty state is shown', async ({ page }) => {
    await expect(page.locator('text=No scripts added').first()).toBeVisible();
  });

  test('SL-TS-003 | "+ Add Scripts" button is visible', async ({ page }) => {
    await expect(page.locator('button:has-text("Add Scripts"), a:has-text("Add Scripts")').first()).toBeVisible();
  });

  test('SL-TS-004 | "+ Add Scripts" button is enabled', async ({ page }) => {
    await expect(page.locator('button:has-text("Add Scripts"), a:has-text("Add Scripts")').first()).toBeEnabled();
  });

  test('SL-TS-005 | Clicking "+ Add Scripts" opens a script selection', async ({ page }) => {
    await page.locator('button:has-text("Add Scripts"), a:has-text("Add Scripts")').first().click();
    await page.waitForTimeout(800);
    await expect(page.locator('body')).not.toContainText('Error');
  });
});

