import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { ChevronRight, MoreHorizontal } from "lucide-react";

import { cn } from "@/lib/utils";

/**
 * Breadcrumbs — trilha de navegação hierárquica (Navigation).
 *
 * Sinaliza a posição do usuário na árvore de informação ("Home › Conciliação ›
 * Itaú · maio/2026"). Para navegação primária use `<Navbar>` / `<Menu>`;
 * Breadcrumbs é exclusivo do contexto contextual / hierárquico.
 *
 * Base: HTML semântico puro (`<nav>` + `<ol>` + `<li>` + `<a>`) com
 * `@radix-ui/react-slot` para o pattern `asChild` em `<BreadcrumbLink>`
 * (integração com routers — `<Link>` do Next/React Router). Ícones via
 * `lucide-react` (`ChevronRight` separator, `MoreHorizontal` ellipsis).
 * Decisão registrada em `docs/adr/ADR-016-breadcrumbs-v0.1.0-dod-migration.md`.
 *
 * Esta wrapper adiciona:
 *   - API imperativa canônica `<Breadcrumbs items={[...]} maxItems={N} />`
 *     com truncation automática — paridade com a referência legada em
 *     `ux_references/ui_kits/components/Breadcrumbs/`.
 *   - Primitivas declarativas re-exportadas para composição avançada
 *     (router integration via `asChild`, dropdown elision via consumer).
 *   - Token contract neutro (`text-muted-foreground` / `text-foreground` /
 *     `hover:text-foreground`) — sem severidade.
 *   - ARIA WAI-ARIA APG: `<nav aria-label="breadcrumb">` + `<ol>` + último
 *     item com `aria-current="page"`; separator + ellipsis `aria-hidden`.
 *
 * Public surface (8 componentes + 2 types):
 *   Breadcrumbs (imperativa),
 *   Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink,
 *   BreadcrumbPage, BreadcrumbSeparator, BreadcrumbEllipsis,
 *   BreadcrumbsProps, BreadcrumbsItem
 */

// ──────────────────────────────────────────────────────────────────
// Declarative primitives
// ──────────────────────────────────────────────────────────────────

const Breadcrumb = React.forwardRef<
  HTMLElement,
  React.ComponentPropsWithoutRef<"nav"> & {
    separator?: React.ReactNode;
  }
>(({ "aria-label": ariaLabel = "breadcrumb", ...props }, ref) => (
  <nav ref={ref} aria-label={ariaLabel} {...props} />
));
Breadcrumb.displayName = "Breadcrumb";

const BreadcrumbList = React.forwardRef<
  HTMLOListElement,
  React.ComponentPropsWithoutRef<"ol">
>(({ className, ...props }, ref) => (
  <ol
    ref={ref}
    className={cn(
      "flex flex-wrap items-center gap-1.5 break-words text-sm text-muted-foreground sm:gap-2.5",
      className,
    )}
    {...props}
  />
));
BreadcrumbList.displayName = "BreadcrumbList";

const BreadcrumbItem = React.forwardRef<
  HTMLLIElement,
  React.ComponentPropsWithoutRef<"li">
>(({ className, ...props }, ref) => (
  <li
    ref={ref}
    className={cn("inline-flex items-center gap-1.5", className)}
    {...props}
  />
));
BreadcrumbItem.displayName = "BreadcrumbItem";

const BreadcrumbLink = React.forwardRef<
  HTMLAnchorElement,
  React.ComponentPropsWithoutRef<"a"> & {
    asChild?: boolean;
  }
>(({ asChild, className, ...props }, ref) => {
  const Comp = asChild ? Slot : "a";

  return (
    <Comp
      ref={ref}
      className={cn(
        "transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 rounded-sm",
        className,
      )}
      {...props}
    />
  );
});
BreadcrumbLink.displayName = "BreadcrumbLink";

const BreadcrumbPage = React.forwardRef<
  HTMLSpanElement,
  React.ComponentPropsWithoutRef<"span">
>(({ className, ...props }, ref) => (
  <span
    ref={ref}
    role="link"
    aria-disabled="true"
    aria-current="page"
    className={cn("font-normal text-foreground", className)}
    {...props}
  />
));
BreadcrumbPage.displayName = "BreadcrumbPage";

const BreadcrumbSeparator = ({
  children,
  className,
  ...props
}: React.ComponentProps<"li">): React.ReactElement => (
  <li
    role="presentation"
    aria-hidden="true"
    className={cn("[&>svg]:size-3.5", className)}
    {...props}
  >
    {children ?? <ChevronRight />}
  </li>
);
BreadcrumbSeparator.displayName = "BreadcrumbSeparator";

const BreadcrumbEllipsis = ({
  className,
  ...props
}: React.ComponentProps<"span">): React.ReactElement => (
  <span
    role="presentation"
    aria-hidden="true"
    className={cn("flex size-9 items-center justify-center", className)}
    {...props}
  >
    <MoreHorizontal className="size-4" />
    <span className="sr-only">More</span>
  </span>
);
BreadcrumbEllipsis.displayName = "BreadcrumbEllipsis";

// ──────────────────────────────────────────────────────────────────
// Imperative API
// ──────────────────────────────────────────────────────────────────

