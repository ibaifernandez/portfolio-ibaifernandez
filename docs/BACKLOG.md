# BACKLOG — Portfolio Ibai Fernandez

Objective: Evolve this portfolio into a professional reference for product, engineering, and UX — without breaking current production behavior.

## Vision and Excellence Criteria

Definition of "state-of-the-art" for this project:

- Superior performance on mobile and desktop.
- Real accessibility (WCAG 2.2 AA on key journeys).
- Maintainable and modular code with controlled technical debt.
- Robust testing (quality gates + E2E + visual regression).
- Basic observability and predictable deployment.
- Professional narrative and impeccable content.

## North-Star Metrics

- Lighthouse Performance ≥ 95 (Home, mobile).
- Lighthouse Accessibility ≥ 95.
- CLS ≤ 0.05.
- LCP ≤ 2.2s (simulated mobile 4G).
- Initial JS ≤ 220KB gzip (evolutionary target).
- Initial CSS ≤ 120KB gzip (evolutionary target).
- Critical E2E coverage ≥ 90% of defined journeys.
- 0 broken links on public pages.

## Roadmap Rules

- Do not break visible behavior of the current portfolio.
- Drastic changes are made in small, reversible sprints.
- Each sprint leaves verifiable deliverables and metrics.
- If a change requires migration, temporary coexistence (legacy + new).

---

## Epics (prioritized)

### EPIC A — Quality and Security Foundation (P0)

Status: **Completed**

- [x] Harden contact form (server-side validation/sanitization).
- [x] Eliminate `eval` in frontend validations.
- [x] Harden `target="_blank"` with `rel="noopener noreferrer"`.
- [x] Quality guardrails (`tests/quality-guards.sh`).
- [x] Add HTTP security headers in hosting config (`netlify.toml` in the current stack).
- [x] Prepare basic contact anti-spam (honeypot + timing gate).
- [x] Define progressive CSP policy (report-only → enforce).

Acceptance criteria:
- No obvious critical security findings in form and navigation.
- Quality gates consistently green.

---

### EPIC B — Performance and Media Pipeline (P0)

Status: **Completed**

- [x] `loading/width/height` on all images in `index` and `blog`.
- [x] Automatic image enrichment script.
- [x] Define byte budget per page and block in CI if exceeded.
- [x] Lazy-init of `world-map` with `IntersectionObserver` to defer initial cost.
- [x] Convert main images to AVIF with fallback (`<picture>`) and automatic coverage validation.
- [x] Complete WebP variant when environment has encoder available.
- [x] Remove dead/unused assets (`banner-bg.gif` retired + `bootstrap.min.js` eliminated and blocked in guardrails).
- [x] Review non-critical legacy library loading and defer/load on demand (`jvectormap`, `isotope`, `magnific`, `swiper`, `circle-progress`, `zoom`, `scrollbar`, `cvtext*`) + removal of static `bootstrap.min.js`.
- [x] Google Fonts: eliminate `@import` from `font.css`; load Roboto via non-blocking `rel="preload"` + `rel="preconnect"`.
- [x] `animate.css`: converted to non-blocking preload (defers decorative CSS).

Acceptance criteria:
- Measurable improvement in LCP/CLS/TBT.
- Versioned and monitored asset budget.

---

### EPIC C — Componentization and Architecture (P0)

Status: **Completed**

Objective: extract the HTML monolith to modular architecture without losing look & feel.

- [x] ADR-001: Decide strategy (Astro vs Vite + Nunjucks/partials).
- [x] Create design tokens (typography, spacing, color, shadows) and centralized variables.
- [x] Extract components: lateral navbar, hero, project cards, testimonials, footer, CTA. (Phase 1 + 2 + 3 + 4: sidebar + hero + footer + translate button + ProjectCard/TestimonialCard + training timeline + CTA data-driven)
- [x] Separate content data (`projects`, `training`, `testimonials`) in JSON/MD.
- [x] Maintain static output compatible with current hosting during transition.
- [x] Extract monolithic sections `Experience` and `Services` to dedicated components.
- [x] Data-driven migration of `Services` (`content/services.json` + `@render services-grid`).
- [x] Data-driven migration of `Experience` composition (`content/experience.json` + `@render experience-rows`).

Acceptance criteria:
- `index.html` is no longer a monolithic file difficult to evolve.
- New sections are added by changing data, not copying large blocks.

