# Issue Brief — #80 feat(pagination): migrate Pagination to v0.1.0 DoD

- **Author:** @fernandoseguim
- **Type:** Feature (migration)
- **Plan sub-issue:** [#81](https://github.com/guardiatechnology/design-system/issues/81)
- **Category:** Navigation
- **Repository:** guardiatechnology/design-system

## Context

`Pagination` integra o catálogo canônico de 52 componentes do `@guardia/design-system` v0.1.0. Hoje vive em `ui_kit/components/pagination/index.tsx` como wrapper shadcn-style multi-parte (Pagination + PaginationContent + PaginationItem + PaginationLink + PaginationPrevious + PaginationNext + PaginationFirst + PaginationLast + PaginationEllipsis) — funcional, mas abaixo do DoD em quatro frentes:

1. **Sem testes.** Não existe `Pagination.test.tsx`; sem cobertura behavioral, sem jest-axe light + dark.
2. **Stories minimal.** Existe apenas `Default`; faltam variantes (Active, Disabled, Many pages with ellipsis, Edges, Dark, Sizes).
3. **Sem Astro page.** `docs/src/pages/componentes/pagination.astro` ausente; `MIGRATED` set sem `Pagination`.
4. **A11y lint pendente.** Issue body cita "Corrigir erro de a11y no lint" — `PaginationEllipsis` tem `aria-hidden` no wrapper + `sr-only` filha, mas vale revisar `PaginationPrevious/Next/First/Last` (anchors com `<span>` label visível) e o handler `onKeyDown` (`role="button"` quando ausente href).

## Referência legacy

`ux_references/ui_kits/components/Pagination/` documenta API monolítica controlada `<Pagination page pageCount onChange siblingCount showEdges size>` que **diverge** intencionalmente da API atual multi-parte (escolha do design-system: composição shadcn-style alinhada com Breadcrumb, NavigationMenu, Menu). A migração v0.1.0 DoD mantém a API multi-parte estabelecida — divergência justificada na ADR-018.

## Unknowns resolved (no clarification needed)

- API shape: multi-parte permanece (ADR-018).
- Token migration: `buttonVariants` chain (já em uso).
- Lint fix: explicit `aria-label` em todos os botões prev/next/first/last (mesmo com `<span>` visível, ratifica anúncio screen reader).

## Pre-allocated artifacts

- ADR: [ADR-018](../../adr/ADR-018-pagination-v0.1.0-dod-migration.md) (slot pré-alocado por Fernando).
- Branch: `feat/80-pagination-v0.1.0-dod`.
- Worktree: `.claude/worktrees/agent-a51c9623176952d82/`.
