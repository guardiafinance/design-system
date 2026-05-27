# Architecture — Issue #23

## Scope summary

Plan #23 is a **review-and-close-gap** Plan, not a feature
implementation. The component `ButtonGroup` is migrated and shipped;
the gap to v0.1.0 DoD is **test coverage** (behavioral + jest-axe in
both themes) + Brand × Notion verification. No public API change, no
new file, no new dependency.

## File scope (whitelist — Gate 2 scope-creep enforcement)

| File | Action | Reason |
|---|---|---|
| `ui_kit/components/button-group/button-group.test.tsx` | **Modify** (extend) | Add AC-3 behavioral cases and AC-4 jest-axe theme matrix |
| `docs/issues/issue-23/01-brief.md` | **Create** | Phase 1 |
| `docs/issues/issue-23/02-requirements.md` | **Create** | Phase 2 |
| `docs/issues/issue-23/03-architecture.md` | **Create** | Phase 3 (this file) |
| `docs/issues/issue-23/05-security-review.md` | **Create** | Phase 5 |
| `docs/issues/issue-23/06-quality-report.md` | **Create** | Phase 6 |

Nothing else MAY be modified by the agent in this PR. Tangential
findings → surface to Fernando per `lex-no-silent-tech-debt` and
`lex-agent-focus-on-active-plan`. Notion-driven mirror updates to
`.claude/rules/design/brand/*` are pre-Gate-1 work and are recorded
in `01-brief.md` if executed (with explicit Fernando ack).

## Files NOT to modify (explicit non-goals)

- `ui_kit/components/button-group/index.tsx` — already implements the
  contract. No behavior change is part of this Plan.
- `ui_kit/components/button-group/ButtonGroup.stories.tsx` — stories
  already cover the matrix; the global theme toolbar (shipped on
  `main` by PR #119) handles light/dark.
- `docs/src/pages/componentes/button-group.astro` — playground is
  already present.
- `.storybook/preview.tsx`, `vitest.setup.ts`,
  `ui_kit/test-utils/a11y.ts` — cross-cutting infra, untouched.
- Sibling components, sibling tests, sibling stories — untouched.

## ADRs

**None.** No new architectural decision. The patterns applied are
already adopted across the codebase:

- `axeInThemes` from `@/test-utils/a11y` — adopted by Badge (#19),
  Avatar (#17), Input, and all migrated primitives.
- Accessible queries (`getByRole`, `getByLabelText`) — codified in
  `lex-frontend-testing`.
- Behavioral test threshold (≥ 20 cases OR ≥ 80% file coverage) —
  established in Plan #19.

## Component surface map (for jest-axe coverage selection)

| Surface | jest-axe coverage (AC-4) | Theme matrix |
|---|---|---|
| Default `<div role="group">` + horizontal + attached + 3 Buttons | ✅ | light + dark |
| With `aria-label="Paginação"` (semantic group) | ✅ | light + dark |
| `<Button disabled>` child inside the group | ✅ | light + dark |
| `orientation="vertical"` + 3 Buttons | ✅ | light + dark |
| `role="toolbar"` + IconButtons w/ `aria-label` | ✅ | light + dark |
| `attached={false}` (spaced + gap-2) | ✅ | light + dark |

## Behavioral test plan (AC-3 — target ≥ 20 cases)

Building on the 10 existing tests, add (numbered for traceability):

| # | Test (it/describe) | AC |
|---|---|---|
| 1-10 | Existing tests in `button-group.test.tsx` (role default, defaults horizontal+attached, vertical, attached=false gap, attached border-collapse class heuristic, children order, aria-label, custom role toolbar, ref forwarding, className merge) | AC-3 |
| 11 | `[AC-3] resolves accessible name from aria-label on getByRole("group", { name })` | AC-3 |
| 12 | `[AC-3] resolves accessible name from aria-labelledby (external heading)` | AC-3 |
| 13 | `[AC-3] Tab navigates children in document order` (3 buttons, simulate Tab) | AC-3 |
| 14 | `[AC-3] children receive Enter activation` (click handler on middle Button via keyboard) | AC-3 |
| 15 | `[AC-3] children receive Space activation` (idem) | AC-3 |
| 16 | `[AC-3] disabled child is unreachable via Tab` | AC-3 |
| 17 | `[AC-3] role="toolbar" + IconButton aria-labels are individually accessible` (4 IconButtons by name) | AC-3 |
| 18 | `[AC-3] orientation="vertical" still carries role="group"` | AC-3 |
| 19 | `[AC-3] data-orientation reflects current orientation prop` | AC-3 |
| 20 | `[AC-3] data-attached reflects current attached prop (true and false)` | AC-3 |
| 21 | `[AC-3] focus-visible z-10 class chain is present on attached groups` (class heuristic on the container, mirrors existing border-collapse heuristic) | AC-3 |
| 22 | `[AC-3] vertical attached collapses radii on top/bottom (class heuristic)` | AC-3 |
| 23 | `[AC-4] Default is WCAG AA clean in light + dark` | AC-4 |
| 24 | `[AC-4] semantic group (aria-label "Paginação") is WCAG AA clean in light + dark` | AC-4 |
| 25 | `[AC-4] disabled-equivalent child is WCAG AA clean in light + dark` | AC-4 |
| 26 | `[AC-4] vertical orientation is WCAG AA clean in light + dark` | AC-4 |
| 27 | `[AC-4] role="toolbar" + IconButtons is WCAG AA clean in light + dark` | AC-4 |
| 28 | `[AC-4] spaced (attached=false) is WCAG AA clean in light + dark` | AC-4 |

Total: **28 cases** (≥ 20 ✅). Coverage of 91-LoC `index.tsx` will be
≥ 80% by construction (every variant branch + the forwardRef path are
exercised).

## Stacked PR Decomposition

**None.** Single PR per Plan per `lex-agent-planning`. Decision
Checklist (`codex-stacked-prs`): 0 high signals, multiple anti-signals
(small Plan, single file modified, single reviewer, single review pass
expected). Stays as one PR.

## Delegation

**None.** Athena executes Phase 4 directly (test extension only — no
production code change). Hephaestus / Apollo not required for this
shape of work.
