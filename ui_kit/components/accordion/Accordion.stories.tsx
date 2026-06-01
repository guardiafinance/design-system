import * as React from "react";
import type { Meta, StoryObj } from "@storybook/react";

import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "./index";

/**
 * Storybook meta + stories use a synthetic `ShellProps` indirection
 * (instead of `typeof Accordion`) because Radix's `Accordion.Root`
 * exposes a discriminated union (`type: "single" | "multiple"`) whose
 * `args` type collapses to `never` under `Meta<typeof Accordion>`. The
 * shell renders the real Accordion below — Storybook docs autogen
 * still picks up the underlying component from the `subcomponents`
 * map.
 */
interface ShellProps {
  /** Pure docs-only — placeholder so Storybook renders an arg row. */
  placeholder?: never;
}

const meta: Meta<ShellProps> = {
  title: "Components/Accordion",
  component: Accordion as unknown as React.ComponentType<ShellProps>,
  subcomponents: {
    AccordionItem: AccordionItem as React.ComponentType<unknown>,
    AccordionTrigger: AccordionTrigger as React.ComponentType<unknown>,
    AccordionContent: AccordionContent as React.ComponentType<unknown>,
  },
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Grupos de painéis colapsáveis para conteúdo hierárquico (FAQs, configurações por seção, dossiês de auditoria). Base no Radix Accordion; tokens semânticos canônicos; variantes bordered (frame único arredondado) e plain (empilhado sem contorno externo).",
      },
    },
  },
};

export default meta;

type Story = StoryObj<ShellProps>;

const ITEMS = [
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
      "Sim. Toda mutação de estado exige header `Idempotency-Key`; uma segunda chamada com a mesma key + payload retorna 200 cacheado. Payload divergente para a mesma key retorna 409.",
  },
  {
    value: "audit",
    trigger: "Onde fica o trilho de auditoria?",
    content:
      "Cada reembolso emite `refund.created` em CloudEvents (idempotencykey + entity_id em UUID v7). O agregado é persistido via event sourcing — replay completo a partir do log.",
  },
];

// ──────────────────────────────────────────────────────────────────
// Default — variant=bordered, type=single, collapsible
// ──────────────────────────────────────────────────────────────────

export const Default: Story = {
  render: () => (
    <Accordion
      type="single"
      collapsible
      className="w-[420px] overflow-hidden rounded-lg border border-border bg-card"
    >
      {ITEMS.map((it) => (
        <AccordionItem key={it.value} value={it.value} variant="bordered">
          <AccordionTrigger>{it.trigger}</AccordionTrigger>
          <AccordionContent>{it.content}</AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  ),
};

// ──────────────────────────────────────────────────────────────────
// Variants — bordered vs plain side-by-side
// ──────────────────────────────────────────────────────────────────

export const Variants: Story = {
  render: () => (
    <div className="flex flex-col gap-8 sm:flex-row">
      <div className="flex flex-col gap-2">
        <span className="font-sans text-xs font-medium uppercase tracking-wide text-muted-foreground">
          bordered
        </span>
        <Accordion
          type="single"
          collapsible
          className="w-[320px] overflow-hidden rounded-lg border border-border bg-card"
        >
          {ITEMS.slice(0, 2).map((it) => (
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
        <Accordion type="single" collapsible className="w-[320px]">
          {ITEMS.slice(0, 2).map((it) => (
            <AccordionItem key={it.value} value={it.value} variant="plain">
              <AccordionTrigger>{it.trigger}</AccordionTrigger>
              <AccordionContent>{it.content}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </div>
  ),
};

// ──────────────────────────────────────────────────────────────────
// Multiple — várias seções abertas ao mesmo tempo
// ──────────────────────────────────────────────────────────────────

export const Multiple: Story = {
  render: () => (
    <Accordion
      type="multiple"
      defaultValue={["policy", "audit"]}
      className="w-[420px] overflow-hidden rounded-lg border border-border bg-card"
    >
      {ITEMS.map((it) => (
        <AccordionItem key={it.value} value={it.value} variant="bordered">
          <AccordionTrigger>{it.trigger}</AccordionTrigger>
          <AccordionContent>{it.content}</AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  ),
};

// ──────────────────────────────────────────────────────────────────
// Disabled — um item indisponível
// ──────────────────────────────────────────────────────────────────

export const Disabled: Story = {
  render: () => (
    <Accordion
      type="single"
      collapsible
      className="w-[420px] overflow-hidden rounded-lg border border-border bg-card"
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
          Conteúdo nunca exibido enquanto o item estiver `disabled`.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="active-2" variant="bordered">
        <AccordionTrigger>Outro item disponível</AccordionTrigger>
        <AccordionContent>O foco pula o item bloqueado via teclado.</AccordionContent>
      </AccordionItem>
    </Accordion>
  ),
};

// ──────────────────────────────────────────────────────────────────
// Controlled — value externo
// ──────────────────────────────────────────────────────────────────

export const Controlled: Story = {
  render: () => {
    const ControlledShell = (): React.ReactElement => {
      const [value, setValue] = React.useState<string>("policy");
      return (
        <div className="flex w-[420px] flex-col gap-3">
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
            className="overflow-hidden rounded-lg border border-border bg-card"
          >
            {ITEMS.map((it) => (
              <AccordionItem key={it.value} value={it.value} variant="bordered">
                <AccordionTrigger>{it.trigger}</AccordionTrigger>
                <AccordionContent>{it.content}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      );
    };
    return <ControlledShell />;
  },
};
