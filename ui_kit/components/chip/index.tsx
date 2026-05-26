import * as React from "react";
import { X } from "lucide-react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

/**
 * Chip — item compacto para filtros, tags removíveis e seletores.
 *
 * Quatro modos (combinam):
 *  1. Filtro (toggle)    → passe `onSelect` + `selected`.
 *  2. Tag removível      → passe `onRemove`.
 *  3. Filtro + remoção   → passe ambos; split-button para evitar
 *                          nested-interactive (axe / WCAG 4.1.2).
 *  4. Só visual          → sem handlers, apenas como rótulo.
 *
 * **API 2-axis (per ADR-003):**
 *
 *  - `variant`: `neutral | brand | accent | success | warning | danger | info` (default `brand`)
 *  - `appearance`: `soft | solid | outline` (default `outline`)
 *  - `selected`: `bool` (default `false`)
 *
 * **Asymmetry warning (ADR-003 decisão 5):** quando `selected: true`, o chip
 * **sempre** renderiza como solid, **ignorando** a prop `appearance`. O choice
 * do consumer em `appearance` só vale para o estado resting (`selected: false`).
 *
 * **Backward-compat:** `<Chip>` sem props == `<Chip variant="brand"
 * appearance="outline" selected={false}>` → render byte-identical ao
 * comportamento pre-#168.
 *
 * See `docs/adr/ADR-003-chip-variants.md` for token mapping + WCAG analysis.
 */
