import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

/**
 * Badge — rótulo compacto para status, tags ou contagem.
 *
 * Eixos:
 *   variant     neutral · brand · accent · success · warning · danger · info
 *   appearance  solid · soft (default) · outline
 *   shape       pill (default) · square
 *   dot         ponto antes do texto
 *
 * Todos os tons usam apenas tokens Guardia (zero cor hardcoded).
 */
const badgeVariants = cva(
  [
    "inline-flex items-center gap-1.5 whitespace-nowrap",
    "px-2.5 py-1 text-[11px] font-semibold leading-none tracking-wide",
    "border border-transparent",
  ].join(" "),
  {
    variants: {
      variant: {
        neutral: "",
        brand: "",
        accent: "",
        success: "",
        warning: "",
        danger: "",
        info: "",
      },
      appearance: {
        solid: "text-white",
        soft: "",
        outline: "bg-transparent",
      },
      shape: {
        pill: "rounded-full",
        square: "rounded-sm",
      },
    },
    compoundVariants: [
      /* ── SOFT (default) ───────────────────────────── */
      { appearance: "soft", variant: "neutral",  className: "bg-guardia-gray-100 text-guardia-gray-700" },
      { appearance: "soft", variant: "brand",    className: "bg-guardia-violet-100 text-guardia-violet-700" },
      { appearance: "soft", variant: "accent",   className: "bg-guardia-orange-100 text-guardia-orange-700" },
      { appearance: "soft", variant: "success",  className: "bg-[color-mix(in_oklab,var(--signal-green)_18%,white)] text-[color-mix(in_oklab,var(--signal-green)_52%,black)]" },
      { appearance: "soft", variant: "warning",  className: "bg-guardia-yellow-100 text-guardia-yellow-900" },
      { appearance: "soft", variant: "danger",   className: "bg-[color-mix(in_oklab,var(--signal-red)_14%,white)] text-[color-mix(in_oklab,var(--signal-red)_45%,black)]" },
      { appearance: "soft", variant: "info",     className: "bg-[color-mix(in_oklab,var(--signal-blue)_14%,white)] text-[color-mix(in_oklab,var(--signal-blue)_62%,black)]" },

      /* ── SOLID ──────────────────────────────────────
       * WCAG fg overrides (per WCAG 2.1 §1.4.3 sRGB recompute, aligned with
       * Chip ADR-003 — see docs/adr/ADR-003-chip-variants.md):
       *   accent  → text-guardia-gray-900 (text-white over orange-500 = 3.15:1 fails AA-Normal)
       *   success → text-guardia-gray-900 (text-white over signal-green = 2.43:1 fails AA-Normal AND AA-Large)
       *   danger  → text-guardia-gray-900 (text-white over signal-red   = 3.66:1 fails AA-Normal)
       *   warning → text-guardia-violet-900 (text-white over signal-yellow = 1.33:1 fails everything)
       * neutral / brand / info keep the appearance.solid default `text-white`
       * (all ≥ 8.13:1).
       */
      { appearance: "solid", variant: "neutral",  className: "bg-guardia-gray-500" },
      { appearance: "solid", variant: "brand",    className: "bg-guardia-violet-500" },
      { appearance: "solid", variant: "accent",   className: "bg-guardia-orange-500 text-guardia-gray-900" },
      { appearance: "solid", variant: "success",  className: "bg-signal-green text-guardia-gray-900" },
      { appearance: "solid", variant: "warning",  className: "bg-signal-yellow text-guardia-violet-900" },
      { appearance: "solid", variant: "danger",   className: "bg-signal-red text-guardia-gray-900" },
      { appearance: "solid", variant: "info",     className: "bg-signal-blue" },

      /* ── OUTLINE ──────────────────────────────────────
       * appearance.outline composites text against bg-background (transparent
       * bg). text-foreground is the only fg that passes WCAG 2.1 §1.4.3
       * AA-Normal (4.5:1) in both themes — aligns with Chip ADR-003 policy
       * (see docs/adr/ADR-003-chip-variants.md, outline section).
       *
       * WCAG recompute against --background in each theme
       *   light --background #FCFCFC | dark --background #17171C
       *   light --foreground #44186D | dark --foreground #FCFCFC
       *
       * Variant-tinted text fails AA-Normal in at least one theme:
       *   neutral  text-guardia-gray-700   light 14.27:1 pass | dark  1.22:1 FAIL
       *   brand    text-guardia-violet-500 light 12.16:1 pass | dark  1.43:1 FAIL
       *   accent   text-guardia-orange-500 light  3.07:1 FAIL | dark  5.67:1 pass
       *   success  text-signal-green       light  2.37:1 FAIL | dark  7.34:1 pass
       *   warning  text-guardia-yellow-900 light  7.71:1 pass | dark  2.26:1 FAIL
       *   danger   text-signal-red         light  3.57:1 FAIL | dark  4.88:1 pass
       *   info     text-signal-blue        light  7.92:1 pass | dark  2.20:1 FAIL
       *
       * After fix (text-foreground):
       *   light fg #44186D over #FCFCFC = 12.81:1 AA-Normal pass
       *   dark  fg #FCFCFC over #17171C = 17.41:1 AA-Normal pass
       *
       * Border keeps the variant signal — WCAG 1.4.11 non-text UI threshold
       * is 3:1, and border-strong remains the chosen neutral mark for neutral.
       */
      { appearance: "outline", variant: "neutral",  className: "border-border-strong text-foreground" },
      { appearance: "outline", variant: "brand",    className: "border-guardia-violet-500 text-foreground" },
      { appearance: "outline", variant: "accent",   className: "border-guardia-orange-500 text-foreground" },
      { appearance: "outline", variant: "success",  className: "border-signal-green text-foreground" },
      { appearance: "outline", variant: "warning",  className: "border-signal-yellow text-foreground" },
      { appearance: "outline", variant: "danger",   className: "border-signal-red text-foreground" },
      { appearance: "outline", variant: "info",     className: "border-signal-blue text-foreground" },
    ],
    defaultVariants: {
      variant: "neutral",
      appearance: "soft",
      shape: "pill",
    },
  },
);

export interface BadgeProps
  extends Omit<React.HTMLAttributes<HTMLSpanElement>, "color">,
    VariantProps<typeof badgeVariants> {
  /** Exibe um ponto (ponto colorido, cor herdada) antes do texto. */
  dot?: boolean;
  /** Ícone antes do texto (cor herda da variant). */
  leadingIcon?: React.ReactNode;
  /** Ícone depois do texto. */
  trailingIcon?: React.ReactNode;
}

const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  (
    {
      className,
      variant,
      appearance,
      shape,
      dot = false,
      leadingIcon,
      trailingIcon,
      children,
      ...props
    },
    ref,
  ) => (
    <span
      ref={ref}
      data-slot="badge"
      data-variant={variant ?? "neutral"}
      data-appearance={appearance ?? "soft"}
      className={cn(
        badgeVariants({ variant, appearance, shape }),
        "[&_svg]:pointer-events-none [&_svg]:size-3 [&_svg]:shrink-0",
        className,
      )}
      {...props}
    >
      {dot && (
        <span
          aria-hidden="true"
          className="size-1.5 rounded-full bg-current"
        />
      )}
      {leadingIcon}
      {children}
      {trailingIcon}
    </span>
  ),
);
Badge.displayName = "Badge";

export { Badge, badgeVariants };
