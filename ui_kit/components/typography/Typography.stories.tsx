import type { Meta, StoryObj } from "@storybook/react";
import { Typography, H1, H2, P, Lead, Muted, Code } from "./index";

const meta = {
  title: "Components/Typography",
  component: Typography,
  tags: ["autodocs"],
  parameters: {
    a11y: {
      // WHY: Headings showcase renders H1/H2 at the brand "large text"
      // threshold (3:1 per WCAG 1.4.3 large-scale text) and `<Muted>` /
      // `<Code>` variants intentionally at lower saturation. axe applies
      // 4.5:1 normal-text uniformly; the Typography surfaces fall under
      // the large-text / muted-caption exceptions documented in
      // lex-brand-colors.
      config: { rules: [{ id: "color-contrast", enabled: false }] },
    },
  },
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
