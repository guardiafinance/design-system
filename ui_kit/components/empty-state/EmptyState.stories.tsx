import * as React from "react";
import type { Meta, StoryObj } from "@storybook/react";

import { EmptyState } from "./index";
import { Button } from "../button";

const meta: Meta<typeof EmptyState> = {
  title: "Components/EmptyState",
  component: EmptyState,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "Estado vazio canônico para 'no results', 'first-use' e 'no data yet'. Composição-only (sem Radix), `role=\"status\"` + `aria-live=\"polite\"` por default, CVA size ladder `sm | md | lg`, slots `Icon` ou `Illustration`, `Title`, `Description`, `Actions`. Apenas tokens semânticos — zero cor hardcoded.",
      },
    },
  },
  argTypes: {
    size: { control: "radio", options: ["sm", "md", "lg"] },
    as: { control: "radio", options: ["div", "section"] },
  },
};
export default meta;

type Story = StoryObj<typeof meta>;

const InboxIcon = () => (
  <svg
    width="28"
    height="28"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.6"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M3 12V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v7" />
    <path d="M3 12h6l2 3h2l2-3h6" />
    <path d="M3 12v6a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-6" />
  </svg>
);

const BoxIllustration = () => (
  <svg
    width="140"
    height="100"
    viewBox="0 0 140 100"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.4"
    strokeLinejoin="round"
    aria-hidden="true"
    className="text-muted-foreground"
  >
    <path d="M20 40 L70 15 L120 40 L70 65 Z" />
    <path d="M20 40 L20 80 L70 95 L70 65" />
    <path d="M120 40 L120 80 L70 95" />
    <path d="M20 40 L70 65 L120 40" />
  </svg>
);

// ──────────────────────────────────────────────────────────────────
// Default
// ──────────────────────────────────────────────────────────────────

export const Default: Story = {
  render: () => (
    <EmptyState>
      <EmptyState.Title>Nada por aqui</EmptyState.Title>
    </EmptyState>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "Renderização mínima: apenas `Title`. O layout centralizado vertical permanece consistente independentemente de quantos slots são preenchidos.",
      },
    },
  },
};

// ──────────────────────────────────────────────────────────────────
// WithIcon
// ──────────────────────────────────────────────────────────────────

export const WithIcon: Story = {
  render: () => (
    <EmptyState>
      <EmptyState.Icon>
        <InboxIcon />
      </EmptyState.Icon>
      <EmptyState.Title>Nenhum lançamento</EmptyState.Title>
      <EmptyState.Description>
        Conecte um banco para começar a conciliar.
      </EmptyState.Description>
    </EmptyState>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "Slot `Icon` adiciona o container quadrado com `bg-muted` e `text-foreground`. O ícone interno herda a cor do container — passe SVGs com `stroke=\"currentColor\"` ou `fill=\"currentColor\"` para casar com o tema.",
      },
    },
  },
};

// ──────────────────────────────────────────────────────────────────
// WithIllustration
// ──────────────────────────────────────────────────────────────────

export const WithIllustration: Story = {
  render: () => (
    <EmptyState size="lg">
      <EmptyState.Illustration>
        <BoxIllustration />
      </EmptyState.Illustration>
      <EmptyState.Title>Sem dados ainda</EmptyState.Title>
      <EmptyState.Description>
        Importe sua primeira planilha para visualizar os lançamentos do mês.
      </EmptyState.Description>
    </EmptyState>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "Slot `Illustration` é livre — sem background, sem cor imposta. Para SVG/PNG/Logo que já carregam paleta própria. Use `Icon` OU `Illustration`, nunca os dois.",
      },
    },
  },
};

// ──────────────────────────────────────────────────────────────────
// WithActions — single CTA
// ──────────────────────────────────────────────────────────────────

export const WithActionsSingle: Story = {
  name: "WithActions (1 CTA)",
  render: () => (
    <EmptyState>
      <EmptyState.Icon>
        <InboxIcon />
      </EmptyState.Icon>
      <EmptyState.Title>Nenhum lançamento</EmptyState.Title>
      <EmptyState.Description>
        Conecte um banco para começar a conciliar.
      </EmptyState.Description>
      <EmptyState.Actions>
        <Button>Conectar banco</Button>
      </EmptyState.Actions>
    </EmptyState>
  ),
};

