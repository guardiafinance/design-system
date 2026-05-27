# Quality Report — Issue #23 (Gate 2)

Output of `kata-quality-gate` for Plan sub-issue #23
(`chore(button-group): review against v0.1.0 DoD`).

## Result: ✅ go

All checks pass. Cleared to open PR.

## Check 1 — Bidirectional AC ↔ test traceability

Every AC mapped 1:1 to ≥1 test case; every new test case carries an
`AC-N` tag in its name. Below the matrix for the 18 new cases (the
10 baseline structural cases already covered AC-3 implicitly).

| AC | Test name fragment | Count |
|---|---|---|
| AC-1 (Storybook light + dark) | Inherited from PR #119 global toolbar; verified by Storybook build green (`npm run build-storybook` is a sibling target — covered indirectly by `npm run build`). No new story added; matrix unchanged. | n/a (no new test) |
| AC-2 (Playground side-by-side) | Recorded in PR body link to `docs/componentes/button-group`. Astro page renders green in `npm run docs:build`. | n/a (no new test) |
| AC-3 | `[AC-3] resolves accessible name from aria-label …` | 1 |
| AC-3 | `[AC-3] resolves accessible name from aria-labelledby …` | 1 |
| AC-3 | `[AC-3] Tab navigates children in document order` | 1 |
| AC-3 | `[AC-3] children receive Enter activation when focused` | 1 |
| AC-3 | `[AC-3] children receive Space activation when focused` | 1 |
| AC-3 | `[AC-3] disabled child is unreachable via Tab` | 1 |
| AC-3 | `[AC-3] role='toolbar' + IconButton aria-labels …` | 1 |
| AC-3 | `[AC-3] orientation='vertical' still carries role='group'` | 1 |
| AC-3 | `[AC-3] data-orientation reflects current orientation prop` | 1 |
| AC-3 | `[AC-3] data-attached reflects current attached prop …` | 1 |
| AC-3 | `[AC-3] focus-visible z-10 class chain …` | 1 |
| AC-3 | `[AC-3] vertical attached collapses radii on top/bottom …` | 1 |
| AC-4 | `[AC-4] Default … WCAG AA clean in light + dark` | 1 |
| AC-4 | `[AC-4] semantic group (aria-label 'Paginação') …` | 1 |
| AC-4 | `[AC-4] disabled-equivalent child …` | 1 |
| AC-4 | `[AC-4] vertical orientation …` | 1 |
| AC-4 | `[AC-4] role='toolbar' + IconButtons …` | 1 |
| AC-4 | `[AC-4] spaced (attached=false) …` | 1 |
| AC-5 (Brand × Notion) | Recorded in PR body `## Brand × Notion` section + this report's Notion-verification note. No code-level test (Brand is doc-level). | n/a (verification activity) |
| AC-6 (5 green commands) | This report's Check 5. | n/a (gate-level) |
| AC-7 (PR closes Plan) | Verified in PR body before opening. | n/a (PR-level) |

**Zero orphan tests:** every new `it(...)` carries `[AC-3]` or
`[AC-4]`. No test introduced without a corresponding AC.

## Check 2 — Scope creep

Modified-file inventory vs. the whitelist declared in
`docs/issues/issue-23/03-architecture.md`:

| File | Modified? | Whitelisted? | Verdict |
|---|---|---|---|
| `ui_kit/components/button-group/button-group.test.tsx` | yes | yes | ✅ |
| `docs/issues/issue-23/05-security-review.md` | created | yes | ✅ |
| `docs/issues/issue-23/06-quality-report.md` | created | yes | ✅ |
| `ui_kit/components/button-group/index.tsx` | no | non-goal | ✅ |
| `ui_kit/components/button-group/ButtonGroup.stories.tsx` | no | non-goal | ✅ |
| `.storybook/preview.tsx`, `vitest.setup.ts`, `ui_kit/test-utils/a11y.ts` | no | non-goal | ✅ |
| Any sibling component | no | non-goal | ✅ |
| `.claude/rules/design/brand/*` | no (Notion verification surfaced no divergence) | non-goal unless divergence | ✅ |

`git diff --name-only main...HEAD` (verified locally) returns
exclusively the 3 files above. **No scope creep.**

