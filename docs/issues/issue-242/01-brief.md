# Phase 1 — Issue Brief

## Issue

- **Number:** [#242](https://github.com/guardiatechnology/design-system/issues/242)
- **Title:** `process: align Issue-Driven phase artifacts path to lex-issue-driven Rule 5`
- **Type:** Tech Task
- **Labels:** `ci 🏗️`, `evolvability ♻️`
- **Author:** @fernandoseguim
- **State:** OPEN
- **Plan sub-issue:** [#249](https://github.com/guardiatechnology/design-system/issues/249) `plan: align Issue-Driven phase artifacts path to lex-issue-driven Rule 5`

## Summary

Argos surfaced on PR #239 (Menu) review that the design-system project writes Issue-Driven phase artifacts (`01-brief.md`, `02-requirements.md`, `03-architecture.md`, `05-security-review.md`, `06-quality-report.md`) under `.ahrena/issues/{N}/` — a path that is **gitignored** in this repository. The consequence: every Issue-Driven PR ships a body with anchor links pointing to files that do not exist from a fresh clone, and the artifacts themselves never reach merged history.

`lex-issue-driven` Rule 5 establishes `docs/issues/issue-{n}/` as the canonical committed location. The divergence between framework Lex and project practice was **silent** — Gate 2 didn't catch it because the local kata-quality-gate didn't validate Rule 5 paths.

The pattern repeated across **Popover #237, Menu #239, Tooltip #240** and would have repeated across the entire remaining Overlays wave (Dialog #60, Drawer #62, Alert #56, Toast #70, EmptyState #64, ConfidenceIndicator #58).

## Context

- **Surfaced from:** [PR #239 Argos review](https://github.com/guardiatechnology/design-system/pull/239#pullrequestreview-4385661562).
- **Precedent already set on main:** [PR #248](https://github.com/guardiatechnology/design-system/pull/248) (merged 2026-05-29) was the first Issue-Driven flow in this project to autonomously adopt `docs/issues/issue-241/` for the 5 phase artifacts. Athena (prior instance) made the call without explicit human instruction because the divergence had become operationally untenable.
- **De-facto decision:** Option (a) — Align to Lex — is already on `main`. This Tech Task converts the precedent into an explicit project-level commitment.
- **Affects:** every future Issue-Driven PR.

## Source-of-truth check

The parent Tech Task body offers two paths:

- **(a)** Align to Lex — committed phase artifacts under `docs/issues/issue-{n}/`; update Athena's katas; migrate historical; refresh PR body anchors.
- **(b)** Document deviation — keep `.ahrena/issues/{n}/`; amend `lex-issue-driven` upstream or document a project-level override.

The author recommends (a) and that recommendation aligns with the precedent already merged. The Tech Task body also calls out:

- "migrate `.ahrena/issues/{56..240}/`" — **rendered moot at preflight:** `.ahrena/issues/` is gitignored, so no content was ever committed. There is nothing to migrate; the directory either doesn't exist on disk or exists ephemerally on the contributor's machine.
- "update Athena's katas" — **out of scope here:** the framework katas live in the upstream Ahrena repo (`framework/{lang}/engineering/workflow/katas/`), not in this project. A separate upstream PR is required (suggested title: `chore(katas): align Issue-Driven phase kata defaults to lex-issue-driven Rule 5 canonical path`).

## Unknowns

None. The decision is settled by precedent; this PR codifies it.

## Next phase

Phase 2 — transcribe the 5 ACs from #242 verbatim and add process ACs covering documentation surfaces.
