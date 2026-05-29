# Phase 1 — Brief: Migrate Dialog to v0.1.0 DoD

- **Parent Tech Task:** [#60](https://github.com/guardiatechnology/design-system/issues/60) — `feat(dialog): migrate Dialog to v0.1.0 DoD`
- **Plan sub-issue:** [#61](https://github.com/guardiatechnology/design-system/issues/61) — `Plan: migrate Dialog to v0.1.0 DoD`
- **Author:** @fernandoseguim
- **Type:** Tech Task (`Task` GitHub Issue Type)
- **Labels (parent):** `evolvability ♻️`, `status: development`
- **Branch:** `feat/60-dialog`
- **Worktree:** `.worktrees/60-dialog/`
- **Category:** Overlays
- **Visual reference:** `ux_references/ui_kits/components/Dialog/`

## Context

`Dialog` lives at `ui_kit/components/dialog/index.tsx` (121 lines, shadcn-style 9-export Radix wrapper) and is registered in the barrel (`ui_kit/components/index.ts` line 17), but the rest of the v0.1.0 DoD contract is unmet:

- **Tests:** `Dialog.test.tsx` does not exist.
- **Stories:** `Dialog.stories.tsx` exists with 40 lines, single `Default` story, no Sizes/Sides/States, no light + dark coverage, no `jest-axe` baseline.
- **Astro page:** `docs/src/pages/componentes/dialog.astro` does not exist.
- **Previews:** `docs/src/previews/dialog.tsx` and `docs/src/previews/dialog-live.tsx` do not exist.
- **MIGRATED Set:** `Dialog` is NOT in the `MIGRATED` Set at `docs/src/pages/index.astro:678` (so the catalog still surfaces the legacy `__pending__` stub).
- **Tokens:** the current implementation uses semantic `bg-background` correctly on the content but ships **`bg-black/80`** on the overlay — a hex-equivalent that bypasses the semantic palette and fails `lex-brand-colors`.
- **API gaps:** no CVA `size` variant (modal width is hardcoded to `max-w-lg` ≈ 32rem); no exported `dialogContentVariants` accessor for higher-order composition; uses `space-x-2` (deprecated Tailwind v3 utility — semantic gap missing).

Plan #61 already exists (status `development` from this phase forward) and #60 transitions to `development` in the same step. Athena is the declared owner of the session.

## Visual reference (legacy bundle)

- **Playground:** `ux_references/ui_kits/components/Dialog/Dialog.playground.html` (155 lines — covers Sizes sm/md/lg, Destructive-confirmation case, Form case, Info case)
- **Source:** `ux_references/ui_kits/components/Dialog/index.tsx` (64 lines — exposes the controlled API `{open, onClose, title, description, children, footer, size, closeOnBackdrop, showClose}` with `React.useEffect` for ESC + body-scroll-lock + `ReactDOM.createPortal` directly to `document.body`)
- **Styles:** `ux_references/ui_kits/components/Dialog/index.css` (58 lines — `grd-dlg-*` CSS classes; size rung **380 / 520 / 720 px** for sm / md / lg)

The reference's size rung is **wider than the Popover/Tooltip ladder** (Popover/Tooltip use 8 / 12 / 16 px of padding ladder; Dialog needs **modal widths** — 380 / 520 / 720 px, with a possible `xl` 920 px to cover dense data-grid use cases). The legacy API is also controlled-only (consumer owns `open`); Plan #61 expects parity, but the canonical Radix Dialog supports BOTH controlled (`open` + `onOpenChange`) and uncontrolled (`defaultOpen`) — and Radix already gives focus-trap, scroll-lock via `aria-hidden` on outside content, and ESC handling for free. Keeping the shadcn-style Radix composition + adding a CVA `size` ladder for widths preserves the visual outcome while gaining accessibility primitives the legacy snapshot lacks.

## Unknowns (carried into Phase 2 / Phase 3)

1. Should the size ladder be **3 rungs** (sm / md / lg, matching legacy) or **4 rungs** (sm / md / lg / xl)? — Resolution: **4 rungs**. The legacy ladder caps at 720px; modern Guardia screens (dense forms, AG-UI generative UI panels) benefit from a 920px `xl`. Justified inline; no consumer impact (default stays `md` 520px, identical to legacy default).
2. Should the public surface include `DialogPortal` + `DialogOverlay` as explicit exports? — Resolution: **yes**. Current barrel already exports them; removing would be a regression of public surface even though no documented consumer uses them today. Keep all 9 exports + add `dialogContentVariants` CVA accessor (matching Popover/Tooltip's escape-hatch pattern for higher-order composition).
3. ADR-010 needed? — Resolution: **YES**. Distinct architectural decisions land here: (a) keep shadcn composition vs. adopt legacy controlled-only API; (b) size ladder semantic (modal widths, NOT padding ladder); (c) Dialog vs. AlertDialog explicit non-consolidation; (d) overlay semantic-token alignment (replace `bg-black/80` with `bg-fg/60`). Formalize as ADR-010 to make the divergence-from-precedent (Popover/Tooltip use padding ladder; Dialog uses width ladder) explicit and reviewable.

## Adjacent context

Sibling overlays already at v0.1.0 DoD: **Popover** (ADR-005, PR #237 merged), **Tooltip** (ADR-007, PR #243-class merged). They are the recipe template. **AlertDialog** (`ui_kit/components/alert-dialog/index.tsx`) is a separate component wrapping `@radix-ui/react-alert-dialog` — Dialog migration does NOT touch it; the two stay distinct per Radix's own primitive separation (Dialog = generic modal; AlertDialog = role="alertdialog" with required confirm/cancel).

## Out of scope

- Refactors of any other component (sibling Athenas own #56 Alert, #64 EmptyState, #58 ConfidenceIndicator; warriors in #247, #225, #221, #204 own their respective files).
- New tokens beyond what Dialog strictly needs (`bg-fg/60` is already in the palette — no token additions).
- AlertDialog migration — out of this PR.
- Backport of dialog usage in existing product code — Dialog API stays bit-compatible, so no consumer migration needed.

## Next phase

Phase 2 — Requirements (`02-requirements.md`): produce ~25-29 numbered ACs covering API surface, size ladder, token contract, light + dark `jest-axe`, controlled / uncontrolled parity, SSR safety, behavioral tests, stories, Astro page, previews, MIGRATED Set, process ACs (atomic signed commit, full pipeline green, baselines via pending workflow without label auto-apply).
