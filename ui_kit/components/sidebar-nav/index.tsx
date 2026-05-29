"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { ChevronDown } from "lucide-react";

import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/tooltip";

/**
 * SidebarNav — navegação lateral vertical com seções, grupos
 * colapsáveis, item ativo e modo `collapsed` (só ícones).
 *
 * Distinto de:
 *   - `<Sidebar>` (composite shell shadcn — `<SidebarProvider>`,
 *     persistência via cookie, Drawer mobile): SidebarNav é a árvore
 *     de navegação consumida dentro de qualquer chrome.
 *   - `<Navbar>` (navegação horizontal top-bar): escopo distinto.
 *   - `<NavigationMenu>` (Radix menubar com flyout): orientado a
 *     menubar; não casa com nav lateral persistente.
 *
 * API canônica (decisões em ADR-019):
 *   - Sem Radix base — composição interna com `aria-expanded` /
 *     `aria-controls` manuais (ConfidenceIndicator-style).
 *   - Named exports (não dot-notation com `any` cast).
 *   - Group controlled (`open` + `onOpenChange`) **OU** uncontrolled
 *     (`defaultOpen`) — paridade com `<Collapsible>` / `<Drawer>`.
 *   - Modo `collapsed`: item interativo wrappeado em `<Tooltip>` do
 *     DS + `<span className="sr-only">` para defesa em profundidade.
 *   - Coexiste com `<Sidebar>` shell — não substitui, não importa.
 *
 * Public surface (6 componentes + 2 CVA accessors + 4 types):
 *   SidebarNav, SidebarNavSection, SidebarNavItem,
 *   SidebarNavGroup, SidebarNavGroupTrigger, SidebarNavGroupContent
 *   sidebarNavVariants, sidebarNavItemVariants
 *   SidebarNavProps, SidebarNavSectionProps,
 *   SidebarNavItemProps, SidebarNavGroupProps
 */

// ──────────────────────────────────────────────────────────────────
// Context — propagates `collapsed` to descendant items/groups
// ──────────────────────────────────────────────────────────────────

interface SidebarNavContextValue {
  collapsed: boolean;
}

const SidebarNavContext = React.createContext<SidebarNavContextValue>({
  collapsed: false,
});

function useSidebarNavContext(): SidebarNavContextValue {
  return React.useContext(SidebarNavContext);
}

// ──────────────────────────────────────────────────────────────────
// CVA — root container
// ──────────────────────────────────────────────────────────────────

const sidebarNavVariants = cva(
  [
    "flex h-full flex-col gap-3",
    "border-r border-sidebar-border bg-sidebar text-sidebar-foreground",
    "p-3",
    "transition-[width] duration-200 ease-out motion-reduce:transition-none",
  ].join(" "),
  {
    variants: {
      collapsed: {
        true: "w-14 items-stretch px-1.5",
        false: "w-60",
      },
    },
    defaultVariants: { collapsed: false },
  },
);

export type SidebarNavCollapsedVariant = NonNullable<
  VariantProps<typeof sidebarNavVariants>["collapsed"]
>;

// ──────────────────────────────────────────────────────────────────
// CVA — item (button / anchor)
// ──────────────────────────────────────────────────────────────────

const sidebarNavItemVariants = cva(
  [
    "group/item flex w-full items-center gap-2.5 rounded-md px-2.5 py-2",
    "text-left text-sm font-medium leading-none",
    "transition-colors",
    "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1",
    "disabled:cursor-not-allowed disabled:opacity-50",
    "aria-disabled:cursor-not-allowed aria-disabled:opacity-50",
    "no-underline",
  ].join(" "),
  {
    variants: {
      active: {
        true: "bg-sidebar-accent text-sidebar-accent-foreground font-semibold",
        false: "",
      },
    },
    defaultVariants: { active: false },
  },
);

// ──────────────────────────────────────────────────────────────────
// SidebarNav — root
// ──────────────────────────────────────────────────────────────────

export interface SidebarNavProps
  extends Omit<React.HTMLAttributes<HTMLElement>, "children"> {
  collapsed?: boolean;
  children: React.ReactNode;
}

