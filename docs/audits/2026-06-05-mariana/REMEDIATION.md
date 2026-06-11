# Mariana Audit 2026-06-05 — Remediation Log

Remediation of the 2026-06-05 audit, executed 2026-06-06. All work landed on `main`
through the pre-commit chain (build-check · i18n · claim-check) — no `--no-verify`,
no `DOSSIER_CHECK_SKIP`. Full `npm run test:ci` green locally and in CI; CI
auto-deployed to production.

## Result

**60 of 60 code/content-fixable findings resolved** (P-PERF-04 closed 2026-06-07 with
browser validation). 6 require owner action outside the repo (dashboard / DNS /
strategic). 0 CRITICAL/HIGH existed.

## Fixed — by commit

| Commit | Theme | Findings |
|---|---|---|
| `1d1b0e5` | Build pipeline hardening | A-DEBT-04, A-ARCH-01, D-MAINT-02, B-CSP-01, B-INCL-01, D-TEST-03 |
| `fb7e019` | Dossier head partial + SEO | A-DEBT-05, SEO-OG-01, SEO-LD-01, A-ARCH-02, SEO-HREFLANG-01, SEO-TWITTER-01, SEO-OGTYPE-01 |
| `759842d` | Accessibility | A-A11Y-01, A-A11Y-02, A-A11Y-03, A-A11Y-04, A-A11Y-05, A-A11Y-06 |
| `3276cda` | Localized form messages | UX-FORM-01 |
| `c2ac971` | Contact function hardening | B-FUNC-01, B-FUNC-02 (mechanism; activation = owner env) |
| `25890db` | Dependencies | D-OUTDATED-01, D-OUTDATED-02, D-PIN-01 |
| `5e962e2` | Performance | P-PERF-01, P-PERF-02, P-PERF-03, P-PERF-05, P-PERF-06 |
| `a30f5d1` | Privacy / legal copy | L-PRIV-01, L-PRIV-02, L-PRIV-03, L-PRIV-05, L-PRIV-07, L-PRIV-08 |
| `c25c61c` | CI / ops / tests | A-OPS-01, A-OPS-02, A-OPS-04 (COOP + error logger), D-TEST-01, D-TEST-02, D-TEST-05 |
| `415fed6` | Docs | D-DOC-01, D-DOC-02, D-DOC-03, D-DOC-04, D-MAINT-01, D-MAINT-03, D-TEST-04 |
| `9e4987f` | Architecture cleanup (Task #18) | A-DEBT-03, A-DEBT-06, UX-DENSITY-01, SEO-CANON-01, B-DEV-01, A-ARCH-09 |

INFO positives left as-is by design and noted in docs: A-ARCH-08, B-SUPPLY-01, D-LOCK-01.

## Deferred — none remaining

- **P-PERF-04 (DONE, 2026-06-07)** — render-blocking CSS cut from ~333 KB to ~207 KB.
  Added a build step (`scripts/build/purge-bootstrap.mjs` + purgecss devDep) that
  purges unused Bootstrap rules against the built HTML + JS with a runtime-class
  safelist: bootstrap.min.css 155.9 KB → 25.8 KB. Source of truth is the committed
  `assets/css/bootstrap.full.css`; `build:pages --check` enforces sync. Validated in
  a real browser (index + dossier: grid, contact form, jvectormap, accordions,
  infographic — no console errors, no layout shift) plus full `test:ci` (57 e2e incl.
  visual regression + axe). style.min.css left untouched (it is all in use).

## Owner action required (outside the repo)

**All 6 completed — 2026-06-11.** See `docs/OWNER-ACTIONS.md` for full detail.

1. **L-PRIV-09 / GA4 admin** ✅ — Data Retention set to 14 months; Google Signals OFF;
   no Ads product links.
2. **B-FUNC-03 / DNS** ✅ — `ibaifernandez.com` verified in Resend (DKIM + SPF green);
   DMARC `_dmarc.ibaifernandez.com` added in Cloudflare.
3. **B-FUNC-02 activation** ✅ — Turnstile keys wired in Netlify env
   (`PORTFOLIO_CAPTCHA_SECRET` — `.env` typo `_KEY` suffix also corrected);
   `PORTFOLIO_CAPTCHA_REQUIRED=1` live.
4. **A-OPS-10 / Netlify UI** ✅ — Git auto-builds stopped; single deploy path = CLI
   from CI after full gate. Rollback: Netlify → Deploys → Publish deploy (seconds).
5. **P-PERF-08** ✅ — PSI run post font-preload + testimonials deploy (2026-06-11):
   homepage mobile 90/3.4s LCP (was 4.0s); scanner mobile 77/5.0s (was 6.1s).
   Next lever: dossier hero image weight.
6. **L-PRIV-04** ✅ — LSSI-CE Section 8 added to `privacy.template.html` (commit
   `268e31c`): Antonio Ibai Fernández Gutiérrez · NIF 74853234X · C/ Juan de Ortega,
   s/n, 29190, Málaga.

## Out of scope by decision

- **SEO-BILINGUAL-01** — moving from single-URL JS i18n to distinct server-rendered
  `/es//en/` URLs is an XL architectural change; flagged, not undertaken.
