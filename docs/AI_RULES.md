# AI_RULES.md — Extended AI Agent Rules

> See also `AGENTS.md` at the repository root for the quick-reference summary.

---

## Scope

These rules apply to any AI agent (Claude Code, GitHub Copilot, Cursor, GPT-based tools, etc.) making changes to this repository.

---

## 0. Operating Contract (extended rationale)

The headline rules live in `AGENTS.md` "Operating Contract". This section explains the WHY and the edge cases.

### 0.1 — Roadmap SSOT (`docs/ROADMAP.md`)

**Why:** the owner reads exactly one file to know where the project stands. If multiple docs claim state, drift is inevitable.

**Implication:** when you close a step, finish a task, defer something, or discover a new pending item, update `docs/ROADMAP.md` in the same commit. Never let `ROADMAP.md` lag behind reality.

**What goes in it:** the live plan table (1-N steps with status), parallel pending items (non-blocking), and a tail of recent commits. Nothing else.

### 0.2 — One thread at a time

**Why:** sequential narrative. Parallel sessions on the same repo create merge conflicts, ambiguous ROADMAP state, and confusion for the owner who can only talk to one agent at a time anyway.

**Implication:**
- Do not propose "let me spawn another Claude Code session in parallel."
- Sub-agents (spawned from inside one session, like the `Agent` tool) are allowed for complex sub-tasks — see 0.3.
- When this session is done, the owner runs `/session-handoff` and the next session takes over with full context.

**Exception that proves the rule:** the 2026-05-22 dossier color-contrast fix was done by a parallel Claude Code session. It introduced rebase friction and a duplicated "Batch 6" commit label. Documented here as the pattern NOT to repeat.

### 0.3 — Subagent ownership

**Why:** the owner's mental contract is "I'm talking to one agent." Forcing the owner to read sub-agent reports and resolve their open questions breaks that contract.

**Implication:**
- The main agent decides ALL trade-offs raised by sub-agents.
- If a sub-agent asks "PR or direct merge?", the main agent answers based on the operating contract (direct merge to main, per 0.4).
- The main agent only escalates to the owner if the situation is genuinely outside its mandate or violates an operating rule.
- Sub-agent failures are absorbed and surfaced as "task failed, here is path forward," not as forwarded errors.

### 0.4 — Branch SSOT

**Why:** one writable timeline. Branches, forks, and parallel worktrees create state confusion.

**Implication:**
- Every commit goes to `origin/main`.
- Worktrees push via `git push origin HEAD:main` — same destination.
- No long-lived feature branches. No release branches. No hotfix branches.
- If a CI run goes red on `main`, fix-forward with the next commit. Don't revert unless the bad commit broke production (the deploy gate prevents that automatically).

### 0.5 — Production gate

**Why:** the owner needs ONE thing in his hands — control of what becomes public. Everything else should be friction-free.

**Implementation (`.claude/settings.json`):**

```
permissions.allow  →  Read/Edit/Write/Glob/Grep/WebFetch + routine Bash
permissions.ask    →  git push:*, gh pr create/merge/close,
                       gh release create, npm publish
permissions.deny   →  (empty; whitelist handles it)
```

**Implication:**
- Build, test, edit, commit locally — no questions asked.
- Before any `git push`, the owner sees a single confirmation prompt with the commit message and target ref.
- Confirmation is per-push, not per-session. Owner stays in control without ceremony.

### 0.6 — Doc hygiene

**Why:** owner does NOT read docs except `ROADMAP.md`. Stale docs misinform anyone (human or AI) doing future work. Git log is the historical record.

**Implication:**
- A new doc earns its place only by serving live work.
- When a doc is outdated by a change, fix or delete it in the same commit.
- Archive folders (`.archived/`) are forbidden — delete cleanly; git remembers.
- The audit folder `docs/audits/marianas/` is the exception: it documents the work of fixing audit findings, kept as a historical reference until the next major audit replaces it.

---

## 1. Build System Rules

### 1.1 — Understand the build pipeline before editing HTML

