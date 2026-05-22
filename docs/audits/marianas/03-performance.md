# 03 — Performance Audit

**Date:** 2026-05-22
**Auditor:** Claude Opus 4.7 (1M context)
**Repo:** portfolio-ibaifernandez @ `1cabf77` (main)

---

## Executive summary

Performance is **OK on desktop, weak on mobile**. The owner-reported PageSpeed (`docs/ROADMAP.md:34-39`): Desktop `93 / 95 / 96 / 92`, Mobile `62 / 95 / 92 / 92` with **FCP 4.7s, LCP 7.6s on mobile** — these are post-rebuild numbers from March, before the hero rebuild added a canvas animation. Today's deploy adds work, not removes it.

Top 3 issues:
1. **P0 — Bootstrap 4 + jQuery + Swiper + Isotope + 5 other vendor libs ship to every page.** Total vendor JS+CSS = ~700 KB uncompressed even before custom code. For a static portfolio with no SPA needs, this is unjustifiable weight.
2. **P0 — `style.min.css` is 146 KB and growing.** The custom minifier leaves 35-60% on the table (see Architecture audit). A real minifier (csso/cssnano) would cut to ~85 KB. Hero rebuild added 1,200+ lines to style.css since the last release.
3. **P1 — Hero canvas animation runs an N²-bounded `requestAnimationFrame` loop on every mouse move.** Hundreds of dots × proximity calc × trail particles × on every mouse event. Mobile devices feel it. Battery cost real.

---

## Findings by severity

### P0
- **Asset weight on initial page load** (`index.html`):

| Asset | Size | Notes |
|---|---|---|
| HTML (index.html) | 192 KB | Massive HTML — should be ~30 KB. JSON-LD + structured data inline is fine, but most of the bulk is repeated markup from generated dossier card components. |
| bootstrap.min.css | 155 KB | Bootstrap 4. Of which ~5% is actually used. |
| style.min.css | 146 KB | Custom. After "minification" — should be 85 KB. |
| jquery.min.js | 89 KB | jQuery 3. Used heavily in custom.js. |
| swiper.min.js | 128 KB | Used for testimonials carousel. Lazy-loaded per `quality-guards.sh:100-113`. |
| custom.min.js | 51 KB | Custom. After "minification". |
| all.min.css | 54 KB | Font Awesome icons. |
| animate.min.css | 48 KB | Lazy-loaded (preload + onload pattern) per quality guards. |
| **Critical path total (CSS + JS in head)** | **~570 KB uncompressed** | Brotli at edge → ~120-140 KB. Still heavy for above-fold. |

  Mobile LCP at 7.6s confirms this is the bottleneck.

- **Performance budget only gates `index.html`** (`tests/performance-budget.config.json`):
  ```json
  "pages": [{
    "file": "index.html",
    "maxHtmlBytes": 285000,
    "maxCssBytes": 470000,
    "maxJsBytes": 500000,
    "maxImageBytes": 1800000,
    "maxImageCount": 70
  }]
  ```
  The 4 dossier pages plus cv-print.html have **no budget**. `lfi.html` is 83 KB of HTML alone. Free to balloon.

### P1
- **Hero canvas animation** (`assets/js/custom.js:1989-2177`) is computational:
  - On every `mousemove` event: trail emission (every 22ms when speed > 1) + `scheduleRender()` → `requestAnimationFrame(render)`.
  - `render()` iterates ALL grid dots (cols × rows = e.g. 40 × 25 = 1000 dots at typical viewport) and computes distance to mouse, eased opacity, plus a trail particle pass.
  - `dpr` capped at 2 — good.
  - **Respects `prefers-reduced-motion`** (line 1994): only suppresses trail particle emission. The dot proximity render still runs. **Partial respect.** Full reduce-motion should skip the whole animation.
  - **Pauses on `document.hidden`** (line 2158-2165): good.
  - **Resize recalculates `dots[]`** which can spike GC under window resize. Throttled? No — every resize event recomputes.
