# THREAD-ORCHESTRATION.md — Parallel Work Model For The Final Portfolio Push

**Last updated:** 2026-03-16  
**Purpose:** Define the 13-thread execution model used to finish the portfolio without context overload, styling collisions, or shared-file drift.

---

## 1. Why This Exists

The portfolio has reached a stage where dossier-level work is too detailed, too visual, and too editorial to handle efficiently inside a single ever-growing thread.

The solution is:

1. one coordination thread for shared rules and shared files,
2. one thread per dossier,
3. one thread for homepage editorial,
4. one thread for technical consolidation.

This document is the source of truth for:

- which threads exist,
- what each thread owns,
- what each thread must not touch,
- shared naming and CSS conventions,
- and the exit checklist for a dossier-ready handoff.

All threads also inherit:

- `docs/PARALLEL-SAFETY-BASELINE.md`

---

## 2. The 13 Threads

| # | Thread | Scope | Status |
|---|---|---|---|
| 01 | Master Coordination | Shared rules, naming, CSS convention, shared docs/files, conflict resolution | Active |
| 02 | DebTracker Dossier | Narrative, structure, visual identity, local CSS, assets, local metadata | Archived reference |
| 03 | GymTracker Dossier | Narrative, structure, visual identity, local CSS, assets, local metadata | Archived reference |
| 04 | LFi Dossier | Narrative, structure, visual identity, local CSS, assets, local metadata | Active |
| 05 | Route to Digitalization / 2x2MKT Dossier | Narrative, structure, visual identity, local CSS, assets, local metadata | Active |
| 06 | Portfolio Ibai Fernandez Dossier | Narrative, structure, visual identity, local CSS, assets, local metadata | Archived reference |
| 07 | MyBoard Dossier | Narrative, structure, visual identity, local CSS, assets, local metadata | Archived reference |
| 08 | The Research Engine Dossier | Narrative, structure, visual identity, local CSS, assets, local metadata | Archived reference |
| 09 | Elm St Dossier | Narrative, structure, visual identity, local CSS, assets, local metadata | Active |
| 10 | AGLAYA Dossier | Narrative, structure, visual identity, local CSS, assets, local metadata | Active |
| 11 | Brevo Intelligence Layer Dossier | Former public dossier for Ibai's Brevo diagnostic/reporting solution, now retained only as archived reference | Archived reference |
| 12 | Homepage Editorial | Home narrative, section hierarchy, card messaging, directional clarity | Active |
| 13 | Technical Consolidation | Performance, accessibility, translations, testing, sitemap, metadata global, Search Console/Bing | Active |

---

## 3. Simple Rules To Avoid Thread Conflicts

These rules are mandatory.

### 3.1 Dossier Thread Ownership

Each dossier thread may touch only:

- its source template,
- its local dossier CSS,
- its dossier-specific assets,
- and, if needed, its own card copy / metadata handoff when the moment comes.

### 3.2 Shared Files Are Reserved By Default

The following shared files are reserved for the master coordination thread or the technical consolidation thread unless this document explicitly assigns a homepage-facing exception:

- `content/projects.json`
- `README.md`
- `AGENTS.md`
- `docs/ROADMAP.md`
- `docs/BACKLOG.md`
- `docs/ENGINEERING-CHANGELOG.md`
- `docs/ENGINEERING-RUNBOOK.md`
- `robots.txt`
- `sitemap.xml`
- `llms.txt`
- `llms-full.txt`
- `netlify.toml`
- `playwright.config.js`
- shared test config / shared build config / shared routing config

### 3.3 No Dossier Thread Edits Another Dossier

A dossier thread must not edit:

- another project's template,
- another project's CSS,
- another project's assets,
- or global shared styling except through the master / technical threads.

### 3.4 Shared Changes Must Be Escalated

If a dossier thread discovers that it needs a shared-file change, it should:

1. make the change request explicit,
2. describe the dependency,
3. hand that request to the master coordination thread or technical consolidation thread.

