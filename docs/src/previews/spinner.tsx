import { Spinner } from "@ds/components/spinner";

export function SizesRow() {
  return (
    <div className="flex items-center gap-6">
      <div className="flex flex-col items-center gap-2">
        <Spinner size="xs" />
        <span className="text-[11px] uppercase tracking-wider text-fg-muted">
          xs · 12
        </span>
      </div>
      <div className="flex flex-col items-center gap-2">
        <Spinner size="sm" />
        <span className="text-[11px] uppercase tracking-wider text-fg-muted">
          sm · 16
        </span>
      </div>
      <div className="flex flex-col items-center gap-2">
        <Spinner size="md" />
        <span className="text-[11px] uppercase tracking-wider text-fg-muted">
          md · 20
        </span>
      </div>
      <div className="flex flex-col items-center gap-2">
        <Spinner size="lg" />
        <span className="text-[11px] uppercase tracking-wider text-fg-muted">
          lg · 28
        </span>
      </div>
      <div className="flex flex-col items-center gap-2">
        <Spinner size="xl" />
        <span className="text-[11px] uppercase tracking-wider text-fg-muted">
          xl · 40
        </span>
      </div>
    </div>
  );
}

export function ColorsRow() {
  return (
    <div className="flex items-center gap-6">
      <div className="flex flex-col items-center gap-2">
        <Spinner color="current" size="lg" />
        <span className="text-[11px] uppercase tracking-wider text-fg-muted">
          current
        </span>
      </div>
      <div className="flex flex-col items-center gap-2">
        <Spinner color="brand" size="lg" />
        <span className="text-[11px] uppercase tracking-wider text-fg-muted">
          brand
        </span>
      </div>
      <div className="flex flex-col items-center gap-2">
        <Spinner color="accent" size="lg" />
        <span className="text-[11px] uppercase tracking-wider text-fg-muted">
          accent
        </span>
      </div>
    </div>
  );
}

export function OnDarkRow() {
  return (
    <div className="flex items-center gap-6 rounded-md bg-guardia-purple-900 p-6">
      <Spinner color="white" size="lg" />
      <Spinner color="white" size="xl" />
    </div>
  );
}

export function CurrentColorRow() {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2 text-guardia-purple-500">
        <Spinner color="current" size="sm" />
        <span className="text-sm">Herda purple (texto roxo)</span>
      </div>
      <div className="flex items-center gap-2 text-guardia-orange-500">
        <Spinner color="current" size="sm" />
        <span className="text-sm">Herda orange (texto laranja)</span>
      </div>
      <div className="flex items-center gap-2 text-fg-muted">
        <Spinner color="current" size="sm" />
        <span className="text-sm">Herda fg-muted (texto neutro)</span>
      </div>
    </div>
  );
}

export function InlineRow() {
  return (
    <div className="flex flex-col gap-3 text-sm">
      <div className="flex items-center gap-2 text-guardia-purple-500">
        <Spinner color="current" size="sm" /> Conciliando 248 lançamentos…
      </div>
      <div className="flex items-center gap-2 text-guardia-orange-500">
        <Spinner color="current" size="sm" /> Gerando relatório fiscal…
      </div>
      <div className="flex items-center gap-2 text-foreground">
        <Spinner color="brand" size="sm" /> Processando pagamento…
      </div>
    </div>
  );
}

export function CustomLabelRow() {
  return (
    <div className="flex items-center gap-3">
      <Spinner size="lg" color="brand" label="Conciliando lançamentos" />
      <span className="text-sm text-fg-muted">
        Leitor de tela anuncia: <code className="font-mono">"Conciliando lançamentos"</code>
      </span>
    </div>
  );
}