const SidebarNav = React.forwardRef<HTMLElement, SidebarNavProps>(
  (
    {
      collapsed = false,
      className,
      children,
      "aria-label": ariaLabel = "Navegação principal",
      ...rest
    },
    ref,
  ) => {
    const ctx = React.useMemo<SidebarNavContextValue>(
      () => ({ collapsed }),
      [collapsed],
    );
    return (
      <SidebarNavContext.Provider value={ctx}>
        <nav
          ref={ref}
          aria-label={ariaLabel}
          data-collapsed={collapsed ? "true" : "false"}
          className={cn(sidebarNavVariants({ collapsed }), className)}
          {...rest}
        >
          {children}
        </nav>
      </SidebarNavContext.Provider>
    );
  },
);
SidebarNav.displayName = "SidebarNav";

// ──────────────────────────────────────────────────────────────────
// SidebarNavSection
// ──────────────────────────────────────────────────────────────────

export interface SidebarNavSectionProps {
  label?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
}

const SidebarNavSection = React.forwardRef<
  HTMLDivElement,
  SidebarNavSectionProps
>(({ label, className, children }, ref) => {
  const { collapsed } = useSidebarNavContext();
  const showLabel = label != null && !collapsed;
  const showDivider = label != null && collapsed;
  const sectionLabel = typeof label === "string" ? label : undefined;
  return (
    <section
      ref={ref}
      aria-label={sectionLabel}
      className={cn("flex flex-col gap-0.5", className)}
    >
      {showLabel ? (
        <div
          role="presentation"
          className={cn(
            "px-2.5 pt-1 pb-1.5",
            "text-[10.5px] font-bold uppercase tracking-[0.06em]",
            "text-muted-foreground",
          )}
        >
          {label}
        </div>
      ) : null}
      {showDivider ? (
        <hr
          aria-hidden="true"
          className="my-1.5 mx-1 h-px border-0 bg-sidebar-border"
        />
      ) : null}
      <div className="flex flex-col gap-px">{children}</div>
    </section>
  );
});
SidebarNavSection.displayName = "SidebarNavSection";

// ──────────────────────────────────────────────────────────────────
// SidebarNavItem
// ──────────────────────────────────────────────────────────────────

export interface SidebarNavItemProps {
  icon?: React.ReactNode;
  badge?: React.ReactNode;
  active?: boolean;
  disabled?: boolean;
  href?: string;
  onClick?: React.MouseEventHandler<HTMLButtonElement | HTMLAnchorElement>;
  /**
   * Texto usado para Tooltip em modo `collapsed` e como `aria-label`
   * fallback. Obrigatório quando `children` não é string e o
   * componente é usado em modo collapsed; quando ausente, o
   * componente cai para `aria-label` derivado de `children`.
   */
  label?: string;
  className?: string;
  children: React.ReactNode;
}

const SidebarNavItem = React.forwardRef<
  HTMLButtonElement | HTMLAnchorElement,
  SidebarNavItemProps
