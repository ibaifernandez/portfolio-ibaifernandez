# Mariana Trench Audit — portfolio-ibaifernandez

- **Date:** 2026-06-05 (UTC) · **HEAD:** `3faadfb` · **Mode:** `report` (no fixes applied)
- **Stack archetype:** Static vitrina — Node build system (`scripts/build/*.mjs`), Netlify hosting, **one** serverless function (`netlify/functions/contact.js` → Resend), no database, no auth, bilingual (EN/ES) via client-side `translate.js`.
- **Method:** graphify-first, evidence-gated. 10 dimensions audited in parallel by isolated agents; every CRITICAL/HIGH adversarially refuted; full regression delta vs the May 22 audit (`docs/audits/marianas/`).
- **Prior audit:** `docs/audits/marianas/` (2026-05-22, commit `1cabf77`). This run is a **delta**, not a fresh baseline.

---

## Executive summary

**84 findings · 0 CRITICAL · 0 HIGH · 25 MEDIUM · 32 LOW · 27 INFO.**

The single HIGH the audit surfaced (`SEO-OG-01` — 3 of 4 dossiers ship with no `og:image`) was **adversarially downgraded to MEDIUM**: the evidence holds exactly (proven by absence on disk and in source), but on a static portfolio with no auth/DB/PII it degrades social share thumbnails — a marketing defect, not a crawlability, indexing, or security failure. After verification, **nothing in this repo rises to CRITICAL or HIGH**. For a public vitrina with a tiny attack surface (one rate-limit-less contact function is the only runtime endpoint), that is the expected and healthy outcome.

Evidence quality is strong across all four phases: **76 PROVEN / 4 SUSPECTED / 8 UNVERIFIABLE** (90% PROVEN). The UNVERIFIABLE items are honest — Core Web Vitals (needs Lighthouse vs deploy), GA4 dashboard retention setting, Netlify auto-publish state, and bilingual-URL indexing (needs live crawl). The enforcement gate dropped nothing for lack of evidence; every finding cites a file:line, a command + output, or a graph node.

### What is genuinely good (verified positives, not assumed)
- **GA4 consent is compliant** (`L-PRIV-06`): denied-by-default Consent Mode v2, prior consent, `anonymize_ip`, no pre-consent cookies or hits. The exact gap that was a P0 in May (GA4 with no banner/policy) is **resolved**.
- **No committed secrets, clean git history, zero CVEs** across the full dependency tree (`B-SECRET-01`, `B-SUPPLY-01`, `D-AUDIT-01`); lockfile committed and consistent (`D-LOCK-01`).
- **Python claim-checker is injection/ReDoS-safe** (`B-PY-01`); no `alert()/confirm()` anti-patterns anywhere (`UX-FORM-03`); contact form has a complete, accessible, announced submit state machine (`UX-FORM-02`).
- **i18n parity is clean** — 1163 keys each direction, zero drift (`A-ARCH-07`); cookie-consent UX is non-dark-patterned (`UX-COOKIE-01`); palette meets AA contrast (`A-A11Y-07`).
- Strong perf baseline: AVIF/WebP coverage passing, all JS deferred, GA4 lazy, fonts self-hosted, LCP image preloaded (`P-PERF-07`).

### Regression delta vs May 22 — `19 resolved · 10 persisting · 64 new · 6 regressed`
The **entire dossier set turned over** since May (the old `lfi.html`/`elm-st.html`/`aglaya.html`/`ruta-*` pages are gone; the 4 current dossiers are scanner/crm/kanban/outreach). That turnover drives most of the delta:
- **19 RESOLVED** — CSP now enforced (was Report-Only), HSTS added, JSON-LD broken-image fixed, GA4 consent shipped, missing i18n keys added, sitemap/llms regenerated, cPanel/secrets artifacts deleted, LCP preload added, cyan-contrast fixed.
- **6 REGRESSED** — fixes that did **not survive the dossier turnover**: dossier `hreflang` re-lost, sitemap/page hreflang mismatch reintroduced, perf-budget coverage lost on `404.html`/`lfi-legacy.html`, sidebar-icon a11y name + `aria-expanded` re-broken, CSP hash pipeline left fragile. **This is the headline lesson: per-dossier fixes applied to the old pages were not re-applied when the new dossiers were authored.** The structural fix (shared dossier head partial — `A-DEBT-05`) would stop this recurring.
- **10 PERSISTING** — chronic items: contact rate-limit absent, `style-src 'unsafe-inline'`, no COOP/COEP, npm-audit non-blocking in CI, doc-drift, residual i18n orphans, dossier test gap.

