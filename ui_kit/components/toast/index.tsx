"use client";

import * as React from "react";
import * as ToastPrimitive from "@radix-ui/react-toast";
import { cva, type VariantProps } from "class-variance-authority";
import { X } from "lucide-react";

import { cn } from "@/lib/utils";

/**
 * Toast — feedback transiente empilhado em um canto da viewport.
 *
 * Para sinalizar resultado de uma ação que ocorreu há pouco tempo
 * (ex.: "lançamento aprovado", "falha ao sincronizar", "processando
 * 248 itens…"). Para feedback persistente in-flow use `<Alert>`; para
 * confirmação modal bloqueante use `<Dialog>` / `<AlertDialog>`.
 *
 * Base: `@radix-ui/react-toast` (portal, queue, swipe-to-dismiss,
 * pause-on-hover/focus, ARIA live regions, keyboard navigation). Esta
 * wrapper adiciona:
 *   - API imperativa canônica `<ToastProvider>` + `useToast()` com
 *     `toast({ tone, title, description, duration, action, id })` —
 *     paridade com a referência legada em
 *     `ux_references/ui_kits/components/Toast/`.
 *   - Primitivas declarativas re-exportadas para composição avançada
 *     (paridade com Dialog/Popover).
 *   - CVA `tone` matrix (`info | success | warning | error`)
 *     consumindo o token chain de ADR-011 (Alert).
 *   - `<ToastViewport>` posicionado via prop (`bottom-right`,
 *     `top-center`, etc.) com swipe direction derivado da posição.
 *   - Mapeamento ARIA por tom: polite (`role="status"`) para info /
 *     success, assertive (`role="alert"`) para warning / error.
 *
 * Decisões registradas em
 * `docs/adr/ADR-014-toast-v0.1.0-dod-migration.md`.
 *
 * Public surface (9 componentes + 1 CVA accessor + 5 types):
 *   Toast, ToastProvider, ToastViewport,
 *   ToastTitle, ToastDescription, ToastAction, ToastClose,
 *   useToast, toastVariants
 *   ToastTone, ToastVariant, ToastPosition, ToastOptions, ToastInstance
 */

// ──────────────────────────────────────────────────────────────────
// CVA variants — tone ladder mirroring Alert (ADR-011)
// ──────────────────────────────────────────────────────────────────

const toastVariants = cva(
  [
    // Layout base — flex row: body | actions
    "group pointer-events-auto relative flex w-full items-start gap-3",
    "overflow-hidden rounded-lg border p-4 pr-8 shadow-lg",
    "font-sans text-sm",
    // Animations — Radix data-state lifecycle
    "data-[state=open]:animate-in data-[state=closed]:animate-out",
    "data-[state=closed]:fade-out-80",
    "data-[state=open]:slide-in-from-top-full",
    "data-[state=open]:sm:slide-in-from-bottom-full",
    "data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)]",
    "data-[swipe=cancel]:translate-x-0",
    "data-[swipe=cancel]:transition-[transform_200ms_ease-out]",
    "data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)]",
    "data-[swipe=end]:animate-out",
  ].join(" "),
  {
    variants: {
      tone: {
        info: "bg-info-soft border-info text-info-fg",
        success: "bg-success-soft border-success text-success-fg",
        warning: "bg-warning-soft border-warning text-warning-fg",
        // `error` aliases the `--danger` chain — semantic naming aligned
        // with the form-state vocabulary in the catalog (per ADR-011).
        error: "bg-danger-soft border-danger text-danger-fg",
      },
    },
    defaultVariants: { tone: "info" },
  },
);

export type ToastTone = NonNullable<VariantProps<typeof toastVariants>["tone"]>;
export type ToastVariant = ToastTone;

export type ToastPosition =
  | "bottom-right"
  | "bottom-left"
  | "top-right"
  | "top-left"
  | "bottom-center"
  | "top-center";

