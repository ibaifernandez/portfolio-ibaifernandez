# ROADMAP

**Last updated:** 2026-05-27
**Single source of truth** for project state. If this drifts from reality, fix this file first.

---

## Current state

Production live at https://portfolio.ibaifernandez.com.
Last push to `origin/main`: `196d7ac` (`ROADMAP: close M4 (documentacion-profesional-if never indexed by Google)`).
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
| ★ | About section (Narrative B) | ✅ Done |
| 3 | Six product dossier pages | ← **next (owner picks order)** |
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

---

## Projects grid scaling strategy (decision 2026-05-27)

The portfolio's projects section lives inside the single-page index. We do **not**
need a separate `/proyectos.html` listing page. Growth happens inside the existing
section.

### First-load layout (≤ 5 projects)

- **1 featured card** — full width / two columns. Reserved for the current
  flagship dossier (today: Scanner Ley 21.719).
- **4 regular cards** — one column each, in a 2×2 grid below the featured card.
  Populates with the remaining active dossiers (planned next: Kanban Desk,
  Outreach, CRM AGLAYA, Pulse).

Total visible above the fold of the projects section: **5 cards**.

### Second batch (projects 6–9)

Once a sixth active dossier exists, append a **"Cargar más proyectos"** button
below the 5 first-load cards. Clicking reveals the next batch of up to 4
additional cards, progressively rendered in the same projects section. No page
navigation, no route change — the section grows in place.

The button MUST be:
- Keyboard accessible
- Announce loaded count to assistive tech (aria-live)
- Disappear once all available cards are rendered

### Threshold for auxiliary page (> 9 projects)

When the active portfolio exceeds **9 projects total**, the single-page
"Cargar más" pattern becomes friction. At that point — and only then —
implement an auxiliary listing page (likely `/proyectos.html`) with filters
and sorting. Until that threshold is crossed, the inline pattern is enough.

### Implementation notes (for whenever this gets built)

- Source of truth stays `content/projects.json`.
- First-load 5 cards = first 5 entries in `projects.json` (order = priority).
- Featured card detection: first entry gets `featured: true` flag or implicit
  position-zero treatment in the renderer.
- "Cargar más" reveals entries 6→9 in batches of 4.
- CSS Grid handles featured (col-span-2) vs regular (col-span-1) layout.
- Renderer in `scripts/build/projects-grid.mjs` (or wherever `@render
  projects-grid` is processed) decides what ships server-rendered vs hidden
  behind the button.

### When to revisit this decision

- After Kanban Desk + Outreach + CRM AGLAYA + Pulse land (4 new dossiers).
- At that point the layout will be tested with real content (5 cards live).
- If the visual cap of 5 holds up, ship the "Cargar más" mechanic before
  publishing dossier #6.

---

## Disabled (preserved, not rendered)

Sections currently kept in the codebase but excluded from the public render so we
can revive them without rebuilding from scratch. New agents: do NOT treat these
as orphan code — they are deliberate, paused, and may be re-enabled later.

### Services section — paused 2026-05-25

- **Why:** the 9-card services grid duplicated what Pillars (capability tags) +
  About (prose) + Dossiers (examples) already say. Plus the icons had been
  visually broken since the Font Awesome retirement.
- **Render flip:** `src/pages/index.template.html` (around line 442) has a
  disabled directive `<!-- @include-DISABLED ../components/index/services-section.html -->`.
  The build pipeline's `includePattern` (`<!--\s*@include\s+([^\s]+)\s*-->`)
  does not match `@include-DISABLED`, so the partial is skipped.
- **Re-enable:** change `@include-DISABLED` back to `@include` and rebuild.
- **Preserved assets (do not delete):**
  - `src/components/index/services-section.html` (wrapper)
  - `src/components/index/services-group.html`
  - `src/components/index/service-card.html`
  - `content/services.json` (3 groups × 3 cards)
  - `renderServicesGrid()` in `scripts/build/renderers.mjs` + the
    `'services-grid'` render directive registration
  - `.port_services_setions` CSS rules in `assets/css/style.css`
  - All `services.*` and `service-card.*` related i18n keys in `en.json` / `es.json`
    (currently orphan, intentionally retained)
- **If re-enabled, also revisit:** icon classes still reference `fa fa-…`
  (Font Awesome is retired) → swap to `assets/svg/icons.svg` sprite references,
  or migrate to the chip-card pattern used by Pillars before going live.

