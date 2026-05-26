import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

/**
 * Spinner — indicador circular de carregamento.
 *
 * Defaults:
 *   size="md" (20px) · color="current" (herda currentColor)
 *
 * Tamanhos canônicos (wip parity):
 *   xs 12px · sm 16px · md 20px · lg 28px · xl 40px
 *
 * Cores:
 *   current → currentColor (default; use a cor do parent)
 *   brand   → guardia-purple-500
 *   accent  → guardia-orange-500
 *   white   → #fff (em fundos escuros / sobre actions saturadas)
 *
 * Acessibilidade:
 *   - role="status" + aria-label="Carregando" (customizável via prop `label`)
 *   - O SVG interno é `aria-hidden` — o anúncio vem do span pai
 *   - Animação respeita `prefers-reduced-motion`: motion-safe wrapper
 *   - Para spinners "decorativos" (já há texto vivo anunciando o loading
 *     via aria-live em outro lugar), passe `aria-hidden` para suprimir
 *     a duplicidade de anúncio
 *
 * Quando usar:
 *   - Ações pontuais síncronas (salvando, exportando, conciliando)
 *   - Inline em Button / IconButton
 *
 * Quando evitar:
 *   - Loading de tela inteira → use <Skeleton />
 *   - Esperas longas (>3s) sem mensagem contextual
 */

const SPINNER_PX = {
  xs: 12,
  sm: 16,
  md: 20,
  lg: 28,
  xl: 40,
} as const;

const spinnerVariants = cva(
  [
    /* `inline-block` + `leading-none` + `align-middle` neutraliza o baseline
     * da linha de texto, que de outra forma "infla" a bounding box do span
     * e move o pivô da rotação (causando o efeito de flutuação).
     * `origin-center` força o transform-origin no centro geométrico. */
    "inline-block leading-none align-middle origin-center",
    /* Animação: 900ms linear (wip parity), respeita prefers-reduced-motion */
    "motion-safe:animate-[spin_900ms_linear_infinite]",
  ].join(" "),
  {
    variants: {
      size: {
        xs: "h-3 w-3",
        sm: "h-4 w-4",
        md: "h-5 w-5",
        lg: "h-7 w-7",
        xl: "h-10 w-10",
      },
      color: {
        current: "",
        brand: "text-guardia-purple-500",
        accent: "text-guardia-orange-500",
        white: "text-white",
      },
    },
    defaultVariants: {
      size: "md",
      color: "current",
    },
  },
);

export interface SpinnerProps
  extends Omit<React.HTMLAttributes<HTMLSpanElement>, "color">,
    VariantProps<typeof spinnerVariants> {
  /** Texto anunciado por leitores de tela. Default: "Carregando". */
  label?: string;
}

const Spinner = React.forwardRef<HTMLSpanElement, SpinnerProps>(
  (
    {
      className,
      size = "md",
      color = "current",
      label = "Carregando",
      "aria-hidden": ariaHidden,
      ...rest
    },
    ref,
  ) => {
    const isHidden = ariaHidden === true || ariaHidden === "true";
    const px = SPINNER_PX[size ?? "md"];

    return (
      <span
        ref={ref}
        role={isHidden ? undefined : "status"}
        aria-hidden={isHidden ? true : undefined}
        aria-label={isHidden ? undefined : label}
        className={cn(spinnerVariants({ size, color }), className)}
        {...rest}
      >
        <svg
          aria-hidden="true"
          focusable="false"
          width={px}
          height={px}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2.5}
          strokeLinecap="round"
          className="block"
        >
          <path d="M21 12a9 9 0 1 1-6.3-8.57" />
        </svg>
      </span>
    );
  },
);
Spinner.displayName = "Spinner";

export { Spinner, spinnerVariants, SPINNER_PX };
