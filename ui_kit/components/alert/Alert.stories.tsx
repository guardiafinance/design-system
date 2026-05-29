import type { Meta, StoryObj } from "@storybook/react";
import {
  Info,
  CheckCircle2,
  TriangleAlert,
  CircleX,
} from "lucide-react";

import {
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  AlertActions,
  AlertClose,
} from "./index";
import { Button } from "../button";

const meta: Meta<typeof Alert> = {
  title: "Components/Alert",
  component: Alert,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "Banner inline com severidade semântica para feedback persistente in-flow. Tons info / success / warning / error, ARIA polite por default (`role=\"status\"`) ou assertivo (`role=\"alert\"`), ladder de tamanho sm 8 / md 12 / lg 16 alinhado com Popover e Tooltip. Para feedback transiente, use Toast; para confirmações modais, use Dialog ou AlertDialog.",
      },
    },
  },
  argTypes: {
    tone: {
      control: "select",
      options: ["info", "success", "warning", "error"],
    },
    size: { control: "select", options: ["sm", "md", "lg"] },
    assertive: { control: "boolean" },
  },
};
export default meta;

type Story = StoryObj<typeof meta>;

// ──────────────────────────────────────────────────────────────────
// Default
// ──────────────────────────────────────────────────────────────────

export const Default: Story = {
  render: () => (
    <Alert>
      <AlertIcon>
        <Info />
      </AlertIcon>
      <AlertTitle>Pagamento agendado</AlertTitle>
      <AlertDescription>O envio acontece amanhã às 09:00.</AlertDescription>
    </Alert>
  ),
};

// ──────────────────────────────────────────────────────────────────
// Tones (info / success / warning / error)
// ──────────────────────────────────────────────────────────────────

export const Tones: Story = {
  render: () => (
    <div className="flex flex-col gap-3">
      <Alert tone="info">
        <AlertIcon>
          <Info />
        </AlertIcon>
        <AlertTitle>Informativo</AlertTitle>
        <AlertDescription>Próximo fechamento: 30/jun.</AlertDescription>
      </Alert>
      <Alert tone="success">
        <AlertIcon>
          <CheckCircle2 />
        </AlertIcon>
        <AlertTitle>Importação concluída</AlertTitle>
        <AlertDescription>1.284 lançamentos conciliados.</AlertDescription>
      </Alert>
      <Alert tone="warning">
        <AlertIcon>
          <TriangleAlert />
        </AlertIcon>
        <AlertTitle>Saldo divergente</AlertTitle>
        <AlertDescription>3 contas precisam revisão manual.</AlertDescription>
      </Alert>
      <Alert tone="error">
        <AlertIcon>
          <CircleX />
        </AlertIcon>
        <AlertTitle>Falha no upload</AlertTitle>
        <AlertDescription>O arquivo CSV está malformado.</AlertDescription>
      </Alert>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "Matriz de tons consumindo `--info-soft` / `--success-soft` / `--warning-soft` / `--danger-soft`. O prop `tone` adota a vocabulary `error` (alias do `--danger` chain), espelhando os states de formulário em Combobox, Input e Select.",
      },
    },
  },
};

// ──────────────────────────────────────────────────────────────────
// Sizes (sm 8 / md 12 / lg 16)
// ──────────────────────────────────────────────────────────────────

export const Sizes: Story = {
  render: () => (
    <div className="flex flex-col gap-3">
      <Alert size="sm" tone="info">
        <AlertIcon>
          <Info />
        </AlertIcon>
        <AlertTitle>sm — 8px</AlertTitle>
      </Alert>
      <Alert size="md" tone="info">
        <AlertIcon>
          <Info />
        </AlertIcon>
        <AlertTitle>md — 12px (default)</AlertTitle>
      </Alert>
      <Alert size="lg" tone="info">
        <AlertIcon>
          <Info />
        </AlertIcon>
        <AlertTitle>lg — 16px</AlertTitle>
        <AlertDescription>Mais respiração para mensagens densas.</AlertDescription>
      </Alert>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "Ladder de padding `p-2` / `p-3` / `p-4` espelhando Popover e Tooltip. Tipografia em duas raias (`text-xs` para `sm`, `text-sm` para `md` e `lg`).",
      },
    },
  },
};

