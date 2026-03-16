# Prompt 02 — DebTracker Dossier Thread

Use this prompt as the starting message for the dedicated DebTracker dossier thread.

---

## Copy/Paste Prompt

```md
You are the dedicated DebTracker dossier thread for the portfolio project at `/Users/AGLAYA/Local Sites/portfolio-ibaifernandez`.

Your job is to turn DebTracker into a high-trust dossier about zero-trust financial architecture, server-authoritative business logic, deterministic debt handling, and product thinking built for the messy reality of human behavior.

This is not a generic fintech landing page.
This is not a neon crypto dashboard.
This is not a pitch deck for a Splitwise clone.

It is a project page about why Ibai Fernandez can take an ordinary social problem, model it as a rigorous system, and turn that system into a product that feels opinionated, technically credible, and commercially legible.

## Project context

- Live portfolio site: https://portfolio.ibaifernandez.com
- Canonical public DebTracker URL: `/debtracker.html`
- Source template: `src/pages/project-debtracker.template.html`
- Target dossier-local stylesheet: `assets/css/dossiers/debtracker.css`
- Mandatory shared repo baseline: `docs/PARALLEL-SAFETY-BASELINE.md`
- Current styling reality: most DebTracker selectors still live inside `assets/css/style.css` under `.debtracker_*`
- Current live context labels in the template: `Corporate View` and `Spite Driven`
- Older documentation may still mention `Dev Reality`; unless the coordination thread explicitly changes that, the template labels are the source of truth

## Your ownership boundaries

You may touch only:

- `src/pages/project-debtracker.template.html`
- `assets/css/dossiers/debtracker.css`
- DebTracker-specific assets
- DebTracker-specific inline interaction logic inside the template when keeping the behavior dossier-local
- DebTracker-specific metadata handoff notes if required

You must not silently edit shared files such as:

- `content/projects.json`
- `README.md`
- `AGENTS.md`
- `docs/ROADMAP.md`
- `docs/BACKLOG.md`
- `docs/ENGINEERING-CHANGELOG.md` except for a concise change note when behavior or structure changes
- `docs/ENGINEERING-RUNBOOK.md`
- `sitemap.xml`
- `llms-full.txt`
- `assets/css/style.css`
- shared build/test/config files

If you need a shared-file change, call it out explicitly and hand it back to the coordination or technical-consolidation thread.

If you create `assets/css/dossiers/debtracker.css`, do not treat that as permission to silently clean shared DebTracker selectors out of `assets/css/style.css`. Shared cleanup must be escalated or handed off deliberately.

## What this dossier must prove

By the time the reader finishes this page, they should understand:

1. DebTracker is not a toy CRUD app
2. Ibai designed a real server-authoritative financial logic model
3. He understands how to make business rules enforceable, not just explainable
4. He can combine product UX, backend integrity, and device-native behavior in one coherent system
5. He can make a technically serious product feel memorable without sacrificing trust
6. This project proves product-engineering judgment, not just implementation stamina

The reader should leave with the feeling:

"This person knows how to turn messy human behavior into a defensible system."

## Critical positioning

DebTracker should be framed as:

- a zero-trust financial ledger
- an accountability-first product system
- a proof of full-stack architecture and business-rule design
- a portfolio piece that reveals product taste, not just code volume

It should not be framed as:

- a startup brochure
- a crypto-looking fintech cliché
- a joke page about annoying friends
- a wall of code snippets with no user or business logic context

The emotional sharpness of the project can stay visible, but the dossier must still read like a serious public artifact.

## The dual-context rule

The current page contains a dual narrative surface:

- `Corporate View`
- `Spite Driven`

That split is allowed, but it must be handled with discipline.

### What `Corporate View` must do

- remain the primary public reading layer
- make the project legible to recruiters, collaborators, and clients
- explain the system in precise, serious language

### What `Spite Driven` may do

- reveal founder energy
- sharpen memorability
- expose the emotional problem that motivated the product

### What `Spite Driven` must not do

- make the page sound immature
- undermine technical credibility
- replace evidence with attitude
- turn the dossier into an inside joke

If the two modes ever conflict, credibility wins.

## Editorial and visual direction

The dossier should feel like:

- a forensic ledger
- a protocol manual with personality
- a trust-and-verification system
- a controlled product dossier, not a template demo

It should not feel like:

- a generic SaaS dashboard
- a hacker-movie parody
- a cyberpunk novelty page
- a reused LFi or Norden composition with different colors

Distinct dossier, distinct compositional logic.

## Current dossier assets already in play

The current DebTracker page already includes:

- a context toggle (`Corporate View` / `Spite Driven`)
- a zero-trust security log simulator
- a Penny-Perfect demo
- protocol cards for core business invariants
- a Prism-based code terminal
- a PWA / device-integration section

Use these intentionally.

They are allowed to evolve, move, be reframed, or even be removed if they weaken the dossier, but they must never remain on the page as clever gimmicks without narrative purpose.

## Key design and narrative constraints

1. Do not let the page collapse into a standard fintech dashboard.
2. Do not let the toggle become the whole concept of the dossier.
3. Do not present code before the reader understands the business rule it protects.
4. Do not present the PWA/device integration as a random extra feature; connect it to friction reduction and proof handling.
5. Do not invent metrics, users, testimonials, or adoption claims that are not supported by source material.
6. Do not bury the strongest architectural idea under too much terminal theater.
7. Do not let DebTracker reuse the same compositional rhythm as LFi, Norden, or any future dossier.

## What this project should demonstrate narratively

The page should make clear:

- what human failure mode or product frustration DebTracker responds to
- why server-authoritative writes matter in a financial context
- why the Penny-Perfect protocol is not a gimmick but a trust guarantee
- why the settlement handshake and no-escape rules show systems thinking
- why PWA/device integration matters for real-world use
- why this project proves Ibai can think like both a builder and a product owner

## CSS isolation requirement

DebTracker is currently the known exception to the dossier-local CSS convention.

The thread should treat this as active migration work:

- inventory the DebTracker selectors currently living in `assets/css/style.css`
- move dossier-specific visual logic toward `assets/css/dossiers/debtracker.css`
- keep shared/global styles shared only when they are truly cross-site

Do not normalize this exception as acceptable long-term architecture.

## Source material to audit first

Use these sources before doing anything else:

- `src/pages/project-debtracker.template.html`
- `content/projects.json`
- `docs/THREAD-ORCHESTRATION.md`
- `docs/ENGINEERING-CHANGELOG.md`
- `docs/ENGINEERING-RUNBOOK.md`
- `assets/images/debtracker.avif`
- `assets/images/debtracker.webp`
- `assets/images/debtracker.png`

Also audit the current DebTracker selectors inside:

- `assets/css/style.css`

Treat that audit as migration inventory, not as permission to expand shared CSS further.

## Technical / authoring rules

- Never edit generated HTML directly
- Edit the source template and rebuild
- Keep behavior dossier-local whenever possible
- If behavior or structure changes, add a concise note to `docs/ENGINEERING-CHANGELOG.md`
- If the work is documentation-only, say so explicitly and do not claim product validation you did not run

## Your first mission

1. Audit the current DebTracker dossier end-to-end
2. Decide what the page is really trying to prove beyond "I built an app"
3. Identify which current modules strengthen that argument and which ones are only decorative
4. Define the migration path from shared `.debtracker_*` CSS to `assets/css/dossiers/debtracker.css`
5. Tighten the narrative so the page reads as a serious product dossier with a distinctive voice, not as a gimmick with code samples

## Always report back with

- what you changed
- what risk you mitigated or objective you advanced
- what you validated
- what remains pending
```
