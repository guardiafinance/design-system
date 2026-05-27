# Issue Brief — #21 (parent #20)

- **Repo:** guardiatechnology/design-system
- **Plan sub-issue:** #21 — `Plan: review Button against v0.1.0 DoD`
- **Parent issue:** #20 — `chore(button): review Button for v0.1.0 DoD (playground approval)`
- **Epic pai:** #13 (Part 1 — Primitivos)
- **Author:** @fernandoseguim
- **Type:** chore (evolvability ♻️)
- **Component scope:** `ui_kit/components/button/` + `docs/issues/issue-21/`

## Motivação (Por que)

O `Button` foi migrado para o novo DoD do v0.1.0 **antes** das regras
de (a) aprovação por playground, (b) cobertura Storybook em light + dark,
e (c) validação de Brand contra o Notion entrarem em vigor. Esta revisão
fecha a lacuna para que o componente saia de `status: development` e
entre no v0.1.0.

## Escopo

- Revisar Storybook `Button.stories.tsx` — Default + 6 variantes (default,
  destructive, outline, secondary, ghost, link) + 5 tamanhos (xs, sm,
  default, lg, icon) em light + dark via toolbar global.
- Adicionar story `DarkTheme` explícita seguindo o padrão estabelecido
  por `Avatar.stories.tsx` (PR #119), forçando `globals.theme = "dark"`
  e renderizando a matriz completa de variantes + estados sobre fundo
  escuro.
- Estender `button.test.tsx` (16 testes hoje) com testes adicionais para
  alcançar ≥ 20 casos de teste comportamentais via `getByRole` /
  `getByLabelText`, sem mockar colaboradores internos.
- A11y obrigatório via `axeInThemes` (helper de `ui_kit/test-utils/a11y.ts`)
  em light + dark para Default, variantes principais, Disabled, Loading,
  asChild (link), e size="icon" com aria-label.
- Brand contra Notion como fonte da verdade (validação executada via
  `notion-fetch` no Phase 1 — ver "Brand finding" abaixo).
- 5 comandos do quality gate verdes.

## Fora de escopo

- Features novas além da paridade com legado.
- Refatoração de tokens/brand não relacionada ao `Button`.
- Renomeação ou inversão de `--primary` / `--secondary` (ver Brand
  finding abaixo — qualquer ação dispara nova sub-issue/Plan).
- Tag/release (responsabilidade do `warrior-janus`).
- Regeneração de baselines visuais a partir de macOS (CI/Ubuntu manda
  via label `regenerate-baselines`).

## Brand finding (validação Notion executada)

Fetched: `Cores` (`34536f91ebd28142a3f1e0e58fd62c4b`), `Tipografia`
(`34536f91ebd281b9b76ccc6159bfae69`), `Logomarca`
(`34536f91ebd2816f891ce73a5d47a789`).

**Divergência detectada (não trivial):**

| Aspecto | Notion (fonte da verdade) | Implementação atual no `Button` |
|---|---|---|
| CTA primário em light | **Violeta 500 (#4f186d) + Branco** (7.85:1 AAA) — "Confirmar, continuar, salvar, contratar." | `variant="default"` renderiza **laranja** (`bg-primary` → `--primary: 31 100% 44%` = orange-500) |
| CTA secundário em light | **Laranja 500 (#e07400)** | `variant="secondary"` renderiza **violeta** (`bg-secondary` → `--secondary: 281 64% 26%` = violet-500) |
| Anel de foco primário | **Laranja 500** sobre violeta | `focus-visible:ring-ring` (ring usa orange por default) |
| CTA primário em dark | **Laranja** assume papel preferencial (inversão documentada na página Dark Mode do Notion) | `--primary: 31 100% 44%` mantém laranja em dark — **alinhado** |

A convenção `shadcn`-compat em `ui_kit/styles/index.css` (linhas 115-121)
documenta a escolha como deliberada: "`--primary = accent (laranja,
CTA, shadcn default)` / `--secondary = action (violeta, autoridade)`".
O nomenclature é coerente com o ecossistema shadcn, mas o resultado
visual em **light mode** é o inverso da hierarquia Brand do Notion.

**Por que isso importa para o Plan #21:**

- Notion é fonte da verdade (DoD AC-6). Em divergência, "Notion
  prevalece e o espelho local é atualizado antes da aprovação".
- O escopo do Plan #21 é REVISÃO contra DoD — flipar tokens primário/
  secundário ou trocar o default do `Button` é mudança estrutural que
  afeta cada consumidor do design-system (todo `<Button>` sem variant
  no produto, mais o `outline` e o `focus-ring`).
- Aplicar essa mudança dentro de #21 violaria `lex-small-commits` e o
  escopo declarado em `02-requirements.md`.

**Decisão pendente do Fernando (surfaced antes do Gate 1):**

- **(a)** Aceitar o desvio como deliberado e documentado em
  `ui_kit/styles/index.css` (shadcn-compat) — atualizar o espelho local
  em `.claude/rules/design/brand/lex-brand-*` para registrar a exceção
  formalmente. **#21 prossegue como revisão pura (sem mudar tokens).**
- **(b)** Tratar como **gap real** — abrir nova sub-issue/Plan sob #20
  para inversão `--primary` ↔ `--secondary` em light mode e mudança do
  default visual do `Button`. #21 prossegue com a revisão atual e a
  inversão vira Plan separado.
- **(c)** Expandir o escopo de #21 para incluir a inversão agora —
  exige aprovação explícita no Gate 1 e atualização de
  `02-requirements.md` / `03-architecture.md`.

**Recomendação do warrior-athena: (b)**. A inversão tem alto raio de
impacto (todos os botões "default" no produto, anel de foco, snapshots
visuais Ubuntu), e #21 deve ficar pequeno e revisional. Decisão final
do Fernando registrada no PR e no `04-decisions.md` (se for opção c).

## Contexto adicional

- `Button` é um primitivo interativo robusto (`<button>` nativo com
  `forwardRef`, suporte a `asChild` via Radix Slot, `loading` com
  spinner motion-safe, `leadingIcon`/`trailingIcon`, full-width, e
  guardrail dev-only que warn quando `size="icon"` está sem
  `aria-label`).
- 16 testes existentes em `button.test.tsx`. Para satisfazer DoD AC-3
  (≥ 20 testes OR ≥ 80% cobertura), o gap mínimo é +4 testes
  comportamentais; com os blocos a11y (AC-4) chegamos confortavelmente
  a ~24-28 testes.
- O Storybook já alterna tema via toolbar (`.storybook/preview.tsx`
  `applyThemeSync`, entregue na PR #119 do Plan #17).
- O helper `axeInThemes` em `ui_kit/test-utils/a11y.ts` aplica
  `data-theme` no `<html>` antes de cada execução do `axe()`.
- A story `Button.stories.tsx` atual desabilita a regra `color-contrast`
  do axe via `parameters.a11y.config.rules` com justificativa inline:
  variantes `default` (orange-500) e `destructive` (signal-red) sitam
  na faixa 3:1-4.5:1, permitida por `lex-brand-colors` para
  "títulos, botões e badges". O teste jest-axe vai aplicar a mesma
  isenção a nível de configuração quando relevante.
- Astro playground em `docs/src/pages/componentes/button.astro` já
  expõe Variantes, Tamanhos, Ícones, Agente, Estados, Playground
  ao vivo e Props — sem mudanças necessárias.

## Próximas fases

- Phase 2 — Requirements (`02-requirements.md`)
- Phase 3 — Architecture (`03-architecture.md`)
- **Gate 1** — apresentar finding Brand × Notion para Fernando antes
  de avançar para Phase 4
- Phase 4 — Implementação (extensões em `button.test.tsx` + nova story
  `DarkTheme` em `Button.stories.tsx`)
- Phase 5 — Security review (`05-security-review.md`)
- Phase 6 — Quality gate (`06-quality-report.md`)
- Phase 7 — PR
