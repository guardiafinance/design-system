import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";

import { Spinner, SPINNER_PX } from "./index";

describe("Spinner", () => {
  it("renderiza com role status por default", () => {
    render(<Spinner />);
    expect(screen.getByRole("status")).toBeInTheDocument();
  });

  it("anuncia 'Carregando' por default", () => {
    render(<Spinner />);
    expect(screen.getByRole("status")).toHaveAttribute(
      "aria-label",
      "Carregando",
    );
  });

  it("aceita label customizado", () => {
    render(<Spinner label="Conciliando lançamentos" />);
    expect(screen.getByRole("status")).toHaveAttribute(
      "aria-label",
      "Conciliando lançamentos",
    );
  });

  it("renderiza um SVG decorativo (aria-hidden)", () => {
    const { container } = render(<Spinner />);
    const svg = container.querySelector("svg");
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveAttribute("aria-hidden", "true");
  });

  it("size=md (default) gera SVG 20×20", () => {
    const { container } = render(<Spinner />);
    const svg = container.querySelector("svg")!;
    expect(svg.getAttribute("width")).toBe(String(SPINNER_PX.md));
    expect(svg.getAttribute("height")).toBe(String(SPINNER_PX.md));
  });

  it("size=xs gera SVG 12×12", () => {
    const { container } = render(<Spinner size="xs" />);
    const svg = container.querySelector("svg")!;
    expect(svg.getAttribute("width")).toBe(String(SPINNER_PX.xs));
  });

  it("size=xl gera SVG 40×40", () => {
    const { container } = render(<Spinner size="xl" />);
    const svg = container.querySelector("svg")!;
    expect(svg.getAttribute("width")).toBe(String(SPINNER_PX.xl));
  });

  it("color=brand aplica violet-500", () => {
    render(<Spinner color="brand" />);
    expect(screen.getByRole("status")).toHaveClass("text-guardia-purple-500");
  });

  it("color=accent aplica orange-500", () => {
    render(<Spinner color="accent" />);
    expect(screen.getByRole("status")).toHaveClass("text-guardia-orange-500");
  });

  it("color=white aplica text-white", () => {
    render(<Spinner color="white" />);
    expect(screen.getByRole("status")).toHaveClass("text-white");
  });

  it("color=current não aplica nenhuma classe de cor", () => {
    render(<Spinner color="current" />);
    const el = screen.getByRole("status");
    expect(el).not.toHaveClass("text-guardia-purple-500");
    expect(el).not.toHaveClass("text-guardia-orange-500");
    expect(el).not.toHaveClass("text-white");
  });

  it("aplica animação motion-safe", () => {
    render(<Spinner />);
    expect(screen.getByRole("status").className).toMatch(
      /motion-safe:animate-\[spin_900ms_linear_infinite\]/,
    );
  });

  it("aria-hidden=true suprime role + label (decorativo)", () => {
    const { container } = render(<Spinner aria-hidden />);
    const span = container.querySelector("span");
    expect(span).not.toHaveAttribute("role");
    expect(span).not.toHaveAttribute("aria-label");
    expect(span).toHaveAttribute("aria-hidden", "true");
  });

  it("respeita className customizado", () => {
    render(<Spinner className="my-extra" />);
    expect(screen.getByRole("status")).toHaveClass("my-extra");
  });

  it("renderiza como inline-block com baseline neutro (anti-wobble)", () => {
    render(<Spinner />);
    const el = screen.getByRole("status");
    expect(el).toHaveClass("inline-block");
    expect(el).toHaveClass("leading-none");
    expect(el).toHaveClass("align-middle");
    expect(el).toHaveClass("origin-center");
  });

  it("path do SVG bate com wip (arco 270°)", () => {
    const { container } = render(<Spinner />);
    const path = container.querySelector("path");
    expect(path).toHaveAttribute("d", "M21 12a9 9 0 1 1-6.3-8.57");
  });
});
