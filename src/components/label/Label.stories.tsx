import type { Meta, StoryObj } from "@storybook/react";
import { Label } from "./index";

const meta = {
  title: "Components/Label",
  component: Label,
  tags: ["autodocs"],
} satisfies Meta<typeof Label>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { children: "Label" },
};

export const WithInput: Story = {
  render: () => (
    <div className="space-y-2">
      <Label htmlFor="email">Email</Label>
      <input
        id="email"
        type="email"
        className="flex h-8 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
        placeholder="email@example.com"
      />
    </div>
  ),
};
