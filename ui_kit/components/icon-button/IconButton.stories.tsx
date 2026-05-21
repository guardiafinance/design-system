import type { Meta, StoryObj } from "@storybook/react";
import {
  Bell,
  Bold,
  Copy,
  Download,
  Heart,
  MoreVertical,
  Pencil,
  Plus,
  Search,
  Settings,
  Trash2,
} from "lucide-react";

import { IconButton } from "./index";

const meta: Meta<typeof IconButton> = {
  title: "Components/IconButton",
  component: IconButton,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "Botão de ícone-único. Exige `aria-label` (ou `aria-labelledby`) — o TypeScript bloqueia a compilação sem um dos dois. Usado em toolbars, linhas de tabela e ações compactas.",
      },
    },
  },
  argTypes: {
    variant: {
      control: "select",
      options: ["default", "secondary", "destructive", "outline", "ghost"],
    },
    size: {
      control: "radio",
      options: ["sm", "md", "lg"],
    },
    shape: {
      control: "radio",
      options: ["square", "circle"],
    },
  },
};
export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    "aria-label": "Configurações",
    children: <Settings />,
  },
};

export const Variants: Story = {
  render: () => (
    <div className="flex items-center gap-2">
      <IconButton aria-label="Default" variant="default">
        <Plus />
      </IconButton>
      <IconButton aria-label="Secondary" variant="secondary">
        <Bell />
      </IconButton>
      <IconButton aria-label="Destructive" variant="destructive">
        <Trash2 />
      </IconButton>
      <IconButton aria-label="Outline" variant="outline">
        <Pencil />
      </IconButton>
      <IconButton aria-label="Ghost (default)" variant="ghost">
        <Copy />
      </IconButton>
    </div>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div className="flex items-center gap-2">
      <IconButton aria-label="Small" size="sm">
        <Search />
      </IconButton>
      <IconButton aria-label="Medium" size="md">
        <Search />
      </IconButton>
      <IconButton aria-label="Large" size="lg">
        <Search />
      </IconButton>
    </div>
  ),
};

export const Shapes: Story = {
  render: () => (
    <div className="flex items-center gap-2">
      <IconButton aria-label="Square" shape="square">
        <Heart />
      </IconButton>
      <IconButton aria-label="Circle" shape="circle">
        <Heart />
      </IconButton>
      <IconButton aria-label="Square solid" variant="default" shape="square">
        <Download />
      </IconButton>
      <IconButton aria-label="Circle solid" variant="default" shape="circle">
        <Download />
      </IconButton>
    </div>
  ),
};

export const Loading: Story = {
  args: {
    "aria-label": "Salvando",
    loading: true,
    variant: "default",
    children: <Plus />,
  },
};

export const Toolbar: Story = {
  render: () => (
    <div
      role="toolbar"
      aria-label="Ações da linha"
      className="flex items-center gap-1 rounded-md border border-border bg-background p-1"
    >
      <IconButton aria-label="Editar" size="sm">
        <Pencil />
      </IconButton>
      <IconButton aria-label="Copiar" size="sm">
        <Copy />
      </IconButton>
      <IconButton aria-label="Excluir" size="sm" variant="destructive">
        <Trash2 />
      </IconButton>
      <IconButton aria-label="Mais ações" size="sm">
        <MoreVertical />
      </IconButton>
    </div>
  ),
};

export const Disabled: Story = {
  args: {
    "aria-label": "Desabilitado",
    disabled: true,
    children: <Settings />,
  },
};

export const Formatting: Story = {
  render: () => (
    <div className="flex items-center gap-1">
      <IconButton aria-label="Negrito" variant="outline">
        <Bold />
      </IconButton>
    </div>
  ),
};
