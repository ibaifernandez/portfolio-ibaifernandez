# PRD — Product Requirements Document

**Product:** Portfolio Ibai Fernandez
**Version:** 2.0 (post-Netlify migration)
**Last updated:** 2026-03-03
**Owner:** Ibai Fernandez

> Status note: this is the product specification, not the live task board. Use `docs/ROADMAP.md` for current status and `docs/BACKLOG.md` for open work.

---

## 1. Product Vision

A professional portfolio that communicates senior-level expertise in Front-End development, digital marketing, and content strategy within the first 60 seconds of a visit. The portfolio functions as a live demonstration of the owner's technical capabilities, not just a document listing them.

**North star:** A recruiter, client, or CTO who lands on the page should understand the owner's value proposition, technical depth, and professional impact without scrolling past the fold.

---

## 2. Target Audiences

| Audience | Primary Goal | Key Entry Point |
|---|---|---|
| Technical recruiters | Assess technical breadth + seniority | Home → Projects |
| Hiring managers (tech) | Evaluate engineering decision-making | Home → Experience → Case studies |
| Potential clients | Understand deliverable quality + outcomes | Home → Services → Contact |
| CTOs / Tech leads | Validate architectural thinking | Projects → Engineering docs |
| Fellow developers | Professional reference + networking | Home → About → Social links |

---

## 3. Core User Journeys

### Journey 1 — First Impression (< 60 seconds)

1. Land on `index.html`
2. Read hero headline + sub-heading
3. Scan skills/experience section
4. Identify 1–2 relevant projects
5. Click "Contact" or "Download CV"

**Success criteria:** Visitor understands the owner's seniority and main expertise areas without scrolling past the hero or projects section.

### Journey 2 — Project Deep Dive

1. Click a project card on the home page
2. Navigate to `project-*.html`
3. Read the problem → solution → result narrative
4. View screenshots or demo
5. Click "Back" or navigate to another project

**Success criteria:** Visitor understands the business problem solved, the technical approach, and the measurable outcome.

### Journey 3 — Contact

1. Navigate to the contact section (sidebar anchor or CTA)
2. Fill in name, email, subject, message
3. Submit form
4. Receive accessible feedback (success or error)

**Success criteria:** Form submission works end-to-end; accessible feedback is shown within 3 seconds; no spam reaches the inbox.

### Journey 4 — CV Download / Print

1. Click "Download CV" CTA (hero or about section)
2. Navigate to `cv-print.html#print`
3. View formatted CV
4. Switch language EN/ES if needed
5. Click "Print CV" to print or save as PDF

**Success criteria:** CV renders correctly in A4 print layout; print dialog opens automatically on `#print` anchor; EN/ES switching works.

### Journey 5 — Language Switch (EN/ES)

1. Click the language toggle in the sidebar
2. All visible text switches to the selected language
3. URL does not change; preference persists in session

**Success criteria:** All text elements on the page switch correctly; no content is left untranslated; `document.documentElement.lang` reflects the selection.

---

## 4. Functional Requirements

### FR-01 — Home page sections
- [ ] Hero with profile image, headline, sub-heading, and CTAs
- [ ] About section (bio, skills, interests)
- [ ] Services grid (data-driven from `content/services.json`)
- [ ] Experience timeline (data-driven from `content/experience.json`)
- [ ] Projects section (data-driven from `content/projects.json`)
- [ ] Testimonials carousel (data-driven from `content/testimonials.json`)
- [ ] Training timeline (data-driven from `content/training.json`)
- [ ] Contact form section
- [ ] Sidebar navigation with section anchors

### FR-02 — Project pages
- [ ] Individual pages per project (generated from `project-*.template.html`)
- [ ] Bilingual content (EN/ES) on each page
- [ ] Problem → solution → result structure
- [ ] Back / prev / next navigation
- [ ] AVIF/WebP images with `<picture>` fallback

### FR-03 — Contact form
- [ ] Fields: name, email, subject, message
- [ ] Honeypot anti-bot field (`website`, hidden)
- [ ] Timing-based bot detection (`form_started_at`)
- [ ] Optional invisible captcha validation (Cloudflare Turnstile in production)
- [ ] Stateless anti-spam baseline (honeypot + timing gate; no persistent in-memory rate limiter in the current serverless contract)
- [ ] Accessible error and success feedback (`aria-live`, `aria-invalid`)
- [ ] Backend delivery via Resend API

### FR-04 — CV print page
- [ ] Printable A4 layout at `cv-print.html`
- [ ] Auto-print trigger on `#print` anchor
- [ ] Toolbar: Back, EN/ES toggle, Print CV button
- [ ] No sidebar navigation on this page

### FR-05 — Language toggle
- [ ] EN/ES toggle in sidebar on every page
- [ ] All data-driven content translatable
- [ ] `document.documentElement.lang` reflects active language
- [ ] Activatable via keyboard (not mouse-only)

### FR-06 — Accessibility
- [ ] Keyboard navigation through all interactive elements
- [ ] `skip-link` visible on first `Tab` press
- [ ] `<main>` ARIA landmark on every page
- [ ] Zero axe `serious` or `critical` violations
- [ ] `prefers-reduced-motion` respected

