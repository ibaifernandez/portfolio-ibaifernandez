# ARCHITECTURE.md — Technical Architecture

## System Overview

Portfolio Ibai Fernandez is a **static website** served from Netlify CDN, with a single serverless backend function for the contact form. There is no application server, no database, and no framework runtime.

```
┌─────────────────────────────────────────────────────────────────┐
│                        BROWSER                                   │
│  ┌──────────┐  ┌──────────────┐  ┌──────────────────────────┐  │
│  │ HTML/CSS │  │   JS/jQuery  │  │   Contact Form (JS)      │  │
│  │ (static) │  │   (plugins)  │  │ custom.js → fetch()      │  │
│  └──────────┘  └──────────────┘  └──────────┬───────────────┘  │
└─────────────────────────────────────────────│───────────────────┘
                                              │ POST JSON
              ┌───────────────────────────────▼──────────────────┐
              │            NETLIFY CDN                            │
              │  ┌──────────────────────────────────────────┐    │
              │  │  Static Assets (HTML, CSS, JS, Images)   │    │
              │  └──────────────────────────────────────────┘    │
              │  ┌──────────────────────────────────────────┐    │
              │  │  Netlify Function: contact.js             │    │
              │  │  (Node.js 20, serverless)                 │    │
              │  └──────────────┬───────────────────────────┘    │
              └─────────────────│─────────────────────────────────┘
                                │ Resend API (HTTPS)
              ┌─────────────────▼──────────────────────────────┐
              │              RESEND                             │
              │  Transactional email delivery                   │
              └────────────────────────────────────────────────┘
```

---

## Infrastructure

| Component | Technology | Details |
|---|---|---|
| CDN / Hosting | Netlify | Production deploys come from GitHub Actions via `netlify-cli`; Netlify auto-builds are stopped |
| Serverless Functions | Netlify Functions (Node.js 20) | `netlify/functions/contact.js` |
| Email transport | Resend API | REST, no SMTP dependency |
| Domain | portfolio.ibaifernandez.com | DNS managed via Netlify |
| SSL | Let's Encrypt (auto) | Managed by Netlify |
| CI/CD | GitHub Actions | `ci.yml` |
| Source control | GitHub | `main` branch → production |

---

## Build Pipeline

The build system transforms **template sources + data + readable CSS/JS assets** into **committed static HTML + generated `.min` runtime assets**.

```
content/*.json          (data)
  │
  ▼
src/pages/
  *.template.html       (page skeletons)
  │
  ├── @include directives ──── src/components/**/*.html   (partials)
  │
  └── @render directives ───── content/*.json             (data injection)
  │
  ▼
scripts/build-pages.mjs   (Node.js build script)
  │
  ▼
*.html (root) + *.min assets
                         (committed static output)
  index.html
  blog.html
  cv-print.html
  project-*.html
  assets/css/*.min.css
  assets/js/*.min.js
```

### Build Directives

| Directive | Syntax | Purpose |
|---|---|---|
| `@include` | `<!-- @include path/to/partial.html -->` | Inlines a component partial |
| `@render` | `<!-- @render component-name -->` | Loops over JSON and renders a component per item |

### Running the Build

```bash
npm run build:pages
```

This must be run and the output committed any time templates, components, content JSON, or readable served CSS/JS source files change.

Media note:
- `npm run media:avif` and `npm run media:webp` now scan all generated root HTML pages by default and finish by calling `npm run build:pages`, so the standard image-optimization workflow stays aligned with the template build.

---

## Directory Structure

