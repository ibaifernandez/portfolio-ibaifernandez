# 06 — Documentation Alignment Audit

**Date:** 2026-05-22
**Auditor:** Claude Opus 4.7 (1M context)
**Repo:** portfolio-ibaifernandez @ `1cabf77` (main)

---

## Executive summary

Documentation **volume is impressive** (20+ markdown files in `docs/`, plus `AGENTS.md`, `README.md`, `brand-audit-march-2026.md`) but **alignment with current state is poor**. The hero rebuild this session (Narrative B: "AI Product Engineer · Founder-Operator") landed in the code/copy/CSS, but **none of the documentation has caught up**. Every strategic doc still describes the previous Narrative A ("Full-Stack Automator & AI Orchestrator") or even older positioning.

**Bigger problem:** the SEO discovery surface (`sitemap.xml`, `llms.txt`, `llms-full.txt`, structured data) lists **5 dead URLs** (debtracker, gymtracker, portfolio-ibaifernandez, my-board, the-research-engine) that now redirect. Search engines and LLM crawlers consume these as canonical entries.

Top 3 issues:
1. **P0 — `sitemap.xml` lists 5 retired dossiers** as canonical URLs (`debtracker.html`, `gymtracker.html`, `portfolio-ibaifernandez.html`, `my-board.html`, `the-research-engine.html`). These all redirect (308) to `/#project_sec`. SEO crawls them as primary, gets redirected, wastes crawl budget, signals "moved content" repeatedly.
2. **P0 — `llms-full.txt` is severely outdated.** Describes products with Next.js, Server Actions, Firestore, Python/Flask, SQLite — none of which match current narrative (AI Product Engineer · Founder-Operator shipping RegTech / Email infra / SaaS). LLM agents indexing this file get a wrong picture of what Ibai actually does today.
3. **P1 — `brand-audit-march-2026.md` (16 KB) is the strategic baseline** but positions Ibai as "Full-Stack Automator & AI Orchestrator" — which has been REPLACED by Narrative B ("AI Product Engineer · Founder-Operator") implemented in the hero this session. The brand audit is now misleading anyone trying to align other channels (LinkedIn, GitHub README) to the portfolio.

---

## Findings by severity

### P0
- **`sitemap.xml` ghosts retired dossiers.** Lists `debtracker.html`, `gymtracker.html`, `portfolio-ibaifernandez.html`, `my-board.html`, `the-research-engine.html` — all 308-redirect to `/#project_sec`. Last-modified `2026-03-04` for these stale entries. Active dossiers shown: home, lfi.html, ruta-de-la-digitalizacion-y-2x2-mkt.html, elm-st.html, aglaya.html — correct.
  - **Impact:** Search engine crawl waste; index of redirected URLs persists; possible "soft 404" penalty.
  - **Fix:** prune the 5 retired entries. Generate sitemap.xml from `content/projects.json` during build to prevent recurrence.

- **`llms-full.txt` describes products that don't exist in the new narrative.**
  - Lists `debtracker.html`, `gymtracker.html`, `portfolio-ibaifernandez.html`, `my-board.html`, `the-research-engine.html` as canonical.
  - Describes DebTracker as "zero-trust financial ledger case (Next.js, Server Actions, Firestore patterns, PWA integration)" — but this is now archived, redirected, and the new narrative is RegTech via "Scanner 21.179" (Chile Ley 21.719).
  - Describes GymTracker as "local-first architecture case (Python/Flask, SQLite, deterministic AI pipelines, QA automation)" — also archived.
  - Active dossier descriptions (LFi, Ruta, Elm St, AGLAYA) are still accurate.
  - **Last-Updated: 2026-03-15** — explicitly stamped 2 months old.
  - **Impact:** Anyone using `llms.txt` for AI ingestion (a growing practice — ChatGPT, Claude, Perplexity all reference this file when crawling) gets a misleading model of Ibai's current work.

- **`llms.txt`** (smaller index) lists the same 5 retired URLs as "Primary pages". Same issue, less severe.

- **JSON-LD `image` URL in `index.html:68` and `scripts/build/renderers.mjs:43`** references `ibai-fernandez-1.jpg` — **the file no longer exists** (renamed to `ibai-fernandez-1x1-sidebar.{avif,webp,jpeg}` in commit `3417b52`). Structured data serves a 404. SEO + social share preview broken.

