"use client";

import * as React from "react";
import * as Popover from "@radix-ui/react-popover";
import { cva, type VariantProps } from "class-variance-authority";
import { Check, ChevronDown } from "lucide-react";

import { cn } from "@/lib/utils";

/**
 * Select — dropdown estilizado para listas curtas.
 *
 * Mesma arquitetura do Combobox (Radix Popover + listbox custom), só
 * sem o campo de busca. Para listas longas (>~7 items) ou que precisam
 * de busca incremental, prefira `<Combobox />`.
 *
 * Trade-off:
 *   ✗ Não usa o `<select>` nativo do browser (sem mobile picker do iOS)
 *   ✓ Visual e a11y consistentes com os outros inputs do design system
 *   ✓ Hover/active styles, check icon do selecionado, animação de abertura
 *
 * Props:
 *   options       array de { value, label, disabled? }
 *   value         controlado (string)
 *   defaultValue  uncontrolled
 *   onChange      (value, option?) => void
 *   placeholder   default "Selecione…"
 *   size          sm | md (default) | lg — heights 32 / 38 / 46
 *   invalid       border destructive + aria-invalid
 *   disabled
 *   leftIcon      ReactNode renderizado à esquerda do trigger
 *   clearable     mostra X para limpar quando há valor
 *   name          renderiza input hidden p/ form submission
 *
 * Teclado:
 *   ↓ / ↑     navega na lista
 *   Enter     seleciona o option focado
 *   Home/End  primeiro / último option
 *   Escape    fecha (Radix)
 */

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

const triggerVariants = cva(
  [
    "inline-flex items-center gap-2 w-full",
    "bg-background text-fg",
    "border border-border-strong rounded-md",
    "text-left cursor-pointer",
    "transition-[border-color,box-shadow] duration-150",
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
      state: {
        default: "",
        error:
          "border-destructive hover:border-destructive focus-visible:ring-destructive data-[state=open]:border-destructive data-[state=open]:ring-destructive",
        success:
          "border-signal-green hover:border-signal-green focus-visible:ring-signal-green data-[state=open]:border-signal-green",
      },
    },
    defaultVariants: { size: "md", state: "default" },
  },
);

export type SelectSize = NonNullable<
  VariantProps<typeof triggerVariants>["size"]
>;
export type SelectState = NonNullable<
  VariantProps<typeof triggerVariants>["state"]
>;

export interface SelectProps {
  options: SelectOption[];
  value?: string;
  defaultValue?: string;
  onChange?: (value: string, option?: SelectOption) => void;
  placeholder?: string;
  size?: SelectSize;
  state?: SelectState;
  invalid?: boolean;
  disabled?: boolean;
  leftIcon?: React.ReactNode;
  /** Largura do popover (default = match trigger). */
  popoverWidth?: number | string;
  className?: string;
  id?: string;
  name?: string;
  /** aria-label customizada do trigger (default: "Selecionar"). */
  "aria-label"?: string;
  /** aria-invalid forçado (sobrescreve invalid). */
  "aria-invalid"?: boolean;
  /** Required. Aplicado ao input hidden quando name está presente. */
  required?: boolean;
}

