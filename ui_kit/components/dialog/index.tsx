"use client";

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { cva, type VariantProps } from "class-variance-authority";
import { X } from "lucide-react";

import { cn } from "@/lib/utils";

/**
 * Dialog — modal centered overlay anchored to the viewport.
 *
 * For decisions with focus capture (destructive confirmations, short
 * forms, info dialogs, configuration panels). For inline anchored
 * pop content (filters, hints, mini-cards), prefer `<Popover>`; for
 * hover-driven microcopy, prefer `<Tooltip>`; for slide-from-edge
 * panels, prefer `<Sheet>` / `<Drawer>`.
 *
 * Base:
 *   Radix Dialog (focus-trap, scroll-lock via aria-hidden on outside
 *   content, Escape key, outside-click dismiss, `role="dialog"`,
 *   `aria-modal="true"`, `aria-labelledby`/`aria-describedby` wiring,
 *   SSR safety). This wrapper only adds:
 *   - Token contract (`bg-background` + `text-fg` +
 *     `border-border-strong` + `shadow-lg` + `ring-ring` + semantic
 *     overlay `bg-guardia-purple-900/60 dark:bg-guardia-gray-900/80`
 *     with `backdrop-blur-sm`).
 *   - CVA `size` variant on `DialogContent` (sm | md | lg | xl) that
 *     drives the modal WIDTH (`max-w-*`), NOT padding — Popover and
 *     Tooltip use a padding ladder because they are inline overlays
 *     anchored to a trigger; Dialog is a viewport-centered modal so
 *     its natural sizing constraint is width. See ADR-010 Decision 2.
 *   - `width` prop on `DialogContent` for fine-grained override of
 *     the variant `max-w-*` — same escape-hatch pattern as Popover's
 *     `width` prop (ADR-005 Decision 5).
 *   - Canonical close button affixed top-right of the content
 *     (consistent with the Notion-canonical modal pattern).
 *
 * Exports (10 components + 1 CVA accessor + 2 types):
 *   Dialog, DialogTrigger, DialogPortal, DialogOverlay, DialogContent,
 *   DialogHeader, DialogFooter, DialogTitle, DialogDescription,
 *   DialogClose
 *   dialogContentVariants
 *   DialogContentProps, DialogContentSize
 *
 * Decisions recorded in
 * `docs/adr/ADR-010-dialog-v0.1.0-dod-migration.md`.
 */

// ──────────────────────────────────────────────────────────────────
// Root + passthroughs
// ──────────────────────────────────────────────────────────────────

const Dialog = DialogPrimitive.Root;

const DialogTrigger = DialogPrimitive.Trigger;

const DialogPortal = DialogPrimitive.Portal;

const DialogClose = DialogPrimitive.Close;

// ──────────────────────────────────────────────────────────────────
// DialogOverlay
// ──────────────────────────────────────────────────────────────────

const DialogOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      // Position + stacking
      "fixed inset-0 z-50",
      // Semantic overlay token (Notion-canonical brand palette,
      // theme-aware). Replaces the legacy `bg-black/80` hex-equivalent.
      "bg-guardia-purple-900/60 dark:bg-guardia-gray-900/80",
      // Modern modal scrim guideline (Notion Branding Dark Mode)
      "backdrop-blur-sm",
      // Data-state-driven animation (mirrors Popover/Tooltip recipe)
      "data-[state=open]:animate-in data-[state=closed]:animate-out",
      "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className,
    )}
    {...props}
  />
));
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName;

// ──────────────────────────────────────────────────────────────────
// CVA variants — size ladder aligned with modal widths
// ──────────────────────────────────────────────────────────────────

/**
 * CVA accessor exported for consumers that want to compose variants
 * (e.g., wrapping `DialogContent` in a higher-order modal in product
 * code). Mirrors the Popover/Tooltip CVA pattern but the `size` rung
 * means WIDTH, not padding — see ADR-010 Decision 2.
 *
 * Width rung (mirrors legacy reference width budget + adds `xl`):
 *   sm = max-w-sm   (24rem ≈ 384px)  — small confirmations
 *   md = max-w-lg   (32rem ≈ 512px)  — default; close to legacy 520px
 *   lg = max-w-2xl  (42rem ≈ 672px)  — dense forms; close to legacy 720px
 *   xl = max-w-4xl  (56rem ≈ 896px)  — data-grid panels (new)
 */
const dialogContentVariants = cva(
  [
    // Position centered + grid layout
    "fixed left-1/2 top-1/2 z-50 grid w-full -translate-x-1/2 -translate-y-1/2 gap-4",
    // Token contract — semantic palette only
    "border border-border-strong bg-background text-fg",
    "shadow-lg ring-1 ring-ring/5",
    "rounded-lg p-6",
    // Animation
    "duration-200",
    "data-[state=open]:animate-in data-[state=closed]:animate-out",
    "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
    "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
    "data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%]",
    "data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]",
    // Focus management — Radix handles focus-trap; this is the
    // visible focus ring when the content itself receives focus
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
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

// ──────────────────────────────────────────────────────────────────
// DialogContent
// ──────────────────────────────────────────────────────────────────

export interface DialogContentProps
  extends Omit<
      React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>,
      "asChild"
    >,
    VariantProps<typeof dialogContentVariants> {
  /**
   * Override the CVA `size`'s `max-w-*` class with an explicit width.
   * Number values are emitted as `px`; string values are forwarded as-is
   * (supports any CSS dimension — `min()`, `clamp()`, `vw`, `rem`).
   *
   * When `width` is present, it is applied as `style.maxWidth` AND the
   * CVA `size`'s `max-w-*` utility is still present in the className
   * — `style.maxWidth` wins by CSS specificity. This matches Popover's
   * `width` prop (ADR-005 Decision 5).
   */
  width?: number | string;
}

const DialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  DialogContentProps
>(
  (
    { className, children, size = "md", width, style, ...props },
    ref,
  ) => {
    const widthStyle: React.CSSProperties | undefined =
      width !== undefined
        ? {
            ...style,
            maxWidth: typeof width === "number" ? `${width}px` : width,
          }
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
            aria-label="Close"
            className={cn(
              "absolute right-4 top-4",
              "inline-flex h-6 w-6 items-center justify-center",
              "rounded-sm text-fg-muted opacity-70 transition-opacity",
              "hover:bg-bg-hover hover:opacity-100",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
              "disabled:pointer-events-none",
            )}
          >
            <X className="h-4 w-4" aria-hidden="true" />
            <span className="sr-only">Close</span>
          </DialogPrimitive.Close>
        </DialogPrimitive.Content>
      </DialogPortal>
    );
  },
);
DialogContent.displayName = DialogPrimitive.Content.displayName;

// ──────────────────────────────────────────────────────────────────
// DialogHeader / DialogFooter — layout primitives (no Radix root)
// ──────────────────────────────────────────────────────────────────

const DialogHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn("flex flex-col gap-1.5 text-left", className)}
    {...props}
  />
);
DialogHeader.displayName = "DialogHeader";

const DialogFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col-reverse gap-2 sm:flex-row sm:justify-end",
      className,
    )}
    {...props}
  />
);
DialogFooter.displayName = "DialogFooter";

// ──────────────────────────────────────────────────────────────────
// DialogTitle / DialogDescription
// ──────────────────────────────────────────────────────────────────

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

// ──────────────────────────────────────────────────────────────────
// Exports
// ──────────────────────────────────────────────────────────────────

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
