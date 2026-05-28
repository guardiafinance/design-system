
/**
 * Toast — notificações transitórias. Empilhadas em um canto.
 * Uso:
 *   <ToastProvider>...app...</ToastProvider>
 *   const toast = useToast();
 *   toast.show({ type: "success", title: "Salvo" });
 * Tipos: info, success, warning, danger.
 */

interface ToastOptions {
  id?: string;
  type?: "info" | "success" | "warning" | "danger";
  title: React.ReactNode;
  description?: React.ReactNode;
  duration?: number; // ms; 0 = persistente
  action?: { label: string; onClick: () => void };
}

interface ToastInternal extends ToastOptions {
  id: string;
  type: "info" | "success" | "warning" | "danger";
}

const ToastCtx = React.createContext<{ show: (o: ToastOptions) => string; dismiss: (id: string) => void } | null>(null);

function ToastProvider({ children, position = "bottom-right" }: { children: React.ReactNode; position?: "top-right" | "bottom-right" | "top-left" | "bottom-left" }) {
  const [items, setItems] = React.useState<ToastInternal[]>([]);

  const dismiss = React.useCallback((id: string) => {
    setItems(xs => xs.filter(x => x.id !== id));
  }, []);

  const show = React.useCallback((o: ToastOptions) => {
    const id = o.id ?? Math.random().toString(36).slice(2);
    const duration = o.duration === undefined ? 4200 : o.duration;
    setItems(xs => [...xs, { ...o, id, type: o.type ?? "info" }]);
    if (duration > 0) setTimeout(() => dismiss(id), duration);
    return id;
  }, [dismiss]);

  const value = React.useMemo(() => ({ show, dismiss }), [show, dismiss]);

  const IconCmp = (window as any).Icon;
  const ALERT_IC: Record<string, string> = { info: "info", success: "circle-check", warning: "triangle-alert", danger: "circle-x" };

  return (
    <ToastCtx.Provider value={value}>
      {children}
      {ReactDOM.createPortal(
        <div className={`grd-tst-region grd-tst-${position}`}>
          {items.map(t => (
            <div key={t.id} className={`grd-tst grd-tst-type-${t.type}`} role="status">
              {IconCmp && <span className="grd-tst-ic"><IconCmp name={ALERT_IC[t.type]} size={18} /></span>}
              <div className="grd-tst-body">
                <div className="grd-tst-title">{t.title}</div>
                {t.description && <div className="grd-tst-desc">{t.description}</div>}
              </div>
              {t.action && (
                <button className="grd-tst-action" onClick={() => { t.action!.onClick(); dismiss(t.id); }}>
                  {t.action.label}
                </button>
              )}
              <button className="grd-tst-close" onClick={() => dismiss(t.id)} aria-label="Fechar">
                {IconCmp && <IconCmp name="x" size={14} />}
              </button>
            </div>
          ))}
        </div>,
        document.body
      )}
    </ToastCtx.Provider>
  );
}

function useToast() {
  const ctx = React.useContext(ToastCtx);
  if (!ctx) throw new Error("useToast must be used within <ToastProvider>");
  return ctx;
}

(window as any).ToastProvider = ToastProvider;
(window as any).useToast = useToast;
