import { test, expect } from '@playwright/test';
import { StressLab } from '../../pages/cloud/StressLab';
import { ROUTES } from '../../utils/cloud-constants';

test.describe('Stress Lab', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto(ROUTES.STRESS_LAB, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1500);
  });

  test('TC-SL-001 | Page shows "Stress Test Configuration" heading', async ({ page }) => {
    const sl = new StressLab(page);
    await sl.assertPageLoaded();
  });

  test('TC-SL-002 | Mode radios "Volume" and "Duration" are present', async ({ page }) => {
    const sl = new StressLab(page);
    await sl.assertModeRadiosVisible();
  });

  test('TC-SL-003 | "Duration" mode is selected by default', async ({ page }) => {
    const durationRadio = page.locator('label:has-text("Duration"), input[value*="duration" i]').first();
    await expect(durationRadio).toBeVisible();
    // Duration should be the checked option
    const checked = page.locator('input[type="radio"]:checked');
    const checkedLabel = await checked.first().evaluate(el =>
      (el as HTMLInputElement).value || el.closest('label')?.textContent || ''
    );
    expect(checkedLabel.toLowerCase()).toContain('duration');
  });

  test('TC-SL-004 | Selecting "Volume" mode changes selection', async ({ page }) => {
    const sl = new StressLab(page);
    await sl.setMode('Volume');
    const volumeEl = page.locator('label:has-text("Volume") input, input[value*="volume" i]').first();
    await expect(volumeEl).toBeChecked();
  });

  test('TC-SL-005 | General section: Virtual users default = 10', async ({ page }) => {
    const sl = new StressLab(page);
    await expect(sl.virtualUsersInput()).toHaveValue('10');
  });

  test('TC-SL-006 | General section: Timeout(ms) default = 1000', async ({ page }) => {
    const sl = new StressLab(page);
    await expect(sl.timeoutInput()).toHaveValue('1000');
  });

  test('TC-SL-007 | General section: Delay(ms) default = 1000', async ({ page }) => {
    const sl = new StressLab(page);
    await expect(sl.delayInput()).toHaveValue('1000');
  });

  test('TC-SL-008 | General section: Warm-up(ms) default = 1000', async ({ page }) => {
    const sl = new StressLab(page);
    await expect(sl.warmupInput()).toHaveValue('1000');
  });

  test('TC-SL-009 | General section: Execution Timeout default = 1000', async ({ page }) => {
    const sl = new StressLab(page);
    await expect(sl.execTimeoutInput()).toHaveValue('1000');
  });

  test('TC-SL-010 | Benchmark section: Type dropdown shows "Constant"', async ({ page }) => {
    const sl = new StressLab(page);
    await expect(sl.benchmarkTypeDropdown()).toHaveValue('Constant');
  });

  test('TC-SL-011 | Benchmark section: Threshold and Select Host inputs present', async ({ page }) => {
    const sl = new StressLab(page);
    await expect(sl.thresholdInput().or(page.locator('text=Threshold').first())).toBeVisible();
    await expect(sl.selectHostInput().or(page.locator('text=Select Host').first())).toBeVisible();
  });

  test('TC-SL-012 | "No buckets defined" empty state shown initially', async ({ page }) => {
    const sl = new StressLab(page);
    await sl.assertNoBucketsEmpty();
  });

  test('TC-SL-013 | "+ Add Bucket" button is clickable', async ({ page }) => {
    const sl = new StressLab(page);
    await expect(sl.addBucketBtn()).toBeEnabled();
    await sl.clickAddBucket();
    // After clicking, a bucket row or dialog should appear
    await page.waitForTimeout(500);
    await expect(page.locator('body')).not.toContainText('Error');
  });

  test('TC-SL-014 | Test Scripts panel shows "No scripts added" initially', async ({ page }) => {
    const sl = new StressLab(page);
    await sl.assertNoScriptsEmpty();
  });

  test('TC-SL-015 | "+ Add Scripts" button is clickable', async ({ page }) => {
    const sl = new StressLab(page);
    await expect(sl.addScriptsBtn()).toBeEnabled();
  });

  test('TC-SL-016 | Virtual users input accepts numeric input', async ({ page }) => {
    const sl = new StressLab(page);
    await sl.fillGeneralConfig({ virtualUsers: '50' });
    await expect(sl.virtualUsersInput()).toHaveValue('50');
  });

  test('TC-SL-017 | Collections panel is still visible in Stress Lab', async ({ page }) => {
    await expect(page.locator('text=Collections').first()).toBeVisible();
    await expect(page.locator('button:has-text("New"), .new-btn').first()).toBeVisible();
  });
});

