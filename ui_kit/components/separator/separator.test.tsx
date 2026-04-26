import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";

import { Separator } from "./index";

describe("Separator", () => {
  it("renderiza com role separator (Radix decorative=false torna o role explícito quando label)", () => {
    render(<Separator label="seção" />);
    const sep = screen.getByRole("separator");
    expect(sep).toBeInTheDocument();
    expect(sep).toHaveTextContent("seção");
  });

  it("orientação default é horizontal", () => {
    const { container } = render(<Separator data-testid="sep" />);
    const sep = container.querySelector('[data-testid="sep"]');
    expect(sep).toHaveAttribute("data-orientation", "horizontal");
  });

  it("aceita orientation=vertical", () => {
    const { container } = render(
      <Separator orientation="vertical" data-testid="sep" />,
    );
    const sep = container.querySelector('[data-testid="sep"]');
    expect(sep).toHaveAttribute("data-orientation", "vertical");
  });

  it("aplica appearance=dashed via background gradient", () => {
    const { container } = render(
      <Separator appearance="dashed" data-testid="sep" />,
    );
    const sep = container.querySelector(
      '[data-testid="sep"]',
    ) as HTMLElement | null;
    expect(sep).not.toBeNull();
    expect(sep!.getAttribute("style") ?? "").toMatch(/repeating-linear-gradient/);
  });

  it("aplica appearance=dotted via background gradient", () => {
    const { container } = render(
      <Separator appearance="dotted" data-testid="sep" />,
    );
    const sep = container.querySelector(
      '[data-testid="sep"]',
    ) as HTMLElement | null;
    expect(sep!.getAttribute("style") ?? "").toMatch(/repeating-linear-gradient/);
  });

  it("appearance=solid não aplica gradient", () => {
    const { container } = render(
      <Separator appearance="solid" data-testid="sep" />,
    );
    const sep = container.querySelector(
      '[data-testid="sep"]',
    ) as HTMLElement | null;
    expect(sep!.getAttribute("style") ?? "").not.toMatch(
      /repeating-linear-gradient/,
    );
  });

  it("renderiza com label centralizado", () => {
    render(<Separator label="ou" />);
    expect(screen.getByText("ou")).toBeInTheDocument();
  });

  it("com label, role=separator é renderizado manualmente (semântico)", () => {
    render(<Separator label="março de 2025" />);
    const sep = screen.getByRole("separator");
    expect(sep).toHaveAttribute("aria-orientation", "horizontal");
  });

  it("respeita className customizado", () => {
    const { container } = render(
      <Separator className="my-4" data-testid="sep" />,
    );
    const sep = container.querySelector('[data-testid="sep"]');
    expect(sep).toHaveClass("my-4");
  });

  it("decorative explícito=false sobrescreve o default", () => {
    const { container } = render(
      <Separator decorative={false} data-testid="sep" />,
    );
    /* Radix renderiza role=separator quando decorative=false */
    const sep = container.querySelector('[data-testid="sep"]');
    expect(sep).toHaveAttribute("role", "separator");
  });

  it("sem label é decorativo por default (role=none/presentation)", () => {
    const { container } = render(<Separator data-testid="sep" />);
    const sep = container.querySelector('[data-testid="sep"]');
    /* Radix com decorative=true usa role=none */
    expect(sep?.getAttribute("role") ?? "none").toBe("none");
  });
});
