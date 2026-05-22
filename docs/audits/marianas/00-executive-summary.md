# Marianas Audit — Executive Summary

**Date:** 2026-05-22
**Auditor:** Claude Opus 4.7 (1M context)
**Repo:** portfolio-ibaifernandez @ `1cabf77` (main)
**Live:** https://portfolio.ibaifernandez.com

---

## TL;DR

The portfolio is **well-engineered for a personal project**: real CI/CD, accessibility baselines, defense-in-depth on the contact form, AVIF/WebP coverage, performance budget, custom build pipeline with content contracts. The owner has invested real craft.

**But it has accumulated significant drift** between:
- The current narrative ("AI Product Engineer · Founder-Operator", locked this session) and the documentation/SEO surface (still describing "Full-Stack Automator & AI Orchestrator" or older positioning across `brand-audit`, `llms.txt`, `sitemap.xml`, JSON-LD `image` URL, cv-print subtitle).
- 4 active dossiers (LFi, Ruta, Elm St, AGLAYA) and the discovery surface still listing 9 (5 of them now redirect).
- The intent (RegTech compliance, GDPR-aware) and the practice (CSP Report-Only, no HSTS, no consent banner, GA4 setting cookies).
- The CSS structure ("Narrative B" surgical patches over a ThemeForest template with 3 generations of class naming and typos baked in).

**Severity distribution across 8 audit dimensions:**

| Dimension | P0 | P1 | P2 | P3 |
|---|---|---|---|---|
| 01 Architecture | 2 | 6 | 6 | 3 |
| 02 Security | 3 | 6 | 8 | 4 |
| 03 Performance | 2 | 6 | 8 | 3 |
| 04 Accessibility | 1 | 8 | 7 | 4 |
| 05 Code Quality | 0 | 4 | 9 | 5 |
| 06 Documentation | 4 | 5 | 9 | 5 |
| 07 i18n | 2 | 5 | 4 | 3 |
| 08 Testing | 1 | 7 | 7 | 5 |
| **TOTAL** | **15** | **47** | **58** | **32** |

---

## The 10 P0 Issues (must-fix before next major release)

| # | Dim | Issue | One-line fix |
|---|---|---|---|
| 1 | Arch | Generated HTML mixed with sources at repo root; no pre-commit guard | Add `pre-commit` running `build-pages --check` |
| 2 | Arch | `.cpanel.yml` references dead files; would deploy broken artifact | Delete `.cpanel.yml` and `.htaccess` |
| 3 | Sec | CSP frozen in Report-Only since March 2026 | Promote to enforce; nonce inline scripts |
| 4 | Sec | No HSTS header | Add `Strict-Transport-Security` in netlify.toml |
| 5 | Sec | JSON-LD `image` references non-existent `ibai-fernandez-1.jpg` | Update to `ibai-fernandez-1x1-sidebar.jpeg` |
| 6 | Perf | `style.min.css` 146 KB (real min would be ~85 KB) + vendor stack 700 KB | Replace custom minifier with terser/csso |
| 7 | Perf | No performance budget on dossier pages or cv-print.html | Extend `performance-budget.config.json` |
| 8 | A11y | Language toggle is `<img>` with JS-applied role/tabindex | Wrap in real `<button>` |
| 9 | Docs | `sitemap.xml` lists 5 retired dossiers as canonical | Regenerate from `content/projects.json` during build |
| 10 | Docs | `llms-full.txt` describes archived products (Next.js, Python/Flask) | Regenerate from current narrative; refresh per build |
| 11 | i18n | 2 translation keys missing from en.json (`contactar`, `read-more`) | Add the keys; add CI guard |
| 12 | Test | Dossier pages essentially untested (no a11y, lang, contact, visual) | Add parametrized dossier spec |

(12 listed; 15 total P0 items across audits — see individual files for completeness.)

---

## Cross-cutting themes

### 1. Narrative drift = brand inconsistency = compounded SEO confusion

