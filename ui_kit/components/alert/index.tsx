"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { X } from "lucide-react";

import { cn } from "@/lib/utils";

/**
 * Alert — banner inline com severidade semântica.
 *
 * Para feedback persistente in-flow (ex.: "pagamento agendado",
 * "validação falhou", "release publicado"). Para feedback transiente
 * use `<Toast>`; para confirmações modais use `<Dialog>` /
 * `<AlertDialog>`.
 *
 * Base: HTML semântico (`<div role="status">` por default,
 * `role="alert"` quando `assertive`). Sem Radix Primitive — Alert é
 * inline, não transiente, e a fila de live regions nativa do browser
 * é suficiente para a a11y dinâmica.
 *
 * Decisões registradas em
 * `docs/adr/ADR-011-alert-v0.1.0-dod-migration.md`.
 *
 * Public surface (6 componentes + 1 CVA accessor + 2 types):
 *   Alert, AlertIcon, AlertTitle, AlertDescription, AlertActions, AlertClose
 *   alertVariants
 *   AlertTone, AlertSize
 */

// ──────────────────────────────────────────────────────────────────
// CVA variants — tone × size ladders
// ──────────────────────────────────────────────────────────────────

const alertVariants = cva(
  [
    // Layout base — flex row: icon | body | actions
    "relative w-full rounded-lg border",
    "flex items-start gap-3",
    // Typography family follows the design-system default (Poppins → Roboto)
    "font-sans",
  ].join(" "),
  {
    variants: {
      tone: {
        info: "bg-info-soft border-info text-info-fg",
        success: "bg-success-soft border-success text-success-fg",
        warning: "bg-warning-soft border-warning text-warning-fg",
        // `error` is the catalog-wide form-state vocabulary; internally aliases
        // the `--danger` token chain — see ADR-011 § Alternatives 2.
        error: "bg-danger-soft border-danger text-danger-fg",
      },
      size: {
        sm: "p-2 text-xs",
        md: "p-3 text-sm",
        lg: "p-4 text-sm",
      },
    },
    defaultVariants: { tone: "info", size: "md" },
  },
);

export type AlertTone = NonNullable<VariantProps<typeof alertVariants>["tone"]>;
export type AlertSize = NonNullable<VariantProps<typeof alertVariants>["size"]>;

// ──────────────────────────────────────────────────────────────────
// Context — wires AlertClose to onOpenChange + supplies titleId
// ──────────────────────────────────────────────────────────────────

interface AlertContextValue {
  titleId: string;
  closeAlert: () => void;
}

const AlertContext = React.createContext<AlertContextValue | null>(null);

function useAlertContext(component: string): AlertContextValue {
  const ctx = React.useContext(AlertContext);
  if (!ctx) {
    throw new Error(
      `<${component}> must be rendered inside <Alert>. Ensure it is a descendant of the Alert composition.`,
    );
  }
  return ctx;
}

// ──────────────────────────────────────────────────────────────────
// Alert (root)
// ──────────────────────────────────────────────────────────────────

export interface AlertProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "role">,
    VariantProps<typeof alertVariants> {
  /**
   * Render the alert as an assertive live region (`role="alert"`).
   * Default `false` renders as a polite live region (`role="status"`),
   * which is the recommended baseline for in-flow feedback per
   * `lex-frontend-accessibility` Rule 6.2.
   */
  assertive?: boolean;
  /**
   * Controlled open state. When provided, the parent owns the
   * dismissed/displayed state and `onOpenChange` is the source of
   * truth for transitions.
   */
  open?: boolean;
  /**
   * Initial open state for uncontrolled usage. Default `true`.
   */
  defaultOpen?: boolean;
  /**
   * Notified whenever the open state changes — by parent control
   * (controlled) or by `<AlertClose>` (uncontrolled).
   */
  onOpenChange?: (open: boolean) => void;
}

