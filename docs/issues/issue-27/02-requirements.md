# Phase 2 — Requirements: Plan #27 — IconButton v0.1.0 DoD

> Tradução literal do DoD do Plan #27 em ACs numerados, com mapeamento explícito current-state → target-state.

## Acceptance Criteria

### AC-1 — Storybook cobre Default + variantes em light **e** dark

- `IconButton.stories.tsx` renderiza Default + variantes principais corretamente em **light** (toolbar Theme = Light) E **dark** (toolbar Theme = Dark).
- Existe **story dedicada `DarkTheme`** que força `globals: { theme: "dark" }` independentemente do toggle global, para servir como contrato visual permanente (padrão Avatar PR #119).
- **Current state:** 8 stories em light; Variants/Sizes/Shapes/Loading/Toolbar/Disabled/Formatting cobertos. **Sem `DarkTheme` story.**
- **Gap a fechar:** adicionar `export const DarkTheme: Story = { globals: { theme: "dark" }, parameters: { backgrounds: { default: "dark" } }, render: () => <matriz variants × sizes × shapes> }`.

### AC-2 — Playground review aprovado (Astro `/componentes/icon-button`)

- `npm run dev:all` sobe Storybook + Astro playground.
- Comparação lado-a-lado entre `ui_kit/components/icon-button/` (novo) e referência legada/produção em `/componentes/icon-button` registrada no PR.
- Toggle Light/Dark do shell Astro flippa o iframe sem flash (infra do PR #119).
- **Current state:** infra de playground + dark toggle já entregue no PR #119; só falta a confirmação visual humana do Fernando.

### AC-3 — Behavioral tests ≥ 20 OR ≥ 80% cobertura

- `icon-button.test.tsx` usa queries acessíveis (`getByRole({ name })`, `getByLabelText`) per `lex-frontend-testing`.
- ≥ 20 testes OR ≥ 80% cobertura no arquivo.
- Não mocka colaboradores internos; mocks limitados a callbacks/console.warn.
- Cobre: render + accessible name, default classes, todas as 5 variants, todos os 3 sizes, ambos os shapes, click handler, disabled bloqueia click, loading exibe spinner + `aria-busy`, motion-safe spinner, `aria-labelledby` alternativo, `asChild` (Radix Slot) com link, ref forwarding, warning dev sem aria-label, brand-aware hover tokens (#125).
- **Current state:** 19 declarações `it()` + 1 `it.each` × 3 = **21 casos efetivos**, exclui os 3 testes a11y do `describe("a11y")` → **24 casos no total**. ✅ Atende ≥ 20 hoje.

### AC-4 — A11y jest-axe em light **e** dark

- `icon-button.test.tsx` contém `describe("a11y")` com `axeInThemes(container)` (light + dark) cobrindo:
  - Default (ghost) ✅
  - Estado interativo principal — matriz de todas as 5 variants ativas ✅
  - `disabled` + `loading` ✅
- Cada teste passa `expect(...).toHaveNoViolations()` nos dois temas (toggle via `data-theme` em `document.documentElement` per helper `@/test-utils/a11y`).
- **Current state:** já implementado nas linhas 224-269. ✅

### AC-5 — Brand alinhado com Notion (fonte da verdade)

- Cores, tipografia e (quando aplicável) logo seguem [Branding no Notion](https://www.notion.so/Branding-34536f91ebd280a69efacbadab3861c6) — subpáginas Cores, Tipografia, Logomarca, Voz.
- Em divergência com `lex-brand-*` / `codex-brand-*` locais, **Notion prevalece** e o espelho local é atualizado **antes** da aprovação.
- IconButton **não usa logo** (escopo: button de ícone-único); a verificação foca em cores e tipografia.
- Tokens usados em `index.tsx`: `bg-primary` (Warm Orange), `bg-secondary` (Deep Violet), `text-destructive` (signal red), `bg-bg-hover`/`text-action-hover`/`border-action` (brand-aware hover tokens), `border-border-strong`. **Zero cores hardcoded.**
- **Current state:** verificação humana pendente; código já tokenizado.

### AC-6 — Accessible name por `aria-label` é não-negociável (IconButton é icon-only)

- IconButton **não tem texto** → o nome acessível **MUST** vir de `aria-label` ou `aria-labelledby`.
- O componente já tem guardrail dev-only que loga `console.warn` quando ambos faltam (linhas 115-124 de `index.tsx`).
- Tests cobrem:
  - `aria-label` produz nome acessível em `getByRole("button", { name })` ✅
  - `aria-labelledby` apontando para `<span id>` externo produz o mesmo nome ✅
  - Warning dispara em dev quando ambos faltam ✅
  - Warning **não** dispara quando `aria-label` está presente ✅
- **Current state:** cobertura completa.

### AC-7 — Pipeline verde (Gate 2 oficial)

`npm run typecheck && npm run lint && npm run test && npm run build && npm run docs:build` **MUST** sair com exit code 0.

- `typecheck` — `tsc -p tsconfig.test.json --noEmit` sobre toda a base.
- `lint` — `eslint .` sobre toda a base. **Pendência conhecida:** PR #119 documentou 19 erros lint pré-existentes em `navbar`, `pagination`, `typography`, `theme-toggle` (Tech Task #120). Esses erros são **fora do diff deste Plan** e não podem regredir o gate; serão tratados como finding tangencial pré-existente per `lex-no-silent-tech-debt` (refs Tech Task #120). Critério deste AC: zero erros lint **introduzidos pelo diff de #27**.
- `test` — `vitest run` (incluindo os ≥ 24 casos de `icon-button.test.tsx`).
- `build` — `rslib build` produz `dist/`.
- `docs:build` — `npm run build --prefix docs` (Astro static build).

### AC-8 — "Está bom" explícito do Fernando registrado no PR

Hard gate humano per `lex-agent-planning` e Plan DoD. Sem isso, PR não merga e Plan não fecha.

### AC-9 — PR fecha Plan #27 via `Closes #27`

PR título no formato `chore(icon-button): review for v0.1.0 DoD (DarkTheme story + Brand × Notion)` per `lex-conventional-commits`; body com `Closes #27`; labels espelhadas do issue + `size/*` per `lex-pr-quality`.

## Definition of Done aggregate

Todos os 9 ACs satisfeitos = Plan #27 fechado = parent #26 com playground review marcado = IconButton avança para `v0.1.0`.

## Out of scope (registrados como findings, não bloqueiam #27)

- Cores `--bg-hover`, `--text-action-hover`, `--border-action` em **outros componentes** que ainda usam `guardia-purple-*` direto. Tratado em #125 (já mergeado) e não toca este Plan.
- 19 erros lint pré-existentes fora de IconButton — Tech Task #120.
- Visual regression baselines (`__image_snapshots__/components/icon-button/`) são Ubuntu/CI-rendered per memory do usuário — não regerar localmente; usar label `regenerate-baselines` no PR se necessário.

## Próxima fase

Phase 3 — architecture brief com scope table do delta e plano de execução.
