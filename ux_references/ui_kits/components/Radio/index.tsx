
/**
 * Radio — seleção única. Usado dentro de <RadioGroup name="...">.
 * RadioGroup: gerencia o estado e repassa name para os radios.
 */

interface RadioProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size" | "type"> {
  size?: "sm" | "md";
  invalid?: boolean;
  label?: React.ReactNode;
  description?: React.ReactNode;
  value: string;
}

function Radio({
  size = "md",
  invalid,
  label,
  description,
  className = "",
  id,
  disabled,
  ...rest
}: RadioProps) {
  const genId = React.useId();
  const rId = id ?? genId;
  const wrapCls = [
    "grd-rd",
    `grd-rd-${size}`,
    invalid && "grd-rd-invalid",
    disabled && "grd-rd-disabled",
    className,
  ].filter(Boolean).join(" ");
  return (
    <label className={wrapCls} htmlFor={rId}>
      <span className="grd-rd-box">
        <input id={rId} type="radio" disabled={disabled} {...rest} />
        <span className="grd-rd-mark"><span className="grd-rd-dot" /></span>
      </span>
      {(label || description) && (
        <span className="grd-rd-text">
          {label && <span className="grd-rd-label">{label}</span>}
          {description && <span className="grd-rd-desc">{description}</span>}
        </span>
      )}
    </label>
  );
}
Radio.displayName = "Radio";
(window as any).Radio = Radio;

interface RadioGroupProps {
  name: string;
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  direction?: "column" | "row";
  gap?: number;
  children: React.ReactNode;
}

function RadioGroup({ name, value, defaultValue, onChange, direction = "column", gap = 10, children }: RadioGroupProps) {
  const [internal, setInternal] = React.useState(defaultValue ?? "");
  const current = value !== undefined ? value : internal;
  const wrapStyle: React.CSSProperties = { display: "flex", flexDirection: direction, gap };
  return (
    <div role="radiogroup" style={wrapStyle}>
      {React.Children.map(children, (child) => {
        if (!React.isValidElement(child)) return child;
        const childVal = (child.props as any).value;
        return React.cloneElement(child as any, {
          name,
          checked: current === childVal,
          onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
            if (value === undefined) setInternal(childVal);
            onChange?.(childVal);
            (child.props as any).onChange?.(e);
          },
        });
      })}
    </div>
  );
}
RadioGroup.displayName = "RadioGroup";
(window as any).RadioGroup = RadioGroup;
