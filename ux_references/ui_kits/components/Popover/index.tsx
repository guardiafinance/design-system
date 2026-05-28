
/**
 * Popover — pop flutuante acionado por clique. Para conteúdo pequeno: filtros, forms, hints acionáveis.
 * Props: trigger (elemento que abre), children (conteúdo), side, align, width.
 */

interface PopoverProps {
  trigger: React.ReactElement;
  children: React.ReactNode;
  side?: "top" | "right" | "bottom" | "left";
  align?: "start" | "center" | "end";
  width?: number | string;
  closeOnOutside?: boolean;
}

function Popover({ trigger, children, side = "bottom", align = "start", width, closeOnOutside = true }: PopoverProps) {
  const [open, setOpen] = React.useState(false);
  const [coords, setCoords] = React.useState<{ top: number; left: number } | null>(null);
  const triggerRef = React.useRef<HTMLElement>(null);
  const popRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!open) return;
    if (!triggerRef.current) return;
    const r = triggerRef.current.getBoundingClientRect();
    const gap = 6;
    let top = 0, left = 0;
    if (side === "bottom") { top = r.bottom + gap; left = align === "start" ? r.left : align === "end" ? r.right : r.left + r.width/2; }
    if (side === "top")    { top = r.top - gap;    left = align === "start" ? r.left : align === "end" ? r.right : r.left + r.width/2; }
    if (side === "right")  { left = r.right + gap; top  = align === "start" ? r.top  : align === "end" ? r.bottom : r.top + r.height/2; }
    if (side === "left")   { left = r.left - gap;  top  = align === "start" ? r.top  : align === "end" ? r.bottom : r.top + r.height/2; }
    setCoords({ top, left });
  }, [open, side, align]);

  React.useEffect(() => {
    if (!open || !closeOnOutside) return;
    function onDown(e: MouseEvent) {
      const t = e.target as Node;
      if (popRef.current?.contains(t) || triggerRef.current?.contains(t)) return;
      setOpen(false);
    }
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open, closeOnOutside]);

  const trig = React.cloneElement(trigger, {
    ref: triggerRef,
    onClick: (e: any) => { setOpen(o => !o); trigger.props.onClick?.(e); },
  });
  return (<>
    {trig}
    {open && coords && ReactDOM.createPortal(
      <div
        ref={popRef}
        className={`grd-pop grd-pop-${side} grd-pop-al-${align}`}
        style={{ top: coords.top, left: coords.left, width }}
        role="dialog"
      >
        {children}
      </div>,
      document.body
    )}
  </>);
}
Popover.displayName = "Popover";
(window as any).Popover = Popover;
