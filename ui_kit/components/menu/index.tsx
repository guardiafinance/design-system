"use client";

import * as React from "react";
import * as DropdownPrimitive from "@radix-ui/react-dropdown-menu";
import * as ContextPrimitive from "@radix-ui/react-context-menu";
import { Check, ChevronRight, Circle } from "lucide-react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

/**
 * Menu — canonical Overlays primitive consolidating the legacy
 * `dropdown-menu/` and `context-menu/` wrappers under a single API,
 * mode-driven via the `<Menu mode>` prop.
 *
 * Base:
 *   - mode="dropdown" (default) → @radix-ui/react-dropdown-menu
 *   - mode="context"            → @radix-ui/react-context-menu
 *   Same CVA token contract across modes (matches Popover post-ADR-005):
 *   `border-border-strong`, `bg-background`, `text-fg`, `ring-ring`,
 *   `shadow-md|lg`, `rounded-md|lg`, plus Radix data-state animations.
 *
 * Public surface (15 components + 1 CVA accessor + 3 types):
 *   Menu, MenuTrigger, MenuPortal, MenuContent,
 *   MenuItem, MenuCheckboxItem, MenuRadioItem, MenuRadioGroup,
 *   MenuGroup, MenuLabel, MenuSeparator, MenuShortcut,
 *   MenuSub, MenuSubTrigger, MenuSubContent
 *   menuContentVariants
 *   MenuContentSize, MenuContentProps, MenuMode
 *
 * Decisions registered in
 * `docs/adr/ADR-006-menu-consolidation-and-api-shape.md`.
 */

// ──────────────────────────────────────────────────────────────────
// Internal mode-context — selects which Radix primitive family each
// sibling component renders. Defaults to "dropdown" so that a
// `<MenuContent>` rendered outside `<Menu>` still composes safely
// (Radix's own Root invariant catches the misuse with a clear error).
// ──────────────────────────────────────────────────────────────────

export type MenuMode = "dropdown" | "context";

const MenuModeContext = React.createContext<MenuMode>("dropdown");

function useMenuMode(): MenuMode {
  return React.useContext(MenuModeContext);
}

// ──────────────────────────────────────────────────────────────────
// Root — Menu
// ──────────────────────────────────────────────────────────────────

interface MenuRootProps {
  mode?: MenuMode;
  children?: React.ReactNode;
}

type DropdownRootProps = React.ComponentPropsWithoutRef<typeof DropdownPrimitive.Root>;
type ContextRootProps = React.ComponentPropsWithoutRef<typeof ContextPrimitive.Root>;

/**
 * `<Menu>` selects the underlying Radix primitive family via `mode`
 * and forwards all other Radix Root props verbatim. The internal
 * `MenuModeContext` provider makes the mode available to every
 * descendant `MenuX` component so they call the matching Radix
 * primitive at render time.
 *
 * `mode="dropdown"` Root props: open, defaultOpen, onOpenChange, modal, dir.
 * `mode="context"` Root props: onOpenChange, modal, dir. (No open/defaultOpen
 * because right-click-triggered menus are uncontrolled by definition.)
 */
function Menu({
  mode = "dropdown",
  children,
  ...rest
}: MenuRootProps & (DropdownRootProps | ContextRootProps)) {
  return (
    <MenuModeContext.Provider value={mode}>
      {mode === "context" ? (
        <ContextPrimitive.Root {...(rest as ContextRootProps)}>
          {children}
        </ContextPrimitive.Root>
      ) : (
        <DropdownPrimitive.Root {...(rest as DropdownRootProps)}>
          {children}
        </DropdownPrimitive.Root>
      )}
    </MenuModeContext.Provider>
  );
}
Menu.displayName = "Menu";

// ──────────────────────────────────────────────────────────────────
// CVA — content variants shared across modes
// ──────────────────────────────────────────────────────────────────

/**
 * CVA accessor exported for consumers that want to compose variants
 * (e.g. wrap `MenuContent` in a higher-order product component).
 * Outer padding is tighter than Popover (`p-1`/`p-1.5`/`p-2`) because
 * each `MenuItem` already carries `py-1.5 px-2` — doubling the gutter
 * at the container level would produce an oversized menu shell.
 */
