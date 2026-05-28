
/**
 * DataTable — tabela de dados com ordenação e seleção opcional.
 *
 * Props:
 *   columns: { id, header, accessor(row)|key, width, align, sortable, render(v,row) }[]
 *   rows:    any[]
 *   rowKey?: (row) => string (default: row.id || index)
 *   selectable?: boolean   - checkbox por linha
 *   onRowClick?: (row) => void
 *   emptyText?: string
 *   density?: "compact" | "normal" | "comfortable"
 *   stickyHeader?: boolean
 *   sort?: { id: string; dir: "asc" | "desc" } | null   (controlado)
 *   defaultSort?: same shape (não controlado)
 *   onSortChange?: (sort) => void
 */

interface DTColumn<T = any> {
  id: string;
  header: React.ReactNode;
  accessor?: keyof T | ((row: T) => any);
  width?: number | string;
  align?: "left" | "right" | "center";
  sortable?: boolean;
  render?: (value: any, row: T) => React.ReactNode;
  className?: string;
}
interface DataTableProps<T = any> {
  columns: DTColumn<T>[];
  rows: T[];
  rowKey?: (row: T, index: number) => string | number;
  selectable?: boolean;
  selected?: Set<string | number>;
  onSelectedChange?: (s: Set<string | number>) => void;
  onRowClick?: (row: T) => void;
  emptyText?: React.ReactNode;
  emptyIcon?: string;
  density?: "compact" | "normal" | "comfortable";
  stickyHeader?: boolean;
  sort?: { id: string; dir: "asc" | "desc" } | null;
  defaultSort?: { id: string; dir: "asc" | "desc" };
  onSortChange?: (s: { id: string; dir: "asc" | "desc" } | null) => void;
  className?: string;
}

function getVal(row: any, col: DTColumn) {
  if (typeof col.accessor === "function") return col.accessor(row);
  if (typeof col.accessor === "string") return row[col.accessor];
  return row[col.id];
}

function DataTable<T extends Record<string, any> = any>({
  columns, rows, rowKey, selectable, selected, onSelectedChange,
  onRowClick, emptyText = "Sem dados", emptyIcon = "inbox",
  density = "normal", stickyHeader = false,
  sort, defaultSort, onSortChange, className = "",
}: DataTableProps<T>) {
  const IconCmp = (window as any).Icon;
  const CheckboxCmp = (window as any).Checkbox;
  const EmptyStateCmp = (window as any).EmptyState;

  const [internalSort, setInternalSort] = React.useState<{ id: string; dir: "asc" | "desc" } | null>(defaultSort ?? null);
  const current = sort !== undefined ? sort : internalSort;

  const [internalSel, setInternalSel] = React.useState<Set<string | number>>(new Set());
  const sel = selected !== undefined ? selected : internalSel;
  const setSel = (next: Set<string | number>) => {
    if (selected === undefined) setInternalSel(next);
    onSelectedChange?.(next);
  };
  const rk = rowKey ?? ((r: any, i: number) => (r.id ?? r.key ?? i));

  const sortedRows = React.useMemo(() => {
    if (!current) return rows;
    const col = columns.find(c => c.id === current.id);
    if (!col) return rows;
    const arr = [...rows];
    arr.sort((a, b) => {
      const va = getVal(a, col);
      const vb = getVal(b, col);
      if (va == null && vb == null) return 0;
      if (va == null) return 1;
      if (vb == null) return -1;
      if (typeof va === "number" && typeof vb === "number") return current.dir === "asc" ? va - vb : vb - va;
      const sa = String(va).toLocaleLowerCase("pt-BR");
      const sb = String(vb).toLocaleLowerCase("pt-BR");
      const cmp = sa.localeCompare(sb, "pt-BR");
      return current.dir === "asc" ? cmp : -cmp;
    });
    return arr;
  }, [rows, columns, current]);

  function toggleSort(col: DTColumn) {
    if (!col.sortable) return;
    let next: { id: string; dir: "asc" | "desc" } | null;
    if (!current || current.id !== col.id) next = { id: col.id, dir: "asc" };
    else if (current.dir === "asc") next = { id: col.id, dir: "desc" };
    else next = null;
    if (sort === undefined) setInternalSort(next);
    onSortChange?.(next);
  }

  const allSel = rows.length > 0 && rows.every((r, i) => sel.has(rk(r, i)));
  const someSel = rows.some((r, i) => sel.has(rk(r, i))) && !allSel;

  function toggleAll() {
    if (allSel) setSel(new Set());
    else setSel(new Set(rows.map((r, i) => rk(r, i))));
  }
  function toggleOne(k: string | number) {
    const next = new Set(sel);
    if (next.has(k)) next.delete(k); else next.add(k);
    setSel(next);
  }

  const cls = [
    "grd-dt",
    `grd-dt-${density}`,
    stickyHeader && "grd-dt-sticky",
    onRowClick && "grd-dt-clickable",
    className,
  ].filter(Boolean).join(" ");

  return (
    <div className={cls}>
      <table>
        <thead>
          <tr>
            {selectable && (
              <th className="grd-dt-sel">
                {CheckboxCmp && <CheckboxCmp checked={allSel} indeterminate={someSel} onChange={toggleAll} size="sm" />}
              </th>
            )}
            {columns.map(col => {
              const isCur = current?.id === col.id;
              const cls = ["grd-dt-th", col.sortable && "grd-dt-th-sort", col.align && `grd-dt-a-${col.align}`].filter(Boolean).join(" ");
              return (
                <th
                  key={col.id}
                  className={cls}
                  style={{ width: col.width }}
                  onClick={() => toggleSort(col)}
                >
                  <span className="grd-dt-th-lbl">
                    {col.header}
                    {col.sortable && IconCmp && (
                      <span className={`grd-dt-sort-ic ${isCur ? "grd-dt-sort-cur" : ""}`}>
                        <IconCmp
                          name={isCur && current!.dir === "desc" ? "arrow-down" : isCur ? "arrow-up" : "chevrons-up-down"}
                          size={12}
                        />
                      </span>
                    )}
                  </span>
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {sortedRows.length === 0 ? (
            <tr>
              <td colSpan={columns.length + (selectable ? 1 : 0)}>
                {EmptyStateCmp
                  ? <EmptyStateCmp icon={emptyIcon} title={emptyText} size="sm" />
                  : <div className="grd-dt-empty">{emptyText}</div>}
              </td>
            </tr>
          ) : sortedRows.map((row, i) => {
            const k = rk(row, i);
            const isSel = sel.has(k);
            return (
              <tr
                key={k}
                className={isSel ? "grd-dt-row-sel" : ""}
                onClick={() => onRowClick?.(row)}
              >
                {selectable && (
                  <td className="grd-dt-sel" onClick={(e) => e.stopPropagation()}>
                    {CheckboxCmp && <CheckboxCmp checked={isSel} onChange={() => toggleOne(k)} size="sm" />}
                  </td>
                )}
                {columns.map(col => {
                  const v = getVal(row, col);
                  const cellCls = ["grd-dt-td", col.align && `grd-dt-a-${col.align}`, col.className].filter(Boolean).join(" ");
                  return (
                    <td key={col.id} className={cellCls}>
                      {col.render ? col.render(v, row) : v as any}
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
DataTable.displayName = "DataTable";
(window as any).DataTable = DataTable;
