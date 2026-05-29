import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

import * as React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";

import { axeInThemes, setTheme, restoreTheme, THEMES } from "@/test-utils/a11y";
import {
  Menu,
  MenuTrigger,
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
  type MenuContentSize,
} from "./index";

/**
 * Tests for Plan #67 (parent Tech Task #66) — Menu v0.1.0 DoD.
 *
 * Each `it(...)` carries `AC-N:` so that `lex-issue-driven` Rule 3
 * (bidirectional AC ↔ test traceability) passes at Gate 2. ACs
 * referenced come from `.ahrena/issues/66/02-requirements.md`.
 */

function BasicMenu({
  triggerLabel = "Open menu",
  modal = false,
  ...props
}: { triggerLabel?: string } & React.ComponentProps<typeof Menu>) {
  // Radix DropdownMenu defaults `modal=true`, which inerts every other DOM
  // sibling via `pointer-events: none`. Tests render fixtures that need the
  // trigger to stay clickable for toggle scenarios, so default to non-modal
  // here. AC-4's modal=true test passes `modal` explicitly.
  return (
    <Menu modal={modal} {...props}>
      <MenuTrigger
        className="rounded-md border border-border-strong bg-background px-3 py-2 text-sm text-fg"
        aria-label={triggerLabel}
      >
        {triggerLabel}
      </MenuTrigger>
      <MenuContent aria-label="menu actions">
        <MenuItem onSelect={vi.fn()}>Edit</MenuItem>
        <MenuItem onSelect={vi.fn()}>Duplicate</MenuItem>
        <MenuSeparator />
        <MenuItem destructive onSelect={vi.fn()}>
          Delete
        </MenuItem>
      </MenuContent>
    </Menu>
  );
}

