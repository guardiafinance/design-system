# Phase 3 — Architecture: `feat(breadcrumbs): migrate Breadcrumbs to v0.1.0 DoD`

- **Issue:** [#76](https://github.com/guardiatechnology/design-system/issues/76)
- **Plan sub-issue:** [#77](https://github.com/guardiatechnology/design-system/issues/77)
- **ADR:** [ADR-016 — Breadcrumbs v0.1.0 DoD migration](../../adr/ADR-016-breadcrumbs-v0.1.0-dod-migration.md)

## Affected components

| Path | Action | Description |
|---|---|---|
| `ui_kit/components/breadcrumb/index.tsx` | **delete** | Legacy baseline (singular dir). Removed in same commit. |
| `ui_kit/components/breadcrumb/Breadcrumb.stories.tsx` | **delete** | Legacy single-story file. Replaced by the new one. |
| `ui_kit/components/breadcrumbs/index.tsx` | **create** | Canonical implementation: `Breadcrumbs` (imperative) + 7 declarative primitives. |
| `ui_kit/components/breadcrumbs/Breadcrumbs.test.tsx` | **create** | ≥ 20 behavioral + a11y tests, AC-1..AC-22 traceable. |
| `ui_kit/components/breadcrumbs/Breadcrumbs.stories.tsx` | **create** | Storybook stories (Default · WithIcon · Truncated · CustomSeparator · WithClickHandler · DeclarativeComposition · LongTrail). |
| `ui_kit/components/index.ts` | **edit** | Repoint `export * from "./breadcrumb"` → `export * from "./breadcrumbs"`. |
| `docs/src/pages/componentes/breadcrumbs.astro` | **create** | Astro docs page with preview rows + props table + a11y notes. |
| `docs/src/previews/breadcrumbs.tsx` | **create** | Preview rows consumed by the `.astro` page. |
| `docs/src/pages/index.astro` | **edit** | Add `"Breadcrumbs"` to the `MIGRATED` Set. |
| `docs/adr/ADR-016-breadcrumbs-v0.1.0-dod-migration.md` | **create** | ADR `accepted` since first commit. |
| `docs/issues/issue-76/{01..06}-*.md` | **create** | Issue-Driven flow artifacts (this folder). |

**No `package.json` change.** Zero new dependencies — `@radix-ui/react-slot` and `lucide-react` are already in deps.

## Public API surface

### Imperative API

```tsx
import { Breadcrumbs } from "@guardia/design-system";

<Breadcrumbs
  items={[
    { label: "Início", href: "/" },
    { label: "Conciliação", href: "/conciliacao" },
    { label: "Itaú · maio/2026" },
  ]}
  maxItems={3}              // optional truncation
  separator={<Slash />}     // optional separator override
  className="text-sm"       // pass-through
/>
```

### Declarative primitives

```tsx
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
  BreadcrumbEllipsis,
} from "@guardia/design-system";

<Breadcrumb>
  <BreadcrumbList>
    <BreadcrumbItem>
      <BreadcrumbLink asChild>
        <NextLink href="/">Início</NextLink>
      </BreadcrumbLink>
    </BreadcrumbItem>
    <BreadcrumbSeparator />
    <BreadcrumbItem>
      <BreadcrumbEllipsis />
    </BreadcrumbItem>
    <BreadcrumbSeparator />
    <BreadcrumbItem>
      <BreadcrumbPage>Conferência</BreadcrumbPage>
    </BreadcrumbItem>
  </BreadcrumbList>
</Breadcrumb>
```

### Exported types

- `BreadcrumbsProps` — props of the imperative `<Breadcrumbs>`.
- `BreadcrumbsItem` — `{ label: ReactNode; href?: string; onClick?: () => void; icon?: ReactNode }`.

## ARIA model

| Element | Role | Attributes |
|---|---|---|
| `<Breadcrumb>` / imperative root | `<nav>` | `aria-label="breadcrumb"` (overridable via prop) |
| `<BreadcrumbList>` | `<ol>` | — |
| `<BreadcrumbItem>` | `<li>` | — |
| `<BreadcrumbLink>` | `<a>` (or Slot) | inherits anchor semantics |
| `<BreadcrumbPage>` | `<span>` | `role="link"` + `aria-current="page"` + `aria-disabled="true"` |
| `<BreadcrumbSeparator>` | `<li>` | `role="presentation"` + `aria-hidden="true"` |
| `<BreadcrumbEllipsis>` | `<span>` | `role="presentation"` + `aria-hidden="true"` + visually-hidden `<span class="sr-only">More</span>` |

Matches WAI-ARIA APG breadcrumb pattern.

## Token contract

Only semantic tokens (no severity tokens — breadcrumbs is neutral):

| Token | Where |
|---|---|
| `text-muted-foreground` | Default text color (link items + separator) |
| `text-foreground` | Current page text (`<BreadcrumbPage>`) + link hover |
| Tailwind utilities only — no raw hex / oklch | All class chains |

`<ChevronRight />` icon inherits `currentColor` (no `text-*` literal in SVG).

## Truncation algorithm (imperative API)

```
if (maxItems is undefined OR maxItems < 2 OR items.length <= maxItems):
  render all items
else:
  render items[0]                                    // root
  render <BreadcrumbEllipsis />
  render items[items.length - (maxItems - 1) ...]   // last (maxItems - 1) items
```

`maxItems` counts the **visible item slots**; the ellipsis is not counted.

Edge cases (covered by tests):

| `items.length` | `maxItems` | Output |
|---|---|---|
| 5 | undefined | full 5 items |
| 5 | 5 | full 5 items |
| 5 | 3 | item[0] + … + item[3] + item[4] |
| 7 | 3 | item[0] + … + item[5] + item[6] |
| 7 | 4 | item[0] + … + item[4] + item[5] + item[6] |
| 2 | 1 | full 2 items (ellipsis would lose info — degenerate, fall back to full) |

## Out of scope (deferred)

- `<BreadcrumbEllipsis>` opening a `<Popover>` with elided items — composition by consumer.
- I18n of the default `aria-label="breadcrumb"` — overridable today via prop.
- Animations / transitions on items.

## Risk + mitigation

| Risk | Likelihood | Mitigation |
|---|---|---|
| Import path break for downstream apps (Isac, app) — they may import from `@guardia/design-system/components/breadcrumb`. | Low | Public package surface is the **barrel** (`@guardia/design-system`), not the subpath. Consumers import named exports. Same exported symbols, same prop shapes. |
| Visual regression on the new ChevronRight rendering vs. legacy. | Low | The legacy already used `<ChevronRight />` from `lucide-react`. Same icon, same size class. Visual baselines will exercise this. |
| `aria-label="breadcrumb"` collisions when multiple breadcrumbs render on the same page. | Low | Page that needs multiple breadcrumbs can override via prop — documented in the Astro page. |
| Tests under jsdom flake for `aria-current` queries. | Low | Tests use `getByRole('link', { current: 'page' })` which Testing Library handles deterministically. |

## Gate 1 — auto-approval check

| Criterion | Status |
|---|---|
| Scope mirrors Plan #77 DoD | ✅ |
| No expansion outside the Plan checklist | ✅ |
| ADR slot pre-allocated (ADR-016) | ✅ |
| Zero new deps | ✅ |
| No irreversible action (delete is one git revert away) | ✅ |
| Tokens semânticos only | ✅ |

**Gate 1: auto-approved.** Advancing to Phase 4 (implementation).