### FR-07 — Performance
- [ ] Lighthouse Performance ≥ 95 (desktop), ≥ 90 (mobile target → north star: ≥ 95)
- [ ] LCP ≤ 2.2s (mobile 4G)
- [ ] CLS ≤ 0.05
- [ ] All non-critical CSS and JS deferred/lazy-loaded

---

## 5. Non-Functional Requirements

### NFR-01 — Performance (North-star metrics)

| Metric | Target | Current |
|---|---|---|
| Lighthouse Performance (desktop) | ≥ 95 | 93 (PageSpeed, 2026-03-03) |
| Lighthouse Performance (mobile) | ≥ 95 | 62 (PageSpeed, 2026-03-03) |
| Lighthouse Accessibility | ≥ 95 | 95 (PageSpeed, 2026-03-03) |
| LCP (mobile 4G) | ≤ 2.2s | 7.6s (PageSpeed, 2026-03-03) |
| CLS | ≤ 0.05 | 0.004 (PageSpeed, 2026-03-03) |
| JS initial budget | ≤ 220KB gzip | TBD |
| CSS initial budget | ≤ 120KB gzip | TBD |

### NFR-02 — Accessibility

| Standard | Target |
|---|---|
| WCAG 2.2 Level AA | All key journeys |
| Axe violations (serious/critical) | 0 |
| Keyboard navigability | Full (all interactive elements) |

### NFR-03 — Compatibility

| Dimension | Target |
|---|---|
| Browsers | Modern evergreen (Chrome, Firefox, Safari, Edge) |
| Mobile | iOS Safari 16+, Chrome Android |
| Screen sizes | 320px–2560px |
| Print | A4, via browser print dialog |

### NFR-04 — Reliability

| Dimension | Target |
|---|---|
| Uptime | 99.9%+ (Netlify SLA) |
| Contact form success rate | ≥ 98% (non-spam submissions) |
| CI gate failures | 0 flaky tests |
| E2E test coverage | ≥ 90% of critical journeys |

### NFR-05 — Security

| Requirement | Status |
|---|---|
| HTTPS enforced | ✅ |
| Security headers | ✅ (X-Frame-Options, X-Content-Type-Options, etc.) |
| No hardcoded secrets | ✅ |
| CSP enforce mode | ⏳ Pending (currently report-only) |
| Captcha production validation | ✅ Validated in production (2026-03-03) |
| Realtime analytics ingestion | ✅ `page_view` + contact conversion events confirmed in GA4 Realtime (2026-03-03) |

### NFR-06 — Maintainability

| Requirement | Status |
|---|---|
| Data-driven content (no HTML changes to update content) | ✅ |
| Build pipeline (single command rebuilds all pages) | ✅ |
| CI gates (changes cannot break quality without detection) | ✅ |
| Documentation (README, AGENTS, ARCHITECTURE, runbook) | ✅ |

---

## 6. Content Requirements

### CR-01 — No placeholder content in production
All Lorem Ipsum, `dummyimage.com` images, and `href="#"` links must be replaced before any section is visible to real users. The blog section is currently hidden ("Coming soon") pending real content.

### CR-02 — Bilingual (EN/ES)
All user-visible text must be available in both English and Spanish. The language toggle must produce complete translations with no untranslated fragments.

### CR-03 — Projects must communicate outcomes
Each project entry should follow the structure:
- **Problem:** What challenge was being solved?
- **Solution:** What was built or done?
- **Result:** What was the measurable impact?

### CR-04 — SEO metadata
Every page must have:
- Unique `<title>` tag
- Unique `<meta name="description">`
- Open Graph tags (`og:title`, `og:description`, `og:image`)
- `hreflang` for EN/ES (when multi-URL strategy is adopted)

---

## 7. Out of Scope (Deliberate Exclusions)

| Item | Reason |
|---|---|
| Blog with real posts | Out of scope for v2.0.0.0; the current product direction is to remove or permanently hide the blog surface before indexing |
| CMS integration | Static-first approach; data JSON is the CMS |
| User accounts / authentication | Not applicable for portfolio |
| Analytics dashboard | Planned post-MVP (Epic G) |
| Server-side rendering | Static-first is the architectural choice |
| Comments or social features | Not appropriate for portfolio use case |

---

## 8. Open Questions / Pending Decisions

| # | Question | Owner | Priority |
|---|---|---|---|
| OQ-01 | Google Search Console + Bing property verification + sitemap submission timing | Ibai | Medium |
| OQ-02 | Remaining public slug normalization beyond `2x2MKT` | Ibai | Medium |
| OQ-03 | `hreflang` strategy — single URL or `/en` / `/es` paths? | Ibai | Low |
| OQ-04 | Final replacement timing for dossier placeholder assets | Ibai | Medium |

---

## 9. Acceptance Criteria Summary

The portfolio is considered **production-ready (v2.0)** when:

- [ ] All placeholder content removed or appropriately hidden
- [ ] Mobile performance accepted for current release scope, with follow-up LCP work tracked after v2.0.0.0
- [ ] Lighthouse Accessibility ≥ 95
- [ ] Zero axe serious/critical violations
- [x] All E2E tests pass (29/29)
- [x] Contact form works end-to-end in production
- [ ] CV print page works in Chrome and Safari
- [ ] Language toggle works for all visible content
- [x] No broken internal links
- [x] CSP policy decided: remain in report-only for v2.0.0.0 and revisit after a monitored post-release window
- [ ] Google Search Console verified

---

*Last updated: 2026-03-03*
