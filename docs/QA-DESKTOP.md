# QA Manual - Desktop

## Purpose

Manual release checklist for desktop browsers. This validates real UX, layout, navigation, content integrity, and critical functional flows that automated tests do not fully cover.

This checklist is safe to run before final content freeze because it focuses on structural quality, not final copy polish.

---

## Scope

Validate these public routes:

1. `https://portfolio.ibaifernandez.com/`
2. `https://portfolio.ibaifernandez.com/project-debtracker.html`
3. `https://portfolio.ibaifernandez.com/project-gymtracker.html`
4. `https://portfolio.ibaifernandez.com/project-enterprise-crm.html`
5. `https://portfolio.ibaifernandez.com/project-ruta-digitalizacion-2x2mkt.html`
6. `https://portfolio.ibaifernandez.com/project-portfolio-ibaifernandez.html`
7. `https://portfolio.ibaifernandez.com/project-myboard.html`
8. `https://portfolio.ibaifernandez.com/project-elm-st.html`
9. `https://portfolio.ibaifernandez.com/project-aglaya.html`
10. `https://portfolio.ibaifernandez.com/blog.html`
11. `https://portfolio.ibaifernandez.com/cv-print.html`

---

## Target Environment

- macOS + Chrome latest
- macOS + Safari latest
- Optional confidence pass: Firefox latest
- Screen widths:
  - `1440px`
  - `1280px`
  - `1024px`

---

## Preconditions

Before executing the checklist:

1. Latest `main` deploy is green in GitHub Actions.
2. Netlify production deploy is published.
3. Hard refresh the site.
4. Clear obvious browser cache if a recent UI fix was deployed.
5. Keep DevTools available for console/network spot checks.

---

## Pass / Fail Rule

- `PASS`: behavior is correct, stable, and visually acceptable.
- `FAIL`: broken behavior, misleading UI, layout break, inaccessible interaction, broken link, or serious visual defect.
- `WARN`: works, but quality is below release standard and should be improved before final launch if time allows.

---

## Checklist

### A. Home Page Shell

- [ ] Page loads without blank sections, broken HTML, or overlapping blocks.
- [ ] Sidebar renders correctly and does not cover main content.
- [ ] Hero renders cleanly above the fold.
- [ ] Main content starts after hero correctly; no nested-layout artifact.
- [ ] No duplicate "projects" or stale "Coming Soon" block appears below the real project section.
- [ ] Footer is visually stable and aligned.
- [ ] No obvious console errors on first load.

### B. Navigation and Anchors

- [ ] Sidebar anchors scroll to the correct section.
- [ ] "Contact" CTA lands in the contact section.
- [ ] Back-to-top button works.
- [ ] External links that open in new tabs behave correctly.
- [ ] No dead internal links on visible CTAs/cards.

### C. Language Toggle

- [ ] EN to ES toggle updates visible home copy.
- [ ] ES to EN toggle restores visible home copy.
- [ ] Project cards update their visible text after language switch.
- [ ] No mixed-language fragments appear in the same visible block.

### D. Projects Grid

- [ ] All visible project cards render their image, title, description, and CTA.
- [ ] Card spacing is visually consistent.
- [ ] No CTA wraps awkwardly or overflows.
- [ ] Clicking each visible project card opens the expected dossier.

### E. Project Dossiers

Run this section on every project page listed in Scope.

- [ ] Page loads without missing hero media or broken sections.
- [ ] Prev / next navigation works and remains coherent.
- [ ] "Back to portfolio" works.
- [ ] Unique visual identity of the dossier feels intentional and not broken.
- [ ] No missing images, empty placeholders, or broken embeds.
- [ ] No obvious overflow or clipped content at `1440px`, `1280px`, or `1024px`.
- [ ] Language toggle behaves correctly if the page supports live translation.

### F. Contact Flow

- [ ] Contact form fields are usable and readable.
- [ ] Invisible Turnstile does not create a visible layout jump in the happy path.
- [ ] Submit button remains visually stable while sending.
- [ ] Success notice renders cleanly after a valid submission.
- [ ] Error state is understandable if invalid data is entered.
- [ ] Inbox delivery is confirmed if this run includes a real send.

### G. CV Print View

- [ ] `cv-print.html` loads without sidebar navigation.
- [ ] Print controls render correctly.
- [ ] `#print` flow opens print preview correctly in Chrome.
- [ ] Layout is readable and does not collapse in desktop viewport.

### H. Blog Shell

- [ ] Blog page loads without layout break.
- [ ] "Coming soon" state is intentional and visually consistent.
- [ ] Sidebar and social links behave correctly here too.

### I. Accessibility Sanity (Manual)

- [ ] First `Tab` lands on the skip link.
- [ ] Skip link moves focus to main content.
- [ ] Keyboard-only navigation can reach sidebar controls.
- [ ] Keyboard-only navigation can reach the language toggle.
- [ ] Keyboard-only navigation can reach the contact form and submit button.
- [ ] Focus indicator is always visible.

### J. Visual Polish

- [ ] No unexpected font swap or missing icon fonts.
- [ ] Contrast is acceptable in real use, not just in audits.
- [ ] Buttons, notices, and cards feel aligned and production-ready.
- [ ] No obvious "legacy" block survives unintentionally.

---

## Execution Log

Fill one line per run.

| Date | Tester | Browsers | Result | Notes |
|---|---|---|---|---|
| YYYY-MM-DD | Ibai | Chrome / Safari | PASS / FAIL / WARN | |

---

## Defect Capture

For each issue found:

1. Route
2. Browser
3. Viewport width
4. Repro steps
5. Expected behavior
6. Actual behavior
7. Severity: `High`, `Medium`, `Low`

---

## Release Gate

Desktop QA is considered complete when:

- No `High` severity issue remains open
- No broken route or broken form path is present
- No layout break survives in Chrome or Safari at the target widths
