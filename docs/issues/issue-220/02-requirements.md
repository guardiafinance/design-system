# Issue #220 — Requirements

## Definition of Done (DoD)

All acceptance criteria below MUST be covered by at least one automated test (per `lex-issue-driven` Rule 3 — bidirectional AC ↔ test traceability). Each test references the AC via `AC-{N}` in its `it(...)` description.

## Acceptance Criteria

### API surface

- **AC-1.** `DatePicker` accepts a new `mode` prop with values `"single" | "range"`. Default is `"single"`. Omitting `mode` produces byte-identical behavior to today's `DatePicker`.
- **AC-2.** When `mode="single"`, `value` is `Date | null | undefined` and `onChange` receives `Date | null`. When `mode="range"`, `value` is `DateRange | null | undefined` (`{ from: Date; to: Date }`) and `onChange` receives `DateRange | null`. The two shapes are mutually exclusive via TypeScript discriminated union.
- **AC-3.** `DateRange` type is re-exported from the package entry point (`@guardiatechnology/design-system`) so consumers can type their own state.

### Trigger display

- **AC-4.** With `mode="range"` and an empty value, the trigger renders the placeholder text (default `"dd/mm/aaaa — dd/mm/aaaa"`, customizable via `placeholder`).
- **AC-5.** With `mode="range"` and a complete range, the trigger renders `dd/mm/aaaa — dd/mm/aaaa` (em dash separator, both endpoints formatted by `formatDateBR`).
- **AC-6.** During partial selection (popover open, `from` clicked, `to` not yet), the trigger displays `dd/mm/aaaa — ` (em dash + space, `to` placeholder space preserved for layout stability).

### Selection behavior

- **AC-7.** Clicking a day with no `from` set commits it as `from`; popover stays open awaiting `to`. `onChange` does NOT fire on the intermediate partial state.
- **AC-8.** Clicking a second day after `from` is set commits the pair as `{ from, to }` (sorted ascending) and closes the popover. `onChange` fires once with the complete range.
- **AC-9.** When the user picks `to < from`, the values **auto-swap** before firing `onChange` (the smaller becomes `from`, the larger `to`). Rationale and rejected alternatives recorded in ADR-004.
- **AC-10.** Pressing `Esc` while in partial state (`from` set, `to` not) discards the partial selection (`from` resets to its prior committed value) and closes the popover. `onChange` does NOT fire.
- **AC-11.** Clicking the clear button (`X`) when a complete range is present fires `onChange(null)` and resets the internal state.

### Validation and bounds

- **AC-12.** `minDate` and `maxDate` are respected on **both** endpoints — neither `from` nor `to` may fall outside the bounds. Out-of-range days are visually disabled in the grid and cannot be selected (existing `react-day-picker` behavior, inherited per-mode).
- **AC-13.** The `invalid` prop applies `data-invalid="true"` to the trigger in range mode identically to single mode (asserted by existing brand-token contract — trigger uses `data-invalid` rather than ARIA `aria-invalid` per `jsx-a11y/role-supports-aria-props` constraint on `role="button"`; the a11y signal lives at the Field/Form layer via `aria-describedby` pointing to the error message).

### Stories (Storybook)

