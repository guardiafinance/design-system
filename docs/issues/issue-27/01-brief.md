# Phase 1 — Brief: Plan #27 — Review IconButton against v0.1.0 DoD

## Issue

- **Plan sub-issue:** [#27 — Plan: review IconButton against v0.1.0 DoD](https://github.com/guardiatechnology/design-system/issues/27)
- **Parent (Tech Task):** [#26 — chore(icon-button): review IconButton for v0.1.0 DoD (playground approval)](https://github.com/guardiatechnology/design-system/issues/26)
- **Epic:** [#13 — v0.1.0 component review umbrella]
- **Author / Assignee:** @fernandoseguim
- **Labels:** `evolvability ♻️`, `status: todo`
- **Issue Type:** Plan
- **Repo:** `guardiatechnology/design-system`

## Context

`IconButton` foi migrado para o novo DoD **antes** das regras de aprovação por playground, cobertura dark mode no Storybook, jest-axe em light + dark e validação Brand contra o Notion entrarem em vigor. Sem este Plan, o componente não pode entrar no v0.1.0.

11 sibling Plans rodam em paralelo (#21, #23, #37, #39, #41, #43, #45, #47, #49, #51); este worktree fica isolado em `.worktrees/27-icon-button-review/` por `lex-git-worktrees`.

## Estado atual descoberto (current → target gap)

Inventário em `main @ 7856797` antes da execução:

| Arquivo | Tamanho | Estado |
|---|---:|---|
| `ui_kit/components/icon-button/index.tsx` | 144 LOC | Implementação completa: 5 variantes (default/secondary/destructive/outline/ghost), 3 tamanhos (sm/md/lg = 28/36/44px), 2 shapes (square/circle), `loading` com spinner motion-safe, `asChild` via Radix `Slot`, guardrail dev-only para `aria-label`/`aria-labelledby` |
| `ui_kit/components/icon-button/IconButton.stories.tsx` | 162 LOC | 8 stories (Default, Variants, Sizes, Shapes, Loading, Toolbar, Disabled, Formatting) — **sem story `DarkTheme` explícita** |
| `ui_kit/components/icon-button/icon-button.test.tsx` | 271 LOC | **19 declarações `it()`** (uma é `it.each` × 3 tamanhos = 21 casos efetivos) + bloco `describe("a11y")` com **3 testes `axeInThemes(container)` light + dark** já cobrindo Default, todas as 5 variants interativas e disabled+loading |

**Conclusão:** uma sessão anterior já entregou quase tudo. O delta real para fechar o DoD é mínimo:

1. Adicionar `export const DarkTheme` em `IconButton.stories.tsx` (padrão canônico do Avatar PR #119 — `globals: { theme: "dark" }` + `parameters.backgrounds.default: "dark"`).
2. Validação Brand × Notion no playground (verificação humana de Fernando).
3. Ciclo `typecheck && lint && test && build && docs:build` verde.

Infra cross-cutting (toggle Light/Dark na toolbar do Storybook + toggle no shell Astro com propagação cross-iframe) **já foi entregue** no PR #119 e é reaproveitada — não redo.

## Unknowns

- Nenhum. DoD do #27 é literal e o helper `axeInThemes` já está estabelecido.

## Sources

- GitHub Issue #27 e #26 (lidos via MCP).
- PR #119 (Avatar review) como referência canônica do padrão `DarkTheme` + da decisão de não retestar a infra de toggle.
- Memória do usuário: a11y jest-axe é AC obrigatório de componente; Argos é upstream Ahrena (não trackear identity local); releases via Janus.
- Helper `ui_kit/test-utils/a11y.ts` (`axeInThemes`).

## Próxima fase

Phase 2 — formalizar os ACs numerados a partir do DoD do #27.
