import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { Calendar } from "./index";

const meta = {
  title: "Components/Calendar",
  component: Calendar,
  tags: ["autodocs"],
  parameters: {
    a11y: {
      // WHY: Calendar (react-day-picker) renders muted weekday/outside-month
      // dates intentionally at lower contrast to de-emphasize them; selected
      // date sits on brand violet (3:1 button threshold). Both within
      // lex-brand-colors permissive surfaces; token review deferred.
      config: { rules: [{ id: "color-contrast", enabled: false }] },
    },
  },
} satisfies Meta<typeof Calendar>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: function CalendarStory() {
    const [date, setDate] = useState<Date | undefined>(new Date());
    return (
      <Calendar
        mode="single"
        selected={date}
        onSelect={setDate}
        className="rounded-md border"
      />
    );
  },
};
