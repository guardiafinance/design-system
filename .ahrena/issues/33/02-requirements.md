# Requirements — Issue #33

> Numbered ACs derived from Plan #33 DoD. Tests reference `AC-N` in name/docstring.

## Acceptance Criteria

- **AC-1 — Storybook variant coverage in light + dark.** `Skeleton.stories.tsx` MUST expose Default + each shape variant (`text`, `title`, `rect`, `circle`) + composed example (avatar + lines). Theme toolbar / `data-theme` decorator MUST render every story consistently in light AND dark with no visual breakage.
- **AC-2 — Playground side-by-side comparison.** PR body MUST contain a comparison section (or link to Storybook static preview) confirming the rendered Skeleton matches the legacy/production reference.
- **AC-3 — Behavioral tests with accessible queries.** `skeleton.test.tsx` MUST use accessible queries (`getByRole`, `getByLabelText`, `getByText`) where the component exposes a role/label; `getByTestId` is allowed ONLY for the decorative default case (`aria-hidden="true"` → no role exposed). No internal collaborators mocked. ≥ 20 tests OR ≥ 80% file coverage on `index.tsx`.
- **AC-4 — A11y jest-axe in light + dark.** `skeleton.test.tsx` MUST include jest-axe assertions via `axeInThemes(container)` covering:
  - Default decorative Skeleton (aria-hidden);
  - Announced loading state (consumer wraps in `role="status" aria-busy="true"` with accessible name);
  - Composed example (avatar + lines).
  Both light AND dark MUST pass `toHaveNoViolations()`. Skeleton has no `disabled` surface — N/A; documented in test rationale.
- **AC-5 — Shape variants render correctly.** Each variant (`text`, `title`, `rect`, `circle`) exposes its expected CSS class (`h-3.5`, `h-[22px]`, `h-20`, `rounded-full`) and the default container element (`<span>`) is non-focusable (not in tab order).
- **AC-6 — `lines` paragraph behaviour.** `variant="text" lines={n}` renders `n` placeholder spans; last line ends at 70% width when no explicit `width`. Custom `width` propagates to all lines.
- **AC-7 — Animation respects `prefers-reduced-motion`.** Test confirms `skeleton-shimmer-bg` background + `motion-safe:animate-[skeleton-shimmer_...]` utility classes are applied — `prefers-reduced-motion` users keep the background gradient (visibility) but lose the shimmer.
- **AC-8 — Brand mirror verified against Notion.** Local Brand tokens (placeholder bg, shimmer color path) align with Notion source-of-truth. If divergence found, mirror is updated; otherwise documented as "manual verification pending" in PR.
- **AC-9 — Quality gate green.** `npm run typecheck && npm run lint && npm run test && npm run build && npm run docs:build` exit code 0 for every command.

## Out of scope

- Visual baseline regeneration (`__image_snapshots__/`) — user guardrail: never from macOS; CI re-run via `regenerate-baselines` label.
- New variants beyond the existing 4.
- Refactor of consumer code that wraps `Skeleton` in `role="status"`.