const VIEWPORT_POSITION_CLASSES: Record<ToastPosition, string> = {
  "bottom-right":
    "fixed bottom-0 right-0 z-[100] flex max-h-screen w-full flex-col-reverse p-4 sm:right-0 sm:bottom-0 sm:top-auto sm:flex-col md:max-w-[420px]",
  "bottom-left":
    "fixed bottom-0 left-0 z-[100] flex max-h-screen w-full flex-col-reverse p-4 sm:left-0 sm:bottom-0 sm:top-auto sm:flex-col md:max-w-[420px]",
  "top-right":
    "fixed top-0 right-0 z-[100] flex max-h-screen w-full flex-col p-4 sm:right-0 sm:top-0 sm:bottom-auto md:max-w-[420px]",
  "top-left":
    "fixed top-0 left-0 z-[100] flex max-h-screen w-full flex-col p-4 sm:left-0 sm:top-0 sm:bottom-auto md:max-w-[420px]",
  "bottom-center":
    "fixed bottom-0 left-1/2 z-[100] flex max-h-screen w-full -translate-x-1/2 flex-col-reverse p-4 sm:bottom-0 sm:top-auto sm:flex-col md:max-w-[420px]",
  "top-center":
    "fixed top-0 left-1/2 z-[100] flex max-h-screen w-full -translate-x-1/2 flex-col p-4 sm:top-0 sm:bottom-auto md:max-w-[420px]",
};

const POSITION_SWIPE_DIRECTION: Record<
  ToastPosition,
  React.ComponentProps<typeof ToastPrimitive.Provider>["swipeDirection"]
> = {
  "bottom-right": "right",
  "top-right": "right",
  "bottom-left": "left",
  "top-left": "left",
  "bottom-center": "down",
  "top-center": "up",
};

// ──────────────────────────────────────────────────────────────────
// Types — imperative API contract
// ──────────────────────────────────────────────────────────────────

/**
 * Action descriptor consumed by the imperative `toast()` call. It is
 * the *data* contract for an action button, not the declarative
 * component — the declarative component is exported as `ToastAction`
 * below (Radix `Action` re-export).
 */
export interface ToastActionDescriptor {
  /** Label shown on the action button. */
  label: React.ReactNode;
  /** Callback invoked on click. The toast is dismissed after this runs. */
  onClick: () => void;
  /**
   * Alt text for screen readers when the toast plays in assertive mode.
   * Radix Toast requires `altText` to ensure the action is communicated
   * to assistive technologies. Default is the string form of `label` if
   * it is a plain string; otherwise consumers MUST provide an altText.
   */
  altText?: string;
}

export interface ToastOptions {
  /** Severity tone. Default `"info"`. */
  tone?: ToastTone;
  /** Headline content. */
  title: React.ReactNode;
  /** Supporting copy below the title. */
  description?: React.ReactNode;
  /**
   * Auto-dismiss timeout in ms. Default inherits from `<ToastProvider>`
   * (5000 ms). Pass `Infinity` or `0` for persistent — the toast stays
   * until the close button or `dismiss(id)` is invoked.
   */
  duration?: number;
  /** Optional action button rendered on the trailing edge. */
  action?: ToastActionDescriptor;
  /**
   * Stable id. When provided, calling `toast()` with the same id
   * replaces the existing toast (debounce / update semantics). When
   * omitted a random id is generated.
   */
  id?: string;
}

export interface ToastInstance extends ToastOptions {
  /** Resolved id (always present). */
  id: string;
  /** Resolved tone (defaults to `"info"`). */
  tone: ToastTone;
}

interface ToastContextValue {
  toast: (options: ToastOptions) => string;
  dismiss: (id: string) => void;
  dismissAll: () => void;
}

const ToastContext = React.createContext<ToastContextValue | null>(null);

function generateId(): string {
  // WHY: Math.random is sufficient — toast ids are local UI state, not
  // security tokens. Using crypto.randomUUID would force a feature check
  // and gain no real entropy benefit for queue ordering.
  return Math.random().toString(36).slice(2, 11);
}

// ──────────────────────────────────────────────────────────────────
// Toast.Provider — owns reducer + Radix Provider + Viewport
// ──────────────────────────────────────────────────────────────────

export interface ToastProviderProps {
  children?: React.ReactNode;
  /** Viewport corner. Default `"bottom-right"`. */
  position?: ToastPosition;
  /** Auto-dismiss baseline in ms. Default `5000`. */
  duration?: number;
  /** Max simultaneous toasts. Default `5`. Extras queue FIFO. */
  limit?: number;
  /** Override swipe direction. Default derived from `position`. */
  swipeDirection?: React.ComponentProps<
    typeof ToastPrimitive.Provider
  >["swipeDirection"];
  /** Override the swipe threshold in px. Default Radix value (50). */
  swipeThreshold?: number;
  /** Additional class names applied to `<ToastViewport>`. */
  viewportClassName?: string;
  /**
   * Suppress the auto-rendered viewport when consumers need to render
   * `<ToastViewport>` themselves (e.g. inside a specific subtree).
   * Default `false`.
   */
  hideViewport?: boolean;
}

