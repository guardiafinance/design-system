import * as React from "react";
import type { Meta, StoryObj } from "@storybook/react";

import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
  type DrawerContentSide,
  type DrawerContentSize,
} from "./index";
import { Button } from "../button";
import { Input } from "../input";
import { Label } from "../label";

const meta: Meta<typeof Drawer> = {
  title: "Components/Drawer",
  component: Drawer,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Painel lateral modal ancorado a uma borda do viewport. Use para contextos secundários que mantêm a superfície principal em vista — filtros, formulários secundários, painéis de detalhe, bandeja de notificações. Base no Radix Dialog; tokens semânticos canônicos; CVA `side` (top/right/bottom/left) × `size` (sm/md/lg/xl) que dirige max-width nos lados horizontais e max-height nos verticais. Consolida o baseline Sheet — ver ADR-012.",
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
    <Drawer>
      <DrawerTrigger asChild>
        <Button variant="outline">Abrir drawer</Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Título do drawer</DrawerTitle>
          <DrawerDescription>
            Painel lateral à direita por padrão. Fecha em Escape, no botão X ou
            no overlay.
          </DrawerDescription>
        </DrawerHeader>
        <div className="px-6">
          <p className="text-sm text-fg">Corpo do drawer vai aqui.</p>
        </div>
        <DrawerFooter>
          <DrawerClose asChild>
            <Button variant="outline">Cancelar</Button>
          </DrawerClose>
          <Button>Confirmar</Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  ),
};

// ──────────────────────────────────────────────────────────────────
// Sides (top / right / bottom / left)
// ──────────────────────────────────────────────────────────────────

const SIDES: readonly DrawerContentSide[] = ["top", "right", "bottom", "left"];

export const Sides: Story = {
  render: () => (
    <div className="flex flex-wrap items-center justify-center gap-4">
      {SIDES.map((side) => (
        <Drawer key={side}>
          <DrawerTrigger asChild>
            <Button variant="outline">side={side}</Button>
          </DrawerTrigger>
          <DrawerContent side={side}>
            <DrawerHeader>
              <DrawerTitle>Lado {side}</DrawerTitle>
              <DrawerDescription>
                {side === "right" &&
                  "Padrão. Painel à direita para filtros e detalhes."}
                {side === "left" &&
                  "Painel à esquerda — navegação contextual, sumário."}
                {side === "top" &&
                  "Painel superior — notificações, banners de ação."}
                {side === "bottom" &&
                  "Painel inferior — ações secundárias, mais opções."}
              </DrawerDescription>
            </DrawerHeader>
            <div className="px-6">
              <p className="text-sm text-fg">
                Cada lado preserva o contrato modal (focus-trap, Escape,
                outside-click) e aplica a animação de slide correspondente.
              </p>
            </div>
            <DrawerFooter>
              <DrawerClose asChild>
                <Button variant="outline">Fechar</Button>
              </DrawerClose>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
      ))}
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "O CVA `side` aceita top | right | bottom | left. Default = `right`. Cada lado tem classe de animação `slide-in-from-{side}` correspondente — ver ADR-012 Decision 3.",
      },
    },
  },
};

// ──────────────────────────────────────────────────────────────────
// Sizes (sm 384 / md 512 / lg 672 / xl 896 px)
// ──────────────────────────────────────────────────────────────────

const SIZES: readonly DrawerContentSize[] = ["sm", "md", "lg", "xl"];

export const Sizes: Story = {
  render: () => (
    <div className="flex flex-wrap items-center justify-center gap-4">
      {SIZES.map((size) => (
        <Drawer key={size}>
          <DrawerTrigger asChild>
            <Button variant="outline">size={size}</Button>
          </DrawerTrigger>
          <DrawerContent size={size}>
            <DrawerHeader>
              <DrawerTitle>Tamanho {size}</DrawerTitle>
              <DrawerDescription>
                {size === "sm" && "Pequeno — painel estreito para filtros simples."}
                {size === "md" && "Médio (default) — formulário comum."}
                {size === "lg" && "Grande — forms densos, detalhes ricos."}
                {size === "xl" &&
                  "Extra-grande — painéis de dados, generative-UI playgrounds."}
              </DrawerDescription>
            </DrawerHeader>
            <div className="px-6">
              <p className="text-sm text-fg">
                O mesmo budget de Dialog (24 / 32 / 42 / 56 rem). No lado
                horizontal o rung vira <code className="inline">max-w-*</code>;
                no vertical, <code className="inline">max-h-*</code>.
              </p>
            </div>
            <DrawerFooter>
              <DrawerClose asChild>
                <Button variant="outline">Fechar</Button>
              </DrawerClose>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
      ))}
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "Size ladder (sm 384 / md 512 / lg 672 / xl 896 px). Mirror do Dialog ADR-010 — ver ADR-012 Decision 4.",
      },
    },
  },
};

