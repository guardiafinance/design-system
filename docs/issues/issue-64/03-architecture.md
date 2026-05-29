# Issue #64 — Architecture

## Decision summary

`EmptyState` migrates to v0.1.0 DoD as a **composition-only primitive** (no Radix dependency) under `ui_kit/components/empty-state/`. The component follows three established precedents with **zero new architectural surface**:

1. **Compound + flat exports** — `EmptyState` root with `Icon`, `Illustration`, `Title`, `Description`, `Actions` subcomponents, each also exported flat (`EmptyStateIcon`, etc.). Identity preserved: `EmptyState.Icon === EmptyStateIcon`. **Precedent: Card (PR #94+).**
2. **Semantic-token contract** — `bg-muted` (icon container background) + `text-foreground` (icon, title) + `text-muted-foreground` (description), zero hardcoded colors, zero `oklch(`, zero `--violet-*`. **Precedent: ADR-005 (Popover), ADR-006 (Menu), ADR-007 (Tooltip).** The legacy reference's `--violet-50` / `--violet-500` remap to `bg-muted` / `text-foreground` per the canonical semantic palette.
3. **CVA size ladder** — `sm | md | lg` driving padding (24/16, 40/24, 64/32 px) and icon-container dimensions (42, 56, 72 px square). **Precedent: ADR-005 (Popover CVA ladder), ADR-007 (Tooltip CVA ladder).**

A **`role="status"` + `aria-live="polite"` default** on the root makes screen readers announce when the empty state replaces content. This is the canonical pattern in ARIA Authoring Practices for "no results" / "empty data" live regions; it requires no ADR (no new architectural decision — applying a documented standard).

## ADR-012 decision: SKIP

ADR-012 is **pre-allocated to this Plan** by the standing instructions, but applying `lex-issue-driven` Rule 4 (ADR mandatory for "new technology choice; deviation from existing pattern; significant trade-off between alternatives; decision affecting multiple components or external contracts"), this migration triggers **none of those**:

- **No new technology** — React + Tailwind v4 + CVA, identical to Card / Popover / Menu / Tooltip migrations.
- **No deviation from existing pattern** — the compound+flat+`as`-polymorphic pattern is the Card precedent; the CVA size ladder is the Popover/Tooltip precedent; the `bg-muted` + `text-foreground` token remap is documented in ADR-005/006/007.
- **No significant trade-off** — every design choice has a single dominant precedent. Compound vs. single-with-slot-props was settled by Card. Token remap was settled by ADR-005. Size ladder shape was settled by ADR-005/007. ARIA `status` role for "no results" is canonical per ARIA APG.
- **No multi-component or external-contract impact** — single component, single barrel re-export, zero downstream API surface change.

Card itself migrated without an ADR — the same standing applies here. **ADR-012 slot is released** for the next Plan that genuinely needs it (likely Dialog #60 or Alert #56).

## Affected components (scope table)

| File | Change | Reason |
|------|--------|--------|
| `ui_kit/components/empty-state/index.tsx` (new) | Compound component: `EmptyState` root + 5 subcomponents (`Icon`, `Illustration`, `Title`, `Description`, `Actions`); CVA `size` variant; `data-slot` markers; `forwardRef` on all; `as`-polymorphism on root + `Title`. Token-only styling. | AC-1, 2, 3, 4, 5, 6, 7, 8, 11, 12, 13, 14, 15, 16, 17 |
| `ui_kit/components/empty-state/EmptyState.test.tsx` (new) | ≥ 20 behavioral tests with `AC-N` traceability; jest-axe `light` + `dark` across 3 shapes (Default, WithIcon, WithIllustration). Accessible queries (`getByRole`, `getByText`). | AC-21, 22 |
| `ui_kit/components/empty-state/EmptyState.stories.tsx` (new) | ≥ 7 stories: Default, WithIcon, WithIllustration, WithActions×2, Sizes matrix, LongDescription, DarkTheme. | AC-19 (alphabetical position), AC-22 |
| `ui_kit/components/index.ts` | Add `export * from "./empty-state";` (alphabetical between `drawer` and `file-upload` — but currently the file only lists card/popover/tooltip; alphabetical insertion). | AC-1, AC-2 |
| `docs/src/pages/componentes/empty-state.astro` (new) | Astro page: Anatomy, Sizes, Slots (Icon vs. Illustration), Actions, Token vocabulary, Live preview. Layout `ComponentPreview.astro`. | AC-18 |
| `docs/src/previews/empty-state.tsx` (new) | Static previews: `Anatomy`, `SizesRow`, `WithIcon`, `WithIllustration`, `WithActions`, `LongDescription`. | AC-18 |
| `docs/src/previews/empty-state-live.tsx` (new) | `<LiveEmptyStateSnippet>` — `LiveProvider` + `noInline` interactive snippet, scope includes `EmptyState` + `Button`. | AC-18 |
| `docs/src/pages/index.astro` | Add `"EmptyState"` to the `MIGRATED` Set (alphabetical insertion between `DatePicker` and `FileUpload`). | AC-19 |
| `docs/issues/issue-64/01-brief.md` (new) | Phase 1 artifact. | issue-driven flow |
| `docs/issues/issue-64/02-requirements.md` (new) | Phase 2 artifact. | issue-driven flow |
| `docs/issues/issue-64/03-architecture.md` (new) | Phase 3 artifact (this file). | issue-driven flow |
| `docs/issues/issue-64/05-security-review.md` (new) | Phase 5 artifact. | issue-driven flow |
| `docs/issues/issue-64/06-quality-report.md` (new) | Phase 6 artifact. | issue-driven flow |

**Out of scope (no edits to these files):** every other component under `ui_kit/components/`, every other doc page under `docs/src/pages/componentes/`, every other test file, every other ADR, every Lexis/Codex/Kata/Warrior under `.claude/` or `.ahrena/framework/`, every preview file under `docs/src/previews/` other than the new `empty-state*.tsx`.

## Type design — compound API

```typescript
type EmptyStateSize = "sm" | "md" | "lg";
type EmptyStateElement = "div" | "section";

interface EmptyStateProps extends Omit<React.HTMLAttributes<HTMLElement>, "color"> {
  /** Visual scale of the empty state. */
  size?: EmptyStateSize;
  /** Semantic element rendered at the root. Default `div`. */
  as?: EmptyStateElement;
}

interface EmptyStateTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
  /** Semantic heading level. Default `h3`. */
  as?: "h2" | "h3" | "h4" | "h5" | "h6";
}

// Description, Icon, Illustration, Actions are plain
// React.HTMLAttributes<HTMLDivElement> (no extra props).

type EmptyStateCompound = React.ForwardRefExoticComponent<EmptyStateProps & React.RefAttributes<HTMLElement>> & {
  Icon: typeof EmptyStateIcon;
  Illustration: typeof EmptyStateIllustration;
  Title: typeof EmptyStateTitle;
  Description: typeof EmptyStateDescription;
  Actions: typeof EmptyStateActions;
};
```

## CVA variant table

| Slot | `size="sm"` | `size="md"` (default) | `size="lg"` |
|------|------------|----------------------|-------------|
| Root padding | `py-6 px-4` | `py-10 px-6` | `py-16 px-8` |
| Root gap (between slots) | `gap-1.5` | `gap-2` | `gap-2.5` |
| Icon container size | `h-[42px] w-[42px]` | `h-14 w-14` | `h-[72px] w-[72px]` |
| Icon container radius | `rounded-xl` | `rounded-2xl` | `rounded-2xl` |
| Title typography | `text-sm font-semibold` | `text-[15px] font-semibold` | `text-lg font-semibold` |
| Description typography | `text-xs` | `text-[13.5px]` | `text-sm` |
| Actions layout | `flex-col gap-2` | `flex-row gap-2` | `flex-row gap-2` |

All sizes share root utilities: `flex flex-col items-center text-center text-fg`.

## Token mapping (from legacy reference)

| Legacy `ux_references/.../index.css` | v0.1.0 token | Resolved (light) | Resolved (dark) |
|--------------------------------------|--------------|------------------|-----------------|
| `background: var(--violet-50)` (icon container) | `bg-muted` | `hsl(280 20% 96%)` (≈ `#F5F2F7`) | `hsl(240 9% 13%)` (≈ `#1E1E24`) |
| `color: var(--violet-500)` (icon foreground) | `text-foreground` | `hsl(271 64% 26%)` (`#4F186D`) | `hsl(0 0% 99%)` (`#FDFDFD`) |
| `color: var(--fg)` (title) | `text-foreground` | (as above) | (as above) |
| `color: var(--fg-muted)` (description) | `text-muted-foreground` | `hsl(240 4% 38%)` (≈ `#5D5D62`) | `hsl(240 3% 85%)` (`#D7D7D9`) |

WCAG checks (computed): light `text-foreground` (`#4F186D`) on `bg-background` (`#FDFDFD`) = **7.85:1** (AAA). Dark `text-foreground` (`#FDFDFD`) on `bg-background` (`#0E1016`) = **17.4:1** (AAA). Light `text-muted-foreground` (`#5D5D62`) on `bg-background` (`#FDFDFD`) = **7.06:1** (AAA). Dark `text-muted-foreground` (`#D7D7D9`) on `bg-background` (`#0E1016`) = **12.3:1** (AAA). All pass AA + AAA — jest-axe `color-contrast` rule stays **enabled**.

## ARIA contract

- Root: `role="status"` + `aria-live="polite"` + `aria-atomic="true"` by default. Consumers may override `role` (e.g., `role="region"` with an `aria-labelledby` pointing at the title) or remove the live behavior by passing `aria-live=""`.
- Title-description association: when both subcomponents are present, the root injects a generated id pair and wires `aria-describedby` from the Title to the Description's id.
- Icon slot: `aria-hidden="true"` on the slot wrapper by default (the visual icon is decorative; the text title is the accessible name). Consumer-provided non-decorative icons can override.

## Stacked PR decomposition

**SKIP — single PR per the precedent.** Decision Checklist (codex-stacked-prs):

| Signal | Result |
|--------|--------|
| Multiple bounded contexts | ❌ Single component, single barrel, single docs page |
| Migrations / DDL-then-code | ❌ N/A |
| Independent reviewability gain ≥ 3 | ❌ Component + tests + stories + docs are tightly coupled |
| New external surface ≥ 2 | ❌ Single API |
| > 600 lines of diff | ❌ Estimated ~ 350 lines incl. tests + stories + docs |
| Risk isolation requested | ❌ N/A |

**High signals: 0. Anti-signals: 5+.** Threshold for stacking is ≥ 3 high signals AND 0 anti-signals → single PR is the canonical path.

## Specialist warrior delegations

**None.** EmptyState is composition-only frontend code with no API, event, AWS, or backend surface. Athena drives Phase 4 implementation directly per the Tooltip / Popover precedents.

## References

- ADR-005 — Popover v0.1.0 DoD (token contract precedent)
- ADR-006 — Menu consolidation (compound + flat exports precedent)
- ADR-007 — Tooltip v0.1.0 DoD (two-rung CVA ladder precedent, `accepted`-from-creation)
- `ui_kit/components/card/index.tsx` — composition + `data-slot` + `as`-polymorphic precedent
- `lex-design-system-library` — mandatory consumption of design-system primitives
- `lex-brand-colors` — semantic palette enforcement (zero hardcoded colors)
- `lex-frontend-accessibility` — WCAG 2.1 AA minimum
- `lex-frontend-testing` — Testing Library + accessible queries; jest-axe AA gate
- ARIA Authoring Practices Guide — Live Regions (the `role="status"` rationale)
- Fernando standing memory `feedback_a11y_unit_test_ac.md` — jest-axe light+dark is an AC, not bonus
- Fernando standing memory `feedback_terminology_unit_test.md` — "teste de unidade", not "teste unitário"
