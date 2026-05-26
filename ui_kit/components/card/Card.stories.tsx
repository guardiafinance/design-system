import type { Meta, StoryObj } from "@storybook/react";

import { Card } from "./index";
import { Button } from "../button";
import { Badge } from "../badge";

const meta: Meta<typeof Card> = {
  title: "Components/Card",
  component: Card,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "Container semântico para agrupar conteúdo relacionado. Suporta `variant` (default · elevated · outlined), `padding`, modo `interactive` e composição via `Card.Header`, `Card.Title`, `Card.Description`, `Card.Content`, `Card.Footer`. Apenas tokens semânticos — zero cor hardcoded.",
      },
    },
  },
  argTypes: {
    variant: { control: "radio", options: ["default", "elevated", "outlined"] },
    padding: { control: "radio", options: ["none", "sm", "md", "lg"] },
    interactive: { control: "boolean" },
  },
};
export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Card className="w-[360px]">
      <Card.Header>
        <Card.Title>Resumo do mês</Card.Title>
        <Card.Description>Janeiro/2026 · 127 lançamentos</Card.Description>
      </Card.Header>
      <Card.Content>
        <p className="text-sm">
          Lançamentos conciliados automaticamente: 96. Pendentes de revisão: 31.
        </p>
      </Card.Content>
      <Card.Footer className="justify-end">
        <Button>Ver detalhes</Button>
      </Card.Footer>
    </Card>
  ),
};

export const Variants: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Três níveis visuais de ênfase. `default` é o baseline (shadow-sm); `elevated` sobe a hierarquia (shadow-md); `outlined` reforça a borda e remove o shadow.",
      },
    },
  },
  render: () => (
    <div className="grid gap-4 md:grid-cols-3">
      {(["default", "elevated", "outlined"] as const).map((v) => (
        <Card key={v} variant={v}>
          <Card.Header>
            <Card.Title>{v}</Card.Title>
            <Card.Description>variant=&quot;{v}&quot;</Card.Description>
          </Card.Header>
          <Card.Content>
            <p className="text-sm">
              Conteúdo do card com variante <code>{v}</code>.
            </p>
          </Card.Content>
        </Card>
      ))}
    </div>
  ),
};

export const Compact: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "`padding=\"sm\"` para cards densos sem subcomponentes — útil em grids de KPIs.",
      },
    },
  },
  render: () => (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
      {[
        { label: "Receitas", value: "R$ 142.380", trend: "+8,4%" },
        { label: "Despesas", value: "R$ 87.211", trend: "-2,1%" },
        { label: "A conciliar", value: "31", trend: "-12" },
        { label: "NF-e emitidas", value: "412", trend: "+27" },
      ].map((kpi) => (
        <Card key={kpi.label} padding="sm" variant="outlined">
          <div className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
            {kpi.label}
          </div>
          <div className="mt-1 text-2xl font-semibold leading-none">{kpi.value}</div>
          <div className="mt-2 text-xs text-muted-foreground">{kpi.trend}</div>
        </Card>
      ))}
    </div>
  ),
};

export const Interactive: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "`interactive=true` adiciona `cursor-pointer`, foco visível e `hover:shadow-md`. Combine com `onClick` para card-link / card-ação. O `tabIndex=0` é injetado automaticamente.",
      },
    },
  },
  render: () => (
    <Card
      interactive
      onClick={() => alert("Card clicado!")}
      className="w-[360px]"
    >
      <Card.Header>
        <Card.Title>Abrir relatório completo</Card.Title>
        <Card.Description>Reconciliação · Janeiro/2026</Card.Description>
      </Card.Header>
      <Card.Content>
        <p className="text-sm">
          Tab para focar · Enter ou clique para abrir.
        </p>
      </Card.Content>
    </Card>
  ),
};

export const WithBadge: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Composição com Badge no header — padrão usado em cards de fluxo (status pipeline).",
      },
    },
  },
  render: () => (
    <Card className="w-[360px]" variant="elevated">
      <Card.Header>
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1.5">
            <Card.Title>Fornecedor A — NF-e #4720</Card.Title>
            <Card.Description>Recebida em 12/01/2026</Card.Description>
          </div>
          <Badge variant="warning">Pendente</Badge>
        </div>
      </Card.Header>
      <Card.Content>
        <dl className="grid grid-cols-2 gap-2 text-sm">
          <dt className="text-muted-foreground">Valor</dt>
          <dd className="text-right font-medium">R$ 12.840,00</dd>
          <dt className="text-muted-foreground">CFOP</dt>
          <dd className="text-right font-medium">5102</dd>
        </dl>
      </Card.Content>
      <Card.Footer className="justify-end gap-2">
        <Button variant="outline">Rejeitar</Button>
        <Button>Conciliar</Button>
      </Card.Footer>
    </Card>
  ),
};

export const Simple: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Card sem subcomponentes — útil quando o conteúdo é uma única linha ou bloco. `padding=\"sm\"` controla o espaçamento interno.",
      },
    },
  },
  args: {
    padding: "sm",
    children: "Conteúdo simples, sem header ou footer.",
  },
};