const chipVariants = cva(
  [
    "inline-flex items-center gap-1.5 whitespace-nowrap select-none",
    "rounded-full border transition-colors",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
  ].join(" "),
  {
    variants: {
      size: {
        sm: "h-6 px-2.5 text-[12px] font-medium",
        md: "h-8 px-3 text-[13px] font-medium",
      },
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
        soft: "",
        solid: "",
        outline: "",
      },
      selected: {
        true: "",
        false: "",
      },
      interactive: {
        true: "cursor-pointer",
        // WHY: non-interactive chips opt out of hover affordance entirely —
        // hover classes are emitted only by `interactive: true` compounds.
        // Aligns with ADR-002 (hover-on-action policy).
        false: "cursor-default",
      },
      disabled: {
        // WHY: Chip renders as <span> (no native :disabled), so the
        // Tailwind `disabled:` modifier never matches. Apply
        // pointer-events-none directly on the variant.
        true: "opacity-50 cursor-not-allowed pointer-events-none",
        false: "",
      },
    },
    // WHY: compound variants encode the full 7×3×2 matrix (variant × appearance × selected)
    // per ADR-003 decisões 3–6. Ordering: SELECTED first (always wins → solid), then
    // resting states by appearance. Hover is opt-in via `interactive: true` compounds
    // only — non-interactive chips never receive hover classes.
    compoundVariants: [
      // ─── SELECTED: TRUE (always solid, regardless of `appearance` per ADR-003 decisão 5) ───
      { selected: true, variant: "neutral",  className: "bg-guardia-gray-500 border-guardia-gray-500 text-white" },
      { selected: true, variant: "brand",    className: "bg-action border-action text-button-fg" },
      { selected: true, variant: "accent",   className: "bg-accent-brand border-accent-brand text-guardia-gray-900" },
      { selected: true, variant: "success",  className: "bg-signal-green border-signal-green text-guardia-gray-900" },
      { selected: true, variant: "warning",  className: "bg-signal-yellow border-signal-yellow text-guardia-violet-900" },
      { selected: true, variant: "danger",   className: "bg-signal-red border-signal-red text-guardia-gray-900" },
      { selected: true, variant: "info",     className: "bg-signal-blue border-signal-blue text-white" },

      // ─── RESTING (selected: false) — appearance: solid ──────────────────
      // Same token mapping as selected solid, sem o estado "ativo" mas
      // visualmente sólido (consumer preset).
      { selected: false, appearance: "solid", variant: "neutral",  className: "bg-guardia-gray-500 border-guardia-gray-500 text-white" },
      { selected: false, appearance: "solid", variant: "brand",    className: "bg-action border-action text-button-fg" },
      { selected: false, appearance: "solid", variant: "accent",   className: "bg-accent-brand border-accent-brand text-guardia-gray-900" },
      { selected: false, appearance: "solid", variant: "success",  className: "bg-signal-green border-signal-green text-guardia-gray-900" },
      { selected: false, appearance: "solid", variant: "warning",  className: "bg-signal-yellow border-signal-yellow text-guardia-violet-900" },
      { selected: false, appearance: "solid", variant: "danger",   className: "bg-signal-red border-signal-red text-guardia-gray-900" },
      { selected: false, appearance: "solid", variant: "info",     className: "bg-signal-blue border-signal-blue text-white" },

      // ─── RESTING (selected: false) — appearance: soft ───────────────────
      // Badge's soft palette adopted verbatim (validated). text contrast
      // verified against AA on the corresponding *-100/*-700 pairs.
      { selected: false, appearance: "soft", variant: "neutral",  className: "bg-guardia-gray-100 border-transparent text-guardia-gray-700" },
      { selected: false, appearance: "soft", variant: "brand",    className: "bg-guardia-violet-100 border-transparent text-guardia-violet-700" },
      { selected: false, appearance: "soft", variant: "accent",   className: "bg-guardia-orange-100 border-transparent text-guardia-orange-700" },
      { selected: false, appearance: "soft", variant: "success",  className: "bg-signal-green-100 border-transparent text-signal-green-700" },
      { selected: false, appearance: "soft", variant: "warning",  className: "bg-guardia-yellow-100 border-transparent text-guardia-yellow-900" },
      { selected: false, appearance: "soft", variant: "danger",   className: "bg-signal-red-100 border-transparent text-signal-red-700" },
      { selected: false, appearance: "soft", variant: "info",     className: "bg-signal-blue-100 border-transparent text-signal-blue-700" },

      // ─── RESTING (selected: false) — appearance: outline ────────────────
      // `neutral` and `brand`: backward-compat path. ADR-003 decisão 4 — the
      // current Chip resting render (gray border, neutral text, hover to
      // bg-bg-hover + border-action) is preserved byte-identical for
      // `outline brand` (default). `neutral` shares the same look since both
      // converge on neutral text + gray border.
      { selected: false, appearance: "outline", variant: "neutral",  className: "bg-background border-border-strong text-foreground" },
      { selected: false, appearance: "outline", variant: "brand",    className: "bg-background border-border-strong text-foreground" },
      // Other variants: variant-tinted border + neutral text to ensure
      // WCAG AA across all 4 problematic signal colors (text-signal-red,
      // text-signal-yellow, text-signal-green, text-accent-brand all fail
      // AA-Normal over white per ADR-003 WCAG table). Border carries the
      // variant signal; text stays AA-safe via text-foreground.
      { selected: false, appearance: "outline", variant: "accent",   className: "bg-background border-accent-brand text-foreground" },
      { selected: false, appearance: "outline", variant: "success",  className: "bg-background border-signal-green text-foreground" },
      { selected: false, appearance: "outline", variant: "warning",  className: "bg-background border-signal-yellow text-foreground" },
      { selected: false, appearance: "outline", variant: "danger",   className: "bg-background border-signal-red text-foreground" },
      { selected: false, appearance: "outline", variant: "info",     className: "bg-background border-signal-blue text-foreground" },

      // ─── HOVER on RESTING (selected: false, interactive: true) ──────────
      // outline neutral/brand: backward-compat hover (bg-bg-hover + border-action)
      // outline other variants: variant-tinted bg-hover, keep variant border
      // soft: bump to next-tier soft tint
      // solid resting: no hover override (matches selected solid stable per ADR-002)
      { selected: false, interactive: true, appearance: "outline", variant: "neutral",  className: "hover:bg-bg-hover hover:border-action" },
      { selected: false, interactive: true, appearance: "outline", variant: "brand",    className: "hover:bg-bg-hover hover:border-action" },
      { selected: false, interactive: true, appearance: "outline", variant: "accent",   className: "hover:bg-guardia-orange-100" },
      { selected: false, interactive: true, appearance: "outline", variant: "success",  className: "hover:bg-signal-green-outline-hover" },
      { selected: false, interactive: true, appearance: "outline", variant: "warning",  className: "hover:bg-guardia-yellow-100" },
      { selected: false, interactive: true, appearance: "outline", variant: "danger",   className: "hover:bg-signal-red-outline-hover" },
      { selected: false, interactive: true, appearance: "outline", variant: "info",     className: "hover:bg-signal-blue-outline-hover" },

      { selected: false, interactive: true, appearance: "soft", variant: "neutral",  className: "hover:bg-guardia-gray-200" },
      { selected: false, interactive: true, appearance: "soft", variant: "brand",    className: "hover:bg-guardia-violet-200" },
      { selected: false, interactive: true, appearance: "soft", variant: "accent",   className: "hover:bg-guardia-orange-200" },
      { selected: false, interactive: true, appearance: "soft", variant: "success",  className: "hover:bg-signal-green-200" },
      { selected: false, interactive: true, appearance: "soft", variant: "warning",  className: "hover:bg-guardia-yellow-200" },
      { selected: false, interactive: true, appearance: "soft", variant: "danger",   className: "hover:bg-signal-red-200" },
      { selected: false, interactive: true, appearance: "soft", variant: "info",     className: "hover:bg-signal-blue-200" },

      // WHY: no `interactive: false` neutralizer compounds — hover classes
      // are emitted exclusively by the `interactive: true` compounds above,
      // so non-interactive chips already inherit zero hover affordance.
    ],
    defaultVariants: {
      size: "sm",
      variant: "brand",
      appearance: "outline",
      selected: false,
      interactive: false,
      disabled: false,
    },
  },
);

