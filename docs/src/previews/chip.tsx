import { useState } from "react";
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
