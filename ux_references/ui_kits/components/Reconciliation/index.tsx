
/**
 * Reconciliation — linha de conciliação (sistema / banco) com diff e status.
 * Props:
 *   left: { label, amount, date?, meta? }
 *   right: { label, amount, date?, meta? }
 *   status: "match" | "diff" | "unmatched"
 *   confidence?: "high" | "medium" | "low"
 *   delta?: number
 *   onConfirm?, onReject?, onOpen?
 */

interface RecSide {
  label: React.ReactNode;
  amount: number;
  date?: React.ReactNode;
  meta?: React.ReactNode;
  source?: React.ReactNode;
}
interface ReconciliationProps {
  left: RecSide;
  right?: RecSide;
  status?: "match" | "diff" | "unmatched";
  confidence?: "high" | "medium" | "low";
  onConfirm?: () => void;
  onReject?: () => void;
  onOpen?: () => void;
  className?: string;
}

function fmtBRL(n: number) {
  return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function Reconciliation({
  left, right, status = "match", confidence,
  onConfirm, onReject, onOpen, className = "",
}: ReconciliationProps) {
  const IconCmp = (window as any).Icon;
  const ConfIndicator = (window as any).ConfidenceIndicator;
  const delta = right ? (left.amount - right.amount) : null;
  const cls = ["grd-rc", `grd-rc-${status}`, className].filter(Boolean).join(" ");

  const STATUS_LBL: Record<string, string> = {
    match: "Conciliado",
    diff: "Divergente",
    unmatched: "Sem par",
  };

  return (
    <div className={cls}>
      <div className="grd-rc-side grd-rc-left">
        <div className="grd-rc-src">{left.source ?? "Sistema"}</div>
        <div className="grd-rc-label">{left.label}</div>
        <div className="grd-rc-amount">{fmtBRL(left.amount)}</div>
        {(left.date || left.meta) && (
          <div className="grd-rc-meta">
            {left.date}{left.date && left.meta && " · "}{left.meta}
          </div>
        )}
      </div>

      <div className="grd-rc-center">
        <span className={`grd-rc-status grd-rc-status-${status}`}>
          {IconCmp && (
            <IconCmp
              name={status === "match" ? "check" : status === "diff" ? "equal-not" : "x"}
              size={14}
            />
          )}
          {STATUS_LBL[status]}
        </span>
        {confidence && ConfIndicator && (
          <ConfIndicator level={confidence} variant="chip" size="sm" showValue={false} />
        )}
      </div>

      {right ? (
        <div className="grd-rc-side grd-rc-right">
          <div className="grd-rc-src">{right.source ?? "Banco"}</div>
          <div className="grd-rc-label">{right.label}</div>
          <div className="grd-rc-amount">{fmtBRL(right.amount)}</div>
          {(right.date || right.meta) && (
            <div className="grd-rc-meta">
              {right.date}{right.date && right.meta && " · "}{right.meta}
            </div>
          )}
        </div>
      ) : (
        <div className="grd-rc-side grd-rc-empty">
          {IconCmp && <IconCmp name="search" size={18} />}
          <span>Sem correspondência</span>
        </div>
      )}

      {(onConfirm || onReject || onOpen) && (
        <div className="grd-rc-actions">
          {onOpen && (
            <button type="button" className="grd-rc-btn grd-rc-btn-ghost" onClick={onOpen}>
              {IconCmp && <IconCmp name="eye" size={13} />} Ver
            </button>
          )}
          {onReject && (
            <button type="button" className="grd-rc-btn grd-rc-btn-danger" onClick={onReject} aria-label="Rejeitar">
              {IconCmp && <IconCmp name="x" size={14} />}
            </button>
          )}
          {onConfirm && (
            <button type="button" className="grd-rc-btn grd-rc-btn-primary" onClick={onConfirm}>
              {IconCmp && <IconCmp name="check" size={14} />} Confirmar
            </button>
          )}
        </div>
      )}
    </div>
  );
}
Reconciliation.displayName = "Reconciliation";
(window as any).Reconciliation = Reconciliation;
