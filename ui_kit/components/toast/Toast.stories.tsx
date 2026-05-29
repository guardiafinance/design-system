import type { Meta, StoryObj } from "@storybook/react";
import * as React from "react";

import {
  Toast,
  ToastProvider,
  ToastViewport,
  ToastTitle,
  ToastDescription,
  ToastAction,
  ToastClose,
  useToast,
  type ToastTone,
  type ToastPosition,
} from "./index";
import { Button } from "../button";

const meta: Meta<typeof ToastProvider> = {
  title: "Components/Toast",
  component: ToastProvider,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          'Notificação transiente empilhada no canto da viewport. Toast sinaliza o resultado de uma ação ocorrida há pouco tempo (criação, falha, processamento) — para feedback persistente in-flow use `<Alert>`; para confirmação modal use `<Dialog>` ou `<AlertDialog>`. Base em `@radix-ui/react-toast`, com API imperativa canônica `<ToastProvider>` + `useToast()` (paridade com o playground legado) e primitivas declarativas re-exportadas. Tons `info` / `success` / `warning` / `error` reutilizam o token chain de ADR-011 (Alert) — mesma paleta semântica nas duas superfícies.',
      },
    },
  },
  argTypes: {
    position: {
      control: "select",
      options: [
        "bottom-right",
        "bottom-left",
        "top-right",
        "top-left",
        "bottom-center",
        "top-center",
      ],
    },
    duration: { control: "number" },
    limit: { control: "number" },
  },
};
export default meta;

type Story = StoryObj<typeof meta>;

// ──────────────────────────────────────────────────────────────────
// Trigger — small button that fires a toast via useToast()
// ──────────────────────────────────────────────────────────────────

interface TriggerProps {
  tone: ToastTone;
  title: React.ReactNode;
  description?: React.ReactNode;
  duration?: number;
  withAction?: boolean;
}

function Trigger({
  tone,
  title,
  description,
  duration,
  withAction,
}: TriggerProps): React.ReactElement {
  const { toast } = useToast();
  return (
    <Button
      onClick={() =>
        toast({
          tone,
          title,
          description,
          duration,
          action: withAction
            ? {
                label: "Desfazer",
                onClick: () => {},
              }
            : undefined,
        })
      }
    >
      Disparar {tone}
    </Button>
  );
}

// ──────────────────────────────────────────────────────────────────
// Default
// ──────────────────────────────────────────────────────────────────

export const Default: Story = {
  render: () => (
    <ToastProvider>
      <Trigger
        tone="info"
        title="Processando 248 lançamentos…"
      />
    </ToastProvider>
  ),
};

// ──────────────────────────────────────────────────────────────────
// Tones
// ──────────────────────────────────────────────────────────────────

export const Tones: Story = {
  render: () => (
    <ToastProvider>
      <div className="flex flex-wrap gap-2">
        <Trigger tone="info" title="Processando 248 lançamentos…" />
        <Trigger
          tone="success"
          title="Conciliação concluída"
          description="237 aprovados · 11 pendentes"
        />
        <Trigger
          tone="warning"
          title="Revisão humana necessária"
          description="3 itens abaixo do limiar de confiança"
        />
        <Trigger
          tone="error"
          title="Falha ao sincronizar com o Itaú"
          description="Reconecte sua conta para continuar"
        />
      </div>
    </ToastProvider>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "Matriz de tons consumindo `--info-soft` / `--success-soft` / `--warning-soft` / `--danger-soft` — mesmos tokens de Alert (ADR-011). `info` e `success` renderizam `role=\"status\"` (polite); `warning` e `error` renderizam `role=\"alert\"` (assertive).",
      },
    },
  },
};

// ──────────────────────────────────────────────────────────────────
// WithAction
// ──────────────────────────────────────────────────────────────────

export const WithAction: Story = {
  render: () => (
    <ToastProvider>
      <Trigger
        tone="success"
        title="Lançamento aprovado"
        description="NF 4891 movida para a contabilidade"
        withAction
      />
    </ToastProvider>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "Botão de ação à direita. Radix exige `altText` para que o conteúdo seja anunciado em modo assertivo — a wrapper preenche automaticamente quando `label` é string.",
      },
    },
  },
};

// ──────────────────────────────────────────────────────────────────
// WithTitleOnly
// ──────────────────────────────────────────────────────────────────