### P1
- **`brand-audit-march-2026.md`** positions Ibai as "Full-Stack Automator & AI Orchestrator" with the promise "*I build automated systems that make money while you sleep*". This is **Narrative A**, REPLACED in this session's hero rebuild by **Narrative B**: "AI Product Engineer · Founder-Operator". The brand audit's recommendations (rewrite LinkedIn headline as "Full-Stack Automator & AI Orchestrator — I build automated systems that make money while you sleep") are now off-message.
  - **Impact:** Anyone aligning other channels (LinkedIn, GitHub, X) using this doc will MIS-align them with the portfolio.
  - **Fix:** Archive `brand-audit-march-2026.md` to `docs/brand-and-strategy/.archived/` or rename it explicitly: `brand-audit-march-2026-NARRATIVE-A-DEPRECATED.md`. Write a Narrative B brand audit.

- **`docs/ROADMAP.md` (Last updated 2026-03-13)** still lists the project surface as **9 dossiers** (DebTracker, GymTracker, LFi, Ruta, Portfolio, MyBoard, Research Engine, Elm St, AGLAYA). The site has been since trimmed to 4 active dossiers (LFi, Ruta, Elm St, AGLAYA). The ROADMAP is the "single source of truth" by its own claim — **it is no longer truthful**.

- **`AGENTS.md` (Last updated 2026-03-03)** is generally accurate on stack/build/CI but lists "Document Index" with all 13 `THREAD-PROMPTS/` files including ones for archived dossiers (DebTracker, GymTracker, Portfolio Ibai Fernandez, MyBoard, Research Engine, Norden). Suggests AI agents to follow prompts for projects that no longer exist as public dossiers.

- **`docs/SECURITY.md` (Last updated 2026-03-03)** is mostly accurate but states "CSP promotion to enforce is pending Phase 6" — still pending today, 2+ months later. The "Known Limitations" table shows several items "Closed" that were closed 2 months ago. No mention of newer items (e.g. the broken JSON-LD image reference).

- **`docs/ARCHITECTURE.md` (Last updated 2026-04-10)** is the most accurate strategic doc. Still references "publish 9 dossiers" implicitly via image. Mostly OK.

- **`docs/THREAD-ORCHESTRATION.md`** describes a 13-thread parallel execution model. The current state has 4 active surfaces. The 13-thread model is now overkill — likely a vestige of a more ambitious phase.

### P2
- **`docs/error-logs/logs_70308243004/`** — accidentally committed in `1cabf77` (this session, before cleanup task spawned). 16 files, 2.5 MB. Should be `.gitignore`d and untracked.

- **`docs/THREAD-PROMPTS/` folder** has 13 prompt files including:
  - `02-debtracker.md` — archived dossier
  - `03-gymtracker.md` — archived
  - `06-portfolio-ibaifernandez.md` — archived
  - `07-my-board.md` — archived
  - `08-the-research-engine.md` — archived
  - `11-norden.md` — never publicly launched
  
  These prompts are referenced from AGENTS.md as authoritative. They will lead AI agents to work on dead projects.

- **`docs/BREVO-INTELLIGENCE-LAYER-EDITORIAL-RATIONALE.md`** — refers to a dossier that was archived. Editorial rationale for a project that no longer exists publicly. Move to `.archived/`.

- **`docs/CASE-STUDY-2026-02-25.md`** — case study doc from February. Verify it still applies; archive if narrative has moved past it.

- **`docs/cv/CV_Ibai_Fernandez.html`** — possibly the printable CV before it was rebuilt to `cv-print.html`. Verify and dedupe.

- **`docs/freeze-visual/260316-lfi-desktop-freeze.md`** — explicitly time-stamped (March 16). May be stale. Move to `.archived/freeze-visual/`.

- **`docs/arreglar-en-monitores-pequeños/`** — Spanish title; folder contains 2 jpegs. Cosmetic — probably screenshots of issues to fix. Should this be docs or a GitHub issue?

- **`docs/QA-DESKTOP.md` + `docs/QA-MOBILE.md` (2026-04-10)** — manual QA checklists. Date-stamped post-hero-rebuild? Need to verify they reflect the new hero.

- **`docs/DEPLOY_ROADMAP.md`** (Apr 9) — verify still current after Netlify deploy is fully migrated.

- **`README.md`'s "Siguiente evolución recomendada" section (lines 227-232)**:
  - "Re-capturar PageSpeed post-accesibilidad..." — same recommendation since March, never closed.
  - "Promover CSP de report-only a enforce (Phase 6)" — pending.
  - "Reescribir narrativa de home por impacto" — PARTIALLY done this session (Narrative B locked).
  - "Google Search Console + sitemap + validación real de Turnstile en producción" — Turnstile validated per SECURITY.md, GSC unclear.

  These should be updated to reflect what's done vs pending.

