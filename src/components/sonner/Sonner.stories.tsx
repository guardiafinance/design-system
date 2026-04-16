import type { Meta, StoryObj } from "@storybook/react";
import { Sonner } from "./index";
import { Button } from "../button";
import { toast } from "sonner";

const meta = {
  title: "Components/Sonner",
  component: Sonner,
  tags: ["autodocs"],
} satisfies Meta<typeof Sonner>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <>
      <Sonner />
      <Button
        onClick={() => toast.success("Toast message")}
      >
        Show toast
      </Button>
    </>
  ),
};
