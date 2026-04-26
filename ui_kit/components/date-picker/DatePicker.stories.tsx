import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";

import { DatePicker } from "./index";

const meta: Meta<typeof DatePicker> = {
  title: "Components/DatePicker",
  component: DatePicker,
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <div className="w-72">
        <Story />
      </div>
    ),
  ],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "Seletor de data única em popover, com formato `dd/mm/aaaa` e localização pt-BR. Base no `react-day-picker` (a11y completa de calendar grid) + Radix Popover (focus management e dismissal).",
      },
    },
  },
  argTypes: {
    size: { control: "radio", options: ["sm", "md", "lg"] },
    invalid: { control: "boolean" },
    disabled: { control: "boolean" },
    clearable: { control: "boolean" },
    showToday: { control: "boolean" },
  },
};
export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithDefaultValue: Story = {
  args: { defaultValue: new Date(2025, 2, 15) },
};

export const Controlled: Story = {
  render: () => {
    const [date, setDate] = useState<Date | null>(new Date(2025, 0, 7));
    return (
      <div className="flex flex-col gap-2">
        <DatePicker value={date} onChange={setDate} />
        <p className="text-xs text-fg-muted">
          ISO: <code className="font-mono">{date?.toISOString() ?? "null"}</code>
        </p>
      </div>
    );
  },
};

export const Sizes: Story = {
  decorators: undefined,
  render: () => (
    <div className="flex w-72 flex-col gap-3">
      <DatePicker size="sm" placeholder="Small" />
      <DatePicker size="md" placeholder="Medium (default)" />
      <DatePicker size="lg" placeholder="Large" />
    </div>
  ),
};

export const WithMinMax: Story = {
  args: {
    minDate: new Date(),
    maxDate: new Date(new Date().setDate(new Date().getDate() + 30)),
    placeholder: "Próximos 30 dias",
  },
};

export const Invalid: Story = {
  args: { invalid: true, placeholder: "Data obrigatória" },
};

export const Disabled: Story = {
  args: { disabled: true, defaultValue: new Date() },
};

export const NoToday: Story = {
  args: { showToday: false },
};

export const NotClearable: Story = {
  args: { defaultValue: new Date(), clearable: false },
};
