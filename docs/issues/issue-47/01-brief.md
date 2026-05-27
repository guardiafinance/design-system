# Phase 1 — Brief: chore(input): review Input for v0.1.0 DoD

> Thin pointer. The canonical scope lives in parent Issue #46 (chore) and Plan #47 (executable sub-issue). This brief frames what Athena is orchestrating.

## Source artifacts

| Source | Reference | Role |
|---|---|---|
| Parent Issue | [`guardiatechnology/design-system#46`](https://github.com/guardiatechnology/design-system/issues/46) | Why / What / How — playground approval closeout |
| Plan (executable) | [`guardiatechnology/design-system#47`](https://github.com/guardiatechnology/design-system/issues/47) | Step-by-step DoD checklist + single-PR contract |
| Brand source of truth | [Branding (Notion)](https://www.notion.so/Branding-34536f91ebd280a69efacbadab3861c6) | In divergence with local mirror, Notion prevails |
| Cross-cutting infra (already on `main`) | PR #119 (Storybook light/dark + Astro toggle), Tech Task #125 (`axeInThemes`), PR #215 (canonical status labels), PR #216 (Notion MCP) | Foundations — do not redo |

## Why (1-line summary from #46/#47)

Close the playground-approval, dark-mode coverage, and Brand-vs-Notion gaps for the `Input` primitive so it moves from `development` to `done` as part of v0.1.0. Input is foundational — DatePicker trigger, Combobox trigger, FormLayout fields, and FileUpload file-name display all compose it.

## What (scope summary)

Run the DoD checklist for `Input`, capturing explicit playground approval. Single PR per `lex-agent-planning`. The likely delta is **small** (story + test extensions), not a rewrite — Input already lives at `ui_kit/components/input/index.tsx`, has 23 passing behavioral tests including jest-axe in light + dark for default/error/success states, a playground page at `docs/src/pages/componentes/input.astro`, and is in the `MIGRATED` set.

**In-scope (delta):**
- Add `DarkTheme` story matrix to `Input.stories.tsx` (parity with Avatar/IconButton/ButtonGroup/Button/Checkbox/DatePicker/Combobox patterns).
- Extend `input.test.tsx` only where DoD gaps exist (controlled-vs-uncontrolled, `defaultValue`, `readOnly`, `required`, `maxLength`/`minLength`/`pattern`, `onBlur`/`onFocus`, `aria-describedby` wiring with description, additional `type` variants like `tel`/`url`/`search`, autocomplete, focus on `ref`). Use accessible queries.
- Extend jest-axe coverage to: empty + filled Default, with label, with description, disabled, readonly, type variants.
- Brand check via Notion MCP — surface only **new** divergence (the known `--primary`/`--ring` discussion is already routed to Plan #208).

**Out of scope (declared, not violations):**
- Token changes — `--primary`/`--ring` focus-state divergence belongs to Plan #208.
- Composer components (DatePicker, Combobox, FormLayout, FileUpload) — own Plans.
- Release / tag / changelog — owned by `warrior-janus`.
- Visual baselines regeneration — only if a `regenerate-baselines` label is added on the PR (Ubuntu/CI rendered, never from macOS).

## Pre-existing artifacts

- `ui_kit/components/input/index.tsx` — implementation, mature (CVA wrapper around native `<input>`; CVA variants `size` `sm|md|lg`, `state` `default|error|success`; `invalid` shortcut; `leftIcon`/`rightIcon`/`prefix`/`suffix` slots; ref forwarded to inner `<input>`; `focus-within` ring).
- `ui_kit/components/input/Input.stories.tsx` — 10 stories (Default, WithLeftIcon, WithRightIcon, WithPrefix, WithSuffix, PrefixAndSuffix, Sizes, States, Currency, SearchInput). **Missing `DarkTheme` matrix.**
- `ui_kit/components/input/input.test.tsx` — **23 passing tests** including jest-axe in light+dark (default with label, error+aria-invalid+aria-describedby, success). Already ≥ 20 threshold per DoD.
- `docs/src/pages/componentes/input.astro` — playground page with BasicRow, WithIconsRow, PrefixSuffixRow, SizesRow, StatesRow, DisabledRow, FormSubmitRow, live editor (`LiveInputSnippet`), Props table, A11y section, Source viewer. Input is in `MIGRATED` set (`docs/src/pages/index.astro`).
- Worktree-target: `.worktrees/47-input-v01-dod-closeout/` (Athena creates before delegating Phase 4).
- Sibling Plans in parallel (do not collide): #43 (FileUpload), #45 (FormLayout). All on separate worktrees.

## Special notes (memory pins applied)

- **PT-BR:** "teste de unidade" (never "teste unitário").
- **A11y obrigatório:** jest-axe in light + dark is an AC, not optional.
- **Visual baselines:** if needed, only via `regenerate-baselines` workflow (Ubuntu/CI); never commit baselines generated on macOS.
- **Release:** out of scope; tagging and release happen via `warrior-janus`.
- **Brand `--primary` divergence:** already routed to Plan #208 — Input uses `--primary`/`--ring` for focus ring; do not touch tokens here.
- **Input is a foundational primitive:** stay strictly within Input scope — do not refactor consumers (DatePicker, Combobox, FormLayout, FileUpload).
