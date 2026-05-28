# Requirements — Plan #49 / Parent #48

Numbered acceptance criteria derived literally from Plan #49 DoD, parent #48 DoD, and the established v0.1.0 component-review pattern. Each test added in Phase 4 references the AC via `// AC-N` docstring per `lex-issue-driven` Rule 3.

## Acceptance Criteria

- **AC-1 (Storybook — Dark coverage):** `ui_kit/components/radio/Radio.stories.tsx` MUST export a `DarkTheme` story matching the canonical pattern from Checkbox/Input/Combobox/etc.: `globals: { theme: "dark" }`, `parameters.backgrounds.default = "dark"`, a `docs.description.story` justifying contrast preservation under `data-theme="dark"`, and a render matrix that exercises Default + checked + invalid + disabled + sizes (sm + md) + fieldset/legend composition. Every `<Radio>` inside the story MUST have an accessible name (label prop or wrapping `<label htmlFor>` or `aria-label`) — no axe `label`/`button-name`/`label-content-name-mismatch` violations on a dark surface (mitigation of the Plan #208 trap).

- **AC-2 (Storybook — Light coverage preserved):** Pre-existing light-mode stories (`Default`, `WithDescriptions`, `Horizontal`, `Sizes`, `Invalid`, `Disabled`, `Standalone`, `InsideForm`) MUST keep rendering correctly with no regression.

- **AC-3 (Playground side-by-side):** `docs/src/pages/componentes/radio.astro` MUST render the same component family as Storybook, and the side-by-side comparison (Astro vs Storybook) MUST be visually consistent under both light and dark themes via the cross-iframe toggle from PR #119. No code change expected here — verification only.

- **AC-4 (Behavioral tests — count):** `ui_kit/components/radio/radio.test.tsx` MUST contain ≥ 20 behavioral tests (current baseline: 24). Adding the new a11y surfaces brings the total higher. All tests MUST use accessible queries (`getByRole`, `getByLabelText`, `getByText`) per `lex-frontend-testing`; no `getByTestId`; no mocks of internal collaborators.

- **AC-5 (Behavioral coverage — semantic surfaces):** The test file MUST exercise: (a) click selects + deselects siblings (radio group single-selection semantics), (b) keyboard ArrowDown/ArrowUp cycle within group, (c) Space toggles selection on focused radio, (d) Tab moves focus outside the group (roving tabindex), (e) `checked`/`unchecked`/`disabled` rendered states, (f) form integration via `name` prop, (g) `aria-checked` correctness, (h) `role="radiogroup"` semantics with `aria-label`, (i) required-pattern behavior via `aria-required`, (j) controlled vs uncontrolled. Baseline already covers most; new test cases close (a)-deselection, (b)-ArrowUp, (d)-Tab exit, (g)-aria-checked, (i)-aria-required, (h)-aria-label.

- **AC-6 (Behavioral coverage — fieldset + legend):** Add a test that renders `<fieldset><legend>...</legend><RadioGroup>...</RadioGroup></fieldset>` and asserts the legend is reachable via `getByRole("group", { name: /.../ })` (semantic grouping) AND the radiogroup remains queryable with its own accessible name. This locks in the v0.1.0 DoD requirement for fieldset/legend semantics.

- **AC-7 (jest-axe — 6 canonical surfaces, light + dark):** The `a11y` block in `radio.test.tsx` MUST cover ≥ 6 surfaces via `axeInThemes`: (i) standalone single Radio (no group selection), (ii) RadioGroup with 3+ options no selection, (iii) RadioGroup with default selection, (iv) RadioGroup with `disabled` option mixed with enabled options, (v) RadioGroup with label association via `<label htmlFor>` external pattern, (vi) `<fieldset><legend>` + RadioGroup. Each surface runs through both themes via `axeInThemes(container)` (light + dark). 0 violations.

- **AC-8 (Brand × Notion):** Verify via Notion MCP (`mcp__claude_ai_Notion__notion-fetch`) on the Branding page (`34536f91ebd280a69efacbadab3861c6`) that the Radio's brand-aware tokens (`border-action`, `bg-action`, `border-border-strong`, `text-fg`, `text-fg-muted`, `border-destructive`) resolve consistently with Notion's canonical CTA hierarchy. With PR #226 already shipped (violet-500 primary in light, orange-500 in dark), surface only NEW divergences (if any) in the PR body.

- **AC-9 (CI pipeline green):** `npm run typecheck && npm run lint && npm run test && npm run build && npm run docs:build` MUST pass locally before the PR transitions out of draft. Visual regression CI may need `regenerate-baselines` label if the DarkTheme story introduces new visual surfaces.

- **AC-10 (PR closes both):** Final PR body MUST include `Closes #49` AND `Closes #48` on separate lines so GitHub auto-closes both on merge (new convention since Fernando flagged orphan parents). PR title follows Conventional Commits in English (`chore(radio): ...`); body includes the playground approval prompt for Fernando ("Está bom?").

## Definition of Done

- All 10 ACs satisfied.
- All tests pass locally (`npm run test`).
- All static checks green (`typecheck`, `lint`, `build`, `docs:build`).
- PR open against `main` from `chore/49-review-radio-v0-1-0-dod`, body includes both `Closes #49` and `Closes #48`, mirrored labels, size label, assignee `@me`.
- Plan #49 + parent #48 transition to `status: to review` on PR open.

## Out of Scope (declared)

- Any change to `index.tsx` beyond what is needed to satisfy axe / brand tokens. If implementation changes are required, STOP at Gate 1 and surface (currently not anticipated — tokens already align with #226).
- Visual snapshot updates if CI passes without them.
- Migration of `radio.test.tsx` filename to `Radio.test.tsx` (PascalCase) — would be cosmetic and out of v0.1.0 DoD; recorded as a Tangential Finding option below.

## Tangential Finding (surfaced per `lex-no-silent-tech-debt`)

- **TF-1:** `radio.test.tsx` uses lowercase filename while sibling components (`Checkbox.stories.tsx`, `Input.stories.tsx`) use PascalCase. The `.stories.tsx` file is already PascalCase. Options if Fernando wants alignment: (a) include the rename in this Plan (still scope-coherent), (b) open a new Plan under parent #48 covering filename casing alignment across all components, (c) defer. Default action absent a flag: defer (do not rename — Phase 6 visibility only).
