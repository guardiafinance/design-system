import type { Meta, StoryObj } from "@storybook/react";
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

import { CommandPalette, type CommandPaletteGroup } from "./index";
import { Button } from "../button";

const meta: Meta<typeof CommandPalette> = {
  title: "Components/Command",
  component: CommandPalette,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          'Paleta de comandos (⌘K) com search, grupos e entries keyboard-navegáveis. Para acesso rápido a ações conhecidas, complementar ao chat com Isac. Base em `cmdk` (filter heurístico, ARIA roles, keyboard nav) hospedado em `<Dialog>` (ADR-010 — focus trap, ESC, portal). API imperativa `<CommandPalette open onOpenChange items />` espelha a referência legacy; primitivas declarativas re-exportadas (`Command`, `CommandInput`, `CommandList`, `CommandGroup`, `CommandItem`, `CommandSeparator`, `CommandEmpty`, `CommandShortcut`) permitem composição avançada (paleta inline, sugestões streaming do Isac).',
      },
    },
  },
};
export default meta;

type Story = StoryObj<typeof meta>;

// ──────────────────────────────────────────────────────────────────
// Trigger — abre a paleta a partir de um botão
// ──────────────────────────────────────────────────────────────────

interface TriggerProps {
  items: CommandPaletteGroup[];
  placeholder?: string;
  emptyText?: React.ReactNode;
  label?: string;
}

function Trigger({
  items,
  placeholder,
  emptyText,
  label = "Abrir paleta de comandos (⌘K)",
}: TriggerProps): React.ReactElement {
  const [open, setOpen] = React.useState(false);

  // Atalho ⌘K / Ctrl+K para abrir.
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
// Default — paleta minimalista com grupos
// ──────────────────────────────────────────────────────────────────

export const Default: Story = {
  render: () => {
    const items: CommandPaletteGroup[] = [
      {
        id: "navigation",
        heading: "Navegação",
        entries: [
          { id: "home", label: "Início", shortcut: "⌘H" },
          { id: "dashboard", label: "Dashboard", shortcut: "⌘D" },
          { id: "profile", label: "Perfil", shortcut: "⌘P" },
        ],
      },
      {
        id: "actions",
        heading: "Ações",
        entries: [
          { id: "create", label: "Criar lançamento", shortcut: "⌘N" },
          { id: "sync", label: "Sincronizar contas", keywords: "atualizar refresh" },
          { id: "settings", label: "Configurações", shortcut: "⌘," },
        ],
      },
    ];
    return <Trigger items={items} />;
  },
  parameters: {
    docs: {
      description: {
        story:
          "Paleta básica com 2 grupos e shortcuts. Digite para filtrar — o filter do `cmdk` é heurístico (matches parciais, ranking). Use ↑/↓ para navegar, Enter para selecionar, ESC para fechar.",
      },
    },
  },
};

// ──────────────────────────────────────────────────────────────────
// WithIcons — entries com ícone + shortcut + description
// ──────────────────────────────────────────────────────────────────

export const WithIcons: Story = {
  render: () => {
    const items: CommandPaletteGroup[] = [
      {
        id: "navigation",
        heading: "Navegação",
        entries: [
          { id: "home", label: "Início", icon: <Home />, shortcut: "⌘H" },
          {
            id: "dashboard",
            label: "Dashboard",
            description: "Visão consolidada de KPIs",
            icon: <LayoutDashboard />,
            shortcut: "⌘D",
          },
          {
            id: "profile",
            label: "Perfil",
            icon: <User />,
            shortcut: "⌘P",
          },
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
            shortcut: "⌘N",
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
            shortcut: "⌘,",
          },
          {
            id: "delete",
            label: "Excluir lançamento atual",
            description: "Remove o lançamento selecionado",
            icon: <Trash2 />,
            shortcut: "⌘⌫",
          },
        ],
      },
    ];
    return <Trigger items={items} />;
  },
  parameters: {
    docs: {
      description: {
        story:
          "Entries com `icon` à esquerda, `description` abaixo do label e `shortcut` kbd à direita. Para ações destrutivas (`Excluir lançamento`), use ícone (`Trash2`) — o destaque visual é responsabilidade do ícone, **não** de wrapper externo `text-destructive` aplicado ao conteúdo.",
      },
    },
  },
};

// ──────────────────────────────────────────────────────────────────
// WithoutShortcuts — apenas labels (caso mínimo)
// ──────────────────────────────────────────────────────────────────

export const WithoutShortcuts: Story = {
  render: () => {
    const items: CommandPaletteGroup[] = [
      {
        id: "docs",
        heading: "Documentos recentes",
        entries: [
          { id: "doc-1", label: "Plano de contas 2026", icon: <FileText /> },
          { id: "doc-2", label: "Conciliação Itaú · maio", icon: <FileText /> },
          { id: "doc-3", label: "Balancete Q1 2026", icon: <FileText /> },
          { id: "doc-4", label: "Relatório de receitas YTD", icon: <FileText /> },
        ],
      },
      {
        id: "go",
        heading: "Ir para",
        entries: [
          { id: "go-search", label: "Buscar tudo…", icon: <Search /> },
          { id: "go-more", label: "Ver mais resultados", icon: <ArrowRight /> },
        ],
      },
    ];
    return <Trigger items={items} placeholder="Filtrar documentos…" />;
  },
  parameters: {
    docs: {
      description: {
        story:
          "Entries sem `shortcut` — útil para listas de documentos/contatos/registros onde o atalho não faz sentido. Ícone à esquerda mantém o ritmo visual da lista.",
      },
    },
  },
};

// ──────────────────────────────────────────────────────────────────
// EmptyState — sem match para o filter
// ──────────────────────────────────────────────────────────────────

export const EmptyState: Story = {
  render: () => {
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
      <Trigger
        items={items}
        placeholder='Digite "xyz" para ver o estado vazio'
        emptyText="Nenhum comando corresponde à sua busca"
      />
    );
  },
  parameters: {
    docs: {
      description: {
        story:
          "Quando o filter não retorna entries, `<CommandEmpty>` renderiza o texto de `emptyText`. Default é `Nenhum resultado` — sobrescreva para mensagens de orientação contextual.",
      },
    },
  },
};
