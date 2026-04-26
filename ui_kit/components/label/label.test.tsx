import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";

import { Label } from "./index";

describe("<Label />", () => {
  it("renders its children as a <label>", () => {
    render(<Label>Email</Label>);
    const label = screen.getByText("Email");
    expect(label).toBeInTheDocument();
    // Radix LabelPrimitive renders a <label>
    expect(label.closest("label")).not.toBeNull();
  });

  it("associates with an input via htmlFor", () => {
    render(
      <>
        <Label htmlFor="email">Email</Label>
        <input id="email" />
      </>,
    );
    const input = screen.getByLabelText("Email");
    expect(input).toHaveAttribute("id", "email");
  });

  it("applies default size (sm)", () => {
    render(<Label data-testid="lbl">Nome</Label>);
    expect(screen.getByTestId("lbl")).toHaveClass("text-[12.5px]");
  });

  it("applies md size", () => {
    render(
      <Label size="md" data-testid="lbl">
        Nome
      </Label>,
    );
    expect(screen.getByTestId("lbl")).toHaveClass("text-sm");
  });

  it("renders required asterisk when required=true", () => {
    render(<Label required>Email</Label>);
    const star = screen.getByText("*");
    expect(star).toBeInTheDocument();
    expect(star).toHaveAttribute("aria-hidden", "true");
    expect(star).toHaveClass("text-destructive");
  });

  it("does not render asterisk without required", () => {
    render(<Label>Email</Label>);
    expect(screen.queryByText("*")).toBeNull();
  });

  it("renders '(opcional)' when optional=true", () => {
    render(<Label optional>Telefone</Label>);
    expect(screen.getByText("(opcional)")).toBeInTheDocument();
  });

  it("accepts a custom optionalLabel", () => {
    render(
      <Label optional optionalLabel="(se preferir)">
        Telefone
      </Label>,
    );
    expect(screen.getByText("(se preferir)")).toBeInTheDocument();
  });

  it("exposes data-required and data-optional", () => {
    render(
      <Label required data-testid="r">
        Nome
      </Label>,
    );
    expect(screen.getByTestId("r")).toHaveAttribute("data-required", "true");
    expect(screen.getByTestId("r")).not.toHaveAttribute("data-optional");
  });

  it("merges className", () => {
    render(
      <Label className="uppercase" data-testid="lbl">
        X
      </Label>,
    );
    expect(screen.getByTestId("lbl")).toHaveClass("uppercase");
    expect(screen.getByTestId("lbl")).toHaveClass("font-semibold");
  });

  it("forwards the ref to the label element", () => {
    const ref = { current: null as HTMLLabelElement | null };
    render(<Label ref={ref}>X</Label>);
    expect(ref.current).toBeInstanceOf(HTMLLabelElement);
  });
});
