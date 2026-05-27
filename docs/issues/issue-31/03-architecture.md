# Phase 3 — Architecture: Separator v0.1.0 DoD

## Component summary

| Aspect | Value |
|---|---|
| File | `ui_kit/components/separator/index.tsx` |
| Tests | `ui_kit/components/separator/separator.test.tsx` |
| Stories | `ui_kit/components/separator/Separator.stories.tsx` |
| Primitive base | `@radix-ui/react-separator` |
| Interactivity | None — pure visual primitive |
| Semantic role | `role="separator"` (when `label` present OR `decorative=false` explicit); `role="none"` (default decorative) |
| Keyboard | Not in tab order (Radix default `tabindex` absent) |
| State props | None (no `disabled`, `hover`, `focus`, `selected`) |

## Affected scope (in-PR diff allow-list)

Per `lex-no-silent-tech-debt` and the user guardrail "only `ui_kit/components/separator/` and `docs/issues/issue-31/`":

```
ui_kit/components/separator/Separator.stories.tsx        # update — add Default a11y story, theme matrix note
ui_kit/components/separator/separator.test.tsx           # update — add jest-axe coverage + non-interactive guard
docs/issues/issue-31/01-brief.md                         # new
docs/issues/issue-31/02-requirements.md                  # new
docs/issues/issue-31/03-architecture.md                  # new
docs/issues/issue-31/05-security-review.md               # new
docs/issues/issue-31/06-quality-report.md                # new
```

Out-of-scope changes detected during execution MUST be surfaced to the human and either (a) commented on #31 or (b) excluded from PR; never silently added.

## Theme matrix strategy

| Surface | Mechanism | Coverage |
|---|---|---|
| Storybook | Existing theme switcher (Storybook toolbar) — single story suffices; reviewer flips light↔dark manually | `Default`, `Dashed`, `Dotted`, `WithLabel`, `Vertical`, `Showcase` |
| Tests | `axeInThemes(container)` from `@/test-utils/a11y` — flips `data-theme` on `document.documentElement` and runs `axe()` in both | All meaningful variants |

The repo already exposes the helper at `ui_kit/test-utils/a11y.ts` and the tsconfig path `@/test-utils/a11y` (verified in Chip/Badge worktrees consuming the same import). No new infra needed.

## Test plan

| Section | Test count (target) | Rationale |
|---|---|---|
| Existing behavioral assertions (rendering, attributes, gradient style) | 14 (preserved) | Already passes; queries by `data-testid` justified by Radix decorative `<div>` lacking role |
| Non-interactive guard (AC-4 "keyboard navigation") | 1 (new) | Confirms `role="separator"` element is not in tab order |
| jest-axe matrix (light + dark) via `axeInThemes` | 6 (new) | `Default`, `Dashed`, `Dotted`, `WithLabel`, `Vertical`, `DashedWithLabel` |
| **Total** | **21** | ≥ 20 satisfies AC-3 |

The 6 jest-axe tests use `axeInThemes(container)` which internally loops `[light, dark]` and runs `axe()` for each — so each `it(...)` line equals 2 theme assertions (12 axe runs total). The test-count metric counts the `it()` blocks (21).

## Story coverage

Existing 8 stories already cover the rendering surface for AC-1:
- `Default` (solid horizontal, no label) — primary entry
- `Dashed`, `Dotted` — appearance variants
- `WithLabel`, `WithLongLabel`, `DashedWithLabel` — semantic with label
- `Vertical` — orientation variant
- `Showcase` — single-glance comparison surface (serves as Playground story per AC-2)

No new stories required for AC-1. Add brief doc note in the meta `parameters.docs.description.component` confirming theme matrix is exercised via Storybook toolbar (consistent with Chip story pattern reviewed).

## Brand × Notion verification path

1. If Notion MCP available in session: query `Branding` page, extract border/divider tokens, diff vs `--border` token consumed by `Separator`. Update local mirror if divergent.
2. If Notion MCP NOT available (current session): register "Brand × Notion: verificação manual pendente" in PR body for Fernando endorsement. Token surface here is minimal (just `--border` HSL triplet), so risk of divergence is low.

## Risk register

| Risk | Mitigation |
|---|---|
| `__image_snapshots__/` regenerated on macOS → silent visual regression | Snapshot dir does NOT exist for `separator/` (verified). No visual baseline coupling. If suite generates one during local run, listed under "Visual baselines (CI re-run needed)" and NOT committed. |
| jest-axe `color-contrast` rule trips on `--border` in dark theme | The `--border` token has been validated for both themes by sibling components (Chip, Badge, Skeleton). Inheriting the same helper means same result. If it fails, document the violation as a token-level gap (not Separator-specific) and surface to Fernando. |
| Test count drops below 20 after refactor | Test plan deliberately keeps all 14 existing tests + adds 7 new (21 total, +5% margin over AC-3 threshold). |
| Out-of-scope file touched | All file modifications during Phase 4 verified against the allow-list above. Diff check at Gate 2. |

## ADRs

None proposed. This is a DoD review (test + story coverage), not a contract or pattern change. No new technology, no deviation from sibling components (Chip, Badge, Skeleton already use the same `axeInThemes` helper).

## Gate 1 — Decision

Scope auto-approved (user invoked Auto Mode and gave explicit DoD via prompt). Proceeding to Phase 4 — Athena is executor.
