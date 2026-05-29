# ADR-010 — Migrate Dialog to v0.1.0 DoD (Overlays parity)

- **Status:** accepted
- **Date:** 2026-05-29
- **Deciders:** @fernandoseguim (CODEOWNER), `warrior-athena` (Issue-Driven flow orchestrator)
- **Precedent:** ADR-005 (Popover v0.1.0 DoD), ADR-007 (Tooltip v0.1.0 DoD)
- **Issue:** [#60](https://github.com/guardiatechnology/design-system/issues/60)
- **Plan:** [#61](https://github.com/guardiatechnology/design-system/issues/61)

## Context

The design-system has rolled out the v0.1.0 Definition of Done across the Overlays category — Popover (ADR-005, PR #237 merged), Tooltip (ADR-007, merged), Combobox, Select. **Dialog is the next Overlay to migrate.** The current `ui_kit/components/dialog/index.tsx` is a 121-line shadcn-style Radix wrapper with the canonical 10 exports but ships gaps that block the v0.1.0 DoD:

1. **Test suite missing** — `Dialog.test.tsx` does not exist (target ≥ 30 behavioral tests with AC traceability + jest-axe across light + dark).
2. **Storybook minimal** — `Dialog.stories.tsx` is 40 lines with one `Default` story; no Sizes, Sides, States, Destructive, LongContent, Controlled stories.
3. **Astro docs missing** — `docs/src/pages/componentes/dialog.astro` does not exist.
4. **Previews missing** — `docs/src/previews/dialog.tsx` and `docs/src/previews/dialog-live.tsx` do not exist.
5. **MIGRATED Set entry missing** — `docs/src/pages/index.astro:678` does not list `Dialog`, so the catalog still renders the `__pending__` stub.
6. **Token contract violation** — overlay uses `bg-black/80` (Tailwind expands `black` to `#000`), which is NOT in the Guardia 5×5 brand palette and violates `lex-brand-colors` ("0 color values outside the palette on `main`").
7. **No CVA `size` variant** — modal width is hardcoded to `max-w-lg` (32rem). Product code needing smaller (confirmation) or larger (data-grid panel) widths must hand-roll a className override.
8. **Legacy Tailwind v3 utility** — `DialogFooter` uses `space-x-2`, which the design-system retired with Tailwind v4 migration in favor of `gap-2`.

The legacy reference at `ux_references/ui_kits/components/Dialog/index.tsx` (64 lines) implements a controlled-only API (`<Dialog open onClose title description footer size>`) with manual ESC handler, manual body-scroll-lock, manual portal — all of which Radix Dialog ships natively. The legacy size rung is **380 / 520 / 720 px** for sm/md/lg.

Six questions need resolution before the migration commit lands:

1. **API shape.** Adopt the legacy controlled-only shape, or keep the current shadcn-style 10-export composition?
2. **Size ladder semantic.** Use a padding ladder (matching Popover/Tooltip's `p-2 / p-3 / p-4`) or a width ladder (matching the modal's natural sizing constraint)?
3. **Width prop escape hatch.** Add a `width` prop to `DialogContent` that overrides the CVA ladder?
4. **Overlay token migration.** Replace `bg-black/80` with which semantic token? `bg-foreground/60` (semantic but theme-inverting), `bg-fg/60` (same), `bg-guardia-purple-900/60 dark:bg-guardia-gray-900/80` (Notion-canonical brand palette), or keep `bg-black/80`?
5. **AlertDialog consolidation.** Should Dialog and AlertDialog be consolidated into a single primitive (like the Menu/DropdownMenu/ContextMenu consolidation in ADR-006)?
6. **ADR status flow.** `proposed` → `accepted` two-commit pattern (flagged 🟡 by Argos on PR #237) or `accepted` from creation (ADR-007 precedent)?

## Decision

Dialog migrates to v0.1.0 DoD using the same architectural recipe as Popover (ADR-005) and Tooltip (ADR-007), with the divergences below explicitly justified.

### Decision 1 — Keep shadcn-style Radix 10-export composition

**Adopted:** the migrated `Dialog` exposes the 10-export shadcn composition (`Dialog`, `DialogTrigger`, `DialogPortal`, `DialogOverlay`, `DialogContent`, `DialogHeader`, `DialogFooter`, `DialogTitle`, `DialogDescription`, `DialogClose`) wrapping `@radix-ui/react-dialog`. The legacy controlled-only `<Dialog open onClose title description footer size>` shape is rejected.

**Rationale:** the legacy reference manually re-implements ESC handler, body-scroll-lock, and portal — Radix ships all three natively plus focus-trap, `role="dialog"`, `aria-modal`, `aria-labelledby`/`aria-describedby` auto-wiring, and SSR safety. Adopting the legacy shape would (a) break every existing consumer of the current shadcn composition, (b) lose accessibility primitives Radix provides for free, (c) diverge from Popover and Tooltip — the Overlays category would lose internal consistency.

### Decision 2 — CVA `size` ladder drives WIDTHS, not padding (diverges from Popover/Tooltip)

**Adopted:** `dialogContentVariants` CVA accepts `size: "sm" | "md" | "lg" | "xl"`. Each rung sets a `max-w-*` class:

```
sm = max-w-sm   (24rem ≈ 384 px)  — small confirmations
md = max-w-lg   (32rem ≈ 512 px)  — default; matches legacy `md` 520 px
lg = max-w-2xl  (42rem ≈ 672 px)  — dense forms; close to legacy `lg` 720 px
xl = max-w-4xl  (56rem ≈ 896 px)  — data-grid panels, generative-UI playgrounds (new)
```

Padding is fixed at `p-6` (the canonical shadcn modal padding); the CVA does NOT vary padding.

**Rationale:** Popover and Tooltip use a padding ladder (8 / 12 / 16 px) because they are inline overlays anchored to a trigger — sizing is determined by content, padding controls density. Dialog is a viewport-centered modal; its natural sizing constraint is `max-width`, not padding. Different `padding` values across modal sizes would change the layout density at random, which is exactly the antipattern. The same prop NAME (`size`) is used across the Overlays family to preserve consumer ergonomics — what `size` MEANS is component-specific (padding in inline overlays, width in modal overlays), documented in JSDoc + this ADR.

Adding `xl` (896 px) beyond the legacy 720 px is a forward-looking decision: dense data-grid panels and generative-UI playgrounds (per the AG-UI ADR-008 in flight) routinely need 896 px. Adding `xl` now avoids a future widening of the surface.

### Decision 3 — `width` prop on `DialogContent` as the override escape hatch

**Adopted:** `DialogContent` accepts `width?: number | string`. When present, the value is forwarded as `style.maxWidth` (number → `px`; string → as-is, supporting any CSS dimension — `min()`, `clamp()`, `vw`, `rem`).

**Rationale:** product code occasionally needs a precise modal width (e.g., 640 px for an embedded calendar that doesn't fit `md` 512 px but doesn't need `lg` 672 px). The escape hatch keeps the CVA ladder as the default 95% case while allowing the 5% precision case without re-implementing the wrapper. Mirrors Popover's `width` prop (ADR-005 Decision 5).

### Decision 4 — Overlay token migrates to `bg-guardia-purple-900/60 dark:bg-guardia-gray-900/80 backdrop-blur-sm`

**Adopted:** the overlay consumes the Notion-canonical brand-palette ramp tokens — Violet 900 (`#1F092B`) on light theme at 60% alpha, Gray 900 (`#17171B`) on dark theme at 80% alpha — plus `backdrop-blur-sm` (4 px Gaussian).

**Rationale:**
1. **`bg-black/80` violates `lex-brand-colors`.** Tailwind expands `black` to `#000`, which is NOT in the Guardia 5×5 palette (the canonical "black" is Mono Black `#0E1016`, exposed only via `--mono-black`, not via a `bg-*` utility). `lex-brand-colors` requires "0 color values outside the palette on `main`".
2. **`bg-foreground/60` and `bg-fg/60` semantic utilities would invert wrongly on dark theme.** Both resolve to the text color (Violet 500 light, Mono White dark). A WHITE-tinted overlay on dark mode is visually wrong for a modal scrim.
3. **Notion-canonical Branding spec validates this exact shade.** The Dark Mode subpage of [Notion > Branding > Cores](https://www.notion.so/34536f91ebd28142a3f1e0e58fd62c4b) uses Violet 900 (`#1F092B`) as the "Deep Modal Background" reference for light mode and Gray 900 (`#17171B` — same as `--bg` in dark theme) for dark mode. Both are exposed under `@theme inline` as `--color-guardia-purple-900` and `--color-guardia-gray-900`. Using them keeps the overlay theme-aware AND brand-consistent.
4. **`backdrop-blur-sm` aligns with the Notion Branding Dark Mode "blur on modal" guideline** and modern modal UX patterns.

This is a Notion → local-token resolution per `lex-brand-colors` ("Any divergence between local tokens and the Notion canonical pages MUST be resolved in favor of Notion").

### Decision 5 — Dialog and AlertDialog stay distinct (no consolidation)

**Adopted:** the Dialog migration does NOT touch `ui_kit/components/alert-dialog/index.tsx`. Dialog wraps `@radix-ui/react-dialog`; AlertDialog wraps `@radix-ui/react-alert-dialog`. They remain two separate primitives.

**Rationale:** Radix itself maintains them as distinct primitives because their ARIA contracts diverge:

- `Dialog` is generic modal: `role="dialog"`, dismissible by outside-click and Escape, no required confirm/cancel buttons.
- `AlertDialog` is destructive-action confirmation: `role="alertdialog"`, NOT dismissible by outside-click, REQUIRES `AlertDialogAction` + `AlertDialogCancel` for screen readers.

Consolidating would collapse the two ARIA semantics into one, weakening accessibility on destructive confirmations. The Menu/DropdownMenu/ContextMenu consolidation precedent (ADR-006) does NOT apply here — those three components shared a single ARIA contract (`role="menu"`); Dialog and AlertDialog do NOT.

### Decision 6 — ADR-010 status `accepted` from creation (single atomic commit)

**Adopted:** ADR-010 ships with `status: accepted` in the same atomic commit as the implementation. NO `proposed` → `accepted` two-commit pattern.

**Rationale:** Argos flagged the two-commit pattern 🟡 on PR #237 (Popover). The ADR-007 precedent already moved to single-atomic-commit shape. Sticking with the precedent eliminates that finding before review.

### Decision 7 — Stacked PRs evaluation: SINGLE PR

Decision Checklist (codex-stacked-prs):

**High signals: 0**
- ❌ Multi-layer architecture — Dialog is a single Radix wrapper + tests + docs
- ❌ Different reviewers per layer — all design-system, single reviewer pool
- ❌ Independent value per layer — the component is useless without its docs/tests
- ❌ Decoupled regression footprints — one component touched

**Anti-signals: 4 strong**
- ✅ Single bounded context
- ✅ Single reviewer
- ✅ Same regression footprint (all changes in `ui_kit/components/dialog/` + docs + ADR + index.astro MIGRATED)
- ✅ Precedent — every v0.1.0 DoD migration lands as a single PR

**Result:** single PR — same shape as Popover #237 and Tooltip merged.

## Consequences

### Positive

- Dialog reaches parity with the rest of Overlays — same composition shape, same semantic token vocabulary, same test rigor, same Astro docs surface.
- Consumers importing `<Dialog>` from `@guardia/design-system` get predictable behavior across all four Overlays (Popover, Tooltip, Combobox, Dialog).
- Legacy `bg-black/80` is retired from Dialog (one fewer holdout when the wider cleanup of Sheet, Drawer, AlertDialog happens — see "Tangential findings" below).
- The CVA `size` width ladder provides a clear API for the 4 modal widths the product needs (confirmation / form / data-form / data-grid panel).
- The `width` prop escape hatch unblocks edge cases without forcing consumers into className overrides.
- `Dialog` lands in the `MIGRATED` Set; the design-system catalog renders the Astro page instead of the `__pending__` stub.

### Negative

- The current Dialog baseline (10 exports) stays bit-compatible — consumers DO NOT need to migrate. But IF a consumer was hand-rolling a `max-w-lg` override on `DialogContent`, that override is now redundant (the default `md` ALREADY ships `max-w-lg`). The override is harmless but adds noise; cleanup is mechanical and out of this PR.
- Visual baseline regeneration is required for the new Sizes / States / UseCases stories. Per the new warn-not-fail logic merged in PR #243, CI emits a `pending-baselines` artifact + PR comment; Fernando reviews manually and applies the `regenerate-baselines` label. The author of this PR does NOT auto-apply the label (per AC-34 + Fernando's standing instruction).

### Neutral

- One component file rewrite (`ui_kit/components/dialog/index.tsx`), one test file added (`Dialog.test.tsx`), one stories file rewritten, one Astro page added, two previews files added, one MIGRATED Set entry added, one ADR added (this file). No new dependencies, no Tailwind config changes, no infra changes, no Radix dependency bump.

## Alternatives considered

1. **Keep `bg-black/80` and migrate everything else** — rejected. Half-migrations create more debt; the v0.1.0 DoD is an all-or-nothing contract per Plan #61, and `lex-brand-colors` admits no exceptions.
2. **Use `bg-fg/60`** (semantic token, theme-inverting) — rejected. On dark theme, `--fg` resolves to Mono White; the overlay would be white-tinted, visually wrong for a modal scrim. Modal scrims need to read as a dark veil regardless of underlying theme density.
3. **Adopt the legacy controlled-only API** — rejected. See Decision 1.
4. **Use a padding ladder instead of a width ladder** — rejected. See Decision 2 rationale.
5. **Consolidate Dialog and AlertDialog** — rejected. See Decision 5 rationale.
6. **Stack PRs (separate the component, tests, docs)** — rejected. See Decision 7 Checklist.
7. **Hide `DialogPortal` and `DialogOverlay` exports** — rejected. The current barrel already exports them; removing would break any consumer that composes them directly (e.g., custom modal harnesses that mount a single Portal for multiple Dialog instances). Keeping all 10 exports preserves bit-compatibility.

## Tangential findings (per `lex-no-silent-tech-debt`)

During the architecture review, the following findings were identified OUTSIDE this PR's scope:

1. **`AlertDialog`, `Sheet`, `Drawer` all still use `bg-black/80` or `bg-black/50`** (hex-equivalent overlay tokens, violate `lex-brand-colors`). Dialog's migration sets the precedent for a cleanup pass. Surfaced to @fernandoseguim for direction: register as a new Plan sub-issue under a new parent Tech Task, OR fold the cleanup into the next sibling Overlay migration. Decision left to @fernandoseguim post-PR.

No `# TODO(#NNN)` markers are added in code. No `## Out of scope (to revisit)` sections without trackable Issue are added in documentation.

## References

- ADR-005 — Popover v0.1.0 DoD migration (precedent)
- ADR-007 — Tooltip v0.1.0 DoD migration (precedent)
- PR [#237](https://github.com/guardiatechnology/design-system/pull/237) — Popover migration (merged, sets the playbook)
- Plan [#61](https://github.com/guardiatechnology/design-system/issues/61) — this migration
- Tech Task [#60](https://github.com/guardiatechnology/design-system/issues/60) — parent Issue
- `lex-design-system-library` — mandatory consumption of design-system primitives
- `lex-brand-colors` — semantic palette enforcement; Notion is source of truth
- `lex-frontend-accessibility` — WCAG 2.1 AA requirement (role="dialog" is a landmark)
- `lex-frontend-testing` — Vitest + jest-axe testing strategy
- Notion — [Branding > Cores > Dark Mode](https://www.notion.so/34536f91ebd28142a3f1e0e58fd62c4b) — modal scrim guideline (source of truth)
- Fernando standing memory `feedback_a11y_unit_test_ac.md` — jest-axe light+dark on Default + open + disabled is an AC
- Fernando standing memory `feedback_visual_regression_ubuntu_sot.md` — baselines are Ubuntu/CI source of truth; no auto-label
- Fernando standing memory `feedback_story_no_external_destructive_helper.md` — destructive stories use component-internal variant
