import * as React from "react";
import * as LabelPrimitive from "@radix-ui/react-label";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

/**
 * Label — rótulo de campo de formulário.
 *
 * Base: primitivo do Radix (`<label>` acessível, clique ativa input associado).
 *
 * Features:
 *   required  → asterisco vermelho (decorativo, `aria-hidden`)
 *   optional  → sufixo "(opcional)" em tom sutil
 *   size      → "sm" (default) · "md"
 *
 * Sempre use `htmlFor` apontando para o `id` do input controlado.
 */
const labelVariants = cva(
  [
    "inline-flex items-center gap-1.5",
    "text-foreground font-semibold leading-none",
    "peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
  ].join(" "),
  {
    variants: {
      size: {
        sm: "text-[12.5px]",
        md: "text-sm",
      },
    },
    defaultVariants: {
      size: "sm",
    },
  },
);

type LabelBaseProps = React.ComponentPropsWithoutRef<
  typeof LabelPrimitive.Root
>;

export interface LabelProps
  extends LabelBaseProps,
    VariantProps<typeof labelVariants> {
  /** Adiciona asterisco vermelho decorativo. */
  required?: boolean;
  /** Adiciona sufixo "(opcional)" em cinza. */
  optional?: boolean;
  /** Texto customizado para o sufixo opcional. */
  optionalLabel?: string;
}

const Label = React.forwardRef<
  React.ElementRef<typeof LabelPrimitive.Root>,
  LabelProps
>(
  (
    {
      className,
      size,
      required = false,
      optional = false,
      optionalLabel = "(opcional)",
      children,
      ...props
    },
    ref,
  ) => (
    <LabelPrimitive.Root
      ref={ref}
      data-slot="label"
      data-required={required || undefined}
      data-optional={optional || undefined}
      className={cn(labelVariants({ size }), className)}
      {...props}
    >
      <span>{children}</span>
      {required && (
        <span
          aria-hidden="true"
          className="text-destructive font-semibold"
        >
          *
        </span>
      )}
      {optional && (
        <span className="text-muted-foreground font-normal text-[11.5px]">
          {optionalLabel}
        </span>
      )}
    </LabelPrimitive.Root>
  ),
);
Label.displayName = "Label";

export { Label, labelVariants };
