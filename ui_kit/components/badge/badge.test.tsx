import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";

import { Badge } from "./index";

describe("<Badge />", () => {
  it("renders its children", () => {
    render(<Badge>Ativo</Badge>);
    expect(screen.getByText("Ativo")).toBeInTheDocument();
  });

  it("defaults to neutral + soft + pill", () => {
    render(<Badge data-testid="b">Ativo</Badge>);
    const el = screen.getByTestId("b");
    expect(el).toHaveAttribute("data-variant", "neutral");
    expect(el).toHaveAttribute("data-appearance", "soft");
    expect(el).toHaveClass("rounded-full");
    expect(el).toHaveClass("bg-guardia-gray-100");
    expect(el).toHaveClass("text-guardia-gray-700");
  });

  it("applies each variant in soft appearance", () => {
    const cases = [
      { variant: "brand",    bg: "bg-guardia-violet-100",  fg: "text-guardia-violet-700" },
      { variant: "accent",   bg: "bg-guardia-orange-100",  fg: "text-guardia-orange-700" },
      { variant: "warning",  bg: "bg-guardia-yellow-100",  fg: "text-guardia-yellow-900" },
    ] as const;
    cases.forEach(({ variant, bg, fg }) => {
      const { unmount } = render(
        <Badge variant={variant} data-testid={`b-${variant}`}>X</Badge>,
      );
      const el = screen.getByTestId(`b-${variant}`);
      expect(el).toHaveClass(bg);
      expect(el).toHaveClass(fg);
      unmount();
    });
  });

  it("applies solid appearance with white text", () => {
    render(<Badge appearance="solid" variant="brand" data-testid="b">X</Badge>);
    const el = screen.getByTestId("b");
    expect(el).toHaveClass("bg-guardia-violet-500");
    expect(el).toHaveClass("text-white");
  });

  it("switches yellow text to violet in solid warning (AA contrast)", () => {
    render(<Badge appearance="solid" variant="warning" data-testid="b">!</Badge>);
    const el = screen.getByTestId("b");
    expect(el).toHaveClass("bg-signal-yellow");
    expect(el).toHaveClass("text-guardia-violet-900");
  });

  it("applies outline appearance with border+text color", () => {
    render(<Badge appearance="outline" variant="danger" data-testid="b">Erro</Badge>);
    const el = screen.getByTestId("b");
    expect(el).toHaveClass("bg-transparent");
    expect(el).toHaveClass("border-signal-red");
    expect(el).toHaveClass("text-signal-red");
  });

  it("applies square shape", () => {
    render(<Badge shape="square" data-testid="b">X</Badge>);
    expect(screen.getByTestId("b")).toHaveClass("rounded-sm");
  });

  it("renders a dot when dot=true", () => {
    const { container } = render(<Badge dot>Ativo</Badge>);
    const dot = container.querySelector("[aria-hidden='true']");
    expect(dot).not.toBeNull();
    expect(dot).toHaveClass("rounded-full");
    expect(dot).toHaveClass("bg-current");
  });

  it("omits the dot by default", () => {
    const { container } = render(<Badge>Ativo</Badge>);
    expect(container.querySelector("[aria-hidden='true']")).toBeNull();
  });

  it("renders leadingIcon and trailingIcon", () => {
    render(
      <Badge
        leadingIcon={<span data-testid="lead">◂</span>}
        trailingIcon={<span data-testid="trail">▸</span>}
      >
        X
      </Badge>,
    );
    expect(screen.getByTestId("lead")).toBeInTheDocument();
    expect(screen.getByTestId("trail")).toBeInTheDocument();
  });

  it("forwards the ref to the span element", () => {
    const ref = { current: null as HTMLSpanElement | null };
    render(<Badge ref={ref}>X</Badge>);
    expect(ref.current).toBeInstanceOf(HTMLSpanElement);
  });

  it("exposes data attributes for variant and appearance", () => {
    render(<Badge variant="success" appearance="outline" data-testid="b">ok</Badge>);
    const el = screen.getByTestId("b");
    expect(el).toHaveAttribute("data-variant", "success");
    expect(el).toHaveAttribute("data-appearance", "outline");
  });
});