---

## Priority shortlist (the 23 actionable MEDIUMs, themed)

Severities are calibrated for a static vitrina — none is an emergency. Grouped by the cheapest path to the most value.

**1. Dossier shareability + structured data (the portfolio's primary sales asset).** `SEO-OG-01` (3 dossiers no `og:image`/`twitter:image` → blank LinkedIn/X/Slack cards) · `SEO-LD-01` (dossiers emit zero JSON-LD) · `A-ARCH-02` (renderers *compute* the JSON-LD then the static templates discard it — the data is already built, just not landed). Fixing `A-ARCH-02`'s template placeholders closes `SEO-LD-01` for free. → A "founder who codes" dossier with a blank share card undercuts the pitch.

**2. Build-system footguns (the class that already bit this repo).** `A-DEBT-04` (a missing `template` field silently routes a project to the bare scaffold and overwrites a real page — *this is the exact bug from the Outreach integration*) · `A-ARCH-01` (all 4 dossiers rendered + written twice per build, conflicting data sources) · `B-CSP-01` (CSP hash-injection regex fails *open* if `script-src` is ever renamed). All effort-S/M, all "fail loud instead of silently wrong."

**3. Contact function hardening (the only runtime surface).** `B-FUNC-01` (no rate limit → email-bomb / Resend cost abuse) · `B-FUNC-02` (captcha fail-open when env unset) · `D-OUTDATED-01` (`resend` 2 majors behind, and it processes untrusted POST bodies). Input sanitization is sound today; these are defense-in-depth + a deliberate dep bump.

**4. The claim-check gate is not enforced where it matters.** `D-TEST-01` / `A-OPS-02`: the dossier fact-check (`dossier-claim-check.py`) runs **only** in an optional local pre-commit hook, is `DOSSIER_CHECK_SKIP=1`-bypassable, and has **no CI backstop**. Given the standing rule to never bypass this gate, it should run server-side in CI so a contributor who never installed the hook can't ship unverified numeric claims. `D-DOC-03` (it's undocumented in README/AGENTS) compounds this.

**5. Conversion-moment i18n.** `UX-FORM-01`: a Spanish visitor gets a fully Spanish page but **English** contact-form error/success messages — jarring at the highest-intent moment.

**6. Performance first-paint.** `P-PERF-04` (~333 KB render-blocking CSS, full Bootstrap on a custom design — biggest LCP lever) · `P-PERF-03` (font `immutable` cache header points at a non-existent `/assets/webfonts/*`; real fonts get only the weak catch-all) · `P-PERF-01` (a declared AVIF source 404s).

**7. Privacy-policy completeness.** `L-PRIV-01` (no Art.6 legal basis per purpose) · `L-PRIV-02` (no retention period for contact email / GA4) · `L-PRIV-05` ("you acknowledge these transfers" is not a valid Chap.V transfer mechanism). All effort-S copy edits to `privacy.template.html` + mirrored i18n keys.

**8. Doc drift.** `D-DOC-01` (README/AGENTS list a dossier set that no longer exists on disk). Replace the hardcoded list with a pointer to `content/projects.json` so it can't re-drift.

