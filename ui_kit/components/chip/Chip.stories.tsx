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

// ─── #168 — variant + appearance API (ADR-003) ───────────────────────────

const VARIANTS = ["neutral", "brand", "accent", "success", "warning", "danger", "info"] as const;
const APPEARANCES = ["soft", "outline", "solid"] as const;

/**
 * Matrix: 7 variants × 3 appearances visíveis em estado resting (selected: false).
 *
 * Útil para validação visual e snapshot baseline. Cada coluna = um `appearance`,
 * cada linha = um `variant`. A célula `brand × outline` é o default que preserva
 * backward-compat com chips pre-#168.
 */
export const Matrix: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Matriz 7×3 (variant × appearance) com `selected: false`. Use os controles de tema do Storybook para validar light + dark.",
      },
    },
  },
  render: () => (
    <div className="grid gap-3" style={{ gridTemplateColumns: `auto repeat(${APPEARANCES.length}, minmax(120px, 1fr))` }}>
      <div />
      {APPEARANCES.map((a) => (
        <div key={a} className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">{a}</div>
      ))}
      {VARIANTS.map((v) => (
        <>
          <div key={`${v}-label`} className="text-[12px] font-medium text-muted-foreground self-center">{v}</div>
          {APPEARANCES.map((a) => (
            <div key={`${v}-${a}`} className="self-center">
              <Chip variant={v} appearance={a}>{v}</Chip>
            </div>
          ))}
        </>
      ))}
    </div>
  ),
};

/**
 * Matrix selected: 7 variants em estado `selected: true`.
 *
 * Por ADR-003 decisão 5, **selected sempre vence → solid**, então `appearance`
 * é ignorado. Esta story mostra o look efetivo. Validar contraste WCAG AA
 * em light + dark.
 */
export const MatrixSelected: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Cada variant em `selected: true`. ADR-003 decisão 5: `selected` força `solid` regardless do `appearance`. Esta é a única forma desses chips em estado ativo.",
      },
    },
  },
  render: () => (
    <div className="flex flex-wrap gap-2">
      {VARIANTS.map((v) => (
        <Chip key={v} variant={v} selected onSelect={() => {}}>
          {v}
        </Chip>
      ))}
    </div>
  ),
};

/**
 * Asymmetry demo: appearance × selected interaction.
 *
 * Esta story documenta visualmente a regra que pode surpreender consumers
 * (ADR-003 decisão 5): quando você passa `selected: true`, o chip ignora o
 * valor de `appearance` e renderiza como solid. As 3 linhas abaixo passam
 * appearance diferentes mas **renderizam idênticas** quando selected.
 *
 * O consumer's `appearance` choice controla **apenas** o estado resting
 * (`selected: false`).
 */
export const AppearanceSelectedAsymmetry: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "**Asymmetry warning (ADR-003 decisão 5):** quando `selected: true`, o `appearance` é IGNORADO e o chip renderiza sempre como solid. As 3 linhas abaixo passam appearances diferentes mas renderizam idênticas. Consumer's `appearance` controla apenas o estado resting (selected: false).",
      },
    },
  },
  render: () => (
    <div className="grid gap-4">
      {APPEARANCES.map((a) => (
        <div key={a} className="flex items-center gap-4">
          <div className="w-20 text-[12px] font-medium text-muted-foreground">{a}</div>
          <Chip variant="warning" appearance={a} onSelect={() => {}}>
            resting
          </Chip>
          <span className="text-[11px] text-muted-foreground">+ selected →</span>
          <Chip variant="warning" appearance={a} selected onSelect={() => {}}>
            selected (ignora `{a}`)
          </Chip>
        </div>
      ))}
    </div>
  ),
};

/**
 * Use cases reais por variant. Exemplo concreto de cada cor semântica
 * aplicada a um chip-tag (selected: false, outline) e a um chip-status
 * (selected: true).
 */
export const SemanticUseCases: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Cada variant com um use case típico: filtros, status de pipeline, severidade, categorização fiscal/financeira.",
      },
    },
  },
  render: () => (
    <div className="grid gap-4">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-[12px] text-muted-foreground w-32">Status (selected):</span>
        <Chip variant="success" selected onSelect={() => {}}>Conciliado</Chip>
        <Chip variant="warning" selected onSelect={() => {}}>Em análise</Chip>
        <Chip variant="danger" selected onSelect={() => {}}>Rejeitado</Chip>
        <Chip variant="info" selected onSelect={() => {}}>Aguardando</Chip>
        <Chip variant="neutral" selected onSelect={() => {}}>Arquivado</Chip>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-[12px] text-muted-foreground w-32">Filtros (outline):</span>
        <Chip variant="brand" onSelect={() => {}}>Não conciliadas</Chip>
        <Chip variant="success" onSelect={() => {}}>Receitas</Chip>
        <Chip variant="danger" onSelect={() => {}}>Despesas</Chip>
        <Chip variant="accent" onSelect={() => {}}>Acentuado</Chip>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-[12px] text-muted-foreground w-32">Tags (soft):</span>
        <Chip variant="brand" appearance="soft">NF-e</Chip>
        <Chip variant="accent" appearance="soft">SPED</Chip>
        <Chip variant="success" appearance="soft">Reconciliado</Chip>
        <Chip variant="warning" appearance="soft">Pendente</Chip>
        <Chip variant="info" appearance="soft">CFOP 5102</Chip>
      </div>
    </div>
  ),
};
