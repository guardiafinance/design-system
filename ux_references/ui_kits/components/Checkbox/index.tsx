
/**
 * Checkbox — seleção múltipla.
 * Props: checked, indeterminate, size, invalid, label, description.
 */

interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size" | "type"> {
  size?: "sm" | "md";
  indeterminate?: boolean;
  invalid?: boolean;
  label?: React.ReactNode;
  description?: React.ReactNode;
}

function Checkbox({
  size = "md",
  indeterminate = false,
  invalid,
  label,
  description,
  className = "",
  id,
  checked,
  disabled,
  ...rest
}: CheckboxProps) {
  const ref = React.useRef<HTMLInputElement>(null);
  const genId = React.useId();
  const cbId = id ?? genId;
  React.useEffect(() => {
    if (ref.current) ref.current.indeterminate = indeterminate;
  }, [indeterminate]);
  const wrapCls = [
    "grd-cb",
    `grd-cb-${size}`,
    invalid && "grd-cb-invalid",
    disabled && "grd-cb-disabled",
    className,
  ].filter(Boolean).join(" ");
  const IconCmp = (window as any).Icon;
  return (
    <label className={wrapCls} htmlFor={cbId}>
      <span className="grd-cb-box">
        <input
          ref={ref}
          id={cbId}
          type="checkbox"
          checked={checked}
          disabled={disabled}
          {...rest}
        />
        <span className="grd-cb-mark">
          {IconCmp && (
            indeterminate
              ? <IconCmp name="minus" size={size === "sm" ? 12 : 14} />
              : <IconCmp name="check" size={size === "sm" ? 12 : 14} />
          )}
        </span>
      </span>
      {(label || description) && (
        <span className="grd-cb-text">
          {label && <span className="grd-cb-label">{label}</span>}
          {description && <span className="grd-cb-desc">{description}</span>}
        </span>
      )}
    </label>
  );
}
Checkbox.displayName = "Checkbox";
(window as any).Checkbox = Checkbox;