---

### EPIC D — Professional Testing and CI/CD (P0)

Status: **Completed**

- [x] Playwright base + config + CI workflow.
- [x] Real installation in network environment (`npm install`, `playwright install`).
- [x] Green E2E baseline in real environment.
- [x] Add visual regression tests in key views.
- [x] Add automatic accessibility tests (axe/playwright).
- [x] Publish artifacts (reports, screenshots) in CI.
- [x] Expand visual regression with dedicated snapshots for `Experience`, `Projects`, and `logos`, including Swiper carousel stabilization.

Acceptance criteria:
- Reliable and repeatable CI pipeline.
- Critical UI changes detect regressions before deploy.

---

### EPIC E — Accessibility and Advanced UX (P1)

Status: **Completed (pre-copy technical scope)**

- [x] Complete keyboard/focus order audit. (E2E coverage in index+blog: `skip-link`, sidebar, form, social links and keyboard activation)
- [x] Consistent aria labels/roles on icon-only controls.
- [x] Contrasts and typographic scaling reviewed in current technical scope. (Home/Contact + Blog technical shell in green for `serious/critical`)
- [x] Motion/accessibility (respect `prefers-reduced-motion`).
- [x] Accessible form states (errors/success with `aria-live`, `aria-invalid`, clear microcopy).
- [x] `skip-link` for direct jump to main content from keyboard.
- [x] `<main>` ARIA landmark: `div.port_sec_warapper` → `<main>`.
- [ ] Microcopy improvement in CTAs. (migrated to content work)

Acceptance criteria:
- WCAG 2.2 AA compliance on key journeys.

---

### EPIC E2 — Platform Migration (P0)

Status: **Completed (2026-03-02)**

- [x] Migrate from cPanel + PHP to Netlify CDN.
- [x] Migrate contact form from `ajax.php` (PHP + SMTP) to Netlify Function (Node.js 20) + Resend API.
- [x] Set up GitHub Actions CI/CD (`ci.yml`) replacing manual FTP deploy.
- [x] Update E2E static server for Netlify function routes.
- [x] Capture performance baselines post-migration: Desktop 84/94/96/92, Mobile 61/94/96/92.
- [x] Update all documentation to remove PHP/cPanel references.
- [x] ADR-003 (Netlify), ADR-004 (Resend), ADR-005 (CSS non-blocking) documented.

Acceptance criteria:
- Site fully functional on Netlify.
- Contact form working end-to-end in production.
- CI/CD gates active on `main`.

---

### EPIC F — Content and Professional Narrative (P1)

Status: **Pending**

- [ ] Editorial rewrite of home (value proposition, differentiators, cases).
- [ ] Curate portfolio with outcomes/impact focus, not just deliverables.
- [ ] Normalize language (EN/ES) and translation strategy (text, metadata).
- [ ] Advanced on-page SEO (schema, metadata per section, coherent OG).
- [ ] **Resolve blog placeholder/lorem ipsum block** (deliberately left pending for now).

Acceptance criteria:
- Portfolio communicates seniority and criteria in < 60 seconds.

---

### EPIC G — Observability and Operations (P2)

Status: **Pending (post-MVP, not blocking first technical final)**

- [ ] Frontend error tracking (Sentry or similar). (post-MVP)
- [ ] Key event analytics (CTA, contact, language). (post-MVP)
- [ ] Minimum health dashboard (Core Web Vitals + funnels). (post-MVP)
- [ ] Release and post-release checklist. (post-MVP)

Acceptance criteria:
- Real user problems detected quickly.

---

## Sprint Closed — Performance + A11y #2 (2026-03-03)

Completed in this sprint:

### #5 — Fix heading hierarchy
- `h2.port_sub_heading` → `p.port_sub_heading`
- `h1.port_heading*` → `h2.port_heading*`
- Applied to home templates and generated project pages
- Added a blocking quality guard so CI fails if the invalid heading order returns

### #6 — Color contrast WCAG AA
- Split the accent palette into vivid decorative colors and darker text-safe colors
- Rewired text/icon surfaces in Home (sidebar icons/tooltips, about headline, timeline accents, reusable accent utility classes) to use the text-safe palette
- Updated visual baselines for the intentional contrast change

## Sprint Closed — Performance #3 (2026-03-03)

Completed in this sprint:

