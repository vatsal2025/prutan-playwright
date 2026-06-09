/**
 * Token refresh helper — run with: npm run auth:refresh
 *
 * When PYTHON_ENGINE_TOKEN in .env expires (24h), this script:
 *   1. Opens a browser to the Python engine
 *   2. Waits for you to log in manually (reCAPTCHA blocks automation)
 *   3. Captures localStorage and writes it to py_storage.json + updates .env token
 *
 * Usage:
 *   npx ts-node support/refresh-auth.ts
 */
import { chromium } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';
import { Config } from './config';

async function refreshAuth() {
  console.log('Opening Python engine for manual login...');
  console.log('1. Log in with your credentials');
  console.log('2. Complete the reCAPTCHA');
  console.log('3. Once you are on the Collections page, press Enter here to capture auth');

  const browser = await chromium.launch({ headless: false });
  const ctx = await browser.newContext();
  const page = await ctx.newPage();

  await page.goto(`${Config.pythonEngine.url}/prutan/core/ui/#/home/collections`);

  // Wait for user input
  await new Promise<void>((resolve) => {
    process.stdin.once('data', () => resolve());
    console.log('\nPress Enter after you are logged in...');
  });

  // Capture localStorage
  const storage = await page.evaluate(() => {
    const result: Record<string, string> = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)!;
      result[key] = localStorage.getItem(key)!;
    }
    return result;
  });

  const storageStr = JSON.stringify(storage, null, 2);
  fs.writeFileSync(Config.pyStoragePath, storageStr);
  console.log(`\nSaved localStorage → ${Config.pyStoragePath}`);

  // Update .env PYTHON_ENGINE_TOKEN
  const token = storage['auth'] ?? '';
  if (token) {
    const envPath = path.resolve(__dirname, '../.env');
    let envContent = fs.readFileSync(envPath, 'utf-8');
    envContent = envContent.replace(/^PYTHON_ENGINE_TOKEN=.*$/m, `PYTHON_ENGINE_TOKEN=${token}`);
    fs.writeFileSync(envPath, envContent);
    console.log('Updated PYTHON_ENGINE_TOKEN in .env');
  }

  await browser.close();
  console.log('\nAuth refresh complete. Run npm test to continue.');
}

refreshAuth().catch(console.error);
