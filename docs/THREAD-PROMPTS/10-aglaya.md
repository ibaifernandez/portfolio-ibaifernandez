# Prompt 10 — AGLAYA Dossier Thread

Use this prompt as the starting message for the dedicated AGLAYA dossier thread.

---

## Copy/Paste Prompt

```md
You are the dedicated AGLAYA dossier thread for the portfolio project at `/Users/AGLAYA/Local Sites/portfolio-ibaifernandez`.

Your job is to turn AGLAYA into a serious dossier about conversion architecture, remote agency operating logic, qualification-first positioning, and why Ibai Fernandez can package a service business like a coherent commercial system instead of a generic list of deliverables.

This is not a generic agency page.
This is not a vague "innovation ecosystem" story.
This is not the education branch dressed up as the main business case.

It is a project page about why AGLAYA proves business design: positioning, offer architecture, conversion-first UX, and a remote operating model built to attract the right clients and repel the wrong ones.

## Project context

- Live portfolio site: https://portfolio.ibaifernandez.com
- Canonical public URL: `/aglaya.html`
- Source template: `src/pages/project-aglaya.template.html`
- Target dossier-local stylesheet: `assets/css/dossiers/aglaya.css`
- Mandatory shared repo baseline: `docs/PARALLEL-SAFETY-BASELINE.md`
- Current styling reality: most AGLAYA dossier selectors still live inside `assets/css/style.css` under `.aglaya_dossier_*`
- Public slug is normalized as `aglaya`
- The public home card still carries the older title framing `AGLAYA: B2B Innovation Ecosystem`, while the dossier itself now frames the case as a conversion-first remote agency system
- The live agency exists at `https://aglaya.biz/` and the public identity-test route exists at `https://aglaya.biz/test-de-identidad-visual/`
- A local WordPress workspace snapshot exists at `/Users/AGLAYA/Local Sites/wordpress/aglaya.biz/html` and should be treated as read-only evidence for this thread

## Your ownership boundaries

You may touch only:

- `src/pages/project-aglaya.template.html`
- `assets/css/dossiers/aglaya.css`
- AGLAYA-specific assets in the portfolio repo
- AGLAYA-specific metadata handoff notes if required

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

You must also not edit the live-agency source workspace from this thread:

- `/Users/AGLAYA/Local Sites/wordpress/aglaya.biz/html/**`

Read it as evidence.
Do not treat it as part of this thread's writable scope.

If a shared-file change is needed, call it out explicitly and hand it back to the coordination or technical-consolidation thread.

## What this dossier must prove

By the time the reader finishes this page, they should understand:

1. AGLAYA is not being showcased as a broad creative umbrella; it is being showcased as a commercial operating system
2. The strongest move is qualification-first positioning, not decorative brand language
3. The free evaluation is an acquisition filter, not a generic contact CTA
4. The service architecture is organized around business maturity, not around disconnected agency services
5. The remote model is part of delivery logic, not a lifestyle claim
6. This project proves Ibai can engineer the business layer of a brand, not just its visuals

The reader should leave with the feeling:

"This person knows how to turn positioning, UX, and service packaging into a sales machine."

## Critical positioning

AGLAYA should be framed as:

- a conversion-first remote agency system
- a qualification-led commercial architecture
- a case about service packaging and growth-stage design
- a business-design dossier, not just a brand showcase

It should not be framed as:

- a generic marketing agency
- an all-purpose innovation ecosystem
- a duplicate of the Route to Digitalization / 2x2MKT dossier
- a sentimental founder story without commercial structure

The point is not "I launched an agency."
The point is "I designed an agency surface that filters, diagnoses, packages, and converts."

## Editorial and visual direction

The dossier should feel like:

- a premium agency-systems case study
- a calm but opinionated conversion surface
- a strategic commercial architecture dossier
- a business interface with tension and intent

It should not feel like:

- a startup landing page clone
- a generic B2B SaaS layout
- a recycled AGLAYA homepage in portfolio form
- a warm beige site with interchangeable cards and no argument

Distinct dossier, distinct compositional logic.

## Current dossier assets already in play

The current page already includes:

- a positioning-led hero
- operating signals
- a commercial-positioning section
- a method stack
- a growth-architecture section
- a proof surface
- a capability close

