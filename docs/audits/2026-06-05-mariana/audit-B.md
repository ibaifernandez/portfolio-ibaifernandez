# Phase B — Build/Backend · Dependencies · Architecture

_Mariana Trench audit — 2026-06-05 · HEAD `3faadfb` · REPORT mode · portfolio-ibaifernandez_

**24 findings** — MEDIUM 6 · LOW 8 · INFO 10

### Evidence Dashboard

| Confidence | Count | % |
|---|---|---|
| PROVEN | 21 | 88% |
| SUSPECTED | 2 | 8% |
| UNVERIFIABLE | 1 | 4% |
| **Total** | **24** | 100% |

Health signal: **healthy (PROVEN ≥ 60%)**.

- **Build-sec** — 9 findings · PROVEN 7 / SUSPECTED 1 / UNVERIFIABLE 1 · code-read 5 · manual-verification 3 · tool-external 1
- **Deps** — 6 findings · PROVEN 6 / SUSPECTED 0 / UNVERIFIABLE 0 · tool-external 4 · code-read 2
- **Architecture** — 9 findings · PROVEN 8 / SUSPECTED 1 / UNVERIFIABLE 0 · code-read 5 · graph-local 1 · tool-external 3 (node scripts) · manual-verification 0

## Findings (severity-sorted)

| ID | Sev | Conf | Dim | Finding | Ref | Effort |
|---|---|---|---|---|---|---|
| A-ARCH-01 | MEDIUM | PROVEN | Architecture | All 4 active dossiers are built twice per build (basePageEntries + projects.json double-emit) | N-A | M |
| A-ARCH-02 | MEDIUM | PROVEN | Architecture | Dossier templates discard ALL computed page data — zero JSON-LD structured data emitted, dead computation in renderProjectPageEntries | N-A | L |
| A-DEBT-04 | MEDIUM | PROVEN | Architecture | Build footgun: missing `template` field silently routes a project to the bare scaffold (past scaffold-overwrite class) | N-A | S |
| B-FUNC-01 | MEDIUM | PROVEN | Build-sec | Contact Netlify function has no rate limiting — email-bomb / abuse-cost vector via Resend | OWASP API4:2023 Unrestricted Resource Consumption; CVSS ~5.3 (AV:N/AC:L/PR:N/UI:N/S:U/C:N/I:N/A:L) | M |
| B-FUNC-02 | MEDIUM | PROVEN | Build-sec | Captcha verification is fail-open when env vars are unset | OWASP A05:2021 Security Misconfiguration; CVSS ~4.3 | S |
| D-OUTDATED-01 | MEDIUM | PROVEN | Deps | resend is 2 major versions behind (4.8.0 installed vs 6.12.4 latest) — runtime email/contact-form dependency | N-A | M |
| A-DEBT-03 | LOW | PROVEN | Architecture | Orphan templates: project.template.html is fully unreferenced; 10 project-*/lfi templates build NO output (archived-only) | N-A | M |
| A-DEBT-05 | LOW | PROVEN | Architecture | Dossier copy-paste debt: 4 standalone full-HTML templates share ~33 identical boilerplate lines, no base layout | N-A | M |
| A-DEBT-06 | LOW | PROVEN | Architecture | 101 orphan i18n keys (defined in both en.json/es.json, referenced nowhere) — non-failing WARN | N-A | S |
| B-CSP-01 | LOW | SUSPECTED | Build-sec | CSP hash pipeline silently no-ops if script-src directive is absent (regex-replace can fail open) and style-src keeps 'unsafe-inline' | OWASP A05:2021; CVSS ~3.1 (depends on future regression) | S |
| B-FUNC-03 | LOW | UNVERIFIABLE | Build-sec | Contact function reflects attacker-controlled email/subject into outbound mail (no header injection found; deliverability/spoofing depends on Resend domain config) | OWASP A04:2021 Insecure Design; CVSS ~3.7 (runtime-dependent) | M |
| B-INCL-01 | LOW | PROVEN | Build-sec | Template @include path resolution is not sandboxed to src/ (no traversal guard) | OWASP A01:2021 Path Traversal (build-time, trusted input); CVSS ~2.0 | S |
| D-OUTDATED-02 | LOW | PROVEN | Deps | Playwright + axe-core dev tooling slightly behind latest (dev-only, low risk) | N-A | S |
| D-PIN-01 | LOW | PROVEN | Deps | All 5 direct dependencies use caret (^) ranges; no engines pin | N-A | S |
| A-ARCH-07 | INFO | PROVEN | Architecture | i18n parity is clean — 1163 keys each direction, zero missing either way | N-A | S |
| A-ARCH-08 | INFO | PROVEN | Architecture | Disabled index sections (services, testimonial) are documented intentional, not negligent dead code | N-A | S |
| A-ARCH-09 | INFO | SUSPECTED | Architecture | Local knowledge graph under-indexes the build/.mjs core; god nodes are test scripts + i18n JSON | N-A | S |
| B-DEV-01 | INFO | PROVEN | Build-sec | Dev static-server traversal guard uses startsWith(root) prefix check (latent sibling-dir bypass, not reachable here) | OWASP A01:2021 (theoretical); CVSS 0.0 (not reachable) | S |
| B-PY-01 | INFO | PROVEN | Build-sec | Python dossier-claim-check.py is injection/ReDoS-safe | N-A (negative finding) | S |
| B-SECRET-01 | INFO | PROVEN | Build-sec | No hardcoded secrets in scripts/netlify.toml; .env excluded from git; clean history | OWASP A07:2021 (negative finding) | S |
| B-SUPPLY-01 | INFO | PROVEN | Build-sec | npm dependency tree clean; no install lifecycle scripts in deps | OWASP A06:2021 (negative finding) | S |
| D-AUDIT-01 | INFO | PROVEN | Deps | Zero known CVEs across full dependency tree (HIGH+ clean, full tree clean) | N-A | S |
| D-LOCK-01 | INFO | PROVEN | Deps | Lockfile present, committed, v3, and consistent (no drift) | N-A | S |
| D-TYPO-01 | INFO | PROVEN | Deps | No typosquat / suspicious dependency names — all resolve to legitimate registry packages | N-A | S |

