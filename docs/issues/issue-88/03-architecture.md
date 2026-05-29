# Architecture — Issue #88: Migrate TopBar to v0.1.0 DoD

## Affected components

| File | Action | Description |
|------|--------|-------------|
| `ui_kit/components/top-bar/index.tsx` | **create** | Greenfield TopBar shell — `<header>` with 3 slot containers, CVA `topBarVariants` for sticky variant, forwardRef, displayName |
| `ui_kit/components/top-bar/TopBar.test.tsx` | **create** | ≥ 20 behavioral + a11y tests; `axeInThemes` light/dark on 3 states; AC-N traceability docstrings |
| `ui_kit/components/top-bar/TopBar.stories.tsx` | **create** | `Default`, `EntityPage`, `Minimal`, `Sticky` stories; light/dark via Storybook themes decorator |
| `ui_kit/components/index.ts` | **modify** | Add `export * from "./top-bar";` (alphabetical placement after `./toggle-group`, before `./tooltip`) |
| `docs/src/pages/componentes/top-bar.astro` | **create** | ComponentPreview page mirroring legacy playground sections |
| `docs/src/previews/top-bar.tsx` | **create** | React preview functions (`BasicRow`, `EntityRow`, `MinimalRow`) for the Astro page |
| `docs/src/pages/index.astro` | **modify** | Add `"TopBar"` to the `MIGRATED` Set |
| `docs/adr/ADR-021-top-bar-v0.1.0-dod-migration.md` | **create** | Status `accepted`; documents slot API, sticky default, tokenization, why not extending Navbar |

## Component shape

```tsx
"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const topBarVariants = cva(
  [
    // Layout — semantic header with 3 flex columns
    "flex items-center gap-4 h-14 px-5",
    // Surface — semantic tokens only
    "bg-surface border-b border-border text-fg",
    // Typography — inherits Poppins via tokens
    "font-sans",
  ].join(" "),
  {
    variants: {
      sticky: {
        true: "sticky top-0 z-50",
        false: "",
      },
    },
    defaultVariants: { sticky: true },
  },
);

export type TopBarSticky = NonNullable<
  VariantProps<typeof topBarVariants>["sticky"]
>;

export interface TopBarProps
  extends Omit<React.HTMLAttributes<HTMLElement>, "children">,
    VariantProps<typeof topBarVariants> {
  left?: React.ReactNode;
  center?: React.ReactNode;
  right?: React.ReactNode;
}

const TopBar = React.forwardRef<HTMLElement, TopBarProps>(
  ({ className, sticky, left, center, right, ...props }, ref) => (
    <header
      ref={ref}
      className={cn(topBarVariants({ sticky }), className)}
      {...props}
    >
      <div className="flex items-center gap-2.5 shrink-0">{left}</div>
      {center ? (
        <div className="flex flex-1 justify-center max-w-[560px] mx-auto">
          {center}
        </div>
      ) : null}
      <div className="flex items-center gap-2.5 shrink-0 ml-auto">
        {right}
      </div>
    </header>
  ),
);
TopBar.displayName = "TopBar";

export { TopBar, topBarVariants };
export default TopBar;
```

> Note on `ml-auto` on the right slot: when `center` is omitted, `ml-auto` keeps the right slot anchored to the trailing edge (mirroring legacy where right floated by virtue of flexbox + a missing center). When `center` is present, `ml-auto` is harmless because the center slot already consumes `flex-1`.

## Design decisions (formalized in ADR-021)

1. **Slot props vs compound API.** Slot props (`left`, `center`, `right`) match the legacy reference exactly and require zero compound boilerplate. The compound API (`<TopBar.Left>...</TopBar.Left>`) is rejected for v0.1.0 because it introduces 3 extra forwardRef wrappers + 3 displayNames + 3 extra exports without delivering any expressive power the slots lack. Compound API can be added later via ADR if a real consumer need emerges.

2. **Sticky default `true`.** Legacy default. Sticky behavior is what consumers expect from a header at the top of a page. Opt-out via `sticky={false}` is a one-line change for the consumer.

3. **Token reuse, no expansion.** TopBar uses only `--surface`, `--border`, `--fg`, `--font-sans` (semantic tokens already present in `ui_kit/styles/index.css`). **No new tokens introduced** — this is the cheapest possible migration on the token surface.

4. **No relationship with Navbar.** `Navbar` (`ui_kit/components/navbar/`) is a horizontal menu primitive with items, dynamic sections, and badges. TopBar is a layout shell that can *contain* a Navbar inside `center` if a consumer ever wants a nav-driven header — but TopBar does not extend, replace, or compose Navbar by default. Both belong in Navigation; both ship independently.

5. **`role="banner"` is implicit.** Per ARIA, `<header>` not nested inside `<article>`/`<section>`/`<aside>`/`<nav>`/`<main>` exposes the `banner` landmark automatically. We do not set `role="banner"` explicitly to avoid duplicating native semantics.

6. **No `position` viewport variant.** Toast has 6 positions; TopBar has 1 (top of page). Sticky is the only positioning concern.

## Test strategy

Mirrors the Toast/Drawer chassis: behavioral tests using `userEvent` + Testing Library `getByRole/getByText`, plus `axeInThemes` for a11y in light + dark across 3 states (Default empty, fully composed, sticky=false). Target ≥ 20 tests, ≥ 80 % file coverage.

The `A11yHarness` pattern from Toast is **not** needed for TopBar — TopBar has no portal, no Radix provider, no hidden sentinels. `axeInThemes` runs directly on the rendered container.

## Stacked PR Decomposition

Not applicable. Single PR per Plan #89 — this is a single-file component migration with co-located test, story, doc page, and ADR. The `codex-stacked-prs` Decision Checklist scoring is 0 high signals (size moderate, single bounded context, single component), 1 anti-signal (single Plan sub-issue ships in one atomic commit per the issue body).

## Risks

- **Visual regression CI**: TopBar will receive new baseline screenshots from CI. If `visual-regression` job fails on the first run, the auto-apply label policy is in effect (per orchestrator instructions, authorized until 2026-05-29 ~22:30 UTC).
- **Tailwind `max-w-[560px]` arbitrary value**: lints clean in this repo (other components use arbitrary values, e.g. Toast `md:max-w-[420px]`); no new restriction.
- **`@storybook/addon-themes` decorator**: assumed project-default per Toast/Drawer/Dialog stories. If absent, the Stories file still renders correctly; only the theme toggle in Storybook itself would be missing.
