import type { Meta, StoryObj } from "@storybook/react";

import { AgentCard, type AgentStatus, AGENT_STATUS_LABELS } from "./index";
import { Button } from "../button";

const meta: Meta<typeof AgentCard> = {
  title: "Components/AgentCard",
  component: AgentCard,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "Cartão de identidade de um agente de IA (Guardia-specific). Reúne identidade (avatar + nome + papel), status operacional (`idle · working · active · paused · error · offline`) e capabilities. Padrão composto (`AgentCard.Header/.Avatar/.Name/.Role/.Status/.Description/.Capabilities/.Capability/.Footer`). Apenas tokens semânticos; status usa as cores de sinal da marca.",
      },
    },
  },
  argTypes: {
    status: {
      control: "select",
      options: ["idle", "working", "active", "paused", "error", "offline"],
    },
    variant: { control: "radio", options: ["default", "elevated", "outlined"] },
    interactive: { control: "boolean" },
  },
};
export default meta;

type Story = StoryObj<typeof meta>;

function Isac() {
  return (
    <>
      <AgentCard.Header>
        <AgentCard.Avatar name="Isac" />
        <div>
          <AgentCard.Name>Isac</AgentCard.Name>
          <AgentCard.Role>Assistente contábil</AgentCard.Role>
        </div>
        <AgentCard.Status />
      </AgentCard.Header>
      <AgentCard.Description>
        Concilia lançamentos, audita movimentações e responde dúvidas
        contábeis, financeiras, tributárias e fiscais.
      </AgentCard.Description>
      <AgentCard.Capabilities>
        <AgentCard.Capability>Conciliação</AgentCard.Capability>
        <AgentCard.Capability>Auditoria</AgentCard.Capability>
        <AgentCard.Capability>Relatórios</AgentCard.Capability>
      </AgentCard.Capabilities>
    </>
  );
}

export const Default: Story = {
  args: { status: "active" },
  render: (args) => (
    <div className="w-80">
      <AgentCard {...args}>
        <Isac />
      </AgentCard>
    </div>
  ),
};

export const AllStatuses: Story = {
  render: () => (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {(Object.keys(AGENT_STATUS_LABELS) as AgentStatus[]).map((status) => (
        <AgentCard key={status} status={status}>
          <AgentCard.Header>
            <AgentCard.Avatar name="Isac" />
            <div>
              <AgentCard.Name>Isac</AgentCard.Name>
              <AgentCard.Role>Assistente contábil</AgentCard.Role>
            </div>
            <AgentCard.Status />
          </AgentCard.Header>
          <AgentCard.Description>
            Status atual: {AGENT_STATUS_LABELS[status]}.
          </AgentCard.Description>
        </AgentCard>
      ))}
    </div>
  ),
};

export const Variants: Story = {
  render: () => (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
      {(["default", "elevated", "outlined"] as const).map((variant) => (
        <AgentCard key={variant} variant={variant} status="working">
          <AgentCard.Header>
            <AgentCard.Avatar name="Isac" />
            <div>
              <AgentCard.Name>Isac</AgentCard.Name>
              <AgentCard.Role className="capitalize">{variant}</AgentCard.Role>
            </div>
            <AgentCard.Status />
          </AgentCard.Header>
        </AgentCard>
      ))}
    </div>
  ),
};

export const WithImage: Story = {
  render: () => (
    <div className="w-80">
      <AgentCard status="active">
        <AgentCard.Header>
          <AgentCard.Avatar
            name="Ana Reis"
            src="https://i.pravatar.cc/96?img=47"
          />
          <div>
            <AgentCard.Name>Ana Reis</AgentCard.Name>
            <AgentCard.Role>Agente de cobrança</AgentCard.Role>
          </div>
          <AgentCard.Status />
        </AgentCard.Header>
        <AgentCard.Description>
          Negocia e acompanha recebíveis em atraso.
        </AgentCard.Description>
      </AgentCard>
    </div>
  ),
};

export const Interactive: Story = {
  render: () => (
    <div className="w-80">
      <AgentCard
        status="paused"
        variant="elevated"
        interactive
        onClick={() => alert("Abrir agente Isac")}
        aria-label="Abrir detalhes do agente Isac"
      >
        <Isac />
      </AgentCard>
    </div>
  ),
};

export const WithFooter: Story = {
  render: () => (
    <div className="w-80">
      <AgentCard status="error">
        <AgentCard.Header>
          <AgentCard.Avatar name="Isac" />
          <div>
            <AgentCard.Name>Isac</AgentCard.Name>
            <AgentCard.Role>Assistente contábil</AgentCard.Role>
          </div>
          <AgentCard.Status />
        </AgentCard.Header>
        <AgentCard.Description>
          Falha ao acessar a fonte de dados. Revise a integração e tente
          novamente.
        </AgentCard.Description>
        <AgentCard.Footer>
          <Button size="sm" variant="outline">
            Ver log
          </Button>
          <Button size="sm">Reativar</Button>
        </AgentCard.Footer>
      </AgentCard>
    </div>
  ),
};
