import { Trash2, Plus, Info } from "lucide-react";

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@ds/components/dialog";
import { Button } from "@ds/components/button";
import { Input } from "@ds/components/input";
import { Label } from "@ds/components/label";

// ──────────────────────────────────────────────────────────────────
// Padrão
// ──────────────────────────────────────────────────────────────────

export function BasicRow() {
  return (
    <div className="flex items-center justify-center py-6">
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline">Abrir dialog</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Título do dialog</DialogTitle>
            <DialogDescription>
              Modal centralizado com foco capturado. Fecha em Escape, no botão
              X ou no overlay.
            </DialogDescription>
          </DialogHeader>
          <p className="text-sm text-fg">
            Corpo do dialog vai aqui. Conteúdo livre, qualquer JSX.
          </p>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancelar</Button>
            </DialogClose>
            <Button>Confirmar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────
// Tamanhos
// ──────────────────────────────────────────────────────────────────

export function SizesRow() {
  return (
    <div className="flex flex-wrap justify-center gap-4 py-6">
      {(["sm", "md", "lg", "xl"] as const).map((size) => (
        <Dialog key={size}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm">
              size={size}
            </Button>
          </DialogTrigger>
          <DialogContent size={size}>
            <DialogHeader>
              <DialogTitle>Tamanho {size}</DialogTitle>
              <DialogDescription>
                {size === "sm" && "Pequeno — 384 px. Confirmações curtas."}
                {size === "md" && "Médio (default) — 512 px. Caso comum."}
                {size === "lg" && "Grande — 672 px. Forms densos."}
                {size === "xl" && "Extra — 896 px. Painéis de dados."}
              </DialogDescription>
            </DialogHeader>
            <p className="text-sm text-fg">
              Width ladder: sm/md/lg/xl define <code>max-w-*</code>. Padding
              fixo em <code>p-6</code> (modais não trabalham com padding
              ladder).
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
  );
}

// ──────────────────────────────────────────────────────────────────
// Estados (Default / Controlled / Disabled trigger)
// ──────────────────────────────────────────────────────────────────

export function StatesRow() {
  return (
    <div className="grid w-full max-w-3xl grid-cols-1 gap-4 py-6 sm:grid-cols-3">
      <div className="flex flex-col items-center gap-2">
        <span className="text-xs uppercase tracking-wider text-fg-muted">
          Default
        </span>
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm">
              Abrir
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Default</DialogTitle>
              <DialogDescription>Modal default.</DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Fechar</Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      <div className="flex flex-col items-center gap-2">
        <span className="text-xs uppercase tracking-wider text-fg-muted">
          Default open
        </span>
        <Dialog defaultOpen={false}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm">
              Abrir
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Default open</DialogTitle>
              <DialogDescription>
                Modo uncontrolled com defaultOpen.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Fechar</Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      <div className="flex flex-col items-center gap-2">
        <span className="text-xs uppercase tracking-wider text-fg-muted">
          Disabled trigger
        </span>
        <Dialog>
          <DialogTrigger disabled asChild>
            <Button variant="outline" size="sm" disabled>
              Desabilitado
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogTitle>Nunca abre</DialogTitle>
            <DialogDescription>—</DialogDescription>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────
// Casos de uso (destructive / form / info — mirroring legacy playground)
// ──────────────────────────────────────────────────────────────────

export function UseCasesRow() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-4 py-6">
      {/* Destructive confirmation */}
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline">
            <Trash2 className="mr-2 h-4 w-4" />
            Excluir cliente
          </Button>
        </DialogTrigger>
        <DialogContent size="sm">
          <DialogHeader>
            <DialogTitle>Excluir Contábil Silva & Cia?</DialogTitle>
            <DialogDescription>
              Esta ação é permanente. Conciliações históricas serão
              preservadas, mas o cliente não receberá novos fluxos.
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

      {/* Form */}
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline">
            <Plus className="mr-2 h-4 w-4" />
            Novo agente
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Novo agente</DialogTitle>
            <DialogDescription>
              Configure um agente para conciliar uma fonte específica.
            </DialogDescription>
          </DialogHeader>
          <form className="flex flex-col gap-3">
            <div>
              <Label>Nome do agente</Label>
              <Input placeholder="Ex: Bia · Conciliação Bancária" />
            </div>
            <div>
              <Label>Fonte primária</Label>
              <Input placeholder="Banco Inter · CNPJ 12.345..." />
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

      {/* Info */}
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline">
            <Info className="mr-2 h-4 w-4" />
            Como funciona
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Como funciona a conciliação automática</DialogTitle>
            <DialogDescription>
              A Bia compara cada lançamento bancário com lançamentos contábeis
              em até 3 dimensões.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-2 text-sm text-fg">
            <p>
              Matches com confiança ≥ 95% são auto-aprovados (quando você
              ativa o autopilot). Os demais vão para sua fila de revisão.
            </p>
            <p>
              O agente registra cada decisão com trace completo: fontes,
              raciocínio e ação.
            </p>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button>Entendi</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
