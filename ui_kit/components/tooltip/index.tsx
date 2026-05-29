"use client";

import * as React from "react";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

/**
 * Tooltip — hint flutuante acionado por hover ou foco.
 *
 * Para microcopy contextual (atalhos de teclado, descrição curta de
 * ícone, esclarecimento de campo). Para conteúdo acionável (form
 * compacto, lista filtrável), prefira `<Popover>`. Para hover-driven
 * content rico com link/botão, prefira `<Popover>` orquestrado por
 * `onMouseEnter` (HoverCard ainda não existe no v0.1.0).
 *
 * Base:
 *   Radix Tooltip (positioning, hover/focus triggers, delay groups,
 *   role="tooltip", aria-describedby wiring). Esta wrapper só
 *   adiciona:
 *   - Token contract (`bg-background`, `text-fg`,
 *     `border-border-strong`, `shadow-md`, `ring-ring`).
 *   - CVA `size` variant em `TooltipContent` (sm | md | lg).
 *   - Arrow visível por default com `fill-background` +
 *     `stroke-border-strong`, suprimível via `withArrow={false}`.
 *   - Provider implícito: `<Tooltip>` sempre monta um
 *     `<TooltipPrimitive.Provider>` carregando `delayDuration`,
 *     `skipDelayDuration` e `disableHoverableContent` do consumidor.
 *     Consumidores avançados (grupos de tooltips com delays
 *     compartilhados) podem embrulhar manualmente com
 *     `TooltipPrimitive.Provider` ancestral; Radix tolera providers
 *     aninhados — o inner vence para o descendente.
 *
 * Exports (3 componentes + 1 CVA accessor + 2 types):
 *   Tooltip, TooltipTrigger, TooltipContent
 *   tooltipContentVariants
 *   TooltipContentProps, TooltipContentSize
 *
 * Decisões registradas em
 * `docs/adr/ADR-007-tooltip-v0.1.0-dod-migration.md`.
 */

// ──────────────────────────────────────────────────────────────────
// Root + passthroughs
// ──────────────────────────────────────────────────────────────────

/**
 * Default Radix delays. Exposed as constants so unit tests can assert
 * that the Provider is mounted with the documented baseline when no
 * override is supplied, and so consumers can opt into the exact same
 * values explicitly.
 */
const DEFAULT_DELAY_DURATION = 700;
const DEFAULT_SKIP_DELAY_DURATION = 300;

export interface TooltipProps
  extends React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Root> {
  /**
   * Duration (ms) the cursor must rest on the trigger before the
   * tooltip opens. Forwarded both to the implicit Provider and to the
   * Radix Root, matching Radix's documented support on both surfaces.
   * Default: `700` (Radix default).
   */
  delayDuration?: number;
  /**
   * Duration (ms) during which a follow-up tooltip in the same
   * Provider opens without the full `delayDuration`. Forwarded to the
   * implicit Provider. Default: `300` (Radix default).
   */
  skipDelayDuration?: number;
  /**
   * When `true`, the content is unmounted as soon as the pointer
   * leaves the trigger — preventing the user from interacting with
   * the content. Forwarded to the implicit Provider and to the Root.
   * Default: `false`.
   */
  disableHoverableContent?: boolean;
}

const Tooltip = ({
  delayDuration = DEFAULT_DELAY_DURATION,
  skipDelayDuration = DEFAULT_SKIP_DELAY_DURATION,
  disableHoverableContent,
  ...rootProps
}: TooltipProps) => (
  <TooltipPrimitive.Provider
    delayDuration={delayDuration}
    skipDelayDuration={skipDelayDuration}
    disableHoverableContent={disableHoverableContent}
  >
    <TooltipPrimitive.Root
      delayDuration={delayDuration}
      disableHoverableContent={disableHoverableContent}
      {...rootProps}
    />
  </TooltipPrimitive.Provider>
);

const TooltipTrigger = TooltipPrimitive.Trigger;

// ──────────────────────────────────────────────────────────────────
// CVA variants — size ladder aligned with Popover
// ──────────────────────────────────────────────────────────────────

