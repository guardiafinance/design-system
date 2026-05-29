# Phase 3 — Architecture · Issue #58

- **Component:** `ConfidenceIndicator`
- **Path:** `ui_kit/components/confidence-indicator/`
- **Plan sub-issue:** #252
- **ADR:** ADR-013 (authored alongside this PR — see §ADR-013 below)
- **Stacked PR decomposition:** rejected (see §Decision Checklist below)

## Component map

```
ui_kit/components/confidence-indicator/
├── index.tsx                            (component + types + cva accessor)
└── ConfidenceIndicator.test.tsx         (≥ 20 behavioral + jest-axe matrix)
ui_kit/components/index.ts               (+ barrel export)
docs/src/pages/componentes/confidence-indicator.astro
docs/src/previews/confidence-indicator.tsx
docs/src/pages/index.astro               (+ "ConfidenceIndicator" in MIGRATED Set)
docs/adr/ADR-013-confidence-indicator-v0.1.0-dod-migration.md
docs/issues/issue-58/01-brief.md
docs/issues/issue-58/02-requirements.md
docs/issues/issue-58/03-architecture.md
docs/issues/issue-58/05-security-review.md
docs/issues/issue-58/06-quality-report.md
```

Stories file naming follows the project convention `ConfidenceIndicator.stories.tsx` (matches `Tooltip.stories.tsx`, `AgentCard.stories.tsx`).

## API surface (canonical)

```tsx
// Types
export type ConfidenceLevel = "high" | "medium" | "low";
export type ConfidenceVariant = "chip" | "bar" | "dot";
export type ConfidenceSize = "sm" | "md";

export interface ConfidenceIndicatorProps
  extends Omit<React.HTMLAttributes<HTMLElement>, "role" | "aria-valuemin" | "aria-valuemax"> {
  /** Confidence percentage in [0, 100]. Clamped. */
  value?: number;
  /** Explicit override of the tier; wins over derived level. */
  level?: ConfidenceLevel;
  /** Visual treatment. Defaults to "chip". */
  variant?: ConfidenceVariant;
  /** Visual scale. Defaults to "md". */
  size?: ConfidenceSize;
  /** Hide/show the numeric percentage. Default true. */
  showValue?: boolean;
  /** Replace the default tier label. */
  label?: React.ReactNode;
  /** Partial override of the default pt-BR tier labels. */
  levelLabels?: Partial<Record<ConfidenceLevel, string>>;
  /** Override the auto-composed aria-label. */
  "aria-label"?: string;
}

export const confidenceIndicatorVariants: ReturnType<typeof cva>;

export const ConfidenceIndicator: React.ForwardRefExoticComponent<
  ConfidenceIndicatorProps & React.RefAttributes<HTMLElement>
>;
```

### Default tier labels (pt-BR, legacy parity)

```ts
const DEFAULT_LEVEL_LABELS: Record<ConfidenceLevel, string> = {
  high: "Alta confiança",
  medium: "Revisar",
  low: "Atenção",
};
```

### Level derivation

```ts
function deriveLevel(value: number): ConfidenceLevel {
  if (value >= 95) return "high";
  if (value >= 80) return "medium";
  return "low";
}
```

Thresholds are **fixed constants** for v0.1.0 — no consumer override. Rationale documented in ADR-013.

### Clamp helper

```ts
function clampValue(raw: number | undefined): number | undefined {
  if (raw === undefined || Number.isNaN(raw)) return undefined;
  return Math.max(0, Math.min(100, raw));
}
```

## Internal structure (CVA + variant switch)

The component is a **single root element whose tag is variant-dependent**:

- `chip` → `<span role="meter" ...>` containing label + value span
- `dot`  → `<span role="meter" ...>` containing bullet + label
- `bar`  → `<div role="meter" ...>` containing track + meta row (label + value)

All three carry the same ARIA contract (`role="meter"`, `aria-valuenow`, `aria-valuemin=0`, `aria-valuemax=100`, `aria-valuetext`). Only the visual DOM differs.

CVA schema (single accessor):

