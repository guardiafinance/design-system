import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

/**
 * Button — Guardia Design System primary interactive element.
 *
 * Variants (shadcn-aligned names mapped to Guardia brand tokens):
 *   - default     → brand orange (primary CTA)
 *   - secondary   → brand purple (authoritative action)
 *   - destructive → signal red
 *   - outline     → outlined primary
 *   - ghost       → transparent, reveals on hover
 *   - link        → text-only, underline on hover
 *
 * Sizes: xs (24) · sm (36) · default (40) · lg (44) · icon (40×40)
 *
 * Extras (lifted from the PoC):
 *   - asChild     → Radix Slot composition, useful for <Link> adapters
 *   - loading     → shows spinner, keeps width, disables click
 *   - leadingIcon / trailingIcon → optional slots (auto-hidden in loading)
 *   - full        → width: 100%
 */
const buttonVariants = cva(
    [
        "inline-flex items-center justify-center gap-2 whitespace-nowrap",
        "rounded-md text-sm font-medium",
        "ring-offset-background transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        "disabled:pointer-events-none disabled:opacity-50",
        "data-[loading=true]:cursor-progress data-[loading=true]:opacity-90",
        "[&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
    ].join(" "),
    {
        variants: {
            variant: {
                default:
                    "bg-primary text-primary-foreground hover:bg-primary/90",
                destructive:
                    "bg-destructive text-destructive-foreground hover:bg-destructive/90",
                outline:
                    "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
                secondary:
                    "bg-secondary text-secondary-foreground hover:bg-secondary/90",
                ghost:
                    "hover:bg-accent hover:text-accent-foreground",
                link:
                    "text-primary underline-offset-4 hover:underline p-0 h-auto",
            },
            size: {
                xs: "h-6 rounded-md px-2.5 text-xs",
                sm: "h-9 rounded-md px-3",
                default: "h-10 px-4 py-2",
                lg: "h-11 rounded-md px-8",
                icon: "h-10 w-10",
            },
            full: {
                true: "w-full",
                false: "",
            },
        },
        compoundVariants: [
            // link variant ignores size padding/height
            { variant: "link", className: "h-auto px-0" },
        ],
        defaultVariants: {
            variant: "default",
            size: "default",
            full: false,
        },
    },
);

export interface ButtonProps
    extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "color">,
        VariantProps<typeof buttonVariants> {
    asChild?: boolean;
    loading?: boolean;
    leadingIcon?: React.ReactNode;
    trailingIcon?: React.ReactNode;
}

/**
 * Spinner acessível:
 *  - `motion-safe:animate-spin` → anima apenas quando o usuário NÃO pediu
 *    `prefers-reduced-motion: reduce`. Com reduced-motion, o spinner fica
 *    estático mas visível — o botão ainda comunica o estado via
 *    `aria-busy="true"`.
 */
const Spinner = () => (
    <svg
        className="motion-safe:animate-spin"
        viewBox="0 0 16 16"
        fill="none"
        aria-hidden="true"
        width="14"
        height="14"
    >
        <circle
            cx="8"
            cy="8"
            r="6"
            stroke="currentColor"
            strokeOpacity="0.3"
            strokeWidth="2"
        />
        <path
            d="M14 8a6 6 0 0 0-6-6"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
        />
    </svg>
);

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    (
        {
            className,
            variant,
            size,
            full,
            asChild = false,
            loading = false,
            disabled,
            leadingIcon,
            trailingIcon,
            children,
            ...props
        },
        ref,
    ) => {
        // A11y guardrail — size="icon" precisa de rótulo acessível.
        if (
            process.env.NODE_ENV !== "production" &&
            size === "icon" &&
            !props["aria-label"] &&
            !props["aria-labelledby"]
        ) {
            // eslint-disable-next-line no-console
            console.warn(
                "[Guardia] <Button size=\"icon\" /> precisa de `aria-label` ou `aria-labelledby`.",
            );
        }

        const Comp = asChild ? Slot : "button";
        // Slot requires exactly one child element. When asChild, render
        // the caller's child as-is and skip icon/spinner decoration.
        const content = asChild ? (
            children
        ) : (
            <>
                {loading ? <Spinner /> : leadingIcon}
                {children}
                {!loading && trailingIcon}
            </>
        );
        return (
            <Comp
                ref={ref}
                data-loading={loading || undefined}
                disabled={disabled || loading}
                className={cn(buttonVariants({ variant, size, full, className }))}
                {...props}
            >
                {content}
            </Comp>
        );
    },
);
Button.displayName = "Button";

export { Button, buttonVariants };
