import { Page, expect } from '@playwright/test';

export class StressLab {
  constructor(readonly page: Page) {}

  heading           = () => this.page.locator('text=Stress Test Configuration').first();
  volumeRadio       = () => this.page.getByRole('radio', { name: 'Volume' });
  durationRadio     = () => this.page.getByRole('radio', { name: 'Duration' });

  virtualUsersInput    = () => this.page.locator('input[placeholder*="virtual" i], label:has-text("Virtual users") + input, input[name*="virtualUsers"]').first();
  timeoutInput         = () => this.page.locator('label:has-text("Timeout") + input, input[name*="timeout"]:not([name*="execution"])').first();
  delayInput           = () => this.page.locator('label:has-text("Delay") + input, input[name*="delay"]').first();
  warmupInput          = () => this.page.locator('label:has-text("Warm-up") + input, input[name*="warmup"]').first();
  execTimeoutInput     = () => this.page.locator('label:has-text("Execution Timeout") + input, input[name*="execTimeout"]').first();

  benchmarkTypeDropdown = () => this.page.getByRole('textbox', { name: 'Type' });
  thresholdInput        = () => this.page.locator('input[placeholder*="threshold" i], label:has-text("Threshold") + input').first();
  selectHostInput       = () => this.page.locator('input[placeholder*="host" i], label:has-text("Select Host") + input, a:has-text("Select Host")').first();

  addBucketBtn     = () => this.page.locator('button:has-text("Add Bucket"), a:has-text("Add Bucket")').first();
  noBucketsMsg     = () => this.page.locator('text=No buckets defined').first();
  addScriptsBtn    = () => this.page.locator('button:has-text("Add Scripts"), a:has-text("Add Scripts"), button:has-text("+ Add Scripts")').first();
  noScriptsMsg     = () => this.page.locator('text=No scripts added').first();
  testScriptsPanel = () => this.page.locator('text=Test Scripts').first();

  async setMode(mode: 'Volume' | 'Duration') {
    if (mode === 'Volume') await this.volumeRadio().check();
    else await this.durationRadio().check();
  }

  async fillGeneralConfig(config: {
    virtualUsers?: string;
    timeout?: string;
    delay?: string;
    warmup?: string;
    execTimeout?: string;
  }) {
    if (config.virtualUsers) await this.virtualUsersInput().fill(config.virtualUsers);
    if (config.timeout)      await this.timeoutInput().fill(config.timeout);
    if (config.delay)        await this.delayInput().fill(config.delay);
    if (config.warmup)       await this.warmupInput().fill(config.warmup);
    if (config.execTimeout)  await this.execTimeoutInput().fill(config.execTimeout);
  }

  async clickAddBucket()  { await this.addBucketBtn().click(); }
  async clickAddScripts() { await this.addScriptsBtn().click(); }

  async assertPageLoaded()     { await expect(this.heading()).toBeVisible({ timeout: 15_000 }); }
  async assertNoBucketsEmpty() { await expect(this.noBucketsMsg()).toBeVisible(); await expect(this.addBucketBtn()).toBeVisible(); }
  async assertNoScriptsEmpty() { await expect(this.noScriptsMsg()).toBeVisible(); await expect(this.addScriptsBtn()).toBeVisible(); }

  async assertModeRadiosVisible() {
    await expect(this.volumeRadio().or(this.page.getByText('Volume')).first()).toBeVisible();
    await expect(this.durationRadio().or(this.page.getByText('Duration')).first()).toBeVisible();
  }

  async assertDefaultValues() {
    await expect(this.virtualUsersInput()).toHaveValue('10');
    await expect(this.timeoutInput()).toHaveValue('1000');
    await expect(this.delayInput()).toHaveValue('1000');
  }
}
