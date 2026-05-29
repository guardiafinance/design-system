import * as React from "react";
import {
  ArrowRight,
  FileText,
  Home,
  LayoutDashboard,
  Plus,
  RefreshCw,
  Search,
  Settings,
  Trash2,
  User,
} from "lucide-react";

import {
  CommandPalette,
  formatShortcut,
  type CommandPaletteGroup,
} from "@ds/components/command";
import { Button } from "@ds/components/button";

// ──────────────────────────────────────────────────────────────────
// Trigger compartilhado — abre a paleta a partir de um botão
// + atalho ⌘K / Ctrl+K global
// ──────────────────────────────────────────────────────────────────

interface TriggerProps {
  items: CommandPaletteGroup[];
  placeholder?: string;
  emptyText?: React.ReactNode;
  label?: string;
}

function PaletteTrigger({
  items,
  placeholder,
  emptyText,
  label = `Abrir paleta (${formatShortcut(["mod", "K"])})`,
}: TriggerProps): React.ReactElement {
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "k" && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        setOpen((value) => !value);
      }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <>
      <Button onClick={() => setOpen(true)}>{label}</Button>
      <CommandPalette
        open={open}
        onOpenChange={setOpen}
        items={items}
        placeholder={placeholder}
        emptyText={emptyText}
      />
    </>
  );
}

// ──────────────────────────────────────────────────────────────────
// Padrão — grupos com shortcuts
// ──────────────────────────────────────────────────────────────────

