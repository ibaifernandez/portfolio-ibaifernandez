# 01 — Architecture & Build System Audit

**Date:** 2026-05-22
**Auditor:** Claude Opus 4.7 (1M context)
**Repo:** portfolio-ibaifernandez @ `1cabf77` (main)

---

## Executive summary

Build pipeline is **well-engineered for a portfolio**. Custom Node.js renderer (`scripts/build-pages.mjs` + `scripts/build/*.mjs`) is clean, deterministic, content-driven, with caching, cycle detection, and contract validation. **However**, the same pipeline has a hidden cost: it generates 18 HTML outputs from a single content source set, every build cycle re-minifies 16 CSS/JS files, and the design assumes one global namespace for everything (CSS, JS, i18n).

Top 3 issues:
1. **P0 — Generated artefacts committed AND served**. CSS/JS/HTML are both source-of-truth (re-derivable) AND production. Drift detection exists (`build:pages --check`) but nothing prevents an editor from manually patching `index.html`. Cache-busting just done by hand on the templates (`?v=20260522`) — there is no automated fingerprinting.
2. **P1 — Custom minifier is naïve**. `scripts/build/assets.mjs` does regex-based minification with line-by-line strip. It removes blank lines and strips block comments, but does not handle CSS strings containing `{`, JS template literals, or sourcemap directives. It produces 26 % size reduction on `style.css` (195 KB → 146 KB) when terser/esbuild would yield 60-70 %.
3. **P1 — `.cpanel.yml` still committed**. The repo migrated from cPanel to Netlify (per `README.md`, `docs/ARCHITECTURE.md`, `docs/SECURITY.md`), but the legacy cPanel deploy file is still active in `.cpanel.yml`. Anyone running cPanel deploy automation would push a broken artifact (it copies `blog.html`, `project-*.html`, `ajax.php` — none of which exist anymore).

---

## Findings by severity

