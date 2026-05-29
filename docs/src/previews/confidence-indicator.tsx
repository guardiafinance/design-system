import { Bot, Check, X } from "lucide-react";

import { ConfidenceIndicator } from "@ds/components/confidence-indicator";

// ──────────────────────────────────────────────────────────────────
// Padrão — chip default
// ──────────────────────────────────────────────────────────────────

export function BasicRow() {
  return (
    <div className="flex items-center justify-center py-6">
      <ConfidenceIndicator value={97} />
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────
// Levels — high / medium / low
// ──────────────────────────────────────────────────────────────────

export function LevelsRow() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-3 py-6">
      <ConfidenceIndicator level="high" value={97} />
      <ConfidenceIndicator level="medium" value={86} />
      <ConfidenceIndicator level="low" value={62} />
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────
// Variants — chip / bar / dot
// ──────────────────────────────────────────────────────────────────

export function VariantsRow() {
  return (
    <div className="flex flex-col gap-6 py-4">
      <div className="flex flex-col gap-1.5">
        <small className="text-fg-muted">chip · selo compacto</small>
        <div className="flex flex-wrap items-center gap-3">
          <ConfidenceIndicator value={97} variant="chip" />
          <ConfidenceIndicator value={86} variant="chip" />
          <ConfidenceIndicator value={62} variant="chip" />
        </div>
      </div>
      <div className="flex flex-col gap-1.5">
        <small className="text-fg-muted">bar · magnitude visível</small>
        <div className="flex max-w-[320px] flex-col gap-3">
          <ConfidenceIndicator value={97} variant="bar" label="Classificação contábil" />
          <ConfidenceIndicator value={86} variant="bar" label="Categoria fiscal" />
          <ConfidenceIndicator value={62} variant="bar" label="Match fornecedor" />
        </div>
      </div>
      <div className="flex flex-col gap-1.5">
        <small className="text-fg-muted">dot · inline em listas</small>
        <div className="flex flex-wrap items-center gap-4">
          <ConfidenceIndicator value={97} variant="dot" />
          <ConfidenceIndicator value={86} variant="dot" />
          <ConfidenceIndicator value={62} variant="dot" />
        </div>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────
// Sizes — sm / md
// ──────────────────────────────────────────────────────────────────

export function SizesRow() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-4 py-6">
      <ConfidenceIndicator size="sm" value={97} />
      <ConfidenceIndicator size="md" value={97} />
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────
// InContext — agent suggestion row (espelha o playground legacy)
// ──────────────────────────────────────────────────────────────────

export function InContextRow() {
  return (
    <div className="py-4">
      <div className="mx-auto flex max-w-[560px] items-center gap-3 rounded-md border border-border bg-bg p-3">
        <div className="inline-flex h-12 w-12 items-center justify-center rounded-md bg-guardia-orange-500 text-white">
          <Bot size={22} />
        </div>
        <div className="flex-1">
          <div className="mb-1 flex items-center gap-2">
            <strong className="text-sm text-guardia-purple-500">Sugestão do agente</strong>
            <ConfidenceIndicator level="high" value={97} size="sm" />
          </div>
          <p className="m-0 text-[13px] text-fg-muted">
            Classificar em <b className="text-guardia-purple-500">3.1.4.05 · Despesas com tecnologia</b>
          </p>
        </div>
        <div className="flex gap-1.5">
          <button
            type="button"
            aria-label="Rejeitar"
            className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-border text-fg-muted hover:bg-bg-subtle"
          >
            <X size={14} />
          </button>
          <button
            type="button"
            aria-label="Aceitar"
            className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-guardia-purple-500 text-white hover:bg-guardia-purple-700"
          >
            <Check size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
