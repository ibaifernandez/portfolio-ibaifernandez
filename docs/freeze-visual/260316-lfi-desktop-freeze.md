# LFi Desktop Freeze

Reference capture: `/Users/AGLAYA/Local Sites/portfolio-ibaifernandez/docs/freeze-visual/260316-14-16-lfi-html.png`

## Scope

This freeze applies to the desktop composition of the public LFi dossier built from:

- `src/pages/lfi.template.html`
- `assets/css/dossiers/lfi.css`

The frozen surface is the editorial body of the page: hero, systems section, client proof modules, promotion arc, client wall, testimonial wall, and closing band composition.

## Freeze rule

Do not alter the desktop composition without explicit approval.

That means:

- do not reflow the hero
- do not recompose the left/right section rhythm
- do not resize or relocate the major editorial headings
- do not introduce new desktop layout patterns “to improve” an already approved composition
- do not replace the current flexbox contract with CSS Grid

## Explicit exceptions still open

At the moment, only these desktop areas remain editable without breaking the freeze intent:

- lower project navigation readability and affordance
- footer readability and visual fit with the dark LFi surface

Responsive behavior is not covered by this freeze and remains an open workstream.

## Open debt

The current open debt for LFi is intentionally narrow:

- mobile and tablet adaptation
- future editorial expansion through additional proof cases

There are no known desktop blockers left inside the current approved scope.

## Technical invariants

Any future work on LFi should preserve these technical constraints:

- `#project_main` must remain a `<main>` landmark
- the dossier layout contract is local to `assets/css/dossiers/lfi.css`
- shared `assets/css/style.css` must not be used as a back door for LFi layout changes
- public copy must remain wired to the EN/ES translation layer
- desktop changes must be judged against the reference capture, not against abstract preference

## Intent

The point of this freeze is not to prevent all change. It is to protect an approved desktop composition that already communicates seniority, pressure, and editorial control at the right level.

Future iterations should therefore prefer:

- responsive refinement
- readability/accessibility corrections
- technical hardening that does not move the approved desktop composition

Over:

- speculative redesign
- novelty-driven re-layout
- shared-style regressions
