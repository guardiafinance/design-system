import type { Meta, StoryObj } from "@storybook/react";

import { Switch } from "./index";

const meta: Meta<typeof Switch> = {
  title: "Components/Switch",
  component: Switch,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "Alternador on/off para acoes com efeito imediato. Base no Radix Switch com track + thumb brand-aware, sizes sm/md, estado `invalid`, e composicao opcional com `label` + `description`.",
      },
    },
  },
  argTypes: {
    size: { control: "radio", options: ["sm", "md"] },
    checked: { control: "boolean" },
    invalid: { control: "boolean" },
    disabled: { control: "boolean" },
    label: { control: "text" },
    description: { control: "text" },
  },
};
export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { label: "Receber notificacoes por e-mail" },
};

export const WithDescription: Story = {
  args: {
    label: "Autopilot de conciliacao",
    description:
      "Aprova matches com confianca acima de 95% sem revisao manual.",
  },
};

export const Checked: Story = {
  args: { label: "Resumo diario as 18h", defaultChecked: true },
};

export const Invalid: Story = {
  args: {
    label: "Aceitar termos",
    description: "Voce precisa concordar para continuar",
    invalid: true,
  },
};

export const Disabled: Story = {
  args: { label: "Indisponivel neste plano", disabled: true },
};

export const DisabledChecked: Story = {
  args: {
    label: "Recursos basicos",
    description: "Incluso em todos os planos",
    defaultChecked: true,
    disabled: true,
  },
};

export const Sizes: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <Switch
        size="sm"
        label="Tamanho sm (denso)"
        description="Track 30x18 . label 13px"
      />
      <Switch
        size="md"
        label="Tamanho md (default)"
        description="Track 38x22 . label 14px"
      />
    </div>
  ),
};

export const Standalone: Story = {
  render: () => (
    <div className="flex items-center gap-2">
      <Switch id="standalone-sw" aria-label="Modo aviao" />
      <label htmlFor="standalone-sw" className="text-sm">
        Sem composicao interna — label externa
      </label>
    </div>
  ),
};

export const Group: Story = {
  render: () => (
    <fieldset className="flex flex-col gap-3 rounded-md border border-border p-4">
      <legend className="px-2 text-sm font-semibold">Notificacoes</legend>
      <Switch
        label="E-mail"
        description="Resumo diario e alertas criticos"
        defaultChecked
      />
      <Switch label="Push" description="Apenas alertas criticos" />
      <Switch label="SMS" description="Apenas para 2FA" disabled />
    </fieldset>
  ),
};

/**
 * Forca a story para o tema escuro independentemente do toggle global da
 * toolbar. Serve como contrato visual: o Switch mantem WCAG AA em ambos os
 * tamanhos (sm, md) sobre fundo Mono Black (#0E1016) / Cinza 900 (#17171B)
 * declarados em lex-brand-colors. Os tokens brand-aware (`bg-action`,
 * `bg-muted`, `bg-background`, `ring-ring`, `ring-destructive/40`)
 * preservam contraste sob `data-theme="dark"`.
 */
export const DarkTheme: Story = {
  globals: { theme: "dark" },
  parameters: {
    backgrounds: { default: "dark" },
    docs: {
      description: {
        story:
          'Matriz estados x tamanhos + composicao com label/description + invalid e disabled sobre fundo escuro. Confirma que `bg-action` (Laranja 500 no dark) mantem contraste >= 3:1 (UI) sob `data-theme="dark"`, e que o anel de foco (`focus-visible:ring-ring`) preserva visibilidade sobre Mono Black.',
      },
    },
  },
  render: () => (
    <div className="flex flex-col gap-8">
      <div className="flex flex-wrap items-center gap-6">
        <Switch size="md" label="Unchecked (md)" />
        <Switch size="md" label="Checked (md)" defaultChecked />
        <Switch size="md" label="Disabled (md)" disabled />
        <Switch
          size="md"
          label="Disabled + checked (md)"
          disabled
          defaultChecked
        />
      </div>
      <div className="flex flex-wrap items-center gap-6">
        <Switch size="sm" label="Unchecked (sm)" />
        <Switch size="sm" label="Checked (sm)" defaultChecked />
        <Switch size="sm" label="Disabled (sm)" disabled />
      </div>
      <Switch
        label="Autopilot de conciliacao"
        description="Aprova matches com confianca acima de 95% sem revisao manual."
        defaultChecked
      />
      <Switch
        invalid
        label="Aceitar termos"
        description="Voce precisa concordar para continuar."
      />
      <fieldset className="flex flex-col gap-3 rounded-md border border-border p-4">
        <legend className="px-2 text-sm font-semibold">
          Notificacoes (dark)
        </legend>
        <Switch
          label="E-mail"
          description="Resumo diario e alertas criticos"
          defaultChecked
        />
        <Switch label="Push" description="Apenas alertas criticos" />
        <Switch label="SMS" description="Apenas para 2FA" disabled />
      </fieldset>
    </div>
  ),
};
