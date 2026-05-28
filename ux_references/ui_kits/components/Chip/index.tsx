/**
 * Chip — item selecionável/removível com estado.
 * Use-cases: filtros ativos, tags em seletor, aplicáveis em listas.
 * Props: selected, onRemove, leftIcon.
 */

interface ChipProps extends React.HTMLAttributes<HTMLSpanElement> {
  selected?: boolean;
  leftIcon?: string;
  onRemove?: () => void;
  disabled?: boolean;
}

function Chip({
  selected = false,
  leftIcon,
  onRemove,
  disabled = false,
  className = "",
  children,
  ...rest
}: ChipProps) {
  const IconCmp = (window as any).Icon;
  const cls = [
    "grd-chip",
    selected && "grd-chip-selected",
    disabled && "grd-chip-disabled",
    className,
  ].filter(Boolean).join(" ");
  return (
    <span className={cls} {...rest}>
      {leftIcon && IconCmp && <IconCmp name={leftIcon} size={13} />}
      <span>{children}</span>
      {onRemove && (
        <button
          type="button"
          className="grd-chip-remove"
          onClick={(e) => { e.stopPropagation(); onRemove(); }}
          aria-label="Remover"
          disabled={disabled}
        >
          {IconCmp && <IconCmp name="close" size={12} />}
        </button>
      )}
    </span>
  );
}
Chip.displayName = "Chip";
(window as any).Chip = Chip;
