import { useState } from "react";
import { Checkbox } from "@ds/components/checkbox";

export function BasicRow() {
  return (
    <div className="flex flex-col gap-3">
      <Checkbox label="Aceito os termos" />
      <Checkbox label="Receber comunicações" defaultChecked />
    </div>
  );
}

export function WithDescriptionRow() {
  return (
    <div className="flex flex-col gap-4">
      <Checkbox
        label="Conciliação automática"
        description="Concilia lançamentos a cada 5 minutos durante o expediente."
      />
      <Checkbox
        label="Alerta de divergência > R$ 1.000"
        description="Email + push toda vez que uma transação não casar com extrato."
      />
    </div>
  );
}

export function StatesRow() {
  return (
    <div className="flex flex-col gap-3">
      <Checkbox label="Default" />
      <Checkbox label="Checked" defaultChecked />
      <Checkbox label="Indeterminate" indeterminate />
      <Checkbox
        label="Invalid"
        description="Campo obrigatório"
        invalid
      />
      <Checkbox label="Disabled" disabled />
      <Checkbox label="Disabled · Checked" disabled defaultChecked />
    </div>
  );
}

export function SizesRow() {
  return (
    <div className="flex flex-col gap-4">
      <Checkbox
        size="sm"
        label="Tamanho sm (denso)"
        description="Box 16px · label 13px"
      />
      <Checkbox
        size="md"
        label="Tamanho md (default)"
        description="Box 18px · label 14px"
      />
    </div>
  );
}

export function GroupRow() {
  return (
    <fieldset className="flex w-fit flex-col gap-3 rounded-md border border-border p-4">
      <legend className="px-2 text-sm font-semibold">Notificações</legend>
      <Checkbox label="Email" description="Resumo diário e alertas críticos" />
      <Checkbox label="Push" description="Apenas alertas críticos" />
      <Checkbox label="SMS" description="Apenas para 2FA" disabled />
    </fieldset>
  );
}

/* Master/child pattern com indeterminate */
export function SelectAllRow() {
  const items = ["Pagamentos", "Recebimentos", "Transferências", "Investimentos"];
  const [checked, setChecked] = useState<Record<string, boolean>>({
    Pagamentos: true,
    Recebimentos: true,
    Transferências: false,
    Investimentos: false,
  });
  const checkedCount = Object.values(checked).filter(Boolean).length;
  const allChecked = checkedCount === items.length;
  const someChecked = checkedCount > 0 && !allChecked;

  return (
    <div className="flex w-fit flex-col gap-2 rounded-md border border-border p-4">
      <Checkbox
        label={`Selecionar todos (${checkedCount}/${items.length})`}
        checked={allChecked}
        indeterminate={someChecked}
        onCheckedChange={(value) => {
          const next = Boolean(value);
          setChecked(
            Object.fromEntries(items.map((k) => [k, next])),
          );
        }}
      />
      <div className="ml-7 flex flex-col gap-2 border-l border-border pl-3">
        {items.map((item) => (
          <Checkbox
            key={item}
            label={item}
            checked={checked[item]}
            onCheckedChange={(v) =>
              setChecked((prev) => ({ ...prev, [item]: Boolean(v) }))
            }
          />
        ))}
      </div>
    </div>
  );
}

export function StandaloneRow() {
  return (
    <div className="flex items-center gap-3">
      <Checkbox id="standalone-cb" />
      <label htmlFor="standalone-cb" className="text-sm text-fg">
        Sem composição interna — label externa via{" "}
        <code className="rounded bg-muted px-1 font-mono text-xs">htmlFor</code>
      </label>
    </div>
  );
}
