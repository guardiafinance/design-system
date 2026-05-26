"use client";

import * as React from "react";
import * as Popover from "@radix-ui/react-popover";
import { cva, type VariantProps } from "class-variance-authority";
import { Check, ChevronDown, Search, X } from "lucide-react";

import { cn } from "@/lib/utils";

/**
 * Combobox — dropdown com busca para listas longas.
 *
 * Use quando o número de opções (clientes, contas, CNAEs, planos…)
 * ultrapassa o que faz sentido em um <Select>. Ganha um campo de busca
 * que filtra por label + meta em tempo real.
 *
 * Base:
 *   Radix Popover (positioning, outside click, Escape, focus management).
 *   A11y do listbox é controlada manualmente via aria-expanded /
 *   aria-controls / aria-activedescendant + roles.
 *
 * Props:
 *   options       array de { value, label, meta?, disabled? }
 *   value         controlado (string)
 *   defaultValue  uncontrolled
 *   onChange      (value, option?) => void
 *   placeholder   default "Selecione…"
 *   searchPlaceholder default "Buscar…"
 *   size          sm | md (default) | lg — heights 32 / 38 / 46
 *   invalid       border destructive + aria-invalid
 *   disabled
 *   leftIcon      ReactNode renderizado à esquerda do trigger
 *   emptyText     default "Nenhum resultado"
 *   clearable     mostra botão de limpar quando há valor
 *
 * Teclado:
 *   ↓ / ↑     navega na lista
 *   Enter     seleciona o option focado
 *   Escape    fecha (Radix)
 *   tipo      filtra (a query é resetada quando fecha)
 *
 * Acessibilidade:
 *   trigger      role="combobox", aria-expanded, aria-haspopup="listbox",
 *                aria-controls=<list-id>
 *   list         role="listbox", id=<list-id>, aria-activedescendant
 *   option       role="option", aria-selected, id
 *   busca        role="searchbox" implícita pelo type="search"
 */

export interface ComboboxOption {
  value: string;
  label: string;
  meta?: React.ReactNode;
  disabled?: boolean;
}

