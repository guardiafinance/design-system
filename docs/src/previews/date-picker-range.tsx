import { useState } from "react";
import { DatePicker, type DateRange } from "@ds/components/date-picker";

export function RangeBasicRow() {
  const [range, setRange] = useState<DateRange | null>(null);
  const span = range
    ? Math.round(
        (range.to.getTime() - range.from.getTime()) / (1000 * 60 * 60 * 24),
      ) + 1
    : null;
  return (
    <div className="flex w-80 flex-col gap-2">
      <DatePicker mode="range" value={range} onChange={setRange} />
      <p className="text-xs text-fg-muted">
        Selecionado:{" "}
        <code className="font-mono">
          {range
            ? `${range.from.toLocaleDateString("pt-BR")} — ${range.to.toLocaleDateString("pt-BR")} (${span} dia${span === 1 ? "" : "s"})`
            : "—"}
        </code>
      </p>
    </div>
  );
}

export function RangePreselectedRow() {
  return (
    <div className="w-80">
      <DatePicker
        mode="range"
        defaultValue={{
          from: new Date(2026, 2, 1),
          to: new Date(2026, 2, 15),
        }}
      />
    </div>
  );
}

export function RangeMinMaxRow() {
  const today = new Date();
  const max = new Date();
  max.setDate(today.getDate() + 60);
  return (
    <div className="flex flex-col gap-2">
      <div className="w-80">
        <DatePicker
          mode="range"
          minDate={today}
          maxDate={max}
          placeholder="Próximos 60 dias"
        />
      </div>
      <p className="text-xs text-fg-muted">
        Ambos os endpoints (<code className="font-mono">from</code> e{" "}
        <code className="font-mono">to</code>) respeitam os limites.
      </p>
    </div>
  );
}

export function RangePartialPreviewRow() {
  return (
    <div className="flex flex-col gap-2">
      <div className="w-80">
        <DatePicker
          mode="range"
          aria-label="Período (estado parcial)"
          placeholder="Clique no calendário e veja"
        />
      </div>
      <p className="text-xs text-fg-muted">
        Clique uma vez no calendário para começar — durante a seleção, o
        trigger mostra <code className="font-mono">dd/mm/aaaa — </code>{" "}
        (em dash + espaço). Esc descarta o estado parcial sem disparar{" "}
        <code className="font-mono">onChange</code>.
      </p>
    </div>
  );
}

export function RangeStatesRow() {
  const preselected = {
    from: new Date(2026, 2, 1),
    to: new Date(2026, 2, 15),
  };
  return (
    <div className="grid w-full max-w-3xl grid-cols-3 gap-3">
      <div className="flex flex-col gap-2">
        <span className="text-xs uppercase tracking-wider text-fg-muted">
          Default
        </span>
        <DatePicker mode="range" />
      </div>
      <div className="flex flex-col gap-2">
        <span className="text-xs uppercase tracking-wider text-fg-muted">
          Invalid
        </span>
        <DatePicker mode="range" invalid />
      </div>
      <div className="flex flex-col gap-2">
        <span className="text-xs uppercase tracking-wider text-fg-muted">
          Disabled
        </span>
        <DatePicker mode="range" disabled defaultValue={preselected} />
      </div>
    </div>
  );
}

export function RangeFormSubmitRow() {
  return (
    <form
      className="flex w-80 flex-col gap-3"
      onSubmit={(e) => {
        e.preventDefault();
        const data = new FormData(e.currentTarget);
        alert(
          `period_from = ${data.get("period_from") || "(vazio)"}\nperiod_to = ${data.get("period_to") || "(vazio)"}`,
        );
      }}
    >
      <label htmlFor="period-dp" className="text-sm font-medium">
        Período de competência
      </label>
      <DatePicker
        id="period-dp"
        name="period"
        mode="range"
        defaultValue={{
          from: new Date(2026, 2, 1),
          to: new Date(2026, 2, 31),
        }}
      />
      <p className="text-xs text-fg-muted">
        Em range mode, <code className="font-mono">name="period"</code>{" "}
        produz dois inputs hidden:{" "}
        <code className="font-mono">period_from</code> e{" "}
        <code className="font-mono">period_to</code> (ISO 8601).
      </p>
      <button
        type="submit"
        className="rounded-md bg-action px-3 py-2 text-sm text-button-fg hover:opacity-90"
      >
        Enviar
      </button>
    </form>
  );
}
