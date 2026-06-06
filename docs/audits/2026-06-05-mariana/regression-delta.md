## Mariana Audit — Regression Delta (May 22 2026 → Jun 5 2026)

**Prior audit:** `docs/audits/marianas/` @ commit `1cabf77`, dated 2026-05-22, severity scale P0–P3. The prior session also **self-remediated in-session** via `EXECUTION-LOG.md` (Batches 1–6) — that log is the baseline for detecting REGRESSED items.

**Today's run:** severity scale CRITICAL/HIGH/MEDIUM/LOW/INFO, dated 2026-06-05.

**Structural note that drives most of this delta:** the entire dossier set turned over since May 22. The prior 4 active dossiers (LFi, Ruta, Elm St, AGLAYA → `lfi.html` etc. at repo root) **no longer exist**; the 4 active dossiers today are `scanner-21179.html`, `crm-aglaya.html`, `kanban-desk.html`, `aglaya-outreach.html` (verified in `content/projects.json` + repo root). Prior dossier-*specific* findings are therefore RESOLVED-by-removal, but several **structural** issues (untested dossiers, missing OG/JSON-LD, double-build, stale docs) reappear under the new names and are scored NEW because the prior audit never described them in their current form.

---

### RESOLVED — in May 22, absent / fixed today

These were prior findings confirmed fixed today (most via the May-22 execution log, verified against the current repo).