## Detail

#### A-ARCH-01 — All 4 active dossiers are built twice per build (basePageEntries + projects.json double-emit)
- **Severity:** MEDIUM · **Confidence:** PROVEN (line-proof) · **Source:** code-read · **Effort:** M · **Ref:** N-A
- **Evidence:** scripts/build/config.mjs:17-20 lists scanner-21179/kanban-desk/crm-aglaya/aglaya-outreach as basePageEntries. content/projects.json:4-94 lists the SAME 4 outputs+templates. renderers.mjs:478 `getPageEntries() = [...basePageEntries, ...legacyPageEntries, ...renderProjectPageEntries()]` concatenates both. build-pages.mjs:30 loops getPageEntries() and `fs.writeFileSync(outputPath, rendered)` for each. Verified: node -e count over base+projects outputs prints `scanner-21179.html 2, kanban-desk.html 2, crm-aglaya.html 2, aglaya-outreach.html 2`. Each dossier file is rendered and written twice; the projects.json pass (last) wins.
- **Recommendation:** Pick ONE source of truth for dossiers. Either remove the 4 dossier rows from basePageEntries (config.mjs:17-20) and let renderProjectPageEntries own them, or remove them from projects.json and keep them static in basePageEntries. As-is, the two paths pass conflicting data (see A-ARCH-02) and double the render+write work.

#### A-ARCH-02 — Dossier templates discard ALL computed page data — zero JSON-LD structured data emitted, dead computation in renderProjectPageEntries
- **Severity:** MEDIUM · **Confidence:** PROVEN (proven-by-absence) · **Source:** code-read · **Effort:** L · **Ref:** N-A
- **Evidence:** All 4 dossier templates contain ZERO mustache placeholders: `grep -oE '{{[^}]+}}' src/pages/dossier-*.template.html | wc -l` = 0 each; `grep -c 'pageStructuredDataJson|projectTitle|projectMediaHtml|previousProjectNavHtml' src/pages/dossier-crm-aglaya.template.html` = 0. Yet renderers.mjs:447-473 builds a full `data` object for each (pageTitle, pageStructuredDataJson via createProjectStructuredData() lines 458-464, projectMediaHtml, prev/next nav). context.mjs:75 renderTemplate just substitutes placeholders — with none present, the entire data object is silently dropped. Built output proof: `grep -c application/ld+json crm-aglaya.html` = 0 while `grep -c application/ld+json index.html` = 1. The intended consumer was project.template.html (scaffold) which DOES have `{{{pageStructuredDataJson}}` etc (grep confirmed 15 placeholders).
- **Recommendation:** Dossiers hand-author their <head> meta but emit NO schema.org JSON-LD — a real SEO gap for case-study pages (CreativeWork schema is computed and thrown away). Either (a) add `{{{pageStructuredDataJson}}}` + nav placeholders to the dossier templates so the computed data lands, or (b) stop computing it: if dossiers are fully static, strip them from renderProjectPageEntries and drop the dead createProjectStructuredData call for them. Current state pays the compute cost with zero output benefit.

