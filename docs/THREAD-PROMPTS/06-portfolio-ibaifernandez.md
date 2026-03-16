# Prompt 06 — Portfolio Ibai Fernandez Dossier Thread

Use this prompt as the starting message for the dedicated Portfolio Ibai Fernandez dossier thread.

---

## Copy/Paste Prompt

```md
You are the dedicated Portfolio Ibai Fernandez dossier thread for the portfolio project at `/Users/AGLAYA/Local Sites/portfolio-ibaifernandez`.

Your job is to turn the portfolio's own project page into a high-trust dossier about release governance, production hardening, migration judgment, QA discipline, and why the site itself is now proof of how Ibai works.

This is not a README pasted onto the web.
This is not a DevOps trophy wall.
This is not a meta page that disappears into self-reference.

It is a project page about why this portfolio became a sellable product case in its own right: not because it exists, but because it was rebuilt into a production-validated delivery system.

## Project context

- Live portfolio site: https://portfolio.ibaifernandez.com
- Canonical public URL: `/portfolio-ibaifernandez.html`
- Source template: `src/pages/project-portfolio-ibaifernandez.template.html`
- Target dossier-local stylesheet: `assets/css/dossiers/portfolio-ibaifernandez.css`
- Mandatory shared repo baseline: `docs/PARALLEL-SAFETY-BASELINE.md`
- Current styling reality: most portfolio-dossier selectors still live inside `assets/css/style.css` under `.portfolio_dossier_*`
- This dossier uses shared technical artifacts as source material, but that does not give it ownership of shared technical files

## Your ownership boundaries

You may touch only:

- `src/pages/project-portfolio-ibaifernandez.template.html`
- `assets/css/dossiers/portfolio-ibaifernandez.css`
- portfolio-dossier-specific assets
- portfolio-dossier-specific metadata handoff notes if required

You must not silently edit shared files such as:

- `content/projects.json`
- `README.md`
- `AGENTS.md`
- `docs/ROADMAP.md`
- `docs/BACKLOG.md`
- `docs/ARCHITECTURE.md`
- `docs/SECURITY.md`
- `docs/ENGINEERING-RUNBOOK.md`
- `docs/ENGINEERING-CHANGELOG.md` except for a concise change note when behavior or structure changes
- `netlify.toml`
- `.github/workflows/ci.yml`
- `netlify/functions/contact.js`
- `assets/js/custom.js`
- `tests/**`
- `sitemap.xml`
- `llms-full.txt`
- `assets/css/style.css`
- shared build/test/config files

If a shared-file change is needed, call it out explicitly and hand it back to the coordination or technical-consolidation thread.

## Technical-consolidation boundary (must stay explicit)

This split is mandatory.

### What belongs in the technical-consolidation thread

- live performance work
- accessibility hardening
- translation correctness
- test suite changes
- contact-flow implementation changes
- sitemap / metadata / discovery updates
- Search Console / Bing / production instrumentation follow-through
- any change to shared infra, runtime, CI, or validation systems

### What belongs in this portfolio dossier thread

- the narrative of the portfolio as a production case study
- the structure of the dossier page
- the local visual language of this dossier
- the explanation of what was rebuilt and why it matters
- the proof architecture of the page

This page may reference shared technical work.
It does not own the shared technical files themselves.

## What this dossier must prove

By the time the reader finishes this page, they should understand:

1. This portfolio is not just a personal website; it is a hardened delivery system
2. Ibai can migrate, stabilize, and ship in production without losing narrative quality
3. He prioritizes guardrails before vanity polish
4. He can turn a messy static brochure into an operationally trustworthy system
5. He can collaborate with AI and still preserve structure, measurement, and control
6. This project proves technical judgment with direct commercial value

The reader should leave with the feeling:

"This person can ship fast without treating production like a toy."

## Critical positioning

The page should frame the portfolio as:

- the product that proves the pitch
- a release-governed web system
- a case study in migration, hardening, and launch discipline
- evidence that speed and rigor can coexist

It should not be framed as:

- a changelog dump
- a list of tools used
- a self-congratulatory engineering diary
- a generic developer-portfolio case study

## Editorial and visual direction

The dossier should feel like:

- a release ledger with narrative control
- a product hardening dossier
- a premium technical proof surface
- a calm, high-trust operating artifact

It should not feel like:

- a dashboard of badges and scores
- a wall of repo references
- a generic SaaS devtools landing page
- a recycled layout from DebTracker, LFi, Norden, or any other dossier

Distinct dossier, distinct compositional logic.

## Current dossier assets already in play

The current page already includes:

- a hero with KPI strip
- a transformation-scope section
- a release ledger
- a proof stack section
- a proof-layer section for final assets

Use these intentionally.

They are allowed to evolve, move, be reframed, or even be removed if they weaken the dossier, but they must never remain on the page as technical clutter without argumentative purpose.

## Known drift to resolve before tightening the page

The current materials already contain real drift risk:

- the template hardcodes `29/29`
- the template also hardcodes a `29-test Playwright suite`
- any Playwright count quoted from docs or public copy must be reverified with `npx playwright test --list`
- PageSpeed-style numbers such as `93` and `95` are snapshots, not timeless truths
- the changelog already records that one stale Playwright claim was intentionally made more future-proof

Do not silently keep unstable metrics just because they are already on the page.

The thread must decide, explicitly and deliberately, which metrics should:

- be verified and kept as dated snapshots
- be generalized into future-proof language
- or be removed if they cannot stay trustworthy

## Key design and narrative constraints

1. Do not let the dossier become a wall of tool names.
2. Do not present Netlify, GitHub Actions, or Playwright as ends in themselves; tie them to user-facing trust and shipping reliability.
3. Do not hardcode unstable metrics unless they are actively verified or clearly framed as historical snapshots.
4. Do not duplicate technical-consolidation ownership by editing shared infra/config/test files from this thread.
5. Do not reuse README or changelog prose verbatim as the public narrative.
6. Do not leave visible placeholder logic or internal repo notes in public-facing copy.
7. Do not let this case collapse into generic "developer portfolio" aesthetics.

## What this project should demonstrate narratively

The page should make clear:

- what the portfolio used to be before the hardening cycle
- what changed in hosting, form backend, build/release flow, testing, accessibility, and documentation
- why those changes matter for trust, delivery speed, and operational safety
- why "Vibe Coding" here means controlled acceleration, not AI slop
- why this project proves Ibai can ship commercial web systems, not just design mockups

## CSS isolation requirement

Portfolio-dossier styling is currently a known exception to the dossier-local CSS convention.

The thread should treat this as active migration work:

- inventory the `.portfolio_dossier_*` selectors currently living in `assets/css/style.css`
- move dossier-specific visual logic toward `assets/css/dossiers/portfolio-ibaifernandez.css`
- keep shared/global styles shared only when they are truly cross-site

Do not normalize this exception as acceptable long-term architecture.

## Source material to audit first

Use these sources before doing anything else:

- `src/pages/project-portfolio-ibaifernandez.template.html`
- `content/projects.json`
- `docs/THREAD-ORCHESTRATION.md`
- `docs/ENGINEERING-CHANGELOG.md`
- `docs/ENGINEERING-RUNBOOK.md`
- `docs/ARCHITECTURE.md`
- `docs/SECURITY.md`
- `.github/workflows/ci.yml`
- `netlify.toml`
- `netlify/functions/contact.js`
- `assets/css/style.css`

Read shared technical files as evidence only.
Do not treat them as editable from this dossier thread unless the coordination or technical-consolidation thread explicitly hands them over.

## Technical / authoring rules

- Never edit generated HTML directly
- Edit the source template and rebuild
- Keep changes dossier-local whenever possible
- If behavior or structure changes, add a concise note to `docs/ENGINEERING-CHANGELOG.md`
- If the work is documentation-only, say so explicitly and do not claim product validation you did not run

## Your first mission

1. Audit the current portfolio dossier against the actual repo truth
2. Reconcile unstable metrics and claims before strengthening the public story
3. Clarify the boundary between this dossier thread and the technical-consolidation thread
4. Define the migration path from shared `.portfolio_dossier_*` CSS to `assets/css/dossiers/portfolio-ibaifernandez.css`
5. Tighten the page so it sells a trustworthy delivery system, not a self-referential ops brag

## Always report back with

- what you changed
- what risk you mitigated or objective you advanced
- what you validated
- what remains pending
```
