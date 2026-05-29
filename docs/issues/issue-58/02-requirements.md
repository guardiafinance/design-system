# Phase 2 — Requirements · Issue #58

- **Plan sub-issue:** #252
- **Component:** `ConfidenceIndicator` (net-new)
- **Path:** `ui_kit/components/confidence-indicator/`
- **Stack alignment:** v0.1.0 Definition of Done for migrated components

## Acceptance Criteria (numbered, AC-N)

### Code surface

- **AC-1** — `ConfidenceIndicator` is exported from `ui_kit/components/confidence-indicator/index.tsx` and re-exported from `ui_kit/components/index.ts`. The barrel additionally exports the supporting types `ConfidenceLevel`, `ConfidenceVariant`, `ConfidenceSize`, and the CVA accessor `confidenceIndicatorVariants` (consumer access for class overrides).
- **AC-2** — `value` prop accepts a number in `[0, 100]`. Values outside the closed interval are clamped (`< 0 → 0`, `> 100 → 100`); `NaN` and `undefined` fall back to the explicit `level` prop when provided, otherwise to `high` (legacy parity). The clamp is observable in `aria-valuenow`.
- **AC-3** — `level` prop (`"high" | "medium" | "low"`) overrides automatic derivation from `value`. When both are provided, `level` wins and `aria-valuenow` still reflects the clamped `value`.
- **AC-4** — `variant` prop selects the visual treatment: `"chip"` (default), `"bar"`, `"dot"`. The three treatments share the same semantic ARIA surface but differ in DOM composition.
- **AC-5** — `size` prop selects the visual scale: `"sm"` (compact) or `"md"` (default). Applies coherently to `chip` (padding + font-size), `bar` (track height), `dot` (bullet size + label font-size).
- **AC-6** — `showValue` prop (default `true`) toggles the numeric percentage label. When `false`, the percentage is removed from the visible DOM but `aria-valuenow` is preserved.
- **AC-7** — `label` prop accepts `React.ReactNode` and replaces the default level label (e.g., "Alta confiança"). For `dot` and `chip` the label is the inline text; for `bar` it is the row caption. When omitted, the label falls back to `levelLabels[level]`.
- **AC-8** — `levelLabels` prop accepts `Partial<Record<ConfidenceLevel, string>>` with pt-BR defaults `{ high: "Alta confiança", medium: "Revisar", low: "Atenção" }`. Partial overrides merge with defaults (consumer-supplied keys win; unsupplied keys keep defaults).
- **AC-9** — `className` prop merges with internal classes via `cn` (project utility); `...rest` props are forwarded to the root element.

### Visual / token contract

