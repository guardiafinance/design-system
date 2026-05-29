# Requirements — #56 `feat(alert): migrate Alert to v0.1.0 DoD`

Plan sub-issue: [#251](https://github.com/guardiatechnology/design-system/issues/251).

## Acceptance Criteria

Each AC is referenced by `AC-N:` in the corresponding test, satisfying `lex-issue-driven` Rule 3 (bidirectional AC ↔ test traceability).

### Public API surface

- **AC-1** — `ui_kit/components/alert/index.tsx` exports the canonical 6-symbol public surface: `Alert`, `AlertIcon`, `AlertTitle`, `AlertDescription`, `AlertActions`, `AlertClose`. The CVA accessor `alertVariants` and the type aliases `AlertTone` and `AlertSize` are also exported.
- **AC-2** — `Alert` renders semantic HTML: the outer container is a `<div>` (not a `<button>` or other interactive role), with content rendered via JSX (no `dangerouslySetInnerHTML`), per `lex-frontend-security` and `lex-frontend-accessibility`.

### Tone matrix (info / success / warning / error)

- **AC-3** — `Alert` exposes a `tone` prop with the literal union `"info" | "success" | "warning" | "error"`. Default is `"info"`. Each tone applies the corresponding semantic background, border, and foreground classes (`bg-info-soft border-info text-info-fg` and analogues) — semantic tokens only, no hardcoded hex or `oklch(` per `lex-brand-colors` and `lex-design-system-library`.
- **AC-4** — Tone tokens render correctly in BOTH `light` and `dark` themes. The dark theme overrides `--info-soft`, `--success-soft`, `--warning-soft`, `--danger-soft` to readable surfaces against the gray-900 base; the tone borders (`--info`, `--success`, `--warning`, `--danger`) and foregrounds (`--info-fg`, `--success-fg`, `--warning-fg`, `--danger-fg`) meet WCAG AA against their respective soft surfaces.

### ARIA semantics

- **AC-5** — `Alert` accepts a `assertive?: boolean` prop. Default `false` renders `role="status"` (polite live region). `assertive={true}` renders `role="alert"` (assertive live region), per `lex-frontend-accessibility` Rule 6.2.

### Size ladder

- **AC-6** — `Alert` accepts a `size` prop with the literal union `"sm" | "md" | "lg"`. Default is `"md"`. The ladder mirrors Popover / Tooltip (p-2 / p-3 / p-4 padding, two-rung typography `text-xs` for `sm`, `text-sm` for `md` and `lg`).

### Composition

- **AC-7** — `AlertIcon` renders its children inside a leading flex slot (`shrink-0` width, top-aligned). When the consumer passes no `AlertIcon`, the layout collapses gracefully without empty whitespace.
- **AC-8** — `AlertTitle` is rendered as a `<div>` semantically labelled inside the alert region (via `aria-labelledby` wired by `Alert` when `AlertTitle` is present). Font weight is `font-medium` per the Tooltip / Popover header convention.
- **AC-9** — `AlertDescription` is rendered as a `<div>` with `text-sm leading-relaxed`. Multi-paragraph content (nested `<p>`) inherits the same line-height via the `[&_p]:leading-relaxed` selector.
- **AC-10** — `AlertActions` is a trailing flex slot aligned to the end of the alert. Consumers pass `<Button>` / `<IconButton>` children; the slot does not impose icon-only constraints.

### Dismiss surface

- **AC-11** — `AlertClose` renders an icon button (`X` icon) with `aria-label="Fechar"` (Portuguese) overridable via the `aria-label` prop, per `lex-frontend-accessibility` Rule 3.3 (icons that are buttons).
- **AC-12** — `Alert` supports controlled (`open` + `onOpenChange`) AND uncontrolled (`defaultOpen`) dismissal. When `open === false` (controlled) or after `AlertClose` is clicked (uncontrolled, `defaultOpen={true}`), the component unmounts the entire alert tree and stops rendering — equivalent to a `null` return.

### Behavior

- **AC-13** — `AlertClose` invokes `onOpenChange?.(false)` on click; in uncontrolled mode it also triggers internal unmount.
- **AC-14** — Keyboard navigation: `AlertClose` is reachable via `Tab` in DOM order, activatable via `Enter` or `Space`, per `lex-frontend-accessibility` Rule 2.

### Accessibility validation

- **AC-15** — `jest-axe` `axeInThemes` reports zero WCAG AA violations for the Default render across `light` AND `dark` themes.
- **AC-16** — `jest-axe` `axeInThemes` reports zero violations for each of the four tones (info / success / warning / error) across `light` AND `dark`.
- **AC-17** — `jest-axe` `axeInThemes` reports zero violations for the WithClose state across `light` AND `dark`.
- **AC-18** — `jest-axe` `axeInThemes` reports zero violations for the Assertive (`role="alert"`) state across `light` AND `dark`.

### Test rigor

- **AC-19** — `Alert.test.tsx` has at least 20 behavioral tests, all using accessible queries (`getByRole`, `getByLabelText`, `getByText`) per `lex-frontend-testing` Rule 2. `getByTestId` MUST NOT appear.
- **AC-20** — `Alert.test.tsx` does not mock internal collaborators. Mocks are restricted to boundary surfaces if any (none required for this component).

### Documentation

- **AC-21** — `docs/src/pages/componentes/alert.astro` and `docs/src/previews/alert.tsx` render sections Default, Tones, Sizes, WithClose, WithActions, LongContent, and Playground, mirroring the layout of the Tooltip page (ADR-007 precedent).
- **AC-22** — `Alert` is added to the `MIGRATED` Set in `docs/src/pages/index.astro` so the docs sidebar surfaces the new page.

### Build & quality gates

- **AC-23** — `npm run typecheck`, `npm run lint`, `npm run test`, `npm run build`, and `npm run docs:build` all succeed locally.
- **AC-24** — `docs/adr/ADR-011-alert-v0.1.0-dod-migration.md` exists with status `accepted` from creation, recording the tone-token expansion and dark-theme parity decision.

## Definition of Done

- Phase 4 implementation produces a single atomic signed commit on `feat/56-alert` with message `feat(alert): migrate to v0.1.0 DoD — info/success/warning/error tones, AlertClose, ADR-011 (#56)`, per `lex-small-commits`, `lex-conventional-commits`, and `lex-signed-commits`.
- PR body closes both `#56` (parent Tech Task) and `#251` (Plan sub-issue) on separate lines.
- Gate 2 (`kata-quality-gate`) returns `go`.
- `regenerate-baselines` label NOT auto-applied; visual review is Fernando-led.

## Out of scope

- `alert-dialog` primitive (separate component under `ui_kit/components/alert-dialog/`, untouched).
- Backwards-compatibility shim for the legacy `default | destructive` shadcn API: Alert is not in the `MIGRATED` Set yet, so no external consumer depends on the old surface. Wholesale replacement is safe.
- Refactoring of other components that may eventually consume Alert.