The hero rebuild locked Narrative B ("AI Product Engineer · Founder-Operator"). The new copy is live in the hero, in `<title>`, in OG tags, in JSON-LD `jobTitle`. **But** the same page's JSON-LD `image` points to a file that no longer exists. `sitemap.xml`, `llms.txt`, `llms-full.txt`, `brand-audit-march-2026.md`, and `cv-print.html` all describe a DIFFERENT positioning. AI crawlers and search engines see 6 distinct identities. The portfolio's job-hunt effectiveness is gated on these matching.

**Fix priority: HIGH** — touches `index.html`, `scripts/build/renderers.mjs:43`, `sitemap.xml`, `llms.txt`, `llms-full.txt`, `brand-audit-march-2026.md`, `cv-print.template.html:29`, `docs/ROADMAP.md`.

### 2. Compliance posture contradicts compliance positioning

The site markets RegTech expertise ("Scanner 21.179 — Chile data privacy regulation") yet:
- Sets GA4 cookies without consent.
- Has no privacy policy or cookie banner.
- Has CSP in Report-Only (so XSS protections are documentation only).
- Has no HSTS header.
- Has no server-side rate limit on the contact function.

Any visitor doing due diligence (e.g. a hiring manager evaluating the RegTech claim) finds the gap. Fixable in a focused 1-day pass.

### 3. Coupling between editorial content and tests / SEO / docs

A hero copy edit broke 17% of tests in this session. The same edit invalidated several i18n keys, made the image filename change, made the page title change, made the visual snapshot change. Each is a regression caught in CI. **However**, the same edit silently invalidated `sitemap.xml`, `llms.txt`, `brand-audit-march-2026.md`, `cv-print.html` subtitle — NONE of these have CI guards.

**Pattern:** every editorial change should propagate to (a) the hero, (b) docs, (c) discovery surfaces, (d) JSON-LD. Build a single content-driven flow.

### 4. Vendor / legacy weight on every page

700 KB+ of vendor CSS/JS (Bootstrap 4, jQuery, Swiper, Isotope, Magnific Popup, Circle Progress, jVectorMap, etc.) loads on every page. Most of it is used by ONE feature (testimonials carousel, project filter, world map, popup gallery). Lazy-loading helps but the critical path is still heavy. Mobile LCP at 7.6s confirms the cost.

### 5. Test brittleness is design debt

29 tests, mostly green, but the assertions are tightly coupled to copy details. Hero edit → 5 tests break. The pattern is "test the structure, not the string". Once refactored, tests can survive narrative changes without manual updates.

---

## Recommended 30-day action plan

### Week 1 — Brand & compliance alignment (HIGH IMPACT, LOW EFFORT)

1. **Fix JSON-LD image** (`index.html:68` + `scripts/build/renderers.mjs:43`). 5 min.
2. **Regenerate `sitemap.xml`** from `content/projects.json` via a new `scripts/build/sitemap.mjs`. 2 hr.
3. **Rewrite `llms.txt` and `llms-full.txt`** with Narrative B product descriptions. 1 hr.
4. **Update `cv-print.template.html:29`** subtitle to match Narrative B. 10 min.
5. **Archive `brand-audit-march-2026.md`** → `docs/brand-and-strategy/.archived/`. Write Narrative B brand audit. 2 hr.
6. **Update `docs/ROADMAP.md`** to reflect actual state. 30 min.
7. **Add `Strict-Transport-Security`** header to `netlify.toml`. 5 min.
8. **Promote CSP to enforce.** Nonce 3 inline scripts. 2-3 hr.
9. **Add cookie consent banner** + privacy policy page. Half day if using existing library.

### Week 2 — Test coverage gap closure

10. **Add dossier page tests** (axe, language toggle, contact CTA, sidebar nav). 4 hr.
11. **Refactor brittle tests** (read from `content/projects.json`, not hardcoded). 3 hr.
12. **Extend performance budget** to all 4 dossier pages + cv-print. 30 min.
13. **Add CI concurrency cancel + Playwright browser cache + npm audit step.** 30 min.
14. **Add pre-commit hook** (`build-pages --check` + `test:quality`). 30 min.

