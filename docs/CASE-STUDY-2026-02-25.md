# Case Study - Portfolio Hardening (2026-02-25)

## Executive summary

This sprint focused on making the portfolio production-grade from an engineering perspective without changing the public UX.

Main outcomes:

- Global media tooling ready (`cwebp`, `avifenc`, `ffmpeg` with `libwebp`).
- AVIF/WebP pipeline automated end-to-end with quality gates.
- Base architecture improved with CSS design tokens (`:root`).
- Componentization bridge implemented with templates + includes + build checks.
- Componentization phase 2 completed for project/testimonial cards (data-driven).
- Componentization phase 3 completed for training timeline (data-driven).
- Componentization phase 4 completed for CTA groups (data-driven).
- Performance hardening phase 5 completed (legacy JS/CSS audit + lazy loading by priority).
- Accessibility hardening phase 4 completed for Home/Contact critical paths (contrast + icon semantics).
- Blog shell accessibility hardening completed (`skip-link`, accessible search trigger, hardened+named social links).
- Legacy 31MB unused asset removed and blocked from reintroduction.
- Test suite remains green (`quality` + `e2e`).

## What we changed

### 1) Media pipeline (AVIF + WebP + fallback)

- Added WebP generator with encoder autodetection:
  - `scripts/generate-webp-assets.mjs`
  - Uses `cwebp` first, then `ffmpeg libwebp` fallback.
- Extended fallback wrapper:
  - `scripts/wrap-images-with-avif-picture.mjs`
  - Ensures `<picture>` includes AVIF/WebP sources when available.
- Added WebP coverage guard:
  - `tests/check-webp-coverage.mjs`
- Added npm commands:
  - `media:webp`, `media:all`, `test:webp`

### 2) CSS governance and componentization groundwork

- Introduced token layer in `:root` in `assets/css/style.css`.
- Migrated base typography/colors and key heading/button styles to tokens.
- Formalized decision in ADR:
  - `docs/adr/ADR-002-design-tokens-and-css-governance.md`

### 3) Asset hygiene

- Removed deprecated `assets/images/banner-bg.gif` (unused, legacy, 31MB local file).
- Added explicit quality guard to fail if it appears again:
  - `tests/quality-guards.sh`
- Removed ignore rule that hid this file in `.gitignore`.

### 4) Componentization phase 1 (no-visual-change migration)

- Added template source-of-truth:
  - `src/pages/index.template.html`
  - `src/pages/blog.template.html`
- Extracted first components:
  - `src/components/index/sidebar.html`
  - `src/components/index/hero.html`
  - `src/components/index/footer.html`
  - `src/components/shared/translate-button.html`
- Added build/check:
  - `scripts/build-pages.mjs`
  - `npm run build:pages`
  - `npm run test:templates`
- Enforced sync in quality gates:
  - `tests/quality-guards.sh`

### 5) Componentization phase 2 (data-driven cards/slides)

- Added content layer:
  - `content/projects.json`
  - `content/testimonials.json`
- Added reusable card templates:
  - `src/components/index/project-card.html`
  - `src/components/index/testimonial-slide.html`
- Extended static builder directives:
  - `<!-- @render projects-grid -->`
  - `<!-- @render testimonials-slides -->`
- Added required-field validation in build to fail fast on malformed content.

### 6) Componentization phase 3 (data-driven training timeline)

- Added training content source:
  - `content/training.json`
- Added reusable training template:
  - `src/components/index/training-item.html`
- Added builder directive:
  - `<!-- @render training-timeline -->`
- Replaced hardcoded training blocks in `src/pages/index.template.html`.
- Added keyboard/focus E2E coverage:
  - `tests/e2e/keyboard.spec.js`

### 7) Accessibility hardening phase 4

- Extended a11y E2E scope:
  - `tests/e2e/a11y.spec.js` now checks contact + primary home sections.
- Fixed serious/critical contrast issues in:
  - yellow CTAs, active gallery filter, footer copyright, footer contact links.
- Added accessible names for icon-only social links in:
  - `src/components/index/sidebar.html`
  - `src/pages/index.template.html`
- Removed inline style debt for “Read more” by introducing `read-more-text` class.

### 8) Componentization phase 4 (CTA groups)

- Added CTA data source:
  - `content/ctas.json`
- Added reusable CTA templates:
  - `src/components/index/dual-cta-buttons.html`
  - `src/components/index/single-cta-button.html`
- Added render directives:
  - `<!-- @render hero-cta-buttons -->`
  - `<!-- @render about-cta-buttons -->`
  - `<!-- @render training-linkedin-cta -->`
- Removed duplicated hardcoded CTA blocks from:
  - `src/components/index/hero.html`
  - `src/pages/index.template.html`

