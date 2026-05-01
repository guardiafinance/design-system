# MIGRATE_CONTROL — Controle rigoroso da migração

> **Fonte única da verdade.** Toda outra fonte (MIGRATED Set, pastas, `MIGRATION-PLAN.md`,
> `ROTEIRO-MIGRACAO.md`) é informativa. **Aqui** é o que vale.

---

## 0. Regras invioláveis

> Estas regras não podem ser contrariadas por mim (Claude) nem pelo Fernando.
> Qualquer desvio interrompe a migração até ser corrigido.

### Regra 1 — Aprovação explícita por playground

Uma migração **só é considerada efetiva** quando o Fernando:

1. Abre `old/ui_kits/components/<Name>/<Name>.playground.html` (referência visual e funcional).
2. Compara com o novo código em `ui_kit/components/<slug>/` (rodando no Storybook ou na página `docs/src/pages/componentes/<slug>.astro`).
3. **Diz explicitamente "está bom"** (ou equivalente sem ambiguidade).

Sem essa aprovação, o status fica em **🟡 em revisão**, não em ✅.

### Regra 2 — 1 commit por componente

Cada componente migrado vira **um único commit**. Sem exceções:

- ❌ Não pode "feat + docs" como 2 commits separados (padrão antigo).
- ❌ Não pode tocar 2 componentes no mesmo commit.
- ✅ Um commit cobre: código (`ui_kit/components/<slug>/`) + testes + stories + docs Astro + previews + barrel + `MIGRATED` Set.

Mensagem padrão: `feat(<slug>): migrate from old/ — <resumo curto>`.

### Regra 3 — Estados possíveis (sem meio-termo)

| Estado | Significado |
|---|---|
| `⏳ pendente` | Não iniciada |
| `🟡 em revisão` | Código completo + DoD passando, aguardando aprovação por playground |
| `✅ aprovado` | Fernando comparou e disse "está bom" |
| `🔄 retrabalho` | Aprovação rejeitada — voltar a corrigir |

> Componente em `🟡` que ainda não passou pelo gate de aprovação **não conta como migrado** para nenhum efeito (catálogo, releases, comunicação interna).

### Regra 4 — DoD obrigatório antes de submeter para aprovação

Antes de marcar 🟡 em revisão, todos os itens devem estar feitos:

- [ ] `ui_kit/components/<slug>/index.tsx` (paridade com `old/.../index.tsx`)
- [ ] `<Name>.test.tsx` — ≥ 20 testes ou ≥ 80% cobertura no arquivo
- [ ] `<Name>.stories.tsx` — todas as variantes principais
- [ ] `docs/src/pages/componentes/<slug>.astro`
- [ ] `docs/src/previews/<slug>.tsx` (+ `<slug>-live.tsx` quando aplicável)
- [ ] Export em `ui_kit/components/index.ts`
- [ ] Entry no `MIGRATED` Set em `docs/src/pages/index.astro`
- [ ] Sem cores hardcoded (só tokens semânticos)
- [ ] `npm run typecheck && npm run lint && npm run test && npm run build && npm run docs:build` — todos verdes

### Regra 5 — `old/` é READ-ONLY

A pasta `old/ui_kits/components/` é **fonte de leitura apenas**. Nunca importar dela, nunca editar.

---

## 1. Universo total (52 componentes)

Lista canônica derivada de `old/ui_kits/components/`. Status atualizado a cada commit.

### Primitivos (10)

| # | Componente | Status | Commit | Aprovado em |
|---|---|---|---|---|
| 1 | Avatar | 🟡 em revisão | (vários, padrão antigo) | — |
| 2 | Badge | 🟡 em revisão | (vários, padrão antigo) | — |
| 3 | Button | 🟡 em revisão | (vários, padrão antigo) | — |
| 4 | ButtonGroup | 🟡 em revisão | (vários, padrão antigo) | — |
| 5 | Chip | 🟡 em revisão | (vários, padrão antigo) | — |
| 6 | IconButton | 🟡 em revisão | (vários, padrão antigo) | — |
| 7 | Label | 🟡 em revisão | (vários, padrão antigo) | — |
| 8 | Separator | 🟡 em revisão | `ed2ec2d` | — |
| 9 | Skeleton | 🟡 em revisão | `522bfa6` + `53652a8` | — |
| 10 | Spinner | 🟡 em revisão | `d2866f2` + `2039a6e` | — |

### Forms (11)

| # | Componente | Status | Commit | Aprovado em |
|---|---|---|---|---|
| 11 | Checkbox | 🟡 em revisão | `69995e3` + `4d51cbe` | — |
| 12 | Combobox | 🟡 em revisão | `fc2c1e9` + `8b5e25f` | — |
| 13 | DatePicker | 🟡 em revisão | `91fee2f` + `77a7484` | — |
| 14 | FileUpload | 🟡 em revisão | `52d78a1` + `ced080d` | — |
| 15 | FormLayout | 🟡 em revisão | `97deae0` | — |
| 16 | Input | 🟡 em revisão | `3181188` | — |
| 17 | Radio | 🟡 em revisão | `a88164d` + `7116455` | — |
| 18 | Select | 🟡 em revisão | `5dda7b7` | — |
| 19 | **Slider** | ⏳ pendente | — | — |
| 20 | **Switch** | ⏳ pendente | — | — |
| 21 | **Textarea** | ⏳ pendente | — | — |

