
/**
 * Combobox — dropdown com busca. Para listas longas (clientes, contas, CNAEs).
 * Props: options [{value,label,meta?}], value, onChange, placeholder, searchPlaceholder.
 */

interface ComboOption {
  value: string;
  label: string;
  meta?: React.ReactNode;
  disabled?: boolean;
}

interface ComboboxProps {
  options: ComboOption[];
  value?: string;
  defaultValue?: string;
  onChange?: (value: string, option?: ComboOption) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  size?: "sm" | "md" | "lg";
  state?: "default" | "error" | "success";
  invalid?: boolean;
  disabled?: boolean;
  leftIcon?: string;
  emptyText?: string;
  clearable?: boolean;
  className?: string;
}

function Combobox({
  options,
  value,
  defaultValue,
  onChange,
  placeholder = "Selecione…",
  searchPlaceholder = "Buscar…",
  size = "md",
  state = "default",
  invalid,
  disabled,
  leftIcon,
  emptyText = "Nenhum resultado",
  clearable = false,
  className = "",
}: ComboboxProps) {
  const IconCmp = (window as any).Icon;
  const [open, setOpen] = React.useState(false);
  const [internal, setInternal] = React.useState<string>(defaultValue ?? "");
  const [query, setQuery] = React.useState("");
  const current = value !== undefined ? value : internal;
  const selectedOpt = options.find(o => o.value === current);
  const rootRef = React.useRef<HTMLDivElement>(null);
  const searchRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!rootRef.current) return;
      if (!rootRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  React.useEffect(() => {
    if (open && searchRef.current) searchRef.current.focus();
    if (!open) setQuery("");
  }, [open]);

  const filtered = query
    ? options.filter(o => (o.label + " " + (typeof o.meta === "string" ? o.meta : "")).toLowerCase().includes(query.toLowerCase()))
    : options;

  const effective = invalid ? "error" : state;
  const wrapCls = [
    "grd-cmb",
    `grd-cmb-${size}`,
    `grd-cmb-${effective}`,
    open && "grd-cmb-open",
    disabled && "grd-cmb-disabled",
    className,
  ].filter(Boolean).join(" ");
  const iconSize = size === "sm" ? 13 : size === "lg" ? 18 : 15;

  function pick(opt: ComboOption) {
    if (opt.disabled) return;
    if (value === undefined) setInternal(opt.value);
    onChange?.(opt.value, opt);
    setOpen(false);
  }

  function clear(e: React.MouseEvent) {
    e.stopPropagation();
    if (value === undefined) setInternal("");
    onChange?.("", undefined);
  }

  return (
    <div ref={rootRef} className={wrapCls}>
      <button
        type="button"
        className="grd-cmb-trigger"
        onClick={() => !disabled && setOpen(o => !o)}
        disabled={disabled}
        aria-expanded={open}
        aria-haspopup="listbox"
      >
        {leftIcon && IconCmp && <span className="grd-cmb-ic"><IconCmp name={leftIcon} size={iconSize} /></span>}
        <span className={`grd-cmb-val ${!selectedOpt ? "grd-cmb-val-ph" : ""}`}>
          {selectedOpt ? selectedOpt.label : placeholder}
        </span>
        {clearable && selectedOpt && !disabled && IconCmp && (
          <button type="button" className="grd-cmb-clear" onClick={clear} aria-label="Limpar">
            <IconCmp name="x" size={iconSize - 1} />
          </button>
        )}
        {IconCmp && <span className="grd-cmb-chev"><IconCmp name="chevron-down" size={iconSize} /></span>}
      </button>
      {open && (
        <div className="grd-cmb-pop" role="listbox">
          <div className="grd-cmb-search">
            {IconCmp && <IconCmp name="search" size={14} />}
            <input
              ref={searchRef}
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder={searchPlaceholder}
            />
          </div>
          <div className="grd-cmb-list">
            {filtered.length === 0 && <div className="grd-cmb-empty">{emptyText}</div>}
            {filtered.map(opt => (
              <button
                type="button"
                key={opt.value}
                className={`grd-cmb-opt ${opt.value === current ? "grd-cmb-opt-sel" : ""} ${opt.disabled ? "grd-cmb-opt-dis" : ""}`}
                role="option"
                aria-selected={opt.value === current}
                onClick={() => pick(opt)}
                disabled={opt.disabled}
              >
                <span className="grd-cmb-opt-text">
                  <span className="grd-cmb-opt-lbl">{opt.label}</span>
                  {opt.meta && <span className="grd-cmb-opt-meta">{opt.meta}</span>}
                </span>
                {opt.value === current && IconCmp && <IconCmp name="check" size={14} />}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
Combobox.displayName = "Combobox";
(window as any).Combobox = Combobox;