#### A-DEBT-04 — Build footgun: missing `template` field silently routes a project to the bare scaffold (past scaffold-overwrite class)
- **Severity:** MEDIUM · **Confidence:** PROVEN (line-proof) · **Source:** code-read · **Effort:** S · **Ref:** N-A
- **Evidence:** renderers.mjs:407 `const template = page.template || 'src/pages/project.template.html';` — a project entry in projects.json that omits `page.template` does NOT error; it silently renders the 4KB bare scaffold (project.template.html, confirmed 15 placeholders, no real content) and writes it to `page.output`. Combined with build-pages.mjs:54 unconditional `fs.writeFileSync(outputPath, rendered)`, a typo in the template key overwrites a real built page with the empty scaffold. assertRequired is used for output/title/description (renderers.mjs:406,417) but NOT for template.
- **Recommendation:** Make `template` explicit-or-fail: replace the `|| 'src/pages/project.template.html'` default with `assertRequired(page.template, \`${labelPrefix}.page.template\`)`, OR at minimum verify the template path exists before writing (build-pages.mjs:32 already does fs.existsSync but then `continue`s silently — a missing template = no output AND no error, also a footgun). Fail loud on missing/nonexistent template.

#### B-FUNC-01 — Contact Netlify function has no rate limiting — email-bomb / abuse-cost vector via Resend
- **Severity:** MEDIUM · **Confidence:** PROVEN (line-proof) · **Source:** code-read · **Effort:** M · **Ref:** OWASP API4:2023 Unrestricted Resource Consumption; CVSS ~5.3 (AV:N/AC:L/PR:N/UI:N/S:U/C:N/I:N/A:L)
- **Evidence:** netlify/functions/contact.js:22-24 comments: 'Rate limit por IP: eliminado' and 'Cooldown por sesión PHP: eliminado'. grep for rate-limit/throttle in contact.js returns only those two removal comments — no replacement. Handler (exports.handler, line 113+) gates only on honeypot (l.131), timing 1.2s–24h (l.135-140), optional captcha (l.144), then calls resend.emails.send TWICE per request (auto-reply to attacker-controlled `email` l.186 + owner notification l.205). With captcha unconfigured, a script can POST valid JSON every >1.2s indefinitely.
- **Recommendation:** Add an IP/identity rate limit at the edge: Netlify rate-limiting rule on /.netlify/functions/contact, or a short-window counter (Netlify Blobs / Upstash). Cap auto-reply sends per IP/hour. Treat captcha as mandatory in production (see B-FUNC-02) rather than the only backstop.

#### B-FUNC-02 — Captcha verification is fail-open when env vars are unset
- **Severity:** MEDIUM · **Confidence:** PROVEN (line-proof) · **Source:** code-read · **Effort:** S · **Ref:** OWASP A05:2021 Security Misconfiguration; CVSS ~4.3
- **Evidence:** netlify/functions/contact.js:66-68 shouldEnforceCaptcha() returns true only if PORTFOLIO_CAPTCHA_PROVIDER ∈ {recaptcha,hcaptcha,turnstile} AND PORTFOLIO_CAPTCHA_SECRET !== ''. Handler l.144 `if (shouldEnforceCaptcha()) { ... }` — when either env var is missing the captcha block is skipped entirely and submission proceeds on honeypot+timing only. Same fail-open pattern in dev server scripts/static-server.mjs:17,142 (`hasValidCaptcha = !enforceCaptcha || ...`). No startup assertion forces captcha on in prod.
- **Recommendation:** Fail closed in production: if NODE_ENV/CONTEXT === 'production' and captcha env not configured, log an error and reject (return fail()) rather than silently accepting. Document the required env vars as mandatory in netlify deploy checklist.

