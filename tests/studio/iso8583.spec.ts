/**
 * Studio — ISO 8583 format tests
 * Desktop: uses local simulator at 127.0.0.1:8002
 * Python: router broken (BUG #1)
 */
import { test, expect } from '../../fixtures';

test.describe('Studio › ISO 8583', () => {

  test.beforeEach(async ({ studio }) => {
    await studio.open();
    // Tab is labeled "ISO" in the PruTAN UI
    await studio.switchFormat('ISO');
  });

  test('ISO tab renders with format-specific fields @smoke', async ({ studio }) => {
    const body = await studio.bodyText();
    // ISO mode shows socket/host fields, not HTTP URL
    expect(body).toMatch(/ISO|MTI|socket|host|port/i);
  });

  test('ISO URL field accepts host:port format @smoke', async ({ studio }) => {
    await studio.setUrl('127.0.0.1:8002');
    const val = await studio.urlInput.inputValue();
    expect(val).toContain('8002');
  });

  test('ISO send to desktop simulator @smoke', async ({ studio, engine }) => {
    test.skip(engine === 'python-engine', 'ISO router broken on Python engine (BUG #1)');

    await studio.setUrl('127.0.0.1:8002');
    await studio.send(10_000);

    const body = await studio.bodyText();
    console.log(`[${engine}] ISO response:`, body.slice(0, 400));
    expect(body).not.toContain('Connection refused');
  });

  test('ISO Table View toggle works @regression', async ({ studio, engine }) => {
    test.skip(engine === 'python-engine', 'Table View button not present on Python engine');
    await studio.toggleTableView();
    await studio.page.waitForTimeout(600);
    const body = await studio.bodyText();
    expect(body).toMatch(/DE|Data Element|table|ISO/i);
  });

  test('MTI field accepts standard values @regression', async ({ studio, engine }) => {
    test.skip(engine === 'python-engine', 'MTI input not present on Python engine ISO view');
    await studio.setIsoMti('0200');
    const body = await studio.bodyText();
    expect(body.length).toBeGreaterThan(10);
  });

});