// ──────────────────────────────────────────────────────────────────
// WithTitleAndDescription — accessible title + description chain
// ──────────────────────────────────────────────────────────────────

export const WithTitleAndDescription: Story = {
  render: () => (
    <Drawer>
      <DrawerTrigger asChild>
        <Button variant="outline">Abrir com title + description</Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Filtros aplicados</DrawerTitle>
          <DrawerDescription>
            Revise os filtros que estão ativos na lista de conciliações.
          </DrawerDescription>
        </DrawerHeader>
        <div className="px-6">
          <p className="text-sm text-fg">
            DrawerTitle e DrawerDescription são auto-wired via
            `aria-labelledby` e `aria-describedby` pelo Radix, sem IDs manuais.
          </p>
        </div>
        <DrawerFooter>
          <DrawerClose asChild>
            <Button>Entendi</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "Title e Description são auto-wired pelo Radix. Não precisa setar IDs ou aria-* manualmente.",
      },
    },
  },
};

// ──────────────────────────────────────────────────────────────────
// WithFooter — Cancel + Confirm canonical pair
// ──────────────────────────────────────────────────────────────────

export const WithFooter: Story = {
  render: () => (
    <Drawer>
      <DrawerTrigger asChild>
        <Button variant="outline">Abrir com footer</Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Salvar regra de conciliação</DrawerTitle>
          <DrawerDescription>
            Defina a regra que casará transações desse cliente automaticamente.
          </DrawerDescription>
        </DrawerHeader>
        <div className="px-6">
          <p className="text-sm text-fg">
            Revise o resumo antes de salvar. A regra entra em vigor imediatamente
            para novas transações.
          </p>
        </div>
        <DrawerFooter>
          <DrawerClose asChild>
            <Button variant="outline">Cancelar</Button>
          </DrawerClose>
          <Button>Salvar regra</Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  ),
};

// ──────────────────────────────────────────────────────────────────
// Destructive — Button variant="destructive" inside the Footer
// (component-internal variant per Fernando feedback_story_no_external_destructive_helper)
// ──────────────────────────────────────────────────────────────────

export const Destructive: Story = {
  render: () => (
    <Drawer>
      <DrawerTrigger asChild>
        <Button variant="outline">Excluir conta integrada</Button>
      </DrawerTrigger>
      <DrawerContent size="sm">
        <DrawerHeader>
          <DrawerTitle>Excluir Banco Itaú · 0001-12345-6?</DrawerTitle>
          <DrawerDescription>
            Esta ação é permanente. Conciliações históricas serão preservadas,
            mas a integração não receberá novas transações.
          </DrawerDescription>
        </DrawerHeader>
        <div className="px-6">
          <p className="text-sm text-fg">
            Você precisará reconectar a conta para reativar.
          </p>
        </div>
        <DrawerFooter>
          <DrawerClose asChild>
            <Button variant="outline">Cancelar</Button>
          </DrawerClose>
          <Button variant="destructive">Sim, excluir</Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "Ação destrutiva usa `Button variant='destructive'` diretamente — sem helper externo de cor (sem wrapper `text-destructive`). O destaque visual vem do componente Button, não do conteúdo do Drawer.",
      },
    },
  },
};

// ──────────────────────────────────────────────────────────────────
// LongContent — vertical scroll inside DrawerContent
// ──────────────────────────────────────────────────────────────────