Use these intentionally.

They may evolve, move, be reframed, or be removed if they weaken the page, but they must never remain on the page as filler, weak placeholders, or unresolved strategic shorthand.

## Known drift to resolve before tightening the page

The current materials already contain real drift risk:

- `content/projects.json` still titles the project as `AGLAYA: B2B Innovation Ecosystem`, while the dossier itself argues for a tighter remote-agency / conversion-architecture framing
- the dossier still exposes public placeholder-style proof blocks using `Suggested proof asset`
- the page hardcodes structural claims such as `100% Remote`, `3` growth stages, and `4` core methods, which should stay evidence-backed if retained
- the live AGLAYA universe contains an education branch, but this dossier explicitly excludes that branch from the center of the story
- the page links to `The Route to Digitalization / 2x2MKT` to keep narrative ownership clean, so any reframing here must preserve that boundary instead of blurring it

Do not silently preserve metadata drift, public placeholder proof language, or ownership overlap just because they are already present.

The thread must decide, explicitly and deliberately, which claims should:

- be verified and kept
- be reframed as contextual or historical
- be generalized into future-proof language
- or be removed if they cannot remain trustworthy

If card title, card description, or other shared metadata must change, do not edit `content/projects.json` from this thread. Produce the handoff explicitly.

## Key design and narrative constraints

1. Do not let the education branch take over the case.
2. Do not let the page collapse into a generic agency-services grid.
3. Do not normalize public placeholder proof blocks as acceptable final copy.
4. Do not over-index on "remote" as if that were the main differentiator by itself.
5. Do not let the case drift back into vague "innovation ecosystem" language if the dossier cannot support it precisely.
6. Do not let AGLAYA duplicate the Route / 2x2MKT story.
7. Do not normalize AGLAYA-specific CSS living forever in `assets/css/style.css`.

## What this project should demonstrate narratively

The page should make clear:

- why qualification-first messaging matters commercially
- why the visual-identity test is a strategic acquisition mechanism
- why packaging services by business stage creates clearer buying logic
- why strategy, UX, validation, automation, and analytics are being presented as one operating system
- why this project proves Ibai can structure commercial narratives, not only interfaces
- why AGLAYA is portfolio-worthy as business architecture, not merely as founder branding

## CSS isolation requirement

AGLAYA styling is currently a known exception to the dossier-local CSS convention.

The thread should treat this as active migration work:

- inventory the `.aglaya_dossier_*` selectors currently living in `assets/css/style.css`
- move dossier-specific visual logic toward `assets/css/dossiers/aglaya.css`
- keep shared/global styles shared only when they are truly cross-site

Do not normalize this exception as acceptable long-term architecture.

## Source material to audit first

Use these portfolio-repo sources before doing anything else:

- `src/pages/project-aglaya.template.html`
- `content/projects.json`
- `docs/THREAD-ORCHESTRATION.md`
- `docs/ENGINEERING-CHANGELOG.md`
- `docs/ENGINEERING-RUNBOOK.md`
- `assets/css/style.css`

Use these AGLAYA sources as read-only evidence:

- `https://aglaya.biz/`
- `https://aglaya.biz/test-de-identidad-visual/`
- `/Users/AGLAYA/Local Sites/wordpress/aglaya.biz/html`

## Technical / authoring rules

- Never edit generated HTML directly
- Edit the source template and rebuild
- Keep changes dossier-local whenever possible
- If behavior or structure changes, add a concise note to `docs/ENGINEERING-CHANGELOG.md`
- If the work is documentation-only, say so explicitly and do not claim product validation you did not run

## Your first mission

1. Audit the current AGLAYA dossier against the live agency reality
2. Decide which parts of the public story belong to the commercial remote-agency case and which belong elsewhere
3. Remove or reframe any remaining public placeholder proof language
4. Surface the metadata/title drift with `content/projects.json` if it still conflicts with the refined dossier direction
5. Define the migration path from shared `.aglaya_dossier_*` CSS to `assets/css/dossiers/aglaya.css`

## Always report back with

- what you changed
- what risk you mitigated or objective you advanced
- what you validated
- what remains pending
```
