# 02 — Security & Compliance Audit

**Date:** 2026-05-22
**Auditor:** Claude Opus 4.7 (1M context)
**Repo:** portfolio-ibaifernandez @ `1cabf77` (main)

---

## Executive summary

Defense-in-depth on the contact form is **genuinely good**: honeypot + timing + Cloudflare Turnstile + server-side sanitization + Resend integration with HTML-escaped output. CSP, security headers, and quality guards are mostly correct. **However**, the perimeter has soft spots that contradict the brand narrative (this site is positioned as RegTech / compliance-aware):

Top 3 issues:
1. **P0 — CSP is Report-Only after 14+ months in this state.** Phase 6 promotion to enforce mode has been "pending" since 2026-03-03 per `docs/SECURITY.md` and `docs/ROADMAP.md`. Effectively the CSP is documentation, not protection. The site's positioning ("RegTech pipelines — shipping under regulation") rings hollow when its own CSP isn't enforced.
2. **P1 — CSP allows `'unsafe-inline'` on script-src AND style-src.** This neutralizes 90% of the protective value of CSP against XSS. Inline `<script>` for GA4 init, structured data, and `PORTFOLIO_RUNTIME` all need `'unsafe-inline'` to run, so removing it requires migrating to nonces or external files. Same for style-src (many inline `style="..."` in templates).
3. **P1 — No CORS check on contact function.** `netlify/functions/contact.js` accepts POST from any origin. Combined with no rate-limit (intentional per SECURITY.md — relying on Turnstile), a bot that solves Turnstile once can replay the token to flood Resend until the API key burns through quota.

---

## Findings by severity

### P0
- **CSP frozen in Report-Only.** `netlify.toml:194` and `docs/SECURITY.md:32-35` both note this. SECURITY.md says "deferred until post-v2 hardening" with no date. It's been deferred for 2+ months. **Impact:** CSP provides zero runtime protection. Any inline `onerror=`, `javascript:` URI, or DOM-XSS payload injected via any future content path executes freely. Promote NOW.
- **No `Strict-Transport-Security` header set explicitly.** Netlify CDN enforces HTTPS but does NOT auto-inject HSTS. Without HSTS, a user visiting `http://portfolio.ibaifernandez.com` once is vulnerable to a MITM downgrade on subsequent visits before the TLS redirect.
- **JSON-LD references an image that no longer exists.** `index.html:68` declares `"image": "https://portfolio.ibaifernandez.com/assets/images/ibai-fernandez-1.jpg"`. The file was renamed in commit `3417b52` to `ibai-fernandez-1x1-sidebar.{avif,webp,jpeg}`. JSON-LD now produces a 404. Same broken reference in `scripts/build/renderers.mjs:43` for all project dossier structured-data payloads. **Not strictly a security issue, but a data-integrity bug surfaced during this audit.**

### P1
- **`'unsafe-inline'` in CSP script-src AND style-src** (`netlify.toml:194`). The point of CSP is to disallow inline scripts to prevent XSS. With `'unsafe-inline'`, the directive's `'self'` clause means little. To fix: nonce all `<script>` blocks (3 inline scripts in `index.html`: JSON-LD, font preload onload, GA4 init), move `PORTFOLIO_RUNTIME` to a separate file, eliminate inline `style="..."` attributes in templates.
- **No CORS check** on `netlify/functions/contact.js`. Function accepts POST from any origin. `docs/SECURITY.md:166` acknowledges this ("No explicit CORS check in production function — Accepted for now"). Combined with no IP rate-limit, the only abuse barrier is Turnstile. A bot can render the form in a headless browser, solve Turnstile (Cloudflare Turnstile is widely solved by anti-captcha services for ~$0.001/solve), and replay against the endpoint.
- **No server-side rate limiting at all.** Honeypot, timing, and Turnstile catch bots. They don't catch a determined human spammer or a small army of headless browsers with paid Turnstile bypass. **Recommendation:** add an Edge Function or middleware that throttles by `x-nf-client-connection-ip` to ~5 requests/minute. Even an in-memory LRU sufficient for one Netlify region would significantly raise abuse cost. Persistent rate limiting needs Netlify Blobs or external store (Redis/Upstash).
- **No SRI (Subresource Integrity) on Google Fonts.** `index.html:34` loads `https://fonts.googleapis.com/css2?family=Roboto:wght@...` with no `integrity=` hash. If Google's CDN is ever compromised (yes, it can happen), the site loads attacker CSS. SRI for stylesheets requires `integrity` + `crossorigin`. Acknowledged in SECURITY.md table as "Backlog".
- **`img-src https:`** in CSP. Allows images from *any* HTTPS origin. Should be `'self' data:` plus the explicit external image origins (Resend in case profile images come from CDN? Currently none — so just `'self' data:`).
- **`Content-Security-Policy` allows `frame-src` from YouTube** but no other frames are needed. Confirmed in templates. Fine, but if YouTube embeds are removed (e.g. from elm-st.html), drop the directive.

