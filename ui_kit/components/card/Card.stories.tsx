import type { Meta, StoryObj } from "@storybook/react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "./index";
import { Button } from "../button";

const meta = {
  title: "Components/Card",
  component: Card,
  tags: ["autodocs"],
} satisfies Meta<typeof Card>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  parameters: {
    a11y: {
      // WHY: CardDescription uses `text-fg-muted` token (shared with
      // Combobox/Input/etc.); CardFooter renders Button (.bg-primary brand
      // token at 3:1 button threshold per lex-brand-colors). Both deferred
      // to the Plan #128 follow-up token review.
      config: { rules: [{ id: "color-contrast", enabled: false }] },
    },
  },
  render: () => (
    <Card className="w-[350px]">
      <CardHeader>
        <CardTitle>Card Title</CardTitle>
        <CardDescription>Card description goes here.</CardDescription>
      </CardHeader>
      <CardContent>
        <p>Card content.</p>
      </CardContent>
      <CardFooter>
        <Button>Action</Button>
      </CardFooter>
    </Card>
  ),
};

export const Simple: Story = {
  args: { children: "Simple card content" },
};
