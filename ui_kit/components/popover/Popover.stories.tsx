import type { Meta, StoryObj } from "@storybook/react";

import {
  Popover,
  PopoverAnchor,
  PopoverClose,
  PopoverContent,
  PopoverTrigger,
} from "./index";
import { Button } from "../button";

const meta: Meta<typeof Popover> = {
  title: "Components/Popover",
  component: Popover,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Pop flutuante ancorado por clique. Conteúdo pequeno: filtros, forms compactos, hints acionáveis. Base no Radix Popover; tokens semânticos canônicos; CVA size ladder sm 8 / md 12 / lg 16 alinhado com Combobox e Select.",
      },
    },
  },
};
export default meta;

type Story = StoryObj<typeof meta>;

// ──────────────────────────────────────────────────────────────────
// Default
// ──────────────────────────────────────────────────────────────────

export const Default: Story = {
  render: () => (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline">Abrir popover</Button>
      </PopoverTrigger>
      <PopoverContent>
        <div className="grid gap-2">
          <h4 className="text-sm font-medium text-fg">Título do popover</h4>
          <p className="text-[13px] text-fg-muted">
            Conteúdo curto, ancorado ao trigger. Fecha em Escape ou clique
            fora.
          </p>
        </div>
      </PopoverContent>
    </Popover>
  ),
};

// ──────────────────────────────────────────────────────────────────
// Sides (top / right / bottom / left)
// ──────────────────────────────────────────────────────────────────

export const Sides: Story = {
  render: () => (
    <div className="grid grid-cols-2 gap-8 p-12">
      {(["top", "right", "bottom", "left"] as const).map((side) => (
        <Popover key={side}>
          <PopoverTrigger asChild>
            <Button variant="outline">side={side}</Button>
          </PopoverTrigger>
          <PopoverContent side={side}>
            <p className="text-sm text-fg">Posicionado em {side}.</p>
          </PopoverContent>
        </Popover>
      ))}
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "Posicionamento via prop `side`. Radix pode inverter automaticamente em caso de collision; o `data-side` no DOM reflete o lado resolvido.",
      },
    },
  },
};

// ──────────────────────────────────────────────────────────────────
// Alignments (start / center / end)
// ──────────────────────────────────────────────────────────────────

export const Alignments: Story = {
  render: () => (
    <div className="flex gap-6">
      {(["start", "center", "end"] as const).map((align) => (
        <Popover key={align}>
          <PopoverTrigger asChild>
            <Button variant="outline">align={align}</Button>
          </PopoverTrigger>
          <PopoverContent align={align}>
            <p className="text-sm text-fg">Alinhamento {align}.</p>
          </PopoverContent>
        </Popover>
      ))}
    </div>
  ),
};

// ──────────────────────────────────────────────────────────────────
// Sizes (sm 8 / md 12 / lg 16)
// ──────────────────────────────────────────────────────────────────

export const Sizes: Story = {
  render: () => (
    <div className="flex gap-4">
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline">sm (8px)</Button>
        </PopoverTrigger>
        <PopoverContent size="sm">
          <p>Compacto — filter pop / hint.</p>
        </PopoverContent>
      </Popover>
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline">md (12px) · default</Button>
        </PopoverTrigger>
        <PopoverContent size="md">
          <p>Tamanho padrão.</p>
        </PopoverContent>
      </Popover>
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline">lg (16px)</Button>
        </PopoverTrigger>
        <PopoverContent size="lg">
          <p>Mais respiração — mini-cards, multi-line forms.</p>
        </PopoverContent>
      </Popover>
    </div>
  ),
};

// ──────────────────────────────────────────────────────────────────
// With Anchor (decoupled anchor + trigger)
// ──────────────────────────────────────────────────────────────────

export const WithAnchor: Story = {
  render: () => (
    <Popover>
      <div className="flex items-center gap-12">
        <PopoverAnchor asChild>
          <div className="rounded-md border border-border-strong bg-muted px-4 py-2 text-sm text-fg">
            Linha ancorada (anchor)
          </div>
        </PopoverAnchor>
        <PopoverTrigger asChild>
          <Button variant="outline">Trigger separado</Button>
        </PopoverTrigger>
      </div>
      <PopoverContent>
        <p className="text-sm text-fg">
          O popover ancora no <code>PopoverAnchor</code>, não no trigger.
        </p>
      </PopoverContent>
    </Popover>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "Decoupla o ponto visual de ancoragem do trigger de clique. Útil em data grids onde o popover deve aparecer junto a uma linha, mas o trigger vive em outro lugar.",
      },
    },
  },
};

