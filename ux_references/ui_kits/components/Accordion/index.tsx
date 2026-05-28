
/**
 * Accordion — grupos de painéis colapsáveis.
 * Props: items [{ id, title, content, defaultOpen?, icon? }], type (single|multiple).
 */

interface AccordionItem {
  id: string;
  title: React.ReactNode;
  content: React.ReactNode;
  icon?: string;
  defaultOpen?: boolean;
  disabled?: boolean;
}
interface AccordionProps {
  items: AccordionItem[];
  type?: "single" | "multiple";
  variant?: "bordered" | "plain";
  className?: string;
}

function Accordion({ items, type = "multiple", variant = "bordered", className = "" }: AccordionProps) {
  const IconCmp = (window as any).Icon;
  const initial = new Set(items.filter(i => i.defaultOpen).map(i => i.id));
  const [openSet, setOpenSet] = React.useState<Set<string>>(initial);

  function toggle(id: string) {
    setOpenSet(prev => {
      const next = new Set(prev);
      if (type === "single") {
        if (next.has(id)) next.clear();
        else { next.clear(); next.add(id); }
      } else {
        if (next.has(id)) next.delete(id);
        else next.add(id);
      }
      return next;
    });
  }

  return (
    <div className={`grd-acc grd-acc-${variant} ${className}`}>
      {items.map(it => {
        const open = openSet.has(it.id);
        return (
          <div key={it.id} className={`grd-acc-item ${open ? "grd-acc-item-open" : ""} ${it.disabled ? "grd-acc-item-dis" : ""}`}>
            <button
              type="button" className="grd-acc-trigger"
              aria-expanded={open}
              disabled={it.disabled}
              onClick={() => !it.disabled && toggle(it.id)}
            >
              {it.icon && IconCmp && <IconCmp name={it.icon} size={15} />}
              <span className="grd-acc-title">{it.title}</span>
              {IconCmp && <IconCmp name="chevron-down" size={15} />}
            </button>
            {open && <div className="grd-acc-content">{it.content}</div>}
          </div>
        );
      })}
    </div>
  );
}
Accordion.displayName = "Accordion";
(window as any).Accordion = Accordion;
