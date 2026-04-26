import type { Meta, StoryObj } from "@storybook/react";

import { Checkbox } from "./index";

const meta: Meta<typeof Checkbox> = {
  title: "Components/Checkbox",
  component: Checkbox,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "Seleção múltipla. Base no Radix Checkbox com indicator visual, suporte a `indeterminate`, estado `invalid`, e composição opcional com `label` + `description`.",
      },
    },
  },
  argTypes: {
    size: { control: "radio", options: ["sm", "md"] },
    checked: { control: "boolean" },
    indeterminate: { control: "boolean" },
    invalid: { control: "boolean" },
    disabled: { control: "boolean" },
    label: { control: "text" },
    description: { control: "text" },
  },
};
export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { label: "Aceito os termos" },
};

export const WithDescription: Story = {
  args: {
    label: "Receber comunicações",
    description: "Marketing, novidades de produto e atualizações de release.",
  },
};

export const Checked: Story = {
  args: { label: "Conciliação automática", checked: true },
};

export const Indeterminate: Story = {
  args: { label: "Selecionar todos (3 de 7)", indeterminate: true },
};

export const Invalid: Story = {
  args: {
    label: "Aceito os termos",
    description: "Você precisa concordar para continuar",
    invalid: true,
  },
};

export const Disabled: Story = {
  args: { label: "Não disponível neste plano", disabled: true },
};

export const DisabledChecked: Story = {
  args: {
    label: "Recursos básicos",
    description: "Incluso em todos os planos",
    checked: true,
    disabled: true,
  },
};

export const Sizes: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <Checkbox
        size="sm"
        label="Tamanho sm (denso)"
        description="Box 16px · label 13px"
      />
      <Checkbox
        size="md"
        label="Tamanho md (default)"
        description="Box 18px · label 14px"
      />
    </div>
  ),
};

export const Standalone: Story = {
  render: () => (
    <div className="flex items-center gap-2">
      <Checkbox id="standalone" />
      <label htmlFor="standalone" className="text-sm">
        Sem composição interna — label externa
      </label>
    </div>
  ),
};

export const Group: Story = {
  render: () => (
    <fieldset className="flex flex-col gap-3 rounded-md border border-border p-4">
      <legend className="px-2 text-sm font-semibold">Notificações</legend>
      <Checkbox label="Email" description="Resumo diário e alertas críticos" />
      <Checkbox label="Push" description="Apenas alertas críticos" />
      <Checkbox label="SMS" description="Apenas para 2FA" disabled />
    </fieldset>
  ),
};
