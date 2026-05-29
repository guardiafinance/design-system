
/**
 * Drawer — painel lateral. Ideal para detalhes, filtros, formulários secundários.
 * Mantém contexto da tela principal. Props: side (right|left), size, open, onClose, title, children, footer.
 */

interface DrawerProps {
  open: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  description?: React.ReactNode;
  children?: React.ReactNode;
  footer?: React.ReactNode;
  side?: "right" | "left";
  size?: "sm" | "md" | "lg";
  showClose?: boolean;
}

function Drawer({
  open, onClose, title, description, children, footer,
  side = "right", size = "md", showClose = true,
}: DrawerProps) {
  const IconCmp = (window as any).Icon;

  React.useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) { if (e.key === "Escape") onClose(); }
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", onKey); document.body.style.overflow = prev; };
  }, [open, onClose]);

  if (!open) return null;
  return ReactDOM.createPortal(
    <div className="grd-drw-backdrop" onClick={onClose}>
      <aside
        className={`grd-drw grd-drw-${side} grd-drw-${size}`}
        role="dialog" aria-modal="true"
        onClick={(e) => e.stopPropagation()}
      >
        {(title || showClose) && (
          <div className="grd-drw-head">
            <div className="grd-drw-titlewrap">
              {title && <h2 className="grd-drw-title">{title}</h2>}
              {description && <p className="grd-drw-desc">{description}</p>}
            </div>
            {showClose && IconCmp && (
              <button className="grd-drw-close" onClick={onClose} aria-label="Fechar">
                <IconCmp name="x" size={16} />
              </button>
            )}
          </div>
        )}
        {children && <div className="grd-drw-body">{children}</div>}
        {footer && <div className="grd-drw-foot">{footer}</div>}
      </aside>
    </div>,
    document.body
  );
}
Drawer.displayName = "Drawer";
(window as any).Drawer = Drawer;
