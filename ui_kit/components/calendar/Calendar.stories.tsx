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
    // WHY: both `selected` AND `defaultMonth` need to be pinned to keep
    // the snapshot deterministic. `selected` alone only marks the day —
    // react-day-picker still defaults the *displayed* month to today,
    // so the "today" cell highlight drifts as the day boundary crosses
    // between baseline capture and CI validation (Calendar's highlight
    // covers ~2k pixels, blowing the 0.2% threshold). Pinning
    // `defaultMonth` to June 2020 puts the rendered grid outside any
    // reasonable future "today" — no cell overlap, no daily drift.
    const PINNED = new Date(2020, 5, 15);
    const [date, setDate] = useState<Date | undefined>(PINNED);
    return (
      <Calendar
        mode="single"
        defaultMonth={PINNED}
        selected={date}
        onSelect={setDate}
        className="rounded-md border"
      />
    );
  },
};
