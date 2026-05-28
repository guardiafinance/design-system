# Issue #220 — Architecture

## Decision summary

Adopt **single `<DatePicker>` component with discriminated-union props** gated by a new `mode: "single" | "range"` prop (default `"single"`). Eunomia's recommendation in the Plan body is adopted as-is. Full trade-off recorded in **[ADR-004](../../adr/ADR-004-datepicker-range-discriminated-union.md)**.

Three sub-decisions are also locked in ADR-004:

1. **API shape** — single component vs separate `<DateRangePicker>` → single component (discriminated union).
2. **Validation policy** — `to < from` auto-swaps (not rejects) before `onChange` fires.
3. **Partial-state callback policy** — `onChange` does NOT fire on partial selection; only on a complete range or explicit clear.

## Affected components (scope table)

| File | Change | Reason |
|------|--------|--------|
| `ui_kit/components/date-picker/index.tsx` | Refactor → discriminated-union types; add `mode` prop; add `DateRange` type; thread `mode` to `<DayPicker>`; add `formatRangeBR`; rewrite `pick`/`commit` for range semantics; partial-state internal `useState` for `pendingRange` | Core API extension |
| `ui_kit/components/date-picker/date-picker.test.tsx` | Add ≥15 new test cases (AC-1 through AC-13) + 3 `axeInThemes` blocks for range states; preserve all existing single-mode tests | AC-15, AC-16, AC-20 |
| `ui_kit/components/date-picker/DatePicker.stories.tsx` | Add 6 stories: `RangeDefault`, `RangePreselected`, `RangePartialState`, `RangeWithMinMax`, `RangeDisabled`, `RangeDarkTheme` — every story has explicit `aria-label` to avoid the Plan #208 axe `label` trap | AC-14 |
| `ui_kit/index.ts` (or equivalent barrel) | Re-export `DateRange` type | AC-3 |
| `docs/src/previews/date-picker-range.tsx` (new) | `RangeBasicRow`, `RangePreselectedRow`, `RangeMinMaxRow`, `RangePartialPreviewRow` static rows for the docs page | AC-17 |
| `docs/src/previews/date-picker-range-live.tsx` (new) | `<LiveDateRangeSnippet>` — `noInline` + `useState` interactive snippet mirroring `LiveCheckboxSnippet` pattern; dynamic counter `dd/mm/aaaa — dd/mm/aaaa (N dias)` + reset | AC-18 |
| `docs/src/previews/date-picker-live.tsx` | Upgrade existing `<LiveDatePickerSnippet>` to the `noInline` + `useState` interactive pattern (parity with Checkbox post #217) | AC-18 |
| `docs/src/pages/componentes/date-picker.astro` | Add `Modo intervalo` section with the 4 static rows + `<LiveDateRangeSnippet>` block; extend Props table with `mode`, `DateRange` shape, range-specific notes | AC-17, AC-18 |
| `docs/issues/issue-220/01-brief.md` | Phase 1 artifact | issue-driven flow |
| `docs/issues/issue-220/02-requirements.md` | Phase 2 artifact | issue-driven flow |
| `docs/issues/issue-220/03-architecture.md` | Phase 3 artifact (this file) | issue-driven flow |
| `docs/issues/issue-220/05-security-review.md` | Phase 5 artifact | issue-driven flow |
| `docs/issues/issue-220/06-quality-report.md` | Phase 6 artifact | issue-driven flow |
| `docs/adr/ADR-004-datepicker-range-discriminated-union.md` | New ADR — single-component vs separate, auto-swap, partial-onChange policy | `lex-issue-driven` Rule 4 |

**Out of scope (no edits to these files):** every other component under `ui_kit/components/`, every other doc page under `docs/src/pages/componentes/`, every other test file, every other ADR, every Lexis/Codex/Kata/Warrior under `.claude/` or `.ahrena/framework/`.

## Type design — discriminated union

```typescript
export interface DateRange {
  from: Date;
  to: Date;
}

interface DatePickerCommonProps {
  placeholder?: string;
  size?: "sm" | "md" | "lg";
  minDate?: Date;
  maxDate?: Date;
  disabled?: boolean;
  invalid?: boolean;
  clearable?: boolean;
  showToday?: boolean;
  name?: string;
  id?: string;
  className?: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  "aria-label"?: string;
}

interface DatePickerSingleProps extends DatePickerCommonProps {
  mode?: "single";
  value?: Date | null;
  defaultValue?: Date | null;
  onChange?: (date: Date | null) => void;
}

interface DatePickerRangeProps extends DatePickerCommonProps {
  mode: "range";
  value?: DateRange | null;
  defaultValue?: DateRange | null;
  onChange?: (range: DateRange | null) => void;
}

export type DatePickerProps = DatePickerSingleProps | DatePickerRangeProps;
```

The `mode` field is the discriminant. Inside the component body, a narrowed `if (props.mode === "range")` block handles the range-only logic; everything else stays in the common path. TypeScript correctly narrows `value`/`onChange` at the call site without runtime overhead.

**Why `mode` is optional on Single and required on Range:** if both were optional with `"single"` as the default, the union would degrade to the broader signature on the consumer side. Making `mode: "range"` required for the range variant forces explicit opt-in and preserves narrowing.

## Component internal state

```
isControlled         derived from `value !== undefined`
internal             local state, type depends on `mode`
pendingRange         range-only — { from: Date; to?: Date } | null
                     tracks the partial selection between first and second click
                     reset on Esc or popover close without commit
viewMonth            unchanged — pivots on `current` (single) or `current.from` (range)
```

On second click in range mode:
1. Compute `next = sortAscending(pendingRange.from, clickedDate)`.
2. Clear `pendingRange`.
3. `commit(next)` → fires `onChange(next)` if it changed, closes popover.

On Esc with `pendingRange != null`:
1. Clear `pendingRange` (no onChange).
2. Close popover.

On clear button:
1. `commit(null)` (or `commit(null as Date | null)` for single, `commit(null as DateRange | null)` for range — single internal helper, branch on mode).

## Trigger format

```
formatTriggerValue(props.mode, current, pendingRange):
  if mode === "single":
    return current ? fmtBR(current) : placeholder
  // range:
  if pendingRange?.from && !pendingRange?.to:
    return `${fmtBR(pendingRange.from)} — `
  if current?.from && current?.to:
    return `${fmtBR(current.from)} — ${fmtBR(current.to)}`
  return placeholder ?? "dd/mm/aaaa — dd/mm/aaaa"
```

A new exported helper `formatRangeBR(range: DateRange | null | undefined): string` mirrors `formatDateBR` and produces `"dd/mm/aaaa — dd/mm/aaaa"`. Useful for consumers that need to render the selected range outside the trigger.

## DayPicker bridge

The existing single-mode block:

```tsx
<DayPicker mode="single" selected={current ?? undefined} onSelect={pick} ... />
```

becomes a discriminated render:

```tsx
{props.mode === "range" ? (
  <DayPicker
    mode="range"
    selected={pendingRange ?? current ?? undefined}
    onSelect={pickRange}
    ...
  />
) : (
  <DayPicker mode="single" selected={current ?? undefined} onSelect={pick} ... />
)}
```

`react-day-picker` v9 ships native `mode="range"` support — no custom range-grid logic needed. The library's own `classNames` slots for range edges and middle cells are extended via the existing `classNames={{ ... }}` object:

```
range_start:   "[&_button]:bg-action [&_button]:text-button-fg [&_button]:rounded-l-md [&_button]:rounded-r-none"
range_end:     "[&_button]:bg-action [&_button]:text-button-fg [&_button]:rounded-r-md [&_button]:rounded-l-none"
range_middle:  "bg-bg-hover/60 [&_button]:bg-transparent [&_button]:text-fg [&_button]:rounded-none"
```

Where:
- `range_start` / `range_end` reuse the existing `selected` token recipe (`bg-action` + `text-button-fg`), so the post-#226 brand inversion (violet light / orange dark) flows through automatically per AC-19.
- `range_middle` uses `bg-bg-hover/60` on the gridcell wrapper — soft surface tint compatible with both themes, contrast of the day number against it stays ≥ 4.5:1 because the day text remains `text-fg` (matched to the same surface family).
- Edge cells lose the round-corner on the inner side so consecutive selected days read as a continuous bar rather than as discrete pills.

**Single-day range** (`from === to`): both `range_start` and `range_end` apply; with the inner-corner rules cancelling out, the cell renders as the standard rounded selected pill. No special case needed.

## Validation flow

```
commit(next: DateRange | null):
  if next === null:
    clearInternal; onChange?.(null); return
  // next.to >= next.from invariant guaranteed by sortAscending
  if minDate && next.from < minDate: ignore (DayPicker disables, click is no-op)
  if maxDate && next.to > maxDate: ignore (DayPicker disables, click is no-op)
  setInternal(next); onChange?.(next)
```

The bounds check is defensive — `react-day-picker`'s native `disabled` matcher already prevents clicks on out-of-range days, so this is belt-and-suspenders. AC-12 is asserted via a test that sets `minDate`/`maxDate` and verifies that out-of-range days carry the `disabled` style and clicking them is a no-op.

## Brand tokens (per AC-19)

All range visual tokens consumed from `ui_kit/styles/index.css`:

| Surface | Token | Light | Dark |
|---------|-------|-------|------|
| Edge bg | `bg-action` | violet-500 | orange-500 (post-#226) |
| Edge fg | `text-button-fg` | white | mono-black |
| Middle bg | `bg-bg-hover/60` | gray-100/60 | gray-700/60 (theme-derived) |
| Middle fg | `text-fg` | mono-black | white |

No hardcoded `guardia-violet-*`, `guardia-orange-*`, `text-white`, `bg-violet-500` literals on range cells. AC-20 asserts via regex on the rendered `className` strings in the same brand-aware contract suite used for single-mode tests.

## Test plan

| Block | Tests added | Coverage |
|-------|-------------|----------|
| `formatRangeBR` unit | 3 | complete range / null / undefined |
| `DatePicker range mode — API surface` | 3 | AC-1, AC-2, AC-3 |
| `DatePicker range mode — trigger display` | 3 | AC-4, AC-5, AC-6 |
| `DatePicker range mode — selection` | 5 | AC-7, AC-8, AC-9, AC-10, AC-11 |
| `DatePicker range mode — validation` | 2 | AC-12, AC-13 |
| `DatePicker range mode — brand tokens` | 2 | AC-19, AC-20 |
| `DatePicker range mode — a11y` | 3 | AC-16 (`axeInThemes` light + dark) |
| **Total new** | **≥21** | exceeds the ≥15 floor in the Plan body |

Clock determinism: `beforeEach(() => vi.setSystemTime(new Date("2026-05-15T12:00:00Z")))` + `afterEach(() => vi.useRealTimers())` at the top of the new range `describe` block. `viewMonth` and "Hoje" button outputs become deterministic across local dev and CI.

## Pipeline impact

| Command | Expected delta |
|---------|---------------|
| `npm run typecheck` | tsc compiles new discriminated-union; no errors. |
| `npm run lint` | eslint clean. No new `no-restricted-imports` violations. |
| `npm run test` | suite gains ≥21 new test cases, existing single-mode tests untouched. |
| `npm run build` | rslib build adds `DateRange` to the type bundle; no runtime size impact beyond `react-day-picker`'s native range support (already in v9 bundle). |
| `npm run docs:build` | Astro build picks up new astro section + new previews. |

**Visual snapshots:** range stories will produce new image snapshots; existing single-mode snapshots stay byte-identical because the single path is unchanged. The PR applies the `regenerate-baselines` label so CI regenerates the Ubuntu-rendered baselines (per AC-22 and `feedback_visual_regression_ubuntu_sot.md`).

## Risks

| Risk | Likelihood | Mitigation |
|------|-----------|-----------|
| `react-day-picker` v9 range API edge case (e.g., `selected: { from }` without `to` not accepted as input) | low | DayPicker accepts `{ from }` shape natively for partial state; verified against type definition. If pendingRange shape is rejected, fall back to a custom local-state shape passed as `selected={undefined}` during partial state and use `modifiers={{ rangeStart, rangeEnd, rangeMiddle }}` for visual highlight. |
| Range edge CSS conflict with DayPicker's own range slots | low | We override via `classNames={{ range_start, range_end, range_middle }}`. If a styling conflict surfaces in a story, the override wins because `classNames` are applied at the slot level. |
| Trigger format `dd/mm/aaaa — dd/mm/aaaa` overflows the small trigger size | medium | The trigger already uses `overflow-hidden text-ellipsis whitespace-nowrap`. For `size="sm"` (h-8, narrow popover) the range string truncates with ellipsis; consumers needing the full text can rely on `aria-label` or render the range alongside via `formatRangeBR`. Documented in the astro page Props notes. |
| `onChange` partial-state callback policy diverges from consumer expectations | medium | ADR-004 locks the decision (fires only on complete range or clear); docs page Props notes call it out explicitly. |
| Visual baseline churn on `__image_snapshots__/` | high | Apply `regenerate-baselines` label on PR. macOS-local snapshots NOT committed (gitignored from local generation via CI-only workflow). |

## Open questions resolved by ADR-004

| Question | Decision | Where |
|----------|----------|-------|
| Single component vs separate `<DateRangePicker>` | Single component, discriminated union | ADR-004 §1 |
| Auto-swap when `to < from` vs reject | **Auto-swap** | ADR-004 §2 |
| `onChange` fires on partial state | **No** — only complete range or null | ADR-004 §3 |

## Gate 1 approval check (auto-acknowledged)

Scope matches Eunomia's canonical Plan body line-by-line (single-component, discriminated union, ≥15 tests, 6 stories, axe light+dark, brand-aware tokens, pipeline green, baselines via label). No structural divergence from the Plan body; Athena proceeds to Phase 4 per Athena warrior's auto-ack rule "if scope matches Eunomia's Plan body, auto-ack". Logged for traceability.

## Stacked PR decomposition (Decision Checklist consult)

Consulted `codex-stacked-prs` Decision Checklist against this scope:

- Single bounded surface (DatePicker component only). ❌ not multi-layer.
- Total diff estimate `size/M`-ish to `size/L` (≤500 lines code + ≤300 lines tests + ≤200 lines stories/previews/docs + ~100 lines ADR + ~150 lines phase docs). ❌ not above the layering threshold.
- No new package boundary, no new export surface beyond `DateRange`. ❌ no isolation gain from splitting.
- ADR-004 must land alongside the implementation for traceability. ❌ splitting ADR from implementation introduces a window of "ADR accepted, code missing".

**Conclusion:** single PR. Decomposition not approved. Athena routes Phase 7 to `kata-contributing-pr` (single PR path), not `kata-stacked-pr-create`.
