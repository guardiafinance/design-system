/**
 * Button — botão interativo principal
 * -----------------------------------
 * Variantes visuais:
 *   primary      violeta preenchido (CTA principal)
 *   accent       laranja preenchido (CTA de conversão / destaque)
 *   outline      borda violeta, fundo branco
 *   ghost        sem fundo, hover suave
 *   destructive  vermelho, ação irreversível
 *   link         parece link sublinhado
 *
 * Tamanhos: sm · md (default) · lg
 *
 * Slots:
 *   leftIcon / rightIcon  → nome do Icon (<Icon name="..." />)
 *   loading               → substitui conteúdo por spinner
 *   disabled              → desabilita interação
 */

type ButtonVariant = "primary" | "accent" | "outline" | "ghost" | "destructive" | "link";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  leftIcon?: string;
  rightIcon?: string;
  loading?: boolean;
  fullWidth?: boolean;
}

function Button({
  variant = "primary",
  size = "md",
  leftIcon,
  rightIcon,
  loading = false,
  fullWidth = false,
  disabled,
  children,
  className = "",
  ...rest
}: ButtonProps) {
  const IconCmp = (window as any).Icon;
  const SpinnerCmp = (window as any).Spinner;
  const cls = [
    "grd-btn",
    `grd-btn-${variant}`,
    `grd-btn-${size}`,
    fullWidth && "grd-btn-full",
    loading && "grd-btn-loading",
    className,
  ].filter(Boolean).join(" ");

  const iconSize = size === "sm" ? 13 : size === "lg" ? 18 : 15;
  const spinnerSize = size === "sm" ? "xs" : size === "lg" ? "md" : "sm";

  return (
    <button className={cls} disabled={disabled || loading} {...rest}>
      {loading && SpinnerCmp && <SpinnerCmp size={spinnerSize} className="grd-btn-loader" />}
      {!loading && leftIcon && IconCmp && <IconCmp name={leftIcon} size={iconSize} />}
      <span className="grd-btn-label">{children}</span>
      {!loading && rightIcon && IconCmp && <IconCmp name={rightIcon} size={iconSize} />}
    </button>
  );
}

Button.displayName = "Button";
(window as any).Button = Button;
