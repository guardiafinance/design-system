import type { Meta, StoryObj } from "@storybook/react";
import { ScrollArea } from "./index";

const meta = {
  title: "Components/ScrollArea",
  component: ScrollArea,
  tags: ["autodocs"],
} satisfies Meta<typeof ScrollArea>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <ScrollArea className="h-48 w-48 rounded-md border p-4">
      <p>Line 1</p>
      <p>Line 2</p>
      <p>Line 3</p>
      <p>Line 4</p>
      <p>Line 5</p>
      <p>Line 6</p>
      <p>Line 7</p>
      <p>Line 8</p>
      <p>Line 9</p>
      <p>Line 10</p>
    </ScrollArea>
  ),
};
