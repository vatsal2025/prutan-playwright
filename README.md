# PruTAN Playwright Test Framework

Automated end-to-end tests for [PruTAN](https://prutan.com) using Playwright and TypeScript. Covers both the Python engine (web server) and the Java Desktop engine (Electron app).

## What This Framework Does

- Tests all major PruTAN modules: Studio, Sandbox, Interceptor, Trace, StressLab, and WISO
- Runs the same tests on two different engines and shows where they behave differently
- Uses the Page Object Model so tests stay clean and easy to read
- Separates smoke tests (fast, run often) from regression tests (thorough, run before releases)
- Documents known bugs so the team knows what is expected to fail and what is not

## Engines

| Engine | URL | How it connects |
|---|---|---|
| Python engine | http://13.233.206.245:8080 | Standard Chromium browser |
| Java Desktop | Electron app (Prutan.exe) | Chrome DevTools Protocol (CDP) on port 9222 |

## Prerequisites

- Node.js 18 or higher
- Git
- For Desktop tests: PruTAN Desktop app installed at `E:\PruTan\Prutan.exe`

## Setup

**1. Clone the repo**

```bash
git clone https://github.com/vatsal2025/prutan-playwright.git
cd prutan-playwright
```

**2. Install dependencies**

```bash
npm install
```

**3. Install Playwright browsers**

```bash
npx playwright install chromium
```

**4. Set up your credentials**

Copy the example env file and fill in your token:

```bash
cp .env.example .env
```

Open `.env` and set `PYTHON_ENGINE_TOKEN` to your JWT token. You can copy this from the browser after logging in to the Python engine:

1. Open http://13.233.206.245:8080 in Chrome
2. Log in with your account
3. Press F12 to open DevTools
4. Go to Application tab, then Local Storage
5. Copy the value of the `auth` key
6. Paste it into `.env` as `PYTHON_ENGINE_TOKEN=<paste here>`

The token expires every 24 hours. Run `npm run auth:refresh` to get a new one when tests start failing with auth errors.

## Running Tests

**Run all tests on both engines**

```bash
npm test
```

**Run only the Python engine tests**

```bash
npm run test:python
```

**Run only the Desktop tests** (Prutan.exe must be open first)

```bash
npm run test:desktop
```

**Run only smoke tests (fast check)**

```bash
npm run test:smoke
```

**Run tests for a specific module**

```bash
npm run test:studio
npm run test:sandbox
npm run test:interceptor
npm run test:trace
npm run test:stresslab
npm run test:wiso
```

**Open the HTML report after a run**

```bash
npm run report
```

**Target a specific engine and tag at the same time**

```bash
npx playwright test --project=python-engine --grep "@smoke"
npx playwright test --project=java-desktop --grep "@regression"
```

## Desktop Test Setup

Before running desktop tests:

1. Open `E:\PruTan\Prutan.exe`
2. The app connects to CDP on port 9222 automatically
3. You do not need to log in again, the app stays logged in
4. Run `npm run test:desktop`

## Project Structure

```
playwright-prutan/
|-- playwright.config.ts        Two test projects: python-engine and java-desktop
|-- global-setup.ts             Runs before tests, writes auth state from token
|-- .env.example                Template for credentials (copy to .env)
|
|-- fixtures/
|   |-- index.ts                Custom fixtures: prutanPage, engine, studio, sandbox...
|
|-- pages/                      Page Object Model
|   |-- BasePage.ts             Shared methods: navigation, tab clicks, screenshots
|   |-- StudioPage.ts           Studio: set method, URL, body, send, read response
|   |-- SandboxPage.ts          Sandbox: start, stop, view rules, view analytics
|   |-- InterceptorPage.ts      Interceptor: start, stop, view rules
|   |-- TracePage.ts            Trace: search, read results
|   |-- StressLabPage.ts        StressLab: add buckets, run, stop
|   |-- WisoPage.ts             WISO: check connection, send prompts
|
|-- support/
|   |-- config.ts               Loads .env values and exposes them as Config object
|   |-- auth.ts                 Builds Playwright storage state from token
|   |-- refresh-auth.ts         Opens browser so you can log in and save a fresh token
|
|-- tests/
    |-- studio/
    |   |-- rest.spec.ts        REST: GET, POST, PUT, DELETE, PATCH, HEAD
    |   |-- iso8583.spec.ts     ISO 8583: format tab, MTI, table view, send to simulator
    |   |-- realtime.spec.ts    Realtime: Kafka/SQS tab rendering
    |-- sandbox/
    |   |-- rest.spec.ts        Sandbox REST: start, stop, rules, analytics
    |   |-- iso.spec.ts         Sandbox ISO: start, stop, rules
    |-- interceptor/
    |   |-- interceptor.spec.ts Start, stop, rules
    |-- trace/
    |   |-- trace.spec.ts       Search, error 9999 check
    |-- stresslab/
    |   |-- stresslab.spec.ts   Page load, add bucket, scripts
    |-- wiso/
        |-- wiso.spec.ts        Connection check, prompt input
```

## Adding New Tests

1. Pick the right folder under `tests/` based on the module
2. Create a new `.spec.ts` file or add to an existing one
3. Import from `../../fixtures` (not from `@playwright/test` directly)
4. Use the page object fixtures in the test function arguments

Basic example:

```typescript
import { test, expect } from '../../fixtures';

test.describe('Studio > My new test group', () => {

  test('sends a request and gets a response @smoke', async ({ studio }) => {
    await studio.open();
    await studio.setUrl('https://jsonplaceholder.typicode.com/todos/1');
    await studio.send(8000);
    await studio.expectResponseStatusOk();
  });

});
```

**Use the `engine` fixture to skip tests that only apply to one engine:**

```typescript
test('desktop only feature @regression', async ({ studio, engine }) => {
  test.skip(engine === 'python-engine', 'This feature only exists on Desktop');
  // ... test code
});
```

**Tag tests with `@smoke` or `@regression`:**

- `@smoke` = fast check, should always pass, run before every push
- `@regression` = thorough check, run before releases

## Refreshing the Auth Token

The Python engine JWT token expires every 24 hours. When smoke tests start failing with auth errors, run:

```bash
npm run auth:refresh
```

This opens a browser window. Log in manually (there is a reCAPTCHA that blocks automation). Once you are on the Collections page, press Enter in the terminal. The script saves the token to `.env` and to `py_storage.json`.

## Known Bugs

These bugs exist in PruTAN itself, not in this framework. Tests that cover them are marked with `test.skip` or log a warning instead of failing.

| Bug | Engine | Description |
|---|---|---|
| BUG #1 | Python | Router service is down. All ISO and router-based REST requests return 500. |
| BUG #2 | Both | PATCH method returns null status. |
| BUG #3 | Desktop | Trace search returns error 9999. The mastertracing table has zero rows. |
| BUG #4 | Desktop | WISO is disconnected. Needs an LLM provider configured in Settings. |

When a bug is fixed, remove the `test.skip` from the related test and it will start running automatically.

## Tech Stack

- [Playwright](https://playwright.dev) 1.49
- TypeScript 5.7
- Node.js 24
- Angular Material selectors for PruTAN UI elements