### 3.5 Archived Brevo / Norden Narrative Contract

The former Norden dossier previously lived publicly as **Brevo Intelligence Layer**.

It is no longer part of the active public portfolio surface.

Its narrative contract remains split:

- inside the LFi dossier, Norden appears only as a client proof case under LFi
- inside the archived Brevo Intelligence Layer material, the focus shifts to the tool itself: diagnosis, reporting architecture, cohort logic, delivery surfaces, and sovereignty-first handoff

That means:

- the LFi thread owns commercial, client, and career framing
- the archived Brevo Intelligence Layer materials own solution, tooling, reporting, and product framing
- the Norden workspace remains a read-only evidence base, not the front-stage public story

Do not reactivate that dossier publicly unless a future decision explicitly restores it to `content/projects.json`.

### 3.6 Homepage Editorial Owns Home-Facing Copy, Not Global Runtime

The homepage editorial thread may touch only:

- `src/pages/index.template.html`
- `src/components/index/**`
- `content/ctas.json`
- `content/services.json`
- `content/testimonials.json`
- `content/experience.json`
- `content/training.json`
- `content/projects.json` when the change is strictly homepage-facing card/title/description handoff
- `en.json` and `es.json` when needed to keep homepage copy aligned across languages

The homepage editorial thread must not silently take ownership of:

- dossier templates
- dossier-local CSS
- dossier-local assets
- `assets/css/style.css` for broad refactors
- `assets/js/custom.js`
- `assets/js/translate.js`
- build/test/runtime/config files

If a homepage change needs shared CSS, JS, translation-runtime, build-pipeline, or infrastructure work, it must be escalated to the master coordination thread or the technical consolidation thread instead of being absorbed silently by the homepage thread.

### 3.7 Technical Consolidation Owns Shared Technical Surface

The technical-consolidation thread owns the cross-site technical layer, including:

- `assets/css/style.css`
- `assets/js/custom.js`
- `assets/js/translate.js`
- `en.json` and `es.json` when the change is runtime-wide or shared across public pages
- `scripts/*.mjs`
- `scripts/*.sh`
- `tests/**`
- `playwright.config.js`
- `.github/workflows/*.yml`
- `netlify/functions/contact.js`
- `netlify.toml`
- `robots.txt`
- `sitemap.xml`
- `llms.txt`
- `llms-full.txt`
- technical contract docs when runtime behavior changes

The technical-consolidation thread may also touch `src/pages/*.template.html` and `src/components/**` only when the change is clearly shared and technical:

- accessibility hooks
- translation wiring
- metadata alignment
- shared analytics/runtime plumbing
- form contract updates
- shared navigation semantics

It must not use those files as a back door for dossier redesign, homepage editorial rewriting, or project-specific storytelling changes.

---

## 4. Canonical Public Slugs

These are the currently active public dossier identities that other docs and prompts should use.

| Dossier | Public slug | Public URL |
|---|---|---|
| LFi | `lfi` | `/lfi.html` |
| Route to Digitalization / 2x2MKT | `ruta-de-la-digitalizacion-y-2x2-mkt` | `/ruta-de-la-digitalizacion-y-2x2-mkt.html` |
| Elm St | `elm-st` | `/elm-st.html` |
| AGLAYA | `aglaya` | `/aglaya.html` |

Archived dossier slugs retained in-repo but outside the active public surface:

| Dossier | Archived slug | Current public behavior |
|---|---|---|
| DebTracker | `debtracker` | Redirects to `/#project_sec` |
| GymTracker | `gymtracker` | Redirects to `/#project_sec` |
| Portfolio Ibai Fernandez | `portfolio-ibaifernandez` | Redirects to `/#project_sec` |
| MyBoard | `my-board` | Redirects to `/#project_sec` |
| The Research Engine | `the-research-engine` | Redirects to `/#project_sec` |
| Brevo Intelligence Layer | `brevo-intelligence-layer` | Redirects to `/#project_sec` |

