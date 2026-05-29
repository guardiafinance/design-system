import * as React from "react";

import { TopBar } from "@ds/components/top-bar";
import { Avatar, AvatarFallback } from "@ds/components/avatar";
import { Badge } from "@ds/components/badge";
import { Button } from "@ds/components/button";
import { IconButton } from "@ds/components/icon-button";
import { Input } from "@ds/components/input";

// ──────────────────────────────────────────────────────────────────
// Slot fixtures — composed from existing DS components only
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
        <span className="text-fg/60 text-sm ml-2">/ {context}</span>
      ) : null}
    </>
  );
}

function BreadcrumbLeft(): React.ReactElement {
  return (
    <span className="text-fg/60 text-sm">
      Empresas{" "}
      <span className="text-fg/30 mx-1.5" aria-hidden="true">
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

function Stub({
  children,
}: {
  children?: React.ReactNode;
}): React.ReactElement {
  return (
    <div className="min-h-[140px] bg-surface-2 text-fg/40 text-xs flex items-center justify-center">
      {children ?? "— conteúdo da página —"}
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────
// BasicRow — Control Center scenario (wordmark + search + actions)
// ──────────────────────────────────────────────────────────────────

export function BasicRow(): React.ReactElement {
  return (
    <div className="overflow-hidden rounded-md border border-border bg-bg">
      <TopBar
        sticky={false}
        left={<WordmarkLeft context="Control Center" />}
        center={<SearchCenter />}
        right={<HeaderActions />}
      />
      <Stub />
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────
// EntityRow — breadcrumb + action group, no center slot
// ──────────────────────────────────────────────────────────────────

export function EntityRow(): React.ReactElement {
  return (
    <div className="overflow-hidden rounded-md border border-border bg-bg">
      <TopBar
        sticky={false}
        left={<BreadcrumbLeft />}
        right={<EntityActions />}
      />
      <Stub />
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────
// MinimalRow — wordmark + plan badge + avatar
// ──────────────────────────────────────────────────────────────────

export function MinimalRow(): React.ReactElement {
  return (
    <div className="overflow-hidden rounded-md border border-border bg-bg">
      <TopBar
        sticky={false}
        left={<WordmarkLeft />}
        right={<PlanBadgeAndAvatar />}
      />
      <Stub />
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────
// StickyRow — long scroll demo inside a constrained container
// ──────────────────────────────────────────────────────────────────

export function StickyRow(): React.ReactElement {
  return (
    <div className="overflow-hidden rounded-md border border-border bg-bg">
      <div className="max-h-[360px] overflow-y-auto">
        <TopBar
          sticky
          left={<WordmarkLeft context="Control Center" />}
          right={<HeaderActions />}
        />
        <div className="px-5 py-4 space-y-3">
          {Array.from({ length: 8 }).map((_, idx) => (
            <Stub key={idx}>
              <span>
                Bloco {idx + 1} — role para ver a TopBar fixar no topo.
              </span>
            </Stub>
          ))}
        </div>
      </div>
    </div>
  );
}
