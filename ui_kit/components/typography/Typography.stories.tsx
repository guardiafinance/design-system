import type { Meta, StoryObj } from "@storybook/react";
import { Typography, H1, H2, P, Lead, Muted, Code } from "./index";

const meta = {
  title: "Components/Typography",
  component: Typography,
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: ["h1", "h2", "h3", "h4", "h5", "h6", "p", "lead", "large", "small", "muted", "code", "blockquote", "list"],
    },
  },
} satisfies Meta<typeof Typography>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { children: "Typography text", variant: "p" },
};

export const Headings: Story = {
  render: () => (
    <div className="space-y-2">
      <H1>Heading 1</H1>
      <H2>Heading 2</H2>
      <P>Paragraph text.</P>
      <Lead>Lead paragraph with muted style.</Lead>
      <Muted>Muted text.</Muted>
      <Code>code snippet</Code>
    </div>
  ),
};

export const VariantH1: Story = {
  args: { variant: "h1", children: "Heading 1" },
};

export const VariantP: Story = {
  args: { variant: "p", children: "Paragraph content." },
};
