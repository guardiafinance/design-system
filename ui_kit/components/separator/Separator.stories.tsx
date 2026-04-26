import type { Meta, StoryObj } from "@storybook/react";

import { Separator } from "./index";

const meta: Meta<typeof Separator> = {
  title: "Components/Separator",
  component: Separator,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "Divisor horizontal ou vertical para agrupar visualmente blocos de conteúdo. Três aparências (`solid` · `dashed` · `dotted`) e label opcional centralizado.",
      },
    },
  },
  argTypes: {
    orientation: { control: "radio", options: ["horizontal", "vertical"] },
    appearance: { control: "radio", options: ["solid", "dashed", "dotted"] },
    label: { control: "text" },
  },
};
export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Dashed: Story = {
  args: { appearance: "dashed" },
};

export const Dotted: Story = {
  args: { appearance: "dotted" },
};

export const WithLabel: Story = {
  args: { label: "ou" },
};

export const WithLongLabel: Story = {
  args: { label: "março de 2025" },
};

export const DashedWithLabel: Story = {
  args: { label: "seção de arquivados", appearance: "dashed" },
};

export const Vertical: Story = {
  render: () => (
    <div className="flex h-10 items-center gap-3 rounded-md border border-border bg-background px-4">
      <span className="text-sm">Conciliado</span>
      <Separator orientation="vertical" />
      <span className="text-sm">248 lançamentos</span>
      <Separator orientation="vertical" />
      <span className="text-sm text-muted-foreground">há 2 min</span>
    </div>
  ),
};

export const Showcase: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <Separator />
      <Separator appearance="dashed" />
      <Separator appearance="dotted" />
      <Separator label="ou" />
      <Separator label="março de 2025" />
      <Separator appearance="dashed" label="seção de arquivados" />
    </div>
  ),
};
