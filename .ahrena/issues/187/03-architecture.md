# Architecture — #187

> **Phase 3 — kata-architecture-brief** — produced by warrior-athena

## Summary

Tech Task surface: CI configuration. There is no new production code, no REST API, no event, no UI component. The work is concentrated in three files:

- `docs/tsconfig.json` — align `@/*` alias with `docs/astro.config.mjs`
- `package.json` — add `typecheck:docs` script
- `.github/workflows/pull-request.yml` — invoke `typecheck` and `typecheck:docs` in the existing `build` job

Coverage extension (CI process), not architectural change.

## Affected Components

| File | Type of change | Lines (estimate) |
|---|---|---|
| `docs/tsconfig.json` | Modify `paths.@/*` alias (`./src/*` → `../ui_kit/*`) | 1 line |
| `package.json` | Add `typecheck:docs` script | 1 line |
| `.github/workflows/pull-request.yml` | Insert 2 CI steps (`typecheck` + `typecheck:docs`) between `lint` and `build` | ~10 lines |
| `.ahrena/issues/187/*.md` | Issue-Driven documentation (this PR) | ~4 files |

Total expected diff: `size/S` (< 30 modified lines of code; framework documentation does not count against the size label per project convention).

## Out-of-Scope Components

- `ui_kit/**/*` — no change
- `docs/src/**/*` — diagnostic indicated 0 real errors; only the alias was diverging
- `tsconfig.json` (root) and `tsconfig.test.json` — keep current behavior
- `rslib.config.ts`, `vitest.config.ts`, `vitest.setup.ts` — out of scope
- `__image_snapshots__/` — no visual regression to revalidate (no rendering change)
- Storybook files (`.storybook/`) — out of scope

## Detailed Design Decisions

### D1 — Align `@/*` alias instead of `@guardiadocs/*` or project references

**Adopted:** declare in `docs/tsconfig.json` that `@/*` resolves to `../ui_kit/*`, matching Astro/Vite.

**Considered alternatives:**

- **Use TypeScript project references** (`composite: true` + `references: [{ path: ../ }]`): would split `ui_kit/` and `docs/` into independent TS projects with proper boundaries. Structurally correct but adds significant ceremony and `out: dist` field, build caches, etc. Out of scope.
- **Rename the docs alias to `@guardiadocs/*` to avoid conflict with the root `@/*`**: would require touching every `import ... from "@/..."` line in `ui_kit/`. Disproportionate.
- **Keep `@/*` pointing to `./src/*` and exclude `ui_kit/**` from `include`**: would solve the noise but leave `ui_kit/` not type-checked under the `docs/` project. The `ui_kit/` project's own `tsconfig.json` already does that — so it's not a real loss — but the docs typecheck would no longer act as a redundancy net for `ui_kit/`. Acceptable, but the simpler "align with Astro" alternative was preferred because the divergence between Astro and TS is a real bug in the current state and not a deliberate trade-off.

**Why "align":** the runtime (Astro/Vite) is the canonical authority — types should follow what actually runs. Resolving the divergence by following runtime is the conservative path.

### D2 — Two separate CI steps (`typecheck` + `typecheck:docs`)

**Adopted:** add the steps as siblings to `lint` and `build`, in the existing `build` job. Do not create a new dedicated job.

**Why:** new job would cost an additional `actions/setup-node@v4` + `npm ci` boot (~30s overhead). The current `build` job already has all the dependencies. Two more sub-30s steps are negligible in total time.

### D3 — Validation of `typecheck:docs` capture (AC-4) via local snippet, not permanent test

**Adopted:** the PR body will contain a `Validation` section showing the result of `npm run typecheck:docs` after manually introducing a TS error in `docs/src/previews/avatar.tsx` (and then reverting). Will not commit a permanently broken file.

**Why:** introducing a real test file that the typecheck must "catch" would mean committing intentionally broken code, which conflicts with `lex-protected-trunk` (no broken `main`). Documented manual evidence is enough to demonstrate the new check actually blocks regressions.

## Stacked PR Decomposition

Decision Checklist (codex-stacked-prs) evaluated against scope and ACs:

| High signal | Present? |
|---|---|
| Multiple independent vertical layers? | No — alias, script, and CI step are coupled (canonical order: align → add script → invoke in CI) |
| 5 ACs distributable across distinct layers? | No — every AC depends on the alias being aligned |
| Surface > 500 lines? | No (~12 LOC) |
| Multiple bounded contexts? | No |

| Anti-signal | Present? |
|---|---|
| size/S | **Yes** |
| Single configuration domain | **Yes** |
| Sequentially dependent changes | **Yes** |

Result: 0 high signals, 3 anti-signals. **Decomposition rejected.** Single PR.

## ADRs

There is **no** relevant architectural decision (per `lex-issue-driven` Rule 4) requiring an ADR in this issue:

- D1 (align `@/*`) — bug fix, not architectural choice
- D2 (CI steps in the existing job) — operational tactic, not architectural pattern
- D3 (manual validation evidence) — documentation strategy

The trade-off between options (a)/(b)/(c) that an ADR could capture was already declared by the author **in the issue body itself**. Promoting it to an ADR would be redundant duplication.

If, during Phase 4, an unforeseen architectural decision emerges (e.g., need to introduce project references), `kata-adr-write` will be invoked.

## Risks and Mitigations

| Risk | Probability | Mitigation |
|---|---|---|
| `@/*` realignment breaks `astro:content` type resolution | Low | Diagnostic confirmed `docs/src/**` does not use `@/...`; only `ui_kit/**` does, and runtime is already resolving correctly via Astro alias |
| Pre-existing real TS errors in `docs/src/previews/*.tsx` surface after alias fix | Low | Initial inspection showed errors are uniform (all `@/lib/utils` not found); zero `astro:content` or `react-live` errors |
| `npm run docs:build` regresses due to alias change | Very low | TS resolution does not affect Astro/Vite runtime resolution (they are independent); AC-5 explicitly validates this |
| Adding new CI steps increases pipeline time | Negligible | Two `tsc --noEmit` calls, ~5-10s each in cached environment |

## Delegations

- **warrior-daedalus** — not invoked (no REST API)
- **warrior-kronos** — not invoked (no event)
- **warrior-apollo** — not invoked (no Python)
- **warrior-hephaestus** — **invoked in Phase 4** for implementation (frontend/tooling stack: TS, npm scripts, GitHub Actions YAML)
- **warrior-atlas** — not invoked (no AWS infra)

## Stack and Tools

- **Language:** TypeScript 5.7 + JSON (config files)
- **Build:** rslib + Astro 5
- **CI:** GitHub Actions (`ubuntu-latest`, Node 24)
- **Validation:** `tsc --noEmit`, `eslint`, `rslib build`

## Definition of Architecture Done

- [x] Affected components mapped
- [x] Decisions documented (D1, D2, D3)
- [x] No ADR required — recorded in this document
- [x] No specialist delegation needed beyond Hephaestus in Phase 4
- [x] Risks and mitigations identified
- [x] Stacked PR decomposition evaluated and rejected
