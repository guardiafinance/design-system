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
      { appearance: "soft", variant: "brand",    className: "bg-guardia-purple-100 text-guardia-purple-700" },
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
       *   warning → text-guardia-purple-900 (text-white over signal-yellow = 1.33:1 fails everything)
       * neutral / brand / info keep the appearance.solid default `text-white`
       * (all ≥ 8.13:1).
       */
      { appearance: "solid", variant: "neutral",  className: "bg-guardia-gray-500" },
      { appearance: "solid", variant: "brand",    className: "bg-guardia-purple-500" },
      { appearance: "solid", variant: "accent",   className: "bg-guardia-orange-500 text-guardia-gray-900" },
      { appearance: "solid", variant: "success",  className: "bg-signal-green text-guardia-gray-900" },
      { appearance: "solid", variant: "warning",  className: "bg-signal-yellow text-guardia-purple-900" },
      { appearance: "solid", variant: "danger",   className: "bg-signal-red text-guardia-gray-900" },
      { appearance: "solid", variant: "info",     className: "bg-signal-blue" },

      /* ── OUTLINE ──────────────────────────────────────
       * appearance.outline composites text against bg-background (transparent
       * bg). text-foreground is the only fg that passes WCAG 2.1 §1.4.3
       * AA-Normal (4.5:1) in both themes — aligns with Chip ADR-003 policy
       * (see docs/adr/ADR-003-chip-variants.md, outline section).
       *
       * Border WCAG 2.1 §1.4.11 (3:1 non-text UI) recompute against
       * --background in each theme (per #180):
       *   light --background #FCFCFC | dark --background #17171B
       *
       * Single-token borders (theme-agnostic) failed 3:1 in at least one
       * theme. Fixed with theme-conditional borders via Tailwind `dark:`
       * modifier, picking shades from the palette / signal-* color-mix
       * tokens already published in @theme inline:
       *
       *   variant  light border          ratio  | dark border           ratio
       *   neutral  guardia-gray-500    10.95:1  | guardia-gray-200     7.37:1
       *   brand    guardia-purple-500  12.16:1  | guardia-purple-200   6.80:1
       *   accent   guardia-orange-500   3.07:1  | guardia-orange-500   5.68:1
       *   success  signal-green-700     7.23:1  | signal-green         7.35:1
       *   warning  guardia-yellow-700   3.19:1  | signal-yellow       13.49:1
       *   danger   signal-red           3.57:1  | signal-red           4.88:1
       *   info     signal-blue          7.92:1  | signal-blue-200     11.73:1
       *
       * accent light (3.07:1) is the tightest combo — passes 3:1 by 0.07.
       * orange-500 #E07400 over #FCFCFC sits right at the threshold; kept
       * as-is because it is the canonical brand accent. If visual review
       * ever wants a stricter margin, swap for orange-700 #9C5100 (5.70:1).
       *
       * text-foreground (AA-Normal):
       *   light fg #44186D over #FCFCFC = 12.81:1
       *   dark  fg #FCFCFC over #17171B = 17.41:1
       */
      { appearance: "outline", variant: "neutral",  className: "border-guardia-gray-500 dark:border-guardia-gray-200 text-foreground" },
      { appearance: "outline", variant: "brand",    className: "border-guardia-purple-500 dark:border-guardia-purple-200 text-foreground" },
      { appearance: "outline", variant: "accent",   className: "border-guardia-orange-500 text-foreground" },
      { appearance: "outline", variant: "success",  className: "border-signal-green-700 dark:border-signal-green text-foreground" },
      { appearance: "outline", variant: "warning",  className: "border-guardia-yellow-700 dark:border-signal-yellow text-foreground" },
      { appearance: "outline", variant: "danger",   className: "border-signal-red text-foreground" },
      { appearance: "outline", variant: "info",     className: "border-signal-blue dark:border-signal-blue-200 text-foreground" },
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
