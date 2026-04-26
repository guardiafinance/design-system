import { useState } from "react";
import { Radio, RadioGroup } from "@ds/components/radio";

export function BasicRow() {
  return (
    <RadioGroup defaultValue="daily">
      <Radio value="now" label="Imediato" />
      <Radio value="daily" label="Diário" />
      <Radio value="weekly" label="Semanal" />
    </RadioGroup>
  );
}

export function WithDescriptionsRow() {
  return (
    <RadioGroup defaultValue="daily">
      <Radio
        value="now"
        label="Imediato"
        description="Recebe assim que acontece"
      />
      <Radio
        value="daily"
        label="Diário"
        description="Resumo no fim do dia, às 18h"
      />
      <Radio
        value="weekly"
        label="Semanal"
        description="Resumo na sexta-feira"
      />
    </RadioGroup>
  );
}

export function HorizontalRow() {
  return (
    <RadioGroup orientation="horizontal" defaultValue="month" gap={20}>
      <Radio value="day" label="Dia" />
      <Radio value="week" label="Semana" />
      <Radio value="month" label="Mês" />
      <Radio value="year" label="Ano" />
    </RadioGroup>
  );
}

export function SizesRow() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="mb-2 text-xs uppercase text-fg-muted">sm</p>
        <RadioGroup defaultValue="a">
          <Radio value="a" size="sm" label="Tamanho pequeno" description="Box 16px · label 13px" />
          <Radio value="b" size="sm" label="Outra opção" description="Para forms densos" />
        </RadioGroup>
      </div>
      <div>
        <p className="mb-2 text-xs uppercase text-fg-muted">md (default)</p>
        <RadioGroup defaultValue="a">
          <Radio value="a" label="Tamanho padrão" description="Box 18px · label 14px" />
          <Radio value="b" label="Outra opção" description="Para cadastros" />
        </RadioGroup>
      </div>
    </div>
  );
}

export function StatesRow() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="mb-2 text-xs uppercase text-fg-muted">Default</p>
        <RadioGroup>
          <Radio value="a" label="Opção A" />
          <Radio value="b" label="Opção B" />
        </RadioGroup>
      </div>
      <div>
        <p className="mb-2 text-xs uppercase text-fg-muted">Invalid</p>
        <RadioGroup>
          <Radio value="a" invalid label="Você precisa escolher uma opção" />
          <Radio value="b" invalid label="Outra alternativa" />
        </RadioGroup>
      </div>
      <div>
        <p className="mb-2 text-xs uppercase text-fg-muted">Disabled</p>
        <RadioGroup defaultValue="now">
          <Radio value="now" label="Disponível agora" />
          <Radio value="trial" label="Não disponível neste plano" disabled />
          <Radio value="enterprise" label="Apenas Enterprise" disabled />
        </RadioGroup>
      </div>
    </div>
  );
}

export function ControlledRow() {
  const [value, setValue] = useState("daily");
  return (
    <div className="flex flex-col gap-3">
      <RadioGroup value={value} onValueChange={setValue}>
        <Radio value="now" label="Imediato" />
        <Radio value="daily" label="Diário" />
        <Radio value="weekly" label="Semanal" />
      </RadioGroup>
      <p className="text-xs text-fg-muted">
        Selecionado: <code className="font-mono">{value}</code>
      </p>
    </div>
  );
}

export function FormSubmitRow() {
  return (
    <form
      className="flex flex-col gap-4"
      onSubmit={(e) => {
        e.preventDefault();
        const data = new FormData(e.currentTarget);
        alert(`plano = ${data.get("plano") || "(vazio)"}`);
      }}
    >
      <fieldset className="flex flex-col gap-3 rounded-md border border-border p-4">
        <legend className="px-2 text-sm font-semibold">Plano</legend>
        <RadioGroup name="plano" defaultValue="pro">
          <Radio
            value="starter"
            label="Starter"
            description="Até 1k transações/mês"
          />
          <Radio
            value="pro"
            label="Pro"
            description="Até 10k transações/mês"
          />
          <Radio
            value="enterprise"
            label="Enterprise"
            description="Personalizado"
          />
        </RadioGroup>
      </fieldset>
      <button
        type="submit"
        className="self-start rounded-md bg-guardia-violet-500 px-3 py-2 text-sm text-white"
      >
        Confirmar
      </button>
    </form>
  );
}
