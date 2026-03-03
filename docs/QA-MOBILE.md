# QA Manual - Mobile

## Purpose

Manual release checklist for mobile devices and narrow viewports. This is the human gate for responsive behavior, touch ergonomics, perceived performance, and mobile-specific regressions that can slip past desktop-first validation.

This checklist is structural and can run before final content freeze.

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
11. `https://portfolio.ibaifernandez.com/cv-print.html` (visual sanity only; print action can be deferred to desktop)

---

## Target Environment

- iPhone Safari (recent iOS)
- Chrome on Android (recent)
- Narrow viewport sanity widths:
  - `390x844`
  - `360x800`
  - `320x568`

If no physical device is available, use responsive emulation as fallback, but real-device verification is preferred.

---

## Preconditions

1. Latest production deploy is live.
2. Test on a real network, not only desktop emulation.
3. Hard refresh before the run.
4. If testing the form, use a fresh session to avoid stale field state.

---

## Pass / Fail Rule

- `PASS`: mobile behavior is stable, readable, and touch-friendly.
- `FAIL`: layout break, blocked interaction, unusable control, horizontal overflow, or broken route.
- `WARN`: works but feels too cramped, too slow, or visually rough.

---

## Checklist

### A. First Load and Perceived Performance

- [ ] Home page becomes usable quickly enough on mobile data.
- [ ] No blank white flash or obvious broken render persists.
- [ ] Above-the-fold content feels intentional on first paint.
- [ ] The page does not visibly "jump" after initial render.

### B. Layout Integrity

- [ ] No horizontal scrolling on Home.
- [ ] No horizontal scrolling on Blog.
- [ ] Sidebar/mobile nav state does not block content unexpectedly.
- [ ] Cards stack correctly and keep readable spacing.
- [ ] Text remains readable without zoom.
- [ ] Buttons remain tappable and not overly compressed.

### C. Navigation and Touch Targets

- [ ] Menu / sidebar controls are easy to tap.
- [ ] Section navigation lands in the right place.
- [ ] Back-to-top button is visible when needed and tappable.
- [ ] Social links are reachable and do not overlap.
- [ ] Tap targets feel safe for thumbs, not tiny.

### D. Home Content Flow

- [ ] Hero remains coherent on mobile.
- [ ] Services and experience sections do not collapse awkwardly.
- [ ] Projects section reads as a real showcase, not a broken grid.
- [ ] Testimonials and logos still feel controlled visually.
- [ ] Contact block fits the viewport cleanly.

### E. Project Dossiers

Run on every project page listed in Scope.

- [ ] Hero and first content block are readable without pinch-zoom.
- [ ] Special interactive sections still work on touch.
- [ ] Images/media scale correctly and do not overflow.
- [ ] Prev / next navigation remains usable on mobile.
- [ ] No clipped text, overlapping panels, or unusable controls appear.

### F. Contact Flow

- [ ] Form fields are easy to focus on mobile.
- [ ] Virtual keyboard does not break the form layout.
- [ ] Invisible Turnstile remains visually invisible in the happy path.
- [ ] Submit interaction does not create a jarring layout shift.
- [ ] Success notice is readable and fits the mobile width.
- [ ] Real submission works if this run includes a live send.

### G. Language Toggle

- [ ] EN to ES works on mobile.
- [ ] ES to EN works on mobile.
- [ ] Switching language does not distort spacing or overflow text.

### H. Mobile Accessibility Sanity

- [ ] Focus and tap states remain visible where relevant.
- [ ] No critical content is hidden behind sticky/fixed UI.
- [ ] Orientation change does not break the layout severely.

### I. Mobile-Specific Polish

- [ ] No element feels "desktop squeezed into mobile".
- [ ] Motion and transitions feel acceptable.
- [ ] Long sections still feel scrollable and controlled.
- [ ] Footer remains readable and stable at the end of the page.

---

## Execution Log

| Date | Tester | Devices | Result | Notes |
|---|---|---|---|---|
| YYYY-MM-DD | Ibai | iPhone / Android | PASS / FAIL / WARN | |

---

## Defect Capture

For each issue found:

1. Route
2. Device or emulated viewport
3. Repro steps
4. Expected behavior
5. Actual behavior
6. Severity: `High`, `Medium`, `Low`

---

## Release Gate

Mobile QA is considered complete when:

- No `High` severity mobile regression remains open
- No route has horizontal overflow at target widths
- The contact flow is usable and visually stable on a real mobile browser
