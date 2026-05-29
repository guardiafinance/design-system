# ADR-013 — Migrate ConfidenceIndicator to v0.1.0 DoD (AI-first feedback primitive)

- **Status:** accepted
- **Date:** 2026-05-29
- **Deciders:** @seguim (CODEOWNER), `warrior-athena` (Issue-Driven flow orchestrator)
- **Precedent:** ADR-003 (Badge variants — WCAG fg recompute), ADR-007 (Tooltip v0.1.0 DoD migration — atomic commit pattern)
- **Issue:** [#58](https://github.com/guardiatechnology/design-system/issues/58)
- **Plan:** [#252](https://github.com/guardiatechnology/design-system/issues/252)

## Context

The v0.1.0 catalog migration (Epic #13) requires every component listed in `ui_kit/components/` to satisfy the Definition of Done — semantic tokens only, CVA size ladder, jest-axe coverage in `light` + `dark`, behavioral tests with AC↔test traceability, Storybook + Astro docs page + previews, and atomic signed commit.

`ConfidenceIndicator` is **net-new** at this point on `main` (no prior `ui_kit/components/confidence-indicator/` directory). The legacy reference at `ux_references/ui_kits/components/ConfidenceIndicator/` is the visual + API source of truth — an 84-line single-component-with-variant primitive that communicates the confidence of an AI agent decision via three Lighthouse tiers (`high` ≥ 95 %, `medium` 80-94 %, `low` < 80 %) across three visual treatments (`chip`, `bar`, `dot`). The legacy uses signal colours (`--signal-green`, `--signal-yellow`, `--signal-red`) — which `lex-brand-colors` explicitly reserves for **data viz and critical system states**. Confidence indication is data viz: it summarises a model output quantitatively.

The component lives on the AI-first surface area governed by `lex-ai-first-experience`. The siblings AgentCard (#90, PR #204 in flight) and ChatMessage (#98, PR #221 in flight) are also AI-first; both adopt compound APIs with role/status context cascade because their visual axes (avatar / header / footer / actions) are layout decisions. ConfidenceIndicator has no layout axis — its three variants are visual treatments of the same scalar value.

This ADR records the architectural decisions made for the migration so future maintainers see the lineage of every non-obvious choice.

## Decision

ConfidenceIndicator migrates to v0.1.0 DoD using **the Badge ADR-003 + Tooltip ADR-007 combined recipe**, adapted for the meter semantics:

1. **`role="meter"` over `role="progressbar"`** — WAI-ARIA 1.2 §5.3.18 codifies `meter` as the role for "a scalar measurement within a known range." Confidence is a steady-state scalar (the value the agent reports right now), not a temporal progress toward completion. `progressbar` would mis-signal that the value is monotonically advancing.

2. **Fixed Lighthouse thresholds (95 / 80) as private constants** — consumer-overridable thresholds were considered and rejected. The thresholds carry domain meaning in the Lighthouse system; making them configurable invites cross-product divergence. A future Issue can expose a `thresholds` prop if a real cross-product case appears; today it is YAGNI.

3. **Single-component-with-variant over compound API** — `chip` / `bar` / `dot` are three visual treatments of one semantic scalar. A compound API (`<ConfidenceIndicator><ConfidenceIndicator.Chip>…</ConfidenceIndicator.Chip></ConfidenceIndicator>`) would force the consumer to pick a tree depth for zero gain — there is no opportunity to slot custom sub-elements meaningfully. AgentCard and ChatMessage are compound because they have *layout* axes (avatar, header, footer, status badge); this primitive has none.

4. **Medium-tier *chip* uses `--guardia-yellow-{100,200,900}` instead of `--signal-yellow`** — inherits Badge ADR-003 § "AAA fg fallback". Signal-yellow `#FFDE59` over its own tint produces a ≤ 3 : 1 ratio for normal text, which fails WCAG AA. The Badge ADR resolved this by routing the medium / warning tier to `guardia-yellow-900` over `guardia-yellow-100`. The ConfidenceIndicator chip — which has its own light tier-tinted background regardless of theme — inherits the resolved tokens directly. The **bar variant** sits over the page surface `--bg`, not over a tier tint, and therefore does NOT inherit the chip text colors (see Decision 14).

5. **High and low chip tiers use `color-mix(in oklab, signal-X N%, black)` text over `color-mix(in oklab, signal-X M%, white)` background** — the recipe Badge uses for its `success` and `danger` soft appearances. The black mix moves the text into the AA band over the white-mix surface. `color-mix` is part of the project's existing token vocabulary (used by Badge, Chip, and others), not a new dependency.

6. **`bar` fill consumes raw signal colour** — the bar fill is decorative (the meaningful contrast is the adjacent label text, not the fill against the track). Raw `--signal-green` / `--signal-yellow` / `--signal-red` on a `--guardia-gray-200` track is the legacy reference's recipe and satisfies the 3 : 1 UI minimum because the track is much darker than each signal hue. Adopting this verbatim is the right answer; recomputing here adds tokens without value.

7. **`tabular-nums` everywhere a percentage is rendered** — the percentage column is read in clusters (lists of confidence indicators in the playground's "NF 4891 / 4892 / 4893" pattern). Without tabular numerics the column jitters between consecutive renders.

8. **No leading `lucide` icon in the chip** — divergence from the legacy reference, which mounted `circle-check` / `triangle-alert` / `circle-x` via a global `Icon` component. Reasoning: (a) at `sm` the icon + label + percentage row becomes visually crowded; (b) the chip already communicates the tier via colour + label; (c) consumers who want an icon compose it externally. This reduces visible-DOM dependency by one symbol and keeps the chip readable at every size.

9. **`levelLabels?: Partial<Record<ConfidenceLevel, string>>` for i18n** — the legacy reference hard-codes pt-BR labels. The override is one line of API surface for zero visual cost. Default labels stay in pt-BR (`Alta confiança` / `Revisar` / `Atenção`) per the legacy parity; consumers in other locales merge partial overrides.

10. **`aria-valuetext` + `aria-label` carry the textual summary** — `role="meter"` AT support is historically inconsistent. By always supplying `aria-valuetext` (`"{label} {N}%"` when value known, `"{label}"` when level-only) and `aria-label` (`"Confiança: {valuetext}"`), the component remains announceable even when an AT ignores the scalar `aria-value*` fields.

11. **Non-focusable root by default** — `role="meter"` is a presentational scalar, not an interactive control. Consumers who wrap the component in a clickable affordance (e.g., a row that opens the agent's full reasoning) attach their own focus and `aria-describedby` wiring; the component does not interfere with their flow.

12. **No AI-trace `data-*` attributes today** — emitting `data-confidence-level` / `data-confidence-value` etc. would tie the design-system to a particular trace UI's data contract. The component already exposes `data-level` and `data-variant` for styling / E2E hooks; richer telemetry can be added later under a dedicated Issue when there is a real consumer asking for it.

13. **ADR status `accepted` from creation; atomic commit carries code + ADR + tests + stories + docs together** — Tooltip ADR-007 § "ADR status `accepted` from creation" precedent. Avoids the dual-commit pattern Argos flagged 🟡 on Popover PR #237.

14. **`bar` value text uses `text-fg`, not tier-darkened mixes** — *post-rebase correction.* The original migration applied `barValueClass` mirroring the chip text (`text-guardia-yellow-900` and signal-tier dark color-mixes). The chip body works because its own tint is a fixed light surface in both themes; the bar value, however, sits over `--bg`, which inverts to `#17171B` in dark theme. axe-playwright (browser, CI) correctly flagged `color-contrast` for `text-guardia-yellow-900` (`#664E04`) and `color-mix(in oklab, signal-red 45%, black)` over the dark page surface (≈ 1.6 : 1). jest-axe in jsdom missed the violation because jsdom does not resolve `color-mix(in oklab, ...)` to concrete RGB. The fix routes the numeric value through `text-fg`, which inverts with the theme (purple-500 in light → mono-white in dark) and ≥ 7 : 1 over `--bg` in both themes. Tier identity is preserved by the bar fill (`barFillClass`) and `data-level`. The chip text colors are unchanged.

15. **`aria-valuenow` falls back to the tier floor when only a level is provided** — *post-rebase correction.* WAI-ARIA `role="meter"` requires `aria-valuenow` (axe-core `aria-required-attr`, critical). The original migration omitted the attribute in level-only mode, on the reading that "the value is unknown." axe-playwright correctly flags this in the `WithoutValue` story. The corrected contract: when only a level is asserted, `aria-valuenow` reports the **tier floor** — the lowest scalar still in that level. The qualitative announcement is preserved via `aria-valuetext` (the bare tier label), so the AT reads "Revisar" rather than "80%". The fallback aligns with the bar variant's pre-existing `fillPercent` convention. AC-2 ("undefined / NaN value") and AC-16 ("level-only mode") were updated to assert the floor instead of `null`; the AT-facing announcement is unchanged because `aria-valuetext` takes precedence.

## Consequences

### Positive

- AI-first surface gains a first-class primitive aligned to the v0.1.0 DoD, with `role="meter"` ARIA semantics and WCAG AA across light + dark.
- Confidence reporting on the Guardia platform now flows through one canonical component instead of ad-hoc badges or inline strings. Consumers gain `value` + `level` + 3 variants for free.
- Token reuse is total — no new design tokens are coined. The medium-tier chip text inherits the Badge ADR-003 recompute verbatim; the bar value text uses the project's existing `text-fg` semantic token (see Decision 14).
- Test count comfortably exceeds the Plan DoD (≥ 20) with explicit AC↔test traceability and a jest-axe matrix covering 8 distinct configurations across both themes.

### Negative

- The legacy reference's leading `lucide` icon inside the chip is dropped. Consumers who want the iconic redundancy can compose externally — one extra import per use site. The Storybook `InContext` story documents the consumer-driven composition pattern.
- The `bar` variant introduces a CSS transition (`transition-[width] duration-300 ease-out`) on the fill width. In tests `vitest` + Testing Library run with `jsdom`, which honours the inline `style.width`; visual regressions are produced on the next baseline regeneration ceremony.

### Neutral

- One new component directory (3 files: `index.tsx`, `ConfidenceIndicator.test.tsx`, `ConfidenceIndicator.stories.tsx`). One Astro page + one preview file. One barrel entry. One MIGRATED Set entry. One ADR. No new dependency, no Tailwind config change, no tokens file change, no infra change.

## Alternatives considered

1. **Compound API (`<ConfidenceIndicator.Chip>`, `<ConfidenceIndicator.Bar>`, `<ConfidenceIndicator.Dot>`)** — rejected. The three variants are visual treatments of one semantic scalar, not orthogonal building blocks. Compound here forces tree depth without unlocking custom composition; nothing meaningful slots between a `<Bar>` and its track. AgentCard / ChatMessage have compound APIs because their visual axes are layout decisions; ConfidenceIndicator has none.

2. **Consumer-overridable thresholds** (`thresholds?: { high: number; medium: number }`) — rejected. The thresholds carry Lighthouse-system meaning; making them configurable invites cross-product divergence. YAGNI for v0.1.0.

3. **`role="progressbar"` for the `bar` variant only** — rejected. The role must match the semantics, not the visual. The `bar` variant is the same steady-state scalar as `chip` and `dot`, just rendered as a horizontal magnitude. `progressbar` would mis-signal "this is advancing"; consumers using `<ConfidenceIndicator variant="bar">` to show a 62 % confidence aren't reporting progress toward a goal — they are reporting a confidence level.

4. **Animated count-up of the percentage on mount** — rejected. The legacy reference is static. Animation adds visible motion noise without information gain and risks jest-axe motion-reduce flags.

5. **`xl` size or `pill` shape variants** — rejected. Legacy has only `sm` / `md`. Coining additional variants without consumer demand is overreach.

6. **Emit `data-confidence-level` / `data-confidence-value` for AI-trace UIs** — rejected (for now). The component already exposes `data-level` and `data-variant` for styling; trace-shaped data attributes would tie the design-system to a specific trace UI's data contract. A future Issue can add these when a real consumer asks.

7. **Tooltip linkage for "explain confidence"** — rejected. Composition over expansion. Consumers wrap `<ConfidenceIndicator>` in their own `<Tooltip>` if they want an explanation surface.

8. **Stack PRs** — rejected. Decision Checklist (codex-stacked-prs) returns 1 high signal (LOC bordering 500) + 6 anti-signals → single PR.

## References

- ADR-003 — Chip variants (Badge WCAG fg recompute precedent)
- ADR-007 — Tooltip v0.1.0 DoD migration (atomic-commit-with-accepted-ADR precedent)
- PR [#204](https://github.com/guardiatechnology/design-system/pull/204) — AgentCard migration (AI-first sibling, compound API for layout axes)
- PR [#221](https://github.com/guardiatechnology/design-system/pull/221) — ChatMessage migration (AI-first sibling, role/status context cascade)
- `lex-brand-colors` — signal-colour palette reserved for data viz + critical system states; ConfidenceIndicator qualifies as data viz
- `lex-ai-first-experience` — AI-first surface contract on the Guardia platform
- `lex-frontend-accessibility` — WCAG 2.1 AA enforcement
- `lex-frontend-testing` — Vitest + Testing Library + jest-axe matrix
- Fernando standing memory `feedback_a11y_unit_test_ac.md` — jest-axe light + dark on Default + each tier is an AC, not a bonus
- Fernando standing memory `feedback_visual_regression_ubuntu_sot.md` — baselines are Ubuntu / CI source of truth
- WAI-ARIA 1.2 §5.3.18 — `meter` role specification
- Lighthouse confidence thresholds (Guardia internal) — high ≥ 95 % auto-applied, medium 80-94 % review, low < 80 % human decision