### P0
- **Generated HTML lives at repo root, mixed with source.** `index.html`, `lfi.html`, `elm-st.html`, `aglaya.html`, `ruta-de-la-digitalizacion-y-2x2-mkt.html`, `lfi-legacy.html`, `cv-print.html` are all committed and all generated. Quality guard runs `build-pages.mjs --check` which detects drift, but the gate fires only in CI, not at edit time. No pre-commit hook. **Impact:** an inexperienced contributor (or any future AI agent that doesn't read AGENTS.md) can edit the generated file, push, and the change survives if templates are also edited consistently. Confusion guaranteed.
- **`.cpanel.yml` references files that no longer exist** (`blog.html`, `project-*.html`, `ajax.php`). If the cPanel auto-deploy hook fires (e.g. user accidentally pushes to a configured cPanel branch), it will silently fail or deploy a broken state. The file should be deleted or moved out of repo root.

### P1
- **No fingerprinting strategy.** Just-committed `?v=20260522` cache-bust on `style.min.css` and `custom.min.js` is manual. Next CSS change without a version bump = stale cache for 7 days for users on the previous deploy. A build-time content hash (e.g. `style.min.css?v=<hash>`) would be 10 lines in `scripts/build/renderers.mjs`.
- **Custom minifier is fragile.** `minifyCss()` does `.replace(/\s+/g, ' ').replace(/\s*([{}:;])\s*/g, '$1')`. It will mangle CSS like `content: "{ }"` (it strips inside strings) and unicode-range string literals. Same risk in `minifyJs()` — line-by-line strip breaks multi-line template literals.
- **No asset budget for dossier pages.** `tests/performance-budget.config.json` lists ONLY `index.html`. `lfi.html` is 83 KB of HTML, `cv-print.html` 55 KB, `aglaya.html` 43 KB. None gated.
- **Static server and Netlify redirect rules are duplicated**. `scripts/static-server.mjs` (lines 175-208) and `netlify.toml` (lines 30-180) both hard-code the same legacy redirect list. Adding/removing a redirect requires editing two places. Should derive from a single source (`content/redirects.json`?).
- **`assets/css/dossiers/` not in build pipeline.** Directory exists, presumably has dossier-specific CSS, but `scripts/build/config.mjs` `generatedAssetEntries` does not include it. Either dead code, manually maintained, or relied on at runtime without minification.
- **Build doesn't validate output sizes regress.** No build-time check that style.min.css didn't grow 10 % between commits.

### P2
- **Worktree directory `.claude/worktrees/funny-dhawan-43bcd3/` is gitignored** but live in `/Users/AGLAYA/Local Sites/26-04-portfolio-if/.claude/worktrees/`. Multi-worktree development means **state can diverge silently**. Cleanup discipline matters.
- **`.netlifyignore` excludes `tests/` and `playwright.config.js`** — good, but doesn't exclude `docs/` consistently with reality. `docs/error-logs/logs_70308243004/` (just committed by accident in `1cabf77`) is now in the deployable artifact (the `.netlifyignore` does exclude `docs/` actually — so this is fine for prod but the repo bloats).
- **`config/secrets.example.php`** is a vestige from PHP era. Keep as docs reference OR delete.
- **`node_modules/` = 35 MB** but only 3 declared deps. Transitive react/react-dom/scheduler/prettier from `resend` → `@react-email/render`. Acceptable for serverless function but a sign of dependency creep that wasn't questioned.
- **No formatter / linter / type-checker.** No `prettier`, `eslint`, `stylelint`, `tsc` config. Quality guards do regex-based smoke checks only. Style drift over time is inevitable.
- **Build doesn't write a manifest.** No `build-manifest.json` indicating which files were generated, when, from what source. Hard to debug "why is this stale?" without one.

### P3
- **Inconsistent indentation in build modules.** Mix of 2-space and tab. Cosmetic.
- **Templates use `<!-- @include -->` and `<!-- @render -->` directives**: clear naming, but neither is documented in `docs/ARCHITECTURE.md` beyond a one-line table. A worked example showing how `@render projects-grid` maps to `renderers.mjs` would help.
- **`legacyPageEntries` for lfi-legacy.html lives in `config.mjs`**: that's the only place inline `data: {...}` is defined for a page. Inconsistent — every other page derives data from `content/*.json`. Migrate to `content/legacy-pages.json` for symmetry.

---

## Detailed analysis

### Build pipeline (`scripts/build-pages.mjs` + `scripts/build/*.mjs`)

The build is a small but real framework. Key components:

- **`build-pages.mjs`** (99 lines): orchestrator. For each page entry, calls `renderWithIncludes()`, writes output, or in `--check` mode diffs against existing. Also handles retiring pages (`getManagedProjectOutputs()` cross-checked against `expectedPageOutputs`). **Good.**
- **`build/context.mjs`** (85 lines): caches JSON reads and component reads. Cycle-detects via stack. Three substitution passes: includes, renders, template variables. **Solid.**
- **`build/renderers.mjs`** (480 lines): all the render functions for `@render` directives. Most are content-driven (read from `content/*.json` and apply a template). Uses `assertRequired()` for contract validation — content errors fail the build with a labeled message. **Excellent.**
- **`build/template-utils.mjs`**: `{{var}}` (HTML-escaped) and `{{{var}}}` (raw) substitution, plus `buildAttr()` for conditional attributes. **Good and minimal.**
- **`build/assets.mjs`**: CSS/JS minifier. **Weakest link — see P1 above.**
- **`build/config.mjs`**: page entries + asset entries + share image map. Hard-coded paths. Lives close to the renderer.

**Strength:** The system enforces strict content contracts via `assertRequired`. Missing a `title.text` in `content/projects.json` will fail the build with `Invalid content data: missing projects[0].title.text`. Catches drift early.

**Weakness:** Build is fully synchronous. For 18 outputs + 16 minified assets, on a cold run it takes seconds but is single-threaded. Not a problem now, would be a problem at 100+ pages.

### Template system

```
src/pages/*.template.html       (17 files; 4 active dossiers + 9 archived templates + index + cv-print + lfi-legacy + project base)
src/components/index/           (15 partials for index page sections)
src/components/project/         (2 partials for project pages)
src/components/shared/          (2: analytics-ga4, translate-button)
src/components/index/experience-cards/  (subdirectory of cards)
```

**Problem:** 9 archived dossier templates (`project-debtracker.template.html`, `project-gymtracker.template.html`, etc.) are still in `src/pages/`. They generate nothing (the projects are not in `content/projects.json`), but they're maintained as "thread prompts" exist for them under `docs/THREAD-PROMPTS/`. **Question:** are these meant to be re-activated? If not, archive them.

**Strength:** Component partials are well-named, single-purpose. `experience-cards/` has one file per career role. Easy to find and edit.

### Asset pipeline

**Generated assets** (from `config.mjs`):
```
font.css → font.min.css           19 KB → 16 KB (15.7 % reduction)
animate.css → animate.min.css     61 KB → 48 KB (21.3 % reduction)
style.css → style.min.css        195 KB → 146 KB (25.1 % reduction)
print.css → print.min.css          6.7 KB → 6.1 KB
cv-print.css → cv-print.min.css    2.4 KB → 2.0 KB
scrollbar.css → scrollbar.min.css 42 KB → 42 KB (negligible! comments only)
+ JS counterparts
```

**The minifier is leaving 35-60 % on the table.** A real minifier (csso/cssnano for CSS, terser for JS) would cut `style.min.css` from 146 KB to ~85 KB. That's 60 KB shaved off every page load.

**Vendor bundles NOT processed**:
- `bootstrap.min.css` (155 KB — vendor)
- `all.min.css` (54 KB — fontawesome, vendor)
- `swiper.min.css` (19 KB — vendor)
- `swiper.min.js` (128 KB — vendor)
- `jquery.min.js` (89 KB — vendor)
- `isotope.pkgd.min.js` (35 KB — vendor)
- `jquery-jvectormap-world-mill.min.js` (104 KB — vendor, but `min.js` is 104 263 bytes vs `js` 104 262 — the "min" is +1 byte. Minifier produced a larger output. Bug.)

### Static server (`scripts/static-server.mjs`)

250 lines. Implements:
- Static file serving with MIME detection
- All legacy redirects (DUPLICATE of netlify.toml — see P1)
- A mock for `/.netlify/functions/contact` that replicates honeypot + timing + captcha checks
- Path traversal prevention (line 225: `if (!fullPath.startsWith(root))`)

**Strength:** Mock contact endpoint allows full E2E test of the form without needing `netlify dev`. Tests are not coupled to Netlify CLI being installed.

**Weakness:** the mock keeps in sync with the real function only by discipline. If `contact.js` adds a new validation (e.g. min message length 10), the mock won't catch it. **Recommendation:** extract shared validation logic to `netlify/functions/_lib/validate.mjs` and import in both. Or add an integration test that POSTs the same payloads to both.

### Worktree / git strategy

`.claude/worktrees/funny-dhawan-43bcd3/` is the active edit surface. Main repo is at `/Users/AGLAYA/Local Sites/26-04-portfolio-if/` and tracks `origin/main`. The worktree branch (`claude/funny-dhawan-43bcd3`) is pushed via `git push origin HEAD:main`. This works but **is unusual** — most teams branch and PR.

**Risk:** worktree state can drift from main if not kept in sync. Multiple worktrees can have conflicting WIP. Today's session demonstrated this: the main directory was at `80925f9` while the worktree had `3417b52` queued.

**Recommendation:** Either (a) use a single working tree and rely on git branches normally, or (b) document the worktree workflow clearly in `AGENTS.md` so future agents understand the dual-tree mechanic.

### `.gitignore` / `.netlifyignore` / `.htaccess` / `.cpanel.yml`

| File | State | Issue |
|---|---|---|
| `.gitignore` | OK | Covers `.DS_Store`, `node_modules`, `playwright-report`, `test-results`, `.claude/`, etc. **Missing:** `docs/error-logs/` (just committed by accident). **Missing:** `.netlify/` is listed; verify Netlify CLI doesn't leak. |
| `.netlifyignore` | OK | Excludes `src/`, `scripts/`, `content/`, `tests/`, `docs/`, `config/`, `package-lock.json`. **Verify:** does it also exclude `documentacion-profesional-if/` (private)? Currently no — those files would deploy. |
| `.htaccess` | **STALE** | Configured for cPanel/Apache. References `ajax.php`. Netlify ignores `.htaccess` entirely — it's noise. Move to `docs/cpanel-legacy/.htaccess` or delete. |
| `.cpanel.yml` | **STALE** | Same. References dead files. Delete. |

---

## Recommendations (prioritized)

1. **Add a pre-commit hook** that runs `npm run build:pages --check` to block commits with drift. Use `husky` or just a `.git/hooks/pre-commit` script.
2. **Delete or archive cPanel artifacts.** `.cpanel.yml` → delete. `.htaccess` → move to `docs/cpanel-legacy/`. Update `README.md` to remove cPanel mention.
3. **Replace custom minifier with terser + csso.** ~20 lines of code change, ~60 KB savings per page. High impact, low effort.
4. **Add content-hash fingerprinting** to `scripts/build/renderers.mjs`. Output URL becomes `assets/css/style.min.css?v=<sha256-12>`. Automated cache-busting forever.
5. **Extend performance budget** to cover all 4 dossier pages + cv-print.html. The budget config schema supports it; just add entries.
6. **Audit `src/pages/` for retired templates.** 9 templates exist for archived projects. Move to `src/pages/.archived/` to make signal vs noise obvious.
7. **Document worktree workflow** in `AGENTS.md` or kill it (use plain branches).
8. **Single source of truth for legacy redirects.** Move to `content/redirects.json`, generate both `netlify.toml` and `static-server.mjs` from it during build.

---

*End of architecture audit.*
