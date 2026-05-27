# Requirements — Issue #19

Critérios numerados, mapeados 1:1 com o DoD do Plan sub-issue #19.
Cada teste de unidade adicionado ou modificado nesta fase referencia
o respectivo `AC-N` no nome (`describe(...)` ou `it(...)`) ou em
comentário/docstring.

## Aceitação

### AC-1 — Storybook: Default + variantes principais em light + dark

`ui_kit/components/badge/Badge.stories.tsx` expõe Default + as
combinações principais (Soft, Solid, Outline, WithDot, WithIcons,
Square, Counts). O toolbar global do Storybook (`globalTypes.theme`)
alterna `light`/`dark` aplicando `data-theme` sincronamente no
`<html>` via `applyThemeSync` (`.storybook/preview.tsx`), garantindo
que cada story renderize corretamente nos dois temas sem flicker.

**Verificação:** `npm run build-storybook` verde + a matriz das
stories cobre os 3 eixos (variant × appearance × shape).

### AC-2 — Playground side-by-side contra legado/produção

Comparação visual + funcional registrada no PR via screenshot ou link
para `docs/componentes/badge` (Astro playground), comparando com a
implementação legada / produção atual. Como #18 não estabelece a
referência de "legado" como arquivo versionado, a comparação fica
ancorada ao Astro preview ativo (que é a referência canônica para
v0.1.0) com note explícita no PR.

**Verificação:** seção `## Playground` no corpo do PR com link para
`docs/componentes/badge` + nota.

### AC-3 — Behavioral tests com queries acessíveis

`ui_kit/components/badge/badge.test.tsx` exercita comportamento via
queries acessíveis (`getByRole`, `getByLabelText`, `getByText`),
mantém ≥ 20 casos de teste OR ≥ 80% de cobertura de linhas no
arquivo, e não mocka colaboradores internos.

**Nota de natureza do componente:** `Badge` é um primitivo passivo
(`<span data-slot="badge">` sem `role`, `tabIndex`, `disabled` nem
handlers de teclado). Por construção, não tem "navegação por teclado"
ou "estado disabled" próprios. A semântica interativa quando aplicável
vem do **container** (ex.: `<button><Badge>...</Badge></button>`). Os
testes cobrem esse caso composto explicitamente.

**Verificação:** contagem de `it(...)`/`it.each(...)` ≥ 20 no arquivo,
coverage report ≥ 80% para `ui_kit/components/badge/index.tsx`.

### AC-4 — A11y jest-axe em light + dark (obrigatório)

`badge.test.tsx` chama `axeInThemes(container)` (helper em
`ui_kit/test-utils/a11y.ts`, que alterna `data-theme` no `<html>` e
roda `axe()` em cada tema) para no mínimo:

1. **Default** (`<Badge>Ativo</Badge>` — soft + neutral + pill).
2. **Estado interativo principal** — Badge embutido em container
   interativo (`<button><Badge variant="brand">Novo</Badge></button>`)
   com `data-state="open"` simulando uso real em surfaces tipo
   dropdown/tab indicator.
3. **Disabled (quando aplicável)** — Badge não tem prop `disabled`;
   a equivalência é Badge dentro de `<button disabled>`, cobrindo o
   cenário de uso em UIs que desativam ações com contador.
4. **Solid variants** (cobertura existente, mantida).
5. **Outline variants** (cobertura existente, mantida).
6. **Variantes com dot + icons** (`WithDot`, `WithIcons`).

Cada bloco usa `expect(...).toHaveNoViolations()`.

**Verificação:** todos os testes axe verdes em `npm run test`.

### AC-5 — Brand: cores, tipografia e logo conforme Notion

Notion como fonte da verdade
(<https://www.notion.so/Branding-34536f91ebd280a69efacbadab3861c6>).
Em divergência com `.claude/rules/design/brand/lex-brand-*` locais,
Notion prevalece e o espelho local é atualizado antes da aprovação.

**Status MCP:** servidor `notion` está comentado em
`.ahrena/.directives` (`mcp.servers`). Fallback: verificação manual.
O PR registra explicitamente "Brand × Notion: verificação manual
pendente" para Fernando resolver via Notion direto.

**Verificação local (estável):** Badge consome exclusivamente tokens
`@theme inline` (`bg-guardia-*`, `text-guardia-*`, `bg-signal-*`,
`text-foreground`, `bg-background`) — zero cor hardcoded; tipografia
herda do tema global (Poppins via `font-family` global, sem override
local); sem logo.

### AC-6 — Quality gate (5 comandos verdes)

`npm run typecheck && npm run lint && npm run test && npm run build
&& npm run docs:build` executados em sequência, todos com exit 0.

**Verificação:** registrada em `06-quality-report.md`.

### AC-7 — Plan fecha via PR

PR carrega `Closes #19` e `Refs #18` no body. Merge fecha o Plan
automaticamente, levando #19 a `status: done` per `lex-agent-planning`.
Não merge é executado por agente — aguarda "está bom" explícito do
Fernando.

**Verificação:** body do PR conferido antes de abrir.
