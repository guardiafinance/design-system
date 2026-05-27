# Requirements — Issue #21

Critérios numerados, mapeados 1:1 com o DoD do Plan sub-issue #21.
Cada teste de unidade adicionado ou modificado nesta fase referencia
o respectivo `AC-N` no nome (`describe(...)` ou `it(...)`) ou em
comentário/docstring.

## Aceitação

### AC-1 — Storybook: Default + variantes principais em light + dark

`ui_kit/components/button/Button.stories.tsx` expõe Default + as 6
variantes (default, destructive, outline, secondary, ghost, link) + os
5 tamanhos (xs implícito via control, sm, default, lg, icon) + os
estados Disabled. O toolbar global do Storybook (`globalTypes.theme`)
alterna `light`/`dark` aplicando `data-theme` sincronamente no
`<html>` via `applyThemeSync` (`.storybook/preview.tsx`), garantindo
que cada story renderize corretamente nos dois temas sem flicker.

Adicionar story `DarkTheme` explícita seguindo o padrão estabelecido
no Avatar (`Avatar.stories.tsx::DarkTheme`, PR #119) — força
`globals: { theme: "dark" }` no nível da story e renderiza matriz
completa (6 variantes × 3 tamanhos relevantes + estados loading /
disabled / com ícones) sobre fundo Cinza 900 (`#17171b` — Mono Black
no Notion Dark Mode), provando que todos os tokens flipam corretamente.

**Verificação:** `npm run build-storybook` verde + visual inspection
em ambos os temas via toolbar.

### AC-2 — Playground side-by-side contra legado/produção

Comparação visual + funcional registrada no PR via link para
`docs/componentes/button` (Astro playground), comparando com a
implementação atual da produção. O `button.astro` já cobre 5 seções
ricas (Variantes, Tamanhos, Ícones, Agente, Estados, Playground
ao vivo, Props, A11y) e segue como referência canônica para v0.1.0.
Como #20 não estabelece um arquivo separado de "legado", a comparação
fica ancorada ao Astro preview ativo + ao código atual de
`ui_kit/components/button/index.tsx`.

**Verificação:** seção `## Playground` no corpo do PR com link para
`docs/componentes/button` e a nota da aprovação visual do Fernando.

### AC-3 — Behavioral tests com queries acessíveis

`ui_kit/components/button/button.test.tsx` exercita comportamento via
queries acessíveis (`getByRole`, `getByLabelText`), atinge ≥ 20 casos
de teste OR ≥ 80% de cobertura de linhas no arquivo
`ui_kit/components/button/index.tsx`, e não mocka colaboradores
internos.

**Estado atual:** 16 testes via `getByRole("button")` / `getByText` /
`getByTestId` (3 usos de testId justificados para slots de ícone).
Mocks limitados a `vi.fn()` para `onClick` (boundary) e a
`vi.spyOn(console, "warn")` (boundary de console para o guardrail
dev-only de `size="icon"`).

**Gap a fechar:** +4 testes comportamentais mínimos para atingir 20+:

1. Teclado Enter ativa o botão (`{Enter}`).
2. Teclado Space ativa o botão (`{ }` via `userEvent.keyboard`).
3. Loading expõe `aria-busy="true"` (a11y dinâmica per
   `lex-frontend-accessibility` rule 6).
4. `type` default é `"button"` (não `"submit"`) — previne side effect
   acidental dentro de `<form>`.

**Verificação:** contagem de `it(...)` no arquivo ≥ 20, coverage
report ≥ 80% para `ui_kit/components/button/index.tsx`.

### AC-4 — A11y jest-axe em light + dark (obrigatório)

`button.test.tsx` chama `axeInThemes(container)` (helper em
`ui_kit/test-utils/a11y.ts`, que alterna `data-theme` no `<html>` e
roda `axe()` em cada tema) para no mínimo:

1. **Default** (`<Button>Salvar</Button>` — variant=default, size=default).
2. **Matriz de variantes principais** (default, secondary, destructive,
   outline, ghost, link) renderizadas em conjunto.
3. **Disabled** (`<Button disabled>...</Button>`) — estado interativo
   crítico onde a11y muitas vezes regride.
4. **Loading** (`<Button loading>...</Button>`) — estado dinâmico que
   expõe `aria-busy` semantics e mantém o nome acessível.
5. **asChild renderizado como `<a>`** — preserva semântica `role=link`,
   crítico para a11y por causa da troca de role default.
6. **size="icon" com aria-label explícito** — caso onde o botão não
   tem texto visível e depende 100% do label acessível.

Cada bloco usa `expect(...).toHaveNoViolations()` via
`axeInThemes(container)`. A regra `color-contrast` permanece
configurada via parameter (não desabilitada no test runner) — as
variantes na faixa 3:1-4.5:1 (`default`/orange, `destructive`/red)
são reservadas para botões per `lex-brand-colors`, e o axe aplicaria
falso positivo do threshold 4.5:1 normal-text. Se necessário,
desabilitar a regra dentro do bloco específico via
`axe(container, { rules: { 'color-contrast': { enabled: false } } })`
com comentário inline justificando.

**Verificação:** todos os testes axe verdes em `npm run test`.

### AC-5 — Brand: cores, tipografia e logo conforme Notion

Notion como fonte da verdade
(<https://www.notion.so/Branding-34536f91ebd280a69efacbadab3861c6>).

**Status MCP:** `notion` MCP server ativo na Phase 1. Validação
detalhada em `01-brief.md`.

**Resultado da validação (resumo):**

- ✅ **Tipografia:** Poppins via global (fallback Roboto), nenhum
  font-family local no Button. Aderente.
- ✅ **Cores — paleta:** Button consome exclusivamente tokens
  semânticos shadcn (`bg-primary`, `bg-secondary`, `bg-destructive`,
  `bg-accent`, `text-*-foreground`, `border-input`, `bg-background`,
  `hover:bg-*/90`, `ring-ring`, `ring-offset-background`). Zero
  hex/RGB hardcoded. Os tokens resolvem para a paleta oficial (orange
  500, violet 500, signal red, mono branco/preto). Aderente.
- ✅ **Cores — dark mode CTA:** Notion (Dark Mode) prescreve laranja
  como cor de ação preferencial em superfícies escuras. CSS
  (`ui_kit/styles/index.css:297`) já mantém `--primary` em orange no
  modo dark. Aderente.
- ⚠️ **Cores — hierarquia primário/secundário em light mode:**
  divergência detectada em Phase 1 (detalhe em `01-brief.md` → Brand
  finding). A implementação atual usa `--primary = laranja` (shadcn
  convention) enquanto Notion designa **violeta** como CTA primário em
  light. **Decisão no Gate 1 (Fernando, opção b):** roteado para Tech
  Task dedicada, fora do escopo de #21. A inversão de tokens afeta
  TODOS os botões do produto, o anel de foco, e a baseline visual —
  merece Plan próprio, com validação Brand × Notion conjunta e
  regeneração coordenada de baselines.
- ✅ **Logo:** Button não renderiza nenhum logo. Fora do escopo do
  componente.

**Status AC-5:** ✅ entregue como documentação + roteamento. Plan #21
cobre nenhuma alteração de mapeamento de tokens; o trabalho de
inversão primário/secundário é uma Tech Task separada aberta em
paralelo via warrior-eunomia (referência no body do PR).

### AC-6 — Quality gate (5 comandos verdes)

`npm run typecheck && npm run lint && npm run test && npm run build
&& npm run docs:build` executados em sequência, todos com exit 0.

**Pendência conhecida pré-existente:** `npm run lint` reportou 19 erros
em outros componentes (navbar, pagination, typography, theme-toggle)
no PR #119 e tornou-se Tech Task #120. Esses erros são pré-existentes
e fora do diff de #21. Se o lint falhar por novos erros introduzidos
nesta PR, é regressão e bloqueia o gate. Se falhar apenas com os 19
históricos, o gate trata como `green com pendência conhecida`
(decisão herdada do PR #119).

**Verificação:** registrada em `06-quality-report.md` com a saída
literal de cada comando.

### AC-7 — Plan fecha via PR

PR carrega `Closes #21` e `Refs #20` no body. Merge fecha o Plan
automaticamente, levando #21 a `status: done` per `lex-agent-planning`.
Nenhum merge é executado por agente — aguarda "está bom" explícito do
Fernando no PR ou no Issue, conforme a regra reforçada em
`feedback_a11y_unit_test_ac.md` e na auto-memory do Fernando.

**Verificação:** body do PR conferido antes de abrir; comentário do
Fernando "está bom" capturado antes do merge.
