import type { Meta, StoryObj } from "@storybook/react";
import { Input } from "./index";

const meta = {
  title: "Components/Input",
  component: Input,
  tags: ["autodocs"],
  argTypes: {
    type: {
      control: "select",
      options: ["text", "email", "password", "number"],
    },
  },
} satisfies Meta<typeof Input>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { placeholder: "Placeholder" },
};

export const WithValue: Story = {
  args: { defaultValue: "Hello" },
};

export const Disabled: Story = {
  args: { disabled: true, placeholder: "Disabled" },
};

export const Password: Story = {
  args: { type: "password", placeholder: "Password" },
};
