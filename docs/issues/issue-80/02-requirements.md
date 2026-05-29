# Requirements — #80 Pagination v0.1.0 DoD

Derived from Plan sub-issue [#81](https://github.com/guardiatechnology/design-system/issues/81) DoD checklist, normalized as numbered ACs for `lex-issue-driven` Rule 3 (bidirectional AC ↔ test traceability).

## Acceptance Criteria

| ID | Criterion |
|----|-----------|
| **AC-1** | Public surface exports exactly 9 symbols: `Pagination`, `PaginationContent`, `PaginationItem`, `PaginationLink`, `PaginationPrevious`, `PaginationNext`, `PaginationFirst`, `PaginationLast`, `PaginationEllipsis`. |
| **AC-2** | The `<Pagination>` root renders `<nav role="navigation" aria-label="pagination">` (semantic HTML, screen-reader navigable). |
| **AC-3** | `PaginationLink` with `isActive` sets `aria-current="page"` and uses the `outline` visual variant; without `isActive` uses `ghost`. |
| **AC-4** | `PaginationLink` with `disabled` sets `aria-disabled="true"`, `tabIndex={-1}`, prevents `onClick`, and visually applies the disabled style chain. |
| **AC-5** | `PaginationLink` without `href` is keyboard-operable via Enter and Space (per `lex-frontend-accessibility` Rule 2.2). |
| **AC-6** | Only semantic tokens are used — visual chain comes from `buttonVariants`. No hardcoded colors. |
| **AC-7** | `PaginationEllipsis` renders `<span aria-hidden="true">` wrapping the icon with a visually-hidden sibling text "Mais páginas" (screen-reader-only announcement). |
| **AC-8** | `PaginationPrevious`, `PaginationNext`, `PaginationFirst`, `PaginationLast` each declare an explicit `aria-label` in Portuguese (`"Página anterior"`, `"Próxima página"`, `"Primeira página"`, `"Última página"`) — ensures correct screen-reader announcement even when the visible text label is present. |
| **AC-9** | jest-axe asserts `toHaveNoViolations()` in **light AND dark** across at least: Default composition, Active state, Disabled state. |
| **AC-10** | Behavioral test suite ≥ 20 tests OR ≥ 80% file coverage using accessible queries (`getByRole`, `getByLabelText`); no internal-collaborator mocks. |
| **AC-11** | Storybook `Pagination.stories.tsx` covers Default + Active + Disabled + ManyPagesWithEllipsis + Edges + Sizes + DarkTheme (≥ 7 stories) and renders correctly in both themes. |
| **AC-12** | `docs/src/pages/componentes/pagination.astro` + `docs/src/previews/pagination.tsx` published; `Pagination` added to the `MIGRATED` Set in `docs/src/pages/index.astro`. |
| **AC-13** | `npm run typecheck && npm run lint && npm run test && npm run build && npm run docs:build` all green. |
| **AC-14** | Single atomic commit `feat(pagination): migrate to v0.1.0 DoD — ...` per `lex-small-commits`. PR body closes both `#80` (parent) and `#81` (plan). |

## Definition of Done (mirrors Plan #81)

- Storybook variants in light + dark — covered by AC-11.
- Playground side-by-side recorded in PR — handled at PR creation.
- Behavioral tests + jest-axe — AC-9, AC-10.
- Brand: tokens semânticos via `buttonVariants` — AC-6.
- Build pipeline green — AC-13.
- Single atomic commit — AC-14.

## Out of scope

- Monolithic controlled `<Pagination page pageCount>` API from the legacy reference (`ux_references/`). Divergência ratificada em ADR-018 — multi-parte shadcn-style permanece.
- Sonner-style deprecation of any existing API surface (não há).
- Refactor de consumidores externos (não há fora do design-system).
