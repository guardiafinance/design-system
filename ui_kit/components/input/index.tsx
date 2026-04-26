"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

/**
 * Input — campo de texto de linha única.
 *
 * Wrap `<input>` num `<div>` para acomodar leftIcon/rightIcon,
 * prefix/suffix (ex.: "R$" / "@") e estados visuais. O `ref` continua
 * apontando para o `<input>` interno — code legado que faz `ref.focus()`
 * ou similar segue funcionando.
 *
 * Sizes (wip parity):
 *   sm  32px height · 13px font · padding 6/10
 *   md  38px (default) · 14px · 8/12
 *   lg  46px · 15px · 10/14
 *
 * State / invalid:
 *   state="error" ou invalid={true} → border destructive +
 *   aria-invalid="true". Use `invalid` para shortcut em forms — ligação
 *   barata com FormLayout.Field.error.
 *
 * Slots:
 *   leftIcon, rightIcon  ReactNode (ícone com aria-hidden)
 *   prefix, suffix       ReactNode com separator visual (R$ / @ / .com)
 *
 * Acessibilidade:
 *   - Aceita todos os props nativos de input (HTML5 validation, aria-*,
 *     name, autocomplete, etc.)
 *   - className vai no wrapper (estilos visuais); inputClassName ajusta
 *     o input interno em casos avançados
 *   - O wrapper recebe `focus-within` styling para refletir o foco do
 *     input mesmo quando o usuário interage com prefix/suffix
 */

const wrapperVariants = cva(
  [
    "inline-flex w-full items-center",
    "bg-background text-fg",
    "rounded-md border",
    "transition-[border-color,box-shadow] duration-150",
    /* Focus reflete o foco do input interno */
    "focus-within:outline-none focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2",
    /* Disabled wrapper — nosso pseudo via attr [data-disabled] */
    "data-[disabled=true]:bg-muted data-[disabled=true]:opacity-70 data-[disabled=true]:cursor-not-allowed",
  ].join(" "),
  {
    variants: {
      size: {
        sm: "h-8 px-2.5 text-[13px]",
        md: "h-[38px] px-3 text-sm",
        lg: "h-[46px] px-3.5 text-[15px]",
      },
      state: {
        default: "border-border-strong hover:border-guardia-violet-500",
        error:
          "border-destructive hover:border-destructive focus-within:ring-destructive",
        success:
          "border-signal-green hover:border-signal-green focus-within:ring-signal-green",
      },
    },
    defaultVariants: {
      size: "md",
      state: "default",
    },
  },
);

export type InputSize = NonNullable<
  VariantProps<typeof wrapperVariants>["size"]
>;
export type InputState = NonNullable<
  VariantProps<typeof wrapperVariants>["state"]
>;

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size"> {
  size?: InputSize;
  state?: InputState;
  /** Shortcut para state="error" + aria-invalid="true". */
  invalid?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  prefix?: React.ReactNode;
  suffix?: React.ReactNode;
  /** Classe adicional aplicada ao `<input>` interno (caso avançado). */
  inputClassName?: string;
  /** Alias de className aplicada ao wrapper (clareza opcional). */
  wrapperClassName?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      size = "md",
      state = "default",
      invalid,
      leftIcon,
      rightIcon,
      prefix,
      suffix,
      className,
      wrapperClassName,
      inputClassName,
      disabled,
      "aria-invalid": ariaInvalid,
      ...rest
    },
    ref,
  ) => {
    const effectiveState: InputState = invalid ? "error" : state;
    const finalAriaInvalid = invalid || ariaInvalid;

    return (
      <div
        data-disabled={disabled || undefined}
        className={cn(
          wrapperVariants({ size, state: effectiveState }),
          className,
          wrapperClassName,
        )}
      >
        {leftIcon && (
          <span
            aria-hidden="true"
            className="mr-2 inline-flex shrink-0 text-fg-muted"
          >
            {leftIcon}
          </span>
        )}
        {prefix && (
          <span className="mr-2 shrink-0 border-r border-border pr-2 text-[0.95em] font-medium text-fg-muted">
            {prefix}
          </span>
        )}
        <input
          ref={ref}
          disabled={disabled}
          aria-invalid={finalAriaInvalid || undefined}
          className={cn(
            "min-w-0 flex-1 border-0 bg-transparent p-0 text-inherit outline-none",
            "placeholder:text-fg-muted/70",
            "disabled:cursor-not-allowed",
            inputClassName,
          )}
          {...rest}
        />
        {suffix && (
          <span className="ml-2 shrink-0 border-l border-border pl-2 text-[0.95em] font-medium text-fg-muted">
            {suffix}
          </span>
        )}
        {rightIcon && (
          <span
            aria-hidden="true"
            className="ml-2 inline-flex shrink-0 text-fg-muted"
          >
            {rightIcon}
          </span>
        )}
      </div>
    );
  },
);
Input.displayName = "Input";

export { Input };
