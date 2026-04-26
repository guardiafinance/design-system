import type { Meta, StoryObj } from "@storybook/react";

import { Label } from "./index";

const meta: Meta<typeof Label> = {
  title: "Components/Label",
  component: Label,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "Rótulo de campo de formulário (Radix Label). Suporta indicadores `required` (asterisco) e `optional` (sufixo), com dois tamanhos.",
      },
    },
  },
  argTypes: {
    size: { control: "radio", options: ["sm", "md"] },
    required: { control: "boolean" },
    optional: { control: "boolean" },
  },
};
export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { children: "Email", htmlFor: "email" },
};

export const Required: Story = {
  args: { children: "Email", htmlFor: "email", required: true },
};

export const Optional: Story = {
  args: { children: "Telefone", htmlFor: "phone", optional: true },
};

export const Sizes: Story = {
  render: () => (
    <div className="flex flex-col gap-3">
      <Label size="sm" htmlFor="a">
        Small (12.5px — default)
      </Label>
      <Label size="md" htmlFor="b">
        Medium (14px)
      </Label>
    </div>
  ),
};

export const WithField: Story = {
  render: () => (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor="name-field" required>
        Nome completo
      </Label>
      <input
        id="name-field"
        type="text"
        placeholder="Fernando Seguim"
        className="h-10 w-80 rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
      />
    </div>
  ),
};

export const CustomOptionalLabel: Story = {
  args: {
    children: "Whatsapp",
    htmlFor: "wa",
    optional: true,
    optionalLabel: "(se preferir)",
  },
};
