# Issue Brief — #51 (Plan: review Select against v0.1.0 DoD)

- **Plan sub-issue:** [#51](https://github.com/guardiatechnology/design-system/issues/51) — `status: development`
- **Parent Issue:** [#50](https://github.com/guardiatechnology/design-system/issues/50) — `chore(select): review Select for v0.1.0 DoD (playground approval)`
- **Type:** Plan (Tech Task parent)
- **Author / Assignee:** @fernandoseguim
- **Category:** Forms
- **Milestone:** v0.1.0
- **Branch:** `chore/51-review-select-v010-dod`
- **Worktree:** `.worktrees/51-review-select-v010-dod/`

## Why

`Select` was migrated to the v0.1.0 DoD before three rules took effect:
1. Playground-driven approval
2. Storybook coverage in light + dark
3. Brand validation against Notion as source of truth

Without this review, Select cannot ship in v0.1.0. Plan #51 closes the gap.

## What (in scope)

Execute the canonical v0.1.0 component review against `ui_kit/components/select/`:
- Storybook: validate Default + main variants in light + dark
- Astro playground: side-by-side comparison at `/componentes/select`
- Behavioral tests: ≥20 OR ≥80% coverage via accessible queries
- A11y `jest-axe` covering light + dark via `axeInThemes()`
- Brand mirror check against Notion (post-#226 inversion is already on `main`)
- CI green; explicit Fernando "está bom"
- PR closes #51 AND #50 (parent — new convention)

## Out of scope

- New features on `Select` beyond parity with legacy
- Brand/token refactors unrelated to `Select`
- Native `<select>` fallback
- Multi-select API (separate component)

## Current state (snapshot)

`ui_kit/components/select/`:
- **`index.tsx`** — Radix Popover + custom listbox (same arch as Combobox). Brand-aware tokens (`border-action`, `bg-bg-hover`, `text-action`), no hardcoded `guardia-purple`. Hidden `<input>` for form submission. Full ARIA (combobox + listbox + activedescendant).
- **`Select.stories.tsx`** — 6 stories (Default, WithDefaultValue, WithLeftIcon, Sizes, States, WithDisabledOption). **No `DarkTheme` story.**
- **`select.test.tsx`** — 35 tests, ≥20 met. Covers: open/close, keyboard nav (Arrow/Home/End/Enter/Escape), controlled vs uncontrolled, disabled options, ARIA correctness, brand-aware tokens, full a11y matrix (`axeInThemes` × 5 states: closed / with-value / open-with-selection / invalid / disabled).

## Gap analysis (vs DoD)

| DoD item | State | Action |
|---|---|---|
| `npm run dev:all` opens `/componentes/select` | Existing | Verify CI green |
| Storybook Default + variants in light | ✅ Present | None |
| Storybook variants in **dark** | ❌ Missing | **Add `DarkTheme` story** (matrix) |
| Astro playground side-by-side | Existing route | Verify; capture in PR |
| Behavioral tests ≥20 OR ≥80% | ✅ 35 tests, ARIA + keyboard | None |
| `axeInThemes` light + dark | ✅ 5 axe states | None |
| Brand × Notion | Post-#226 inverted primary already on main | Verify no new divergence; spot-check via Notion MCP |
| Visual gaps listed | TBD | Capture in PR |
| `typecheck && lint && test && build && docs:build` green | TBD | Run locally + CI |
| Fernando "está bom" | TBD | Await on PR |
| PR `Closes #51` AND `Closes #50` | TBD | Phase 7 |

## Unknowns / risks

- **`<DarkTheme>` story for Popover-based component:** Radix Portal renders outside the story decorator. Combobox solved this by NOT forcing `open` and documenting WHY in the docblock (a11y for open state lives in `axeInThemes` test in `combobox.test.tsx`). Same approach applies here — `select.test.tsx` already has `axeInThemes` on the open Popover.Content.
- **Visual regression baselines:** if any new visual is captured by playground snapshots, may need `regenerate-baselines` label after macOS-local diff. Story-only addition is typically safe.

## Context links

- Notion Brand (source of truth): https://www.notion.so/Branding-34536f91ebd280a69efacbadab3861c6
- Brand inversion shipped: PR [#226](https://github.com/guardiatechnology/design-system/pull/226)
- DarkTheme template ancestry: PR [#119](https://github.com/guardiatechnology/design-system/pull/119) (Avatar) → replicated in #205 / #206 / #209 / #217 / #218 / #219 / #222 / #223 / #224
- Direct precedent (same Radix Popover architecture): `ui_kit/components/combobox/Combobox.stories.tsx::DarkTheme`
- Sibling in-flight: Plan #49 (Radio) — running parallel worktree
