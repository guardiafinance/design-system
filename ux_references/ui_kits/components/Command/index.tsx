
/**
 * Command — paleta de comandos (Cmd+K).
 * Props: open, onClose, items (grupos), placeholder.
 * Items: [{ group, entries: [{ id, label, shortcut?, icon?, keywords?, action? }] }]
 */

interface CmdEntry {
  id: string;
  label: React.ReactNode;
  description?: React.ReactNode;
  icon?: string;
  shortcut?: string;
  keywords?: string;
  action?: () => void;
}
interface CmdGroup {
  group: React.ReactNode;
  entries: CmdEntry[];
}
interface CommandProps {
  open: boolean;
  onClose: () => void;
  items: CmdGroup[];
  placeholder?: string;
  emptyText?: string;
}

function Command({ open, onClose, items, placeholder = "Buscar comando…", emptyText = "Nenhum resultado" }: CommandProps) {
  const IconCmp = (window as any).Icon;
  const [query, setQuery] = React.useState("");
  const [activeIdx, setActiveIdx] = React.useState(0);
  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (!open) return;
    setQuery(""); setActiveIdx(0);
    function onKey(e: KeyboardEvent) { if (e.key === "Escape") onClose(); }
    document.addEventListener("keydown", onKey);
    const t = setTimeout(() => inputRef.current?.focus(), 60);
    return () => { document.removeEventListener("keydown", onKey); clearTimeout(t); };
  }, [open, onClose]);

  const filtered: { group: React.ReactNode; entries: CmdEntry[] }[] = React.useMemo(() => {
    if (!query) return items;
    const q = query.toLowerCase();
    return items
      .map(g => ({
        group: g.group,
        entries: g.entries.filter(e => {
          const hay = [
            typeof e.label === "string" ? e.label : "",
            e.keywords ?? "",
            typeof e.description === "string" ? e.description : "",
          ].join(" ").toLowerCase();
          return hay.includes(q);
        }),
      }))
      .filter(g => g.entries.length > 0);
  }, [query, items]);

  const flat: CmdEntry[] = React.useMemo(() => filtered.flatMap(g => g.entries), [filtered]);
  React.useEffect(() => { setActiveIdx(0); }, [query]);

  function handleKey(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") { e.preventDefault(); setActiveIdx(i => Math.min(i + 1, flat.length - 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setActiveIdx(i => Math.max(i - 1, 0)); }
    else if (e.key === "Enter") {
      e.preventDefault();
      const entry = flat[activeIdx];
      if (entry?.action) { entry.action(); onClose(); }
    }
  }

  if (!open) return null;
  return ReactDOM.createPortal(
    <div className="grd-cmd-backdrop" onClick={onClose}>
      <div className="grd-cmd" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
        <div className="grd-cmd-search">
          {IconCmp && <IconCmp name="search" size={16} />}
          <input
            ref={inputRef}
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={handleKey}
            placeholder={placeholder}
          />
          <kbd className="grd-cmd-esc">ESC</kbd>
        </div>
        <div className="grd-cmd-list">
          {filtered.length === 0 && <div className="grd-cmd-empty">{emptyText}</div>}
          {filtered.map((g, gi) => {
            const baseIdx = filtered.slice(0, gi).reduce((a, b) => a + b.entries.length, 0);
            return (
              <div key={gi} className="grd-cmd-group">
                <div className="grd-cmd-group-lbl">{g.group}</div>
                {g.entries.map((e, ei) => {
                  const idx = baseIdx + ei;
                  const active = idx === activeIdx;
                  return (
                    <button
                      key={e.id}
                      type="button"
                      className={`grd-cmd-entry ${active ? "grd-cmd-entry-active" : ""}`}
                      onMouseEnter={() => setActiveIdx(idx)}
                      onClick={() => { e.action?.(); onClose(); }}
                    >
                      {e.icon && IconCmp && <span className="grd-cmd-entry-ic"><IconCmp name={e.icon} size={15} /></span>}
                      <span className="grd-cmd-entry-text">
                        <span className="grd-cmd-entry-lbl">{e.label}</span>
                        {e.description && <span className="grd-cmd-entry-desc">{e.description}</span>}
                      </span>
                      {e.shortcut && <kbd className="grd-cmd-kbd">{e.shortcut}</kbd>}
                    </button>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    </div>,
    document.body
  );
}
Command.displayName = "Command";
(window as any).Command = Command;
