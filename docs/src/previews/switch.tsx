import { useState } from "react";
import { Switch } from "@ds/components/switch";

export function BasicRow() {
  return (
    <div className="flex flex-col gap-3">
      <Switch label="Receber notificacoes por e-mail" />
      <Switch label="Resumo diario as 18h" defaultChecked />
    </div>
  );
}

export function WithDescriptionRow() {
  return (
    <div className="flex flex-col gap-4">
      <Switch
        label="Autopilot de conciliacao"
        description="Aprova matches com confianca acima de 95% sem revisao manual."
        defaultChecked
      />
      <Switch
        label="Alerta de divergencia > R$ 1.000"
        description="E-mail + push toda vez que uma transacao nao casar com extrato."
      />
    </div>
  );
}

export function StatesRow() {
  return (
    <div className="flex flex-col gap-3">
      <Switch label="Ativado" defaultChecked />
      <Switch label="Desativado" />
      <Switch
        label="Aceitar termos"
        description="Voce precisa concordar para continuar"
        invalid
      />
      <Switch label="Bloqueado (on)" defaultChecked disabled />
      <Switch label="Bloqueado (off)" disabled />
    </div>
  );
}

export function SizesRow() {
  return (
    <div className="flex flex-col gap-4">
      <Switch
        size="sm"
        label="Tamanho sm (denso)"
        description="Track 30x18 . label 13px"
      />
      <Switch
        size="md"
        label="Tamanho md (default)"
        description="Track 38x22 . label 14px"
      />
    </div>
  );
}

export function GroupRow() {
  const [email, setEmail] = useState(true);
  const [push, setPush] = useState(false);

  return (
    <fieldset className="flex w-fit flex-col gap-3 rounded-md border border-border p-4">
      <legend className="px-2 text-sm font-semibold">Notificacoes</legend>
      <Switch
        label="E-mail"
        description={`estado: ${email ? "ligado" : "desligado"}`}
        checked={email}
        onCheckedChange={setEmail}
      />
      <Switch
        label="Push"
        description={push ? "ativo" : "inativo"}
        checked={push}
        onCheckedChange={setPush}
      />
      <Switch label="SMS" description="Apenas para 2FA" disabled />
    </fieldset>
  );
}

export function StandaloneRow() {
  return (
    <div className="flex items-center gap-3">
      <Switch id="standalone-sw" aria-label="Modo aviao" />
      <label htmlFor="standalone-sw" className="text-sm text-fg">
        Sem composicao interna — label externa via{" "}
        <code className="rounded bg-muted px-1 font-mono text-xs">
          htmlFor
        </code>
      </label>
    </div>
  );
}
