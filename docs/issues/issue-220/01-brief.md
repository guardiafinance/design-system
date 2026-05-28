# Issue #220 — Brief

- **Repo:** `guardiatechnology/design-system`
- **Type:** Plan sub-issue (Feature extension)
- **Parent (historical):** #40 (closed retroactively after PR #218 merged the v0.1.0 DoD review for DatePicker)
- **Author:** @fernandoseguim
- **Labels:** `evolvability ♻️`, `feature request ➕`, `status: development`

## Summary

Add `mode="range"` support to the `DatePicker` component so consumers can capture date intervals (mês de competência, períodos fiscais, janelas de conciliação, filtros de relatório) without duplicating logic at the call site. Default `mode="single"` preserves byte-identical backward compatibility for every existing call site.

## Why

Real-world accounting and financial use cases on the Guardia platform consistently require **range selection**, not just single-date picking:

- **Contabilidade**: mês de competência, períodos fiscais (data inicial → data final).
- **Relatórios financeiros**: filtro de intervalo de transações (extratos, lançamentos, conciliações).
- **Conciliação bancária**: janelas de busca por período (e.g., "transações de 01/03 a 31/03").
- **Operacional**: filtros temporais em listagens, dashboards, exports.

The current `DatePicker` (`ui_kit/components/date-picker/index.tsx`) uses `mode="single"` from `react-day-picker` and exposes only `value: Date | null` / `onChange: (d: Date | null) => void`. None of the above flows is covered without consumer-side duplication. Fernando flagged the gap during the v0.1.0 DoD review of PR #218 and explicitly chose option (b) — treat as an extension of the same capability under parent #40.

## What

A single `DatePicker` component with discriminated-union props gated by a new `mode` prop:

- `mode="single"` (default) → `value: Date | null`, `onChange: (d: Date | null) => void` (unchanged).
- `mode="range"` → `value: DateRange | null` (`{ from: Date; to: Date }`), `onChange: (r: DateRange | null) => void`.

Trigger format `dd/mm/aaaa — dd/mm/aaaa` when both ends are set; placeholder when empty; partial display `dd/mm/aaaa — ` when only `from` is committed mid-selection. Calendar grid highlights the full span with end-cap treatment (rounded corners on `from`/`to`, contiguous interior fill). Validation: `to >= from`, both endpoints respect `minDate`/`maxDate`, `data-invalid` flag surfaces via the trigger.

## Out of scope

- Multiple simultaneous ranges (single range only).
- Date presets ("last 7 days", "this month") — separate Plan if demanded.
- Internationalization of the `—` separator (assumes pt-BR default).
- Time picker inside the range (`DateTimeRangePicker` is a distinct capability).
- Visual warning for ranges spanning more than 1 year (separate Plan if needed).

## Open Questions (resolved in ADR-004 during Phase 3)

- Auto-swap when `to < from`, or reject with `aria-invalid`?
- Does `onChange` fire on partial state (only `from` set)?
- Should we use a single component with discriminated-union props, or a separate `<DateRangePicker>` component?

## Notion context

None — DatePicker range is a self-contained UI primitive scoped to the design-system library. No domain entity, no API contract, no event surface affected.

## Plan reference

- Local cache: `.claude/plans/plan-220-date-picker-range-mode.md` (gitignored)
- Canonical body: GitHub Issue [#220](https://github.com/guardiatechnology/design-system/issues/220)
