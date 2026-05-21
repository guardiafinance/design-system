import type { Meta, StoryObj } from "@storybook/react";

import { Spinner } from "./index";

const meta: Meta<typeof Spinner> = {
  title: "Components/Spinner",
  component: Spinner,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "Indicador circular de carregamento. Cinco tamanhos (xs/sm/md/lg/xl) e quatro cores (current/brand/accent/white). Anima a 900ms linear, respeita `prefers-reduced-motion` e expõe `role=\"status\"` + `aria-label` por default.",
      },
    },
  },
  argTypes: {
    size: { control: "radio", options: ["xs", "sm", "md", "lg", "xl"] },
    color: { control: "radio", options: ["current", "brand", "accent", "white"] },
    label: { control: "text" },
  },
};
export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Sizes: Story = {
  render: () => (
    <div className="flex items-center gap-6">
      <Spinner size="xs" />
      <Spinner size="sm" />
      <Spinner size="md" />
      <Spinner size="lg" />
      <Spinner size="xl" />
    </div>
  ),
};

export const Colors: Story = {
  render: () => (
    <div className="flex items-center gap-6">
      <Spinner color="current" size="lg" />
      <Spinner color="brand" size="lg" />
      <Spinner color="accent" size="lg" />
    </div>
  ),
};

export const OnDarkBackground: Story = {
  render: () => (
    <div className="flex items-center gap-6 rounded-md bg-guardia-violet-900 p-6">
      <Spinner color="white" size="lg" />
      <Spinner color="white" size="xl" />
    </div>
  ),
};

export const Inline: Story = {
  render: () => (
    <div className="flex flex-col gap-3 text-sm">
      <div className="flex items-center gap-2 text-guardia-violet-500">
        <Spinner color="current" size="sm" /> Conciliando 248 lançamentos…
      </div>
      <div className="flex items-center gap-2 text-guardia-orange-500">
        <Spinner color="current" size="sm" /> Gerando relatório fiscal…
      </div>
      <div className="flex items-center gap-2 text-foreground">
        <Spinner color="brand" size="sm" /> Processando pagamento…
      </div>
    </div>
  ),
};

export const CustomLabel: Story = {
  args: { label: "Conciliando lançamentos", size: "lg", color: "brand" },
};

export const Decorative: Story = {
  args: { "aria-hidden": true, size: "lg" },
  parameters: {
    docs: {
      description: {
        story:
          "Quando o estado de loading já está sendo anunciado por outro elemento (ex.: um <code>aria-live</code> region), passe <code>aria-hidden</code> para suprimir a duplicação.",
      },
    },
  },
};
