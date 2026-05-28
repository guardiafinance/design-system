# ADR-004 — DatePicker range mode via single component with discriminated-union props

- **Status:** accepted
- **Date:** 2026-05-28
- **Deciders:** Fernando Seguim
- **Plan:** [#220](https://github.com/guardiatechnology/design-system/issues/220) (extension of historical parent Tech Task [#40](https://github.com/guardiatechnology/design-system/issues/40), closed after PR #218)
- **Supersedes:** none. **Complements:** [ADR-002](ADR-002-hover-on-action-surfaces.md) (hover-on-action-surfaces, applies to range edges as well).

## Context

The current `DatePicker` (`ui_kit/components/date-picker/index.tsx`) supports only single-date selection via `react-day-picker`'s `mode="single"` and exposes `value: Date | null` / `onChange: (d: Date | null) => void`. Real-world Guardia use cases (mês de competência, períodos fiscais, janelas de conciliação, filtros de relatório) require **range** selection. Fernando flagged the gap during the v0.1.0 DoD review of PR #218 and explicitly chose option (b) — extend the same capability under parent #40.

Three design questions need explicit resolution before implementation begins:

1. **API shape.** Single `<DatePicker>` component with discriminated-union props gated by a `mode` prop, or a separate `<DateRangePicker>` component?
2. **Validation policy.** When the user picks `to < from` in the calendar grid, do we auto-swap the values or reject the selection with `aria-invalid`?
3. **Partial-state callback policy.** While the user has clicked `from` but not yet `to`, does `onChange` fire on the intermediate partial state, or only on the complete range (or explicit clear)?

This ADR locks all three. Plan #220's body recommended single-component with discriminated union; the other two were tagged as open in the Plan body. All three are decided here so Phase 4 can proceed without ambiguity.

## Decision 1 — Single component with discriminated-union props

Adopted: **single `<DatePicker>` component** gated by a new prop `mode: "single" | "range"` (default `"single"`). Types use a TypeScript discriminated union so `value` and `onChange` narrow correctly at the call site.

```typescript
interface DatePickerSingleProps {
  mode?: "single";
  value?: Date | null;
  onChange?: (date: Date | null) => void;
  // ...common props
}
interface DatePickerRangeProps {
  mode: "range";
  value?: DateRange | null;
  onChange?: (range: DateRange | null) => void;
  // ...common props
}
export type DatePickerProps = DatePickerSingleProps | DatePickerRangeProps;
```

### Rationale

The non-mode surface of the component is large and reusable across both shapes: trigger, popover, `react-day-picker` boot, locale, size, `minDate`/`maxDate`, `disabled`, `invalid`, `clearable`, `showToday`, `name` (hidden input), `aria-label`, focus management, the "Hoje" footer button, the brand-aware token classNames. Splitting into `<DatePicker>` and `<DateRangePicker>` would duplicate all of those — roughly 80% of the file — or force a shared internal `<DatePickerCore>` private component that both wrap. Either path produces more code, more test surface, and a worse import story (consumers must remember which component to import).

The discriminated-union approach keeps a single API entry point (`import { DatePicker } from "@guardiatechnology/design-system"`), reuses the entire trigger/popover machinery, and lets TypeScript narrow `value`/`onChange` per `mode` at zero runtime cost. The narrowing covers the realistic call-site ergonomics:

```typescript
<DatePicker value={singleDate} onChange={setSingleDate} />
// `value: Date | null | undefined`, `onChange: (d: Date | null) => void`

<DatePicker mode="range" value={range} onChange={setRange} />
// `value: DateRange | null | undefined`, `onChange: (r: DateRange | null) => void`
```

### Rejected alternatives

- **Separate `<DateRangePicker>` component.** ~80% code duplication or a shared private core; two import paths to remember; harder to discover ("does the DS have range support?"); changes that affect both modes (e.g., a token migration) must touch two files.
- **Single component with non-discriminated `value: Date | DateRange | null`.** Type narrowing is lost; consumers must runtime-check; misuse becomes easy ("I passed `Date` but the component is in range mode"). Discriminated union forces the call site to commit to a mode and gets TypeScript safety for free.
- **Default `mode="range"`.** Would be a silent breaking change for every existing `<DatePicker>` consumer. Default stays `"single"`; `range` is explicit opt-in.

### Backward compatibility

Every existing call site renders byte-identically. `mode` defaults to `"single"`; absent `mode`, the existing `value: Date | null` + `onChange: (d: Date | null) => void` types are preserved. Existing single-mode tests pass unchanged.

## Decision 2 — Auto-swap when `to < from`

Adopted: **auto-swap**. If the user picks a second day earlier than the first, the values are sorted ascending before `onChange` fires (`{ from: min, to: max }`). No `aria-invalid` flag, no rejection.

### Rationale

The user's intent when picking two dates in any order is "I want the range between these two". Forcing them to click again in the correct order to satisfy a `to >= from` invariant is hostile UX with no business benefit — the range itself is the same. Auto-swap matches what every mature date-range picker on the web does (Google Calendar, Linear, Notion, Stripe Dashboard). It also keeps the validation surface tight: the component never emits an invalid range, so consumers never have to defensively re-sort.

The `to >= from` invariant becomes a post-condition of `commit()` rather than a precondition of the click handler. ADR-004 makes the invariant explicit; the type `DateRange` carries the convention "`to >= from` always".

### Rejected alternatives

- **Reject with `aria-invalid`.** Hostile UX. Also requires deciding what state the component lands in (does `to` reset? does `from` reset? does both stay set with invalid flag?) — every answer is awkward.
- **Auto-swap silently AND fire `aria-invalid` for one render cycle.** Visual flicker. Confusing to assistive tech.

### Test surface

AC-9 asserts: user clicks `2026-06-20`, then `2026-06-10`; `onChange` fires once with `{ from: 2026-06-10, to: 2026-06-20 }`.

## Decision 3 — `onChange` does NOT fire on partial state

Adopted: **`onChange` fires only on a complete range or explicit clear**. While the user has clicked `from` but not yet `to`, the partial selection is held in internal `pendingRange` state and is **not** propagated to the consumer.

### Rationale

A consumer state like `const [range, setRange] = useState<DateRange | null>(null)` cannot represent a partial range (the `DateRange` type requires both `from` and `to`). Firing `onChange` with a partial value would force the type to widen (`{ from: Date; to?: Date }`), which:

- pollutes every consumer with optional `to` handling for a transient state they do not care about;
- breaks the post-condition guarantee from Decision 2 (`to >= from`);
- makes `onChange` fire twice per user interaction (once partial, once complete), which is a footgun for callers that submit on change (e.g., URL state, network request).

Holding the partial in internal state until the user commits the second pick is the standard pattern in mature pickers and matches consumer mental model: "the change happens when the range is done."

### Esc semantics

Pressing `Esc` while in partial state discards `pendingRange` (no `onChange`) and closes the popover. The previous committed range, if any, is restored. AC-10 asserts.

### Clear semantics

The `X` button fires `onChange(null)` immediately, regardless of partial state. Clearing is an explicit user intent. AC-11 asserts.

### Rejected alternatives

- **Fire `onChange` on partial state.** Forces `onChange` signature to `(range: DateRange | { from: Date } | null) => void` — type pollution, double-fire, breaks Decision 2's invariant.
- **Expose a separate `onPendingChange` callback.** Adds API surface for a transient state nobody consumes in practice. Documented as out-of-scope; can be added later as a follow-up Plan if a real use case surfaces.

## Brand tokens

Range edges (`from`, `to` cells) use **`bg-action` + `text-button-fg`** — the same tokens single-mode `selected` uses. This means the post-#226 brand inversion (violet light / orange dark) flows through to range mode automatically with zero additional changes.

Range middle cells use **`bg-bg-hover/60`** as a soft tint of the interior, with `text-fg` for the day number. Contrast remains ≥ 4.5:1 in both themes because both tokens belong to the same surface family.

Inner-corner rounding cancels between `range_start` (rounded-l, square-r) and `range_end` (rounded-r, square-l) so consecutive selected days read as a continuous bar. A single-day range (`from === to`) gets both classes applied — the cancellations net to a fully-rounded pill, identical to the single-mode `selected` style. No special case needed.

[ADR-002](ADR-002-hover-on-action-surfaces.md) (hover MUST NOT override `data-[state=checked]` / `selected: true` on `bg-action` surfaces) extends naturally to range edges — hovering a range-edge cell does not switch to a hover token; the solid edge stays stable. Same rule, broader surface.

## Consequences

### Backward-compat preserved

- Every existing `<DatePicker>` call site renders byte-identically (`mode` defaults to `"single"`).
- Existing single-mode tests pass unchanged.
- No new public exports beyond the `DateRange` type.

### New consumer behavior

- Range mode is a one-line opt-in: `<DatePicker mode="range" value={range} onChange={setRange} />`.
- `onChange` fires only on complete range or null. Documented prominently in the docs page Props notes.
- Auto-swap of `to < from`. Documented in the docs page Props notes.
- Trigger format `dd/mm/aaaa — dd/mm/aaaa` (em dash separator).

### Out of scope for this Plan (potential future work, not committed)

- Date presets ("last 7 days", "this month") — separate Plan if demanded.
- Multiple simultaneous ranges — separate Plan if a use case surfaces.
- Time picker inside the range (`DateTimeRangePicker`) — distinct capability.
- Internationalization of the `—` separator — assumes pt-BR default.
- Visual warning when range spans more than 1 year — separate Plan if needed.
- `onPendingChange` callback exposing partial state — re-evaluate if a real consumer need surfaces.

## Validation matrix — Plan #220 scope

- ≥21 new test cases (exceeds the ≥15 floor in Plan body) covering AC-1 through AC-13, AC-19, AC-20.
- 3 `axeInThemes(container)` blocks (range placeholder, range complete, range popover open) — light + dark — covering AC-16.
- 6 new stories (`RangeDefault`, `RangePreselected`, `RangePartialState`, `RangeWithMinMax`, `RangeDisabled`, `RangeDarkTheme`) covering AC-14.
- 4 new static preview rows + 1 upgraded interactive live snippet + 1 new range live snippet in the docs page covering AC-17, AC-18.
- Brand-token guard suite extended with positive (`bg-action`, `text-button-fg`) and negative (no `guardia-purple-500`, no `guardia-violet-500`, no hardcoded `text-white`) assertions on range cells.

## References

- [ADR-002](ADR-002-hover-on-action-surfaces.md) — hover-on-action-surfaces (applies to range edges).
- Plan [#220](https://github.com/guardiatechnology/design-system/issues/220) — this ADR's plan.
- Historical parent Tech Task [#40](https://github.com/guardiatechnology/design-system/issues/40) — closed retroactively after PR #218.
- Tech Task [#226](https://github.com/guardiatechnology/design-system/issues/226) — brand inversion light/dark (merged; range tokens consume the inverted `--primary`/`--action`).
- `lex-brand-colors` — palette and WCAG combination rules.
- `lex-frontend-accessibility` — WCAG 2.1 AA requirements (axe light + dark).
- `lex-test-isolation` — clock determinism via `vi.setSystemTime`.
- `react-day-picker` v9 docs — native `mode="range"` API, `range_start` / `range_end` / `range_middle` `classNames` slots.
