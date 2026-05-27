# Phase 1 — Brief: chore(separator): review Separator for v0.1.0 DoD

> Thin pointer. The canonical scope lives in chore #30 (parent) and Plan sub-issue #31 (executable). This brief does not re-elicit context that is already authoritative in those issues — it only frames what Athena is orchestrating.

## Source artifacts

| Source | Reference | Role |
|---|---|---|
| Parent chore | [`guardiatechnology/design-system#30`](https://github.com/guardiatechnology/design-system/issues/30) | `chore(separator): review Separator for v0.1.0 DoD (playground approval)` |
| Plan sub-issue (executable) | [`guardiatechnology/design-system#31`](https://github.com/guardiatechnology/design-system/issues/31) | DoD checklist, AC source, single PR (`lex-agent-planning`) |
| Epic (umbrella) | [`guardiatechnology/design-system#13`](https://github.com/guardiatechnology/design-system/issues/13) | Design System v0.1.0 — Part 1 (Primitivos) |
| Brand source of truth | [Branding (Notion)](https://www.notion.so/Branding-34536f91ebd280a69efacbadab3861c6) | In divergence with local mirror, Notion prevails |
| Component | `ui_kit/components/separator/` | `index.tsx`, `Separator.stories.tsx`, `separator.test.tsx` |

## Why (from #31)

Fechar a lacuna de aprovação por playground, cobertura de dark mode no Storybook e validação Brand contra o Notion para `Separator`, fazendo o componente sair de `status: development` para `status: done` como parte do v0.1.0.

## What (scope summary)

Revisar `Separator` no DoD v0.1.0:

- **Storybook** — `Default` + variantes principais em **light** E **dark**.
- **Behavioral tests** (`separator.test.tsx`) — queries acessíveis, sem mocks internos, ≥ 20 testes OU ≥ 80% cobertura no arquivo.
- **A11y (jest-axe)** — `toHaveNoViolations()` em light + dark (`data-theme` no `documentElement`) para `Default` + variantes meaningful. Separator é não-interativo (`role="separator"` quando semântico, `role="none"` quando decorativo) — não há `disabled` nem keyboard navigation a exercitar; cobertura concentra rendering matrix.
- **Brand × Notion** — verificar tokens de borda/cor; Notion prevalece em divergência.
- **Quality gate** — `typecheck && lint && test && build && docs:build` verde.

**Fora de escopo:**
- Adicionar variantes novas (sem `interactive`, sem `disabled` semantic — Separator é primitivo decorativo).
- Regenerar baselines de regressão visual a partir de macOS (`__image_snapshots__` é Ubuntu/CI-rendered — fonte de verdade upstream).
- Mudar tokens compartilhados (`--border`, escalas) — fora do escopo do componente.

## Pre-existing artifacts

- `ui_kit/components/separator/index.tsx` — wrapper de `@radix-ui/react-separator` com `appearance: solid | dashed | dotted`, `label?`, `orientation`.
- `ui_kit/components/separator/separator.test.tsx` — 14 testes existentes (queries por `data-testid`/`getByRole`; sem jest-axe e sem dark).
- `ui_kit/components/separator/Separator.stories.tsx` — 8 stories (sem matrix light/dark explícita).

## Special notes (memory pins applied)

- **PT-BR:** "teste de unidade" (nunca "teste unitário").
- **A11y obrigatório:** jest-axe em light + dark é AC, não opcional.
- **Visual baselines:** se necessárias, somente via workflow `regenerate-baselines` (Ubuntu/CI); nunca commitar baselines geradas em macOS.
- **Release:** fora de escopo; tagging via warrior-janus.
- **Branch base:** `main`.
- **Não-interativo:** Separator não tem `disabled`/`hover`/`focus` semânticos; a AC "keyboard navigation" se satisfaz com um teste que confirma que o elemento não entra no tab order.

## Unknowns / open questions

Nenhum. Issue #31 traz DoD explícito; Phase 2 deriva ACs 1:1 do checklist.

## Next step

Phase 2 — `02-requirements.md` com ACs numerados (AC-1 … AC-7) derivados do DoD do Plan #31.
