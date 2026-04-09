const { test, expect } = require('@playwright/test');

test('brevo intelligence layer dossier applies Spanish translations from lang query param', async ({ page }) => {
  await page.goto('/brevo-intelligence-layer.html?lang=es&nocache=1');

  await expect(page.locator('html')).toHaveAttribute('lang', 'es');
  await expect(page.locator('.norden_registry_protocol')).toContainText(
    /capa de inteligencia|arquitectura local-first de diagn[oó]stico y reporting/i
  );
  await expect(page.locator('.norden_registry_tag').first()).toContainText(
    /Arquitectura de soluci[oó]n \/ capa de inteligencia para Brevo/i
  );
  await expect(page.locator('.project_case_navlink--index')).toContainText(/Todos los proyectos/i);
});
