import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";

import { Button } from "../button";
import { ButtonGroup } from "./index";

describe("<ButtonGroup />", () => {
  it("renders with role='group' by default", () => {
    render(
      <ButtonGroup>
        <Button>A</Button>
        <Button>B</Button>
      </ButtonGroup>,
    );
    expect(screen.getByRole("group")).toBeInTheDocument();
  });

  it("defaults to horizontal + attached", () => {
    render(
      <ButtonGroup data-testid="g">
        <Button>A</Button>
      </ButtonGroup>,
    );
    const g = screen.getByTestId("g");
    expect(g).toHaveAttribute("data-orientation", "horizontal");
    expect(g).toHaveAttribute("data-attached", "true");
    expect(g).toHaveClass("flex-row");
  });

  it("applies vertical orientation", () => {
    render(
      <ButtonGroup orientation="vertical" data-testid="g">
        <Button>A</Button>
      </ButtonGroup>,
    );
    expect(screen.getByTestId("g")).toHaveClass("flex-col");
  });

  it("adds gap when attached=false", () => {
    render(
      <ButtonGroup attached={false} data-testid="g">
        <Button>A</Button>
        <Button>B</Button>
      </ButtonGroup>,
    );
    expect(screen.getByTestId("g")).toHaveClass("gap-2");
  });

  it("collapses borders horizontally when attached (class heuristic)", () => {
    render(
      <ButtonGroup data-testid="g">
        <Button>A</Button>
        <Button>B</Button>
      </ButtonGroup>,
    );
    const g = screen.getByTestId("g");
    // Selector-based classes aplicadas ao container
    expect(g.className).toMatch(/first-child/);
    expect(g.className).toMatch(/last-child/);
  });

  it("renders children in declared order", () => {
    render(
      <ButtonGroup>
        <Button>Primeiro</Button>
        <Button>Meio</Button>
        <Button>Último</Button>
      </ButtonGroup>,
    );
    const buttons = screen.getAllByRole("button");
    expect(buttons[0]).toHaveTextContent("Primeiro");
    expect(buttons[1]).toHaveTextContent("Meio");
    expect(buttons[2]).toHaveTextContent("Último");
  });

  it("supports aria-label for semantic grouping", () => {
    render(
      <ButtonGroup aria-label="Paginação">
        <Button>1</Button>
      </ButtonGroup>,
    );
    expect(screen.getByRole("group", { name: "Paginação" })).toBeInTheDocument();
  });

  it("accepts a custom role (e.g. toolbar)", () => {
    render(
      <ButtonGroup role="toolbar" aria-label="Formatação">
        <Button>B</Button>
        <Button>I</Button>
      </ButtonGroup>,
    );
    expect(screen.getByRole("toolbar", { name: "Formatação" })).toBeInTheDocument();
  });

  it("forwards the ref to the root element", () => {
    const ref = { current: null as HTMLDivElement | null };
    render(
      <ButtonGroup ref={ref}>
        <Button>A</Button>
      </ButtonGroup>,
    );
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });

  it("merges className", () => {
    render(
      <ButtonGroup className="rounded-xl" data-testid="g">
        <Button>A</Button>
      </ButtonGroup>,
    );
    expect(screen.getByTestId("g")).toHaveClass("rounded-xl");
    expect(screen.getByTestId("g")).toHaveClass("inline-flex");
  });
});
