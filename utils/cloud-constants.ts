import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

// Same PruTAN app as python-engine — reuses the same server URL and credentials
export const BASE_URL = process.env['PYTHON_ENGINE_URL'] ?? 'http://13.233.206.245:8080';

export const ROUTES = {
  STUDIO      : `${BASE_URL}/prutan/core/ui/#/home/collections`,
  SANDBOX     : `${BASE_URL}/prutan/core/ui/#/host/collections`,
  INTERCEPTOR : `${BASE_URL}/prutan/core/ui/#/interceptor/collections`,
  STRESS_LAB  : `${BASE_URL}/prutan/core/ui/#/stress-lab`,
  TRACE       : `${BASE_URL}/prutan/core/ui/#/trace`,
  WISO        : `${BASE_URL}/prutan/core/ui/#/wiso`,
  SETTINGS    : `${BASE_URL}/prutan/core/ui/#/settings`,
};

export const CREDS = {
  EMAIL : process.env['PYTHON_ENGINE_USER'] ?? '',
  PASS  : process.env['PYTHON_ENGINE_PASS'] ?? '',
};

export const HTTP_METHODS = [
  'GET','POST','PUT','PATCH','DELETE','HEAD','CONNECT','OPTIONS','TRACE',
] as const;

export const AUTH_TYPES = [
  'None','Basic Auth','Bearer','OAuth 2.0','API key',
] as const;

export const COLLECTION_MENU = [
  'New Request','New Folder','Run Collection',
  'Edit','Export','Upload','Duplicate','Delete',
] as const;

export const REQUEST_TABS = [
  'Body','Parameters','Headers','Authorization',
  'Pre-request Script','Validation','Settings',
] as const;

export const PROTOCOL_TABS = ['Rest','ISO','Realtime'] as const;

export const INTEGRATIONS = [
  'WISO Configuration','Slack','Jira','Teams','WhatsApp','Email',
] as const;

export const REAL_COLLECTIONS = [
  'Test','tess','Prutan ISO-8583',
  'Moneris API - Scenarios','Moneris API - Scenarios_1',
  'Prutan ISO-8583_1','Prutan ISO-8583_2',
  'Balance Inquiry - Mini-Sta','PruTAN — BOTH [VISA+M',
  'fsd — API Studio','fsd — ISO Studio','fsd — XML Studio',
  'trsy — API Studio','TEST — API Studio','dsfsd — API Studio',
] as const;