#### D-OUTDATED-01 — resend is 2 major versions behind (4.8.0 installed vs 6.12.4 latest) — runtime email/contact-form dependency
- **Severity:** MEDIUM · **Confidence:** PROVEN (tool-output) · **Source:** code-read · **Effort:** M · **Ref:** N-A
- **Evidence:** `npm outdated` -> `resend  4.8.0  4.8.0  6.12.4`. Caret range `^4.0.0` in package.json:29 pins it below v5/v6, so `npm update` will NOT advance it. resend is used at RUNTIME, not just build: netlify/functions/contact.js:28 `const { Resend } = require('resend');` and :182 `new Resend(RESEND_API_KEY)` send contact-form + auto-reply emails (:186, :204) from attacker-controllable form input. This is the site's only production-runtime dependency and processes untrusted user data.
- **Recommendation:** Plan a deliberate upgrade to resend@6.x (changes the dep range to `^6` requires a real bump, not auto). Two majors of unpatched bug/security fixes accumulate on a package that handles untrusted POST bodies. Test the contact function (emails.send signature, replyTo field) after upgrading. Until then, the input sanitization in contact.js (sanitizeSingleLine/sanitizeMultiline/esc) is the mitigating control — confirm it stays intact.

#### A-DEBT-03 — Orphan templates: project.template.html is fully unreferenced; 10 project-*/lfi templates build NO output (archived-only)
- **Severity:** LOW · **Confidence:** PROVEN (line-proof) · **Source:** code-read · **Effort:** M · **Ref:** N-A
- **Evidence:** ls src/pages/ = 18 templates. Built (config.mjs basePageEntries+legacyPageEntries lines 14-43): 404, dossier-aglaya-outreach, dossier-crm-aglaya, dossier-kanban-desk, dossier-scanner-21179, index, lfi-legacy, privacy. content/projects.json templates (active, built): the same 4 dossiers. NEVER built: (a) project.template.html — referenced ONLY as the fallback string at renderers.mjs:407 `page.template || 'src/pages/project.template.html'`, no project entry uses it (grep across config/projects.json/projects.archived.json = 0 data refs); (b) project-debtracker, project-gymtracker, project-brevo-intelligence-layer, project-portfolio-ibaifernandez, lfi, project-ruta-digitalizacion-2x2mkt, project-elm-st, project-aglaya, project-myboard, project-the-research-engine — all referenced in content/projects.archived.json:5..212 but archived projects feed ONLY getManagedProjectOutputs() (renderers.mjs:481-488, used for DELETION at build-pages.mjs:62-80), NOT getPageEntries(). Confirmed on disk: all 10 archived outputs absent at repo root (debtracker.html…the-research-engine.html all `absent`).
- **Recommendation:** Two tiers. (1) project.template.html: truly orphaned scaffold — but it is the silent fallback at renderers.mjs:407, so deleting it without removing the fallback turns a missing-template typo into a crash. Either delete both the file and the fallback (forcing explicit templates), or keep it and document it as the canonical scaffold. (2) The 10 archived templates are intentional frozen references (drive projects.archived.json retirement/redirect tracking + static-server.mjs:177-200 legacy redirects). They are dead-for-build but load-bearing for retirement bookkeeping — move to a clearly-named src/pages/archived/ dir rather than deleting, so the orphan-template lint stops flagging them and intent is explicit.

#### A-DEBT-05 — Dossier copy-paste debt: 4 standalone full-HTML templates share ~33 identical boilerplate lines, no base layout
- **Severity:** LOW · **Confidence:** PROVEN (tool-output) · **Source:** tool-external · **Effort:** M · **Ref:** N-A
- **Evidence:** All 4 dossier templates are complete <!doctype html> documents with hand-duplicated <head> (meta charset/viewport/robots/theme-color, 7 stylesheet links, og/twitter card scaffolding). `comm -12` of the first 50 sorted lines of dossier-scanner-21179 vs dossier-kanban-desk = 33 identical lines. They DO use the @include system (5 includes each: project/sidebar, project/footer-minimal, shared/translate-button, shared/analytics-ga4, shared/cookie-consent — grep confirmed) but the entire <head> + stylesheet block + shell is copy-pasted per file rather than extracted to a shared partial. index.template.html uses 12 @includes by contrast.
- **Recommendation:** Extract the shared dossier <head> (stylesheet links, robots/theme-color meta, og/twitter skeleton) into a src/components/project/dossier-head.html partial parameterized by the existing placeholder mechanism, and @include it in all 4. Cuts ~33 duplicated lines x4 and makes a stylesheet-path change a one-file edit instead of four. Per-page meta (title/description/og:url) stays inline.

