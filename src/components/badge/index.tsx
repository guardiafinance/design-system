import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
    "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
    {
        variants: {
            variant: {
                default:
                    "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
                secondary:
                    "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
                destructive:
                    "border-transparent bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100 hover:bg-red-200 dark:hover:bg-red-800",
                success:
                    "border-transparent bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100 hover:bg-green-200 dark:hover:bg-green-800",
                delivered:
                    "border-transparent bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100 hover:bg-green-200 dark:hover:bg-green-800",
                canceled:
                    "border-transparent bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100 hover:bg-red-200 dark:hover:bg-red-800",
                pending:
                    "border-transparent bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100 hover:bg-blue-200 dark:hover:bg-blue-800",
                accent:
                    "border-transparent bg-accent text-accent-foreground hover:bg-accent/80",
                muted:
                    "border-transparent bg-muted text-muted-foreground hover:bg-muted/80",
                outline:
                    "bg-transparent text-foreground border-foreground/30 hover:bg-muted/60",
            },
        },
        defaultVariants: {
            variant: "default",
        },
    }
)

export interface BadgeProps
    extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
    icon?: React.ReactNode
    iconPosition?: "left" | "right"
}

function Badge({ className, variant, icon, iconPosition = "left", children, ...props }: BadgeProps) {
    return (
        <div className={cn("gap-1.5", badgeVariants({ variant }), className)} {...props}>
            {icon && iconPosition === "left" ? (
                <span aria-hidden className="inline-flex items-center">
                    {icon}
                </span>
            ) : null}
            {children}
            {icon && iconPosition === "right" ? (
                <span aria-hidden className="inline-flex items-center">
                    {icon}
                </span>
            ) : null}
        </div>
    )
}

export { Badge, badgeVariants }
