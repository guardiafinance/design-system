import { useState } from "react";
import { DatePicker } from "@ds/components/date-picker";

export function BasicRow() {
  const [date, setDate] = useState<Date | null>(null);
  return (
    <div className="flex w-72 flex-col gap-2">
      <DatePicker value={date} onChange={setDate} />
      <p className="text-xs text-fg-muted">
        Selecionado:{" "}
        <code className="font-mono">
          {date ? date.toLocaleDateString("pt-BR") : "—"}
        </code>
      </p>
    </div>
  );
}

export function WithDefaultRow() {
  return (
    <div className="w-72">
      <DatePicker defaultValue={new Date(2025, 2, 15)} />
    </div>
  );
}

export function MinMaxRow() {
  const today = new Date();
  const max = new Date();
  max.setDate(today.getDate() + 30);
  return (
    <div className="flex flex-col gap-2">
      <div className="w-72">
        <DatePicker
          minDate={today}
          maxDate={max}
          placeholder="Próximos 30 dias"
        />
      </div>
      <p className="text-xs text-fg-muted">
        Datas anteriores a hoje e posteriores a 30 dias ficam desabilitadas.
      </p>
    </div>
  );
}

export function SizesRow() {
  return (
    <div className="flex w-72 flex-col gap-3">
      <DatePicker size="sm" placeholder="Small (32px)" />
      <DatePicker size="md" placeholder="Medium · default (38px)" />
      <DatePicker size="lg" placeholder="Large (46px)" />
    </div>
  );
}

export function StatesRow() {
  return (
    <div className="grid w-full max-w-2xl grid-cols-3 gap-3">
      <div className="flex flex-col gap-2">
        <span className="text-xs uppercase tracking-wider text-fg-muted">
          Default
        </span>
        <DatePicker placeholder="dd/mm/aaaa" />
      </div>
      <div className="flex flex-col gap-2">
        <span className="text-xs uppercase tracking-wider text-fg-muted">
          Invalid
        </span>
        <DatePicker invalid placeholder="dd/mm/aaaa" />
      </div>
      <div className="flex flex-col gap-2">
        <span className="text-xs uppercase tracking-wider text-fg-muted">
          Disabled
        </span>
        <DatePicker disabled defaultValue={new Date(2025, 2, 15)} />
      </div>
    </div>
  );
}

export function FormSubmitRow() {
  return (
    <form
      className="flex w-72 flex-col gap-3"
      onSubmit={(e) => {
        e.preventDefault();
        const data = new FormData(e.currentTarget);
        alert(`due_date = ${data.get("due_date") || "(vazio)"}`);
      }}
    >
      <label htmlFor="due-dp" className="text-sm font-medium">
        Data de vencimento
      </label>
      <DatePicker id="due-dp" name="due_date" defaultValue={new Date()} />
      <button
        type="submit"
        className="rounded-md bg-guardia-purple-500 px-3 py-2 text-sm text-white hover:bg-guardia-purple-700"
      >
        Enviar
      </button>
    </form>
  );
}