const menuContentVariants = cva(
  [
    // Layout base
    "z-50 min-w-[8rem] outline-none overflow-hidden",
    "border border-border-strong",
    "bg-background text-fg",
    // Focus ring when content receives keyboard focus
    "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
    // Radix data-state-driven animation utilities (matches Popover/Combobox)
    "data-[state=open]:animate-in data-[state=closed]:animate-out",
    "data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0",
    "data-[state=open]:zoom-in-95 data-[state=closed]:zoom-out-95",
    "data-[side=bottom]:slide-in-from-top-2",
    "data-[side=left]:slide-in-from-right-2",
    "data-[side=right]:slide-in-from-left-2",
    "data-[side=top]:slide-in-from-bottom-2",
  ].join(" "),
  {
    variants: {
      size: {
        sm: "p-1 text-[13px] rounded-md shadow-md",
        md: "p-1.5 text-sm rounded-md shadow-lg",
        lg: "p-2 text-[15px] rounded-lg shadow-lg",
      },
    },
    defaultVariants: { size: "md" },
  },
);

export type MenuContentSize = NonNullable<
  VariantProps<typeof menuContentVariants>["size"]
>;

// ──────────────────────────────────────────────────────────────────
// Item variants — destructive boolean + inset boolean
// ──────────────────────────────────────────────────────────────────

