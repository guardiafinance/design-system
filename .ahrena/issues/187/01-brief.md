# Issue Brief — #187

> **Phase 1 — kata-issue-analysis** — produced by warrior-athena

## Identification

- **Number:** #187
- **Title:** Tech Task: extend CI typecheck to cover `docs/` (gap surfaced by #185)
- **Repository:** `guardiatechnology/design-system`
- **URL:** https://github.com/guardiatechnology/design-system/issues/187
- **Author:** @fernandoseguim
- **Assignee:** @fernandoseguim
- **State:** open
- **Created:** 2026-05-26
- **Labels:** `ci 🏗️`, `evolvability ♻️`
- **Issue Type (template):** Tech Task (`Task`)

## Type and Scope

- **Type:** Tech Task — closes a CI process gap
- **Domain:** CI/CD pipeline + TypeScript configuration (no production code)
- **Surface affected:** `package.json`, `docs/tsconfig.json`, `.github/workflows/pull-request.yml` (potentially)
- **Out of scope (declared by the author):** evaluation of `astro check` as a simpler alternative — tangential, may become its own issue

## Origin (Why)

- PR #184 (rename `violet` → `purple`) introduced 3 real TS errors in `docs/src/previews/avatar.tsx`
- CI passed green because:
  - `npm run typecheck` uses `tsconfig.test.json` whose `include` is `["ui_kit", "vitest.setup.ts", "vitest.config.ts"]` — does **not** cover `docs/`
  - `npm run docs:build` runs Astro in loose TS mode (strips types instead of running `tsc --strict`)
- Errors were only caught by Gemini code review; fixed in PR #186 (Issue #185)
- Process gap persists: any rename or refactor touching `docs/src/**` may break types without CI blocking it

## Decision Already Recorded in the Issue

The author already decided between three options:

| Option | Decision |
|---|---|
| (a) Extend `include` of `tsconfig.test.json` to `docs/src` | Rejected — risk of conflict with `astro:content` and Astro-specific types |
| (b) **Separate `typecheck:docs` step** | **Adopted** — uses the Astro-aware `docs/tsconfig.json`; isolation |
| (c) Status quo | Rejected |

Adopting option (b) requires first cleaning up pre-existing noise produced by `tsc -p docs/tsconfig.json --noEmit`.

## Pre-Existing Diagnostic Found in Phase 1

Running `npx tsc -p docs/tsconfig.json --noEmit` against the current state of `main` produces **22 errors**. All follow the same pattern:

```
ui_kit/components/<COMPONENT>/index.tsx(N,20): error TS2307:
Cannot find module '@/lib/utils' or its corresponding type declarations.
```

Root cause identified:

1. `docs/astro.config.mjs` declares Vite aliases:
   ```js
   "@ds": "../ui_kit"
   "@":   "../ui_kit"          // both point to ui_kit
   ```
2. `docs/tsconfig.json` declares TS paths:
   ```json
   "@ds/*": ["../ui_kit/*"]
   "@/*":   ["./src/*"]        // diverges from Astro
   ```
3. `docs/tsconfig.json` has `include: ["**/*"]`, and through the `@ds/*` mapping ends up resolving `ui_kit/components/**/*.tsx` files. Each component imports `@/lib/utils`, which the TS resolver tries to find at `docs/src/lib/utils` (does not exist). The actual file is at `ui_kit/lib/utils.ts`.
4. **The 22 errors are false** — at runtime Astro/Vite resolve correctly because the `@` alias points to `ui_kit`. The TS configuration just diverges from runtime resolution.

There are no real TS errors in `docs/` at the current state of `main`. After alignment, `typecheck:docs` is expected to run green.

## Available Context

- **Linked PRs:** #186 (fix `violet` leftover in 5 files, of which 3 are TS errors in `docs/src/previews/avatar.tsx`), #184 (`violet` → `purple` rename), #185 (issue that triggered fix #186)
- **CI workflow:** `.github/workflows/pull-request.yml` — job `build` (Build and Test Package) on `ubuntu-latest` already runs `lint` and `build`; the natural place to add `typecheck` + `typecheck:docs` (current workflow does not call `typecheck` either — additional gap identified)
- **Notion:** N/A — `notion` is not active in `mcp.servers`

## Knowns

- The author validated experimentally that `tsc -p docs/tsconfig.json --noEmit` caught the original errors before the #186 fix.
- The DoD declares 4 items, including a synthetic test verifying CI blocks a PR introducing a real TS error in `docs/`.
- Expected PR size: `size/S`.

## Unknowns / Hypotheses

- Whether the workflow already runs `typecheck` (regular) — quick reading shows it does **not**; this is an additional gap surfaced but not mentioned in the issue.
- Whether there will be real TS errors in `docs/src/previews/*.tsx` or `docs/src/pages/*.astro` once the alias is corrected — diagnostic indicates no, but to be confirmed in Phase 4.

## Next Action

Advance to Phase 2 (`kata-requirements-brief`) consolidating the issue's DoD into numbered acceptance criteria with explicit AC↔test traceability.
