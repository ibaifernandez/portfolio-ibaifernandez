# ROADMAP.md — Strategic Project Roadmap

**Last updated:** 2026-03-03
**Status:** Active

---

## Vision

Transform the portfolio into a **state-of-the-art professional showcase** that demonstrates senior-level Front-End and product engineering capabilities — without breaking existing behavior or introducing regressions.

---

## North-Star Metrics

| Metric | Target | Baseline (2026-03-02) | Post-Sprint #1 |
|---|---|---|---|
| Lighthouse Performance (mobile) | ≥ 95 | 61 | TBD (re-capture pending) |
| Lighthouse Performance (desktop) | ≥ 95 | 84 | TBD |
| Lighthouse Accessibility | ≥ 95 | 94 | TBD |
| LCP (mobile 4G) | ≤ 2.2s | TBD | TBD |
| CLS | ≤ 0.05 | TBD | TBD |
| JS initial (gzip) | ≤ 220KB | TBD | TBD |
| CSS initial (gzip) | ≤ 120KB | TBD | TBD |
| E2E test coverage | ≥ 90% critical journeys | 29/29 (100%) | 29/29 |
| Broken links | 0 | 0 | 0 |

---

## Completed Phases

### Phase 0 — Quality & Security Foundation (Epic A) ✅
*Completed 2026-01*

Key outcomes:
- Security headers in hosting config (`netlify.toml`) (X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy)
- Honeypot + timing-based anti-spam on contact form
- Backend anti-spam hardening (`ajax.php` originally; current production contract is honeypot + timing + optional captcha)
- Quality guards shell script (`tests/quality-guards.sh`)
- CSP in report-only mode

---

### Phase 1 — Performance & Media Pipeline (Epic B) ✅
*Completed 2026-02*

Key outcomes:
- All images with `loading`, `width`, `height` (CLS prevention)
- AVIF pipeline (29 images) with `<picture>` fallback
- WebP pipeline (29 images) with `<picture>` fallback
- Asset size budget enforced in CI
- Lazy initialization: `jvectormap`, `isotope`, `magnific`, `swiper`, `circle-progress`, `zoom`, `scrollbar`
- `bootstrap.min.js` eliminated from static load

---

### Phase 2 — Componentization (Epic C) ✅
*Completed 2026-02*

Key outcomes:
- Template + partial build system (`scripts/build-pages.mjs`)
- Design tokens in `style.css` `:root`
- Data-driven: Projects, Testimonials, Training, CTAs, Services, Experience
- `content/*.json` is the editorial layer — no markup changes needed for content edits
- ADR-001 (componentization strategy) and ADR-002 (CSS tokens) documented

---

### Phase 3 — Professional Testing & CI/CD (Epic D) ✅
*Completed 2026-02*

Key outcomes:
- Playwright baseline (29 tests covering render, navigation, keyboard, a11y, visual, contact)
- GitHub Actions: `ci.yml` on every push to `main`
- Axe accessibility automation integrated into E2E suite
- Visual regression snapshots for Contact, Experience, Projects, Logos
- Link checker (internal + external)
- Performance budget runner

---

### Phase 4 — Accessibility Hardening (Epic E) ✅
*Completed 2026-02*

Key outcomes:
- `<main>` ARIA landmark (div → main)
- `skip-link` on all pages
- `aria-live` + `aria-invalid` on contact form
- `prefers-reduced-motion` in CSS and JS
- Icon-only controls with `aria-label`
- Axe baseline: zero serious/critical violations on Home, Contact, Blog shell
- Full keyboard navigation E2E coverage

---

### Phase 5 — Platform Migration (cPanel → Netlify) ✅
*Completed 2026-03-02*

Key outcomes:
- Static HTML + Netlify CDN replacing PHP + cPanel
- Contact form migrated to Netlify Function (Node.js 20) + Resend API
- GitHub Actions CI/CD replacing manual FTP deploy
- `ajax.php` retired; PHP dependency eliminated
- E2E static server updated for new function routes
- Baselines captured: Desktop 84/94/96/92, Mobile 61/94/96/92
- ADR-003 (Netlify), ADR-004 (Resend), ADR-005 (CSS non-blocking) documented

---

### Phase 5.1 — Performance + A11y Sprint #1 ✅
*Completed 2026-03-03*

