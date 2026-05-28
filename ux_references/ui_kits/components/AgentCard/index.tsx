
/**
 * AgentCard — card de agente de IA.
 * Props: name, role, icon, status (active|idle|paused|error), metrics (label/value[]), lastRun, accent.
 */

interface AgentMetric { label: React.ReactNode; value: React.ReactNode; }
interface AgentCardProps {
  name: React.ReactNode;
  role?: React.ReactNode;
  icon?: string;
  status?: "active" | "idle" | "paused" | "error";
  statusLabel?: React.ReactNode;
  metrics?: AgentMetric[];
  lastRun?: React.ReactNode;
  actions?: React.ReactNode;
  accent?: "violet" | "orange" | "blue" | "green";
  onClick?: () => void;
  className?: string;
}

const ST_LABEL: Record<string, string> = { active: "Ativo", idle: "Ocioso", paused: "Pausado", error: "Erro" };

function AgentCard({
  name, role, icon = "bot", status = "idle", statusLabel,
  metrics, lastRun, actions, accent = "violet", onClick, className = "",
}: AgentCardProps) {
  const IconCmp = (window as any).Icon;
  const cls = ["grd-ag", `grd-ag-acc-${accent}`, onClick && "grd-ag-clickable", className].filter(Boolean).join(" ");
  const Tag = onClick ? "button" : "div";
  return (
    <Tag className={cls} onClick={onClick} type={onClick ? "button" : undefined}>
      <div className="grd-ag-head">
        <div className="grd-ag-avatar">
          {IconCmp && <IconCmp name={icon} size={22} />}
        </div>
        <div className="grd-ag-id">
          <div className="grd-ag-name">{name}</div>
          {role && <div className="grd-ag-role">{role}</div>}
        </div>
        <span className={`grd-ag-status grd-ag-status-${status}`}>
          <span className="grd-ag-status-dot" />
          {statusLabel ?? ST_LABEL[status]}
        </span>
      </div>

      {metrics && metrics.length > 0 && (
        <div className="grd-ag-metrics">
          {metrics.map((m, i) => (
            <div key={i} className="grd-ag-metric">
              <div className="grd-ag-metric-val">{m.value}</div>
              <div className="grd-ag-metric-lbl">{m.label}</div>
            </div>
          ))}
        </div>
      )}

      {(lastRun || actions) && (
        <div className="grd-ag-foot">
          {lastRun && (
            <span className="grd-ag-lastrun">
              {IconCmp && <IconCmp name="clock" size={12} />}
              {lastRun}
            </span>
          )}
          {actions && <div className="grd-ag-actions">{actions}</div>}
        </div>
      )}
    </Tag>
  );
}
AgentCard.displayName = "AgentCard";
(window as any).AgentCard = AgentCard;
