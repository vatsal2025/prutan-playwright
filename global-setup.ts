import { FullConfig } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';
import { buildStorageState, checkTokenExpiry } from './support/auth';
import { Config } from './support/config';

export default async function globalSetup(_config: FullConfig) {
  checkTokenExpiry();

  // Create minimal py_storage.json if missing (team setup without auth:refresh)
  if (!fs.existsSync(Config.pyStoragePath)) {
    const minimal = { auth: Config.pythonEngine.token || '' };
    fs.writeFileSync(Config.pyStoragePath, JSON.stringify(minimal, null, 2));
    console.log('[setup] py_storage.json not found — created minimal from .env token');
  }

  // Write Playwright storageState file for python-engine project
  const state = buildStorageState(new URL(Config.pythonEngine.url).origin);
  const authDir = path.resolve(__dirname, 'auth');
  if (!fs.existsSync(authDir)) fs.mkdirSync(authDir, { recursive: true });

  const statePath = path.join(authDir, 'python-auth.json');
  fs.writeFileSync(statePath, JSON.stringify(state, null, 2));
  console.log(`[setup] Python engine auth state written → ${statePath}`);
}
