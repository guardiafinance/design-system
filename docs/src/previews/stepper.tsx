import * as React from "react";

import {
  Stepper,
  type Step,
} from "@ds/components/stepper";
import {
  CreditCard,
  FileSpreadsheet,
  SlidersHorizontal,
  Eye,
} from "lucide-react";

const fourSteps: Step[] = [
  { id: "1", title: "Conectar banco", description: "Itaú · Bradesco" },
  { id: "2", title: "Importar lançamentos", description: "OFX · CSV · API" },
  { id: "3", title: "Configurar regras", description: "Auto-classificação" },
  { id: "4", title: "Revisar", description: "Confirmar conciliação" },
];

const iconedSteps: Step[] = [
  { id: "1", title: "Conectar", icon: CreditCard },
  { id: "2", title: "Importar", icon: FileSpreadsheet },
  { id: "3", title: "Regras", icon: SlidersHorizontal },
  { id: "4", title: "Revisar", icon: Eye },
];

// ──────────────────────────────────────────────────────────────────
// Padrão — horizontal numbered
// ──────────────────────────────────────────────────────────────────

export function BasicRow(): React.ReactElement {
  return (
    <div className="flex flex-col gap-3 py-4">
      <Stepper steps={fourSteps} activeIndex={1} />
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────
// Orientação vertical
// ──────────────────────────────────────────────────────────────────

export function VerticalRow(): React.ReactElement {
  return (
    <div className="py-4 max-w-md">
      <Stepper steps={fourSteps} activeIndex={1} orientation="vertical" />
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────
// Iconed
// ──────────────────────────────────────────────────────────────────

export function IconedRow(): React.ReactElement {
  return (
    <div className="flex flex-col gap-4 py-4">
      <Stepper steps={iconedSteps} activeIndex={2} variant="iconed" />
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────
// Compact
// ──────────────────────────────────────────────────────────────────

export function CompactRow(): React.ReactElement {
  return (
    <div className="flex flex-col gap-4 py-4">
      <Stepper steps={fourSteps} activeIndex={1} variant="compact" />
      <Stepper
        steps={fourSteps}
        activeIndex={2}
        variant="compact"
        size="sm"
      />
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────
// Estados (todos juntos)
// ──────────────────────────────────────────────────────────────────

export function StatesRow(): React.ReactElement {
  return (
    <div className="py-4">
      <Stepper
        steps={[
          { id: "a", title: "Concluído" },
          { id: "b", title: "Em andamento", state: "current" },
          { id: "c", title: "Processando", state: "loading" },
          { id: "d", title: "Falhou", state: "error" },
          { id: "e", title: "Pendente" },
        ]}
        activeIndex={0}
      />
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────
// Clickable
// ──────────────────────────────────────────────────────────────────

export function ClickableRow(): React.ReactElement {
  const [active, setActive] = React.useState(2);
  return (
    <div className="py-4">
      <Stepper
        steps={fourSteps}
        activeIndex={active}
        onStepClick={(index) => setActive(index)}
      />
      <p className="mt-4 text-xs text-fg-muted">
        Step ativo: <strong>{active + 1}</strong>. Clique em qualquer step não
        pendente para navegar.
      </p>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────
// Loading
// ──────────────────────────────────────────────────────────────────

export function LoadingRow(): React.ReactElement {
  return (
    <div className="py-4">
      <Stepper
        steps={[
          { id: "1", title: "Upload", description: "248 MB" },
          { id: "2", title: "Processando", description: "Lendo lançamentos…", state: "loading" },
          { id: "3", title: "Match", description: "Aguardando" },
          { id: "4", title: "Revisar" },
        ]}
        activeIndex={1}
      />
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────
// Sizes
// ──────────────────────────────────────────────────────────────────

export function SizesRow(): React.ReactElement {
  return (
    <div className="flex flex-col gap-6 py-4">
      <Stepper steps={fourSteps} activeIndex={1} />
      <Stepper steps={fourSteps} activeIndex={1} size="sm" />
    </div>
  );
}