// ──────────────────────────────────────────────────────────────────
// WithActions — primary + secondary
// ──────────────────────────────────────────────────────────────────

export const WithActionsDual: Story = {
  name: "WithActions (primary + secondary)",
  render: () => (
    <EmptyState>
      <EmptyState.Icon>
        <InboxIcon />
      </EmptyState.Icon>
      <EmptyState.Title>Nenhum lançamento</EmptyState.Title>
      <EmptyState.Description>
        Conecte um banco ou importe uma planilha para começar.
      </EmptyState.Description>
      <EmptyState.Actions>
        <Button>Conectar banco</Button>
        <Button variant="outline">Importar CSV</Button>
      </EmptyState.Actions>
    </EmptyState>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "Dois CTAs com hierarquia (primário + outline secundário). Em `size='sm'`, os botões empilham verticalmente; em `md`/`lg` ficam lado-a-lado.",
      },
    },
  },
};

// ──────────────────────────────────────────────────────────────────
// Sizes (sm / md / lg)
// ──────────────────────────────────────────────────────────────────

export const Sizes: Story = {
  render: () => (
    <div className="grid w-full gap-6 md:grid-cols-3">
      {(["sm", "md", "lg"] as const).map((size) => (
        <div
          key={size}
          className="rounded-lg border border-border bg-background"
        >
          <EmptyState size={size}>
            <EmptyState.Icon>
              <InboxIcon />
            </EmptyState.Icon>
            <EmptyState.Title>size={size}</EmptyState.Title>
            <EmptyState.Description>
              Padding, gap, ícone e tipografia escalam juntos.
            </EmptyState.Description>
            <EmptyState.Actions>
              <Button>Ação</Button>
            </EmptyState.Actions>
          </EmptyState>
        </div>
      ))}
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "Matriz 1×3 das três variantes de `size`. O ladder ecoa a referência legada: 42/56/72 px de ícone, 24/40/64 px de padding vertical.",
      },
    },
  },
};

// ──────────────────────────────────────────────────────────────────
// LongDescription
// ──────────────────────────────────────────────────────────────────

export const LongDescription: Story = {
  render: () => (
    <EmptyState>
      <EmptyState.Icon>
        <InboxIcon />
      </EmptyState.Icon>
      <EmptyState.Title>Nenhum lançamento encontrado</EmptyState.Title>
      <EmptyState.Description>
        Os filtros aplicados não retornaram resultados. Você pode ajustar o
        intervalo de datas, remover filtros de categoria, ou conectar uma nova
        fonte de dados. Lançamentos de contas conectadas aparecem aqui
        automaticamente após a próxima rodada de conciliação.
      </EmptyState.Description>
      <EmptyState.Actions>
        <Button>Ajustar filtros</Button>
      </EmptyState.Actions>
    </EmptyState>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "A descrição respeita `max-w-prose` para preservar uma medida legível mesmo em containers largos.",
      },
    },
  },
};

// ──────────────────────────────────────────────────────────────────
// DarkTheme (forced)
// ──────────────────────────────────────────────────────────────────

function DarkThemeDemo() {
  React.useEffect(() => {
    const previous = document.documentElement.getAttribute("data-theme");
    document.documentElement.setAttribute("data-theme", "dark");
    return () => {
      if (previous === null) {
        document.documentElement.removeAttribute("data-theme");
      } else {
        document.documentElement.setAttribute("data-theme", previous);
      }
    };
  }, []);
  return (
    <div className="rounded-lg bg-background p-6">
      <EmptyState>
        <EmptyState.Icon>
          <InboxIcon />
        </EmptyState.Icon>
        <EmptyState.Title>Nenhum lançamento</EmptyState.Title>
        <EmptyState.Description>
          Conecte um banco para começar a conciliar.
        </EmptyState.Description>
        <EmptyState.Actions>
          <Button>Conectar banco</Button>
        </EmptyState.Actions>
      </EmptyState>
    </div>
  );
}

export const DarkTheme: Story = {
  render: () => <DarkThemeDemo />,
  parameters: {
    docs: {
      description: {
        story:
          "Forçar `data-theme=\"dark\"` no `documentElement` para validar o token contract no tema escuro. `bg-muted`, `text-foreground` e `text-muted-foreground` reagem via CSS sem React re-render.",
      },
    },
  },
};
