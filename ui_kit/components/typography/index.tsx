import * as React from "react";
import type { JSX } from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "../../lib/utils";

const typographyVariants = cva("", {
    variants: {
        variant: {
            h1: "scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl",
            h2: "scroll-m-20 text-3xl font-semibold tracking-tight",
            h3: "scroll-m-20 text-2xl font-semibold tracking-tight",
            h4: "scroll-m-20 text-xl font-semibold tracking-tight",
            h5: "scroll-m-20 text-lg font-semibold tracking-tight",
            h6: "scroll-m-20 text-base font-semibold tracking-tight",
            p: "leading-7 [&:not(:first-child)]:mt-6",
            blockquote: "mt-6 border-l-2 pl-6 italic",
            list: "my-6 ml-6 list-disc [&>li]:mt-2",
            lead: "text-xl text-muted-foreground",
            large: "text-lg font-semibold",
            small: "text-sm font-medium leading-none",
            muted: "text-sm text-muted-foreground",
            code: "relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold",
        },
        color: {
            default: "text-foreground",
            muted: "text-muted-foreground",
            primary: "text-primary",
            secondary: "text-secondary-foreground",
            accent: "text-accent-foreground",
            destructive: "text-destructive",
            brand: "text-brand-purple",
            surface: "text-surface-fg",
        },
    },
    defaultVariants: {
        variant: "p",
        color: "default",
    },
});

export interface TypographyProps
    extends Omit<React.HTMLAttributes<HTMLElement>, 'color'>,
    VariantProps<typeof typographyVariants> {
    as?: keyof JSX.IntrinsicElements;
}

const Typography = React.forwardRef<HTMLElement, TypographyProps>(
    ({ className, variant, color, as, ...props }, ref) => {
        const Comp = as || getDefaultElement(variant) || "p";

        return React.createElement(Comp, {
            className: cn(typographyVariants({ variant, color }), className),
            ref,
            ...props,
        });
    }
);

Typography.displayName = "Typography";

function getDefaultElement(variant: TypographyProps['variant']): keyof JSX.IntrinsicElements {
    switch (variant) {
        case "h1":
            return "h1";
        case "h2":
            return "h2";
        case "h3":
            return "h3";
        case "h4":
            return "h4";
        case "h5":
            return "h5";
        case "h6":
            return "h6";
        case "blockquote":
            return "blockquote";
        case "list":
            return "ul";
        case "code":
            return "code";
        default:
            return "p";
    }
}

const H1 = React.forwardRef<HTMLHeadingElement, Omit<TypographyProps, "variant">>(
    ({ className, ...props }, ref) => (
        <Typography
            variant="h1"
            className={className}
            ref={ref as React.Ref<HTMLElement>}
            {...props}
        />
    )
);
H1.displayName = "H1";

const H2 = React.forwardRef<HTMLHeadingElement, Omit<TypographyProps, "variant">>(
    ({ className, ...props }, ref) => (
        <Typography
            variant="h2"
            className={className}
            ref={ref as React.Ref<HTMLElement>}
            {...props}
        />
    )
);
H2.displayName = "H2";

const H3 = React.forwardRef<HTMLHeadingElement, Omit<TypographyProps, "variant">>(
    ({ className, ...props }, ref) => (
        <Typography
            variant="h3"
            className={className}
            ref={ref as React.Ref<HTMLElement>}
            {...props}
        />
    )
);
H3.displayName = "H3";

const H4 = React.forwardRef<HTMLHeadingElement, Omit<TypographyProps, "variant">>(
    ({ className, ...props }, ref) => (
        <Typography
            variant="h4"
            className={className}
            ref={ref as React.Ref<HTMLElement>}
            {...props}
        />
    )
);
H4.displayName = "H4";

const H5 = React.forwardRef<HTMLHeadingElement, Omit<TypographyProps, "variant">>(
    ({ className, ...props }, ref) => (
        <Typography
            variant="h5"
            className={className}
            ref={ref as React.Ref<HTMLElement>}
            {...props}
        />
    )
);
H5.displayName = "H5";

