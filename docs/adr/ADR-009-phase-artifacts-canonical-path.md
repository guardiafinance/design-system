# ADR-009 — Issue-Driven phase artifacts canonical path

- **Status:** accepted
- **Date:** 2026-05-29
- **Deciders:** @fernandoseguim, warrior-athena
- **Related issues:** #242 (parent Tech Task), #249 (Plan sub-issue), #239 (surfaced by Argos review), #248 (precedent on `main`)

## Context

The design-system project consumes the Ahrena Issue-Driven flow (`lex-issue-driven`). Rule 5 of that Lex specifies the canonical committed location for the five phase artifacts (Phase 1 brief, Phase 2 requirements, Phase 3 architecture, Phase 5 security review, Phase 6 quality report):

```
docs/issues/issue-{n}/{01..06}-*.md
```

From the project's inception through PR #240 (Tooltip, merged 2026-05-28), Athena (this orchestrator) wrote those artifacts under `.ahrena/issues/{N}/` — the project's `.ahrena/` directory. That path is gitignored in this repository (`.gitignore` line 21).

The divergence caused two operational problems:

1. **Dead PR-body anchors.** Each Issue-Driven PR opened included anchor links of the shape `[Phase 1 brief](.ahrena/issues/{N}/01-brief.md)`. From a fresh clone of `main`, those links resolve to nonexistent files. Argos surfaced this on the PR #239 (Menu) review.
2. **No durable audit trail.** Phase artifacts evaporated after merge. Post-merge reviewers who wanted to understand "why was this AC #3 worded the way it was?" or "what alternatives were considered in Phase 3?" had no recourse beyond the GitHub Issue body, which usually carries less detail.

The pattern repeated across **Popover #237, Menu #239, Tooltip #240** and would have repeated across the remaining Overlays wave (Dialog #60, Drawer #62, Alert #56, Toast #70, EmptyState #64, ConfidenceIndicator #58).

The parent Tech Task #242 was opened to settle the question explicitly. Two paths were offered:

- **(a)** Align to Lex — committed phase artifacts under `docs/issues/issue-{n}/`; refresh anchors; restore audit trail.
- **(b)** Document deviation — keep `.ahrena/issues/{n}/` (gitignored); amend `lex-issue-driven` upstream OR document a project-level override.

The previous Athena instance (working on Tech Task #241, merged as PR #248 on 2026-05-29) anticipated this decision and **autonomously adopted Option (a)** — writing phase artifacts to `docs/issues/issue-241/` for the first time. That precedent is on `main`.

This ADR converts the precedent into an explicit, project-level commitment.

## Decision

The design-system project adopts **Option (a) — Align to Lex**.

Phase artifacts of the Issue-Driven flow are committed under:

```
docs/issues/issue-{N}/
├── 01-brief.md
├── 02-requirements.md
├── 03-architecture.md
├── 05-security-review.md
└── 06-quality-report.md
```

Ephemeral orchestration state (checkpoints, session heartbeats, scratch) continues under:

```
.ahrena/workflow/issue-{N}/
```

which remains gitignored.

### Implementation surfaces in this PR

1. **`.gitignore`** — delete the `.ahrena/issues/` ignore line (now redundant) and the self-contradictory comment that preceded it.
2. **`CONTRIBUTING.md`** — new pt-BR section `## Artefatos do fluxo Issue-Driven` documenting the canonical practice for human contributors.
3. **`CLAUDE.md`** — one-line pointer for future agent sessions.
4. **Phase artifacts of this very PR** — dogfooded under `docs/issues/issue-242/`.

## Rejected alternative

**Option (b) — Document deviation.** Rejected for these reasons:

- Reverses the precedent already on `main` (PR #248).
- Requires an upstream Ahrena PR amending `lex-issue-driven` Rule 5, with high coordination cost across all projects that consume the framework.
- Keeps PR-body anchors broken unless the body convention is rewritten to link to GitHub Issue bodies (lower-fidelity surface).
- Forfeits the audit-trail value of committed phase artifacts.
- Conflates durable and ephemeral state under one umbrella (`.ahrena/issues/`), muddying the conceptual model.

The Lex is right; the project drifted. Aligning the project is cheaper and more correct than amending the Lex.

## Consequences

### Positive

- PR-body anchors resolve from a fresh clone of `main` for every future Issue-Driven PR.
- Phase artifacts reach merged history and are searchable, citable, and reviewable post-merge.
- Durable (`docs/issues/`) and ephemeral (`.ahrena/workflow/`) state are cleanly separated.
- Project practice matches the upstream Lex without amending the Lex.

### Neutral

- No migration of historical content is required — `.ahrena/issues/` was always gitignored, so no past phase artifacts ever reached git history. Past PRs (#237, #239, #240) carry broken anchors as historical record; they are not retroactively patched.
- This decision applies prospectively starting from PR #248 (already merged) and continuing through every subsequent Issue-Driven PR including this one.

### Negative / Open

- Upstream Ahrena kata defaults (`kata-issue-analysis`, `kata-requirements-brief`, `kata-architecture-brief`, `kata-security-review`, `kata-quality-gate`) still emit to `.ahrena/issues/{N}/` by default. Until the upstream defaults are aligned, project-side Athena instances steer to the canonical path through Plan-sub-issue guidance and the documentation added in this PR (`CONTRIBUTING.md` + `CLAUDE.md`). A separate upstream PR is required to close the gap; suggested title: `chore(katas): align Issue-Driven phase kata defaults to lex-issue-driven Rule 5 canonical path`.

## References

- `lex-issue-driven` Rule 5 (upstream Ahrena framework).
- [PR #239 review by Argos](https://github.com/guardiatechnology/design-system/pull/239#pullrequestreview-4385661562) — original surfacing.
- [PR #248](https://github.com/guardiatechnology/design-system/pull/248) — precedent on `main`.
- [Issue #242](https://github.com/guardiatechnology/design-system/issues/242) — parent Tech Task.
- [Issue #249](https://github.com/guardiatechnology/design-system/issues/249) — Plan sub-issue.
- ADR-008 — held by [open PR #247](https://github.com/guardiatechnology/design-system/pull/247) (AG-UI / CopilotKit on Bedrock); this ADR uses the next free slot ADR-009.
