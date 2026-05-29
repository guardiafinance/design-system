# Requirements — Issue #88: Migrate TopBar to v0.1.0 DoD

## Acceptance Criteria

Each AC has a unique identifier `AC-N` used in `TopBar.test.tsx` docstrings for bidirectional traceability (`lex-issue-driven` Rule 3).

### Public surface

- **AC-1:** `ui_kit/components/top-bar/index.tsx` exports `TopBar` (default + named) and the CVA accessor `topBarVariants`. The public surface is intentionally minimal: 1 component + 1 CVA accessor + 1 `TopBarProps` type + 1 `TopBarSticky` type alias.
- **AC-2:** `TopBar` is exported through the barrel at `ui_kit/components/index.ts` via `export * from "./top-bar";`.

### Layout API (slots)

- **AC-3:** `TopBar` accepts three slot props: `left?: React.ReactNode`, `center?: React.ReactNode`, `right?: React.ReactNode`. Each slot renders inside a dedicated container with the correct flex layout. When `center` is omitted, the right slot expands to fill the available space (mirroring the legacy reference where the center container is conditionally rendered).
- **AC-4:** The component renders a semantic `<header>` element by default (`role="banner"` is implicit via `<header>` when not nested in `<article>`/`<section>`). Consumers can override the element via the standard `asChild` pattern is **out of scope** for this migration — kept simple.

### Sticky behavior

- **AC-5:** `sticky` prop is a boolean. Default `true` (mirrors legacy). When `sticky=true`, the header is positioned with `position: sticky; top: 0; z-index: 50` via `topBarVariants`. When `sticky=false`, no positioning is applied.
- **AC-6:** The sticky CVA variant is composable with consumer `className` (passed via `cn()`), so users can override z-index or top offset when needed.

### Tokenization

- **AC-7:** Background uses `bg-surface` (semantic token); bottom border uses `border-b border-border`; foreground inherits `text-fg`; typography inherits `font-sans` (Poppins → Roboto fallback per `lex-brand-typography`). **No hex literals**, **no `oklch()` literals**, **no raw color utilities** (`bg-zinc-200`, `text-gray-700`, etc.).
- **AC-8:** Height is fixed at `h-14` (56px — matches legacy `height: 56px`); horizontal padding `px-5` (20px); slot gap `gap-4` (16px).

### Slot containers

- **AC-9:** Left container: `flex items-center gap-2.5 shrink-0` (mirrors legacy `.grd-tb-left { display: flex; align-items: center; gap: 10px; flex-shrink: 0; }`).
- **AC-10:** Right container: identical to left — `flex items-center gap-2.5 shrink-0`. Always rendered (even with empty `right` prop) so the layout grid stays consistent across instances.
- **AC-11:** Center container (when present): `flex flex-1 justify-center max-w-[560px] mx-auto` (mirrors legacy `.grd-tb-center { flex: 1; display: flex; justify-content: center; max-width: 560px; margin: 0 auto; }`).

### Accessibility (jest-axe in light + dark)

- **AC-12:** `TopBar.test.tsx` invokes `axeInThemes(container)` (light + dark) for the **default** state (no slots).
- **AC-13:** `TopBar.test.tsx` invokes `axeInThemes(container)` for the **composed state** (all three slots filled with realistic content: branding text, search input placeholder, IconButton-shaped action button + Avatar-shaped element).
- **AC-14:** `TopBar.test.tsx` invokes `axeInThemes(container)` for the **sticky=false** variant — verifies no contrast regression when positioning differs.
- **AC-15:** No `getByTestId` queries; tests use `getByRole`, `getByLabelText`, `getByText` (per `lex-frontend-testing`).

### Behavioral coverage

- **AC-16:** Tests verify all three slot props render their content (`getByText` on representative strings supplied by the test render).
- **AC-17:** Tests verify the center slot is **not rendered** when `center` prop is omitted (DOM has only left + right containers).
- **AC-18:** Tests verify `sticky=true` (default) applies the sticky positioning classes; `sticky=false` removes them.
- **AC-19:** Tests verify `className` consumer prop is appended (not replacing) the variant chain (`cn()` composition).
- **AC-20:** Tests verify the rendered element is a `<header>` (semantic root).
- **AC-21:** Tests verify the CVA accessor `topBarVariants` is callable with no args and returns the default chain.
- **AC-22:** Tests verify `topBarVariants` does not contain hex literals, `oklch()` values, or non-semantic Tailwind color utilities (regex check, mirrors AC-4 in Toast).

