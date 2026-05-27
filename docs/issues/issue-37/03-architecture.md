# Phase 3 — Architecture: Plan #37 (Checkbox v0.1.0 DoD review)

## Inspection of current state (entry baseline on `main @ d03593e`)

The Checkbox component was inspected in its entirety before drafting Phase 4 scope.

### `ui_kit/components/checkbox/index.tsx` — 201 LoC

- **Base:** Radix `<CheckboxPrimitive.Root>` (`<button role="checkbox">` with hidden input for form submission).
- **Variants:** sizes `sm` (16 px box / 12 px icon / 13 px label) and `md` (18 px box / 14 px icon / 14 px label, default).
- **States:** `unchecked` / `checked` / `indeterminate` (via `aria-checked="mixed"`) / `invalid` / `disabled`. `indeterminate` overrides `checked` when both passed.
- **Composition:** optional `label` + `description` wrap in `<label htmlFor>` (clickable); when neither passed, returns the bare checkbox for headless use.
- **Brand-aware classes (zero hardcoded colors):**
  - Border: `border-border-strong`, `hover:border-action`, `aria-[invalid=true]:border-destructive`
  - Background: `bg-background` (idle), `data-[state=checked]:bg-action`, `data-[state=indeterminate]:bg-action`
  - Indicator (icon) color: `data-[state=checked]:text-button-fg`, `data-[state=indeterminate]:text-button-fg`
  - Focus ring: `focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2`
  - Disabled: `disabled:cursor-not-allowed disabled:opacity-55`
- **Accessibility:**
  - `aria-invalid="true"` when `invalid`
  - `aria-describedby` auto-wired when `description` passed
  - `aria-checked="mixed"` for indeterminate (Radix-native)
  - Keyboard: Space toggles (Radix-native)
- **Icons:** `lucide-react` `Check` and `Minus` (size-scaled, `strokeWidth={3}`, `aria-hidden="true"`).

### `ui_kit/components/checkbox/Checkbox.stories.tsx` — 109 LoC, 11 stories

Default, WithDescription, Checked, Indeterminate, Invalid, Disabled, DisabledChecked, Sizes, Standalone, Group. **No `DarkTheme` story** — this is the canonical delta for this Plan.

### `ui_kit/components/checkbox/checkbox.test.tsx` — 208 LoC, 25 test cases

- 19 behavioral `it` cases: role, label wrapping, description + `aria-describedby`, click via label, `checked` data-state, indeterminate `aria-checked="mixed"`, indeterminate-overrides-checked, `aria-invalid`, disabled blocks click, sizes, id auto-gen + custom, brand-aware classes (checked / indeterminate / hover), focus-visible ring, Space toggle, custom className + wrapperClassName.
- 6 `a11y describe` cases: jest-axe via `axeInThemes(container)` on unchecked + label, checked + label, indeterminate + label, label + description, invalid, disabled.
- All queries use `getByRole("checkbox")` / `getByText` / `getByLabelText` — zero structural selectors.
- Zero internal collaborator mocks (only `vi.fn()` on the `onCheckedChange` callback, which is the user-supplied boundary).

**Test count baseline: 25 ≥ 20 required by AC-4.** **a11y light + dark coverage: complete for AC-5.**

## Decision (D1): scope of the Plan

