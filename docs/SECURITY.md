# SECURITY.md — Security Policy

**Last updated:** 2026-03-03

---

## 1. Security Architecture Overview

The portfolio has three attack surfaces:
1. **Static assets** (HTML, CSS, JS) — served from Netlify CDN
2. **Contact form endpoint** (`/.netlify/functions/contact`) — serverless function
3. **Infrastructure** (Netlify, GitHub, DNS) — managed services

---

## 2. HTTP Security Headers

All responses include the following headers, set in `.htaccess` and validated by `tests/quality-guards.sh`:

| Header | Value | Purpose |
|---|---|---|
| `X-Frame-Options` | `SAMEORIGIN` | Clickjacking prevention |
| `X-Content-Type-Options` | `nosniff` | MIME-type sniffing prevention |
| `Referrer-Policy` | `strict-origin-when-cross-origin` | Referrer data minimization |
| `Permissions-Policy` | `camera=(), microphone=(), geolocation=()` | Feature policy |
| `Strict-Transport-Security` | `max-age=31536000; includeSubDomains` | HSTS |

### Content Security Policy

Currently in **report-only mode**:

```
Content-Security-Policy-Report-Only: default-src 'self'; ...
```

**Pending action:** Promote to enforce mode (`Content-Security-Policy`) after validating zero violations in report-only mode for a minimum of 2 weeks. See `docs/ROADMAP.md` Phase 6.

---

## 3. Contact Form Security

The contact form is protected by multiple layers:

### Layer 1 — Honeypot field
- Field name: `website`
- Hidden from real users via CSS
- If non-empty → request rejected silently (returns 200 to fool bots)

### Layer 2 — Timing check
- Field: `form_started_at` (timestamp populated on page load by JS)
- If form submitted in under 3 seconds → bot detection triggered

### Layer 3 — Rate limiting
- Enforced in `netlify/functions/contact.mjs`
- Environment variables: `PORTFOLIO_RATE_LIMIT_WINDOW_SECONDS` (default: 600), `PORTFOLIO_RATE_LIMIT_MAX_REQUESTS` (default: 12)
- Per-IP tracking within the function execution context

### Layer 4 — Cloudflare Turnstile (ready, pending activation)
- Frontend: `captcha_provider` and `captcha_token` fields in form
- Backend: token verified via Turnstile API before processing
- Activation: set `PORTFOLIO_CAPTCHA_PROVIDER=turnstile` and `PORTFOLIO_CAPTCHA_SECRET` in Netlify environment variables
- See `docs/ENGINEERING-RUNBOOK.md` for Turnstile key rotation procedure

### Layer 5 — Input validation
- All fields validated server-side (type, length, format)
- Email format validated with regex
- Message length capped
- No direct use of input in SQL, shell, or template interpolation

### Layer 6 — CORS
- `ALLOWED_ORIGIN` environment variable controls which origin may POST to the function
- Set to production domain (`https://ibaifernandez.com`)
- Requests from other origins are rejected with `403`

---

## 4. Secret Management

### Principles
- **Never commit secrets.** API keys, captcha secrets, and passwords must never appear in any committed file.
- **Never put secrets in `.htaccess`.** Quality guards block commits containing `PORTFOLIO_CAPTCHA_SECRET=` in `.htaccess`.

### Production secrets (Netlify environment variables)

| Variable | Purpose | Where to set |
|---|---|---|
| `RESEND_API_KEY` | Resend transactional email | Netlify Dashboard → Site → Environment Variables |
| `PORTFOLIO_CAPTCHA_SECRET` | Turnstile verification secret | Netlify Dashboard |
| `ALLOWED_ORIGIN` | CORS allowed origin | Netlify Dashboard |
| `FROM_EMAIL` | Sender address | Netlify Dashboard |
| `TO_EMAIL` | Recipient address | Netlify Dashboard |

### Local development secrets

Option A (recommended): `config/secrets.local.php` (gitignored)
```php
<?php
// This file is gitignored. Never commit.
define('PORTFOLIO_CAPTCHA_SECRET', 'your-secret-here');
```

Option B: `.env` file (gitignored) loaded by `netlify dev`

### Secret rotation procedure (Turnstile)

1. Log in to Cloudflare Turnstile dashboard → rotate site key
2. Update `PORTFOLIO_CAPTCHA_SECRET` in Netlify environment variables
3. Update `window.PORTFOLIO_RUNTIME.captcha.siteKey` in `src/components/shared/analytics-ga4.html`
4. Rebuild + deploy
5. Verify form submission works in production
6. Revoke the old secret in Cloudflare dashboard

---

## 5. JavaScript Security

| Rule | Status |
|---|---|
| No `eval()` in `assets/js/form.js` | ✅ Enforced by quality guard |
| All `target="_blank"` have `rel="noopener noreferrer"` | ✅ Enforced by quality guard |
| No inline event handlers (`onclick=`) | ✅ Not present |
| No mixed content (HTTP resources on HTTPS page) | ✅ All resources HTTPS |
| No CDN-hosted scripts without SRI | ⚠️ Pending (some plugins loaded from CDN without integrity hash) |

---

## 6. Dependency Security

- npm dependencies are minimal (dev-only: Playwright, build scripts)
- No production npm dependencies (zero npm packages shipped to users)
- Regular `npm audit` recommended before each sprint
- GitHub Dependabot alerts should be reviewed weekly

---

## 7. Infrastructure Security

### Netlify
- Atomic deploys (no partial deploy states)
- HTTPS enforced at CDN level (no HTTP fallback)
- Function execution is isolated (serverless)
- Environment variables are encrypted at rest

### GitHub
- `main` branch should be protected (require PR + CI pass before merge)
- Repository should be private or have no sensitive data in history
- GitHub Actions secrets used only for CI/CD, not for application secrets

### DNS
- DNS managed through Netlify
- `www` redirects to apex domain
- DNSSEC: recommended but not yet validated

---

## 8. Incident Response

If a security issue is discovered:

1. **Assess impact:** Is data being exfiltrated? Is the form being abused?
2. **Contain:** If form abuse → increase rate limit, activate captcha
3. **Fix:** Patch in a feature branch, run full CI (`npm run test:ci`), deploy
4. **Document:** Add entry to `docs/ENGINEERING-CHANGELOG.md` with incident timeline and resolution
5. **Post-mortem:** Update this document if the issue reveals a gap in the security model

### Emergency contacts
- Netlify support: https://www.netlify.com/support/
- Resend support: https://resend.com/support
- Cloudflare Turnstile: https://developers.cloudflare.com/turnstile/

---

## 9. Known Limitations / Open Items

| Item | Risk | Status |
|---|---|---|
| CSP in report-only mode | Medium — CSP not enforced, XSS possible if inline scripts introduced | Pending (Phase 6) |
| Turnstile not yet activated in production | Low–Medium — honeypot + rate limit active but no CAPTCHA | Pending (Phase 8) |
| Some CDN scripts without SRI | Low | Backlog |
| DNSSEC not validated | Low | Backlog |
| `color-contrast` axe rule not yet blocker in CI | Low–Medium | Pending (BL-QA-008) |

---

## 10. Compliance

This portfolio does not collect, store, or process personal data beyond:
- Contact form submissions (email, name, message) — delivered via Resend and not stored
- IP addresses — used transiently for rate limiting only, not persisted
- No cookies set by the portfolio itself (third-party services may set their own)

GDPR/privacy note: If analytics (Epic G) are added, a cookie consent banner and privacy policy will be required.

---

*Last updated: 2026-03-03*