// ──────────────────────────────────────────────────────────────────
// With Close (PopoverClose inside content)
// ──────────────────────────────────────────────────────────────────

export const WithClose: Story = {
  render: () => (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline">Abrir com botão de fechar</Button>
      </PopoverTrigger>
      <PopoverContent>
        <div className="grid gap-3">
          <p className="text-sm text-fg">
            Conteúdo do popover. O botão abaixo fecha sem precisar de
            <code>onOpenChange</code>.
          </p>
          <PopoverClose asChild>
            <Button variant="outline" size="sm">
              Fechar
            </Button>
          </PopoverClose>
        </div>
      </PopoverContent>
    </Popover>
  ),
};

// ──────────────────────────────────────────────────────────────────
// Disabled trigger
// ──────────────────────────────────────────────────────────────────

export const Disabled: Story = {
  render: () => (
    <Popover>
      <PopoverTrigger disabled asChild>
        <Button variant="outline" disabled>
          Trigger desabilitado
        </Button>
      </PopoverTrigger>
      <PopoverContent>
        <p>Nunca renderizado — trigger não dispara.</p>
      </PopoverContent>
    </Popover>
  ),
};

// ──────────────────────────────────────────────────────────────────
// Modal (background interaction blocked)
// ──────────────────────────────────────────────────────────────────

export const Modal: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <Popover modal>
        <PopoverTrigger asChild>
          <Button variant="outline">Modal popover</Button>
        </PopoverTrigger>
        <PopoverContent>
          <p className="text-sm text-fg">
            <code>modal=true</code>: clique fora não interage com o fundo até
            fechar o popover.
          </p>
        </PopoverContent>
      </Popover>
      <Button variant="outline">Botão de fundo</Button>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "`modal=false` é o default — preserva interação com o fundo. Use `modal=true` quando o popover age como mini-diálogo de confirmação.",
      },
    },
  },
};

// ──────────────────────────────────────────────────────────────────
// Dark theme matrix
// ──────────────────────────────────────────────────────────────────

/**
 * Popover no tema dark.
 *
 * Espelha o pattern do Combobox (`Combobox.stories.tsx::DarkTheme`),
 * Avatar (PR #119), Button (#209). O `Popover.Portal` do Radix
 * renderiza fora do decorator de tema; a cobertura a11y em ambos
 * os temas (com `axeInThemes`) fica em `Popover.test.tsx`. Aqui
 * forçamos `globals.theme="dark"` para validar visualmente o estado
 * fechado das variantes principais.
 */
export const DarkTheme: Story = {
  globals: { theme: "dark" },
  parameters: {
    backgrounds: { default: "dark" },
    docs: {
      description: {
        story:
          "Matriz de variantes no tema dark — triggers fechados em cada size + Disabled. Tokens (`bg-background`, `text-fg`, `border-border-strong`, `shadow-lg`, `ring-ring`) flipam via `[data-theme=dark]` no `<html>`.",
      },
    },
  },
  render: () => (
    <div className="flex flex-col gap-4 p-4">
      <div className="flex gap-3">
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline">Default</Button>
          </PopoverTrigger>
          <PopoverContent>
            <p>Conteúdo no tema dark.</p>
          </PopoverContent>
        </Popover>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline">Sm</Button>
          </PopoverTrigger>
          <PopoverContent size="sm">
            <p>Compacto.</p>
          </PopoverContent>
        </Popover>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline">Lg</Button>
          </PopoverTrigger>
          <PopoverContent size="lg">
            <p>Largo.</p>
          </PopoverContent>
        </Popover>
        <Popover>
          <PopoverTrigger disabled asChild>
            <Button variant="outline" disabled>
              Disabled
            </Button>
          </PopoverTrigger>
          <PopoverContent>
            <p>Nunca abre.</p>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  ),
};