#### A-DEBT-06 — 101 orphan i18n keys (defined in both en.json/es.json, referenced nowhere) — non-failing WARN
- **Severity:** LOW · **Confidence:** PROVEN (tool-output) · **Source:** tool-external · **Effort:** S · **Ref:** N-A
- **Evidence:** `node tests/check-i18n.mjs` output: `en.json keys: 1163 / es.json keys: 1163 / translate attrs referenced: 1062 / [WARN] Orphan keys in en.json: 101 (run with --strict to fail) / [OK] i18n checks passed`. A dedicated cleanup tool already exists: scripts/purge-orphan-i18n.mjs (`removes orphan keys from en.json and es.json`, supports --dry-run). The check is wired into test:quality (check-i18n.mjs header comment) but runs WITHOUT --strict, so 101 orphans accumulate silently.
- **Recommendation:** Run `node scripts/purge-orphan-i18n.mjs --dry-run` to review the 101, then purge. Going forward, decide policy: either run check-i18n with --strict in CI to block new orphans, or schedule periodic purges. Note many orphans are likely from the archived project templates (project-debtracker-*, project-myboard-*, etc. confirmed present at en.json:605-616) — purging them is safe only once those templates are formally retired (A-DEBT-03).

#### B-CSP-01 — CSP hash pipeline silently no-ops if script-src directive is absent (regex-replace can fail open) and style-src keeps 'unsafe-inline'
- **Severity:** LOW · **Confidence:** SUSPECTED (line-proof) · **Source:** code-read · **Effort:** S · **Ref:** OWASP A05:2021; CVSS ~3.1 (depends on future regression)
- **Evidence:** scripts/build/csp-hashes.mjs:90 `currentCsp.replace(/script-src[^;]+;/, scriptSrcValue)` — String.replace with no match returns the string unchanged: if a future edit drops/renames the script-src token, syncCspHashes reports updated:false (l.92-93) and NEVER errors, so the inline-script hashes would silently not be enforced. The outer cspLineRe (l.81) does throw if the whole CSP line is missing, but not if only script-src within it is missing. Separately, netlify.toml:229 style-src still 'unsafe-inline' (acknowledged in comment l.224-227). Current build is consistent: 4 sha256 hashes present in netlify.toml:229 match the 4 inline scripts; handlerHashes=0 so 'unsafe-hashes' correctly omitted.
- **Recommendation:** Make the script-src replace assert a match: if `!/script-src[^;]+;/.test(currentCsp)` throw, so the pipeline fails loudly instead of leaving inline-script hashes unenforced. style-src 'unsafe-inline' is a documented tradeoff (95+ inline style attrs); lower priority but track for eventual hash/nonce migration.

#### B-FUNC-03 — Contact function reflects attacker-controlled email/subject into outbound mail (no header injection found; deliverability/spoofing depends on Resend domain config)
- **Severity:** LOW · **Confidence:** UNVERIFIABLE (NV_RUNTIME) · **Source:** manual-verification · **Effort:** M · **Ref:** OWASP A04:2021 Insecure Design; CVSS ~3.7 (runtime-dependent)
- **Evidence:** netlify/functions/contact.js: replyTo set to attacker `email` (l.205) and auto-reply `to:[email]` (l.187); subject from sanitizeSingleLine strips CR/LF (l.59) and email validated /^[^\s@]+@[^\s@]+\.[^\s@]+$/ (l.166) — so SMTP/header injection is blocked, and HTML body is escaped via esc() (l.181-185). Residual risk (auto-reply to forged sender = backscatter/abuse amplification, plus FROM_EMAIL spoofing if SPF/DKIM/DMARC not enforced on the Resend domain) cannot be confirmed without the deployed Resend/DNS config.
- **Recommendation:** Verify SPF/DKIM/DMARC are configured for the Resend sending domain (out-of-band). Consider not auto-replying until the address is proven (or gate auto-reply behind successful captcha) to avoid backscatter amplification; combine with B-FUNC-01 rate limiting.

