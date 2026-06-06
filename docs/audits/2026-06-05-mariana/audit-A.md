# Phase A — Product Surface (Accessibility · Usability · Performance · SEO)

_Mariana Trench audit — 2026-06-05 · HEAD `3faadfb` · REPORT mode · portfolio-ibaifernandez_

**35 findings** — MEDIUM 10 · LOW 11 · INFO 14

### Evidence Dashboard

| Confidence | Count | % |
|---|---|---|
| PROVEN | 34 | 92% |
| SUSPECTED | 0 | 0% |
| UNVERIFIABLE | 3 | 8% |
| **Total** | **37** | 100% |

Health signal: **healthy (PROVEN ≥ 60%)**.

- **A11y** — 8 findings · PROVEN 8 / SUSPECTED 0 / UNVERIFIABLE 1 · code-read 5 · manual-verification 3 · tool-external 1 (python contrast calc)
- **Usability** — 7 findings · PROVEN 7 / SUSPECTED 0 / UNVERIFIABLE 0 · code-read 6 · graph-local 0 · tool-external 1 (grep/wc) · manual-verification 0
- **Performance** — 8 findings · PROVEN 8 / SUSPECTED 0 / UNVERIFIABLE 1 · code-read 4 · tool-external 4 · manual-verification 0 · graph-local 1 (orientation only)
- **SEO** — 12 findings · PROVEN 11 / SUSPECTED 0 / UNVERIFIABLE 1 · code-read 7 · tool-external 4 · manual-verification 1

## Findings (severity-sorted)

