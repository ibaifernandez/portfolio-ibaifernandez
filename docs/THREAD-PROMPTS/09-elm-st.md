# Prompt 09 — Elm St Dossier Thread

Use this prompt as the starting message for the dedicated Elm St dossier thread.

---

## Copy/Paste Prompt

```md
You are the dedicated Elm St dossier thread for the portfolio project at `/Users/AGLAYA/Local Sites/portfolio-ibaifernandez`.

Your job is to turn Elm St into a serious dossier about cinematic brand design, reel-first UX, custom web architecture for a creative studio, and why Ibai Fernandez can translate audiovisual identity into a digital surface that actually sells.

This is not a generic production-company brochure.
This is not a technical migration report for Netlify.
This is not a fake film-school mood board with nice copy and empty proof.

It is a project page about why Elm St proves brand judgment, custom interface direction, and the ability to shape a creative studio's public presence around motion, atmosphere, and conversion intent.

## Project context

- Live portfolio site: https://portfolio.ibaifernandez.com
- Canonical public URL: `/elm-st.html`
- Source template: `src/pages/project-elm-st.template.html`
- Target dossier-local stylesheet: `assets/css/dossiers/elm-st.css`
- Mandatory shared repo baseline: `docs/PARALLEL-SAFETY-BASELINE.md`
- Current styling reality: most Elm St dossier selectors still live inside `assets/css/style.css` under `.elmst_dossier_*`
- Public slug is normalized as `elm-st`, while the source template and selectors still use legacy `elmst` naming
- The source site repo exists at `/Users/AGLAYA/Local Sites/elm-st-web` and should be treated as read-only evidence for this thread
- The source repo also contains a later technical hardening layer and public technical dossier, but this portfolio page should still be centered on the creative-brand case

## Your ownership boundaries

You may touch only:

- `src/pages/project-elm-st.template.html`
- `assets/css/dossiers/elm-st.css`
- Elm St-specific assets in the portfolio repo
- Elm St-specific metadata handoff notes if required

You must not silently edit shared files such as:

- `content/projects.json`
- `README.md`
- `AGENTS.md`
- `docs/ROADMAP.md`
- `docs/BACKLOG.md`
- `docs/ENGINEERING-RUNBOOK.md`
- `docs/ENGINEERING-CHANGELOG.md` except for a concise change note when behavior or structure changes
- `sitemap.xml`
- `llms-full.txt`
- `assets/css/style.css`
- shared build/test/config files

You must also not edit the source site repo from this thread:

- `/Users/AGLAYA/Local Sites/elm-st-web/**`

Read it as evidence.
Do not treat it as part of this thread's writable scope.

If a shared-file change is needed, call it out explicitly and hand it back to the coordination or technical-consolidation thread.

## What this dossier must prove

By the time the reader finishes this page, they should understand:

1. Elm St was built as a custom digital stage, not as a templated studio site
2. The core value was translating audiovisual taste into navigable web behavior
3. Ibai was not just coding pages; he was shaping the brand surface, portfolio logic, and contact flow
4. The site architecture made the studio feel credible, curated, and commercially reachable
5. The proof comes from real work, real team structure, and real category breadth
6. This project proves Ibai can build creative-brand systems without falling into generic agency aesthetics

The reader should leave with the feeling:

"This person can make a brand feel alive on the web without making it chaotic."

## Critical positioning

Elm St should be framed as:

- a cinematic brand system
- a reel-first studio website
- a custom-coded creative sales surface
- a case about audiovisual UX and brand atmosphere with commercial purpose

It should not be framed as:

- a generic film-production landing page
- a purely technical migration case
- a nostalgic code relic shown for sentimental reasons
- a bridge page whose real purpose is to advertise `2x2MKT`

The point is not "I made a website for a studio."
The point is "I designed a digital stage that let a creative studio sell itself through mood, portfolio logic, and proof."

## Editorial and visual direction

The dossier should feel like:

- a restrained cinematic case study
- a dark, tactile, reel-aware editorial surface
- a creative-brand dossier with control and taste
- a premium portfolio piece, not a production-house template

It should not feel like:

- a movie-poster gimmick
- a tech-case dashboard
- a recycled LFi, Research Engine, or AGLAYA composition
- a generic SaaS page with black paint on top

Distinct dossier, distinct compositional logic.

## Current dossier assets already in play

The current page already includes:

- a cinematic hero
- metric signals
- a project-goals section
- an implementation section
- a reel/showcase section
- a team surface
- a portfolio-value close

Use these intentionally.

They may evolve, move, be reframed, or be removed if they weaken the page, but they must never remain on the page as filler, fake proof scaffolding, or unresolved editorial placeholders.

## Known drift to resolve before tightening the page

The current materials already contain real drift risk:

- the dossier still exposes fake embed shells labeled `Featured YouTube Embed`
- the page still uses public-facing `Reference video ID` labels instead of resolved proof presentation
- one current embed note tries to connect Elm St to the broader universe that "later evolved into 2x2MKT", which risks narrative overreach and ownership overlap with another dossier
- the source repo contains a real technical dossier and a later Netlify hardening layer, but that does not automatically make this portfolio page a technical migration case
- the public page currently hardcodes signals such as `18` featured pieces, `6` creative verticals, and `3` core leads, which should stay evidence-backed if retained

Do not silently preserve public placeholder embed language, unsupported cross-project framing, or unverified metric shorthand just because it is already on the page.

The thread must decide, explicitly and deliberately, which claims should:

- be verified and kept
- be reframed as contextual snapshots
- be generalized into future-proof language
- or be removed if they cannot remain trustworthy

## Key design and narrative constraints

1. Do not let the dossier become a fake YouTube gallery with dressed-up placeholders.
2. Do not let the technical hardening story from `elm-st-web` take over the main case narrative.
3. Do not let `2x2` become a back door into the Route / 2x2MKT dossier.
4. Do not drift into generic film-industry moodboarding without commercial clarity.
5. Do not oversell legacy tech nostalgia as if that were the real value.
6. Do not normalize visible placeholder proof blocks on the public page.
7. Do not normalize Elm St-specific CSS living forever in `assets/css/style.css`.

## What this project should demonstrate narratively

The page should make clear:

- why audiovisual brands need different navigation logic than ordinary service businesses
- why reel-first discovery and category curation mattered for this studio
- why team visibility was part of trust-building, not decorative biography
- why custom web architecture beat theme-marketplace convenience here
- why this project proves Ibai can align brand positioning, interface design, and implementation in one loop
- why the later technical stabilization of `elm-st-web` is supporting evidence, not the main story

## CSS isolation requirement

Elm St styling is currently a known exception to the dossier-local CSS convention.

The thread should treat this as active migration work:

- inventory the `.elmst_dossier_*` selectors currently living in `assets/css/style.css`
- move dossier-specific visual logic toward `assets/css/dossiers/elm-st.css`
- keep shared/global styles shared only when they are truly cross-site

Do not normalize this exception as acceptable long-term architecture.

## Source material to audit first

Use these portfolio-repo sources before doing anything else:

- `src/pages/project-elm-st.template.html`
- `content/projects.json`
- `docs/THREAD-ORCHESTRATION.md`
- `docs/ENGINEERING-CHANGELOG.md`
- `docs/ENGINEERING-RUNBOOK.md`
- `assets/css/style.css`

Use these Elm St repo sources as read-only evidence:

- `/Users/AGLAYA/Local Sites/elm-st-web/README.md`
- `/Users/AGLAYA/Local Sites/elm-st-web/AGENTS.md`
- `/Users/AGLAYA/Local Sites/elm-st-web/portafolio.html`
- `/Users/AGLAYA/Local Sites/elm-st-web/nosotros.html`
- `/Users/AGLAYA/Local Sites/elm-st-web/index.html` if needed for the brand promise
- `/Users/AGLAYA/Local Sites/elm-st-web/dossier-tecnico.html`
- `/Users/AGLAYA/Local Sites/elm-st-web/docs/ARCHITECTURE.md`

## Technical / authoring rules

- Never edit generated HTML directly
- Edit the source template and rebuild
- Keep changes dossier-local whenever possible
- If behavior or structure changes, add a concise note to `docs/ENGINEERING-CHANGELOG.md`
- If the work is documentation-only, say so explicitly and do not claim product validation you did not run

## Your first mission

1. Audit the current Elm St dossier against the actual source-site truth
2. Remove or reframe any public placeholder embed language
3. Decide what belongs to the cinematic brand case versus what should remain only supporting technical evidence
4. Reconcile any overreach around `2x2` so Elm St does not duplicate another dossier's story
5. Define the migration path from shared `.elmst_dossier_*` CSS to `assets/css/dossiers/elm-st.css`

## Always report back with

- what you changed
- what risk you mitigated or objective you advanced
- what you validated
- what remains pending
```
