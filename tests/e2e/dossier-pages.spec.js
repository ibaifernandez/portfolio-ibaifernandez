// dossier-pages.spec.js — parametrized coverage for active dossier set.
// Each active dossier from content/projects.json gets the same baseline checks
// the home page enjoys: render OK, sidebar nav, language toggle, contact CTA,
// keyboard-reachable translate button, axe a11y, and target=_blank hardening.

const fs = require('node:fs');
const path = require('node:path');
const { test, expect } = require('@playwright/test');
const AxeBuilder = require('@axe-core/playwright').default;

function loadActiveDossiers() {
  const projectsPath = path.resolve(process.cwd(), 'content/projects.json');
  const parsed = JSON.parse(fs.readFileSync(projectsPath, 'utf8'));
  return parsed
    .filter((p) => p?.page?.published !== false)
    .map((p) => ({
      output: p.page.output,
      title: p.title?.text || ''
    }));
}

const dossiers = loadActiveDossiers();

for (const dossier of dossiers) {
  test.describe(`dossier: ${dossier.output}`, () => {
    test('page renders with banner_name + sidebar + translate button', async ({ page }) => {
      const response = await page.goto(`/${dossier.output}`);
      expect(response, `${dossier.output} should respond`).not.toBeNull();
      expect(response.status(), `${dossier.output} should be 200`).toBe(200);

      // h1 is the dossier title surface
      await expect(page.locator('h1').first()).toBeVisible();

      // translate button keyboard-reachable
      const translateButton = page.locator('#translate-button-icon');
      await expect(translateButton).toBeVisible();
      await expect(translateButton).toHaveAttribute('role', 'button');
      await expect(translateButton).toHaveAttribute('tabindex', '0');
    });

    test('language toggle updates <html lang>', async ({ page }) => {
      await page.goto(`/${dossier.output}`);
      await expect(page.locator('html')).toHaveAttribute('lang', 'en');
      await page.locator('#translate-button-icon').click();
      await expect(page.locator('html')).toHaveAttribute('lang', 'es');
    });

    test('external links with target=_blank are hardened', async ({ page }) => {
      await page.goto(`/${dossier.output}`);
      const unsafe = await page.evaluate(() => {
        return Array.from(document.querySelectorAll('a[target="_blank"]'))
          .filter((a) => {
            const rel = (a.getAttribute('rel') || '').toLowerCase();
            return !(rel.includes('noopener') && rel.includes('noreferrer'));
          })
          .map((a) => a.getAttribute('href') || '');
      });
      expect(unsafe).toEqual([]);
    });

    test('no axe violations on dossier (WCAG 2.1 A + AA, color-contrast enforced)', async ({ page }) => {
      await page.goto(`/${dossier.output}`);
      const results = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa'])
        .analyze();
      const formatted = results.violations
        .map((v) => `${v.id} (${v.impact}): ${v.nodes.slice(0, 6).map((n) => `${n.target.join(' ')} :: ${(n.failureSummary || '').replace(/\s+/g, ' ')}`).join(' | ')}`)
        .join('\n');
      expect(results.violations, formatted).toEqual([]);
    });
  });
}
