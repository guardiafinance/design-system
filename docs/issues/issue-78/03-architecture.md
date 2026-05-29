# Architecture — Migrate Command to v0.1.0 DoD

- **Issue:** [#78](https://github.com/guardiatechnology/design-system/issues/78)
- **Plan:** [#79](https://github.com/guardiatechnology/design-system/issues/79)
- **ADR:** [ADR-017](../../../docs/adr/ADR-017-command-v0.1.0-dod-migration.md)

## Affected components

| Path | Status | Why |
|---|---|---|
| `ui_kit/components/command/index.tsx` | new | implementação canônica wrapper sobre `cmdk` + `<Dialog>` |
| `ui_kit/components/command/Command.test.tsx` | new | ≥ 20 testes behavioral + jest-axe light+dark em ≥ 4 cenários |
| `ui_kit/components/command/Command.stories.tsx` | new | 4 stories (Default, WithIcons, WithoutShortcuts, EmptyState) |
| `ui_kit/components/index.ts` | modified | `+1 line` — `export * from "./command"` em ordem alfabética |
| `docs/src/pages/componentes/command.astro` | new | página de documentação seguindo layout `ComponentPreview` |
| `docs/src/previews/command.tsx` | new | preview components (BasicRow, WithIconsRow, EmptyStateRow, UseCasesRow) |
| `docs/src/pages/index.astro` | modified | `+1 line` — `"Command"` adicionado ao Set `MIGRATED` |
| `docs/adr/ADR-017-command-v0.1.0-dod-migration.md` | new | ADR cravando decisões (base primitive, API shape, token contract, a11y) |
| `package.json` | modified | `+1 dep` — `cmdk: ^1.1.1` |
| `package-lock.json` | modified | autogerado |

**Total estimado:** 8 arquivos novos + 3 modificados.

## Base primitive — escolha

| Opção | Prós | Contras | Decisão |
|---|---|---|---|
| **`cmdk`** (Vercel/Radix-aligned) | API React-first; filter heurístico nativo; keyboard nav acessível; Suspense-ready; ~3kb gz; padrão de fato (Linear, Vercel, Raycast Web) | dep externa adicional | ✅ **Escolhido** |
| Implementar do zero | zero dep | reimplementar fuzzy filter, keyboard nav, ARIA roles, virtualization potencial — alto custo, baixo retorno | ❌ |
| Composto Radix manual (Popover + custom list) | reuso de stack já presente | sem filter heurístico nativo; sem `cmdk` ergonomics — produz API divergente do mercado | ❌ |

Justificativa: `cmdk` é o equivalente Radix do mundo Command Palette — mesma equipe, mesma filosofia (headless + acessível + ergonômico). Adicionar 1 dep para resolver um problema bem definido com qualidade superior à reimplementação.

## Wrapper architecture

```
<CommandPalette open onOpenChange items placeholder emptyText />
        │
        ├── <Dialog open onOpenChange>                  ← ADR-010 (focus trap, overlay, ESC, portal)
        │     └── <DialogContent className="p-0 max-w-[580px]">
        │           └── <Command>                       ← cmdk root (role="combobox" container)
        │                 ├── <CommandInput placeholder>  ← cmdk input (autofocus, role="combobox")
        │                 ├── <CommandList>             ← scroll container
        │                 │     ├── <CommandEmpty>{emptyText}</CommandEmpty>
        │                 │     └── items.map(group =>
        │                 │           <CommandGroup heading={group.heading}>
        │                 │             {group.entries.map(entry =>
        │                 │               <CommandItem onSelect={() => { entry.onSelect?.(); onOpenChange(false); }}>
        │                 │                 {entry.icon} {entry.label} {entry.description}
        │                 │                 {entry.shortcut && <CommandShortcut>{entry.shortcut}</CommandShortcut>}
        │                 │               </CommandItem>)}
        │                 │           </CommandGroup>)
        │                 └── (separador inferior opcional via <CommandSeparator>)
```

Primitivas declarativas (`Command`, `CommandInput`, `CommandList`, `CommandGroup`, `CommandItem`, `CommandSeparator`, `CommandEmpty`, `CommandShortcut`) também são re-exportadas para composição avançada (e.g. Isac suggestions embebidas, paleta sem Dialog para inline search).

## Token contract — sem expansão

Tokens consumidos (todos já presentes em `ui_kit/styles/index.css`):

| CVA slot | Token | WCAG (light) |
|---|---|---|
| Background da paleta | `--popover` | — |
| Texto base | `--popover-fg` | ≥ 4.5:1 |
| Border/separadores | `--border` | — |
| Entry destacada (selected/hover) | `bg-accent text-accent-foreground` | ≥ 4.5:1 |
| Placeholder / group heading / description | `--fg-muted` | ≥ 4.5:1 (texto secundário) |
| Backdrop (Dialog) | herdado de ADR-010 (overlay) | — |

Sem novos tokens. Sem cores hardcoded. Sem `text-destructive` em conteúdo (decisão de Stories — ações destrutivas usam ícone, não cor).

## ARIA mapping

| Slot | Role / atributos | Origem |
|---|---|---|
| `<Dialog>` | `role="dialog" aria-modal="true"` | Radix |
| `<CommandInput>` | `role="combobox" aria-expanded="true" aria-controls="<list-id>"` | cmdk |
| `<CommandList>` | `role="listbox"` | cmdk |
| `<CommandItem>` | `role="option" aria-selected` | cmdk |
| `<CommandEmpty>` | `role="presentation"` | cmdk |
| Label do input | `aria-label="Buscar comando"` (visualmente oculto, via `sr-only`) | wrapper |

Conformidade: `lex-frontend-accessibility` Rules 1, 2, 4.1, 6.3.

## Test strategy

Distribuição (per `lex-test-pyramid` adaptado para library de UI):

- **Unit (component test):** ≥ 20 testes em `Command.test.tsx` cobrindo AC-3 a AC-11, AC-17, AC-19, AC-20. Render real com `@testing-library/react`, sem mock de colaboradores internos.
- **A11y unit:** `axeInThemes` em 4 cenários × 2 temas = 8 invocações jest-axe (AC-18).
- **Visual regression:** rodada pela suite Playwright/Chromatic existente no CI (sem novo setup neste PR; baselines geradas via label `regenerate-baselines` se diff).

## Stacked PR analysis (Decision Checklist — `codex-stacked-prs`)

| Sinal | Valor | Observação |
|---|---|---|
| Diff > 800 LOC | provavelmente sim (~1200-1500 LOC) | componente + test + story + docs + ADR — total compacto |
| Cross-layer (infra + domain + UI) | não | só UI |
| 3+ independent reviewable units | não | unidade atômica (componente + chassis + docs juntos) |
| Histórico de migrações similares atômicas | **sim** | Toast PR #259, Drawer PR #258, Dialog PR #257, ConfidenceIndicator PR #256, Alert PR #255 — todos single-PR |

**Decisão:** PR único atômico. 1 sinal alto (diff size), 1 anti-sinal alto (histórico atômico), 0 sinais altos restantes → fora do threshold (≥ 3 sinais altos AND 0 anti-sinals). Mantém padrão da migração.

## Stack execution

Layer único:
1. `cmdk` install
2. `ui_kit/components/command/index.tsx`
3. `Command.test.tsx` (TDD ou imediato pós-componente)
4. `Command.stories.tsx`
5. `docs/src/previews/command.tsx`
6. `docs/src/pages/componentes/command.astro`
7. `index.ts` barrel + MIGRATED set
8. ADR-017 (accepted)
9. Quality gates (typecheck, lint, test, build, docs:build)
10. Commit atômico + PR