The HTML pages are **generated**. The pipeline is:

```
src/pages/*.template.html
  + src/components/**/*.html        (partials via @include)
  + content/*.json                  (data via @render)
  → scripts/build-pages.mjs
  → *.html (root level, committed)
```

**Rule:** Never edit `index.html`, `privacy.html`, the generated dossier HTML pages in the repo root, or committed generated `.min` CSS/JS assets directly. These will be overwritten.

**Rule:** After any change to a template, component, content JSON, or readable served CSS/JS source file, run `npm run build:pages` and commit the regenerated derivatives.

### 1.2 — Validate after every build

```bash
npm run build:pages && npm run test:quality
```

This must pass before any commit touching templates, components, or content JSON.

### 1.3 — JSON content changes require a rebuild

Editing `content/*.json` alone does not update the HTML. You must rebuild and commit the updated HTML.

### 1.4 — Parallel agent work

When spawning sub-agents in parallel worktrees, always rebase onto origin/main before pushing. Strictly do NOT manually patch generated artifacts (`*.min.css`, root `*.html`) — edit the source and let the build regenerate.

---

## 2. Quality Guard Rules

`npm run test:quality` (alias for `bash tests/quality-guards.sh`) blocks on the following — **do not introduce these patterns**:

| Violation | Rule |
|---|---|
| `eval(` in `assets/js/custom.js` | No eval in contact form |
| `href=""` or `href="javascript:;"` | No empty or JS-void links |
| `target="_blank"` without `rel="noopener noreferrer"` | XSS/privacy protection |
| Duplicate `https://https://` in URLs | Broken URL detection |
| Missing `X-Frame-Options` / `X-Content-Type-Options` in `netlify.toml` | Security headers required |
| `PORTFOLIO_CAPTCHA_SECRET=` or `RESEND_API_KEY=` literal in `netlify.toml` | No hardcoded secrets |
| Missing `skip-link` in HTML | Keyboard accessibility |
| Missing `aria-live` on form status container | Accessible form feedback |
| Static `<script>` tags for bootstrap/cvtext in generated HTML | Lazy-load enforcement |
| Missing image geometry on critical generated HTML | CLS prevention |
| Budget overruns (see `tests/performance-budget.config.json`) | Performance budget |
| Missing AVIF or WebP `<source>` for large images | Modern format coverage |
| Missing required fields in `content/*.json` | Data integrity |
| Broken internal links or anchors | No dead links |
| Missing `focus-visible` or `prefers-reduced-motion` in CSS | A11y baseline |

---

## 3. CSS Rules

### 3.1 — No `@import` for external fonts
Google Fonts (Roboto) must be loaded via `<link rel="preload" as="style" ...>` in the HTML `<head>`. The `@import` pattern was deliberately removed from `assets/css/font.css` to eliminate a 2-step render-blocking chain.

### 3.2 — Non-blocking pattern for non-critical CSS
`animate.css` and similar decorative stylesheets must use the LoadCSS preload pattern:
```html
<link rel="preload" as="style" onload="this.onload=null;this.rel='stylesheet'" href="...">
<noscript><link rel="stylesheet" href="..."></noscript>
```

### 3.3 — Design tokens live in `:root`
Color, spacing, shadow, and typography variables are defined in `assets/css/style.css` under `:root`. Extend there; do not hardcode raw values in new rules.

### 3.4 — `prefers-reduced-motion` must be respected
Any CSS animation or transition must have a corresponding `@media (prefers-reduced-motion: reduce)` override.

---

## 4. JavaScript Rules

### 4.1 — No `eval()` anywhere in form handling
Contact form validation and submission (`assets/js/custom.js`) must never use `eval()`.

### 4.2 — Lazy-load all non-critical plugins
jQuery plugins (`jvectormap`, `isotope`, `magnific`, `swiper`, `circle-progress`, `zoom`, `scrollbar`) must be dynamically loaded on demand, not in a static `<script>` tag. Pattern: `IntersectionObserver` or user-interaction trigger.

