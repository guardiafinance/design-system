# Issue #64 — Brief

- **Repo:** `guardiatechnology/design-system`
- **Type:** Tech Task (v0.1.0 DoD migration)
- **Epic (parent):** #13 — Catálogo `@guardia/design-system` v0.1.0
- **Category:** Overlays
- **Author:** @fernandoseguim
- **Labels (parent):** `evolvability ♻️`

## Summary

Migrate `EmptyState` to the `@guardia/design-system` v0.1.0 Definition of Done as a first-class component under `ui_kit/components/empty-state/`. EmptyState is currently missing from the migrated catalog (`docs/src/pages/index.astro` MIGRATED set), which leaves the Overlays category incomplete for v0.1.0.

## Why

The Overlays category of the v0.1.0 catalog is the densest set of patterns that surface non-blocking communication to the user: Dialog (Plan in flight by sister Athena #60), Alert (#56), Tooltip (just merged via #72 / ADR-007), Popover (#68 / ADR-005), Menu (#71 / ADR-006), and **EmptyState**. EmptyState is the canonical surface for "no results", "first-use", and "no data yet" states — without it, every consumer reinvents the centered icon + title + description + CTA pattern with hardcoded tokens, violating `lex-design-system-library`. The visual reference at `ux_references/ui_kits/components/EmptyState/` already encodes the expected anatomy (icon container with `--violet-50` background + `--violet-500` foreground, centered vertical stack, `sm | md | lg` size ladder, optional description, optional action slot). The migration brings that reference under the v0.1.0 DoD contract: semantic tokens only, CVA size variant, compound subcomponents, ≥ 20 behavioral tests with AC traceability, jest-axe AAA on `light` + `dark`, stories covering the matrix, Astro docs + live preview, and an entry in the MIGRATED set.

## What

A single composition-only `EmptyState` primitive (no Radix dependency — there is no overlay positioning, no focus management, no portal) under `ui_kit/components/empty-state/` exposing:

- `EmptyState` root (semantic `<div role="status">` for "no results" / "no data" states, with `aria-live="polite"` so screen readers announce when the empty state replaces content).
- Compound subcomponents (`EmptyState.Icon`, `EmptyState.Illustration`, `EmptyState.Title`, `EmptyState.Description`, `EmptyState.Actions`) following the Card precedent (PR #94+) — each carries a `data-slot` for styling/testing and is also exported as a named symbol (`EmptyStateIcon`, etc.) for consumers that prefer flat imports.
- CVA `size` variant `sm | md | lg` driving container padding (24/16 · 40/24 · 64/32) and the icon container size (42 · 56 · 72) — mirrors the legacy reference one-to-one.
- Semantic-token only surface: `bg-muted` + `text-fg-muted` for the icon container background, `text-fg` for title, `text-fg-muted` for description. **Zero hardcoded colors.** The legacy reference uses `--violet-50` / `--violet-500` directly; the v0.1.0 mapping resolves to `bg-muted` + `text-foreground` per the semantic palette established by the existing Popover, Menu, Tooltip migrations.
- Default centered layout (vertical flex, `items-center text-center`); description capped at a readable max-width (`max-w-prose`); actions slot stacks horizontally on `md`/`lg`, vertically on `sm`.

## Out of scope

- Custom illustration assets beyond what the consumer passes via `illustration` slot (the component renders the slot; it does not ship illustrations).
- Animations / transitions on mount.
- Specialized variants (`error-state`, `first-use`, `no-results`) — the consumer composes those by combining `EmptyState` with `Alert` / `Button` semantics.
- Tokens beyond what `EmptyState` strictly needs — no new color/spacing tokens are introduced.
- Refactorings of sibling components.

## Open Questions (resolved in Phase 3)

- Compound vs. single-component-with-slot-props? → Compound, mirroring Card / following the Tooltip 3-export precedent for discoverability.
- Should the root be `<section>`, `<div role="region">`, or `<div role="status" aria-live="polite">`? → Phase 3 will decide based on ARIA Authoring Practices for "empty / no results" surfaces.
- Is illustration a separate slot from icon, or one polymorphic `media` slot? → Two slots (`Icon` and `Illustration`) for explicit semantic distinction; consumers render exactly one.

## Notion context

None — EmptyState is a self-contained UI primitive scoped to the design-system library. No domain entity, no API contract, no event surface affected. Brand tokens (palette, typography) inherit from the canonical `lex-brand-*` mirrors; Notion does not override anything specific to EmptyState.

## Sibling precedents

- **ADR-005** — Popover v0.1.0 DoD (token contract + CVA size ladder).
- **ADR-006** — Menu consolidation (compound subcomponents + flat export parity).
- **ADR-007** — Tooltip v0.1.0 DoD (`accepted` from creation, semantic-token-only, two-rung typography ladder).
- **Card (PR #94+)** — composition-only precedent with `data-slot` markers and `as`-polymorphic root.

## Reference snapshot

- Playground: `ux_references/ui_kits/components/EmptyState/EmptyState.playground.html`
- Source: `ux_references/ui_kits/components/EmptyState/index.tsx`
- Styles: `ux_references/ui_kits/components/EmptyState/index.css`

API surface and visual must mirror the reference one-to-one except for the documented token remap (`--violet-50` → `bg-muted`, `--violet-500` → `text-foreground`).
