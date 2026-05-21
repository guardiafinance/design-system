import type { Meta, StoryObj } from "@storybook/react";
import type { ComponentProps } from "react";
import { ChartContainer } from "./index";
import { LineChart, Line, XAxis, YAxis, CartesianGrid } from "recharts";

/** Props do ChartContainer que podem ser controladas via args (children vêm do render). */
type ChartArgs = Omit<
  ComponentProps<typeof ChartContainer>,
  "children"
>;

const meta = {
  title: "Components/Chart",
  component: ChartContainer,
  tags: ["autodocs"],
} satisfies Meta<typeof ChartContainer>;

export default meta;

type Story = StoryObj<typeof meta>;

const data = [
  { name: "A", value: 400 },
  { name: "B", value: 300 },
  { name: "C", value: 200 },
  { name: "D", value: 500 },
];

const chartConfig = {
  value: { label: "Value" },
};

export const Default: Story = {
  args: ({
    config: chartConfig,
    className: "h-[200px] w-full",
  } satisfies ChartArgs) as unknown as Story["args"],
  render: (args) => (
    <ChartContainer {...args}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Line type="monotone" dataKey="value" stroke="hsl(var(--primary))" />
      </LineChart>
    </ChartContainer>
  ),
};
