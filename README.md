# PruTAN Playwright Test Framework

Automated end-to-end tests for [PruTAN](https://prutan.com) using Playwright and TypeScript.
Covers both the Python engine (web server at `13.233.206.245:8080`) and the Java Desktop engine (Electron app via CDP).

**503 tests across 26 files.** All tests that can pass against the live server do pass. Tests that require specific app state (empty collections on Interceptor/Sandbox, no host loaded for StressLab buckets) skip gracefully.

---

## Engines

| Engine | Target | How it connects |
|---|---|---|
| `python-engine` | `http://13.233.206.245:8080` | Standard Chromium, logs in via username + password |
| `java-desktop` | `Prutan.exe` (Electron) | Chrome DevTools Protocol (CDP) on port 9222, auto-launched |

---

## Prerequisites

- Node.js 18+
- Git

---

## Setup

**1. Clone and install**

```bash
git clone https://github.com/vatsal2025/prutan-playwright.git
cd prutan-playwright
npm install
npx playwright install chromium
```

**2. Configure credentials**

```bash
cp .env.example .env
```

Open `.env` and fill in:

```env
PYTHON_ENGINE_URL=http://13.233.206.245:8080
PYTHON_ENGINE_USER=your_email@example.com
PYTHON_ENGINE_PASS=your_password
```

That is all. The framework logs in automatically before the test run and saves the auth state — no manual token copying needed.

For Desktop tests, also set:

```env
PRUTAN_APP_PATH=C:\path\to\Prutan.exe
DESKTOP_USER=your_email@example.com
```

---

## Running Tests

### Full suite

```bash
# Both engines (python + desktop)
npm test

# Python engine only — all 503 tests (~50 min)
npm run test:python

# Java Desktop engine only
npm run test:desktop
```

### Cloud UI module tests only

```bash
# All cloud module tests (tests/cloud/) — fastest full coverage of web UI
npm run test:ui
```

### Quick checks

```bash
# Smoke tests only — fast sanity check, run before every push
npm run test:smoke

# Open HTML report after any run
npm run report
```

### Per-module (legacy test suites)

```bash
npm run test:studio
npm run test:sandbox
npm run test:interceptor
npm run test:trace
npm run test:stresslab
npm run test:wiso
```

### Advanced targeting

```bash
# Specific project + tag
npx playwright test --project=python-engine --grep "@smoke"
npx playwright test --project=java-desktop --grep "@regression"

# Single spec file
npx playwright test tests/cloud/module-studio.spec.ts --project=python-engine

# Multiple specific files
npx playwright test tests/cloud/module-studio.spec.ts tests/cloud/module-trace.spec.ts --project=python-engine

# Record a new test interactively
npm run codegen
```

### View a failure trace

```bash
npx playwright show-trace test-results/<failed-test-dir>/trace.zip
```

---

## Desktop Test Setup

Desktop tests auto-launch `Prutan.exe` before the run — you do not need to start the app manually.

1. Set `PRUTAN_APP_PATH` in `.env` if the app is not at the default location
2. Run `npm run test:desktop`

The framework finds the executable, launches it with CDP enabled on port 9222, waits for it to be ready, and kills it after the run.

---

## Project Structure

```
playwright-prutan/
├── playwright.config.ts       Two projects: python-engine, java-desktop
├── global-setup.ts            Login + save auth state before tests run
├── global-teardown.ts         Kill desktop app after tests
├── .env.example               Credential template — copy to .env
│
├── auth/
│   └── python-auth.json       Saved login state (git-ignored, auto-generated)
│
├── fixtures/
│   └── index.ts               Custom fixtures: prutanPage, engine, studio, sandbox...
│
├── pages/                     Page Object Model — shared across all tests
│   ├── BasePage.ts            Navigation, tab clicks, screenshots
│   ├── StudioPage.ts          Set method/URL/body, send, read response
│   ├── SandboxPage.ts         Start/stop, rules, analytics
│   ├── InterceptorPage.ts     Start/stop, rules
│   ├── TracePage.ts           Search, read results
│   ├── StressLabPage.ts       Add buckets, run, stop
│   ├── WisoPage.ts            Connection check, send prompts
│   └── cloud/                 POM classes for cloud module tests
│       ├── CollectionsPanel.ts    Tree items, context menu, new collection modal
│       ├── RequestEditor.ts       Method dropdown, URL input, tabs, auth
│       ├── SideBar.ts             Navigation links
│       ├── TopBar.ts              Workspace, environment, agent selectors
│       ├── Settings.ts            Theme, integrations, toggles
│       ├── StressLab.ts           Benchmark, buckets, scripts sections
│       └── Trace.ts               Trace viewer, transaction panel
│
├── tests/
│   ├── cloud/                 Comprehensive UI tests for all modules (main suite)
│   │   ├── module-studio.spec.ts       Studio: layout, method dropdown, body/params/headers/auth tabs,
│   │   │                               pre-request script, collections panel, context menu, new collection modal
│   │   ├── module-sandbox.spec.ts      Sandbox: layout, method dropdown, collections
│   │   ├── module-interceptor.spec.ts  Interceptor: layout, collections, request bars
│   │   ├── module-stresslab.spec.ts    StressLab: mode, general config, benchmark type, buckets, scripts
│   │   ├── module-trace.spec.ts        Trace: layout, search, transactions, request details, navigation
│   │   ├── module-wiso.spec.ts         WISO: auth, content, settings integrations config
│   │   ├── module-settings.spec.ts     Settings: theme, language, integrations
│   │   ├── 01-topbar.spec.ts           Top bar: workspace, environment, agent
│   │   ├── 02-sidebar.spec.ts          Sidebar: navigation links
│   │   ├── 03-collections-panel.spec.ts Collections CRUD and search
│   │   ├── 04-request-editor.spec.ts   Request editor: method, URL, tabs
│   │   ├── 05-stress-lab.spec.ts       StressLab flows
│   │   ├── 06-trace.spec.ts            Trace viewer flows
│   │   ├── 07-settings.spec.ts         Settings page
│   │   ├── 08-bottom-bar.spec.ts       Bottom bar
│   │   └── 09-e2e-flows.spec.ts        End-to-end user flows
│   │
│   ├── studio/                Legacy module tests (also run by test:python)
│   │   ├── rest.spec.ts       REST: GET, POST, PUT, DELETE, PATCH, HEAD
│   │   ├── iso8583.spec.ts    ISO 8583: format tab, MTI, table view
│   │   └── realtime.spec.ts   Realtime: Kafka/SQS tab
│   ├── sandbox/
│   │   ├── rest.spec.ts
│   │   └── iso.spec.ts
│   ├── interceptor/
│   │   └── interceptor.spec.ts
│   ├── trace/
│   │   └── trace.spec.ts
│   ├── stresslab/
│   │   └── stresslab.spec.ts
│   └── wiso/
│       └── wiso.spec.ts
│
└── utils/
    ├── cloud-constants.ts     Route URLs, base URLs
    └── cloud-helpers.ts       Shared helpers (load page, wait for app)
```

---

## Adding New Tests

Import from fixtures (not `@playwright/test` directly):

```typescript
import { test, expect } from '../../fixtures';

test.describe('Studio > My new tests', () => {

  test('sends a GET and gets 200 @smoke', async ({ studio }) => {
    await studio.open();
    await studio.setUrl('https://jsonplaceholder.typicode.com/todos/1');
    await studio.send(8000);
    await studio.expectResponseStatusOk();
  });

});
```

For cloud module tests, import from `@playwright/test` and use page objects:

```typescript
import { test, expect } from '@playwright/test';
import { ROUTES } from '../../utils/cloud-constants';

test('my cloud test @regression', async ({ page }) => {
  await page.goto(ROUTES.STUDIO, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1000);
  await expect(page.locator('text=Studio').first()).toBeVisible();
});
```

Skip by engine:

```typescript
test('desktop only @regression', async ({ studio, engine }) => {
  test.skip(engine === 'python-engine', 'Desktop only feature');
  // ...
});
```

Tag tests:

- `@smoke` — fast, always-green, run before every push
- `@regression` — thorough, run before releases

---

## Expected Test Behavior

### What passes
All UI and functional tests that target the live Python engine at `13.233.206.245:8080`.

### What skips (intentional)
These skip gracefully — they are not failures:

| Test | Reason |
|---|---|
| ICP-CP-003/004 — Interceptor collections | Interceptor has a separate, empty collection store for this account |
| SBX-CM-001 — Sandbox context menu | Sandbox collection store is empty for this account |
| SL-BKT-004 — Add bucket | Requires a collection/request to be loaded first |
| ST-CM-010 — Context menu closes on ESC | App does not close context menu on ESC (only outside-click works) |
| Desktop WISO | WISO is disconnected on Desktop — needs LLM provider configured in Settings |

### Known bugs (in PruTAN, not the framework)

| Bug | Engine | Description |
|---|---|---|
| BUG #1 | Python | Router service down — ISO and router-based REST return 500 |
| BUG #2 | Both | PATCH method returns null status |
| BUG #3 | Desktop | Trace search returns error 9999 — mastertracing table has zero rows |
| BUG #4 | Desktop | WISO disconnected — needs LLM provider in Settings |

When a bug is fixed, remove the `test.skip` from the related test and it runs automatically.

---

## Tech Stack

- [Playwright](https://playwright.dev) 1.49
- TypeScript 5.7
- Node.js 18+
- Angular CDK selectors for PruTAN's custom components
