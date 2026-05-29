# Requirements — Migrate Command to v0.1.0 DoD

- **Issue:** [#78](https://github.com/guardiatechnology/design-system/issues/78)
- **Plan:** [#79](https://github.com/guardiatechnology/design-system/issues/79)

## Acceptance Criteria

### Public surface

- **AC-1.** O barrel `@guardiatechnology/design-system` exporta os símbolos `CommandPalette` (componente imperativo), `Command`, `CommandInput`, `CommandList`, `CommandGroup`, `CommandItem`, `CommandSeparator`, `CommandEmpty`, `CommandShortcut` (primitivas declarativas re-exportadas), além dos tipos `CommandPaletteProps`, `CommandPaletteGroup`, `CommandPaletteEntry`.
- **AC-2.** O componente vive em `ui_kit/components/command/index.tsx`. A entrada `export * from "./command"` é adicionada ao `ui_kit/components/index.ts` em ordem alfabética.

### Imperative API (paridade com referência legacy)

- **AC-3.** `<CommandPalette open onOpenChange items placeholder emptyText />` renderiza dentro de `<Dialog>` (Radix wrapper migrado em ADR-010), com overlay, focus trap e fechamento por ESC delegados ao Dialog.
- **AC-4.** A prop `items: CommandPaletteGroup[]`, onde `CommandPaletteGroup = { id: string; heading: React.ReactNode; entries: CommandPaletteEntry[] }` e `CommandPaletteEntry = { id: string; label: React.ReactNode; description?: React.ReactNode; icon?: React.ReactNode; shortcut?: string; keywords?: string; onSelect?: () => void; disabled?: boolean }`.
- **AC-5.** A prop `placeholder` default é `"Buscar comando…"`; `emptyText` default é `"Nenhum resultado"`.
- **AC-6.** Quando um `CommandItem` é selecionado (click ou Enter), o callback `entry.onSelect()` dispara e `onOpenChange(false)` é chamado em seguida — fechamento implícito após ação, paridade com a referência.

### Behavior

- **AC-7.** A query digitada em `CommandInput` filtra entries via match em `label` (string), `description` (string) e `keywords` — case-insensitive — usando o filter nativo do `cmdk` (heurística de score). Grupos sem entries visíveis ficam ocultos.
- **AC-8.** Quando `items` resulta em zero entries visíveis após filtragem, `<CommandEmpty>` renderiza o texto de `emptyText`.
- **AC-9.** Navegação por `ArrowDown` / `ArrowUp` move o highlight entre entries respeitando ordem visual; `Enter` aciona o item destacado; `Tab` move o foco para fora da paleta (delegado ao Dialog focus trap).
- **AC-10.** ESC fecha a paleta (`onOpenChange(false)`) — herdado do Dialog.
- **AC-11.** Reabrir a paleta (`open` de `false → true`) reseta a query para string vazia e o highlight para o primeiro item.

### Visual (paridade com referência legacy + tokens semânticos)

- **AC-12.** A paleta usa `--popover` (background), `--popover-fg` (texto), `--border` (separadores), `--accent`/`--accent-fg` (entry destacada/hover), `--fg-muted` (placeholder, group heading, description) — sem cores hardcoded fora dos tokens.
- **AC-13.** A linha de busca contém: ícone de busca (lucide `Search`) à esquerda, input flex, kbd `ESC` à direita. Border-bottom em `--border` separa busca da lista.
- **AC-14.** Group headings renderizam em uppercase 10.5px peso 700 letter-spacing 0.06em cor `--fg-muted`.
- **AC-15.** Entries com `icon` renderizam o ícone (16px) à esquerda; entries com `shortcut` renderizam kbd à direita; entries com `description` empilham label em cima e description em baixo (12.5px `--fg-muted`).

### Accessibility (jest-axe light + dark)

- **AC-16.** `CommandInput` tem `<label>` associado via `htmlFor` ou `aria-label="Buscar comando"` para satisfazer `lex-frontend-accessibility` Rule 4.1.
- **AC-17.** O foco entra automaticamente no `CommandInput` ao abrir a paleta.
- **AC-18.** `Command.test.tsx` invoca `axeInThemes(container)` (light + dark) em pelo menos 4 cenários: `Default` (paleta vazia), `WithGroups` (3 grupos × N entries), `WithIcons` (entries com ícone + shortcut), `EmptyState` (query sem match). Total mínimo: **8 invocações jest-axe** (4 cenários × 2 temas), 0 violações.

### Tests

- **AC-19.** `Command.test.tsx` cobre, com queries acessíveis (`getByRole`, `getByPlaceholderText`, `getByText`), os ACs interativos: abertura, fechamento por ESC, fechamento por seleção, digitação em search, filtragem, navegação por keyboard, ativação por Enter, vazio. Mínimo **20 testes** ou ≥ 80% de cobertura no arquivo (`vitest.config.ts` coverage).
- **AC-20.** Nenhum colaborador interno é mockado — testes renderizam o componente real com providers reais (Dialog + Command). Mocks só em fronteiras (timers para autofocus, se necessário).

### Stories

- **AC-21.** `Command.stories.tsx` exporta as stories `Default`, `WithIcons`, `WithoutShortcuts`, `EmptyState`. Cada story renderiza um trigger que abre a paleta — o usuário interage via Storybook. Stories rodam corretamente em **light** e **dark** (data-theme toggle do Storybook).
- **AC-22.** As stories **não usam helper externo `<span class="text-destructive">`** — ações destrutivas (ex: "Excluir item") usam apenas o ícone + label, sem coloração externa. O destaque visual é responsabilidade do componente, não do conteúdo.

### Docs

- **AC-23.** `docs/src/pages/componentes/command.astro` documenta uso, props, exemplos (Default, WithIcons, WithoutShortcuts, EmptyState, Playground). A página segue o layout `ComponentPreview` usado por Dialog/Drawer/Toast.
- **AC-24.** `docs/src/previews/command.tsx` expõe os componentes preview (`BasicRow`, `WithIconsRow`, `EmptyStateRow`, `UseCasesRow`).
- **AC-25.** `docs/src/pages/index.astro` adiciona `"Command"` ao Set `MIGRATED` em ordem alfabética (entre `ConfidenceIndicator` e `DatePicker`).

### Cross-platform shortcuts (scope expansion 2026-05-29 14:00 UTC, abordagem revisada 15:30 UTC)

Findado durante review do PR #266: `shortcut: string` é estritamente apresentacional e todos os exemplos hardcodavam glyphs de Mac — Windows users viam ⌘ no Storybook. Per `lex-no-silent-tech-debt`, decisão registrada em Plan #79 (seção "Scope expansion") e ADR-017 (addendum) antes de executar.

**Primeira tentativa** (descartada após review com @fernandoseguim): detectar SO via `navigator.platform` e renderizar só o lado correspondente. Trade-offs identificados — hidratação SSR fragmentada, baselines visuais divergentes por plataforma, não-determinismo em testes. **Decisão final**: render both lados (`⌘K / Ctrl+K`) sempre por default.

- **AC-29.** O barrel `@guardia/design-system` exporta `formatShortcut(keys: readonly string[], options?: { platform?: "mac" | "non-mac" | "both" }): string` implementado em `ui_kit/components/command/format-shortcut.ts`. A API `shortcut: string` em `CommandPaletteEntry` permanece intacta — zero breaking.
- **AC-30.** Default `platform: "both"` renderiza os dois lados separados por ` / ` (`formatShortcut(["mod", "K"])` → `"⌘K / Ctrl+K"`). Sem detecção de SO, sem hidratação fragmentada, sem baselines visuais por plataforma. Usuário lê o lado correto do separador conforme o teclado dele.
- **AC-31.** Tokens semânticos mapeados — `mod` (⌘/Ctrl+), `shift` (⇧/Shift+), `alt`/`option` (⌥/Alt+), `ctrl`/`control` (⌃/Ctrl+ explícito), `cmd` (⌘/Ctrl+, alias), `meta` (⌘/Win+). Glyphs de teclas especiais: `backspace`/`⌫`, `enter`/`return`/`↵`, `tab`/`⇥`, `escape`/`esc`/`⎋`, `space`/`␣`, `arrowup/down/left/right`/↑↓←→. Modificadores no Mac são re-ordenados para a convenção canônica `⌃⌥⇧⌘key` independente da ordem de input; non-Mac preserva a ordem do array com separador `+`. Letras e símbolos preservados literalmente. Lookup case-insensitive.
- **AC-32.** `format-shortcut.test.ts` cobre default (`"both"`), Mac (forced), non-Mac (forced), com ≥ 18 asserts incluindo: render lado a lado, modificador composto, re-ordenação canônica no Mac, preservação de ordem em non-Mac, tokens case-insensitive, teclas especiais, letras/símbolos literais, meta vs Win.
- **AC-33.** Todas as stories com shortcuts (`Default`, `WithIcons`) e todas as previews com shortcuts (`BasicRow`, `WithIconsRow`, `UseCasesRow`) usam `formatShortcut(["mod", X])` em vez de literais Mac. Story `ForcedPlatformShortcuts` + preview `ForcedPlatformRow` demonstram o escape hatch `{ platform }`. Trigger button labels nas previews/stories também usam o helper.

### Quality gates

- **AC-26.** `npm run typecheck && npm run lint && npm run test && npm run build && npm run docs:build` passa verde localmente.
- **AC-27.** Commit atômico único `feat(command): migrate to v0.1.0 DoD` conforme `lex-small-commits` + `lex-conventional-commits`. A expansão cross-platform soma um segundo commit atômico `feat(command): add formatShortcut helper for cross-platform shortcuts` — não amenda o primeiro (preserva atomicidade per `lex-small-commits`).
- **AC-28.** ADR-017 é registrada em `docs/adr/ADR-017-command-v0.1.0-dod-migration.md` com `status: accepted` desde o primeiro commit. Addendum "Cross-platform shortcuts (2026-05-29)" cravado no segundo commit para registrar a decisão de API do helper.

## Definition of Done (resumo executivo)

| Item | Status | AC |
|---|---|---|
| Componente em `ui_kit/components/command/index.tsx` | □ | AC-1 a AC-15 |
| Testes ≥ 20 ou ≥ 80% cov + jest-axe light+dark | □ | AC-16 a AC-20 |
| Stories light + dark sem helper externo de cor | □ | AC-21, AC-22 |
| Página Astro + previews | □ | AC-23, AC-24 |
| MIGRATED set + barrel export | □ | AC-2, AC-25 |
| Tokens semânticos only | □ | AC-12 |
| ADR-017 accepted no primeiro commit | □ | AC-28 |
| Quality gates verdes | □ | AC-26 |
| Commit atômico | □ | AC-27 |

## Fora de escopo

- Migração de TopBar `<input type="search">` para `<CommandPalette>` (PR separada, depende deste merge).
- Integração com Isac (chat-to-command suggestions) — futura iniciativa AI-First.
- Reusar `cmdk` em outros componentes (Combobox, Multi-Select usam Radix Popover + filter próprio — sem mudança).
