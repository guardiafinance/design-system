import * as React from "react";
import * as SeparatorPrimitive from "@radix-ui/react-separator";
import { cva } from "class-variance-authority";

import { cn } from "@/lib/utils";

/**
 * Separator — divisor horizontal ou vertical.
 *
 * Variantes de aparência:
 *   solid  (default) → linha contínua 1px
 *   dashed           → traços 6px / gap 6px
 *   dotted           → pontos 2px / gap 3px
 *
 * Com `label`: texto centralizado entre duas linhas (horizontal only).
 * Semântica: decorative=false quando label presente (divisor de seção).
 */

/* Gradients para dashed/dotted via inline style (Tailwind não expõe repeating-linear-gradient) */
function dashedBg(direction: "right" | "bottom") {
  return `repeating-linear-gradient(to ${direction}, var(--border) 0 6px, transparent 6px 12px)`;
}
function dottedBg(direction: "right" | "bottom") {
  return `repeating-linear-gradient(to ${direction}, var(--border) 0 2px, transparent 2px 5px)`;
}

const lineVariants = cva("shrink-0 bg-border", {
  variants: {
    orientation: {
      horizontal: "h-px w-full",
      vertical: "h-full w-px self-stretch min-h-4",
    },
    appearance: {
      solid: "",
      dashed: "",
      dotted: "",
    },
  },
  defaultVariants: {
    orientation: "horizontal",
    appearance: "solid",
  },
});

export interface SeparatorProps
  extends React.ComponentPropsWithoutRef<typeof SeparatorPrimitive.Root> {
  /** Aparência da linha: solid (default) · dashed · dotted */
  appearance?: "solid" | "dashed" | "dotted";
  /** Texto centralizado entre dois traços (horizontal only). */
  label?: string;
}

const Separator = React.forwardRef<
  React.ElementRef<typeof SeparatorPrimitive.Root>,
  SeparatorProps
>(
  (
    {
      className,
      orientation = "horizontal",
      appearance = "solid",
      decorative,
      label,
      style,
      ...props
    },
    ref,
  ) => {
    const isDecorative = decorative ?? !label;

    /* Gradient bg para dashed/dotted */
    function gradientStyle(dir: "right" | "bottom"): React.CSSProperties {
      if (appearance === "dashed") return { background: dashedBg(dir) };
      if (appearance === "dotted") return { background: dottedBg(dir) };
      return {};
    }

    if (label) {
      return (
        <div
          role="separator"
          aria-orientation={orientation as "horizontal" | "vertical"}
          className={cn(
            "flex items-center gap-3",
            "text-muted-foreground text-[11px] font-semibold uppercase tracking-widest",
            className,
          )}
          style={style}
          {...(props as React.HTMLAttributes<HTMLDivElement>)}
        >
          <span
            className="h-px flex-1 bg-border"
            style={gradientStyle("right")}
          />
          <span className="shrink-0">{label}</span>
          <span
            className="h-px flex-1 bg-border"
            style={gradientStyle("right")}
          />
        </div>
      );
    }

    return (
      <SeparatorPrimitive.Root
        ref={ref}
        decorative={isDecorative}
        orientation={orientation}
        className={cn(
          lineVariants({ orientation, appearance }),
          className,
        )}
        style={{
          ...gradientStyle(orientation === "vertical" ? "bottom" : "right"),
          ...style,
        }}
        {...props}
      />
    );
  },
);
Separator.displayName = "Separator";

export { Separator };
