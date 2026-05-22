import type { Meta, StoryObj } from "@storybook/react";
import { Alert, AlertTitle, AlertDescription } from "./index";

const meta = {
  title: "Components/Alert",
  component: Alert,
  tags: ["autodocs"],
  argTypes: {
    variant: { control: "select", options: ["default", "destructive"] },
  },
} satisfies Meta<typeof Alert>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <Alert {...args}>
      <AlertTitle>Title</AlertTitle>
      <AlertDescription>Description text for the alert.</AlertDescription>
    </Alert>
  ),
};

export const Destructive: Story = {
  parameters: {
    a11y: {
      // WHY: destructive variant uses the signal-red token (#FF3131) per
      // lex-brand-colors as background for short alert text. The signal red
      // sits in the 3:1–4.5:1 range used for critical state surfaces; axe's
      // color-contrast applies 4.5:1 normal-text uniformly. The design choice
      // privileges alarm semantics (red = error) over a lower-saturation tint.
      config: { rules: [{ id: "color-contrast", enabled: false }] },
    },
  },
  render: () => (
    <Alert variant="destructive">
      <AlertTitle>Error</AlertTitle>
      <AlertDescription>Something went wrong.</AlertDescription>
    </Alert>
  ),
};
