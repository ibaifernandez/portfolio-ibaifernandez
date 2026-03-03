# GLOSSARY.md — Project Glossary

Terms, acronyms, and project-specific concepts used across this repository's documentation and codebase.

---

## A

**ADR (Architecture Decision Record)**
A documented record of a significant architectural decision, including the context, the decision made, the alternatives considered, and the rationale. See `docs/ENGINEERING-CHANGELOG.md` for ADR-001 through ADR-005.

**AVIF**
AV1 Image File Format. A modern image format with significantly better compression than JPEG or WebP, especially for photographic content. Used as the primary image format in this project with WebP and original as fallbacks.

**Axe**
An open-source accessibility testing library. Used in this project via the `@axe-core/playwright` integration in `tests/e2e/a11y.spec.js`. Reports violations by severity: minor, moderate, serious, critical.

---

## B

**Baseline (performance)**
A captured measurement of Lighthouse scores, Core Web Vitals, and other metrics at a specific point in time, used as a reference for before/after comparisons. Baseline for this project was captured on 2026-03-02 immediately after Netlify migration: Desktop 84/94/96/92, Mobile 61/94/96/92.

**Blog section**
The section of `index.html` showing blog/project cards. Currently replaced with a "Coming soon" placeholder. See `BL-CNT-004` in `docs/BACKLOG.md`. The original card template is preserved in `src/components/index/blog-card.template.html`.

**Budget (performance)**
A defined limit on the size of assets (CSS, JS, images, total) per page. Defined in `tests/performance-budget.config.json` and enforced by `npm run test:budget` in CI.

---

## C

**CLS (Cumulative Layout Shift)**
A Core Web Vitals metric measuring visual stability. A score ≤ 0.05 is "good". Prevented in this project by adding explicit `width` and `height` attributes to all images, which allows browsers to reserve layout space before images load.

**Componentization**
The process of extracting repeated HTML markup into reusable partial files (`src/components/**/*.html`) combined with a build step that assembles them. Phase 1–4 covered hero, nav, footer, project cards, testimonials, training, CTAs, services, and experience sections.

**Content Security Policy (CSP)**
An HTTP header that restricts the sources from which a page can load scripts, styles, images, and other resources. Currently active in `report-only` mode; enforce mode is a pending action (Phase 6).

**CTA (Call to Action)**
A button or link prompting the user to take a specific action (e.g., "Contact me", "Download CV"). CTAs are data-driven from `content/ctas.json` since Phase 4 of componentization.

---

## D

**Data-driven content**
Content that is stored in JSON files (`content/*.json`) and injected into HTML templates at build time via `@render` directives, rather than being hardcoded in HTML. This means content can be updated by editing JSON without touching markup.

**Design tokens**
Named variables for visual properties (colors, spacing, typography, shadows) defined in the `:root` block of `assets/css/style.css`. Allow consistent visual design and safe theming changes.

---

## E

**E2E test (End-to-End test)**
A test that exercises the full browser experience from navigation through interaction. This project uses Playwright (Chromium) for E2E tests in `tests/e2e/`. Current suite: 29 tests.

**Epic**
A large body of work grouped around a theme. This project uses 7 epics (A–G) in `docs/BACKLOG.md`. Epics A–E are complete; F–G are pending.

---

## F

**Font Awesome**
An icon library used throughout the portfolio for decorative and functional icons. Loaded from `assets/css/all.min.css` (local copy). Icon-only controls must have `aria-label` for accessibility.

**`font-display: swap`**
A CSS descriptor that instructs the browser to show fallback text while the custom font loads, then swap to the custom font when it's ready. Used for all `@font-face` declarations in `font.css`.

---

## G

**GitHub Actions**
The CI/CD platform used to automate quality checks, E2E tests, and production deploys on every push to `main`. Current workflow: `ci.yml`.

---

## H

**HSTS (HTTP Strict Transport Security)**
A security header that tells browsers to only access a site over HTTPS and to reject HTTP connections. Useful when explicitly configured, but not currently defined in this repository's `netlify.toml`.

**Honeypot (anti-spam)**
A hidden form field (`website`) that real users won't fill but bots typically will. If the field is non-empty when the form is submitted, the contact function silently rejects the request.

---

## I

**`@include` directive**
A custom build directive used in template files: `<!-- @include path/to/partial.html -->`. The build script (`scripts/build-pages.mjs`) inlines the referenced partial file at that position.

**IntersectionObserver**
A browser API that efficiently detects when an element enters or exits the viewport. Used to trigger lazy initialization of the world map and other heavy jQuery plugins.

---

## J

**jvectormap**
A jQuery plugin for rendering interactive vector maps. Used for the "world map" section showing geographic experience. Loaded lazily via `IntersectionObserver` to reduce initial JS cost.

---

## L

**LCP (Largest Contentful Paint)**
A Core Web Vitals metric measuring the time from page load to when the largest visible element is painted. Target: ≤ 2.2s on mobile 4G. Improved by early-loading the hero/profile image and using AVIF format.

