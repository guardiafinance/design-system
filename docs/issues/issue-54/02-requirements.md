# Phase 2 — Requirements: Textarea v0.1.0 DoD

Acceptance criteria derived 1:1 from Plan #55 DoD + parent #54 DoD. Each test added in Phase 4 references the AC via `// AC-N` comment per `lex-issue-driven` Rule 3.

## Definition of Done (canonical reference)

- Source: Plan #55 body (executable spec). Parent Issue #54 carries the same DoD textually.
- Each AC below MUST have ≥ 1 test annotated with `AC-N` (via `// AC-N` comment or test name suffix).
- Tests use accessible queries (`getByRole`, `getByLabelText`) per `lex-frontend-testing`; no mocking of internal collaborators.

## Acceptance Criteria

### Component implementation

| AC | Description | Verification |
|----|-------------|--------------|
| **AC-1** | `ui_kit/components/textarea/index.tsx` reimplements `Textarea` with React + Tailwind v4 + CVA, exposing props `size: "sm" \| "md" \| "lg"`, `state: "default" \| "error" \| "success"`, `invalid?: boolean`, `showCount?: boolean`, `autoSize?: boolean`, `maxRows?: number`, `resize?: "none" \| "vertical" \| "both"`, plus all native `<textarea>` props via `...rest`. `forwardRef` points to the underlying `<textarea>`. | Type-check + behavioral tests verifying each prop's effect. |
| **AC-2** | Sizes (sm/md/lg) mirror the legacy reference visual: sm min-height 60px / 13px font / 8-11 padding; md min-height 84px / 14px / 10-13 (default); lg min-height 112px / 15px / 12-15. Use Tailwind utilities only — no hardcoded colors; only semantic tokens (`bg-background`, `border-primary`, `text-fg`, `placeholder:text-fg-muted/70`). | Snapshot of class strings + behavioral test asserting size class applies. |
| **AC-3** | States: `state="default"` → border-primary; `state="error"` (or `invalid={true}`) → border-destructive + `aria-invalid="true"` propagated to `<textarea>` + focus ring destructive; `state="success"` → border-signal-green. Mirrors Input's token usage exactly. | Behavioral tests + axe in light + dark. |
| **AC-4** | `showCount` opt-in renders a character counter anchored bottom-right of the wrapper. When `maxLength` is set, format is `{current} / {max}`; without `maxLength`, format is `{current}`. Counter is `aria-hidden="true"` (consumer's screen-reader feedback comes from `aria-describedby` to a sibling status — counter is purely visual). | Behavioral test typing into textarea and asserting counter text updates. |
| **AC-5** | `autoSize` (default `false`) auto-grows the textarea to fit content up to `maxRows` (when set), keeping min-height from the size variant. Implementation: layout-effect measures `scrollHeight` and writes `style.height` after every value change, plus on mount. When `autoSize` is true, `resize` defaults to `none` (the manual handle conflicts with the auto sizing). | Behavioral test: type multi-line content, assert `style.height` increased. |
| **AC-6** | `resize` controls the CSS `resize` property (`vertical` default, `none`, `both`). When the consumer explicitly passes `resize`, that takes precedence over the autoSize default. | Behavioral test asserting `style.resize` reflects the prop. |
| **AC-7** | `disabled` propagates to the `<textarea>`, sets `data-disabled="true"` on the wrapper, and visually communicates the disabled state via wrapper styling (`opacity`/`cursor-not-allowed`/`bg-muted`) — parity with Input's disabled wrapper. | Behavioral test + axe. |
| **AC-8** | `className` is applied to the wrapper (semantic alias for outer styling); `textareaClassName` opt-in applies to the inner `<textarea>` (advanced case). Both forms compose with the CVA classes (no override silently). | Behavioral test. |

### Behavioral tests

| AC | Description | Verification |
|----|-------------|--------------|
| **AC-9** | `ui_kit/components/textarea/Textarea.test.tsx` contains **≥ 20 behavioral tests** OR `npm run test:coverage` reports ≥ 80% coverage on `textarea/index.tsx`. Uses `getByRole("textbox")`, `getByLabelText`, `getByPlaceholderText` per `lex-frontend-testing`. No `getByTestId`. No `vi.mock` of Textarea's own collaborators. | `grep -c '^\s*it(' Textarea.test.tsx` ≥ 20, `npm run test -- textarea` green. |
| **AC-10** | Tests cover: text typing, controlled vs uncontrolled `value`/`defaultValue`, `placeholder`, `disabled`, `readOnly`, `required`, `maxLength`, `minLength`, `rows`, `cols`, `name`, `autoComplete`, `onChange`/`onFocus`/`onBlur`/`onKeyDown`, `ref` forwarding to the `<textarea>`, FormData integration. | Each scenario annotated `AC-10 (<scenario>)`. |

### Accessibility (jest-axe matrix, light + dark)

| AC | Description | Verification |
|----|-------------|--------------|
| **AC-11** | `Textarea.test.tsx` runs `axeInThemes()` (light + dark via `data-theme` on `<html>`) on **at least**: (i) default empty with label, (ii) default filled, (iii) state="error" + `aria-invalid` + described error message, (iv) state="success", (v) `disabled`, (vi) `readOnly`, (vii) `showCount` + `maxLength` with content. Each surface assertion `toHaveNoViolations()` for both themes. | Each surface annotated `AC-11 (<scenario>)`. |

### Storybook

| AC | Description | Verification |
|----|-------------|--------------|
| **AC-12** | `Textarea.stories.tsx` exposes Default + main variants (`Sizes`, `States`, `WithCounter`, `Disabled`, `AutoSize`, `ResizeOptions`, `InsideForm`) rendering correctly in light AND dark via the Storybook toolbar (cross-iframe pattern from PR #119). Each `<textarea>` carries an accessible name (`aria-label` or wrapping `<label htmlFor>`) — mitigates Plan #208 trap. | `npm run build-storybook` green; manual review on toolbar toggle. |
| **AC-13** | `Textarea.stories.tsx` includes a `DarkTheme` story matrix (`globals.theme: "dark"`, `parameters.backgrounds.default: "dark"`, `docs.description.story` justifying contrast preservation under `data-theme="dark"`) exercising sizes + states + counter + autoSize + disabled. 0 axe violations on dark surface. | Story file exports `DarkTheme`; visual review. |

### Astro docs page

| AC | Description | Verification |
|----|-------------|--------------|
| **AC-14** | `docs/src/pages/componentes/textarea.astro` is created mirroring the Radio/Input pattern: kicker COMPONENTES · FORMS, title Textarea, sourcePath `ui_kit/components/textarea`, storybookId `components-textarea--default`, sections Padrão / Tamanhos / Estados / Contador / AutoSize / Resize / Em formulário / Playground / Props / Código-fonte / Acessibilidade. | `npm run docs:build` green; page renders. |
| **AC-15** | `docs/src/previews/textarea.tsx` exports `BasicRow`, `SizesRow`, `StatesRow`, `CounterRow`, `AutoSizeRow`, `ResizeRow`, `DisabledRow`, `FormSubmitRow`. `docs/src/previews/textarea-live.tsx` exports `LiveTextareaSnippet` (react-live + CodeEditor pair). | Page imports all named exports; build green. |

### MIGRATED Set + barrel

| AC | Description | Verification |
|----|-------------|--------------|
| **AC-16** | `Textarea` added to the `MIGRATED` Set in `docs/src/pages/index.astro` (alphabetical insertion between `Spinner` and the next entry). The sidebar now links to `/componentes/textarea/`. | `grep -n '"Textarea"' docs/src/pages/index.astro` returns the insertion. |
| **AC-17** | `ui_kit/components/index.ts` line 45 (`export * from "./textarea";`) already exists — no change. The new `Textarea` API is exported via the barrel automatically. | `grep -n "textarea" ui_kit/components/index.ts` returns line 45. |

### Build gates (cross-cutting DoD lines, validated at Gate 2)

- `npm run typecheck` — green.
- `npm run lint` — green.
- `npm run test` — green (textarea suite + full suite).
- `npm run build` — green (rslib).
- `npm run docs:build` — green (Astro).

### Brand × Notion check

| AC | Description | Verification |
|----|-------------|--------------|
| **AC-18** | Brand (colors, typography, focus ring) verified against the canonical Notion source (`Branding` page). The Textarea reuses the same semantic tokens already aligned by #226 (`border-primary`, `border-destructive`, `border-signal-green`, `focus-within:ring-ring`, `bg-background`, `text-fg`, `placeholder:text-fg-muted/70`). Surface only NEW divergence (if any) in `03-architecture.md`. None anticipated. | Result recorded in `03-architecture.md`. |

### Playground side-by-side approval

| AC | Description | Verification |
|----|-------------|--------------|
| **AC-19** | Side-by-side comparison with the canonical reference in `ux_references/ui_kits/components/Textarea/` (playground + index.tsx + index.css) registered in the PR; Fernando's explicit "está bom" recorded as a PR comment before the Plan transitions out of `to review`. | PR comment captured. |

### PR closure

| AC | Description | Verification |
|----|-------------|--------------|
| **AC-20** | Final PR body includes `Closes #55` (auto-closes the Plan on merge) AND `Refs #54` (parent remains open until the broader v0.1.0 catalog completes, unless Fernando wants the parent closed too — in which case promote to `Closes #54`). PR title `feat(textarea): migrate to v0.1.0 DoD — sizes, states, counter, autoSize`. Conventional Commits in English per `lex-commit-language` and `lex-conventional-commits`. PR labels mirror Plan #55 (`evolvability ♻️`) + add `size/*` per `lex-pr-quality`. | `gh pr view --json title,body,labels` after creation. |

## Definition of Out-of-Scope

- Token additions beyond what Textarea strictly needs (none anticipated — reuses existing tokens).
- Slot family (`leftIcon`/`rightIcon`/`prefix`/`suffix`) — explicitly dropped vs Input; documented in `03-architecture.md`.
- Composer integrations (`FormLayout.Field` wiring beyond what already flows through `aria-describedby` and `invalid` chaining).
- Release / tag / changelog — owned by `warrior-janus`.
- Visual baselines regeneration — only if `regenerate-baselines` label is added to the PR.
- Anything outside the declared scope table in `03-architecture.md`.

## Traceability promise

In Phase 4, each new test MUST be annotated `AC-N` (in test name or inline `// AC-N` comment). Gate 2 rejects the PR if any AC has zero tests linked, or if new tests exist without an AC link (scope-creep guard per `lex-issue-driven` Rule 3 + Rule 6).
