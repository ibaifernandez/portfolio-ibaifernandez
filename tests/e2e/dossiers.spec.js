const { test, expect } = require('@playwright/test');

test('active dossier navigation stays inside the public dossier set', async ({ page }) => {
  // Only scanner-21179 is active; single dossier → no prev/next nav links expected
  await page.goto('/scanner-21179.html');

  const previousLink = page.locator('.project_case_navlink--prev');
  const nextLink = page.locator('.project_case_navlink--next');

  await expect(previousLink).toHaveCount(0);
  await expect(nextLink).toHaveCount(0);
});
