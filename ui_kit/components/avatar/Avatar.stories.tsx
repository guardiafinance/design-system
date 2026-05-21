import type { Meta, StoryObj } from "@storybook/react";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  AvatarStatus,
  initials,
} from "./index";

const meta: Meta<typeof Avatar> = {
  title: "Components/Avatar",
  component: Avatar,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "Identidade visual de uma pessoa ou entidade. Compound pattern (`AvatarImage`, `AvatarFallback`, `AvatarStatus`) com 5 tamanhos, 2 formatos, 7 cores de fallback e 4 status.",
      },
    },
  },
  argTypes: {
    size: {
      control: "select",
      options: ["xs", "sm", "md", "lg", "xl"],
    },
    shape: {
      control: "radio",
      options: ["circle", "square"],
    },
  },
};
export default meta;

type Story = StoryObj<typeof meta>;

const SAMPLE_IMG =
  "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=128&h=128&fit=crop";

export const Default: Story = {
  args: { size: "md", shape: "circle" },
  render: (args) => (
    <Avatar {...args}>
      <AvatarImage src={SAMPLE_IMG} alt="Fernando" />
      <AvatarFallback>{initials("Fernando Seguim")}</AvatarFallback>
    </Avatar>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div className="flex items-end gap-4">
      {(["xs", "sm", "md", "lg", "xl"] as const).map((size) => (
        <Avatar key={size} size={size}>
          <AvatarImage src={SAMPLE_IMG} alt="User" />
          <AvatarFallback>FS</AvatarFallback>
        </Avatar>
      ))}
    </div>
  ),
};

export const FallbackColors: Story = {
  render: () => (
    <div className="flex flex-wrap gap-3">
      {(
        ["violet", "orange", "pink", "yellow", "green", "blue", "gray"] as const
      ).map((color) => (
        <Avatar key={color} size="lg">
          <AvatarFallback color={color}>
            {color.slice(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
      ))}
    </div>
  ),
};

export const Shapes: Story = {
  render: () => (
    <div className="flex gap-4">
      <Avatar size="lg" shape="circle">
        <AvatarFallback color="violet">FS</AvatarFallback>
      </Avatar>
      <Avatar size="lg" shape="square">
        <AvatarFallback color="orange">FS</AvatarFallback>
      </Avatar>
    </div>
  ),
};

export const WithStatus: Story = {
  render: () => (
    <div className="flex gap-4">
      {(["online", "offline", "busy", "away"] as const).map((status) => (
        <Avatar key={status} size="lg">
          <AvatarImage src={SAMPLE_IMG} alt="User" />
          <AvatarFallback>FS</AvatarFallback>
          <AvatarStatus status={status} />
        </Avatar>
      ))}
    </div>
  ),
};

export const FallbackOnly: Story = {
  render: () => (
    <div className="flex gap-3">
      <Avatar size="md">
        <AvatarFallback color="violet">{initials("Ada Lovelace")}</AvatarFallback>
      </Avatar>
      <Avatar size="md">
        <AvatarFallback color="orange">
          {initials("Alan Turing")}
        </AvatarFallback>
      </Avatar>
      <Avatar size="md">
        <AvatarFallback color="pink">{initials("Grace Hopper")}</AvatarFallback>
      </Avatar>
    </div>
  ),
};

export const BrokenImage: Story = {
  render: () => (
    <Avatar size="lg">
      <AvatarImage src="/this-image-does-not-exist.jpg" alt="Broken" />
      <AvatarFallback color="gray">FS</AvatarFallback>
    </Avatar>
  ),
};

export const Group: Story = {
  render: () => (
    <div className="flex -space-x-2">
      {[
        { initials: "FS", color: "violet" as const },
        { initials: "AL", color: "orange" as const },
        { initials: "GH", color: "pink" as const },
        { initials: "AT", color: "green" as const },
      ].map((p) => (
        <Avatar key={p.initials} size="md" className="ring-2 ring-background">
          <AvatarFallback color={p.color}>{p.initials}</AvatarFallback>
        </Avatar>
      ))}
      <Avatar size="md" className="ring-2 ring-background">
        <AvatarFallback color="gray">+3</AvatarFallback>
      </Avatar>
    </div>
  ),
};
