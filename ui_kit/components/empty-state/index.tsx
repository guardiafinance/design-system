import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

/**
 * EmptyState — superfície canônica para "no results", "first-use" e
 * "no data yet" no `@guardia/design-system`.
 *
 * Composição-only (sem Radix): não há posicionamento, portal, focus
 * trap nem state. EmptyState é um container semântico (`role="status"`
 * + `aria-live="polite"` por default) que anuncia a substituição de
 * conteúdo para tecnologias assistivas — quando uma listagem fica
 * vazia depois de um filtro, o screen reader lê o título e a
 * descrição. Consumidores podem sobrescrever o role ou o `aria-live`
 * quando o contexto pede `region` ou `none`.
 *
 * Composição (precedente: Card #94):
 *   <EmptyState size="md">
 *     <EmptyState.Icon><Icon name="inbox" /></EmptyState.Icon>
 *     <EmptyState.Title>Nenhum lançamento</EmptyState.Title>
 *     <EmptyState.Description>
 *       Conecte um banco para começar a conciliar.
 *     </EmptyState.Description>
 *     <EmptyState.Actions>
 *       <Button>Conectar banco</Button>
 *     </EmptyState.Actions>
 *   </EmptyState>
 *
 * Subcomponentes também são exportados nomeados (`EmptyStateIcon`,
 * `EmptyStateIllustration`, `EmptyStateTitle`, `EmptyStateDescription`,
 * `EmptyStateActions`) para consumidores que preferem imports planos
 * (paridade Card / Tooltip-Provider). A identidade é preservada:
 * `EmptyState.Icon === EmptyStateIcon`.
 *
 * **API:**
 *   - `size`: `sm` · `md` (default) · `lg` — escala padding/icon container
 *   - `as`: `div` (default) · `section` — elemento semântico do root
 *
 * Token contract (zero cor hardcoded; remap explícito da referência
 * legada em `ux_references/ui_kits/components/EmptyState/`):
 *   - icon container background → `bg-muted` (era `--violet-50`)
 *   - icon foreground / title color → `text-foreground` (era `--violet-500` / `--fg`)
 *   - description color → `text-muted-foreground` (era `--fg-muted`)
 *
 * Ícone vs. Ilustração: o consumidor escolhe **um dos dois**, nunca os
 * dois. `Icon` renderiza um container quadrado com `bg-muted`; o ícone
 * em si herda `text-foreground`. `Illustration` é um slot livre sem
 * background — para SVG/PNG/Logo que já carregam sua própria cor.
 *
 * Decisão arquitetural: SKIP — sem ADR. Composição segue Card;
 * tokens seguem ADR-005/006/007; size ladder segue Popover/Tooltip.
 */

// ──────────────────────────────────────────────────────────────────
// CVA — root variants (size ladder)
// ──────────────────────────────────────────────────────────────────

const emptyStateVariants = cva(
  ["flex w-full flex-col items-center text-center text-foreground"].join(" "),
  {
    variants: {
      size: {
        sm: "py-6 px-4 gap-1.5",
        md: "py-10 px-6 gap-2",
        lg: "py-16 px-8 gap-2.5",
      },
    },
    defaultVariants: { size: "md" },
  },
);

export type EmptyStateSize = NonNullable<
  VariantProps<typeof emptyStateVariants>["size"]
>;

// ──────────────────────────────────────────────────────────────────
// CVA — slot variants
// ──────────────────────────────────────────────────────────────────

/**
 * Icon container: square, rounded, `bg-muted`. Size variant mirrors
 * the legacy reference one-to-one (42 / 56 / 72 px).
 */
const emptyStateIconVariants = cva(
  [
    "inline-flex items-center justify-center",
    "bg-muted text-foreground",
    "mb-1.5",
  ].join(" "),
  {
    variants: {
      size: {
        sm: "h-[42px] w-[42px] rounded-xl",
        md: "h-14 w-14 rounded-2xl",
        lg: "h-[72px] w-[72px] rounded-2xl",
      },
    },
    defaultVariants: { size: "md" },
  },
);

