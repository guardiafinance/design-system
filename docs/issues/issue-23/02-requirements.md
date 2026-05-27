# Requirements — Issue #23

Numbered criteria, mapped 1:1 with the DoD of Plan sub-issue #23.
Each unit test added or modified in this phase references the
respective `AC-N` in the name (`describe(...)` or `it(...)`) or
in comment/docstring.

## Aceitação

### AC-1 — Storybook: Default + variantes principais em light + dark

`ui_kit/components/button-group/ButtonGroup.stories.tsx` already
exposes Default + the main combinations (Attached, Spaced, Vertical,
Toolbar, MixedVariants). The global Storybook toolbar
(`globalTypes.theme`) toggles `light`/`dark` synchronously on `<html>`
via `applyThemeSync` (`.storybook/preview.tsx`, shipped on `main` by
PR #119), so each story renders correctly in both themes without
flicker.

**Verification:** `npm run build-storybook` green + the story matrix
covers the 2 axes (`orientation × attached`) plus the Toolbar
preset and MixedVariants composition.

### AC-2 — Playground side-by-side vs legacy/produção atual

Visual + functional comparison recorded in the PR via screenshot OR
link to `docs/componentes/button-group` (Astro playground), compared
to the legacy / current production implementation. Because #22 does
not establish a versioned "legacy" reference file for ButtonGroup,
the comparison anchors to the active Astro preview (the canonical
v0.1.0 reference) with an explicit note in the PR — mirroring the
Badge precedent (AC-2 of issue-19).

**Verification:** `## Playground` section in the PR body with a link
to `docs/componentes/button-group` + the convention note.

### AC-3 — Behavioral tests with accessible queries

`ui_kit/components/button-group/button-group.test.tsx` exercises
behavior via accessible queries (`getByRole`, `getByLabelText`,
`getByText`), reaches **≥ 20 test cases** OR ≥ 80% line coverage of
the file, and does not mock internal collaborators.

**Component-nature note:** `ButtonGroup` is a passive structural
wrapper (`<div role="group">` by default). The interactive semantics
live in the **children** (`<Button>`/`<IconButton>`). Tests cover both
sides explicitly:

- The group surface (role, aria-label, custom role e.g. `toolbar`,
  data attributes, orientation × attached matrix, ref forwarding,
  className merge, focus-visible z-10 contract, child order
  preservation).
- The composed interactive case (button children inside the group:
  Tab order, keyboard activation via `Enter`/`Space` on each child,
  `disabled` propagation to the children, IconButton + `aria-label`
  inside a `toolbar` role).

**Verification:** `it(...)`/`it.each(...)` count ≥ 20 in the file,
coverage report ≥ 80% for `ui_kit/components/button-group/index.tsx`.

### AC-4 — A11y jest-axe in light + dark (mandatory)

`button-group.test.tsx` calls `axeInThemes(container)` (helper in
`ui_kit/test-utils/a11y.ts`, which flips `data-theme` on `<html>` and
runs `axe()` in each theme) for at minimum:

1. **Default** (`<ButtonGroup><Button>A</Button><Button>B</Button>
   <Button>C</Button></ButtonGroup>` — horizontal + attached).
2. **Primary interactive state** — ButtonGroup with `aria-label`
   describing a real pagination ("Paginação") with multiple Button
   children. Optionally renders the matrix with `data-focus="visible"`
   surrogate to assert the focus-visible z-10 class chain holds
   without contrast regression in either theme.
3. **Disabled-equivalent (when applicable)** — ButtonGroup with one
   `<Button disabled>` child, asserting axe stays clean (the disabled
   contract is the child's responsibility; the group must not
   introduce contrast or aria regressions in either theme).
4. **Vertical orientation** — `orientation="vertical"` with the same
   3 Button children; covers the compound variant class chain in
   both themes.
5. **Toolbar role with IconButtons** — `role="toolbar"` +
   `aria-label="Formatação"` with `Button size="icon"` children
   carrying individual `aria-label`s, mirroring the Storybook
   `Toolbar` story.
6. **Spaced** (`attached={false}`) — covers the gap-2 path in both
   themes.

Each block uses `expect(...).toHaveNoViolations()` via
`axeInThemes`.

**Verification:** all axe tests green in `npm run test`.

### AC-5 — Brand: colors, typography and logo per Notion

Notion as source of truth
(<https://www.notion.so/Branding-34536f91ebd280a69efacbadab3861c6>).
On divergence with `.claude/rules/design/brand/lex-brand-*` locals,
Notion prevails and the local mirror is updated before the approval.

**Status MCP:** server `notion` is **active** in `.ahrena/.directives`
(`mcp.servers: [ahrena, github, notion]`). Phase 4 reads the
Branding root + the Cores and Tipografia subpages directly via
Notion MCP and records the comparison in the PR `## Brand × Notion`
section. Logo and Voz subpages are not material for `ButtonGroup`
(the component has no logo and no copy of its own).

**Stable local verification:** `ButtonGroup` consumes **zero**
direct color/typography tokens — colors flow through the `<Button>`
children (already validated in issue #19/#173/#180 against the same
Brand axes) and typography inherits from the global `font-family`.
The only surface introduced by ButtonGroup itself is the `data-attached`
border collapse (`-ml-px`/`-mt-px`) and the `z-10` focus elevation —
neither introduces color, typography or logo.

### AC-6 — Quality gate (5 green commands)

`npm run typecheck && npm run lint && npm run test && npm run build
&& npm run docs:build` executed in sequence, all with exit 0.

**Verification:** recorded in `06-quality-report.md`.

### AC-7 — Plan closes via PR

The PR carries `Closes #23` and `Refs #22` in the body. Merge closes
the Plan automatically, transitioning #23 to `status: done` per
`lex-agent-planning`. Merge is **not** executed by the agent — it
waits for explicit "está bom" from Fernando.

**Verification:** PR body checked before opening.

## Definition of Done — Plan sub-issue checklist mapping

| Plan #23 DoD item | AC |
|---|---|
| `npm run dev:all` open `/componentes/button-group` | AC-1, AC-2 (smoke via Astro playground) |
| Storybook Default + main variants in light + dark | AC-1 |
| Playground side-by-side vs legacy/produção | AC-2 |
| Behavioral tests with accessible queries, ≥ 20 OR ≥ 80% | AC-3 |
| jest-axe in light + dark (Default, principal interactive, disabled) | AC-4 |
| Brand per Notion (Notion prevails) | AC-5 |
| List any visual/functional gap | AC-2 / PR body |
| `typecheck && lint && test && build && docs:build` green | AC-6 |
| Explicit "está bom" from Fernando on PR | Gate 2 |
| PR closes Plan #23 via `Closes #23` | AC-7 |
