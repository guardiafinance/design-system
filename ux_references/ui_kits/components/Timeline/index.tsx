
/**
 * Timeline — linha do tempo vertical com eventos.
 * items: { id, title, description?, timestamp?, icon?, tone?, meta?: React.ReactNode, connector?: 'solid'|'dashed' }[]
 * Tones: violet (default), green, amber, red, neutral.
 */

interface TimelineItem {
  id: string;
  title: React.ReactNode;
  description?: React.ReactNode;
  timestamp?: React.ReactNode;
  icon?: string;
  tone?: "violet" | "green" | "amber" | "red" | "neutral";
  meta?: React.ReactNode;
}
interface TimelineProps {
  items: TimelineItem[];
  size?: "sm" | "md";
  connector?: "solid" | "dashed";
  className?: string;
}

function Timeline({ items, size = "md", connector = "solid", className = "" }: TimelineProps) {
  const IconCmp = (window as any).Icon;
  const cls = ["grd-tl", `grd-tl-${size}`, `grd-tl-c-${connector}`, className].filter(Boolean).join(" ");
  return (
    <ol className={cls}>
      {items.map((it, i) => {
        const tone = it.tone ?? "violet";
        const last = i === items.length - 1;
        return (
          <li key={it.id} className={`grd-tl-item grd-tl-t-${tone} ${last ? "grd-tl-last" : ""}`}>
            <span className="grd-tl-marker">
              {it.icon && IconCmp ? <IconCmp name={it.icon} size={size === "sm" ? 11 : 13} /> : <span className="grd-tl-dot" />}
            </span>
            <div className="grd-tl-body">
              <div className="grd-tl-row">
                <span className="grd-tl-title">{it.title}</span>
                {it.timestamp && <span className="grd-tl-ts">{it.timestamp}</span>}
              </div>
              {it.description && <div className="grd-tl-desc">{it.description}</div>}
              {it.meta && <div className="grd-tl-meta">{it.meta}</div>}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
Timeline.displayName = "Timeline";
(window as any).Timeline = Timeline;
