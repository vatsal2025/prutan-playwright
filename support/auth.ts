import { Page, BrowserContext } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';
import { Config } from './config';

export interface PruTanStorage {
  auth: string;
  selectedHost?: string;
  globalEnvironment?: string;
  settings?: string;
  user?: string;
  licenseExpired?: string;
  selectedTeam?: string;
  routerEnabled?: string;
  localeId?: string;
  [key: string]: string | undefined;
}

/** Load stored localStorage snapshot from py_storage.json */
export function loadPyStorage(): PruTanStorage {
  const raw = fs.readFileSync(Config.pyStoragePath, 'utf-8');
  return JSON.parse(raw) as PruTanStorage;
}

/** Inject PruTAN localStorage into a page so auth is pre-loaded without login UI */
export async function injectAuth(page: Page, storage?: Partial<PruTanStorage>): Promise<void> {
  const base = loadPyStorage();
  const merged: PruTanStorage = { ...base, ...storage };

  // Override token from .env if provided (fresh token wins)
  if (Config.pythonEngine.token) {
    merged.auth = Config.pythonEngine.token;
  }

  await page.addInitScript((entries: Record<string, string>) => {
    for (const [key, value] of Object.entries(entries)) {
      if (value !== undefined) {
        localStorage.setItem(key, value);
      }
    }
  }, merged as Record<string, string>);
}

/** Check if the current JWT is expired */
export function isTokenExpired(token: string): boolean {
  try {
    const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
    return Date.now() / 1000 > payload.exp;
  } catch {
    return true;
  }
}

/** Warn if token in .env is expired */
export function checkTokenExpiry(): void {
  const token = Config.pythonEngine.token;
  if (!token) {
    console.warn('[auth] No PYTHON_ENGINE_TOKEN in .env — auth may fail for Python engine');
    return;
  }
  if (isTokenExpired(token)) {
    console.warn('[auth] PYTHON_ENGINE_TOKEN is EXPIRED. Get a fresh token from DevTools → Application → Local Storage → auth');
  }
}

/** Save Playwright storage state for reuse across tests */
export async function saveStorageState(context: BrowserContext, filename: string): Promise<void> {
  const authDir = path.resolve(__dirname, '../auth');
  if (!fs.existsSync(authDir)) fs.mkdirSync(authDir, { recursive: true });
  await context.storageState({ path: path.join(authDir, filename) });
}

/** Build a Playwright storageState object from py_storage.json for globalSetup use */
export function buildStorageState(baseUrl: string): object {
  const storage = loadPyStorage();
  if (Config.pythonEngine.token) {
    storage.auth = Config.pythonEngine.token;
  }

  const lsEntries = Object.entries(storage)
    .filter(([, v]) => v !== undefined)
    .map(([name, value]) => ({ name, value: String(value) }));

  return {
    cookies: [],
    origins: [
      {
        origin: baseUrl,
        localStorage: lsEntries,
      },
    ],
  };
}