| ID | Sev | Conf | Dim | Finding | Ref | Effort |
|---|---|---|---|---|---|---|
| A-A11Y-03 | MEDIUM | PROVEN | A11y | Sidebar navigation icon-links have no accessible name (SVG-only, tooltip is a sibling) | WCAG 4.1.2 Name, Role, Value (A); 2.4.4 Link Purpose (A) | S |
| A-A11Y-04 | MEDIUM | PROVEN | A11y | "More information" disclosure toggle never exposes aria-expanded state | WCAG 4.1.2 Name, Role, Value (A); 1.3.1 (A) | S |
| A-A11Y-05 | MEDIUM | PROVEN | A11y | Translate toggle is a bare <img>: keyboard operability and role exist only after JS, weak no-JS accessible name | WCAG 2.1.1 Keyboard (A); 4.1.2 Name, Role, Value (A) | M |
| P-PERF-01 | MEDIUM | PROVEN | Performance | AVIF <source> references lfi-la.avif which does not exist on disk (404 + wasted round-trip) | N-A | S |
| P-PERF-03 | MEDIUM | PROVEN | Performance | Font immutable cache header targets non-existent /assets/webfonts/* — real fonts at /assets/fonts/ get only the weak catch-all | N-A | S |
| P-PERF-04 | MEDIUM | PROVEN | Performance | ~333KB of render-blocking CSS in <head> with no inlined critical CSS; full Bootstrap shipped on a custom portfolio | N-A | L |
| SEO-BILINGUAL-01 | MEDIUM | UNVERIFIABLE | SEO | Bilingual via single-URL JS toggle (?lang=) is sub-optimal vs distinct indexable URLs | N-A | XL |
| SEO-LD-01 | MEDIUM | PROVEN | SEO | Dossier pages carry zero JSON-LD structured data; no Article/CreativeWork/BreadcrumbList anywhere | N-A | M |
| SEO-OG-01 | MEDIUM ⬇(HIGH) | PROVEN | SEO | 3 of 4 dossier pages have NO og:image / twitter:image — broken social previews | N-A | M |
| UX-FORM-01 | MEDIUM | PROVEN | Usability | Contact form feedback messages are hardcoded English, not localized — Spanish visitors get English errors/success | N-A | M |
| A-A11Y-01 | LOW | PROVEN | A11y | Two <h1> elements on index.html (single-h1 rule violated) | WCAG 1.3.1 Info and Relationships (A) | S |
| A-A11Y-02 | LOW | PROVEN | A11y | Heading level skip h2 -> h4 in the experience/career section (no h3) | WCAG 1.3.1 Info and Relationships (A) | M |
| A-A11Y-06 | LOW | PROVEN | A11y | Language change on translate toggle is not announced via a live region (lang attr updates, but no status message) | WCAG 4.1.3 Status Messages (AA) | S |
| P-PERF-02 | LOW | PROVEN | Performance | AVIF coverage test has a blind spot: alpha-channel PNGs are skipped, so their broken avif <source> goes unguarded | N-A | M |
| P-PERF-05 | LOW | PROVEN | Performance | Performance budget config omits 404.html and lfi-legacy.html — heaviest non-budgeted page references 571KB + 263KB raster fallbacks | N-A | S |
| P-PERF-06 | LOW | PROVEN | Performance | bootstrap.min.css lacks cache-busting query while served with 7-day cache — stale CSS risk after a content change | N-A | S |
| SEO-CANON-01 | LOW | PROVEN | SEO | lfi-legacy.html canonical points to non-existent lfi.html | N-A | S |
| SEO-HREFLANG-01 | LOW | PROVEN | SEO | Sitemap declares hreflang alternates for dossiers, but dossier pages emit no hreflang link tags (sitemap/page mismatch) | N-A | S |
| SEO-OGTYPE-01 | LOW | PROVEN | SEO | OG type semantics correct: website for home, article for dossiers | N-A | S |
| SEO-TWITTER-01 | LOW | PROVEN | SEO | Twitter card tags use property= instead of name= attribute | N-A | S |
| UX-DENSITY-01 | LOW | PROVEN | Usability | index.template.html exceeds the 700-LOC cognitive-density threshold (748 LOC) — only shipped template over the bar | N-A | M |
| A-A11Y-07 | INFO | PROVEN | A11y | Color contrast: text/UI palette meets AA (verified, no failures in real usage) | WCAG 1.4.3 Contrast (Minimum) (AA) | S |
| A-A11Y-08 | INFO | PROVEN | A11y | Reduced motion, viewport zoom, alt text, form labels, skip links, and bilingual chip aria all PASS | WCAG 2.3.3, 1.4.4, 1.4.10, 1.1.1, 3.3.2, 1.3.1, 2.4.1, 4.1.2, 2.5.8 | S |
| P-PERF-07 | INFO | PROVEN | Performance | Strong baseline confirmed: AVIF/WebP coverage passes, all JS deferred, GA4 fully lazy, fonts self-hosted, LCP image preloaded | N-A | S |
| P-PERF-08 | INFO | UNVERIFIABLE | Performance | Core Web Vitals (LCP/INP/CLS) require runtime measurement against the live deploy | N-A | S |
| SEO-404-01 | INFO | PROVEN | SEO | 404.html is properly noindexed with descriptive title/description | N-A | S |
| SEO-CORE-01 | INFO | PROVEN | SEO | Core head tags (title/description/canonical/lang/theme-color) present and unique on every public page | N-A | S |
| SEO-LLMS-01 | INFO | PROVEN | SEO | llms.txt and llms-full.txt present and coherent with sitemap/pages | N-A | S |
| SEO-ROBOTS-01 | INFO | PROVEN | SEO | robots.txt present, valid, with sitemap directive and sensitive-path disallows | N-A | S |
| SEO-SITEMAP-01 | INFO | PROVEN | SEO | sitemap.xml lists all public pages and matches content/projects.json outputs | N-A | S |
| UX-COOKIE-01 | INFO | PROVEN | Usability | Cookie consent UX is clear and non-dark-patterned: equal-weight Reject/Accept, denied-by-default, persisted, re-openable | GDPR Art.7 / Chile Ley 21.719 | S |
| UX-DISABLED-01 | INFO | PROVEN | Usability | @include-DISABLED services & testimonial sections are cleanly hidden (not half-broken) and no nav links point at them | N-A | S |
| UX-FORM-02 | INFO | PROVEN | Usability | Contact form has a complete, accessible per-submit state machine (loading / error / success) — no anti-patterns | WCAG 4.1.3 Status Messages | S |
| UX-FORM-03 | INFO | PROVEN | Usability | No native alert()/confirm()/prompt() anywhere in the codebase | N-A | S |
| UX-I18N-01 | INFO | PROVEN | Usability | Translate toggle is discoverable, keyboard-accessible, and persists language across visits | WCAG 3.1.2 / 2.1.1 | S |

## Detail

#### A-A11Y-03 — Sidebar navigation icon-links have no accessible name (SVG-only, tooltip is a sibling)
- **Severity:** MEDIUM · **Confidence:** PROVEN (line-proof) · **Source:** manual-verification · **Effort:** S · **Ref:** WCAG 4.1.2 Name, Role, Value (A); 2.4.4 Link Purpose (A)
- **Evidence:** index.html lines 139,186,272,315: '<a href="#about_sec" class="siderbar_menuicon">' contains only inline <svg> (no <title>, no aria-label, no text). The label '<span class="menu_tooltip" translate="sidebar-tooltip-about">About</span>' (line 180) sits OUTSIDE the </a> (closing </a> is line 179, span is line 180) so it does not contribute to the link's accessible name. Verified: `sed -n '139p;186p;272p;315p' index.html | grep aria-label` returns nothing. 4 nav links affected (About/Training/Projects/Contact).
- **Recommendation:** Add aria-label (with a translate-aria-label key for ES/EN) to each .siderbar_menuicon <a>, e.g. aria-label="About" translate-aria-label="sidebar-tooltip-about", or move the .menu_tooltip <span> inside the <a>. The translate.js attr pipeline already supports translate-aria-label (translate.js L119-133), so reuse the existing sidebar-tooltip-* keys.

#### A-A11Y-04 — "More information" disclosure toggle never exposes aria-expanded state
- **Severity:** MEDIUM · **Confidence:** PROVEN (line-proof) · **Source:** code-read · **Effort:** S · **Ref:** WCAG 4.1.2 Name, Role, Value (A); 1.3.1 (A)
- **Evidence:** index.html line 474 '<button type="button" class="about_icon_toggle" ... aria-label="Show more information about Ibai">' has no aria-expanded in static HTML, and the JS handler assets/js/custom.js L665-670 only does `$('.about_leftsection').toggleClass('open_details')` — it never sets aria-expanded. `grep -n 'aria-expanded' index.html` shows none on this control. Screen-reader users cannot perceive expanded/collapsed state.
- **Recommendation:** Add aria-expanded="false" to the button in the template and toggle it in the about_opendetails handler (custom.js L666): `$(this).attr('aria-expanded', $('.about_leftsection').hasClass('open_details'))`. Optionally add aria-controls pointing to the .about_leftsection id.

#### A-A11Y-05 — Translate toggle is a bare <img>: keyboard operability and role exist only after JS, weak no-JS accessible name
- **Severity:** MEDIUM · **Confidence:** PROVEN (line-proof) · **Source:** manual-verification · **Effort:** M · **Ref:** WCAG 2.1.1 Keyboard (A); 4.1.2 Name, Role, Value (A)
- **Evidence:** src/components/shared/translate-button.html L3 and index.html L1712: '<img id="translate-button-icon" ... alt="Translate Button">'. role="button"/tabindex="0"/click+keydown handlers are added at runtime by translate.js L203-216; the static markup has no role, no tabindex, and the only accessible name is alt="Translate Button" (describes role, not the switch-language action). If JS fails or is blocked, the control is not keyboard-focusable/operable. After JS, toggleLanguageButton() (translate.js L137-148) sets a good alt/aria-label ("Switch to Spanish"/"Switch to English").
- **Recommendation:** Make the control a real <button> wrapping the flag <img> in the template (native keyboard + role), and give it a meaningful default aria-label (translate-aria-label key) instead of alt="Translate Button". This removes the JS-only keyboard dependency and improves the pre-JS accessible name.

#### P-PERF-01 — AVIF <source> references lfi-la.avif which does not exist on disk (404 + wasted round-trip)
- **Severity:** MEDIUM · **Confidence:** PROVEN (proven-by-absence) · **Source:** tool-external · **Effort:** S · **Ref:** N-A
- **Evidence:** lfi-legacy.html:376 declares `<source type="image/avif" srcset="assets/images/lfi-la.avif">`. Disk scan: `ls assets/images/lfi-la.*` returns only lfi-la.png (263681B) and lfi-la.webp (44444B) — no .avif. Full cross-page scan `for u in $(grep -rhoE 'assets/images/[^" ]+\.(avif|webp)' *.html|sort -u); do [ ! -f "$u" ]&&echo MISSING:$u; done` → exactly one: `MISSING: assets/images/lfi-la.avif`. AVIF-capable browsers request the avif source first, get 404, then fall back to webp — one wasted request + a 404 in the network panel.
- **Recommendation:** Generate lfi-la.avif (`npm run media:avif` regenerates + rewires) or remove the avif <source> line. webp fallback already works, so it is a wasted round-trip not a broken image.

#### P-PERF-03 — Font immutable cache header targets non-existent /assets/webfonts/* — real fonts at /assets/fonts/ get only the weak catch-all
- **Severity:** MEDIUM · **Confidence:** PROVEN (tool-output) · **Source:** tool-external · **Effort:** S · **Ref:** N-A
- **Evidence:** netlify.toml:271-274 sets `for = "/assets/webfonts/*"` → `Cache-Control: public, max-age=2592000, immutable`. But fonts live at assets/fonts/ (`ls -d assets/fonts assets/webfonts` → only assets/fonts exists) and font.min.css URLs resolve to `url(../fonts/...)` (`grep -oE "url\(\.\./[a-z]+/" assets/css/font.min.css` → `url(../fonts/`). No header block matches /assets/fonts/*, so woff2 fonts fall through to the `/*` block (netlify.toml:208-216) which sets NO Cache-Control → Netlify default (~1h) instead of 30d immutable. Repeat-visit font re-validation on every navigation.
- **Recommendation:** Change netlify.toml:272 `for = "/assets/webfonts/*"` to `for = "/assets/fonts/*"` (or add a second matching block). Fonts are content-hashed by directory naming, so immutable is safe.

#### P-PERF-04 — ~333KB of render-blocking CSS in <head> with no inlined critical CSS; full Bootstrap shipped on a custom portfolio
- **Severity:** MEDIUM · **Confidence:** PROVEN (tool-output) · **Source:** code-read · **Effort:** L · **Ref:** N-A
- **Evidence:** Render-blocking chain (index.html:34,35,39 — animate.css is correctly preload-swapped non-blocking, print.css is media=print): bootstrap.min.css 155850B + font.min.css 11637B + style.min.css 173856B = 341343B (~333KB) blocking first paint. `grep -c '<style' index.html` → 0 (no inlined critical CSS). bootstrap.min.css is the full framework (155KB) on a heavily-custom design — likely large unused ruleset. This is the dominant first-paint cost now that images/JS are well-optimized.
- **Recommendation:** Inline critical above-the-fold CSS and defer the rest via the same data-preload-swap pattern already used for animate.css; and/or PurgeCSS the unused Bootstrap rules. Biggest available LCP/FCP win for this site.

#### SEO-BILINGUAL-01 — Bilingual via single-URL JS toggle (?lang=) is sub-optimal vs distinct indexable URLs
- **Severity:** MEDIUM · **Confidence:** UNVERIFIABLE (NV_RUNTIME) · **Source:** manual-verification · **Effort:** XL · **Ref:** N-A
- **Evidence:** Site is EN/ES bilingual but served on one URL per page: index.html uses `translate-content`/`translate` attributes (e.g. `<meta name="description" translate-content="page-description">`, `<title translate="page-title">`) swapped client-side; en.json/es.json hold both locales. hreflang alternates resolve to `?lang=en`/`?lang=es` (sitemap + index head), but both query params return the SAME HTML — language is applied in JS, not server-rendered. Google indexes the server-delivered locale (EN default per `<html lang=en>` on index); the ES variant has no distinct crawlable HTML. Requires live crawl/GSC to confirm which locale gets indexed and whether ?lang= variants are seen as duplicates.
- **Recommendation:** For full bilingual SEO, serve language-specific server-rendered HTML at distinct paths (e.g. /es/ and /en/, or *.es.html) with reciprocal hreflang and self-canonicals per locale. Current JS-swap means only one locale is reliably indexable; the ?lang= hreflang targets are effectively the same document. Lower priority for a personal portfolio than the OG-image gap, but flagged since the site explicitly advertises bilingual reach via hreflang it can't fully back.

#### SEO-LD-01 — Dossier pages carry zero JSON-LD structured data; no Article/CreativeWork/BreadcrumbList anywhere
- **Severity:** MEDIUM · **Confidence:** PROVEN (proven-by-absence) · **Source:** code-read · **Effort:** M · **Ref:** N-A
- **Evidence:** grep -c 'application/ld+json': index.html=1, scanner-21179.html=0, crm-aglaya.html=0, kanban-desk.html=0, aglaya-outreach.html=0. `grep -rl 'BreadcrumbList' *.html` → exit 1 (none). index.html @graph contains only WebSite, Person, WebPage (`grep '@type'` → Person/WebPage/WebSite only); no Article/CreativeWork/SoftwareApplication on the dossiers, no BreadcrumbList linking Home → Dossier.
- **Recommendation:** Add JSON-LD to each dossier (CreativeWork or TechArticle with author referencing the Person @id from index, plus BreadcrumbList Home → Dossier). Enables rich results and ties the case studies to the Person entity for knowledge-graph / AI-search surfacing — aligned with the existing llms.txt strategy.

#### SEO-OG-01 — 3 of 4 dossier pages have NO og:image / twitter:image — broken social previews
- **Severity:** MEDIUM (adversarially adjusted from HIGH) · **Confidence:** PROVEN (proven-by-absence) · **Source:** code-read · **Effort:** M · **Ref:** N-A
- **Evidence:** grep -c 'og:image' per page: scanner-21179.html=1, crm-aglaya.html=0, kanban-desk.html=0, aglaya-outreach.html=0. Same for twitter:image (scanner=1, others=0). Only assets/images/dossiers/scanner-21179/og-image.png exists on disk; `find assets/images/dossiers` shows NO og-image.png under crm-aglaya, kanban-desk, or aglaya-outreach dirs (those dirs do not exist). These pages still emit twitter:card=summary_large_image with no image, so LinkedIn/X/Slack/WhatsApp shares render a blank/text-only card.
- **Recommendation:** Create assets/images/dossiers/{crm-aglaya,kanban-desk,aglaya-outreach}/og-image.png (1200x630) and add og:image + og:image:alt + twitter:image to each dossier template (src/pages/dossier-*.template.html). These are the primary shareable assets of the portfolio — a blank card on a 'founder who codes' dossier directly undercuts the pitch.
- **Adversarial verdict:** confirmed=True · adjusted=MEDIUM — Re-verified all cited evidence; it holds exactly. Rendered HTML grep counts: scanner-21179.html has og:image=1 and twitter:image=1; crm-aglaya.html, kanban-desk.html, and aglaya-outreach.html each have og:image=0 and twitter:image=0. All four pages emit twitter:card=summary_large_image, so the three image-less pages will render blank/text-only cards on LinkedIn/X/Slack/WhatsApp. Disk check confirms only assets/images/dossiers/scanner-21179/og-image.png exists; no crm-aglaya, kanban-desk, or aglaya-outreach subdirs exist under assets/images/dossiers. I also confirmed the defect originates in source: src/pages/dossier-{crm-aglaya,kanban-desk,aglaya-outreach}.template.html each have og:image=0/twitter:image=0 while dossier-scanner-21179.template.html has them — so it is not a build artifact. I additionally checked for a site-wide fallback: index.html sets its own default og:image (260525-featured-image.jpeg), but these per-page OG blocks override with no image and inherit no fallback, so the broken-preview conclusion is correct. The issue is REAL and proven-by-absence. Severity adjusted HIGH->MEDIUM: on a public static portfolio with no auth/DB/PII, this is a marketing/social-preview defect, not a crawlability, indexing, or functional-correctness problem — pages render and index fine; only share thumbnails degrade. It is genuinely worth fixing (these dossiers are the primary shareable assets), but HIGH overstates impact for the SEO dimension where it neither breaks pages nor harms rankings. MEDIUM accurately reflects a real, business-relevant cosmetic defect.

#### UX-FORM-01 — Contact form feedback messages are hardcoded English, not localized — Spanish visitors get English errors/success
- **Severity:** MEDIUM · **Confidence:** PROVEN (line-proof) · **Source:** code-read · **Effort:** M · **Ref:** N-A
- **Evidence:** assets/js/custom.js:1361-1369 defines `messages` object literally in English ('Your message has been sent successfully.', 'Please complete the required fields.', 'Something went wrong. Please try again later.', etc.) with NO i18n lookup; all 9 setResponse() calls (custom.js:1652,1663,1723,1731,1755,1791,1796,1807,1820) pass these literals. `grep -c 'message has been sent|complete the required|Something went wrong' es.json` => 0 (strings absent from Spanish bundle). The rest of the UI fully localizes via translate=/translate-html= attributes (e.g. index.template.html:707-708 submit button), so a visitor on lang=es gets a fully Spanish page but English form feedback — a jarring, inconsistent UX state at the highest-intent moment (conversion).
- **Recommendation:** Pull the `messages` strings from the active translation bundle (e.g. read keys from window-exposed translations or add translate keys + a data-driven lookup keyed on currentLanguage). At minimum add es.json entries and have setResponse resolve message by current language.

#### A-A11Y-01 — Two <h1> elements on index.html (single-h1 rule violated)
- **Severity:** LOW · **Confidence:** PROVEN (line-proof) · **Source:** code-read · **Effort:** S · **Ref:** WCAG 1.3.1 Info and Relationships (A)
- **Evidence:** grep -nE '<h1' index.html → line 409 '<h1 class="banner_name">Ibai <span>Fernández</span></h1>' and line 483 '<h1 class="ps_name">Ibai Fernández</h1>'. Both render the same name in different sections. `grep -oc '<h1' index.html` = 2.
- **Recommendation:** Keep the hero banner as the sole <h1>; demote the portrait-section duplicate (line 483 .ps_name) to <h2> or a non-heading element (e.g. <p class="ps_name">). Dossier pages already correctly use a single h1, so only index.html is affected.

#### A-A11Y-02 — Heading level skip h2 -> h4 in the experience/career section (no h3)
- **Severity:** LOW · **Confidence:** PROVEN (line-proof) · **Source:** code-read · **Effort:** M · **Ref:** WCAG 1.3.1 Info and Relationships (A)
- **Evidence:** index.html line 841 '<h2 class="port_heading">Two decades, four companies...</h2>' then the next heading is line 855 '<h4 translate="exp-elm-st-r1-resp-h">Highlights</h4>'. Company names between them are non-heading <span class="career_company_name"> (line 850) inside <summary>. Full index sequence: h1 h1 h2 h3 h3 h3 h3 h2 h2 h2 h4 h4 ... — the h2->h4 jump skips h3. Source template: src/pages/index.template.html + component src/components/index/experience-company-nested.html.
- **Recommendation:** Either make each company name a real <h3> (it is the logical sub-section heading, currently a <span> in <summary>), or change the per-role 'Highlights'/'Key Responsibilities' headings from <h4> to <h3> so the outline is h2 -> h3 with no skipped level.

#### A-A11Y-06 — Language change on translate toggle is not announced via a live region (lang attr updates, but no status message)
- **Severity:** LOW · **Confidence:** PROVEN (proven-by-absence) · **Source:** code-read · **Effort:** S · **Ref:** WCAG 4.1.3 Status Messages (AA)
- **Evidence:** translate.js applyLanguage() L180 sets document.documentElement.setAttribute('lang', currentLanguage) — correct per 3.1.1/3.1.2. However there is no aria-live status announcing that the page language/content changed; the only live regions are the contact #contact-response (index.html L1475 role=status) and the cookie banner (cookie-consent.html L2). A SR user toggling language gets no spoken confirmation beyond re-reading content.
- **Recommendation:** Optional nicety: add a visually-hidden aria-live="polite" region updated in applyLanguage() with a short 'Idioma: Español'/'Language: English' message. Low priority since lang attribute + content swap is the primary, correct mechanism.

#### P-PERF-02 — AVIF coverage test has a blind spot: alpha-channel PNGs are skipped, so their broken avif <source> goes unguarded
- **Severity:** LOW · **Confidence:** PROVEN (line-proof) · **Source:** code-read · **Effort:** M · **Ref:** N-A
- **Evidence:** tests/check-avif-coverage.mjs:175 skips any `*.png` with `hasAlphaChannel(sourceFile)` (skippedAlpha) BEFORE checking whether the declared avif source exists. Verified lfi-la.png color-type byte: `xxd -s 24 -l 2 assets/images/lfi-la.png` → `0806` (06 = RGBA, has alpha). That is why `node tests/check-avif-coverage.mjs` reported `[OK] ... skipped_alpha_png=2` and passed despite P-PERF-01. The checker keys off <img src> (the PNG) and never validates avif <source> elements pointing at non-converted assets.
- **Recommendation:** After the per-img loop, add a pass that scans every `<source type="image/avif">` srcset URL and asserts the file exists on disk, independent of the alpha-skip path. Closes the gap that let P-PERF-01 ship.

#### P-PERF-05 — Performance budget config omits 404.html and lfi-legacy.html — heaviest non-budgeted page references 571KB + 263KB raster fallbacks
- **Severity:** LOW · **Confidence:** PROVEN (proven-by-absence) · **Source:** code-read · **Effort:** S · **Ref:** N-A
- **Evidence:** tests/performance-budget.config.json lists 6 pages (index, privacy, scanner-21179, kanban-desk, crm-aglaya, aglaya-outreach). 8 root *.html exist; 404.html and lfi-legacy.html have no budget entry → not enforced by `npm run test:budget`. lfi-legacy.html references the heaviest fallback assets on the site: ibai-fernandez-1x1-sidebar.jpeg 571341B and lfi-la.png 263681B (both served via <picture>, but the un-budgeted page is also where the missing-avif P-PERF-01 lives). No regression guard on these two pages.
- **Recommendation:** Add 404.html and lfi-legacy.html entries to performance-budget.config.json so future raster/HTML bloat on them is caught in CI.

#### P-PERF-06 — bootstrap.min.css lacks cache-busting query while served with 7-day cache — stale CSS risk after a content change
- **Severity:** LOW · **Confidence:** PROVEN (tool-output) · **Source:** tool-external · **Effort:** S · **Ref:** N-A
- **Evidence:** index.html:34 is `<link rel="stylesheet" href="assets/css/bootstrap.min.css">` with NO `?v=` (`grep -c 'bootstrap.min.css?v=' index.html` → 0), unlike font/style/animate/print which all carry `?v=<hash>`. netlify.toml:255-257 caches /assets/css/* `public, max-age=604800` (7d) with no immutable and no filename hashing. If bootstrap.min.css is ever edited, returning visitors keep the stale copy for up to 7 days because neither the URL nor a query param changed.
- **Recommendation:** Append the same `?v=<contenthash>` query the build already applies to the other stylesheets so bootstrap.min.css participates in cache invalidation.

#### SEO-CANON-01 — lfi-legacy.html canonical points to non-existent lfi.html
- **Severity:** LOW · **Confidence:** PROVEN (line-proof) · **Source:** code-read · **Effort:** S · **Ref:** N-A
- **Evidence:** lfi-legacy.html: `<link rel="canonical" href="https://portfolio.ibaifernandez.com/lfi.html">`. `ls lfi.html` → 'No such file or directory'. The canonical target does not exist as a built artifact at repo root. Page is `robots noindex,nofollow` so crawl impact is contained, but the self-referential canonical is broken.
- **Recommendation:** Point the canonical at itself (lfi-legacy.html) or remove the canonical entirely. A canonical to a 404 is a latent inconsistency; harmless today only because the page is noindexed.

#### SEO-HREFLANG-01 — Sitemap declares hreflang alternates for dossiers, but dossier pages emit no hreflang link tags (sitemap/page mismatch)
- **Severity:** LOW · **Confidence:** PROVEN (line-proof) · **Source:** code-read · **Effort:** S · **Ref:** N-A
- **Evidence:** sitemap.xml has 15 `xhtml:link` entries (3 per URL incl. dossiers), e.g. scanner-21179.html?lang=en/es/x-default. But `grep -c hreflang` per page: index.html=3, scanner-21179.html=0, crm-aglaya.html=0, kanban-desk.html=0, aglaya-outreach.html=0. Only index.html actually carries `<link rel=alternate hreflang>` tags. Google treats sitemap-level and page-level hreflang as needing to be reciprocal/consistent; the dossier pages contradict the sitemap.
- **Recommendation:** Either add the matching `<link rel=alternate hreflang=en/es/x-default>` tags to the dossier head templates, OR (since dossiers are ES-only — html lang=es with Spanish-only content and no JS lang toggle proven on them) remove the dossier hreflang entries from sitemap.xml to avoid declaring alternates that don't exist.

#### SEO-OGTYPE-01 — OG type semantics correct: website for home, article for dossiers
- **Severity:** LOW · **Confidence:** PROVEN (line-proof) · **Source:** code-read · **Effort:** S · **Ref:** N-A
- **Evidence:** index.html `og:type=website`; all 4 dossiers + lfi-legacy `og:type=article`. og:url on each matches its canonical (e.g. crm-aglaya og:url and canonical both .../crm-aglaya.html). og:title/og:description present and unique per page. Only weakness is the missing og:image on 3 dossiers (tracked in SEO-OG-01) and absent og:locale tags (no og:locale on index or scanner — minor for bilingual signaling).
- **Recommendation:** Optionally add og:locale (en_US on index, es_ES on dossiers) and og:locale:alternate for the bilingual home to reinforce language signals to social/AI crawlers. Low priority relative to the missing images.

#### SEO-TWITTER-01 — Twitter card tags use property= instead of name= attribute
- **Severity:** LOW · **Confidence:** PROVEN (line-proof) · **Source:** code-read · **Effort:** S · **Ref:** N-A
- **Evidence:** All pages emit `<meta property="twitter:card" content="summary_large_image">` (index.html, crm-aglaya.html etc.). Twitter/X spec and most parsers expect `name="twitter:card"`; `property=` is the OG namespace. Many crawlers fall back to OG so cards often still render, but this is non-spec and can cause inconsistent card rendering across consumers.
- **Recommendation:** Change twitter:* meta tags from `property=` to `name=` in the shared head templates. Cheap correctness fix; pairs with SEO-OG-01 since the dossier twitter cards are also missing images.

#### UX-DENSITY-01 — index.template.html exceeds the 700-LOC cognitive-density threshold (748 LOC) — only shipped template over the bar
- **Severity:** LOW · **Confidence:** PROVEN (line-proof) · **Source:** tool-external · **Effort:** M · **Ref:** N-A
- **Evidence:** `wc -l src/pages/*.html src/components/**/*.html` => index.template.html 748, lfi.template.html 1013, project-ruta-digitalizacion-2x2mkt.template.html 712. Cross-checked scripts/build/config.mjs:15-21 BUILD_TARGETS: only index.template.html among the >700 set is actually built/shipped; lfi.template.html and project-ruta-* are NOT in the build list and lfi.html is absent from repo root (`ls lfi.html` => not present). So index.template.html (748) is the single live offender; the other two are dead/legacy source not rendered.
- **Recommendation:** Extract more of index.template.html into components (the experience/portfolio/contact blocks are largely inline). The component system already exists (src/components/index/*) — moving the contact form and portfolio grid into includes would drop the main template well under 700 and ease maintenance. Separately, consider deleting/archiving the unbuilt lfi.template.html (1013) and project-ruta-* (712) to remove dead cognitive load.

#### A-A11Y-07 — Color contrast: text/UI palette meets AA (verified, no failures in real usage)
- **Severity:** INFO · **Confidence:** PROVEN (tool-output) · **Source:** tool-external · **Effort:** S · **Ref:** WCAG 1.4.3 Contrast (Minimum) (AA)
- **Evidence:** Computed via python relative-luminance (WCAG formula). On white: --color-text-primary #222 = 15.91, --color-text-muted #6a6a6a = 5.41, --color-heading-primary #556d91 = 5.27, accent -text variants #8a5d00=5.76 #ad2254=6.70 #a84a14=5.75 #007d8a=4.88 — all >=4.5. Raw --color-accent-yellow #ffc455 = 1.58 on white BUT verified it is only used as text on DARK bg (style.css L9464/L9502 .dossier_frontier bg #0e0f21 → ratio 11.97) or as background-color (L112) / hover on dark; never as text on light. Dossier accents on #090b12: #8fe3ff=13.67, #ff9b63=9.47, #ff90c4=9.40, #97a9ff=8.83; --norden-accent #ff6800 on #1a0a04 = 6.64. --hero-color-faint rgba(10,15,33,.32)=2.10 but `grep 'color:.*hero-color-faint'` = 0 uses as text (defined-but-unused).
- **Recommendation:** No action required. The team correctly maintains darkened *-text accent variants for light backgrounds and pale accents for dark dossier backgrounds. Keep enforcing the convention 'never use raw --color-accent-* as text on white'.

#### A-A11Y-08 — Reduced motion, viewport zoom, alt text, form labels, skip links, and bilingual chip aria all PASS
- **Severity:** INFO · **Confidence:** PROVEN (line-proof) · **Source:** manual-verification · **Effort:** S · **Ref:** WCAG 2.3.3, 1.4.4, 1.4.10, 1.1.1, 3.3.2, 1.3.1, 2.4.1, 4.1.2, 2.5.8
- **Evidence:** prefers-reduced-motion honored: style.css L820,5978,6009,6206,9093 + bootstrap/animate. Viewport: all pages 'width=device-width, initial-scale=1.0' (no maximum-scale/user-scalable=no → 1.4.4 zoom OK). Images: index.html 30/30 <img> have alt (grep 'img without alt' empty). Contact form: every visible input/textarea has matching <label for> (name/last-name/email/subject/comment all paired; honeypot aria-hidden; #contact-response role=status aria-live=polite). Skip links present + valid targets on all 8 pages (#about_sec exists in index, #dossier_main in dossiers, 404/privacy/lfi each =1). Bilingual mockup chips role=img with aria-label + translate-aria-label keys mockup-{scanner,crm,kanban,outreach}-aria all present in BOTH en.json & es.json (grep count=1 each); translate.js L119-133 correctly maps translate-aria-label -> aria-label. Social links all aria-labelled (index L370/376/382/499-503). Touch: .social-button 40x40px (style.css L2174-2176) >= 24x24.
- **Recommendation:** No action — these areas are well implemented. Note as POSITIVE baseline. Only residual: re-run this check after any rebuild since templates (not the blank src/components/index/sidebar.html) are the source of truth.

#### P-PERF-07 — Strong baseline confirmed: AVIF/WebP coverage passes, all JS deferred, GA4 fully lazy, fonts self-hosted, LCP image preloaded
- **Severity:** INFO · **Confidence:** PROVEN (tool-output) · **Source:** tool-external · **Effort:** S · **Ref:** N-A
- **Evidence:** `node tests/check-avif-coverage.mjs` → [OK] checked=12; `node tests/check-webp-coverage.mjs` → [OK] checked=14; `node tests/check-performance-budget.mjs` → [OK] all 6 pages within budget (index 119.7KB HTML / 408KB IMG). AVIF compression dramatic: pipeline-vertical.png 1471772B → .avif 47775B (97% smaller); gymtracker.png 716639B → .webp 61812B. All <script src> in index carry defer (cookie-consent, jquery, custom, translate). GA4 loaded via document.createElement with script.async=true on idle/visibilitychange (index.html:1745-1757) — never render-blocking. No Google Fonts / gstatic preconnect (grep across pages → none); font.min.css url() all resolve to self-hosted ../fonts/*.woff2. LCP image preloaded: index.html:30 `<link rel=preload as=image type=image/avif ... fetchpriority=high>`.
- **Recommendation:** No action — record as the established performance baseline. Keep the media:all + budget tests in CI to prevent regressions.

#### P-PERF-08 — Core Web Vitals (LCP/INP/CLS) require runtime measurement against the live deploy
- **Severity:** INFO · **Confidence:** UNVERIFIABLE (NV_RUNTIME) · **Source:** tool-external · **Effort:** S · **Ref:** N-A
- **Evidence:** No Lighthouse/field data available from a static read. Static signals are favorable (LCP image preloaded with fetchpriority=high at index.html:30, deferred JS, lazy GA4), but the ~333KB render-blocking CSS in P-PERF-04 is the most likely LCP/FCP drag and can only be quantified at runtime.
- **Recommendation:** Run PageSpeed Insights / Lighthouse against the production URL (portfolio.ibaifernandez.com) for index.html and scanner-21179.html; verify LCP after the P-PERF-04 critical-CSS change.

#### SEO-404-01 — 404.html is properly noindexed with descriptive title/description
- **Severity:** INFO · **Confidence:** PROVEN (line-proof) · **Source:** code-read · **Effort:** S · **Ref:** N-A
- **Evidence:** 404.html: `<html lang=en>`, `<meta name="robots" content="noindex,nofollow">`, title 'Page not found | Ibai Fernández', description 'Page not found — portfolio.ibaifernandez.com'. No canonical/OG (`grep canonical|og: 404.html` → exit 1), which is correct for an error page. Proper soft-404 hygiene.
- **Recommendation:** No change needed (assuming the host returns a real HTTP 404 status for this page — verify server config returns 404, not 200, which is unverifiable without live access).

#### SEO-CORE-01 — Core head tags (title/description/canonical/lang/theme-color) present and unique on every public page
- **Severity:** INFO · **Confidence:** PROVEN (line-proof) · **Source:** code-read · **Effort:** S · **Ref:** N-A
- **Evidence:** Per-page head extract: index.html `<html lang=en>`, title 58 chars, meta description present, robots index,follow,max-image-preview:large, canonical /; each dossier `<html lang=es>` with unique title (40-48 chars, all under 60), unique meta description, unique canonical (grep across pages shows 6 distinct canonical URLs, no duplicates), theme-color #121217 (dossiers) / #f0ede7 (index/privacy). privacy.html noindex,follow; 404.html noindex,nofollow. All well-formed.
- **Recommendation:** No action. Core on-page SEO hygiene is solid; gaps are isolated to social images (SEO-OG-01), structured data on dossiers (SEO-LD-01), and hreflang consistency (SEO-HREFLANG-01).

#### SEO-LLMS-01 — llms.txt and llms-full.txt present and coherent with sitemap/pages
- **Severity:** INFO · **Confidence:** PROVEN (tool-output) · **Source:** tool-external · **Effort:** S · **Ref:** N-A
- **Evidence:** cat llms.txt + llms-full.txt: both list the same 5 canonical URLs as sitemap (home + 4 dossiers), correct contact (info@ibaifernandez.com, LinkedIn/GitHub), Last-Updated 2026-06-05 matching build, and point to robots/sitemap. Coherent and current. Minor: llms-full.txt 'Currently Shipping' lists 6 products (Scanner, Kanban Desk, Outreach, Pulse, Web, OSS tooling) but only 4 have dossier URLs — Pulse/Web have no canonical page, consistent with them not being in sitemap.
- **Recommendation:** No action required. Optionally note in llms-full.txt that Pulse/Web are described-only (no dedicated page) to avoid an LLM expecting URLs that 404.

#### SEO-ROBOTS-01 — robots.txt present, valid, with sitemap directive and sensitive-path disallows
- **Severity:** INFO · **Confidence:** PROVEN (tool-output) · **Source:** tool-external · **Effort:** S · **Ref:** N-A
- **Evidence:** cat robots.txt: `User-agent: *` / `Disallow: /ajax.php` / `Disallow: /lfi-legacy.html` / `Allow: /` / `Sitemap: https://portfolio.ibaifernandez.com/sitemap.xml`. Correctly blocks the archived lfi-legacy page (which is also noindex) and references the sitemap. Positive/INFO finding — no action needed.
- **Recommendation:** No change required. robots.txt is well-formed and consistent with the noindex on lfi-legacy.html.

