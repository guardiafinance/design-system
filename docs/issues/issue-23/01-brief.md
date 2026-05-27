# Brief — Plan sub-issue #23

> Phase 1 of the Issue-Driven Development flow conducted by `warrior-athena`.
> Plan sub-issue under parent Issue #22 (Epic #13 — v0.1.0 primitives DoD).

## Identification

- **Plan sub-issue:** [#23 — Plan: review ButtonGroup against v0.1.0 DoD](https://github.com/guardiatechnology/design-system/issues/23)
- **Parent Issue:** [#22 — chore(button-group): review ButtonGroup for v0.1.0 DoD (playground approval)](https://github.com/guardiatechnology/design-system/issues/22)
- **Epic ancestor:** #13 (v0.1.0 — primitives DoD review)
- **Type:** Tech Task / `evolvability ♻️`
- **Author / Assignee:** @fernandoseguim
- **Repository:** `guardiatechnology/design-system`
- **Branch:** `chore/23-review-button-group-v010-dod` (worktree
  `.worktrees/23-review-button-group-v010-dod/` per `lex-git-worktrees`)
- **Category:** Primitivos

## Context

`ButtonGroup` was migrated to the new DoD **before** the v0.1.0 rules
landed for (1) playground approval, (2) Storybook coverage in light +
dark, (3) jest-axe in both themes, and (4) Brand validation against
the Notion source-of-truth. Plan #23 closes that gap so the component
can move from `status: development` to `status: done` as part of v0.1.0.

The component sits next to ~10 sibling Plans (`#21, #27, #37, #39,
#41, #43, #45, #47, #49, #51`) running the **same shape** of review
in parallel. The canonical executed sibling is **Plan #19 (Badge)**;
this brief mirrors its structure 1:1 to keep the Epic cohesive.

## Current state on `main` (observed)

| Artifact | Path | State |
|---|---|---|
| Component | `ui_kit/components/button-group/index.tsx` | 91 LoC; `cva` + `forwardRef`; `role="group"` default; `orientation × attached`; data attrs `data-slot`, `data-orientation`, `data-attached`; zero hardcoded color (composes Button children) |
| Stories | `ui_kit/components/button-group/ButtonGroup.stories.tsx` | 130 LoC; 6 stories (Default, Attached, Spaced, Vertical, Toolbar, MixedVariants); `MixedVariants` already documents the `color-contrast` disable WHY |
| Tests | `ui_kit/components/button-group/button-group.test.tsx` | 114 LoC, **10 tests**, **0 jest-axe**, **0 dark-theme coverage** |
| Playground | `docs/src/pages/componentes/button-group.astro` | Present and rich (Attached, Spaced, Vertical, Toolbar, MixedVariants, LiveSnippet, Props, A11y) — reuses Astro topbar theme toggle from #119 |

## Inherited infra (do NOT reimplement — comes from PR #119, Plan #17 Avatar)

- Global Storybook `globalTypes.theme` toolbar (`light`/`dark`) flipping
  `data-theme` synchronously on `<html>` via `applyThemeSync`
  (`.storybook/preview.tsx`).
- Astro playground topbar theme toggle with cross-iframe theme propagation.
- `ui_kit/test-utils/a11y.ts` (`axeInThemes`, `setTheme`, `restoreTheme`,
  `THEMES`).
- jest-axe + `toHaveNoViolations` matcher wired in `vitest.setup.ts`.

## Identified gaps (to close in Phase 4)

1. **jest-axe in light + dark** — `button-group.test.tsx` has none. Need
   `axeInThemes(container)` on Default, primary interactive state
   (focused button via Tab — keyboard semantics live on the children
   `<button>`s, not on the group `<div>`), Toolbar role, and the
   disabled-equivalent (`<Button disabled>` inside the group).
2. **Behavioral coverage threshold** — currently 10 tests. Plan #23 DoD
   asks `≥ 20 tests OR ≥ 80% file coverage`. The component is
   91 LoC, mostly variant class assembly; we will reach the test count
   by exercising more behavioral surfaces (keyboard nav across the
   group, focus-visible z-10 contract, attached × orientation matrix,
   defaults invariants, IconButton + ariaLabel toolbar pattern, ref
   forwarding under each orientation, className merge, custom role
   forwarding to assistive tech).
3. **Storybook dark-theme verification** — the global toolbar already
   flips theme; stories are passive consumers. AC verifies the matrix
   visually + via `build-storybook` green and the jest-axe theme matrix
   above. No story-level dark-mode story required (the toolbar is the
   canonical mechanism — same model as Badge / Avatar).
4. **Playground side-by-side vs legacy/produção atual** — no legacy
   versioned reference file exists for ButtonGroup. Per the Badge
   precedent (AC-2 in issue-19/02-requirements.md), the Astro
   playground at `docs/src/pages/componentes/button-group` IS the
   canonical v0.1.0 reference. The PR body records a `## Playground`
   section with a link + a note matching the Badge convention.
5. **Brand vs Notion** — Notion MCP is **enabled** in `.directives`
   (`mcp.servers: [ahrena, github, notion]`). We will use it to read
   the Branding root + Cores/Tipografia/Logo subpages. Divergence: if
   Notion prevails, update the local mirror (`.claude/rules/design/
   brand/lex-brand-*`) **before** Gate 1 sign-off. For ButtonGroup
   specifically, the component consumes Button tokens transitively;
   the relevant Brand surfaces are color (delegated to Button
   variants), typography (inherited from `font-family` global), no
   logo. Verification stays at the token-level (zero hardcoded color
   in `index.tsx`).
6. **5 commands green** — `npm run typecheck && lint && test && build
   && docs:build` must all exit 0 at Gate 2.
7. **PR closes Plan #23** — body carries `Closes #23` + `Refs #22`.

## Out of scope (surface as new Plan if needed)

- Adding arrow-key navigation inside `toolbar` role (deferred — not in
  current ButtonGroup contract; would need its own ARIA Authoring
  Practices roving-tabindex implementation).
- Visual regression baselines refresh (Ubuntu/CI SoT per
  `feedback_visual_regression_ubuntu_sot`). Trigger via
  `regenerate-baselines` label on the PR if any visual class changes.
- Refactoring Button variants — out of scope for #23.

## Risks

- **Low.** Component is small (91 LoC), no behavior change planned,
  only test coverage + jest-axe addition. The Toolbar story renders
  IconButton with `aria-label`; jest-axe should pass cleanly.
- **Brand × Notion** — if Notion lists a tokens change that affects
  Button (transitive), the scope expands; per `lex-agent-focus-on-active-plan`,
  surface and ask Fernando before touching.

## Notion context (Phase 1 fetch)

To be performed in Phase 4 against the Branding root
(`34536f91ebd280a69efacbadab3861c6`) and the 4 subpages (Cores,
Tipografia, Logo, Voz). For ButtonGroup specifically, only Cores and
Tipografia are materially relevant — Logo and Voz do not apply.

## Next phases

- Phase 2 — author `02-requirements.md` with numbered ACs (AC-1 to AC-7
  mirroring Badge/issue-19).
- Phase 3 — author `03-architecture.md` declaring the file scope
  (whitelist for Gate 2 scope-creep check).
- Gate 1 — present to Fernando.
