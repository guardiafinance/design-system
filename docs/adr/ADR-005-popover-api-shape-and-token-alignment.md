# ADR-005 — Popover v0.1.0 API shape (composition) and semantic-token alignment

- **Status:** accepted
- **Date:** 2026-05-28
- **Deciders:** Fernando Seguim
- **Plan:** [#69](https://github.com/guardiatechnology/design-system/issues/69) (Plan sub-issue of parent Tech Task [#68](https://github.com/guardiatechnology/design-system/issues/68))
- **Supersedes:** none. **Complements:** [ADR-002](ADR-002-hover-on-action-surfaces.md) (applies to the trigger's hover/active state), [ADR-004](ADR-004-datepicker-range-discriminated-union.md) (consistent migration pattern for v0.1.0 DoD).

## Context

The current `Popover` baseline at `ui_kit/components/popover/index.tsx` is a 39-line shadcn-imported scaffold with three exports — `Popover` (`Radix.Root`), `PopoverTrigger` (`Radix.Trigger`), `PopoverContent` (wrapped `Radix.Content`) — and consumes legacy `bg-popover` and `text-popover-foreground` Tailwind tokens that are NOT part of the canonical `@guardia/design-system` semantic-token set. It is registered in the barrel (`ui_kit/components/index.ts` line 31) but missing from the `MIGRATED` set in `docs/src/pages/index.astro`, has no tests, no stories, no Astro docs, and no a11y validation.

The legacy reference snapshot (`ux_references/ui_kits/components/Popover/index.tsx`) exposes a **different** API: a single high-level component `<Popover trigger={<Button/>}>{...}</Popover>` with `{side, align, width, closeOnOutside}` props and an internal `React.cloneElement` to bind ref + onClick to the consumer-supplied trigger.

Plan #69's DoD requires the v0.1.0 migration to "mirror the API/visual of the reference. Divergences require explicit justification recorded in the Architecture (Phase 3)." This ADR is the explicit justification.

Three questions need resolution:

1. **API shape.** Keep the current shadcn-style 3-export composition, or migrate to the legacy reference's high-level `<Popover trigger={...}>` ergonomics?
2. **Public surface.** Beyond the 3 core exports, do we add `PopoverAnchor` and `PopoverClose`?
3. **Token alignment.** Migrate from legacy `bg-popover`/`text-popover-foreground` to the canonical semantic-token set (`bg-background`, `text-fg`, `border-border-strong`, …) consumed by sibling overlays?

## Decision 1 — Keep shadcn-style primitive composition

Adopted: **the migrated `Popover` exposes three core composition exports** (`Popover`, `PopoverTrigger`, `PopoverContent`) instead of a high-level wrapper. The 3-export shape is preserved bit-for-bit from the current baseline, and the consumer's call site doesn't change:

```tsx
<Popover>
  <PopoverTrigger asChild>
    <Button>Open</Button>
  </PopoverTrigger>
  <PopoverContent side="bottom" align="start" size="md" width={320}>
    {…}
  </PopoverContent>
</Popover>
```

### Rationale

- **Sibling consistency.** Every other Overlays primitive in `@guardia/design-system` already migrated or in catalog (`Dialog*`, `Drawer*`, `Sheet*`, `DropdownMenu*`, `ContextMenu*`, `HoverCard*`, `Tooltip*`, `AlertDialog*`) uses primitive composition. Switching `Popover` to a high-level wrapper would split the mental model in half and force consumers to learn two patterns for the same category.
- **`asChild` ergonomics.** Radix's `<Trigger asChild>` is more flexible than `cloneElement(trigger, {ref, onClick})` — it works with any element (including a `<Tooltip>`-wrapped button) without losing refs, onClicks, or accessibility attributes. The legacy reference's `cloneElement` approach silently drops the original `onClick` if not threaded manually, which is a footgun the migrated v0.1.0 should not inherit.
- **Type safety.** With composition, `PopoverContent`'s CVA props can be typed independently of the trigger's element type. With the high-level shape, `trigger: React.ReactElement` is `any`-shaped on the element level, forcing internal casts.
- **No consumer migration cost.** No existing consumer of `@guardia/design-system`'s `Popover` (verified: it's exported in the barrel but the current shape was never publicly documented) needs to change. The legacy `ux_references/.../Popover` snapshot is internal-only; it served as the visual benchmark, not as a published API.
- **The reference's `{side, align, width, closeOnOutside}` semantics are preserved** — they migrate onto `<PopoverContent>` (`side`, `align`, `width`) and onto `<Popover>` (`modal` replaces `closeOnOutside` since Radix' nomenclature is canonical and `modal={false}` plus Radix' default outside-click-to-close is functionally equivalent to `closeOnOutside={true}`).

### Consequences

- A consumer migrating from the legacy `ux_references` snapshot to v0.1.0 rewrites their call site from `<Popover trigger={<X/>}>{children}</Popover>` to `<Popover><PopoverTrigger asChild><X/></PopoverTrigger><PopoverContent>{children}</PopoverContent></Popover>`. Migration cost: 3 extra lines, no semantic change.
- Visual parity with the playground (`Popover.playground.html`) is verified by side-by-side comparison registered in the PR (Plan #69 DoD checkbox).

## Decision 2 — Add `PopoverAnchor` and `PopoverClose` to the public surface

Adopted: the migrated barrel exports five components — `Popover`, `PopoverTrigger`, `PopoverAnchor`, `PopoverContent`, `PopoverClose` — plus the `popoverContentVariants` CVA accessor and the relevant TypeScript types (`PopoverContentProps`, `PopoverContentSize`).

### Rationale

- **`PopoverAnchor`** allows decoupling the visual anchor from the click trigger (e.g., trigger is a `<Button>` in the toolbar, but the popover should anchor to a row in the data grid). Radix ships it; consumers would otherwise import `@radix-ui/react-popover` directly, bypassing the token contract.
- **`PopoverClose`** matches `DialogClose`'s precedent — content-internal close affordances (a "Close" button inside a filter pop) need a typed primitive that doesn't require a ref + manual `onOpenChange` plumbing.

### Consequences

- The public API grows from 3 to 5 components plus 1 CVA accessor and 2 types. All additions are purely additive — no existing consumer breaks.
- Each exported wrapper inherits Radix's prop surface unchanged and adds no styling on its own (anchor and close are layout-neutral); only `PopoverContent` carries the className/CVA layer.

## Decision 3 — Migrate to canonical semantic tokens

Adopted: the `PopoverContent` className stack consumes only the canonical semantic-token set already validated in Combobox, Select, DropdownMenu, and DatePicker (all migrated). Specifically:

- `bg-background` (replaces `bg-popover`)
- `text-fg` (replaces `text-popover-foreground`)
- `border-border-strong` (matches Combobox/Select trigger border, paired with `border` so the visual weight is consistent)
- `shadow-md` for `size="sm"`, `shadow-lg` for `size="md"|"lg"` (matches Combobox/Select content shadow)
- `ring-ring` for focus ring (when content receives keyboard focus)
- `rounded-md` for `size="sm"|"md"`, `rounded-lg` for `size="lg"`
- Radix data-state-driven animation utilities (`data-[state=open]:animate-in`, `data-[state=closed]:animate-out`, `data-[state=closed]:fade-out-0`, `data-[state=open]:fade-in-0`, `data-[state=closed]:zoom-out-95`, `data-[state=open]:zoom-in-95`, plus the four `data-[side=*]:slide-in-from-*` rules) — these are utility classes, not color tokens, and stay unchanged from the current baseline.

### Rationale

- **`lex-design-system-library` compliance.** No hardcoded colors anywhere; every visual primitive consumes tokens already exported by the library. AC-9 of `02-requirements.md` verifies this via grep at Gate 2.
- **Theme parity.** Semantic tokens already carry correct light/dark resolution per `lex-brand-colors` (and per Notion's CTA hierarchy mirrored locally). Switching from `bg-popover` (which has no canonical dark mapping in our token set) to `bg-background` ensures the dark theme renders correctly without additional CSS variables. This is the same reason `Combobox` and `Select` use `bg-background` for their listbox surface.
- **Future Brand validation cost is zero.** When Fernando runs the Notion-vs-local Brand check (Plan #69 DoD), Popover already consumes the same tokens Combobox and Select consume — both already validated. The Popover migration does not introduce a new visual primitive that needs independent Brand approval.

### Consequences

- The PR contains zero token additions or token modifications. The migration is purely a className refactor against the same canonical token set.
- Visual baseline regeneration (`regenerate-baselines` label) may be required because the rendered output changes (different background, different border weight, possibly different shadow). Per AC-25 and Fernando's standing feedback, baselines never get committed from macOS — CI generates them on Ubuntu.

## CVA `size` variant on `PopoverContent`

While inside this ADR's token-alignment decision, we also lock the `size` variant scale on `PopoverContent`:

```tsx
const popoverContentVariants = cva(
  [/* base: bg-background, text-fg, border-border-strong, ring-ring, rounded-md, shadow-lg, animations, … */].join(" "),
  {
    variants: {
      size: {
        sm: "p-2 text-[13px] rounded-md shadow-md",
        md: "p-3 text-sm rounded-md shadow-lg",
        lg: "p-4 text-[15px] rounded-lg shadow-lg",
      },
    },
    defaultVariants: { size: "md" },
  },
);
```

The legacy reference uses a single `padding: 10px` (between `sm` and `md`). `md` is the default; `sm` is for compact filter pops and hint surfaces; `lg` is for richer content (mini-cards, multi-line forms). Padding ladders match Combobox/Select's height/padding ladder so the visual rhythm stays consistent across Overlays.

## Alternatives considered

| Alternative | Why rejected |
|---|---|
| **High-level `<Popover trigger={…}>` (legacy reference shape)** | Breaks pattern consistency across Overlays; ergonomically worse than `asChild`; type-erases the trigger element. |
| **Keep current shadcn baseline as-is and just add tests + stories + docs** | Misses the token-alignment opportunity (`bg-popover` is not canonical); leaves Popover diverging from sibling Overlays' visual treatment; no CVA size variants to scale across use cases. |
| **Wrap only `<Popover>` and `<PopoverContent>`, leave `<PopoverTrigger>` as direct Radix export** | Inconsistent surface; consumers would have one import path per primitive, which is what DropdownMenu/Dialog do NOT do. |
| **Defer the API decision to a separate Plan after Hephaestus's implementation observation** | Violates `lex-issue-driven` (Phase 3 architectural decisions must be locked at Gate 1); also blocks Hephaestus from starting without ambiguity. |

## Out of scope (decided separately or not at all in this ADR)

- **Visual regression baselines (`__image_snapshots__/`)**: handled by `regenerate-baselines` label policy, not by this ADR.
- **Token revisions (e.g., `--fg-muted` contrast)**: handled by a dedicated Brand/tokens Plan, not by this ADR.
- **Documentation copy / lede text on the Astro docs page**: editorial decision delegated to Hephaestus, with Brand validation against Notion at the playground approval step.

## Status transition

- **proposed** — drafted at Phase 3 (this ADR creation).
- **accepted** — set by Athena at Phase 7 (PR open), reflecting Fernando's Gate 1 approval.
- **superseded** — only if a future ADR reverses one of the three decisions; not anticipated.

## References

- `ui_kit/components/popover/index.tsx` (current shadcn baseline)
- `ux_references/ui_kits/components/Popover/` (legacy visual reference: playground.html + index.tsx + index.css)
- `ui_kit/components/combobox/index.tsx` (sibling primitive using `@radix-ui/react-popover` directly with canonical semantic tokens)
- `ui_kit/components/select/index.tsx` (same as Combobox)
- `ui_kit/components/dropdown-menu/index.tsx` (sibling primitive composition pattern)
- `.ahrena/issues/68/02-requirements.md` (numbered ACs)
- `.ahrena/issues/68/03-architecture.md` (component scope, risks, delegation)
- Plan sub-issue [#69](https://github.com/guardiatechnology/design-system/issues/69) and parent Tech Task [#68](https://github.com/guardiatechnology/design-system/issues/68)