#### SEO-SITEMAP-01 — sitemap.xml lists all public pages and matches content/projects.json outputs
- **Severity:** INFO · **Confidence:** PROVEN (tool-output) · **Source:** tool-external · **Effort:** S · **Ref:** N-A
- **Evidence:** sitemap <loc> entries: /, scanner-21179.html, crm-aglaya.html, kanban-desk.html, aglaya-outreach.html. content/projects.json `output` values: scanner-21179.html, crm-aglaya.html, kanban-desk.html, aglaya-outreach.html — 1:1 match, all 4 dossiers + home present. privacy.html correctly EXCLUDED (`grep -c privacy sitemap.xml` = 0, and privacy.html is `robots noindex,follow`). lastmod 2026-06-05 matches build date. Positive finding apart from the dossier hreflang issue tracked separately (SEO-HREFLANG-01).
- **Recommendation:** No change to URL coverage needed; address only the dossier hreflang entries per SEO-HREFLANG-01.

#### UX-COOKIE-01 — Cookie consent UX is clear and non-dark-patterned: equal-weight Reject/Accept, denied-by-default, persisted, re-openable
- **Severity:** INFO · **Confidence:** PROVEN (line-proof) · **Source:** code-read · **Effort:** S · **Ref:** GDPR Art.7 / Chile Ley 21.719
- **Evidence:** src/components/shared/cookie-consent.html:9-10 renders Reject (ghost) and Accept (primary) as sibling buttons of equal prominence, both keyboard-focusable, with a Privacy policy link (line 12); banner is role=dialog aria-live=polite aria-labelledby. cookie-consent.js:2-3 documents default = analytics denied until opt-in; applyConsent() denies all storage by default (lines 38-45); decision persisted to localStorage 'portfolio_consent' (line 23) and re-openable via window.openCookiePreferences / #cookie-preferences-link (lines 86-95). No pre-checked boxes, no hidden reject. Positive finding.
- **Recommendation:** No action required. Reject button styling is intentionally lighter (ghost) than Accept but both are present and clickable — acceptable; if strict parity is desired, give Reject equal visual weight.

