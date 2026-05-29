
/**
 * Tree — árvore hierárquica com expand/collapse, seleção (single ou multi) e
 * ícones opcionais.
 *
 * Casos na Guardia:
 *   - Plano de contas (1 → 1.1 → 1.1.01)
 *   - Estrutura de empresas (holding → filial → unidade)
 *   - Categorias fiscais aninhadas
 *   - Regras do Copilot
 *
 * Seleção:
 *   - mode="single": um único nó selecionado
 *   - mode="multi" : vários nós; pais auto-calculam estado (all | partial | none)
 *   - mode="none"  : apenas navegação/expand
 *
 * API controlado E não-controlado: passe expanded/selected para controlar de
 * fora; omita para usar estado interno.
 */

interface TreeNode {
  id: string;
  label: React.ReactNode;
  description?: React.ReactNode;
  icon?: string;                   // ícone à esquerda (opcional)
  meta?: React.ReactNode;          // conteúdo à direita (badge, valor, ação)
  disabled?: boolean;
  children?: TreeNode[];
  defaultExpanded?: boolean;
}

type SelectionState = "none" | "partial" | "all";

interface TreeProps {
  nodes: TreeNode[];
  mode?: "none" | "single" | "multi";
  size?: "sm" | "md";
  /* Controlled */
  expanded?: string[];
  onExpandedChange?: (expanded: string[]) => void;
  selected?: string[];
  onSelectedChange?: (selected: string[]) => void;
  /* Uncontrolled defaults */
  defaultExpanded?: string[];
  defaultSelected?: string[];
  /* Features */
  showLines?: boolean;             // linhas guia verticais
  onNodeClick?: (node: TreeNode) => void;
  emptyState?: React.ReactNode;
  className?: string;
}

/* ------------------------------- utils ------------------------------- */

function collectIds(nodes: TreeNode[], acc: string[] = []): string[] {
  for (const n of nodes) {
    acc.push(n.id);
    if (n.children) collectIds(n.children, acc);
  }
  return acc;
}

function collectLeafIds(nodes: TreeNode[], acc: string[] = []): string[] {
  for (const n of nodes) {
    if (!n.children || n.children.length === 0) acc.push(n.id);
    else collectLeafIds(n.children, acc);
  }
  return acc;
}

function computeNodeSelection(
  node: TreeNode,
  selectedSet: Set<string>
): SelectionState {
  if (!node.children || node.children.length === 0) {
    return selectedSet.has(node.id) ? "all" : "none";
  }
  const states = node.children.map((c) => computeNodeSelection(c, selectedSet));
  const all = states.every((s) => s === "all");
  const none = states.every((s) => s === "none");
  if (all) return "all";
  if (none) return "none";
  return "partial";
}

function toggleBranch(
  node: TreeNode,
  selectedSet: Set<string>,
  target: boolean
) {
  // Aplica só a folhas (descendentes sem filhos) — pais são derivados
  const leaves = collectLeafIds([node]);
  leaves.forEach((id) => {
    if (target) selectedSet.add(id);
    else selectedSet.delete(id);
  });
}

/* ---------------------------- componente ---------------------------- */

