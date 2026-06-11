import { test as base, Page, chromium } from '@playwright/test';
import { Config } from '../support/config';
import { StudioPage } from '../pages/StudioPage';
import { SandboxPage } from '../pages/SandboxPage';
import { InterceptorPage } from '../pages/InterceptorPage';
import { TracePage } from '../pages/TracePage';
import { StressLabPage } from '../pages/StressLabPage';
import { WisoPage } from '../pages/WisoPage';

export type Engine = 'python-engine' | 'java-desktop';

const APP_PATH = '/prutan/core/ui/';

type CoreFixtures = {
  /** Resolved page — uses CDP for java-desktop, standard browser for python-engine */
  prutanPage: Page;
  /** Which engine is running — read in tests to skip/adjust assertions */
  engine: Engine;
};

type PageFixtures = {
  studio: StudioPage;
  sandbox: SandboxPage;
  interceptor: InterceptorPage;
  /** Trace module — named traceModule to avoid collision with Playwright's built-in trace option */
  traceModule: TracePage;
  stresslab: StressLabPage;
  wiso: WisoPage;
};

const withCore = base.extend<CoreFixtures>({
  prutanPage: async ({ page }, use, testInfo) => {
    if (testInfo.project.name === 'java-desktop') {
      // global-setup auto-launches the app if found; fixture just connects via CDP.
      try {
        const cdpBrowser = await chromium.connectOverCDP(Config.desktop.cdpUrl);
        const ctx    = cdpBrowser.contexts()[0];
        const cdpPage = ctx.pages()[0];
        await use(cdpPage);
        await cdpBrowser.close();
      } catch (e: any) {
        testInfo.skip(
          true,
          `Desktop app not reachable on ${Config.desktop.cdpUrl}. ` +
          `Set PRUTAN_APP_PATH in .env or install Prutan to a standard location. (${e.message?.slice(0, 60)})`,
        );
        await use(page);
      }
    } else {
      // python-engine — storageState pre-loaded via global-setup
      const appUrl = `${Config.pythonEngine.url}${APP_PATH}`;
      await page.goto(appUrl, { waitUntil: 'domcontentloaded', timeout: 30_000 });
      await page.waitForLoadState('networkidle', { timeout: 20_000 }).catch(() => {});
      await use(page);
    }
  },

  engine: async ({}, use, testInfo) => {
    await use(testInfo.project.name as Engine);
  },
});

function configurePageObject<T extends { setAppBase: (b: string) => void }>(
  obj: T,
  engine: Engine,
): T {
  const base =
    engine === 'java-desktop'
      ? `${Config.desktop.baseUrl}${APP_PATH}`
      : `${Config.pythonEngine.url}${APP_PATH}`;
  obj.setAppBase(base);
  return obj;
}

export const test = withCore.extend<PageFixtures>({
  studio: async ({ prutanPage, engine }, use) => {
    await use(configurePageObject(new StudioPage(prutanPage), engine));
  },

  sandbox: async ({ prutanPage, engine }, use) => {
    await use(configurePageObject(new SandboxPage(prutanPage), engine));
  },

  interceptor: async ({ prutanPage, engine }, use) => {
    await use(configurePageObject(new InterceptorPage(prutanPage), engine));
  },

  traceModule: async ({ prutanPage, engine }, use) => {
    await use(configurePageObject(new TracePage(prutanPage), engine));
  },

  stresslab: async ({ prutanPage, engine }, use) => {
    await use(configurePageObject(new StressLabPage(prutanPage), engine));
  },

  wiso: async ({ prutanPage, engine }, use) => {
    await use(configurePageObject(new WisoPage(prutanPage), engine));
  },
});

export { expect } from '@playwright/test';
