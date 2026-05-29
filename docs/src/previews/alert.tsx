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
} from "@ds/components/alert";
import { Button } from "@ds/components/button";

// ──────────────────────────────────────────────────────────────────
// Padrão
// ──────────────────────────────────────────────────────────────────

export function BasicRow() {
  return (
    <div className="flex flex-col gap-3 py-4">
      <Alert>
        <AlertIcon>
          <Info />
        </AlertIcon>
        <AlertTitle>Pagamento agendado</AlertTitle>
        <AlertDescription>
          O envio acontece amanhã às 09:00 sem ação adicional.
        </AlertDescription>
      </Alert>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────
// Tons (info · success · warning · error)
// ──────────────────────────────────────────────────────────────────

export function TonesRow() {
  return (
    <div className="flex flex-col gap-3 py-4">
      <Alert tone="info">
        <AlertIcon>
          <Info />
        </AlertIcon>
        <AlertTitle>Informativo</AlertTitle>
        <AlertDescription>
          Próximo fechamento contábil: 30/jun.
        </AlertDescription>
      </Alert>
      <Alert tone="success">
        <AlertIcon>
          <CheckCircle2 />
        </AlertIcon>
        <AlertTitle>Importação concluída</AlertTitle>
        <AlertDescription>
          1.284 lançamentos conciliados sem divergência.
        </AlertDescription>
      </Alert>
      <Alert tone="warning">
        <AlertIcon>
          <TriangleAlert />
        </AlertIcon>
        <AlertTitle>Saldo divergente</AlertTitle>
        <AlertDescription>
          3 contas precisam de revisão manual antes do fechamento.
        </AlertDescription>
      </Alert>
      <Alert tone="error">
        <AlertIcon>
          <CircleX />
        </AlertIcon>
        <AlertTitle>Falha no upload</AlertTitle>
        <AlertDescription>
          O arquivo CSV está malformado — revise o cabeçalho.
        </AlertDescription>
      </Alert>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────
// Tamanhos (sm · md · lg)
// ──────────────────────────────────────────────────────────────────

export function SizesRow() {
  return (
    <div className="flex flex-col gap-3 py-4">
      <Alert size="sm" tone="info">
        <AlertIcon>
          <Info />
        </AlertIcon>
        <AlertTitle>sm — padding 8px / texto xs</AlertTitle>
      </Alert>
      <Alert size="md" tone="info">
        <AlertIcon>
          <Info />
        </AlertIcon>
        <AlertTitle>md — padding 12px (default)</AlertTitle>
      </Alert>
      <Alert size="lg" tone="info">
        <AlertIcon>
          <Info />
        </AlertIcon>
        <AlertTitle>lg — padding 16px</AlertTitle>
        <AlertDescription>Espaço extra para corpos densos.</AlertDescription>
      </Alert>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────
// Ações no slot trailing
// ──────────────────────────────────────────────────────────────────

export function ActionsRow() {
  return (
    <div className="flex flex-col gap-3 py-4">
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
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────
// Dismiss (uncontrolled)
// ──────────────────────────────────────────────────────────────────

export function DismissRow() {
  return (
    <div className="flex flex-col gap-3 py-4">
      <Alert tone="info">
        <AlertIcon>
          <Info />
        </AlertIcon>
        <AlertTitle>Atualização disponível</AlertTitle>
        <AlertDescription>Recarregue para receber a v0.2.</AlertDescription>
        <AlertClose />
      </Alert>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────
// Conteúdo longo
// ──────────────────────────────────────────────────────────────────

export function LongContentRow() {
  return (
    <div className="flex flex-col gap-3 py-4">
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
            Segunda linha mais comprida — o seletor interno
            <code>[&amp;_p]:leading-relaxed</code> mantém a respiração
            consistente em qualquer densidade de parágrafo.
          </p>
        </AlertDescription>
      </Alert>
    </div>
  );
}
