import type { Meta, StoryObj } from "@storybook/react";
import { Building2, User } from "lucide-react";

import { Combobox } from "./index";

const PLANOS = [
  { value: "starter", label: "Starter", meta: "Até 1k transações/mês" },
  { value: "pro", label: "Pro", meta: "Até 10k transações/mês" },
  { value: "business", label: "Business", meta: "Até 100k transações/mês" },
  { value: "enterprise", label: "Enterprise", meta: "Personalizado" },
];

const CLIENTES = [
  { value: "01", label: "Acme Ltda", meta: "12.345.678/0001-90" },
  { value: "02", label: "Beta Comércio S.A.", meta: "23.456.789/0001-12" },
  { value: "03", label: "Gama Tecnologia ME", meta: "34.567.890/0001-34" },
  { value: "04", label: "Delta Indústrias", meta: "45.678.901/0001-56" },
  { value: "05", label: "Épsilon Holdings", meta: "56.789.012/0001-78" },
  { value: "06", label: "Zeta Logística", meta: "67.890.123/0001-90" },
  { value: "07", label: "Eta Consultoria", meta: "78.901.234/0001-12" },
  { value: "08", label: "Theta Imobiliária", meta: "89.012.345/0001-34" },
  { value: "09", label: "Iota Distribuidora", meta: "90.123.456/0001-56" },
  { value: "10", label: "Kappa Eletrônica", meta: "01.234.567/0001-78" },
];

const meta: Meta<typeof Combobox> = {
  title: "Components/Combobox",
  component: Combobox,
  tags: ["autodocs"],
  args: {
    options: PLANOS,
  },
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
          "Dropdown com busca para listas longas (clientes, contas, CNAEs). Base no Radix Popover com filtro client-side em label + meta, navegação por teclado e a11y completa de listbox.",
      },
    },
  },
  argTypes: {
    size: { control: "radio", options: ["sm", "md", "lg"] },
    invalid: { control: "boolean" },
    disabled: { control: "boolean" },
    clearable: { control: "boolean" },
  },
};
export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithDefaultValue: Story = {
  args: { defaultValue: "pro" },
};

export const WithLeftIcon: Story = {
  args: {
    leftIcon: <Building2 width={16} height={16} />,
    placeholder: "Selecione um plano",
  },
};

export const Clearable: Story = {
  args: { defaultValue: "pro", clearable: true },
};

export const LongList: Story = {
  args: {
    options: CLIENTES,
    placeholder: "Selecione um cliente",
    searchPlaceholder: "Buscar por nome ou CNPJ…",
    leftIcon: <User width={16} height={16} />,
  },
  decorators: [
    (Story) => (
      <div className="w-96">
        <Story />
      </div>
    ),
  ],
};

export const Sizes: Story = {
  render: () => (
    <div className="flex flex-col gap-3">
      <Combobox options={PLANOS} size="sm" placeholder="Small" />
      <Combobox options={PLANOS} size="md" placeholder="Medium (default)" />
      <Combobox options={PLANOS} size="lg" placeholder="Large" />
    </div>
  ),
};

export const Invalid: Story = {
  args: { invalid: true, placeholder: "Selecione…" },
};

export const Disabled: Story = {
  args: { disabled: true, defaultValue: "pro" },
};

export const WithDisabledOption: Story = {
  args: {
    options: [
      ...PLANOS,
      {
        value: "legacy",
        label: "Legacy",
        meta: "Descontinuado",
        disabled: true,
      },
    ],
  },
};

export const EmptyState: Story = {
  args: {
    emptyText: "Nenhum plano encontrado",
  },
};
