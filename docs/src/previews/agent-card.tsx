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

import { AgentCard } from "@ds/components/agent-card";
import { Button } from "@ds/components/button";

export function BasicRow() {
  return (
    <div className="w-full max-w-sm">
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
    </div>
  );
}

export function AccentsRow() {
  return (
    <div className="grid w-full grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
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
          <AgentCard.Metric label="hoje" value="248" />
          <AgentCard.Metric label="match" value="97%" />
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
          <AgentCard.Metric label="NFes" value="1.2k" />
          <AgentCard.Metric label="erros" value="0" />
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
  );
}

export function MinimalRow() {
  return (
    <div className="grid w-full grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
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
  );
}

export function ClickableRow() {
  return (
    <div className="w-full max-w-sm">
      <AgentCard
        accent="violet"
        status="active"
        variant="elevated"
        interactive
        onClick={() => {}}
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
  );
}

export function ActionsRow() {
  return (
    <div className="w-full max-w-sm">
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
  );
}
