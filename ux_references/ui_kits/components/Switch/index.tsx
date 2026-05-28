
/**
 * Switch — toggle on/off. Para mudanças imediatas (um checkbox seria passivo).
 * Props: size, checked, disabled, label, description.
 */

interface SwitchProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size" | "type"> {
  size?: "sm" | "md";
  label?: React.ReactNode;
  description?: React.ReactNode;
}

function Switch({
  size = "md",
  label,
  description,
  className = "",
  id,
  disabled,
  checked,
  ...rest
}: SwitchProps) {
  const genId = React.useId();
  const sId = id ?? genId;
  const wrapCls = [
    "grd-sw",
    `grd-sw-${size}`,
    disabled && "grd-sw-disabled",
    className,
  ].filter(Boolean).join(" ");
  return (
    <label className={wrapCls} htmlFor={sId}>
      <span className="grd-sw-track">
        <input id={sId} type="checkbox" role="switch" disabled={disabled} checked={checked} {...rest} />
        <span className="grd-sw-thumb" />
      </span>
      {(label || description) && (
        <span className="grd-sw-text">
          {label && <span className="grd-sw-label">{label}</span>}
          {description && <span className="grd-sw-desc">{description}</span>}
        </span>
      )}
    </label>
  );
}
Switch.displayName = "Switch";
(window as any).Switch = Switch;
