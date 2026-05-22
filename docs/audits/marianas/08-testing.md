# 08 — Testing & CI Audit

**Date:** 2026-05-22
**Auditor:** Claude Opus 4.7 (1M context)
**Repo:** portfolio-ibaifernandez @ `1cabf77` (main)

---

## Executive summary

Testing posture is **above average for a personal portfolio** — Playwright E2E with retry, axe-core a11y integration, performance budget, AVIF/WebP coverage validators, link checker (internal + external + scheduled), quality-guards.sh smoke checks, custom Node test scripts. CI pipeline is single-stage (quality → build → E2E → deploy) with deploy gated on green.

**However:** this session's CI failure (5/29 tests broke from a single hero edit) revealed that tests are **tightly coupled to copy, image filenames, JSON keys, and screenshot pixels**. The current "happy path" coverage is solid; the regression cost of any editorial change is high.

Top 3 issues:
1. **P0 — Dossier pages have minimal E2E coverage.** `dossiers.spec.js` only verifies prev/next nav. `lfi.html`, `aglaya.html`, `elm-st.html`, `ruta-de-la-digitalizacion-y-2x2-mkt.html` (and `cv-print.html`) have NO contact form test, NO language toggle test, NO axe a11y test, NO keyboard test, NO visual baseline. A regression on these pages won't be caught.
2. **P1 — Tests are tightly coupled to copy details.** 17% of tests broke from a single editorial change (hero rebuild). Replace exact-string assertions with structural checks.
3. **P1 — Visual baselines have platform sensitivity.** `experience-section.png` has `maxDiffPixelRatio: 0.10` (10% tolerance) explicitly because of "Ubuntu and macOS rasterize fonts differently enough". Snapshots regenerated on macOS may diff on Ubuntu CI even without code changes.

---

## Findings by severity

### P0
- **Dossier pages essentially untested** beyond `dossiers.spec.js` (prev/next nav only) and `archived-dossiers.spec.js` (redirect verification). The 4 active dossier pages are 30-80 KB each, with their own headers, footers, contact CTAs, language toggles, and content. **None of:**
  - Language toggle works on dossier pages
  - Contact CTAs link correctly
  - Sidebar nav is keyboard accessible on dossier pages
  - Axe finds no violations
  - Visual baseline established

  **Impact:** a CSS rule that breaks the dossier hero (e.g. mobile sidebar collapse) would NOT fail CI. Manual QA only.