const ToastProvider: React.FC<ToastProviderProps> = ({
  children,
  position = "bottom-right",
  duration = 5000,
  limit = 5,
  swipeDirection,
  swipeThreshold,
  viewportClassName,
  hideViewport = false,
}) => {
  const [items, setItems] = React.useState<ToastInstance[]>([]);
  const queueRef = React.useRef<ToastInstance[]>([]);

  const dismiss = React.useCallback(
    (id: string) => {
      setItems((current) => {
        const next = current.filter((item) => item.id !== id);
        if (queueRef.current.length > 0 && next.length < limit) {
          const [head, ...rest] = queueRef.current;
          if (head) {
            queueRef.current = rest;
            return [...next, head];
          }
        }
        return next;
      });
    },
    [limit],
  );

  const dismissAll = React.useCallback(() => {
    queueRef.current = [];
    setItems([]);
  }, []);

  const toast = React.useCallback(
    (options: ToastOptions): string => {
      const id = options.id ?? generateId();
      const tone: ToastTone = options.tone ?? "info";
      const instance: ToastInstance = { ...options, id, tone };

      setItems((current) => {
        const replacingIndex = current.findIndex((item) => item.id === id);
        if (replacingIndex >= 0) {
          const next = [...current];
          next[replacingIndex] = instance;
          return next;
        }
        if (current.length >= limit) {
          queueRef.current = [...queueRef.current, instance];
          return current;
        }
        return [...current, instance];
      });

      return id;
    },
    [limit],
  );

  const contextValue = React.useMemo<ToastContextValue>(
    () => ({ toast, dismiss, dismissAll }),
    [toast, dismiss, dismissAll],
  );

  const resolvedSwipeDirection =
    swipeDirection ?? POSITION_SWIPE_DIRECTION[position];

  return (
    <ToastContext.Provider value={contextValue}>
      <ToastPrimitive.Provider
        swipeDirection={resolvedSwipeDirection}
        swipeThreshold={swipeThreshold}
        duration={duration}
      >
        {children}
        {items.map((item) => {
          const isAssertive = item.tone === "warning" || item.tone === "error";
          return (
            <ToastPrimitive.Root
              key={item.id}
              type={isAssertive ? "background" : "foreground"}
              role={isAssertive ? "alert" : "status"}
              duration={
                // Radix `Toast.Root` treats `duration === Infinity`
                // (and `0`/falsy after the Provider default falls back
                // to its own) as persistent — no auto-dismiss timer is
                // scheduled. We pass `Infinity` for both consumer
                // aliases so the persistent semantics are honored
                // without overflowing setTimeout.
                item.duration === Infinity || item.duration === 0
                  ? Infinity
                  : item.duration
              }
              className={toastVariants({ tone: item.tone })}
              onOpenChange={(open) => {
                if (!open) dismiss(item.id);
              }}
            >
              <div className="flex min-w-0 grow flex-col gap-1">
                <ToastPrimitive.Title className="font-medium leading-tight tracking-tight">
                  {item.title}
                </ToastPrimitive.Title>
                {item.description ? (
                  <ToastPrimitive.Description className="leading-relaxed opacity-90 [&_p]:m-0 [&_p]:leading-relaxed">
                    {item.description}
                  </ToastPrimitive.Description>
                ) : null}
              </div>
              {item.action ? (
                <ToastPrimitive.Action
                  altText={
                    item.action.altText ??
                    (typeof item.action.label === "string"
                      ? item.action.label
                      : "Ação")
                  }
                  onClick={() => {
                    item.action?.onClick();
                  }}
                  className={cn(
                    "shrink-0 self-center rounded-sm px-2 py-1 text-xs font-semibold",
                    "cursor-pointer underline-offset-2 hover:underline",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1",
                  )}
                >
                  {item.action.label}
                </ToastPrimitive.Action>
              ) : null}
              <ToastPrimitive.Close
                aria-label="Fechar"
                className={cn(
                  "absolute right-2 top-2 inline-flex size-6 shrink-0 cursor-pointer items-center justify-center rounded-sm",
                  "text-current opacity-70 hover:opacity-100",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1",
                )}
              >
                <X aria-hidden="true" className="size-3.5" />
              </ToastPrimitive.Close>
            </ToastPrimitive.Root>
          );
        })}
        {hideViewport ? null : (
          <ToastViewport
            position={position}
            className={viewportClassName}
            data-toast-managed="auto"
          />
        )}
      </ToastPrimitive.Provider>
    </ToastContext.Provider>
  );
};
ToastProvider.displayName = "ToastProvider";

