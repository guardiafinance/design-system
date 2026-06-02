# Phase 2 — Requirements: `Stepper` v0.1.0 DoD

- **Issue:** [#84](https://github.com/guardiatechnology/design-system/issues/84)
- **Plan sub-issue:** [#85](https://github.com/guardiatechnology/design-system/issues/85)
- **Brief:** [`01-brief.md`](./01-brief.md)
- **Drafted at:** 2026-05-29

## Acceptance Criteria

Cada AC abaixo é numerado e referenciado pelos testes em `Stepper.test.tsx` via prefixo `AC-N:` no `it(...)`, satisfazendo `lex-issue-driven` Regra 3 (rastreabilidade bidirecional AC ↔ teste).

### Public surface

- **AC-1:** O barrel `ui_kit/components/index.ts` exporta `Stepper` e o tipo público `Step`, `StepState`, `StepperProps` a partir de `./stepper`.
- **AC-2:** O módulo `ui_kit/components/stepper/index.tsx` exporta exatamente 1 componente público (`Stepper`) + 1 accessor CVA (`stepperMarkerVariants`) + 4 tipos (`Step`, `StepState`, `StepperOrientation`, `StepperVariant`).
- **AC-3:** `Stepper.displayName === "Stepper"` para devtools.

### Variantes (CVA + composição de props)

- **AC-4:** `orientation="horizontal"` (default) renderiza os steps em flex-row com connectors horizontais (`::after`) entre items.
- **AC-5:** `orientation="vertical"` renderiza em flex-col com connectors verticais.
- **AC-6:** `variant="numbered"` (default) mostra `i+1` dentro do marker.
- **AC-7:** `variant="iconed"` consome `step.icon` (componente React, `lucide-react`-shaped) e renderiza o ícone dentro do marker; cai para número se `icon` não vier.
- **AC-8:** `variant="compact"` renderiza apenas o marker (bolinha) sem body (`title`/`description`).
- **AC-9:** `size="md"` (default) marker 24×24; `size="sm"` marker 20×20.

### Estados

- **AC-10:** Estado `pending` (default) — marker `bg-card border-border text-fg-muted`; título em `text-fg-muted` peso 500.
- **AC-11:** Estado `current` — marker `bg-primary border-primary text-primary-foreground` com ring `ring-4 ring-primary/15`; título `text-primary` peso 600; `aria-current="step"` no `<li>`.
- **AC-12:** Estado `complete` — marker `bg-primary border-primary text-primary-foreground` com ícone `Check`; connector trailing pintado `bg-primary`.
- **AC-13:** Estado `error` — marker `bg-danger-soft border-danger text-danger` com ícone `X`; título em `text-danger`.
- **AC-14:** Estado `loading` — marker com spinner animado (`animate-spin`) substitui número/ícone; connector com `bg-primary` (mesmo que `current`).
- **AC-15:** `activeIndex` calcula o estado de cada step quando `step.state` não é passado: `index < activeIndex` → `complete`; `index === activeIndex` → `current`; `index > activeIndex` → `pending`. `step.state` explícito sempre sobrescreve o cálculo.

### Interatividade

- **AC-16:** Quando `onStepClick` é passado, steps em estado `current`, `complete` ou `error` renderizam `<button type="button">`; ao clicar, dispara `onStepClick(index, step)`.
- **AC-17:** Steps em estado `pending` ou `loading` NÃO renderizam `<button>` mesmo com `onStepClick` definido — renderizam `<div>` não clicável (a11y: usuário não pula etapas).
- **AC-18:** Quando `onStepClick` NÃO é passado, todos os steps renderizam `<div role="presentation">` (não clicáveis).

### Tokens semânticos (sem hardcode)

- **AC-19:** As classes de tom do marker NÃO contêm valores hex, `oklch()` ou nomes Tailwind crus (`text-red-500`, `bg-yellow-100`). Apenas tokens do chassis: `bg-primary`, `border-primary`, `text-primary-foreground`, `bg-danger-soft`, `border-danger`, `text-danger`, `bg-card`, `border-border`, `text-fg-muted`, `text-primary`, `text-danger`, `text-fg`, `ring-ring`, `ring-primary`.

### A11y (jest-axe light + dark)

- **AC-20:** `Stepper` em variante `Horizontal Numbered` (3 steps, activeIndex=1) passa em `axeInThemes(container)` (light + dark, 0 violations).
- **AC-21:** `Stepper` em variante `Vertical Iconed` com 1 step `loading` passa em `axeInThemes(container)` (light + dark, 0 violations).
- **AC-22:** `Stepper` com 1 step `error` passa em `axeInThemes(container)` (light + dark, 0 violations).
- **AC-23:** `Stepper` em `compact` orientação `horizontal` passa em `axeInThemes(container)` (light + dark, 0 violations).

### Storybook (light + dark)

- **AC-24:** `Stepper.stories.tsx` exporta `Default`, `Horizontal`, `Vertical`, `Iconed`, `Compact`, `States`, `Clickable`, `Loading`, `Sizes` — 9 stories renderizando corretamente em `light` e `dark` (toggle via `data-theme` no `<html>`).

### Documentação + catálogo

- **AC-25:** `docs/src/pages/componentes/stepper.astro` existe e renderiza usando `ComponentPreview` + previews React em `docs/src/previews/stepper.tsx`.
- **AC-26:** `"Stepper"` está adicionado ao `Set MIGRATED` em `docs/src/pages/index.astro`.

### ADR

- **AC-27:** `docs/adr/ADR-020-stepper-v0.1.0-dod-migration.md` existe com `Status: accepted` desde o primeiro commit, registra a decisão Radix-free + API espelhando referência legacy + estados/tokens/connectors.

## DoD

- Todos os 27 ACs verificados.
- `npm run typecheck && npm run lint && npm run test && npm run build && npm run docs:build` verde.
- Commit atômico único `feat(stepper): migrate Stepper to v0.1.0 DoD` conforme `lex-small-commits` e `lex-conventional-commits`.
- PR fecha `#84` e `#85` simultaneamente via `Closes #84` + `Closes #85`.

## Out of scope

- Implementar `<Stepper.Step>` declarativo (composição filho a filho) — referência legacy não tem, decisão de manter API por prop `steps` registrada em ADR-020.
- Animações de transição de estado entre steps (mudar de `pending` → `current` com motion). Fora do escopo; tokens estáticos.
- Suporte a múltiplos steps `current` simultâneos (multi-track). Fora do escopo; single-track linear.
- Refatorar `ux_references/ui_kits/components/Stepper/` — referência fica intocada.
