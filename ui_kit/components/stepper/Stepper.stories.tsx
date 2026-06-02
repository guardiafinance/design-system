import type { Meta, StoryObj } from "@storybook/react";
import { CreditCard, FileSpreadsheet, SlidersHorizontal, Eye } from "lucide-react";

import { Stepper, type Step } from "./index";

const meta: Meta<typeof Stepper> = {
  title: "Components/Stepper",
  component: Stepper,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "Indicador de progresso em fluxos multi-etapa. Stepper sinaliza onde o usuário está em uma jornada linear (onboarding, fluxo transacional, processamento longo). Estados: `pending` · `current` · `loading` · `complete` · `error`. Orientações `horizontal`/`vertical` × variantes `numbered`/`iconed`/`compact` × tamanhos `md`/`sm`. Tokens consomem o chain Notion-canonical `--primary` (violet em light, orange em dark) + `--danger*` herdado de ADR-011. Decisões registradas em ADR-020.",
      },
    },
  },
  argTypes: {
    orientation: { control: "radio", options: ["horizontal", "vertical"] },
    variant: { control: "radio", options: ["numbered", "iconed", "compact"] },
    size: { control: "radio", options: ["md", "sm"] },
    activeIndex: { control: { type: "number", min: 0, max: 3 } },
  },
};
export default meta;

type Story = StoryObj<typeof meta>;

const fourSteps: Step[] = [
  { id: "1", title: "Conectar banco", description: "Itaú · Bradesco" },
  { id: "2", title: "Importar lançamentos", description: "OFX · CSV · API" },
  { id: "3", title: "Configurar regras", description: "Auto-classificação" },
  { id: "4", title: "Revisar", description: "Confirmar conciliação" },
];

const iconedSteps: Step[] = [
  { id: "1", title: "Conectar", icon: CreditCard },
  { id: "2", title: "Importar", icon: FileSpreadsheet },
  { id: "3", title: "Regras", icon: SlidersHorizontal },
  { id: "4", title: "Revisar", icon: Eye },
];

// ──────────────────────────────────────────────────────────────────
// Default — horizontal numbered, activeIndex=1
// ──────────────────────────────────────────────────────────────────

export const Default: Story = {
  args: {
    steps: fourSteps,
    activeIndex: 1,
  },
};

// ──────────────────────────────────────────────────────────────────
// Horizontal — alternative active indices
// ──────────────────────────────────────────────────────────────────

export const Horizontal: Story = {
  render: (args) => (
    <div className="flex flex-col gap-8">
      <div>
        <p className="mb-2 text-xs font-semibold text-fg-muted">activeIndex=0</p>
        <Stepper {...args} steps={fourSteps} activeIndex={0} />
      </div>
      <div>
        <p className="mb-2 text-xs font-semibold text-fg-muted">activeIndex=2</p>
        <Stepper {...args} steps={fourSteps} activeIndex={2} />
      </div>
      <div>
        <p className="mb-2 text-xs font-semibold text-fg-muted">activeIndex=3 (último)</p>
        <Stepper {...args} steps={fourSteps} activeIndex={3} />
      </div>
    </div>
  ),
};

// ──────────────────────────────────────────────────────────────────
// Vertical — long flow with descriptions
// ──────────────────────────────────────────────────────────────────

export const Vertical: Story = {
  render: () => (
    <div className="max-w-md">
      <Stepper steps={fourSteps} activeIndex={1} orientation="vertical" />
    </div>
  ),
};

// ──────────────────────────────────────────────────────────────────
// Iconed
// ──────────────────────────────────────────────────────────────────

export const Iconed: Story = {
  render: () => (
    <div className="flex flex-col gap-6">
      <Stepper steps={iconedSteps} activeIndex={1} variant="iconed" />
      <Stepper
        steps={iconedSteps}
        activeIndex={1}
        variant="iconed"
        orientation="vertical"
      />
    </div>
  ),
};

// ──────────────────────────────────────────────────────────────────
// Compact — dot-only indicator
// ──────────────────────────────────────────────────────────────────

export const Compact: Story = {
  render: () => (
    <div className="flex flex-col gap-6">
      <Stepper steps={fourSteps} activeIndex={1} variant="compact" />
      <Stepper steps={fourSteps} activeIndex={2} variant="compact" size="sm" />
      <div className="max-w-sm">
        <Stepper
          steps={fourSteps}
          activeIndex={1}
          variant="compact"
          orientation="vertical"
        />
      </div>
    </div>
  ),
};

// ──────────────────────────────────────────────────────────────────
// States — all 5 in one shot
// ──────────────────────────────────────────────────────────────────

export const States: Story = {
  render: () => (
    <Stepper
      steps={[
        { id: "a", title: "Concluído", description: "Etapa fechada" },
        { id: "b", title: "Em andamento", description: "Você está aqui", state: "current" },
        { id: "c", title: "Processando", description: "Aguardando upload", state: "loading" },
        { id: "d", title: "Falhou", description: "Tente reconectar", state: "error" },
        { id: "e", title: "Pendente", description: "Ainda não começou" },
      ]}
      activeIndex={0}
    />
  ),
  parameters: {
    docs: {
      description: {
        story:
          "Os 5 estados lado a lado. `state` explícito tem prioridade sobre `activeIndex`. `complete` e `current` pintam o connector trailing com `--primary`; `loading` também; `error` mantém connector neutro (a chain quebra ali).",
      },
    },
  },
};

// ──────────────────────────────────────────────────────────────────
// Clickable
// ──────────────────────────────────────────────────────────────────

export const Clickable: Story = {
  render: () => (
    <Stepper
      steps={fourSteps}
      activeIndex={2}
      onStepClick={(index, step) => {
        // Demo handler — Storybook controls panel surfaces the call.
        console.log(`Clicked step ${index}: ${String(step.title)}`);
      }}
    />
  ),
  parameters: {
    docs: {
      description: {
        story:
          "Quando `onStepClick` é passado, steps em `current`, `complete` ou `error` viram `<button>` (hover + focus visíveis); `pending` e `loading` permanecem não clicáveis para evitar pular etapas em fluxos guiados.",
      },
    },
  },
};

// ──────────────────────────────────────────────────────────────────
// Loading
// ──────────────────────────────────────────────────────────────────

export const Loading: Story = {
  render: () => (
    <Stepper
      steps={[
        { id: "1", title: "Upload", description: "248 MB" },
        { id: "2", title: "Processando", description: "Lendo lançamentos…", state: "loading" },
        { id: "3", title: "Match", description: "Aguardando" },
        { id: "4", title: "Revisar" },
      ]}
      activeIndex={1}
    />
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Step `loading` mostra spinner inline com `role="status" aria-label="carregando"`. Ring discreto + cor `--primary` deixa claro que o passo está ativo aguardando processamento assíncrono.',
      },
    },
  },
};

// ──────────────────────────────────────────────────────────────────
// Sizes
// ──────────────────────────────────────────────────────────────────

export const Sizes: Story = {
  render: () => (
    <div className="flex flex-col gap-8">
      <div>
        <p className="mb-2 text-xs font-semibold text-fg-muted">size=&quot;md&quot; (default)</p>
        <Stepper steps={fourSteps} activeIndex={1} />
      </div>
      <div>
        <p className="mb-2 text-xs font-semibold text-fg-muted">size=&quot;sm&quot;</p>
        <Stepper steps={fourSteps} activeIndex={1} size="sm" />
      </div>
    </div>
  ),
};
