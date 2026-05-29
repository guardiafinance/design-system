"use client";

import * as React from "react";
import * as SwitchPrimitives from "@radix-ui/react-switch";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

/**
 * Switch — alternador on/off para acoes com efeito imediato.
 *
 * Base: Radix Switch (`<button role="switch">`). Adiciona track + thumb
 * via Tailwind/CVA com tokens semanticos brand-aware, estados (checked,
 * unchecked, invalid, disabled) e composicao opcional com label +
 * description.
 *
 * Sizes (paridade com `ux_references/Switch/index.css`):
 *   sm -> track 30x18 . thumb 14 . translate 12px
 *   md -> track 38x22 . thumb 18 . translate 16px (default)
 *
 * Use:
 *   <Switch label="Notificacoes" />
 *   <Switch label="Autopilot" description="Aprova matches > 95%" />
 *   <Switch invalid label="Campo obrigatorio" />
 *
 * Para uso standalone (label externa), passe so os props nativos:
 *   <Switch id="x" />
 *   <Label htmlFor="x">Notificacoes</Label>
 *
 * Acessibilidade:
 *   - Radix Switch garante `role="switch"`, `aria-checked`, focus management.
 *   - `aria-invalid="true"` quando `invalid`.
 *   - `aria-describedby` liga automaticamente quando `description` e passada.
 *   - `focus-visible:ring-ring` com offset (laranja sobre fundo `--background`).
 *   - Espaco/Enter alterna o estado (Radix nativo).
 */

const trackVariants = cva(
  [
    "peer relative inline-flex shrink-0 cursor-pointer items-center rounded-full",
    "border-2 border-transparent",
    "transition-colors duration-150",
    /* Unchecked: track neutro */
    "data-[state=unchecked]:bg-muted",
    /* Checked: brand-aware (violet light / orange dark via --action) */
    "data-[state=checked]:bg-action",
    /* Focus-visible: ring laranja com offset */
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
    /* Invalid: ring vermelho ao redor do track (nao substitui bg) */
    "aria-[invalid=true]:ring-2 aria-[invalid=true]:ring-destructive/40 aria-[invalid=true]:ring-offset-2 aria-[invalid=true]:ring-offset-background",
    /* Disabled */
    "disabled:cursor-not-allowed disabled:opacity-55",
  ].join(" "),
  {
    variants: {
      size: {
        sm: "h-[18px] w-[30px]",
        md: "h-[22px] w-[38px]",
      },
    },
    defaultVariants: { size: "md" },
  },
);

const thumbVariants = cva(
  [
    "pointer-events-none block rounded-full bg-background",
    "shadow-[0_1px_2px_rgba(0,0,0,0.15),0_1px_3px_rgba(0,0,0,0.1)]",
    "ring-0 transition-transform duration-150",
  ].join(" "),
  {
    variants: {
      size: {
        sm: "h-[14px] w-[14px] data-[state=checked]:translate-x-[12px] data-[state=unchecked]:translate-x-0",
        md: "h-[18px] w-[18px] data-[state=checked]:translate-x-[16px] data-[state=unchecked]:translate-x-0",
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

type RadixSwitchProps = React.ComponentPropsWithoutRef<
  typeof SwitchPrimitives.Root
>;

export interface SwitchProps
  extends Omit<RadixSwitchProps, "children">,
    VariantProps<typeof trackVariants> {
  /** Aplica visual de erro + `aria-invalid="true"`. */
  invalid?: boolean;
  /** Texto do rotulo. Quando presente, envolve em `<label>` clicavel. */
  label?: React.ReactNode;
  /** Descricao auxiliar; liga via `aria-describedby` automaticamente. */
  description?: React.ReactNode;
  /** Classe extra para o `<label>` wrapper (quando label/description). */
  wrapperClassName?: string;
}

const Switch = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitives.Root>,
  SwitchProps
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
    const swId = id ?? reactId;
    const descId = description ? `${swId}-desc` : undefined;

    const root = (
      <SwitchPrimitives.Root
        ref={ref}
        id={swId}
        disabled={disabled}
        aria-invalid={invalid || undefined}
        aria-describedby={descId}
        className={cn(trackVariants({ size }), className)}
        {...rest}
      >
        <SwitchPrimitives.Thumb className={cn(thumbVariants({ size }))} />
      </SwitchPrimitives.Root>
    );

    /* Sem label/description: retorna o Switch standalone */
    if (!label && !description) return root;

    /* Com label ou description: wrapper <label> clicavel */
    return (
      <label
        htmlFor={swId}
        className={cn(
          "inline-flex items-center gap-2.5 cursor-pointer select-none",
          disabled && "cursor-not-allowed opacity-55",
          wrapperClassName,
        )}
      >
        {root}
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
Switch.displayName = "Switch";

export { Switch, trackVariants as switchVariants };