### P2
- **Error responses leak nothing — almost too well.** `netlify/functions/contact.js` returns `200` with body `'0'` for every failure. Good for not leaking the reason (sanitization, captcha fail, timing) but bad for diagnosing legitimate user errors. Frontend `custom.js` has to guess by error class. A structured JSON response with a sanitized error code (`{"ok": false, "code": "TIMING"}`) would be more honest. Acknowledged trade-off in code comment line 62.
- **`getClientIp()` reads three headers in priority order**: `x-nf-client-connection-ip`, `cf-connecting-ip`, `x-forwarded-for`. Reasonable, but `x-forwarded-for` is trivially forgeable upstream. Should be **last resort** only. Current order is fine because Netlify's `x-nf-client-connection-ip` is authoritative when present; just verify Netlify always sets it.
- **`docs/SECURITY.md:117` claims "No production npm dependencies (zero npm packages shipped to users)"** — strictly true (no client-side npm), but the *function bundle* ships `resend@4.8.0` + 12 transitive deps including `react@19`, `react-dom@19`, `prettier@3.8`, `html-to-text@9`. The bundle runs server-side in Netlify Functions, so it's not "shipped to users" — but it IS executed on every form submission. Recent CVEs in `prettier` or `html-to-text` would matter. **Recommendation:** schedule `npm audit` in CI.
- **`resend@4.8.0`** transitively depends on `@react-email/render@1.1.2` which pulls react/react-dom. Resend itself is solid. But that's ~5 MB of dependency tree for sending two email templates. **Recommendation:** consider raw `fetch()` to the Resend HTTP API (it's a simple POST), drop `resend` from package.json. Same security, 5 MB lighter.
- **`config/secrets.example.php`** still committed. Not a real secret, just an example template from PHP era. Delete. Triggers human alarm in casual audits.
- **`.gitignore` lists `.env` but not `.env.netlify`** or `netlify.toml.local`. If user ever uses these, they leak.
- **Robots.txt disallows `lfi-legacy.html`.** Good for SEO hygiene, but `lfi-legacy.html` is committed and publicly URL-accessible. Any human visiting the URL directly sees archived content. Not strictly security, but worth a note: search engines respect robots.txt, attackers and curious users don't.
- **`assets/js/translate.js:75` uses `innerHTML`** to inject JSON values for `[translate-html]` elements. If en.json/es.json are ever editable by anyone other than repo owner (e.g. via CMS, PR contribution), this is an XSS surface. Current state — values are trusted (only repo owner edits) — but the **defense** is brittle (one bad PR away from broken). Add a sanitizer or use DOMPurify.

### P3
- **Permissions-Policy** is minimal (`geolocation=(), microphone=(), camera=()`). Modern best practice adds `interest-cohort=()`, `usb=()`, `payment=()`, etc. Cheap to extend.
- **No `Cross-Origin-Embedder-Policy` / `Cross-Origin-Opener-Policy`** headers. Would enable `SharedArrayBuffer` and harden cross-origin info leaks. Low value for a static portfolio.
- **DNSSEC not validated.** Acknowledged in SECURITY.md backlog.
- **`netlify.toml` redirects use `status = 308`** (Permanent Redirect, preserves method). Correct. Cosmetic note: some platforms historically expect 301 for SEO. Modern Google handles both, so 308 is fine.
- **`.htaccess` and `.cpanel.yml`** still committed — would be cargo-culted by curious agents into thinking Apache is involved. Already flagged in Architecture audit.

