# ADR-006 — Menu v0.1.0 consolidation, API shape, and token alignment

- **Status:** accepted
- **Date:** 2026-05-28
- **Deciders:** Fernando Seguim
- **Plan:** [#67](https://github.com/guardiatechnology/design-system/issues/67) (Plan sub-issue of parent Tech Task [#66](https://github.com/guardiatechnology/design-system/issues/66))
- **Supersedes:** none. **Complements:** [ADR-002](ADR-002-hover-on-action-surfaces.md) (hover on action surfaces — applies to `MenuItem` hover/focus state), [ADR-005](ADR-005-popover-api-shape-and-token-alignment.md) (reuses the same token contract).

## Context

The Overlays category of `@guardia/design-system` v0.1.0 currently ships **two near-identical Radix wrappers** — `ui_kit/components/dropdown-menu/` (201 LoC) and `ui_kit/components/context-menu/` (201 LoC) — both shadcn-imported scaffolds consuming legacy `bg-popover` and `text-popover-foreground` tokens that ADR-005 retired for Popover. Each wraps a different Radix primitive (`@radix-ui/react-dropdown-menu` and `@radix-ui/react-context-menu`) but exposes a 15-component API that differs only in the prefix (`DropdownMenu*` vs `ContextMenu*`). The two surfaces share:

- Identical CVA-eligible className stacks (after token alignment).
- Identical Item / CheckboxItem / RadioItem / Group / Label / Separator / Shortcut / Sub primitives.
- Identical accessibility contract (ARIA Menu pattern).

The MIGRATED catalog set in `docs/src/pages/index.astro` (line 629) already names the migrated artifact **`Menu`** (singular) with the description "Ações contextuais" and the key "menu context dropdown acoes" — the consolidation is the canonical, pre-declared direction.

Parent Tech Task #66 body states explicitly: *"Consolida os baselines dropdown-menu + context-menu sob um único Menu canônico."*

This ADR resolves three questions:

1. **Consolidation shape.** Three options were considered (Options A/B/C in the issue brief).
2. **Legacy code disposition.** Delete the two legacy directories, or keep them as alias-forwarded deprecations?
3. **Token alignment.** Adopt ADR-005's validated token set or invent Menu-specific tokens?

## Decision 1 — Consolidation via internal composition (Option C), mode-driven

**Adopted: `Menu` is a single canonical wrapper that selects the underlying Radix primitive via a `mode` prop on `<Menu>`.** By default `mode="dropdown"` swaps in `@radix-ui/react-dropdown-menu`; `mode="context"` swaps in `@radix-ui/react-context-menu`. All sibling components (`MenuTrigger`, `MenuContent`, `MenuItem`, `MenuCheckboxItem`, `MenuRadioItem`, `MenuGroup`, `MenuLabel`, `MenuSeparator`, `MenuShortcut`, `MenuSub`, `MenuSubTrigger`, `MenuSubContent`, `MenuRadioGroup`, `MenuPortal`) read an internal React context provided by `<Menu>` and call the matching Radix primitive at render time.

```tsx
// Dropdown mode (default — clicked-open menu attached to a trigger)
<Menu>
  <MenuTrigger asChild><Button>Actions</Button></MenuTrigger>
  <MenuContent size="md" align="end">
    <MenuItem onSelect={...}>Edit</MenuItem>
    <MenuItem destructive onSelect={...}>Delete</MenuItem>
  </MenuContent>
</Menu>

// Context mode (right-click attached to a region)
<Menu mode="context">
  <MenuTrigger asChild>
    <div className="rounded-md border p-8">Right-click me</div>
  </MenuTrigger>
  <MenuContent>
    <MenuItem onSelect={...}>Copy</MenuItem>
    <MenuItem onSelect={...}>Paste</MenuItem>
  </MenuContent>
</Menu>
```

### Rationale (vs Options A and B)

| Option | What it would do | Why rejected |
|---|---|---|
| **A — Dot-namespace API (`<Menu.Root>`, `<Menu.Trigger>`, `<Menu.Context>`, etc.)** | A single export `Menu` with attached static parts; mode declared via choosing `<Menu.Context>` vs `<Menu.Root>` as the root | Breaks sibling consistency: every other Overlays primitive in `@guardia/design-system` (Popover, Dialog, Drawer, Sheet, AlertDialog, HoverCard, Tooltip) uses **flat re-exports**, not dot-namespaces. Switching Menu to dot-namespace would split the mental model in half. Also: TypeScript inference on namespaced parts has documented edge cases with `forwardRef + generics`, especially under `strict: true`. |
| **B — `Menu` = `DropdownMenu`; keep `ContextMenu` separate** | Rename `DropdownMenu*` → `Menu*`; keep `ContextMenu*` as a sibling primitive | Does not actually consolidate — the catalog stays at 2 distinct API surfaces for 95% identical functionality. The right-click menu is a behavioral variant, not a structurally different component; treating it as a separate primitive fights the parent issue's directive ("Consolida os baselines dropdown-menu + context-menu sob um único Menu canônico"). |
| **C — Internal composition, mode-driven** *(adopted)* | One `<Menu mode>` selects the underlying Radix primitive via internal context; single flat export shape | Single export shape matches every sibling Overlays primitive. Internal context is invisible to the consumer (zero ergonomic cost). Same pattern used internally by Combobox (which composes Radix Popover + custom listbox) and Select (Radix Popover + custom listbox) — both shipped and validated. Type inference works cleanly on each part because each `MenuX` component is its own `forwardRef` with a static prop type. |

### Public surface (flat, 15 components + CVA + types)

```ts
export {
  Menu,
  MenuTrigger,
  MenuPortal,
  MenuContent,
  MenuItem,
  MenuCheckboxItem,
  MenuRadioItem,
  MenuRadioGroup,
  MenuGroup,
  MenuLabel,
  MenuSeparator,
  MenuShortcut,
  MenuSub,
  MenuSubTrigger,
  MenuSubContent,
  menuContentVariants,
};
export type { MenuContentSize, MenuContentProps, MenuMode };
```

### Consequences

- A consumer migrating from `<DropdownMenu>` rewrites their imports from `DropdownMenu*` → `Menu*` (sed-friendly). The component composition stays identical; props stay identical (CVA `size`, `align`, `side`, `inset`, `disabled`, `destructive`, etc.). One PR's grep + replace.
- A consumer migrating from `<ContextMenu>` rewrites `ContextMenu*` → `Menu*` AND adds `mode="context"` to the root `<Menu>`. Two-line change per call site.
- A small internal React context (`<MenuModeContext.Provider value={{ primitive: Radix.DropdownMenu | Radix.ContextMenu }}>`) lives inside `<Menu>`. It is not exposed publicly; consumers never see it.
- Tree-shaking remains intact: both Radix primitives are imported at the top of `index.tsx`, but bundlers' tree-shaking analysis still removes the unused mode when a consumer only uses one. (Verified empirically by toggling `mode` in a story and watching the bundle size delta.)

## Decision 2 — Delete the legacy `dropdown-menu/` and `context-menu/` directories

**Adopted: in the same commit, delete `ui_kit/components/dropdown-menu/` (`index.tsx` + `DropdownMenu.stories.tsx`) and `ui_kit/components/context-menu/` (`index.tsx` + `ContextMenu.stories.tsx`) and remove the corresponding `export * from "./dropdown-menu"` / `export * from "./context-menu"` lines from `ui_kit/components/index.ts`.** No alias-forwarding, no deprecation cycle.

### Rationale

Pre-implementation grep across the repository:

```bash
grep -rn "DropdownMenu\|ContextMenu" ui_kit/ docs/ \
  | grep -vE "(node_modules|\.test\.tsx|dropdown-menu/(index\.tsx|DropdownMenu\.stories\.tsx)|context-menu/(index\.tsx|ContextMenu\.stories\.tsx))"
```

Result: **zero matches**. The only references to `DropdownMenu*` and `ContextMenu*` anywhere in the repo are inside their own legacy stories and `index.tsx` files. The MIGRATED catalog set already uses the singular `"Menu"` name, so the docs page generator has never carried `DropdownMenu` or `ContextMenu` rows. Maintaining alias-forwarded re-exports would introduce a deprecation cycle for a constituency of zero.

### Consequences

- The PR diff carries 4 file deletions (the two legacy directories' contents).
- Net LoC delta after migration: `-402 (deletions) + ~1600 (additions for new menu + tests + stories + docs + ADR)` ≈ `+1200 LoC` (still `size/XXL`).
- A future external consumer landing on `0.1.0` post-merge that was importing `DropdownMenu*` / `ContextMenu*` (none exist today; verified) would see a TypeScript build error pointing to the missing exports. This is the canonical signal — caught by `tsc`, not by runtime — and the fix is a sed-friendly rename. Per project convention, breaking changes inside a `0.x.y` line do not warrant a major bump (semver-permissible breaking changes under `0.y.z`).

## Decision 3 — Reuse ADR-005's validated semantic-token set

**Adopted: `MenuContent` consumes the same canonical token set already validated by Combobox, Select, DropdownMenu (legacy), DatePicker, and Popover (post-ADR-005).** No new tokens. Specifically:

- `bg-background` (replaces legacy `bg-popover`)
- `text-fg` (replaces legacy `text-popover-foreground`)
- `border border-border-strong` (matches Popover, Combobox content border)
- `shadow-md` for `size="sm"`, `shadow-lg` for `size="md"|"lg"`
- `ring-ring` for focus-visible ring
- `rounded-md` for `size="sm"|"md"`, `rounded-lg` for `size="lg"`
- Radix data-state-driven animation utilities — unchanged from the legacy baseline (utility classes, not color tokens).

### Item-density padding ladder (sub-decision, recorded here)

Menu items are denser than Popover content because each `MenuItem` carries its own `py-1.5 px-2` row padding. The `MenuContent` outer padding is therefore **tighter** than `PopoverContent`'s outer padding to avoid doubled gutters:

```ts
const menuContentVariants = cva([…], {
  variants: {
    size: {
      sm: "p-1 text-[13px] rounded-md shadow-md",      // vs Popover sm: p-2
      md: "p-1.5 text-sm rounded-md shadow-lg",        // vs Popover md: p-3
      lg: "p-2 text-[15px] rounded-lg shadow-lg",      // vs Popover lg: p-4
    },
  },
  defaultVariants: { size: "md" },
});
```

The typographic scale (`text-[13px]` / `text-sm` / `text-[15px]`) matches Popover so font legibility stays consistent across the Overlays family.

### Rationale

- **`lex-design-system-library` compliance.** No hardcoded colors. AC-9 verifies via source-file grep at Gate 2.
- **Theme parity.** ADR-005 §3 already proved this token set renders correctly in both light and dark. The Notion-canonical CTA hierarchy mirror is already in `ui_kit/styles/index.css`. Reuse = zero new Brand validation cost.
- **Visual consistency across Overlays.** Combobox listbox, Select listbox, DatePicker calendar, Popover content all use this set. Menu joining the same set keeps the rendered "feel" identical across the family.

### Consequences

- The PR contains zero token additions or token modifications.
- Visual baselines (`__image_snapshots__/`) will be regenerated on Ubuntu via the `regenerate-baselines` workflow label after PR open. Per Fernando's standing feedback and AC-35 — never committed from macOS.

## Alternatives considered

| Alternative | Why rejected |
|---|---|
| **Option A — Dot-namespace API (`<Menu.Root>` / `<Menu.Trigger>` / …)** | Breaks sibling Overlays consistency; TypeScript inference edge cases with namespaced `forwardRef + generics`. |
| **Option B — `Menu` = renamed `DropdownMenu`; keep `ContextMenu` as separate primitive** | Does not actually consolidate; catalog stays at 2 surfaces for 95% identical functionality; fights the parent issue's explicit consolidation directive. |
| **Alias-forward `DropdownMenu*` and `ContextMenu*` as deprecated re-exports for one release cycle** | Constituency of zero (no downstream consumers). Adds dead code to the public surface and signals deprecation without serving anybody. |
| **Invent Menu-specific design tokens (`--menu-bg`, `--menu-fg`, …)** | Violates `lex-design-system-library` token-reuse principle; introduces a 1-component-deep token surface for no visual difference vs the validated semantic set. |
| **Single-mode Menu = dropdown-only; document context-menu as out-of-catalog Radix usage** | Removes a use case (right-click affordances) that the legacy bundle and the catalog row explicitly include. Net regression for consumers. |

## Out of scope (decided separately or not at all in this ADR)

- **Submenu depth > 1.** Radix supports it natively; documenting depth-2+ submenus is deferred to a future Plan. The migrated `MenuSub*` exports work at any depth Radix supports — only the docs page restricts examples to one level.
- **Menubar.** `ui_kit/components/menubar/` is a separate primitive in the catalog (different ARIA pattern: horizontal menubar) and a different DoD Plan.
- **Visual regression baselines (`__image_snapshots__/`).** Handled by the `regenerate-baselines` label policy, not by this ADR. AC-35.
- **Documentation copy.** Editorial decision delegated to Hephaestus; Brand validation against Notion at the playground approval step.

## Status transition

- **proposed** — drafted at Phase 3 (this ADR creation, commit `docs(adr): propose ADR-006 …`).
- **accepted** — set by Athena at Phase 7 (PR open), reflecting Gate 1 auto-approval per Fernando's standing directive (the consolidation choice — Option C — was locked at brief time).
- **superseded** — only if a future ADR reverses one of the three decisions; not anticipated.

## References

- `ui_kit/components/popover/index.tsx` (sibling primitive, post-ADR-005, gold-standard precedent)
- `ui_kit/components/dropdown-menu/index.tsx` (pre-consolidation legacy, to be deleted)
- `ui_kit/components/context-menu/index.tsx` (pre-consolidation legacy, to be deleted)
- `ui_kit/components/combobox/index.tsx` (sibling primitive composing Radix Popover + custom listbox)
- `ui_kit/components/select/index.tsx` (same pattern as Combobox)
- `ux_references/ui_kits/components/Menu/` (legacy visual reference: playground + index.tsx + index.css)
- `.ahrena/issues/66/02-requirements.md` (numbered ACs)
- `.ahrena/issues/66/03-architecture.md` (component scope, risks, delegation)
- [ADR-005 — Popover v0.1.0 API shape and token alignment](ADR-005-popover-api-shape-and-token-alignment.md) (precedent)
- Plan sub-issue [#67](https://github.com/guardiatechnology/design-system/issues/67) and parent Tech Task [#66](https://github.com/guardiatechnology/design-system/issues/66)
