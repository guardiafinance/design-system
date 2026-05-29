
/**
 * Dialog — modal centrado. Usar para decisões críticas ou fluxos curtos que exigem foco total.
 * Props: open, onClose, title, description, children, footer, size.
 * Não montar sem onClose; sempre fechável por ESC + backdrop.
 */

interface DialogProps {
  open: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  description?: React.ReactNode;
  children?: React.ReactNode;
  footer?: React.ReactNode;
  size?: "sm" | "md" | "lg";
  closeOnBackdrop?: boolean;
  showClose?: boolean;
}

function Dialog({
  open, onClose, title, description, children, footer,
  size = "md", closeOnBackdrop = true, showClose = true,
}: DialogProps) {
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
    <div className="grd-dlg-backdrop" onClick={() => closeOnBackdrop && onClose()}>
      <div
        className={`grd-dlg grd-dlg-${size}`}
        role="dialog" aria-modal="true"
        onClick={(e) => e.stopPropagation()}
      >
        {(title || showClose) && (
          <div className="grd-dlg-head">
            <div className="grd-dlg-titlewrap">
              {title && <h2 className="grd-dlg-title">{title}</h2>}
              {description && <p className="grd-dlg-desc">{description}</p>}
            </div>
            {showClose && IconCmp && (
              <button className="grd-dlg-close" onClick={onClose} aria-label="Fechar">
                <IconCmp name="x" size={16} />
              </button>
            )}
          </div>
        )}
        {children && <div className="grd-dlg-body">{children}</div>}
        {footer && <div className="grd-dlg-foot">{footer}</div>}
      </div>
    </div>,
    document.body
  );
}
Dialog.displayName = "Dialog";
(window as any).Dialog = Dialog;
