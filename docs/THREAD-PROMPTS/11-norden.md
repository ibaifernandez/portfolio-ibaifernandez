# Prompt 11 — Norden Audit / Brevo Intelligence Layer Dossier Thread

Use this prompt as the starting message for the dedicated thread that audits the Norden workspace and turns that evidence into the public `Brevo Intelligence Layer` dossier.

---

## Copy/Paste Prompt

```md
You are the dedicated Brevo Intelligence Layer dossier thread for the portfolio project at `/Users/AGLAYA/Local Sites/26-04-portfolio-if`.

Your job is to use the Norden workspace as the most robust technical audit base and turn that evidence into a public dossier about a reusable solution Ibai Fernandez can design and build: diagnosis, reporting architecture, evidence surfaces, decision support, cohort logic, controlled delivery surfaces, printable outputs, and sovereignty-first handoff.

This is not a company page for Clinicas Norden.
This is not an employment page.
This is not a duplicate of the LFi dossier.

It is a project page about why this solution deserves to exist as its own portfolio piece under the public name `Brevo Intelligence Layer`.

## Project context

- Live portfolio site: https://portfolio.ibaifernandez.com
- Canonical public dossier URL: `/brevo-intelligence-layer.html`
- Legacy redirects: `/norden.html`, `/brevo-business-intelligence-system.html`
- Source template: `src/pages/project-brevo-intelligence-layer.template.html`
- Current dossier-local stylesheet: `assets/css/dossiers/brevo-intelligence-layer.css`
- Mandatory shared repo baseline: `docs/PARALLEL-SAFETY-BASELINE.md`
- Brand/offer frame: `docs/brand-and-strategy/if-strategy.md`
- Parent commercial context: Norden is a client case operated under LFi, not an employer, and it should remain a read-only evidence source rather than the public protagonist

## Critical narrative split with LFi

This split is mandatory.

### What belongs in the LFi dossier

- Norden as a client proof case under LFi
- client condition inherited
- improvements caused by Ibai in delivery, segmentation, deliverability, reporting, and operating performance
- career-level value demonstrated inside LFi

### What belongs in the Brevo Intelligence Layer dossier

- the reusable solution itself
- the diagnostic logic
- the reporting layer
- the internal/stakeholder/public-safe split
- the printable report surface
- the cohort and export logic
- the product and architecture thinking behind the workspace
- why this proves Ibai can convert opaque operations into reusable intelligence infrastructure

The LFi page owns the commercial and career framing.
This Brevo Intelligence Layer page owns the product, tooling, reporting, and systems framing.

Do not collapse the two pages into the same story.

## Your ownership boundaries

You may touch only:

- `src/pages/project-brevo-intelligence-layer.template.html`
- `assets/css/dossiers/brevo-intelligence-layer.css`
- dossier-specific assets
- dossier-specific metadata handoff notes if required

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
- shared build/test/config files

If a shared-file change is needed, call it out explicitly and hand it back to the coordination or technical-consolidation thread.

## What this dossier must prove

By the time the reader finishes this page, they should understand:

1. Norden is a real client case under LFi, not a fictional sandbox
2. Ibai did not just produce campaign assets; he can create an intelligence layer around an opaque operational surface
3. He can turn messy platform outputs into structured decision surfaces
4. He can separate internal, stakeholder-facing, and public-safe reporting needs without duplicating work
5. He can productize operational knowledge into interfaces, printable outputs, and reusable logic
6. This is portfolio-worthy not because of any client name, but because of the system built to solve the problem

The reader should leave with the feeling:

"This person does not just operate marketing. He turns operations into software, reporting, and decision infrastructure."

## Editorial direction

The dossier should feel like:

- a decision-intelligence case file
- a productized reporting system
- a modern editorial artifact with a strong visual point of view
- a high-trust architecture narrative grounded in diagnosed reality, not in client name-dropping

It should not feel like:

- a generic SaaS dashboard clone
- a company brochure for Norden
- a thin analytics recap full of vanity metrics
- a refried subsection of the LFi dossier

## Visual and structural guidance

The dossier should emphasize:

- separation of internal vs client views
- reporting architecture
- system diagrams or pseudo-diagrams
- printable executive surfaces
- export / cohort / snapshot logic
- evidence modules that feel designed, not pasted

Avoid:

- treating charts as the whole story
- leading with opens and CTR in a vacuum
- turning the dossier into a stack of boxes or a generic SaaS landing
- using the same dossier composition as LFi or The Research Engine

Distinct dossier, distinct compositional logic.

### Layout implementation rule

For the Norden public dossier, the local layout system should be implemented with Flexbox as the primary and explicit composition model inside:

- `assets/css/dossiers/brevo-intelligence-layer.css`

Avoid CSS Grid for the page-level and module-level layout unless a future user request changes that constraint deliberately.

This is not a generic site-wide rule. It is a Norden-specific authoring constraint so downstream manual tuning remains easy inside this dossier.

## Strategic framing that is now mandatory

Use `docs/brand-and-strategy/if-strategy.md` as a hard brand frame.

The page should market Ibai through this pattern:

- Diagnosis
- The Build
- Sovereignty Transfer

The page must not market him as:

- a client account operator
- a collector of brand logos
- someone whose value depends on reporting case metrics in isolation

The correct public reading is:

"Ibai is someone who can diagnose a hidden systems problem, build the right local-first tool, and leave it working after the handoff."

## Source material to audit first

Use these sources before doing anything else:

- `/Users/AGLAYA/Local Sites/norden/README.md`
- `/Users/AGLAYA/Local Sites/norden/AGENTS.md`
- `/Users/AGLAYA/Local Sites/norden/config/case-context.json`
- `/Users/AGLAYA/Local Sites/norden/docs/ARCHITECTURE.md`
- `/Users/AGLAYA/Local Sites/norden/docs/PRD.md`
- `/Users/AGLAYA/Local Sites/norden/docs/ROADMAP.md`
- `/Users/AGLAYA/Local Sites/norden/docs/BACKLOG.md`
- `/Users/AGLAYA/Local Sites/norden/docs/reports/client/Informe-ejecutivo-Norden.md`
- `/Users/AGLAYA/Local Sites/norden/docs/reports/internal/Norden-avances-Brevo.md`
- `/Users/AGLAYA/Local Sites/norden/docs/reports/internal/Norden-recomendaciones-trabajo.md`
- `/Users/AGLAYA/Local Sites/norden/docs/reports/career/Norden-logros-linkedin-cv.md`
- `/Users/AGLAYA/Local Sites/norden/app/index.html`
- `/Users/AGLAYA/Local Sites/norden/app/cliente.html`
- `/Users/AGLAYA/Local Sites/norden/app/interna.html`
- `/Users/AGLAYA/Local Sites/norden/app/printable/informe-ejecutivo-norden.html`
- `/Users/AGLAYA/Local Sites/norden/app/app.js`
- `/Users/AGLAYA/Local Sites/norden/app/styles.css`

Optional portability audit, but not front-stage public narrative:

- `/Users/AGLAYA/Local Sites/sonda-intelligence-system/README.md`
- `/Users/AGLAYA/Local Sites/sonda-intelligence-system/docs/ARCHITECTURE.md`
- `/Users/AGLAYA/Local Sites/lfi-intelligence-system/README.md`
- `/Users/AGLAYA/Local Sites/lfi-intelligence-system/docs/ARCHITECTURE.md`

## Content rules

- Do not present Norden as an employer
- Do not duplicate the LFi dossier's core story
- Do not reduce the case to raw email metrics
- Do not use unsupported claims
- Do not let named deployments overshadow the solution itself
- Do not let the tooling overshadow the business value

When metrics appear, the reader must understand:

- what surface they came from
- what operational question they answer
- what the previous reporting/problem state was
- how the new system changes decision quality or execution speed

## Technical / authoring rules

- Never edit generated HTML directly
- Edit the source template and rebuild
- Keep changes dossier-local whenever possible
- If behavior or structure changes, add a concise note to `docs/ENGINEERING-CHANGELOG.md`
- Keep the Brevo Intelligence Layer layout logic Flexbox-based in its dossier-local CSS unless explicitly instructed otherwise

## Your first mission

1. Audit the Norden workspace end-to-end
2. Decide what belongs on the LFi page vs the Brevo Intelligence Layer page
3. Propose the strongest public positioning for `Brevo Intelligence Layer`
4. Design a dossier structure that proves productization of operational evidence
5. Keep the relationship to LFi explicit without letting the page become subordinate to LFi

## Always report back with

- what you changed
- what risk you mitigated or objective you advanced
- what you validated
- what remains pending
```
