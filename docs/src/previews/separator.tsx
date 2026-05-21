import { Separator } from "@ds/components/separator";

export function BasicRow() {
  return (
    <div className="flex w-full max-w-md flex-col gap-4">
      <Separator />
      <Separator appearance="dashed" />
      <Separator appearance="dotted" />
    </div>
  );
}

export function LabeledRow() {
  return (
    <div className="flex w-full max-w-md flex-col gap-4">
      <Separator label="ou" />
      <Separator label="março de 2025" />
      <Separator appearance="dashed" label="seção de arquivados" />
    </div>
  );
}

export function VerticalRow() {
  return (
    <div className="flex h-10 items-center gap-3 rounded-md border border-border bg-background px-4">
      <span className="text-sm">Conciliado</span>
      <Separator orientation="vertical" />
      <span className="text-sm">248 lançamentos</span>
      <Separator orientation="vertical" />
      <span className="text-sm text-muted-foreground">há 2 min</span>
    </div>
  );
}

export function CardSectionsRow() {
  return (
    <div className="w-full max-w-sm overflow-hidden rounded-lg border border-border bg-card">
      <div className="px-5 py-4">
        <p className="text-xs uppercase tracking-wider text-muted-foreground">
          Identificação
        </p>
        <p className="mt-1 text-sm font-medium">Fernando Seguim</p>
      </div>
      <Separator />
      <div className="px-5 py-4">
        <p className="text-xs uppercase tracking-wider text-muted-foreground">
          Empresa
        </p>
        <p className="mt-1 text-sm font-medium">Guardia Finance</p>
      </div>
      <Separator />
      <div className="px-5 py-4">
        <p className="text-xs uppercase tracking-wider text-muted-foreground">
          Plano
        </p>
        <p className="mt-1 text-sm font-medium">Avançado</p>
      </div>
    </div>
  );
}

export function VariantsRow() {
  return (
    <div className="flex w-full max-w-md flex-col gap-6">
      <div className="flex flex-col gap-2">
        <p className="text-xs uppercase tracking-wider text-muted-foreground">
          Solid (default)
        </p>
        <Separator appearance="solid" />
      </div>
      <div className="flex flex-col gap-2">
        <p className="text-xs uppercase tracking-wider text-muted-foreground">
          Dashed
        </p>
        <Separator appearance="dashed" />
      </div>
      <div className="flex flex-col gap-2">
        <p className="text-xs uppercase tracking-wider text-muted-foreground">
          Dotted
        </p>
        <Separator appearance="dotted" />
      </div>
    </div>
  );
}
