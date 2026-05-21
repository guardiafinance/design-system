import type { Meta, StoryObj } from "@storybook/react";
import { Check, CircleAlert, CircleDot, Sparkles } from "lucide-react";

import { Badge } from "./index";

const meta: Meta<typeof Badge> = {
  title: "Components/Badge",
  component: Badge,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "Rótulo compacto para status, tags e contadores. Combina **7 variantes** × **3 aparências** × **2 formatos**, com ponto ou ícones opcionais. Zero cor hardcoded — tudo via tokens Guardia.",
      },
    },
  },
  argTypes: {
    variant: {
      control: "select",
      options: ["neutral", "brand", "accent", "success", "warning", "danger", "info"],
    },
    appearance: {
      control: "radio",
      options: ["solid", "soft", "outline"],
    },
    shape: {
      control: "radio",
      options: ["pill", "square"],
    },
  },
};
export default meta;

type Story = StoryObj<typeof meta>;

const VARIANTS = ["neutral", "brand", "accent", "success", "warning", "danger", "info"] as const;

export const Default: Story = {
  args: { children: "Ativo" },
};

export const Soft: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      {VARIANTS.map((v) => (
        <Badge key={v} variant={v}>
          {v}
        </Badge>
      ))}
    </div>
  ),
};

export const Solid: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      {VARIANTS.map((v) => (
        <Badge key={v} variant={v} appearance="solid">
          {v}
        </Badge>
      ))}
    </div>
  ),
};

export const Outline: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      {VARIANTS.map((v) => (
        <Badge key={v} variant={v} appearance="outline">
          {v}
        </Badge>
      ))}
    </div>
  ),
};

export const WithDot: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <Badge variant="success" dot>
        Em dia
      </Badge>
      <Badge variant="warning" dot>
        Pendente
      </Badge>
      <Badge variant="danger" dot>
        Atrasado
      </Badge>
      <Badge variant="info" dot>
        Em análise
      </Badge>
    </div>
  ),
};

export const WithIcons: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <Badge variant="success" leadingIcon={<Check />}>
        Conciliado
      </Badge>
      <Badge variant="warning" leadingIcon={<CircleAlert />}>
        Revisar
      </Badge>
      <Badge variant="brand" leadingIcon={<Sparkles />}>
        Novo
      </Badge>
      <Badge variant="info" trailingIcon={<CircleDot />}>
        Ao vivo
      </Badge>
    </div>
  ),
};

export const Square: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      {VARIANTS.map((v) => (
        <Badge key={v} variant={v} shape="square">
          {v}
        </Badge>
      ))}
    </div>
  ),
};

export const Counts: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-3">
      <Badge variant="neutral" appearance="solid" shape="pill">
        12
      </Badge>
      <Badge variant="accent" appearance="solid" shape="pill">
        3 novos
      </Badge>
      <Badge variant="danger" appearance="solid" shape="pill">
        99+
      </Badge>
    </div>
  ),
};
