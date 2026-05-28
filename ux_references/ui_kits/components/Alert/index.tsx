
/**
 * Alert — banner inline com severidade.
 * Tipos: info | success | warning | danger.
 */

interface AlertProps {
  type?: "info" | "success" | "warning" | "danger";
  title?: React.ReactNode;
  children?: React.ReactNode;
  icon?: string | null;
  closable?: boolean;
  onClose?: () => void;
  action?: React.ReactNode;
  className?: string;
}

const ALERT_ICON: Record<string, string> = {
  info: "info",
  success: "circle-check",
  warning: "triangle-alert",
  danger: "circle-x",
};

function Alert({
  type = "info",
  title,
  children,
  icon,
  closable = false,
  onClose,
  action,
  className = "",
}: AlertProps) {
  const IconCmp = (window as any).Icon;
  const iconName = icon === null ? null : (icon ?? ALERT_ICON[type]);
  const cls = ["grd-alert", `grd-alert-${type}`, className].filter(Boolean).join(" ");
  return (
    <div role="alert" className={cls}>
      {iconName && IconCmp && (
        <span className="grd-alert-ic"><IconCmp name={iconName} size={18} /></span>
      )}
      <div className="grd-alert-body">
        {title && <div className="grd-alert-title">{title}</div>}
        {children && <div className="grd-alert-msg">{children}</div>}
      </div>
      {action && <div className="grd-alert-action">{action}</div>}
      {closable && IconCmp && (
        <button className="grd-alert-close" onClick={onClose} aria-label="Fechar">
          <IconCmp name="x" size={15} />
        </button>
      )}
    </div>
  );
}
Alert.displayName = "Alert";
(window as any).Alert = Alert;
