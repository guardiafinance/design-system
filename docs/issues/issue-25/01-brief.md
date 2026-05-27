# Phase 1 — Brief: chore(chip): review Chip for v0.1.0 DoD

> Thin pointer. The canonical scope lives in chore Issue #24 and Plan sub-issue #25. This brief does not re-elicit context that is authoritative in those issues — it only frames what Athena is orchestrating in this PR.

## Source artifacts

| Source | Reference | Role |
|---|---|---|
| Chore (parent) | [`guardiatechnology/design-system#24`](https://github.com/guardiatechnology/design-system/issues/24) | Why / What / How + Definition of Done |
| Plan (executable) | [`guardiatechnology/design-system#25`](https://github.com/guardiatechnology/design-system/issues/25) | Single PR contract; DoD checklist |
| Epic (umbrella) | [`guardiatechnology/design-system#13`](https://github.com/guardiatechnology/design-system/issues/13) | Design System v0.1.0 — Primitivos (Part 1) |
| Decision record | [`docs/adr/ADR-003-chip-variants.md`](../../adr/ADR-003-chip-variants.md) | 2-axis API (`variant` × `appearance`) — already accepted |
| Brand source of truth | [Branding (Notion)](https://www.notion.so/Branding-34536f91ebd280a69efacbadab3861c6) | In divergence with local mirror, Notion prevails |

## Why (from #24)

`Chip` was migrated to the new DoD **before** the playground approval rule, the Storybook light+dark coverage requirement, and the Brand-against-Notion validation came into force. Without this review, Chip cannot enter v0.1.0.

## What (scope summary from #24 + #25)

Validate the existing `ui_kit/components/chip/` implementation against the v0.1.0 DoD checklist and produce a single PR that closes the gap. Specifically:

- Confirm `Chip.stories.tsx` covers Default + variants in **light AND dark** (toggle via Storybook theme control).
- Provide playground side-by-side comparison vs. legacy/production reference (recorded in the PR body).
- Confirm `chip.test.tsx` (note: lowercase filename — pre-existing) satisfies behavioral coverage: ≥ 20 tests OR ≥ 80% file coverage, accessible queries, no internal-collaborator mocks.
- Confirm jest-axe (`axeInThemes`) covers `Default`, primary interactive state, and `disabled` in BOTH light and dark.
- Validate Brand (colors, typography, logo touchpoints) against the Notion source of truth.
- Run the full quality gate green: `npm run typecheck && npm run lint && npm run test && npm run build && npm run docs:build`.
- Close Plan #25 via `Closes #25` in the PR body.

**Out of scope** (per #24): new features beyond legacy parity; brand/token refactors unrelated to `Chip`; visual baseline regeneration from macOS (per user guardrail — only the `regenerate-baselines` workflow on Ubuntu CI may update `__image_snapshots__/`).

## Pre-existing artifacts (Chip is already implemented)

| Artifact | Path | State at session start |
|---|---|---|
| Component | `ui_kit/components/chip/index.tsx` | 7×3 variant × appearance matrix per ADR-003; split-button for nested-interactive; brand-aware tokens; well-documented |
| Stories | `ui_kit/components/chip/Chip.stories.tsx` | 11 stories incl. Matrix (7×3), MatrixSelected, AppearanceSelectedAsymmetry, SemanticUseCases, Disabled |
| Behavioral tests | `ui_kit/components/chip/chip.test.tsx` (lowercase) | 26 `it()` + parameterized `it.each` for 7 variants × 3 appearance specs + jest-axe matrix |
| Docs page | `docs/src/pages/componentes/chip.astro` | Live previews + source viewer |
| Live previews | `docs/src/previews/chip.tsx`, `docs/src/previews/chip-live.tsx` | Imported by docs page |
| MIGRATED set | `docs/src/pages/index.astro` | `Chip` already listed |
| ADR | `docs/adr/ADR-003-chip-variants.md` | `accepted` (covers variant × appearance asymmetry, WCAG token table) |

This task is therefore **primarily a validation cycle** — not a re-implementation. The implementation phase reduces to closing residual gaps (if any) surfaced by the gate.

## Unknowns to resolve in Phase 2

1. Does jest-axe currently cover the `disabled` state in both themes? — `chip.test.tsx:223-230` covers it. ✓
2. Is `data-theme` toggled at `document.documentElement`? — `axeInThemes` in `ui_kit/test-utils/a11y.ts:65` confirms. ✓
3. Notion brand validation — execute manually since `notion` MCP is not active in this session; document as "manual verification pending" if it cannot be reached.
4. Visual baselines (`__image_snapshots__/`) — if image diffs appear, do NOT regenerate from macOS; record snapshot names for CI re-run via `regenerate-baselines` label.

## Next phase

Move to Phase 2 — enumerate the 7 ACs (mapped 1:1 to the DoD checklist in #25) so every behavioral assertion can cite `AC-N`.
