# Architecture Brief — Plan #51 (Select v0.1.0 DoD)

## Scope (delta)

Story-only addition. **No** changes to component source (`index.tsx`) or test surface (`select.test.tsx`) — the test file on `main` already satisfies AC-3 (35 tests) and AC-4 (5 `axeInThemes` states). The only delta needed is **AC-1**: add a `DarkTheme` story to `Select.stories.tsx`.

## Affected components

| File | Change | Reason |
|---|---|---|
| `ui_kit/components/select/Select.stories.tsx` | **Add** `DarkTheme: Story` export with canonical docblock (Avatar #119 / Combobox lineage) | AC-1 |
| `docs/issues/issue-51/01-brief.md` | new | Phase 1 artifact |
| `docs/issues/issue-51/02-requirements.md` | new | Phase 2 artifact |
| `docs/issues/issue-51/03-architecture.md` | new | Phase 3 artifact |
| `docs/issues/issue-51/05-security-review.md` | new | Phase 5 artifact |
| `docs/issues/issue-51/06-quality-report.md` | new | Phase 6 artifact |
| `.ahrena/workflow/issue-51/checkpoint.md` | new | Orchestration state |

**Out of scope** (will not be touched):
- `ui_kit/components/select/index.tsx` — already correctly implemented (Radix Popover, brand-aware tokens, full ARIA)
- `ui_kit/components/select/select.test.tsx` — already exceeds AC-3 and AC-4 floors
- `ui_kit/styles/index.css` — post-#226 tokens already correct
- `ui_kit/test-utils/a11y.ts` — already provides `axeInThemes`

## Design decisions

### DD-1 — Mirror the Combobox `DarkTheme` story structurally (Avatar #119 lineage)

**Decision.** The new `Select.stories.tsx::DarkTheme` story mirrors `Combobox.stories.tsx::DarkTheme` because the two components share the exact same architectural shape (Radix Popover + custom listbox + hidden form input), the same theme contract (`data-theme` toggle on `<html>`), and the same Storybook portal trade-off.

**Why.** Consistency across the design-system surface lowers reviewer overhead and makes regressions in the dark-mode contract easy to spot. PR #119 established this template; PRs #205, #206, #209, #217, #218, #219, #222, #223, #224 replicated it. Select is the 11th component to adopt the pattern.

**Trade-off.** The story does NOT force `open` because `<Popover.Portal>` renders outside the story decorator's theme scope. This is the same constraint Combobox faced. The mitigation is identical: a11y for the open state is covered by `axeInThemes` inside `select.test.tsx` (test "has no WCAG 2.1 AA violations in light + dark (listbox aberto + selecionado)") — scoped on `Popover.Content` so the open + selected matrix runs under both themes.

**Alternatives considered.**
- *Custom Storybook portal that respects the decorator's theme:* high cost, one-off ergonomic improvement, breaks consistency with the 10 other DarkTheme stories. Rejected.
- *Skip DarkTheme story entirely, relying only on `axeInThemes`:* fails AC-1 explicitly. Rejected.

### DD-2 — No ADR required

This is a story-only delta inside an established pattern. No new architectural decision. Per `lex-issue-driven` Rule 4, ADR is required only for new tech choices, pattern deviations, or significant trade-offs — none apply here.

## Stacked PR decomposition

Single PR. No layered decomposition.

## Risks

| Risk | Likelihood | Mitigation |
|---|---|---|
| Visual regression baseline diff on macOS | Low (story-only addition) | If snapshot generated, apply `regenerate-baselines` label on the PR — Ubuntu/CI is source of truth |
| Brand re-divergence post-#226 | Very low (already on `main`) | Notion MCP spot-check; surface only NEW divergences |
| `dev:all` script flake | Low | Manual verification by Fernando on playground checkbox |
| Token regression from #226 inversion | Already validated by 10 prior reviews | None — fully shipped on `main` |
| Conflict with sibling Plan #49 (Radio) | None — isolated worktree, distinct component folder | None |

## Observability / runtime surfaces

N/A. UI component (no HTTP endpoint, no event consumer, no background job). `lex-observability-required` Check 3 returns N/A for this PR.

## Security surfaces

N/A. No dynamic HTML, no auth, no secrets, no user input parsing beyond controlled React props. `lex-frontend-security` is satisfied by construction (JSX-only rendering, no `dangerouslySetInnerHTML`, no `localStorage` writes).
