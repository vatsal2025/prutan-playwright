import { FullConfig } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';
import * as https from 'https';
import * as http from 'http';
import { Config } from './support/config';

export default async function globalSetup(_config: FullConfig) {
  const authDir = path.resolve(__dirname, 'auth');
  if (!fs.existsSync(authDir)) fs.mkdirSync(authDir, { recursive: true });

  // ── Python engine login ───────────────────────────────────────────────────
  const pythonStatePath = path.join(authDir, 'python-auth.json');

  if (Config.pythonEngine.user && Config.pythonEngine.password) {
    console.log('[setup] Logging in to Python engine...');
    const token = await loginAndGetToken(
      Config.pythonEngine.url,
      Config.pythonEngine.user,
      Config.pythonEngine.password,
    );

    if (token) {
      console.log('[setup] Python engine login successful');
      const storage: Record<string, string> = fs.existsSync(Config.pyStoragePath)
        ? JSON.parse(fs.readFileSync(Config.pyStoragePath, 'utf-8').replace(/^﻿/, ''))
        : {};
      storage.auth = token;
      fs.writeFileSync(Config.pyStoragePath, JSON.stringify(storage, null, 2));

      const origin = new URL(Config.pythonEngine.url).origin;
      const lsEntries = Object.entries(storage).map(([name, value]) => ({ name, value: String(value) }));
      const state = { cookies: [], origins: [{ origin, localStorage: lsEntries }] };
      fs.writeFileSync(pythonStatePath, JSON.stringify(state, null, 2));
      console.log('[setup] Python auth state written → auth/python-auth.json');
    } else {
      console.warn('[setup] Python engine login failed — python-engine tests will run unauthenticated');
      console.warn('[setup] Check PYTHON_ENGINE_USER and PYTHON_ENGINE_PASS in your .env file');
      fs.writeFileSync(pythonStatePath, JSON.stringify({ cookies: [], origins: [] }, null, 2));
    }
  } else {
    console.log('[setup] PYTHON_ENGINE_USER not set — writing empty python auth (python-engine tests will be skipped or unauthenticated)');
    fs.writeFileSync(pythonStatePath, JSON.stringify({ cookies: [], origins: [] }, null, 2));
  }

  // ── Cloud login (app.prutan.com) ──────────────────────────────────────────
  const cloudStatePath = path.join(authDir, 'cloud-auth.json');

  if (Config.cloud.user && Config.cloud.password) {
    console.log('[setup] Logging in to Cloud (app.prutan.com)...');
    const cloudToken = await loginAndGetToken(Config.cloud.url, Config.cloud.user, Config.cloud.password);
    if (cloudToken) {
      const cloudOrigin = new URL(Config.cloud.url).origin;
      const cloudState = {
        cookies: [],
        origins: [{ origin: cloudOrigin, localStorage: [{ name: 'auth', value: cloudToken }] }],
      };
      fs.writeFileSync(cloudStatePath, JSON.stringify(cloudState, null, 2));
      console.log('[setup] Cloud auth written → auth/cloud-auth.json');
    } else {
      console.warn('[setup] Cloud login failed — cloud tests will run unauthenticated');
      fs.writeFileSync(cloudStatePath, JSON.stringify({ cookies: [], origins: [] }, null, 2));
    }
  } else {
    console.log('[setup] PRUTAN_CLOUD_USER not set — writing empty cloud auth (cloud tests run unauthenticated)');
    fs.writeFileSync(cloudStatePath, JSON.stringify({ cookies: [], origins: [] }, null, 2));
  }
}

function loginAndGetToken(baseUrl: string, email: string, password: string): Promise<string | null> {
  return new Promise((resolve) => {
    const body = JSON.stringify({ email, password, provider: 'SELF' });
    const url = new URL('/prutan/core/login', baseUrl);
    const lib = url.protocol === 'https:' ? https : http;

    const req = lib.request(
      {
        hostname: url.hostname,
        port: url.port || (url.protocol === 'https:' ? 443 : 80),
        path: url.pathname,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(body),
        },
      },
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

    req.setTimeout(15_000, () => {
      console.error('[setup] Login request timed out after 15s');
      req.destroy();
      resolve(null);
    });

    req.on('error', (e) => {
      console.error('[setup] Login request error:', e.message);
      resolve(null);
    });

    req.write(body);
    req.end();
  });
}
