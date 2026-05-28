import { Building2 } from "lucide-react";

import {
  Popover,
  PopoverAnchor,
  PopoverClose,
  PopoverContent,
  PopoverTrigger,
} from "@ds/components/popover";
import { Button } from "@ds/components/button";

// ──────────────────────────────────────────────────────────────────
// Padrão
// ──────────────────────────────────────────────────────────────────

export function BasicRow() {
  return (
    <div className="flex items-center justify-center py-6">
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline">Abrir popover</Button>
        </PopoverTrigger>
        <PopoverContent>
          <div className="grid gap-2">
            <h4 className="text-sm font-medium text-fg">Filtro rápido</h4>
            <p className="text-[13px] text-fg-muted">
              Conteúdo curto, ancorado ao trigger. Fecha em Escape ou clique
              fora.
            </p>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────
// Posicionamento (sides + alignments)
// ──────────────────────────────────────────────────────────────────

export function SidesRow() {
  return (
    <div className="grid grid-cols-2 gap-6 py-8 sm:grid-cols-4">
      {(["top", "right", "bottom", "left"] as const).map((side) => (
        <div className="flex justify-center" key={side}>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm">
                side={side}
              </Button>
            </PopoverTrigger>
            <PopoverContent side={side}>
              <p className="text-sm text-fg">Posição {side}.</p>
            </PopoverContent>
          </Popover>
        </div>
      ))}
    </div>
  );
}

export function AlignmentsRow() {
  return (
    <div className="flex flex-wrap justify-center gap-4 py-6">
      {(["start", "center", "end"] as const).map((align) => (
        <Popover key={align}>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm">
              align={align}
            </Button>
          </PopoverTrigger>
          <PopoverContent align={align}>
            <p className="text-sm text-fg">Alinhamento {align}.</p>
          </PopoverContent>
        </Popover>
      ))}
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────
// Tamanhos
// ──────────────────────────────────────────────────────────────────

export function SizesRow() {
  return (
    <div className="flex flex-wrap justify-center gap-4 py-6">
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm">
            sm · 8px
          </Button>
        </PopoverTrigger>
        <PopoverContent size="sm">
          <p>Compacto — filter pop, hint.</p>
        </PopoverContent>
      </Popover>
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm">
            md · 12px (default)
          </Button>
        </PopoverTrigger>
        <PopoverContent size="md">
          <p>Tamanho padrão para a maioria dos usos.</p>
        </PopoverContent>
      </Popover>
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm">
            lg · 16px
          </Button>
        </PopoverTrigger>
        <PopoverContent size="lg">
          <p>Mais respiração — mini-cards, multi-line forms.</p>
        </PopoverContent>
      </Popover>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────
// Estados (Default / Disabled / Modal)
// ──────────────────────────────────────────────────────────────────

export function StatesRow() {
  return (
    <div className="grid w-full max-w-3xl grid-cols-1 gap-4 py-6 sm:grid-cols-3">
      <div className="flex flex-col items-center gap-2">
        <span className="text-xs uppercase tracking-wider text-fg-muted">
          Default
        </span>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm">
              Abrir
            </Button>
          </PopoverTrigger>
          <PopoverContent>
            <p>Default — non-modal.</p>
          </PopoverContent>
        </Popover>
      </div>
      <div className="flex flex-col items-center gap-2">
        <span className="text-xs uppercase tracking-wider text-fg-muted">
          Disabled
        </span>
        <Popover>
          <PopoverTrigger disabled asChild>
            <Button variant="outline" size="sm" disabled>
              Desabilitado
            </Button>
          </PopoverTrigger>
          <PopoverContent>
            <p>Nunca abre.</p>
          </PopoverContent>
        </Popover>
      </div>
      <div className="flex flex-col items-center gap-2">
        <span className="text-xs uppercase tracking-wider text-fg-muted">
          Modal
        </span>
        <Popover modal>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm">
              Modal
            </Button>
          </PopoverTrigger>
          <PopoverContent>
            <p>Background interaction bloqueado.</p>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────
// Composição avançada — Anchor + Close
// ──────────────────────────────────────────────────────────────────

export function AnchorAndCloseRow() {
  return (
    <div className="flex flex-col items-center gap-8 py-8">
      <Popover>
        <div className="flex items-center gap-8">
          <PopoverAnchor asChild>
            <div className="inline-flex items-center gap-2 rounded-md border border-border-strong bg-muted px-3 py-2 text-sm text-fg">
              <Building2 width={16} height={16} aria-hidden="true" />
              Linha ancorada
            </div>
          </PopoverAnchor>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm">
              Trigger separado
            </Button>
          </PopoverTrigger>
        </div>
        <PopoverContent>
          <p className="text-sm text-fg">
            Ancorado em <code>PopoverAnchor</code>, não no trigger.
          </p>
          <PopoverClose asChild>
            <Button variant="outline" size="sm" className="mt-2">
              Fechar daqui
            </Button>
          </PopoverClose>
        </PopoverContent>
      </Popover>
    </div>
  );
}