### Week 3 — Build pipeline & performance

15. **Replace custom minifier with terser + csso**. ~60 KB savings on CSS+JS. 1 hr.
16. **Inline critical above-fold CSS** (~10 KB) in head. 2-3 hr.
17. **Preload LCP image** (`ibai-fernandez-1x1-sidebar.avif`). 5 min.
18. **Add content-hash fingerprinting** to asset URLs (replaces manual `?v=20260522`). 2-3 hr.
19. **Drop Font Awesome**, replace with inline SVG for the 12-15 icons used. 2 hr.
20. **Generate smaller sidebar profile picture** (160×160). 10 min via `scripts/generate-*-assets.mjs`.

### Week 4 — i18n hygiene + code quality

21. **Add the 2 missing keys** (`contactar`, `read-more`). 2 min.
22. **Fix the 3 typo divergences**. 10 min.
23. **Purge 198 orphan i18n keys** (review then delete). 2-3 hr.
24. **Add CI step `npm run test:i18n`** for parity + missing + orphans. 1 hr.
25. **Add hreflang annotations**. 5 min.
26. **Translate `<title>` and meta tags**. 30 min.
27. **Delete `.cpanel.yml`, `.htaccess`, `config/secrets.example.php`.** 1 min.

---

## What's NOT in scope (parked)

- Full CSS rewrite to modern naming (typo cleanup `bannner_leftpart` → `banner_leftpart`, `siderbar` → `sidebar`, `responsor` → `sponsor`, `setions` → `sections`). 1-2 week project; significant test/axe selector breakage to manage.
- Bootstrap 4 → 5 migration or full removal. Material refactor.
- jQuery removal. Major.
- Full rewrite of dossier templates (9 archived templates still present in `src/pages/`).
- Build-time pre-rendered EN/ES variants (vs runtime swap) — significant arch change.

These are real opportunities but exceed the value of incremental polish for a portfolio in active job-hunt mode. Tackle after the brand alignment + compliance + test coverage are settled.

---

## What's GENUINELY GOOD (preserve these)

- **`scripts/build/*.mjs`** pipeline — small, modular, content-contract-validated. Stewardable.
- **Defense-in-depth on contact form** — honeypot + timing + Turnstile + sanitization + HTML-escape. Solid.
- **Quality guards script** — many real regressions blocked by simple rg checks. Cheap and effective.
- **AVIF + WebP coverage with smart `<picture>` parsing** — catches real performance regressions.
- **`tests/check-links.mjs`** — internal + anchor + external link checker with scheduled run.
- **CI pipeline** — single workflow, deploy gated on green, secrets in env vars.
- **Accessibility investment** — skip link, focus-visible, prefers-reduced-motion, axe-core integration, keyboard tab tests, aria-labels on social icons. Above average.
- **i18n engine in `translate.js`** — localStorage persistence, URL param override, GA4 instrumentation, accessibility (html lang + button alt). Modern.

---

## Per-dimension reports

Detailed findings live in:
- `01-architecture.md` — build pipeline, template system, asset pipeline, redirect duplication
- `02-security.md` — CSP, headers, contact function, secrets, dependency posture, compliance gap
- `03-performance.md` — bundle weights, render path, font strategy, canvas cost, caching
- `04-accessibility.md` — WCAG 2.2 AA gaps, language toggle pattern, motion/contrast verification
- `05-code-quality.md` — class name typos, !important count, CSS sprawl, naming generations
- `06-documentation.md` — narrative drift across 6 surfaces, stale sitemap, retired thread prompts
- `07-i18n.md` — missing keys, typo divergences, orphan key bloat, runtime swap implications
- `08-testing.md` — dossier coverage gap, brittle assertions, CI workflow polish

Read top-to-bottom for the full picture; or jump to any individual file for depth.

---

*End of executive summary.*
