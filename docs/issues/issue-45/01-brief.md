# Phase 1 — Brief: Plan #45 (FormLayout v0.1.0 DoD review)

- **Plan sub-issue:** [guardiatechnology/design-system#45](https://github.com/guardiatechnology/design-system/issues/45) — `Plan: review FormLayout against v0.1.0 DoD`
- **Parent Issue:** [#44](https://github.com/guardiatechnology/design-system/issues/44) — `chore(form-layout): review FormLayout for v0.1.0 DoD (playground approval)`
- **Epic:** #13
- **Category:** Forms (LAYOUT primitive — composes Input / Select / Checkbox / …)
- **Author / Driver:** @fernandoseguim
- **State:** OPEN, `status: todo`, label `evolvability ♻️`

## Why

`FormLayout` was migrated to the new design system before three v0.1.0 gates landed:

1. Playground approval (Astro side-by-side) — process gate
2. Storybook coverage in **light + dark** — newly cross-cutting per Tech Task #125
3. Brand validation against Notion (source of truth) — newly cross-cutting

The cross-cutting infrastructure (Storybook light/dark toolbar PR #119, `axeInThemes` helper Tech Task #125, Notion MCP enablement PR #216, canonical status labels PR #215) is already on `main`. The delta for `FormLayout` is purely additive (DarkTheme story + extended tests + jest-axe matrix) — no behavioral changes to the component itself.

## What the component is today

Compound component at `ui_kit/components/form-layout/index.tsx` (~530 LOC) exposing:

- `FormLayout` root — `<form>` or `<div>` wrapper, with `variant` (`stacked` | `split` | `inline`) and `density` (`comfy` | `compact`) on context
- `FormLayout.Header` — `<header>` with `<h2>` + description + actions slot
- `FormLayout.Section` — `<section>` with `<h3>` + description + aside; renders 2-column grid on `split`
- `FormLayout.Row` — 12-col grid with responsive collapse to 1 col on `max-sm`
- `FormLayout.Field` — label + control + hint / error; auto-injects `id` / `aria-describedby` / `aria-invalid` / `invalid` into single child
- `FormLayout.Actions` — sticky-capable footer with align variants
- `FormLayout.Divider` — `<hr aria-hidden>`

Existing assets:

- `FormLayout.stories.tsx` (~215 LOC) — 5 stories: `Stacked`, `Split`, `Inline`, `WithErrors`, `CompactDensity`. **No `DarkTheme` story.** `color-contrast` rule already disabled in `parameters.a11y.config.rules` with a `WHY:` comment scoping the deferral to Plan #128 (`text-fg-muted` token).
- `form-layout.test.tsx` (~393 LOC, ~28 tests across 6 `describe` blocks). **No jest-axe coverage at all** — needs `axeInThemes()` matrix.
- `docs/src/pages/componentes/form-layout.astro` — Astro playground exists
- `docs/src/previews/form-layout.tsx` + `form-layout-live.tsx` — playground previews exist
- `__image_snapshots__/components/form-layout/` — visual baselines exist (Ubuntu-rendered)

## Notion context

AC-5 (Brand) requires fetching:

- [Branding root](https://www.notion.so/Branding-34536f91ebd280a69efacbadab3861c6)
- Subpages: Cores / Tipografia / Logomarca / Voz

To be done in Phase 5 (security/brand review) via `mcp__claude_ai_Notion__notion-fetch`. Surface NEW divergence only — known `--primary` divergence is already tracked under Plan #208.

## Unknowns / risks

- Coverage threshold for `form-layout.test.tsx`: must be ≥ 80% on file (DoD AC-4); current count is already ≥ 20, so adding axe-matrix tests + a few behavioral additions stays well above the bar
- Visual baseline regen: only triggered if visual output changes. The story-only addition (`DarkTheme`) produces a NEW snapshot, not a baseline change for existing stories — so the `regenerate-baselines` label is likely NOT needed; will verify in Gate 2
- Sibling worktrees in parallel: `208` (`--primary` divergence), `214` (Avatar closeout), `220` (DatePicker range). Isolate via `.worktrees/45-…` and `chore/45-…` branch
