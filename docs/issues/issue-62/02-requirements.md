# Phase 2 — Requirements: Migrate Drawer to v0.1.0 DoD

- **Parent Tech Task:** [#62](https://github.com/guardiatechnology/design-system/issues/62)
- **Plan sub-issue:** [#63](https://github.com/guardiatechnology/design-system/issues/63)
- **Brief:** [01-brief.md](01-brief.md)
- **Architecture (next):** [03-architecture.md](03-architecture.md)

## Definition of Done (mirrors Plan #63 body, 1-for-1)

Plan #63 declares 14 DoD bullets. Each AC below maps to one or more of them; the table at the end is the AC ↔ DoD matrix that Gate 2 will use as Check 1 (traceability).

## Acceptance Criteria

### Public API surface

- **AC-1:** `ui_kit/components/drawer/index.tsx` exports the canonical 10-export shadcn composition + 1 CVA accessor + 3 types: `Drawer`, `DrawerTrigger`, `DrawerPortal`, `DrawerOverlay`, `DrawerContent`, `DrawerHeader`, `DrawerFooter`, `DrawerTitle`, `DrawerDescription`, `DrawerClose`, `drawerContentVariants`, `DrawerContentProps`, `DrawerContentSide`, `DrawerContentSize`. No other names are part of the public surface; no default export.
- **AC-2:** `Drawer` is a thin re-export of `@radix-ui/react-dialog` `Root`, supporting controlled (`open` + `onOpenChange`) and uncontrolled (`defaultOpen`) operation. `modal` defaults to `true` (Drawer is modal by definition — focus-trap + scroll-lock).
- **AC-3:** `DrawerTrigger` re-exports `@radix-ui/react-dialog` `Trigger`. Supports `asChild` and `disabled` per Radix.
- **AC-4:** `DrawerContent` accepts a CVA `side` prop with rungs `top | right | bottom | left` (default `right`) AND a CVA `size` prop with rungs `sm | md | lg | xl` (default `md`), plus an additional `width` prop (number | string) that overrides the CVA size for **horizontal** sides (`left`/`right`) and a `height` prop (number | string) for **vertical** sides (`top`/`bottom`). When the side is `left`/`right`, the size rung drives `max-w-*`; when `top`/`bottom`, the size rung drives `max-h-*`. Size ladder (matches Dialog ADR-010 width budget exactly):
  - `sm = max-w-sm / max-h-sm` (24rem ≈ 384 px)
  - `md = max-w-lg / max-h-lg` (32rem ≈ 512 px, default)
  - `lg = max-w-2xl / max-h-2xl` (42rem ≈ 672 px)
  - `xl = max-w-4xl / max-h-4xl` (56rem ≈ 896 px)
- **AC-5:** `DrawerHeader`, `DrawerFooter`, `DrawerTitle`, `DrawerDescription`, `DrawerClose` ship with the canonical layout + tokens: `DrawerHeader` is `flex flex-col gap-1.5 px-6 pt-6 pb-2 text-left`; `DrawerFooter` is `mt-auto flex flex-col-reverse gap-2 px-6 pt-2 pb-6 sm:flex-row sm:justify-end`; `DrawerTitle` is `text-lg font-semibold leading-none tracking-tight text-fg`; `DrawerDescription` is `text-sm text-fg-muted`; `DrawerClose` is the canonical close button positioned `absolute right-4 top-4` with `lucide-react`'s `X` icon (16 px) and visually-hidden text "Close".
- **AC-6:** `drawerContentVariants` is exported as a CVA accessor — same recipe as `dialogContentVariants` (ADR-010) — so consumers writing higher-order drawers can compose variants without re-implementing.

### Token contract (semantic only — `lex-brand-colors`)

- **AC-7:** `DrawerOverlay` uses `fixed inset-0 z-50 bg-guardia-purple-900/60 dark:bg-guardia-gray-900/80 backdrop-blur-sm` — Notion-canonical brand-palette ramp tokens, theme-aware (Violet 900 `#1F092B` @ 60% light / Gray 900 `#17171B` @ 80% dark) — same overlay token migrated by Dialog ADR-010 Decision 4. The previous baseline's `bg-black/80` is RETIRED. No hex, no `oklch(`, no `bg-popover`, no `bg-drawer`.
- **AC-8:** `DrawerContent` consumes `bg-background text-fg shadow-lg` plus side-specific border tokens (`border-l border-border-strong` for `right`, `border-r border-border-strong` for `left`, `border-b border-border-strong` for `top`, `border-t border-border-strong` for `bottom`) and the data-state-driven slide animation utilities (`data-[state=open]:animate-in`, `data-[state=closed]:animate-out`, `slide-in-from-*`, `slide-out-to-*` matched to the chosen side).
- **AC-9:** No usage of `space-x-2` (Tailwind v3 legacy spacing utility); `DrawerFooter` uses `gap-2` instead (Tailwind v4 canonical). No usage of `bg-muted` or `bg-secondary` outside the semantic scale.
- **AC-10:** `DrawerClose` focus-visible ring uses `focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none` (semantic ring tokens, no hex). Hover state uses `hover:bg-bg-hover` (semantic).

### Behavioral + ARIA contract

- **AC-11:** Clicking the trigger opens the content; clicking the trigger again (or invoking `DrawerClose`) closes it. `aria-expanded` flips on the trigger; `data-state` on content reflects `open` / `closed`.
- **AC-12:** Pressing `Escape` while the drawer is open closes it AND returns focus to the trigger. Radix handles both via `Dialog.Root`'s built-in `onEscapeKeyDown` + focus-restore.
- **AC-13:** Clicking the overlay (outside the content) closes the drawer by default (`onPointerDownOutside` consumes `DrawerOverlay` click). Radix handles this; tests assert behavior.
- **AC-14:** When open, focus is trapped inside `DrawerContent` — Tab cycles through focusable descendants without escaping the content. Radix focus-trap handles; tests assert at least one cycle.
- **AC-15:** When open, the underlying document content receives `aria-hidden="true"` and scroll is locked on `<body>`. Radix handles both via `Dialog.Root`'s modal semantics; tests assert `<body>` style `pointer-events: none` (or equivalent Radix attribute) while open.
- **AC-16:** ARIA contract — `DrawerContent` has `role="dialog"`, `aria-modal="true"`, `aria-labelledby` pointing to the rendered `DrawerTitle` id, `aria-describedby` pointing to the rendered `DrawerDescription` id (when present). Radix wires these automatically when `DrawerTitle` / `DrawerDescription` are mounted; tests assert presence.
- **AC-17:** `DrawerClose` is keyboard-activatable via `Enter` and `Space`, has `aria-label="Close"` via visually-hidden span, and is positioned to be the FIRST focusable element when the drawer opens (consistent with Radix default behavior + accessibility guidance for screen-reader users).
- **AC-18:** Controlled-uncontrolled parity — both `<Drawer open={...} onOpenChange={...}>` and `<Drawer defaultOpen>` render correctly; tests cover both paths.

### Side × Size matrix

- **AC-19:** Each `side` rung positions the content correctly: `right` → `inset-y-0 right-0 h-full`; `left` → `inset-y-0 left-0 h-full`; `top` → `inset-x-0 top-0 w-full`; `bottom` → `inset-x-0 bottom-0 w-full`. Tests assert one canonical class per side.
- **AC-20:** Each `size` rung applies the right dimension class given the side: for `left`/`right`, `max-w-{sm|lg|2xl|4xl}`; for `top`/`bottom`, `max-h-{sm|lg|2xl|4xl}`. The CVA accessor `drawerContentVariants` exposes the compound variants. Tests cover the full 4×4 matrix shape (16 combinations) via parameterized cases.
- **AC-21:** Slide animations match the side: `right` slides from right, `left` slides from left, `top` slides from top, `bottom` slides from bottom — each tied to `data-[state=open]:slide-in-from-*` + `data-[state=closed]:slide-out-to-*` Tailwind utilities. Tests assert the canonical animation classnames per side.

### Accessibility (`jest-axe`, light + dark — Fernando feedback_a11y_unit_test_ac.md)

- **AC-22:** `Drawer.test.tsx` runs `axeInThemes(container)` from `ui_kit/test-utils/a11y.ts` on the `Default` open state (trigger + content mounted, content open, default `side="right"`) — light AND dark themes, both must pass `toHaveNoViolations()`. Because `role="dialog"` is a LANDMARK, the `region` axe rule is NOT disabled.
- **AC-23:** `axeInThemes` is also run on each of the 4 `side` variants (`top`, `right`, `bottom`, `left`) — light AND dark — to catch any side-specific contrast or layout violations.
- **AC-24:** `axeInThemes` is run on the `Closed` state (just the trigger rendered, content not in DOM) — light AND dark — to catch any trigger-button violations.

### Tests (behavioral, `lex-frontend-testing`)

- **AC-25:** `Drawer.test.tsx` exists, ships ≥ 25 behavioral tests OR ≥ 80% file coverage. Tests use accessible queries (`getByRole`, `getByLabelText`, `findByRole("dialog")`); `getByTestId` is forbidden unless documented. No internal collaborators are mocked.
- **AC-26:** Each `it(...)` carries `AC-N:` in the title (RFC trace per `lex-issue-driven` Rule 3) so Gate 2 Check 1 (AC ↔ test) can pass.
- **AC-27:** Tests assert the **CVA `width` / `height` override** — when `width` is present and side is `left`/`right`, `style.maxWidth` overrides the CVA size's `max-w-*`; when `height` is present and side is `top`/`bottom`, `style.maxHeight` overrides the CVA size's `max-h-*`. Numbers convert to `px`; strings pass-through.

### Stories (Storybook, light + dark)

- **AC-28:** `Drawer.stories.tsx` covers: `Default`, `Sides` (`top`, `right`, `bottom`, `left` shown side-by-side in triggers), `Sizes` (`sm`/`md`/`lg`/`xl` shown in triggers), `WithTitleAndDescription`, `WithFooter` (Cancel + Confirm), `Destructive` (variant `destructive` Button inside the footer — internal component variant, NOT external `<span text-destructive>` wrapper per `feedback_story_no_external_destructive_helper`), `LongContent` (vertical scroll inside `DrawerContent`), `Controlled` (uses local `useState`), `WidthOverride` (the `width` escape-hatch on a right-side drawer).
- **AC-29:** Each story renders correctly in both light and dark Storybook themes (Storybook's theme toggle is paired with `data-theme` on `<html>`).

### Astro documentation page + previews

- **AC-30:** `docs/src/pages/componentes/drawer.astro` exists with the canonical 7-section layout (mirrors `popover.astro` / `tooltip.astro` / `dialog.astro`): Padrão, Lados, Tamanhos, Estados, Casos de uso, Playground, Props, Acessibilidade. Sets `kicker="COMPONENTES · OVERLAYS"`, `group="Overlays"`, `storybookId="components-drawer--default"`, `sourcePath="ui_kit/components/drawer"`.
- **AC-31:** `docs/src/previews/drawer.tsx` exports the row components consumed by the Astro page: `BasicRow`, `SidesRow`, `SizesRow`, `StatesRow`, `UseCasesRow` (filters drawer, secondary form, info panel — mirrors the legacy playground). `docs/src/previews/drawer-live.tsx` exports `LiveDrawerSnippet` for the playground section (uses `react-live` + `CodeEditor`, pattern identical to `dialog-live.tsx`).

### Barrel + MIGRATED Set + Sheet retirement

- **AC-32:** `ui_kit/components/index.ts` exports `./drawer`. The previous `export * from "./sheet"` line is REMOVED (Sheet is retired as part of the Drawer + Sheet consolidation per ADR-012 Decision 1).
- **AC-33:** The `ui_kit/components/sheet/` directory is deleted (no consumers; consolidation under Drawer).
- **AC-34:** `Drawer` stays in the `MIGRATED` Set at `docs/src/pages/index.astro` (was already listed). Verify the entry is alphabetically positioned and that NO `__pending__` stub renders for Drawer after the docs:build.

### Dependency hygiene

- **AC-35:** `vaul` is removed from `package.json` dependencies (the current Drawer was the sole consumer; the migration base switches to `@radix-ui/react-dialog`, which is already a transitive dep used by Dialog/Sheet/AlertDialog).

### Process

- **AC-36:** Single atomic signed commit with subject `feat(drawer): migrate to v0.1.0 DoD — consolidate Sheet, switch to Radix Dialog, Notion-canonical overlay token` per `lex-small-commits` + `lex-conventional-commits` + `lex-signed-commits`. ADR-012 ships in the SAME commit with `status: accepted` inline (no `proposed → accepted` two-commit pattern; precedent: ADR-007, ADR-010, ADR-011, ADR-013).
- **AC-37:** Full pipeline green on the worktree before commit — `npm run typecheck && npm run lint && npm run test && npm run build && npm run docs:build` exit 0.
- **AC-38:** Visual baselines policy — author does NOT apply the `regenerate-baselines` label to the PR. Fernando reviews the `pending-baselines` artifact + PR comment from CI's `validate-mode` runner (per the new warn-not-fail logic merged in PR #243) and applies the label manually after "está bom". The author's PR body documents this expectation.
- **AC-39:** PR body closes both `#62` (parent) and `#63` (plan) with `Closes #62` and `Closes #63` on separate lines; mirrors all labels from the parent issue (`evolvability ♻️`) plus the auto-applied size label.

## DoD ↔ AC Matrix

| Plan #63 DoD bullet                                                    | Covered by                                              |
|------------------------------------------------------------------------|---------------------------------------------------------|
| Criar branch + worktree                                                | (Phase 0 — completed before Phase 1)                    |
| Ler referência legada                                                  | (Phase 1 brief + Phase 3 architecture analysis)         |
| `ui_kit/components/drawer/index.tsx` com variantes CVA + Radix         | AC-1, AC-2, AC-3, AC-4, AC-5, AC-6, AC-19, AC-20, AC-21 |
| Behavioral tests ≥ 20 OR ≥ 80% cov, queries acessíveis, sem mock interno | AC-25, AC-26, AC-27, AC-11..AC-18                       |
| A11y jest-axe light + dark Default + open + each side                  | AC-22, AC-23, AC-24                                     |
| Storybook Default + variantes light + dark                             | AC-28, AC-29                                            |
| `docs/src/pages/componentes/drawer.astro` + previews                   | AC-30, AC-31                                            |
| Export em `ui_kit/components/index.ts`                                 | AC-32                                                   |
| `Drawer` no Set `MIGRATED`                                             | AC-34                                                   |
| Apenas tokens semânticos                                               | AC-7, AC-8, AC-9, AC-10                                 |
| Pipeline verde (typecheck + lint + test + build + docs:build)          | AC-37                                                   |
| Playground vs legacy registrado; "está bom" explícito                  | AC-38 (Fernando review post-PR)                         |
| Brand consistente (Notion como SoT)                                    | AC-7..AC-10 + Fernando review                           |
| Commit atômico único `feat(drawer): migrate to v0.1.0 DoD — ...`       | AC-36                                                   |
| PR fecha o Plan #63 via `Closes #63`                                   | AC-39                                                   |
| **Sheet consolidation** (Issue body: "consolida o baseline Sheet")     | AC-32, AC-33 (NEW — beyond DoD; absorbed via ADR-012)   |
| **Dependency hygiene** (remove `vaul`)                                 | AC-35 (NEW — direct consequence of base switch)         |

All 13 Plan DoD bullets are covered by ACs above; additionally, 3 extra ACs (AC-32, AC-33, AC-35) cover the consolidation + dependency hygiene that the Issue body directs but Plan #63 implicitly assumes. Gate 1 will reuse this matrix.

## Out of scope (locked)

- `AlertDialog` migration (separate component, separate Issue when needed; flagged in tangential findings).
- Token additions beyond Drawer's strict needs.
- Backport of Sheet usage in product code (no consumers exist — verified via repo grep).
- Drag-to-dismiss bottom-sheet UX (`vaul`'s value-add; mobile-specific UX not required for v0.1.0).
- Touching files outside `ui_kit/components/drawer/`, `ui_kit/components/sheet/` (delete), `docs/src/pages/componentes/drawer.astro`, `docs/src/previews/drawer*.tsx`, `docs/src/pages/index.astro` (no-op verify — already in MIGRATED), `docs/adr/ADR-012-*`, `docs/issues/issue-62/**`, `ui_kit/components/index.ts` (barrel update), `package.json` (vaul removal), `package-lock.json` (vaul removal).

## Next phase

Phase 3 — Architecture (`03-architecture.md`): components touched, file-by-file deliverable, ADR-012 decision (consolidation + base switch + side × size matrix + overlay token) drafted inline as the Phase 3 record.
