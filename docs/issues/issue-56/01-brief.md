# Issue Brief — #56 `feat(alert): migrate Alert to v0.1.0 DoD`

- **Repository:** `guardiatechnology/design-system`
- **Issue type:** Tech Task (`evolvability ♻️`)
- **Author:** @fernandoseguim
- **State:** OPEN
- **Plan sub-issue:** [#251](https://github.com/guardiatechnology/design-system/issues/251)
- **Branch:** `feat/56-alert` (worktree `.worktrees/56-alert/`)
- **Category:** Overlays / Feedback
- **Pre-allocated ADR slot:** ADR-011 (consumed — see Phase 3)

## Summary

Migrate `Alert` from the legacy 60-line shadcn baseline (only `default | destructive` tones, no docs page, not in `MIGRATED` set) to the v0.1.0 Definition of Done, with parity to the legacy `ux_references/ui_kits/components/Alert/` reference: **info | success | warning | error** tone matrix, icon, title, description, action slot, and dismiss button.

## Notion context

The issue body cites Notion Branding as the source of truth for colors / typography / logo / voice. The Notion canonical CTA hierarchy is mirrored in `lex-brand-colors` (Violet 500 primary in light, Orange 500 primary in dark). No additional Notion pages need to be opened for this Plan — all four required tones map to the project-canonical signal palette (`--success` / `--warning` / `--info` / `--danger` already declared in `ui_kit/styles/index.css`).

## Sibling precedents on main

- ADR-005 — Popover v0.1.0 DoD (PR #237 merged)
- ADR-006 — Menu consolidation (merged)
- ADR-007 — Tooltip v0.1.0 DoD (PR #244 merged)

The same architectural recipe applies: 3- to 6-export composition, CVA `size` ladder `sm | md | lg`, semantic tokens only, jest-axe in `axeInThemes` over Default + variants, MIGRATED set entry, ADR accepted from creation in the atomic commit.

## Identified unknowns (resolved in Phase 2 / 3)

1. Does Alert need `assertive` polite/assertive ARIA toggle? — **Yes** (Phase 2 AC-3): polite by default (`role="status"`), opt-in `assertive` flips to `role="alert"`.
2. Does Alert dismiss state need controlled / uncontrolled parity? — **Yes** (Phase 2 AC-8): `open` + `defaultOpen` + `onOpenChange` mirroring Popover/Tooltip patterns.
3. Does the tone matrix need new Tailwind utility tokens (`bg-success-soft`, `text-info-fg`, etc.)? — **Yes** (Phase 3): the existing `--success` / `--success-soft` CSS variables are not exposed under `@theme inline`, and dark theme does not override them. This is the architectural decision recorded in **ADR-011**.

## Parallel work in flight (not touched)

PRs #247 (ADR-008), #225 (Tabs), #221 (ChatMessage), #204 (AgentCard). Sister Athenas dispatched for #60 (Dialog), #64 (EmptyState), #58 (ConfidenceIndicator) in their own worktrees. This worktree (`feat/56-alert`) touches only `ui_kit/components/alert/**`, `ui_kit/styles/index.css` (tone token block), `docs/src/pages/componentes/alert.astro`, `docs/src/previews/alert.tsx`, `docs/src/pages/index.astro` (MIGRATED set), `ui_kit/components/index.ts` (already barrels `./alert`), `docs/adr/ADR-011-*.md`, and `docs/issues/issue-56/`.
