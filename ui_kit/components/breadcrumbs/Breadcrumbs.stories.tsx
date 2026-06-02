import type { Meta, StoryObj } from "@storybook/react";
import { Home, Slash } from "lucide-react";

import {
  Breadcrumbs,
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
  BreadcrumbEllipsis,
} from "./index";

const meta: Meta<typeof Breadcrumbs> = {
  title: "Components/Breadcrumbs",
  component: Breadcrumbs,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          'Trilha de navegação hierárquica (Navigation). Sinaliza a posição do usuário na árvore de informação ("Início › Conciliação › Itaú · maio/2026"). Para navegação primária use `<Navbar>` ou `<Menu>`; Breadcrumbs é exclusivo do contexto contextual / hierárquico. Base em HTML semântico (`<nav>` + `<ol>` + `<li>` + `<a>`) com `@radix-ui/react-slot` para o pattern `asChild` em `<BreadcrumbLink>` (integração com routers). API imperativa canônica `<Breadcrumbs items={[...]} maxItems={N} />` com truncation automática + primitivas declarativas re-exportadas para composição avançada. Decisões em ADR-016.',
      },
    },
  },
  argTypes: {
    maxItems: { control: "number" },
  },
};
export default meta;

type Story = StoryObj<typeof meta>;

// ──────────────────────────────────────────────────────────────────
// Default — short trail (imperative)
// ──────────────────────────────────────────────────────────────────

export const Default: Story = {
  render: () => (
    <Breadcrumbs
      items={[
        { label: "Início", href: "/" },
        { label: "Conciliação", href: "/conciliacao" },
        { label: "Itaú · maio/2026" },
      ]}
    />
  ),
};

// ──────────────────────────────────────────────────────────────────
// WithIcon — items with leading icons
// ──────────────────────────────────────────────────────────────────

export const WithIcon: Story = {
  render: () => (
    <Breadcrumbs
      items={[
        { label: "Início", href: "/", icon: <Home className="size-3.5" /> },
        { label: "Conciliação", href: "/c" },
        { label: "Itaú · maio/2026" },
      ]}
    />
  ),
  parameters: {
    docs: {
      description: {
        story:
          "Item descriptor aceita `icon: ReactNode` opcional. O ícone herda `currentColor` e segue o token chain neutro do componente.",
      },
    },
  },
};

// ──────────────────────────────────────────────────────────────────
// Truncated — maxItems forces ellipsis
// ──────────────────────────────────────────────────────────────────

export const Truncated: Story = {
  render: () => (
    <Breadcrumbs
      items={[
        { label: "Início", href: "/" },
        { label: "Workspace", href: "/w" },
        { label: "Squad Theros", href: "/w/theros" },
        { label: "Sprint atual", href: "/w/theros/sprint" },
        { label: "Conciliação", href: "/w/theros/sprint/c" },
        { label: "Itaú · maio/2026" },
      ]}
      maxItems={3}
    />
  ),
  parameters: {
    docs: {
      description: {
        story:
          "Quando `items.length > maxItems`, mantém o **primeiro** item (raiz) + `<BreadcrumbEllipsis />` + os últimos `maxItems - 2` itens (próximos do contexto atual). Sem dropdown automático — quem precisar compõe com `<Popover>` ou `<Menu>` no consumer.",
      },
    },
  },
};

// ──────────────────────────────────────────────────────────────────
// CustomSeparator — overrides ChevronRight
// ──────────────────────────────────────────────────────────────────

export const CustomSeparator: Story = {
  render: () => (
    <Breadcrumbs
      items={[
        { label: "Início", href: "/" },
        { label: "Docs", href: "/docs" },
        { label: "Breadcrumbs" },
      ]}
      separator={<Slash className="size-3.5" />}
    />
  ),
  parameters: {
    docs: {
      description: {
        story:
          'A prop `separator` substitui o `<ChevronRight />` default. Aceita qualquer `ReactNode`. O wrapper aplica os atributos ARIA (`role="presentation"`, `aria-hidden="true"`) no `<li>` que envolve o separator.',
      },
    },
  },
};

// ──────────────────────────────────────────────────────────────────
// WithClickHandler — onClick instead of href
// ──────────────────────────────────────────────────────────────────

export const WithClickHandler: Story = {
  render: () => (
    <Breadcrumbs
      items={[
        {
          label: "Início",
          onClick: () => {
            // In a real app, dispatch a router navigation or open a panel.
          },
        },
        {
          label: "Voltar para Conciliação",
          onClick: () => {
            // ...
          },
        },
        { label: "Itaú · maio/2026" },
      ]}
    />
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Item descriptor aceita `onClick` opcional. Quando `onClick` está presente e `href` ausente, o item ainda renderiza como `<a href="#">` (HTML conformance + screen reader) com `preventDefault()` aplicado internamente.',
      },
    },
  },
};

// ──────────────────────────────────────────────────────────────────
// DeclarativeComposition — primitives for advanced cases
// ──────────────────────────────────────────────────────────────────

export const DeclarativeComposition: Story = {
  render: () => (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink href="/">Início</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbEllipsis />
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <a href="/conciliacao">Conciliação</a>
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbPage>Itaú · maio/2026</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Composição declarativa via primitivas. Use quando o consumidor precisa de markup customizado: integração com router via `asChild` em `<BreadcrumbLink>`, dropdown elision com `<Popover>` envolvendo `<BreadcrumbEllipsis />`, etc. Paridade com Toast / Dialog / Popover.',
      },
    },
  },
};

// ──────────────────────────────────────────────────────────────────
// LongTrail — full render without truncation
// ──────────────────────────────────────────────────────────────────

export const LongTrail: Story = {
  render: () => (
    <Breadcrumbs
      items={[
        { label: "Início", href: "/" },
        { label: "Workspace", href: "/w" },
        { label: "Squad Theros", href: "/w/theros" },
        { label: "Sprint 14", href: "/w/theros/sprint" },
        { label: "Conciliação", href: "/w/theros/sprint/c" },
        { label: "Itaú", href: "/w/theros/sprint/c/itau" },
        { label: "maio/2026" },
      ]}
    />
  ),
  parameters: {
    docs: {
      description: {
        story:
          "Sem `maxItems` a trilha renderiza completa. Útil para contextos com profundidade conhecida e tela ampla. Em layouts apertados, prefira `maxItems` (ver Truncated).",
      },
    },
  },
};
