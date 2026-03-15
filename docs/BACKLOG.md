# BACKLOG.md — Active Work Only

**Last updated:** 2026-03-13
**Purpose:** This file lists only open work. Closed history belongs in `docs/ENGINEERING-CHANGELOG.md`.

---

## 1. Release-Critical / Near-Release

### Manual External Actions

- [ ] Google Search Console property verification
- [ ] Bing Webmaster Tools property verification
- [ ] Submit `sitemap.xml` after content freeze

### Recommended Human Gate (currently deferred by owner)

- [ ] Run manual desktop QA
- [ ] Run manual mobile QA
- [ ] Fix any high/medium issue found in those runs

### Administrative

- [ ] Create release tag `v2.0.0.0` (explicitly deferred for now)

---

## 2. Open Content / Product Work

### Project dossiers

- [ ] Replace placeholder proof assets in the Portfolio dossier
- [ ] Replace placeholder proof assets in the MyBoard dossier
- [ ] Replace placeholder proof assets in The Research Engine dossier
- [ ] Replace placeholder YouTube blocks / final reel ordering in Elm St
- [ ] Replace placeholder proof assets in AGLAYA

### Public structure

- [ ] Normalize remaining public project slugs beyond `2x2MKT`
- [ ] Run a focused SEO metadata / Open Graph pass on visible pages
- [ ] Curate visible project narratives where the framing still feels too deliverable-led and not outcome-led

### Deferred to a later content-first release

- [ ] Major hero / homepage copy rewrite (not a v2.0.0.0 blocker)
- [ ] Full copy review across EN/ES (not a v2.0.0.0 blocker)

---

## 3. Security / Hardening

- [ ] Add SRI hashes to CDN-loaded scripts
- [ ] Validate or intentionally defer DNSSEC

### Explicitly deferred by decision

- [ ] Promote CSP from report-only to enforce mode
  - Deferred until after v2.0.0.0
  - Requires a clean observation window and a targeted policy audit

---

## 4. Post-v2 / Non-Blocking

- [ ] Frontend error tracking (Sentry or equivalent)
- [ ] Lightweight health dashboard (Core Web Vitals + funnel sanity)
- [ ] Server-side purchase tracking (Gumroad webhook -> GA4 Measurement Protocol) once credentials are available
- [ ] Formal post-release checklist / maintenance cadence

---

## 5. Recently Closed (Reference Only)

These are listed here only so a reader can orient quickly. The full record is in `docs/ENGINEERING-CHANGELOG.md`.

- [x] Platform migration to Netlify
- [x] Contact flow validated in production
- [x] GA4 Realtime validation
- [x] CSS/JS minification
- [x] AVIF/WebP coverage across all generated pages
- [x] LFi redesign
- [x] Portfolio dossier
- [x] MyBoard dossier
- [x] Elm St dossier
- [x] AGLAYA dossier
- [x] Blog retired from the public surface with legacy redirect to home

---

## 6. Working Rules

- If an item is closed, move its history to `docs/ENGINEERING-CHANGELOG.md`.
- Do not duplicate the same pending item across multiple sections with different wording.
- If a decision changes release scope, update `docs/ROADMAP.md` first, then this file.
