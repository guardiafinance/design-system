import * as React from "react";

import {
  Toast,
  ToastProvider,
  ToastViewport,
  ToastTitle,
  ToastDescription,
  ToastAction,
  ToastClose,
  useToast,
  type ToastTone,
  type ToastPosition,
} from "@ds/components/toast";
import { Button } from "@ds/components/button";

// ──────────────────────────────────────────────────────────────────
// Trigger — fires a toast via useToast()
// ──────────────────────────────────────────────────────────────────

interface TriggerProps {
  tone: ToastTone;
  title: React.ReactNode;
  description?: React.ReactNode;
  duration?: number;
  withAction?: boolean;
  label?: React.ReactNode;
}

function Trigger({
  tone,
  title,
  description,
  duration,
  withAction,
  label,
}: TriggerProps): React.ReactElement {
  const { toast } = useToast();
  return (
    <Button
      onClick={() =>
        toast({
          tone,
          title,
          description,
          duration,
          action: withAction
            ? { label: "Desfazer", onClick: () => {} }
            : undefined,
        })
      }
    >
      {label ?? `Disparar ${tone}`}
    </Button>
  );
}

// ──────────────────────────────────────────────────────────────────
// Padrão
// ──────────────────────────────────────────────────────────────────

export function BasicRow(): React.ReactElement {
  return (
    <div className="flex flex-col gap-3 py-4">
      <ToastProvider>
        <Trigger
          tone="info"
          title="Processando 248 lançamentos…"
          label="Disparar info"
        />
      </ToastProvider>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────
// Tons (info · success · warning · error)
// ──────────────────────────────────────────────────────────────────

export function TonesRow(): React.ReactElement {
  return (
    <div className="flex flex-col gap-3 py-4">
      <ToastProvider>
        <div className="flex flex-wrap gap-2">
          <Trigger
            tone="info"
            title="Processando 248 lançamentos…"
            label="info"
          />
          <Trigger
            tone="success"
            title="Conciliação concluída"
            description="237 aprovados · 11 pendentes"
            label="success"
          />
          <Trigger
            tone="warning"
            title="Revisão humana necessária"
            description="3 itens abaixo do limiar de confiança"
            label="warning"
          />
          <Trigger
            tone="error"
            title="Falha ao sincronizar com o Itaú"
            description="Reconecte sua conta para continuar"
            label="error"
          />
        </div>
      </ToastProvider>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────
// Com ação
// ──────────────────────────────────────────────────────────────────

export function ActionsRow(): React.ReactElement {
  return (
    <div className="flex flex-col gap-3 py-4">
      <ToastProvider>
        <Trigger
          tone="success"
          title="Lançamento aprovado"
          description="NF 4891 movida para a contabilidade"
          withAction
          label="success + Desfazer"
        />
      </ToastProvider>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────
// Posições
// ──────────────────────────────────────────────────────────────────

function PositionDemo({
  position,
}: {
  position: ToastPosition;
}): React.ReactElement {
  return (
    <ToastProvider position={position}>
      <Trigger
        tone="info"
        title={`position="${position}"`}
        label={position}
      />
    </ToastProvider>
  );
}

export function PositionsRow(): React.ReactElement {
  return (
    <div className="flex flex-col gap-3 py-4">
      <div className="flex flex-wrap gap-2">
        <PositionDemo position="bottom-right" />
        <PositionDemo position="top-right" />
        <PositionDemo position="top-center" />
        <PositionDemo position="bottom-left" />
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────
// Persistente (duration = Infinity)
// ──────────────────────────────────────────────────────────────────

export function PersistentRow(): React.ReactElement {
  return (
    <div className="flex flex-col gap-3 py-4">
      <ToastProvider>
        <Trigger
          tone="warning"
          title="Certificado vence em 7 dias"
          description="Renove para evitar interrupção do serviço"
          duration={Infinity}
          label="Persistente"
        />
      </ToastProvider>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────
// Stacked — fila + limite
// ──────────────────────────────────────────────────────────────────

function StackTrigger(): React.ReactElement {
  const { toast } = useToast();
  const counter = React.useRef(0);
  return (
    <Button
      onClick={() => {
        const tones: ToastTone[] = ["info", "success", "warning", "error"];
        tones.forEach((tone, index) => {
          setTimeout(() => {
            counter.current += 1;
            toast({
              tone,
              title: `Toast #${counter.current}`,
              description: `Tipo ${tone}`,
            });
          }, index * 200);
        });
      }}
    >
      Disparar 4 em sequência
    </Button>
  );
}

export function StackedRow(): React.ReactElement {
  return (
    <div className="flex flex-col gap-3 py-4">
      <ToastProvider limit={5}>
        <StackTrigger />
      </ToastProvider>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────
// Composição declarativa
// ──────────────────────────────────────────────────────────────────

export function DeclarativeRow(): React.ReactElement {
  return (
    <div className="flex flex-col gap-3 py-4">
      <ToastProvider hideViewport>
        <Toast tone="success" defaultOpen>
          <ToastTitle>Composição declarativa</ToastTitle>
          <ToastDescription>
            Markup customizado sem perder o token contract do design system.
          </ToastDescription>
          <ToastAction altText="Desfazer">Desfazer</ToastAction>
          <ToastClose />
        </Toast>
        <ToastViewport />
      </ToastProvider>
    </div>
  );
}