const emptyStateTitleVariants = cva("text-foreground", {
  variants: {
    size: {
      sm: "text-sm font-semibold",
      md: "text-[15px] font-semibold",
      lg: "text-lg font-semibold",
    },
  },
  defaultVariants: { size: "md" },
});

/** Description: muted-foreground; max-width keeps a readable measure. */
const emptyStateDescriptionVariants = cva(
  ["text-muted-foreground leading-relaxed max-w-prose"].join(" "),
  {
    variants: {
      size: {
        sm: "text-xs",
        md: "text-[13.5px]",
        lg: "text-sm",
      },
    },
    defaultVariants: { size: "md" },
  },
);

/**
 * Actions slot: stacks horizontally on `md`/`lg`, vertically on `sm`
 * for a denser footprint. Margin-top adds breathing room between the
 * description and the CTAs.
 */
const emptyStateActionsVariants = cva(["flex mt-2.5"].join(" "), {
  variants: {
    size: {
      sm: "flex-col gap-2",
      md: "flex-row gap-2",
      lg: "flex-row gap-2",
    },
  },
  defaultVariants: { size: "md" },
});

// ──────────────────────────────────────────────────────────────────
// Context — propagates `size` from root to subcomponents
// ──────────────────────────────────────────────────────────────────

interface EmptyStateContextValue {
  size: EmptyStateSize;
  titleId: string;
  descriptionId: string;
}

const EmptyStateContext = React.createContext<EmptyStateContextValue | null>(
  null,
);

function useEmptyStateContext(slot: string): EmptyStateContextValue {
  const ctx = React.useContext(EmptyStateContext);
  if (ctx === null) {
    throw new Error(
      `<EmptyState.${slot}> must be used inside <EmptyState>. ` +
        "Wrap your slots in <EmptyState> so size + aria associations propagate.",
    );
  }
  return ctx;
}

// ──────────────────────────────────────────────────────────────────
// Root
// ──────────────────────────────────────────────────────────────────

type EmptyStateElement = "div" | "section";

export interface EmptyStateProps
  extends Omit<React.HTMLAttributes<HTMLElement>, "color">,
    VariantProps<typeof emptyStateVariants> {
  /** Semantic element rendered at the root. Default `div`. */
  as?: EmptyStateElement;
}

const EmptyStateRoot = React.forwardRef<HTMLElement, EmptyStateProps>(
  (
    {
      className,
      size,
      as: Component = "div",
      role,
      "aria-live": ariaLive,
      "aria-atomic": ariaAtomic,
      id,
      children,
      ...props
    },
    ref,
  ) => {
    const resolvedSize: EmptyStateSize = size ?? "md";

    // Stable id pair for title/description association. Read once; if
    // the consumer supplies an `id`, derive the title/description ids
    // from it for predictable testability.
    const generatedId = React.useId();
    const rootId = id ?? `empty-state-${generatedId}`;
    const titleId = `${rootId}-title`;
    const descriptionId = `${rootId}-description`;

    const contextValue = React.useMemo<EmptyStateContextValue>(
      () => ({ size: resolvedSize, titleId, descriptionId }),
      [resolvedSize, titleId, descriptionId],
    );

    return React.createElement(
      Component,
      {
        ref,
        id: rootId,
        "data-slot": "empty-state",
        "data-size": resolvedSize,
        role: role ?? "status",
        // WHY: `aria-live="polite"` announces the empty state when it
        // replaces previous content (typical filter result). Consumer
        // may override with `aria-live=""` for surfaces where the
        // announcement is redundant.
        "aria-live": ariaLive ?? "polite",
        "aria-atomic": ariaAtomic ?? true,
        className: cn(emptyStateVariants({ size: resolvedSize }), className),
        ...props,
      },
      <EmptyStateContext.Provider value={contextValue}>
        {children}
      </EmptyStateContext.Provider>,
    );
  },
);
EmptyStateRoot.displayName = "EmptyState";

// ──────────────────────────────────────────────────────────────────
// EmptyState.Icon
// ──────────────────────────────────────────────────────────────────