Key outcomes:
1. Blog section: Lorem Ipsum cards removed; "Coming soon" placeholder; original card structure saved as template
2. `<main>` landmark: `div.port_sec_warapper` → `<main>` (a11y hardening)
3. Fonts: Google Fonts `@import` eliminated from `font.css`; Roboto loaded via non-blocking `rel="preload"` + `rel="preconnect"` (eliminates 2-step render-blocking chain)
4. `animate.css`: converted to non-blocking preload (defers decorative CSS)
- All 29 E2E tests remain green

---

## Current Sprint — Documentation Sprint ✅
*2026-03-03*

Key outcomes:
- `AGENTS.md` (root): AI agent guidance
- `docs/AI_RULES.md`: extended rules for AI tools
- `docs/ARCHITECTURE.md`: full technical architecture
- `docs/PRD.md`: product requirements
- `docs/ROADMAP.md`: this file
- `docs/SECURITY.md`: security policy
- `docs/GLOSSARY.md`: project glossary
- `docs/BACKLOG.md`: moved + updated from root
- `README.md`: complete rewrite for Netlify stack
- `ENGINEERING-CHANGELOG.md`: updated with Phase 5 + 5.1 entries and ADRs

---

## Upcoming Phases

### Phase 5.2 — Performance + A11y Sprint #2 ✅
*Completed: 2026-03-03*

Delivered:

**#5 — Fix heading hierarchy** (a11y, SEO)
- Replaced section eyebrow headings `h2.port_sub_heading` with `p.port_sub_heading`
- Replaced section titles `h1.port_heading*` with `h2.port_heading*`
- Applied in home templates and generated project pages; added a `tests/quality-guards.sh` regression check to fail the build if this hierarchy regresses

**#6 — Color contrast WCAG AA**
- Introduced text-safe accent tokens for yellow, pink, orange, and cyan while preserving vivid decorative accent colors
- Rewired text/icon surfaces (sidebar icons + tooltips, about headline, timeline accents, reusable accent utility classes) to use the darker text-safe palette
- Hardened project spotlight CTAs so white button text now meets AA contrast against its background
- Re-activated `color-contrast` as a blocking Playwright axe rule in `tests/e2e/a11y.spec.js`
- Updated Playwright visual baselines where the intentional palette change affected snapshots

---

### Phase 5.3 — Performance Sprint #3 ✅
*Completed: 2026-03-03*

Delivered:

**#7 — CSS/JS minification**
- `scripts/build-pages.mjs` now generates deterministic `.min` derivatives from the readable CSS/JS source files and verifies them in `--check`
- Generated pages now serve `.min` CSS/JS bundles by default; `assets/js/custom.js` lazy-load paths were switched to `.min` variants where local generated equivalents exist
- `tests/quality-guards.sh` now fails if generated HTML or lazy-load paths regress to legacy unminified references
- Measured impact on the current Home budget: CSS `410.3 KB → 359.3 KB`, JS `144.4 KB → 127.2 KB`

---

### Phase 5.4 — Performance Sprint #4 ✅
*Completed: 2026-03-03*

Delivered:

**#8 — WebP/AVIF for remaining images**
- Media conversion and coverage scripts now target all generated root HTML pages by default (`index`, `blog`, `cv-print`, `project-*`)
- Standard `npm run media:avif` / `npm run media:webp` workflow now regenerates assets and then rebuilds pages, avoiding post-build drift against template sources
- Closed the remaining media gaps detected outside Home/Blog:
  - restored missing AVIF `<source>` entries in the LFi project dossier testimonial blocks
  - added the missing WebP derivative for `marcelo-ricigliano.jpg` (manual lower-quality encode because the default WebP settings did not beat the original size)
- Quality guard result after closing the sprint: `AVIF checked=43`, `WebP checked=53`, `skipped_missing_asset=0`

---

### Phase 5.5 — Measurement + Launch Verification ✅
*Completed: 2026-03-03*

Delivered:

**#9 — Re-capture PageSpeed + compare against baseline**
- Desktop PageSpeed result: `93 / 95 / 96 / 92`
- Mobile PageSpeed result: `62 / 95 / 92 / 92`
- Mobile bottleneck is now clearly isolated to paint timing (`FCP 4.7s`, `LCP 7.6s`), not script blocking (`TBT 0ms`) or layout instability (`CLS 0.004`)
- Result: desktop is already in release-safe territory; mobile still has LCP headroom if the target remains `>= 95`

