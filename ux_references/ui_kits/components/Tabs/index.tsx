
/**
 * Tabs — navegação horizontal entre views. Composto: Tabs + Tabs.Item.
 * Props: value, defaultValue, onChange, variant (underline|pills|boxed), size.
 */

interface TabItemProps {
  value: string;
  label: React.ReactNode;
  icon?: string;
  badge?: React.ReactNode;
  disabled?: boolean;
}
interface TabsProps {
  value?: string;
  defaultValue?: string;
  onChange?: (v: string) => void;
  variant?: "underline" | "pills" | "boxed";
  size?: "sm" | "md";
  items: TabItemProps[];
  className?: string;
}

function Tabs({ value, defaultValue, onChange, variant = "underline", size = "md", items, className = "" }: TabsProps) {
  const [internal, setInternal] = React.useState(defaultValue ?? items[0]?.value);
  const current = value !== undefined ? value : internal;
  const IconCmp = (window as any).Icon;
  const cls = ["grd-tabs", `grd-tabs-${variant}`, `grd-tabs-${size}`, className].filter(Boolean).join(" ");
  return (
    <div className={cls} role="tablist">
      {items.map(it => {
        const active = it.value === current;
        const iCls = [
          "grd-tabs-tab",
          active && "grd-tabs-tab-active",
          it.disabled && "grd-tabs-tab-dis",
        ].filter(Boolean).join(" ");
        return (
          <button
            key={it.value}
            role="tab"
            aria-selected={active}
            disabled={it.disabled}
            className={iCls}
            onClick={() => {
              if (it.disabled) return;
              if (value === undefined) setInternal(it.value);
              onChange?.(it.value);
            }}
          >
            {it.icon && IconCmp && <IconCmp name={it.icon} size={size === "sm" ? 13 : 15} />}
            <span>{it.label}</span>
            {it.badge && <span className="grd-tabs-badge">{it.badge}</span>}
          </button>
        );
      })}
    </div>
  );
}
Tabs.displayName = "Tabs";
(window as any).Tabs = Tabs;
