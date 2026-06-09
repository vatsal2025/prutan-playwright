/**
 * Sandbox — ISO 8583 tests
 * Desktop has pre-loaded atm_transaction collection with ISO simulator at :8002
 */
import { test, expect } from '../../fixtures';

test.describe('Sandbox › ISO', () => {

  test('ISO Sandbox tab renders @smoke', async ({ sandbox }) => {
    await sandbox.open('ISO');
    const body = await sandbox.bodyText();
    expect(body).toMatch(/ISO|Sandbox|Collection/i);
  });

  test('ISO Sandbox start — desktop atm_transaction @regression', async ({ sandbox, engine }) => {
    test.skip(engine === 'python-engine', 'ISO simulator only on Desktop');

    await sandbox.open('ISO');
    await sandbox.openCollection('atm_transaction', 'balance_inquiry');
    await sandbox.start(5000);
    await sandbox.expectStarted();
    await sandbox.stop();
  });

  test('ISO Sandbox rules tab @regression', async ({ sandbox, engine }) => {
    test.skip(engine === 'python-engine', 'ISO simulator only on Desktop');

    await sandbox.open('ISO');
    await sandbox.openCollection('atm_transaction', 'balance_inquiry');
    await sandbox.viewRules();
    const body = await sandbox.bodyText();
    expect(body).toMatch(/Rule|Script/i);
  });

});
