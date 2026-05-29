import * as React from "react";
import type { Meta, StoryObj } from "@storybook/react";

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./index";
import { Button } from "../button";
import { Input } from "../input";
import { Label } from "../label";

const meta: Meta<typeof Dialog> = {
  title: "Components/Dialog",
  component: Dialog,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Modal centered overlay anchored to the viewport. Use for decisions with focus capture: destructive confirmations, short forms, info dialogs. Base no Radix Dialog; tokens semânticos canônicos; CVA size ladder sm 384 / md 512 / lg 672 / xl 896 px alinhado a modal widths (não padding ladder — ver ADR-010).",
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
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">Abrir dialog</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Título do dialog</DialogTitle>
          <DialogDescription>
            Conteúdo modal centralizado. Fecha em Escape, no botão X ou no
            overlay.
          </DialogDescription>
        </DialogHeader>
        <p className="text-sm text-fg">Corpo do dialog vai aqui.</p>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancelar</Button>
          </DialogClose>
          <Button>Confirmar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
};

// ──────────────────────────────────────────────────────────────────
// Sizes (sm 384 / md 512 / lg 672 / xl 896 px)
// ──────────────────────────────────────────────────────────────────

export const Sizes: Story = {
  render: () => (
    <div className="flex flex-wrap items-center justify-center gap-4">
      {(["sm", "md", "lg", "xl"] as const).map((size) => (
        <Dialog key={size}>
          <DialogTrigger asChild>
            <Button variant="outline">size={size}</Button>
          </DialogTrigger>
          <DialogContent size={size}>
            <DialogHeader>
              <DialogTitle>Tamanho {size}</DialogTitle>
              <DialogDescription>
                {size === "sm" && "Pequeno — confirmações curtas."}
                {size === "md" && "Médio (default) — caso de uso comum."}
                {size === "lg" && "Grande — forms densos."}
                {size === "xl" &&
                  "Extra-grande — painéis de dados, generative-UI playgrounds."}
              </DialogDescription>
            </DialogHeader>
            <p className="text-sm text-fg">
              Width rung distinto do Popover/Tooltip (que usam padding ladder).
              Dialog é viewport-centered modal: seu constraint natural é width.
            </p>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Fechar</Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      ))}
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "Size ladder define a largura máxima do modal (max-w-sm / max-w-lg / max-w-2xl / max-w-4xl). Difere de Popover e Tooltip, que usam padding ladder porque são overlays inline ancorados a um trigger. Decisão registrada em ADR-010 Decision 2.",
      },
    },
  },
};

// ──────────────────────────────────────────────────────────────────
// WithTitleAndDescription — accessible title + description chain
// ──────────────────────────────────────────────────────────────────

export const WithTitleAndDescription: Story = {
  render: () => (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">Abrir com title + description</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Conta criada com sucesso</DialogTitle>
          <DialogDescription>
            Enviamos um email de confirmação para você. Clique no link recebido
            para ativar a conta.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button>Entendi</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "DialogTitle e DialogDescription são auto-wired via aria-labelledby e aria-describedby pelo Radix, sem necessidade de IDs manuais.",
      },
    },
  },
};

// ──────────────────────────────────────────────────────────────────
// WithFooter — Cancel + Confirm canonical pair
// ──────────────────────────────────────────────────────────────────

export const WithFooter: Story = {
  render: () => (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">Abrir com footer</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Confirmar alteração</DialogTitle>
          <DialogDescription>
            Você está prestes a alterar configurações de cobrança.
          </DialogDescription>
        </DialogHeader>
        <p className="text-sm text-fg">
          Revise os detalhes antes de confirmar. A operação afeta cobranças
          futuras imediatamente.
        </p>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancelar</Button>
          </DialogClose>
          <Button>Confirmar alteração</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
};

// ──────────────────────────────────────────────────────────────────
// Destructive — Button variant="destructive" inside the Footer
// (component-internal variant per Fernando feedback_story_no_external_destructive_helper)
// ──────────────────────────────────────────────────────────────────

export const Destructive: Story = {
  render: () => (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">Excluir cliente</Button>
      </DialogTrigger>
      <DialogContent size="sm">
        <DialogHeader>
          <DialogTitle>Excluir Contábil Silva & Cia?</DialogTitle>
          <DialogDescription>
            Esta ação é permanente. Conciliações históricas serão preservadas,
            mas o cliente não receberá novos fluxos.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancelar</Button>
          </DialogClose>
          <Button variant="destructive">Sim, excluir</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "Ação destrutiva usa Button variant='destructive' diretamente — sem helper externo de cor (sem wrapper text-destructive). O destaque visual vem do componente Button, não do conteúdo do Dialog.",
      },
    },
  },
};

// ──────────────────────────────────────────────────────────────────
// LongContent — vertical scroll inside DialogContent
// ──────────────────────────────────────────────────────────────────

export const LongContent: Story = {
  render: () => (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">Abrir conteúdo longo</Button>
      </DialogTrigger>
      <DialogContent size="lg">
        <DialogHeader>
          <DialogTitle>Termos de uso · Resumo</DialogTitle>
          <DialogDescription>
            Resumo das principais cláusulas. Leia com calma.
          </DialogDescription>
        </DialogHeader>
        <div className="max-h-[60vh] overflow-y-auto pr-2 text-sm text-fg">
          {Array.from({ length: 30 }).map((_, i) => (
            <p key={i} className="mb-3 leading-relaxed">
              Cláusula {i + 1}. Lorem ipsum dolor sit amet, consectetur
              adipiscing elit. Praesent ac neque vel justo viverra lobortis.
              Nam at quam non massa luctus tincidunt. Pellentesque habitant
              morbi tristique senectus et netus et malesuada fames ac turpis
              egestas.
            </p>
          ))}
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button>Concordo</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
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
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Modal controlado</DialogTitle>
                <DialogDescription>
                  O estado `open` é mantido fora do Dialog. A prop
                  `onOpenChange` reporta intenções de fechar (Escape, overlay,
                  botão X).
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button variant="outline" onClick={() => setOpen(false)}>
                  Cancelar via state
                </Button>
                <Button onClick={() => setOpen(false)}>Confirmar</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
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
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">Abrir width={"{640}"}</Button>
      </DialogTrigger>
      <DialogContent width={640}>
        <DialogHeader>
          <DialogTitle>Width override</DialogTitle>
          <DialogDescription>
            Quando o ladder sm/md/lg/xl não acomoda exatamente, use a prop
            <code className="px-1 text-fg-muted"> width</code> (number → px ou
            string CSS).
          </DialogDescription>
        </DialogHeader>
        <form className="flex flex-col gap-3">
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
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancelar</Button>
          </DialogClose>
          <Button>Criar agente</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "Override do ladder via prop `width`. Quando 512 px (md) é pouco mas 672 px (lg) é demais, `width={640}` aplica `style.maxWidth` diretamente sem precisar de className custom.",
      },
    },
  },
};
