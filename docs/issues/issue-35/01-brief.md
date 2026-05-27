# Brief — Issue #35

## Identification

- **Issue (Plan):** `guardiatechnology/design-system#35` — `Plan: review Spinner against v0.1.0 DoD`
- **Parent Issue:** `#34` — `chore(spinner): review Spinner for v0.1.0 DoD (playground approval)`
- **Epic:** `#13` — Part 1, Primitives
- **Type:** Tech Task / DoD review
- **Status (entry):** `status: todo`
- **Assignee:** `fernandoseguim`
- **Component dir:** `ui_kit/components/spinner/`
- **Branch:** `chore/35-review-spinner-v010-dod`
- **Worktree:** `.worktrees/35-review-spinner-v010-dod/`

## Summary

Spinner already exists in the design system with: index implementation (5 sizes, 4 colors,
`role="status"` + `aria-label="Carregando"`, `prefers-reduced-motion`, anti-wobble baseline
neutralization), 7 Storybook stories (Default / Sizes / Colors / OnDarkBackground / Inline /
CustomLabel / Decorative), 17 behavioral tests with accessible queries, and live docs preview
under `docs/src/pages/componentes/spinner.astro`. The component shipped before the v0.1.0 DoD
formalized mandatory jest-axe coverage in light + dark (Tech Task #125).

This review closes the v0.1.0 DoD gap on Spinner: bring the test suite to **≥ 20 tests OR
≥ 80% coverage**, add **mandatory jest-axe** assertions in light AND dark themes via
`axeInThemes` (Default, primary states, decorative), and verify Brand × Notion alignment.
No public API change.

## Why

Tech Task #125 formalized jest-axe in light + dark as a non-negotiable AC of every component
PR. Spinner shipped before that bar existed and the suite (`spinner.test.tsx`) currently has
17 tests without any `toHaveNoViolations()` call. The component itself is sound (no XSS
surface, no interactive contract, semantic `role="status"`), so the work is additive —
expand the suite to the v0.1.0 bar, not refactor the component.

## What

Scope strictly limited to `ui_kit/components/spinner/` and `docs/issues/issue-35/`:

1. Expand `spinner.test.tsx`: bring count to ≥ 20 tests (currently 17); add `axeInThemes`
   coverage for Default, each color tone, custom-label, in-button composition, and the
   `aria-hidden` decorative variant.
2. Verify (and add if missing) Storybook coverage for Default + all main variants. Component
   already has 7 stories — playground confirms light/dark via Storybook's existing theme
   addon.
3. Brand × Notion check on color tokens; mirror update only if divergent.
4. Run the full quality gate (`typecheck && lint && test && build && docs:build`).
5. Open PR with `Closes #35`, `Refs #34`, AC↔test traceability, visual baselines note,
   Brand × Notion note. **No merge** — Fernando approves.

## Out of scope

- Spinner public API changes (props, sizes, colors). Component is locked for v0.1.0.
- Visual snapshot regeneration (Ubuntu/CI is the source of truth per user guardrail).
- Refactor of existing stories or docs preview.
- Other components.

## Source references

- `ui_kit/components/spinner/index.tsx`
- `ui_kit/components/spinner/spinner.test.tsx`
- `ui_kit/components/spinner/Spinner.stories.tsx`
- `ui_kit/test-utils/a11y.ts` (canonical `axeInThemes` helper)
- `ui_kit/components/badge/badge.test.tsx` (reference jest-axe adoption pattern)
- `vitest.setup.ts` (`toHaveNoViolations` matcher extended globally)
- `docs/src/pages/componentes/spinner.astro` (live docs preview)
