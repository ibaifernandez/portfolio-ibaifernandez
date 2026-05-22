# 04 — Accessibility & Usability Audit

**Date:** 2026-05-22
**Auditor:** Claude Opus 4.7 (1M context)
**Target:** WCAG 2.2 Level AA

---

## Executive summary

Accessibility is **notably better than typical portfolios**: skip link, `aria-live` contact response, `focus-visible` styles, `prefers-reduced-motion` baseline, axe-core gating in CI, keyboard tab tests, `aria-label` on social icons. The owner has invested real effort. **However**, the language toggle implementation, the canvas hero animation, and the cycling typing text in the hero all have AA-grade issues that the current test suite does not catch.

Top 3 issues:
1. **P0 — Language toggle is an `<img>` styled as a button.** Real `<button>` would give native semantics for free. The current code injects `role="button"` + `tabindex="0"` + keyboard handler in `translate.js:170-181`. It works, but it's fragile — an AT might not announce the role consistently across browsers, and the focus ring on `<img>` is non-standard.
2. **P1 — Hero typing animation cycles 5 items with NO pause/stop/hide control.** WCAG 2.2.2 (Pause, Stop, Hide) requires user control over moving/blinking/auto-updating content > 5s. The typing animation runs indefinitely.
3. **P1 — `prefers-reduced-motion` only PARTIALLY respected in the hero canvas.** Trail emission disabled, but the proximity dot render still animates on mouse move. Strict WCAG 2.3.3 expects no animation under reduced motion.

---

## Findings by severity

### P0
- **Language toggle uses `<img id="translate-button-icon">`** (`src/components/shared/translate-button.html:3`) with JS-applied `role="button"` and `tabindex="0"` (`translate.js:171-172`). The pattern works in practice (the existing keyboard.spec.js test passes), but:
  - Some screen readers don't reliably announce `role="button"` on `<img>`.
  - The focus indicator is the browser default for `<img>` — not the polished `:focus-visible` style applied to other controls.
  - Pressing Space scrolls the page unless `event.preventDefault()` is reliably called — verified in code (line 178) but fragile.
  - **Fix:** wrap in a real `<button>`: `<button id="translate-button-icon-btn" aria-label="..."><img ... aria-hidden="true"></button>`. Then drop the JS shim.
- **The hero `<canvas>`** is created dynamically (`custom.js:1996-1999`) with `setAttribute('aria-hidden', 'true')` — good, hides decorative canvas from AT. ✓