### Testimonials section — paused 2026-05-25

- **Why:** sidebar nav already had Testimonials commented out so the section
  had no anchor link, and the existing 8-entry set was mixed (3 recent LFi
  + 5 four-year-old 4Geeks bootcamp). Removing it makes the page lighter
  and less noisy until a curated rewrite (likely 3 LFi only per ROADMAP
  step 5) is ready.
- **Render flip:** `src/pages/index.template.html` (around line 471) has
  `<!-- @include-DISABLED ../components/index/testimonial-section.html -->`.
  Same pattern as Services — the build's `includePattern` does not match
  the suffixed token so the partial is skipped.
- **Re-enable:** change `@include-DISABLED` back to `@include` and rebuild.
- **Preserved assets (do not delete):**
  - `src/components/index/testimonial-section.html` (full section wrapper —
    extracted from the inline block at the time of pause)
  - `src/components/index/testimonial-slide.html` (per-entry slide template)
  - `content/testimonials.json` (8 entries)
  - `renderTestimonialsSlides()` in `scripts/build/renderers.mjs` + the
    `'testimonials-slides'` render directive registration
  - `.port_testimonial_setions` / `.testimonial_section` CSS rules in
    `assets/css/style.css`
  - All testimonial-related i18n keys (recommendation copies per person)
  - Swiper plugin lazy-load remains wired in `assets/js/custom.js` for
    `.swiper-container` so the carousel works on re-enable without extra
    work (other Swiper consumers — responsors slider — keep the plugin
    pulled in regardless).
- **If re-enabled, also revisit:** ROADMAP step 5 — curate down to the 3
  LFi entries (Franco Ogaz Palma, Fernanda Muñoz Onetto, Bani Barranco),
  archive the 5 4Geeks bootcamp entries, and consider replacing the
  Swiper carousel with a static 3-column grid (drops a jQuery plugin and
  reads faster on mobile).

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

### Shipped on 2026-05-23 (About section rebuild, post-`196d7ac`)

- ✅ About section rewritten in Narrative B prose: 4 blocks (Who I Am / What I Do / How I Work / How I Build), SEO-oriented but user-friendly, EN + ES lockstep
- ✅ Identity card refactored from passport-frame to operator signals: dropped YOB, Phone, Personal Website fields; updated to `Remote from · Belo Horizonte, Minas Gerais, Brazil 🇧🇷` + `E-mail` + `Nationality · Spanish (EU citizen)` + `Open to · AI Product Engineer & Founding Engineer roles · 100% remote`
- ✅ `ps_designation` simplified to "AI Product Engineer" (mirrors hero), translate attribute dropped (technical term, no i18n needed)
- ✅ Section sub-heading + H2 + closing reframed:
   - `About Ibai Fernández` / `Sobre Ibai Fernández`
   - `More than two decades shipping narrative, marketing, and code.` / `Más de dos décadas entregando narrativa, marketing y código.`
   - `Want to know more about me? Keep reading or let's talk.` / `¿Quieres saber más sobre mí? Sigue leyendo o hablemos.`
- ✅ i18n cleanup: deleted 21 orphan Narrative-A keys (`global-experience`, `a-whole-new-kind-of-monster`, `genuinely-digital`, `knowledge-seeker`, `4geeks-alumnus`, `communication-maven`, `tech-savvy-people-centric`, `entrepreneurial-spirit`, their descriptors, `craftsman-of-digital-experiences`, `yob`, `current-location`, `personal-website`, `front-end-mkt-comms-creativity`); added 13 new keys (`remote-from`, `location-value`, `open-to`, `open-to-value`, `about-{who-i-am,what-i-do,how-i-work,how-i-build}-{heading,body}`, `about-closing-cta`); kept `phone` (still used by `src/components/index/footer.html`). Final state: 515 keys EN + ES, parity green
- ✅ Added 3 minimal CSS rules (`.about_block`, `.about_block_heading`, `.about_block_body`) — no inline styles introduced, design tokens reused
- ✅ Regenerated visual baseline `tests/e2e/visual.spec.js-snapshots/logos-section.png` (1px height shift downstream of the new About content; content unchanged)
- ✅ Full test pass: build + quality + smoke + 52/52 e2e

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
