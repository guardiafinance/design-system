# Phase 3 — Architecture: `feat(sidebar-nav): migrate SidebarNav to v0.1.0 DoD`

- **Issue:** [#82](https://github.com/guardiatechnology/design-system/issues/82)
- **Plan sub-issue:** [#83](https://github.com/guardiatechnology/design-system/issues/83)
- **Brief:** [`01-brief.md`](./01-brief.md) · **Requirements:** [`02-requirements.md`](./02-requirements.md)
- **ADR slot:** [ADR-019](../../adr/ADR-019-sidebar-nav-v0.1.0-dod-migration.md) (pre-allocated)
- **Status:** complete

## Affected components (scope table)

| Path | Change | Why |
|---|---|---|
| `ui_kit/components/sidebar-nav/index.tsx` | **CREATE** | Primitiva canônica `<SidebarNav>` + sub-componentes |
| `ui_kit/components/sidebar-nav/SidebarNav.stories.tsx` | **CREATE** | Stories Default + Collapsed + variantes (AC-23, AC-24) |
| `ui_kit/components/sidebar-nav/SidebarNav.test.tsx` | **CREATE** | ≥20 testes behavioral + jest-axe light/dark (AC-15..AC-22) |
| `ui_kit/components/index.ts` | **MODIFY** | Append `export * from "./sidebar-nav";` (AC-2) |
| `docs/src/pages/componentes/sidebar-nav.astro` | **CREATE** | Página do site de docs (AC-25) |
| `docs/src/previews/sidebar-nav.tsx` | **CREATE** | Previews consumidos pela página Astro (AC-26) |
| `docs/src/pages/index.astro` | **MODIFY** | Adicionar `"SidebarNav"` ao Set `MIGRATED` linha 678 (AC-27) |
| `docs/adr/ADR-019-sidebar-nav-v0.1.0-dod-migration.md` | **CREATE** | Decisões cravadas (AC-28) |
| `docs/issues/issue-82/01-brief.md` | **CREATE** | Phase 1 artifact |
| `docs/issues/issue-82/02-requirements.md` | **CREATE** | Phase 2 artifact |
| `docs/issues/issue-82/03-architecture.md` | **CREATE** | Phase 3 artifact (este arquivo) |
| `docs/issues/issue-82/05-security-review.md` | **CREATE** | Phase 5 artifact |
| `docs/issues/issue-82/06-quality-report.md` | **CREATE** | Phase 6 artifact |

**Não alteramos:** `ui_kit/components/sidebar/` (composite shell), `ui_kit/components/navbar/`, `ui_kit/styles/index.css` (todos tokens necessários já existem), `package.json` (zero novas dependências).

## Decisão 1 — Sem Radix base

**Opções:**
- (a) `@radix-ui/react-navigation-menu` — orientado a top-bar com flyout, semântica fortemente acoplada a menu horizontal; não casa com nav lateral persistente + grupos colapsáveis com chevron.
- (b) `@radix-ui/react-accordion` para os Groups — força semântica accordion (1+ painel expandido por seção) e introduz dependência semântica errada (sidebar não é acordeão de seções fechadas; é nav com seções sempre visíveis + grupos opcionalmente colapsáveis dentro).
- (c) `@radix-ui/react-collapsible` para cada Group — leve, exatamente o contrato disjuntivo "abre/fecha um conteúdo". Já é dependência do projeto (`Collapsible` migrado).
- (d) Sem Radix — implementação manual de `aria-expanded`/`aria-controls`.

**Escolha:** (d) **sem Radix base, mas com aria-expanded/aria-controls manuais**. Racionais:

1. SidebarNav é uma estrutura semântica simples (`<nav>` + lista de itens + grupos com botão+conteúdo). O ganho de `Collapsible` Radix é marginal (~ 30 linhas que substituiríamos por `<button aria-expanded><div hidden></div></button>`); o custo é introduzir dependência semântica de outro componente DS dentro de um primitivo nav.
2. ConfidenceIndicator (#256, ADR-013) é precedente recente: composição interna sem Radix, sub-componentes anexados via re-export. SidebarNav segue o mesmo padrão.
3. A trigger e o conteúdo do Group ficam **expostos como sub-componentes** (`SidebarNavGroupTrigger` + `SidebarNavGroupContent`) para que consumers possam compor variantes — paridade com a primitiva exposta de Dialog/Drawer.

Decisão registrada em ADR-019 § "Base primitive".

## Decisão 2 — Composição por sub-componentes (não dot-notation)

A legada usa `(SidebarNav as any).Section = ...` (dot-notation com `any` cast — `lex-frontend-typing` proíbe `any` injustificado). O padrão DS atual (Toast, Dialog, Drawer) é **export de named sub-componentes**:

```tsx
import {
  SidebarNav,
  SidebarNavSection,
  SidebarNavItem,
  SidebarNavGroup,
  SidebarNavGroupTrigger,
  SidebarNavGroupContent,
} from "@guardia/design-system";
```

**Trade-off:** consumer escreve mais imports, mas tree-shaking + tipagem ficam corretos sem `any`. Decisão registrada em ADR-019 § "API shape — named exports vs dot-notation".

## Decisão 3 — Group controlled + uncontrolled

A legada é exclusivamente uncontrolled (`useState(defaultOpen)`). O padrão DS (Collapsible, Drawer, Tooltip) suporta os dois modos:

```tsx
// Uncontrolled (legada compat)
<SidebarNavGroup defaultOpen>...</SidebarNavGroup>

// Controlled (novo)
<SidebarNavGroup open={isOpen} onOpenChange={setIsOpen}>...</SidebarNavGroup>
```

Implementação: hook interno detecta presença de `open` (controlled) ou usa `useState(defaultOpen ?? true)` (uncontrolled). Mesma assinatura de `Collapsible`. Decisão registrada em ADR-019 § "Group state model".

## Decisão 4 — Modo collapsed: Tooltip vs sr-only

A legada usa `title="..."` (tooltip nativo do browser, A11y limitada). Upgrade decidido:

- **Quando `collapsed=true`:** o item interativo é **wrappeado** em `<Tooltip>` do DS (`@/components/tooltip`) com `content` igual ao label textual quando `children` é string. O label original também vai para `<span className="sr-only">` para garantir leitura por screen reader **antes** de o tooltip ser invocado por hover/focus (defesa em profundidade).
- **Quando `children` não é string** (e.g., ReactNode complexo), o consumer **deve** passar prop `label?: string` para o tooltip; sem `label`, em modo collapsed o componente lança warning em dev e cai apenas no `sr-only` com `children` serializado via `aria-label`.

Decisão registrada em ADR-019 § "Collapsed label disclosure".

## Decisão 5 — Coexistência com `Sidebar` shell

Já existe `ui_kit/components/sidebar/` (shadcn pattern: `SidebarProvider`, `SidebarTrigger`, `SidebarRail`, cookie de estado, composição com Drawer mobile). SidebarNav **não substitui**, **não modifica**, **não importa** Sidebar shell.

**Cenários de uso documentados na página Astro:**

| Cenário | Use |
|---|---|
| Quero o chrome inteiro (app shell com header, trigger, persistência) | `<SidebarProvider> + <Sidebar>` (shell existente) |
| Quero apenas a árvore de navegação (sem chrome) | `<SidebarNav>` (este componente) |
| Quero o chrome shell **com** árvore tokenizada dentro | `<Sidebar><SidebarContent><SidebarNav>...</SidebarNav></SidebarContent></Sidebar>` |

Decisão registrada em ADR-019 § "Coexistence with Sidebar shell".

## Tokenização — mapeamento

| Elemento | Token semântico | Light HSL | Dark HSL |
|---|---|---|---|
| Container `bg` | `bg-sidebar` | `0 0% 99%` (FDFDFD) | mapeado via `data-theme=dark` em `index.css` |
| Container `text` | `text-sidebar-foreground` | `240 5% 26%` | idem |
| Container `border-right` | `border-sidebar-border` | `280 22% 91%` | idem |
| Section label | `text-muted-foreground` | `240 4% 38%` | idem |
| Item (resting) | `text-sidebar-foreground` | inherit | inherit |
| Item icon (resting) | `text-muted-foreground` | inherit | inherit |
| Item (hover) | `hover:bg-sidebar-accent hover:text-sidebar-accent-foreground` | `280 20% 96%` bg / `281 64% 26%` fg | idem |
| Item (active) | `bg-sidebar-accent text-sidebar-accent-foreground font-semibold` + `aria-current="page"` | idem | idem |
| Item icon (active) | `text-sidebar-primary` | `281 64% 26%` | idem |
| Badge bg | `bg-sidebar-accent` | `280 20% 96%` | idem |
| Badge fg | `text-sidebar-accent-foreground` | `281 64% 26%` | idem |
| Focus ring | `focus-visible:ring-2 ring-ring ring-offset-1` | `281 64% 26%` (violet-500) | mapeado pra orange-500 em dark via `--ring` |
| Group chevron | `text-muted-foreground transition-transform` + rotate-180 quando aberto | inherit | inherit |
| Divisor (section em collapsed) | `bg-sidebar-border` | inherit | inherit |

**Nenhum** valor cromático fora do chain `--sidebar-*` / `--muted-foreground` / `--ring` é introduzido. Sem expansão de token; sem ADR adicional além de ADR-019.

## API pública detalhada

```tsx
// Root
export interface SidebarNavProps extends React.HTMLAttributes<HTMLElement> {
  collapsed?: boolean;        // default false
  "aria-label"?: string;      // default "Navegação principal"
  children: React.ReactNode;
}

// Section
export interface SidebarNavSectionProps {
  label?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
}

// Item
export interface SidebarNavItemProps {
  icon?: React.ReactNode;
  badge?: React.ReactNode;
  active?: boolean;             // default false
  disabled?: boolean;           // default false
  href?: string;                // se presente, renderiza <a>; senão <button>
  onClick?: React.MouseEventHandler;
  label?: string;               // necessário em collapsed quando children não é string
  className?: string;
  children: React.ReactNode;
}

// Group (uncontrolled OR controlled)
export interface SidebarNavGroupProps {
  label: React.ReactNode;
  icon?: React.ReactNode;
  defaultOpen?: boolean;        // default true (uncontrolled)
  open?: boolean;               // se presente, vira controlled
  onOpenChange?: (open: boolean) => void;
  className?: string;
  children: React.ReactNode;
}

// CVA accessors públicos
export const sidebarNavVariants;       // collapsed: boolean
export const sidebarNavItemVariants;   // active: boolean, disabled: boolean
```

Sub-componentes adicionais expostos para composição declarativa: `<SidebarNavGroupTrigger>` e `<SidebarNavGroupContent>` (úteis para customizar o markup do header ou conteúdo do grupo).

## Estrutura CVA

```ts
const sidebarNavVariants = cva(
  "flex h-full flex-col gap-3 border-r border-sidebar-border bg-sidebar p-3 text-sidebar-foreground transition-[width] duration-200 ease-out motion-reduce:transition-none",
  {
    variants: {
      collapsed: {
        true: "w-14 items-stretch px-1.5",
        false: "w-60",
      },
    },
    defaultVariants: { collapsed: false },
  },
);

const sidebarNavItemVariants = cva(
  "group/item flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-left text-sm font-medium leading-none transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50 aria-disabled:cursor-not-allowed aria-disabled:opacity-50",
  {
    variants: {
      active: {
        true: "bg-sidebar-accent text-sidebar-accent-foreground font-semibold",
        false: "",
      },
    },
    defaultVariants: { active: false },
  },
);
```

## Riscos & mitigações

| Risco | Mitigação |
|---|---|
| Confusão entre `Sidebar` shell e `SidebarNav` primitiva | Página Astro de SidebarNav carrega seção explícita "Quando usar Sidebar vs SidebarNav" com matriz de cenários; ADR-019 documenta a coexistência |
| Falta de `label` em collapsed quando children não é string | Warning em dev via `console.warn` (tolerado por `lex-logging-decorator` § exceção 3, "global error boundary" — aqui é desenvolvimento, não produção. **Reavaliado**: para evitar violar `no-console`, o warning vai para um helper que injeta apenas em `process.env.NODE_ENV !== "production"` via `if (typeof console !== "undefined")` — mesmo padrão do `radix-ui` para invariants. ADR-019 § "Collapsed label disclosure" registra. |
| Visual regression na primeira execução do CI Ubuntu | Política autorizada: aplicar label `regenerate-baselines` (Fernando autorizou para esta janela). Baselines macOS não vão para o repo (`__image_snapshots__/` é Ubuntu-only) |
| Tooltip em modo collapsed pode causar layout shift | Tooltip do DS usa Portal — não afeta layout do container nav |
| `<a href>` com `disabled` não tem comportamento nativo | Implementação adiciona `aria-disabled="true" tabIndex={-1} pointer-events-none` no link disabled; testes verificam ambos |

## Stacked PR Decomposition

**Não aplicável.** Decisão Checklist (`codex-stacked-prs`):
- Alto sinal: 0 (não é DB+migration, não é API+SDK, não é múltiplos contextos)
- Anti-sinais: PR atômico declarado no Plan #83 ("um Plan = um PR"); todos os arquivos são derivados do mesmo componente

PR único.

## Logging

Componente UI puro — sem logging, sem telemetria. `lex-observability-required` é "every new HTTP endpoint, event consumer, scheduled job, or long-running worker": componente React de design system não se enquadra em nenhuma das categorias.

## Plano de execução

1. **Phase 3 outputs:** este arquivo + ADR-019.
2. **Gate 1:** auto-aprovado (escopo casa o checklist canônico do Plan #83 sem ambiguidade; não há ação irreversível pendente de decisão humana).
3. **Phase 4:** implementação na ordem (a) `index.tsx`, (b) `SidebarNav.test.tsx`, (c) `SidebarNav.stories.tsx`, (d) `previews/sidebar-nav.tsx`, (e) `pages/componentes/sidebar-nav.astro`, (f) `index.ts` (barrel), (g) `index.astro` (MIGRATED).
4. **Phase 5:** security review (componente UI sem input externo — review padrão DS).
5. **Phase 6:** Gate 2 — typecheck → lint → test → build → docs:build.
6. **Phase 7:** commit atômico + PR via `gh` (mirror labels + size/* + Closes #82 + Closes #83).
