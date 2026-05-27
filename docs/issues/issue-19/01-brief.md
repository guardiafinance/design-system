# Issue Brief — #19 (parent #18)

- **Repo:** guardiatechnology/design-system
- **Plan sub-issue:** #19 — `Plan: review Badge against v0.1.0 DoD`
- **Parent issue:** #18 — `chore(badge): review Badge for v0.1.0 DoD (playground approval)`
- **Epic pai:** #13 (Part 1 — Primitivos)
- **Author:** @fernandoseguim
- **Type:** chore (evolvability ♻️)
- **Component scope:** `ui_kit/components/badge/` + `docs/issues/issue-19/`

## Motivação (Por que)

O `Badge` foi migrado para o novo DoD do v0.1.0 **antes** das regras
de (a) aprovação por playground, (b) cobertura Storybook em light + dark,
e (c) validação de Brand contra o Notion entrarem em vigor. Esta revisão
fecha a lacuna para que o componente saia de `status: development` e
entre no v0.1.0.

## Escopo

- Revisar Storybook `Badge.stories.tsx` — Default + variantes principais
  em light + dark.
- Garantir cobertura de teste de unidade comportamental (interações,
  navegação por teclado, estados de a11y) com queries acessíveis.
- A11y obrigatório via jest-axe em light + dark para Default, estado
  interativo principal e disabled (quando aplicável).
- Brand contra Notion como fonte da verdade.
- 5 comandos do quality gate verdes.

## Fora de escopo

- Features novas além da paridade com legado.
- Refatoração de tokens/brand não relacionada ao Badge.
- Tag/release (responsabilidade do `warrior-janus`).
- Regeneração de baselines visuais a partir de macOS (CI/Ubuntu manda
  via label `regenerate-baselines`).

## Contexto adicional

- Componente `Badge` é um primitivo passivo (renderiza `<span>`), sem
  `role`/`tabIndex`/handlers de teclado nem prop `disabled`. A
  interpretação de "estado interativo principal / disabled" é detalhada
  em `02-requirements.md` (AC-4).
- O Storybook já alterna tema via toolbar (`.storybook/preview.tsx`
  `applyThemeSync`) e o helper `axeInThemes` em
  `ui_kit/test-utils/a11y.ts` aplica `data-theme` no `<html>` antes de
  cada execução do axe.
- O `notion` MCP server está comentado em `.ahrena/.directives`
  (`mcp.servers`). A verificação Brand × Notion fica como pendência
  manual registrada no corpo do PR.

## Próximas fases

- Phase 2 — Requirements (`02-requirements.md`)
- Phase 3 — Architecture (`03-architecture.md`)
- Phase 4 — Implementação (extensões em `badge.test.tsx` + stories)
- Phase 5 — Security review (`05-security-review.md`)
- Phase 6 — Quality gate (`06-quality-report.md`)
- Phase 7 — PR
