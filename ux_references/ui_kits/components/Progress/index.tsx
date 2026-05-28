
/**
 * Progress — barra de progresso linear ou circular.
 * Variant: linear (default) | circular
 * Props: value (0-100), max, label, showValue, tone (violet|green|amber|red)
 */

interface ProgressProps {
  value: number;
  max?: number;
  variant?: "linear" | "circular";
  label?: React.ReactNode;
  showValue?: boolean;
  tone?: "violet" | "green" | "amber" | "red";
  size?: "sm" | "md" | "lg";
  indeterminate?: boolean;
  className?: string;
}

function Progress({
  value, max = 100, variant = "linear", label, showValue = false,
  tone = "violet", size = "md", indeterminate = false, className = "",
}: ProgressProps) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  const cls = ["grd-pg", `grd-pg-${variant}`, `grd-pg-${tone}`, `grd-pg-${size}`, indeterminate && "grd-pg-ind", className].filter(Boolean).join(" ");

  if (variant === "circular") {
    const s = size === "sm" ? 36 : size === "lg" ? 64 : 48;
    const stroke = size === "sm" ? 3 : size === "lg" ? 5 : 4;
    const r = (s - stroke) / 2;
    const c = 2 * Math.PI * r;
    const dash = indeterminate ? c * 0.25 : (pct / 100) * c;
    return (
      <div className={cls} style={{ width: s, height: s }}>
        <svg width={s} height={s} viewBox={`0 0 ${s} ${s}`}>
          <circle cx={s/2} cy={s/2} r={r} fill="none" stroke="currentColor" strokeWidth={stroke} className="grd-pg-c-bg" />
          <circle
            cx={s/2} cy={s/2} r={r} fill="none"
            stroke="currentColor" strokeWidth={stroke}
            strokeDasharray={`${dash} ${c}`}
            strokeLinecap="round"
            className="grd-pg-c-fg"
            style={{ transform: "rotate(-90deg)", transformOrigin: "center" }}
          />
        </svg>
        {showValue && !indeterminate && <div className="grd-pg-c-val">{Math.round(pct)}%</div>}
      </div>
    );
  }

  return (
    <div className={cls}>
      {(label || showValue) && (
        <div className="grd-pg-meta">
          {label && <span className="grd-pg-label">{label}</span>}
          {showValue && !indeterminate && <span className="grd-pg-val">{Math.round(pct)}%</span>}
        </div>
      )}
      <div className="grd-pg-track" role="progressbar" aria-valuenow={indeterminate ? undefined : pct} aria-valuemin={0} aria-valuemax={100}>
        <div className="grd-pg-fill" style={indeterminate ? undefined : { width: `${pct}%` }} />
      </div>
    </div>
  );
}
Progress.displayName = "Progress";
(window as any).Progress = Progress;
