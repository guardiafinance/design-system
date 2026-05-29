# ADR-012 — Migrate Drawer to v0.1.0 DoD (Overlays consolidation)

- **Status:** accepted
- **Date:** 2026-05-29
- **Deciders:** @fernandoseguim (CODEOWNER), `warrior-athena` (Issue-Driven flow orchestrator)
- **Precedent:** ADR-006 (Menu consolidation), ADR-010 (Dialog v0.1.0 DoD)
- **Issue:** [#62](https://github.com/guardiatechnology/design-system/issues/62)
- **Plan:** [#63](https://github.com/guardiatechnology/design-system/issues/63)

## Context

The design-system has rolled out the v0.1.0 Definition of Done across the Overlays category — Popover (ADR-005, merged), Tooltip (ADR-007, merged), Combobox, Select, Dialog (ADR-010, merged via #257). **Drawer is the next Overlay to migrate.** The current `ui_kit/components/drawer/index.tsx` is a 118-line `vaul`-based wrapper that ships gaps that block the v0.1.0 DoD AND diverges from the legacy reference's stated semantic:

1. **Wrong base library for the stated semantic.** The legacy reference (`ux_references/ui_kits/components/Drawer/`) defines Drawer as a `right | left` side panel with `sm | md | lg` size. The current baseline uses `vaul` — a bottom-sheet library by emilkowalski — which slides only from the bottom with a drag handle. This is a semantic mismatch.
2. **Sibling baseline overlap.** A separate `ui_kit/components/sheet/index.tsx` exists, also wrapping `@radix-ui/react-dialog` directly, with `side: top | right | bottom | left` variants. Sheet has zero Astro documentation, zero tests, zero external consumers (verified via repo grep — only barrel re-export sites). It is the side-panel modal the legacy reference describes, just under a different name.
3. **Test suite missing** — `Drawer.test.tsx` does not exist (target ≥ 25 behavioral tests with AC traceability + jest-axe on each side × light/dark).
4. **Storybook minimal** — `Drawer.stories.tsx` is 37 lines with one `Default` story; no Sides, Sizes, States, Destructive, LongContent, Controlled, WidthOverride stories.
5. **Astro docs missing** — `docs/src/pages/componentes/drawer.astro` does not exist.
6. **Previews missing** — `docs/src/previews/drawer.tsx` and `docs/src/previews/drawer-live.tsx` do not exist.
7. **Token contract violation** — overlay uses `bg-black/80` (Tailwind expands `black` to `#000`), which is NOT in the Guardia 5×5 brand palette and violates `lex-brand-colors`. Flagged as tangential in ADR-010 ("AlertDialog, Sheet, Drawer all still use bg-black/80 — Dialog's migration sets the precedent for a cleanup pass").
8. **`vaul` is a dependency for a single component.** With the current Drawer being the sole consumer, the dependency lives only to power a divergent semantic.

The parent Issue body resolves the ambiguity explicitly: *"Side panel (left/right/top/bottom); **consolida o baseline Sheet existente**"*. The migration absorbs Sheet under the canonical Drawer name, mirroring ADR-006's Menu consolidation (DropdownMenu + ContextMenu → Menu with `side` variant).

Eight questions need resolution before the migration commit lands:

1. **Consolidation.** Do Drawer and Sheet consolidate, or stay separate?
2. **Base library.** `vaul` (current Drawer), `@radix-ui/react-dialog` (current Sheet + Dialog), or `@radix-ui/react-drawer` (does not exist)?
3. **Side variants.** Just `left | right` (legacy reference), `top | right | bottom | left` (Sheet baseline), or something narrower?
4. **Size ladder semantic.** Padding ladder (Popover/Tooltip), width ladder for horizontal sides + height ladder for vertical sides (Dialog-adjacent), or fixed?
5. **Width/Height escape-hatch.** Add escape-hatch props that override the CVA ladder?
6. **Overlay token migration.** Replace `bg-black/80` with which semantic token — `bg-fg/60`, `bg-foreground/60`, `bg-guardia-purple-900/60 dark:bg-guardia-gray-900/80` (Notion-canonical brand palette, per Dialog ADR-010), or keep `bg-black/80`?
7. **Dependency hygiene.** Remove `vaul` from `package.json` post-migration?
8. **ADR status flow.** `proposed` → `accepted` two-commit pattern or `accepted` from creation (ADR-007/-010/-011/-013 precedent)?

## Decision

Drawer migrates to v0.1.0 DoD using the same architectural recipe as Dialog (ADR-010), with the additional consolidation of Sheet under the canonical Drawer name (mirroring ADR-006).

### Decision 1 — Consolidate Drawer + Sheet under canonical `Drawer` with `side` variant

**Adopted:** the migrated `Drawer` absorbs the Sheet baseline's `side: top | right | bottom | left` semantic. `ui_kit/components/sheet/` is **deleted**. The barrel `ui_kit/components/index.ts` removes `export * from "./sheet"`. The Sheet exports (`Sheet`, `SheetTrigger`, `SheetContent`, etc.) are NOT re-exported as aliases to Drawer — clean retirement.

**Rationale:**

1. **The parent Issue body directs it explicitly.** Plan #63 body: *"Side panel (left/right/top/bottom); consolida o baseline Sheet existente"*. The directive is product-level, not technical-level.
2. **ADR-006 precedent.** Menu absorbed DropdownMenu + ContextMenu, three components sharing the `role="menu"` ARIA contract under one canonical name with `side`/`mode`-style variants. Drawer + Sheet share the `role="dialog" aria-modal="true"` ARIA contract entirely; only the slide-direction differs, which is exactly what the `side` CVA prop expresses.
3. **No external consumers.** Repo grep confirmed zero imports of Sheet or current Drawer outside the barrel — retirement is risk-free.
4. **Single import path = single mental model.** Consumers know exactly which primitive to reach for ("modal side panel" → `Drawer`); the v0.1.0 catalog cleans up one component slot.
5. **Documentation deduplication.** A single Astro page, a single test suite, a single set of stories — instead of doubling Astro/test/stories work to keep two near-identical primitives in sync.

**Counter-argument considered (and rejected):** "Sheet should stay as the technical primitive, Drawer should be a UX-named alias." Rejected because (a) the parent Issue names `Drawer` as the catalog entry, (b) keeping Sheet as a separate technical primitive doubles the surface area for no value, (c) ADR-006 already established the consolidation pattern for the design-system.

### Decision 2 — Base switch: `vaul` → `@radix-ui/react-dialog`

**Adopted:** the migrated `Drawer` wraps `@radix-ui/react-dialog` (already the Dialog and former-Sheet base). `vaul` is removed from `package.json` dependencies.

**Rationale:**

1. **Semantic match.** The Drawer described by the parent Issue + legacy reference is a `role="dialog" aria-modal="true"` modal side panel. That is exactly Radix Dialog's contract; `vaul` is bottom-sheet-first with drag-to-dismiss UX.
2. **Cross-Overlay consistency.** Dialog (ADR-010), Sheet (former), AlertDialog all wrap `@radix-ui/react-dialog`. Drawer joining this base keeps the Overlays family on one Radix primitive — focus-trap, scroll-lock, `aria-labelledby`/`aria-describedby` auto-wiring, SSR safety all work identically across the family.
3. **Lower dependency footprint.** Removing `vaul` shrinks the bundle and the audit surface. Radix Dialog is already a transitive dependency through Dialog and AlertDialog.
4. **`vaul`'s value-add is out of v0.1.0 scope.** `vaul`'s drag-to-dismiss bottom-sheet is mobile-specific UX. The v0.1.0 product surface is desktop/tablet-first. If a drag-aware mobile bottom-sheet is later needed, it can compose on top of Drawer as a separate primitive in a separate Tech Task — Drawer does NOT preemptively absorb mobile UX it doesn't currently use.

### Decision 3 — Side variants: `top | right | bottom | left` (default `right`)

**Adopted:** `DrawerContent`'s CVA `side` prop accepts `top | right | bottom | left`. Default is `right` (matches the legacy reference's default).

**Rationale:**

1. **Mirrors Sheet baseline 1-for-1.** Sheet's 4-side surface is absorbed without loss.
2. **Extends legacy reference forward.** Legacy reference shipped only `right | left`; adding `top | bottom` is a forward-looking expansion that absorbs Sheet's surface and matches modern modal-panel UX patterns (notifications panel from top, action panel from bottom).
3. **CVA + Radix data-state animations match the 4 directions.** Tailwind's `slide-in-from-*` / `slide-out-to-*` utilities cover all four sides; no custom animation primitives needed.

### Decision 4 — Size ladder: `sm | md | lg | xl` driving `max-w-*` on horizontal sides / `max-h-*` on vertical sides

**Adopted:** `drawerContentVariants` CVA accepts `size: "sm" | "md" | "lg" | "xl"`. The rung resolves to a different Tailwind class depending on the `side`:

```
For side ∈ {left, right} — the size rung drives max-w-*:
  sm = max-w-sm   (24rem ≈ 384 px)
  md = max-w-lg   (32rem ≈ 512 px)  — default
  lg = max-w-2xl  (42rem ≈ 672 px)
  xl = max-w-4xl  (56rem ≈ 896 px)

For side ∈ {top, bottom} — the size rung drives max-h-*:
  sm = max-h-sm   (24rem ≈ 384 px)
  md = max-h-lg   (32rem ≈ 512 px)  — default
  lg = max-h-2xl  (42rem ≈ 672 px)
  xl = max-h-4xl  (56rem ≈ 896 px)
```

**Rationale:**

1. **Identical width budget to Dialog ADR-010 Decision 2.** Consumers building modal panels expect the same size rung to mean the same dimension across the Overlays family.
2. **Side-contextual ladder.** A horizontal side panel's natural sizing constraint is width; a vertical (top/bottom) panel's is height. The same `size` rung means the same numeric budget (24 / 32 / 42 / 56 rem); only the dimension axis differs based on `side`.
3. **No padding ladder.** Padding is fixed by the canonical `DrawerHeader` (`px-6 pt-6 pb-2`) + body padding (`px-6 py-2`) + `DrawerFooter` (`px-6 pt-2 pb-6`). Mirrors Dialog's `p-6` decision but split because drawers have explicit header/body/footer regions whereas Dialog uses a single grid.

### Decision 5 — `width` / `height` escape-hatch on `DrawerContent`

**Adopted:** `DrawerContent` accepts both `width?: number | string` (forwarded to `style.maxWidth`, applied when `side ∈ {left, right}`) and `height?: number | string` (forwarded to `style.maxHeight`, applied when `side ∈ {top, bottom}`).

**Rationale:**

1. **Same escape-hatch pattern as Dialog ADR-010 Decision 3 and Popover ADR-005 Decision 5.** Consumers occasionally need a precise dimension (e.g., 600 px right panel for a single embedded form). The escape-hatch keeps the CVA ladder as the default 95% case while allowing the 5% precision case without re-implementing the wrapper.
2. **Side-contextual.** The `width` prop only makes sense for `left`/`right`; the `height` prop only for `top`/`bottom`. If the prop pairing is wrong for the side, it's a no-op — does not break — and surfaces in stories as a documented "this combination is a no-op" footnote.
3. **Consistent with the size ladder semantic.** Same axis the CVA ladder targets; the override is a precise dimension on that axis.

### Decision 6 — Overlay token migrates to `bg-guardia-purple-900/60 dark:bg-guardia-gray-900/80 backdrop-blur-sm`

**Adopted:** the overlay consumes the Notion-canonical brand-palette ramp tokens — Violet 900 (`#1F092B`) on light theme at 60% alpha, Gray 900 (`#17171B`) on dark theme at 80% alpha — plus `backdrop-blur-sm` (4 px Gaussian).

**Rationale:**

1. **`bg-black/80` violates `lex-brand-colors`.** Tailwind expands `black` to `#000`, which is NOT in the Guardia 5×5 palette (the canonical "black" is Mono Black `#0E1016`, exposed only via `--mono-black`, not via a `bg-*` utility). `lex-brand-colors` requires "0 color values outside the palette on `main`".
2. **`bg-foreground/60` and `bg-fg/60` semantic utilities would invert wrongly on dark theme.** Both resolve to the text color (Violet 500 light, Mono White dark). A WHITE-tinted overlay on dark mode is visually wrong for a modal scrim.
3. **Notion-canonical Branding spec validates this exact shade.** The Dark Mode subpage of [Notion > Branding > Cores](https://www.notion.so/34536f91ebd28142a3f1e0e58fd62c4b) uses Violet 900 (`#1F092B`) as the "Deep Modal Background" reference for light mode and Gray 900 (`#17171B` — same as `--bg` in dark theme) for dark mode. Both are exposed under `@theme inline` as `--color-guardia-purple-900` and `--color-guardia-gray-900`. Using them keeps the overlay theme-aware AND brand-consistent.
4. **Dialog ADR-010 Decision 4 already validated this exact shade for the modal family.** Reusing the token keeps the Overlays family visually identical when a Dialog and a Drawer open simultaneously (would be confusing if they used different scrim shades). One scrim recipe = one user expectation.
5. **`backdrop-blur-sm` aligns with the Notion Branding Dark Mode "blur on modal" guideline** and modern modal UX patterns.

This is the second Notion → local-token resolution in the Overlays migration (after Dialog ADR-010), per `lex-brand-colors` ("Any divergence between local tokens and the Notion canonical pages MUST be resolved in favor of Notion").

### Decision 7 — Remove `vaul` from `package.json`

**Adopted:** `vaul` is removed from `package.json` dependencies and `package-lock.json` is regenerated. The current Drawer was the sole consumer; the new Drawer wraps `@radix-ui/react-dialog`, which is already declared.

**Rationale:**

1. **No remaining consumers.** Repo grep confirmed `vaul` is imported only by `ui_kit/components/drawer/index.tsx`.
2. **Lower dependency footprint.** Saves bundle size, reduces audit surface.
3. **`lex-frontend-security` hygiene.** Fewer dependencies = smaller surface for known-CVE scanning.

Verification path: post-removal, `npm run typecheck` MUST exit 0 (no residual `import "vaul"`); `npm run build` MUST exit 0; `npm run test` MUST exit 0.

### Decision 8 — ADR-012 status `accepted` from creation (single atomic commit)

**Adopted:** ADR-012 ships with `status: accepted` in the same atomic commit as the implementation. NO `proposed` → `accepted` two-commit pattern.

**Rationale:** Argos flagged the two-commit pattern 🟡 on PR #237 (Popover ADR-005). The ADR-007 / ADR-010 / ADR-011 / ADR-013 precedents already moved to single-atomic-commit shape. Sticking with the precedent eliminates that finding before review.

### Decision 9 — Stacked PRs evaluation: SINGLE PR

Decision Checklist (codex-stacked-prs):

**High signals: 0**
- ❌ Multi-layer architecture — Drawer is a single Radix wrapper + tests + docs + barrel + Sheet retirement, all the same bounded context
- ❌ Different reviewers per layer — design-system, single reviewer pool
- ❌ Independent value per layer — the component is useless without its docs/tests; Sheet retirement is meaningless without Drawer replacing it
- ❌ Decoupled regression footprints — one feature touched

**Anti-signals: 4 strong**
- ✅ Single bounded context
- ✅ Single reviewer
- ✅ Same regression footprint (all changes in `ui_kit/components/{drawer,sheet}` + docs + ADR + barrel + package.json)
- ✅ Precedent — every v0.1.0 DoD migration lands as a single PR

**Result:** single PR — same shape as Popover #237, Tooltip merged, Dialog #257.

## Consequences

### Positive

- Drawer reaches parity with the rest of Overlays — same composition shape, same semantic token vocabulary, same test rigor, same Astro docs surface.
- The Overlays family converges on `@radix-ui/react-dialog` as the single base, lowering the cognitive cost of jumping between Dialog, AlertDialog, Drawer.
- `vaul` dependency is removed; bundle and audit surface shrink.
- Sheet is retired without any consumer migration work (zero consumers).
- Legacy `bg-black/80` is retired from Drawer (one fewer holdout when the wider cleanup of AlertDialog happens — see Tangential findings).
- The CVA `size` ladder × `side` ladder provides a clear, predictable API for the 16 (4 × 4) side/size combinations.
- The `width` / `height` escape-hatch unblocks edge cases without forcing consumers into className overrides.
- `Drawer` lands cleanly in the `MIGRATED` Set; the design-system catalog renders the Astro page instead of the `__pending__` stub.

### Negative

- The current Drawer baseline (`vaul`-based) is a breaking change in behavior: consumers depending on the bottom-sheet drag-to-dismiss UX will see the new modal side-panel default. Repo grep confirmed zero such consumers; if any sneak in, they migrate by passing `side="bottom"` (parity) and accept the no-drag UX, OR open a new Tech Task to bring back drag.
- Sheet barrel exports are removed. Repo grep confirmed zero external consumers, so no migration is needed; if any sneak in, they migrate by replacing `<Sheet>` with `<Drawer>` (the JSX is identical — same prop surface, same composition shape).
- Visual baseline regeneration is required for the new Drawer stories (the prior Default story baseline is for the vaul render and will diff). Per the warn-not-fail logic merged in PR #243, CI emits a `pending-baselines` artifact + PR comment; Fernando reviews manually and applies the `regenerate-baselines` label. The author of this PR does NOT auto-apply the label.

### Neutral

- One component file rewrite (`ui_kit/components/drawer/index.tsx`), one component folder deletion (`ui_kit/components/sheet/`), one test file added (`Drawer.test.tsx`), one stories file rewritten, one Astro page added, two previews files added, one barrel update, one MIGRATED Set verification (already in), one ADR added (this file), one dependency removed. No new dependencies, no Tailwind config changes, no infra changes.

## Alternatives considered

1. **Keep Drawer on `vaul`, migrate Sheet separately** — rejected. Sheet has no consumers; doubling the migration work for two semantically-overlapping primitives is exactly the ADR-006 antipattern.
2. **Use `bg-black/80` and migrate everything else** — rejected. Half-migrations create more debt; the v0.1.0 DoD is an all-or-nothing contract per Plan #63, and `lex-brand-colors` admits no exceptions.
3. **Use `bg-fg/60`** (semantic token, theme-inverting) — rejected. See Dialog ADR-010 Decision 4 rationale; same applies.
4. **Adopt the legacy controlled-only API** — rejected. Same rationale as Dialog ADR-010 Decision 1 — Radix ships ESC handler, scroll-lock, portal, focus-trap natively; the legacy reference's manual re-implementations are redundant and lose Radix's a11y wiring.
5. **Use a padding ladder instead of a width/height ladder** — rejected. See Decision 4 rationale; Drawer's natural sizing constraint is the axis perpendicular to the slide direction, not padding.
6. **Keep Drawer at `right | left` only (legacy reference)** — rejected. Sheet's absorption is part of the consolidation; dropping `top | bottom` would create an artificial gap.
7. **Hide `DrawerPortal` and `DrawerOverlay` exports** — rejected. The current Sheet barrel exports `SheetPortal` + `SheetOverlay`; preserving them under the Drawer names keeps maximum composability for consumers that compose them directly.
8. **Stack PRs (separate the component, tests, docs, Sheet retirement)** — rejected. See Decision 9 Checklist.

## Tangential findings (per `lex-no-silent-tech-debt`)

During the architecture review, the following findings were identified OUTSIDE this PR's scope:

1. **`AlertDialog` still uses `bg-black/80`** (legacy overlay token; flagged in ADR-010 already). Drawer's migration sets the second precedent (after Dialog #257) for a cleanup pass. Surfaced to @fernandoseguim for direction: register as a new Plan sub-issue under a new parent Tech Task ("Retire `bg-black/80` from legacy Overlays — AlertDialog finalization"), OR fold into the next sibling Overlay migration. Decision left to @fernandoseguim post-PR.

No `# TODO(#NNN)` markers are added in code. No `## Out of scope (to revisit)` sections without trackable Issue are added in documentation.

## References

- ADR-005 — Popover v0.1.0 DoD migration (precedent for token recipe)
- ADR-006 — Menu consolidation and API shape (**primary consolidation precedent**)
- ADR-007 — Tooltip v0.1.0 DoD migration (single-commit ADR precedent)
- ADR-010 — Dialog v0.1.0 DoD migration (**primary base + overlay token precedent**)
- ADR-011 — Alert v0.1.0 DoD migration
- ADR-013 — ConfidenceIndicator v0.1.0 DoD migration
- PR [#237](https://github.com/guardiatechnology/design-system/pull/237) — Popover migration (merged)
- PR [#239](https://github.com/guardiatechnology/design-system/pull/239) — Menu consolidation (merged)
- PR [#257](https://github.com/guardiatechnology/design-system/pull/257) — Dialog migration (merged — sets the playbook)
- Plan [#63](https://github.com/guardiatechnology/design-system/issues/63) — this migration
- Tech Task [#62](https://github.com/guardiatechnology/design-system/issues/62) — parent Issue
- Epic [#13](https://github.com/guardiatechnology/design-system/issues/13) — parent Epic
- `lex-design-system-library` — mandatory consumption of design-system primitives; reimplementation forbidden (consolidation rationale)
- `lex-brand-colors` — semantic palette enforcement; Notion is source of truth
- `lex-frontend-accessibility` — WCAG 2.1 AA requirement (`role="dialog"` is a landmark)
- `lex-frontend-testing` — Vitest + jest-axe testing strategy
- `lex-no-silent-tech-debt` — tangential findings surfaced, never silent
- Notion — [Branding > Cores > Dark Mode](https://www.notion.so/34536f91ebd28142a3f1e0e58fd62c4b) — modal scrim guideline (source of truth)
- Fernando standing memory `feedback_a11y_unit_test_ac.md` — jest-axe light+dark on Default + open + each side is an AC
- Fernando standing memory `feedback_visual_regression_ubuntu_sot.md` — baselines are Ubuntu/CI source of truth; no auto-label
- Fernando standing memory `feedback_story_no_external_destructive_helper.md` — destructive stories use component-internal variant
- Fernando standing memory `feedback_terminology_unit_test.md` — "teste de unidade", not "teste unitário"
