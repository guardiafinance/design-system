import type { Meta, StoryObj } from "@storybook/react";
import { Info } from "lucide-react";

import { Tooltip, TooltipContent, TooltipTrigger } from "./index";
import { Button } from "../button";
import { IconButton } from "../icon-button";

const meta: Meta<typeof Tooltip> = {
  title: "Components/Tooltip",
  component: Tooltip,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Hint flutuante acionado por hover ou foco. Microcopy contextual: atalhos de teclado, descrição curta de ícone, esclarecimento de campo. Base no Radix Tooltip; tokens semânticos canônicos; CVA size ladder sm 8 / md 12 / lg 16 alinhado com Popover.",
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
    <Tooltip>
      <TooltipTrigger asChild>
        <Button variant="outline">Hover ou foco</Button>
      </TooltipTrigger>
      <TooltipContent>Dica curta com defaults Radix.</TooltipContent>
    </Tooltip>
  ),
};

// ──────────────────────────────────────────────────────────────────
// Sizes (sm 8 / md 12 / lg 16)
// ──────────────────────────────────────────────────────────────────

export const Sizes: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="outline">sm (8px)</Button>
        </TooltipTrigger>
        <TooltipContent size="sm">Compacto — atalho de teclado.</TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="outline">md (12px) · default</Button>
        </TooltipTrigger>
        <TooltipContent size="md">Tamanho padrão.</TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="outline">lg (16px)</Button>
        </TooltipTrigger>
        <TooltipContent size="lg">
          Mais respiração — descrição de feature acionável.
        </TooltipContent>
      </Tooltip>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "Size ladder espelha Popover (8/12/16px de padding). Tipografia em duas rungs (xs para sm, sm para md e lg) — `lg` não sobe para `text-base` por causa do max-width natural do tooltip.",
      },
    },
  },
};

// ──────────────────────────────────────────────────────────────────
// Sides (top / right / bottom / left)
// ──────────────────────────────────────────────────────────────────

export const Sides: Story = {
  render: () => (
    <div className="grid grid-cols-2 gap-8 p-12">
      {(["top", "right", "bottom", "left"] as const).map((side) => (
        <Tooltip key={side}>
          <TooltipTrigger asChild>
            <Button variant="outline">side={side}</Button>
          </TooltipTrigger>
          <TooltipContent side={side}>Posicionado em {side}.</TooltipContent>
        </Tooltip>
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
// Disabled trigger (consumer-side disable pattern)
// ──────────────────────────────────────────────────────────────────

export const Disabled: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="outline" disabled>
            Trigger desabilitado
          </Button>
        </TooltipTrigger>
        <TooltipContent>Nunca renderizado — trigger não dispara.</TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger asChild>
          <IconButton aria-label="Saiba mais" variant="outline">
            <Info width={16} height={16} aria-hidden="true" />
          </IconButton>
        </TooltipTrigger>
        <TooltipContent>Saiba mais sobre este recurso.</TooltipContent>
      </Tooltip>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "Trigger desabilitado é responsabilidade do consumidor (via `disabled` no `<button>` slotado por `asChild`). O Radix não abre o tooltip enquanto o trigger estiver desabilitado.",
      },
    },
  },
};

// ──────────────────────────────────────────────────────────────────
// LongContent — wrap dentro do max-w-xs
// ──────────────────────────────────────────────────────────────────

export const LongContent: Story = {
  render: () => (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button variant="outline">Conteúdo longo</Button>
      </TooltipTrigger>
      <TooltipContent>
        Tooltip com texto mais longo para validar o wrap dentro do{" "}
        <code>max-w-xs</code> default. Use <code>lg</code> para descrições
        maiores; para conteúdo realmente extenso, prefira{" "}
        <code>&lt;Popover&gt;</code> no lugar.
      </TooltipContent>
    </Tooltip>
  ),
};

// ──────────────────────────────────────────────────────────────────
// WithDelays — delayDuration + skipDelayDuration explícitos
// ──────────────────────────────────────────────────────────────────

export const WithDelays: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <Tooltip delayDuration={0}>
        <TooltipTrigger asChild>
          <Button variant="outline">delayDuration=0</Button>
        </TooltipTrigger>
        <TooltipContent>Abre imediatamente.</TooltipContent>
      </Tooltip>
      <Tooltip delayDuration={1500}>
        <TooltipTrigger asChild>
          <Button variant="outline">delayDuration=1500</Button>
        </TooltipTrigger>
        <TooltipContent>Espera 1.5s antes de abrir.</TooltipContent>
      </Tooltip>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "`delayDuration` controla o tempo de hover antes de abrir; `skipDelayDuration` (no Provider) controla a janela em que tooltips subsequentes abrem sem o delay completo. Defaults Radix: 700ms / 300ms.",
      },
    },
  },
};

// ──────────────────────────────────────────────────────────────────
// Controlled — open + onOpenChange
// ──────────────────────────────────────────────────────────────────

import * as React from "react";

function ControlledExample() {
  const [open, setOpen] = React.useState(false);
  return (
    <div className="flex items-center gap-3">
      <Tooltip open={open} onOpenChange={setOpen}>
        <TooltipTrigger asChild>
          <Button variant="outline">Trigger controlado</Button>
        </TooltipTrigger>
        <TooltipContent>
          Estado controlado pelo botão à direita.
        </TooltipContent>
      </Tooltip>
      <Button variant="outline" onClick={() => setOpen((v) => !v)}>
        {open ? "Fechar" : "Abrir"}
      </Button>
    </div>
  );
}

export const Controlled: Story = {
  render: () => <ControlledExample />,
  parameters: {
    docs: {
      description: {
        story:
          "Modo controlado — `open` + `onOpenChange`. Útil quando o consumidor precisa coordenar abertura/fechamento com outro estado (ex.: tour guiado, onboarding).",
      },
    },
  },
};

// ──────────────────────────────────────────────────────────────────
// Dark theme matrix
// ──────────────────────────────────────────────────────────────────

/**
 * Tooltip no tema dark.
 *
 * Espelha o pattern do Popover (`Popover.stories.tsx::DarkTheme`),
 * Combobox (#219) e Select (PR #226). O `Tooltip.Portal` do Radix
 * renderiza fora do decorator de tema; a cobertura a11y em ambos
 * os temas (com `axeInThemes`) fica em `Tooltip.test.tsx`. Aqui
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
          "Matriz de variantes no tema dark — triggers fechados em cada size + Disabled. Tokens (`bg-background`, `text-fg`, `border-border-strong`, `shadow-md`, `ring-ring`) flipam via `[data-theme=dark]` no `<html>`.",
      },
    },
  },
  render: () => (
    <div className="flex flex-col gap-4 p-4">
      <div className="flex flex-wrap gap-3">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="outline">Default</Button>
          </TooltipTrigger>
          <TooltipContent>Conteúdo no tema dark.</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="outline">Sm</Button>
          </TooltipTrigger>
          <TooltipContent size="sm">Compacto.</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="outline">Lg</Button>
          </TooltipTrigger>
          <TooltipContent size="lg">Largo.</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="outline" disabled>
              Disabled
            </Button>
          </TooltipTrigger>
          <TooltipContent>Nunca abre.</TooltipContent>
        </Tooltip>
      </div>
    </div>
  ),
};
