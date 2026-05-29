
/**
 * Slider — seletor numérico. Wrapper de <input type="range">.
 * Props: min, max, step, value, showValue, prefix, suffix.
 */

interface SliderProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type" | "size"> {
  size?: "sm" | "md";
  showValue?: boolean;
  prefix?: string;
  suffix?: string;
  format?: (v: number) => string;
}

function Slider({
  size = "md",
  showValue = false,
  prefix = "",
  suffix = "",
  format,
  min = 0,
  max = 100,
  step = 1,
  value,
  defaultValue,
  onChange,
  className = "",
  ...rest
}: SliderProps) {
  const [internal, setInternal] = React.useState<number>(
    typeof defaultValue === "number" ? defaultValue : typeof defaultValue === "string" ? +defaultValue : 50
  );
  const current = value !== undefined ? +value : internal;
  const pct = ((current - +min) / (+max - +min)) * 100;

  const cls = ["grd-sl", `grd-sl-${size}`, className].filter(Boolean).join(" ");
  const displayVal = format ? format(current) : `${prefix}${current}${suffix}`;

  return (
    <div className={cls}>
      <input
        type="range"
        min={min} max={max} step={step}
        value={current}
        onChange={e => {
          if (value === undefined) setInternal(+e.target.value);
          onChange?.(e);
        }}
        style={{ ["--pct" as any]: `${pct}%` }}
        {...rest}
      />
      {showValue && <span className="grd-sl-val">{displayVal}</span>}
    </div>
  );
}
Slider.displayName = "Slider";
(window as any).Slider = Slider;