- **AC-14.** Six new stories exist under `Components/DatePicker` covering range mode: `RangeDefault`, `RangePreselected`, `RangePartialState`, `RangeWithMinMax`, `RangeDisabled`, `RangeDarkTheme`. Every story renders a `DatePicker` that has a default `aria-label` (`"Selecionar intervalo de datas"`) or explicit `aria-label`/wrapping `<label>` so axe `label` rule passes (per Plan #208 lesson — story-level inputs without accessible names trigger axe violations).

### Tests

- **AC-15.** `date-picker.test.tsx` adds ≥15 new test cases covering: AC-1 through AC-13 (one test per behavior, more for edge variants). Tests use `vi.setSystemTime(new Date("2026-05-15T12:00:00Z"))` in a `beforeEach` to freeze the clock for determinism (per `lex-test-isolation`).
- **AC-16.** A dedicated `axeInThemes(container)` block runs for range mode in 3 states: trigger empty (placeholder), trigger with complete range, popover open with range highlight. Light + dark themes both pass. Aligned with the Tech Task #125 mandatory AC and Fernando's `feedback_a11y_unit_test_ac.md` memory entry.

### Playground (docs site)

- **AC-17.** `docs/src/pages/componentes/date-picker.astro` adds a `Modo intervalo` section with static preview rows (`RangeBasicRow`, `RangePreselectedRow`, `RangeMinMaxRow`, `RangePartialPreviewRow`) wired from a new `docs/src/previews/date-picker-range.tsx`.
- **AC-18.** The existing `<LiveDatePickerSnippet>` is upgraded to the same `noInline` + `useState` interactive pattern used by `LiveCheckboxSnippet` (post PR #217) and a second snippet `<LiveDateRangeSnippet>` lives next to it for range scenarios — controlled state, dynamic counter showing the selected range span (`dd/mm/aaaa — dd/mm/aaaa (N dias)`), reset button.

### Brand and tokens

- **AC-19.** Range edges (`from`, `to`) use `bg-action` + `text-button-fg` (same tokens as single-mode `selected`). Interior range cells use a softer token (`bg-action/12` or `bg-bg-hover`) to signal continuity without overwhelming the grid. No hardcoded `guardia-violet-*` / `guardia-orange-*` literals; everything flows through brand-aware tokens so the post-#226 violet/orange inversion is honored automatically.
- **AC-20.** Brand-token guard tests assert positive token presence (`bg-action`, `text-button-fg`) and negative absence of legacy literals (`guardia-purple-500`, `guardia-violet-500`, hardcoded `text-white`) on range edges, mirroring the existing single-mode contract suite.

### Pipeline

- **AC-21.** All commands pass green: `npm run typecheck && npm run lint && npm run test && npm run build && npm run docs:build`. The vitest suite includes the new tests; tsc emits no errors against the discriminated-union types; eslint reports 0 errors; the package builds; the docs site builds.

### PR mechanics

- **AC-22.** PR carries the `regenerate-baselines` label so CI regenerates the Ubuntu-rendered visual snapshots (range edges and interior fill diverge significantly from the existing baselines). No `__image_snapshots__/` files committed from macOS local — Ubuntu/CI is the source of truth per `feedback_visual_regression_ubuntu_sot.md`.

## Traceability matrix

| AC | Test name (prefix) | Story | Notes |
|----|-------------------|-------|-------|
| AC-1 | `AC-1: mode default is "single"` | — | type-level + runtime check |
| AC-2 | `AC-2: range mode onChange shape` | — | controlled + uncontrolled |
| AC-3 | `AC-3: DateRange type exported` | — | type-only `expectTypeOf` |
| AC-4 | `AC-4: range placeholder rendered` | `RangeDefault` | |
| AC-5 | `AC-5: complete range trigger format` | `RangePreselected` | |
| AC-6 | `AC-6: partial state trigger format` | `RangePartialState` | |
| AC-7 | `AC-7: first click commits from` | — | |
| AC-8 | `AC-8: second click commits range and closes` | — | onChange fired once |
| AC-9 | `AC-9: auto-swap when to < from` | — | |
| AC-10 | `AC-10: Esc cancels partial selection` | — | |
| AC-11 | `AC-11: clear resets range to null` | — | |
| AC-12 | `AC-12: minDate / maxDate bound both endpoints` | `RangeWithMinMax` | |
| AC-13 | `AC-13: invalid applies data-invalid in range mode` | — | |
| AC-14 | — | (all 6 stories) | manual review + Storybook test runner where applicable |
| AC-15 | (≥15 new tests across the suite) | — | |
| AC-16 | `a11y: range states light + dark` | — | `axeInThemes` |
| AC-17 | — | docs site visual | static rows |
| AC-18 | — | docs site live snippet | manual review |
| AC-19 | `brand-aware tokens: range edges use bg-action` | — | + interior fill assertion |
| AC-20 | `brand-aware tokens: no hardcoded literals on range cells` | — | |
| AC-21 | — | CI pipeline | gate 2 verifies |
| AC-22 | — | PR label | applied manually |
