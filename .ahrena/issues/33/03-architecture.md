# Architecture — Issue #33

## Scope guardrail

Only files inside `ui_kit/components/skeleton/` and `.ahrena/issues/33/` are touched. Per `lex-no-silent-tech-debt`, any finding outside this scope is surfaced as a comment on #33 and excluded from the PR diff.

## Affected components

| Path | Type | Change |
|---|---|---|
| `ui_kit/components/skeleton/index.tsx` | source | Unchanged (component is correct as implemented) |
| `ui_kit/components/skeleton/Skeleton.stories.tsx` | storybook | Already covers Default + 4 variants + 3 composed. Light/dark handled by the global `data-theme` decorator / toolbar — no story-level change needed |
| `ui_kit/components/skeleton/skeleton.test.tsx` | test | Rewrite — accessible queries, add jest-axe in light+dark, raise to ≥ 20 tests; keep all existing structural coverage as guards |
| `.ahrena/issues/33/01-brief.md` | doc | New |
| `.ahrena/issues/33/02-requirements.md` | doc | New |
| `.ahrena/issues/33/03-architecture.md` | doc | New (this file) |
| `.ahrena/issues/33/05-security-review.md` | doc | New |
| `.ahrena/issues/33/06-quality-report.md` | doc | New |

No `__image_snapshots__/` directory exists for skeleton — out of scope.

## Theming pattern (light + dark)

The design system reacts purely via CSS — flipping `data-theme="dark"` on `<html>` swaps the token cascade. The existing `axeInThemes(container)` helper from `ui_kit/test-utils/a11y.ts` orchestrates the toggle + `axe(container)` per theme.

```
import { axeInThemes } from "@/test-utils/a11y";
const { container } = render(<Skeleton width={240} />);
await axeInThemes(container);  // runs axe in light then dark
```

Mirrors the canonical pattern used in `badge.test.tsx`, `card.test.tsx`, `input.test.tsx`, `icon-button.test.tsx`, `radio.test.tsx`.

## Accessibility model

Skeleton is **decorative by default**: `aria-hidden="true"` on the rendered `<span>`. There is no role, no focus, no keyboard interaction — confirmed by the existing implementation (`index.tsx` lines 84, 112). The "keyboard navigation" AC from the DoD template is satisfied by asserting the element is **not in the tab order** (no `tabindex`, not interactive).

When loading needs to be **announced**, the consumer wraps the Skeleton group in a parent `role="status" aria-busy="true"` with an SR-only label ("Carregando…"). The jest-axe test for AC-4 exercises both paths:

1. Decorative-only (default consumer pattern).
2. Announced-loading pattern (recommended consumer wrap).
3. Composed example (profile row: avatar + lines) — exercises the realistic loading shell.

## Tests of unit plan (AC-3, AC-4)

Target: 22+ tests of unit covering:
- Structural (variant CSS classes) — keep existing 6 tests as regression guards.
- Default element + non-focusability (AC-5).
- `lines` behaviour (AC-6).
- Shimmer utility (AC-7).
- A11y attributes default + override (existing 2 + new accessible-name queries).
- jest-axe matrix (3 × light+dark) (AC-4).

## Brand × Notion (AC-8)

Skeleton consumes `skeleton-shimmer-bg` utility — defined in `ui_kit/styles/index.css:591` — and the `skeleton-shimmer` keyframe (lines 570, 580). The utility itself uses CSS custom properties (no hardcoded hex). No new brand surface introduced in this PR. Verification path:
- Local mirror: `lex-brand-colors` (palette tokens) already enforced.
- Notion source-of-truth: skeleton placeholder color is part of the neutral surface system; no specific Skeleton entry in Notion at the time of review.
- **Decision:** documented as "manual verification pending" in PR (no automated drift tool); no local mirror update needed.

## Risks

| Risk | Mitigation |
|---|---|
| jest-axe failures in dark due to low-contrast shimmer | Skeleton sets `aria-hidden="true"` — axe's color-contrast rule does not apply to hidden elements. Announced-loading test wraps in `role="status"` (still no real content) — axe focuses on landmark structure |
| Snapshot diffs from CSS-only changes | None — no CSS touched in this PR |
| Visual baseline drift | Outside scope. PR note instructs CI re-run via `regenerate-baselines` label if any snapshot diff surfaces |

## Stacked PR Decomposition

Not applicable — single atomic PR (Plan #33, `lex-agent-planning`: one Plan = one PR).
