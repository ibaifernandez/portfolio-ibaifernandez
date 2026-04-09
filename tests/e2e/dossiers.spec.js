const { test, expect } = require('@playwright/test');

test('active dossier navigation stays inside the four-page public set', async ({ page }) => {
  const activeDossiers = [
    { route: '/lfi.html', previous: null, next: 'ruta-de-la-digitalizacion-y-2x2-mkt.html' },
    { route: '/ruta-de-la-digitalizacion-y-2x2-mkt.html', previous: 'lfi.html', next: 'elm-st.html' },
    { route: '/elm-st.html', previous: 'ruta-de-la-digitalizacion-y-2x2-mkt.html', next: 'aglaya.html' },
    { route: '/aglaya.html', previous: 'elm-st.html', next: null }
  ];

  for (const dossier of activeDossiers) {
    await page.goto(dossier.route);

    const previousLink = page.locator('.project_case_navlink--prev');
    const nextLink = page.locator('.project_case_navlink--next');

    if (dossier.previous) {
      await expect(previousLink).toHaveAttribute('href', dossier.previous);
    } else {
      await expect(previousLink).toHaveCount(0);
    }

    if (dossier.next) {
      await expect(nextLink).toHaveAttribute('href', dossier.next);
    } else {
      await expect(nextLink).toHaveCount(0);
    }
  }
});
