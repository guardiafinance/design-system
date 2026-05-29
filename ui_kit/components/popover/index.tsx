"use client";

import * as React from "react";
import * as PopoverPrimitive from "@radix-ui/react-popover";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

/**
 * Popover — pop flutuante ancorado por clique.
 *
 * Para conteúdo pequeno acionado: filtros, forms compactos, hints
 * acionáveis, mini-cards. Para diálogos modais cheios, prefira
 * `<Dialog>`; para hover-driven information, prefira `<Tooltip>`
 * ou `<HoverCard>`; para listas longas com busca, prefira
 * `<Combobox>` (que já consome Radix Popover internamente).
 *
 * Base:
 *   Radix Popover (positioning, outside click, Escape, focus
 *   management, focus-trap, ARIA dialog). Esta wrapper só adiciona:
 *   - Token contract (`bg-background`, `text-fg`, `border-border-strong`,
 *     `shadow-md|lg`, `ring-ring`, `rounded-md|lg`).
 *   - CVA `size` variant em `PopoverContent` (sm | md | lg).
 *   - `width` prop em `PopoverContent` para override do tamanho fixo.
 *   - Re-export de `PopoverAnchor` e `PopoverClose` para preservar
 *     o token contract caso o consumidor precise das primitivas
 *     Radix (anchor desacoplado, close from inside content).
 *
 * Exports (5 componentes + 1 CVA accessor + 2 types):
 *   Popover, PopoverTrigger, PopoverAnchor, PopoverContent, PopoverClose
 *   popoverContentVariants
 *   PopoverContentProps, PopoverContentSize
 *
 * Decisões registradas em
 * `docs/adr/ADR-005-popover-api-shape-and-token-alignment.md`.
 */

// ──────────────────────────────────────────────────────────────────
// Root + passthroughs
// ──────────────────────────────────────────────────────────────────

const Popover = PopoverPrimitive.Root;

const PopoverTrigger = PopoverPrimitive.Trigger;

const PopoverAnchor = PopoverPrimitive.Anchor;

const PopoverClose = PopoverPrimitive.Close;

// ──────────────────────────────────────────────────────────────────
// CVA variants — size ladder aligned with Combobox/Select
// ──────────────────────────────────────────────────────────────────

/**
 * CVA accessor exportado para consumidores que queiram compor
 * variantes (e.g., wrapping `PopoverContent` em um higher-order
 * componente do produto).
 */
const popoverContentVariants = cva(
  [
    // Layout base
    "z-50 outline-none",
    "border border-border-strong",
    "bg-background text-fg",
    // Focus ring quando o content recebe foco via teclado
    "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
    // Origin para a animação de zoom (Radix expõe a transform-origin via CSS var)
    "origin-[--radix-popover-content-transform-origin]",
    // Animação data-state driven (mesmo pattern de Combobox/Select/DropdownMenu)
    "data-[state=open]:animate-in data-[state=closed]:animate-out",
    "data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0",
    "data-[state=open]:zoom-in-95 data-[state=closed]:zoom-out-95",
    "data-[side=bottom]:slide-in-from-top-2",
    "data-[side=left]:slide-in-from-right-2",
    "data-[side=right]:slide-in-from-left-2",
    "data-[side=top]:slide-in-from-bottom-2",
  ].join(" "),
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

export type PopoverContentSize = NonNullable<
  VariantProps<typeof popoverContentVariants>["size"]
>;

// ──────────────────────────────────────────────────────────────────
// PopoverContent
// ──────────────────────────────────────────────────────────────────

export interface PopoverContentProps
  extends Omit<
      React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Content>,
      "asChild"
    >,
    VariantProps<typeof popoverContentVariants> {
  /**
   * Largura fixa do content. Quando omitido, o content usa `w-72`
   * (18rem ≈ 288px) — equivalente ao baseline atual e à largura
   * default das overlays irmãs (Combobox, Select).
   */
  width?: number | string;
}

const DEFAULT_WIDTH_CLASS = "w-72";

const PopoverContent = React.forwardRef<
  React.ElementRef<typeof PopoverPrimitive.Content>,
  PopoverContentProps
>(
  (
    {
      className,
      align = "center",
      sideOffset = 4,
      size = "md",
      width,
      style,
      ...props
    },
    ref,
  ) => {
    const widthStyle: React.CSSProperties | undefined =
      width !== undefined
        ? { ...style, width: typeof width === "number" ? `${width}px` : width }
        : style;

    return (
      <PopoverPrimitive.Portal>
        <PopoverPrimitive.Content
          ref={ref}
          align={align}
          sideOffset={sideOffset}
          style={widthStyle}
          className={cn(
            popoverContentVariants({ size }),
            // Default width when consumer didn't override
            width === undefined && DEFAULT_WIDTH_CLASS,
            className,
          )}
          {...props}
        />
      </PopoverPrimitive.Portal>
    );
  },
);
PopoverContent.displayName = PopoverPrimitive.Content.displayName;

// ──────────────────────────────────────────────────────────────────
// Exports
// ──────────────────────────────────────────────────────────────────

export {
  Popover,
  PopoverTrigger,
  PopoverAnchor,
  PopoverContent,
  PopoverClose,
  popoverContentVariants,
};
