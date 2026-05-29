# Phase 3 — Architecture: Migrate Dialog to v0.1.0 DoD

- **Parent Tech Task:** [#60](https://github.com/guardiatechnology/design-system/issues/60)
- **Plan sub-issue:** [#61](https://github.com/guardiatechnology/design-system/issues/61)
- **Brief:** [01-brief.md](01-brief.md)
- **Requirements:** [02-requirements.md](02-requirements.md)
- **ADR (Phase 3):** [ADR-010](../../adr/ADR-010-dialog-v0.1.0-dod-migration.md) (slot pre-allocated; created inline in the Phase 4 atomic commit, status `accepted` from creation per ADR-007 precedent)

## Goals

1. Bring `Dialog` from baseline (9-export Radix wrapper, no tests, no docs, semantic-token gap on overlay) to v0.1.0 DoD parity with Popover (ADR-005) and Tooltip (ADR-007).
2. Preserve the 10-export public surface (`Dialog`, `DialogTrigger`, `DialogPortal`, `DialogOverlay`, `DialogContent`, `DialogHeader`, `DialogFooter`, `DialogTitle`, `DialogDescription`, `DialogClose`) — bit-compatible — and ADD `dialogContentVariants` + `DialogContentProps` + `DialogContentSize`.
3. Land a CVA `size` ladder for modal WIDTHS (distinct from Popover/Tooltip's padding ladder — see ADR-010 Decision 2 for rationale).
4. Retire the legacy `bg-black/80` overlay token in favor of `bg-guardia-purple-900/60 dark:bg-guardia-gray-900/80` — Notion-canonical brand-palette tokens, no hex, theme-aware, aligned with `lex-brand-colors`.

## Non-goals

- Refactor `AlertDialog`, `Sheet`, `Drawer` (each owns its own overlay; they share the same systemic `bg-black/80` debt — that is a separate cross-component cleanup outside this PR).
- Add new tokens (we consume `bg-guardia-purple-900`, `bg-guardia-gray-900`, both already in the canonical palette).
- Change Radix dependency (`@radix-ui/react-dialog` stays pinned to its current major in `package.json`).
- Backport existing product code that consumes Dialog (Dialog API stays bit-compatible — controlled and uncontrolled paths continue to work).

## Component / file map

| File                                                                | Change      | Lines (rough) |
|---------------------------------------------------------------------|-------------|---------------|
| `ui_kit/components/dialog/index.tsx`                                | Rewrite     | ~210          |
| `ui_kit/components/dialog/Dialog.test.tsx`                          | Create      | ~640          |
| `ui_kit/components/dialog/Dialog.stories.tsx`                       | Rewrite     | ~260          |
| `ui_kit/components/dialog/index.css`                                | NONE — Tailwind utilities only; no per-component CSS file |  |
| `docs/src/pages/componentes/dialog.astro`                           | Create      | ~310          |
| `docs/src/previews/dialog.tsx`                                      | Create      | ~220          |
| `docs/src/previews/dialog-live.tsx`                                 | Create      | ~70           |
| `docs/src/pages/index.astro` (MIGRATED Set, line 678 ± 1)           | Modify      | +1            |
| `docs/adr/ADR-010-dialog-v0.1.0-dod-migration.md`                   | Create      | ~180          |
| `docs/issues/issue-60/01-brief.md`                                  | Created (Phase 1) | done    |
| `docs/issues/issue-60/02-requirements.md`                           | Created (Phase 2) | done    |
| `docs/issues/issue-60/03-architecture.md`                           | This file (Phase 3) | done  |
| `docs/issues/issue-60/05-security-review.md`                        | Phase 5     | ~80           |
| `docs/issues/issue-60/06-quality-report.md`                         | Phase 6     | ~120          |
| `ui_kit/components/index.ts`                                        | NONE — `./dialog` already exported (line 17). Audited at Phase 6. |  |

No other files are touched. Sibling Athenas' worktrees and other open PRs (#247, #225, #221, #204, #56/#64/#58 dispatch warriors) are untouched.

## Architectural decisions (Phase 3)

The decisions below land in **ADR-010**, created inline in the Phase 4 atomic commit with `status: accepted` from creation (per ADR-007 precedent — no `proposed → accepted` flip).

### Decision 1 — Keep shadcn-style Radix composition (reject legacy controlled-only API)

**Adopted:** 10-export shadcn composition wrapping `@radix-ui/react-dialog`, NOT the legacy reference's controlled-only `<Dialog open onClose title description footer size>` shape.

**Why:** the legacy reference (`ux_references/ui_kits/components/Dialog/index.tsx`, 64 lines) manually implements ESC handler, body-scroll-lock, and a portal — all of which Radix Dialog ships natively, additionally with focus-trap, `aria-modal`, `aria-labelledby`/`aria-describedby` wiring, and SSR safety. Adopting the legacy shape would:

1. Force every consumer to switch from `<Dialog>...</Dialog>` to `<Dialog open onClose title>...</Dialog>` — a public-surface breaking change with zero a11y gain.
2. Reimplement what Radix gives us for free (escape handling, scroll lock, focus management).
3. Diverge from Popover (ADR-005) and Tooltip (ADR-007) — the Overlays category would lose internal consistency.

The 10-export shape stays bit-compatible with current `ui_kit/components/dialog/index.tsx` consumers and inherits the v0.1.0 DoD recipe wholesale.

### Decision 2 — CVA `size` ladder for WIDTHS (sm/md/lg/xl, diverges from Popover/Tooltip padding ladder)

**Adopted:** `dialogContentVariants` CVA with `size: "sm" | "md" | "lg" | "xl"`, where each rung sets a `max-w-*` class (modal WIDTH), NOT a `p-*` class (padding).

```
sm = max-w-sm   (24rem  ≈ 384 px)  — small confirmations
md = max-w-lg   (32rem  ≈ 512 px)  — default; matches legacy `md` 520 px
lg = max-w-2xl  (42rem  ≈ 672 px)  — dense forms; close to legacy `lg` 720 px
xl = max-w-4xl  (56rem  ≈ 896 px)  — data-grid panels, generative-UI playgrounds (new beyond legacy)
```

**Why diverges from Popover/Tooltip:**
- Popover/Tooltip use a **padding ladder** (8 / 12 / 16 px) because they are inline, content-shrink overlays anchored to a trigger — sizing is determined by content, padding controls density.
- Dialog is a **viewport-centered modal** — its natural sizing constraint is `max-width`, NOT padding. Modals need explicit width budgets (confirmation vs. form vs. panel). A padding ladder would be meaningless for modals.

The same prop NAME (`size`) is used across the Overlays family to preserve consumer ergonomics — what `size` MEANS varies per component, which is documented in each component's JSDoc + ADR.

### Decision 3 — `width` prop override on `DialogContent`

**Adopted:** `DialogContent` accepts a `width?: number | string` prop that overrides the CVA `size`'s `max-w-*` class, identical to Popover (ADR-005 Decision 5).

**Why:** product code sometimes needs a precise modal width (e.g., 640 px for an embedded calendar that doesn't fit `md` 512 px but doesn't need `lg` 672 px). The escape hatch keeps the CVA ladder as the default 95% case while allowing the 5% precision case without re-implementing the wrapper.

### Decision 4 — Overlay token migration: `bg-black/80` → `bg-guardia-purple-900/60 dark:bg-guardia-gray-900/80`

**Adopted:** the overlay consumes the **brand-palette ramp tokens** `bg-guardia-purple-900/60 dark:bg-guardia-gray-900/80 backdrop-blur-sm`.

**Why:**
1. `bg-black/80` is a hex-equivalent (Tailwind expands `black` to `#000`), which violates `lex-brand-colors` ("0 color values outside the palette on `main`"). Even if `black` reads conceptually as neutral, it is NOT in the canonical 5×5 Guardia palette.
2. `bg-foreground/60` and `bg-fg/60` semantic utilities WOULD invert on dark theme (`--foreground` resolves to `mono-white`), producing a WHITE-tinted overlay on dark mode — visually wrong for a modal scrim.
3. The Notion-canonical Branding spec uses violet `#1F092B` (Violet 900) as the "Deep Modal Background" reference for light mode and gray `#17171B` (Gray 900 — same as `--bg` in dark theme) for dark mode. Both are already exposed under `@theme inline` as `--color-guardia-purple-900` and `--color-guardia-gray-900`. Using them keeps the overlay theme-aware AND brand-consistent.
4. Existing components `AlertDialog`, `Sheet`, `Drawer` still use `bg-black/80` — they ALSO violate `lex-brand-colors`. Fixing them is a cross-component cleanup outside this PR scope (a follow-up Tech Task — surfaced as a tangential finding per `lex-no-silent-tech-debt`, see "Tangential findings" at the end of this file). Dialog's migration sets the precedent for that cleanup.

The `backdrop-blur-sm` addition (4 px Gaussian) softens the underlying content per modern modal UX patterns and aligns with the Notion Branding Dark Mode subpage's "blur on modal" guideline.

### Decision 5 — Dialog and AlertDialog stay distinct (no consolidation)

**Adopted:** Dialog migration does NOT touch `ui_kit/components/alert-dialog/index.tsx`. They remain two separate Radix wrappers: Dialog wraps `@radix-ui/react-dialog`; AlertDialog wraps `@radix-ui/react-alert-dialog`.

**Why:** Radix itself maintains them as distinct primitives because their ARIA contracts diverge — `Dialog` is generic modal (`role="dialog"`, dismissible by outside-click and Escape, no required confirm/cancel); `AlertDialog` is destructive-action confirmation (`role="alertdialog"`, NOT dismissible by outside-click, REQUIRES `AlertDialogAction` + `AlertDialogCancel`). Consolidating would collapse the two ARIA semantics into one, weakening accessibility. The Tooltip/Popover precedent of consolidation (Menu, ADR-006) DOES NOT APPLY here — Menu/DropdownMenu/ContextMenu shared a single ARIA contract; Dialog/AlertDialog do NOT.

### Decision 6 — ADR-010 status `accepted` from creation (no proposed-flip pattern)

**Adopted:** ADR-010 ships with `status: accepted` in the same atomic commit as the implementation, per the ADR-007 precedent. NO two-commit pattern (no `feat(dialog): migrate ...` followed by `chore(adr-010): mark accepted`).

**Why:** Argos flagged the two-commit pattern 🟡 on PR #237 (Popover). The single-atomic-commit shape eliminates that finding before review.

### Decision 7 — Stacked PRs evaluation: SINGLE PR

**Decision Checklist (codex-stacked-prs):**

High signals: 0
- ❌ Multi-layer architecture (just a Radix wrapper + tests + docs in one component)
- ❌ Different reviewers per layer (all design-system, single reviewer pool)
- ❌ Independent value per layer (the component is useless without its docs/tests)
- ❌ Decoupled regression footprints (one component touched)

Anti-signals: 4 strong
- ✅ Single bounded context
- ✅ Single reviewer
- ✅ Same regression footprint (all changes in `ui_kit/components/dialog/` + docs)
- ✅ Precedent (ADR-005, ADR-007, all v0.1.0 DoD migrations land as single PRs)

Result: **single PR** — same shape as Popover #237 and Tooltip #243-class.

## Component shape (concrete)

```tsx
// ui_kit/components/dialog/index.tsx
"use client";

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { cva, type VariantProps } from "class-variance-authority";
import { X } from "lucide-react";

import { cn } from "@/lib/utils";

const Dialog = DialogPrimitive.Root;
const DialogTrigger = DialogPrimitive.Trigger;
const DialogPortal = DialogPrimitive.Portal;
const DialogClose = DialogPrimitive.Close;

const DialogOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      "fixed inset-0 z-50",
      "bg-guardia-purple-900/60 dark:bg-guardia-gray-900/80",
      "backdrop-blur-sm",
      "data-[state=open]:animate-in data-[state=closed]:animate-out",
      "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className,
    )}
    {...props}
  />
));
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName;

const dialogContentVariants = cva(
  [
    "fixed left-1/2 top-1/2 z-50 grid w-full -translate-x-1/2 -translate-y-1/2 gap-4",
    "border border-border-strong bg-background text-fg shadow-lg ring-1 ring-ring/5",
    "rounded-lg p-6",
    "duration-200",
    "data-[state=open]:animate-in data-[state=closed]:animate-out",
    "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
    "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
    "data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%]",
    "data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]",
  ].join(" "),
  {
    variants: {
      size: {
        sm: "max-w-sm",
        md: "max-w-lg",
        lg: "max-w-2xl",
        xl: "max-w-4xl",
      },
    },
    defaultVariants: { size: "md" },
  },
);

export type DialogContentSize = NonNullable<
  VariantProps<typeof dialogContentVariants>["size"]
>;

export interface DialogContentProps
  extends Omit<
      React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>,
      "asChild"
    >,
    VariantProps<typeof dialogContentVariants> {
  width?: number | string;
}

const DialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  DialogContentProps
>(({ className, children, size = "md", width, style, ...props }, ref) => {
  const widthStyle: React.CSSProperties | undefined =
    width !== undefined
      ? { ...style, maxWidth: typeof width === "number" ? `${width}px` : width }
      : style;
  return (
    <DialogPortal>
      <DialogOverlay />
      <DialogPrimitive.Content
        ref={ref}
        style={widthStyle}
        className={cn(dialogContentVariants({ size }), className)}
        {...props}
      >
        {children}
        <DialogPrimitive.Close
          className="absolute right-4 top-4 rounded-sm text-fg-muted opacity-70 transition-opacity hover:bg-bg-hover hover:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </DialogPrimitive.Close>
      </DialogPrimitive.Content>
    </DialogPortal>
  );
});
DialogContent.displayName = DialogPrimitive.Content.displayName;

const DialogHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("flex flex-col gap-1.5 text-left", className)} {...props} />
);
DialogHeader.displayName = "DialogHeader";

const DialogFooter = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col-reverse gap-2 sm:flex-row sm:justify-end",
      className,
    )}
    {...props}
  />
);
DialogFooter.displayName = "DialogFooter";

const DialogTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn(
      "text-lg font-semibold leading-none tracking-tight text-fg",
      className,
    )}
    {...props}
  />
));
DialogTitle.displayName = DialogPrimitive.Title.displayName;

const DialogDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn("text-sm text-fg-muted", className)}
    {...props}
  />
));
DialogDescription.displayName = DialogPrimitive.Description.displayName;

export {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogClose,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
  dialogContentVariants,
};
```

The above is a reference shape only — the executing warrior (Hephaestus) MAY adjust for fidelity to Popover/Tooltip patterns and JSDoc completeness, provided ACs hold.

## Test plan (Dialog.test.tsx)

Mirrors `Popover.test.tsx` / `Tooltip.test.tsx` shape. Helper `BasicDialog` returns the canonical Trigger + Content + Header + Title + Description + Footer composition with `Open dialog` button and "Close" `DialogClose`. Tests grouped by:

1. **Public API surface (AC-1 to AC-6)** — ~6 tests asserting each named export is defined and CVA accessor is a function.
2. **Trigger toggle + ARIA contract (AC-11, AC-16)** — ~4 tests.
3. **Keyboard contract (AC-12, AC-17)** — Escape + focus restore; close button keyboard activation; Tab cycling.
4. **Outside-click + modal semantics (AC-13, AC-14, AC-15)** — focus trap; body scroll lock; `aria-hidden` on siblings.
5. **CVA size matrix (AC-24)** — one test per rung asserting `max-w-*` class on content.
6. **`width` prop override (AC-25)** — number + string + `style` merge.
7. **Controlled / uncontrolled parity (AC-18)** — `<Dialog open ...>` + `<Dialog defaultOpen>`.
8. **A11y (AC-19, AC-20, AC-21)** — `axeInThemes` on Default + Open + Disabled.

Target: **≥ 30 behavioral tests**, well above the 20-test floor and well above the 80% coverage floor. Each test prefixed `AC-N:` so Gate 2 Check 1 passes.

## Storybook plan (Dialog.stories.tsx)

Mirrors `Popover.stories.tsx` / `Tooltip.stories.tsx`:

| Story                       | Coverage                                                     |
|-----------------------------|--------------------------------------------------------------|
| `Default`                   | basic Trigger + Content + Title + Description + Footer       |
| `Sizes`                     | 4 cards side-by-side rendering `sm` / `md` / `lg` / `xl`     |
| `WithTitleAndDescription`   | accessible title + description chained via aria-*            |
| `WithFooter`                | Cancel (variant outline) + Confirm (variant default)         |
| `Destructive`               | Button variant `destructive` inside Footer (component-internal variant, NOT external `<span text-destructive>` per Fernando `feedback_story_no_external_destructive_helper`) |
| `LongContent`               | content overflows viewport; vertical scroll inside Content   |
| `Controlled`                | `useState` driving `open` + `onOpenChange`                   |
| `WidthOverride`             | `width={640}` showing the escape hatch                       |

All stories render correctly in light + dark via the Storybook theme toggle (paired with `data-theme` on `<html>`).

## Astro page plan (`docs/src/pages/componentes/dialog.astro`)

Mirrors `popover.astro` / `tooltip.astro`:

| Section          | Preview component               |
|------------------|---------------------------------|
| Padrão           | `BasicRow`                      |
| Tamanhos         | `SizesRow`                      |
| Estados          | `StatesRow`                     |
| Casos de uso     | `UseCasesRow` (destructive + form + info, mirroring the legacy playground) |
| Playground       | `LiveDialogSnippet` (react-live)|
| Props            | inline table (composition + variants) |
| Acessibilidade   | inline list of the AC-11..AC-21 guarantees |

`kicker="COMPONENTES · OVERLAYS"`, `title="Dialog"`, `group="Overlays"`, `storybookId="components-dialog--default"`, `sourcePath="ui_kit/components/dialog"`.

## Risks + mitigations

| Risk                                                                  | Mitigation                                                               |
|-----------------------------------------------------------------------|---------------------------------------------------------------------------|
| Radix Dialog focus-trap conflicting with Storybook Portal during axe runs | `axeInThemes` runs on rendered container; Radix Portal mounts outside but `axe` walks the document — keep `region` rule enabled (Dialog is a landmark) |
| Visual baselines pending due to new Sizes/Sides/Destructive/LongContent stories | CI's warn-not-fail logic emits `pending-baselines` artifact + comment; PR body documents the expectation; author does NOT auto-apply `regenerate-baselines` label (Fernando reviews manually per AC-34) |
| `bg-guardia-purple-900/60` violet tint reading too purple on light theme | Notion Branding Dark Mode subpage validates this exact shade for modal scrim use; ADR-010 references Notion as SoT; Fernando visual review at PR time confirms |
| Type errors from removing the `index.tsx` legacy default props        | Component stays 10-export; no consumer migration; `tsc --noEmit` runs in CI before commit |

## Tangential findings (per `lex-no-silent-tech-debt`)

During the architecture review, the following findings were identified OUTSIDE this PR's scope. Each is registered as a candidate for a follow-up Tech Task; NONE is silently fixed in this PR.

1. **`AlertDialog`, `Sheet`, `Drawer` all still use `bg-black/80`** (hex-equivalent overlay token, violates `lex-brand-colors`). Dialog's migration sets the precedent for the cleanup. Surfaced for human direction: option (b) — open a new Plan sub-issue under #60 OR (c) open a new parent Tech Task covering all three siblings. Decision left to Fernando post-PR.

2. **`Dialog.stories.tsx` (legacy 40-line shape) used `tags: ["autodocs"]` and `layout` was not set**. v0.1.0 DoD precedent (Popover/Tooltip) uses `parameters: { layout: "centered" }` + `tags: ["autodocs"]`. This PR adopts the v0.1.0 DoD precedent — NOT a finding, just noted.

No `# TODO(#NNN)` markers are left in code. No `## Out of scope (to revisit)` sections without trackable Issue.

## Next phase

Gate 1 — Scope. Auto-approve criterion (per Fernando standing instruction 1): proposed PR scope MATCHES the FULL Plan #61 DoD checklist as expanded by 02-requirements.md's 35 ACs and this Phase 3's component/file map. The 13 DoD bullets from Plan #61 are covered 1-for-1; no narrower subset, no scope drop.

→ Gate 1 result: **AUTO-APPROVED** (recorded inline below).
