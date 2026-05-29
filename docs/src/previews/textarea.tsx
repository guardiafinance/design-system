import { useState } from "react";
import { Textarea } from "@ds/components/textarea";

export function BasicRow() {
  return (
    <div className="w-96">
      <label htmlFor="pv-basic" className="mb-2 block text-sm font-medium">
        Observação
      </label>
      <Textarea
        id="pv-basic"
        placeholder="Digite uma observação…"
        rows={3}
      />
    </div>
  );
}

export function SizesRow() {
  return (
    <div className="flex w-96 flex-col gap-4">
      <div>
        <label
          htmlFor="pv-sm"
          className="mb-1 block text-xs uppercase tracking-wider text-fg-muted"
        >
          Small (sm)
        </label>
        <Textarea
          id="pv-sm"
          size="sm"
          defaultValue="Textarea pequena (sm)"
          rows={2}
        />
      </div>
      <div>
        <label
          htmlFor="pv-md"
          className="mb-1 block text-xs uppercase tracking-wider text-fg-muted"
        >
          Medium · default (md)
        </label>
        <Textarea
          id="pv-md"
          defaultValue="Textarea média (md) — padrão"
          rows={3}
        />
      </div>
      <div>
        <label
          htmlFor="pv-lg"
          className="mb-1 block text-xs uppercase tracking-wider text-fg-muted"
        >
          Large (lg)
        </label>
        <Textarea
          id="pv-lg"
          size="lg"
          defaultValue="Textarea grande (lg)"
          rows={4}
        />
      </div>
    </div>
  );
}

export function StatesRow() {
  return (
    <div className="grid w-full max-w-3xl grid-cols-3 gap-4">
      <div className="flex flex-col gap-1">
        <label
          htmlFor="pv-st-d"
          className="text-xs uppercase tracking-wider text-fg-muted"
        >
          Default
        </label>
        <Textarea id="pv-st-d" placeholder="Sem estado" rows={3} />
      </div>
      <div className="flex flex-col gap-1">
        <label
          htmlFor="pv-st-e"
          className="text-xs uppercase tracking-wider text-fg-muted"
        >
          Error
        </label>
        <Textarea
          id="pv-st-e"
          invalid
          aria-describedby="pv-st-e-msg"
          defaultValue="CNPJ inválido no contexto"
          rows={3}
        />
        <span id="pv-st-e-msg" className="text-xs text-destructive">
          Texto inválido.
        </span>
      </div>
      <div className="flex flex-col gap-1">
        <label
          htmlFor="pv-st-s"
          className="text-xs uppercase tracking-wider text-fg-muted"
        >
          Success
        </label>
        <Textarea
          id="pv-st-s"
          state="success"
          defaultValue="Revisado e aprovado"
          rows={3}
        />
      </div>
    </div>
  );
}

export function CounterRow() {
  const [bio, setBio] = useState(
    "Contador técnico com foco em conciliação bancária automatizada.",
  );
  return (
    <div className="w-96">
      <label htmlFor="pv-counter" className="mb-2 block text-sm font-medium">
        Bio do profissional
      </label>
      <Textarea
        id="pv-counter"
        value={bio}
        onChange={(e) => setBio(e.target.value)}
        placeholder="Bio…"
        showCount
        maxLength={240}
        rows={4}
      />
    </div>
  );
}

export function AutoSizeRow() {
  const [text, setText] = useState(
    "Digite mais linhas para ver o textarea\ngrowing automaticamente.\n\nQuando alcançar maxRows={6}, o overflow vira scroll.",
  );
  return (
    <div className="w-96">
      <label htmlFor="pv-autosize" className="mb-2 block text-sm font-medium">
        AutoSize · maxRows=6
      </label>
      <Textarea
        id="pv-autosize"
        value={text}
        onChange={(e) => setText(e.target.value)}
        autoSize
        maxRows={6}
        placeholder="Digite multi-linha…"
      />
    </div>
  );
}

export function ResizeRow() {
  return (
    <div className="grid w-full max-w-3xl grid-cols-3 gap-4">
      <div>
        <label
          htmlFor="pv-r-none"
          className="mb-1 block text-xs uppercase tracking-wider text-fg-muted"
        >
          resize=none
        </label>
        <Textarea
          id="pv-r-none"
          resize="none"
          defaultValue="sem handle"
          rows={3}
        />
      </div>
      <div>
        <label
          htmlFor="pv-r-vert"
          className="mb-1 block text-xs uppercase tracking-wider text-fg-muted"
        >
          vertical (default)
        </label>
        <Textarea
          id="pv-r-vert"
          resize="vertical"
          defaultValue="handle vertical"
          rows={3}
        />
      </div>
      <div>
        <label
          htmlFor="pv-r-both"
          className="mb-1 block text-xs uppercase tracking-wider text-fg-muted"
        >
          both
        </label>
        <Textarea
          id="pv-r-both"
          resize="both"
          defaultValue="handle nos dois eixos"
          rows={3}
        />
      </div>
    </div>
  );
}

export function DisabledRow() {
  return (
    <div className="w-96">
      <label htmlFor="pv-disabled" className="mb-2 block text-sm font-medium">
        Travado
      </label>
      <Textarea
        id="pv-disabled"
        disabled
        defaultValue="Campo travado durante exportação"
        rows={3}
      />
    </div>
  );
}

export function FormSubmitRow() {
  return (
    <form
      className="flex w-96 flex-col gap-3"
      onSubmit={(e) => {
        e.preventDefault();
        const data = new FormData(e.currentTarget);
        alert(`bio = ${data.get("bio") || "(vazio)"}`);
      }}
    >
      <label htmlFor="pv-fd" className="text-sm font-medium">
        Bio
      </label>
      <Textarea
        id="pv-fd"
        name="bio"
        placeholder="Conte sobre você…"
        required
        showCount
        maxLength={240}
        rows={4}
      />
      <button
        type="submit"
        className="self-start rounded-md bg-guardia-purple-500 px-3 py-2 text-sm text-white"
      >
        Enviar
      </button>
    </form>
  );
}