>(
  (
    {
      icon,
      badge,
      active = false,
      disabled = false,
      href,
      onClick,
      label,
      className,
      children,
    },
    ref,
  ) => {
    const { collapsed } = useSidebarNavContext();
    const resolvedLabel =
      label ?? (typeof children === "string" ? children : undefined);

    const itemClass = cn(
      sidebarNavItemVariants({ active }),
      collapsed && "justify-center px-0 py-2.5",
      className,
    );

    const iconNode =
      icon != null ? (
        <span
          aria-hidden="true"
          className={cn(
            "inline-flex shrink-0 items-center justify-center",
            "text-muted-foreground",
            "group-hover/item:text-sidebar-accent-foreground",
            active && "text-sidebar-primary",
            "[&_svg]:size-4",
          )}
        >
          {icon}
        </span>
      ) : null;

    const labelNode = (
      <span
        className={cn(
          "min-w-0 flex-1 truncate",
          collapsed && "sr-only",
        )}
      >
        {children}
      </span>
    );

    const badgeNode =
      badge != null && !collapsed ? (
        <span
          className={cn(
            "ml-auto inline-flex min-w-[1.25rem] shrink-0 items-center justify-center",
            "rounded-full bg-sidebar-accent px-1.5 py-px",
            "text-[10.5px] font-bold text-sidebar-accent-foreground",
          )}
        >
          {badge}
        </span>
      ) : null;

    const inner = (
      <>
        {iconNode}
        {labelNode}
        {badgeNode}
      </>
    );

    const commonAriaCurrent = active ? { "aria-current": "page" as const } : {};

    let interactive: React.ReactElement;
    if (href) {
      // WHY: keep `href` even when disabled so the element remains a real
      // link (Testing Library queries by `role="link"` require an href on
      // the anchor). The interaction is blocked via aria-disabled,
      // tabIndex=-1, pointer-events-none, and a preventDefault handler.
      interactive = (
        <a
          ref={ref as React.Ref<HTMLAnchorElement>}
          href={href}
          aria-disabled={disabled || undefined}
          tabIndex={disabled ? -1 : undefined}
          onClick={
            disabled
              ? (event: React.MouseEvent<HTMLAnchorElement>) =>
                  event.preventDefault()
              : (onClick as React.MouseEventHandler<HTMLAnchorElement>)
          }
          className={cn(itemClass, disabled && "pointer-events-none")}
          {...commonAriaCurrent}
        >
          {inner}
        </a>
      );
    } else {
      interactive = (
        <button
          ref={ref as React.Ref<HTMLButtonElement>}
          type="button"
          disabled={disabled}
          onClick={onClick as React.MouseEventHandler<HTMLButtonElement>}
          className={itemClass}
          aria-label={collapsed && resolvedLabel ? resolvedLabel : undefined}
          {...commonAriaCurrent}
        >
          {inner}
        </button>
      );
    }

    if (collapsed && resolvedLabel) {
      return (
        <Tooltip>
          <TooltipTrigger asChild>{interactive}</TooltipTrigger>
          <TooltipContent side="right" sideOffset={8}>
            {resolvedLabel}
          </TooltipContent>
        </Tooltip>
      );
    }

    return interactive;
  },
);
SidebarNavItem.displayName = "SidebarNavItem";

// ──────────────────────────────────────────────────────────────────
// useControllableState — internal hook for Group open state
// ──────────────────────────────────────────────────────────────────

function useControllableOpen({
  value,
  defaultValue,
  onChange,
}: {
  value?: boolean;
  defaultValue: boolean;
  onChange?: (open: boolean) => void;
}): [boolean, (next: boolean) => void] {
  const isControlled = value !== undefined;
  const [internal, setInternal] = React.useState(defaultValue);
  const current = isControlled ? value : internal;
  const setValue = React.useCallback(
    (next: boolean) => {
      if (!isControlled) setInternal(next);
      onChange?.(next);
    },
    [isControlled, onChange],
  );
  return [current, setValue];
}

// ──────────────────────────────────────────────────────────────────
// SidebarNavGroup
// ──────────────────────────────────────────────────────────────────

interface SidebarNavGroupContextValue {
  open: boolean;
  toggle: () => void;
  contentId: string;
  triggerId: string;
  label: React.ReactNode;
  icon?: React.ReactNode;
}

const SidebarNavGroupContext =
  React.createContext<SidebarNavGroupContextValue | null>(null);

function useSidebarNavGroupContext(): SidebarNavGroupContextValue {
  const ctx = React.useContext(SidebarNavGroupContext);
  if (!ctx) {
    throw new Error(
      "SidebarNavGroupTrigger and SidebarNavGroupContent must be used inside <SidebarNavGroup>.",
    );
  }
  return ctx;
}

export interface SidebarNavGroupProps {
  label: React.ReactNode;
  icon?: React.ReactNode;
  defaultOpen?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  className?: string;
  children: React.ReactNode;
}