### P1
- **Test brittleness — patterns to refactor:**

  | Test file | Brittle assertion | Suggested replacement |
  |---|---|---|
  | `home.spec.js:14` | `toHaveTitle(/Ibai Fernández/i)` (just relaxed from `Portfolio` — good) | Keep this style. |
  | `home.spec.js:59-67` | Image regex `/ibai-fernandez-1x1-sidebar\.avif/` | Replace with: "first AVIF source in profile picture exists and ends in `.avif`". |
  | `home.spec.js:73` | `[translate="hero-eyebrow-1"]` (just changed from `systemic`) | Better: pick the FIRST element with a `translate` attribute and verify it changes. Decouple from specific key. |
  | `contact.spec.js:18` | `toContainText(/Please complete the required fields\./i)` | Brittle on EN copy. Either localize the test or assert the `role="alert"` exists. |
  | `contact.spec.js:37` | `toContainText(/Email should be valid\./i)` | Same. |
  | `contact.spec.js:48` | `toContainText(/Your message has been sent successfully\./i)` | Same. |
  | `home.spec.js:123-126` | Project titles hardcoded: `'LFi: Agency Operating Systems'`, `'The Route to Digitalization / 2x2MKT'`, etc. | Read from `content/projects.json` at test time. |
  | `home.spec.js:122-126` | Active dossier hrefs hardcoded. | Read from `content/projects.json`. |
  | `keyboard.spec.js:123-127` | Social link labels hardcoded `['Facebook', 'LinkedIn', 'WhatsApp', 'GitHub', 'Instagram']` | Read from sidebar component or content/social.json (doesn't exist). |
  | `visual.spec.js` | Pixel diffs | Already calibrated; acknowledge as brittle baseline. |

- **Visual baselines** (4 snapshots in `tests/e2e/visual.spec.js-snapshots/`):
  - `contact-section.png` (50 KB)
  - `experience-section.png` (207 KB)
  - `logos-section.png` (42 KB)
  - `projects-section.png` (482 KB)
  
  The `experience-section.png` has `maxDiffPixelRatio: 0.10` (10% tolerance) due to font rendering differences between platforms. This is high. Real changes can hide under 10% noise.

- **`tests/check-performance-budget.mjs`** runs only against `index.html` (per `performance-budget.config.json`). 4 dossier pages + cv-print.html have no budget.

- **`tests/check-links.mjs`** is robust (internal links + ID anchors + external option) but is run against the default file list (all root HTMLs). Verify externals are checked weekly via `link-health.yml` (which they are, lunes 09:00 UTC). ✓

- **`tests/check-target-blank.mjs`** scans all generated HTMLs for `target="_blank"` without `rel="noopener noreferrer"`. ✓ Solid.

- **Quality guards script (`tests/quality-guards.sh`)** scans only `index.html` for several checks (skip-link presence, contact-response, sidebar anchors, contact form anti-spam fields). Dossier pages bypass these checks.

- **CI workflow has NO concurrency cancellation.** A push to main while another build is in flight will run both to completion. Wastes minutes. Add:
  ```yaml
  concurrency:
    group: ci-${{ github.ref }}
    cancel-in-progress: true
  ```

- **CI workflow caches npm but does not cache Playwright browsers.** Each run downloads chromium (~150 MB). Adding `actions/cache@v4` for `~/.cache/ms-playwright` saves 30-60s per run.

### P2
- **No `npm audit` step** in CI. Dependabot configured? Unknown. Recommend adding non-blocking warn step.
- **`playwright.config.js`** sets `retries: 2` in CI — good, masks flakes. Also `workers: 1` — single-threaded. For 30+ tests, this means CI takes ~2-3 minutes. Acceptable for now.
- **`tests/smoke.sh`** is well-written but duplicates checks from quality-guards.sh (honeypot field, form_started_at, captcha fields, translate button). Either consolidate or document the intended difference.
- **`tests/check-avif-coverage.mjs`** has a "minBytes=50000" threshold below which AVIF is not required. Reasonable, but adjustable via CLI. The default may be wrong for small dossier images; verify.
- **`tests/check-webp-coverage.mjs`** has a `--require-asset` flag that's not set in default invocation. Currently it skips missing WebP files silently with a warning. Should `--require-asset` be the default? Verify intent.
- **`scripts/run-e2e-with-cleanup.sh`** suggests Playwright has had orphan-process issues. `scripts/playwright-orphans.sh` exists with `--list` and `--kill` modes. Indicates known flakiness. Document or root-cause.
- **No mutation testing or coverage report.** Possibly overkill for a portfolio, but adding `c8` for coverage of build scripts would be cheap.
- **`tests/e2e/a11y.spec.js`** runs axe on `.contact_section` and primary home sections. Does NOT include the new hero. The hero rebuild may have a11y issues axe would catch. **Add `.port_banner_wrapper` to the axe scope.**

### P3
- **`forbidOnly: !!process.env.CI`** ✓ Good — prevents accidental `.only` commits.
- **`screenshot: 'only-on-failure'` + `video: 'retain-on-failure'`** ✓ Standard.
- **`trace: 'on-first-retry'`** — saves disk but only useful on flaky tests. Could use `on` for all to get traces every time.
- **Reporter is `list + html`** — fine. HTML report goes to `playwright-report/`, uploaded as CI artifact.
- **No `prerequisite` deps between jobs.** CI is one job (quality-build-e2e). Could be split into `quality → build → e2e → deploy` with `needs:` for parallelism. Not needed at current speed (~3 min total).
- **Custom test scripts (Node)** in `tests/` are well-engineered, defensive, clear error messages. Good.

---

## Detailed analysis

### E2E spec inventory

```
tests/e2e/
├── a11y.spec.js              52 lines, 2 tests, axe-core on contact + home sections
├── archived-dossiers.spec.js 23 lines, 1 test, 6 retired routes → /#project_sec
├── contact.spec.js          68 lines, 4 tests, form validation + submission + function rate
├── dossiers.spec.js         30 lines, 1 test, prev/next nav across 4 active dossiers
├── home.spec.js             234 lines, 15+ tests, home page comprehensive
├── keyboard.spec.js         129 lines, 4 tests, tab order + social labels
└── visual.spec.js           126 lines, 2 tests, contact + experience/projects/logos snapshots
```

**Total: ~692 lines, ~29 tests.**

**Coverage map:**

| Surface | Spec | Test count | Coverage depth |
|---|---|---|---|
| Home (`index.html`) | home.spec, contact.spec, a11y.spec, keyboard.spec, visual.spec | ~25 | Deep — title, banner, translate, picture sources, language toggle, sidebar nav, skip link, projects grid, contact form, anti-spam, external links, redirects, mobile layout, axe a11y, keyboard tab, visual diffs |
| Dossier pages (4 active) | dossiers.spec | 1 | Shallow — only prev/next nav |
| Archived dossier routes | archived-dossiers.spec | 1 | Confirms 308 redirect |
| CV-print page | (none) | 0 | None |
| Contact function (`/.netlify/functions/contact`) | contact.spec | 1 | Posts via `request` (not browser) — verifies anti-spam too-fast rejection |

**Gap analysis:**
- Dossier pages: missing contact CTA, language toggle, axe, keyboard, visual.
- CV-print: no tests at all.
- Lfi-legacy: no tests (intentional? it's an archived/private page).
- Mobile-specific assertions: minimal. Tests run in chromium desktop by default.
- Cross-language: only one test toggles to ES and back; no full ES-mode test.
- 404 / not-found behavior: untested.

### Quality guards (`tests/quality-guards.sh`)

168 lines of bash + ripgrep checks. Already audited in 02-security.md for security relevance. Quality angle:
- ✓ Blocks regressions on patterns that have already caused incidents (banner-bg.gif removal, bootstrap.min.js removal, eval(), invalid hrefs)
- ✓ Asserts security headers in netlify.toml
- ✓ Asserts anti-spam in HTML and JS
- ✓ Asserts accessibility baselines (skip-link, aria-live, focus-visible, prefers-reduced-motion)
- ✓ Asserts img tags have loading/width/height (verified per loop on `index.html` only)
- ✗ Img width/height check only runs on `index.html`. Dossier pages exempt.
- ✓ Runs `node scripts/build-pages.mjs --check` to catch generation drift.

### Performance budget (`tests/check-performance-budget.mjs`)

Per `performance-budget.config.json`:
```json
{
  "global": {
    "maxCssFileBytes": 160000,
    "maxJsFileBytes":  135000,
    "maxImageFileBytes": 300000
  },
  "pages": [{
    "file": "index.html",
    "maxHtmlBytes": 285000,
    "maxCssBytes":   470000,
    "maxJsBytes":    500000,
    "maxImageBytes": 1800000,
    "maxImageCount": 70
  }]
}
```

- ✓ Smart picture-asset handling (counts only preferred AVIF/WebP, not double-counting fallback)
- ✓ Global max per-file budget catches a single file ballooning
- ✗ Only `index.html` gated. **Add lfi/aglaya/elm-st/ruta + cv-print.html entries.**

**Current `style.min.css` is 146 KB → under the 160 KB global max.** Slim margin. If hero CSS keeps growing, will break the budget. Add a separate check that style.min.css alone fits in ~120 KB target.

### Visual regression (`tests/e2e/visual.spec.js`)

```javascript
// contact-section.png: maxDiffPixelRatio: 0.02 (2% tolerance)
// experience-section.png: maxDiffPixelRatio: 0.10 (10%) — fonts rasterize differently across OS
// projects-section.png: 0.03 (default)
// logos-section.png: 0.03 (default)
```

- ✓ Snapshots clip to a fixed area to avoid full-page noise
- ✓ Animations disabled, caret hidden
- ✓ Wait for fonts, network idle, image load
- ✓ `freezeSwipers()` deterministic carousel state
- ⚠ 10% tolerance on experience section is high — could hide real regressions
- ⚠ Snapshots regenerated this session — confirm they were captured on the right environment (macOS local vs Ubuntu CI may diff)

### CI workflow (`.github/workflows/ci.yml`)

```yaml
jobs:
  quality-build-e2e:
    runs-on: ubuntu-latest
    steps:
      - Checkout
      - Setup Node 20 (cache: npm)
      - Install system deps (ripgrep)
      - npm ci
      - npm run build:pages
      - npm run test:quality
      - npx playwright install --with-deps chromium
      - npm run test:e2e
      - Upload Playwright report (always)
      - Upload test results (always)
      - Deploy to Netlify (if main && push)
      - Deploy preview (if PR)
```

**Strengths:**
- ✓ Single workflow, clear order: install → build → quality → e2e → deploy
- ✓ Deploy gated on `github.ref == 'refs/heads/main' && github.event_name == 'push'`
- ✓ PR builds get preview deploys
- ✓ Artifacts uploaded `if: always()` for debugging failed runs
- ✓ Netlify CLI invocation passes `--message` for traceability
- ✓ Secrets injected via env, not files

**Gaps:**
- ✗ No `concurrency: cancel-in-progress`
- ✗ No Playwright browser cache
- ✗ No `npm audit` step (security warn)
- ✗ No notification on failure (Slack, email, GitHub deploy status only)
- ✗ Lint/format step missing (no eslint, prettier)
- ✗ No matrix for multi-browser (chromium only — by design, but Firefox/WebKit would catch edge cases)

### Test data hygiene

- `contact.spec.js:42-49` sends a real-looking submission to the LOCAL mock function (`scripts/static-server.mjs:115-161`). NO Resend API call in tests. ✓ Safe.
- Production Resend API key never used in CI. ✓

### `playwright-report/` and `test-results/`

Both at repo root, both in `.gitignore`. ✓ Verified.

### Custom Node test scripts

| Script | Lines | Purpose | Quality |
|---|---|---|---|
| `check-performance-budget.mjs` | 266 | Asset weight per page | Excellent |
| `check-avif-coverage.mjs` | 213 | Every img >50KB has AVIF sibling | Excellent |
| `check-webp-coverage.mjs` | 167 | Same for WebP | Excellent |
| `check-target-blank.mjs` | 52 | rel=noopener noreferrer | Good |
| `check-links.mjs` | 304 | Internal + anchor + optional external | Excellent |
| `quality-guards.sh` | 168 | Catch-all rg-based smoke | Good |
| `smoke.sh` | 94 | HTTP server up + key markers | Good |

All scripts emit `[OK]` / `[FAIL]` prefixes, exit non-zero on failure. CI-friendly.

### Pre-commit hooks

None present (`ls -la .git/hooks` shows defaults from Git template). All gating is CI-side. Locally, a developer can commit broken code; CI catches it. **Recommendation:** add a lightweight pre-commit (e.g. `husky` + `lint-staged` or just `scripts/pre-commit.sh`) that runs `npm run build:pages --check` and `npm run test:quality`.

### Mock vs production drift

`scripts/static-server.mjs:115-161` mocks `/.netlify/functions/contact` to match production behavior (honeypot, timing, captcha). If `netlify/functions/contact.js` evolves, the mock must be updated by hand. Already flagged in Architecture audit (P1).

The test `contact.spec.js:51-67` posts directly to the function URL and verifies the timing rejection ('0' response for `form_started_at: Date.now()`). This tests the mock's timing logic, not the real production function. **Recommendation:** add an integration test that runs against `netlify dev` or a deployed preview branch.

---

## Recommendations (prioritized)

1. **Add dossier page tests.** At minimum, for each of `lfi.html`, `aglaya.html`, `elm-st.html`, `ruta-de-la-digitalizacion-y-2x2-mkt.html`:
   - Renders without errors (status 200, title present, h1 present)
   - Language toggle works
   - Sidebar nav links resolve
   - Axe finds no critical/serious violations
   - Visual baseline established
   
   Even a parametrized loop in a single new spec file would cover this.

2. **Refactor brittle tests** to assert structure, not copy.
   - Read project titles from `content/projects.json` at test time.
   - Replace exact copy regex with looser assertions or check the JSON.
   - Decouple from specific i18n keys; pick first available key with `[translate]` attribute.

3. **Extend `performance-budget.config.json`** to cover all 4 dossier pages + `cv-print.html`.

4. **Extend axe scope** in `a11y.spec.js` to include `.port_banner_wrapper` (hero).

5. **Add `concurrency: cancel-in-progress: true`** to ci.yml.

6. **Cache Playwright browsers** in CI:
   ```yaml
   - uses: actions/cache@v4
     with:
       path: ~/.cache/ms-playwright
       key: ${{ runner.os }}-playwright-${{ hashFiles('**/package-lock.json') }}
   ```

7. **Add `npm audit --audit-level=high`** as a non-blocking warn step.

8. **Add a pre-commit hook** for `build-pages --check` + `test:quality`.

9. **Tighten visual diff tolerance** where possible. Investigate why `experience-section.png` needs 10% — possibly disable Roboto for the snapshot to remove font rasterization noise.

10. **Add a basic CV-print smoke test** (renders, prints to PDF without error via `print:pdf`).

11. **Add multi-browser matrix** (firefox + webkit) — even just for the smoke test set — to catch browser-specific regressions.

---

*End of testing audit.*
