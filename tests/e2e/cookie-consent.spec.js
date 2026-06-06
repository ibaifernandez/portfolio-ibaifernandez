// Behavioral coverage for the cookie-consent banner (D-TEST-05). The visual suite
// only suppresses the banner; nothing previously asserted accept/decline,
// persistence, or re-open — the one user-facing flow with privacy implications.
const { test, expect } = require('@playwright/test');

const BANNER = '#cookie-consent-banner';

test.describe('cookie consent', () => {
  test('banner shows on a fresh visit and Accept persists consent', async ({ page }) => {
    await page.goto('/index.html');
    await expect(page.locator(BANNER)).toBeVisible();

    await page.locator('#cookie-consent-accept').click();
    await expect(page.locator(BANNER)).toBeHidden();

    const consent = await page.evaluate(() => localStorage.getItem('portfolio_consent'));
    expect(consent).toBe('granted');
  });

  test('Decline persists the choice and hides the banner', async ({ page }) => {
    await page.goto('/index.html');
    await page.locator('#cookie-consent-decline').click();
    await expect(page.locator(BANNER)).toBeHidden();

    const consent = await page.evaluate(() => localStorage.getItem('portfolio_consent'));
    expect(consent).toBe('declined');
  });

  test('decision survives a reload (banner stays hidden)', async ({ page }) => {
    await page.goto('/index.html');
    await page.locator('#cookie-consent-accept').click();
    await expect(page.locator(BANNER)).toBeHidden();

    await page.reload();
    await expect(page.locator(BANNER)).toBeHidden();
  });

  test('analytics consent is denied by default before any choice', async ({ page }) => {
    await page.goto('/index.html');
    // No GA cookie should be set while the banner is still awaiting a decision.
    const gaCookies = (await page.context().cookies()).filter((c) => c.name.startsWith('_ga'));
    expect(gaCookies).toEqual([]);
  });

  test('preferences can be re-opened after a decision', async ({ page }) => {
    await page.goto('/index.html');
    await page.locator('#cookie-consent-decline').click();
    await expect(page.locator(BANNER)).toBeHidden();

    await page.evaluate(() => window.openCookiePreferences());
    await expect(page.locator(BANNER)).toBeVisible();
  });
});