**Production flow verification**
- Real contact-form submission validated end to end in production
- Inbox delivery confirmed through Resend (`FROM_EMAIL` / `TO_EMAIL` on Netlify now explicit)
- GA4 Realtime confirms `page_view`, `contact_submit_attempt`, and `contact_submit_success`
- Invisible Turnstile UX validated live after the layout-shift hotfix

---

### Phase 5.6 — Manual QA + Launch Hardening
*Estimated: next session*

Priority items:

- Manual QA checklists prepared in `docs/QA-DESKTOP.md` and `docs/QA-MOBILE.md`
- Prepare and run the manual QA checklist on desktop
- Prepare and run the manual QA checklist on mobile
- Resolve any regressions found before Search Console / Bing onboarding

---

### Phase 6 — CSP Enforce Mode
*Estimated: after Phase 5.6*

- Promote CSP from `Content-Security-Policy-Report-Only` to `Content-Security-Policy`
- Requires: audit of all inline scripts + styles, verify no legitimate violations in report
- Gate: zero CSP violations in report-only mode for 2 weeks before enforcing

---

### Phase 7 — Content & Narrative (Epic F)
*Estimated: 1–2 sprints*

Priority items:
- **Hero rewrite:** Problem → solution → result structure for headline
- **Project curation:** Final launch set expands to 8 active dossiers (DebTracker, GymTracker, LFi, The Route / 2x2MKT, Portfolio, MyBoard, Elm St, AGLAYA) with stronger outcome-driven narratives
- **Slug normalization:** Replace legacy public slugs with recognizable URLs and preserve old links through redirects
- **LFi redesign:** LFi is now rebuilt with a modern visual system and the obsolete newspaper-only assets have been retired from the live stack
- **Blog section:** Decide: real posts, remove section, or keep "Coming soon" indefinitely
- **Translation audit:** Every EN string must have an ES equivalent; no untranslated fragments
- **SEO metadata:** Unique title + description + OG tags per page

Acceptance criteria: Portfolio communicates seniority and expertise in < 60 seconds for any target audience.

---

### Phase 8 — Launch & Search Visibility
*Estimated: after Phase 7*

- [ ] Google Search Console verification
- [ ] Bing Webmaster Tools verification
- [ ] Sitemap submission (`sitemap.xml`)
- [x] PageSpeed Insights re-capture and comparison vs baseline
- [x] Turnstile real-flow validation in production
- [ ] Release tag `v2.0.0`
- [ ] QA manual on Desktop and Mobile

---

### Phase 9 — Observability (Epic G)
*Post-MVP, not blocking*

- Error tracking (Sentry or similar)
- Analytics events (CTA clicks, contact form, language switch)
- Core Web Vitals monitoring dashboard
- Release checklist and post-release runbook

---

## Roadmap Summary (Gantt-like)

```
Phase 0-4   ████████████████ DONE (Jan–Feb 2026)
Phase 5     ████████████████ DONE (Mar 2026-03-02)
Phase 5.1   ████████████████ DONE (Mar 2026-03-03)
Doc Sprint  ████████████████ DONE (Mar 2026-03-03)
Phase 5.2   ████████████████ DONE (Mar 2026-03-03)

Phase 5.3   ████████████████ DONE (Mar 2026-03-03)
Phase 5.4   ████████████████ DONE (Mar 2026-03-03)
Phase 5.5   ████████████████ DONE (Mar 2026-03-03)
Phase 5.6   ░░░░░░░░         Next session (manual QA)
Phase 6     ░░░░░░░░         After 5.6 (CSP enforce)
Phase 7     ░░░░░░░░░░░░     Content sprint (1–2 sessions)
Phase 8     ░░░░░░░░         Launch (after content)
Phase 9     ░░░░░░░░░░░░░░░░ Post-MVP (observability)
```

---

## Decision Log

| Date | Decision | Rationale |
|---|---|---|
| 2026-03 | Netlify over cPanel | Atomic deploys, CI/CD, serverless functions, no PHP dependency |
| 2026-03 | Resend over SMTP | Reliability, deliverability, no credentials management |
| 2026-03 | Static-first over SSR | Performance, simplicity, Netlify CDN optimization |
| 2026-02 | Nunjucks-like partials over Astro | No framework migration risk; incremental componentization |
| 2026-02 | JSON content over Markdown | Simpler parsing; schema validation; no Markdown parser needed |
| 2026-02 | AVIF-primary image strategy | Best compression; WebP fallback covers remaining browsers |

---

*Last updated: 2026-03-03*
