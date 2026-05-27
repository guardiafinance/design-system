# Phase 3 — Architecture: Plan #27 — IconButton v0.1.0 DoD

## Sumário executivo

Plan de revisão — não é feature nova. Implementação completa de IconButton já está em `main @ 7856797`, com a maior parte do DoD do v0.1.0 atendida. O delta arquitetural é **mínimo** e estritamente aditivo: uma story `DarkTheme` exportada em `IconButton.stories.tsx`, mais um ciclo de validação. Sem ADR necessária.

## Componentes afetados

| Arquivo | Mudança | Razão |
|---|---|---|
| `ui_kit/components/icon-button/IconButton.stories.tsx` | **Modificar** — `export const DarkTheme: Story` adicionada ao final do arquivo, sem tocar nas 8 stories existentes | Padroniza contrato visual dark; alinha com Avatar (PR #119) e com os 11 sibling Plans paralelos |
| `docs/issues/issue-27/01-brief.md` | **Criar** | Phase 1 artifact (lex-issue-driven Rule 5) |
| `docs/issues/issue-27/02-requirements.md` | **Criar** | Phase 2 artifact (ACs) |
| `docs/issues/issue-27/03-architecture.md` | **Criar** | Phase 3 artifact (este arquivo) |
| `docs/issues/issue-27/05-security-review.md` | **Criar** após Phase 4 | Phase 5 (security review do diff) |
| `docs/issues/issue-27/06-quality-report.md` | **Criar** após Phase 6 | Phase 6 (Gate 2 quality report) |
| `.ahrena/workflow/issue-27/checkpoint.md` | **Criar** | Operational state (gitignored per `.gitignore` já existente do projeto) |

**Não tocados** (escopo isolado per `lex-agent-focus-on-active-plan`):
- `ui_kit/components/icon-button/index.tsx` (já tokenizado e correto).
- `ui_kit/components/icon-button/icon-button.test.tsx` (24 casos efetivos; jest-axe light+dark já cobre).
- Qualquer arquivo fora de `ui_kit/components/icon-button/` ou `docs/issues/issue-27/`.
- Infra Storybook/Astro de toggle dark (já estabelecida no PR #119).

## Decisões arquiteturais

### D1 — Reuso integral da infra do PR #119

A infra de toggle Light/Dark no Storybook (global toolbar `Theme`) e no Astro shell (cross-iframe via postMessage) já está mergeada e funcional. **Não retestamos a infra**; reutilizamos. Isso significa:

- `globals: { theme: "dark" }` em `DarkTheme` story aciona o `ThemeProvider` existente.
- `parameters.backgrounds.default: "dark"` espelha os tokens Mono Black da `lex-brand-colors`.

**Sem ADR** porque a decisão é "consumir infra existente, padrão estabelecido".

### D2 — Não regerar visual baselines localmente

Per user memory: visual baselines são Ubuntu/CI-rendered (SoT). Se o `DarkTheme` story disparar uma nova baseline, **não commitar localmente do macOS**. Disparar regeneração via label `regenerate-baselines` no PR após push. Critério de sucesso: pipeline de baselines verde em uma segunda iteração do PR, **não** baselines commitadas.

### D3 — Brand check é validação humana, não código

O DoD do #27 pede validação Brand contra o Notion. Os tokens em `index.tsx` já vêm de `lex-brand-*` (espelho local). A verificação concreta — abrir Notion + abrir playground + comparar — é trabalho do Fernando no Gate 1 e no momento "está bom". Não há código a escrever para AC-5.

### D4 — Não adicionar testes além do mínimo necessário

A suite já tem 24 casos efetivos. Adicionar testes "porque sim" violaria `lex-no-silent-tech-debt` (escopo do Plan é review, não expansion). Se o `DarkTheme` story revelar gap visual, esse gap vira um finding tangencial com 3 opções per `lex-no-silent-tech-debt`.

## Plano de execução (Phase 4)

Sequência atômica:

1. **Editar** `ui_kit/components/icon-button/IconButton.stories.tsx`: adicionar `export const DarkTheme: Story` no final, espelhando o padrão Avatar (matriz variants × sizes × shapes sobre fundo dark).
2. **Verificar manualmente no playground** (Fernando):
   - `npm run dev:all`
   - Abrir `http://localhost:6006` → IconButton stories → flippar toolbar Theme Light ↔ Dark em todas as 9 stories incluindo nova `DarkTheme`.
   - Abrir `http://localhost:4321/design-system/componentes/icon-button` → flippar topbar Light ↔ Dark.
   - Comparar com Notion Branding e capturar gaps (se houver).
3. **Transição de label** Plan #27: `status: todo` → `status: development` (per `lex-issue-quality` HARD-GATE 2: aplicar assignee `@me` e label no mesmo `gh issue edit`).
4. **Commit único** atômico: `chore(icon-button): add DarkTheme story for v0.1.0 review`.
5. **Push** + abrir PR via MCP (`Closes #27`).

## Delegações

Nenhuma. Athena conduz diretamente — sem Apollo (não é Python), sem Daedalus (não há API), sem Kronos (não há eventos). Hephaestus seria o specialist para frontend, mas o delta é trivial (uma story de ~40 LOC seguindo template canônico do Avatar) — invocação seria overhead.

## Stacked PR decomposition

**Não aplicável.** O delta é um único commit ~40 LOC; um único PR per `lex-agent-planning` ("um Plan = um PR"). Decision Checklist de `codex-stacked-prs`: 0 sinais altos.

## Risks

- **Brand divergence revelada no playground:** se Fernando achar que algum token está fora do Notion, o protocolo é (a) atualizar o espelho local antes da aprovação (parte do DoD); (b) ou registrar como Tech Task separada se for cross-component. Decisão de Fernando no momento do review.
- **Lint pré-existente (Tech Task #120):** se o pipeline ainda lista os 19 erros pré-existentes em `navbar`/`pagination`/`typography`/`theme-toggle`, distinguir do diff de #27 explicitamente no quality report.
- **Visual baseline diff:** se a nova `DarkTheme` story disparar diff visual, **não commitar baselines do macOS**. Usar label `regenerate-baselines` no PR.

## Próxima fase

Gate 1 — apresentar brief + ACs + scope table para Fernando aprovar antes de Phase 4.
