import { Building2, Calendar } from "lucide-react";
import { Select } from "@ds/components/select";

const PLANOS = [
  { value: "starter", label: "Starter" },
  { value: "pro", label: "Pro" },
  { value: "business", label: "Business" },
  { value: "enterprise", label: "Enterprise" },
];

const PERIODOS = [
  { value: "today", label: "Hoje" },
  { value: "week", label: "Esta semana" },
  { value: "month", label: "Este mês" },
  { value: "quarter", label: "Este trimestre" },
  { value: "year", label: "Este ano" },
];

export function BasicRow() {
  return (
    <div className="w-72">
      <Select options={PLANOS} placeholder="Selecione um plano" />
    </div>
  );
}

export function WithLeftIconRow() {
  return (
    <div className="w-72">
      <Select
        options={PLANOS}
        leftIcon={<Building2 width={16} height={16} />}
        placeholder="Plano"
      />
    </div>
  );
}

export function SizesRow() {
  return (
    <div className="flex w-72 flex-col gap-3">
      <Select options={PLANOS} size="sm" placeholder="Small (32px)" />
      <Select options={PLANOS} size="md" placeholder="Medium · default (38px)" />
      <Select options={PLANOS} size="lg" placeholder="Large (46px)" />
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
        <Select options={PLANOS} placeholder="Selecione" />
      </div>
      <div className="flex flex-col gap-2">
        <span className="text-xs uppercase tracking-wider text-fg-muted">
          Error
        </span>
        <Select options={PLANOS} invalid defaultValue="pro" />
      </div>
      <div className="flex flex-col gap-2">
        <span className="text-xs uppercase tracking-wider text-fg-muted">
          Disabled
        </span>
        <Select options={PLANOS} disabled defaultValue="starter" />
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
        alert(`periodo = ${data.get("periodo") || "(vazio)"}`);
      }}
    >
      <label htmlFor="fs-periodo" className="text-sm font-medium">
        Período
      </label>
      <Select
        id="fs-periodo"
        name="periodo"
        leftIcon={<Calendar width={16} height={16} />}
        options={PERIODOS}
        placeholder="Selecione"
        required
      />
      <button
        type="submit"
        className="rounded-md bg-guardia-violet-500 px-3 py-2 text-sm text-white"
      >
        Enviar
      </button>
    </form>
  );
}
