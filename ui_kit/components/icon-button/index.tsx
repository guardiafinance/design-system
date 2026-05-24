import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

/**
 * IconButton — botão de ícone-único. Usado em toolbars, linhas de tabela,
 * headers compactos. `aria-label` (ou `aria-labelledby`) é obrigatório.
 *
 * Variantes (alinhadas com Button para consistência):
 *   default      → laranja (CTA)
 *   secondary    → violeta (autoridade)
 *   destructive  → vermelho
 *   outline      → borda
 *   ghost        → transparente (DEFAULT — padrão de toolbar)
 *
 * Tamanhos (28 / 36 / 44 — compactos):
 *   sm · md (default) · lg
 *
 * Shape:
 *   square (default) · circle
 *
 * Extras:
 *   loading → spinner substitui o ícone, `aria-busy="true"`, desabilita
 *   asChild → Radix Slot para virar <Link>, etc.
 */
const iconButtonVariants = cva(
  [
    "inline-flex items-center justify-center shrink-0",
    "border border-transparent transition-colors",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
    "disabled:pointer-events-none disabled:opacity-45",
    "data-[loading=true]:cursor-progress",
    "[&_svg]:pointer-events-none [&_svg]:shrink-0",
  ].join(" "),
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground hover:bg-primary/90",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/90",
        destructive:
          "bg-transparent text-destructive hover:bg-destructive/10",
        outline:
          "bg-background text-foreground border-border-strong hover:bg-bg-hover hover:border-action",
        ghost:
          "bg-transparent text-foreground hover:bg-bg-hover hover:text-action-hover",
      },
      size: {
        sm: "h-7 w-7 [&_svg]:size-3.5",
        md: "h-9 w-9 [&_svg]:size-4",
        lg: "h-11 w-11 [&_svg]:size-5",
      },
      shape: {
        square: "",
        circle: "rounded-full",
      },
    },
    compoundVariants: [
      { shape: "square", size: "sm", className: "rounded-sm" },
      { shape: "square", size: "md", className: "rounded-md" },
      { shape: "square", size: "lg", className: "rounded-lg" },
    ],
    defaultVariants: {
      variant: "ghost",
      size: "md",
      shape: "square",
    },
  },
);

/** Spinner acessível — respeita `prefers-reduced-motion`. */
const Spinner = ({ size }: { size?: "sm" | "md" | "lg" }) => {
  const dim = size === "sm" ? 14 : size === "lg" ? 20 : 16;
  return (
    <svg
      className="motion-safe:animate-spin"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
      width={dim}
      height={dim}
    >
      <circle cx="8" cy="8" r="6" stroke="currentColor" strokeOpacity="0.3" strokeWidth="2" />
      <path d="M14 8a6 6 0 0 0-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
};

export interface IconButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof iconButtonVariants> {
  asChild?: boolean;
  loading?: boolean;
}

const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  (
    {
      className,
      variant,
      size,
      shape,
      asChild = false,
      loading = false,
      disabled,
      children,
      ...props
    },
    ref,
  ) => {
    // A11y guardrail — IconButton não tem texto, precisa de rótulo acessível.
    if (
      process.env.NODE_ENV !== "production" &&
      !props["aria-label"] &&
      !props["aria-labelledby"]
    ) {
      // eslint-disable-next-line no-console
      console.warn(
        "[Guardia] <IconButton /> precisa de `aria-label` ou `aria-labelledby` para leitores de tela.",
      );
    }

    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        ref={ref}
        data-slot="icon-button"
        data-loading={loading || undefined}
        disabled={disabled || loading}
        aria-busy={loading || undefined}
        className={cn(iconButtonVariants({ variant, size, shape }), className)}
        {...props}
      >
        {loading ? <Spinner size={size ?? "md"} /> : children}
      </Comp>
    );
  },
);
IconButton.displayName = "IconButton";

export { IconButton, iconButtonVariants };
