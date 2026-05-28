
/**
 * Calendar — calendário grande para visualização de eventos.
 *
 * Diferente do DatePicker (compacto, seletor de input), o Calendar é para
 * painéis: fechamento mensal, prazos fiscais, agenda da equipe.
 *
 * Props:
 *   view:          "month" (default) · "week" · "agenda"
 *   date:          Date — mês/semana em exibição (controlado)
 *   defaultDate
 *   onDateChange:  (d: Date) => void
 *   events:        CalendarEvent[]
 *   onEventClick:  (ev) => void
 *   onDayClick:    (date) => void
 *   selectedDate:  Date | null — célula destacada
 *   maxEventsPerDay: número antes de virar "+N mais"
 *   weekStartsOn:  0 (domingo, default) | 1 (segunda)
 *   showWeekNumbers: bool
 *   toolbar:       bool (default true) — header com navegação
 *   title:         string opcional — substitui mês/ano no toolbar
 *   legend:        array { label, tone } para legenda embaixo
 */

interface CalendarEvent {
  id: string;
  date: Date | string;       /* "YYYY-MM-DD" ou Date */
  endDate?: Date | string;   /* para eventos multi-dia */
  title: React.ReactNode;
  tone?: "violet" | "orange" | "blue" | "green" | "red" | "yellow" | "neutral";
  icon?: string;
  time?: string;             /* "14:00" */
  allDay?: boolean;
  meta?: any;                /* livre */
}

interface CalendarProps {
  view?: "month" | "week" | "agenda";
  date?: Date;
  defaultDate?: Date;
  onDateChange?: (d: Date) => void;
  events?: CalendarEvent[];
  onEventClick?: (ev: CalendarEvent) => void;
  onDayClick?: (date: Date) => void;
  selectedDate?: Date | null;
  maxEventsPerDay?: number;
  weekStartsOn?: 0 | 1;
  showWeekNumbers?: boolean;
  toolbar?: boolean;
  title?: string;
  legend?: Array<{ label: string; tone: CalendarEvent["tone"] }>;
  className?: string;
}

const CAL_MONTHS = ["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"];
const CAL_WDAYS_SHORT = ["Dom","Seg","Ter","Qua","Qui","Sex","Sáb"];

function toDate(v: Date | string): Date {
  if (v instanceof Date) return v;
  const [y, m, d] = v.split("-").map(Number);
  return new Date(y, m - 1, d);
}
function sameDayCal(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}
function startOfWeek(d: Date, weekStart: 0 | 1): Date {
  const day = d.getDay();
  const diff = (day - weekStart + 7) % 7;
  return new Date(d.getFullYear(), d.getMonth(), d.getDate() - diff);
}
function getISOWeek(d: Date): number {
  const tmp = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const dayNum = tmp.getUTCDay() || 7;
  tmp.setUTCDate(tmp.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(tmp.getUTCFullYear(), 0, 1));
  return Math.ceil(((+tmp - +yearStart) / 86400000 + 1) / 7);
}

