/**
 * Button previews — exemplos ao vivo renderizados dentro da página docs.
 * Labels e cenários seguem o preview oficial em wip/preview/home.html.
 */
import { Button } from "@ds/components/button";
import {
  Save,
  UserPlus,
  ArrowRight,
  Download,
  RefreshCw,
  Trash2,
  Sparkles,
} from "lucide-react";

export function VariantsRow() {
  return (
    <>
      <Button variant="default">Primário</Button>
      <Button variant="secondary">Secundário</Button>
      <Button variant="destructive">Excluir</Button>
      <Button variant="outline">Outline</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="link">Link</Button>
    </>
  );
}

export function SizesRow() {
  return (
    <>
      <Button size="xs">Extra small</Button>
      <Button size="sm">Small</Button>
      <Button size="default">Medium</Button>
      <Button size="lg">Large</Button>
      <Button size="icon" aria-label="Salvar">
        <Save />
      </Button>
    </>
  );
}

export function IconsRow() {
  return (
    <>
      <Button leadingIcon={<UserPlus />}>Novo cliente</Button>
      <Button variant="default" trailingIcon={<ArrowRight />}>
        Continuar
      </Button>
      <Button variant="secondary" leadingIcon={<Download />}>
        Exportar
      </Button>
      <Button variant="outline" leadingIcon={<RefreshCw />}>
        Atualizar
      </Button>
      <Button variant="destructive" leadingIcon={<Trash2 />}>
        Excluir conta
      </Button>
    </>
  );
}

export function AgentRow() {
  return (
    <Button variant="secondary" leadingIcon={<Sparkles />}>
      Perguntar ao Isac
    </Button>
  );
}

export function StatesRow() {
  return (
    <>
      <Button loading>Salvando…</Button>
      <Button disabled>Desabilitado</Button>
      <Button variant="secondary" disabled leadingIcon={<Save />}>
        Desabilitado + ícone
      </Button>
    </>
  );
}

export function FullButton() {
  return (
    <Button full leadingIcon={<ArrowRight />}>
      Ocupa a largura total
    </Button>
  );
}