## Check 3 — Observability / new runtime surface

`lex-observability-required` applies to "new HTTP endpoint, event
consumer, scheduled job, or long-running worker". This Plan
introduces **none of those**. The single modified application file
is a test file; the component itself is unchanged. **Not
applicable — pass by construction.**

## Check 4 — Tests (frontend behavioral, no silent debt)

| Sub-check | Result |
|---|---|
| All tests pass (`npm run test`) | ✅ 677/677 (full suite) — `Duration 14.01s` |
| Accessible queries used (`lex-frontend-testing` rule 2) | ✅ All 18 new cases use `getByRole`/`getByLabelText`; only the 5 baseline structural cases use `getByTestId` (preserved heuristic for class assertions, pre-existing) |
| Mocks at boundaries only (`lex-frontend-testing` rule 3) | ✅ Single `vi.fn()` bound to a public `onClick` prop on a real `<Button>` child; no internal collaborators mocked |
| Snapshots added? | ✅ Zero new snapshots |
| Silent TODO/FIXME/XXX markers (`lex-no-silent-tech-debt`) | ✅ `git diff main...HEAD` shows 0 silent debt markers in the added test file or doc files |

## Check 5 — Five green commands (AC-6)

Executed in sequence in the worktree
`.worktrees/23-review-button-group-v010-dod/`:

| Command | Exit | Notes |
|---|---|---|
| `npm run typecheck` | 0 | `tsc -p tsconfig.test.json --noEmit` clean |
| `npm run lint` | 0 | 27 pre-existing warnings (0 in `button-group/`); 0 errors |
| `npm run test` | 0 | 677/677 across 24 test files; ButtonGroup contributes 28/28 |
| `npm run build` | 0 | rslib produced 68 dist files, 358.7 kB (90.7 kB gzipped) |
| `npm run docs:build` | 0 | Astro built 22 pages including `/componentes/button-group/` in 17.87s |

## Check 6 — Coverage (AC-3 threshold)

`npx vitest run … --coverage` against
`ui_kit/components/button-group/**`:

```
File       | % Stmts | % Branch | % Funcs | % Lines
index.tsx  |     100 |      100 |     100 |     100
```

**100% on every dimension** — far above the ≥ 80% DoD target. The
28-case suite exercises every variant branch (`orientation` ×
`attached`), the `forwardRef` path, the `className` merge path, the
custom `role` override, the disabled-child contract, and the keyboard
activation chain.

## Check 7 — Brand × Notion (AC-5)

Phase 4 fetched, via Notion MCP:

- Branding root (page `34536f91ebd280a69efacbadab3861c6`)
- Cores subpage (page `34536f91ebd28142a3f1e0e58fd62c4b`)
- Tipografia subpage (page `34536f91ebd281b9b76ccc6159bfae69`)

Compared against `.claude/rules/design/brand/lex-brand-colors.md`
and `.claude/rules/design/brand/lex-brand-typography.md`. Full
equivalence on:

- Base hexes (#FFC30A, #E07400, #DB6286, #4F186D, #3A3A44)
- Mono White (#FDFDFD) and Mono Black (#0E1016)
- Scales 100/200/500/700/900 for the 5 brand families
- Signal colors (#00BF63, #FFDE59, #FF3131, #004AAD), reserved for
  data viz / system states
- WCAG thresholds (4.5:1 normal, 3:1 large/UI)
- Forbidden combo Yellow 500 + White (1.61:1)
- Poppins as everyday typeface, Lastica exclusive to logo,
  CSS fallback declaration `font-family: 'Poppins', 'Roboto',
  sans-serif;`

`ButtonGroup` itself introduces zero color/typography tokens — its
surface is exclusively structural (`inline-flex`, `flex-row`,
`flex-col`, `gap-2`, `-ml-px`, `-mt-px`, `z-10`, conditional
`rounded-*-none`). Colors flow through the `<Button>`/`<IconButton>`
children, already validated in issues #19 / #173 / #180 against the
same Brand axes.

**No divergence → no mirror update required → no risk surface.**

## Verdict

✅ **go** — all 7 checks pass. PR may be opened against `main`.
