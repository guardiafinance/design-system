import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { axeInThemes } from "@/test-utils/a11y";
import { Checkbox } from "./index";

describe("Checkbox", () => {
  it("renderiza com role=checkbox", () => {
    render(<Checkbox />);
    expect(screen.getByRole("checkbox")).toBeInTheDocument();
  });

  it("renderiza standalone (sem label) quando nenhum texto é passado", () => {
    const { container } = render(<Checkbox />);
    /* sem label, não há <label> wrapper */
    expect(container.querySelector("label")).toBeNull();
  });

  it("renderiza wrapper <label> quando label é passada", () => {
    render(<Checkbox label="Aceito" />);
    expect(screen.getByText("Aceito")).toBeInTheDocument();
    expect(screen.getByRole("checkbox").closest("label")).not.toBeNull();
  });

  it("renderiza description com aria-describedby", () => {
    render(<Checkbox label="Notificações" description="Email diário" />);
    const cb = screen.getByRole("checkbox");
    const descId = cb.getAttribute("aria-describedby");
    expect(descId).toBeTruthy();
    const desc = document.getElementById(descId!);
    expect(desc).toHaveTextContent("Email diário");
  });

  it("clique no label alterna o checkbox via htmlFor", async () => {
    const onChange = vi.fn();
    render(<Checkbox label="Aceito" onCheckedChange={onChange} />);
    await userEvent.click(screen.getByText("Aceito"));
    expect(onChange).toHaveBeenCalledWith(true);
  });

  it("checked=true expõe data-state=checked", () => {
    render(<Checkbox checked />);
    expect(screen.getByRole("checkbox")).toHaveAttribute(
      "data-state",
      "checked",
    );
  });

  it("indeterminate=true ativa state mixed (Radix)", () => {
    render(<Checkbox indeterminate />);
    const cb = screen.getByRole("checkbox");
    expect(cb).toHaveAttribute("data-state", "indeterminate");
    /* Radix usa aria-checked="mixed" para indeterminate */
    expect(cb).toHaveAttribute("aria-checked", "mixed");
  });

  it("indeterminate sobrescreve checked", () => {
    render(<Checkbox checked indeterminate />);
    expect(screen.getByRole("checkbox")).toHaveAttribute(
      "data-state",
      "indeterminate",
    );
  });

  it("invalid=true aplica aria-invalid", () => {
    render(<Checkbox invalid label="x" />);
    expect(screen.getByRole("checkbox")).toHaveAttribute(
      "aria-invalid",
      "true",
    );
  });

  it("disabled bloqueia clique", async () => {
    const onChange = vi.fn();
    render(<Checkbox disabled label="x" onCheckedChange={onChange} />);
    await userEvent.click(screen.getByRole("checkbox"));
    expect(onChange).not.toHaveBeenCalled();
  });

  it("size=sm aplica h-4 w-4 (16px)", () => {
    render(<Checkbox size="sm" />);
    expect(screen.getByRole("checkbox").className).toMatch(/h-4 w-4/);
  });

  it("size=md (default) aplica 18px", () => {
    render(<Checkbox />);
    expect(screen.getByRole("checkbox").className).toMatch(/h-\[18px\]/);
  });

  it("auto-gera id quando não passado", () => {
    render(<Checkbox label="auto" />);
    const cb = screen.getByRole("checkbox");
    /* React 19: ids como "_r_c_" · React 18: ":r0:" — ambos não-vazios */
    expect(cb.id).toBeTruthy();
    expect(cb.id.length).toBeGreaterThan(0);
  });

  it("respeita id customizado", () => {
    render(<Checkbox id="my-cb" label="x" />);
    expect(screen.getByRole("checkbox")).toHaveAttribute("id", "my-cb");
  });

  it("brand-aware classes: bg-action + text-button-fg em checked", () => {
    render(<Checkbox checked />);
    const cb = screen.getByRole("checkbox");
    expect(cb.className).toMatch(/data-\[state=checked\]:bg-action/);
    expect(cb.className).toMatch(/data-\[state=checked\]:border-action/);
    expect(cb.className).toMatch(/data-\[state=checked\]:text-button-fg/);
    expect(cb.className).not.toMatch(/guardia-violet-(100|500|700)/);
    expect(cb.className).not.toMatch(/\btext-white\b/);
  });

  it("brand-aware classes: bg-action + text-button-fg em indeterminate", () => {
    render(<Checkbox indeterminate />);
    const cb = screen.getByRole("checkbox");
    expect(cb.className).toMatch(/data-\[state=indeterminate\]:bg-action/);
    expect(cb.className).toMatch(/data-\[state=indeterminate\]:border-action/);
    expect(cb.className).toMatch(/data-\[state=indeterminate\]:text-button-fg/);
  });

  it("brand-aware hover: border-action (sem guardia-violet hardcoded)", () => {
    render(<Checkbox />);
    const cb = screen.getByRole("checkbox");
    expect(cb.className).toMatch(/hover:border-action/);
    expect(cb.className).not.toMatch(/hover:border-guardia-violet-500/);
  });

  it("focus-visible:ring laranja com offset", () => {
    render(<Checkbox />);
    expect(screen.getByRole("checkbox").className).toMatch(
      /focus-visible:ring-2/,
    );
    expect(screen.getByRole("checkbox").className).toMatch(
      /focus-visible:ring-ring/,
    );
  });

  it("space alterna o checkbox (Radix native)", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Checkbox onCheckedChange={onChange} />);
    const cb = screen.getByRole("checkbox");
    cb.focus();
    await user.keyboard(" ");
    expect(onChange).toHaveBeenCalledWith(true);
  });

  it("respeita className customizado no checkbox", () => {
    render(<Checkbox className="my-extra" />);
    expect(screen.getByRole("checkbox")).toHaveClass("my-extra");
  });

  it("respeita wrapperClassName no <label>", () => {
    render(
      <Checkbox label="x" wrapperClassName="my-wrap" />,
    );
    const wrapper = screen.getByRole("checkbox").closest("label");
    expect(wrapper).toHaveClass("my-wrap");
  });

  describe("a11y", () => {
    it("has no WCAG 2.1 AA violations in light + dark (unchecked + label)", async () => {
      const { container } = render(
        <Checkbox label="Aceito os termos" />,
      );
      await axeInThemes(container);
    });

    it("has no WCAG 2.1 AA violations in light + dark (checked + label)", async () => {
      const { container } = render(
        <Checkbox checked label="Notificações por email" />,
      );
      await axeInThemes(container);
    });

    it("has no WCAG 2.1 AA violations in light + dark (indeterminate + label)", async () => {
      const { container } = render(
        <Checkbox indeterminate label="Selecionar todos" />,
      );
      await axeInThemes(container);
    });

    it("has no WCAG 2.1 AA violations in light + dark (label + description)", async () => {
      const { container } = render(
        <Checkbox
          label="Email diário"
          description="Receba um resumo das atividades"
        />,
      );
      await axeInThemes(container);
    });

    it("has no WCAG 2.1 AA violations in light + dark (invalid)", async () => {
      const { container } = render(
        <Checkbox invalid label="Campo obrigatório" />,
      );
      await axeInThemes(container);
    });

    it("has no WCAG 2.1 AA violations in light + dark (disabled)", async () => {
      const { container } = render(
        <Checkbox disabled label="Indisponível" />,
      );
      await axeInThemes(container);
    });
  });
});