### #7 — CSS/JS minification
- `scripts/build-pages.mjs` now generates committed `.min` CSS/JS derivatives from the readable source assets
- Generated HTML now serves `.min` assets by default and CI verifies both the generated files and the `.min` references
- `assets/js/custom.js` now lazy-loads local `.min` plugin assets where generated equivalents exist
- Home budget delta after the change: CSS `410.3 KB → 359.3 KB`, JS `144.4 KB → 127.2 KB`

## Sprint Closed — Performance #4 (2026-03-03)

Completed in this sprint:

### #8 — WebP/AVIF for remaining images
- Media conversion/check scripts now cover every generated root HTML page by default, not just Home/Blog
- `media:avif` / `media:webp` now rebuild the site after asset generation, so the normal workflow does not create HTML drift against templates
- Closed the remaining out-of-band gaps found in generated project pages and testimonial media
- Quality now reports `skipped_missing_asset=0` in WebP coverage

## Upcoming Sprint — Measurement + Launch Verification

Priority items for next session:

### #9 — Re-capture PageSpeed against the current baseline
- **Problem:** The baseline still reflects the state before headings, contrast, minification, and residual media fixes were fully closed
- **Fix:** Run new PageSpeed captures and compare deltas against the documented baseline
- **Impact:** Evidence-based decision on whether any further performance work is needed before launch-hardening

---

## Post-Sprint Backlog (Production Readiness)

- [ ] Activate Turnstile captcha in production (set env vars in Netlify dashboard)
- [ ] QA manual on Desktop + Mobile
- [ ] Google Search Console verification
- [ ] Bing Webmaster Tools verification
- [ ] Sitemap submission (`sitemap.xml`)
- [ ] PageSpeed re-capture after improvements #1–8
- [ ] Promote CSP from report-only to enforce mode (after 2 weeks clean in report-only)
- [ ] Release tag `v2.0.0`

---

## Detailed Backlog (items)

### Security / Infra

- [x] BL-SEC-001: Add security headers in hosting config (`netlify.toml` in the current stack).
- [x] BL-SEC-002: Anti-bot honeypot in contact form.
- [x] BL-SEC-003: Stateless-safe contact anti-spam baseline (honeypot + timing gate in the current Netlify flow).
- [x] BL-SEC-004: CSP report-only + violation collection.
- [ ] BL-SEC-005: Promote CSP to enforce mode (after validation period).
- [ ] BL-SEC-006: Add SRI (Subresource Integrity) hashes for CDN-loaded scripts.

### Performance

- [x] BL-PERF-001: AVIF conversion script and HTML fallback mapping (`<picture>`).
- [x] BL-PERF-002: Implement byte budget in CI.
- [x] BL-PERF-003: Legacy JS dependency audit (retire unused).
- [x] BL-PERF-004: Minimal critical inline + defer/lazy by priority.
- [x] BL-PERF-005: Deferred map initialization to reduce initial cost.
- [x] BL-PERF-006: Add WebP support to media pipeline.
- [x] BL-PERF-007: Deferred loading of `jquery-jvectormap*` to reduce initial JS.
- [x] BL-PERF-008: Deferred loading of non-critical plugins (`isotope`, `magnific`, `swiper`, `circle-progress`, `zoom`, `scrollbar`).
- [x] BL-PERF-009: Remove legacy `banner-bg.gif` and block re-introduction in quality gates.
- [x] BL-PERF-010: Eliminate Google Fonts `@import` from `font.css`; non-blocking preload.
- [x] BL-PERF-011: Convert `animate.css` to non-blocking preload.
- [x] BL-PERF-012: Build-generated CSS minification for served `.min` assets (dependency-free path; readable sources preserved).
- [x] BL-PERF-013: Build-generated JS minification/compaction for served `.min` assets (dependency-free path; readable sources preserved).
- [x] BL-PERF-014: Extend AVIF/WebP generation + coverage defaults from Home/Blog to all generated root HTML pages.

### Architecture

