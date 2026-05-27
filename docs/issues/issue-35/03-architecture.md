# Architecture — Issue #35

## Affected components (scope table)

| Path | Action | Reason |
|------|--------|--------|
| `ui_kit/components/spinner/spinner.test.tsx` | Expand | Add jest-axe (light + dark) coverage and bring suite to ≥ 20 tests per v0.1.0 DoD. |
| `ui_kit/components/spinner/index.tsx` | Read-only | Public API frozen for v0.1.0. No edit. |
| `ui_kit/components/spinner/Spinner.stories.tsx` | Read-only | 7 stories already cover Default + size + color + dark + custom-label + decorative. No edit. |
| `docs/issues/issue-35/` | Create | Phase 1–6 artifacts. |

**Scope guardrail (`lex-no-silent-tech-debt` + `lex-agent-focus-on-active-plan`):** any
file outside the table above is out of scope. If a finding surfaces during execution, it
goes to a Issue-#35 comment with the 3-option Tangential Finding Protocol, never silently
into this PR.

## Design decisions

### D-1 — Reuse `axeInThemes` helper, do not reinvent

`ui_kit/test-utils/a11y.ts` already centralizes the canonical pattern: flip
`data-theme` on `document.documentElement`, run `axe()`, assert `toHaveNoViolations()`,
restore prior attribute on teardown. Badge, Card, DatePicker, Checkbox, Chart already adopt
it. Spinner joins the same path — zero new infrastructure. (Per `lex-dry`: single locus for
the theme-flip + axe-run domain knowledge.)

### D-2 — Decorative variant replaces "disabled" axis

The DoD template lists `Default` / primary state / `disabled`. Spinner has no `disabled`
prop (non-interactive). The `aria-hidden` decorative variant carries equivalent semantic
weight (it changes the ARIA surface) and is the right thing to axe-check. Documented
explicitly in AC-4 and in test names.

### D-3 — Inline-in-button axe coverage included

Spinner is primarily consumed inline within a `<button>` (per `Inline` story and component
docstring). The new axe-clean block exercises this composition without instantiating the
real `<Button>` (cross-component scope creep) — a plain `<button>` element is enough to
prove no ARIA misuse from Spinner's side.

### D-4 — Brand × Notion fallback path

Notion read in-session is best-effort. The PR body declares the verification outcome
explicitly: ✅ aligned, ⚠️ divergent (with local mirror update), or 🔔 manual verification
pending (deferred to Fernando). No silent acceptance.

## Theming pattern (recap, no change)

- `vitest.setup.ts` extends `expect` with `toHaveNoViolations` once, globally.
- `axeInThemes(container)` flips `data-theme="light"` → axe → `data-theme="dark"` → axe →
  restore. The DS reacts entirely via CSS (no React re-render needed for the flip).
- jsdom has no real layout, so axe focuses on ARIA / role / name correctness, not visual
  contrast. The Storybook + Storybook a11y addon covers the visual axis.

## ADRs

No new ADR. The change is additive to an existing pattern already in production (#125,
adopted by 5+ components). The scope is closing the v0.1.0 DoD gap on a single component.

## Stacked PR Decomposition

Not applicable. Single small PR (one component, one test file expansion, ≤ 100 LoC delta).
Decision Checklist signals: 0 high signals (no multi-bounded-context, no multi-stack, no
multi-layer touch, no parallelizable workstreams). Single PR route is correct.

## Risks

- **R-1 — Test runtime budget:** axe runs add ~200ms each. Suite already small; total
  delta < 1s. Within `lex-test-isolation` budget (< 60s unit suite). Mitigation: none
  needed.
- **R-2 — Visual baselines diff on Ubuntu:** any change to Spinner stories would force a
  baseline regeneration. We are NOT touching stories — no baseline impact expected. If CI
  flags a baseline diff anyway (cosmetic re-render from test setup interaction), the PR
  notes `regenerate-baselines` label per user guardrail; baselines are NOT regenerated from
  macOS.
- **R-3 — Notion access:** if Notion MCP is unavailable in-session, fallback per D-4.