const menuItemVariants = cva(
  [
    "relative flex cursor-default select-none items-center gap-2",
    "rounded-sm px-2 py-1.5 text-sm outline-none transition-colors",
    "focus:bg-accent focus:text-accent-foreground",
    "data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
    "[&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  ].join(" "),
  {
    variants: {
      destructive: {
        true: "text-destructive focus:bg-destructive/10 focus:text-destructive",
        false: "",
      },
      inset: {
        true: "pl-8",
        false: "",
      },
    },
    defaultVariants: { destructive: false, inset: false },
  },
);

// ──────────────────────────────────────────────────────────────────
// Trigger / Portal — mode-switched passthroughs
// ──────────────────────────────────────────────────────────────────

const MenuTrigger = React.forwardRef<
  React.ElementRef<typeof DropdownPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof DropdownPrimitive.Trigger>
>((props, ref) => {
  const mode = useMenuMode();
  if (mode === "context") {
    return (
      <ContextPrimitive.Trigger
        ref={ref as React.Ref<React.ElementRef<typeof ContextPrimitive.Trigger>>}
        {...(props as unknown as React.ComponentPropsWithoutRef<
          typeof ContextPrimitive.Trigger
        >)}
      />
    );
  }
  return <DropdownPrimitive.Trigger ref={ref} {...props} />;
});
MenuTrigger.displayName = "MenuTrigger";

const MenuPortal = ({
  children,
  ...props
}: React.ComponentPropsWithoutRef<typeof DropdownPrimitive.Portal>) => {
  const mode = useMenuMode();
  if (mode === "context") {
    return (
      <ContextPrimitive.Portal
        {...(props as unknown as React.ComponentPropsWithoutRef<
          typeof ContextPrimitive.Portal
        >)}
      >
        {children}
      </ContextPrimitive.Portal>
    );
  }
  return <DropdownPrimitive.Portal {...props}>{children}</DropdownPrimitive.Portal>;
};
MenuPortal.displayName = "MenuPortal";

// ──────────────────────────────────────────────────────────────────
// Group / RadioGroup / Sub — mode-switched passthroughs
// ──────────────────────────────────────────────────────────────────

const MenuGroup: React.FC<
  React.ComponentPropsWithoutRef<typeof DropdownPrimitive.Group>
> = (props) => {
  const mode = useMenuMode();
  if (mode === "context") {
    return (
      <ContextPrimitive.Group
        {...(props as unknown as React.ComponentPropsWithoutRef<
          typeof ContextPrimitive.Group
        >)}
      />
    );
  }
  return <DropdownPrimitive.Group {...props} />;
};
MenuGroup.displayName = "MenuGroup";

const MenuRadioGroup: React.FC<
  React.ComponentPropsWithoutRef<typeof DropdownPrimitive.RadioGroup>
> = (props) => {
  const mode = useMenuMode();
  if (mode === "context") {
    return (
      <ContextPrimitive.RadioGroup
        {...(props as unknown as React.ComponentPropsWithoutRef<
          typeof ContextPrimitive.RadioGroup
        >)}
      />
    );
  }
  return <DropdownPrimitive.RadioGroup {...props} />;
};
MenuRadioGroup.displayName = "MenuRadioGroup";

const MenuSub: React.FC<
  React.ComponentPropsWithoutRef<typeof DropdownPrimitive.Sub>
> = (props) => {
  const mode = useMenuMode();
  if (mode === "context") {
    return (
      <ContextPrimitive.Sub
        {...(props as unknown as React.ComponentPropsWithoutRef<
          typeof ContextPrimitive.Sub
        >)}
      />
    );
  }
  return <DropdownPrimitive.Sub {...props} />;
};
MenuSub.displayName = "MenuSub";

// ──────────────────────────────────────────────────────────────────
// MenuContent — CVA token contract + width override + mode-switched
// ──────────────────────────────────────────────────────────────────

export interface MenuContentProps
  extends Omit<
      React.ComponentPropsWithoutRef<typeof DropdownPrimitive.Content>,
      "asChild"
    >,
    VariantProps<typeof menuContentVariants> {
  /**
   * Fixed width for the content. When omitted, content uses Radix's
   * `min-w-[8rem]` baseline. Numbers become `${n}px`; strings are
   * forwarded verbatim as CSS width.
   */
  width?: number | string;
}

const MenuContent = React.forwardRef<
  React.ElementRef<typeof DropdownPrimitive.Content>,
  MenuContentProps
>(
  (
    {
      className,
      align = "start",
      sideOffset = 4,
      size = "md",
      width,
      style,
      ...props
    },
    ref,
  ) => {
    const mode = useMenuMode();
    const widthStyle: React.CSSProperties | undefined =
      width !== undefined
        ? { ...style, width: typeof width === "number" ? `${width}px` : width }
        : style;

    const merged = cn(menuContentVariants({ size }), className);

    if (mode === "context") {
      // Context-menu Content does NOT accept `side` / `sideOffset` / `align`
      // — Radix Context positions the menu at the cursor. Pass the rest of
      // the props verbatim (Radix ignores unknown keys at runtime); the
      // cast narrows the TS type to the context branch's prop shape.
      const ctxProps =
        props as unknown as React.ComponentPropsWithoutRef<
          typeof ContextPrimitive.Content
        >;
      return (
        <ContextPrimitive.Portal>
          <ContextPrimitive.Content
            ref={ref as React.Ref<React.ElementRef<typeof ContextPrimitive.Content>>}
            style={widthStyle}
            className={merged}
            {...ctxProps}
          />
        </ContextPrimitive.Portal>
      );
    }

    return (
      <DropdownPrimitive.Portal>
        <DropdownPrimitive.Content
          ref={ref}
          align={align}
          sideOffset={sideOffset}
          style={widthStyle}
          className={merged}
          {...props}
        />
      </DropdownPrimitive.Portal>
    );
  },
);
MenuContent.displayName = "MenuContent";

// ──────────────────────────────────────────────────────────────────
// Item / CheckboxItem / RadioItem / SubTrigger / SubContent
// ──────────────────────────────────────────────────────────────────

export interface MenuItemProps
  extends Omit<
      React.ComponentPropsWithoutRef<typeof DropdownPrimitive.Item>,
      "asChild"
    > {
  inset?: boolean;
  /** When true, renders the item with the destructive token (signal-red). */
  destructive?: boolean;
}

const MenuItem = React.forwardRef<
  React.ElementRef<typeof DropdownPrimitive.Item>,
  MenuItemProps
>(({ className, inset, destructive, ...props }, ref) => {
  const mode = useMenuMode();
  const merged = cn(menuItemVariants({ destructive, inset }), className);
  if (mode === "context") {
    return (
      <ContextPrimitive.Item
        ref={ref as React.Ref<React.ElementRef<typeof ContextPrimitive.Item>>}
        className={merged}
        {...(props as unknown as React.ComponentPropsWithoutRef<
          typeof ContextPrimitive.Item
        >)}
      />
    );
  }
  return <DropdownPrimitive.Item ref={ref} className={merged} {...props} />;
});
MenuItem.displayName = "MenuItem";

const MenuCheckboxItem = React.forwardRef<
  React.ElementRef<typeof DropdownPrimitive.CheckboxItem>,
  React.ComponentPropsWithoutRef<typeof DropdownPrimitive.CheckboxItem>
>(({ className, children, checked, ...props }, ref) => {
  const mode = useMenuMode();
  const merged = cn(
    "relative flex cursor-default select-none items-center gap-2",
    "rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none transition-colors",
    "focus:bg-accent focus:text-accent-foreground",
    "data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
    className,
  );
  if (mode === "context") {
    return (
      <ContextPrimitive.CheckboxItem
        ref={
          ref as React.Ref<
            React.ElementRef<typeof ContextPrimitive.CheckboxItem>
          >
        }
        checked={checked}
        className={merged}
        {...(props as unknown as React.ComponentPropsWithoutRef<
          typeof ContextPrimitive.CheckboxItem
        >)}
      >
        <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
          <ContextPrimitive.ItemIndicator>
            <Check className="h-4 w-4" />
          </ContextPrimitive.ItemIndicator>
        </span>
        {children}
      </ContextPrimitive.CheckboxItem>
    );
  }
  return (
    <DropdownPrimitive.CheckboxItem
      ref={ref}
      checked={checked}
      className={merged}
      {...props}
    >
      <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
        <DropdownPrimitive.ItemIndicator>
          <Check className="h-4 w-4" />
        </DropdownPrimitive.ItemIndicator>
      </span>
      {children}
    </DropdownPrimitive.CheckboxItem>
  );
});
MenuCheckboxItem.displayName = "MenuCheckboxItem";

const MenuRadioItem = React.forwardRef<
  React.ElementRef<typeof DropdownPrimitive.RadioItem>,
  React.ComponentPropsWithoutRef<typeof DropdownPrimitive.RadioItem>
>(({ className, children, ...props }, ref) => {
  const mode = useMenuMode();
  const merged = cn(
    "relative flex cursor-default select-none items-center gap-2",
    "rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none transition-colors",
    "focus:bg-accent focus:text-accent-foreground",
    "data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
    className,
  );
  if (mode === "context") {
    return (
      <ContextPrimitive.RadioItem
        ref={
          ref as React.Ref<React.ElementRef<typeof ContextPrimitive.RadioItem>>
        }
        className={merged}
        {...(props as unknown as React.ComponentPropsWithoutRef<
          typeof ContextPrimitive.RadioItem
        >)}
      >
        <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
          <ContextPrimitive.ItemIndicator>
            <Circle className="h-2 w-2 fill-current" />
          </ContextPrimitive.ItemIndicator>
        </span>
        {children}
      </ContextPrimitive.RadioItem>
    );
  }
  return (
    <DropdownPrimitive.RadioItem ref={ref} className={merged} {...props}>
      <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
        <DropdownPrimitive.ItemIndicator>
          <Circle className="h-2 w-2 fill-current" />
        </DropdownPrimitive.ItemIndicator>
      </span>
      {children}
    </DropdownPrimitive.RadioItem>
  );
});
MenuRadioItem.displayName = "MenuRadioItem";

const MenuSubTrigger = React.forwardRef<
  React.ElementRef<typeof DropdownPrimitive.SubTrigger>,
  React.ComponentPropsWithoutRef<typeof DropdownPrimitive.SubTrigger> & {
    inset?: boolean;
  }
>(({ className, inset, children, ...props }, ref) => {
  const mode = useMenuMode();
  const merged = cn(
    "flex cursor-default select-none items-center gap-2",
    "rounded-sm px-2 py-1.5 text-sm outline-none",
    "focus:bg-accent focus:text-accent-foreground",
    "data-[state=open]:bg-accent data-[state=open]:text-accent-foreground",
    "[&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
    inset && "pl-8",
    className,
  );
  if (mode === "context") {
    return (
      <ContextPrimitive.SubTrigger
        ref={
          ref as React.Ref<
            React.ElementRef<typeof ContextPrimitive.SubTrigger>
          >
        }
        className={merged}
        {...(props as unknown as React.ComponentPropsWithoutRef<
          typeof ContextPrimitive.SubTrigger
        >)}
      >
        {children}
        <ChevronRight className="ml-auto" />
      </ContextPrimitive.SubTrigger>
    );
  }
  return (
    <DropdownPrimitive.SubTrigger ref={ref} className={merged} {...props}>
      {children}
      <ChevronRight className="ml-auto" />
    </DropdownPrimitive.SubTrigger>
  );
});
MenuSubTrigger.displayName = "MenuSubTrigger";

const MenuSubContent = React.forwardRef<
  React.ElementRef<typeof DropdownPrimitive.SubContent>,
  React.ComponentPropsWithoutRef<typeof DropdownPrimitive.SubContent>
>(({ className, ...props }, ref) => {
  const mode = useMenuMode();
  const merged = cn(
    menuContentVariants({ size: "md" }),
    "min-w-[8rem]",
    className,
  );
  if (mode === "context") {
    return (
      <ContextPrimitive.SubContent
        ref={
          ref as React.Ref<
            React.ElementRef<typeof ContextPrimitive.SubContent>
          >
        }
        className={merged}
        {...(props as unknown as React.ComponentPropsWithoutRef<
          typeof ContextPrimitive.SubContent
        >)}
      />
    );
  }
  return (
    <DropdownPrimitive.SubContent ref={ref} className={merged} {...props} />
  );
});
MenuSubContent.displayName = "MenuSubContent";

// ──────────────────────────────────────────────────────────────────
// Label / Separator / Shortcut
// ──────────────────────────────────────────────────────────────────

const MenuLabel = React.forwardRef<
  React.ElementRef<typeof DropdownPrimitive.Label>,
  React.ComponentPropsWithoutRef<typeof DropdownPrimitive.Label> & {
    inset?: boolean;
  }
>(({ className, inset, ...props }, ref) => {
  const mode = useMenuMode();
  const merged = cn(
    "px-2 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-fg-muted",
    inset && "pl-8",
    className,
  );
  if (mode === "context") {
    return (
      <ContextPrimitive.Label
        ref={ref as React.Ref<React.ElementRef<typeof ContextPrimitive.Label>>}
        className={merged}
        {...(props as unknown as React.ComponentPropsWithoutRef<
          typeof ContextPrimitive.Label
        >)}
      />
    );
  }
  return <DropdownPrimitive.Label ref={ref} className={merged} {...props} />;
});
MenuLabel.displayName = "MenuLabel";

const MenuSeparator = React.forwardRef<
  React.ElementRef<typeof DropdownPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof DropdownPrimitive.Separator>
>(({ className, ...props }, ref) => {
  const mode = useMenuMode();
  const merged = cn("-mx-1 my-1 h-px bg-border", className);
  if (mode === "context") {
    return (
      <ContextPrimitive.Separator
        ref={
          ref as React.Ref<
            React.ElementRef<typeof ContextPrimitive.Separator>
          >
        }
        className={merged}
        {...(props as unknown as React.ComponentPropsWithoutRef<
          typeof ContextPrimitive.Separator
        >)}
      />
    );
  }
  return (
    <DropdownPrimitive.Separator ref={ref} className={merged} {...props} />
  );
});
MenuSeparator.displayName = "MenuSeparator";

const MenuShortcut = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) => (
  <span
    className={cn(
      "ml-auto text-xs tracking-widest text-fg-muted font-mono",
      className,
    )}
    {...props}
  />
);
MenuShortcut.displayName = "MenuShortcut";

// ──────────────────────────────────────────────────────────────────
// Exports
// ──────────────────────────────────────────────────────────────────

export {
  Menu,
  MenuTrigger,
  MenuPortal,
  MenuContent,
  MenuItem,
  MenuCheckboxItem,
  MenuRadioItem,
  MenuRadioGroup,
  MenuGroup,
  MenuLabel,
  MenuSeparator,
  MenuShortcut,
  MenuSub,
  MenuSubTrigger,
  MenuSubContent,
  menuContentVariants,
};
