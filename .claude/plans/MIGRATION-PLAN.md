# Plano de migração — `src/` → `ui_kit/`

> Guardia Design System · Tailwind v4 + Astro docs + React + CVA + Vitest
> Branch de trabalho: `seguim/stoic-villani-392427`
> Última atualização: **2026-04-28**

---

## 1. Escopo geral

A migração consiste em portar cada componente do legado `src/` para o novo `ui_kit/`,
respeitando o **Definition of Done (DoD)** abaixo:

| # | Entregável | Local |
|---|---|---|
| 1 | Componente React (Tailwind v4 + CVA + Radix quando aplicável) | `ui_kit/components/<kebab-name>/index.tsx` |
| 2 | Testes Vitest + Testing Library | `ui_kit/components/<kebab-name>/<Name>.test.tsx` |
| 3 | Stories Storybook | `ui_kit/components/<kebab-name>/<Name>.stories.tsx` |
| 4 | Página de documentação Astro | `docs/src/pages/componentes/<kebab-name>.astro` |
| 5 | Previews (estáticos + react-live) | `docs/src/previews/<kebab-name>.tsx` + `<kebab-name>-live.tsx` |
| 6 | Export no barrel | `ui_kit/components/index.ts` |
| 7 | Inclusão no registry `MIGRATED` | `docs/src/pages/index.astro` |

Cada componente vira **2 commits**: `feat(<name>)` (código + testes + stories) e
`docs(<name>)` (página + previews + MIGRATED).

---

## 2. Status por categoria

### ✅ Primitivos — 10/10 (concluído)

| Componente | Status | Commit feat | Commit docs |
|---|---|---|---|
| Avatar | ✅ | — | — |
| Badge | ✅ | — | — |
| Button | ✅ | — | — |
| ButtonGroup | ✅ | — | — |
| Chip | ✅ | — | — |
| IconButton | ✅ | — | — |
| Label | ✅ | — | — |
| Separator | ✅ | `ed2ec2d` | — |
| Skeleton | ✅ | `522bfa6` | `53652a8` |
| Spinner | ✅ | `d2866f2` | `2039a6e` |

### 🟡 Forms — 8/11 (em andamento)

Migração ordenada alfabeticamente.

| # | Componente | Status | Commit feat | Commit docs | Observações |
|---|---|---|---|---|---|
| 1 | Checkbox | ✅ | `69995e3` | `4d51cbe` | Radix Checkbox + sizes/indeterminate/invalid/label+desc · 19 testes |
| 2 | Combobox | ✅ | `fc2c1e9` | `8b5e25f` | Radix Popover + listbox custom + filtro · 24 testes |
| 3 | DatePicker | ✅ | `91fee2f` | `77a7484` | react-day-picker v9 · pt-BR · ISO YYYY-MM-DD · 23 testes |
| 4 | FileUpload | ✅ | `52d78a1` | `ced080d` | Auto-upload + dropzone + variant button + AbortController · 51 testes |
| 5 | FormLayout | ✅ | `97deae0` | — | Compound: Header/Section/Row/Field/Actions/Divider · 30 testes |
| 6 | Input | ✅ | `3181188` | — | Wrapper wip-style + leftIcon/rightIcon/prefix/suffix · 20 testes |
| 7 | Radio | ✅ | `a88164d` | `7116455` | Radix Radio Group + RadioGroup compound · 23 testes |
| 8 | Select | ✅ | `5dda7b7` | — | Radix Popover + listbox custom (Combobox sem busca) · 23 testes |
| 9 | **Slider** | ⚠️ **REFAZER** | — | — | **Trabalho perdido** — ver §4 |
| 10 | Switch | ⏳ pendente | — | — | — |
| 11 | Textarea | ⏳ pendente | — | — | — |

### ⏳ Overlays — 0/9 (não iniciado)

Alert · ConfidenceIndicator · Dialog · Drawer · EmptyState · Menu · Popover · Toast · Tooltip

### ⏳ Navigation — 0/8 (não iniciado)

Accordion · Breadcrumbs · Command (⌘K) · Pagination · SidebarNav · Stepper · Tabs · TopBar

### ⏳ Data Display — 0/12 (não iniciado)

AgentCard · Card · Chart · Calendar · ChatMessage · DataTable · Kanban · MetricCard · Progress · Reconciliation · Timeline · Tree

### ⏳ Brand — 0/2 (não iniciado)

Logo · Logotipo

### Resumo numérico

| Categoria | Migrado | Total | % |
|---|---|---|---|
| Primitivos | 10 | 10 | 100% |
| Forms | 8 | 11 | 73% |
| Overlays | 0 | 9 | 0% |
| Navigation | 0 | 8 | 0% |
| Data Display | 0 | 12 | 0% |
| Brand | 0 | 2 | 0% |
| **Total** | **18** | **52** | **35%** |

---

## 3. Próximos passos imediatos

Em ordem:

1. **Slider** — recriar do zero o que foi perdido:
   - `ui_kit/components/slider/index.tsx` (wrapper de `<input type="range">`)
   - Estilos globais `.guardia-slider` em `ui_kit/styles/index.css`
     (tracks `::-webkit-slider-runnable-track` + `::-moz-range-track`/`::-moz-range-progress`,
     thumbs, focus rings, sizes sm/md, invalid, disabled)
   - CSS custom prop `--pct` para gradient fill point
   - API: `value/onValueChange(number)` + nativo `onChange` + `min/max/step`
     + `size sm/md` + `showValue` + `prefix/suffix/format(v)` + `invalid` + `disabled`
   - Testes (~23) + stories + página Astro + previews + barrel + MIGRATED

