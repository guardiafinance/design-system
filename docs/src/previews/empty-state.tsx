import { EmptyState } from "@ds/components/empty-state";
import { Button } from "@ds/components/button";

/* ─── Ícone inline (currentColor) ─────────────────────────────────── */

function InboxIcon() {
  return (
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
}

function BoxIllustration() {
  return (
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
}

/* ─── Anatomy ─────────────────────────────────────────────────────── */

export function Anatomy() {
  return (
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
  );
}

/* ─── Sizes row (sm / md / lg) ───────────────────────────────────── */

const SIZES = ["sm", "md", "lg"] as const;

export function SizesRow() {
  return (
    <div className="grid w-full gap-4 md:grid-cols-3">
      {SIZES.map((size) => (
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
              Padding, gap e ícone escalam juntos.
            </EmptyState.Description>
            <EmptyState.Actions>
              <Button>Ação</Button>
            </EmptyState.Actions>
          </EmptyState>
        </div>
      ))}
    </div>
  );
}

/* ─── Slot variants (Icon vs Illustration) ───────────────────────── */

export function WithIcon() {
  return (
    <EmptyState>
      <EmptyState.Icon>
        <InboxIcon />
      </EmptyState.Icon>
      <EmptyState.Title>Nenhum lançamento</EmptyState.Title>
      <EmptyState.Description>
        Conecte um banco para começar a conciliar.
      </EmptyState.Description>
    </EmptyState>
  );
}

export function WithIllustration() {
  return (
    <EmptyState size="lg">
      <EmptyState.Illustration>
        <BoxIllustration />
      </EmptyState.Illustration>
      <EmptyState.Title>Sem dados ainda</EmptyState.Title>
      <EmptyState.Description>
        Importe sua primeira planilha para visualizar os lançamentos.
      </EmptyState.Description>
    </EmptyState>
  );
}

/* ─── Actions stacking ───────────────────────────────────────────── */

export function WithActions() {
  return (
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
  );
}

/* ─── Long description (max-w-prose) ─────────────────────────────── */

export function LongDescription() {
  return (
    <EmptyState>
      <EmptyState.Icon>
        <InboxIcon />
      </EmptyState.Icon>
      <EmptyState.Title>Nenhum lançamento encontrado</EmptyState.Title>
      <EmptyState.Description>
        Os filtros aplicados não retornaram resultados. Ajuste o intervalo de
        datas, remova filtros de categoria ou conecte uma nova fonte de dados.
        Lançamentos de contas conectadas aparecem aqui automaticamente após a
        próxima rodada de conciliação.
      </EmptyState.Description>
      <EmptyState.Actions>
        <Button>Ajustar filtros</Button>
      </EmptyState.Actions>
    </EmptyState>
  );
}
