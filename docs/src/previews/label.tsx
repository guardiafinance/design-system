import { Label } from "@ds/components/label";

const inputCls =
  "h-10 w-72 rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2";

export function BasicRow() {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="p1-name">Nome</Label>
        <input id="p1-name" type="text" className={inputCls} />
      </div>
    </div>
  );
}

export function RequiredRow() {
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor="p2-email" required>
        Email
      </Label>
      <input id="p2-email" type="email" className={inputCls} />
    </div>
  );
}

export function OptionalRow() {
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor="p3-phone" optional>
        Telefone
      </Label>
      <input id="p3-phone" type="tel" className={inputCls} />
    </div>
  );
}

export function SizesRow() {
  return (
    <div className="flex flex-col gap-3">
      <Label size="sm" htmlFor="sz-a">
        Small (12.5px — default)
      </Label>
      <Label size="md" htmlFor="sz-b">
        Medium (14px)
      </Label>
    </div>
  );
}

export function FormRow() {
  return (
    <form className="grid gap-4">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="f-name" required>
          Nome completo
        </Label>
        <input
          id="f-name"
          type="text"
          placeholder="Fernando Seguim"
          className={inputCls}
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="f-email" required>
          Email
        </Label>
        <input
          id="f-email"
          type="email"
          placeholder="voce@guardia.finance"
          className={inputCls}
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="f-phone" optional>
          Whatsapp
        </Label>
        <input
          id="f-phone"
          type="tel"
          placeholder="(11) 9 9999-9999"
          className={inputCls}
        />
      </div>
    </form>
  );
}