export const LongContent: Story = {
  render: () => (
    <Drawer>
      <DrawerTrigger asChild>
        <Button variant="outline">Abrir conteúdo longo</Button>
      </DrawerTrigger>
      <DrawerContent size="lg">
        <DrawerHeader>
          <DrawerTitle>Histórico de conciliações · Cliente X</DrawerTitle>
          <DrawerDescription>
            Últimos 30 lançamentos. Role para revisar.
          </DrawerDescription>
        </DrawerHeader>
        <div className="flex-1 overflow-y-auto px-6 text-sm text-fg">
          {Array.from({ length: 30 }).map((_, i) => (
            <p key={i} className="mb-3 leading-relaxed">
              Lançamento {i + 1}. Pagamento recebido · R$ {(1000 + i * 137).toLocaleString("pt-BR")}{" "}
              · conciliado automaticamente em 2026-05-{(i % 28) + 1}.
            </p>
          ))}
        </div>
        <DrawerFooter>
          <DrawerClose asChild>
            <Button>Fechar</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "Conteúdo longo rola dentro do DrawerContent. O overflow é gerenciado pelo container interno (`flex-1 overflow-y-auto`) — não pelo body — preservando o scroll-lock do modal.",
      },
    },
  },
};

// ──────────────────────────────────────────────────────────────────
// Controlled — useState driving open + onOpenChange
// ──────────────────────────────────────────────────────────────────

export const Controlled: Story = {
  render: () => {
    function ControlledHarness() {
      const [open, setOpen] = React.useState(false);
      return (
        <div className="flex flex-col items-center gap-3">
          <p className="text-xs uppercase tracking-wider text-fg-muted">
            externalState: {open ? "open" : "closed"}
          </p>
          <Button variant="outline" onClick={() => setOpen(true)}>
            Abrir via state externo
          </Button>
          <Drawer open={open} onOpenChange={setOpen}>
            <DrawerContent>
              <DrawerHeader>
                <DrawerTitle>Drawer controlado</DrawerTitle>
                <DrawerDescription>
                  O estado `open` é mantido fora do Drawer. A prop
                  `onOpenChange` reporta intenções de fechar (Escape, overlay,
                  botão X).
                </DrawerDescription>
              </DrawerHeader>
              <DrawerFooter>
                <Button variant="outline" onClick={() => setOpen(false)}>
                  Cancelar via state
                </Button>
                <Button onClick={() => setOpen(false)}>Confirmar</Button>
              </DrawerFooter>
            </DrawerContent>
          </Drawer>
        </div>
      );
    }
    return <ControlledHarness />;
  },
};

// ──────────────────────────────────────────────────────────────────
// WidthOverride — escape-hatch width prop
// ──────────────────────────────────────────────────────────────────

export const WidthOverride: Story = {
  render: () => (
    <Drawer>
      <DrawerTrigger asChild>
        <Button variant="outline">Abrir width={"{640}"}</Button>
      </DrawerTrigger>
      <DrawerContent side="right" width={640}>
        <DrawerHeader>
          <DrawerTitle>Width override</DrawerTitle>
          <DrawerDescription>
            Quando o ladder sm/md/lg/xl não acomoda, use a prop
            <code className="px-1 text-fg-muted"> width</code> (number → px ou
            string CSS). Só vale para lados horizontais.
          </DrawerDescription>
        </DrawerHeader>
        <form className="flex flex-col gap-3 px-6">
          <div>
            <Label>Nome do agente</Label>
            <Input placeholder="Ex: Bia · Conciliação Bancária" />
          </div>
          <div>
            <Label>Janela de operação</Label>
            <div className="grid grid-cols-2 gap-2">
              <Input defaultValue="08:00" />
              <Input defaultValue="20:00" />
            </div>
          </div>
        </form>
        <DrawerFooter>
          <DrawerClose asChild>
            <Button variant="outline">Cancelar</Button>
          </DrawerClose>
          <Button>Criar agente</Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "Override axis-contextual: `width` aplica `style.maxWidth` em lados horizontais; `height` aplica `style.maxHeight` em lados verticais. Mismatch (ex: `width` em `side='top'`) é no-op silencioso, documentado em ADR-012 Decision 5.",
      },
    },
  },
};
