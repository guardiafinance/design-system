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
    it("selected variant uses bg-action + text-button-fg with action-hover on hover", () => {
      render(
        <Chip selected onSelect={() => {}} data-testid="c">
          Selected
        </Chip>,
      );
      const c = screen.getByTestId("c");
      expect(c.className).toMatch(/bg-action(?!-hover)/);
      expect(c.className).toMatch(/border-action(?!-hover)/);
      expect(c.className).toMatch(/text-button-fg/);
      expect(c.className).toMatch(/hover:bg-action-hover/);
      expect(c.className).toMatch(/hover:border-action-hover/);
      expect(c.className).not.toMatch(/guardia-violet-(100|500|700)/);
      expect(c.className).not.toMatch(/\btext-white\b/);
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
      expect(c.className).not.toMatch(/guardia-violet-(100|500|700)/);
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
  });
});
