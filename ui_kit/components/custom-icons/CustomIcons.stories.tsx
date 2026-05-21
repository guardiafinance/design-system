import type { Meta, StoryObj } from "@storybook/react";
import { SparklesFilled, Sparkles, SparkleSquared, SparkleAi } from "./index";

const meta = {
  title: "Components/CustomIcons",
  component: SparklesFilled,
  tags: ["autodocs"],
} satisfies Meta<typeof SparklesFilled>;

export default meta;

type Story = StoryObj<typeof meta>;

export const SparklesFilledIcon: Story = {
  render: () => <SparklesFilled className="h-8 w-8" />,
};

export const SparklesIcon: Story = {
  render: () => <Sparkles className="h-8 w-8" />,
};

export const SparkleSquaredIcon: Story = {
  render: () => <SparkleSquared className="h-8 w-8" />,
};

export const SparkleAiIcon: Story = {
  render: () => <SparkleAi className="h-8 w-8" />,
};

export const AllIcons: Story = {
  render: () => (
    <div className="flex flex-wrap gap-4">
      <SparklesFilled className="h-8 w-8" />
      <Sparkles className="h-8 w-8" />
      <SparkleSquared className="h-8 w-8" />
      <SparkleAi className="h-8 w-8" />
    </div>
  ),
};
