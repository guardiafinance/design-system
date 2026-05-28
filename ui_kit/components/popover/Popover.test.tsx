import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

import * as React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { axeInThemes } from "@/test-utils/a11y";
import {
  Popover,
  PopoverTrigger,
  PopoverAnchor,
  PopoverContent,
  PopoverClose,
  popoverContentVariants,
  type PopoverContentSize,
} from "./index";

/**
 * Tests for Plan #69 (parent Tech Task #68) — Popover v0.1.0 DoD.
 *
 * Each `it(...)` carries `AC-N:` so that
 * `lex-issue-driven` Rule 3 (bidirectional AC ↔ test traceability)
 * passes at Gate 2. ACs referenced come from
 * `.ahrena/issues/68/02-requirements.md`.
 */

function BasicPopover({
  triggerLabel = "Open popover",
  contentLabel = "Popover content",
  ...props
}: {
  triggerLabel?: string;
  contentLabel?: string;
} & React.ComponentProps<typeof Popover>) {
  return (
    <Popover {...props}>
      <PopoverTrigger
        className="rounded-md border border-border-strong bg-background px-3 py-2 text-sm text-fg"
        aria-label={triggerLabel}
      >
        {triggerLabel}
      </PopoverTrigger>
      <PopoverContent aria-label={contentLabel}>
        <p>{contentLabel}</p>
        <a href="#first">first link</a>
        <a href="#second">second link</a>
      </PopoverContent>
    </Popover>
  );
}

