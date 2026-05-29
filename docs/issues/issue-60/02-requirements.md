# Phase 2 — Requirements: Migrate Dialog to v0.1.0 DoD

- **Parent Tech Task:** [#60](https://github.com/guardiatechnology/design-system/issues/60)
- **Plan sub-issue:** [#61](https://github.com/guardiatechnology/design-system/issues/61)
- **Brief:** [01-brief.md](01-brief.md)
- **Architecture (next):** [03-architecture.md](03-architecture.md)

## Definition of Done (mirrors Plan #61 body, 1-for-1)

Plan #61 declares 13 DoD bullets. Each AC below maps to one or more of them; the table at the end is the AC ↔ DoD matrix that Gate 2 will use as Check 1 (traceability).

## Acceptance Criteria

### Public API surface

- **AC-1:** `ui_kit/components/dialog/index.tsx` exports the canonical 10-export shadcn composition + 1 CVA accessor + 2 types: `Dialog`, `DialogTrigger`, `DialogPortal`, `DialogOverlay`, `DialogContent`, `DialogHeader`, `DialogFooter`, `DialogTitle`, `DialogDescription`, `DialogClose`, `dialogContentVariants`, `DialogContentProps`, `DialogContentSize`. No other names are part of the public surface; no default export.
- **AC-2:** `Dialog` is a thin re-export of `@radix-ui/react-dialog` `Root`, supporting controlled (`open` + `onOpenChange`) and uncontrolled (`defaultOpen`) operation. `modal` defaults to `true` (Dialog is modal by definition).
- **AC-3:** `DialogTrigger` re-exports `@radix-ui/react-dialog` `Trigger`. Supports `asChild` and `disabled` per Radix.
- **AC-4:** `DialogContent` accepts a CVA `size` prop with rungs `sm | md | lg | xl` and an additional `width` prop (number | string) to override the variant. `size` default is `md`. Width ladder: `sm = max-w-sm (24rem ≈ 384px)`, `md = max-w-lg (32rem ≈ 512px, default)`, `lg = max-w-2xl (42rem ≈ 672px)`, `xl = max-w-4xl (56rem ≈ 896px)`.
- **AC-5:** `DialogHeader`, `DialogFooter`, `DialogTitle`, `DialogDescription`, `DialogClose` ship with the canonical layout + tokens: `DialogHeader` is `flex flex-col gap-1.5 text-left`, `DialogFooter` is `flex flex-col-reverse gap-2 sm:flex-row sm:justify-end`, `DialogTitle` is `text-lg font-semibold leading-none tracking-tight text-fg`, `DialogDescription` is `text-sm text-fg-muted`, `DialogClose` is the canonical close button positioned `absolute right-4 top-4` with `lucide-react`'s `X` icon (16px) and visually-hidden text "Close".
- **AC-6:** `dialogContentVariants` is exported as a CVA accessor — same recipe as `popoverContentVariants` / `tooltipContentVariants` — so consumers writing higher-order modals can compose variants without re-implementing.

### Token contract (semantic only — `lex-brand-colors`)

- **AC-7:** `DialogOverlay` uses `fixed inset-0 z-50 bg-fg/60 backdrop-blur-sm` — semantic tokens only. The previous baseline's `bg-black/80` is replaced; no hex, no `oklch(`, no `bg-popover`, no `bg-dialog`.
- **AC-8:** `DialogContent` consumes `bg-background text-fg border border-border-strong shadow-lg rounded-lg ring-1 ring-ring/5` plus the data-state-driven animation utilities (`data-[state=open]:animate-in`, `data-[state=closed]:animate-out`, `fade-in-0`, `fade-out-0`, `zoom-in-95`, `zoom-out-95`). All radii/shadows from the semantic scale.
- **AC-9:** No usage of `space-x-2` (Tailwind v3 legacy spacing utility); `DialogFooter` uses `gap-2` instead (Tailwind v4 canonical).
- **AC-10:** `DialogClose` focus-visible ring uses `focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none` (semantic ring tokens, no hex). Hover state uses `hover:bg-bg-hover` (semantic).

### Behavioral + ARIA contract

- **AC-11:** Clicking the trigger opens the content; clicking the trigger again (or invoking `DialogClose`) closes it. `aria-expanded` flips on the trigger; `data-state` on content reflects `open` / `closed`.
- **AC-12:** Pressing `Escape` while the dialog is open closes it AND returns focus to the trigger. Radix handles both via `Dialog.Root`'s built-in `onEscapeKeyDown` + focus-restore.
- **AC-13:** Clicking the overlay (outside the content) closes the dialog by default (`onPointerDownOutside` consumes `DialogOverlay` click). Radix handles this; tests assert behavior.
- **AC-14:** When open, focus is trapped inside `DialogContent` — Tab cycles through focusable descendants without escaping the content. Radix focus-trap handles; tests assert at least one cycle.
- **AC-15:** When open, the underlying document content receives `aria-hidden="true"` and scroll is locked on `<body>`. Radix handles both via `Dialog.Root`'s modal semantics; tests assert `<body>` style `overflow: hidden` (or equivalent Radix attribute) while open.
- **AC-16:** ARIA contract — `DialogContent` has `role="dialog"`, `aria-modal="true"`, `aria-labelledby` pointing to the rendered `DialogTitle` id, `aria-describedby` pointing to the rendered `DialogDescription` id (when present). Radix wires these automatically when `DialogTitle` / `DialogDescription` are mounted; tests assert presence.
- **AC-17:** `DialogClose` is keyboard-activatable via `Enter` and `Space`, has `aria-label="Close"` via visually-hidden span, and is positioned to be the FIRST focusable element when the dialog opens (consistent with Radix default behavior + accessibility guidance for screen-reader users).
- **AC-18:** Controlled-uncontrolled parity — both `<Dialog open={...} onOpenChange={...}>` and `<Dialog defaultOpen>` render correctly; tests cover both paths.

### Accessibility (`jest-axe`, light + dark — Fernando feedback_a11y_unit_test_ac.md)

- **AC-19:** `Dialog.test.tsx` runs `axeInThemes(container)` from `ui_kit/test-utils/a11y.ts` on the `Default` open state (trigger + content mounted, content open) — light AND dark themes, both must pass `toHaveNoViolations()`. Because `role="dialog"` is a LANDMARK, the `region` axe rule is NOT disabled.
- **AC-20:** `axeInThemes` is also run on the `Closed` state (just the trigger rendered, content not in DOM) — light AND dark — to catch any trigger-button violations.
- **AC-21:** `axeInThemes` is run on the `Disabled` trigger state (trigger has `disabled` prop) — light AND dark — to catch focusability/contrast regressions on disabled buttons inside the modal.

### Tests (behavioral, lex-frontend-testing)

- **AC-22:** `Dialog.test.tsx` exists, ships ≥ 20 behavioral tests OR ≥ 80% file coverage. Tests use accessible queries (`getByRole`, `getByLabelText`, `findByRole("dialog")`); `getByTestId` is forbidden unless documented. No internal collaborators are mocked.
- **AC-23:** Each `it(...)` carries `AC-N:` in the title (RFC trace per `lex-issue-driven` Rule 3) so Gate 2 Check 1 (AC ↔ test) can pass.
- **AC-24:** Tests assert the **CVA size matrix** — `sm`, `md`, `lg`, `xl` each apply their canonical `max-w-*` class to the content wrapper.
- **AC-25:** Tests assert the **`width` prop override** — when present (number or string), `style.width` overrides the CVA size's `max-w-*`.

### Stories (Storybook, light + dark)

- **AC-26:** `Dialog.stories.tsx` covers: `Default`, `Sizes` (sm/md/lg/xl in one stage), `WithTitleAndDescription`, `WithFooter` (Cancel + Confirm), `Destructive` (variant `destructive` Button inside the footer — internal component variant, NOT external `<span text-destructive>` wrapper per `feedback_story_no_external_destructive_helper`), `LongContent` (vertical scroll inside `DialogContent`), `Controlled` (uses local `useState`).
- **AC-27:** Each story renders correctly in both light and dark Storybook themes (Storybook's theme toggle is paired with `data-theme` on `<html>`).

### Astro documentation page + previews

- **AC-28:** `docs/src/pages/componentes/dialog.astro` exists with the canonical 7-section layout (mirrors `popover.astro` / `tooltip.astro`): Padrão, Tamanhos, Estados, Casos de uso, Playground, Props, Acessibilidade. Sets `kicker="COMPONENTES · OVERLAYS"`, `group="Overlays"`, `storybookId="components-dialog--default"`, `sourcePath="ui_kit/components/dialog"`.
- **AC-29:** `docs/src/previews/dialog.tsx` exports the row components consumed by the Astro page: `BasicRow`, `SizesRow`, `StatesRow`, `UseCasesRow` (destructive-confirm, form, info — mirrors the legacy playground). `docs/src/previews/dialog-live.tsx` exports `LiveDialogSnippet` for the playground section (uses `react-live` + `CodeEditor`, pattern identical to `popover-live.tsx`).

### Barrel + MIGRATED Set

- **AC-30:** `ui_kit/components/index.ts` already exports `./dialog` — NO change needed (verify line 17 stays intact); this AC is the audit step at Phase 6.
- **AC-31:** `Dialog` is added to the `MIGRATED` Set at `docs/src/pages/index.astro:678` (alphabetical position between `DatePicker` and `FileUpload`).

### Process

- **AC-32:** Single atomic signed commit with subject `feat(dialog): migrate to v0.1.0 DoD — ...` per `lex-small-commits` + `lex-conventional-commits` + `lex-signed-commits`. The ADR-010 file (if created — see Phase 3) ships in the SAME commit with `status: accepted`, inline (no two-commit pattern; no `proposed → accepted` flip at Phase 7).
- **AC-33:** Full pipeline green on the worktree before commit — `npm run typecheck && npm run lint && npm run test && npm run build && npm run docs:build` exit 0.
- **AC-34:** Visual baselines policy — author does NOT apply the `regenerate-baselines` label to the PR. Fernando reviews the `pending-baselines` artifact + PR comment from CI's `validate-mode` runner (per the new warn-not-fail logic merged in PR #243) and applies the label manually after "está bom". The author's PR body documents this expectation.
- **AC-35:** PR body closes both `#60` (parent) and `#61` (plan) with `Closes #60` and `Closes #61` on separate lines; mirrors all labels from the parent issue (`evolvability ♻️`) plus the auto-applied size label and Overlays-related ones if any.

## DoD ↔ AC Matrix

| Plan #61 DoD bullet                                                    | Covered by                            |
|------------------------------------------------------------------------|---------------------------------------|
| Criar branch + worktree                                                | (Phase 0 step — not an AC)            |
| Ler referência legada                                                  | (Phase 1 brief + Phase 3 architecture)|
| `ui_kit/components/dialog/index.tsx` com variantes CVA + Radix         | AC-1, AC-2, AC-3, AC-4, AC-5, AC-6    |
| Behavioral tests ≥ 20 OR ≥ 80% cov, queries acessíveis, sem mock interno | AC-22, AC-23, AC-24, AC-25, AC-11..AC-18 |
| A11y jest-axe light + dark Default + open + disabled                   | AC-19, AC-20, AC-21                   |
| Storybook Default + variantes light + dark                             | AC-26, AC-27                          |
| `docs/src/pages/componentes/dialog.astro` + previews                   | AC-28, AC-29                          |
| Export em `ui_kit/components/index.ts`                                 | AC-30 (audit)                         |
| `Dialog` no Set `MIGRATED`                                             | AC-31                                 |
| Apenas tokens semânticos                                               | AC-7, AC-8, AC-9, AC-10               |
| Pipeline verde (typecheck + lint + test + build + docs:build)          | AC-33                                 |
| Playground vs legacy registrado; "está bom" explícito                  | AC-34 (Fernando review post-PR)       |
| Brand consistente (Notion como SoT)                                    | AC-7..AC-10 + Fernando review         |
| Commit atômico único `feat(dialog): migrate to v0.1.0 DoD — ...`       | AC-32                                 |
| PR fecha o Plan #61 via `Closes #61`                                   | AC-35                                 |

All 13 Plan DoD bullets are covered by ACs above. Gate 1 will reuse this matrix.

## Out of scope (locked)

- AlertDialog migration (separate component, separate Issue when needed).
- Token additions beyond `bg-fg/60` (already exists in the semantic palette).
- Backport of dialog usage in product code (Dialog stays API-compatible).
- Touching files outside `ui_kit/components/dialog/`, `docs/src/pages/componentes/dialog.astro`, `docs/src/previews/dialog*.tsx`, `docs/src/pages/index.astro` (MIGRATED Set), `docs/adr/ADR-010-*` (if created), `docs/issues/issue-60/**`.

## Next phase

Phase 3 — Architecture (`03-architecture.md`): components touched, file-by-file deliverable, ADR-010 decision (yes — width ladder + overlay token + composition shape) drafted inline as the Phase 3 record.
