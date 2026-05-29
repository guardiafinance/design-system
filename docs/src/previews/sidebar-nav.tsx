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
} from "@ds/components/sidebar-nav";

// ──────────────────────────────────────────────────────────────────
// Page stub — visual filler for the right column in each preview
// ──────────────────────────────────────────────────────────────────

function PageStub({ label }: { label: string }): React.ReactElement {
  return (
    <div className="flex min-h-[360px] flex-1 items-center justify-center rounded-lg border border-border bg-background p-8 text-sm text-muted-foreground">
      Conteúdo: <b className="ml-1 text-foreground">{label}</b>
    </div>
  );
}

function Shell({
  children,
  label,
}: {
  children: React.ReactNode;
  label: string;
}): React.ReactElement {
  return (
    <div className="flex h-[420px] gap-4 rounded-lg bg-muted/40 p-2">
      {children}
      <PageStub label={label} />
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────
// BasicRow — default expanded
// ──────────────────────────────────────────────────────────────────

export function BasicRow(): React.ReactElement {
  return (
    <Shell label="rotas / seções ativas">
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
  );
}

// ──────────────────────────────────────────────────────────────────
// CollapsedRow
// ──────────────────────────────────────────────────────────────────

export function CollapsedRow(): React.ReactElement {
  return (
    <Shell label="modo compacto">
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
  );
}

// ──────────────────────────────────────────────────────────────────
// ActiveItemRow — interactive
// ──────────────────────────────────────────────────────────────────

export function ActiveItemRow(): React.ReactElement {
  const [active, setActive] = React.useState("clientes");
  return (
    <Shell label={`ativo: ${active}`}>
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
    </Shell>
  );
}

// ──────────────────────────────────────────────────────────────────
// BadgesRow
// ──────────────────────────────────────────────────────────────────

export function BadgesRow(): React.ReactElement {
  return (
    <Shell label="contadores">
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
  );
}

// ──────────────────────────────────────────────────────────────────
// GroupsRow
// ──────────────────────────────────────────────────────────────────

export function GroupsRow(): React.ReactElement {
  return (
    <Shell label="grupos colapsáveis">
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
  );
}

// ──────────────────────────────────────────────────────────────────
// RealisticRow — paridade com o playground legacy
// ──────────────────────────────────────────────────────────────────

export function RealisticRow(): React.ReactElement {
  const [active, setActive] = React.useState("inicio");
  const handler = (key: string) => ({
    active: active === key,
    onClick: () => setActive(key),
  });
  return (
    <Shell label={`cenário pleno · ativo: ${active}`}>
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
    </Shell>
  );
}
