# Deploy Roadmap

## Scope

Pre-release and release process for `portfolio-ibaifernandez`, optimized for:

1. Zero-regression deployment safety.
2. Search and social discoverability.
3. QA traceability for Desktop v1.0.
4. Controlled production rollout with rollback path.

Date baseline: `2026-02-27`.

## Que Te Faltaba Anadir Al Plan

1. Rollback strategy before push:
   - Git tag before release.
   - Previous-production snapshot reference.
2. Deployment hardening:
   - Avoid shipping full repo (`node_modules`, `docs`, `src`, `tests`).
   - Deploy only public artifacts.
3. Post-deploy verification gate:
   - Functional checks against production URL, not only localhost.
4. Cross-page metadata consistency:
   - Canonical, OG, Twitter, robots, and structured discovery on all project pages.
5. LLM discovery infrastructure:
   - `llms.txt` and `llms-full.txt`.
6. Indexing workflow:
   - `sitemap.xml` complete and synced with canonical pages.
   - `robots.txt` aligned to current indexing policy.
7. Analytics governance:
   - Ensure GA4 tag is present on all pages, not only home.
8. Anti-spam and form governance:
   - Existing honeypot + cooldown validated.
   - reCAPTCHA/hCaptcha decision and rollout plan documented.
9. Security headers maturity:
   - Move from CSP `Report-Only` to enforced CSP after log review.
10. External dependency verification:
   - External links and integrations validated in network-enabled environment.

## Como Lo Hariamos (Orden De Ejecucion)

1. Pre-release hardening.
2. Technical gate execution.
3. Commit, tag, and push.
4. Post-deploy QA on production.
5. Monitoring and rollback readiness.

## Execution Checklist

### A. Pre-release Hardening

1. Build and generated-page sync:
   - `npm run build:pages`
2. Discoverability and metadata:
   - Canonical, OG, Twitter on `index`, `blog`, and all `project-*`.
   - `robots.txt` and `sitemap.xml` reviewed.
   - `llms.txt` and `llms-full.txt` present.
3. Deploy pipeline:
   - `.cpanel.yml` restricted to public artifacts only.
4. Analytics:
   - GA4 snippet loaded in all page templates.

### B. Technical Gate

1. Quality:
   - `npm run test:quality`
2. E2E:
   - `npm run test:e2e`
3. Smoke:
   - `npm run test:smoke` (requires local PHP runtime)
4. External links:
   - `npm run test:links:external` (requires network access)

Gate rule: do not push if any non-optional gate fails.

### C. Release Transaction

1. Confirm branch and workspace status:
   - `git status`
2. Commit with release scope.
3. Tag release checkpoint:
   - example: `v2026.02.27-predeploy`
4. Push branch + tag:
   - `git push origin <branch>`
   - `git push origin --tags`

### D. Post-deploy QA (Production URL)

1. Critical UX flow:
   - Home render, sidebar, language toggle, project navigation, contact form.
2. Metadata validation:
   - Social preview, canonical correctness, robots/sitemap availability.
3. Analytics validation:
   - Real-time pageview test in GA4.
4. Performance and CWV quick pass:
   - LCP/CLS sanity on Desktop and mobile viewport.
5. Form path:
   - Valid submit, spam guard behavior, cooldown behavior.

### E. Rollback Plan

1. Trigger rollback if:
   - form outage,
   - broken navigation,
   - major rendering regression,
   - severe SEO metadata corruption.
2. Rollback actions:
   - redeploy previous tag state,
   - verify health checks,
   - open root-cause issue before reattempt.

## QA Desktop v1.0 (Release Sheet)

### 1. UI and Layout

1. Sidebar parity between home and project pages.
2. Project cards image+copy links clickable.
3. Language switch consistency across dynamic sections and testimonials.
4. Footer/contact block consistency across project pages.

### 2. Functional

1. Contact form validation and successful submission path.
2. Project prev/next navigation chain.
3. DebTracker interactive modules (toggle, logs terminal, protocol demo).
4. GymTracker wow modules (command center, QA wall).

### 3. Accessibility

1. Skip-link first focus target.
2. Keyboard traversal for sidebar, social links, and form controls.
3. Axe serious/critical violations: zero tolerance.

### 4. Performance

1. `test:budget` pass through `test:quality`.
2. Image formats:
   - AVIF/WebP coverage checks pass.
3. No regression in heavy pages (`index`, `project-enterprise-crm`).

### 5. SEO / Discovery

1. Canonical URLs valid and unique.
2. OG/Twitter tags present and coherent.
3. `robots.txt`, `sitemap.xml`, `llms.txt`, `llms-full.txt` accessible.
4. Search Console sitemap submission status tracked.

## Current Status (This Iteration)

Completed:

1. `.cpanel.yml` hardened to deploy only public artifacts.
2. `sitemap.xml` expanded to include home, blog, and all project pages.
3. `robots.txt` reviewed and aligned.
4. `llms.txt` and `llms-full.txt` added.
5. SEO/social metadata normalized on project templates and blog.
6. GA4 snippet componentized and included across templates.

Pending environment-dependent checks:

1. `test:smoke` in runtime with PHP binary.
2. `test:links:external` in network-enabled environment.
3. Search Console and reCAPTCHA configuration tasks.
