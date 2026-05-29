import { Trash2, Plus, Info, Filter } from "lucide-react";

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
} from "@ds/components/drawer";
import { Button } from "@ds/components/button";
import { Input } from "@ds/components/input";
import { Label } from "@ds/components/label";

// ──────────────────────────────────────────────────────────────────
// Padrão
// ──────────────────────────────────────────────────────────────────

export function BasicRow() {
  return (
    <div className="flex items-center justify-center py-6">
      <Drawer>
        <DrawerTrigger asChild>
          <Button variant="outline">Abrir drawer</Button>
        </DrawerTrigger>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Título do drawer</DrawerTitle>
            <DrawerDescription>
              Painel lateral à direita por padrão. Fecha em Escape, no botão X
              ou no overlay.
            </DrawerDescription>
          </DrawerHeader>
          <div className="px-6">
            <p className="text-sm text-fg">
              Corpo do drawer vai aqui. Conteúdo livre, qualquer JSX.
            </p>
          </div>
          <DrawerFooter>
            <DrawerClose asChild>
              <Button variant="outline">Cancelar</Button>
            </DrawerClose>
            <Button>Confirmar</Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────
// Lados (top / right / bottom / left)
// ──────────────────────────────────────────────────────────────────

const SIDES: readonly DrawerContentSide[] = ["top", "right", "bottom", "left"];

export function SidesRow() {
  return (
    <div className="flex flex-wrap justify-center gap-4 py-6">
      {SIDES.map((side) => (
        <Drawer key={side}>
          <DrawerTrigger asChild>
            <Button variant="outline" size="sm">
              side={side}
            </Button>
          </DrawerTrigger>
          <DrawerContent side={side}>
            <DrawerHeader>
              <DrawerTitle>Lado {side}</DrawerTitle>
              <DrawerDescription>
                {side === "right" && "Padrão. Painel à direita."}
                {side === "left" && "Painel à esquerda."}
                {side === "top" && "Painel superior."}
                {side === "bottom" && "Painel inferior."}
              </DrawerDescription>
            </DrawerHeader>
            <div className="px-6">
              <p className="text-sm text-fg">
                Contrato modal preservado (focus-trap, Escape, outside-click).
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
  );
}

// ──────────────────────────────────────────────────────────────────
// Tamanhos (sm 384 / md 512 / lg 672 / xl 896 px)
// ──────────────────────────────────────────────────────────────────

const SIZES: readonly DrawerContentSize[] = ["sm", "md", "lg", "xl"];

export function SizesRow() {
  return (
    <div className="flex flex-wrap justify-center gap-4 py-6">
      {SIZES.map((size) => (
        <Drawer key={size}>
          <DrawerTrigger asChild>
            <Button variant="outline" size="sm">
              size={size}
            </Button>
          </DrawerTrigger>
          <DrawerContent size={size}>
            <DrawerHeader>
              <DrawerTitle>Tamanho {size}</DrawerTitle>
              <DrawerDescription>
                {size === "sm" && "Pequeno — 384 px. Filtros simples."}
                {size === "md" && "Médio (default) — 512 px. Form comum."}
                {size === "lg" && "Grande — 672 px. Form denso."}
                {size === "xl" && "Extra — 896 px. Painel de dados."}
              </DrawerDescription>
            </DrawerHeader>
            <div className="px-6">
              <p className="text-sm text-fg">
                Lado horizontal vira <code>max-w-*</code>; vertical vira
                <code>max-h-*</code>.
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
        <Drawer>
          <DrawerTrigger asChild>
            <Button variant="outline" size="sm">
              Abrir
            </Button>
          </DrawerTrigger>
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle>Default</DrawerTitle>
              <DrawerDescription>Drawer default.</DrawerDescription>
            </DrawerHeader>
            <DrawerFooter>
              <DrawerClose asChild>
                <Button variant="outline">Fechar</Button>
              </DrawerClose>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
      </div>
      <div className="flex flex-col items-center gap-2">
        <span className="text-xs uppercase tracking-wider text-fg-muted">
          Default open
        </span>
        <Drawer defaultOpen={false}>
          <DrawerTrigger asChild>
            <Button variant="outline" size="sm">
              Abrir
            </Button>
          </DrawerTrigger>
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle>Default open</DrawerTitle>
              <DrawerDescription>
                Modo uncontrolled com defaultOpen.
              </DrawerDescription>
            </DrawerHeader>
            <DrawerFooter>
              <DrawerClose asChild>
                <Button variant="outline">Fechar</Button>
              </DrawerClose>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
      </div>
      <div className="flex flex-col items-center gap-2">
        <span className="text-xs uppercase tracking-wider text-fg-muted">
          Disabled trigger
        </span>
        <Drawer>
          <DrawerTrigger disabled asChild>
            <Button variant="outline" size="sm" disabled>
              Desabilitado
            </Button>
          </DrawerTrigger>
          <DrawerContent>
            <DrawerTitle>Nunca abre</DrawerTitle>
            <DrawerDescription>—</DrawerDescription>
          </DrawerContent>
        </Drawer>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────
// Casos de uso (filters / form / info / destructive — mirroring legacy playground)
// ──────────────────────────────────────────────────────────────────

export function UseCasesRow() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-4 py-6">
      {/* Filters drawer */}
      <Drawer>
        <DrawerTrigger asChild>
          <Button variant="outline">
            <Filter className="mr-2 h-4 w-4" />
            Filtros
          </Button>
        </DrawerTrigger>
        <DrawerContent side="right" size="md">
          <DrawerHeader>
            <DrawerTitle>Filtros de conciliação</DrawerTitle>
            <DrawerDescription>
              Restrinja a fila de revisão pendente.
            </DrawerDescription>
          </DrawerHeader>
          <form className="flex flex-col gap-3 px-6">
            <div>
              <Label>Cliente</Label>
              <Input placeholder="Buscar por nome ou CNPJ" />
            </div>
            <div>
              <Label>Status</Label>
              <Input placeholder="Pendente / aprovado / rejeitado" />
            </div>
            <div>
              <Label>Confiança mínima</Label>
              <Input defaultValue="0.95" />
            </div>
          </form>
          <DrawerFooter>
            <DrawerClose asChild>
              <Button variant="outline">Limpar</Button>
            </DrawerClose>
            <Button>Aplicar filtros</Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>

      {/* Secondary form */}
      <Drawer>
        <DrawerTrigger asChild>
          <Button variant="outline">
            <Plus className="mr-2 h-4 w-4" />
            Nova regra
          </Button>
        </DrawerTrigger>
        <DrawerContent side="right" size="lg">
          <DrawerHeader>
            <DrawerTitle>Nova regra de conciliação</DrawerTitle>
            <DrawerDescription>
              Configure uma regra que casará transações automaticamente.
            </DrawerDescription>
          </DrawerHeader>
          <form className="flex flex-col gap-3 px-6">
            <div>
              <Label>Nome da regra</Label>
              <Input placeholder="Ex: PIX entrada · Cliente X" />
            </div>
            <div>
              <Label>Padrão de descrição</Label>
              <Input placeholder="Regex ou substring" />
            </div>
            <div>
              <Label>Conta contábil destino</Label>
              <Input placeholder="1.1.01.001 · Caixa Pix" />
            </div>
          </form>
          <DrawerFooter>
            <DrawerClose asChild>
              <Button variant="outline">Cancelar</Button>
            </DrawerClose>
            <Button>Criar regra</Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>

      {/* Info panel */}
      <Drawer>
        <DrawerTrigger asChild>
          <Button variant="outline">
            <Info className="mr-2 h-4 w-4" />
            Detalhes da transação
          </Button>
        </DrawerTrigger>
        <DrawerContent side="right">
          <DrawerHeader>
            <DrawerTitle>Transação #128 374</DrawerTitle>
            <DrawerDescription>
              Pagamento recebido em 2026-05-28 às 14h32.
            </DrawerDescription>
          </DrawerHeader>
          <div className="flex flex-col gap-2 px-6 text-sm text-fg">
            <p>Valor: R$ 4.250,00</p>
            <p>Origem: PIX · Banco Itaú · ag 1234</p>
            <p>Conciliação automática · confiança 97%</p>
            <p>Aprovado por Bia (agente) em 2026-05-28 às 14h33.</p>
          </div>
          <DrawerFooter>
            <DrawerClose asChild>
              <Button>Fechar</Button>
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>

      {/* Destructive */}
      <Drawer>
        <DrawerTrigger asChild>
          <Button variant="outline">
            <Trash2 className="mr-2 h-4 w-4" />
            Excluir integração
          </Button>
        </DrawerTrigger>
        <DrawerContent size="sm">
          <DrawerHeader>
            <DrawerTitle>Excluir Banco Itaú · 0001-12345-6?</DrawerTitle>
            <DrawerDescription>
              Esta ação é permanente. Conciliações históricas serão
              preservadas.
            </DrawerDescription>
          </DrawerHeader>
          <DrawerFooter>
            <DrawerClose asChild>
              <Button variant="outline">Cancelar</Button>
            </DrawerClose>
            <Button variant="destructive">Sim, excluir</Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </div>
  );
}
