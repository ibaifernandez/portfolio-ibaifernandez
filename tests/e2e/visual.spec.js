const { test, expect } = require('@playwright/test');

async function waitForSectionVisualStability(page, selector) {
  const locator = page.locator(selector);
  await locator.waitFor({ state: 'visible' });
  await locator.scrollIntoViewIfNeeded();
  await page.waitForTimeout(150);

  await page.waitForFunction((sel) => {
    const root = document.querySelector(sel);
    if (!root) {
      return false;
    }

    const visibleImages = Array.from(root.querySelectorAll('img')).filter((img) => {
      const style = window.getComputedStyle(img);
      return style.display !== 'none' && style.visibility !== 'hidden' && img.offsetWidth > 0 && img.offsetHeight > 0;
    });

    return visibleImages.every((img) => img.complete && img.naturalWidth > 0);
  }, selector);
}

async function freezeSwipers(page) {
  await page.evaluate(() => {
    document.querySelectorAll('.swiper-container').forEach((container) => {
      const swiper = container.swiper;
      if (!swiper) {
        return;
      }

      if (swiper.autoplay && typeof swiper.autoplay.stop === 'function') {
        swiper.autoplay.stop();
      }

      if (typeof swiper.slideToLoop === 'function') {
        swiper.slideToLoop(0, 0, false);
      } else if (typeof swiper.slideTo === 'function') {
        swiper.slideTo(0, 0, false);
      }

      if (typeof swiper.update === 'function') {
        swiper.update();
      }
    });
  });
}

test('contact section visual baseline', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 1600 });
  await page.goto('/index.html');

  const contactSection = page.locator('.contact_section');
  await contactSection.scrollIntoViewIfNeeded();
  const box = await contactSection.boundingBox();
  expect(box).not.toBeNull();

  const clip = {
    x: Math.round(box.x),
    y: Math.round(box.y),
    width: Math.round(box.width),
    height: 775
  };

  await expect(page).toHaveScreenshot('contact-section.png', {
    clip,
    animations: 'disabled',
    caret: 'hide',
    maxDiffPixelRatio: 0.02
  });
});

test('experience, projects and logos visual baselines', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 1800 });
  await page.goto('/index.html');
  await page.waitForLoadState('networkidle');

  // Keep carousel state deterministic for visual snapshots.
  await freezeSwipers(page);

  const sections = [
    {
      selector: '.port_experience_setions',
      locator: page.locator('.port_experience_setions'),
      snapshot: 'experience-section.png',
      maxDiffPixelRatio: 0.07
    },
    { selector: '.port_projects_setions01', locator: page.locator('.port_projects_setions01'), snapshot: 'projects-section.png' },
    { selector: '.port_responsor_setions', locator: page.locator('.port_responsor_setions'), snapshot: 'logos-section.png' }
  ];

  for (const section of sections) {
    await waitForSectionVisualStability(page, section.selector);
    await freezeSwipers(page);
    await page.waitForTimeout(100);
    await expect(section.locator).toHaveScreenshot(section.snapshot, {
      animations: 'disabled',
      caret: 'hide',
      maxDiffPixelRatio: section.maxDiffPixelRatio ?? 0.03
    });
  }
});
