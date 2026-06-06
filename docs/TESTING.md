# Testing & quality gates

How the portfolio is verified. Everything here runs in CI (`.github/workflows/ci.yml`)
and most of it runs locally via the pre-commit hook (`scripts/pre-commit.sh`).

## Commands

| Command | What it does |
|---|---|
| `npm run build:pages` | Regenerate all HTML + sitemap/llms + fingerprints + CSP hashes from `src/` + `content/`. |
| `npm run test:templates` | `build:pages --check` — fail if any generated file is out of sync with its template. |
| `npm run test:quality` | Structure, security, a11y baseline, performance budget, AVIF/WebP coverage, internal links, i18n parity, checker meta-tests. |
| `npm run test:unit` | Node built-in unit tests for the build core (`tests/build/*.test.mjs`). |
| `npm run test:smoke` | Serves the built HTML and asserts key structure. |
| `npm run test:e2e` | Playwright suite (see inventory below). |
| `npm run test:ci` | quality → unit → smoke → e2e (the full CI gate). |
| `python3 scripts/dossier-claim-check.py [--all]` | Dossier factual-claim allowlist guard (see below). |

## E2E inventory (`tests/e2e/`)

| Spec | Covers |
|---|---|
| `home.spec.js` | Home critical blocks, sidebar anchors, skip link, language toggle, legacy redirects. |
| `contact.spec.js` | Contact form validation, accessible feedback, valid submit, too-fast rejection. |
| `keyboard.spec.js` | Keyboard reachability of nav + language toggle, contact form tab order. |
| `a11y.spec.js` | axe-core WCAG 2.1 A + AA on the home page. |
| `dossiers.spec.js` | Dossier index/listing behavior. |
| `dossier-pages.spec.js` | Per-dossier (matrix from `content/projects.json`): render, native translate button, `<html lang>` toggle, hardened external links, axe WCAG. |
| `archived-dossiers.spec.js` | Retired dossier routes redirect correctly. |
| `cookie-consent.spec.js` | Banner show/accept/decline, persistence, re-open, no GA cookie pre-consent. |
| `csp.spec.js` | Content-Security-Policy enforcement at runtime. |
| `visual.spec.js` | Visual regression snapshots (see contract below). |

## Dossier claim-check pipeline

`scripts/dossier-claim-check.py` is a **binding factual-claim guard** for dossier
content. It scans dossier-shaped files (root `*-NNNN.html`, `content/*.md`,
`src/pages/dossier-*.template.html`) for factual claims — percentages, counts with
units, version strings, file extensions, function-call names — and fails unless
each claim is listed in `.dossier-approved-claims.yml` with a source citation.

- **Local:** runs in `scripts/pre-commit.sh` against *staged* files.
- **CI:** runs as `python3 scripts/dossier-claim-check.py --all` (full repo scan) so
  the gate is enforced server-side even if a contributor never installed the hook.
- **Adding a claim:** add an entry to `.dossier-approved-claims.yml` under `approved:`
  with a `pattern:` and a real `source:` citation. Never approve an undocumented figure.
- **Bypass (emergency hotfix only):** `DOSSIER_CHECK_SKIP=1` or `DOSSIER_CHECK_WARN_ONLY=1`.
  These bypass the **local** hook only — CI still enforces.

## Visual-regression baseline contract

Baselines live in `tests/e2e/visual.spec.js-snapshots/`. macOS and Ubuntu rasterize
fonts/sub-pixels differently, so:

- **CI (Ubuntu) is authoritative.** Regenerate baselines from a CI run's
  `*-actual.png` artifacts, not from a local macOS run — local snapshots will drift.
- Snapshot filenames are **not** platform-suffixed (the same PNG is compared on both),
  so a locally-generated baseline will fail in CI. To update a baseline: download the
  CI `test-results` artifact and commit the `*-actual.png` as the new baseline.
- `visual.spec.js` deliberately: pre-sets `localStorage.portfolio_consent='declined'`
  to suppress the cookie banner; uses `maxDiffPixelRatio` tolerance for font
  rasterization differences; and clips capture widths below the smaller platform's
  render width. Keep these when adding snapshots.