### P3
- **Multiple "Last updated: 2026-03-03"** stamps in AGENTS.md, SECURITY.md, brand-audit. Coordinated reset 2 months ago. Updating dates without updating content is a documentation anti-pattern.
- **`documentacion-profesional-if/` folder** contains private docs (CVs in different formats?). `.gitignore` excludes `*.docx` and `.pdf` inside the leben subfolder. The folder structure is checked in but binaries excluded. Verify nothing sensitive is committed (likely OK).
- **`llms.txt` and `llms-full.txt` have `Last-Updated: 2026-03-15` stamps** — at least they self-document staleness, but they should be auto-generated from build.
- **README has Spanish + English mixed** — section headers in Spanish, code samples and stack list also Spanish/English mix. Style choice but inconsistent.
- **No `CHANGELOG.md`** at repo root. `docs/ENGINEERING-CHANGELOG.md` (144 KB!) exists but it's internal-flavored. Public-facing release notes would help.
- **No `CONTRIBUTING.md`** for human contributors. Possibly intentional (solo project), but if AI agents are expected contributors, this is implicit in AGENTS.md.
- **No `CODE_OF_CONDUCT.md`** — not applicable to solo portfolio.

---

## Detailed analysis

### Document inventory

```
README.md                                  8.6 KB   Apr 10
AGENTS.md                                  8.2 KB   Apr 10  (header says 2026-03-03)
brand-audit-march-2026.md                 16 KB    Apr 9    ← STRATEGIC, NOW STALE
llms.txt                                   0.9 KB   Apr 9    ← lists dead URLs
llms-full.txt                              2.6 KB   Apr 9    ← lists dead products
robots.txt                                 0.1 KB   Apr 9
sitemap.xml                                2 KB     Apr 9    ← lists dead URLs
docs/
├── AI_RULES.md                            8.6 KB   Apr 9
├── ARCHITECTURE.md                       15 KB     Apr 10
├── BACKLOG.md                             2.9 KB   Apr 9
├── BREVO-INTELLIGENCE-LAYER-EDITORIAL-...  6.2 KB   Apr 10  ← archived dossier
├── CASE-STUDY-2026-02-25.md               9.1 KB   Apr 9
├── DEPLOY_ROADMAP.md                      0.6 KB   Apr 9
├── ENGINEERING-CHANGELOG.md             144 KB     Apr 9    ← MASSIVE internal log
├── ENGINEERING-RUNBOOK.md                26 KB     Apr 10
├── GLOSSARY.md                           10 KB     Apr 9
├── LFI-DOSSIER-RATIONALE.md              13 KB     Apr 10
├── PARALLEL-SAFETY-BASELINE.md            4.5 KB   Apr 10
├── PRD.md                                10 KB     Apr 10
├── QA-DESKTOP.md                          5.6 KB   Apr 10
├── QA-MOBILE.md                           5 KB     Apr 10
├── ROADMAP.md                             5.8 KB   Apr 9    ← NOW STALE
├── SECURITY.md                            7.2 KB   Apr 9    ← partial stale
├── THREAD-ORCHESTRATION.md               15 KB     Apr 10
├── THREAD-PROMPTS/                       (13 files including 6 for archived projects)
├── arreglar-en-monitores-pequeños/       (2 jpgs)
├── brand-and-strategy/                   (3 docs)
├── cv/                                    (1 html — likely vestige)
├── error-logs/                            ← ACCIDENTALLY COMMITTED
└── freeze-visual/                         (1 md)
documentacion-profesional-if/              (private subfolders, binaries gitignored)
```

**Observation:** the documentation footprint is **enormous** for a personal portfolio. 20+ markdown files, ~330 KB of doc content. Most was written for an earlier, more ambitious narrative ("13 parallel threads") that has been collapsed to "I'm doing hero polish".

### Narrative drift across docs

| Doc | Positioning |
|---|---|
| **brand-audit-march-2026.md** | "Full-Stack Automator & AI Orchestrator" |
| **llms.txt / llms-full.txt** | "Full-Stack architecture, AI automation, UX/UI systems, enterprise-scale marketing operations" |
| **cv-print.template.html:29** (built into cv-print.html) | "Full-Stack Automation Architect \| Revenue Engineering \| Systemic Integrator" |
| **JSON-LD in index.html:69** | "AI Product Engineer · Founder-Operator at AGLAYA" |
| **index.html `<title>` line 12** | "Ibai Fernández — Founder-Operator. AI Product Engineer." |
| **Hero copy (this session)** | "AI Product Engineer" + eyebrow "Product Design & Development · AI Orchestration · Deploy & Deliver" |
| **OG description in index.html:18** | "Founder-operator who codes. Six live systems shipped — RegTech compliance pipelines, multi-tenant SaaS, email infrastructure, IRL discovery, open-source AI tooling." |

