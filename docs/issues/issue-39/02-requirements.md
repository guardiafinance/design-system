# Requirements — Plan #39

Critérios numerados, mapeados 1:1 com o DoD do Plan sub-issue #39 + parent
Issue #38. Cada teste de unidade adicionado nesta fase referencia o respectivo
`AC-N` no nome ou docstring, satisfazendo `lex-issue-driven` regra 3
(traçabilidade AC↔teste).

## Aceitação

### AC-1 — Story `DarkTheme` dedicada em `Combobox.stories.tsx`

A story precisa forçar `globals: { theme: "dark" }` no nível da story (não
apenas via toolbar global) e renderizar uma matriz representativa dos estados
visuais críticos no tema escuro: trigger fechado (default / com seleção /
invalid / disabled), trigger aberto com listbox visível mostrando a interação
`bg-action` no option selecionado vs `bg-bg-hover/60` no option ativo,
clearable com valor, e com `leftIcon`. Segue o padrão estabelecido pelo
Avatar (`Avatar.stories.tsx::DarkTheme`, PR #119) e replicado em Button
(PR #209), IconButton (PR #205), ButtonGroup (PR #206).

**Verificação:**
- `grep -E "^export const DarkTheme" ui_kit/components/combobox/Combobox.stories.tsx` retorna match.
- A story declara `globals: { theme: "dark" }` e `parameters.backgrounds.default: "dark"`.
- `npm run build-storybook` verde.
- Inspeção visual via Storybook toolbar confirma render correto no dark.

### AC-2 — Playground side-by-side contra referência atual

Astro playground `docs/src/pages/componentes/combobox.astro` já cobre 7 seções
ricas (Padrão, Com ícone, Limpável, Lista longa, Tamanhos, Estados,
Form-submit, Live snippet, Props, A11y, Source view via `?raw`). Como #38 não
estabelece um arquivo separado de "legado", a comparação fica ancorada ao
Astro preview ativo + ao código atual de `ui_kit/components/combobox/index.tsx`.

**Verificação:** seção `## Playground` no corpo do PR com link para
`docs/componentes/combobox` e a captura textual da aprovação visual do
Fernando.

### AC-3 — Behavioral tests cobrindo a matriz expandida do DoD

`ui_kit/components/combobox/combobox.test.tsx` cobre comportamento via queries
acessíveis (`getByRole`, `getByPlaceholderText`, `getByText`), atinge ≥ 20
casos de teste OR ≥ 80% de cobertura de linhas no arquivo
`ui_kit/components/combobox/index.tsx`, e não mocka colaboradores internos.

**Estado atual:** 35 `it()`, dos quais 25 são comportamentais cobrindo:
- Render: `role="combobox"`, placeholder default, placeholder customizado,
  `aria-haspopup="listbox"`, `aria-expanded="false"` fechado.
- Abertura: clique no trigger abre, popup mostra todas opções, `aria-controls`
  aponta para listbox.
- Filtro: digitar filtra por label, filtro busca em `meta` string, empty
  state quando nada acha.
- Seleção: clique seleciona e fecha (uncontrolled), trigger reflete label do
  selecionado, modo controlled respeita `value` externo, option `disabled`
  não pode ser selecionada.
- Teclado: ArrowDown/ArrowUp navega, Enter no search seleciona ativo, Escape
  fecha (Radix).
- Variants: `invalid` aplica `aria-invalid`, `disabled` bloqueia abertura,
  `clearable` mostra X + limpa quando clicado, clearable não aparece sem
  valor, `size="sm"`/`size="lg"` aplicam alturas.
- Form integration: `name` renderiza input hidden.
- A11y dinâmica: option selecionada expõe `aria-selected="true"`.

**Gap a fechar:** o DoD do parent #38 menciona explicitamente `Home`/`End` na
matriz de navegação por teclado. O código (`index.tsx:221-227`) implementa
ambos, mas não há teste cobrindo. Adicionar **2 testes comportamentais
mínimos** para fechar:

1. `Home` posiciona `activeIndex` no primeiro option filtrado.
2. `End` posiciona `activeIndex` no último option filtrado.

Após o delta: **37 `it()` totais**, todos com queries acessíveis, zero mocks
de colaboradores internos.

**Verificação:** contagem `grep -cE "^\s*(it|test)\(" combobox.test.tsx` ≥ 37,
todos passando em `npm run test`.

### AC-4 — A11y jest-axe em light + dark via `axeInThemes` cobrindo `no-results`

`combobox.test.tsx` chama `axeInThemes(container)` (helper em
`ui_kit/test-utils/a11y.ts`) para o conjunto canônico de estados de paint.

**Estado atual (6 cenários):**
1. `default closed` — trigger fechado, sem seleção.
2. `opened, no selection` — listbox aberto mostrando todas opções, activeIndex=0.
3. `opened with selection` — listbox aberto com option selecionada (`bg-action` + `text-button-fg`).
4. `invalid` — `aria-invalid` + border destructive.
5. `disabled` — trigger desabilitado, `disabled:opacity-70` + `disabled:bg-muted`.
6. `clearable with value` — botão X visível absolutamente posicionado.

**Gap a fechar:** o DoD menciona o `no-results state` (empty filter result) como
estado crítico, mas o conjunto atual não o cobre. Adicionar **1 cenário
adicional**:

7. `opened, filter with no results` — listbox aberto, busca digitada que não
   bate em nenhuma option, renderiza `emptyText` em `text-fg-muted` no fundo
   `bg-background` — verifica contraste do fallback em ambos os temas.

Após o delta: **7 cenários `axeInThemes`**, cada um rodando axe em light + dark
sequencialmente (helper alterna `data-theme` no `<html>`).

**Verificação:** contagem `grep -cE 'axeInThemes\(container\)' combobox.test.tsx`
≥ 7, todos passando.

### AC-5 — Brand contra Notion (fonte da verdade) via MCP

Verificar via Notion MCP (`mcp__claude_ai_Notion__notion-fetch`) que cores e
tipografia do Combobox **renderizado** estão alinhadas com:

- [Branding (raiz)](https://www.notion.so/Branding-34536f91ebd280a69efacbadab3861c6)
- [Cores](https://www.notion.so/34536f91ebd28142a3f1e0e58fd62c4b)
- [Tipografia](https://www.notion.so/34536f91ebd281b9b76ccc6159bfae69)

**Conhecido (não regressão):** o conflito `--primary` laranja vs Notion violeta
CTA já está roteado para o **Plan #208** (Brand inversion). Combobox usa
`--action` (violet 500 light / orange 500 dark) — qualquer novo conflito deve
ser surfaceado e roteado para issue separada (per `lex-no-silent-tech-debt`),
nunca silenciado.

**Verificação:** seção `## Brand check` no `06-quality-report.md` listando
(a) tokens consumidos pelo Combobox, (b) mapeamento contra Notion (cores +
typeface), (c) divergências novas (esperado: 0; conhecida `--primary` ignorada
por estar sob Plan #208).

### AC-6 — Pipeline CI verde

Os 5 comandos canônicos do projeto rodam sem erro no worktree:

```
npm run typecheck
npm run lint
npm run test
npm run build
npm run docs:build
```

`lex-frontend-typing` exige `tsc --noEmit` zero erros; `lex-frontend-testing`
exige tests verdes; lint exige zero `console.log` (`no-console`) e zero
imports proibidos (Radix permitido — wrapper local; mas hardcoded hex
bloqueado por Stylelint).

**Verificação:** stdout dos 5 comandos anexado ao `06-quality-report.md` com
exit code 0; CI green status no GitHub Checks após push.

### AC-7 — "Está bom" Fernando + PR `Closes #39`

PR aberto via `gh pr create` no `head=chore/39-combobox-v01-dod-review`,
`base=main`, body contendo `Closes #39`, com mirror de labels do issue
(`evolvability ♻️`) + `size/*` aplicado + assignee `@me`. Status do PR vira
`status: to review` ao abrir (rule do parent #38, sub-cycle pendente de Argos).

**Verificação:** URL do PR retornada; status do PR conferido via
`gh pr view --json reviewDecision`. Loop de espera (3×15min) aciona em caso
de timeout sem aprovação humana (per `codex-notifications`).

## Definition of Done (consolidada)

- [x] AC-1 atendido: `DarkTheme` story presente, build-storybook verde.
- [x] AC-2 atendido: link Astro playground no PR + aprovação textual.
- [x] AC-3 atendido: ≥ 37 testes comportamentais, queries acessíveis, zero mocks internos.
- [x] AC-4 atendido: 7 cenários `axeInThemes` (light + dark) passando.
- [x] AC-5 atendido: Brand check vs Notion via MCP, 0 divergência nova.
- [x] AC-6 atendido: typecheck + lint + test + build + docs:build verde.
- [x] AC-7 atendido: PR aberto com `Closes #39`, aprovação Fernando + merge.

## Out of scope (não tocar)

- Mapeamento dos tokens `--primary` / `--action` / `--ring` — sob Plan #208.
- Token `--fg-muted` (placeholder do trigger) — sob Plan #128.
- Mudança de comportamento do filtro (mudar de "contains" para "starts-with"
  ou fuzzy) — não pedido pelo DoD; abriria novo Issue.
- Adicionar `multi-select` — não escopo do v0.1.0 do Combobox; Plan separado.
- Refactor para compor `Popover`/`Input` próprios — out of v0.1.0; futuro DoD.