- **Font loading is non-blocking but Roboto blocks visual stability.** `index.html:34` uses `<link rel="preload" as="style" onload="this.rel='stylesheet'">` pattern — clever but means Roboto renders late. Hero displays in Josefin Sans (loaded synchronously via `font.css`). Body text shifts when Roboto arrives. Minor CLS contribution.
- **Two font systems competing:** Josefin Sans (custom @font-face in `font.css`) AND Roboto (Google Fonts) AND Font Awesome (icon glyphs) AND animate.css (loaded but not needed above-fold). Pruning unused weights could save 20-40 KB.
- **GA4 (`gtag/js`) is loaded synchronously async** via standard Google snippet (`async` attribute). Adds 70-90 KB to the JS budget. Could defer to `requestIdleCallback`.
- **No `<link rel="preload">` for the LCP image** (`assets/images/ibai-fernandez-1x1-sidebar.avif`). The sidebar profile picture IS the LCP element on mobile. Adding `<link rel="preload" as="image" type="image/avif" href=".../ibai-fernandez-1x1-sidebar.avif">` would shave ~300-500ms.
- **CV-print.html (55 KB)** loads the full `style.min.css` (146 KB). Print-only views don't need the interactive hero/carousel CSS. A separate `cv-print.min.css` exists (2 KB), but it's loaded ON TOP of style.min.css (`cv-print.template.html:14-15`), not instead of it.
- **`isotope.pkgd.min.js` (35 KB)** is loaded for filter/grid layout. Modern CSS Grid handles this in 0 KB. Lazy-loaded per quality guards, but still: dead weight.
- **`jquery.zoom.js`, `jquery.magnific-popup.min.js`, `scrollbar.js`, `circle-progress.js`, `cvtext1.js`, `cvtext2.js`** — all jQuery plugins lazy-loaded for specific UI features (popup images, custom scrollbar, progress rings, CV text rendering). Total: ~100 KB lazy. **All replaceable with vanilla CSS/JS for 0 KB.**

