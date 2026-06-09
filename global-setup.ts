import { FullConfig } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';
import { buildStorageState, checkTokenExpiry } from './support/auth';
import { Config } from './support/config';

export default async function globalSetup(_config: FullConfig) {
  checkTokenExpiry();

  // Write Playwright storageState file for python-engine project
  const state = buildStorageState(new URL(Config.pythonEngine.url).origin);
  const authDir = path.resolve(__dirname, 'auth');
  if (!fs.existsSync(authDir)) fs.mkdirSync(authDir, { recursive: true });

  const statePath = path.join(authDir, 'python-auth.json');
  fs.writeFileSync(statePath, JSON.stringify(state, null, 2));
  console.log(`[setup] Python engine auth state written → ${statePath}`);
}
