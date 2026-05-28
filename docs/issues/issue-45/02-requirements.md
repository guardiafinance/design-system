# Phase 2 — Requirements: Plan #45 (FormLayout v0.1.0 DoD review)

The 10-box DoD from the Plan #45 body is canonical. Mapped to numbered ACs:

## Acceptance Criteria

- **AC-1** — Playground runs locally: `npm run dev:all` opens `/componentes/form-layout` without errors. (DoD #1)
- **AC-2** — Storybook coverage in **light AND dark**: `FormLayout.stories.tsx` includes a new `DarkTheme` story under `globals.theme: "dark"` with `backgrounds.default: "dark"`, demonstrating the compound's main variants (`stacked` / `split` / `inline`) + densities (`comfy` / `compact`) + states (default / errors / disabled / fieldset+legend). Existing `Stacked` / `Split` / `Inline` / `WithErrors` / `CompactDensity` stories continue to render correctly in both themes through Storybook's theme toolbar. (DoD #2)
- **AC-3** — Playground side-by-side review documented in this Plan against the legacy / production reference. (DoD #3)
- **AC-4** — `form-layout.test.tsx` exercises user behavior via accessible queries (`getByRole`, `getByLabelText`) per `lex-frontend-testing`; ≥ 20 tests OR ≥ 80% file coverage; no mocking of internal collaborators. Extension MUST cover the layout-primitive concerns:
  - Label ↔ control association via `htmlFor` (existing — keep)
  - Required-field semantics: visual `*` + `aria-required` exposure
  - Error wiring: `aria-invalid` + `aria-describedby` (existing — keep) + `role="alert"`
  - Hint wiring: `aria-describedby` (existing — keep)
  - `fieldset` / `legend` grouping when composed inside the layout
  - Form submission propagation (`<form onSubmit>` reaches handler)
  - Pass-through of native form attributes (`name`, `noValidate`)
  - Disabled state cascading via native `fieldset[disabled]`
  - Controlled vs uncontrolled child pass-through (single child injection preserved)
- **AC-5** — Jest-axe matrix on `light AND dark` via `axeInThemes()` covering at minimum:
  - Empty `Default` layout (Header + Section + Row + Field)
  - Layout with fields filled (controlled inputs with values)
  - Layout with `error` visible on a Field
  - Layout with a disabled `fieldset` wrapping a Field
  - Layout composing `fieldset` + `legend` for grouping
  - `aria-required` exposure on required Field
  All `expect(...).toHaveNoViolations()`. Non-negotiable. (DoD #5)
- **AC-6** — Brand check against Notion: subpages Cores / Tipografia / Logomarca / Voz fetched via `mcp__claude_ai_Notion__notion-fetch`. Surface only NEW divergences (the `--primary` divergence routed to Plan #208 is OUT of scope and MUST NOT be re-flagged). (DoD #6)
- **AC-7** — Any new visual or functional gap listed in this Plan / PR. (DoD #7)
- **AC-8** — `npm run typecheck && npm run lint && npm run test && npm run build && npm run docs:build` all green locally; CI green on the PR. (DoD #8)
- **AC-9** — Explicit "está bom" from @fernandoseguim recorded on the PR. (DoD #9 — Gate 2 awaiting-human stage)
- **AC-10** — PR body includes `Closes #45`. (DoD #10)

## Definition of Done (recap)

All 10 ACs satisfied OR explicitly surfaced as a gap to Fernando before merge.

## Out of scope

- Behavioral changes to the FormLayout component itself (additive review, not refactor)
- Brand token migration for `--primary` (owned by Plan #208)
- Visual baseline regen for existing stories (only triggered if rendering changes)
- Refactor of individual wrapped components (Input / Select / Checkbox have their own Plans)
- Releases — owned by Janus (`warrior-janus`)
