"use client";

import * as React from "react";
import * as RadioGroupPrimitive from "@radix-ui/react-radio-group";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

/**
 * Radio + RadioGroup — seleção única dentro de um grupo.
 *
 * Compound:
 *   <RadioGroup name="freq" defaultValue="daily" onValueChange={…}>
 *     <Radio value="now"   label="Imediato"  description="…" />
 *     <Radio value="daily" label="Diário"    description="…" />
 *     <Radio value="weekly" label="Semanal"   description="…" />
 *   </RadioGroup>
 *
 * Base no Radix Radio Group — keyboard nav (↑↓ + Tab para sair),
 * aria-checked, focus management, anúncio do grupo via role="radiogroup".
 *
 * Sizes (wip parity):
 *   sm → mark 16px, label 13px
 *   md → mark 18px, label 14px (default)
 *
 * Use `<Radio label="…">` para a composição padrão (label + description),
 * ou passe só `value` e wrappar em `<Label htmlFor>` externo.
 *
 * Acessibilidade:
 *   - aria-invalid=true quando `invalid`
 *   - aria-describedby liga ao texto da description
 *   - foco visual via box-shadow no mark, mantendo o input sr-only
 */

/* ============ RadioGroup ============ */

export interface RadioGroupProps
  extends React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Root> {
  /** Direção dos radios. Default vertical (column). */
  orientation?: "horizontal" | "vertical";
  /** Gap em px ou número (default: 10px). */
  gap?: number;
}

const RadioGroup = React.forwardRef<
  React.ElementRef<typeof RadioGroupPrimitive.Root>,
  RadioGroupProps
>(({ className, orientation = "vertical", gap = 10, style, ...rest }, ref) => {
  return (
    <RadioGroupPrimitive.Root
      ref={ref}
      orientation={orientation}
      className={cn(
        "flex",
        orientation === "horizontal" ? "flex-row" : "flex-col",
        className,
      )}
      style={{ gap, ...style }}
      {...rest}
    />
  );
});
RadioGroup.displayName = "RadioGroup";

/* ============ Radio ============ */

const markVariants = cva(
  [
    "peer shrink-0 inline-flex items-center justify-center",
    "rounded-full border-[1.5px] bg-background",
    "border-border-strong",
    "transition-[background-color,border-color,box-shadow] duration-150",
    "hover:border-action",
    "data-[state=checked]:border-action",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
    "aria-[invalid=true]:border-destructive aria-[invalid=true]:hover:border-destructive",
    "disabled:cursor-not-allowed disabled:opacity-55",
  ].join(" "),
  {
    variants: {
      size: {
        sm: "h-4 w-4",
        md: "h-[18px] w-[18px]",
      },
    },
    defaultVariants: { size: "md" },
  },
);

const labelTextVariants = cva("font-medium text-fg leading-[1.4]", {
  variants: {
    size: {
      sm: "text-[13px]",
      md: "text-sm",
    },
  },
  defaultVariants: { size: "md" },
});

const descTextVariants = cva("text-fg-muted leading-[1.45]", {
  variants: {
    size: {
      sm: "text-xs",
      md: "text-[12.5px]",
    },
  },
  defaultVariants: { size: "md" },
});

type RadixRadioProps = React.ComponentPropsWithoutRef<
  typeof RadioGroupPrimitive.Item
>;

export interface RadioProps
  extends RadixRadioProps,
    VariantProps<typeof markVariants> {
  /** Aplica visual de erro + aria-invalid="true". */
  invalid?: boolean;
  /** Texto do rótulo. Quando presente, envolve em `<label>` clicável. */
  label?: React.ReactNode;
  /** Descrição auxiliar; liga via aria-describedby automaticamente. */
  description?: React.ReactNode;
  /** Classe extra para o `<label>` wrapper (quando label/description). */
  wrapperClassName?: string;
}

const Radio = React.forwardRef<
  React.ElementRef<typeof RadioGroupPrimitive.Item>,
  RadioProps
>(
  (
    {
      className,
      wrapperClassName,
      size = "md",
      invalid,
      label,
      description,
      id,
      disabled,
      ...rest
    },
    ref,
  ) => {
    const reactId = React.useId();
    const rId = id ?? reactId;
    const descId = description ? `${rId}-desc` : undefined;
    const dotPx = size === "sm" ? 6 : 8;

    const item = (
      <RadioGroupPrimitive.Item
        ref={ref}
        id={rId}
        disabled={disabled}
        aria-invalid={invalid || undefined}
        aria-describedby={descId}
        className={cn(markVariants({ size }), className)}
        {...rest}
      >
        <RadioGroupPrimitive.Indicator className="flex items-center justify-center">
          <span
            aria-hidden="true"
            style={{ width: dotPx, height: dotPx }}
            className="block rounded-full bg-action"
          />
        </RadioGroupPrimitive.Indicator>
      </RadioGroupPrimitive.Item>
    );

    /* Sem label/description: retorna o item standalone */
    if (!label && !description) return item;

    /* Com label/description: wrapper <label> clicável */
    return (
      <label
        htmlFor={rId}
        className={cn(
          "inline-flex items-start gap-2.5 cursor-pointer select-none",
          disabled && "cursor-not-allowed opacity-55",
          wrapperClassName,
        )}
      >
        {item}
        {(label || description) && (
          <span className="inline-flex flex-col gap-0.5">
            {label && (
              <span className={labelTextVariants({ size })}>{label}</span>
            )}
            {description && (
              <span id={descId} className={descTextVariants({ size })}>
                {description}
              </span>
            )}
          </span>
        )}
      </label>
    );
  },
);
Radio.displayName = "Radio";

export { Radio, RadioGroup };
