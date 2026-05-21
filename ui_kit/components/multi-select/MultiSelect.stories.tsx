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
  render: function MultiSelectStory(args) {
    const [value, setValue] = useState<MultiSelectOption[]>([]);
    return (
      <div className="w-[300px]">
        <MultiSelect
          {...args}
          value={value}
          onChange={setValue}
        />
      </div>
    );
  },
};