```ts
const confidenceIndicatorVariants = cva(
  // base: tabular numerics + font-sans inherit + box-sizing reset (Tailwind defaults handle this)
  "inline-flex items-center font-sans tabular-nums",
  {
    variants: {
      variant: { chip: "...", dot: "...", bar: "flex-col gap-1.5 min-w-[140px]" },
      size:    { sm: "...", md: "..." },
      level:   { high: "", medium: "", low: "" },  // applied via compoundVariants
    },
    compoundVariants: [
      // chip × level (3 entries) — surface + text per AC-11
      { variant: "chip", level: "high",   className: "bg-[color-mix(in_oklab,var(--signal-green)_18%,white)] text-[color-mix(in_oklab,var(--signal-green)_52%,black)] border border-[color-mix(in_oklab,var(--signal-green)_30%,white)]" },
      { variant: "chip", level: "medium", className: "bg-guardia-yellow-100 text-guardia-yellow-900 border border-guardia-yellow-200" },
      { variant: "chip", level: "low",    className: "bg-[color-mix(in_oklab,var(--signal-red)_14%,white)] text-[color-mix(in_oklab,var(--signal-red)_45%,black)] border border-[color-mix(in_oklab,var(--signal-red)_30%,white)]" },
      // dot × size (bullet sizes via descendant selector won't work in CVA, so dot uses inline class on the bullet span)
      // bar × level — fill colour applied on the inner fill element via a side-table (not CVA)
      // size × chip — padding / font-size
      { variant: "chip", size: "sm", className: "gap-1.5 rounded-full px-1.5 py-0.5 text-[11px] font-semibold leading-none" },
      { variant: "chip", size: "md", className: "gap-1.5 rounded-full px-2 py-0.5 text-[12px] font-semibold leading-none" },
      { variant: "dot",  size: "sm", className: "gap-1.5 text-[11.5px] text-fg" },
      { variant: "dot",  size: "md", className: "gap-1.5 text-[12.5px] text-fg" },
      // bar size variants apply to track height, not the root — handled on inner track element
    ],
    defaultVariants: { variant: "chip", size: "md", level: "high" },
  },
);
```

The `bar` track / fill / meta sub-elements consume token classes directly (no CVA needed for two sub-elements). The dot bullet receives its tier colour through a small map at render time — keeps the CVA flat.

### Token contract — strict whitelist

Per AC-10, the following are the only token surfaces allowed:

| Surface | Tokens permitted |
|---|---|
| chip background (high)   | `color-mix(in oklab, signal-green 18%, white)` (≈ `--success-soft`) |
| chip text (high)         | `color-mix(in oklab, signal-green 52%, black)` |
| chip border (high)       | `color-mix(in oklab, signal-green 30%, white)` |
| chip background (medium) | `--guardia-yellow-100` |
| chip text (medium)       | `--guardia-yellow-900` |
| chip border (medium)     | `--guardia-yellow-200` |
| chip background (low)    | `color-mix(in oklab, signal-red 14%, white)` (≈ `--danger-soft`) |
| chip text (low)          | `color-mix(in oklab, signal-red 45%, black)` |
| chip border (low)        | `color-mix(in oklab, signal-red 30%, white)` |
| bar fill                 | `--signal-green` / `--signal-yellow` / `--signal-red` (raw — decorative) |
| bar track                | `--guardia-gray-200` (light) / theme-equivalent on dark via the existing `data-theme` block |
| bar label                | `--fg-muted` |
| bar value text           | same as chip text per tier |
| dot bullet               | raw signal colour per tier (decorative) |
| dot label                | `--fg` |

