import { AgentCard, type AgentStatus, AGENT_STATUS_LABELS } from "@ds/components/agent-card";
import { Button } from "@ds/components/button";

function IsacBody() {
  return (
    <>
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

export function BasicRow() {
  return (
    <div className="w-full max-w-sm">
      <AgentCard status="active">
        <AgentCard.Header>
          <AgentCard.Avatar name="Isac" />
          <div>
            <AgentCard.Name>Isac</AgentCard.Name>
            <AgentCard.Role>Assistente contábil</AgentCard.Role>
          </div>
          <AgentCard.Status />
        </AgentCard.Header>
        <IsacBody />
      </AgentCard>
    </div>
  );
}

export function StatusesRow() {
  return (
    <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
        </AgentCard>
      ))}
    </div>
  );
}

export function VariantsRow() {
  return (
    <div className="grid w-full grid-cols-1 gap-4 lg:grid-cols-3">
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
  );
}

export function WithImageRow() {
  return (
    <div className="w-full max-w-sm">
      <AgentCard status="active">
        <AgentCard.Header>
          <AgentCard.Avatar name="Ana Reis" src="https://i.pravatar.cc/96?img=47" />
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
  );
}

export function InteractiveRow() {
  return (
    <div className="w-full max-w-sm">
      <AgentCard
        status="paused"
        variant="elevated"
        interactive
        onClick={() => {}}
        aria-label="Abrir detalhes do agente Isac"
      >
        <AgentCard.Header>
          <AgentCard.Avatar name="Isac" />
          <div>
            <AgentCard.Name>Isac</AgentCard.Name>
            <AgentCard.Role>Assistente contábil</AgentCard.Role>
          </div>
          <AgentCard.Status />
        </AgentCard.Header>
        <AgentCard.Description>
          Card inteiro clicável — foco visível e ativação por Enter/Espaço.
        </AgentCard.Description>
      </AgentCard>
    </div>
  );
}

export function FooterRow() {
  return (
    <div className="w-full max-w-sm">
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
  );
}
