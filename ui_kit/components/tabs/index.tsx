"use client";

import * as React from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

/**
 * Tabs — navegação por abas (segmented control / painéis).
 *
 * Base: Radix Tabs (`role="tablist"` + `role="tab"` + `role="tabpanel"` com
 * foco roving e navegação por setas nativa). API composta preservada:
 * `Tabs` / `TabsList` / `TabsTrigger` / `TabsContent` + `TabsBadge`.
 *
 * Variantes:
 *   variant  underline (default) — tabs de página, com border-bottom
 *            pills              — filtros leves, track elevado em pílula
 *            boxed              — seções compactas, cards individuais
 *   size     sm | md (default)
 *
 * `variant` e `size` são declarados em `Tabs` (root) uma única vez e
 * propagados a `TabsList` e `TabsTrigger` via `TabsStyleContext` interno.
 *
 * Use:
 *   <Tabs defaultValue="account">
 *     <TabsList>
 *       <TabsTrigger value="account">Conta</TabsTrigger>
 *       <TabsTrigger value="billing">
 *         Cobrança <TabsBadge>248</TabsBadge>
 *       </TabsTrigger>
 *     </TabsList>
 *     <TabsContent value="account">…</TabsContent>
 *   </Tabs>
 *
 *   <Tabs variant="pills" defaultValue="hoje">…</Tabs>
 *   <Tabs variant="boxed" defaultValue="json">…</Tabs>
 *
 * Acessibilidade:
 *   - aba ativa expõe data-state=active + aria-selected=true (Radix)
 *   - focus-visible:ring laranja (--ring) com offset
 *   - tokens semânticos do design-system; zero hex hardcoded
 */

type TabsVariant = "underline" | "pills" | "boxed";
type TabsSize = "sm" | "md";

const TabsStyleContext = React.createContext<{
  variant: TabsVariant;
  size: TabsSize;
}>({
  variant: "underline",
  size: "md",
});

const tabsListVariants = cva("inline-flex items-center", {
  variants: {
    variant: {
      underline: "gap-1 border-b border-border",
      pills: "gap-1 rounded-full bg-muted p-1",
      boxed: "gap-1",
    },
  },
  defaultVariants: { variant: "underline" },
});

const tabsTriggerVariants = cva(
  [
    "inline-flex items-center gap-1.5 whitespace-nowrap border-0 bg-transparent",
    "font-medium text-fg-muted cursor-pointer leading-none",
    "transition-[color,background-color,border-color,box-shadow] duration-150",
    "hover:enabled:text-fg",
    "disabled:opacity-50 disabled:cursor-not-allowed",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:rounded-sm",
  ].join(" "),
  {
    variants: {
      variant: {
        underline: [
          /* Bottom border absorbida pelo border-b da lista (-mb-px) */
          "-mb-px border-b-2 border-transparent",
          "data-[state=active]:border-action data-[state=active]:text-action-hover",
          /* Badge ativo: bg-hover (violet-100 light) + action-hover (violet-700) */
          "data-[state=active]:[&_.tabs-badge]:bg-bg-hover",
          "data-[state=active]:[&_.tabs-badge]:text-action-hover",
        ].join(" "),
        pills: [
          "rounded-full",
          /* Ativo: pílula elevada sobre o track */
          "data-[state=active]:bg-background data-[state=active]:text-action-hover data-[state=active]:shadow-sm",
          /* Badge ativo: bg-hover + action-hover */
          "data-[state=active]:[&_.tabs-badge]:bg-bg-hover",
          "data-[state=active]:[&_.tabs-badge]:text-action-hover",
        ].join(" "),
        boxed: [
          "rounded-md border border-border bg-background",
          "hover:enabled:bg-bg-hover hover:enabled:border-action",
          /* Ativo: action fill + button-fg + border action */
          "data-[state=active]:bg-action data-[state=active]:text-button-fg data-[state=active]:border-action",
          /* Badge ativo: translúcido sobre o action fill */
          "data-[state=active]:[&_.tabs-badge]:bg-button-fg/25",
          "data-[state=active]:[&_.tabs-badge]:text-button-fg",
        ].join(" "),
      },
      size: {
        sm: "",
        md: "",
      },
    },
    compoundVariants: [
      { variant: "underline", size: "md", className: "px-3.5 py-2.5 text-sm" },
      { variant: "underline", size: "sm", className: "px-3 py-2 text-[13px]" },
      { variant: "pills", size: "md", className: "px-3.5 py-1.5 text-[13.5px]" },
      { variant: "pills", size: "sm", className: "px-3 py-[5px] text-[12.5px]" },
      { variant: "boxed", size: "md", className: "px-3.5 py-2 text-[13.5px]" },
      { variant: "boxed", size: "sm", className: "px-3 py-1.5 text-[12.5px]" },
    ],
    defaultVariants: { variant: "underline", size: "md" },
  },
);

export interface TabsProps
  extends React.ComponentPropsWithoutRef<typeof TabsPrimitive.Root>,
    Pick<VariantProps<typeof tabsTriggerVariants>, "variant" | "size"> {}

const Tabs = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Root>,
  TabsProps
>(({ variant, size, ...props }, ref) => {
  const ctx = React.useMemo(
    () => ({ variant: variant ?? "underline", size: size ?? "md" }),
    [variant, size],
  );
  return (
    <TabsStyleContext.Provider value={ctx}>
      <TabsPrimitive.Root ref={ref} {...props} />
    </TabsStyleContext.Provider>
  );
});
Tabs.displayName = "Tabs";

export type TabsListProps = React.ComponentPropsWithoutRef<
  typeof TabsPrimitive.List
>;

const TabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  TabsListProps
>(({ className, ...props }, ref) => {
  const { variant } = React.useContext(TabsStyleContext);
  return (
    <TabsPrimitive.List
      ref={ref}
      className={cn(tabsListVariants({ variant }), className)}
      {...props}
    />
  );
});
TabsList.displayName = TabsPrimitive.List.displayName;

export interface TabsTriggerProps
  extends React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger> {
  /** Sobrescreve o `size` herdado de `Tabs` para este trigger. */
  size?: TabsSize;
}

const TabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  TabsTriggerProps
>(({ className, size, ...props }, ref) => {
  const ctx = React.useContext(TabsStyleContext);
  return (
    <TabsPrimitive.Trigger
      ref={ref}
      className={cn(
        tabsTriggerVariants({ variant: ctx.variant, size: size ?? ctx.size }),
        className,
      )}
      {...props}
    />
  );
});
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName;

const TabsContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn(
      "mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
      className,
    )}
    {...props}
  />
));
TabsContent.displayName = TabsPrimitive.Content.displayName;

/**
 * TabsBadge — pílula de contagem opcional dentro de `TabsTrigger`.
 *
 * Estado inativo: `bg-muted` + `text-muted-foreground`. O trigger ativo
 * sobrescreve via seletor descendente `[&_.tabs-badge]` conforme a variante
 * (bg-hover/action-hover em underline+pills, translúcido/button-fg em boxed).
 */
const TabsBadge = React.forwardRef<
  HTMLSpanElement,
  React.HTMLAttributes<HTMLSpanElement>
>(({ className, ...props }, ref) => (
  <span
    ref={ref}
    className={cn(
      "tabs-badge inline-flex items-center justify-center",
      "h-[18px] min-w-[18px] rounded-full px-1.5",
      "text-[10.5px] font-bold leading-none",
      "bg-muted text-muted-foreground transition-colors",
      className,
    )}
    {...props}
  />
));
TabsBadge.displayName = "TabsBadge";

export { Tabs, TabsList, TabsTrigger, TabsContent, TabsBadge };
