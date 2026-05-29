import * as React from "react";
import {
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";

import { cn } from "../../lib/utils";
import { type ButtonProps, buttonVariants } from "../button";

/**
 * Pagination — navegação numérica composta para listas paginadas.
 *
 * Composição shadcn-style multi-parte alinhada com Breadcrumb,
 * NavigationMenu e Menu (ADR-006). O consumidor monta o range,
 * decide quando exibir reticências, quando ativar edges (First/Last)
 * e qual página marcar como ativa. As primitivas resolvem:
 *
 *   - Landmark semântico (`<nav role="navigation" aria-label>`).
 *   - Estado ativo (`aria-current="page"`) e desabilitado (`aria-disabled`).
 *   - Operação por teclado (Enter / Space) quando o link atua como
 *     botão (sem `href`).
 *   - Token contract via `buttonVariants` (zero hardcoded color).
 *   - Labels pt-BR explícitos nos botões prev / next / first / last
 *     mesmo na presença de texto visível, garantindo anúncio correto
 *     em screen reader.
 *   - Ellipsis com `aria-hidden` no decorativo + texto visualmente
 *     escondido ("Mais páginas") como sibling para SR.
 *
 * Decisões registradas em
 * `docs/adr/ADR-018-pagination-v0.1.0-dod-migration.md`.
 *
 * Public surface (9 componentes):
 *   Pagination, PaginationContent, PaginationItem, PaginationLink,
 *   PaginationPrevious, PaginationNext, PaginationFirst,
 *   PaginationLast, PaginationEllipsis
 */

// ──────────────────────────────────────────────────────────────────
// Pagination — landmark <nav>
// ──────────────────────────────────────────────────────────────────

const Pagination = ({ className, ...props }: React.ComponentProps<"nav">) => (
  <nav
    role="navigation"
    aria-label="pagination"
    className={cn("mx-auto flex w-full", className)}
    {...props}
  />
);
Pagination.displayName = "Pagination";

// ──────────────────────────────────────────────────────────────────
// PaginationContent — <ul> container
// ──────────────────────────────────────────────────────────────────

const PaginationContent = React.forwardRef<
  HTMLUListElement,
  React.ComponentProps<"ul">
>(({ className, ...props }, ref) => (
  <ul ref={ref} className={cn("flex flex-row gap-2", className)} {...props} />
));
PaginationContent.displayName = "PaginationContent";

// ──────────────────────────────────────────────────────────────────
// PaginationItem — <li> slot
// ──────────────────────────────────────────────────────────────────

const PaginationItem = React.forwardRef<
  HTMLLIElement,
  React.ComponentProps<"li">
>(({ className, ...props }, ref) => (
  <li ref={ref} className={cn("", className)} {...props} />
));
PaginationItem.displayName = "PaginationItem";

// ──────────────────────────────────────────────────────────────────
// PaginationLink — <a> ou <button> via role; central a11y wiring
// ──────────────────────────────────────────────────────────────────

type PaginationLinkProps = {
  isActive?: boolean;
  disabled?: boolean;
} & Pick<ButtonProps, "size"> &
  React.ComponentProps<"a">;

const PaginationLink = ({
  className,
  isActive,
  disabled = false,
  size = "default",
  children,
  onClick,
  onKeyDown,
  href,
  ...props
}: PaginationLinkProps) => (
  <a
    aria-current={isActive ? "page" : undefined}
    aria-disabled={disabled ? "true" : undefined}
    href={href}
    // Sem href, o <a> não é interativo nativamente — sobe role="button"
    // e tabIndex para participar da navegação por teclado. Com href, o
    // browser cuida.
    role={!href ? "button" : undefined}
    tabIndex={disabled ? -1 : 0}
    className={cn(
      buttonVariants({
        variant: isActive ? "outline" : "ghost",
        size,
      }),
      "min-w-10",
      disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer",
      className,
    )}
    onClick={(e) => {
      if (disabled) {
        e.preventDefault();
        return;
      }
      onClick?.(e);
    }}
    onKeyDown={(e) => {
      // Quando o link atua como botão (sem href), Enter/Space dispara
      // onClick — paridade com <button> nativo.
      if ((e.key === "Enter" || e.key === " ") && !disabled && !href && onClick) {
        e.preventDefault();
        onClick(e as unknown as React.MouseEvent<HTMLAnchorElement>);
      }
      onKeyDown?.(e);
    }}
    {...props}
  >
    {children}
  </a>
);
PaginationLink.displayName = "PaginationLink";

// ──────────────────────────────────────────────────────────────────
// PaginationPrevious / Next / First / Last — chevrons + label
// pt-BR. `aria-label` explícito ratifica o anúncio em SR mesmo com
// texto visível interno.
// ──────────────────────────────────────────────────────────────────

const PaginationPrevious = ({
  className,
  ...props
}: React.ComponentProps<typeof PaginationLink>) => (
  <PaginationLink
    aria-label="Página anterior"
    className={cn("gap-1 px-2.5", className)}
    {...props}
  >
    <ChevronLeft className="h-4 w-4" aria-hidden="true" />
    <span>Anterior</span>
  </PaginationLink>
);
PaginationPrevious.displayName = "PaginationPrevious";

const PaginationNext = ({
  className,
  ...props
}: React.ComponentProps<typeof PaginationLink>) => (
  <PaginationLink
    aria-label="Próxima página"
    className={cn("gap-1 px-2.5", className)}
    {...props}
  >
    <span>Próxima</span>
    <ChevronRight className="h-4 w-4" aria-hidden="true" />
  </PaginationLink>
);
PaginationNext.displayName = "PaginationNext";

const PaginationFirst = ({
  className,
  ...props
}: React.ComponentProps<typeof PaginationLink>) => (
  <PaginationLink
    aria-label="Primeira página"
    className={cn("gap-1 px-2.5", className)}
    {...props}
  >
    <ChevronsLeft className="h-4 w-4" aria-hidden="true" />
    <span>Início</span>
  </PaginationLink>
);
PaginationFirst.displayName = "PaginationFirst";

const PaginationLast = ({
  className,
  ...props
}: React.ComponentProps<typeof PaginationLink>) => (
  <PaginationLink
    aria-label="Última página"
    className={cn("gap-1 px-2.5", className)}
    {...props}
  >
    <span>Final</span>
    <ChevronsRight className="h-4 w-4" aria-hidden="true" />
  </PaginationLink>
);
PaginationLast.displayName = "PaginationLast";

// ──────────────────────────────────────────────────────────────────
// PaginationEllipsis — decorativo + sr-only sibling
// ──────────────────────────────────────────────────────────────────

const PaginationEllipsis = ({
  className,
  ...props
}: React.ComponentProps<"span">) => (
  <span
    aria-hidden="true"
    className={cn("flex h-9 w-9 items-center justify-center", className)}
    {...props}
  >
    <MoreHorizontal className="h-4 w-4" />
    <span className="sr-only">Mais páginas</span>
  </span>
);
PaginationEllipsis.displayName = "PaginationEllipsis";

export {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationFirst,
  PaginationLast,
};