const EmptyStateIcon = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  const { size } = useEmptyStateContext("Icon");
  return (
    <div
      ref={ref}
      data-slot="empty-state-icon"
      // WHY: icon container itself is decorative (the title is the
      // accessible name). Consumers passing a non-decorative svg as
      // child may flip `aria-hidden` via spread on the icon child.
      aria-hidden="true"
      className={cn(emptyStateIconVariants({ size }), className)}
      {...props}
    />
  );
});
EmptyStateIcon.displayName = "EmptyStateIcon";

// ──────────────────────────────────────────────────────────────────
// EmptyState.Illustration
// ──────────────────────────────────────────────────────────────────

const EmptyStateIllustration = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    data-slot="empty-state-illustration"
    aria-hidden="true"
    className={cn("mb-1.5 inline-flex items-center justify-center", className)}
    {...props}
  />
));
EmptyStateIllustration.displayName = "EmptyStateIllustration";

// ──────────────────────────────────────────────────────────────────
// EmptyState.Title
// ──────────────────────────────────────────────────────────────────

export interface EmptyStateTitleProps
  extends React.HTMLAttributes<HTMLHeadingElement> {
  /** Semantic heading level. Default `h3`. */
  as?: "h2" | "h3" | "h4" | "h5" | "h6";
}

const EmptyStateTitle = React.forwardRef<
  HTMLHeadingElement,
  EmptyStateTitleProps
>(({ className, as: Component = "h3", id, ...props }, ref) => {
  const { size, titleId } = useEmptyStateContext("Title");
  return React.createElement(Component, {
    ref,
    id: id ?? titleId,
    "data-slot": "empty-state-title",
    className: cn(emptyStateTitleVariants({ size }), className),
    ...props,
  });
});
EmptyStateTitle.displayName = "EmptyStateTitle";

// ──────────────────────────────────────────────────────────────────
// EmptyState.Description
// ──────────────────────────────────────────────────────────────────

const EmptyStateDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, id, ...props }, ref) => {
  const { size, descriptionId } = useEmptyStateContext("Description");
  return (
    <p
      ref={ref}
      id={id ?? descriptionId}
      data-slot="empty-state-description"
      className={cn(emptyStateDescriptionVariants({ size }), className)}
      {...props}
    />
  );
});
EmptyStateDescription.displayName = "EmptyStateDescription";

// ──────────────────────────────────────────────────────────────────
// EmptyState.Actions
// ──────────────────────────────────────────────────────────────────

const EmptyStateActions = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  const { size } = useEmptyStateContext("Actions");
  return (
    <div
      ref={ref}
      data-slot="empty-state-actions"
      className={cn(emptyStateActionsVariants({ size }), className)}
      {...props}
    />
  );
});
EmptyStateActions.displayName = "EmptyStateActions";

// ──────────────────────────────────────────────────────────────────
// Compound namespace
// ──────────────────────────────────────────────────────────────────

type EmptyStateCompound = typeof EmptyStateRoot & {
  Icon: typeof EmptyStateIcon;
  Illustration: typeof EmptyStateIllustration;
  Title: typeof EmptyStateTitle;
  Description: typeof EmptyStateDescription;
  Actions: typeof EmptyStateActions;
};

const EmptyState = EmptyStateRoot as EmptyStateCompound;
EmptyState.Icon = EmptyStateIcon;
EmptyState.Illustration = EmptyStateIllustration;
EmptyState.Title = EmptyStateTitle;
EmptyState.Description = EmptyStateDescription;
EmptyState.Actions = EmptyStateActions;

// ──────────────────────────────────────────────────────────────────
// Exports
// ──────────────────────────────────────────────────────────────────

export {
  EmptyState,
  EmptyStateIcon,
  EmptyStateIllustration,
  EmptyStateTitle,
  EmptyStateDescription,
  EmptyStateActions,
  emptyStateVariants,
  emptyStateIconVariants,
  emptyStateTitleVariants,
  emptyStateDescriptionVariants,
  emptyStateActionsVariants,
};
