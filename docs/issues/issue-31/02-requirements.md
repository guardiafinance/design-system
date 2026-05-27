# Phase 2 — Requirements: Separator v0.1.0 DoD

> ACs numerados derivados 1:1 do checklist do Plan #31. Tests citam `AC-N` na descrição (`it("AC-N: ...")`).

## Acceptance Criteria

### AC-1 — Storybook cobre Default + variantes principais em light AND dark

`Separator.stories.tsx` declara:
- `Default` (solid horizontal, sem label).
- `Dashed`, `Dotted` — cobre cada `appearance`.
- `WithLabel`, `WithLongLabel`, `DashedWithLabel` — cobre rendering com label semântico.
- `Vertical` — `orientation="vertical"` em contexto realista.
- `Showcase` — todas combinações lado-a-lado para playground.

Cada story renderiza corretamente em `light` E `dark` via toggle do Storybook (`data-theme` no `<html>` controlado pelo theme switcher já existente no repo).

### AC-2 — Playground side-by-side registrado no PR

PR body inclui seção "Playground" referenciando:
- URL Storybook (`/?path=/docs/components-separator--docs`) para revisão visual.
- Story `Showcase` como ponto único de comparação.

### AC-3 — Behavioral tests com queries acessíveis

`separator.test.tsx`:
- Usa `getByRole("separator")` (semântico, quando `decorative=false` ou com `label`) e `getByText` para conteúdo de label.
- Para verificações de aparência (gradient/orientation) usa `data-testid` como container hook — única exceção documentada (Radix renderiza `<div>` sem role acessível quando `decorative=true`, então `getByRole` não aplica e `data-testid` é o fallback aceito).
- Sem mocks de colaboradores internos (apenas Radix primitive importado diretamente — Radix é boundary, não interno).
- ≥ 20 testes OU ≥ 80% de cobertura no arquivo `index.tsx`.

### AC-4 — A11y (jest-axe) cobre light AND dark — MANDATORY

Cobertura jest-axe via helper `axeInThemes` (`@/test-utils/a11y`) que alterna `data-theme` no `document.documentElement` e valida `toHaveNoViolations()` em ambos os temas:

- `Default` (solid decorative) — light + dark.
- `WithLabel` (semântico, `role="separator"` com texto) — light + dark.
- `Dashed`, `Dotted` (decorative com gradient) — light + dark.
- `Vertical` (decorative) — light + dark.
- `DashedWithLabel` (semântico + gradient) — light + dark.

**Nota sobre `disabled`:** Separator é não-interativo por especificação WAI-ARIA. Não há prop `disabled` no contrato — a AC do template original "disabled when applicable" se aplica vacuosamente (não há estado interativo a desabilitar). Documentado em `01-brief.md` e na nota de escopo do PR.

**Nota sobre "keyboard navigation":** um teste confirma que o elemento `role="separator"` NÃO entra no tab order (`tabindex` ausente ou `-1` — Radix default).

### AC-5 — Brand × Notion alinhado

Verificação manual de tokens visuais consumidos pelo `Separator`:
- `--border` (cor da linha) corresponde à escala Brand documentada no Notion.
- Tipografia do label (`text-fg-muted text-[11px] font-semibold uppercase tracking-[0.08em]`) usa Poppins via stack global do repo (compliant com `lex-brand-typography`).

Em divergência: atualizar espelho local de tokens. Em conformidade: registrar "Brand × Notion: alinhado" no PR. Se MCP Notion não disponível na sessão: registrar "Brand × Notion: verificação manual pendente" no PR para Fernando endossar.

### AC-6 — Quality gate verde

`npm run typecheck && npm run lint && npm run test && npm run build && npm run docs:build` executados localmente (macOS dev box). Resultados registrados em `06-quality-report.md`. Snapshot regressions de `__image_snapshots__/` (se houver) NÃO regeneradas localmente — listadas em seção "Visual baselines (CI re-run needed)" do PR com instrução `regenerate-baselines` label.

### AC-7 — PR fecha o Plan via `Closes #31`

PR body contém `Closes #31` (auto-fecha o Plan sub-issue) e `Refs #30` (parent chore mantém-se aberto até todo seu Plan-set fechar).

## Definition of Done

Todos os ACs ✅, quality gate verde, PR aberto com assignee `@me` (`fernandoseguim`) e labels espelhadas (`evolvability ♻️` + `size/*`). Merge NÃO executado — aguarda aprovação humana do Fernando.

## Out of Scope

- Adicionar prop `disabled` (Separator é não-interativo).
- Novas `appearance` variants (gradient, double-line, etc.).
- Mudar contratos de `<SeparatorPrimitive.Root>` (Radix é boundary).
- Regenerar baselines visuais (macOS-rendered = forbidden por user guardrail).
