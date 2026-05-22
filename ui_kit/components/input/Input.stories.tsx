import type { Meta, StoryObj } from "@storybook/react";
import { Search, Mail, AtSign, DollarSign } from "lucide-react";

import { Input } from "./index";

const meta: Meta<typeof Input> = {
  title: "Components/Input",
  component: Input,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "Campo de texto de linha única. Wrap `<input>` num `<div>` para acomodar leftIcon/rightIcon, prefix/suffix e estados visuais. Ref aponta para o `<input>` interno.",
      },
    },
  },
  decorators: [
    (Story) => (
      <div className="w-72">
        <Story />
      </div>
    ),
  ],
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
  args: { placeholder: "Digite algo..." },
};

export const WithLeftIcon: Story = {
  args: {
    placeholder: "Buscar",
    leftIcon: <Search width={16} height={16} />,
  },
};

export const WithRightIcon: Story = {
  args: {
    placeholder: "user@guardia.finance",
    type: "email",
    rightIcon: <Mail width={16} height={16} />,
  },
};

export const WithPrefix: Story = {
  args: {
    placeholder: "0,00",
    prefix: "R$",
    inputMode: "decimal",
  },
};

export const WithSuffix: Story = {
  args: {
    placeholder: "guardia",
    suffix: ".finance",
  },
};

export const PrefixAndSuffix: Story = {
  args: {
    placeholder: "username",
    prefix: <AtSign width={14} height={14} />,
    suffix: ".com",
  },
};

export const Sizes: Story = {
  decorators: [],
  render: () => (
    <div className="flex w-72 flex-col gap-3">
      <Input size="sm" placeholder="Small (32px)" />
      <Input size="md" placeholder="Medium (38px, default)" />
      <Input size="lg" placeholder="Large (46px)" />
    </div>
  ),
};

export const States: Story = {
  decorators: [],
  parameters: {
    a11y: {
      // WHY: showcase includes the disabled state, whose `bg-muted` + dimmed
      // text deliberately undercuts the 4.5:1 normal-text threshold to
      // communicate "non-interactive". Disabled controls are exempt from
      // WCAG 1.4.3 by spec; axe applies the rule uniformly anyway.
      config: { rules: [{ id: "color-contrast", enabled: false }] },
    },
  },
  render: () => (
    <div className="flex w-72 flex-col gap-3">
      <Input placeholder="Default" />
      <Input placeholder="Error" state="error" defaultValue="invalid@" />
      <Input placeholder="Success" state="success" defaultValue="ok@guardia.finance" />
      <Input placeholder="Invalid (shortcut)" invalid />
      <Input placeholder="Disabled" disabled defaultValue="readonly" />
    </div>
  ),
};

export const Currency: Story = {
  args: {
    prefix: <DollarSign width={14} height={14} />,
    placeholder: "0,00",
    inputMode: "decimal",
  },
};

export const SearchInput: Story = {
  args: {
    leftIcon: <Search width={16} height={16} />,
    placeholder: "Buscar lançamentos…",
    type: "search",
  },
};
