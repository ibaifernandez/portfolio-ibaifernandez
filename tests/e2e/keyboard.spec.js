const { test, expect } = require('@playwright/test');

async function expectActiveElementMatches(page, selector) {
  const matches = await page.evaluate((targetSelector) => {
    if (!document.activeElement) {
      return false;
    }
    return document.activeElement.matches(targetSelector);
  }, selector);

  expect(matches).toBe(true);
}

async function isActiveElement(page, selector) {
  return page.evaluate((targetSelector) => {
    if (!document.activeElement) {
      return false;
    }
    return document.activeElement.matches(targetSelector);
  }, selector);
}

async function tabUntilFocus(page, selector, maxSteps = 50) {
  for (let step = 0; step < maxSteps; step += 1) {
    const focused = await isActiveElement(page, selector);
    if (focused) {
      return true;
    }
    await page.keyboard.press('Tab');
  }
  return false;
}

test('keyboard tab order reaches primary sidebar navigation in logical sequence', async ({ page }) => {
  await page.goto('/index.html');

  await page.keyboard.press('Tab');
  await expectActiveElementMatches(page, 'a.skip-link');

  const expectedAnchors = ['#about_sec', '#training_sec', '#project_sec', '#contact_sec'];
  const observedAnchors = [];

  for (let attempt = 0; attempt < 30 && observedAnchors.length < expectedAnchors.length; attempt += 1) {
    await page.keyboard.press('Tab');

    const href = await page.evaluate(() => {
      const active = document.activeElement;
      if (!active || !(active instanceof HTMLAnchorElement)) {
        return null;
      }
      if (!active.classList.contains('siderbar_menuicon')) {
        return null;
      }
      return active.getAttribute('href');
    });

    if (href && !observedAnchors.includes(href)) {
      observedAnchors.push(href);
    }
  }

  expect(observedAnchors).toEqual(expectedAnchors);
});

test('sidebar anchors and language toggle are keyboard reachable and activatable', async ({ page }) => {
  await page.goto('/index.html');

  const projectAnchor = page.locator('.port_navigation.index_navigation a.siderbar_menuicon[href="#project_sec"]');
  await projectAnchor.focus();
  await expect(projectAnchor).toBeFocused();
  await page.keyboard.press('Enter');

  const contactAnchor = page.locator('.port_navigation.index_navigation a.siderbar_menuicon[href="#contact_sec"]');
  await contactAnchor.focus();
  await expect(contactAnchor).toBeFocused();
  await page.keyboard.press('Enter');

  let translateButtonReached = false;
  for (let attempt = 0; attempt < 120; attempt += 1) {
    await page.keyboard.press('Tab');
    translateButtonReached = await page.evaluate(() => document.activeElement?.id === 'translate-button-icon');
    if (translateButtonReached) {
      break;
    }
  }

  expect(translateButtonReached).toBe(true);

  await page.keyboard.press('Enter');
  await expect(page.locator('html')).toHaveAttribute('lang', 'es');
});

test('contact form tab order is logical and complete', async ({ page }) => {
  await page.goto('/index.html');

  const firstInput = page.locator('#name');
  await firstInput.scrollIntoViewIfNeeded();
  await firstInput.focus();
  await expectActiveElementMatches(page, '#name');

  const expectedSequence = ['#last-name', '#email', '#subject', '#comment', '.submitForm'];
  for (const selector of expectedSequence) {
    await page.keyboard.press('Tab');
    await expectActiveElementMatches(page, selector);
  }
});

test('sidebar social links are keyboard reachable and named for assistive tech', async ({ page }) => {
  await page.goto('/index.html');

  const contactMenuAnchor = '.port_navigation.index_navigation a.siderbar_menuicon[href="#contact_sec"]';
  await page.locator(contactMenuAnchor).focus();
  await expectActiveElementMatches(page, contactMenuAnchor);

  const firstSocialSelector = '.port_sidebar_social .social_list a.siderbar_icon[href="https://facebook.com/ibaifernandezec"]';
  const reachedFirstSocial = await tabUntilFocus(page, firstSocialSelector, 12);
  expect(reachedFirstSocial).toBe(true);

  const socialLinks = page.locator('.port_sidebar_social .social_list a.siderbar_icon');
  const count = await socialLinks.count();
  expect(count).toBeGreaterThan(0);

  const expectedLabels = ['Facebook', 'LinkedIn', 'WhatsApp', 'GitHub', 'Instagram'];
  for (let index = 0; index < count; index += 1) {
    const socialLink = socialLinks.nth(index);
    await expect(socialLink).toHaveAttribute('aria-label', expectedLabels[index]);
  }
});

test('blog page skip link is first focus target and points to main content', async ({ page }) => {
  await page.goto('/blog.html');

  await page.keyboard.press('Tab');
  await expectActiveElementMatches(page, 'a.skip-link[href="#blog_main"]');

  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/#blog_main$/);
});

test('blog sidebar social links are keyboard reachable and named for assistive tech', async ({ page }) => {
  await page.goto('/blog.html');

  const contactMenuAnchor = '.port_navigation a.siderbar_menuicon[href="index.html#contact_sec"]';
  await page.locator(contactMenuAnchor).focus();
  await expectActiveElementMatches(page, contactMenuAnchor);

  const firstSocialSelector = '.port_sidebar_social .social_list a.siderbar_icon[href="https://facebook.com/ibaifernandezec"]';
  const reachedFirstSocial = await tabUntilFocus(page, firstSocialSelector, 12);
  expect(reachedFirstSocial).toBe(true);

  const socialLinks = page.locator('.port_sidebar_social .social_list a.siderbar_icon');
  const count = await socialLinks.count();
  expect(count).toBeGreaterThan(0);

  const expectedLabels = ['Facebook', 'LinkedIn', 'WhatsApp', 'GitHub', 'Instagram'];
  for (let index = 0; index < count; index += 1) {
    const socialLink = socialLinks.nth(index);
    await expect(socialLink).toHaveAttribute('aria-label', expectedLabels[index]);
  }
});
