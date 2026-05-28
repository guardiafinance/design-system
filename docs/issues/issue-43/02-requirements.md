# Phase 2 — Requirements

## Numbered Acceptance Criteria

Direct mapping of the Plan #43 DoD checklist into testable ACs.

- **AC-1** — `npm run dev:all` starts Storybook + Astro docs and `/componentes/file-upload` renders without errors (playground precondition).
- **AC-2** — `FileUpload.stories.tsx` contains a `DarkTheme` story that renders the matrix of critical visual states (dropzone Default, dropzone with files queued, dropzone with uploading + progressbar, dropzone with error file, dropzone Disabled, Button variant in its 3 sizes) over the dark background, with `globals.theme = "dark"` and `parameters.backgrounds.default = "dark"` — following the pattern established by Combobox / DatePicker / Button.
- **AC-3** — Astro playground at `/componentes/file-upload` already mirrors the existing stories side-by-side via the cross-iframe theme toggle (PR #119). No content delta required in this Plan; visual review is the act of approval.
- **AC-4** — `file-upload.test.tsx` keeps the existing **63 behavioral tests** (≥ 20 threshold, ≥ 80% coverage), all using accessible queries (`getByRole`, `getByLabelText`) and not mocking internal collaborators. The Plan body explicitly enumerates DoD coverage that must hold; each item is verified against the current suite:
  - file input via click trigger → covered by `variant=button` "clique no botão abre o file picker" + `controlled` "onFiles é chamado com files aceitos via input".
  - drag-and-drop (dragenter/dragover/drop events) → covered by "dropzone aplica classe de drag" + "drop aplica validação" + "rejeita por accept via drop" + "disabled bloqueia drop".
  - multiple files vs single → covered by `variant=button` "label default vira plural quando multiple=true" + auto-upload "uploader é chamado para cada arquivo aceito".
  - file type filtering (`accept`) → covered by `isAccepted` suite (6 tests) + "rejeita por accept" + "input recebe accept e multiple".
  - file size validation (max size error display) → covered by "rejeita por maxSize" + "hint automático via maxSize" + "status error mostra mensagem".
  - progress state (uploading / uploaded / failed) → covered by "status uploading mostra progressbar com aria" + auto-upload progression suite.
  - remove file action → covered by "onRemove + files renderiza X" + "remover após upload bem-sucedido: aria-label é 'Remover'".
  - controlled vs uncontrolled → covered by the `controlled` and `auto-upload` describe blocks (two distinct modes exercised).
  - `aria-label` on the drop zone → the dropzone is a native `<label>` wrapping the file input; the input itself carries `aria-label` ("Selecionar arquivo(s)"), verified by `axeInThemes` (no a11y violations in 6 states).
  - **NEW: keyboard accessibility (Enter/Space triggers file picker)** → add an explicit behavioral test pinning the native input's keyboard contract, complementing the existing `axe` coverage.
- **AC-5** — `file-upload.test.tsx` keeps the 6 existing a11y tests via `axeInThemes()` (light + dark): empty Default (dropzone variant) + empty Default (button variant) + file list `done` + file list `uploading` (with progressbar) + file list `error` + Disabled dropzone. No regression.
- **AC-6** — Brand × Notion check via `mcp__claude_ai_Notion__notion-search`: confirm no NEW divergence. Surface only divergences not already routed to Plan #208 (primary token mapping) or Plan #128 (`text-fg-muted` placeholder).
- **AC-7** — Document any visual or functional gap surfaced during the review pass (the audit lives in `04-implementation-notes.md`, even if empty).
- **AC-8** — CI pipeline green locally: `npm run typecheck && npm run lint && npm run test && npm run build && npm run docs:build` all pass.
- **AC-9** — PR `Closes #43` opens with the body referencing this Plan, all artifacts under `docs/issues/issue-43/`, and the `regenerate-baselines` label only if the visual story matrix triggers baseline updates.
- **AC-10** — Fernando's "está bom" captured on the PR or issue triggers the merge.

## Definition of Done

All AC-1..AC-9 satisfied locally. AC-10 is the human gate after the PR opens.

## Out of scope

- Implementation changes to `index.tsx` — none planned. FileUpload is feature-complete for v0.1.0.
- `--primary` brand token remapping (routed to Plan #208).
- `--fg-muted` placeholder contrast fix (routed to Plan #128).
- Astro playground content changes — already complete.
- Behavioral regressions in the existing 63 tests — none expected.

## Next phase

→ Phase 3 — architecture brief mapping the changes to files and components.