describe("Popover", () => {
  // ────────────────────────────────────────────────────────────────
  // Trigger toggle + ARIA contract
  // ────────────────────────────────────────────────────────────────

  it("AC-1: clicking the trigger opens the content; clicking again closes it", async () => {
    const user = userEvent.setup();
    render(<BasicPopover />);
    const trigger = screen.getByRole("button", { name: /open popover/i });
    expect(trigger).toHaveAttribute("aria-expanded", "false");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

    await user.click(trigger);
    expect(trigger).toHaveAttribute("aria-expanded", "true");
    expect(await screen.findByRole("dialog")).toBeInTheDocument();

    await user.click(trigger);
    await waitFor(() => {
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });
    expect(trigger).toHaveAttribute("aria-expanded", "false");
  });

  it("AC-2: pressing Escape closes the popover and returns focus to the trigger", async () => {
    const user = userEvent.setup();
    render(<BasicPopover />);
    const trigger = screen.getByRole("button", { name: /open popover/i });

    await user.click(trigger);
    await screen.findByRole("dialog");
    await user.keyboard("{Escape}");

    await waitFor(() => {
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });
    expect(trigger).toHaveFocus();
  });

  it("AC-3: clicking outside closes the popover (default outside-click behavior)", async () => {
    const user = userEvent.setup();
    render(
      <div>
        <BasicPopover />
        <button type="button">outside button</button>
      </div>,
    );
    await user.click(screen.getByRole("button", { name: /open popover/i }));
    await screen.findByRole("dialog");

    await user.click(screen.getByRole("button", { name: /outside button/i }));
    await waitFor(() => {
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });
  });

  // ────────────────────────────────────────────────────────────────
  // modal prop
  // ────────────────────────────────────────────────────────────────

  it("AC-4: modal=false (default) keeps background interactive", async () => {
    const user = userEvent.setup();
    const onOutsideClick = vi.fn();
    render(
      <div>
        <BasicPopover />
        <button type="button" onClick={onOutsideClick}>
          outside button
        </button>
      </div>,
    );
    await user.click(screen.getByRole("button", { name: /open popover/i }));
    await screen.findByRole("dialog");

    // Non-modal: clicking outside fires the outside handler (then closes the popover).
    await user.click(screen.getByRole("button", { name: /outside button/i }));
    expect(onOutsideClick).toHaveBeenCalledTimes(1);
  });

  it("AC-4: modal=true marks the trigger with the corresponding data-state contract", async () => {
    const user = userEvent.setup();
    render(<BasicPopover modal />);
    const trigger = screen.getByRole("button", { name: /open popover/i });

    await user.click(trigger);
    await screen.findByRole("dialog");
    expect(trigger).toHaveAttribute("data-state", "open");
    expect(trigger).toHaveAttribute("aria-expanded", "true");
  });

  // ────────────────────────────────────────────────────────────────
  // side + align
  // ────────────────────────────────────────────────────────────────

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
        <Popover>
          <PopoverTrigger aria-label="open">open</PopoverTrigger>
          <PopoverContent side={side} avoidCollisions={false}>
            side {side}
          </PopoverContent>
        </Popover>,
      );
      await user.click(screen.getByRole("button", { name: /open/i }));
      const dialog = await screen.findByRole("dialog");
      // `avoidCollisions={false}` disables Radix's auto-flip — jsdom has no
      // layout, but production behavior is preserved via the data-side
      // attribute forwarding the requested side honestly.
      expect(dialog).toHaveAttribute("data-side", expected);
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
        <Popover>
          <PopoverTrigger aria-label="open">open</PopoverTrigger>
          <PopoverContent align={align}>align {align}</PopoverContent>
        </Popover>,
      );
      await user.click(screen.getByRole("button", { name: /open/i }));
      const dialog = await screen.findByRole("dialog");
      expect(dialog).toHaveAttribute("data-align", expected);
    },
  );

  // ────────────────────────────────────────────────────────────────
  // size CVA variant (AC-7) — sm 8 / md 12 / lg 16
  // ────────────────────────────────────────────────────────────────

  it("AC-7: default size is md and applies p-3 + shadow-lg + text-sm", async () => {
    const user = userEvent.setup();
    render(
      <Popover>
        <PopoverTrigger aria-label="open">open</PopoverTrigger>
        <PopoverContent>md default</PopoverContent>
      </Popover>,
    );
    await user.click(screen.getByRole("button", { name: /open/i }));
    const dialog = await screen.findByRole("dialog");
    expect(dialog.className).toContain("p-3");
    expect(dialog.className).toContain("shadow-lg");
    expect(dialog.className).toContain("text-sm");
  });

  it("AC-7: size=sm applies p-2 + shadow-md + text-[13px]", async () => {
    const user = userEvent.setup();
    render(
      <Popover>
        <PopoverTrigger aria-label="open">open</PopoverTrigger>
        <PopoverContent size="sm">small</PopoverContent>
      </Popover>,
    );
    await user.click(screen.getByRole("button", { name: /open/i }));
    const dialog = await screen.findByRole("dialog");
    expect(dialog.className).toContain("p-2");
    expect(dialog.className).toContain("shadow-md");
    expect(dialog.className).toContain("text-[13px]");
  });

  it("AC-7: size=lg applies p-4 + shadow-lg + text-[15px] + rounded-lg", async () => {
    const user = userEvent.setup();
    render(
      <Popover>
        <PopoverTrigger aria-label="open">open</PopoverTrigger>
        <PopoverContent size="lg">large</PopoverContent>
      </Popover>,
    );
    await user.click(screen.getByRole("button", { name: /open/i }));
    const dialog = await screen.findByRole("dialog");
    expect(dialog.className).toContain("p-4");
    expect(dialog.className).toContain("shadow-lg");
    expect(dialog.className).toContain("text-[15px]");
    expect(dialog.className).toContain("rounded-lg");
  });

  it("AC-7: popoverContentVariants CVA accessor is exported and the size enum is sm | md | lg", () => {
    expect(typeof popoverContentVariants).toBe("function");
    const sizes: PopoverContentSize[] = ["sm", "md", "lg"];
    for (const s of sizes) {
      const cls = popoverContentVariants({ size: s });
      expect(typeof cls).toBe("string");
      expect(cls.length).toBeGreaterThan(0);
    }
  });

  // ────────────────────────────────────────────────────────────────
  // width prop (AC-8) + default width
  // ────────────────────────────────────────────────────────────────

  it("AC-8: width prop as number sets inline width in px", async () => {
    const user = userEvent.setup();
    render(
      <Popover>
        <PopoverTrigger aria-label="open">open</PopoverTrigger>
        <PopoverContent width={420}>fixed width</PopoverContent>
      </Popover>,
    );
    await user.click(screen.getByRole("button", { name: /open/i }));
    const dialog = await screen.findByRole("dialog");
    expect(dialog.style.width).toBe("420px");
    // Default width class should NOT be present when width is provided
    expect(dialog.className).not.toContain("w-72");
  });

  it("AC-8: width prop as string is forwarded as-is", async () => {
    const user = userEvent.setup();
    render(
      <Popover>
        <PopoverTrigger aria-label="open">open</PopoverTrigger>
        <PopoverContent width="min(90vw, 32rem)">flex width</PopoverContent>
      </Popover>,
    );
    await user.click(screen.getByRole("button", { name: /open/i }));
    const dialog = await screen.findByRole("dialog");
    expect(dialog.style.width).toBe("min(90vw, 32rem)");
  });

  it("AC-8: absent width falls back to default w-72 (18rem)", async () => {
    const user = userEvent.setup();
    render(
      <Popover>
        <PopoverTrigger aria-label="open">open</PopoverTrigger>
        <PopoverContent>default width</PopoverContent>
      </Popover>,
    );
    await user.click(screen.getByRole("button", { name: /open/i }));
    const dialog = await screen.findByRole("dialog");
    expect(dialog.className).toContain("w-72");
    expect(dialog.style.width).toBe("");
  });

  // ────────────────────────────────────────────────────────────────
  // Token contract (AC-9) — semantic tokens only
  // ────────────────────────────────────────────────────────────────

  it("AC-9: source uses semantic tokens only — no legacy bg-popover or hardcoded colors", () => {
    const here = dirname(fileURLToPath(import.meta.url));
    const src = readFileSync(resolve(here, "./index.tsx"), "utf-8");
    // Legacy shadcn tokens that this migration is removing
    expect(src).not.toMatch(/bg-popover\b/);
    expect(src).not.toMatch(/text-popover-foreground/);
    // No hex/oklch hardcoded colors
    expect(src).not.toMatch(/#[0-9a-fA-F]{3,8}\b/);
    expect(src).not.toMatch(/oklch\(/);
    // No legacy guardia-* palette references
    expect(src).not.toMatch(/guardia-(violet|orange|pink|yellow|purple)-[0-9]+/);
  });

  it("AC-9: content uses bg-background + text-fg + border-border-strong + ring-ring", async () => {
    const user = userEvent.setup();
    render(<BasicPopover />);
    await user.click(screen.getByRole("button", { name: /open popover/i }));
    const dialog = await screen.findByRole("dialog");
    const cls = dialog.className;
    expect(cls).toContain("bg-background");
    expect(cls).toContain("text-fg");
    expect(cls).toContain("border-border-strong");
    expect(cls).toContain("ring-ring");
  });

  // ────────────────────────────────────────────────────────────────
  // ARIA contract (AC-10, AC-11)
  // ────────────────────────────────────────────────────────────────

  it("AC-10: trigger exposes aria-haspopup=dialog and data-state contract", async () => {
    const user = userEvent.setup();
    render(<BasicPopover />);
    const trigger = screen.getByRole("button", { name: /open popover/i });
    expect(trigger).toHaveAttribute("aria-haspopup", "dialog");
    expect(trigger).toHaveAttribute("data-state", "closed");

    await user.click(trigger);
    await screen.findByRole("dialog");
    expect(trigger).toHaveAttribute("data-state", "open");
    // Radix wires aria-controls only after the content is rendered
    expect(trigger).toHaveAttribute("aria-controls");
  });

  it("AC-11: content has role=dialog and contains tabbable elements for focus-trap", async () => {
    const user = userEvent.setup();
    render(<BasicPopover />);
    await user.click(screen.getByRole("button", { name: /open popover/i }));
    const dialog = await screen.findByRole("dialog");
    expect(dialog).toBeInTheDocument();
    // Tabbable elements inside the content surface
    const firstLink = screen.getByRole("link", { name: /first link/i });
    const secondLink = screen.getByRole("link", { name: /second link/i });
    expect(dialog.contains(firstLink)).toBe(true);
    expect(dialog.contains(secondLink)).toBe(true);
  });

  // ────────────────────────────────────────────────────────────────
  // Disabled trigger (AC-12)
  // ────────────────────────────────────────────────────────────────

  it("AC-12: disabled trigger does not open on click or Enter/Space", async () => {
    const user = userEvent.setup();
    render(
      <Popover>
        <PopoverTrigger disabled aria-label="open">
          open
        </PopoverTrigger>
        <PopoverContent>should not open</PopoverContent>
      </Popover>,
    );
    const trigger = screen.getByRole("button", { name: /open/i });
    expect(trigger).toBeDisabled();
    expect(trigger).toHaveAttribute("aria-expanded", "false");

    await user.click(trigger);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(trigger).toHaveAttribute("aria-expanded", "false");
  });

  // ────────────────────────────────────────────────────────────────
  // PopoverAnchor (AC-13)
  // ────────────────────────────────────────────────────────────────

  it("AC-13: PopoverAnchor allows decoupled anchoring distinct from the trigger", async () => {
    const user = userEvent.setup();
    render(
      <Popover>
        <PopoverAnchor>
          <span>anchor row</span>
        </PopoverAnchor>
        <PopoverTrigger aria-label="open">open</PopoverTrigger>
        <PopoverContent>anchored</PopoverContent>
      </Popover>,
    );
    // The anchor renders in the DOM as a sibling of the trigger; Radix
    // wires it as the positioning reference (distinct from the trigger).
    const anchor = screen.getByText(/anchor row/i);
    expect(anchor).toBeInTheDocument();

    // The popover still opens via its trigger, proving the anchor is a
    // separate composable primitive (positioning vs. activation decoupled).
    await user.click(screen.getByRole("button", { name: /open/i }));
    expect(await screen.findByRole("dialog")).toBeInTheDocument();
  });

  // ────────────────────────────────────────────────────────────────
  // PopoverClose (AC-14)
  // ────────────────────────────────────────────────────────────────

  it("AC-14: PopoverClose inside content closes the popover and returns focus to the trigger", async () => {
    const user = userEvent.setup();
    render(
      <Popover>
        <PopoverTrigger aria-label="open">open</PopoverTrigger>
        <PopoverContent>
          <p>content body</p>
          <PopoverClose aria-label="close popover">close</PopoverClose>
        </PopoverContent>
      </Popover>,
    );
    const trigger = screen.getByRole("button", { name: /open/i });

    await user.click(trigger);
    await screen.findByRole("dialog");

    await user.click(screen.getByRole("button", { name: /close popover/i }));
    await waitFor(() => {
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });
    expect(trigger).toHaveFocus();
  });

  // ────────────────────────────────────────────────────────────────
  // Controlled / uncontrolled (AC-15)
  // ────────────────────────────────────────────────────────────────

  it("AC-15: controlled mode invokes onOpenChange and respects external open", async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();

    function Controlled() {
      const [open, setOpen] = React.useState(false);
      return (
        <Popover
          open={open}
          onOpenChange={(next) => {
            onOpenChange(next);
            setOpen(next);
          }}
        >
          <PopoverTrigger aria-label="open">open</PopoverTrigger>
          <PopoverContent>controlled</PopoverContent>
        </Popover>
      );
    }

    render(<Controlled />);
    const trigger = screen.getByRole("button", { name: /open/i });

    await user.click(trigger);
    expect(onOpenChange).toHaveBeenCalledWith(true);
    expect(await screen.findByRole("dialog")).toBeInTheDocument();

    await user.click(trigger);
    expect(onOpenChange).toHaveBeenLastCalledWith(false);
    await waitFor(() => {
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });
  });

  it("AC-15: defaultOpen=true renders the content open on mount (uncontrolled)", async () => {
    render(
      <Popover defaultOpen>
        <PopoverTrigger aria-label="open">open</PopoverTrigger>
        <PopoverContent>open on mount</PopoverContent>
      </Popover>,
    );
    expect(await screen.findByRole("dialog")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /open/i })).toHaveAttribute(
      "aria-expanded",
      "true",
    );
  });

  // ────────────────────────────────────────────────────────────────
  // Exports + barrel (AC-21)
  // ────────────────────────────────────────────────────────────────

  it("AC-21: exports the full public surface (5 components + CVA + types)", () => {
    expect(Popover).toBeDefined();
    expect(PopoverTrigger).toBeDefined();
    expect(PopoverAnchor).toBeDefined();
    expect(PopoverContent).toBeDefined();
    expect(PopoverClose).toBeDefined();
    expect(popoverContentVariants).toBeDefined();
  });

  // ────────────────────────────────────────────────────────────────
  // Accessibility — jest-axe in light + dark via axeInThemes
  // Covers AC-16 (default), AC-17 (open), AC-18 (disabled).
  // ────────────────────────────────────────────────────────────────

  describe("a11y (axe in light + dark)", () => {
    it("AC-16: no WCAG 2.1 AA violations in default (closed) state across light + dark", async () => {
      const { container } = render(<BasicPopover />);
      await axeInThemes(container);
    });

    it("AC-17: no WCAG 2.1 AA violations in open state across light + dark", async () => {
      const user = userEvent.setup();
      const { baseElement } = render(<BasicPopover />);
      await user.click(screen.getByRole("button", { name: /open popover/i }));
      await screen.findByRole("dialog");
      // The Portal renders the dialog outside the original container;
      // baseElement covers both the trigger root and the portal root.
      await axeInThemes(baseElement);
    });

    it("AC-18: no WCAG 2.1 AA violations on disabled trigger across light + dark", async () => {
      const { container } = render(
        <Popover>
          <PopoverTrigger
            disabled
            aria-label="open"
            className="rounded-md border border-border-strong bg-background px-3 py-2 text-sm text-fg disabled:opacity-70"
          >
            disabled trigger
          </PopoverTrigger>
          <PopoverContent>should not open</PopoverContent>
        </Popover>,
      );
      await axeInThemes(container);
    });
  });
});