const triggerVariants = cva(
  [
    "inline-flex items-center gap-2 w-full",
    "bg-background text-fg",
    "border border-border-strong rounded-md",
    "text-left cursor-pointer",
    "transition-[border-color,box-shadow] duration-150",
    /* Hover (não disabled): border action (violet-500 light / orange-500 dark) */
    "enabled:hover:border-action",
    /* Focus / open: ring laranja */
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
    "data-[state=open]:border-action data-[state=open]:ring-2 data-[state=open]:ring-ring data-[state=open]:ring-offset-2",
    /* Invalid */
    "aria-[invalid=true]:border-destructive aria-[invalid=true]:hover:border-destructive",
    "aria-[invalid=true]:focus-visible:ring-destructive aria-[invalid=true]:data-[state=open]:ring-destructive",
    /* Disabled */
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

export interface ComboboxProps
  extends VariantProps<typeof triggerVariants> {
  options: ComboboxOption[];
  value?: string;
  defaultValue?: string;
  onChange?: (value: string, option?: ComboboxOption) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  invalid?: boolean;
  disabled?: boolean;
  leftIcon?: React.ReactNode;
  emptyText?: string;
  clearable?: boolean;
  className?: string;
  /** id pra associar com Label externo + aria. */
  id?: string;
  /** Nome do campo (renderizado como input hidden p/ form submission). */
  name?: string;
  /** Largura do popup (default = match trigger). */
  popoverWidth?: number | string;
  /**
   * Accessible name for the combobox trigger. Required by ARIA: role="combobox"
   * derives its name from `aria-label` or `aria-labelledby`, not from text
   * content. Fallbacks to `placeholder` when omitted.
   */
  "aria-label"?: string;
  /**
   * Id of an external `<Label>` element. Takes precedence over `aria-label`.
   */
  "aria-labelledby"?: string;
}

const Combobox = React.forwardRef<HTMLButtonElement, ComboboxProps>(
  (
    {
      options,
      value,
      defaultValue,
      onChange,
      placeholder = "Selecione…",
      searchPlaceholder = "Buscar…",
      size = "md",
      invalid,
      disabled,
      leftIcon,
      emptyText = "Nenhum resultado",
      clearable = false,
      className,
      id,
      name,
      popoverWidth,
      "aria-label": ariaLabel,
      "aria-labelledby": ariaLabelledby,
    },
    ref,
  ) => {
    const reactId = React.useId();
    const triggerId = id ?? reactId;
    const listId = `${triggerId}-list`;

    const [open, setOpen] = React.useState(false);
    const [internal, setInternal] = React.useState(defaultValue ?? "");
    const [query, setQuery] = React.useState("");
    const [activeIndex, setActiveIndex] = React.useState(0);
    const searchRef = React.useRef<HTMLInputElement>(null);
    const listRef = React.useRef<HTMLDivElement>(null);

    const isControlled = value !== undefined;
    const current = isControlled ? value! : internal;
    const selectedOpt = options.find((o) => o.value === current);

    const filtered = React.useMemo(() => {
      if (!query) return options;
      const q = query.toLowerCase();
      return options.filter((o) =>
        (o.label + " " + (typeof o.meta === "string" ? o.meta : ""))
          .toLowerCase()
          .includes(q),
      );
    }, [options, query]);

    /* Reset query e activeIndex quando fecha */
    React.useEffect(() => {
      if (!open) {
        setQuery("");
        setActiveIndex(0);
      }
    }, [open]);

    /* activeIndex válido após filter */
    React.useEffect(() => {
      if (activeIndex >= filtered.length) setActiveIndex(0);
    }, [filtered.length, activeIndex]);

    /* Foca a busca após abrir (Radix tenta focar trigger; sobrescrevemos) */
    const onOpenAutoFocus = (e: Event) => {
      e.preventDefault();
      requestAnimationFrame(() => searchRef.current?.focus());
    };

    function pick(opt: ComboboxOption) {
      if (opt.disabled) return;
      if (!isControlled) setInternal(opt.value);
      onChange?.(opt.value, opt);
      setOpen(false);
    }

    function clear(e: React.MouseEvent) {
      e.stopPropagation();
      e.preventDefault();
      if (!isControlled) setInternal("");
      onChange?.("", undefined);
    }

    function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
      if (filtered.length === 0) return;
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActiveIndex((i) => {
          const next = (i + 1) % filtered.length;
          scrollOptionIntoView(next);
          return next;
        });
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setActiveIndex((i) => {
          const next = (i - 1 + filtered.length) % filtered.length;
          scrollOptionIntoView(next);
          return next;
        });
      } else if (e.key === "Enter") {
        e.preventDefault();
        const opt = filtered[activeIndex];
        if (opt) pick(opt);
      } else if (e.key === "Home") {
        e.preventDefault();
        setActiveIndex(0);
      } else if (e.key === "End") {
        e.preventDefault();
        setActiveIndex(filtered.length - 1);
      }
    }

    function scrollOptionIntoView(index: number) {
      requestAnimationFrame(() => {
        const opt = listRef.current?.querySelector<HTMLButtonElement>(
          `[data-option-index="${index}"]`,
        );
        /* jsdom não implementa scrollIntoView — guard para tests */
        if (opt && typeof opt.scrollIntoView === "function") {
          opt.scrollIntoView({ block: "nearest" });
        }
      });
    }

    const optionId = (i: number) => `${listId}-opt-${i}`;
    const activeOptionId =
      filtered.length > 0 ? optionId(activeIndex) : undefined;

    const popoverStyle: React.CSSProperties = {
      width: popoverWidth ?? "var(--radix-popover-trigger-width)",
    };

    const showClear = Boolean(clearable && selectedOpt && !disabled);

    return (
      <Popover.Root open={open} onOpenChange={(o) => !disabled && setOpen(o)}>
        {/* WHY: the clear button lives OUTSIDE the trigger as an absolutely
            positioned sibling. Nesting a real <button> (or role="button" span)
            inside <button role="combobox"> triggers axe's nested-interactive
            rule (WCAG 4.1.2). A relative wrapper preserves layout; an
            aria-hidden spacer inside the trigger reserves the visual slot. */}
        <div className="relative flex w-full">
          <Popover.Trigger asChild>
            <button
              ref={ref}
              id={triggerId}
              type="button"
              role="combobox"
              aria-expanded={open}
              aria-haspopup="listbox"
              aria-controls={listId}
              aria-invalid={invalid || undefined}
              aria-label={ariaLabelledby ? undefined : (ariaLabel ?? placeholder)}
              aria-labelledby={ariaLabelledby}
              disabled={disabled}
              className={cn(triggerVariants({ size }), className)}
            >
              {leftIcon && (
                <span className="inline-flex shrink-0 text-fg-muted">
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
              {showClear && (
                <span
                  aria-hidden="true"
                  className="inline-flex h-4 w-4 shrink-0"
                />
              )}
              <ChevronDown
                width={size === "sm" ? 14 : 16}
                height={size === "sm" ? 14 : 16}
                className="shrink-0 text-fg-muted transition-transform duration-200 data-[open=true]:rotate-180"
                data-open={open}
                aria-hidden="true"
              />
            </button>
          </Popover.Trigger>
          {showClear && (
            <button
              type="button"
              aria-label="Limpar seleção"
              onClick={clear}
              onMouseDown={(e) => e.preventDefault()}
              className={cn(
                "absolute top-1/2 -translate-y-1/2 inline-flex h-4 w-4 cursor-pointer items-center justify-center rounded-full text-fg-muted",
                "hover:bg-muted hover:text-fg",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                size === "sm" && "right-[32px]",
                size === "md" && "right-[36px]",
                size === "lg" && "right-[38px]",
              )}
            >
              <X width={12} height={12} aria-hidden="true" />
            </button>
          )}
        </div>

        {/* Hidden input p/ form submission */}
        {name && (
          <input type="hidden" name={name} value={current} />
        )}

        <Popover.Portal>
          <Popover.Content
            sideOffset={4}
            align="start"
            onOpenAutoFocus={onOpenAutoFocus}
            style={popoverStyle}
            className={cn(
              "z-50 flex max-h-80 flex-col overflow-hidden",
              "rounded-lg border border-border bg-background shadow-lg",
              "data-[state=open]:animate-in data-[state=closed]:animate-out",
              "data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95",
              "data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95",
            )}
          >
            <div className="flex items-center gap-2 border-b border-border px-3 py-2 text-fg-muted">
              <Search width={14} height={14} aria-hidden="true" />
              <input
                ref={searchRef}
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={onKeyDown}
                placeholder={searchPlaceholder}
                aria-controls={listId}
                aria-activedescendant={activeOptionId}
                className="w-full border-0 bg-transparent text-[13.5px] text-fg outline-none placeholder:text-fg-muted"
              />
            </div>

            <div
              ref={listRef}
              id={listId}
              role="listbox"
              className="flex-1 overflow-y-auto p-1"
            >
              {filtered.length === 0 && (
                <div className="px-3 py-4 text-center text-[13px] text-fg-muted">
                  {emptyText}
                </div>
              )}
              {filtered.map((opt, i) => {
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
                      /* Active (foco via teclado/mouse) — só aplica se não selecionado.
                         --bg-hover é violet-100 light / gray-700 dark; /60 mantém o "halo" suave em ambos os temas. */
                      isActive &&
                        !isSelected &&
                        "bg-bg-hover/60",
                      /* Selected — pattern do Chip: bg-action + text-button-fg.
                         action: violet-500 light / orange-500 dark.
                         button-fg: white light / mono-black dark (par AA-safe).
                         Selected vence Active visualmente: mesmo isActive, mantém bg-action sólido. */
                      isSelected &&
                        "bg-action text-button-fg",
                    )}
                  >
                    <span className="flex min-w-0 flex-col items-start gap-0.5">
                      <span className="font-medium">{opt.label}</span>
                      {opt.meta && (
                        <span
                          className={cn(
                            "text-xs text-fg-muted",
                            /* Meta secundária do option selecionado: button-fg/85 preserva hierarquia visual. */
                            isSelected && "text-button-fg/85",
                          )}
                        >
                          {opt.meta}
                        </span>
                      )}
                    </span>
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
Combobox.displayName = "Combobox";

export { Combobox };
