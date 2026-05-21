import { describe, it, expect, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { Combobox, type ComboboxOption } from "./index";

const PLANOS: ComboboxOption[] = [
  { value: "starter", label: "Starter", meta: "Até 1k transações/mês" },
  { value: "pro", label: "Pro", meta: "Até 10k transações/mês" },
  { value: "enterprise", label: "Enterprise", meta: "Personalizado" },
  { value: "legacy", label: "Legacy", meta: "Descontinuado", disabled: true },
];

describe("Combobox", () => {
  it("renderiza com role=combobox e placeholder padrão", () => {
    render(<Combobox options={PLANOS} />);
    const trigger = screen.getByRole("combobox");
    expect(trigger).toBeInTheDocument();
    expect(trigger).toHaveTextContent("Selecione…");
  });

  it("aceita placeholder customizado", () => {
    render(<Combobox options={PLANOS} placeholder="Escolha um plano" />);
    expect(screen.getByRole("combobox")).toHaveTextContent("Escolha um plano");
  });

  it("trigger expõe aria-haspopup=listbox e aria-expanded=false fechado", () => {
    render(<Combobox options={PLANOS} />);
    const trigger = screen.getByRole("combobox");
    expect(trigger).toHaveAttribute("aria-haspopup", "listbox");
    expect(trigger).toHaveAttribute("aria-expanded", "false");
  });

  it("clique no trigger abre o popup", async () => {
    render(<Combobox options={PLANOS} />);
    await userEvent.click(screen.getByRole("combobox"));
    expect(screen.getByRole("combobox")).toHaveAttribute(
      "aria-expanded",
      "true",
    );
    expect(screen.getByRole("listbox")).toBeInTheDocument();
  });

  it("popup mostra todas as options inicialmente", async () => {
    render(<Combobox options={PLANOS} />);
    await userEvent.click(screen.getByRole("combobox"));
    expect(screen.getAllByRole("option")).toHaveLength(PLANOS.length);
  });

  it("digitar filtra a lista por label", async () => {
    render(<Combobox options={PLANOS} />);
    await userEvent.click(screen.getByRole("combobox"));
    const search = screen.getByPlaceholderText("Buscar…");
    await userEvent.type(search, "pro");
    const options = screen.getAllByRole("option");
    expect(options).toHaveLength(1);
    expect(options[0]).toHaveTextContent("Pro");
  });

  it("filtro também busca em meta (string)", async () => {
    render(<Combobox options={PLANOS} />);
    await userEvent.click(screen.getByRole("combobox"));
    const search = screen.getByPlaceholderText("Buscar…");
    await userEvent.type(search, "personalizado");
    expect(screen.getAllByRole("option")).toHaveLength(1);
    expect(screen.getByRole("option")).toHaveTextContent("Enterprise");
  });

  it("empty state quando filtro não acha nada", async () => {
    render(<Combobox options={PLANOS} emptyText="Nada encontrado" />);
    await userEvent.click(screen.getByRole("combobox"));
    const search = screen.getByPlaceholderText("Buscar…");
    await userEvent.type(search, "xyzqwerty");
    expect(screen.getByText("Nada encontrado")).toBeInTheDocument();
  });

  it("clique em option seleciona e fecha (uncontrolled)", async () => {
    const onChange = vi.fn();
    render(<Combobox options={PLANOS} onChange={onChange} />);
    await userEvent.click(screen.getByRole("combobox"));
    await userEvent.click(screen.getByText("Pro"));
    expect(onChange).toHaveBeenCalledWith("pro", PLANOS[1]);
    await waitFor(() => {
      expect(screen.getByRole("combobox")).toHaveAttribute(
        "aria-expanded",
        "false",
      );
    });
  });

  it("trigger reflete a label do option selecionado", async () => {
    render(<Combobox options={PLANOS} defaultValue="pro" />);
    expect(screen.getByRole("combobox")).toHaveTextContent("Pro");
  });

  it("modo controlled respeita value externo", async () => {
    const onChange = vi.fn();
    const { rerender } = render(
      <Combobox options={PLANOS} value="starter" onChange={onChange} />,
    );
    expect(screen.getByRole("combobox")).toHaveTextContent("Starter");
    rerender(<Combobox options={PLANOS} value="pro" onChange={onChange} />);
    expect(screen.getByRole("combobox")).toHaveTextContent("Pro");
  });

  it("option disabled não pode ser selecionada", async () => {
    const onChange = vi.fn();
    render(<Combobox options={PLANOS} onChange={onChange} />);
    await userEvent.click(screen.getByRole("combobox"));
    const legacy = screen.getByText("Legacy").closest("button")!;
    expect(legacy).toBeDisabled();
  });

  it("ArrowDown / ArrowUp navega entre opções", async () => {
    const user = userEvent.setup();
    render(<Combobox options={PLANOS} />);
    await user.click(screen.getByRole("combobox"));
    const search = screen.getByPlaceholderText("Buscar…");
    await user.click(search);
    await user.keyboard("{ArrowDown}");
    /* o aria-activedescendant deve apontar para o option de index 1 */
    await waitFor(() => {
      const id = search.getAttribute("aria-activedescendant");
      expect(id).toMatch(/-opt-1$/);
    });
  });

  it("Enter no search seleciona o option ativo", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Combobox options={PLANOS} onChange={onChange} />);
    await user.click(screen.getByRole("combobox"));
    /* O search é auto-focado, mas vamos garantir que o evento dispare nele */
    const search = screen.getByPlaceholderText("Buscar…");
    await waitFor(() => expect(search).toHaveFocus());
    /* index 0 = Starter por default */
    await user.keyboard("{Enter}");
    expect(onChange).toHaveBeenCalledWith("starter", PLANOS[0]);
  });

  it("invalid=true aplica aria-invalid", () => {
    render(<Combobox options={PLANOS} invalid />);
    expect(screen.getByRole("combobox")).toHaveAttribute(
      "aria-invalid",
      "true",
    );
  });

  it("disabled bloqueia abertura", async () => {
    render(<Combobox options={PLANOS} disabled />);
    await userEvent.click(screen.getByRole("combobox"));
    expect(screen.getByRole("combobox")).toHaveAttribute(
      "aria-expanded",
      "false",
    );
  });

  it("clearable mostra X e limpa quando clicado", async () => {
    const onChange = vi.fn();
    render(
      <Combobox
        options={PLANOS}
        defaultValue="pro"
        clearable
        onChange={onChange}
      />,
    );
    const clearBtn = screen.getByLabelText("Limpar seleção");
    await userEvent.click(clearBtn);
    expect(onChange).toHaveBeenLastCalledWith("", undefined);
  });

  it("clearable não aparece sem valor", () => {
    render(<Combobox options={PLANOS} clearable />);
    expect(screen.queryByLabelText("Limpar seleção")).not.toBeInTheDocument();
  });

  it("name renderiza input hidden para form submission", () => {
    const { container } = render(
      <Combobox options={PLANOS} defaultValue="pro" name="plano" />,
    );
    const hidden = container.querySelector(
      "input[type='hidden'][name='plano']",
    );
    expect(hidden).toHaveAttribute("value", "pro");
  });

  it("size=sm aplica h-8", () => {
    render(<Combobox options={PLANOS} size="sm" />);
    expect(screen.getByRole("combobox")).toHaveClass("h-8");
  });

  it("size=lg aplica h-[46px]", () => {
    render(<Combobox options={PLANOS} size="lg" />);
    expect(screen.getByRole("combobox")).toHaveClass("h-[46px]");
  });

  it("aria-controls aponta para o listbox", async () => {
    render(<Combobox options={PLANOS} />);
    const trigger = screen.getByRole("combobox");
    const listId = trigger.getAttribute("aria-controls");
    expect(listId).toBeTruthy();
    await userEvent.click(trigger);
    expect(screen.getByRole("listbox")).toHaveAttribute("id", listId!);
  });

  it("option selecionada expõe aria-selected=true", async () => {
    render(<Combobox options={PLANOS} defaultValue="pro" />);
    await userEvent.click(screen.getByRole("combobox"));
    /* "Pro" aparece também no trigger, então filtramos pelo role=option */
    const proOpt = screen
      .getAllByText("Pro")
      .map((el) => el.closest("[role=option]"))
      .find((el): el is Element => el != null);
    expect(proOpt).toHaveAttribute("aria-selected", "true");
  });

  it("Escape fecha o popup (Radix)", async () => {
    const user = userEvent.setup();
    render(<Combobox options={PLANOS} />);
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
});
