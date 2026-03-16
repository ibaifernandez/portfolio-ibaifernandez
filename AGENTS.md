# AGENTS.md — AI Agent Guidance for Portfolio Ibai Fernandez

This file tells AI coding agents (Claude Code, GitHub Copilot, Cursor, etc.) everything they need to work safely and effectively in this repository.

---

## Project At a Glance

**What it is:** Static personal portfolio — Front-End / Marketing / Content.
**Runtime:** Static HTML/CSS/JS served from Netlify CDN. No SSR, no framework.
**Contact form backend:** Netlify Function (`netlify/functions/contact.js`, Node.js 20) → Resend API.
**Build tool:** Custom Node.js pipeline (`scripts/build-pages.mjs`) — NOT a bundler like Webpack/Vite.
**Live URL:** https://portfolio.ibaifernandez.com (Netlify, deploy from GitHub Actions on push to `main`).

---

## Stack

| Layer | Technology |
|---|---|
| Markup | HTML5 (built from templates) |
| Styles | CSS3 + Bootstrap 4 + custom variables |
| Scripts | Vanilla JS + jQuery 3 + plugins |
| Build | Node.js 20 + `scripts/build-pages.mjs` |
| Contact form | Netlify Functions (Node.js 20) + Resend API |
| Hosting | Netlify CDN |
| CI/CD | GitHub Actions (`ci.yml`) |
| Testing | Playwright (Chromium) + shell quality guards |
| Fonts | Roboto (Google Fonts, non-blocking preload) |

---

## Key Commands

```bash
# Build all pages from templates + components
npm run build:pages

# Run quality guards (lint-equivalent, no deps needed)
npm run test:quality

# Run E2E tests (requires static server, Playwright)
npm run test:e2e

# Run full CI pipeline locally
npm run test:ci

# Check internal links + anchors
npm run test:links

# Check asset size budget
npm run test:budget

# Check AVIF/WebP coverage
npm run test:avif && npm run test:webp

# Start local static server (for E2E)
npm run start

# Optimize images (AVIF + WebP)
npm run media:all
```

> **IMPORTANT:** Do NOT use `php -S` to run locally. The stack is now static + Netlify Functions. Use `npm run start` for the static server and `netlify dev` for full local Netlify emulation.

---

## Directory Structure (abridged)

```
/
├── AGENTS.md              ← you are here
├── README.md              ← human-facing project summary
├── index.html             ← GENERATED (do not edit directly)
├── cv-print.html          ← GENERATED (do not edit directly)
├── assets/
│   ├── css/               ← stylesheets (font.css, style.css, etc.)
│   ├── js/                ← scripts (custom.js, translate.js, etc.)
│   └── images/            ← images (AVIF+WebP+original per image)
├── content/               ← data-driven content (JSON)
│   ├── projects.json
│   ├── testimonials.json
│   ├── training.json
│   ├── ctas.json
│   ├── services.json
│   └── experience.json
├── docs/                  ← all documentation except README.md + AGENTS.md
├── netlify/
│   └── functions/
│       └── contact.js     ← contact form backend (Netlify Function)
├── scripts/               ← build + media pipeline scripts
├── src/
│   ├── pages/             ← template source files (*.template.html)
│   └── components/        ← reusable HTML partials
├── tests/                 ← quality guards, budget, coverage checks
└── tests/e2e/             ← Playwright test specs
```

---

## The Golden Rules

### 1. Never edit generated files directly
`index.html`, `cv-print.html`, the root-level dossier HTML pages (for example `debtracker.html` or `lfi.html`), and the committed `.min` CSS/JS assets are **GENERATED** by `npm run build:pages`. Edits to these files will be overwritten on the next build.

- To change page content → edit `src/pages/*.template.html`
- To change component markup → edit `src/components/**/*.html`
- To change data-driven content → edit `content/*.json`
- To change served CSS → edit the readable source in `assets/css/*.css`
- To change served JS → edit the readable source in `assets/js/*.js`

### 2. Run tests before committing
Always run `npm run test:ci` or at minimum `npm run build:pages && npm run test:quality` before any commit. CI will fail on quality violations.