const H6 = React.forwardRef<HTMLHeadingElement, Omit<TypographyProps, "variant">>(
    ({ className, ...props }, ref) => (
        <Typography
            variant="h6"
            className={className}
            ref={ref as React.Ref<HTMLElement>}
            {...props}
        />
    )
);
H6.displayName = "H6";

const P = React.forwardRef<HTMLParagraphElement, Omit<TypographyProps, "variant">>(
    ({ className, ...props }, ref) => (
        <Typography
            variant="p"
            className={className}
            ref={ref as React.Ref<HTMLElement>}
            {...props}
        />
    )
);
P.displayName = "P";

const Lead = React.forwardRef<HTMLParagraphElement, Omit<TypographyProps, "variant">>(
    ({ className, ...props }, ref) => (
        <Typography
            variant="lead"
            className={className}
            ref={ref as React.Ref<HTMLElement>}
            {...props}
        />
    )
);
Lead.displayName = "Lead";

const Large = React.forwardRef<HTMLElement, Omit<TypographyProps, "variant">>(
    ({ className, ...props }, ref) => (
        <Typography
            variant="large"
            className={className}
            ref={ref as React.Ref<HTMLElement>}
            {...props}
        />
    )
);
Large.displayName = "Large";

const Small = React.forwardRef<HTMLElement, Omit<TypographyProps, "variant">>(
    ({ className, ...props }, ref) => (
        <Typography
            variant="small"
            className={className}
            ref={ref as React.Ref<HTMLElement>}
            {...props}
        />
    )
);
Small.displayName = "Small";

const Muted = React.forwardRef<HTMLElement, Omit<TypographyProps, "variant">>(
    ({ className, ...props }, ref) => (
        <Typography
            variant="muted"
            className={className}
            ref={ref as React.Ref<HTMLElement>}
            {...props}
        />
    )
);
Muted.displayName = "Muted";

const Code = React.forwardRef<HTMLElement, Omit<TypographyProps, "variant">>(
    ({ className, ...props }, ref) => (
        <Typography
            variant="code"
            className={className}
            ref={ref as React.Ref<HTMLElement>}
            {...props}
        />
    )
);
Code.displayName = "Code";

const Blockquote = React.forwardRef<HTMLQuoteElement, Omit<TypographyProps, "variant">>(
    ({ className, ...props }, ref) => (
        <Typography
            variant="blockquote"
            className={className}
            ref={ref as React.Ref<HTMLElement>}
            {...props}
        />
    )
);
Blockquote.displayName = "Blockquote";

const List = React.forwardRef<HTMLUListElement, Omit<TypographyProps, "variant">>(
    ({ className, ...props }, ref) => (
        <Typography
            variant="list"
            className={className}
            ref={ref as React.Ref<HTMLElement>}
            {...props}
        />
    )
);
List.displayName = "List";

// Link component with design system styles
interface LinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
    variant?: "default" | "muted";
}

const Link = React.forwardRef<HTMLAnchorElement, LinkProps>(
    ({ className, variant = "default", ...props }, ref) => (
        <a
            ref={ref}
            className={cn(
                "ds-link",
                variant === "muted" && "text-muted-foreground",
                className
            )}
            {...props}
        />
    )
);
Link.displayName = "Link";

const PageTitle = React.forwardRef<HTMLHeadingElement, Omit<TypographyProps, "variant">>(
    ({ className, ...props }, ref) => (
        <Typography
            variant="h4"
            className={className}
            ref={ref as React.Ref<HTMLElement>}
            {...props}
        />
    )
);
PageTitle.displayName = "PageTitle";

export {
    Typography,
    H1,
    H2,
    H3,
    H4,
    H5,
    H6,
    P,
    Lead,
    Large,
    Small,
    Muted,
    Code,
    Blockquote,
    List,
    Link,
    PageTitle,
    typographyVariants
};