function Calendar({
  view = "month",
  date,
  defaultDate,
  onDateChange,
  events = [],
  onEventClick,
  onDayClick,
  selectedDate,
  maxEventsPerDay = 3,
  weekStartsOn = 0,
  showWeekNumbers = false,
  toolbar = true,
  title,
  legend,
  className = "",
}: CalendarProps) {
  const IconCmp = (window as any).Icon;
  const [internal, setInternal] = React.useState<Date>(defaultDate ?? new Date());
  const current = date !== undefined ? date : internal;

  function setDate(d: Date) {
    if (date === undefined) setInternal(d);
    onDateChange?.(d);
  }
  function goPrev() {
    if (view === "month") setDate(new Date(current.getFullYear(), current.getMonth() - 1, 1));
    else if (view === "week") setDate(new Date(current.getFullYear(), current.getMonth(), current.getDate() - 7));
    else setDate(new Date(current.getFullYear(), current.getMonth() - 1, 1));
  }
  function goNext() {
    if (view === "month") setDate(new Date(current.getFullYear(), current.getMonth() + 1, 1));
    else if (view === "week") setDate(new Date(current.getFullYear(), current.getMonth(), current.getDate() + 7));
    else setDate(new Date(current.getFullYear(), current.getMonth() + 1, 1));
  }
  function goToday() {
    setDate(new Date());
  }

  const wdaysOrdered = weekStartsOn === 1
    ? [...CAL_WDAYS_SHORT.slice(1), CAL_WDAYS_SHORT[0]]
    : CAL_WDAYS_SHORT;

  /* Indexar eventos por "YYYY-M-D" */
  const eventsByDay = React.useMemo(() => {
    const map: Record<string, CalendarEvent[]> = {};
    for (const ev of events) {
      const start = toDate(ev.date);
      const end = ev.endDate ? toDate(ev.endDate) : start;
      const cursor = new Date(start);
      while (cursor <= end) {
        const key = `${cursor.getFullYear()}-${cursor.getMonth()}-${cursor.getDate()}`;
        (map[key] ||= []).push(ev);
        cursor.setDate(cursor.getDate() + 1);
      }
    }
    /* Ordena: allDay primeiro, depois por time */
    for (const k in map) {
      map[k].sort((a, b) => {
        if (!!a.allDay !== !!b.allDay) return a.allDay ? -1 : 1;
        return (a.time || "").localeCompare(b.time || "");
      });
    }
    return map;
  }, [events]);

  const today = new Date();
  const titleText =
    title ??
    (view === "week"
      ? weekTitle(current, weekStartsOn)
      : `${CAL_MONTHS[current.getMonth()]} ${current.getFullYear()}`);

  const rootCls = ["grd-cal", `grd-cal-${view}`, className].filter(Boolean).join(" ");

  return (
    <div className={rootCls}>
      {toolbar && (
        <div className="grd-cal-toolbar">
          <div className="grd-cal-toolbar-l">
            <button type="button" className="grd-cal-today-btn" onClick={goToday}>Hoje</button>
            <div className="grd-cal-nav">
              <button type="button" className="grd-cal-nav-btn" onClick={goPrev} aria-label="Anterior">
                {IconCmp && <IconCmp name="chevron-left" size={16} />}
              </button>
              <button type="button" className="grd-cal-nav-btn" onClick={goNext} aria-label="Próximo">
                {IconCmp && <IconCmp name="chevron-right" size={16} />}
              </button>
            </div>
            <h2 className="grd-cal-title">{titleText}</h2>
          </div>
          <div className="grd-cal-toolbar-r">
            <ViewSwitcher value={view} />
          </div>
        </div>
      )}

      {view === "month" && (
        <MonthGrid
          viewDate={current}
          today={today}
          eventsByDay={eventsByDay}
          weekStartsOn={weekStartsOn}
          wdaysOrdered={wdaysOrdered}
          showWeekNumbers={showWeekNumbers}
          maxEventsPerDay={maxEventsPerDay}
          onDayClick={onDayClick}
          onEventClick={onEventClick}
          selectedDate={selectedDate}
        />
      )}

      {view === "week" && (
        <WeekStrip
          viewDate={current}
          today={today}
          eventsByDay={eventsByDay}
          weekStartsOn={weekStartsOn}
          wdaysOrdered={wdaysOrdered}
          onDayClick={onDayClick}
          onEventClick={onEventClick}
          selectedDate={selectedDate}
        />
      )}

      {view === "agenda" && (
        <Agenda
          viewDate={current}
          today={today}
          events={events}
          onEventClick={onEventClick}
        />
      )}

      {legend && legend.length > 0 && (
        <div className="grd-cal-legend">
          {legend.map((l, i) => (
            <span key={i} className="grd-cal-legend-item">
              <span className={`grd-cal-legend-dot grd-cal-tone-${l.tone || "neutral"}`} aria-hidden />
              {l.label}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── View switcher ─────────────────────────────────────── */

function ViewSwitcher({ value }: { value: string }) {
  /* Placeholder visual (não-interativo) — view é controlado externamente */
  return (
    <div className="grd-cal-views" role="tablist" aria-label="Visualização">
      {[
        { id: "month",  label: "Mês" },
        { id: "week",   label: "Semana" },
        { id: "agenda", label: "Agenda" },
      ].map((v) => (
        <span key={v.id} className={`grd-cal-view ${value === v.id ? "grd-cal-view-active" : ""}`}>
          {v.label}
        </span>
      ))}
    </div>
  );
}

/* ─── Month grid ────────────────────────────────────────── */

function MonthGrid({
  viewDate, today, eventsByDay, weekStartsOn, wdaysOrdered,
  showWeekNumbers, maxEventsPerDay, onDayClick, onEventClick, selectedDate,
}: any) {
  const IconCmp = (window as any).Icon;
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const offset = (firstDay.getDay() - weekStartsOn + 7) % 7;

  const cells: Array<{ date: Date; inMonth: boolean }> = [];
  for (let i = offset - 1; i >= 0; i--) {
    cells.push({ date: new Date(year, month, -i), inMonth: false });
  }
  for (let i = 1; i <= daysInMonth; i++) {
    cells.push({ date: new Date(year, month, i), inMonth: true });
  }
  while (cells.length % 7 !== 0) {
    const last = cells[cells.length - 1].date;
    cells.push({ date: new Date(last.getFullYear(), last.getMonth(), last.getDate() + 1), inMonth: false });
  }
  /* Garantir 6 linhas para altura estável */
  while (cells.length < 42) {
    const last = cells[cells.length - 1].date;
    cells.push({ date: new Date(last.getFullYear(), last.getMonth(), last.getDate() + 1), inMonth: false });
  }

  const rows: Array<typeof cells> = [];
  for (let i = 0; i < cells.length; i += 7) rows.push(cells.slice(i, i + 7));

  const colTemplate = showWeekNumbers ? "42px repeat(7, minmax(0, 1fr))" : "repeat(7, minmax(0, 1fr))";

  return (
    <div className="grd-cal-month">
      {/* Header */}
      <div className="grd-cal-month-head" style={{ gridTemplateColumns: colTemplate }}>
        {showWeekNumbers && <div className="grd-cal-wn-hdr" aria-hidden />}
        {wdaysOrdered.map((w: string, i: number) => (
          <div key={`h${i}`} className="grd-cal-wday">{w}</div>
        ))}
      </div>

      {/* Body */}
      <div className="grd-cal-month-body" style={{ gridTemplateColumns: colTemplate }}>
        {rows.map((row, ri) => (
          <React.Fragment key={`r${ri}`}>
            {showWeekNumbers && (
              <div className="grd-cal-wn">{getISOWeek(row[0].date)}</div>
            )}
            {row.map((c, ci) => {
            const key = `${c.date.getFullYear()}-${c.date.getMonth()}-${c.date.getDate()}`;
            const dayEvents = eventsByDay[key] || [];
            const isToday = sameDayCal(c.date, today);
            const isSel   = selectedDate && sameDayCal(c.date, selectedDate);
            const isWeekend = c.date.getDay() === 0 || c.date.getDay() === 6;
            const visible = dayEvents.slice(0, maxEventsPerDay);
            const hidden  = dayEvents.length - visible.length;

            const cellCls = [
              "grd-cal-day",
              !c.inMonth && "grd-cal-day-out",
              isWeekend && "grd-cal-day-we",
              isToday && "grd-cal-day-today",
              isSel && "grd-cal-day-sel",
              dayEvents.length > 0 && "grd-cal-day-has",
            ].filter(Boolean).join(" ");

            return (
              <div key={`c${ri}${ci}`}
                   className={cellCls}
                   onClick={() => onDayClick?.(c.date)}
                   role={onDayClick ? "button" : undefined}
                   tabIndex={onDayClick ? 0 : undefined}
              >
                <div className="grd-cal-day-head">
                  <span className="grd-cal-day-num">
                    {isToday
                      ? <span className="grd-cal-day-today-pill">{c.date.getDate()}</span>
                      : c.date.getDate()
                    }
                  </span>
                </div>
                <div className="grd-cal-day-events">
                  {visible.map((ev: CalendarEvent, ei: number) => (
                    <button
                      key={ev.id + ei}
                      type="button"
                      className={`grd-cal-ev grd-cal-tone-${ev.tone || "neutral"} ${ev.allDay ? "grd-cal-ev-allday" : ""}`}
                      onClick={(e) => { e.stopPropagation(); onEventClick?.(ev); }}
                      title={typeof ev.title === "string" ? ev.title : undefined}
                    >
                      {ev.icon && IconCmp && <span className="grd-cal-ev-ic"><IconCmp name={ev.icon} size={11} /></span>}
                      {ev.time && <span className="grd-cal-ev-time">{ev.time}</span>}
                      <span className="grd-cal-ev-title">{ev.title}</span>
                    </button>
                  ))}
                  {hidden > 0 && (
                    <button type="button" className="grd-cal-ev-more"
                            onClick={(e) => { e.stopPropagation(); onDayClick?.(c.date); }}>
                      +{hidden} mais
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </React.Fragment>
      ))}
      </div>
    </div>
  );
}

/* ─── Week strip ───────────────────────────────────────── */

function WeekStrip({
  viewDate, today, eventsByDay, weekStartsOn, wdaysOrdered, onDayClick, onEventClick, selectedDate,
}: any) {
  const IconCmp = (window as any).Icon;
  const start = startOfWeek(viewDate, weekStartsOn);
  const days: Date[] = [];
  for (let i = 0; i < 7; i++) days.push(new Date(start.getFullYear(), start.getMonth(), start.getDate() + i));

  return (
    <div className="grd-cal-week">
      <div className="grd-cal-week-head">
        {days.map((d, i) => {
          const isToday = sameDayCal(d, today);
          const isWeekend = d.getDay() === 0 || d.getDay() === 6;
          return (
            <div key={i} className={["grd-cal-week-hc", isToday && "grd-cal-week-hc-today", isWeekend && "grd-cal-week-hc-we"].filter(Boolean).join(" ")}>
              <span className="grd-cal-week-wd">{wdaysOrdered[i]}</span>
              <span className="grd-cal-week-dn">
                {isToday ? <span className="grd-cal-day-today-pill">{d.getDate()}</span> : d.getDate()}
              </span>
            </div>
          );
        })}
      </div>
      <div className="grd-cal-week-body">
        {days.map((d, i) => {
          const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
          const dayEvents = eventsByDay[key] || [];
          const isToday = sameDayCal(d, today);
          const isSel   = selectedDate && sameDayCal(d, selectedDate);
          const isWeekend = d.getDay() === 0 || d.getDay() === 6;
          return (
            <div key={i}
                 className={["grd-cal-week-col", isToday && "grd-cal-week-col-today", isSel && "grd-cal-week-col-sel", isWeekend && "grd-cal-week-col-we"].filter(Boolean).join(" ")}
                 onClick={() => onDayClick?.(d)}>
              {dayEvents.length === 0 && <div className="grd-cal-week-empty">—</div>}
              {dayEvents.map((ev: CalendarEvent, ei: number) => (
                <button
                  key={ev.id + ei}
                  type="button"
                  className={`grd-cal-ev grd-cal-ev-block grd-cal-tone-${ev.tone || "neutral"}`}
                  onClick={(e) => { e.stopPropagation(); onEventClick?.(ev); }}
                >
                  {ev.icon && IconCmp && <span className="grd-cal-ev-ic"><IconCmp name={ev.icon} size={12} /></span>}
                  {ev.time && <span className="grd-cal-ev-time">{ev.time}</span>}
                  <span className="grd-cal-ev-title">{ev.title}</span>
                </button>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ─── Agenda ───────────────────────────────────────────── */

function Agenda({ viewDate, today, events, onEventClick }: any) {
  const IconCmp = (window as any).Icon;
  /* Agenda mostra o mês inteiro — só dias com eventos, ordenados */
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const monthEvents = events
    .map((ev: CalendarEvent) => ({ ev, d: toDate(ev.date) }))
    .filter(({ d }: any) => d.getFullYear() === year && d.getMonth() === month)
    .sort((a: any, b: any) => +a.d - +b.d || (a.ev.time || "").localeCompare(b.ev.time || ""));

  /* Agrupa por dia */
  const byDay: Record<string, { d: Date; events: CalendarEvent[] }> = {};
  for (const { ev, d } of monthEvents) {
    const k = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
    (byDay[k] ||= { d, events: [] }).events.push(ev);
  }
  const days = Object.values(byDay);

  return (
    <div className="grd-cal-agenda">
      {days.length === 0 && (
        <div className="grd-cal-agenda-empty">Nenhum evento neste mês.</div>
      )}
      {days.map(({ d, events: dayEvents }, i) => {
        const isToday = sameDayCal(d, today);
        return (
          <div key={i} className="grd-cal-agenda-day">
            <div className={`grd-cal-agenda-date ${isToday ? "grd-cal-agenda-date-today" : ""}`}>
              <span className="grd-cal-agenda-dn">{d.getDate()}</span>
              <span className="grd-cal-agenda-wd">{CAL_WDAYS_SHORT[d.getDay()]}</span>
            </div>
            <div className="grd-cal-agenda-evs">
              {dayEvents.map((ev, ei) => (
                <button
                  key={ev.id + ei}
                  type="button"
                  className={`grd-cal-agenda-ev grd-cal-tone-${ev.tone || "neutral"}`}
                  onClick={() => onEventClick?.(ev)}
                >
                  {ev.icon && IconCmp && <span className="grd-cal-ev-ic"><IconCmp name={ev.icon} size={13} /></span>}
                  <span className="grd-cal-ev-time">{ev.allDay ? "Dia inteiro" : (ev.time || "")}</span>
                  <span className="grd-cal-ev-title">{ev.title}</span>
                </button>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function weekTitle(d: Date, ws: 0 | 1): string {
  const start = startOfWeek(d, ws);
  const end = new Date(start.getFullYear(), start.getMonth(), start.getDate() + 6);
  const sameMonth = start.getMonth() === end.getMonth();
  const fmt = (x: Date) => `${x.getDate()} ${CAL_MONTHS[x.getMonth()].slice(0,3).toLowerCase()}`;
  if (sameMonth) {
    return `${start.getDate()}–${end.getDate()} ${CAL_MONTHS[start.getMonth()]} ${start.getFullYear()}`;
  }
  return `${fmt(start)} – ${fmt(end)} ${start.getFullYear()}`;
}

Calendar.displayName = "Calendar";
(window as any).Calendar = Calendar;
