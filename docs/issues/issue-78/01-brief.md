# Brief — Migrate Command to v0.1.0 DoD

- **Issue:** [#78](https://github.com/guardiatechnology/design-system/issues/78)
- **Plan:** [#79](https://github.com/guardiatechnology/design-system/issues/79)
- **Author:** @fernandoseguim (CODEOWNER)
- **Type:** Feature (component migration)
- **Category:** Navigation
- **Reference:** `ux_references/ui_kits/components/Command/{index.tsx, index.css, Command.playground.html}`

## Contexto

`Command` (paleta ⌘K) é parte do catálogo canônico de 52 componentes do `@guardiatechnology/design-system` v0.1.0 na categoria **Navigation**. Atualmente o componente não existe em `ui_kit/components/` — apenas o snapshot legacy em `ux_references/ui_kits/components/Command/` (paleta minimalista com state local, fuzzy match por `includes`, sem keyboard navigation acessível além de seta/Enter).

A categoria Navigation já tem Accordion, Breadcrumbs, Menu, Pagination, Tabs migrados. Command é o componente faltante mais ergonomicamente relevante para a experiência AI-First — é o canal de entrada universal para ações rápidas, complementar ao chat com Isac.

## Por que existir

1. **Catálogo v0.1.0 incompleto.** Sem Command, a paleta de busca global da plataforma vira reimplementação ad-hoc em cada app — viola `lex-design-system-library`.
2. **Padrão AI-First.** Command é a versão keyboard-first do prompt para usuário power: complementa o chat com Isac sem competir com ele. Acelera ações conhecidas (navegação, criação rápida, mudança de contexto) sem que o usuário precise digitar prompt completo.
3. **Bloqueio de outras issues.** SidebarNav, TopBar e demais navigation components citam Command como anchor para "Search" — bloqueia design coerente da família.

## Snapshot da referência legacy

A referência em `ux_references/ui_kits/components/Command/` define:
- `<Command open onClose items={[{group, entries: [{id, label, shortcut, icon, keywords, action}]}]} placeholder emptyText />`
- Backdrop violet com z-index 1200; portal direto em `document.body`; ESC fecha; arrow keys navegam; Enter executa
- Fuzzy match por `String.includes` em label+description+keywords; reseta `activeIdx` ao mudar query
- Grupos com label uppercase; entries com ícone + label + description + shortcut kbd

Itens que a migração v0.1.0 **deve preservar**: API por grupos com `id/label/shortcut/icon/keywords/action`, ⌘K como atalho default, ESC fecha, navegação por arrow keys, ícone de busca à esquerda, kbd "ESC" no canto da search, paridade visual com a paleta legacy.

Itens que a migração v0.1.0 **deve atualizar**: substituir state local + portal manual + listener de keydown manual por chassis canônico (`cmdk` primitive dentro de `<Dialog>` Radix já migrado), tokens semânticos (`--popover` / `--accent` em vez de `--violet-50/700` hardcoded), CVA opcional só se necessário (compacto), API imperativa coexistindo com primitivas declarativas para composição AI-First avançada (e.g. Isac suggestions).

## Decisões a cravar em Phase 3

- **Base primitive:** `cmdk` (de-facto standard React) hospedado em `<Dialog>` já migrado (ADR-010).
- **Modelo de API:** imperativo `<CommandPalette open onOpenChange items placeholder emptyText />` (paridade com referência legacy) + primitivas declarativas re-exportadas (`<Command>`, `<CommandInput>`, `<CommandList>`, `<CommandGroup>`, `<CommandItem>`, `<CommandSeparator>`, `<CommandEmpty>`, `<CommandShortcut>`) para composição avançada.
- **Token contract:** sem expansão de tokens — consumir `--popover`, `--popover-fg`, `--border`, `--accent`, `--accent-fg`, `--fg-muted` existentes. Sem novas vars.
- **a11y:** `<CommandInput>` herda `role="combobox"` do cmdk; ESC delegado ao Dialog; jest-axe light+dark em ≥ 4 cenários (Default, WithGroups, WithIcons, EmptyState).
- **Dependência:** `cmdk` v^1.1.1 (já validada via `npm view`).

## Unknowns

Nenhuma incógnita aberta — referência legacy é clara, padrão Dialog está cravado, cmdk é estabelecido.

## Próximo passo

Phase 2 — formalizar ACs numerados.
