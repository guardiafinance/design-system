import type { Meta, StoryObj } from "@storybook/react";
import {
  StylizedSelect,
  StylizedSelectContent,
  StylizedSelectItem,
  StylizedSelectTrigger,
  StylizedSelectValue,
} from "./index";

const meta = {
  title: "Components/BadgeSelect",
  component: StylizedSelect,
  tags: ["autodocs"],
} satisfies Meta<typeof StylizedSelect>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <StylizedSelect>
      <StylizedSelectTrigger className="w-[180px]" label="Status">
        <StylizedSelectValue placeholder="Select" />
      </StylizedSelectTrigger>
      <StylizedSelectContent>
        <StylizedSelectItem value="active">Active</StylizedSelectItem>
        <StylizedSelectItem value="pending">Pending</StylizedSelectItem>
        <StylizedSelectItem value="done">Done</StylizedSelectItem>
      </StylizedSelectContent>
    </StylizedSelect>
  ),
};
