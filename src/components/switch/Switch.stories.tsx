import type { Meta, StoryObj } from "@storybook/react";
import { Switch } from "./index";
import { Label } from "../label";

const meta = {
  title: "Components/Switch",
  component: Switch,
  tags: ["autodocs"],
  argTypes: {
    variant: { control: "select", options: ["default", "brand", "accent"] },
    size: { control: "select", options: ["default", "sm", "lg"] },
  },
} satisfies Meta<typeof Switch>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithLabel: Story = {
  render: () => (
    <div className="flex items-center space-x-2">
      <Switch id="airplane" />
      <Label htmlFor="airplane">Airplane mode</Label>
    </div>
  ),
};

export const Brand: Story = {
  args: { variant: "brand" },
};

export const Small: Story = {
  args: { size: "sm" },
};
