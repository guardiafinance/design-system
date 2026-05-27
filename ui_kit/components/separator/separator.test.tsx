import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";

import { axeInThemes } from "@/test-utils/a11y";
import { Separator } from "./index";

/**
 * Separator é um primitivo puramente visual: não tem `disabled`, `hover`,
 * `focus`, nem entra no tab order. A cobertura a11y se concentra em:
 *
 *   1. Não-interatividade (não vaza para o tab order).
 *   2. jest-axe em light + dark cobrindo cada variante meaningful
 *      (Default / Dashed / Dotted / Vertical / WithLabel / DashedWithLabel),
 *      via `axeInThemes` que alterna `data-theme` no `<html>`.
 *
 * Queries: preferem `getByRole('separator')` quando aplicável (label semântico
 * OU `decorative=false`); caem em `data-testid` no container quando o Radix
 * renderiza com `role="none"` (decorative=true), por ausência de role acessível
 * — único caso documentado em que `data-testid` é o fallback aceito.
 */
describe("Separator", () => {
  it("AC-3: renderiza com role separator (Radix decorative=false torna o role explícito quando label)", () => {
    render(<Separator label="seção" />);
    const sep = screen.getByRole("separator");
    expect(sep).toBeInTheDocument();
    expect(sep).toHaveTextContent("seção");
  });

  it("AC-3: orientação default é horizontal", () => {
    const { container } = render(<Separator data-testid="sep" />);
    const sep = container.querySelector('[data-testid="sep"]');
    expect(sep).toHaveAttribute("data-orientation", "horizontal");
  });

  it("AC-3: aceita orientation=vertical", () => {
    const { container } = render(
      <Separator orientation="vertical" data-testid="sep" />,
    );
    const sep = container.querySelector('[data-testid="sep"]');
    expect(sep).toHaveAttribute("data-orientation", "vertical");
  });

  it("AC-3: aplica appearance=dashed via background gradient", () => {
    const { container } = render(
      <Separator appearance="dashed" data-testid="sep" />,
    );
    const sep = container.querySelector(
      '[data-testid="sep"]',
    ) as HTMLElement | null;
    expect(sep).not.toBeNull();
    expect(sep!.getAttribute("style") ?? "").toMatch(/repeating-linear-gradient/);
  });

  it("AC-3: horizontal dashed usa period 12px (6/6) — wip parity", () => {
    const { container } = render(
      <Separator appearance="dashed" orientation="horizontal" data-testid="sep" />,
    );
    const sep = container.querySelector(
      '[data-testid="sep"]',
    ) as HTMLElement;
    expect(sep.getAttribute("style") ?? "").toMatch(/0 6px, transparent 6px 12px/);
  });

  it("AC-3: vertical dashed usa period 8px (4/4) — wip parity", () => {
    const { container } = render(
      <Separator appearance="dashed" orientation="vertical" data-testid="sep" />,
    );
    const sep = container.querySelector(
      '[data-testid="sep"]',
    ) as HTMLElement;
    expect(sep.getAttribute("style") ?? "").toMatch(/0 4px, transparent 4px 8px/);
  });

  it("AC-3: gradient envolve --border em hsl() (token shadcn é HSL components)", () => {
    const { container } = render(
      <Separator appearance="dashed" data-testid="sep" />,
    );
    const sep = container.querySelector(
      '[data-testid="sep"]',
    ) as HTMLElement;
    expect(sep.getAttribute("style") ?? "").toMatch(/hsl\(var\(--border\)\)/);
  });

  it("AC-3: aplica appearance=dotted via background gradient", () => {
    const { container } = render(
      <Separator appearance="dotted" data-testid="sep" />,
    );
    const sep = container.querySelector(
      '[data-testid="sep"]',
    ) as HTMLElement | null;
    expect(sep!.getAttribute("style") ?? "").toMatch(/repeating-linear-gradient/);
  });

  it("AC-3: appearance=solid não aplica gradient", () => {
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

  it("AC-3: renderiza com label centralizado", () => {
    render(<Separator label="ou" />);
    expect(screen.getByText("ou")).toBeInTheDocument();
  });

  it("AC-3: com label, role=separator é renderizado manualmente (semântico)", () => {
    render(<Separator label="março de 2025" />);
    const sep = screen.getByRole("separator");
    expect(sep).toHaveAttribute("aria-orientation", "horizontal");
  });

  it("AC-3: respeita className customizado", () => {
    const { container } = render(
      <Separator className="my-4" data-testid="sep" />,
    );
    const sep = container.querySelector('[data-testid="sep"]');
    expect(sep).toHaveClass("my-4");
  });

  it("AC-3: decorative explícito=false sobrescreve o default", () => {
    const { container } = render(
      <Separator decorative={false} data-testid="sep" />,
    );
    /* Radix renderiza role=separator quando decorative=false */
    const sep = container.querySelector('[data-testid="sep"]');
    expect(sep).toHaveAttribute("role", "separator");
  });

  it("AC-3: sem label é decorativo por default (role=none/presentation)", () => {
    const { container } = render(<Separator data-testid="sep" />);
    const sep = container.querySelector('[data-testid="sep"]');
    /* Radix com decorative=true usa role=none */
    expect(sep?.getAttribute("role") ?? "none").toBe("none");
  });

  it("AC-4: não-interativo — role=separator não entra no tab order (sem tabindex positivo)", () => {
    /* Separator é primitivo decorativo/semântico, nunca interativo.
     * Radix não adiciona tabindex; qualquer valor != null indicaria regressão. */
    render(<Separator label="seção" />);
    const sep = screen.getByRole("separator");
    const tabindex = sep.getAttribute("tabindex");
    expect(tabindex === null || Number(tabindex) < 0).toBe(true);
  });

  describe("AC-4: jest-axe — sem violações WCAG 2.1 AA em light + dark", () => {
    it("Default (solid decorative) — light + dark", async () => {
      const { container } = render(<Separator />);
      await axeInThemes(container);
    });

    it("Dashed — light + dark", async () => {
      const { container } = render(<Separator appearance="dashed" />);
      await axeInThemes(container);
    });

    it("Dotted — light + dark", async () => {
      const { container } = render(<Separator appearance="dotted" />);
      await axeInThemes(container);
    });

    it("Vertical — light + dark", async () => {
      const { container } = render(
        <div style={{ height: 40, display: "flex" }}>
          <Separator orientation="vertical" />
        </div>,
      );
      await axeInThemes(container);
    });

    it("WithLabel (semântico, role=separator) — light + dark", async () => {
      const { container } = render(<Separator label="seção" />);
      await axeInThemes(container);
    });

    it("DashedWithLabel (semântico + gradient) — light + dark", async () => {
      const { container } = render(
        <Separator appearance="dashed" label="arquivados" />,
      );
      await axeInThemes(container);
    });
  });
});
