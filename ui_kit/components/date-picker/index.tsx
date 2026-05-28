"use client";

import * as React from "react";
import * as Popover from "@radix-ui/react-popover";
import { cva, type VariantProps } from "class-variance-authority";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, X } from "lucide-react";
import { DayPicker, type DateRange as RdpDateRange } from "react-day-picker";
import { ptBR } from "date-fns/locale";

import { cn } from "@/lib/utils";

/**
 * DatePicker — seletor de data única OU intervalo (range).
 *
 * Base:
 *   Radix Popover (positioning, outside click, Escape, focus management)
 *   + react-day-picker para a grid (a11y completa de calendar pattern,
 *   nativo `mode="single"` e `mode="range"`).
 *
 * API (discriminated union por `mode`):
 *   mode="single" (default) → value: Date | null; onChange: (Date | null)
 *   mode="range"            → value: DateRange | null;
 *                             onChange: (DateRange | null)
 *
 * Trigger: input-like com ícone de calendário, formato dd/mm/aaaa (BR) em
 * single, dd/mm/aaaa — dd/mm/aaaa em range, com botão X para limpar.
 *
 * Range — políticas (ADR-004):
 *   - auto-swap quando o usuário escolhe to < from
 *   - onChange NÃO dispara em estado parcial; apenas em range completo
 *     ou clear explícito
 *   - Esc com seleção parcial descarta o pending sem disparar onChange
 *   - bordas (from/to) usam bg-action + text-button-fg (mesmos tokens do
 *     selected single); interior usa bg-bg-hover/60. Tudo brand-aware
 *     (post-#226: violet light / orange dark)
 *
 * Acessibilidade:
 *   trigger        role implícito de button + aria-haspopup="dialog"
 *                  + aria-expanded
 *   popover        role="dialog" (Radix)
 *   grid de dias   role="grid" + cells com role="gridcell" (DayPicker)
 *   keyboard       ↑↓←→ navega · Enter seleciona · Page↑↓ muda de mês
 *                  · Home/End início/fim da semana (DayPicker nativo)
 *   range          Esc descarta pending; segundo Enter commit completo
 */

export interface DateRange {
  from: Date;
  to: Date;
}

const triggerVariants = cva(
  [
    "inline-flex items-center gap-2 w-full",
    "bg-background text-fg",
    "border border-border-strong rounded-md",
    "text-left cursor-pointer",
    "transition-[border-color,box-shadow] duration-150",
    /* Hover + open: border action (violet light / orange dark) */
    "enabled:hover:border-action",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
    "data-[state=open]:border-action data-[state=open]:ring-2 data-[state=open]:ring-ring data-[state=open]:ring-offset-2",
    "aria-[invalid=true]:border-destructive aria-[invalid=true]:hover:border-destructive",
    "aria-[invalid=true]:focus-visible:ring-destructive aria-[invalid=true]:data-[state=open]:ring-destructive",
    "disabled:cursor-not-allowed disabled:opacity-70 disabled:bg-muted",
  ].join(" "),
  {
    variants: {
      size: {
        sm: "h-8 px-2.5 text-[13px]",
        md: "h-[38px] px-3 text-sm",
        lg: "h-[46px] px-3.5 text-[15px]",
      },
    },
    defaultVariants: { size: "md" },
  },
);

interface DatePickerCommonProps
  extends VariantProps<typeof triggerVariants> {
  placeholder?: string;
  minDate?: Date;
  maxDate?: Date;
  disabled?: boolean;
  invalid?: boolean;
  clearable?: boolean;
  showToday?: boolean;
  name?: string;
  id?: string;
  className?: string;
  /** Forçar abertura para fins de teste/controle externo. */
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** aria-label customizada do trigger (default depende do `mode`). */
  "aria-label"?: string;
}

export interface DatePickerSingleProps extends DatePickerCommonProps {
  mode?: "single";
  value?: Date | null;
  defaultValue?: Date | null;
  onChange?: (date: Date | null) => void;
}

export interface DatePickerRangeProps extends DatePickerCommonProps {
  mode: "range";
  value?: DateRange | null;
  defaultValue?: DateRange | null;
  onChange?: (range: DateRange | null) => void;
}

export type DatePickerProps = DatePickerSingleProps | DatePickerRangeProps;

function fmtBR(d: Date | null | undefined): string {
  if (!d) return "";
  const p = (n: number) => String(n).padStart(2, "0");
  return `${p(d.getDate())}/${p(d.getMonth() + 1)}/${d.getFullYear()}`;
}

function fmtRangeBR(r: DateRange | null | undefined): string {
  if (!r || !r.from || !r.to) return "";
  return `${fmtBR(r.from)} — ${fmtBR(r.to)}`;
}

