import { useState } from "react";
import { Slider } from "@ds/components/slider";

export function BasicRow() {
  return (
    <div className="flex flex-col gap-4 w-full max-w-md">
      <Slider aria-label="Volume" defaultValue={40} />
      <Slider aria-label="Brilho" defaultValue={75} showValue suffix="%" />
    </div>
  );
}

export function SizesRow() {
  return (
    <div className="flex flex-col gap-5 w-full max-w-md">
      <Slider
        aria-label="sm"
        size="sm"
        defaultValue={30}
        showValue
        suffix="%"
      />
      <Slider
        aria-label="md (default)"
        size="md"
        defaultValue={60}
        showValue
        suffix="%"
      />
    </div>
  );
}

export function ControlledRow() {
  const [value, setValue] = useState(25);
  return (
    <div className="flex flex-col gap-3 w-full max-w-md">
      <Slider
        aria-label="Volume controlado"
        value={value}
        onValueChange={setValue}
        showValue
        suffix="%"
      />
      <p className="text-sm text-fg-muted">
        Estado externo: <code className="font-mono">{value}</code>
      </p>
    </div>
  );
}

export function FormatPrefixSuffixRow() {
  return (
    <div className="flex flex-col gap-5 w-full max-w-md">
      <Slider
        aria-label="Preço mensal"
        min={0}
        max={500}
        step={10}
        defaultValue={120}
        showValue
        prefix="R$ "
        format={(v) => v.toFixed(2).replace(".", ",")}
      />
      <Slider
        aria-label="Latência alvo"
        min={50}
        max={1000}
        step={25}
        defaultValue={250}
        showValue
        suffix=" ms"
      />
      <Slider
        aria-label="Progresso"
        defaultValue={75}
        showValue
        format={(v) => `${v}%`}
      />
    </div>
  );
}

export function InvalidRow() {
  return (
    <div className="flex flex-col gap-3 w-full max-w-md">
      <Slider
        aria-label="Acima do limite"
        defaultValue={95}
        invalid
        showValue
        suffix="%"
      />
      <p className="text-sm text-destructive">
        Valor excede o teto permitido (90%).
      </p>
    </div>
  );
}

export function DisabledRow() {
  return (
    <div className="flex flex-col gap-3 w-full max-w-md">
      <Slider
        aria-label="Indisponível"
        defaultValue={30}
        disabled
        showValue
        suffix="%"
      />
      <p className="text-sm text-fg-muted">
        Plano atual não permite ajuste fino — faça upgrade para liberar.
      </p>
    </div>
  );
}