**A11y quick wins (MEDIUM, effort-S):** `A-A11Y-03` (sidebar icon-links have no accessible name) · `A-A11Y-04` (disclosure toggle never sets `aria-expanded`) · `A-A11Y-05` (translate button is a bare `<img>`, keyboard/role only after JS).

---

## Task #18 — orphan template cleanup (paired with this audit)

`A-DEBT-03` resolves the open question with a concrete plan:
- **`src/pages/project.template.html`** — truly orphaned, BUT it is the silent fallback at `renderers.mjs:407` (`page.template || 'src/pages/project.template.html'`). Deleting it without removing the fallback turns a template typo into a crash. **Either** delete the file *and* the fallback (forcing explicit templates — pairs with `A-DEBT-04`), **or** keep it and document it as the canonical scaffold.
- **The 10 `project-*` / `lfi` templates** are referenced by `content/projects.archived.json` and drive retirement/redirect bookkeeping (`static-server.mjs` legacy redirects). They are dead-for-build but **load-bearing for archive tracking**. Move them to `src/pages/archived/` rather than deleting, so the orphan lint stops flagging them and intent is explicit. Their i18n keys are most of the 101 orphans (`A-DEBT-06`) — purge those only *after* formally retiring the templates.

---

## Phase reports & evidence dashboards

| Phase | Scope | Findings | M / L / INFO | PROVEN |
|---|---|---|---|---|
| [A](audit-A.md) | A11y · Usability · Performance · SEO | 35 | 10 / 11 / 14 | 34/35 |
| [B](audit-B.md) | Build-sec · Deps · Architecture | 24 | 6 / 8 / 10 | 21/24 |
| [C](audit-C.md) | Legal / Privacy | 9 | 3 / 4 / 2 | 8/9 |
| [D](audit-D.md) | Ops · Docs · Testing | 16 | 6 / 9 / 1 | 17/16* |

\* Phase D counts dashboards across two agents (Ops + Docs); see [audit-D.md](audit-D.md) for the per-agent split.

- **Full machine-readable findings:** [`findings.json`](findings.json)
- **Regression delta vs May 22:** [`regression-delta.md`](regression-delta.md)
- **Resume / state:** [`state.json`](state.json)

---

## Scope matrix (Phase 0)

| # | Dimension | Status | Reason |
|---|---|---|---|
| 1 | Security | PARTIAL | No backend/DB/auth. Surface = 1 Netlify function + build scripts + supply chain. Audited as Phase B. |
| 2 | Accessibility WCAG 2.1 AA | YES | Full — public bilingual UI. |
| 3 | Usability | YES | Full. |
| 4 | Performance | PARTIAL | Static signals audited; Core Web Vitals UNVERIFIABLE without deploy/Lighthouse. |
| 5 | Databases | N/A | No database. |
| 6 | Technical SEO | YES | Public indexable site. |
| 7 | Architecture + tech debt | YES | Build system + templates + i18n. |
| 8 | Legal compliance | YES | Public site loads GA4 + collects contact-form PII → GDPR + Ley 21.719 + ePrivacy apply. |
| 9 | Cookies + consent | YES | Folded into Phase C (consent banner present). |
| 10 | Data retention + DPA | PARTIAL | Retention audited (`L-PRIV-02`); no DPA registry expected for a personal portfolio. |
| 11 | DevOps / CI | YES | `ci.yml` + `link-health.yml` + Netlify. |
| 12 | Deployment + Observability | PARTIAL | Headers/CSP audited; deploy gating + rollback partly UNVERIFIABLE (Netlify UI). |
| 13 | Docs + maintainability | YES | Full. |

---

## How to act on this report

This is `report` mode — **no files were changed**. Remediation should happen in separate, gated sessions (each change re-runs the pre-commit chain: `build:pages --check` → `check-i18n` → `dossier-claim-check`). Suggested batching: theme 1+2 (dossier SEO + build footguns) first since they interlock and are the highest-value/lowest-effort; theme 4 (claim-check → CI) next as it protects every future dossier; the rest opportunistically.
