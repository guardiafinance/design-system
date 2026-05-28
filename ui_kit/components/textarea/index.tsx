"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

/**
 * Textarea — campo de texto multilinha.
 *
 * Wrap `<textarea>` num `<div>` para acomodar (a) borda + anel de foco no
 * wrapper (estável quando o usuário arrasta o handle de resize), (b)
 * contador de caracteres absolutamente posicionado, (c) estado disabled
 * propagado via `data-disabled`.
 *
 * Paridade com `Input` (sm/md/lg, default/error/success, invalid shortcut,
 * disabled, className/wrapperClassName), exceto os slots inline
 * (`leftIcon`/`rightIcon`/`prefix`/`suffix`) — superfícies multilinha não
 * hospedam adornos inline. Em troca, Textarea expõe `showCount`,
 * `autoSize` (+ `maxRows`) e `resize`.
 *
 * Sizes (legacy parity ux_references/ui_kits/components/Textarea):
 *   sm  min-height 60px · 13px font · padding 1.5/2.5
 *   md  min-height 84px (default) · 14px · padding 2/3
 *   lg  min-height 112px · 15px · padding 2.5/3.5
 *
 * State / invalid:
 *   state="error" ou invalid={true} → border-destructive +
 *   aria-invalid="true" no <textarea>. Use `invalid` como shortcut para
 *   integração com FormLayout.Field.
 *
 * autoSize:
 *   Quando true, mede `scrollHeight` em useLayoutEffect e ajusta
 *   `style.height`. `maxRows` capa o crescimento. Default desliga
 *   `resize` (handle manual conflita) — consumidor pode forçar `resize`
 *   explícito se quiser ambos.
 *
 * Acessibilidade:
 *   - Aceita todos os props nativos de textarea (aria-*, name, required,
 *     readOnly, autoComplete, etc.).
 *   - O contador é `aria-hidden="true"` (feedback puramente visual). Para
 *     SR feedback, anexe `aria-describedby` a um sibling com `role="status"`.
 *   - `forwardRef` aponta para o `<textarea>` interno — code legado que
 *     faz `ref.focus()` / `ref.value` segue funcionando.
 */