- [x] BL-ARCH-001: Componentization strategy ADR.
- [x] BL-ARCH-002: Centralized design tokens.
- [x] BL-ARCH-003: `ProjectCard` component data-driven.
- [x] BL-ARCH-004: `TestimonialCard` component data-driven.
- [x] BL-ARCH-005: Separate data to `content/*.json`.
- [x] BL-ARCH-006: Template and partial workflow with build/check (`src/pages`, `src/components`, `scripts/build-pages.mjs`).
- [x] BL-ARCH-007: `@render` directive support + required field validation in `scripts/build-pages.mjs`.
- [x] BL-ARCH-008: CTA componentization (hero/about/training) via `content/ctas.json`.
- [x] BL-ARCH-009: Extraction of monolithic `Experience` and `Services` sections to dedicated components.
- [x] BL-ARCH-010: Data-driven migration of `Services`.
- [x] BL-ARCH-011: Data-driven migration of `Experience` composition.
- [x] BL-ARCH-012: Platform migration — Netlify + Netlify Functions (Node.js 20).
- [x] BL-ARCH-013: Contact backend migration — Resend API (replacing SMTP/PHP).

### Testing / CI

- [x] BL-QA-001: Green Playwright baseline in real environment.
- [x] BL-QA-002: E2E form + external routes + language.
- [x] BL-QA-003: Visual regression of home at key breakpoints.
- [x] BL-QA-004: Automatic broken link test (internal/external).
- [x] BL-QA-005: E2E keyboard navigation coverage in critical journeys (tab order + sidebar activation + language button).
- [x] BL-QA-006: Additional keyboard E2E coverage (contact form tab order + social link reachability with accessible labels).
- [x] BL-QA-007: Blog shell E2E coverage (critical render, social links accessible/hardened, no horizontal overflow on mobile).
- [x] BL-QA-009: Robust Playwright operability protocol (orphan process diagnosis/cleanup + `test:e2e:clean` wrapper).
- [x] BL-QA-010: Expand Home visual regression with dedicated snapshots for `Experience`, `Projects`, and `logos`, including Swiper carousel stabilization.
- [x] BL-QA-008: Re-activate `color-contrast` as blocking rule in `tests/e2e/a11y.spec.js` after closing the last failing project CTA contrast debt.

### A11y / UX

- [x] BL-UX-001: Focus state and tab order audit. (automated coverage in index+blog for critical navigation, form, and social links)
- [x] BL-UX-002: ARIA labels on icon buttons.
- [x] BL-UX-003: `prefers-reduced-motion` mode.
- [x] BL-UX-004: Clearer form error/success states.
- [x] BL-UX-005: Sidebar navigation with semantic anchors and stable scroll.
- [x] BL-UX-006: `skip-link` visible on focus for keyboard navigation.
- [x] BL-UX-007: Fix `serious/critical` contrasts detected by axe in Home/Contact.
- [x] BL-UX-008: Extend `tests/e2e/a11y.spec.js` to cover primary Home sections.
- [x] BL-UX-010: `<main>` ARIA landmark — promote `div.port_sec_warapper` to `<main>`.
- [x] BL-UX-009: Final WCAG AA contrast round in Home (text/icon accent palette split across timeline, services cards, and secondary typographies). Blocking `color-contrast` automation is active again in Playwright.
- [x] BL-UX-011: Fix heading hierarchy (h2→h1 inversion in section blocks) across Home + generated project pages, with CI guard coverage.

### Content / Brand

- [ ] BL-CNT-001: Hero and value proposition rewrite.
- [ ] BL-CNT-002: Curate projects by impact (problem → solution → result).
- [ ] BL-CNT-003: Replace legacy placeholder texts.
- [ ] BL-CNT-004: **Resolve Blog Lorem Ipsum block (pending, do not modify now).**
- [x] BL-CNT-005: Remove legacy experience from `Experience` timeline and rebalance layout (from 2+4+1 to 2+2+2 cards) without regressions.
- [x] BL-CNT-006: Remove the same legacy brand from projects grid and logos carousel for complete removal from public portfolio.

---

## Definition of Done per Item

An item is considered done only if:

- Code implemented + quality guards green.
- Automated test created/updated where applicable.
- Affected metric measured before/after (if applicable).
- Minimal documentation updated (`README`/`docs`).
- Change is reversible (clear rollback).

---

## Operational Notes

- The backlog is live; it can be re-prioritized weekly.
- Production deploy changes are postponed until local baseline + stable CI are closed.
- The Blog Lorem Ipsum block is explicitly pending and is not modified in this phase.

---

*Last updated: 2026-03-03 — moved from root BACKLOG.md + updated for Netlify stack*