- **AC-10** — Component uses **only semantic tokens** from `ui_kit/styles/index.css`. No hardcoded hex, no `oklch(`, no inline `style={{ color: '#...' }}`. Permitted token surface: `--signal-green`, `--signal-yellow`, `--signal-red` and their `-100`/`-200`/`-700` mixes; `--success-soft`, `--warning-soft`, `--danger-soft`; `--fg`, `--fg-muted`, `--bg`, `--bg-subtle`, `--border`, `--guardia-yellow-{100,200,900}` for the medium-tier surface where signal-yellow + black-text-on-yellow yields the WCAG-AAA pairing already used by Badge.
- **AC-11** — Each tier surface meets **WCAG 2.1 AA contrast** for normal text (≥ 4.5:1) on both `light` and `dark` themes. The recompute matrix follows the **Badge ADR-003** pattern: text colour is derived (`color-mix(in oklab, signal-X N%, black)` or `text-guardia-*-900`) such that the tint-background pairing crosses the threshold. Specifically:
  - `high.chip` — surface `success-soft` (#D6F5E6), text `mix(signal-green 52%, black)` → ≥ 7:1
  - `medium.chip` — surface `guardia-yellow-100`, text `guardia-yellow-900` → ≥ 7:1 (per Badge AAA fallback)
  - `low.chip` — surface `danger-soft` (#FFE0E0), text `mix(signal-red 45%, black)` → ≥ 6:1
- **AC-12** — `bar` variant uses the raw signal colours (`signal-green` / `signal-yellow` / `signal-red`) for the fill; the track is `guardia-gray-200` (or dark equivalent via theme) — fill colour is decorative, the meaningful contrast is the text label adjacent to it (covered by AC-11). Fill width is `clamp(value, 0, 100)%`. The transition uses `transition-[width] duration-300` to match the legacy `360ms` ease without coining new motion tokens.
- **AC-13** — `dot` variant uses a `8px × 8px` bullet (`sm`) / `10px × 10px` (`md`) filled with the tier signal colour, ring-shadowed at 22-28% mix per legacy reference. Label colour falls back to `--fg`.
- **AC-14** — Numeric typography uses `font-variant-numeric: tabular-nums` (already present on the legacy `.grd-ci` base) so the percentage column does not jitter between consecutive renders. This is applied via the Tailwind utility `tabular-nums` on the value span.
- **AC-15** — Light/dark theme parity: the component is stateless w.r.t. theme; styling is driven exclusively by tokens declared in both `data-theme="light"` and `data-theme="dark"` blocks of `ui_kit/styles/index.css`. No theme-conditional JS.

### Accessibility

- **AC-16** — The root element carries `role="meter"` with `aria-valuenow={Math.round(clamp(value, 0, 100))}`, `aria-valuemin={0}`, `aria-valuemax={100}`. When `value` is undefined (level-only mode), `aria-valuenow` is omitted and `aria-valuetext` is supplied with the resolved level label so AT users still hear the tier.
- **AC-17** — `aria-valuetext` always reflects the human-readable summary: `` `${label} ${rounded}%` `` when value is known, or `label` alone when value is unknown. This is the source of truth for screen-reader output (the visible percentage and the AT announcement stay aligned).
- **AC-18** — `aria-label` is supplied automatically as `` `Confiança: ${aria-valuetext}` `` so the component is announceable even when used without an external label association. Consumers can override via prop.
- **AC-19** — `jest-axe` runs `expect(container).toHaveNoViolations()` in **both light and dark** themes on the following matrix: Default (high implicit) + level=high + level=medium + level=low + variant=chip + variant=bar + variant=dot + showValue=false + custom label. Confirmation that signal-tier surfaces clear AA in dark theme is the AC's primary lift.
- **AC-20** — Keyboard / focus: the root element is **non-focusable by default** (it is a presentational scalar meter; not interactive). Consumers wrapping it in a clickable affordance (e.g. `<button>`) carry their own focus and `aria-describedby` wiring; the component does not interfere.

### Tests

- **AC-21** — `ConfidenceIndicator.test.tsx` exercises behavior via accessible queries (`getByRole("meter")`, `getByLabelText`, `getByText`), per `lex-frontend-testing`. No mocking of internal collaborators.
- **AC-22** — Test count ≥ 20 OR coverage ≥ 80 % on the component file (per the issue body DoD).
- **AC-23** — Every test (or grouped block) carries an `AC-N` reference in name or comment so the AC↔test traceability matrix is mechanically auditable at Gate 2.
- **AC-24** — `jest-axe` matrix from AC-19 is implemented via `axeInThemes` helper from `ui_kit/test-utils/a11y.ts`.

### Storybook

- **AC-25** — `ConfidenceIndicator.stories.tsx` covers at minimum: `Default`, `Levels` (low/medium/high side-by-side), `Variants` (chip/bar/dot side-by-side), `Sizes`, `WithoutValue`, `CustomLabel`, `InContext` (mimicking the playground's agent-suggestion row). All stories render correctly in **light AND dark** via Storybook theme toolbar.

### Docs (Astro)

- **AC-26** — `docs/src/pages/componentes/confidence-indicator.astro` is created with the standard `ComponentPreview` layout, kicker `"COMPONENTES · FEEDBACK"` (since the practical UX category is feedback / AI, not overlay), `group: "Feedback"`, `storybookId` pointing to the default story, `sourcePath` to the component dir, and lede copy aligned with `lex-brand-voice` (direct, strategic, affirmative — no buzzwords).
- **AC-27** — `docs/src/previews/confidence-indicator.tsx` exposes the named exports consumed by the Astro page (preview rows for Basic, Variants, Levels, Sizes, InContext). A `confidence-indicator-live.tsx` is added if a live snippet is needed for the docs page (mirrors Tooltip pattern).
- **AC-28** — `ConfidenceIndicator` is added to the `MIGRATED` Set in `docs/src/pages/index.astro` so the sidebar deeplinks to the component page.

### Build / quality

- **AC-29** — `npm run typecheck && npm run lint && npm run test && npm run build && npm run docs:build` all green on the worktree branch before commit.
- **AC-30** — Single atomic signed commit `feat(confidence-indicator): migrate to v0.1.0 DoD — chip/bar/dot variants, meter role, jest-axe light+dark`, per `lex-small-commits` + `lex-signed-commits`.
- **AC-31** — PR body closes both Plan #252 and parent #58 (`Closes #252` + `Closes #58`).

## Out of scope (explicit)

- Tooltip linkage for "explain confidence" — consumer composes `<Tooltip>` externally.
- Consumer-overridable tier thresholds — fixed at 95 / 80 (legacy Lighthouse cuts) for v0.1.0; future Issue if a real case appears.
- "agent trace" `data-*` attributes for AI trace UI — not in legacy, no consumer demand yet; future evolution.
- `xl` size or `pill` shape variants — legacy has only `sm` / `md`.
- Animation / count-up of the percentage on mount — legacy is static; no consumer wants the motion noise.
- Replacement of `--violet-*` / `--guardia-purple-*` token contract — beyond this component's scope.

## Definition of Done — mapping

| Issue body DoD bullet | Covered by |
|---|---|
| Storybook Default + variants light + dark | AC-25 |
| Playground parity | Phase 3 architecture + manual playground review at Gate 1 sign-off |
| Behavioral tests ≥ 20 OR ≥ 80% coverage | AC-21, AC-22 |
| Brand alignment to Notion | AC-10, AC-11 (tokens), Phase 3 cross-check, Gate 1 explicit confirmation |
| `typecheck && lint && test && build && docs:build` green | AC-29 |
| Single atomic commit | AC-30 |
| Plan closure via `Closes #252` + `Closes #58` | AC-31 |

## Traceability map (skeleton — completed in Phase 6)

| AC | Test file | Test name pattern |
|---|---|---|
| AC-1 | `ConfidenceIndicator.test.tsx` | `"exports public surface"` |
| AC-2 | `ConfidenceIndicator.test.tsx` | `"clamps value to [0, 100]"` + `"falls back to level when value is invalid"` |
| AC-3 | `ConfidenceIndicator.test.tsx` | `"level prop overrides derived level from value"` |
| AC-4 | `ConfidenceIndicator.test.tsx` | `"renders variant chip / bar / dot"` (3 tests) |
| AC-5 | `ConfidenceIndicator.test.tsx` | `"applies size sm / md"` (2 tests) |
| AC-6 | `ConfidenceIndicator.test.tsx` | `"showValue=false hides percentage from DOM"` + `"showValue=false preserves aria-valuenow"` |
| AC-7 | `ConfidenceIndicator.test.tsx` | `"custom label overrides default level label"` |
| AC-8 | `ConfidenceIndicator.test.tsx` | `"levelLabels partial override merges with defaults"` |
| AC-9 | `ConfidenceIndicator.test.tsx` | `"className merges"` + `"forwards rest props to root"` |
| AC-10, AC-11, AC-12, AC-13, AC-14, AC-15 | implicit (token-only enforced by lint + a11y + visual review) |
| AC-16 | `ConfidenceIndicator.test.tsx` | `"role=meter with aria-valuenow/min/max"` |
| AC-17 | `ConfidenceIndicator.test.tsx` | `"aria-valuetext composes label + percentage"` |
| AC-18 | `ConfidenceIndicator.test.tsx` | `"aria-label has Confiança prefix"` + `"aria-label overridable"` |
| AC-19 + AC-24 | `ConfidenceIndicator.test.tsx` | `"a11y: jest-axe light + dark on N variants"` (multiple) |
| AC-20 | `ConfidenceIndicator.test.tsx` | `"root is not focusable by default"` |
| AC-21–AC-23 | meta — verified at Gate 2 |
| AC-25 | `ConfidenceIndicator.stories.tsx` | story names |
| AC-26–AC-28 | `docs/` paths | file existence + grep `ConfidenceIndicator` in `MIGRATED` |
| AC-29–AC-31 | meta — Gate 6 / Phase 7 |
