import { Fragment, useState } from "react";
import { Chip } from "@ds/components/chip";
import { Filter, Tag, Clock, Check } from "lucide-react";

export function Static() {
  return (
    <>
      <Chip>Etiqueta</Chip>
      <Chip leadingIcon={<Tag />}>Com ícone</Chip>
      <Chip selected leadingIcon={<Check />}>
        Selecionado (visual)
      </Chip>
    </>
  );
}

export function FilterToggle() {
  const [selected, setSelected] = useState(false);
  return (
    <Chip
      leadingIcon={<Filter />}
      selected={selected}
      onSelect={setSelected}
    >
      Não conciliadas
    </Chip>
  );
}

export function FilterGroup() {
  const [active, setActive] = useState<Set<string>>(new Set(["pendente"]));
  const toggle = (id: string) =>
    setActive((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  const items = [
    { id: "pendente", label: "Pendente" },
    { id: "conciliado", label: "Conciliado" },
    { id: "rejeitado", label: "Rejeitado" },
    { id: "analise", label: "Em análise" },
  ];
  return (
    <>
      {items.map((i) => (
        <Chip
          key={i.id}
          selected={active.has(i.id)}
          onSelect={() => toggle(i.id)}
        >
          {i.label}
        </Chip>
      ))}
    </>
  );
}

export function Removable() {
  const [tags, setTags] = useState([
    "Fornecedor A",
    "Janeiro/2026",
    "NF-e",
    "> R$ 10.000",
  ]);
  return (
    <>
      {tags.map((t) => (
        <Chip
          key={t}
          leadingIcon={<Tag />}
          onRemove={() => setTags((prev) => prev.filter((x) => x !== t))}
        >
          {t}
        </Chip>
      ))}
      {tags.length === 0 && (
        <span className="text-sm text-muted-foreground">
          Sem tags aplicadas.
        </span>
      )}
    </>
  );
}

export function SelectableAndRemovable() {
  const [selected, setSelected] = useState(true);
  const [visible, setVisible] = useState(true);
  if (!visible) {
    return (
      <button
        type="button"
        className="text-sm text-muted-foreground underline"
        onClick={() => setVisible(true)}
      >
        Recolocar
      </button>
    );
  }
  return (
    <Chip
      leadingIcon={<Clock />}
      selected={selected}
      onSelect={setSelected}
      onRemove={() => setVisible(false)}
    >
      Últimos 30 dias
    </Chip>
  );
}

export function Sizes() {
  return (
    <>
      <Chip size="sm" leadingIcon={<Check />}>
        sm
      </Chip>
      <Chip size="md" leadingIcon={<Check />}>
        md
      </Chip>
    </>
  );
}

export function Disabled() {
  return (
    <>
      <Chip disabled onSelect={() => {}}>
        Indisponível
      </Chip>
      <Chip disabled onRemove={() => {}}>
        Indisponível
      </Chip>
      <Chip disabled selected onSelect={() => {}}>
        Travado
      </Chip>
    </>
  );
}

// ─── #168 — variant + appearance API (ADR-003) ────────────────────────

const VARIANTS = ["neutral", "brand", "accent", "success", "warning", "danger", "info"] as const;

/** Variant × appearance matrix em estado resting (selected: false). */
export function VariantMatrix() {
  return (
    <div className="grid gap-3" style={{ gridTemplateColumns: "auto repeat(3, minmax(120px, 1fr))" }}>
      <div />
      <div className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">soft</div>
      <div className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">outline</div>
      <div className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">solid</div>
      {VARIANTS.map((v) => (
        <Fragment key={v}>
          <div className="text-[12px] font-medium text-muted-foreground self-center">{v}</div>
          <div className="self-center"><Chip variant={v} appearance="soft">{v}</Chip></div>
          <div className="self-center"><Chip variant={v} appearance="outline">{v}</Chip></div>
          <div className="self-center"><Chip variant={v} appearance="solid">{v}</Chip></div>
        </Fragment>
      ))}
    </div>
  );
}

/** Cada variant em selected: true (sempre solid per ADR-003 decisão 5). */
export function VariantSelected() {
  return (
    <div className="flex flex-wrap gap-2">
      {VARIANTS.map((v) => (
        <Chip key={v} variant={v} selected onSelect={() => {}}>{v}</Chip>
      ))}
    </div>
  );
}

/**
 * Demo da asymmetry appearance × selected (ADR-003 decisão 5).
 *
 * 3 chips com appearance distintas — todos viram solid quando selected.
 */
export function AppearanceSelectedAsymmetry() {
  return (
    <div className="grid gap-3">
      {(["soft", "outline", "solid"] as const).map((a) => (
        <div key={a} className="flex items-center gap-3">
          <div className="w-16 text-[12px] font-medium text-muted-foreground">{a}</div>
          <Chip variant="warning" appearance={a} onSelect={() => {}}>resting</Chip>
          <span className="text-[11px] text-muted-foreground">→ selected:</span>
          <Chip variant="warning" appearance={a} selected onSelect={() => {}}>solid (ignora `{a}`)</Chip>
        </div>
      ))}
    </div>
  );
}

/** Use cases reais por variant. */
export function SemanticUseCases() {
  return (
    <div className="grid gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-[12px] text-muted-foreground w-28">Status:</span>
        <Chip variant="success" selected onSelect={() => {}}>Conciliado</Chip>
        <Chip variant="warning" selected onSelect={() => {}}>Em análise</Chip>
        <Chip variant="danger" selected onSelect={() => {}}>Rejeitado</Chip>
        <Chip variant="info" selected onSelect={() => {}}>Aguardando</Chip>
        <Chip variant="neutral" selected onSelect={() => {}}>Arquivado</Chip>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-[12px] text-muted-foreground w-28">Filtros:</span>
        <Chip variant="brand" onSelect={() => {}}>Não conciliadas</Chip>
        <Chip variant="success" onSelect={() => {}}>Receitas</Chip>
        <Chip variant="danger" onSelect={() => {}}>Despesas</Chip>
        <Chip variant="accent" onSelect={() => {}}>Acentuado</Chip>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-[12px] text-muted-foreground w-28">Tags (soft):</span>
        <Chip variant="brand" appearance="soft">NF-e</Chip>
        <Chip variant="accent" appearance="soft">SPED</Chip>
        <Chip variant="success" appearance="soft">Reconciliado</Chip>
        <Chip variant="warning" appearance="soft">Pendente</Chip>
        <Chip variant="info" appearance="soft">CFOP 5102</Chip>
      </div>
    </div>
  );
}
