import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";

import { axeInThemes } from "@/test-utils/a11y";
import { IconButton } from "./index";

const Icon = () => (
  <svg data-testid="icon" viewBox="0 0 24 24" width="16" height="16">
    <circle cx="12" cy="12" r="4" />
  </svg>
);

describe("<IconButton />", () => {
  it("renders as a button with the given icon as children", () => {
    render(
      <IconButton aria-label="Salvar">
        <Icon />
      </IconButton>,
    );
    const btn = screen.getByRole("button", { name: "Salvar" });
    expect(btn).toBeInTheDocument();
    expect(screen.getByTestId("icon")).toBeInTheDocument();
  });

  it("defaults to ghost variant + md size + square shape", () => {
    render(
      <IconButton aria-label="x" data-testid="b">
        <Icon />
      </IconButton>,
    );
    const b = screen.getByTestId("b");
    expect(b).toHaveClass("h-9", "w-9");
    expect(b).toHaveClass("rounded-md");
    expect(b).toHaveClass("bg-transparent");
  });

  it("applies variants (default / secondary / destructive / outline)", () => {
    const { rerender } = render(
      <IconButton aria-label="x" variant="default" data-testid="b">
        <Icon />
      </IconButton>,
    );
    expect(screen.getByTestId("b")).toHaveClass("bg-primary");

    rerender(
      <IconButton aria-label="x" variant="secondary" data-testid="b">
        <Icon />
      </IconButton>,
    );
    expect(screen.getByTestId("b")).toHaveClass("bg-secondary");

    rerender(
      <IconButton aria-label="x" variant="destructive" data-testid="b">
        <Icon />
      </IconButton>,
    );
    expect(screen.getByTestId("b")).toHaveClass("text-destructive");

    rerender(
      <IconButton aria-label="x" variant="outline" data-testid="b">
        <Icon />
      </IconButton>,
    );
    expect(screen.getByTestId("b")).toHaveClass("border-border-strong");
  });

  it.each([
    ["sm", "h-7", "w-7"],
    ["md", "h-9", "w-9"],
    ["lg", "h-11", "w-11"],
  ] as const)("applies size %s with class %s/%s", (size, h, w) => {
    render(
      <IconButton aria-label="x" size={size} data-testid="b">
        <Icon />
      </IconButton>,
    );
    const b = screen.getByTestId("b");
    expect(b).toHaveClass(h);
    expect(b).toHaveClass(w);
  });

  it("applies circle shape via rounded-full", () => {
    render(
      <IconButton aria-label="x" shape="circle" data-testid="b">
        <Icon />
      </IconButton>,
    );
    expect(screen.getByTestId("b")).toHaveClass("rounded-full");
  });

  it("fires onClick when enabled", () => {
    const onClick = vi.fn();
    render(
      <IconButton aria-label="x" onClick={onClick}>
        <Icon />
      </IconButton>,
    );
    fireEvent.click(screen.getByRole("button"));
    expect(onClick).toHaveBeenCalledOnce();
  });

  it("does not fire onClick when disabled", () => {
    const onClick = vi.fn();
    render(
      <IconButton aria-label="x" onClick={onClick} disabled>
        <Icon />
      </IconButton>,
    );
    fireEvent.click(screen.getByRole("button"));
    expect(onClick).not.toHaveBeenCalled();
  });

  it("shows spinner and disables the button when loading", () => {
    render(
      <IconButton aria-label="Salvando" loading>
        <Icon />
      </IconButton>,
    );
    const btn = screen.getByRole("button");
    expect(btn).toBeDisabled();
    expect(btn).toHaveAttribute("aria-busy", "true");
    expect(btn).toHaveAttribute("data-loading", "true");
    // Original icon is replaced by spinner (queryByTestId returns null)
    expect(screen.queryByTestId("icon")).toBeNull();
  });

  it("spinner animates only when motion is not reduced", () => {
    render(
      <IconButton aria-label="x" loading>
        <Icon />
      </IconButton>,
    );
    const svg = screen.getByRole("button").querySelector("svg");
    expect(svg?.className.baseVal).toMatch(/motion-safe:animate-spin/);
  });

  it("supports aria-labelledby as an alternative", () => {
    render(
      <>
        <span id="lbl">Salvar documento</span>
        <IconButton aria-labelledby="lbl">
          <Icon />
        </IconButton>
      </>,
    );
    expect(
      screen.getByRole("button", { name: "Salvar documento" }),
    ).toBeInTheDocument();
  });

  it("renders as child element via asChild (Radix Slot)", () => {
    render(
      <IconButton asChild aria-label="Ir para home">
        <a href="/home">
          <Icon />
        </a>
      </IconButton>,
    );
    const link = screen.getByRole("link", { name: "Ir para home" });
    expect(link).toHaveAttribute("href", "/home");
    expect(link).toHaveClass("h-9");
  });

  it("forwards the ref to the button", () => {
    const ref = { current: null as HTMLButtonElement | null };
    render(
      <IconButton ref={ref} aria-label="x">
        <Icon />
      </IconButton>,
    );
    expect(ref.current).toBeInstanceOf(HTMLButtonElement);
  });

  it("warns in dev when neither aria-label nor aria-labelledby is present", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    render(
      <IconButton>
        <Icon />
      </IconButton>,
    );
    expect(warn).toHaveBeenCalledWith(
      expect.stringContaining("aria-label"),
    );
    warn.mockRestore();
  });

  it("does NOT warn when aria-label is present", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    render(
      <IconButton aria-label="Ok">
        <Icon />
      </IconButton>,
    );
    expect(warn).not.toHaveBeenCalled();
    warn.mockRestore();
  });

  describe("brand-aware hover tokens (per #125)", () => {
    it("outline variant uses bg-bg-hover + border-action on hover", () => {
      render(
        <IconButton aria-label="x" variant="outline" data-testid="b">
          <Icon />
        </IconButton>,
      );
      const b = screen.getByTestId("b");
      expect(b.className).toMatch(/hover:bg-bg-hover/);
      expect(b.className).toMatch(/hover:border-action/);
      expect(b.className).not.toMatch(/guardia-purple-(100|500|700)/);
    });

    it("ghost variant uses bg-bg-hover + text-action-hover on hover", () => {
      render(
        <IconButton aria-label="x" variant="ghost" data-testid="b">
          <Icon />
        </IconButton>,
      );
      const b = screen.getByTestId("b");
      expect(b.className).toMatch(/hover:bg-bg-hover/);
      expect(b.className).toMatch(/hover:text-action-hover/);
      expect(b.className).not.toMatch(/guardia-purple-(100|500|700)/);
    });
  });

  describe("a11y", () => {
    it("has no WCAG 2.1 AA violations in light + dark (ghost — default)", async () => {
      const { container } = render(
        <IconButton aria-label="Salvar">
          <Icon />
        </IconButton>,
      );
      await axeInThemes(container);
    });

    it("has no WCAG 2.1 AA violations in light + dark (interactive variants)", async () => {
      const { container } = render(
        <div>
          <IconButton aria-label="default" variant="default">
            <Icon />
          </IconButton>
          <IconButton aria-label="secondary" variant="secondary">
            <Icon />
          </IconButton>
          <IconButton aria-label="destructive" variant="destructive">
            <Icon />
          </IconButton>
          <IconButton aria-label="outline" variant="outline">
            <Icon />
          </IconButton>
          <IconButton aria-label="ghost" variant="ghost">
            <Icon />
          </IconButton>
        </div>,
      );
      await axeInThemes(container);
    });

    it("has no WCAG 2.1 AA violations in light + dark when disabled/loading", async () => {
      const { container } = render(
        <div>
          <IconButton aria-label="desabilitado" disabled>
            <Icon />
          </IconButton>
          <IconButton aria-label="carregando" loading>
            <Icon />
          </IconButton>
        </div>,
      );
      await axeInThemes(container);
    });
  });
});
