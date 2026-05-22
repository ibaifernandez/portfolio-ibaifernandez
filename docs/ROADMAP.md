# ROADMAP.md — Current State, Release Path, and Next Work

**Last updated:** 2026-05-22
**Purpose:** Single source of truth for where the project is now and what remains.

---

## 1. Current State

The portfolio is **shipped and in active iteration** under Narrative B.

What is true today:

- Platform: Netlify CDN + GitHub Actions + Netlify Function + Resend. Stable.
- `main` is the deploy branch; CI gates deploy on green tests.
- Production contact flow validated end to end with Turnstile.
- GA4 Realtime confirms `page_view`, `contact_submit_attempt`, `contact_submit_success`, `language_change`.
- Playwright suite: 29/29 green.
- Quality guards (`tests/quality-guards.sh`) green.
- **Hero rebuilt (Paso 2 of 8-step plan):** Narrative B locked.
  - "AI Product Engineer · Founder-Operator"
  - Eyebrow: "Product Design & Development · AI Orchestration · Deploy & Deliver" (EN)
  - 5-item typing rotation: Scanner 21.179 / Kanban Desk / Outreach / Pulse / Web / open-source AI tooling.
- **Marianas audit run (2026-05-22):** 152 findings across 8 dimensions in `docs/audits/marianas/`. Batches 1-N being executed.
- **Public dossier surface trimmed to 4:** LFi, Ruta, Elm St, AGLAYA. Others archived (308-redirect to `/#project_sec`).
- **Discovery surface aligned (Batch 2 of Marianas):** sitemap.xml, llms.txt, llms-full.txt auto-generated from `content/projects.json`. No more stale URLs.
- **Brand docs aligned:** `brand-audit-march-2026.md` archived as Narrative A; new `brand-audit-narrative-b-2026-05.md` is the active reference.

PageSpeed snapshot (last full capture; needs re-capture post-hero-rebuild):

| Area | Last measured |
|---|---|
| Desktop PageSpeed | `93 / 95 / 96 / 92` (Mar 2026) |
| Mobile PageSpeed  | `62 / 95 / 92 / 92` (Mar 2026) |
| Mobile LCP        | `7.6s` — hero rebuild added animation; needs re-measurement |
| CLS               | `0.004` |

---

## 2. What Just Shipped (May 2026)

### Paso 2 — Hero rebuild
- Hero section rebuilt end-to-end. New copy, CSS tokens, paper-style CTA lockup, canvas dot-grid background.
- Mobile responsive fixes for 4 legacy CSS bombs.
- Eyebrow split into i18n-aware spans for clean mobile line-breaks.
- Josefin Sans applied to `banner_name` for typographic unity.

### Marianas audit — Batch 1
- JSON-LD person `image` fixed (was 404).
- HSTS header added (`max-age=63072000; includeSubDomains; preload`).
- Permissions-Policy extended (`interest-cohort`, `payment`, `usb` opted out).
- hreflang annotations added across all public templates.
- Missing i18n keys added (`contactar`, `read-more`).
- Orphan typo keys removed (4 keys + 3 comment markers).
- cPanel legacy artifacts deleted (`.cpanel.yml`, `.htaccess`, `config/secrets.example.php`).
- `docs/error-logs/` gitignored + untracked.

### Marianas audit — Batch 2
- `sitemap.xml`, `llms.txt`, `llms-full.txt` regenerated with current narrative + active dossier set only.
- `scripts/build/sitemap.mjs` added: discovery files derive from `content/projects.json` on every build.
- Old `brand-audit-march-2026.md` archived to `docs/brand-and-strategy/.archived/`.
- New `brand-audit-narrative-b-2026-05.md` written as active brand reference.

---

## 3. What Remains (in priority order)

### Marianas — pending batches

- **Batch 3 — CSP enforce + privacy posture:** nonce inline scripts, promote CSP to enforce, cookie consent banner, /privacy page.
- **Batch 4 — i18n hygiene:** localize `<title>` + meta tags; respect `navigator.language`; purge 198 orphan keys; CI guard for parity.
- **Batch 5 — Tests refactor + dossier coverage:** dossier page specs (axe + language + CTA), refactor brittle assertions, perf budget for dossiers, pre-commit hook.
- **Batch 6 — Performance pass:** terser+csso minifier, content-hash fingerprinting, preload LCP image, inline critical CSS, drop Font Awesome.

See `docs/audits/marianas/EXECUTION-LOG.md` for live status.

### 8-step Narrative B plan — remaining steps

- **Paso 3:** 6 new product case pages (aglaya-kanban-desk, aglaya-outreach, legal-reg-tech / Scanner 21.179, solos, notebooklm-skill, Massiva Pulse). One dossier per Currently Shipping item.
- **Paso 4:** Employment section → rename to "Career path" secondary section.
- **Paso 5:** Testimonials cleanup (keep 3 LFi, archive 5 bootcamp).
- **Paso 6:** Add PMI-ACP 2024 to training.json.
- **Paso 7:** Services section decision — eliminate or rename to "Capabilities".
- **Paso 8:** Full QA pass (Lighthouse, Playwright, smoke, links).

### Off-portfolio channel alignment

- LinkedIn headline + About → Narrative B (see `docs/brand-and-strategy/brand-audit-narrative-b-2026-05.md`).
- GitHub README opener → Narrative B.

---

## 4. Document Roles

To avoid drift, use each document for one job only:

- `docs/ROADMAP.md` — current state + what remains (this file).
- `docs/BACKLOG.md` — active work only.
- `docs/ENGINEERING-RUNBOOK.md` — operational procedures.
- `docs/ENGINEERING-CHANGELOG.md` — historical technical record.
- `docs/PRD.md` — product specification.
- `docs/audits/marianas/` — current deep audit + execution log.
- `docs/brand-and-strategy/brand-audit-narrative-b-2026-05.md` — current brand reference.

---

*End of ROADMAP. Status: shipped, iterating under Narrative B, Marianas execution in flight.*