The Checkbox component, its tests, and its existing stories already substantively satisfy AC-2 (partial — missing canonical `DarkTheme` story), AC-4 (full), AC-5 (full), and AC-6 (full at the token level — divergence routed to #208). The only mechanical delta required to close the DoD gap is the addition of the canonical `DarkTheme` story, matching the pattern established by Avatar PR #119 and IconButton PR #205.

**Implementation surface:** `ui_kit/components/checkbox/Checkbox.stories.tsx` — append one story (`DarkTheme`) of approximately 80–110 LoC rendering a matrix of (sizes × states) plus label/description and invalid/disabled instances over a Mono Black surface, with `globals.theme = "dark"` and `parameters.backgrounds.default = "dark"` per the established convention.

**Out of scope (confirmed):** `index.tsx`, `checkbox.test.tsx`, design tokens, Astro playground page, Storybook toggle infra.

## Decision (D2): test additions — none required

Test count (25) is above the AC-4 threshold (20). a11y coverage covers all six canonical surfaces required by AC-5. Adding tests beyond the minimum without a behavioral driver would constitute scope creep under `lex-issue-driven` Rule 6. **No test file changes.**

## Decision (D3): Brand × Notion verification — divergence routed, not fixed

Per `mcp__claude_ai_Notion__notion-fetch` on `Branding → Cores → Aplicação em botões e ações`:

> Primário (CTA principal) — Violeta 500 (#4f186d), texto Branco — 7.85:1 AAA
> Foco (anel) primário — Laranja 500 (#e07400)
> "Em superfícies escuras, laranja assume o papel de cor de ação preferencial por ganho de contraste sobre fundos profundos. A hierarquia se inverte nesse contexto e está documentada na página de Dark Mode."

The Checkbox checked / indeterminate state currently uses `bg-action`, which resolves to Laranja in light mode (the inverse of Notion's canonical light-mode CTA mapping). This is the **same divergence** already surfaced during Plan #21 (Button) and routed to dedicated **Tech Task #207 / Plan #208** (Brand inversion `--primary` / `--secondary`).

**No token mapping changes here.** The PR body references #208 explicitly. Per `lex-agent-focus-on-active-plan` and `lex-no-silent-tech-debt`, this finding is surfaced (not silent) and routed to its dedicated owner (not re-opened).

Typography: Checkbox does not declare a `font-family`; it inherits from the design-system root token chain (`'Poppins', 'Roboto', sans-serif`). Label / description sizes resolve to `text-sm` / `text-xs` from the existing token scale — no hex, no font replacement.

Logo: not applicable to this component.

## Decision (D4): `lex-design-system-library` Radix import

`index.tsx` imports `@radix-ui/react-checkbox`. The ESLint rule `no-restricted-imports` in the consumer-product context blocks `@radix-ui/*`, but **this repository IS the `@guardia/design-system` source** — Radix consumption inside the design-system library itself is the intended path (same pattern as Button, IconButton, ButtonGroup, Avatar, Label, Skeleton, Slider, etc.). No change required.

## Components / files matrix (PR scope)

| File | Status | Reason |
|---|---|---|
| `ui_kit/components/checkbox/Checkbox.stories.tsx` | **modified** (append `DarkTheme`) | AC-2 canonical dark-mode coverage story |
| `ui_kit/components/checkbox/index.tsx` | unchanged | No behavioral change required |
| `ui_kit/components/checkbox/checkbox.test.tsx` | unchanged | 25 ≥ 20 tests, full `axeInThemes` coverage |
| `docs/issues/issue-37/01-brief.md` | **new** | Phase 1 artifact |
| `docs/issues/issue-37/02-requirements.md` | **new** | Phase 2 artifact |
| `docs/issues/issue-37/03-architecture.md` | **new** | Phase 3 artifact |
| `docs/issues/issue-37/05-security-review.md` | **new** | Phase 5 artifact |
| `docs/issues/issue-37/06-quality-report.md` | **new** | Phase 6 artifact |

Any other file in the diff = scope creep, block at Gate 2.

## ADRs

No new ADR required. The Plan documents an inspection + minimal canonical-pattern addition; the only architectural decision worth recording (Brand × Notion inversion) is already owned by Plan #208 and would be recorded there, not here.

## Stacked PR decomposition

Not applicable. Single-PR delta (one file modified + 5 docs). `stacked_prs.tool` is commented in `.directives` (default `vanilla`); no decision checklist signals are met.

## Risks

| Risk | Mitigation |
|---|---|
| Visual baselines may diff on first push due to new `DarkTheme` story | Apply `regenerate-baselines` label on the PR (Ubuntu/CI SoT per `feedback_visual_regression_ubuntu_sot.md`) |
| Fernando interprets the Brand divergence as in-scope | Architecture doc + PR body explicitly route to #208 |
| Pre-existing 27 lint warnings on `main` get blamed on this PR | Quality report explicitly distinguishes baseline warnings from PR-introduced warnings (must remain at 27, not 28+) |
