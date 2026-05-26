# ADR-003 — Chip `variant` and `appearance` API

- **Status:** accepted
- **Date:** 2026-05-25
- **Deciders:** Fernando Seguim
- **Plan:** [#171](https://github.com/guardiatechnology/design-system/issues/171) (Plan A of Tech Task [#168](https://github.com/guardiatechnology/design-system/issues/168))
- **Supersedes:** none. **Complements:** [ADR-002](ADR-002-hover-on-action-surfaces.md) (hover-on-action-surfaces).

## Context

After the brand-aware token migration in [#125](https://github.com/guardiatechnology/design-system/issues/125), the Chip component only exposes two color states: `selected: true` (using `--action`) and `selected: false` (neutral surface with `--action` border on hover). The consumer cannot express semantic categorization (a "warning chip", a "success chip", a "danger chip") — every chip dialogues with the brand `action` token, nothing else.

The rest of the design system already addresses this need:

| Component | API | Vocabulary |
|---|---|---|
| `Button` | `variant` | `default \| destructive \| outline \| secondary \| ghost \| link` (legacy, pre-brand-aware) |
| `Badge` | `variant` + `appearance` | `neutral \| brand \| accent \| success \| warning \| danger \| info` × `soft \| solid \| outline` |
| `IconButton` | `variant` | `default \| secondary \| destructive \| outline \| ghost` |
| **`Chip`** | — only `selected: bool` | — none — |

Tech Task #168 proposed adding `variant` to Chip following Badge's vocabulary. Plan A (this ADR) locks the design decisions; Plan B implements them.

## Decisions

### 1. Prop name — `variant`

Adopted: **`variant`**.

Rationale: matches every other intent-bearing component in the DS (Badge, Button, IconButton). Rejected alternatives:

- **`intent`** — would diverge from existing components and cost cross-component cognitive load.
- **`tone`** — Badge already calls this `variant`, divergence creates inconsistency without semantic gain.

### 2. Vocabulary — 7 variants matching Badge

Adopted vocabulary (exactly Badge's):

```
variant: "brand" | "accent" | "neutral" | "success" | "warning" | "danger" | "info"
```

Default: **`"brand"`** — preserves 100% of the current Chip `selected` behavior. Existing consumers that do not pass `variant` see identical render.

Rationale: predictability across DS surfaces. A consumer learning Chip should not need to learn a new vocabulary.

### 3. Token mapping — `brand` and `accent` diverge from Badge (intentional)

This is the single most impactful design call in this ADR.

| Variant | Chip token | Theme-aware? | Badge token (reference) |
|---|---|---|---|
| **`brand`** (default) | `--action` / `--action-hover` | **YES** — violet light / orange dark | `bg-guardia-violet-500` (literal, theme-agnostic) |
| **`accent`** | `--accent-brand` / `--accent-brand-hover` | **YES** — orange light / violet-200 dark | `bg-guardia-orange-500` (literal) |
| **`neutral`** | gray-500 family | NO | identical to Badge |
| **`success`** | `--success` (signal-green `#00BF63`) | NO — signal | identical |
| **`warning`** | `--warning` (signal-yellow `#FFDE59`) | NO — signal | identical |
| **`danger`** | `--danger` (signal-red `#FF3131`) | NO — signal | identical |
| **`info`** | `--info` (signal-blue `#004AAD`) | NO — signal | identical |

**Why `brand` and `accent` diverge from Badge:** Chip was migrated in #125 to use the brand-aware `--action` token (which flips violet↔orange by `data-theme`). Consumers built UIs around the theme-aware behavior. Switching `variant="brand"` to a literal `bg-violet-500` would be a silent breaking change to every existing `<Chip selected>` in production.

The 4 signal variants (`success`, `warning`, `danger`, `info`) have no equivalent dilemma — signal colors carry semantic meaning ("danger is always red") independent of brand theme. They match Badge literally.

**Trade-off accepted:** intra-component consistency between Chip and Badge is partial (5 of 7 variants align literally; 2 diverge with brand-aware tokens). The ADR makes the divergence explicit so future contributors do not "fix" it by accident.

### 4. `appearance` prop — full Badge parity (3 values)

Adopted: **`appearance: "soft" | "solid" | "outline"`** — matching Badge.

Default: **`"soft"`** (matches Badge default; gives chips a subtle resting look).

This creates a 2-axis API:

- `variant` — *what is the meaning?* (brand, success, warning, …)
- `appearance` — *what is the visual emphasis?* (soft = subtle tint, solid = filled, outline = bordered only)

**Reconciling `appearance` × `selected`:** Chip has a third axis — `selected: bool` — that does not exist on Badge. The interaction:

| `appearance` value | When `selected: false` | When `selected: true` |
|---|---|---|
| `soft` (default) | soft tint + variant text color | **forced to solid** (variant solid fill + contrast text fg) |
| `solid` | solid fill + contrast text fg | solid fill + contrast text fg (no change) |
| `outline` | border + variant text color | **forced to solid** (variant solid fill + contrast text fg) |

**Selected always wins → solid.** Rationale: Chip's `selected` semantically means "this filter is on" — a toggle. A toggle-ON state with only a "soft" or "outline" appearance reads as ambiguous ("is it on or just hovered?"). Forcing solid when selected eliminates the ambiguity and matches the affordance pattern from Checkbox/Radio (also toggle, also solid when on).

The consumer's `appearance` choice therefore controls the **resting** look (`selected: false`). When the user activates the chip, the appearance promotes to `solid` to signal the on state.

### 5. Foreground color overrides for low-contrast solids

WCAG 2.1 AA forbids any text/bg combination below 4.5:1 for normal text and 3:1 for large text/UI. The brand palette `lex-brand-colors` explicitly forbids `Yellow 500` over white (1.61:1). Applied to Chip `solid` (the look adopted when `selected: true`):

| Variant solid | bg | text fg | Contrast | Notes |
|---|---|---|---|---|
| `brand` | `--action` (violet-500 / orange-500) | `--button-fg` (white / mono-black) | 7.04:1 light, 6.2:1 dark | already in use post-#125 |
| `accent` | `--accent-brand` (orange-500 / violet-200) | `--button-fg-hover` (white / white) | 5.75:1 light, must verify dark — see footnote ¹ | special: dark theme accent uses light violet, fg stays white |
| `neutral` | `bg-guardia-gray-500` | `text-white` | 6.41:1 | OK |
| `success` | `bg-signal-green` (`#00BF63`) | `text-white` | 2.99:1 ⚠️ | **FAILS AA**. Use `text-guardia-gray-900` instead — see footnote ² |
| `warning` | `bg-signal-yellow` (`#FFDE59`) | `text-guardia-violet-900` (mono-black) | 14.39:1 | matches Badge's solid warning override |
| `danger` | `bg-signal-red` (`#FF3131`) | `text-white` | 4.66:1 | OK |
| `info` | `bg-signal-blue` (`#004AAD`) | `text-white` | 11.06:1 | OK |

¹ `accent` dark theme uses `--guardia-violet-200` (`#AF97BD`) as bg. White text over this background is **3.34:1** — passes AA-Large (3:1) but fails AA-Normal (4.5:1). Chip text is `text-[12px]` (sm) or `text-[13px]` (md) — neither is "large" by WCAG definition (≥18px regular or ≥14pt bold). **Decision:** override `accent` solid dark fg to `text-guardia-violet-900` (mono-black) — gives 4.83:1 (AA pass).

² `success` solid white-on-green = 2.99:1 fails. Badge's soft success uses dark green text on light green bg; Badge's `solid` success ships `text-white` which is **also non-compliant** in Badge today. **Decision for Chip:** override to `text-guardia-gray-900` (mono-black) for AA pass (12.18:1). This is a **Chip-specific deviation from Badge** — track as follow-up to align Badge once #168 lands.

Override summary for Chip solid:

```tsx
// Pseudocode for the compound variant matrix
selected solid + variant="brand"   → text-button-fg
selected solid + variant="accent"  → text-button-fg-hover (= white in both themes)
selected solid + variant="neutral" → text-white
selected solid + variant="success" → text-guardia-gray-900   // override (Badge mismatch — Plan B will track)
selected solid + variant="warning" → text-guardia-violet-900 // matches Badge
selected solid + variant="danger"  → text-white
selected solid + variant="info"    → text-white
```

### 6. ADR-002 applies to every variant

[ADR-002](ADR-002-hover-on-action-surfaces.md) — hover MUST NOT override `data-[state=checked]` / `selected: true` on `bg-action` surfaces.

This ADR-003 extends the policy to **every variant** when in `selected: true`. Hovering a `<Chip selected variant="warning">` does not switch to a yellow-hover token; the solid yellow stays stable. Same rule, broader surface.

Rationale: the hover-on-checked policy was a UX consistency call, not a brand-specific one. Applying it only to `brand` would create the exact divergence ADR-002 set out to eliminate.

## Consequences

### Aligned with the decisions (no breaking change)

- **Default `variant="brand" appearance="soft"`** preserves the current Chip API for consumers that never specify `variant`.
- **`bg-action` flip** preserved by intentional divergence from Badge for `brand`.
- **Hover stability on selected** (ADR-002) applies to all variants.

### Diverges (Plan B implementation responsibility)

- `appearance` is a new optional prop with default `"soft"` — exists today as an implicit `"solid"` (the previous `selected: false` look was closer to a soft variant of the neutral bg). Plan B must verify no visual regression on consumers that did not specify `appearance`.
- 4 of 21 visual stories require text-fg overrides for AA compliance (rows in section 5 above).

### Out of scope for this Plan

- Updating Badge to align its `success` solid contrast (the `text-white` over `signal-green` 2.99:1 issue). Plan B opens a follow-up Issue if desired.
- Migration of existing consumer call sites to use new variants. Backward-compat default makes this a follow-up activity, not a precondition.
- New tokens beyond what `ui_kit/styles/index.css` already exposes. Every variant maps to an existing token.

## Validation matrix — 21 stories × 2 themes = 42 visual snapshots

Plan B will produce Storybook stories for each `variant` × `appearance` cell. `selected: true` and `selected: false` are 2 states per cell (revealing the appearance interaction from section 4). Each cell rendered in light + dark theme via the storybook theme toggle = 42 snapshots.

jest-axe coverage: per variant, one test with `selected: true` and one with `selected: false`, both wrapped in `axeInThemes(container)` — gives 14 a11y assertions × 2 themes = 28 axe runs.

## References

- [ADR-002 — hover-on-action-surfaces](ADR-002-hover-on-action-surfaces.md)
- Tech Task [#125](https://github.com/guardiatechnology/design-system/issues/125) — brand-aware token migration
- Tech Task [#168](https://github.com/guardiatechnology/design-system/issues/168) — parent of this ADR
- `lex-brand-colors` — palette and WCAG combination rules
- `lex-frontend-accessibility` — WCAG 2.1 AA requirements
- `Badge` source: `ui_kit/components/badge/index.tsx`
- Existing tokens: `ui_kit/styles/index.css` (`--action`, `--accent-brand`, `--success`, `--warning`, `--danger`, `--info`, `--button-fg`, `--button-fg-hover`)
