
/**
 * DatePicker — seletor de data única.
 * Props: value (Date | null), onChange, placeholder, size, min, max, invalid.
 * Para range, use <DateRangePicker />.
 */

interface DatePickerProps {
  value?: Date | null;
  defaultValue?: Date | null;
  onChange?: (date: Date | null) => void;
  placeholder?: string;
  size?: "sm" | "md" | "lg";
  min?: Date;
  max?: Date;
  invalid?: boolean;
  disabled?: boolean;
  className?: string;
}

const DP_MONTHS = ["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"];
const DP_WDAYS  = ["D","S","T","Q","Q","S","S"];

function fmtBR(d: Date | null | undefined): string {
  if (!d) return "";
  const p = (n: number) => String(n).padStart(2, "0");
  return `${p(d.getDate())}/${p(d.getMonth()+1)}/${d.getFullYear()}`;
}
function sameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function DatePicker({
  value,
  defaultValue,
  onChange,
  placeholder = "dd/mm/aaaa",
  size = "md",
  min,
  max,
  invalid,
  disabled,
  className = "",
}: DatePickerProps) {
  const IconCmp = (window as any).Icon;
  const [open, setOpen] = React.useState(false);
  const [internal, setInternal] = React.useState<Date | null>(defaultValue ?? null);
  const current = value !== undefined ? value : internal;
  const [viewDate, setViewDate] = React.useState<Date>(current ?? new Date());
  const rootRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!rootRef.current) return;
      if (!rootRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = new Date();

  const cells: Array<{ date: Date; inMonth: boolean; disabled: boolean } | null> = [];
  // Leading blanks
  const prevMonthLast = new Date(year, month, 0).getDate();
  for (let i = firstDay - 1; i >= 0; i--) {
    const d = new Date(year, month - 1, prevMonthLast - i);
    cells.push({ date: d, inMonth: false, disabled: isOut(d, min, max) });
  }
  for (let i = 1; i <= daysInMonth; i++) {
    const d = new Date(year, month, i);
    cells.push({ date: d, inMonth: true, disabled: isOut(d, min, max) });
  }
  // Trailing to fill 6 rows
  while (cells.length < 42) {
    const last = cells[cells.length - 1]!.date;
    const d = new Date(last.getFullYear(), last.getMonth(), last.getDate() + 1);
    cells.push({ date: d, inMonth: false, disabled: isOut(d, min, max) });
  }

  function pick(d: Date) {
    if (value === undefined) setInternal(d);
    onChange?.(d);
    setOpen(false);
  }

  function clear(e: React.MouseEvent) {
    e.stopPropagation();
    if (value === undefined) setInternal(null);
    onChange?.(null);
  }

  const cls = [
    "grd-dp",
    `grd-dp-${size}`,
    invalid && "grd-dp-invalid",
    disabled && "grd-dp-disabled",
    open && "grd-dp-open",
    className,
  ].filter(Boolean).join(" ");
  const iconSize = size === "sm" ? 13 : size === "lg" ? 18 : 15;

  return (
    <div ref={rootRef} className={cls}>
      <button
        type="button" className="grd-dp-trigger"
        onClick={() => !disabled && setOpen(o => !o)}
        disabled={disabled}
        aria-haspopup="dialog" aria-expanded={open}
      >
        {IconCmp && <span className="grd-dp-ic"><IconCmp name="calendar" size={iconSize} /></span>}
        <span className={`grd-dp-val ${!current ? "grd-dp-val-ph" : ""}`}>
          {current ? fmtBR(current) : placeholder}
        </span>
        {current && !disabled && IconCmp && (
          <button type="button" className="grd-dp-clear" onClick={clear} aria-label="Limpar">
            <IconCmp name="x" size={iconSize - 1} />
          </button>
        )}
      </button>

      {open && (
        <div className="grd-dp-pop" role="dialog">
          <div className="grd-dp-head">
            <button type="button" className="grd-dp-nav" onClick={() => setViewDate(new Date(year, month - 1, 1))} aria-label="Mês anterior">
              {IconCmp && <IconCmp name="chevron-left" size={15} />}
            </button>
            <span className="grd-dp-title">{DP_MONTHS[month]} {year}</span>
            <button type="button" className="grd-dp-nav" onClick={() => setViewDate(new Date(year, month + 1, 1))} aria-label="Próximo mês">
              {IconCmp && <IconCmp name="chevron-right" size={15} />}
            </button>
          </div>
          <div className="grd-dp-wdays">
            {DP_WDAYS.map((w, i) => <span key={i}>{w}</span>)}
          </div>
          <div className="grd-dp-grid">
            {cells.map((c, i) => {
              if (!c) return <span key={i} />;
              const isToday = sameDay(c.date, today);
              const isSel = current && sameDay(c.date, current);
              return (
                <button
                  key={i} type="button"
                  className={[
                    "grd-dp-cell",
                    !c.inMonth && "grd-dp-cell-out",
                    isToday && "grd-dp-cell-today",
                    isSel && "grd-dp-cell-sel",
                    c.disabled && "grd-dp-cell-dis",
                  ].filter(Boolean).join(" ")}
                  onClick={() => !c.disabled && pick(c.date)}
                  disabled={c.disabled}
                >
                  {c.date.getDate()}
                </button>
              );
            })}
          </div>
          <div className="grd-dp-foot">
            <button type="button" className="grd-dp-today" onClick={() => pick(new Date())}>Hoje</button>
          </div>
        </div>
      )}
    </div>
  );
}

function isOut(d: Date, min?: Date, max?: Date): boolean {
  if (min && d < new Date(min.getFullYear(), min.getMonth(), min.getDate())) return true;
  if (max && d > new Date(max.getFullYear(), max.getMonth(), max.getDate())) return true;
  return false;
}

DatePicker.displayName = "DatePicker";
(window as any).DatePicker = DatePicker;
