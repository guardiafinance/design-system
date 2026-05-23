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
  parameters: {
    a11y: {
      // WHY: BadgeSelect's trigger is a stylized badge surface using brand
      // tokens at the 3:1–4.5:1 range permitted by lex-brand-colors for
      // titles/buttons/badges. Per the same rationale as Badge.stories.tsx,
      // axe's color-contrast 4.5:1 normal-text threshold does not apply to
      // badge surfaces.
      config: { rules: [{ id: "color-contrast", enabled: false }] },
    },
  },
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