---

## 5. Current Source-Of-Truth Mapping

Public slugs are canonical for the active surface. Source template filenames may remain legacy-shaped until a thread intentionally migrates them.

Active public catalog:

| Dossier | Current source template | Planned local CSS |
|---|---|---|
| LFi | `src/pages/lfi.template.html` | `assets/css/dossiers/lfi.css` |
| Route to Digitalization / 2x2MKT | `src/pages/project-ruta-digitalizacion-2x2mkt.template.html` | `assets/css/dossiers/ruta-de-la-digitalizacion-y-2x2-mkt.css` |
| Elm St | `src/pages/project-elm-st.template.html` | `assets/css/dossiers/elm-st.css` |
| AGLAYA | `src/pages/project-aglaya.template.html` | `assets/css/dossiers/aglaya.css` |

Archived local catalog:

| Dossier | Preserved source template | Local CSS / notes |
|---|---|---|
| DebTracker | `src/pages/project-debtracker.template.html` | `assets/css/dossiers/debtracker.css` planned; archive-only for now |
| GymTracker | `src/pages/project-gymtracker.template.html` | `assets/css/dossiers/gymtracker.css` exists; archive-only for now |
| Portfolio Ibai Fernandez | `src/pages/project-portfolio-ibaifernandez.template.html` | `assets/css/dossiers/portfolio-ibaifernandez.css` planned; archive-only for now |
| MyBoard | `src/pages/project-myboard.template.html` | `assets/css/dossiers/my-board.css` planned; archive-only for now |
| The Research Engine | `src/pages/project-the-research-engine.template.html` | `assets/css/dossiers/the-research-engine.css` planned; archive-only for now |
| Brevo Intelligence Layer | `src/pages/project-brevo-intelligence-layer.template.html` | `assets/css/dossiers/brevo-intelligence-layer.css`; archive-only for now |

### Naming Rule

- Public-facing identity is always the normalized slug.
- Prompt, metadata, QA notes, and routing references should use the slug first.
- Source template filenames can be migrated later if and when the owner thread chooses to normalize them.

### Current audited exceptions and transitions

- LFi already ships through `assets/css/dossiers/lfi.css`, but it still retains a shared `.lfi_dossier_*` residue inside `assets/css/style.css`.
- Its thread should treat dossier-local CSS as the active surface while leaving the remaining shared extraction as deliberate follow-up work, not as something already complete.
- Route to Digitalization / 2x2MKT already has page-local CSS in `assets/css/national-route.css`.
- Its thread should treat migration toward `assets/css/dossiers/ruta-de-la-digitalizacion-y-2x2-mkt.css` as convention-alignment work, not as first-time isolation.
- Elm St already has dossier-specific selectors living in `assets/css/style.css` under `.elmst_dossier_*`.
- Its thread should treat `assets/css/dossiers/elm-st.css` as active migration work, not as an optional future cleanup.
- AGLAYA already has dossier-specific selectors living in `assets/css/style.css` under `.aglaya_dossier_*`.
- Its thread should treat `assets/css/dossiers/aglaya.css` as active migration work, not as an optional future cleanup.
- Archived dossiers still leave selector residue and template/assets debt in the repo.
- That debt should be treated as archive maintenance or future reactivation work, not as part of the active public release surface.

---

## 6. CSS Convention For Dossiers

Each dossier should move toward its own local stylesheet.

### Shared base stays shared

The following stay global:

- foundational typography,
- resets,
- Bootstrap and plugin styles,
- shared sidebar / skip-link / floating controls,
- shared utilities that are genuinely cross-site.

### Dossier styling should become local

Each dossier should own:

- hero layout,
- section composition,
- page-specific color system,
- dossier-specific visual modules,
- proof cards,
- timelines,
- charts or pseudo-charts,
- quote walls,
- and any dossier-only layout overrides.

### Target local CSS path

`assets/css/dossiers/<slug>.css`

