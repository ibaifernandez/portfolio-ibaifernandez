const fs = require('node:fs');
const { test, expect } = require('@playwright/test');

test('home renders critical UI blocks', async ({ page }) => {
  await page.goto('/index.html');

  await expect(page).toHaveTitle(/Ibai Fernández - Portfolio/i);
  await expect(page.locator('h1.banner_name')).toBeVisible();
  await expect(page.locator('#translate-button-icon')).toBeVisible();
  await expect(page.locator('#translate-button-icon')).toHaveAttribute('role', 'button');
  await expect(page.locator('#translate-button-icon')).toHaveAttribute('tabindex', '0');
  await expect(page.locator('.port_navigation.index_navigation .nav_list li')).toHaveCount(4);
});

test('sidebar navigation points to existing section anchors', async ({ page }) => {
  await page.goto('/index.html');

  const hrefs = await page.locator('.port_navigation.index_navigation .nav_list li a.siderbar_menuicon')
    .evaluateAll((anchors) => anchors.map((anchor) => anchor.getAttribute('href') || ''));

  expect(hrefs).toEqual(['#about_sec', '#training_sec', '#project_sec', '#contact_sec']);

  for (const href of hrefs) {
    await expect(page.locator(href)).toHaveCount(1);
  }
});

test('skip link targets main content section', async ({ page }) => {
  await page.goto('/index.html');

  const skipLink = page.locator('a.skip-link');
  await expect(skipLink).toHaveAttribute('href', '#about_sec');

  await skipLink.focus();
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/#about_sec$/);
});

test('first keyboard tab lands on skip link', async ({ page }) => {
  await page.goto('/index.html');

  await page.keyboard.press('Tab');
  const focusedClass = await page.evaluate(() => document.activeElement?.className || '');
  expect(String(focusedClass)).toContain('skip-link');
});

test('profile image uses AVIF/WebP sources with fallback', async ({ page }) => {
  await page.goto('/index.html');

  const profilePicture = page.locator('.profile_circle picture').first();
  await expect(profilePicture).toBeVisible();
  await expect(profilePicture.locator('source[type="image/avif"]')).toHaveAttribute(
    'srcset',
    /assets\/images\/ibai-fernandez-1\.avif/
  );
  await expect(profilePicture.locator('source[type="image/webp"]')).toHaveAttribute(
    'srcset',
    /assets\/images\/ibai-fernandez-1\.webp/
  );
  await expect(profilePicture.locator('img')).toHaveAttribute('src', /assets\/images\/ibai-fernandez-1\.jpg/);
});

test('language toggle updates html lang and hero pre-title text', async ({ page }) => {
  await page.goto('/index.html');

  const preTitle = page.locator('[translate="systemic"]').first();
  await expect(preTitle).toContainText(/Systemic/i);

  await page.locator('#translate-button-icon').click();

  await expect(page.locator('html')).toHaveAttribute('lang', 'es');
  await expect(preTitle).toContainText(/Sist[eé]mico/i);
});

test('language toggle supports keyboard activation', async ({ page }) => {
  await page.goto('/index.html');

  const button = page.locator('#translate-button-icon');
  await button.focus();
  await page.keyboard.press('Enter');

  await expect(page.locator('html')).toHaveAttribute('lang', 'es');
});

test('external links with target blank are hardened', async ({ page }) => {
  await page.goto('/index.html');

  const unsafeLinks = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('a[target="_blank"]'))
      .filter((anchor) => {
        const rel = (anchor.getAttribute('rel') || '').toLowerCase();
        return !(rel.includes('noopener') && rel.includes('noreferrer'));
      })
      .map((anchor) => anchor.getAttribute('href') || '');
  });

  expect(unsafeLinks).toEqual([]);
});

test('contact CTA points to contact section anchor', async ({ page }) => {
  await page.goto('/index.html');

  const contactButton = page.locator('a.redirect_contact').first();
  await expect(contactButton).toHaveAttribute('href', '#scroll_contact');

  await contactButton.click();
  await expect(page).toHaveURL(/#scroll_contact$/);
});

test('contact form exposes anti-spam guard fields', async ({ page }) => {
  await page.goto('/index.html');

  const honeypot = page.locator('input[name="website"]');
  const startedAt = page.locator('input[name="form_started_at"]');

  await expect(honeypot).toBeAttached();
  await expect(startedAt).toBeAttached();
  await expect(startedAt).not.toHaveValue('');
});

test('retired blog route redirects to home', async ({ page }) => {
  const response = await page.goto('/blog.html');

  expect(response).not.toBeNull();
  expect(response.status()).toBe(200);
  await expect(page).toHaveURL(/\/(?:index\.html)?$/);
  await expect(page.locator('h1.banner_name')).toBeVisible();
});

test('legacy project routes redirect to the normalized dossier slugs', async ({ page }) => {
  const legacyRoutes = [
    ['/project-debtracker.html', '/debtracker.html'],
    ['/project-gymtracker.html', '/gymtracker.html'],
    ['/project-enterprise-crm.html', '/lfi.html'],
    ['/project-ruta-digitalizacion-2x2mkt.html', '/ruta-de-la-digitalizacion-y-2x2-mkt.html'],
    ['/project-portfolio-ibaifernandez.html', '/portfolio-ibaifernandez.html'],
    ['/project-myboard.html', '/my-board.html'],
    ['/project-the-research-engine.html', '/the-research-engine.html'],
    ['/project-elm-st.html', '/elm-st.html'],
    ['/project-aglaya.html', '/aglaya.html']
  ];

  for (const [legacyPath, normalizedPath] of legacyRoutes) {
    const response = await page.goto(legacyPath);
    expect(response).not.toBeNull();
    expect(response.status(), `${legacyPath} should resolve to ${normalizedPath}`).toBe(200);
    await expect(page).toHaveURL(new RegExp(`${normalizedPath.replace('.', '\\.')}$`));
  }
});

test('legacy LFi draft alias remains redirected in routing config', async () => {
  const netlifyToml = fs.readFileSync('netlify.toml', 'utf8');
  const staticServer = fs.readFileSync('scripts/static-server.mjs', 'utf8');

  expect(netlifyToml).toContain('from   = "/lfi-v2.html"');
  expect(netlifyToml).toContain('from   = "/lfi-v2"');
  expect(staticServer).toContain("pathname === '/lfi-v2'");
  expect(staticServer).toContain("pathname === '/lfi-v2.html'");
});

test('main content wrapper is not nested in hero and aligns after sidebar', async ({ page }) => {
  await page.goto('/index.html');

  const layout = await page.evaluate(() => {
    const sidebar = document.querySelector('.port_sidebar_wrapper');
    const main = document.querySelector('.port_sec_warapper');
    if (!sidebar || !main) {
      return null;
    }
    const sidebarRect = sidebar.getBoundingClientRect();
    const mainRect = main.getBoundingClientRect();
    return {
      nestedInHero: Boolean(main.closest('#cv_container')),
      sidebarWidth: sidebarRect.width,
      mainLeft: mainRect.left
    };
  });

  expect(layout).not.toBeNull();
  expect(layout.nestedInHero).toBeFalsy();
  expect(Math.abs(layout.mainLeft - layout.sidebarWidth)).toBeLessThanOrEqual(2);
});
