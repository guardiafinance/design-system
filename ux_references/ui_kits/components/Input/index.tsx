
/**
 * Input — campo de texto de linha única.
 * Props:
 *   size:   sm · md (default) · lg
 *   state:  default · error · success
 *   leftIcon, rightIcon
 *   prefix, suffix (ex: R$ / @)
 *   invalid (boolean) — shortcut para state=error
 */

type InputSize = "sm" | "md" | "lg";
type InputState = "default" | "error" | "success";

interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size"> {
  size?: InputSize;
  state?: InputState;
  invalid?: boolean;
  leftIcon?: string;
  rightIcon?: string;
  prefix?: React.ReactNode;
  suffix?: React.ReactNode;
}

function Input({
  size = "md",
  state = "default",
  invalid,
  leftIcon,
  rightIcon,
  prefix,
  suffix,
  className = "",
  disabled,
  ...rest
}: InputProps) {
  const IconCmp = (window as any).Icon;
  const effectiveState = invalid ? "error" : state;
  const wrapCls = [
    "grd-input",
    `grd-input-${size}`,
    `grd-input-${effectiveState}`,
    disabled && "grd-input-disabled",
    (leftIcon || prefix) && "grd-input-has-left",
    (rightIcon || suffix) && "grd-input-has-right",
    className,
  ].filter(Boolean).join(" ");
  const iconSize = size === "sm" ? 13 : size === "lg" ? 18 : 15;
  return (
    <div className={wrapCls}>
      {leftIcon && IconCmp && <span className="grd-input-ic grd-input-ic-l"><IconCmp name={leftIcon} size={iconSize} /></span>}
      {prefix && <span className="grd-input-afx grd-input-afx-l">{prefix}</span>}
      <input disabled={disabled} {...rest} />
      {suffix && <span className="grd-input-afx grd-input-afx-r">{suffix}</span>}
      {rightIcon && IconCmp && <span className="grd-input-ic grd-input-ic-r"><IconCmp name={rightIcon} size={iconSize} /></span>}
    </div>
  );
}
Input.displayName = "Input";
(window as any).Input = Input;
