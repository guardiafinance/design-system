# Issue #241 — Brief

> Phase 1 of the Issue-Driven flow. Issue read in full; no external Notion lookup required.

## Identification

- **Repository:** `guardiatechnology/design-system`
- **Number:** #241
- **Title:** `docs(menu): retire DropdownMenu/ContextMenu references post-consolidation`
- **Type:** Tech Task (docs cleanup)
- **State:** OPEN
- **Author / Assignee:** @fernandoseguim
- **Label:** `documentation 📃`
- **Plan sub-issue:** #245 (linked, type `Plan`)

## Why (problem)

Argos flagged on PR #239 (Menu migration) review that `README.md:105` still lists `DropdownMenu · ContextMenu` as standalone Overlays components. Both wrappers were deleted in PR #239 when consolidated under the canonical `Menu` primitive per ADR-006 (Option C). The stale doc line misrepresents the public surface to anyone reading the README without checking the package barrel.

## What (scope)

Remove non-historical references to the deleted standalone components `DropdownMenu` and `ContextMenu` from documentation files, leaving `Menu` as the canonical Overlays entry. Reflects post-PR-239 reality.

In scope: `README.md`, `docs/src/pages/index.astro`, package metadata, contributing guide if applicable.
Out of scope: code changes (already shipped in PR #239), changelog (release-time concern).

## How (parent DoD checklist)

- [ ] Grep audit `DropdownMenu | ContextMenu` across `*.md`, `*.astro`, `*.mdx`
- [ ] Edit `README.md:105` (Overlays) — remove deleted predecessors, ensure `Menu` is present
- [ ] Audit `docs/src/pages/index.astro` and `MIGRATED` set
- [ ] Update contributing guide or example snippets if any
- [ ] Confirm `npm run docs:build` green
- [ ] Atomic single signed commit `docs(menu): retire DropdownMenu/ContextMenu references post-consolidation`

## Acceptance Criteria (verbatim from issue)

- **AC-1:** `grep -rn "DropdownMenu\|ContextMenu" --include="*.md" --include="*.astro" --include="*.mdx" .` returns zero matches outside historical ADRs and changelog.
- **AC-2:** `README.md` Overlays section lists `Menu` (and not the deleted predecessors).
- **AC-3:** `npm run docs:build` green.

## Context references

- Surfaced from: <https://github.com/guardiatechnology/design-system/pull/239#pullrequestreview-4385661562>
- ADR-006 (Menu consolidation): `docs/adr/ADR-006-menu-consolidation-and-api-shape.md`
- Sibling follow-up (already merged): PR #243 (CI warn-not-fail on missing baselines)

## Unknowns / clarifying questions

None. Issue body is self-contained; scope is mechanical.
