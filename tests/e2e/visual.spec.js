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

// Suppress the cookie banner on visual tests. Fresh CI browsers have no
// `portfolio_consent` in localStorage, so the banner overlays mid- and
// bottom-of-page sections (logos, projects) and corrupts visual diffs.
// Local browsers usually carry a prior decision and rendered without it,
// which is why baselines captured locally pass locally but fail on CI.
async function suppressCookieBanner(page) {
  await page.addInitScript(() => {
    try {
      window.localStorage.setItem('portfolio_consent', 'declined');
    } catch (err) {
      // localStorage may be blocked in strict privacy modes.
    }
  });
}

test('contact section visual baseline', async ({ page }) => {
  await suppressCookieBanner(page);
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
  await suppressCookieBanner(page);
  await page.setViewportSize({ width: 1280, height: 2600 });
  await page.goto('/index.html');
  await page.waitForLoadState('networkidle');

  // Keep carousel state deterministic for visual snapshots.
  await freezeSwipers(page);

  const sections = [
    {
      selector: '.port_experience_setions',
      locator: page.locator('.port_experience_setions'),
      snapshot: 'experience-section.png',
      // Text-heavy section: Ubuntu and macOS rasterize fonts differently enough
      // to create a stable but larger visual delta than the other snapshots.
      maxDiffPixelRatio: 0.10,
      clipWidth: 1160,
      clipHeight: 1395
    },
    {
      selector: '.port_projects_setions01',
      locator: page.locator('.port_projects_setions01'),
      snapshot: 'projects-section.png',
      // Text-heavy cards: Ubuntu CI and macOS rasterize Inter/Roboto differently
      // (line-wrap divergence on last card → ~31px height delta). CI also has
      // ±1px element-height jitter between runs. Clip well under both renders.
      maxDiffPixelRatio: 0.10,
      clipWidth: 1160,
      clipHeight: 1180
    },
    {
      selector: '.port_responsor_setions',
      locator: page.locator('.port_responsor_setions'),
      snapshot: 'logos-section.png',
      // Same CI ±1px jitter pattern (carousel reflow after font-load).
      maxDiffPixelRatio: 0.10,
      clipWidth: 1160,
      clipHeight: 392
    }
  ];

  for (const section of sections) {
    await waitForSectionVisualStability(page, section.selector);
    await freezeSwipers(page);
    await page.waitForTimeout(100);
    if (section.clipWidth || section.clipHeight) {
      const box = await section.locator.boundingBox();
      expect(box).not.toBeNull();

      const clip = {
        x: Math.round(box.x),
        y: Math.round(box.y),
        width: section.clipWidth ?? Math.round(box.width),
        height: section.clipHeight ?? Math.round(box.height)
      };

      await expect(page).toHaveScreenshot(section.snapshot, {
        clip,
        animations: 'disabled',
        caret: 'hide',
        maxDiffPixelRatio: section.maxDiffPixelRatio ?? 0.03
      });
    } else {
      await expect(section.locator).toHaveScreenshot(section.snapshot, {
        animations: 'disabled',
        caret: 'hide',
        maxDiffPixelRatio: section.maxDiffPixelRatio ?? 0.03
      });
    }
  }
});
