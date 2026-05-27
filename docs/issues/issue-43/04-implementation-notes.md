# Phase 4 — Implementation Notes

## Changes applied

### `ui_kit/components/file-upload/FileUpload.stories.tsx`

- **+1 story**: `DarkTheme` — visual matrix on dark background covering: empty dropzone, dropzone with mixed-status file list (`done` + `uploading` + `error`), Disabled dropzone, Button variant in `sm` / `md` / `lg`. Pattern mirrors Combobox (#219), DatePicker (#218), Button (#209), IconButton (#205), ButtonGroup (#206), Avatar (#119).
- `globals: { theme: "dark" }` + `parameters.backgrounds.default = "dark"` + `decorators: undefined` (escape the meta's `w-[480px]` wrapper for the matrix).

### `ui_kit/components/file-upload/file-upload.test.tsx`

- **+1 describe block**: `FileUpload — keyboard accessibility` (6 tests) — pins the keyboard contract demanded by Plan #43 DoD #4:
  - `variant=button: Enter no botão focado dispara o file picker`
  - `variant=button: Space no botão focado dispara o file picker`
  - `variant=dropzone: input file é alcançável via accessible name`
  - `variant=dropzone (multiple): accessible name vira plural`
  - `variant=button: input file é alcançável via accessible name`
  - `remove button responde a Enter quando focado`
- **+1 describe block**: `FileUpload — XSS safety (filename render)` (2 tests) — pins JSX text interpolation as the only renderer for user-supplied filenames and error messages (`lex-frontend-security` Rule 1):
  - `nome de arquivo com payload HTML é renderizado como texto, não como HTML`
  - `mensagem de erro com payload HTML é renderizada como texto`

### `docs/issues/issue-43/*`

- `01-brief.md`, `02-requirements.md`, `03-architecture.md`, `04-implementation-notes.md`, `05-security-review.md`, `06-quality-report.md` — canonical phase trail per `lex-issue-driven` Rule 5.

## Files NOT changed

- `ui_kit/components/file-upload/index.tsx` — feature-complete; zero production-code delta.
- `docs/src/pages/componentes/file-upload.astro` — playground already complete (AC-3 is a review act, not modification).
- `docs/src/previews/file-upload-live.tsx` — out of scope.
- Any shared util (`cn`, tokens, theme decorator) — untouched.

## Test count summary

| Metric | Before | After |
|--------|--------|-------|
| `it(...)` blocks in `file-upload.test.tsx` | 63 | 71 |
| jest-axe tests (light + dark via `axeInThemes`) | 6 | 6 |
| `describe` blocks | 7 | 9 |
| Local run | — | `71 passed (71)` in `998ms` |

Full repo suite: `702 passed (702)` in `12.33s`.

## Gap audit (AC-7)

No NEW visual or functional gap surfaced during the review pass. Two routed-elsewhere divergences remain:

- `--primary` token mapping → Plan #208 (NOT touched here).
- `--fg-muted` placeholder sub-AA → Plan #128 (the Storybook `parameters.a11y.config` already disables `color-contrast` with a WHY comment).

## Brand check (AC-6, via Notion MCP)

- Queried Notion via `mcp__claude_ai_Notion__notion-search` for "FileUpload design specification" and "Branding Guardia design system upload component".
- No FileUpload-specific spec page exists on Notion beyond the general Branding source-of-truth. The dropzone + button visuals use `bg-action` / `text-action` / `text-button-fg` / `border-action`, which derive from the brand-aware token layer migrated in PR #157 (Tech Task #125).
- **No NEW divergence detected.** The only known divergences are already routed to Plans #208 and #128.

## Next phase

→ Phase 5 — security review.