const SidebarNavGroup = React.forwardRef<HTMLDivElement, SidebarNavGroupProps>(
  (
    {
      label,
      icon,
      defaultOpen = true,
      open: openProp,
      onOpenChange,
      className,
      children,
    },
    ref,
  ) => {
    const { collapsed } = useSidebarNavContext();
    const [open, setOpen] = useControllableOpen({
      value: openProp,
      defaultValue: defaultOpen,
      onChange: onOpenChange,
    });
    const reactId = React.useId();
    const contentId = `sidebar-nav-group-content-${reactId}`;
    const triggerId = `sidebar-nav-group-trigger-${reactId}`;

    const groupCtx = React.useMemo<SidebarNavGroupContextValue>(
      () => ({
        open,
        toggle: () => setOpen(!open),
        contentId,
        triggerId,
        label,
        icon,
      }),
      [open, setOpen, contentId, triggerId, label, icon],
    );

    // Em modo collapsed, a referência legada renderiza os filhos do
    // Group inline — sem trigger, sem chevron, sem header. Mantemos
    // paridade.
    if (collapsed) {
      return (
        <div
          ref={ref}
          data-collapsed-group="true"
          className={cn("contents", className)}
        >
          {React.Children.map(children, (child) => {
            // Filtra o GroupContent — em collapsed, renderizamos seu
            // conteúdo diretamente; o trigger é silenciosamente
            // ignorado.
            if (React.isValidElement(child)) {
              const childType = (child as React.ReactElement).type as
                | { displayName?: string }
                | undefined;
              if (childType?.displayName === "SidebarNavGroupTrigger") {
                return null;
              }
              if (childType?.displayName === "SidebarNavGroupContent") {
                return (child as React.ReactElement<{
                  children?: React.ReactNode;
                }>).props.children;
              }
            }
            return child;
          })}
        </div>
      );
    }

    return (
      <SidebarNavGroupContext.Provider value={groupCtx}>
        <div
          ref={ref}
          data-state={open ? "open" : "closed"}
          className={cn("flex flex-col", className)}
        >
          {children}
        </div>
      </SidebarNavGroupContext.Provider>
    );
  },
);
SidebarNavGroup.displayName = "SidebarNavGroup";

// ──────────────────────────────────────────────────────────────────
// SidebarNavGroupTrigger
// ──────────────────────────────────────────────────────────────────

export interface SidebarNavGroupTriggerProps {
  className?: string;
  /**
   * Por default, o trigger renderiza `icon + label + chevron`
   * derivados do contexto do Group. Para customização total, passe
   * `children` — o trigger só fornece o `<button>` com a11y wiring.
   */
  children?: React.ReactNode;
}

const SidebarNavGroupTrigger = React.forwardRef<
  HTMLButtonElement,
  SidebarNavGroupTriggerProps
>(({ className, children }, ref) => {
  const { open, toggle, contentId, triggerId, label, icon } =
    useSidebarNavGroupContext();
  const content = children ?? (
    <>
      {icon != null ? (
        <span
          aria-hidden="true"
          className={cn(
            "inline-flex shrink-0 items-center justify-center text-muted-foreground",
            "[&_svg]:size-4",
          )}
        >
          {icon}
        </span>
      ) : null}
      <span className="min-w-0 flex-1 truncate">{label}</span>
      <ChevronDown
        aria-hidden="true"
        className={cn(
          "ml-auto size-3.5 shrink-0 text-muted-foreground transition-transform duration-200 motion-reduce:transition-none",
          open && "rotate-180",
        )}
      />
    </>
  );
  return (
    <button
      ref={ref}
      type="button"
      id={triggerId}
      aria-expanded={open}
      aria-controls={contentId}
      onClick={toggle}
      className={cn(sidebarNavItemVariants({ active: false }), className)}
    >
      {content}
    </button>
  );
});
SidebarNavGroupTrigger.displayName = "SidebarNavGroupTrigger";

// ──────────────────────────────────────────────────────────────────
// SidebarNavGroupContent
// ──────────────────────────────────────────────────────────────────

export interface SidebarNavGroupContentProps {
  className?: string;
  children: React.ReactNode;
}

const SidebarNavGroupContent = React.forwardRef<
  HTMLDivElement,
  SidebarNavGroupContentProps
>(({ className, children }, ref) => {
  const { open, contentId, triggerId } = useSidebarNavGroupContext();
  if (!open) return null;
  return (
    <div
      ref={ref}
      id={contentId}
      role="group"
      aria-labelledby={triggerId}
      className={cn(
        "mt-px flex flex-col gap-px pl-6 [&_>_*]:py-1.5 [&_>_*]:text-[13px]",
        className,
      )}
    >
      {children}
    </div>
  );
});
SidebarNavGroupContent.displayName = "SidebarNavGroupContent";

// ──────────────────────────────────────────────────────────────────
// Exports
// ──────────────────────────────────────────────────────────────────

export {
  SidebarNav,
  SidebarNavSection,
  SidebarNavItem,
  SidebarNavGroup,
  SidebarNavGroupTrigger,
  SidebarNavGroupContent,
  sidebarNavVariants,
  sidebarNavItemVariants,
};