const Select = React.forwardRef<HTMLButtonElement, SelectProps>(
  (
    {
      options,
      value,
      defaultValue,
      onChange,
      placeholder = "Selecione…",
      size = "md",
      state = "default",
      invalid,
      disabled,
      leftIcon,
      popoverWidth,
      className,
      id,
      name,
      required,
      "aria-label": ariaLabel = "Selecionar",
      "aria-invalid": ariaInvalid,
    },
    ref,
  ) => {
    const reactId = React.useId();
    const triggerId = id ?? reactId;
    const listId = `${triggerId}-list`;

    const [open, setOpen] = React.useState(false);
    const [internal, setInternal] = React.useState(defaultValue ?? "");
    const [activeIndex, setActiveIndex] = React.useState(0);
    const listRef = React.useRef<HTMLDivElement>(null);

    const isControlled = value !== undefined;
    const current = isControlled ? value! : internal;
    const selectedOpt = options.find((o) => o.value === current);

    const effectiveState: SelectState = invalid ? "error" : state;
    const finalAriaInvalid = invalid || ariaInvalid;

    /* Posiciona activeIndex no selecionado quando abre */
    React.useEffect(() => {
      if (open) {
        const i = options.findIndex((o) => o.value === current);
        if (i >= 0) setActiveIndex(i);
      }
    }, [open, current, options]);

    function pick(opt: SelectOption) {
      if (opt.disabled) return;
      if (!isControlled) setInternal(opt.value);
      onChange?.(opt.value, opt);
      setOpen(false);
    }

    function onListKeyDown(e: React.KeyboardEvent<HTMLDivElement>) {
      if (options.length === 0) return;
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActiveIndex((i) => {
          let next = (i + 1) % options.length;
          /* Pula disabled */
          let safety = options.length;
          while (options[next]?.disabled && safety-- > 0) {
            next = (next + 1) % options.length;
          }
          scrollOptionIntoView(next);
          return next;
        });
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setActiveIndex((i) => {
          let next = (i - 1 + options.length) % options.length;
          let safety = options.length;
          while (options[next]?.disabled && safety-- > 0) {
            next = (next - 1 + options.length) % options.length;
          }
          scrollOptionIntoView(next);
          return next;
        });
      } else if (e.key === "Home") {
        e.preventDefault();
        setActiveIndex(0);
      } else if (e.key === "End") {
        e.preventDefault();
        setActiveIndex(options.length - 1);
      } else if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        const opt = options[activeIndex];
        if (opt) pick(opt);
      }
    }

    function scrollOptionIntoView(index: number) {
      requestAnimationFrame(() => {
        const opt = listRef.current?.querySelector<HTMLButtonElement>(
          `[data-option-index="${index}"]`,
        );
        if (opt && typeof opt.scrollIntoView === "function") {
          opt.scrollIntoView({ block: "nearest" });
        }
      });
    }

    const optionId = (i: number) => `${listId}-opt-${i}`;
    const activeOptionId =
      options.length > 0 ? optionId(activeIndex) : undefined;

    const popoverStyle: React.CSSProperties = {
      width: popoverWidth ?? "var(--radix-popover-trigger-width)",
    };

    return (
      <Popover.Root open={open} onOpenChange={(o) => !disabled && setOpen(o)}>
        <Popover.Trigger asChild>
          <button
            ref={ref}
            id={triggerId}
            type="button"
            role="combobox"
            aria-expanded={open}
            aria-haspopup="listbox"
            aria-controls={listId}
            aria-activedescendant={open ? activeOptionId : undefined}
            aria-invalid={finalAriaInvalid || undefined}
            aria-label={ariaLabel}
            disabled={disabled}
            className={cn(
              triggerVariants({ size, state: effectiveState }),
              className,
            )}
          >
            {leftIcon && (
              <span aria-hidden="true" className="inline-flex shrink-0 text-fg-muted">
                {leftIcon}
              </span>
            )}
            <span
              className={cn(
                "flex-1 overflow-hidden text-ellipsis whitespace-nowrap",
                !selectedOpt && "text-fg-muted",
              )}
            >
              {selectedOpt ? selectedOpt.label : placeholder}
            </span>
            <ChevronDown
              width={size === "sm" ? 14 : 16}
              height={size === "sm" ? 14 : 16}
              data-open={open}
              aria-hidden="true"
              className="shrink-0 text-fg-muted transition-transform duration-200 data-[open=true]:rotate-180"
            />
          </button>
        </Popover.Trigger>

        {/* Hidden input p/ form submission */}
        {name && (
          <input
            type="hidden"
            name={name}
            value={current}
            required={required}
          />
        )}

        <Popover.Portal>
          <Popover.Content
            sideOffset={4}
            align="start"
            style={popoverStyle}
            aria-labelledby={triggerId}
            className={cn(
              "z-50 flex max-h-80 flex-col overflow-hidden",
              "rounded-lg border border-border bg-background shadow-lg",
              "data-[state=open]:animate-in data-[state=closed]:animate-out",
              "data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95",
              "data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95",
            )}
          >
            <div
              ref={listRef}
              id={listId}
              role="listbox"
              tabIndex={-1}
              aria-labelledby={triggerId}
              onKeyDown={onListKeyDown}
              className="flex-1 overflow-y-auto p-1 outline-none"
            >
              {options.length === 0 && (
                <div className="px-3 py-4 text-center text-[13px] text-fg-muted">
                  Sem opções
                </div>
              )}
              {options.map((opt, i) => {
                const isSelected = opt.value === current;
                const isActive = i === activeIndex;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    role="option"
                    id={optionId(i)}
                    aria-selected={isSelected}
                    data-option-index={i}
                    disabled={opt.disabled}
                    onMouseEnter={() => setActiveIndex(i)}
                    onClick={() => pick(opt)}
                    className={cn(
                      "flex w-full items-center justify-between gap-2",
                      "rounded-md px-2.5 py-1.5 text-left text-[13.5px]",
                      "transition-colors duration-100",
                      "disabled:cursor-not-allowed disabled:opacity-50",
                      isActive && !isSelected && "bg-bg-hover/50",
                      isSelected && "bg-bg-hover text-action",
                    )}
                  >
                    <span className="flex-1 font-medium">{opt.label}</span>
                    {isSelected && (
                      <Check
                        width={14}
                        height={14}
                        aria-hidden="true"
                        className="shrink-0"
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </Popover.Content>
        </Popover.Portal>
      </Popover.Root>
    );
  },
);
Select.displayName = "Select";

export { Select };
