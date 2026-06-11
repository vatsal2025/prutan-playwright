import { Page, Locator, expect } from '@playwright/test';

export async function waitForAppReady(page: Page, timeout = 15_000) {
  await page.waitForFunction(
    () => !document.querySelector('.loading-indicator') &&
          !document.body.innerText.includes('Loading...'),
    { timeout }
  ).catch(() => {});
}

export async function goto(page: Page, route: string) {
  await page.goto(route, { waitUntil: 'domcontentloaded' });
  await waitForAppReady(page);
}

export async function hoverCollection(page: Page, name: string) {
  const row = page.locator('li, [class*="collection-item"]').filter({ hasText: name }).first();
  await row.hover();
}

export async function openCollectionMenu(page: Page, name: string) {
  await hoverCollection(page, name);
  const row = page.locator('li, [class*="collection-item"]').filter({ hasText: name }).first();
  await row.locator('button[title*="more" i], button[aria-label*="more" i], button:has-text("⋮"), [data-testid="more-btn"]')
    .or(row.locator('button').last())
    .click();
  await page.waitForSelector('[role="menu"], .context-menu, ul.menu', { state: 'visible' });
}

export async function clickMenuItem(page: Page, label: string) {
  await page.locator('[role="menuitem"], .menu-item, li').filter({ hasText: label }).first().click();
}

export async function dismissPasswordBanner(page: Page) {
  const dismissBtn = page.locator('button:has-text("Dismiss")');
  if (await dismissBtn.isVisible({ timeout: 3_000 }).catch(() => false)) {
    await dismissBtn.click();
  }
}

export async function openLoginModal(page: Page) {
  const loginBtn = page.locator('button:has-text("Login"), button.login-btn').first();
  await loginBtn.click();
  await page.waitForSelector('input[type="password"]', { state: 'visible' });
}

export async function login(page: Page, email: string, password: string) {
  await openLoginModal(page);
  await page.locator('input[type="email"], input[name="email"], input[placeholder*="email" i]').fill(email);
  await page.locator('input[type="password"]').fill(password);
  await page.locator('button:has-text("Sign In"), button[type="submit"]').click();
  await page.waitForSelector('[class*="avatar"], .user-avatar, img[alt*="avatar"]', { timeout: 15_000 });
  await waitForAppReady(page);
}

export async function assertToast(page: Page, text?: string | RegExp) {
  const toast = page.locator('[class*="toast"], [class*="notification"], [role="alert"]').first();
  await expect(toast).toBeVisible({ timeout: 8_000 });
  if (text) await expect(toast).toContainText(text);
}

export async function selectOption(page: Page, triggerLocator: Locator, optionText: string) {
  await triggerLocator.click();
  await page.locator('[role="option"], .dropdown-item, li').filter({ hasText: optionText }).first().click();
}

export async function switchProtocolTab(page: Page, tab: 'Rest' | 'ISO' | 'Realtime') {
  await page.locator(`[role="tab"]:has-text("${tab}"), .tab:has-text("${tab}")`).first().click();
}

export async function switchEditorTab(page: Page, tab: string) {
  await page.locator(`[role="tab"]:has-text("${tab}"), .editor-tab:has-text("${tab}")`).first().click();
}
