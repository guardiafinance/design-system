# Phase 3 — Architecture: `Toast` v0.1.0 DoD

- **Issue:** [#70](https://github.com/guardiatechnology/design-system/issues/70)
- **Plan sub-issue:** [#71](https://github.com/guardiatechnology/design-system/issues/71)
- **Requirements:** [`02-requirements.md`](./02-requirements.md)
- **ADR:** [`docs/adr/ADR-014-toast-v0.1.0-dod-migration.md`](../../adr/ADR-014-toast-v0.1.0-dod-migration.md)
- **Drafted at:** 2026-05-29

## Componentes afetados (scope binding)

A tabela abaixo lista todos os arquivos a serem criados ou modificados. Qualquer arquivo fora desta tabela é scope creep e bloqueia Gate 2 (`lex-issue-driven` Regra 6).

| Arquivo | Operação | Stack | AC ancorado |
|---|---|---|---|
| `ui_kit/components/toast/index.tsx` | criar | React + Radix Toast + CVA | AC-1, AC-3..AC-14 |
| `ui_kit/components/toast/Toast.test.tsx` | criar | Vitest + Testing Library + jest-axe | AC-15..AC-22 |
| `ui_kit/components/toast/Toast.stories.tsx` | criar | Storybook | AC-19, AC-20 |
| `ui_kit/components/index.ts` | modificar (add 1 linha) | barrel | AC-2 |
| `docs/src/pages/componentes/toast.astro` | criar | Astro `ComponentPreview` | AC-23 |
| `docs/src/previews/toast.tsx` | criar | React preview | AC-24 |
| `docs/src/pages/index.astro` | modificar (add `"Toast"` no Set `MIGRATED`) | catálogo | AC-25 |
| `docs/adr/ADR-014-toast-v0.1.0-dod-migration.md` | criar | ADR (simplified MADR) | AC-26 |
| `package.json` | modificar (add `@radix-ui/react-toast` dependency) | npm | AC-1 (Radix base) |
| `package-lock.json` | modificar (autogen) | npm | — |
| `docs/issues/issue-70/01-brief.md` | criado em Phase 1 | flow | — |
| `docs/issues/issue-70/02-requirements.md` | criado em Phase 2 | flow | — |
| `docs/issues/issue-70/03-architecture.md` | este | flow | — |
| `docs/issues/issue-70/05-security-review.md` | a criar em Phase 5 | flow | — |
| `docs/issues/issue-70/06-quality-report.md` | a criar em Phase 6 | flow | — |

Arquivos **não tocados**:

- `ui_kit/components/sonner/` — Sonner é legado coexistente. Out-of-scope explícito do Plan DoD.
- `ui_kit/components/alert/` — Tokens de tom já cravados por ADR-011; sem mudança.
- `ui_kit/styles/index.css` — Tokens já cravados por ADR-011 cobrem todas as combinações que Toast precisa.

## Diagrama de composição

```
<ToastProvider position="bottom-right" duration={5000} limit={5}>
  <App />
  └─ qualquer componente da árvore pode chamar useToast()
  └─ <ToastViewport /> auto-renderizado (oculto via portal até items)
     └─ <Toast.Root> (Radix root, role conforme tone)
        ├─ <ToastIcon /> [opcional, slot leading via composição]
        ├─ <ToastTitle> (Radix `Title`)
        ├─ <ToastDescription> (Radix `Description`)
        ├─ <ToastAction altText="..."> (Radix `Action`, opcional)
        └─ <ToastClose /> (Radix `Close`)
</ToastProvider>
```

A API imperativa `useToast()` é um wrapper sobre um `React.useReducer` que mantém a fila e dispara `<Toast.Root>` controlado via `open` prop. Radix `Toast.Provider` lida com `swipe`, `pause-on-hover`, `pause-on-focus`, `keyboard navigation`, `aria-live`.

## Tokens consumidos (todos via `@theme inline` já em main)

| Token CSS var | Light | Dark | Origem |
|---|---|---|---|
| `--color-info-soft` | `#D9E3F7` | `color-mix(in oklab, #004AAD 24%, gray-800)` | ADR-011 |
| `--color-info` | `var(--signal-blue)` (`#004AAD`) | mesmo | ADR-011 |
| `--color-info-fg` | `#002E6B` | `var(--mono-white)` | ADR-011 |
| `--color-success-*` | idem ADR-011 | idem ADR-011 | ADR-011 |
| `--color-warning-*` | idem ADR-011 | idem ADR-011 | ADR-011 |
| `--color-danger-*` | idem ADR-011 | idem ADR-011 | ADR-011 |
| `--background`, `--border`, `--popover` | já tokenizados | já tokenizados | infra prévia |
| `--ring` | já tokenizado | já tokenizado | infra prévia |

**Nenhuma expansão de token é necessária.** Esta é a economia direta de ter mantido escopo enxuto em ADR-011: Toast cai pronto no chassis.

## CVA — `toastVariants`

Idêntica recipe ao Alert (ADR-011 cláusula 1):

```tsx
const toastVariants = cva(
  [
    "group pointer-events-auto relative flex w-full items-start gap-3",
    "overflow-hidden rounded-lg border p-4 pr-6 shadow-lg",
    "font-sans",
    // Animations — Radix forwarder estados
    "data-[state=open]:animate-in data-[state=closed]:animate-out",
    "data-[swipe=end]:animate-out",
    "data-[state=closed]:fade-out-80",
    "data-[state=open]:slide-in-from-bottom-full",
    "data-[state=open]:sm:slide-in-from-bottom-full",
    "data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)]",
    "data-[swipe=cancel]:translate-x-0",
    "data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)]",
    "data-[swipe=end]:transition-none",
  ].join(" "),
  {
    variants: {
      tone: {
        info: "bg-info-soft border-info text-info-fg",
        success: "bg-success-soft border-success text-success-fg",
        warning: "bg-warning-soft border-warning text-warning-fg",
        error: "bg-danger-soft border-danger text-danger-fg",
      },
    },
    defaultVariants: { tone: "info" },
  },
);
```

## Viewport positioning

```tsx
const VIEWPORT_POSITION_CLASSES: Record<ToastPosition, string> = {
  "bottom-right":  "bottom-0 right-0 sm:right-4 sm:bottom-4",
  "bottom-left":   "bottom-0 left-0  sm:left-4  sm:bottom-4",
  "top-right":     "top-0    right-0 sm:right-4 sm:top-4",
  "top-left":      "top-0    left-0  sm:left-4  sm:top-4",
  "bottom-center": "bottom-0 left-1/2 -translate-x-1/2 sm:bottom-4",
  "top-center":    "top-0    left-1/2 -translate-x-1/2 sm:top-4",
};
```

`ToastViewport` é renderizado via `Radix.Viewport` e roteia para o classe correspondente.

## API imperativa — máquina de estados

```
Initial: items=[], queue=[]

show({ tone, title, ... }) →
  if items.length < limit:    items = [...items, t]; schedule auto-dismiss if duration finite
  else:                        queue = [...queue, t]

dismiss(id) →
  items = items.filter(x => x.id !== id)
  if queue.length > 0:        items = [...items, queue[0]]; queue = queue.slice(1)

dismissAll() →
  items = []; queue = []

Auto-dismiss timer:           setTimeout( dismiss(id), duration ) — paused on hover/focus
                              (delegado ao Radix `Toast.Root` que já implementa via duration prop)
```

## Stacked PR Decomposition

**Não aplicável.** Esta migração é uma feature atômica única conforme o Plan #71 DoD ("**1** — PR atômico único conforme `lex-agent-planning`"). Decision Checklist em `codex-stacked-prs`: sinais altos para empilhamento = 0 (single bounded context, single CVA file, single test file, single doc page, atomic ADR). Não há valor em dividir.

## Análise de risco

| Risco | Mitigação |
|---|---|
| `@radix-ui/react-toast` introduz nova dependência transitória | Já está no mesmo monorepo Radix; pin `^1.x.x` consistente com `radix-tooltip` `^1.2.8` |
| Animations CSS dependentes de `tailwindcss-animate` plugin | Plugin já consumido por Dialog/Popover/Tooltip — utility classes já compiladas |
| `ToastProvider` precisar de provider envolvendo a App (mudança de superfície) | Documentado em ADR-014; consumidores existentes do Sonner não são impactados (Sonner intacto) |
| `useToast` lançar em render fora do Provider | Erro descritivo paridade com `useAlertContext` (Alert ADR-011 § 5) |
| Empilhamento de toasts disparados em paralelo gerar race condition no test | `vi.useFakeTimers()` + `act()` para controle determinístico |
| Auto-dismiss e teste flake | Radix expõe `duration` por toast; testes usam timers fake e `vi.advanceTimersByTime()` |
| Visual baseline existing para legacy `Default` (sonner) divergir | Não auto-aplicar `regenerate-baselines`; baseline review manual depois do merge |

## Delegação

- **Phase 4:** `warrior-hephaestus` — implementação frontend per recipe ADR-011 mirror.
- **Phase 5:** Athena conduz a security review inline (componente UI puro, sem rede, sem storage; risco superficial baixo).
- **Phase 6:** Athena conduz quality gate inline.

## Checkpoint de Gate 1

Gate 1 verifica:

- [x] Brief produzido (`01-brief.md`)
- [x] ACs numerados (29 ACs em `02-requirements.md`)
- [x] Arquivos afetados listados (scope binding)
- [x] ADR-014 reservado e justificado
- [x] Plano stacked-PRs avaliado e rejeitado com fundamento
- [x] Tokens consumidos verificados como já existentes (ADR-011)
- [x] Riscos identificados e mitigados

**Status:** pronto para Gate 1 auto-approval (escopo casa com Plan #71 DoD ponto-a-ponto).
