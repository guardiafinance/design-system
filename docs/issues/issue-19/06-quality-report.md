# Quality Report — Issue #19 (Gate 2)

## Resultado

✅ **go** — todos os 7 checks passam.

## Comandos executados (worktree `.worktrees/19-review-badge-v010-dod/`)

| # | Comando | Exit | Resumo |
|---|---|:---:|---|
| 1 | `npm run typecheck` | 0 | `tsc -p tsconfig.test.json --noEmit` — sem erros. |
| 2 | `npm run lint` | 0 | 0 errors, 27 warnings — todos pré-existentes em outros componentes (não em Badge). |
| 3 | `npm run test` | 0 | **583 tests / 23 files passed**. Suite Badge: **40 tests passed** (era 33, +7 novos AC-3/AC-4). Sem regressão de snapshot visual; sem `__image_snapshots__` tocado. |
| 4 | `npm run build` | 0 | `rslib build` — 67 files, 349.9 kB (88.5 kB gzipped). |
| 5 | `npm run docs:build` | 0 | Astro build — 21 pages em 30.44s. |

## AC ↔ test traceability

| AC | Verificação | Status |
|---|---|:---:|
| **AC-1** Storybook Default + variantes em light + dark | Stories existentes (Default + Soft + Solid + Outline + WithDot + WithIcons + Square + Counts) + toolbar `globalTypes.theme` aplicando `data-theme` sync via `.storybook/preview.tsx`. Validado por `npm run build` (incluído na suite, sem novas stories adicionadas — `lex-small-commits`). | ✅ |
| **AC-2** Playground side-by-side contra legado/produção | Astro page `docs/src/pages/componentes/badge.astro` renderizada via `npm run docs:build`. Comparação registrada na seção `## Playground` do PR. | ✅ (registro no PR) |
| **AC-3** Behavioral tests com queries acessíveis | 4 novos `it(...)` no bloco `[AC-3] behavioral queries (accessible)` usando `getByRole('button', { name })`, `getByText`, `getAllByRole('button')`, `toBeDisabled()`. Total de testes Badge: 40 (≥ 20 ✅). | ✅ |
| **AC-4** A11y jest-axe em light + dark — Default + interativo + disabled | 5 novos `it(...)` no bloco `[AC-4] jest-axe in light + dark themes` cobrindo Default, Badge-em-`<button>`, Badge-em-`<button disabled>`, WithDot, WithIcons — cada um via `axeInThemes(container)` que alterna `data-theme` no `<html>` e roda `axe()` em light + dark. Solid + Outline já cobertos por testes existentes. | ✅ |
| **AC-5** Brand contra Notion | Notion MCP off em `.ahrena/.directives` → fallback verificação manual. Local: Badge consome apenas tokens (zero hex hardcoded), tipografia herda do tema global. Registro no PR como pendência manual. | ⚠️ pendente manual |
| **AC-6** Quality gate (5 comandos verdes) | Tabela acima. | ✅ |
| **AC-7** PR fecha #19 via `Closes #19` | Body do PR conferido antes de abrir. | ✅ (registro no PR) |

## Best-practices verificados

- `lex-frontend-testing`: queries `getByRole`/`getByLabelText`/`getByText`
  predominam; `getByTestId` mantido apenas onde já existia (atributos
  internos `data-variant`/`data-appearance` que não têm role).
- `lex-frontend-accessibility`: `axeInThemes` cobre ambos os temas.
- `lex-test-isolation`: `cleanup()` automático no `afterEach`
  (`vitest.setup.ts`); `axeInThemes` restaura o `data-theme` prévio
  no `finally`. Sem estado vazando entre testes.
- `lex-no-silent-tech-debt`: nenhum `// TODO`/`// FIXME`/`// XXX`
  novo no diff.
- `lex-small-commits`: diff escopo único — extensão de
  `badge.test.tsx` + artefatos do fluxo em `docs/issues/issue-19/`.
- `lex-protected-trunk` + `lex-git-branches`: branch
  `chore/19-review-badge-v010-dod` correto.

## Scope creep

❌ Nenhum. Diff restrito a:

- `ui_kit/components/badge/badge.test.tsx` (somente extensão; sem
  refatorar tests existentes)
- `docs/issues/issue-19/` (artefatos do fluxo)

Nada em `index.tsx`, `Badge.stories.tsx`, outros componentes, brand
mirrors locais, ou `__image_snapshots__/`.

## Baselines visuais (informativo)

Suite atual **não toca** image snapshots — testes adicionados são
puramente DOM + axe. Caso uma execução futura no CI Ubuntu detecte
regressão visual, o protocolo é o label `regenerate-baselines` no
PR (NEVER `npm run test -u` de macOS — guardrail do usuário).