### 9) Keyboard/focus E2E expansion

- Extended `tests/e2e/keyboard.spec.js` with:
  - Contact form logical tab sequence.
  - Sidebar social links keyboard reachability + `aria-label` assertions.
  - Blog `skip-link` first-focus behavior.
  - Blog sidebar social links keyboard reachability + `aria-label` assertions.

### 10) Performance hardening phase 5 (dependency audit)

- Removed static includes that were non-critical at first render:
  - `bootstrap.min.js`
  - `cvtext1.js` + `cvtext2.js`
  - plugin CSS for `magnific`, `swiper`, `jvectormap`, `scrollbar`
- Added runtime stylesheet loader in `assets/js/custom.js` (`load_style()`).
- Moved text animation libraries (`cvtext*`) to on-demand load in `banner_typingtext()`.
- Extended quality guards to block reintroduction of static includes in `index.html` and `blog.html`.

### 11) Blog shell hardening

- Added dedicated E2E coverage:
  - `tests/e2e/blog.spec.js` (critical render, social hardening/accessibility, mobile overflow sanity).
- Added `skip-link` for blog main content target (`#blog_main`).
- Added explicit accessible name for search trigger icon (`aria-label="Search blog"`).
- Standardized blog sidebar social links with:
  - real destinations,
  - `target="_blank"` + `rel="noopener noreferrer"`,
  - consistent `aria-label` attributes.

## How we did it (process)

1. Audit current state and identify low-risk/high-impact targets.
2. Implement automation first (scripts + tests), then run real conversions.
3. Add guardrails so improvements are enforceable in CI, not just manual.
4. Capture rationale in ADR/docs for future maintainers and public narrative.
5. Verify by running full gates before closing sprint.

Commands used during validation:

```bash
npm run media:webp
npm run build:pages
npm run test:quality
npm run test:e2e
```

## Why this approach

- **Automation before manual tweaks**: avoids one-off fixes and ensures reproducibility.
- **Guardrails over guidelines**: failing checks prevent regression drift.
- **Incremental architecture**: tokens + data-driven sections improve maintainability now while minimizing visual risk.
- **Evidence-driven communication**: metrics and tests make the story credible for GitHub/LinkedIn.

## Measurable impact

| Metric | Before | After | Notes |
|---|---:|---:|---|
| Workspace size (local) | 128M | 97M | Includes docs/content/testing additions after cleanup |
| `assets/images` (local) | 38M | 6.7M | Includes legacy cleanup and modern formats |
| AVIF converted assets | 0 (initial) | 28 | `~84.1%` aggregate savings on converted set |
| WebP converted assets | 0 (initial) | 28 | `~81.6%` aggregate savings on converted set |
| `index.html` static JS | `200.1 KB (6)` | `135.5 KB (3)` | Removed legacy/static non-critical includes |
| `blog.html` static JS | `188.2 KB (3)` | `132.9 KB (2)` | Removed static `bootstrap.min.js` |
| Quality suite | N/A (initial) | Pass | Includes budget + AVIF/WebP coverage + links |
| E2E suite | N/A (initial) | `27/27` pass | Home, blog, contact, a11y, visual, keyboard |

## GitHub-ready changelog paragraph

This sprint hardens the portfolio’s engineering baseline without changing visible UX: AVIF/WebP media pipeline is now fully automated and enforced with quality gates, CSS now has a tokenized base (`:root`) to support future componentization, critical accessibility issues were resolved (contrast + icon-only semantics), and static legacy JS/CSS dependencies were pruned in favor of lazy loading by priority. All quality checks and E2E tests remain green.

## LinkedIn-ready post (ES)

En esta iteración llevé mi portfolio a un estándar más profesional de ingeniería, sin tocar su look&feel:

- Pipeline de imágenes AVIF/WebP automatizado y con guardrails.
- Refactor inicial de CSS con design tokens para facilitar componentización.
- Limpieza de deuda técnica (asset legacy de 31MB eliminado).
- Testing en verde: quality gates + E2E (`27/27`).
- Cierre de accesibilidad crítica (axe) en Home/Contact (`serious/critical = 0`).

No fue solo “optimizar por optimizar”: documenté decisiones técnicas (qué, cómo y por qué) para que el trabajo sea mantenible, reproducible y defendible.

## Next technical steps

1. Continue token migration to remaining high-churn CSS blocks.
2. Complete manual full-site contrast and typographic scaling audit (beyond automated Home/Contact scope).
3. Keep Blog Lorem Ipsum replacement in its dedicated backlog item.
4. Prepare migration path from current static bridge to ADR-001 target stack.
