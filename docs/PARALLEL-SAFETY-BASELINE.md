# PARALLEL-SAFETY-BASELINE.md — Shared Mechanical Contract

**Last updated:** 2026-03-16

## Purpose

Give every thread the same repo-wide mechanical truth so parallel work does not silently break shared consistency.

This document is mandatory shared context for:

- the master coordination thread
- every dossier thread
- the homepage editorial thread
- the technical-consolidation thread

It complements `docs/THREAD-ORCHESTRATION.md`.  
Use both together.

## Current verified repo state

The following commands were revalidated locally on 2026-03-16:

- `npm run build:pages`
- `npm run test:quality`
- `npm run test:e2e`

Current verified notes:

- `norden.html` is already a public generated route and appears in the homepage/test surface.
- Playwright counts are mutable state, not timeless copy. Reverify with `npx playwright test --list` before quoting a number.
- LFi already uses `assets/css/dossiers/lfi.css`, but a shared `.lfi_dossier_*` residue still exists inside `assets/css/style.css`.
- A CI incident on 2026-03-16 confirmed that local, uncommitted shared test/snapshot fixes can create a false green. GitHub Actions evaluates committed `HEAD`, not your workspace.
- Homepage language-toggle expectations are governed by `en.json` / `es.json`. `tests/e2e/home.spec.js` must derive hero pre-title assertions from those payloads instead of hardcoded copy.
- `tests/e2e/visual.spec.js-snapshots/projects-section.png` is a baseline of the current built homepage, not a timeless asset. Refresh it only when intentional source changes to homepage markup/data/shared home styling legitimately change the rendered section.

## Canonical sources of truth

Treat these as canonical unless a thread-specific prompt says otherwise:

- markup sources: `src/pages/*.template.html`, `src/components/**`
- structured content: `content/*.json`, `en.json`, `es.json`
- readable served assets: `assets/css/*.css`, `assets/js/*.js`
- build/runtime/test/config: `scripts/**`, `tests/**`, `netlify/**`, `.github/workflows/**`
- shared documentation: `README.md`, `AGENTS.md`, `docs/**`

## Generated derivatives

These are committed outputs, not hand-authored sources:

- root `*.html`
- `assets/css/*.min.css`
- `assets/js/*.min.js`
- generated media variants such as `*.avif` and `*.webp` when produced by repo tooling

Never edit them directly.

## Non-negotiable thread rules

1. Stay inside your ownership boundary.
2. If you edit a canonical source, regenerate expected derivatives with `npm run build:pages`.
3. If your change touches shared runtime, shared CSS/JS, shared discovery, routing, tests, snapshots, or another dossier's files, escalate it instead of absorbing it silently.
4. Do not quote unstable counts or dated release metrics unless you reverify them in-repo.
5. Do not package evidence/noise casually. This includes:
   - `docs/*RATIONALE*.md`
   - `documentacion-profesional-if/`
   - external workspaces used as read-only evidence
   - exports, helper PDFs, `.DS_Store`, and other non-release artifacts

## Safe release flow

1. Run `git status --short`.
2. Separate canonical source edits from generated derivatives.
3. Run `npm run build:pages`.
4. Confirm that only expected generated diffs remain.
5. If homepage copy, translations, or projects-grid layout changed, confirm the coupled shared tests/snapshots moved in the same commit set instead of only in your local workspace.
6. Run `npm run test:quality`.
7. Run `npm run test:e2e` whenever shared runtime, homepage, translation, routing, shared CSS, tests, or snapshots changed.
8. Prefer `npm run test:ci` before push when closing shared homepage/test drift; if it fails because your environment cannot bind `127.0.0.1:4173`, treat that as an environment issue to re-run outside the sandbox before calling it a repo regression.

## Handoff rule

When a thread needs a shared change, it should hand off with:

- the exact file(s) involved
- why current ownership blocks the change
- which generated outputs are expected to move
- which validation steps are expected to change
- which thread should absorb the work
