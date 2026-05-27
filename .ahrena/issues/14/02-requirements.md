# Phase 2 — Requirements: Slider v0.1.0

> ACs numerados (AC-1..AC-13) derivados 1:1 do checklist do DoD do Plan #15. Cada AC é testável — a coluna "Verificação" aponta para o mecanismo concreto que será exercitado em Phase 6 (Gate 2).

## Definition of Done (canonical reference)

- Source: Plan #15 body (executable spec). Tech Task #14 carries the same DoD textually.
- Each AC below MUST have ≥ 1 test annotated with `AC-N` (via `// AC-N` comment or test name suffix) per `codex-issue-workflow`.

## Acceptance Criteria

### Component surface & rendering

| AC | Description | Verification |
|----|-------------|--------------|
| **AC-1** | `Slider` exported from `ui_kit/components/slider/index.tsx`; component renders an underlying `<input type="range">` reachable via `getByRole('slider')`. | Unit test querying `role=slider`. |
| **AC-2** | `Slider` is re-exported from `ui_kit/components/index.ts` so consumers import it from the package barrel. | Type-check + grep at Gate 2 + import resolution test. |
| **AC-3** | Component forwards `ref` to the underlying native `<input>` (per `lex-frontend-testing` § "boundary mocks only" — internal collaborators are not mocked). | Test calling `ref.current.focus()` and asserting `document.activeElement`. |

### API surface

| AC | Description | Verification |
|----|-------------|--------------|
| **AC-4** | Props surface includes `value`, `defaultValue`, `onValueChange(number)`, native `onChange`, `min`, `max`, `step`, `size` (`'sm' \| 'md'`), `showValue`, `prefix`, `suffix`, `format?: (v: number) => string`, `invalid`, `disabled`. Controlled and uncontrolled paths both work. | Tests for controlled (`value` + `onValueChange`) and uncontrolled (`defaultValue`); arrow-key navigation updates value. |
| **AC-5** | When `showValue` is `true`, the rendered value reflects `format(value)` (when provided) and the optional `prefix` / `suffix` are concatenated around it. | Tests for plain value, `format` only, `prefix`+`suffix` only, all three together. |

### CVA variants

| AC | Description | Verification |
|----|-------------|--------------|
| **AC-6** | `size` variant produces distinct class output for `sm` and `md` (default = `md`). Implemented via CVA per the parity pattern used by sibling Forms components (e.g. `Switch`). | Test asserts class lists differ across `size='sm'` vs `size='md'`. |
| **AC-7** | `invalid` state sets `aria-invalid="true"` and applies the invalid variant class; default is `aria-invalid="false"` / absent. | Test asserts attribute toggle. |
| **AC-8** | `disabled` state passes `disabled` to the underlying input AND applies the disabled variant class; keyboard events do not change the value while disabled. | Test asserts `input.disabled === true`, attempts arrow-key change, value unchanged. |

### Styling

| AC | Description | Verification |
|----|-------------|--------------|
| **AC-9** | Global `.guardia-slider` styles in `ui_kit/styles/index.css` define: CSS custom property `--pct` driving track fill gradient; `::-webkit-slider-runnable-track` + `::-moz-range-track` + `::-moz-range-progress`; thumbs; focus rings; `sm` + `md` sizes; `invalid` + `disabled` modifier styles. Uses **only semantic tokens** (zero hardcoded colors). | Gate 2 grep: no hex/rgb literals introduced under `.guardia-slider`; new selectors present. |

### Tests (≥ 20)

| AC | Description | Verification |
|----|-------------|--------------|
| **AC-10** | `Slider.test.tsx` contains **≥ 20 behavioral tests** using accessible queries (`getByRole('slider')`, `getByLabelText`) per `lex-frontend-testing`; covers value updates (controlled + uncontrolled), arrow-key navigation, `onValueChange` callback, `format`/`prefix`/`suffix` rendering, `invalid` (aria-invalid), `disabled`, `ref` forwarding. No internal-collaborator mocks. | `npm run test -- slider` reports ≥ 20 passing tests in the file. |
| **AC-11** | **A11y (jest-axe)** tests in `Slider.test.tsx` toggle `data-theme` on `document.documentElement` and run `toHaveNoViolations()` against at least: `Default`, an interactive state (focused/changed value), and `disabled` — each asserted in **both `light` AND `dark`** (per Notion Dark Mode guideline and Fernando's memory pin). | jest-axe assertions present and green for both themes. |

### Storybook + docs site

| AC | Description | Verification |
|----|-------------|--------------|
| **AC-12** | `Slider.stories.tsx` provides stories `Default`, `All sizes`, `Controlled`, `With format/prefix/suffix`, `Invalid`, `Disabled`; renders in **light** and **dark** without visual regression (visual baselines, if needed, are produced on Ubuntu via the `regenerate-baselines` workflow — NEVER committed from macOS). | `npm run build-storybook` clean; stories enumerated. |
| **AC-13** | Docs site has `docs/src/pages/componentes/slider.astro` + `docs/src/previews/slider.tsx` + `docs/src/previews/slider-live.tsx`; `Slider` added to the `MIGRATED` Set in `docs/src/pages/index.astro` (around line 678). | `npm run docs:build` succeeds and the new page builds; grep confirms `MIGRATED.has("Slider")`. |

## Cross-cutting build gates (DoD lines, not new ACs)

These are not ACs in themselves — they are the build-time validations Gate 2 runs across the whole DoD:

- `npm run typecheck` — green (validates AC-1..AC-8 type contract).
- `npm run lint` — green (no ESLint violations introduced).
- `npm run test` — green, **and** the new Slider tests inside it ≥ 20 (AC-10) including jest-axe in both themes (AC-11).
- `npm run build` — green (validates `ui_kit` builds with the new component and export).
- `npm run docs:build` — green (validates AC-13 and the Astro pages render).

## Definition of Out-of-Scope

- RangeSlider (two-thumb variant) — defer to a separate Tech Task if needed in the future.
- New brand tokens beyond `--pct` (the single CSS custom property Slider strictly needs).
- Migration of any other Forms component (Switch, Textarea, etc.) — each has its own Tech Task under Epic #13.
- Release / tag / changelog — owned by warrior-janus; not in this flow.

## Traceability promise

In Phase 4, each test added MUST be annotated `AC-N` (in name or docstring). Gate 2 will reject the PR if any AC has zero tests linked, or if tests exist without an AC link (scope-creep guard per `lex-issue-driven` Rule 3 + Rule 6).
