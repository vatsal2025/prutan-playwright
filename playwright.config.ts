import { defineConfig, devices } from '@playwright/test';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(__dirname, '.env') });

const PYTHON_BASE = process.env['PYTHON_ENGINE_URL'] ?? 'http://13.233.206.245:8080';

export default defineConfig({
  testDir: './tests',

  // Run files in a project sequentially — parallel per project is fine
  fullyParallel: false,

  // Fail the build on CI if test.only is left in code
  forbidOnly: !!process.env['CI'],

  // Retry once on CI
  retries: process.env['CI'] ? 1 : 0,

  // Sequential within each project (PruTAN has shared app state)
  workers: 1,

  reporter: [
    ['list'],
    ['html', { open: 'never', outputFolder: 'playwright-report' }],
    ['json', { outputFile: 'test-results/results.json' }],
  ],

  use: {
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    trace: 'retain-on-failure',
    actionTimeout: 15_000,
    navigationTimeout: 30_000,
  },

  globalSetup: './global-setup.ts',

  projects: [
    // ── Python Engine ───────────────────────────────────────────────────────
    {
      name: 'python-engine',
      use: {
        ...devices['Desktop Chrome'],
        baseURL: `${PYTHON_BASE}/prutan/core/ui/`,
        // Auth state pre-built by global-setup from py_storage.json / .env token
        storageState: './auth/python-auth.json',
        viewport: { width: 1400, height: 900 },
      },
    },

    // ── Java Desktop (Electron via CDP) ─────────────────────────────────────
    // CDP connection is handled in the `prutanPage` fixture (fixtures/index.ts)
    // Electron must be running: open E:\PruTan\Prutan.exe before running desktop tests
    {
      name: 'java-desktop',
      use: {
        // baseURL not used for CDP — kept for reference/debugging
        baseURL: process.env['DESKTOP_BASE_URL'] ?? 'http://localhost:59140',
        viewport: null, // CDP pages use the window's native viewport
      },
    },
  ],

  outputDir: 'test-results',
});