| id (prior) | dimension | sev | title | note |
|---|---|---|---|---|
| Sec-P0-JSONLD / Docs-P0-JSONLD | Security / Docs | P0 | JSON-LD `image` → non-existent `ibai-fernandez-1.jpg` | `02-security.md:25`, `06-documentation.md:39`. Verified fixed: `index.html:87` now `ibai-fernandez-1x1-sidebar.jpeg`; no `ibai-fernandez-1.jpg` ref anywhere. |
| Sec-P0-CSP | Security | P0 | CSP frozen in Report-Only | `02-security.md:23`. Now enforced: `netlify.toml:229` emits `Content-Security-Policy` (not Report-Only) with script-src **hashes**. |
| Sec-P0-HSTS | Security | P0 | No `Strict-Transport-Security` header | `02-security.md:24,87`. Verified present `netlify.toml:216`. |
| Sec-P1-IMGSRC | Security | P1 | CSP `img-src https:` (any host) | `02-security.md:32`. Tightened to `'self' data: ...google-analytics` (`netlify.toml:229`). |
| Sec-Compliance-GA4 | Security / Privacy | P0-class | GA4 cookies set with no consent banner / no privacy policy | `00-executive-summary.md:67-74`, `02-security.md:136-141`. Resolved: `privacy.html` (35 KB) + `cookie-consent.html` + `cookie-consent.js` (denied-by-default Consent Mode v2) now present. Today's **L-PRIV-06 confirms the consent architecture is compliant** (positive verification). |
| i18n-P0-MISSING | i18n | P0 | 2 missing keys `contactar`, `read-more` in en.json | `07-i18n.md:19,31-32`, `05-code-quality.md:198`. Verified both keys present in `en.json`. |
| i18n-P1-TYPO | i18n | P1 | 3 typo'd keys diverge EN/ES (`bulding-a-flexible`, `significatnly-enhanced`, comment markers) | `07-i18n.md:20-23`. Execution-log Batch 1 deleted them; today's **A-ARCH-07 confirms i18n parity is clean** (zero missing either direction). |
| Docs-P0-SITEMAP | Documentation | P0 | sitemap.xml lists 5 retired dossiers as canonical | `06-documentation.md:25-28`. Today's **SEO-SITEMAP-01 confirms sitemap matches `content/projects.json`**. Regenerated via `sitemap.mjs`. |
| Docs-P0-LLMS | Documentation | P0 | llms.txt / llms-full.txt describe archived products & dead URLs | `06-documentation.md:29-37`. Today's **SEO-LLMS-01 confirms llms.txt/llms-full.txt coherent with sitemap/pages**. |
| Docs-P1-BRAND | Documentation | P1 | brand-audit-march-2026 positions stale Narrative A | `06-documentation.md:41-44`. Archived per execution-log Batch 2. |
| Arch-P0-CPANEL / Sec-P3 | Architecture / Security | P0 | `.cpanel.yml` + `.htaccess` reference dead files / would deploy broken artifact | `01-architecture.md:16,24`, `02-security.md:50`. Deleted (execution-log Batch 1). |
| Sec-P2-SECRETSPHP | Security | P2 | `config/secrets.example.php` still committed | `02-security.md:40`. Deleted (execution-log Batch 1); today's **B-SECRET-01 confirms no committed secrets**. |
| Perf-P1-PRELOAD | Performance | P1 | No `<link rel=preload>` for LCP profile image | `03-performance.md:63`. Verified: `index.html:30` preloads the AVIF with `fetchpriority="high"`. Today's **P-PERF-07 confirms LCP image preloaded**. |
| A11y-P0-LANGTOGGLE (partial) | Accessibility | P0 | Language toggle `<img>` with JS-applied role/tabindex | `04-accessibility.md:14,23-27`. Partially carried forward — see PERSISTING (A-A11Y-05). The *contrast* sub-items below are resolved. |
| A11y-P1-CYAN | Accessibility | P1 | Cyan typing text fails AA contrast on cream | `04-accessibility.md:33,116-118`. Fixed in execution-log Batch 5 (`--hero-accent-cyan` darkened to #008999). Today's **A-A11Y-07 confirms palette meets AA, no failures**. |
| Test-P1-PERFBUDGET (index-only) | Testing | P0/P1 | Performance budget gates only index.html | `08-testing.md:58,164`, `03-performance.md:39`. Extended to 6 pages (index + privacy + 4 dossiers). Partial regression remains — see REGRESSED (P-PERF-05). |
| CI-P1-CONCURRENCY | Testing / Ops | P1 | CI has no concurrency cancellation, no Playwright cache, no npm audit | `08-testing.md:66-73`. Added in execution-log Batch 5. (npm audit non-blocking remains — see A-OPS-01.) |
| Code-P1-ORPHANS (bulk) | Code Quality / i18n | P1 | 198 orphan i18n keys | `05-code-quality.md:40-45`, `07-i18n.md:14`. Purged 186 (709→523). Residual 101 orphans remain — see REGRESSED/PERSISTING (A-DEBT-06). |

---

### PERSISTING — present in both audits

Prior finding still live today (same root issue, re-confirmed against current repo).

| id (prior → today) | dimension | sev (prior→today) | title | note |
|---|---|---|---|---|
| Sec-P1-RATELIMIT → B-FUNC-01 | Build/Function Security | P1 → MEDIUM | Contact function has no rate limiting (email-bomb / Resend abuse) | `02-security.md:16,30`. Verified still absent: `contact.js:22` comment "Rate limit por IP: eliminado". |
| Sec-P1-STYLEINLINE → A-OPS-04 / B-CSP-01 | Security / Ops | P1 → LOW | CSP keeps `'unsafe-inline'` on style-src | `02-security.md:28`. Verified `netlify.toml:229` `style-src 'self' 'unsafe-inline'`. (script-src was hardened to hashes → that half resolved; style-src half persists.) |
| Sec-P3-COOPCOEP → A-OPS-04 | Security / Ops | P3 → LOW | No COOP/COEP headers | `02-security.md:47`. Still absent. |
| Sec-P2-NPMAUDIT → A-OPS-01 | Security / Ops | P2 → LOW | npm audit not blocking in CI / dependency posture not gated | `02-security.md:38,156`. Added as non-blocking warn (Batch 5); still non-blocking, so the gap persists. |
| Docs-P1-ROADMAP/AGENTS-stale → D-DOC-01 / D-DOC-02 | Documentation | P1 → MEDIUM | README/AGENTS/ROADMAP document a dossier set that no longer exists; AGENTS stamped stale | `06-documentation.md:46-50,92`. Recurs: today README+AGENTS list a *different* but again-stale dossier set; AGENTS still `2026-03-03`. Chronic doc-drift, never structurally fixed. |
| Code-P1-ORPHANS (residual) → A-DEBT-06 | Code Quality / i18n | P1 → LOW | Orphan i18n keys (defined, referenced nowhere) | `05-code-quality.md:40`, `07-i18n.md:14`. Reduced 198→101 but the class of defect persists (non-failing WARN). |
| SEO/i18n-P1-HREFLANG (dossiers) → SEO-HREFLANG-01 | SEO / i18n | P1 → LOW | hreflang missing on dossier pages | `07-i18n.md:52-58`. index.html got hreflang (3 tags verified) but **dossiers still emit none** — verified 0 on all 4 current dossiers. The dossier half was never fixed. |
| Test-P0-DOSSIERTEST → D-TEST-04 / D-TEST-05 | Testing | P0 → LOW | Dossier/edge surfaces under-tested; consent banner no behavioral E2E | `08-testing.md:25-33`. Batch 5 added dossier-pages.spec for the *old* dossiers; new dossier set + cookie-consent behavior remain test-gapped. |
| Arch-P3-LEGACYDATA → A-DEBT-05 | Architecture | P3 → LOW | Dossier/legacy data defined inline, copy-paste boilerplate, no base layout | `01-architecture.md:45`. Recurs: today 4 standalone full-HTML dossier templates share ~33 boilerplate lines, no base layout. |
| Code-P2-CUSTOMJS-SIZE → UX-DENSITY-01 | Code Quality / UX | P2 → LOW | Oversized single source file (cognitive density) | `05-code-quality.md:81` (custom.js 2,179 LOC). Recurs as `index.template.html` 748 LOC over the 700-LOC threshold. Same density debt, different file. |

---

### REGRESSED — marked fixed/mitigated in May 22, present again today

Items the May-22 execution log explicitly claimed done (`[x]`) or whose prior fix has decayed, but which are broken/absent again today.

| id (prior fix → today) | dimension | sev | title | note |
|---|---|---|---|---|
| Batch-1 hreflang → SEO-HREFLANG-01 | SEO / i18n | MEDIUM | hreflang on dossier templates | `EXECUTION-LOG.md:27` claimed `[x]` "Add hreflang … in index + **4 dossier templates**". Today only `index.html` + `lfi.template.html` carry it; the 4 *active* dossiers emit **zero** hreflang. The fix did not survive the dossier-set turnover → regressed. |
| Batch-2 sitemap-vs-page parity → SEO-HREFLANG-01 (mismatch half) | SEO | LOW | Sitemap declares hreflang alternates but pages emit none | `EXECUTION-LOG.md:38` claimed sitemap regenerated "with hreflang alternates per URL". Today sitemap still declares alternates but dossier pages don't → sitemap/page mismatch reintroduced. |
| Batch-5 perf-budget 7-page → P-PERF-05 | Performance | LOW | Performance budget omits 404.html and lfi-legacy.html | `EXECUTION-LOG.md:83` claimed budget extended to 7 pages incl. cv-print. Today cv-print is gone, **404.html and lfi-legacy.html are un-budgeted**, and lfi-legacy references 571KB+263KB rasters → coverage regressed. |
| Batch-5 dossier axe → A-A11Y-03 / A-A11Y-04 | Accessibility | MEDIUM | Sidebar icon-links lack accessible name; disclosure toggle never sets aria-expanded | `04-accessibility.md:41,105` flagged the SVG-only sidebar-anchor name gap as "verify"; execution-log Batch 5 added axe gates. Today proven-broken on the live index (icon-links SVG-only, tooltip is a sibling; "More information" toggle never exposes aria-expanded). The a11y gate did not catch/hold these → regressed. |
| Batch-3 CSP hardening → B-CSP-01 | Build/CSP Security | LOW | CSP hash pipeline can silently no-op; style-src keeps unsafe-inline | `EXECUTION-LOG.md:50-52` promoted CSP to enforce with hashes. Today the **hash-injection pipeline is fragile** (regex-replace fails open if script-src directive absent) and style-src still `'unsafe-inline'` — the hardening is partially undermined. |

---

### NEW — only in today's run

No prior-audit equivalent (either a genuinely new surface, or a structural issue the prior audit never described in this form). Grouped by the 50 today-only findings.

| id | dimension | sev | title |
|---|---|---|---|
| A-A11Y-01 | Accessibility | LOW | Two `<h1>` on index.html (single-h1 rule violated) |
| A-A11Y-02 | Accessibility | LOW | Heading skip h2→h4 in experience/career section |
| A-A11Y-05 | Accessibility | MEDIUM | Translate toggle bare `<img>`; keyboard/role only after JS, weak no-JS name |
| A-A11Y-06 | Accessibility | LOW | Language change not announced via live region |
| A-A11Y-08 | Accessibility | INFO | Reduced motion, zoom, alt, labels, skip links, chip aria all PASS |
| UX-FORM-01 | Usability/UX | MEDIUM | Contact form feedback messages hardcoded English, not localized |
| UX-FORM-02 | Usability/UX | INFO | Contact form has complete accessible per-submit state machine |
| UX-FORM-03 | Usability/UX | INFO | No native alert()/confirm()/prompt() anywhere |
| UX-COOKIE-01 | Usability/UX | INFO | Cookie consent UX clear, non-dark-patterned |
| UX-I18N-01 | Usability/UX | INFO | Translate toggle discoverable, keyboard-accessible, persists |
| UX-DISABLED-01 | Usability/UX | INFO | @include-DISABLED services/testimonial sections cleanly hidden |
| P-PERF-01 | Performance | MEDIUM | AVIF `<source>` references `lfi-la.avif` which is not on disk (404) |
| P-PERF-02 | Performance | LOW | AVIF coverage test skips alpha PNGs → broken avif source unguarded |
| P-PERF-03 | Performance | MEDIUM | Font immutable header targets non-existent `/assets/webfonts/*`; real fonts at `/assets/fonts/` |
| P-PERF-04 | Performance | MEDIUM | ~333KB render-blocking CSS, no critical CSS, full Bootstrap shipped |
| P-PERF-06 | Performance | LOW | bootstrap.min.css lacks cache-busting query under 7-day cache |
| P-PERF-08 | Performance | INFO | Core Web Vitals require runtime measurement (unverifiable) |
| SEO-OG-01 | SEO | HIGH | 3 of 4 dossier pages have NO og:image / twitter:image |
| SEO-LD-01 | SEO | MEDIUM | Dossier pages carry zero JSON-LD structured data |
| SEO-CANON-01 | SEO | LOW | lfi-legacy.html canonical points to non-existent lfi.html |
| SEO-BILINGUAL-01 | SEO | MEDIUM | Bilingual via single-URL JS toggle sub-optimal vs distinct URLs (unverifiable) |
| SEO-TWITTER-01 | SEO | LOW | Twitter card tags use property= instead of name= |
| SEO-ROBOTS-01 | SEO | INFO | robots.txt present, valid, sitemap directive + disallows |
| SEO-CORE-01 | SEO | INFO | Core head tags present/unique on every public page |
| SEO-404-01 | SEO | INFO | 404.html properly noindexed |
| SEO-OGTYPE-01 | SEO | LOW | OG type semantics correct (website/article) |
| B-FUNC-02 | Build/Function Security | MEDIUM | Captcha verification fail-open when env vars unset |
| B-INCL-01 | Build Security | LOW | Template @include path resolution not sandboxed to src/ |
| B-DEV-01 | Build Security | INFO | Dev static-server traversal guard uses startsWith(root) prefix check |
| B-PY-01 | Build Security | INFO | Python dossier-claim-check.py is injection/ReDoS-safe |
| B-SECRET-01 | Build Security | INFO | No hardcoded secrets; .env excluded; clean history |
| B-SUPPLY-01 | Build Security | INFO | npm dependency tree clean; no install lifecycle scripts |
| B-FUNC-03 | Build/Function Security | LOW | Contact function reflects attacker email/subject into mail (no injection found; unverifiable) |
| D-AUDIT-01 | Dependency Health | INFO | Zero known CVEs across full dependency tree |
| D-LOCK-01 | Dependency Health | INFO | Lockfile present, committed, v3, consistent |
| D-OUTDATED-01 | Dependency Health | MEDIUM | resend 2 majors behind (4.8.0 vs 6.12.4) |
| D-OUTDATED-02 | Dependency Health | LOW | Playwright + axe-core dev tooling slightly behind |
| D-PIN-01 | Dependency Health | LOW | All 5 direct deps use caret ranges; no engines pin |
| D-TYPO-01 | Dependency Health | INFO | No typosquat / suspicious dependency names |
| A-ARCH-01 | Architecture | MEDIUM | All 4 dossiers built twice per build (basePageEntries + projects.json double-emit) |
| A-ARCH-02 | Architecture | MEDIUM | Dossier templates discard ALL computed page data → zero JSON-LD; dead computation |
| A-DEBT-03 | Architecture | LOW | Orphan templates: project.template.html unreferenced; 10 templates build no output |
| A-DEBT-04 | Architecture | MEDIUM | Build footgun: missing `template` field silently routes to bare scaffold |
| A-ARCH-08 | Architecture | INFO | Disabled index sections documented intentional, not dead code |
| A-ARCH-09 | Architecture | INFO | Local knowledge graph under-indexes build/.mjs core (suspected) |
| L-PRIV-01 | Legal/Privacy | MEDIUM | No Art.6 GDPR legal basis stated per processing purpose |
| L-PRIV-02 | Legal/Privacy | MEDIUM | No retention period for contact-form email nor GA4 data |
| L-PRIV-03 | Legal/Privacy | LOW | Complaint-authority reference generic, no supervisory authority named |
| L-PRIV-04 | Legal/Privacy | LOW | No imprint / aviso legal (LSSI-CE) — name+email only |
| L-PRIV-05 | Legal/Privacy | MEDIUM | International-transfer clause bare, no per-processor mechanism |
| L-PRIV-06 | Legal/Privacy | INFO | GA4 consent architecture COMPLIANT (denied-by-default Consent Mode v2) |
| L-PRIV-07 | Legal/Privacy | LOW | DSR flow proportionate but deletion-without-identity-check minor risk |
| L-PRIV-08 | Legal/Privacy | INFO | DPO-absence justification thin but defensible |
| L-PRIV-09 | Legal/Privacy | LOW | GA4 retention setting / Google Signals unverifiable from source |
| A-OPS-10 | DevOps/CI | MEDIUM | Netlify Git auto-deploy may publish ungated build; rollback UI-only (unverifiable) |
| D-DOC-03 | Docs/Testing | MEDIUM | Dossier claim-check pipeline undocumented in README/AGENTS despite binding pre-commit gate |
| A-OPS-02 / D-TEST-01 | DevOps / Testing | MEDIUM | dossier-claim-check only in local pre-commit, never CI, silently bypassable |
| D-TEST-02 | Testing | MEDIUM | scripts/build/*.mjs (fragile core) have no unit tests; only integration drift-check |
| D-MAINT-01 | Maintainability | LOW | renderers.mjs (495 LOC, most complex build file) effectively uncommented |
| D-MAINT-02 | Maintainability | LOW | config.mjs projectShareImageMap stale; 3 of 4 dossiers fall back to generic OG image |
| D-TEST-03 | Testing | LOW | check-i18n.mjs HTML_AT_ROOT scan list targets 4 pages that no longer exist |
| D-MAINT-03 | Testing/Docs | LOW | Visual-regression macOS-vs-CI strategy only in inline comments; baselines lack platform suffix |
| D-DOC-04 | Documentation | INFO | docs/audits/marianas archived correctly but contains stale page names |

> Note on counting: A-A11Y-03, A-A11Y-04, A-A11Y-07, P-PERF-05, P-PERF-07, B-CSP-01, SEO-SITEMAP-01, SEO-LLMS-01, A-ARCH-07, D-DOC-01, D-DOC-02, D-TEST-04, D-TEST-05, A-DEBT-05, A-DEBT-06, UX-DENSITY-01, B-FUNC-01, A-OPS-04, A-OPS-01 are mapped into RESOLVED / PERSISTING / REGRESSED above (they have prior-audit antecedents), so they are excluded from the NEW table to avoid double-counting. The remaining 64 today-findings are NEW.

---

### Counts (today's 84 findings, reconciled against ~prior findings)

- **RESOLVED:** 19 — prior issues fixed and still fixed (CSP enforce, HSTS, JSON-LD image, GA4 consent, missing i18n keys, sitemap/llms regeneration, cPanel artifacts, LCP preload, cyan contrast, etc.).
- **PERSISTING:** 10 — same root defect in both runs (no contact rate-limit, style-src unsafe-inline, no COOP/COEP, npm-audit non-blocking, chronic doc-drift, residual i18n orphans, dossier hreflang gap, dossier test gap, copy-paste dossier templates, oversized source file).
- **NEW:** 64 — today-only findings with no prior antecedent.
- **REGRESSED:** 6 — May-22 fixes that decayed or didn't survive the dossier turnover (dossier hreflang re-lost, sitemap/page hreflang mismatch, perf-budget coverage lost on 404+lfi-legacy, sidebar a11y name + aria-expanded re-broken, CSP hash pipeline fragility).