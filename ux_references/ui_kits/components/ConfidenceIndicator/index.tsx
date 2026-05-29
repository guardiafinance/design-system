
/**
 * ConfidenceIndicator — semáforo de confiança para outputs de IA.
 *
 * Códigos (alinhado ao sistema Lighthouse):
 *   high:   verde  ≥ 95% — auto-aplicado
 *   medium: ama/la 80-94% — revisar
 *   low:    vermelho < 80% — requer decisão humana
 *
 * Variant:
 *   chip (default) — selo compacto com texto
 *   bar            — barra contínua
 *   dot            — ponto mínimo
 */

type ConfidenceLevel = "high" | "medium" | "low";

interface ConfidenceIndicatorProps {
  value?: number;       // 0-100 (se passado, derivamos o level)
  level?: ConfidenceLevel;
  variant?: "chip" | "bar" | "dot";
  showValue?: boolean;
  label?: React.ReactNode;
  size?: "sm" | "md";
  className?: string;
}

function deriveLevel(v: number): ConfidenceLevel {
  if (v >= 95) return "high";
  if (v >= 80) return "medium";
  return "low";
}
const LABEL: Record<ConfidenceLevel, string> = {
  high: "Alta confiança",
  medium: "Revisar",
  low: "Atenção",
};

function ConfidenceIndicator({
  value, level, variant = "chip", showValue = true, label, size = "md", className = "",
}: ConfidenceIndicatorProps) {
  const lv: ConfidenceLevel = level ?? (value !== undefined ? deriveLevel(value) : "high");
  const IconCmp = (window as any).Icon;
  const cls = ["grd-ci", `grd-ci-${variant}`, `grd-ci-lv-${lv}`, `grd-ci-${size}`, className].filter(Boolean).join(" ");

  if (variant === "dot") {
    return <span className={cls} title={label ? undefined : LABEL[lv]}><span className="grd-ci-dot" />{label}</span>;
  }

  if (variant === "bar") {
    const pct = value ?? (lv === "high" ? 97 : lv === "medium" ? 86 : 62);
    return (
      <div className={cls}>
        <div className="grd-ci-bar-track">
          <div className="grd-ci-bar-fill" style={{ width: `${pct}%` }} />
        </div>
        <div className="grd-ci-bar-meta">
          <span className="grd-ci-bar-label">{label ?? LABEL[lv]}</span>
          {showValue && value !== undefined && <span className="grd-ci-bar-val">{Math.round(value)}%</span>}
        </div>
      </div>
    );
  }

  // chip
  const ICON: Record<ConfidenceLevel, string> = {
    high: "circle-check",
    medium: "triangle-alert",
    low: "circle-x",
  };
  return (
    <span className={cls}>
      {IconCmp && <IconCmp name={ICON[lv]} size={size === "sm" ? 12 : 14} />}
      <span className="grd-ci-lab">{label ?? LABEL[lv]}</span>
      {showValue && value !== undefined && <span className="grd-ci-val">{Math.round(value)}%</span>}
    </span>
  );
}
ConfidenceIndicator.displayName = "ConfidenceIndicator";
(window as any).ConfidenceIndicator = ConfidenceIndicator;
