# Requirements Brief — Plan #51 (Select v0.1.0 DoD)

## Acceptance Criteria (numbered, traceable)

- **AC-1 — Storybook DarkTheme story (matrix).** `Select.stories.tsx` exports `DarkTheme` that forces `globals.theme="dark"` + `parameters.backgrounds.default="dark"` and renders the critical visual matrix (closed default, with selection, invalid, disabled, with leftIcon, with disabled option). The story follows the canonical docblock pattern (Avatar #119 → Combobox), explaining the Radix Portal trade-off and pointing to `axeInThemes` in `select.test.tsx` for open-state a11y coverage.

- **AC-2 — Storybook light coverage preserved.** Pre-existing stories (Default, WithDefaultValue, WithLeftIcon, Sizes, States, WithDisabledOption) continue rendering correctly in light theme via the global toolbar toggle from PR #119 — no regression.

- **AC-3 — Behavioral tests ≥ 20.** `select.test.tsx` has at least 20 behavioral tests using `getByRole`/`getByLabelText`, exercising open/close (click + Escape), keyboard navigation (ArrowDown/Up/Home/End/Enter), selection, controlled vs uncontrolled, disabled option skip, ARIA correctness (`combobox` + `haspopup="listbox"` + `aria-expanded` + `aria-activedescendant` + `aria-controls` + `aria-labelledby`), `name` → hidden input for form submission, `required` propagation, `aria-invalid`, size variants, and brand-aware tokens. **Current: 35 tests — requirement already met by `main`; no regression allowed.**

- **AC-4 — A11y `jest-axe` light + dark matrix.** `select.test.tsx` includes `describe("a11y")` calling `axeInThemes()` on at least: closed default trigger, trigger with selected value, open listbox with selection (scoped on `Popover.Content`), invalid state, disabled state. **Current: 5 axe states — requirement already met by `main`; no regression allowed.**

- **AC-5 — Brand × Notion check (post-#226).** Notion Brand pages (Colors, Typography, Logo) consulted via `mcp__claude_ai_Notion__notion-fetch`. Local mirror (`lex-brand-colors`, `lex-brand-typography`, `lex-brand-logo`) reflects post-#226 inversion (`--primary` is violet-500 in light / orange-500 in dark). No new divergence introduced by this PR. Surface ONLY new findings — pre-existing alignment is not re-litigated.

- **AC-6 — CI pipeline green.** `npm run typecheck && npm run lint && npm run test && npm run build && npm run docs:build` all pass locally before push; CI confirms on the PR.

- **AC-7 — Playground side-by-side at `/componentes/select`.** Astro docs page renders Select examples side-by-side with the cross-iframe theme toggle (PR #119). Listed as a manual verification checkbox in the PR body for Fernando.

- **AC-8 — Visual / functional gap list in PR body.** PR description includes a "Findings" section enumerating ANY visual or functional gap detected (or "none" if clean).

- **AC-9 — PR closes Plan #51 AND parent #50.** PR body contains both `Closes #51` and `Closes #50` on separate lines (new convention from prior reviewed components). Plan label transitions to `status: to review` on PR open via `lex-agent-planning`.

- **AC-10 — Fernando "está bom".** Explicit human approval captured on the PR before merge.

## Definition of Done (composed)

DoD = AC-1 ∧ AC-2 ∧ AC-3 ∧ AC-4 ∧ AC-5 ∧ AC-6 ∧ AC-7 ∧ AC-8 ∧ AC-9 ∧ AC-10.

## Trace to Plan #51 body

| Plan #51 checkbox | Mapped ACs |
|---|---|
| `npm run dev:all` + `/componentes/select` | AC-7 |
| Storybook Default + variantes light + dark | AC-1, AC-2 |
| Playground side-by-side | AC-7 |
| Behavioral tests ≥20 or ≥80% | AC-3 |
| A11y jest-axe light + dark | AC-4 |
| Brand × Notion | AC-5 |
| Gap list | AC-8 |
| CI green | AC-6 |
| Fernando "está bom" | AC-10 |
| PR `Closes #51` (+ `Closes #50`) | AC-9 |

## Out of scope (explicit)

- Component implementation changes (`index.tsx`)
- Multi-select API (separate component proposal if needed → new parent Issue)
- Native `<select>` mobile picker fallback
- Token refactors beyond #226 (already on `main`)