function toISODate(d: Date | null | undefined): string {
  if (!d) return "";
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

function sortAscending(a: Date, b: Date): DateRange {
  return a.getTime() <= b.getTime() ? { from: a, to: b } : { from: b, to: a };
}

function isRangeMode(
  props: DatePickerProps,
): props is DatePickerRangeProps {
  return props.mode === "range";
}

const DatePicker = React.forwardRef<HTMLButtonElement, DatePickerProps>(
  (props, ref) => {
    const {
      placeholder,
      size = "md",
      minDate,
      maxDate,
      disabled,
      invalid,
      clearable = true,
      showToday = true,
      name,
      id,
      className,
      open: openProp,
      onOpenChange,
      "aria-label": ariaLabelProp,
    } = props;

    const reactId = React.useId();
    const triggerId = id ?? reactId;
    const ariaLabel =
      ariaLabelProp ??
      (isRangeMode(props)
        ? "Selecionar intervalo de datas"
        : "Selecionar data");

    /* ------------------------------- state ------------------------------- */

    const isControlled = props.value !== undefined;

    /* WHY: storing `Date | null` for single OR `DateRange | null` for range
       in one ref. The component narrows on `props.mode` whenever it reads,
       so the union shape is local and never escapes the public API. */
    const [internalSingle, setInternalSingle] = React.useState<Date | null>(
      !isRangeMode(props) ? props.defaultValue ?? null : null,
    );
    const [internalRange, setInternalRange] =
      React.useState<DateRange | null>(
        isRangeMode(props) ? props.defaultValue ?? null : null,
      );

    /* Partial selection holder for range mode — never escapes onChange. */
    const [pendingFrom, setPendingFrom] = React.useState<Date | null>(null);

    const currentSingle: Date | null = isRangeMode(props)
      ? null
      : isControlled
        ? (props.value as Date | null) ?? null
        : internalSingle;

    const currentRange: DateRange | null = isRangeMode(props)
      ? isControlled
        ? (props.value as DateRange | null) ?? null
        : internalRange
      : null;

    const isOpenControlled = openProp !== undefined;
    const [internalOpen, setInternalOpen] = React.useState(false);
    const open = isOpenControlled ? !!openProp : internalOpen;
    const setOpen = (next: boolean) => {
      if (disabled && next) return;
      if (!isOpenControlled) setInternalOpen(next);
      onOpenChange?.(next);
      if (!next) {
        /* Closing the popover discards any partial range. */
        setPendingFrom(null);
      }
    };

    /* viewMonth pivots on the currently-committed left endpoint of the range
       or the single selection; falls back to today otherwise. */
    const pivotDate = isRangeMode(props) ? currentRange?.from : currentSingle;
    const pivotKey = pivotDate ? pivotDate.getTime() : null;
    const [viewMonth, setViewMonth] = React.useState<Date>(
      pivotDate ?? new Date(),
    );
    React.useEffect(() => {
      if (pivotDate) setViewMonth(pivotDate);
      /* WHY: pivotDate carries identity per render but pivotKey is the
         stable numeric trigger we want to depend on. */
      /* eslint-disable-next-line react-hooks/exhaustive-deps */
    }, [pivotKey]);

    /* ------------------------------ commit -------------------------------*/

    function commitSingle(d: Date | null) {
      if (!isControlled) setInternalSingle(d);
      const handler = (props as DatePickerSingleProps).onChange;
      handler?.(d);
    }

    function commitRange(r: DateRange | null) {
      if (!isControlled) setInternalRange(r);
      const handler = (props as DatePickerRangeProps).onChange;
      handler?.(r);
    }

    /* ----------------------- single-mode click flow ----------------------*/

    function pickSingle(d: Date | undefined) {
      if (!d) return;
      commitSingle(d);
      setOpen(false);
    }

    /* ----------------------- range-mode click flow -----------------------*/

    function pickRange(_value: RdpDateRange | undefined, triggerDate: Date) {
      /* WHY: we ignore RDP's own range tracking and drive the state from
         the triggerDate alone. This makes the flow predictable for our
         partial-onChange + auto-swap policies (ADR-004) without fighting
         RDP's internal state machine. */
      if (!triggerDate) return;
      if (pendingFrom === null) {
        /* First click commits as pending `from` — no onChange yet. */
        setPendingFrom(triggerDate);
        return;
      }
      /* Second click → auto-swap if needed → commit complete range. */
      const next = sortAscending(pendingFrom, triggerDate);
      setPendingFrom(null);
      commitRange(next);
      setOpen(false);
    }

    /* -------------------------- clear / today ----------------------------*/

    function clear(e: React.MouseEvent) {
      e.stopPropagation();
      e.preventDefault();
      setPendingFrom(null);
      if (isRangeMode(props)) commitRange(null);
      else commitSingle(null);
    }

    function pickToday() {
      const t = new Date();
      if (isRangeMode(props)) {
        /* "Hoje" in range mode behaves as the first click. */
        if (pendingFrom === null) {
          setPendingFrom(t);
        } else {
          const next = sortAscending(pendingFrom, t);
          setPendingFrom(null);
          commitRange(next);
          setOpen(false);
        }
      } else {
        commitSingle(t);
        setOpen(false);
      }
    }

    /* --------------------------- trigger value ---------------------------*/

    const triggerText = (() => {
      if (isRangeMode(props)) {
        if (pendingFrom && !currentRange) {
          return `${fmtBR(pendingFrom)} — `;
        }
        if (pendingFrom && currentRange) {
          /* User started a new selection while a previous range exists —
             show the new pending from, drop the old `to` from view. */
          return `${fmtBR(pendingFrom)} — `;
        }
        if (currentRange) return fmtRangeBR(currentRange);
        return placeholder ?? "dd/mm/aaaa — dd/mm/aaaa";
      }
      if (currentSingle) return fmtBR(currentSingle);
      return placeholder ?? "dd/mm/aaaa";
    })();

    const hasValue = isRangeMode(props)
      ? !!currentRange
      : !!currentSingle;

    const iconPx = size === "sm" ? 14 : size === "lg" ? 18 : 16;
    const showClear = Boolean(clearable && hasValue && !disabled);

    /* --------------------- DayPicker props per mode ----------------------*/

    const dayPickerDisabled =
      minDate || maxDate
        ? [
            ...(minDate ? [{ before: minDate }] : []),
            ...(maxDate ? [{ after: maxDate }] : []),
          ]
        : undefined;

    /* Slot classNames shared across modes. Range slots reuse the single
       `selected` recipe for the edges (bg-action + text-button-fg) and a
       soft surface for the middle, all brand-aware. Inner corners cancel
       so consecutive selected days read as a continuous bar. */
    const sharedClassNames = {
      months: "flex flex-col",
      month: "flex flex-col gap-2",
      month_caption:
        "flex h-7 items-center justify-center text-[13.5px] font-semibold text-fg",
      caption_label: "select-none",
      nav: "flex items-center justify-between absolute left-0 right-0 px-1",
      button_previous:
        "inline-flex h-7 w-7 items-center justify-center rounded-md border-0 bg-transparent text-fg hover:bg-bg-hover/50 hover:text-action focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
      button_next:
        "inline-flex h-7 w-7 items-center justify-center rounded-md border-0 bg-transparent text-fg hover:bg-bg-hover/50 hover:text-action focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
      month_grid: "border-collapse",
      weekdays: "flex",
      weekday:
        "w-9 text-center text-[11px] font-semibold uppercase tracking-wide text-fg-muted py-1",
      week: "flex mt-0.5",
      day: "flex h-9 w-9 items-center justify-center p-0 text-[13px] tabular-nums",
      day_button: cn(
        "h-8 w-8 inline-flex items-center justify-center rounded-md border-0 bg-transparent text-fg",
        "transition-colors duration-100",
        "hover:bg-bg-hover/50 hover:text-action",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        "disabled:cursor-not-allowed disabled:opacity-35",
      ),
      today: "[&_button]:font-bold [&_button]:text-action",
      selected:
        "[&_button]:bg-action [&_button]:text-button-fg [&_button]:hover:bg-action [&_button]:hover:text-button-fg [&_button]:font-semibold",
      range_start:
        "[&_button]:bg-action [&_button]:text-button-fg [&_button]:hover:bg-action [&_button]:hover:text-button-fg [&_button]:font-semibold [&_button]:rounded-l-md [&_button]:rounded-r-none",
      range_end:
        "[&_button]:bg-action [&_button]:text-button-fg [&_button]:hover:bg-action [&_button]:hover:text-button-fg [&_button]:font-semibold [&_button]:rounded-r-md [&_button]:rounded-l-none",
      range_middle:
        "bg-bg-hover/60 [&_button]:bg-transparent [&_button]:text-fg [&_button]:rounded-none [&_button]:hover:bg-bg-hover/80",
      outside: "[&_button]:text-fg-muted [&_button]:opacity-60",
      disabled: "[&_button]:cursor-not-allowed [&_button]:opacity-35",
      hidden: "invisible",
    } as const;

    const dayPickerNode = isRangeMode(props) ? (
      <DayPicker
        mode="range"
        selected={
          currentRange
            ? (currentRange as RdpDateRange)
            : pendingFrom
              ? ({ from: pendingFrom, to: undefined } as RdpDateRange)
              : undefined
        }
        onSelect={pickRange}
        month={viewMonth}
        onMonthChange={setViewMonth}
        locale={ptBR}
        showOutsideDays
        disabled={dayPickerDisabled}
        classNames={sharedClassNames}
        components={{
          Chevron: ({ orientation }) =>
            orientation === "left" ? (
              <ChevronLeft width={16} height={16} aria-hidden="true" />
            ) : (
              <ChevronRight width={16} height={16} aria-hidden="true" />
            ),
        }}
      />
    ) : (
      <DayPicker
        mode="single"
        selected={currentSingle ?? undefined}
        onSelect={pickSingle}
        month={viewMonth}
        onMonthChange={setViewMonth}
        locale={ptBR}
        showOutsideDays
        disabled={dayPickerDisabled}
        classNames={sharedClassNames}
        components={{
          Chevron: ({ orientation }) =>
            orientation === "left" ? (
              <ChevronLeft width={16} height={16} aria-hidden="true" />
            ) : (
              <ChevronRight width={16} height={16} aria-hidden="true" />
            ),
        }}
      />
    );

    return (
      <Popover.Root open={open} onOpenChange={setOpen}>
        {/* WHY: clear button lives OUTSIDE the trigger as an absolutely
            positioned sibling. Nesting a real <button> (or role="button"
            span) inside the trigger button triggers axe's nested-interactive
            rule (WCAG 4.1.2). A relative wrapper preserves layout; an
            aria-hidden spacer inside the trigger reserves the visual slot. */}
        <div className="relative flex w-full">
          <Popover.Trigger asChild>
            <button
              ref={ref}
              id={triggerId}
              type="button"
              aria-haspopup="dialog"
              aria-label={ariaLabel}
              data-invalid={invalid || undefined}
              disabled={disabled}
              className={cn(triggerVariants({ size }), className)}
            >
              <CalendarIcon
                width={iconPx}
                height={iconPx}
                aria-hidden="true"
                className="shrink-0 text-fg-muted"
              />
              <span
                className={cn(
                  "flex-1 overflow-hidden text-ellipsis whitespace-nowrap tabular-nums",
                  !hasValue && !pendingFrom && "text-fg-muted",
                )}
              >
                {triggerText}
              </span>
              {showClear && (
                <span
                  aria-hidden="true"
                  className="inline-flex h-4 w-4 shrink-0"
                />
              )}
            </button>
          </Popover.Trigger>
          {showClear && (
            <button
              type="button"
              aria-label={
                isRangeMode(props) ? "Limpar intervalo" : "Limpar data"
              }
              onClick={clear}
              onMouseDown={(e) => e.preventDefault()}
              className={cn(
                "absolute top-1/2 -translate-y-1/2 inline-flex h-4 w-4 cursor-pointer items-center justify-center rounded-full text-fg-muted",
                "hover:bg-muted hover:text-fg",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                size === "sm" && "right-[10px]",
                size === "md" && "right-[12px]",
                size === "lg" && "right-[14px]",
              )}
            >
              <X width={12} height={12} aria-hidden="true" />
            </button>
          )}
        </div>

        {/* Hidden input p/ form submission. Single mode emits one ISO field;
            range mode emits two (`${name}_from`, `${name}_to`). */}
        {name && !isRangeMode(props) && (
          <input type="hidden" name={name} value={toISODate(currentSingle)} />
        )}
        {name && isRangeMode(props) && (
          <>
            <input
              type="hidden"
              name={`${name}_from`}
              value={toISODate(currentRange?.from)}
            />
            <input
              type="hidden"
              name={`${name}_to`}
              value={toISODate(currentRange?.to)}
            />
          </>
        )}

        <Popover.Portal>
          <Popover.Content
            sideOffset={4}
            align="start"
            className={cn(
              "z-50 w-[280px] rounded-xl border border-border bg-background p-2.5 shadow-lg",
              "data-[state=open]:animate-in data-[state=closed]:animate-out",
              "data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95",
              "data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95",
            )}
          >
            {dayPickerNode}

            {showToday && (
              <div className="mt-2 flex justify-end border-t border-border pt-2">
                <button
                  type="button"
                  onClick={pickToday}
                  className="rounded-sm border-0 bg-transparent px-2 py-1 text-[12px] font-semibold text-action hover:bg-bg-hover/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  Hoje
                </button>
              </div>
            )}
          </Popover.Content>
        </Popover.Portal>
      </Popover.Root>
    );
  },
);
DatePicker.displayName = "DatePicker";

export {
  DatePicker,
  fmtBR as formatDateBR,
  fmtRangeBR as formatRangeBR,
};
