
/**
 * Chart — SVG chart leve, sem deps. Suporta 'line' e 'bar'.
 * Props:
 *   type: "line" | "bar"
 *   data: { label: string; value: number }[]  (bar)
 *       ou { label: string; series: Record<string, number> }[]  (line multi-serie)
 *   series: string[]  (line) — nomes das séries no objeto
 *   tone: "violet" | "multi" — cor(es)
 *   height, yFormatter, showGrid
 */

type BarPoint = { label: string; value: number; color?: string };
type LinePoint = { label: string; series: Record<string, number> };
interface ChartProps {
  type: "line" | "bar";
  data: any[];
  series?: string[];
  tone?: "violet" | "green" | "multi";
  height?: number;
  yFormatter?: (v: number) => string;
  showGrid?: boolean;
  title?: React.ReactNode;
  className?: string;
}

const CHART_COLORS = ["#4F186D", "#FF6F3C", "#FBBC04", "#34A853", "#4285F4", "#9F5DB3"];

function fmtNum(v: number) {
  if (Math.abs(v) >= 1000000) return `${(v/1000000).toFixed(1)}M`;
  if (Math.abs(v) >= 1000) return `${(v/1000).toFixed(1)}k`;
  return v.toLocaleString("pt-BR", { maximumFractionDigits: 1 });
}

function Chart({
  type, data, series, tone = "violet", height = 220,
  yFormatter = fmtNum, showGrid = true, title, className = "",
}: ChartProps) {
  const pad = { top: 16, right: 16, bottom: 28, left: 44 };
  const W = 600;
  const H = height;
  const innerW = W - pad.left - pad.right;
  const innerH = H - pad.top - pad.bottom;

  let maxY = 0;
  if (type === "bar") {
    maxY = Math.max(...(data as BarPoint[]).map(d => d.value), 0);
  } else {
    const ser = series ?? Object.keys((data[0] as LinePoint)?.series ?? {});
    (data as LinePoint[]).forEach(d => ser.forEach(s => { maxY = Math.max(maxY, d.series[s] ?? 0); }));
  }
  if (maxY === 0) maxY = 1;
  // Round maxY up
  const magnitude = Math.pow(10, Math.floor(Math.log10(maxY)));
  maxY = Math.ceil(maxY / magnitude) * magnitude;

  const ticks = 4;
  const yTicks = Array.from({ length: ticks + 1 }, (_, i) => (maxY * i) / ticks);

  const barColor = tone === "green" ? "var(--signal-green)" : "var(--violet-500)";

  return (
    <div className={`grd-ch ${className}`}>
      {title && <div className="grd-ch-title">{title}</div>}
      <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" style={{ width: "100%", height }}>
        {/* Y grid + labels */}
        {showGrid && yTicks.map((t, i) => {
          const y = pad.top + innerH - (t / maxY) * innerH;
          return (
            <g key={i}>
              <line x1={pad.left} x2={pad.left + innerW} y1={y} y2={y} stroke="var(--gray-200)" strokeWidth={1} strokeDasharray={i === 0 ? "0" : "2 3"} />
              <text x={pad.left - 8} y={y} dominantBaseline="middle" textAnchor="end" className="grd-ch-ylab">{yFormatter(t)}</text>
            </g>
          );
        })}
        {/* X labels */}
        {type === "bar" ? (() => {
          const bars = data as BarPoint[];
          const slot = innerW / bars.length;
          const bw = Math.min(32, slot * 0.6);
          return bars.map((d, i) => {
            const x = pad.left + i * slot + (slot - bw) / 2;
            const h = (d.value / maxY) * innerH;
            const y = pad.top + innerH - h;
            return (
              <g key={i}>
                <rect x={x} y={y} width={bw} height={h} rx={3} ry={3} fill={d.color ?? barColor}>
                  <title>{`${d.label}: ${yFormatter(d.value)}`}</title>
                </rect>
                <text x={x + bw/2} y={pad.top + innerH + 16} textAnchor="middle" className="grd-ch-xlab">{d.label}</text>
              </g>
            );
          });
        })() : (() => {
          const pts = data as LinePoint[];
          const ser = series ?? Object.keys(pts[0]?.series ?? {});
          const slot = innerW / Math.max(pts.length - 1, 1);
          return (<>
            {ser.map((s, si) => {
              const color = tone === "multi" ? CHART_COLORS[si % CHART_COLORS.length] : barColor;
              const path = pts.map((p, i) => {
                const x = pad.left + i * slot;
                const v = p.series[s] ?? 0;
                const y = pad.top + innerH - (v / maxY) * innerH;
                return `${i === 0 ? "M" : "L"}${x.toFixed(1)} ${y.toFixed(1)}`;
              }).join(" ");
              const areaPath = path + ` L${(pad.left + (pts.length - 1) * slot).toFixed(1)} ${(pad.top + innerH).toFixed(1)} L${pad.left.toFixed(1)} ${(pad.top + innerH).toFixed(1)} Z`;
              return (
                <g key={s}>
                  {ser.length === 1 && <path d={areaPath} fill={color} opacity={0.1} />}
                  <path d={path} fill="none" stroke={color} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
                  {pts.map((p, i) => {
                    const x = pad.left + i * slot;
                    const v = p.series[s] ?? 0;
                    const y = pad.top + innerH - (v / maxY) * innerH;
                    return <circle key={i} cx={x} cy={y} r={3} fill={color}><title>{`${s} • ${p.label}: ${yFormatter(v)}`}</title></circle>;
                  })}
                </g>
              );
            })}
            {pts.map((p, i) => {
              const x = pad.left + i * slot;
              return <text key={i} x={x} y={pad.top + innerH + 16} textAnchor="middle" className="grd-ch-xlab">{p.label}</text>;
            })}
          </>);
        })()}
      </svg>
      {type === "line" && series && series.length > 1 && tone === "multi" && (
        <div className="grd-ch-legend">
          {series.map((s, i) => (
            <span key={s} className="grd-ch-legend-item">
              <span className="grd-ch-legend-dot" style={{ background: CHART_COLORS[i % CHART_COLORS.length] }} />
              {s}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
Chart.displayName = "Chart";
(window as any).Chart = Chart;
