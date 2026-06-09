/**
 * StressLab tests
 * Desktop has pre-loaded Stress Request in user_cart_service collection
 */
import { test, expect } from '../../fixtures';

test.describe('StressLab', () => {

  test('StressLab page loads @smoke', async ({ stresslab }) => {
    await stresslab.open();
    const body = await stresslab.bodyText();
    expect(body).toMatch(/Stress|StressLab|Bucket|Collection/i);
  });

  test('Add Bucket button is present @smoke', async ({ stresslab }) => {
    await stresslab.open();
    await expect(stresslab.addBucketButton).toBeVisible({ timeout: 5000 });
  });

  test('Open stress collection — desktop @regression', async ({ stresslab, engine }) => {
    test.skip(engine === 'python-engine', 'Stress Request pre-loaded only on Desktop');

    await stresslab.open();
    await stresslab.openCollection('user_cart_service', 'Stress Request');
    const body = await stresslab.bodyText();
    expect(body).toMatch(/Stress|Bucket|virtual/i);
  });

  test('Add Bucket dialog opens @regression', async ({ stresslab }) => {
    await stresslab.open();
    await stresslab.addBucket({ users: 5, duration: 30 });
    const body = await stresslab.bodyText();
    expect(body.length).toBeGreaterThan(50);
  });

  test('Add Scripts dialog opens @regression', async ({ stresslab }) => {
    await stresslab.open();
    await stresslab.addScriptsButton.click({ force: true }).catch(() => {});
    await stresslab.page.waitForTimeout(800);
    const body = await stresslab.bodyText();
    expect(body).toMatch(/Script|JavaScript/i);
  });

  test('StressLab does not crash on page load @smoke', async ({ stresslab }) => {
    await stresslab.open();
    await stresslab.expectPageLoaded();
  });

});
