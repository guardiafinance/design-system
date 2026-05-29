# Issue Brief — #88: Migrate TopBar to v0.1.0 DoD

- **Issue:** [#88](https://github.com/guardiatechnology/design-system/issues/88) — `feat(top-bar): migrate TopBar to v0.1.0 DoD`
- **Plan:** [#89](https://github.com/guardiatechnology/design-system/issues/89)
- **Type:** Feature (greenfield component migration)
- **Category:** Navigation
- **Author:** @fernandoseguim
- **Labels (parent):** `evolvability ♻️`

## What

`TopBar` is part of the canonical 52-component catalog of `@guardia/design-system` v0.1.0 (Navigation category). The repository **does not yet ship a `TopBar` component** — `ui_kit/components/top-bar/` does not exist. The legacy bundle under `ux_references/ui_kits/components/TopBar/` defines a thin layout shell: `<header>` with three composable slots (`left`, `center`, `right`) and an optional `sticky` mode. Bringing TopBar to DoD means landing the v0.1.0 implementation from zero, mirroring the legacy API while consuming only semantic tokens.

## Why

Without this migration the Navigation catalog stays incomplete on the docs site (sidebar lists TopBar but routes to the unmigrated placeholder). Toast (PR #259), Drawer (PR #258), Dialog (PR #257), ConfidenceIndicator (PR #256), and Alert (PR #255) recently merged following the same v0.1.0 DoD recipe — TopBar follows the same chassis.

## Legacy reference (source of truth for API and visual)

- `ux_references/ui_kits/components/TopBar/index.tsx` — minimal layout: `<header className="grd-tb grd-tb-sticky">` with three flex children (`.grd-tb-left`, `.grd-tb-center`, `.grd-tb-right`).
- `ux_references/ui_kits/components/TopBar/index.css` — 56px height, 16px gap, 20px horizontal padding, `var(--surface)` background, `var(--border)` bottom border, `var(--font-sans)`. Sticky variant: `position: sticky; top: 0; z-index: 50;`. Center slot: `flex: 1; max-width: 560px; margin: 0 auto`.
- `ux_references/ui_kits/components/TopBar/TopBar.playground.html` — three canonical scenarios:
  1. **Control Center** — `<strong>Guardia</strong> / Control Center` on the left, global search `<Input>` in the center, `IconButton bell + help + Avatar` on the right.
  2. **Entity page** — breadcrumb on the left, action buttons on the right (no center slot).
  3. **Minimal** — wordmark on the left, `Badge + Avatar` on the right.

The reference API is intentionally permissive: TopBar is a **layout primitive**. Content is supplied by the consumer; TopBar provides the shell, spacing, surface, border, and sticky behavior.

## Composition (not new visual atoms)

TopBar composes existing DS components when consumers wire scenarios in stories/preview:

- `<Logo>` / wordmark for branding (already migrated)
- `<Input leftIcon="search">` for global search (already migrated)
- `<IconButton>` for header actions (already migrated)
- `<Avatar>` for user profile (already migrated)
- `<Badge>` for plan/state chips (already migrated)
- `<Button>` / `<ButtonGroup>` for explicit actions (already migrated)

**No new visual atoms introduced.** TopBar is a slotted shell. Logo and Avatar are **consumed in stories/preview only**; we do not touch their source. This satisfies the orchestrator's guardrail: TopBar is layout/composition.

## Context

- Parent epic for v0.1.0: #13.
- Existing `Navbar` (`ui_kit/components/navbar/`) is a **different** primitive — horizontal navigation menu with items, badges, dynamic sections. TopBar is a layout shell. They are orthogonal and both belong in the Navigation category.
- The docs sidebar already lists TopBar under Navigation (`docs/src/pages/index.astro` line 644) — only the `MIGRATED` Set entry is missing.

## Unknowns

None. The reference is explicit, the API is minimal, and the recipe (Toast/Drawer/Dialog precedent) is well-established.

## Notion / branding sources

- [Branding (Notion source of truth)](https://www.notion.so/Branding-34536f91ebd280a69efacbadab3861c6)
- [Cores](https://www.notion.so/34536f91ebd28142a3f1e0e58fd62c4b)
- [Tipografia](https://www.notion.so/34536f91ebd281b9b76ccc6159bfae69)
- [Logomarca](https://www.notion.so/34536f91ebd2816f891ce73a5d47a789)

Token chain consumed: `--surface` (background), `--border` (bottom border), `--fg` (foreground text), `--font-sans` (Poppins/Roboto fallback). All semantic, all already present in `ui_kit/styles/index.css`.
