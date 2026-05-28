# Phase 6 — Gate 2 Quality Report: Plan #45 (FormLayout v0.1.0 DoD review)

## Checks

| # | Check | Result | Evidence |
|---|---|---|---|
| 1 | AC ↔ test traceability | ✅ | Each new test docstring prefixed with `AC-4` or `AC-5`; AC-2 verified via `DarkTheme` story rendering through Storybook theme toolbar |
| 2 | Scope creep | ✅ | Only 3 files modified: `FormLayout.stories.tsx` (add `DarkTheme`), `form-layout.test.tsx` (add 3 describe blocks + axe matrix), and `docs/issues/issue-45/*.md` (phase docs). `index.tsx` untouched |
| 3 | `lex-observability-required` | ✅ N/A | No runtime surface introduced |
| 4 | Tests pass + coverage | ✅ | 47 tests pass in `form-layout.test.tsx` (≥20 floor; well above 80% file coverage threshold for a layout primitive). Full suite: 711/711 pass across 24 files |
| 5 | Best practices | ✅ | `getByRole` / `getByLabelText` used throughout new tests; no `getByTestId` introduced; no internal-collaborator mocks |
| 6 | TypeScript strict (`lex-frontend-typing`) | ✅ | `npm run typecheck` green (`tsc -p tsconfig.test.json --noEmit`) |
| 7 | Performance budget | ✅ N/A | Test/story-only delta; library `npm run build` reports same size class (358.7 kB total, 90.7 kB gzipped) |

## Commands run locally (worktree)

```
npm ci            # ✅ 932 packages installed
npm run typecheck # ✅ 0 errors
npm run lint      # ✅ 0 errors (27 warnings, all pre-existing in other components)
npm run test      # ✅ 711 / 711 pass (form-layout: 47 / 47, includes 6 axe-matrix tests × light+dark)
npm run build     # ✅ 68 files in dist, 358.7 kB
npm run docs:build # ✅ 22 pages built, including /componentes/form-layout
```

## AC compliance

| AC | Status | Notes |
|---|---|---|
| AC-1 | ⏳ awaiting human | `npm run dev:all` is a manual check by Fernando — script is wired and `docs:build` already proves the Astro page compiles |
| AC-2 | ✅ | `DarkTheme` story added with full variant × density × state matrix |
| AC-3 | ⏳ awaiting human | Playground side-by-side is a manual eyeball check by Fernando |
| AC-4 | ✅ | 47 tests, accessible queries, no internal mocks, behavioral coverage extended (submission, fieldset/legend grouping, disabled cascade, controlled vs uncontrolled pass-through) |
| AC-5 | ✅ | 6 jest-axe scenarios × light+dark = 12 axe runs, all `toHaveNoViolations()` |
| AC-6 | ✅ | Notion fetched (Branding root + Cores + Tipografia + Voz); no NEW divergence (Plan #208 known divergence untouched) |
| AC-7 | ⚠️ | One finding surfaced — see below |
| AC-8 | ✅ | All 5 commands green locally; CI to confirm on PR |
| AC-9 | ⏳ awaiting human | "Está bom" pending on the PR |
| AC-10 | ✅ | PR body will include `Closes #45` |

## AC-7 — Findings surfaced to Fernando

### Finding F-1 (tangential, NOT addressed in this PR) — `aria-required` injection

**Observed:** `FormLayout.Field` injects `id` / `aria-describedby` / `aria-invalid` / `invalid` into the single child, but does NOT inject `aria-required="true"` when the `required` prop is set. The visual `*` is rendered (with `aria-hidden`), so the screen-reader signal currently depends on the consumer passing `required` on their own `<Input required />`.

**Why surfaced:** `lex-frontend-accessibility` Rule 4.2 says "Required fields marked with `required` and visual indication + `aria-required="true"`". The current contract puts the burden on the consumer to mirror `required` on the control, which is easy to miss.

**Why NOT fixed in this PR:** the Plan #45 scope is review + test-and-story delta; the component implementation (`index.tsx`) was declared untouched in the architecture brief. Per `lex-no-silent-tech-debt`, this is a tangential finding that I'm surfacing rather than silently expanding scope.

**Three options for Fernando:**
- **(a) Expand current Plan** — small, ~5-line patch in `FormLayout.Field` to also inject `aria-required` into the single child when `required` is set; +1 test to assert the injection. Doable in this PR.
- **(b) Open a new Plan sub-issue** under #44 — e.g., `Plan: inject aria-required on FormLayout.Field` — keeps this PR strictly test/story-only and the fix lives in its own atomic PR.
- **(c) Open a new parent Issue** — only if FormLayout's a11y contract needs a broader audit; less appropriate here since the finding is single-locus.

Default recommendation: **(b)** — keeps the current PR clean and one-Plan-one-PR per `lex-agent-planning`.

No other gaps. No visual regressions (existing stories unmodified; new `DarkTheme` produces a NEW snapshot, not a baseline change).

## Verdict: GO (pending Fernando's "está bom" on AC-1 / AC-3 / AC-9)

Gate 2: ✅ technical PASS. PR ready to open; human gates AC-1 / AC-3 / AC-9 await Fernando.
