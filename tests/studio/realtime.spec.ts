/**
 * Studio — Realtime (Kafka/SQS) format tests
 * UI-only tests — no real Kafka broker in test env.
 */
import { test, expect } from '../../fixtures';

test.describe('Studio › Realtime', () => {

  test.beforeEach(async ({ studio }) => {
    await studio.open();
    // Tab label is "Realtime" in PruTAN UI
    await studio.switchFormat('Realtime');
  });

  test('Realtime tab renders @smoke', async ({ studio }) => {
    const body = await studio.bodyText();
    expect(body).toMatch(/Realtime|Kafka|SQS|broker|topic|mqtt|websocket/i);
  });

  test('URL field visible for broker endpoint @smoke', async ({ studio }) => {
    await expect(studio.urlInput).toBeVisible();
  });

  test('Realtime does not crash on navigation @regression', async ({ studio }) => {
    await studio.page.waitForTimeout(1000);
    const body = await studio.bodyText();
    expect(body).not.toContain('404');
  });

});