### Overlays & feedback (9)

| # | Componente | Status | Commit | Aprovado em |
|---|---|---|---|---|
| 22 | Alert | ⏳ pendente | — | — |
| 23 | ConfidenceIndicator | ⏳ pendente | — | — |
| 24 | Dialog | ⏳ pendente | — | — |
| 25 | Drawer | ⏳ pendente | — | — |
| 26 | EmptyState | ⏳ pendente | — | — |
| 27 | Menu | ⏳ pendente | — | — |
| 28 | Popover | ⏳ pendente | — | — |
| 29 | Toast | ⏳ pendente | — | — |
| 30 | Tooltip | ⏳ pendente | — | — |

### Navegação (8)

| # | Componente | Status | Commit | Aprovado em |
|---|---|---|---|---|
| 31 | Accordion | ⏳ pendente | — | — |
| 32 | Breadcrumbs | ⏳ pendente | — | — |
| 33 | Command | ⏳ pendente | — | — |
| 34 | Pagination | ⏳ pendente | — | — |
| 35 | SidebarNav | ⏳ pendente | — | — |
| 36 | Stepper | ⏳ pendente | — | — |
| 37 | Tabs | ⏳ pendente | — | — |
| 38 | TopBar | ⏳ pendente | — | — |

### Dados & conteúdo (12)

| # | Componente | Status | Commit | Aprovado em |
|---|---|---|---|---|
| 39 | AgentCard | ⏳ pendente | — | — |
| 40 | Calendar | ⏳ pendente | — | — |
| 41 | Card | ⏳ pendente | — | — |
| 42 | Chart | ⏳ pendente | — | — |
| 43 | ChatMessage | ⏳ pendente | — | — |
| 44 | DataTable | ⏳ pendente | — | — |
| 45 | Kanban | ⏳ pendente | — | — |
| 46 | MetricCard | ⏳ pendente | — | — |
| 47 | Progress | ⏳ pendente | — | — |
| 48 | Reconciliation | ⏳ pendente | — | — |
| 49 | Timeline | ⏳ pendente | — | — |
| 50 | Tree | ⏳ pendente | — | — |

### Brand (2)

| # | Componente | Status | Commit | Aprovado em |
|---|---|---|---|---|
| 51 | Logo | ⏳ pendente | — | — |
| 52 | Logotipo | ⏳ pendente | — | — |

---

## 2. Resumo numérico

| Estado | Total | % |
|---|---|---|
| ✅ aprovado | 0 | 0% |
| 🟡 em revisão | 18 | 35% |
| ⏳ pendente | 34 | 65% |
| 🔄 retrabalho | 0 | 0% |
| **Total** | **52** | 100% |

---

## 3. Workflow operacional

### Para cada componente da fila

```
1. Abrir old/ui_kits/components/<Name>/{index.tsx, index.css, <Name>.playground.html}
2. Migrar para ui_kit/components/<slug>/ com Tailwind v4 + CVA + Radix (quando aplicável)
3. Escrever <Name>.test.tsx (≥20 testes)
4. Escrever <Name>.stories.tsx
5. Criar docs/src/pages/componentes/<slug>.astro + previews
6. Atualizar ui_kit/components/index.ts (export) e MIGRATED Set
7. Rodar: typecheck + lint + test + build + docs:build (tudo verde)
8. Marcar status 🟡 em revisão neste arquivo
9. Submeter ao Fernando: "abra old/<Name>/<Name>.playground.html e compare com a página/Storybook"
10. Aguardar "está bom" explícito
11. SÓ ENTÃO commitar — único commit, mensagem feat(<slug>): migrate from old/ — ...
12. Atualizar status para ✅ aprovado neste arquivo + commit hash
```

### O que entra no commit (o único)

```
ui_kit/components/<slug>/index.tsx
ui_kit/components/<slug>/<Name>.test.tsx
ui_kit/components/<slug>/<Name>.stories.tsx
ui_kit/components/index.ts                               (linha de export)
docs/src/pages/componentes/<slug>.astro
docs/src/previews/<slug>.tsx
docs/src/previews/<slug>-live.tsx                        (se aplicável)
docs/src/pages/index.astro                               (MIGRATED Set)
MIGRATE_CONTROL.md                                       (status + commit hash)
ui_kit/styles/index.css                                  (somente se tokens novos)
```

Nada fora dessa lista pode entrar no mesmo commit.

---

## 4. Histórico de aprovações

Quando Fernando aprovar, registrar abaixo:

| Data | Componente | Commit | Notas |
|---|---|---|---|
| — | — | — | — |

---

## 5. Pendências de retro-aprovação

Os 18 componentes marcados 🟡 em revisão foram migrados **antes** desta regra entrar em
vigor. Eles passaram pelo DoD técnico mas **não tiveram aprovação explícita por playground**.

Opções para o Fernando decidir:

- **(A)** Validar todos os 18 em batch (sessão de revisão dedicada).
- **(B)** Validar sob demanda, conforme cada um seja relevante.
- **(C)** Re-migrar do zero do `old/` (mais conservador).

> Até que essa decisão seja tomada e os componentes aprovados, eles permanecem 🟡.

---

## 6. Próximo da fila

**Próximo a migrar:** Slider (#19)
**Após Slider:** Switch (#20) → Textarea (#21) → fecha categoria Forms.

---
