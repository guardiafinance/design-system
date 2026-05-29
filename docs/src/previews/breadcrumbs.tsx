import * as React from "react";
import { Slash } from "lucide-react";

import {
  Breadcrumbs,
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
  BreadcrumbEllipsis,
} from "@ds/components/breadcrumbs";

// ──────────────────────────────────────────────────────────────────
// BasicRow — default short trail (imperative)
// ──────────────────────────────────────────────────────────────────

export function BasicRow(): React.ReactElement {
  return (
    <div className="flex flex-col gap-3 py-4">
      <Breadcrumbs
        items={[
          { label: "Início", href: "/" },
          { label: "Conciliação", href: "/conciliacao" },
          { label: "Itaú · maio/2026" },
        ]}
      />
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────
// WithIconRow — items with leading icons
// ──────────────────────────────────────────────────────────────────

export function WithIconRow(): React.ReactElement {
  return (
    <div className="flex flex-col gap-3 py-4">
      <Breadcrumbs
        items={[
          {
            label: "Início",
            href: "/",
            icon: (
              <span aria-hidden className="size-3.5 inline-flex items-center">
                ▾
              </span>
            ),
          },
          { label: "Conciliação", href: "/c" },
          { label: "Itaú · maio/2026" },
        ]}
      />
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────
// TruncatedRow — maxItems forces ellipsis
// ──────────────────────────────────────────────────────────────────

export function TruncatedRow(): React.ReactElement {
  return (
    <div className="flex flex-col gap-3 py-4">
      <Breadcrumbs
        items={[
          { label: "Início", href: "/" },
          { label: "Workspace", href: "/w" },
          { label: "Squad Theros", href: "/w/theros" },
          { label: "Sprint 14", href: "/w/theros/sprint" },
          { label: "Conciliação", href: "/w/theros/sprint/c" },
          { label: "Itaú · maio/2026" },
        ]}
        maxItems={3}
      />
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────
// CustomSeparatorRow — overrides ChevronRight with Slash
// ──────────────────────────────────────────────────────────────────

export function CustomSeparatorRow(): React.ReactElement {
  return (
    <div className="flex flex-col gap-3 py-4">
      <Breadcrumbs
        items={[
          { label: "Início", href: "/" },
          { label: "Docs", href: "/docs" },
          { label: "Breadcrumbs" },
        ]}
        separator={<Slash className="size-3.5" />}
      />
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────
// DeclarativeRow — primitives for advanced cases
// ──────────────────────────────────────────────────────────────────

export function DeclarativeRow(): React.ReactElement {
  return (
    <div className="flex flex-col gap-3 py-4">
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
    </div>
  );
}
