
/**
 * EmptyState — tela vazia com ilustração de ícone e CTA.
 * Props: icon, title, description, action, size.
 */

interface EmptyStateProps {
  icon?: string;
  title: React.ReactNode;
  description?: React.ReactNode;
  action?: React.ReactNode;
  size?: "sm" | "md" | "lg";
  className?: string;
}

function EmptyState({ icon = "inbox", title, description, action, size = "md", className = "" }: EmptyStateProps) {
  const IconCmp = (window as any).Icon;
  const cls = ["grd-empty", `grd-empty-${size}`, className].filter(Boolean).join(" ");
  const iconSize = size === "sm" ? 22 : size === "lg" ? 36 : 28;
  return (
    <div className={cls}>
      {IconCmp && (
        <div className="grd-empty-ic"><IconCmp name={icon} size={iconSize} /></div>
      )}
      <div className="grd-empty-title">{title}</div>
      {description && <div className="grd-empty-desc">{description}</div>}
      {action && <div className="grd-empty-action">{action}</div>}
    </div>
  );
}
EmptyState.displayName = "EmptyState";
(window as any).EmptyState = EmptyState;
