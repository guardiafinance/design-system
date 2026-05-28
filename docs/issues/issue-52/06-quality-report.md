# Quality Report (Gate 2) — #52 feat(switch): migrate Switch to v0.1.0 DoD

## Sumario

**Resultado:** `go`

## Comandos executados

```bash
cd .worktrees/52-switch
npm run typecheck      # OK — 0 errors
npm run lint           # OK — 0 errors, 27 warnings pre-existentes (outros componentes; nada do Switch)
npm test               # OK — 781 tests passed, 25 test files
npm run build          # OK — 68 files generated in dist, 361.3 kB (91.4 kB gzipped)
npm run docs:build     # OK — 23 pages built, /componentes/switch/index.html gerado
```

## Resultado Switch focado

```bash
npm test -- --run ui_kit/components/switch
# Test Files  1 passed (1)
#      Tests  32 passed (32)
#   Duration  3.43s
```

## 7 Checks (kata-quality-gate)

### Check 1 — AC -> test traceability

22 ACs declarados em `02-requirements.md`. Cobertura:

| AC | Teste(s) |
|---|---|
| AC-1 (role=switch) | `AC-1: renderiza com role=switch` |
| AC-2 (standalone) | `AC-2: renderiza standalone (sem label)...` |
| AC-3 (label clicavel) | `AC-3: renderiza wrapper <label> quando label e passada`, `AC-3: clique no label alterna o switch via htmlFor`, `AC-3: label + description renderizam ambos os textos`, `AC-3: clique no description tambem alterna (via wrapper <label>)` |
| AC-4 (description + aria-describedby) | `AC-4: description gera aria-describedby`, `AC-4: sem description, sem aria-describedby` |
| AC-5 (sizes sm/md) | `AC-5: size=sm aplica 30x18`, `AC-5: size=md (default) aplica 38x22` |
| AC-6 (checked/unchecked states) | `AC-6: checked expoe data-state=checked`, `AC-6: unchecked expoe data-state=unchecked`, `AC-6: defaultChecked...`, `AC-6: alterna de checked -> unchecked...` |
| AC-7 (disabled) | `AC-7: disabled bloqueia clique`, `AC-7: disabled aplica opacity-55 no wrapper` |
| AC-8 (invalid + ring-destructive) | `AC-8: invalid=true aplica aria-invalid`, `AC-8: invalid aplica ring-destructive no root` |
| AC-9 (focus-visible ring-ring) | `AC-9: focus-visible aplica ring-ring com offset` |
| AC-10 (tokens semanticos) | `AC-10: zero cores hardcoded...` |
| AC-11 (Space/Enter alternam) | `AC-11: Space alterna o switch`, `AC-11: Enter alterna o switch` |
| AC-12 (id auto/custom) | `AC-12: auto-gera id`, `AC-12: respeita id customizado` |
| AC-13 (className/wrapperClassName) | `AC-13: respeita className no root`, `AC-13: respeita wrapperClassName no <label>` |
| AC-14 (a11y light + dark) | 6 testes no `describe("a11y")` cobrindo Default, label, label+description, checked, invalid, disabled |
| AC-15 (Storybook light + dark) | `Switch.stories.tsx` exporta `Default`, `WithDescription`, `Checked`, `Invalid`, `Disabled`, `DisabledChecked`, `Sizes`, `Standalone`, `Group`, `DarkTheme` |
| AC-16 (Astro page) | `docs/src/pages/componentes/switch.astro` — gerou `/componentes/switch/index.html` |
| AC-17 (previews) | `docs/src/previews/switch.tsx` + `docs/src/previews/switch-live.tsx` |
| AC-18 (MIGRATED Set) | `docs/src/pages/index.astro` linha 700: `"Switch"` adicionado em ordem alfabetica entre `Spinner` e final do array |
| AC-19 (barrel) | `ui_kit/components/index.ts:43` `export * from "./switch";` ja presente |
| AC-20 (build verde) | Confirmado: typecheck + lint + test + build + docs:build OK |
| AC-21 (playground approval) | Pendente — bloqueador antes do PR; sera solicitado ao Fernando |
| AC-22 (cobertura ≥ 80% ou ≥ 20 testes) | 26 testes comportamentais + 6 a11y = 32 testes; cobertura nao instrumentada nesta passagem (excede o gatilho por contagem) |