// ──────────────────────────────────────────────────────────────────
// WithIcon (showcase of leading slot independence)
// ──────────────────────────────────────────────────────────────────

export const WithIcon: Story = {
  render: () => (
    <Alert tone="success">
      <AlertIcon>
        <CheckCircle2 />
      </AlertIcon>
      <AlertTitle>Relatório pronto</AlertTitle>
      <AlertDescription>Disponível em &quot;Exportações&quot;.</AlertDescription>
    </Alert>
  ),
};

// ──────────────────────────────────────────────────────────────────
// WithActions (trailing slot with Button)
// ──────────────────────────────────────────────────────────────────

export const WithActions: Story = {
  render: () => (
    <Alert tone="warning">
      <AlertIcon>
        <TriangleAlert />
      </AlertIcon>
      <AlertTitle>Há rascunho não publicado</AlertTitle>
      <AlertActions>
        <Button variant="ghost" size="sm">
          Descartar
        </Button>
        <Button size="sm">Publicar</Button>
      </AlertActions>
    </Alert>
  ),
};

// ──────────────────────────────────────────────────────────────────
// WithClose (dismiss surface)
// ──────────────────────────────────────────────────────────────────

export const WithClose: Story = {
  render: () => (
    <Alert tone="info">
      <AlertIcon>
        <Info />
      </AlertIcon>
      <AlertTitle>Atualização disponível</AlertTitle>
      <AlertDescription>Recarregue para receber a v0.2.</AlertDescription>
      <AlertClose />
    </Alert>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "Dismiss via `<AlertClose>`. Em modo uncontrolled (default), o clique desmonta a árvore inteira do Alert. Em modo controlled (`open` + `onOpenChange`), o parent é a fonte da verdade.",
      },
    },
  },
};

// ──────────────────────────────────────────────────────────────────
// LongContent
// ──────────────────────────────────────────────────────────────────

export const LongContent: Story = {
  render: () => (
    <Alert tone="info">
      <AlertIcon>
        <Info />
      </AlertIcon>
      <AlertTitle>Vários parágrafos</AlertTitle>
      <AlertDescription>
        <p>
          Primeira linha do corpo do alert, ainda no fluxo padrão de leitura
          esperado para um banner persistente.
        </p>
        <p>
          Segunda linha mais comprida — o seletor interno `[&_p]:leading-relaxed`
          mantém a respiração consistente em qualquer densidade de parágrafo.
        </p>
      </AlertDescription>
    </Alert>
  ),
};

// ──────────────────────────────────────────────────────────────────
// DarkTheme (forçado via data-theme="dark" no host)
// ──────────────────────────────────────────────────────────────────

export const DarkTheme: Story = {
  render: () => (
    <div data-theme="dark" className="bg-background p-6">
      <div className="flex flex-col gap-3">
        <Alert tone="info">
          <AlertIcon>
            <Info />
          </AlertIcon>
          <AlertTitle>Informativo (dark)</AlertTitle>
          <AlertDescription>
            Soft surface tingida via `color-mix(in oklab, ...)`.
          </AlertDescription>
        </Alert>
        <Alert tone="success">
          <AlertIcon>
            <CheckCircle2 />
          </AlertIcon>
          <AlertTitle>Sucesso (dark)</AlertTitle>
          <AlertDescription>Texto mono-white sobre soft escurecido.</AlertDescription>
        </Alert>
        <Alert tone="warning">
          <AlertIcon>
            <TriangleAlert />
          </AlertIcon>
          <AlertTitle>Aviso (dark)</AlertTitle>
        </Alert>
        <Alert tone="error">
          <AlertIcon>
            <CircleX />
          </AlertIcon>
          <AlertTitle>Erro (dark)</AlertTitle>
          <AlertClose />
        </Alert>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "Paridade dark via override de `--*-soft` e `--*-fg` em `:root[data-theme=\"dark\"]` (ADR-011). O mix de 18% sobre `--guardia-gray-800` mantém o tom reconhecível sem comprometer contraste contra mono-white.",
      },
    },
  },
};