/**
 * CVA accessor exported so consumers can compose variants (e.g.,
 * higher-order tooltip in product code). Mirrors the Popover ladder
 * with a two-rung typography (`text-xs` for `sm`, `text-sm` for `md`
 * and `lg`). Tooltip max-width is constrained by content and portal,
 * so bumping `lg` to `text-base` would harm readability — see ADR-007.
 */
const tooltipContentVariants = cva(
  [
    // Layout base
    "z-50 max-w-xs overflow-hidden outline-none",
    "rounded-md border border-border-strong",
    "bg-background text-fg",
    "shadow-md ring-1 ring-ring/5",
    // Origin for the zoom animation (Radix exposes transform-origin via CSS var)
    "origin-[--radix-tooltip-content-transform-origin]",
    // Data-state-driven animation (same pattern as Popover / Combobox)
    "data-[state=delayed-open]:animate-in data-[state=closed]:animate-out",
    "data-[state=delayed-open]:fade-in-0 data-[state=closed]:fade-out-0",
    "data-[state=delayed-open]:zoom-in-95 data-[state=closed]:zoom-out-95",
    "data-[state=instant-open]:animate-in data-[state=instant-open]:fade-in-0 data-[state=instant-open]:zoom-in-95",
    "data-[side=bottom]:slide-in-from-top-1",
    "data-[side=left]:slide-in-from-right-1",
    "data-[side=right]:slide-in-from-left-1",
    "data-[side=top]:slide-in-from-bottom-1",
  ].join(" "),
  {
    variants: {
      size: {
        sm: "p-2 gap-2 text-xs",
        md: "p-3 gap-3 text-sm",
        lg: "p-4 gap-4 text-sm",
      },
    },
    defaultVariants: { size: "md" },
  },
);

export type TooltipContentSize = NonNullable<
  VariantProps<typeof tooltipContentVariants>["size"]
>;

// ──────────────────────────────────────────────────────────────────
// TooltipContent
// ──────────────────────────────────────────────────────────────────

export interface TooltipContentProps
  extends Omit<
      React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content>,
      "asChild"
    >,
    VariantProps<typeof tooltipContentVariants> {
  /**
   * Render Radix's `Tooltip.Arrow` as a child of the content. Default
   * `true`. The arrow consumes semantic tokens only
   * (`fill-background` + `stroke-border-strong`).
   */
  withArrow?: boolean;
}

const TooltipContent = React.forwardRef<
  React.ElementRef<typeof TooltipPrimitive.Content>,
  TooltipContentProps
>(
  (
    {
      className,
      sideOffset = 4,
      size = "md",
      withArrow = true,
      children,
      ...props
    },
    ref,
  ) => (
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Content
        ref={ref}
        sideOffset={sideOffset}
        className={cn(tooltipContentVariants({ size }), className)}
        {...props}
      >
        {children}
        {withArrow && (
          <TooltipPrimitive.Arrow
            width={11}
            height={5}
            className="fill-background stroke-border-strong [stroke-width:1]"
          />
        )}
      </TooltipPrimitive.Content>
    </TooltipPrimitive.Portal>
  ),
);
TooltipContent.displayName = TooltipPrimitive.Content.displayName;

// ──────────────────────────────────────────────────────────────────
// Group-level Provider (alias for Radix's Provider)
// ──────────────────────────────────────────────────────────────────

/**
 * Re-export of `@radix-ui/react-tooltip` `Provider` for consumers that
 * need to share `delayDuration` / `skipDelayDuration` across a group
 * of tooltips (e.g., the Sidebar lighting up multiple hint tooltips
 * with the same fast delay). When this is omitted, every `<Tooltip>`
 * mounts its own implicit Provider with the documented defaults
 * (`700ms` / `300ms`); when present as an ancestor, descendant
 * tooltips inherit its values per Radix's Provider semantics.
 *
 * The plain `<Tooltip>` wrapper is the canonical entry point — this
 * Provider is the escape hatch for grouped tooltip rhythm tuning.
 */
const TooltipProvider = TooltipPrimitive.Provider;

// ──────────────────────────────────────────────────────────────────
// Exports
// ──────────────────────────────────────────────────────────────────

export {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
  tooltipContentVariants,
};
