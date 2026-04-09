const { test, expect } = require('@playwright/test');

test('archived dossier slugs bounce back to the home projects anchor', async ({ page }) => {
  const retiredRoutes = [
    '/debtracker.html',
    '/gymtracker.html',
    '/brevo-intelligence-layer.html',
    '/portfolio-ibaifernandez.html',
    '/my-board.html',
    '/the-research-engine.html'
  ];

  for (const route of retiredRoutes) {
    const response = await page.goto(`${route}?lang=es&nocache=1`);

    expect(response).not.toBeNull();
    expect(response.status(), `${route} should no longer render a public dossier`).toBe(200);
    await expect(page).toHaveURL(/\/(?:index\.html)?#project_sec$/);
    await expect(page.locator('.port_projects_setions01')).toBeVisible();
  }
});
