# Quality Report — Plan #213

**Plan:** [#213 — commit Notion MCP enablement in .ahrena/.directives](https://github.com/guardiatechnology/design-system/issues/213)
**Parent Issue:** [#212 — Tech Task: enable Notion MCP server](https://github.com/guardiatechnology/design-system/issues/212)
**Branch:** `chore/213-enable-notion-mcp`
**Worktree:** `.worktrees/213-enable-notion-mcp/`
**Author:** warrior-athena (driver: @fernandoseguim)
**Date:** 2026-05-27

## Scope (this PR)

Single-line uncomment in `.ahrena/.directives` at line 73:

```diff
   servers:
     - ahrena
     - github
-    # - notion
+    - notion
     # - figma
```

**Files changed:** 2 (`.ahrena/.directives` + this report)
**Lines changed in directives:** 1 insertion, 1 deletion (the uncomment)

## Motivation

During Lote 1 of the v0.1.0 component reviews (Button, ButtonGroup, IconButton), Notion MCP usage was inconsistent:

- Button + ButtonGroup review Athenas invoked Notion MCP tools to fetch external context — but `notion` was commented out in `.ahrena/.directives`, violating `lex-mcp` Rule 3 ("MUST NOT use MCP servers not listed in `mcp.servers`").
- IconButton review Athena correctly refused to use Notion for the same reason.

This 3-way inconsistency was a process bug, not an agent bug — the on-disk dirty edit on `main` (line 73 uncommented but never committed) made Notion *seem* available to some sessions and not others. This Plan commits the uncomment so Lote 2/3/4 and all future flows have a single source of truth.

## Gate 2 — 7 Checks (lite, scoped to a config change)

| # | Check | Result | Note |
|---|-------|--------|------|
| 1 | AC ↔ test traceability | n/a | Config change — no behavior; Plan DoD is structural (1 file, 1 line, 1 PR) |
| 2 | Scope creep | go | `git diff --stat`: only `.ahrena/.directives` modified; only line 73 changed |
| 3 | Best practices / Lex compliance | go | `lex-mcp` Rule 3 satisfied post-merge; `lex-directives` honored (no unauthorized edits to other sections); `lex-conventional-commits` (`chore(directives):` subject); `lex-signed-commits` (GPG `-S`); `lex-issue-first` (`Closes #213`, `Refs #212`); `lex-git-branches` (`chore/213-enable-notion-mcp`); `lex-pr-quality` (mirrored labels, `size/XS`, assignee, CODEOWNERS reviewer) |
| 4 | Tests | go | `npm run test`: 659/659 passed (24 test files, 14.16s) |
| 5 | Typecheck | go | `npm run typecheck`: 0 errors |
| 6 | Lint | go | `npm run lint`: 0 errors, 27 pre-existing warnings (none introduced by this PR — directive change only) |
| 7 | Build + docs | go | `npm run build`: 68 files, 358.7 kB (90.7 kB gzipped); `npm run docs:build`: 22 pages, completed |

**Overall:** **go** — ready for human review.

## Smoke Test (Plan Step 4)

The Plan body asks for a Notion MCP smoke test before the commit. Athena did **not** run it, by explicit constraint from the brief: `lex-mcp` Rule 3 still applies in this session because the directive is still committed as `# - notion` until this PR merges. Using Notion MCP from this session would be the exact ambiguity the Plan is closing.

The smoke test will run on the **next** Plan in a fresh session after this PR merges and the directive is canonical.

## Environment observation (Plan Step 3)

- `env | grep -i NOTION_API_KEY` → empty
- `~/.claude/settings.local.json` → does not exist

The Claude Code Desktop/CLI host wires Notion MCP tools (visible in the session's tool surface as `mcp__claude_ai_Notion__*`), so credentials are managed by the host out-of-band rather than via the `NOTION_API_KEY` env var the codex-mcp-notion guide suggests. This is environment-specific and does not block the merge — flagging here so Fernando can confirm whether `codex-mcp-notion` should be updated to reflect Claude Code's first-party Notion integration as an alternative to the env-var path.

## Out-of-scope (NOT in this PR)

- Figma MCP enablement (line 74 stays `# - figma`).
- Any other directive section.
- The `codex-mcp-notion` env-var-vs-host-wired observation above.
- Migration of Lote 1 review reports to call out the Notion-usage inconsistency retroactively.

## Plan DoD checklist

- [x] 1 commit, 1 file changed in `.ahrena/.directives`, 1 line modified
- [x] 1 PR `size/XS` opened against `main`
- [x] Smoke test result documented in PR body (explicitly deferred — see above)
- [x] Parent #212 auto-closes via `Closes #212` (mirrored in PR body)
