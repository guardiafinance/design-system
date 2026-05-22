import type { Meta, StoryObj } from "@storybook/react";

import { Skeleton } from "./index";

const meta: Meta<typeof Skeleton> = {
  title: "Components/Skeleton",
  component: Skeleton,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    a11y: {
      // WHY: Skeleton is purely decorative loading state. Its low-contrast
      // gray-on-gray surface is intentional — communicates "structure
      // pending" without competing with real content once loaded. WCAG 1.4.3
      // applies to "text"; skeleton placeholders carry no informational text.
      config: { rules: [{ id: "color-contrast", enabled: false }] },
    },
    docs: {
      description: {
        component:
          "Placeholder animado para conteúdo carregando. Quatro variantes (`text`, `title`, `rect`, `circle`), suporte a `lines` para parágrafos e shimmer que respeita `prefers-reduced-motion`.",
      },
    },
  },
  argTypes: {
    variant: {
      control: "radio",
      options: ["text", "title", "rect", "circle"],
    },
    lines: { control: { type: "number", min: 1, max: 8 } },
    width: { control: "text" },
    height: { control: "text" },
  },
};
export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { width: 240 },
};

export const Title: Story = {
  args: { variant: "title" },
};

export const Rect: Story = {
  args: { variant: "rect", width: 320 },
};

export const Circle: Story = {
  args: { variant: "circle" },
};

export const ParagraphLines: Story = {
  render: () => (
    <div className="w-80">
      <Skeleton variant="text" lines={4} />
    </div>
  ),
};

export const Card: Story = {
  render: () => (
    <div className="flex w-80 flex-col gap-3 rounded-lg border border-border bg-card p-4">
      <Skeleton variant="rect" />
      <Skeleton variant="title" />
      <Skeleton variant="text" lines={3} />
    </div>
  ),
};

export const ProfileRow: Story = {
  render: () => (
    <div className="flex items-center gap-3">
      <Skeleton variant="circle" />
      <div className="flex flex-1 flex-col gap-2">
        <Skeleton variant="text" width="40%" />
        <Skeleton variant="text" width="70%" />
      </div>
    </div>
  ),
};

export const Showcase: Story = {
  render: () => (
    <div className="flex w-96 flex-col gap-6">
      <Skeleton variant="text" />
      <Skeleton variant="title" />
      <Skeleton variant="rect" />
      <div className="flex items-center gap-3">
        <Skeleton variant="circle" />
        <Skeleton variant="text" width="60%" />
      </div>
    </div>
  ),
};