#### UX-DISABLED-01 — @include-DISABLED services & testimonial sections are cleanly hidden (not half-broken) and no nav links point at them
- **Severity:** INFO · **Confidence:** PROVEN (proven-by-absence) · **Source:** code-read · **Effort:** S · **Ref:** N-A
- **Evidence:** index.template.html:437-438 (services) and 466-467 (testimonial) use `@include-DISABLED` with detailed re-enable comments. Build pattern scripts/build/template-utils.mjs:1 is `/<!--\s*@include\s+([^\s]+)\s*-->/g` — requires a space after @include, so `@include-DISABLED` does NOT match and is left as an inert comment (proven by absence of expansion). In built index.html the only services/testimonial/swiper hits (`grep -c` => 5) are 4 HTML comments + 1 unrelated live 'swiper-container logos-swiper' (the client-logos carousel, a separate live feature). Sidebar nav (src/components/index/sidebar.html:21-237) links only to #about_sec/#training_sec/#project_sec/#contact_form — all four IDs resolve in index.html (`grep -c id=...` => 1 each). No dead links: `grep -rn 'href="#"|href=""|javascript:void'` across all 8 built pages => 0 matches. 404.html includes skip-link, home link, and full nav (404.html:20,25). Positive finding.
- **Recommendation:** No action required. Sections are intentionally hidden with reversible, well-documented includes and no orphaned navigation.

