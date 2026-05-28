/**
 * Badge — rótulo compacto para status/tag/contagem.
 * Variantes: neutral · brand · accent · success · warning · danger · info
 * Estilos: solid (default) · soft · outline
 * Shape: pill (default) · square
 * Com ponto opcional (dot).
 */

type BadgeVariant = "neutral" | "brand" | "accent" | "success" | "warning" | "danger" | "info";
type BadgeStyle = "solid" | "soft" | "outline";

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  appearance?: BadgeStyle;
  shape?: "pill" | "square";
  dot?: boolean;
}

function Badge({
  variant = "neutral",
  appearance = "soft",
  shape = "pill",
  dot = false,
  className = "",
  children,
  ...rest
}: BadgeProps) {
  const cls = [
    "grd-badge",
    `grd-badge-${variant}`,
    `grd-badge-${appearance}`,
    `grd-badge-${shape}`,
    className,
  ].filter(Boolean).join(" ");
  return (
    <span className={cls} {...rest}>
      {dot && <span className="grd-badge-dot" />}
      {children}
    </span>
  );
}
Badge.displayName = "Badge";
(window as any).Badge = Badge;