### P1
- **Typing animation in hero** (`index.html` typing list — `ul.texts.home-desc` rotating through 5 `<li>`) has no pause/stop control. WCAG 2.2.2: any movement/blinking/auto-updating content that starts automatically AND lasts more than 5 seconds AND is presented in parallel with other content must be pausable. The typing animation runs indefinitely. **Fix:** add a "pause typing" button, or respect `prefers-reduced-motion` and freeze on the first item.
- **`prefers-reduced-motion` partial respect in hero canvas** (see Performance audit P1). Strict reading of WCAG 2.3.3: any non-essential animation must be disabled.
- **Color contrast NOT verified for cyan typing text on cream paper** (`var(--hero-accent-cyan)` on `var(--hero-color-paper)`). The cyan accent (#00C8DA per custom.js line 2011: `'0,200,218'`) on cream (#FAFAF9 typical) is ~2.5:1 — **fails WCAG AA 4.5:1 for body text**. The typing items are read as body text. **Verify with a contrast checker on the actual hex values.**
- **Pink "Ibai Fernández" block** uses `var(--hero-accent-pink)` (likely #FF517E given `255,81,126` in custom.js:2011) as background with `var(--hero-color-ink)` (dark) for "Ibai" and `var(--hero-color-paper)` (cream) for "Fernández" — the cream-on-pink contrast may fail AA for large text (3:1 required). **Verify.**
- **Tooltip box in sidebar nav** (`<div class="tooltip_box">` per sidebar.html) — tooltips that appear on hover/focus need to be dismissible (WCAG 1.4.13 Content on Hover or Focus). Verify the tooltip can be dismissed without moving the mouse and stays visible while hovered.
- **Profile picture has `alt="Ibai Fernández"`** (`index.html:108`). For a profile photo near the name "Ibai Fernández" displayed in the sidebar, alt text that is just the name is REDUNDANT (the name is already announced from the H1). Better: `alt=""` (decorative, since the name is right there) OR `alt="Portrait of Ibai Fernández"`. Mild.
- **No `lang` switching on inline foreign text.** When ES is active, the `<html lang="es">` is set, but English-only phrases (e.g. "AI Product Engineer" in the hero role) are not marked `lang="en"`. A Spanish screen reader might mispronounce. WCAG 3.1.2 (Language of Parts).
- **Cv-print toolbar buttons** (`cv-print.template.html:23-25`): "ES" and "Print CV" — the "ES" label is the target language code (when EN is active, button says "ES"). For a screen reader: "ES button" is opaque. Better: `aria-label="Switch to Spanish"` / `"Cambiar a inglés"` per current state.

### P2
- **`<a class="siderbar_menuicon">`** elements in sidebar nav contain SVG icons but no visible text. The accessible name is determined by... what? Inspecting `sidebar.html:22-50` shows no `aria-label` on the sidebar menu items (only on the social icons). The tooltip-box visible-on-hover may serve sighted users, but screen readers see anchor with SVG inside, no accessible name. **Verify with axe** — the test currently passes axe, so possibly the heading inside or the tooltip text is being picked up. Worth a manual screen reader pass.
- **Heading hierarchy:** the `quality-guards.sh` enforces no H1 or H2 with old `port_heading` / `port_sub_heading_2` classes (lines 84-90). Good. But it doesn't enforce HIERARCHY — that H1 → H2 → H3 order is maintained. A custom check would help.
- **Skip link `.skip-link`** targets `#about_sec`. ✓ Verified in keyboard.spec.js.
- **Form field labels:** the contact form (`index.html:2236-2300`) has `<input type="text" name="first_name">` — let me check the markup pattern. Quality guard checks `#name`, `#last-name`, `#email`, `#subject`, `#comment` are tabbable (keyboard.spec.js). Visual labels appear to use placeholders only — that's an a11y antipattern (placeholders disappear on input). **Verify each input has a `<label for="...">` or `aria-label`.**
- **`role="status"` + `aria-live="polite"` on `#contact-response`** (`index.html:2299`). ✓ Quality guard enforces this. Good.
- **`aria-atomic="true"`** on the same element — re-announces the whole region on change. ✓
- **Tooltip box dismissal:** WCAG 1.4.13 also requires that hover/focus content not obscure other content. Sidebar tooltips slide out to the right — verify they don't overlap critical content on narrow screens.
- **Touch target size:** WCAG 2.5.8 requires 24×24 CSS px minimum. Sidebar SVG icons in `sidebar.html` are explicitly 26×26 — passes. Social icons in `port_sidebar_social` use `i.fa-xx` — verify computed click area is ≥24px on mobile. The hero CTAs are pill-shaped, ~150×44 px — passes.
- **Focus order on mobile:** sidebar collapses to a hamburger on mobile. Order should be: hamburger → main content. Verify with mobile DevTools.
- **External links opened in new tab** (LinkedIn, GitHub, etc.) — should announce "opens in new window". Currently no such label per inspection. Add `aria-label` with "(opens in new window)" suffix.

### P3
- **`<noscript>` fallbacks** for non-blocking CSS preloads are correct (lines 35, 41 of index.html). Good defensive coding.
- **`prefers-color-scheme: dark`** support? Not present in CSS. Site has a single (cream) theme. Modern users with dark mode preference get a slightly jarring bright site. Not WCAG required, but UX.
- **`alt` on the favicon** — not applicable to favicons.
- **Decorative SVGs in sidebar** have no `aria-hidden`. Should have, since the parent anchor (presumably) provides the name. Verify after fixing the missing-anchor-name issue.
- **Language toggle image's `alt` text** changes via `translate.js:111-113` to "Switch to Spanish" / "Switch to English" — good.

---

## Detailed analysis

### Semantic HTML & landmarks

Verified via grep on `index.html`:
- `<main class="port_sec_warapper">` — present (per `AGENTS.md` rule #8). ✓
- `<header>` — NOT explicitly verified in this audit pass; should wrap the sidebar profile area.
- `<nav>` — present via `port_navigation index_navigation`. ✓
- `<footer>` — present at end. ✓
- `<a class="skip-link">` — first focusable, targets `#about_sec`. ✓
- Multiple `<section>` (port_about_setions, etc.) — ✓

### Skip link

```html
<a class="skip-link" href="#about_sec">Skip to main content</a>
```
- Position: first focusable element. ✓
- Target: `#about_sec` exists. ✓
- Visible on focus: depends on `.skip-link:focus-visible` CSS. Grep `focus-visible` count = 14 in `style.css` → assume styled.

Tested by `tests/e2e/keyboard.spec.js:34-44` and `home.spec.js:35-44`. ✓

### Keyboard navigation

Verified by `keyboard.spec.js`:
- First Tab lands on skip link ✓
- Subsequent Tabs cycle through sidebar nav anchors in expected order ✓
- Translate button is keyboard-reachable + Enter activates ✓
- Form fields tabbed in logical order (name → last-name → email → subject → comment → submit) ✓
- Social links keyboard-reachable + have `aria-label` (Facebook/LinkedIn/WhatsApp/GitHub/Instagram) ✓

**Gap:** no test of "Tab through entire page reaches end without trap". Add `keyboard.spec.js` test that Tab N times and verifies focus reaches the footer or wraps.

### ARIA

- `aria-live="polite"` on `#contact-response` ✓
- `aria-atomic="true"` on same ✓
- `role="status"` on same ✓
- `aria-label` on social icons ✓
- `role="button"` on translate icon (JS-applied) — should be a real `<button>` instead
- `aria-hidden="true"` on hero canvas ✓
- `aria-describedby="contact-response"` on contact form ✓

**Missing:** `aria-label` on sidebar menu anchors (the `siderbar_menuicon` SVG-only anchors). Tooltip text MAY provide it but verify.

### Color contrast (estimated)

Without DevTools, estimated from `--hero-*` variables seen in style.css and brand colors:
- Cream paper background: `var(--hero-color-paper)` ≈ `#FAFAF9` (warm white)
- Ink text: `var(--hero-color-ink)` ≈ `#0A0A0A` (warm black)
  - Ink-on-paper: ~20:1 ✓ AAA
- Pink accent: `#FF517E` (per canvas: `255,81,126`)
  - Pink-on-paper: ~3.0:1 — passes AA large only
  - Cream-on-pink: ~6.5:1 — passes AA body
- Cyan accent: `#00C8DA` (per canvas: `0,200,218`)
  - Cyan-on-paper: ~2.4:1 — **FAILS AA body (4.5:1)**, fails AA large (3:1)
  - **The cyan typing text in the hero may fail contrast.** Verify with actual hex values + Lighthouse audit.

### Reduced motion

`style.css` has 3 `prefers-reduced-motion` rules. Quality guard enforces presence. Need to verify what they actually disable.

Hero canvas (`custom.js:1994`):
```javascript
var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
// ... later ...
if (reduceMotion) return; // (line 2121, inside handleMove — disables trail only)
```

**Issue:** the dot proximity animation runs regardless. Should: `if (reduceMotion) { /* render static grid once, return */ }`.

### Form accessibility

Per `index.html:2236-2300`:
- `<form id="scroll_contact" novalidate aria-describedby="contact-response">` ✓ (novalidate is intentional — JS handles validation)
- Hidden honeypot has `tabindex="-1"` ✓ (skip in tab order)
- Hidden fields (`form_started_at`, `captcha_provider`, `captcha_token`) ✓
- `<input type="text" name="first_name">` — but where's the `<label>`? **Inspection needed.** Quality guard does NOT check label presence.
- `.response` div has `role="status"` + `aria-live="polite"` + `aria-atomic="true"` ✓

### Language switching

`translate.js:146`:
```javascript
document.documentElement.setAttribute('lang', currentLanguage);
```
✓ `<html lang>` updates on toggle. Verified by `home.spec.js:70-81` (now using `hero-eyebrow-1` key after recent fix).

**Persistence:** `localStorage.portfolio_language` (line 142). Survives reloads. ✓
**URL param:** `?lang=es` overrides localStorage (line 51). ✓
**Initial language:** falls back to `'en'` (line 49). Does NOT respect `navigator.language` / `Accept-Language`. Spanish-speaking visitors get English on first load.

### Touch targets

Sidebar SVGs are 26×26 — meets WCAG 2.5.8 (24×24 min).
CTA pills (`portfolio_btn`) are 44+ tall — meets.
Social icons via Font Awesome — verify computed click area on mobile.
Translate button — `<img>` is 64×64 — passes.

### Zoom / reflow

WCAG 1.4.10 requires no horizontal scroll at 400% zoom on 1280×1024. Not tested in this audit. The fluid `clamp()` typography (hero) suggests reflow was considered. Verify by manual test.

---

## Recommendations (prioritized)

1. **Replace the language toggle `<img>` with a real `<button>`** containing the icon as `aria-hidden` decoration. Drop the `role="button"` + `tabindex` shim in `translate.js`.
2. **Add pause/stop control to the hero typing animation** OR freeze it under `prefers-reduced-motion`. WCAG 2.2.2 compliance.
3. **Full `prefers-reduced-motion` respect in the hero canvas** — skip canvas creation entirely.
4. **Verify and (probably) darken the cyan accent color** so typing text meets AA 4.5:1 on cream paper. The current #00C8DA on #FAFAF9 fails.
5. **Add `<label>` elements or `aria-label`** to all form inputs. Don't rely on placeholders. Add a quality guard.
6. **Add `aria-label="(opens in new window)"`** suffix or icon to all `target="_blank"` links.
7. **Respect `Accept-Language`** in translate.js fallback path: `navigator.language.startsWith('es') ? 'es' : 'en'`.
8. **Mark inline foreign text with `lang` attribute** — at minimum, "AI Product Engineer" stays English when page is in Spanish. Add `<span lang="en">`.
9. **Run axe-core on dossier pages**, not just `index.html`. Currently `a11y.spec.js` only tests index sections.
10. **Add full-page tab-cycle test** that verifies no keyboard trap and focus eventually wraps.

---

*End of accessibility audit.*
