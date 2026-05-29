
/**
 * Kanban — board com colunas, cards arrastáveis, swimlanes e colunas colapsáveis.
 *
 * Uso típico na Guardia: tarefas da equipe contábil, pipeline de revisão,
 * gestão de pendências com clientes.
 *
 * Arquitetura:
 *   columns[]:   estrutura fixa das colunas (id, title, color, onAdd?…)
 *   cards[]:     lista plana de cards (cada card tem columnId e opcionalmente laneId)
 *   swimlanes?:  agrupamentos horizontais (se omitido, tudo vai pra lane "default")
 *
 * Drag and drop:
 *   onCardMove(cardId, toColumnId, toLaneId, toIndex)
 *   — reordenar dentro da coluna (mesma columnId, toIndex diferente)
 *   — mover entre colunas (columnId diferente)
 *
 * Render customizado:
 *   renderCard(card) ⇒ ReactNode  substitui o card padrão por completo
 */

interface KanbanTag {
  label: string;
  tone?: "violet" | "green" | "amber" | "red" | "blue" | "neutral";
}

interface KanbanCardData {
  id: string;
  columnId: string;
  laneId?: string;
  title: React.ReactNode;
  description?: React.ReactNode;
  /* Meta */
  displayId?: string;                // ex: "TSK-248"
  priority?: "low" | "med" | "high";
  tags?: KanbanTag[];
  assignee?: { name: string; avatar?: string };
  dueDate?: string;
  dueStatus?: "ok" | "warn" | "danger";    // colore a data
  value?: React.ReactNode;           // valor monetário ou numérico à direita
  confidence?: number;               // 0..1 — indicador do agente
  progress?: number;                 // 0..1 — barra fina no rodapé
  commentsCount?: number;
  attachmentsCount?: number;
  raw?: any;                         // payload livre pra passar ao renderCard
}

interface KanbanColumn {
  id: string;
  title: string;
  color?: string;                    // dot no header; aceita qualquer CSS color ou var(--...)
  onAdd?: () => void;
  emptyState?: React.ReactNode;
  showTotals?: boolean;              // mostra contagem + soma de "value" no header
  sumValue?: (card: KanbanCardData) => number; // como extrair valor numérico do card
  sumFormat?: (sum: number) => string;         // como formatar a soma total
}

interface KanbanSwimlane {
  id: string;
  title: string;
  defaultCollapsed?: boolean;
}

interface KanbanProps {
  title?: string;
  columns: KanbanColumn[];
  cards: KanbanCardData[];
  swimlanes?: KanbanSwimlane[];
  searchable?: boolean;
  onCardMove?: (cardId: string, toColumnId: string, toLaneId: string | undefined, toIndex: number) => void;
  onCardClick?: (card: KanbanCardData) => void;
  renderCard?: (card: KanbanCardData, ctx: { dragging: boolean }) => React.ReactNode;
  /* Colunas colapsáveis */
  defaultCollapsedColumns?: string[];
  className?: string;
}

/* --------------------------------------------------------- */
/* Helpers                                                    */
/* --------------------------------------------------------- */

function cardMatches(card: KanbanCardData, q: string): boolean {
  if (!q) return true;
  const lc = q.toLowerCase();
  const haystack = [
    String(card.title ?? ""),
    String(card.description ?? ""),
    card.displayId ?? "",
    card.assignee?.name ?? "",
    ...(card.tags ?? []).map((t) => t.label),
  ]
    .join(" ")
    .toLowerCase();
  return haystack.includes(lc);
}

function confidenceBucket(c: number): "high" | "mid" | "low" {
  if (c >= 0.95) return "high";
  if (c >= 0.75) return "mid";
  return "low";
}

/* --------------------------------------------------------- */
/* Default card renderer                                      */
/* --------------------------------------------------------- */

