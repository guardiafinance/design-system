# ADR-020 — Migrate Stepper to v0.1.0 DoD (Navigation/Progress indicator)

- **Status:** accepted
- **Date:** 2026-05-29
- **Deciders:** @fernandoseguim (CODEOWNER), `warrior-athena` (Issue-Driven flow orchestrator)
- **Precedents:** ADR-007 (Tooltip), ADR-011 (Alert — danger token chain), ADR-013 (ConfidenceIndicator — Radix-free CVA recipe), ADR-014 (Toast — flow recipe)
- **Issue:** [#84](https://github.com/guardiatechnology/design-system/issues/84)
- **Plan:** [#85](https://github.com/guardiatechnology/design-system/issues/85)

## Context

`Stepper` é o indicador canônico de **progresso em fluxo multi-etapa** no catálogo Navigation. Não existe no `ui_kit/components/` atual — o nome aparece em `docs/src/pages/index.astro` apenas como navigation placeholder (slug `stepper` sem página correspondente). O baseline canônico vive em `ux_references/ui_kits/components/Stepper/` como CSS-prefixed (`.grd-st-*`) sobre um `(window as any).Icon` global. A construção do componente v0.1.0 DoD do zero (não há baseline shadcn ou outra primitiva) precisa cravar 5 decisões arquiteturais em ADR antes do código:

1. **Escolha de base primitive** — Radix UI vs primitiva própria.
2. **Modelo de API** — prop-driven (`steps` array) vs composição declarativa (`<Stepper.Step>`).
3. **Estados suportados** e como o ARIA é mapeado para cada um.
4. **Estratégia de connector** — linha entre markers em horizontal vs vertical.
5. **Token contract** — quais chains alimentam cada estado.

Stepper é primitiva de produto (onboarding "conectar banco → importar → configurar regras → revisar", fluxos do Copilot Isac "selecionar → validar → confirmar", processamento longo "upload → parse → match → fechamento"); decisões aqui propagam para todo flow guiado.

## Decision

Construir `Stepper` v0.1.0 DoD seguindo o recipe **ConfidenceIndicator (ADR-013) + Tooltip (ADR-007)** — componente Radix-free com CVA + tokens semânticos:

1. **Base primitive — nenhuma (Radix-free).** Não existe `@radix-ui/react-stepper`; o `Stepper` da APG é uma `<ol>` com `aria-current="step"` no item ativo, padrão que cai abaixo do que ARIA já garante nativamente. Construímos a primitiva com `<ol role="list" aria-label="Progresso">` + `<li>` por step. Zero nova dependência.

2. **API prop-driven (espelhando referência legacy):**
   ```tsx
   <Stepper
     steps={[
       { id: "1", title: "Conectar banco", description: "Itaú · Bradesco" },
       { id: "2", title: "Importar", state: "loading" },
     ]}
     activeIndex={0}
     orientation="horizontal" | "vertical"
     variant="numbered" | "iconed" | "compact"
     size="md" | "sm"
     onStepClick={(i, step) => ...}
   />
   ```
   - **Rejeita composição filho-a-filho** (`<Stepper><Step>...<Step></Stepper>`). A referência legacy é prop-driven; mudar a API quebra paridade cognitiva com o playground e cria divergência sem ganho — composição é útil quando os filhos têm renderização heterogênea (Dialog header/body/footer), mas Stepper steps são homogêneos (sempre marker + body).
   - Tipo `Step` exposto publicamente; consumidores tipam suas listas explicitamente.

3. **5 estados por step:** `pending` (default) · `current` · `loading` · `complete` · `error`.
   - `step.state` explícito tem prioridade.
   - Quando ausente, deriva de `activeIndex`: `index < activeIndex` → `complete`, `index === activeIndex` → `current`, `index > activeIndex` → `pending`.
   - `loading` e `error` exigem flag explícita — não há derivação implícita.

4. **ARIA mapping explícito por estado:**
   - `current` → `<li aria-current="step">` no item; marker com `ring-4 ring-primary/15`.
   - `loading` → spinner `<span role="status" aria-label="carregando" />` dentro do marker.
   - `error` → ícone X + cor (`text-danger`); título em `text-danger` (color is NOT the only indicator — `lex-frontend-accessibility` Rule 5.4).
   - `complete` → ícone Check + cor; connector trailing em `bg-primary`.
   - `pending` → marker neutro (`bg-card border-border text-fg-muted`).
   - Marker em si carrega `aria-hidden="true"` — número/ícone é decorativo; o título do step é a label real.

5. **Token contract — Notion-canonical + ADR-011 reuse:**
   | Estado | Marker | Title | Connector trailing |
   |---|---|---|---|
   | `pending` | `bg-card border-border text-fg-muted` | `text-fg-muted` | `bg-border` |
   | `current` | `bg-primary border-primary text-primary-foreground ring-4 ring-primary/15` | `text-primary` | `bg-primary` |
   | `loading` | `bg-primary/10 border-primary text-primary ring-4 ring-primary/15` (+spinner) | `text-primary` | `bg-primary` |
   | `complete` | `bg-primary border-primary text-primary-foreground` | `text-fg` | `bg-primary` |
   | `error` | `bg-danger-soft border-danger text-danger` | `text-danger` | `bg-border` |

   `--primary` é Notion-canonical CTA chain (violet 500 em light, warm-orange 500 em dark — `lex-brand-colors` § "CTA hierarchy by theme"). `--danger*` chain vem de ADR-011. **Zero expansão de token.**

6. **Connector strategy.**
   - **Horizontal:** cada `<li>` que não é último renderiza `::after` absoluto entre o marker do step atual e o do próximo (`top-3 left-[calc(50%+12px)] right-[calc(-50%+12px)] h-px`). Para `size="sm"` os offsets caem para `top-2.5 left-[calc(50%+10px)] right-[calc(-50%+10px)]`.
   - **Vertical:** `::after` posicionado abaixo do marker descendo até o próximo (`top-7 bottom-0 left-3 w-px` para `md`, `top-6 left-[10px]` para `sm`).
   - **Compact horizontal:** connector menor (`top-1/2 -translate-y-1/2`); markers reduzidos a 14×14.
   - Connector cor: `bg-primary` quando o step que origina é `complete` / `current` / `loading`; caso contrário `bg-border`.

7. **Clickable behavior.**
   - `onStepClick` ausente → todos os steps `<div role="presentation">` (não clicáveis).
   - `onStepClick` presente + step em `current` / `complete` / `error` → `<button type="button">` com hover (`bg-primary/5`) e focus-visible (`ring-2 ring-ring`).
   - `onStepClick` presente + step em `pending` ou `loading` → `<div>` não clicável (usuário não deve pular adiante; loading está em curso).
   - Decisão sobre `error` clicável: **SIM** — usuário precisa revisitar o step para corrigir. Documentado em AC-16.

8. **Variants × Orientations × Sizes.**
   - `variant="numbered"` (default) — `i+1` dentro do marker, fallback universal.
   - `variant="iconed"` — `step.icon` (React component, lucide-react-shaped) renderiza dentro do marker; cai para número se ícone ausente.
   - `variant="compact"` — apenas markers (sem body), connectors centrados verticalmente. Útil para wizards densos / progress bar minimalista.
   - `size="md"` / `size="sm"` afeta marker (24/20px), font-size (12/11px) e connector offsets.

9. **a11y coverage (`axeInThemes`)** sobre 4 cenários × 2 temas = **8 invocações jest-axe** explícitas em `Stepper.test.tsx`:
   - Horizontal Numbered (3 steps, activeIndex=1) — Default scenario.
   - Vertical Iconed com step `loading` — exercita Spinner + role=status.
   - Horizontal Numbered com 1 step `error` — exercita color-is-not-only-indicator.
   - Horizontal Compact — exercita variant mínima.

10. **ADR `accepted` desde o primeiro commit.** Commit atômico carrega código + ADR + docs juntos. Sem pattern `proposed → accepted` (Argos sinalizou 🟡 quando esse pattern foi seguido em PR #237, confirmado em ADR-014 cláusula 9).

## Consequences

### Positive

- Stepper alcança paridade DoD com Toast / Dialog / Alert / Popover / Tooltip / ConfidenceIndicator (mesmo recipe Tailwind+CVA, mesmo token contract, mesmo rigor de teste).
- Reutilização integral de tokens existentes (`--color-primary*` Notion-canonical + `--color-danger*` ADR-011) — demonstra retorno do investimento dessas expansões.
- API espelha referência legacy — onboarding de consumidores conhecidos é zero-friction.
- Zero nova dependência — `lucide-react` já é dep, sem Radix-stepper porque não existe oficial.
- Catálogo Navigation avança 1 componente em direção ao 52 do v0.1.0.

### Negative

- **API prop-driven não permite renderização heterogênea de step** (e.g. um step com um `<Input>` inline). Mitigação: campo `step.meta?: React.ReactNode` na referência legacy é mantido apenas para orientação `vertical` + estado `current`/`loading` — slot opcional para conteúdo inline (botão, input, helper). Documentado nas stories.
- Connector via Tailwind arbitrary properties (`after:left-[calc(50%+12px)]`) tem 4 variantes hardcoded (md/horizontal, sm/horizontal, md/vertical, sm/vertical, +compact). Custo: ~30 linhas de class strings inline; mitigação: cobertura visual via Storybook stories.

### Neutral

- 6 arquivos novos (`index.tsx`, `Stepper.test.tsx`, `Stepper.stories.tsx`, `stepper.astro`, `stepper.tsx` preview, `ADR-020.md`) + 2 modificados (barrel, MIGRATED set). Total: ~8 arquivos tocados.
- Stepper é primeira primitiva Navigation 100% Radix-free (ConfidenceIndicator é "indicator" não navigation). Padrão fica disponível para Breadcrumb v0.1.0 quando vier.

## Alternatives considered

1. **Adotar `@radix-ui/react-progress` como base.** Rejeitado — Progress é primitiva linear (preenchimento de barra), não multi-step. Forçar Stepper sobre Progress é semantic mismatch.

2. **Composição `<Stepper><Step state="current">...</Step></Stepper>`.** Rejeitado — quebra paridade com a referência legacy e oferece zero ganho para steps homogêneos. Adicionaria `Stepper` + `Step` + `StepMarker` + `StepBody` + `StepConnector` ao surface público (5 símbolos) sem necessidade real.

3. **Construir um wrapper sobre `<progress>` elemento HTML5.** Rejeitado — `<progress>` é unilinear contínuo, não enumerável discreto. Não modela `pending/current/complete/error`.

4. **Spinner customizado via SVG inline em vez de `animate-spin`.** Rejeitado — `animate-spin` do Tailwind v4 (`@keyframes spin`) já está em uso pelo `Spinner` e cobre o caso sem novo CSS keyframe.

5. **Connector via flexbox separator** (item entre cada step). Rejeitado — quebra a semântica `<ol><li>` e cria items "não-step" na lista (screen reader anunciaria "lista de 7 itens" para uma stepper de 4 steps).

6. **Mapear `current` → `aria-current="true"` em vez de `aria-current="step"`.** Rejeitado — APG (ARIA Authoring Practices) e WAI-ARIA 1.2 documentam `step` como valor canônico para steppers. `true` é genérico (página, location).

7. **Step `pending` clicável quando `onStepClick` é passado.** Rejeitado — usuário não deve pular etapas em fluxos guiados (onboarding obrigatório, validação em cadeia). Se um produto precisa de "free navigation", composto via `Tabs` ou navegação custom.

## Implementation note (acceptance criteria mapping)

| ADR clause | Plan AC |
|------------|---------|
| 1. Radix-free base | AC-2 (surface), AC-3 (displayName) |
| 2. Prop-driven API + Step type | AC-1, AC-2 |
| 3. 5 estados + derivação de activeIndex | AC-10..AC-15 |
| 4. ARIA mapping por estado | AC-11 (`aria-current`), AC-14 (loading role=status), AC-13/AC-19 (color-not-only) |
| 5. Token contract Notion + ADR-011 | AC-10..AC-14, AC-19 |
| 6. Connector strategy + variants | AC-4, AC-5, AC-8 (compact) |
| 7. Clickable behavior | AC-16, AC-17, AC-18 |
| 8. Variants × orientations × sizes | AC-4..AC-9 |
| 9. axeInThemes coverage ≥ 4 scenarios | AC-20..AC-23 |
| 10. Accepted at first commit | AC-27 |
