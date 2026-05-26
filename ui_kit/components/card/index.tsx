import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

/**
 * Card — container semântico para agrupar conteúdo relacionado.
 *
 * Composição:
 *   <Card>
 *     <Card.Header>
 *       <Card.Title>...</Card.Title>
 *       <Card.Description>...</Card.Description>
 *     </Card.Header>
 *     <Card.Content>...</Card.Content>
 *     <Card.Footer>...</Card.Footer>
 *   </Card>
 *
 * Os subcomponentes também são exportados nomeados (`CardHeader`, `CardTitle`,
 * `CardDescription`, `CardContent`, `CardFooter`) para preservar o consumo
 * anterior à #94.
 *
 * **API:**
 *   - `variant`: `default` (shadow-sm) · `elevated` (shadow-md) · `outlined` (sem shadow, border forte)
 *   - `padding`: `none` · `sm` · `md` (default) · `lg`
 *   - `interactive`: liga foco visível + hover (use junto com `as="button"` ou
 *     `onClick` quando o card todo é um link/ação)
 *
 * Renderiza `<article>` por default (semântico para um container coeso).
 * Use `as="section"` ou `as="div"` quando o contexto não é artigo.
 *
 * Apenas tokens semânticos — zero cor hardcoded.
 */
const cardVariants = cva(
  [
    "block rounded-lg bg-card text-card-foreground",
    "transition-shadow",
  ].join(" "),
  {
    variants: {
      variant: {
        // WHY: `default` preserva render byte-identical do baseline pre-#94
        // (border + shadow-sm). `elevated` sobe a hierarquia para chamadas
        // de atenção; `outlined` reforça a borda e remove shadow para um look
        // mais "linha" — útil em dashboards densos.
        default: "border border-border shadow-sm",
        elevated: "border border-border shadow-md",
        outlined: "border-2 border-border-strong",
      },
      padding: {
        none: "p-0",
        sm: "p-4",
        md: "p-0",
        lg: "p-0",
      },
      interactive: {
        true: [
          "cursor-pointer",
          "hover:shadow-md focus-visible:outline-none",
          "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        ].join(" "),
        false: "",
      },
    },
    defaultVariants: {
      variant: "default",
      padding: "md",
      interactive: false,
    },
  },
);

type CardElement = "article" | "section" | "div";

export interface CardProps
  extends Omit<React.HTMLAttributes<HTMLElement>, "color">,
    VariantProps<typeof cardVariants> {
  /** Elemento semântico raiz. Default `article`. */
  as?: CardElement;
}

const CardRoot = React.forwardRef<HTMLElement, CardProps>(
  (
    {
      className,
      variant,
      padding,
      interactive,
      as: Component = "article",
      ...props
    },
    ref,
  ) => {
    const isInteractive = Boolean(interactive);
    // WHY: Card raiz torna-se ativável via teclado quando `interactive=true`
    // foi declarado pelo consumer. Sem isso, `tabIndex` ausente quebra a
    // navegação por Tab para cards-link (a raiz é <article>/<section>/<div>,
    // nenhum deles focável por default).
    const tabIndex =
      isInteractive && props.tabIndex === undefined ? 0 : props.tabIndex;

    return React.createElement(Component, {
      ref,
      "data-slot": "card",
      "data-variant": variant ?? "default",
      "data-interactive": isInteractive || undefined,
      tabIndex,
      className: cn(cardVariants({ variant, padding, interactive }), className),
      ...props,
    });
  },
);
CardRoot.displayName = "Card";

/* ─── Card.Header ──────────────────────────────────────────────────── */

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    data-slot="card-header"
    className={cn("flex flex-col space-y-1.5 p-6", className)}
    {...props}
  />
));
CardHeader.displayName = "CardHeader";

/* ─── Card.Title ───────────────────────────────────────────────────── */

export interface CardTitleProps
  extends React.HTMLAttributes<HTMLHeadingElement> {
  /** Nível semântico do heading. Default `h3` (um Card sob `h1`/`h2` da página). */
  as?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
}

const CardTitle = React.forwardRef<HTMLHeadingElement, CardTitleProps>(
  ({ className, as: Component = "h3", ...props }, ref) =>
    React.createElement(Component, {
      ref,
      "data-slot": "card-title",
      className: cn(
        "text-2xl font-semibold leading-none tracking-tight",
        className,
      ),
      ...props,
    }),
);
CardTitle.displayName = "CardTitle";

/* ─── Card.Description ─────────────────────────────────────────────── */

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    data-slot="card-description"
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
));
CardDescription.displayName = "CardDescription";

/* ─── Card.Content ─────────────────────────────────────────────────── */

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    data-slot="card-content"
    className={cn("p-6 pt-0", className)}
    {...props}
  />
));
CardContent.displayName = "CardContent";

/* ─── Card.Footer ──────────────────────────────────────────────────── */

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    data-slot="card-footer"
    className={cn("flex items-center p-6 pt-0", className)}
    {...props}
  />
));
CardFooter.displayName = "CardFooter";

/* ─── Compound namespace ───────────────────────────────────────────── */

type CardCompound = typeof CardRoot & {
  Header: typeof CardHeader;
  Title: typeof CardTitle;
  Description: typeof CardDescription;
  Content: typeof CardContent;
  Footer: typeof CardFooter;
};

const Card = CardRoot as CardCompound;
Card.Header = CardHeader;
Card.Title = CardTitle;
Card.Description = CardDescription;
Card.Content = CardContent;
Card.Footer = CardFooter;

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
  cardVariants,
};
