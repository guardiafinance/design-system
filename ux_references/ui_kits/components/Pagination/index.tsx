
/**
 * Pagination — paginação numérica com prev/next.
 * Props: page (1-based), pageCount, onChange, siblingCount.
 */

interface PaginationProps {
  page: number;
  pageCount: number;
  onChange?: (p: number) => void;
  siblingCount?: number;
  size?: "sm" | "md";
  showEdges?: boolean;
  className?: string;
}

function Pagination({ page, pageCount, onChange, siblingCount = 1, size = "md", showEdges = false, className = "" }: PaginationProps) {
  const IconCmp = (window as any).Icon;
  if (pageCount <= 0) return null;

  const range: (number | "…")[] = [];
  const first = 1, last = pageCount;
  const lo = Math.max(first + 1, page - siblingCount);
  const hi = Math.min(last - 1, page + siblingCount);
  range.push(first);
  if (lo > first + 1) range.push("…");
  for (let i = lo; i <= hi; i++) range.push(i);
  if (hi < last - 1) range.push("…");
  if (last > first) range.push(last);

  const cls = ["grd-pag", `grd-pag-${size}`, className].filter(Boolean).join(" ");
  const go = (p: number) => {
    if (p < 1 || p > pageCount || p === page) return;
    onChange?.(p);
  };

  return (
    <nav className={cls} role="navigation" aria-label="Paginação">
      {showEdges && IconCmp && (
        <button className="grd-pag-btn" onClick={() => go(1)} disabled={page === 1} aria-label="Primeira">
          <IconCmp name="chevrons-left" size={14} />
        </button>
      )}
      <button className="grd-pag-btn" onClick={() => go(page - 1)} disabled={page === 1} aria-label="Anterior">
        {IconCmp && <IconCmp name="chevron-left" size={14} />}
      </button>
      {range.map((n, i) =>
        n === "…"
          ? <span key={`e${i}`} className="grd-pag-ellipsis">…</span>
          : (
            <button
              key={n}
              className={`grd-pag-btn grd-pag-num ${n === page ? "grd-pag-btn-active" : ""}`}
              onClick={() => go(n)}
              aria-current={n === page ? "page" : undefined}
            >
              {n}
            </button>
          )
      )}
      <button className="grd-pag-btn" onClick={() => go(page + 1)} disabled={page === pageCount} aria-label="Próxima">
        {IconCmp && <IconCmp name="chevron-right" size={14} />}
      </button>
      {showEdges && IconCmp && (
        <button className="grd-pag-btn" onClick={() => go(pageCount)} disabled={page === pageCount} aria-label="Última">
          <IconCmp name="chevrons-right" size={14} />
        </button>
      )}
    </nav>
  );
}
Pagination.displayName = "Pagination";
(window as any).Pagination = Pagination;
