import { Fragment } from "react";

import { Card } from "@ds/components/card";
import { Badge } from "@ds/components/badge";
import { Button } from "@ds/components/button";

/** Card estático com header + content + footer. */
export function Anatomy() {
  return (
    <Card className="w-full max-w-[360px]">
      <Card.Header>
        <Card.Title>Resumo do mês</Card.Title>
        <Card.Description>Janeiro/2026 · 127 lançamentos</Card.Description>
      </Card.Header>
      <Card.Content>
        <p className="text-sm">
          Conciliados: 96. Pendentes: 31. Próxima rodada automática em 4 horas.
        </p>
      </Card.Content>
      <Card.Footer className="justify-end">
        <Button>Ver detalhes</Button>
      </Card.Footer>
    </Card>
  );
}

const VARIANTS = ["default", "elevated", "outlined"] as const;

/** Matrix 1×3: três variantes lado-a-lado para validar hierarquia visual. */
export function VariantsRow() {
  return (
    <div className="grid w-full gap-4 md:grid-cols-3">
      {VARIANTS.map((v) => (
        <Fragment key={v}>
          <Card variant={v}>
            <Card.Header>
              <Card.Title>{v}</Card.Title>
              <Card.Description>variant=&quot;{v}&quot;</Card.Description>
            </Card.Header>
            <Card.Content>
              <p className="text-sm">
                Conteúdo do card com variante <code className="inline">{v}</code>.
              </p>
            </Card.Content>
          </Card>
        </Fragment>
      ))}
    </div>
  );
}

/** Cards densos sem subcomponentes — grid de KPIs. */
export function Compact() {
  const items = [
    { label: "Receitas", value: "R$ 142.380", trend: "+8,4%" },
    { label: "Despesas", value: "R$ 87.211", trend: "-2,1%" },
    { label: "A conciliar", value: "31", trend: "-12" },
    { label: "NF-e emitidas", value: "412", trend: "+27" },
  ];
  return (
    <div className="grid w-full grid-cols-2 gap-3 md:grid-cols-4">
      {items.map((kpi) => (
        <Card key={kpi.label} padding="sm" variant="outlined">
          <div className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
            {kpi.label}
          </div>
          <div className="mt-1 text-2xl font-semibold leading-none">{kpi.value}</div>
          <div className="mt-2 text-xs text-muted-foreground">{kpi.trend}</div>
        </Card>
      ))}
    </div>
  );
}

/** Card clicável com foco visível e hover affordance. */
export function Interactive() {
  return (
    <Card
      interactive
      onClick={() => {}}
      className="w-full max-w-[360px]"
    >
      <Card.Header>
        <Card.Title>Abrir relatório</Card.Title>
        <Card.Description>Reconciliação · Janeiro/2026</Card.Description>
      </Card.Header>
      <Card.Content>
        <p className="text-sm">Tab para focar · Enter ou clique para abrir.</p>
      </Card.Content>
    </Card>
  );
}

/** Composição com Badge no header — padrão de fluxo. */
export function WithBadge() {
  return (
    <Card className="w-full max-w-[360px]" variant="elevated">
      <Card.Header>
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1.5">
            <Card.Title>NF-e #4720</Card.Title>
            <Card.Description>Fornecedor A · 12/01/2026</Card.Description>
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
  );
}
