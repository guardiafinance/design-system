# Phase 3 — Architecture: Plan #45 (FormLayout v0.1.0 DoD review)

## Stack / Decomposition

Single-PR, test-and-story-only delta. No stacked-PRs decomposition (Decision Checklist of `codex-stacked-prs`: <3 high signals; the change is additive and lives in one component scope).

## Affected components

| Path | Change | Reason |
|---|---|---|
| `ui_kit/components/form-layout/FormLayout.stories.tsx` | **Add** `export const DarkTheme: Story` | AC-2 — light+dark Storybook coverage |
| `ui_kit/components/form-layout/form-layout.test.tsx` | **Extend** test file (add behavioral tests + jest-axe matrix) | AC-4 + AC-5 |
| `docs/issues/issue-45/*.md` | **Add** phase docs | `lex-issue-driven` Rule 5 |

No change to:

- `ui_kit/components/form-layout/index.tsx` (component implementation untouched — additive review)
- `docs/src/pages/componentes/form-layout.astro` (playground already exists)
- `docs/src/previews/form-layout*.tsx` (playground previews already exist)
- `__image_snapshots__/components/form-layout/` (no rendering change to existing stories)

## DarkTheme story design

Mirror the established peer pattern (e.g., `Checkbox.stories.tsx::DarkTheme`):

```tsx
export const DarkTheme: Story = {
  globals: { theme: "dark" },
  parameters: {
    backgrounds: { default: "dark" },
    docs: { description: { story: "Matriz variantes × densidades + estados (errors, disabled, fieldset+legend) sob `data-theme=\"dark\"`. Confirma que `text-fg`, `text-fg-muted`, `border-border`, `signal-red` (errors) e `bg-[color-mix(...)]` (sticky actions) preservam contraste sob fundo escuro." } },
  },
  render: () => (
    <div className="flex flex-col gap-10">
      {/* Stacked + comfy + Row 12-col + errors */}
      {/* Split + Section description */}
      {/* Inline + compact (settings) */}
      {/* fieldset/legend grouping + disabled cascade */}
    </div>
  ),
};
```

## Test extension plan

Add a new `describe("FormLayout — submission + integration")` block covering form submission + native attributes, a `describe("FormLayout.Field — required / fieldset semantics")` block, and a `describe("a11y (jest-axe — light + dark)")` block matching the peer pattern (Checkbox, DatePicker, Combobox). 

Target additions:

1. `<form noValidate>` pass-through
2. `<form onSubmit>` triggered by `<button type="submit">` inside
3. `aria-required="true"` exposed on required Field's child
4. Native `fieldset[disabled]` cascades — child input is `:disabled`
5. Composition with `<fieldset><legend>...</legend>...</fieldset>` renders accessible group (role=`group` with accessible name from legend)
6. axe matrix: 6 scenarios listed in AC-5

Expected delta: +~10 behavioral tests, +6 axe tests → final count ~44, well above the ≥20 / ≥80% threshold.

## Risks

- jest-axe + `axeInThemes` adds modest runtime (~6 scenarios × 2 themes = 12 axe runs in this file). Acceptable given peer pattern.
- `noUncheckedIndexedAccess` strict mode in tests already in use — no new types needed
- `color-contrast` rule disabled at the story level for the existing 5 stories — will keep the same posture on `DarkTheme` (the `text-fg-muted` token deferral remains under Plan #128). The jest-axe matrix in tests does NOT disable rules — it runs strict, exercising only token combinations that are AA-clean.

## Observability / Security

- N/A — no runtime surface (HTTP endpoint, event consumer, background job) added. `lex-observability-required` does not apply.
- `lex-frontend-security` — no `dangerouslySetInnerHTML`, no secrets, no new dynamic-data path. The compound only renders user-provided React children.

## Bidirectional traceability (AC ↔ test)

| AC | Test mapping |
|---|---|
| AC-2 | Storybook visual via `DarkTheme` story (rendered in Storybook + Chromatic-equivalent visual baseline if applicable) |
| AC-4 | `form-layout.test.tsx` — `AC-4 ...` docstrings on new behavioral tests |
| AC-5 | `form-layout.test.tsx` — `describe("a11y (jest-axe — light + dark)")` block |
| AC-6 | `docs/issues/issue-45/05-security-review.md` (Phase 5 — Notion fetch) |
| AC-7 | `docs/issues/issue-45/06-quality-report.md` (gap list, if any) |
| AC-8 | `docs/issues/issue-45/06-quality-report.md` (Gate 2 checks) |

No ADR required — no new technology choice, no deviation from existing pattern. The peer pattern (Checkbox/DatePicker/Combobox) is the architecture; this PR extends it consistently.
