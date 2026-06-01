# ADR-015 — Migrate Accordion to v0.1.0 DoD (Navigation parity)

- **Status:** accepted
- **Date:** 2026-05-29
- **Deciders:** @seguim (CODEOWNER), `warrior-athena` (Issue-Driven flow orchestrator)
- **Precedent:** ADR-007 (Tooltip v0.1.0 DoD migration), ADR-010 (Dialog v0.1.0 DoD migration)
- **Issue:** [#74](https://github.com/guardiatechnology/design-system/issues/74)
- **Plan:** [#75](https://github.com/guardiatechnology/design-system/issues/75)

## Context

The design-system rolled out the v0.1.0 Definition of Done across the Overlays category (Popover ADR-005, Tooltip ADR-007, Dialog ADR-010, Alert ADR-011, Drawer ADR-012, ConfidenceIndicator ADR-013, Toast ADR-014). The Navigation category opens with `Accordion`, currently a 58-line shadcn-style wrapper over `@radix-ui/react-accordion` that ships:

- One default story with no variant ladder.
- Two tests by transitivity (Radix passthrough only).
- Token contract using `border-b` (raw Tailwind) and `hover:underline` — neither aligned with the semantic palette enforced by `lex-brand-colors` nor with the Notion-canonical primary/secondary CTA hierarchy.
- No jest-axe coverage on `dark` (`data-theme="dark"`) — fails `feedback_a11y_unit_test_ac.md`.
- No paridade with the legacy bundle in `ux_references/ui_kits/components/Accordion/` (variants `bordered` / `plain`, chevron color flip on open, semantic surface `bg-card` + `border-border` + hover `bg-muted/40`).

The v0.1.0 DoD (codified in Issue #74 and Plan #75) requires every Navigation primitive to expose: 4-export shadcn composition (`Accordion` + `AccordionItem` + `AccordionTrigger` + `AccordionContent`), CVA `variant` ladder replicating legacy paridade, semantic tokens only (`border-border` + `bg-card` + `text-fg` + `text-primary` on open chevron + `ring` for focus-visible), controlled / uncontrolled parity, `disabled` support, ARIA `region` + `aria-expanded` wiring, keyboard navigation (Tab / Enter / Space / Arrow / Home / End), jest-axe on `light` AND `dark` for Default + Open + Disabled, ≥ 20 behavioral tests with AC traceability, and stories covering Default + Variants + Multiple + Disabled + Controlled.

## Decision

Accordion migrates to v0.1.0 DoD using **the same architectural recipe as Tooltip (ADR-007)** with one addition specific to Accordion's surface model (frame externo opt-in):

1. **4-export shadcn composition** — `Accordion`, `AccordionItem`, `AccordionTrigger`, `AccordionContent` are the canonical composition. `Accordion` is a direct passthrough of `AccordionPrimitive.Root` (no implicit Provider needed — Radix Accordion has no Provider in its surface) so the discriminated union (`type: "single" | "multiple"`) flows naturally through to the consumer with its full Radix typing.
2. **CVA `variant` ladder on `AccordionItem`** — `bordered` (default) carries `border-t first:border-t-0 bg-card`; `plain` carries `border-b last:border-b-0`. The frame is applied **on the Item** (not on the Root) because Radix expects flat children in the Root and the visual frame must use `:first-child` / `:last-child` selectors that only resolve naturally on the Item sequence. The container border for `bordered` (`rounded-lg border border-border bg-card overflow-hidden`) is **opt-in** on the consumer's Root className — this keeps the component composable for cases where it lives inside a `<Card>` or sidebar that already provides the frame, avoiding double borders. Trade-off discussed under "Alternatives considered" (#1).
3. **Semantic tokens only** — item surface = `border-border` + `bg-card` (bordered) or `border-border` (plain); trigger = `text-fg` + `hover:bg-muted/40` + `focus-visible:ring-ring`; chevron = `text-muted-foreground` (closed) → `text-primary` (open) — Notion-canonical (Violet in light, Orange in dark per `lex-brand-colors`); content = `text-fg`. Zero hardcoded hex, zero `--violet-*` legado, zero `bg-popover`, zero `border-b` raw without `border-border`.
4. **ChevronDown rotation via `group-data-[state=open]`** — the trigger receives `group` and the chevron `<svg>` consumes `group-data-[state=open]:rotate-180 group-data-[state=open]:text-primary`. Single transition class (`transition-all duration-200`) covers both transform and color — paridade visual com `grd-acc-item-open .grd-acc-trigger > :last-child { transform: rotate(180deg); color: var(--violet-600); }` da referência legada.
5. **Radix prop pass-through** — `type`, `value`, `defaultValue`, `onValueChange`, `collapsible`, `disabled`, `dir`, `orientation` flow into `Accordion`; `value`, `disabled` on `AccordionItem`; ARIA + keyboard handled by Radix (no shim). The only addition beyond the Radix surface is `variant?: "bordered" | "plain"` on `AccordionItem` (CVA).
6. **Animations consume existing `--animate-accordion-down` / `--animate-accordion-up`** declared in `ui_kit/styles/index.css` `@theme` — zero new token, zero new keyframe.
7. **A11y coverage** — `axeInThemes(container)` runs Default + Open + Disabled across `light` AND `dark` themes (3 cenários × 2 themes = 6 jest-axe invocations).
8. **ADR status `accepted` from creation** — no `proposed → accepted` flip at Phase 7. The atomic feat commit carries the migration code AND the accepted ADR together (precedent set by ADR-007).
9. **No new dependencies** — `@radix-ui/react-accordion` already declared in `package.json`.

## Consequences

### Positive

- Accordion reaches paridade with the rest of the v0.1.0 DoD catalog — same composition shape, same token vocabulary, same test rigor.
- The Navigation category opens with the canonical migration template — subsequent Navigation primitives (`Breadcrumbs`, `Pagination`, `Tabs`) inherit the recipe.
- Consumers importing `<Accordion>` from `@guardia/design-system` get predictable surface; the discriminated union (`single` / `multiple`) preserves Radix's type safety end-to-end.
- The `bordered` / `plain` ladder restores paridade visual with the legacy bundle (`grd-acc-bordered` / `grd-acc-plain`), satisfying the playground "está bom" requirement against `ux_references/ui_kits/components/Accordion/`.
- The chevron `text-muted-foreground → text-primary` flip on open is theme-aware via Notion-canonical primary token — Violet 500 on light (paridade com `--violet-600` legacy) and Warm Orange 500 on dark (where Violet fails contrast per ADR-011).
- AC↔test traceability matrix produced at Gate 2 inherits the Tooltip format (review burden is small).

### Negative

- The `bordered` frame is opt-in on the consumer Root className — consumers expecting a single `<Accordion variant="bordered">` API instead of two layers (Item variant + Root className for the frame) will need to read the docs once. Mitigation: the canonical pattern is documented in `docs/src/pages/componentes/accordion.astro` `<VariantsRow />` showing the exact className for the wrap. Alternative discussed under "Alternatives considered" (#1) — rejected for composability.
- Visual baseline regeneration (CI under `regenerate-baselines` label) is a manual ceremony, not avoidable.

### Neutral

- One file rewrite (`index.tsx` 58 → ~205 LOC), 1 stories file replacement (40 → ~210 LOC), 1 new behavioral test file (~570 LOC, 31 tests), 1 new astro doc page, 1 new preview file, 1 line in `docs/src/pages/index.astro` MIGRATED set, 1 new ADR. No new dependencies, no Tailwind config changes, no infra changes.

## Alternatives considered

1. **Move the frame container to `Accordion` (Root) via a `variant` prop on the Root** — rejected. Root is the discriminated union (`type: "single" | "multiple"`); adding `variant` would require widening the type surface beyond Radix's strict typing or wrapping the Root in a non-Radix component that drops typing. More importantly, the frame at Root level breaks composability — when Accordion lives inside a `<Card>` or sidebar that already provides the frame, the consumer gets double border. The opt-in container className keeps the component composable: `variant="plain"` (no frame) is the right choice inside a Card; `variant="bordered"` + frame className is the right choice for a standalone FAQ. Documenting the canonical pattern is cheaper than adding a non-composable Root variant.
2. **Hide the variant ladder and expose only `bordered`** — rejected. The legacy bundle (`grd-acc-bordered` / `grd-acc-plain`) ships both; consumer code that lives inside Cards needs `plain`. Removing `plain` would force consumers to either reach into raw Radix Accordion or accept visual debt.
3. **Use `hover:bg-violet-50`** (paridade literal com legacy `.grd-acc-trigger:hover { background: var(--violet-50); }`) — rejected. `--violet-*` are legacy tokens being retired (per `lex-brand-colors` Notion-canonical alignment); `bg-muted/40` is the semantic equivalent that flips correctly between light and dark themes without manual override.
4. **Bump trigger typography to `text-base`** — rejected. Trigger lives in a vertically compact panel header; `text-sm` matches the rest of the v0.1.0 ladder (Tooltip `md` = `text-sm`, Dialog title contexto compatível) and preserves visual density that the legacy reference already established (`font-size: 14px`).
5. **Stack PRs** — rejected. Decision Checklist (codex-stacked-prs) returns 1 high signal (5+ files touched: index/stories/test/astro/preview + ADR + MIGRATED) + 4 strong anti-signals (single atomic component migration, single ADR, single reviewer, no shared kernel touched) → single PR per the precedent set by ADR-007 (Tooltip), ADR-010 (Dialog), ADR-011 (Alert), ADR-012 (Drawer), ADR-013 (ConfidenceIndicator), ADR-014 (Toast).

## References

- ADR-007 — Tooltip v0.1.0 DoD migration (precedent for shadcn-style Radix wrapper)
- ADR-010 — Dialog v0.1.0 DoD migration (precedent for multi-export composition)
- ADR-011 — Alert v0.1.0 DoD migration (precedent for Notion-canonical token chain)
- ADR-012 — Drawer v0.1.0 DoD migration (precedent for atomic feat + ADR commit)
- ADR-014 — Toast v0.1.0 DoD migration (most recent precedent in the rollout)
- PR [#259](https://github.com/guardiatechnology/design-system/pull/259) — Toast migration (freshest playbook)
- `lex-design-system-library` — mandatory consumption of design-system primitives
- `lex-brand-colors` — Notion-canonical primary/secondary CTA hierarchy
- `lex-brand-typography` — Poppins → Roboto font chain (consumed via `--font-sans`)
- `lex-frontend-accessibility` — WCAG 2.1 AA requirement
- `lex-frontend-testing` — Vitest + jest-axe testing strategy
- Fernando standing memory `feedback_a11y_unit_test_ac.md` — jest-axe light+dark on Default + open + disabled is an AC, not a bonus
- Fernando standing memory `feedback_visual_regression_ubuntu_sot.md` — baselines are Ubuntu/CI source of truth
- Fernando standing memory `feedback_terminology_unit_test.md` — "teste de unidade" (never "teste unitário") in pt-BR documentation
- Legacy reference: `ux_references/ui_kits/components/Accordion/{Accordion.playground.html,index.tsx,index.css}`