### P2
- **`scrollbar.min.js` (39 874 bytes) is +1 byte larger than `scrollbar.js` (39 873 bytes).** Custom minifier produces larger output than source. Bug in `scripts/build/assets.mjs`.
- **`jquery-jvectormap-world-mill.min.js` (104 263 B)** is also +1 byte vs source (104 262 B). Same bug.
- **`animate.css` is loaded but largely unused.** Modern hero animations use bespoke `@keyframes heroFadeUp`. The 48 KB animate.css library mostly provides classes the site doesn't apply. Prune.
- **HTML at 192 KB for index.html** is unusual for a portfolio. Likely sources: JSON-LD blob (~3 KB), inline structured data per project, the 4-card project grid + 7-row experience grid + testimonials carousel + services grid + footer. Could be lazy-rendered.
- **Bootstrap 4 (legacy)**: not Bootstrap 5. Bootstrap 4 needs jQuery. Migrating to Bootstrap 5 (or replacing with utility CSS / Tailwind) drops jQuery from critical path.
- **Images directory has 218 files including duplicates** (some have `.png` + `.avif` + `.webp` variants — that's 3 entries per logical image; 218 / 3 = ~70 logical images). Some still have only `.png` without modern variants (the AVIF/WebP coverage test skips small images <50 KB and alpha-PNGs).
- **`media:all` script regenerates AVIF + WebP for every image on every invocation** with no change detection. Slow for the human; doesn't matter for CI.
- **Cache headers**: 30 days for images, 7 days for CSS/JS. With manual `?v=20260522` cache-bust, the 7-day on CSS/JS is fine. But fingerprinting would let CSS/JS go `immutable` for a year.
- **No HTTP/2 server push** is configured (push is deprecated anyway; `103 Early Hints` is the modern replacement). Not configured.
- **No image CDN.** Netlify serves images directly. For ~13 MB of images, Netlify's CDN edge cache is fine, but no automatic responsive sizes (Netlify Image CDN is available but unused).

### P3
- **`favicon.png` (1 911 B)** instead of `.ico` or `.svg`. Modern browsers prefer SVG favicons. Minor.
- **Some images use `decoding="sync"`** (`ibai-fernandez-1x1-sidebar.jpeg` — eager + sync). Sync decode blocks the main thread briefly. For LCP element on mobile, this is intentional but could be `decoding="async"` with `fetchpriority="high"` for the same effect with less main-thread blocking.
- **`<picture>` blocks duplicate `srcset` data inline.** Each picture tag has 3 sources. The build pipeline could insert per-page critical CSS.

---

## Detailed analysis

### Bundle sizes (measured)

```
HTML (index.html generated):     192 KB
CSS critical path:
  bootstrap.min.css:             155 KB  (vendor)
  all.min.css:                    54 KB  (Font Awesome)
  font.min.css:                   16 KB  (custom @font-face)
  style.min.css:                 146 KB  (custom)
                          TOTAL: 371 KB CSS

CSS preloaded (animate.min.css):  48 KB

JS critical path (in head/deferred):
  jquery.min.js:                  89 KB
  custom.min.js:                  51 KB
                          TOTAL: 140 KB JS

JS lazy-loaded by custom.js:
  swiper.min.js:                 128 KB
  isotope.pkgd.min.js:            35 KB
  jquery.magnific-popup.min.js:   20 KB
  circle-progress.min.js:          6 KB
  scrollbar.min.js:               40 KB
  cvtext1.min.js / cvtext2.min.js: 7 KB
  jquery-jvectormap*.min.js:     162 KB
                          TOTAL: 398 KB lazy JS

Critical path before code (CSS + JS):  ~511 KB uncompressed
```

After Brotli on Netlify edge (typical 70-80% compression on CSS, 65-75% on JS):
- CSS: ~95 KB on wire
- JS: ~45 KB on wire
- HTML: ~30 KB on wire
- **Total above-fold bytes: ~170 KB compressed** — borderline acceptable for desktop, painful on 3G mobile.

### Render path

1. HTML downloads (~30 KB compressed)
2. Browser parses head — **render blocked** by:
   - bootstrap.min.css (155 KB)
   - all.min.css (54 KB)
   - font.min.css (16 KB)
   - style.min.css (146 KB)
3. Google Fonts (Roboto) — preloaded async, applied via `onload`
4. animate.css — preloaded async
5. Body parses
6. `<script defer src="jquery.min.js">` + `<script defer src="custom.min.js">` — deferred until parsed
7. After parse: jQuery + custom.js execute
8. custom.js lazy-loads swiper, isotope, etc. on demand (intersection observer? not verified — likely event-driven)
9. Canvas dot grid initializes (after DOMContentLoaded)

**LCP candidate**: profile picture `ibai-fernandez-1x1-sidebar.avif` (sidebar, top-left, ~70 KB AVIF) OR the pink "Ibai Fernández" h1 block. AVIF decodes fast on modern browsers. Likely the h1 wins LCP — it's pure CSS+font, no network beyond CSS.

**Fix priorities for mobile LCP**:
1. **Preload the AVIF profile image** (or the Roboto subset).
2. **Inline critical above-fold CSS** (~10 KB) directly in head; defer the rest.
3. **Replace Bootstrap 4 + jQuery** with vanilla CSS for the sidebar + hero (which is what's above-fold).
4. **Eliminate Font Awesome** in critical path; load icons as inline SVG or as a deferred sprite.

### Hero canvas cost

```javascript
// custom.js:1990-2177 (initHeroBackground)
// Per mousemove: O(N) where N = grid dots (~1000)
//   for each dot: dx, dy, sqrt distance, opacity calc, fillRect
//   plus trail particle list (capped at 36)
// rAF schedules render only when anyActive — auto-pauses when mouse leaves
```

**Observations:**
- Auto-pauses on `document.hidden` ✓
- `prefers-reduced-motion` only disables trail emission, NOT the dot proximity render. **Partial respect.** Full reduce-motion compliance: skip the canvas creation entirely.
- The `setTransform(1,0,0,1,0,0); scale(dpr, dpr)` pair per resize is idempotent — OK.
- Trail decay: `p.life -= 0.025` per frame at 60fps = ~40 frames to fade. Reasonable.

**Mobile impact:** the wrapper has `addEventListener('mousemove')` only (no `touchmove`). On touch devices the animation is essentially inactive — good for battery, bad for visual richness (intentional? confirm with owner).

### Font strategy

- **Josefin Sans** — custom @font-face, ~16 KB across weights. Loaded synchronously via `font.css`.
- **Roboto** — Google Fonts, 4 weights (300/400/500/700). Lazy via preload+onload. Network roundtrip + ~25 KB.
- **Font Awesome** — `all.min.css` (54 KB) + webfont (~70 KB woff2). Used for sidebar icons + service section icons.

**Recommendation:** Drop Font Awesome. Inline the 12-15 icons actually used as SVG. Saves ~120 KB total.

### Image optimization

- All images >50 KB have AVIF + WebP variants per `tests/check-avif-coverage.mjs` + `check-webp-coverage.mjs`.
- Alpha PNGs are skipped (correct — AVIF for transparency is finicky).
- Profile picture: `ibai-fernandez-1x1-sidebar.avif` (70 KB), `.webp` (99 KB), `.jpeg` (571 KB). The original JPEG is huge — 1024×1024 unnecessarily large since it renders at maybe 80×80 sidebar size. **Generate a smaller variant for the sidebar (e.g. 160px)** and use `srcset` for retina.
- `chankete-full-web.jpeg` is 849 KB (!), `debtracker.png` 545 KB. The performance budget caps single-image at 300 KB — these are exempt because they're (presumably) not on `index.html` directly.

### Caching strategy

`netlify.toml` defines:
- HTML: `no-store, no-cache, must-revalidate, max-age=0` — correct (each deploy invalidates HTML)
- JSON: `max-age=86400, stale-while-revalidate=604800` — correct
- CSS/JS: `max-age=604800` (7 days) — conservative, fine
- Images: `max-age=2592000` (30 days) — fine
- Webfonts: `max-age=2592000, immutable` — correct (filename-versioned)

**Interaction with `?v=20260522`:** Yes, query-string busts the cache. But the cache key is "URL with query", so `style.min.css?v=20260522` is a *different* cached entry from `style.min.css`. Repeat visitors with the OLD URL cached still see old CSS until their cache TTL expires OR they request the new URL. Since HTML is no-cache, they DO request new HTML, which DOES contain the new URL. So the bust works on next page navigation.

### Predicted Core Web Vitals (mobile, 4G throttle)

- **LCP**: ~3-4 seconds (was 7.6s pre-AVIF rollout). Could be 1.5-2s with image preload + critical CSS inline.
- **CLS**: 0.004 (per owner report). Excellent, due to width/height on images.
- **INP**: Unknown. Hero canvas may push it on low-end phones. Likely 200-300ms.
- **FCP**: ~2-3s. Could be 1s with critical CSS inline.

---

## Recommendations (prioritized)

1. **Inline above-fold critical CSS** in `<head>` (~10 KB), defer the rest of style.min.css. Single biggest LCP win.
2. **Replace the custom minifier with terser + csso/cssnano**. ~60 KB shaved off CSS + JS combined.
3. **Preload the LCP image** (`assets/images/ibai-fernandez-1x1-sidebar.avif`) via `<link rel="preload" as="image" type="image/avif">`.
4. **Drop Bootstrap 4 + jQuery** for above-fold. Hero + sidebar can be vanilla CSS. Keep Bootstrap classes if needed for backwards compat in dossier pages, but don't load on index.html critical path. Aspirational; high effort.
5. **Drop Font Awesome.** Inline the 12-15 SVG icons actually used. ~120 KB saved.
6. **Fully respect `prefers-reduced-motion`** in the hero canvas — skip canvas creation entirely, not just trail particles.
7. **Generate a smaller sidebar profile picture variant** (160×160) and `srcset` for retina. Saves 400+ KB on mobile (the 1024×1024 .jpeg fallback is overkill).
8. **Extend performance budget to all 4 dossier pages + cv-print.html.** Right now they're ungated.
9. **Replace `isotope` + `magnific-popup` + `circle-progress` + `scrollbar` jQuery plugins** with native equivalents over time.
10. **Defer GA4** to `requestIdleCallback`. Wait until after LCP.
11. **Fix the minifier bug** that produces +1 byte output for `scrollbar.js` and `jquery-jvectormap-world-mill.js`. Cosmetic but indicates broken code.

---

*End of performance audit.*