### 3. Images require AVIF + WebP + fallback
Any new image added to `assets/images/` should have:
- `.avif` variant (run `npm run media:avif`)
- `.webp` variant (run `npm run media:webp`)
- `<picture>` tag with `<source type="image/avif">`, `<source type="image/webp">`, and `<img>` fallback in the template

### 4. No `href="#"` or `href="javascript:;"`
These are blocked by quality guards. Use real anchors or omit the href.

### 5. All `target="_blank"` must have `rel="noopener noreferrer"`
Enforced by quality guard. No exceptions.

### 6. No hardcoded captcha secrets
`PORTFOLIO_CAPTCHA_SECRET` must never appear in `netlify.toml` or any committed file. Use Netlify environment variables.

### 7. CSS loading must stay non-blocking for above-the-fold
`animate.css` and Google Fonts are loaded via `rel="preload" as="style" onload="..."` pattern. Do not revert to synchronous `<link>` or `@import`.

### 8. `<main>` landmark is required
The wrapper `port_sec_warapper` must remain a `<main>` element (not a `<div>`) for WCAG 2.1 SC 4.1.2 compliance.

---

## Safe Zones vs Caution Zones

| Zone | Safety | Notes |
|---|---|---|
| `content/*.json` | ✅ Safe | Data edits, no rebuild side effects beyond content |
| `src/components/**` | ✅ Safe | Rebuild required after changes |
| `src/pages/*.template.html` | ✅ Safe | Rebuild required |
| `assets/css/style.css` | ⚠️ Caution | Run visual regression + a11y tests after changes |
| `assets/js/custom.js` | ⚠️ Caution | jQuery-based; test all interactive sections |
| `assets/js/custom.js` | ⚠️ Caution | Contact form logic lives here; run E2E contact tests |
| `netlify/functions/contact.js` | ⚠️ Caution | Backend; test honeypot/timing/captcha paths |
| `index.html` | 🚫 Do not edit | Generated |
| root-level dossier HTML pages | 🚫 Do not edit | Generated |
| `netlify.toml` | ⚠️ Caution | Routing + function config; test locally first |

---

## CI Gates

Every push to `main` runs one GitHub Actions workflow:

1. **`ci.yml`** — install + build + `npm run test:quality` + `npm run test:e2e` + Netlify deploy
   - Blocks on: missing AVIF/WebP coverage, broken internal links, budget overruns, security header absence, `eval(`, blank hrefs, unsafe `target="_blank"`, hardcoded secrets, and any Playwright suite failure.

---

## Environment Variables (Netlify)

| Variable | Purpose |
|---|---|
| `RESEND_API_KEY` | Resend transactional email API key |
| `FROM_EMAIL` | Sender address for contact emails |
| `TO_EMAIL` | Recipient address for contact emails |
| `PORTFOLIO_CAPTCHA_PROVIDER` | `turnstile` / `recaptcha` / `hcaptcha` |
| `PORTFOLIO_CAPTCHA_SECRET` | Captcha verification secret (never commit) |

---

## Documentation Index

All detailed documentation lives in `docs/`:

| File | Contents |
|---|---|
| `docs/ARCHITECTURE.md` | Full technical architecture |
| `docs/PRD.md` | Product requirements |
| `docs/ROADMAP.md` | Strategic roadmap |
| `docs/BACKLOG.md` | Detailed backlog with epics + tasks |
| `docs/AI_RULES.md` | Extended AI agent rules |
| `docs/SECURITY.md` | Security policy |
| `docs/GLOSSARY.md` | Project glossary |
| `docs/ENGINEERING-CHANGELOG.md` | Full engineering history |
| `docs/ENGINEERING-RUNBOOK.md` | Ops runbook |
| `docs/PARALLEL-SAFETY-BASELINE.md` | Shared mechanical contract for safe parallel work |
| `docs/THREAD-ORCHESTRATION.md` | 13-thread execution model + file ownership rules |
| `docs/DEPLOY_ROADMAP.md` | Deploy plan and status |
| `docs/CASE-STUDY-2026-02-25.md` | Technical case study narrative |

Master prompts for separate execution threads live in `docs/THREAD-PROMPTS/`.

---

*Last updated: 2026-03-03*
