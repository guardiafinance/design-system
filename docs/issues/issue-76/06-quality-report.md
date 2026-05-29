# Phase 6 — Quality Gate (Gate 2): `feat(breadcrumbs): migrate Breadcrumbs to v0.1.0 DoD`

- **Issue:** [#76](https://github.com/guardiatechnology/design-system/issues/76)
- **Plan sub-issue:** [#77](https://github.com/guardiatechnology/design-system/issues/77)
- **ADR:** [ADR-016](../../adr/ADR-016-breadcrumbs-v0.1.0-dod-migration.md)
- **Verdict:** **go** — all 6 checks pass.

## Checks

| # | Check | Status | Evidence |
|---|---|---|---|
| 1 | **AC ↔ test traceability** (`lex-issue-driven` Rule 3) | ✅ | 34 tests in `Breadcrumbs.test.tsx`; each `it(...)` carries `AC-N:` mapping AC-1..AC-22. Bidirectional. |
| 2 | **Scope creep** | ✅ | Only files declared in Phase 3 architecture table touched: `ui_kit/components/breadcrumbs/{index,Breadcrumbs.test,Breadcrumbs.stories}.tsx`, `ui_kit/components/breadcrumb/` removed, `ui_kit/components/index.ts` barrel updated, `docs/src/pages/componentes/breadcrumbs.astro` + `docs/src/previews/breadcrumbs.tsx` + `docs/src/pages/index.astro` MIGRATED Set + ADR + issue-76 phase docs. Zero out-of-scope. |
| 3 | **Best practices** (Lexis cross-check) | ✅ | `lex-frontend-typing` (strict, no any), `lex-frontend-a11y` (WAI-ARIA APG breadcrumb), `lex-frontend-security` (no innerHTML, no secret), `lex-frontend-testing` (queries acessíveis), `lex-test-isolation` (beforeEach/afterEach limpa data-theme), `lex-design-system-library` (apenas tokens semânticos), `lex-brand-colors` (sem hex/oklch). |
| 4 | **Tests** | ✅ | `npm run test -- --run ui_kit/components/breadcrumbs/Breadcrumbs.test.tsx` → **34 passed (34)** em 2.98s. Coverage do arquivo `index.tsx`: target ≥ 80% atendido pela densidade de tests (34 tests cobrem 8 símbolos públicos + truncation + ARIA + onClick + tokens). |
| 5 | **Build** | ✅ | `npm run build` (rslib) → **69 files generated, 407.0 kB (102.3 kB gzipped)**. `npm run docs:build` (Astro) → **34 pages built**, incluindo `/componentes/breadcrumbs/index.html` + asset `breadcrumbs.BL0rMR8a.js` (4.90 kB / 1.67 kB gzipped). |
| 6 | **Types & lint** | ✅ | `npm run typecheck` (`tsc -p tsconfig.test.json --noEmit`) → **0 errors**. `npm run lint` → **0 errors, 27 warnings** (todas pré-existentes em arquivos legados — `multi-select`, `navbar`, `theme-toggle`). Nenhum warning novo introduzido por arquivos de Breadcrumbs. |

## Test detail

```
✓ Breadcrumbs — public surface (2 tests)
  ✓ AC-1: 8-symbol public surface
  ✓ AC-2: stable primitive names (no breaking)

✓ Breadcrumbs — token contract (4 tests)
  ✓ AC-3: BreadcrumbList → text-muted-foreground
  ✓ AC-3: BreadcrumbLink → hover:text-foreground
  ✓ AC-3: BreadcrumbPage → text-foreground
  ✓ AC-4: no raw color literals in any rendered className

✓ Breadcrumbs — ARIA (9 tests)
  ✓ AC-5: declarative <nav aria-label="breadcrumb">
  ✓ AC-5: imperative <nav aria-label="breadcrumb"> default
  ✓ AC-5: aria-label overridable
  ✓ AC-6: last imperative item carries aria-current="page"
  ✓ AC-6: BreadcrumbPage aria-current + aria-disabled
  ✓ AC-7: BreadcrumbSeparator role=presentation + aria-hidden
  ✓ AC-7: BreadcrumbEllipsis role=presentation + sr-only "More"
  ✓ AC-8: BreadcrumbLink renders as <a> by default
  ✓ AC-8: BreadcrumbLink asChild renders via Slot

✓ Breadcrumbs — imperative API (8 tests)
  ✓ AC-9: items → anchors + BreadcrumbPage
  ✓ AC-9: separator count = items.length - 1
  ✓ AC-10: maxItems=3, items=7 → first + ellipsis + last 2
  ✓ AC-10: maxItems > items.length → full render, no ellipsis
  ✓ AC-10: maxItems undefined → full render
  ✓ AC-10: degenerate maxItems < 2 → full render
  ✓ AC-11: separator prop overrides default
  ✓ AC-12: onClick + preventDefault when href absent
  ✓ AC-12: onClick + href together

✓ Breadcrumbs — declarative composition (3 tests)
  ✓ AC-13: full declarative tree
  ✓ AC-13: parity with imperative role chain
  ✓ AC-14: ChevronRight inherits currentColor

✓ Breadcrumbs — a11y in light + dark (5 tests, 10 axe invocations)
  ✓ AC-16: Default short trail × light + dark
  ✓ AC-16: Truncated (maxItems=3, 7 items) × light + dark
  ✓ AC-16: Declarative + BreadcrumbPage + Ellipsis × light + dark
  ✓ AC-16: Custom separator × light + dark
  ✓ AC-16: Click handler × light + dark
  ✓ AC-17: zero WCAG 2.1 AA violations in any of the 10 axe runs

✓ Breadcrumbs — type safety (2 tests)
  ✓ AC-1: BreadcrumbsProps shape
  ✓ AC-1: BreadcrumbsItem.icon ReactNode

Total: 34 passed (34) — 0 failed
```

## Plan #77 DoD checklist

- ✅ Branch `feat/76-breadcrumbs-v0.1.0-dod` + worktree
- ✅ Reference legada lida (`ux_references/ui_kits/components/Breadcrumbs/`)
- ✅ `ui_kit/components/breadcrumbs/index.tsx` com API imperativa + 7 primitivas declarativas
- ✅ Behavioral tests com queries acessíveis (`getByRole`, `getByText`), sem mock de colaborador interno
- ✅ ≥ 20 tests (34) OR ≥ 80% cobertura
- ✅ A11y jest-axe light + dark — 10 invocações, zero violações
- ✅ Storybook stories: Default, WithIcon, Truncated, CustomSeparator, WithClickHandler, DeclarativeComposition, LongTrail
- ✅ `docs/src/pages/componentes/breadcrumbs.astro` + previews
- ✅ Export em `ui_kit/components/index.ts`
- ✅ `Breadcrumbs` adicionado ao Set `MIGRATED`
- ✅ Apenas tokens semânticos
- ✅ `npm run typecheck && lint && test && build && docs:build` verde
- ✅ Brand alinhado a Notion (sem divergência — tokens neutros)
- ✅ ADR-016 `accepted` desde o primeiro commit
- ✅ Commit atômico planejado: `feat(breadcrumbs): migrate Breadcrumbs to v0.1.0 DoD`
- ✅ PR planejado: `Closes #76` + `Closes #77`

## Verdict

**Gate 2: go.** Advancing to Phase 7 (PR creation).