#### B-INCL-01 — Template @include path resolution is not sandboxed to src/ (no traversal guard)
- **Severity:** LOW · **Confidence:** PROVEN (line-proof) · **Source:** manual-verification · **Effort:** S · **Ref:** OWASP A01:2021 Path Traversal (build-time, trusted input); CVSS ~2.0
- **Evidence:** scripts/build/context.mjs:58-66 renderWithIncludes resolves include targets with `path.resolve(path.dirname(absolutePath), includePath)` then recurses on the relative path — there is NO check that `resolved` stays within rootDir or src/. includePattern (template-utils.mjs:1) captures `[^\s]+`, so `<!-- @include ../../../../etc/hosts -->` would resolve and be read+inlined into output. Mitigant: include directives come only from repo-controlled templates in src/pages and src/components (config.mjs:15-21), not from untrusted input, so exploit requires commit access.
- **Recommendation:** Defense-in-depth: after path.resolve, assert `resolved.startsWith(path.resolve(rootDir,'src')+path.sep)` (or rootDir) and throw on escape. Cheap guard that prevents a malicious/compromised template or future content-driven include from reading arbitrary files.

#### D-OUTDATED-02 — Playwright + axe-core dev tooling slightly behind latest (dev-only, low risk)
- **Severity:** LOW · **Confidence:** PROVEN (tool-output) · **Source:** tool-external · **Effort:** S · **Ref:** N-A
- **Evidence:** `npm outdated` -> `@playwright/test 1.58.2 -> wanted 1.60.0 -> latest 1.60.0`; `@axe-core/playwright 4.11.1 -> 4.11.3 (latest 4.11.3)`. Both are devDependencies (package.json:31-35) — not shipped to production. `npm view`: terser latest=5.48.0 (current, matches) and csso latest=5.0.5 (current, matches), so build minifiers are fully up to date.
- **Recommendation:** Low priority. Run `npm update @playwright/test @axe-core/playwright` to pick up patch/minor fixes (caret ranges allow it within current major). Browser test tooling currency mainly affects CI reliability, not production attack surface.

#### D-PIN-01 — All 5 direct dependencies use caret (^) ranges; no engines pin
- **Severity:** LOW · **Confidence:** PROVEN (line-proof) · **Source:** code-read · **Effort:** S · **Ref:** N-A
- **Evidence:** package.json:28-36 — resend `^4.0.0`, @axe-core/playwright `^4.11.1`, @playwright/test `^1.49.0`, csso `^5.0.5`, terser `^5.48.0`. `node -e` on package.json: engines = NONE. Caret allows transitive/minor float; mitigated in practice because the committed lockfile (D-LOCK-01) pins exact resolved versions for reproducible installs via `npm ci`.
- **Recommendation:** Acceptable for a small project given the lockfile is committed and CI uses npm ci. Optional hardening: add an `engines` field (e.g. node >=20) so Netlify build pins the runtime; consider exact-pinning the single runtime dep `resend` once on v6 to avoid surprise minor bumps in the email path.

#### A-ARCH-07 — i18n parity is clean — 1163 keys each direction, zero missing either way
- **Severity:** INFO · **Confidence:** PROVEN (line-proof) · **Source:** code-read · **Effort:** S · **Ref:** N-A
- **Evidence:** node -e over en.json/es.json top-level keys: `en keys: 1163 / es keys: 1163 / keys in EN but missing in ES: 0 [] / keys in ES but missing in EN: 0 []`. Confirms the build's check-i18n parity guard (check-i18n.mjs:3 'FAIL on parity break') is holding. Reported as an explicit NON-finding to bound the audit: there is no EN/ES drift.
- **Recommendation:** No action. Parity guard working as designed; keep test:i18n in the quality chain.

#### A-ARCH-08 — Disabled index sections (services, testimonial) are documented intentional, not negligent dead code
- **Severity:** INFO · **Confidence:** PROVEN (line-proof) · **Source:** code-read · **Effort:** S · **Ref:** N-A
- **Evidence:** index.template.html:437-438 and :466-467 use `@include-DISABLED` with multi-line comments explicitly stating the markup/content/renderer/i18n are 'preserved' and giving exact re-enable instructions ('change @include-DISABLED back to @include on the next line'). The renderers ('services-grid' renderers.mjs:386, 'testimonials-slides' :385) and content/services.json, content/testimonials.json remain wired. This is parked-feature debt, not orphaned code.
- **Recommendation:** Low priority. If services/testimonials are not returning, eventually delete the disabled includes + their components (service-card.html, services-group.html, services-section.html, testimonial-section.html, testimonial-slide.html) + content JSON + renderers to shed the carrying cost. If a re-enable is planned, leave as-is — the in-place docs are good practice.