export interface ChipProps
  extends Omit<React.HTMLAttributes<HTMLSpanElement>, "onClick" | "onSelect">,
    Pick<VariantProps<typeof chipVariants>, "size" | "variant" | "appearance"> {
  /** Estado selecionado. */
  selected?: boolean;
  /** Toggle handler — torna o chip interativo (role=button + teclado). */
  onSelect?: (next: boolean) => void;
  /** Remove handler — adiciona botão ×  no fim. */
  onRemove?: () => void;
  /** Desabilita seleção e remoção. */
  disabled?: boolean;
  /** Ícone antes do texto. */
  leadingIcon?: React.ReactNode;
}

const Chip = React.forwardRef<HTMLSpanElement, ChipProps>(
  (
    {
      className,
      size,
      variant,
      appearance,
      selected = false,
      onSelect,
      onRemove,
      disabled = false,
      leadingIcon,
      children,
      onKeyDown,
      ...props
    },
    ref,
  ) => {
    const interactive = typeof onSelect === "function";
    const removable = typeof onRemove === "function";
    // WHY: when both handlers exist we render two sibling <button>s inside a
    // non-interactive <span>. A `role="button"` span wrapping a real <button>
    // triggers axe's nested-interactive rule (WCAG 4.1.2).
    const splitInteractive = interactive && removable;

    const handleSelect = () => {
      if (disabled || !onSelect) return;
      onSelect(!selected);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLSpanElement>) => {
      onKeyDown?.(e);
      if (!interactive || splitInteractive || disabled) return;
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        handleSelect();
      }
    };

    const outerInteractive = interactive && !splitInteractive;

    const removeButton = removable ? (
      <button
        type="button"
        aria-label="Remover"
        disabled={disabled}
        onClick={(e) => {
          e.stopPropagation();
          if (!disabled) onRemove?.();
        }}
        className={cn(
          "-mr-1 inline-flex size-4 items-center justify-center rounded-full transition-colors",
          "hover:bg-black/10",
          selected && "hover:bg-white/20",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          disabled && "cursor-not-allowed",
        )}
      >
        <X className="size-3" aria-hidden="true" />
      </button>
    ) : null;

    if (splitInteractive) {
      return (
        <span
          ref={ref}
          data-slot="chip"
          data-variant={variant ?? "brand"}
          data-appearance={appearance ?? "outline"}
          data-selected={selected || undefined}
          data-disabled={disabled || undefined}
          aria-disabled={disabled || undefined}
          className={cn(
            chipVariants({ size, variant, appearance, selected, interactive: false, disabled }),
            "[&_svg]:pointer-events-none [&_svg]:size-3.5 [&_svg]:shrink-0",
            className,
          )}
          {...props}
        >
          {/* WHY: forward consumer's `onKeyDown` to the inner button — it is
              now the focusable target in split-interactive mode, so keyboard
              handlers attached by consumers must land here (focus / blur
              already bubble in React, but key events on a focusable child
              would only synthesize on the child). */}
          <button
            type="button"
            aria-pressed={selected}
            disabled={disabled}
            onClick={handleSelect}
            onKeyDown={onKeyDown as React.KeyboardEventHandler<HTMLButtonElement> | undefined}
            className={cn(
              "-mx-2.5 -my-1 inline-flex items-center gap-1.5 self-stretch px-2.5 py-1",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
              "rounded-full",
              !disabled && "cursor-pointer",
              disabled && "cursor-not-allowed",
            )}
          >
            {leadingIcon}
            <span>{children}</span>
          </button>
          {removeButton}
        </span>
      );
    }

    return (
      <span
        ref={ref}
        data-slot="chip"
        data-variant={variant ?? "brand"}
        data-appearance={appearance ?? "outline"}
        data-selected={selected || undefined}
        data-disabled={disabled || undefined}
        role={outerInteractive ? "button" : undefined}
        tabIndex={outerInteractive && !disabled ? 0 : undefined}
        aria-pressed={outerInteractive ? selected : undefined}
        aria-disabled={disabled || undefined}
        onClick={outerInteractive ? handleSelect : undefined}
        onKeyDown={handleKeyDown}
        className={cn(
          chipVariants({ size, variant, appearance, selected, interactive: outerInteractive, disabled }),
          "[&_svg]:pointer-events-none [&_svg]:size-3.5 [&_svg]:shrink-0",
          className,
        )}
        {...props}
      >
        {leadingIcon}
        <span>{children}</span>
        {removeButton}
      </span>
    );
  },
);
Chip.displayName = "Chip";

export { Chip, chipVariants };
