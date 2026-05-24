"use client";

import * as React from "react";
import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import { cva, type VariantProps } from "class-variance-authority";
import { Check, Minus } from "lucide-react";

import { cn } from "@/lib/utils";

/**
 * Checkbox — seleção múltipla.
 *
 * Base: Radix Checkbox (`<button role="checkbox">` com input hidden para
 * form submission). Adiciona indicator visual, estados (checked,
 * indeterminate, invalid, disabled) e composição opcional com label +
 * description.
 *
 * Sizes (wip parity):
 *   sm → box 16px, ícone 12px, label 13px
 *   md → box 18px, ícone 14px, label 14px (default)
 *
 * Use:
 *   <Checkbox label="Aceito" description="Termos de uso" />
 *   <Checkbox indeterminate />     // estado misto (3-state pattern)
 *   <Checkbox invalid />           // border red + aria-invalid
 *
 * Para uso headless (label externa), passe só os props nativos:
 *   <Checkbox id="x" />
 *   <Label htmlFor="x">Aceito</Label>
 *
 * Acessibilidade:
 *   - aria-invalid=true quando `invalid`
 *   - aria-describedby liga automaticamente quando `description` é passada
 *   - focus-visible:ring laranja (--ring) com offset
 *   - Espaço alterna o estado (Radix nativo)
 *   - Indeterminate é anunciado como "mixed" por leitores de tela
 */

const boxVariants = cva(
  [
    "peer shrink-0 inline-flex items-center justify-center",
    "rounded-sm border-[1.5px] bg-background text-transparent",
    "border-border-strong",
    "transition-[background-color,border-color,color,box-shadow] duration-150",
    /* Hover (não disabled): border action (violet light / orange dark) */
    "hover:border-action",
    /* Checked / Indeterminate: action fill + button-fg icon (white light / mono-black dark, AA-safe) */
    "data-[state=checked]:bg-action data-[state=checked]:border-action data-[state=checked]:text-button-fg",
    "data-[state=indeterminate]:bg-action data-[state=indeterminate]:border-action data-[state=indeterminate]:text-button-fg",
    /* Focus-visible: ring laranja com offset */
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
    /* Invalid: border red (override hover) */
    "aria-[invalid=true]:border-destructive aria-[invalid=true]:hover:border-destructive",
    /* Disabled */
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

type RadixCheckboxProps = React.ComponentPropsWithoutRef<
  typeof CheckboxPrimitive.Root
>;

export interface CheckboxProps
  extends Omit<RadixCheckboxProps, "checked">,
    VariantProps<typeof boxVariants> {
  /** Estado checked, padrão Radix (boolean | "indeterminate"). */
  checked?: boolean | "indeterminate";
  /** Atalho para `checked="indeterminate"`. Quando true, sobrescreve checked. */
  indeterminate?: boolean;
  /** Aplica visual de erro + aria-invalid="true". */
  invalid?: boolean;
  /** Texto do rótulo. Quando presente, envolve em `<label>` clicável. */
  label?: React.ReactNode;
  /** Descrição auxiliar; liga via aria-describedby automaticamente. */
  description?: React.ReactNode;
  /** Classe extra para o `<label>` wrapper (quando label/description). */
  wrapperClassName?: string;
}

const Checkbox = React.forwardRef<
  React.ElementRef<typeof CheckboxPrimitive.Root>,
  CheckboxProps
>(
  (
    {
      className,
      wrapperClassName,
      size = "md",
      checked,
      indeterminate,
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
    const cbId = id ?? reactId;
    const descId = description ? `${cbId}-desc` : undefined;
    const finalChecked = indeterminate ? "indeterminate" : checked;
    const iconPx = size === "sm" ? 12 : 14;

    const cb = (
      <CheckboxPrimitive.Root
        ref={ref}
        id={cbId}
        checked={finalChecked}
        disabled={disabled}
        aria-invalid={invalid || undefined}
        aria-describedby={descId}
        className={cn(boxVariants({ size }), className)}
        {...rest}
      >
        <CheckboxPrimitive.Indicator
          className="flex items-center justify-center"
          forceMount
        >
          {finalChecked === "indeterminate" ? (
            <Minus
              width={iconPx}
              height={iconPx}
              strokeWidth={3}
              aria-hidden="true"
            />
          ) : (
            <Check
              width={iconPx}
              height={iconPx}
              strokeWidth={3}
              aria-hidden="true"
            />
          )}
        </CheckboxPrimitive.Indicator>
      </CheckboxPrimitive.Root>
    );

    /* Sem label/description: retorna o Checkbox standalone */
    if (!label && !description) return cb;

    /* Com label ou description: wrapper <label> clicável */
    return (
      <label
        htmlFor={cbId}
        className={cn(
          "inline-flex items-start gap-2.5 cursor-pointer select-none",
          disabled && "cursor-not-allowed opacity-55",
          wrapperClassName,
        )}
      >
        {cb}
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
Checkbox.displayName = "Checkbox";

export { Checkbox };
