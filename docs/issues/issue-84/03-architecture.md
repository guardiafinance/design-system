# Phase 3 — Architecture: `Stepper` v0.1.0 DoD

- **Issue:** [#84](https://github.com/guardiatechnology/design-system/issues/84)
- **Plan sub-issue:** [#85](https://github.com/guardiatechnology/design-system/issues/85)
- **Requirements:** [`02-requirements.md`](./02-requirements.md)
- **ADR:** [`docs/adr/ADR-020-stepper-v0.1.0-dod-migration.md`](../../adr/ADR-020-stepper-v0.1.0-dod-migration.md)
- **Drafted at:** 2026-05-29

## Componentes afetados (scope binding)

A tabela abaixo lista todos os arquivos a serem criados ou modificados. Qualquer arquivo fora desta tabela é scope creep e bloqueia Gate 2 (`lex-issue-driven` Regra 6).

| Arquivo | Operação | Stack | AC ancorado |
|---|---|---|---|
| `ui_kit/components/stepper/index.tsx` | criar | React + Tailwind v4 + CVA + lucide-react | AC-1..AC-19 |
| `ui_kit/components/stepper/Stepper.test.tsx` | criar | Vitest + Testing Library + jest-axe | AC-1..AC-23 |
| `ui_kit/components/stepper/Stepper.stories.tsx` | criar | Storybook | AC-24 |
| `ui_kit/components/index.ts` | modificar (add 1 linha) | barrel | AC-1 |
| `docs/src/pages/componentes/stepper.astro` | criar | Astro `ComponentPreview` | AC-25 |
| `docs/src/previews/stepper.tsx` | criar | React preview | AC-25 |
| `docs/src/pages/index.astro` | modificar (add `"Stepper"` no Set `MIGRATED`) | catálogo | AC-26 |
| `docs/adr/ADR-020-stepper-v0.1.0-dod-migration.md` | criar | ADR (simplified MADR) | AC-27 |
| `docs/issues/issue-84/01-brief.md` | criado em Phase 1 | flow | — |
| `docs/issues/issue-84/02-requirements.md` | criado em Phase 2 | flow | — |
| `docs/issues/issue-84/03-architecture.md` | este | flow | — |
| `docs/issues/issue-84/05-security-review.md` | a criar em Phase 5 | flow | — |
| `docs/issues/issue-84/06-quality-report.md` | a criar em Phase 6 | flow | — |

Arquivos **não tocados**:

- `ux_references/ui_kits/components/Stepper/` — referência legacy intocada (ADR-020 espelha API/visual sem editar a referência).
- `ui_kit/styles/index.css` — todos os tokens necessários (`--color-primary*`, `--color-danger*`, `--color-border`, `--color-fg-muted`, `--color-card`, `--color-ring`) já cravados por ADR-011 + Notion mirror.
- `package.json` — `lucide-react` já é dependency (verificado via `grep "lucide-react" package.json`).

## Diagrama de composição

```
<Stepper
  steps={[
    { id: "1", title: "Conectar banco", description: "Itaú · Bradesco" },
    { id: "2", title: "Importar lançamentos", state: "loading" },
    { id: "3", title: "Configurar regras", icon: SlidersIcon },
    { id: "4", title: "Revisar" },
  ]}
  activeIndex={1}
  orientation="horizontal"
  variant="numbered"
  size="md"
  onStepClick={(i, step) => navigate(step.id)}
/>
└─ <ol aria-label="Progresso" role="list">
   └─ <li aria-current="step"?>
      ├─ <button|div> (clickable conforme state + onStepClick)
      │  ├─ <span> marker (24×24 or 20×20)
      │  │  └─ {number | Icon | Check | X | Spinner}
      │  └─ <div> body (omitido em compact)
      │     ├─ <span> title
      │     └─ <span> description?
      └─ ::after connector (next-sibling separator)
```

## Tokens consumidos (todos via `@theme inline` já em main)

| Token CSS var | Light | Dark | Origem |
|---|---|---|---|
| `--color-primary` | violet-500 (`#4F186D`) | warm-orange-500 (`#E07400`) | Notion CTA chain (`lex-brand-colors`) |
| `--color-primary-foreground` | `#FFFFFF` | `#FFFFFF` | Notion CTA chain |
| `--color-danger` | `#FF3131` (signal-red) | mesmo | ADR-011 |
| `--color-danger-soft` | `#FFE0E0` | `color-mix(in oklab, #FF3131 18%, gray-800)` | ADR-011 |
| `--color-border` | hsl `280 22% 91%` (`#E7E3EC`) | `240 9% 17%` (gray-700) | infra prévia |
| `--color-fg-muted` | gray-500 | gray-100 | infra prévia |
| `--color-card` | `#FFFFFF` | gray-700 surface | infra prévia |
| `--color-ring` | violet-500 | violet-500 | infra prévia |
| `--color-fg` | violet-900 | mono-white | infra prévia |

**Nenhuma expansão de token é necessária.** Stepper cai pronto no chassis Notion-aligned + ADR-011.

## CVA — `stepperMarkerVariants`

```tsx
const stepperMarkerVariants = cva(
  [
    "inline-flex shrink-0 items-center justify-center rounded-full",
    "border-[1.5px] font-sans font-semibold leading-none",
    "transition-[background-color,border-color,color,box-shadow] duration-150",
    "[font-feature-settings:'tnum']",
  ].join(" "),
  {
    variants: {
      state: {
        pending: "bg-card border-border text-fg-muted",
        current: "bg-primary border-primary text-primary-foreground ring-4 ring-primary/15",
        loading: "bg-primary/10 border-primary text-primary ring-4 ring-primary/15",
        complete: "bg-primary border-primary text-primary-foreground",
        error: "bg-danger-soft border-danger text-danger",
      },
      size: {
        sm: "size-5 text-[11px]",
        md: "size-6 text-xs",
      },
    },
    defaultVariants: { state: "pending", size: "md" },
  },
);
```

Connectors (orientação-dependente) e body classes ficam inline no JSX usando Tailwind arbitrary properties — não cabem em CVA porque dependem da posição (last item não desenha connector).

## ARIA mapping

- **`<ol aria-label="Progresso" role="list">`** — lista ordenada explícita; Voice/JAWS anunciam "lista de 4 itens".
- **`<li aria-current="step">`** apenas no item ativo (`state === "current"`). APG-compliant.
- **Marker `aria-hidden="true"`** — número/ícone é decorativo; o título do step carrega a label.
- **Loading marker** usa spinner `<span role="status" aria-label="carregando" />` quando o step é `loading`.
- **Clickable steps** renderizam `<button type="button">`; foco visível via `focus-visible:ring-2 focus-visible:ring-ring`. Por default, `<button>` é alcançável via Tab e ativável via Enter/Space (`lex-frontend-accessibility` Rule 2).
- **Color is not the only indicator** (`lex-frontend-accessibility` Rule 5.4):
  - `complete` → ícone Check + cor.
  - `error` → ícone X + cor + título em `text-danger`.
  - `loading` → spinner + cor + role=status.
  - `current` → `aria-current="step"` + ring + cor.

## Observability

`Stepper` é UI pura — sem novas runtime surfaces (endpoint HTTP, event consumer, background job). `lex-observability-required` Check 3 não se aplica.

## Risks

- **Connector via `::after` arbitrary properties Tailwind v4** — sintaxe `after:left-[calc(50%+12px)]` é Tailwind v4 nativo, mas o cálculo de offset depende do `size`. Mitigação: dois sets de classes connector (sm/md) via composição no JSX. Testado com snapshot visual no Storybook.
- **`onStepClick` em step `error`** — não está claro se step `error` deve ser clicável. Decisão: SIM, clicável (usuário pode querer revisitar o step que falhou para corrigir). Documentado em ADR-020.
- **Lucide-react dependency** — já está no `package.json` (verificado), zero novo peso de bundle.

## Validação

- TypeScript estrito (`noImplicitAny`, `strictNullChecks`) — `lex-frontend-typing`.
- jest-axe em 4 cenários × 2 temas = 8 invocações axe — `lex-frontend-accessibility`.
- Behavioral tests com `getByRole` / `getByText` (sem `getByTestId`) — `lex-frontend-testing`.
- Tokens semânticos apenas (assertion explícita em AC-19) — `lex-design-system-library`.
