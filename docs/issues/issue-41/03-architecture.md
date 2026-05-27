# Phase 3 — Architecture: Slider v0.1.0

> Slider é um wrapper trivial sobre `<input type="range">` + estilos CSS globais. **Nenhuma decisão arquitetural nova** justifica um ADR — a estrutura já está canonizada pelos componentes Forms anteriores (Switch, Checkbox, Input). Este documento serve como mapa de arquivos afetados e contrato de delegação para Hephaestus.

## Affected components (scope table)

Esta é a lista canônica para a validação de scope-creep em Gate 2 (`lex-issue-driven` Rule 6). Qualquer arquivo modificado fora desta lista bloqueia o gate até justificativa explícita.

| # | Path | Operation | Purpose | Linked ACs |
|---|------|-----------|---------|------------|
| 1 | `ui_kit/components/slider/index.tsx` | **create** | Wrapper React com CVA (`size: sm \| md`), API completa, forwardRef, controlled+uncontrolled. | AC-1, AC-3, AC-4, AC-5, AC-6, AC-7, AC-8 |
| 2 | `ui_kit/components/slider/Slider.test.tsx` | **create** | Suite de ≥ 20 testes de unidade comportamentais + jest-axe em light + dark. | AC-10, AC-11 |
| 3 | `ui_kit/components/slider/Slider.stories.tsx` | **create** | Stories Default / All sizes / Controlled / With format/prefix/suffix / Invalid / Disabled — light + dark. | AC-12 |
| 4 | `ui_kit/components/index.ts` | **modify** | Re-export `Slider` a partir de `./slider`. | AC-2 |
| 5 | `ui_kit/styles/index.css` | **modify** | Adicionar bloco `.guardia-slider` (tracks WebKit + Firefox, thumbs, focus rings, sizes, invalid, disabled, custom prop `--pct`). | AC-9 |
| 6 | `docs/src/pages/componentes/slider.astro` | **create** | Página Astro de documentação. | AC-13 |
| 7 | `docs/src/previews/slider.tsx` | **create** | Preview estático. | AC-13 |
| 8 | `docs/src/previews/slider-live.tsx` | **create** | Preview interativo (live). | AC-13 |
| 9 | `docs/src/pages/index.astro` | **modify** | Adicionar `"Slider"` ao Set `MIGRATED` (linha ~678). | AC-13 |

**Total:** 6 novos arquivos + 3 modificações cirúrgicas. Tamanho estimado de PR: `size/L` ou `size/XL` (ficaremos no upper bound porque a suite de testes + stories tende a empurrar o diff para 500+ linhas; o size labeler aplica automaticamente).

## Design pattern (parity with existing Forms components)

Hephaestus deve seguir a parity pattern dos siblings já no DoD:

- **CVA + forwardRef**: ver `ui_kit/components/switch/index.tsx` (precedente direto).
- **Boundary mocks only**: per `lex-frontend-testing` — não mocar colaboradores internos; usar queries acessíveis (`getByRole('slider')`, `getByLabelText`).
- **Apenas tokens semânticos**: `lex-brand-colors` + `lex-design-system-library` — proibido hex literal em `.guardia-slider`. CSS custom prop `--pct` é a única adição permitida.
- **A11y first**: `<input type="range">` é nativamente acessível (role="slider", keyboard, value-now/min/max). O wrapper preserva isso sem reescrever em ARIA manual.

## Branch + worktree

- **Base branch:** `main` (o repo default; Plan #15 diz "master" por inércia textual — Athena usa `main`).
- **Working branch:** `feat/14-slider` (conforme `lex-git-branches`).
- **Worktree:** `.worktrees/14-slider/` (conforme `lex-git-worktrees`).

## CVA shape (proposed; final shape stays at Hephaestus's discretion)

```tsx
const sliderVariants = cva("guardia-slider", {
  variants: {
    size: {
      sm: "guardia-slider--sm",
      md: "guardia-slider--md",
    },
    invalid: {
      true: "guardia-slider--invalid",
      false: "",
    },
    disabled: {
      true: "guardia-slider--disabled",
      false: "",
    },
  },
  defaultVariants: { size: "md", invalid: false, disabled: false },
});
```

> Padrão preferido: classes globais `.guardia-slider*` em `ui_kit/styles/index.css` para que o estilo do thumb/track (pseudo-elementos `::-webkit-slider-thumb`, `::-moz-range-thumb`) funcione — pseudo-elementos de elementos nativos NÃO podem ser estilizados via Tailwind utilities. Esta é a razão arquitetural pela qual o componente exige estilos globais e não apenas classes utilitárias.

## ADRs

**Nenhum.** O design não introduz nova decisão arquitetural: usa o mesmo CVA + forwardRef + estilos globais que outros componentes do design-system já consolidaram. Pseudo-elementos nativos exigem CSS global — isso é restrição do DOM, não escolha de arquitetura.

## Stacked PR decomposition

**Não aplicável.** Single component migration → single PR. Checklist `codex-stacked-prs` retornaria <3 sinais altos.

## Delegation handoff

| Field | Value |
|---|---|
| Delegate | `warrior-hephaestus` |
| Kata | `kata-frontend-implement` |
| Inputs | `.ahrena/issues/14/01-brief.md`, `02-requirements.md`, `03-architecture.md`, Plan #15 body |
| Authoritative spec | Plan #15 DoD checklist (1:1 mapping a AC-1..AC-13) |
| Required test annotation | `AC-N` em test name ou docstring |
| Working dir | `.worktrees/14-slider/` |
| Branch | `feat/14-slider` |
| Commit policy | **Single atomic commit** per `lex-small-commits`: `feat(slider): migrate to v0.1.0 DoD — wip parity, sizes, format, invalid` |
| Forbidden | `--no-verify`, `--admin`, force-push, baselines `__image_snapshots__/` from macOS, scope expansion para outros Forms |

## Next step

Gate 1 — apresentar brief + ACs + architecture e aguardar aprovação explícita do Fernando antes de iniciar a Phase 4.
