import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@ds/components/tooltip";
import { Button } from "@ds/components/button";

// ──────────────────────────────────────────────────────────────────
// Padrão
// ──────────────────────────────────────────────────────────────────

export function BasicRow() {
  return (
    <div className="flex items-center justify-center py-6">
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="outline">Passe o mouse</Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Atalho contextual curto.</p>
        </TooltipContent>
      </Tooltip>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────
// Posicionamento (sides)
// ──────────────────────────────────────────────────────────────────

export function SidesRow() {
  return (
    <div className="grid grid-cols-2 gap-6 py-8 sm:grid-cols-4">
      {(["top", "right", "bottom", "left"] as const).map((side) => (
        <div className="flex justify-center" key={side}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline" size="sm">
                side={side}
              </Button>
            </TooltipTrigger>
            <TooltipContent side={side}>
              <p>Posição {side}.</p>
            </TooltipContent>
          </Tooltip>
        </div>
      ))}
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────
// Alinhamento
// ──────────────────────────────────────────────────────────────────

export function AlignmentsRow() {
  return (
    <div className="flex flex-wrap justify-center gap-4 py-6">
      {(["start", "center", "end"] as const).map((align) => (
        <Tooltip key={align}>
          <TooltipTrigger asChild>
            <Button variant="outline" size="sm">
              align={align}
            </Button>
          </TooltipTrigger>
          <TooltipContent align={align}>
            <p>Alinhamento {align}.</p>
          </TooltipContent>
        </Tooltip>
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
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="outline" size="sm">
            sm · 8px
          </Button>
        </TooltipTrigger>
        <TooltipContent size="sm">
          <p>Compacto — atalho ou ícone.</p>
        </TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="outline" size="sm">
            md · 12px (default)
          </Button>
        </TooltipTrigger>
        <TooltipContent size="md">
          <p>Tamanho padrão para a maioria dos hints.</p>
        </TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="outline" size="sm">
            lg · 16px
          </Button>
        </TooltipTrigger>
        <TooltipContent size="lg">
          <p>Mais respiração — descrição multi-linha.</p>
        </TooltipContent>
      </Tooltip>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────
// Estados (Default / Long content / withArrow=false)
// ──────────────────────────────────────────────────────────────────

export function StatesRow() {
  return (
    <div className="grid w-full max-w-3xl grid-cols-1 gap-4 py-6 sm:grid-cols-3">
      <div className="flex flex-col items-center gap-2">
        <span className="text-xs uppercase tracking-wider text-fg-muted">
          Default
        </span>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="outline" size="sm">
              Hover
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Default — arrow visível.</p>
          </TooltipContent>
        </Tooltip>
      </div>
      <div className="flex flex-col items-center gap-2">
        <span className="text-xs uppercase tracking-wider text-fg-muted">
          Long content
        </span>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="outline" size="sm">
              Multi-linha
            </Button>
          </TooltipTrigger>
          <TooltipContent size="lg">
            <p>
              Texto mais longo, com duas linhas, demonstrando o ritmo
              tipográfico do ladder.
            </p>
          </TooltipContent>
        </Tooltip>
      </div>
      <div className="flex flex-col items-center gap-2">
        <span className="text-xs uppercase tracking-wider text-fg-muted">
          withArrow=false
        </span>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="outline" size="sm">
              Sem arrow
            </Button>
          </TooltipTrigger>
          <TooltipContent withArrow={false}>
            <p>Para densidade visual máxima.</p>
          </TooltipContent>
        </Tooltip>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────
// Delays (delayDuration / skipDelayDuration)
// ──────────────────────────────────────────────────────────────────

export function DelaysRow() {
  return (
    <div className="grid w-full max-w-3xl grid-cols-1 gap-4 py-6 sm:grid-cols-3">
      <div className="flex flex-col items-center gap-2">
        <span className="text-xs uppercase tracking-wider text-fg-muted">
          delay 0ms · instant
        </span>
        <Tooltip delayDuration={0}>
          <TooltipTrigger asChild>
            <Button variant="outline" size="sm">
              Instantâneo
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Abre sem espera.</p>
          </TooltipContent>
        </Tooltip>
      </div>
      <div className="flex flex-col items-center gap-2">
        <span className="text-xs uppercase tracking-wider text-fg-muted">
          delay 700ms · default
        </span>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="outline" size="sm">
              Padrão Radix
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Espera 700ms antes de abrir.</p>
          </TooltipContent>
        </Tooltip>
      </div>
      <div className="flex flex-col items-center gap-2">
        <span className="text-xs uppercase tracking-wider text-fg-muted">
          shared group · skipDelay 0
        </span>
        <TooltipProvider delayDuration={400} skipDelayDuration={0}>
          <div className="flex gap-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="sm">
                  A
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Tooltip A.</p>
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="sm">
                  B
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Tooltip B (sem repetir delay).</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </TooltipProvider>
      </div>
    </div>
  );
}
