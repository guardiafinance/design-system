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

/**
 * Força a story para o tema escuro independentemente do toggle global da
 * toolbar. Serve como contrato visual: o IconButton mantém WCAG AA das
 * 5 variantes × 3 tamanhos × 2 shapes sobre fundo Mono Black (#0E1016 /
 * Cinza 900 #17171B) declarado em lex-brand-colors.
 */
export const DarkTheme: Story = {
  globals: { theme: "dark" },
  parameters: {
    backgrounds: { default: "dark" },
    docs: {
      description: {
        story:
          "Matriz variants × sizes × shapes + estados loading/disabled sobre fundo escuro. Ghost (default) e outline usam tokens brand-aware (`bg-bg-hover`, `text-action-hover`, `border-action`); default/secondary/destructive mantêm contraste ≥ 4.5:1 com o ícone em dark mode conforme tokens de marca.",
      },
    },
  },
  render: () => (
    <div className="flex flex-col gap-8">
      <div className="flex flex-wrap items-center gap-2">
        {(
          ["default", "secondary", "destructive", "outline", "ghost"] as const
        ).map((variant) => (
          <IconButton key={variant} aria-label={variant} variant={variant}>
            <Settings />
          </IconButton>
        ))}
      </div>
      <div className="flex flex-wrap items-end gap-2">
        {(["sm", "md", "lg"] as const).map((size) => (
          <IconButton
            key={size}
            aria-label={`Search ${size}`}
            size={size}
            variant="default"
          >
            <Search />
          </IconButton>
        ))}
      </div>
      <div className="flex flex-wrap items-center gap-2">
        {(["square", "circle"] as const).map((shape) => (
          <IconButton
            key={shape}
            aria-label={`Heart ${shape}`}
            shape={shape}
            variant="secondary"
          >
            <Heart />
          </IconButton>
        ))}
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <IconButton aria-label="Salvando" loading variant="default">
          <Plus />
        </IconButton>
        <IconButton aria-label="Desabilitado" disabled variant="default">
          <Settings />
        </IconButton>
        <IconButton aria-label="Ghost loading" loading variant="ghost">
          <Plus />
        </IconButton>
        <IconButton aria-label="Outline disabled" disabled variant="outline">
          <Settings />
        </IconButton>
      </div>
      <div
        role="toolbar"
        aria-label="Ações compactas em dark"
        className="inline-flex items-center gap-1 rounded-md border border-border bg-background p-1"
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
    </div>
  ),
};
