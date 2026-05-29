import type { Meta, StoryObj } from "@storybook/react";
import * as React from "react";
import {
  ArrowLeftRight,
  BookOpenCheck,
  Inbox,
  LayoutDashboard,
  LifeBuoy,
  ReceiptText,
  Settings,
  Users,
} from "lucide-react";

import {
  SidebarNav,
  SidebarNavGroup,
  SidebarNavGroupContent,
  SidebarNavGroupTrigger,
  SidebarNavItem,
  SidebarNavSection,
} from "./index";

const meta: Meta<typeof SidebarNav> = {
  title: "Components/SidebarNav",
  component: SidebarNav,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          'Primitiva canônica de navegação lateral vertical com seções, grupos colapsáveis, item ativo, badge e modo `collapsed` (só ícones). Distinta do `<Sidebar>` composite shell (chrome de aplicação com `<SidebarProvider>`, persistência cookie e Drawer mobile) — `SidebarNav` é a árvore de navegação consumida dentro de qualquer chrome. Sem Radix base (composição manual de `aria-expanded`/`aria-controls`); em modo collapsed cada item interativo é wrappeado em `<Tooltip>` do DS com defesa em profundidade via `sr-only`. Decisões em ADR-019.',
      },
    },
  },
  argTypes: {
    collapsed: { control: "boolean" },
    "aria-label": { control: "text" },
  },
};
export default meta;

type Story = StoryObj<typeof meta>;

function PageStub({ label }: { label: string }): React.ReactElement {
  return (
    <div className="flex min-h-[420px] flex-1 items-center justify-center rounded-lg border border-border bg-background p-8 text-sm text-muted-foreground">
      Conteúdo: <b className="ml-1 text-foreground">{label}</b>
    </div>
  );
}

function Shell({
  children,
  contentLabel,
}: {
  children: React.ReactNode;
  contentLabel: string;
}): React.ReactElement {
  return (
    <div className="flex h-[520px] gap-4 rounded-lg bg-muted/40 p-2">
      {children}
      <PageStub label={contentLabel} />
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────
// Default
// ──────────────────────────────────────────────────────────────────

export const Default: Story = {
  render: () => (
    <Shell contentLabel="rotas / seções ativas">
      <SidebarNav>
        <SidebarNavSection label="Geral">
          <SidebarNavItem icon={<LayoutDashboard />} active>
            Início
          </SidebarNavItem>
          <SidebarNavItem icon={<Inbox />}>Inbox</SidebarNavItem>
          <SidebarNavItem icon={<Users />}>Clientes</SidebarNavItem>
        </SidebarNavSection>
      </SidebarNav>
    </Shell>
  ),
};

// ──────────────────────────────────────────────────────────────────
// Collapsed
// ──────────────────────────────────────────────────────────────────

export const Collapsed: Story = {
  render: () => (
    <Shell contentLabel="modo compacto">
      <SidebarNav collapsed>
        <SidebarNavSection label="Geral">
          <SidebarNavItem icon={<LayoutDashboard />} active>
            Início
          </SidebarNavItem>
          <SidebarNavItem icon={<Inbox />}>Inbox</SidebarNavItem>
          <SidebarNavItem icon={<Users />}>Clientes</SidebarNavItem>
        </SidebarNavSection>
        <SidebarNavSection label="Sistema">
          <SidebarNavItem icon={<Settings />}>Configurações</SidebarNavItem>
        </SidebarNavSection>
      </SidebarNav>
    </Shell>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Modo `collapsed`: labels viram `sr-only`, badges somem, cada item interativo é wrappeado em `<Tooltip>` do DS com o label textual. Section label vira divisor (`<hr>`).',
      },
    },
  },
};

// ──────────────────────────────────────────────────────────────────
// WithActiveItem
// ──────────────────────────────────────────────────────────────────

function ActiveDemo(): React.ReactElement {
  const [active, setActive] = React.useState("clientes");
  return (
    <SidebarNav>
      <SidebarNavSection label="Geral">
        <SidebarNavItem
          icon={<LayoutDashboard />}
          active={active === "inicio"}
          onClick={() => setActive("inicio")}
        >
          Início
        </SidebarNavItem>
        <SidebarNavItem
          icon={<Inbox />}
          active={active === "inbox"}
          onClick={() => setActive("inbox")}
        >
          Inbox
        </SidebarNavItem>
        <SidebarNavItem
          icon={<Users />}
          active={active === "clientes"}
          onClick={() => setActive("clientes")}
        >
          Clientes
        </SidebarNavItem>
      </SidebarNavSection>
    </SidebarNav>
  );
}

export const WithActiveItem: Story = {
  render: () => (
    <Shell contentLabel="clique para alternar ativo">
      <ActiveDemo />
    </Shell>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "`active` controla via prop. O componente aplica `aria-current=\"page\"` no elemento renderizado e o estado visual via `bg-sidebar-accent text-sidebar-accent-foreground font-semibold`.",
      },
    },
  },
};

// ──────────────────────────────────────────────────────────────────
// WithBadges
// ──────────────────────────────────────────────────────────────────

