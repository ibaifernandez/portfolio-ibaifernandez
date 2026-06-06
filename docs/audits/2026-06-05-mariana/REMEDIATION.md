# Mariana Audit 2026-06-05 — Remediation Log

Remediation of the 2026-06-05 audit, executed 2026-06-06. All work landed on `main`
through the pre-commit chain (build-check · i18n · claim-check) — no `--no-verify`,
no `DOSSIER_CHECK_SKIP`. Full `npm run test:ci` green locally and in CI; CI
auto-deployed to production.

## Result

**59 of 60 code/content-fixable findings resolved.** 1 deferred (needs a dedicated
browser-validated session). 6 require owner action outside the repo (dashboard / DNS
/ strategic). 0 CRITICAL/HIGH existed.

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

## Deferred (1) — needs a dedicated, browser-validated session

- **P-PERF-04** — ~333 KB render-blocking CSS (full Bootstrap on a custom design).
  Critical-CSS extraction / PurgeCSS needs build tooling (penthouse/PurgeCSS), a
  dynamic-class safelist, and visual QA. Doing it blind risks FOUC / broken layout,
  so it was not rushed into this sweep. The cache/cache-bust wins (P-PERF-06) and the
  font header fix (P-PERF-03) already improve repeat-visit cost.

## Owner action required (outside the repo)

These cannot be fixed from source — they live in dashboards, DNS, or are strategic:

1. **L-PRIV-09 / GA4 admin** — set Data Retention to **14 months** (now disclosed in
   the privacy policy) and disable Google Signals on property `G-T8FTTWBQS3`.
2. **B-FUNC-03 / DNS** — configure SPF + DKIM + DMARC for the Resend sending domain.
3. **B-FUNC-02 activation** — set `PORTFOLIO_CAPTCHA_PROVIDER` + `PORTFOLIO_CAPTCHA_SECRET`
   in Netlify env, then `PORTFOLIO_CAPTCHA_REQUIRED=1` to enforce captcha fail-closed
   (the code path is shipped and tested; it just needs the keys).
4. **A-OPS-10 / Netlify UI** — confirm Git auto-publish is OFF (CI deploys via CLI after
   the full gate) so an ungated build can't publish; document the rollback runbook.
5. **P-PERF-08** — run PageSpeed Insights / Lighthouse against production to capture
   real Core Web Vitals (and re-check after P-PERF-04).
6. **L-PRIV-04 (partial)** — supervisory authorities are now named; a full LSSI-CE
   *aviso legal* (fiscal ID / postal identity) needs the operator's registration data.

## Out of scope by decision

- **SEO-BILINGUAL-01** — moving from single-URL JS i18n to distinct server-rendered
  `/es//en/` URLs is an XL architectural change; flagged, not undertaken.
