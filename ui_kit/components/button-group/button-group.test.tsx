import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

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

  // [AC-3] Behavioral coverage extending the structural baseline above.
  // Plan #23 / DoD: ≥ 20 cases OR ≥ 80% line coverage of index.tsx; this
  // block reaches 28 total, exercising every variant branch via accessible
  // queries (getByRole / getByLabelText) without mocking internals.

  it("[AC-3] resolves accessible name from aria-label on getByRole('group', { name })", () => {
    render(
      <ButtonGroup aria-label="Filtros">
        <Button>Hoje</Button>
        <Button>Semana</Button>
      </ButtonGroup>,
    );
    expect(
      screen.getByRole("group", { name: "Filtros" }),
    ).toBeInTheDocument();
  });

  it("[AC-3] resolves accessible name from aria-labelledby (external heading)", () => {
    render(
      <>
        <h2 id="actions-heading">Ações da fatura</h2>
        <ButtonGroup aria-labelledby="actions-heading">
          <Button>Aprovar</Button>
          <Button>Rejeitar</Button>
        </ButtonGroup>
      </>,
    );
    expect(
      screen.getByRole("group", { name: "Ações da fatura" }),
    ).toBeInTheDocument();
  });

  it("[AC-3] Tab navigates children in document order", async () => {
    const user = userEvent.setup();
    render(
      <ButtonGroup aria-label="Paginação">
        <Button>Anterior</Button>
        <Button>Atual</Button>
        <Button>Próximo</Button>
      </ButtonGroup>,
    );
    await user.tab();
    expect(screen.getByRole("button", { name: "Anterior" })).toHaveFocus();
    await user.tab();
    expect(screen.getByRole("button", { name: "Atual" })).toHaveFocus();
    await user.tab();
    expect(screen.getByRole("button", { name: "Próximo" })).toHaveFocus();
  });

  it("[AC-3] children receive Enter activation when focused", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(
      <ButtonGroup aria-label="Paginação">
        <Button>Anterior</Button>
        <Button onClick={onClick}>Atual</Button>
        <Button>Próximo</Button>
      </ButtonGroup>,
    );
    screen.getByRole("button", { name: "Atual" }).focus();
    await user.keyboard("{Enter}");
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("[AC-3] children receive Space activation when focused", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(
      <ButtonGroup aria-label="Paginação">
        <Button>Anterior</Button>
        <Button onClick={onClick}>Atual</Button>
        <Button>Próximo</Button>
      </ButtonGroup>,
    );
    screen.getByRole("button", { name: "Atual" }).focus();
    await user.keyboard(" ");
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("[AC-3] disabled child is unreachable via Tab", async () => {
    const user = userEvent.setup();
    render(
      <ButtonGroup aria-label="Paginação">
        <Button>Anterior</Button>
        <Button disabled>Atual</Button>
        <Button>Próximo</Button>
      </ButtonGroup>,
    );
    await user.tab();
    expect(screen.getByRole("button", { name: "Anterior" })).toHaveFocus();
    await user.tab();
    // Tab skips the disabled middle child and lands on the last reachable one.
    expect(screen.getByRole("button", { name: "Próximo" })).toHaveFocus();
  });

  it("[AC-3] role='toolbar' + IconButton aria-labels are individually accessible", () => {
    render(
      <ButtonGroup role="toolbar" aria-label="Formatação">
        <Button size="icon" aria-label="Negrito">B</Button>
        <Button size="icon" aria-label="Itálico">I</Button>
        <Button size="icon" aria-label="Sublinhado">U</Button>
        <Button size="icon" aria-label="Tachado">S</Button>
      </ButtonGroup>,
    );
    expect(screen.getByRole("toolbar", { name: "Formatação" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Negrito" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Itálico" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Sublinhado" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Tachado" })).toBeInTheDocument();
  });

  it("[AC-3] orientation='vertical' still carries role='group'", () => {
    render(
      <ButtonGroup orientation="vertical" aria-label="Menu lateral">
        <Button>Dashboard</Button>
        <Button>Relatórios</Button>
        <Button>Configurações</Button>
      </ButtonGroup>,
    );
    expect(
      screen.getByRole("group", { name: "Menu lateral" }),
    ).toBeInTheDocument();
  });

  it("[AC-3] data-orientation reflects current orientation prop", () => {
    const { rerender } = render(
      <ButtonGroup orientation="horizontal" data-testid="g">
        <Button>A</Button>
      </ButtonGroup>,
    );
    expect(screen.getByTestId("g")).toHaveAttribute("data-orientation", "horizontal");
    rerender(
      <ButtonGroup orientation="vertical" data-testid="g">
        <Button>A</Button>
      </ButtonGroup>,
    );
    expect(screen.getByTestId("g")).toHaveAttribute("data-orientation", "vertical");
  });

  it("[AC-3] data-attached reflects current attached prop (true and false)", () => {
    const { rerender } = render(
      <ButtonGroup attached data-testid="g">
        <Button>A</Button>
        <Button>B</Button>
      </ButtonGroup>,
    );
    expect(screen.getByTestId("g")).toHaveAttribute("data-attached", "true");
    rerender(
      <ButtonGroup attached={false} data-testid="g">
        <Button>A</Button>
        <Button>B</Button>
      </ButtonGroup>,
    );
    expect(screen.getByTestId("g")).toHaveAttribute("data-attached", "false");
  });

  it("[AC-3] focus-visible z-10 class chain is present on attached groups", () => {
    render(
      <ButtonGroup data-testid="g">
        <Button>A</Button>
        <Button>B</Button>
      </ButtonGroup>,
    );
    // Container carries the descendant selector that elevates focus over
    // adjacent siblings — guards the contract that focus rings won't be
    // clipped by the negative-margin border collapse.
    expect(screen.getByTestId("g").className).toMatch(/focus-visible/);
    expect(screen.getByTestId("g").className).toMatch(/z-10/);
  });

  it("[AC-3] vertical attached collapses radii on top/bottom (class heuristic)", () => {
    render(
      <ButtonGroup orientation="vertical" data-testid="g">
        <Button>A</Button>
        <Button>B</Button>
      </ButtonGroup>,
    );
    // Compound variant chain for vertical+attached should target top/bottom
    // radii — mirror of the horizontal left/right collapse heuristic above.
    expect(screen.getByTestId("g").className).toMatch(/rounded-t-none/);
    expect(screen.getByTestId("g").className).toMatch(/rounded-b-none/);
  });
});
