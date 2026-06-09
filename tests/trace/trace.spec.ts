/**
 * Trace module tests
 * BUG #3: Desktop Trace search returns error 9999 (no mastertracing rows)
 * Python: Trace depends on router being alive (BUG #1 means it may not work)
 */
import { test, expect } from '../../fixtures';

test.describe('Trace', () => {

  test('Trace page loads @smoke', async ({ traceModule }) => {
    await traceModule.open();
    const body = await traceModule.bodyText();
    expect(body).toMatch(/Trace|Search|Identifier/i);
  });

  test('Search button is present @smoke', async ({ traceModule }) => {
    await traceModule.open();
    await expect(traceModule.searchButton).toBeVisible({ timeout: 5000 });
  });

  test('Empty search executes without JS crash @smoke', async ({ traceModule, engine }) => {
    await traceModule.open();
    await traceModule.search({}, 5000);
    const body = await traceModule.bodyText();
    console.log(`[${engine}] Trace empty search result:`, body.slice(0, 400));
    expect(body).not.toContain('undefined is not');
  });

  test('Desktop Trace — known BUG #3 error 9999 @regression', async ({ traceModule, engine }) => {
    test.skip(engine === 'python-engine', 'BUG #3 only applies to Desktop');

    await traceModule.open();
    await traceModule.search({}, 5000);
    const body = await traceModule.bodyText();
    if (body.includes('9999')) {
      console.warn('[BUG #3] Trace search returns error 9999 on Desktop — mastertracing table empty');
    }
    await traceModule.expectNoError9999();
  });

  test('Trace with identifier input @regression', async ({ traceModule }) => {
    await traceModule.open();
    await traceModule.identifierInput.fill('test-trace-001').catch(() => {});
    await traceModule.search({}, 5000);
    const body = await traceModule.bodyText();
    console.log('Trace identifier search:', body.slice(0, 300));
    expect(body).not.toContain('undefined is not');
  });

});
