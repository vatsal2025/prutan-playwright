import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

export const Config = {
  pythonEngine: {
    url: process.env['PYTHON_ENGINE_URL'] ?? 'http://13.233.206.245:8080',
    collectionUrl: (process.env['PYTHON_ENGINE_URL'] ?? 'http://13.233.206.245:8080') + '/prutan/core/ui/#/home/collections',
    // Credentials — set PYTHON_ENGINE_USER and PYTHON_ENGINE_PASS in your .env file
    user: process.env['PYTHON_ENGINE_USER'] ?? '',
    password: process.env['PYTHON_ENGINE_PASS'] ?? '',
  },
  desktop: {
    cdpUrl: process.env['DESKTOP_CDP_URL'] ?? 'http://localhost:9222',
    baseUrl: process.env['DESKTOP_BASE_URL'] ?? 'http://localhost:59140',
    user: process.env['DESKTOP_USER'] ?? '',
  },
  javaRef: {
    url: process.env['JAVA_REF_URL'] ?? 'https://app.prutan.com',
  },
  qaTeamGuid: process.env['QA_TEAM_GUID'] ?? '',

  cloud: {
    url: process.env['PRUTAN_CLOUD_URL'] ?? 'https://app.prutan.com',
    // Credentials — set PRUTAN_CLOUD_USER and PRUTAN_CLOUD_PASS in your .env file
    user: process.env['PRUTAN_CLOUD_USER'] ?? '',
    password: process.env['PRUTAN_CLOUD_PASS'] ?? '',
  },

  pyStoragePath: path.resolve(__dirname, '../py_storage.json'),
  screenshots: path.resolve(__dirname, '../test-results/screenshots'),
};