function Tree({
  nodes,
  mode = "single",
  size = "md",
  expanded,
  onExpandedChange,
  selected,
  onSelectedChange,
  defaultExpanded,
  defaultSelected,
  showLines = true,
  onNodeClick,
  emptyState,
  className = "",
}: TreeProps) {
  const IconCmp = (window as any).Icon;

  /* Expansão: controlled ou uncontrolled */
  const [internalExpanded, setInternalExpanded] = React.useState<string[]>(
    () => {
      if (defaultExpanded) return defaultExpanded;
      // auto-expande nós marcados com defaultExpanded
      const auto: string[] = [];
      const walk = (arr: TreeNode[]) => {
        for (const n of arr) {
          if (n.defaultExpanded) auto.push(n.id);
          if (n.children) walk(n.children);
        }
      };
      walk(nodes);
      return auto;
    }
  );
  const expSet = React.useMemo(
    () => new Set(expanded ?? internalExpanded),
    [expanded, internalExpanded]
  );
  const toggleExpand = (id: string) => {
    const next = new Set(expSet);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    const arr = Array.from(next);
    if (expanded === undefined) setInternalExpanded(arr);
    onExpandedChange?.(arr);
  };

  /* Seleção: controlled ou uncontrolled */
  const [internalSelected, setInternalSelected] = React.useState<string[]>(
    defaultSelected ?? []
  );
  const selSet = React.useMemo(
    () => new Set(selected ?? internalSelected),
    [selected, internalSelected]
  );
  const commitSelection = (set: Set<string>) => {
    const arr = Array.from(set);
    if (selected === undefined) setInternalSelected(arr);
    onSelectedChange?.(arr);
  };

  const handleSelect = (node: TreeNode) => {
    if (node.disabled) return;
    if (mode === "none") return;
    if (mode === "single") {
      commitSelection(new Set([node.id]));
      return;
    }
    // multi
    const next = new Set(selSet);
    if (node.children && node.children.length > 0) {
      // toggle com base no estado atual do branch
      const state = computeNodeSelection(node, selSet);
      toggleBranch(node, next, state !== "all");
    } else {
      if (next.has(node.id)) next.delete(node.id);
      else next.add(node.id);
    }
    commitSelection(next);
  };

  const isEmpty = nodes.length === 0;
  if (isEmpty && emptyState) {
    return <div className={`grd-tr grd-tr-${size} grd-tr-empty ${className}`}>{emptyState}</div>;
  }

  const cls = [
    "grd-tr",
    `grd-tr-${size}`,
    `grd-tr-m-${mode}`,
    showLines ? "grd-tr-lines" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const iconSize = size === "sm" ? 13 : 14;

  const renderNode = (node: TreeNode, depth: number, isLast: boolean, ancestorsLast: boolean[]): React.ReactNode => {
    const hasChildren = !!node.children && node.children.length > 0;
    const isExpanded = expSet.has(node.id);
    const selectionState: SelectionState = mode === "multi" ? computeNodeSelection(node, selSet) : selSet.has(node.id) ? "all" : "none";
    const isSelected = mode === "single" ? selSet.has(node.id) : selectionState === "all";

    const rowCls = [
      "grd-tr-row",
      isSelected ? "grd-tr-row-sel" : "",
      node.disabled ? "grd-tr-row-disabled" : "",
    ]
      .filter(Boolean)
      .join(" ");

    return (
      <li key={node.id} className="grd-tr-li" role="treeitem" aria-expanded={hasChildren ? isExpanded : undefined} aria-selected={isSelected || undefined}>
        <div
          className={rowCls}
          style={{ paddingLeft: 8 + depth * (size === "sm" ? 16 : 18) }}
          onClick={(e) => {
            if (node.disabled) return;
            onNodeClick?.(node);
            if (mode !== "none") handleSelect(node);
          }}
        >
          {/* caret */}
          {hasChildren ? (
            <button
              type="button"
              className={`grd-tr-caret ${isExpanded ? "grd-tr-caret-open" : ""}`}
              onClick={(e) => { e.stopPropagation(); toggleExpand(node.id); }}
              aria-label={isExpanded ? "Colapsar" : "Expandir"}
            >
              {IconCmp ? <IconCmp name="chevron-right" size={iconSize - 1} /> : <span>›</span>}
            </button>
          ) : (
            <span className="grd-tr-caret grd-tr-caret-leaf" aria-hidden="true" />
          )}

          {/* checkbox (multi) */}
          {mode === "multi" && (
            <span
              className={[
                "grd-tr-cb",
                selectionState === "all" ? "grd-tr-cb-all" : "",
                selectionState === "partial" ? "grd-tr-cb-partial" : "",
              ].filter(Boolean).join(" ")}
              aria-hidden="true"
            >
              {selectionState === "all" && IconCmp && <IconCmp name="check" size={11} />}
              {selectionState === "partial" && <span className="grd-tr-cb-bar" />}
            </span>
          )}

          {/* ícone opcional */}
          {node.icon && IconCmp && (
            <span className="grd-tr-ico"><IconCmp name={node.icon} size={iconSize} /></span>
          )}

          <span className="grd-tr-label">
            <span className="grd-tr-label-main">{node.label}</span>
            {node.description && <span className="grd-tr-label-desc">{node.description}</span>}
          </span>

          {node.meta && <span className="grd-tr-meta">{node.meta}</span>}
        </div>

        {hasChildren && isExpanded && (
          <ul className="grd-tr-children" role="group">
            {node.children!.map((child, i) =>
              renderNode(
                child,
                depth + 1,
                i === node.children!.length - 1,
                [...ancestorsLast, isLast]
              )
            )}
          </ul>
        )}
      </li>
    );
  };

  return (
    <ul className={cls} role="tree">
      {nodes.map((n, i) => renderNode(n, 0, i === nodes.length - 1, []))}
    </ul>
  );
}
Tree.displayName = "Tree";
(window as any).Tree = Tree;
