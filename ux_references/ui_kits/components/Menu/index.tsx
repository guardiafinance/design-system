
/**
 * Menu — dropdown de ações.
 * Props:
 *   trigger: React.ReactElement — botão que abre
 *   items: MenuItem[]
 * MenuItem:
 *   { label, icon?, shortcut?, onClick, destructive?, disabled? }
 *   { type: "separator" }
 *   { type: "label", label }  (cabeçalho de grupo)
 */

type MenuItem =
  | { type?: "item"; label: React.ReactNode; icon?: string; shortcut?: string; onClick?: () => void; destructive?: boolean; disabled?: boolean }
  | { type: "separator" }
  | { type: "label"; label: React.ReactNode };

interface MenuProps {
  trigger: React.ReactElement;
  items: MenuItem[];
  side?: "bottom" | "top";
  align?: "start" | "end";
  minWidth?: number;
}

function Menu({ trigger, items, side = "bottom", align = "start", minWidth = 180 }: MenuProps) {
  const IconCmp = (window as any).Icon;
  const [open, setOpen] = React.useState(false);
  const [coords, setCoords] = React.useState<{ top: number; left: number } | null>(null);
  const triggerRef = React.useRef<HTMLElement>(null);
  const menuRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!open || !triggerRef.current) return;
    const r = triggerRef.current.getBoundingClientRect();
    const gap = 4;
    const top = side === "bottom" ? r.bottom + gap : r.top - gap;
    const left = align === "start" ? r.left : r.right;
    setCoords({ top, left });
  }, [open, side, align]);

  React.useEffect(() => {
    if (!open) return;
    function onDown(e: MouseEvent) {
      const t = e.target as Node;
      if (menuRef.current?.contains(t) || triggerRef.current?.contains(t)) return;
      setOpen(false);
    }
    function onKey(e: KeyboardEvent) { if (e.key === "Escape") setOpen(false); }
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const trig = React.cloneElement(trigger, {
    ref: triggerRef,
    onClick: (e: any) => { setOpen(o => !o); trigger.props.onClick?.(e); },
    "aria-haspopup": "menu",
    "aria-expanded": open,
  });

  return (<>
    {trig}
    {open && coords && ReactDOM.createPortal(
      <div
        ref={menuRef}
        className={`grd-mnu grd-mnu-${side} grd-mnu-al-${align}`}
        style={{ top: coords.top, left: coords.left, minWidth }}
        role="menu"
      >
        {items.map((it, i) => {
          if (it.type === "separator") return <div key={i} className="grd-mnu-sep" />;
          if (it.type === "label")     return <div key={i} className="grd-mnu-lbl">{it.label}</div>;
          const item = it as Extract<MenuItem, { onClick?: () => void }>;
          return (
            <button
              key={i} role="menuitem" type="button"
              className={[
                "grd-mnu-item",
                item.destructive && "grd-mnu-item-danger",
                item.disabled && "grd-mnu-item-dis",
              ].filter(Boolean).join(" ")}
              disabled={item.disabled}
              onClick={() => {
                if (item.disabled) return;
                item.onClick?.();
                setOpen(false);
              }}
            >
              {item.icon && IconCmp && <span className="grd-mnu-ic"><IconCmp name={item.icon} size={15} /></span>}
              <span className="grd-mnu-lab">{item.label}</span>
              {item.shortcut && <span className="grd-mnu-sc">{item.shortcut}</span>}
            </button>
          );
        })}
      </div>,
      document.body
    )}
  </>);
}
Menu.displayName = "Menu";
(window as any).Menu = Menu;