function DefaultCard({ card }: { card: KanbanCardData }) {
  const IconCmp = (window as any).Icon;
  const AvatarCmp = (window as any).Avatar;
  const BadgeCmp = (window as any).Badge;

  const hasTopBar =
    card.displayId || card.priority;
  const hasMeta =
    card.assignee || card.dueDate || card.value || card.confidence !== undefined ||
    card.commentsCount || card.attachmentsCount;

  return (
    <>
      {hasTopBar && (
        <div className="grd-kb-card-topbar">
          {card.priority && (
            <span
              className={`grd-kb-card-prio grd-kb-card-prio-${card.priority}`}
              aria-label={`prioridade ${card.priority}`}
            />
          )}
          {card.displayId && <span className="grd-kb-card-id">{card.displayId}</span>}
          {card.confidence !== undefined && (
            <span className={`grd-kb-card-conf grd-kb-card-conf-${confidenceBucket(card.confidence)}`} style={{ marginLeft: "auto" }}>
              <span className="grd-kb-card-conf-dot" />
              {Math.round(card.confidence * 100)}%
            </span>
          )}
        </div>
      )}

      <div className="grd-kb-card-title">{card.title}</div>
      {card.description && <div className="grd-kb-card-desc">{card.description}</div>}

      {card.tags && card.tags.length > 0 && (
        <div className="grd-kb-card-tags">
          {card.tags.map((t, i) =>
            BadgeCmp
              ? <BadgeCmp key={i} variant="soft" tone={t.tone ?? "neutral"} size="xs">{t.label}</BadgeCmp>
              : <span key={i} style={{ fontSize: 10.5, color: "var(--fg-muted)" }}>{t.label}</span>
          )}
        </div>
      )}

      {typeof card.progress === "number" && (
        <div className="grd-kb-card-progress">
          <div className="grd-kb-card-progress-fill" style={{ width: `${Math.min(100, Math.max(0, card.progress * 100))}%` }} />
        </div>
      )}

      {hasMeta && (
        <div className="grd-kb-card-meta">
          <div className="grd-kb-card-meta-l">
            {card.assignee && AvatarCmp && (
              <AvatarCmp name={card.assignee.name} src={card.assignee.avatar} size="xs" />
            )}
            {card.dueDate && (
              <span className={`grd-kb-card-meta-item ${card.dueStatus === "danger" ? "is-danger" : card.dueStatus === "warn" ? "is-warn" : ""}`}>
                {IconCmp && <IconCmp name="calendar" size={11} />}
                {card.dueDate}
              </span>
            )}
            {typeof card.commentsCount === "number" && card.commentsCount > 0 && (
              <span className="grd-kb-card-meta-item">
                {IconCmp && <IconCmp name="message-circle" size={11} />}
                {card.commentsCount}
              </span>
            )}
            {typeof card.attachmentsCount === "number" && card.attachmentsCount > 0 && (
              <span className="grd-kb-card-meta-item">
                {IconCmp && <IconCmp name="paperclip" size={11} />}
                {card.attachmentsCount}
              </span>
            )}
          </div>
          <div className="grd-kb-card-meta-r">
            {card.value !== undefined && <span className="grd-kb-card-value">{card.value}</span>}
          </div>
        </div>
      )}
    </>
  );
}

/* --------------------------------------------------------- */
/* Kanban principal                                           */
/* --------------------------------------------------------- */