#### A-ARCH-09 — Local knowledge graph under-indexes the build/.mjs core; god nodes are test scripts + i18n JSON
- **Severity:** INFO · **Confidence:** SUSPECTED (graph-suspicion) · **Source:** graph-local · **Effort:** S · **Ref:** N-A
- **Evidence:** graphify query 'god nodes top connected' returned only check-links.mjs / check-performance-budget.mjs functions (communities 7,9). 'communities low cohesion high size' and 'surprising connections cross community' both surfaced only en.json/es.json string keys (communities 0,1). `graphify explain 'config.mjs'` = 'No node matching found'. The build coupling (config.mjs ↔ renderers.mjs ↔ build-pages.mjs ↔ projects.json) — the actual architectural hot-path proven in A-ARCH-01/02/04 — is largely absent from the graph, so graph-derived 'god node' refactor signals would mislead here. Could not line-prove WHY (likely .graphifyignore or AST extractor coverage of .mjs vs JSON volume).
- **Recommendation:** Treat graphify god-node/community output for this repo as i18n/test-weighted, not build-architecture-weighted — read scripts/build/*.mjs raw for build questions (as this audit did). Optionally check .graphifyignore and re-run `graphify update .` to see if the build .mjs layer can be better indexed; if the JSON dictionaries are drowning the signal, consider ignoring en.json/es.json in the graph so structural code surfaces.

#### B-DEV-01 — Dev static-server traversal guard uses startsWith(root) prefix check (latent sibling-dir bypass, not reachable here)
- **Severity:** INFO · **Confidence:** PROVEN (line-proof) · **Source:** manual-verification · **Effort:** S · **Ref:** OWASP A01:2021 (theoretical); CVSS 0.0 (not reachable)
- **Evidence:** scripts/static-server.mjs:228-231 `const fullPath = path.resolve(root, '.'+pathname); if (!fullPath.startsWith(root)) return 403`. Verified via node repl: pathname '/../../../../etc/passwd' → '/etc/passwd' → allowed:false (correctly blocked, because pathname starts with '/' so escapes resolve ABOVE root and fail startsWith). The classic prefix bypass target `<root>-secrets/file` does startWith(root)=true, BUT path.resolve(root,'.'+pathname) cannot produce a sibling path without a leading '../' that escapes above root first. Server also binds 127.0.0.1 only (l.10) and is dev-only (npm start). So not exploitable, but the guard is a known-fragile idiom.
- **Recommendation:** Harden idiom for future-proofing: compare against `root + path.sep` (i.e. `fullPath === root || fullPath.startsWith(root + path.sep)`). No urgency — localhost-bound dev tool.

#### B-PY-01 — Python dossier-claim-check.py is injection/ReDoS-safe
- **Severity:** INFO · **Confidence:** PROVEN (tool-output) · **Source:** tool-external · **Effort:** S · **Ref:** N-A (negative finding)
- **Evidence:** scripts/dossier-claim-check.py: subprocess.run with fixed arg list ['git','diff',...] no shell=True (l.146-152) → no command injection; allowlist loaded via json.loads (l.91) or hand-rolled parse_simple_yaml (l.96) — NO yaml.load/eval/exec anywhere (grep confirmed). ReDoS test on adversarial inputs (5000x 'cerca de '+x; 20000-digit version; 50000 spaces) all completed <2ms: 'counts-regex adversarial: 0.0009 s', 'version-regex: 0.0002 s', 'counts ws-heavy: 0.0019 s'. Allowlist regex compiled in try/except re.error (l.184-188).
- **Recommendation:** No action needed. Optionally cap input size read at l.227 if dossiers could ever become attacker-supplied, but current inputs are repo-controlled.

#### B-SECRET-01 — No hardcoded secrets in scripts/netlify.toml; .env excluded from git; clean history
- **Severity:** INFO · **Confidence:** PROVEN (proven-by-absence) · **Source:** code-read · **Effort:** S · **Ref:** OWASP A07:2021 (negative finding)
- **Evidence:** grep -rniE 'api_key|secret|token|sk_live|sk_test|ghp_|AKIA…|re_…' over scripts/ + netlify/ + netlify.toml returns only process.env references (contact.js:177,182 RESEND_API_KEY via process.env; static-server.mjs:15-16 captcha via process.env) and CSP sha256- hashes — no literal credentials. `git log --all -- .env '*.env'` returns empty; `git ls-files | grep env/secret/credential` empty; .gitignore l.15-16 ignores .env and .env.*. RESEND_API_KEY/CAPTCHA_SECRET sourced only from env.
- **Recommendation:** No action. Keep secrets in Netlify env UI as currently documented in contact.js header comment.

#### B-SUPPLY-01 — npm dependency tree clean; no install lifecycle scripts in deps
- **Severity:** INFO · **Confidence:** PROVEN (tool-output) · **Source:** tool-external · **Effort:** S · **Ref:** OWASP A06:2021 (negative finding)
- **Evidence:** `npm audit --omit=dev --audit-level=high` → 'found 0 vulnerabilities'; full-tree `npm audit --audit-level=high` → 'found 0 vulnerabilities'. find node_modules -maxdepth 2 package.json | xargs grep -l postinstall/preinstall/install → no matches. Only runtime dep is resend ^4.0.0 (package.json:29); build/test deps (csso, terser, playwright, axe) are dev-only.
- **Recommendation:** Deps are caret-ranged (^). For reproducible CI builds, commit/keep package-lock.json and use `npm ci`. Periodically re-run npm audit; consider Dependabot/renovate.

#### D-AUDIT-01 — Zero known CVEs across full dependency tree (HIGH+ clean, full tree clean)
- **Severity:** INFO · **Confidence:** PROVEN (tool-output) · **Source:** tool-external · **Effort:** S · **Ref:** N-A
- **Evidence:** cmd `npm audit --audit-level=low` -> `found 0 vulnerabilities` (exit 0). cmd `npm audit --omit=dev --audit-level=high` -> `found 0 vulnerabilities` (exit 0). `npm audit --json` metadata.vulnerabilities = {info:0,low:0,moderate:0,high:0,critical:0,total:0}. Tree spans 42 packages incl. transitive react@19.2.4, prettier@3.8.1, html-to-text@9.0.5, acorn@8.16.0 — all clean.
- **Recommendation:** No action required for CVEs. State is clean. Re-run `npm audit` in CI on each build to catch regressions; the repo already has test:quality/test:ci scripts where an `npm audit --audit-level=high` gate could be added cheaply.

#### D-LOCK-01 — Lockfile present, committed, v3, and consistent (no drift)
- **Severity:** INFO · **Confidence:** PROVEN (line-proof) · **Source:** tool-external · **Effort:** S · **Ref:** N-A
- **Evidence:** `git ls-files package-lock.json` -> `package-lock.json` (tracked). lockfileVersion=3 (node -e on package-lock.json). `npm ci --dry-run` -> `added 42 packages in 185ms` exit 0 (no drift between package.json, lockfile, and node_modules). Lock-recorded versions match installed: resend 4.8.0, @playwright/test 1.58.2, @axe-core/playwright 4.11.1, csso 5.0.5, terser 5.48.0.
- **Recommendation:** Healthy. Keep using `npm ci` (not `npm install`) in CI/Netlify build to enforce the lockfile and prevent silent transitive drift.

#### D-TYPO-01 — No typosquat / suspicious dependency names — all resolve to legitimate registry packages
- **Severity:** INFO · **Confidence:** PROVEN (tool-output) · **Source:** tool-external · **Effort:** S · **Ref:** N-A
- **Evidence:** `npm ls --all` shows the full tree; direct deps (resend, @playwright/test, @axe-core/playwright, csso, terser) are all well-known packages. `npm view` returned valid latest tags for each from the real registry (resend 6.12.4, @playwright/test 1.60.0, @axe-core/playwright 4.11.3, terser 5.48.0, csso 5.0.5). Transitive deps (react, prettier, html-to-text, acorn, css-tree, @jridgewell/*) are all mainstream and covered by the clean audit (D-AUDIT-01).
- **Recommendation:** No action. Dependency surface is small (1 runtime dep, 4 dev) and names are clean. The largest transitive surface comes from resend pulling @react-email/render (react@19, react-dom, prettier) — upgrading resend (D-OUTDATED-01) will also refresh that subtree.
