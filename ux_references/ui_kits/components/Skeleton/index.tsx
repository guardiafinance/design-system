/**
 * Skeleton — placeholder animado para conteúdo ainda carregando.
 * Variants: text (linha) · title (linha maior) · rect (bloco) · circle.
 * Props: width, height, lines (para text), className, style.
 */

type SkeletonVariant = "text" | "title" | "rect" | "circle";

interface SkeletonProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: SkeletonVariant;
  width?: number | string;
  height?: number | string;
  lines?: number;
}

function Skeleton({
  variant = "text",
  width,
  height,
  lines = 1,
  className = "",
  style,
  ...rest
}: SkeletonProps) {
  const baseCls = ["grd-skel", `grd-skel-${variant}`, className].filter(Boolean).join(" ");

  if (variant === "text" && lines > 1) {
    return (
      <span className="grd-skel-group" {...rest}>
        {Array.from({ length: lines }).map((_, i) => (
          <span
            key={i}
            className={baseCls}
            style={{
              width: i === lines - 1 ? "70%" : width || "100%",
              ...style,
            }}
          />
        ))}
      </span>
    );
  }

  return (
    <span
      className={baseCls}
      style={{ width, height, ...style }}
      {...rest}
    />
  );
}
Skeleton.displayName = "Skeleton";
(window as any).Skeleton = Skeleton;
