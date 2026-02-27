const { test, expect } = require('@playwright/test');

test('blog renders critical shell and sidebar navigation', async ({ page }) => {
  await page.goto('/blog.html');

  await expect(page.locator('.port_singleblog_wrapper')).toBeVisible();
  await expect(page.locator('.blog_heading').first()).toBeVisible();
  await expect(page.locator('a.skip-link[href="#blog_main"]')).toBeVisible();

  const navHrefs = await page.locator('.port_navigation .nav_list li a.siderbar_menuicon')
    .evaluateAll((anchors) => anchors.map((anchor) => anchor.getAttribute('href') || ''));

  expect(navHrefs).toEqual([
    'index.html#about_sec',
    'index.html#project_sec',
    'index.html#testi_sec',
    'index.html#contact_sec'
  ]);
});

test('blog sidebar social links are hardened and accessible', async ({ page }) => {
  await page.goto('/blog.html');

  const socialLinks = page.locator('.port_sidebar_social .social_list a.siderbar_icon');
  await expect(socialLinks).toHaveCount(5);

  const expectedLabels = ['Facebook', 'LinkedIn', 'WhatsApp', 'GitHub', 'Instagram'];
  for (let index = 0; index < expectedLabels.length; index += 1) {
    const link = socialLinks.nth(index);
    await expect(link).toHaveAttribute('aria-label', expectedLabels[index]);
    await expect(link).toHaveAttribute('target', '_blank');
    await expect(link).toHaveAttribute('rel', /noopener noreferrer/);
  }
});

test('blog has no horizontal overflow at 320px viewport', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 800 });
  await page.goto('/blog.html');

  const hasOverflow = await page.evaluate(() => {
    const htmlOverflow = document.documentElement.scrollWidth > document.documentElement.clientWidth + 1;
    const bodyOverflow = document.body.scrollWidth > document.documentElement.clientWidth + 1;
    return htmlOverflow || bodyOverflow;
  });

  expect(hasOverflow).toBe(false);
});