// ──────────────────────────────────────────────────────────────────
// useToast — imperative hook
// ──────────────────────────────────────────────────────────────────

function useToast(): ToastContextValue {
  const ctx = React.useContext(ToastContext);
  if (!ctx) {
    throw new Error(
      "useToast() must be used inside a <ToastProvider>. Wrap the consuming subtree in <ToastProvider> from @guardia/design-system.",
    );
  }
  return ctx;
}

// ──────────────────────────────────────────────────────────────────
// ToastViewport — declarative positioner
// ──────────────────────────────────────────────────────────────────

export interface ToastViewportProps
  extends Omit<
    React.ComponentPropsWithoutRef<typeof ToastPrimitive.Viewport>,
    "position"
  > {
  position?: ToastPosition;
}

const ToastViewport = React.forwardRef<
  React.ElementRef<typeof ToastPrimitive.Viewport>,
  ToastViewportProps
>(({ className, position = "bottom-right", ...props }, ref) => (
  <ToastPrimitive.Viewport
    ref={ref}
    className={cn(VIEWPORT_POSITION_CLASSES[position], "gap-3", className)}
    {...props}
  />
));
ToastViewport.displayName = "ToastViewport";

// ──────────────────────────────────────────────────────────────────
// Declarative primitives — re-exported for composition
// ──────────────────────────────────────────────────────────────────

export interface ToastRootProps
  extends React.ComponentPropsWithoutRef<typeof ToastPrimitive.Root>,
    VariantProps<typeof toastVariants> {}

const Toast = React.forwardRef<
  React.ElementRef<typeof ToastPrimitive.Root>,
  ToastRootProps
>(({ className, tone, ...props }, ref) => (
  <ToastPrimitive.Root
    ref={ref}
    className={cn(toastVariants({ tone }), className)}
    {...props}
  />
));
Toast.displayName = "Toast";

const ToastTitle = React.forwardRef<
  React.ElementRef<typeof ToastPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitive.Title>
>(({ className, ...props }, ref) => (
  <ToastPrimitive.Title
    ref={ref}
    className={cn(
      "font-medium leading-tight tracking-tight",
      className,
    )}
    {...props}
  />
));
ToastTitle.displayName = "ToastTitle";

const ToastDescription = React.forwardRef<
  React.ElementRef<typeof ToastPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitive.Description>
>(({ className, ...props }, ref) => (
  <ToastPrimitive.Description
    ref={ref}
    className={cn(
      "leading-relaxed opacity-90 [&_p]:m-0 [&_p]:leading-relaxed",
      className,
    )}
    {...props}
  />
));
ToastDescription.displayName = "ToastDescription";

const ToastActionPrimitive = React.forwardRef<
  React.ElementRef<typeof ToastPrimitive.Action>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitive.Action>
>(({ className, ...props }, ref) => (
  <ToastPrimitive.Action
    ref={ref}
    className={cn(
      "shrink-0 self-center rounded-sm px-2 py-1 text-xs font-semibold",
      "cursor-pointer underline-offset-2 hover:underline",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1",
      className,
    )}
    {...props}
  />
));
ToastActionPrimitive.displayName = "ToastAction";

const ToastClose = React.forwardRef<
  React.ElementRef<typeof ToastPrimitive.Close>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitive.Close>
>(({ className, "aria-label": ariaLabel = "Fechar", ...props }, ref) => (
  <ToastPrimitive.Close
    ref={ref}
    aria-label={ariaLabel}
    className={cn(
      "absolute right-2 top-2 inline-flex size-6 shrink-0 cursor-pointer items-center justify-center rounded-sm",
      "text-current opacity-70 hover:opacity-100",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1",
      className,
    )}
    {...props}
  >
    <X aria-hidden="true" className="size-3.5" />
  </ToastPrimitive.Close>
));
ToastClose.displayName = "ToastClose";

// ──────────────────────────────────────────────────────────────────
// Exports
// ──────────────────────────────────────────────────────────────────

export {
  Toast,
  ToastProvider,
  ToastViewport,
  ToastTitle,
  ToastDescription,
  ToastActionPrimitive as ToastAction,
  ToastClose,
  useToast,
  toastVariants,
};