The Badge ADR-003 WCAG-recompute pattern is the precedent for the `medium` tier using `guardia-yellow-*` instead of `signal-yellow` because the latter (#FFDE59) over its tint produces a ≤ 3:1 ratio for normal text. Badge had to take the same exit; ConfidenceIndicator inherits the resolved Badge tokens directly (zero recompute work).

## Visual divergence from legacy (recorded)

| Legacy behaviour | v0.1.0 behaviour | Rationale |
|---|---|---|
| Icon (`circle-check` / `triangle-alert` / `circle-x`) inside `chip` via global `Icon` component | No leading icon | The project icon surface is `lucide-react`. Adding `lucide` icons inside the chip would make chip text + icon either redundant or visually crowded at `sm`. Consumer composes icon externally if desired (the chip already communicates the tier via colour + label). Reduces visible-DOM dependency. |
| `bar` width fallback when `value` undefined (`97% / 86% / 62%`) | When `value` undefined, `bar` renders at the floor of the active tier (`high → 95`, `medium → 80`, `low → 0`) | The legacy fallback is decorative; rendering at the tier floor is honest about what is actually known (a level, not a value). Reflected in `aria-valuenow`. |
| `bar` `transition: width 360ms var(--ease-standard)` | `transition-[width] duration-300 ease-out` | Tailwind utility coverage; the 60ms reduction is below any motion threshold and our existing `--ease-standard` token isn't a Tailwind alias. |
| Implicit pt-BR labels with no override | `levelLabels` prop allows partial override | Real i18n need surfaces immediately when this component lands in product surfaces; the override is one line of API for zero visual cost. |
| `role` was absent on the root span / div | `role="meter"` per AC-16 | Legacy was an HTML demo, not a production component. WAI-ARIA 1.2 §5.3.18 codifies `meter` as the correct role for "a graphical display of scalar measurement within a known range". |

All divergences carry zero brand or UX semantic change — they are mechanical adaptations to the v0.1.0 stack.

## Tests strategy

- **File:** `ConfidenceIndicator.test.tsx` next to `index.tsx`.
- **Runner:** Vitest + Testing Library (project standard).
- **A11y:** `axeInThemes` helper from `@/test-utils/a11y`. Matrix per AC-19: 9 invocations across light + dark = 18 axe runs (or grouped in a single test with a forEach matrix — the existing helper does the loop).
- **Mocking:** none — there are no internal collaborators, no network, no clock.
- **Coverage target:** ≥ 80% on `index.tsx`. With ~ 22-24 behavioral tests + a11y matrix, this is comfortably exceeded.

## Storybook strategy

- **File:** `ConfidenceIndicator.stories.tsx` next to `index.tsx`.
- **Stories planned:** `Default`, `Levels`, `Variants`, `Sizes`, `WithoutValue`, `CustomLabel`, `InContext`. The `InContext` story mirrors the playground's agent-suggestion row to give designers / reviewers a 1:1 comparison point.
- **Theme switch:** Storybook's `data-theme` decorator (project convention).

## Docs (Astro) strategy

- `confidence-indicator.astro`: standard `ComponentPreview` layout, kicker `"COMPONENTES · FEEDBACK"`, lede about AI confidence per `lex-brand-voice`.
- `confidence-indicator.tsx` previews: named exports `BasicRow`, `LevelsRow`, `VariantsRow`, `SizesRow`, `InContextRow`. A `confidence-indicator-live.tsx` is added with a single small snippet for the docs page's live block (mirrors Tooltip pattern).
- `MIGRATED` Set in `docs/src/pages/index.astro`: add `"ConfidenceIndicator"`.

## Build / surface integration

- Barrel: `export * from "./confidence-indicator";` in `ui_kit/components/index.ts` (matches existing entries).
- `rslib` build: ConfidenceIndicator becomes part of the public surface of `@guardia/design-system`. No new external dependency (`lucide-react` is already in `package.json`; `class-variance-authority` is already present; `cn` lives in `@/lib/utils`).

## Risks / known concerns

- **Risk:** the medium-tier `signal-yellow` over white blow-up that Badge already faced. **Mitigation:** AC-11 freezes the Badge fallback (`guardia-yellow-100` + `guardia-yellow-900`). Direct port, no recompute work.
- **Risk:** `role="meter"` has historically had inconsistent AT support. **Mitigation:** every rendering path also sets `aria-label` (AC-18) and `aria-valuetext` (AC-17), so even an AT that ignores `meter`'s scalar fields gets a textual summary.
- **Risk:** visual baseline regeneration on Ubuntu CI. **Mitigation:** per Fernando's standing memory, baselines are Ubuntu/CI source of truth — no local macOS commit. The PR will produce a pending-baselines comment + artifact; the human applies `regenerate-baselines` label after first review.
- **Risk:** ChatMessage / AgentCard PRs in flight may eventually re-token violet/orange. **Mitigation:** ConfidenceIndicator does not touch violet/orange at all — only signal palette + yellow scale — so cross-PR drift cannot reach it.

## Decision Checklist — Stacked PR decomposition

Consulting `codex-stacked-prs` against the scope:

| Signal | Verdict |
|---|---|
| Multiple independent units? | No — chip/bar/dot are one component |
| Layered foundation that unblocks other PRs? | No |
| Long-running migration? | No |
| Independent review surfaces? | No |
| Total surface > ~ 500 LOC? | Borderline (~ 350-450 LOC across all new files) |
| Distinct review owners per layer? | No |
| Distinct AC subsets per layer? | No |

Signals favouring stacking: 1 (size). Anti-signals: 6. Verdict: **single PR**. No decomposition.

## ADR-013 — to author at Phase 7

**Title:** `ADR-013 — Migrate ConfidenceIndicator to v0.1.0 DoD (AI-first feedback primitive)`

**Decisions to record:**

1. **`role="meter"` over `role="progressbar"`** — confidence is a steady-state scalar within a known range, not a temporal progress. `meter` is the WAI-ARIA-correct role; `progressbar` would mis-signal that the value is monotonically advancing.
2. **Fixed thresholds (95 / 80) from the Lighthouse system** — consumer-overridable thresholds were rejected to keep the Lighthouse semantic constant. A future Issue can expose `thresholds` if a real cross-product divergence appears; today it is YAGNI.
3. **Single-component-with-variant over compound API** — the three variants are visual treatments of one semantic scalar, not orthogonal building blocks. Compound (`<ConfidenceIndicator><ConfidenceIndicator.Chip>…</ConfidenceIndicator.Chip></ConfidenceIndicator>`) would force the consumer to pick a tree depth for zero gain. AgentCard / ChatMessage use compound because they have *layout* axes; this primitive has none.
4. **`signal-yellow` -> `guardia-yellow-*` for medium tier** — inherits the Badge ADR-003 WCAG-AAA recompute (no new mathematics, just adoption).
5. **AI-first framing recorded but no AI-trace `data-*` attributes** — the component does not emit `data-confidence-level` etc. today. Justification: no consumer demand, and emitting trace-shaped data would tie the design-system to a single trace UI's data contract. Future Issue if needed.
6. **No `lucide` icon inside chip** — divergence from legacy reference; reasoning above (table § "Visual divergence from legacy").

ADR-013 will be authored at status `accepted` from the start (Tooltip ADR-007 precedent — atomic commit carries code + accepted ADR together to avoid the dual-commit pattern Argos flagged 🟡 on PR #237).

## Next phase

Gate 1 (scope binding self-check) → Phase 4 (implementation).
