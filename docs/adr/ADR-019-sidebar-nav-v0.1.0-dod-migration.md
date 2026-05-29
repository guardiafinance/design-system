# ADR-019 — Migrate SidebarNav to v0.1.0 DoD (Navigation/Lateral)

- **Status:** accepted
- **Date:** 2026-05-29
- **Deciders:** @fernandoseguim (CODEOWNER), `warrior-athena` (Issue-Driven flow orchestrator)
- **Precedents:** ADR-010 (Dialog), ADR-011 (Alert), ADR-012 (Drawer + Sheet consolidation), ADR-013 (ConfidenceIndicator), ADR-014 (Toast)
- **Issue:** [#82](https://github.com/guardiatechnology/design-system/issues/82)
- **Plan:** [#83](https://github.com/guardiatechnology/design-system/issues/83)

## Context

`SidebarNav` é a primitiva de **navegação lateral vertical** no catálogo do `@guardia/design-system` v0.1.0, categoria **Navigation**. O baseline atual é exclusivamente a referência legada em `ux_references/ui_kits/components/SidebarNav/` (JSX puro acoplado a `(window as any).Icon`, classes ad-hoc `.grd-sb-*`, cores hardcoded em CSS variables legacy `var(--violet-*)` / `var(--border)`). Não existe nenhum código em `ui_kit/components/`; o slot no Set `MIGRATED` de `docs/src/pages/index.astro` aponta para `__pending__`.

O Plan #83 declara o escopo: levar `SidebarNav` ao DoD do v0.1.0 (impl + tests + stories + página Astro + previews + barrel + MIGRATED set, com jest-axe light+dark e aprovação por playground), com paridade de API e visual à referência legada.

Há precondições topológicas relevantes que **forçam** algumas decisões serem registradas aqui (e não diluídas no commit), por afetarem coexistência com outros artefatos do DS:

1. **Já existe `ui_kit/components/sidebar/`** — um composite shell shadcn-derived (`SidebarProvider`, `SidebarTrigger`, `SidebarRail`, persistência via cookie, integração com `<Drawer>` mobile pós-ADR-012). É chrome de aplicação, não primitiva de navegação. SidebarNav **não substitui** Sidebar; resolvem problemas distintos. O risco de confusão semântica é real e precisa ser cravado em ADR para que reviewers e consumers entendam a distinção.
2. **Radix não oferece primitiva para nav lateral persistente.** `NavigationMenu` é orientado a menubar com flyout; `Accordion` força semântica accordion (1+ painel) que não casa com sidebar (seções sempre visíveis, grupos opcionalmente colapsáveis dentro). A decisão de **não usar Radix base** é arquitetural e merece registro — não é "preguiça".
3. **A referência legada usa dot-notation com `any` cast** (`(SidebarNav as any).Section = ...`). `lex-frontend-typing` proíbe `any` injustificado. A API canônica do DS atual (Toast, Dialog, Drawer) é **named exports**. A migração troca o shape; o ADR documenta o trade-off.
4. **Modo collapsed depende de disclosure do label** para screen readers. A legada usa `title=` nativo (A11y limitada). O upgrade para `<Tooltip>` do DS introduz acoplamento (SidebarNav passa a importar Tooltip) que merece justificativa explícita.

## Decision

Migrar SidebarNav ao v0.1.0 DoD seguindo um recipe **ConfidenceIndicator-style adaptado** (composição interna sem Radix base, sub-componentes named exports) com 5 decisões cravadas:

### 1. Base primitive — sem Radix, aria-expanded/aria-controls manuais

`SidebarNav` é uma estrutura semântica simples (`<nav>` + lista de itens + grupos com botão+conteúdo). Avaliadas 4 opções:

- **(a) `@radix-ui/react-navigation-menu`** — descartada. Orientada a top-bar menubar com flyout. Semântica acoplada a menu horizontal com painéis em hover/focus; não casa com nav lateral persistente.
- **(b) `@radix-ui/react-accordion`** — descartada. Força contrato accordion (seções inteiras colapsáveis, 1+ painel expandido). Sidebar tem seções **sempre visíveis** + grupos **opcionalmente** colapsáveis dentro — semântica disjunta.
- **(c) `@radix-ui/react-collapsible`** — viável, mas o ganho é marginal (~30 linhas que substituiríamos por `<button aria-expanded><div hidden></div></button>`). Custo: introduzir dependência semântica de outro componente DS dentro de uma primitiva nav.
- **(d) Sem Radix, manual** — **escolhida**. Implementação direta de `aria-expanded`/`aria-controls` no `SidebarNavGroupTrigger` + `SidebarNavGroupContent` com `id` estável via `React.useId()`. Precedente: ConfidenceIndicator (#256, ADR-013) — composição interna sem Radix.

### 2. API shape — named exports, não dot-notation

A referência legada usa `(SidebarNav as any).Section = SBSection` (dot-notation com `any` cast). `lex-frontend-typing` proíbe `any` injustificado; o cast é o único caminho para anexar sub-componentes a uma função tipada sem expor uma interface artificial.

O padrão DS atual (Toast `ToastProvider`/`ToastTitle`/`ToastClose`; Dialog `DialogContent`/`DialogHeader`/`DialogFooter`; Drawer `DrawerContent`/`DrawerHeader`/`DrawerTitle`) é **named exports** sob um namespace lógico de prefixo:

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

Trade-off: consumer escreve mais imports (~ 4-6 named imports vs 1 com dot-notation), em troca de tipagem correta sem `any`, tree-shaking limpo, e paridade com o restante do catálogo.

### 3. Group state model — controlled + uncontrolled coexistindo

A referência legada é exclusivamente uncontrolled (`React.useState(defaultOpen)`). O padrão DS (Collapsible, Drawer, Tooltip) suporta os dois modos via detecção de `open` prop:

```tsx
// Uncontrolled (paridade com a referência)
<SidebarNavGroup label="Contábil" defaultOpen>...</SidebarNavGroup>

// Controlled (novo)
<SidebarNavGroup label="Contábil" open={isOpen} onOpenChange={setIsOpen}>...</SidebarNavGroup>
```

Hook interno: `const [open, setOpen] = useControllableState({ value: openProp, defaultValue: defaultOpen ?? true, onChange: onOpenChange })`. Sem dependência externa — implementação inline ~ 15 linhas (mesmo padrão usado em Collapsible / Tooltip do projeto).

### 4. Collapsed label disclosure — Tooltip do DS + `sr-only` defesa em profundidade

A referência legada usa `title="..."` HTML nativo (A11y limitada — não funciona via teclado em todos os browsers; sem styling). Decisão para v0.1.0:

- Quando `collapsed=true`, o item interativo é **wrappeado** em `<Tooltip>` do DS (`@/components/tooltip`) com `content` igual ao label textual. O Tooltip do DS já implementa Radix Tooltip — handles hover + focus + keyboard.
- O label original também vai para `<span className="sr-only">{label}</span>` adjacente ao ícone — **defesa em profundidade** para screen readers que enunciam o conteúdo do botão antes do Tooltip ser invocado.
- Quando `children` não é string, o consumer **deve** passar prop `label?: string`. Sem `label`, em modo collapsed o componente cai apenas no `sr-only` derivado de `children` via `aria-label` no elemento renderizado — não há warning em produção (evita `console.*` calls per `lex-logging-decorator`); em dev o componente entra em modo degradado silenciosamente, e a página Astro documenta explicitamente o requisito.

Acoplamento aceito: SidebarNav passa a importar `Tooltip` do mesmo barrel. Componentes do DS importando outros componentes do DS é prática estabelecida (Sidebar shell importa Drawer, Tooltip, Skeleton, Button).

### 5. Coexistência com `Sidebar` shell — ortogonal, documentada

`SidebarNav` **não substitui**, **não modifica**, **não importa** `Sidebar` (composite shell shadcn). Resolvem problemas distintos:

| Problema | Solução |
|---|---|
| Chrome inteiro de app (header com trigger, persistência cookie, mobile Drawer) | `<SidebarProvider><Sidebar>...</Sidebar></SidebarProvider>` (shell existente) |
| Árvore de navegação tokenizada (seções + grupos + itens ativos + collapsed) | `<SidebarNav>...</SidebarNav>` (este componente) |
| Os dois juntos | `<Sidebar><SidebarContent><SidebarNav>...</SidebarNav></SidebarContent></Sidebar>` |

A página Astro de SidebarNav carrega seção explícita "Quando usar Sidebar vs SidebarNav" com a matriz acima. Reviewers e consumers têm o cenário cravado.

### 6. ADR `accepted` desde o primeiro commit

Commit atômico carrega código + ADR + docs juntos. Sem pattern `proposed → accepted` (Argos sinalizou 🟡 em PR #237 quando esse pattern foi seguido em iterações anteriores).

## Public surface

```tsx
// Components (6 named exports)
export {
  SidebarNav,
  SidebarNavSection,
  SidebarNavItem,
  SidebarNavGroup,
  SidebarNavGroupTrigger,
  SidebarNavGroupContent,
};

// CVA accessors (2)
export { sidebarNavVariants, sidebarNavItemVariants };

// Types (4)
export type {
  SidebarNavProps,
  SidebarNavSectionProps,
  SidebarNavItemProps,
  SidebarNavGroupProps,
};
```

Total: **6 componentes + 2 CVA accessors + 4 types**.

## Tokenization

100% derivada do chain `--sidebar-*` / `--muted-foreground` / `--ring` já presente em `ui_kit/styles/index.css` (linhas 223-230 light, mapeamento dark equivalente). **Zero expansão de token nova.** Detalhamento na tabela em `docs/issues/issue-82/03-architecture.md` § "Tokenização — mapeamento".

## ARIA contract

| Elemento | ARIA |
|---|---|
| `<SidebarNav>` (root) | `<nav role="navigation" aria-label="Navegação principal">` (override via prop) |
| `<SidebarNavSection>` (com label) | `<section aria-label={label}>` quando label é string; sem role explícito caso contrário |
| `<SidebarNavItem>` ativo | `<a aria-current="page">` ou `<button aria-current="page">` |
| `<SidebarNavItem>` disabled (button) | `<button disabled>` (atributo nativo) |
| `<SidebarNavItem>` disabled (link) | `<a aria-disabled="true" tabIndex={-1}>` + classe `pointer-events-none` |
| `<SidebarNavGroupTrigger>` | `<button aria-expanded={open} aria-controls={contentId}>` |
| `<SidebarNavGroupContent>` | `<div id={contentId} role="group">` (sem `hidden` quando aberto; não montado quando fechado) |
| `<SidebarNavItem collapsed>` | wrapper `<Tooltip>` + `<span className="sr-only">{label}</span>` |

## Coverage plan

| Aspecto | Cobertura |
|---|---|
| AC ↔ test traceability | Cada `it(...)` carrega `AC-N:` no título |
| Tests count | Plan #83 exige ≥ 20 ou ≥ 80% coverage do arquivo — alvo **≥ 22 testes** |
| jest-axe states × themes | 5 estados (Default, ativo, collapsed, grupo aberto, disabled) × 2 temas = **10 invocações** |
| Stories | Default, Collapsed, WithActiveItem, WithBadges, WithGroups, DenseRealistic (6) |
| Visual regression | Auto via CI playwright (Ubuntu); aplicar `regenerate-baselines` se necessário na 1ª run |

## Consequences

### Positive
- Catálogo Navigation avança (Sidebar shell + Navbar + SidebarNav + Breadcrumb + Menubar + Pagination + Tabs já cobertos)
- Paridade visual com referência legada preservada
- Token chain consolidado; zero divergência com Notion (não há tokens novos)
- Coexistência com Sidebar shell documentada na página Astro + ADR

### Negative
- 6 named exports em vez de 1 com dot-notation (consumer escreve mais imports)
- Acoplamento explícito com `Tooltip` do DS (mas é o canal certo para A11y em collapsed)
- Componente sem Radix base — implementação manual de `aria-expanded`/`aria-controls` (custo: ~10 linhas, ganho: zero dependência semântica errada)

### Neutral
- Não retira `Sidebar` shell. Não retira a referência legada de `ux_references/` (snapshot canônico fica preservado).

## References

- Plan #83 — escopo + DoD checklist
- Issue #82 — parent Tech Task
- `ux_references/ui_kits/components/SidebarNav/` — referência visual + API legada
- `ui_kit/components/sidebar/index.tsx` — shell shadcn coexistente
- ADR-013 — precedente de composição sem Radix
- ADR-014 — recipe v0.1.0 DoD recente (Toast)
- `ui_kit/styles/index.css` linhas 223-230 — tokens `--sidebar-*`
- `lex-frontend-typing` — racional para evitar dot-notation com `any` cast
- `lex-frontend-accessibility` Rule 1 (semantic HTML), Rule 2 (keyboard), Rule 5 (contrast), Rule 6 (dynamic state)
- `lex-design-system-library` — racional para coexistência (compor existente, não reimplementar)
