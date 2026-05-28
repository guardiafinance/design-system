# Brief — Issue #39 (parent #38)

- **Plan sub-issue:** [#39 — Plan: review Combobox against v0.1.0 DoD](https://github.com/guardiatechnology/design-system/issues/39)
- **Parent Issue:** [#38 — chore(combobox): review Combobox for v0.1.0 DoD (playground approval)](https://github.com/guardiatechnology/design-system/issues/38)
- **Epic:** #13 (v0.1.0)
- **Category:** Forms
- **Assignee:** @fernandoseguim
- **Status (Plan):** `status: development` (transitioned from `status: todo` at flow start)

## Context

`Combobox` foi migrado para o novo DoD **antes** das três regras transversais entrarem em vigor:

1. Aprovação por playground.
2. Cobertura Storybook em light + dark via toolbar global + story `DarkTheme` dedicada.
3. Validação Brand contra Notion como fonte da verdade (Notion MCP agora habilitado via PR #216).

A infraestrutura transversal está **on main** e não precisa ser refeita:

| Infra | Origem | Status |
|---|---|---|
| Storybook toolbar light/dark + `applyThemeSync` | PR #119 | merged |
| Astro playground cross-iframe theme toggle | PR #119 | merged |
| `ui_kit/test-utils/a11y.ts::axeInThemes` helper | Tech Task #125 | merged |
| Notion MCP habilitado | PR #216 | merged |
| Canonical `status:*` labels | PR #215 | merged |

## Estado atual do componente

- **Source:** `ui_kit/components/combobox/index.tsx` — 434 linhas. Base: Radix Popover + `lucide-react` (Check, ChevronDown, Search, X). Não compõe outros primitivos do design-system (não há `Input`/`Popover` próprios consumidos), portanto a verificação Brand é local.
- **Tokens consumidos:** `bg-background`, `text-fg`, `border-border-strong`, `border-action`, `ring-ring`, `bg-action`, `text-button-fg`, `bg-bg-hover/60`, `text-fg-muted`, `bg-destructive` — todos via Tailwind/CVA, sem hex hardcoded.
- **A11y de listbox:** trigger `role="combobox"`, list `role="listbox"`, options `role="option"`, com `aria-expanded`, `aria-haspopup="listbox"`, `aria-controls`, `aria-activedescendant`, `aria-selected`, `aria-invalid` — wiring completo conforme ARIA Authoring Practices.
- **Stories existentes:** Default, WithDefaultValue, WithLeftIcon, Clearable, LongList, Sizes, Invalid, Disabled, WithDisabledOption, EmptyState (10 stories) — **sem story `DarkTheme`** dedicada (apenas toolbar global).
- **Tests existentes:** 35 `it()` em `combobox.test.tsx` (~373 linhas), incluindo:
  - 25 testes comportamentais (queries acessíveis: `getByRole`, `getByPlaceholderText`, `getByText`).
  - 4 testes de traceability (zero-hardcoded-palette, hover/open border, selected bg/fg, active-not-selected halo).
  - **6 cenários `axeInThemes`** cobrindo: default-closed, opened-no-selection, opened-with-selection, invalid, disabled, clearable-with-value.
- **Astro playground:** `docs/src/pages/componentes/combobox.astro` ativo (BasicRow, WithLeftIconRow, ClearableRow, LongListRow, SizesRow, StatesRow, FormSubmitRow, LiveComboboxSnippet) + source view via `?raw`.

## Conhecidos transversais (não escopo deste Plan)

- **`--primary` laranja vs Notion violeta CTA** → rastreado por **Plan #208** (Brand inversion). Combobox usa `--action` (violet light / orange dark) para focus ring + selected highlight; documentado, não tocar mapeamento de tokens.
- **`color-contrast` opt-out no `parameters.a11y`** da story (Combobox.stories.tsx:42-51): o token `--fg-muted` aplicado ao placeholder do trigger fica logo abaixo do limiar 4.5:1 do axe normal-text. O opt-out tem WHY-comment apontando para o Plan #128 de revisão do `--fg-muted`. Mantemos como está; **não é gap deste Plan**.

## Unknowns

- Confirmar via Notion MCP que cores/tipografia/voz não divergem do espelho local (`lex-brand-colors`, `lex-brand-typography`) **especificamente para o estado focused/selected do Combobox**.
- Verificar se a DoD do parent #38 menciona algum estado de a11y adicional não coberto pelos 6 cenários atuais (e.g. `no-results` / `with-disabled-option`).

## Goal

Fechar a lacuna de aprovação por playground + adicionar a story `DarkTheme` faltante + (se aplicável) estender a11y para cenários do DoD não cobertos + confirmar Brand contra Notion. Single PR `Closes #39`.
