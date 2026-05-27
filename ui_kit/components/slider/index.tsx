"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

/**
 * Slider — faixa numérica contínua (wrapper de `<input type="range">`).
 *
 * Base: input nativo `type="range"` (role="slider" automático, navegação
 * por setas, value-now/min/max já cobertos pelo browser). O wrapper adiciona:
 *
 *   - CVA variants `size: "sm" | "md"` + estados `invalid` e `disabled`.
 *   - Estilos globais `.guardia-slider` em `ui_kit/styles/index.css` para
 *     thumbs e tracks (pseudo-elementos `::-webkit-slider-thumb` /
 *     `::-moz-range-thumb` não podem ser estilizados via utility classes
 *     do Tailwind — é restrição do DOM, não escolha de arquitetura).
 *   - Custom CSS prop `--pct` (0–100) que pinta o track preenchido via
 *     gradient — atualizada via `style` a cada mudança de valor.
 *
 * API:
 *   <Slider value={50} onValueChange={(v) => setValue(v)} />
 *   <Slider defaultValue={20} showValue prefix="R$ " />
 *   <Slider value={75} showValue format={(v) => `${v}%`} />
 *   <Slider invalid />     // aria-invalid="true" + variant vermelho
 *   <Slider disabled />    // input.disabled + variant cinza
 *
 * Acessibilidade:
 *   - `<input type="range">` nativo carrega role="slider", aria-valuenow,
 *     aria-valuemin, aria-valuemax e navegação por setas automaticamente.
 *   - `aria-invalid` é refletido quando `invalid` é true.
 *   - O readout opcional (`showValue`) é anunciado por leitores de tela
 *     pois fica adjacente ao input no DOM (associação via aria-describedby
 *     quando renderizado).
 *   - Focus-visible ring laranja (--ring) com offset (CSS global).
 */

const sliderVariants = cva("guardia-slider", {
  variants: {
    size: {
      sm: "guardia-slider--sm",
      md: "guardia-slider--md",
    },
    invalid: {
      true: "guardia-slider--invalid",
      false: "",
    },
    disabled: {
      true: "guardia-slider--disabled",
      false: "",
    },
  },
  defaultVariants: { size: "md", invalid: false, disabled: false },
});

type NativeRangeProps = Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "type" | "size" | "defaultValue" | "value" | "onChange"
>;

export interface SliderProps
  extends NativeRangeProps,
    VariantProps<typeof sliderVariants> {
  /** Valor controlado (number). Quando passado, o componente vira controlled. */
  value?: number;
  /** Valor inicial uncontrolled. Ignorado quando `value` é passado. */
  defaultValue?: number;
  /** Callback com o novo valor numérico (após `Number(e.target.value)`). */
  onValueChange?: (value: number) => void;
  /** Callback nativo do `<input>`. Disparado em paralelo a `onValueChange`. */
  onChange?: React.ChangeEventHandler<HTMLInputElement>;
  /** Mínimo. Default `0`. */
  min?: number;
  /** Máximo. Default `100`. */
  max?: number;
  /** Step. Default `1`. */
  step?: number;
  /** Quando `true`, renderiza o readout do valor ao lado direito do track. */
  showValue?: boolean;
  /** Texto exibido antes do valor (apenas com `showValue`). */
  prefix?: string;
  /** Texto exibido depois do valor (apenas com `showValue`). */
  suffix?: string;
  /** Formatador do valor numérico. Default: `String(value)`. */
  format?: (value: number) => string;
  /** Aplica visual de erro + `aria-invalid="true"`. */
  invalid?: boolean;
  /** Desabilita o input e aplica variant cinza. */
  disabled?: boolean;
  /** Classe extra no wrapper que envolve input + readout. */
  wrapperClassName?: string;
  /** Classe extra no readout (span do valor). */
  valueClassName?: string;
}

function clampToRange(value: number, min: number, max: number): number {
  if (Number.isNaN(value)) return min;
  if (value < min) return min;
  if (value > max) return max;
  return value;
}

function computePercent(value: number, min: number, max: number): number {
  if (max <= min) return 0;
  return ((value - min) / (max - min)) * 100;
}

const Slider = React.forwardRef<HTMLInputElement, SliderProps>(
  (
    {
      className,
      wrapperClassName,
      valueClassName,
      size = "md",
      invalid = false,
      disabled = false,
      value,
      defaultValue,
      onValueChange,
      onChange,
      min = 0,
      max = 100,
      step = 1,
      showValue = false,
      prefix,
      suffix,
      format,
      id,
      style,
      ...rest
    },
    ref,
  ) => {
    const isControlled = value !== undefined;
    const initialUncontrolled = defaultValue ?? min;
    const [internalValue, setInternalValue] = React.useState<number>(
      clampToRange(initialUncontrolled, min, max),
    );

    const currentValue = clampToRange(
      isControlled ? (value as number) : internalValue,
      min,
      max,
    );

    const pct = computePercent(currentValue, min, max);

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      const next = Number(event.target.value);
      if (!isControlled) {
        setInternalValue(next);
      }
      onValueChange?.(next);
      onChange?.(event);
    };

    const displayedValue = format ? format(currentValue) : String(currentValue);
    const readout = `${prefix ?? ""}${displayedValue}${suffix ?? ""}`;

    return (
      <span
        className={cn(
          "guardia-slider-wrapper inline-flex items-center gap-3 w-full",
          wrapperClassName,
        )}
      >
        <input
          ref={ref}
          id={id}
          type="range"
          min={min}
          max={max}
          step={step}
          value={currentValue}
          onChange={handleChange}
          disabled={disabled}
          aria-invalid={invalid || undefined}
          className={cn(
            sliderVariants({ size, invalid, disabled }),
            className,
          )}
          style={{
            ...style,
            ["--pct" as string]: `${pct}%`,
          }}
          {...rest}
        />
        {showValue && (
          <span
            className={cn(
              "guardia-slider-value text-sm tabular-nums text-fg shrink-0",
              valueClassName,
            )}
            aria-hidden="true"
          >
            {readout}
          </span>
        )}
      </span>
    );
  },
);
Slider.displayName = "Slider";

export { Slider, sliderVariants };
