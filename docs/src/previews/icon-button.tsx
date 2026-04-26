import { IconButton } from "@ds/components/icon-button";
import {
  Bell,
  Copy,
  Download,
  Heart,
  MoreVertical,
  Pencil,
  Plus,
  Search,
  Settings,
  Trash2,
} from "lucide-react";

export function VariantsRow() {
  return (
    <>
      <IconButton aria-label="Primária" variant="default">
        <Plus />
      </IconButton>
      <IconButton aria-label="Secundária" variant="secondary">
        <Bell />
      </IconButton>
      <IconButton aria-label="Destrutiva" variant="destructive">
        <Trash2 />
      </IconButton>
      <IconButton aria-label="Outline" variant="outline">
        <Pencil />
      </IconButton>
      <IconButton aria-label="Ghost (default)" variant="ghost">
        <Copy />
      </IconButton>
    </>
  );
}

export function SizesRow() {
  return (
    <>
      <IconButton aria-label="Small" size="sm">
        <Search />
      </IconButton>
      <IconButton aria-label="Medium" size="md">
        <Search />
      </IconButton>
      <IconButton aria-label="Large" size="lg">
        <Search />
      </IconButton>
    </>
  );
}

export function ShapesRow() {
  return (
    <>
      <IconButton aria-label="Square" shape="square">
        <Heart />
      </IconButton>
      <IconButton aria-label="Circle" shape="circle">
        <Heart />
      </IconButton>
      <IconButton aria-label="Square solid" variant="default" shape="square">
        <Download />
      </IconButton>
      <IconButton aria-label="Circle solid" variant="default" shape="circle">
        <Download />
      </IconButton>
    </>
  );
}

export function StatesRow() {
  return (
    <>
      <IconButton aria-label="Salvando" loading variant="default">
        <Plus />
      </IconButton>
      <IconButton aria-label="Desabilitado" disabled>
        <Settings />
      </IconButton>
    </>
  );
}

export function ToolbarRow() {
  return (
    <div
      role="toolbar"
      aria-label="Ações da linha"
      className="flex items-center gap-1 rounded-md border border-border bg-background p-1"
    >
      <IconButton aria-label="Editar" size="sm">
        <Pencil />
      </IconButton>
      <IconButton aria-label="Copiar" size="sm">
        <Copy />
      </IconButton>
      <IconButton aria-label="Excluir" size="sm" variant="destructive">
        <Trash2 />
      </IconButton>
      <IconButton aria-label="Mais ações" size="sm">
        <MoreVertical />
      </IconButton>
    </div>
  );
}
