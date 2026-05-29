import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { axeInThemes } from "@/test-utils/a11y";
import { Switch } from "./index";

describe("Switch", () => {
  it("AC-1: renderiza com role=switch", () => {
    render(<Switch />);
    expect(screen.getByRole("switch")).toBeInTheDocument();
  });

  it("AC-2: renderiza standalone (sem label) quando nenhum texto e passado", () => {
    const { container } = render(<Switch />);
    /* sem label, nao ha <label> wrapper */
    expect(container.querySelector("label")).toBeNull();
  });

  it("AC-3: renderiza wrapper <label> quando label e passada", () => {
    render(<Switch label="Notificacoes" />);
    expect(screen.getByText("Notificacoes")).toBeInTheDocument();
    expect(screen.getByRole("switch").closest("label")).not.toBeNull();
  });

  it("AC-3: clique no label alterna o switch via htmlFor", async () => {
    const onChange = vi.fn();
    render(<Switch label="Notificacoes" onCheckedChange={onChange} />);
    await userEvent.click(screen.getByText("Notificacoes"));
    expect(onChange).toHaveBeenCalledWith(true);
  });

  it("AC-4: description gera aria-describedby", () => {
    render(
      <Switch label="Notificacoes" description="Email diario as 18h" />,
    );
    const sw = screen.getByRole("switch");
    const descId = sw.getAttribute("aria-describedby");
    expect(descId).toBeTruthy();
    const desc = document.getElementById(descId!);
    expect(desc).toHaveTextContent("Email diario as 18h");
  });

  it("AC-4: sem description, sem aria-describedby", () => {
    render(<Switch label="Notificacoes" />);
    expect(screen.getByRole("switch")).not.toHaveAttribute("aria-describedby");
  });

  it("AC-5: size=sm aplica 30x18 (h-[18px] w-[30px])", () => {
    render(<Switch size="sm" />);
    const cls = screen.getByRole("switch").className;
    expect(cls).toMatch(/h-\[18px\]/);
    expect(cls).toMatch(/w-\[30px\]/);
  });

  it("AC-5: size=md (default) aplica 38x22 (h-[22px] w-[38px])", () => {
    render(<Switch />);
    const cls = screen.getByRole("switch").className;
    expect(cls).toMatch(/h-\[22px\]/);
    expect(cls).toMatch(/w-\[38px\]/);
  });

  it("AC-6: checked expoe data-state=checked", () => {
    render(<Switch checked />);
    expect(screen.getByRole("switch")).toHaveAttribute(
      "data-state",
      "checked",
    );
  });

  it("AC-6: unchecked expoe data-state=unchecked", () => {
    render(<Switch />);
    expect(screen.getByRole("switch")).toHaveAttribute(
      "data-state",
      "unchecked",
    );
  });

  it("AC-6: defaultChecked aciona estado checked inicial (uncontrolled)", () => {
    render(<Switch defaultChecked />);
    expect(screen.getByRole("switch")).toHaveAttribute(
      "data-state",
      "checked",
    );
  });

  it("AC-7: disabled bloqueia clique", async () => {
    const onChange = vi.fn();
    render(<Switch disabled label="x" onCheckedChange={onChange} />);
    await userEvent.click(screen.getByRole("switch"));
    expect(onChange).not.toHaveBeenCalled();
  });

  it("AC-7: disabled aplica opacity-55 no wrapper", () => {
    render(<Switch disabled label="x" />);
    const wrapper = screen.getByRole("switch").closest("label");
    expect(wrapper?.className).toMatch(/opacity-55/);
    expect(wrapper?.className).toMatch(/cursor-not-allowed/);
  });

  it("AC-8: invalid=true aplica aria-invalid", () => {
    render(<Switch invalid label="x" />);
    expect(screen.getByRole("switch")).toHaveAttribute(
      "aria-invalid",
      "true",
    );
  });

  it("AC-8: invalid aplica ring-destructive no root", () => {
    render(<Switch invalid label="x" />);
    expect(screen.getByRole("switch").className).toMatch(
      /aria-\[invalid=true\]:ring-destructive\/40/,
    );
  });

  it("AC-9: focus-visible aplica ring-ring com offset", () => {
    render(<Switch />);
    const cls = screen.getByRole("switch").className;
    expect(cls).toMatch(/focus-visible:ring-2/);
    expect(cls).toMatch(/focus-visible:ring-ring/);
    expect(cls).toMatch(/focus-visible:ring-offset-2/);
  });

  it("AC-10: zero cores hardcoded — apenas tokens brand-aware (bg-action, bg-muted, text-fg, ring-ring, ring-destructive)", () => {
    render(<Switch label="x" description="y" />);
    const sw = screen.getByRole("switch");
    /* tokens semanticos presentes */
    expect(sw.className).toMatch(/data-\[state=checked\]:bg-action/);
    expect(sw.className).toMatch(/data-\[state=unchecked\]:bg-muted/);
    expect(sw.className).toMatch(/focus-visible:ring-ring/);
    /* hex / cores arbitrarias / nomes brand-raw ausentes */
    expect(sw.className).not.toMatch(/guardia-purple-(100|200|500|700|900)/);
    expect(sw.className).not.toMatch(/guardia-orange-(100|200|500|700|900)/);
    expect(sw.className).not.toMatch(/bg-violet-/);
    expect(sw.className).not.toMatch(/bg-primary\b/);
    expect(sw.className).not.toMatch(/bg-brand-purple\b/);
    expect(sw.className).not.toMatch(/bg-input\b/);
    expect(sw.className).not.toMatch(/text-white\b/);
    expect(sw.className).not.toMatch(/#[0-9a-fA-F]{3,6}/);
  });

  it("AC-11: Space alterna o switch (Radix native)", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Switch onCheckedChange={onChange} />);
    const sw = screen.getByRole("switch");
    sw.focus();
    await user.keyboard(" ");
    expect(onChange).toHaveBeenCalledWith(true);
  });

  it("AC-11: Enter alterna o switch (Radix native)", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Switch onCheckedChange={onChange} />);
    const sw = screen.getByRole("switch");
    sw.focus();
    await user.keyboard("{Enter}");
    expect(onChange).toHaveBeenCalledWith(true);
  });

  it("AC-12: auto-gera id quando nao passado", () => {
    render(<Switch label="auto" />);
    const sw = screen.getByRole("switch");
    expect(sw.id).toBeTruthy();
    expect(sw.id.length).toBeGreaterThan(0);
  });

  it("AC-12: respeita id customizado", () => {
    render(<Switch id="my-sw" label="x" />);
    expect(screen.getByRole("switch")).toHaveAttribute("id", "my-sw");
  });

  it("AC-13: respeita className customizado no root", () => {
    render(<Switch className="my-extra" />);
    expect(screen.getByRole("switch")).toHaveClass("my-extra");
  });

  it("AC-13: respeita wrapperClassName no <label>", () => {
    render(<Switch label="x" wrapperClassName="my-wrap" />);
    const wrapper = screen.getByRole("switch").closest("label");
    expect(wrapper).toHaveClass("my-wrap");
  });

  it("AC-3: label + description renderizam ambos os textos", () => {
    render(
      <Switch
        label="Autopilot de conciliacao"
        description="Aprova matches com confianca > 95%"
      />,
    );
    expect(screen.getByText("Autopilot de conciliacao")).toBeInTheDocument();
    expect(
      screen.getByText("Aprova matches com confianca > 95%"),
    ).toBeInTheDocument();
  });

  it("AC-3: clique no description tambem alterna (via wrapper <label>)", async () => {
    const onChange = vi.fn();
    render(
      <Switch
        label="Autopilot"
        description="Aprova matches > 95%"
        onCheckedChange={onChange}
      />,
    );
    await userEvent.click(screen.getByText("Aprova matches > 95%"));
    expect(onChange).toHaveBeenCalledWith(true);
  });

  it("AC-6: alterna de checked -> unchecked quando clicado em estado on", async () => {
    const onChange = vi.fn();
    render(<Switch defaultChecked onCheckedChange={onChange} />);
    await userEvent.click(screen.getByRole("switch"));
    expect(onChange).toHaveBeenCalledWith(false);
  });

  describe("a11y", () => {
    it("AC-14: nao tem violacoes WCAG 2.1 AA em light + dark (default standalone)", async () => {
      const { container } = render(<Switch aria-label="Notificacoes" />);
      await axeInThemes(container);
    });

    it("AC-14: nao tem violacoes WCAG 2.1 AA em light + dark (com label)", async () => {
      const { container } = render(
        <Switch label="Receber notificacoes por e-mail" />,
      );
      await axeInThemes(container);
    });

    it("AC-14: nao tem violacoes WCAG 2.1 AA em light + dark (label + description)", async () => {
      const { container } = render(
        <Switch
          label="Autopilot de conciliacao"
          description="Aprova matches com confianca > 95%"
        />,
      );
      await axeInThemes(container);
    });

    it("AC-14: nao tem violacoes WCAG 2.1 AA em light + dark (checked + label)", async () => {
      const { container } = render(
        <Switch checked label="Resumo diario as 18h" />,
      );
      await axeInThemes(container);
    });

    it("AC-14: nao tem violacoes WCAG 2.1 AA em light + dark (invalid + label + description)", async () => {
      const { container } = render(
        <Switch
          invalid
          label="Aceitar termos"
          description="Voce precisa concordar para continuar"
        />,
      );
      await axeInThemes(container);
    });

    it("AC-14: nao tem violacoes WCAG 2.1 AA em light + dark (disabled + label)", async () => {
      const { container } = render(
        <Switch disabled label="Indisponivel neste plano" />,
      );
      await axeInThemes(container);
    });
  });
});