---

## Detailed analysis

### Contact form security (`netlify/functions/contact.js`)

**Layered defense — strong:**

1. **Method check** (line 114): only POST. ✓
2. **JSON parse with try/catch** (line 122): no crash on malformed body. ✓
3. **`form_type === 'contact'` guard** (line 130). ✓
4. **Honeypot `website` field** (line 133): must be empty. ✓
5. **Timing check** (line 136-140): `form_started_at` must be 1.2s–24h in the past. ✓
6. **Optional captcha** (line 143-147): Turnstile/reCAPTCHA/hCaptcha, with 8s timeout on verification. ✓
7. **Sanitization** (line 150-160): length-limited, newline-collapsed for single-line fields, email regex. ✓
8. **HTML escape on output** (line 169-174): `&`, `<`, `>`, `"`, `'`. ✓
9. **Resend SDK** (line 182): API key from env. ✓ (never committed)

**Weaknesses:**

- No CORS check — see P1.
- No rate limit — see P1.
- Returns `200` with body `'0'` for all failures (line 64). Frontend can't distinguish "captcha failed" from "invalid email" — gracefully degrades to "try again". Mild UX cost.
- `formStartedAt = parseInt(body.form_started_at)` (line 136) — if the client passes a string like `"abc"`, `parseInt("abc")` returns `NaN`, `Date.now() - NaN === NaN`, `NaN < 1200` is false, `NaN > 86_400_000` is false → would **pass the timing check**. Edge case but real. Fix: `Number.isFinite(formStartedAt) && formStartedAt > 0`.

### HTTP headers (`netlify.toml:184-194`)

| Header | Value | Verdict |
|---|---|---|
| X-Frame-Options | SAMEORIGIN | ✓ |
| X-Content-Type-Options | nosniff | ✓ |
| Referrer-Policy | strict-origin-when-cross-origin | ✓ |
| Permissions-Policy | geolocation=(), microphone=(), camera=() | OK, could be richer |
| Cross-Origin-Resource-Policy | same-site | ✓ |
| Content-Security-Policy-Report-Only | (long policy) | ⚠️ Report-Only forever |
| Strict-Transport-Security | **MISSING** | P0 |

### Quality guards (`tests/quality-guards.sh`)

Strong:
- Blocks `eval(` in custom.js (line 15)
- Blocks `href=""` and `href="javascript:;"` (line 19)
- Blocks `https://https://` (line 23)
- Blocks legacy assets `banner-bg.gif`, `bootstrap.min.js` from reappearing (line 27-33)
- Asserts security headers present in netlify.toml (line 35-43)
- Asserts no hardcoded secrets in netlify.toml (line 45-51)
- Asserts honeypot + timing fields in index.html (line 53-58)
- Asserts captcha fields in index.html (line 59-61)
- Asserts anti-spam in contact.js (line 62-64)
- Asserts skip-link present (line 80-82)
- Asserts `contact-response` container with `aria-live=polite` (line 92-98)
- Validates target-blank hardening (line 133)
- Validates `prefers-reduced-motion` baseline (line 125-127)
- Validates `focus-visible` baseline (line 129-131)

**Gap:** none of the checks scan dossier pages (`lfi.html`, `elm-st.html`, `aglaya.html`, `ruta-de-la-digitalizacion-y-2x2-mkt.html`, `cv-print.html`). All checks scope to `index.html`. If a dossier had a `href=""` or missing `aria-live`, it wouldn't be caught.

### Secrets management

`docs/SECURITY.md` lays out the secret model clearly. Netlify env vars hold `RESEND_API_KEY`, `PORTFOLIO_CAPTCHA_SECRET`, `FROM_EMAIL`, `TO_EMAIL`. Code reads via `process.env.*` with sensible defaults. `quality-guards.sh` blocks accidental commits of these keys to `netlify.toml`. **Solid.**

Confirmed via inspection:
- No `RESEND_API_KEY=` in any committed file.
- No `PORTFOLIO_CAPTCHA_SECRET=` in any committed file.
- No `.env` files committed.
- `config/secrets.example.php` is the only "secrets" file and it's an empty template.

### XSS surface