### Stories (light + dark coverage)

- **AC-23:** `TopBar.stories.tsx` exports `Default` story showing the canonical three-slot composition (branding + search + actions). Renders correctly in **light** and **dark** themes (Storybook `@storybook/addon-themes` decorator is project default).
- **AC-24:** `TopBar.stories.tsx` exports `EntityPage` story (breadcrumb left, no center, action buttons right) and `Minimal` story (wordmark left, badge + avatar right) — mirroring the three legacy playground sections.
- **AC-25:** `TopBar.stories.tsx` exports `Sticky` story (long scrollable content below TopBar to demonstrate the sticky behavior visually in Storybook).
- **AC-26:** Stories use **only** DS components (`Input`, `IconButton`, `Avatar`, `Badge`, `Button`, `Logo` if available) and the component's own state props. **No external destructive helper** (consistent with the `feedback_story_no_external_destructive_helper` discipline — but TopBar has no validation state, so this is automatically satisfied).

### Documentation

- **AC-27:** `docs/src/pages/componentes/top-bar.astro` exists, follows the `ComponentPreview` chassis used by Toast/Drawer/Dialog, and includes preview sections matching the legacy playground scenarios (Control Center, Entity page, Minimal, Sticky note).
- **AC-28:** `docs/src/previews/top-bar.tsx` exports React preview functions (`BasicRow`, `EntityRow`, `MinimalRow`) consumed by the Astro page. Previews compose existing DS components only.
- **AC-29:** `docs/src/pages/index.astro` `MIGRATED` Set includes `"TopBar"` so the sidebar links to `/componentes/top-bar`.

### ADR + commit hygiene

- **AC-30:** `docs/adr/ADR-021-top-bar-v0.1.0-dod-migration.md` is created with status `accepted`, deciders, precedents (ADR-010 / ADR-014 chassis), and the design decisions (slot API, sticky default, tokenization, why not extending Navbar).
- **AC-31:** All changes ship in a single atomic commit `feat(top-bar): migrate to v0.1.0 DoD — ...` (per `lex-small-commits`).

### Quality gates

- **AC-32:** `npm run typecheck` passes (mypy-equivalent: `tsc --noEmit`, `lex-frontend-typing`).
- **AC-33:** `npm run lint` passes.
- **AC-34:** `npm run test` passes; the `TopBar.test.tsx` suite has **≥ 20 tests** (or ≥ 80 % coverage of `index.tsx` — whichever lands first).
- **AC-35:** `npm run build` passes.
- **AC-36:** `npm run docs:build` passes.

## Definition of Done (mirrors Plan #89)

- [ ] Storybook Default + variants render in light + dark.
- [ ] Playground comparison vs `ux_references/ui_kits/components/TopBar/` recorded in the PR body (Brand approval pending Fernando's "está bom" — that gate is human-only and rides on the PR review window, not the agent flow).
- [ ] Behavioral tests use accessible queries; ≥ 20 tests or ≥ 80 % file coverage.
- [ ] jest-axe light + dark on Default + composed + sticky=false.
- [ ] Astro doc page + preview wired.
- [ ] Barrel export.
- [ ] `MIGRATED` Set entry.
- [ ] Semantic tokens only.
- [ ] `npm run typecheck && lint && test && build && docs:build` green.
- [ ] Atomic commit.
- [ ] PR `Closes #88` AND `Closes #89` on separate lines.

## Out of scope

- Refactoring `Navbar` (separate component, different surface).
- Adding new tokens to `ui_kit/styles/index.css` (TopBar uses only the existing semantic palette).
- Compound API (`TopBar.Left`, `TopBar.Center`, `TopBar.Right`) — slot props are simpler and match the legacy reference. Compound API is deferred to a future ADR if a real consumer need emerges.
- `asChild` polymorphism — out of scope; consumers wrap the element themselves if needed.
- Responsive collapsing (hamburger on narrow viewports) — TopBar v0.1.0 is desktop-first per the legacy reference; mobile behavior is a follow-up issue when mobile catalog work begins.
