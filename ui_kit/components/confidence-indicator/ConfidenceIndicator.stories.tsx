import type { Meta, StoryObj } from "@storybook/react";
import { Bot, Check, X } from "lucide-react";

import { ConfidenceIndicator } from "./index";

const meta: Meta<typeof ConfidenceIndicator> = {
  title: "Components/ConfidenceIndicator",
  component: ConfidenceIndicator,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "Semáforo de confiança para outputs de IA. Comunica o grau de confiança da Guardia em uma decisão de agente — sistema Lighthouse: high (≥ 95 %, auto-aplicado), medium (80–94 %, revisar), low (< 80 %, atenção). Três variantes: `chip`, `bar`, `dot`. Tokens semânticos exclusivamente; `role=\"meter\"` por WAI-ARIA 1.2 §5.3.18.",
      },
    },
  },
  argTypes: {
    variant: { control: "select", options: ["chip", "bar", "dot"] },
    level: { control: "select", options: ["high", "medium", "low"] },
    size: { control: "select", options: ["sm", "md"] },
    value: { control: { type: "range", min: 0, max: 100, step: 1 } },
    showValue: { control: "boolean" },
    label: { control: "text" },
  },
  args: {
    value: 97,
    variant: "chip",
    size: "md",
    showValue: true,
  },
};
export default meta;

type Story = StoryObj<typeof meta>;

// ──────────────────────────────────────────────────────────────────
// Default
// ──────────────────────────────────────────────────────────────────

export const Default: Story = {
  args: { value: 97 },
};

// ──────────────────────────────────────────────────────────────────
// Levels — chip
// ──────────────────────────────────────────────────────────────────

export const Levels: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Três tiers Lighthouse no chip default — verde ≥ 95, amarelo 80–94, vermelho < 80.",
      },
    },
  },
  render: () => (
    <div className="flex flex-wrap items-center gap-3">
      <ConfidenceIndicator level="high" value={97} />
      <ConfidenceIndicator level="medium" value={86} />
      <ConfidenceIndicator level="low" value={62} />
    </div>
  ),
};

// ──────────────────────────────────────────────────────────────────
// Variants — chip / bar / dot
// ──────────────────────────────────────────────────────────────────

export const Variants: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "O mesmo valor escalar em três tratamentos visuais. `chip` (default) é selo compacto; `bar` mostra a magnitude; `dot` é a forma mínima inline.",
      },
    },
  },
  render: () => (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <small className="text-fg-muted">chip</small>
        <div className="flex flex-wrap items-center gap-3">
          <ConfidenceIndicator value={97} variant="chip" />
          <ConfidenceIndicator value={86} variant="chip" />
          <ConfidenceIndicator value={62} variant="chip" />
        </div>
      </div>
      <div className="flex flex-col gap-1">
        <small className="text-fg-muted">bar</small>
        <div className="flex max-w-[320px] flex-col gap-3">
          <ConfidenceIndicator value={97} variant="bar" label="Classificação contábil" />
          <ConfidenceIndicator value={86} variant="bar" label="Categoria fiscal" />
          <ConfidenceIndicator value={62} variant="bar" label="Match fornecedor" />
        </div>
      </div>
      <div className="flex flex-col gap-1">
        <small className="text-fg-muted">dot</small>
        <div className="flex flex-wrap items-center gap-4">
          <ConfidenceIndicator value={97} variant="dot" />
          <ConfidenceIndicator value={86} variant="dot" />
          <ConfidenceIndicator value={62} variant="dot" />
        </div>
      </div>
    </div>
  ),
};

// ──────────────────────────────────────────────────────────────────
// Sizes
// ──────────────────────────────────────────────────────────────────

export const Sizes: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-3">
      <ConfidenceIndicator size="sm" value={97} />
      <ConfidenceIndicator size="md" value={97} />
    </div>
  ),
};

// ──────────────────────────────────────────────────────────────────
// WithoutValue — chip / bar / dot
// ──────────────────────────────────────────────────────────────────

export const WithoutValue: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "`showValue={false}` remove o percentual da DOM visível; `aria-valuenow` permanece para AT.",
      },
    },
  },
  render: () => (
    <div className="flex flex-wrap items-center gap-3">
      <ConfidenceIndicator level="high" showValue={false} />
      <ConfidenceIndicator level="medium" showValue={false} />
      <ConfidenceIndicator level="low" showValue={false} />
    </div>
  ),
};

// ──────────────────────────────────────────────────────────────────
// CustomLabel
// ──────────────────────────────────────────────────────────────────

export const CustomLabel: Story = {
  render: () => (
    <div className="flex max-w-[320px] flex-col gap-3">
      <ConfidenceIndicator value={97} variant="bar" label="Classificação contábil" />
      <ConfidenceIndicator value={86} variant="bar" label="Categoria fiscal" />
      <ConfidenceIndicator value={62} variant="bar" label="Match fornecedor" />
    </div>
  ),
};

// ──────────────────────────────────────────────────────────────────
// InContext — agent-suggestion row mirroring the playground
// ──────────────────────────────────────────────────────────────────

export const InContext: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Uso canônico: chip sm ao lado do nome do agente em uma sugestão de lançamento.",
      },
    },
  },
  render: () => (
    <div className="flex max-w-[560px] items-center gap-3 rounded-md border border-border bg-bg p-3">
      <div className="inline-flex h-12 w-12 items-center justify-center rounded-md bg-guardia-orange-500 text-white">
        <Bot size={22} />
      </div>
      <div className="flex-1">
        <div className="mb-1 flex items-center gap-2">
          <strong className="text-sm text-fg">Sugestão do agente</strong>
          <ConfidenceIndicator level="high" value={97} size="sm" />
        </div>
        <p className="m-0 text-[13px] text-fg-muted">
          Classificar em <b className="text-fg">3.1.4.05 · Despesas com tecnologia</b>
        </p>
      </div>
      <div className="flex gap-1.5">
        <button
          aria-label="Rejeitar"
          className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-border text-fg-muted hover:bg-bg-subtle"
        >
          <X size={14} />
        </button>
        <button
          aria-label="Aceitar"
          className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-guardia-purple-500 text-white hover:bg-guardia-purple-700"
        >
          <Check size={14} />
        </button>
      </div>
    </div>
  ),
};