export const WithBadges: Story = {
  render: () => (
    <Shell contentLabel="contadores à direita">
      <SidebarNav>
        <SidebarNavSection label="Geral">
          <SidebarNavItem icon={<Inbox />} badge="12">
            Inbox
          </SidebarNavItem>
          <SidebarNavItem icon={<ReceiptText />} badge="3">
            Fiscal
          </SidebarNavItem>
          <SidebarNavItem icon={<Users />} badge="124">
            Clientes
          </SidebarNavItem>
        </SidebarNavSection>
      </SidebarNav>
    </Shell>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "Badge à direita do item, escondido em modo `collapsed`. Tokens `bg-sidebar-accent` + `text-sidebar-accent-foreground` reaproveitados do item ativo.",
      },
    },
  },
};

// ──────────────────────────────────────────────────────────────────
// WithGroups
// ──────────────────────────────────────────────────────────────────

export const WithGroups: Story = {
  render: () => (
    <Shell contentLabel="grupo colapsável">
      <SidebarNav>
        <SidebarNavSection label="Operação">
          <SidebarNavGroup label="Contábil" icon={<BookOpenCheck />}>
            <SidebarNavGroupTrigger />
            <SidebarNavGroupContent>
              <SidebarNavItem>Lançamentos</SidebarNavItem>
              <SidebarNavItem>Razão</SidebarNavItem>
              <SidebarNavItem>Plano de contas</SidebarNavItem>
            </SidebarNavGroupContent>
          </SidebarNavGroup>
          <SidebarNavGroup
            label="Financeiro"
            icon={<ArrowLeftRight />}
            defaultOpen={false}
          >
            <SidebarNavGroupTrigger />
            <SidebarNavGroupContent>
              <SidebarNavItem>Conciliação</SidebarNavItem>
              <SidebarNavItem>Extratos</SidebarNavItem>
            </SidebarNavGroupContent>
          </SidebarNavGroup>
        </SidebarNavSection>
      </SidebarNav>
    </Shell>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "Grupos descontrolados (`defaultOpen`) ou controlados (`open`/`onOpenChange`). Trigger emite `aria-expanded` e `aria-controls` para o conteúdo (`role=\"group\"`).",
      },
    },
  },
};

// ──────────────────────────────────────────────────────────────────
// DenseRealistic — fixture do playground legado
// ──────────────────────────────────────────────────────────────────

function RealisticDemo(): React.ReactElement {
  const [active, setActive] = React.useState("inicio");
  const handler = (key: string) => ({
    active: active === key,
    onClick: () => setActive(key),
  });
  return (
    <SidebarNav>
      <SidebarNavSection label="Geral">
        <SidebarNavItem icon={<LayoutDashboard />} {...handler("inicio")}>
          Início
        </SidebarNavItem>
        <SidebarNavItem icon={<Inbox />} badge="12" {...handler("inbox")}>
          Inbox
        </SidebarNavItem>
        <SidebarNavItem icon={<Users />} {...handler("clientes")}>
          Clientes
        </SidebarNavItem>
      </SidebarNavSection>
      <SidebarNavSection label="Operação">
        <SidebarNavGroup label="Contábil" icon={<BookOpenCheck />}>
          <SidebarNavGroupTrigger />
          <SidebarNavGroupContent>
            <SidebarNavItem {...handler("lanc")}>Lançamentos</SidebarNavItem>
            <SidebarNavItem {...handler("razao")}>Razão</SidebarNavItem>
            <SidebarNavItem {...handler("plano")}>Plano de contas</SidebarNavItem>
          </SidebarNavGroupContent>
        </SidebarNavGroup>
        <SidebarNavGroup
          label="Financeiro"
          icon={<ArrowLeftRight />}
          defaultOpen={false}
        >
          <SidebarNavGroupTrigger />
          <SidebarNavGroupContent>
            <SidebarNavItem {...handler("conc")}>Conciliação</SidebarNavItem>
            <SidebarNavItem {...handler("extratos")}>Extratos</SidebarNavItem>
          </SidebarNavGroupContent>
        </SidebarNavGroup>
        <SidebarNavItem
          icon={<ReceiptText />}
          badge="3"
          {...handler("fiscal")}
        >
          Fiscal
        </SidebarNavItem>
      </SidebarNavSection>
      <SidebarNavSection label="Sistema">
        <SidebarNavItem icon={<Settings />} {...handler("config")}>
          Configurações
        </SidebarNavItem>
        <SidebarNavItem icon={<LifeBuoy />} {...handler("ajuda")}>
          Ajuda
        </SidebarNavItem>
      </SidebarNavSection>
    </SidebarNav>
  );
}

export const DenseRealistic: Story = {
  render: () => (
    <Shell contentLabel="cenário pleno (paridade com playground legado)">
      <RealisticDemo />
    </Shell>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "Fixture canônica: 3 sections, 2 groups (um aberto, um fechado), 3 itens com ícone, 2 com badge, 1 item ativo. Replica `ux_references/ui_kits/components/SidebarNav/SidebarNav.playground.html`.",
      },
    },
  },
};
