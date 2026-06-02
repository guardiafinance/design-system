import type { Meta, StoryObj } from "@storybook/react";
import * as React from "react";

import { TopBar } from "./index";
import { Avatar, AvatarFallback } from "../avatar";
import { Badge } from "../badge";
import { Button } from "../button";
import { IconButton } from "../icon-button";
import { Input } from "../input";

const meta: Meta<typeof TopBar> = {
  title: "Components/TopBar",
  component: TopBar,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "Barra superior da página. TopBar é uma primitiva de layout: um `<header>` semântico (landmark `banner`) com três slots (`left`, `center`, `right`) e modo `sticky` opcional. Não introduz átomos visuais novos — os slots compõem `<Logo>`, `<Avatar>`, `<IconButton>`, `<Input>`, `<Badge>`, `<Button>` ou qualquer outra primitiva do `@guardia/design-system`. Consulte `<Navbar>` para uma barra horizontal de itens com dropdowns/badges — ortogonal a TopBar.",
      },
    },
  },
  argTypes: {
    sticky: {
      control: "boolean",
      description:
        "Quando true (default), aplica `position: sticky; top: 0; z-index: 50`. Quando false, o header rola com a página.",
    },
  },
};
export default meta;

type Story = StoryObj<typeof meta>;

// ──────────────────────────────────────────────────────────────────
// Helpers — slot fixtures composed of existing DS components
// ──────────────────────────────────────────────────────────────────

function WordmarkLeft({
  context,
}: {
  context?: string;
}): React.ReactElement {
  return (
    <>
      <strong className="text-fg">Guardia</strong>
      {context ? (
        <span className="text-fg-muted text-sm ml-2">/ {context}</span>
      ) : null}
    </>
  );
}

function BreadcrumbLeft(): React.ReactElement {
  return (
    <span className="text-fg-muted text-sm">
      Empresas{" "}
      <span className="text-fg-muted mx-1.5" aria-hidden="true">
        /
      </span>{" "}
      <strong className="text-fg font-semibold">Alfa Comércio LTDA</strong>
    </span>
  );
}

function SearchCenter(): React.ReactElement {
  return (
    <Input
      type="search"
      placeholder="Buscar empresa, NF, extrato…  ⌘K"
      aria-label="Buscar"
      className="w-full"
    />
  );
}

function HeaderActions(): React.ReactElement {
  return (
    <>
      <IconButton aria-label="Notificações" variant="ghost">
        <span aria-hidden="true">🔔</span>
      </IconButton>
      <IconButton aria-label="Ajuda" variant="ghost">
        <span aria-hidden="true">?</span>
      </IconButton>
      <Avatar size="sm">
        <AvatarFallback aria-label="Luana Rocha">LR</AvatarFallback>
      </Avatar>
    </>
  );
}

function EntityActions(): React.ReactElement {
  return (
    <>
      <Button variant="ghost">Exportar</Button>
      <Button variant="secondary">Ver histórico</Button>
      <Button>+ Novo lançamento</Button>
    </>
  );
}

function PlanBadgeAndAvatar(): React.ReactElement {
  return (
    <>
      <Badge>Plano Pro</Badge>
      <Avatar size="sm">
        <AvatarFallback aria-label="Luana Rocha">LR</AvatarFallback>
      </Avatar>
    </>
  );
}

function Stub({ children }: { children?: React.ReactNode }): React.ReactElement {
  return (
    <div className="min-h-[180px] bg-surface-2 text-fg-muted text-sm flex items-center justify-center">
      {children ?? "— conteúdo da página —"}
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────
// Default — Control Center scenario (wordmark + search + actions)
// ──────────────────────────────────────────────────────────────────

export const Default: Story = {
  render: () => (
    <div className="min-h-screen bg-bg">
      <TopBar
        sticky={false}
        left={<WordmarkLeft context="Control Center" />}
        center={<SearchCenter />}
        right={<HeaderActions />}
      />
      <Stub />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "Cenário Control Center — marca + contexto à esquerda, busca global no centro, notificações + ajuda + avatar à direita. `sticky=false` neste preview para não interferir com o Storybook canvas.",
      },
    },
  },
};

// ──────────────────────────────────────────────────────────────────
// EntityPage — breadcrumb + action group, no center
// ──────────────────────────────────────────────────────────────────

export const EntityPage: Story = {
  render: () => (
    <div className="min-h-screen bg-bg">
      <TopBar
        sticky={false}
        left={<BreadcrumbLeft />}
        right={<EntityActions />}
      />
      <Stub />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "Cenário de página de entidade — breadcrumb à esquerda e ações dedicadas à direita. Sem slot `center`: o container central NÃO é renderizado e a direita ancora no trailing edge via `ml-auto`.",
      },
    },
  },
};

// ──────────────────────────────────────────────────────────────────
// Minimal — wordmark + plan badge + avatar
// ──────────────────────────────────────────────────────────────────

export const Minimal: Story = {
  render: () => (
    <div className="min-h-screen bg-bg">
      <TopBar
        sticky={false}
        left={<WordmarkLeft />}
        right={<PlanBadgeAndAvatar />}
      />
      <Stub />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "Layout mínimo — marca à esquerda, plano e avatar à direita. Ideal para landings autenticadas, onboarding e telas iniciais.",
      },
    },
  },
};

// ──────────────────────────────────────────────────────────────────
// Sticky — long scroll demo
// ──────────────────────────────────────────────────────────────────

export const Sticky: Story = {
  render: () => (
    <div className="min-h-[1600px] bg-bg">
      <TopBar
        sticky
        left={<WordmarkLeft context="Control Center" />}
        center={<SearchCenter />}
        right={<HeaderActions />}
      />
      <div className="px-5 py-6 space-y-3">
        {Array.from({ length: 24 }).map((_, idx) => (
          <Stub key={idx}>
            <span>Bloco {idx + 1} — role o canvas para ver a TopBar fixa.</span>
          </Stub>
        ))}
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "`sticky=true` (default) — o header permanece visível conforme o consumidor rola a página. Z-index 50 garante que ele fique acima do conteúdo da página.",
      },
    },
  },
};
