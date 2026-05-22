import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { MultiSelect, type MultiSelectOption } from "./index";

const options: MultiSelectOption[] = [
  { value: "1", label: "Option 1" },
  { value: "2", label: "Option 2" },
  { value: "3", label: "Option 3" },
];

const meta = {
  title: "Components/MultiSelect",
  component: MultiSelect,
  tags: ["autodocs"],
} satisfies Meta<typeof MultiSelect>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    options,
    placeholder: "Select...",
  },
  parameters: {
    a11y: {
      // WHY: react-select trigger uses `text-fg-muted` for placeholder. Same
      // shared token issue as Combobox/DatePicker/Input — deferred to a
      // follow-up token review per Plan #128 risks.
      config: { rules: [{ id: "color-contrast", enabled: false }] },
    },
  },
  render: function MultiSelectStory(args) {
    const [value, setValue] = useState<MultiSelectOption[]>([]);
    return (
      <div className="w-[300px]">
        <MultiSelect
          {...args}
          value={value}
          onChange={setValue}
          aria-label="Options"
        />
      </div>
    );
  },
};