**Untrusted inputs** (from user via contact form):
1. `first_name`, `last_name`, `email`, `subject`, `message` → all sanitized + HTML-escaped before insertion into outbound emails. ✓

**Server-trusted inputs that touch the DOM:**
1. `en.json` / `es.json` translation values → injected via `innerText` for `[translate]` (safe) AND `innerHTML` for `[translate-html]` (`assets/js/translate.js:75`). The latter is XSS if any JSON value contains a `<script>` or `<img onerror>`. Currently safe because repo owner controls JSON. **Recommendation:** add a CI check that `en.json` and `es.json` contain no `<script`, `<iframe`, or `on<word>=` patterns.

**Untrusted inputs that are framed for the user:**
1. URL `?lang=es` parameter — read in `translate.js:51`. Validated to `en|es` only — safe.

### Compliance / privacy

`docs/SECURITY.md:175-181` states:
> "This portfolio does not collect, store, or process personal data beyond contact form submissions (email, name, message) — delivered via Resend and not stored. IP addresses — may be forwarded transiently to captcha providers during verification, but are not persisted by the site itself."

**Observations:**
- **GA4 IS active in production** (`src/components/shared/analytics-ga4.html:2`). GA4 collects IP, user-agent, language, screen size, page views. EU users → GDPR consent required.
- **No cookie consent banner** found in the codebase. Search for `cookie`, `consent`, `gdpr` returns nothing.
- This contradicts the "no cookies set by the portfolio itself" claim in SECURITY.md — GA4 sets `_ga`, `_ga_T8FTTWBQS3` cookies.
- **Brand contradiction:** the site markets "Scanner 21.179 — Chile data privacy regulation". The owner positions himself as RegTech-aware. Yet his own site fails GDPR cookie consent. **High-impact PR risk** if anyone scrutinizes.

`window.PORTFOLIO_RUNTIME.analytics.enabled` (line 11 of analytics-ga4.html) exists as a toggle. There's a runtime feature flag for analytics. **Recommendation:** wire it to a real consent banner. Until then, default `enabled: false` for EU traffic via simple `Accept-Language` / IP region check.

### Dependency CVEs

```
resend@4.8.0
├── @react-email/render@1.1.2
│   ├── html-to-text@9.0.5
│   ├── prettier@3.8.1
│   └── react-promise-suspense@0.3.4
@playwright/test@1.58.2
@axe-core/playwright@4.11.1
└── axe-core@4.11.1
```

All current versions. No `npm audit` was run, but no obvious red flags. **Recommendation:** add `npm audit --audit-level=high` to CI as a non-blocking warn step.

---

## Recommendations (prioritized)

1. **Promote CSP from Report-Only to enforce.** This is the most consequential security action available. Nonce inline scripts; move `PORTFOLIO_RUNTIME` to its own file. Estimate: 2-3 hours of focused work. **Highest impact.**
2. **Add HSTS header.** One line in `netlify.toml`: `Strict-Transport-Security = "max-age=63072000; includeSubDomains; preload"`. After 1 week of stability, submit to HSTS preload list.
3. **Add GDPR cookie consent banner.** Either use a managed solution (Cookiebot, Klaro, Osano) or build a simple one. Wire to `window.PORTFOLIO_RUNTIME.analytics.enabled`. **Brand-critical** for a RegTech-positioned site.
4. **Add server-side rate limit** on `netlify/functions/contact.js`. Even crude (`Map<ip, [timestamps]>` checked per request, with a 5 req/min cap) raises the abuse cost dramatically.
5. **Tighten CSP `img-src` from `https:` to `'self' data:`** unless a specific external image origin is needed.
6. **Fix the broken JSON-LD image URL** (`index.html:68` + `scripts/build/renderers.mjs:43`). Update to `ibai-fernandez-1x1-sidebar.jpeg`.
7. **Fix `formStartedAt` NaN edge case** in `contact.js:136`. Use `Number.isFinite()`.
8. **Add `npm audit` step in CI** (non-blocking warn). Add Dependabot config.
9. **Delete `config/secrets.example.php`, `.htaccess`, `.cpanel.yml`** as part of legacy cleanup.
10. **Document the consent / privacy posture** in a real `/privacy` page linked from footer. Required if GA4 stays.

---

*End of security audit.*
