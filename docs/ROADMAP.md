# ROADMAP.md — Current State, Release Path, and Next Work

**Last updated:** 2026-03-03
**Purpose:** This is the single source of truth for where the project came from, where it is now, and what still remains.

---

## 1. Current State

The portfolio is in a late pre-release state.

What is already true:

- The platform migration is complete: Netlify CDN + GitHub Actions + Netlify Function + Resend.
- `main` is aligned with `origin/main`.
- The production contact flow is validated end to end.
- GA4 Realtime already confirms `page_view`, `contact_submit_attempt`, and `contact_submit_success`.
- Playwright is green (`29/29`).
- Desktop PageSpeed is in a strong release band.
- Mobile is usable and materially improved, but still has LCP headroom.
- The public project roster is already live as 8 dossiers:
  - DebTracker
  - GymTracker
  - LFi
  - The Route to Digitalization / 2x2MKT
  - Portfolio Ibai Fernandez
  - MyBoard
  - Elm St
  - AGLAYA

Current measured snapshot:

| Area | Current state |
|---|---|
| Desktop PageSpeed | `93 / 95 / 96 / 92` |
| Mobile PageSpeed | `62 / 95 / 92 / 92` |
| Mobile bottleneck | `FCP 4.7s`, `LCP 7.6s` |
| CLS | `0.004` |
| Automated release gate | `29/29` Playwright + `test:quality` green |
| Contact form | Validated in production |
| Turnstile | Configured and validated in production |
| GA4 Realtime | Validated in production |

---

## 2. Where We Came From

The technical foundation is already closed.

### Closed foundation work

- **Phase 0-4:** quality/security base, performance/media pipeline, componentization, CI/CD, accessibility hardening.
- **Phase 5:** migration from cPanel/PHP to Netlify/Node.
- **Phase 5.2:** heading hierarchy + color contrast.
- **Phase 5.3:** CSS/JS minification.
- **Phase 5.4:** AVIF/WebP coverage across all generated pages.
- **Phase 5.5:** production verification and PageSpeed re-capture.

### Closed content-system work

- The old generic project stubs have been replaced by real dossiers for:
  - LFi
  - Portfolio
  - MyBoard
  - Elm St
  - AGLAYA
- The 2x2 route already has a normalized public slug.
- The obsolete LFi newspaper presentation is retired.

This means the project is no longer waiting on foundational engineering. The remaining work is release hygiene, documentation clarity, and final content polish.

---

## 3. What Still Remains

Only open work belongs here. Historical detail lives in `docs/ENGINEERING-CHANGELOG.md`.

### A. Release-adjacent work

- **Manual QA (recommended, currently deferred by owner):**
  - Desktop checklist
  - Mobile checklist
- **Search visibility (manual external actions):**
  - Google Search Console property verification
  - Bing Webmaster Tools property verification
  - `sitemap.xml` submission
- **Release administration (explicitly deferred for now):**
  - release tag `v2.0.0.0`

### B. Content work that still matters for launch

- Final polish of project dossiers where placeholders remain:
  - Portfolio
  - MyBoard
  - Elm St
  - AGLAYA
- Public slug normalization beyond `2x2MKT`
- SEO metadata pass (titles, descriptions, OG refinement where needed)
- Blog removal / permanent retirement before indexing (the current product decision is: **this portfolio will not have a blog**)

### C. Security / hardening still open

- **CSP stays in report-only for v2.0.0.0.**
  - Decision: do **not** promote to enforce yet.
  - Reason: the site is stable, but there is no audited clean observation window and no value in risking a late-stage break for this release.
  - Next: promote after a short monitored production window and a targeted policy audit.
- Add SRI hashes to CDN-served scripts
- Validate or intentionally defer DNSSEC

### D. Post-v2 work (not blocking this release)

- Frontend error tracking (Sentry or equivalent)
- Lightweight health dashboard (Core Web Vitals + key funnel view)
- Formal post-release checklist / ops cadence
- Larger copy overhaul (hero and overall narrative refinement) can move to a later content-focused release

---

## 4. Release Decision Notes

These are current project decisions, not open debates.

- **Manual QA is recommended, but not required to continue current content work.**
- **Search Console and Bing property verification can happen now.**
- **`sitemap.xml` submission is better after content freeze, but not technically blocked by QA.**
- **CSP enforce mode is intentionally deferred past v2.0.0.0.**
- **Hero copy rewrite is not a blocker for v2.0.0.0.**
- **The blog is not part of the final product direction.**

---

## 5. Canonical Document Roles

To avoid documentation drift, use each document for one job only:

- `docs/ROADMAP.md`
  - Current state
  - What remains
  - Release direction
- `docs/BACKLOG.md`
  - Active work only
  - No historical narrative
- `docs/ENGINEERING-RUNBOOK.md`
  - Operational procedures
  - Deploy / QA / environment steps
- `docs/ENGINEERING-CHANGELOG.md`
  - Historical technical record
- `docs/PRD.md`
  - Product specification
  - Not a live task board

`docs/DEPLOY_ROADMAP.md` is now a bridge document only and should not be treated as the source of truth for project status.

---

## 6. Practical Next Sequence

If the goal is to simplify the path to release, the recommended order is:

1. Finish the remaining project-page content/assets that matter.
2. Perform Search Console / Bing property verification.
3. Freeze visible content.
4. Submit `sitemap.xml`.
5. Run manual QA when the owner chooses to do so.
6. Apply any fixes found.
7. Tag the release when the owner is ready.

---

*Status summary:* the project is technically strong, publicly credible, and close to release. The remaining work is mostly release hygiene and content finish, not systems engineering.
