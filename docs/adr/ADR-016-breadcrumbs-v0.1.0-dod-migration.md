# ADR-016 — Migrate Breadcrumbs to v0.1.0 DoD (Navigation)

- **Status:** accepted
- **Date:** 2026-05-29
- **Deciders:** @fernandoseguim (CODEOWNER), `warrior-athena` (Issue-Driven flow orchestrator)
- **Precedents:** ADR-005 (Popover), ADR-006 (Menu), ADR-007 (Tooltip), ADR-010 (Dialog), ADR-011 (Alert), ADR-012 (Drawer — directory consolidation precedent), **ADR-014 (Toast) — structural anchor**
- **Issue:** [#76](https://github.com/guardiatechnology/design-system/issues/76)
- **Plan:** [#77](https://github.com/guardiatechnology/design-system/issues/77)

## Context

`Breadcrumbs` é a primitiva canônica de **navegação hierárquica** no catálogo `@guardia/design-system` v0.1.0 (categoria **Navigation**). O baseline atual em `ui_kit/components/breadcrumb/` (diretório no singular) traz uma wrapper shadcn-style com 7 primitivas declarativas (`Breadcrumb`, `BreadcrumbList`, `BreadcrumbItem`, `BreadcrumbLink`, `BreadcrumbPage`, `BreadcrumbSeparator`, `BreadcrumbEllipsis`) e uma única story `Default`. Cumpre o caso de uso básico mas falha o DoD do v0.1.0 em frentes objetivas:

1. **Diretório nomeado no singular** (`breadcrumb/`) divergindo do nome canônico no catálogo (`Breadcrumbs`, plural — visto em `docs/src/pages/index.astro` registry `g: "BR", label: "Breadcrumbs"`).
2. **API canônica divergente.** A referência em `ux_references/ui_kits/components/Breadcrumbs/` documenta uma API imperativa `<Breadcrumbs items={[...]} maxItems={N} />` com truncation automática. Os consumidores aprenderam essa API no playground legado; introduzir Breadcrumbs novo apenas no formato declarativo cria divergência cognitiva.
3. **DoD items não atendidos:** sem `Breadcrumbs.test.tsx` (zero behavioral + zero a11y jest-axe), sem página `breadcrumbs.astro`, sem previews, sem entrada no Set `MIGRATED`.
4. **Token contract não documentado.** O baseline usa `text-muted-foreground` e `hover:text-foreground` (tokens corretos), mas não há ADR que crave o contrato — qualquer migração futura para token de severidade poderia ser introduzida por engano.

O Plan #77 declara o escopo: migrar Breadcrumbs para v0.1.0 DoD usando o recipe estável de Navigation/Overlays consolidado nas últimas 6 migrações (Toast, Drawer, Dialog, ConfidenceIndicator, Alert, Tooltip).

Decisões arquiteturais que precisam ser cravadas em ADR (e não diluídas no commit):

- **Base primitive.** `@radix-ui/react-breadcrumb` não existe; decisão entre HTML semântico puro vs. forçar outra base.
- **Modelo de API.** Imperativo (`<Breadcrumbs items={[...]} />`) vs. declarativo (composição), e como coexistem.
- **Rename do diretório** `breadcrumb/` → `breadcrumbs/` no mesmo commit.
- **Algoritmo de truncation** (`maxItems`) — simples vs. dropdown-elision.
- **Mapeamento ARIA + token contract** documentados.

## Decision

Migrar Breadcrumbs ao v0.1.0 DoD seguindo o recipe **Toast (ADR-014)** adaptado para componente estático (sem portal / queue / focus management). **8 cláusulas:**

1. **Base primitive — HTML semântico puro (`<nav>` + `<ol>` + `<li>` + `<a>`) com `@radix-ui/react-slot` para `asChild`.** `@radix-ui/react-breadcrumb` não existe no monorepo Radix — e a primitiva é estática (sem comportamento dinâmico: nada de portal, focus trap, swipe, queue). Forçar uma base Radix exclusiva para Breadcrumbs adicionaria dependência sem benefício. `@radix-ui/react-slot` já está em deps; é usado para o pattern `asChild` em `<BreadcrumbLink>` (paridade com Toast / Dialog / Tooltip que também usam Slot para integrar com routers). Ícones via `lucide-react` (`ChevronRight`, `MoreHorizontal`) — já em deps.

2. **API imperativa canônica + primitivas declarativas coexistindo:**
   - **Imperativa (recomendada para casos simples):** `<Breadcrumbs items={[...]} maxItems={N} separator={...} className={...} />`. Aceita `items: { label, href?, onClick?, icon? }[]`. Renderiza a trilha completa; com `maxItems` aplica truncation; com `separator` substitui o default.
   - **Declarativa (poder):** `<Breadcrumb><BreadcrumbList><BreadcrumbItem>...</BreadcrumbItem>...</BreadcrumbList></Breadcrumb>` para composição customizada (mistura de items com diferentes shapes, dropdown no ellipsis via consumer, integration com routers via `asChild` no link).
   - Misturar ambos no mesmo subtree é suportado (cada subtree é independente).

3. **8 símbolos públicos** (mais 2 tipos): `Breadcrumbs` (API imperativa), `Breadcrumb`, `BreadcrumbList`, `BreadcrumbItem`, `BreadcrumbLink`, `BreadcrumbPage`, `BreadcrumbSeparator`, `BreadcrumbEllipsis`. Tipos: `BreadcrumbsProps`, `BreadcrumbsItem`.

4. **Token contract — tokens neutros apenas:** `text-muted-foreground` (links + separator), `text-foreground` (current page + link hover), `hover:bg-accent`/`hover:text-accent-foreground` (background hover opcional). **Sem expansão de token nova.** Breadcrumbs é neutro — não há severidade. ADR-011 (Alert tone family) não é consumida. Se um consumidor quiser "breadcrumb de erro" compõe manualmente com `<Alert>` + breadcrumb.

5. **Mapeamento ARIA explícito:**
   - `<Breadcrumb>` (e imperative root) → `<nav aria-label="breadcrumb">` (override via prop).
   - `<BreadcrumbList>` → `<ol>` (semântica de ordenação preservada).
   - `<BreadcrumbItem>` → `<li>`.
   - `<BreadcrumbLink>` → `<a>` ou Slot (via `asChild`).
   - `<BreadcrumbPage>` → `<span role="link" aria-current="page" aria-disabled="true">` (não é link de fato — é destino atual).
   - `<BreadcrumbSeparator>` → `<li role="presentation" aria-hidden="true">` (não é anunciado).
   - `<BreadcrumbEllipsis>` → `<span role="presentation" aria-hidden="true">` com `<span className="sr-only">More</span>` para anunciar overflow.
   - Casamento com `lex-frontend-accessibility` Rule 1.1 (semantic HTML) + WAI-ARIA APG breadcrumb pattern.

6. **Algoritmo de truncation simples (sem dropdown):** quando `items.length > maxItems`, renderiza `items[0] + <BreadcrumbEllipsis /> + items[items.length - (maxItems - 1) ...]`. Mantém o **primeiro** item (raiz) e os **últimos** `maxItems - 1` itens (mais próximos do contexto atual). `maxItems` conta os **slots visíveis de item** — a ellipsis não é contada (visual: root + … + tail). E.g. `maxItems=3` em `items.length=7` renderiza 3 itens + 1 ellipsis (item[0] + … + item[5] + item[6]). `<BreadcrumbEllipsis>` é puramente visual + screen-reader hint ("More"); **não abre dropdown automaticamente.** Quem precisar do pattern "ellipsis clicável que abre menu com elididos" compõe via consumer:
   ```tsx
   <BreadcrumbItem>
     <Popover>
       <PopoverTrigger><BreadcrumbEllipsis /></PopoverTrigger>
       <PopoverContent>{elidedItems.map(...)}</PopoverContent>
     </Popover>
   </BreadcrumbItem>
   ```
   Justificativa: dropdown automático cria coupling com `<Popover>` / `<Menu>` que aumenta o footprint do componente; quem precisar do pattern paga o custo (e tem mais flexibilidade sobre o conteúdo do dropdown).

7. **Directory rename `breadcrumb/` → `breadcrumbs/` no mesmo commit.** O barrel `ui_kit/components/index.ts` repointed atomicamente. Os nomes exportados (`Breadcrumb`, `BreadcrumbList`, etc.) **permanecem idênticos** — o consumer externo (Isac, app Guardia) que importa via `import { Breadcrumb } from "@guardia/design-system"` **não vê mudança**. Apenas quem importava por subpath interno (anti-pattern, não suportado) precisaria ajustar. Precedente: Drawer ADR-012 fez a mesma operação consolidando Sheet→Drawer.

8. **Zero baseline legacy para "coexistir".** Diferente do Toast (Sonner permaneceu), o `breadcrumb/` antigo **é removido** no mesmo commit. Razão: as 7 primitivas declarativas se mantêm 100% idênticas — não há gap de API que justifique manter dois exports paralelos. Reduzir surface = reduzir manutenção.

9. **A11y coverage (`axeInThemes`)** sobre 5 estados × 2 temas = **10 invocações jest-axe** explícitas em `Breadcrumbs.test.tsx`. Estados: Default short trail, Truncated trail, Declarative composition with Page, Custom separator, Click handler trail. Todos os tons em ambos os temas validados.

10. **ADR `accepted` desde o primeiro commit.** Commit atômico carrega código + ADR + docs juntos. Sem pattern `proposed → accepted` (Argos sinalizou 🟡 em PR #237 quando esse pattern foi seguido; corrigido a partir de ADR-014).

## Consequences

### Positive

- Breadcrumbs alcança paridade DoD com Toast / Drawer / Dialog / ConfidenceIndicator / Alert / Tooltip (mesmo recipe, mesmo rigor de teste, mesmo formato de ADR).
- API imperativa preserva a familiaridade do playground legacy (`items={[...]}` + `maxItems={N}`); primitivas declarativas dão poder de composição para casos avançados (integração router via `asChild`, dropdown elision via `<Popover>`).
- **Zero novas dependências.** O recipe usa apenas o que já está em `package.json` — economia direta vs. forçar uma base Radix exclusiva.
- **Zero breaking change na superfície exportada do pacote.** Consumidores externos (Isac, app Guardia) importam pelos mesmos nomes (`Breadcrumb`, `BreadcrumbList`, etc.) — apenas ganham o novo símbolo `Breadcrumbs` (API imperativa).
- Categoria **Navigation** avança 1 componente em direção aos 52 do v0.1.0.
- A decisão "tokens neutros apenas" deixa claro o contrato — qualquer migração futura para tons de severidade exigiria ADR superseder.

### Negative

- O diretório `breadcrumb/` (singular) é removido — qualquer consumer que tenha **importado por subpath interno** (`import { Breadcrumb } from "@guardia/design-system/components/breadcrumb"` — anti-pattern não documentado) precisa migrar para `/components/breadcrumbs`. Mitigação: o subpath interno **não é parte da superfície pública** documentada; o barrel `@guardia/design-system` permanece o ponto de entrada oficial. Comentário no `index.ts` registra a remoção (similar a ADR-012 Sheet).
- O ellipsis sem dropdown automático pode surpreender quem espera o pattern de "Material-UI breadcrumbs" (com dropdown). Mitigação: documentado na página Astro + ADR; pattern de composição via `<Popover>` documentado como receita.
- 2 APIs para o mesmo conceito (imperativa + declarativa) no catálogo. Documentação na página Astro (`breadcrumbs.astro`) explica quando usar qual.

### Neutral

- **Zero adições no `package.json` ou `package-lock.json`.** Diferente de Toast (que adicionou `@radix-ui/react-toast`), Breadcrumbs não introduz dep nova.
- 1 diretório renomeado (`breadcrumb/` → `breadcrumbs/`) + 1 nova página docs + 1 ADR + 2 arquivos de teste/stories novos. Total: ~9 arquivos novos/movidos + 2 modificados.

## Alternatives considered

1. **Continuar com `ui_kit/components/breadcrumb/` (singular) e apenas adicionar testes + página.** Rejeitado — divergência entre nome do diretório e nome canônico do catálogo é dívida visível que cresce com o tempo; agora é o momento certo de corrigir (precedente Drawer ADR-012). Custo da renomeação é baixo (1 commit, sem breaking).

2. **Forçar uma base Radix exclusiva (e.g., construir `@radix-ui/react-breadcrumb` fork local).** Rejeitado — Breadcrumbs é estático; portal/queue/focus management não se aplicam; HTML semântico puro já resolve. Adicionar wrapper Radix sintético seria custo sem benefício.

3. **API só declarativa (sem `<Breadcrumbs>` imperativa).** Rejeitado — quebra a familiaridade do playground legacy e força consumidores a reescrever a iteração `items.map(...)` manualmente. A API imperativa é o que torna Breadcrumbs plug-and-play em layouts.

4. **API só imperativa (sem primitivas declarativas).** Rejeitado — perde poder de composição (router integration via `asChild`, dropdown elision custom, item custom com avatar/badge). Manter ambas é o pattern já provado em Toast (ADR-014).

5. **Dropdown automático no `<BreadcrumbEllipsis>` (Material-UI pattern).** Rejeitado — cria coupling forçado com `<Popover>` / `<Menu>` no componente; aumenta o footprint sem ganho proporcional. Quem precisa do pattern compõe via consumer com flexibilidade total sobre o conteúdo.

6. **Manter `breadcrumb/` (singular) e criar `breadcrumbs/` (plural) coexistindo.** Rejeitado — duplicação de superfície idêntica é dívida pura; reduzir surface = reduzir manutenção. As primitivas declarativas vêm idênticas no novo path.

7. **Expandir token contract para incluir severidade (`breadcrumb-danger`, etc.).** Rejeitado — não há requisito real; quem precisar de "breadcrumb sinalizando erro" compõe com `<Alert>` adjacente ou estilo custom via `className`. Token expansion sem AC é YAGNI.

## Implementation note (acceptance criteria mapping)

| ADR clause | Plan AC |
|------------|---------|
| 1. HTML semântico + Radix Slot base | AC-1 (surface), AC-5..AC-8 (ARIA), AC-21 (build) |
| 2. Imperative + declarative coexistence | AC-9..AC-12 (imperative), AC-13 (declarative) |
| 3. 8-symbol surface + 2 types | AC-1 |
| 4. Token contract — tokens neutros | AC-3, AC-4 |
| 5. ARIA mapping | AC-5, AC-6, AC-7, AC-8 |
| 6. Truncation simples (sem dropdown) | AC-10 |
| 7. Directory rename + barrel repoint | AC-2 |
| 8. Zero legacy coexistence | AC-2 |
| 9. axeInThemes coverage ≥ 10 invocations | AC-16, AC-17 |
| 10. Accepted at first commit | AC-23 |
