# Marianas Execution Log

**Started:** 2026-05-22 (this session)
**Source:** `docs/audits/marianas/00-executive-summary.md`
**Goal:** Close P0/P1 findings across all 8 dimensions; document each step; commit per batch.

---

## Status legend

- `[ ]` not started
- `[~]` in progress
- `[x]` done
- `[-]` skipped (with reason)

---

## Batch 1 — Quick brand/compliance fixes (NON-BREAKING) ✅

- `[x]` Fix JSON-LD image in `index.html:68` (`ibai-fernandez-1.jpg` → `ibai-fernandez-1x1-sidebar.jpeg`)
- `[x]` Fix same in `scripts/build/renderers.mjs:43` (dossier structured data)
- `[x]` Update `cv-print.template.html:29` subtitle to Narrative B ("AI Product Engineer · Founder-Operator")
- `[x]` Delete `.cpanel.yml`
- `[x]` Delete `.htaccess`
- `[x]` Delete `config/secrets.example.php` (config/ dir now empty/removed)
- `[x]` Add `Strict-Transport-Security` + `interest-cohort=(), payment=(), usb=()` to Permissions-Policy
- `[x]` Add `hreflang` (en, es, x-default) in `<head>` of index + 4 dossier templates (LFi already had it)
- `[x]` Add 2 missing i18n keys: `contactar`, `read-more` (en + es)
- `[x]` Delete 4 orphan typo i18n keys: `bulding-a-flexible` (en), `building-a-flexible` (es), `significantly-enhanced` (en), `significatnly-enhanced` (es)
- `[x]` Delete 3 orphan comment markers: `__comment` (en), `_____comment1`, `_____comment2` (es)
- `[x]` `.gitignore` `docs/error-logs/` + `git rm -r --cached docs/error-logs/`
- `[x]` Build OK; quality guards OK; 29/29 e2e passed

## Batch 2 — Discovery surface regeneration ✅

- `[x]` Rewrite `llms.txt` with Narrative B + active dossier set (5 URLs only)
- `[x]` Rewrite `llms-full.txt` with Narrative B Currently Shipping rotation + active dossier blurbs
- `[x]` Regenerate `sitemap.xml` (5 active URLs, hreflang alternates per URL)
- `[x]` Write `scripts/build/sitemap.mjs` — generates all 3 discovery files from `content/projects.json`
- `[x]` Wire into `build-pages.mjs` with `--check` mode parity
- `[x]` Archive `brand-audit-march-2026.md` → `docs/brand-and-strategy/.archived/brand-audit-march-2026-NARRATIVE-A-DEPRECATED.md`
- `[x]` Write `docs/brand-and-strategy/brand-audit-narrative-b-2026-05.md`
- `[x]` Rewrite `docs/ROADMAP.md` to reflect actual current state (hero shipped, Marianas in flight, 4 active dossiers)
- `[x]` Build + quality green

## Batch 3 — CSP enforce + privacy posture

- `[ ]` Nonce all inline scripts in templates (3 in index.html)
- `[ ]` Move `PORTFOLIO_RUNTIME` to external file `assets/js/runtime-config.js`
- `[ ]` Promote CSP from `Content-Security-Policy-Report-Only` to `Content-Security-Policy`
- `[ ]` Tighten `img-src` from `https:` to `'self' data:`
- `[ ]` Create `/privacy.html` page
- `[ ]` Create cookie consent banner component
- `[ ]` Wire consent flag to `window.PORTFOLIO_RUNTIME.analytics.enabled`
- `[ ]` Default GA4 off until consent
- `[ ]` Add link to /privacy from footer
- `[ ]` Build, test, commit, push

## Batch 4 — i18n hygiene

- `[ ]` Translate `<title>` per language
- `[ ]` Translate `<meta name="description">` per language
- `[ ]` Translate OG description per language
- `[ ]` Respect `navigator.language` in `translate.js` initial resolution
- `[ ]` Purge 198 orphan i18n keys (programmatic + manual review)
- `[ ]` Add `tests/check-i18n.mjs` — parity, missing, orphan checks
- `[ ]` Add `test:i18n` to package.json + `test:quality` chain
- `[ ]` Build, test, commit, push

## Batch 5 — Tests refactor + dossier coverage

- `[ ]` Add `tests/e2e/dossier-pages.spec.js` — parametrized over 4 active dossiers
  - Render OK, title, h1, sidebar nav, language toggle, contact CTA, axe
- `[ ]` Refactor `home.spec.js` brittle assertions to read from `content/projects.json`
- `[ ]` Refactor `keyboard.spec.js` social labels to derive from sidebar component
- `[ ]` Extend `tests/performance-budget.config.json` to cover all 4 dossiers + cv-print
- `[ ]` Add `concurrency` + Playwright browser cache + npm audit to `ci.yml`
- `[ ]` Add pre-commit hook (`scripts/pre-commit.sh` + .git/hooks/pre-commit)
- `[ ]` Build, test, commit, push

## Batch 6 — Performance pass

- `[ ]` Replace custom minifier with `terser` + `csso`
- `[ ]` Add content-hash fingerprinting to asset URLs
- `[ ]` Preload LCP image (`ibai-fernandez-1x1-sidebar.avif`)
- `[ ]` Generate smaller (160×160) sidebar profile picture variant
- `[ ]` Inline critical above-fold CSS (~10 KB)
- `[ ]` Drop Font Awesome; inline SVG for ~12-15 icons used
- `[ ]` Defer GA4 to `requestIdleCallback`
- `[ ]` Build, test, commit, push

---

## Notes / decisions made along the way

(Will be appended as execution progresses.)

---
