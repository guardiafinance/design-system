import { Search, Mail, AtSign, DollarSign, User } from "lucide-react";
import { Input } from "@ds/components/input";

export function BasicRow() {
  return (
    <div className="w-72">
      <Input placeholder="Digite seu nome" />
    </div>
  );
}

export function WithIconsRow() {
  return (
    <div className="flex w-72 flex-col gap-3">
      <Input
        leftIcon={<Search width={16} height={16} />}
        placeholder="Buscar lançamentos…"
        type="search"
      />
      <Input
        rightIcon={<Mail width={16} height={16} />}
        placeholder="user@guardia.finance"
        type="email"
      />
      <Input
        leftIcon={<User width={16} height={16} />}
        rightIcon={<AtSign width={14} height={14} />}
        placeholder="username"
      />
    </div>
  );
}

export function PrefixSuffixRow() {
  return (
    <div className="flex w-72 flex-col gap-3">
      <Input prefix="R$" placeholder="0,00" inputMode="decimal" />
      <Input suffix=".finance" placeholder="empresa" />
      <Input
        prefix={<DollarSign width={14} height={14} />}
        suffix="USD"
        placeholder="0.00"
        inputMode="decimal"
      />
      <Input prefix="@" suffix=".com" placeholder="username" />
    </div>
  );
}

export function SizesRow() {
  return (
    <div className="flex w-72 flex-col gap-3">
      <Input size="sm" placeholder="Small (32px)" />
      <Input size="md" placeholder="Medium · default (38px)" />
      <Input size="lg" placeholder="Large (46px)" />
    </div>
  );
}

export function StatesRow() {
  return (
    <div className="grid w-full max-w-2xl grid-cols-3 gap-3">
      <div className="flex flex-col gap-2">
        <span className="text-xs uppercase tracking-wider text-fg-muted">
          Default
        </span>
        <Input placeholder="Sem estado" />
      </div>
      <div className="flex flex-col gap-2">
        <span className="text-xs uppercase tracking-wider text-fg-muted">
          Error
        </span>
        <Input invalid defaultValue="invalid@" />
      </div>
      <div className="flex flex-col gap-2">
        <span className="text-xs uppercase tracking-wider text-fg-muted">
          Success
        </span>
        <Input state="success" defaultValue="ok@guardia.finance" />
      </div>
    </div>
  );
}

export function DisabledRow() {
  return (
    <div className="w-72">
      <Input disabled defaultValue="leitura" />
    </div>
  );
}

export function FormSubmitRow() {
  return (
    <form
      className="flex w-72 flex-col gap-3"
      onSubmit={(e) => {
        e.preventDefault();
        const data = new FormData(e.currentTarget);
        alert(`email = ${data.get("email") || "(vazio)"}`);
      }}
    >
      <label htmlFor="fs-email" className="text-sm font-medium">
        Email
      </label>
      <Input
        id="fs-email"
        name="email"
        type="email"
        leftIcon={<Mail width={16} height={16} />}
        placeholder="você@guardia.finance"
        required
      />
      <button
        type="submit"
        className="rounded-md bg-guardia-purple-500 px-3 py-2 text-sm text-white"
      >
        Enviar
      </button>
    </form>
  );
}
