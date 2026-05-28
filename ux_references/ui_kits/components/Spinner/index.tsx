/**
 * Spinner — indicador de carregamento circular.
 * Props: size (xs|sm|md|lg|xl em px), color (currentColor | brand | accent | white).
 */

type SpinnerSize = "xs" | "sm" | "md" | "lg" | "xl";
type SpinnerColor = "current" | "brand" | "accent" | "white";

interface SpinnerProps extends React.HTMLAttributes<HTMLSpanElement> {
  size?: SpinnerSize;
  color?: SpinnerColor;
}

const SPINNER_PX: Record<SpinnerSize, number> = { xs: 12, sm: 16, md: 20, lg: 28, xl: 40 };

function Spinner({ size = "md", color = "current", className = "", ...rest }: SpinnerProps) {
  const cls = ["grd-spinner", `grd-spinner-${color}`, className].filter(Boolean).join(" ");
  const px = SPINNER_PX[size];
  return (
    <span className={cls} style={{ width: px, height: px }} role="status" aria-label="Carregando" {...rest}>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" width={px} height={px}>
        <path d="M21 12a9 9 0 1 1-6.3-8.57" />
      </svg>
    </span>
  );
}
Spinner.displayName = "Spinner";
(window as any).Spinner = Spinner;