```
/
├── AGENTS.md                    ← AI agent guidance (root)
├── README.md                    ← Human-facing summary (root)
├── netlify.toml                 ← Netlify routing + function config
├── package.json                 ← NPM scripts and dev deps
│
├── index.html                   ← GENERATED — do not edit
├── blog.html                    ← GENERATED — do not edit
├── cv-print.html                ← GENERATED — do not edit
├── project-*.html               ← GENERATED — do not edit
│
├── assets/
│   ├── css/
│   │   ├── style.css            ← readable source stylesheet (design tokens in :root)
│   │   ├── style.min.css        ← GENERATED, served in production HTML
│   │   ├── font.css             ← readable font-face source (no @import)
│   │   ├── font.min.css         ← GENERATED, served in production HTML
│   │   ├── bootstrap.min.css
│   │   ├── all.min.css          ← Font Awesome
│   │   ├── animate.css          ← readable source, loaded non-blocking
│   │   ├── animate.min.css      ← GENERATED, loaded non-blocking in production HTML
│   │   └── print.min.css        ← GENERATED print media stylesheet
│   ├── js/
│   │   ├── custom.js            ← readable source (page behavior + contact form)
│   │   ├── custom.min.js        ← GENERATED, served in production HTML
│   │   ├── translate.min.js     ← GENERATED runtime i18n script
│   │   └── *.js                 ← plugin files
│   └── images/
│       ├── *.jpg / *.png        ← source images
│       ├── *.avif               ← AVIF variants (generated)
│       └── *.webp               ← WebP variants (generated)
│
├── content/
│   ├── projects.json            ← project cards + pages data
│   ├── testimonials.json        ← testimonial carousel data
│   ├── training.json            ← education/training timeline data
│   ├── ctas.json                ← call-to-action buttons data
│   ├── services.json            ← services grid data
│   └── experience.json          ← work experience cards data
│
├── docs/                        ← all detailed documentation
│
├── netlify/
│   └── functions/
│       └── contact.js           ← serverless contact form handler
│
├── scripts/
│   ├── build-pages.mjs          ← main build script
│   ├── generate-avif-assets.mjs ← AVIF conversion
│   ├── generate-webp-assets.mjs ← WebP conversion
│   ├── wrap-images-with-avif-picture.mjs
│   └── static-server.mjs        ← local server for E2E tests
│
├── src/
│   ├── pages/
│   │   ├── index.template.html
│   │   ├── blog.template.html
│   │   ├── cv-print.template.html
│   │   └── project-*.template.html
│   └── components/
│       ├── shared/              ← header, footer, nav, analytics
│       ├── index/               ← home-specific components
│       └── blog/                ← blog-specific components
│
└── tests/
    ├── quality-guards.sh        ← shell-based quality gate
    ├── smoke.sh                 ← basic smoke test (static server)
    ├── check-links.mjs          ← internal link validator
    ├── check-performance-budget.mjs
    ├── check-avif-coverage.mjs
    ├── check-webp-coverage.mjs
    ├── performance-budget.config.json
    └── e2e/
        ├── home.spec.js
        ├── contact.spec.js
        ├── blog.spec.js
        ├── keyboard.spec.js
        ├── a11y.spec.js
        └── visual.spec.js
```

---

## Contact Form Data Flow

```
Browser (custom.js)
  │
  │  1. Collect: name, email, subject, message,
  │              website (honeypot), form_started_at,
  │              captcha_provider, captcha_token
  │
  │  2. POST /.netlify/functions/contact
  │     Content-Type: application/json
  │
  ▼
netlify/functions/contact.js
  │
  │  3. Parse JSON body
  │  4. Honeypot check (website field must be empty)
  │  5. Timing check (form_started_at < 1.2 s → bot)
  │  6. Captcha verification (if provider + secret are configured)
  │     └── Cloudflare Turnstile / reCAPTCHA / hCaptcha
  │  7. Input validation (name, email format, message required)
  │  8. Send auto-reply + owner notification via Resend API
  │
  ▼
Resend API
  │
  │  9. Deliver email(s)
  │
  ▼
Browser (custom.js)
  │
  │  10. Show accessible success/error feedback
  │      (aria-live region, aria-invalid on fields)
```

---

## CI/CD Pipeline

```
Developer push → main branch
  │
  ├── GitHub Actions: ci.yml
  │   ├── npm ci
  │   ├── npm run build:pages
  │   ├── npm run test:quality    ← shell quality gates
  │   ├── npx playwright install --with-deps chromium
  │   ├── npm run test:e2e        ← 29 Playwright tests
  │   └── npx netlify-cli deploy --prod --dir .
  │
  └── Netlify CDN
      ├── Receives prebuilt artifacts only
      ├── Deploys atomically
      └── Live at portfolio.ibaifernandez.com
```

---

## Component Model

The componentization uses a file-based partial system with two mechanisms:

