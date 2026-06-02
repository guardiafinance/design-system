# Phase 2 — Requirements: `feat(breadcrumbs): migrate Breadcrumbs to v0.1.0 DoD`

- **Issue:** [#76](https://github.com/guardiatechnology/design-system/issues/76)
- **Plan sub-issue:** [#77](https://github.com/guardiatechnology/design-system/issues/77)
- **DoD reference:** v0.1.0 DoD do Plan #77 + ADR-014 (Toast) como precedente estrutural.

## Acceptance Criteria

Cada AC abaixo é endereçado por pelo menos 1 teste em `Breadcrumbs.test.tsx` (bidirectional traceability per `lex-issue-driven` Rule 3). Cada teste carrega `AC-N:` no `it(...)` text.

### Superfície pública

- **AC-1**: `ui_kit/components/breadcrumbs/index.tsx` exporta a superfície canônica de **8 símbolos públicos**: `Breadcrumbs` (API imperativa), `Breadcrumb`, `BreadcrumbList`, `BreadcrumbItem`, `BreadcrumbLink`, `BreadcrumbPage`, `BreadcrumbSeparator`, `BreadcrumbEllipsis`. Exporta também os tipos `BreadcrumbsProps`, `BreadcrumbsItem`.

- **AC-2**: O diretório anterior `ui_kit/components/breadcrumb/` é **removido**; o barrel `ui_kit/components/index.ts` passa a apontar `export * from "./breadcrumbs"` no mesmo commit. A API pública (nomes de símbolos exportados) permanece **idêntica** para as primitivas declarativas — apenas o subpath interno muda. **Zero breaking change na superfície exportada do pacote.**

### Tokens semânticos

- **AC-3**: O componente consome **exclusivamente** tokens semânticos do design system. Sem hex literals (`#...`), sem `oklch(...)` literal, sem classes Tailwind de paleta crua (`text-red-500`, `bg-yellow-100`). Tokens consumidos: `text-muted-foreground` (itens não-atuais), `text-foreground` (item atual + hover link), `hover:bg-accent`/`hover:text-accent-foreground` (estado hover opcional).

- **AC-4**: A folha de estilos não introduz nenhuma classe nova que faça referência a cores cruas — testes asseguram que as classes geradas pelos componentes não casam regex `/#[0-9a-fA-F]{3,8}/`, `/oklch\(/`, `/text-red-\d+/`, `/bg-yellow-\d+/`.

### ARIA + acessibilidade

- **AC-5**: `<Breadcrumb>` (e a API imperativa `<Breadcrumbs>`) renderiza `<nav aria-label="breadcrumb">` como container. Asserção: `getByRole('navigation', { name: /breadcrumb/i })` localiza o elemento.

- **AC-6**: O último item da trilha renderiza com `aria-current="page"` (via `<BreadcrumbPage>` declarativo OU automaticamente no último item da API imperativa). Asserção: `getByRole('link', { current: 'page' })` ou equivalente via `aria-current`.

- **AC-7**: `<BreadcrumbSeparator>` carrega `role="presentation"` e `aria-hidden="true"` — separator não é anunciado por screen readers. Mesmo tratamento para `<BreadcrumbEllipsis>` (com `<span className="sr-only">More</span>` para anunciar o overflow).

- **AC-8**: O `<BreadcrumbLink>` renderiza como `<a>` nativo por default; com `asChild`, atua como Slot (Radix Slot) para integração com routers (`<Link>` do Next/React Router) — paridade total com baseline.

### API imperativa `<Breadcrumbs>`

- **AC-9**: `<Breadcrumbs items={[{label, href}, ...]} />` renderiza a trilha completa: cada item de `items` gera um `<BreadcrumbItem>` com `<BreadcrumbLink href={...}>{label}</BreadcrumbLink>` para itens intermediários, e `<BreadcrumbPage>{label}</BreadcrumbPage>` para o último (sem link). Separator é inserido automaticamente entre items.

- **AC-10**: `<Breadcrumbs items={[...]} maxItems={N} />` aplica **truncation simples** quando `items.length > maxItems`: mantém o **primeiro** item, insere `<BreadcrumbEllipsis />`, e mantém os últimos `maxItems - 1` itens (`maxItems` conta slots visíveis de item; a ellipsis não é contada). Asserção: `items.length === 7, maxItems === 3` → renderiza item[0] + ellipsis + item[5] + item[6] (3 itens visíveis + 1 ellipsis).

- **AC-11**: `<Breadcrumbs items={[...]} separator={<custom />} />` substitui o separator default (`<ChevronRight />`) pelo node passado. Cada separator renderizado é o `separator` cru, envolvido em `<BreadcrumbSeparator>` que aplica os atributos ARIA.

- **AC-12**: `<Breadcrumbs items={[{label, onClick}, ...]} />` aceita `onClick` por item. Click no item dispara o handler. Quando `onClick` está presente e `href` ausente, o item ainda renderiza como `<a>` (per HTML conformance — link com handler) com `href="#"` e `preventDefault()` aplicado no handler interno.

### Composição declarativa

- **AC-13**: A composição declarativa documentada na story `Declarative` funciona end-to-end: `<Breadcrumb><BreadcrumbList><BreadcrumbItem><BreadcrumbLink href="...">...</BreadcrumbLink></BreadcrumbItem>...<BreadcrumbItem><BreadcrumbPage>...</BreadcrumbPage></BreadcrumbItem></BreadcrumbList></Breadcrumb>` renderiza sem warnings de console e produz a mesma estrutura DOM da API imperativa equivalente.

- **AC-14**: O ícone Lucide `<ChevronRight />` em `<BreadcrumbSeparator>` herda `currentColor` (sem `text-*` hardcoded no SVG); cor visual segue o token `text-muted-foreground` aplicado pelo wrapper.

### Storybook contract

- **AC-15**: `Breadcrumbs.stories.tsx` declara as stories: `Default`, `WithIcon`, `Truncated`, `CustomSeparator`, `WithClickHandler`, `DeclarativeComposition`, `LongTrail`. Cada story aceita render em **light** e **dark** via o controle global `data-theme` do Storybook (sem fork de stories por tema).

### A11y (jest-axe light + dark)

- **AC-16**: `Breadcrumbs.test.tsx` invoca `axeInThemes(container)` no mínimo **5 vezes** cobrindo: (1) trilha curta default, (2) trilha truncada com `maxItems`, (3) composição declarativa com `<BreadcrumbPage>`, (4) trilha com separator customizado, (5) trilha com click handler. Cada invocação roda em `light` e `dark` (2 temas), totalizando **10 asserts axe-core**.

- **AC-17**: Nenhuma das 10 invocações reporta violação WCAG 2.1 AA. Falha em qualquer tema = falha do teste — sem `try/catch` para "engolir" temas problemáticos.

### Docs site

- **AC-18**: `docs/src/pages/componentes/breadcrumbs.astro` é criada cobrindo: lede, seção Padrão, seção Com ícone, seção Truncação, seção Separator customizado, seção Composição declarativa, tabela de Props, seção Teclado, seção Source code (highlight via `HighlightedCode`), seção Acessibilidade.

- **AC-19**: `docs/src/previews/breadcrumbs.tsx` exporta as `*Row` consumidas pelo `.astro`: `BasicRow`, `WithIconRow`, `TruncatedRow`, `CustomSeparatorRow`, `DeclarativeRow`. Cada uma renderizada em isolamento sem provider externo.

### Set MIGRATED

- **AC-20**: O Set `MIGRATED` em `docs/src/pages/index.astro` ganha a entrada `"Breadcrumbs"`. O slug interno do registry (`g: "BR", label: "Breadcrumbs"`) já existe; apenas a inclusão no Set é o gate para o sidebar passar a apontar para `/componentes/breadcrumbs`.

### Build & CI

- **AC-21**: `npm run typecheck`, `npm run lint`, `npm run test`, `npm run build`, `npm run docs:build` retornam 0. Sem warnings novos vs. baseline pré-migração.

### Cobertura de testes

- **AC-22**: `Breadcrumbs.test.tsx` declara **≥ 20 testes** OU atinge **≥ 80% de cobertura** no arquivo `ui_kit/components/breadcrumbs/index.tsx` (gating per Plan #77 DoD). Cada `it(...)` carrega um marker `AC-N:` no texto.

### ADR

- **AC-23**: `docs/adr/ADR-016-breadcrumbs-v0.1.0-dod-migration.md` é criada em status `accepted` desde o primeiro commit (precedente do PR #237 / ADR-014). Contém: Context, Decision (8 cláusulas — base primitive, API mode, surface, tokens, ARIA, truncation, directory rename, sonner-equivalent coexistence), Consequences (positive, negative, neutral), Alternatives considered (5+ rejected), Implementation note (mapping ADR clause → AC).

### PR

- **AC-24**: O PR fecha **simultaneamente** parent + Plan: o body contém `Closes #76` e `Closes #77` em linhas separadas (per regra do squad — parent sem Closes fica órfão aberto). Labels do parent são mirrored. `size/*` label aplicado.

- **AC-25**: O PR carrega **exatamente um commit atômico** com mensagem `feat(breadcrumbs): migrate Breadcrumbs to v0.1.0 DoD`, body em inglês explicando o "why" (consolida Navigation), bullets do "what" (arquivos), referências ao ADR + Plan + Issue.

## Out of scope (deferred)

- Dropdown nativo no `BreadcrumbEllipsis` (abrir menu com os itens elididos). Quem precisa compõe com `<Popover>` / `<Menu>` no consumer.
- Migração de consumidores externos (Isac, app Guardia). A superfície exportada permanece idêntica — consumidores não veem mudança.
- Animations (slide / fade entre items). Breadcrumbs é static; sem motion.
- I18n da `aria-label="breadcrumb"`. Fica como token de string fixo; quem precisar de outro idioma override via prop `aria-label`.
- Remoção do diretório `ui_kit/components/sonner/`, `ui_kit/components/sheet/` (não relacionado). Esta migração só toca `breadcrumb/` → `breadcrumbs/`.

## DoR check

- [x] Brief existe (`01-brief.md`)
- [x] ACs numerados (AC-1..AC-25) com bidirectional traceability
- [x] Precedente estrutural identificado (ADR-014 Toast)
- [x] ADR slot pré-alocado: ADR-016
- [x] Branch + worktree confirmados
- [x] Plan sub-issue #77 ativo, assignee correto

## Gate 1 — auto-aprovação

Escopo da Phase 3 (arquitetura) deve mapear 1:1 ao DoD do Plan #77: implementação + testes (≥20 ou ≥80% cov) + a11y jest-axe light+dark + Storybook stories + página Astro + previews + barrel + Set MIGRATED + ADR-016 accepted + PR fechando parent+Plan. **Sem expansão de escopo.** Sem cor crua, sem dropdown elision, sem refactor de outros componentes.

Se Phase 3 produzir architecture compatível com este envelope, Gate 1 auto-aprova per defaults do squad (`feedback_design_system_auto_proceed_gates`).
