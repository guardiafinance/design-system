# Phase 1 — Brief: feat(slider): migrate to v0.1.0 DoD

> Thin pointer. The canonical scope lives in Issue #14 (Tech Task) and Plan #15 (executable sub-issue). This brief does not re-elicit context that is already authoritative in those issues — it only frames what Athena is orchestrating.

## Source artifacts

| Source | Reference | Role |
|---|---|---|
| Tech Task (parent) | [`guardiatechnology/design-system#14`](https://github.com/guardiatechnology/design-system/issues/14) | Why / What / How + Definition of Done |
| Plan (executable) | [`guardiatechnology/design-system#15`](https://github.com/guardiatechnology/design-system/issues/15) | Branch, files, API surface, tests, a11y, Storybook, docs, MIGRATED, gates — one PR |
| Epic (umbrella) | [`guardiatechnology/design-system#13`](https://github.com/guardiatechnology/design-system/issues/13) | Design System v0.1.0 — full migration of 52 components |
| Brand source of truth | [Branding (Notion)](https://www.notion.so/Branding-34536f91ebd280a69efacbadab3861c6) | In divergence with local mirror, Notion prevails |

## Why (1-line summary from #14)

Slider está no catálogo canônico de 52 componentes do v0.1.0 (Forms #19/11) mas está **ausente do repo** — a implementação anterior se perdeu quando o worktree foi removido antes do commit. Sem refazer, Forms não fecha.

## What (scope summary from #14 + #15)

Reimplementar `Slider` do zero no DoD do v0.1.0 como wrapper de `<input type="range">`, com:

- Wrapper React em `ui_kit/components/slider/index.tsx` (CVA: `size: sm | md`, estados `invalid`, `disabled`).
- Estilos globais `.guardia-slider` em `ui_kit/styles/index.css` com custom prop `--pct`.
- API: `value` / `onValueChange(number)` + `onChange` + `min/max/step` + `size` + `showValue` + `prefix` / `suffix` / `format(v)` + `invalid` + `disabled`.
- Suite de testes de unidade ≥ 20 (comportamental + jest-axe light+dark).
- Storybook (light + dark) + docs Astro + previews + export + entrada no Set `MIGRATED`.

**Fora de escopo:** RangeSlider (dois thumbs); adições de brand/tokens além de `--pct`.

## Pre-existing artifacts

- `.ahrena/issues/14/` — diretório criado para os artefatos desta orquestração.
- Worktree-target: `.worktrees/14-slider/` (a ser criado por Athena antes de delegar a Phase 4).

## Special notes (memory pins applied)

- **PT-BR:** "teste de unidade" (nunca "teste unitário").
- **A11y obrigatório:** jest-axe em light + dark é AC, não opcional.
- **Visual baselines:** se necessárias, somente via workflow `regenerate-baselines` (Ubuntu/CI); nunca commitar baselines geradas em macOS.
- **Release:** fora de escopo; tagging e release acontecem via warrior-janus.
- **Branch base:** repo default é `main` (Plan #15 menciona `master` por inércia textual — Athena usa `main`).

## Unknowns / open questions

Nenhum. O Tech Task #14 e o Plan #15 estão completos o suficiente para Phase 2 derivar ACs numerados diretamente do checklist do DoD.

## Next step

Phase 2 — `02-requirements.md` com ACs numerados (AC-N) derivados 1:1 do DoD do Plan #15.
