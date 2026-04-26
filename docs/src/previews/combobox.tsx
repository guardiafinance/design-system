import { useState } from "react";
import { Building2, User } from "lucide-react";
import { Combobox } from "@ds/components/combobox";

const PLANOS = [
  { value: "starter", label: "Starter", meta: "Até 1k transações/mês" },
  { value: "pro", label: "Pro", meta: "Até 10k transações/mês" },
  { value: "business", label: "Business", meta: "Até 100k transações/mês" },
  { value: "enterprise", label: "Enterprise", meta: "Personalizado" },
];

const CLIENTES = [
  { value: "01", label: "Acme Ltda", meta: "12.345.678/0001-90" },
  { value: "02", label: "Beta Comércio S.A.", meta: "23.456.789/0001-12" },
  { value: "03", label: "Gama Tecnologia ME", meta: "34.567.890/0001-34" },
  { value: "04", label: "Delta Indústrias", meta: "45.678.901/0001-56" },
  { value: "05", label: "Épsilon Holdings", meta: "56.789.012/0001-78" },
  { value: "06", label: "Zeta Logística", meta: "67.890.123/0001-90" },
  { value: "07", label: "Eta Consultoria", meta: "78.901.234/0001-12" },
  { value: "08", label: "Theta Imobiliária", meta: "89.012.345/0001-34" },
  { value: "09", label: "Iota Distribuidora", meta: "90.123.456/0001-56" },
  { value: "10", label: "Kappa Eletrônica", meta: "01.234.567/0001-78" },
  {
    value: "legacy",
    label: "Legacy Corp",
    meta: "Descontinuado",
    disabled: true,
  },
];

export function BasicRow() {
  const [value, setValue] = useState("");
  return (
    <div className="flex w-72 flex-col gap-2">
      <Combobox options={PLANOS} value={value} onChange={setValue} />
      <p className="text-xs text-fg-muted">
        Valor selecionado: <code className="font-mono">{value || "—"}</code>
      </p>
    </div>
  );
}

export function WithLeftIconRow() {
  return (
    <div className="w-72">
      <Combobox
        options={PLANOS}
        leftIcon={<Building2 width={16} height={16} aria-hidden="true" />}
        placeholder="Selecione um plano"
      />
    </div>
  );
}

export function ClearableRow() {
  return (
    <div className="w-72">
      <Combobox options={PLANOS} defaultValue="pro" clearable />
    </div>
  );
}

export function LongListRow() {
  return (
    <div className="w-96">
      <Combobox
        options={CLIENTES}
        leftIcon={<User width={16} height={16} aria-hidden="true" />}
        placeholder="Selecione um cliente"
        searchPlaceholder="Buscar por nome ou CNPJ…"
      />
    </div>
  );
}

export function SizesRow() {
  return (
    <div className="flex w-72 flex-col gap-3">
      <Combobox options={PLANOS} size="sm" placeholder="Small (32px)" />
      <Combobox
        options={PLANOS}
        size="md"
        placeholder="Medium · default (38px)"
      />
      <Combobox options={PLANOS} size="lg" placeholder="Large (46px)" />
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
        <Combobox options={PLANOS} placeholder="Selecione…" />
      </div>
      <div className="flex flex-col gap-2">
        <span className="text-xs uppercase tracking-wider text-fg-muted">
          Invalid
        </span>
        <Combobox options={PLANOS} invalid placeholder="Selecione…" />
      </div>
      <div className="flex flex-col gap-2">
        <span className="text-xs uppercase tracking-wider text-fg-muted">
          Disabled
        </span>
        <Combobox options={PLANOS} disabled defaultValue="pro" />
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
        alert(`plano = ${data.get("plano") || "(vazio)"}`);
      }}
    >
      <label className="text-sm font-medium" htmlFor="plano-cb">
        Plano
      </label>
      <Combobox
        id="plano-cb"
        name="plano"
        options={PLANOS}
        defaultValue="pro"
      />
      <button
        type="submit"
        className="rounded-md bg-guardia-violet-500 px-3 py-2 text-sm text-white hover:bg-guardia-violet-700"
      >
        Enviar
      </button>
    </form>
  );
}