const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
  (
    {
      className,
      tone,
      size,
      assertive = false,
      open: controlledOpen,
      defaultOpen = true,
      onOpenChange,
      children,
      ...props
    },
    ref,
  ) => {
    const isControlled = controlledOpen !== undefined;
    const [uncontrolledOpen, setUncontrolledOpen] =
      React.useState<boolean>(defaultOpen);
    const open = isControlled ? controlledOpen : uncontrolledOpen;

    const titleId = React.useId();

    const closeAlert = React.useCallback(() => {
      if (!isControlled) {
        setUncontrolledOpen(false);
      }
      onOpenChange?.(false);
    }, [isControlled, onOpenChange]);

    const contextValue = React.useMemo<AlertContextValue>(
      () => ({ titleId, closeAlert }),
      [titleId, closeAlert],
    );

    if (!open) return null;

    return (
      <AlertContext.Provider value={contextValue}>
        <div
          ref={ref}
          role={assertive ? "alert" : "status"}
          aria-labelledby={titleId}
          className={cn(alertVariants({ tone, size }), className)}
          {...props}
        >
          {children}
        </div>
      </AlertContext.Provider>
    );
  },
);
Alert.displayName = "Alert";

// ──────────────────────────────────────────────────────────────────
// AlertIcon — leading slot
// ──────────────────────────────────────────────────────────────────

export type AlertIconProps = React.HTMLAttributes<HTMLSpanElement>;

const AlertIcon = React.forwardRef<HTMLSpanElement, AlertIconProps>(
  ({ className, children, ...props }, ref) => (
    <span
      ref={ref}
      aria-hidden="true"
      className={cn(
        "flex shrink-0 items-center justify-center pt-0.5 [&>svg]:size-4",
        className,
      )}
      {...props}
    >
      {children}
    </span>
  ),
);
AlertIcon.displayName = "AlertIcon";

// ──────────────────────────────────────────────────────────────────
// AlertTitle
// ──────────────────────────────────────────────────────────────────

export type AlertTitleProps = React.HTMLAttributes<HTMLDivElement>;

const AlertTitle = React.forwardRef<HTMLDivElement, AlertTitleProps>(
  ({ className, children, id: externalId, ...props }, ref) => {
    const { titleId } = useAlertContext("AlertTitle");
    return (
      <div
        ref={ref}
        id={externalId ?? titleId}
        className={cn(
          "min-w-0 grow self-center font-medium leading-tight tracking-tight",
          className,
        )}
        {...props}
      >
        {children}
      </div>
    );
  },
);
AlertTitle.displayName = "AlertTitle";

// ──────────────────────────────────────────────────────────────────
// AlertDescription
// ──────────────────────────────────────────────────────────────────

export type AlertDescriptionProps = React.HTMLAttributes<HTMLDivElement>;

const AlertDescription = React.forwardRef<
  HTMLDivElement,
  AlertDescriptionProps
>(({ className, children, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "min-w-0 grow leading-relaxed [&_p]:m-0 [&_p]:leading-relaxed",
      className,
    )}
    {...props}
  >
    {children}
  </div>
));
AlertDescription.displayName = "AlertDescription";

// ──────────────────────────────────────────────────────────────────
// AlertActions — trailing flex slot
// ──────────────────────────────────────────────────────────────────

export type AlertActionsProps = React.HTMLAttributes<HTMLDivElement>;

const AlertActions = React.forwardRef<HTMLDivElement, AlertActionsProps>(
  ({ className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "flex shrink-0 items-center gap-2 self-center",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  ),
);
AlertActions.displayName = "AlertActions";

// ──────────────────────────────────────────────────────────────────
// AlertClose — dismiss button
// ──────────────────────────────────────────────────────────────────

export type AlertCloseProps = React.ButtonHTMLAttributes<HTMLButtonElement>;

const AlertClose = React.forwardRef<HTMLButtonElement, AlertCloseProps>(
  (
    { className, onClick, "aria-label": ariaLabel = "Fechar", ...props },
    ref,
  ) => {
    const { closeAlert } = useAlertContext("AlertClose");
    return (
      <button
        ref={ref}
        type="button"
        aria-label={ariaLabel}
        onClick={(event) => {
          onClick?.(event);
          if (!event.defaultPrevented) {
            closeAlert();
          }
        }}
        className={cn(
          "inline-flex size-6 shrink-0 cursor-pointer items-center justify-center self-start rounded-sm",
          "text-current opacity-70 hover:opacity-100",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1",
          className,
        )}
        {...props}
      >
        <X aria-hidden="true" className="size-3.5" />
      </button>
    );
  },
);
AlertClose.displayName = "AlertClose";

// ──────────────────────────────────────────────────────────────────
// Exports
// ──────────────────────────────────────────────────────────────────

export {
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  AlertActions,
  AlertClose,
  alertVariants,
};
