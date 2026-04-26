import * as React from "react"
import * as SelectPrimitive from "@radix-ui/react-select"
import { ChevronDown, ChevronUp } from "lucide-react"

import { cn } from "@/lib/utils"

const StylizedSelect = SelectPrimitive.Root

const StylizedSelectGroup = SelectPrimitive.Group

const StylizedSelectValue = SelectPrimitive.Value

export interface StylizedSelectTriggerProps extends React.ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger> {
    label?: string;
}

const StylizedSelectTrigger = React.forwardRef<
    React.ElementRef<typeof SelectPrimitive.Trigger>,
    StylizedSelectTriggerProps
>(({ className, children, label, ...props }, ref) => (
    <SelectPrimitive.Trigger
        ref={ref}
        className={cn(
            "stylized-select-trigger flex h-7 w-full items-center justify-start rounded-full border-0 bg-muted px-3 py-1 text-xs font-semibold text-foreground ring-offset-background transition-colors duration-200 data-[placeholder]:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1 hover:bg-muted/80",
            className
        )}
        {...props}
    >
        <div className="flex items-center gap-2 flex-1">
            {label && <span className="text-foreground">{label}:</span>}
            <div className="flex-1 text-left">
                {children}
            </div>
        </div>
        <SelectPrimitive.Icon asChild>
            <ChevronDown className="h-3 w-3 opacity-60 transition-transform duration-200 group-data-[state=open]:rotate-180" />
        </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
))
StylizedSelectTrigger.displayName = SelectPrimitive.Trigger.displayName

const StylizedSelectScrollUpButton = React.forwardRef<
    React.ElementRef<typeof SelectPrimitive.ScrollUpButton>,
    React.ComponentPropsWithoutRef<typeof SelectPrimitive.ScrollUpButton>
>(({ className, ...props }, ref) => (
    <SelectPrimitive.ScrollUpButton
        ref={ref}
        className={cn(
            "flex cursor-default items-center justify-center py-1",
            className
        )}
        {...props}
    >
        <ChevronUp className="h-4 w-4" />
    </SelectPrimitive.ScrollUpButton>
))
StylizedSelectScrollUpButton.displayName = SelectPrimitive.ScrollUpButton.displayName

const StylizedSelectScrollDownButton = React.forwardRef<
    React.ElementRef<typeof SelectPrimitive.ScrollDownButton>,
    React.ComponentPropsWithoutRef<typeof SelectPrimitive.ScrollDownButton>
>(({ className, ...props }, ref) => (
    <SelectPrimitive.ScrollDownButton
        ref={ref}
        className={cn(
            "flex cursor-default items-center justify-center py-1",
            className
        )}
        {...props}
    >
        <ChevronDown className="h-4 w-4" />
    </SelectPrimitive.ScrollDownButton>
))
StylizedSelectScrollDownButton.displayName = SelectPrimitive.ScrollDownButton.displayName

const StylizedSelectContent = React.forwardRef<
    React.ElementRef<typeof SelectPrimitive.Content>,
    React.ComponentPropsWithoutRef<typeof SelectPrimitive.Content>
>(({ className, children, position = "popper", ...props }, ref) => (
    <SelectPrimitive.Portal>
        <SelectPrimitive.Content
            ref={ref}
            className={cn(
                "relative z-50 max-h-[--radix-select-content-available-height] min-w-[12rem] overflow-y-auto overflow-x-hidden rounded-xl border bg-popover text-popover-foreground shadow-lg data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 origin-[--radix-select-content-transform-origin]",
                position === "popper" &&
                "data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1",
                className
            )}
            position={position}
            {...props}
        >
            <StylizedSelectScrollUpButton />
            <SelectPrimitive.Viewport
                className={cn(
                    "p-2",
                    position === "popper" &&
                    "h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)]"
                )}
            >
                {children}
            </SelectPrimitive.Viewport>
            <StylizedSelectScrollDownButton />
        </SelectPrimitive.Content>
    </SelectPrimitive.Portal>
))
StylizedSelectContent.displayName = SelectPrimitive.Content.displayName

const StylizedSelectLabel = React.forwardRef<
    React.ElementRef<typeof SelectPrimitive.Label>,
    React.ComponentPropsWithoutRef<typeof SelectPrimitive.Label>
>(({ className, ...props }, ref) => (
    <SelectPrimitive.Label
        ref={ref}
        className={cn("py-2 pl-3 pr-2 text-sm font-semibold text-muted-foreground", className)}
        {...props}
    />
))
StylizedSelectLabel.displayName = SelectPrimitive.Label.displayName

const StylizedSelectItem = React.forwardRef<
    React.ElementRef<typeof SelectPrimitive.Item>,
    React.ComponentPropsWithoutRef<typeof SelectPrimitive.Item>
>(({ className, children, ...props }, ref) => (
    <SelectPrimitive.Item
        ref={ref}
        className={cn(
            "relative flex w-full cursor-default select-none items-center rounded-lg py-2.5 pl-3 pr-3 text-sm text-left outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 hover:bg-accent/50",
            className
        )}
        {...props}
    >
        <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
    </SelectPrimitive.Item>
))
StylizedSelectItem.displayName = SelectPrimitive.Item.displayName

const StylizedSelectSeparator = React.forwardRef<
    React.ElementRef<typeof SelectPrimitive.Separator>,
    React.ComponentPropsWithoutRef<typeof SelectPrimitive.Separator>
>(({ className, ...props }, ref) => (
    <SelectPrimitive.Separator
        ref={ref}
        className={cn("-mx-1 my-1 h-px bg-muted", className)}
        {...props}
    />
))
StylizedSelectSeparator.displayName = SelectPrimitive.Separator.displayName

export {
    StylizedSelect,
    StylizedSelectGroup,
    StylizedSelectValue,
    StylizedSelectTrigger,
    StylizedSelectContent,
    StylizedSelectLabel,
    StylizedSelectItem,
    StylizedSelectSeparator,
    StylizedSelectScrollUpButton,
    StylizedSelectScrollDownButton,
}
