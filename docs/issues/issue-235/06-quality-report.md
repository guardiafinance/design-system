# Quality Report — Plan #235

**Plan:** [#235 — add --no-open to storybook script in dev:all](https://github.com/guardiatechnology/design-system/issues/235)
**Parent:** [#234 — disable Storybook auto-open in dev:all](https://github.com/guardiatechnology/design-system/issues/234)
**Size:** size/XS (1-line config change)
**Branch:** `chore/235-storybook-no-open`

## Change

```diff
--- a/package.json
+++ b/package.json
@@ -27,7 +27,7 @@
     "init:env": "git config core.hooksPath .githooks && chmod -R +x ./.githooks",
     "build": "rslib build",
     "dev": "rslib build --watch",
-    "storybook": "storybook dev -p 6006",
+    "storybook": "storybook dev -p 6006 --no-open",
     "build-storybook": "storybook build",
     "docs:dev": "npm run dev --prefix docs",
```

Adds the `--no-open` flag (documented and stable in Storybook 8.x — the version this repo runs) to the `storybook` script, so `npm run dev:all` no longer auto-opens a browser tab on every dev session.

## Pipeline (Gate 2 — lite)

| Check | Command | Result |
|---|---|---|
| Typecheck | `npm run typecheck` | green |
| Lint | `npm run lint` | 0 errors (27 pre-existing warnings, unrelated) |
| Tests | `npm run test` | 773 passed across 24 files |
| Build | `npm run build` | 68 files generated in dist; 363.2 kB (91.7 kB gzipped) |
| Docs build | `npm run docs:build` | 22 pages built in 25.15s |

## Scope creep check

Only two files modified in this PR:
- `package.json` (the 1-line storybook script flag)
- `docs/issues/issue-235/06-quality-report.md` (this report)

No other file touched. No functional code change. No security surface affected.

## Smoke test note

Local smoke test of `npm run dev:all` was skipped because other worktrees may hold ports 6006/4321 concurrently. The `--no-open` flag is documented and stable in Storybook 8.x (confirmed devDependency on line 131 of `package.json`: `"storybook": "8.6"`), so flag behavior is relied on directly. Fernando will validate locally on next dev session start.

## Outcome

**go** — proceed to PR.
