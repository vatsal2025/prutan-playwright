/**
 * Sandbox — REST tests
 * Desktop: uses pre-loaded user_cart_service collection
 * Python: collection may differ — tests adapt
 */
import { test, expect } from '../../fixtures';

test.describe('Sandbox › REST', () => {

  test('Sandbox home page loads @smoke', async ({ sandbox }) => {
    await sandbox.open('REST');
    const body = await sandbox.bodyText();
    expect(body).toMatch(/Sandbox|Host|Collection/i);
  });

  test('Sandbox Start button is present @smoke', async ({ sandbox }) => {
    await sandbox.open('REST');
    await expect(sandbox.startButton).toBeVisible({ timeout: 5000 });
  });

  test('Start existing collection — desktop @regression', async ({ sandbox, engine }) => {
    test.skip(engine === 'python-engine', 'user_cart_service pre-loaded only on Desktop');

    await sandbox.open('REST');
    await sandbox.openCollection('user_cart_service', 'get_user_details');
    await sandbox.start(5000);
    await sandbox.expectStarted();
    await sandbox.stop();
  });

  test('Rules tab is accessible after opening a request @regression', async ({ sandbox, engine }) => {
    test.skip(engine === 'python-engine', 'No pre-loaded sandbox collection on Python engine');

    await sandbox.open('REST');
    await sandbox.openCollection('user_cart_service', 'get_user_details');
    await sandbox.viewRules();
    const body = await sandbox.bodyText();
    expect(body).toMatch(/Rule|Script|JavaScript/i);
  });

  test('Analytics tab is accessible @regression', async ({ sandbox, engine }) => {
    test.skip(engine === 'python-engine', 'Requires running sandbox on Desktop');

    await sandbox.open('REST');
    await sandbox.openCollection('user_cart_service', 'get_user_details');
    await sandbox.start(3000);
    await sandbox.viewAnalytics();
    await sandbox.stop();
  });

});
