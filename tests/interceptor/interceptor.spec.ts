/**
 * Interceptor tests — REST
 * Desktop: pre-loaded user_cart_service collection
 */
import { test, expect } from '../../fixtures';

test.describe('Interceptor', () => {

  test('Interceptor page loads @smoke', async ({ interceptor }) => {
    await interceptor.open();
    const body = await interceptor.bodyText();
    expect(body).toMatch(/Interceptor|Collection/i);
  });

  test('Start button visible @smoke', async ({ interceptor }) => {
    await interceptor.open();
    await expect(interceptor.startButton).toBeVisible({ timeout: 5000 });
  });

  test('Start interceptor — desktop @regression', async ({ interceptor, engine }) => {
    test.skip(engine === 'python-engine', 'Requires pre-loaded Desktop collection');

    await interceptor.open();
    await interceptor.openCollection('user_cart_service', 'get_user_details');
    await interceptor.start(5000);
    await interceptor.expectStarted();
    await interceptor.stop();
  });

  test('Rules tab accessible @regression', async ({ interceptor, engine }) => {
    test.skip(engine === 'python-engine', 'Requires pre-loaded Desktop collection');

    await interceptor.open();
    await interceptor.openCollection('user_cart_service', 'get_user_details');
    await interceptor.viewRules();
    const body = await interceptor.bodyText();
    expect(body).toMatch(/Rule|Request Rule|Response Rule/i);
  });

  test('Interceptor does not crash on open @smoke', async ({ interceptor }) => {
    await interceptor.open();
    await interceptor.page.waitForTimeout(1000);
    const body = await interceptor.bodyText();
    expect(body).not.toContain('404');
  });

});
