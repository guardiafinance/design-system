import type { Meta, StoryObj } from "@storybook/react";
import { Separator } from "./index";

const meta = {
  title: "Components/Separator",
  component: Separator,
  tags: ["autodocs"],
  argTypes: {
    orientation: {
      control: "radio",
      options: ["horizontal", "vertical"],
    },
  },
} satisfies Meta<typeof Separator>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {} as Story;

export const Vertical: Story = {
  args: { orientation: "vertical" },
  render: (args) => (
    <div className="flex h-20 items-center gap-4">
      <span>Item 1</span>
      <Separator {...args} />
      <span>Item 2</span>
      <Separator {...args} />
      <span>Item 3</span>
    </div>
  ),
};
