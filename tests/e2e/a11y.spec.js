const { test, expect } = require('@playwright/test');
const AxeBuilder = require('@axe-core/playwright').default;
const NON_BLOCKING_A11Y_RULES = new Set(['color-contrast']);

function formatViolations(violations) {
  return violations
    .map((violation) => {
      const nodes = violation.nodes
        .map((node) => node.target.join(' '))
        .slice(0, 3)
        .join(', ');
      return `${violation.id} (${violation.impact}): ${nodes}`;
    })
    .join('\n');
}

function getBlockingViolations(results) {
  return results.violations.filter((violation) =>
    ['serious', 'critical'].includes(violation.impact)
    && !NON_BLOCKING_A11Y_RULES.has(violation.id)
  );
}

test('contact section has no serious/critical WCAG violations', async ({ page }) => {
  await page.goto('/index.html');

  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa'])
    .include('.contact_section')
    .analyze();

  const hardViolations = getBlockingViolations(results);

  expect(hardViolations, formatViolations(hardViolations)).toEqual([]);
});

test('home primary sections have no serious/critical WCAG violations', async ({ page }) => {
  await page.goto('/index.html');

  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa'])
    .include('.port_sidebar_wrapper')
    .include('.port_banner_wrapper')
    .include('.port_about_setions')
    .include('.port_education_setions')
    .include('.port_projects_setions')
    .include('.port_testimonial_setions')
    .include('.port_contact_wrapper')
    .analyze();

  const hardViolations = getBlockingViolations(results);

  expect(hardViolations, formatViolations(hardViolations)).toEqual([]);
});

test('blog technical shell has no serious/critical WCAG violations', async ({ page }) => {
  await page.goto('/blog.html');

  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa'])
    .include('.port_sidebar_wrapper')
    .include('.port_togglebox')
    .include('.blog_searchbox')
    .include('.blog_shareinfo .blog_social')
    .analyze();

  const hardViolations = getBlockingViolations(results);

  expect(hardViolations, formatViolations(hardViolations)).toEqual([]);
});
