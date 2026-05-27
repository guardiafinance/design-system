# Architecture — Issue #21

## Componentes afetados (escopo)

| Arquivo | Mudança esperada |
|---|---|
| `ui_kit/components/button/button.test.tsx` | Adicionar 4 testes comportamentais (Enter, Space, aria-busy on loading, default type=button) + 1 bloco `describe("AC-4: a11y jest-axe em light + dark")` com 6 testes axe via `axeInThemes`. Total esperado: 16 + 4 + 6 = **26 testes**. |
| `ui_kit/components/button/Button.stories.tsx` | Adicionar story `DarkTheme` explícita (story que força `globals: { theme: "dark" }`, parameters `backgrounds: { default: "dark" }`, e renderiza matriz 6×3 + estados, espelhando o padrão Avatar `DarkTheme`). |
| `ui_kit/components/button/index.tsx` | **Sem alterações** — Button é estável e adequado ao DoD. Qualquer mudança aqui (e.g., inversão de tokens primário/secundário decorrente do Brand finding) é tratada em sub-issue/Plan separado conforme decisão do Fernando no Gate 1. |
| `docs/src/pages/componentes/button.astro` | Sem alterações — playground já cobre Variantes, Tamanhos, Ícones, Agente, Estados, Playground ao vivo, Props e A11y. |
| `docs/issues/issue-21/01-brief.md` | Criado em Phase 1. |
| `docs/issues/issue-21/02-requirements.md` | Criado em Phase 2. |
| `docs/issues/issue-21/03-architecture.md` | Este arquivo. |
| `docs/issues/issue-21/05-security-review.md` | Criado em Phase 5. |
| `docs/issues/issue-21/06-quality-report.md` | Criado em Phase 6. |

## Guardrails de escopo

Apenas dois subdiretórios são tocados nesta revisão:

1. `ui_kit/components/button/` — somente `button.test.tsx` e
   `Button.stories.tsx`; `index.tsx` fica intocado.
2. `docs/issues/issue-21/` — artefatos do fluxo.

Qualquer mudança fora desses dois diretórios dispara
`lex-no-silent-tech-debt` (Tangential Finding Protocol) — registrada
como comentário em #21 ou nova sub-issue, nunca incluída neste PR.

## Decisões de design

### D-1 — Reusar `axeInThemes` (não reescrever helper)

O helper `axeInThemes` em `ui_kit/test-utils/a11y.ts` (Tech Task #125)
é o canonical pattern do projeto. Já é consumido por Card, Spinner,
Skeleton, Separator, Chart, Chip, Slider, Label e Input. Reusar
diretamente, sem variação local, é aderente a `lex-dry` e mantém o
projeto convergente em a11y dual-theme.

### D-2 — Não tocar `index.tsx`

`index.tsx` tem 176 linhas, está estável, atende aos critérios técnicos
do DoD (forwardRef, asChild via Radix, loading com motion-safe,
guardrail dev-only para size="icon" sem aria-label, focus-visible
ring, disabled handling). O escopo de #21 é **revisão**, não
evolução. Tocar `index.tsx` violaria `lex-small-commits` e abriria
risco de quebrar baseline visual (snapshots Ubuntu/CI), que está fora
do escopo (NEVER regenerar de macOS — `feedback_visual_regression_ubuntu_sot.md`).

A única exceção legítima a esta decisão seria a inversão de tokens
primário/secundário decorrente do Brand finding (`01-brief.md`) —
mas essa inversão (a) afeta TODOS os botões do produto, (b) afeta
o anel de foco, (c) afeta a baseline visual, e (d) tem opção
explícita "(c)" no Gate 1 para o Fernando autorizar **ou** "(b)" para
delegar a Plan separado. O default é "(b)" — não tocar.

### D-3 — Story `DarkTheme` explícita (não só toolbar)

O toolbar global do Storybook já permite ao reviewer alternar
light/dark em qualquer story existente. Adicionar uma story
`DarkTheme` explícita não é redundante:

1. Documenta como **contrato visual** que o Button mantém WCAG AA
   em todas as variantes sobre Cinza 900.
2. Espelha o padrão do Avatar (PR #119), mantendo coerência
   inter-componente da galeria.
3. Serve como caso visual de regressão quando snapshots Ubuntu são
   regenerados (label `regenerate-baselines`).
4. Centraliza, em uma única view, a matriz completa de variantes +
   estados — o que toggling via toolbar exige percorrer story a story.

Não dispara `lex-small-commits` porque é exatamente uma adição
relacionada coerente ao escopo de AC-1.

### D-4 — Mocks limitados a boundaries

Os testes existentes mockam apenas `onClick` (`vi.fn()`) — boundary
de input do usuário — e `console.warn` (`vi.spyOn`) — boundary do
runtime para verificar o guardrail dev-only. Os 4 novos testes
comportamentais mantêm essa disciplina: zero mock de colaboradores
internos do Button, zero mock do Radix Slot. O bloco axe não mocka
nada — roda `axe()` real sobre o DOM renderizado.

### D-5 — Brand finding fora deste PR (default opção b)

Detalhado em `01-brief.md`. Decisão deslocada para Gate 1. Default
é abrir nova sub-issue/Plan para a inversão primário/secundário,
mantendo #21 como revisão pura.

## Riscos

| Risco | Mitigação |
|---|---|
| Snapshot visual quebra no CI Ubuntu por adição da story `DarkTheme` | A story renderiza num bloco isolado; a Chromatic workflow trata novas stories como baselines novas (não regressões). Se gerar baseline pendente, aplicar label `regenerate-baselines` no PR conforme `feedback_visual_regression_ubuntu_sot.md`. |
| `axeInThemes` reportar violação inesperada em variante orange/destructive em dark | Em dark mode, `--primary` mantém orange e os tokens shadcn flipam adequadamente. Risco controlado — Spinner/Card/Skeleton já passam o axe nos dois temas com tokens similares. Se aparecer, é regressão real e bloqueia o PR. |
| Brand finding (Notion ↔ implementação) divergir após decisão do Fernando | Default da decisão (opção b) gera nova sub-issue sem alterar `index.tsx` — risco zero para #21. Se Fernando escolher (c) (expandir escopo), `02-requirements.md` e `03-architecture.md` são atualizados antes do Phase 4. |
| `npm run lint` falhar por novos erros introduzidos no diff | Os arquivos tocados são apenas test + story (não index.tsx). Padrões existentes são copy/paste de Spinner/Card. Risco baixo. |
| Cobertura < 80% mesmo com testes novos | 16 → 26 testes (+62%); cobertura de `index.tsx` já passa de 80% com a suíte existente (única função não trivial é o `Spinner` interno + o forwardRef body). Os 6 testes axe não contribuem coverage extra do arquivo, mas os 4 comportamentais sim. Risco baixo. |
| Pre-existing 19 lint errors históricos (Tech Task #120) bloquearem o gate | Decisão herdada do PR #119: tratar como `green com pendência conhecida`. Registrado em `06-quality-report.md` com a contagem comparativa antes/depois do diff. |
