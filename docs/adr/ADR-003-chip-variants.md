# ADR-003 — Chip `variant` and `appearance` API

- **Status:** accepted
- **Date:** 2026-05-25
- **Deciders:** Fernando Seguim
- **Plan:** [#171](https://github.com/guardiatechnology/design-system/issues/171) (Plan A of Tech Task [#168](https://github.com/guardiatechnology/design-system/issues/168))
- **Supersedes:** none. **Complements:** [ADR-002](ADR-002-hover-on-action-surfaces.md) (hover-on-action-surfaces). **Spawns follow-up:** [#173](https://github.com/guardiatechnology/design-system/issues/173) (Badge solid success WCAG fix).

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

Adopted vocabulary (Badge's order, preserved exactly to avoid drift):

```
variant: "neutral" | "brand" | "accent" | "success" | "warning" | "danger" | "info"
```

Default: **`"brand"`**.

The default is `"brand"` rather than Badge's `"neutral"` because Chip's only existing color story is `--action` (which maps semantically to `brand`). Changing the default to `neutral` would silently flip every existing `<Chip>` to gray. The default-preserving call is Chip-specific and documented; the order of the enum itself stays aligned with Badge.

### 3. Token mapping — `brand` and `accent` diverge from Badge (intentional)

This is the single most impactful design call in this ADR.

| Variant | Chip token | Theme-aware? | Badge token (reference) |
|---|---|---|---|
| **`neutral`** | gray-500 family | NO | identical to Badge |
| **`brand`** (default) | `--action` / `--action-hover` | **YES** — violet light / orange dark | `bg-guardia-violet-500` (literal, theme-agnostic) |
| **`accent`** | `--accent-brand` / `--accent-brand-hover` | **YES** — orange-500 light / violet-200 dark | `bg-guardia-orange-500` (literal) |
| **`success`** | `--success` (signal-green `#00BF63`) | NO — signal | identical |
| **`warning`** | `--warning` (signal-yellow `#FFDE59`) | NO — signal | identical |
| **`danger`** | `--danger` (signal-red `#FF3131`) | NO — signal | identical |
| **`info`** | `--info` (signal-blue `#004AAD`) | NO — signal | identical |

**Why `brand` and `accent` diverge from Badge:** Chip was migrated in #125 to use the brand-aware `--action` token (which flips violet↔orange by `data-theme`). Consumers built UIs around the theme-aware behavior. Switching `variant="brand"` to a literal `bg-violet-500` would be a silent breaking change to every existing `<Chip selected>` in production.

The 4 signal variants (`success`, `warning`, `danger`, `info`) have no equivalent dilemma — signal colors carry semantic meaning ("danger is always red") independent of brand theme. They match Badge literally.

**Trade-off accepted:** intra-component consistency between Chip and Badge is partial (5 of 7 variants align literally; 2 diverge with brand-aware tokens). The ADR makes the divergence explicit so future contributors do not "fix" it by accident.

### 4. `appearance` prop — full Badge parity (3 values)

Adopted: **`appearance: "soft" | "solid" | "outline"`** — matching Badge.

Default: **`"outline"`** (Chip-specific, not Badge's `"soft"`). Rationale below.

This creates a 2-axis API:

- `variant` — *what is the meaning?* (brand, success, warning, …)
- `appearance` — *what is the visual emphasis?* (soft = tinted bg + variant text; solid = filled bg + contrast text; outline = transparent bg + variant border + variant text)

**`appearance` is a scope expansion beyond #168's original body** (which proposed only `variant`). The expansion is intentional and noted on the parent Issue: the 2-axis API gives consumers a third visual register (soft) without inflating the variant enum. Cost: matrix grows 7 → 21 surfaces to validate.

**Why default is `"outline"`, NOT `"soft"`:**

Today's `<Chip>` with `selected: false` renders as `bg-background border-border-strong text-foreground` — a transparent surface with a strong neutral border and neutral text. Translated to the 3-appearance vocabulary, that look maps closest to **`outline`** (transparent bg + visible border + neutral text), NOT to Badge's `"soft"` (which is a *tinted* background, e.g., `bg-guardia-violet-100 text-guardia-violet-700`).

If the default were `"soft"` to match Badge:
- Every existing `<Chip>` in consumer code would silently gain a violet tint background.
- Every existing `<Chip variant="brand">` (the default) would now render as `bg-violet-100 text-violet-700` (Badge's soft brand) — a visible regression.

Default = `"outline"` preserves the current rendering. The Chip's `outline` appearance for `variant="brand"` resolves to **today's transparent + strong-border + neutral text** — itself a Chip-specific take that differs from Badge's `outline brand` (`border-violet-500 text-violet-500`). This is a deliberate divergence parallel to decision #3, documented here.

**Backward-compat reconciliation summary:**

| Today's Chip behavior | Maps to in new API |
|---|---|
| `<Chip>` (selected=false default) | `<Chip variant="brand" appearance="outline" selected={false}>` |
| `<Chip selected>` | `<Chip variant="brand" appearance="outline" selected>` (selected forces solid, see decision 5) |

Every existing `<Chip>` call site renders byte-identically without code changes.

### 5. `appearance × selected` interaction — selected always wins → solid

**Surprising asymmetry, made explicit:** when `selected: true`, the consumer's `appearance` choice **is inert**. The chip renders as `solid` regardless. Plan B implementation has to short-circuit the appearance branch when `selected === true`.

| `appearance` value | When `selected: false` | When `selected: true` |
|---|---|---|
| `outline` (default) | transparent bg + strong border + neutral text | **forced to solid** (variant solid fill + contrast text fg) |
| `soft` | tinted bg + variant text color | **forced to solid** (variant solid fill + contrast text fg) |
| `solid` | solid fill + contrast text fg | solid fill + contrast text fg (no change) |

**Rationale:** Chip's `selected` semantically means "this filter is on" — a toggle. A toggle-ON state with only a "soft" or "outline" appearance reads as ambiguous ("is it on or just hovered?"). Forcing solid when selected eliminates the ambiguity and matches the affordance pattern from Checkbox/Radio (also toggles, also solid when on).

The consumer's `appearance` choice therefore controls the **resting** look (`selected: false`). When the user activates the chip, the appearance promotes to `solid` to signal the on state.

**Why is the asymmetry called out so loudly:** without the explicit table above, a consumer passing `<Chip variant="warning" appearance="soft" selected>` would expect a soft warning tint with a "selected" highlight ring. The actual render is a *solid* warning chip. The mismatch is a guaranteed UX surprise without prominent docs. Plan B's Storybook MDX MUST surface this in the prop table description.

### 6. Foreground color overrides for low-contrast solids

WCAG 2.1 AA requires 4.5:1 for normal text and 3:1 for large text/UI. Chip text is `text-[12px]` (sm) or `text-[13px]` (md) — neither qualifies as "large" by WCAG definition (≥18px regular or ≥14pt bold). All chip combinations are evaluated against the AA-Normal 4.5:1 threshold.

Contrast values computed against the sRGB → relative-luminance formula in WCAG 2.1 §1.4.3, rounded to 2 decimals. Source colors taken from `ui_kit/styles/index.css`.

| Variant solid | bg color (light / dark) | fg adopted (light / dark) | Contrast (light / dark) | Notes |
|---|---|---|---|---|
| `neutral` | `gray-500` (#3A3A44) / same | `text-white` / `text-white` | **11.24** / 11.24 | OK both themes |
| `brand` | `violet-500` (#4F186D) / `orange-500` (#E07400) | `text-white` / `text-monoblack` | **12.47** / **6.04** | already in use post-#125 (`--button-fg`) |
| `accent` | `orange-500` (#E07400) / `violet-200` (#AF97BD) | **`text-monoblack`** / **`text-monoblack`** | **6.04** / **7.23** | Default `text-white` fails AA on both themes (light: 3.15:1; dark: 2.63:1). Override to mono-black mandatory. |
| `success` | `signal-green` (#00BF63) / same | **`text-monoblack`** / **`text-monoblack`** | **7.82** / 7.82 | Default `text-white` is **2.43:1** — AA fail. Badge ships this failing combo today; tracked as follow-up [#173](https://github.com/guardiatechnology/design-system/issues/173). |
| `warning` | `signal-yellow` (#FFDE59) / same | `text-monoblack` / `text-monoblack` | **14.35** / 14.35 | matches Badge's solid warning override (Badge uses `violet-900` which is functionally equivalent — 14.12:1) |
| `danger` | `signal-red` (#FF3131) / same | **`text-monoblack`** / **`text-monoblack`** | **5.19** / 5.19 | Default `text-white` is **3.66:1** — AA fail (passes only AA-Large). Override to mono-black mandatory. |
| `info` | `signal-blue` (#004AAD) / same | `text-white` / `text-white` | **8.13** / 8.13 | OK both themes |

**Compound variant override summary for `selected: true` (which is always solid per decision 5):**

```tsx
// Plan B will encode these as compound variants in cva
selected solid + variant="neutral" → text-white
selected solid + variant="brand"   → text-button-fg          (white light / mono-black dark — token already exists)
selected solid + variant="accent"  → text-guardia-gray-900   // override — Chip-specific, mono-black both themes
selected solid + variant="success" → text-guardia-gray-900   // override — Chip-specific, also tracks Badge fix #173
selected solid + variant="warning" → text-guardia-violet-900 // matches Badge (~ mono-black; 14.12:1)
selected solid + variant="danger"  → text-guardia-gray-900   // override — Chip-specific, mono-black both themes
selected solid + variant="info"    → text-white
```

4 of 7 variants need a foreground override. Three of them (`accent`, `success`, `danger`) are **Chip-specific deviations from Badge**. Badge today ships `text-white` over `signal-green` (2.43:1) and over `signal-red` (3.66:1) and over `orange-500` (3.15:1) — all AA-failing. Follow-up [#173](https://github.com/guardiatechnology/design-system/issues/173) tracks aligning Badge to the same overrides after #168 lands.

### 7. ADR-002 applies to every variant

[ADR-002](ADR-002-hover-on-action-surfaces.md) — hover MUST NOT override `data-[state=checked]` / `selected: true` on `bg-action` surfaces.

This ADR-003 extends the policy to **every variant** when in `selected: true`. Hovering a `<Chip selected variant="warning">` does not switch to a yellow-hover token; the solid yellow stays stable. Same rule, broader surface.

Rationale: the hover-on-checked policy was a UX consistency call, not a brand-specific one. Applying it only to `brand` would create the exact divergence ADR-002 set out to eliminate.

## Consequences

### Backward-compat preserved (no breaking change)

- **Default `variant="brand" appearance="outline"`** renders byte-identically to today's `<Chip>` per the mapping table in decision 4.
- **`bg-action` flip** preserved for `selected: true` by intentional divergence from Badge in decision 3.
- **Hover stability on selected** (ADR-002) applies to all variants.

### New consumer-facing behavior

- 7 variants × 3 appearances = 21 visual cells to learn (Storybook MDX is the canonical reference).
- The `appearance × selected` asymmetry (decision 5) — Plan B Storybook prop table MUST highlight it in the description text, not just in code.

### Out of scope for this Plan

- Updating Badge to align its `solid success`/`solid danger`/`solid accent` AA failures. Tracked as [#173](https://github.com/guardiatechnology/design-system/issues/173). #168 Plan B can land before #173 lands — Chip ships AA-compliant; Badge follows.
- Migration of existing consumer call sites to use the new variants. The backward-compat default of decision 4 makes this a follow-up activity, not a precondition.
- New tokens beyond what `ui_kit/styles/index.css` already exposes. Every variant maps to an existing token.

## Validation matrix — Plan B scope

- **21 visual stories** (7 variants × 3 appearances) × 2 states (`selected: true` / `false`) × 2 themes (light / dark) = **84 visual snapshots** for regression baselines on Ubuntu/CI.
- **14 jest-axe assertions** (7 variants × 2 states) × `axeInThemes(container)` = **28 axe runs** for WCAG verification.
- **14 brand-token guard tests** (7 variants × 2 states) asserting positive token presence + negative absence of legacy `guardia-violet-*` literals.

## Addendum — outline resting fg policy (2026-05-25, PR #175)

**Context.** The decision table in section "Selected solid mapping" pins the fg for every `selected: true` combination. The 7 outline `selected: false` combinations were not pinned in the original ADR — only `appearance="outline" variant="brand"` was constrained by the backward-compat invariant (decision 4: `bg-background border-border-strong text-foreground`). The other 6 outline variants needed an explicit fg choice during implementation.

**Decision.** Non-brand outline resting variants use **variant-tinted border + neutral `text-foreground`** (i.e., `border-{variant-token}` + `text-foreground`, no background). Rationale:

1. `text-foreground` against `bg-background` already meets WCAG AA in both themes (validated by the existing surface tokens).
2. Tinting the text with the variant token would require per-variant fg WCAG validation against `bg-background` in light and dark — most signal colors fail AA against the resting background.
3. The variant signal in outline mode is carried by the border, not by the text — the border has a lower WCAG threshold (3:1 for non-text UI per WCAG 1.4.11) and every signal-* token clears it against `bg-background`.
4. Hover compounds add a soft variant-tinted background (`bg-{variant-token}/10` or `/15`) without changing fg, so the affordance is preserved without re-validating contrast.

**Impact.** Backward-compat for `appearance="outline" variant="brand"` is unaffected (border is `border-border-strong`, fg is `text-foreground` — identical to pre-#168). The 6 new outline variants follow this rule.

**Not a violation of decision 5.** Decision 5 (asymmetry: selected always wins → solid) is unchanged. This addendum only fills the resting half of the outline table.

## References

- [ADR-002 — hover-on-action-surfaces](ADR-002-hover-on-action-surfaces.md)
- Tech Task [#125](https://github.com/guardiatechnology/design-system/issues/125) — brand-aware token migration (closed)
- Tech Task [#168](https://github.com/guardiatechnology/design-system/issues/168) — parent of this ADR
- Plan [#171](https://github.com/guardiatechnology/design-system/issues/171) — this ADR's plan
- Tech Task [#173](https://github.com/guardiatechnology/design-system/issues/173) — Badge solid success/danger/accent WCAG follow-up (spawned by this analysis)
- `lex-brand-colors` — palette and WCAG combination rules
- `lex-frontend-accessibility` — WCAG 2.1 AA requirements
- `Badge` source: `ui_kit/components/badge/index.tsx`
- Chip current implementation: `ui_kit/components/chip/index.tsx` (lines 30–36 for default `selected: false` rendering)
- Tokens: `ui_kit/styles/index.css` (`--action`, `--accent-brand`, `--success`, `--warning`, `--danger`, `--info`, `--button-fg`, `--button-fg-hover`)
