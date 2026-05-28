
/**
 * SidebarNav — navegação lateral vertical com seções e itens.
 * Aninhamento via children (1 nível). Suporta ícone, badge, ativo.
 * Pode ser collapsed (só ícones).
 *
 * Structure:
 *   <SidebarNav collapsed={bool}>
 *     <SidebarNav.Section label="Geral">
 *       <SidebarNav.Item icon="home" active>Início</SidebarNav.Item>
 *       <SidebarNav.Item icon="file-text" badge="4">Documentos</SidebarNav.Item>
 *     </SidebarNav.Section>
 *     <SidebarNav.Group icon="folder" label="Clientes">
 *       <SidebarNav.Item>Todos</SidebarNav.Item>
 *       <SidebarNav.Item>Favoritos</SidebarNav.Item>
 *     </SidebarNav.Group>
 *   </SidebarNav>
 */

interface SidebarNavCtx { collapsed: boolean; }
const SidebarCtx = React.createContext<SidebarNavCtx>({ collapsed: false });

function SidebarNav({ collapsed = false, children, className = "" }: { collapsed?: boolean; children: React.ReactNode; className?: string }) {
  return (
    <SidebarCtx.Provider value={{ collapsed }}>
      <nav className={`grd-sb ${collapsed ? "grd-sb-col" : ""} ${className}`}>{children}</nav>
    </SidebarCtx.Provider>
  );
}
function SBSection({ label, children }: { label?: React.ReactNode; children: React.ReactNode }) {
  const { collapsed } = React.useContext(SidebarCtx);
  return (
    <div className="grd-sb-section">
      {label && !collapsed && <div className="grd-sb-sect-label">{label}</div>}
      {collapsed && label && <div className="grd-sb-sect-divider" />}
      <div className="grd-sb-sect-items">{children}</div>
    </div>
  );
}
function SBItem({
  icon, badge, active, onClick, href, children,
}: { icon?: string; badge?: React.ReactNode; active?: boolean; onClick?: () => void; href?: string; children: React.ReactNode }) {
  const { collapsed } = React.useContext(SidebarCtx);
  const IconCmp = (window as any).Icon;
  const cls = ["grd-sb-item", active && "grd-sb-item-active"].filter(Boolean).join(" ");
  const inner = (<>
    {icon && IconCmp && <span className="grd-sb-item-ic"><IconCmp name={icon} size={16} /></span>}
    {!collapsed && <span className="grd-sb-item-lab">{children}</span>}
    {!collapsed && badge && <span className="grd-sb-item-badge">{badge}</span>}
  </>);
  if (href) return <a href={href} className={cls} onClick={onClick} title={collapsed && typeof children === "string" ? children : undefined}>{inner}</a>;
  return <button type="button" className={cls} onClick={onClick} title={collapsed && typeof children === "string" ? children : undefined}>{inner}</button>;
}
function SBGroup({ icon, label, defaultOpen = true, children }: { icon?: string; label: React.ReactNode; defaultOpen?: boolean; children: React.ReactNode }) {
  const { collapsed } = React.useContext(SidebarCtx);
  const [open, setOpen] = React.useState(defaultOpen);
  const IconCmp = (window as any).Icon;
  if (collapsed) return <>{children}</>;
  return (
    <div className={`grd-sb-group ${open ? "grd-sb-group-open" : ""}`}>
      <button type="button" className="grd-sb-item grd-sb-group-trigger" onClick={() => setOpen(o => !o)} aria-expanded={open}>
        {icon && IconCmp && <span className="grd-sb-item-ic"><IconCmp name={icon} size={16} /></span>}
        <span className="grd-sb-item-lab">{label}</span>
        {IconCmp && <span className="grd-sb-group-chev"><IconCmp name="chevron-down" size={13} /></span>}
      </button>
      {open && <div className="grd-sb-group-items">{children}</div>}
    </div>
  );
}
(SidebarNav as any).Section = SBSection;
(SidebarNav as any).Item = SBItem;
(SidebarNav as any).Group = SBGroup;
SidebarNav.displayName = "SidebarNav";
(window as any).SidebarNav = SidebarNav;
