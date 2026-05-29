import type { Meta, StoryObj } from "@storybook/react";
import {
  ArrowLeftRight,
  ReceiptText,
  FileBarChart,
  Download,
  ScanSearch,
  Scale,
  FileText,
  RefreshCw,
} from "lucide-react";

import { AgentCard, type AgentStatus, AGENT_STATUS_LABELS } from "./index";
import { Button } from "../button";

const meta: Meta<typeof AgentCard> = {
  title: "Components/AgentCard",
  component: AgentCard,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    // WHY: o pill de status (`AgentCardStatus`) é "badge" semanticamente,
    // mas suas combinações de cor agora respeitam o piso ≥ 4.5:1 em light
    // e dark — verificado por jest-axe (unit) e axe-playwright (storybook
    // test-runner). Em consequência, NÃO existe carve-out de `color-contrast`
    // ao nível do meta. Stories que reusam capability tags (`Badge`) herdam
    // a decisão da própria meta de `Badge.stories.tsx`.
    docs: {
      description: {
        component:
          "Cartão-resumo de um agente de IA no Control Center: identidade (ícone temático + nome + papel), status operacional, KPIs e última execução. Padrão composto (`AgentCard.Header/.Avatar/.Name/.Role/.Status/.Metrics/.Metric/.LastRun/.Footer`). 4 accents (violet/orange/blue/green) e 6 status (idle/working/active/paused/error/offline).",
      },
    },
  },
  argTypes: {
    status: {
      control: "select",
      options: ["idle", "working", "active", "paused", "error", "offline"],
    },
    accent: {
      control: "radio",
      options: ["violet", "orange", "blue", "green"],
    },
    variant: { control: "radio", options: ["default", "elevated", "outlined"] },
    interactive: { control: "boolean" },
  },
};
export default meta;

type Story = StoryObj<typeof meta>;

function Bia() {
  return (
    <>
      <AgentCard.Header>
        <AgentCard.Avatar icon={<ArrowLeftRight aria-hidden="true" />} />
        <div>
          <AgentCard.Name>Bia</AgentCard.Name>
          <AgentCard.Role>Conciliação Bancária</AgentCard.Role>
        </div>
        <AgentCard.Status label="Conciliando" />
      </AgentCard.Header>
      <AgentCard.Metrics>
        <AgentCard.Metric label="conciliado hoje" value="248" />
        <AgentCard.Metric label="taxa match" value="97%" />
        <AgentCard.Metric label="pendentes" value="3" />
      </AgentCard.Metrics>
      <AgentCard.Footer>
        <AgentCard.LastRun>há 2 min</AgentCard.LastRun>
      </AgentCard.Footer>
    </>
  );
}

/* ─── Default ─────────────────────────────────────────────────── */

export const Default: Story = {
  args: { accent: "violet", status: "active" },
  render: (args) => (
    <div className="w-80">
      <AgentCard {...args}>
        <Bia />
      </AgentCard>
    </div>
  ),
};

/* ─── Accents + estados (playground) ─────────────────────────────── */

export const AccentsAndStates: Story = {
  render: () => (
    <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
      <AgentCard accent="violet" status="active">
        <AgentCard.Header>
          <AgentCard.Avatar icon={<ArrowLeftRight aria-hidden="true" />} />
          <div>
            <AgentCard.Name>Bia</AgentCard.Name>
            <AgentCard.Role>Conciliação Bancária</AgentCard.Role>
          </div>
          <AgentCard.Status label="Conciliando" />
        </AgentCard.Header>
        <AgentCard.Metrics>
          <AgentCard.Metric label="conciliado hoje" value="248" />
          <AgentCard.Metric label="taxa match" value="97%" />
          <AgentCard.Metric label="pendentes" value="3" />
        </AgentCard.Metrics>
        <AgentCard.Footer>
          <AgentCard.LastRun>há 2 min</AgentCard.LastRun>
        </AgentCard.Footer>
      </AgentCard>

      <AgentCard accent="orange" status="idle">
        <AgentCard.Header>
          <AgentCard.Avatar icon={<ReceiptText aria-hidden="true" />} />
          <div>
            <AgentCard.Name>Theo</AgentCard.Name>
            <AgentCard.Role>Fiscal Agent</AgentCard.Role>
          </div>
          <AgentCard.Status />
        </AgentCard.Header>
        <AgentCard.Metrics>
          <AgentCard.Metric label="NFes processadas" value="1.2k" />
          <AgentCard.Metric label="erros fiscais" value="0" />
          <AgentCard.Metric label="uptime" value="99.8%" />
        </AgentCard.Metrics>
        <AgentCard.Footer>
          <AgentCard.LastRun>há 14 min</AgentCard.LastRun>
        </AgentCard.Footer>
      </AgentCard>

      <AgentCard accent="blue" status="paused">
        <AgentCard.Header>
          <AgentCard.Avatar icon={<FileBarChart aria-hidden="true" />} />
          <div>
            <AgentCard.Name>Nora</AgentCard.Name>
            <AgentCard.Role>Análise de Balanço</AgentCard.Role>
          </div>
          <AgentCard.Status label="Aguardando dados" />
        </AgentCard.Header>
        <AgentCard.Metrics>
          <AgentCard.Metric label="relatórios" value="12" />
          <AgentCard.Metric label="alertas" value="4" />
          <AgentCard.Metric label="clientes" value="8" />
        </AgentCard.Metrics>
        <AgentCard.Footer>
          <AgentCard.LastRun>há 1h</AgentCard.LastRun>
        </AgentCard.Footer>
      </AgentCard>

      <AgentCard accent="green" status="error">
        <AgentCard.Header>
          <AgentCard.Avatar icon={<Download aria-hidden="true" />} />
          <div>
            <AgentCard.Name>Caio</AgentCard.Name>
            <AgentCard.Role>Coleta Fiscal</AgentCard.Role>
          </div>
          <AgentCard.Status label="Falha no login SEFAZ" />
        </AgentCard.Header>
        <AgentCard.Metrics>
          <AgentCard.Metric label="último sucesso" value="07/03" />
          <AgentCard.Metric label="tentativas" value="3" />
          <AgentCard.Metric label="timeout" value="30s" />
        </AgentCard.Metrics>
        <AgentCard.Footer>
          <AgentCard.LastRun>há 3h</AgentCard.LastRun>
        </AgentCard.Footer>
      </AgentCard>
    </div>
  ),
};

