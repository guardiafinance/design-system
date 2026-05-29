# Phase 1 — Brief: `feat(breadcrumbs): migrate Breadcrumbs to v0.1.0 DoD`

- **Issue:** [#76](https://github.com/guardiatechnology/design-system/issues/76)
- **Plan sub-issue:** [#77](https://github.com/guardiatechnology/design-system/issues/77)
- **Author:** @fernandoseguim
- **Type:** Tech Task (parent), Plan sub-issue
- **Labels:** `evolvability ♻️`
- **Category:** Navigation
- **Epic pai:** [#13 — Design System v0.1.0 — full component migration to new DoD](https://github.com/guardiatechnology/design-system/issues/13)
- **Branch:** `feat/76-breadcrumbs-v0.1.0-dod` · **Worktree:** `.claude/worktrees/agent-a03088d1ba50cca65/`
- **Read at:** 2026-05-29

## Resumo

Migrar `Breadcrumbs` ao DoD do v0.1.0 do `@guardia/design-system`, removendo o gap da categoria **Navigation** no catálogo de 52 componentes. O baseline atual é a wrapper shadcn-style em `ui_kit/components/breadcrumb/` — 7 primitivas declarativas (`Breadcrumb`, `BreadcrumbList`, `BreadcrumbItem`, `BreadcrumbLink`, `BreadcrumbPage`, `BreadcrumbSeparator`, `BreadcrumbEllipsis`) cobertas por uma única `Story.Default`, sem testes, sem página Astro, fora do Set `MIGRATED`, com diretório no singular `breadcrumb/` (catalogo usa `Breadcrumbs` no plural — divergência).

Os gaps mensuráveis vs. DoD:

- **Sem `Breadcrumbs.test.tsx`** (zero cobertura behavioral + zero jest-axe light/dark).
- **Sem página em `docs/src/pages/componentes/breadcrumbs.astro`** nem previews.
- **Não entra no Set `MIGRATED`** em `docs/src/pages/index.astro`.
- **API divergente da referência legada** (`ux_references/ui_kits/components/Breadcrumbs/`) — referência expõe API imperativa `<Breadcrumbs items={[...]} maxItems={N} />` com truncation (`…`) automática a partir de `maxItems`. Baseline atual exige composição declarativa manual sem helper imperativo.
- **Diretório com nome singular** (`breadcrumb/`) divergindo do nome canônico do catálogo (`Breadcrumbs`, plural) — Plan explicita rename para `breadcrumbs/`.
- **Cores hardcoded indiretas:** o baseline herda `text-muted-foreground` e `hover:text-foreground` — alinhados a tokens semânticos, mas falta documentação explícita do contrato de token no ADR.

A migração consolida `Breadcrumbs` como o canal canônico de **navegação hierárquica** no catálogo (Navigation), fechando o gap entre menus globais (`Navbar`/`Menu`) e indicadores de posição contextual.

## Contexto Notion

O Plan #77 e a Tech Task #76 ancoram em três fontes Notion canônicas (logo não se aplica a Breadcrumbs):

- [Branding (raiz)](https://www.notion.so/Branding-34536f91ebd280a69efacbadab3861c6)
- [Cores](https://www.notion.so/34536f91ebd28142a3f1e0e58fd62c4b) — paleta + hierarquia (já refletida em `lex-brand-colors`)
- [Tipografia](https://www.notion.so/34536f91ebd281b9b76ccc6159bfae69) — Poppins → Roboto (`lex-brand-typography`)
- [Voz](https://www.notion.so/34536f91ebd2817f8cc5ca29e657c828) — irrelevante para microcopy interna do DS

A diretriz é **Notion prevalece** em caso de divergência. Para Breadcrumbs o espelho local já está alinhado a Notion após Alert #255 / ADR-011; não é esperada divergência de tokens.

## Precedentes consultados

| Precedente | ADR | Resultado |
|---|---|---|
| **Toast #259 — feedback transiente Overlays** | [ADR-014](../../adr/ADR-014-toast-v0.1.0-dod-migration.md) | Recipe Radix wrapper + API imperativa coexistindo com primitivas declarativas + axeInThemes light/dark + ADR `accepted` desde o primeiro commit. **Padrão estrutural mais recente para esta migração.** |
| Drawer #258 | ADR-012 | Consolidação de diretório (Sheet→Drawer); precedente para o rename `breadcrumb/` → `breadcrumbs/`. |
| Dialog #257 | ADR-010 | Radix wrapper transiente. |
| ConfidenceIndicator #256 | ADR-013 | Componente sem Radix, recipe inline. |
| Alert #255 | ADR-011 | Família de tokens de tom expandida — Breadcrumbs **não consome** essa família (sem severidade), usa apenas tokens neutros (`--muted-foreground`, `--foreground`, `--accent`). |

## Sinais e unknowns

1. **Sem Radix base.** `@radix-ui/react-toast`, `@radix-ui/react-dialog`, etc. existem; **`@radix-ui/react-breadcrumb` não existe**. Breadcrumbs é primitiva semântica `<nav><ol><li>` — não há comportamento dinâmico (portal, focus trap, swipe) que justifique Radix. O baseline atual já usa `@radix-ui/react-slot` para `asChild` em `BreadcrumbLink` (segue), `lucide-react` para `ChevronRight`/`MoreHorizontal` (segue). **Zero deps novas.**
2. **API canônica da referência legada** (`<Breadcrumbs items={[...]} maxItems={N} separator={...} />`): API imperativa com truncation `…` automática a partir de `maxItems`. Decisão arquitetural a registrar em ADR-016: **manter API imperativa `<Breadcrumbs>` + expor primitivas declarativas** (`Breadcrumb`, `BreadcrumbList`, `BreadcrumbItem`, `BreadcrumbLink`, `BreadcrumbPage`, `BreadcrumbSeparator`, `BreadcrumbEllipsis`) para composição customizada. Mesma estratégia que Toast (ADR-014).
3. **Diretório `breadcrumb/` → `breadcrumbs/`.** Plan #77 declara o rename como parte do escopo. O barrel `ui_kit/components/index.ts` aponta `export * from "./breadcrumb"` — vira `export * from "./breadcrumbs"` no mesmo commit. ADR-016 cláusula "Directory rename" registra como decisão (precedente: Drawer ADR-012 consolidou Sheet→Drawer com rename equivalente).
4. **Truncation com `BreadcrumbEllipsis`.** A referência legada faz truncation simples (mantém primeiro item + `…` + últimos `maxItems-2`). A API imperativa nova faz o mesmo, usando `BreadcrumbEllipsis` (já existe no baseline) como o slot do `…`. Sem dropdown — quem quiser o pattern "ellipsis abre menu com itens elididos" compõe manualmente com `Popover`/`Menu`. Decisão a registrar.
5. **Navegação ARIA.** `<nav aria-label="breadcrumb">` + `<ol>` + último item com `aria-current="page"` é o pattern WAI-ARIA APG. O baseline já segue isso. Reforçamos com testes behavioral (`getByRole('navigation', { name: /breadcrumb/i })`).
6. **Separator default.** Referência legada usa `chevron-right` (ícone Lucide quando `Icon` global existe; caractere `/` quando não). Baseline usa `ChevronRight` direto do `lucide-react`. ADR-016 cravam separator default = `ChevronRight` ícone, com prop `separator?: ReactNode` para override (paridade com a referência via prop).
7. **Tokens semânticos.** `--muted-foreground` (itens não-atuais), `--foreground` (item atual + hover link), `--accent` (hover background opcional). Sem tokens de severidade. Sem hex literals.
8. **Sonner-like coexistência** — não há equivalente; o baseline antigo `breadcrumb/` é **substituído** pelo novo `breadcrumbs/`. ADR-016 cláusula "Migration of imports" declara que o barrel re-aponta no mesmo commit; consumidores externos do design-system (Isac, app Guardia) vão receber as primitivas pelo mesmo `@guardia/design-system` namespace — assinaturas das primitivas declarativas permanecem **idênticas** (mesmos nomes, mesmas props), apenas o subpath interno muda. **Zero breaking change na API pública.**

## Próximos passos

Phase 2 — `02-requirements.md` numera os ACs.
Phase 3 — `03-architecture.md` + `docs/adr/ADR-016-breadcrumbs-v0.1.0-dod-migration.md` registra a decisão (sem Radix + API imperativa coexistindo com primitivas + diretório rename + truncation simples sem dropdown).
Gate 1 — auto-aprovação se o escopo casar com o DoD do Plan #77.
Phase 4 — implementação direta (Athena driving — recipe Frontend é estável após 6 migrações consecutivas).
Phase 5/6 — security review + quality gate.
Phase 7 — PR único com `Closes #76` + `Closes #77`.