/**
 * Item descriptor consumed by the imperative `<Breadcrumbs items={...} />`.
 *
 * - `label` — required, ReactNode rendered as the visible content.
 * - `href` — optional, when present the item renders as a link.
 * - `onClick` — optional, fires on click. When `onClick` is present and
 *   `href` is absent, the item still renders as an `<a href="#">` so HTML
 *   conformance + screen readers treat it as a link; the wrapper applies
 *   `preventDefault()` so the page does not navigate.
 * - `icon` — optional, ReactNode rendered before the label (Lucide icons
 *   render via `currentColor` — they inherit the token chain naturally).
 */
export interface BreadcrumbsItem {
  label: React.ReactNode;
  href?: string;
  onClick?: () => void;
  icon?: React.ReactNode;
}

export interface BreadcrumbsProps
  extends Omit<React.ComponentPropsWithoutRef<"nav">, "children"> {
  /** Ordered list of items in the trail. Last item renders as the current page. */
  items: ReadonlyArray<BreadcrumbsItem>;
  /**
   * Maximum number of visible items before truncation kicks in. When omitted,
   * all items render. When `items.length > maxItems`, the wrapper renders
   * `items[0]` + `<BreadcrumbEllipsis />` + the last `maxItems - 2` items.
   * `maxItems < 2` is treated as "no truncation" — ellipsis without one
   * leading and one trailing item would lose information.
   */
  maxItems?: number;
  /** Custom separator. Defaults to `<ChevronRight />`. */
  separator?: React.ReactNode;
}

/**
 * Truncates the items array using the WAI-ARIA APG breadcrumb pattern:
 * - keep `items[0]` (root)
 * - insert ellipsis marker
 * - keep the last `maxItems - 1` items (closest to the current context)
 *
 * `maxItems` counts the **visible item slots** (the ellipsis is not counted).
 * E.g. with `maxItems=3`, the output renders 3 items + 1 ellipsis = 4 visual
 * nodes (root + … + 2 tail items).
 *
 * Returns the original array when truncation is not needed or would be
 * degenerate (`maxItems < 2` — would discard either the root or all tail).
 */
function truncateItems(
  items: ReadonlyArray<BreadcrumbsItem>,
  maxItems: number | undefined,
): Array<BreadcrumbsItem | { __ellipsis: true }> {
  if (
    maxItems === undefined ||
    maxItems < 2 ||
    items.length <= maxItems
  ) {
    return [...items];
  }
  const head = items[0]!;
  const tailCount = maxItems - 1;
  const tail = items.slice(items.length - tailCount);
  return [head, { __ellipsis: true }, ...tail];
}

function isEllipsis(
  node: BreadcrumbsItem | { __ellipsis: true },
): node is { __ellipsis: true } {
  return (node as { __ellipsis?: boolean }).__ellipsis === true;
}

const Breadcrumbs = React.forwardRef<HTMLElement, BreadcrumbsProps>(
  (
    {
      items,
      maxItems,
      separator,
      "aria-label": ariaLabel = "breadcrumb",
      className,
      ...rest
    },
    ref,
  ) => {
    const visible = truncateItems(items, maxItems);
    const lastIndex = visible.length - 1;

    return (
      <Breadcrumb
        ref={ref}
        aria-label={ariaLabel}
        className={className}
        {...rest}
      >
        <BreadcrumbList>
          {visible.map((node, index) => {
            const isLast = index === lastIndex;
            const sepKey = `sep-${index}`;
            const itemKey = `item-${index}`;

            if (isEllipsis(node)) {
              return (
                <React.Fragment key={itemKey}>
                  <BreadcrumbItem>
                    <BreadcrumbEllipsis />
                  </BreadcrumbItem>
                  {!isLast ? (
                    <BreadcrumbSeparator key={sepKey}>
                      {separator}
                    </BreadcrumbSeparator>
                  ) : null}
                </React.Fragment>
              );
            }

            const { label, href, onClick, icon } = node;
            const content = (
              <>
                {icon}
                <span>{label}</span>
              </>
            );

            // Last item is the current page — no link, no handler.
            if (isLast) {
              return (
                <BreadcrumbItem key={itemKey}>
                  <BreadcrumbPage>{content}</BreadcrumbPage>
                </BreadcrumbItem>
              );
            }

            // Intermediate item: render as link when href or onClick exists;
            // plain text (BreadcrumbPage-like neutral) when neither is given.
            const hasInteraction = href !== undefined || onClick !== undefined;

            return (
              <React.Fragment key={itemKey}>
                <BreadcrumbItem>
                  {hasInteraction ? (
                    <BreadcrumbLink
                      href={href ?? "#"}
                      onClick={
                        onClick
                          ? (event) => {
                              if (href === undefined) {
                                event.preventDefault();
                              }
                              onClick();
                            }
                          : undefined
                      }
                      className="inline-flex items-center gap-1"
                    >
                      {content}
                    </BreadcrumbLink>
                  ) : (
                    <span className="inline-flex items-center gap-1">
                      {content}
                    </span>
                  )}
                </BreadcrumbItem>
                <BreadcrumbSeparator key={sepKey}>
                  {separator}
                </BreadcrumbSeparator>
              </React.Fragment>
            );
          })}
        </BreadcrumbList>
      </Breadcrumb>
    );
  },
);
Breadcrumbs.displayName = "Breadcrumbs";

// ──────────────────────────────────────────────────────────────────
// Exports
// ──────────────────────────────────────────────────────────────────

export {
  Breadcrumbs,
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
  BreadcrumbEllipsis,
};
