# Issue #241 — Requirements

> Phase 2 of the Issue-Driven flow. Numbered ACs derived from the issue body plus process ACs.

## Functional Acceptance Criteria (verbatim from #241)

- **AC-1:** `grep -rn "DropdownMenu\|ContextMenu" --include="*.md" --include="*.astro" --include="*.mdx" .` returns zero matches outside (a) historical ADRs (`docs/adr/ADR-005-*`, `docs/adr/ADR-006-*`), (b) changelog, and (c) intra-PR Issue-Driven flow artifacts at `docs/issues/issue-241/**` (these are meta-documents describing this cleanup and legitimately quote the deleted-component names in verbatim AC references and prose; spiritually equivalent to a changelog entry). Verified post-edit by re-running the command. Catalog/listing files (`README.md`, `docs/src/pages/index.astro`, `CONTRIBUTING.md`, package READMEs) contain zero non-historical matches.
- **AC-2:** `README.md` Overlays section lists `Menu` and does not list `DropdownMenu` or `ContextMenu` as standalone entries.
- **AC-3:** `npm run docs:build` exits with code 0 on the working branch.

## Process Acceptance Criteria

- **AC-4 (atomic commit):** Single signed commit with subject `docs(menu): retire DropdownMenu/ContextMenu references post-consolidation` per `lex-conventional-commits` (`docs:` type), `lex-small-commits`, `lex-signed-commits`.
- **AC-5 (issue linkage):** PR body includes `Closes #245` (Plan sub-issue) and `Closes #241` (parent Tech Task), each on its own line, per `lex-issue-first`.
- **AC-6 (PR hygiene):** PR mirrors parent labels (`documentation 📃`), carries the right `size/*` label (expected `size/XS`), is assigned to `@me`, and requests reviewers per `.github/CODEOWNERS` per `lex-pr-quality`.

## Definition of Done

All ACs (AC-1 through AC-6) green at Gate 2; PR opened; sub-issue and parent transition to `status: to review` upon PR creation per `lex-issue-status`.

## Out of scope (declared, surfaced not implemented)

- Code changes to `Menu`, `Popover`, or any other Overlays primitive — already shipped via PR #239 / #237.
- Changelog entry — release-time concern, owned by `warrior-janus`.
- Updating `.claude/plans/*.md` (provider cache, gitignored from PR perspective even when locally tracked) — not user-facing documentation.

## Tangential findings protocol

Per `lex-no-silent-tech-debt`: any non-AC finding encountered during execution will be surfaced with three explicit options (expand current Plan / new Plan sub-issue / new parent Issue). Not silently expanded into this PR.
