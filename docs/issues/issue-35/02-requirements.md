# Requirements — Issue #35

Numbered acceptance criteria for the Spinner v0.1.0 DoD review. Each AC maps 1:N to
behavioral tests in `ui_kit/components/spinner/spinner.test.tsx` via the `AC-N` token in the
test name or comment.

## Acceptance Criteria

### AC-1 — Storybook: Default + main variants in light AND dark

`Spinner.stories.tsx` MUST expose, at minimum:

- `Default` story (no args).
- A story covering every `size` (`xs/sm/md/lg/xl`).
- A story covering every `color` (`current/brand/accent/white`).
- A story rendering on a dark/violet background to exercise `color="white"`.
- A `CustomLabel` story exercising the accessible-name override.
- A `Decorative` story exercising `aria-hidden`.

The Storybook theme addon (already wired) renders every story in light AND dark; the
playground side-by-side comparison MUST be registered in the PR body. The current 7-story
catalog already satisfies this AC — no new story required for v0.1.0.

### AC-2 — Playground side-by-side comparison registered in PR

The PR body MUST include a "Playground side-by-side comparison" section pointing reviewers at
the Storybook stories that exercise each variant in light + dark, with reproduction commands
(`npm run storybook`). No artifact change.

### AC-3 — Behavioral tests with accessible queries

Every test in `spinner.test.tsx` MUST use accessible queries (`getByRole("status", { name }
)`, `getByRole("status")`) as the primary assertion vector. `container.querySelector` is
acceptable ONLY for SVG inspection (decorative child, not exposed via ARIA). No
`getByTestId`. No internal mocks. The suite MUST reach **≥ 20 tests OR ≥ 80% coverage on
`ui_kit/components/spinner/index.tsx`**.

### AC-4 — Mandatory jest-axe in light AND dark

The suite MUST call `axeInThemes(container)` from `@/test-utils/a11y` (which flips
`data-theme` on `document.documentElement` and runs `toHaveNoViolations()` in BOTH `light`
and `dark`) for:

- The `Default` render.
- A render exercising the primary color states (`brand`, `accent`, `current`, `white` on
  matching backgrounds).
- The `aria-hidden` decorative variant (it MUST stay axe-clean even with the role suppressed).

The classic "disabled" axis from the AC template is N/A — Spinner has no `disabled` prop. It
is replaced by the decorative (`aria-hidden`) axis, which carries the same semantic weight:
verify that suppressing the role does not introduce ARIA misuse.

### AC-5 — Brand × Notion: Notion wins; mirror updated if divergent

The Brand check covers the Spinner color palette: `current` (inherits), `brand` →
`guardia-purple-500`, `accent` → `guardia-orange-500`, `white` → `#fff`. These tokens are
the canonical mirror from `.claude/rules/design/brand/lex-brand-colors.md` (Deep Violet
#4F186D / Warm Orange #E07400 in the 500 slot). If Notion diverges, the local mirror is
updated. If the verification cannot be completed in-session (Notion lookup unavailable), the
PR body records "Brand × Notion: manual verification pending" and points to Fernando.

### AC-6 — Quality gate green

The PR MUST be opened with the following commands run to completion with exit code 0:

- `npm run typecheck`
- `npm run lint`
- `npm run test`
- `npm run build`
- `npm run docs:build`

The output (one-line summary per command) is recorded in `06-quality-report.md` and echoed
in the PR body.

### AC-7 — `Closes #35` on merge

The PR body MUST contain the literal `Closes #35` directive. The PR MUST also `Refs #34`
(parent chore). Merge stays with Fernando — Athena does not merge.

## Definition of Done

All ACs above marked ✅ in `06-quality-report.md`, PR opened with assignee `@me` and the
canonical body sections (AC↔test traceability, quality-gate output, Visual baselines, Brand
× Notion), labels mirrored from #35 (`evolvability ♻️`) + size label applied.

## Out of scope

- Spinner public API evolution (props, variants, animation curve).
- Visual regression baseline regeneration (Ubuntu/CI re-run, never from macOS).
- Refactor of Storybook stories or live docs preview.
- Cross-component touch (any non-Spinner file).
