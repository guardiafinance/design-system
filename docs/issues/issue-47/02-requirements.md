# Phase 2 — Requirements: Input v0.1.0 DoD review

> ACs derived 1:1 from the Plan #47 DoD checklist. Each AC is testable — the "Verification" column points to the concrete mechanism Gate 2 will exercise in Phase 6.

## Definition of Done (canonical reference)

- Source: Plan #47 body (executable spec). Parent Issue #46 carries the same DoD textually.
- Each AC below MUST have ≥ 1 test annotated with `AC-N` (via `// AC-N` comment or test name suffix) per `codex-issue-workflow`.
- Pre-existing tests that already cover a DoD line are reused (no rewrite); the AC trace is added inline.

## Acceptance Criteria

### Playground + Storybook surface

| AC | Description | Verification |
|----|-------------|--------------|
| **AC-1** | `npm run dev:all` boots Storybook + Astro docs; the `/componentes/input` page renders BasicRow, WithIconsRow, PrefixSuffixRow, SizesRow, StatesRow, DisabledRow, FormSubmitRow + live `LiveInputSnippet` without console errors. | Manual smoke during Gate 1/2; Fernando's "está bom" at Phase 7. |
| **AC-2** | `Input.stories.tsx` exposes Default + main variant stories (`WithLeftIcon`, `WithRightIcon`, `WithPrefix`, `WithSuffix`, `PrefixAndSuffix`, `Sizes`, `States`, `Currency`, `SearchInput`) in **light** AND **dark** via the Storybook toolbar (PR #119). | Stories enumerated; toolbar toggles `data-theme` on `<html>`; build clean. |
| **AC-3** | `Input.stories.tsx` includes a `DarkTheme` story matrix (parity with `Avatar` / `IconButton` / `ButtonGroup` / `Button` / `Checkbox` / `DatePicker` / `Combobox`) — covers visual critical states on a `bg-background` surface forced to dark (`globals.theme: "dark"`, `parameters.backgrounds.default: "dark"`). | Story file exports `DarkTheme`; visual review on Storybook. |
| **AC-4** | Playground (`docs/src/pages/componentes/input.astro`) renders **side-by-side** with the Storybook reference (`storybookId="components-input--default"`), keeping the canonical Props table, A11y section, and `LiveInputSnippet` editor working. | `npm run docs:build` green; Astro page renders. |

### Behavioral tests

| AC | Description | Verification |
|----|-------------|--------------|
| **AC-5** | `input.test.tsx` contains **≥ 20 behavioral tests** (Plan #47 DoD floor). | `grep -c '^\s*it(' input.test.tsx` returns ≥ 20; `npm run test -- input.test` green. |
| **AC-6** | Tests use **accessible queries** (`getByRole`, `getByLabelText`, `getByPlaceholderText`) per `lex-frontend-testing`. No mocking of internal collaborators. | Code review at Gate 2 — only `userEvent`, `screen.getBy*` queries; no `vi.mock` of Input internals. |
| **AC-7** | Coverage spans: text typing, controlled vs. uncontrolled value, `defaultValue`, `placeholder`, `disabled`, `readOnly`, `required`, type variants (`text`, `email`, `number`, `password`, `tel`, `url`, `search`), `maxLength`, `minLength`, `pattern`, form integration via `name` + `FormData`, `onChange`/`onBlur`/`onFocus`, `aria-invalid`, `aria-describedby` wiring for description and error, prefix/suffix slots, `autocomplete`. | One test per scenario annotated `AC-7 (<scenario>)`. |

### Accessibility (jest-axe)

| AC | Description | Verification |
|----|-------------|--------------|
| **AC-8** | `input.test.tsx` runs `axeInThemes()` (light + dark via `data-theme` on `<html>`) on at least: **Default empty + Default filled with label**, **with description (`aria-describedby`)**, **with error (`aria-invalid` + described error message)**, **disabled**, **readOnly**, and one representative **type variant** (e.g., `type="email"`). | jest-axe assertions present and green for both themes; one test per scenario annotated `AC-8 (<scenario>)`. |

### Brand × Notion check

| AC | Description | Verification |
|----|-------------|--------------|
| **AC-9** | Brand (colors, typography, focus ring) checked against the canonical Notion source (`Branding` page) via Notion MCP. Surface only **new** divergence — the known `--primary` / `--ring` discussion is already routed to Plan #208 and is explicitly out of scope here. | Result recorded in `03-architecture.md`; if a new divergence is found, Athena stops and pings Fernando before proceeding. |

### Gap report

| AC | Description | Verification |
|----|-------------|--------------|
| **AC-10** | Any visual or functional gap identified during the review is listed in `03-architecture.md` (or, when material, surfaced as a tangential finding per `lex-no-silent-tech-debt` and triaged to a new Plan/Issue with Fernando's explicit choice). | Section present in `03-architecture.md`. |

### Build gates (cross-cutting DoD lines)

These are not new ACs — they are the build-time validations Gate 2 will run across the whole DoD:

- `npm run typecheck` — green.
- `npm run lint` — green.
- `npm run test` — green (including the new + existing Input tests with the jest-axe matrix in both themes).
- `npm run build` — green (`ui_kit` builds with Input intact).
- `npm run docs:build` — green (Astro page renders).

### Closeout

| AC | Description | Verification |
|----|-------------|--------------|
| **AC-11** | Explicit "está bom" from Fernando on the PR — the Plan #47 status transitions `to review → to release → done` only after that approval (Argos may interleave the `to review ↔ review` sub-cycle). | PR comment from Fernando captured. |
| **AC-12** | PR title `chore(input): close v0.1.0 DoD review (#47)`; body includes `Closes #47`; PR labels mirror Plan #47 + add `size/*` per `lex-pr-quality`. | `gh pr view --json title,body,labels` after creation. |

## Definition of Out-of-Scope

- Token changes (`--primary`, `--ring`) — owned by Plan #208.
- Composer components (DatePicker trigger, Combobox trigger, FormLayout fields, FileUpload file-name display) — owned by their respective Plans.
- Release / tag / changelog — owned by `warrior-janus`.
- Visual baselines regeneration — only if a `regenerate-baselines` label is added on the PR (Ubuntu/CI rendered).
- Anything outside `ui_kit/components/input/**` and `docs/src/pages/componentes/input.astro` (+ associated previews) unless required to honor a DoD line.

## Traceability promise

In Phase 4, each new or extended test MUST be annotated `AC-N` (in test name or inline `// AC-N` comment). Gate 2 will reject the PR if any AC has zero tests linked, or if new tests exist without an AC link (scope-creep guard per `lex-issue-driven` Rule 3 + Rule 6).
