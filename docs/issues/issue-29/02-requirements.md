# Phase 2 — Requirements: Label v0.1.0 DoD review

> ACs numerados (AC-1..AC-7) derivados 1:1 do checklist do DoD do Plan #29. Cada AC tem mecanismo concreto de verificação para Gate 2.

## Definition of Done (canonical reference)

- Source: Plan #29 body. Parent chore #28 carries the same DoD textually.
- Cada AC abaixo TEM ≥ 1 teste ou verificação anotada com `AC-N` (via `// AC-N` no teste ou nome do teste) per `codex-issue-workflow`.
- Linguagem PT-BR: usar **"teste de unidade"** (memory pin), nunca "teste unitário".

## Acceptance Criteria

### Storybook + dark mode

| AC | Description | Verification |
|----|-------------|--------------|
| **AC-1** | `Label.stories.tsx` expõe **Default + variantes principais** (Required, Optional, Sizes, WithField, CustomOptionalLabel) e cada uma renderiza corretamente em **light AND dark**. Cobertura dark é fornecida pelo decorator de tema global do preview (já configurado em `.storybook/preview.tsx`) — basta confirmar que cada story funciona quando o toolbar de tema alterna `data-theme`. | Inspeção manual no playground (`npm run dev:all`); listagem do conjunto de stories no PR; verificação por `npm run build-storybook` que tudo compila. |
| **AC-2** | Comparação **side-by-side** registrada no PR: stories existentes do Label conferem com a referência atual de produção (Radix Label + asterisco required + sufixo optional, semântica HTML `<label htmlFor>`). | Seção dedicada no corpo do PR documentando o que foi visualmente conferido em `/componentes/label`. |

### Testes de unidade comportamentais

| AC | Description | Verification |
|----|-------------|--------------|
| **AC-3** | `label.test.tsx` contém **≥ 20 testes de unidade comportamentais** usando queries acessíveis (`getByRole`, `getByLabelText`, `getByText`) per `lex-frontend-testing`; sem mocks de colaboradores internos; cobre: render, associação por `htmlFor`, indicador `required` (asterisco com `aria-hidden`), indicador `optional` (sufixo + customização), variantes de `size`, encaminhamento de `ref`, merge de `className`, atributos `data-required` / `data-optional`, ativação do input ao clicar no label (interação real). Alvo: ≥ 20 testes OU ≥ 80% file coverage. | `npm run test -- label` reporta ≥ 20 testes verdes para o arquivo; `npm run test:coverage` confirma o threshold se cair na contagem. |

### A11y (jest-axe) — MANDATORY

| AC | Description | Verification |
|----|-------------|--------------|
| **AC-4** | `label.test.tsx` inclui asserts `toHaveNoViolations()` para no mínimo: (a) **Default** (`<Label>` simples associado a `<input>`), (b) **estado interativo principal** (`Label` com `required` + input focado), (c) **`disabled` aplicável** (input controlado `disabled` com Label associado — Radix Label propaga `peer-disabled` styling). Cada um dos 3 cenários roda em **light AND dark** via `axeInThemes()` (que faz o toggle de `data-theme` no `document.documentElement` em `beforeEach`/`afterEach` internamente). | jest-axe assertions presentes e verdes para ambos os temas no `npm run test -- label`. |

### Brand × Notion

| AC | Description | Verification |
|----|-------------|--------------|
| **AC-5** | Verificação Brand contra [Branding no Notion](https://www.notion.so/Branding-34536f91ebd280a69efacbadab3861c6) — cores, tipografia e tom textual do `Label` (sufixo `(opcional)`, asterisco vermelho `text-destructive`). Em caso de divergência, **Notion prevalece** e o espelho local (`.claude/rules/design/brand/lex-brand-*.md` / `codex-brand-*`) é atualizado **antes** do PR. Se o MCP Notion não estiver ativo nesta sessão, a verificação é declarada como "manual pending" no corpo do PR. | Resultado da verificação documentado no PR (✅ verificado / 🟡 manual pending). |

### Gates de qualidade

| AC | Description | Verification |
|----|-------------|--------------|
| **AC-6** | `npm run typecheck && npm run lint && npm run test && npm run build && npm run docs:build` retornam exit code 0. Image-snapshots divergentes (se houver) **NÃO** são regenerados daqui (macOS); são listados na seção "Visual baselines (CI re-run needed)" do PR para baseline via label `regenerate-baselines` em Ubuntu/CI. | Saída de cada comando em `docs/issues/issue-29/06-quality-report.md` com exit codes. |

### PR e closure

| AC | Description | Verification |
|----|-------------|--------------|
| **AC-7** | PR aberto contra `main` a partir de `chore/29-review-label-v010-dod`, com `Closes #29` (fecha o Plan automaticamente no merge) e `Refs #28` (referência para a chore parent). Labels do issue (`evolvability ♻️`) espelhados + `size/*` computado. Assignee `@me` (`fernandoseguim`). **NÃO merge** — fica aberto aguardando aprovação explícita ("está bom") do Fernando. | PR URL retornado no final do flow; verificação via `gh pr view`. |

## Tracking

Cada AC acima é checkado em Phase 6 (Gate 2 / Quality) e reportado em `06-quality-report.md` com mapeamento AC ↔ teste/comando que comprova.

## Out of scope (Tangential Finding Protocol — `lex-no-silent-tech-debt`)

- Alterar API pública do `Label` (props, defaults) → seria mudança de contrato; merece Plan próprio.
- Renomear `label.test.tsx` para `Label.test.tsx` (PascalCase): convenção atual do repo é mista; fora do DoD.
- Mover Brand mirror para outra estrutura: fora do DoD.
- Tagging / release: fora do DoD (warrior-janus).

Qualquer outro achado durante a execução vira comentário em #29 com 3 opções explícitas (expandir Plan, novo Plan sub-issue, novo parent Issue).