### `@include` — static partial inclusion
```html
<!-- @include src/components/shared/header.html -->
```
The build script reads the referenced file and inlines it at that position. No dynamic data.

### `@render` — data-driven rendering
```html
<!-- @render project-card -->
```
The build script reads `content/projects.json`, iterates over items, renders `src/components/index/project-card.html` once per item, substituting `{{field}}` placeholders with JSON values. Required fields are validated at build time.

---

## CSS Architecture

The stylesheet stack (load order in `<head>`):

1. `bootstrap.min.css` — grid + resets
2. `all.min.css` — Font Awesome icons
3. `font.css` — local font-face declarations (Josefin Sans, Poppins)
4. *(Google Fonts Roboto)* — loaded non-blocking via `<link rel="preload">`
5. `animate.css` — deferred non-blocking via `<link rel="preload">`
6. `style.css` — main custom styles (`:root` design tokens + all layout)
7. `print.css` — print media (`media="print"`)

Design tokens in `style.css` `:root`:
- `--color-primary`, `--color-accent-*`
- `--font-body`, `--font-heading`
- `--spacing-*`, `--radius-*`, `--shadow-*`

---

## Language / i18n

Pages support EN/ES language toggle via:
- `data-lang-en` / `data-lang-es` attributes on text elements
- JavaScript toggle function in `custom.js` that switches `document.documentElement.lang`
- JSON i18n files in `assets/i18n/` served with `stale-while-revalidate` cache header
- CV print page has separate EN/ES sections toggled by the toolbar

---

## Performance Architecture

| Concern | Solution |
|---|---|
| LCP (profile image) | `loading="eager"`, AVIF/WebP with `<picture>`, explicit `width`/`height` |
| CLS (images) | All images have `width` + `height` attributes |
| Render-blocking CSS | Google Fonts + animate.css loaded non-blocking |
| Render-blocking JS | All non-critical plugins dynamically loaded |
| Font loading | `font-display: swap` + `rel="preconnect"` for Google Fonts |
| Image formats | AVIF primary, WebP fallback, original final fallback |
| Asset budget | Validated in CI (`npm run test:budget`) |

---

## Accessibility Architecture

| Requirement | Implementation |
|---|---|
| ARIA landmark | `<main class="port_sec_warapper">` |
| Skip navigation | Skip link targets the first meaningful main section (`#about_sec` in Home, `#blog_main` in Blog) |
| Keyboard focus | `:focus-visible` styles in `style.css` |
| Motion | `@media (prefers-reduced-motion: reduce)` in `style.css` |
| Form feedback | `aria-live="polite"` status region + `aria-invalid` on fields |
| Icon controls | `aria-label` on all icon-only `<a>` and `<button>` |
| Contrast | WCAG AA enforced in Playwright axe coverage (`color-contrast` is blocking) |

---

## Security Architecture

| Layer | Mechanism |
|---|---|
| HTTP headers | `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy` in `netlify.toml` |
| CSP | `Content-Security-Policy-Report-Only` (report-only; enforce pending) |
| HTTPS | Enforced by Netlify CDN |
| Contact form — bot | Honeypot field (`website`), timing check (`form_started_at`) |
| Contact form — test parity | `scripts/static-server.mjs` mirrors the production contact contract for E2E |
| Contact form — captcha | Cloudflare Turnstile integration (ready, pending activation) |
| Secrets | Netlify environment variables only — never committed |
| JS safety | No `eval()` in form handling |
| Link safety | All `target="_blank"` have `rel="noopener noreferrer"` |

---

## ADR Index

Detailed rationale for major architectural decisions:

| ADR | Decision | File |
|---|---|---|
| ADR-001 | Componentization strategy (Nunjucks/partials over Astro) | `docs/ENGINEERING-CHANGELOG.md` |
| ADR-002 | Design tokens and CSS governance | `docs/ENGINEERING-CHANGELOG.md` |
| ADR-003 | Platform: Netlify over cPanel | `docs/ENGINEERING-CHANGELOG.md` |
| ADR-004 | Contact form: Resend over SMTP/PHPMailer | `docs/ENGINEERING-CHANGELOG.md` |
| ADR-005 | CSS loading: `rel="preload"` defer pattern | `docs/ENGINEERING-CHANGELOG.md` |

---

*Last updated: 2026-03-03*
