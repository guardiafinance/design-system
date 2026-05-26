# Requirements — #187

> **Phase 2 — kata-requirements-brief** — produced by warrior-athena

## Goal

Close the CI process gap that allowed 3 real TypeScript errors in `docs/src/previews/avatar.tsx` to pass green review in PR #184 (rename `violet` → `purple`). Add an explicit `typecheck:docs` step running `tsc -p docs/tsconfig.json --noEmit`, after first normalizing the current noise produced by alias divergence between `docs/astro.config.mjs` and `docs/tsconfig.json`.

## Acceptance Criteria

### AC-1 — Align `docs/tsconfig.json` aliases with `docs/astro.config.mjs`

- The `compilerOptions.paths` section of `docs/tsconfig.json` MUST declare the same aliases used by `docs/astro.config.mjs`:
  - `"@ds/*": ["../ui_kit/*"]`
  - `"@/*":   ["../ui_kit/*"]`  (matches Astro/Vite — no longer diverges)
- After alignment, running `npx tsc -p docs/tsconfig.json --noEmit` against the current state of `main` MUST report **0 errors**.

### AC-2 — Add `typecheck:docs` npm script

- The `scripts` section of `package.json` MUST contain:
  - `"typecheck": "tsc -p tsconfig.test.json --noEmit"` (already exists — keep)
  - `"typecheck:docs": "tsc -p docs/tsconfig.json --noEmit"` (new)
- Running `npm run typecheck:docs` locally on `main` (after AC-1) MUST exit with status code 0.

### AC-3 — CI runs both typecheck variants on every PR

- The `Build and Test Package` job of `.github/workflows/pull-request.yml` MUST execute, in order:
  1. `npm run lint`
  2. `npm run typecheck` (regular — gap surfaced as side-effect; the existing script wasn't being invoked)
  3. `npm run typecheck:docs` (new)
  4. `npm run build`
  5. `npm pack --dry-run`
- Each step MUST run as a separate step so failures are easy to locate in the CI log.
- Both typecheck steps MUST be required for the job to pass.

### AC-4 — CI failure proven against a synthetic TS error in `docs/`

- The PR MUST contain a `Validation` section in the body documenting one of:
  - (a) a transient commit on the same branch with an intentional TS error in `docs/src/previews/*.tsx`, with link to the failing CI run, followed by its revert; OR
  - (b) local execution of `npm run typecheck:docs` after introducing a synthetic error, screenshot/snippet of the failure output included in the PR body.
- The aim is to provide evidence the new check actually blocks regressions — not a permanently broken test that pollutes `main`.

### AC-5 — `npm run docs:build` keeps passing

- Astro's `docs:build` MUST keep producing the static site successfully after the alias change.
- Local validation: `npm run docs:build` exits 0 on the post-AC-1 state.

## Definition of Done

- [ ] AC-1 to AC-5 ✅
- [ ] PR opened with `Closes #187` + `Refs #185`
- [ ] PR labeled `ci 🏗️`, `evolvability ♻️` (mirrored from the issue) + `size/S`
- [ ] PR assigned to @fernandoseguim
- [ ] Reviewers requested via `.github/CODEOWNERS`
- [ ] CI green on the final state of the branch (every step including the two new typechecks)
- [ ] Conventional Commits compliant atomic commits (`ci:` and/or `chore:`)

## Out of Scope (declared)

- Evaluating `astro check` as an alternative to `tsc -p docs/tsconfig.json --noEmit` — tangential, may be promoted to its own Tech Task issue after this PR is merged.
- Migrating `docs/tsconfig.json` to TypeScript project references (`composite: true` + `references: [{ path: ../ }]`) — would be the structurally clean solution but expands scope significantly. Out of scope for this PR.
- Touching `ui_kit/` components or `vitest`/`vitest.setup.ts` configs — outside the affected surface.
- Adding `typecheck` to CI for other tsconfigs (Storybook, top-level `tsconfig.json`) — only `tsconfig.test.json` and `docs/tsconfig.json` are in scope.

## AC ↔ Validation Traceability

This is a CI/config Tech Task — there is no production application code. AC traceability is satisfied by:

| AC | Validation evidence |
|---|---|
| AC-1 | Local execution: `npx tsc -p docs/tsconfig.json --noEmit` returns 0 errors after the change. |
| AC-2 | Reading `package.json`: presence of the `typecheck:docs` script; CI step references it. |
| AC-3 | Reading the diff of `pull-request.yml`: 3 ordered steps before `build`. |
| AC-4 | `Validation` section in the PR body: link to failing CI run **OR** local output snippet documenting the failure of `typecheck:docs` against a synthetic error. |
| AC-5 | Local execution: `npm run docs:build` exits 0. |

Note: there are no Vitest/unit-test files to add because the change is entirely in CI configuration. The DRY/test-pyramid Lexis don't apply here — the validation channel is the CI itself, with the synthetic test for AC-4 demonstrating that the check actually blocks regressions (the project equivalent of an "integration test" for CI configuration).

## Project-Specific Guardrails Considered

- **PT-BR terminology** — N/A (no test files added; PR title and body will follow project convention).
- **jest-axe a11y** — N/A (no component changes).
- **Visual baselines** — N/A (no visual change).
- **Releases via Janus** — N/A (this PR does not release; the `Build and Test Package` job runs without affecting `publish.yml`).