**Conclusion:** **6 different positioning statements** across docs and produced HTML. Reader/crawler gets contradictory signals depending on which surface they hit first.

The **most current narrative (Narrative B)** lives in:
- `index.html` `<title>`, OG tags, JSON-LD jobTitle
- Hero copy in `src/components/index/hero.html`
- en.json / es.json hero items

The **older narrative (Narrative A)** lives in:
- brand-audit-march-2026.md
- llms.txt / llms-full.txt
- cv-print template hero subtitle
- Possibly other docs

### Sitemap.xml vs reality

**Listed in sitemap.xml:**
```
https://portfolio.ibaifernandez.com/                              [✓ active]
https://portfolio.ibaifernandez.com/debtracker.html               [✗ REDIRECTS]
https://portfolio.ibaifernandez.com/gymtracker.html               [✗ REDIRECTS]
https://portfolio.ibaifernandez.com/lfi.html                      [✓ active]
https://portfolio.ibaifernandez.com/ruta-de-la-digitalizacion...  [✓ active]
https://portfolio.ibaifernandez.com/portfolio-ibaifernandez.html  [✗ REDIRECTS]
https://portfolio.ibaifernandez.com/my-board.html                 [✗ REDIRECTS]
https://portfolio.ibaifernandez.com/the-research-engine.html      [✗ REDIRECTS]
https://portfolio.ibaifernandez.com/elm-st.html                   [✓ active]
https://portfolio.ibaifernandez.com/aglaya.html                   [✓ active]
```

**Missing from sitemap.xml:** `cv-print.html` (correct — it's `noindex,nofollow`). But other indexable URLs?

### Robots.txt

```
User-agent: *
Disallow: /ajax.php
Disallow: /lfi-legacy.html
Allow: /
Sitemap: https://portfolio.ibaifernandez.com/sitemap.xml
```

`/ajax.php` no longer exists (308-redirects to `/.netlify/functions/contact`). Harmless but obsolete.
`/lfi-legacy.html` is correct — it's a private archive.

### JSON-LD vs reality

`index.html:68`:
```json
"image": "https://portfolio.ibaifernandez.com/assets/images/ibai-fernandez-1.jpg"
```
That file **does not exist** (renamed). Structured data serves 404. Same issue in `scripts/build/renderers.mjs:43` for all dossier pages.

`index.html:69`:
```json
"jobTitle": "AI Product Engineer · Founder-Operator at AGLAYA"
```
✓ Matches current narrative.

### OG / Twitter cards

`index.html:14-27`:
- OG image: `assets/images/240610-featured-image.jpeg` — **96 KB JPEG**. Verify it's still on-brand. Filename "240610" suggests June 10, 2024.
- OG description aligns with current narrative ✓

---

## Recommendations (prioritized)

1. **Regenerate `sitemap.xml`** from `content/projects.json` during build. Drop the 5 retired URLs. Spawn task: add a `scripts/build/sitemap.mjs`.
2. **Regenerate `llms.txt` and `llms-full.txt`** from a single source. Update product descriptions to match Narrative B (RegTech via Scanner 21.179, Kanban Desk, Outreach, Pulse, Web).
3. **Fix the broken JSON-LD image** in `index.html:68` and `scripts/build/renderers.mjs:43`. Use `ibai-fernandez-1x1-sidebar.jpeg`.
4. **Archive `brand-audit-march-2026.md`** to `docs/brand-and-strategy/.archived/` with a clear deprecation header. Write a `brand-audit-narrative-b-2026-05.md` reflecting the new positioning.
5. **Update `docs/ROADMAP.md`** to reflect the actual current state: 4 active dossiers, hero rebuild closed, etc. Stamp it with `2026-05-22`.
6. **Sync `docs/SECURITY.md`** with reality: still pending CSP enforce, but list new items (broken JSON-LD image, missing HSTS, missing CORS).
7. **Move 6 retired `THREAD-PROMPTS/` files** to `docs/THREAD-PROMPTS/.archived/`. Update AGENTS.md doc index accordingly.
8. **Update `cv-print.template.html`** hero subtitle from "Full-Stack Automation Architect | Revenue Engineering | Systemic Integrator" to match Narrative B.
9. **Add a CI step** that fails if any of `sitemap.xml`, `llms.txt`, `llms-full.txt` reference a URL that's not in `content/projects.json` or the base allowlist.
10. **Add a documentation policy** in AGENTS.md: any narrative change must update docs/ROADMAP.md AND brand-audit AND llms.txt within the same PR.

---

*End of documentation audit.*
