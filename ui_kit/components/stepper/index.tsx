"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Check, X } from "lucide-react";

import { cn } from "@/lib/utils";

/**
 * Stepper — indicador de progresso em fluxo multi-etapa.
 *
 * Uso típico na Guardia:
 *   - Onboarding (conectar banco → importar → configurar regras → revisar)
 *   - Fluxo transacional dentro do Copilot Isac (selecionar → validar → confirmar)
 *   - Processamento longo (upload → parse → match → fechamento)
 *
 * Estados por step: `pending` · `current` · `loading` · `complete` · `error`.
 * Orientação: `horizontal` (default) · `vertical`.
 * Variantes: `numbered` (default) · `iconed` · `compact`.
 * Tamanhos: `md` (default) · `sm`.
 *
 * API espelha `ux_references/ui_kits/components/Stepper/` (referência legacy),
 * trocando classes prefixadas `.grd-st-*` por tokens semânticos Tailwind v4.
 * Decisões registradas em `docs/adr/ADR-020-stepper-v0.1.0-dod-migration.md`.
 *
 * Public surface: `Stepper` (default export), `stepperMarkerVariants` (CVA
 * accessor) + tipos `Step`, `StepState`, `StepperOrientation`, `StepperVariant`.
 */

// ──────────────────────────────────────────────────────────────────
// Types — Step + variants
// ──────────────────────────────────────────────────────────────────

export type StepState =
  | "pending"
  | "current"
  | "loading"
  | "complete"
  | "error";

export type StepperOrientation = "horizontal" | "vertical";
export type StepperVariant = "numbered" | "iconed" | "compact";

/**
 * Component shape for a step icon. Accepts any `lucide-react`-shaped
 * component (`(props: { className?, ... }) => ReactElement`). Render
 * happens inside the marker; consumer controls the icon family.
 */
export type StepIconComponent = React.ComponentType<{
  className?: string;
  "aria-hidden"?: boolean | "true" | "false";
}>;

export interface Step {
  /** Stable id used as React key. */
  id: string;
  /** Headline of the step. */
  title: React.ReactNode;
  /** Optional supporting copy below the title. */
  description?: React.ReactNode;
  /** Icon shown inside the marker when `variant="iconed"`. */
  icon?: StepIconComponent;
  /**
   * Explicit state override. When omitted, the state is derived from
   * `activeIndex`. `loading` and `error` MUST be supplied explicitly —
   * never derived.
   */
  state?: StepState;
  /**
   * Optional inline node rendered below the body — only honored when
   * `orientation="vertical"` and the resolved state is `current` or
   * `loading`. Useful for inline action buttons, helper inputs, etc.
   */
  meta?: React.ReactNode;
}

// ──────────────────────────────────────────────────────────────────
// CVA — marker variants (state × size)
// ──────────────────────────────────────────────────────────────────

const stepperMarkerVariants = cva(
  [
    "inline-flex shrink-0 items-center justify-center rounded-full",
    "border-[1.5px] font-sans font-semibold leading-none",
    "transition-[background-color,border-color,color,box-shadow] duration-150",
    "[font-feature-settings:'tnum']",
  ].join(" "),
  {
    variants: {
      state: {
        pending: "bg-card border-border text-fg-muted",
        current:
          "bg-primary border-primary text-primary-foreground ring-4 ring-primary/15",
        loading:
          "bg-primary/10 border-primary text-primary ring-4 ring-primary/15",
        complete:
          "bg-primary border-primary text-primary-foreground",
        error: "bg-danger-soft border-danger text-danger",
      },
      size: {
        sm: "size-5 text-[11px]",
        md: "size-6 text-xs",
      },
    },
    defaultVariants: { state: "pending", size: "md" },
  },
);

// ──────────────────────────────────────────────────────────────────
// Helpers — state derivation + connector classes
// ──────────────────────────────────────────────────────────────────

function resolveState(step: Step, index: number, activeIndex: number): StepState {
  if (step.state) return step.state;
  if (index < activeIndex) return "complete";
  if (index === activeIndex) return "current";
  return "pending";
}

/**
 * Connector classes resolved per orientation × size × variant. The
 * connector is the `::after` pseudo-element of each non-last `<li>`
 * spanning to the next marker.
 */