### 4.3 — Bootstrap JS is not included
`bootstrap.min.js` was removed from this project. Do not re-add it as a static script.

### 4.4 — Contact form must use `application/json` POST
`assets/js/custom.js` sends to `/.netlify/functions/contact` with `Content-Type: application/json`. Do not revert to `multipart/form-data` or `application/x-www-form-urlencoded`.

---

## 5. Accessibility Rules

### 5.1 — `<main>` landmark is mandatory
The main content wrapper `port_sec_warapper` must be a `<main>` element, not a `<div>`. This provides the ARIA landmark required by WCAG 2.1 SC 4.1.2.

### 5.2 — Heading hierarchy must be valid
Section headings must follow a valid hierarchy. The `port_sub_heading` element above section `h2`s must be a `<p>` (or `<span>`), not an `<h2>`. Avoid `h2 → h1` inversions.

### 5.3 — Icon-only controls need `aria-label`
Any `<a>` or `<button>` containing only an icon (Font Awesome `<i>`) must have an `aria-label` describing its action.

### 5.4 — All images need `alt`, `width`, `height`, and `loading`
In `index.html`:
- `loading="lazy"` (or `loading="eager"` for LCP candidate)
- `width` and `height` (prevents CLS)
- Meaningful `alt` text (or `alt=""` for decorative images)

### 5.5 — `focus-visible` styles must remain
Do not remove or suppress `:focus-visible` styles. They are required for keyboard navigation.

### 5.6 — Axe baseline must remain green
Tests in `tests/e2e/a11y.spec.js` check for zero `serious` or `critical` axe violations on Home and Contact. Do not introduce new violations.

---

## 6. Performance Rules

### 6.1 — LCP image must be eager
The hero/profile image (above the fold) must use `loading="eager"` (or no `loading` attribute). Do not set it to `loading="lazy"`.

### 6.2 — Asset budget must not be exceeded
Budget defined in `tests/performance-budget.config.json`. Run `npm run test:budget` after adding assets. Blocked in CI if exceeded.

### 6.3 — New images must have AVIF + WebP variants
Run `npm run media:all` after adding images. Then wrap in `<picture>` with `<source type="image/avif">` and `<source type="image/webp">`.

---

## 7. Security Rules

### 7.1 — No secrets in committed files
Captcha secrets, API keys, and passwords must live in Netlify environment variables (production) or `config/secrets.local.php` / equivalent gitignored file (local dev). See `docs/SECURITY.md`.

### 7.2 — Contact function contract must stay truthful
`netlify/functions/contact.js` currently enforces honeypot, timing checks, input validation, and optional captcha verification. Do not document CORS checks or persistent IP throttling as active unless you actually implement and test them.

### 7.3 — Serverless throttling needs real state
If you add rate limiting in the production Netlify Function, use an external state store or an edge-layer control. Do not add in-memory throttling and present it as production protection.

### 7.4 — Anti-spam fields must remain
Form fields `website` (honeypot), `form_started_at`, `captcha_provider`, and `captcha_token` must remain in the form and be validated backend-side.

---

## 8. Commit Conventions

- Use conventional commits: `feat:`, `fix:`, `chore:`, `docs:`, `refactor:`, `test:`, `perf:`, `style:`
- Always include the rebuilt HTML if templates or content were changed
- One logical change per commit (do not bundle unrelated fixes)
- Run `npm run test:ci` before pushing to `main`

---

## 9. What NOT to Do

- **Do not** add `console.log` to production JS files
- **Do not** change the language toggle mechanism without updating both EN and ES content in templates and i18n JSON
- **Do not** remove the `skip-link` from any page
- **Do not** introduce inline `style=""` attributes (use CSS classes)
- **Do not** change `netlify.toml` redirects without testing locally with `netlify dev`
- **Do not** add new npm dependencies without checking budget impact
- **Do not** scatter pending tasks across multiple files — `docs/ROADMAP.md` is the SSOT.
- **Do not** leave `href="#"` or placeholder `src=""` in committed templates

---

*Last updated: 2026-03-03*
