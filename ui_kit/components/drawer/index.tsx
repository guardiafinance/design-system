"use client";

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { cva, type VariantProps } from "class-variance-authority";
import { X } from "lucide-react";

import { cn } from "@/lib/utils";

/**
 * Drawer — modal side-panel overlay anchored to an edge of the viewport.
 *
 * For secondary contexts that should keep the main surface in view —
 * filters, secondary forms, detail panels, notification trays. For
 * viewport-centered modals (destructive confirmations, short forms,
 * info dialogs), prefer `<Dialog>`; for inline anchored pop content
 * (filters, hints, mini-cards), prefer `<Popover>`; for hover-driven
 * microcopy, prefer `<Tooltip>`.
 *
 * Base:
 *   Radix Dialog (focus-trap, scroll-lock via aria-hidden on outside
 *   content, Escape key, outside-click dismiss, `role="dialog"`,
 *   `aria-modal="true"`, `aria-labelledby`/`aria-describedby` wiring,
 *   SSR safety). This wrapper only adds:
 *   - Token contract (`bg-background` + `text-fg` + side-specific
 *     border + `shadow-lg` + semantic overlay
 *     `bg-guardia-purple-900/60 dark:bg-guardia-gray-900/80` with
 *     `backdrop-blur-sm`).
 *   - CVA `side` variant (top | right | bottom | left) — positions
 *     the panel against an edge of the viewport, default `right`.
 *   - CVA `size` variant (sm | md | lg | xl) that drives `max-w-*`
 *     for horizontal sides and `max-h-*` for vertical sides. Mirrors
 *     Dialog's width budget; the dimension axis depends on `side`.
 *     See ADR-012 Decision 4.
 *   - `width` prop on `DrawerContent` for fine-grained override of
 *     the variant `max-w-*` (only takes effect on `side`
 *     `left`/`right`); `height` prop overrides `max-h-*` (only on
 *     `top`/`bottom`). Same escape-hatch pattern as Dialog's `width`
 *     prop (ADR-010 Decision 3) and Popover's (ADR-005 Decision 5).
 *   - Canonical close button affixed top-right of the content
 *     (consistent with the Notion-canonical modal pattern).
 *
 * Consolidates the legacy Sheet baseline under the canonical Drawer
 * name (ADR-012 Decision 1, mirrors ADR-006 Menu consolidation).
 *
 * Exports (10 components + 1 CVA accessor + 3 types):
 *   Drawer, DrawerTrigger, DrawerPortal, DrawerOverlay, DrawerContent,
 *   DrawerHeader, DrawerFooter, DrawerTitle, DrawerDescription,
 *   DrawerClose
 *   drawerContentVariants
 *   DrawerContentProps, DrawerContentSide, DrawerContentSize
 *
 * Decisions recorded in
 * `docs/adr/ADR-012-drawer-v0.1.0-dod-migration.md`.
 */

// ──────────────────────────────────────────────────────────────────
// Root + passthroughs
// ──────────────────────────────────────────────────────────────────

const Drawer = DialogPrimitive.Root;

const DrawerTrigger = DialogPrimitive.Trigger;

const DrawerPortal = DialogPrimitive.Portal;

const DrawerClose = DialogPrimitive.Close;

// ──────────────────────────────────────────────────────────────────
// DrawerOverlay
// ──────────────────────────────────────────────────────────────────

const DrawerOverlay = React.forwardRef<
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
      // Mirrors Dialog ADR-010 Decision 4.
      "bg-guardia-purple-900/60 dark:bg-guardia-gray-900/80",
      // Modern modal scrim guideline (Notion Branding Dark Mode)
      "backdrop-blur-sm",
      // Data-state-driven animation
      "data-[state=open]:animate-in data-[state=closed]:animate-out",
      "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className,
    )}
    {...props}
  />
));
DrawerOverlay.displayName = DialogPrimitive.Overlay.displayName;

// ──────────────────────────────────────────────────────────────────
// CVA variants — side × size matrix
// ──────────────────────────────────────────────────────────────────

