# Architecture — #56 `feat(alert): migrate Alert to v0.1.0 DoD`

Plan sub-issue: [#251](https://github.com/guardiatechnology/design-system/issues/251). ADR: [ADR-011](../../adr/ADR-011-alert-v0.1.0-dod-migration.md).

## Affected components

| Path | Change | Reason |
|------|--------|--------|
| `ui_kit/components/alert/index.tsx` | rewrite | New 6-export surface with CVA tone + size ladders, semantic tokens, ARIA, controlled/uncontrolled dismiss |
| `ui_kit/components/alert/Alert.test.tsx` | new | ≥ 20 behavioral tests with AC-N labels, `axeInThemes` |
| `ui_kit/components/alert/Alert.stories.tsx` | new | Default + Tones + Sizes + WithIcon + WithActions + WithClose + LongContent + DarkTheme |
| `ui_kit/styles/index.css` | extend `@theme inline` + dark override | Expose `--color-success(-soft/-fg)` etc. as Tailwind utility tokens AND add dark-theme overrides for `--success-soft` / `--warning-soft` / `--info-soft` / `--danger-soft` and a new family `--*-fg` — see ADR-011 |
| `docs/src/pages/componentes/alert.astro` | new | Docs page mirroring Tooltip layout |
| `docs/src/previews/alert.tsx` | new | Astro client-rendered preview rows |
| `docs/src/pages/index.astro` | edit | Add `"Alert"` to `MIGRATED` Set |
| `ui_kit/components/index.ts` | (no change) | Already re-exports `./alert` |
| `docs/adr/ADR-011-alert-v0.1.0-dod-migration.md` | new | Accepted status from creation |

## Public API surface (final shape)

```tsx
import {
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  AlertActions,
  AlertClose,
  alertVariants,
  type AlertTone,
  type AlertSize,
} from "@guardia/design-system";
```

Top-level `Alert` accepts:

| Prop | Type | Default | Source |
|------|------|---------|--------|
| `tone` | `"info" \| "success" \| "warning" \| "error"` | `"info"` | AC-3 |
| `size` | `"sm" \| "md" \| "lg"` | `"md"` | AC-6 |
| `assertive` | `boolean` | `false` | AC-5 |
| `open` | `boolean` | — (uncontrolled) | AC-12 |
| `defaultOpen` | `boolean` | `true` | AC-12 |
| `onOpenChange` | `(open: boolean) => void` | — | AC-13 |
| `className` | `string` | — | shadcn convention |
| `...divProps` | `React.HTMLAttributes<HTMLDivElement>` | — | shadcn convention |

Subcomponents are simple flex slots; no Radix Primitive needed (Alert is inline, not transient).

## Token model

Existing CSS variables in `ui_kit/styles/index.css` (light theme):

- `--success: var(--signal-green)` (#00BF63)
- `--success-soft: #D6F5E6`
- `--warning: var(--signal-yellow)` (#FFDE59)
- `--warning-soft: #FFF3CE`
- `--danger: var(--signal-red)` (#FF3131)
- `--danger-soft: #FFE0E0`
- `--info: var(--signal-blue)` (#004AAD)
- `--info-soft: #D9E3F7`

These are NOT exposed via `@theme inline`, so `bg-success-soft` / `text-info` etc. are not utility classes today. They also have **no dark-theme override** — `#D6F5E6` against gray-900 produces a banner that swamps the surface in eye-burning light tint while the white text remains illegible. This is the architectural decision: **expose + dark-overide the tone family** so Alert is a first-class semantic-token consumer.

ADR-011 records the decision. Concretely:

1. Under `@theme inline` (light theme):
   - `--color-success: var(--success)`
   - `--color-success-soft: var(--success-soft)`
   - `--color-success-fg` (new): readable foreground over `--success-soft` (dark green, AAA over #D6F5E6)
   - same for `warning`, `info`, `danger`
2. Under `:root[data-theme="dark"]`:
   - `--success-soft` → tinted dark-green surface (`color-mix(in oklab, var(--signal-green) 18%, var(--guardia-gray-800))`) so it remains a recognizable tone without blinding contrast against gray-900
   - `--warning-soft`, `--info-soft`, `--danger-soft` → analogous tinted dark surfaces
   - `--success-fg`, `--warning-fg`, `--info-fg`, `--danger-fg` → mono-white over the dark-tinted soft

This is a **semantic-token-only** path. No new hex literals appear in Alert's source — every color goes through the named token chain.

## Decision Checklist for Stacked PRs (codex-stacked-prs)

| Signal | Status |
|--------|--------|
| Multiple bounded contexts touched | ❌ no — single component |
| > 1500 LOC changed | ❌ no — ~1200 LOC including tests + stories |
| Independent layer reviewable in isolation | ❌ no — tone tokens + component + docs are atomic |
| Multiple specialist warriors needed | ❌ no — frontend only |
| Distinct deployable artifacts | ❌ no — single PR to `main` |

**0 high signals — single PR path, per the Decision Checklist default.** No `Stacked PR Decomposition` section needed.

## Delegation map

No specialist warriors invoked (Apollo not needed — frontend; Daedalus not needed — no REST API; Kronos not needed — no events; Atlas not needed — no infra). Athena drives Phase 4 directly given the small bounded scope (single component + token block + docs page).

## ADRs

- **[ADR-011 — Alert v0.1.0 DoD migration](../../adr/ADR-011-alert-v0.1.0-dod-migration.md)** — status `accepted` from creation. Records the tone-token expansion and dark-theme parity decision.

ADR-008 (PR #247 open), ADR-009 (merged), ADR-010 (Dialog Athena sister-dispatch — not touched).
