# Phase 1 — Brief: `feat(toast): migrate Toast to v0.1.0 DoD`

- **Issue:** [#70](https://github.com/guardiatechnology/design-system/issues/70)
- **Plan sub-issue:** [#71](https://github.com/guardiatechnology/design-system/issues/71)
- **Author:** @fernandoseguim
- **Type:** Tech Task (parent), Plan sub-issue
- **Labels:** `evolvability ♻️`
- **Category:** Overlays
- **Epic pai:** [#13 — Design System v0.1.0 — full component migration to new DoD](https://github.com/guardiatechnology/design-system/issues/13)
- **Branch:** `feat/70-toast` · **Worktree:** `.worktrees/70-toast/`
- **Read at:** 2026-05-29

## Resumo

Migrar `Toast` ao DoD do v0.1.0 do `@guardia/design-system`, removendo o gap da categoria **Overlays** no catálogo de 52 componentes. O baseline atual é o legado `Sonner` (`ui_kit/components/sonner/`), que satisfaz o caso de uso mas:

- não expõe a API canônica `<ToastProvider>` + `useToast()` documentada na referência (`ux_references/ui_kits/components/Toast/`)
- não está alinhado às decisões de token de severidade aceitas em **ADR-011** (Alert) — `--success`, `--warning`, `--info`, `--danger` + variantes `*-soft` / `*-fg` + overrides escuros via `color-mix(in oklab, ...)`
- não tem página em `docs/src/pages/componentes/` nem entrada no Set `MIGRATED`
- não tem testes behavioral + jest-axe (light + dark) na cobertura mandatória do DoD

A migração consolida `Toast` como o canal canônico de **feedback transiente** no catálogo, fechando o triângulo com `Alert` (feedback persistente in-flow) e `Dialog` / `AlertDialog` (confirmação modal).

## Contexto Notion

O Plan #71 e a Tech Task #70 ancoram em quatro fontes Notion canônicas:

- [Branding (raiz)](https://www.notion.so/Branding-34536f91ebd280a69efacbadab3861c6)
- [Cores](https://www.notion.so/34536f91ebd28142a3f1e0e58fd62c4b) — paleta + hierarquia CTA (já refletida em `lex-brand-colors` § "CTA hierarchy by theme")
- [Tipografia](https://www.notion.so/34536f91ebd281b9b76ccc6159bfae69) — Poppins → Roboto fallback (`lex-brand-typography`)
- [Logomarca](https://www.notion.so/34536f91ebd2816f891ce73a5d47a789) — não aplicável ao Toast (componente sem logo)

A diretriz é **Notion prevalece** em caso de divergência com o espelho local (`lex-brand-*` / `codex-brand-*`). Para Toast, o espelho local já está alinhado a Notion após Alert #255 / ADR-011 — não é esperada divergência.

## Precedentes consultados

| Precedente | ADR | Resultado |
|---|---|---|
| **Alert #255 — feedback persistente in-flow** | [ADR-011](../../adr/ADR-011-alert-v0.1.0-dod-migration.md) | Família de tokens de tom expandida em `@theme inline` (`--color-success-*`, `--color-warning-*`, `--color-info-*`, `--color-danger-*`) + overrides dark via `color-mix(in oklab, <signal> 18%, gray-800)`. **Toast reutiliza inteiramente** — sem expansão de token. |
| Popover #237 | ADR-005 | Recipe API + CVA ladder + axeInThemes — precedente do padrão geral |
| Menu #239 | ADR-006 | Consolidação Sonner-like, eliminação do baseline shadcn — padrão de migração |
| Tooltip #240 | ADR-007 | Recipe inline sem Radix — não aplicável aqui (Toast precisa de Radix por causa de portal/queue) |
| Dialog #257 | ADR-010 | Radix wrapper, componente transiente — padrão para wrappers Radix |

## Sinais e unknowns

1. **`@radix-ui/react-toast` é a base canônica.** Resolve portal, queue, swipe-to-dismiss, focus management e ARIA live region semantics out of the box, e mantém paridade com Popover/Menu/Tooltip/Dialog na escolha por wrappers Radix. Decisão arquitetural a registrar em ADR-014 (alternativa: continuar com Sonner — rejeitada porque Sonner não cobre `position` configurável via prop, não expõe a API imperativa cataloguada na referência e duplica conceito com tokens próprios).
2. **API canônica da referência:** `<ToastProvider>` + `useToast()` com `toast.show({ type, title, description, duration, action })`. Esta é a API que os consumidores aprenderam no playground legado. Decisão a registrar em ADR-014: manter API imperativa + expor primitivos Radix declarativos (`Toast`, `ToastTitle`, `ToastDescription`, `ToastAction`, `ToastClose`, `ToastViewport`) para composição avançada.
3. **`role="status"` vs `role="alert"`** — Radix `Toast.Root` define `role` em função do `type` por default; vamos forçar `role="status"` (polite) para `info`/`success` e `role="alert"` (assertive) para `warning`/`error` per WAI-ARIA Live Regions spec. Isso casa com a decisão da Alert ADR-011 (cláusula 7).
4. **Auto-dismiss + persistente:** legado usa `duration: 0` para persistente; ADR-014 documenta semantic `duration: Infinity` (típico Radix) + alias `duration: 0` para compat.
5. **Stacking:** Radix `ToastViewport` gerencia naturalmente. Limite máximo simultâneo (`limit`) é decisão a registrar (proposta: 5 — alinhado com Sonner).
6. **Sonner coexiste.** O export legado `ui_kit/components/sonner/` **continua** no barrel — não é escopo desta migração removê-lo. ADR-014 cláusula "Sonner deprecation" deixa explícito que Sonner segue como utility de mais alto nível (drop-in app-wide notifier) enquanto Toast é a primitiva DoD-completa.

## Próximos passos

Phase 2 — `02-requirements.md` numera os ACs.
Phase 3 — `03-architecture.md` + `docs/adr/ADR-014-toast-v0.1.0-dod-migration.md` registra a decisão Radix wrapper + API imperativa coexistindo com primitivos.
Gate 1 — auto-aprovação se o escopo casar com o DoD do Plan #71.
Phase 4 — implementação via `warrior-hephaestus`.
Phase 5/6 — security review + quality gate.
Phase 7 — PR único com `Closes #70` + `Closes #71`.