/**
 * CVA accessor exported for consumers that want to compose variants
 * (e.g., wrapping `DrawerContent` in a higher-order drawer in product
 * code). The `side` rung positions the panel against an edge of the
 * viewport; the `size` rung drives the dimension perpendicular to the
 * slide direction — see ADR-012 Decision 4.
 *
 * Size rung (mirrors Dialog ADR-010 width budget exactly):
 *   sm = 24rem ≈ 384 px   — narrow side panels
 *   md = 32rem ≈ 512 px   — default; matches Dialog `md`
 *   lg = 42rem ≈ 672 px   — dense forms
 *   xl = 56rem ≈ 896 px   — data-grid panels
 *
 * For horizontal sides (left/right), `size` resolves to `max-w-*`;
 * for vertical sides (top/bottom), `size` resolves to `max-h-*`.
 */
const drawerContentVariants = cva(
  [
    // Base — fixed positioning, layered above overlay, semantic
    // background + foreground tokens, shadow scale.
    "fixed z-50 flex flex-col",
    "bg-background text-fg shadow-lg",
    // Animation — duration + state-driven fade are shared across
    // sides. Slide direction varies per `side` via the variant body.
    "transition ease-in-out",
    "data-[state=open]:animate-in data-[state=closed]:animate-out",
    "data-[state=closed]:duration-300 data-[state=open]:duration-500",
    // Focus management — Radix handles focus-trap; this is the
    // visible focus ring when the content itself receives focus.
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
  ].join(" "),
  {
    variants: {
      side: {
        right: [
          "inset-y-0 right-0 h-full w-3/4 sm:w-full",
          "border-l border-border-strong",
          "data-[state=closed]:slide-out-to-right",
          "data-[state=open]:slide-in-from-right",
        ].join(" "),
        left: [
          "inset-y-0 left-0 h-full w-3/4 sm:w-full",
          "border-r border-border-strong",
          "data-[state=closed]:slide-out-to-left",
          "data-[state=open]:slide-in-from-left",
        ].join(" "),
        top: [
          "inset-x-0 top-0 w-full",
          "border-b border-border-strong",
          "data-[state=closed]:slide-out-to-top",
          "data-[state=open]:slide-in-from-top",
        ].join(" "),
        bottom: [
          "inset-x-0 bottom-0 w-full",
          "border-t border-border-strong",
          "data-[state=closed]:slide-out-to-bottom",
          "data-[state=open]:slide-in-from-bottom",
        ].join(" "),
      },
      size: {
        sm: "",
        md: "",
        lg: "",
        xl: "",
      },
    },
    // Compound variants — the same `size` rung resolves to
    // `max-w-*` on horizontal sides and `max-h-*` on vertical sides.
    compoundVariants: [
      // Horizontal — size drives max-width (applied at sm: breakpoint
      // so the mobile w-3/4 default keeps narrow drawers responsive).
      { side: "right", size: "sm", className: "sm:max-w-sm" },
      { side: "right", size: "md", className: "sm:max-w-lg" },
      { side: "right", size: "lg", className: "sm:max-w-2xl" },
      { side: "right", size: "xl", className: "sm:max-w-4xl" },
      { side: "left", size: "sm", className: "sm:max-w-sm" },
      { side: "left", size: "md", className: "sm:max-w-lg" },
      { side: "left", size: "lg", className: "sm:max-w-2xl" },
      { side: "left", size: "xl", className: "sm:max-w-4xl" },
      // Vertical — size drives max-height (arbitrary values keep the
      // numeric ladder identical to the horizontal max-w-* values).
      { side: "top", size: "sm", className: "max-h-[24rem]" },
      { side: "top", size: "md", className: "max-h-[32rem]" },
      { side: "top", size: "lg", className: "max-h-[42rem]" },
      { side: "top", size: "xl", className: "max-h-[56rem]" },
      { side: "bottom", size: "sm", className: "max-h-[24rem]" },
      { side: "bottom", size: "md", className: "max-h-[32rem]" },
      { side: "bottom", size: "lg", className: "max-h-[42rem]" },
      { side: "bottom", size: "xl", className: "max-h-[56rem]" },
    ],
    defaultVariants: { side: "right", size: "md" },
  },
);

export type DrawerContentSide = NonNullable<
  VariantProps<typeof drawerContentVariants>["side"]
>;

export type DrawerContentSize = NonNullable<
  VariantProps<typeof drawerContentVariants>["size"]
>;

// ──────────────────────────────────────────────────────────────────
// DrawerContent
// ──────────────────────────────────────────────────────────────────

