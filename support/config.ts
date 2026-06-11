import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

function require_env(key: string, fallback?: string): string {
  const v = process.env[key] ?? fallback;
  if (!v) throw new Error(`Missing required env var: ${key}`);
  return v;
}

export const Config = {
  pythonEngine: {
    url: require_env('PYTHON_ENGINE_URL', 'http://13.233.206.245:8080'),
    collectionUrl: require_env('PYTHON_ENGINE_URL', 'http://13.233.206.245:8080') + '/prutan/core/ui/#/home/collections',
    token: process.env['PYTHON_ENGINE_TOKEN'] ?? '',
    user: require_env('PYTHON_ENGINE_USER', 'vatsal.saxena@intellocore.com'),
    password: require_env('PYTHON_ENGINE_PASS', 'Welcome@prutan'),
  },
  desktop: {
    cdpUrl: require_env('DESKTOP_CDP_URL', 'http://localhost:9222'),
    baseUrl: require_env('DESKTOP_BASE_URL', 'http://localhost:59140'),
    user: require_env('DESKTOP_USER', 'evaluation@prutan.com'),
  },
  javaRef: {
    url: require_env('JAVA_REF_URL', 'https://app.prutan.com'),
  },
  qaTeamGuid: require_env('QA_TEAM_GUID', '8dd0464c-ec8b-4ee0-9a16-24d5e0ad2f1d'),

  pyStoragePath: path.resolve(__dirname, '../py_storage.json'),

  screenshots: path.resolve(__dirname, '../test-results/screenshots'),
};