export function BasicRow(): React.ReactElement {
  const items: CommandPaletteGroup[] = [
    {
      id: "navigation",
      heading: "Navegação",
      entries: [
        { id: "home", label: "Início", shortcut: formatShortcut(["mod", "H"]) },
        { id: "dashboard", label: "Dashboard", shortcut: formatShortcut(["mod", "D"]) },
        { id: "profile", label: "Perfil", shortcut: formatShortcut(["mod", "P"]) },
      ],
    },
    {
      id: "actions",
      heading: "Ações",
      entries: [
        { id: "create", label: "Criar lançamento", shortcut: formatShortcut(["mod", "N"]) },
        { id: "sync", label: "Sincronizar contas", keywords: "atualizar refresh" },
        { id: "settings", label: "Configurações", shortcut: formatShortcut(["mod", ","]) },
      ],
    },
  ];
  return (
    <div className="flex items-center justify-center py-6">
      <PaletteTrigger items={items} />
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────
// WithIcons — entries com ícone + shortcut + description
// ──────────────────────────────────────────────────────────────────

export function WithIconsRow(): React.ReactElement {
  const items: CommandPaletteGroup[] = [
    {
      id: "navigation",
      heading: "Navegação",
      entries: [
        { id: "home", label: "Início", icon: <Home />, shortcut: formatShortcut(["mod", "H"]) },
        {
          id: "dashboard",
          label: "Dashboard",
          description: "Visão consolidada de KPIs",
          icon: <LayoutDashboard />,
          shortcut: formatShortcut(["mod", "D"]),
        },
        { id: "profile", label: "Perfil", icon: <User />, shortcut: formatShortcut(["mod", "P"]) },
      ],
    },
    {
      id: "actions",
      heading: "Ações",
      entries: [
        {
          id: "create",
          label: "Criar lançamento",
          description: "Abre o formulário de novo lançamento contábil",
          icon: <Plus />,
          shortcut: formatShortcut(["mod", "N"]),
        },
        {
          id: "sync",
          label: "Sincronizar contas",
          description: "Atualiza saldos via Open Finance",
          icon: <RefreshCw />,
          keywords: "atualizar refresh sync open finance",
        },
        {
          id: "settings",
          label: "Configurações",
          icon: <Settings />,
          shortcut: formatShortcut(["mod", ","]),
        },
      ],
    },
  ];
  return (
    <div className="flex items-center justify-center py-6">
      <PaletteTrigger
        items={items}
        label={`Paleta com ícones (${formatShortcut(["mod", "K"])})`}
      />
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────
// EmptyState — sem match para o filter
// ──────────────────────────────────────────────────────────────────

export function EmptyStateRow(): React.ReactElement {
  const items: CommandPaletteGroup[] = [
    {
      id: "actions",
      heading: "Ações",
      entries: [
        { id: "create", label: "Criar lançamento" },
        { id: "sync", label: "Sincronizar" },
      ],
    },
  ];
  return (
    <div className="flex items-center justify-center py-6">
      <PaletteTrigger
        items={items}
        placeholder='Digite "xyz" para ver o estado vazio'
        emptyText="Nenhum comando corresponde à sua busca"
        label="Paleta com estado vazio"
      />
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────
// UseCases — paridade com a referência legacy (ações destrutivas
// usam ícone, NUNCA wrapper externo de cor)
// ──────────────────────────────────────────────────────────────────

export function UseCasesRow(): React.ReactElement {
  const items: CommandPaletteGroup[] = [
    {
      id: "docs",
      heading: "Documentos recentes",
      entries: [
        { id: "doc-1", label: "Plano de contas 2026", icon: <FileText /> },
        { id: "doc-2", label: "Conciliação Itaú · maio", icon: <FileText /> },
        { id: "doc-3", label: "Balancete Q1 2026", icon: <FileText /> },
      ],
    },
    {
      id: "ops",
      heading: "Operações",
      entries: [
        { id: "search", label: "Buscar tudo…", icon: <Search /> },
        { id: "more", label: "Ver mais resultados", icon: <ArrowRight /> },
        {
          id: "delete",
          label: "Excluir lançamento atual",
          description: "Remove o lançamento selecionado",
          icon: <Trash2 />,
          shortcut: formatShortcut(["mod", "Backspace"]),
        },
      ],
    },
  ];
  return (
    <div className="flex items-center justify-center py-6">
      <PaletteTrigger items={items} label="Casos de uso · paleta global" />
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────
// ForcedPlatformRow — demo da opção `{ platform }` do helper pra
// docs/contextos que restringem o SO (e.g. wiki interna Windows-only).
// ──────────────────────────────────────────────────────────────────

export function ForcedPlatformRow(): React.ReactElement {
  const items: CommandPaletteGroup[] = [
    {
      id: "mac-only",
      heading: "Apenas Mac (platform: 'mac')",
      entries: [
        {
          id: "mac-search",
          label: "Buscar comando…",
          icon: <Search />,
          shortcut: formatShortcut(["mod", "K"], { platform: "mac" }),
        },
        {
          id: "mac-create",
          label: "Criar lançamento",
          icon: <Plus />,
          shortcut: formatShortcut(["mod", "shift", "N"], { platform: "mac" }),
        },
        {
          id: "mac-delete",
          label: "Excluir item",
          icon: <Trash2 />,
          shortcut: formatShortcut(["mod", "shift", "Backspace"], { platform: "mac" }),
        },
      ],
    },
    {
      id: "non-mac-only",
      heading: "Apenas Win/Linux (platform: 'non-mac')",
      entries: [
        {
          id: "win-search",
          label: "Buscar comando…",
          icon: <Search />,
          shortcut: formatShortcut(["mod", "K"], { platform: "non-mac" }),
        },
        {
          id: "win-create",
          label: "Criar lançamento",
          icon: <Plus />,
          shortcut: formatShortcut(["mod", "shift", "N"], { platform: "non-mac" }),
        },
        {
          id: "win-delete",
          label: "Excluir item",
          icon: <Trash2 />,
          shortcut: formatShortcut(["mod", "shift", "Backspace"], { platform: "non-mac" }),
        },
      ],
    },
  ];
  return (
    <div className="flex items-center justify-center py-6">
      <PaletteTrigger items={items} label="Paleta · forced platform" />
    </div>
  );
}
