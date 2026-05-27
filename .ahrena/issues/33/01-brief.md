# Brief — Issue #33 (Plan)

- **Parent Issue:** #32 — `chore(skeleton): review Skeleton for v0.1.0 DoD (playground approval)`
- **Plan sub-issue:** #33 — `Plan: review Skeleton against v0.1.0 DoD`
- **Epic:** #13 — Part 1 (Primitivos)
- **Author / Assignee:** @fernandoseguim
- **Type:** chore (evolvability — DoD review against v0.1.0 checklist)
- **Component dir:** `ui_kit/components/skeleton/`
- **Branch:** `chore/33-review-skeleton-v010-dod` (worktree `.worktrees/33-review-skeleton-v010-dod/`)

## Summary

Close the v0.1.0 DoD gap for `Skeleton`: ensure Storybook covers Default + main variants in light AND dark, behavioral tests of unit (≥ 20 OR ≥ 80% coverage) use accessible queries, jest-axe asserts WCAG AA in both themes, and Brand mirror is verified against Notion.

## Context

- `Skeleton` already implemented: 4 variants (`text` default, `title`, `rect`, `circle`), `lines` for paragraphs, shimmer with `motion-safe` (respects `prefers-reduced-motion`).
- Current `aria-hidden="true"` by default — Skeleton is decorative; loading is announced by the consumer wrapping in `role="status" aria-busy`.
- Existing Storybook already has Default + 4 variant stories + composed stories (`ParagraphLines`, `Card`, `ProfileRow`, `Showcase`). Light-only — toolbar/theme decorator covers dark automatically via `data-theme`.
- Existing test file has 15 tests, all structural (`container.querySelector`, `data-testid`) — does not exercise accessible queries and lacks jest-axe coverage in light + dark.

## DoD (from #33)

1. Storybook `Skeleton.stories.tsx`: Default + main variants in **light AND dark**.
2. Playground side-by-side comparison registered in PR.
3. Behavioral tests `Skeleton.test.tsx` with accessible queries; ≥ 20 tests OR ≥ 80% file coverage; no internal mocks.
4. **A11y (jest-axe) — MANDATORY**: light AND dark via `data-theme` on `document.documentElement`; `toHaveNoViolations()` for `Default`, primary state (animating/static), `disabled` when applicable.
5. Brand × Notion — Notion wins; update local mirror if divergent.
6. `npm run typecheck && npm run lint && npm run test && npm run build && npm run docs:build` all green.
7. `Closes #33` on merge.

## Unknowns

- None blocking. Visual baselines NEVER regenerated from macOS (user guardrail). Brand × Notion mirror verification is manual when no automated drift tool exists.
