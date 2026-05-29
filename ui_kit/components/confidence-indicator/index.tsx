import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

/**
 * ConfidenceIndicator — semáforo de confiança para outputs de IA
 * (superfície AI-First do `@guardia/design-system`).
 *
 * Comunica o grau de confiança da Guardia em uma decisão de agente,
 * usando o sistema Lighthouse alinhado ao bundle legacy:
 *
 *   high   — ≥ 95 % — auto-aplicado
 *   medium — 80 – 94 % — revisar
 *   low    — < 80 % — atenção (decisão humana)
 *
 * Três variantes visuais do mesmo valor semântico:
 *
 *   chip (default) — selo compacto com texto e percentual
 *   bar            — barra horizontal com label + percentual
 *   dot            — bullet inline (uso em listas densas)
 *
 * Contrato ARIA — `role="meter"` por WAI-ARIA 1.2 §5.3.18 (medida
 * escalar dentro de intervalo conhecido). `aria-valuenow`,
 * `aria-valuemin=0`, `aria-valuemax=100`, `aria-valuetext` (sempre)
 * e `aria-label` (auto-composto, sobrescrevível) garantem leitor de
 * tela mesmo quando o AT ignora os campos escalares do `meter`.
 *
 * Tokens semânticos exclusivamente — paleta de sinal Guardia
 * (`--signal-green` / `--signal-yellow` / `--signal-red`) com
 * recompute WCAG inherindo o padrão Badge (ADR-003). A tier `medium`
 * adota `--guardia-yellow-{100,200,900}` (AAA) porque
 * `signal-yellow` puro sobre tint < 4.5:1.
 *
 * Decisões registradas em
 * `docs/adr/ADR-013-confidence-indicator-v0.1.0-dod-migration.md`.
 */

// ──────────────────────────────────────────────────────────────────
// Domain
// ──────────────────────────────────────────────────────────────────

export type ConfidenceLevel = "high" | "medium" | "low";
export type ConfidenceVariant = "chip" | "bar" | "dot";
export type ConfidenceSize = "sm" | "md";

const DEFAULT_LEVEL_LABELS: Record<ConfidenceLevel, string> = {
  high: "Alta confiança",
  medium: "Revisar",
  low: "Atenção",
};

/**
 * Lighthouse thresholds — constants. Consumer override is intentionally
 * not exposed in v0.1.0 (see ADR-013 § "Fixed thresholds").
 */
const THRESHOLD_HIGH = 95;
const THRESHOLD_MEDIUM = 80;

function deriveLevel(value: number): ConfidenceLevel {
  if (value >= THRESHOLD_HIGH) return "high";
  if (value >= THRESHOLD_MEDIUM) return "medium";
  return "low";
}

/**
 * Clamp value to [0, 100]. Returns `undefined` for `undefined` / `NaN`
 * so the caller can fall back to the explicit `level` prop.
 */
function clampValue(raw: number | undefined): number | undefined {
  if (raw === undefined || Number.isNaN(raw)) return undefined;
  return Math.max(0, Math.min(100, raw));
}

/**
 * Floor of each tier — used when the `bar` variant has only a `level`
 * (no `value`) so the fill width is honest about what is known.
 */
const TIER_FLOOR: Record<ConfidenceLevel, number> = {
  high: THRESHOLD_HIGH,
  medium: THRESHOLD_MEDIUM,
  low: 0,
};

// ──────────────────────────────────────────────────────────────────
// CVA — root variant matrix
// ──────────────────────────────────────────────────────────────────

export const confidenceIndicatorVariants = cva(
  "font-sans tabular-nums",
  {
    variants: {
      variant: {
        chip: "inline-flex items-center whitespace-nowrap",
        dot: "inline-flex items-center text-fg",
        bar: "flex flex-col gap-1.5 min-w-[140px]",
      },
      size: {
        sm: "",
        md: "",
      },
      level: {
        high: "",
        medium: "",
        low: "",
      },
    },
    compoundVariants: [
      // chip × level — surface + text + border per AC-11
      {
        variant: "chip",
        level: "high",
        className:
          "bg-[color-mix(in_oklab,var(--signal-green)_18%,white)] " +
          "text-[color-mix(in_oklab,var(--signal-green)_52%,black)] " +
          "border border-[color-mix(in_oklab,var(--signal-green)_30%,white)]",
      },
      {
        variant: "chip",
        level: "medium",
        className:
          "bg-guardia-yellow-100 text-guardia-yellow-900 border border-guardia-yellow-200",
      },
      {
        variant: "chip",
        level: "low",
        className:
          "bg-[color-mix(in_oklab,var(--signal-red)_14%,white)] " +
          "text-[color-mix(in_oklab,var(--signal-red)_45%,black)] " +
          "border border-[color-mix(in_oklab,var(--signal-red)_30%,white)]",
      },
      // chip × size — padding + font-size
      {
        variant: "chip",
        size: "sm",
        className: "gap-1.5 rounded-full px-1.5 py-0.5 text-[11px] font-semibold leading-none",
      },
      {
        variant: "chip",
        size: "md",
        className: "gap-1.5 rounded-full px-2 py-0.5 text-[12px] font-semibold leading-none",
      },
      // dot × size — typography of the inline label
      { variant: "dot", size: "sm", className: "gap-1.5 text-[11.5px]" },
      { variant: "dot", size: "md", className: "gap-1.5 text-[12.5px]" },
      // bar — typography of meta row applied via children classes; no root size diff
      { variant: "bar", size: "sm", className: "text-[11px]" },
      { variant: "bar", size: "md", className: "text-[11.5px]" },
    ],
    defaultVariants: {
      variant: "chip",
      size: "md",
      level: "high",
    },
  },
);

