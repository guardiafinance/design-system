# Phase 3 — Architecture: chore(chip): review Chip for v0.1.0 DoD

> No new architecture is introduced — the work is a validation cycle on the existing `ui_kit/components/chip/` implementation governed by ADR-003. This document inventories the affected surface, confirms the scope guardrail, and declares the gap closure plan.

## Scope (canonical — modifications limited to)

```
ui_kit/components/chip/Chip.stories.tsx        (add-only: missing variants if any)
ui_kit/components/chip/chip.test.tsx           (add-only: missing jest-axe / behavioral cases if any)
docs/issues/issue-25/                          (new — flow artifacts)
```

Any modification outside this set triggers `lex-no-silent-tech-debt` (Tangential Finding Protocol): the agent pauses, comments on #25 with three options (expand current Plan / open new Plan sub-issue / open new parent Issue), and resumes the current Plan after the human decision.

## Component inventory (unchanged — pre-existing)

| Surface | Path | Status |
|---|---|---|
| Component | `ui_kit/components/chip/index.tsx` | ✓ — 7×3 matrix + split-button for nested-interactive (axe WCAG 4.1.2 compliant) |
| Stories | `ui_kit/components/chip/Chip.stories.tsx` | ✓ — 11 stories incl. Matrix, MatrixSelected, AppearanceSelectedAsymmetry |
| Behavioral tests | `ui_kit/components/chip/chip.test.tsx` | ✓ — 26 `it()` + parameterized matrices |
| jest-axe helper | `ui_kit/test-utils/a11y.ts` | ✓ — `axeInThemes` toggles `data-theme` on `documentElement` |
| Vitest setup | `vitest.setup.ts` | (read-only — confirms jest-axe matchers registered) |
| Docs page | `docs/src/pages/componentes/chip.astro` | ✓ — Astro live previews |
| Live previews | `docs/src/previews/chip.tsx`, `chip-live.tsx` | ✓ — imported by docs page |
| MIGRATED set | `docs/src/pages/index.astro:678-699` | ✓ — `Chip` listed |
| ADR | `docs/adr/ADR-003-chip-variants.md` | `accepted` |

## Gap assessment (against the 7 ACs)

| AC | Pre-existing state | Gap | Action this PR |
|---|---|---|---|
| AC-1 Storybook light+dark | 11 stories cover Default + matrix + variants | None observable in source review | Visual review in Storybook (human gate via playground) |
| AC-2 Playground comparison | `npm run dev:all` infrastructure exists; docs page exists | Human action (out-of-agent gate) | Note in PR body |
| AC-3 Behavioral ≥ 20 / ≥ 80% | 26 `it()` + parameterized cases; covers all interaction modes; uses accessible queries | None observable | Quality Report records exact count + coverage |
| AC-4 jest-axe Default + interactive + disabled (light + dark) | 6 jest-axe assertions in `describe("a11y")` + 14 in the variant matrix; `axeInThemes` runs both themes | None observable | Quality Report records pass count |
| AC-5 Brand × Notion | Component uses tokens exclusively (no hardcoded colors); local `lex-brand-*` mirrors are loaded in context | Notion MCP not active — manual verification | PR body section "Brand × Notion: manual verification pending" |
| AC-6 Quality Gate | Pre-existing CI green on `main` | Confirm green on this branch | Phase 6 runs the full suite |
| AC-7 `Closes #25` | N/A | N/A | PR body template |

**Conclusion:** the implementation phase (Phase 4) is expected to be a no-op for source code — the work is documentation + quality gate execution. If any gap surfaces during Phase 6 (e.g., a snapshot diff, a lint regression introduced by an upstream dependency bump), apply the Tangential Finding Protocol.

## Design decisions (no new ADRs)

ADR-003 (`docs/adr/ADR-003-chip-variants.md`, status `accepted`) governs the 7×3 variant × appearance API, the asymmetry rule (`selected: true` → always solid, ignoring `appearance`), the backward-compat path (default `<Chip>` == `<Chip variant="brand" appearance="outline" selected={false}>`), and the WCAG AA token table. No further design decision is needed — the review confirms ADR-003 is correctly implemented and stays accepted.

## Stacked PR Decomposition

**Decision: single PR, no decomposition.**

Per `codex-stacked-prs` Decision Checklist: only 1 file group is modified (`ui_kit/components/chip/`), expected diff is small (documentation + at most minor test additions), no cross-context coupling, no migration concerns. Decomposition would add ceremony without value. Single PR is the correct route — `kata-contributing-pr` (no `kata-stacked-pr-create`).

## Observability

`lex-observability-required` does not apply — Chip is a pure UI primitive with no runtime surface (no HTTP endpoint, no event consumer, no background job). No trace/metric/log instrumentation needed.

## Security

Surface is minimal: stateless React component with no `dangerouslySetInnerHTML`, no token storage, no external URLs, no user-input rendering beyond `children` (passed through React's safe JSX binding). Phase 5 will produce a short attestation rather than a full review.

## Risks

| Risk | Mitigation |
|---|---|
| Visual snapshot diffs on macOS vs. Ubuntu | Per user guardrail, NEVER regenerate locally; record snapshot names in PR for `regenerate-baselines` workflow |
| Notion MCP unavailable for AC-5 | Surface as "manual verification pending" per `lex-mcp` rule 4 — agent does not silently substitute |
| Lint/typecheck regression from upstream bump | Phase 6 runs the full suite; any failure → Tangential Finding Protocol → comment on #25 |
| `chip.test.tsx` is lowercase, DoD references `Chip.test.tsx` | Filename is pre-existing convention in the repo; ACs apply to the file regardless of casing — note in PR body |

## Out of Scope

Tangential findings discovered during this review (if any) become candidates for new Plan sub-issues under #24 or new parent Issues, surfaced to Fernando via comment on #25 before any modification.