export interface DrawerContentProps
  extends Omit<
      React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>,
      "asChild"
    >,
    VariantProps<typeof drawerContentVariants> {
  /**
   * Override the CVA `size`'s `max-w-*` class with an explicit width.
   * Only takes effect when `side` is `"left"` or `"right"` (horizontal
   * drawers). Number values are emitted as `px`; string values are
   * forwarded as-is (supports any CSS dimension — `min()`, `clamp()`,
   * `vw`, `rem`).
   *
   * When `width` is present and `side` is horizontal, it is applied as
   * `style.maxWidth` — CSS specificity overrides the CVA `max-w-*`
   * utility. Matches Dialog's `width` prop (ADR-010 Decision 3).
   */
  width?: number | string;
  /**
   * Override the CVA `size`'s `max-h-*` class with an explicit height.
   * Only takes effect when `side` is `"top"` or `"bottom"` (vertical
   * drawers). Number values are emitted as `px`; string values are
   * forwarded as-is.
   *
   * When `height` is present and `side` is vertical, it is applied as
   * `style.maxHeight` — CSS specificity overrides the CVA `max-h-*`
   * utility. Mirrors `width` for the vertical axis.
   */
  height?: number | string;
}

const HORIZONTAL_SIDES: ReadonlySet<DrawerContentSide> = new Set([
  "left",
  "right",
]);

const VERTICAL_SIDES: ReadonlySet<DrawerContentSide> = new Set([
  "top",
  "bottom",
]);

const DrawerContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  DrawerContentProps
>(
  (
    {
      className,
      children,
      side = "right",
      size = "md",
      width,
      height,
      style,
      ...props
    },
    ref,
  ) => {
    // VariantProps widen the unions with `null`; narrow defensively so
    // the Set membership checks below match the strictly non-null type.
    const resolvedSide: DrawerContentSide = side ?? "right";
    const resolvedSize: DrawerContentSize = size ?? "md";

    const composedStyle: React.CSSProperties | undefined = React.useMemo(() => {
      const base: React.CSSProperties = { ...(style ?? {}) };
      if (width !== undefined && HORIZONTAL_SIDES.has(resolvedSide)) {
        base.maxWidth = typeof width === "number" ? `${width}px` : width;
      }
      if (height !== undefined && VERTICAL_SIDES.has(resolvedSide)) {
        base.maxHeight = typeof height === "number" ? `${height}px` : height;
      }
      // Return the original `style` unchanged when no override was
      // applied to preserve referential equality.
      return Object.keys(base).length > 0 ? base : style;
    }, [style, width, height, resolvedSide]);

    return (
      <DrawerPortal>
        <DrawerOverlay />
        <DialogPrimitive.Content
          ref={ref}
          style={composedStyle}
          className={cn(
            drawerContentVariants({ side: resolvedSide, size: resolvedSize }),
            className,
          )}
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
      </DrawerPortal>
    );
  },
);
DrawerContent.displayName = DialogPrimitive.Content.displayName;

// ──────────────────────────────────────────────────────────────────
// DrawerHeader / DrawerFooter — layout primitives (no Radix root)
// ──────────────────────────────────────────────────────────────────

const DrawerHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col gap-1.5 px-6 pt-6 pb-2 text-left",
      className,
    )}
    {...props}
  />
);
DrawerHeader.displayName = "DrawerHeader";

const DrawerFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "mt-auto flex flex-col-reverse gap-2 px-6 pt-2 pb-6 sm:flex-row sm:justify-end",
      className,
    )}
    {...props}
  />
);
DrawerFooter.displayName = "DrawerFooter";

// ──────────────────────────────────────────────────────────────────
// DrawerTitle / DrawerDescription
// ──────────────────────────────────────────────────────────────────

const DrawerTitle = React.forwardRef<
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
DrawerTitle.displayName = DialogPrimitive.Title.displayName;

const DrawerDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn("text-sm text-fg-muted", className)}
    {...props}
  />
));
DrawerDescription.displayName = DialogPrimitive.Description.displayName;

// ──────────────────────────────────────────────────────────────────
// Exports
// ──────────────────────────────────────────────────────────────────

export {
  Drawer,
  DrawerPortal,
  DrawerOverlay,
  DrawerClose,
  DrawerTrigger,
  DrawerContent,
  DrawerHeader,
  DrawerFooter,
  DrawerTitle,
  DrawerDescription,
  drawerContentVariants,
};
