"use client";

import * as React from "react";
import * as Popover from "@radix-ui/react-popover";
import { cva, type VariantProps } from "class-variance-authority";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, X } from "lucide-react";
import { DayPicker } from "react-day-picker";
import { ptBR } from "date-fns/locale";

import { cn } from "@/lib/utils";

/**
 * DatePicker — seletor de data única.
 *
 * Base:
 *   Radix Popover (positioning, outside click, Escape, focus management)
 *   + react-day-picker para a grid (a11y completa de calendar pattern).
 *
 * Trigger: input-like com ícone de calendário, formato dd/mm/aaaa (BR) e
 * botão X para limpar.
 *
 * Props:
 *   value           Date | null (controlled)
 *   defaultValue    Date | null (uncontrolled)
 *   onChange        (date: Date | null) => void
 *   placeholder     default "dd/mm/aaaa"
 *   size            sm | md (default) | lg
 *   minDate         desabilita datas anteriores
 *   maxDate         desabilita datas posteriores
 *   disabled        bloqueia abertura
 *   invalid         border destructive + aria-invalid
 *   clearable       default true; mostra X quando há valor
 *   showToday       default true; renderiza botão "Hoje" no rodapé
 *   name            renderiza input hidden (ISO) para form submission
 *   id              opcional, p/ associar com Label externo
 *
 * Acessibilidade:
 *   trigger        role implícito de button + aria-haspopup="dialog"
 *                  + aria-expanded
 *   popover        role="dialog" (Radix)
 *   grid de dias   role="grid" + cells com role="gridcell" (DayPicker)
 *   keyboard       ↑↓←→ navega · Enter seleciona · Page↑↓ muda de mês
 *                  · Home/End início/fim da semana (DayPicker nativo)
 */

