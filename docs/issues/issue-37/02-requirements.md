# Phase 2 — Requirements: Plan #37 (Checkbox v0.1.0 DoD review)

## Acceptance Criteria (numbered, mapped to DoD)

Each AC maps 1:1 to a DoD checkbox in the Plan #37 body. Tests reference AC-N in their `describe`/`it` titles or docstrings for bidirectional traceability per `lex-issue-driven`.

| AC | Statement | Source DoD bullet | Verification |
|---|---|---|---|
| **AC-1** | `npm run dev:all` runs Storybook + Astro docs; `/componentes/checkbox` opens. | DoD #1 | Human gate (Fernando: local dev:all run) |
| **AC-2** | `Checkbox.stories.tsx` covers Default + main variants in **light AND dark** via the global Storybook toolbar; a canonical `DarkTheme` story exists matching the Avatar PR #119 / IconButton PR #205 pattern (matrix on Mono Black surface). | DoD #2 | Story file diff + Storybook visual check |
| **AC-3** | Astro playground enables side-by-side comparison of `ui_kit/components/checkbox/` vs legacy reference / current production. | DoD #3 | Human gate (Fernando: playground compare) |
| **AC-4** | `checkbox.test.tsx` exercises user behavior via accessible queries (`getByRole`, `getByLabelText`, `getByText`) per `lex-frontend-testing`; covers click, Space toggle, `checked` / `unchecked` / `indeterminate` states, `disabled`, `invalid`, label/description association via `htmlFor` + `aria-describedby`, `aria-checked` correctness; ≥ 20 behavioral test cases OR ≥ 80% file coverage; no mocking of internal collaborators. | DoD #4 | Test count + coverage report at Gate 2 |
| **AC-5** | `checkbox.test.tsx` includes jest-axe coverage in **light AND dark** via `axeInThemes(container)` on at least: Default (unchecked + label), checked, indeterminate, invalid, disabled, label + description. Each assertion uses `expect(...).toHaveNoViolations()` implicitly (handled by helper). | DoD #5 | a11y describe block in test file |
| **AC-6** | Brand × Notion check: colors, typography per Notion Branding canonical page (verified via `mcp__claude_ai_Notion__notion-fetch`). Any divergence with `--primary` mapping is **routed to Plan #208**, not modified here. | DoD #6 | Architecture doc D3 + Fernando "está bom" gate |
| **AC-7** | Any visual or functional gap surfaced explicitly in the PR body (zero silent debt per `lex-no-silent-tech-debt`). | DoD #7 | PR body review |
| **AC-8** | `npm run typecheck && npm run lint && npm run test && npm run build && npm run docs:build` all green. Lint baseline on `main` is 0 errors + 27 pre-existing warnings; this PR introduces 0 new errors and 0 new warnings. | DoD #8 | Gate 2 check log |
| **AC-9** | Explicit "está bom" from Fernando captured on the PR or Plan issue. | DoD #9 | Human gate |
| **AC-10** | PR closes Plan #37 via `Closes #37` and references parent #36 via `Refs #36`. | DoD #10 | PR body |

## Definition of Done (rolled up)

The Plan #37 is `done` when AC-1 through AC-10 are individually satisfied. AC-1, AC-3, AC-6, AC-9 are human gates by construction (playground inspection + "está bom"). AC-2, AC-4, AC-5, AC-7, AC-8, AC-10 are agent-verifiable.

## Out of scope (explicit)

- Implementation changes to `ui_kit/components/checkbox/index.tsx` beyond the existing brand-aware tokens.
- Token mapping inversion for `--primary` / `--secondary` (owned by Plan #208).
- New variants, new sizes, or behavioral additions.
- Storybook / Astro toggle infrastructure (already on `main` via PR #119).
- `axeInThemes` helper changes (already on `main` via Tech Task #125).
- Any other component (siblings #205 / #206 / #209 / #214 / #208 / #39 / #41 run separately).

## Trace to Lexis

| Lexis | How this Plan respects it |
|---|---|
| `lex-frontend-testing` | AC-4 enforces accessible queries + behavioral focus; no internal mocking |
| `lex-frontend-accessibility` | AC-5 covers jest-axe light + dark; component uses `<button role="checkbox">` (Radix) with `aria-checked="mixed"` for indeterminate, `aria-invalid`, `aria-describedby`, focus-visible ring |
| `lex-frontend-typing` | AC-8 enforces `tsc --noEmit` (already strict in tsconfig) |
| `lex-frontend-security` | AC-8 enforces lint (security plugins active); no `dangerouslySetInnerHTML`, no secrets, JSX-only rendering |
| `lex-design-system-library` | Checkbox IS in the design-system source itself; Radix consumption documented in Phase 3 |
| `lex-brand-colors` / `lex-brand-typography` | AC-6: all colors via `bg-action` / `border-action` / `text-button-fg` / `text-fg` tokens, no hardcoded hex; typography via `text-sm` / `text-xs` from the token scale |
| `lex-agent-focus-on-active-plan` | Tangential Brand-inversion finding routed to Plan #208 |
| `lex-no-silent-tech-debt` | Brand × Notion divergence surfaced in Phase 3 + PR body |
| `lex-git-worktrees` / `lex-git-branches` | Worktree at `.worktrees/37-checkbox-v01-dod-review/`, branch `chore/37-checkbox-v01-dod-review` |
| `lex-conventional-commits` / `lex-commit-language` / `lex-small-commits` / `lex-signed-commits` | Commit subjects in English, single-purpose, GPG-signed |
| `lex-pr-quality` | PR mirrors Issue labels, applies size label, `Closes #37`, author assignee |
