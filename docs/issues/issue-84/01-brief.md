# Phase 1 — Brief: `feat(stepper): migrate Stepper to v0.1.0 DoD`

- **Issue:** [#84](https://github.com/guardiatechnology/design-system/issues/84)
- **Plan sub-issue:** [#85](https://github.com/guardiatechnology/design-system/issues/85)
- **Author:** @fernandoseguim
- **Type:** Tech Task (parent), Plan sub-issue
- **Labels:** `evolvability ♻️`
- **Category:** Navigation
- **Epic pai:** [#13 — Design System v0.1.0 — full component migration to new DoD](https://github.com/guardiatechnology/design-system/issues/13)
- **Branch:** `feat/84-stepper-v0.1.0-dod` · **Worktree:** `.claude/worktrees/agent-a0816b4a41ea3ca73/`
- **Read at:** 2026-05-29

## Resumo

Construir `Stepper` no DoD do v0.1.0 do `@guardia/design-system`. O componente não existe no `ui_kit/components/` atual — está apenas no catálogo aspiracional (`docs/src/pages/index.astro` lista `Stepper` na nav, mas o slug não rende página). O baseline canônico vive em `ux_references/ui_kits/components/Stepper/` (referência legacy: `index.tsx` + `index.css` + `Stepper.playground.html`), construído como prefixed-class CSS (`grd-st-*`) sobre um `(window as any).Icon`. A migração v0.1.0 DoD reescreve a API para React + Tailwind v4 + CVA + tokens semânticos, mantendo paridade de API/visual com a referência.

Stepper fecha a categoria **Navigation** com o componente que sinaliza progresso multi-etapa — onboarding (conectar banco → importar → configurar regras → revisar), fluxos transacionais no Copilot Isac (selecionar → validar → confirmar) e processamento longo (upload → parse → match → fechamento). Sem ele, fluxos guiados do produto não têm primitiva de catálogo e cada consumidor reinventa.

## Contexto Notion

O Plan #85 e a Tech Task #84 ancoram em quatro fontes Notion canônicas:

- [Branding (raiz)](https://www.notion.so/Branding-34536f91ebd280a69efacbadab3861c6)
- [Cores](https://www.notion.so/34536f91ebd28142a3f1e0e58fd62c4b) — paleta + hierarquia CTA (já refletida em `lex-brand-colors` § "CTA hierarchy by theme")
- [Tipografia](https://www.notion.so/34536f91ebd281b9b76ccc6159bfae69) — Poppins → Roboto fallback (`lex-brand-typography`)
- [Logomarca](https://www.notion.so/34536f91ebd2816f891ce73a5d47a789) — não aplicável ao Stepper (componente sem logo)

A diretriz é **Notion prevalece** em caso de divergência com o espelho local (`lex-brand-*` / `codex-brand-*`). Para Stepper, o espelho local já está alinhado a Notion após Alert #255 / ADR-011 — não é esperada divergência. O marker do step `current` consome `--color-primary` (violet 500 em light, orange 500 em dark) — Notion-canonical CTA chain.

## Precedentes consultados

| Precedente | ADR | Resultado |
|---|---|---|
| **Alert #255 — feedback persistente in-flow** | [ADR-011](../../adr/ADR-011-alert-v0.1.0-dod-migration.md) | Família de tokens de tom (`--color-danger-*`) usada no estado `error` do Stepper. Sem expansão de token. |
| **Toast #259 — feedback transiente** | [ADR-014](../../adr/ADR-014-toast-v0.1.0-dod-migration.md) | Recipe canônica Radix-free para componentes "puros" (sem portal). Não usa Radix, mas herda padrão de CVA + axeInThemes + Astro page. |
| **Dialog #257** | [ADR-010](../../adr/ADR-010-dialog-v0.1.0-dod-migration.md) | Padrão wrapper para Radix; Stepper não usa Radix (não há primitiva Radix Stepper canônica). |
| **ConfidenceIndicator #256** | [ADR-013](../../adr/ADR-013-confidence-indicator-v0.1.0-dod-migration.md) | Componente Radix-free com CVA — precedente direto. Stepper segue mesmo molde. |
| **Tooltip #240** | [ADR-007](../../adr/ADR-007-tooltip-v0.1.0-dod-migration.md) | Recipe inline + CVA, sem Radix complexo. |

## Sinais e unknowns

1. **Sem primitiva Radix para Stepper.** Radix UI não publica `@radix-ui/react-stepper`. ARIA Authoring Practices (APG) sugere `<ol role="list">` + `aria-current="step"` no item ativo. Decisão a registrar em ADR-020: construir sem dependência Radix, espelhando estrutura da referência legacy.
2. **API da referência:** `Stepper({ steps, activeIndex, orientation, variant, size, onStepClick })` onde `steps` é `Step[]` com `id, title, description?, icon?, state?, meta?`. Estado computado: `pending | current | complete | error | loading` (referência usa `loading` para spinner inline). A v0.1.0 DoD preserva essa API; muda apenas o transport (Tailwind classes substituem `.grd-st-*`, `lucide-react` substitui `(window as any).Icon`).
3. **Orientações + variantes:** `orientation="horizontal" | "vertical"` × `variant="numbered" | "iconed" | "compact"` × `size="sm" | "md"` = 12 combinações renderizáveis. Storybook cobre as 4 principais (Horizontal Numbered, Vertical Numbered, Horizontal Iconed, Compact); a11y axe roda em 3 estados-chave × light + dark.
4. **Connector lines** (linha entre markers, ex: `─────●─────●─────`). Referência legacy usa `::after` posicionado absoluto. Migração v0.1.0 mantém o mesmo padrão CSS, mas via Tailwind arbitrary properties (`after:absolute after:top-3 after:left-[calc(50%+12px)] after:right-[calc(-50%+12px)] after:h-px after:bg-border`). Estados `complete`/`current`/`loading` pintam o connector com `bg-primary`; `pending` mantém `bg-border`.
5. **Loading state.** Step com `state="loading"` mostra spinner CSS animado (`@keyframes spin`). Não introduz dependência — usa `animate-spin` do Tailwind. Marker pintado com chain do `--primary` mais ring discreto (`ring-4 ring-primary/15`).
6. **Error state.** Pinta marker com `bg-danger-soft border-danger text-danger` (chain ADR-011); título do step em `text-danger`. Sem expansão de token.
7. **Clickable.** Quando `onStepClick` é passado, steps que NÃO estão `pending` ou `loading` viram `<button>` (em vez de `<div role="presentation">`). Hover/focus visible via `bg-primary/5` + `ring-2 ring-ring`. Steps `pending` permanecem não clicáveis (a11y: usuário não pula etapas).
8. **`compact` variant** renderiza apenas bolinhas (dots) com conectores; sem `title`/`description`. Útil para indicador minimalista em headers / wizards densos.
9. **Coverage CSS-in-class.** A migração elimina `index.css` separado — todas as classes ficam inline via CVA/Tailwind. Connector via Tailwind arbitrary `after:` selectors; spinner via `animate-spin`. Zero CSS file produzido por Stepper.

## Próximos passos

Phase 2 — `02-requirements.md` numera os ACs.
Phase 3 — `03-architecture.md` + `docs/adr/ADR-020-stepper-v0.1.0-dod-migration.md` registra a decisão Radix-free + API espelhando referência legacy.
Gate 1 — auto-aprovação se o escopo casar com o DoD do Plan #85 (modo Athena paralela autorizado).
Phase 4 — implementação atômica (este warrior).
Phase 5/6 — security review + quality gate.
Phase 7 — PR único com `Closes #84` + `Closes #85`.
