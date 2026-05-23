# ROADMAP

**Last updated:** 2026-05-23
**Single source of truth** for project state. If this drifts from reality, fix this file first.

---

## Current state

Production live at https://portfolio.ibaifernandez.com.
Last push to `origin/main`: `148a1b9` (`Post-audit hardening: close every finding from the 2026-05-23 audit`).
CI green. Tests: 52/52 e2e (45 prior + 7 new CSP enforcement specs) + quality + i18n parity + coverage parser regression test.

Narrative B locked: **AI Product Engineer · Founder-Operator**.

---

## Plan progress

| # | Step | Status |
|---|---|---|
| 1 | Brand discovery & narrative | ✅ Done (pre-session) |
| 2 | Hero rebuild (Narrative B) | ✅ Done |
| ★ | Marianas audit (8 dimensions, 152 findings) | ✅ Done |
| ★ | Marianas execution (Batches 1-7) | ✅ Done |
| ★ | Retire cv-print | ✅ Done |
| ★ | **About section** | ← **CURRENTLY WORKING ON** |
| 3 | Six product dossier pages | Pending |
|   | · Scanner 21.179 (RegTech / Ley 21.719) | Pending |
|   | · Kanban Desk | Pending |
|   | · Outreach | Pending |
|   | · Pulse | Pending |
|   | · Solos | Pending |
|   | · NotebookLM Skill / Massiva Pulse | Pending |
| 4 | Employment → rename "Career path" secondary | Pending |
| 5 | Testimonials cleanup (keep 3 LFi, archive 5 bootcamp) | Pending |
| 6 | Add PMI-ACP 2024 to `content/training.json` | Pending |
| 7 | Services section: eliminate or rename to "Capabilities" | Pending |
| 8 | Full QA (Lighthouse, Playwright, smoke, links) | Pending |

---

## Parallel pending (non-blocking)

- Inline critical above-fold CSS (~10 KB) — deferred post-About. Needs critical CSS extractor (penthouse/critical) to avoid FOUC. Reassess after Font Awesome drop frees 54 KB from critical path.
- LinkedIn headline + About → Narrative B (off-portfolio)
- GitHub README opener → Narrative B (off-portfolio)

### Shipped on 2026-05-23 (`origin/main` up to `7506050`)

- ✅ Re-encoded `rdld-press-el-mercurio-2020.avif` 571 KB → 240 KB
- ✅ Sidebar profile 160×160 variant + srcset (with parser fix in `tests/check-{avif,webp}-coverage.mjs` for multi-resolution srcset)
- ✅ Defer GA4 init to `requestIdleCallback`
- ✅ Drop Font Awesome → inline SVG sprite (originally 19 icons / 53 occurrences; sprite later grew to 27 symbols when archived templates were refactored)
- ✅ CSP script-src: `'unsafe-inline'` replaced by SHA256 hashes auto-synced by `scripts/build/csp-hashes.mjs` (build hook + CI check)
- ✅ Deleted unused FA assets (`all.min.css` + `assets/webfonts/`, −2.65 MB)
- ✅ Pruned dead worktrees + dead branches (`claude/funny-dhawan-43bcd3`, `claude/nostalgic-babbage-f81e16`, two stale `/private/tmp` entries)
- ✅ Retired `documentacion-profesional-if/` (52 KB LFi drafts) + added entry to `.netlifyignore`

### Shipped on 2026-05-23 (post-audit hardening, `origin/main` at `148a1b9`)

- ✅ Refactored 7 archived project templates to drop Font Awesome (sprite 19 → 27 symbols)
- ✅ Refactored preload-swap from inline `onload=` to a hashed `<script>` (`src/components/shared/preload-swap.html`) → `'unsafe-hashes'` removed from CSP (Safari 14–15.3 compatibility restored)
- ✅ GA4 `visibilitychange` bounce-capture in `analytics-ga4.html`
- ✅ Synced `docs/SECURITY.md`, `docs/ARCHITECTURE.md`, `docs/AI_RULES.md` with post-2026-05-23 reality (CSP, SVG sprite, csp-hashes hook, retire cv-print + all.min.css refs)
- ✅ `scripts/build/fingerprint.mjs` now fingerprints `assets/svg/icons.svg` and preserves URL fragments when re-running over already-processed HTML
- ✅ Empty JSON-LD removed from `lfi-legacy.html`
- ✅ Performance budget tightened (CSS 470 → 400 KB, JS 500 → 160 KB, HTML 285 → 230 KB on index)
- ✅ CSS helpers renamed: `.fa-big → .icon-big`, `.fa-mb-3 → .icon-mb-3`, `.fa-yellow → .icon-yellow`; orphan `.fa-mt-3` deleted
- ✅ Inline coverage parser regression test (`tests/check-coverage-tests.mjs`)
- ✅ CSP enforcement e2e spec (`tests/e2e/csp.spec.js`) — fails on any console-reported CSP violation across the 7 served pages

Outstanding from the same audit, not in repo:

- L7 (~95 inline `style="…"` attrs migration to CSS classes / `data-*` attrs, so `style-src 'unsafe-inline'` can finally drop) — large, backlog
- GitHub Actions Node 20 → 24 migration (deprecation notice, deadline June 2026) — pre-existing, surfaced by audit

Closed since the audit:

- ✅ M4 — `site:portfolio.ibaifernandez.com documentacion-profesional-if` returns zero hits on Google (2026-05-23); folder was never indexed. No removal request needed.

---

## What just shipped (last 10 commits on `origin/main`, newest first)

```
148a1b9  Post-audit hardening: close every finding from the 2026-05-23 audit
7506050  Retire `documentacion-profesional-if/`: working drafts no longer in service
9c1d651  ROADMAP: log parallel-pendings batch (2026-05-23)
431f025  Delete unused Font Awesome assets (-2.65 MB)
a6f815d  Replace CSP script-src 'unsafe-inline' with SHA256 hashes
3e23371  Drop Font Awesome: inline SVG sprite for 19 icons used
22e8e2d  Defer GA4 init to requestIdleCallback
62730e0  Add sidebar 160×160 srcset for sub-2x DPR displays
18d61b9  Compress rdld-press 2020 image: 1830×2048 → 915×1024
4f4dd9d  Document operating contract: AGENTS.md summary, AI_RULES.md detail
```

---

## Where to look for detail

| Topic | File |
|---|---|
| Deep audit findings | `audits/marianas/00-executive-summary.md` |
| Per-dimension audit | `audits/marianas/01..08-*.md` |
| Execution log (which audit items got fixed) | `audits/marianas/EXECUTION-LOG.md` |
| Brand voice / positioning | `brand-audit-narrative-b.md` |
| System architecture | `ARCHITECTURE.md` |
| Security posture | `SECURITY.md` |
| AI agent rules | `AI_RULES.md` |

---

## Rule

If this file does not reflect reality, the project state is undefined. Update it as part of any meaningful change.
