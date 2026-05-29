# Issue Brief — #52 feat(switch): migrate Switch to v0.1.0 DoD

## Metadados

- **Issue:** [#52](https://github.com/guardiatechnology/design-system/issues/52)
- **Plan sub-issue:** [#53](https://github.com/guardiatechnology/design-system/issues/53)
- **Tipo:** Feature (label `evolvability ♻️`)
- **Autor:** @fernandoseguim
- **Assignee:** @fernandoseguim
- **Epic pai:** #13 (v0.1.0 — catálogo canônico)
- **Categoria:** Forms

## Resumo

Elevar o componente `Switch` ao DoD do v0.1.0 do `@guardia/design-system`, levando-o ao mesmo padrão dos componentes já migrados (Checkbox, Radio, Slider): React + Tailwind v4 + CVA + Radix Switch primitive, tokens semânticos, label/description/invalid/disabled, sizes sm/md, testes de unidade comportamentais (≥ 20 ou ≥ 80% de cobertura no arquivo) com jest-axe em light + dark, Storybook com matriz light+dark, página Astro com previews + playground, export no barrel, entrada no Set `MIGRATED`.

## Estado atual

- `ui_kit/components/switch/index.tsx` existe em baseline minimalista (CVA + Radix Switch genérico, variants `default/brand/accent`, sizes `default/sm/lg`, sem label/description, sem invalid). Não atende ao DoD.
- `ui_kit/components/switch/Switch.stories.tsx` mínimo (Default + WithLabel + Brand + Small). Sem matriz dark.
- `Switch.test.tsx` ausente.
- `docs/src/pages/componentes/switch.astro` ausente.
- `docs/src/previews/switch.tsx` ausente.
- `docs/src/previews/switch-live.tsx` ausente.
- `Switch` ausente do Set `MIGRATED` em `docs/src/pages/index.astro`.
- Export já presente em `ui_kit/components/index.ts` linha 43 (`export * from "./switch";`).

## Contexto Notion (Brand)

Fonte da verdade: [Branding no Notion](https://www.notion.so/Branding-34536f91ebd280a69efacbadab3861c6). Subpáginas relevantes para Switch:

- [Cores](https://www.notion.so/34536f91ebd28142a3f1e0e58fd62c4b) — `--action` (Violeta 500 light / Laranja 500 dark) para o track checked; tokens semânticos exclusivos.
- [Tipografia](https://www.notion.so/34536f91ebd281b9b76ccc6159bfae69) — Poppins; label 14px (md) / 13px (sm) regular 500; description 12.5px / 12px regular 400.
- [Voz](https://www.notion.so/34536f91ebd2817f8cc5ca29e657c828) — labels diretos, sem buzzwords.

O espelho local (`lex-brand-*` / `codex-brand-*`) é consistente com Notion para o escopo Switch — não há divergência detectada.

## Referência visual canônica

Bundle legacy em `ux_references/ui_kits/components/Switch/`:

- `Switch.playground.html` — matriz Tamanhos, Com descrição, Estados (Ativado, Desativado, Bloqueado on/off), Controlado.
- `index.tsx` — API legada: `size: "sm" | "md"`, `label`, `description`, `checked`, `disabled`, `onChange(e)` (input nativo).
- `index.css` — track 30×18 (sm) / 38×22 (md), thumb 14/18px, fill `--violet-500` quando checked.

A migração v0.1.0 DoD DEVE espelhar variants, props e comportamento. Divergências (necessárias por adoção do Radix primitive e do contrato `onCheckedChange`) ficam registradas na Phase 3 — Architecture.

## Componente analógico para mirror de padrão

`ui_kit/components/checkbox/` — mesmo nicho (Forms, Radix primitive, label/description, invalid, sm/md, jest-axe em light + dark). Convenções de código, testes, stories, Astro page e previews seguidas tal-qual.

## Restrições e não-negociáveis

- Stay strictly within Switch scope (paralelo: outra Athena rodando para Textarea #54/#55).
- pt-BR: usar "teste de unidade" (nunca "teste unitário") em textos pt-BR (commits, PR body, comentários, docs).
- Não commitar `__image_snapshots__/` de macOS — visual baselines são Ubuntu/CI-rendered.
- Releases via warrior-janus (não rodar `git tag` / `gh release`).
- Sem TODOs silenciosos (`lex-no-silent-tech-debt`).
- Gate 1 (scope) com aprovação humana antes da Phase 4; Gate 2 (quality) `go` antes do PR.
- Aprovação por playground "está bom" do Fernando é pré-requisito do PR.

## Branch e worktree

- Branch: `feat/52-switch`
- Worktree: `.worktrees/52-switch/` (por `lex-git-worktrees`)
- PR body fecha `Closes #53` (Plan sub-issue).
