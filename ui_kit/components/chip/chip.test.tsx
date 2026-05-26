import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";

import { axeInThemes } from "@/test-utils/a11y";
import { Chip } from "./index";

describe("<Chip />", () => {
  it("renders its children", () => {
    render(<Chip>Filtro</Chip>);
    expect(screen.getByText("Filtro")).toBeInTheDocument();
  });

  it("defaults to non-interactive (no role)", () => {
    render(<Chip>Label</Chip>);
    expect(screen.queryByRole("button")).toBeNull();
  });

  it("becomes a button when onSelect is provided", () => {
    render(<Chip onSelect={() => {}}>Toggle</Chip>);
    const btn = screen.getByRole("button", { name: "Toggle" });
    expect(btn).toHaveAttribute("aria-pressed", "false");
    expect(btn).toHaveAttribute("tabindex", "0");
  });

  it("reflects selected state via aria-pressed", () => {
    render(
      <Chip selected onSelect={() => {}}>
        On
      </Chip>,
    );
    expect(screen.getByRole("button", { name: "On" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
  });

  it("invokes onSelect(!selected) on click", () => {
    const onSelect = vi.fn();
    render(
      <Chip onSelect={onSelect} selected={false}>
        Toggle
      </Chip>,
    );
    fireEvent.click(screen.getByRole("button"));
    expect(onSelect).toHaveBeenCalledWith(true);
  });

  it("invokes onSelect(false) when selected and clicked", () => {
    const onSelect = vi.fn();
    render(
      <Chip onSelect={onSelect} selected>
        Toggle
      </Chip>,
    );
    fireEvent.click(screen.getByRole("button"));
    expect(onSelect).toHaveBeenCalledWith(false);
  });

  it("toggles on Enter and Space when interactive", () => {
    const onSelect = vi.fn();
    render(<Chip onSelect={onSelect}>Toggle</Chip>);
    const btn = screen.getByRole("button");
    fireEvent.keyDown(btn, { key: "Enter" });
    expect(onSelect).toHaveBeenCalledWith(true);
    fireEvent.keyDown(btn, { key: " " });
    expect(onSelect).toHaveBeenCalledTimes(2);
  });

  it("ignores keyboard when disabled", () => {
    const onSelect = vi.fn();
    render(
      <Chip onSelect={onSelect} disabled>
        x
      </Chip>,
    );
    fireEvent.keyDown(screen.getByText("x").parentElement!, { key: "Enter" });
    expect(onSelect).not.toHaveBeenCalled();
  });

  it("renders a remove button when onRemove is provided", () => {
    render(<Chip onRemove={() => {}}>Tag</Chip>);
    expect(screen.getByRole("button", { name: "Remover" })).toBeInTheDocument();
  });

  it("does not render remove button without onRemove", () => {
    render(<Chip>Tag</Chip>);
    expect(screen.queryByRole("button", { name: "Remover" })).toBeNull();
  });

  it("calls onRemove when × is clicked and stops propagation", () => {
    const onRemove = vi.fn();
    const onSelect = vi.fn();
    render(
      <Chip onRemove={onRemove} onSelect={onSelect}>
        Both
      </Chip>,
    );
    fireEvent.click(screen.getByRole("button", { name: "Remover" }));
    expect(onRemove).toHaveBeenCalled();
    // Propagation stopped → outer onSelect should NOT fire
    expect(onSelect).not.toHaveBeenCalled();
  });

  it("does not call onRemove when disabled", () => {
    const onRemove = vi.fn();
    render(
      <Chip onRemove={onRemove} disabled>
        Tag
      </Chip>,
    );
    fireEvent.click(screen.getByRole("button", { name: "Remover" }));
    expect(onRemove).not.toHaveBeenCalled();
  });

  it("exposes data attributes", () => {
    render(
      <Chip selected onSelect={() => {}} data-testid="c">
        x
      </Chip>,
    );
    const el = screen.getByTestId("c");
    expect(el).toHaveAttribute("data-selected", "true");
  });

  it("applies md size", () => {
    render(
      <Chip size="md" data-testid="c">
        x
      </Chip>,
    );
    expect(screen.getByTestId("c")).toHaveClass("h-8");
  });

  it("renders leadingIcon", () => {
    render(
      <Chip leadingIcon={<span data-testid="ic">•</span>}>Tag</Chip>,
    );
    expect(screen.getByTestId("ic")).toBeInTheDocument();
  });

  it("forwards the ref to the root span", () => {
    const ref = { current: null as HTMLSpanElement | null };
    render(<Chip ref={ref}>x</Chip>);
    expect(ref.current).toBeInstanceOf(HTMLSpanElement);
  });

  describe("brand-aware tokens (per #125)", () => {
    it("selected variant uses stable bg-action + text-button-fg with NO hover override", () => {
      // WHY: hover does not override `selected: true` on action surfaces.
      // See docs/adr/ADR-002-hover-on-action-surfaces.md.
      render(
        <Chip selected onSelect={() => {}} data-testid="c">
          Selected
        </Chip>,
      );
      const c = screen.getByTestId("c");
      expect(c.className).toMatch(/bg-action(?!-hover)/);
      expect(c.className).toMatch(/border-action(?!-hover)/);
      expect(c.className).toMatch(/text-button-fg(?!-hover)/);
      expect(c.className).not.toMatch(/hover:bg-action-hover/);
      expect(c.className).not.toMatch(/hover:border-action-hover/);
      expect(c.className).not.toMatch(/hover:text-button-fg-hover/);
      expect(c.className).not.toMatch(/guardia-purple-(100|500|700)/);
      expect(c.className).not.toMatch(/\btext-white\b/);
    });

    it("non-interactive selected variant keeps action surface stable on hover", () => {
      // WHY: ADR-002 governs the `selected: true ∧ interactive: false` cell of
      // the variant matrix too. Without this guard, hover would override
      // `bg-action` with `bg-background` (JSDoc Mode 4 and split-interactive
      // Mode 3 both hit this path).
      // See docs/adr/ADR-002-hover-on-action-surfaces.md.
      render(
        <Chip selected data-testid="c">
          Selected (non-interactive)
        </Chip>,
      );
      const c = screen.getByTestId("c");
      expect(c.className).toMatch(/bg-action(?!-hover)/);
      expect(c.className).toMatch(/border-action(?!-hover)/);
      expect(c.className).toMatch(/text-button-fg(?!-hover)/);
      expect(c.className).not.toMatch(/hover:bg-background/);
      expect(c.className).not.toMatch(/hover:border-border-strong/);
    });

    it("unselected variant uses bg-bg-hover + border-action on hover", () => {
      render(
        <Chip onSelect={() => {}} data-testid="c">
          Unselected
        </Chip>,
      );
      const c = screen.getByTestId("c");
      expect(c.className).toMatch(/hover:bg-bg-hover/);
      expect(c.className).toMatch(/hover:border-action(?!-hover)/);
      expect(c.className).not.toMatch(/guardia-purple-(100|500|700)/);
    });
  });

  describe("a11y", () => {
    it("has no WCAG 2.1 AA violations in light + dark (unselected interactive)", async () => {
      const { container } = render(<Chip onSelect={() => {}}>Filter</Chip>);
      await axeInThemes(container);
    });

    it("has no WCAG 2.1 AA violations in light + dark (selected interactive)", async () => {
      const { container } = render(
        <Chip selected onSelect={() => {}}>
          Selected filter
        </Chip>,
      );
      await axeInThemes(container);
    });

    it("has no WCAG 2.1 AA violations in light + dark (removable + selected)", async () => {
      const { container } = render(
        <Chip selected onSelect={() => {}} onRemove={() => {}}>
          Both
        </Chip>,
      );
      await axeInThemes(container);
    });

    it("has no WCAG 2.1 AA violations in light + dark when disabled", async () => {
      const { container } = render(
        <Chip onSelect={() => {}} disabled>
          Disabled
        </Chip>,
      );
      await axeInThemes(container);
    });

    it("has no WCAG 2.1 AA violations in light + dark (removable + unselected)", async () => {
      const { container } = render(
        <Chip onRemove={() => {}}>Removable tag</Chip>,
      );
      await axeInThemes(container);
    });

    it("has no WCAG 2.1 AA violations in light + dark (selected + leadingIcon)", async () => {
      // WHY: icons inherit currentColor — covers non-text contrast (WCAG 1.4.11, 3:1 min)
      // on top of the brand-aware fg/bg pair in selected state across both themes.
      const Icon = () => (
        <svg aria-hidden="true" viewBox="0 0 16 16" width="14" height="14">
          <circle cx="8" cy="8" r="6" fill="currentColor" />
        </svg>
      );
      const { container } = render(
        <Chip selected onSelect={() => {}} leadingIcon={<Icon />}>
          With icon
        </Chip>,
      );
      await axeInThemes(container);
    });
  });

  describe("variant + appearance API (per #168 / ADR-003)", () => {
    // WHY: each selected solid variant has a token mapping per ADR-003
    // decisão 6 (Foreground color overrides for low-contrast solids).
    // These guards assert the compound variant matrix renders the exact
    // bg/border/text triplet per cell.
    describe("selected: true (always solid, regardless of `appearance` per ADR-003 decisão 5)", () => {
      it.each([
        { variant: "neutral" as const,  bg: /bg-guardia-gray-500/,        border: /border-guardia-gray-500/,        fg: /\btext-white\b/ },
        { variant: "brand" as const,    bg: /bg-action(?!-hover)/,        border: /border-action(?!-hover)/,        fg: /text-button-fg(?!-hover)/ },
        { variant: "accent" as const,   bg: /bg-accent-brand(?!-hover)/,  border: /border-accent-brand(?!-hover)/,  fg: /text-guardia-gray-900/ },
        { variant: "success" as const,  bg: /bg-signal-green/,            border: /border-signal-green/,            fg: /text-guardia-gray-900/ },
        { variant: "warning" as const,  bg: /bg-signal-yellow/,           border: /border-signal-yellow/,           fg: /text-guardia-purple-900/ },
        { variant: "danger" as const,   bg: /bg-signal-red/,              border: /border-signal-red/,              fg: /text-guardia-gray-900/ },
        { variant: "info" as const,     bg: /bg-signal-blue/,             border: /border-signal-blue/,             fg: /\btext-white\b/ },
      ])("variant=$variant selected uses solid tokens per ADR-003 table", ({ variant, bg, border, fg }) => {
        render(
          <Chip variant={variant} selected onSelect={() => {}} data-testid="c">
            {variant}
          </Chip>,
        );
        const c = screen.getByTestId("c");
        expect(c.className).toMatch(bg);
        expect(c.className).toMatch(border);
        expect(c.className).toMatch(fg);
        // ADR-002 + ADR-003 decisão 7: no hover override on selected
        expect(c.className).not.toMatch(/hover:bg-[a-z]/);
      });
    });

    describe("selected: false, appearance: outline (default resting)", () => {
      it("default render (no props) matches `variant=brand appearance=outline` byte-identical (backward-compat per ADR-003 decisão 4)", () => {
        render(<Chip data-testid="c">Default</Chip>);
        const c = screen.getByTestId("c");
        // Backward-compat: current resting look preserved
        expect(c.className).toMatch(/bg-background/);
        expect(c.className).toMatch(/border-border-strong/);
        expect(c.className).toMatch(/text-foreground/);
        // data-attribute exposed for consumer styling
        expect(c).toHaveAttribute("data-variant", "brand");
        expect(c).toHaveAttribute("data-appearance", "outline");
      });

      it.each([
        { variant: "neutral" as const, border: /border-border-strong/ },
        { variant: "brand" as const,   border: /border-border-strong/ }, // backward-compat
        { variant: "accent" as const,  border: /border-accent-brand(?!-hover)/ },
        { variant: "success" as const, border: /border-signal-green/ },
        { variant: "warning" as const, border: /border-signal-yellow/ },
        { variant: "danger" as const,  border: /border-signal-red/ },
        { variant: "info" as const,    border: /border-signal-blue/ },
      ])("variant=$variant outline carries variant-tinted border + neutral text (AA-safe)", ({ variant, border }) => {
        render(
          <Chip variant={variant} appearance="outline" data-testid="c">
            {variant}
          </Chip>,
        );
        const c = screen.getByTestId("c");
        expect(c.className).toMatch(border);
        expect(c.className).toMatch(/text-foreground/);
        expect(c.className).toMatch(/bg-background/);
      });
    });

    describe("selected: false, appearance: soft (Badge-style tinted resting)", () => {
      it.each([
        { variant: "neutral" as const, bg: /bg-guardia-gray-100/,    fg: /text-guardia-gray-700/ },
        { variant: "brand" as const,   bg: /bg-guardia-purple-100/,  fg: /text-guardia-purple-700/ },
        { variant: "accent" as const,  bg: /bg-guardia-orange-100/,  fg: /text-guardia-orange-700/ },
        { variant: "warning" as const, bg: /bg-guardia-yellow-100/,  fg: /text-guardia-yellow-900/ },
      ])("variant=$variant soft uses tinted bg + matching text shade", ({ variant, bg, fg }) => {
        render(
          <Chip variant={variant} appearance="soft" data-testid="c">
            {variant}
          </Chip>,
        );
        const c = screen.getByTestId("c");
        expect(c.className).toMatch(bg);
        expect(c.className).toMatch(fg);
        expect(c.className).toMatch(/border-transparent/);
      });

      // Signal-* variants — assert the semantic shade tokens (see
      // ui_kit/styles/index.css `--signal-{color}-100 / -700`). Any regression
      // back to inline color-mix or wrong token name is caught here.
      it.each([
        { variant: "success" as const, bg: /bg-signal-green-100/,  fg: /text-signal-green-700/ },
        { variant: "danger" as const,  bg: /bg-signal-red-100/,    fg: /text-signal-red-700/ },
        { variant: "info" as const,    bg: /bg-signal-blue-100/,   fg: /text-signal-blue-700/ },
      ])("variant=$variant soft uses bg-signal-{color}-100 + text-signal-{color}-700", ({ variant, bg, fg }) => {
        render(
          <Chip variant={variant} appearance="soft" data-testid="c">
            {variant}
          </Chip>,
        );
        const c = screen.getByTestId("c");
        expect(c.className).toMatch(bg);
        expect(c.className).toMatch(fg);
        expect(c.className).toMatch(/border-transparent/);
        // Negative guard: no inline color-mix utility leaked into the className.
        expect(c.className).not.toContain("color-mix");
      });
    });

    describe("ADR-003 decisão 5 — `selected: true` ignores `appearance` (always solid)", () => {
      it.each(["soft" as const, "outline" as const, "solid" as const])(
        "appearance=%s + selected=true renders as variant=brand solid (ignored)",
        (appearance) => {
          render(
            <Chip variant="brand" appearance={appearance} selected onSelect={() => {}} data-testid="c">
              forced solid
            </Chip>,
          );
          const c = screen.getByTestId("c");
          // ALWAYS solid action surface, regardless of `appearance`
          expect(c.className).toMatch(/bg-action(?!-hover)/);
          expect(c.className).toMatch(/text-button-fg(?!-hover)/);
          // Never the soft tint
          expect(c.className).not.toMatch(/bg-guardia-purple-100/);
        },
      );
    });

    describe("WCAG AA — jest-axe on every variant × selected combo", () => {
      const variants = ["neutral", "brand", "accent", "success", "warning", "danger", "info"] as const;
      it.each(variants)("variant=%s selected has no WCAG 2.1 AA violations in light + dark", async (variant) => {
        const { container } = render(
          <Chip variant={variant} selected onSelect={() => {}}>
            {variant}
          </Chip>,
        );
        await axeInThemes(container);
      });
      it.each(variants)("variant=%s outline (resting) has no WCAG 2.1 AA violations in light + dark", async (variant) => {
        const { container } = render(
          <Chip variant={variant} appearance="outline" onSelect={() => {}}>
            {variant}
          </Chip>,
        );
        await axeInThemes(container);
      });
    });
  });
});
