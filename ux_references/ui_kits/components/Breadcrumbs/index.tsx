
/**
 * Breadcrumbs — trilha de navegação hierárquica.
 * items: { label, href?, icon? }[]. Último item = atual, sem link.
 */

interface BCItem { label: React.ReactNode; href?: string; icon?: string; onClick?: () => void }
interface BreadcrumbsProps {
  items: BCItem[];
  separator?: React.ReactNode;
  maxItems?: number;
  className?: string;
}

function Breadcrumbs({ items, separator, maxItems, className = "" }: BreadcrumbsProps) {
  const IconCmp = (window as any).Icon;
  let show = items;
  if (maxItems && items.length > maxItems) {
    show = [items[0], { label: "…" } as BCItem, ...items.slice(items.length - (maxItems - 2))];
  }
  const sep = separator ?? (IconCmp ? <IconCmp name="chevron-right" size={13} /> : "/");
  return (
    <nav aria-label="breadcrumb" className={`grd-bc ${className}`}>
      <ol>
        {show.map((it, i) => {
          const isLast = i === show.length - 1;
          return (
            <li key={i} className="grd-bc-item">
              {!isLast && (it.href || it.onClick) ? (
                <a
                  className="grd-bc-link"
                  href={it.href}
                  onClick={(e) => { if (it.onClick) { e.preventDefault(); it.onClick(); } }}
                >
                  {it.icon && IconCmp && <IconCmp name={it.icon} size={13} />}
                  <span>{it.label}</span>
                </a>
              ) : (
                <span className={isLast ? "grd-bc-current" : "grd-bc-static"}>
                  {it.icon && IconCmp && <IconCmp name={it.icon} size={13} />}
                  <span>{it.label}</span>
                </span>
              )}
              {!isLast && <span className="grd-bc-sep" aria-hidden>{sep}</span>}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
Breadcrumbs.displayName = "Breadcrumbs";
(window as any).Breadcrumbs = Breadcrumbs;
