# ADR-018 — Migrate Pagination to v0.1.0 DoD (Navigation)

- **Status:** accepted
- **Date:** 2026-05-29
- **Deciders:** @fernandoseguim (CODEOWNER), `warrior-athena` (Issue-Driven flow orchestrator)
- **Precedents:** ADR-006 (Menu consolidation), ADR-010 (Dialog), ADR-011 (Alert), ADR-014 (Toast) — recipe shadcn-style multi-parte com tokens semânticos do design-system
- **Issue:** [#80](https://github.com/guardiatechnology/design-system/issues/80)
- **Plan:** [#81](https://github.com/guardiatechnology/design-system/issues/81)

## Context

`Pagination` integra o catálogo canônico de 52 componentes do `@guardia/design-system` v0.1.0, categoria **Navigation**. O baseline atual em `ui_kit/components/pagination/index.tsx` já existe como wrapper shadcn-style multi-parte (9 símbolos: Pagination + Content + Item + Link + Previous + Next + First + Last + Ellipsis), porém falha o DoD do v0.1.0 em quatro frentes objetivas:

1. **Ausência de testes.** `Pagination.test.tsx` inexistente; sem cobertura behavioral, sem jest-axe light + dark — viola `lex-frontend-testing` e diretriz Notion Dark Mode.
2. **Stories minimal.** Apenas `Default` declarada — falta cobertura visual de Active, Disabled, Many pages with ellipsis, Edges (First/Last), Sizes, DarkTheme.
3. **Documentação Astro ausente.** `docs/src/pages/componentes/pagination.astro` não existe; o Set `MIGRATED` em `docs/src/pages/index.astro` não inclui `Pagination` — o sidebar não rotea para a página migrada.
4. **A11y lint pendente.** Issue body cita "Corrigir erro de a11y no lint". Embora `PaginationEllipsis` já tenha `aria-hidden` no wrapper, os botões `PaginationPrevious/Next/First/Last` não declaram `aria-label` explícito (depende apenas do `<span>` visível interno), e o handler `onKeyDown` cobre apenas Enter+Space sem `aria-disabled` rigor.

A referência legacy em `ux_references/ui_kits/components/Pagination/` (`Pagination.playground.html` + `index.tsx` + `index.css`) documenta uma **API monolítica controlada** completamente distinta: `<Pagination page={1} pageCount={42} onChange={setP} siblingCount={1} showEdges size="md" />` — componente único que renderiza internamente o range numérico com elipses calculadas.

A decisão arquitetural central é: **mantemos a API multi-parte shadcn-style (composição) ou regredimos para a API monolítica controlada da referência legacy?**

## Decision

Migrar Pagination ao v0.1.0 DoD **mantendo a API multi-parte shadcn-style** (composição), com fixes de a11y explícitos, suíte de testes behavioral completa, stories ampliadas, página Astro publicada, e ADR `accepted` desde o primeiro commit. Decisões cravadas:

1. **Mantemos API multi-parte (9 símbolos).** Composição via `Pagination` + `PaginationContent` + `PaginationItem` + `PaginationLink` + variantes prev/next/first/last + ellipsis. Razão: alinhamento com Breadcrumb, NavigationMenu, Menu (ADR-006) já migrados — o catálogo Navigation inteiro usa composição shadcn-style. Regredir para API monolítica criaria divergência cognitiva no catálogo.

2. **Divergência da referência legacy registrada.** A API controlada `<Pagination page pageCount onChange>` da `ux_references/ui_kits/components/Pagination/` **não é replicada**. Justificativa: composição entrega mais flexibilidade (consumidor decide range, ellipsis, edges) sem custar a a11y. Consumidores que precisam do range calculator constroem a partir das primitivas — futura iteração pode adicionar utility `usePaginationRange()` se a demanda materializar (não está no escopo).

3. **Token contract via `buttonVariants`.** `PaginationLink` ativo usa `outline`; idle usa `ghost`. Zero token novo. Reuso direto do chassis Button — o investimento de Button paga aqui sem mais expansão.

4. **A11y wiring explícito (fix do lint pendente):**
   - `Pagination` root: `<nav role="navigation" aria-label="pagination">` (mantido).
   - `PaginationPrevious/Next/First/Last`: cada um declara `aria-label` em pt-BR (`"Página anterior"`, `"Próxima página"`, `"Primeira página"`, `"Última página"`). O `<span>` visível continua presente para affordance visual; o `aria-label` garante anúncio correto em screen reader.
   - `PaginationEllipsis`: `<span aria-hidden="true">` envolve o ícone `MoreHorizontal`; um `<span className="sr-only">Mais páginas</span>` sibling anuncia para screen reader.
   - `PaginationLink` sem `href` usa `role="button"` + `tabIndex={0}` + handler Enter+Space (já existente, ratificado).
   - `PaginationLink` com `disabled` usa `aria-disabled="true"` + `tabIndex={-1}` + `e.preventDefault()` no `onClick` (já existente, ratificado).

5. **Suíte de testes behavioral.** `Pagination.test.tsx` exercita ≥ 20 asserts cobrindo AC-1..AC-10 com queries acessíveis (`getByRole`, `getByLabelText`), sem mockar colaboradores internos. jest-axe em light + dark sobre Default, Active, Disabled — mínimo de **6 asserts axe** (3 estados × 2 temas) garantidos via `axeInThemes()` de `@/test-utils/a11y`.

6. **Stories ≥ 7.** Default + Active + Disabled + ManyPagesWithEllipsis + Edges + Sizes + DarkTheme. Light + dark cobertos pela story DarkTheme + visual regression baseline regenerada.

7. **Astro page + previews.** `docs/src/pages/componentes/pagination.astro` segue o recipe canônico (kicker, group, sourcePath, storybookId, lede, sections). `docs/src/previews/pagination.tsx` exporta `BasicRow`, `ActiveRow`, `DisabledRow`, `EllipsisRow`, `EdgesRow`. `MIGRATED.add("Pagination")` em `index.astro`.

8. **Single atomic commit + ADR `accepted` desde o primeiro commit.** Commit `feat(pagination): migrate to v0.1.0 DoD — ...` carrega código + testes + stories + Astro + ADR + edits do MIGRATED set. Sem pattern `proposed → accepted` (Argos sinalizou 🟡 em PR #237 quando esse pattern foi seguido).

9. **Visual regression baselines regeneradas via CI.** As baselines existentes em `__image_snapshots__/components/pagination/{light,dark}/` foram geradas contra a story `Default` única. As 7+ stories novas invalidarão essas baselines. Estratégia documentada: abrir PR, deixar `visual-regression` CI falhar, aplicar label `regenerate-baselines` (autorizado por Fernando até 2026-05-29 ~22:30 UTC) — Ubuntu/CI rendered baselines são fonte da verdade; macOS local nunca commitado.

## Consequences

### Positive

- Pagination alcança paridade DoD com Alert / Dialog / Drawer / ConfidenceIndicator / Toast (mesmo recipe shadcn-style multi-parte, mesmo token contract via `buttonVariants`, mesmo rigor de teste com `axeInThemes`).
- A11y lint pendente resolvido — `aria-label` explícito em todos os botões prev/next/first/last + sr-only sibling no ellipsis.
- Catálogo Navigation avança 1 componente em direção ao 52 do v0.1.0.
- Zero novas dependências; zero expansão de token; zero churn em consumidores.

### Negative

- **Divergência da API legacy mantida.** Consumidores que viram o playground legacy esperando `<Pagination page pageCount onChange>` precisam compor a partir das primitivas. Mitigado pela Astro page com exemplo de composição.
- Baselines visuais antigas precisam ser regeneradas (CI rerun + label `regenerate-baselines`) — operacional, não bloqueante.

### Neutral

- Tamanho do arquivo `index.tsx` cresce de ~170 linhas para ~200 (adição de `aria-label` explícitos + comentário canônico do componente). Sem impacto em bundle (Tree-shaking preservado).
- 1 novo arquivo de teste, 1 nova Astro page, 1 novo preview, 1 ADR. Total: ~5 arquivos novos + 3 modificados (index.tsx, stories, MIGRATED set).

## References

- `ux_references/ui_kits/components/Pagination/` — referência visual + API legacy (divergência justificada acima).
- ADR-006 (Menu consolidation), ADR-014 (Toast) — precedentes do recipe shadcn-style multi-parte.
- `lex-frontend-accessibility` Rules 1, 2, 6 — landmarks, keyboard, dynamic content.
- `lex-frontend-testing` Rules 1, 2 — behavioral tests, accessible queries.
- `lex-design-system-library` — composição sobre primitivas existentes (`buttonVariants`).
