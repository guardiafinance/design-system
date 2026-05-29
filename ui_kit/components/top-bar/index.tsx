"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

/**
 * TopBar — barra superior. Layout shell composável com três slots
 * (`left`, `center`, `right`) e modo sticky opcional. Use TopBar como
 * cabeçalho de página: marca/breadcrumb à esquerda, busca/contexto no
 * centro, ações/avatar à direita.
 *
 * TopBar é uma primitiva de **layout** — não introduz átomos visuais
 * novos. Os slots aceitam qualquer `ReactNode` e tipicamente recebem
 * `<Logo>`, `<Avatar>`, `<IconButton>`, `<Input>`, `<Badge>` ou
 * `<Button>` do próprio design system. O componente fornece apenas o
 * shell semântico (`<header>` com landmark `banner` implícito),
 * espaçamento, surface, border e comportamento sticky.
 *
 * Decisões registradas em
 * `docs/adr/ADR-021-top-bar-v0.1.0-dod-migration.md`.
 *
 * Public surface (1 componente + 1 CVA accessor + 2 tipos):
 *   TopBar (default + named), topBarVariants
 *   TopBarProps, TopBarSticky
 *
 * Para uma barra horizontal de navegação por itens (com badges, ações
 * dinâmicas, dropdowns), use `<Navbar>` — ortogonal a TopBar.
 * `<Navbar>` pode ser passado para `center` se o consumidor quiser um
 * cabeçalho nav-driven.
 */

// ──────────────────────────────────────────────────────────────────
// CVA variants — single `sticky` variant; layout/surface hardcoded
// ──────────────────────────────────────────────────────────────────

const topBarVariants = cva(
  [
    // Layout — flex row: left | center? | right (3 slots)
    "flex items-center gap-4",
    "h-14 px-5",
    // Surface — semantic tokens only (no hex, no oklch, no raw utility)
    "bg-surface text-fg",
    "border-b border-border",
    // Typography — Poppins via --font-sans token chain
    "font-sans",
  ].join(" "),
  {
    variants: {
      sticky: {
        true: "sticky top-0 z-50",
        false: "",
      },
    },
    defaultVariants: { sticky: true },
  },
);

export type TopBarSticky = NonNullable<
  VariantProps<typeof topBarVariants>["sticky"]
>;

// ──────────────────────────────────────────────────────────────────
// Component
// ──────────────────────────────────────────────────────────────────

export interface TopBarProps
  extends Omit<React.HTMLAttributes<HTMLElement>, "children">,
    VariantProps<typeof topBarVariants> {
  /**
   * Leading slot — typically branding (Logo, wordmark) or breadcrumb.
   */
  left?: React.ReactNode;
  /**
   * Optional center slot — typically a global search input. When
   * omitted the center container is NOT rendered (DOM has only the
   * left and right containers, and `right` anchors to the trailing
   * edge via `ml-auto`).
   */
  center?: React.ReactNode;
  /**
   * Trailing slot — typically header actions (IconButton bell/help)
   * and the user avatar. Always rendered (even when undefined) so the
   * layout grid stays consistent across instances.
   */
  right?: React.ReactNode;
}

const TopBar = React.forwardRef<HTMLElement, TopBarProps>(
  ({ className, sticky, left, center, right, ...props }, ref) => (
    <header
      ref={ref}
      className={cn(topBarVariants({ sticky }), className)}
      {...props}
    >
      <div className="flex items-center gap-2.5 shrink-0">{left}</div>
      {center ? (
        <div className="flex flex-1 justify-center max-w-[560px] mx-auto">
          {center}
        </div>
      ) : null}
      <div className="flex items-center gap-2.5 shrink-0 ml-auto">
        {right}
      </div>
    </header>
  ),
);
TopBar.displayName = "TopBar";

// ──────────────────────────────────────────────────────────────────
// Exports
// ──────────────────────────────────────────────────────────────────

export { TopBar, topBarVariants };
export default TopBar;
