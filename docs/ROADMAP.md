# ROADMAP

**Last updated:** 2026-05-22
**Single source of truth** for project state. If this drifts from reality, fix this file first.

---

## Current state

Production live at https://portfolio.ibaifernandez.com — latest deploy `a4886c3` (Batch 7).
CI green. Tests: 45/45 e2e + quality + i18n parity.

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

### Recently shipped (parallel pendings batch, 2026-05-23)

- ✅ Re-encoded `rdld-press-el-mercurio-2020.avif` 571 KB → 240 KB
- ✅ Sidebar profile 160×160 variant + srcset
- ✅ Defer GA4 init to `requestIdleCallback`
- ⏭ Drop Font Awesome (in progress)
- ⏭ Nonce inline scripts → drop `'unsafe-inline'` from CSP (queued)

---

## What just shipped (recent commits, newest first)

```
a4886c3  Batch 7: dossier color-contrast AA — enforce strict axe gate
c72a970  Retire cv-print: portfolio replaces the CV
121b3eb  Batch 6: terser+csso minifier, content-hash fingerprinting, LCP preload
6375d99  Batch 5: dossier test coverage + brittle tests refactored + CI polish
493055c  Batch 4: i18n hygiene — purge orphans, localize meta, CI guard
104fe92  Batch 3: CSP enforce + cookie consent + privacy page
1701212  Batch 2: discovery surface aligned with Narrative B
e8e66cd  Batch 1: brand alignment, security headers, i18n hygiene quick wins
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
