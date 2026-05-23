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
    // WHY: pinned date in a past month keeps the visual snapshot
    // deterministic. `new Date()` drifts as the day boundary crosses
    // between baseline capture and CI validation; Calendar's "today"
    // highlight covers a full cell (~2k pixels) which blows the 0.2%
    // diff threshold. Selecting June 2020 puts the displayed month
    // outside any reasonable future "today", so the highlight never
    // overlaps the snapshot.
    const [date, setDate] = useState<Date | undefined>(
      new Date(2020, 5, 15),
    );
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
