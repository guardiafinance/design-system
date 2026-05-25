# ADR-002 — Hover does not override `data-[state=checked]` on `action` surfaces

- **Status:** accepted
- **Date:** 2026-05-25
- **Deciders:** Fernando Seguim
- **Plan:** [#166](https://github.com/guardiatechnology/design-system/issues/166) (Plan A of [#159](https://github.com/guardiatechnology/design-system/issues/159))

## Context

The brand-aware token migration in [#125](https://github.com/guardiatechnology/design-system/issues/125) painted 9 interactive components with semantic `--color-action` / `--color-action-hover` / `--color-button-fg` tokens that flip by `data-theme`. After the migration, a cross-component divergence remained: when an element is in `data-[state=checked]` or `selected={true}`, does the hover state still apply the `*-hover` tokens?

Mapping immediately after #125:

| Component | Hover overrides checked? |
|---|---|
| **Chip** | **Yes** — `selected: true` variant carries `hover:bg-action-hover hover:border-action-hover hover:text-button-fg-hover` |
| Checkbox | No — only `hover:border-action` on the default state; `data-[state=checked]` keeps `action` stable |
| Radio | No — same pattern as Checkbox |
| IconButton | N/A — no `checked` state on this primitive |
| Select | N/A — `data-[state=open]` (dropdown open) is not "selected" |
| Combobox | N/A — same as Select |

Chip is the only outlier. The divergence creates two different affordances for "this is already selected" between toggle-pattern components in the same group.

## Decision

**On surfaces painted with `bg-action` (the `action` token surface), the `hover` modifier MUST NOT override the `data-[state=checked]` or `selected={true}` styling. The element keeps the `action` tokens stable regardless of cursor position.**

Concretely, an `action`-painted surface in the selected/checked state uses:

- `bg-action`
- `border-action`
- `text-button-fg`

…and **no `hover:bg-action-hover`, `hover:border-action-hover`, `hover:text-button-fg-hover`** while in that state.

Hover-on-non-checked states (the resting state of a toggle, or a non-toggle action surface like the IconButton solid variant) continue to use `*-hover` tokens normally — this ADR only governs hover behavior **while** in `checked`/`selected`.

## Consequences

### Aligned with the decision (no change)

- **Checkbox**, **Radio** — already follow the policy
- **IconButton**, **Select**, **Combobox** — no `checked` state on the surface in question; out of scope

### Diverges (this PR corrects)

- **Chip** — the `selected: true` variant drops the 3 hover overrides. Visual snapshots regenerated.

### Trade-offs considered

- **Counter-argument:** clicking a selected chip deselects it; hover-on-checked would signal "clicking changes something here." Rejected — Checkbox is also a toggle that deselects on click, and it follows the stable-checked policy. Internal consistency across toggle-pattern components outweighs the specific affordance signal in Chip.
- **Counter-argument:** a stronger hover (`action-hover`) on top of `action` reinforces interactivity. Rejected — the focus ring and the cursor pointer already carry the "interactive" signal; the second-level color shift adds noise without affordance gain, and breaks the bridge between "this is the selected look" and "this is the look of an item *being* selected via hover" (which is *not* the same state and should not look the same).

### What this ADR does NOT cover

- Hover behavior on non-`action` surfaces (e.g., `bg-bg-hover` over `bg-background`) — those follow their own pattern and are stable today
- The `enabled:` modifier policy on hover rules — handled separately by [#159 Plan B](https://github.com/guardiatechnology/design-system/issues/159)
- Dropdown-item selection states inside Select/Combobox — separate surface, not in scope of #125's interactive group

## Enforcement

- Visual: Storybook stories for each component cover the selected/checked + hover combination; baselines on Ubuntu/CI render lock the policy
- Unit: `chip.test.tsx` (and any new toggle-pattern component) asserts the absence of `hover:*-hover` classes when the variant is in the selected/checked state
- Manual: design review flags any reintroduction of `hover:*-hover` on `bg-action` surfaces in `data-[state=checked]`
