import { FullConfig } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';
import * as https from 'https';
import * as http from 'http';
import { Config } from './support/config';

export default async function globalSetup(_config: FullConfig) {
  console.log('[setup] Logging in to Python engine...');

  const token = await loginAndGetToken(
    Config.pythonEngine.url,
    Config.pythonEngine.user,
    Config.pythonEngine.password,
  );

  if (!token) {
    console.error('[setup] Login failed — check PYTHON_ENGINE_USER and PYTHON_ENGINE_PASS in .env');
    process.exit(1);
  }

  console.log('[setup] Login successful');

  // Update py_storage.json with fresh token
  const storage: Record<string, string> = fs.existsSync(Config.pyStoragePath)
    ? JSON.parse(fs.readFileSync(Config.pyStoragePath, 'utf-8').replace(/^﻿/, ''))
    : {};
  storage.auth = token;
  fs.writeFileSync(Config.pyStoragePath, JSON.stringify(storage, null, 2));

  // Write Playwright storageState for python-engine project
  const origin = new URL(Config.pythonEngine.url).origin;
  const lsEntries = Object.entries(storage).map(([name, value]) => ({ name, value: String(value) }));
  const state = { cookies: [], origins: [{ origin, localStorage: lsEntries }] };

  const authDir = path.resolve(__dirname, 'auth');
  if (!fs.existsSync(authDir)) fs.mkdirSync(authDir, { recursive: true });

  const statePath = path.join(authDir, 'python-auth.json');
  fs.writeFileSync(statePath, JSON.stringify(state, null, 2));
  console.log(`[setup] Auth state written → ${statePath}`);
}

function loginAndGetToken(baseUrl: string, email: string, password: string): Promise<string | null> {
  return new Promise((resolve) => {
    const body = JSON.stringify({ email, password, provider: 'SELF' });
    const url = new URL('/prutan/core/login', baseUrl);
    const lib = url.protocol === 'https:' ? https : http;

    const req = lib.request(
      { hostname: url.hostname, port: url.port, path: url.pathname, method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) } },
      (res) => {
        const auth = res.headers['authorization'] as string | undefined;
        res.resume();
        if (auth) {
          resolve(auth.replace(/^Bearer\s+/i, ''));
        } else {
          console.error(`[setup] Login response ${res.statusCode} — no authorization header`);
          resolve(null);
        }
      },
    );
    req.on('error', (e) => { console.error('[setup] Login request error:', e.message); resolve(null); });
    req.write(body);
    req.end();
  });
}
