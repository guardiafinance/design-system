
/**
 * Tooltip — dica contextual curta em hover/focus.
 * Props: content (string | node), side (top|right|bottom|left), size.
 */

interface TooltipProps {
  content: React.ReactNode;
  side?: "top" | "right" | "bottom" | "left";
  size?: "sm" | "md";
  children: React.ReactElement;
  delay?: number;
}

function Tooltip({ content, side = "top", size = "md", children, delay = 200 }: TooltipProps) {
  const [open, setOpen] = React.useState(false);
  const [coords, setCoords] = React.useState<{top: number; left: number} | null>(null);
  const triggerRef = React.useRef<HTMLElement>(null);
  const timerRef = React.useRef<number | null>(null);

  function show() {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => {
      if (!triggerRef.current) return;
      const r = triggerRef.current.getBoundingClientRect();
      let top = 0, left = 0;
      const gap = 8;
      if (side === "top")    { top = r.top - gap;  left = r.left + r.width/2; }
      if (side === "bottom") { top = r.bottom + gap; left = r.left + r.width/2; }
      if (side === "left")   { top = r.top + r.height/2; left = r.left - gap; }
      if (side === "right")  { top = r.top + r.height/2; left = r.right + gap; }
      setCoords({ top, left });
      setOpen(true);
    }, delay);
  }
  function hide() {
    if (timerRef.current) clearTimeout(timerRef.current);
    setOpen(false);
  }

  const trigger = React.cloneElement(children, {
    ref: triggerRef,
    onMouseEnter: (e: any) => { show(); children.props.onMouseEnter?.(e); },
    onMouseLeave: (e: any) => { hide(); children.props.onMouseLeave?.(e); },
    onFocus: (e: any) => { show(); children.props.onFocus?.(e); },
    onBlur: (e: any) => { hide(); children.props.onBlur?.(e); },
  });

  return (<>
    {trigger}
    {open && coords && (typeof document !== "undefined") && ReactDOM.createPortal(
      <div
        className={`grd-tt grd-tt-${side} grd-tt-${size}`}
        style={{ top: coords.top, left: coords.left }}
        role="tooltip"
      >
        {content}
        <span className="grd-tt-arrow" />
      </div>,
      document.body
    )}
  </>);
}
Tooltip.displayName = "Tooltip";
(window as any).Tooltip = Tooltip;