// dot bullet — bullet size + tier colour applied at the inner span
const dotBulletClass: Record<ConfidenceLevel, string> = {
  high: "bg-[var(--signal-green)] shadow-[0_0_0_2px_color-mix(in_oklab,var(--signal-green)_22%,transparent)]",
  medium:
    "bg-[var(--signal-yellow)] shadow-[0_0_0_2px_color-mix(in_oklab,var(--signal-yellow)_28%,transparent)]",
  low: "bg-[var(--signal-red)] shadow-[0_0_0_2px_color-mix(in_oklab,var(--signal-red)_28%,transparent)]",
};

const dotBulletSize: Record<ConfidenceSize, string> = {
  sm: "h-1.5 w-1.5",
  md: "h-2 w-2",
};

// bar fill colour per tier
const barFillClass: Record<ConfidenceLevel, string> = {
  high: "bg-[var(--signal-green)]",
  medium: "bg-[var(--signal-yellow)]",
  low: "bg-[var(--signal-red)]",
};

// WHY (a11y): the bar value text sits over `--bg` (page surface), which
// inverts between themes. The earlier strategy reused chip-text recompute
// (dark-on-tint), which axe-playwright correctly flags in dark theme
// (`--bg: #17171B`) where `text-guardia-yellow-900` / signal-tier dark mixes
// fall below the 4.5:1 floor. The bar's tier identity is preserved by the
// fill color (`barFillClass`) and `data-level`; the numeric value reads
// against the page foreground (`text-fg`) for consistent AAA in both themes.
const BAR_VALUE_CLASS = "text-fg";

// chip value separator (vertical hairline) — alpha currentColor
const CHIP_VAL_SEPARATOR_CLASS =
  "pl-1.5 border-l border-current/25 font-bold";

// ──────────────────────────────────────────────────────────────────
// Public type
// ──────────────────────────────────────────────────────────────────

type RootVariantProps = Omit<
  VariantProps<typeof confidenceIndicatorVariants>,
  "level"
>;

export interface ConfidenceIndicatorProps
  extends Omit<
      React.HTMLAttributes<HTMLElement>,
      "role" | "aria-valuemin" | "aria-valuemax" | "aria-valuenow"
    >,
    RootVariantProps {
  /** Confidence percentage in [0, 100]. Clamped. */
  value?: number;
  /** Explicit override of the tier; wins over derived level. */
  level?: ConfidenceLevel;
  /** Toggle the visible numeric percentage. Default `true`. */
  showValue?: boolean;
  /** Replace the default tier label (visible AND announced). */
  label?: React.ReactNode;
  /** Partial override of the default pt-BR tier labels. */
  levelLabels?: Partial<Record<ConfidenceLevel, string>>;
  /** Override the auto-composed `aria-label`. */
  "aria-label"?: string;
}

// ──────────────────────────────────────────────────────────────────
// Component
// ──────────────────────────────────────────────────────────────────

/**
 * `React.forwardRef` exposes a ref to the root element regardless of
 * the variant (span for chip/dot, div for bar). The element-type
 * generic stays as `HTMLElement` because the host element differs
 * between variants; consumers can narrow with a type assertion when
 * they statically know the variant.
 */