const triggerVariants = cva(
  [
    "inline-flex items-center gap-2 w-full",
    "bg-background text-fg",
    "border border-border-strong rounded-md",
    "text-left cursor-pointer",
    "transition-[border-color,box-shadow] duration-150",
    "hover:border-guardia-violet-500 disabled:hover:border-border-strong",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
    "data-[state=open]:border-guardia-violet-500 data-[state=open]:ring-2 data-[state=open]:ring-ring data-[state=open]:ring-offset-2",
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

export interface DatePickerProps
  extends VariantProps<typeof triggerVariants> {
  value?: Date | null;
  defaultValue?: Date | null;
  onChange?: (date: Date | null) => void;
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
  /** aria-label customizada do trigger (default: "Selecionar data"). */
  "aria-label"?: string;
}

function fmtBR(d: Date | null | undefined): string {
  if (!d) return "";
  const p = (n: number) => String(n).padStart(2, "0");
  return `${p(d.getDate())}/${p(d.getMonth() + 1)}/${d.getFullYear()}`;
}

function toISODate(d: Date | null | undefined): string {
  if (!d) return "";
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

const DatePicker = React.forwardRef<HTMLButtonElement, DatePickerProps>(
  (
    {
      value,
      defaultValue,
      onChange,
      placeholder = "dd/mm/aaaa",
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
      "aria-label": ariaLabel = "Selecionar data",
    },
    ref,
  ) => {
    const reactId = React.useId();
    const triggerId = id ?? reactId;

    const isControlled = value !== undefined;
    const [internal, setInternal] = React.useState<Date | null>(
      defaultValue ?? null,
    );
    const current = isControlled ? value ?? null : internal;

    const isOpenControlled = openProp !== undefined;
    const [internalOpen, setInternalOpen] = React.useState(false);
    const open = isOpenControlled ? !!openProp : internalOpen;
    const setOpen = (next: boolean) => {
      if (disabled && next) return;
      if (!isOpenControlled) setInternalOpen(next);
      onOpenChange?.(next);
    };

    const [viewMonth, setViewMonth] = React.useState<Date>(
      current ?? new Date(),
    );
    React.useEffect(() => {
      if (current) setViewMonth(current);
    }, [current]);

    function commit(d: Date | null) {
      if (!isControlled) setInternal(d);
      onChange?.(d);
    }

    function pick(d: Date | undefined) {
      if (!d) return;
      commit(d);
      setOpen(false);
    }

    function clear(e: React.MouseEvent) {
      e.stopPropagation();
      e.preventDefault();
      commit(null);
    }

    function pickToday() {
      const t = new Date();
      commit(t);
      setOpen(false);
    }

    const iconPx = size === "sm" ? 14 : size === "lg" ? 18 : 16;

    return (
      <Popover.Root open={open} onOpenChange={setOpen}>
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
                !current && "text-fg-muted",
              )}
            >
              {current ? fmtBR(current) : placeholder}
            </span>
            {clearable && current && !disabled && (
              <span
                role="button"
                tabIndex={-1}
                aria-label="Limpar data"
                onClick={clear}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    clear(e as unknown as React.MouseEvent);
                  }
                }}
                onMouseDown={(e) => e.preventDefault()}
                className="inline-flex h-4 w-4 cursor-pointer items-center justify-center rounded-full text-fg-muted hover:bg-muted hover:text-fg"
              >
                <X width={12} height={12} aria-hidden="true" />
              </span>
            )}
          </button>
        </Popover.Trigger>

        {/* Hidden input p/ form submission (ISO) */}
        {name && <input type="hidden" name={name} value={toISODate(current)} />}

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
            <DayPicker
              mode="single"
              selected={current ?? undefined}
              onSelect={pick}
              month={viewMonth}
              onMonthChange={setViewMonth}
              locale={ptBR}
              showOutsideDays
              disabled={
                minDate || maxDate
                  ? [
                      ...(minDate ? [{ before: minDate }] : []),
                      ...(maxDate ? [{ after: maxDate }] : []),
                    ]
                  : undefined
              }
              classNames={{
                months: "flex flex-col",
                month: "flex flex-col gap-2",
                month_caption:
                  "flex h-7 items-center justify-center text-[13.5px] font-semibold text-fg",
                caption_label: "select-none",
                nav: "flex items-center justify-between absolute left-0 right-0 px-1",
                button_previous:
                  "inline-flex h-7 w-7 items-center justify-center rounded-md border-0 bg-transparent text-fg hover:bg-guardia-violet-100/50 hover:text-guardia-violet-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                button_next:
                  "inline-flex h-7 w-7 items-center justify-center rounded-md border-0 bg-transparent text-fg hover:bg-guardia-violet-100/50 hover:text-guardia-violet-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                month_grid: "border-collapse",
                weekdays: "flex",
                weekday:
                  "w-9 text-center text-[11px] font-semibold uppercase tracking-wide text-fg-muted py-1",
                week: "flex mt-0.5",
                day: "flex h-9 w-9 items-center justify-center p-0 text-[13px] tabular-nums",
                day_button: cn(
                  "h-8 w-8 inline-flex items-center justify-center rounded-md border-0 bg-transparent text-fg",
                  "transition-colors duration-100",
                  "hover:bg-guardia-violet-100/50 hover:text-guardia-violet-700",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  "disabled:cursor-not-allowed disabled:opacity-35",
                ),
                today:
                  "[&_button]:font-bold [&_button]:text-guardia-violet-700",
                selected:
                  "[&_button]:bg-guardia-violet-500 [&_button]:text-white [&_button]:hover:bg-guardia-violet-500 [&_button]:hover:text-white [&_button]:font-semibold",
                outside: "[&_button]:text-fg-muted [&_button]:opacity-60",
                disabled: "[&_button]:cursor-not-allowed [&_button]:opacity-35",
                hidden: "invisible",
              }}
              components={{
                Chevron: ({ orientation }) =>
                  orientation === "left" ? (
                    <ChevronLeft width={16} height={16} aria-hidden="true" />
                  ) : (
                    <ChevronRight width={16} height={16} aria-hidden="true" />
                  ),
              }}
            />

            {showToday && (
              <div className="mt-2 flex justify-end border-t border-border pt-2">
                <button
                  type="button"
                  onClick={pickToday}
                  className="rounded-sm border-0 bg-transparent px-2 py-1 text-[12px] font-semibold text-guardia-violet-700 hover:bg-guardia-violet-100/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
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

export { DatePicker, fmtBR as formatDateBR };
