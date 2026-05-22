import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { Filter, Tag, Clock, Check } from "lucide-react";

import { Chip } from "./index";

const meta: Meta<typeof Chip> = {
  title: "Components/Chip",
  component: Chip,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "Item compacto para **filtros** (toggle com `onSelect`), **tags removíveis** (`onRemove`) ou **rótulos informacionais**. Acessível por teclado quando interativo.",
      },
    },
  },
  argTypes: {
    size: { control: "radio", options: ["sm", "md"] },
  },
};
export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { children: "Etiqueta" },
};

export const AsFilter: Story = {
  render: function AsFilterStory() {
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
  },
};

export const FilterGroup: Story = {
  render: function FilterGroupStory() {
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
      <div className="flex flex-wrap gap-2">
        {items.map((i) => (
          <Chip
            key={i.id}
            selected={active.has(i.id)}
            onSelect={() => toggle(i.id)}
          >
            {i.label}
          </Chip>
        ))}
      </div>
    );
  },
};

export const Removable: Story = {
  render: function RemovableStory() {
    const [tags, setTags] = useState([
      "Fornecedor A",
      "Janeiro/2026",
      "NF-e",
    ]);
    return (
      <div className="flex flex-wrap gap-2">
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
            Nenhuma tag aplicada.
          </span>
        )}
      </div>
    );
  },
};

export const SelectableAndRemovable: Story = {
  render: function BothStory() {
    const [selected, setSelected] = useState(true);
    const [visible, setVisible] = useState(true);
    if (!visible) {
      return (
        <button
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
  },
};

export const Sizes: Story = {
  render: () => (
    <div className="flex items-center gap-3">
      <Chip size="sm" leadingIcon={<Check />}>
        sm
      </Chip>
      <Chip size="md" leadingIcon={<Check />}>
        md
      </Chip>
    </div>
  ),
};

export const Disabled: Story = {
  render: () => (
    <div className="flex gap-3">
      <Chip disabled onSelect={() => {}}>
        Indisponível
      </Chip>
      <Chip disabled onRemove={() => {}}>
        Indisponível
      </Chip>
      <Chip disabled selected onSelect={() => {}}>
        Travado
      </Chip>
    </div>
  ),
};
