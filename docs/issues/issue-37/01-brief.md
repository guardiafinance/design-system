# Phase 1 — Brief: Plan #37 (Checkbox v0.1.0 DoD review)

## Issue identity

- **Plan sub-issue:** #37 — `Plan: review Checkbox against v0.1.0 DoD`
- **Parent Issue:** #36 — `chore(checkbox): review Checkbox for v0.1.0 DoD (playground approval)`
- **Epic:** #13 (v0.1.0)
- **Type:** Plan (sub-issue) / Tech Task (parent)
- **Category:** Forms
- **Author / Assignee:** @fernandoseguim
- **Repository:** `guardiatechnology/design-system`
- **Status (entry):** `status: todo` + `evolvability ♻️`

## Context

`Checkbox` migrated to the new component layout **before** the v0.1.0 DoD criteria (playground approval, Storybook light + dark coverage, Brand × Notion verification, ≥ 20 behavioral tests with jest-axe light + dark via `axeInThemes`) were finalized. Plan #37 closes the gap so the component can transition from `status: development` to `status: done` as part of v0.1.0.

## Cross-cutting infra already on `main` (do not redo)

| Capability | Source |
|---|---|
| Storybook light/dark toolbar via `globalTypes` + `decorators` | PR #119 (Avatar) |
| Astro playground cross-iframe theme toggle | PR #119 |
| `ui_kit/test-utils/a11y.ts::axeInThemes` helper | Tech Task #125 |
| Notion MCP enabled in `mcp.servers` | PR #216 (chore/213) |
| Canonical `status:` labels (`to review`, `done`, `to release`) | PR #215 (chore/211) |
| Visual baselines Ubuntu/CI as SoT (label `regenerate-baselines`) | PR #199 + #194 |

## Sibling Plans in flight (do not touch their scope)

| PR / Plan | Status | Note |
|---|---|---|
| PR #205 (IconButton) | `status: to review` | Same DarkTheme-only delta pattern; mirror its PR body shape |
| PR #206 (ButtonGroup) | `status: to review` | Same pattern |
| PR #209 (Button) | `status: to review` | Same pattern |
| Plan #214 (Avatar #16 closeout) | `status: todo` | Awaiting Fernando manual gates |
| Plan #208 (Brand inversion `--primary`/`--secondary`) | `status: todo` | Owner of the known Brand × Notion divergence |
| Plan #39 (Combobox), Plan #41 (DatePicker) | parallel sessions | Isolated worktrees |

## Known Brand × Notion divergence (route to #208 — do NOT fix here)

- **Notion (canonical)**: `Branding → Cores → Aplicação em botões e ações`:
  - **Primário (light)** = Violeta 500 (#4f186d) + Branco — contrast 7.85:1 AAA
  - **Foco (anel) primário** = Laranja 500 (#e07400)
  - In dark mode the hierarchy inverts (laranja becomes the action color)
- **Current local tokens**: `--primary` and `bg-action` resolve to laranja in light mode (the inverse of Notion's canonical light-mode CTA mapping)
- **Routing**: dedicated Tech Task **#207** / Plan **#208** owns the token inversion. Per the brief and per `lex-agent-focus-on-active-plan`, **Plan #37 does NOT modify token mapping**; it references #208 in the architecture doc and PR body.

For Checkbox specifically the `bg-action` / `border-action` / `text-button-fg` triplet shows up on the checked/indeterminate state — the same divergence surface. Documented in Phase 3, not re-addressed.

## Unknowns

- None blocking. The DoD criteria are literal in the Issue body; current Checkbox state is inspectable directly.

## Notion sources consulted (Phase 1)

| Page | URL |
|---|---|
| Branding (overview) | https://www.notion.so/Branding-34536f91ebd280a69efacbadab3861c6 |
| Cores | https://www.notion.so/34536f91ebd28142a3f1e0e58fd62c4b |

## Next phase

Phase 2 — formalize the 10 numbered ACs from the Plan body into the canonical AC-N table for traceability.
