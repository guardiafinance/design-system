import { describe, it, expect, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { Select, type SelectOption } from "./index";

const PLANOS: SelectOption[] = [
  { value: "starter", label: "Starter" },
  { value: "pro", label: "Pro" },
  { value: "business", label: "Business" },
  { value: "enterprise", label: "Enterprise" },
  { value: "legacy", label: "Legacy", disabled: true },
];

describe("Select", () => {
  it("renderiza trigger com placeholder padrão", () => {
    render(<Select options={PLANOS} />);
    expect(screen.getByRole("combobox")).toHaveTextContent("Selecione…");
  });

  it("placeholder customizado é respeitado", () => {
    render(<Select options={PLANOS} placeholder="Escolha um plano" />);
    expect(screen.getByRole("combobox")).toHaveTextContent("Escolha um plano");
  });

  it("trigger expõe role=combobox + aria-haspopup=listbox", () => {
    render(<Select options={PLANOS} />);
    const trigger = screen.getByRole("combobox");
    expect(trigger).toHaveAttribute("aria-haspopup", "listbox");
    expect(trigger).toHaveAttribute("aria-expanded", "false");
  });

  it("clique no trigger abre o listbox", async () => {
    render(<Select options={PLANOS} />);
    await userEvent.click(screen.getByRole("combobox"));
    expect(screen.getByRole("combobox")).toHaveAttribute(
      "aria-expanded",
      "true",
    );
    expect(screen.getByRole("listbox")).toBeInTheDocument();
  });

  it("listbox renderiza todos os options", async () => {
    render(<Select options={PLANOS} />);
    await userEvent.click(screen.getByRole("combobox"));
    expect(screen.getAllByRole("option")).toHaveLength(PLANOS.length);
  });

  it("clique em option seleciona e fecha (uncontrolled)", async () => {
    const onChange = vi.fn();
    render(<Select options={PLANOS} onChange={onChange} />);
    await userEvent.click(screen.getByRole("combobox"));
    await userEvent.click(screen.getByText("Pro"));
    expect(onChange).toHaveBeenCalledWith("pro", PLANOS[1]);
    await waitFor(() => {
      expect(screen.getByRole("combobox")).toHaveAttribute(
        "aria-expanded",
        "false",
      );
    });
    /* trigger reflete a label do selecionado */
    expect(screen.getByRole("combobox")).toHaveTextContent("Pro");
  });

  it("defaultValue exibe label do option correspondente no trigger", () => {
    render(<Select options={PLANOS} defaultValue="business" />);
    expect(screen.getByRole("combobox")).toHaveTextContent("Business");
  });

  it("modo controlled respeita value externo", () => {
    const { rerender } = render(<Select options={PLANOS} value="starter" />);
    expect(screen.getByRole("combobox")).toHaveTextContent("Starter");
    rerender(<Select options={PLANOS} value="enterprise" />);
    expect(screen.getByRole("combobox")).toHaveTextContent("Enterprise");
  });

  it("option disabled não pode ser selecionada", async () => {
    const onChange = vi.fn();
    render(<Select options={PLANOS} onChange={onChange} />);
    await userEvent.click(screen.getByRole("combobox"));
    const legacy = screen.getByText("Legacy").closest("button")!;
    expect(legacy).toBeDisabled();
    await userEvent.click(legacy);
    expect(onChange).not.toHaveBeenCalled();
  });

  it("ArrowDown navega entre opções (atualiza aria-activedescendant)", async () => {
    const user = userEvent.setup();
    render(<Select options={PLANOS} />);
    const trigger = screen.getByRole("combobox");
    await user.click(trigger);
    /* O listbox abre com activeIndex = índice do selecionado (default 0) */
    const listbox = await screen.findByRole("listbox");
    listbox.focus();
    await user.keyboard("{ArrowDown}");
    await waitFor(() => {
      const id = trigger.getAttribute("aria-activedescendant");
      expect(id).toMatch(/-opt-1$/);
    });
  });

  it("Enter no listbox seleciona o option ativo", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Select options={PLANOS} onChange={onChange} />);
    await user.click(screen.getByRole("combobox"));
    const listbox = await screen.findByRole("listbox");
    listbox.focus();
    /* activeIndex inicial = 0 (Starter) */
    await user.keyboard("{Enter}");
    expect(onChange).toHaveBeenCalledWith("starter", PLANOS[0]);
  });

  it("invalid aplica aria-invalid", () => {
    render(<Select options={PLANOS} invalid />);
    expect(screen.getByRole("combobox")).toHaveAttribute(
      "aria-invalid",
      "true",
    );
  });

  it("disabled bloqueia abertura", async () => {
    render(<Select options={PLANOS} disabled />);
    await userEvent.click(screen.getByRole("combobox"));
    expect(screen.getByRole("combobox")).toHaveAttribute(
      "aria-expanded",
      "false",
    );
  });

  it("size=sm aplica h-8", () => {
    render(<Select options={PLANOS} size="sm" />);
    expect(screen.getByRole("combobox")).toHaveClass("h-8");
  });

  it("size=lg aplica h-[46px]", () => {
    render(<Select options={PLANOS} size="lg" />);
    expect(screen.getByRole("combobox")).toHaveClass("h-[46px]");
  });

  it("name renderiza input hidden para form submission", () => {
    const { container } = render(
      <Select options={PLANOS} defaultValue="pro" name="plano" />,
    );
    const hidden = container.querySelector("input[type='hidden']");
    expect(hidden).toHaveAttribute("name", "plano");
    expect(hidden).toHaveAttribute("value", "pro");
  });

  it("required no Select aplica required no input hidden", () => {
    const { container } = render(
      <Select options={PLANOS} name="plano" required />,
    );
    /* hidden input não satisfaz toBeRequired() do jest-dom (hidden ignora
     * required); checamos o atributo diretamente */
    expect(
      container.querySelector("input[type='hidden']"),
    ).toHaveAttribute("required");
  });

  it("leftIcon renderiza no trigger", () => {
    render(
      <Select options={PLANOS} leftIcon={<svg data-testid="li" />} />,
    );
    expect(screen.getByTestId("li")).toBeInTheDocument();
  });

  it("aria-controls aponta para o listbox", async () => {
    render(<Select options={PLANOS} />);
    const trigger = screen.getByRole("combobox");
    const listId = trigger.getAttribute("aria-controls");
    expect(listId).toBeTruthy();
    await userEvent.click(trigger);
    expect(screen.getByRole("listbox")).toHaveAttribute("id", listId!);
  });

  it("option selecionada expõe aria-selected=true", async () => {
    render(<Select options={PLANOS} defaultValue="pro" />);
    await userEvent.click(screen.getByRole("combobox"));
    const proOpt = screen
      .getAllByText("Pro")
      .map((el) => el.closest("[role=option]"))
      .find((el): el is Element => el != null);
    expect(proOpt).toHaveAttribute("aria-selected", "true");
  });

  it("Escape fecha o listbox (Radix)", async () => {
    const user = userEvent.setup();
    render(<Select options={PLANOS} />);
    await user.click(screen.getByRole("combobox"));
    expect(screen.getByRole("combobox")).toHaveAttribute(
      "aria-expanded",
      "true",
    );
    await user.keyboard("{Escape}");
    await waitFor(() => {
      expect(screen.getByRole("combobox")).toHaveAttribute(
        "aria-expanded",
        "false",
      );
    });
  });

  it("activeIndex inicia no selecionado quando o popover abre", async () => {
    const user = userEvent.setup();
    render(<Select options={PLANOS} defaultValue="business" />);
    const trigger = screen.getByRole("combobox");
    await user.click(trigger);
    /* business está no índice 2 */
    await waitFor(() => {
      const id = trigger.getAttribute("aria-activedescendant");
      expect(id).toMatch(/-opt-2$/);
    });
  });

  it("ArrowDown pula option disabled", async () => {
    /* Coloca um disabled no meio: posições 0=A 1=B(disabled) 2=C */
    const opts: SelectOption[] = [
      { value: "a", label: "A" },
      { value: "b", label: "B", disabled: true },
      { value: "c", label: "C" },
    ];
    const user = userEvent.setup();
    render(<Select options={opts} />);
    const trigger = screen.getByRole("combobox");
    await user.click(trigger);
    const listbox = await screen.findByRole("listbox");
    listbox.focus();
    /* activeIndex = 0 (A); ArrowDown deve pular para 2 (C), não 1 */
    await user.keyboard("{ArrowDown}");
    await waitFor(() => {
      const id = trigger.getAttribute("aria-activedescendant");
      expect(id).toMatch(/-opt-2$/);
    });
  });
});
