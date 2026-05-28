# Brief — Plan #49 / Parent #48 (Radio review against v0.1.0 DoD)

- **Plan sub-issue:** #49 "Plan: review Radio against v0.1.0 DoD"
- **Parent Issue:** #48 "chore(radio): review Radio for v0.1.0 DoD (playground approval)"
- **Author / Driver:** @fernandoseguim
- **Type:** Plan (sub-issue) of a Tech Task (`evolvability ♻️`)
- **Repo:** `guardiatechnology/design-system`
- **Milestone:** v0.1.0 (almost complete — 10 components shipped: Avatar, IconButton, ButtonGroup, Button, Checkbox, DatePicker, Combobox, FileUpload, Input, FormLayout)
- **Sibling Plan running in parallel:** #51 (Select) — isolated via dedicated worktree

## Goal

Close the gap between the existing `Radio` migration and the v0.1.0 Definition of Done that was tightened after the original migration: explicit dark-mode coverage in Storybook, behavioral tests ≥ 20 (or ≥ 80% coverage), jest-axe in light + dark on the canonical surfaces, Brand × Notion verification, and Fernando's playground approval. Output: a single PR closing both #49 (Plan) and #48 (parent Tech Task).

## Current State (from inspection)

- `ui_kit/components/radio/index.tsx` — Radix-based compound (`<RadioGroup>` + `<Radio>`), sizes `sm` / `md`, brand-aware tokens (`border-action`, `bg-action`, `border-border-strong`, `aria-[invalid=true]:border-destructive`). No theme-specific hardcoded colors.
- `ui_kit/components/radio/Radio.stories.tsx` — 8 stories: `Default`, `WithDescriptions`, `Horizontal`, `Sizes`, `Invalid`, `Disabled`, `Standalone`, `InsideForm`. **No `DarkTheme` story** (the v0.1.0 DoD gap).
- `ui_kit/components/radio/radio.test.tsx` — 24 tests already passing, including:
  - 7 `RadioGroup` tests (role, orientation, count, defaultValue, onValueChange, controlled, `name` prop)
  - 13 `Radio` tests (role, standalone, label wrapper, `aria-describedby`, label click, sizes, invalid, disabled, ids, ArrowDown roving tabindex, Space activation, classNames)
  - 2 brand-aware token tests (per Tech Task #125: `border-action`, `bg-action`, no `guardia-purple-*` hardcoded)
  - 4 a11y `axeInThemes` tests covering: group/no-selection, group/default-selection, invalid, disabled
- `docs/src/pages/componentes/radio.astro` — Astro playground page exists (side-by-side with Storybook).
- `__image_snapshots__/components/radio/` — no baselines committed (component does not currently participate in visual regression). DarkTheme story addition will not necessarily create new baselines unless we run with `regenerate-baselines`; CI will tell us.

## Notable Cross-Cutting Infra Already on `main` (do not redo)

- Storybook light/dark toolbar via `globalTypes` (PR #119)
- Astro playground cross-iframe theme toggle (PR #119)
- `ui_kit/test-utils/a11y.ts::axeInThemes` helper (Tech Task #125)
- Notion MCP enabled (PR #216)
- Canonical status labels (PR #215)
- Brand inversion (PR #226) — `--primary` resolves to Violet 500 in light, Orange 500 in dark; `border-action` / `bg-action` already aligned

## Unknowns / Risks

- Whether the existing 4 axe surfaces fully match the canonical 6 listed in the Plan #49 DoD (single, grouped, with selection, disabled, label-association, fieldset+legend). The current suite covers 4; the additional 2 (single standalone, fieldset+legend) are missing.
- Whether the DarkTheme story (when added) will trigger CI visual regression failures (likely yes for new visual surfaces) — mitigation: label `regenerate-baselines` on the PR.
- **Risk: label-less inputs in DarkTheme story** — Plan #208 was blocked by 4 unlabeled `<Input>` instances in a similar DarkTheme story (axe `label` rule violation). Mitigation: every Radio in the new story has an explicit `label` prop or a wrapper `<label htmlFor>`, and every `<RadioGroup>` carries an `aria-label` / `aria-labelledby`.

## Out of Scope

- New Radio features beyond v0.1.0 DoD parity (e.g., a `<RadioGroupField>` wrapper with embedded error message — would be a new Plan).
- Brand inversion follow-ups (already shipped in #226).
- Any change to other components — sibling Plan #51 (Select) runs in parallel.

## Notion Context

Per Plan #48/#49 body, Brand source of truth = [Branding on Notion](https://www.notion.so/Branding-34536f91ebd280a69efacbadab3861c6) with subpages Cores, Tipografia, Logomarca, Voz. To be queried via Notion MCP in Phase 7 (Brand check). With #226 shipped, the local `--primary` token is already aligned with Notion's primary-CTA hierarchy.
