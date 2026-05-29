# Issue Brief — #62 feat(drawer): migrate Drawer to v0.1.0 DoD

- **Repository:** `guardiatechnology/design-system`
- **Type:** Tech Task (`evolvability ♻️`)
- **Parent Epic:** [#13](https://github.com/guardiatechnology/design-system/issues/13)
- **Plan:** [#63](https://github.com/guardiatechnology/design-system/issues/63)
- **Author/Assignee:** @fernandoseguim
- **Branch:** `feat/62-drawer`
- **Worktree:** `.worktrees/62-drawer/`
- **Category:** Overlays
- **Read at:** 2026-05-29

## Why

`Drawer` is in the canonical 52-component catalog of `@guardia/design-system` v0.1.0, in the **Overlays** category. The current baseline ships under DoD: it uses `vaul` (a bottom-sheet library) hardcoded to slide from the bottom with a drag handle — a semantic that **diverges from both the legacy reference** (which defines Drawer as a `right | left` side panel with `sm | md | lg` size) **and from the parent Issue body**, which states *"Side panel (left/right/top/bottom); consolida o baseline Sheet existente"*.

A separate `Sheet` baseline already exists in the codebase using `@radix-ui/react-dialog` with `top | right | bottom | left` side variants. It has no Astro documentation page, no test suite, no external consumers — it is effectively an unstyled, undocumented utility.

Without this migration:
1. The v0.1.0 catalog stays incomplete in the **Overlays** category (#62 blocks the Epic #13 DoD).
2. The codebase keeps **two semantically overlapping primitives** (vaul-Drawer + Radix-Sheet), violating `lex-design-system-library` ("Reimplementing primitives is FORBIDDEN").
3. The existing `Drawer` keeps shipping `bg-black/80` (Tailwind expands `black` to `#000`, which is not in the Guardia 5×5 palette — explicit `lex-brand-colors` violation), continuing the legacy hex-equivalent overlay token retired by ADR-010 in Dialog #257.

## What

Lead `Drawer` to v0.1.0 DoD as a **first-class** consolidated component of `@guardia/design-system`, **absorbing the Sheet semantics** (`side: top | right | bottom | left`) under the canonical `Drawer` name, mirroring the consolidation precedent established by ADR-006 (Menu absorbing DropdownMenu + ContextMenu).

### Resolution decided in Phase 3 (ADR-012): Drawer + Sheet consolidation

The parent Issue body explicitly directs the migration to **consolidate the existing Sheet baseline** under the canonical Drawer. Combined with:

- No external consumers of `Sheet` or current `Drawer` (verified via repo grep: only barrel re-export sites)
- Legacy reference visual intent = side panel (matches Sheet's Radix Dialog model, not vaul's bottom-sheet)
- ADR-006 precedent: Menu consolidated three semantically-overlapping primitives into one with `side` variant
- Radix Dialog is the proper base for a modal side panel — `vaul`'s value-add (drag-to-dismiss bottom-sheet) is mobile-specific UX that the v0.1.0 product surface does not need

→ Phase 3 ADR-012 will record: **(a) the consolidation decision, (b) the `vaul` → `@radix-ui/react-dialog` base switch, (c) Sheet's barrel retirement, (d) the new `side` × `size` CVA matrix, (e) the overlay-token migration from `bg-black/80` to the Notion-canonical `bg-guardia-purple-900/60 dark:bg-guardia-gray-900/80 backdrop-blur-sm`** (Dialog ADR-010 precedent).

### In scope

- `ui_kit/components/drawer/index.tsx` — full rewrite on `@radix-ui/react-dialog`, CVA `side` (`top | right | bottom | left`) × `size` (`sm | md | lg | xl`), Notion-canonical overlay token, canonical 10-export shadcn composition (`Drawer`, `DrawerTrigger`, `DrawerPortal`, `DrawerOverlay`, `DrawerContent`, `DrawerHeader`, `DrawerFooter`, `DrawerTitle`, `DrawerDescription`, `DrawerClose`).
- `ui_kit/components/drawer/Drawer.test.tsx` — ≥ 25 behavioral tests with `AC-N` traceability, including jest-axe in light + dark (Default, open state, each side variant), accessible queries.
- `ui_kit/components/drawer/Drawer.stories.tsx` — Default, Sides (left/right/top/bottom), Sizes (sm/md/lg/xl), WithTitleAndDescription, WithFooter, Destructive, LongContent, Controlled, WidthOverride, DarkTheme, WithLongContent rendering.
- `docs/src/pages/componentes/drawer.astro` — full structured page mirroring Dialog precedent.
- `docs/src/previews/drawer.tsx` + `docs/src/previews/drawer-live.tsx` — interactive previews.
- Barrel update in `ui_kit/components/index.ts`: `export * from "./drawer"`. The legacy `export * from "./sheet"` is **retired** (no consumers); the Sheet folder is **deleted** as part of the consolidation.
- `docs/src/pages/index.astro` MIGRATED Set entry: add `"Drawer"`.
- `docs/adr/ADR-012-drawer-v0.1.0-dod-migration.md` — `status: accepted` inline.
- Only semantic tokens (no hex / no `oklch(`).
- Playground side-by-side comparison with `ux_references/ui_kits/components/Drawer/` registered in the PR.
- `dependencies`: remove `vaul` from `package.json` (Drawer was the sole consumer).

### Out of scope (per Issue body + `lex-no-silent-tech-debt`)

- `AlertDialog` `bg-black/80` migration (flagged in Dialog ADR-010 tangential findings; remains tangential here too — surface for a separate Plan).
- Drag-to-dismiss bottom-sheet UX (the `vaul` value-add). Mobile-specific UX; not required by the v0.1.0 product surface; if needed later, register as a new Tech Task.
- New design tokens beyond what Drawer strictly needs.
- Sibling Overlays migrations (Toast #70 has its own Athena dispatch).

## Notion context

The migration honors the Notion-canonical Branding source of truth (per `lex-brand-colors`, `lex-brand-typography`, `lex-brand-logo`):

- **Cores:** [Notion > Branding > Cores](https://www.notion.so/34536f91ebd28142a3f1e0e58fd62c4b) — overlay token Violet 900 (`#1F092B`) @ 60% on light theme, Gray 900 (`#17171B`) @ 80% on dark theme; `backdrop-blur-sm` per Dark Mode modal scrim guideline.
- **Typografia:** Poppins (body/title) via design-system fonts (no Lastica in component text).
- **Logo:** not applicable inside a Drawer surface (no logo rendering in component).
- **Voz:** Drawer microcopy in stories follows brand voice — direct, strategic, no buzzwords ("Abrir drawer", "Cancelar", "Confirmar", "Salvar").

The Dark Mode modal scrim guideline from Notion ([Dark Mode subpage](https://www.notion.so/34536f91ebd28142a3f1e0e58fd62c4b)) is the **canonical reference for the overlay token migration** — same Notion-canonical resolution as Dialog ADR-010.

## Open unknowns

None. The architectural questions are resolved in Phase 3:

1. **Consolidate Drawer + Sheet?** → YES (ADR-012 Decision 1). Issue body directs consolidation; no external consumers; ADR-006 precedent.
2. **Base library?** → `@radix-ui/react-dialog` (ADR-012 Decision 2). Matches Dialog ADR-010 base; retires `vaul`.
3. **Side variants?** → `top | right | bottom | left` (ADR-012 Decision 3). Mirrors Sheet baseline; extends legacy reference's `right | left`.
4. **Size ladder?** → `sm | md | lg | xl` driving max-width on `left`/`right` and max-height on `top`/`bottom` (ADR-012 Decision 4). Mirrors Dialog `size` semantic, contextual to drawer geometry.
5. **Overlay token?** → Notion-canonical `bg-guardia-purple-900/60 dark:bg-guardia-gray-900/80 backdrop-blur-sm` (ADR-012 Decision 5). Reuses ADR-010 migration; retires `bg-black/80`.
6. **ADR status flow?** → `accepted` inline single-commit (ADR-012 Decision 6). Precedent: ADR-007 / ADR-010 / ADR-011 / ADR-013.
7. **Stacked PRs?** → Single PR (ADR-012 Decision 7). Same Decision Checklist outcome as Dialog #257.

## Tangential findings (per `lex-no-silent-tech-debt`)

Identified during Phase 1 analysis, OUTSIDE this PR's scope:

1. **`AlertDialog` still uses `bg-black/80`** (flagged in ADR-010 already). Drawer's migration sets the second precedent (after Dialog) for the cleanup. To be surfaced to @fernandoseguim post-PR — register as a new Plan sub-issue under a new parent Tech Task ("retire bg-black/80 from legacy Overlays") or fold into the next sibling Overlay migration.
2. **`vaul` was the sole consumer of the dependency** — removing Drawer's `vaul` import allows `vaul` removal from `package.json`. Done as part of this PR (not silent debt — it's a direct consequence of Decision 2 and lands in the same atomic commit).
3. **No Sheet documentation surface existed** (no Astro page, no test, no story). The retirement is a net documentation gain, not a regression. Recorded in ADR-012.

No `# TODO(#NNN)` markers will be added in code. No `## Out of scope (to revisit)` sections without trackable Issue will be added in documentation.

## References

- Parent Issue: [#62](https://github.com/guardiatechnology/design-system/issues/62)
- Plan: [#63](https://github.com/guardiatechnology/design-system/issues/63)
- Parent Epic: [#13](https://github.com/guardiatechnology/design-system/issues/13)
- Precedents:
  - ADR-005 (Popover v0.1.0 DoD) — PR [#237](https://github.com/guardiatechnology/design-system/pull/237) merged
  - ADR-006 (Menu consolidation) — PR [#239](https://github.com/guardiatechnology/design-system/pull/239) merged — direct consolidation precedent
  - ADR-007 (Tooltip v0.1.0 DoD) — PR [#240](https://github.com/guardiatechnology/design-system/pull/240) merged
  - ADR-010 (Dialog v0.1.0 DoD) — PR [#257](https://github.com/guardiatechnology/design-system/pull/257) merged — **most direct token + composition precedent**
  - ADR-011 (Alert v0.1.0 DoD) — merged
  - ADR-013 (ConfidenceIndicator v0.1.0 DoD) — merged
- Legacy reference: `ux_references/ui_kits/components/Drawer/` (`Drawer.playground.html` + `index.tsx` + `index.css`)
- Lexis:
  - `lex-brand-colors` — semantic palette + Notion canonical
  - `lex-design-system-library` — mandatory composition; reimplementation forbidden (consolidation rationale)
  - `lex-frontend-accessibility` — WCAG 2.1 AA (modal landmark, focus-trap)
  - `lex-frontend-testing` — behavioral tests + jest-axe
  - `lex-frontend-typing` — strict TS, no `any`
  - `lex-no-silent-tech-debt` — tangential findings surfaced, not silently shipped
- Codex:
  - `codex-issue-workflow` — 7-phase orchestration
  - `codex-design-system-components` — DoD canonical structure
- Fernando standing memory:
  - `feedback_a11y_unit_test_ac.md` — jest-axe light+dark on Default + open + each variant is an AC
  - `feedback_visual_regression_ubuntu_sot.md` — baselines are Ubuntu/CI source of truth; no auto-label
  - `feedback_terminology_unit_test.md` — "teste de unidade", not "teste unitário"
  - `feedback_story_no_external_destructive_helper.md` — Destructive story uses component-internal variant