This convention is now the default assumption for every dossier thread prompt, even if the file does not exist yet.

---

## 7. Editorial Criteria Shared Across Dossiers

These are the common editorial guardrails.

### 7.1 What a dossier must prove

Every dossier should make the reader understand:

1. what problem existed,
2. what Ibai actually designed / built / changed,
3. what system or leverage was created,
4. what proof exists,
5. why that work matters commercially or operationally,
6. and why that makes Ibai hireable.

### 7.2 What a dossier must avoid

- placeholder language visible to the public,
- internal production notes,
- generic SaaS-card repetition,
- empty “pretty but vague” copy,
- proof without context,
- context without proof,
- visual identity that feels copied from another dossier.

### 7.3 Shared visual guardrail

No dossier should default back to:

- generic centered SaaS landing page,
- interchangeable dashboard cards,
- or the same layout system reused with only color changes.

Distinct dossier, distinct compositional logic.

---

## 8. Thread Output Expectations

Each dossier thread should produce:

1. one refined dossier template,
2. one local dossier CSS file or clear migration plan toward it,
3. explicit placeholder / asset map,
4. refined title / description / OG suggestion,
5. note of any shared-file request that must be escalated,
6. and a concise update for `docs/ENGINEERING-CHANGELOG.md` if behavior or structure changed.

---

## 9. Exit Checklist For Any Dossier Thread

A dossier is not “done” just because it looks better.

Before handoff, check:

- [ ] Narrative is coherent and persuasive from top to bottom
- [ ] No internal placeholder language is visible
- [ ] Proof modules are contextualized before metrics appear
- [ ] Visual identity is distinct from other dossiers
- [ ] Layout does not regress into generic SaaS composition
- [ ] Dossier-specific CSS is isolated or clearly isolated-in-progress
- [ ] Metadata intent is documented
- [ ] Shared-file dependencies are explicitly handed off
- [ ] If structural behavior changed, changelog entry is updated

---

## 10. Prompt Generation Status

Prompts will be generated one by one, one iteration at a time.

| Prompt | File | Status |
|---|---|---|
| 01 — Master Coordination | `docs/THREAD-PROMPTS/01-master-coordination.md` | Generated |
| 02 — DebTracker | `docs/THREAD-PROMPTS/02-debtracker.md` | Archived reference |
| 03 — GymTracker | `docs/THREAD-PROMPTS/03-gymtracker.md` | Archived reference |
| 04 — LFi | `docs/THREAD-PROMPTS/04-lfi.md` | Generated |
| 05 — Route to Digitalization / 2x2MKT | `docs/THREAD-PROMPTS/05-ruta-digitalizacion-2x2mkt.md` | Generated |
| 06 — Portfolio Ibai Fernandez | `docs/THREAD-PROMPTS/06-portfolio-ibaifernandez.md` | Archived reference |
| 07 — MyBoard | `docs/THREAD-PROMPTS/07-my-board.md` | Archived reference |
| 08 — The Research Engine | `docs/THREAD-PROMPTS/08-the-research-engine.md` | Archived reference |
| 09 — Elm St | `docs/THREAD-PROMPTS/09-elm-st.md` | Generated |
| 10 — AGLAYA | `docs/THREAD-PROMPTS/10-aglaya.md` | Generated |
| 11 — Norden | `docs/THREAD-PROMPTS/11-norden.md` | Archived reference |
| 12 — Homepage Editorial | `docs/THREAD-PROMPTS/12-homepage-editorial.md` | Generated |
| 13 — Technical Consolidation | `docs/THREAD-PROMPTS/13-technical-consolidation.md` | Generated |

---

## 11. Practical Working Order

The recommended order is:

1. Master coordination prompt
2. LFi prompt
3. Homepage editorial prompt
4. Technical consolidation prompt
5. Remaining dossiers in the order of commercial leverage and visible incompleteness

This order keeps the system stable while still letting visual/content work move in parallel.