#### UX-FORM-02 — Contact form has a complete, accessible per-submit state machine (loading / error / success) — no anti-patterns
- **Severity:** INFO · **Confidence:** PROVEN (line-proof) · **Source:** code-read · **Effort:** S · **Ref:** WCAG 4.1.3 Status Messages
- **Evidence:** custom.js:1737 sets `_this.prop('disabled', true).attr('aria-busy','true')` on submit (loading), cleared in .always() at 1817; distinct error paths via .fail()/network_error (1807) and server-rejected (1796) vs success (1791); all routed through setResponse() (1375-1380) which toggles role between 'alert' (errors) and 'status' on the live region #contact-response (index.template.html:713 has role=status aria-live=polite aria-atomic=true). This is a positive finding: NOT a single global spinner, states are differentiated and announced to AT.
- **Recommendation:** No action required. Optionally surface a visible 'Sending…' label during the disabled/aria-busy window for sighted users (currently only the button is disabled with no text change).

#### UX-FORM-03 — No native alert()/confirm()/prompt() anywhere in the codebase
- **Severity:** INFO · **Confidence:** PROVEN (line-proof) · **Source:** tool-external · **Effort:** S · **Ref:** N-A
- **Evidence:** `grep -rn 'alert(|confirm(|prompt(' src/ index.html crm-aglaya.html kanban-desk.html aglaya-outreach.html scanner-21179.html privacy.html 404.html lfi-legacy.html` => 0 matches (empty output). All user feedback flows through the inline accessible response region. Inline validation is also accessible: checkRequire() at custom.js:1640-1678 sets aria-invalid=true + .error class per field, focuses the first invalid field, and is cleared on 'input change' (custom.js:1707-1709).
- **Recommendation:** No action required.

#### UX-I18N-01 — Translate toggle is discoverable, keyboard-accessible, and persists language across visits
- **Severity:** INFO · **Confidence:** PROVEN (line-proof) · **Source:** code-read · **Effort:** S · **Ref:** WCAG 3.1.2 / 2.1.1
- **Evidence:** translate.js:203-216 promotes the flag <img> to role=button + tabindex=0 with click AND keydown (Enter/Space) handlers; toggleLanguageButton() (137-148) updates alt + aria-label to 'Switch to Spanish'/'Switch to English'. resolveInitialLanguage (translate.js:51-68) resolves order: ?lang= URL param -> localStorage('portfolio_language') -> navigator.language fallback; applyLanguage persists to localStorage (176) and sets document.documentElement.lang (180). The button is a fixed-position element (src/components/shared/translate-button.html) present on every page. Positive finding.
- **Recommendation:** No action required. Minor: the initial static alt text is generic 'Translate Button' (translate-button.html:3) before JS runs; the build/markup could ship the resolved 'Switch to…' label to avoid a flash of generic alt. On loadTranslations error, only console.error fires (translate.js:170) — page keeps default text, so benign.