2. **Switch** — Radix Switch · sizes sm/md · label/description · invalid · disabled.

3. **Textarea** — paridade com Input (estados/sizes) + autoSize opcional + counter.

> Após Switch e Textarea, fechamos a categoria **Forms (11/11)** e iniciamos **Overlays**.

---

## 4. Lições aprendidas

### Worktree perdido (incidente Slider)

- Toda a migração foi feita num worktree em `.claude/worktrees/stoic-villani-392427/`.
- O Slider foi codificado, estilizado e documentado, **mas não commitado**.
- O repositório principal acabou voltando para `main` e o worktree foi removido — o
  trabalho não-commitado se perdeu.
- **Mitigação adotada agora**: commitar imediatamente após o DoD de cada componente,
  antes de seguir para o próximo. "Sim, prosseguir" só após `git commit`.

### Quirks técnicos descobertos

- **Astro parser × `<code>` + `{}`**: `<code class="inline">{`{ a, b }`}</code>` em
  `.astro` (JSX expression contendo template literal com chaves) gera tags `<code>`
  vazias parasitas. Solução: usar entidades HTML `&#123;` e `&#125;`.
- **Hidden input × `toBeRequired()`**: `<input type="hidden" required>` não passa no
  matcher. Trocar por `toHaveAttribute("required")`.
- **`invalid` em DOM nativo**: `FormLayout.Field` só injeta a prop `invalid` quando o
  filho é componente custom (`typeof onlyChild.type !== "string"`).
- **Radix Radio Group × jsdom**: setas de teclado movem foco mas não auto-selecionam
  no jsdom — testar movimento de foco, não selectedness.
- **`userEvent.upload` respeita `accept`**: para testar validação por extensão/MIME,
  usar `fireEvent.drop` com `dataTransfer`.

### ARIA — Select × Combobox (decisão de produto)

- Mantidos como **componentes separados** (Option A):
  - **Select** = combobox sem autocomplete (lista curta, sem filtro de digitação).
  - **Combobox** = combobox com autocomplete (lista longa, com filtro de digitação).
- Ambos compartilham arquitetura: Radix Popover + listbox custom · `role="combobox"` no
  trigger · `role="listbox"`/`role="option"` no popup · skip de itens disabled na navegação.

---

## 5. Branches & commits relevantes

```
seguim/stoic-villani-392427 (48 commits ahead of origin/master)
├─ 7116455 docs(radio): page, previews and MIGRATED registry entry
├─ a88164d feat(radio): replace radio-group with compound Radio + RadioGroup
├─ 97deae0 feat(form-layout): new compound primitive for Guardia form skeletons
├─ 5dda7b7 feat(select): replace native select with Radix Popover + custom listbox
├─ 3181188 feat(input): wip parity — sizes, states, icons, prefix/suffix
├─ ced080d docs(file-upload): page, previews and MIGRATED registry entry
├─ 52d78a1 feat(file-upload): new primitive — dropzone + button variants, validation, auto-upload
├─ 77a7484 docs(date-picker): page, previews and MIGRATED registry entry
├─ 91fee2f feat(date-picker): new primitive — single-date popover with pt-BR locale
├─ 8b5e25f docs(combobox): page, previews and MIGRATED registry entry
├─ fc2c1e9 feat(combobox): new primitive — searchable dropdown for long lists
├─ 4d51cbe docs(checkbox): page, previews and MIGRATED registry entry
├─ 69995e3 feat(checkbox): wip parity — sizes, indeterminate, invalid, label + description
├─ 2039a6e docs(spinner): page, previews and MIGRATED registry entry
├─ d2866f2 feat(spinner): new primitive with wip-parity sizing and AAA hardening
├─ ed2ec2d fix(separator): wip parity — visible dashed/dotted, vertical period, label
├─ 1544c1f build(styles): expose fg / fg-muted / fg-subtle as Tailwind colors
├─ 53652a8 docs(skeleton): page, previews and MIGRATED registry entry
├─ 522bfa6 feat(skeleton): four variants, lines support, AAA motion + a11y
└─ f6d4b72 build(styles): add skeleton tokens, shimmer keyframes and bg utility
```

---

## 6. Convenções recapituladas

- **Tailwind v4**: `@theme inline` com tokens · `@utility` para utilitários customizados.
- **CVA**: variants por componente · `slots` quando há múltiplos elementos estilizados.
- **Radix**: usar primitivo quando há semântica (Checkbox, Popover, RadioGroup, Label).
- **Refs**: `forwardRef` aponta para o elemento DOM relevante (input/button) para compat
  com código legado e `react-hook-form`.
- **A11y**: `role`/`aria-*` corretos · navegação por teclado · focus rings AAA · labels.
- **Testes**: cobrir variantes, estados, interação, a11y · idealmente ≥ 20 por componente.
- **Stories**: 1 default + 1 por variant principal + 1 com edge cases.
- **Docs Astro**: hero · API table · variantes · estados · acessibilidade · playground
  react-live · receita "quando usar".

---
