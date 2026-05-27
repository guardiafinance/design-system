# Phase 2 — Requirements: chore(chip): review Chip for v0.1.0 DoD

> 7 numbered ACs mapped 1:1 to the Plan #25 DoD checklist. Each behavioral test in `chip.test.tsx` either already cites one of these ACs implicitly through its scope, or is mapped here in the AC ↔ test traceability table of the Quality Report (Phase 6).

## Acceptance Criteria

### AC-1 — Storybook renders Default + main variants in light AND dark

`Chip.stories.tsx` MUST export:

- `Default` story rendering the resting `brand outline` chip.
- Coverage of the 7 variants × 3 appearances matrix (via `Matrix` and `MatrixSelected` stories, or equivalent compound stories).
- Coverage of all 4 interaction modes documented in `index.tsx` JSDoc (filter, removable, filter+removable split, visual-only).
- All stories MUST render correctly when the Storybook theme control is toggled between `light` and `dark`.

**Evidence:** human review of Storybook in both themes (recorded in PR body as a "Visual approval" note); no Storybook errors in `npm run build` of the Storybook target (covered by Quality Gate AC-6).

### AC-2 — Playground side-by-side comparison vs. legacy/production

The PR body MUST register the playground comparison: `npm run dev:all` opens Storybook + Astro docs at `/componentes/chip`; the reviewer compares the rendered chip against the legacy/production reference and notes any visual delta in the PR.

**Evidence:** PR body section "Playground comparison" with explicit reviewer note (Fernando's `está bom`) OR a recorded screenshot pair if the human prefers.

### AC-3 — Behavioral tests with accessible queries, no internal-collaborator mocks, ≥ 20 tests OR ≥ 80% file coverage

`chip.test.tsx` MUST:

- Use accessible queries (`getByRole`, `getByText`, `getByLabelText`) per `lex-frontend-testing`. `getByTestId` is acceptable when used to validate `data-*` attributes that are part of the public API (`data-slot`, `data-selected`, `data-variant`).
- Mock NOTHING beyond external boundaries (none required — the Chip has no I/O).
- Exercise: render, default non-interactive state, `onSelect` toggle (click + keyboard), `onRemove`, split-interactive mode (filter + removable), `disabled` for both `onSelect` and `onRemove`, leadingIcon, ref forwarding, and `data-*` exposure.
- Reach ≥ 20 `it()` cases OR ≥ 80% file coverage (measured by Vitest c8/v8).

**Evidence:** test run output captured in the Quality Report; current state: 26 `it()` declarations + parameterized `it.each` cases (effective count ≈ 60+ when expanded).

### AC-4 — jest-axe in light AND dark for Default, primary interactive state, disabled

`chip.test.tsx` MUST contain a `describe("a11y", ...)` block (or equivalent) using `axeInThemes` from `@/test-utils/a11y` that runs `toHaveNoViolations()` in BOTH themes for at minimum:

- `Default` (resting `brand outline`).
- Primary interactive state — `selected: true` with `onSelect` handler.
- `disabled` state.

Additional jest-axe coverage of the 7 variants × `selected: true | false` matrix is welcomed and already present.

**Evidence:** all 4 (minimum) jest-axe assertions pass in the Quality Gate test run.

### AC-5 — Brand validated against Notion source of truth

Local mirrors `lex-brand-colors`, `lex-brand-typography`, `lex-brand-logo` MUST match the Notion Branding hub. The Chip uses brand tokens only (no hardcoded values) — visual inspection of `index.tsx` confirms exclusive use of `bg-action`, `border-action`, `text-button-fg`, `bg-guardia-{color}-{100|500|700}`, `bg-signal-{color}-{100|500|700}`, `text-foreground`, `bg-background`, `border-border-strong`.

The Notion MCP server is NOT active in this session — Brand × Notion check is recorded as **manual verification pending**, surfaced to Fernando in the PR body. Per `lex-mcp` rule 4, the agent surfaces the gap rather than silently substituting.

**Evidence:** PR body section "Brand × Notion" with explicit status (manual / verified / divergent).

### AC-6 — Quality Gate commands all green

The full suite MUST pass:

- `npm run typecheck` — TypeScript strict mode, 0 errors (per `lex-frontend-typing`).
- `npm run lint` — ESLint, 0 errors.
- `npm run test` — Vitest, all tests pass (incl. jest-axe assertions in both themes).
- `npm run build` — Vite component build, 0 errors.
- `npm run docs:build` — Astro docs build, 0 errors.

Image-snapshot diffs (`__image_snapshots__/`) are NOT regenerated locally per user guardrail (macOS vs. Ubuntu/CI rendering divergence). Affected snapshots are listed in the PR body for the `regenerate-baselines` CI workflow.

**Evidence:** Quality Report (Phase 6) records exit code + summary per command.

### AC-7 — Plan #25 closes via PR merge

The PR body MUST contain `Closes #25` so the Plan sub-issue auto-closes on merge per `lex-agent-planning`. PR also references `Refs #24` (parent chore).

**Evidence:** PR body inspection.

## Definition of Done (rollup)

DoD = AC-1 ∧ AC-2 ∧ AC-3 ∧ AC-4 ∧ AC-5 ∧ AC-6 ∧ AC-7. AC-2 and Fernando's `está bom` are HUMAN gates — the agent prepares the PR but does NOT merge.

## Out of Scope (per #24)

- New features beyond legacy parity.
- Brand/token refactors unrelated to `Chip`.
- Visual baseline regeneration from macOS.
- Release (out of scope per user guardrail — no `git tag` / `gh release`).