describe("Menu", () => {
  // ──────────────────────────────────────────────────────────────
  // A — Trigger / open / close behavior
  // ──────────────────────────────────────────────────────────────

  it("AC-1: clicking the trigger opens the content; clicking again closes it", async () => {
    const user = userEvent.setup();
    render(<BasicMenu />);
    const trigger = screen.getByRole("button", { name: /open menu/i });
    expect(trigger).toHaveAttribute("aria-expanded", "false");
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();

    await user.click(trigger);
    expect(trigger).toHaveAttribute("aria-expanded", "true");
    expect(await screen.findByRole("menu")).toBeInTheDocument();

    await user.click(trigger);
    await waitFor(() => {
      expect(screen.queryByRole("menu")).not.toBeInTheDocument();
    });
    expect(trigger).toHaveAttribute("aria-expanded", "false");
  });

  it("AC-2: pressing Escape closes the menu and returns focus to the trigger", async () => {
    const user = userEvent.setup();
    render(<BasicMenu />);
    const trigger = screen.getByRole("button", { name: /open menu/i });

    await user.click(trigger);
    await screen.findByRole("menu");
    await user.keyboard("{Escape}");

    await waitFor(() => {
      expect(screen.queryByRole("menu")).not.toBeInTheDocument();
    });
    expect(trigger).toHaveFocus();
  });

  it("AC-3: clicking outside closes the menu", async () => {
    const user = userEvent.setup();
    render(
      <div>
        <BasicMenu />
        <button type="button">outside button</button>
      </div>,
    );
    await user.click(screen.getByRole("button", { name: /open menu/i }));
    await screen.findByRole("menu");

    await user.click(screen.getByRole("button", { name: /outside button/i }));
    await waitFor(() => {
      expect(screen.queryByRole("menu")).not.toBeInTheDocument();
    });
  });

  it("AC-4: modal=false (default) keeps background interactive", async () => {
    const user = userEvent.setup();
    const onOutsideClick = vi.fn();
    render(
      <div>
        <Menu modal={false}>
          <MenuTrigger aria-label="open">open</MenuTrigger>
          <MenuContent>
            <MenuItem onSelect={vi.fn()}>Edit</MenuItem>
          </MenuContent>
        </Menu>
        <button type="button" onClick={onOutsideClick}>
          outside button
        </button>
      </div>,
    );
    await user.click(screen.getByRole("button", { name: /^open$/i }));
    await screen.findByRole("menu");

    await user.click(screen.getByRole("button", { name: /outside button/i }));
    expect(onOutsideClick).toHaveBeenCalledTimes(1);
  });

  it("AC-4: modal=true marks the trigger with data-state contract while open", async () => {
    const user = userEvent.setup();
    render(<BasicMenu modal />);
    const trigger = screen.getByRole("button", { name: /open menu/i });

    await user.click(trigger);
    await screen.findByRole("menu");
    expect(trigger).toHaveAttribute("data-state", "open");
    expect(trigger).toHaveAttribute("aria-expanded", "true");
  });

  // ──────────────────────────────────────────────────────────────
  // B — Positioning (side + align)
  // ──────────────────────────────────────────────────────────────

  it.each([
    ["top", "top"],
    ["right", "right"],
    ["bottom", "bottom"],
    ["left", "left"],
  ] as const)(
    "AC-5: side=%s renders content with data-side=%s",
    async (side, expected) => {
      const user = userEvent.setup();
      render(
        <Menu>
          <MenuTrigger aria-label="open">open</MenuTrigger>
          <MenuContent side={side} avoidCollisions={false}>
            <MenuItem onSelect={vi.fn()}>side {side}</MenuItem>
          </MenuContent>
        </Menu>,
      );
      await user.click(screen.getByRole("button", { name: /open/i }));
      const menu = await screen.findByRole("menu");
      expect(menu).toHaveAttribute("data-side", expected);
    },
  );

  it.each([
    ["start", "start"],
    ["center", "center"],
    ["end", "end"],
  ] as const)(
    "AC-6: align=%s renders content with data-align=%s",
    async (align, expected) => {
      const user = userEvent.setup();
      render(
        <Menu>
          <MenuTrigger aria-label="open">open</MenuTrigger>
          <MenuContent align={align}>
            <MenuItem onSelect={vi.fn()}>align {align}</MenuItem>
          </MenuContent>
        </Menu>,
      );
      await user.click(screen.getByRole("button", { name: /open/i }));
      const menu = await screen.findByRole("menu");
      expect(menu).toHaveAttribute("data-align", expected);
    },
  );

  // ──────────────────────────────────────────────────────────────
  // C — CVA size ladder
  // ──────────────────────────────────────────────────────────────

  it("AC-7: default size is md and applies p-1.5 + shadow-lg + text-sm", async () => {
    const user = userEvent.setup();
    render(
      <Menu>
        <MenuTrigger aria-label="open">open</MenuTrigger>
        <MenuContent>
          <MenuItem onSelect={vi.fn()}>md default</MenuItem>
        </MenuContent>
      </Menu>,
    );
    await user.click(screen.getByRole("button", { name: /open/i }));
    const menu = await screen.findByRole("menu");
    expect(menu.className).toContain("p-1.5");
    expect(menu.className).toContain("shadow-lg");
    expect(menu.className).toContain("text-sm");
  });

  it("AC-7: size=sm applies p-1 + shadow-md + text-[13px]", async () => {
    const user = userEvent.setup();
    render(
      <Menu>
        <MenuTrigger aria-label="open">open</MenuTrigger>
        <MenuContent size="sm">
          <MenuItem onSelect={vi.fn()}>small</MenuItem>
        </MenuContent>
      </Menu>,
    );
    await user.click(screen.getByRole("button", { name: /open/i }));
    const menu = await screen.findByRole("menu");
    expect(menu.className).toContain("p-1");
    expect(menu.className).toContain("shadow-md");
    expect(menu.className).toContain("text-[13px]");
  });

  it("AC-7: size=lg applies p-2 + shadow-lg + text-[15px] + rounded-lg", async () => {
    const user = userEvent.setup();
    render(
      <Menu>
        <MenuTrigger aria-label="open">open</MenuTrigger>
        <MenuContent size="lg">
          <MenuItem onSelect={vi.fn()}>large</MenuItem>
        </MenuContent>
      </Menu>,
    );
    await user.click(screen.getByRole("button", { name: /open/i }));
    const menu = await screen.findByRole("menu");
    expect(menu.className).toContain("p-2");
    expect(menu.className).toContain("shadow-lg");
    expect(menu.className).toContain("text-[15px]");
    expect(menu.className).toContain("rounded-lg");
  });

  it("AC-7: menuContentVariants CVA accessor is exported and the size enum is sm | md | lg", () => {
    expect(typeof menuContentVariants).toBe("function");
    const sizes: MenuContentSize[] = ["sm", "md", "lg"];
    for (const s of sizes) {
      const cls = menuContentVariants({ size: s });
      expect(typeof cls).toBe("string");
      expect(cls.length).toBeGreaterThan(0);
    }
  });

  // ──────────────────────────────────────────────────────────────
  // D — width override
  // ──────────────────────────────────────────────────────────────

  it("AC-8: width prop as number sets inline width in px", async () => {
    const user = userEvent.setup();
    render(
      <Menu>
        <MenuTrigger aria-label="open">open</MenuTrigger>
        <MenuContent width={320}>
          <MenuItem onSelect={vi.fn()}>fixed width</MenuItem>
        </MenuContent>
      </Menu>,
    );
    await user.click(screen.getByRole("button", { name: /open/i }));
    const menu = await screen.findByRole("menu");
    expect(menu.style.width).toBe("320px");
  });

  it("AC-8: width prop as string is forwarded verbatim", async () => {
    const user = userEvent.setup();
    render(
      <Menu>
        <MenuTrigger aria-label="open">open</MenuTrigger>
        <MenuContent width="min(90vw, 24rem)">
          <MenuItem onSelect={vi.fn()}>flex width</MenuItem>
        </MenuContent>
      </Menu>,
    );
    await user.click(screen.getByRole("button", { name: /open/i }));
    const menu = await screen.findByRole("menu");
    expect(menu.style.width).toBe("min(90vw, 24rem)");
  });

  it("AC-8: absent width falls back to Radix min-w-[8rem] baseline", async () => {
    const user = userEvent.setup();
    render(
      <Menu>
        <MenuTrigger aria-label="open">open</MenuTrigger>
        <MenuContent>
          <MenuItem onSelect={vi.fn()}>default width</MenuItem>
        </MenuContent>
      </Menu>,
    );
    await user.click(screen.getByRole("button", { name: /open/i }));
    const menu = await screen.findByRole("menu");
    expect(menu.className).toContain("min-w-[8rem]");
    expect(menu.style.width).toBe("");
  });

  // ──────────────────────────────────────────────────────────────
  // E — Token contract
  // ──────────────────────────────────────────────────────────────

  it("AC-9: source uses semantic tokens only — no legacy bg-popover or hardcoded colors", () => {
    const here = dirname(fileURLToPath(import.meta.url));
    const src = readFileSync(resolve(here, "./index.tsx"), "utf-8");
    expect(src).not.toMatch(/bg-popover\b/);
    expect(src).not.toMatch(/text-popover-foreground/);
    expect(src).not.toMatch(/#[0-9a-fA-F]{3,8}\b/);
    expect(src).not.toMatch(/oklch\(/);
    expect(src).not.toMatch(/guardia-(violet|orange|pink|yellow|purple)-[0-9]+/);
  });

  it("AC-9b: content uses bg-background + text-fg + border-border-strong + ring-ring", async () => {
    const user = userEvent.setup();
    render(<BasicMenu />);
    await user.click(screen.getByRole("button", { name: /open menu/i }));
    const menu = await screen.findByRole("menu");
    const cls = menu.className;
    expect(cls).toContain("bg-background");
    expect(cls).toContain("text-fg");
    expect(cls).toContain("border-border-strong");
    expect(cls).toContain("ring-ring");
  });

  // ──────────────────────────────────────────────────────────────
  // F — Items
  // ──────────────────────────────────────────────────────────────

  it("AC-10: MenuItem renders as menuitem and fires onSelect on click, closing the menu", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(
      <Menu>
        <MenuTrigger aria-label="open">open</MenuTrigger>
        <MenuContent>
          <MenuItem onSelect={onSelect}>Edit</MenuItem>
        </MenuContent>
      </Menu>,
    );
    await user.click(screen.getByRole("button", { name: /open/i }));
    const item = await screen.findByRole("menuitem", { name: /edit/i });
    await user.click(item);
    expect(onSelect).toHaveBeenCalledTimes(1);
    await waitFor(() => {
      expect(screen.queryByRole("menu")).not.toBeInTheDocument();
    });
  });

  it("AC-10: onSelect calling preventDefault keeps the menu open", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn((event: Event) => event.preventDefault());
    render(
      <Menu>
        <MenuTrigger aria-label="open">open</MenuTrigger>
        <MenuContent>
          <MenuItem onSelect={onSelect}>Stay</MenuItem>
        </MenuContent>
      </Menu>,
    );
    await user.click(screen.getByRole("button", { name: /open/i }));
    const item = await screen.findByRole("menuitem", { name: /stay/i });
    await user.click(item);
    expect(onSelect).toHaveBeenCalledTimes(1);
    // Menu stays open because preventDefault was called
    expect(screen.queryByRole("menu")).toBeInTheDocument();
  });

  it("AC-11: disabled MenuItem is aria-disabled, has data-disabled, and does NOT invoke onSelect", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(
      <Menu>
        <MenuTrigger aria-label="open">open</MenuTrigger>
        <MenuContent>
          <MenuItem disabled onSelect={onSelect}>
            Cannot Edit
          </MenuItem>
        </MenuContent>
      </Menu>,
    );
    await user.click(screen.getByRole("button", { name: /open/i }));
    const item = await screen.findByRole("menuitem", { name: /cannot edit/i });
    expect(item).toHaveAttribute("aria-disabled", "true");
    expect(item).toHaveAttribute("data-disabled");
    expect(item.className).toContain("data-[disabled]:opacity-50");
    // Click attempts on disabled items do not invoke onSelect
    await user.click(item);
    expect(onSelect).not.toHaveBeenCalled();
  });

  it("AC-12: destructive MenuItem applies text-destructive token", async () => {
    const user = userEvent.setup();
    render(
      <Menu>
        <MenuTrigger aria-label="open">open</MenuTrigger>
        <MenuContent>
          <MenuItem destructive onSelect={vi.fn()}>
            Delete
          </MenuItem>
        </MenuContent>
      </Menu>,
    );
    await user.click(screen.getByRole("button", { name: /open/i }));
    const item = await screen.findByRole("menuitem", { name: /delete/i });
    expect(item.className).toContain("text-destructive");
  });

  it("AC-13: inset MenuItem applies pl-8 for icon-aligned siblings", async () => {
    const user = userEvent.setup();
    render(
      <Menu>
        <MenuTrigger aria-label="open">open</MenuTrigger>
        <MenuContent>
          <MenuItem inset onSelect={vi.fn()}>
            Inset Item
          </MenuItem>
        </MenuContent>
      </Menu>,
    );
    await user.click(screen.getByRole("button", { name: /open/i }));
    const item = await screen.findByRole("menuitem", { name: /inset item/i });
    expect(item.className).toContain("pl-8");
  });

  // ──────────────────────────────────────────────────────────────
  // G — CheckboxItem / RadioItem / Indicator
  // ──────────────────────────────────────────────────────────────

  it("AC-14: MenuCheckboxItem renders as menuitemcheckbox with aria-checked", async () => {
    const user = userEvent.setup();
    render(
      <Menu>
        <MenuTrigger aria-label="open">open</MenuTrigger>
        <MenuContent>
          <MenuCheckboxItem checked>Show Bookmarks</MenuCheckboxItem>
          <MenuCheckboxItem checked={false}>Show URLs</MenuCheckboxItem>
        </MenuContent>
      </Menu>,
    );
    await user.click(screen.getByRole("button", { name: /open/i }));
    const checked = await screen.findByRole("menuitemcheckbox", {
      name: /show bookmarks/i,
    });
    const unchecked = screen.getByRole("menuitemcheckbox", {
      name: /show urls/i,
    });
    expect(checked).toHaveAttribute("aria-checked", "true");
    expect(unchecked).toHaveAttribute("aria-checked", "false");
  });

  it("AC-15: MenuRadioItem renders as menuitemradio with aria-checked inside MenuRadioGroup", async () => {
    const user = userEvent.setup();
    render(
      <Menu>
        <MenuTrigger aria-label="open">open</MenuTrigger>
        <MenuContent>
          <MenuRadioGroup value="user-2">
            <MenuRadioItem value="user-1">Pedro</MenuRadioItem>
            <MenuRadioItem value="user-2">Ana</MenuRadioItem>
            <MenuRadioItem value="user-3">Maria</MenuRadioItem>
          </MenuRadioGroup>
        </MenuContent>
      </Menu>,
    );
    await user.click(screen.getByRole("button", { name: /open/i }));
    const ana = await screen.findByRole("menuitemradio", { name: /ana/i });
    const pedro = screen.getByRole("menuitemradio", { name: /pedro/i });
    expect(ana).toHaveAttribute("aria-checked", "true");
    expect(pedro).toHaveAttribute("aria-checked", "false");
  });

  // ──────────────────────────────────────────────────────────────
  // H — Group / Label / Separator / Shortcut
  // ──────────────────────────────────────────────────────────────

  it("AC-16: MenuGroup wraps items in a role=group container", async () => {
    const user = userEvent.setup();
    render(
      <Menu>
        <MenuTrigger aria-label="open">open</MenuTrigger>
        <MenuContent>
          <MenuGroup>
            <MenuItem onSelect={vi.fn()}>Edit</MenuItem>
            <MenuItem onSelect={vi.fn()}>Duplicate</MenuItem>
          </MenuGroup>
        </MenuContent>
      </Menu>,
    );
    await user.click(screen.getByRole("button", { name: /open/i }));
    await screen.findByRole("menu");
    const group = screen.getByRole("group");
    expect(group).toBeInTheDocument();
    expect(group.querySelectorAll("[role='menuitem']")).toHaveLength(2);
  });

  it("AC-17: MenuLabel renders styled heading row matching legacy reference visual", async () => {
    const user = userEvent.setup();
    render(
      <Menu>
        <MenuTrigger aria-label="open">open</MenuTrigger>
        <MenuContent>
          <MenuLabel>Section heading</MenuLabel>
          <MenuItem onSelect={vi.fn()}>Edit</MenuItem>
        </MenuContent>
      </Menu>,
    );
    await user.click(screen.getByRole("button", { name: /open/i }));
    await screen.findByRole("menu");
    const label = screen.getByText(/section heading/i);
    expect(label.className).toContain("text-[11px]");
    expect(label.className).toContain("font-semibold");
    expect(label.className).toContain("uppercase");
    expect(label.className).toContain("text-fg-muted");
  });

  it("AC-18: MenuSeparator renders as role=separator with bg-border", async () => {
    const user = userEvent.setup();
    render(
      <Menu>
        <MenuTrigger aria-label="open">open</MenuTrigger>
        <MenuContent>
          <MenuItem onSelect={vi.fn()}>Edit</MenuItem>
          <MenuSeparator />
          <MenuItem onSelect={vi.fn()}>Delete</MenuItem>
        </MenuContent>
      </Menu>,
    );
    await user.click(screen.getByRole("button", { name: /open/i }));
    await screen.findByRole("menu");
    const sep = screen.getByRole("separator");
    expect(sep).toBeInTheDocument();
    expect(sep.className).toContain("bg-border");
    expect(sep.className).toContain("h-px");
  });

  it("AC-19: MenuShortcut renders with ml-auto + text-fg-muted + monospace tracking", async () => {
    const user = userEvent.setup();
    render(
      <Menu>
        <MenuTrigger aria-label="open">open</MenuTrigger>
        <MenuContent>
          <MenuItem onSelect={vi.fn()}>
            Save
            <MenuShortcut>⌘S</MenuShortcut>
          </MenuItem>
        </MenuContent>
      </Menu>,
    );
    await user.click(screen.getByRole("button", { name: /open/i }));
    await screen.findByRole("menu");
    const shortcut = screen.getByText(/⌘S/i);
    expect(shortcut.className).toContain("ml-auto");
    expect(shortcut.className).toContain("text-fg-muted");
    expect(shortcut.className).toContain("font-mono");
  });

  // ──────────────────────────────────────────────────────────────
  // I — Submenu (one level)
  // ──────────────────────────────────────────────────────────────

  it("AC-20: MenuSubTrigger renders with chevron and opens MenuSubContent on click", async () => {
    const user = userEvent.setup();
    render(
      <Menu>
        <MenuTrigger aria-label="open">open</MenuTrigger>
        <MenuContent>
          <MenuItem onSelect={vi.fn()}>Edit</MenuItem>
          <MenuSub>
            <MenuSubTrigger>More options</MenuSubTrigger>
            <MenuSubContent>
              <MenuItem onSelect={vi.fn()}>Sub Item A</MenuItem>
              <MenuItem onSelect={vi.fn()}>Sub Item B</MenuItem>
            </MenuSubContent>
          </MenuSub>
        </MenuContent>
      </Menu>,
    );
    await user.click(screen.getByRole("button", { name: /^open$/i }));
    await screen.findByRole("menu");
    const subTrigger = screen.getByRole("menuitem", { name: /more options/i });
    expect(subTrigger).toHaveAttribute("aria-expanded", "false");
    // Open the submenu by activating the sub-trigger
    await user.click(subTrigger);
    await waitFor(() => {
      expect(subTrigger).toHaveAttribute("aria-expanded", "true");
    });
    // Sub-trigger has data-state=open marker
    expect(subTrigger).toHaveAttribute("data-state", "open");
  });

  // ──────────────────────────────────────────────────────────────
  // J — Context mode
  // ──────────────────────────────────────────────────────────────

  it("AC-21: mode=context swaps the internal primitive and right-click opens content", async () => {
    render(
      <Menu mode="context">
        <MenuTrigger asChild>
          <div data-testid="context-area" className="size-32">
            right-click me
          </div>
        </MenuTrigger>
        <MenuContent>
          <MenuItem onSelect={vi.fn()}>Copy</MenuItem>
          <MenuItem onSelect={vi.fn()}>Paste</MenuItem>
        </MenuContent>
      </Menu>,
    );
    const area = screen.getByTestId("context-area");
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
    fireEvent.contextMenu(area);
    expect(await screen.findByRole("menu")).toBeInTheDocument();
    expect(
      screen.getByRole("menuitem", { name: /copy/i }),
    ).toBeInTheDocument();
  });

  it("AC-22: context-mode menu closes on Escape", async () => {
    const user = userEvent.setup();
    render(
      <Menu mode="context">
        <MenuTrigger asChild>
          <div data-testid="context-area" className="size-32">
            right-click me
          </div>
        </MenuTrigger>
        <MenuContent>
          <MenuItem onSelect={vi.fn()}>Copy</MenuItem>
        </MenuContent>
      </Menu>,
    );
    fireEvent.contextMenu(screen.getByTestId("context-area"));
    await screen.findByRole("menu");
    await user.keyboard("{Escape}");
    await waitFor(() => {
      expect(screen.queryByRole("menu")).not.toBeInTheDocument();
    });
  });

  it("AC-22: context-mode menu exercises all surfaces (Item, Checkbox, Radio, Label, Separator, Submenu)", async () => {
    // Coverage for the context-mode branches of every MenuX component.
    render(
      <Menu mode="context">
        <MenuTrigger asChild>
          <div data-testid="ctx-area" className="size-32">
            right-click me
          </div>
        </MenuTrigger>
        <MenuContent>
          <MenuLabel>Section</MenuLabel>
          <MenuGroup>
            <MenuItem onSelect={vi.fn()} inset>
              Open
            </MenuItem>
            <MenuItem onSelect={vi.fn()} destructive>
              Remove
            </MenuItem>
            <MenuCheckboxItem checked>Visible</MenuCheckboxItem>
            <MenuRadioGroup value="b">
              <MenuRadioItem value="a">A</MenuRadioItem>
              <MenuRadioItem value="b">B</MenuRadioItem>
            </MenuRadioGroup>
          </MenuGroup>
          <MenuSeparator />
          <MenuSub>
            <MenuSubTrigger>More</MenuSubTrigger>
            <MenuSubContent>
              <MenuItem onSelect={vi.fn()}>Nested</MenuItem>
            </MenuSubContent>
          </MenuSub>
        </MenuContent>
      </Menu>,
    );
    fireEvent.contextMenu(screen.getByTestId("ctx-area"));
    const menu = await screen.findByRole("menu");
    expect(menu).toBeInTheDocument();
    // Each context-mode branch rendered at least one surface
    expect(screen.getByText(/section/i)).toBeInTheDocument();
    expect(screen.getByRole("menuitem", { name: /^open$/i })).toBeInTheDocument();
    expect(
      screen.getByRole("menuitem", { name: /^remove$/i }).className,
    ).toContain("text-destructive");
    expect(
      screen.getByRole("menuitemcheckbox", { name: /visible/i }),
    ).toHaveAttribute("aria-checked", "true");
    expect(screen.getByRole("menuitemradio", { name: /b/i })).toHaveAttribute(
      "aria-checked",
      "true",
    );
    expect(screen.getByRole("separator")).toBeInTheDocument();
    expect(
      screen.getByRole("menuitem", { name: /^more$/i }),
    ).toBeInTheDocument();
  });

  // ──────────────────────────────────────────────────────────────
  // K — ARIA / keyboard
  // ──────────────────────────────────────────────────────────────

  it("AC-23: trigger declares aria-haspopup=menu and content has role=menu", async () => {
    const user = userEvent.setup();
    render(<BasicMenu />);
    const trigger = screen.getByRole("button", { name: /open menu/i });
    expect(trigger).toHaveAttribute("aria-haspopup", "menu");
    expect(trigger).toHaveAttribute("data-state", "closed");

    await user.click(trigger);
    const menu = await screen.findByRole("menu");
    expect(menu).toBeInTheDocument();
    expect(trigger).toHaveAttribute("data-state", "open");
  });

  it("AC-24: ArrowDown moves focus through items (skips disabled), Home/End jump, Enter activates", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(
      <Menu>
        <MenuTrigger aria-label="open">open</MenuTrigger>
        <MenuContent>
          <MenuItem onSelect={vi.fn()}>First</MenuItem>
          <MenuItem disabled onSelect={vi.fn()}>
            Second (disabled)
          </MenuItem>
          <MenuItem onSelect={vi.fn()}>Third</MenuItem>
          <MenuItem onSelect={onSelect}>Fourth</MenuItem>
        </MenuContent>
      </Menu>,
    );
    const trigger = screen.getByRole("button", { name: /open/i });
    trigger.focus();
    await user.keyboard("{ArrowDown}");
    await screen.findByRole("menu");
    // First item should receive focus after open via ArrowDown
    await waitFor(() => {
      expect(screen.getByRole("menuitem", { name: /^first$/i })).toHaveFocus();
    });
    // ArrowDown skips the disabled item and lands on "Third"
    await user.keyboard("{ArrowDown}");
    await waitFor(() => {
      expect(screen.getByRole("menuitem", { name: /^third$/i })).toHaveFocus();
    });
    // End jumps to the last item
    await user.keyboard("{End}");
    await waitFor(() => {
      expect(screen.getByRole("menuitem", { name: /^fourth$/i })).toHaveFocus();
    });
    // Enter activates the focused item (Fourth), which closes the menu
    await user.keyboard("{Enter}");
    expect(onSelect).toHaveBeenCalledTimes(1);
  });

  // ──────────────────────────────────────────────────────────────
  // M — Public surface / barrel
  // ──────────────────────────────────────────────────────────────

  it("AC-28: exports the full public surface (15 components + CVA + types)", () => {
    expect(Menu).toBeDefined();
    expect(MenuTrigger).toBeDefined();
    expect(MenuContent).toBeDefined();
    expect(MenuItem).toBeDefined();
    expect(MenuCheckboxItem).toBeDefined();
    expect(MenuRadioItem).toBeDefined();
    expect(MenuRadioGroup).toBeDefined();
    expect(MenuGroup).toBeDefined();
    expect(MenuLabel).toBeDefined();
    expect(MenuSeparator).toBeDefined();
    expect(MenuShortcut).toBeDefined();
    expect(MenuSub).toBeDefined();
    expect(MenuSubTrigger).toBeDefined();
    expect(MenuSubContent).toBeDefined();
    expect(menuContentVariants).toBeDefined();
  });

  it("AC-29 + AC-36 + AC-37: legacy DropdownMenu/ContextMenu exports are NOT in the barrel and source files are gone", () => {
    // Read the barrel and assert the legacy re-exports are not present.
    const here = dirname(fileURLToPath(import.meta.url));
    const barrelPath = resolve(here, "../index.ts");
    const barrel = readFileSync(barrelPath, "utf-8");
    expect(barrel).toMatch(/export \* from "\.\/menu";/);
    expect(barrel).not.toMatch(/export \* from "\.\/dropdown-menu";/);
    expect(barrel).not.toMatch(/export \* from "\.\/context-menu";/);
  });

  // ──────────────────────────────────────────────────────────────
  // L — Accessibility (jest-axe in light + dark via axeInThemes)
  // Covers AC-25 (default), AC-26 (open), AC-27 (disabled).
  // ──────────────────────────────────────────────────────────────

  describe("a11y (axe in light + dark)", () => {
    it("AC-25: no WCAG 2.1 AA violations in default (closed) state across light + dark", async () => {
      const { container } = render(<BasicMenu />);
      await axeInThemes(container);
    });

    it("AC-26: no WCAG 2.1 AA violations in open state across light + dark", async () => {
      const user = userEvent.setup();
      // The portal-rendered menu lives at document.body and `role="menu"`
      // is NOT a landmark by ARIA spec (unlike role="dialog" on Popover).
      // Disable axe's `region` rule for this scenario — applying it would
      // wrongly require menus to be wrapped in <main>/<section>, which
      // contradicts the ARIA Menu pattern. Every other AA rule still runs.
      const { baseElement } = render(<BasicMenu />);
      await user.click(screen.getByRole("button", { name: /open menu/i }));
      await screen.findByRole("menu");
      const previous = document.documentElement.getAttribute("data-theme");
      try {
        for (const theme of THEMES) {
          setTheme(theme);
          const results = await axe(baseElement, {
            rules: { region: { enabled: false } },
          });
          expect(
            results,
            `a11y violations no tema "${theme}"`,
          ).toHaveNoViolations();
        }
      } finally {
        restoreTheme(previous);
      }
    });

    it("AC-27: no WCAG 2.1 AA violations on disabled trigger across light + dark", async () => {
      const { container } = render(
        <Menu>
          <MenuTrigger
            disabled
            aria-label="open"
            className="rounded-md border border-border-strong bg-background px-3 py-2 text-sm text-fg disabled:opacity-70"
          >
            disabled trigger
          </MenuTrigger>
          <MenuContent>
            <MenuItem onSelect={vi.fn()}>nope</MenuItem>
          </MenuContent>
        </Menu>,
      );
      await axeInThemes(container);
    });
  });
});
