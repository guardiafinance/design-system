# ADR-007 — Migrate Tooltip to v0.1.0 DoD (Overlays parity)

- **Status:** accepted
- **Date:** 2026-05-28
- **Deciders:** @seguim (CODEOWNER), `warrior-athena` (Issue-Driven flow orchestrator)
- **Precedent:** ADR-005 (Popover v0.1.0 DoD migration)
- **Issue:** [#72](https://github.com/guardiatechnology/design-system/issues/72)
- **Plan:** [#73](https://github.com/guardiatechnology/design-system/issues/73)

## Context

The design-system has rolled out the v0.1.0 Definition of Done across the Overlays category — Popover (ADR-005, PR #237 merged), Combobox, Select. Tooltip is the last legacy holdout. The current `ui_kit/components/tooltip/index.tsx` is a 60-line shadcn-style wrapper around `@radix-ui/react-tooltip` that uses legacy palette tokens (`bg-popover`, `text-popover-foreground`, `border-border`) and ships no size ladder. Its test suite has ~ 6 tests, the storybook entry has one story, and there is no jest-axe coverage on dark theme.

The v0.1.0 DoD (codified in `02-requirements.md`) requires every Overlays primitive to expose: 3-export shadcn composition (`Tooltip` + `TooltipTrigger` + `TooltipContent`), CVA size ladder `sm | md | lg` (8/12/16px padding rung; two-rung typography xs/sm), semantic tokens only (`bg-background` + `text-fg` + `border-border-strong` + `shadow-md` + `ring`), arrow visible by default, controlled / uncontrolled parity, SSR safety, jest-axe AAA on `light` AND `dark` for Default + open + disabled, 32+ unit tests with AC traceability, and stories covering sides × sizes × disabled × controlled × long-content × delays.

## Decision

Tooltip migrates to v0.1.0 DoD using **the same architectural recipe as Popover (ADR-005)**:

1. **3-export shadcn composition + `TooltipProvider` escape hatch** — `Tooltip`, `TooltipTrigger`, `TooltipContent` are the canonical composition. `Tooltip` mounts an implicit Provider with the consumer-supplied `delayDuration` / `skipDelayDuration` / `disableHoverableContent`, so the 3-export path is sufficient for every standard call site. `TooltipProvider` is additionally exported as the **escape hatch** for consumers that need app-tree control of the Provider — typical cases are (a) grouped tooltips sharing one `delayDuration` / `skipDelayDuration` rhythm (e.g., `Sidebar` lighting up multiple hint tooltips on the same fast delay), (b) explicit SSR-sensitive composition where the host wants a single ancestral Provider instead of N implicit ones, (c) custom global delay control per route. Consumers that do not need any of these never have to import `TooltipProvider`. Radix tolerates nested Providers; when an ancestor Provider is present, the descendant `Tooltip`'s implicit Provider still mounts but Radix resolves to the nearest Provider for delay semantics. ([Radix Tooltip Provider docs](https://www.radix-ui.com/primitives/docs/components/tooltip#provider))
2. **CVA size ladder** — `sm` = `p-2 gap-2 text-xs`, `md` = `p-3 gap-3 text-sm` (default), `lg` = `p-4 gap-4 text-sm`. Two-rung typography (no `text-base` for `lg` — tooltip max-width / readability concerns).
3. **Semantic tokens only** — content surface = `rounded-md border border-border-strong bg-background text-fg shadow-md ring-1 ring-ring/5`. No `bg-popover`, no `text-popover-foreground`, no `border-border`, no hardcoded hex, no `oklch(`. The arrow consumes `fill-background stroke-border-strong`.
4. **Radix prop pass-through** — `delayDuration`, `skipDelayDuration`, `disableHoverableContent` on `Tooltip`; `side`, `align`, `sideOffset`, `collisionPadding`, etc. on `TooltipContent`. The only addition beyond the Radix surface is `withArrow?: boolean` (default `true`) on `TooltipContent`.
5. **SSR strategy** — closed state always renders; forced-open state does not throw (Radix portal may be empty server-side, no shim).
6. **A11y coverage** — `expectNoA11yViolations` runs Default + Open + Disabled across `light` AND `dark` themes (5 jest-axe invocations).
7. **ADR status `accepted` from creation** — no `proposed → accepted` flip at Phase 7. The atomic feat commit carries the migration code AND the accepted ADR together (avoids the dual-commit pattern flagged 🟡 by Argos on PR #237).

## Consequences

### Positive

- Tooltip reaches parity with the rest of Overlays — same composition shape, same token vocabulary, same test rigor.
- Consumers importing `<Tooltip>` from `@guardia/design-system` get predictable surface across all four overlays.
- Legacy `bg-popover` / `text-popover-foreground` are retired from this component (one fewer holdout when those tokens are eventually removed from `tailwind.config`).
- AC↔test traceability matrix produced at Gate 2 inherits the Popover format (review burden is small).

### Negative

- Existing consumers that previously imported `TooltipProvider` from `@radix-ui/react-tooltip` directly should migrate to the barrel re-export (`@guardia/design-system`) to satisfy `lex-design-system-library`. The Provider remains a one-line escape hatch; the migration is mechanical (change the import path, no API surface change).
- Visual baseline regeneration (CI under `regenerate-baselines` label) is a manual ceremony, not avoidable.

### Neutral

- One file rewrite, 4 test+story file rewrites, 1 ADR addition. No new dependencies, no Tailwind config changes, no infra changes.

## Alternatives considered

1. **Keep the legacy tokens, only add CVA sizes** — rejected. Half-migrations create more debt; the v0.1.0 DoD is an all-or-nothing contract per Plan #73.
2. **Hide `TooltipProvider` entirely behind the implicit-only Provider** — rejected. The implicit-Provider strategy makes the 3-export path sufficient for every standard call site, but it removes the explicit Provider as an escape hatch for apps that legitimately need app-tree control of delay semantics (e.g., `Sidebar` sharing one `delayDuration` across a cluster of hint tooltips, custom per-route delays, or SSR-sensitive composition where a single ancestral Provider is preferable to N implicit ones). The Radix Tooltip Provider is the canonical surface for that control; hiding it would force consumers to reach into `@radix-ui/react-tooltip` directly, which (a) bypasses the design-system barrel that `lex-design-system-library` mandates, (b) couples consumer code to the underlying Radix package version, (c) creates an inconsistency with `Sidebar`'s existing consumption pattern. Exporting `TooltipProvider` adds one named symbol to the barrel and preserves the 3-export composition as the canonical path while keeping the escape hatch idiomatic and discoverable.
3. **Bump `lg` to `text-base`** — rejected. Tooltips with `text-base` overflow at the natural max-width on mobile; AC-10 freezes a two-rung typography ladder.
4. **Stack PRs** — rejected. Decision Checklist (codex-stacked-prs) returns 1 high signal + 3 strong anti-signals → single PR per the precedent.

## References

- ADR-005 — Popover v0.1.0 DoD migration (precedent)
- PR [#237](https://github.com/guardiatechnology/design-system/pull/237) — Popover migration (merged, sets the playbook)
- `lex-design-system-library` — mandatory consumption of design-system primitives
- `lex-brand-colors` — semantic palette enforcement
- `lex-frontend-accessibility` — WCAG 2.1 AA requirement
- `lex-frontend-testing` — Vitest + jest-axe testing strategy
- Fernando standing memory `feedback_a11y_unit_test_ac.md` — jest-axe light+dark on Default + open + disabled is an AC, not a bonus
- Fernando standing memory `feedback_visual_regression_ubuntu_sot.md` — baselines are Ubuntu/CI source of truth
