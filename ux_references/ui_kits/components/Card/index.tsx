
/**
 * Card — contêiner com padding, borda e sombra leve.
 * Composição:
 *   <Card>
 *     <Card.Header title="…" description="…" actions={<…/>} />
 *     <Card.Body>…</Card.Body>
 *     <Card.Footer>…</Card.Footer>
 *   </Card>
 * Variant: plain | outlined (default) | elevated | filled
 * Interactive: hover feedback + cursor
 */

interface CardProps {
  variant?: "plain" | "outlined" | "elevated" | "filled";
  padding?: "none" | "sm" | "md" | "lg";
  interactive?: boolean;
  onClick?: () => void;
  className?: string;
  children?: React.ReactNode;
}

function Card({ variant = "outlined", padding = "md", interactive, onClick, className = "", children }: CardProps) {
  const cls = [
    "grd-card",
    `grd-card-${variant}`,
    `grd-card-p-${padding}`,
    interactive && "grd-card-ia",
    className,
  ].filter(Boolean).join(" ");
  const Tag = onClick ? "button" : "div";
  return <Tag className={cls} onClick={onClick}>{children}</Tag>;
}

function CardHeader({ title, description, actions, icon, className = "" }: { title?: React.ReactNode; description?: React.ReactNode; actions?: React.ReactNode; icon?: React.ReactNode; className?: string }) {
  return (
    <div className={`grd-card-head ${className}`}>
      {icon && <div className="grd-card-head-ic">{icon}</div>}
      <div className="grd-card-head-text">
        {title && <h3 className="grd-card-head-title">{title}</h3>}
        {description && <p className="grd-card-head-desc">{description}</p>}
      </div>
      {actions && <div className="grd-card-head-act">{actions}</div>}
    </div>
  );
}
function CardBody({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`grd-card-body ${className}`}>{children}</div>;
}
function CardFooter({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`grd-card-foot ${className}`}>{children}</div>;
}
(Card as any).Header = CardHeader;
(Card as any).Body = CardBody;
(Card as any).Footer = CardFooter;
Card.displayName = "Card";
(window as any).Card = Card;
