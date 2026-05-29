# Architecture — #80 Pagination v0.1.0 DoD

## Component layout

```
ui_kit/components/pagination/
├── index.tsx                  # rewrite — 9 symbols + paginationLinkVariants
├── Pagination.test.tsx        # new — ≥ 20 behavioral tests + jest-axe light+dark
└── Pagination.stories.tsx     # rewrite — Default + Active + Disabled + Many + Edges + Sizes + Dark
```

## Public surface

| Symbol | Role | A11y notes |
|--------|------|------------|
| `Pagination` | `<nav role="navigation" aria-label="pagination">` wrapper | Landmark |
| `PaginationContent` | `<ul>` flex container | Lista semântica |
| `PaginationItem` | `<li>` slot | Item de lista |
| `PaginationLink` | `<a>` ou `<button>` (via `role`) | `aria-current="page"` quando `isActive`; `aria-disabled` quando `disabled`; Enter+Space quando sem href |
| `PaginationPrevious` | `PaginationLink` + chevron + texto "Anterior" | `aria-label="Página anterior"` |
| `PaginationNext` | `PaginationLink` + chevron + texto "Próxima" | `aria-label="Próxima página"` |
| `PaginationFirst` | `PaginationLink` + chevrons + texto "Início" | `aria-label="Primeira página"` |
| `PaginationLast` | `PaginationLink` + chevrons + texto "Final" | `aria-label="Última página"` |
| `PaginationEllipsis` | `<span aria-hidden="true">` + `<span className="sr-only">Mais páginas</span>` | Decorativo + sr-only siblings |

## Design decisions cravadas em ADR-018

1. **API multi-parte permanece** — não regredir para a API monolítica controlada do legacy reference. Composição shadcn-style está alinhada com Breadcrumb, NavigationMenu, Menu já migrados.
2. **Token contract via `buttonVariants`** — `PaginationLink` reusa `outline` (active) e `ghost` (idle); zero token novo expansion.
3. **A11y wiring explícito** — labels em pt-BR; ellipsis com sr-only sibling; Enter+Space handler quando `<a>` sem href atua como botão.
4. **lucide-react chevrons** — já dep `^0.542.0`.

## Affected components (scope)

| Path | Action | Reason |
|------|--------|--------|
| `ui_kit/components/pagination/index.tsx` | rewrite | DoD compliance + a11y fixes |
| `ui_kit/components/pagination/Pagination.test.tsx` | new | AC-1..AC-10 traceability |
| `ui_kit/components/pagination/Pagination.stories.tsx` | rewrite | AC-11 — 7+ stories light+dark |
| `docs/src/pages/componentes/pagination.astro` | new | AC-12 — Astro page |
| `docs/src/previews/pagination.tsx` | new | AC-12 — Astro previews |
| `docs/src/pages/index.astro` | edit (1 line) | AC-12 — `MIGRATED.add("Pagination")` |
| `docs/adr/ADR-018-pagination-v0.1.0-dod-migration.md` | new | architectural decision record |
| `__image_snapshots__/components/pagination/{light,dark}/*.png` | regenerate via CI | new stories invalidate old baselines |

## Visual regression strategy

Old baselines in `__image_snapshots__/components/pagination/{light,dark}/` were generated against the previous stories (Default only). New 7+ stories will invalidate them. Strategy: open the PR, let CI fail visual-regression, apply `regenerate-baselines` label (authorized by Fernando until 2026-05-29 ~22:30 UTC, no macOS local baselines).

## Out-of-scope confirmation

Nenhuma modificação em consumidores externos. Nenhum token novo. Sonner / Toast intocados. Nenhuma deprecation.