export const WithTitleOnly: Story = {
  render: () => (
    <ToastProvider>
      <Trigger tone="info" title="Salvo" />
    </ToastProvider>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "Toast minimalista, apenas com `ToastTitle`. Útil para confirmações rápidas (`Salvo`, `Copiado`).",
      },
    },
  },
};

// ──────────────────────────────────────────────────────────────────
// WithDescription
// ──────────────────────────────────────────────────────────────────

export const WithDescription: Story = {
  render: () => (
    <ToastProvider>
      <Trigger
        tone="info"
        title="Atualização disponível"
        description="A versão 0.2 traz suporte a Toast persistente, swipe e fila de notificações. Recarregue para receber."
      />
    </ToastProvider>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "`ToastDescription` aceita parágrafos múltiplos. O selector `[&_p]:m-0` mantém a leitura consistente.",
      },
    },
  },
};

// ──────────────────────────────────────────────────────────────────
// Persistent (duration = Infinity)
// ──────────────────────────────────────────────────────────────────

export const Persistent: Story = {
  render: () => (
    <ToastProvider>
      <Trigger
        tone="warning"
        title="Certificado vence em 7 dias"
        description="Renove para evitar interrupção do serviço"
        duration={Infinity}
      />
    </ToastProvider>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "`duration: Infinity` (ou `0` como alias compat) torna o Toast persistente — só sai via `ToastClose` ou `dismiss(id)`.",
      },
    },
  },
};

// ──────────────────────────────────────────────────────────────────
// Positions — bottom-right (default), top-right, top-center
// ──────────────────────────────────────────────────────────────────

function PositionDemo({
  position,
}: {
  position: ToastPosition;
}): React.ReactElement {
  return (
    <ToastProvider position={position}>
      <Trigger tone="info" title={`position="${position}"`} />
    </ToastProvider>
  );
}

export const Positions: Story = {
  render: () => (
    <div className="flex flex-col gap-3">
      <PositionDemo position="bottom-right" />
      <PositionDemo position="top-right" />
      <PositionDemo position="top-center" />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Posição configurável via prop `position` em `<ToastProvider>`. 6 cantos: `bottom-right` (default), `bottom-left`, `top-right`, `top-left`, `bottom-center`, `top-center`. `swipeDirection` é derivado automaticamente.',
      },
    },
  },
};

// ──────────────────────────────────────────────────────────────────
// Stacked — fire 4 toasts in sequence with limit
// ──────────────────────────────────────────────────────────────────

function StackTrigger(): React.ReactElement {
  const { toast } = useToast();
  const counter = React.useRef(0);
  return (
    <Button
      onClick={() => {
        const tones: ToastTone[] = ["info", "success", "warning", "error"];
        tones.forEach((tone, index) => {
          setTimeout(() => {
            counter.current += 1;
            toast({
              tone,
              title: `Toast #${counter.current}`,
              description: `Tipo ${tone}`,
            });
          }, index * 200);
        });
      }}
    >
      Disparar 4 em sequência
    </Button>
  );
}

export const Stacked: Story = {
  render: () => (
    <ToastProvider limit={5}>
      <StackTrigger />
    </ToastProvider>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "Empilhamento FIFO com `limit=5` (default). Quando o limite é atingido, novos toasts entram em fila e ganham slot conforme os existentes são dispensados.",
      },
    },
  },
};

// ──────────────────────────────────────────────────────────────────
// DeclarativeComposition — Toast as Radix-style composition
// ──────────────────────────────────────────────────────────────────

export const DeclarativeComposition: Story = {
  render: () => (
    <ToastProvider hideViewport>
      <Toast tone="success" open>
        <ToastTitle>Composição declarativa</ToastTitle>
        <ToastDescription>
          Útil quando o consumidor precisa de markup customizado — avatar,
          barra de progresso, layout específico — sem perder o token contract
          do design system.
        </ToastDescription>
        <ToastAction altText="Desfazer">Desfazer</ToastAction>
        <ToastClose />
      </Toast>
      <ToastViewport />
    </ToastProvider>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "API declarativa via primitivas Radix re-exportadas. Casa com Dialog/Popover: `<Toast tone=\"...\" open>` + filhos = controle total da composição.",
      },
    },
  },
};
