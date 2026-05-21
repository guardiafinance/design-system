import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

/**
 * Skeleton — placeholder animado para conteúdo carregando.
 *
 * Variantes:
 *   text   (default) → linha de 14px
 *   title             → linha de 22px (60% por default)
 *   rect              → bloco 80px de altura
 *   circle            → 40px × 40px arredondado
 *
 * Acessibilidade:
 *   - Por default, `aria-hidden="true"` (skeleton é decorativo).
 *     Quando o LOADING precisa ser anunciado, prefira envolver o grupo
 *     em um container com `role="status"` + `aria-busy="true"` e uma
 *     label SR-only ("Carregando ...").
 *   - Animação respeita `prefers-reduced-motion`: shimmer some, mas
 *     o background gradient permanece visível para manter o contraste.
 *
 * Múltiplas linhas (text):
 *   Use `lines={n}` para gerar n linhas; a última fica em 70% da largura
 *   para parecer um parágrafo natural.
 */
const skeletonVariants = cva(
  [
    "block skeleton-shimmer-bg",
    "rounded-sm",
    "motion-safe:animate-[skeleton-shimmer_1400ms_ease-in-out_infinite]",
  ].join(" "),
  {
    variants: {
      variant: {
        text: "h-3.5 w-full rounded-sm",
        title: "h-[22px] w-3/5 rounded-md",
        rect: "h-20 w-full rounded-md",
        circle: "h-10 w-10 rounded-full",
      },
    },
    defaultVariants: {
      variant: "text",
    },
  },
);

export interface SkeletonProps
  extends Omit<React.HTMLAttributes<HTMLSpanElement>, "color">,
    VariantProps<typeof skeletonVariants> {
  /** Largura customizada (ex.: 240, "12rem", "80%"). */
  width?: number | string;
  /** Altura customizada (ex.: 16, "1rem"). */
  height?: number | string;
  /** Quando `variant="text"`, gera N linhas; última com 70%. */
  lines?: number;
}

const Skeleton = React.forwardRef<HTMLSpanElement, SkeletonProps>(
  (
    {
      className,
      variant = "text",
      width,
      height,
      lines = 1,
      style,
      "aria-hidden": ariaHidden,
      ...rest
    },
    ref,
  ) => {
    const dims: React.CSSProperties = {
      ...(width != null ? { width } : {}),
      ...(height != null ? { height } : {}),
      ...style,
    };

    /* Múltiplas linhas só fazem sentido em "text" */
    if (variant === "text" && lines > 1) {
      return (
        <span
          ref={ref}
          aria-hidden={ariaHidden ?? true}
          className={cn("flex w-full flex-col gap-2", className)}
          {...rest}
        >
          {Array.from({ length: lines }).map((_, i) => (
            <span
              key={i}
              className={skeletonVariants({ variant: "text" })}
              style={{
                width:
                  i === lines - 1
                    ? width != null
                      ? width
                      : "70%"
                    : width != null
                      ? width
                      : "100%",
                ...(height != null ? { height } : {}),
              }}
            />
          ))}
        </span>
      );
    }

    return (
      <span
        ref={ref}
        aria-hidden={ariaHidden ?? true}
        className={cn(skeletonVariants({ variant }), className)}
        style={dims}
        {...rest}
      />
    );
  },
);
Skeleton.displayName = "Skeleton";

export { Skeleton, skeletonVariants };
