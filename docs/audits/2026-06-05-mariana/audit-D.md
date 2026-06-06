# Phase D — Ops · Documentation · Testing

_Mariana Trench audit — 2026-06-05 · HEAD `3faadfb` · REPORT mode · portfolio-ibaifernandez_

**16 findings** — MEDIUM 6 · LOW 9 · INFO 1

### Evidence Dashboard

| Confidence | Count | % |
|---|---|---|
| PROVEN | 17 | 81% |
| SUSPECTED | 1 | 5% |
| UNVERIFIABLE | 3 | 14% |
| **Total** | **21** | 100% |

Health signal: **healthy (PROVEN ≥ 60%)**.

- **Ops** — 4 findings · PROVEN 6 / SUSPECTED 0 / UNVERIFIABLE 3 · code-read 7, manual-verification 2
- **Docs** — 12 findings · PROVEN 11 / SUSPECTED 1 / UNVERIFIABLE 0 · code-read 8 · manual-verification 3 · graph-local 1

## Findings (severity-sorted)

| ID | Sev | Conf | Dim | Finding | Ref | Effort |
|---|---|---|---|---|---|---|
| D-DOC-01 | MEDIUM | PROVEN | Docs | README + AGENTS document a stale dossier page set that no longer exists on disk | N-A | S |
| D-DOC-03 | MEDIUM | PROVEN | Docs | Dossier claim-check pipeline is undocumented in README and AGENTS.md despite being a binding pre-commit gate | N-A | S |
| D-TEST-01 | MEDIUM | PROVEN | Docs | Claim-check runs ONLY in an optional local pre-commit hook, never in CI — approve-by-fiat / bypass risk | N-A | M |
| D-TEST-02 | MEDIUM | PROVEN | Docs | scripts/build/*.mjs (the fragile build core) have no unit tests; only an integration drift-check exists | N-A | L |
| A-OPS-02 | MEDIUM | PROVEN | Ops | dossier-claim-check only in local pre-commit hook, never CI, silently bypassable | N-A | S |
| A-OPS-10 | MEDIUM | UNVERIFIABLE | Ops | Netlify Git auto-deploy may publish an ungated build (no E2E); rollback is UI-only | N-A | S |
| D-DOC-02 | LOW | PROVEN | Docs | AGENTS.md stamped 'Last updated: 2026-03-03' — ~3 months stale, predates dossier pipeline, claim-check and CSP work | N-A | S |
| D-MAINT-01 | LOW | PROVEN | Docs | renderers.mjs (495 lines, most complex build file) is effectively uncommented | N-A | M |
| D-MAINT-02 | LOW | PROVEN | Docs | config.mjs projectShareImageMap is stale; 3 of 4 active dossiers silently fall back to the generic default OG image | N-A | S |
| D-MAINT-03 | LOW | PROVEN | Docs | Visual-regression baseline strategy (macOS local vs CI Ubuntu) is documented only in inline test comments, not in any maintainer doc; baselines carry no platform suffix | N-A | S |
| D-TEST-03 | LOW | PROVEN | Docs | check-i18n.mjs root-file scan list (HTML_AT_ROOT) targets 4 pages that no longer exist | N-A | S |
| D-TEST-04 | LOW | PROVEN | Docs | README/AGENTS test inventory omits csp.spec.js and dossier-pages.spec.js (9 specs exist, 7 documented) | N-A | S |
| D-TEST-05 | LOW | PROVEN | Docs | Cookie-consent and translate-toggle: consent banner has zero behavioral E2E coverage (only suppressed for visual diffs); translate toggle is well covered | N-A | M |
| A-OPS-01 | LOW | PROVEN | Ops | CI gaps: deploy gate implicit, smoke.sh never runs, npm audit non-blocking, no engines field | OWASP A06:2021 | M |
| A-OPS-04 | LOW | PROVEN | Ops | Headers/observability: style-src unsafe-inline; no COOP/COEP; no error tracking; secrets safe | OWASP A05:2021 | L |
| D-DOC-04 | INFO | SUSPECTED | Docs | docs/audits/marianas (prior audit) is correctly archived but contains stale page names that can be mistaken for current guidance | N-A | S |

## Detail

#### D-DOC-01 — README + AGENTS document a stale dossier page set that no longer exists on disk
- **Severity:** MEDIUM · **Confidence:** PROVEN (line-proof) · **Source:** code-read · **Effort:** S · **Ref:** N-A
- **Evidence:** README.md:142 lists published surface as `lfi.html`, `ruta-de-la-digitalizacion-y-2x2-mkt.html`, `elm-st.html`, `aglaya.html`; AGENTS.md:105 + :153 use the same examples (`lfi.html`, `elm-st.html`). Actual root dossiers (config.mjs basePageEntries:18-21) are scanner-21179.html, kanban-desk.html, crm-aglaya.html, aglaya-outreach.html. Bash: `for f in lfi.html aglaya.html elm-st.html ruta-...html; do [ -f "$f" ]...` → all 4 MISSING. None of the documented pages exist.
- **Recommendation:** Update README.md (lines 142, 65, 133-139) and AGENTS.md (105, 110, 153) to the current dossier set (scanner-21179, kanban-desk, crm-aglaya, aglaya-outreach + lfi-legacy archived). Since the active set is data-driven from content/projects.json, replace the hardcoded example list with a pointer to that file to prevent re-drift.

#### D-DOC-03 — Dossier claim-check pipeline is undocumented in README and AGENTS.md despite being a binding pre-commit gate
- **Severity:** MEDIUM · **Confidence:** PROVEN (proven-by-absence) · **Source:** code-read · **Effort:** S · **Ref:** N-A
- **Evidence:** grep for `dossier-claim-check|claim allowlist|approved-claims|dossier-fact-check|dossier claim` across docs/, AGENTS.md, README.md, CLAUDE.md returned exit 1 (no match) for the docs set, and `grep -c claim README.md AGENTS.md` → 0 and 0. Yet scripts/pre-commit.sh:23-28 hard-blocks commits on it and .dossier-approved-claims.yml (21KB) is a checked-in 'binding' allowlist. The only place it is described is the docstring inside dossier-claim-check.py itself.
- **Recommendation:** Add a 'Dossier claim-check' section to AGENTS.md / docs/ explaining: what it scans (DOSSIER_PATH_PATTERNS), where the allowlist lives, how to add an approved claim with a source citation, the DOSSIER_CHECK_SKIP/WARN_ONLY bypasses, and the /dossier-fact-check workflow referenced in the script.

#### D-TEST-01 — Claim-check runs ONLY in an optional local pre-commit hook, never in CI — approve-by-fiat / bypass risk
- **Severity:** MEDIUM · **Confidence:** PROVEN (proven-by-absence) · **Source:** manual-verification · **Effort:** M · **Ref:** N-A
- **Evidence:** Sole wiring is scripts/pre-commit.sh:24 (`python3 scripts/dossier-claim-check.py`). The hook is NOT auto-installed: pre-commit.sh:3-5 documents a manual `ln -sf ... .git/hooks/pre-commit` step. .github/workflows/ci.yml runs only `npm run build:pages`, `npm run test:quality`, `npm run test:e2e` — no claim-check step. dossier-claim-check.py:147 scans `git diff --cached` (staged files), so it structurally cannot run against built artifacts in CI. Result: any commit by a contributor who never installed the hook (or uses DOSSIER_CHECK_SKIP=1, supported at line 196) bypasses the factual-claim gate entirely with zero CI backstop.
- **Recommendation:** Add a CI job that runs the claim check against the diff of the PR (e.g. `git diff origin/main...HEAD`-based mode, or a `--all-dossiers` full-scan mode) so the allowlist is enforced server-side. Until then, document clearly that the gate is best-effort/local-only so reviewers don't assume claims are CI-verified.

#### D-TEST-02 — scripts/build/*.mjs (the fragile build core) have no unit tests; only an integration drift-check exists
- **Severity:** MEDIUM · **Confidence:** PROVEN (proven-by-absence) · **Source:** manual-verification · **Effort:** L · **Ref:** N-A
- **Evidence:** grep for `renderers|sitemap.mjs|fingerprint|csp-hashes|template-utils|context.mjs` under tests/ matched only quality-guards.sh and csp.spec.js (the e2e runtime CSP check) — no unit test imports any of these modules. The only build-script-targeted test is tests/check-coverage-tests.mjs, which exercises the AVIF/WebP coverage *checkers* (test helpers), not the renderers. `build-pages.mjs --check` (quality-guards.sh:144) is a whole-output diff (integration drift detection), not a unit test of rendering logic, sitemap generation, fingerprinting or CSP-hash derivation. renderers.mjs is 495 lines and untested in isolation.
- **Recommendation:** Add focused unit tests for the highest-risk pure functions: sitemap.mjs (renderSitemap / renderLlmsTxt), fingerprint.mjs (hash stability), csp-hashes.mjs (hash extraction + sync), and renderers.mjs directive rendering. The --check diff catches 'output changed' but gives no signal on *why*, and offers no safety net when refactoring the renderer internals.

#### A-OPS-02 — dossier-claim-check only in local pre-commit hook, never CI, silently bypassable
- **Severity:** MEDIUM · **Confidence:** PROVEN (proven-by-absence) · **Source:** code-read · **Effort:** S · **Ref:** N-A
- **Evidence:** pre-commit.sh:23-28 runs dossier-claim-check.py, bypass DOSSIER_CHECK_SKIP=1 :26; grep claim .github none; not in quality-guards.sh; unverified public claims can ship
- **Recommendation:** Add dossier-claim-check.py as a CI step after build

#### A-OPS-10 — Netlify Git auto-deploy may publish an ungated build (no E2E); rollback is UI-only
- **Severity:** MEDIUM · **Confidence:** UNVERIFIABLE (NV_DASHBOARD) · **Source:** manual-verification · **Effort:** S · **Ref:** N-A
- **Evidence:** ci.yml:112 comment deshabilitar auto-deploy + netlify.toml:6-7 [build] command vs CLI deploy :113-136; if Git auto-build on, native build skips E2E; no .github rollback workflow
- **Recommendation:** Confirm auto-publish OFF in Netlify UI; document rollback runbook

#### D-DOC-02 — AGENTS.md stamped 'Last updated: 2026-03-03' — ~3 months stale, predates dossier pipeline, claim-check and CSP work
- **Severity:** LOW · **Confidence:** PROVEN (line-proof) · **Source:** code-read · **Effort:** S · **Ref:** N-A
- **Evidence:** AGENTS.md:213 `*Last updated: 2026-03-03*`. ROADMAP.md:3 `Last updated: 2026-06-03` and references the dossier pipeline, CSP enforcement specs, and 52 e2e tests — none of which AGENTS.md reflects (its CI Gates section lists only test:quality + test:e2e, no mention of csp.spec or the claim-check git hook). currentDate is 2026-06-05.
- **Recommendation:** Refresh AGENTS.md: bump the date, add csp.spec.js / dossier-pages.spec.js to the test inventory, and document the claim-check pre-commit hook so agents know it exists.

#### D-MAINT-01 — renderers.mjs (495 lines, most complex build file) is effectively uncommented
- **Severity:** LOW · **Confidence:** PROVEN (line-proof) · **Source:** code-read · **Effort:** M · **Ref:** N-A
- **Evidence:** `grep -nE '//|/\*|^\s*\*' scripts/build/renderers.mjs` returns 5 lines — all 5 are schema.org URLs ('https://...' at lines 29,47,48,49,50) inside JSON-LD literals, NOT comments. context.mjs:85 lines → 0 comment markers; config.mjs and template-utils.mjs → 1 each. By contrast the smaller, less critical csp-hashes.mjs (128 lines) has 21 comment lines and fingerprint.mjs has 11. The directive engine and SEO/JSON-LD assembly that drives every generated page carries no inline rationale.
- **Recommendation:** Add module-level and per-function doc comments to renderers.mjs and context.mjs explaining the directive grammar (renderDirective), the project/dossier data flow, and the share-image/JSON-LD precedence. This is the part future agents are most likely to break.

#### D-MAINT-02 — config.mjs projectShareImageMap is stale; 3 of 4 active dossiers silently fall back to the generic default OG image
- **Severity:** LOW · **Confidence:** PROVEN (line-proof) · **Source:** manual-verification · **Effort:** S · **Ref:** N-A
- **Evidence:** config.mjs:7-12 projectShareImageMap keys are only the retired pages (lfi.html, ruta-...html, elm-st.html, aglaya.html). Consumer at renderers.mjs:410: `page.shareImage || projectShareImageMap[output] || defaultShareImage`. Per content/projects.json (python dump): scanner-21179.html sets its own shareImage, but crm-aglaya.html, kanban-desk.html, aglaya-outreach.html have shareImage=NONE. Since the map has no key for any current output, those 3 dossiers resolve to defaultShareImage (260525-featured-image.jpeg) instead of a per-dossier social card.
- **Recommendation:** Either delete the dead projectShareImageMap entirely (rely on per-page shareImage in projects.json) or repopulate it with the current outputs. Add a build-time assertion that every map key maps to an existing output to prevent silent staleness. Also set shareImage in projects.json for crm-aglaya, kanban-desk, aglaya-outreach if distinct social cards are wanted.

#### D-MAINT-03 — Visual-regression baseline strategy (macOS local vs CI Ubuntu) is documented only in inline test comments, not in any maintainer doc; baselines carry no platform suffix
- **Severity:** LOW · **Confidence:** PROVEN (line-proof) · **Source:** code-read · **Effort:** S · **Ref:** N-A
- **Evidence:** playwright.config.js:6 snapshotPathTemplate omits {platform}/{projectName}, and the 4 baselines in tests/e2e/visual.spec.js-snapshots/ have no -linux/-darwin suffix, so the same PNGs are compared on macOS and Ubuntu. The cross-platform handling lives entirely in code comments: visual.spec.js:49-53 (cookie banner CI-vs-local divergence), :103-105 (Ubuntu vs macOS font rasterization → maxDiffPixelRatio 0.10), :113-115 (macOS ~754px vs Ubuntu CI ~725px → clip to 700px). docs/ARCHITECTURE.md:211 only names the file; the only maintainer-facing note is in the archived audit docs/audits/marianas/08-testing.md:48,290 ('brittle baseline', 'investigate why experience needs 10%').
- **Recommendation:** Document the visual-baseline contract in docs/ARCHITECTURE.md or a TESTING.md: baselines are CI-Ubuntu-authoritative, regenerate via CI (not locally) to avoid the macOS pixel drift, clip widths are deliberately under the smaller platform's render, and consent must be pre-set. Consider platform-suffixed snapshots so local and CI baselines can coexist. This class of issue bit the team before per the audit notes.

#### D-TEST-03 — check-i18n.mjs root-file scan list (HTML_AT_ROOT) targets 4 pages that no longer exist
- **Severity:** LOW · **Confidence:** PROVEN (line-proof) · **Source:** code-read · **Effort:** S · **Ref:** N-A
- **Evidence:** check-i18n.mjs:54 `HTML_AT_ROOT = ['index.html','privacy.html','lfi.html','aglaya.html','elm-st.html','ruta-de-la-digitalizacion-y-2x2-mkt.html','lfi-legacy.html']`. Bash confirms lfi.html / aglaya.html / elm-st.html / ruta-...html are all MISSING. The loop at :77-80 guards with fs.existsSync so it does not error, but the current root dossiers (scanner-21179.html etc.) are never scanned by this loop. Coverage is only preserved because TEMPLATE_DIRS=['src'] (line 53) walks src/ recursively, catching the dossier *templates*. Live run: `node tests/check-i18n.mjs` → 1163/1163 keys, 1062 referenced, [OK] (exit 0), 101 orphan warns.
- **Recommendation:** Replace the hardcoded HTML_AT_ROOT array with a glob of *.html at root (or derive from config.mjs page entries) so the list cannot drift. Functionally non-urgent (templates are scanned) but it is dead, misleading config that future maintainers may trust.

#### D-TEST-04 — README/AGENTS test inventory omits csp.spec.js and dossier-pages.spec.js (9 specs exist, 7 documented)
- **Severity:** LOW · **Confidence:** PROVEN (line-proof) · **Source:** code-read · **Effort:** S · **Ref:** N-A
- **Evidence:** README.md:133-139 enumerates home/contact/keyboard/a11y/dossiers/archived-dossiers/visual. AGENTS.md CI Gates (162-163) lists only test:quality + test:e2e. Actual `ls tests/e2e/*.spec.js`: a11y, archived-dossiers, contact, csp, dossier-pages, dossiers, home, keyboard, visual (9). csp.spec.js (CSP enforcement, 7 specs per ROADMAP:11) and dossier-pages.spec.js (parametrized per-dossier a11y/keyboard/translate coverage) are undocumented. `grep -c 'dossier-pages|csp.spec' README AGENTS` → 0/0.
- **Recommendation:** Add csp.spec.js and dossier-pages.spec.js to the README test list. Note that dossier-pages.spec.js (lines 11-22) auto-derives its matrix from content/projects.json, which closes the prior Marianas audit gap '08-testing.md:16 dossiers have minimal E2E coverage' — worth recording so the old audit note isn't mistaken for current state.

#### D-TEST-05 — Cookie-consent and translate-toggle: consent banner has zero behavioral E2E coverage (only suppressed for visual diffs); translate toggle is well covered
- **Severity:** LOW · **Confidence:** PROVEN (line-proof) · **Source:** code-read · **Effort:** M · **Ref:** N-A
- **Evidence:** grep `cookie|consent` under tests/ matches only visual.spec.js, where suppressCookieBanner (visual.spec.js:54-62) sets localStorage portfolio_consent='declined' to HIDE the banner — i.e. consent is actively suppressed, never asserted. No spec exercises accept/decline, persistence, or GA4 gating of assets/js/cookie-consent.js (2.5KB). By contrast translate toggle IS covered: home.spec.js:70 + :83 (html lang + hero text + keyboard activation) and dossier-pages.spec.js:41 (lang toggle per dossier). Contact form is covered (contact.spec.js, 4 tests incl. timing guard at :52).
- **Recommendation:** Add an e2e spec for cookie-consent.js: banner shows on fresh state, Accept/Decline persists to localStorage, and analytics (GA4) only initializes after consent. This is the one user-facing interactive flow with no functional test and it has privacy/compliance implications.

#### A-OPS-01 — CI gaps: deploy gate implicit, smoke.sh never runs, npm audit non-blocking, no engines field
- **Severity:** LOW · **Confidence:** PROVEN (line-proof) · **Source:** code-read · **Effort:** M · **Ref:** OWASP A06:2021
- **Evidence:** ci.yml:113-119 deploy no needs/success (artifact steps if:always() :92,101); package.json:25 test:ci smoke not run by ci.yml:70,88; ci.yml:57-58 npm audit high || true (comment :56 does not gate); package.json engines ABSENT though node 20 pinned ci.yml:41/link-health.yml:19/netlify.toml:12
- **Recommendation:** deploy job with needs+if:success(); run test:ci; gate audit --audit-level=critical; add engines+.nvmrc

#### A-OPS-04 — Headers/observability: style-src unsafe-inline; no COOP/COEP; no error tracking; secrets safe
- **Severity:** LOW · **Confidence:** PROVEN (line-proof) · **Source:** code-read · **Effort:** L · **Ref:** OWASP A05:2021
- **Evidence:** netlify.toml:229 style-src unsafe-inline (script-src hash-locked via csp-hashes.mjs gated by --check); COOP/COEP absent (X-Content-Type-Options/Referrer-Policy/X-Frame-Options/Permissions-Policy/CORP/HSTS/CSP present :211-216); no Sentry/window.onerror (custom.js:77-221 local fallbacks); secrets via env (ci.yml:120-136), contact.js logs only err.message :178,219, quality-guards blocks hardcoded keys; link-health weekly check (link-health.yml:5-6) has no failure alert
- **Recommendation:** Move inline styles to classes+drop unsafe-inline; optional COOP+error listener+link-health notify; secrets already sound

#### D-DOC-04 — docs/audits/marianas (prior audit) is correctly archived but contains stale page names that can be mistaken for current guidance
- **Severity:** INFO · **Confidence:** SUSPECTED (graph-suspicion) · **Source:** graph-local · **Effort:** S · **Ref:** N-A
- **Evidence:** docs/README.md:24-26 labels audits/marianas as an 'Audit archive' dated 2026-05-22 (historical by design). However it still drives 'current improvement work' per docs/README:26 and AGENTS.md:209, and 08-testing.md:16 / 01-architecture.md / 03-performance.md reference the retired page set (lfi/aglaya/elm-st/ruta + cv-print). Risk is that an agent reading it as a live to-do list re-introduces stale assumptions. Not line-proven as actively misleading since it is explicitly framed as an archive — hence SUSPECTED.
- **Recommendation:** Add a one-line banner at the top of docs/audits/marianas/00-executive-summary.md marking it as a historical snapshot (date + 'page names reflect the pre-redesign surface; see content/projects.json for current'). Keeps the git-history value while preventing accidental re-use as live guidance.