function connectorClasses(
  orientation: StepperOrientation,
  variant: StepperVariant,
  size: "sm" | "md",
  state: StepState,
): string {
  // Connector is colored when the originating step has progressed past
  // the dormant `pending` / `error` states. `error` keeps the neutral
  // border color — the chain is broken at that point.
  const colorClass =
    state === "complete" || state === "current" || state === "loading"
      ? "after:bg-primary"
      : "after:bg-border";

  if (orientation === "horizontal") {
    if (variant === "compact") {
      // Compact horizontal: line centered vertically between dots.
      const compactSize =
        size === "sm"
          ? "after:left-[calc(50%+5px)] after:right-[calc(-50%+5px)]"
          : "after:left-[calc(50%+7px)] after:right-[calc(-50%+7px)]";
      return cn(
        'after:content-[""] after:absolute after:top-1/2 after:-translate-y-1/2',
        "after:h-px after:z-0",
        compactSize,
        colorClass,
      );
    }
    // Numbered / Iconed horizontal: line at marker vertical center
    const offsets =
      size === "sm"
        ? "after:top-[10px] after:left-[calc(50%+10px)] after:right-[calc(-50%+10px)]"
        : "after:top-3 after:left-[calc(50%+12px)] after:right-[calc(-50%+12px)]";
    return cn(
      'after:content-[""] after:absolute',
      "after:h-px after:z-0",
      offsets,
      colorClass,
    );
  }

  // Vertical
  if (variant === "compact") {
    const compactSize =
      size === "sm"
        ? "after:top-[14px] after:left-[6px]"
        : "after:top-4 after:left-[7px]";
    return cn(
      'after:content-[""] after:absolute',
      "after:bottom-0 after:w-px after:z-0",
      compactSize,
      colorClass,
    );
  }
  const offsets =
    size === "sm"
      ? "after:top-6 after:left-[9px]"
      : "after:top-7 after:left-[11px]";
  return cn(
    'after:content-[""] after:absolute',
    "after:bottom-0 after:w-px after:z-0",
    offsets,
    colorClass,
  );
}

function compactMarkerSize(size: "sm" | "md"): string {
  return size === "sm"
    ? "size-[10px] border-[1.5px]"
    : "size-[14px] border-[1.5px]";
}

// ──────────────────────────────────────────────────────────────────
// Stepper — main component
// ──────────────────────────────────────────────────────────────────

export interface StepperProps
  extends Omit<React.HTMLAttributes<HTMLOListElement>, "onClick"> {
  /** Ordered list of steps. */
  steps: Step[];
  /**
   * Index of the active step. Derived states (when `step.state` is not
   * explicit) flow from this value. Default `0`.
   */
  activeIndex?: number;
  /** Layout orientation. Default `"horizontal"`. */
  orientation?: StepperOrientation;
  /** Marker variant. Default `"numbered"`. */
  variant?: StepperVariant;
  /** Marker size. Default `"md"`. */
  size?: "sm" | "md";
  /**
   * Click handler. When supplied, steps in state `current`, `complete`
   * or `error` render as `<button>` and call back with the clicked
   * index + step. Steps in `pending` or `loading` are never clickable.
   */
  onStepClick?: (index: number, step: Step) => void;
  /**
   * Accessible label for the ordered list. Default `"Progresso"`.
   * Override when the stepper has a more specific role in context.
   */
  "aria-label"?: string;
}

