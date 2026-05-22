# 05 — Code Quality & Tech Debt Audit

**Date:** 2026-05-22
**Auditor:** Claude Opus 4.7 (1M context)
**Repo:** portfolio-ibaifernandez @ `1cabf77` (main)

---

## Executive summary

Code quality is **honest but uneven**. The Node build pipeline (under `scripts/build/`) is modern, modular, well-tested. The vendor jQuery layer is honest legacy. The CSS file is large but mostly intentional. **The major debt** isn't lurking bugs — it's:
1. A 195 KB hand-rolled `style.css` with class names from at least 3 naming generations (snake_case typos, kebab-case modern, BEM-ish dossier-specific) coexisting.
2. ~28% orphan i18n keys (198 of 704) in the translation dictionaries.
3. Inconsistent typos in class names (`bannner_leftpart` with 3 n's, `responsor` for "sponsor").
4. Vendor JS plugin proliferation: 8 distinct jQuery plugins that could be a single ~5 KB vanilla replacement.

Top 3 issues:
1. **P1 — Class name typos baked into structure.** `bannner_leftpart` (extra `n`), `siderbar_menuicon` (sidebar), `responsor` (sponsor), `port_education_setions` (sections), `port_about_setions`, `port_projects_setions01` (note `01` and `setions`). Renaming requires CSS + HTML + tests + e2e + a11y selectors update — high effort, but the technical debt of typo'd selectors compounds with every new file.
2. **P1 — 198 orphan i18n keys (28%).** Defined in `en.json`/`es.json` but never referenced anywhere. Dead weight on every page load (entire JSON downloaded).
3. **P2 — 21 `!important` declarations in `style.css`.** Specificity escape hatches accumulated. Some are necessary (overrides on Bootstrap), some are battle scars from late fixes (the hero rebuild had to override `max-height` on mobile with `!important`).

---

## Findings by severity

### P0
*(None identified.)*

### P1
- **Class name typos throughout the codebase**:
  - `bannner_leftpart` — should be `banner_leftpart` (3 n's instead of 2)
  - `siderbar_menuicon` — should be `sidebar_menuicon` (siderbar)
  - `responsor_slider` / `port_responsor_setions` — should be `sponsor` not `responsor` (responsor is not a word)
  - `port_*_setions` (multiple) — should be `sections` (missing `c`)
  - `port_projects_setions01` — has both `setions` typo AND a magic `01` suffix
  - `justify-content-betweeen` (in experience.json:4) — should be `between` (3 e's)

  These were inherited from the ThemeForest template (per the copyright header in `custom.js:1` — "ThemeForest"). Refactoring requires touching: 13 source templates, all 7 built HTMLs, `style.css`, all e2e specs, axe selectors. **High effort, but the alternative is teaching every future contributor to spell things wrong.**

- **198 orphan i18n keys** (`en.json` + `es.json`):
  - JSON keys total: 704
  - Used in templates + built HTML: 507 unique translate attributes
  - Orphan keys (defined but unused): 198 each (symmetric)
  - This represents ~22 KB of dead JSON per language, downloaded on every initial page load.
  - Sample orphans: `Welcome`, `about`, `as-a-front-end-developer`, `belen-recommendation`, `chinese-hsk-1`, `coaching-internatl-teams-and`, `el-oficio-de-escritor`, dozens of other archived dossier-specific keys.

- **Test brittleness from copy/markup coupling.** Recent hero rebuild broke 5 tests (17% of e2e suite) from:
  - Page title literal regex (`/Ibai Fernández - Portfolio/i`)
  - Exact image filename (`ibai-fernandez-1.avif`)
  - Specific translate key (`translate="systemic"`)
  - Anti-spam timing in form test
  - Visual snapshot pixel diff

  This pattern is endemic: many other tests have similar brittle assertions. Will break on the next narrative edit.

- **Mixed CSS naming conventions**:
  - snake_case with typos (legacy): `bannner_leftpart`, `port_banner_wrapper`
  - kebab-case modern: `hero-eyebrow`, `eyebrow-seg`, `cta_text_link` (this last one is snake)
  - BEM-ish in dossiers: `project_spotlight_project--media-first`, `project_case_navlink--prev`
  - Bootstrap: `col-md-12`, `row d-flex justify-content-center`

  Three generations of naming coexist. No documented convention.

- **`assets/css/style.css` at 8,225 lines** is too large to reason about without grep. No clear sectioning beyond comments. Recommend splitting into logical modules and concatenating during build.

### P2
- **21 `!important` declarations** in `style.css`. Sample:
  ```
  max-height: none !important;    (hero mobile, override legacy max-height)
  -webkit-box-shadow: none !important;
  margin-top: 0 !important;
  ```
  Most are mobile overrides of legacy template constraints. Real fix is purging the legacy rules.

- **1 `z-index: 9999`** declaration in `style.css`. Magic number for the overlay. OK but could use a token (`var(--z-overlay)`).

- **`port_projects_setions01`** — magic `01` suffix. Possibly to disambiguate from a "v2" that never materialized. Drop the `01`.

- **CSS specificity wars during hero rebuild.** Discovered in session: `.port_banner_wrapper h1 { font-family: 'Josefin Sans' }` (line 759 area) and `.bannner_leftpart .banner_name { font-family: var(--font-family-base) }` (line 5141 area) competed. The latter was changed to `'Josefin Sans'` to match. **More such conflicts likely exist** between global rules and component-scoped rules.

- **`custom.js` is 2,179 lines, one IIFE.** No module structure. Top-level `var portfolio = { ... }` object with everything attached as methods. Initialization order matters. Adding a new feature requires understanding ~2000 lines of context. **Refactor to ES modules** if jQuery is ever removed.

- **CSS comment "Copyright (c) 2019" in `custom.js:1-10`** — preserved from ThemeForest template. Not legally problematic (template was purchased), but a stronger signal of pivoting away from the theme would be ownership of the comments too.

- **No formatter, no linter, no type-checking.** No `.prettierrc`, no `.eslintrc`, no `tsconfig.json`. Code style drifts naturally over time. Two-space and tab indentation both appear in the same repo.

- **`packageLock.json` present** with React/React-DOM/prettier transitive deps for Resend's email render. ~5 MB of node_modules to send 2 emails. See Security audit P2.

- **Inline comments in CSS** include some old design language: search for "preloader removed — no fadeout logic needed" (custom.js:1987). Vestige. Harmless.

- **No git history hygiene** apparent from outside: 30+ files touched in a single commit (`3417b52` "Freeze hero section") mixes hero CSS, content JSON, sidebar component, generated HTML, JSON, project templates. Hard to bisect bugs.

- **`docs/error-logs/logs_70308243004/`** committed accidentally in `1cabf77` (16 files, 2.5 MB of CI log dumps). Already flagged for cleanup as a spawned task. Should be `.gitignore`d.

### P3
- **Inconsistent quote style in JS** between single and double across `custom.js`.
- **Mix of `var` and modern alternatives** unlikely (`const`/`let`) in `custom.js`. It's all `var`. Consistent at least.
- **Template strings used inconsistently**: some places use ES6 backtick, others use string concat. Minor.
- **Magic numbers in canvas hero**:
  - `SPACING = 30`
  - `INFLUENCE = 200`
  - `trail.length > 36` — magic limit
  - `lastTrailEmit > 22` — magic milliseconds
  These are tuning constants. Could live in a config block at top of function.
- **No CHANGELOG.md** at repo root. There IS `docs/ENGINEERING-CHANGELOG.md` (144 KB!) — extensive internal log, but no user-facing "what changed in this release" doc.
- **Vendor folder is `assets/`**: vendor libs (Bootstrap, jQuery, Swiper, etc.) live alongside custom code. Conventional split would be `assets/vendor/` for third-party, `assets/{css,js,images}/` for owned code. Cosmetic.

---

## Detailed analysis

### CSS file (`assets/css/style.css`)

**Metrics:**
- 8,225 lines
- 195 KB source
- 146 KB minified (with custom minifier; real minifier would produce ~85 KB)
- 21 `!important` declarations
- 14 `:focus-visible` rules
- 3 `prefers-reduced-motion` rules
- 1 `z-index: 9999`
- ~390 `font-family:` declarations (high — repeated across selectors instead of cascading from a parent rule or root variable)
- 100+ `@media` queries

**Structure:** No clear section headers via stable comment markers. Hero rebuild added ~1,200 lines between line ~5,140 and ~5,400.

**Naming generations (count by sample):**
- snake_case with typo: ~30% of selectors
- kebab-case: ~50% of selectors
- BEM modifier: ~15% of selectors (dossier-specific)
- Utility classes (Bootstrap-style): ~5% of selectors

**Refactor cost estimate:** rewriting CSS top-to-bottom in a consistent modern system (CUBE / Tailwind / a real BEM tree) would be 1-2 weeks of focused work. Probably overdue but not blocking.

### JavaScript file (`assets/js/custom.js`)

**Metrics:**
- 2,179 lines
- jQuery-based (per the IIFE wrapper at line 12)
- 15 `addEventListener` calls (mixing with jQuery `.on()`)
- 0 `console.log` (clean — good)
- 0 `TODO`/`FIXME`/`HACK`/`XXX` markers (clean — also unusual; either rigorous or markers are buried)
- Hero canvas IIFE: lines 1989-2177 (188 lines, well-isolated)
- Contact form handler: lines ~1345-1820 (~475 lines — substantial)

**Architecture:**
```javascript
(function ($) {
  "use strict";
  var portfolio = {
    initialised: false,
    ...
    init: function() {
      this.open_menu();
      this.enhance_accessibility();
      this.bind_analytics_events();
      // ... 30+ method calls
    },
    open_menu: function() { ... },
    // ... 50+ methods
  };
  $(function() { portfolio.init(); });
}(jQuery));
```

**Strength:** organized as a namespaced object. Method names are descriptive. `this.reduceMotion` flag set early. Init guard prevents double-init.

**Weakness:** all methods share `portfolio` namespace, all run in the same closure. Hard to lazy-load any subset. Adding new feature = adding a method to the giant object.

### Build pipeline code (`scripts/build/*.mjs`)

Already audited in 01-architecture.md. Quality: **good**. Modular, testable, contracts enforced.

### Content JSON files (`content/*.json`)

- `projects.json` (5.7 KB) — 4 active dossiers, clean structure
- `projects.archived.json` (9 KB) — 7 archived projects preserved
- `testimonials.json` (7 KB) — testimonials with image and translate refs
- `training.json` (8.8 KB) — training timeline
- `experience.json` (1.1 KB) — references experience-card components
- `services.json` (4.8 KB) — service categories (current copy uses "Build, automation, and delivery" / "Narrative, UX, and positioning" / "Leadership, rollout, and enablement" — bridges to new positioning)
- `ctas.json` (1.6 KB) — hero, about, training-linkedin CTA configs

**Verdict:** content JSON is well-structured and well-validated by `renderers.mjs` via `assertRequired()`. Single source of truth for each section. ✓

### i18n JSON (`en.json` + `es.json`)

**Key counts:**
- `en.json`: 704 keys (1 comment key `__comment`)
- `es.json`: 705 keys (2 comment keys `_____comment1`, `_____comment2`)
- Used in templates + built HTML: 507 unique translate attribute references

**Drift:**
- 3 typo keys diverge between EN and ES:
  - EN: `bulding-a-flexible` / ES: `building-a-flexible` (typo only on EN side)
  - EN: `significantly-enhanced` / ES: `significatnly-enhanced` (typo only on ES side)
  - EN: `__comment` / ES: `_____comment1`, `_____comment2` (different comment markers)
- 2 keys referenced in templates but **MISSING from en.json**: `contactar`, `read-more`. When EN is active, these elements show... whatever the default text was (or empty string per `translate.js` behavior).
- 198 orphan keys in each language file (defined, never used).

**Recommendation:**
- Add a CI check: `npm run test:i18n` that:
  - Asserts key set parity between en.json and es.json
  - Detects orphan keys (warn)
  - Detects missing keys (fail)

### Duplicated code

- **Header / footer / sidebar** are correctly partialed via `<!-- @include -->`. ✓
- **Legacy redirects** duplicated between `netlify.toml` and `scripts/static-server.mjs` (see Architecture P1).
- **JSON-LD person/website schema** is duplicated between `index.html` (inline) and `scripts/build/renderers.mjs:createProjectStructuredData()`. Two sources of truth for the same person record.
- **Bootstrap utility classes overlap with custom CSS**: many `d-flex justify-content-center` usages alongside custom flex declarations.

### Test brittleness patterns

Tests have specific assertions that break easily:
- Title regex `/Ibai Fernández - Portfolio/i` (just fixed to `/Ibai Fernández/i`)
- Exact image filename `/ibai-fernandez-1\.avif/` (just fixed to `/ibai-fernandez-1x1-sidebar\.avif/`)
- Specific translate key `translate="systemic"` (just fixed to `translate="hero-eyebrow-1"`)
- Visual snapshots tightly bound to font rendering

**Suggested pattern:** test that the structure exists, not the exact copy. E.g.:
- "title contains 'Ibai Fernández'" not "title matches exact regex"
- "AVIF source exists with reasonable file extension" not "matches `ibai-fernandez-1.avif`"
- "first translatable hero element has matching key in en.json AND es.json" not "translate='systemic'"

### Magic numbers / inline literals

In `style.css` (rough grep):
- `clamp(56px, 9vw, 132px)` — hero h1 sizing. Intentional, well-tuned.
- `margin-top: -570px` (legacy, mobile, now overridden) — battle scar
- `max-height: 300px / 250px` (mobile media queries, now overridden with `!important`) — battle scars
- `transform: translateY(-100%)` (CTA pill swap) — intentional

Most magic numbers are either intentional design tokens (clamps, paddings) or battle scars from rebuild. Could be cleaner with CSS variables.

---

## Recommendations (prioritized)

1. **Fix the missing i18n keys.** Add `contactar` and `read-more` to en.json with proper translations. Wire in a CI check that fails on missing keys.
2. **Purge the 198 orphan i18n keys.** Programmatic: list orphans, manually review each (some may be intentional reserves), delete the rest. Saves ~22 KB JSON per language.
3. **Plan a CSS class rename pass.** Document new naming convention (recommend modern kebab-case + BEM modifiers). Migrate one component at a time, starting with the typos: `bannner_leftpart`, `siderbar_menuicon`, `responsor`, `setions`. Update CSS + HTML + tests + axe selectors atomically.
4. **Adopt prettier + stylelint.** Two configs, ~10 lines each. Run on save. Add to CI as non-blocking warn first, then blocking.
5. **Refactor brittle tests** to assert structure, not copy. Replace exact-string regexes with structural checks (file extension family, key existence in JSON, presence of element class).
6. **Split `custom.js` by feature.** Hero canvas → `hero-background.js`. Form handling → `contact-form.js`. Navigation → `navigation.js`. Lazy-load non-critical modules. Reduces critical-path JS from 51 KB to ~15 KB.
7. **Clean up `docs/error-logs/`** — already spawned. Add to `.gitignore`.
8. **Replace 8 jQuery plugins with ~3 KB of vanilla JS.** isotope, magnific-popup, scrollbar, circle-progress, zoom, jvectormap-* — each replaces in 50-100 lines of modern code.
9. **Adopt a CHANGELOG.md** at repo root in Keep-a-Changelog format. Per-release entries summarizing user-visible changes.
10. **Add a code review checklist** for CSS changes specifically (new file? new !important? new color outside palette? new media query breakpoint?). Reduces drift.

---

*End of code quality audit.*
