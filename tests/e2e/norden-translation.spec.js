const { test, expect } = require('@playwright/test');

test('norden dossier applies Spanish translations from lang query param', async ({ page }) => {
  await page.goto('/norden.html?lang=es&nocache=1');

  await expect(page.locator('html')).toHaveAttribute('lang', 'es');
  await expect(page.locator('.norden_registry_protocol')).toContainText(
    /arquitectura de reporting bajo LFi/i
  );
  await expect(page.locator('.norden_registry_tag').first()).toContainText(
    /Exhibici[oó]n \/ registro de reporting/i
  );
  await expect(page.locator('.project_case_navlink--index')).toContainText(/Todos los proyectos/i);
});
