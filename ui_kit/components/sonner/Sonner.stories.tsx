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
  parameters: {
    a11y: {
      // WHY: story renders Button (.bg-primary = Violet 500) as the toast
      // trigger. Button surface uses brand tokens in the 3:1–4.5:1 contrast
      // range permitted by lex-brand-colors for buttons. See
      // ui_kit/components/button/Button.stories.tsx meta for the canonical
      // rationale.
      config: { rules: [{ id: "color-contrast", enabled: false }] },
    },
  },
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