const wrapperVariants = cva(
  [
    "relative inline-flex w-full flex-col",
    "rounded-md border bg-background text-fg",
    "transition-[border-color,box-shadow] duration-150",
    "focus-within:outline-none focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2",
    "data-[disabled=true]:bg-muted data-[disabled=true]:opacity-70 data-[disabled=true]:cursor-not-allowed",
  ].join(" "),
  {
    variants: {
      size: {
        sm: "min-h-[60px] px-2.5 py-1.5 text-[13px]",
        md: "min-h-[84px] px-3 py-2 text-sm",
        lg: "min-h-[112px] px-3.5 py-2.5 text-[15px]",
      },
      state: {
        default: "border-primary hover:border-primary",
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

export type TextareaSize = NonNullable<
  VariantProps<typeof wrapperVariants>["size"]
>;
export type TextareaState = NonNullable<
  VariantProps<typeof wrapperVariants>["state"]
>;
export type TextareaResize = "none" | "vertical" | "both";

export interface TextareaProps
  extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, "size"> {
  size?: TextareaSize;
  state?: TextareaState;
  /** Shortcut para state="error" + aria-invalid="true". */
  invalid?: boolean;
  /** Contador de caracteres bottom-right (use com maxLength quando aplicável). */
  showCount?: boolean;
  /** Auto-grow para caber conteúdo (dentro de maxRows). */
  autoSize?: boolean;
  /** Limite de linhas quando autoSize. */
  maxRows?: number;
  /** CSS resize. Default: "vertical" (ou "none" quando autoSize). */
  resize?: TextareaResize;
  /** Classe aplicada ao wrapper. */
  className?: string;
  /** Alias de className (clareza em form composers). */
  wrapperClassName?: string;
  /** Classe extra aplicada ao <textarea> interno (caso avançado). */
  textareaClassName?: string;
}

// WHY: line-height aproximado por size para o cap de maxRows. Mantém o
// cálculo determinístico mesmo sem ler computed style (jsdom-friendly).
const LINE_HEIGHT_BY_SIZE: Record<TextareaSize, number> = {
  sm: 20, // 13px * ~1.55
  md: 22, // 14px * ~1.55
  lg: 24, // 15px * ~1.55
};

// WHY: `scrollHeight` é medido no <textarea> interno (que tem `p-0`). O
// padding vertical do wrapper fica no <div> externo e NÃO deve entrar no
// cap. Cap = lines × line-height (sem somar padding) — Argos round 1 fix.

function mergeRefs<T>(
  ...refs: Array<React.Ref<T> | undefined>
): React.RefCallback<T> {
  return (node: T) => {
    for (const ref of refs) {
      if (!ref) continue;
      if (typeof ref === "function") {
        ref(node);
      } else {
        (ref as React.MutableRefObject<T | null>).current = node;
      }
    }
  };
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      size = "md",
      state = "default",
      invalid,
      showCount,
      autoSize,
      maxRows,
      resize,
      className,
      wrapperClassName,
      textareaClassName,
      disabled,
      maxLength,
      value,
      defaultValue,
      onChange,
      "aria-invalid": ariaInvalid,
      ...rest
    },
    ref,
  ) => {
    const innerRef = React.useRef<HTMLTextAreaElement | null>(null);
    // Memoiza o ref combinado para não criar um novo RefCallback a cada
    // render — React desconectaria/reconectaria o ref de outra forma.
    // Argos round 1 fix (perf).
    const composedRef = React.useMemo(
      () => mergeRefs(innerRef, ref),
      [ref],
    );
    const effectiveState: TextareaState = invalid ? "error" : state;
    const finalAriaInvalid = invalid || ariaInvalid;
    // Quando autoSize está ligado, `resize` default vira "none" (o handle
    // manual conflita com o cálculo automático). Consumidor sobrescreve
    // passando `resize` explicitamente.
    const effectiveResize: TextareaResize =
      resize ?? (autoSize ? "none" : "vertical");

    // Para o contador: rastreia o comprimento via state local em modo
    // uncontrolled (defaultValue + sem value) — controlled lê de `value`.
    const isControlled = value !== undefined;
    const [uncontrolledLen, setUncontrolledLen] = React.useState<number>(() =>
      typeof defaultValue === "string"
        ? defaultValue.length
        : Array.isArray(defaultValue)
          ? defaultValue.join("").length
          : 0,
    );
    const currentLen = isControlled
      ? typeof value === "string"
        ? value.length
        : String(value ?? "").length
      : uncontrolledLen;

    const handleChange = React.useCallback(
      (event: React.ChangeEvent<HTMLTextAreaElement>) => {
        if (!isControlled) {
          setUncontrolledLen(event.target.value.length);
        }
        onChange?.(event);
      },
      [isControlled, onChange],
    );

    // autoSize: mede scrollHeight e ajusta `style.height` após cada
    // mudança de conteúdo. useLayoutEffect evita o frame de jump visual.
    React.useLayoutEffect(() => {
      const el = innerRef.current;
      if (!el) return;
      if (!autoSize) {
        // Cleanup quando autoSize desliga (toggle true → false): zera os
        // inline styles escritos no modo autoSize para que o próximo render
        // comece limpo. Argos round 1 fix (edge case).
        if (el.style.height) el.style.height = "";
        if (el.style.overflowY) el.style.overflowY = "";
        return;
      }
      el.style.height = "auto";
      const measured = el.scrollHeight;
      if (maxRows && maxRows > 0) {
        // Cap = lines × line-height. NÃO somamos padding do wrapper: ele
        // sai do <div> externo, não do <textarea>. Argos round 1 fix.
        const cap = LINE_HEIGHT_BY_SIZE[size] * maxRows;
        el.style.height = `${Math.min(measured, cap)}px`;
        el.style.overflowY = measured > cap ? "auto" : "hidden";
      } else {
        el.style.height = `${measured}px`;
        el.style.overflowY = "hidden";
      }
    }, [value, defaultValue, autoSize, maxRows, size, currentLen]);

    return (
      <div
        data-disabled={disabled || undefined}
        className={cn(
          wrapperVariants({ size, state: effectiveState }),
          className,
          wrapperClassName,
        )}
      >
        <textarea
          ref={composedRef}
          disabled={disabled}
          aria-invalid={finalAriaInvalid || undefined}
          maxLength={maxLength}
          value={value}
          defaultValue={defaultValue}
          onChange={handleChange}
          style={{ resize: effectiveResize }}
          className={cn(
            "min-w-0 flex-1 border-0 bg-transparent p-0 text-inherit outline-none",
            "placeholder:text-fg-muted/70",
            "disabled:cursor-not-allowed",
            // Reserva espaço para o chip do contador (absolutamente
            // posicionado no canto inferior direito do wrapper) — evita
            // sobreposição com a última linha de texto. Argos round 1 fix.
            showCount && "pb-5",
            textareaClassName,
          )}
          {...rest}
        />
        {showCount && (
          <span
            aria-hidden="true"
            className="pointer-events-none absolute bottom-1.5 right-2.5 rounded-sm bg-background/80 px-1 text-[11px] text-fg-muted"
          >
            {maxLength ? `${currentLen} / ${maxLength}` : `${currentLen}`}
          </span>
        )}
      </div>
    );
  },
);
Textarea.displayName = "Textarea";

export { Textarea };
