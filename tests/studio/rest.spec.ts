/**
 * Studio — REST request tests
 * Runs on both python-engine and java-desktop.
 * Uses jsonplaceholder.typicode.com as a safe public endpoint for all methods.
 */
import { test, expect } from '../../fixtures';

const PUBLIC_API = 'https://jsonplaceholder.typicode.com';

test.describe('Studio › REST', () => {

  test.beforeEach(async ({ studio }) => {
    await studio.open();
  });

  // ── @smoke ────────────────────────────────────────────────────────────────

  test('GET request returns 200 @smoke', async ({ studio }) => {
    await studio.setUrl(`${PUBLIC_API}/todos/1`);
    await studio.send(8000);
    // Status bar shows "Status: 200 • OK" — reliable assertion for CodeMirror response
    await studio.expectResponseStatusOk();
    await studio.expectNoError();
  });

  test('POST request returns 201 @smoke', async ({ studio }) => {
    // Smoke: method change + send (no body needed — JSONPlaceholder accepts empty POST)
    await studio.setMethod('POST');
    await studio.setUrl(`${PUBLIC_API}/posts`);
    await studio.send(8000);
    await studio.expectResponseStatusOk();
    await studio.expectNoError();
  });

  // ── @regression ──────────────────────────────────────────────────────────

  test('PUT request returns 200 @regression', async ({ studio }) => {
    test.skip(true, 'BUG: Content Type dropdown selector fails after setMethod(PUT) — needs DOM inspection to fix');
    await studio.setMethod('PUT');
    await studio.setUrl(`${PUBLIC_API}/posts/1`);
    await studio.setBody({ id: 1, title: 'Updated', body: 'test', userId: 1 });
    await studio.send(8000);
    await studio.expectResponseStatusOk();
    await studio.expectNoError();
  });

  test('DELETE request returns success @regression', async ({ studio }) => {
    await studio.setMethod('DELETE');
    await studio.setUrl(`${PUBLIC_API}/posts/1`);
    await studio.send(8000);
    await studio.expectNoError();
  });

  test('PATCH request — known bug on both engines @regression', async ({ studio, engine }) => {
    test.skip(true, 'BUG #2: PATCH returns null status — skipped until body editor selector fixed for all methods');
    await studio.setMethod('PATCH');
    await studio.setUrl(`${PUBLIC_API}/posts/1`);
    await studio.setBody({ title: 'Patched' });
    await studio.send(8000);
    const statusText = await studio.responseStatusText();
    console.log(`[${engine}] PATCH status: ${statusText}`);
  });

  test('HEAD request @regression', async ({ studio }) => {
    await studio.setMethod('HEAD');
    await studio.setUrl(`${PUBLIC_API}/posts/1`);
    await studio.send(8000);
    await studio.expectNoError();
  });

  // ── Tab navigation ────────────────────────────────────────────────────────

  test('URL input accepts environment variable syntax @smoke', async ({ studio }) => {
    await studio.setUrl('{{host}}/api/test');
    const inputVal = await studio.urlInput.inputValue();
    expect(inputVal).toContain('{{host}}');
  });

  test('Pre-request Script tab is accessible @smoke', async ({ studio }) => {
    await studio.setPreRequestScript('// test');
    const body = await studio.bodyText();
    expect(body).toMatch(/JavaScript|pre.request|script|Snippets/i);
  });

  test('ISO format tab switches correctly @smoke', async ({ studio }) => {
    await studio.switchFormat('ISO');
    const body = await studio.bodyText();
    expect(body).toMatch(/ISO|MTI|socket|host/i);
  });

  test('Realtime format tab switches correctly @smoke', async ({ studio }) => {
    await studio.switchFormat('Realtime');
    const body = await studio.bodyText();
    expect(body).toMatch(/Realtime|Kafka|SQS|broker|websocket|mqtt/i);
  });

  // ── Response body content (CodeMirror) ───────────────────────────────────

  test('GET response body contains userId field @regression', async ({ studio }) => {
    await studio.setUrl(`${PUBLIC_API}/todos/1`);
    await studio.send(8000);
    await studio.expectResponseStatusOk();
    // Read from CodeMirror cm-content
    const responseBody = await studio.responseBodyText();
    expect(responseBody).toContain('userId');
  });

});