const ConfidenceIndicator = React.forwardRef<HTMLElement, ConfidenceIndicatorProps>(
  function ConfidenceIndicator(props, ref) {
    const {
      value: rawValue,
      level: explicitLevel,
      variant = "chip",
      size = "md",
      showValue = true,
      label,
      levelLabels,
      className,
      "aria-label": ariaLabelProp,
      ...rest
    } = props;

    // Resolve value + level
    const clamped = clampValue(rawValue);
    const level: ConfidenceLevel =
      explicitLevel ?? (clamped !== undefined ? deriveLevel(clamped) : "high");

    const mergedLabels: Record<ConfidenceLevel, string> = {
      ...DEFAULT_LEVEL_LABELS,
      ...(levelLabels ?? {}),
    };
    const tierLabelString = mergedLabels[level];
    const resolvedLabel: React.ReactNode = label ?? tierLabelString;

    // ARIA composition
    const rounded = clamped !== undefined ? Math.round(clamped) : undefined;
    const ariaValueText =
      rounded !== undefined ? `${tierLabelString} ${rounded}%` : tierLabelString;
    const autoAriaLabel = `Confiança: ${ariaValueText}`;
    const ariaLabel = ariaLabelProp ?? autoAriaLabel;
    // WHY (a11y): `role="meter"` requires `aria-valuenow` (axe `aria-required-attr`,
    // critical). When the caller provides only `level` (no numeric value),
    // fall back to the tier floor — the lowest value still in that tier —
    // which is the most honest scalar the caller has actually asserted.
    // `aria-valuetext` keeps the qualitative tier label so AT announces
    // "Revisar" rather than "80%" when the consumer never claimed precision.
    // Same convention drives the bar `fillPercent` below.
    const ariaValueNow = rounded !== undefined ? rounded : TIER_FLOOR[level];

    const resolvedSize: ConfidenceSize = size ?? "md";
    const resolvedVariant: ConfidenceVariant = variant ?? "chip";

    const rootClassName = cn(
      confidenceIndicatorVariants({ variant: resolvedVariant, size: resolvedSize, level }),
      className,
    );

    // ─── chip ─────────────────────────────────────────────────────
    if (resolvedVariant === "chip") {
      return (
        <span
          {...(rest as React.HTMLAttributes<HTMLSpanElement>)}
          ref={ref as React.Ref<HTMLSpanElement>}
          role="meter"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={ariaValueNow}
          aria-valuetext={ariaValueText}
          aria-label={ariaLabel}
          data-level={level}
          data-variant={resolvedVariant}
          className={rootClassName}
        >
          <span>{resolvedLabel}</span>
          {showValue && rounded !== undefined && (
            <span className={CHIP_VAL_SEPARATOR_CLASS} aria-hidden="true">
              {rounded}%
            </span>
          )}
        </span>
      );
    }

    // ─── dot ──────────────────────────────────────────────────────
    if (resolvedVariant === "dot") {
      return (
        <span
          {...(rest as React.HTMLAttributes<HTMLSpanElement>)}
          ref={ref as React.Ref<HTMLSpanElement>}
          role="meter"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={ariaValueNow}
          aria-valuetext={ariaValueText}
          aria-label={ariaLabel}
          data-level={level}
          data-variant={resolvedVariant}
          className={rootClassName}
        >
          <span
            aria-hidden="true"
            className={cn(
              "inline-block rounded-full",
              dotBulletSize[resolvedSize],
              dotBulletClass[level],
            )}
          />
          <span>{resolvedLabel}</span>
          {showValue && rounded !== undefined && (
            <span className="ml-1.5 font-semibold text-fg" aria-hidden="true">
              {rounded}%
            </span>
          )}
        </span>
      );
    }

    // ─── bar ──────────────────────────────────────────────────────
    // When value is unknown but level is known, render the fill at the
    // tier floor — honest about what is actually known (a level, not a
    // value). `aria-valuenow` shares the same tier-floor fallback so the
    // meter role contract holds (axe `aria-required-attr`); `aria-valuetext`
    // stays the qualitative tier label alone.
    const fillPercent = ariaValueNow;

    return (
      <div
        {...(rest as React.HTMLAttributes<HTMLDivElement>)}
        ref={ref as React.Ref<HTMLDivElement>}
        role="meter"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={ariaValueNow}
        aria-valuetext={ariaValueText}
        aria-label={ariaLabel}
        data-level={level}
        data-variant={resolvedVariant}
        className={rootClassName}
      >
        <div
          aria-hidden="true"
          className="h-[5px] overflow-hidden rounded-full bg-guardia-gray-200"
        >
          <div
            className={cn(
              "h-full rounded-full transition-[width] duration-300 ease-out",
              barFillClass[level],
            )}
            style={{ width: `${fillPercent}%` }}
          />
        </div>
        <div className="flex items-center justify-between gap-3">
          <span className="font-medium text-fg-muted" aria-hidden="true">
            {resolvedLabel}
          </span>
          {showValue && rounded !== undefined && (
            <span className={cn("font-bold", BAR_VALUE_CLASS)} aria-hidden="true">
              {rounded}%
            </span>
          )}
        </div>
      </div>
    );
  },
);

ConfidenceIndicator.displayName = "ConfidenceIndicator";

export { ConfidenceIndicator };
