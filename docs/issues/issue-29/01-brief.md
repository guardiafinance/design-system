# Phase 1 — Brief: chore(label): review Label for v0.1.0 DoD

> Thin pointer. The canonical scope lives in chore Issue #28 (parent) and Plan #29 (executable sub-issue). This brief does not re-elicit context that is already authoritative in those issues — it only frames what Athena is orchestrating.

## Source artifacts

| Source | Reference | Role |
|---|---|---|
| Chore (parent) | [`guardiatechnology/design-system#28`](https://github.com/guardiatechnology/design-system/issues/28) | Why / What / How + Definition of Done |
| Plan (executable) | [`guardiatechnology/design-system#29`](https://github.com/guardiatechnology/design-system/issues/29) | DoD checklist + one PR rule |
| Epic (umbrella) | [`guardiatechnology/design-system#13`](https://github.com/guardiatechnology/design-system/issues/13) | Design System v0.1.0 — Part 1 (Primitivos) |
| Brand source of truth | [Branding (Notion)](https://www.notion.so/Branding-34536f91ebd280a69efacbadab3861c6) | In divergence with local mirror, Notion prevails |

## Why (1-line summary from #28)

Fechar a lacuna de aprovação por playground, cobertura **dark mode** no Storybook, **a11y (jest-axe)** em light + dark e validação Brand contra o Notion para `Label`, fazendo o componente sair de `status: development` para `done` como parte do v0.1.0.

## What (scope summary from #28 + #29)

Revisar o `Label` existente em `ui_kit/components/label/` (Radix `Label` primitivo + CVA com `size: sm | md`, `required`, `optional`) e completar o DoD do v0.1.0:

- Storybook (`Label.stories.tsx`): garantir Default + variantes principais cobrindo **light AND dark**.
- Testes de unidade (`label.test.tsx`): elevar a suite atual (11 testes) para ≥ 20 testes ou ≥ 80% de cobertura no arquivo, mantendo queries acessíveis e **adicionando jest-axe `toHaveNoViolations()` em light + dark** para `Default`, estado interativo principal e estado renderizado quando aplicável.
- Brand: comparar contra o Notion (Branding) — atualizar espelho local quando divergir.
- Verificar `npm run typecheck && lint && test && build && docs:build` verdes.

**Fora de escopo:** mudanças de API pública do `Label`, RangeSlider, alterações em outros componentes, tagging / release (Janus), regeneração de visual baselines a partir de macOS.

## Pre-existing artifacts

- `.worktrees/29-review-label-v010-dod/` (este worktree, criado a partir de `main@7bedc35`).
- `ui_kit/components/label/index.tsx` — implementação atual completa (Radix Label + CVA + asterisco required + sufixo optional).
- `ui_kit/components/label/Label.stories.tsx` — 6 stories (Default, Required, Optional, Sizes, WithField, CustomOptionalLabel).
- `ui_kit/components/label/label.test.tsx` — 11 testes de unidade comportamentais; **sem jest-axe**.
- `ui_kit/test-utils/a11y.ts` — helper `axeInThemes()` que faz o toggle de `data-theme` no `document.documentElement` (padrão consolidado pelo Badge na Tech Task #125).
- `vitest.setup.ts` — `expect.extend(toHaveNoViolations)` já globalizado.

## Special notes (memory pins applied)

- **PT-BR:** "teste de unidade" (nunca "teste unitário").
- **A11y obrigatório:** jest-axe em light + dark é AC, não opcional.
- **Visual baselines:** se houver diff de snapshot, NÃO regenerar daqui (macOS). Listar nomes no PR; baseline volta verde via label `regenerate-baselines` em Ubuntu/CI (Node ≥ 24).
- **Release:** fora de escopo; releases via warrior-janus.
- **Author identity:** humano (`fernandoseguim`). Assignee `@me`. Esta orquestração NÃO opta pelo override `warriors_default_author`.
- **Branch base:** `main`.
- **No merge:** PR fica aberto aguardando "está bom" do Fernando.

## Scope guardrail

Apenas dois grupos de arquivos podem mudar neste PR:

1. `ui_kit/components/label/**` — Storybook + testes (e mirror brand local somente se Notion divergir).
2. `docs/issues/issue-29/**` — artefatos do flow (brief, requirements, architecture, security-review, quality-report).

Qualquer achado fora desse escopo segue o **Tangential Finding Protocol** do `lex-no-silent-tech-debt`: comentário em #29 com 3 opções (expandir Plan, novo Plan sub-issue sob #28, novo parent Issue) e fica de fora deste PR.

## Unknowns / open questions

Nenhum. O Plan #29 traz o DoD completo. Em Phase 2 deriva-se AC-1..AC-7 mapeados 1:1 ao DoD.

## Next step

Phase 2 — `02-requirements.md` com ACs numerados (AC-1..AC-7) e a coluna de verificação concreta exigida em Gate 2.
