import {
  ArrowLeftRight,
  FileText,
  LayoutDashboard,
  LineChart,
  ReceiptText,
} from "lucide-react";

import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  TabsBadge,
} from "@ds/components/tabs";

function Panel({ title, body }: { title: string; body: string }) {
  return (
    <div className="mt-2 rounded-md border border-border p-4 text-sm">
      <p className="font-medium text-foreground">{title}</p>
      <p className="mt-1 text-muted-foreground">{body}</p>
    </div>
  );
}

export function UnderlineRow() {
  return (
    <Tabs defaultValue="lanc" className="w-full">
      <TabsList>
        <TabsTrigger value="visao">
          <LayoutDashboard className="h-4 w-4" />
          Visão geral
        </TabsTrigger>
        <TabsTrigger value="lanc">
          <FileText className="h-4 w-4" />
          Lançamentos
          <TabsBadge>248</TabsBadge>
        </TabsTrigger>
        <TabsTrigger value="conc">
          <ArrowLeftRight className="h-4 w-4" />
          Conciliação
          <TabsBadge>11</TabsBadge>
        </TabsTrigger>
        <TabsTrigger value="fisc">
          <ReceiptText className="h-4 w-4" />
          Fiscal
        </TabsTrigger>
        <TabsTrigger value="rel">
          <LineChart className="h-4 w-4" />
          Relatórios
        </TabsTrigger>
      </TabsList>
      <TabsContent value="visao">
        <Panel title="Visão geral" body="KPIs e atalhos da operação." />
      </TabsContent>
      <TabsContent value="lanc">
        <Panel title="Lançamentos" body="248 lançamentos em aberto." />
      </TabsContent>
      <TabsContent value="conc">
        <Panel title="Conciliação" body="11 itens aguardando casamento." />
      </TabsContent>
      <TabsContent value="fisc">
        <Panel title="Fiscal" body="Notas e obrigações do período." />
      </TabsContent>
      <TabsContent value="rel">
        <Panel title="Relatórios" body="Exportações e visões salvas." />
      </TabsContent>
    </Tabs>
  );
}

export function PillsRow() {
  return (
    <Tabs variant="pills" defaultValue="30d" className="w-fit">
      <TabsList>
        <TabsTrigger value="hoje">Hoje</TabsTrigger>
        <TabsTrigger value="7d">7 dias</TabsTrigger>
        <TabsTrigger value="30d">30 dias</TabsTrigger>
        <TabsTrigger value="ano">Este ano</TabsTrigger>
      </TabsList>
      <TabsContent value="hoje">
        <Panel title="Hoje" body="Janela do dia em curso." />
      </TabsContent>
      <TabsContent value="7d">
        <Panel title="7 dias" body="Últimos 7 dias." />
      </TabsContent>
      <TabsContent value="30d">
        <Panel title="30 dias" body="Últimos 30 dias." />
      </TabsContent>
      <TabsContent value="ano">
        <Panel title="Este ano" body="Acumulado do ano." />
      </TabsContent>
    </Tabs>
  );
}

export function BoxedRow() {
  return (
    <Tabs variant="boxed" defaultValue="json" className="w-fit">
      <TabsList>
        <TabsTrigger value="json">JSON</TabsTrigger>
        <TabsTrigger value="yaml">YAML</TabsTrigger>
        <TabsTrigger value="curl">cURL</TabsTrigger>
        <TabsTrigger value="node">Node.js</TabsTrigger>
      </TabsList>
      <TabsContent value="json">
        <Panel title="JSON" body="Payload em JSON." />
      </TabsContent>
      <TabsContent value="yaml">
        <Panel title="YAML" body="Payload em YAML." />
      </TabsContent>
      <TabsContent value="curl">
        <Panel title="cURL" body="Snippet cURL." />
      </TabsContent>
      <TabsContent value="node">
        <Panel title="Node.js" body="Snippet Node.js." />
      </TabsContent>
    </Tabs>
  );
}

export function SizesRow() {
  return (
    <div className="flex flex-col gap-5">
      <Tabs size="sm" defaultValue="hoje" className="w-fit">
        <TabsList>
          <TabsTrigger value="hoje">Hoje</TabsTrigger>
          <TabsTrigger value="7d">7 dias</TabsTrigger>
          <TabsTrigger value="30d">30 dias</TabsTrigger>
          <TabsTrigger value="ano">Este ano</TabsTrigger>
        </TabsList>
        <TabsContent value="hoje">
          <Panel title="sm · underline" body="text-[13px] · py-2 · px-3" />
        </TabsContent>
        <TabsContent value="7d">
          <Panel title="—" body="—" />
        </TabsContent>
        <TabsContent value="30d">
          <Panel title="—" body="—" />
        </TabsContent>
        <TabsContent value="ano">
          <Panel title="—" body="—" />
        </TabsContent>
      </Tabs>

      <Tabs size="sm" variant="pills" defaultValue="hoje" className="w-fit">
        <TabsList>
          <TabsTrigger value="hoje">Hoje</TabsTrigger>
          <TabsTrigger value="7d">7 dias</TabsTrigger>
          <TabsTrigger value="30d">30 dias</TabsTrigger>
          <TabsTrigger value="ano">Este ano</TabsTrigger>
        </TabsList>
        <TabsContent value="hoje">
          <Panel title="sm · pills" body="text-[12.5px] · py-[5px] · px-3" />
        </TabsContent>
        <TabsContent value="7d">
          <Panel title="—" body="—" />
        </TabsContent>
        <TabsContent value="30d">
          <Panel title="—" body="—" />
        </TabsContent>
        <TabsContent value="ano">
          <Panel title="—" body="—" />
        </TabsContent>
      </Tabs>
    </div>
  );
}

export function DisabledRow() {
  return (
    <Tabs defaultValue="a" className="w-full max-w-[480px]">
      <TabsList>
        <TabsTrigger value="a">Ativos</TabsTrigger>
        <TabsTrigger value="b">Arquivados</TabsTrigger>
        <TabsTrigger value="c" disabled>
          Em migração
        </TabsTrigger>
      </TabsList>
      <TabsContent value="a">
        <Panel title="Ativos" body="Itens em operação." />
      </TabsContent>
      <TabsContent value="b">
        <Panel title="Arquivados" body="Itens arquivados." />
      </TabsContent>
      <TabsContent value="c">
        <Panel title="Em migração" body="—" />
      </TabsContent>
    </Tabs>
  );
}