Cada teste em `Switch.test.tsx` carrega o prefixo `AC-N` no nome, conforme `lex-issue-driven` rule 3. **OK**.

### Check 2 — Scope creep

Arquivos modificados (via `git diff --stat main`):

```
docs/issues/issue-52/01-brief.md           (novo)
docs/issues/issue-52/02-requirements.md    (novo)
docs/issues/issue-52/03-architecture.md    (novo)
docs/issues/issue-52/05-security-review.md (novo)
docs/issues/issue-52/06-quality-report.md  (novo)
docs/src/pages/componentes/switch.astro    (novo)
docs/src/pages/index.astro                 (1 linha adicionada — Set MIGRATED)
docs/src/previews/switch-live.tsx          (novo)
docs/src/previews/switch.tsx               (novo)
ui_kit/components/switch/Switch.stories.tsx (reescrito)
ui_kit/components/switch/Switch.test.tsx   (novo)
ui_kit/components/switch/index.tsx         (reescrito)
.claude/plans/plan-053-switch-v0-1-0-dod.md (novo, gitignored)
```

Total: 13 arquivos. Todos declarados na Scope Table de `03-architecture.md`. **0 arquivos fora do escopo**. **OK**.

### Check 3 — Observability / Logging Decorator

`Switch` e componente UI cliente puramente apresentacional. Sem novo runtime surface (endpoint HTTP, event consumer, job). `lex-observability-required` rule 1 N/A. `lex-logging-decorator`: `grep -n "console\." ui_kit/components/switch/ docs/src/previews/switch*.tsx` retorna 0 ocorrencias. **OK**.

### Check 4 — Tests (≥ 20 ou ≥ 80% cobertura)

32 testes em `Switch.test.tsx` (26 comportamentais + 6 a11y light+dark). Excede a meta de ≥ 20 (Issue #52 + #53). Sem mocks de colaboradores internos (mocks limitados a `vi.fn()` para callbacks de teste — boundary). Queries usadas: `getByRole`, `getByText`, `closest("label")`, `getAttribute` — sem `getByTestId`. **OK**, `lex-frontend-testing` rule 1+2+3 cumpridas.

### Check 5 — Best practices

- `lex-frontend-typing`: `SwitchProps` interface tipada, sem `any`. tsc strict pass. **OK**.
- `lex-frontend-accessibility`: Radix Switch -> `role="switch"`; `Space`/`Enter` alternam; `aria-invalid` + `aria-describedby` quando aplicaveis; `focus-visible:ring-ring`. **OK**.
- `lex-frontend-security`: Sem `innerHTML`/`dangerouslySetInnerHTML`; sem secrets; sem storage. Veja `05-security-review.md`. **OK**.
- `lex-design-system-library`: Componente parte do `@guardia/design-system`; tokens semanticos exclusivos; zero `#hex`. **OK**.
- `lex-brand-colors`: Token `bg-action` (Violet 500 light / Orange 500 dark) usado; `text-fg`/`text-fg-muted` para textos; sem cor fora da paleta. **OK**.
- `lex-brand-typography`: Tipografia herda do design system (Poppins via global). Sem font-family inline. **OK**.
- `lex-dry`: `cn`, `cva`, padrao de `<label>` wrapper, `useId` — todos consumidos via shared utils. Nenhuma duplicacao de regra de dominio. **OK**.
- `lex-no-silent-tech-debt`: `grep -n "TODO\|FIXME\|XXX\|follow-up\|later\|revisit" ui_kit/components/switch/ docs/src/previews/switch*.tsx docs/src/pages/componentes/switch.astro docs/issues/issue-52/*.md` retorna 0 ocorrencias. **OK**.

### Check 6 — Types (strict)

`npm run typecheck` (= `tsc -p tsconfig.test.json --noEmit`) verde. 0 erros. **OK**.

### Check 7 — Performance budget

- Bundle: build do package `dist/` total 361.3 kB (91.4 kB gzipped) — mantem dentro do range historico do projeto. Switch contribui com 1 arquivo (`switch/index.js` + types). Diff esperado: ~+2-3 KB no bundle, abaixo de qualquer limite definido pelo projeto.
- Docs build: 38.56s para 23 paginas; switch.astro renderizou em 41ms. **OK**.

## Decisao Gate 2

**go**. Todos os 7 checks passaram. Restante: aprovacao "esta bom" do Fernando para o playground (AC-21) antes do PR.
