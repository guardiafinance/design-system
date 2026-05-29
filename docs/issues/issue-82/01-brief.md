# Phase 1 — Brief: `feat(sidebar-nav): migrate SidebarNav to v0.1.0 DoD`

- **Issue:** [#82](https://github.com/guardiatechnology/design-system/issues/82)
- **Plan sub-issue:** [#83](https://github.com/guardiatechnology/design-system/issues/83)
- **Author:** @fernandoseguim
- **Type:** Tech Task (parent), Plan sub-issue
- **Labels:** `evolvability ♻️`
- **Category:** Navigation
- **Epic pai:** [#13 — Design System v0.1.0 — full component migration to new DoD](https://github.com/guardiatechnology/design-system/issues/13)
- **Branch:** `feat/82-sidebar-nav-v0.1.0-dod` · **Worktree:** `.claude/worktrees/agent-ab6b916ee6be30c4d/`
- **Read at:** 2026-05-29

## Resumo

Migrar `SidebarNav` ao DoD do v0.1.0 do `@guardia/design-system`, fechando um gap da categoria **Navigation** no catálogo de 52 componentes. SidebarNav é a primitiva de **navegação lateral vertical** baseada em seções e itens — distinta da composta `Sidebar` shell (shadcn-style com cookie de estado, `SidebarProvider`, `<DrawerContent>` para mobile) já migrada e da `Navbar` horizontal. Hoje SidebarNav existe apenas como referência legada em `ux_references/ui_kits/components/SidebarNav/` (JSX puro acoplado a `window.Icon`, classes `.grd-sb-*` ad-hoc) e está abaixo do DoD: sem código no `ui_kit/`, sem testes, sem stories, sem página Astro, sem entrada no Set `MIGRATED`.

A migração cria `SidebarNav` como primitiva canônica focada — para navegação primária com seções + grupos colapsáveis + indicador ativo + modo `collapsed` (só ícones) — coexistindo com o `Sidebar` shell (que oferece chrome de aplicação completo: trigger mobile, persistência, layout do shell). Os dois componentes resolvem problemas distintos: `SidebarNav` é a árvore de navegação consumida dentro de qualquer chrome; `Sidebar` é o chrome em si.

## Contexto Notion

O Plan #83 e a Tech Task #82 ancoram em quatro fontes Notion canônicas:

- [Branding (raiz)](https://www.notion.so/Branding-34536f91ebd280a69efacbadab3861c6)
- [Cores](https://www.notion.so/34536f91ebd28142a3f1e0e58fd62c4b) — paleta + hierarquia CTA (já refletida em `lex-brand-colors` § "CTA hierarchy by theme")
- [Tipografia](https://www.notion.so/34536f91ebd281b9b76ccc6159bfae69) — Poppins → Roboto fallback (`lex-brand-typography`)
- [Logomarca](https://www.notion.so/34536f91ebd2816f891ce73a5d47a789) — não aplicável a SidebarNav (componente sem logo embutido — o logo vive no chrome `Sidebar` ou em qualquer wrapper consumer)

A diretriz é **Notion prevalece** em caso de divergência com o espelho local (`lex-brand-*` / `codex-brand-*`). Para SidebarNav, o espelho local já está alinhado a Notion após o ciclo de tokens fechado em ADR-011 (Alert) — não é esperada divergência.

## Precedentes consultados

| Precedente | ADR | Resultado |
|---|---|---|
| **Toast #259** | [ADR-014](../../adr/ADR-014-toast-v0.1.0-dod-migration.md) | Recipe completo de migração v0.1.0 DoD com Provider + hook + variantes CVA + a11y light/dark — referência canônica mais recente |
| **Drawer #258 + consolidação com Sheet** | [ADR-012](../../adr/ADR-012-drawer-v0.1.0-dod-migration.md) | Side variants via CVA, coexistência com componente legado, ADR `accepted` desde o primeiro commit |
| **Dialog #257** | [ADR-010](../../adr/ADR-010-dialog-v0.1.0-dod-migration.md) | Recipe base Radix wrapper, primitivas re-exportadas |
| **ConfidenceIndicator #256** | [ADR-013](../../adr/ADR-013-confidence-indicator-v0.1.0-dod-migration.md) | Componente sem Radix base, composição interna por sub-componentes — precedente próximo (SidebarNav também não tem Radix nativo) |
| **Alert #255** | [ADR-011](../../adr/ADR-011-alert-v0.1.0-dod-migration.md) | Token chain `--*-soft`, expansão prévia que SidebarNav **não** consome (sem matriz de tons) |
| **Existing `Sidebar` shell (shadcn)** | n/a | Composite shell `<SidebarProvider>`/`<SidebarTrigger>`/`<SidebarRail>` + cookie de estado + Drawer mobile. SidebarNav é primitiva distinta — não substitui. |

## Referência legada

Snapshot em `ux_references/ui_kits/components/SidebarNav/`:

- **Playground:** `SidebarNav.playground.html` — demonstra modo expandido + collapsed, seções (`Section`), grupos colapsáveis (`Group`), itens com ícone, badge, ativo, `onClick`/`href`.
- **Source:** `index.tsx` — JSX puro com `React.createContext` para `collapsed`, sub-componentes `SBSection`, `SBItem`, `SBGroup` anexados via `(SidebarNav as any).Section = ...`. Item é `<button>` ou `<a>` conforme `href`. Group tem `defaultOpen` + chevron rotacionado via CSS.
- **Styles:** `index.css` — `.grd-sb` (container 240px, gap, padding, border-right), `.grd-sb-col` (60px collapsed), `.grd-sb-item` (hover violet-50, active violet-100), `.grd-sb-item-badge` (violet-200 bg + violet-700 fg, pill), `.grd-sb-group-chev` (rotate 180° on open). **Cores hardcoded como variáveis CSS legacy `var(--violet-*)`, `var(--border)`, `var(--fg-muted)`** — incompatíveis com o token chain do v0.1.0 que usa `--sidebar-*`, `--muted-foreground`, `--ring` (HSL semantics em `ui_kit/styles/index.css`).

A API/visual da referência **DEVE** ser espelhada (variants, props, comportamento). Divergências exigem justificativa explícita em Phase 3.

## Estado atual no `ui_kit/`

- `ui_kit/components/sidebar-nav/` — **inexistente**.
- `ui_kit/components/sidebar/` — composite shell shadcn-derived (`SidebarProvider`, `SidebarTrigger`, `SidebarRail`, cookie state). Coexiste, não substitui.
- `ui_kit/components/navbar/` — navegação horizontal, escopo distinto.
- Set `MIGRATED` em `docs/src/pages/index.astro` linha 678: **não contém `SidebarNav`**. Adicionar resolve o roteamento de `/componentes/sidebar-nav/`.
- Sidebar do shell de docs em `index.astro` linha 641 já registra o entry `{ g: "SB", label: "SidebarNav", ... }` — aponta para `__pending__` enquanto não migrado.

## Pendências objetivas mapeadas

1. Criar `ui_kit/components/sidebar-nav/index.tsx` com primitivas tokenizadas (Root + Section + Item + Group), CVA para `collapsed`/`active`, sem Radix base (Radix não tem `Sidebar` nativo — `NavigationMenu` é orientado a top-bar/menubar, não a nav vertical com grupos colapsáveis).
2. `SidebarNav.test.tsx` ≥ 20 testes ou ≥ 80% coverage, behavioral + jest-axe light+dark em pelo menos Default, item ativo, hover (`group:hover`), grupo aberto/fechado, `collapsed`, `disabled` (se aplicável).
3. `SidebarNav.stories.tsx` cobrindo Default + Collapsed + ComItensAtivos + ComBadge + ComGrupos + DenseStructure em light + dark.
4. `docs/src/pages/componentes/sidebar-nav.astro` + `docs/src/previews/sidebar-nav.tsx` (paridade visual com `SidebarNav.playground.html`).
5. Export em `ui_kit/components/index.ts`.
6. `SidebarNav` adicionado ao Set `MIGRATED` em `docs/src/pages/index.astro` linha 678.
7. ADR-019 (slot já reservado) — `docs/adr/ADR-019-sidebar-nav-v0.1.0-dod-migration.md`.

## Unknowns

Pré-investigados, sem ambiguidade real para Plan #83 — todas as decisões DoD foram cravadas pelos 5 precedentes recentes. Os pontos abaixo são decisões explícitas a serem documentadas na Arquitetura (Phase 3), não ambiguidades pendentes:

- **Aninhamento.** Legada suporta 1 nível via `Group` (não recursivo). Mantemos. Recursividade arbitrária está fora do DoD do v0.1.0.
- **Modo collapsed × Group.** Legada renderiza filhos do Group inline (sem header) quando `collapsed`. Mantemos esse comportamento + adicionamos `aria-expanded` na trigger.
- **Item como link vs botão.** Decidido por presença de `href` (paridade total com legada). Mantemos.
- **Tooltip em modo collapsed.** Legada usa `title=` no item quando `collapsed`. Upgrade para `<Tooltip>` (já no DS) — decisão registrada em ADR-019.
- **Ícone.** Legada chama `(window as any).Icon`. Migração usa `ReactNode` na prop `icon` — consumer passa o ícone (Lucide é a stack canônica do projeto), o componente apenas posiciona. Sem dependência de globais.
- **Estado controlado vs descontrolado em Group.** Legada usa estado interno (`useState(defaultOpen)`). Adicionamos pattern controlled: `open`/`onOpenChange` opcionais + `defaultOpen` (paridade com `<Collapsible>` e `<Drawer>` do DS).
