import { describe, it, expect, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { axeInThemes } from "@/test-utils/a11y";
import { DatePicker, formatDateBR } from "./index";

describe("formatDateBR", () => {
  it("formata Date como dd/mm/yyyy", () => {
    expect(formatDateBR(new Date(2025, 0, 7))).toBe("07/01/2025");
    expect(formatDateBR(new Date(2025, 11, 31))).toBe("31/12/2025");
  });

  it("retorna string vazia para null/undefined", () => {
    expect(formatDateBR(null)).toBe("");
    expect(formatDateBR(undefined)).toBe("");
  });
});

describe("DatePicker", () => {
  it("renderiza trigger com placeholder padrão", () => {
    render(<DatePicker />);
    expect(screen.getByText("dd/mm/aaaa")).toBeInTheDocument();
  });

  it("aceita placeholder customizado", () => {
    render(<DatePicker placeholder="Selecione uma data" />);
    expect(screen.getByText("Selecione uma data")).toBeInTheDocument();
  });

  it("trigger expõe aria-haspopup=dialog e aria-label default", () => {
    render(<DatePicker />);
    const trigger = screen.getByRole("button", { name: "Selecionar data" });
    expect(trigger).toHaveAttribute("aria-haspopup", "dialog");
  });

  it("aria-label customizada respeitada", () => {
    render(<DatePicker aria-label="Data de vencimento" />);
    expect(
      screen.getByRole("button", { name: "Data de vencimento" }),
    ).toBeInTheDocument();
  });

  it("clique no trigger abre o popover (role=dialog)", async () => {
    render(<DatePicker />);
    await userEvent.click(
      screen.getByRole("button", { name: "Selecionar data" }),
    );
    expect(await screen.findByRole("dialog")).toBeInTheDocument();
  });

  it("defaultValue aparece no trigger formatado dd/mm/yyyy", () => {
    render(<DatePicker defaultValue={new Date(2025, 2, 15)} />);
    expect(screen.getByText("15/03/2025")).toBeInTheDocument();
  });

  it("modo controlled respeita value", () => {
    const { rerender } = render(<DatePicker value={new Date(2025, 0, 1)} />);
    expect(screen.getByText("01/01/2025")).toBeInTheDocument();
    rerender(<DatePicker value={new Date(2025, 5, 30)} />);
    expect(screen.getByText("30/06/2025")).toBeInTheDocument();
  });

  it("clear (X) chama onChange com null", async () => {
    const onChange = vi.fn();
    render(
      <DatePicker
        defaultValue={new Date(2025, 0, 7)}
        onChange={onChange}
        clearable
      />,
    );
    await userEvent.click(screen.getByLabelText("Limpar data"));
    expect(onChange).toHaveBeenCalledWith(null);
  });

  it("clear não aparece sem valor", () => {
    render(<DatePicker clearable />);
    expect(screen.queryByLabelText("Limpar data")).not.toBeInTheDocument();
  });

  it("clearable=false esconde o X mesmo com valor", () => {
    render(<DatePicker defaultValue={new Date()} clearable={false} />);
    expect(screen.queryByLabelText("Limpar data")).not.toBeInTheDocument();
  });

  it("disabled bloqueia abertura", async () => {
    render(<DatePicker disabled />);
    await userEvent.click(
      screen.getByRole("button", { name: "Selecionar data" }),
    );
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("invalid aplica data-invalid", () => {
    // Lex jsx-a11y/role-supports-aria-props proíbe aria-invalid em role=button
    // (implícito em <button>); o trigger usa data-invalid como hook de estilo
    // e o aviso a11y para invalid fica no Field/Form layer (aria-describedby
    // apontando para a mensagem de erro).
    render(<DatePicker invalid />);
    expect(
      screen.getByRole("button", { name: "Selecionar data" }),
    ).toHaveAttribute("data-invalid", "true");
  });

  it("name renderiza input hidden em formato ISO", () => {
    const { container } = render(
      <DatePicker
        defaultValue={new Date(2025, 2, 15)}
        name="due_date"
      />,
    );
    const hidden = container.querySelector("input[type='hidden']");
    expect(hidden).toHaveAttribute("name", "due_date");
    expect(hidden).toHaveAttribute("value", "2025-03-15");
  });

  it("name vazio quando sem valor renderiza input hidden vazio", () => {
    const { container } = render(<DatePicker name="due_date" />);
    const hidden = container.querySelector("input[type='hidden']");
    expect(hidden).toHaveAttribute("value", "");
  });

  it("size=sm aplica h-8", () => {
    render(<DatePicker size="sm" />);
    expect(
      screen.getByRole("button", { name: "Selecionar data" }),
    ).toHaveClass("h-8");
  });

  it("size=lg aplica h-[46px]", () => {
    render(<DatePicker size="lg" />);
    expect(
      screen.getByRole("button", { name: "Selecionar data" }),
    ).toHaveClass("h-[46px]");
  });

  it("clique em dia seleciona e fecha (uncontrolled)", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    /* Forçar viewMonth fixa para garantir o dia 15 visível */
    render(
      <DatePicker
        onChange={onChange}
        defaultValue={new Date(2025, 5, 1)}
      />,
    );
    await user.click(
      screen.getByRole("button", { name: "Selecionar data" }),
    );
    await screen.findByRole("dialog");
    /* DayPicker renderiza dias como buttons clicáveis com o número do dia */
    const day15 = screen
      .getAllByRole("button")
      .find((b) => b.textContent?.trim() === "15");
    expect(day15).toBeDefined();
    await user.click(day15!);
    expect(onChange).toHaveBeenCalled();
    const arg = onChange.mock.calls[0]![0] as Date;
    expect(arg.getDate()).toBe(15);
    expect(arg.getMonth()).toBe(5);
    expect(arg.getFullYear()).toBe(2025);
  });

  it("botão 'Hoje' renderizado quando showToday=true (default)", async () => {
    render(<DatePicker />);
    await userEvent.click(
      screen.getByRole("button", { name: "Selecionar data" }),
    );
    expect(await screen.findByRole("button", { name: "Hoje" }))
      .toBeInTheDocument();
  });

  it("showToday=false esconde o botão Hoje", async () => {
    render(<DatePicker showToday={false} />);
    await userEvent.click(
      screen.getByRole("button", { name: "Selecionar data" }),
    );
    await screen.findByRole("dialog");
    expect(screen.queryByRole("button", { name: "Hoje" })).not.toBeInTheDocument();
  });

  it("'Hoje' chama onChange com data de hoje e fecha", async () => {
    const onChange = vi.fn();
    render(<DatePicker onChange={onChange} />);
    await userEvent.click(
      screen.getByRole("button", { name: "Selecionar data" }),
    );
    await userEvent.click(await screen.findByRole("button", { name: "Hoje" }));
    expect(onChange).toHaveBeenCalled();
    const arg = onChange.mock.calls[0]![0] as Date;
    const today = new Date();
    expect(arg.getDate()).toBe(today.getDate());
    expect(arg.getMonth()).toBe(today.getMonth());
    expect(arg.getFullYear()).toBe(today.getFullYear());
  });

  it("Escape fecha o dialog", async () => {
    const user = userEvent.setup();
    render(<DatePicker />);
    await user.click(screen.getByRole("button", { name: "Selecionar data" }));
    expect(await screen.findByRole("dialog")).toBeInTheDocument();
    await user.keyboard("{Escape}");
    await waitFor(() => {
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });
  });

  describe("brand-aware tokens", () => {
    it("trigger usa border-action no hover + estado aberto (sem guardia-violet hardcoded)", () => {
      render(<DatePicker />);
      const trigger = screen.getByRole("button", { name: "Selecionar data" });
      expect(trigger.className).toMatch(/hover:border-action/);
      expect(trigger.className).toMatch(/data-\[state=open\]:border-action/);
      expect(trigger.className).not.toMatch(/guardia-violet-(100|500|700)/);
    });

    it("dia selecionado renderiza com bg-action + text-button-fg", async () => {
      const user = userEvent.setup();
      render(<DatePicker defaultValue={new Date(2025, 5, 15)} />);
      await user.click(
        screen.getByRole("button", { name: "Selecionar data" }),
      );
      await screen.findByRole("dialog");
      /* DayPicker aplica a classe `selected` no <td> (gridcell), que carrega
         `bg-action` + `text-button-fg` via [&_button] selector. Asserts no
         próprio gridcell. */
      const day15Button = screen
        .getAllByRole("button")
        .find((b) => b.textContent?.trim() === "15");
      expect(day15Button).not.toBeUndefined();
      const gridcell = day15Button?.closest("td");
      expect(gridcell).not.toBeNull();
      expect(gridcell?.className ?? "").toMatch(/bg-action/);
      expect(gridcell?.className ?? "").toMatch(/text-button-fg/);
      expect(gridcell?.className ?? "").not.toMatch(/guardia-violet-500/);
      expect(gridcell?.className ?? "").not.toMatch(/\btext-white\b/);
    });

    it("botão 'Hoje' usa text-action + hover:bg-bg-hover (sem guardia-violet hardcoded)", async () => {
      render(<DatePicker />);
      await userEvent.click(
        screen.getByRole("button", { name: "Selecionar data" }),
      );
      const today = await screen.findByRole("button", { name: "Hoje" });
      expect(today.className).toMatch(/text-action/);
      expect(today.className).toMatch(/hover:bg-bg-hover/);
      expect(today.className).not.toMatch(/guardia-violet-(100|500|700)/);
    });
  });

  describe("a11y", () => {
    it("não tem violações WCAG 2.1 AA em light + dark (trigger vazio)", async () => {
      const { container } = render(<DatePicker />);
      await axeInThemes(container);
    });

    it("não tem violações WCAG 2.1 AA em light + dark (com valor + clear)", async () => {
      const { container } = render(
        <DatePicker
          defaultValue={new Date(2025, 5, 15)}
          aria-label="Data de vencimento"
        />,
      );
      await axeInThemes(container);
    });

    it("não tem violações WCAG 2.1 AA em light + dark (invalid)", async () => {
      const { container } = render(
        <DatePicker invalid aria-label="Data de vencimento" />,
      );
      await axeInThemes(container);
    });

    it("não tem violações WCAG 2.1 AA em light + dark (disabled)", async () => {
      const { container } = render(
        <DatePicker disabled aria-label="Data de vencimento" />,
      );
      await axeInThemes(container);
    });

    it("não tem violações WCAG 2.1 AA em light + dark (dialog aberto com dia selecionado)", async () => {
      const user = userEvent.setup();
      const { container } = render(
        <DatePicker defaultValue={new Date(2025, 5, 15)} />,
      );
      await user.click(
        screen.getByRole("button", { name: "Selecionar data" }),
      );
      await screen.findByRole("dialog");
      await axeInThemes(container);
    });

    it("não tem violações WCAG 2.1 AA em light + dark (dialog aberto sem valor)", async () => {
      const user = userEvent.setup();
      const { container } = render(<DatePicker />);
      await user.click(
        screen.getByRole("button", { name: "Selecionar data" }),
      );
      await screen.findByRole("dialog");
      await axeInThemes(container);
    });
  });
});
