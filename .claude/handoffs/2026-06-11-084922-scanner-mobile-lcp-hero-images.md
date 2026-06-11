# Handoff: Scanner Mobile LCP — Hero Image Optimization

## Session Metadata
- Created: 2026-06-11 08:49:22
- Project: /Users/AGLAYA/Local Sites/26-04-portfolio-if
- Branch: main
- Session duration: ~3h (continuation of 2026-06-07 owner-actions session)

### Recent Commits (for context)
  - e9a7abc docs: close all 6 owner-actions + graph + build artifacts
  - 54b9610 feat(testimonials): re-enable testimonials section with 3 visible entries
  - 995b9c8 feat(testimonials): hide 5 entries, keep 3 visible
  - 8b6c90e perf(LCP): font preloads + font-display:fallback for Josefin Sans
  - 268e31c legal(privacy): add LSSI-CE aviso legal block (section 8)

## Handoff Chain

- **Continues from**: [2026-06-07-195321-owner-actions-6-steps.md](./2026-06-07-195321-owner-actions-6-steps.md)
- **Supersedes**: None

## Current State Summary

All work from the 2026-06-05 Mariana audit is fully closed. The 6 owner-side actions
are done (GA4, DNS/DMARC, Captcha, Netlify gate, PSI, LSSI-CE aviso legal). Repo is
clean on `main`, CI green (57/57 e2e), deployed to production.

The one remaining performance opportunity is **scanner-21179 mobile LCP: 5.0s (score 77)**.
Homepage mobile is 90 / 3.4s — acceptable. Scanner is the laggard.
Root cause: dossier hero images above the fold. Font preloads helped; images are now
the bottleneck.

## Codebase Understanding

### Architecture Overview

Static site. No framework runtime. `src/pages/*.template.html` + `src/components/**/*.html`
→ `npm run build:pages` → built HTML. Single Netlify function for contact form.
Deploys via CLI from GitHub Actions after full gate (quality + claim + unit + smoke + e2e).
Netlify Git auto-builds are **stopped** — only CI deploys.

### Critical Files

| File | Purpose | Relevance |
|------|---------|-----------|
| `src/pages/dossier-scanner-21179.template.html` | Scanner dossier template | Hero images live here |
| `src/components/project/dossier-head.html` | Shared dossier `<head>` | Preloads — add hero img preload here |
| `assets/css/font.css` | Font-display settings | fallback for non-italic Josefin Sans |
| `content/testimonials.json` | Testimonials data | hidden:true on 5 entries |
| `scripts/build/renderers.mjs` | Build renderers | testimonials filter at line ~255 |
| `en.json` / `es.json` | i18n bundles | must stay 1062 keys parity |
| `docs/OWNER-ACTIONS.md` | 6 audit owner-actions | all closed 2026-06-11 |

### Key Patterns Discovered

- **hidden pattern:** `hidden: true` in `content/*.json` + `.filter(t => !t.hidden)` in renderer.
  For hidden entries, always set `translate: null` to avoid i18n-checker false positives.
- **Build gate:** any source change that affects output HTML requires `build:pages` before commit
  (pre-commit hook runs `build:pages --check` and fails if HTML is out of sync).
- **i18n checker:** scans `content/*.json` for `translate` properties and verifies keys exist
  in both `en.json` and `es.json`. Missing keys → CI fail.
- **Bootstrap purge:** `bootstrap.min.css` regenerated each `build:pages`. New BS classes need
  the safelist in `scripts/build/purge-bootstrap.mjs`.
- **Dossier claim allowlist:** factual claims in dossier templates must be in the allowlist or
  pre-commit fails.

## Work Completed

### Tasks Finished

- [x] GA4 data retention 14 months + Google Signals OFF (owner confirmed)
- [x] DNS: SPF + DKIM + DMARC for ibaifernandez.com via Resend + Cloudflare (owner confirmed)
- [x] Captcha: Turnstile keys in Netlify env + .env local typo fixed (PORTFOLIO_CAPTCHA_SECRET_KEY → PORTFOLIO_CAPTCHA_SECRET)
- [x] Netlify auto-builds stopped; single deploy path = CLI from CI
- [x] PSI baseline run: homepage mobile 90/3.4s, scanner mobile 77/5.0s
- [x] LSSI-CE aviso legal section added to privacy.template.html
- [x] Font preloads (Josefin Sans 700+600 woff2) in index.template.html + dossier-head.html
- [x] font-display:fallback for non-italic Josefin Sans variants
- [x] Testimonials: 5 hidden, 3 visible; section re-enabled
- [x] Docs: OWNER-ACTIONS + REMEDIATION + ARCHITECTURE updated; graph rebuilt

### Files Modified

