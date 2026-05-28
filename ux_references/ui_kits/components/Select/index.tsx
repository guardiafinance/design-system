
/**
 * Select — dropdown nativo <select>.
 * Ideal para listas curtas e conhecidas. Para listas longas ou buscáveis, use <Combobox />.
 */

type SelectSize = "sm" | "md" | "lg";
type SelectState = "default" | "error" | "success";

interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, "size"> {
  size?: SelectSize;
  state?: SelectState;
  invalid?: boolean;
  leftIcon?: string;
  placeholder?: string;
  options?: Array<{ value: string; label: string; disabled?: boolean }>;
}

function Select({
  size = "md",
  state = "default",
  invalid,
  leftIcon,
  placeholder,
  options,
  className = "",
  children,
  disabled,
  value,
  defaultValue,
  ...rest
}: SelectProps) {
  const IconCmp = (window as any).Icon;
  const effective = invalid ? "error" : state;
  const wrapCls = [
    "grd-select",
    `grd-select-${size}`,
    `grd-select-${effective}`,
    disabled && "grd-select-disabled",
    leftIcon && "grd-select-has-left",
    className,
  ].filter(Boolean).join(" ");
  const iconSize = size === "sm" ? 13 : size === "lg" ? 18 : 15;

  // If no controlled value and there's a placeholder, show empty selected
  const useDefault = value === undefined && defaultValue === undefined && placeholder !== undefined;

  return (
    <div className={wrapCls}>
      {leftIcon && IconCmp && <span className="grd-select-ic grd-select-ic-l"><IconCmp name={leftIcon} size={iconSize} /></span>}
      <select
        disabled={disabled}
        value={value}
        defaultValue={useDefault ? "" : defaultValue}
        {...rest}
      >
        {placeholder && <option value="" disabled hidden>{placeholder}</option>}
        {options
          ? options.map(o => <option key={o.value} value={o.value} disabled={o.disabled}>{o.label}</option>)
          : children}
      </select>
      {IconCmp && <span className="grd-select-chev"><IconCmp name="chevron-down" size={iconSize} /></span>}
    </div>
  );
}
Select.displayName = "Select";
(window as any).Select = Select;
