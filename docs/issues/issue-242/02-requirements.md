# Phase 2 — Requirements

## Acceptance criteria (transcribed from parent #242)

- **AC-1:** Decision (a) or (b) recorded with justification (ADR if (a) due to migration size; inline comment in PR body if (b)).
- **AC-2:** On the next Issue-Driven PR, phase artifacts land at the canonical path per the decision; PR body anchor links resolve from a fresh clone.
- **AC-3:** Athena's relevant katas produce artifacts at the canonical path.
- **AC-4:** No `.ahrena/issues/` orphan dirs left after migration (if (a)).
- **AC-5:** `lex-issue-driven` upstream OR project-level override matches actual practice (if (b)).

## How this PR satisfies each AC

### AC-1 — Decision recorded with justification

This PR records the decision as **Option (a) — Align to Lex** in `docs/adr/ADR-009-phase-artifacts-canonical-path.md` with full context, rejected alternative, and consequences. Status `accepted` inline (single atomic commit per `lex-small-commits`).

Slot allocation rationale: ADR-008 is held by open PR #247 (AG-UI/CopilotKit); ADR-009 is the next genuinely free slot. Verified at every phase checkpoint via `ls docs/adr/ADR-*.md` AND `gh pr list --state open --json title | grep -oE 'ADR-[0-9]+'`.

### AC-2 — Phase artifacts at canonical path; anchors resolve

**Dogfooded in this very PR.** All five phase artifacts of this Tech Task live under `docs/issues/issue-242/`:

- `docs/issues/issue-242/01-brief.md` ← this PR
- `docs/issues/issue-242/02-requirements.md` ← this file
- `docs/issues/issue-242/03-architecture.md`
- `docs/issues/issue-242/05-security-review.md`
- `docs/issues/issue-242/06-quality-report.md`

The PR body anchors `docs/issues/issue-242/0*-*.md` resolve from `main` after merge.

Precedent already exists on main: PR #248 (merged 2026-05-29) was the first to write to `docs/issues/issue-241/` — the de-facto practice is already in effect; this PR codifies the commitment.

### AC-3 — Athena's katas at canonical path

**Scoped out of this PR — flagged for separate upstream Ahrena change.** The kata defaults (`kata-issue-analysis`, `kata-requirements-brief`, `kata-architecture-brief`, `kata-security-review`, `kata-quality-gate`) live in the upstream Ahrena framework repo, not in this project.

In the meantime, Athena (this orchestrator) writes to the canonical path through direct guidance from the active Plan sub-issue. Project-side enforcement is achieved through documentation (CONTRIBUTING.md pt-BR section + CLAUDE.md one-liner) so future contributors and agents land on the canonical path even before the upstream kata defaults are updated.

Suggested upstream PR title: `chore(katas): align Issue-Driven phase kata defaults to lex-issue-driven Rule 5 canonical path`.

### AC-4 — No `.ahrena/issues/` orphan dirs

**Verified at preflight as moot:** `.gitignore` line 21 has carried `.ahrena/issues/` since the project adopted Ahrena. No content was ever committed under that path. `git log --all -- '.ahrena/issues/**' | head` returns nothing. There is no migration; there are no orphans.

This PR removes `.gitignore` line 21 (the now-redundant ignore) and line 20 (the self-contradictory comment that claimed `docs/issues/issue-{N}/` is canonical while ignoring the divergent path); it preserves line 24 (`.ahrena/workflow/` — ephemeral state, correctly ignored).

### AC-5 — Lex matches actual practice

The upstream `lex-issue-driven` Rule 5 already specifies `docs/issues/issue-{n}/`. The divergence was a project-side drift, not a Lex error. By adopting Option (a) and documenting it project-side, the project's actual practice matches the upstream Lex without amending it.

## Process acceptance criteria (this PR)

- **AC-P1 — `.gitignore` cleanup:** delete lines 20-21 (comment + `.ahrena/issues/` ignore); preserve line 24 (`.ahrena/workflow/`); no negation patterns.
- **AC-P2 — `CONTRIBUTING.md` pt-BR section:** new `## Artefatos do fluxo Issue-Driven` section in pt-BR (matching file language) documenting `docs/issues/issue-{N}/` as canonical and `.ahrena/workflow/issue-{N}/` as ephemeral.
- **AC-P3 — `CLAUDE.md` one-liner:** repo-root `CLAUDE.md` points future agents to the canonical path.
- **AC-P4 — `npm run docs:build` green:** docs build does not regress; ADR-009 and any other content additions render without error.
- **AC-P5 — Single atomic signed commit:** `chore(process): canonicalize Issue-Driven phase artifacts path per lex-issue-driven` covers all 4 deliverables in one commit per `lex-small-commits` + `lex-signed-commits`. ADR-009 ships as `accepted` inline (no separate transition commit).
- **AC-P6 — PR body closes both:** body includes `Closes #249` AND `Closes #242` on separate lines.

## Definition of Done

- [ ] ADR-009 created at `docs/adr/ADR-009-phase-artifacts-canonical-path.md`, status `accepted`.
- [ ] `.gitignore` lines 20-21 deleted; line 24 preserved.
- [ ] `CONTRIBUTING.md` carries the new pt-BR section.
- [ ] `CLAUDE.md` carries the one-liner.
- [ ] All 5 phase artifacts of this PR exist under `docs/issues/issue-242/`.
- [ ] `npm run docs:build` exits 0 locally.
- [ ] Single signed commit covers the diff.
- [ ] PR body closes #249 and #242.

## Out of scope

- Upstream Ahrena kata default-path changes.
- Backfill of historical `.ahrena/issues/` content (never committed — nothing to backfill).
- Changes to the broader Issue-Driven flow structure (Phases 1-7, Gates 1-2).
- Renaming the Lex.
