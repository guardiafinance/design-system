import type { Meta, StoryObj } from "@storybook/react";
import { Building2 } from "lucide-react";

import { Select } from "./index";

const PLANOS = [
  { value: "starter", label: "Starter" },
  { value: "pro", label: "Pro" },
  { value: "business", label: "Business" },
  { value: "enterprise", label: "Enterprise" },
];

const meta: Meta<typeof Select> = {
  title: "Components/Select",
  component: Select,
  tags: ["autodocs"],
  args: { options: PLANOS },
  decorators: [
    (Story) => (
      <div className="w-72">
        <Story />
      </div>
    ),
  ],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "Dropdown estilizado para listas curtas. Mesma arquitetura do Combobox (Radix Popover + listbox custom), só sem busca. Para listas longas/buscáveis, prefira `<Combobox />`.",
      },
    },
  },
  argTypes: {
    size: { control: "radio", options: ["sm", "md", "lg"] },
    state: { control: "radio", options: ["default", "error", "success"] },
    invalid: { control: "boolean" },
    disabled: { control: "boolean" },
    placeholder: { control: "text" },
  },
};
export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { placeholder: "Selecione um plano" },
};

export const WithDefaultValue: Story = {
  args: { defaultValue: "pro" },
};

export const WithLeftIcon: Story = {
  args: {
    placeholder: "Selecione",
    leftIcon: <Building2 width={16} height={16} />,
  },
};

export const Sizes: Story = {
  decorators: [],
  render: () => (
    <div className="flex w-72 flex-col gap-3">
      <Select options={PLANOS} size="sm" placeholder="Small" />
      <Select options={PLANOS} size="md" placeholder="Medium (default)" />
      <Select options={PLANOS} size="lg" placeholder="Large" />
    </div>
  ),
};

export const States: Story = {
  decorators: [],
  render: () => (
    <div className="flex w-72 flex-col gap-3">
      <Select options={PLANOS} placeholder="Default" />
      <Select options={PLANOS} state="error" defaultValue="pro" />
      <Select options={PLANOS} state="success" defaultValue="pro" />
      <Select options={PLANOS} invalid placeholder="Invalid (shortcut)" />
      <Select options={PLANOS} disabled defaultValue="starter" />
    </div>
  ),
};

export const WithDisabledOption: Story = {
  args: {
    options: [
      ...PLANOS,
      { value: "legacy", label: "Legacy (descontinuado)", disabled: true },
    ],
  },
};