**LoadCSS pattern**
The idiom `<link rel="preload" as="style" onload="this.onload=null;this.rel='stylesheet'">` for loading a CSS file without blocking rendering. Used for `animate.css` and Google Fonts.

---

## M

**`<main>` landmark**
The HTML5 element and ARIA landmark role that identifies the primary content of a page. Required by WCAG 2.1 SC 4.1.2. The portfolio's `port_sec_warapper` div was promoted to `<main>` in Phase 5.1.

**Minification**
Removing whitespace, comments, and other non-essential characters from CSS and JS files to reduce file size. Planned for Phase 5.2 (`#7 — CSS/JS minification`).

---

## N

**Netlify**
The CDN and serverless functions platform hosting this portfolio. Replaced cPanel hosting on 2026-03-02. Provides: atomic deploys, automatic HTTPS, serverless functions, environment variable management.

**Netlify Function**
A serverless Node.js function deployed alongside the static site on Netlify. The contact form backend lives in `netlify/functions/contact.js`. Invoked at `/.netlify/functions/contact`.

**`netlify.toml`**
The Netlify configuration file in the repository root. Defines routing rules, redirect rules, and the function directory.

---

## P

**PageSpeed Insights**
Google's tool for capturing and scoring Lighthouse metrics. Used to capture baselines and measure improvements. Scores are reported as Performance / Accessibility / Best Practices / SEO.

**`<picture>` element**
An HTML element that wraps multiple `<source>` elements and a fallback `<img>`, allowing the browser to choose the best image format it supports. Used for all large images: AVIF source → WebP source → original `<img>`.

**Playwright**
The E2E testing framework used in this project. Tests run in Chromium. Config in `playwright.config.js`.

**`port_sec_warapper`**
The CSS class name of the main content wrapper element. The naming is from the original template. Since Phase 5.1, the element is `<main class="port_sec_warapper">` rather than `<div>`.

**`prefers-reduced-motion`**
A CSS media query that detects user system preference for reduced animation. All CSS animations and JS-driven animations are suppressed when this preference is active.

**PRD (Product Requirements Document)**
A document defining what a product should do, for whom, and why. See `docs/PRD.md`.

**PurgeCSS**
A tool that removes unused CSS rules by analyzing HTML and JS. Planned for Phase 5.2 to reduce CSS bundle size.

---

## Q

**Quality guards**
Shell-based checks in `tests/quality-guards.sh` that enforce a set of project rules (no eval, no empty hrefs, AVIF coverage, budget, security headers, etc.). Run via `npm run test:quality`. Gated in CI.

---

## R

**Rate limiting**
An anti-abuse mechanism that limits how many requests a client can make in a time window. It is not currently implemented in the production Netlify Function for this repo.

**`@render` directive**
A custom build directive: `<!-- @render component-name -->`. The build script reads the corresponding JSON from `content/`, iterates over items, and renders the component template once per item with `{{field}}` placeholder substitution.

**Resend**
The transactional email API used to deliver contact form submissions to the portfolio owner's inbox. Replaces the previous SMTP-based approach. API key stored in Netlify environment variable `RESEND_API_KEY`.

---

## S

**`skip-link`**
A visually hidden link that becomes visible on keyboard focus, allowing keyboard users to skip repetitive navigation and jump directly to main content. Required by WCAG 2.1 SC 2.4.1. Present on all pages as `<a class="skip-link" href="#main_content">`.

**`stale-while-revalidate`**
A Cache-Control directive that allows serving a stale cached response while fetching a fresh version in the background. Applied to JSON i18n files to improve perceived performance on repeat visits.

**Static server**
A minimal Node.js HTTP server (`scripts/static-server.mjs`) that serves the portfolio locally for E2E tests. Handles `/.netlify/functions/contact`, parses `application/json`, and mirrors the production contact contract closely enough for deterministic tests. Started via `npm run start`.

---

## T

**Template**
A source file in `src/pages/` (e.g., `index.template.html`) that contains the page structure with `@include` and `@render` directives. NOT the final HTML — the build script generates the final HTML from templates.

**Turnstile**
Cloudflare's CAPTCHA alternative. User-friendly, privacy-preserving bot detection. Integrated in the contact form frontend and backend, but not yet activated in production. Activation requires setting `PORTFOLIO_CAPTCHA_PROVIDER=turnstile` in Netlify environment variables.

---

## V

**Visual regression test**
An E2E test that captures a screenshot of a component or page and compares it to a reference snapshot. Fails if the visual output differs beyond a threshold. Used in `tests/e2e/visual.spec.js` for the contact section, experience, projects, and logos sections.

---

## W

**WCAG**
Web Content Accessibility Guidelines. International standard for web accessibility. Target for this project: WCAG 2.2 Level AA on all key user journeys.

**WebP**
A modern image format from Google with better compression than JPEG at equivalent quality. Used as the secondary image format (after AVIF) in `<picture>` elements.

---

*Last updated: 2026-03-03*
