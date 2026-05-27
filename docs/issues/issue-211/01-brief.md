# Issue #211 — Brief

- **Repo:** `guardiatechnology/design-system`
- **Type:** Plan sub-issue (Tech Task)
- **Parent:** #210
- **Author:** @fernandoseguim
- **Labels:** `ci 🏗️`, `evolvability ♻️`, `status: development`

## Summary

Create the 3 missing canonical `status:*` labels in `guardiatechnology/design-system` so `warrior-athena` can apply the `development → to review → done` transitions required by `lex-agent-planning` Table A on every Plan PR.

## Current state (before this Plan)

Only 2 of the 5 canonical status labels exist in the repo:

- `status: todo` (present)
- `status: development` (present)
- `status: to review` (**missing**)
- `status: done` (**missing**)
- `status: to release` (**missing**)

Symptom: PRs #205, #206, #209 (Lote 1 — IconButton, ButtonGroup, Button) opened today and are stuck at `status: development` because Athena cannot apply `status: to review`.

## Desired outcome

All 5 canonical status labels present in the repo with consistent color + description, and an idempotent `scripts/labels.sh` that reconciles them on fresh clones or after accidental deletion.

## Out of scope

- Retroactive re-tag of Lote 1 PRs (#205, #206, #209) — surfaced as tangential finding (see Phase 4 notes); 3-command chore that Fernando handles manually if desired.
- Cross-repo propagation of the labels script to other Guardia repos — separate Plan if needed.
