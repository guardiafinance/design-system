import * as React from "react";
import { X } from "lucide-react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

/**
 * Chip — item compacto para filtros, tags removíveis e seletores.
 *
 * Três modos (combinam):
 *  1. Filtro (toggle)    → passe `onSelect` + `selected`.
 *     Chip externo ganha `role="button"` + `aria-pressed`.
 *  2. Tag removível      → passe `onRemove`.
 *     Botão ×  nested com `aria-label="Remover"`.
 *  3. Só visual          → sem handlers, apenas como rótulo.
 *
 * Eixos:
 *   size  "sm" (default) · "md"
 *
 * Sempre renderiza um <span> externo. Quando `onSelect` está presente,
 * recebe `role="button"` + teclado (Enter/Space). Quando há `onRemove`,
 * um <button> nested trata o clique e não propaga para o chip.
 */
const chipVariants = cva(
  [
    "inline-flex items-center gap-1.5 whitespace-nowrap select-none",
    "rounded-full border transition-colors",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
    "disabled:pointer-events-none",
  ].join(" "),
  {
    variants: {
      size: {
        sm: "h-6 px-2.5 text-[12px] font-medium",
        md: "h-8 px-3 text-[13px] font-medium",
      },
      selected: {
        true: "bg-guardia-violet-500 border-guardia-violet-500 text-white hover:bg-guardia-violet-700 hover:border-guardia-violet-700",
        false:
          "bg-background border-border-strong text-foreground hover:bg-guardia-violet-100 hover:border-guardia-violet-500",
      },
      interactive: {
        true: "cursor-pointer",
        false: "cursor-default hover:bg-background hover:border-border-strong",
      },
      disabled: {
        true: "opacity-50 cursor-not-allowed",
        false: "",
      },
    },
    compoundVariants: [
      // Chip não-interativo e não selecionado → neutraliza hover
      {
        interactive: false,
        selected: false,
        className: "hover:bg-background hover:border-border-strong",
      },
    ],
    defaultVariants: {
      size: "sm",
      selected: false,
      interactive: false,
      disabled: false,
    },
  },
);

export interface ChipProps
  extends Omit<React.HTMLAttributes<HTMLSpanElement>, "onClick" | "onSelect">,
    Pick<VariantProps<typeof chipVariants>, "size"> {
  /** Estado selecionado. */
  selected?: boolean;
  /** Toggle handler — torna o chip interativo (role=button + teclado). */
  onSelect?: (next: boolean) => void;
  /** Remove handler — adiciona botão ×  no fim. */
  onRemove?: () => void;
  /** Desabilita seleção e remoção. */
  disabled?: boolean;
  /** Ícone antes do texto. */
  leadingIcon?: React.ReactNode;
}

const Chip = React.forwardRef<HTMLSpanElement, ChipProps>(
  (
    {
      className,
      size,
      selected = false,
      onSelect,
      onRemove,
      disabled = false,
      leadingIcon,
      children,
      onKeyDown,
      ...props
    },
    ref,
  ) => {
    const interactive = typeof onSelect === "function";

    const handleSelect = () => {
      if (disabled || !onSelect) return;
      onSelect(!selected);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLSpanElement>) => {
      onKeyDown?.(e);
      if (!interactive || disabled) return;
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        handleSelect();
      }
    };

    return (
      <span
        ref={ref}
        data-slot="chip"
        data-selected={selected || undefined}
        data-disabled={disabled || undefined}
        role={interactive ? "button" : undefined}
        tabIndex={interactive && !disabled ? 0 : undefined}
        aria-pressed={interactive ? selected : undefined}
        aria-disabled={disabled || undefined}
        onClick={interactive ? handleSelect : undefined}
        onKeyDown={handleKeyDown}
        className={cn(
          chipVariants({ size, selected, interactive, disabled }),
          "[&_svg]:pointer-events-none [&_svg]:size-3.5 [&_svg]:shrink-0",
          className,
        )}
        {...props}
      >
        {leadingIcon}
        <span>{children}</span>
        {onRemove && (
          <button
            type="button"
            aria-label="Remover"
            disabled={disabled}
            onClick={(e) => {
              e.stopPropagation();
              if (!disabled) onRemove();
            }}
            className={cn(
              "-mr-1 inline-flex size-4 items-center justify-center rounded-full transition-colors",
              "hover:bg-black/10",
              selected && "hover:bg-white/20",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              disabled && "cursor-not-allowed",
            )}
          >
            <X className="size-3" aria-hidden="true" />
          </button>
        )}
      </span>
    );
  },
);
Chip.displayName = "Chip";

export { Chip, chipVariants };