const Stepper = React.forwardRef<HTMLOListElement, StepperProps>(function Stepper(
  {
    steps,
    activeIndex = 0,
    orientation = "horizontal",
    variant = "numbered",
    size = "md",
    onStepClick,
    className,
    "aria-label": ariaLabel = "Progresso",
    ...rest
  },
  ref,
) {
  const isHorizontal = orientation === "horizontal";
  const isCompact = variant === "compact";

  return (
    <ol
      ref={ref}
      aria-label={ariaLabel}
      className={cn(
        "list-none p-0 m-0 font-sans text-fg",
        isHorizontal ? "flex items-start gap-0" : "flex flex-col",
        className,
      )}
      {...rest}
    >
      {steps.map((step, index) => {
        const state = resolveState(step, index, activeIndex);
        const isLast = index === steps.length - 1;
        const clickable =
          Boolean(onStepClick) &&
          state !== "pending" &&
          state !== "loading";
        const showMeta =
          !isHorizontal &&
          step.meta &&
          (state === "current" || state === "loading");

        // Marker contents
        const IconCmp = step.icon;
        const markerContent =
          state === "complete" ? (
            <Check aria-hidden="true" className={size === "sm" ? "size-3" : "size-3.5"} />
          ) : state === "error" ? (
            <X aria-hidden="true" className={size === "sm" ? "size-3" : "size-3.5"} />
          ) : state === "loading" ? (
            <span
              role="status"
              aria-label="carregando"
              className={cn(
                "inline-block rounded-full border-[1.5px] border-primary/30 border-t-primary",
                "animate-spin",
                size === "sm" ? "size-2.5" : "size-3",
              )}
            />
          ) : isCompact ? null : variant === "iconed" && IconCmp ? (
            <IconCmp
              aria-hidden="true"
              className={size === "sm" ? "size-3" : "size-3.5"}
            />
          ) : (
            <span aria-hidden="true">{index + 1}</span>
          );

        const markerClass = isCompact
          ? cn(
              stepperMarkerVariants({ state, size }),
              compactMarkerSize(size),
              // override font-size / leading not needed for compact (no text)
              "relative z-10",
            )
          : cn(stepperMarkerVariants({ state, size }), "relative z-10");

        const marker = (
          <span
            className={cn(markerClass, "shrink-0")}
            aria-hidden={state !== "loading" ? "true" : undefined}
          >
            {markerContent}
          </span>
        );

        const body =
          isCompact ? null : (
            <div
              className={cn(
                "flex min-w-0 flex-col gap-0.5",
                isHorizontal ? "items-center pt-0 text-center" : "pt-0.5",
              )}
            >
              <span
                className={cn(
                  "text-sm leading-tight font-semibold",
                  state === "pending" && "text-fg-muted font-medium",
                  (state === "current" || state === "loading") && "text-primary",
                  // WHY: text-danger (--signal-red #FF3131) over surface bg = 4.0:1, below WCAG AA 4.5:1 for normal text.
                  // --danger-fg (#7A0E0E light / white dark) is the high-contrast danger text token (≥ 7.5:1 AAA).
                  state === "error" && "text-danger-fg",
                  state === "complete" && "text-fg",
                  size === "sm" && "text-xs",
                )}
              >
                {step.title}
              </span>
              {step.description ? (
                <span
                  className={cn(
                    "text-xs leading-snug text-fg-muted",
                    state === "loading" && "text-primary",
                    state === "error" && "text-danger-fg",
                    size === "sm" && "text-[11px]",
                  )}
                >
                  {step.description}
                </span>
              ) : null}
            </div>
          );

        const innerLayout = isHorizontal
          ? "flex w-full flex-col items-center gap-2 px-2 py-1 text-left"
          : "flex w-full items-start gap-2.5 py-1 text-left";

        const interactiveClass = clickable
          ? cn(
              "cursor-pointer rounded-sm",
              "transition-colors duration-150",
              "hover:bg-primary/5",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1",
            )
          : "";

        const inner = clickable ? (
          <button
            type="button"
            onClick={() => onStepClick?.(index, step)}
            className={cn(innerLayout, interactiveClass, "appearance-none border-0 bg-transparent")}
          >
            {marker}
            {body}
          </button>
        ) : (
          <div role="presentation" className={innerLayout}>
            {marker}
            {body}
          </div>
        );

        return (
          <li
            key={step.id}
            aria-current={state === "current" ? "step" : undefined}
            className={cn(
              "relative",
              isHorizontal ? "flex flex-1 min-w-0 items-start" : "flex flex-col",
              !isHorizontal && !isLast && "pb-4",
              !isLast && connectorClasses(orientation, variant, size, state),
            )}
          >
            {inner}
            {showMeta ? (
              <div
                className={cn(
                  "pt-2",
                  size === "sm" ? "pl-[30px]" : "pl-[34px]",
                )}
              >
                {step.meta}
              </div>
            ) : null}
          </li>
        );
      })}
    </ol>
  );
});
Stepper.displayName = "Stepper";

// ──────────────────────────────────────────────────────────────────
// Exports
// ──────────────────────────────────────────────────────────────────

export { Stepper, stepperMarkerVariants };
export type { VariantProps };
