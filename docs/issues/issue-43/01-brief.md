# Phase 1 — Issue Brief

- **Plan sub-issue:** [#43 — Plan: review FileUpload against v0.1.0 DoD](https://github.com/guardiatechnology/design-system/issues/43)
- **Parent Issue:** [#42 — chore(file-upload): review FileUpload for v0.1.0 DoD (playground approval)](https://github.com/guardiatechnology/design-system/issues/42)
- **Type:** Chore (`evolvability ♻️`)
- **Author/Assignee:** @fernandoseguim
- **Orchestrator:** warrior-athena

## Context

`FileUpload` was migrated to brand-aware tokens and a11y coverage in PR #157 (Tech Task #125, group A). The component predates two pillars of the v0.1.0 DoD that the late-2026 cohort is sweeping through component-by-component:

1. **Storybook `DarkTheme` matrix story** — visual side-by-side of the critical states on a dark background (pattern established by Avatar #119, replicated by Button #209, IconButton #205, ButtonGroup #206, Combobox #219, DatePicker #218, Checkbox #217).
2. **Playground sign-off** by Fernando via Astro `/componentes/file-upload` (already live; this Plan just executes the explicit review pass).

This Plan closes that gap and lets the component graduate from `status: development` to `status: done` as part of v0.1.0.

## Notion context (consulted via MCP)

- [Branding (source of truth)](https://www.notion.so/Branding-34536f91ebd280a69efacbadab3861c6) — no FileUpload-specific page; the dropzone + button visuals follow the general tokens (`bg-action`, `text-action`, `text-button-fg`, `border-action`).
- No NEW Brand divergence detected. The two known divergences are already routed:
  - `--primary` → laranja em light vs Violeta no Notion → **Plan #208** (do NOT touch in this Plan).
  - `--fg-muted` placeholder sub-AA → **Plan #128** (the existing Storybook `parameters.a11y.config` already disables `color-contrast` for this caption text with a WHY comment).

## Current state of the component

- Source: `ui_kit/components/file-upload/index.tsx` (~712 LOC).
- Stories: `FileUpload.stories.tsx` — 14 stories covering Default + variants (WithHint, ValidationAccept, ValidationMaxSize, Multiple, Compact, Disabled, ControlledFiles, AutoUploadCustom, AutoUploadUrl, ButtonVariant, ButtonWithLabel, ButtonSizes, ButtonWithUploader, RejectCallback). **`DarkTheme` story is MISSING — this is the only structural gap.**
- Tests: `file-upload.test.tsx` — **63 `it(...)` blocks** (well above the ≥ 20 threshold), already grouped: `formatBytes`, `isAccepted`, base, brand-aware tokens, controlled, validação, variant=button, auto-upload, and a11y (6 jest-axe assertions covering dropzone + button + done + uploading + error + disabled, each via `axeInThemes`).
- Astro playground: `docs/src/pages/componentes/file-upload.astro` (453 LOC, side-by-side already wired through the cross-iframe theme toggle delivered in PR #119).

## Risks identified

- None structural. Component is feature-complete and DoD-compliant on test coverage and a11y. Only the visual `DarkTheme` matrix is missing.

## Open questions

- None. Standard delta following the 7-prior-component playbook.

## Next phase

→ Phase 2 — formalize the numbered ACs from the Plan body checklist.
