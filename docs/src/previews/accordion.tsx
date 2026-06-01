import * as React from "react";

import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@ds/components/accordion";

// ──────────────────────────────────────────────────────────────────
// Shared fixture
// ──────────────────────────────────────────────────────────────────

const FAQ = [
  {
    value: "policy",
    trigger: "Como funciona a política de reembolso?",
    content:
      "Reembolsos disparados em até 30 dias após o pagamento são processados em D+2. Após 30 dias, retornamos ERR422_REFUND_WINDOW_EXCEEDED e abrimos ticket manual para análise.",
  },
  {
    value: "idempotency",
    trigger: "Posso reprocessar a mesma chamada com segurança?",
    content:
      "Sim. Toda mutação de estado exige o header Idempotency-Key; uma segunda chamada com a mesma key + payload retorna 200 cacheado. Payload divergente para a mesma key retorna 409.",
  },
  {
    value: "audit",
    trigger: "Onde fica o trilho de auditoria?",
    content:
      "Cada reembolso emite refund.created em CloudEvents (idempotencykey + entity_id em UUID v7). O agregado é persistido via event sourcing — replay completo a partir do log.",
  },
];

// ──────────────────────────────────────────────────────────────────
// Padrão — bordered, single, collapsible
// ──────────────────────────────────────────────────────────────────

export function BasicRow(): React.ReactElement {
  return (
    <div className="flex justify-center py-6">
      <Accordion
        type="single"
        collapsible
        className="w-full max-w-[480px] overflow-hidden rounded-lg border border-border bg-card"
      >
        {FAQ.map((it) => (
          <AccordionItem key={it.value} value={it.value} variant="bordered">
            <AccordionTrigger>{it.trigger}</AccordionTrigger>
            <AccordionContent>{it.content}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────
// Variantes — bordered vs plain
// ──────────────────────────────────────────────────────────────────

export function VariantsRow(): React.ReactElement {
  return (
    <div className="grid grid-cols-1 gap-6 py-6 lg:grid-cols-2">
      <div className="flex flex-col gap-2">
        <span className="font-sans text-xs font-medium uppercase tracking-wide text-muted-foreground">
          bordered
        </span>
        <Accordion
          type="single"
          collapsible
          className="overflow-hidden rounded-lg border border-border bg-card"
        >
          {FAQ.slice(0, 2).map((it) => (
            <AccordionItem key={it.value} value={it.value} variant="bordered">
              <AccordionTrigger>{it.trigger}</AccordionTrigger>
              <AccordionContent>{it.content}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
      <div className="flex flex-col gap-2">
        <span className="font-sans text-xs font-medium uppercase tracking-wide text-muted-foreground">
          plain
        </span>
        <Accordion type="single" collapsible>
          {FAQ.slice(0, 2).map((it) => (
            <AccordionItem key={it.value} value={it.value} variant="plain">
              <AccordionTrigger>{it.trigger}</AccordionTrigger>
              <AccordionContent>{it.content}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────
// Multiple — várias seções abertas simultaneamente
// ──────────────────────────────────────────────────────────────────

export function MultipleRow(): React.ReactElement {
  return (
    <div className="flex justify-center py-6">
      <Accordion
        type="multiple"
        defaultValue={["policy", "audit"]}
        className="w-full max-w-[480px] overflow-hidden rounded-lg border border-border bg-card"
      >
        {FAQ.map((it) => (
          <AccordionItem key={it.value} value={it.value} variant="bordered">
            <AccordionTrigger>{it.trigger}</AccordionTrigger>
            <AccordionContent>{it.content}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────
// Disabled — item bloqueado por permissão
// ──────────────────────────────────────────────────────────────────

export function DisabledRow(): React.ReactElement {
  return (
    <div className="flex justify-center py-6">
      <Accordion
        type="single"
        collapsible
        className="w-full max-w-[480px] overflow-hidden rounded-lg border border-border bg-card"
      >
        <AccordionItem value="active" variant="bordered">
          <AccordionTrigger>Item disponível</AccordionTrigger>
          <AccordionContent>
            Este item está ativo e pode ser expandido pelo teclado ou mouse.
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="locked" variant="bordered" disabled>
          <AccordionTrigger>Item bloqueado (sem permissão)</AccordionTrigger>
          <AccordionContent>
            Conteúdo nunca exibido enquanto o item estiver disabled.
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="active-2" variant="bordered">
          <AccordionTrigger>Outro item disponível</AccordionTrigger>
          <AccordionContent>
            O foco pula o item bloqueado durante a navegação por teclado.
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────
// Controlled — value externo + onValueChange
// ──────────────────────────────────────────────────────────────────

export function ControlledRow(): React.ReactElement {
  const [value, setValue] = React.useState<string>("policy");
  return (
    <div className="flex flex-col items-center gap-3 py-6">
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <span className="font-medium">value:</span>
        <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-[11px] text-fg">
          {value || "(none)"}
        </code>
      </div>
      <Accordion
        type="single"
        collapsible
        value={value}
        onValueChange={setValue}
        className="w-full max-w-[480px] overflow-hidden rounded-lg border border-border bg-card"
      >
        {FAQ.map((it) => (
          <AccordionItem key={it.value} value={it.value} variant="bordered">
            <AccordionTrigger>{it.trigger}</AccordionTrigger>
            <AccordionContent>{it.content}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}
