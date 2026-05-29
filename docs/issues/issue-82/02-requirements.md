# Phase 2 — Requirements: `feat(sidebar-nav): migrate SidebarNav to v0.1.0 DoD`

- **Issue:** [#82](https://github.com/guardiatechnology/design-system/issues/82)
- **Plan sub-issue:** [#83](https://github.com/guardiatechnology/design-system/issues/83)
- **Brief:** [`01-brief.md`](./01-brief.md)
- **Status:** complete

Todos os ACs estão numerados (`AC-N`) para satisfazer `lex-issue-driven` Rule 3 (rastreabilidade bidirecional AC ↔ test).

## Acceptance Criteria

### Public surface

- **AC-1** — O módulo `ui_kit/components/sidebar-nav/index.tsx` exporta a superfície pública canônica: `SidebarNav`, `SidebarNavSection`, `SidebarNavItem`, `SidebarNavGroup`, `SidebarNavGroupTrigger`, `SidebarNavGroupContent`, `sidebarNavVariants`, `sidebarNavItemVariants`, mais os tipos `SidebarNavProps`, `SidebarNavSectionProps`, `SidebarNavItemProps`, `SidebarNavGroupProps`. Os accessors `sidebarNavVariants` e `sidebarNavItemVariants` são funções CVA invocáveis sem argumentos (defaults aplicados).
- **AC-2** — `SidebarNav` é re-exportado por `ui_kit/components/index.ts` (export wildcard de `./sidebar-nav`).

### Tokenização e Brand

- **AC-3** — A composição usa **exclusivamente tokens semânticos** do DS (`--sidebar`, `--sidebar-foreground`, `--sidebar-accent`, `--sidebar-accent-foreground`, `--sidebar-border`, `--sidebar-ring`, `--muted-foreground`, `--ring`). Nenhum valor `oklch(...)`, hex literal (`#...`), nem classes Tailwind cromáticas diretas (`text-violet-*`, `bg-orange-*`, `text-red-*`) na superfície pública ou nas classes CVA.
- **AC-4** — O container raiz aplica `bg-sidebar text-sidebar-foreground border-sidebar-border` (light) e mantém os mesmos tokens em dark (mapeamento via `data-theme="dark"` já provido em `ui_kit/styles/index.css`). Nenhuma classe `dark:...` cromática é necessária — o token chain resolve.

### Variantes — Root

- **AC-5** — `<SidebarNav>` aceita `collapsed?: boolean` (default `false`). Quando `true`, a largura do container reduz para a faixa compacta (paridade com `.grd-sb-col` legada, 56px ± padding), labels de itens ficam ocultos (`sr-only` ou `hidden`), labels de seção viram um divisor visual, e itens dentro de `Group` são renderizados inline (sem trigger/chevron — espelhando a legada).
- **AC-6** — A transição `width` entre estados expandido/colapsado é animada (≥ 150ms) e respeita `prefers-reduced-motion: reduce` (transition desativada via `motion-reduce:transition-none`).

### Variantes — Item

- **AC-7** — `<SidebarNavItem>` aceita `icon?: ReactNode` (renderizado à esquerda do label) e `badge?: ReactNode` (renderizado à direita, oculto em `collapsed`). Quando `collapsed`, apenas o ícone aparece — o label vai para `sr-only` para preservar acessibilidade ao screen reader.
- **AC-8** — `<SidebarNavItem>` aceita `active?: boolean` (default `false`). Quando `true`, aplica classes do estado ativo (`bg-sidebar-accent text-sidebar-accent-foreground font-semibold`) e expõe `aria-current="page"` no elemento renderizado.
- **AC-9** — `<SidebarNavItem>` renderiza `<a href>` quando `href` é provido; caso contrário, renderiza `<button type="button">`. O elemento renderizado herda `onClick` quando provido. `disabled?: boolean` desabilita o `<button>` (atributo nativo) ou aplica `aria-disabled="true" tabIndex={-1}` + `pointer-events-none` em links.

### Composição — Section e Group

- **AC-10** — `<SidebarNavSection>` aceita `label?: ReactNode`. Quando provido e o container não está `collapsed`, renderiza um cabeçalho de seção (`<div role="presentation">` com label em uppercase tracking-wide). Quando `collapsed` + `label` presente, renderiza um divisor (`<hr>` semantically) no lugar do label.
- **AC-11** — `<SidebarNavGroup>` aceita `label`, `icon?`, `defaultOpen?: boolean = true` (descontrolado) **e** `open?: boolean` + `onOpenChange?: (open: boolean) => void` (controlado). A trigger interna (`<SidebarNavGroupTrigger>`) é um `<button>` com `aria-expanded={open}` e `aria-controls={contentId}`; o conteúdo (`<SidebarNavGroupContent>`) tem `id={contentId}` e é montado/desmontado conforme `open`. Em modo `collapsed`, o `<SidebarNavGroup>` renderiza apenas seus filhos inline (sem trigger, sem header) — paridade com a referência legada.

### Acessibilidade (WCAG 2.1 AA)

- **AC-12** — O container raiz é um `<nav>` com `aria-label` padrão "Navegação principal" (override via prop `aria-label`).
- **AC-13** — Navegação por teclado: `Tab` percorre itens e triggers de grupo na ordem visual; `Enter`/`Space` ativa `<button>` (item ou trigger); `Enter` ativa `<a>`. Foco visível via `focus-visible:ring-2 ring-ring ring-offset-1` em todos os interativos.
- **AC-14** — Em modo `collapsed`, cada item interativo expõe seu label completo para tecnologia assistiva — preferencialmente via `<Tooltip>` (componente do DS) wrappando o item com `content={label}`, OU via `sr-only` adjacente ao ícone. A escolha é registrada em ADR-019.

### Testing

- **AC-15** — `SidebarNav.test.tsx` contém **≥ 20 testes** com cobertura ≥ 80% do arquivo `index.tsx`. Cada `it(...)` carrega `AC-N:` no início do título.
- **AC-16** — Testes usam queries acessíveis (`getByRole`, `getByLabelText`, `getByText`) — `getByTestId` apenas como último recurso documentado (`lex-frontend-testing`).
- **AC-17** — Testes não mockam colaboradores internos (sem `vi.mock("./index")` parcial), apenas boundaries (timers se necessário para a transição de width). Não há mock necessário para o módulo em si.

### Acessibilidade automatizada (jest-axe)

- **AC-18** — `jest-axe` cobre `Default` (expandido, sem item ativo) em **light + dark** sem violações.
- **AC-19** — `jest-axe` cobre **estado ativo** (item com `active`) em light + dark sem violações.
- **AC-20** — `jest-axe` cobre **modo collapsed** (com tooltip ou sr-only) em light + dark sem violações.
- **AC-21** — `jest-axe` cobre **grupo aberto** (com sub-itens visíveis) em light + dark sem violações.
- **AC-22** — `jest-axe` cobre **item disabled** em light + dark sem violações.

### Storybook

- **AC-23** — `SidebarNav.stories.tsx` exporta no mínimo 6 stories: `Default`, `Collapsed`, `WithActiveItem`, `WithBadges`, `WithGroups`, `DenseRealistic` (replicando a fixture do playground legado). Todas renderizam corretamente em `light` e `dark` (a alternância é provida pelo Storybook decorator já existente no projeto).
- **AC-24** — Stories usam apenas a superfície pública do componente — nenhuma classe Tailwind cromática externa (zero `text-violet-*`/`bg-orange-*` em decorators de story, conforme aprendizado registrado em memória `feedback_story_no_external_destructive_helper`). Cores e estados são sempre derivadas das props (`active`, `disabled`).

### Docs (Astro)

- **AC-25** — `docs/src/pages/componentes/sidebar-nav.astro` existe com layout `ComponentPreview`, kicker `COMPONENTES · NAVIGATION`, lede descritiva, e seções: Padrão · Modo Collapsed · Estado Ativo · Badges · Grupos · Estrutura Realista · Props · Teclado · Código-fonte · Acessibilidade.
- **AC-26** — `docs/src/previews/sidebar-nav.tsx` exporta os componentes `BasicRow`, `CollapsedRow`, `ActiveItemRow`, `BadgesRow`, `GroupsRow`, `RealisticRow` consumidos pelo `.astro`.

### Catálogo

- **AC-27** — `SidebarNav` aparece no Set `MIGRATED` em `docs/src/pages/index.astro` (linha 678), produzindo o slug `sidebar-nav` e roteamento para `/componentes/sidebar-nav/`.

### ADR

- **AC-28** — `docs/adr/ADR-019-sidebar-nav-v0.1.0-dod-migration.md` existe com status `accepted`, deciders `@fernandoseguim` + `warrior-athena`, link para o Issue #82 e Plan #83, decisões cravadas: (a) sem Radix base, (b) composição por sub-componentes anexados, (c) controlled/uncontrolled Group, (d) Tooltip vs sr-only em collapsed, (e) coexistência com `Sidebar` shell.

### Gate 2 — checklist programático

- **AC-29** — `npm run typecheck` verde (0 erros TS).
- **AC-30** — `npm run lint` verde (0 erros ESLint).
- **AC-31** — `npm run test` verde (toda a suíte do projeto; SidebarNav inclusive).
- **AC-32** — `npm run build` verde (rslib build produz artefatos publicáveis).
- **AC-33** — `npm run docs:build` verde (Astro build do site de docs).

### Commit

- **AC-34** — Commit atômico único conforme `lex-small-commits` + `lex-conventional-commits`, com mensagem `feat(sidebar-nav): migrate to v0.1.0 DoD — <subject>` e body bilíngue `[en]` + `[pt-BR]`, fechando #82 e #83 (`Closes #82` + `Closes #83`).

## Out of Scope

Itens explícitos do Plan #83 fora do DoD do v0.1.0:

- Refatorações não relacionadas a SidebarNav.
- Adição ou alteração de tokens além do que a superfície pública precisa (todos os tokens semânticos já existem em `ui_kit/styles/index.css`).
- Aninhamento recursivo arbitrário (n níveis) — o DoD do v0.1.0 fixa 1 nível via `Group`.
- Estado de rota / router integration (next/router, react-router) — o consumidor passa `href` ou `onClick`; integração com router fica em wrappers downstream.
- Persistência de estado collapsed/aberto (cookie/localStorage) — o `Sidebar` composite shell já oferece isso para o chrome; `SidebarNav` é stateless externo.
- Migração ou deprecação do `Sidebar` shell já existente.

## Definition of Done (mapping)

| Item do Plan #83 | AC(s) |
|---|---|
| `ui_kit/components/sidebar-nav/index.tsx` com variantes CVA | AC-1, AC-3, AC-4, AC-5..AC-11 |
| Behavioral tests ≥ 20 ou ≥ 80% coverage | AC-15, AC-16, AC-17 |
| A11y jest-axe light + dark | AC-18..AC-22 |
| Storybook light + dark | AC-23, AC-24 |
| Página Astro + previews | AC-25, AC-26 |
| Export em `index.ts` | AC-2 |
| `MIGRATED` Set | AC-27 |
| Tokens semânticos apenas | AC-3, AC-4 |
| Brand vs Notion | AC-3, AC-4 (alinhamento explícito) |
| Lint/typecheck/test/build/docs:build verdes | AC-29..AC-33 |
| Commit atômico | AC-34 |
| Fecha Plan #83 via `Closes #83` | AC-34 |
