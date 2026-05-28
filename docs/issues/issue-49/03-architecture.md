# Architecture — Plan #49 / Parent #48

## Strategy

**Test/story-only delta with brand-aware verification.** No `index.tsx` change anticipated — the component already uses brand-aware tokens consistent with PR #226 (Notion-canonical CTA hierarchy). The work is to:

1. Add `DarkTheme` story matching the canonical Checkbox/Input pattern.
2. Extend the test suite with the missing semantic surfaces from AC-5 / AC-6 / AC-7.
3. Brand-verify via Notion MCP in Phase 7; surface any post-#226 divergence (none expected).

## Affected Components (scope table)

| Path | Change | Why | AC |
|------|--------|-----|----|
| `ui_kit/components/radio/Radio.stories.tsx` | Add `DarkTheme` story (per Checkbox pattern) | Close the v0.1.0 DoD dark-mode coverage gap | AC-1 |
| `ui_kit/components/radio/radio.test.tsx` | Extend with +6 to +9 new behavioral tests + +2 a11y surfaces | Close AC-5 (deselect/ArrowUp/Tab-exit/aria-checked/aria-required/aria-label), AC-6 (fieldset/legend), AC-7 (single-standalone + label-association + fieldset surfaces in axeInThemes) | AC-4, AC-5, AC-6, AC-7 |
| `docs/issues/issue-49/01-brief.md` | Created Phase 1 | Workflow artifact | — |
| `docs/issues/issue-49/02-requirements.md` | Created Phase 2 | Workflow artifact | — |
| `docs/issues/issue-49/03-architecture.md` | Created Phase 3 (this file) | Workflow artifact | — |
| `docs/issues/issue-49/05-security-review.md` | Phase 5 | Workflow artifact | — |
| `docs/issues/issue-49/06-quality-report.md` | Phase 6 | Workflow artifact | — |

## Not Affected (declared)

- `ui_kit/components/radio/index.tsx` — no change.
- `docs/src/pages/componentes/radio.astro` — already exists; verification only.
- `ui_kit/test-utils/a11y.ts` — already provides `axeInThemes`; consumed unchanged.
- Tokens (`ui_kit/styles/index.css`) — unchanged; PR #226 already aligned.
- Any sibling component — Plan #51 (Select) is the parallel sibling and lives in its own worktree/branch.

## Approach

### DarkTheme story

Mirror the `Checkbox.stories.tsx::DarkTheme` shape (lines 110–170): `globals.theme = "dark"`, `parameters.backgrounds.default = "dark"`, render matrix that exercises:

- Sizes (`sm`, `md`) × states (unchecked, checked, disabled, invalid).
- Horizontal + vertical orientation.
- `<RadioGroup>` with `<Radio label="..." description="...">` compound.
- `<fieldset><legend>...</legend><RadioGroup name="...">` form-grouping pattern.

Every interactive element has an accessible name (label prop OR aria-label on RadioGroup). No raw violet hex; tokens only. Mitigates the Plan #208 trap (label-less Inputs).

### Test extensions

Group A — behavioral (AC-5 gaps):
- `// AC-5(a)` — clicking another option deselects the previously selected one (single-selection group semantics).
- `// AC-5(b)` — ArrowUp moves focus to previous radio (closing the cycle started by the existing ArrowDown test).
- `// AC-5(d)` — Tab from a focused radio moves focus outside the group (roving tabindex exits, does not cycle internally).
- `// AC-5(g)` — checked radio reports `aria-checked="true"` (semantic, not only `data-state`).
- `// AC-5(h)` — `<RadioGroup aria-label="...">` is queryable via `getByRole("radiogroup", { name: /.../ })`.
- `// AC-5(i)` — `<RadioGroup required>` applies `aria-required="true"` (Radix passthrough).

Group B — fieldset / legend (AC-6):
- `// AC-6` — `<fieldset><legend>X</legend><RadioGroup>...</RadioGroup></fieldset>` exposes the legend as the group's accessible name AND the radiogroup remains queryable.

Group C — a11y matrix expansion (AC-7 — 2 new surfaces):
- `// AC-7(v)` — RadioGroup with external `<label htmlFor>` association (the Standalone pattern from the story).
- `// AC-7(vi)` — `<fieldset><legend>` + RadioGroup full composition.

Both run through `axeInThemes(container)` (light + dark).

### Filename casing

`radio.test.tsx` remains lowercase (surfaced as Tangential Finding TF-1 in requirements; not in scope unless Fernando flags).

## Risks

- **R1 — Visual baselines:** if CI is configured to snapshot the DarkTheme story, new baselines may be needed. Mitigation: apply the `regenerate-baselines` label on the PR after first CI run, if and only if CI fails for that reason.
- **R2 — axe `label` rule on dark surface:** mitigated by ensuring every Radio in DarkTheme has an explicit label and every RadioGroup an `aria-label`. Plan #208 lesson applied.
- **R3 — Radix `aria-required` behavior:** Radix may not propagate `required` to `aria-required`. If the test fails, the AC pivots to assertion-via-attribute on the `RadioGroupPrimitive.Root` element, OR the test is dropped with a Tangential Finding recommending a `required` prop addition (new Plan). Tested-first: I'll write the assertion and adapt if needed.
- **R4 — Sibling Plan #51 (Select):** running in parallel; isolated by dedicated worktree under `.worktrees/49-review-radio-v0-1-0-dod/`. Conflict probability near zero (different files).

## Stacked PRs Decision Checklist (per `codex-stacked-prs`)

Single atomic PR per Plan #49 contract (`lex-agent-planning`: one Plan = one PR). Decomposition not applicable — `stack.approved: false` in checkpoint.

## ADRs

None. No architectural decision; existing brand-token contract is already accepted (Tech Task #125, PR #226).
