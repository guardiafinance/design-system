
/**
 * MetricCard — card de KPI com rótulo, valor e delta.
 * Props: label, value, delta (signed number or string), deltaType (up|down|neutral auto), caption, icon, prefix, suffix, spark (array).
 */

interface MetricCardProps {
  label: React.ReactNode;
  value: React.ReactNode;
  prefix?: React.ReactNode;
  suffix?: React.ReactNode;
  delta?: number | string;
  deltaType?: "up" | "down" | "neutral";
  caption?: React.ReactNode;
  icon?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

function deriveDelta(d?: number | string): "up" | "down" | "neutral" {
  if (d === undefined) return "neutral";
  const n = typeof d === "number" ? d : parseFloat(String(d).replace(",", "."));
  if (isNaN(n) || n === 0) return "neutral";
  return n > 0 ? "up" : "down";
}

function MetricCard({
  label, value, prefix, suffix, delta, deltaType, caption, icon,
  size = "md", className = "",
}: MetricCardProps) {
  const IconCmp = (window as any).Icon;
  const dtype = deltaType ?? deriveDelta(delta);
  const deltaStr = delta !== undefined ? (typeof delta === "number"
    ? `${delta > 0 ? "+" : ""}${delta.toLocaleString("pt-BR", { maximumFractionDigits: 2 })}%`
    : String(delta)) : null;
  const cls = ["grd-mc", `grd-mc-${size}`, className].filter(Boolean).join(" ");
  return (
    <div className={cls}>
      <div className="grd-mc-row">
        <div className="grd-mc-label">{label}</div>
        {icon && IconCmp && <div className="grd-mc-ic"><IconCmp name={icon} size={size === "lg" ? 18 : 16} /></div>}
      </div>
      <div className="grd-mc-value">
        {prefix && <span className="grd-mc-afx">{prefix}</span>}
        <span className="grd-mc-num">{value}</span>
        {suffix && <span className="grd-mc-afx grd-mc-afx-sfx">{suffix}</span>}
      </div>
      {(deltaStr || caption) && (
        <div className="grd-mc-foot">
          {deltaStr && (
            <span className={`grd-mc-delta grd-mc-delta-${dtype}`}>
              {IconCmp && <IconCmp name={dtype === "up" ? "trending-up" : dtype === "down" ? "trending-down" : "minus"} size={12} />}
              {deltaStr}
            </span>
          )}
          {caption && <span className="grd-mc-cap">{caption}</span>}
        </div>
      )}
    </div>
  );
}
MetricCard.displayName = "MetricCard";
(window as any).MetricCard = MetricCard;
