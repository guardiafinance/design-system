/**
 * IconButton — botão de ícone-único (sem label)
 * ---------------------------------------------
 * Usado em toolbars, linhas de tabela, headers compactos.
 * Precisa SEMPRE de `aria-label` (acessibilidade).
 *
 * Variantes: primary · accent · outline · ghost · destructive
 * Tamanhos: sm (28) · md (36) · lg (44)
 * Shape: square (default) · circle
 */

type IconButtonVariant = "primary" | "accent" | "outline" | "ghost" | "destructive";
type IconButtonSize = "sm" | "md" | "lg";
type IconButtonShape = "square" | "circle";

interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon: string;
  variant?: IconButtonVariant;
  size?: IconButtonSize;
  shape?: IconButtonShape;
  "aria-label": string;
}

function IconButton({
  icon,
  variant = "ghost",
  size = "md",
  shape = "square",
  className = "",
  ...rest
}: IconButtonProps) {
  const IconCmp = (window as any).Icon;
  const cls = [
    "grd-iconbtn",
    `grd-iconbtn-${variant}`,
    `grd-iconbtn-${size}`,
    `grd-iconbtn-${shape}`,
    className,
  ].filter(Boolean).join(" ");
  const iconSize = size === "sm" ? 14 : size === "lg" ? 20 : 16;
  return (
    <button className={cls} {...rest}>
      {IconCmp && <IconCmp name={icon} size={iconSize} />}
    </button>
  );
}

IconButton.displayName = "IconButton";
(window as any).IconButton = IconButton;
