# Phase 3 — Architecture

## Decision matrix

| Dimension | (a) Align to Lex — canonical `docs/issues/issue-{N}/` | (b) Document deviation — keep `.ahrena/issues/{N}/` + amend Lex |
|---|---|---|
| **Lex compliance** | Already complies with `lex-issue-driven` Rule 5 as written. | Requires amending the upstream Lex OR documenting a project-level override. |
| **PR body anchors** | Resolve from fresh clone after merge. | Stay broken (gitignored target) unless body convention changes to GitHub issue URLs. |
| **Audit trail** | Phase artifacts (brief / requirements / architecture / security review / quality report) reach merged history; post-merge reviewers can read them. | Artifacts evaporate after merge; only the GitHub Issue body and PR body survive. |
| **Migration cost** | **Zero this time:** `.ahrena/issues/` was always gitignored; no committed content. Future PRs write to the canonical path directly. | Zero migration, but requires upstream PR amending the Lex (high coordination cost across projects). |
| **Precedent** | **Already set:** PR #248 (merged 2026-05-29) adopted `docs/issues/issue-241/`. | Would reverse the precedent. |
| **Ephemeral state** | Cleanly separated: durable artifacts under `docs/issues/issue-{N}/`, checkpoints/scratch under `.ahrena/workflow/issue-{N}/`. | Conflates durable and ephemeral state under `.ahrena/issues/`; muddies the model. |
| **Upstream coupling** | Loose — project documents its practice; upstream kata defaults can catch up in a separate PR. | Tight — requires upstream Lex amendment before project conforms. |

## Recommendation

**(a) Align to Lex.**

Rationale:
1. Already the de-facto state on `main` (PR #248 precedent).
2. Zero migration cost — the historical concern about migrating `.ahrena/issues/{56..240}/` is moot because gitignored content never existed in history.
3. Restores the value of the phase artifacts (audit trail, live PR anchors).
4. Decouples the project from a Lex amendment that would be philosophically wrong (the Lex is right; the project drifted).
5. Cleanly separates durable (`docs/issues/issue-{N}/`) from ephemeral (`.ahrena/workflow/issue-{N}/`) state.

## Decision recorded

**ADR-009 — Phase artifacts canonical path.** Status `proposed` at end of Phase 3; flipped to `accepted` in the Phase 4 implementation commit. Slot allocation verified at Phase 3 checkpoint:

- `ls docs/adr/ADR-*.md` on `main` → ADR-001..ADR-007 occupied.
- `gh pr list --state open --json title | grep -oE 'ADR-[0-9]+'` → ADR-008 held by open PR #247 (AG-UI/CopilotKit).
- **ADR-009 is the next genuinely free slot.**

Verification reasserted immediately before Phase 4 commit (per `feedback_adr_preallocation_check_open_prs`).

## Affected components

| Component | Change | Rationale |
|---|---|---|
| `docs/adr/ADR-009-phase-artifacts-canonical-path.md` | NEW | Records the decision per AC-1. |
| `.gitignore` | DELETE lines 20-21 (comment + `.ahrena/issues/` ignore) | Resolves AC-P1; removes self-contradictory directive. |
| `CONTRIBUTING.md` | INSERT new `## Artefatos do fluxo Issue-Driven` section (pt-BR) | Resolves AC-P2 / AC-5; project documents practice. |
| `CLAUDE.md` (root) | INSERT one-line pointer | Resolves AC-P3; future agents land on canonical path. |
| `docs/issues/issue-242/01-brief.md` | NEW | Phase 1 artifact, dogfooded canonical path. |
| `docs/issues/issue-242/02-requirements.md` | NEW | Phase 2 artifact. |
| `docs/issues/issue-242/03-architecture.md` | NEW | This file. |
| `docs/issues/issue-242/05-security-review.md` | NEW | Phase 5 artifact. |
| `docs/issues/issue-242/06-quality-report.md` | NEW | Phase 6 artifact. |

Total scope: 1 ADR + 3 documentation touchpoints (`.gitignore`, `CONTRIBUTING.md`, `CLAUDE.md`) + 5 phase artifacts. Small, documentation-heavy.

## Out of scope (declared)

- `kata-issue-analysis`, `kata-requirements-brief`, `kata-architecture-brief`, `kata-security-review`, `kata-quality-gate` — upstream Ahrena framework changes, separate PR.
- Backfill of historical `.ahrena/issues/{N}/` content — never committed, nothing to migrate.
- PR template changes — current PR template doesn't carry phase artifact anchors; future contributors should adopt the pattern through CONTRIBUTING.md guidance.
- Renaming the Lex.

## Migration path

**No migration required.** The decision is forward-looking:

1. This PR establishes the canonical path explicitly (ADR + documentation).
2. Past PRs (#237, #239, #240) that referenced dead `.ahrena/issues/{N}/` anchors stay as-is — historical record; their anchors stay broken, which is part of the symptom that motivated this Tech Task.
3. PR #248 (already merged) set the precedent.
4. All future Issue-Driven PRs write to `docs/issues/issue-{N}/` and ship live anchors.

## Stacked PR decomposition

**N/A.** Per `codex-stacked-prs` Decision Checklist:
- Files affected: ~5 documentation files + 5 phase artifacts.
- Single bounded context (process documentation).
- No high signals for stacking (no large diff, no parallel review tracks, no risky migration).

Single PR is the correct shape.

## Gate 1

Gate 1 auto-approved per the standing instructions:
- Plan #249 DoD checklist matches this architecture entirely (5 ACs from #242 + 6 process ACs).
- Scope binding holds: no expansion beyond Plan body.

Advance to Phase 4.