function Kanban({
  title,
  columns,
  cards,
  swimlanes,
  searchable = false,
  onCardMove,
  onCardClick,
  renderCard,
  defaultCollapsedColumns,
  className = "",
}: KanbanProps) {
  const IconCmp = (window as any).Icon;
  const InputCmp = (window as any).Input;

  const [q, setQ] = React.useState("");
  const [collapsed, setCollapsed] = React.useState<Set<string>>(() => new Set(defaultCollapsedColumns ?? []));
  const [collapsedLanes, setCollapsedLanes] = React.useState<Set<string>>(() => {
    const s = new Set<string>();
    swimlanes?.forEach((l) => l.defaultCollapsed && s.add(l.id));
    return s;
  });

  /* ---- DnD state ---- */
  const [draggingId, setDraggingId] = React.useState<string | null>(null);
  const [dropTarget, setDropTarget] = React.useState<{ columnId: string; laneId: string | undefined; index: number } | null>(null);

  const toggleCol = (id: string) => {
    const next = new Set(collapsed);
    if (next.has(id)) next.delete(id); else next.add(id);
    setCollapsed(next);
  };
  const toggleLane = (id: string) => {
    const next = new Set(collapsedLanes);
    if (next.has(id)) next.delete(id); else next.add(id);
    setCollapsedLanes(next);
  };

  /* Filtro + agrupamento */
  const visibleCards = React.useMemo(
    () => cards.filter((c) => cardMatches(c, q)),
    [cards, q]
  );
  const totalCount = visibleCards.length;

  const lanes: KanbanSwimlane[] = swimlanes && swimlanes.length > 0
    ? swimlanes
    : [{ id: "__default", title: "" }];

  const cardsByLaneColumn = React.useMemo(() => {
    const map: Record<string, Record<string, KanbanCardData[]>> = {};
    for (const lane of lanes) map[lane.id] = Object.fromEntries(columns.map((c) => [c.id, []]));
    for (const card of visibleCards) {
      const laneId = card.laneId && map[card.laneId] ? card.laneId : lanes[0].id;
      const colMap = map[laneId] ?? map[lanes[0].id];
      if (colMap[card.columnId]) colMap[card.columnId].push(card);
    }
    return map;
  }, [visibleCards, columns, lanes]);

  /* ---- Handlers DnD ---- */
  const handleDragStart = (e: React.DragEvent, cardId: string) => {
    setDraggingId(cardId);
    e.dataTransfer.effectAllowed = "move";
    try { e.dataTransfer.setData("text/plain", cardId); } catch { /* noop */ }
  };
  const handleDragEnd = () => {
    setDraggingId(null);
    setDropTarget(null);
  };
  const handleDrop = (columnId: string, laneId: string | undefined, index: number) => (e: React.DragEvent) => {
    e.preventDefault();
    if (!draggingId) return;
    onCardMove?.(draggingId, columnId, laneId === "__default" ? undefined : laneId, index);
    setDraggingId(null);
    setDropTarget(null);
  };

  /* ---- Render ---- */
  return (
    <div className={`grd-kb ${className}`}>
      {(title || searchable) && (
        <div className="grd-kb-hdr">
          {title && <h3 className="grd-kb-hdr-title">{title}</h3>}
          {typeof totalCount === "number" && <span className="grd-kb-hdr-count">· {totalCount} cards</span>}
          <div className="grd-kb-hdr-actions">
            {searchable && InputCmp && (
              <div className="grd-kb-hdr-search">
                <InputCmp size="sm" leftIcon="search" placeholder="Buscar por título, tag, responsável…" value={q} onChange={(e: any) => setQ(e.target.value)} />
              </div>
            )}
          </div>
        </div>
      )}

      <div className="grd-kb-board">
        {lanes.map((lane) => {
          const laneIsCollapsed = collapsedLanes.has(lane.id);
          const laneCardCount = columns.reduce(
            (sum, col) => sum + (cardsByLaneColumn[lane.id]?.[col.id]?.length ?? 0), 0
          );
          const showLaneHdr = lane.id !== "__default";

          return (
            <div key={lane.id} className="grd-kb-lane">
              {showLaneHdr && (
                <div className="grd-kb-lane-hdr" onClick={() => toggleLane(lane.id)}>
                  <span className={`grd-kb-lane-caret ${!laneIsCollapsed ? "grd-kb-lane-caret-open" : ""}`}>
                    {IconCmp ? <IconCmp name="chevron-right" size={13} /> : "›"}
                  </span>
                  <span className="grd-kb-lane-title">{lane.title}</span>
                  <span className="grd-kb-lane-count">{laneCardCount}</span>
                </div>
              )}
              {!laneIsCollapsed && (
                <div className="grd-kb-lane-body">
                  {columns.map((col) => {
                    const list = cardsByLaneColumn[lane.id]?.[col.id] ?? [];
                    const isColCollapsed = collapsed.has(col.id);
                    const isOver = dropTarget?.columnId === col.id && dropTarget?.laneId === lane.id;
                    const sumTotal = col.showTotals && col.sumValue
                      ? list.reduce((acc, c) => acc + col.sumValue!(c), 0)
                      : null;
                    return (
                      <div
                        key={col.id}
                        className={`grd-kb-col ${isColCollapsed ? "grd-kb-col-collapsed" : ""} ${isOver ? "grd-kb-col-over" : ""}`}
                        onDragOver={(e) => {
                          if (!draggingId || isColCollapsed) return;
                          e.preventDefault();
                          e.dataTransfer.dropEffect = "move";
                          if (!dropTarget || dropTarget.columnId !== col.id || dropTarget.laneId !== lane.id) {
                            setDropTarget({ columnId: col.id, laneId: lane.id, index: list.length });
                          }
                        }}
                        onDrop={handleDrop(col.id, lane.id, list.length)}
                      >
                        <div className="grd-kb-col-hdr" onClick={() => toggleCol(col.id)}>
                          <span className="grd-kb-col-hdr-chip" style={col.color ? { background: col.color } : undefined} />
                          <span className="grd-kb-col-title">{col.title}</span>
                          {!isColCollapsed && <span className="grd-kb-col-count">{list.length}</span>}
                          {!isColCollapsed && (
                            <div className="grd-kb-col-actions">
                              <button
                                type="button"
                                className="grd-kb-col-act"
                                aria-label="Colapsar coluna"
                                onClick={(e) => { e.stopPropagation(); toggleCol(col.id); }}
                              >
                                {IconCmp ? <IconCmp name="minimize-2" size={13} /> : "–"}
                              </button>
                            </div>
                          )}
                        </div>

                        {!isColCollapsed && col.showTotals && sumTotal !== null && (
                          <div className="grd-kb-col-totals">
                            <span>Total</span>
                            <strong>{col.sumFormat ? col.sumFormat(sumTotal) : sumTotal}</strong>
                          </div>
                        )}

                        {!isColCollapsed && (
                          <div className="grd-kb-col-body">
                            {list.length === 0 ? (
                              <div className="grd-kb-col-empty">
                                {col.emptyState ?? "Sem cards por aqui"}
                              </div>
                            ) : (
                              list.map((card, idx) => {
                                const isDrop =
                                  dropTarget?.columnId === col.id &&
                                  dropTarget?.laneId === lane.id &&
                                  dropTarget?.index === idx;
                                return (
                                  <React.Fragment key={card.id}>
                                    <div
                                      className={`grd-kb-card-drop ${isDrop ? "is-active" : ""}`}
                                      onDragOver={(e) => {
                                        if (!draggingId) return;
                                        e.preventDefault();
                                        e.stopPropagation();
                                        setDropTarget({ columnId: col.id, laneId: lane.id, index: idx });
                                      }}
                                      onDrop={handleDrop(col.id, lane.id, idx)}
                                    />
                                    <div
                                      className={`grd-kb-card ${draggingId === card.id ? "grd-kb-card-dragging" : ""}`}
                                      draggable
                                      onDragStart={(e) => handleDragStart(e, card.id)}
                                      onDragEnd={handleDragEnd}
                                      onClick={() => onCardClick?.(card)}
                                    >
                                      {renderCard
                                        ? renderCard(card, { dragging: draggingId === card.id })
                                        : <DefaultCard card={card} />}
                                    </div>
                                  </React.Fragment>
                                );
                              })
                            )}
                            {/* drop zone final */}
                            {list.length > 0 && (
                              <div
                                className={`grd-kb-card-drop ${
                                  dropTarget?.columnId === col.id &&
                                  dropTarget?.laneId === lane.id &&
                                  dropTarget?.index === list.length
                                    ? "is-active" : ""
                                }`}
                                onDragOver={(e) => {
                                  if (!draggingId) return;
                                  e.preventDefault();
                                  e.stopPropagation();
                                  setDropTarget({ columnId: col.id, laneId: lane.id, index: list.length });
                                }}
                                onDrop={handleDrop(col.id, lane.id, list.length)}
                              />
                            )}
                          </div>
                        )}

                        {!isColCollapsed && col.onAdd && (
                          <div className="grd-kb-col-add">
                            <button
                              type="button"
                              className="grd-kb-col-add-btn"
                              onClick={col.onAdd}
                            >
                              {IconCmp && <IconCmp name="plus" size={13} />}
                              Adicionar card
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
Kanban.displayName = "Kanban";
(window as any).Kanban = Kanban;
