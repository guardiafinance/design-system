/**
 * Separator — divisor horizontal ou vertical.
 * Variantes: solid (default) · dashed · dotted
 * Com label opcional centralizado.
 */

interface SeparatorProps extends React.HTMLAttributes<HTMLDivElement> {
  orientation?: "horizontal" | "vertical";
  appearance?: "solid" | "dashed" | "dotted";
  label?: string;
}

function Separator({
  orientation = "horizontal",
  appearance = "solid",
  label,
  className = "",
  ...rest
}: SeparatorProps) {
  const cls = [
    "grd-sep",
    `grd-sep-${orientation}`,
    `grd-sep-${appearance}`,
    label && "grd-sep-labeled",
    className,
  ].filter(Boolean).join(" ");
  if (label) {
    return (
      <div className={cls} role="separator" {...rest}>
        <span className="grd-sep-line" />
        <span className="grd-sep-label">{label}</span>
        <span className="grd-sep-line" />
      </div>
    );
  }
  return <div className={cls} role="separator" {...rest} />;
}
Separator.displayName = "Separator";
(window as any).Separator = Separator;
