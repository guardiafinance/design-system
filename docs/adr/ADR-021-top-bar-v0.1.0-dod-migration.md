# ADR-021 — Migrate TopBar to v0.1.0 DoD (Navigation/Layout shell)

- **Status:** accepted
- **Date:** 2026-05-29
- **Deciders:** @fernandoseguim (CODEOWNER), `warrior-athena` (Issue-Driven flow orchestrator)
- **Precedents:** ADR-010 (Dialog — Radix wrapper chassis), ADR-011 (Alert — tone token foundation), ADR-014 (Toast — most recent Overlays migration chassis)
- **Issue:** [#88](https://github.com/guardiatechnology/design-system/issues/88)
- **Plan:** [#89](https://github.com/guardiatechnology/design-system/issues/89)

## Context

`TopBar` is the **Navigation/Layout shell** in the canonical 52-component catalog of `@guardia/design-system` v0.1.0. The repository currently ships no implementation — `ui_kit/components/top-bar/` does not exist, and the docs sidebar (`docs/src/pages/index.astro` line 644) lists TopBar in the Navigation group without a `MIGRATED` Set entry, so the route does not resolve.

The legacy bundle at `ux_references/ui_kits/components/TopBar/` defines the canonical visual and API contract:

- A semantic `<header>` element 56 px tall with 20 px horizontal padding.
- Three composable slots: `left`, `center`, `right`. Center is conditional (omitted when the consumer only wants left + right).
- Optional `sticky` mode (default `true`) — `position: sticky; top: 0; z-index: 50`.
- Surface uses `var(--surface)` background and `var(--border)` bottom border.

Three canonical playground scenarios anchor the API:

1. **Control Center** — wordmark + breadcrumb (left), search input (center), bell + help + avatar (right).
2. **Entity page** — breadcrumb (left), action buttons (right), no center.
3. **Minimal** — wordmark (left), badge + avatar (right), no center.

Architectural decisions to crystallize in an ADR rather than dilute into a commit:

- **API shape** — slot props vs compound API (`<TopBar.Left>`, `<TopBar.Center>`, `<TopBar.Right>`).
- **Sticky default** — `true` vs `false`.
- **Token contract** — which semantic tokens TopBar consumes; whether the migration expands the palette.
- **Relationship with `Navbar`** — TopBar (layout shell) vs Navbar (horizontal nav menu) are both in Navigation. Clarify they are orthogonal.
- **Semantic root** — `<header>` (implicit `banner`) vs explicit `role="banner"`.

## Decision

Migrate TopBar to v0.1.0 DoD following the **Toast / Dialog chassis** adapted for a slotted layout primitive (no Radix base, no portal — TopBar is a static structural component):

1. **Greenfield single component, slot-prop API.** A single `<TopBar>` component exposing three slot props: `left?: React.ReactNode`, `center?: React.ReactNode`, `right?: React.ReactNode`. Public surface is intentionally minimal — 1 component, 1 CVA accessor (`topBarVariants`), 2 types (`TopBarProps`, `TopBarSticky`). No compound API. No declarative sub-primitives. The legacy reference uses slot props; consumers already know this shape.

2. **CVA for the sticky variant only.** `topBarVariants` is a small CVA function with a single `sticky: boolean` variant (default `true`). The base chain hardcodes layout, surface, and typography classes. No tone matrix, no size matrix — TopBar is a single visual variant of itself.

3. **Token contract — semantic only, no expansion.** TopBar consumes `bg-surface`, `border-border`, `text-fg`, `font-sans` exclusively. **No new tokens are introduced**. This is the cheapest possible migration on the token surface, and it lands the same Notion-canonical brand palette already in use across the catalog (per `lex-brand-colors` and the Notion source of truth).

4. **Sticky default `true`.** Matches the legacy reference. Sticky behavior is what consumers expect from a page header. Opt-out is one prop (`sticky={false}`).

5. **Semantic root: `<header>` (implicit `banner` landmark).** We do not set `role="banner"` — per ARIA, an `<header>` not nested inside `<article>`/`<section>`/`<aside>`/`<nav>`/`<main>` automatically exposes the `banner` role. Setting it explicitly is duplication.

6. **Center container is conditional.** When `center` is omitted, the center container is **not rendered** (saves a DOM node, mirrors the legacy reference, lets the right slot anchor to the trailing edge via `ml-auto`). When `center` is present, it renders as `flex-1` with `max-w-[560px]` and `mx-auto` (the legacy width budget for global search inputs).

7. **Orthogonal to `Navbar`.** `Navbar` (`ui_kit/components/navbar/`) is a horizontal menu primitive with items, badges, and dynamic sections. TopBar is a layout shell. Both belong in the Navigation category; both ship independently. A consumer can place a `<Navbar>` inside TopBar's `center` slot — TopBar does not extend, replace, or compose Navbar by default.

8. **a11y coverage (`axeInThemes`)** over 3 states × 2 themes = **6 invocations minimum** in `TopBar.test.tsx`: Default empty header, fully composed header (branding + search + actions), sticky=false. Light + dark always.

9. **No portal, no provider, no Radix base.** TopBar is a static structural component. It does not need imperative state, focus management, or live regions. The Toast chassis is referenced for **discipline** (file layout, test patterns, story patterns, doc patterns), not for **inheritance** of behavior.

10. **ADR `accepted` at first commit.** Atomic commit ships code + tests + stories + docs + ADR together. No `proposed → accepted` two-step (per the post-PR-#237 retrospective — see ADR-014 clause 9).

## Consequences

### Positive

- TopBar reaches DoD parity with the Navigation category neighbors (Tabs in flight as PR #225, SidebarNav as Plan #82, Pagination as Plan #80). Navigation catalog advances 1 toward 52.
- Token surface unchanged — zero risk of breaking other components that consume `--surface` / `--border` / `--fg`.
- Slot-prop API requires zero compound boilerplate; the public surface is the smallest possible (1 component + 1 CVA + 2 types).
- Composes existing DS components (Logo, Avatar, Input, IconButton, Badge, Button) in stories and previews — exercises the catalog as a system without introducing new visual atoms.

### Negative

- **No compound API.** Consumers cannot use `<TopBar.Left>` / `<TopBar.Center>` / `<TopBar.Right>` for declarative composition. Trade-off: simplicity + parity with legacy reference wins for v0.1.0; compound API is reserved for a future ADR if a real consumer need emerges.
- **Single visual variant.** TopBar has no `tone`, `size`, or `density` variants. Consumers needing a denser header (e.g. 44 px tall) would need a follow-up ADR. Not a regression — the legacy reference has the same single variant.

### Neutral

- **+0 dependencies.** TopBar uses only React, CVA (already in the bundle), and `cn` from the shared utility module. No new package added to `package.json`.
- **+1 directory** (`ui_kit/components/top-bar/`), +1 docs page, +1 preview module, +1 ADR. Total: ~6 new files + 2 modified (barrel + docs index Set).

## Alternatives considered

1. **Compound API (`<TopBar.Left>...</TopBar.Left>`).** Rejected — adds 3 extra forwardRef wrappers + 3 displayNames + 3 extra exports without expressive gain. Slot props match the legacy reference and ship with zero boilerplate. If a real consumer requires declarative composition for advanced use cases (e.g. inserting custom layout between Left and Center), a future ADR can introduce the compound API on top of the existing slot API in a backwards-compatible way (slots stay as a shorthand).

2. **Extend `Navbar` to add a header shell mode.** Rejected — Navbar is a horizontal menu primitive; conflating it with a layout shell would force one component to own two unrelated responsibilities. Two separate primitives is the correct decomposition; composition (Navbar inside TopBar's center slot) gives consumers the union of both behaviors.

3. **Sticky default `false`.** Rejected — the legacy reference defaults to `true`, every documented playground scenario uses sticky, and pages rarely want a header that scrolls away. Opt-out is one prop.

4. **Add a `dense` variant (44 px tall).** Rejected — no consumer has asked for it, the legacy reference does not document it, and YAGNI. Can be added later via ADR with a single CVA variant addition (`density: { default: "h-14", dense: "h-11" }`).

5. **Set `role="banner"` explicitly.** Rejected — `<header>` not nested inside `<article>`/`<section>`/`<aside>`/`<nav>`/`<main>` already exposes the banner landmark per ARIA. Setting it explicitly is redundant and may even trigger axe warnings about duplicated landmarks.

6. **Use a portal for the sticky behavior.** Rejected — CSS `position: sticky` is well-supported across all targeted browsers (per the project's `package.json` browserslist defaults). A portal adds runtime cost and breaks the DOM hierarchy unnecessarily.

7. **Build TopBar as part of `Navbar` package (`ui_kit/components/navbar/top-bar.tsx`).** Rejected — they are conceptually distinct components in the catalog (Navigation list shows both as separate entries with separate slugs and descriptions). Co-locating would confuse the import surface and the docs nav.

## Implementation note (acceptance criteria mapping)

| ADR clause | Plan AC |
|------------|---------|
| 1. Greenfield single component, slot-prop API | AC-1, AC-2, AC-3 |
| 2. CVA for sticky variant only | AC-1, AC-5, AC-6, AC-21 |
| 3. Token contract — semantic only, no expansion | AC-7, AC-22 |
| 4. Sticky default `true` | AC-5, AC-18 |
| 5. Semantic root `<header>` (implicit banner) | AC-4, AC-20 |
| 6. Center container conditional | AC-3, AC-11, AC-17 |
| 7. Orthogonal to Navbar | Brief — "Composition" + "Context" sections |
| 8. `axeInThemes` over 3 states × 2 themes | AC-12, AC-13, AC-14 |
| 9. No portal, no provider, no Radix base | Architecture component shape |
| 10. ADR accepted at first commit | AC-30, AC-31 |