| File | Changes | Rationale |
|------|---------|-----------|
| `src/pages/index.template.html` | Font preloads + testimonials section re-enabled | LCP + testimonials |
| `src/pages/privacy.template.html` | LSSI-CE Section 8 added | Legal compliance |
| `src/components/project/dossier-head.html` | Font preload + deferred animate.css | LCP on dossiers |
| `assets/css/font.css` | font-display:fallback for non-italic Josefin Sans | LCP FOIT prevention |
| `content/testimonials.json` | hidden:true + translate:null on 5 entries | Testimonials cleanup |
| `scripts/build/renderers.mjs` | .filter(t => !t.hidden) in testimonials renderer | Testimonials cleanup |
| `en.json` / `es.json` | 5 testimonial keys removed; 2 LSSI keys added (net 1062) | i18n parity |
| `docs/OWNER-ACTIONS.md` | All 6 items marked done | Audit closure |
| `docs/audits/2026-06-05-mariana/REMEDIATION.md` | Owner-action section updated | Audit closure |
| `docs/ARCHITECTURE.md` | Font LCP + testimonials decisions + date bump | Documentation |

### Decisions Made

| Decision | Options Considered | Rationale |
|----------|-------------------|-----------|
| font-display:fallback for non-italic | swap vs fallback | fallback = 100ms window, text visible with system font; swap risks FOIT longer. Italic kept as swap (decorative use) |
| Testimonials hidden pattern | delete vs hidden flag | hidden:true preserves data, allows future re-enable without git archaeology |
| LSSI-CE address | full registered address vs email-only | Art.10 requires identifiable establishment; nomadic professional uses registered postal address in Spain |
| SEO bilingüe | implement /es/ /en/ vs defer | XL-scope architectural change; not worth complexity for personal portfolio; consciously deferred |

## Pending Work

### Immediate Next Steps

1. `graphify query "scanner dossier hero image"` to locate LCP candidate img.
2. Verify `loading` attribute on hero img: must be `loading="eager"` (NOT lazy) for LCP element.
3. Add `fetchpriority="high"` to LCP `<img>` tag if missing.
4. Check if AVIF/WebP sources exist for hero image. If not, generate and add `<picture>`.
5. Consider `<link rel="preload" as="image">` for the hero in `dossier-head.html`.
6. `npm run build:pages && npm run test:ci` → commit → deploy → PSI. Target: LCP < 3.5s (score ≥ 85).

### Blockers/Open Questions

- None blocking. Scanner mobile 77 is a "nice to have", not urgent.

### Deferred Items

- Scanner mobile hero image optimization (this handoff's target)
- SEO bilingüe (SEO-BILINGUAL-01) — XL scope, consciously deferred indefinitely

## Context for Resuming Agent

### Important Context

**Language:** respond in Spanish.

**PSI baseline at session close:**

| Page | Device | Score | LCP |
|------|--------|-------|-----|
| homepage | Mobile | 90 | 3.4s (was 4.0s) |
| homepage | Desktop | 92 | 1.2s |
| scanner-21179 | Mobile | 77 | 5.0s (was 6.1s) |
| scanner-21179 | Desktop | 97 | 1.3s |

**Testimonials:** stable. 3 visible, 5 hidden. No action needed.

**All 6 Mariana audit owner-actions closed.** See `docs/OWNER-ACTIONS.md`.

### Assumptions Made

- Scanner mobile LCP bottleneck is hero image (not CSS or fonts — those were already optimized)
- `loading="eager"` + `fetchpriority="high"` not yet set on scanner hero img (unverified)
- AVIF/WebP variants may already exist on disk (check before generating)

### Potential Gotchas

- i18n checker scans `content/*.json` — any `translate` key must exist in both JSON bundles
- Pre-commit hook runs `build:pages --check` — run build before committing
- Bootstrap purge regenerates on every build — new BS classes need the safelist
- Dossier claim allowlist — new factual claims need to be allowlisted

## Environment State

### Tools/Services Used

- npm build system (`npm run build:pages`, `npm run test:ci`)
- Netlify CLI for deploys (gated via CI)
- graphify for knowledge graph (`graphify update .`)
- Playwright for E2E tests

### Active Processes

- None. Clean state.

### Environment Variables

- `PORTFOLIO_CAPTCHA_SECRET` (Netlify + .env local)
- `PORTFOLIO_CAPTCHA_PROVIDER` = turnstile
- `PORTFOLIO_CAPTCHA_REQUIRED` = 1
- `RESEND_API_KEY`, `FROM_EMAIL`, `TO_EMAIL` (Netlify env)

## Related Resources

- `docs/OWNER-ACTIONS.md` — all 6 closed
- `docs/ARCHITECTURE.md` — updated 2026-06-11
- `docs/audits/2026-06-05-mariana/REMEDIATION.md` — full audit log
- `graphify-out/GRAPH_REPORT.md` — architecture overview via graph

---

**Security Reminder**: Before finalizing, run `validate_handoff.py` to check for accidental secret exposure.
