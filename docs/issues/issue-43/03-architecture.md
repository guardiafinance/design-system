# Phase 3 — Architecture Brief

## Scope and delta

This is a **test-and-story-only** closeout PR following the v0.1.0 DoD playbook applied to Avatar (#119), IconButton (#205), ButtonGroup (#206), Button (#209), Checkbox (#217), DatePicker (#218), and Combobox (#219). No production code change in `index.tsx`.

## Affected components

| File | Change | Rationale |
|------|--------|-----------|
| `ui_kit/components/file-upload/FileUpload.stories.tsx` | + add `DarkTheme` story (visual matrix on dark background) | AC-2 — gap-closing parity with the 7 prior reviewed components. |
| `ui_kit/components/file-upload/file-upload.test.tsx` | + add 1 keyboard-accessibility behavioral test (Enter on the focused file input dispatches the native picker) and + 1 defensive XSS-safety test (filenames render as text, never HTML) | AC-4 explicit "keyboard accessibility (Enter/Space to trigger file input)" + `lex-frontend-security` defensive surface for user-supplied filenames. |
| `docs/issues/issue-43/01-brief.md` … `06-quality-report.md` | + Phase docs per `lex-issue-driven` Rule 5 | Canonical, committed phase trail. |

No changes to:
- `ui_kit/components/file-upload/index.tsx`
- `docs/src/pages/componentes/file-upload.astro` (already complete; AC-3 is approval, not modification)
- `docs/src/previews/file-upload-live.tsx`
- Any shared util (`cn`, tokens, theme decorator)

## Design decisions

### DD-1 — `DarkTheme` story shape

Mirror the Combobox / DatePicker model:

- `globals: { theme: "dark" }` + `parameters.backgrounds.default = "dark"` (toolbar + background sync).
- `decorators: undefined` — the meta wraps every story in a `w-[480px]` container; for the matrix we want the natural vertical stack so it reads cleanly side-by-side in the playground.
- `render: () => <div className="flex flex-col gap-4">…</div>` covering: empty dropzone (Default), dropzone with `files` populated through the 3 statuses (done + uploading + error), Disabled dropzone, Button variant in `sm`/`md`/`lg`. This is the matrix that any future Brand reviewer needs to see at a glance.
- Keep the same `a11y.config` rule disable (`color-contrast`) the meta already declares — same WHY (Plan #128 `--fg-muted`, Plan #208 `--primary`).

### DD-2 — Keyboard accessibility test wording

The native file `<input type="file">` handles Enter/Space as a no-op opening the OS file picker — there is no observable side effect in jsdom (the picker does not open in test). The test pins what we *can* assert: the dropzone is a `<label htmlFor={inputId}>`, the input is `tabIndex={-1}` and `sr-only` (focusable via the label click), and `getByLabelText("Selecionar arquivo")` returns the input — confirming the accessible name path. For the Button variant, simulating `userEvent.keyboard("[Enter]")` on the focused button calls `.click()` on the input (already covered by the existing "clique no botão abre o file picker" test, but the keyboard path is more explicit).

### DD-3 — Filename XSS-safety test

`File.name` comes from user input. React JSX text interpolation is XSS-safe by default (auto-escape), but pinning this as a behavioral assertion is cheap insurance against a future refactor accidentally introducing `dangerouslySetInnerHTML`. The test renders a controlled file with `name: "<img src=x onerror='alert(1)'>.pdf"` and asserts (a) the text content matches the raw string, (b) no `<img>` element exists in the rendered list.

## Stacked PR decomposition

**Not applicable.** The Decision Checklist from `codex-stacked-prs` returns 0 high signals (single component, test+story delta, single bounded context, no migration phases). One atomic PR per `lex-agent-planning` ("um Plan = um PR").

## Risks and mitigations

- **R1:** New `DarkTheme` story may trigger new visual baselines in CI. **Mitigation:** apply `regenerate-baselines` label to the PR when first run flags a diff; baselines are Ubuntu-rendered per the auto-memory note.
- **R2:** None of the existing 63 tests should regress. **Mitigation:** keep `index.tsx` untouched; run full suite locally before push.

## ADRs

None. No architectural decision crossed the threshold (`lex-issue-driven` Rule 4): no new tech, no deviation from existing pattern, no trade-off with alternatives, no multi-component impact. The closeout follows the exact pattern of the 7 prior PRs in this cohort.

## Next phase

→ Gate 1 — auto-acknowledged per the brief's "auto-ack" clause (test/story-only delta, no structural surprise, no new Brand divergence). Proceed to Phase 4.
