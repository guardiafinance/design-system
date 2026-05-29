# ADR-017 — Migrate Command to v0.1.0 DoD (Navigation)

- **Status:** accepted
- **Date:** 2026-05-29
- **Deciders:** @fernandoseguim (CODEOWNER), `warrior-athena` (Issue-Driven flow orchestrator)
- **Precedents:** ADR-005 (Popover), ADR-006 (Menu), ADR-010 (Dialog — host overlay), ADR-014 (Toast — imperative + declarative coexistence pattern)
- **Issue:** [#78](https://github.com/guardiatechnology/design-system/issues/78)
- **Plan:** [#79](https://github.com/guardiatechnology/design-system/issues/79)

## Context

`Command` (paleta ⌘K) é o componente faltante da categoria **Navigation** no catálogo v0.1.0. A referência legacy em `ux_references/ui_kits/components/Command/` define a forma desejada (paleta com search, grupos, entries com ícone/shortcut, keyboard navigation, ESC, Enter), mas a implementação legacy é minimalista demais para sustentar o DoD:

1. **Filter por `String.includes`** — não tolera fuzziness (digitar "ldger" não acha "Ledger"), perde ranking por relevância.
2. **Portal + state + listener manual** — refatora a roda. Não delega focus trap nem ESC ao Dialog canônico já migrado em ADR-010.
3. **Tokens hardcoded** — `--violet-50/700` para entry destacada, fora do chain semântico `--accent/--accent-fg` consumido pelos outros overlays migrados.
4. **DoD itens não atendidos** — falta página Astro, falta MIGRATED set, falta cobertura jest-axe light+dark, falta testes behavioral com queries acessíveis.

O Plan #79 declara o escopo: migrar Command para v0.1.0 DoD usando chassis canônico de Navigation/Overlays (Dialog hosting cmdk + tokens semânticos + axeInThemes + Astro page).

Decisões arquiteturais que precisam ser cravadas em ADR (e não diluídas no commit):

- **Escolha do base primitive.** `cmdk` vs construir do zero vs composto Radix manual.
- **Modelo de API.** Imperativo (paridade legacy) vs declarativo (composição), e como coexistem.
- **Host do overlay.** `<Dialog>` (Radix wrapper já migrado) vs portal manual vs `<Popover>` (não anchor-aware suficiente para uma paleta).
- **Token contract.** Reutilizar `--popover` / `--accent` ou criar tokens dedicados de paleta.
- **a11y mapping.** Roles do cmdk vs override manual.

## Decision

Migrar Command ao v0.1.0 DoD seguindo o recipe **Dialog + cmdk**:

1. **Base primitive — `cmdk` v^1.1.1.** Adoção do pacote oficial `cmdk` como motor da paleta (filter heurístico nativo, ARIA roles corretos, keyboard navigation acessível). Mantido por Paco Coursey e alinhado com a stack Radix já consolidada no DS. Custo: +1 dep ~3kb gzipped. Retorno: ergonomia + a11y de mercado sem reimplementar.

2. **Host do overlay — `<Dialog>` (ADR-010).** O `<CommandPalette>` renderiza dentro de `<Dialog open onOpenChange>` para reutilizar overlay, focus trap, ESC, portal e a animação cravados em ADR-010. Zero novo overhead de overlay management; paridade visual com Dialog/Drawer/Toast.

3. **API imperativa canônica + primitivas declarativas coexistindo (pattern ADR-014):**
   - **Imperativa (default):** `<CommandPalette open onOpenChange items placeholder emptyText />` — paridade direta com a referência legacy. O consumidor passa `items` como `CommandPaletteGroup[]` e tudo (Dialog + Command + filter + render) é montado internamente.
   - **Declarativa (poder):** re-export de `Command`, `CommandInput`, `CommandList`, `CommandGroup`, `CommandItem`, `CommandSeparator`, `CommandEmpty`, `CommandShortcut` para casos avançados — e.g. paleta inline sem Dialog, sugestões dinâmicas vindas do Isac, customização de renderer por entry.
   - Os dois modos compartilham o mesmo motor (`cmdk`). Misturar primitivas declarativas dentro de `<CommandPalette>` é possível via `children`, mas o caso default permanece o imperativo.

4. **9 símbolos públicos + 3 tipos:**
   - Componentes: `CommandPalette`, `Command`, `CommandInput`, `CommandList`, `CommandGroup`, `CommandItem`, `CommandSeparator`, `CommandEmpty`, `CommandShortcut`.
   - Tipos: `CommandPaletteProps`, `CommandPaletteGroup`, `CommandPaletteEntry`.

5. **Token contract — sem expansão.** A paleta consome `--popover` (bg), `--popover-fg` (texto), `--border` (separadores), `bg-accent text-accent-foreground` (entry destacada/hover via `data-[selected=true]` do cmdk), `--fg-muted` (placeholder, group heading, description). Sem novas vars CSS. Sem cores hardcoded. O contraste é garantido pelo chain já validado em Dialog/Menu/Popover.

6. **a11y mapping — delegado ao cmdk + Dialog:**
   - `<CommandInput>` herda `role="combobox" aria-expanded="true" aria-controls="<list-id>"` do cmdk. Wrapper adiciona `aria-label="Buscar comando"` (visualmente oculto via `sr-only`) para satisfazer `lex-frontend-accessibility` Rule 4.1.
   - `<CommandList>` herda `role="listbox"`.
   - `<CommandItem>` herda `role="option" aria-selected`.
   - ESC, focus trap, e portal são responsabilidade do `<Dialog>` (ADR-010).
   - Autofocus no input ao abrir — implementação via prop `autoFocus` do cmdk, sem manipulação manual do DOM.

7. **Defaults:**
   - `placeholder = "Buscar comando…"` (paridade legacy).
   - `emptyText = "Nenhum resultado"` (paridade legacy).
   - `max-w-[580px] p-0` no `DialogContent` (paridade visual com a referência).
   - Seleção fecha a paleta (`onSelect` callback dispara `entry.onSelect?.()` seguido de `onOpenChange(false)`).

8. **A11y coverage (`axeInThemes`).** Mínimo de 4 cenários × 2 temas = **8 invocações jest-axe** explícitas em `Command.test.tsx`: `Default` (paleta vazia), `WithGroups` (3 grupos × N entries), `WithIcons` (entries com ícone + shortcut), `EmptyState` (query sem match). Todos em light + dark.

9. **Stories sem helper externo de cor.** Stories não usam `<span class="text-destructive">` ou wrappers de cor externos para indicar ações destrutivas. O destaque visual é responsabilidade do componente (ícone trash + label), não do conteúdo. Decisão alinhada com feedback de PR #258 (Drawer) e MEMORY (`feedback_story_no_external_destructive_helper`).

10. **ADR `accepted` desde o primeiro commit.** Commit atômico carrega código + ADR + docs juntos. Sem pattern `proposed → accepted` (precedente cravado em ADR-014).

## Consequences

### Positive

- Command alcança paridade DoD com Dialog / Drawer / Toast / Alert (mesmo chassis Radix-wrapper, mesmo token contract, mesmo rigor de teste).
- Categoria **Navigation** avança 1 componente em direção aos 8 do v0.1.0 (Accordion, Breadcrumbs, Command, Menu, Pagination, SidebarNav, Stepper, Tabs, TopBar — Command era o gap mais visível por uso AI-First).
- API imperativa preserva a familiaridade do playground legacy (mesma assinatura `items` group-based); primitivas declarativas dão poder de composição para casos AI-First (e.g. paleta com sugestões streaming do Isac).
- Reuso do `<Dialog>` (ADR-010) demonstra o **retorno do investimento** dessa migração — Command cai pronto no chassis sem reabrir overlay management.
- a11y conforme `lex-frontend-accessibility` Rules 1, 2, 4.1, 6.3 com delegação para primitivas testadas (cmdk + Radix Dialog).

### Negative

- **+1 dependência:** `cmdk ^1.1.1`. Custo mínimo — pacote pequeno (~3kb gz), zero deps próprias relevantes, mantenedor alinhado com a stack Radix.
- API imperativa expõe `items` como prop estruturada. Mudanças futuras na shape de `CommandPaletteEntry` (e.g. adicionar `category`, `priority`) são versionadas no major do DS — sem mitigação adicional.

### Neutral

- Adição de `cmdk` ao `package.json` + `package-lock.json` autogerado.
- 1 novo diretório (`ui_kit/components/command/`) + 1 nova página docs + 1 ADR. Total: ~8 arquivos novos + 3 modificados.

## Alternatives considered

1. **Construir Command do zero, sem `cmdk`.** Rejeitado — replicar fuzzy filter com ranking, ARIA roles corretos, keyboard navigation cross-browser, e Suspense awareness manualmente é overhead alto e propenso a bugs sutis. `cmdk` já resolveu isso e é o padrão de mercado (Linear, Vercel, Raycast Web).

2. **Composto Radix manual (`Popover` + lista custom).** Rejeitado — Popover não é o anchor certo (paleta não pertence a um trigger DOM-anchored — ela ocupa o viewport). Além disso, lista custom exige reimplementar filter + keyboard nav, perdendo o benefício de delegação.

3. **Manter a implementação legacy intocada + adicionar wrapper fino.** Rejeitado — o componente legacy não satisfaz DoD em 6 frentes (visual, tokens, a11y, testes, stories, docs). Wrapper fino apenas mascara o débito.

4. **Adotar `cmdk` mas sem Dialog (portal manual).** Rejeitado — perde focus trap acessível, ESC handler centralizado, e paridade visual com o stack overlay. Duplicaria a lógica que ADR-010 cravou.

5. **Adotar `cmdk` com API só declarativa (sem `CommandPalette`).** Rejeitado — quebra a familiaridade do playground legacy e exige que cada consumidor monte Dialog + Command + items mapping do zero. A API imperativa é o que torna Command plug-and-play.

6. **Substituir Combobox/MultiSelect também por `cmdk`.** Rejeitado — escopo creep. Combobox/MultiSelect têm contratos distintos (form integration, controlled value, multi-selection) e funcionam bem com Radix Popover + filter próprio. Avaliação futura via Issue separada.

## Implementation note (acceptance criteria mapping)

| ADR clause | Plan AC |
|------------|---------|
| 1. `cmdk` base primitive | AC-1 (surface), AC-7 (filter), AC-9 (keyboard nav) |
| 2. `<Dialog>` host | AC-3, AC-10 (ESC), AC-17 (autofocus) |
| 3. Imperative + declarative coexistence | AC-1, AC-3 a AC-6 |
| 4. 9-component + 3-type surface | AC-1, AC-2 |
| 5. Token contract sem expansão | AC-12 |
| 6. ARIA mapping delegado | AC-16, AC-17 |
| 7. Defaults (placeholder, emptyText, width, close-on-select) | AC-5, AC-6 |
| 8. axeInThemes coverage ≥ 8 invocations | AC-18 |
| 9. Stories sem helper externo de cor | AC-22 |
| 10. Accepted at first commit | AC-28 |
| 11. Cross-platform shortcuts (addendum) | AC-29 a AC-33 |

## Addendum — Cross-platform shortcuts (2026-05-29)

### Context

Review do PR #266 por @fernandoseguim identificou que `shortcut: string` em `CommandPaletteEntry` é estritamente apresentacional — todos os exemplos em stories e previews hardcodavam glyphs de Mac (`⌘K`, `⌘N`, `⌘,`, `⌘⌫`), sem refletir o SO do usuário. Acessando a Storybook do PR a partir do Windows, os shortcuts continuavam aparecendo como ⌘ — UX ruim e armadilha de onboarding (todo consumidor que copia o exemplo herda o vício Mac-only).

### Decision (revisada na mesma sessão de review)

**Primeira tentativa** (descartada): detectar SO em runtime via `navigator.platform`/`userAgent` e renderizar apenas o lado correspondente (⌘K no Mac, Ctrl+K em Win/Linux). Problemas identificados após implementação:
- Stories antigas continuavam com literais Mac hardcoded — converter todas era trabalho equivalente.
- Hidratação SSR Astro virava risco: build no Linux CI emitia `Ctrl+K`, hidratação no Mac trocaria pra `⌘K`, e baselines visuais por plataforma divergiam.
- Detecção introduz não-determinismo nos testes e nas baselines visuais (Ubuntu CI ≠ Mac dev local).

**Decisão final**: helper `formatShortcut(keys, options?)` exportado pelo barrel. **Default `platform: "both"`** renderiza Mac e Win/Linux lado a lado, separados por ` / `. Sem detecção de SO. O usuário lê o lado correto do separador.

```ts
formatShortcut(["mod", "K"])                          // → "⌘K / Ctrl+K"
formatShortcut(["mod", "shift", "P"])                 // → "⇧⌘P / Ctrl+Shift+P"
formatShortcut(["mod", "Backspace"])                  // → "⌘⌫ / Ctrl+Backspace"
formatShortcut(["mod", "K"], { platform: "mac" })     // → "⌘K"     — escape hatch
formatShortcut(["mod", "K"], { platform: "non-mac" }) // → "Ctrl+K" — escape hatch
```

Decisões cravadas:

1. **Render both por default**. O componente renderiza string estática `"⌘K / Ctrl+K"`. Não há detecção, não há hidratação fragmentada, não há baseline visual diferente por plataforma. O design system entrega documentação clara em qualquer browser.

2. **Escape hatch `{ platform }`**. Para contextos onde só um SO importa (wiki interna Windows-only, screenshots de release notes, demos por plataforma), o consumidor força um lado via `{ platform: "mac" }` ou `{ platform: "non-mac" }`.

3. **API por array de tokens** (não objeto `{mac, win}`). Razão: alinha com cmdk, VS Code, Linear; consumidor declara a *intenção semântica* (`["mod", "K"]`) e o helper resolve glyph/label. Objeto exigiria que cada consumidor reaprenda a convenção Mac.

4. **Re-ordenação canônica no Mac** (`⌃⌥⇧⌘key`) independente da ordem de input. `["mod", "shift", "P"]` e `["shift", "mod", "P"]` ambos rendem `⇧⌘P` no lado esquerdo. Non-Mac preserva ordem do array no lado direito (`Ctrl+Shift+P` e `Shift+Ctrl+P` ambos legíveis em Win/Linux).

5. **Tokens semânticos + aliases**:
   - Modificadores: `mod` (⌘ Mac / Ctrl+ non-Mac), `shift` (⇧/Shift+), `alt`/`option` (⌥/Alt+), `ctrl`/`control` (⌃/Ctrl+ explícito), `cmd` (⌘/Ctrl+, alias), `meta` (⌘/Win+).
   - Teclas especiais: `backspace`/⌫, `enter`/`return`/↵, `tab`/⇥, `escape`/`esc`/⎋, `space`/␣, `arrowup/down/left/right`/↑↓←→.
   - Letras e símbolos preservados literalmente.
   - Lookup case-insensitive.

6. **Todas as stories e previews convertidos**. `Default`, `WithIcons`, `BasicRow`, `WithIconsRow`, `UseCasesRow` agora usam `formatShortcut(["mod", X])` — não há mais literais Mac escondidos. A story/preview "Forced platform shortcuts" demonstra o escape hatch `{ platform }`.

7. **Sem provider, sem hook**. Helper puro `() => string` — chama no render.

### Consequences

**Positive:**
- Funciona em qualquer browser/SO sem detecção, sem hidratação fragmentada.
- Stories e previews exibem o pattern correto em todo lugar — onboarding de consumidor não pega vício Mac-only.
- Baselines visuais únicas por componente (não por SO) — CI mais simples.
- Escape hatch claro pra docs single-SO via `{ platform }`.
- Não acopla o componente Command ao helper — qualquer outro componente DS pode importar (Menu, Tooltip, AlertDialog quando ganharem shortcuts).

**Negative:**
- Cada shortcut ocupa ~2x o espaço horizontal em UI estreita (e.g. `⇧⌘⌫ / Ctrl+Shift+Backspace`). Mitigado: a CSS já usa `truncate` no label da paleta; shortcut tem `ml-auto` e `text-xs` — o layout absorve a expansão. Em outros componentes com kbds mais apertados, o consumidor pode forçar `{ platform }` ou aceitar a redução.

**Neutral:**
- +2 arquivos novos (`format-shortcut.ts`, `format-shortcut.test.ts`), +1 export em `index.tsx`. Stories/previews/Astro reconfigurados. Story `ForcedPlatformShortcuts` + preview `ForcedPlatformRow` demonstram o escape hatch. Segundo commit atômico no mesmo PR.