/* ─── Mínimo · sem métricas ──────────────────────────────────────── */

export const MinimalNoMetrics: Story = {
  render: () => (
    <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
      <AgentCard accent="violet" status="active">
        <AgentCard.Header>
          <AgentCard.Avatar icon={<ScanSearch aria-hidden="true" />} />
          <div>
            <AgentCard.Name>Rita</AgentCard.Name>
            <AgentCard.Role>Auditoria</AgentCard.Role>
          </div>
          <AgentCard.Status label="ativa agora" />
        </AgentCard.Header>
      </AgentCard>

      <AgentCard accent="orange" status="idle">
        <AgentCard.Header>
          <AgentCard.Avatar icon={<Scale aria-hidden="true" />} />
          <div>
            <AgentCard.Name>Léo</AgentCard.Name>
            <AgentCard.Role>Tributário</AgentCard.Role>
          </div>
          <AgentCard.Status />
        </AgentCard.Header>
      </AgentCard>

      <AgentCard accent="blue" status="active">
        <AgentCard.Header>
          <AgentCard.Avatar icon={<FileText aria-hidden="true" />} />
          <div>
            <AgentCard.Name>Miro</AgentCard.Name>
            <AgentCard.Role>Faturamento</AgentCard.Role>
          </div>
          <AgentCard.Status />
        </AgentCard.Header>
      </AgentCard>
    </div>
  ),
};

/* ─── Clicável (card como botão) ─────────────────────────────────── */

export const Clickable: Story = {
  render: () => (
    <div className="w-80">
      <AgentCard
        accent="violet"
        status="active"
        variant="elevated"
        interactive
        onClick={() => alert("Abrindo Bia…")}
        aria-label="Abrir detalhes do agente Bia"
      >
        <AgentCard.Header>
          <AgentCard.Avatar icon={<ArrowLeftRight aria-hidden="true" />} />
          <div>
            <AgentCard.Name>Bia</AgentCard.Name>
            <AgentCard.Role>Conciliação · clique para abrir</AgentCard.Role>
          </div>
          <AgentCard.Status label="Conciliando" />
        </AgentCard.Header>
        <AgentCard.Metrics>
          <AgentCard.Metric label="hoje" value="248" />
          <AgentCard.Metric label="match" value="97%" />
        </AgentCard.Metrics>
        <AgentCard.Footer>
          <AgentCard.LastRun>há 2 min</AgentCard.LastRun>
        </AgentCard.Footer>
      </AgentCard>
    </div>
  ),
};

/* ─── Com ações no footer ────────────────────────────────────────── */

export const WithActions: Story = {
  render: () => (
    <div className="w-80">
      <AgentCard accent="green" status="error">
        <AgentCard.Header>
          <AgentCard.Avatar icon={<Download aria-hidden="true" />} />
          <div>
            <AgentCard.Name>Caio</AgentCard.Name>
            <AgentCard.Role>Coleta Fiscal</AgentCard.Role>
          </div>
          <AgentCard.Status label="Falha no login SEFAZ" />
        </AgentCard.Header>
        <AgentCard.Metrics>
          <AgentCard.Metric label="último sucesso" value="07/03" />
          <AgentCard.Metric label="tentativas" value="3" />
        </AgentCard.Metrics>
        <AgentCard.Footer>
          <AgentCard.LastRun>há 3h</AgentCard.LastRun>
          <Button size="sm" variant="outline">
            <RefreshCw aria-hidden="true" />
            Tentar
          </Button>
        </AgentCard.Footer>
      </AgentCard>
    </div>
  ),
};

/* ─── Todos os status (cobertura do enum estendido) ─────────────── */

export const AllStatuses: Story = {
  render: () => (
    <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
      {(Object.keys(AGENT_STATUS_LABELS) as AgentStatus[]).map((status) => (
        <AgentCard key={status} status={status}>
          <AgentCard.Header>
            <AgentCard.Avatar />
            <div>
              <AgentCard.Name>Isac</AgentCard.Name>
              <AgentCard.Role>
                Status: {AGENT_STATUS_LABELS[status]}
              </AgentCard.Role>
            </div>
            <AgentCard.Status />
          </AgentCard.Header>
        </AgentCard>
      ))}
    </div>
  ),
};
